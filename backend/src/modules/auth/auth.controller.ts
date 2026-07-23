import {
  Elysia,
  t,
} from 'elysia';

import { requireAuth } from '../../middleware/auth.guard';
import {
  jwtPlugin,
  jwtRefreshPlugin,
} from '../../plugins/jwt';
import {
  AuthError,
  authService,
} from './auth.service';

export const authController = new Elysia({ prefix: "/auth" })
  .use(jwtPlugin)
  .use(jwtRefreshPlugin)

  // ---------- LOGIN ----------
  .post(
    "/login",
    async ({ body, jwt, jwtRefresh, set }) => {
      try {
        const user = await authService.validateCredentials(
          body.email,
          body.password,
        );

        const accessToken = await jwt.sign({
          sub: user.id,
          email: user.email,
          name: user.name,
          roles: user.roles,
          permissions: user.permissions,
        });

        const refreshToken = await jwtRefresh.sign({ sub: user.id });

        return {
          user,
          accessToken,
          refreshToken,
        };
      } catch (err) {
        if (err instanceof AuthError) {
          set.status = err.status;
          return { error: err.message };
        }
        throw err;
      }
    },
    {
      body: t.Object({
        email: t.String({ format: "email" }),
        password: t.String({ minLength: 1 }),
      }),
    },
  )

  // ---------- REFRESH TOKEN ----------
  .post(
    "/refresh",
    async ({ body, jwt, jwtRefresh, set }) => {
      const payload = await jwtRefresh.verify(body.refreshToken);
      if (!payload) {
        set.status = 401;
        return { error: "Refresh token ไม่ถูกต้องหรือหมดอายุ" };
      }

      // ดึงสิทธิ์ล่าสุดใหม่ทุกครั้ง เผื่อ role ถูกเปลี่ยนระหว่างทาง
      const { prisma } = await import("../../lib/prisma");
      const user = await prisma.user.findUnique({
        where: { id: payload.sub as string },
        include: {
          userRoles: {
            include: {
              role: {
                include: { rolePermissions: { include: { permission: true } } },
              },
            },
          },
        },
      });

      if (!user || !user.isActive) {
        set.status = 401;
        return { error: "บัญชีนี้ไม่สามารถใช้งานได้" };
      }

      const roles = user.userRoles.map((ur) => ur.role.name);
      const permissions = Array.from(
        new Set(
          user.userRoles.flatMap((ur) =>
            ur.role.rolePermissions.map((rp) => rp.permission.key),
          ),
        ),
      );

      const accessToken = await jwt.sign({
        sub: user.id,
        email: user.email,
        name: user.name,
        roles,
        permissions,
      });

      return { accessToken };
    },
    {
      body: t.Object({ refreshToken: t.String() }),
    },
  )

  // ---------- LOGOUT ----------
  // เนื่องจากใช้ stateless JWT ฝั่ง client ต้องลบ token เอง
  // endpoint นี้มีไว้เผื่ออนาคตต้องการ blacklist token / log activity
  .post("/logout", async () => {
    return { message: "ออกจากระบบสำเร็จ" };
  })

  // ---------- FORGOT PASSWORD ----------
  .post(
    "/forgot-password",
    async ({ body }) => {
      const token = await authService.createPasswordResetToken(body.email);
      // TODO: ส่ง token ผ่าน email จริง แทนการ return ตรงๆ (ตอนนี้ mock ไว้ก่อน)
      if (process.env.NODE_ENV !== "production") {
        return {
          message: "หากอีเมลนี้มีอยู่ในระบบ จะได้รับลิงก์รีเซ็ตรหัสผ่าน",
          devToken: token,
        };
      }
      return { message: "หากอีเมลนี้มีอยู่ในระบบ จะได้รับลิงก์รีเซ็ตรหัสผ่าน" };
    },
    {
      body: t.Object({ email: t.String({ format: "email" }) }),
    },
  )

  // ---------- RESET PASSWORD ----------
  .post(
    "/reset-password",
    async ({ body, set }) => {
      try {
        await authService.resetPassword(body.token, body.newPassword);
        return { message: "เปลี่ยนรหัสผ่านสำเร็จ" };
      } catch (err) {
        if (err instanceof AuthError) {
          set.status = err.status;
          return { error: err.message };
        }
        throw err;
      }
    },
    {
      body: t.Object({
        token: t.String(),
        newPassword: t.String({ minLength: 8 }),
      }),
    },
  )

  // ---------- ME (ต้อง login) ----------
  .use(requireAuth)
  .get("/me", ({ user }) => ({ user }))

  // ---------- CHANGE PASSWORD (ต้อง login) ----------
  .post(
    "/change-password",
    async ({ body, user, set }) => {
      try {
        await authService.changePassword(
          user!.id,
          body.oldPassword,
          body.newPassword,
        );
        return { message: "เปลี่ยนรหัสผ่านสำเร็จ" };
      } catch (err) {
        if (err instanceof AuthError) {
          set.status = err.status;
          return { error: err.message };
        }
        throw err;
      }
    },
    {
      body: t.Object({
        oldPassword: t.String(),
        newPassword: t.String({ minLength: 8 }),
      }),
    },
  );
