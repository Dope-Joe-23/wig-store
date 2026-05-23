import { useState, useEffect, useCallback, useRef } from 'react'

declare global {
  interface Window {
    FB?: any
    fbAsyncInit?: () => void
  }
}

interface FacebookLoginButtonProps {
  onSuccess: (accessToken: string) => void
  onError: (error: string) => void
  isLoading?: boolean
  label?: string
}

export function FacebookLoginButton({
  onSuccess,
  onError,
  isLoading = false,
  label = 'Continue with Facebook',
}: FacebookLoginButtonProps) {
  const [sdkLoaded, setSdkLoaded] = useState(false)
  const [sdkError, setSdkError] = useState<string | null>(null)
  const initCalledRef = useRef(false)

  useEffect(() => {
    // Prevent double initialization in strict mode
    if (initCalledRef.current) return
    initCalledRef.current = true

    const appId = import.meta.env.VITE_FACEBOOK_APP_ID
    if (!appId) {
      setSdkError('Facebook App ID not configured. Add VITE_FACEBOOK_APP_ID to .env')
      return
    }

    // If FB is already loaded, just initialize
    if (window.FB) {
      setSdkLoaded(true)
      return
    }

    // Set up FB async init
    window.fbAsyncInit = () => {
      window.FB?.init({
        appId,
        cookie: true,
        xfbml: false,
        version: 'v19.0',
      })
      setSdkLoaded(true)
    }

    // Load the FB SDK
    const script = document.createElement('script')
    script.src = 'https://connect.facebook.net/en_US/sdk.js'
    script.async = true
    script.defer = true
    script.crossOrigin = 'anonymous'
    script.onerror = () => {
      setSdkError('Failed to load Facebook SDK. Please check your internet connection.')
    }
    document.body.appendChild(script)

    return () => {
      // Cleanup isn't really possible for the FB SDK
    }
  }, [])

  const handleClick = useCallback(() => {
    if (!window.FB) {
      setSdkError('Facebook SDK is not loaded yet. Please wait.')
      return
    }

    setSdkError(null)

    window.FB.login(
      (response: any) => {
        if (response.authResponse) {
          const accessToken = response.authResponse.accessToken
          onSuccess(accessToken)
        } else {
          onError('Facebook login was cancelled or failed.')
        }
      },
      { scope: 'email,public_profile' }
    )
  }, [onSuccess, onError])

  if (!import.meta.env.VITE_FACEBOOK_APP_ID) {
    return null
  }

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={handleClick}
        disabled={!sdkLoaded || isLoading}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg 
                   hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
            <span className="text-gray-700 font-medium">Signing in...</span>
          </>
        ) : !sdkLoaded ? (
          <>
            <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
            <span className="text-gray-500 font-medium">Loading Facebook...</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            <span className="text-gray-700 font-medium">{label}</span>
          </>
        )}
      </button>
      {sdkError && (
        <p className="text-sm text-red-600 text-center mt-2">{sdkError}</p>
      )}
    </div>
  )
}
