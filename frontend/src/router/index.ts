import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

import AuthRouter from './modules/Auth.router'
import BlogPostsRouter from './modules/BlogPosts.router'
import CategoriesRouter from './modules/Categories.router'
import DashboardRouter from './modules/Dashboard.router'
import LandingPagesRouter from './modules/LandingPages.router'
import MediaRouter from './modules/Media.router'
import RolesRouter from './modules/Roles.router'
import TagsRouter from './modules/Tags.router'
import UsersRouter from './modules/Users.router'

const routes: RouteRecordRaw[] = [
  AuthRouter,
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: () => import('@/pages/auth/pages/ForgotPasswordPage.vue'),
    meta: { guest: true },
  },
  {
    path: '/reset-password',
    name: 'ResetPassword',
    component: () => import('@/pages/auth/pages/ResetPasswordPage.vue'),
    meta: { guest: true },
  },
  {
    path: '/',
    component: () => import('@/layouts/DefaultLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: '/dashboard' },
      DashboardRouter,
      UsersRouter,
      RolesRouter,
      LandingPagesRouter,
      BlogPostsRouter,
      CategoriesRouter,
      TagsRouter,
      MediaRouter,
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/dashboard',
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(): { top: number } {
    return { top: 0 }
  },
})

// Auth Guard
router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('accessToken')
  const requiresAuth = to.meta.requiresAuth !== false
  const isGuest = to.meta.guest === true

  // ถ้า route ต้อง auth แต่ไม่มี token -> ไป login
  if (requiresAuth && !token && to.name !== 'Login') {
    next({ name: 'Login', query: { redirect: to.fullPath } })
    return
  }

  // ถ้ามี token แล้วพยายาม ไป login -> ไป dashboard
  if (token && isGuest) {
    next({ name: 'Dashboard' })
    return
  }

  next()
})

export default router
