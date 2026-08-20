export interface ILoginForm {
  email: string
  password: string
}

export interface IAuthUser {
  id: string | null
  email: string
  name: string
  roles: string[]
  permissions: string[]
}

export interface IAuthUserToken {
  accessToken: string
  refreshToken: string
}

export interface IAuthResponse {
  user: IAuthUser
  accessToken: string
  refreshToken: string
}

export interface IForgotPasswordForm {
  email: string
}

export interface IResetPasswordForm {
  token: string
  password: string
  confirmPassword: string
}
