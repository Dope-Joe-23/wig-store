import { apiClient } from './api'

export interface VideoContent {
  id: number
  title: string
  description: string
  category: 'how_to_use' | 'care_tips' | 'styling' | 'product_review' | 'general'
  video_file?: File | null
  video_url?: string | null
  video_url_display?: string | null
  thumbnail_file?: File | null
  thumbnail_url?: string | null
  thumbnail_url_display?: string | null
  duration: string
  is_active: boolean
  order: number
  created_at: string
  updated_at: string
}

export const videosApi = {
  list: () => apiClient.get('/customization/videos/'),
  get: (id: number) => apiClient.get(`/customization/videos/${id}/`),
  create: (data: FormData) =>
    apiClient.post('/customization/videos/', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  update: (id: number, data: FormData) =>
    apiClient.patch(`/customization/videos/${id}/`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  delete: (id: number) => apiClient.delete(`/customization/videos/${id}/`),
  reorder: (items: { id: number; order: number }[]) =>
    apiClient.post('/customization/videos/reorder/', { items }),
}
