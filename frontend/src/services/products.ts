import { apiClient } from './api'
import type { Product, Category, PaginatedResponse } from '../types/index'

export type { Product, Category, PaginatedResponse }

export const productService = {
  // Get all products with filters
  getProducts: (params?: any) =>
    apiClient.get<PaginatedResponse<Product>>('/products/products/', { params }),

  // Get featured products
  getFeatured: () =>
    apiClient.get('/products/products/featured/'),

  // Get trending products
  getTrending: () =>
    apiClient.get('/products/products/trending/'),

  // Get new arrivals
  getNewArrivals: () =>
    apiClient.get('/products/products/new_arrivals/'),

  // Get product by slug
  getProductBySlug: (slug: string) =>
    apiClient.get(`/products/products/${slug}/`),

  // Get related products
  getRelated: (slug: string) =>
    apiClient.get(`/products/products/${slug}/related/`),

  // Search products
  search: (query: string) =>
    apiClient.get<PaginatedResponse<Product>>('/products/products/', { params: { search: query } }),

  // Live search suggestions (lightweight, top 6 results)
  searchSuggestions: (query: string) =>
    apiClient.get<Product[]>('/products/products/search_suggestions/', { params: { q: query } }),

  // Get all categories (can return array or paginated response)
  getCategories: () =>
    apiClient.get<PaginatedResponse<Category> | Category[]>('/products/categories/'),

  // Get category by slug
  getCategoryBySlug: (slug: string) =>
    apiClient.get<Category>(`/products/categories/${slug}/`),

  // Update product (staff only)
  updateProduct: (slug: string, data: Partial<Product>) =>
    apiClient.patch(`/products/products/${slug}/`, data),

  // Partial update product stock
  updateProductStock: (slug: string, stock_quantity: number) =>
    apiClient.patch(`/products/products/${slug}/`, { stock_quantity }),

  // Create new product (staff only)
  createProduct: (data: any) =>
    apiClient.post('/products/products/', data),

  // Add product media/image (staff only)
  addProductMedia: (data: any) =>
    apiClient.post('/products/media/', data),
}

