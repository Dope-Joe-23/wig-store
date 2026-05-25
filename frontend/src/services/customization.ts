import { apiClient } from './api'

export interface HeroSlide {
  id: number
  title: string
  subtitle: string
  tagline: string
  cta_text: string
  cta_link: string
  secondary_cta_text: string
  secondary_cta_link: string
  media_type: 'image' | 'video'
  media_file?: File | null
  media_url?: string | null
  media_url_display?: string | null
  is_active: boolean
  order: number
  created_at: string
  updated_at: string
}

export interface FeaturedItem {
  id: number
  title: string
  subtitle: string
  badge_text: string
  media_type: 'image' | 'video'
  media_file?: File | null
  media_url?: string | null
  media_url_display?: string | null
  product: number | null
  product_name?: string | null
  product_slug?: string | null
  product_price?: string | null
  is_active: boolean
  order: number
  created_at: string
  updated_at: string
}

export interface Testimonial {
  id: number
  name: string
  title: string
  quote: string
  rating: number
  media_type: 'image' | 'video'
  media_file?: File | null
  media_url?: string | null
  media_url_display?: string | null
  is_active: boolean
  order: number
  created_at: string
  updated_at: string
}

export interface AboutPageData {
  id: number
  title: string
  subtitle: string
  story_title: string
  story_content: string
  story_image?: File | null
  story_image_url?: string | null
  story_image_display?: string | null
  mission_title: string
  mission_content: string
  mission_image?: File | null
  mission_image_url?: string | null
  mission_image_display?: string | null
  values: { title: string; description: string }[]
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ContactPageData {
  id: number
  title: string
  subtitle: string
  email: string
  phone: string
  address: string
  working_hours: string
  social_links: { platform: string; url: string }[]
  map_embed_url: string
  form_title: string
  form_subtitle: string
  banner_image?: File | null
  banner_image_url?: string | null
  banner_image_display?: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

// Hero Slides
export const heroSlidesApi = {
  list: () => apiClient.get('/customization/hero-slides/'),
  get: (id: number) => apiClient.get(`/customization/hero-slides/${id}/`),
  create: (data: FormData) =>
    apiClient.post('/customization/hero-slides/', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  update: (id: number, data: FormData) =>
    apiClient.patch(`/customization/hero-slides/${id}/`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  delete: (id: number) => apiClient.delete(`/customization/hero-slides/${id}/`),
  reorder: (items: { id: number; order: number }[]) =>
    apiClient.post('/customization/hero-slides/reorder/', { items }),
}

// Featured Items
export const featuredItemsApi = {
  list: () => apiClient.get('/customization/featured-items/'),
  get: (id: number) => apiClient.get(`/customization/featured-items/${id}/`),
  create: (data: FormData) =>
    apiClient.post('/customization/featured-items/', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  update: (id: number, data: FormData) =>
    apiClient.patch(`/customization/featured-items/${id}/`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  delete: (id: number) => apiClient.delete(`/customization/featured-items/${id}/`),
  reorder: (items: { id: number; order: number }[]) =>
    apiClient.post('/customization/featured-items/reorder/', { items }),
}

// Testimonials
export const testimonialsApi = {
  list: () => apiClient.get('/customization/testimonials/'),
  get: (id: number) => apiClient.get(`/customization/testimonials/${id}/`),
  create: (data: FormData) =>
    apiClient.post('/customization/testimonials/', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  update: (id: number, data: FormData) =>
    apiClient.patch(`/customization/testimonials/${id}/`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  delete: (id: number) => apiClient.delete(`/customization/testimonials/${id}/`),
  reorder: (items: { id: number; order: number }[]) =>
    apiClient.post('/customization/testimonials/reorder/', { items }),
}

// About Page
export const aboutPageApi = {
  list: () => apiClient.get('/customization/about/'),
  get: (id: number) => apiClient.get(`/customization/about/${id}/`),
  create: (data: FormData) =>
    apiClient.post('/customization/about/', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  update: (id: number, data: FormData) =>
    apiClient.patch(`/customization/about/${id}/`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  delete: (id: number) => apiClient.delete(`/customization/about/${id}/`),
}

// Contact Page
export const contactPageApi = {
  list: () => apiClient.get('/customization/contact/'),
  get: (id: number) => apiClient.get(`/customization/contact/${id}/`),
  create: (data: FormData) =>
    apiClient.post('/customization/contact/', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  update: (id: number, data: FormData) =>
    apiClient.patch(`/customization/contact/${id}/`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  delete: (id: number) => apiClient.delete(`/customization/contact/${id}/`),
}
