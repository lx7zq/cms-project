import HttpRequest from '../HttpRequest'

export interface IDashboardStats {
  landingPages: number
  users: number
  pageViews: number
  categories: number
}

class DashboardProvider extends HttpRequest {
  public async getStats(): Promise<IDashboardStats> {
    try {
      const [landingPages, users, categories] = await Promise.all([
        this.get('/landing-pages', { pageSize: 1 }).catch((e) => {
          console.error('[Dashboard] Failed to fetch landing pages:', e)
          return { pagination: { total: 0 } }
        }),
        this.get('/users', { pageSize: 1 }).catch((e) => {
          console.error('[Dashboard] Failed to fetch users:', e)
          return { pagination: { total: 0 } }
        }),
        this.get('/categories', {}).catch((e) => {
          console.error('[Dashboard] Failed to fetch categories:', e)
          return []
        }),
      ])

      // Landing Pages: { data: [...], pagination: { total, ... } }
      const landingPagesCount = landingPages.pagination?.total ?? landingPages.total ?? 0

      // Users: { data: [...], total, pagination: { ... } }
      const usersCount = users.pagination?.total ?? users.total ?? 0

      // Categories: returns array directly or { data: [...] }
      const categoriesCount = Array.isArray(categories)
        ? categories.length
        : (categories.pagination?.total ?? categories.total ?? categories.data?.length ?? 0)

      return {
        landingPages: landingPagesCount,
        users: usersCount,
        pageViews: 0,
        categories: categoriesCount,
      }
    } catch (e) {
      console.error('[Dashboard] Error fetching stats:', e)
      return { landingPages: 0, users: 0, pageViews: 0, categories: 0 }
    }
  }
}

export default DashboardProvider
