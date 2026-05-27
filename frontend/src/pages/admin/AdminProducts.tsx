import { useState, useEffect } from 'react'
import { AdminLayout } from '@components/admin/AdminLayout'
import { apiClient } from '@services/api'
import { productService } from '@services/products'
import { getImageUrl } from '@utils/helpers'
import { motion } from 'framer-motion'

interface Product {
  id: number
  slug: string
  name: string
  description: string
  price: string
  sale_price?: string | null
  stock_quantity: number
  is_featured: boolean
  is_trending: boolean
  is_new: boolean
  category: any
  wig_type: 'human_hair' | 'synthetic' | 'blend'
  texture: 'straight' | 'wavy' | 'curly' | 'coily' | 'kinky'
  color: string
  length: string
  cap_size: string
  seo_title?: string
  seo_description?: string
  seo_keywords?: string
  primary_image?: { url: string; alt_text?: string }
}

interface EditingState {
  product: Product | null
  isOpen: boolean
}

interface CreateProductState {
  isOpen: boolean
  data: Partial<Product> & { images: string[] }
}

const EMPTY_PRODUCT: Partial<Product> & { images: string[] } = {
  name: '',
  description: '',
  price: '0',
  sale_price: null,
  wig_type: 'human_hair',
  texture: 'straight',
  color: '',
  length: '',
  cap_size: '',
  is_featured: false,
  is_trending: false,
  is_new: false,
  seo_title: '',
  seo_description: '',
  seo_keywords: '',
  images: [],
}

const WIG_TYPES = [
  { value: 'human_hair', label: 'Human Hair' },
  { value: 'synthetic', label: 'Synthetic' },
  { value: 'blend', label: 'Human Hair Blend' },
]

const TEXTURES = [
  { value: 'straight', label: 'Straight' },
  { value: 'wavy', label: 'Wavy' },
  { value: 'curly', label: 'Curly' },
  { value: 'coily', label: 'Coily' },
  { value: 'kinky', label: 'Kinky' },
]

export function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [editing, setEditing] = useState<EditingState>({ product: null, isOpen: false })
  const [creating, setCreating] = useState<CreateProductState>({ isOpen: false, data: { ...EMPTY_PRODUCT } })
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editStock, setEditStock] = useState<number>(0)
  const [saving, setSaving] = useState(false)
  const [editingImages, setEditingImages] = useState<File[]>([])
  const [creatingImages, setCreatingImages] = useState<File[]>([])
  const [editImagePreviews, setEditImagePreviews] = useState<string[]>([])
  const [createImagePreviews, setCreateImagePreviews] = useState<string[]>([])

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get('/products/products/')
      setProducts(response.data.results || response.data)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await apiClient.get('/products/categories/')
      setCategories(response.data)
    } catch (err) {
      console.error('Failed to load categories', err)
    }
  }

  const handleEditStock = (product: Product) => {
    setEditingId(product.id)
    setEditStock(product.stock_quantity)
  }

  const handleSaveStock = async (product: Product) => {
    try {
      await productService.updateProductStock(product.slug, editStock)
      setProducts(
        products.map((p) =>
          p.id === product.id ? { ...p, stock_quantity: editStock } : p
        )
      )
      setEditingId(null)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update stock')
    }
  }

  const handleOpenEditModal = (product: Product) => {
    setEditing({ product: { ...product }, isOpen: true })
  }

  const handleCloseEditModal = () => {
    setEditing({ product: null, isOpen: false })
  }

  const handleEditChange = (field: string, value: any) => {
    if (editing.product) {
      setEditing({
        ...editing,
        product: { ...editing.product, [field]: value }
      })
    }
  }

  const handleOpenCreateModal = () => {
    setCreating({ isOpen: true, data: { ...EMPTY_PRODUCT } })
  }

  const handleCloseCreateModal = () => {
    setCreating({ isOpen: false, data: { ...EMPTY_PRODUCT } })
    setCreatingImages([])
    setCreateImagePreviews([])
  }

  const handleEditFilesSelected = (files: FileList) => {
    const newFiles = Array.from(files)
    setEditingImages([...editingImages, ...newFiles])

    // Create previews
    newFiles.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        setEditImagePreviews((prev) => [...prev, e.target?.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const handleCreateFilesSelected = (files: FileList) => {
    const newFiles = Array.from(files)
    setCreatingImages([...creatingImages, ...newFiles])

    // Create previews
    newFiles.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        setCreateImagePreviews((prev) => [...prev, e.target?.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeEditingImage = (index: number) => {
    setEditingImages((prev) => prev.filter((_, i) => i !== index))
    setEditImagePreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const removeCreatingImage = (index: number) => {
    setCreatingImages((prev) => prev.filter((_, i) => i !== index))
    setCreateImagePreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const handleCreateChange = (field: string, value: any) => {
    setCreating({
      ...creating,
      data: { ...creating.data, [field]: value }
    })
  }

  const handleCreateProduct = async () => {
    const data = creating.data
    if (!data.name || !data.price) {
      setError('Name and price are required')
      return
    }

    try {
      setSaving(true)
      // Create product
      const slug = data.name.toLowerCase().replace(/\s+/g, '-')
      const createData = {
        name: data.name,
        slug,
        description: data.description,
        price: data.price,
        sale_price: data.sale_price || null,
        wig_type: data.wig_type,
        texture: data.texture,
        color: data.color,
        length: data.length,
        cap_size: data.cap_size,
        is_featured: data.is_featured,
        is_trending: data.is_trending,
        is_new: data.is_new,
        seo_title: data.seo_title,
        seo_description: data.seo_description,
        seo_keywords: data.seo_keywords,
        stock_quantity: 0,
      }

      const response = await apiClient.post('/products/products/', createData)
      const newProduct = response.data

      // Add file uploads
      if (creatingImages.length > 0) {
        for (let i = 0; i < creatingImages.length; i++) {
          const formData = new FormData()
          formData.append('product', newProduct.id.toString())
          formData.append('media_type', 'image')
          formData.append('file', creatingImages[i])
          formData.append('alt_text', data.name || 'Product image')
          formData.append('is_primary', i === 0 ? 'true' : 'false')

          await apiClient.post('/products/media/', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          })
        }
      }

      // Refresh products list
      await fetchProducts()
      setCreating({ isOpen: false, data: { ...EMPTY_PRODUCT } })
      setCreatingImages([])
      setCreateImagePreviews([])
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create product')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveProduct = async () => {
    if (!editing.product) return

    try {
      setSaving(true)
      const updateData = {
        name: editing.product.name,
        description: editing.product.description,
        price: parseFloat(editing.product.price),
        sale_price: editing.product.sale_price ? parseFloat(editing.product.sale_price) : undefined,
        wig_type: editing.product.wig_type,
        texture: editing.product.texture,
        color: editing.product.color,
        length: editing.product.length,
        cap_size: editing.product.cap_size,
        is_featured: editing.product.is_featured,
        is_trending: editing.product.is_trending,
        is_new: editing.product.is_new,
        seo_title: editing.product.seo_title,
        seo_description: editing.product.seo_description,
        seo_keywords: editing.product.seo_keywords,
      }

      await productService.updateProduct(editing.product.slug, updateData)
      
      // Upload new images if any — first image becomes the new primary
      if (editingImages.length > 0) {
        // First, unmark existing primary images so the new one takes over
        try {
          const existingRes = await apiClient.get(`/products/media/?product=${editing.product.id}&is_primary=true`)
          const existingMedia = existingRes.data.results || existingRes.data || []
          for (const media of existingMedia) {
            await apiClient.patch(`/products/media/${media.id}/`, { is_primary: false })
          }
        } catch (_) { /* proceed anyway */ }

        for (let i = 0; i < editingImages.length; i++) {
          const formData = new FormData()
          formData.append('product', editing.product.id.toString())
          formData.append('media_type', 'image')
          formData.append('file', editingImages[i])
          formData.append('alt_text', editing.product.name || 'Product image')
          // First uploaded image becomes the new primary
          formData.append('is_primary', i === 0 ? 'true' : 'false')

          await apiClient.post('/products/media/', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          })
        }
      }
      
      // Refresh products list to get fresh data with new images
      await fetchProducts()
      
      setEditing({ product: null, isOpen: false })
      setEditingImages([])
      setEditImagePreviews([])
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update product')
    } finally {
      setSaving(false)
    }
  }

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <AdminLayout activeTab="products">
        {/* Skeleton search + button */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-0 sm:justify-between sm:items-center mb-4 sm:mb-6">
          <div className="flex-1">
            <div className="h-10 w-full bg-gray-200 rounded-lg skeleton-shimmer" />
          </div>
          <div className="h-10 w-32 bg-gray-200 rounded-lg skeleton-shimmer flex-shrink-0" />
        </div>

        {/* Desktop skeleton table */}
        <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                {['Product', 'Price', 'Stock', 'Status', 'Actions'].map((h, i) => (
                  <th key={i} className="px-6 py-4 text-left">
                    <div className="h-3 w-14 bg-gray-200 rounded skeleton-shimmer" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[...Array(5)].map((_, i) => (
                <motion.tr
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.07, duration: 0.3 }}
                  className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-200 skeleton-shimmer flex-shrink-0" />
                      <div>
                        <div className="h-4 w-40 bg-gray-200 rounded skeleton-shimmer mb-1" />
                        <div className="h-3 w-20 bg-gray-200 rounded skeleton-shimmer" />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 w-16 bg-gray-200 rounded skeleton-shimmer" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-6 w-16 bg-gray-200 rounded-full skeleton-shimmer" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-6 w-20 bg-gray-200 rounded-full skeleton-shimmer" />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="h-6 w-12 bg-gray-200 rounded-lg skeleton-shimmer ml-auto" />
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile skeleton cards */}
        <div className="md:hidden space-y-3">
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.3 }}
              className="bg-white rounded-lg shadow p-4"
            >
              <div className="mb-3">
                <div className="h-5 w-40 bg-gray-200 rounded skeleton-shimmer mb-1" />
                <div className="h-3 w-20 bg-gray-200 rounded skeleton-shimmer" />
              </div>
              <div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-100">
                <div>
                  <div className="h-3 w-10 bg-gray-200 rounded skeleton-shimmer mb-1" />
                  <div className="h-6 w-16 bg-gray-200 rounded skeleton-shimmer" />
                </div>
                <div className="h-6 w-16 bg-gray-200 rounded-full skeleton-shimmer" />
              </div>
              <div className="flex justify-between items-center">
                <div className="h-5 w-16 bg-gray-200 rounded-full skeleton-shimmer" />
                <div className="flex gap-2">
                  <div className="h-5 w-12 bg-gray-200 rounded skeleton-shimmer" />
                  <div className="h-5 w-12 bg-gray-200 rounded skeleton-shimmer" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout activeTab="products">
      {error && (
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm sm:text-base">{error}</p>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-0 sm:justify-between sm:items-center mb-4 sm:mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-nude outline-none text-sm sm:text-base"
          />
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="px-4 sm:px-6 py-2 bg-rose-nude text-white rounded-lg hover:bg-rose-nude/90 font-semibold text-sm sm:text-base whitespace-nowrap"
        >
          + Add Product
        </button>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Product</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Price</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Stock</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Status</th>
                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.map((product, index) => (
                <tr key={product.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:bg-rose-nude/5 transition-colors duration-150`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-rose-nude/10 to-rose-nude/20 flex items-center justify-center text-lg font-bold text-rose-nude/60 flex-shrink-0">
                        {product.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-gray-900">{product.name}</p>
                        <p className="text-xs text-gray-500">
                          {product.category ? (typeof product.category === 'object' ? product.category.name : product.category) : 'No category'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm text-gray-900">GHS {parseFloat(product.price).toFixed(2)}</span>
                      {product.sale_price && parseFloat(product.sale_price) > 0 && (
                        <span className="text-xs text-rose-500 line-through">GHS {parseFloat(product.sale_price).toFixed(2)}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {editingId === product.id ? (
                      <div className="flex gap-1.5 items-center">
                        <input
                          type="number"
                          value={editStock}
                          onChange={(e) => setEditStock(parseInt(e.target.value))}
                          className="w-20 px-2.5 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-rose-nude outline-none"
                          min="0"
                        />
                        <button
                          onClick={() => handleSaveStock(product)}
                          className="px-2.5 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition whitespace-nowrap"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-2.5 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-300 transition whitespace-nowrap"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          product.stock_quantity > 10 ? 'bg-emerald-500' : product.stock_quantity > 0 ? 'bg-amber-500' : 'bg-red-500'
                        }`} />
                        <span
                          className={`inline-block px-2.5 py-1 rounded-lg text-xs font-semibold ${
                            product.stock_quantity > 10
                              ? 'bg-emerald-50 text-emerald-700'
                              : product.stock_quantity > 0
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-red-50 text-red-700'
                          }`}
                        >
                          {product.stock_quantity} units
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${
                        product.is_featured ? 'bg-violet-50 text-violet-700 ring-1 ring-violet-200' : 'bg-gray-50 text-gray-600 ring-1 ring-gray-200'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${product.is_featured ? 'bg-violet-500' : 'bg-gray-400'}`} />
                      {product.is_featured ? 'Featured' : 'Regular'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex gap-2 justify-end">
                      {editingId !== product.id && (
                        <button
                          onClick={() => handleEditStock(product)}
                          className="px-3 py-1.5 text-xs font-semibold text-rose-nude bg-rose-nude/5 rounded-lg hover:bg-rose-nude/10 transition"
                        >
                          Stock
                        </button>
                      )}
                      <button
                        onClick={() => handleOpenEditModal(product)}
                        className="px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition"
                      >
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {filteredProducts.map((product) => (
          <div key={product.id} className="bg-white rounded-lg shadow p-4 hover:shadow-md transition">
            {/* Product Name & Category */}
            <div className="mb-3">
              <p className="font-semibold text-base text-black-primary">{product.name}</p>
              {product.category && (
                <p className="text-xs text-gray-600">
                  Cat: {typeof product.category === 'object' ? product.category.name : product.category}
                </p>
              )}
            </div>

            {/* Price & Status Row */}
            <div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-200">
              <div>
                <p className="text-xs text-gray-600">Price</p>
                <p className="text-lg font-bold text-rose-nude">GHS {parseFloat(product.price).toFixed(2)}</p>
              </div>
              <span
                className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                  product.is_featured ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                }`}
              >
                {product.is_featured ? 'Featured' : 'Regular'}
              </span>
            </div>

            {/* Stock Section */}
            <div className="mb-3">
              <p className="text-xs text-gray-600 mb-2">Stock Level</p>
              {editingId === product.id ? (
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={editStock}
                    onChange={(e) => setEditStock(parseInt(e.target.value))}
                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                    min="0"
                  />
                  <button
                    onClick={() => handleSaveStock(product)}
                    className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 font-semibold"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="px-3 py-1 bg-gray-300 text-gray-800 rounded text-sm hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                      product.stock_quantity > 10
                        ? 'bg-green-100 text-green-700'
                        : product.stock_quantity > 0
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {product.stock_quantity} units
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditStock(product)}
                      className="text-rose-nude hover:text-rose-700 font-semibold text-sm"
                    >
                      Stock
                    </button>
                    <button
                      onClick={() => handleOpenEditModal(product)}
                      className="text-blue-600 hover:text-blue-800 font-semibold text-sm"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg">
          <p className="text-gray-600">No products found</p>
        </div>
      )}

      {/* Edit Product Modal */}
      {editing.isOpen && editing.product && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex justify-between items-center">
              <h2 className="text-lg sm:text-xl font-bold text-black-primary">Edit Product</h2>
              <button
                onClick={handleCloseEditModal}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4">
              {/* Basic Info */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Product Name *</label>
                <input
                  type="text"
                  value={editing.product.name}
                  onChange={(e) => handleEditChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-nude outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Description *</label>
                <textarea
                  value={editing.product.description}
                  onChange={(e) => handleEditChange('description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-nude outline-none"
                />
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Price (GHS) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editing.product.price}
                    onChange={(e) => handleEditChange('price', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-nude outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Sale Price (GHS)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editing.product.sale_price || ''}
                    onChange={(e) => handleEditChange('sale_price', e.target.value || null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-nude outline-none"
                    placeholder="Leave blank if no sale"
                  />
                </div>
              </div>

              {/* Wig Specifications */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Wig Type *</label>
                  <select
                    value={editing.product.wig_type}
                    onChange={(e) => handleEditChange('wig_type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-nude outline-none"
                  >
                    {WIG_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Texture *</label>
                  <select
                    value={editing.product.texture}
                    onChange={(e) => handleEditChange('texture', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-nude outline-none"
                  >
                    {TEXTURES.map((texture) => (
                      <option key={texture.value} value={texture.value}>
                        {texture.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Physical Attributes */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Color *</label>
                  <input
                    type="text"
                    value={editing.product.color}
                    onChange={(e) => handleEditChange('color', e.target.value)}
                    placeholder="e.g., Black, Brown"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-nude outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Length *</label>
                  <input
                    type="text"
                    value={editing.product.length}
                    onChange={(e) => handleEditChange('length', e.target.value)}
                    placeholder="e.g., 16 inches"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-nude outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Cap Size *</label>
                  <input
                    type="text"
                    value={editing.product.cap_size}
                    onChange={(e) => handleEditChange('cap_size', e.target.value)}
                    placeholder="e.g., Medium"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-nude outline-none"
                  />
                </div>
              </div>

              {/* Status Flags */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editing.product.is_featured}
                    onChange={(e) => handleEditChange('is_featured', e.target.checked)}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">Featured</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editing.product.is_trending}
                    onChange={(e) => handleEditChange('is_trending', e.target.checked)}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">Trending</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editing.product.is_new}
                    onChange={(e) => handleEditChange('is_new', e.target.checked)}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">New</span>
                </label>
              </div>

              {/* Image Management */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="font-semibold text-gray-700 mb-3">Product Images</h3>
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Upload Images</label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => e.target.files && handleEditFilesSelected(e.target.files)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-nude outline-none text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">Upload images from your device</p>
                </div>
                
                {/* Image Previews */}
                {editImagePreviews.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">New Images to Upload:</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {editImagePreviews.map((preview, idx) => (
                        <div key={idx} className="relative">
                          <img
                            src={preview}
                            alt={`Preview ${idx}`}
                            className="w-full h-24 object-cover rounded"
                          />
                          <button
                            onClick={() => removeEditingImage(idx)}
                            className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {editing.product.primary_image && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 mb-2">Current Primary Image:</p>
                    <img
                      src={getImageUrl(editing.product.primary_image.url)}
                      alt={editing.product.name}
                      className="w-32 h-32 object-cover rounded"
                    />
                  </div>
                )}
              </div>

              {/* SEO Fields */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="font-semibold text-gray-700 mb-3">SEO</h3>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">SEO Title</label>
                  <input
                    type="text"
                    value={editing.product.seo_title || ''}
                    onChange={(e) => handleEditChange('seo_title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-nude outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1 mt-2">SEO Description</label>
                  <textarea
                    value={editing.product.seo_description || ''}
                    onChange={(e) => handleEditChange('seo_description', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-nude outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1 mt-2">SEO Keywords</label>
                  <input
                    type="text"
                    value={editing.product.seo_keywords || ''}
                    onChange={(e) => handleEditChange('seo_keywords', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-nude outline-none text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-4 sm:px-6 py-4 flex gap-2 justify-end">
              <button
                onClick={handleCloseEditModal}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProduct}
                disabled={saving}
                className="px-4 py-2 bg-rose-nude text-white rounded-lg hover:bg-rose-nude/90 font-semibold text-sm disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Product Modal */}
      {creating.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex justify-between items-center">
              <h2 className="text-lg sm:text-xl font-bold text-black-primary">Create New Product</h2>
              <button
                onClick={handleCloseCreateModal}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4">
              {/* Basic Info */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Product Name *</label>
                <input
                  type="text"
                  value={creating.data.name || ''}
                  onChange={(e) => handleCreateChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-nude outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Description *</label>
                <textarea
                  value={creating.data.description || ''}
                  onChange={(e) => handleCreateChange('description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-nude outline-none"
                />
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Price (GHS) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={creating.data.price || ''}
                    onChange={(e) => handleCreateChange('price', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-nude outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Sale Price (GHS)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={creating.data.sale_price || ''}
                    onChange={(e) => handleCreateChange('sale_price', e.target.value || null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-nude outline-none"
                    placeholder="Leave blank if no sale"
                  />
                </div>
              </div>

              {/* Wig Specifications */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Wig Type *</label>
                  <select
                    value={creating.data.wig_type || ''}
                    onChange={(e) => handleCreateChange('wig_type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-nude outline-none"
                  >
                    {WIG_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Texture *</label>
                  <select
                    value={creating.data.texture || ''}
                    onChange={(e) => handleCreateChange('texture', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-nude outline-none"
                  >
                    {TEXTURES.map((texture) => (
                      <option key={texture.value} value={texture.value}>
                        {texture.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Physical Attributes */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Color *</label>
                  <input
                    type="text"
                    value={creating.data.color || ''}
                    onChange={(e) => handleCreateChange('color', e.target.value)}
                    placeholder="e.g., Black, Brown"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-nude outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Length *</label>
                  <input
                    type="text"
                    value={creating.data.length || ''}
                    onChange={(e) => handleCreateChange('length', e.target.value)}
                    placeholder="e.g., 16 inches"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-nude outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Cap Size *</label>
                  <input
                    type="text"
                    value={creating.data.cap_size || ''}
                    onChange={(e) => handleCreateChange('cap_size', e.target.value)}
                    placeholder="e.g., Medium"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-nude outline-none"
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="font-semibold text-gray-700 mb-3">Product Images</h3>
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Upload Images</label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => e.target.files && handleCreateFilesSelected(e.target.files)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-nude outline-none text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">Upload images from your device</p>
                </div>

                {/* Image Previews */}
                {createImagePreviews.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Selected Images:</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {createImagePreviews.map((preview, idx) => (
                        <div key={idx} className="relative">
                          <img
                            src={preview}
                            alt={`Preview ${idx}`}
                            className="w-full h-24 object-cover rounded"
                          />
                          <button
                            type="button"
                            onClick={() => removeCreatingImage(idx)}
                            className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold"
                          >
                            ×
                          </button>
                          {idx === 0 && (
                            <div className="absolute bottom-0 left-0 right-0 bg-blue-600 text-white text-xs font-semibold px-1 py-0.5 rounded-b">
                              Primary
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-4 sm:px-6 py-4 flex gap-2 justify-end">
              <button
                onClick={handleCloseCreateModal}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProduct}
                disabled={saving}
                className="px-4 py-2 bg-rose-nude text-white rounded-lg hover:bg-rose-nude/90 font-semibold text-sm disabled:opacity-50"
              >
                {saving ? 'Creating...' : 'Create Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

