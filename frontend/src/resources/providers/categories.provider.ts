import HttpRequest from '../HttpRequest'

export interface ICategoriesProvider {
  getAll(params?: object): Promise<any>
  getById(id: string): Promise<any>
  create(data: object): Promise<any>
  update(id: string, data: object): Promise<any>
  delete(id: string): Promise<any>
}

class CategoriesProvider extends HttpRequest implements ICategoriesProvider {
  private urlPrefix = '/categories'

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
}

export default CategoriesProvider
