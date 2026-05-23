import { apiClient } from './api'

export interface BlogPost {
  id: number
  title: string
  excerpt: string
  content: string
  author: string
  category: 'product' | 'tips' | 'beauty' | 'news' | 'general'
  cover_image_file?: File | null
  cover_image_url?: string | null
  cover_image_display?: string | null
  read_time: string
  external_link?: string | null
  is_active: boolean
  is_featured: boolean
  order: number
  created_at: string
  updated_at: string
}

export const blogApi = {
  list: () => apiClient.get('/customization/blog/'),
  get: (id: number) => apiClient.get(`/customization/blog/${id}/`),
  create: (data: FormData) =>
    apiClient.post('/customization/blog/', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  update: (id: number, data: FormData) =>
    apiClient.patch(`/customization/blog/${id}/`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  delete: (id: number) => apiClient.delete(`/customization/blog/${id}/`),
  reorder: (items: { id: number; order: number }[]) =>
    apiClient.post('/customization/blog/reorder/', { items }),
}
