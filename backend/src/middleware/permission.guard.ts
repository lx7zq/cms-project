import { Elysia } from 'elysia';

import { requireAuth } from './auth.guard';

/**
 * ใช้หลัง requireAuth ใน route ที่ต้องเช็คสิทธิ์เฉพาะ
 * ตัวอย่าง: .use(requirePermission("landing_page.publish"))
 *
 * Super Admin ควร assign permission ครบทุกตัวไว้ตอน seed
 * เพื่อไม่ต้องเขียน bypass logic แยก ("Super Admin ผ่านทุกอย่าง") ในโค้ด
 */
export const requirePermission = (permissionKey: string) =>
  new Elysia({ name: `require-permission-${permissionKey}` })
    .use(requireAuth)
    .onBeforeHandle({ as: "global" }, ({ user, set }) => {
      if (!user?.permissions.includes(permissionKey)) {
        set.status = 403;
        return {
          error: `คุณไม่มีสิทธิ์ดำเนินการนี้ (ต้องการ: ${permissionKey})`,
        };
      }
    });

/**
 * เช็คว่ามี permission อย่างน้อย 1 ใน list ที่ให้มา (OR condition)
 */
export const requireAnyPermission = (permissionKeys: string[]) =>
  new Elysia({ name: `require-any-permission-${permissionKeys.join("-")}` })
    .use(requireAuth)
    .onBeforeHandle({ as: "global" }, ({ user, set }) => {
      const hasAny = permissionKeys.some((key) =>
        user?.permissions.includes(key),
      );
      if (!hasAny) {
        set.status = 403;
        return {
          error: `คุณไม่มีสิทธิ์ดำเนินการนี้ (ต้องการหนึ่งใน: ${permissionKeys.join(", ")})`,
        };
      }
    });
