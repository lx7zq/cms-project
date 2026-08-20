export interface IUser {
  id: string
  email: string
  name: string
  avatarUrl?: string
  isActive: boolean
  roles: string[]
  permissions: string[]
  createdAt: string
  updatedAt: string
}

export interface IUserView extends Omit<IUser, 'createdAt' | 'updatedAt'> {
  createdAt: Date | string
  updatedAt: Date | string
}

export interface ICreateUserPayload {
  email: string
  name: string
  password: string
  roleIds: string[]
  isActive?: boolean
}

export interface IUpdateUserPayload {
  email?: string
  name?: string
  password?: string
  roleIds?: string[]
  isActive?: boolean
}
