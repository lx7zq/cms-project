import type { ContentStatus } from './shared.model'
import type { ICategoryRef, ISeoInfo, ITagRef } from './landing-page.model'

export interface IBlogPost {
  id: string
  title: string
  slug: string
  excerpt?: string
  description?: string
  thumbnail?: string
  coverImage?: string
  banner?: string
  content: string
  status: ContentStatus
  isPublic: boolean
  publishDate?: string
  expireDate?: string
  readingTime?: number
  isFeatured: boolean
  isPinned: boolean
  viewCount: number
  deletedAt?: string
  createdAt: string
  updatedAt: string
  seo?: ISeoInfo
  categories?: ICategoryRef[]
  tags?: ITagRef[]
}

export interface IBlogPostView extends Omit<IBlogPost, 'createdAt' | 'updatedAt' | 'publishDate' | 'expireDate'> {
  createdAt: Date | string
  updatedAt: Date | string
  publishDate: Date | string | null
  expireDate: Date | string | null
}

export interface ICreateBlogPostPayload {
  title: string
  content: string
  excerpt?: string
  description?: string
  thumbnail?: string
  coverImage?: string
  banner?: string
  status?: string
  isPublic?: boolean
  publishDate?: string
  expireDate?: string
  readingTime?: number
  isFeatured?: boolean
  isPinned?: boolean
  seo?: Partial<ISeoInfo>
  categoryIds?: string[]
  tagIds?: string[]
}

export interface IUpdateBlogPostPayload extends Partial<ICreateBlogPostPayload> {}
