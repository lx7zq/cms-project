import { prisma } from '../../lib/prisma';
import { generateSlug } from '../../lib/slug';

export class CategoryError extends Error {
  constructor(
    message: string,
    public status: number = 400,
  ) {
    super(message);
  }
}

const categoryInclude = {
  parent: true,
  children: true,
  _count: { select: { contentCategories: true } },
} as const;

function serialize(category: any) {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    contentType: category.contentType,
    isActive: category.isActive,
    sortOrder: category.sortOrder,
    parent: category.parent
      ? { id: category.parent.id, name: category.parent.name }
      : null,
    children:
      category.children?.map((c: any) => ({ id: c.id, name: c.name })) ?? [],
    contentCount: category._count?.contentCategories ?? 0,
    createdAt: category.createdAt,
  };
}

async function ensureUniqueSlug(name: string, excludeId?: string) {
  const base = generateSlug(name, "category");
  let candidate = base;
  let counter = 1;

  while (true) {
    const existing = await prisma.category.findFirst({
      where: {
        slug: candidate,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
      select: { id: true },
    });
    if (!existing) return candidate;
    candidate = `${base}-${counter}`;
    counter += 1;
  }
}

export const categoryService = {
  async list(params: {
    contentType?: "LANDING_PAGE" | "BLOG_POST";
    includeInactive?: boolean;
  }) {
    const where: any = {};
    if (params.contentType) where.contentType = params.contentType;
    if (!params.includeInactive) where.isActive = true;

    const categories = await prisma.category.findMany({
      where,
      include: categoryInclude,
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });

    return categories.map(serialize);
  },

  async getById(id: string) {
    const category = await prisma.category.findUnique({
      where: { id },
      include: categoryInclude,
    });
    if (!category) throw new CategoryError("ไม่พบหมวดหมู่นี้", 404);
    return serialize(category);
  },

  async create(input: {
    name: string;
    contentType: "LANDING_PAGE" | "BLOG_POST";
    parentId?: string;
    sortOrder?: number;
  }) {
    const name = input.name.trim();
    if (!name) throw new CategoryError("ชื่อหมวดหมู่ห้ามว่าง", 400);

    if (input.parentId) {
      const parent = await prisma.category.findUnique({
        where: { id: input.parentId },
      });
      if (!parent) throw new CategoryError("ไม่พบหมวดหมู่แม่ที่ระบุ", 404);
      if (parent.contentType !== input.contentType) {
        throw new CategoryError(
          "หมวดหมู่แม่และหมวดหมู่ลูกต้องเป็น content type เดียวกัน",
          400,
        );
      }
    }

    const slug = await ensureUniqueSlug(name);

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        contentType: input.contentType,
        parentId: input.parentId,
        sortOrder: input.sortOrder ?? 0,
      },
      include: categoryInclude,
    });

    return serialize(category);
  },

  async update(
    id: string,
    input: {
      name?: string;
      parentId?: string | null;
      sortOrder?: number;
      isActive?: boolean;
    },
  ) {
    const category = await this.assertExists(id);

    if (input.parentId) {
      if (input.parentId === id) {
        throw new CategoryError("หมวดหมู่ไม่สามารถเป็นแม่ของตัวเองได้", 400);
      }
      const parent = await prisma.category.findUnique({
        where: { id: input.parentId },
      });
      if (!parent) throw new CategoryError("ไม่พบหมวดหมู่แม่ที่ระบุ", 404);
      if (parent.contentType !== category.contentType) {
        throw new CategoryError(
          "หมวดหมู่แม่และหมวดหมู่ลูกต้องเป็น content type เดียวกัน",
          400,
        );
      }
    }

    const name = input.name?.trim();
    const slug = name ? await ensureUniqueSlug(name, id) : undefined;

    const updated = await prisma.category.update({
      where: { id },
      data: {
        name,
        slug,
        parentId: input.parentId === undefined ? undefined : input.parentId,
        sortOrder: input.sortOrder,
        isActive: input.isActive,
      },
      include: categoryInclude,
    });

    return serialize(updated);
  },

  async delete(id: string) {
    await this.assertExists(id);

    const childCount = await prisma.category.count({ where: { parentId: id } });
    if (childCount > 0) {
      throw new CategoryError(
        `ไม่สามารถลบได้ เนื่องจากมีหมวดหมู่ย่อย ${childCount} รายการอยู่ภายใต้หมวดหมู่นี้`,
        409,
      );
    }

    const contentCount = await prisma.contentCategory.count({
      where: { categoryId: id },
    });
    if (contentCount > 0) {
      throw new CategoryError(
        `ไม่สามารถลบได้ เนื่องจากมีเนื้อหา ${contentCount} รายการใช้หมวดหมู่นี้อยู่`,
        409,
      );
    }

    await prisma.category.delete({ where: { id } });
  },

  async assertExists(id: string) {
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) throw new CategoryError("ไม่พบหมวดหมู่นี้", 404);
    return category;
  },
};
