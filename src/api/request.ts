import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios'
import { ElMessage } from 'element-plus'

const http: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('cs_admin_token')
  if (token && config.headers) {
    config.headers.Authorization = token
  }
  return config
})

http.interceptors.response.use(
  (res) => res.data,
  (err: AxiosError) => {
    const data = err.response?.data as any
    if (err.response?.status === 401) {
      localStorage.removeItem('cs_admin_token')
      window.location.href = '/login'
    }
    ElMessage.error(data?.msg || err.message || '网络错误')
    return Promise.reject(data?.msg || err.message)
  }
)

export interface ApiResult<T = any> {
  code: number
  msg: string
  data: T
}

interface ApiHttp {
  get<T = any>(url: string, config?: any): Promise<ApiResult<T>>
  post<T = any>(url: string, data?: any, config?: any): Promise<ApiResult<T>>
  put<T = any>(url: string, data?: any, config?: any): Promise<ApiResult<T>>
  delete<T = any>(url: string, config?: any): Promise<ApiResult<T>>
}

const api = http as unknown as ApiHttp

export default api
