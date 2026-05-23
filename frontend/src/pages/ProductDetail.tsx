import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useProductBySlug } from '@hooks/useProducts'
import { useCartStore } from '@stores/cartStore'
import { useWishlistStore } from '@stores/wishlistStore'
import { useAuthStore } from '@stores/authStore'
import { wishlistService } from '@services/wishlist'
import { getImageUrl } from '@utils/helpers'

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
        <div className="flex items-center gap-2 mb-8 text-sm">
          <Link to="/" className="text-gray-600 hover:text-black-primary">
            Home
          </Link>
          <span className="text-gray-400">/</span>
          <Link to="/products" className="text-gray-600 hover:text-black-primary">
            Products
          </Link>
          <span className="text-gray-400">/</span>
          <Link
            to={`/products?category=${product.category?.id}`}
            className="text-gray-600 hover:text-black-primary"
          >
            {product.category?.name || 'Uncategorized'}
          </Link>
          <span className="text-gray-400">/</span>
          <span className="text-black-primary font-semibold">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="relative bg-gray-100 rounded-lg overflow-hidden h-96 lg:h-auto lg:aspect-square flex items-center justify-center group">
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
              <h1 className="text-4xl font-heading font-bold text-black-primary mb-4">
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
                  <span className="text-3xl font-bold text-black-primary">
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
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-600">Wig Type</p>
                    <p className="font-semibold text-black-primary capitalize">{product.wig_type?.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Texture</p>
                    <p className="font-semibold text-black-primary capitalize">{product.texture}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Color</p>
                    <p className="font-semibold text-black-primary">{product.color}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Length</p>
                    <p className="font-semibold text-black-primary">{product.length}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Cap Size</p>
                    <p className="font-semibold text-black-primary">{product.cap_size}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Stock</p>
                    <p className="font-semibold text-black-primary">
                      {product.stock_quantity > 0 ? `${product.stock_quantity} left` : 'Out of stock'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Add to Cart */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  −
                </button>
                <span className="text-lg font-semibold w-12 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                className="w-full px-6 py-3 bg-rose-nude text-white rounded-lg hover:bg-opacity-90 transition font-semibold"
              >
                {addedToCart ? 'Added to Cart ✓' : 'Add to Cart'}
              </button>

              <button
                onClick={handleBuyNow}
                className="w-full px-6 py-3 bg-black-primary text-white rounded-lg hover:bg-opacity-90 transition font-semibold"
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
