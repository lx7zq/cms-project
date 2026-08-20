import {
  Elysia,
  t,
} from 'elysia';

import { requireAuth } from '../../middleware/auth.guard';
import {
  CategoryError,
  categoryService,
} from './category.service';

function assertPermission(
  user: any,
  set: { status?: number | string },
  required: string,
) {
  if (!user || !user.permissions?.includes(required)) {
    set.status = 403;
    return { error: `คุณไม่มีสิทธิ์ดำเนินการนี้ (ต้องการ: ${required})` };
  }
  return null;
}

export const categoryController = new Elysia({ prefix: "/categories" })
  .use(requireAuth)

  // การดูหมวดหมู่เปิดให้ทุกคนที่ login แล้วดูได้ (ใช้ตอนเลือก category ใน dropdown ของฟอร์ม)
  .get(
    "/",
    async ({ query }) => {
      return categoryService.list({
        contentType: query.contentType as any,
        includeInactive: query.includeInactive === "true",
      });
    },
    {
      query: t.Object({
        contentType: t.Optional(t.String()),
        includeInactive: t.Optional(t.String()),
      }),
    },
  )

  .get(
    "/:id",
    async ({ params, set }) => {
      try {
        return await categoryService.getById(params.id);
      } catch (err) {
        return handleError(err, set);
      }
    },
    { params: t.Object({ id: t.String() }) },
  )

  .post(
    "/",
    async ({ body, user, set }) => {
      const permissionError = assertPermission(user, set, "category.manage");
      if (permissionError) return permissionError;

      try {
        set.status = 201;
        return await categoryService.create(body as any);
      } catch (err) {
        return handleError(err, set);
      }
    },
    {
      body: t.Object({
        name: t.String({ minLength: 1 }),
        contentType: t.Union([
          t.Literal("LANDING_PAGE"),
          t.Literal("BLOG_POST"),
        ]),
        parentId: t.Optional(t.String()),
        sortOrder: t.Optional(t.Number()),
      }),
    },
  )

  .patch(
    "/:id",
    async ({ params, body, user, set }) => {
      const permissionError = assertPermission(user, set, "category.manage");
      if (permissionError) return permissionError;

      try {
        return await categoryService.update(params.id, body);
      } catch (err) {
        return handleError(err, set);
      }
    },
    {
      params: t.Object({ id: t.String() }),
      body: t.Object({
        name: t.Optional(t.String({ minLength: 1 })),
        parentId: t.Optional(t.Nullable(t.String())),
        sortOrder: t.Optional(t.Number()),
        isActive: t.Optional(t.Boolean()),
      }),
    },
  )

  .delete(
    "/:id",
    async ({ params, user, set }) => {
      const permissionError = assertPermission(user, set, "category.manage");
      if (permissionError) return permissionError;

      try {
        await categoryService.delete(params.id);
        return { message: "ลบหมวดหมู่สำเร็จ" };
      } catch (err) {
        return handleError(err, set);
      }
    },
    { params: t.Object({ id: t.String() }) },
  );

function handleError(err: unknown, set: { status?: number | string }) {
  if (err instanceof CategoryError) {
    set.status = err.status;
    return { error: err.message };
  }
  throw err;
}
