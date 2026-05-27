import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '@stores/authStore'
import { useWishlistStore } from '@stores/wishlistStore'
import { wishlistService } from '@services/wishlist'
import { productService } from '@services/products'
import { Product } from '@/types/index'
import ProductCard from '@components/products/ProductCard'

function WishlistSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: i * 0.05 }}
          className="bg-white rounded-lg overflow-hidden shadow-md"
        >
          <div className="bg-gray-200 h-56 skeleton-shimmer" />
          <div className="p-3 space-y-2">
            <div className="h-3 w-20 bg-gray-200 rounded skeleton-shimmer" />
            <div className="h-4 w-3/4 bg-gray-200 rounded skeleton-shimmer" />
            <div className="flex gap-1">
              {[...Array(5)].map((_, s) => (
                <div key={s} className="h-3 w-3 bg-gray-200 rounded skeleton-shimmer" />
              ))}
            </div>
            <div className="h-5 w-1/3 bg-gray-200 rounded skeleton-shimmer" />
          </div>
        </motion.div>
      ))}
    </div>
  )
}

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
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-heading font-bold text-black-primary mb-2">My Wishlist</h1>
              <p className="text-gray-600">Items you've saved for later</p>
            </div>
            <button
              onClick={() => navigate('/products')}
              className="self-start md:self-auto px-5 py-2.5 md:px-6 bg-rose-nude text-white rounded-lg hover:bg-rose-nude/90 font-semibold transition flex items-center gap-2 text-sm md:text-base"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Browse Products
            </button>
          </div>

          {loading ? (
            <WishlistSkeleton />
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
