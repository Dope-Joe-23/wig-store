import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { GoogleLogin } from '@react-oauth/google'
import { FacebookLoginButton } from './FacebookLoginButton'
import { registerSchema, type RegisterFormData } from '@schemas/auth'
import { authService } from '@services/auth'
import { useAuthStore } from '@stores/authStore'

export function RegisterForm() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((state) => state.setAuth)
  const [apiError, setApiError] = useState<string>('')
  const [step, setStep] = useState<'register' | 'otp'>('register')
  const [registerData, setRegisterData] = useState<RegisterFormData | null>(null)
  const [otpCode, setOtpCode] = useState('')
  const [isSendingOtp, setIsSendingOtp] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [facebookLoading, setFacebookLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmitDetails = async (data: RegisterFormData) => {
    try {
      setApiError('')
      setIsSendingOtp(true)
      // Store form data for later
      setRegisterData(data)

      // Send OTP to email first
      await authService.sendOTP(data.email, 'register')
      setStep('otp')
    } catch (error: any) {
      const message = error.response?.data?.email?.[0] ||
                     'Failed to send verification code. Please try again.'
      setApiError(message)
    } finally {
      setIsSendingOtp(false)
    }
  }

  const handleOtpVerify = async () => {
    if (!registerData) return

    try {
      setApiError('')
      if (!otpCode || otpCode.length !== 6) {
        setApiError('Please enter the 6-digit verification code')
        return
      }

      // Verify OTP first
      await authService.verifyOTP(registerData.email, otpCode)

      // OTP verified - now register the user
      const response = await authService.register({
        email: registerData.email,
        name: registerData.name,
        password: registerData.password,
        password_confirm: registerData.password_confirm,
      })

      const { access, refresh, user } = response.data

      // Store tokens
      authService.setTokens(access, refresh)

      // Update auth store
      setAuth(user, true)

      // Redirect to home
      navigate('/')
    } catch (error: any) {
      const message = error.response?.data?.error ||
                     error.response?.data?.detail ||
                     error.response?.data?.otp?.[0] ||
                     'Verification failed. Please try again.'
      setApiError(message)
      console.error('Registration error:', error.response?.data || error.message)
    }
  }

  const handleResendOtp = async () => {
    if (!registerData) return
    try {
      setApiError('')
      setIsSendingOtp(true)
      await authService.sendOTP(registerData.email, 'register')
    } catch {
      setApiError('Failed to resend code. Please try again.')
    } finally {
      setIsSendingOtp(false)
    }
  }

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      setGoogleLoading(true)
      setApiError('')
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
      const message = error.response?.data?.error || 'Google sign-up failed. Please try again.'
      setApiError(message)
    } finally {
      setGoogleLoading(false)
    }
  }

  const handleGoogleError = () => {
    setApiError('Google sign-in was cancelled or failed.')
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
      const message = error.response?.data?.error || 'Facebook sign-up failed. Please try again.'
      setApiError(message)
    } finally {
      setFacebookLoading(false)
    }
  }

  if (step === 'otp' && registerData) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-rose-nude" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h1 className="text-2xl font-heading font-bold text-black-primary mb-2">
                Verify Your Email
              </h1>
              <p className="text-gray-600">
                We sent a 6-digit code to <strong>{registerData.email}</strong>
              </p>
            </div>

            {apiError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm">{apiError}</p>
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label htmlFor="otp" className="block text-sm font-semibold text-black-primary mb-2 text-center">
                  Enter Verification Code
                </label>
                <input
                  id="otp"
                  type="text"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  className="w-full px-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-nude focus:border-transparent outline-none transition text-center text-2xl tracking-[0.5em] font-mono"
                  autoFocus
                />
              </div>

              <button
                type="button"
                onClick={handleOtpVerify}
                disabled={otpCode.length !== 6}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Verify & Create Account
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isSendingOtp}
                  className="text-sm text-rose-nude hover:underline disabled:opacity-50"
                >
                  {isSendingOtp ? 'Sending...' : 'Resend code'}
                </button>
              </div>

              <button
                type="button"
                onClick={() => { setStep('register'); setOtpCode(''); setApiError('') }}
                className="w-full text-center text-sm text-gray-500 hover:text-gray-700"
              >
                Back to registration form
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-heading font-bold text-black-primary mb-2">
            Join AH&amp;M
          </h1>
          <p className="text-gray-600 mb-8">Create your account and start shopping</p>

          {apiError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{apiError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmitDetails)} className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-black-primary mb-2">
                Full Name
              </label>
              <input
                {...register('name')}
                id="name"
                type="text"
                placeholder="Your full name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-nude focus:border-transparent outline-none transition"
              />
              {errors.name && (
                <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-black-primary mb-2">
                Email
              </label>
              <input
                {...register('email')}
                id="email"
                type="email"
                placeholder="your@email.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-nude focus:border-transparent outline-none transition"
              />
              {errors.email && (
                <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
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
              <p className="text-xs text-gray-500 mt-2">
                Must be at least 8 characters
              </p>
            </div>

            <div>
              <label htmlFor="password_confirm" className="block text-sm font-semibold text-black-primary mb-2">
                Confirm Password
              </label>
              <input
                {...register('password_confirm')}
                id="password_confirm"
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-nude focus:border-transparent outline-none transition"
              />
              {errors.password_confirm && (
                <p className="text-red-600 text-sm mt-1">{errors.password_confirm.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || isSendingOtp}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSendingOtp ? 'Sending verification...' : 'Create Account'}
            </button>
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

            <FacebookLoginButton
              onSuccess={handleFacebookSuccess}
              onError={(err) => setApiError(err)}
              isLoading={facebookLoading}
            />
          </div>

          <p className="text-center text-gray-600 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-rose-nude font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
