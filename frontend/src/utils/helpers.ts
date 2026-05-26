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
 * Check if a URL is a YouTube video URL.
 */
export const isYouTubeUrl = (url: string): boolean => {
  return /(?:youtube\.com\/watch\?v=|youtu\.be\/)/.test(url)
}

/**
 * Check if a URL is a Vimeo video URL.
 */
export const isVimeoUrl = (url: string): boolean => {
  return /vimeo\.com\/\d+/.test(url)
}

/**
 * Extract YouTube video ID from a YouTube URL.
 * Returns null if the URL is not a valid YouTube URL.
 */
export const getYouTubeId = (url: string): string | null => {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/)
  return match ? match[1] : null
}

/**
 * Get a YouTube thumbnail URL from a video ID.
 * @param videoId - The YouTube video ID
 * @param quality - 'maxres' (1280x720) or 'hq' (480x360)
 */
export const getYouTubeThumbnailUrl = (videoId: string, quality: 'maxres' | 'hq' = 'maxres'): string => {
  return `https://img.youtube.com/vi/${videoId}/${quality}default.jpg`
}

/**
 * Get the best available thumbnail URL for a video.
 * For YouTube videos, auto-generates the thumbnail URL from the video ID.
 * For direct files, returns the video URL itself (for use in a <video> element).
 * For Vimeo, returns null (no simple thumbnail URL without API).
 */
export const getVideoFallbackThumbnail = (videoUrl: string): { type: 'image' | 'video'; url: string } | null => {
  if (isYouTubeUrl(videoUrl)) {
    const ytId = getYouTubeId(videoUrl)
    if (ytId) {
      return { type: 'image', url: getYouTubeThumbnailUrl(ytId) }
    }
  }
  // For direct video files (not Vimeo), return the URL for a <video> element
  if (!isVimeoUrl(videoUrl)) {
    return { type: 'video', url: videoUrl }
  }
  // Vimeo: no simple thumbnail without an API call
  return null
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
