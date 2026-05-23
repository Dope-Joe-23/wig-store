import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { GoogleOAuthProvider } from '@react-oauth/google'
import Layout from '@components/layout/Layout'
import { InternetStatus } from '@components/InternetStatus'
import ScrollToTop from '@components/ScrollToTop'
import Home from '@pages/Home'
import ProductCatalog from '@pages/ProductCatalog'
import ProductDetail from '@pages/ProductDetail'
import Cart from '@pages/Cart'
import Checkout from '@pages/Checkout'
import PaymentSuccess from '@pages/PaymentSuccess'
import { LoginPage } from '@pages/Login'
import { RegisterPage } from '@pages/Register'
import { ProfilePage } from '@pages/Profile'
import { OrdersPage } from '@pages/Orders'
import { WishlistPage } from '@pages/Wishlist'
import { SettingsPage } from '@pages/Settings'
import AboutPage from '@pages/About'
import ContactPage from '@pages/Contact'
import BlogDetail from '@pages/BlogDetail'
import { AdminDashboardPage } from '@pages/admin/AdminDashboard'
import { AdminProductsPage } from '@pages/admin/AdminProducts'
import { AdminOrdersPage } from '@pages/admin/AdminOrders'
import { AdminUsersPage } from '@pages/admin/AdminUsers'
import { AdminCustomizationPage } from '@pages/admin/AdminCustomization'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
})

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''

function App() {
  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <QueryClientProvider client={queryClient}>
        <InternetStatus />
        <Router>
        <ScrollToTop />
        <Routes>
          {/* Auth routes - no layout */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Admin routes - no layout */}
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/products" element={<AdminProductsPage />} />
          <Route path="/admin/orders" element={<AdminOrdersPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/customization" element={<AdminCustomizationPage />} />
          
          {/* Main app routes - with layout */}
          <Route
            path="/*"
            element={
              <Layout>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/products" element={<ProductCatalog />} />
                  <Route path="/products/:slug" element={<ProductDetail />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/payment/success" element={<PaymentSuccess />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/orders" element={<OrdersPage />} />
                  <Route path="/wishlist" element={<WishlistPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/blog/:id" element={<BlogDetail />} />
                  <Route path="/settings" element={<SettingsPage />} />
                </Routes>
              </Layout>
            }
          />
        </Routes>
      </Router>
    </QueryClientProvider>
    </GoogleOAuthProvider>
  )
}

export default App
