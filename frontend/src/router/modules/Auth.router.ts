import type { RouteRecordRaw } from 'vue-router'

const auth: RouteRecordRaw = {
  path: '/login',
  name: 'Login',
  component: () => import('@/pages/auth/pages/LoginPage.vue'),
  meta: { guest: true },
}

export default auth
