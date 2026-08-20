import HttpRequest from '../HttpRequest'

export interface IBlogPostsProvider {
  getAll(params?: object): Promise<any>
  getById(id: string): Promise<any>
  create(data: object): Promise<any>
  update(id: string, data: object): Promise<any>
  delete(id: string): Promise<any>
  duplicate(id: string): Promise<any>
  publish(id: string): Promise<any>
  unpublish(id: string): Promise<any>
  archive(id: string): Promise<any>
  restore(id: string): Promise<any>
}

class BlogPostsProvider extends HttpRequest implements IBlogPostsProvider {
  private urlPrefix = '/blog-posts'

  public async getAll(params?: object): Promise<any> {
    return this.get(this.urlPrefix, params)
  }

  public async getById(id: string): Promise<any> {
    return this.get(`${this.urlPrefix}/${id}`)
  }

  public async create(data: object): Promise<any> {
    return this.post(this.urlPrefix, data)
  }

  public async update(id: string, data: object): Promise<any> {
    return this.patch(`${this.urlPrefix}/${id}`, data)
  }

  public async delete(id: string): Promise<any> {
    return super.delete(`${this.urlPrefix}/${id}`)
  }

  public async duplicate(id: string): Promise<any> {
    return this.post(`${this.urlPrefix}/${id}/duplicate`, {})
  }

  public async publish(id: string): Promise<any> {
    return this.patch(`${this.urlPrefix}/${id}/publish`, {})
  }

  public async unpublish(id: string): Promise<any> {
    return this.patch(`${this.urlPrefix}/${id}/unpublish`, {})
  }

  public async archive(id: string): Promise<any> {
    return this.patch(`${this.urlPrefix}/${id}/archive`, {})
  }

  public async restore(id: string): Promise<any> {
    return this.patch(`${this.urlPrefix}/${id}/restore`, {})
  }
}

export default BlogPostsProvider
