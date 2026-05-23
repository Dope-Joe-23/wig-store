import { Link, useNavigate } from 'react-router-dom'
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

  const handleLogout = () => {
    authService.logout()
    logout()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-40 bg-ivory border-b border-black-primary border-opacity-10">
      <nav className="container-base py-4 flex-between">
        <Link to="/" className="text-2xl font-heading font-bold">
          Wiggle
        </Link>

        <div className="hidden md:flex gap-8">
          <Link to="/products" className="hover:text-rose-nude transition">
            Shop
          </Link>
          <Link to="/about" className="hover:text-rose-nude transition">
            About
          </Link>
          <Link to="/contact" className="hover:text-rose-nude transition">
            Contact
          </Link>
        </div>

        <div className="flex items-center gap-6">
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
    </header>
  )
}
