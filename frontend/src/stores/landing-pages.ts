import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ILandingPage } from '@/models/landing-page.model'
import LandingPagesProvider from '@/resources/providers/landing-pages.provider'

const landingPagesProvider = new LandingPagesProvider()

export const useLandingPagesStore = defineStore('landingPages', () => {
  const pages = ref<ILandingPage[]>([])
  const total = ref(0)
  const page = ref(1)
  const pageSize = ref(20)
  const loading = ref(false)
  const search = ref('')
  const statusFilter = ref('')

  async function fetchPages() {
    loading.value = true
    try {
      const data = await landingPagesProvider.getAll({
        search: search.value || undefined,
        status: statusFilter.value || undefined,
        page: page.value,
        pageSize: pageSize.value,
      })
      pages.value = data.data ?? data
      total.value = data.total ?? pages.value.length
    } finally {
      loading.value = false
    }
  }

  async function getPage(id: string) {
    const data = await landingPagesProvider.getById(id)
    return data.data ?? data
  }

  async function createPage(payload: Partial<ILandingPage> & { title: string; content: string }) {
    await landingPagesProvider.create(payload)
    await fetchPages()
  }

  async function updatePage(id: string, payload: Partial<ILandingPage>) {
    await landingPagesProvider.update(id, payload)
  }

  async function duplicatePage(id: string) {
    await landingPagesProvider.duplicate(id)
    await fetchPages()
  }

  async function publishPage(id: string) {
    await landingPagesProvider.publish(id)
    await fetchPages()
  }

  async function unpublishPage(id: string) {
    await landingPagesProvider.unpublish(id)
    await fetchPages()
  }

  async function archivePage(id: string) {
    await landingPagesProvider.archive(id)
    await fetchPages()
  }

  async function deletePage(id: string) {
    await landingPagesProvider.delete(id)
    await fetchPages()
  }

  async function restorePage(id: string) {
    await landingPagesProvider.restore(id)
    await fetchPages()
  }

  function setPage(p: number) {
    page.value = p
    fetchPages()
  }

  function setSearch(s: string) {
    search.value = s
    page.value = 1
    fetchPages()
  }

  function setStatusFilter(s: string) {
    statusFilter.value = s
    page.value = 1
    fetchPages()
  }

  return {
    pages, total, page, pageSize, loading, search, statusFilter,
    fetchPages, getPage, createPage, updatePage, duplicatePage,
    publishPage, unpublishPage, archivePage, deletePage, restorePage,
    setPage, setSearch, setStatusFilter,
  }
})
