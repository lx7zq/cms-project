export interface ICategory {
  id: string
  name: string
  slug: string
  contentType: 'LANDING_PAGE' | 'BLOG_POST'
  parentId?: string
  isActive: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface ICategoryView extends Omit<ICategory, 'createdAt'> {
  createdAt: Date | string
}

export interface ICreateCategoryPayload {
  name: string
  contentType: 'LANDING_PAGE' | 'BLOG_POST'
  parentId?: string
  sortOrder?: number
}

export interface IUpdateCategoryPayload {
  name?: string
  parentId?: string | null
  sortOrder?: number
  isActive?: boolean
}
