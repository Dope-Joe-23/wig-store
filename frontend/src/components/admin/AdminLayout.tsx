import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@stores/authStore'
import { UserAvatar } from '@components/UserAvatar'
import { DashboardIcon, ProductsIcon, AdminOrdersIcon, UsersIconComponent, CustomizationIcon, CloseIcon, StoreIcon, LockIcon } from '@components/Icons'
import logoUrl from '../../../Affordable_logo.jpeg'

interface AdminLayoutProps {
  children: React.ReactNode
  activeTab: 'dashboard' | 'products' | 'orders' | 'users' | 'customization'
}

export function AdminLayout({ children, activeTab }: AdminLayoutProps) {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [sidebarUserMenuOpen, setSidebarUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const sidebarUserMenuRef = useRef<HTMLDivElement>(null)

  const handleLogout = () => {
    logout()
    navigate('/login')
    
    // Also clear tokens
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
  }

  // Close user menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false)
      }
      if (sidebarUserMenuRef.current && !sidebarUserMenuRef.current.contains(event.target as Node)) {
        setSidebarUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Check if user is staff
  if (!user?.is_staff) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="flex justify-center mb-4">
            <LockIcon className="w-12 h-12 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-red-600 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-6">You do not have permission to access the admin dashboard.</p>
          <p className="text-sm text-gray-500 mb-4">
            If you believe you should have access, please contact the administrator.
          </p>
          <a
            href="/"
            className="inline-block px-6 py-2 bg-rose-nude text-white rounded-lg hover:bg-rose-nude/90 font-semibold"
          >
            Return Home
          </a>
        </div>
      </div>
    )
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', href: '/admin' },
    { id: 'products', label: 'Products', href: '/admin/products' },
    { id: 'orders', label: 'Orders', href: '/admin/orders' },
    { id: 'users', label: 'Users', href: '/admin/users' },
    { id: 'customization', label: 'Customization', href: '/admin/customization' },
  ]

  const getNavIcon = (id: string) => {
    const iconProps = 'w-5 h-5 lg:w-6 lg:h-6'
    switch (id) {
      case 'dashboard':
        return <DashboardIcon className={iconProps} />
      case 'products':
        return <ProductsIcon className={iconProps} />
      case 'orders':
        return <AdminOrdersIcon className={iconProps} />
      case 'users':
        return <UsersIconComponent className={iconProps} />
      case 'customization':
        return <CustomizationIcon className={iconProps} />
      default:
        return null
    }
  }

  const handleNavClick = (href: string) => {
    navigate(href)
    setMobileMenuOpen(false)
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-100">
      {/* Desktop Sidebar - Fixed position, doesn't scroll */}
      <div
        className={`hidden lg:flex lg:fixed lg:left-0 lg:top-0 lg:h-screen lg:w-64 bg-black-primary text-white flex-col z-30`}
      >
        {/* Logo */}
        <div className="p-4 lg:p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-rose-nude/30 to-transparent blur-sm" />
              <img src={logoUrl} alt="" className="relative h-10 w-10 rounded-full object-cover ring-2 ring-rose-nude/20 bg-white" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-base lg:text-lg font-heading font-bold">AH&amp;M</span>
              <span className="text-[9px] lg:text-[10px] tracking-[0.15em] text-gray-400 uppercase font-medium">Admin</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 lg:py-6">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(item.href)}
              className={`w-full px-4 lg:px-6 py-3 flex items-center gap-3 hover:bg-gray-800 transition ${
                activeTab === item.id ? 'bg-rose-nude text-white' : ''
              }`}
            >
              {getNavIcon(item.id)}
              <span className="text-sm lg:text-base">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Visit Store Button */}
        <div className="px-4 lg:px-6 py-3 border-t border-gray-700">
          <a
            href="/"
            className="w-full px-4 py-2 bg-rose-nude hover:bg-rose-nude/90 text-white rounded text-sm font-semibold transition block text-center flex items-center justify-center gap-2"
          >
            <StoreIcon className="w-4 h-4" />
            Visit Store
          </a>
        </div>

        {/* User Info (sidebar) - interactive dropdown on desktop */}
        <div className="border-t border-gray-700 p-4 relative" ref={sidebarUserMenuRef}>
          <button
            onClick={() => setSidebarUserMenuOpen(!sidebarUserMenuOpen)}
            className="w-full flex items-center gap-3 p-2 hover:bg-gray-800 rounded-lg transition"
          >
            <UserAvatar user={user} size="sm" />
            <div className="flex-1 text-left">
              <p className="text-sm font-medium truncate">{user.first_name || user.username}</p>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
            </div>
            <svg
              className={`w-4 h-4 text-gray-400 transition-transform ${sidebarUserMenuOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Sidebar Dropdown Menu */}
          {sidebarUserMenuOpen && (
            <div className="absolute bottom-full left-0 right-0 mb-2 mx-2 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
              <div className="py-1">
                <button
                  onClick={() => { navigate('/'); setSidebarUserMenuOpen(false) }}
                  className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition"
                >
                  <StoreIcon className="w-4 h-4" />
                  Visit Store
                </button>
                <a
                  href="/profile"
                  className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition"
                  onClick={() => setSidebarUserMenuOpen(false)}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  My Profile
                </a>
                <a
                  href="/settings"
                  className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition"
                  onClick={() => setSidebarUserMenuOpen(false)}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Settings
                </a>
                <hr className="border-gray-100" />
                <button
                  onClick={() => { handleLogout(); setSidebarUserMenuOpen(false) }}
                  className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 backdrop-blur-md bg-black/30 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <div
        className={`fixed top-0 left-0 h-screen w-64 bg-black-primary text-white flex flex-col z-50 transform transition-transform duration-300 lg:hidden ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-gray-700 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <img src={logoUrl} alt="" className="h-9 w-9 rounded-full object-cover ring-2 ring-rose-nude/20 bg-white flex-shrink-0" />
            <div className="flex flex-col leading-tight">
              <span className="text-base font-heading font-bold">AH&amp;M</span>
              <span className="text-[9px] tracking-[0.15em] text-gray-400 uppercase font-medium">Admin</span>
            </div>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-1 hover:bg-gray-800 rounded"
          >
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.href)}
              className={`w-full px-6 py-3 flex items-center gap-3 hover:bg-gray-800 transition ${
                activeTab === item.id ? 'bg-rose-nude text-white' : ''
              }`}
            >
              {getNavIcon(item.id)}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Visit Store Button */}
        <div className="px-6 py-3 border-t border-gray-700">
          <a
            href="/"
            className="w-full px-4 py-2 bg-rose-nude hover:bg-rose-nude/90 text-white rounded text-sm font-semibold transition block text-center flex items-center justify-center gap-2"
          >
            <StoreIcon className="w-4 h-4" />
            Visit Store
          </a>
        </div>

        {/* Mobile User Info */}
        <div className="border-t border-gray-700 p-4">
          <UserAvatar user={user} size="md" showName={true} />
          <div className="mt-3 space-y-2">
            <a
              href="/profile"
              className="block px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              My Profile
            </a>
            <button
              onClick={() => { handleLogout(); setMobileMenuOpen(false) }}
              className="w-full px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-gray-800 rounded transition text-left"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-64">
        {/* Header with Mobile Menu Toggle - Sticky */}
        <div className="bg-white border-b border-gray-200 px-4 lg:px-8 py-3 lg:py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h2 className="text-xl lg:text-3xl font-heading font-bold text-black-primary">
              {navItems.find((item) => item.id === activeTab)?.label}
            </h2>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Visit Store */}
            <a
              href="/"
              title="Visit Store"
              className="p-2 text-gray-600 hover:text-rose-nude hover:bg-rose-nude/10 rounded-lg transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </a>
            {/* Desktop User Menu in Header */}
            <div className="hidden sm:block relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-1.5 hover:bg-gray-100 rounded-lg transition"
              >
                <UserAvatar user={user} size="sm" />
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Header Dropdown */}
              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
                  <div className="py-1">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900 truncate">{user.first_name} {user.last_name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    <a
                      href="/"
                      className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <StoreIcon className="w-4 h-4" />
                      Visit Store
                    </a>
                    <a
                      href="/profile"
                      className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Profile
                    </a>
                    <a
                      href="/settings"
                      className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Settings
                    </a>
                    <hr className="border-gray-100" />
                    <button
                      onClick={() => { handleLogout(); setUserMenuOpen(false) }}
                      className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content - Only this scrolls */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">{children}</div>
      </div>
    </div>
  )
}
