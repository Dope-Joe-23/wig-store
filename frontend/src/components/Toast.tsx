import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export interface ToastData {
  message: string
  type: 'success' | 'error' | 'info'
}

interface ToastProps {
  toast: ToastData | null
  onClose: () => void
  duration?: number
}

export function Toast({ toast, onClose, duration = 4000 }: ToastProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (toast) {
      setVisible(true)
      const timer = setTimeout(() => {
        setVisible(false)
        setTimeout(onClose, 300) // wait for exit animation
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [toast, duration, onClose])

  return (
    <AnimatePresence>
      {visible && toast && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className={`fixed bottom-6 right-6 z-50 max-w-sm w-full px-5 py-4 rounded-xl shadow-2xl text-white font-medium flex items-start gap-3 ${
            toast.type === 'success'
              ? 'bg-emerald-600'
              : toast.type === 'error'
              ? 'bg-red-600'
              : 'bg-blue-600'
          }`}
        >
          {/* Icon */}
          <span className="flex-shrink-0 mt-0.5">
            {toast.type === 'success' ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            ) : toast.type === 'error' ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </span>
          {/* Message */}
          <p className="flex-1 text-sm leading-relaxed">{toast.message}</p>
          {/* Close button */}
          <button
            onClick={() => { setVisible(false); setTimeout(onClose, 300) }}
            className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
