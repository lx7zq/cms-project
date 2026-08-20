import type { ContentStatus } from './shared.model'

export interface ILandingPage {
  id: string
  title: string
  slug: string
  shortDescription?: string
  description?: string
  banner?: string
  thumbnail?: string
  coverImage?: string
  content: string
  status: ContentStatus
  isPublic: boolean
  publishDate?: string
  expireDate?: string
  viewCount: number
  deletedAt?: string
  createdAt: string
  updatedAt: string
  seo?: ISeoInfo
  categories?: ICategoryRef[]
  tags?: ITagRef[]
}

export interface ILandingPageView extends Omit<ILandingPage, 'createdAt' | 'updatedAt' | 'publishDate' | 'expireDate'> {
  createdAt: Date | string
  updatedAt: Date | string
  publishDate: Date | string | null
  expireDate: Date | string | null
}

export interface ISeoInfo {
  id: string
  metaTitle?: string
  metaDescription?: string
  keyword?: string
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  canonicalUrl?: string
  robotsIndex: boolean
  robotsFollow: boolean
}

export interface ICategoryRef {
  id: string
  name: string
  slug: string
  contentType: string
}

export interface ITagRef {
  id: string
  name: string
  slug: string
}

export interface ICreateLandingPagePayload {
  title: string
  content: string
  shortDescription?: string
  description?: string
  banner?: string
  thumbnail?: string
  coverImage?: string
  status?: string
  isPublic?: boolean
  publishDate?: string
  expireDate?: string
  seo?: Partial<ISeoInfo>
  categoryIds?: string[]
  tagIds?: string[]
}

export interface IUpdateLandingPagePayload extends Partial<ICreateLandingPagePayload> {}
