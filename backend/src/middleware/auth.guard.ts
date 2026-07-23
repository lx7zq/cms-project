import { Elysia } from 'elysia';

import { jwtPlugin } from '../plugins/jwt';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  roles: string[];
  permissions: string[];
}

/**
 * Plugin: ดึง JWT จาก Authorization: Bearer <token>
 * ถ้า valid -> ใส่ user ลง context.user
 * ถ้าไม่มี/ไม่ valid -> user เป็น null (ให้แต่ละ route ตัดสินใจเองว่าต้อง login หรือไม่)
 */
export const authGuard = new Elysia({ name: "auth-guard" })
  .use(jwtPlugin)
  .derive({ as: "global" }, async ({ jwt, headers }) => {
    const authHeader = headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return { user: null as AuthUser | null };
    }

    const token = authHeader.slice("Bearer ".length);
    const payload = await jwt.verify(token);

    if (!payload) {
      return { user: null as AuthUser | null };
    }

    return {
      user: {
        id: payload.sub as string,
        email: payload.email as string,
        name: payload.name as string,
        roles: (payload.roles as string[]) ?? [],
        permissions: (payload.permissions as string[]) ?? [],
      } as AuthUser,
    };
  });

/**
 * ใช้ต่อจาก authGuard ใน route ที่ "ต้อง" login เท่านั้น
 * throw 401 ถ้าไม่มี user
 */
export const requireAuth = new Elysia({ name: "require-auth" })
  .use(authGuard)
  .onBeforeHandle({ as: "global" }, ({ user, set }) => {
    if (!user) {
      set.status = 401;
      return { error: "กรุณาเข้าสู่ระบบก่อนใช้งาน" };
    }
  });
