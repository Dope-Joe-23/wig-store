import { apiClient } from './api'

export interface WishlistItem {
  id: number
  product: number
}

export const wishlistService = {
  // Get wishlist
  getWishlist: () =>
    apiClient.get('/auth/wishlists/my_wishlist/'),

  // Add product to wishlist
  addToWishlist: (productId: number) =>
    apiClient.post('/auth/wishlists/add_to_wishlist/', {
      product_id: productId
    }),

  // Remove product from wishlist
  removeFromWishlist: (productId: number) =>
    apiClient.post('/auth/wishlists/remove_from_wishlist/', {
      product_id: productId
    }),
}
