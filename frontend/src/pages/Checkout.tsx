import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { checkoutSchema, type CheckoutFormData } from '@schemas/checkout'
import { useCartStore } from '@stores/cartStore'
import { useAuthStore } from '@stores/authStore'
import { orderService } from '@services/orders'
import { paymentService } from '@services/payments'

export default function Checkout() {
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const user = useAuthStore((state) => state.user)
  const { simpleItems: items } = useCartStore()
  const [apiError, setApiError] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isReady, setIsReady] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      email: user?.email || '',
      payment_method: 'mtn_momo',
    },
  })

  const paymentMethod = watch('payment_method')

  // Calculate order totals
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const tax = subtotal * 0.1
  const shipping = subtotal > 100 ? 0 : 15
  const total = subtotal + tax + shipping

  const formatPrice = (price: number) => {
    if (typeof price !== 'number' || isNaN(price)) {
      console.warn('[Checkout] Invalid price:', price)
      return 'GHS 0.00'
    }
    return `GHS ${price.toFixed(2)}`
  }

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    setIsReady(true)
  }, [isAuthenticated, navigate])

  // Redirect if cart is empty
  useEffect(() => {
    if (isReady && items.length === 0) {
      navigate('/cart')
    }
  }, [isReady, items.length, navigate])

  const onSubmit = async (data: CheckoutFormData) => {
    try {
      setApiError('')
      setIsSubmitting(true)

      // Prepare cart items for order
      const cartItems = items.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        price: item.price,
      }))

      // Create order via API
      const response = await orderService.createOrder({
        cart_items: cartItems,
        subtotal,
        tax,
        shipping_cost: shipping,
        total,
        notes: `Shipping to: ${data.street_address}, ${data.city}, ${data.state} ${data.postal_code}. Payment via: ${data.payment_method}`,
      })

      console.log('Order created:', response.data)

      const paymentInitData = {
        order_id: response.data.id,
        email: data.email,
        phone: data.momo_phone || data.phone,
        amount: Math.round(total * 100) / 100,
        payment_method: data.payment_method,
      }

      const paymentResponse = await paymentService.initializePayment(paymentInitData)
      console.log('Payment initialized:', paymentResponse.data)

      window.location.href = paymentResponse.data.authorization_url
    } catch (error: any) {
      const message =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.response?.data?.cart_items?.[0] ||
        error.response?.data?.error ||
        'Failed to place order. Please try again.'
      setApiError(message)
      console.error('Order error:', error.response?.data || error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isReady) {
    return (
      <div className="min-h-screen bg-ivory py-12">
        <div className="container-base">
          <p className="text-center text-gray-600">Loading checkout...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ivory py-12">
      <div className="container-base">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-heading font-bold text-black-primary mb-2">Checkout</h1>
          <p className="text-gray-600">Complete your purchase securely</p>
        </div>

        {/* Error Alert */}
        {apiError && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{apiError}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Shipping Address Section */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-heading font-bold text-black-primary mb-6">
                  Shipping Address
                </h2>

                <div className="space-y-6">
                  {/* Name Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-black-primary mb-2">
                        First Name
                      </label>
                      <input
                        {...register('first_name')}
                        placeholder="John"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-nude focus:border-transparent outline-none transition"
                      />
                      {errors.first_name && (
                        <p className="text-red-600 text-sm mt-1">{errors.first_name.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-black-primary mb-2">
                        Last Name
                      </label>
                      <input
                        {...register('last_name')}
                        placeholder="Doe"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-nude focus:border-transparent outline-none transition"
                      />
                      {errors.last_name && (
                        <p className="text-red-600 text-sm mt-1">{errors.last_name.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Email & Phone */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-black-primary mb-2">
                        Email
                      </label>
                      <input
                        {...register('email')}
                        type="email"
                        placeholder="john@example.com"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-nude focus:border-transparent outline-none transition"
                      />
                      {errors.email && (
                        <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-black-primary mb-2">
                        Phone
                      </label>
                      <input
                        {...register('phone')}
                        placeholder="+233 (55) 123-4567 or 0551234567"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-nude focus:border-transparent outline-none transition"
                      />
                      {errors.phone && (
                        <p className="text-red-600 text-sm mt-1">{errors.phone.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-sm font-semibold text-black-primary mb-2">
                      Street Address
                    </label>
                    <input
                      {...register('street_address')}
                      placeholder="123 Main Street, Accra"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-nude focus:border-transparent outline-none transition"
                    />
                    {errors.street_address && (
                      <p className="text-red-600 text-sm mt-1">{errors.street_address.message}</p>
                    )}
                  </div>

                  {/* City, State, Zip */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="col-span-1">
                      <label className="block text-sm font-semibold text-black-primary mb-2">
                        City
                      </label>
                      <input
                        {...register('city')}
                        placeholder="Accra"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-nude focus:border-transparent outline-none transition"
                      />
                      {errors.city && (
                        <p className="text-red-600 text-sm mt-1">{errors.city.message}</p>
                      )}
                    </div>

                    <div className="col-span-1">
                      <label className="block text-sm font-semibold text-black-primary mb-2">
                        State/Region
                      </label>
                      <input
                        {...register('state')}
                        placeholder="Greater Accra"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-nude focus:border-transparent outline-none transition"
                      />
                      {errors.state && (
                        <p className="text-red-600 text-sm mt-1">{errors.state.message}</p>
                      )}
                    </div>

                    <div className="col-span-1">
                      <label className="block text-sm font-semibold text-black-primary mb-2">
                        Postal Code
                      </label>
                      <input
                        {...register('postal_code')}
                        placeholder="00233"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-nude focus:border-transparent outline-none transition"
                      />
                      {errors.postal_code && (
                        <p className="text-red-600 text-sm mt-1">{errors.postal_code.message}</p>
                      )}
                    </div>

                    <div className="col-span-1">
                      <label className="block text-sm font-semibold text-black-primary mb-2">
                        Country
                      </label>
                      <input
                        {...register('country')}
                        placeholder="Ghana"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-nude focus:border-transparent outline-none transition"
                      />
                      {errors.country && (
                        <p className="text-red-600 text-sm mt-1">{errors.country.message}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

                  {/* Payment Method Section */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-heading font-bold text-black-primary mb-6">
                  Payment Method
                </h2>

                  <div className="space-y-4">
                  {/* Card */}
                  <label className="flex items-start p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-rose-nude transition"
                    style={{ borderColor: paymentMethod === 'card' ? 'rgb(243, 165, 165)' : undefined }}>
                    <input
                      {...register('payment_method')}
                      type="radio"
                      value="card"
                      className="w-5 h-5 mt-1"
                    />
                    <div className="ml-4 flex-1">
                      <div className="font-semibold text-black-primary">Card</div>
                      <p className="text-sm text-gray-600 mt-1">Pay securely with a debit or credit card through Paystack.</p>
                    </div>
                  </label>

                  {/* MTN Mobile Money */}
                  <label className="flex items-start p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-rose-nude transition"
                    style={{ borderColor: paymentMethod === 'mtn_momo' ? 'rgb(243, 165, 165)' : undefined }}>
                    <input
                      {...register('payment_method')}
                      type="radio"
                      value="mtn_momo"
                      className="w-5 h-5 mt-1"
                    />
                    <div className="ml-4 flex-1">
                      <div className="font-semibold text-black-primary">MTN Mobile Money</div>
                      <p className="text-sm text-gray-600 mt-1">Dial *170# or use MTN MoMo app. Fast and secure.</p>
                    </div>
                  </label>

                  {/* Telecel Mobile Money */}
                  <label className="flex items-start p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-rose-nude transition"
                    style={{ borderColor: paymentMethod === 'telecel_momo' ? 'rgb(243, 165, 165)' : undefined }}>
                    <input
                      {...register('payment_method')}
                      type="radio"
                      value="telecel_momo"
                      className="w-5 h-5 mt-1"
                    />
                    <div className="ml-4 flex-1">
                      <div className="font-semibold text-black-primary">Telecel Mobile Money</div>
                      <p className="text-sm text-gray-600 mt-1">Use Telecel MoMo app or USSD. Instant payment.</p>
                    </div>
                  </label>

                  {/* AirtelTigo Money */}
                  <label className="flex items-start p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-rose-nude transition"
                    style={{ borderColor: paymentMethod === 'airteltigo_momo' ? 'rgb(243, 165, 165)' : undefined }}>
                    <input
                      {...register('payment_method')}
                      type="radio"
                      value="airteltigo_momo"
                      className="w-5 h-5 mt-1"
                    />
                    <div className="ml-4 flex-1">
                      <div className="font-semibold text-black-primary">AirtelTigo Money</div>
                      <p className="text-sm text-gray-600 mt-1">Pay from your AirtelTigo Money wallet through Paystack.</p>
                    </div>
                  </label>

                  {errors.payment_method && (
                    <p className="text-red-600 text-sm mt-2">{errors.payment_method.message}</p>
                  )}

                  {/* Mobile Money Details */}
                  {(['mtn_momo', 'telecel_momo', 'airteltigo_momo'].includes(paymentMethod)) && (
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg space-y-4 border border-blue-200">
                      <div>
                        <label className="block text-sm font-semibold text-black-primary mb-2">
                          Mobile Money Phone Number
                        </label>
                        <input
                          {...register('momo_phone')}
                          placeholder="+233 (55) 123-4567 or 0551234567"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-nude focus:border-transparent outline-none transition"
                        />
                        {errors.momo_phone && (
                          <p className="text-red-600 text-sm mt-1">{errors.momo_phone.message}</p>
                        )}
                        <p className="text-xs text-gray-600 mt-2">
                          Enter the phone number associated with your selected mobile money account.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <Link
                  to="/cart"
                  className="flex-1 px-8 py-3 border-2 border-gray-300 text-black-primary rounded-lg hover:bg-gray-50 transition font-semibold text-center"
                >
                  Back to Cart
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Processing...' : `Place Order (${formatPrice(total)})`}
                </button>
              </div>
            </form>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24 h-fit">
              <h3 className="text-xl font-heading font-bold text-black-primary mb-6">Order Summary</h3>

              {/* Items List */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {item.name} <span className="font-semibold">×{item.quantity}</span>
                      </span>
                      <span className="font-semibold text-black-primary">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-black-primary">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax (10%)</span>
                  <span className="text-black-primary">{formatPrice(tax)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-black-primary">
                    {shipping === 0 ? (
                      <>
                        <span className="line-through text-gray-400 mr-2">GHS 15.00</span>
                        <span className="text-green-600 font-semibold">Free</span>
                      </>
                    ) : (
                      formatPrice(shipping)
                    )}
                  </span>
                </div>
              </div>

              {/* Total */}
              <div className="pt-6 border-t-2 border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-heading font-bold text-black-primary">Total</span>
                  <span className="text-2xl font-heading font-bold text-rose-nude">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>

              {/* Shipping Message */}
              {subtotal > 100 && (
                <p className="mt-4 text-sm text-green-600 font-semibold text-center">
                  ✓ You qualify for free shipping!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
