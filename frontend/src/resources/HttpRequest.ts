import axios, { type AxiosInstance } from 'axios'

import { onRequest, onRequestError, onResponse, onResponseError } from './Interceptors'

interface IHttpRequest {
  axiosInstance: AxiosInstance
  setAuthHeader(): void
  get(endPoint: string, data?: object, config?: object): Promise<any>
  post(endPoint: string, data: object, config?: object): Promise<any>
  put(endPoint: string, data: object, config?: object): Promise<any>
  patch(endPoint: string, data: object, config?: object): Promise<any>
  delete(endPoint: string, params?: object, data?: object): Promise<any>
}

class HttpRequest implements IHttpRequest {
  public axiosInstance: AxiosInstance

  constructor(url?: string) {
    const baseURL = url || import.meta.env.VITE_APP_API_URL || '/api'

    this.axiosInstance = axios.create({
      baseURL,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.axiosInstance.interceptors.request.use(
      (config: any) => onRequest(config),
      onRequestError,
    )

    this.axiosInstance.interceptors.response.use(onResponse, onResponseError)
  }

  public setAuthHeader(): void {
    const token = import.meta.env.VITE_AUTH_TOKEN || ''
    this.axiosInstance.defaults.headers.common.Authorization = `Bearer ${token}`
  }

  public get(endPoint: string, data?: object, config?: object): Promise<any> {
    return this.axiosInstance.get(endPoint, { params: data, ...config })
  }

  public post(endPoint: string, data: object, config?: object): Promise<any> {
    return this.axiosInstance.post(endPoint, data, config)
  }

  public put(endPoint: string, data: object, config?: object): Promise<any> {
    return this.axiosInstance.put(endPoint, data, config)
  }

  public patch(endPoint: string, data: object, config?: object): Promise<any> {
    return this.axiosInstance.patch(endPoint, data, config)
  }

  public delete(endPoint: string, params?: object, data?: object): Promise<any> {
    return this.axiosInstance.delete(endPoint, { params, data })
  }
}

export default HttpRequest
