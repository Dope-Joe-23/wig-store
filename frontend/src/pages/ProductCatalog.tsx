import { useEffect, useState, useRef, useCallback } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { productService, type Product, type Category } from '@services/products'
import { getImageUrl } from '@utils/helpers'
import { SearchIcon, FilterIcon, CloseIcon } from '@components/Icons'
import { useDebounce } from '@hooks/useDebounce'

function CatalogSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: i * 0.08 }}
          className="bg-white rounded-lg overflow-hidden shadow-md"
        >
          <div className="bg-gray-200 h-56 skeleton-shimmer" />
          <div className="p-3 space-y-2">
            <div className="h-3 w-20 bg-gray-200 rounded skeleton-shimmer" />
            <div className="h-4 w-3/4 bg-gray-200 rounded skeleton-shimmer" />
            <div className="flex gap-1">
              {[...Array(5)].map((_, s) => (
                <div key={s} className="h-3 w-3 bg-gray-200 rounded skeleton-shimmer" />
              ))}
            </div>
            <div className="h-5 w-1/3 bg-gray-200 rounded skeleton-shimmer" />
          </div>
        </motion.div>
      ))}
    </div>
  )
}

export default function ProductCatalog() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchLoading, setSearchLoading] = useState(false)
  const [error, setError] = useState('')
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '')
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestions, setSuggestions] = useState<Product[]>([])
  const [suggestionsLoading, setSuggestionsLoading] = useState(false)

  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const debouncedSearch = useDebounce(searchInput, 350)

  const selectedCategory = searchParams.get('category')
  const selectedType = searchParams.get('wig_type')

  // Click outside to close suggestions dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Sync debounced search to URL params
  useEffect(() => {
    const currentSearch = searchParams.get('search') || ''
    if (debouncedSearch !== currentSearch) {
      const newParams = new URLSearchParams(searchParams)
      if (debouncedSearch.trim()) {
        newParams.set('search', debouncedSearch)
      } else {
        newParams.delete('search')
      }
      setSearchParams(newParams, { replace: true })
    }
  }, [debouncedSearch])

  // Fetch products when URL params change
  useEffect(() => {
    fetchData()
  }, [selectedCategory, selectedType, debouncedSearch])

  // Fetch live suggestions when typing (for dropdown)
  useEffect(() => {
    if (searchInput.trim().length >= 2) {
      setSuggestionsLoading(true)
      const timer = setTimeout(async () => {
        try {
          const { data } = await productService.searchSuggestions(searchInput)
          setSuggestions(data)
          setShowSuggestions(true)
        } catch {
          setSuggestions([])
        } finally {
          setSuggestionsLoading(false)
        }
      }, 150) // faster for suggestions
      return () => clearTimeout(timer)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
      setSuggestionsLoading(false)
    }
  }, [searchInput])

  const fetchData = async () => {
    try {
      setLoading(true)
      setSearchLoading(true)
      setError('')

      const params: Record<string, string> = {}
      if (selectedCategory) params.category = selectedCategory
      if (selectedType) params.wig_type = selectedType
      if (debouncedSearch.trim()) params.search = debouncedSearch

      const [productsRes, categoriesRes] = await Promise.all([
        productService.getProducts(params),
        productService.getCategories(),
      ])

      // Products response is always paginated (has .results)
      const productsList = productsRes.data.results
      // Categories can be array or paginated response
      const categoriesList = Array.isArray(categoriesRes.data)
        ? categoriesRes.data
        : categoriesRes.data.results

      setProducts(productsList)
      setCategories(categoriesList)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load products')
    } finally {
      setLoading(false)
      setSearchLoading(false)
    }
  }

  const clearSearch = useCallback(() => {
    setSearchInput('')
    setShowSuggestions(false)
    inputRef.current?.focus()
  }, [])

  const formatPrice = (price: string | number) => {
    return parseFloat(String(price)).toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
    })
  }

  // Highlight matching text
  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const parts = text.split(new RegExp(`(${escaped})`, 'gi'))
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase()
        ? <mark key={i} className="bg-gold/20 text-black-primary rounded-sm px-0.5">{part}</mark>
        : part
    )
  }

  const isSearchActive = debouncedSearch.trim().length > 0

  return (
    <div className="min-h-screen bg-ivory">
      <div className="container-base">
        {/* Header */}
        <div className="py-4 border-b border-gray-200">
          <h1 className="text-3xl font-heading font-bold text-black-primary mb-0">
            Our Collection
          </h1>
          <p className="text-sm text-gray-600">
            Discover our luxury wig collection crafted for elegance and comfort
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="sticky top-0 z-30 bg-ivory/95 backdrop-blur-sm py-3 border-b border-gray-200">
          <div className="flex items-center gap-2">
            {/* Live Search Bar */}
            <div ref={searchRef} className="relative flex-1">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search wigs by name, color, texture..."
                  value={searchInput}
                  onChange={(e) => {
                    setSearchInput(e.target.value)
                    if (e.target.value.trim() && !showSuggestions) {
                      setShowSuggestions(true)
                    }
                  }}
                  onFocus={() => {
                    if (suggestions.length > 0) setShowSuggestions(true)
                  }}
                  className="w-full pl-9 pr-9 py-2.5 bg-white border border-gray-300 rounded-lg
                    focus:ring-2 focus:ring-rose-nude/30 focus:border-rose-nude
                    outline-none text-sm transition-all duration-200
                    placeholder:text-gray-400"
                />
                {/* Clear / loading indicator */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  {(searchLoading || suggestionsLoading) && searchInput.trim().length > 0 && (
                    <div className="w-4 h-4 border-2 border-rose-nude border-t-transparent rounded-full animate-spin" />
                  )}
                  {searchInput && !searchLoading && (
                    <button
                      onClick={clearSearch}
                      className="text-gray-400 hover:text-gray-600 transition-colors p-0.5"
                      title="Clear search"
                    >
                      <CloseIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Search Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden animate-fadeIn">
                  <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">
                    Suggestions
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {suggestions.map((product) => (
                      <Link
                        key={product.id}
                        to={`/products/${product.slug}`}
                        onClick={() => setShowSuggestions(false)}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors group"
                      >
                        {/* Thumbnail */}
                        <div className="w-10 h-10 rounded-md bg-gray-100 flex-shrink-0 overflow-hidden">
                          {product.primary_image ? (
                            <img
                              src={getImageUrl(product.primary_image.url)}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                              Wig
                            </div>
                          )}
                        </div>
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-black-primary truncate group-hover:text-rose-nude transition-colors">
                            {highlightMatch(product.name, searchInput)}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {product.category?.name ? `${product.category.name} · ` : ''}
                            {formatPrice(product.current_price)}
                          </p>
                        </div>
                        {/* Rating */}
                        {product.rating > 0 && (
                          <div className="flex items-center gap-1 text-xs text-gray-500 flex-shrink-0">
                            <span className="text-gold">★</span>
                            <span>{Number(product.rating).toFixed(1)}</span>
                          </div>
                        )}
                      </Link>
                    ))}
                  </div>
                  {/* View all results */}
                  <Link
                    to={`/products?search=${encodeURIComponent(searchInput)}`}
                    onClick={() => setShowSuggestions(false)}
                    className="block px-4 py-2.5 text-center text-sm font-medium text-rose-nude border-t border-gray-100 hover:bg-rose-nude/5 transition-colors"
                  >
                    View all results for "{searchInput}"
                  </Link>
                </div>
              )}

              {/* No results suggestion state */}
              {showSuggestions && suggestions.length === 0 && searchInput.trim().length >= 2 && !suggestionsLoading && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 animate-fadeIn">
                  <div className="px-4 py-6 text-center">
                    <p className="text-sm text-gray-500">No suggestions found</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Press Enter to search all products
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Filter Button (Mobile) */}
            <button
              onClick={() => setShowMobileFilters(true)}
              className="md:hidden px-4 py-2.5 bg-black-primary text-white rounded-lg hover:bg-opacity-90 transition flex items-center justify-center gap-2 flex-shrink-0 relative"
              title="Filter products"
            >
              <FilterIcon className="w-4 h-4" />
              {(selectedCategory || selectedType) && (
                <span className="w-2 h-2 bg-rose-nude rounded-full absolute -top-0.5 -right-0.5" />
              )}
            </button>
          </div>

          {/* Active Search Info Bar */}
          {isSearchActive && (
            <div className="mt-2 flex items-center justify-between text-sm animate-fadeIn">
              <p className="text-gray-600">
                {loading
                  ? 'Searching...'
                  : `Found ${products.length} ${products.length === 1 ? 'result' : 'results'}
                    ${debouncedSearch.trim() ? `for "${debouncedSearch}"` : ''}`
                }
              </p>
              {!loading && products.length > 0 && (
                <button
                  onClick={clearSearch}
                  className="text-rose-nude hover:text-rose-nude/80 transition-colors text-xs font-medium"
                >
                  Clear search
                </button>
              )}
            </div>
          )}

          {/* Category Pills (quick filters) */}
          {!isSearchActive && categories.length > 0 && (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-thin animate-fadeIn">
              <button
                onClick={() => {
                  const newParams = new URLSearchParams(searchParams)
                  newParams.delete('category')
                  setSearchParams(newParams)
                }}
                className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all
                  ${!selectedCategory
                    ? 'bg-rose-nude text-white shadow-sm'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-rose-nude hover:text-rose-nude'
                  }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    const newParams = new URLSearchParams(searchParams)
                    newParams.set('category', cat.id.toString())
                    setSearchParams(newParams)
                  }}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all
                    ${selectedCategory === cat.id.toString()
                      ? 'bg-rose-nude text-white shadow-sm'
                      : 'bg-white text-gray-600 border border-gray-200 hover:border-rose-nude hover:text-rose-nude'
                    }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex gap-6 mt-4">
          {/* Sidebar - Filters (Desktop Only) */}
          <aside className="hidden md:block w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-md p-4 sticky top-32">
              <h3 className="text-base font-bold text-black-primary mb-4">Filters</h3>

              {/* Category Filter */}
              <div className="mb-4">
                <h4 className="font-semibold text-black-primary mb-2">Category</h4>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      const newParams = new URLSearchParams(searchParams)
                      newParams.delete('category')
                      setSearchParams(newParams)
                    }}
                    className={`block text-sm ${
                      !selectedCategory
                        ? 'text-rose-nude font-semibold'
                        : 'text-gray-600 hover:text-black-primary'
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        const newParams = new URLSearchParams(searchParams)
                        newParams.set('category', cat.id.toString())
                        setSearchParams(newParams)
                      }}
                      className={`block text-sm ${
                        selectedCategory === cat.id.toString()
                          ? 'text-rose-nude font-semibold'
                          : 'text-gray-600 hover:text-black-primary'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Wig Type Filter */}
              <div className="mb-8">
                <h4 className="font-semibold text-black-primary mb-3">Wig Type</h4>
                <div className="space-y-2">
                  {['human_hair', 'synthetic', 'blend'].map((type) => (
                    <button
                      key={type}
                      onClick={() => {
                        const newParams = new URLSearchParams(searchParams)
                        if (selectedType === type) {
                          newParams.delete('wig_type')
                        } else {
                          newParams.set('wig_type', type)
                        }
                        setSearchParams(newParams)
                      }}
                      className={`block text-sm ${
                        selectedType === type
                          ? 'text-rose-nude font-semibold'
                          : 'text-gray-600 hover:text-black-primary'
                      }`}
                    >
                      {type.replace('_', ' ').toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              {(selectedCategory || selectedType || isSearchActive) && (
                <button
                  onClick={() => {
                    setSearchInput('')
                    setSearchParams({})
                  }}
                  className="w-full px-4 py-2 border border-gray-300 text-black-primary rounded-lg hover:bg-gray-50 transition text-sm font-medium"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          </aside>

          {/* Main Content - Products Grid */}
          <main className="flex-1 w-full min-w-0">
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800">{error}</p>
              </div>
            )}

            {loading ? (
              <CatalogSkeleton />
            ) : products.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <SearchIcon className="w-7 h-7 text-gray-400" />
                </div>
                <h3 className="text-lg font-heading font-semibold text-black-primary mb-2">
                  {isSearchActive ? 'No products found' : 'No products available'}
                </h3>
                <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
                  {isSearchActive
                    ? `We couldn't find any products matching "${debouncedSearch}". Try a different search term or browse our categories.`
                    : 'Check back later for new arrivals.'}
                </p>
                {isSearchActive && (
                  <button
                    onClick={clearSearch}
                    className="px-6 py-2.5 bg-rose-nude text-white rounded-lg hover:bg-brown transition text-sm font-medium"
                  >
                    Clear Search & Browse All
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products.map((product, index) => (
                    <Link
                      key={product.id}
                      to={`/products/${product.slug}`}
                      className="group bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                      style={{
                        animation: `fadeIn 300ms ease-out ${index * 50}ms both`,
                      }}
                    >
                      {/* Product Image */}
                      <div className="bg-gray-200 h-56 overflow-hidden relative">
                        {product.primary_image ? (
                          <img
                            src={getImageUrl(product.primary_image.url)}
                            alt={product.primary_image.alt_text}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-gray-400">No Image</span>
                          </div>
                        )}
                        {/* Badges */}
                        {!product.stock_quantity || product.stock_quantity === 0 ? (
                          <>
                            <span className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-sm z-10">
                              Out of Stock
                            </span>
                            <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                              <span className="bg-white/90 text-red-600 px-4 py-2 rounded-lg text-sm font-bold shadow-lg">
                                Out of Stock
                              </span>
                            </div>
                          </>
                        ) : product.is_featured ? (
                          <span className="absolute top-3 right-3 bg-rose-nude text-white px-3 py-1 rounded-full text-xs font-semibold shadow-sm">
                            Featured
                          </span>
                        ) : null}
                      </div>

                      {/* Product Info */}
                      <div className="p-3">
                        <p className="text-xs text-gray-500 mb-1">
                          {product.category?.name || 'Uncategorized'}
                        </p>
                        <h3 className="font-heading font-semibold text-black-primary mb-2 line-clamp-2 group-hover:text-rose-nude transition-colors">
                          {isSearchActive
                            ? highlightMatch(product.name, debouncedSearch)
                            : product.name}
                        </h3>

                        {/* Rating */}
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex text-gold">
                            {[...Array(5)].map((_, i) => (
                              <span key={i} className={i < Math.floor(product.rating) ? '' : 'opacity-30'}>
                                ★
                              </span>
                            ))}
                          </div>
                          <span className="text-xs text-gray-600">
                            ({product.review_count})
                          </span>
                        </div>

                        {/* Price */}
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-black-primary">
                            {formatPrice(product.current_price)}
                          </span>
                          {product.sale_price && (
                            <span className="text-xs text-gray-500 line-through">
                              {formatPrice(product.price)}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </main>
        </div>

        {/* Mobile Filter Modal */}
        {showMobileFilters && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div
              className="fixed inset-0 backdrop-blur-md bg-black/30"
              onClick={() => setShowMobileFilters(false)}
            />
            <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-lg shadow-lg p-6 max-h-[80vh] overflow-y-auto animate-slide-up">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-black-primary">Filters</h3>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="text-gray-600 hover:text-black-primary"
                >
                  <CloseIcon className="w-6 h-6" />
                </button>
              </div>

              {/* Category Filter */}
              <div className="mb-4">
                <h4 className="font-semibold text-black-primary mb-2">Category</h4>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      const newParams = new URLSearchParams(searchParams)
                      newParams.delete('category')
                      setSearchParams(newParams)
                      setShowMobileFilters(false)
                    }}
                    className={`block text-sm w-full text-left py-2 ${
                      !selectedCategory
                        ? 'text-rose-nude font-semibold'
                        : 'text-gray-600'
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        const newParams = new URLSearchParams(searchParams)
                        newParams.set('category', cat.id.toString())
                        setSearchParams(newParams)
                        setShowMobileFilters(false)
                      }}
                      className={`block text-sm w-full text-left py-2 ${
                        selectedCategory === cat.id.toString()
                          ? 'text-rose-nude font-semibold'
                          : 'text-gray-600'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Wig Type Filter */}
              <div className="mb-8">
                <h4 className="font-semibold text-black-primary mb-3">Wig Type</h4>
                <div className="space-y-2">
                  {['human_hair', 'synthetic', 'blend'].map((type) => (
                    <button
                      key={type}
                      onClick={() => {
                        const newParams = new URLSearchParams(searchParams)
                        if (selectedType === type) {
                          newParams.delete('wig_type')
                        } else {
                          newParams.set('wig_type', type)
                        }
                        setSearchParams(newParams)
                        setShowMobileFilters(false)
                      }}
                      className={`block text-sm w-full text-left py-2 ${
                        selectedType === type
                          ? 'text-rose-nude font-semibold'
                          : 'text-gray-600'
                      }`}
                    >
                      {type.replace('_', ' ').toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              {(selectedCategory || selectedType || isSearchActive) && (
                <button
                  onClick={() => {
                    setSearchInput('')
                    setSearchParams({})
                    setShowMobileFilters(false)
                  }}
                  className="w-full px-4 py-2 border border-gray-300 text-black-primary rounded-lg hover:bg-gray-50 transition text-sm font-medium"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
