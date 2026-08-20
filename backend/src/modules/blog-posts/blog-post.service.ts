import { prisma } from "../../lib/prisma";
import { generateSlug } from "../../lib/slug";

export class BlogPostError extends Error {
  constructor(
    message: string,
    public status: number = 400,
  ) {
    super(message);
  }
}

function pickField<T extends Record<string, any>>(
  obj: T,
  keys: string[],
): Record<string, any> {
  const result: Record<string, any> = {};
  for (const key of keys) {
    if (key in obj && obj[key] !== undefined) {
      result[key] = obj[key];
    }
  }
  return result;
}

const BLOG_POST_UPDATABLE = [
  "title",
  "slug",
  "excerpt",
  "description",
  "thumbnail",
  "coverImage",
  "banner",
  "content",
  "status",
  "isPublic",
  "publishDate",
  "expireDate",
  "readingTime",
  "isFeatured",
  "isPinned",
  "viewCount",
];

export const blogPostService = {
  async list(params: {
    search?: string;
    status?: string;
    page?: number;
    pageSize?: number;
  }) {
    const { search, status, page = 1, pageSize = 20 } = params;
    const where: any = { deletedAt: null };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
      ];
    }
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        include: {
          createdBy: { select: { id: true, name: true, email: true } },
          updatedBy: { select: { id: true, name: true } },
          seo: true,
          categories: { include: { category: true } },
          tags: { include: { tag: true } },
        },
        orderBy: { updatedAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.blogPost.count({ where }),
    ]);

    return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  },

  async getById(id: string) {
    const post = await prisma.blogPost.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        updatedBy: { select: { id: true, name: true } },
        seo: true,
        categories: { include: { category: true } },
        tags: { include: { tag: true } },
      },
    });
    if (!post || post.deletedAt) throw new BlogPostError("ไม่พบ Blog Post", 404);
    return post;
  },

  async create(data: {
    title: string;
    content: string;
    excerpt?: string;
    description?: string;
    thumbnail?: string;
    coverImage?: string;
    banner?: string;
    status?: string;
    isPublic?: boolean;
    publishDate?: string;
    expireDate?: string;
    readingTime?: number;
    isFeatured?: boolean;
    isPinned?: boolean;
    seo?: any;
    categoryIds?: string[];
    tagIds?: string[];
    userId: string;
  }) {
    const slug = generateSlug(data.title);

    // Check slug uniqueness
    const existing = await prisma.blogPost.findUnique({ where: { slug } });
    if (existing) throw new BlogPostError("Title นี้สร้าง slug ซ้ำกับที่มีอยู่แล้ว", 409);

    return prisma.blogPost.create({
      data: {
        title: data.title,
        slug,
        content: data.content,
        excerpt: data.excerpt,
        description: data.description,
        thumbnail: data.thumbnail,
        coverImage: data.coverImage,
        banner: data.banner,
        status: (data.status as any) || "DRAFT",
        isPublic: data.isPublic ?? false,
        publishDate: data.publishDate ? new Date(data.publishDate) : null,
        expireDate: data.expireDate ? new Date(data.expireDate) : null,
        readingTime: data.readingTime,
        isFeatured: data.isFeatured ?? false,
        isPinned: data.isPinned ?? false,
        createdById: data.userId,
        updatedById: data.userId,
        ...(data.seo && {
          seo: { create: data.seo },
        }),
        ...(data.categoryIds?.length && {
          categories: {
            create: data.categoryIds.map((categoryId) => ({ categoryId })),
          },
        }),
        ...(data.tagIds?.length && {
          tags: {
            create: data.tagIds.map((tagId) => ({ tagId })),
          },
        }),
      },
      include: { seo: true },
    });
  },

  async update(
    id: string,
    data: Record<string, any> & { userId?: string; categoryIds?: string[]; tagIds?: string[]; seo?: any },
  ) {
    const post = await prisma.blogPost.findUnique({ where: { id } });
    if (!post || post.deletedAt) throw new BlogPostError("ไม่พบ Blog Post", 404);

    const updates = pickField(data, BLOG_POST_UPDATABLE);

    // Handle status transitions
    if (data.status === "PUBLIC" && !post.publishDate) {
      updates.publishDate = new Date();
    }
    if (data.userId) updates.updatedById = data.userId;

    return prisma.blogPost.update({
      where: { id },
      data: {
        ...updates,
        ...(data.seo && {
          seo: {
            upsert: {
              create: data.seo,
              update: data.seo,
            },
          },
        }),
        ...(data.categoryIds !== undefined && {
          categories: {
            deleteMany: {},
            create: data.categoryIds.map((categoryId) => ({ categoryId })),
          },
        }),
        ...(data.tagIds !== undefined && {
          tags: {
            deleteMany: {},
            create: data.tagIds.map((tagId) => ({ tagId })),
          },
        }),
      },
      include: { seo: true },
    });
  },

  async setStatus(id: string, status: string, userId: string) {
    const post = await prisma.blogPost.findUnique({ where: { id } });
    if (!post || post.deletedAt) throw new BlogPostError("ไม่พบ Blog Post", 404);

    return prisma.blogPost.update({
      where: { id },
      data: {
        status: status as any,
        updatedById: userId,
        ...(status === "PUBLIC" && !post.publishDate && { publishDate: new Date() }),
      },
    });
  },

  async duplicate(id: string, userId: string) {
    const original = await prisma.blogPost.findUnique({
      where: { id },
      include: { seo: true, categories: true, tags: true },
    });
    if (!original || original.deletedAt) throw new BlogPostError("ไม่พบ Blog Post", 404);

    const newSlug = generateSlug(`${original.title} (copy)`);
    const copy = await prisma.blogPost.create({
      data: {
        title: `${original.title} (copy)`,
        slug: newSlug,
        excerpt: original.excerpt,
        description: original.description,
        thumbnail: original.thumbnail,
        coverImage: original.coverImage,
        banner: original.banner,
        content: original.content,
        status: "DRAFT",
        isPublic: false,
        readingTime: original.readingTime,
        isFeatured: false,
        isPinned: false,
        createdById: userId,
        updatedById: userId,
        seo: original.seo
          ? {
              create: {
                metaTitle: original.seo.metaTitle,
                metaDescription: original.seo.metaDescription,
                keyword: original.seo.keyword,
                ogTitle: original.seo.ogTitle,
                ogDescription: original.seo.ogDescription,
                ogImage: original.seo.ogImage,
                canonicalUrl: original.seo.canonicalUrl,
                robotsIndex: original.seo.robotsIndex,
                robotsFollow: original.seo.robotsFollow,
              },
            }
          : undefined,
        categories: {
          create: original.categories.map((cc) => ({ categoryId: cc.categoryId })),
        },
        tags: {
          create: original.tags.map((ct) => ({ tagId: ct.tagId })),
        },
      },
    });

    return copy;
  },

  async delete(id: string, userId: string) {
    const post = await prisma.blogPost.findUnique({ where: { id } });
    if (!post || post.deletedAt) throw new BlogPostError("ไม่พบ Blog Post", 404);

    return prisma.blogPost.update({
      where: { id },
      data: { deletedAt: new Date(), updatedById: userId },
    });
  },

  async restore(id: string, userId: string) {
    const post = await prisma.blogPost.findUnique({ where: { id } });
    if (!post) throw new BlogPostError("ไม่พบ Blog Post", 404);
    if (!post.deletedAt) throw new BlogPostError("Blog Post นี้ไม่ได้ถูกลบ", 400);

    return prisma.blogPost.update({
      where: { id },
      data: { deletedAt: null, updatedById: userId },
    });
  },
};
