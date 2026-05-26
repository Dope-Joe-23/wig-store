import { useState, useEffect, useRef, useCallback } from 'react'
import { AdminLayout } from '@components/admin/AdminLayout'
import { apiClient } from '@services/api'
import { 
  heroSlidesApi, featuredItemsApi, testimonialsApi,
  aboutPageApi, contactPageApi,
  type HeroSlide, type FeaturedItem, type Testimonial,
  type AboutPageData, type ContactPageData,
} from '@services/customization'
import { blogApi, type BlogPost } from '@services/blog'
import { videosApi, type VideoContent } from '@services/videos'
import { getImageUrl, getApiErrorMessage, getVideoFallbackThumbnail, getYouTubeId, getYouTubeThumbnailUrl } from '@utils/helpers'
import { productService } from '@services/products'
import type { Product } from '../../types'
import { CloseIcon } from '@components/Icons'

type Tab = 'hero' | 'featured' | 'testimonials' | 'blog' | 'videos'

interface FormState {
  saving: boolean
  error: string | null
  success: string | null
}

function HeroSlideForm({ slide, onSaved, onCancel }: { slide?: HeroSlide | null; onSaved: () => void; onCancel: () => void }) {
  const [form, setForm] = useState({
    title: slide?.title || 'Elegance Redefined',
    subtitle: slide?.subtitle || '',
    tagline: slide?.tagline || 'Premium Luxury Wigs',
    cta_text: slide?.cta_text || 'Explore Collection',
    cta_link: slide?.cta_link || '/products',
    secondary_cta_text: slide?.secondary_cta_text || 'Watch Our Story',
    secondary_cta_link: slide?.secondary_cta_link || '/about',
    media_type: slide?.media_type || 'image',
    media_url: slide?.media_url || '',
    is_active: slide?.is_active ?? true,
    order: slide?.order ?? 0,
  })
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(slide?.media_url_display || null)
  const [state, setState] = useState<FormState>({ saving: false, error: null, success: null })
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) {
      setFile(f)
      setPreview(URL.createObjectURL(f))
      setForm(prev => ({ ...prev, media_url: '' }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setState({ saving: true, error: null, success: null })
    try {
      const fd = new FormData()
      fd.append('title', form.title)
      fd.append('subtitle', form.subtitle)
      fd.append('tagline', form.tagline)
      fd.append('cta_text', form.cta_text)
      fd.append('cta_link', form.cta_link)
      fd.append('secondary_cta_text', form.secondary_cta_text)
      fd.append('secondary_cta_link', form.secondary_cta_link)
      fd.append('media_type', form.media_type)
      fd.append('is_active', String(form.is_active))
      fd.append('order', String(form.order))
      if (file) {
        fd.append('media_file', file)
      } else if (form.media_url) {
        fd.append('media_url', form.media_url)
      }
      if (slide) {
        await heroSlidesApi.update(slide.id, fd)
      } else {
        await heroSlidesApi.create(fd)
      }
      setState({ saving: false, error: null, success: 'Saved successfully!' })
      setTimeout(onSaved, 1000)
    } catch (err: any) {
      setState({ saving: false, error: getApiErrorMessage(err), success: null })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {state.error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{state.error}</div>}
      {state.success && <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">{state.success}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
          <input type="text" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-nude focus:border-transparent outline-none" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Tagline</label>
          <input type="text" value={form.tagline} onChange={e => setForm(p => ({ ...p, tagline: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-nude focus:border-transparent outline-none" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Subtitle</label>
        <textarea value={form.subtitle} onChange={e => setForm(p => ({ ...p, subtitle: e.target.value }))} rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-nude focus:border-transparent outline-none" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">CTA Text</label>
          <input type="text" value={form.cta_text} onChange={e => setForm(p => ({ ...p, cta_text: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-nude focus:border-transparent outline-none" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">CTA Link</label>
          <input type="text" value={form.cta_link} onChange={e => setForm(p => ({ ...p, cta_link: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-nude focus:border-transparent outline-none" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Background Media Type</label>
        <div className="flex gap-4">
          <label className={`flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer transition ${form.media_type === 'image' ? 'border-rose-nude bg-rose-nude/10 text-rose-nude' : 'border-gray-300 hover:border-gray-400'}`}>
            <input type="radio" name="media_type" value="image" checked={form.media_type === 'image'} onChange={e => setForm(p => ({ ...p, media_type: e.target.value as 'image' | 'video' }))} className="sr-only" />
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            Image Banner
          </label>
          <label className={`flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer transition ${form.media_type === 'video' ? 'border-rose-nude bg-rose-nude/10 text-rose-nude' : 'border-gray-300 hover:border-gray-400'}`}>
            <input type="radio" name="media_type" value="video" checked={form.media_type === 'video'} onChange={e => setForm(p => ({ ...p, media_type: e.target.value as 'image' | 'video' }))} className="sr-only" />
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
            Video Background
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Upload {form.media_type === 'video' ? 'Video' : 'Image'} <span className="text-gray-400 font-normal">(from your device)</span>
        </label>
        <div className="flex items-center gap-4">
          <button type="button" onClick={() => fileRef.current?.click()}
            className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition text-sm font-medium">
            Choose File
          </button>
          <input ref={fileRef} type="file" accept={form.media_type === 'video' ? 'video/*' : 'image/*'} onChange={handleFileChange} className="hidden" />
          {file && <span className="text-sm text-gray-600">{file.name} ({(file.size / 1024 / 1024).toFixed(1)} MB)</span>}
          {file && file.size > 10 * 1024 * 1024 && (
            <p className="mt-1 text-xs text-amber-600 flex items-center gap-1">
              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
              Large file detected. For videos over 10 MB, consider hosting on <strong>YouTube or Vimeo</strong> and using the external URL field below instead.
            </p>
          )}
        </div>
        {preview && form.media_type === 'image' && (
          <div className="mt-3 relative inline-block">
            <img src={preview} alt="Preview" className="h-32 w-48 object-cover rounded-lg border" />
            <button type="button" onClick={() => { setFile(null); setPreview(null) }}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5"><CloseIcon className="w-4 h-4" /></button>
          </div>
        )}
        {preview && form.media_type === 'video' && (
          <div className="mt-3 relative inline-block">
            <video src={preview} className="h-32 w-48 object-cover rounded-lg border" controls />
            <button type="button" onClick={() => { setFile(null); setPreview(null) }}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5"><CloseIcon className="w-4 h-4" /></button>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Or External URL <span className="text-gray-400 font-normal">(optional, if not uploading a file)</span>
        </label>
        <input type="url" value={form.media_url} onChange={e => setForm(p => ({ ...p, media_url: e.target.value }))} placeholder="https://example.com/image.jpg"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-nude focus:border-transparent outline-none" />
      </div>

      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.is_active} onChange={e => setForm(p => ({ ...p, is_active: e.target.checked }))}
            className="w-4 h-4 rounded border-gray-300 text-rose-nude focus:ring-rose-nude" />
          <span className="text-sm font-medium text-gray-700">Active</span>
        </label>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Order:</label>
          <input type="number" value={form.order} onChange={e => setForm(p => ({ ...p, order: parseInt(e.target.value) || 0 }))} min={0}
            className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-nude focus:border-transparent outline-none text-sm" />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={state.saving}
          className="px-6 py-2.5 bg-rose-nude text-white rounded-lg hover:bg-rose-nude/90 font-semibold transition disabled:opacity-50">
          {state.saving ? 'Saving...' : slide ? 'Update Slide' : 'Create Slide'}
        </button>
        <button type="button" onClick={onCancel}
          className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition">
          Cancel
        </button>
      </div>
    </form>
  )
}

function TestimonialForm({ testimonial, onSaved, onCancel }: { testimonial?: Testimonial | null; onSaved: () => void; onCancel: () => void }) {
  const [form, setForm] = useState({
    name: testimonial?.name || '',
    title: testimonial?.title || '',
    quote: testimonial?.quote || '',
    rating: testimonial?.rating || 5,
    media_type: testimonial?.media_type || 'image',
    media_url: testimonial?.media_url || '',
    is_active: testimonial?.is_active ?? true,
    order: testimonial?.order ?? 0,
  })
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(testimonial?.media_url_display || null)
  const [state, setState] = useState<FormState>({ saving: false, error: null, success: null })
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) {
      setFile(f)
      setPreview(URL.createObjectURL(f))
      setForm(prev => ({ ...prev, media_url: '' }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setState({ saving: true, error: null, success: null })
    try {
      const fd = new FormData()
      fd.append('name', form.name)
      fd.append('title', form.title)
      fd.append('quote', form.quote)
      fd.append('rating', String(form.rating))
      fd.append('media_type', form.media_type)
      fd.append('is_active', String(form.is_active))
      fd.append('order', String(form.order))
      if (file) {
        fd.append('media_file', file)
      } else if (form.media_url) {
        fd.append('media_url', form.media_url)
      }
      if (testimonial) {
        await testimonialsApi.update(testimonial.id, fd)
      } else {
        await testimonialsApi.create(fd)
      }
      setState({ saving: false, error: null, success: 'Saved successfully!' })
      setTimeout(onSaved, 1000)
    } catch (err: any) {
      setState({ saving: false, error: getApiErrorMessage(err), success: null })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {state.error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{state.error}</div>}
      {state.success && <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">{state.success}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Customer Name</label>
          <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-nude focus:border-transparent outline-none" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Title/Role <span className="text-gray-400 font-normal">(e.g., "Fashion Influencer")</span></label>
          <input type="text" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-nude focus:border-transparent outline-none" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Quote</label>
        <textarea value={form.quote} onChange={e => setForm(p => ({ ...p, quote: e.target.value }))} rows={3} required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-nude focus:border-transparent outline-none" />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Rating</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map(star => (
            <button key={star} type="button" onClick={() => setForm(p => ({ ...p, rating: star }))}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition ${star <= form.rating ? 'bg-yellow-400 text-white' : 'bg-gray-200 text-gray-400'}`}>
              ★
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Media Type</label>
        <div className="flex gap-4">
          <label className={`flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer transition ${form.media_type === 'image' ? 'border-rose-nude bg-rose-nude/10 text-rose-nude' : 'border-gray-300 hover:border-gray-400'}`}>
            <input type="radio" name="test_media_type" value="image" checked={form.media_type === 'image'} onChange={e => setForm(p => ({ ...p, media_type: e.target.value as 'image' | 'video' }))} className="sr-only" />
            Photo
          </label>
          <label className={`flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer transition ${form.media_type === 'video' ? 'border-rose-nude bg-rose-nude/10 text-rose-nude' : 'border-gray-300 hover:border-gray-400'}`}>
            <input type="radio" name="test_media_type" value="video" checked={form.media_type === 'video'} onChange={e => setForm(p => ({ ...p, media_type: e.target.value as 'image' | 'video' }))} className="sr-only" />
            Video
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Upload {form.media_type === 'video' ? 'Video' : 'Photo'} <span className="text-gray-400 font-normal">(from your device)</span>
        </label>
        <div className="flex items-center gap-4">
          <button type="button" onClick={() => fileRef.current?.click()}
            className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition text-sm font-medium">
            Choose File
          </button>
          <input ref={fileRef} type="file" accept={form.media_type === 'video' ? 'video/*' : 'image/*'} onChange={handleFileChange} className="hidden" />
          {file && <span className="text-sm text-gray-600">{file.name} ({(file.size / 1024 / 1024).toFixed(1)} MB)</span>}
          {file && file.size > 10 * 1024 * 1024 && (
            <p className="mt-1 text-xs text-amber-600 flex items-center gap-1">
              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
              Large file detected. For videos over 10 MB, consider hosting on <strong>YouTube or Vimeo</strong> and using the external URL field below instead.
            </p>
          )}
        </div>
        {preview && form.media_type === 'image' && (
          <div className="mt-3 relative inline-block">
            <img src={preview} alt="Preview" className="h-32 w-32 object-cover rounded-lg border" />
            <button type="button" onClick={() => { setFile(null); setPreview(null) }}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5"><CloseIcon className="w-4 h-4" /></button>
          </div>
        )}
        {preview && form.media_type === 'video' && (
          <div className="mt-3 relative inline-block">
            <video src={preview} className="h-32 w-48 object-cover rounded-lg border" controls />
            <button type="button" onClick={() => { setFile(null); setPreview(null) }}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5"><CloseIcon className="w-4 h-4" /></button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.is_active} onChange={e => setForm(p => ({ ...p, is_active: e.target.checked }))}
            className="w-4 h-4 rounded border-gray-300 text-rose-nude focus:ring-rose-nude" />
          <span className="text-sm font-medium text-gray-700">Active</span>
        </label>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Order:</label>
          <input type="number" value={form.order} onChange={e => setForm(p => ({ ...p, order: parseInt(e.target.value) || 0 }))} min={0}
            className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-nude focus:border-transparent outline-none text-sm" />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={state.saving}
          className="px-6 py-2.5 bg-rose-nude text-white rounded-lg hover:bg-rose-nude/90 font-semibold transition disabled:opacity-50">
          {state.saving ? 'Saving...' : testimonial ? 'Update Testimonial' : 'Create Testimonial'}
        </button>
        <button type="button" onClick={onCancel}
          className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition">
          Cancel
        </button>
      </div>
    </form>
  )
}

function AboutPageForm({ onSaved }: { onSaved: () => void }) {
  const [page, setPage] = useState<AboutPageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [form, setForm] = useState({
    title: 'About Wiggle',
    subtitle: '',
    story_title: 'Our Story',
    story_content: '',
    mission_title: 'Our Mission',
    mission_content: '',
  })
  const [storyImageFile, setStoryImageFile] = useState<File | null>(null)
  const [missionImageFile, setMissionImageFile] = useState<File | null>(null)
  const [storyImageUrl, setStoryImageUrl] = useState('')
  const [missionImageUrl, setMissionImageUrl] = useState('')
  const [storyPreview, setStoryPreview] = useState<string | null>(null)
  const [missionPreview, setMissionPreview] = useState<string | null>(null)
  const [valuesText, setValuesText] = useState('')
  const storyRef = useRef<HTMLInputElement>(null)
  const missionRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setLoading(true)
    aboutPageApi.list()
      .then(res => {
        const data = Array.isArray(res.data) ? res.data[0] : (res.data.results?.[0] || null)
        setPage(data)
        if (data) {
          setForm({
            title: data.title || 'About Wiggle',
            subtitle: data.subtitle || '',
            story_title: data.story_title || 'Our Story',
            story_content: data.story_content || '',
            mission_title: data.mission_title || 'Our Mission',
            mission_content: data.mission_content || '',
          })
          setStoryPreview(data.story_image_display || null)
          setMissionPreview(data.mission_image_display || null)
          setStoryImageUrl(data.story_image_url || '')
          setMissionImageUrl(data.mission_image_url || '')
          setValuesText(JSON.stringify(data.values || [{ title: '', description: '' }], null, 2))
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [reloadKey])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      let parsedValues: { title: string; description: string }[] = []
      try { parsedValues = JSON.parse(valuesText) } catch {}

      const fd = new FormData()
      fd.append('title', form.title)
      fd.append('subtitle', form.subtitle)
      fd.append('story_title', form.story_title)
      fd.append('story_content', form.story_content)
      fd.append('mission_title', form.mission_title)
      fd.append('mission_content', form.mission_content)
      fd.append('values', JSON.stringify(parsedValues))
      if (storyImageFile) {
        fd.append('story_image', storyImageFile)
      } else if (storyImageUrl) {
        fd.append('story_image_url', storyImageUrl)
      }
      if (missionImageFile) {
        fd.append('mission_image', missionImageFile)
      } else if (missionImageUrl) {
        fd.append('mission_image_url', missionImageUrl)
      }

      if (page) {
        await aboutPageApi.update(page.id, fd)
      } else {
        await aboutPageApi.create(fd)
      }
      setSuccess('About page saved successfully!')
      setReloadKey(k => k + 1) // Trigger re-fetch
      setTimeout(() => {
        setSuccess(null)
        onSaved()
      }, 1000)
    } catch (err: any) {
      setError(getApiErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="text-center py-12 text-gray-600">Loading...</div>

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-lg shadow p-6">
      {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}
      {success && <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">{success}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Page Title</label>
          <input type="text" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-nude focus:border-transparent outline-none" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Page Subtitle</label>
          <input type="text" value={form.subtitle} onChange={e => setForm(p => ({ ...p, subtitle: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-nude focus:border-transparent outline-none" />
        </div>
      </div>

      <hr className="border-gray-200" />
      <h4 className="font-bold text-gray-900">Story Section</h4>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Story Title</label>
          <input type="text" value={form.story_title} onChange={e => setForm(p => ({ ...p, story_title: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-nude focus:border-transparent outline-none" />
        </div>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Story Image</label>
            <button type="button" onClick={() => storyRef.current?.click()}
              className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition text-sm font-medium">
              Choose File
            </button>
            <input ref={storyRef} type="file" accept="image/*" onChange={e => {
              const f = e.target.files?.[0]
              if (f) { setStoryImageFile(f); setStoryPreview(URL.createObjectURL(f)); setStoryImageUrl('') }
            }} className="hidden" />
            {storyImageFile && <span className="text-xs text-gray-500 ml-2">{storyImageFile.name}</span>}
          </div>
          {storyPreview && (
            <div className="relative w-20 h-20 flex-shrink-0">
              <img src={storyPreview} alt="" className="w-full h-full object-cover rounded-lg border" />
              <button type="button" onClick={() => { setStoryImageFile(null); setStoryPreview(null) }}
                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5"><CloseIcon className="w-3 h-3" /></button>
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Story Content</label>
        <textarea value={form.story_content} onChange={e => setForm(p => ({ ...p, story_content: e.target.value }))} rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-nude focus:border-transparent outline-none" />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Or External Story Image URL
        </label>
        <input type="url" value={storyImageUrl} onChange={e => { setStoryImageUrl(e.target.value); setStoryImageFile(null) }}
          placeholder="https://example.com/image.jpg"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-nude focus:border-transparent outline-none" />
      </div>

      <hr className="border-gray-200" />
      <h4 className="font-bold text-gray-900">Mission Section</h4>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Mission Title</label>
          <input type="text" value={form.mission_title} onChange={e => setForm(p => ({ ...p, mission_title: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-nude focus:border-transparent outline-none" />
        </div>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Mission Image</label>
            <button type="button" onClick={() => missionRef.current?.click()}
              className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition text-sm font-medium">
              Choose File
            </button>
            <input ref={missionRef} type="file" accept="image/*" onChange={e => {
              const f = e.target.files?.[0]
              if (f) { setMissionImageFile(f); setMissionPreview(URL.createObjectURL(f)); setMissionImageUrl('') }
            }} className="hidden" />
            {missionImageFile && <span className="text-xs text-gray-500 ml-2">{missionImageFile.name}</span>}
          </div>
          {missionPreview && (
            <div className="relative w-20 h-20 flex-shrink-0">
              <img src={missionPreview} alt="" className="w-full h-full object-cover rounded-lg border" />
              <button type="button" onClick={() => { setMissionImageFile(null); setMissionPreview(null) }}
                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5"><CloseIcon className="w-3 h-3" /></button>
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Mission Content</label>
        <textarea value={form.mission_content} onChange={e => setForm(p => ({ ...p, mission_content: e.target.value }))} rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-nude focus:border-transparent outline-none" />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Or External Mission Image URL
        </label>
        <input type="url" value={missionImageUrl} onChange={e => { setMissionImageUrl(e.target.value); setMissionImageFile(null) }}
          placeholder="https://example.com/image.jpg"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-nude focus:border-transparent outline-none" />
      </div>

      <hr className="border-gray-200" />
      <h4 className="font-bold text-gray-900">Core Values</h4>
      <p className="text-sm text-gray-500">Enter values as JSON array: [{'{'}&quot;title&quot;: &quot;...&quot;, &quot;description&quot;: &quot;...&quot;{'}'}]</p>
      <textarea value={valuesText} onChange={e => setValuesText(e.target.value)} rows={6}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-nude focus:border-transparent outline-none font-mono text-sm" />

      <button type="submit" disabled={saving}
        className="px-6 py-2.5 bg-rose-nude text-white rounded-lg hover:bg-rose-nude/90 font-semibold transition disabled:opacity-50">
        {saving ? 'Saving...' : 'Save About Page'}
      </button>
    </form>
  )
}

function ContactPageForm({ onSaved }: { onSaved: () => void }) {
  const [page, setPage] = useState<ContactPageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [form, setForm] = useState({
    title: 'Get in Touch',
    subtitle: '',
    email: '',
    phone: '',
    address: '',
    working_hours: '',
    form_title: 'Send Us a Message',
    form_subtitle: '',
    map_embed_url: '',
  })
  const [bannerFile, setBannerFile] = useState<File | null>(null)
  const [bannerUrl, setBannerUrl] = useState('')
  const [bannerPreview, setBannerPreview] = useState<string | null>(null)
  const [socialLinksText, setSocialLinksText] = useState('')
  const bannerRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setLoading(true)
    contactPageApi.list()
      .then(res => {
        const data = Array.isArray(res.data) ? res.data[0] : (res.data.results?.[0] || null)
        setPage(data)
        if (data) {
          setForm({
            title: data.title || 'Get in Touch',
            subtitle: data.subtitle || '',
            email: data.email || '',
            phone: data.phone || '',
            address: data.address || '',
            working_hours: data.working_hours || '',
            form_title: data.form_title || 'Send Us a Message',
            form_subtitle: data.form_subtitle || '',
            map_embed_url: data.map_embed_url || '',
          })
          setBannerPreview(data.banner_image_display || null)
          setBannerUrl(data.banner_image_url || '')
          setSocialLinksText(JSON.stringify(data.social_links || [{ platform: '', url: '' }], null, 2))
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [reloadKey])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      let parsedSocials: { platform: string; url: string }[] = []
      try { parsedSocials = JSON.parse(socialLinksText) } catch {}

      const fd = new FormData()
      fd.append('title', form.title)
      fd.append('subtitle', form.subtitle)
      fd.append('email', form.email)
      fd.append('phone', form.phone)
      fd.append('address', form.address)
      fd.append('working_hours', form.working_hours)
      fd.append('form_title', form.form_title)
      fd.append('form_subtitle', form.form_subtitle)
      fd.append('map_embed_url', form.map_embed_url)
      fd.append('social_links', JSON.stringify(parsedSocials))
      if (bannerFile) {
        fd.append('banner_image', bannerFile)
      } else if (bannerUrl) {
        fd.append('banner_image_url', bannerUrl)
      }

      if (page) {
        await contactPageApi.update(page.id, fd)
      } else {
        await contactPageApi.create(fd)
      }
      setSuccess('Contact page saved successfully!')
      setReloadKey(k => k + 1) // Trigger re-fetch
      setTimeout(() => {
        setSuccess(null)
        onSaved()
      }, 1000)
    } catch (err: any) {
      setError(getApiErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="text-center py-12 text-gray-600">Loading...</div>

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-lg shadow p-6">
      {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}
      {success && <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">{success}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Page Title</label>
          <input type="text" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-nude focus:border-transparent outline-none" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Page Subtitle</label>
          <input type="text" value={form.subtitle} onChange={e => setForm(p => ({ ...p, subtitle: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-nude focus:border-transparent outline-none" />
        </div>
      </div>

      <hr className="border-gray-200" />
      <h4 className="font-bold text-gray-900">Contact Information</h4>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
          <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-nude focus:border-transparent outline-none" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Phone</label>
          <input type="text" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-nude focus:border-transparent outline-none" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Address</label>
        <textarea value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-nude focus:border-transparent outline-none" />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Working Hours</label>
        <textarea value={form.working_hours} onChange={e => setForm(p => ({ ...p, working_hours: e.target.value }))} rows={3}
          placeholder="Mon-Fri: 9:00 AM - 6:00 PM&#10;Sat: 10:00 AM - 4:00 PM&#10;Sun: Closed"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-nude focus:border-transparent outline-none" />
      </div>

      <hr className="border-gray-200" />
      <h4 className="font-bold text-gray-900">Form Settings</h4>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Form Title</label>
          <input type="text" value={form.form_title} onChange={e => setForm(p => ({ ...p, form_title: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-nude focus:border-transparent outline-none" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Form Subtitle</label>
          <input type="text" value={form.form_subtitle} onChange={e => setForm(p => ({ ...p, form_subtitle: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-nude focus:border-transparent outline-none" />
        </div>
      </div>

      <hr className="border-gray-200" />
      <h4 className="font-bold text-gray-900">Banner Image</h4>

      <div className="flex items-center gap-4">
        <button type="button" onClick={() => bannerRef.current?.click()}
          className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition text-sm font-medium">
          Choose File
        </button>
        <input ref={bannerRef} type="file" accept="image/*" onChange={e => {
          const f = e.target.files?.[0]
          if (f) { setBannerFile(f); setBannerPreview(URL.createObjectURL(f)); setBannerUrl('') }
        }} className="hidden" />
        {bannerFile && <span className="text-xs text-gray-500">{bannerFile.name}</span>}
        {bannerPreview && (
          <div className="relative w-24 h-16">
            <img src={bannerPreview} alt="" className="w-full h-full object-cover rounded-lg border" />
            <button type="button" onClick={() => { setBannerFile(null); setBannerPreview(null) }}
              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5"><CloseIcon className="w-3 h-3" /></button>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Or External Banner Image URL</label>
        <input type="url" value={bannerUrl} onChange={e => { setBannerUrl(e.target.value); setBannerFile(null) }}
          placeholder="https://example.com/image.jpg"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-nude focus:border-transparent outline-none" />
      </div>

      <hr className="border-gray-200" />
      <h4 className="font-bold text-gray-900">Map Embed URL</h4>
      <p className="text-sm text-gray-500">Paste the iframe src URL from Google Maps embed.</p>
      <input type="url" value={form.map_embed_url} onChange={e => setForm(p => ({ ...p, map_embed_url: e.target.value }))}
        placeholder="https://www.google.com/maps/embed?pb=..."
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-nude focus:border-transparent outline-none" />

      <hr className="border-gray-200" />
      <h4 className="font-bold text-gray-900">Social Links</h4>
      <p className="text-sm text-gray-500">Enter as JSON array: [{'{'}&quot;platform&quot;: &quot;Instagram&quot;, &quot;url&quot;: &quot;...&quot;{'}'}]</p>
      <textarea value={socialLinksText} onChange={e => setSocialLinksText(e.target.value)} rows={4}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-nude focus:border-transparent outline-none font-mono text-sm" />

      <button type="submit" disabled={saving}
        className="px-6 py-2.5 bg-rose-nude text-white rounded-lg hover:bg-rose-nude/90 font-semibold transition disabled:opacity-50">
        {saving ? 'Saving...' : 'Save Contact Page'}
      </button>
    </form>
  )
}

function BlogForm({ post, onSaved, onCancel }: { post?: BlogPost | null; onSaved: () => void; onCancel: () => void }) {
  const [form, setForm] = useState({
    title: post?.title || '',
    excerpt: post?.excerpt || '',
    content: post?.content || '',
    author: post?.author || '',
    category: post?.category || 'general',
    cover_image_url: post?.cover_image_url || '',
    read_time: post?.read_time || '',
    external_link: post?.external_link || '',
    is_active: post?.is_active ?? true,
    is_featured: post?.is_featured ?? false,
    order: post?.order ?? 0,
  })
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(post?.cover_image_display || null)
  const [state, setState] = useState<FormState>({ saving: false, error: null, success: null })
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) {
      setFile(f)
      setPreview(URL.createObjectURL(f))
      setForm(prev => ({ ...prev, cover_image_url: '' }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setState({ saving: true, error: null, success: null })
    try {
      const fd = new FormData()
      fd.append('title', form.title)
      fd.append('excerpt', form.excerpt)
      fd.append('content', form.content)
      fd.append('author', form.author)
      fd.append('category', form.category)
      fd.append('read_time', form.read_time)
      fd.append('is_active', String(form.is_active))
      fd.append('is_featured', String(form.is_featured))
      fd.append('order', String(form.order))
      if (form.external_link) fd.append('external_link', form.external_link)
      if (file) {
        fd.append('cover_image_file', file)
      } else if (form.cover_image_url) {
        fd.append('cover_image_url', form.cover_image_url)
      }
      if (post) {
        await blogApi.update(post.id, fd)
      } else {
        await blogApi.create(fd)
      }
      setState({ saving: false, error: null, success: 'Saved successfully!' })
      setTimeout(onSaved, 1000)
    } catch (err: any) {
      setState({ saving: false, error: getApiErrorMessage(err), success: null })
    }
  }

  const categories = [
    { value: 'product', label: 'Product Spotlight' },
    { value: 'tips', label: 'Tips & Tricks' },
    { value: 'beauty', label: 'Beauty & Style' },
    { value: 'news', label: 'News & Updates' },
    { value: 'general', label: 'General' },
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {state.error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{state.error}</div>}
      {state.success && <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">{state.success}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
          <input type="text" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-nude focus:border-transparent outline-none" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Author</label>
          <input type="text" value={form.author} onChange={e => setForm(p => ({ ...p, author: e.target.value }))}
            placeholder="Wiggle Team"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-nude focus:border-transparent outline-none" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
          <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value as BlogPost['category'] }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-nude focus:border-transparent outline-none">
            {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Read Time</label>
          <input type="text" value={form.read_time} onChange={e => setForm(p => ({ ...p, read_time: e.target.value }))}
            placeholder="5 min read"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-nude focus:border-transparent outline-none" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">External Link</label>
          <input type="url" value={form.external_link} onChange={e => setForm(p => ({ ...p, external_link: e.target.value }))}
            placeholder="https://..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-nude focus:border-transparent outline-none" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Excerpt <span className="text-gray-400 font-normal">(short snippet shown on homepage)</span></label>
        <textarea value={form.excerpt} onChange={e => setForm(p => ({ ...p, excerpt: e.target.value }))} rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-nude focus:border-transparent outline-none" />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Content <span className="text-gray-400 font-normal">(full article body)</span></label>
        <textarea value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} rows={8}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-nude focus:border-transparent outline-none font-mono text-sm" />
      </div>

      <hr className="border-gray-200" />
      <h4 className="font-bold text-gray-900">Cover Image</h4>

      <div className="flex items-center gap-4">
        <button type="button" onClick={() => fileRef.current?.click()}
          className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition text-sm font-medium">
          Choose File
        </button>
        <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
        {file && <span className="text-sm text-gray-600">{file.name}</span>}
      </div>
      {preview && (
        <div className="mt-3 relative inline-block">
          <img src={preview} alt="Preview" className="h-32 w-48 object-cover rounded-lg border" />
          <button type="button" onClick={() => { setFile(null); setPreview(null) }}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5"><CloseIcon className="w-4 h-4" /></button>
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Or External Cover Image URL</label>
        <input type="url" value={form.cover_image_url} onChange={e => { setForm(p => ({ ...p, cover_image_url: e.target.value })); setFile(null); }}
          placeholder="https://example.com/image.jpg"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-nude focus:border-transparent outline-none" />
      </div>

      <hr className="border-gray-200" />

      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.is_active} onChange={e => setForm(p => ({ ...p, is_active: e.target.checked }))}
            className="w-4 h-4 rounded border-gray-300 text-rose-nude focus:ring-rose-nude" />
          <span className="text-sm font-medium text-gray-700">Active</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.is_featured} onChange={e => setForm(p => ({ ...p, is_featured: e.target.checked }))}
            className="w-4 h-4 rounded border-gray-300 text-yellow-400 focus:ring-yellow-400" />
          <span className="text-sm font-medium text-gray-700">Featured</span>
        </label>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Order:</label>
          <input type="number" value={form.order} onChange={e => setForm(p => ({ ...p, order: parseInt(e.target.value) || 0 }))} min={0}
            className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-nude focus:border-transparent outline-none text-sm" />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={state.saving}
          className="px-6 py-2.5 bg-rose-nude text-white rounded-lg hover:bg-rose-nude/90 font-semibold transition disabled:opacity-50">
          {state.saving ? 'Saving...' : post ? 'Update Post' : 'Create Post'}
        </button>
        <button type="button" onClick={onCancel}
          className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition">
          Cancel
        </button>
      </div>
    </form>
  )
}

function VideoForm({ video, onSaved, onCancel }: { video?: VideoContent | null; onSaved: () => void; onCancel: () => void }) {
  const [form, setForm] = useState({
    title: video?.title || '',
    description: video?.description || '',
    category: video?.category || 'general',
    video_url: video?.video_url || '',
    thumbnail_url: video?.thumbnail_url || '',
    duration: video?.duration || '',
    is_active: video?.is_active ?? true,
    order: video?.order ?? 0,
  })
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [videoPreview, setVideoPreview] = useState<string | null>(video?.video_url_display || null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(video?.thumbnail_url_display || null)
  const [state, setState] = useState<FormState>({ saving: false, error: null, success: null })
  const videoRef = useRef<HTMLInputElement>(null)
  const thumbRef = useRef<HTMLInputElement>(null)
  const [showThumbnailSection, setShowThumbnailSection] = useState(!!video?.thumbnail_url_display)
  const [thumbnailCleared, setThumbnailCleared] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setState({ saving: true, error: null, success: null })
    try {
      const fd = new FormData()
      fd.append('title', form.title)
      fd.append('description', form.description)
      fd.append('category', form.category)
      fd.append('duration', form.duration)
      fd.append('is_active', String(form.is_active))
      fd.append('order', String(form.order))
      if (videoFile) {
        fd.append('video_file', videoFile)
      } else if (form.video_url) {
        fd.append('video_url', form.video_url)
      }
      if (thumbnailFile) {
        fd.append('thumbnail_file', thumbnailFile)
      } else if (form.thumbnail_url) {
        fd.append('thumbnail_url', form.thumbnail_url)
      } else if (thumbnailCleared) {
        // Explicitly signal the backend to clear both thumbnail fields
        fd.append('thumbnail_clear', 'true')
      }
      if (video) {
        await videosApi.update(video.id, fd)
      } else {
        await videosApi.create(fd)
      }
      setState({ saving: false, error: null, success: 'Saved successfully!' })
      setTimeout(onSaved, 1000)
    } catch (err: any) {
      setState({ saving: false, error: getApiErrorMessage(err), success: null })
    }
  }

  const categories = [
    { value: 'how_to_use', label: 'How to Use' },
    { value: 'care_tips', label: 'Care Tips' },
    { value: 'styling', label: 'Styling Guide' },
    { value: 'product_review', label: 'Product Review' },
    { value: 'general', label: 'General' },
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {state.error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{state.error}</div>}
      {state.success && <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">{state.success}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
          <input type="text" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-nude focus:border-transparent outline-none" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
          <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value as VideoContent['category'] }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-nude focus:border-transparent outline-none">
            {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Duration</label>
          <input type="text" value={form.duration} onChange={e => setForm(p => ({ ...p, duration: e.target.value }))}
            placeholder="3:45"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-nude focus:border-transparent outline-none" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
        <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-nude focus:border-transparent outline-none" />
      </div>

      <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>💡 Tip:</strong> Thumbnail is optional. For YouTube videos, thumbnail is auto-generated from the video ID.
        </p>
      </div>

      <hr className="border-gray-200" />
      <h4 className="font-bold text-gray-900">📹 Video Source</h4>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Upload Video File</label>
          <div className="flex items-center gap-4">
            <button type="button" onClick={() => videoRef.current?.click()}
              className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition text-sm font-medium">
              Choose Video File
            </button>
            <input ref={videoRef} type="file" accept="video/*" onChange={e => {
              const f = e.target.files?.[0]
              if (f) { setVideoFile(f); setVideoPreview(URL.createObjectURL(f)); setForm(p => ({ ...p, video_url: '' })) }
            }} className="hidden" />
            {videoFile ? (
              <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {videoFile.name} ({(videoFile.size / 1024 / 1024).toFixed(1)} MB)
              </span>
            ) : (
              <span className="text-sm text-gray-500">(no file selected)</span>
            )}
          </div>
          {videoFile && videoFile.size > 10 * 1024 * 1024 && (
            <p className="mt-1 text-xs text-amber-600 flex items-center gap-1">
              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
              Large file detected. For videos over 10 MB, consider hosting on <strong>YouTube or Vimeo</strong> and using the external URL field below instead.
            </p>
          )}
        </div>
        {videoPreview && (
          <div className="mt-3 relative inline-block">
            <video src={videoPreview} className="h-32 w-48 object-cover rounded-lg border border-green-300 bg-black" controls />
            <button type="button" onClick={() => { setVideoFile(null); setVideoPreview(null); setForm(p => ({ ...p, video_url: '' })) }}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"><CloseIcon className="w-4 h-4" /></button>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Or External Video URL <span className="text-gray-400 font-normal">(YouTube, Vimeo, etc.)</span></label>
        <input type="url" value={form.video_url} onChange={e => { setForm(p => ({ ...p, video_url: e.target.value })); if (videoFile) setVideoFile(null) }}
          placeholder="https://youtube.com/watch?v=..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-nude focus:border-transparent outline-none" />
        {form.video_url && !videoFile && (
          <p className="mt-1 text-xs text-green-600 flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            External URL set
          </p>
        )}
      </div>

      <hr className="border-gray-200" />
      <div>
        <button
          type="button"
          onClick={() => setShowThumbnailSection(!showThumbnailSection)}
          className="flex items-center gap-2 text-gray-700 font-semibold hover:text-rose-nude transition"
        >
          <svg className={`w-5 h-5 transition-transform ${showThumbnailSection ? 'rotate-90' : ''}`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
          🖼️ Thumbnail (Optional)
        </button>
      </div>

      {showThumbnailSection && (
        <div className="space-y-3 pl-4 border-l-2 border-gray-200">
          <p className="text-xs text-gray-600">
            💡 <strong>Auto-generated for YouTube:</strong> Leave blank, and YouTube thumbnail will be fetched automatically.
          </p>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Upload Custom Thumbnail</label>
            <div className="flex items-center gap-4">
              <button type="button" onClick={() => thumbRef.current?.click()}
                className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition text-sm font-medium">
                Choose Image
              </button>
              <input ref={thumbRef} type="file" accept="image/*" onChange={e => {
                const f = e.target.files?.[0]
                if (f) { setThumbnailFile(f); setThumbnailPreview(URL.createObjectURL(f)); setForm(p => ({ ...p, thumbnail_url: '' })) }
              }} className="hidden" />
              {thumbnailFile ? (
                <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {thumbnailFile.name}
                </span>
              ) : (
                <span className="text-sm text-gray-500">(no file selected)</span>
              )}
            </div>
          </div>
          {thumbnailPreview && (
            <div className="mt-3 relative inline-block">
              <img src={thumbnailPreview} alt="Thumbnail preview" className="h-32 w-48 object-cover rounded-lg border border-green-300" />
              <button type="button" onClick={() => { setThumbnailFile(null); setThumbnailPreview(null); setForm(p => ({ ...p, thumbnail_url: '' })); setThumbnailCleared(true) }}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"><CloseIcon className="w-4 h-4" /></button>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Or External Thumbnail URL</label>
            <input type="url" value={form.thumbnail_url} onChange={e => { setForm(p => ({ ...p, thumbnail_url: e.target.value })); if (thumbnailFile) setThumbnailFile(null) }}
              placeholder="https://example.com/thumbnail.jpg"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-nude focus:border-transparent outline-none" />
            {form.thumbnail_url && !thumbnailFile && (
              <p className="mt-1 text-xs text-green-600 flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                External URL set
              </p>
            )}
          </div>
        </div>
      )}

      <hr className="border-gray-200" />

      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.is_active} onChange={e => setForm(p => ({ ...p, is_active: e.target.checked }))}
            className="w-4 h-4 rounded border-gray-300 text-rose-nude focus:ring-rose-nude" />
          <span className="text-sm font-medium text-gray-700">Active</span>
        </label>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Order:</label>
          <input type="number" value={form.order} onChange={e => setForm(p => ({ ...p, order: parseInt(e.target.value) || 0 }))} min={0}
            className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-nude focus:border-transparent outline-none text-sm" />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={state.saving}
          className="px-6 py-2.5 bg-rose-nude text-white rounded-lg hover:bg-rose-nude/90 font-semibold transition disabled:opacity-50">
          {state.saving ? 'Saving...' : video ? 'Update Video' : 'Create Video'}
        </button>
        <button type="button" onClick={onCancel}
          className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition">
          Cancel
        </button>
      </div>
    </form>
  )
}

export function AdminCustomizationPage() {
  const [pageSection, setPageSection] = useState<'home' | 'about' | 'contact'>('home')
  const [activeTab, setActiveTab] = useState<Tab>('hero')
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([])
  const [featuredItems, setFeaturedItems] = useState<FeaturedItem[]>([])
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([])
  const [videos, setVideos] = useState<VideoContent[]>([])
  const [loading, setLoading] = useState(true)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [showForm, setShowForm] = useState(false)
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [productSearch, setProductSearch] = useState('')
  const [featuredAdding, setFeaturedAdding] = useState<number | null>(null)
  const [deleting, setDeleting] = useState<number | null>(null)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [productPage, setProductPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const [savingOrder, setSavingOrder] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      if (activeTab === 'hero') {
        const res = await heroSlidesApi.list()
        setHeroSlides((Array.isArray(res.data) ? res.data : res.data.results || []).sort((a: HeroSlide, b: HeroSlide) => a.order - b.order))
      } else if (activeTab === 'featured') {
        const [featRes] = await Promise.all([
          featuredItemsApi.list(),
        ])
        setFeaturedItems((Array.isArray(featRes.data) ? featRes.data : featRes.data.results || []).sort((a: FeaturedItem, b: FeaturedItem) => a.order - b.order))
        // Load first page of products
        const prodRes = await productService.getProducts({ page: 1, page_size: 12 })
        const prodData = Array.isArray(prodRes.data) ? prodRes.data : prodRes.data.results || []
        setAllProducts(prodData)
        setProductPage(1)
        setHasMore(!!(Array.isArray(prodRes.data) ? false : prodRes.data.next))
      } else if (activeTab === 'testimonials') {
        const res = await testimonialsApi.list()
        setTestimonials((Array.isArray(res.data) ? res.data : res.data.results || []).sort((a: Testimonial, b: Testimonial) => a.order - b.order))
      } else if (activeTab === 'blog') {
        const res = await blogApi.list()
        setBlogPosts((Array.isArray(res.data) ? res.data : res.data.results || []).sort((a: BlogPost, b: BlogPost) => a.order - b.order))
      } else if (activeTab === 'videos') {
        const res = await videosApi.list()
        setVideos((Array.isArray(res.data) ? res.data : res.data.results || []).sort((a: VideoContent, b: VideoContent) => a.order - b.order))
      }
    } catch (err) {
      console.error('Failed to fetch data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setShowForm(false)
    setEditingItem(null)
    setDragIndex(null)
    setDragOverIndex(null)
    fetchData()
  }, [activeTab])

  // Load more products for the featured grid
  const loadMoreProducts = useCallback(async () => {
    if (loadingMore || !hasMore) return
    setLoadingMore(true)
    try {
      const nextPage = productPage + 1
      const res = await productService.getProducts({ page: nextPage, page_size: 12 })
      const newData = Array.isArray(res.data) ? res.data : res.data.results || []
      if (newData.length > 0) {
        setAllProducts(prev => [...prev, ...newData])
        setProductPage(nextPage)
        setHasMore(!!(Array.isArray(res.data) ? false : res.data.next))
      } else {
        setHasMore(false)
      }
    } catch (err) {
      console.error('Failed to load more products:', err)
    } finally {
      setLoadingMore(false)
    }
  }, [loadingMore, hasMore, productPage])

  // IntersectionObserver for infinite scroll
  useEffect(() => {
    if (!loadMoreRef.current) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreProducts()
        }
      },
      { threshold: 0.1 }
    )
    observer.observe(loadMoreRef.current)
    return () => observer.disconnect()
  }, [loadMoreProducts])

  // Set of product IDs that are currently featured for quick lookup
  const featuredProductIds = new Set(featuredItems.map(f => f.product).filter(Boolean))

  const handleAddFeatured = async (productId: number) => {
    setFeaturedAdding(productId)
    try {
      await apiClient.post('/customization/featured-items/', {
        product: productId,
        order: featuredItems.length,
        is_active: true,
      })
      await fetchData()
    } catch (err) {
      console.error('Failed to add featured item:', err)
    } finally {
      setFeaturedAdding(null)
    }
  }

  const handleRemoveFeatured = async (featuredId: number) => {
    setDeleting(featuredId)
    try {
      await featuredItemsApi.delete(featuredId)
      await fetchData()
    } catch (err) {
      console.error('Failed to remove featured item:', err)
    } finally {
      setDeleting(null)
    }
  }

  const handleDelete = async (id: number, api: any) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return
    setDeleting(id)
    try {
      await api.delete(id)
      fetchData()
    } catch (err) {
      console.error('Failed to delete:', err)
    } finally {
      setDeleting(null)
    }
  }

  const getCurrentItems = (): any[] => {
    if (activeTab === 'hero') return heroSlides
    if (activeTab === 'featured') return featuredItems
    if (activeTab === 'blog') return blogPosts
    if (activeTab === 'videos') return videos
    return testimonials
  }

  const setCurrentItems = (items: any[]) => {
    if (activeTab === 'hero') setHeroSlides(items)
    else if (activeTab === 'featured') setFeaturedItems(items)
    else if (activeTab === 'blog') setBlogPosts(items)
    else if (activeTab === 'videos') setVideos(items)
    else setTestimonials(items)
  }

  const getReorderApi = () => {
    if (activeTab === 'hero') return heroSlidesApi.reorder
    if (activeTab === 'featured') return featuredItemsApi.reorder
    if (activeTab === 'blog') return blogApi.reorder
    if (activeTab === 'videos') return videosApi.reorder
    return testimonialsApi.reorder
  }

  const handleDragStart = useCallback((index: number) => {
    setDragIndex(index)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverIndex(index)
  }, [])

  const handleDragLeave = useCallback(() => {
    setDragOverIndex(null)
  }, [])

  const handleDrop = useCallback(async (dropIndex: number) => {
    if (dragIndex === null || dragIndex === dropIndex) {
      setDragIndex(null)
      setDragOverIndex(null)
      return
    }

    const items = [...getCurrentItems()]
    const [movedItem] = items.splice(dragIndex, 1)
    items.splice(dropIndex, 0, movedItem)

    // Update local state immediately for snappy UX
    const reordered = items.map((item, idx) => ({ ...item, order: idx }))
    setCurrentItems(reordered)
    setDragIndex(null)
    setDragOverIndex(null)

    // Save to backend
    setSavingOrder(true)
    try {
      const reorder = getReorderApi()
      await reorder(items.map((item, idx) => ({ id: item.id, order: idx })))
    } catch (err) {
      console.error('Failed to save order:', err)
      fetchData() // Revert on error
    } finally {
      setSavingOrder(false)
    }
  }, [dragIndex, activeTab])

  const tabs = [
    { id: 'hero' as Tab, label: 'Hero Section', icon: '🎬' },
    { id: 'featured' as Tab, label: 'Featured Products', icon: '⭐' },
    { id: 'testimonials' as Tab, label: 'Reviews & Recommendations', icon: '💬' },
    { id: 'blog' as Tab, label: 'Blog Posts', icon: '📝' },
    { id: 'videos' as Tab, label: 'Video Library', icon: '🎥' },
  ]

  const renderCard = (item: any, index: number) => {
    const isDragging = dragIndex === index
    const isDragOver = dragOverIndex === index && dragIndex !== null

    const baseProps = {
      draggable: true,
      onDragStart: () => handleDragStart(index),
      onDragOver: (e: React.DragEvent) => handleDragOver(e, index),
      onDragLeave: handleDragLeave,
      onDrop: () => handleDrop(index),
      onDragEnd: () => { setDragIndex(null); setDragOverIndex(null) },
    }

    if (activeTab === 'hero') {
      const slide = item as HeroSlide
      return (
        <div
          key={slide.id}
          {...baseProps}
          className={`bg-white rounded-lg shadow p-4 flex items-start gap-4 transition-all duration-200 cursor-grab active:cursor-grabbing ${
            isDragging ? 'opacity-50 shadow-inner scale-[0.98]' : ''
          } ${
            isDragOver ? 'border-t-2 border-rose-nude shadow-md' : ''
          } hover:shadow-md`}
        >
          {/* Drag Handle */}
          <div className="flex flex-col items-center gap-1 pr-2 text-gray-400">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M7 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/></svg>
          </div>

          <div className="w-24 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
            {slide.media_url_display ? (
              slide.media_type === 'video' ? (
                <video src={getImageUrl(slide.media_url_display)} className="w-full h-full object-cover" />
              ) : (
                <img src={getImageUrl(slide.media_url_display)} alt={slide.title} className="w-full h-full object-cover" />
              )
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No media</div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 truncate">{slide.title}</h4>
            <p className="text-sm text-gray-500 truncate">{slide.tagline}</p>
            <div className="flex items-center gap-3 mt-1">
              <span className={`text-xs px-2 py-0.5 rounded-full ${slide.media_type === 'video' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                {slide.media_type}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${slide.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                {slide.is_active ? 'Active' : 'Inactive'}
              </span>
              <span className="text-xs text-gray-400">Order: {slide.order}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={() => { setEditingItem(slide); setShowForm(true) }}
              className="p-2 text-gray-600 hover:text-rose-nude hover:bg-rose-nude/10 rounded-lg transition">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            </button>
            <button onClick={() => handleDelete(slide.id, heroSlidesApi)} disabled={deleting === slide.id}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
          </div>
        </div>
      )
    }

    if (activeTab === 'featured') {
      // Featured items are rendered directly in renderItemList, not via renderCard
      return null
    }

    if (activeTab === 'blog') {
      const post = item as BlogPost
      const categoryLabels: Record<string, string> = {
        product: 'Product Spotlight', tips: 'Tips & Tricks', beauty: 'Beauty & Style', news: 'News & Updates', general: 'General',
      }
      const categoryColors: Record<string, string> = {
        product: 'bg-blue-100 text-blue-700', tips: 'bg-green-100 text-green-700', beauty: 'bg-purple-100 text-purple-700', news: 'bg-orange-100 text-orange-700', general: 'bg-gray-100 text-gray-700',
      }
      return (
        <div
          key={post.id}
          {...baseProps}
          className={`bg-white rounded-lg shadow p-4 flex items-start gap-4 transition-all duration-200 cursor-grab active:cursor-grabbing ${
            isDragging ? 'opacity-50 shadow-inner scale-[0.98]' : ''
          } ${isDragOver ? 'border-t-2 border-rose-nude shadow-md' : ''} hover:shadow-md`}
        >
          <div className="flex flex-col items-center gap-1 pr-2 text-gray-400">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M7 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/></svg>
          </div>
          <div className="w-24 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
            {post.cover_image_display ? (
              <img src={getImageUrl(post.cover_image_display)} alt={post.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No cover</div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 truncate">{post.title}</h4>
            <p className="text-sm text-gray-500 truncate">{post.author ? `By ${post.author}` : ''}</p>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <span className={`text-xs px-2 py-0.5 rounded-full ${categoryColors[post.category] || categoryColors.general}`}>
                {categoryLabels[post.category] || post.category}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${post.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                {post.is_active ? 'Active' : 'Inactive'}
              </span>
              {post.is_featured && <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">Featured</span>}
              <span className="text-xs text-gray-400">Order: {post.order}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={() => { setEditingItem(post); setShowForm(true) }}
              className="p-2 text-gray-600 hover:text-rose-nude hover:bg-rose-nude/10 rounded-lg transition">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            </button>
            <button onClick={() => handleDelete(post.id, blogApi)} disabled={deleting === post.id}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
          </div>
        </div>
      )
    }

    if (activeTab === 'videos') {
      const video = item as VideoContent
      const categoryLabels: Record<string, string> = {
        how_to_use: 'How to Use', care_tips: 'Care Tips', styling: 'Styling Guide', product_review: 'Product Review', general: 'General',
      }
      const categoryColors: Record<string, string> = {
        how_to_use: 'bg-blue-100 text-blue-700', care_tips: 'bg-green-100 text-green-700', styling: 'bg-purple-100 text-purple-700', product_review: 'bg-orange-100 text-orange-700', general: 'bg-gray-100 text-gray-700',
      }
      return (
        <div
          key={video.id}
          {...baseProps}
          className={`bg-white rounded-lg shadow p-4 flex items-start gap-4 transition-all duration-200 cursor-grab active:cursor-grabbing ${
            isDragging ? 'opacity-50 shadow-inner scale-[0.98]' : ''
          } ${isDragOver ? 'border-t-2 border-rose-nude shadow-md' : ''} hover:shadow-md`}
        >
          <div className="flex flex-col items-center gap-1 pr-2 text-gray-400">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M7 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/></svg>
          </div>
          <div className="w-24 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
            {video.thumbnail_url_display ? (
              <img src={getImageUrl(video.thumbnail_url_display)} alt={video.title} className="w-full h-full object-cover" />
            ) : video.video_url_display ? (() => {
              const url = video.video_url_display!
              const fallback = getVideoFallbackThumbnail(url)

              if (fallback?.type === 'image') {
                return (
                  <img
                    src={fallback.url}
                    alt={video.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const ytId = getYouTubeId(url)
                      if (ytId) {
                        (e.target as HTMLImageElement).src = getYouTubeThumbnailUrl(ytId, 'hq')
                      }
                    }}
                  />
                )
              }

              if (fallback?.type === 'video') {
                return (
                  <video
                    src={fallback.url}
                    className="w-full h-full object-cover"
                    muted
                    playsInline
                    onMouseEnter={(e) => e.currentTarget.play().catch(() => {})}
                    onMouseLeave={(e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0 }}
                  />
                )
              }

              // Vimeo or unsupported URL: show play icon
              return (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                </div>
              )
            })() : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 truncate">{video.title}</h4>
            {video.duration && <p className="text-sm text-gray-500">{video.duration}</p>}
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <span className={`text-xs px-2 py-0.5 rounded-full ${categoryColors[video.category] || categoryColors.general}`}>
                {categoryLabels[video.category] || video.category}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${video.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                {video.is_active ? 'Active' : 'Inactive'}
              </span>
              <span className="text-xs text-gray-400">Order: {video.order}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={() => { setEditingItem(video); setShowForm(true) }}
              className="p-2 text-gray-600 hover:text-rose-nude hover:bg-rose-nude/10 rounded-lg transition">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            </button>
            <button onClick={() => handleDelete(video.id, videosApi)} disabled={deleting === video.id}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
          </div>
        </div>
      )
    }

    // Testimonials
    const testimonial = item as Testimonial
    return (
      <div
        key={testimonial.id}
        {...baseProps}
        className={`bg-white rounded-lg shadow p-4 flex items-start gap-4 transition-all duration-200 cursor-grab active:cursor-grabbing ${
          isDragging ? 'opacity-50 shadow-inner scale-[0.98]' : ''
        } ${
          isDragOver ? 'border-t-2 border-rose-nude shadow-md' : ''
        } hover:shadow-md`}
      >
        <div className="flex flex-col items-center gap-1 pr-2 text-gray-400">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M7 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/></svg>
        </div>

        <div className="w-16 h-16 flex-shrink-0 rounded-full overflow-hidden bg-gray-100">
          {testimonial.media_url_display && testimonial.media_type === 'image' ? (
            <img src={getImageUrl(testimonial.media_url_display)} alt={testimonial.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-lg">👤</div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
          {testimonial.title && <p className="text-sm text-gray-500">{testimonial.title}</p>}
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">"{testimonial.quote}"</p>
          <div className="flex items-center gap-3 mt-1">
            <div className="flex text-yellow-400 text-xs">{'★'.repeat(testimonial.rating)}{'☆'.repeat(5 - testimonial.rating)}</div>
            <span className={`text-xs px-2 py-0.5 rounded-full ${testimonial.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
              {testimonial.is_active ? 'Active' : 'Inactive'}
            </span>
            <span className="text-xs text-gray-400">Order: {testimonial.order}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={() => { setEditingItem(testimonial); setShowForm(true) }}
            className="p-2 text-gray-600 hover:text-rose-nude hover:bg-rose-nude/10 rounded-lg transition">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
          </button>
          <button onClick={() => handleDelete(testimonial.id, testimonialsApi)} disabled={deleting === testimonial.id}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        </div>
      </div>
    )
  }

  const filteredProducts = allProducts.filter(p =>
    !productSearch || p.name.toLowerCase().includes(productSearch.toLowerCase())
  )

  const renderItemList = () => {
    if (loading) return <div className="text-center py-12 text-gray-600">Loading...</div>

    if (activeTab === 'featured') {
      return (
        <div className="space-y-8">
          {/* Currently Featured */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>Currently Featured</span>
              <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{featuredItems.length}</span>
            </h3>
            {featuredItems.length === 0 ? (
              <p className="text-gray-500 text-sm py-4 text-center">No products featured yet. Select products from below to add them.</p>
            ) : (
              <>
                <div className="flex items-center justify-between mb-3 text-sm text-gray-500">
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M7 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/></svg>
                    Drag to reorder
                  </span>
                  {savingOrder && <span className="text-rose-nude font-medium animate-pulse">Saving order...</span>}
                </div>
                <div className="space-y-3">
                  {featuredItems.map((item, index) => (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragLeave={handleDragLeave}
                      onDrop={() => handleDrop(index)}
                      onDragEnd={() => { setDragIndex(null); setDragOverIndex(null) }}
                      className={`bg-gray-50 rounded-lg p-3 flex items-center gap-3 transition-all duration-200 cursor-grab active:cursor-grabbing ${
                        dragIndex === index ? 'opacity-50 shadow-inner scale-[0.98]' : ''
                      } ${dragOverIndex === index && dragIndex !== null ? 'border-t-2 border-rose-nude' : ''} hover:shadow-sm`}
                    >
                      <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path d="M7 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/></svg>
                      <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200">
                        {item.media_url_display ? (
                          <img src={getImageUrl(item.media_url_display)} alt={item.product_name || ''} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No img</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{item.product_name || item.title || 'Featured'}</p>
                        {item.product_price && <p className="text-sm text-rose-500 font-medium">GHS {item.product_price}</p>}
                        {item.badge_text && <span className="text-xs bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full">{item.badge_text}</span>}
                      </div>
                      <p className="text-xs text-gray-400">#{index + 1}</p>
                      <button
                        onClick={() => handleRemoveFeatured(item.id)}
                        disabled={deleting === item.id}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                        title="Remove from featured"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* All Products Grid */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">All Products</h3>
            <input
              type="text"
              value={productSearch}
              onChange={e => setProductSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-nude focus:border-transparent outline-none mb-4"
            />
            {filteredProducts.length === 0 ? (
              <p className="text-gray-500 text-sm py-4 text-center">No products found.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProducts.map(product => {
                  const isFeatured = featuredProductIds.has(product.id)
                  const featItem = featuredItems.find(f => f.product === product.id)
                  return (
                    <div
                      key={product.id}
                      className={`relative rounded-lg border-2 overflow-hidden transition-all ${
                        isFeatured
                          ? 'border-rose-nude bg-rose-nude/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="aspect-[4/3] bg-gray-100 overflow-hidden">
                        {(product as any).primary_image?.url ? (
                          <img
                            src={getImageUrl((product as any).primary_image.url)}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <p className="font-semibold text-gray-900 text-sm truncate">{product.name}</p>
                        <p className="text-rose-500 font-medium text-sm mt-0.5">GHS {product.price}</p>
                        <button
                          onClick={() => isFeatured ? handleRemoveFeatured(featItem!.id) : handleAddFeatured(product.id)}
                          disabled={featuredAdding === product.id || deleting === featItem?.id}
                          className={`mt-2 w-full py-1.5 rounded-lg text-sm font-semibold transition disabled:opacity-50 ${
                            isFeatured
                              ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                              : 'bg-rose-nude text-white hover:bg-rose-nude/90'
                          }`}
                        >
                          {featuredAdding === product.id || deleting === featItem?.id
                            ? '...'
                            : isFeatured
                              ? 'Remove'
                              : 'Add to Featured'
                          }
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
            {/* Infinite scroll sentinel */}
            {hasMore && filteredProducts.length >= 12 && (
              <div
                ref={loadMoreRef}
                className="flex justify-center py-6"
              >
                {loadingMore ? (
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Loading more products...
                  </div>
                ) : (
                  <span className="text-gray-400 text-sm">Scroll for more</span>
                )}
              </div>
            )}
          </div>
        </div>
      )
    }

    // Hero and Testimonials
    const items = getCurrentItems()

    if (items.length === 0) {
      return (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500 mb-4">No items yet. Click "Add New" to create one.</p>
        </div>
      )
    }

    return (
      <div>
        <div className="flex items-center justify-between mb-3 text-sm text-gray-500">
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M7 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/></svg>
            Drag items to reorder
          </span>
          {savingOrder && <span className="text-rose-nude font-medium animate-pulse">Saving order...</span>}
        </div>
        <div className="space-y-3">{items.map((item, index) => renderCard(item, index))}</div>
      </div>
    )
  }

  return (
    <AdminLayout activeTab="customization">
      <div className="space-y-6">
        {/* Top-Level Page Section Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
          {[
            { id: 'home' as const, label: '🏠 Home Page' },
            { id: 'about' as const, label: '📖 About Page' },
            { id: 'contact' as const, label: '📬 Contact Page' },
          ].map(section => (
            <button
              key={section.id}
              onClick={() => setPageSection(section.id)}
              className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold transition ${
                pageSection === section.id
                  ? 'bg-white text-rose-nude shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {section.label}
            </button>
          ))}
        </div>

        {pageSection === 'home' ? (
          <>
            {/* Sub-tabs for Home Page */}
            <div className="flex gap-1 border-b border-gray-200 pb-2 overflow-x-auto">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  title={tab.label}
                  className={`flex-shrink-0 px-3 py-2 rounded-t-lg text-sm font-semibold transition ${
                    activeTab === tab.id
                      ? 'bg-white text-rose-nude border-b-2 border-rose-nude'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-lg">{tab.icon}</span>
                </button>
              ))}
            </div>

            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-heading font-bold text-black-primary">
                  {tabs.find(t => t.id === activeTab)?.label}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {activeTab === 'hero' && 'Manage hero slides with image or video backgrounds. Upload files from your device. Drag to reorder.'}
                  {activeTab === 'featured' && 'Select products from below to feature on the homepage. Drag to reorder. The product\'s own image and data are used automatically.'}
                  {activeTab === 'testimonials' && 'Manage customer reviews and recommendations. Add photos or videos from your device. Drag to reorder.'}
                  {activeTab === 'blog' && 'Manage blog posts for the homepage. Write articles, add cover images, and organize by category. Drag to reorder.'}
                  {activeTab === 'videos' && 'Manage the video library. Upload video files or embed YouTube/Vimeo links with thumbnails. Drag to reorder.'}
                </p>
              </div>
              {activeTab === 'featured' ? (
                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-2 rounded-lg">
                  {featuredItems.length} featured
                </span>
              ) : (
                <button
                  onClick={() => { setEditingItem(null); setShowForm(true) }}
                  className="px-4 py-2 bg-rose-nude text-white rounded-lg hover:bg-rose-nude/90 font-semibold transition flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  Add New
                </button>
              )}
            </div>

            {/* Form Modal (hero and testimonials only) */}
            {showForm && activeTab !== 'featured' && (
              <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowForm(false)} />
                <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[80vh] overflow-y-auto p-6 z-10">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-black-primary">
                      {editingItem ? 'Edit' : 'Add New'} - {tabs.find(t => t.id === activeTab)?.label}
                    </h3>
                    <button onClick={() => setShowForm(false)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition">
                      <CloseIcon className="w-5 h-5" />
                    </button>
                  </div>
                  {activeTab === 'hero' && (
                    <HeroSlideForm slide={editingItem} onSaved={() => { setShowForm(false); setEditingItem(null); fetchData() }} onCancel={() => setShowForm(false)} />
                  )}
                  {activeTab === 'testimonials' && (
                    <TestimonialForm testimonial={editingItem} onSaved={() => { setShowForm(false); setEditingItem(null); fetchData() }} onCancel={() => setShowForm(false)} />
                  )}
                  {activeTab === 'blog' && (
                    <BlogForm post={editingItem} onSaved={() => { setShowForm(false); setEditingItem(null); fetchData() }} onCancel={() => setShowForm(false)} />
                  )}
                  {activeTab === 'videos' && (
                    <VideoForm video={editingItem} onSaved={() => { setShowForm(false); setEditingItem(null); fetchData() }} onCancel={() => setShowForm(false)} />
                  )}
                </div>
              </div>
            )}

            {/* Item List */}
            {renderItemList()}
          </>
        ) : pageSection === 'about' ? (
          <>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-heading font-bold text-black-primary">About Page</h2>
                <p className="text-sm text-gray-500 mt-1">Customize the content of your About page.</p>
              </div>
            </div>
            <AboutPageForm onSaved={() => {}} />
          </>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-heading font-bold text-black-primary">Contact Page</h2>
                <p className="text-sm text-gray-500 mt-1">Customize the content of your Contact page.</p>
              </div>
            </div>
            <ContactPageForm onSaved={() => {}} />
          </>
        )}
      </div>
    </AdminLayout>
  )
}
