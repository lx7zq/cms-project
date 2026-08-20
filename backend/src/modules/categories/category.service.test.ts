import { describe, expect, it, mock, beforeEach } from 'bun:test'

// Complete mock category with all required relations
function createMockCategory(overrides: Record<string, any> = {}): any {
  return {
    id: '1',
    name: 'Test Category',
    slug: 'test-category',
    contentType: 'LANDING_PAGE',
    isActive: true,
    sortOrder: 0,
    parentId: null,
    parent: null,
    children: [],
    _count: { contentCategories: 0 },
    createdAt: new Date(),
    ...overrides,
  }
}

// Mock prisma
const mockPrisma = {
  category: {
    findMany: mock(() => Promise.resolve([])),
    findUnique: mock(() => Promise.resolve(null)),
    findFirst: mock(() => Promise.resolve(null)),
    count: mock(() => Promise.resolve(0)),
    create: mock(() => Promise.resolve(createMockCategory())),
    update: mock(() => Promise.resolve(createMockCategory())),
    delete: mock(() => Promise.resolve({})),
  },
  contentCategory: {
    count: mock(() => Promise.resolve(0)),
  },
}

mock.module('../../lib/prisma', () => ({
  prisma: mockPrisma,
}))

mock.module('../../lib/slug', () => ({
  generateSlug: mock((name: string) => name.toLowerCase().replace(/\s+/g, '-')),
}))

import { categoryService } from './category.service'

describe('CategoryService', () => {
  beforeEach(() => {
    // Reset all mocks
    Object.values(mockPrisma.category).forEach(fn => fn.mockReset())
    mockPrisma.contentCategory.count.mockReset()

    // Default mock implementations
    mockPrisma.category.findMany.mockResolvedValue([createMockCategory()])
    mockPrisma.category.findUnique.mockResolvedValue(createMockCategory())
    mockPrisma.category.findFirst.mockResolvedValue(null)
    mockPrisma.category.create.mockResolvedValue(createMockCategory())
    mockPrisma.category.update.mockResolvedValue(createMockCategory())
    mockPrisma.category.delete.mockResolvedValue({})
  })

  describe('list', () => {
    it('should return all categories', async () => {
      const result = await categoryService.list({})

      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBe(1)
      expect(mockPrisma.category.findMany).toHaveBeenCalled()
    })

    it('should filter by content type', async () => {
      await categoryService.list({ contentType: 'LANDING_PAGE' })

      expect(mockPrisma.category.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            contentType: 'LANDING_PAGE',
          }),
        })
      )
    })

    it('should include inactive when specified', async () => {
      await categoryService.list({ includeInactive: true })

      expect(mockPrisma.category.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.not.objectContaining({
            isActive: true,
          }),
        })
      )
    })
  })

  describe('create', () => {
    it('should create a new category', async () => {
      mockPrisma.category.findFirst.mockResolvedValue(null) // No existing slug

      const result = await categoryService.create({
        name: 'New Category',
        contentType: 'LANDING_PAGE',
      })

      expect(result).toHaveProperty('name', 'Test Category')
      expect(mockPrisma.category.create).toHaveBeenCalled()
    })

    it('should throw error if name is empty', async () => {
      await expect(
        categoryService.create({ name: '', contentType: 'LANDING_PAGE' })
      ).rejects.toThrow('ชื่อหมวดหมู่ห้ามว่าง')
    })

    it('should throw error if parent not found', async () => {
      mockPrisma.category.findUnique.mockResolvedValue(null)

      await expect(
        categoryService.create({
          name: 'Child',
          contentType: 'LANDING_PAGE',
          parentId: 'nonexistent',
        })
      ).rejects.toThrow('ไม่พบหมวดหมู่แม่ที่ระบุ')
    })
  })

  describe('update', () => {
    it('should update an existing category', async () => {
      mockPrisma.category.findFirst.mockResolvedValue(null) // No slug conflict

      const result = await categoryService.update('1', { name: 'Updated Category' })

      expect(result).toHaveProperty('name', 'Test Category')
      expect(mockPrisma.category.update).toHaveBeenCalled()
    })

    it('should throw error if category not found', async () => {
      mockPrisma.category.findUnique.mockResolvedValue(null)

      await expect(
        categoryService.update('nonexistent', { name: 'Test' })
      ).rejects.toThrow('ไม่พบหมวดหมู่นี้')
    })
  })

  describe('delete', () => {
    it('should delete a category', async () => {
      mockPrisma.category.count.mockResolvedValue(0) // No children
      mockPrisma.contentCategory.count.mockResolvedValue(0) // No content

      await categoryService.delete('1')

      expect(mockPrisma.category.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      })
    })

    it('should throw error if category has children', async () => {
      mockPrisma.category.count.mockResolvedValue(2) // Has children

      await expect(categoryService.delete('1')).rejects.toThrow('ไม่สามารถลบได้')
    })

    it('should throw error if category has content', async () => {
      mockPrisma.category.count.mockResolvedValue(0)
      mockPrisma.contentCategory.count.mockResolvedValue(5) // Has content

      await expect(categoryService.delete('1')).rejects.toThrow('ไม่สามารถลบได้')
    })
  })
})
