import { Link, useNavigate } from 'react-router-dom'
import { useCartStore } from '@stores/cartStore'
import { useAuthStore } from '@stores/authStore'
import { useEffect, useState } from 'react'

export default function Cart() {
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const [isReady, setIsReady] = useState(false)
  const { simpleItems: items, removeFromCart, updateQuantity, clearCart } = useCartStore()

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const tax = subtotal * 0.1 // 10% tax
  const shipping = subtotal > 100 ? 0 : 15
  const total = subtotal + tax + shipping

  const formatPrice = (price: number) => {
    if (typeof price !== 'number' || isNaN(price)) {
      console.warn('[Cart] Invalid price:', price)
      return '$0.00'
    }
    return price.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
    })
  }

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    navigate('/checkout')
  }

  useEffect(() => {
    setIsReady(true)
  }, [])

  if (!isReady) {
    return (
      <div className="min-h-screen bg-ivory py-12">
        <div className="container-base">
          <p className="text-center text-gray-600">Loading cart...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ivory py-12">
      <div className="container-base">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-heading font-bold text-black-primary mb-2">Shopping Cart</h1>
          <p className="text-gray-600">Review and manage your items</p>
        </div>

        {items.length === 0 ? (
          // Empty Cart
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="mb-6">
              <div className="text-5xl mb-4">🛒</div>
              <h2 className="text-2xl font-heading font-bold text-black-primary mb-2">
                Your cart is empty
              </h2>
              <p className="text-gray-600 mb-8">
                Start shopping to add items to your cart
              </p>
            </div>
            <Link
              to="/products"
              className="inline-block px-8 py-3 bg-rose-nude text-white rounded-lg hover:bg-opacity-90 transition font-semibold"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-black-primary">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-black-primary">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-black-primary">
                        Quantity
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-black-primary">
                        Total
                      </th>
                      <th className="px-6 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id} className="border-b hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex gap-4">
                            {item.image && (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-16 h-16 object-cover rounded"
                              />
                            )}
                            <div>
                              <Link
                                to={`/products/${item.slug}`}
                                className="font-semibold text-black-primary hover:text-rose-nude transition"
                              >
                                {item.name}
                              </Link>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">{formatPrice(item.price)}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 w-32">
                            <button
                              onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                              className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-50"
                            >
                              −
                            </button>
                            <span className="flex-1 text-center font-semibold">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-50"
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-semibold">
                          {formatPrice(item.price * item.quantity)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Continue Shopping */}
              <div className="mt-6">
                <Link
                  to="/products"
                  className="text-rose-nude hover:text-opacity-80 transition font-semibold flex items-center gap-2"
                >
                  ← Continue Shopping
                </Link>
              </div>
            </div>

            {/* Cart Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
                <h3 className="text-lg font-heading font-bold text-black-primary mb-6">
                  Order Summary
                </h3>

                <div className="space-y-4 mb-6 pb-6 border-b">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tax (10%)</span>
                    <span>{formatPrice(tax)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span>
                      {shipping === 0 ? (
                        <span className="text-green-600 font-semibold">Free</span>
                      ) : (
                        formatPrice(shipping)
                      )}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-6">
                  <span className="text-lg font-heading font-bold text-black-primary">
                    Total
                  </span>
                  <span className="text-2xl font-heading font-bold text-rose-nude">
                    {formatPrice(total)}
                  </span>
                </div>

                {subtotal > 100 && (
                  <p className="text-xs text-green-600 mb-4 p-2 bg-green-50 rounded">
                    ✓ You qualify for free shipping!
                  </p>
                )}

                <button
                  onClick={handleCheckout}
                  className="w-full px-6 py-3 bg-black-primary text-white rounded-lg hover:bg-opacity-90 transition font-semibold mb-3"
                >
                  Proceed to Checkout
                </button>

                <button
                  onClick={() => clearCart()}
                  className="w-full px-6 py-3 border border-gray-300 text-black-primary rounded-lg hover:bg-gray-50 transition font-semibold text-sm"
                >
                  Clear Cart
                </button>

                {!isAuthenticated && (
                  <p className="text-xs text-gray-600 mt-4 text-center">
                    You need to be{' '}
                    <Link to="/login" className="text-rose-nude hover:underline font-semibold">
                      logged in
                    </Link>{' '}
                    to checkout
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
