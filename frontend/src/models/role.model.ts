export interface IRole {
  id: string
  name: string
  description?: string
  permissions: IPermission[]
  createdAt: string
  updatedAt: string
}

export interface IPermission {
  id: string
  key: string
  description?: string
}

export interface ICreateRolePayload {
  name: string
  description?: string
  permissionIds: string[]
}

export interface IUpdateRolePayload {
  name?: string
  description?: string
  permissionIds?: string[]
}
