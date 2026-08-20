import axios, { type AxiosError, type AxiosRequestConfig, type AxiosResponse } from 'axios'

import { getAuthToken } from './token'

export function onRequest(config: AxiosRequestConfig): AxiosRequestConfig {
  config.headers = config.headers ?? {}

  const token = getAuthToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
}

export function onRequestError(error: AxiosError): any {
  console.error(`[request error] [${JSON.stringify(error)}]`)
  return Promise.reject(error)
}

export function onResponse(response: AxiosResponse): any {
  if (!response) {
    throw response
  }
  return response.data
}

export async function onResponseError(error: AxiosError): Promise<any> {
  const originalRequest = error.config as any

  // Try refresh token on 401
  if (error.response?.status === 401 && !originalRequest._retry) {
    originalRequest._retry = true
    const refreshToken = localStorage.getItem('refreshToken')

    if (refreshToken) {
      try {
        const { data } = await axios.post('/api/auth/refresh', { refreshToken })
        localStorage.setItem('accessToken', data.accessToken)
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`
        return axios(originalRequest)
      } catch {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        window.location.href = '/login'
      }
    } else {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      window.location.href = '/login'
    }
  }

  return Promise.reject(error)
}
