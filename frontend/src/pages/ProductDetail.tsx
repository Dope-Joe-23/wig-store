import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useProductBySlug } from '@hooks/useProducts'
import { useCartStore } from '@stores/cartStore'
import { useWishlistStore } from '@stores/wishlistStore'
import { useAuthStore } from '@stores/authStore'
import { wishlistService } from '@services/wishlist'
import { getImageUrl } from '@utils/helpers'

function SpecItem({ label, value, capitalize }: { label: string; value?: string; capitalize?: boolean }) {
  return (
    <div>
      <p className="text-gray-500 text-xs">{label}</p>
      <p className={`font-semibold text-black-primary text-sm ${capitalize ? 'capitalize' : ''}`}>
        {value || '—'}
      </p>
    </div>
  )
}

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { data: product, isLoading, error } = useProductBySlug(slug!)
  const [quantity, setQuantity] = useState(1)
  const [addedToCart, setAddedToCart] = useState(false)
  const addToCart = useCartStore((state) => state.addToCart)
  const isInWishlist = useWishlistStore((state) => state.isInWishlist(product?.id || 0))
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist)
  const addWishlistId = useWishlistStore((state) => state.addWishlistId)
  const removeWishlistId = useWishlistStore((state) => state.removeWishlistId)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const [wishlistAnimating, setWishlistAnimating] = useState(false)

  const handleAddToCart = () => {
    if (product) {
      const price = typeof product.current_price === 'string' 
        ? parseFloat(product.current_price) 
        : product.current_price || 0
      
      if (isNaN(price) || price <= 0) {
        console.warn('[ProductDetail] Invalid product price:', product.current_price)
        alert('Unable to add to cart: invalid product price')
        return
      }
      
      addToCart({
        id: product.id,
        name: product.name,
        price,
        quantity,
        image: product.primary_image?.url || '',
        slug: product.slug,
      })
      setAddedToCart(true)
      setTimeout(() => setAddedToCart(false), 2000)
    }
  }

  const handleBuyNow = () => {
    handleAddToCart()
    navigate('/cart')
  }

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    if (!product) return

    setWishlistAnimating(true)
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
    setTimeout(() => setWishlistAnimating(false), 300)
  }

  const formatPrice = (price: string | number) => {
    let numPrice = 0
    
    if (typeof price === 'string') {
      numPrice = parseFloat(price)
    } else if (typeof price === 'number') {
      numPrice = price
    }
    
    if (isNaN(numPrice) || numPrice === null || numPrice === undefined) {
      console.warn('[ProductDetail] Invalid price:', price, 'parsed to:', numPrice)
      return '$0.00'
    }
    
    return numPrice.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
    })
  }

  if (isLoading)
    return (
      <div className="container-base section-padding">
        <p className="text-gray-600">Loading product...</p>
      </div>
    )

  if (error)
    return (
      <div className="container-base section-padding">
        <p className="text-red-600">Error loading product</p>
      </div>
    )

  if (!product)
    return (
      <div className="container-base section-padding">
        <p className="text-gray-600">Product not found</p>
      </div>
    )

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="container-base">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 md:gap-2 mb-6 md:mb-8 text-xs md:text-sm overflow-x-auto whitespace-nowrap scrollbar-hide">
          <Link to="/" className="text-gray-600 hover:text-black-primary flex-shrink-0">
            Home
          </Link>
          <span className="text-gray-400 flex-shrink-0">/</span>
          <Link to="/products" className="text-gray-600 hover:text-black-primary flex-shrink-0">
            Products
          </Link>
          <span className="text-gray-400 flex-shrink-0">/</span>
          {product.category && (
            <>
              <Link
                to={`/products?category=${product.category?.id}`}
                className="text-gray-600 hover:text-black-primary flex-shrink-0"
              >
                {product.category?.name || 'Uncategorized'}
              </Link>
              <span className="text-gray-400 flex-shrink-0">/</span>
            </>
          )}
          <span className="text-black-primary font-semibold truncate min-w-0">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Image */}
          <div className="relative bg-gray-100 rounded-lg overflow-hidden h-64 sm:h-80 md:h-96 lg:h-auto lg:aspect-square flex items-center justify-center group">
            {/* Wishlist Heart Button */}
            <button
              onClick={handleWishlistToggle}
              className={`absolute top-4 right-4 z-10 p-3 rounded-full transition-all duration-300 shadow-lg ${
                isInWishlist
                  ? 'bg-rose-500 text-white hover:bg-rose-600'
                  : 'bg-white/90 text-gray-400 hover:text-rose-500 hover:bg-white'
              } ${wishlistAnimating ? 'scale-125' : 'scale-100'}`}
              aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <svg
                className="w-6 h-6"
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

            {product.primary_image ? (
              <img
                src={getImageUrl(product.primary_image.url)}
                alt={product.primary_image.alt_text}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-gray-400">No Image</span>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col justify-between">
            <div>
              {/* Category Badge */}
              <p className="text-sm text-gray-500 mb-2">{product.category?.name || 'Uncategorized'}</p>

              {/* Title */}
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-heading font-bold text-black-primary mb-4">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex text-gold text-lg">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={i < Math.floor(product.rating) ? '' : 'opacity-30'}>
                      ★
                    </span>
                  ))}
                </div>
                <span className="text-sm text-gray-600">({product.review_count} reviews)</span>
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-2xl md:text-3xl font-bold text-black-primary">
                    {formatPrice(product.current_price)}
                  </span>
                  {product.sale_price && (
                    <span className="text-lg text-gray-500 line-through">
                      {formatPrice(product.price)}
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-700 mb-6 leading-relaxed">{product.description || 'Premium wig'}</p>

              {/* Specs */}
              <div className="bg-ivory rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-black-primary mb-3">Specifications</h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                  <SpecItem label="Wig Type" value={product.wig_type?.replace('_', ' ')} capitalize />
                  <SpecItem label="Texture" value={product.texture} capitalize />
                  <SpecItem label="Color" value={product.color} />
                  <SpecItem label="Length" value={product.length} />
                  <SpecItem label="Cap Size" value={product.cap_size} />
                  <SpecItem label="Stock" value={product.stock_quantity > 0 ? `${product.stock_quantity} left` : 'Out of stock'} />
                </div>
              </div>
            </div>

            {/* Out of Stock Banner */}
            {(!product.stock_quantity || product.stock_quantity === 0) && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold text-red-800">Out of Stock</p>
                    <p className="text-sm text-red-600">
                      This product is currently unavailable. Add it to your wishlist to get notified when it's back in stock.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Add to Cart */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={!product.stock_quantity || product.stock_quantity === 0}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  −
                </button>
                <span className="text-lg font-semibold w-12 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  disabled={!product.stock_quantity || product.stock_quantity === 0}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={!product.stock_quantity || product.stock_quantity === 0}
                className={`w-full px-6 py-3 rounded-lg transition font-semibold ${
                  product.stock_quantity > 0
                    ? 'bg-rose-nude text-white hover:bg-opacity-90'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {!product.stock_quantity || product.stock_quantity === 0
                  ? 'Out of Stock'
                  : addedToCart
                  ? 'Added to Cart ✓'
                  : 'Add to Cart'}
              </button>

              <button
                onClick={handleBuyNow}
                disabled={!product.stock_quantity || product.stock_quantity === 0}
                className={`w-full px-6 py-3 rounded-lg transition font-semibold ${
                  product.stock_quantity > 0
                    ? 'bg-black-primary text-white hover:bg-opacity-90'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {!product.stock_quantity || product.stock_quantity === 0
                  ? 'Unavailable'
                  : 'Buy Now'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
