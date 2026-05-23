import { useState } from 'react'
import { useAuthStore } from '@stores/authStore'
import { authService } from '@services/auth'
import { useNavigate } from 'react-router-dom'

export function SettingsPage() {
  const user = useAuthStore((state) => state.user)
  const setUser = useAuthStore((state) => state.setUser)
  const logout = useAuthStore((state) => state.logout)
  const navigate = useNavigate()

  const [newsletter, setNewsletter] = useState(user?.is_newsletter_subscribed ?? true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  })
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null)

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteText, setDeleteText] = useState('')

  const handleNewsletterToggle = async () => {
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      const newValue = !newsletter
      const res = await authService.updateProfile({
        is_newsletter_subscribed: newValue,
      } as any)
      setNewsletter(newValue)
      setUser(res.data)
      setSuccess(newValue ? 'Subscribed to newsletter' : 'Unsubscribed from newsletter')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update preference')
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setPasswordError('Passwords do not match')
      return
    }
    if (passwordForm.new_password.length < 8) {
      setPasswordError('Password must be at least 8 characters')
      return
    }
    setPasswordSaving(true)
    setPasswordError(null)
    setPasswordSuccess(null)
    try {
      await authService.updateProfile({
        password: passwordForm.new_password,
      } as any)
      setPasswordSuccess('Password changed successfully!')
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' })
      setShowPasswordForm(false)
    } catch (err: any) {
      setPasswordError(err.response?.data?.detail || 'Failed to change password')
    } finally {
      setPasswordSaving(false)
    }
  }

  const handleDeleteAccount = () => {
    if (deleteText === 'DELETE') {
      logout()
      navigate('/register')
    }
  }

  if (!user) {
    navigate('/login')
    return null
  }

  return (
    <div className="min-h-screen bg-ivory py-12">
      <div className="container-base">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-heading font-bold text-black-primary mb-2">Account Settings</h1>
          <p className="text-gray-600 mb-8">Manage your account preferences and security</p>

          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
          )}
          {success && (
            <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">{success}</div>
          )}

          <div className="space-y-6">
            {/* Profile Summary */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center text-2xl font-bold text-rose-500">
                  {user.first_name?.charAt(0) || user.username?.charAt(0) || '?'}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-black-primary">
                    {user.first_name} {user.last_name}
                  </h2>
                  <p className="text-sm text-gray-500">{user.email}</p>
                  <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${user.is_staff ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                    {user.is_staff ? 'Admin' : 'Customer'}
                  </span>
                </div>
              </div>
            </div>

            {/* Notification Settings */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-black-primary mb-4">Notifications</h2>
              <div className="space-y-4">
                <label className="flex items-center justify-between cursor-pointer group">
                  <div>
                    <span className="text-gray-700 font-medium">Email Newsletter</span>
                    <p className="text-sm text-gray-500">Receive updates about new products and promotions</p>
                  </div>
                  <button
                    onClick={handleNewsletterToggle}
                    disabled={saving}
                    className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
                      newsletter ? 'bg-rose-nude' : 'bg-gray-300'
                    } ${saving ? 'opacity-50' : ''}`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                        newsletter ? 'translate-x-6' : ''
                      }`}
                    />
                  </button>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-gray-300 text-rose-nude focus:ring-rose-nude" />
                  <div>
                    <span className="text-gray-700">Email me about order updates</span>
                    <p className="text-sm text-gray-500">Receive notifications about your order status</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-rose-nude focus:ring-rose-nude" />
                  <div>
                    <span className="text-gray-700">SMS notifications</span>
                    <p className="text-sm text-gray-500">Get text messages about order updates and promotions</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Security */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-black-primary mb-4">Security</h2>
              
              {!showPasswordForm ? (
                <button
                  onClick={() => setShowPasswordForm(true)}
                  className="px-6 py-2 bg-rose-nude text-white rounded-lg hover:bg-rose-nude/90 font-semibold transition"
                >
                  Change Password
                </button>
              ) : (
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  {passwordError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{passwordError}</div>
                  )}
                  {passwordSuccess && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">{passwordSuccess}</div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Current Password</label>
                    <input
                      type="password"
                      value={passwordForm.current_password}
                      onChange={(e) => setPasswordForm((p) => ({ ...p, current_password: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-nude focus:border-transparent outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">New Password</label>
                    <input
                      type="password"
                      value={passwordForm.new_password}
                      onChange={(e) => setPasswordForm((p) => ({ ...p, new_password: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-nude focus:border-transparent outline-none"
                      required
                      minLength={8}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirm New Password</label>
                    <input
                      type="password"
                      value={passwordForm.confirm_password}
                      onChange={(e) => setPasswordForm((p) => ({ ...p, confirm_password: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-nude focus:border-transparent outline-none"
                      required
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={passwordSaving}
                      className="px-6 py-2.5 bg-rose-nude text-white rounded-lg hover:bg-rose-nude/90 font-semibold transition disabled:opacity-50"
                    >
                      {passwordSaving ? 'Changing...' : 'Change Password'}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowPasswordForm(false); setPasswordError(null); setPasswordSuccess(null) }}
                      className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Privacy */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-black-primary mb-4">Privacy</h2>
              <div className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-gray-300 text-rose-nude focus:ring-rose-nude" />
                  <div>
                    <span className="text-gray-700">Make my profile public</span>
                    <p className="text-sm text-gray-500">Allow other users to see your profile information</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-gray-300 text-rose-nude focus:ring-rose-nude" />
                  <div>
                    <span className="text-gray-700">Show my purchase history</span>
                    <p className="text-sm text-gray-500">Display your reviews and purchases on your profile</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-red-50 border border-red-200 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-red-600 mb-4">Danger Zone</h2>
              <p className="text-gray-700 mb-4">
                Once you delete your account, there is no going back. All your data will be permanently removed.
              </p>
              
              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold transition"
                >
                  Delete Account
                </button>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm font-semibold text-red-600">
                    Type <span className="font-mono bg-red-100 px-2 py-0.5 rounded">DELETE</span> to confirm
                  </p>
                  <input
                    type="text"
                    value={deleteText}
                    onChange={(e) => setDeleteText(e.target.value)}
                    placeholder="Type DELETE to confirm"
                    className="w-full px-4 py-2.5 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={handleDeleteAccount}
                      disabled={deleteText !== 'DELETE'}
                      className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold transition disabled:opacity-50"
                    >
                      Permanently Delete
                    </button>
                    <button
                      onClick={() => { setShowDeleteConfirm(false); setDeleteText('') }}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
