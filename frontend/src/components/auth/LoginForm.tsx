import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { GoogleLogin } from '@react-oauth/google'
import { FacebookLoginButton } from './FacebookLoginButton'
import { loginSchema, type LoginFormData } from '@schemas/auth'
import { authService } from '@services/auth'
import { useAuthStore } from '@stores/authStore'

export function LoginForm() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((state) => state.setAuth)
  const [apiError, setApiError] = useState<string>('')
  const [isOtpMode, setIsOtpMode] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [otpEmail, setOtpEmail] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [googleLoading, setGoogleLoading] = useState(false)
  const [facebookLoading, setFacebookLoading] = useState(false)
  const [googleError, setGoogleError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      setApiError('')
      const response = await authService.login(data)

      const { access, refresh, user } = response.data

      // Store tokens
      authService.setTokens(access, refresh)

      // Update auth store
      setAuth(user, true)

      // Redirect to dashboard or home
      navigate('/')
    } catch (error: any) {
      const message = error.response?.data?.detail ||
                     error.response?.data?.username?.[0] ||
                     error.response?.data?.password?.[0] ||
                     'Login failed. Please try again.'
      setApiError(message)
    }
  }

  const handleOtpRequest = async () => {
    try {
      setApiError('')
      await authService.sendOTP(otpEmail)
      setOtpSent(true)
    } catch (error: any) {
      setApiError('Failed to send OTP. Please try again.')
    }
  }

  const handleOtpVerify = async () => {
    try {
      setApiError('')
      if (!otpCode || otpCode.length !== 6) {
        setApiError('Please enter the 6-digit code')
        return
      }
      const response = await authService.verifyOTP(otpEmail, otpCode)
      const { access, refresh, user } = response.data
      authService.setTokens(access, refresh)
      setAuth(user, true)
      navigate('/')
    } catch (error: any) {
      setApiError('Invalid or expired OTP. Please try again.')
    }
  }

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      setGoogleLoading(true)
      setApiError('')
      setGoogleError(null)
      const idToken = credentialResponse.credential
      if (!idToken) {
        setApiError('No credential received from Google.')
        return
      }
      const result = await authService.socialLogin(idToken)
      const { access, refresh, user } = result.data
      authService.setTokens(access, refresh)
      setAuth(user, true)
      navigate('/')
    } catch (error: any) {
      const message = error.response?.data?.error || 'Google login failed. Please try again.'
      setApiError(message)
    } finally {
      setGoogleLoading(false)
    }
  }

  const handleGoogleError = () => {
    setGoogleError('Google sign-in was cancelled or failed.')
  }

  const handleFacebookSuccess = async (accessToken: string) => {
    try {
      setFacebookLoading(true)
      setApiError('')
      const result = await authService.facebookLogin(accessToken)
      const { access, refresh, user } = result.data
      authService.setTokens(access, refresh)
      setAuth(user, true)
      navigate('/')
    } catch (error: any) {
      const message = error.response?.data?.error || 'Facebook login failed. Please try again.'
      setApiError(message)
    } finally {
      setFacebookLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-heading font-bold text-black-primary mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-600 mb-8">Sign in to your Wiggle account</p>

          {apiError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{apiError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {!isOtpMode ? (
              <>
                <div>
                  <label htmlFor="username" className="block text-sm font-semibold text-black-primary mb-2">
                    Username or Email
                  </label>
                  <input
                    {...register('username')}
                    id="username"
                    type="text"
                    placeholder="your_username"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-nude focus:border-transparent outline-none transition"
                  />
                  {errors.username && (
                    <p className="text-red-600 text-sm mt-1">{errors.username.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-black-primary mb-2">
                    Password
                  </label>
                  <input
                    {...register('password')}
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-nude focus:border-transparent outline-none transition"
                  />
                  {errors.password && (
                    <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Signing in...' : 'Sign In'}
                </button>

                <button
                  type="button"
                  onClick={() => setIsOtpMode(true)}
                  className="w-full text-center text-sm text-rose-nude hover:underline"
                >
                  Sign in with OTP instead
                </button>
              </>
            ) : (
              <div className="space-y-5">
                <div>
                  <label htmlFor="otp_email" className="block text-sm font-semibold text-black-primary mb-2">
                    Email for OTP
                  </label>
                  <input
                    id="otp_email"
                    type="email"
                    value={otpEmail}
                    onChange={(e) => setOtpEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-nude focus:border-transparent outline-none transition"
                    disabled={otpSent}
                  />
                </div>

                {otpSent && (
                  <div>
                    <label htmlFor="otp" className="block text-sm font-semibold text-black-primary mb-2">
                      Enter OTP Code
                    </label>
                    <input
                      id="otp"
                      type="text"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="123456"
                      maxLength={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-nude focus:border-transparent outline-none transition text-center text-lg tracking-widest"
                    />
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      A 6-digit code was sent to {otpEmail}
                    </p>
                  </div>
                )}

                {!otpSent ? (
                  <button
                    type="button"
                    onClick={handleOtpRequest}
                    disabled={!otpEmail}
                    className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Send OTP
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleOtpVerify}
                    className="w-full btn-primary"
                  >
                    Verify & Sign In
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => { setIsOtpMode(false); setOtpSent(false); }}
                  className="w-full text-center text-sm text-gray-500 hover:text-gray-700"
                >
                  Back to password login
                </button>
              </div>
            )}
          </form>

          {/* Social Login Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-4 text-gray-500">Or continue with</span>
            </div>
          </div>

          {/* Social Login Buttons */}
          <div className="space-y-3">
            <div className="w-full flex justify-center">
              {googleLoading ? (
                <div className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium">
                  <div className="w-5 h-5 border-2 border-gray-300 border-t-rose-nude rounded-full animate-spin" />
                  Signing in...
                </div>
              ) : (
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  theme="outline"
                  size="large"
                  text="continue_with"
                  shape="rectangular"
                />
              )}
            </div>
            {googleError && (
              <p className="text-sm text-red-600 text-center">{googleError}</p>
            )}

            <FacebookLoginButton
              onSuccess={handleFacebookSuccess}
              onError={(err) => setApiError(err)}
              isLoading={facebookLoading}
            />
          </div>

          <p className="text-center text-gray-600 text-sm mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-rose-nude font-semibold hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
