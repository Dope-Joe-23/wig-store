import { useState, useEffect, useCallback, useRef } from 'react'
import { orderService } from '@services/orders'
import { Order } from '@/types/index'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@stores/authStore'
import { useCartStore } from '@stores/cartStore'
import { formatCurrency, getImageUrl, getApiErrorMessage } from '@utils/helpers'

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-purple-100 text-purple-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  refunded: 'bg-orange-100 text-orange-800',
}

const statusLabels: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
}

const paymentStatusColors: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-700',
  paid: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  cancelled: 'bg-red-100 text-red-800',
  refunded: 'bg-orange-100 text-orange-800',
}

const STATUS_TABS = [
  { value: '', label: 'All Orders' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
] as const

const PAGE_SIZE = 10

export function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const [cancelConfirmId, setCancelConfirmId] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [nextPage, setNextPage] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const addToCart = useCartStore((state) => state.addToCart)
  const navigate = useNavigate()

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }, [])

  const initialLoadRef = useRef(true)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    fetchOrders(true)
  }, [isAuthenticated, navigate])

  useEffect(() => {
    if (isAuthenticated && !initialLoadRef.current) {
      fetchOrders(true)
    }
    initialLoadRef.current = false
  }, [activeTab])

  const fetchOrders = async (reset = false) => {
    try {
      if (reset) {
        setLoading(true)
        setError(null)
        setOrders([])
        setNextPage(null)
      }

      const params: any = { page_size: PAGE_SIZE }
      if (activeTab) params.status = activeTab
      if (searchQuery.trim()) params.search = searchQuery.trim()

      if (!reset && nextPage) {
        params.page = new URLSearchParams(nextPage.split('?')[1]).get('page') || undefined
      }

      const res = await orderService.getOrders(params)
      const data = res.data

      const newOrders = Array.isArray(data) ? data : data.results || []
      setOrders(reset ? newOrders : (prev) => [...prev, ...newOrders])
      setNextPage(data.next || null)
    } catch (err: any) {
      if (reset) {
        setError(getApiErrorMessage(err, 'Failed to load orders'))
      }
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const handleCancelOrder = async (orderId: number) => {
    setActionLoading(orderId)
    setCancelConfirmId(null)
    try {
      const res = await orderService.cancelOrder(orderId)
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? res.data : o))
      )
      showToast('Order cancelled successfully', 'success')
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Failed to cancel order'
      showToast(msg, 'error')
    } finally {
      setActionLoading(null)
    }
  }

  const handleReorder = (order: Order) => {
    order.items.forEach((item) => {
      const product = item.product
      if (!product) return
      addToCart({
        id: product.id,
        name: product.name || `Product #${product.id}`,
        price: Number(item.price),
        quantity: item.quantity,
        image: product.primary_image?.url || '',
        slug: product.slug || '',
      })
    })
    showToast('Items added to your cart!', 'success')
    navigate('/cart')
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchOrders(true)
  }

  const handleLoadMore = () => {
    setLoadingMore(true)
    fetchOrders(false)
  }

  const filteredOrders = orders.filter((order) => {
    if (searchQuery && !order.order_number.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    return true
  })

  if (!isAuthenticated) return null

  return (
    <div className="min-h-screen bg-ivory py-8 sm:py-12">
      <div className="container-base">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-heading font-bold text-black-primary mb-1">My Orders</h1>
              <p className="text-gray-600">View and track your orders</p>
            </div>
            <button
              onClick={() => navigate('/products')}
              className="px-6 py-2.5 bg-rose-nude text-white rounded-lg hover:bg-rose-nude/90 font-semibold transition flex items-center gap-2 self-start"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Shop More
            </button>
          </div>

          {/* Status Filter Tabs */}
          <div className="mb-6 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="flex gap-2 min-w-max sm:min-w-0 pb-2">
              {STATUS_TABS.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition ${
                    activeTab === tab.value
                      ? 'bg-rose-nude text-white shadow-sm'
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by order number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 pl-11 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-nude focus:border-transparent outline-none transition bg-white"
              />
              <svg
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </form>

          {/* Content States */}
          {loading ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <div className="w-12 h-12 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-500">Loading orders...</p>
            </div>
          ) : error ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <div className="text-5xl mb-4">⚠️</div>
              <h3 className="text-xl font-semibold text-black-primary mb-2">Something went wrong</h3>
              <p className="text-red-600 mb-6">{error}</p>
              <button
                onClick={() => fetchOrders(true)}
                className="px-6 py-2.5 bg-rose-nude text-white rounded-lg hover:bg-rose-nude/90 font-semibold transition"
              >
                Try Again
              </button>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <p className="text-5xl mb-4">
                {searchQuery || activeTab ? '🔍' : '📦'}
              </p>
              <h3 className="text-xl font-semibold text-black-primary mb-2">
                {searchQuery || activeTab ? 'No orders found' : 'No orders yet'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchQuery || activeTab
                  ? 'Try adjusting your search or filters.'
                  : "You haven't placed any orders yet. Start shopping to see your orders here."
                }
              </p>
              {(searchQuery || activeTab) ? (
                <button
                  onClick={() => { setSearchQuery(''); setActiveTab('') }}
                  className="px-6 py-2.5 border border-gray-300 text-black-primary rounded-lg hover:bg-gray-50 font-semibold transition"
                >
                  Clear Filters
                </button>
              ) : (
                <button
                  onClick={() => navigate('/products')}
                  className="inline-block px-8 py-3 bg-rose-nude text-white rounded-lg hover:bg-rose-nude/90 font-semibold transition"
                >
                  Start Shopping
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Results Summary */}
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-500">
                  Showing {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''}
                  {activeTab ? ` (${statusLabels[activeTab]?.toLowerCase() || activeTab})` : ''}
                </p>
              </div>

              {/* Orders List */}
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-200"
                  >
                    {/* Order Header */}
                    <div
                      className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer"
                      onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                          <span className="font-semibold text-black-primary truncate">#{order.order_number}</span>
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColors[order.status] || 'bg-gray-100 text-gray-700'}`}>
                            {statusLabels[order.status] || order.status}
                          </span>
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${paymentStatusColors[order.payment_status] || 'bg-gray-100 text-gray-700'}`}>
                            {order.payment_status === 'paid' ? 'Paid' : order.payment_status || 'Unpaid'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">
                          {new Date(order.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 sm:text-right">
                        <div>
                          <p className="text-xl font-bold text-black-primary">{formatCurrency(Number(order.total))}</p>
                          <p className="text-sm text-gray-500">{order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}</p>
                        </div>
                        <svg
                          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                            expandedId === order.id ? 'rotate-180' : ''
                          }`}
                          fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>

                    {/* Order Items Preview (collapsed) */}
                    {!expandedId || expandedId !== order.id ? (
                      order.items && order.items.length > 0 && (
                        <div className="px-4 sm:px-6 pb-4">
                          <div className="flex gap-3 overflow-x-auto pb-1">
                            {order.items.slice(0, 5).map((item) => (
                              <div key={item.id} className="flex-shrink-0 w-14 h-14 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                                {item.product?.primary_image?.url ? (
                                  <img
                                    src={getImageUrl(item.product.primary_image.url)}
                                    alt={item.product.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-[10px]">
                                    No img
                                  </div>
                                )}
                              </div>
                            ))}
                            {order.items.length > 5 && (
                              <div className="flex-shrink-0 w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center text-sm text-gray-500 font-semibold border border-gray-200">
                                +{order.items.length - 5}
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    ) : null}

                    {/* Expanded Details */}
                    {expandedId === order.id && (
                      <div className="border-t border-gray-100 animate-fadeIn">
                        {/* Price Breakdown */}
                        <div className="px-4 sm:px-6 py-4 bg-gray-50 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Subtotal</span>
                            <span className="text-black-primary font-medium">{formatCurrency(Number(order.subtotal))}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Shipping</span>
                            <span className="text-black-primary font-medium">
                              {Number(order.shipping_cost) > 0 ? formatCurrency(Number(order.shipping_cost)) : 'Free'}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Tax</span>
                            <span className="text-black-primary font-medium">{formatCurrency(Number(order.tax))}</span>
                          </div>
                          <div className="flex justify-between text-sm font-bold pt-2 border-t border-gray-200">
                            <span className="text-black-primary">Total</span>
                            <span className="text-black-primary">{formatCurrency(Number(order.total))}</span>
                          </div>
                        </div>

                        {/* Order Items Full List */}
                        {order.items && order.items.length > 0 && (
                          <div className="px-4 sm:px-6 py-4 divide-y divide-gray-100">
                            <p className="text-sm font-semibold text-black-primary mb-3">Items</p>
                            {order.items.map((item) => (
                              <div key={item.id} className="flex items-center gap-4 py-3">
                                <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                                  {item.product?.primary_image?.url ? (
                                    <img
                                      src={getImageUrl(item.product.primary_image.url)}
                                      alt={item.product.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                                      No img
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-black-primary truncate">
                                    {item.product?.name || `Product #${item.product?.id || item.id}`}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    Qty: {item.quantity} × {formatCurrency(Number(item.price))}
                                  </p>
                                </div>
                                <p className="text-sm font-semibold text-black-primary">
                                  {formatCurrency(Number(item.price) * item.quantity)}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Notes */}
                        {order.notes && (
                          <div className="px-4 sm:px-6 py-3 border-t border-gray-100">
                            <p className="text-sm font-semibold text-black-primary mb-1">Notes</p>
                            <p className="text-sm text-gray-600">{order.notes}</p>
                          </div>
                        )}

                        {/* Order Actions */}
                        <div className="px-4 sm:px-6 py-3 border-t border-gray-100 flex flex-wrap gap-2">
                          {(order.status === 'pending' || order.status === 'confirmed') && (
                            cancelConfirmId === order.id ? (
                              <div className="flex items-center gap-2 w-full sm:w-auto">
                                <span className="text-sm text-red-600">Cancel this order?</span>
                                <button
                                  onClick={() => handleCancelOrder(order.id)}
                                  disabled={actionLoading === order.id}
                                  className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition disabled:opacity-50"
                                >
                                  {actionLoading === order.id ? '...' : 'Yes'}
                                </button>
                                <button
                                  onClick={() => setCancelConfirmId(null)}
                                  className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition"
                                >
                                  No
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setCancelConfirmId(order.id)}
                                className="px-4 py-1.5 border border-red-300 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-50 transition"
                              >
                                Cancel Order
                              </button>
                            )
                          )}
                          {order.status === 'delivered' && (
                            <button
                              onClick={() => handleReorder(order)}
                              className="px-4 py-1.5 bg-rose-nude text-white rounded-lg text-sm font-semibold hover:bg-rose-nude/90 transition"
                            >
                              Reorder
                            </button>
                          )}
                          {order.status === 'shipped' && (
                            <button
                              onClick={() => showToast('Tracking information coming soon', 'success')}
                              className="px-4 py-1.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition"
                            >
                              Track Package
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Load More Pagination */}
              {nextPage && (
                <div className="text-center mt-8">
                  <button
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="px-8 py-3 border-2 border-rose-nude text-rose-nude rounded-lg font-semibold hover:bg-rose-50 transition disabled:opacity-50"
                  >
                    {loadingMore ? (
                      <span className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-rose-200 border-t-rose-nude rounded-full animate-spin" />
                        Loading...
                      </span>
                    ) : (
                      'Load More Orders'
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 px-5 py-3 rounded-lg shadow-lg text-white font-medium transition-all duration-300 z-50 ${
            toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          }`}
        >
          <div className="flex items-center gap-2">
            {toast.type === 'success' ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            {toast.message}
          </div>
        </div>
      )}
    </div>
  )
}
