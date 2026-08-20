export interface IMediaFile {
  id: string
  fileName: string
  url: string
  fileType: string
  fileSize: number
  width?: number
  height?: number
  altText?: string
  caption?: string
  uploadedById: string
  createdAt: string
}

export interface IMediaFileView extends Omit<IMediaFile, 'createdAt'> {
  createdAt: Date | string
}

export interface IFileAttachment {
  id: string
  fileName: string
  url: string
  fileType: string
  fileSize: number
  uploadedById: string
  createdAt: string
}
