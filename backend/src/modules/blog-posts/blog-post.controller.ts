import { Elysia, t } from "elysia";

import { requireAuth } from "../../middleware/auth.guard";
import { BlogPostError, blogPostService } from "./blog-post.service";

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

const seoSchema = t.Optional(
  t.Object({
    metaTitle: t.Optional(t.String()),
    metaDescription: t.Optional(t.String()),
    keyword: t.Optional(t.String()),
    ogTitle: t.Optional(t.String()),
    ogDescription: t.Optional(t.String()),
    ogImage: t.Optional(t.String()),
    canonicalUrl: t.Optional(t.String()),
    robotsIndex: t.Optional(t.Boolean()),
    robotsFollow: t.Optional(t.Boolean()),
  }),
);

export const blogPostController = new Elysia({ prefix: "/blog-posts" })
  .use(requireAuth)

  // ── LIST ──
  .get(
    "/",
    async ({ query, user, set }) => {
      const permissionError = assertPermission(user, set, "blog.view");
      if (permissionError) return permissionError;

      return blogPostService.list({
        search: query.search,
        status: query.status,
        page: query.page ? Number(query.page) : undefined,
        pageSize: query.pageSize ? Number(query.pageSize) : undefined,
      });
    },
    {
      query: t.Object({
        search: t.Optional(t.String()),
        status: t.Optional(t.String()),
        page: t.Optional(t.String()),
        pageSize: t.Optional(t.String()),
      }),
    },
  )

  // ── GET BY ID ──
  .get(
    "/:id",
    async ({ params, user, set }) => {
      const permissionError = assertPermission(user, set, "blog.view");
      if (permissionError) return permissionError;

      try {
        return await blogPostService.getById(params.id);
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
      const permissionError = assertPermission(user, set, "blog.create");
      if (permissionError) return permissionError;

      try {
        set.status = 201;
        return await blogPostService.create({ ...body, userId: user!.id });
      } catch (err) {
        return handleError(err, set);
      }
    },
    {
      body: t.Object({
        title: t.String({ minLength: 1 }),
        content: t.String(),
        excerpt: t.Optional(t.String()),
        description: t.Optional(t.String()),
        thumbnail: t.Optional(t.String()),
        coverImage: t.Optional(t.String()),
        banner: t.Optional(t.String()),
        status: t.Optional(t.String()),
        isPublic: t.Optional(t.Boolean()),
        publishDate: t.Optional(t.String()),
        expireDate: t.Optional(t.String()),
        readingTime: t.Optional(t.Number()),
        isFeatured: t.Optional(t.Boolean()),
        isPinned: t.Optional(t.Boolean()),
        seo: seoSchema,
        categoryIds: t.Optional(t.Array(t.String())),
        tagIds: t.Optional(t.Array(t.String())),
      }),
    },
  )

  // ── UPDATE ──
  .patch(
    "/:id",
    async ({ params, body, user, set }) => {
      const permissionError = assertPermission(user, set, "blog.edit");
      if (permissionError) return permissionError;

      try {
        return await blogPostService.update(params.id, { ...body, userId: user!.id });
      } catch (err) {
        return handleError(err, set);
      }
    },
    {
      params: t.Object({ id: t.String() }),
      body: t.Object({
        title: t.Optional(t.String({ minLength: 1 })),
        content: t.Optional(t.String()),
        excerpt: t.Optional(t.Nullable(t.String())),
        description: t.Optional(t.Nullable(t.String())),
        thumbnail: t.Optional(t.Nullable(t.String())),
        coverImage: t.Optional(t.Nullable(t.String())),
        banner: t.Optional(t.Nullable(t.String())),
        status: t.Optional(t.String()),
        isPublic: t.Optional(t.Boolean()),
        publishDate: t.Optional(t.Nullable(t.String())),
        expireDate: t.Optional(t.Nullable(t.String())),
        readingTime: t.Optional(t.Number()),
        isFeatured: t.Optional(t.Boolean()),
        isPinned: t.Optional(t.Boolean()),
        seo: seoSchema,
        categoryIds: t.Optional(t.Array(t.String())),
        tagIds: t.Optional(t.Array(t.String())),
      }),
    },
  )

  // ── DUPLICATE ──
  .post(
    "/:id/duplicate",
    async ({ params, user, set }) => {
      const permissionError = assertPermission(user, set, "blog.create");
      if (permissionError) return permissionError;

      try {
        set.status = 201;
        return await blogPostService.duplicate(params.id, user!.id);
      } catch (err) {
        return handleError(err, set);
      }
    },
    { params: t.Object({ id: t.String() }) },
  )

  // ── PUBLISH ──
  .patch(
    "/:id/publish",
    async ({ params, user, set }) => {
      const permissionError = assertPermission(user, set, "blog.publish");
      if (permissionError) return permissionError;

      try {
        return await blogPostService.setStatus(params.id, "PUBLIC", user!.id);
      } catch (err) {
        return handleError(err, set);
      }
    },
    { params: t.Object({ id: t.String() }) },
  )

  // ── UNPUBLISH ──
  .patch(
    "/:id/unpublish",
    async ({ params, user, set }) => {
      const permissionError = assertPermission(user, set, "blog.publish");
      if (permissionError) return permissionError;

      try {
        return await blogPostService.setStatus(params.id, "DRAFT", user!.id);
      } catch (err) {
        return handleError(err, set);
      }
    },
    { params: t.Object({ id: t.String() }) },
  )

  // ── ARCHIVE ──
  .patch(
    "/:id/archive",
    async ({ params, user, set }) => {
      const permissionError = assertPermission(user, set, "blog.edit");
      if (permissionError) return permissionError;

      try {
        return await blogPostService.setStatus(params.id, "ARCHIVE", user!.id);
      } catch (err) {
        return handleError(err, set);
      }
    },
    { params: t.Object({ id: t.String() }) },
  )

  // ── DELETE (soft) ──
  .delete(
    "/:id",
    async ({ params, user, set }) => {
      const permissionError = assertPermission(user, set, "blog.delete");
      if (permissionError) return permissionError;

      try {
        await blogPostService.delete(params.id, user!.id);
        return { message: "ลบ Blog Post สำเร็จ" };
      } catch (err) {
        return handleError(err, set);
      }
    },
    { params: t.Object({ id: t.String() }) },
  )

  // ── RESTORE ──
  .patch(
    "/:id/restore",
    async ({ params, user, set }) => {
      const permissionError = assertPermission(user, set, "blog.delete");
      if (permissionError) return permissionError;

      try {
        return await blogPostService.restore(params.id, user!.id);
      } catch (err) {
        return handleError(err, set);
      }
    },
    { params: t.Object({ id: t.String() }) },
  );

function handleError(err: unknown, set: { status?: number | string }) {
  if (err instanceof BlogPostError) {
    set.status = err.status;
    return { error: err.message };
  }
  throw err;
}
