import React, { useEffect, useMemo, useState, useRef, useCallback } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../../lib/api'
import { useCart, getStockStatus } from '../../lib/CartContext'
import { setSEO } from '../../shared/lib/seo.js'
import RecommendationModal from '../../components/RecommendationModal'

// Premium animations
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.05
    }
  }
}

const scaleOnHover = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.98 }
}

export default function Catalogue() {
  const { addToCart } = useCart()
  const authed = !!localStorage.getItem('token')
  const navigate = useNavigate()
  const location = useLocation()
  
  // State
  const [searchQuery, setSearchQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [products, setProducts] = useState([])
  const [totalProducts, setTotalProducts] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [sortBy, setSortBy] = useState('NEW')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [loading, setLoading] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)
  const [recOpen, setRecOpen] = useState(false)
  const [recItems, setRecItems] = useState([])
  const [hoveredPriceId, setHoveredPriceId] = useState(null)
  
  const searchRef = useRef(null)
  const limit = 12

  // Fetch products
  const loadProducts = async (page = 1) => {
    setLoading(true)
    try {
      const { data } = await api.get('/api/products', {
        params: { 
          q: searchQuery, 
          page, 
          limit, 
          category: selectedCategory || undefined 
        },
      })
      
      if (page === 1) {
        setProducts(data.items)
      } else {
        setProducts(prev => [...prev, ...data.items])
      }
      
      setTotalProducts(data.total)
      setCurrentPage(page)
    } catch (error) {
      console.error('Failed to load products:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { 
    loadProducts(1) 
  }, [searchQuery, selectedCategory])

  // Fetch categories
  useEffect(() => {
    api.get('/api/public/categories')
      .then(({ data }) => setCategories(data))
      .catch(() => {})
  }, [])

  // Handle URL params
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const cat = params.get('category')
    if (cat) setSelectedCategory(cat)
  }, [location.search])

  // Search suggestions
  useEffect(() => {
    let timeoutId
    
    if (searchQuery.trim().length >= 2) {
      timeoutId = setTimeout(async () => {
        try {
          const { data } = await api.get('/api/products/suggest', { 
            params: { q: searchQuery } 
          })
          setSuggestions(data || [])
          setShowSuggestions(true)
        } catch { 
          setSuggestions([]) 
        }
      }, 250)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
    
    return () => timeoutId && clearTimeout(timeoutId)
  }, [searchQuery])

  // SEO
  useEffect(() => {
    const baseTitle = 'Premium B2B Collection | Click2Kart'
    const title = selectedCategory 
      ? `${selectedCategory} · Wholesale Premium | Click2Kart` 
      : (searchQuery ? `Search: ${searchQuery} | Click2Kart` : baseTitle)
    
    setSEO(
      title, 
      'Discover premium wholesale products with exclusive B2B pricing and bulk discounts.'
    )
  }, [searchQuery, selectedCategory])

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = [...products]
    
    if (authed) {
      const min = Number(minPrice)
      const max = Number(maxPrice)
      
      if (!Number.isNaN(min) && minPrice !== '') {
        filtered = filtered.filter(p => (p.price ?? Infinity) >= min)
      }
      
      if (!Number.isNaN(max) && maxPrice !== '') {
        filtered = filtered.filter(p => (p.price ?? -Infinity) <= max)
      }
      
      if (sortBy === 'PRICE_LOW') {
        filtered.sort((a, b) => (a.price ?? 0) - (b.price ?? 0))
      }
      
      if (sortBy === 'PRICE_HIGH') {
        filtered.sort((a, b) => (b.price ?? 0) - (a.price ?? 0))
      }
    }
    
    if (sortBy === 'NEW') {
      filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    }
    
    return filtered
  }, [products, minPrice, maxPrice, sortBy, authed])

  const totalPages = Math.max(1, Math.ceil(totalProducts / limit))

  // Handle add to cart with recommendations
  const handleAddToCart = useCallback(async (product) => {
    if (!authed) {
      navigate('/login')
      return false
    }
    
    const success = await addToCart(product)
    
    if (success) {
      try {
        const { data } = await api.get(`/api/recommendations/frequently-bought/${product._id}`)
        const filtered = (data || []).filter(item => item._id !== product._id)
        setRecItems(filtered)
        if (filtered.length > 0) setRecOpen(true)
      } catch {}
    }
    
    return success
  }, [authed, addToCart, navigate])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      
      {/* Premium subtle background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
      </div>

      {/* Premium Header */}
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
        className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-indigo-100/50 shadow-lg shadow-indigo-500/5"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Mobile Header */}
          <div className="lg:hidden py-3">
            <div className="relative">
              <motion.div whileFocus={{ scale: 1.02 }}>
                <input
                  ref={searchRef}
                  className="w-full bg-white/90 backdrop-blur border border-indigo-100 text-gray-900 placeholder-gray-400 text-sm rounded-xl pl-12 pr-12 py-4 outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all shadow-md"
                  placeholder="Search premium products..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onFocus={() => { 
                    setSearchFocused(true); 
                    searchQuery.trim().length >= 2 && setShowSuggestions(true) 
                  }}
                  onBlur={() => { 
                    setTimeout(() => { 
                      setShowSuggestions(false); 
                      setSearchFocused(false) 
                    }, 150) 
                  }}
                />
              </motion.div>
              
              <motion.div 
                animate={{ rotate: searchFocused ? 90 : 0 }}
                className="absolute left-4 top-1/2 -translate-y-1/2"
              >
                <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </motion.div>
              
              <AnimatePresence>
                {searchQuery && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={() => { 
                      setSearchQuery(''); 
                      setSuggestions([]); 
                      setShowSuggestions(false) 
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-indigo-50 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-100 flex items-center justify-center transition-all"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.3 5.71 12 12l6.3 6.29-1.41 1.42L10.59 13.4 4.3 19.71 2.89 18.3 9.17 12 2.89 5.71 4.3 4.29l6.29 6.3 6.3-6.3z" />
                    </svg>
                  </motion.button>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {showSuggestions && suggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 right-0 mt-2 z-50"
                  >
                    <SuggestionsList 
                      items={suggestions} 
                      onSelect={() => setShowSuggestions(false)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Premium Category Chips */}
            <motion.div 
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="flex gap-2 mt-3 overflow-x-auto scrollbar-none pb-1"
            >
              <PremiumCategoryChip 
                label="All"
                icon="✨"
                active={selectedCategory === ''}
                onClick={() => setSelectedCategory('')}
              />
              {categories.map(c => (
                <PremiumCategoryChip 
                  key={c._id}
                  label={c.name}
                  icon={c.image ? null : "📦"}
                  image={c.image}
                  active={selectedCategory === c.name}
                  onClick={() => setSelectedCategory(c.name)}
                />
              ))}
            </motion.div>
          </div>

          {/* Desktop Header */}
          <div className="hidden lg:flex items-center justify-between py-4">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="relative"
            >
              <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em]">
                PREMIUM B2B COLLECTION
              </p>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight mt-1">
                Wholesale <span className="text-indigo-600">Luxury</span>
              </h1>
            </motion.div>
            
            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="relative w-96">
                <motion.div whileFocus={{ scale: 1.02 }}>
                  <input
                    ref={searchRef}
                    className="w-full bg-white/90 backdrop-blur border border-indigo-100 text-gray-900 placeholder-gray-400 text-sm rounded-xl pl-14 pr-14 py-3.5 outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all shadow-md"
                    placeholder="Search products, brands, collections..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    onFocus={() => searchQuery.trim().length >= 2 && setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                  />
                </motion.div>
                
                <motion.div 
                  animate={{ rotate: searchFocused ? 90 : 0 }}
                  className="absolute left-5 top-1/2 -translate-y-1/2"
                >
                  <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </motion.div>
                
                <AnimatePresence>
                  {searchQuery && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      onClick={() => { 
                        setSearchQuery(''); 
                        setSuggestions([]); 
                        setShowSuggestions(false) 
                      }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-indigo-50 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-100 flex items-center justify-center transition-all"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.3 5.71 12 12l6.3 6.29-1.41 1.42L10.59 13.4 4.3 19.71 2.89 18.3 9.17 12 2.89 5.71 4.3 4.29l6.29 6.3 6.3-6.3z" />
                      </svg>
                    </motion.button>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {showSuggestions && suggestions.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 right-0 mt-2 z-50"
                    >
                      <SuggestionsList 
                        items={suggestions} 
                        onSelect={() => setShowSuggestions(false)}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Premium Sort Dropdown */}
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="relative"
              >
                <select
                  className="appearance-none bg-white/90 backdrop-blur border border-indigo-100 text-gray-800 text-sm rounded-xl pl-5 pr-12 py-3.5 outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all font-medium cursor-pointer shadow-md min-w-[180px]"
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                >
                  <option value="NEW" className="py-2">✨ Newest Arrivals</option>
                  {authed && <option value="PRICE_LOW" className="py-2">💰 Price: Low → High</option>}
                  {authed && <option value="PRICE_HIGH" className="py-2">💎 Price: High → Low</option>}
                </select>
                
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto relative z-10 px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="lg:flex lg:gap-8">
          
          {/* Premium Desktop Sidebar */}
          <motion.aside 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="hidden lg:block w-72 flex-shrink-0"
          >
            <div className="sticky top-24 space-y-6">
              
              {/* Categories Card */}
              <motion.div 
                variants={fadeInUp}
                className="bg-white/90 backdrop-blur-xl rounded-2xl border border-indigo-100/50 p-6 shadow-xl shadow-indigo-500/5"
              >
                <h3 className="text-xs font-black text-indigo-600 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <span className="w-6 h-0.5 bg-indigo-200 rounded-full" />
                  CATEGORIES
                </h3>
                
                <div className="space-y-1">
                  <motion.button
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedCategory('')}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      selectedCategory === ''
                        ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md'
                        : 'text-gray-700 hover:bg-indigo-50/50'
                    }`}
                  >
                    All Products
                  </motion.button>
                  
                  {categories.map(c => (
                    <motion.button
                      key={c._id}
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedCategory(c.name)}
                      className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all capitalize ${
                        selectedCategory === c.name
                          ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md'
                          : 'text-gray-700 hover:bg-indigo-50/50'
                      }`}
                    >
                      {c.name}
                    </motion.button>
                  ))}
                </div>
              </motion.div>

              {/* Price Range Card */}
              <motion.div 
                variants={fadeInUp}
                className="bg-white/90 backdrop-blur-xl rounded-2xl border border-indigo-100/50 p-6 shadow-xl shadow-indigo-500/5"
              >
                <h3 className="text-xs font-black text-indigo-600 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <span className="w-6 h-0.5 bg-indigo-200 rounded-full" />
                  PRICE RANGE
                </h3>
                
                {!authed ? (
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100"
                  >
                    <p className="text-sm text-indigo-600 font-medium flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Login to view prices
                    </p>
                  </motion.div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="relative flex-1">
                        <input
                          type="number"
                          className="w-full bg-gray-50/80 border border-indigo-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all"
                          placeholder="Min"
                          value={minPrice}
                          onChange={e => setMinPrice(e.target.value)}
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400 font-medium">₹</span>
                      </div>
                      <div className="relative flex-1">
                        <input
                          type="number"
                          className="w-full bg-gray-50/80 border border-indigo-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all"
                          placeholder="Max"
                          value={maxPrice}
                          onChange={e => setMaxPrice(e.target.value)}
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400 font-medium">₹</span>
                      </div>
                    </div>
                    
                    <AnimatePresence>
                      {(minPrice || maxPrice) && (
                        <motion.button
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          onClick={() => { setMinPrice(''); setMaxPrice('') }}
                          className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                        >
                          Clear filters
                        </motion.button>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </motion.div>

              {/* Stats Card */}
              <motion.div 
                variants={fadeInUp}
                className="bg-gradient-to-br from-indigo-600 to-indigo-500 rounded-2xl p-6 text-white shadow-xl"
              >
                <p className="text-xs font-medium opacity-80 mb-1">Total Products</p>
                <motion.p 
                  key={totalProducts}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-3xl font-black mb-4"
                >
                  {totalProducts}
                </motion.p>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="opacity-80">Page</span>
                  <span className="font-bold">{currentPage} of {totalPages}</span>
                </div>
                
                <div className="w-full h-1 bg-white/20 rounded-full mt-3 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(currentPage / totalPages) * 100}%` }}
                    className="h-full bg-white rounded-full"
                  />
                </div>
              </motion.div>
            </div>
          </motion.aside>

          {/* Product Grid */}
          <main className="flex-1">
            
            {/* Mobile Action Bar */}
            <div className="lg:hidden flex items-center justify-between mb-4">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setFiltersOpen(true)}
                className="flex items-center gap-2 px-5 py-3 bg-white/90 backdrop-blur border border-indigo-100 rounded-xl text-sm font-medium text-indigo-600 shadow-md"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18M7 12h10M10 18h4" />
                </svg>
                Filters
              </motion.button>
              
              <select
                className="bg-white/90 backdrop-blur border border-indigo-100 rounded-xl px-4 py-3 text-sm outline-none shadow-md"
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
              >
                <option value="NEW">✨ Newest</option>
                {authed && <option value="PRICE_LOW">💰 Low→High</option>}
                {authed && <option value="PRICE_HIGH">💎 High→Low</option>}
              </select>
            </div>

            {/* Desktop Result Header */}
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="hidden lg:flex items-center justify-between mb-6"
            >
              <div className="flex items-center gap-3">
                <motion.span 
                  key={totalProducts}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-2xl font-black text-indigo-600"
                >
                  {totalProducts}
                </motion.span>
                <span className="text-gray-500">products found</span>
                {selectedCategory && (
                  <motion.span 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="ml-2 px-3 py-1.5 bg-indigo-50 rounded-lg text-sm font-medium text-indigo-600 border border-indigo-100"
                  >
                    {selectedCategory}
                  </motion.span>
                )}
              </div>
              
              <div className="text-sm text-gray-400">
                Page {currentPage} of {totalPages}
              </div>
            </motion.div>

            {/* Loading State */}
            <AnimatePresence mode="wait">
              {loading && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
                >
                  {Array.from({ length: 8 }).map((_, i) => (
                    <PremiumSkeletonCard key={i} />
                  ))}
                </motion.div>
              )}

              {/* Products */}
              {!loading && filteredProducts.length > 0 && (
                <motion.div
                  key="products"
                  variants={staggerContainer}
                  initial="initial"
                  animate="animate"
                  className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
                >
                  {filteredProducts.map((product, index) => (
                    <PremiumProductCard
                      key={product._id}
                      product={product}
                      index={index}
                      authed={authed}
                      isPriceHovered={hoveredPriceId === product._id}
                      onPriceHover={() => setHoveredPriceId(product._id)}
                      onPriceLeave={() => setHoveredPriceId(null)}
                      onAddToCart={() => handleAddToCart(product)}
                      onNavigate={() => navigate(`/products/${product._id}`)}
                    />
                  ))}
                </motion.div>
              )}

              {/* Empty State */}
              {!loading && filteredProducts.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="py-20 text-center"
                >
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
                  <p className="text-gray-500 mb-6">Try adjusting your filters</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => { 
                      setSelectedCategory(''); 
                      setSearchQuery(''); 
                      setMinPrice(''); 
                      setMaxPrice('') 
                    }}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium shadow-lg hover:bg-indigo-700 transition-colors"
                  >
                    Clear all filters
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Load More */}
            <AnimatePresence>
              {!loading && currentPage * limit < totalProducts && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex justify-center mt-8"
                >
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => loadProducts(currentPage + 1)}
                    className="px-8 py-4 bg-white border-2 border-indigo-100 text-indigo-600 rounded-xl font-medium shadow-lg hover:border-indigo-300 hover:shadow-xl transition-all duration-300"
                  >
                    Load More Products
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>

      {/* Mobile Filters Modal */}
      <AnimatePresence>
        {filtersOpen && (
          <PremiumMobileFiltersModal
            categories={categories}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            minPrice={minPrice}
            setMinPrice={setMinPrice}
            maxPrice={maxPrice}
            setMaxPrice={setMaxPrice}
            authed={authed}
            onClose={() => setFiltersOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Recommendation Modal */}
      <RecommendationModal 
        open={recOpen} 
        items={recItems} 
        onClose={() => setRecOpen(false)} 
        onAddToCart={async (item) => {
          await addToCart(item)
          setRecItems(prev => prev.filter(i => i._id !== item._id))
        }}
      />
    </div>
  )
}

// Premium Category Chip Component
function PremiumCategoryChip({ label, icon, image, active, onClick }) {
  return (
    <motion.button
      variants={fadeInUp}
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`flex-shrink-0 px-4 py-2.5 rounded-full text-xs font-medium transition-all duration-300 border-2 flex items-center gap-2 ${
        active
          ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white border-transparent shadow-lg'
          : 'bg-white/90 backdrop-blur text-gray-700 border-indigo-100 hover:border-indigo-300 hover:bg-indigo-50/50'
      }`}
    >
      {image ? (
        <img src={image} alt={label} className="w-4 h-4 rounded-full object-cover" />
      ) : (
        <span>{icon}</span>
      )}
      <span className="capitalize">{label}</span>
    </motion.button>
  )
}

// Premium Product Card with Masked Price and Eye Icon
function PremiumProductCard({ 
  product, 
  index, 
  authed, 
  isPriceHovered, 
  onPriceHover, 
  onPriceLeave, 
  onAddToCart, 
  onNavigate 
}) {
  const [isHovered, setIsHovered] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  
  // Calculate discount percentage
  const discount = product.mrp && product.mrp > product.price
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
    : 0
  
  // Get trend icon
  const getTrendIcon = () => {
    if (!product.priceTrend) return null
    
    if (product.priceTrend === 0) {
      return (
        <motion.span 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-emerald-600 flex items-center"
        >
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M7 13l5 5 5-5M12 18V6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </motion.span>
      )
    } else {
      return (
        <motion.span 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-amber-600 flex items-center"
        >
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M7 11l5-5 5 5M12 6v12" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </motion.span>
      )
    }
  }

  const handleAddToCart = async (e) => {
    e.stopPropagation()
    e.preventDefault()
    
    if (!authed) {
      onNavigate()
      return
    }
    
    setIsAdding(true)
    await onAddToCart()
    setIsAdding(false)
  }

  const handlePriceClick = (e) => {
    e.stopPropagation()
    e.preventDefault()
    if (!authed) {
      onNavigate()
    }
  }

  return (
    <motion.div
      variants={fadeInUp}
      initial="initial"
      animate="animate"
      whileHover={{ y: -6 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onNavigate}
      className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 cursor-pointer border border-gray-100 hover:border-indigo-200 relative"
    >
      {/* Image Container */}
      <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-indigo-50/30 overflow-hidden">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-indigo-100/50 animate-pulse" />
        )}
        
        {product.images && product.images.length > 0 ? (
          <img
            src={product.images[0].url}
            alt={product.name}
            onLoad={() => setImageLoaded(true)}
            className={`w-full h-full object-contain p-6 transition-all duration-700 ${
              isHovered ? 'scale-110' : 'scale-100'
            } ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl text-gray-300">
            📦
          </div>
        )}

        {/* Discount Badge - Premium */}
        {authed && discount > 0 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute top-3 left-3 bg-gradient-to-r from-emerald-500 to-emerald-400 text-white text-xs font-bold px-2.5 py-1.5 rounded-lg shadow-lg z-10"
          >
            {discount}% OFF
          </motion.div>
        )}

        {/* Wishlist Button - Premium */}
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1 : 0.8 }}
          className="absolute top-3 right-3 h-9 w-9 rounded-xl bg-white/90 backdrop-blur shadow-lg flex items-center justify-center text-gray-400 hover:text-rose-500 transition-colors z-10"
          onClick={(e) => {
            e.stopPropagation()
            e.preventDefault()
            // Add wishlist logic here
          }}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 6 4 4 6.5 4c1.74 0 3.41 1.01 4.22 2.5C11.09 5.01 12.76 4 14.5 4 17 4 19 6 19 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </motion.button>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Category */}
        <p className="text-xs text-gray-400 mb-1 capitalize">{product.category || 'General'}</p>
        
        {/* Product Name */}
        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 min-h-[2.5rem] mb-3 group-hover:text-indigo-600 transition-colors">
          {product.name}
        </h3>

        {/* Price Section with Masking and Eye Icon */}
        <div className="space-y-2">
          {authed ? (
            /* Authenticated - Show Actual Price */
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-lg font-bold text-gray-900">
                  ₹{product.price?.toLocaleString()}
                </span>
                
                {/* Price Trend Arrow */}
                {product.priceTrend !== undefined && getTrendIcon()}
                
                {/* MRP */}
                {product.mrp > product.price && (
                  <span className="text-xs text-gray-400 line-through">
                    ₹{product.mrp?.toLocaleString()}
                  </span>
                )}
              </div>
              
              {/* Bulk Discount Indicator */}
              {product.bulkDiscountQuantity > 0 && (
                <p className="text-xs font-medium text-emerald-600">
                  Bulk discount available
                </p>
              )}
            </div>
          ) : (
            /* Not Authenticated - Masked Price with Eye Icon */
            <motion.div 
              className="relative"
              onHoverStart={onPriceHover}
              onHoverEnd={onPriceLeave}
            >
              {/* Masked Price */}
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-gray-300 flex items-center gap-1">
                  <span className="text-indigo-300">₹</span>
                  <span>****</span>
                </span>
                
                {/* Eye Icon that redirects to login on hover */}
                <motion.div
                  animate={{ 
                    scale: isPriceHovered ? 1.1 : 1,
                    opacity: isPriceHovered ? 1 : 0.7
                  }}
                  className="relative"
                >
                  <motion.div
                    whileHover={{ scale: 1.2 }}
                    onClick={handlePriceClick}
                    className="cursor-pointer text-indigo-400 hover:text-indigo-600 transition-colors"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </motion.div>
                  
                  {/* Tooltip on hover */}
                  <AnimatePresence>
                    {isPriceHovered && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap z-20"
                      >
                        Click to view price
                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45" />
                      </motion.div>
                    )}
              </AnimatePresence>
                </motion.div>
              </div>
              
              {/* Hint Text */}
              <p className="text-xs text-gray-400 mt-1">
                Login to see wholesale price
              </p>
            </motion.div>
          )}

          {/* Add to Cart Button */}
          {authed && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAddToCart}
              disabled={product.stock <= 0 || isAdding}
              className={`w-full mt-3 py-3 rounded-xl text-sm font-medium transition-all ${
                product.stock > 0
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md hover:shadow-lg'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isAdding ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Adding...
                </span>
              ) : (
                product.stock > 0 ? 'Add to Cart' : 'Out of Stock'
              )}
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// Premium Skeleton Card
function PremiumSkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse">
      <div className="aspect-square bg-gradient-to-br from-gray-100 to-indigo-50" />
      <div className="p-4 space-y-3">
        <div className="h-3 bg-gray-100 rounded w-1/3" />
        <div className="h-4 bg-gray-100 rounded w-3/4" />
        <div className="h-6 bg-gray-100 rounded w-1/2" />
      </div>
    </div>
  )
}

// Premium Suggestions List
function SuggestionsList({ items, onSelect }) {
  const navigate = useNavigate()
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-white rounded-2xl border border-indigo-100 shadow-xl overflow-hidden"
    >
      {items.map((item, index) => (
        <motion.div
          key={item.id}
          whileHover={{ backgroundColor: '#f5f3ff' }}
          onClick={() => {
            navigate(`/products/${item.id}`)
            onSelect()
          }}
          className="flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors border-b last:border-b-0 border-gray-100"
        >
          <div className="w-12 h-12 bg-gradient-to-br from-gray-50 to-indigo-50 rounded-lg overflow-hidden flex items-center justify-center">
            {item.image ? (
              <img src={item.image} alt={item.name} className="w-full h-full object-contain p-2" />
            ) : (
              <span className="text-xl">📦</span>
            )}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">{item.name}</p>
            <p className="text-xs text-gray-500 capitalize">{item.category || 'General'}</p>
          </div>
          <svg className="w-5 h-5 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M9 5l7 7-7 7" strokeWidth="2" />
          </svg>
        </motion.div>
      ))}
    </motion.div>
  )
}

// Premium Mobile Filters Modal
function PremiumMobileFiltersModal({ 
  categories, 
  selectedCategory, 
  setSelectedCategory, 
  minPrice, 
  setMinPrice, 
  maxPrice, 
  setMaxPrice, 
  authed, 
  onClose 
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 lg:hidden"
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30 }}
        className="absolute bottom-0 inset-x-0 bg-white/95 backdrop-blur-xl rounded-t-3xl overflow-hidden shadow-2xl"
        style={{ maxHeight: '85vh' }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-4 pb-2">
          <div className="h-1.5 w-16 rounded-full bg-gradient-to-r from-indigo-300 to-purple-300" />
        </div>
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-indigo-100">
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="h-10 w-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center"
          >
            <svg className="w-5 h-5 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M6 18L18 6M6 6l12 12" strokeWidth="2" />
            </svg>
          </motion.button>
        </div>
        
        {/* Content */}
        <div className="overflow-y-auto p-6 space-y-8" style={{ maxHeight: 'calc(85vh - 140px)' }}>
          
          {/* Categories */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-900">Categories</h4>
            <div className="grid grid-cols-2 gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { setSelectedCategory(''); onClose() }}
                className={`px-4 py-3 rounded-xl text-sm font-medium border-2 transition-all ${
                  selectedCategory === ''
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-indigo-300'
                }`}
              >
                All
              </motion.button>
              
              {categories.map(c => (
                <motion.button
                  key={c._id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { setSelectedCategory(c.name); onClose() }}
                  className={`px-4 py-3 rounded-xl text-sm font-medium border-2 transition-all capitalize ${
                    selectedCategory === c.name
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-indigo-300'
                  }`}
                >
                  {c.name}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-900">Price Range (₹)</h4>
            {!authed ? (
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4">
                <p className="text-sm text-indigo-600 font-medium flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Login to filter by price
                </p>
              </div>
            ) : (
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <input
                    type="number"
                    className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-400"
                    placeholder="Min"
                    value={minPrice}
                    onChange={e => setMinPrice(e.target.value)}
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400">₹</span>
                </div>
                <div className="relative flex-1">
                  <input
                    type="number"
                    className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-400"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={e => setMaxPrice(e.target.value)}
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400">₹</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Apply Button */}
        <div className="p-4 border-t border-indigo-100">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            className="w-full py-4 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-xl font-semibold shadow-lg"
          >
            Apply Filters
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}