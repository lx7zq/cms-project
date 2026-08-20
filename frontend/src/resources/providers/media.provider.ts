import HttpRequest from '../HttpRequest'

export interface IMediaProvider {
  getAll(params?: object): Promise<any>
  uploadImage(file: File, altText?: string, caption?: string): Promise<any>
  uploadFile(file: File): Promise<any>
  delete(id: string): Promise<any>
}

class MediaProvider extends HttpRequest implements IMediaProvider {
  private urlPrefix = '/media'

  public async getAll(params?: object): Promise<any> {
    return this.get(this.urlPrefix, params)
  }

  public async uploadImage(file: File, altText?: string, caption?: string): Promise<any> {
    const formData = new FormData()
    formData.append('file', file)
    if (altText) formData.append('altText', altText)
    if (caption) formData.append('caption', caption)

    return this.post(this.urlPrefix + '/upload-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  }

  public async uploadFile(file: File): Promise<any> {
    const formData = new FormData()
    formData.append('file', file)

    return this.post(this.urlPrefix + '/upload-file', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  }

  public async delete(id: string): Promise<any> {
    return super.delete(`${this.urlPrefix}/${id}`)
  }
}

export default MediaProvider
