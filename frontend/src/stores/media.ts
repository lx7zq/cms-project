import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { IMediaFile } from '@/models/media.model'
import MediaProvider from '@/resources/providers/media.provider'

const mediaProvider = new MediaProvider()

export const useMediaStore = defineStore('media', () => {
  const files = ref<IMediaFile[]>([])
  const total = ref(0)
  const page = ref(1)
  const loading = ref(false)
  const fileTypeFilter = ref('')

  async function fetchFiles() {
    loading.value = true
    try {
      const data = await mediaProvider.getAll({
        fileType: fileTypeFilter.value || undefined,
        page: page.value,
      })
      files.value = data.data ?? data
      total.value = data.total ?? files.value.length
    } finally {
      loading.value = false
    }
  }

  async function uploadImage(file: File, altText?: string, caption?: string) {
    await mediaProvider.uploadImage(file, altText, caption)
    await fetchFiles()
  }

  async function uploadFile(file: File) {
    await mediaProvider.uploadFile(file)
    await fetchFiles()
  }

  async function deleteFile(id: string) {
    await mediaProvider.delete(id)
    await fetchFiles()
  }

  function setPage(p: number) {
    page.value = p
    fetchFiles()
  }

  function setFileTypeFilter(t: string) {
    fileTypeFilter.value = t
    page.value = 1
    fetchFiles()
  }

  return {
    files, total, page, loading, fileTypeFilter,
    fetchFiles, uploadImage, uploadFile, deleteFile, setPage, setFileTypeFilter,
  }
})
