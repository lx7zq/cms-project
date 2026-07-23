import {
  Elysia,
  t,
} from 'elysia';

import { requirePermission } from '../../middleware/permission.guard';
import {
  UserError,
  userService,
} from './user.service';

export const userController = new Elysia({ prefix: "/users" })
  .use(requirePermission("user.manage"))

  // ---------- LIST (with search + pagination) ----------
  .get(
    "/",
    async ({ query }) => {
      return userService.list({
        search: query.search,
        page: query.page ? Number(query.page) : undefined,
        pageSize: query.pageSize ? Number(query.pageSize) : undefined,
      });
    },
    {
      query: t.Object({
        search: t.Optional(t.String()),
        page: t.Optional(t.String()),
        pageSize: t.Optional(t.String()),
      }),
    },
  )

  // ---------- GET BY ID ----------
  .get(
    "/:id",
    async ({ params, set }) => {
      try {
        return await userService.getById(params.id);
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
        return await userService.create(body);
      } catch (err) {
        return handleError(err, set);
      }
    },
    {
      body: t.Object({
        email: t.String({ format: "email" }),
        password: t.String({ minLength: 8 }),
        name: t.String({ minLength: 1 }),
        roleIds: t.Array(t.String(), { minItems: 1 }),
      }),
    },
  )

  // ---------- UPDATE ----------
  .patch(
    "/:id",
    async ({ params, body, set }) => {
      try {
        return await userService.update(params.id, body);
      } catch (err) {
        return handleError(err, set);
      }
    },
    {
      params: t.Object({ id: t.String() }),
      body: t.Object({
        name: t.Optional(t.String({ minLength: 1 })),
        email: t.Optional(t.String({ format: "email" })),
        avatarUrl: t.Optional(t.String()),
      }),
    },
  )

  // ---------- ACTIVATE / SUSPEND ----------
  .patch(
    "/:id/status",
    async ({ params, body, set }) => {
      try {
        return await userService.setActive(params.id, body.isActive);
      } catch (err) {
        return handleError(err, set);
      }
    },
    {
      params: t.Object({ id: t.String() }),
      body: t.Object({ isActive: t.Boolean() }),
    },
  )

  // ---------- ASSIGN ROLES ----------
  .put(
    "/:id/roles",
    async ({ params, body, set }) => {
      try {
        return await userService.assignRoles(params.id, body.roleIds);
      } catch (err) {
        return handleError(err, set);
      }
    },
    {
      params: t.Object({ id: t.String() }),
      body: t.Object({ roleIds: t.Array(t.String()) }),
    },
  )

  // ---------- DELETE (soft delete = suspend) ----------
  .delete(
    "/:id",
    async ({ params, user, set }) => {
      try {
        await userService.delete(params.id, user!.id);
        return { message: "ระงับบัญชีผู้ใช้งานสำเร็จ" };
      } catch (err) {
        return handleError(err, set);
      }
    },
    { params: t.Object({ id: t.String() }) },
  );

function handleError(err: unknown, set: { status?: number | string }) {
  if (err instanceof UserError) {
    set.status = err.status;
    return { error: err.message };
  }
  throw err;
}
