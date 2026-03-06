import React, { useEffect, useMemo, useState, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import api from '../../lib/api'
import { useCart, getStockStatus } from '../../lib/CartContext'
import { setSEO } from '../../shared/lib/seo.js'

export default function Catalogue() {
  const { addToCart } = useCart()
  const authed = !!localStorage.getItem('token')
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [sug, setSug] = useState([])
  const [showSug, setShowSug] = useState(false)
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [categories, setCategories] = useState([])
  const [category, setCategory] = useState('')
  const [sort, setSort] = useState('NEW')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [loading, setLoading] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)
  const location = useLocation()
  const limit = 12
  const searchRef = useRef(null)

  const load = async (p = 1) => {
    setLoading(true)
    try {
      const { data } = await api.get('/api/products', {
        params: { q, page: p, limit, category: category || undefined },
      })
      setItems(data.items)
      setTotal(data.total)
      setPage(p)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load(1) }, [q, category])
  useEffect(() => {
    api.get('/api/public/categories').then(({ data }) => setCategories(data))
  }, [])
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const cat = params.get('category')
    if (cat) setCategory(cat)
  }, [location.search])

  useEffect(() => {
    let t
    if (q.trim().length >= 2) {
      t = setTimeout(async () => {
        try {
          const { data } = await api.get('/api/products/suggest', { params: { q } })
          setSug(data || [])
          setShowSug(true)
        } catch { setSug([]) }
      }, 250)
    } else {
      setSug([])
      setShowSug(false)
    }
    return () => t && clearTimeout(t)
  }, [q])

  useEffect(() => {
      const baseTitle = 'B2B Collection | Click2Kart'
      const title = category ? `${category} · Wholesale | Click2Kart` : (q ? `Search: ${q} | Click2Kart` : baseTitle)
      setSEO(title, 'Discover quality wholesale electronics with exclusive B2B pricing, GST billing, and bulk discounts.')
    }, [q, category])

  const filteredSorted = useMemo(() => {
    let list = [...items]
    if (authed) {
      const min = Number(minPrice)
      const max = Number(maxPrice)
      if (!Number.isNaN(min) && minPrice !== '') list = list.filter(p => (p.price ?? Infinity) >= min)
      if (!Number.isNaN(max) && maxPrice !== '') list = list.filter(p => (p.price ?? -Infinity) <= max)
      if (sort === 'PRICE_LOW') list.sort((a, b) => (a.price ?? 0) - (b.price ?? 0))
      if (sort === 'PRICE_HIGH') list.sort((a, b) => (b.price ?? 0) - (a.price ?? 0))
    }
    if (sort === 'NEW') list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    return list
  }, [items, minPrice, maxPrice, sort, authed])

  const totalPages = Math.max(1, Math.ceil(total / limit))

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      
      {/* Premium Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>

      {/* ── PREMIUM STICKY TOP SEARCH BAR (mobile) ── */}
      <div className="lg:hidden sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-lg">
        <div className="px-4 py-3">
          <div className="relative">
            <input
              ref={searchRef}
              className="w-full bg-white/90 backdrop-blur border border-indigo-100 text-gray-900 placeholder-gray-400 text-sm rounded-2xl pl-12 pr-12 py-4 outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all shadow-md"
              placeholder="Search products..."
              value={q}
              onChange={e => setQ(e.target.value)}
              onFocus={() => { setSearchFocused(true); q.trim().length >= 2 && setShowSug(true) }}
              onBlur={() => { setTimeout(() => { setShowSug(false); setSearchFocused(false) }, 150) }}
            />
            <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {q && (
              <button
                onClick={() => { setQ(''); setSug([]); setShowSug(false) }}
                className="absolute right-4 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-indigo-50 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-100 flex items-center justify-center transition-all"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.3 5.71 12 12l6.3 6.29-1.41 1.42L10.59 13.4 4.3 19.71 2.89 18.3 9.17 12 2.89 5.71 4.3 4.29l6.29 6.3 6.3-6.3z" />
                </svg>
              </button>
            )}
            {showSug && sug.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 z-50">
                <SuggestList items={sug} />
              </div>
            )}
          </div>
        </div>

        {/* Premium Category Chips */}
        <div className="flex gap-2 px-4 pb-4 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setCategory('')}
            className={`flex-shrink-0 px-5 py-2.5 rounded-full text-xs font-bold transition-all duration-300 border-2 ${category === ''
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-500/30 scale-105'
              : 'bg-white/80 backdrop-blur text-gray-700 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50'}`}
          >
            All Collections
          </button>
          {categories.map(c => (
            <button
              key={c._id}
              onClick={() => setCategory(c.name)}
              className={`flex-shrink-0 px-5 py-2.5 rounded-full text-xs font-bold transition-all duration-300 border-2 capitalize ${category === c.name
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-500/30 scale-105'
                : 'bg-white/80 backdrop-blur text-gray-700 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50'}`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* ── PREMIUM DESKTOP HEADER ── */}
      <div className="hidden lg:block bg-white/70 backdrop-blur-xl border-b border-white/20 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between gap-8">
          <div className="relative">
            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em]">Luxury Collection</p>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight mt-1">
              Premium <span className="text-indigo-600">Products</span>
            </h1>
            <div className="absolute -top-2 -right-4 w-12 h-12 bg-indigo-100 rounded-full blur-2xl opacity-60" />
          </div>
          
          <div className="flex items-center gap-4 flex-1 max-w-3xl">
            <div className="relative flex-1">
              <input
                ref={searchRef}
                className="w-full bg-white/90 backdrop-blur border border-indigo-100 text-gray-900 text-sm rounded-2xl pl-14 pr-14 py-4 outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all shadow-md"
                placeholder="Search products, brands, collections..."
                value={q}
                onChange={e => setQ(e.target.value)}
                onFocus={() => q.trim().length >= 2 && setShowSug(true)}
                onBlur={() => setTimeout(() => setShowSug(false), 150)}
              />
              <svg className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {q && (
                <button onClick={() => { setQ(''); setSug([]); setShowSug(false) }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-indigo-50 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-100 flex items-center justify-center transition-all">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.3 5.71 12 12l6.3 6.29-1.41 1.42L10.59 13.4 4.3 19.71 2.89 18.3 9.17 12 2.89 5.71 4.3 4.29l6.29 6.3 6.3-6.3z" /></svg>
                </button>
              )}
              {showSug && sug.length > 0 && <SuggestList items={sug} />}
            </div>
            
            <div className="relative">
              <select
                className="appearance-none bg-white/90 backdrop-blur border border-indigo-100 text-gray-800 text-sm rounded-2xl pl-6 pr-12 py-4 outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all font-bold cursor-pointer shadow-md min-w-[180px]"
                value={sort}
                onChange={e => setSort(e.target.value)}
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
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="lg:grid lg:grid-cols-[300px_1fr] lg:gap-0">

          {/* ── PREMIUM DESKTOP SIDEBAR ── */}
          <aside className="hidden lg:block bg-white/50 backdrop-blur border-r border-white/20 min-h-[calc(100vh-88px)]">
            <div className="sticky top-[88px] p-8 space-y-10">

              {/* Premium Sort Section */}
              <div className="space-y-4">
                <p className="text-[9px] font-black text-indigo-600 uppercase tracking-[0.3em] flex items-center gap-2">
                  <span className="w-6 h-0.5 bg-indigo-200 rounded-full" />
                  SORT BY
                </p>
                <div className="space-y-2">
                  {[
                    { v: 'NEW', l: 'Newest First', icon: '✨' },
                    ...(authed ? [
                      { v: 'PRICE_LOW', l: 'Price: Low to High', icon: '💰' },
                      { v: 'PRICE_HIGH', l: 'Price: High to Low', icon: '💎' }
                    ] : [])
                  ].map(opt => (
                    <button
                      key={opt.v}
                      onClick={() => setSort(opt.v)}
                      className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-xl text-sm font-bold transition-all duration-300 text-left group relative overflow-hidden ${
                        sort === opt.v
                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                          : 'text-gray-600 hover:bg-white/80 hover:shadow-md'
                      }`}
                    >
                      <span className={`text-lg ${sort === opt.v ? 'text-white' : 'text-indigo-400 group-hover:scale-110 transition-transform'}`}>
                        {opt.icon}
                      </span>
                      <span className="relative z-10">{opt.l}</span>
                      {sort === opt.v && (
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-indigo-500 animate-shimmer" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Premium Category Section */}
              <div className="space-y-4">
                <p className="text-[9px] font-black text-indigo-600 uppercase tracking-[0.3em] flex items-center gap-2">
                  <span className="w-6 h-0.5 bg-indigo-200 rounded-full" />
                  CATEGORIES
                </p>
                <div className="space-y-2 max-h-[320px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-indigo-200 scrollbar-track-transparent">
                  <button
                    onClick={() => setCategory('')}
                    className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl text-sm font-bold transition-all duration-300 text-left group ${
                      category === ''
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 scale-[1.02]'
                        : 'text-gray-600 hover:bg-white/80 hover:shadow-md hover:scale-[1.01]'
                    }`}
                  >
                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                      category === '' 
                        ? 'bg-indigo-500/30' 
                        : 'bg-indigo-50 group-hover:bg-indigo-100'
                    }`}>
                      <span className="text-xl">📋</span>
                    </div>
                    <div className="flex-1">
                      <div className="font-bold">All Collections</div>
                      <div className={`text-[10px] mt-1 ${
                        category === '' ? 'text-indigo-200' : 'text-gray-400'
                      }`}>
                        Browse everything
                      </div>
                    </div>
                    {category === '' && (
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                  
                  {categories.map(c => (
                    <button
                      key={c._id}
                      onClick={() => setCategory(c.name)}
                      className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl text-sm font-bold transition-all duration-300 text-left group capitalize ${
                        category === c.name
                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 scale-[1.02]'
                          : 'text-gray-600 hover:bg-white/80 hover:shadow-md hover:scale-[1.01]'
                      }`}
                    >
                      <div className={`h-12 w-12 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0 transition-all ${
                        category === c.name 
                          ? 'bg-indigo-500/30' 
                          : 'bg-indigo-50 group-hover:bg-indigo-100'
                      }`}>
                        {c.image
                          ? <img src={c.image} alt={c.name} className="h-full w-full object-contain p-2" />
                          : <span className="text-xl">📦</span>}
                      </div>
                      <div className="flex-1">
                        <div className="font-bold">{c.name}</div>
                        <div className={`text-[10px] mt-1 ${
                          category === c.name ? 'text-indigo-200' : 'text-gray-400'
                        }`}>
                          Premium collection
                        </div>
                      </div>
                      {category === c.name && (
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Premium Price Range */}
              <div className="space-y-4">
                <p className="text-[9px] font-black text-indigo-600 uppercase tracking-[0.3em] flex items-center gap-2">
                  <span className="w-6 h-0.5 bg-indigo-200 rounded-full" />
                  PRICE RANGE (₹)
                </p>
                
                {!authed && (
                  <div className="bg-indigo-50/80 backdrop-blur rounded-xl p-4 border border-indigo-100">
                    <p className="text-xs text-indigo-600 font-medium flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Login to filter by price
                    </p>
                  </div>
                )}
                
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <input
                      disabled={!authed}
                      className="w-full bg-white/80 backdrop-blur border border-indigo-100 rounded-xl px-4 py-3.5 text-sm font-bold text-gray-900 placeholder-gray-400 outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all disabled:opacity-40"
                      placeholder="Min"
                      value={minPrice}
                      onChange={e => setMinPrice(e.target.value)}
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400 text-xs">₹</span>
                  </div>
                  <div className="relative flex-1">
                    <input
                      disabled={!authed}
                      className="w-full bg-white/80 backdrop-blur border border-indigo-100 rounded-xl px-4 py-3.5 text-sm font-bold text-gray-900 placeholder-gray-400 outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all disabled:opacity-40"
                      placeholder="Max"
                      value={maxPrice}
                      onChange={e => setMaxPrice(e.target.value)}
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400 text-xs">₹</span>
                  </div>
                </div>
              </div>

              {/* Premium Stats */}
              <div className="pt-6 border-t border-indigo-100/50">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 font-medium">Total Products</span>
                  <span className="font-black text-indigo-600 text-lg">{total}</span>
                </div>
                <div className="flex items-center justify-between text-xs mt-2">
                  <span className="text-gray-400">Page</span>
                  <span className="font-bold text-gray-700">{page} of {totalPages}</span>
                </div>
              </div>
            </div>
          </aside>

          {/* ── PREMIUM PRODUCT GRID ── */}
          <main className="p-4 sm:p-6 lg:p-8">

            {/* Mobile: sort + filter bar */}
            <div className="lg:hidden flex items-center gap-3 mb-6">
              <button
                onClick={() => setFiltersOpen(true)}
                className="flex items-center gap-3 px-5 py-3.5 rounded-xl bg-white/90 backdrop-blur border border-indigo-100 text-xs font-black uppercase tracking-widest text-indigo-600 shadow-md hover:shadow-lg transition-all"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M3 6h18M7 12h10M10 18h4" />
                </svg>
                Filters
              </button>
              
              <div className="flex-1 overflow-x-auto scrollbar-none">
                <div className="flex gap-2">
                  {[
                    { v: 'NEW', l: '✨ Newest' },
                    ...(authed ? [
                      { v: 'PRICE_LOW', l: '💰 Low→High' },
                      { v: 'PRICE_HIGH', l: '💎 High→Low' }
                    ] : [])
                  ].map(opt => (
                    <button
                      key={opt.v}
                      onClick={() => setSort(opt.v)}
                      className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 border-2 ${
                        sort === opt.v
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-500/30'
                          : 'bg-white/80 backdrop-blur text-gray-600 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50'
                      }`}
                    >
                      {opt.l}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-2 rounded-xl whitespace-nowrap">
                {total} items
              </div>
            </div>

            {/* Desktop result count */}
            <div className="hidden lg:flex items-center justify-between mb-8">
              <p className="text-sm font-medium text-gray-500">
                <span className="text-2xl font-black text-indigo-600 mr-2">{total}</span>
                products found
                {category && (
                  <span className="ml-2">
                    in <span className="font-bold text-gray-900 capitalize bg-indigo-50 px-3 py-1.5 rounded-full text-sm">{category}</span>
                  </span>
                )}
              </p>
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-indigo-50 flex items-center justify-center">
                  <span className="text-indigo-600 font-bold text-xs">{page}</span>
                </div>
                <span className="text-gray-300 text-sm">/</span>
                <span className="text-gray-400 text-sm">{totalPages}</span>
              </div>
            </div>

            {/* Premium Skeleton Loading */}
            {loading && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                  <div key={i} className="bg-white/80 backdrop-blur rounded-2xl overflow-hidden shadow-md border border-indigo-100/50">
                    <div className="aspect-square bg-gradient-to-br from-indigo-50 to-purple-50 animate-pulse" />
                    <div className="p-4 space-y-3">
                      <div className="h-3 bg-indigo-100 rounded animate-pulse w-3/4" />
                      <div className="h-3 bg-indigo-100 rounded animate-pulse w-1/2" />
                      <div className="h-10 bg-indigo-100 rounded-xl animate-pulse mt-3" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {filteredSorted.map((p, index) => (
                  <ProductCard 
                    key={p._id} 
                    p={p} 
                    authed={authed} 
                    addToCart={addToCart} 
                    navigate={navigate}
                    index={index}
                  />
                ))}
              </div>
            )}

            {!loading && filteredSorted.length === 0 && (
              <div className="py-32 flex flex-col items-center justify-center text-center">
                <div className="relative">
                  <div className="h-32 w-32 rounded-3xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-5xl mb-8 shadow-inner">
                    🔍
                  </div>
                  <div className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-indigo-500 animate-ping opacity-75" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-3">No products found</h3>
                <p className="text-gray-500 max-w-md mb-8">
                  We couldn't find any products matching your criteria. Try adjusting your filters.
                </p>
                <button 
                  onClick={() => { setCategory(''); setQ(''); setMinPrice(''); setMaxPrice('') }}
                  className="px-8 py-4 bg-indigo-600 text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:scale-105 transition-all duration-300"
                >
                  Clear All Filters
                </button>
              </div>
            )}

            {/* Premium Pagination */}
            {!loading && filteredSorted.length > 0 && (
              <div className="flex items-center justify-center gap-3 pt-12 pb-8">
                <button
                  onClick={() => load(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="h-12 w-12 rounded-xl bg-white/90 backdrop-blur border border-indigo-100 flex items-center justify-center text-indigo-600 disabled:opacity-30 hover:border-indigo-300 hover:shadow-md hover:scale-110 transition-all duration-300"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i
                  return (
                    <button
                      key={p}
                      onClick={() => load(p)}
                      className={`h-12 w-12 rounded-xl text-sm font-black transition-all duration-300 ${
                        p === page
                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 scale-110'
                          : 'bg-white/90 backdrop-blur border border-indigo-100 text-gray-600 hover:border-indigo-300 hover:shadow-md hover:scale-105'
                      }`}
                    >
                      {p}
                    </button>
                  )
                })}
                
                <button
                  onClick={() => load(page + 1)}
                  disabled={page * limit >= total}
                  className="h-12 w-12 rounded-xl bg-white/90 backdrop-blur border border-indigo-100 flex items-center justify-center text-indigo-600 disabled:opacity-30 hover:border-indigo-300 hover:shadow-md hover:scale-110 transition-all duration-300"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* ── PREMIUM MOBILE FILTERS BOTTOM SHEET ── */}
      {filtersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setFiltersOpen(false)} />
          <div className="absolute bottom-0 inset-x-0 bg-white/95 backdrop-blur-xl rounded-t-3xl overflow-hidden shadow-2xl" style={{ maxHeight: '85vh' }}>
            {/* Premium Handle */}
            <div className="flex justify-center pt-4 pb-2">
              <div className="h-1.5 w-12 rounded-full bg-indigo-200" />
            </div>
            
            <div className="flex items-center justify-between px-6 py-4 border-b border-indigo-100">
              <span className="text-sm font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M3 6h18M7 12h10M10 18h4" strokeWidth="2.5" />
                </svg>
                Filters
              </span>
              <button onClick={() => setFiltersOpen(false)}
                className="h-10 w-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center hover:bg-indigo-100 transition-all">
                <svg className="w-5 h-5 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="overflow-y-auto p-6 space-y-8" style={{ maxHeight: 'calc(85vh - 120px)' }}>
              {/* Category */}
              <div className="space-y-4">
                <p className="text-[9px] font-black text-indigo-600 uppercase tracking-[0.3em]">Category</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => { setCategory(''); setFiltersOpen(false) }}
                    className={`px-4 py-4 rounded-xl text-sm font-black border-2 transition-all duration-300 text-center ${
                      category === ''
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-500/30 scale-105'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50'
                    }`}
                  >
                    All
                  </button>
                  {categories.map(c => (
                    <button
                      key={c._id}
                      onClick={() => { setCategory(c.name); setFiltersOpen(false) }}
                      className={`px-4 py-4 rounded-xl text-sm font-black border-2 transition-all duration-300 text-center capitalize ${
                        category === c.name
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-500/30 scale-105'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50'
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="space-y-4">
                <p className="text-[9px] font-black text-indigo-600 uppercase tracking-[0.3em]">Price Range (₹)</p>
                <div className="flex gap-4">
                  <div className="relative flex-1">
                    <input
                      className="w-full bg-white border-2 border-indigo-100 rounded-xl px-4 py-4 text-sm font-bold outline-none focus:border-indigo-400 transition-all"
                      placeholder="Min"
                      value={minPrice}
                      onChange={e => setMinPrice(e.target.value)}
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400">₹</span>
                  </div>
                  <div className="relative flex-1">
                    <input
                      className="w-full bg-white border-2 border-indigo-100 rounded-xl px-4 py-4 text-sm font-bold outline-none focus:border-indigo-400 transition-all"
                      placeholder="Max"
                      value={maxPrice}
                      onChange={e => setMaxPrice(e.target.value)}
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400">₹</span>
                  </div>
                </div>
              </div>

              {/* Apply Button */}
              <button
                onClick={() => setFiltersOpen(false)}
                className="w-full py-5 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── PREMIUM PRODUCT CARD ── */
function ProductCard({ p, authed, addToCart, navigate, index }) {
  const status = getStockStatus(p.stock)
  const discount = p.mrp && p.mrp > p.price
    ? Math.round(((Number(p.mrp) - Number(p.price)) / Number(p.mrp)) * 100)
    : 0
  const [recOpen, setRecOpen] = useState(false)
  const [recItems, setRecItems] = useState([])
  const [wished, setWished] = useState(() => {
    try {
      const arr = JSON.parse(localStorage.getItem('wishlist') || '[]')
      return arr.includes(p._id)
    } catch { return false }
  })
  const [isHovered, setIsHovered] = useState(false)

  const toggleWish = (e) => {
    e.stopPropagation(); e.preventDefault()
    try {
      const arr = JSON.parse(localStorage.getItem('wishlist') || '[]')
      const exists = arr.includes(p._id)
      const next = exists ? arr.filter(id => id !== p._id) : [...arr, p._id]
      localStorage.setItem('wishlist', JSON.stringify(next))
      setWished(!exists)
    } catch {}
  }

  const shareLink = (e) => {
    e.stopPropagation(); e.preventDefault()
    const url = `${window.location.origin}/products/${p._id}`
    const title = p.name
    const text = 'Check this product on Click2Kart'
    if (navigator.share) {
      navigator.share({ title, text, url }).catch(()=>{})
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(url).catch(()=>{})
    }
  }

  return (
    <div
      className="group bg-white/90 backdrop-blur rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 flex flex-col cursor-pointer border border-indigo-100/50 hover:border-indigo-300 relative animate-fade-in-up"
      style={{ animationDelay: `${index * 50}ms` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => navigate(`/products/${p._id}`)}
    >
      {/* Premium Gradient Overlay on Hover */}
      <div className={`absolute inset-0 bg-gradient-to-t from-indigo-600/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10`} />

      {/* Image area with Premium Effects */}
      <div className="relative bg-gradient-to-br from-indigo-50 to-purple-50 overflow-hidden">
        <div className="aspect-square flex items-center justify-center p-6">
          {p.images && p.images.length > 0
            ? <img 
                src={p.images[0].url} 
                alt={p.name} 
                className={`w-full h-full object-contain transition-all duration-700 ${
                  isHovered ? 'scale-110 rotate-2' : 'scale-100'
                }`}
              />
            : <div className="text-5xl opacity-30">📦</div>}
        </div>

        {/* Premium Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-20">
          {discount > 0 && authed && (
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 text-white text-[10px] font-black px-3 py-1.5 rounded-lg shadow-lg shadow-indigo-500/30 animate-pulse-slow">
              {discount}% OFF
            </div>
          )}
          {authed && p.bulkDiscountQuantity > 0 && (
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-400 text-white text-[10px] font-black px-3 py-1.5 rounded-lg shadow-lg shadow-emerald-500/30">
              BULK OFFER
            </div>
          )}
        </div>

        {/* Premium Action Buttons */}
        <div className={`absolute top-3 right-3 flex flex-col gap-2 transition-all duration-300 ${
          isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'
        }`}>
          <button
            onClick={toggleWish}
            className={`h-10 w-10 rounded-xl bg-white/90 backdrop-blur shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 ${
              wished ? 'text-rose-500' : 'text-gray-400 hover:text-rose-500'
            }`}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill={wished ? "currentColor" : "none"} stroke="currentColor" strokeWidth={wished ? "0" : "2"}>
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 6 4 4 6.5 4c1.74 0 3.41 1.01 4.22 2.5C11.09 5.01 12.76 4 14.5 4 17 4 19 6 19 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </button>
          
          <button
            onClick={shareLink}
            className="h-10 w-10 rounded-xl bg-white/90 backdrop-blur shadow-lg flex items-center justify-center text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-300 hover:scale-110"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8a3 3 0 10-2.83-4H15a3 3 0 100 6 3 3 0 003-3zM6 14a3 3 0 10-2.83 4H3a3 3 0 100-6 3 3 0 003 3zm12 0a3 3 0 10-2.83 4H15a3 3 0 100-6 3 3 0 003 3z" />
            </svg>
          </button>
        </div>

        {/* Quick View Indicator */}
        <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-600 to-indigo-400 transform origin-left transition-transform duration-500 ${
          isHovered ? 'scale-x-100' : 'scale-x-0'
        }`} />
      </div>

      {/* Product Info */}
      <div className="p-4 flex-1 flex flex-col relative z-10">
        {/* Rating / Category */}
        <div className="flex items-center justify-between mb-2">
          {p.ratingCount > 0 ? (
            <div className="flex items-center gap-1.5">
              <div className="flex">
                {[1, 2, 3, 4, 5].map(star => (
                  <svg
                    key={star}
                    className={`w-3 h-3 ${star <= Math.round(p.ratingAvg || 0) ? 'text-amber-400' : 'text-gray-200'}`}
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 .587l3.668 7.431L24 9.748l-6 5.848L19.335 24 12 19.771 4.665 24 6 15.596 0 9.748l8.332-1.73z" />
                  </svg>
                ))}
              </div>
              <span className="text-xs font-bold text-gray-700">{Number(p.ratingAvg || 0).toFixed(1)}</span>
              <span className="text-[10px] text-gray-400">({p.ratingCount >= 1000 ? `${(p.ratingCount / 1000).toFixed(1)}k` : p.ratingCount})</span>
            </div>
          ) : (
            <span className="text-[10px] text-gray-400 font-bold capitalize bg-gray-100 px-2 py-1 rounded-md">
              {p.category || 'General'}
            </span>
          )}
          <span className="text-[8px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md border border-indigo-100">
            ✓ Verified
          </span>
        </div>

        {/* Product Name */}
        <Link
          to={`/products/${p._id}`}
          onClick={e => e.stopPropagation()}
          className="text-sm font-bold text-gray-900 line-clamp-2 leading-tight hover:text-indigo-600 transition-colors mb-3"
        >
          {p.name}
        </Link>

        {/* Price + Cart */}
        <div className="mt-auto space-y-3">
          <div className="flex items-end justify-between gap-2">
            <div>
              <div className="text-xl font-black text-gray-900 leading-none">
                {authed && p.price != null ? (
                  <>₹{Number(p.price).toLocaleString()}</>
                ) : (
                  <span className="text-sm text-gray-400 font-medium">Login to view</span>
                )}
              </div>
              {authed && p.mrp != null && p.mrp > p.price && (
                <div className="text-xs text-gray-400 line-through mt-1">₹{Number(p.mrp).toLocaleString()}</div>
              )}
            </div>
            
            <button
              onClick={async e => { 
                e.stopPropagation(); e.preventDefault(); 
                if (!authed) {
                  navigate('/login')
                  return
                }
                const ok = await addToCart(p)
                if (ok) {
                  try {
                    const { data } = await api.get(`/api/recommendations/frequently-bought/${p._id}`)
                    setRecItems(data || [])
                    setRecOpen(true)
                  } catch {}
                }
              }}
              disabled={!authed || p.stock <= 0}
              className={`h-12 w-12 rounded-xl flex items-center justify-center shadow-lg transition-all duration-300 ${
                authed && p.stock > 0
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white hover:shadow-xl hover:scale-110 active:scale-95'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M7 6h13l-1.2 7H9.2L7 6Z" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="10" cy="19" r="1.4" fill="currentColor" />
                <circle cx="17" cy="19" r="1.4" fill="currentColor" />
              </svg>
            </button>
          </div>

          {/* Premium Tags */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`text-[8px] font-black px-2 py-1 rounded-md border ${status.bg} ${status.color} ${status.border}`}>
              {status.text}
            </span>
            <span className="text-[8px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-1 rounded-md flex items-center gap-0.5">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M13 10V3L4 14h7v7l9-11h-7z" strokeWidth="2" />
              </svg>
              Fast
            </span>
            {p.gst > 0 && (
              <span className="text-[8px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-md">
                GST Invoice
              </span>
            )}
            {discount > 0 && authed && (
              <span className="text-[8px] font-bold text-rose-600 bg-rose-50 border border-rose-100 px-2 py-1 rounded-md animate-pulse-slow">
                🔥 Price Drop
              </span>
            )}
            {authed && p.bulkDiscountQuantity > 0 && (
              <span className="text-[8px] font-bold text-orange-600 bg-orange-50 border border-orange-100 px-2 py-1 rounded-md">
                📦 Bulk
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Recommendations Modal */}
      {recOpen && recItems.length > 0 && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setRecOpen(false)} />
          <div className="absolute bottom-0 inset-x-0 bg-white/95 backdrop-blur-xl rounded-t-3xl overflow-hidden shadow-2xl" style={{ maxHeight: '70vh' }}>
            <div className="flex justify-center pt-4 pb-2">
              <div className="h-1.5 w-12 rounded-full bg-indigo-200" />
            </div>
            
            <div className="flex items-center justify-between px-6 py-4 border-b border-indigo-100">
              <span className="text-sm font-black text-indigo-600 uppercase tracking-widest">
                Frequently Bought Together
              </span>
              <button onClick={() => setRecOpen(false)}
                className="h-10 w-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M6 18L18 6M6 6l12 12" strokeWidth="2" />
                </svg>
              </button>
            </div>
            
            <div className="overflow-y-auto p-6 space-y-4" style={{ maxHeight: 'calc(70vh - 120px)' }}>
              {recItems.map((fp, idx) => (
                <div 
                  key={fp._id || fp.id} 
                  className="flex items-center gap-4 bg-white border border-indigo-100 rounded-xl p-4 hover:shadow-md transition-all animate-fade-in-up"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 overflow-hidden flex items-center justify-center flex-shrink-0">
                    {fp.images && fp.images[0]?.url
                      ? <img src={fp.images[0].url} alt={fp.name} className="h-full w-full object-contain p-2" />
                      : <span className="text-xl text-gray-400">📦</span>}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-gray-900 truncate">{fp.name}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {fp.price != null ? `₹${Number(fp.price).toLocaleString()}` : 'Login to view'}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => addToCart(fp)}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 text-white text-xs font-black uppercase tracking-widest shadow-md hover:shadow-lg hover:scale-105 transition-all"
                  >
                    Add
                  </button>
                </div>
              ))}
            </div>
            
            <div className="p-6">
              <button
                onClick={() => setRecOpen(false)}
                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-lg hover:shadow-xl transition-all"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }
        .animate-pulse-slow {
          animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </div>
  )
}

/* ── PREMIUM SUGGEST LIST ── */
function SuggestList({ items }) {
  const [active, setActive] = useState(0)
  const navigate = useNavigate()
  
  return (
    <div
      className="w-full bg-white/95 backdrop-blur-xl rounded-2xl border border-indigo-100 shadow-2xl overflow-hidden"
      onKeyDown={e => {
        if (e.key === 'ArrowDown') { e.preventDefault(); setActive(a => Math.min(items.length - 1, a + 1)) }
        if (e.key === 'ArrowUp') { e.preventDefault(); setActive(a => Math.max(0, a - 1)) }
        if (e.key === 'Enter') { e.preventDefault(); navigate(`/products/${items[active]?.id}`) }
      }}
      tabIndex={0}
    >
      <div className="py-2">
        {items.map((s, i) => (
          <div
            key={s.id}
            onMouseEnter={() => setActive(i)}
            onClick={() => navigate(`/products/${s.id}`)}
            className={`flex items-center gap-4 px-5 py-4 cursor-pointer transition-all duration-300 ${
              i === active 
                ? 'bg-gradient-to-r from-indigo-50 to-purple-50 scale-[1.02]' 
                : 'hover:bg-gray-50'
            }`}
          >
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 overflow-hidden flex items-center justify-center flex-shrink-0">
              {s.image
                ? <img src={s.image} alt={s.name} className="h-full w-full object-contain p-2" />
                : <span className="text-xl text-gray-400">📦</span>}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-gray-900 truncate">{s.name}</div>
              <div className="text-xs text-gray-400 font-medium capitalize mt-1">{s.category || 'General'}</div>
            </div>
            
            <svg className="w-5 h-5 text-indigo-400 ml-auto flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </div>
        ))}
      </div>
    </div>
  )
}