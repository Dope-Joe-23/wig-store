/* Utility helpers */

export const formatCurrency = (amount: number, currency = 'GHS'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount)
}

export const formatDate = (date: string | Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date))
}

export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export const classNames = (...classes: (string | boolean | undefined)[]): string => {
  return classes.filter(Boolean).join(' ')
}

export const getImageUrl = (url: string | null | undefined): string => {
  if (!url) return ''
  // If URL is absolute (starts with http), return as-is
  if (url.startsWith('http')) return url
  // If URL is relative (starts with /), prepend API base URL
  if (url.startsWith('/')) {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'
    const baseUrl = apiUrl.replace('/api/v1', '')
    return `${baseUrl}${url}`
  }
  return url
}

export const truncate = (text: string, length: number): string => {
  if (text.length <= length) return text
  return `${text.substring(0, length)}...`
}

/**
 * Extract a readable error message from a failed Axios request.
 * Handles DRF field-level validation errors (object) and top-level errors (detail),
 * as well as network and generic errors.
 */
export const getApiErrorMessage = (err: any, fallback = 'Failed to save'): string => {
  if (err?.response?.data) {
    const data = err.response.data
    // DRF top-level error
    if (typeof data === 'string') return data
    if (data.detail) return data.detail
    // Array responses (unlikely for errors, but guard against it)
    if (Array.isArray(data)) return fallback
    // DRF field-level validation: {"field": ["error1", "error2"]}
    const fieldKeys = Object.keys(data).filter(k => k !== 'status_code')
    if (fieldKeys.length > 0) {
      const parts: string[] = []
      for (const key of fieldKeys) {
        const val = data[key]
        if (Array.isArray(val)) {
          parts.push(`${key}: ${val.join(', ')}`)
        } else if (typeof val === 'string') {
          parts.push(`${key}: ${val}`)
        } else if (val && typeof val === 'object') {
          parts.push(`${key}: ${JSON.stringify(val)}`)
        }
      }
      return parts.join(' | ')
    }
  }
  return err?.message || fallback
}
