import { describe, expect, it, mock, beforeEach } from 'bun:test'

// Complete mock page with all required relations
function createMockPage(overrides: Record<string, any> = {}): any {
  return {
    id: '1',
    title: 'Test Page',
    slug: 'test-page',
    shortDescription: 'Short desc',
    description: 'Description',
    banner: null,
    thumbnail: null,
    coverImage: null,
    content: '<p>Content</p>',
    status: 'DRAFT',
    isPublic: false,
    publishDate: null,
    expireDate: null,
    privateAccessType: null,
    pagePassword: null,
    privateLinkToken: null,
    viewCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    createdBy: { id: 'user1', name: 'Admin', email: 'admin@test.com' },
    updatedBy: { id: 'user1', name: 'Admin', email: 'admin@test.com' },
    seo: null,
    categories: [],
    tags: [],
    _count: { pageViews: 0, versions: 1 },
    ...overrides,
  }
}

// Mock prisma
const mockPrisma = {
  landingPage: {
    findMany: mock(() => Promise.resolve([])),
    findUnique: mock(() => Promise.resolve(null)),
    findFirst: mock(() => Promise.resolve(null)),
    count: mock(() => Promise.resolve(0)),
    create: mock(() => Promise.resolve(createMockPage())),
    update: mock(() => Promise.resolve(createMockPage())),
  },
  contentVersion: {
    create: mock(() => Promise.resolve({})),
  },
  contentCategory: {
    deleteMany: mock(() => Promise.resolve({})),
    createMany: mock(() => Promise.resolve({})),
  },
  contentTag: {
    deleteMany: mock(() => Promise.resolve({})),
    createMany: mock(() => Promise.resolve({})),
  },
  $transaction: mock((fn: any) => fn(mockPrisma)),
}

mock.module('../../lib/prisma', () => ({
  prisma: mockPrisma,
}))

mock.module('../../lib/slug', () => ({
  generateSlug: mock((title: string) => title.toLowerCase().replace(/\s+/g, '-')),
}))

import { landingPageService } from './landing-page.service'

describe('LandingPageService', () => {
  beforeEach(() => {
    // Reset all mocks
    Object.values(mockPrisma.landingPage).forEach(fn => fn.mockReset())
    mockPrisma.contentVersion.create.mockReset()
    mockPrisma.contentCategory.deleteMany.mockReset()
    mockPrisma.contentCategory.createMany.mockReset()
    mockPrisma.contentTag.deleteMany.mockReset()
    mockPrisma.contentTag.createMany.mockReset()
    mockPrisma.$transaction.mockReset()

    // Default mock implementations
    mockPrisma.landingPage.findMany.mockResolvedValue([createMockPage()])
    mockPrisma.landingPage.count.mockResolvedValue(1)
    mockPrisma.landingPage.findUnique.mockResolvedValue(createMockPage())
    mockPrisma.landingPage.findFirst.mockResolvedValue(createMockPage())
    mockPrisma.landingPage.create.mockResolvedValue(createMockPage())
    mockPrisma.landingPage.update.mockResolvedValue(createMockPage())
  })

  describe('list', () => {
    it('should return paginated results', async () => {
      const result = await landingPageService.list({ page: 1, pageSize: 10 })

      expect(result).toHaveProperty('data')
      expect(result).toHaveProperty('pagination')
      expect(result.pagination).toHaveProperty('total', 1)
      expect(result.pagination).toHaveProperty('page', 1)
      expect(result.pagination).toHaveProperty('pageSize', 10)
      expect(Array.isArray(result.data)).toBe(true)
    })

    it('should handle search parameter', async () => {
      await landingPageService.list({ search: 'test' })

      expect(mockPrisma.landingPage.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({ title: expect.objectContaining({ contains: 'test' }) }),
            ]),
          }),
        })
      )
    })

    it('should filter by status', async () => {
      await landingPageService.list({ status: 'PUBLIC' })

      expect(mockPrisma.landingPage.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'PUBLIC',
          }),
        })
      )
    })
  })

  describe('getById', () => {
    it('should return landing page by id', async () => {
      const result = await landingPageService.getById('1')

      expect(result).toHaveProperty('id', '1')
      expect(result).toHaveProperty('title', 'Test Page')
    })

    it('should throw error if not found', async () => {
      mockPrisma.landingPage.findFirst.mockResolvedValue(null)

      await expect(landingPageService.getById('nonexistent')).rejects.toThrow('ไม่พบ Landing Page นี้')
    })
  })

  describe('create', () => {
    it('should create a new landing page', async () => {
      mockPrisma.landingPage.findFirst.mockResolvedValue(null) // No existing slug
      mockPrisma.landingPage.create.mockResolvedValue(createMockPage())

      const result = await landingPageService.create({
        title: 'New Page',
        content: '<p>New content</p>',
        userId: 'user1',
      })

      expect(result).toHaveProperty('title')
      expect(mockPrisma.landingPage.create).toHaveBeenCalled()
    })
  })

  describe('delete', () => {
    it('should soft delete a landing page', async () => {
      mockPrisma.landingPage.update.mockResolvedValue({} as any)

      const result = await landingPageService.delete('1', 'user1')

      expect(result).toHaveProperty('message', 'ลบ Landing Page สำเร็จ')
      expect(mockPrisma.landingPage.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            deletedAt: expect.any(Date),
          }),
        })
      )
    })

    it('should throw error if page not found', async () => {
      mockPrisma.landingPage.findFirst.mockResolvedValue(null)

      await expect(landingPageService.delete('nonexistent', 'user1')).rejects.toThrow()
    })
  })

  describe('restore', () => {
    it('should restore a soft-deleted page', async () => {
      const deletedPage = createMockPage({ deletedAt: new Date() })
      mockPrisma.landingPage.findUnique.mockResolvedValue(deletedPage)
      mockPrisma.landingPage.update.mockResolvedValue(createMockPage())

      const result = await landingPageService.restore('1', 'user1')

      expect(result).toHaveProperty('id', '1')
    })

    it('should throw error if page not found or not deleted', async () => {
      mockPrisma.landingPage.findUnique.mockResolvedValue(null)

      await expect(landingPageService.restore('nonexistent', 'user1')).rejects.toThrow()
    })
  })
})
