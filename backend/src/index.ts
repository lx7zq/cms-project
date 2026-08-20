import { Elysia } from 'elysia';

import { cors } from '@elysiajs/cors';
import { staticPlugin } from '@elysiajs/static';
import { swagger } from '@elysiajs/swagger';

import { authController } from './modules/auth/auth.controller';
import { blogPostController } from './modules/blog-posts/blog-post.controller';
import { categoryController } from './modules/categories/category.controller';
import {
  landingPageController,
} from './modules/landing-pages/landing-page.controller';
import { mediaController } from './modules/media/media.controller';
import { roleController } from './modules/roles/role.controller';
import { tagController } from './modules/tags/tag.controller';
import { userController } from './modules/users/user.controller';

const app = new Elysia()
  .use(cors())
  .use(staticPlugin({ prefix: "/uploads", assets: "uploads" }))
  .use(
    swagger({
      path: "/docs",
      documentation: {
        info: { title: "CMS API", version: "1.0.0" },
        tags: [
          { name: "Auth", description: "Login, logout, password management" },
          { name: "Users", description: "User management" },
          { name: "Roles", description: "Roles and permissions" },
          { name: "Landing Pages", description: "Landing page CRUD and workflow" },
          { name: "Blog Posts", description: "Blog post CRUD and workflow" },
          { name: "Categories", description: "Category management" },
          { name: "Tags", description: "Tag management" },
          { name: "Media", description: "Media and file upload" },
        ],
      },
    }),
  )
  .use(authController)
  .use(userController)
  .use(roleController)
  .use(landingPageController)
  .use(blogPostController)
  .use(categoryController)
  .use(tagController)
  .use(mediaController)
  .get("/health", () => ({ status: "ok" }))
  .listen(process.env.PORT ?? 3000);

console.log(`🚀 Server running at http://localhost:${app.server?.port}`);
console.log(`📄 API Docs at http://localhost:${app.server?.port}/docs`);
