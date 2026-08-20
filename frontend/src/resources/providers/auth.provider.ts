import type { IAuthResponse, ILoginForm } from '@/models/auth.model'

import HttpRequest from '../HttpRequest'

export interface IAuthProvider {
  login(payload: ILoginForm): Promise<IAuthResponse>
  getMe(): Promise<any>
  logout(): Promise<void>
  refreshToken(refreshToken: string): Promise<{ accessToken: string }>
  changePassword(oldPassword: string, newPassword: string): Promise<void>
  forgotPassword(email: string): Promise<void>
  resetPassword(token: string, newPassword: string): Promise<void>
}

class AuthProvider extends HttpRequest implements IAuthProvider {
  private urlPrefix = '/auth'

  public async login(payload: ILoginForm): Promise<IAuthResponse> {
    const response = await this.post(this.urlPrefix + '/login', payload)
    return response as IAuthResponse
  }

  public async getMe(): Promise<any> {
    const response = await this.get(this.urlPrefix + '/me')
    return response
  }

  public async logout(): Promise<void> {
    await this.post(this.urlPrefix + '/logout', {})
  }

  public async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    const response = await this.post(this.urlPrefix + '/refresh', { refreshToken })
    return response as { accessToken: string }
  }

  public async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    await this.post(this.urlPrefix + '/change-password', { oldPassword, newPassword })
  }

  public async forgotPassword(email: string): Promise<void> {
    await this.post(this.urlPrefix + '/forgot-password', { email })
  }

  public async resetPassword(token: string, newPassword: string): Promise<void> {
    await this.post(this.urlPrefix + '/reset-password', { token, newPassword })
  }
}

export default AuthProvider
