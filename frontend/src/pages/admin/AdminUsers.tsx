import { useState, useEffect } from 'react'
import { AdminLayout } from '@components/admin/AdminLayout'
import { apiClient } from '@services/api'

interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  is_staff: boolean
  phone?: string
  is_newsletter_subscribed: boolean
  created_at: string
}

export function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStaff, setFilterStaff] = useState('all')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get('/auth/users/')
      setUsers(response.data.results || response.data)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const toggleStaffStatus = async (userId: number, isStaff: boolean) => {
    try {
      await apiClient.patch(`/auth/users/${userId}/`, {
        is_staff: !isStaff,
      })
      setUsers(
        users.map((u) =>
          u.id === userId ? { ...u, is_staff: !isStaff } : u
        )
      )
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update user')
    }
  }

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.last_name.toLowerCase().includes(searchTerm.toLowerCase())

    if (filterStaff === 'staff') return matchesSearch && u.is_staff
    if (filterStaff === 'customers') return matchesSearch && !u.is_staff
    return matchesSearch
  })

  if (loading) {
    return (
      <AdminLayout activeTab="users">
        <div className="text-center py-12">
          <p className="text-gray-600">Loading users...</p>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout activeTab="users">
      {error && (
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm sm:text-base">{error}</p>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:justify-between sm:items-center mb-4 sm:mb-6">
        <div className="flex-1 min-w-0">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-nude outline-none text-sm sm:text-base"
          />
        </div>

        <div className="flex gap-1 sm:gap-2 flex-wrap">
          {['all', 'staff', 'customers'].map((filter) => (
            <button
              key={filter}
              onClick={() => setFilterStaff(filter)}
              className={`px-2 sm:px-4 py-1 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm transition whitespace-nowrap ${
                filterStaff === filter
                  ? 'bg-rose-nude text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Name</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Email</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Role</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Newsletter</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Joined</th>
                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map((user, index) => (
                <tr key={user.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:bg-rose-nude/5 transition-colors duration-150`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-nude/10 to-rose-nude/20 flex items-center justify-center text-sm font-bold text-rose-nude/60 flex-shrink-0">
                        {user.first_name ? user.first_name.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-gray-900">
                          {user.first_name} {user.last_name}
                        </p>
                        <p className="text-xs text-gray-500">@{user.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">{user.email}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${
                        user.is_staff
                          ? 'bg-violet-50 text-violet-700 ring-1 ring-violet-200'
                          : 'bg-gray-50 text-gray-600 ring-1 ring-gray-200'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${user.is_staff ? 'bg-violet-500' : 'bg-gray-400'}`} />
                      {user.is_staff ? 'Staff' : 'Customer'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${
                        user.is_newsletter_subscribed
                          ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                          : 'bg-gray-50 text-gray-500 ring-1 ring-gray-200'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${user.is_newsletter_subscribed ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                      {user.is_newsletter_subscribed ? 'Subscribed' : 'Not Subscribed'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs text-gray-500 font-medium">
                      {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => toggleStaffStatus(user.id, user.is_staff)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                        user.is_staff
                          ? 'text-red-600 bg-red-50 hover:bg-red-100'
                          : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'
                      }`}
                    >
                      {user.is_staff ? 'Remove Staff' : 'Make Staff'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3 mb-6">
        {filteredUsers.map((user) => (
          <div key={user.id} className="bg-white rounded-lg shadow p-4 hover:shadow-md transition">
            {/* Name & Role */}
            <div className="mb-3 pb-3 border-b border-gray-200">
              <div className="flex justify-between items-start gap-2 mb-2">
                <div className="min-w-0">
                  <p className="font-semibold text-base text-black-primary truncate">
                    {user.first_name} {user.last_name}
                  </p>
                  <p className="text-xs text-gray-600 truncate">@{user.username}</p>
                </div>
                <span
                  className={`inline-block px-2 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${
                    user.is_staff
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {user.is_staff ? 'Staff' : 'User'}
                </span>
              </div>
              <p className="text-xs text-gray-600 break-all">{user.email}</p>
            </div>

            {/* Newsletter & Date */}
            <div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-200">
              <div>
                <p className="text-xs text-gray-600 mb-1">Newsletter</p>
                <span
                  className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                    user.is_newsletter_subscribed
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {user.is_newsletter_subscribed ? 'Subscribed' : 'Not Sub.'}
                </span>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-600 mb-1">Joined</p>
                <p className="text-sm font-semibold text-black-primary">
                  {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={() => toggleStaffStatus(user.id, user.is_staff)}
              className={`w-full py-2 px-3 rounded font-semibold text-sm transition ${
                user.is_staff
                  ? 'bg-red-50 text-red-600 hover:bg-red-100'
                  : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
              }`}
            >
              {user.is_staff ? 'Remove Staff' : 'Make Staff'}
            </button>
          </div>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg mb-6">
          <p className="text-gray-600">No users found</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
        <div className="bg-white rounded-lg shadow p-4 sm:p-5 lg:p-6 hover:shadow-md transition">
          <p className="text-gray-600 text-xs sm:text-sm font-semibold mb-1">Total Users</p>
          <p className="text-2xl sm:text-2xl lg:text-3xl font-bold text-black-primary">{users.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 sm:p-5 lg:p-6 hover:shadow-md transition">
          <p className="text-gray-600 text-xs sm:text-sm font-semibold mb-1">Staff Members</p>
          <p className="text-2xl sm:text-2xl lg:text-3xl font-bold text-blue-600">{users.filter((u) => u.is_staff).length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 sm:p-5 lg:p-6 hover:shadow-md transition">
          <p className="text-gray-600 text-xs sm:text-sm font-semibold mb-1">Newsletter Subs</p>
          <p className="text-2xl sm:text-2xl lg:text-3xl font-bold text-green-600">
            {users.filter((u) => u.is_newsletter_subscribed).length}
          </p>
        </div>
      </div>
    </AdminLayout>
  )
}
