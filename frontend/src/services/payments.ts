import { apiClient } from './api'

export interface PaymentInitData {
  order_id: number
  email: string
  phone: string
  amount: number
  payment_method: 'card' | 'mobile_money' | 'mtn_momo' | 'telecel_momo' | 'airteltigo_momo'
}

export interface PaymentResponse {
  authorization_url: string
  reference: string
}

export interface PaymentVerificationResponse {
  reference: string
  status: string
  order_id: number
  order_number: string
  payment_status: string
  amount: string
}

export const paymentService = {
  /**
   * Initialize a payment for an order
   */
  initializePayment: (data: PaymentInitData): Promise<{ data: PaymentResponse }> => {
    return apiClient.post('/payments/initialize/', data)
  },

  verifyPayment: (reference: string): Promise<{ data: PaymentVerificationResponse }> => {
    return apiClient.get(`/payments/verify/${encodeURIComponent(reference)}/`)
  },

  /**
   * Get all payments for current user
   */
  getPayments: (page = 1): Promise<{ data: any }> => {
    return apiClient.get('/payments/', { params: { page } })
  },

  /**
   * Get payment details
   */
  getPayment: (paymentId: number): Promise<{ data: any }> => {
    return apiClient.get(`/payments/${paymentId}/`)
  },
}
