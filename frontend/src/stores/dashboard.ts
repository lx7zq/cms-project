import { defineStore } from 'pinia'
import { ref } from 'vue'
import DashboardProvider, { type IDashboardStats } from '@/resources/providers/dashboard.provider'

const dashboardProvider = new DashboardProvider()

export const useDashboardStore = defineStore('dashboard', () => {
  const stats = ref<IDashboardStats>({
    landingPages: 0,
    users: 0,
    pageViews: 0,
    categories: 0,
  })
  const loading = ref(false)

  async function fetchStats() {
    loading.value = true
    try {
      stats.value = await dashboardProvider.getStats()
    } catch (e) {
      console.error('[Dashboard Store] Error fetching stats:', e)
    } finally {
      loading.value = false
    }
  }

  return { stats, loading, fetchStats }
})
