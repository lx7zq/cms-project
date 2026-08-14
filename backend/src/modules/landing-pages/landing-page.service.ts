import { prisma } from '../../lib/prisma';
import { generateSlug } from '../../lib/slug';

export class LandingPageError extends Error {
  constructor(
    message: string,
    public status: number = 400,
  ) {
    super(message);
  }
}

const pageInclude = {
  seo: true,
  categories: { include: { category: true } },
  tags: { include: { tag: true } },
  createdBy: { select: { id: true, name: true, email: true } },
  updatedBy: { select: { id: true, name: true, email: true } },
  _count: { select: { pageViews: true, versions: true } },
} as const;

function serializeLandingPage(page: any) {
  return {
    id: page.id,
    title: page.title,
    slug: page.slug,
    shortDescription: page.shortDescription,
    description: page.description,
    banner: page.banner,
    thumbnail: page.thumbnail,
    coverImage: page.coverImage,
    content: page.content,
    status: page.status,
    isPublic: page.isPublic,
    publishDate: page.publishDate,
    expireDate: page.expireDate,
    privateAccessType: page.privateAccessType,
    pagePassword: page.pagePassword,
    privateLinkToken: page.privateLinkToken,
    viewCount: page.viewCount,
    createdAt: page.createdAt,
    updatedAt: page.updatedAt,
    createdBy: page.createdBy,
    updatedBy: page.updatedBy,
    seo: page.seo,
    categories: page.categories.map((item: any) => ({
      id: item.category.id,
      name: item.category.name,
      slug: item.category.slug,
      contentType: item.category.contentType,
    })),
    tags: page.tags.map((item: any) => ({
      id: item.tag.id,
      name: item.tag.name,
      slug: item.tag.slug,
    })),
    analytics: {
      pageViews: page._count?.pageViews ?? 0,
      versions: page._count?.versions ?? 0,
    },
  };
}

async function ensureUniqueSlug(title: string, excludeId?: string) {
  const base = generateSlug(title, "page");
  let candidate = base;
  let counter = 1;

  while (true) {
    const existing = await prisma.landingPage.findFirst({
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

export const landingPageService = {
  async list(params: {
    search?: string;
    status?: string;
    page?: number;
    pageSize?: number;
  }) {
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 20;

    const where: any = {};
    if (params.status) {
      where.status = params.status;
    }
    if (params.search) {
      where.OR = [
        { title: { contains: params.search, mode: "insensitive" } },
        { slug: { contains: params.search, mode: "insensitive" } },
        { shortDescription: { contains: params.search, mode: "insensitive" } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.landingPage.findMany({
        where,
        include: pageInclude,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: "desc" },
      }),
      prisma.landingPage.count({ where }),
    ]);

    return {
      data: items.map(serializeLandingPage),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  },

  async getById(id: string) {
    const page = await prisma.landingPage.findUnique({
      where: { id },
      include: pageInclude,
    });

    if (!page) {
      throw new LandingPageError("ไม่พบ Landing Page นี้", 404);
    }

    return serializeLandingPage(page);
  },

  async create(input: {
    title: string;
    content: string;
    shortDescription?: string;
    description?: string;
    banner?: string;
    thumbnail?: string;
    coverImage?: string;
    status?: string;
    isPublic?: boolean;
    publishDate?: string | Date | null;
    expireDate?: string | Date | null;
    privateAccessType?: string | null;
    pagePassword?: string | null;
    privateLinkToken?: string | null;
    seo?: {
      metaTitle?: string | null;
      metaDescription?: string | null;
      keyword?: string | null;
      ogTitle?: string | null;
      ogDescription?: string | null;
      ogImage?: string | null;
      canonicalUrl?: string | null;
      robotsIndex?: boolean;
      robotsFollow?: boolean;
    } | null;
    categoryIds?: string[];
    tagIds?: string[];
    userId: string;
  }) {
    const title = input.title.trim();
    if (!title) {
      throw new LandingPageError("ชื่อลงหน้าไม่สามารถเว้นว่างได้", 400);
    }

    const slug = await ensureUniqueSlug(title);

    const page = await prisma.landingPage.create({
      data: {
        title,
        slug,
        shortDescription: input.shortDescription ?? null,
        description: input.description ?? null,
        banner: input.banner ?? null,
        thumbnail: input.thumbnail ?? null,
        coverImage: input.coverImage ?? null,
        content: input.content ?? "",
        status: (input.status as any) ?? "DRAFT",
        isPublic: input.isPublic ?? false,
        publishDate: input.publishDate ? new Date(input.publishDate) : null,
        expireDate: input.expireDate ? new Date(input.expireDate) : null,
        privateAccessType: (input.privateAccessType as any) ?? null,
        pagePassword: input.pagePassword ?? null,
        privateLinkToken: input.privateLinkToken ?? null,
        createdById: input.userId,
        seo: input.seo
          ? {
              create: {
                metaTitle: input.seo.metaTitle ?? null,
                metaDescription: input.seo.metaDescription ?? null,
                keyword: input.seo.keyword ?? null,
                ogTitle: input.seo.ogTitle ?? null,
                ogDescription: input.seo.ogDescription ?? null,
                ogImage: input.seo.ogImage ?? null,
                canonicalUrl: input.seo.canonicalUrl ?? null,
                robotsIndex: input.seo.robotsIndex ?? true,
                robotsFollow: input.seo.robotsFollow ?? true,
              },
            }
          : undefined,
        categories: input.categoryIds?.length
          ? {
              create: input.categoryIds.map((categoryId) => ({
                category: { connect: { id: categoryId } },
              })),
            }
          : undefined,
        tags: input.tagIds?.length
          ? {
              create: input.tagIds.map((tagId) => ({
                tag: { connect: { id: tagId } },
              })),
            }
          : undefined,
      },
      include: pageInclude,
    });

    await prisma.contentVersion.create({
      data: {
        contentType: "LANDING_PAGE",
        landingPageId: page.id,
        snapshot: serializeLandingPage(page),
        note: "Initial creation",
        editedById: input.userId,
      },
    });

    return serializeLandingPage(page);
  },

  async update(
    id: string,
    input: {
      title?: string;
      content?: string;
      shortDescription?: string;
      description?: string;
      banner?: string;
      thumbnail?: string;
      coverImage?: string;
      status?: string;
      isPublic?: boolean;
      publishDate?: string | Date | null;
      expireDate?: string | Date | null;
      privateAccessType?: string | null;
      pagePassword?: string | null;
      privateLinkToken?: string | null;
      seo?: {
        metaTitle?: string | null;
        metaDescription?: string | null;
        keyword?: string | null;
        ogTitle?: string | null;
        ogDescription?: string | null;
        ogImage?: string | null;
        canonicalUrl?: string | null;
        robotsIndex?: boolean;
        robotsFollow?: boolean;
      } | null;
      categoryIds?: string[];
      tagIds?: string[];
      userId: string;
    },
  ) {
    const page = await prisma.landingPage.findUnique({
      where: { id },
      include: { seo: true },
    });

    if (!page) throw new LandingPageError("ไม่พบ Landing Page นี้", 404);

    const title = input.title?.trim() ?? page.title;
    const slug = input.title ? await ensureUniqueSlug(title, id) : page.slug;

    const next = await prisma.$transaction(async (tx) => {
      const updated = await tx.landingPage.update({
        where: { id },
        data: {
          title,
          slug,
          shortDescription: input.shortDescription ?? page.shortDescription,
          description: input.description ?? page.description,
          banner: input.banner ?? page.banner,
          thumbnail: input.thumbnail ?? page.thumbnail,
          coverImage: input.coverImage ?? page.coverImage,
          content: input.content ?? page.content,
          status: input.status ? (input.status as any) : page.status,
          isPublic: input.isPublic ?? page.isPublic,
          publishDate: input.publishDate
            ? new Date(input.publishDate)
            : page.publishDate,
          expireDate: input.expireDate
            ? new Date(input.expireDate)
            : page.expireDate,
          privateAccessType: ((input.privateAccessType as any) ??
            page.privateAccessType) as any,
          pagePassword: input.pagePassword ?? page.pagePassword,
          privateLinkToken: input.privateLinkToken ?? page.privateLinkToken,
          updatedById: input.userId,
          seo: input.seo
            ? {
                upsert: {
                  create: {
                    metaTitle: input.seo.metaTitle ?? null,
                    metaDescription: input.seo.metaDescription ?? null,
                    keyword: input.seo.keyword ?? null,
                    ogTitle: input.seo.ogTitle ?? null,
                    ogDescription: input.seo.ogDescription ?? null,
                    ogImage: input.seo.ogImage ?? null,
                    canonicalUrl: input.seo.canonicalUrl ?? null,
                    robotsIndex: input.seo.robotsIndex ?? true,
                    robotsFollow: input.seo.robotsFollow ?? true,
                  },
                  update: {
                    metaTitle: input.seo.metaTitle ?? undefined,
                    metaDescription: input.seo.metaDescription ?? undefined,
                    keyword: input.seo.keyword ?? undefined,
                    ogTitle: input.seo.ogTitle ?? undefined,
                    ogDescription: input.seo.ogDescription ?? undefined,
                    ogImage: input.seo.ogImage ?? undefined,
                    canonicalUrl: input.seo.canonicalUrl ?? undefined,
                    robotsIndex: input.seo.robotsIndex ?? undefined,
                    robotsFollow: input.seo.robotsFollow ?? undefined,
                  },
                },
              }
            : undefined,
        },
        include: pageInclude,
      });

      if (input.categoryIds) {
        await tx.contentCategory.deleteMany({ where: { landingPageId: id } });
        if (input.categoryIds.length > 0) {
          await tx.contentCategory.createMany({
            data: input.categoryIds.map((categoryId) => ({
              categoryId,
              landingPageId: id,
            })),
          });
        }
      }

      if (input.tagIds) {
        await tx.contentTag.deleteMany({ where: { landingPageId: id } });
        if (input.tagIds.length > 0) {
          await tx.contentTag.createMany({
            data: input.tagIds.map((tagId) => ({
              tagId,
              landingPageId: id,
            })),
          });
        }
      }

      const refreshed = await tx.landingPage.findUnique({
        where: { id },
        include: pageInclude,
      });

      if (!refreshed) {
        throw new LandingPageError(
          "ไม่สามารถโหลดข้อมูล Landing Page หลังอัปเดตได้",
          500,
        );
      }

      await tx.contentVersion.create({
        data: {
          contentType: "LANDING_PAGE",
          landingPageId: id,
          snapshot: serializeLandingPage(refreshed),
          note: "Updated page",
          editedById: input.userId,
        },
      });

      return refreshed;
    });

    return serializeLandingPage(next);
  },

  async duplicate(id: string, userId: string) {
    const source = await prisma.landingPage.findUnique({
      where: { id },
      include: {
        seo: true,
        categories: { include: { category: true } },
        tags: { include: { tag: true } },
      },
    });

    if (!source) {
      throw new LandingPageError("ไม่พบ Landing Page นี้", 404);
    }

    const slug = await ensureUniqueSlug(`${source.title} copy`);
    const duplicated = await prisma.landingPage.create({
      data: {
        title: `${source.title} (คัดลอก)`,
        slug,
        shortDescription: source.shortDescription,
        description: source.description,
        banner: source.banner,
        thumbnail: source.thumbnail,
        coverImage: source.coverImage,
        content: source.content,
        status: "DRAFT",
        isPublic: false,
        publishDate: null,
        expireDate: null,
        privateAccessType: source.privateAccessType,
        pagePassword: source.pagePassword,
        privateLinkToken: null,
        createdById: userId,
        seo: source.seo
          ? {
              create: {
                metaTitle: source.seo.metaTitle,
                metaDescription: source.seo.metaDescription,
                keyword: source.seo.keyword,
                ogTitle: source.seo.ogTitle,
                ogDescription: source.seo.ogDescription,
                ogImage: source.seo.ogImage,
                canonicalUrl: source.seo.canonicalUrl,
                robotsIndex: source.seo.robotsIndex,
                robotsFollow: source.seo.robotsFollow,
              },
            }
          : undefined,
        categories: source.categories.length
          ? {
              create: source.categories.map((item) => ({
                category: { connect: { id: item.categoryId } },
              })),
            }
          : undefined,
        tags: source.tags.length
          ? {
              create: source.tags.map((item) => ({
                tag: { connect: { id: item.tagId } },
              })),
            }
          : undefined,
      },
      include: pageInclude,
    });

    return serializeLandingPage(duplicated);
  },

  async setStatus(id: string, status: string, userId: string) {
    const page = await prisma.landingPage.findUnique({ where: { id } });
    if (!page) throw new LandingPageError("ไม่พบ Landing Page นี้", 404);

    const updated = await prisma.landingPage.update({
      where: { id },
      data: {
        status: status as any,
        updatedById: userId,
      },
      include: pageInclude,
    });

    return serializeLandingPage(updated);
  },

  async togglePublic(id: string, isPublic: boolean, userId: string) {
    const page = await prisma.landingPage.findUnique({ where: { id } });
    if (!page) throw new LandingPageError("ไม่พบ Landing Page นี้", 404);

    const updated = await prisma.landingPage.update({
      where: { id },
      data: {
        isPublic,
        status: isPublic ? "PUBLIC" : "DRAFT",
        updatedById: userId,
      },
      include: pageInclude,
    });

    return serializeLandingPage(updated);
  },

  async delete(id: string) {
    const page = await prisma.landingPage.findUnique({ where: { id } });
    if (!page) throw new LandingPageError("ไม่พบ Landing Page นี้", 404);

    await prisma.landingPage.delete({ where: { id } });
    return { message: "ลบ Landing Page สำเร็จ" };
  },
};
