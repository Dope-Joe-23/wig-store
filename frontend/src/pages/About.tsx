import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { aboutPageApi, type AboutPageData } from '@services/customization'
import { getImageUrl } from '@utils/helpers'

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.15, ease: 'easeOut' },
  }),
}

function AboutSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-cream to-white">
      <div className="container-base py-24 animate-pulse">
        <div className="h-12 w-64 bg-gray-200 rounded-lg mx-auto mb-4" />
        <div className="h-6 w-96 bg-gray-200 rounded-lg mx-auto mb-16" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          <div className="h-80 bg-gray-200 rounded-xl" />
          <div className="space-y-4">
            <div className="h-8 w-48 bg-gray-200 rounded-lg" />
            <div className="h-4 bg-gray-200 rounded-lg" />
            <div className="h-4 bg-gray-200 rounded-lg" />
            <div className="h-4 w-3/4 bg-gray-200 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  )
}

const defaultValues = [
  { title: 'Craftsmanship', description: 'Every wig is meticulously handcrafted using premium materials and techniques passed down through generations of master artisans.' },
  { title: 'Confidence', description: 'We believe the right wig doesn\'t just change your look — it transforms how you feel. Confidence radiates from every strand.' },
  { title: 'Inclusivity', description: 'Beauty comes in every texture, length, and shade. Our collections celebrate diversity and empower every individual.' },
  { title: 'Sustainability', description: 'We\'re committed to ethical sourcing, eco-friendly packaging, and sustainable practices that honor both people and planet.' },
]

export default function AboutPage() {
  const [page, setPage] = useState<AboutPageData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    aboutPageApi.list()
      .then(res => {
        const data = Array.isArray(res.data) ? res.data[0] : (res.data.results?.[0] || res.data)
        setPage(data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <AboutSkeleton />

  const storyImage = page?.story_image_display || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1200&q=80'
  const missionImage = page?.mission_image_display || 'https://images.unsplash.com/photo-1562572933-2f5a0f822334?w=1200&q=80'
  const values = (page?.values?.length ? page.values : defaultValues) as { title: string; description: string }[]

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream to-white">
      {/* Hero Banner */}
      <section className="relative h-[50vh] min-h-[400px] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={getImageUrl(storyImage)}
            alt="About Wiggle"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
        </div>
        <div className="relative z-10 h-full flex items-center">
          <div className="container-base">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
              <span className="text-rose-300 text-sm tracking-widest uppercase font-semibold">
                {page?.subtitle || 'Discover Our Story'}
              </span>
              <h1 className="text-5xl md:text-7xl font-heading font-bold text-white mt-4 mb-6">
                {page?.title || 'About Wiggle'}
              </h1>
              <Link
                to="/products"
                className="inline-flex items-center gap-2 px-8 py-3 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition font-semibold"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Explore Collection
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-24">
        <div className="container-base">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <span className="text-rose-500 text-sm tracking-widest uppercase font-semibold">Our Story</span>
              <h2 className="text-4xl md:text-5xl font-heading font-bold text-slate-900 mt-3 mb-6">
                {page?.story_title || 'The Wiggle Journey'}
              </h2>
              <div className="prose prose-lg text-gray-600 max-w-none">
                <p>
                  {page?.story_content || 
                    'Wiggle was born from a simple belief: every woman deserves to feel confident, beautiful, and unapologetically herself. Founded by a team of hairstylists and entrepreneurs who saw a gap in the market for premium-quality wigs that didn\'t compromise on style or comfort, Wiggle has grown from a small boutique into a trusted name in luxury hair.'
                  }
                </p>
              </div>
              <div className="mt-8 flex flex-wrap gap-4">
                <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-lg shadow-sm">
                  <span className="text-3xl">🌍</span>
                  <div>
                    <p className="font-bold text-slate-900">10,000+</p>
                    <p className="text-sm text-gray-500">Happy Customers</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-lg shadow-sm">
                  <span className="text-3xl">🎨</span>
                  <div>
                    <p className="font-bold text-slate-900">500+</p>
                    <p className="text-sm text-gray-500">Styles & Colors</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-lg shadow-sm">
                  <span className="text-3xl">⭐</span>
                  <div>
                    <p className="font-bold text-slate-900">4.9/5</p>
                    <p className="text-sm text-gray-500">Average Rating</p>
                  </div>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-rose-100 rounded-full opacity-50" />
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-rose-100 rounded-full opacity-30" />                <img
                src={getImageUrl(storyImage)}
                alt="Our Story"
                className="relative rounded-2xl shadow-xl w-full h-[500px] object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-24 bg-slate-900">
        <div className="container-base">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="order-2 lg:order-1"
            >
              <img
                src={getImageUrl(missionImage)}
                alt="Our Mission"
                className="rounded-2xl shadow-xl w-full h-[400px] object-cover"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="order-1 lg:order-2"
            >
              <span className="text-rose-300 text-sm tracking-widest uppercase font-semibold">Our Mission</span>
              <h2 className="text-4xl md:text-5xl font-heading font-bold text-white mt-3 mb-6">
                {page?.mission_title || 'Empowering Through Elegance'}
              </h2>
              <p className="text-gray-300 text-lg leading-relaxed">
                {page?.mission_content ||
                  'To redefine beauty standards by providing accessible luxury wigs that celebrate individuality. We\'re committed to craftsmanship, innovation, and creating a community where everyone feels seen, heard, and beautiful — one strand at a time.'
                }
              </p>
              <div className="mt-8 flex gap-4">
                <div className="flex items-center gap-3 bg-white/10 px-5 py-3 rounded-lg backdrop-blur-sm">
                  <span className="text-2xl">🤝</span>
                  <p className="text-white font-semibold">Community First</p>
                </div>
                <div className="flex items-center gap-3 bg-white/10 px-5 py-3 rounded-lg backdrop-blur-sm">
                  <span className="text-2xl">💎</span>
                  <p className="text-white font-semibold">Quality Guaranteed</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-24">
        <div className="container-base">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-rose-500 text-sm tracking-widest uppercase font-semibold">What We Stand For</span>
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-slate-900 mt-3 mb-4">
              Our Core Values
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              These principles guide everything we do — from sourcing materials to crafting each wig with love.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, i) => (
              <motion.div
                key={value.title}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-14 h-14 bg-rose-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-rose-100 transition">
                  <svg className="w-7 h-7 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-r from-rose-500 to-rose-600">
        <div className="container-base text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-white mb-6">
              Ready to Find Your Perfect Look?
            </h2>
            <p className="text-rose-100 text-lg max-w-2xl mx-auto mb-10">
              Explore our collection of premium wigs and discover the confidence that comes with wearing Wiggle.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-10 py-4 bg-white text-rose-600 rounded-lg hover:bg-rose-50 transition font-bold text-lg shadow-xl"
            >
              Shop the Collection
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
