import {
  Elysia,
  t,
} from 'elysia';

import { requireAuth } from '../../middleware/auth.guard';
import {
  LandingPageError,
  landingPageService,
} from './landing-page.service';

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

export const landingPageController = new Elysia({ prefix: "/landing-pages" })
  .use(requireAuth)

  .get(
    "/",
    async ({ query, user, set }) => {
      const permissionError = assertPermission(user, set, "landing_page.view");
      if (permissionError) return permissionError;

      return landingPageService.list({
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

  .get(
    "/:id",
    async ({ params, user, set }) => {
      const permissionError = assertPermission(user, set, "landing_page.view");
      if (permissionError) return permissionError;

      try {
        return await landingPageService.getById(params.id);
      } catch (err) {
        return handleError(err, set);
      }
    },
    {
      params: t.Object({ id: t.String() }),
    },
  )

  .post(
    "/",
    async ({ body, user, set }) => {
      const permissionError = assertPermission(
        user,
        set,
        "landing_page.create",
      );
      if (permissionError) return permissionError;

      try {
        set.status = 201;
        return await landingPageService.create({
          ...body,
          userId: user!.id,
        });
      } catch (err) {
        return handleError(err, set);
      }
    },
    {
      body: t.Object({
        title: t.String({ minLength: 1 }),
        content: t.String(),
        shortDescription: t.Optional(t.String()),
        description: t.Optional(t.String()),
        banner: t.Optional(t.String()),
        thumbnail: t.Optional(t.String()),
        coverImage: t.Optional(t.String()),
        status: t.Optional(t.String()),
        isPublic: t.Optional(t.Boolean()),
        publishDate: t.Optional(t.String()),
        expireDate: t.Optional(t.String()),
        privateAccessType: t.Optional(t.String()),
        pagePassword: t.Optional(t.String()),
        privateLinkToken: t.Optional(t.String()),
        seo: t.Optional(
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
        ),
        categoryIds: t.Optional(t.Array(t.String())),
        tagIds: t.Optional(t.Array(t.String())),
      }),
    },
  )

  .patch(
    "/:id",
    async ({ params, body, user, set }) => {
      const permissionError = assertPermission(user, set, "landing_page.edit");
      if (permissionError) return permissionError;

      try {
        return await landingPageService.update(params.id, {
          ...body,
          userId: user!.id,
        });
      } catch (err) {
        return handleError(err, set);
      }
    },
    {
      params: t.Object({ id: t.String() }),
      body: t.Object({
        title: t.Optional(t.String({ minLength: 1 })),
        content: t.Optional(t.String()),
        shortDescription: t.Optional(t.String()),
        description: t.Optional(t.String()),
        banner: t.Optional(t.String()),
        thumbnail: t.Optional(t.String()),
        coverImage: t.Optional(t.String()),
        status: t.Optional(t.String()),
        isPublic: t.Optional(t.Boolean()),
        publishDate: t.Optional(t.String()),
        expireDate: t.Optional(t.String()),
        privateAccessType: t.Optional(t.String()),
        pagePassword: t.Optional(t.String()),
        privateLinkToken: t.Optional(t.String()),
        seo: t.Optional(
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
        ),
        categoryIds: t.Optional(t.Array(t.String())),
        tagIds: t.Optional(t.Array(t.String())),
      }),
    },
  )

  .post(
    "/:id/duplicate",
    async ({ params, user, set }) => {
      const permissionError = assertPermission(
        user,
        set,
        "landing_page.create",
      );
      if (permissionError) return permissionError;

      try {
        set.status = 201;
        return await landingPageService.duplicate(params.id, user!.id);
      } catch (err) {
        return handleError(err, set);
      }
    },
    {
      params: t.Object({ id: t.String() }),
    },
  )

  .patch(
    "/:id/publish",
    async ({ params, user, set }) => {
      const permissionError = assertPermission(
        user,
        set,
        "landing_page.publish",
      );
      if (permissionError) return permissionError;

      try {
        return await landingPageService.setStatus(
          params.id,
          "PUBLIC",
          user!.id,
        );
      } catch (err) {
        return handleError(err, set);
      }
    },
    {
      params: t.Object({ id: t.String() }),
    },
  )

  .patch(
    "/:id/unpublish",
    async ({ params, user, set }) => {
      const permissionError = assertPermission(
        user,
        set,
        "landing_page.publish",
      );
      if (permissionError) return permissionError;

      try {
        return await landingPageService.setStatus(params.id, "DRAFT", user!.id);
      } catch (err) {
        return handleError(err, set);
      }
    },
    {
      params: t.Object({ id: t.String() }),
    },
  )

  .patch(
    "/:id/archive",
    async ({ params, user, set }) => {
      const permissionError = assertPermission(user, set, "landing_page.edit");
      if (permissionError) return permissionError;

      try {
        return await landingPageService.setStatus(
          params.id,
          "ARCHIVE",
          user!.id,
        );
      } catch (err) {
        return handleError(err, set);
      }
    },
    {
      params: t.Object({ id: t.String() }),
    },
  )

  .patch(
    "/:id/public-toggle",
    async ({ params, body, user, set }) => {
      const permissionError = assertPermission(
        user,
        set,
        "landing_page.publish",
      );
      if (permissionError) return permissionError;

      try {
        return await landingPageService.togglePublic(
          params.id,
          body.isPublic,
          user!.id,
        );
      } catch (err) {
        return handleError(err, set);
      }
    },
    {
      params: t.Object({ id: t.String() }),
      body: t.Object({ isPublic: t.Boolean() }),
    },
  )

  .delete(
    "/:id",
    async ({ params, user, set }) => {
      const permissionError = assertPermission(
        user,
        set,
        "landing_page.delete",
      );
      if (permissionError) return permissionError;

      try {
        return await landingPageService.delete(params.id);
      } catch (err) {
        return handleError(err, set);
      }
    },
    {
      params: t.Object({ id: t.String() }),
    },
  );

function handleError(err: unknown, set: { status?: number | string }) {
  if (err instanceof LandingPageError) {
    set.status = err.status;
    return { error: err.message };
  }

  throw err;
}
