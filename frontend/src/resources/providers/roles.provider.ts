import HttpRequest from '../HttpRequest'

export interface IRolesProvider {
  getAll(): Promise<any>
  getById(id: string): Promise<any>
  create(data: object): Promise<any>
  update(id: string, data: object): Promise<any>
  delete(id: string): Promise<any>
  getPermissions(): Promise<any>
}

class RolesProvider extends HttpRequest implements IRolesProvider {
  private urlPrefix = '/roles'

  public async getAll(): Promise<any> {
    return this.get(this.urlPrefix)
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

  public async getPermissions(): Promise<any> {
    return this.get(this.urlPrefix + '/permissions')
  }
}

export default RolesProvider
