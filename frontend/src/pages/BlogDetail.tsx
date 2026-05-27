import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { blogApi, BlogPost } from '@services/blog'
import { getImageUrl, formatDate } from '@utils/helpers'

const categoryLabels: Record<string, string> = {
  product: 'Product Spotlight',
  tips: 'Tips & Tricks',
  beauty: 'Beauty & Style',
  news: 'News & Updates',
  general: 'General',
}

const categoryColors: Record<string, string> = {
  product: 'bg-blue-100 text-blue-700',
  tips: 'bg-green-100 text-green-700',
  beauty: 'bg-purple-100 text-purple-700',
  news: 'bg-orange-100 text-orange-700',
  general: 'bg-gray-100 text-gray-700',
}

export default function BlogDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!id) return
    const fetchPost = async () => {
      try {
        const res = await blogApi.get(Number(id))
        setPost(res.data)
      } catch (err) {
        console.error('Failed to fetch blog post:', err)
        setError(true)
      } finally {
        setLoading(false)
      }
    }
    fetchPost()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-rose-50">
        {/* Hero skeleton */}
        <div className="relative h-[40vh] md:h-[50vh] bg-gray-200 overflow-hidden skeleton-shimmer">
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/20 to-transparent" />
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute bottom-0 left-0 right-0 p-6 md:p-12 container-base"
          >
            <div className="h-5 w-28 bg-white/30 rounded-full skeleton-shimmer mb-4" />
            <div className="h-10 w-3/4 bg-white/20 rounded skeleton-shimmer mb-4" />
            <div className="h-10 w-1/2 bg-white/20 rounded skeleton-shimmer mb-4" />
            <div className="flex gap-4">
              <div className="h-4 w-24 bg-white/20 rounded skeleton-shimmer" />
              <div className="h-4 w-20 bg-white/20 rounded skeleton-shimmer" />
              <div className="h-4 w-28 bg-white/20 rounded skeleton-shimmer" />
            </div>
          </motion.div>
        </div>

        {/* Breadcrumb skeleton */}
        <div className="container-base py-4">
          <div className="flex items-center gap-2">
            <div className="h-4 w-12 bg-gray-200 rounded skeleton-shimmer" />
            <span className="text-gray-300">/</span>
            <div className="h-4 w-10 bg-gray-200 rounded skeleton-shimmer" />
            <span className="text-gray-300">/</span>
            <div className="h-4 w-24 bg-gray-200 rounded skeleton-shimmer" />
          </div>
        </div>

        {/* Content skeleton */}
        <div className="container-base pb-20">
          <div className="max-w-3xl mx-auto space-y-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <div className="h-6 w-full bg-gray-200 rounded skeleton-shimmer" />
              <div className="h-6 w-5/6 bg-gray-200 rounded skeleton-shimmer" />
              <div className="h-6 w-2/3 bg-gray-200 rounded skeleton-shimmer" />
              <div className="h-4 w-full bg-gray-100 rounded skeleton-shimmer mt-6" />
              <div className="h-4 w-full bg-gray-100 rounded skeleton-shimmer" />
              <div className="h-4 w-4/5 bg-gray-100 rounded skeleton-shimmer" />
              <div className="h-4 w-full bg-gray-100 rounded skeleton-shimmer" />
              <div className="h-4 w-3/4 bg-gray-100 rounded skeleton-shimmer" />
              <div className="h-8 w-1/2 bg-gray-200 rounded skeleton-shimmer mt-8" />
              <div className="h-4 w-full bg-gray-100 rounded skeleton-shimmer mt-4" />
              <div className="h-4 w-full bg-gray-100 rounded skeleton-shimmer" />
              <div className="h-4 w-5/6 bg-gray-100 rounded skeleton-shimmer" />
              <div className="h-4 w-full bg-gray-100 rounded skeleton-shimmer" />
              <div className="h-4 w-2/3 bg-gray-100 rounded skeleton-shimmer" />
            </motion.div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-rose-50 py-24">
        <div className="container-base text-center">
          <p className="text-6xl mb-6">📝</p>
          <h1 className="text-3xl font-heading font-bold text-slate-900 mb-4">
            Post Not Found
          </h1>
          <p className="text-gray-600 mb-8">
            This article doesn't exist or has been removed.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-rose-nude text-white rounded-lg font-semibold hover:bg-rose-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-rose-50">
      {/* Hero / Cover Section */}
      <div className="relative h-[40vh] md:h-[50vh] bg-gray-900 overflow-hidden">
        {post.cover_image_display ? (
          <img
            src={getImageUrl(post.cover_image_display)}
            alt={post.title}
            className="w-full h-full object-cover opacity-70"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-rose-300 via-purple-200 to-rose-100" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 container-base">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${categoryColors[post.category] || categoryColors.general}`}>
                {categoryLabels[post.category] || post.category}
              </span>
              {post.is_featured && (
                <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full">
                  Featured
                </span>
              )}
            </div>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-heading font-bold text-white mb-4 leading-tight">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300">
              {post.author && (
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {post.author}
                </span>
              )}
              {post.read_time && (
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {post.read_time}
                </span>
              )}
              {post.created_at && (
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {formatDate(post.created_at)}
                </span>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="container-base py-4">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link to="/" className="hover:text-rose-600 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-gray-400">Blog</span>
          <span>/</span>
          <span className="text-gray-800 font-medium truncate max-w-[200px]">{post.title}</span>
        </div>
      </div>

      {/* Article Content */}
      <div className="container-base pb-20">
        <div className="max-w-3xl mx-auto">
          {post.external_link && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8 flex items-center gap-3">
              <svg className="w-5 h-5 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              <span className="text-sm text-blue-700">
                This article is hosted externally.{' '}
                <a
                  href={post.external_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold underline hover:text-blue-800"
                >
                  Read the full article on the original site →
                </a>
              </span>
            </div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Excerpt */}
            {post.excerpt && (
              <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-8 font-medium italic border-l-4 border-rose-300 pl-6">
                {post.excerpt}
              </p>
            )}

            {/* Full Content */}
            <div className="prose prose-lg max-w-none prose-headings:font-heading prose-headings:text-slate-900 prose-a:text-rose-600 prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl prose-blockquote:border-rose-300 prose-blockquote:text-gray-700 prose-strong:text-slate-900">
              {post.content.split('\n').map((paragraph, i) => {
                const trimmed = paragraph.trim()
                if (!trimmed) return null

                // Heading detection (## or ### style)
                if (trimmed.startsWith('### ')) {
                  return (
                    <h3 key={i} className="text-2xl font-heading font-bold text-slate-900 mt-10 mb-4">
                      {trimmed.replace(/^###\s+/, '')}
                    </h3>
                  )
                }
                if (trimmed.startsWith('## ')) {
                  return (
                    <h2 key={i} className="text-3xl font-heading font-bold text-slate-900 mt-12 mb-4">
                      {trimmed.replace(/^##\s+/, '')}
                    </h2>
                  )
                }                // Bullet points
                    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                      return (
                        <p key={i} className="text-gray-700 leading-relaxed mb-2 pl-6 flex items-start gap-2">
                          <span className="text-rose-400 mt-2 flex-shrink-0">•</span>
                          <span>{trimmed.replace(/^[-*]\s+/, '')}</span>
                        </p>
                      )
                    }

                    // Numbered list
                    if (/^\d+\.\s/.test(trimmed)) {
                      const num = trimmed.match(/^(\d+)/)?.[1] || ''
                      return (
                        <p key={i} className="text-gray-700 leading-relaxed mb-2 pl-6 flex items-start gap-2">
                          <span className="text-rose-500 font-semibold text-sm mt-0.5 flex-shrink-0 w-5 text-right">{num}.</span>
                          <span>{trimmed.replace(/^\d+\.\s+/, '')}</span>
                        </p>
                      )
                    }

                // Regular paragraph
                return (
                  <p key={i} className="text-gray-700 leading-relaxed mb-5">
                    {trimmed}
                  </p>
                )
              })}
            </div>
          </motion.div>

          {/* Bottom Navigation */}
          <div className="mt-16 pt-8 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 text-gray-600 hover:text-rose-600 transition-colors font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Go Back
            </button>
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-rose-600 hover:text-rose-700 transition-colors font-semibold"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
