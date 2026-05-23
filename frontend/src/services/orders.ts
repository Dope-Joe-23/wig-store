import { apiClient } from './api'
import { Order, PaginatedResponse } from '../types/index'

export interface CartItem {
  id: number
  quantity: number
  price: number
}

export interface CreateOrderData {
  cart_items: CartItem[]
  subtotal: number
  tax: number
  shipping_cost: number
  total: number
  notes?: string
}

export const orderService = {
  // Get user orders
  getOrders: (params?: any) =>
    apiClient.get('/orders/', { params }),

  // Get single order
  getOrder: (id: number) =>
    apiClient.get(`/orders/${id}/`),

  // Create order from cart
  createOrder: (data: CreateOrderData) => {
    // Convert numbers to strings to ensure proper decimal handling
    const formattedData = {
      ...data,
      subtotal: String(parseFloat(String(data.subtotal)).toFixed(2)),
      tax: String(parseFloat(String(data.tax)).toFixed(2)),
      shipping_cost: String(parseFloat(String(data.shipping_cost)).toFixed(2)),
      total: String(parseFloat(String(data.total)).toFixed(2)),
    }
    return apiClient.post('/orders/', formattedData)
  },

  // Create order from cart (alternative endpoint)
  createFromCart: (data: CreateOrderData) => {
    const formattedData = {
      ...data,
      subtotal: String(parseFloat(String(data.subtotal)).toFixed(2)),
      tax: String(parseFloat(String(data.tax)).toFixed(2)),
      shipping_cost: String(parseFloat(String(data.shipping_cost)).toFixed(2)),
      total: String(parseFloat(String(data.total)).toFixed(2)),
    }
    return apiClient.post('/orders/create_from_cart/', formattedData)
  },

  // Update order status (admin)
  updateOrderStatus: (id: number, status: string) =>
    apiClient.patch(`/orders/${id}/`, { status }),

  // Cancel order (user-facing)
  cancelOrder: (id: number) =>
    apiClient.post(`/orders/${id}/cancel/`),
}
