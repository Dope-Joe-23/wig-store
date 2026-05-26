import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { useCartStore } from '@stores/cartStore'
import { useAuthStore } from '@stores/authStore'
import { authService } from '@services/auth'
import { UserMenu } from '@components/UserMenu'
import { CartIcon } from '@components/Icons'

export default function Navbar() {
  const navigate = useNavigate()
  const totalItems = useCartStore((state) => state.getTotalItems())
  const { isAuthenticated, user, logout } = useAuthStore((state) => ({
    isAuthenticated: state.isAuthenticated,
    user: state.user,
    logout: state.logout,
  }))

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    authService.logout()
    logout()
    navigate('/')
  }

  const navLinks = [
    { to: '/products', label: 'Shop' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' },
  ]

  // Prevent body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [mobileMenuOpen])

  return (
    <header className="sticky top-0 z-40 bg-ivory border-b border-black-primary border-opacity-10">
      <nav className="container-base py-4 flex-between">
        <Link to="/" className="text-2xl font-heading font-bold">
          Wiggle
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex gap-8">
          {navLinks.map((link) => (
            <Link key={link.to} to={link.to} className="hover:text-rose-nude transition">
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2 sm:gap-6">
          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden p-2 hover:bg-black/5 rounded-lg transition"
            aria-label="Open menu"
          >
            <Bars3Icon className="w-6 h-6" />
          </button>

          {/* Cart */}
          <Link to="/cart" className="relative group">
            <CartIcon className="w-6 h-6 group-hover:scale-110 transition transform" />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-3 bg-rose-nude text-ivory text-xs w-5 h-5 rounded-full flex-center font-bold">
                {totalItems}
              </span>
            )}
          </Link>



          {/* User Profile or Auth Links */}
          {isAuthenticated && user ? (
            <UserMenu
              user={user}
              onLogout={() => {
                authService.logout()
                logout()
                navigate('/')
              }}
            />
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm hover:text-rose-nude transition"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="text-sm btn-secondary py-2 px-4"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Mobile drawer overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-50 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile slide-in drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-72 max-w-[80vw] bg-ivory z-50 shadow-2xl transform transition-transform duration-300 ease-out md:hidden ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-black/10">
          <span className="text-lg font-heading font-semibold">Menu</span>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 hover:bg-black/5 rounded-lg transition"
            aria-label="Close menu"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        <nav className="p-4 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3 rounded-lg text-base font-medium hover:bg-rose-nude/10 hover:text-rose-nude transition"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
