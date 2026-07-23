import { Elysia } from 'elysia';

import { cors } from '@elysiajs/cors';
import { swagger } from '@elysiajs/swagger';

import { authController } from './modules/auth/auth.controller';
import { roleController } from './modules/roles/role.controller';
import { userController } from './modules/users/user.controller';

const app = new Elysia()
  .use(cors())
  .use(
    swagger({
      path: "/docs",
      documentation: {
        info: { title: "CMS API", version: "1.0.0" },
        tags: [
          { name: "Auth", description: "Login, logout, password management" },
        ],
      },
    }),
  )
  .use(authController)
  .use(userController)
  .use(roleController)
  .get("/health", () => ({ status: "ok" }))
  .listen(process.env.PORT ?? 3000);

console.log(`🚀 Server running at http://localhost:${app.server?.port}`);
console.log(`📄 API Docs at http://localhost:${app.server?.port}/docs`);
