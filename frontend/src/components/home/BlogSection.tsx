import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { blogApi, BlogPost } from '@services/blog'
import { getImageUrl } from '@utils/helpers'

const categoryColors: Record<string, string> = {
  product: 'bg-blue-100 text-blue-700',
  tips: 'bg-green-100 text-green-700',
  beauty: 'bg-purple-100 text-purple-700',
  news: 'bg-orange-100 text-orange-700',
  general: 'bg-gray-100 text-gray-700',
}

const categoryLabels: Record<string, string> = {
  product: 'Product Spotlight',
  tips: 'Tips & Tricks',
  beauty: 'Beauty & Style',
  news: 'News & Updates',
  general: 'General',
}

export default function BlogSection() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await blogApi.list()
        const data = Array.isArray(res.data) ? res.data : res.data.results || []
        setPosts(data.filter((p: BlogPost) => p.is_active))
      } catch (err) {
        console.error('Failed to fetch blog posts:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchPosts()
  }, [])

  return (
    <section className="relative py-24 bg-gradient-to-br from-slate-50 via-white to-rose-50 overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-rose-100 rounded-full blur-3xl opacity-30 -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-100 rounded-full blur-3xl opacity-20 translate-x-1/3 translate-y-1/3" />

      <div className="relative z-10 container-base">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-14"
        >
          <span className="text-gold-dark text-sm tracking-widest uppercase font-semibold">
            Our Blog
          </span>
          <h2 className="text-5xl md:text-6xl font-heading font-bold text-slate-900 mt-4 mb-4">
            Latest Stories & Tips
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover expert advice, product spotlights, and inspiration for your hair journey.
          </p>
        </motion.div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin mx-auto" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-4xl mb-4">📝</p>
            <p className="text-lg">No articles yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post, index) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 flex flex-col"
              >
                {/* Cover Image */}
                <div className="aspect-[16/9] bg-gray-100 overflow-hidden relative">
                  {post.cover_image_display ? (
                    <img
                      src={getImageUrl(post.cover_image_display)}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-rose-100 to-purple-100 flex items-center justify-center">
                      <span className="text-5xl">📝</span>
                    </div>
                  )}
                  {/* Category Badge */}
                  <span className={`absolute top-4 left-4 text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm ${categoryColors[post.category] || categoryColors.general}`}>
                    {categoryLabels[post.category] || post.category}
                  </span>
                  {post.is_featured && (
                    <span className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                      Featured
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col flex-1">
                  {/* Meta */}
                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                    {post.author && (
                      <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {post.author}
                      </span>
                    )}
                    {post.read_time && (
                      <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {post.read_time}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="font-heading font-bold text-xl text-slate-900 mb-3 line-clamp-2 group-hover:text-gold-dark transition-colors">
                    {post.external_link ? (
                      <a href={post.external_link} target="_blank" rel="noopener noreferrer" className="hover:text-gold-dark">
                        {post.title}
                      </a>
                    ) : post.title}
                  </h3>

                  {/* Excerpt */}
                  {post.excerpt && (
                    <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-4 flex-1">
                      {post.excerpt}
                    </p>
                  )}

                  {/* Read More */}
                  <div className="pt-4 border-t border-gray-100">
                    {post.external_link ? (
                      <a
                        href={post.external_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-gold-dark font-semibold text-sm hover:text-gold-dark transition-colors"
                      >
                        Read Full Article
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </a>
                    ) : (
                      <Link
                        to={`/blog/${post.id}`}
                        className="inline-flex items-center gap-2 text-gold-dark font-semibold text-sm hover:text-gold-dark transition-colors"
                      >
                        Read More
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </Link>
                    )}
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
