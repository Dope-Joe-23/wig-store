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
      <section className="relative h-screen bg-gradient-to-br from-black-primary via-brown/80 to-black-primary overflow-hidden flex items-center justify-center">
        {/* Subtle animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />

        {/* Animated shimmer sweep */}
        <motion.div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            background: 'linear-gradient(105deg, transparent 30%, #fff 50%, transparent 70%)',
            backgroundSize: '200% 100%',
          }}
          animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        />

        <div className="relative z-10 container-base flex flex-col items-center justify-center text-center">
          {/* Brand monogram */}
          <motion.div
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="mb-6 sm:mb-8"
          >
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-rose-nude/30 to-gold/20 ring-1 ring-white/10 flex items-center justify-center mx-auto">
              <span className="text-gold/60 text-lg sm:text-xl font-heading font-bold tracking-tight">AH&amp;M</span>
            </div>
          </motion.div>

          {/* Tagline skeleton */}
          <div className="mb-3 sm:mb-6 md:mb-8 flex justify-center">
            <motion.div
              className="h-2.5 sm:h-3 w-28 sm:w-36 rounded-full bg-white/10"
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>

          {/* Heading skeleton - two lines */}
          <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4 md:mb-6 max-w-lg mx-auto w-full px-4">
            <motion.div
              className="h-8 sm:h-10 md:h-14 w-3/4 mx-auto rounded-lg bg-white/8"
              animate={{ opacity: [0.25, 0.55, 0.25] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', delay: 0.1 }}
            />
            <motion.div
              className="h-8 sm:h-10 md:h-14 w-1/2 mx-auto rounded-lg bg-white/6"
              animate={{ opacity: [0.2, 0.45, 0.2] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', delay: 0.25 }}
            />
          </div>

          {/* Subtitle skeleton */}
          <div className="space-y-1.5 sm:space-y-2 mb-8 sm:mb-10 md:mb-12 max-w-md mx-auto w-full px-6">
            <motion.div
              className="h-2 sm:h-2.5 w-full rounded-full bg-white/6"
              animate={{ opacity: [0.2, 0.45, 0.2] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', delay: 0.35 }}
            />
            <motion.div
              className="h-2 sm:h-2.5 w-5/6 mx-auto rounded-full bg-white/5"
              animate={{ opacity: [0.15, 0.35, 0.15] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
            />
          </div>

          {/* Buttons skeleton */}
          <div className="flex gap-3 sm:gap-4 justify-center">
            <motion.div
              className="h-10 sm:h-12 w-36 sm:w-44 rounded-lg bg-rose-nude/15"
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
            />
            <motion.div
              className="h-10 sm:h-12 w-32 sm:w-40 rounded-lg border border-white/10 bg-transparent"
              animate={{ opacity: [0.2, 0.45, 0.2] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', delay: 0.65 }}
            />
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="relative h-screen bg-gradient-to-br from-black-primary via-brown/80 to-black-primary overflow-hidden flex items-center justify-center">
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
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/50" />

      {/* Content */}
      <div className="relative z-10 container-base text-center text-white flex flex-col items-center justify-center min-h-0">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="mb-3 sm:mb-6 md:mb-8"
        >
          <span className="text-gold text-[10px] sm:text-xs md:text-sm tracking-[0.2em] uppercase font-semibold">
            {slide.tagline}
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }}
          className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-heading font-bold mb-3 sm:mb-4 md:mb-6 leading-tight px-2"
        >
          {slide.title}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
          className="text-sm sm:text-lg md:text-2xl max-w-2xl mx-auto mb-6 sm:mb-8 md:mb-12 text-cream/70 px-4"
        >
          {slide.subtitle}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
          className="flex gap-3 sm:gap-4 md:gap-6 justify-center flex-wrap"
        >
          <button
            onClick={() => navigate(slide.cta_link || '/products')}
            className="px-5 sm:px-8 md:px-10 py-2.5 sm:py-3 md:py-4 bg-rose-nude hover:bg-brown text-white text-sm sm:text-base font-bold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-brown/30"
          >
            {slide.cta_text || 'Explore Collection'}
          </button>
          {secondaryLink && secondaryLink.startsWith('/') ? (
            <button
              onClick={() => navigate(secondaryLink)}
              className="px-5 sm:px-8 md:px-10 py-2.5 sm:py-3 md:py-4 border-2 border-gold/60 text-gold text-sm sm:text-base font-bold rounded-lg hover:bg-gold/10 hover:border-gold transition-all duration-300"
            >
              {slide.secondary_cta_text || 'Watch Our Story'}
            </button>
          ) : secondaryLink ? (
            <a
              href={secondaryLink}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 sm:px-8 md:px-10 py-2.5 sm:py-3 md:py-4 border-2 border-gold/60 text-gold text-sm sm:text-base font-bold rounded-lg hover:bg-gold/10 hover:border-gold transition-all duration-300 inline-block"
            >
              {slide.secondary_cta_text || 'Watch Our Story'}
            </a>
          ) : null}
        </motion.div>

        {/* Slide Navigation Dots — in flow, below buttons */}
        {slides.length > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex gap-2 mt-6 sm:mt-8 md:mt-10"
          >
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                aria-label={`Go to slide ${index + 1}`}
                className={`h-1.5 sm:h-2 rounded-full transition-all duration-500 ${
                  index === currentIndex
                    ? 'w-6 sm:w-8 bg-rose-nude shadow-lg shadow-rose-nude/30'
                    : 'w-1.5 sm:w-2 bg-white/40 hover:bg-white/70'
                }`}
              />
            ))}
          </motion.div>
        )}
      </div>

      {/* Scroll Indicator */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-4 sm:bottom-6 md:bottom-8 left-1/2 transform -translate-x-1/2 z-10"
      >
        <div className="w-5 h-8 sm:w-6 sm:h-10 border-2 border-white/30 rounded-full flex justify-center">
          <motion.div className="w-1 h-1.5 sm:h-2 bg-white/60 rounded-full mt-2" />
        </div>
      </motion.div>
    </section>
  )
}
