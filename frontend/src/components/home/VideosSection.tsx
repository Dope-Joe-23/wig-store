import { motion } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import { videosApi, VideoContent } from '@services/videos'

const categoryIcons: Record<string, string> = {
  how_to_use: '📖',
  care_tips: '🧹',
  styling: '💇‍♀️',
  product_review: '⭐',
  general: '🎬',
}

const categoryLabels: Record<string, string> = {
  how_to_use: 'How to Use',
  care_tips: 'Care Tips',
  styling: 'Styling Guide',
  product_review: 'Product Review',
  general: 'General',
}

export default function VideosSection() {
  const [videos, setVideos] = useState<VideoContent[]>([])
  const [activeVideo, setActiveVideo] = useState<VideoContent | null>(null)
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const ref = useRef(null)

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await videosApi.list()
        const data = Array.isArray(res.data) ? res.data : res.data.results || []
        setVideos(data.filter((v: VideoContent) => v.is_active))
      } catch (err) {
        console.error('Failed to fetch videos:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchVideos()
  }, [])

  const categories = ['all', ...new Set(videos.map((v) => v.category))]
  const filteredVideos = activeCategory === 'all'
    ? videos
    : videos.filter((v) => v.category === activeCategory)

  const getEmbedUrl = (url: string | null | undefined) => {
    if (!url) return null
    // YouTube
    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/)
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`
    // Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
    if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`
    return url
  }

  return (
    <section ref={ref} className="py-24 bg-gradient-to-b from-cream to-white overflow-hidden">
      <div className="container-base">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <span className="text-rose-500 text-sm tracking-widest uppercase font-semibold">
            Video Library
          </span>
          <h2 className="text-5xl md:text-6xl font-heading font-bold text-slate-900 mt-4 mb-4">
            Learn & Get Inspired
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Watch tutorials, care tips, and styling guides to get the most out of your products.
          </p>
        </motion.div>

        {/* Category Filter */}
        {categories.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-wrap justify-center gap-3 mb-10"
          >
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                  activeCategory === cat
                    ? 'bg-rose-500 text-white shadow-lg shadow-rose-200'
                    : 'bg-white text-gray-700 hover:bg-rose-50 hover:text-rose-600 border border-gray-200'
                }`}
              >
                {cat === 'all' ? '🎥 All Videos' : `${categoryIcons[cat] || '🎬'} ${categoryLabels[cat] || cat}`}
              </button>
            ))}
          </motion.div>
        )}

        {/* Video Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin mx-auto" />
          </div>
        ) : filteredVideos.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-4xl mb-4">🎥</p>
            <p className="text-lg">No videos available yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredVideos.map((video, index) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer"
                onClick={() => setActiveVideo(video)}
              >
                {/* Thumbnail */}
                <div className="aspect-video bg-gray-100 relative overflow-hidden">
                  {video.thumbnail_url_display ? (
                    <img
                      src={video.thumbnail_url_display}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : video.video_url_display ? (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-rose-100 to-purple-100">
                      <span className="text-6xl">🎬</span>
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-rose-100 to-purple-100">
                      <span className="text-6xl">🎬</span>
                    </div>
                  )}
                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="w-16 h-16 bg-rose-500/90 rounded-full flex items-center justify-center shadow-xl"
                    >
                      <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </motion.div>
                  </div>
                  {/* Duration Badge */}
                  {video.duration && (
                    <span className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded-md">
                      {video.duration}
                    </span>
                  )}
                  {/* Category Badge */}
                  <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm">
                    {categoryIcons[video.category] || '🎬'} {categoryLabels[video.category] || video.category}
                  </span>
                </div>

                {/* Info */}
                <div className="p-5">
                  <h3 className="font-heading font-bold text-lg text-slate-900 mb-2 line-clamp-2 group-hover:text-rose-600 transition-colors">
                    {video.title}
                  </h3>
                  {video.description && (
                    <p className="text-gray-600 text-sm line-clamp-2">{video.description}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Video Player Modal */}
        {activeVideo && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setActiveVideo(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="relative w-full max-w-4xl bg-black rounded-2xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setActiveVideo(null)}
                className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Video Player */}
              <div className="aspect-video">
                {activeVideo.video_url_display ? (
                  <iframe
                    src={getEmbedUrl(activeVideo.video_url_display) || activeVideo.video_url_display}
                    title={activeVideo.title}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white">
                    <p className="text-lg">Video not available</p>
                  </div>
                )}
              </div>

              {/* Video Info */}
              <div className="bg-white p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-sm font-semibold text-rose-500 bg-rose-50 px-3 py-1 rounded-full">
                    {categoryIcons[activeVideo.category]} {categoryLabels[activeVideo.category] || activeVideo.category}
                  </span>
                  {activeVideo.duration && (
                    <span className="text-sm text-gray-500">⏱ {activeVideo.duration}</span>
                  )}
                </div>
                <h3 className="text-2xl font-heading font-bold text-slate-900 mb-2">{activeVideo.title}</h3>
                {activeVideo.description && (
                  <p className="text-gray-600">{activeVideo.description}</p>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </section>
  )
}
