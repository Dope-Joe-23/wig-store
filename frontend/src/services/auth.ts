import { apiClient } from './api'
import { User } from '../types/index'

export interface LoginCredentials {
  username: string
  password: string
}

export interface RegisterData {
  email: string
  name: string
  password: string
  password_confirm: string
}

export interface AuthResponse {
  access: string
  refresh: string
  user: User
}

export const authService = {
  // Login
  login: (credentials: LoginCredentials) =>
    apiClient.post('/auth/token/', {
      username: credentials.username,
      password: credentials.password
    }),

  // Register
  register: (data: RegisterData) =>
    apiClient.post('/auth/users/register/', data),

  // Get current user
  getCurrentUser: () =>
    apiClient.get('/auth/users/me/'),

  // Update profile
  updateProfile: (data: Partial<User>) =>
    apiClient.patch('/auth/users/update_me/', data),

  // Send OTP
  sendOTP: (email: string, purpose: 'login' | 'register' = 'login') =>
    apiClient.post('/auth/otp/send/', { email, purpose }),

  // Verify OTP and login
  verifyOTP: (email: string, otp: string) =>
    apiClient.post('/auth/otp/verify/', { email, otp }),

  // Social login with Google ID token
  socialLogin: (idToken: string) =>
    apiClient.post('/auth/social/google/', {
      id_token: idToken
    }),

  // Social login with Facebook access token
  facebookLogin: (accessToken: string) =>
    apiClient.post('/auth/social/facebook/', {
      access_token: accessToken
    }),

  // Logout
  logout: () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
  },

  // Store tokens
  setTokens: (access: string, refresh: string) => {
    localStorage.setItem('access_token', access)
    localStorage.setItem('refresh_token', refresh)
  },

  // Get stored token
  getAccessToken: () => localStorage.getItem('access_token'),
}
