import { useState, useEffect } from 'react'
import { useAuthStore } from '@stores/authStore'
import { authService } from '@services/auth'
import { useNavigate } from 'react-router-dom'
import { getImageUrl, getApiErrorMessage } from '@utils/helpers'

export function ProfilePage() {
  const user = useAuthStore((state) => state.user)
  const setUser = useAuthStore((state) => state.setUser)
  const navigate = useNavigate()
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    bio: '',
  })

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    setForm({
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      email: user.email || '',
      phone: user.phone || '',
      bio: user.bio || '',
    })
  }, [user, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      const res = await authService.updateProfile({
        first_name: form.first_name,
        last_name: form.last_name,
        phone: form.phone,
        bio: form.bio,
      })
      setUser(res.data)
      setSuccess('Profile updated successfully!')
      setEditing(false)
    } catch (err: any) {
      setError(getApiErrorMessage(err, 'Failed to update profile'))
    } finally {
      setSaving(false)
    }
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-ivory py-12">
      <div className="container-base">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-heading font-bold text-black-primary mb-2">My Profile</h1>
              <p className="text-gray-600">Manage your account information and addresses</p>
            </div>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="px-6 py-2.5 bg-rose-nude text-white rounded-lg hover:bg-rose-nude/90 font-semibold transition flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Profile
              </button>
            )}
          </div>

          {/* Profile Card */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
            {/* Avatar Banner */}
            <div className="bg-gradient-to-r from-rose-400 to-purple-400 h-32 relative">
              <div className="absolute -bottom-12 left-8">
                <div className="w-24 h-24 rounded-full border-4 border-white bg-gray-200 flex items-center justify-center overflow-hidden shadow-lg">
                  {user.avatar ? (
                    <img src={getImageUrl(user.avatar)} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl text-gray-400">
                      {user.first_name?.charAt(0) || user.username?.charAt(0) || '?'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-16 pb-8 px-8">
              {editing ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
                  )}
                  {success && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">{success}</div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">First Name</label>
                      <input
                        type="text"
                        value={form.first_name}
                        onChange={(e) => setForm((p) => ({ ...p, first_name: e.target.value }))}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-nude focus:border-transparent outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Last Name</label>
                      <input
                        type="text"
                        value={form.last_name}
                        onChange={(e) => setForm((p) => ({ ...p, last_name: e.target.value }))}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-nude focus:border-transparent outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
                    <input
                      type="email"
                      value={form.email}
                      disabled
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 outline-none cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone</label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                      placeholder="+1 (555) 123-4567"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-nude focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Bio</label>
                    <textarea
                      value={form.bio}
                      onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
                      rows={3}
                      placeholder="Tell us a little about yourself..."
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-nude focus:border-transparent outline-none"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-6 py-2.5 bg-rose-nude text-white rounded-lg hover:bg-rose-nude/90 font-semibold transition disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditing(false)}
                      className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-500 mb-1">First Name</label>
                      <p className="text-lg text-black-primary">{user.first_name || '—'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-500 mb-1">Last Name</label>
                      <p className="text-lg text-black-primary">{user.last_name || '—'}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-500 mb-1">Email</label>
                    <p className="text-lg text-black-primary">{user.email}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-500 mb-1">Username</label>
                    <p className="text-lg text-black-primary">@{user.username}</p>
                  </div>

                  {user.phone && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-500 mb-1">Phone</label>
                      <p className="text-lg text-black-primary">{user.phone}</p>
                    </div>
                  )}

                  {user.bio && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-500 mb-1">Bio</label>
                      <p className="text-gray-700">{user.bio}</p>
                    </div>
                  )}

                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-400">
                      Member since {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/orders')}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition text-left group"
            >
              <p className="text-2xl mb-2">📦</p>
              <p className="font-semibold text-black-primary group-hover:text-rose-nude transition">My Orders</p>
              <p className="text-sm text-gray-500">View your order history</p>
            </button>
            <button
              onClick={() => navigate('/wishlist')}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition text-left group"
            >
              <p className="text-2xl mb-2">❤️</p>
              <p className="font-semibold text-black-primary group-hover:text-rose-nude transition">Wishlist</p>
              <p className="text-sm text-gray-500">View saved items</p>
            </button>
            <button
              onClick={() => navigate('/settings')}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition text-left group"
            >
              <p className="text-2xl mb-2">⚙️</p>
              <p className="font-semibold text-black-primary group-hover:text-rose-nude transition">Settings</p>
              <p className="text-sm text-gray-500">Account preferences</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
