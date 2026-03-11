import React, { useEffect, useMemo, useState, useRef, useCallback } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../../lib/api'
import { useCart, getStockStatus } from '../../lib/CartContext'
import { setSEO } from '../../shared/lib/seo.js'
import RecommendationModal from '../../components/RecommendationModal'

// Premium Animation Variants
const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -30 }
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
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
  const [viewMode, setViewMode] = useState('grid') // grid or list
  const [wishlist, setWishlist] = useState([])
  
  const searchRef = useRef(null)
  const limit = 12

  // Load wishlist from localStorage
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('wishlist') || '[]')
      setWishlist(saved)
    } catch {}
  }, [])

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
    const baseTitle = 'Luxury B2B Collection | Click2Kart'
    const title = selectedCategory 
      ? `${selectedCategory} · Wholesale Luxury | Click2Kart` 
      : (searchQuery ? `Search: ${searchQuery} | Click2Kart` : baseTitle)
    
    setSEO(
      title, 
      'Discover premium wholesale products with exclusive B2B pricing, GST billing, and luxury bulk discounts.'
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 font-sans">
      
      {/* Premium Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ 
            x: [0, 100, 0],
            y: [0, -100, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{ 
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-indigo-300/20 to-purple-300/20 rounded-full mix-blend-multiply filter blur-3xl"
        />
        <motion.div 
          animate={{ 
            x: [0, -100, 0],
            y: [0, 100, 0],
            scale: [1, 1.3, 1]
          }}
          transition={{ 
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-blue-300/20 to-cyan-300/20 rounded-full mix-blend-multiply filter blur-3xl"
        />
        <motion.div 
          animate={{ 
            x: [0, 50, 0],
            y: [0, -50, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 18,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-pink-300/20 to-rose-300/20 rounded-full mix-blend-multiply filter blur-3xl"
        />
      </div>

      {/* Premium Glass Header */}
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
        className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-2xl shadow-indigo-500/5"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Mobile Header */}
          <div className="lg:hidden py-3">
            <div className="relative">
              <motion.div 
                whileFocus={{ scale: 1.02 }}
                className="relative"
              >
                <input
                  ref={searchRef}
                  className="w-full bg-white/90 backdrop-blur border border-indigo-100 text-gray-900 placeholder-gray-400 text-sm rounded-2xl pl-12 pr-12 py-4 outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all shadow-lg"
                  placeholder="Search luxury products..."
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
              </motion.div>

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
              <CategoryChip 
                label="All Collections"
                icon="✨"
                active={selectedCategory === ''}
                onClick={() => setSelectedCategory('')}
              />
              {categories.map(c => (
                <CategoryChip 
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
          <div className="hidden lg:flex items-center justify-between py-6 gap-8">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="relative"
            >
              <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                LUXURY B2B COLLECTION
              </p>
              <h1 className="text-4xl font-black text-gray-900 tracking-tight mt-2">
                Wholesale <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Premium</span>
              </h1>
              <motion.div 
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.5, 0.3]
                }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-r from-indigo-400/20 to-purple-400/20 rounded-full blur-2xl"
              />
            </motion.div>
            
            <div className="flex items-center gap-4 flex-1 max-w-3xl">
              <div className="relative flex-1">
                <motion.div 
                  whileFocus={{ scale: 1.02 }}
                  className="relative"
                >
                  <input
                    ref={searchRef}
                    className="w-full bg-white/90 backdrop-blur border border-indigo-100 text-gray-900 text-sm rounded-2xl pl-14 pr-14 py-5 outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all shadow-lg"
                    placeholder="Search products, brands, collections..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    onFocus={() => searchQuery.trim().length >= 2 && setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                  />
                  
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
                        className="absolute right-4 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-indigo-50 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-100 flex items-center justify-center transition-all"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M18.3 5.71 12 12l6.3 6.29-1.41 1.42L10.59 13.4 4.3 19.71 2.89 18.3 9.17 12 2.89 5.71 4.3 4.29l6.29 6.3 6.3-6.3z" />
                        </svg>
                      </motion.button>
                    )}
                  </AnimatePresence>
                </motion.div>

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
              
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="relative"
              >
                <select
                  className="appearance-none bg-white/90 backdrop-blur border border-indigo-100 text-gray-800 text-sm rounded-2xl pl-6 pr-14 py-5 outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all font-bold cursor-pointer shadow-lg min-w-[200px]"
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                >
                  <option value="NEW" className="py-3">✨ Newest Arrivals</option>
                  {authed && <option value="PRICE_LOW" className="py-3">💰 Price: Low → High</option>}
                  {authed && <option value="PRICE_HIGH" className="py-3">💎 Price: High → Low</option>}
                </select>
                
                <motion.div 
                  animate={{ rotate: 180 }}
                  className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none"
                >
                  <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </motion.div>
              </motion.div>

              {/* View Mode Toggle */}
              <motion.div 
                className="flex items-center gap-2 bg-white/90 backdrop-blur rounded-2xl p-1 border border-indigo-100 shadow-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setViewMode('grid')}
                  className={`p-3 rounded-xl transition-all ${
                    viewMode === 'grid' 
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg' 
                      : 'text-gray-400 hover:text-indigo-600'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setViewMode('list')}
                  className={`p-3 rounded-xl transition-all ${
                    viewMode === 'list' 
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg' 
                      : 'text-gray-400 hover:text-indigo-600'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </motion.button>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto relative z-10 px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
        <div className="lg:grid lg:grid-cols-[300px_1fr] lg:gap-8">

          {/* Premium Desktop Sidebar */}
          <motion.aside 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="hidden lg:block"
          >
            <div className="sticky top-32 space-y-8">
              
              {/* Sort Section */}
              <motion.div 
                variants={fadeInUp}
                className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl shadow-indigo-500/5"
              >
                <p className="text-[9px] font-black text-indigo-600 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                  <span className="w-8 h-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full" />
                  SORT BY
                </p>
                
                <div className="space-y-2">
                  {[
                    { value: 'NEW', label: 'Newest First', icon: '✨', gradient: 'from-indigo-500 to-purple-500' },
                    ...(authed ? [
                      { value: 'PRICE_LOW', label: 'Price: Low to High', icon: '💰', gradient: 'from-emerald-500 to-teal-500' },
                      { value: 'PRICE_HIGH', label: 'Price: High to Low', icon: '💎', gradient: 'from-amber-500 to-orange-500' }
                    ] : [])
                  ].map(option => (
                    <motion.button
                      key={option.value}
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSortBy(option.value)}
                      className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-bold transition-all duration-300 text-left relative overflow-hidden group ${
                        sortBy === option.value
                          ? `bg-gradient-to-r ${option.gradient} text-white shadow-lg`
                          : 'text-gray-600 hover:bg-white/80 hover:shadow-md'
                      }`}
                    >
                      <span className={`text-lg transition-transform group-hover:scale-110 ${
                        sortBy === option.value ? 'text-white' : 'text-indigo-400'
                      }`}>
                        {option.icon}
                      </span>
                      <span className="relative z-10">{option.label}</span>
                      
                      {sortBy === option.value && (
                        <motion.div
                          layoutId="activeSort"
                          className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 -z-10"
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                    </motion.button>
                  ))}
                </div>
              </motion.div>

              {/* Categories Section */}
              <motion.div 
                variants={fadeInUp}
                className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl shadow-indigo-500/5"
              >
                <p className="text-[9px] font-black text-indigo-600 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                  <span className="w-8 h-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full" />
                  CATEGORIES
                </p>
                
                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-indigo-200 scrollbar-track-transparent">
                  <CategoryItem
                    label="All Collections"
                    icon="✨"
                    count={totalProducts}
                    active={selectedCategory === ''}
                    onClick={() => setSelectedCategory('')}
                  />
                  
                  {categories.map(c => (
                    <CategoryItem
                      key={c._id}
                      label={c.name}
                      image={c.image}
                      count={c.productCount || 0}
                      active={selectedCategory === c.name}
                      onClick={() => setSelectedCategory(c.name)}
                    />
                  ))}
                </div>
              </motion.div>

              {/* Price Range Section */}
              <motion.div 
                variants={fadeInUp}
                className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl shadow-indigo-500/5"
              >
                <p className="text-[9px] font-black text-indigo-600 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                  <span className="w-8 h-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full" />
                  PRICE RANGE (₹)
                </p>
                
                {!authed ? (
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100"
                  >
                    <p className="text-xs text-indigo-600 font-medium flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Login to filter by price
                    </p>
                  </motion.div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <div className="relative flex-1">
                        <input
                          className="w-full bg-white/80 backdrop-blur border border-indigo-100 rounded-xl px-4 py-3.5 text-sm font-bold text-gray-900 placeholder-gray-400 outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all"
                          placeholder="Min"
                          value={minPrice}
                          onChange={e => setMinPrice(e.target.value)}
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400 text-xs font-bold">₹</span>
                      </div>
                      <div className="relative flex-1">
                        <input
                          className="w-full bg-white/80 backdrop-blur border border-indigo-100 rounded-xl px-4 py-3.5 text-sm font-bold text-gray-900 placeholder-gray-400 outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all"
                          placeholder="Max"
                          value={maxPrice}
                          onChange={e => setMaxPrice(e.target.value)}
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400 text-xs font-bold">₹</span>
                      </div>
                    </div>
                    
                    {(minPrice || maxPrice) && (
                      <motion.button
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={() => { setMinPrice(''); setMaxPrice('') }}
                        className="w-full py-2 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                      >
                        Clear filters
                      </motion.button>
                    )}
                  </div>
                )}
              </motion.div>

              {/* Stats Card */}
              <motion.div 
                variants={fadeInUp}
                className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl p-6 text-white shadow-2xl"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-black uppercase tracking-wider opacity-80">Total Products</span>
                  <motion.span 
                    key={totalProducts}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-3xl font-black"
                  >
                    {totalProducts}
                  </motion.span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="opacity-80">Current Page</span>
                  <span className="font-bold">{currentPage} of {totalPages}</span>
                </div>
                
                <motion.div 
                  className="w-full h-1 bg-white/20 rounded-full mt-4 overflow-hidden"
                  initial={{ width: 0 }}
                  animate={{ width: `${(currentPage / totalPages) * 100}%` }}
                >
                  <div className="h-full bg-white rounded-full" />
                </motion.div>
              </motion.div>
            </div>
          </motion.aside>

          {/* Main Content Area */}
          <main className="lg:col-span-1">
            
            {/* Mobile Action Bar */}
            <div className="lg:hidden flex items-center gap-3 mb-6">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setFiltersOpen(true)}
                className="flex items-center gap-3 px-5 py-3.5 rounded-xl bg-white/90 backdrop-blur border border-indigo-100 text-xs font-black uppercase tracking-widest text-indigo-600 shadow-lg hover:shadow-xl transition-all"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M3 6h18M7 12h10M10 18h4" />
                </svg>
                Filters
              </motion.button>
              
              <div className="flex-1 overflow-x-auto scrollbar-none">
                <div className="flex gap-2">
                  {[
                    { value: 'NEW', label: '✨ Newest' },
                    ...(authed ? [
                      { value: 'PRICE_LOW', label: '💰 Low→High' },
                      { value: 'PRICE_HIGH', label: '💎 High→Low' }
                    ] : [])
                  ].map(option => (
                    <motion.button
                      key={option.value}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSortBy(option.value)}
                      className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 border-2 ${
                        sortBy === option.value
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-transparent shadow-lg'
                          : 'bg-white/80 backdrop-blur text-gray-600 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50'
                      }`}
                    >
                      {option.label}
                    </motion.button>
                  ))}
                </div>
              </div>
              
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="text-xs font-black text-indigo-600 bg-gradient-to-r from-indigo-50 to-purple-50 px-3 py-2 rounded-xl whitespace-nowrap border border-indigo-100"
              >
                {totalProducts} items
              </motion.div>
            </div>

            {/* Desktop Result Header */}
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="hidden lg:flex items-center justify-between mb-8"
            >
              <div>
                <p className="text-sm font-medium text-gray-500 flex items-center gap-2">
                  <motion.span 
                    key={totalProducts}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600"
                  >
                    {totalProducts}
                  </motion.span>
                  <span>products found</span>
                  {selectedCategory && (
                    <motion.span 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="ml-2 inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-full text-sm font-bold text-indigo-600 border border-indigo-100"
                    >
                      {selectedCategory}
                      <button 
                        onClick={() => setSelectedCategory('')}
                        className="ml-1 hover:text-indigo-800"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path d="M6 18L18 6M6 6l12 12" strokeWidth="2" />
                        </svg>
                      </button>
                    </motion.span>
                  )}
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map(i => (
                    <motion.div
                      key={i}
                      className={`w-2 h-2 rounded-full ${
                        i === currentPage ? 'bg-indigo-600' : 'bg-gray-200'
                      }`}
                      animate={i === currentPage ? { scale: [1, 1.5, 1] } : {}}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                  ))}
                </div>
                <span className="text-sm font-bold text-gray-400">
                  Page {currentPage} of {totalPages}
                </span>
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
                  className={`grid gap-4 sm:gap-6 ${
                    viewMode === 'grid'
                      ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4'
                      : 'grid-cols-1'
                  }`}
                >
                  {Array.from({ length: 8 }).map((_, i) => (
                    <SkeletonCard key={i} viewMode={viewMode} />
                  ))}
                </motion.div>
              )}

              {/* Product Grid */}
              {!loading && filteredProducts.length > 0 && (
                <motion.div
                  key="products"
                  variants={staggerContainer}
                  initial="initial"
                  animate="animate"
                  className={`grid gap-4 sm:gap-6 ${
                    viewMode === 'grid'
                      ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4'
                      : 'grid-cols-1'
                  }`}
                >
                  {filteredProducts.map((product, index) => (
                    <PremiumProductCard
                      key={product._id}
                      product={product}
                      index={index}
                      authed={authed}
                      wishlist={wishlist}
                      setWishlist={setWishlist}
                      onAddToCart={() => handleAddToCart(product)}
                      onNavigate={() => navigate(`/products/${product._id}`)}
                      viewMode={viewMode}
                    />
                  ))}
                </motion.div>
              )}

              {/* Empty State */}
              {!loading && filteredProducts.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="py-32 flex flex-col items-center justify-center text-center"
                >
                  <div className="relative">
                    <motion.div
                      animate={{ 
                        rotate: [0, 360],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{ duration: 20, repeat: Infinity }}
                      className="h-40 w-40 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-6xl mb-8 shadow-2xl"
                    >
                      🔍
                    </motion.div>
                    <motion.div
                      animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute -top-2 -right-2 h-12 w-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 opacity-50 blur-xl"
                    />
                  </div>
                  
                  <h3 className="text-3xl font-black text-gray-900 mb-3">No products found</h3>
                  <p className="text-gray-500 max-w-md mb-8 text-lg">
                    We couldn't find any products matching your criteria.
                  </p>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => { 
                      setSelectedCategory(''); 
                      setSearchQuery(''); 
                      setMinPrice(''); 
                      setMaxPrice('') 
                    }}
                    className="px-10 py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-2xl shadow-indigo-500/30 hover:shadow-xl transition-all duration-300"
                  >
                    Clear All Filters
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
                  className="flex flex-col items-center justify-center gap-4 pt-12 pb-8"
                >
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => loadProducts(currentPage + 1)}
                    className="px-12 py-5 bg-white border-2 border-indigo-100 text-indigo-600 rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl hover:border-indigo-300 hover:shadow-2xl transition-all duration-300 flex items-center gap-3 group"
                  >
                    <span>Load More Products</span>
                    <motion.svg
                      animate={{ y: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="w-5 h-5 group-hover:translate-y-1 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                    </motion.svg>
                  </motion.button>
                  
                  <p className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">
                    Showing {products.length} of {totalProducts} Products
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* End of Collection */}
            <AnimatePresence>
              {!loading && currentPage * limit >= totalProducts && totalProducts > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="pt-12 pb-8 text-center"
                >
                  <div className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-gray-50 to-indigo-50/50 border border-indigo-100 text-gray-400 text-xs font-bold shadow-lg">
                    <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    You've reached the end of the collection
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>

      {/* Premium Mobile Filters Modal */}
      <AnimatePresence>
        {filtersOpen && (
          <MobileFiltersModal
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
function CategoryChip({ label, icon, image, active, onClick }) {
  return (
    <motion.button
      variants={fadeInUp}
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 border-2 flex items-center gap-2 ${
        active
          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-transparent shadow-lg shadow-indigo-500/30'
          : 'bg-white/80 backdrop-blur text-gray-700 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50'
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

// Premium Category Item Component
function CategoryItem({ label, icon, image, count, active, onClick }) {
  return (
    <motion.button
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-bold transition-all duration-300 text-left relative overflow-hidden group ${
        active
          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
          : 'text-gray-600 hover:bg-white/80 hover:shadow-md'
      }`}
    >
      <div className={`h-10 w-10 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0 transition-all ${
        active 
          ? 'bg-white/20' 
          : 'bg-indigo-50 group-hover:bg-indigo-100'
      }`}>
        {image ? (
          <img src={image} alt={label} className="h-full w-full object-contain p-2" />
        ) : (
          <span className="text-lg">{icon || '📦'}</span>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="font-bold truncate capitalize">{label}</div>
        <div className={`text-[10px] mt-1 ${
          active ? 'text-indigo-200' : 'text-gray-400'
        }`}>
          {count} products
        </div>
      </div>
      
      {active && (
        <motion.div
          layoutId="activeCategory"
          className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 -z-10"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}
    </motion.button>
  )
}

// Premium Suggestions List Component
function SuggestionsList({ items, onSelect }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const navigate = useNavigate()
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-white/95 backdrop-blur-xl rounded-2xl border border-indigo-100 shadow-2xl overflow-hidden"
      onKeyDown={e => {
        if (e.key === 'ArrowDown') {
          e.preventDefault()
          setActiveIndex(i => Math.min(items.length - 1, i + 1))
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault()
          setActiveIndex(i => Math.max(0, i - 1))
        }
        if (e.key === 'Enter') {
          e.preventDefault()
          navigate(`/products/${items[activeIndex]?.id}`)
          onSelect()
        }
      }}
      tabIndex={0}
    >
      <div className="py-2">
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            whileHover={{ backgroundColor: 'rgba(79, 70, 229, 0.05)' }}
            onHoverStart={() => setActiveIndex(index)}
            onClick={() => {
              navigate(`/products/${item.id}`)
              onSelect()
            }}
            className={`flex items-center gap-4 px-5 py-4 cursor-pointer transition-all duration-300 ${
              index === activeIndex 
                ? 'bg-gradient-to-r from-indigo-50 to-purple-50 scale-[1.02]' 
                : ''
            }`}
          >
            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 overflow-hidden flex items-center justify-center flex-shrink-0">
              {item.image ? (
                <img src={item.image} alt={item.name} className="h-full w-full object-contain p-2" />
              ) : (
                <span className="text-2xl text-gray-400">📦</span>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-gray-900 truncate">{item.name}</div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-400 font-medium capitalize">{item.category || 'General'}</span>
                {item.price && (
                  <>
                    <span className="text-gray-300">•</span>
                    <span className="text-xs font-bold text-indigo-600">₹{item.price}</span>
                  </>
                )}
              </div>
            </div>
            
            <motion.div
              animate={{ x: index === activeIndex ? 5 : 0 }}
              className="text-indigo-400"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 5l7 7-7 7" />
              </svg>
            </motion.div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

// Premium Product Card Component
function PremiumProductCard({ product, index, authed, wishlist, setWishlist, onAddToCart, onNavigate, viewMode }) {
  const [isHovered, setIsHovered] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  
  const isWishlisted = wishlist.includes(product._id)
  const discount = product.mrp && product.mrp > product.price
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
    : 0
  const status = getStockStatus(product.stock)

  const toggleWishlist = (e) => {
    e.stopPropagation()
    e.preventDefault()
    
    const updated = isWishlisted
      ? wishlist.filter(id => id !== product._id)
      : [...wishlist, product._id]
    
    setWishlist(updated)
    localStorage.setItem('wishlist', JSON.stringify(updated))
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

  if (viewMode === 'list') {
    return (
      <motion.div
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        whileHover={{ y: -4 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        onClick={onNavigate}
        className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer border border-slate-100 hover:border-indigo-100 relative"
      >
        <div className="flex gap-4 p-4">
          {/* Image */}
          <div className="relative w-32 h-32 flex-shrink-0">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl overflow-hidden">
              {!imageLoaded && (
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-100 to-purple-100 animate-pulse" />
              )}
              {product.images && product.images.length > 0 ? (
                <motion.img
                  src={product.images[0].url}
                  alt={product.name}
                  onLoad={() => setImageLoaded(true)}
                  className={`w-full h-full object-contain p-3 transition-all duration-700 ${
                    isHovered ? 'scale-110' : 'scale-100'
                  } ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl text-gray-300">
                  📦
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-xs font-bold text-indigo-600 mb-1 capitalize">
                  {product.category || 'General'}
                </div>
                <h3 className="text-base font-bold text-gray-900 line-clamp-1">
                  {product.name}
                </h3>
              </div>
              
              <div className="flex items-center gap-2">
                {discount > 0 && (
                  <div className="px-2 py-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[10px] font-black rounded-md">
                    -{discount}%
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 mt-2">
              {/* Rating */}
              {product.ratingCount > 0 && (
                <div className="flex items-center gap-1">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map(star => (
                      <svg
                        key={star}
                        className={`w-3 h-3 ${star <= Math.round(product.ratingAvg || 0) ? 'text-amber-400' : 'text-gray-200'}`}
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M12 .587l3.668 7.431L24 9.748l-6 5.848L19.335 24 12 19.771 4.665 24 6 15.596 0 9.748l8.332-1.73z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-xs font-bold text-gray-700">
                    {product.ratingAvg?.toFixed(1)}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    ({product.ratingCount})
                  </span>
                </div>
              )}

              {/* Stock */}
              <div className={`text-[10px] font-bold px-2 py-1 rounded-md ${status.bg} ${status.color} border ${status.border}`}>
                {status.text}
              </div>
            </div>

            {/* Price and Actions */}
            <div className="flex items-center justify-between mt-3">
              <div>
                {authed && product.price != null ? (
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-black text-gray-900">
                      ₹{product.price.toLocaleString()}
                    </span>
                    {product.mrp > product.price && (
                      <span className="text-sm text-gray-400 line-through">
                        ₹{product.mrp.toLocaleString()}
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-sm font-bold text-gray-400">Login to view price</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={toggleWishlist}
                  className={`p-2 rounded-xl transition-all ${
                    isWishlisted
                      ? 'text-rose-500 bg-rose-50'
                      : 'text-gray-400 hover:text-rose-500 hover:bg-rose-50'
                  }`}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill={isWishlisted ? "currentColor" : "none"} stroke="currentColor" strokeWidth={isWishlisted ? "0" : "2"}>
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 6 4 4 6.5 4c1.74 0 3.41 1.01 4.22 2.5C11.09 5.01 12.76 4 14.5 4 17 4 19 6 19 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleAddToCart}
                  disabled={!authed || product.stock <= 0 || isAdding}
                  className={`p-2 rounded-xl transition-all ${
                    authed && product.stock > 0
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg hover:shadow-xl'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {isAdding ? (
                    <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M7 6h13l-1.2 7H9.2L7 6Z" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="10" cy="19" r="1.4" fill="currentColor" />
                      <circle cx="17" cy="19" r="1.4" fill="currentColor" />
                    </svg>
                  )}
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      variants={fadeInUp}
      initial="initial"
      animate="animate"
      whileHover={{ y: -8 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onNavigate}
      className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 cursor-pointer border border-slate-100 hover:border-indigo-100 relative"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Premium Gradient Overlay */}
      <motion.div 
        animate={{ opacity: isHovered ? 1 : 0 }}
        className="absolute inset-0 bg-gradient-to-t from-indigo-600/5 via-transparent to-transparent pointer-events-none z-10"
      />

      {/* Image Container */}
      <div className="relative aspect-square bg-gradient-to-br from-indigo-50 to-purple-50 overflow-hidden">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-100 to-purple-100 animate-pulse" />
        )}
        
        {product.images && product.images.length > 0 ? (
          <motion.img
            src={product.images[0].url}
            alt={product.name}
            onLoad={() => setImageLoaded(true)}
            className={`w-full h-full object-contain p-6 transition-all duration-700 ${
              isHovered ? 'scale-110 rotate-2' : 'scale-100'
            } ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl text-gray-300">
            📦
          </div>
        )}

        {/* Premium Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-20">
          {authed && product.bulkDiscountQuantity > 0 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[10px] font-black px-3 py-1.5 rounded-lg shadow-lg shadow-emerald-500/30"
            >
              BULK OFFER
            </motion.div>
          )}
          
          {discount > 0 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-black px-3 py-1.5 rounded-lg shadow-lg shadow-amber-500/30"
            >
              -{discount}% OFF
            </motion.div>
          )}
        </div>

        {/* Action Buttons */}
        <motion.div 
          animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : 10 }}
          className="absolute top-3 right-3 flex flex-col gap-2 z-20"
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleWishlist}
            className={`h-10 w-10 rounded-xl bg-white/90 backdrop-blur shadow-lg flex items-center justify-center transition-all ${
              isWishlisted ? 'text-rose-500' : 'text-gray-400 hover:text-rose-500'
            }`}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill={isWishlisted ? "currentColor" : "none"} stroke="currentColor" strokeWidth={isWishlisted ? "0" : "2"}>
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 6 4 4 6.5 4c1.74 0 3.41 1.01 4.22 2.5C11.09 5.01 12.76 4 14.5 4 17 4 19 6 19 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </motion.button>
        </motion.div>

        {/* Quick View Indicator */}
        <motion.div 
          animate={{ scaleX: isHovered ? 1 : 0 }}
          className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-600 to-purple-600 origin-left"
        />
      </div>

      {/* Content */}
      <div className="p-4 relative z-10">
        {/* Category & Rating */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md capitalize">
            {product.category || 'General'}
          </span>
          
          {product.ratingCount > 0 && (
            <div className="flex items-center gap-1">
              <div className="flex">
                {[1, 2, 3, 4, 5].map(star => (
                  <svg
                    key={star}
                    className={`w-3 h-3 ${star <= Math.round(product.ratingAvg || 0) ? 'text-amber-400' : 'text-gray-200'}`}
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 .587l3.668 7.431L24 9.748l-6 5.848L19.335 24 12 19.771 4.665 24 6 15.596 0 9.748l8.332-1.73z" />
                  </svg>
                ))}
              </div>
              <span className="text-xs font-bold text-gray-700">{product.ratingAvg?.toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* Product Name */}
        <h3 className="text-sm font-bold text-gray-900 line-clamp-2 min-h-[2.5rem] mb-3 group-hover:text-indigo-600 transition-colors">
          {product.name}
        </h3>

        {/* Price & Cart */}
        <div className="flex items-end justify-between gap-2">
          <div>
            {authed && product.price != null ? (
              <>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-black text-gray-900">
                    ₹{product.price.toLocaleString()}
                  </span>
                  {product.mrp > product.price && (
                    <span className="text-xs text-gray-400 line-through">
                      ₹{product.mrp.toLocaleString()}
                    </span>
                  )}
                </div>
                {product.gst > 0 && (
                  <div className="text-[8px] font-bold text-emerald-600 mt-1">
                    +{product.gst}% GST
                  </div>
                )}
              </>
            ) : (
              <span className="text-xs font-bold text-gray-400">Login to view price</span>
            )}
          </div>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleAddToCart}
            disabled={!authed || product.stock <= 0 || isAdding}
            className={`h-10 w-10 rounded-xl flex items-center justify-center shadow-lg transition-all ${
              authed && product.stock > 0
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-xl'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isAdding ? (
              <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M7 6h13l-1.2 7H9.2L7 6Z" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="10" cy="19" r="1.4" fill="currentColor" />
                <circle cx="17" cy="19" r="1.4" fill="currentColor" />
              </svg>
            )}
          </motion.button>
        </div>

        {/* Stock Status */}
        <div className="flex items-center gap-1.5 mt-3">
          <div className={`text-[8px] font-bold px-2 py-1 rounded-md ${status.bg} ${status.color} border ${status.border}`}>
            {status.text}
          </div>
          <div className="text-[8px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md border border-indigo-100 flex items-center gap-0.5">
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M13 10V3L4 14h7v7l9-11h-7z" strokeWidth="2" />
            </svg>
            Fast
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// Premium Skeleton Card
function SkeletonCard({ viewMode }) {
  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-2xl p-4 border border-slate-100 animate-pulse">
        <div className="flex gap-4">
          <div className="w-32 h-32 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-xl" />
          <div className="flex-1 space-y-3">
            <div className="h-4 bg-indigo-100 rounded w-1/4" />
            <div className="h-6 bg-indigo-100 rounded w-3/4" />
            <div className="h-4 bg-indigo-100 rounded w-1/2" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 animate-pulse">
      <div className="aspect-square bg-gradient-to-br from-indigo-100 to-purple-100" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-indigo-100 rounded w-1/3" />
        <div className="h-5 bg-indigo-100 rounded w-3/4" />
        <div className="h-8 bg-indigo-100 rounded w-1/2" />
      </div>
    </div>
  )
}

// Mobile Filters Modal
function MobileFiltersModal({ 
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
          <motion.div 
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 100) onClose()
            }}
            className="h-1.5 w-16 rounded-full bg-gradient-to-r from-indigo-300 to-purple-300 cursor-grab active:cursor-grabbing"
          />
        </div>
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-indigo-100">
          <span className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 uppercase tracking-widest flex items-center gap-2">
            <svg className="w-5 h-5 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M3 6h18M7 12h10M10 18h4" strokeWidth="2.5" />
            </svg>
            Filters
          </span>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="h-10 w-10 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 flex items-center justify-center hover:bg-indigo-100 transition-all"
          >
            <svg className="w-5 h-5 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </motion.button>
        </div>
        
        {/* Content */}
        <div className="overflow-y-auto p-6 space-y-8" style={{ maxHeight: 'calc(85vh - 120px)' }}>
          {/* Categories */}
          <div className="space-y-4">
            <p className="text-[9px] font-black text-indigo-600 uppercase tracking-[0.3em] flex items-center gap-2">
              <span className="w-6 h-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full" />
              CATEGORIES
            </p>
            
            <div className="grid grid-cols-2 gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { setSelectedCategory(''); onClose() }}
                className={`px-4 py-4 rounded-xl text-sm font-black border-2 transition-all duration-300 text-center ${
                  selectedCategory === ''
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-transparent shadow-lg'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50'
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
                  className={`px-4 py-4 rounded-xl text-sm font-black border-2 transition-all duration-300 text-center capitalize ${
                    selectedCategory === c.name
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-transparent shadow-lg'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50'
                  }`}
                >
                  {c.name}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="space-y-4">
            <p className="text-[9px] font-black text-indigo-600 uppercase tracking-[0.3em] flex items-center gap-2">
              <span className="w-6 h-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full" />
              PRICE RANGE (₹)
            </p>
            
            {!authed ? (
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100">
                <p className="text-xs text-indigo-600 font-medium flex items-center gap-2">
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
                    className="w-full bg-white border-2 border-indigo-100 rounded-xl px-4 py-4 text-sm font-bold outline-none focus:border-indigo-400 transition-all"
                    placeholder="Min"
                    value={minPrice}
                    onChange={e => setMinPrice(e.target.value)}
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400 font-bold">₹</span>
                </div>
                <div className="relative flex-1">
                  <input
                    className="w-full bg-white border-2 border-indigo-100 rounded-xl px-4 py-4 text-sm font-bold outline-none focus:border-indigo-400 transition-all"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={e => setMaxPrice(e.target.value)}
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400 font-bold">₹</span>
                </div>
              </div>
            )}
          </div>

          {/* Apply Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            className="w-full py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-2xl shadow-indigo-500/30 hover:shadow-xl transition-all duration-300"
          >
            Apply Filters
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}