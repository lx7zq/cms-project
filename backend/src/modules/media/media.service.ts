import { randomUUID } from "crypto";
import { mkdir, writeFile, unlink, stat } from "fs/promises";
import { join } from "path";

import { prisma } from "../../lib/prisma";

export class MediaError extends Error {
  constructor(
    message: string,
    public status: number = 400,
  ) {
    super(message);
  }
}

const UPLOAD_DIR = join(process.cwd(), "uploads");
const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/svg+xml", "image/webp"];
const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/zip",
];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

function getFileExtension(filename: string): string {
  return filename.split(".").pop() || "";
}

function getFileTypeLabel(mimeType: string): string {
  const map: Record<string, string> = {
    "image/png": "PNG",
    "image/jpeg": "JPG",
    "image/svg+xml": "SVG",
    "image/webp": "WebP",
    "application/pdf": "PDF",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "DOCX",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "XLSX",
    "application/zip": "ZIP",
  };
  return map[mimeType] || "UNKNOWN";
}

export const mediaService = {
  async list(params: { fileType?: string; page?: number; pageSize?: number }) {
    const { fileType, page = 1, pageSize = 50 } = params;
    const where: any = {};

    if (fileType === "image") {
      where.fileType = { in: ["PNG", "JPG", "JPEG", "SVG", "WebP"] };
    } else if (fileType === "document") {
      where.fileType = { in: ["PDF", "DOCX", "XLSX", "ZIP"] };
    }

    const [data, total] = await Promise.all([
      prisma.mediaFile.findMany({
        where,
        include: { uploadedBy: { select: { id: true, name: true } } },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.mediaFile.count({ where }),
    ]);

    return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  },

  async uploadImage(file: File, userId: string, altText?: string, caption?: string) {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      throw new MediaError(`ไฟล์ประเภท ${file.type} ไม่ได้รับอนุญาตให้อัปโหลด`);
    }
    if (file.size > MAX_FILE_SIZE) {
      throw new MediaError("ขนาดไฟล์เกิน 10MB");
    }

    await mkdir(UPLOAD_DIR, { recursive: true });
    const ext = getFileExtension(file.name);
    const filename = `${randomUUID()}.${ext}`;
    const filepath = join(UPLOAD_DIR, filename);

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filepath, buffer);

    return prisma.mediaFile.create({
      data: {
        fileName: file.name,
        url: `/uploads/${filename}`,
        fileType: getFileTypeLabel(file.type),
        fileSize: file.size,
        altText: altText || null,
        caption: caption || null,
        uploadedById: userId,
      },
    });
  },

  async uploadFile(file: File, userId: string) {
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      throw new MediaError(`ไฟล์ประเภท ${file.type} ไม่ได้รับอนุญาตให้อัปโหลด`);
    }
    if (file.size > MAX_FILE_SIZE) {
      throw new MediaError("ขนาดไฟล์เกิน 10MB");
    }

    await mkdir(UPLOAD_DIR, { recursive: true });
    const ext = getFileExtension(file.name);
    const filename = `${randomUUID()}.${ext}`;
    const filepath = join(UPLOAD_DIR, filename);

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filepath, buffer);

    return prisma.fileAttachment.create({
      data: {
        fileName: file.name,
        url: `/uploads/${filename}`,
        fileType: getFileTypeLabel(file.type),
        fileSize: file.size,
        uploadedById: userId,
      },
    });
  },

  async deleteMedia(id: string) {
    const media = await prisma.mediaFile.findUnique({ where: { id } });
    if (!media) throw new MediaError("ไม่พบไฟล์", 404);

    // Try to delete physical file
    try {
      const filepath = join(process.cwd(), media.url);
      await unlink(filepath);
    } catch {
      // File may already be deleted
    }

    return prisma.mediaFile.delete({ where: { id } });
  },

  async deleteFile(id: string) {
    const file = await prisma.fileAttachment.findUnique({ where: { id } });
    if (!file) throw new MediaError("ไม่พบไฟล์", 404);

    try {
      const filepath = join(process.cwd(), file.url);
      await unlink(filepath);
    } catch {
      // File may already be deleted
    }

    return prisma.fileAttachment.delete({ where: { id } });
  },
};
