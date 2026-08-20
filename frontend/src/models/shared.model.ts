export type ContentStatus = 'DRAFT' | 'PRIVATE' | 'PUBLIC' | 'ARCHIVE' | 'SCHEDULED_PUBLISH' | 'SCHEDULED_UNPUBLISH' | 'EXPIRED'

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}
