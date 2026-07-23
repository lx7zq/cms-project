import { prisma } from '../../lib/prisma';
import { authService } from '../auth/auth.service';

export class UserError extends Error {
  constructor(
    message: string,
    public status: number = 400,
  ) {
    super(message);
  }
}

const userListSelect = {
  id: true,
  email: true,
  name: true,
  avatarUrl: true,
  isActive: true,
  lastLoginAt: true,
  createdAt: true,
  userRoles: { include: { role: true } },
} as const;

function serializeUser(user: any) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatarUrl,
    isActive: user.isActive,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
    roles: user.userRoles.map((ur: any) => ({
      id: ur.role.id,
      name: ur.role.name,
    })),
  };
}

export const userService = {
  async list(params: { search?: string; page?: number; pageSize?: number }) {
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 20;

    const where = params.search
      ? {
          OR: [
            { name: { contains: params.search, mode: "insensitive" as const } },
            {
              email: { contains: params.search, mode: "insensitive" as const },
            },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: userListSelect,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      data: users.map(serializeUser),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  },

  async getById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: userListSelect,
    });
    if (!user) throw new UserError("ไม่พบผู้ใช้งานนี้", 404);
    return serializeUser(user);
  },

  async create(input: {
    email: string;
    password: string;
    name: string;
    roleIds: string[];
  }) {
    const existing = await prisma.user.findUnique({
      where: { email: input.email },
    });
    if (existing) throw new UserError("อีเมลนี้ถูกใช้งานแล้ว", 409);

    const passwordHash = await authService.hashPassword(input.password);

    const user = await prisma.user.create({
      data: {
        email: input.email,
        passwordHash,
        name: input.name,
        userRoles: {
          create: input.roleIds.map((roleId) => ({ roleId })),
        },
      },
      select: userListSelect,
    });

    return serializeUser(user);
  },

  async update(
    id: string,
    input: { name?: string; email?: string; avatarUrl?: string },
  ) {
    await this.assertExists(id);

    if (input.email) {
      const existing = await prisma.user.findFirst({
        where: { email: input.email, NOT: { id } },
      });
      if (existing) throw new UserError("อีเมลนี้ถูกใช้งานโดยผู้อื่นแล้ว", 409);
    }

    const user = await prisma.user.update({
      where: { id },
      data: input,
      select: userListSelect,
    });

    return serializeUser(user);
  },

  async setActive(id: string, isActive: boolean) {
    await this.assertExists(id);
    const user = await prisma.user.update({
      where: { id },
      data: { isActive },
      select: userListSelect,
    });
    return serializeUser(user);
  },

  async assignRoles(id: string, roleIds: string[]) {
    await this.assertExists(id);

    await prisma.$transaction([
      prisma.userRole.deleteMany({ where: { userId: id } }),
      prisma.userRole.createMany({
        data: roleIds.map((roleId) => ({ userId: id, roleId })),
      }),
    ]);

    return this.getById(id);
  },

  async delete(id: string, currentUserId: string) {
    if (id === currentUserId) {
      throw new UserError("ไม่สามารถลบบัญชีของตัวเองได้", 400);
    }
    await this.assertExists(id);
    // soft-delete แนวทางที่ปลอดภัยกว่า hard delete เพราะ user อาจถูกอ้างอิงใน content/logs จำนวนมาก
    await prisma.user.update({ where: { id }, data: { isActive: false } });
  },

  async assertExists(id: string) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new UserError("ไม่พบผู้ใช้งานนี้", 404);
    return user;
  },
};
