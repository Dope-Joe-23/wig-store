import { useQuery } from '@tanstack/react-query'
import { reviewService } from '@services/reviews'

export const useProductReviews = (productId: number, params?: any) => {
  return useQuery({
    queryKey: ['reviews', productId, params],
    queryFn: async () => {
      const { data } = await reviewService.getProductReviews(productId, params)
      return data
    },
    enabled: !!productId,
  })
}

export const useReview = (id: number) => {
  return useQuery({
    queryKey: ['review', id],
    queryFn: async () => {
      const { data } = await reviewService.getReview(id)
      return data
    },
    enabled: !!id,
  })
}
