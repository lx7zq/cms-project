import type { RouteRecordRaw } from 'vue-router'

const blogPosts: RouteRecordRaw = {
  path: 'blog-posts',
  name: 'BlogPosts',
  component: () => import('@/pages/blog-posts/BlogPosts.vue'),
  meta: { permission: 'blog.view' },
  children: [
    {
      path: '',
      name: 'BlogPostsMain',
      component: () => import('@/pages/blog-posts/pages/BlogPostList.vue'),
    },
    {
      path: 'create',
      name: 'BlogPostCreate',
      component: () => import('@/pages/blog-posts/pages/BlogPostForm.vue'),
    },
    {
      path: ':id/edit',
      name: 'BlogPostEdit',
      component: () => import('@/pages/blog-posts/pages/BlogPostForm.vue'),
    },
  ],
}

export default blogPosts
