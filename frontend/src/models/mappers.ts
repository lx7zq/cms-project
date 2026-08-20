import type { IUserView } from './user.model'
import type { ICategoryView } from './category.model'
import type { ITagView } from './tag.model'
import type { IBlogPostView } from './blog-post.model'
import type { ILandingPageView } from './landing-page.model'
import type { IMediaFileView } from './media.model'

// ── User ──
export function normalizeUser(item: any): IUserView {
  const source = item?.data ?? item
  return {
    id: source?.id ?? '',
    email: source?.email ?? '',
    name: source?.name ?? '',
    avatarUrl: source?.avatarUrl,
    isActive: source?.isActive ?? true,
    roles: source?.roles ?? [],
    permissions: source?.permissions ?? [],
    createdAt: source?.createdAt ? new Date(source.createdAt) : new Date(),
    updatedAt: source?.updatedAt ? new Date(source.updatedAt) : new Date(),
  }
}

export function normalizeUserList(response: any): IUserView[] {
  const items = Array.isArray(response) ? response : Array.isArray(response?.data) ? response.data : []
  return items.map(normalizeUser)
}

// ── Category ──
export function normalizeCategory(item: any): ICategoryView {
  const source = item?.data ?? item
  return {
    id: source?.id ?? '',
    name: source?.name ?? '',
    slug: source?.slug ?? '',
    contentType: source?.contentType ?? 'LANDING_PAGE',
    parentId: source?.parentId,
    isActive: source?.isActive ?? true,
    sortOrder: source?.sortOrder ?? 0,
    createdAt: source?.createdAt ? new Date(source.createdAt) : new Date(),
    updatedAt: source?.updatedAt ?? '',
  }
}

export function normalizeCategoryList(response: any): ICategoryView[] {
  const items = Array.isArray(response) ? response : Array.isArray(response?.data) ? response.data : []
  return items.map(normalizeCategory)
}

// ── Tag ──
export function normalizeTag(item: any): ITagView {
  const source = item?.data ?? item
  return {
    id: source?.id ?? '',
    name: source?.name ?? '',
    slug: source?.slug ?? '',
    createdAt: source?.createdAt ? new Date(source.createdAt) : new Date(),
  }
}

export function normalizeTagList(response: any): ITagView[] {
  const items = Array.isArray(response) ? response : Array.isArray(response?.data) ? response.data : []
  return items.map(normalizeTag)
}

// ── Blog Post ──
export function normalizeBlogPost(item: any): IBlogPostView {
  const source = item?.data ?? item
  return {
    id: source?.id ?? '',
    title: source?.title ?? '',
    slug: source?.slug ?? '',
    excerpt: source?.excerpt,
    description: source?.description,
    thumbnail: source?.thumbnail,
    coverImage: source?.coverImage,
    banner: source?.banner,
    content: source?.content ?? '',
    status: source?.status ?? 'DRAFT',
    isPublic: source?.isPublic ?? false,
    publishDate: source?.publishDate ?? null,
    expireDate: source?.expireDate ?? null,
    readingTime: source?.readingTime,
    isFeatured: source?.isFeatured ?? false,
    isPinned: source?.isPinned ?? false,
    viewCount: source?.viewCount ?? 0,
    deletedAt: source?.deletedAt,
    createdAt: source?.createdAt ? new Date(source.createdAt) : new Date(),
    updatedAt: source?.updatedAt ? new Date(source.updatedAt) : new Date(),
    seo: source?.seo,
    categories: source?.categories,
    tags: source?.tags,
  }
}

export function normalizeBlogPostList(response: any): IBlogPostView[] {
  const items = Array.isArray(response) ? response : Array.isArray(response?.data) ? response.data : []
  return items.map(normalizeBlogPost)
}

// ── Landing Page ──
export function normalizeLandingPage(item: any): ILandingPageView {
  const source = item?.data ?? item
  return {
    id: source?.id ?? '',
    title: source?.title ?? '',
    slug: source?.slug ?? '',
    shortDescription: source?.shortDescription,
    description: source?.description,
    banner: source?.banner,
    thumbnail: source?.thumbnail,
    coverImage: source?.coverImage,
    content: source?.content ?? '',
    status: source?.status ?? 'DRAFT',
    isPublic: source?.isPublic ?? false,
    publishDate: source?.publishDate ?? null,
    expireDate: source?.expireDate ?? null,
    viewCount: source?.viewCount ?? 0,
    deletedAt: source?.deletedAt,
    createdAt: source?.createdAt ? new Date(source.createdAt) : new Date(),
    updatedAt: source?.updatedAt ? new Date(source.updatedAt) : new Date(),
    seo: source?.seo,
    categories: source?.categories,
    tags: source?.tags,
  }
}

export function normalizeLandingPageList(response: any): ILandingPageView[] {
  const items = Array.isArray(response) ? response : Array.isArray(response?.data) ? response.data : []
  return items.map(normalizeLandingPage)
}

// ── Media ──
export function normalizeMediaFile(item: any): IMediaFileView {
  const source = item?.data ?? item
  return {
    id: source?.id ?? '',
    fileName: source?.fileName ?? '',
    url: source?.url ?? '',
    fileType: source?.fileType ?? '',
    fileSize: source?.fileSize ?? 0,
    width: source?.width,
    height: source?.height,
    altText: source?.altText,
    caption: source?.caption,
    uploadedById: source?.uploadedById ?? '',
    createdAt: source?.createdAt ? new Date(source.createdAt) : new Date(),
  }
}

export function normalizeMediaFileList(response: any): IMediaFileView[] {
  const items = Array.isArray(response) ? response : Array.isArray(response?.data) ? response.data : []
  return items.map(normalizeMediaFile)
}
