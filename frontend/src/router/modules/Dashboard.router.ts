import type { RouteRecordRaw } from 'vue-router'

const dashboard: RouteRecordRaw = {
  path: 'dashboard',
  name: 'Dashboard',
  component: () => import('@/pages/dashboard/pages/DashboardMain.vue'),
}

export default dashboard
