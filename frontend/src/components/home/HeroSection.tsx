import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { heroSlidesApi, type HeroSlide } from '@services/customization'
import { getImageUrl } from '@utils/helpers'

export default function HeroSection() {
  const navigate = useNavigate()
  const [slides, setSlides] = useState<HeroSlide[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    heroSlidesApi.list()
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : res.data.results || []
        setSlides(data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // Default slide if no data from API
  const defaultSlide = {
    title: 'Elegance Redefined',
    subtitle: 'Discover the artistry of premium wigs crafted for the modern woman who demands perfection',
    tagline: 'Premium Luxury Wigs',
    cta_text: 'Explore Collection',
    cta_link: '/products',
    secondary_cta_text: 'Watch Our Story',
    secondary_cta_link: '/about',
    media_type: 'image' as const,
    media_url_display: null,
  }

  const slide = slides[currentIndex] || defaultSlide
  const mediaUrl = slide.media_url_display
  // If secondary_cta_link is '#' (API default, not useful), treat as '/about'
  const secondaryLink = slide.secondary_cta_link && slide.secondary_cta_link !== '#'
    ? slide.secondary_cta_link
    : '/about'

  if (loading) {
    return (
      <section className="relative h-screen bg-gradient-to-br from-slate-900 via-rose-900 to-slate-950 flex items-center justify-center">
        <div className="text-white/50 text-lg">Loading...</div>
      </section>
    )
  }

  return (
    <section className="relative h-screen bg-gradient-to-br from-slate-900 via-rose-900 to-slate-950 overflow-hidden flex items-center justify-center">
      {/* Background Media */}
      {mediaUrl && slide.media_type === 'video' ? (
        <div className="absolute inset-0 opacity-40">
          <video
            className="w-full h-full object-cover"
            src={getImageUrl(mediaUrl)}
            autoPlay
            muted
            loop
            playsInline
          />
        </div>
      ) : mediaUrl && slide.media_type === 'image' ? (
        <div className="absolute inset-0 opacity-30">
          <img
            src={getImageUrl(mediaUrl)}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
      ) : null}

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Content */}
      <div className="relative z-10 container-base text-center text-white">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="mb-8"
        >
          <span className="text-rose-300 text-sm tracking-widest uppercase font-semibold">
            {slide.tagline}
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }}
          className="text-6xl md:text-7xl lg:text-8xl font-heading font-bold mb-6 leading-tight"
        >
          {slide.title}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
          className="text-xl md:text-2xl max-w-2xl mx-auto mb-12 text-gray-200"
        >
          {slide.subtitle}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
          className="flex gap-6 justify-center flex-wrap"
        >
          <button
            onClick={() => navigate(slide.cta_link || '/products')}
            className="px-10 py-4 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            {slide.cta_text || 'Explore Collection'}
          </button>
          {secondaryLink && secondaryLink.startsWith('/') ? (
            <button
              onClick={() => navigate(secondaryLink)}
              className="px-10 py-4 border-2 border-white text-white font-bold rounded-lg hover:bg-white/10 transition-all duration-300"
            >
              {slide.secondary_cta_text || 'Watch Our Story'}
            </button>
          ) : secondaryLink ? (
            <a
              href={secondaryLink}
              target="_blank"
              rel="noopener noreferrer"
              className="px-10 py-4 border-2 border-white text-white font-bold rounded-lg hover:bg-white/10 transition-all duration-300 inline-block"
            >
              {slide.secondary_cta_text || 'Watch Our Story'}
            </a>
          ) : null}
        </motion.div>
      </div>

      {/* Slide Navigation Dots */}
      {slides.length > 1 && (
        <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 z-10 flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                index === currentIndex ? 'bg-rose-500 w-6' : 'bg-white/50 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      )}

      {/* Scroll Indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10"
      >
        <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
          <motion.div className="w-1 h-2 bg-white rounded-full mt-2" />
        </div>
      </motion.div>
    </section>
  )
}
