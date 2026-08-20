import type { RouteRecordRaw } from 'vue-router'

const roles: RouteRecordRaw = {
  path: 'roles',
  name: 'Roles',
  component: () => import('@/pages/roles/Roles.vue'),
  meta: { permission: 'role.manage' },
  children: [
    {
      path: '',
      name: 'RolesMain',
      component: () => import('@/pages/roles/pages/RoleListPage.vue'),
    },
    {
      path: 'create',
      name: 'RoleCreate',
      component: () => import('@/pages/roles/pages/RoleFormPage.vue'),
    },
    {
      path: ':id/edit',
      name: 'RoleEdit',
      component: () => import('@/pages/roles/pages/RoleFormPage.vue'),
    },
  ],
}

export default roles
