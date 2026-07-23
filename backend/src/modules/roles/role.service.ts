import { prisma } from '../../lib/prisma';

export class RoleError extends Error {
  constructor(
    message: string,
    public status: number = 400,
  ) {
    super(message);
  }
}

const PROTECTED_ROLE_NAMES = ["Super Admin"]; // ป้องกันแก้/ลบ role หลักที่ระบบพึ่งพา

function serializeRole(role: any) {
  return {
    id: role.id,
    name: role.name,
    description: role.description,
    permissions: role.rolePermissions.map((rp: any) => ({
      id: rp.permission.id,
      key: rp.permission.key,
      description: rp.permission.description,
    })),
    userCount: role._count?.userRoles,
  };
}

const roleInclude = {
  rolePermissions: { include: { permission: true } },
  _count: { select: { userRoles: true } },
} as const;

export const roleService = {
  async list() {
    const roles = await prisma.role.findMany({
      include: roleInclude,
      orderBy: { createdAt: "asc" },
    });
    return roles.map(serializeRole);
  },

  async getById(id: string) {
    const role = await prisma.role.findUnique({
      where: { id },
      include: roleInclude,
    });
    if (!role) throw new RoleError("ไม่พบ Role นี้", 404);
    return serializeRole(role);
  },

  async listPermissions() {
    return prisma.permission.findMany({ orderBy: { key: "asc" } });
  },

  async create(input: {
    name: string;
    description?: string;
    permissionIds: string[];
  }) {
    const existing = await prisma.role.findUnique({
      where: { name: input.name },
    });
    if (existing) throw new RoleError("มี Role ชื่อนี้อยู่แล้ว", 409);

    const role = await prisma.role.create({
      data: {
        name: input.name,
        description: input.description,
        rolePermissions: {
          create: input.permissionIds.map((permissionId) => ({ permissionId })),
        },
      },
      include: roleInclude,
    });

    return serializeRole(role);
  },

  async update(id: string, input: { name?: string; description?: string }) {
    const role = await this.assertExists(id);
    this.assertNotProtected(role.name, "แก้ไข");

    if (input.name) {
      const existing = await prisma.role.findFirst({
        where: { name: input.name, NOT: { id } },
      });
      if (existing) throw new RoleError("มี Role ชื่อนี้อยู่แล้ว", 409);
    }

    const updated = await prisma.role.update({
      where: { id },
      data: input,
      include: roleInclude,
    });

    return serializeRole(updated);
  },

  async setPermissions(id: string, permissionIds: string[]) {
    const role = await this.assertExists(id);
    this.assertNotProtected(role.name, "แก้ไขสิทธิ์ของ");

    await prisma.$transaction([
      prisma.rolePermission.deleteMany({ where: { roleId: id } }),
      prisma.rolePermission.createMany({
        data: permissionIds.map((permissionId) => ({
          roleId: id,
          permissionId,
        })),
      }),
    ]);

    return this.getById(id);
  },

  async delete(id: string) {
    const role = await this.assertExists(id);
    this.assertNotProtected(role.name, "ลบ");

    const userCount = await prisma.userRole.count({ where: { roleId: id } });
    if (userCount > 0) {
      throw new RoleError(
        `ไม่สามารถลบ Role นี้ได้ เนื่องจากมีผู้ใช้งาน ${userCount} คนใช้ Role นี้อยู่`,
        409,
      );
    }

    await prisma.role.delete({ where: { id } });
  },

  async assertExists(id: string) {
    const role = await prisma.role.findUnique({ where: { id } });
    if (!role) throw new RoleError("ไม่พบ Role นี้", 404);
    return role;
  },

  assertNotProtected(roleName: string, action: string) {
    if (PROTECTED_ROLE_NAMES.includes(roleName)) {
      throw new RoleError(
        `ไม่สามารถ${action} Role "${roleName}" ได้ เนื่องจากเป็น Role หลักของระบบ`,
        403,
      );
    }
  },
};
