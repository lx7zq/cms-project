import type { RouteRecordRaw } from 'vue-router'

const categories: RouteRecordRaw = {
  path: 'categories',
  name: 'Categories',
  component: () => import('@/pages/categories/Categories.vue'),
  meta: { permission: 'category.manage' },
  children: [
    {
      path: '',
      name: 'CategoriesMain',
      component: () => import('@/pages/categories/pages/CategoryListPage.vue'),
    },
  ],
}

export default categories
