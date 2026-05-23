import { Product } from '@types/index'
import { Link } from 'react-router-dom'
import { formatCurrency, getImageUrl } from '@utils/helpers'
import { useWishlistStore } from '@stores/wishlistStore'
import { useAuthStore } from '@stores/authStore'
import { wishlistService } from '@services/wishlist'
import { useState } from 'react'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const primaryImage = product.primary_image || product.media?.find((m) => m.is_primary) || product.media?.[0]
  const isInWishlist = useWishlistStore((state) => state.isInWishlist(product.id))
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist)
  const addWishlistId = useWishlistStore((state) => state.addWishlistId)
  const removeWishlistId = useWishlistStore((state) => state.removeWishlistId)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const [animating, setAnimating] = useState(false)

  const handleWishlistClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!isAuthenticated) {
      window.location.href = '/login'
      return
    }

    setAnimating(true)
    try {
      if (isInWishlist) {
        await wishlistService.removeFromWishlist(product.id)
        removeWishlistId(product.id)
      } else {
        await wishlistService.addToWishlist(product.id)
        addWishlistId(product.id)
      }
    } catch (err) {
      console.error('Wishlist error:', err)
    }
    setTimeout(() => setAnimating(false), 300)
  }

  return (
    <div className="group relative">
      {/* Wishlist Heart Button */}
      <button
        onClick={handleWishlistClick}
        className={`absolute top-3 right-3 z-10 p-2.5 rounded-full transition-all duration-300 shadow-lg ${
          isInWishlist
            ? 'bg-rose-500 text-white hover:bg-rose-600'
            : 'bg-white/90 text-gray-400 hover:text-rose-500 hover:bg-white'
        } ${animating ? 'scale-125' : 'scale-100'}`}
        aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        <svg
          className="w-5 h-5"
          viewBox="0 0 24 24"
          fill={isInWishlist ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
          />
        </svg>
      </button>

      <Link to={`/products/${product.slug}`}>
        <div className="card-hover">
          <div className="bg-gray-200 aspect-square rounded-lg overflow-hidden mb-4 relative">
            {primaryImage ? (
              <img
                src={getImageUrl(primaryImage.url)}
                alt={primaryImage.alt_text || product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                No Image
              </div>
            )}
            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-1">
              {product.is_new && <span className="bg-gold text-black-primary text-xs font-semibold px-2 py-1 rounded">New</span>}
              {product.sale_price && <span className="bg-rose-500 text-white text-xs font-semibold px-2 py-1 rounded">Sale</span>}
            </div>
          </div>

          <h3 className="font-heading text-lg mb-2 line-clamp-2">{product.name}</h3>

          <div className="flex-between mb-3">
            <div className="flex gap-2 items-center">
              {product.sale_price ? (
                <>
                  <span className="text-rose-nude font-semibold">
                    {formatCurrency(Number(product.sale_price))}
                  </span>
                  <span className="line-through text-gray-400 text-sm">
                    {formatCurrency(Number(product.price))}
                  </span>
                </>
              ) : (
                <span className="font-semibold">
                  {formatCurrency(Number(product.price))}
                </span>
              )}
            </div>
          </div>

          {/* Rating */}
          {product.rating > 0 && (
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <div className="flex text-yellow-400 text-xs">
                {[...Array(5)].map((_, i) => (
                  <span key={i}>{i < Math.floor(product.rating) ? '★' : '☆'}</span>
                ))}
              </div>
              <span>({product.review_count})</span>
            </div>
          )}
        </div>
      </Link>
    </div>
  )
}
