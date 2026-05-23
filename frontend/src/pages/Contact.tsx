import { motion } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import { contactPageApi, type ContactPageData } from '@services/customization'
import { getImageUrl } from '@utils/helpers'

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.15, ease: 'easeOut' },
  }),
}

const defaultSocials = [
  { platform: 'Instagram', url: 'https://instagram.com/wiggle' },
  { platform: 'Facebook', url: 'https://facebook.com/wiggle' },
  { platform: 'Twitter', url: 'https://twitter.com/wiggle' },
  { platform: 'TikTok', url: 'https://tiktok.com/@wiggle' },
]

const platformIcons: Record<string, string> = {
  Instagram: '📸',
  Facebook: '👍',
  Twitter: '🐦',
  TikTok: '🎵',
  YouTube: '📺',
  Pinterest: '📌',
}

export default function ContactPage() {
  const [page, setPage] = useState<ContactPageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [formSent, setFormSent] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    contactPageApi.list()
      .then(res => {
        const data = Array.isArray(res.data) ? res.data[0] : (res.data.results?.[0] || res.data)
        setPage(data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFormSent(true)
    setTimeout(() => setFormSent(false), 5000)
    if (formRef.current) formRef.current.reset()
  }

  const bannerImage = page?.banner_image_display || 'https://images.unsplash.com/photo-1522339213992-b88fbc36a656?w=1920&q=80'
  const socialLinks = (page?.social_links?.length ? page.social_links : defaultSocials) as { platform: string; url: string }[]

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream to-white">
      {/* Hero Banner */}
      <section className="relative h-[45vh] min-h-[350px] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={getImageUrl(bannerImage)}
            alt="Contact Wiggle"
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
                {page?.subtitle || "We'd Love to Hear From You"}
              </span>
              <h1 className="text-5xl md:text-7xl font-heading font-bold text-white mt-4 mb-6">
                {page?.title || 'Get in Touch'}
              </h1>
              <p className="text-gray-200 text-lg max-w-xl">
                Have a question, need styling advice, or want to share your Wiggle story? We're here for you.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact Grid */}
      <section className="py-24">
        <div className="container-base">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-1 space-y-8"
            >
              <div>
                <h2 className="text-2xl font-heading font-bold text-slate-900 mb-6">Contact Information</h2>
                <div className="space-y-5">
                  {page?.email && (
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">Email</p>
                        <a href={`mailto:${page.email}`} className="text-gray-600 hover:text-rose-500 transition">
                          {page.email}
                        </a>
                      </div>
                    </div>
                  )}
                  {page?.phone && (
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">Phone</p>
                        <a href={`tel:${page.phone}`} className="text-gray-600 hover:text-rose-500 transition">
                          {page.phone}
                        </a>
                      </div>
                    </div>
                  )}
                  {page?.address && (
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">Address</p>
                        <p className="text-gray-600">{page.address}</p>
                      </div>
                    </div>
                  )}
                  {page?.working_hours && (
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">Working Hours</p>
                        <p className="text-gray-600 whitespace-pre-line">{page.working_hours}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Social Links */}
              {socialLinks.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Follow Us</h3>
                  <div className="flex flex-wrap gap-3">
                    {socialLinks.map(link => (
                      <a
                        key={link.platform}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:border-rose-200 hover:bg-rose-50 transition group"
                      >
                        <span className="text-lg">{platformIcons[link.platform] || '🌐'}</span>
                        <span className="text-sm font-medium text-gray-700 group-hover:text-rose-600">{link.platform}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-2"
            >
              <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
                <h2 className="text-2xl font-heading font-bold text-slate-900 mb-2">
                  {page?.form_title || 'Send Us a Message'}
                </h2>
                <p className="text-gray-600 mb-8">
                  {page?.form_subtitle || "We'll get back to you within 24 hours."}
                </p>

                {formSent ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-green-50 border border-green-200 rounded-xl p-8 text-center"
                  >
                    <div className="text-5xl mb-4">✉️</div>
                    <h3 className="text-xl font-bold text-green-800 mb-2">Message Sent!</h3>
                    <p className="text-green-600">Thank you for reaching out. We'll respond to you within 24 hours.</p>
                  </motion.div>
                ) : (
                  <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="Your name"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-nude focus:border-transparent outline-none transition"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address *</label>
                        <input
                          type="email"
                          required
                          placeholder="your@email.com"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-nude focus:border-transparent outline-none transition"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                        <input
                          type="tel"
                          placeholder="+233 XX XXX XXXX"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-nude focus:border-transparent outline-none transition"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Subject</label>
                        <select
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-nude focus:border-transparent outline-none transition bg-white"
                        >
                          <option value="">Select a topic</option>
                          <option>Product Inquiry</option>
                          <option>Order Support</option>
                          <option>Styling Advice</option>
                          <option>Wholesale</option>
                          <option>Partnership</option>
                          <option>Other</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Message *</label>
                      <textarea
                        required
                        rows={5}
                        placeholder="Tell us how we can help..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-nude focus:border-transparent outline-none transition resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-4 bg-rose-500 text-white rounded-xl hover:bg-rose-600 transition font-bold text-lg shadow-lg hover:shadow-xl"
                    >
                      Send Message
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      {page?.map_embed_url && (
        <section className="pb-24">
          <div className="container-base">
            <div className="rounded-2xl overflow-hidden shadow-xl h-[400px]">
              <iframe
                src={page.map_embed_url}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Wiggle Location"
              />
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
