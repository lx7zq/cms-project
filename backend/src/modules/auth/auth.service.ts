import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';

import { prisma } from '../../lib/prisma';

const SALT_ROUNDS = 12;

export class AuthError extends Error {
  constructor(
    message: string,
    public status: number = 400,
  ) {
    super(message);
  }
}

export const authService = {
  async hashPassword(plain: string) {
    return bcrypt.hash(plain, SALT_ROUNDS);
  },

  async verifyPassword(plain: string, hash: string) {
    return bcrypt.compare(plain, hash);
  },

  /**
   * ตรวจ email/password และคืน user พร้อม role + permission ทั้งหมด (flatten)
   * ไม่คืน passwordHash ออกไป
   */
  async validateCredentials(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: { include: { permission: true } },
              },
            },
          },
        },
      },
    });

    if (!user) throw new AuthError("อีเมลหรือรหัสผ่านไม่ถูกต้อง", 401);
    if (!user.isActive) throw new AuthError("บัญชีนี้ถูกระงับการใช้งาน", 403);

    const valid = await this.verifyPassword(password, user.passwordHash);
    if (!valid) throw new AuthError("อีเมลหรือรหัสผ่านไม่ถูกต้อง", 401);

    const roles = user.userRoles.map((ur) => ur.role.name);
    const permissions = Array.from(
      new Set(
        user.userRoles.flatMap((ur) =>
          ur.role.rolePermissions.map((rp) => rp.permission.key),
        ),
      ),
    );

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      roles,
      permissions,
    };
  },

  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
  ) {
    const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });

    const valid = await this.verifyPassword(oldPassword, user.passwordHash);
    if (!valid) throw new AuthError("รหัสผ่านเดิมไม่ถูกต้อง", 401);

    const passwordHash = await this.hashPassword(newPassword);
    await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
  },

  async createPasswordResetToken(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    // ไม่ throw error ถ้าไม่เจอ user เพื่อป้องกัน email enumeration
    if (!user) return null;

    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 30); // หมดอายุใน 30 นาที

    await prisma.passwordResetToken.create({
      data: { userId: user.id, token, expiresAt },
    });

    return token; // ในระบบจริงจะส่งผ่าน email ไม่ return ตรงๆ
  },

  async resetPassword(token: string, newPassword: string) {
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken) throw new AuthError("ลิงก์รีเซ็ตรหัสผ่านไม่ถูกต้อง", 400);
    if (resetToken.usedAt) throw new AuthError("ลิงก์นี้ถูกใช้ไปแล้ว", 400);
    if (resetToken.expiresAt < new Date())
      throw new AuthError("ลิงก์รีเซ็ตรหัสผ่านหมดอายุแล้ว", 400);

    const passwordHash = await this.hashPassword(newPassword);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { passwordHash },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() },
      }),
    ]);
  },
};
