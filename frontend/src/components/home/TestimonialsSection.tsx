import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { testimonialsApi, type Testimonial } from '@services/customization'
import { getImageUrl } from '@utils/helpers'

export default function TestimonialsSection() {
  const [hoveredId, setHoveredId] = useState<number | null>(null)
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    testimonialsApi.list()
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : res.data.results || []
        setTestimonials(data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <section className="py-24 bg-gradient-to-b from-slate-900 to-slate-950 text-white">
        <div className="container-base text-center text-gray-400">Loading testimonials...</div>
      </section>
    )
  }

  if (testimonials.length === 0) {
    return null
  }

  return (
    <section className="py-24 bg-gradient-to-b from-slate-900 to-slate-950 text-white">
      <div className="container-base">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="text-gold text-sm tracking-widest uppercase font-semibold">
            Customer Stories
          </span>
          <h2 className="text-5xl md:text-6xl font-heading font-bold mt-4 mb-6">
            Loved by Women Everywhere
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            See how AH&amp;M has transformed the lives of thousands of confident women
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              onHoverStart={() => setHoveredId(testimonial.id)}
              onHoverEnd={() => setHoveredId(null)}
              className="group cursor-pointer"
            >
              {/* Media Frame (photo or video) */}
              <motion.div
                className="relative rounded-2xl overflow-hidden mb-6 h-64 bg-slate-800"
                animate={{
                  scale: hoveredId === testimonial.id ? 1.05 : 1,
                }}
                transition={{ duration: 0.4 }}
              >
                {testimonial.media_url_display && testimonial.media_type === 'video' ? (
                  <video
                    className="w-full h-full object-cover"
                    src={getImageUrl(testimonial.media_url_display)}
                    controls
                    playsInline
                  />
                ) : testimonial.media_url_display && testimonial.media_type === 'image' ? (
                  <img
                    src={getImageUrl(testimonial.media_url_display)}
                    alt={testimonial.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-700">
                    <svg className="w-16 h-16 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}

                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60 group-hover:opacity-30 transition-opacity duration-300" />
              </motion.div>

              {/* Content */}
              <motion.div
                animate={{ y: hoveredId === testimonial.id ? -5 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-5 h-5 ${i < testimonial.rating ? 'text-gold' : 'text-slate-600'}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                {/* Quote */}
                <blockquote className="text-lg text-gray-100 mb-6 font-light italic">
                  "{testimonial.quote}"
                </blockquote>

                {/* Author */}
                <div>
                  <p className="font-bold text-white">{testimonial.name}</p>
                  {testimonial.title && (
                    <p className="text-sm text-gold">{testimonial.title}</p>
                  )}
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
