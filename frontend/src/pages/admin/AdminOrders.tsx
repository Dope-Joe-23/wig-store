import { useState, useEffect } from 'react'
import { AdminLayout } from '@components/admin/AdminLayout'
import { apiClient } from '@services/api'
import { CloseIcon } from '@components/Icons'
import { motion } from 'framer-motion'

interface Order {
  id: number
  order_number: string
  user: { id: number; username: string; email: string; first_name: string; last_name: string }
  status: string
  payment_status: string
  total: string
  created_at: string
  items: any[]
}

export function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get('/orders/')
      setOrders(response.data.results || response.data)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      await apiClient.patch(`/orders/${orderId}/`, {
        status: newStatus,
      })
      setOrders(
        orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      )
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus })
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update order')
    }
  }

  const filteredOrders =
    filterStatus === 'all'
      ? orders
      : orders.filter((o) => o.status === filterStatus)

  const statusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700'
      case 'confirmed':
        return 'bg-blue-100 text-blue-700'
      case 'processing':
        return 'bg-purple-100 text-purple-700'
      case 'shipped':
        return 'bg-indigo-100 text-indigo-700'
      case 'delivered':
        return 'bg-green-100 text-green-700'
      case 'cancelled':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const paymentStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700'
      case 'paid':
        return 'bg-green-100 text-green-700'
      case 'failed':
        return 'bg-red-100 text-red-700'
      case 'refunded':
        return 'bg-blue-100 text-blue-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  if (loading) {
    return (
      <AdminLayout activeTab="orders">
        {/* Skeleton filter pills */}
        <div className="mb-4 sm:mb-6 flex gap-1 sm:gap-2 flex-wrap">
          {['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map((_, i) => (
            <div key={i} className="h-8 w-16 sm:w-20 bg-gray-200 rounded-lg skeleton-shimmer" />
          ))}
        </div>

        {/* Desktop skeleton table */}
        <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                {['Order #', 'Customer', 'Total', 'Status', 'Payment', 'Date'].map((h, i) => (
                  <th key={i} className="px-6 py-4 text-left">
                    <div className="h-3 w-16 bg-gray-200 rounded skeleton-shimmer" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[...Array(6)].map((_, i) => (
                <motion.tr
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.06, duration: 0.3 }}
                  className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}
                >
                  <td className="px-6 py-4">
                    <div className="h-5 w-24 bg-gray-200 rounded skeleton-shimmer" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 w-32 bg-gray-200 rounded skeleton-shimmer mb-1" />
                    <div className="h-3 w-24 bg-gray-200 rounded skeleton-shimmer" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 w-16 bg-gray-200 rounded skeleton-shimmer" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-6 w-20 bg-gray-200 rounded-full skeleton-shimmer" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-6 w-16 bg-gray-200 rounded-full skeleton-shimmer" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-3 w-20 bg-gray-200 rounded skeleton-shimmer" />
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile skeleton cards */}
        <div className="md:hidden space-y-3">
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.3 }}
              className="bg-white rounded-lg shadow p-4 border-l-4 border-gray-200"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="h-5 w-28 bg-gray-200 rounded skeleton-shimmer mb-1" />
                  <div className="h-3 w-20 bg-gray-200 rounded skeleton-shimmer" />
                </div>
                <div className="h-6 w-16 bg-gray-200 rounded-full skeleton-shimmer" />
              </div>
              <div className="mb-2 pb-2 border-b border-gray-100">
                <div className="h-4 w-36 bg-gray-200 rounded skeleton-shimmer mb-1" />
                <div className="h-3 w-40 bg-gray-200 rounded skeleton-shimmer" />
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <div className="h-3 w-12 bg-gray-200 rounded skeleton-shimmer mb-1" />
                  <div className="h-6 w-16 bg-gray-200 rounded skeleton-shimmer" />
                </div>
                <div className="h-6 w-14 bg-gray-200 rounded-full skeleton-shimmer" />
              </div>
            </motion.div>
          ))}
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout activeTab="orders">
      {error && (
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm sm:text-base">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Orders List */}
        <div className="lg:col-span-2">
          {/* Filters */}
          <div className="mb-4 sm:mb-6 flex gap-1 sm:gap-2 flex-wrap">
            {['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-2 sm:px-4 py-1 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm transition whitespace-nowrap ${
                  filterStatus === status
                    ? 'bg-rose-nude text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Order #</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Customer</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Total</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Payment</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredOrders.map((order, index) => (
                    <tr
                      key={order.id}
                      className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:bg-rose-nude/5 transition-colors duration-150 cursor-pointer`}
                      onClick={() => setSelectedOrder(order)}
                    >
                      <td className="px-6 py-4">
                        <span className="font-bold text-sm text-rose-nude bg-rose-nude/5 px-2.5 py-1 rounded-lg">{order.order_number}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-sm text-gray-900">
                            {order.user.first_name} {order.user.last_name}
                          </p>
                          <p className="text-xs text-gray-500">{order.user.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-sm text-gray-900">GHS {parseFloat(order.total).toFixed(2)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            order.status === 'delivered' ? 'bg-emerald-500' :
                            order.status === 'shipped' ? 'bg-indigo-500' :
                            order.status === 'processing' ? 'bg-purple-500' :
                            order.status === 'confirmed' ? 'bg-blue-500' :
                            order.status === 'cancelled' ? 'bg-red-500' :
                            'bg-amber-500'
                          }`} />
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${
                            order.status === 'delivered' ? 'bg-emerald-50 text-emerald-700' :
                            order.status === 'shipped' ? 'bg-indigo-50 text-indigo-700' :
                            order.status === 'processing' ? 'bg-purple-50 text-purple-700' :
                            order.status === 'confirmed' ? 'bg-blue-50 text-blue-700' :
                            order.status === 'cancelled' ? 'bg-red-50 text-red-700' :
                            'bg-amber-50 text-amber-700'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                          order.payment_status === 'paid' ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' :
                          order.payment_status === 'failed' ? 'bg-red-50 text-red-700 ring-1 ring-red-200' :
                          order.payment_status === 'refunded' ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-200' :
                          'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            order.payment_status === 'paid' ? 'bg-emerald-500' :
                            order.payment_status === 'failed' ? 'bg-red-500' :
                            order.payment_status === 'refunded' ? 'bg-blue-500' :
                            'bg-amber-500'
                          }`} />
                          {order.payment_status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs text-gray-500 font-medium">{new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-3">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                className="bg-white rounded-lg shadow p-4 hover:shadow-md transition cursor-pointer border-l-4 border-rose-nude"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-bold text-base text-rose-nude">{order.order_number}</p>
                    <p className="text-xs text-gray-600">{new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${statusBadgeColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>

                <div className="mb-2 pb-2 border-b border-gray-200">
                  <p className="text-sm text-gray-700">
                    {order.user.first_name} {order.user.last_name}
                  </p>
                  <p className="text-xs text-gray-600">{order.user.email}</p>
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs text-gray-600">Amount</p>
                    <p className="font-bold text-lg text-black-primary">GHS {parseFloat(order.total).toFixed(2)}</p>
                  </div>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${paymentStatusBadgeColor(order.payment_status)}`}>
                    {order.payment_status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {filteredOrders.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg">
              <p className="text-gray-600">No orders found</p>
            </div>
          )}
        </div>

        {/* Order Details - Modal on Mobile, Sidebar on Desktop */}
        {selectedOrder && (
          <>
            {/* Mobile Modal Overlay */}
            <div
              className="md:hidden fixed inset-0 backdrop-blur-md bg-black/30 z-40"
              onClick={() => setSelectedOrder(null)}
            />

            {/* Mobile Modal */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-50 max-h-[90vh] overflow-y-auto p-6 animate-slide-up">
              {/* Header */}
              <div className="flex justify-between items-start mb-4 sticky top-0 bg-white -mx-6 px-6 py-4 -mt-6 border-b border-gray-200">
                <div className="min-w-0">
                  <h3 className="text-lg font-bold text-black-primary break-words">{selectedOrder.order_number}</h3>
                  <p className="text-xs text-gray-600">{new Date(selectedOrder.created_at).toLocaleString()}</p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-gray-600 flex-shrink-0 ml-2"
                >
                  <CloseIcon className="w-6 h-6" />
                </button>
              </div>

              {/* Customer Info - Prominent */}
              <div className="mb-4 p-3 bg-rose-nude/10 rounded-lg border-l-4 border-rose-nude">
                <p className="text-xs text-gray-600 mb-1">Customer</p>
                <p className="text-lg font-bold text-black-primary">
                  {selectedOrder.user.first_name || selectedOrder.user.last_name 
                    ? `${selectedOrder.user.first_name || ''} ${selectedOrder.user.last_name || ''}`.trim()
                    : selectedOrder.user.username || 'N/A'}
                </p>
                <p className="text-sm text-gray-700 break-all">{selectedOrder.user.email}</p>
              </div>

              {/* Order Total */}
              <div className="mb-4 p-3 bg-gray-50 rounded">
                <p className="text-xs text-gray-600">Total Amount</p>
                <p className="text-2xl font-bold text-rose-nude">GHS {parseFloat(selectedOrder.total).toFixed(2)}</p>
              </div>

              {/* Status Badges */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Order Status</p>
                  <span className={`inline-block px-3 py-2 rounded-full text-xs font-semibold ${statusBadgeColor(selectedOrder.status)}`}>
                    {selectedOrder.status}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Payment Status</p>
                  <span className={`inline-block px-3 py-2 rounded-full text-xs font-semibold ${paymentStatusBadgeColor(selectedOrder.payment_status)}`}>
                    {selectedOrder.payment_status}
                  </span>
                </div>
              </div>                {/* Order Items */}
                <div className="mb-4">
                  <h4 className="font-semibold text-sm text-black-primary mb-2">Items</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selectedOrder.items?.map((item, idx) => {
                      const prodDetail = item.product_detail
                      const imgUrl = prodDetail?.primary_image?.url
                      const prodName = prodDetail?.name || item.product_name || `Product #${item.product || item.id}`
                      return (
                        <div key={idx} className="flex items-center gap-3 pb-2 border-b border-gray-100">
                          {imgUrl ? (
                            <img
                              src={imgUrl}
                              alt={prodName}
                              className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-gray-200"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-gray-900 truncate">{prodName}</p>
                            <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                          </div>
                          <p className="text-xs font-semibold text-gray-900 flex-shrink-0">GHS {parseFloat(item.price).toFixed(2)}</p>
                        </div>
                      )
                    })}
                  </div>
                </div>

              {/* Status Update */}
              <div>
                <h4 className="font-semibold text-sm text-black-primary mb-2">Update Status</h4>
                <select
                  value={selectedOrder.status}
                  onChange={(e) => updateOrderStatus(selectedOrder.id, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-rose-nude outline-none text-sm"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Desktop Sidebar */}
            <div className="hidden md:block bg-white rounded-lg shadow p-4 sm:p-6 h-fit sticky top-4">
              <div className="flex justify-between items-start mb-4 sm:mb-6">
                <div className="min-w-0">
                  <h3 className="text-lg sm:text-xl font-bold text-black-primary break-words">{selectedOrder.order_number}</h3>
                  <p className="text-xs sm:text-sm text-gray-600">{new Date(selectedOrder.created_at).toLocaleString()}</p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-gray-600 text-xl lg:text-2xl flex-shrink-0 ml-2"
                >
                  ✕
                </button>
              </div>

              {/* Customer Info */}
              <div className="mb-4 sm:mb-6 p-3 bg-rose-nude/10 rounded-lg border-l-4 border-rose-nude">
                <p className="text-xs sm:text-sm text-gray-600 mb-1">Customer</p>
                <p className="text-base sm:text-lg font-bold text-black-primary">
                  {selectedOrder.user.first_name || selectedOrder.user.last_name
                    ? `${selectedOrder.user.first_name || ''} ${selectedOrder.user.last_name || ''}`.trim()
                    : selectedOrder.user.username || 'N/A'}
                </p>
                <p className="text-xs sm:text-sm text-gray-700 break-all">{selectedOrder.user.email}</p>
              </div>

              {/* Order Items */}
              <div className="mb-4 sm:mb-6">
                <h4 className="font-semibold text-sm sm:text-base text-black-primary mb-2">Items</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {selectedOrder.items?.map((item, idx) => {
                    const prodDetail = item.product_detail
                    const imgUrl = prodDetail?.primary_image?.url
                    const prodName = prodDetail?.name || item.product_name || `Product #${item.product || item.id}`
                    return (
                      <div key={idx} className="flex items-center gap-3 pb-2 border-b border-gray-100">
                        {imgUrl ? (
                          <img
                            src={imgUrl}
                            alt={prodName}
                            className="w-12 h-12 rounded-lg object-cover flex-shrink-0 border border-gray-200"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{prodName}</p>
                          <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-sm font-semibold text-gray-900 flex-shrink-0">GHS {parseFloat(item.price).toFixed(2)}</p>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Order Total */}
              <div className="mb-4 sm:mb-6 p-3 bg-gray-50 rounded">
                <p className="text-xs sm:text-sm text-gray-600">Total Amount</p>
                <p className="text-xl sm:text-2xl font-bold text-rose-nude">GHS {parseFloat(selectedOrder.total).toFixed(2)}</p>
              </div>

              {/* Status Update */}
              <div>
                <h4 className="font-semibold text-sm sm:text-base text-black-primary mb-2">Update Status</h4>
                <select
                  value={selectedOrder.status}
                  onChange={(e) => updateOrderStatus(selectedOrder.id, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-rose-nude outline-none text-sm"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  )
}
