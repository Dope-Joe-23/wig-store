import { apiClient } from './api'
import { Review, PaginatedResponse } from '../types/index'

export interface CreateReviewData {
  product_id: number
  rating: number
  title: string
  comment: string
}

export const reviewService = {
  // Get product reviews
  getProductReviews: (productId: number, params?: any) =>
    apiClient.get('/reviews/', {
      params: { product: productId, ...params },
    }),

  // Get single review
  getReview: (id: number) =>
    apiClient.get(`/reviews/${id}/`),

  // Create review
  createReview: (data: CreateReviewData) =>
    apiClient.post('/reviews/', data),

  // Update review
  updateReview: (id: number, data: Partial<CreateReviewData>) =>
    apiClient.patch(`/reviews/${id}/`, data),

  // Delete review
  deleteReview: (id: number) =>
    apiClient.delete(`/reviews/${id}/`),
}
