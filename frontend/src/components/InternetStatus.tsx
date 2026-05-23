import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useInternetConnection } from '@hooks/useInternetConnection'
import { CheckmarkIcon } from './Icons'

export const InternetStatus = () => {
  const { isOnline, lastChanged } = useInternetConnection()
  const [showNotification, setShowNotification] = useState(false)
  const [notificationType, setNotificationType] = useState<'online' | 'offline'>('online')

  useEffect(() => {
    setNotificationType(isOnline ? 'online' : 'offline')
    setShowNotification(true)

    // Auto-hide success notification after 4 seconds
    if (isOnline) {
      const timer = setTimeout(() => setShowNotification(false), 4000)
      return () => clearTimeout(timer)
    }
  }, [lastChanged, isOnline])

  return (
    <AnimatePresence>
      {showNotification && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className={`fixed top-0 left-0 right-0 z-[9999] flex items-center justify-center px-4 pt-4`}
        >
          <div
            className={`w-full max-w-md rounded-lg shadow-lg px-6 py-4 flex items-center gap-4 ${
              isOnline
                ? 'bg-emerald-500 text-white'
                : 'bg-red-500 text-white'
            }`}
          >
            {isOnline ? (
              <>
                <CheckmarkIcon className="w-6 h-6 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold">Internet Connected</p>
                  <p className="text-sm opacity-90">Your connection has been restored</p>
                </div>
              </>
            ) : (
              <>
                <div className="flex-shrink-0">
                  <motion.div
                    animate={{ opacity: [0.5, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071a3 3 0 015.656 0M9 12a3 3 0 106 0 3 3 0 00-6 0z"
                      />
                    </svg>
                  </motion.div>
                </div>
                <div className="flex-1">
                  <p className="font-semibold">Internet Connection Lost</p>
                  <p className="text-sm opacity-90">
                    You appear to be offline. Some features may not work
                  </p>
                </div>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
