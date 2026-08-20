import type { RouteRecordRaw } from 'vue-router'

const users: RouteRecordRaw = {
  path: 'users',
  name: 'Users',
  component: () => import('@/pages/users/Users.vue'),
  meta: { permission: 'user.manage' },
  children: [
    {
      path: '',
      name: 'UsersMain',
      component: () => import('@/pages/users/pages/UserListPage.vue'),
    },
    {
      path: 'create',
      name: 'UserCreate',
      component: () => import('@/pages/users/pages/UserFormPage.vue'),
    },
    {
      path: ':id/edit',
      name: 'UserEdit',
      component: () => import('@/pages/users/pages/UserFormPage.vue'),
    },
  ],
}

export default users
