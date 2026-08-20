# CMS Project - Notes

> ไฟล์นี้เก็บ context สำคัญของโปรเจค เพื่อให้ AI agent รู้สถานะล่าสุดเมื่อเริ่ม session ใหม่
> อัพเดทล่าสุด: 2026-08-21

---

## 📁 Project Structure

```
cms-project/
├── backend/          # Bun + ElysiaJS + Prisma (PostgreSQL)
├── frontend/         # Vue 3 + Vite + Pinia + TailwindCSS
└── .github/workflows/ # GitHub Actions CI/CD
```

## 🔧 Tech Stack

| Layer | Technology |
|-------|------------|
| Runtime | Bun |
| Backend Framework | ElysiaJS |
| ORM | Prisma (with `@prisma/adapter-pg`) |
| Database | PostgreSQL (Supabase) |
| Frontend Framework | Vue 3 (Composition API) |
| State Management | Pinia |
| HTTP Client | Axios |
| CSS | TailwindCSS |
| Router | Vue Router |
| CI/CD | GitHub Actions |

## 🗄️ Database

- **Provider**: Supabase (PostgreSQL)
- **Project ID**: `yffuvlywkieimaowjbil`
- **Host**: `db.yffuvlywkieimaowjbil.supabase.co`
- **Port**: 5432
- **DATABASE_URL format**: `postgresql://postgres:PASSWORD@db.yffuvlywkieimaowjbil.supabase.co:5432/postgres`
- **⚠️ ยังไม่ได้รัน Prisma migration** — ต้อง migrate ก่อนใช้งาน

## 🚀 API Endpoints (Backend)

| Module | Prefix | Auth Required |
|--------|--------|---------------|
| Auth | `/auth` | No (login), Yes (me, change-password) |
| Users | `/users` | `user.manage` permission |
| Roles | `/roles` | `role.manage` permission |
| Landing Pages | `/landing-pages` | `landing_page.view/create/edit/publish/delete` |
| Blog Posts | `/blog-posts` | `blog.view/create/edit/publish/delete` |
| Categories | `/categories` | `requireAuth` (no specific permission) |
| Tags | `/tags` | `requireAuth` |
| Media | `/media` | `media.manage` permission |
| Health | `/health` | No |
| Docs | `/docs` | No (Swagger UI) |

## 📡 Frontend → Backend Connection

- **Vite Proxy**: `/api` → `http://localhost:3000` (dev mode)
- **Production**: Set `VITE_APP_API_URL` env var

## 🔑 Providers (Frontend → API)

| Provider | File | Methods |
|----------|------|---------|
| AuthProvider | `auth.provider.ts` | login, getMe, logout, refreshToken, changePassword, forgotPassword, resetPassword |
| UsersProvider | `users.provider.ts` | getAll, getById, create, update, delete |
| RolesProvider | `roles.provider.ts` | getAll, getById, create, update, delete, getPermissions |
| LandingPagesProvider | `landing-pages.provider.ts` | getAll, getById, create, update, delete, duplicate, publish, unpublish, archive, restore, togglePublic |
| BlogPostsProvider | `blog-posts.provider.ts` | getAll, getById, create, update, delete, duplicate, publish, unpublish, archive, restore |
| CategoriesProvider | `categories.provider.ts` | getAll, getById, create, update, delete |
| TagsProvider | `tags.provider.ts` | getAll, getById, create, update, delete |
| MediaProvider | `media.provider.ts` | getAll, uploadImage, uploadFile, delete |
| DashboardProvider | `dashboard.provider.ts` | getStats |

## 🐛 Known Bugs Fixed (Session 2026-08-21)

### 1. Provider Stack Overflow (CRITICAL)
- **ปัญหา**: ทุก Provider ที่มี `delete()` method ทำ `this.delete(...)` → infinite recursion
- **แก้ไข**: เปลี่ยนเป็น `super.delete(...)` ทุก file (7 providers)
- **ไฟล์ที่แก้**: blog-posts, categories, landing-pages, media, roles, tags, users providers

### 2. Interceptors.ts - Missing axios import
- **ปัญหา**: `import type { AxiosError... }` — ไม่ได้ import value ทำให้ refresh token logic ไม่ทำงาน
- **แก้ไข**: เปลี่ยนเป็น `import axios, { type AxiosError... }`

### 3. Dashboard Stats Showing 0
- **ปัญหา**: Dashboard provider access `.total` ผิด format (จริงอยู่ใน `.pagination.total`)
- **แก้ไข**: แก้ response format parsing + เพิ่ม error handling

### 4. Prisma DeprecationWarning
- **ปัญหา**: `Calling client.query() when client is already executing a query`
- **แก้ไข**: เปลี่ยนจาก single connection เป็น connection pool (`pg.Pool`)

## 🧪 Testing

- **Backend**: `bun test` (24 tests passing)
  - `src/lib/slug.test.ts` — Slug utilities
  - `src/modules/landing-pages/landing-page.service.test.ts` — Landing page CRUD
  - `src/modules/categories/category.service.test.ts` — Category CRUD
- **Frontend**: `npx vue-tsc --noEmit` (TypeScript check)

## 📋 Git Branches

| Branch | Purpose | Status |
|--------|---------|--------|
| `main` | Production | ✅ Up to date |
| `dev` | Development | ✅ Up to date |
| `feat/fix-providers-dashboard-prisma` | Fix providers + dashboard + prisma | ✅ Merged |
| `ci/github-actions-deploy` | CI/CD workflows | ✅ Merged |

## 📦 GitHub Actions Workflows

1. **deploy.yml** — Deploy backend + frontend via SSH
2. **deploy-frontend-pages.yml** — Deploy frontend to GitHub Pages

### Required GitHub Secrets (ยังไม่ได้ตั้งค่า)
- `DATABASE_URL` — PostgreSQL connection string
- `SERVER_HOST` — Server hostname
- `SERVER_USER` — SSH username
- `SERVER_SSH_KEY` — SSH private key
- `API_BASE_URL` — Backend API URL for frontend

## ⚠️ TODO / ยังไม่ได้ทำ

1. **รัน Prisma migration** — ต้อง migrate schema ลง Supabase database
2. **ตั้งค่า GitHub Secrets** — สำหรับ deployment
3. **สร้าง server/backend hosting** — Railway หรือ VPS
4. **ตั้งค่า Vercel** — สำหรับ frontend
5. **Page Views API** — ยังไม่มี endpoint แยก (hardcoded เป็น 0)
6. **Email service** — Forgot password ยัง mock อยู่ (return token ตรงๆ)

## 💡 Architecture Notes

### Backend Pattern
- Controller → Service → Prisma
- Auth: JWT (access + refresh token)
- Permissions: role-based (permission key เช่น `landing_page.create`)
- Soft delete: ใช้ `deletedAt` field (ไม่ hard delete)

### Frontend Pattern
- Provider (API calls) → Store (state) → Component (UI)
- Interceptors: auto-attach token, auto-refresh on 401
- Router guards: redirect to login if not authenticated

### Prisma Setup
- Uses `@prisma/adapter-pg` with connection pool (not single connection)
- Generated client: `backend/generated/prisma/`
- Schema: `backend/prisma/schema.prisma`
