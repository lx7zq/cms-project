import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ICategory } from '@/models/category.model'
import CategoriesProvider from '@/resources/providers/categories.provider'

const categoriesProvider = new CategoriesProvider()

export const useCategoriesStore = defineStore('categories', () => {
  const categories = ref<ICategory[]>([])
  const loading = ref(false)

  async function fetchCategories(contentType?: string) {
    loading.value = true
    try {
      const data = await categoriesProvider.getAll(
        contentType ? { contentType } : {},
      )
      categories.value = data
    } finally {
      loading.value = false
    }
  }

  async function createCategory(payload: { name: string; contentType: 'LANDING_PAGE' | 'BLOG_POST'; parentId?: string }) {
    await categoriesProvider.create(payload)
    await fetchCategories(payload.contentType)
  }

  async function updateCategory(id: string, payload: { name?: string; parentId?: string | null; isActive?: boolean }) {
    await categoriesProvider.update(id, payload)
    await fetchCategories()
  }

  async function deleteCategory(id: string) {
    await categoriesProvider.delete(id)
    await fetchCategories()
  }

  return {
    categories, loading,
    fetchCategories, createCategory, updateCategory, deleteCategory,
  }
})
