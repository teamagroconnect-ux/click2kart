import React, { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import api from '../../lib/api'
import { useCart, getStockStatus } from '../../lib/CartContext'

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
    <div className="bg-gray-50 min-h-screen">

      {/* ── STICKY TOP SEARCH BAR (mobile) ── */}
      <div className="lg:hidden sticky top-0 z-40 bg-[#1244ea] shadow-lg">
        <div className="px-3 py-2.5">
          <div className="relative">
            <input
              className="w-full bg-[#0a2db5] text-white placeholder-blue-200 text-sm rounded-xl pl-10 pr-10 py-3 outline-none focus:bg-[#0a35cc] transition-all"
              placeholder="Search products, brands…"
              value={q}
              onChange={e => setQ(e.target.value)}
              onFocus={() => { setSearchFocused(true); q.trim().length >= 2 && setShowSug(true) }}
              onBlur={() => { setTimeout(() => { setShowSug(false); setSearchFocused(false) }, 150) }}
            />
            <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {q && (
              <button
                onClick={() => { setQ(''); setSug([]); setShowSug(false) }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-200 hover:text-white"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.3 5.71 12 12l6.3 6.29-1.41 1.42L10.59 13.4 4.3 19.71 2.89 18.3 9.17 12 2.89 5.71 4.3 4.29l6.29 6.3 6.3-6.3z" />
                </svg>
              </button>
            )}
            {showSug && sug.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 z-50">
                <SuggestList items={sug} />
              </div>
            )}
          </div>
        </div>

        {/* Category horizontal scroll chips */}
        <div className="flex gap-2 px-3 pb-3 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setCategory('')}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${category === ''
              ? 'bg-white text-[#1244ea] border-white shadow-md'
              : 'bg-transparent text-blue-100 border-blue-300/50 hover:border-white hover:text-white'}`}
          >
            All
          </button>
          {categories.map(c => (
            <button
              key={c._id}
              onClick={() => setCategory(c.name)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-all border capitalize ${category === c.name
                ? 'bg-white text-[#1244ea] border-white shadow-md'
                : 'bg-transparent text-blue-100 border-blue-300/50 hover:border-white hover:text-white'}`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* ── DESKTOP HEADER ── */}
      <div className="hidden lg:block bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between gap-6">
          <div>
            <p className="text-[10px] font-black text-[#1244ea] uppercase tracking-[0.25em]">Our Collection</p>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight leading-none mt-0.5">Explore Products</h1>
          </div>
          <div className="flex items-center gap-3 flex-1 max-w-2xl">
            <div className="relative flex-1">
              <input
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-2xl pl-11 pr-10 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all"
                placeholder="Search products, brands…"
                value={q}
                onChange={e => setQ(e.target.value)}
                onFocus={() => q.trim().length >= 2 && setShowSug(true)}
                onBlur={() => setTimeout(() => setShowSug(false), 150)}
              />
              <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {q && (
                <button onClick={() => { setQ(''); setSug([]); setShowSug(false) }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-gray-100 text-gray-400 hover:text-gray-700 flex items-center justify-center">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.3 5.71 12 12l6.3 6.29-1.41 1.42L10.59 13.4 4.3 19.71 2.89 18.3 9.17 12 2.89 5.71 4.3 4.29l6.29 6.3 6.3-6.3z" /></svg>
                </button>
              )}
              {showSug && sug.length > 0 && <SuggestList items={sug} />}
            </div>
            <select
              className="bg-white border border-gray-200 text-gray-800 text-sm rounded-2xl px-5 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-bold appearance-none cursor-pointer"
              value={sort}
              onChange={e => setSort(e.target.value)}
            >
              <option value="NEW">Newest First</option>
              {authed && <option value="PRICE_LOW">Price: Low → High</option>}
              {authed && <option value="PRICE_HIGH">Price: High → Low</option>}
            </select>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="max-w-7xl mx-auto">
        <div className="lg:grid lg:grid-cols-[260px_1fr] lg:gap-0">

          {/* ── DESKTOP SIDEBAR ── */}
          <aside className="hidden lg:block border-r border-gray-100 bg-white min-h-[calc(100vh-73px)]">
            <div className="sticky top-[73px] p-6 space-y-8">

              {/* Sort (desktop) */}
              <div className="space-y-3">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Sort By</p>
                <div className="space-y-1">
                  {[
                    { v: 'NEW', l: 'Newest First' },
                    ...(authed ? [{ v: 'PRICE_LOW', l: 'Price: Low → High' }, { v: 'PRICE_HIGH', l: 'Price: High → Low' }] : [])
                  ].map(opt => (
                    <button
                      key={opt.v}
                      onClick={() => setSort(opt.v)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${sort === opt.v
                        ? 'bg-[#1244ea] text-white'
                        : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                      <span className={`h-2 w-2 rounded-full flex-shrink-0 ${sort === opt.v ? 'bg-blue-200' : 'bg-gray-200'}`}></span>
                      {opt.l}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category */}
              <div className="space-y-3">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Category</p>
                <div className="space-y-1 max-h-[280px] overflow-y-auto pr-1">
                  <button
                    onClick={() => setCategory('')}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${category === ''
                      ? 'bg-[#1244ea] text-white'
                      : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    <span className={`h-2 w-2 rounded-full flex-shrink-0 ${category === '' ? 'bg-blue-200' : 'bg-gray-200'}`}></span>
                    All Products
                  </button>
                  {categories.map(c => (
                    <button
                      key={c._id}
                      onClick={() => setCategory(c.name)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all text-left capitalize ${category === c.name
                        ? 'bg-[#1244ea] text-white'
                        : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                      <span className={`h-2 w-2 rounded-full flex-shrink-0 ${category === c.name ? 'bg-blue-200' : 'bg-gray-200'}`}></span>
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="space-y-3">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Price Range (₹)</p>
                {!authed && (
                  <p className="text-[10px] text-gray-400 font-medium">Login to filter by price</p>
                )}
                <div className="flex gap-2">
                  <input
                    disabled={!authed}
                    className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-xs font-bold text-gray-900 placeholder-gray-400 outline-none focus:border-blue-300 focus:bg-white transition-all disabled:opacity-40"
                    placeholder="Min"
                    value={minPrice}
                    onChange={e => setMinPrice(e.target.value)}
                  />
                  <input
                    disabled={!authed}
                    className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-xs font-bold text-gray-900 placeholder-gray-400 outline-none focus:border-blue-300 focus:bg-white transition-all disabled:opacity-40"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={e => setMaxPrice(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </aside>

          {/* ── PRODUCT GRID ── */}
          <main className="p-3 sm:p-4 lg:p-6 lg:bg-gray-50">

            {/* Mobile: sort + filter bar */}
            <div className="lg:hidden flex items-center gap-2 mb-3">
              <button
                onClick={() => setFiltersOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-xs font-black uppercase tracking-widest text-gray-700 shadow-sm"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 6h18M7 12h10M10 18h4" />
                </svg>
                Filters
              </button>
              <div className="flex-1 overflow-x-auto scrollbar-none">
                <div className="flex gap-2">
                  {[
                    { v: 'NEW', l: 'Newest' },
                    ...(authed ? [{ v: 'PRICE_LOW', l: 'Low→High' }, { v: 'PRICE_HIGH', l: 'High→Low' }] : [])
                  ].map(opt => (
                    <button
                      key={opt.v}
                      onClick={() => setSort(opt.v)}
                      className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${sort === opt.v
                        ? 'bg-[#1244ea] text-white border-[#1244ea]'
                        : 'bg-white text-gray-600 border-gray-200'}`}
                    >
                      {opt.l}
                    </button>
                  ))}
                </div>
              </div>
              <div className="text-[10px] font-black text-gray-400 whitespace-nowrap">{total} items</div>
            </div>

            {/* Desktop result count */}
            <div className="hidden lg:flex items-center justify-between mb-4">
              <p className="text-sm font-bold text-gray-500">
                <span className="text-gray-900 font-black">{total}</span> products found
                {category && <span className="ml-1 text-[#1244ea]">in <span className="capitalize">{category}</span></span>}
              </p>
              <p className="text-xs font-bold text-gray-400">Page {page} of {totalPages}</p>
            </div>

            {/* Skeleton loading */}
            {loading && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                  <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm">
                    <div className="aspect-square bg-gray-100 animate-pulse" />
                    <div className="p-3 space-y-2">
                      <div className="h-3 bg-gray-100 rounded animate-pulse w-3/4" />
                      <div className="h-3 bg-gray-100 rounded animate-pulse w-1/2" />
                      <div className="h-8 bg-gray-100 rounded animate-pulse mt-2" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {filteredSorted.map(p => (
                  <ProductCard key={p._id} p={p} authed={authed} addToCart={addToCart} navigate={navigate} />
                ))}
              </div>
            )}

            {!loading && filteredSorted.length === 0 && (
              <div className="py-24 flex flex-col items-center justify-center text-center">
                <div className="h-20 w-20 rounded-3xl bg-blue-50 flex items-center justify-center text-4xl mb-5 shadow-inner">🔍</div>
                <h3 className="text-lg font-black text-gray-900">No products found</h3>
                <p className="text-sm text-gray-400 mt-1 max-w-xs">Try changing your filters or search terms.</p>
                <button onClick={() => { setCategory(''); setQ('') }}
                  className="mt-4 px-6 py-2.5 bg-[#1244ea] text-white rounded-xl text-xs font-black uppercase tracking-widest">
                  Clear Filters
                </button>
              </div>
            )}

            {/* Pagination */}
            {!loading && filteredSorted.length > 0 && (
              <div className="flex items-center justify-center gap-3 pt-8 pb-4">
                <button
                  onClick={() => load(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="h-10 w-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-600 disabled:opacity-30 hover:border-[#1244ea] hover:text-[#1244ea] transition-all shadow-sm"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i
                  return (
                    <button
                      key={p}
                      onClick={() => load(p)}
                      className={`h-10 w-10 rounded-xl text-xs font-black transition-all shadow-sm ${p === page
                        ? 'bg-[#1244ea] text-white border border-[#1244ea]'
                        : 'bg-white border border-gray-200 text-gray-600 hover:border-[#1244ea] hover:text-[#1244ea]'}`}
                    >
                      {p}
                    </button>
                  )
                })}
                <button
                  onClick={() => load(page + 1)}
                  disabled={page * limit >= total}
                  className="h-10 w-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-600 disabled:opacity-30 hover:border-[#1244ea] hover:text-[#1244ea] transition-all shadow-sm"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* ── MOBILE FILTERS BOTTOM SHEET ── */}
      {filtersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setFiltersOpen(false)} />
          <div className="absolute bottom-0 inset-x-0 bg-white rounded-t-3xl overflow-hidden shadow-2xl" style={{ maxHeight: '85vh' }}>
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="h-1 w-10 rounded-full bg-gray-200" />
            </div>
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
              <span className="text-sm font-black text-gray-900 uppercase tracking-widest">Filters</span>
              <button onClick={() => setFiltersOpen(false)}
                className="h-8 w-8 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="overflow-y-auto p-5 space-y-6" style={{ maxHeight: 'calc(85vh - 80px)' }}>
              <div className="space-y-3">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Category</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => { setCategory(''); setFiltersOpen(false) }}
                    className={`px-4 py-3 rounded-xl text-xs font-black border transition-all text-center ${category === ''
                      ? 'bg-[#1244ea] text-white border-[#1244ea]'
                      : 'bg-white text-gray-600 border-gray-200'}`}
                  >
                    All Products
                  </button>
                  {categories.map(c => (
                    <button
                      key={c._id}
                      onClick={() => { setCategory(c.name); setFiltersOpen(false) }}
                      className={`px-4 py-3 rounded-xl text-xs font-black border transition-all text-center capitalize ${category === c.name
                        ? 'bg-[#1244ea] text-white border-[#1244ea]'
                        : 'bg-white text-gray-600 border-gray-200'}`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Price Range (₹)</p>
                <div className="flex gap-3">
                  <input
                    className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-blue-300"
                    placeholder="Min"
                    value={minPrice}
                    onChange={e => setMinPrice(e.target.value)}
                  />
                  <input
                    className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-blue-300"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={e => setMaxPrice(e.target.value)}
                  />
                </div>
              </div>
              <button
                onClick={() => setFiltersOpen(false)}
                className="w-full py-4 bg-[#1244ea] text-white rounded-2xl text-sm font-black uppercase tracking-widest"
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

/* ── PRODUCT CARD ── */
function ProductCard({ p, authed, addToCart, navigate }) {
  const status = getStockStatus(p.stock)
  const discount = p.mrp && p.mrp > p.price
    ? Math.round(((Number(p.mrp) - Number(p.price)) / Number(p.mrp)) * 100)
    : 0

  return (
    <div
      className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col cursor-pointer border border-gray-100 hover:border-blue-100"
      onClick={() => navigate(`/products/${p._id}`)}
    >
      {/* Image area */}
      <div className="relative bg-gray-50">
        <div className="aspect-square flex items-center justify-center overflow-hidden p-4">
          {p.images && p.images.length > 0
            ? <img src={p.images[0].url} alt={p.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" />
            : <div className="text-5xl opacity-30">📦</div>}
        </div>
        {/* Badges */}
        {discount > 0 && authed && (
          <div className="absolute top-2 left-2 bg-[#e8140a] text-white text-[10px] font-black px-2 py-0.5 rounded-lg shadow">
            {discount}% OFF
          </div>
        )}
        {authed && p.bulkDiscountQuantity > 0 && (
          <div className="absolute top-2 left-2 bg-gradient-to-r from-orange-500 to-amber-400 text-white text-[10px] font-black px-2 py-0.5 rounded-lg shadow">
            BULK
          </div>
        )}
        {/* Wishlist */}
        <button
          onClick={e => { e.stopPropagation(); e.preventDefault() }}
          className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white shadow border border-gray-100 flex items-center justify-center text-gray-300 hover:text-rose-500 transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 6 4 4 6.5 4c1.74 0 3.41 1.01 4.22 2.5C11.09 5.01 12.76 4 14.5 4 17 4 19 6 19 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </button>
      </div>

      {/* Info */}
      <div className="p-3 flex-1 flex flex-col">
        {/* Rating / Category */}
        <div className="flex items-center justify-between mb-1">
          {p.ratingCount > 0 ? (
            <div className="flex items-center gap-1">
              <svg className="w-3 h-3 fill-amber-400" viewBox="0 0 24 24">
                <path d="M12 .587l3.668 7.431L24 9.748l-6 5.848L19.335 24 12 19.771 4.665 24 6 15.596 0 9.748l8.332-1.73z" />
              </svg>
              <span className="text-[11px] font-black text-gray-700">{Number(p.ratingAvg || 0).toFixed(1)}</span>
              <span className="text-[10px] text-gray-400">({p.ratingCount >= 1000 ? `${(p.ratingCount / 1000).toFixed(1)}k` : p.ratingCount})</span>
            </div>
          ) : (
            <span className="text-[10px] text-gray-400 font-bold capitalize">{p.category || 'General'}</span>
          )}
          <span className="text-[9px] font-black text-[#1244ea] bg-blue-50 px-1.5 py-0.5 rounded-md">✓ Verified</span>
        </div>

        {/* Name */}
        <Link
          to={`/products/${p._id}`}
          onClick={e => e.stopPropagation()}
          className="text-sm font-bold text-gray-900 line-clamp-2 leading-tight hover:text-[#1244ea] transition-colors mb-2"
        >
          {p.name}
        </Link>

        {/* Price + Cart */}
        <div className="mt-auto space-y-2">
          <div className="flex items-end justify-between gap-2">
            <div>
              <div className="text-base font-black text-gray-900 leading-none">
                {authed && p.price != null ? `₹${Number(p.price).toLocaleString()}` : (
                  <span className="text-gray-400">Login to view</span>
                )}
              </div>
              {authed && p.mrp != null && p.mrp > p.price && (
                <div className="text-[11px] text-gray-400 line-through mt-0.5">₹{Number(p.mrp).toLocaleString()}</div>
              )}
            </div>
            <button
              onClick={e => { e.stopPropagation(); e.preventDefault(); if (authed) addToCart(p) }}
              disabled={!authed || p.stock <= 0}
              title={authed ? (p.stock > 0 ? 'Add to Cart' : 'Sold Out') : 'Login to add'}
              className="h-9 w-9 rounded-xl bg-[#1244ea] text-white flex items-center justify-center shadow-sm hover:bg-[#0d35c7] active:scale-95 disabled:opacity-40 transition-all flex-shrink-0"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M7 6h13l-1.2 7H9.2L7 6Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="10" cy="19" r="1.4" fill="currentColor" />
                <circle cx="17" cy="19" r="1.4" fill="currentColor" />
              </svg>
            </button>
          </div>

          {/* Stock + tags */}
          <div className="flex items-center gap-1 flex-wrap">
            <span className={`text-[9px] font-black px-2 py-0.5 rounded-md border ${status.bg} ${status.color} ${status.border}`}>
              {status.text}
            </span>
            <span className="text-[9px] font-bold text-gray-500 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-md">🚚 Fast</span>
            <span className="text-[9px] font-bold text-gray-500 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-md">🧾 GST</span>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── SUGGEST LIST ── */
function SuggestList({ items }) {
  const [active, setActive] = useState(0)
  const navigate = useNavigate()
  return (
    <div
      className="w-full bg-white rounded-2xl border border-gray-100 shadow-2xl overflow-hidden"
      onKeyDown={e => {
        if (e.key === 'ArrowDown') { e.preventDefault(); setActive(a => Math.min(items.length - 1, a + 1)) }
        if (e.key === 'ArrowUp') { e.preventDefault(); setActive(a => Math.max(0, a - 1)) }
        if (e.key === 'Enter') { e.preventDefault(); navigate(`/products/${items[active]?.id}`) }
      }}
      tabIndex={0}
    >
      {items.map((s, i) => (
        <div
          key={s.id}
          onMouseEnter={() => setActive(i)}
          onClick={() => navigate(`/products/${s.id}`)}
          className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${i === active ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
        >
          <div className="h-9 w-9 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden flex items-center justify-center flex-shrink-0">
            {s.image
              ? <img src={s.image} alt={s.name} className="h-full w-full object-contain" />
              : <span className="text-[10px] text-gray-400">📦</span>}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-bold text-gray-900 truncate">{s.name}</div>
            <div className="text-[10px] text-gray-400 font-bold capitalize truncate">{s.category || 'General'}</div>
          </div>
          <svg className="w-4 h-4 text-gray-300 ml-auto flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      ))}
    </div>
  )
}