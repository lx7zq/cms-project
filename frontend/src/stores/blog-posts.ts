import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { IBlogPost } from '@/models/blog-post.model'
import BlogPostsProvider from '@/resources/providers/blog-posts.provider'

const blogPostsProvider = new BlogPostsProvider()

export const useBlogPostsStore = defineStore('blogPosts', () => {
  const posts = ref<IBlogPost[]>([])
  const total = ref(0)
  const page = ref(1)
  const pageSize = ref(20)
  const loading = ref(false)
  const search = ref('')
  const statusFilter = ref('')

  async function fetchPosts() {
    loading.value = true
    try {
      const data = await blogPostsProvider.getAll({
        search: search.value || undefined,
        status: statusFilter.value || undefined,
        page: page.value,
        pageSize: pageSize.value,
      })
      posts.value = data.data ?? data
      total.value = data.total ?? posts.value.length
    } finally {
      loading.value = false
    }
  }

  async function getPost(id: string) {
    const data = await blogPostsProvider.getById(id)
    return data.data ?? data
  }

  async function createPost(payload: any) {
    await blogPostsProvider.create(payload)
    await fetchPosts()
  }

  async function updatePost(id: string, payload: any) {
    await blogPostsProvider.update(id, payload)
  }

  async function duplicatePost(id: string) {
    await blogPostsProvider.duplicate(id)
    await fetchPosts()
  }

  async function publishPost(id: string) {
    await blogPostsProvider.publish(id)
    await fetchPosts()
  }

  async function unpublishPost(id: string) {
    await blogPostsProvider.unpublish(id)
    await fetchPosts()
  }

  async function archivePost(id: string) {
    await blogPostsProvider.archive(id)
    await fetchPosts()
  }

  async function deletePost(id: string) {
    await blogPostsProvider.delete(id)
    await fetchPosts()
  }

  function setPage(p: number) {
    page.value = p
    fetchPosts()
  }

  function setSearch(s: string) {
    search.value = s
    page.value = 1
    fetchPosts()
  }

  function setStatusFilter(s: string) {
    statusFilter.value = s
    page.value = 1
    fetchPosts()
  }

  return {
    posts, total, page, pageSize, loading, search, statusFilter,
    fetchPosts, getPost, createPost, updatePost, duplicatePost,
    publishPost, unpublishPost, archivePost, deletePost,
    setPage, setSearch, setStatusFilter,
  }
})
