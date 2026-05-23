import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@stores/authStore'
import { useWishlistStore } from '@stores/wishlistStore'
import { wishlistService } from '@services/wishlist'
import { productService } from '@services/products'
import { Product } from '@types/index'
import ProductCard from '@components/products/ProductCard'

export function WishlistPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const setWishlistIds = useWishlistStore((state) => state.setWishlistIds)
  const wishlistIds = useWishlistStore((state) => state.wishlistIds)
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    const fetchWishlist = async () => {
      try {
        const res = await wishlistService.getWishlist()
        const data = res.data
        if (data.products) {
          setProducts(data.products)
          setWishlistIds(data.products.map((p: Product) => p.id))
        }
      } catch (err) {
        console.error('Failed to fetch wishlist:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchWishlist()
  }, [isAuthenticated, navigate, setWishlistIds])

  if (!isAuthenticated) return null

  return (
    <div className="min-h-screen bg-ivory py-12">
      <div className="container-base">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-heading font-bold text-black-primary mb-2">My Wishlist</h1>
              <p className="text-gray-600">Items you've saved for later</p>
            </div>
            <button
              onClick={() => navigate('/products')}
              className="px-6 py-2.5 bg-rose-nude text-white rounded-lg hover:bg-rose-nude/90 font-semibold transition flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Browse Products
            </button>
          </div>

          {loading ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <div className="w-12 h-12 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-500">Loading wishlist...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <p className="text-5xl mb-4">❤️</p>
              <h3 className="text-xl font-semibold text-black-primary mb-2">Your wishlist is empty</h3>
              <p className="text-gray-600 mb-6">
                Start browsing and click the heart icon to save your favorite items.
              </p>
              <button
                onClick={() => navigate('/products')}
                className="inline-block px-8 py-3 bg-rose-nude text-white rounded-lg hover:bg-rose-nude/90 font-semibold transition"
              >
                Browse Products
              </button>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-6">
                {products.length} {products.length === 1 ? 'item' : 'items'} saved
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
