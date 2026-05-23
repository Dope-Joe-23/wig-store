/* Types for API responses */

export interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  phone?: string
  avatar?: string
  bio?: string
  is_staff: boolean
  is_newsletter_subscribed: boolean
  created_at: string
  updated_at: string
}

export interface Category {
  id: number
  name: string
  slug: string
  description?: string
  image?: string
}

export interface ProductMedia {
  id: number
  media_type: 'image' | 'video' | 'model_360'
  url: string
  alt_text?: string
  is_primary: boolean
}

export interface ProductVariant {
  id: number
  color: string
  size: string
  sku: string
  price_adjustment: number
  stock: number
}

export interface Product {
  id: number
  name: string
  slug: string
  description: string
  category: Category
  wig_type: 'human_hair' | 'synthetic' | 'blend'
  texture: 'straight' | 'wavy' | 'curly' | 'coily' | 'kinky'
  price: number
  sale_price?: number
  current_price: string
  color: string
  length: string
  cap_size: string
  stock_quantity: number
  is_featured: boolean
  is_trending: boolean
  is_new: boolean
  rating: number
  review_count: number
  primary_image?: ProductMedia
  media?: ProductMedia[]
  variants: ProductVariant[]
  created_at: string
}

export interface CartItem {
  id: string
  product: Product
  quantity: number
  variant?: ProductVariant
  price: number
}

export interface Order {
  id: number
  order_number: string
  user: User
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  payment_status: 'pending' | 'paid' | 'failed' | 'cancelled' | 'refunded'
  payment_reference?: string
  subtotal: number
  shipping_cost: number
  tax: number
  total: number
  items: OrderItem[]
  notes?: string
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: number
  product: Product
  quantity: number
  price: number
}

export interface Review {
  id: number
  product: Product
  user: User
  rating: number
  title: string
  comment: string
  is_verified_purchase: boolean
  helpful_count: number
  created_at: string
  updated_at: string
}

export interface PaginatedResponse<T> {
  count: number
  next?: string
  previous?: string
  results: T[]
}
