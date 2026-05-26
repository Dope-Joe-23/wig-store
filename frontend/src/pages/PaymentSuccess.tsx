import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { paymentService } from '@services/payments'
import { useCartStore } from '@stores/cartStore'

type VerificationState = 'pending' | 'success' | 'failed'

const MAX_RETRIES = 5
const RETRY_BASE_DELAY_MS = 2000

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams()
  const clearCart = useCartStore((state) => state.clearCart)
  const [state, setState] = useState<VerificationState>('pending')
  const [message, setMessage] = useState('Verifying your payment...')

  const reference = useMemo(
    () => searchParams.get('reference') || searchParams.get('trxref') || '',
    [searchParams]
  )

  useEffect(() => {
    let isMounted = true
    let attempts = 0
    let timeoutId: ReturnType<typeof setTimeout> | null = null

    const verifyPayment = async () => {
      if (!reference) {
        if (isMounted) {
          setState('failed')
          setMessage('We could not find a payment reference for this transaction.')
        }
        return
      }

      try {
        const response = await paymentService.verifyPayment(reference)
        if (!isMounted) return

        // Payment confirmed — success!
        if (response.data.payment_status === 'paid') {
          clearCart()
          setState('success')
          setMessage(`Payment successful for order ${response.data.order_number}.`)
          return
        }

        // Not yet paid (e.g., Paystack propagation delay) — retry with exponential backoff
        if (attempts < MAX_RETRIES) {
          attempts++
          const delay = RETRY_BASE_DELAY_MS * Math.pow(1.5, attempts - 1)
          setMessage(`Verifying your payment... (attempt ${attempts}/${MAX_RETRIES + 1})`)
          timeoutId = setTimeout(verifyPayment, delay)
          return
        }

        // Exhausted retries
        setState('failed')
        setMessage('Payment verification did not complete successfully. Your payment may still be processing — please refresh the page or check your orders.')
      } catch (error: any) {
        if (!isMounted) return

        // Transient error — retry with exponential backoff
        if (attempts < MAX_RETRIES) {
          attempts++
          const delay = RETRY_BASE_DELAY_MS * Math.pow(1.5, attempts - 1)
          setMessage(`Verifying your payment... (attempt ${attempts}/${MAX_RETRIES + 1})`)
          timeoutId = setTimeout(verifyPayment, delay)
          return
        }

        const errorMessage =
          error.response?.data?.error ||
          error.response?.data?.detail ||
          'Payment verification is currently unavailable. Please check your order again shortly.'
        setState('failed')
        setMessage(errorMessage)
      }
    }

    verifyPayment()

    return () => {
      isMounted = false
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [clearCart, reference])

  return (
    <div className="min-h-screen bg-ivory py-12">
      <div className="container-base max-w-2xl">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Payment verification
          </p>
          <h1 className="mt-3 text-3xl font-heading font-bold text-black-primary">
            {state === 'pending'
              ? 'Checking payment'
              : state === 'success'
              ? 'Payment successful'
              : 'Payment not completed'}
          </h1>
          <p className="mt-4 text-gray-700">{message}</p>

          {reference && (
            <p className="mt-4 text-sm text-gray-500">
              Reference: <span className="font-mono">{reference}</span>
            </p>
          )}

          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/products" className="btn-primary">
              Continue Shopping
            </Link>
            <Link
              to="/"
              className="px-8 py-3 border-2 border-gray-300 text-black-primary rounded-lg hover:bg-gray-50 transition font-semibold text-center"
            >
              Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
