import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { featuredItemsApi, type FeaturedItem } from '@services/customization'
import { getImageUrl } from '@utils/helpers'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: 'easeOut' },
  },
}

export default function FeaturedSection() {
  const navigate = useNavigate()
  const [isClient, setIsClient] = useState(false)

  const [hoveredId, setHoveredId] = useState<number | null>(null)
  const [items, setItems] = useState<FeaturedItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    featuredItemsApi.list()
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : res.data.results || []
        setItems(data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <section className="py-24 bg-gradient-to-b from-cream to-slate-50">
        <div className="container-base text-center text-gray-500">Loading featured items...</div>
      </section>
    )
  }

  if (items.length === 0) {
    return null
  }

  return (
    <section className="py-24 bg-gradient-to-b from-cream to-slate-50">
      <div className="container-base">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="text-rose-500 text-sm tracking-widest uppercase font-semibold">
            Curated Collections
          </span>
          <h2 className="text-5xl md:text-6xl font-heading font-bold text-slate-900 mt-4 mb-6">
            This Season's Favorites
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Handpicked luxury wigs that define elegance and confidence
          </p>
        </motion.div>

        {/* Items Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {items.map((item) => (
            <motion.div
              key={item.id}
              variants={itemVariants}
              onHoverStart={() => setHoveredId(item.id)}
              onHoverEnd={() => setHoveredId(null)}
              className="group cursor-pointer"
              onClick={() => item.product_slug && navigate(`/products/${item.product_slug}`)}
            >
              <div className="relative overflow-hidden rounded-lg shadow-lg h-96 bg-gray-200 mb-4">
                {item.media_url_display ? (
                  <motion.img
                    src={getImageUrl(item.media_url_display)}
                    alt={item.title || item.product_name || ''}
                    className="w-full h-full object-cover"
                    animate={{ scale: hoveredId === item.id ? 1.1 : 1 }}
                    transition={{ duration: 0.6 }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">
                    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}

                {/* Badge */}
                {item.badge_text && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="absolute top-4 left-4"
                  >
                    <span className="inline-block bg-rose-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase">
                      {item.badge_text}
                    </span>
                  </motion.div>
                )}

                {/* Quick Add Button */}
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{
                    opacity: hoveredId === item.id ? 1 : 0,
                    y: hoveredId === item.id ? 0 : 20,
                  }}
                  transition={{ duration: 0.3 }}
                  className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-6 py-3 bg-white text-slate-900 font-bold rounded-lg hover:bg-rose-500 hover:text-white transition-all"
                >
                  Quick Add
                </motion.button>
              </div>

              {/* Item Info */}
              <motion.div
                animate={{ y: hoveredId === item.id ? -5 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-xl font-heading font-bold text-slate-900 mb-2">
                  {item.title || item.product_name || 'Featured Item'}
                </h3>
                {item.product_price && (
                  <p className="text-rose-500 text-lg font-bold">GHS {item.product_price}</p>
                )}
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
