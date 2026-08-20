import type { RouteRecordRaw } from 'vue-router'

const landingPages: RouteRecordRaw = {
  path: 'landing-pages',
  name: 'LandingPages',
  component: () => import('@/pages/landing-pages/LandingPages.vue'),
  meta: { permission: 'landing_page.view' },
  children: [
    {
      path: '',
      name: 'LandingPagesMain',
      component: () => import('@/pages/landing-pages/pages/LandingPageList.vue'),
    },
    {
      path: 'create',
      name: 'LandingPageCreate',
      component: () => import('@/pages/landing-pages/pages/LandingPageForm.vue'),
    },
    {
      path: ':id/edit',
      name: 'LandingPageEdit',
      component: () => import('@/pages/landing-pages/pages/LandingPageForm.vue'),
    },
  ],
}

export default landingPages
