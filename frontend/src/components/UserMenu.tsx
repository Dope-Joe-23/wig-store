import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { User } from '@/types/index'
import { UserAvatar } from './UserAvatar'
import { ProfileIcon, OrdersIcon, WishlistIcon, SettingsIcon, LogoutIcon, AdminIcon } from './Icons'

interface UserMenuProps {
  user: User
  onLogout: () => void
}

export function UserMenu({ user, onLogout }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleNavigation = (path: string) => {
    navigate(path)
    setIsOpen(false)
  }

  const handleLogout = () => {
    onLogout()
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={menuRef}>
      {/* Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 hover:bg-gray-100 rounded-full transition cursor-pointer"
        title="User menu"
      >
        <UserAvatar user={user} size="sm" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
          {/* User Info Header */}
          <div className="bg-gradient-to-r from-rose-nude/10 to-rose-nude/5 px-4 py-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <UserAvatar user={user} size="md" />
              <div>
                <p className="font-semibold text-black-primary text-sm">
                  {user.first_name || user.username}
                </p>
                <p className="text-xs text-gray-600 truncate">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            {/* Profile */}
            <button
              onClick={() => handleNavigation('/profile')}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition"
            >
              <ProfileIcon className="w-5 h-5" />
              <span>View Profile</span>
            </button>

            {/* Orders */}
            <button
              onClick={() => handleNavigation('/orders')}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition"
            >
              <OrdersIcon className="w-5 h-5" />
              <span>My Orders</span>
            </button>

            {/* Wishlist */}
            <button
              onClick={() => handleNavigation('/wishlist')}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition"
            >
              <WishlistIcon className="w-5 h-5" />
              <span>Wishlist</span>
            </button>

            {/* Settings */}
            <button
              onClick={() => handleNavigation('/settings')}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition"
            >
              <SettingsIcon className="w-5 h-5" />
              <span>Settings</span>
            </button>

            {/* Admin Dashboard - Only for staff */}
            {user.is_staff && (
              <>
                <div className="border-t border-gray-200 my-2"></div>
                <button
                  onClick={() => handleNavigation('/admin')}
                  className="w-full px-4 py-2 text-left text-sm text-blue-600 hover:bg-blue-50 flex items-center gap-3 transition font-semibold"
                >
                  <AdminIcon className="w-5 h-5" />
                  <span>Admin Dashboard</span>
                </button>
              </>
            )}

            {/* Divider */}
            <div className="border-t border-gray-200 my-2"></div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition font-semibold"
            >
              <LogoutIcon className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>

          {/* Footer Note */}
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              Welcome, {user.first_name || user.username}!
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
