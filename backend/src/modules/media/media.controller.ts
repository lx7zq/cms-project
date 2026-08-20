import { Elysia, t } from "elysia";

import { requireAuth } from "../../middleware/auth.guard";
import { MediaError, mediaService } from "./media.service";

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

export const mediaController = new Elysia({ prefix: "/media" })
  .use(requireAuth)

  // ── LIST MEDIA FILES ──
  .get(
    "/",
    async ({ query, user, set }) => {
      const permissionError = assertPermission(user, set, "media.manage");
      if (permissionError) return permissionError;

      return mediaService.list({
        fileType: query.fileType,
        page: query.page ? Number(query.page) : undefined,
        pageSize: query.pageSize ? Number(query.pageSize) : undefined,
      });
    },
    {
      query: t.Object({
        fileType: t.Optional(t.String()),
        page: t.Optional(t.String()),
        pageSize: t.Optional(t.String()),
      }),
    },
  )

  // ── UPLOAD IMAGE ──
  .post(
    "/upload-image",
    async ({ body, user, set }) => {
      const permissionError = assertPermission(user, set, "media.manage");
      if (permissionError) return permissionError;

      try {
        set.status = 201;
        return await mediaService.uploadImage(body.file, user!.id, body.altText, body.caption);
      } catch (err) {
        return handleError(err, set);
      }
    },
    {
      body: t.Object({
        file: t.File(),
        altText: t.Optional(t.String()),
        caption: t.Optional(t.String()),
      }),
    },
  )

  // ── UPLOAD FILE ──
  .post(
    "/upload-file",
    async ({ body, user, set }) => {
      const permissionError = assertPermission(user, set, "media.manage");
      if (permissionError) return permissionError;

      try {
        set.status = 201;
        return await mediaService.uploadFile(body.file, user!.id);
      } catch (err) {
        return handleError(err, set);
      }
    },
    {
      body: t.Object({
        file: t.File(),
      }),
    },
  )

  // ── DELETE MEDIA ──
  .delete(
    "/:id",
    async ({ params, user, set }) => {
      const permissionError = assertPermission(user, set, "media.manage");
      if (permissionError) return permissionError;

      try {
        await mediaService.deleteMedia(params.id);
        return { message: "ลบไฟล์สำเร็จ" };
      } catch (err) {
        return handleError(err, set);
      }
    },
    { params: t.Object({ id: t.String() }) },
  );

function handleError(err: unknown, set: { status?: number | string }) {
  if (err instanceof MediaError) {
    set.status = err.status;
    return { error: err.message };
  }
  throw err;
}
