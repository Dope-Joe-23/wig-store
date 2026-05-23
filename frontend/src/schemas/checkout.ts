import { z } from 'zod'

export const checkoutSchema = z.object({
  first_name: z
    .string()
    .min(1, 'First name is required')
    .max(50, 'First name must be less than 50 characters'),
  last_name: z
    .string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be less than 50 characters'),
  email: z
    .string()
    .email('Invalid email address')
    .min(1, 'Email is required'),
  phone: z
    .string()
    .regex(/^[\d\s\-+()]*$/, 'Invalid phone number format')
    .min(10, 'Phone number must be at least 10 digits'),
  street_address: z
    .string()
    .min(5, 'Street address must be at least 5 characters')
    .min(1, 'Street address is required'),
  city: z
    .string()
    .min(1, 'City is required')
    .max(50, 'City must be less than 50 characters'),
  state: z
    .string()
    .min(1, 'State is required')
    .max(50, 'State must be less than 50 characters'),
  postal_code: z
    .string()
    .regex(/^[0-9]{5}(-[0-9]{4})?$/, 'Invalid postal code (use format: 12345 or 12345-6789)'),
  country: z
    .string()
    .min(1, 'Country is required')
    .max(50, 'Country must be less than 50 characters'),
  // Ghana Payment Methods
  payment_method: z
    .enum(['card', 'mtn_momo', 'telecel_momo', 'airteltigo_momo'], {
      errorMap: () => ({ message: 'Please select a valid payment method' }),
    }),
  
  // Mobile Money fields (for MTN & Telecel)
  momo_phone: z
    .string()
    .optional(),
  
}).refine(
  (data) => {
    // If mobile money is selected, require phone number
    if (['mtn_momo', 'telecel_momo', 'airteltigo_momo'].includes(data.payment_method)) {
      return !!(data.momo_phone && data.momo_phone.trim().length >= 10)
    }
    return true
  },
  {
    message: 'Phone number is required for Mobile Money payment',
    path: ['momo_phone'],
  }
)

export type CheckoutFormData = z.infer<typeof checkoutSchema>
