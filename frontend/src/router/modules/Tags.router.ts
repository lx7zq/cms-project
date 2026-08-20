import type { RouteRecordRaw } from 'vue-router'

const tags: RouteRecordRaw = {
  path: 'tags',
  name: 'Tags',
  component: () => import('@/pages/tags/Tags.vue'),
  meta: { permission: 'tag.manage' },
  children: [
    {
      path: '',
      name: 'TagsMain',
      component: () => import('@/pages/tags/pages/TagListPage.vue'),
    },
  ],
}

export default tags
