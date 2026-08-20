import type { RouteRecordRaw } from 'vue-router'

const media: RouteRecordRaw = {
  path: 'media',
  name: 'MediaLibrary',
  component: () => import('@/pages/media/Media.vue'),
  meta: { permission: 'media.manage' },
  children: [
    {
      path: '',
      name: 'MediaMain',
      component: () => import('@/pages/media/pages/MediaLibraryPage.vue'),
    },
  ],
}

export default media
