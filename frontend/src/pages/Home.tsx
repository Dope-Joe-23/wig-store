import HeroSection from '@components/home/HeroSection'
import FeaturedSection from '@components/home/FeaturedSection'
import TestimonialsSection from '@components/home/TestimonialsSection'
import VideosSection from '@components/home/VideosSection'
import BlogSection from '@components/home/BlogSection'

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <HeroSection />
      <FeaturedSection />
      <TestimonialsSection />
      <VideosSection />
      <BlogSection />
    </div>
  )
}
