import { useQuery } from '@tanstack/react-query'
import { productService } from '@services/products'

export const useProducts = (params?: any) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: async () => {
      const { data } = await productService.getProducts(params)
      return data
    },
  })
}

export const useFeaturedProducts = () => {
  return useQuery({
    queryKey: ['products', 'featured'],
    queryFn: async () => {
      const { data } = await productService.getFeatured()
      return data
    },
  })
}

export const useTrendingProducts = () => {
  return useQuery({
    queryKey: ['products', 'trending'],
    queryFn: async () => {
      const { data } = await productService.getTrending()
      return data
    },
  })
}

export const useNewArrivals = () => {
  return useQuery({
    queryKey: ['products', 'new-arrivals'],
    queryFn: async () => {
      const { data } = await productService.getNewArrivals()
      return data
    },
  })
}

export const useProductBySlug = (slug: string) => {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      const { data } = await productService.getProductBySlug(slug)
      return data
    },
    enabled: !!slug,
  })
}

export const useRelatedProducts = (slug: string) => {
  return useQuery({
    queryKey: ['products', 'related', slug],
    queryFn: async () => {
      const { data } = await productService.getRelated(slug)
      return data
    },
    enabled: !!slug,
  })
}

export const useProductSearch = (query: string) => {
  return useQuery({
    queryKey: ['products', 'search', query],
    queryFn: async () => {
      const { data } = await productService.search(query)
      return data
    },
    enabled: !!query,
  })
}

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await productService.getCategories()
      return data
    },
  })
}
