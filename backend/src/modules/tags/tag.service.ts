import { prisma } from "../../lib/prisma";
import { generateSlug } from "../../lib/slug";

export class TagError extends Error {
  constructor(
    message: string,
    public status: number = 400,
  ) {
    super(message);
  }
}

export const tagService = {
  async list() {
    return prisma.tag.findMany({
      orderBy: { createdAt: "desc" },
    });
  },

  async getById(id: string) {
    const tag = await prisma.tag.findUnique({ where: { id } });
    if (!tag) throw new TagError("ไม่พบ Tag", 404);
    return tag;
  },

  async create(data: { name: string }) {
    const slug = generateSlug(data.name);
    const existing = await prisma.tag.findUnique({
      where: { slug },
    });
    if (existing) throw new TagError("Tag นี้มีอยู่แล้ว", 409);

    return prisma.tag.create({
      data: {
        name: data.name,
        slug: generateSlug(data.name),
      },
    });
  },

  async update(id: string, data: { name?: string }) {
    const tag = await prisma.tag.findUnique({ where: { id } });
    if (!tag) throw new TagError("ไม่พบ Tag", 404);

    return prisma.tag.update({
      where: { id },
      data: {
        ...(data.name !== undefined && {
          name: data.name,
          slug: generateSlug(data.name),
        }),
      },
    });
  },

  async delete(id: string) {
    const tag = await prisma.tag.findUnique({ where: { id } });
    if (!tag) throw new TagError("ไม่พบ Tag", 404);

    // Check if tag is in use
    const contentTags = await prisma.contentTag.count({
      where: { tagId: id },
    });
    if (contentTags > 0) {
      throw new TagError("ไม่สามารถลบ Tag ได้ เนื่องจากมีเนื้อหาใช้งานอยู่", 400);
    }

    return prisma.tag.delete({ where: { id } });
  },
};
