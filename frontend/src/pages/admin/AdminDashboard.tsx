import { useState, useEffect } from 'react'
import { AdminLayout } from '@components/admin/AdminLayout'
import { apiClient } from '@services/api'

interface DashboardStats {
  total_users: number
  total_products: number
  total_orders: number
  total_revenue: number
  pending_orders: number
  low_stock_products: number
}

export function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get('/dashboard/stats/')
      setStats(response.data)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load dashboard statistics')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout activeTab="dashboard">
        <div className="text-center py-12">
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout activeTab="dashboard">
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
        {/* Total Users */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-5 lg:p-6 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-gray-600 text-xs sm:text-sm font-semibold mb-1">Total Users</p>
              <p className="text-2xl sm:text-2xl lg:text-3xl font-bold text-black-primary">{stats?.total_users || 0}</p>
            </div>
            <div className="text-3xl sm:text-4xl ml-2 flex-shrink-0">👥</div>
          </div>
        </div>

        {/* Total Products */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-5 lg:p-6 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-gray-600 text-xs sm:text-sm font-semibold mb-1">Total Products</p>
              <p className="text-2xl sm:text-2xl lg:text-3xl font-bold text-black-primary">{stats?.total_products || 0}</p>
            </div>
            <div className="text-3xl sm:text-4xl ml-2 flex-shrink-0">📦</div>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-5 lg:p-6 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-gray-600 text-xs sm:text-sm font-semibold mb-1">Total Orders</p>
              <p className="text-2xl sm:text-2xl lg:text-3xl font-bold text-black-primary">{stats?.total_orders || 0}</p>
            </div>
            <div className="text-3xl sm:text-4xl ml-2 flex-shrink-0">🛒</div>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-5 lg:p-6 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-gray-600 text-xs sm:text-sm font-semibold mb-1">Total Revenue</p>
              <p className="text-2xl sm:text-2xl lg:text-3xl font-bold text-rose-nude">
                GHS {parseFloat(stats?.total_revenue?.toString() || '0').toFixed(2)}
              </p>
            </div>
            <div className="text-3xl sm:text-4xl ml-2 flex-shrink-0">💰</div>
          </div>
        </div>

        {/* Pending Orders */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-5 lg:p-6 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-gray-600 text-xs sm:text-sm font-semibold mb-1">Pending Orders</p>
              <p className="text-2xl sm:text-2xl lg:text-3xl font-bold text-orange-500">{stats?.pending_orders || 0}</p>
            </div>
            <div className="text-3xl sm:text-4xl ml-2 flex-shrink-0">⏳</div>
          </div>
        </div>

        {/* Low Stock Products */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-5 lg:p-6 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-gray-600 text-xs sm:text-sm font-semibold mb-1">Low Stock Items</p>
              <p className="text-2xl sm:text-2xl lg:text-3xl font-bold text-red-600">{stats?.low_stock_products || 0}</p>
            </div>
            <div className="text-3xl sm:text-4xl ml-2 flex-shrink-0">⚠️</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-5 lg:p-6">
        <h3 className="text-lg sm:text-xl font-bold text-black-primary mb-3 sm:mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 lg:gap-4">
          <a
            href="/admin/products"
            className="p-3 sm:p-4 border border-gray-200 rounded-lg hover:border-rose-nude hover:bg-rose-nude/5 transition text-center"
          >
            <p className="text-2xl mb-2">📦</p>
            <p className="font-semibold text-sm sm:text-base text-black-primary">Manage Products</p>
            <p className="text-xs sm:text-sm text-gray-600">Add/Edit/Delete products</p>
          </a>

          <a
            href="/admin/orders"
            className="p-3 sm:p-4 border border-gray-200 rounded-lg hover:border-rose-nude hover:bg-rose-nude/5 transition text-center"
          >
            <p className="text-2xl mb-2">🛒</p>
            <p className="font-semibold text-sm sm:text-base text-black-primary">View Orders</p>
            <p className="text-xs sm:text-sm text-gray-600">Process & track orders</p>
          </a>

          <a
            href="/admin/users"
            className="p-3 sm:p-4 border border-gray-200 rounded-lg hover:border-rose-nude hover:bg-rose-nude/5 transition text-center"
          >
            <p className="text-2xl mb-2">👥</p>
            <p className="font-semibold text-sm sm:text-base text-black-primary">Manage Users</p>
            <p className="text-xs sm:text-sm text-gray-600">View user accounts</p>
          </a>
        </div>
      </div>
    </AdminLayout>
  )
}
