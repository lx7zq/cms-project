import { Elysia, t } from "elysia";

import { requireAuth } from "../../middleware/auth.guard";
import { TagError, tagService } from "./tag.service";

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

export const tagController = new Elysia({ prefix: "/tags" })
  .use(requireAuth)

  // ── LIST ──
  .get("/", async () => tagService.list())

  // ── GET BY ID ──
  .get(
    "/:id",
    async ({ params, set }) => {
      try {
        return await tagService.getById(params.id);
      } catch (err) {
        return handleError(err, set);
      }
    },
    { params: t.Object({ id: t.String() }) },
  )

  // ── CREATE ──
  .post(
    "/",
    async ({ body, user, set }) => {
      const permissionError = assertPermission(user, set, "tag.manage");
      if (permissionError) return permissionError;

      try {
        set.status = 201;
        return await tagService.create(body);
      } catch (err) {
        return handleError(err, set);
      }
    },
    {
      body: t.Object({
        name: t.String({ minLength: 1 }),
      }),
    },
  )

  // ── UPDATE ──
  .patch(
    "/:id",
    async ({ params, body, user, set }) => {
      const permissionError = assertPermission(user, set, "tag.manage");
      if (permissionError) return permissionError;

      try {
        return await tagService.update(params.id, body);
      } catch (err) {
        return handleError(err, set);
      }
    },
    {
      params: t.Object({ id: t.String() }),
      body: t.Object({
        name: t.Optional(t.String({ minLength: 1 })),
      }),
    },
  )

  // ── DELETE ──
  .delete(
    "/:id",
    async ({ params, user, set }) => {
      const permissionError = assertPermission(user, set, "tag.manage");
      if (permissionError) return permissionError;

      try {
        await tagService.delete(params.id);
        return { message: "ลบ Tag สำเร็จ" };
      } catch (err) {
        return handleError(err, set);
      }
    },
    { params: t.Object({ id: t.String() }) },
  );

function handleError(err: unknown, set: { status?: number | string }) {
  if (err instanceof TagError) {
    set.status = err.status;
    return { error: err.message };
  }
  throw err;
}
