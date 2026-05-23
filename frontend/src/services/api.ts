import axios, { AxiosInstance, AxiosError } from 'axios'

class APIClient {
  private client: AxiosInstance
  private isRefreshing = false
  private failedQueue: Array<{
    resolve: (value?: unknown) => void
    reject: (reason?: unknown) => void
  }> = []

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Request interceptor — attach JWT access token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('access_token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor — try token refresh on 401
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any

        // Only attempt refresh for 401 errors that aren't already refresh/login requests
        if (
          error.response?.status !== 401 ||
          originalRequest._retry ||
          originalRequest.url?.includes('/auth/token/')
        ) {
          return Promise.reject(error)
        }

        // If already refreshing, queue this request
        if (this.isRefreshing) {
          return new Promise((resolve, reject) => {
            this.failedQueue.push({ resolve, reject })
          }).then(() => {
            originalRequest.headers.Authorization = `Bearer ${localStorage.getItem('access_token')}`
            return this.client(originalRequest)
          })
        }

        originalRequest._retry = true
        this.isRefreshing = true

        const refreshToken = localStorage.getItem('refresh_token')
        if (!refreshToken) {
          this.isRefreshing = false
          this.clearAuth()
          return Promise.reject(error)
        }

        try {
          const { data } = await axios.post(
            `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}/auth/token/refresh/`,
            { refresh: refreshToken }
          )

          localStorage.setItem('access_token', data.access)
          if (data.refresh) {
            localStorage.setItem('refresh_token', data.refresh)
          }

          // Retry queued requests
          this.processQueue(null, data.access)
          this.isRefreshing = false

          originalRequest.headers.Authorization = `Bearer ${data.access}`
          return this.client(originalRequest)
        } catch (refreshError) {
          this.processQueue(refreshError, null)
          this.isRefreshing = false
          this.clearAuth()
          return Promise.reject(refreshError)
        }
      }
    )
  }

  private processQueue(error: any, token: string | null) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error)
      } else {
        resolve(token)
      }
    })
    this.failedQueue = []
  }

  private clearAuth() {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    window.location.href = '/login'
  }

  // Public methods
  get = <T = any>(url: string, config?: any) => this.client.get<T>(url, config)
  post = <T = any>(url: string, data?: any, config?: any) => this.client.post<T>(url, data, config)
  put = <T = any>(url: string, data?: any, config?: any) => this.client.put<T>(url, data, config)
  patch = <T = any>(url: string, data?: any, config?: any) => this.client.patch<T>(url, data, config)
  delete = <T = any>(url: string, config?: any) => this.client.delete<T>(url, config)
}

export const apiClient = new APIClient()
