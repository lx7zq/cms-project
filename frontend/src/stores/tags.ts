import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ITag } from '@/models/tag.model'
import TagsProvider from '@/resources/providers/tags.provider'

const tagsProvider = new TagsProvider()

export const useTagsStore = defineStore('tags', () => {
  const tags = ref<ITag[]>([])
  const loading = ref(false)

  async function fetchTags() {
    loading.value = true
    try {
      const data = await tagsProvider.getAll()
      tags.value = data
    } finally {
      loading.value = false
    }
  }

  async function createTag(data: { name: string }) {
    await tagsProvider.create(data)
    await fetchTags()
  }

  async function updateTag(id: string, data: { name?: string }) {
    await tagsProvider.update(id, data)
    await fetchTags()
  }

  async function deleteTag(id: string) {
    await tagsProvider.delete(id)
    await fetchTags()
  }

  return { tags, loading, fetchTags, createTag, updateTag, deleteTag }
})
