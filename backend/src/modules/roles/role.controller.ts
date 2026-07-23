import {
  Elysia,
  t,
} from 'elysia';

import { requirePermission } from '../../middleware/permission.guard';
import {
  RoleError,
  roleService,
} from './role.service';

export const roleController = new Elysia({ prefix: "/roles" })
  .use(requirePermission("role.manage"))

  // ---------- LIST ROLES ----------
  .get("/", async () => roleService.list())

  // ---------- LIST ALL PERMISSIONS (ใช้ประกอบ checkbox ตอนสร้าง/แก้ role) ----------
  .get("/permissions", async () => roleService.listPermissions())

  // ---------- GET BY ID ----------
  .get(
    "/:id",
    async ({ params, set }) => {
      try {
        return await roleService.getById(params.id);
      } catch (err) {
        return handleError(err, set);
      }
    },
    { params: t.Object({ id: t.String() }) },
  )

  // ---------- CREATE ----------
  .post(
    "/",
    async ({ body, set }) => {
      try {
        set.status = 201;
        return await roleService.create(body);
      } catch (err) {
        return handleError(err, set);
      }
    },
    {
      body: t.Object({
        name: t.String({ minLength: 1 }),
        description: t.Optional(t.String()),
        permissionIds: t.Array(t.String()),
      }),
    },
  )

  // ---------- UPDATE (name/description เท่านั้น) ----------
  .patch(
    "/:id",
    async ({ params, body, set }) => {
      try {
        return await roleService.update(params.id, body);
      } catch (err) {
        return handleError(err, set);
      }
    },
    {
      params: t.Object({ id: t.String() }),
      body: t.Object({
        name: t.Optional(t.String({ minLength: 1 })),
        description: t.Optional(t.String()),
      }),
    },
  )

  // ---------- SET PERMISSIONS (แทนที่ทั้งชุด) ----------
  .put(
    "/:id/permissions",
    async ({ params, body, set }) => {
      try {
        return await roleService.setPermissions(params.id, body.permissionIds);
      } catch (err) {
        return handleError(err, set);
      }
    },
    {
      params: t.Object({ id: t.String() }),
      body: t.Object({ permissionIds: t.Array(t.String()) }),
    },
  )

  // ---------- DELETE ----------
  .delete(
    "/:id",
    async ({ params, set }) => {
      try {
        await roleService.delete(params.id);
        return { message: "ลบ Role สำเร็จ" };
      } catch (err) {
        return handleError(err, set);
      }
    },
    { params: t.Object({ id: t.String() }) },
  );

function handleError(err: unknown, set: { status?: number | string }) {
  if (err instanceof RoleError) {
    set.status = err.status;
    return { error: err.message };
  }
  throw err;
}
