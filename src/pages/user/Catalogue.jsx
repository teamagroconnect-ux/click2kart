import React, { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import api from '../../lib/api'
import { useCart, getStockStatus } from '../../lib/CartContext'

export default function Catalogue(){
  const { addToCart } = useCart()
  const authed = !!localStorage.getItem('token')
  const [preview, setPreview] = useState('')
  const [q, setQ] = useState('')
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
  const location = useLocation()
  const limit = 12
  const load = async(p=1)=>{
    setLoading(true)
    try {
      const {data} = await api.get('/api/products', { params: { q, page:p, limit, category: category||undefined } })
      setItems(data.items); setTotal(data.total); setPage(p)
    } finally {
      setLoading(false)
    }
  }
  useEffect(()=>{ load(1) }, [q, category])
  useEffect(()=>{ api.get('/api/public/categories').then(({data})=>setCategories(data)) }, [])
  useEffect(()=>{
    const params = new URLSearchParams(location.search)
    const cat = params.get('category')
    if (cat) setCategory(cat)
  }, [location.search])

  const filteredSorted = useMemo(()=>{
    let list = [...items]
    if (authed) {
      const min = Number(minPrice)
      const max = Number(maxPrice)
      if (!Number.isNaN(min) && minPrice!=='') list = list.filter(p => (p.price ?? Infinity) >= min)
      if (!Number.isNaN(max) && maxPrice!=='') list = list.filter(p => (p.price ?? -Infinity) <= max)
      if (sort === 'PRICE_LOW') list.sort((a,b)=>(a.price??0)-(b.price??0))
      if (sort === 'PRICE_HIGH') list.sort((a,b)=>(b.price??0)-(a.price??0))
    }
    if (sort === 'NEW') list.sort((a,b)=> new Date(b.createdAt||0) - new Date(a.createdAt||0))
    return list
  }, [items, minPrice, maxPrice, sort, authed])

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-12">
        <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="space-y-2">
            <div className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-1">Our Collection</div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Explore Products</h1>
            <p className="text-sm text-gray-500 font-medium max-w-md">Discover premium tech and accessories curated for your digital lifestyle.</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch gap-3">
            <div className="relative group">
              <input 
                className="bg-gray-50 border border-gray-100 text-gray-900 text-sm rounded-2xl pl-11 pr-4 py-3.5 w-full sm:w-72 outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white shadow-inner transition-all" 
                placeholder="Search products..." 
                value={q} 
                onChange={e=>setQ(e.target.value)} 
              />
              <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <select 
              className="bg-gray-50 border border-gray-100 text-gray-900 text-sm rounded-2xl px-5 py-3.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white shadow-inner transition-all appearance-none font-bold" 
              value={sort} 
              onChange={e=>setSort(e.target.value)}
            >
              <option value="NEW">Newest First</option>
              {authed && <option value="PRICE_LOW">Price: Low to High</option>}
              {authed && <option value="PRICE_HIGH">Price: High to Low</option>}
            </select>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-6 md:gap-10">
          {/* Mobile filters trigger */}
          <div className="lg:hidden flex items-center justify-between">
            <button
              onClick={() => setFiltersOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl border border-gray-200 text-xs font-black uppercase tracking-widest bg-white hover:bg-gray-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6h18M7 12h10M10 18h4"/></svg>
              Filters
            </button>
            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Page {page} of {Math.max(1, Math.ceil(total/limit))}</div>
          </div>

          {/* Desktop filters */}
          <aside className="hidden lg:block space-y-8 sticky top-28 h-max">
            <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm space-y-8">
              <div className="space-y-4">
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Filter by Category</div>
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  <button 
                    onClick={()=>setCategory('')} 
                    className={`group w-full flex items-center justify-between px-5 py-3 rounded-2xl text-xs font-black transition-all ${category===''? 'bg-gray-900 text-white shadow-xl shadow-gray-200':'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
                  >
                    <span>All Products</span>
                    <span className={`h-1.5 w-1.5 rounded-full ${category===''? 'bg-blue-400':'bg-transparent'}`}></span>
                  </button>
                  {categories.map(c => (
                    <button 
                      key={c._id} 
                      onClick={()=>setCategory(c.name)} 
                      className={`group w-full flex items-center justify-between px-5 py-3 rounded-2xl text-xs font-black transition-all capitalize ${category===c.name? 'bg-gray-900 text-white shadow-xl shadow-gray-200':'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
                    >
                      <span>{c.name}</span>
                      <span className={`h-1.5 w-1.5 rounded-full ${category===c.name? 'bg-blue-400':'bg-transparent'}`}></span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4 pt-8 border-t border-gray-50">
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Price Range (₹)</div>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <input disabled={!authed} className="w-full bg-gray-50 border border-transparent rounded-xl px-4 py-2.5 text-xs font-bold text-gray-900 placeholder-gray-400 focus:bg-white focus:border-gray-100 outline-none transition-all disabled:opacity-50" placeholder="Min" value={minPrice} onChange={e=>setMinPrice(e.target.value)} />
                  </div>
                  <div className="relative flex-1">
                    <input disabled={!authed} className="w-full bg-gray-50 border border-transparent rounded-xl px-4 py-2.5 text-xs font-bold text-gray-900 placeholder-gray-400 focus:bg-white focus:border-gray-100 outline-none transition-all disabled:opacity-50" placeholder="Max" value={maxPrice} onChange={e=>setMaxPrice(e.target.value)} />
                  </div>
                </div>
              </div>
            </div>
          </aside>

          <main className="space-y-8 md:space-y-10">
            {loading && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} className="aspect-[4/5] bg-gray-50 rounded-[2.5rem] animate-pulse"></div>
                ))}
              </div>
            )}
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
              {filteredSorted.map(p => (
                <div key={p._id} className="group bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] flex flex-col transition-all duration-500 transform hover:-translate-y-2">
                  <Link to={`/products/${p._id}`} className="relative block">
                    <div 
                      className="bg-gray-50/50 aspect-[4/3] flex items-center justify-center overflow-hidden cursor-zoom-in"
                      onClick={(e)=>{ e.preventDefault(); if (p.images?.[0]?.url) setPreview(p.images[0].url) }}
                    >
                      {p.images && p.images.length>0
                        ? <img src={p.images[0].url} alt={p.name} className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110 p-4" />
                        : <div className="text-4xl">📦</div>}
                    </div>
                    {authed && p.bulkDiscountQuantity > 0 && (
                      <div className="absolute top-4 right-4 bg-amber-400 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg shadow-amber-200 uppercase tracking-widest animate-bounce">
                        Bulk Offer
                      </div>
                    )}
                  </Link>
                  <div className="p-4 md:p-6 flex-1 flex flex-col space-y-3">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="text-[10px] uppercase text-blue-600 font-black tracking-widest">{p.category || 'General'}</div>
                      </div>
                      <Link to={`/products/${p._id}`} className="block group-hover:text-blue-600 transition-colors">
                        <div className="font-black text-gray-900 line-clamp-2 min-h-[2.5rem] text-sm md:text-base leading-tight tracking-tight">{p.name}</div>
                      </Link>
                    </div>

                    <div className="flex flex-col space-y-4 pt-4 border-t border-gray-50 mt-auto">
                      <div className="flex items-center justify-between">
                        <div className="text-xl font-black text-gray-900 tracking-tighter">
                          {authed && p.price != null ? `₹${Number(p.price).toLocaleString()}` : 'Login to view price'}
                        </div>
                        {authed && p.bulkDiscountQuantity > 0 && (
                          <div className="text-[9px] text-emerald-600 font-black uppercase bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                            Save ₹{p.bulkDiscountPriceReduction}/u
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        {(() => {
                          const status = getStockStatus(p.stock)
                          return (
                            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${status.bg} ${status.color} border ${status.border}`}>
                              {status.text}
                            </span>
                          )
                        })()}
                        {p.ratingCount > 0 && (
                          <div className="flex items-center gap-1 text-amber-500">
                            <svg className="w-4 h-4 fill-amber-400" viewBox="0 0 24 24"><path d="M12 .587l3.668 7.431L24 9.748l-6 5.848L19.335 24 12 19.771 4.665 24 6 15.596 0 9.748l8.332-1.73z"/></svg>
                            <span className="text-xs font-bold text-gray-700">{Number(p.ratingAvg||0).toFixed(1)}</span>
                            <span className="text-[10px] font-bold text-gray-400">({p.ratingCount})</span>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={(e) => { e.preventDefault(); if (authed) addToCart(p); }}
                          disabled={!authed || p.stock <= 0}
                          className="flex-1 bg-gray-900 text-white py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-gray-800 transition-all active:scale-95 disabled:opacity-30 disabled:hover:bg-gray-900 disabled:cursor-not-allowed"
                        >
                          {authed ? (p.stock > 0 ? 'Add to Cart' : 'Sold Out') : 'Login to add'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {!loading && filteredSorted.length===0 && (
              <div className="py-32 flex flex-col items-center justify-center text-center animate-in fade-in duration-1000">
                <div className="h-24 w-24 rounded-[2rem] bg-gray-50 flex items-center justify-center text-4xl mb-6 shadow-inner">🔍</div>
                <h3 className="text-xl font-black text-gray-900 tracking-tight">No products found</h3>
                <p className="text-sm text-gray-400 font-bold mt-2 max-w-xs">Try adjusting your filters or search terms to find what you're looking for.</p>
              </div>
            )}

            <div className="hidden lg:flex justify-between items-center pt-10 border-t border-gray-50">
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Page {page} of {Math.max(1, Math.ceil(total/limit))}</div>
              <div className="flex gap-3">
                <button 
                  onClick={()=>load(Math.max(1, page-1))} 
                  className="px-6 py-2.5 border border-gray-200 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all disabled:opacity-30" 
                  disabled={page===1}
                >
                  Previous
                </button>
                <button 
                  onClick={()=>load(page+1)} 
                  className="px-6 py-2.5 border border-gray-200 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all disabled:opacity-30" 
                  disabled={page*limit>=total}
                >
                  Next
                </button>
              </div>
            </div>
          </main>
        </div>

        {preview && (
          <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-6" onClick={()=>setPreview('')}>
            <div className="max-w-4xl w-full">
              <img src={preview} alt="Preview" className="w-full h-auto rounded-3xl shadow-2xl object-contain" />
            </div>
          </div>
        )}

        {/* Mobile Filters Sheet */}
        {filtersOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={()=>setFiltersOpen(false)}></div>
            <div className="absolute bottom-0 inset-x-0 bg-white rounded-t-[2rem] p-6 space-y-6 max-h-[80vh] overflow-y-auto border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div className="text-sm font-black uppercase tracking-widest text-gray-400">Filters</div>
                <button onClick={()=>setFiltersOpen(false)} className="p-2 rounded-xl hover:bg-gray-50 border border-gray-100">
                  <svg className="w-5 h-5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>
              <div className="space-y-4">
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Filter by Category</div>
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                  <button 
                    onClick={()=>{setCategory(''); setFiltersOpen(false)}}
                    className={`group w-full flex items-center justify-between px-5 py-3 rounded-2xl text-xs font-black transition-all ${category===''? 'bg-gray-900 text-white shadow-xl shadow-gray-200':'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
                  >
                    <span>All Products</span>
                    <span className={`h-1.5 w-1.5 rounded-full ${category===''? 'bg-blue-400':'bg-transparent'}`}></span>
                  </button>
                  {categories.map(c => (
                    <button 
                      key={c._id} 
                      onClick={()=>{setCategory(c.name); setFiltersOpen(false)}}
                      className={`group w-full flex items-center justify-between px-5 py-3 rounded-2xl text-xs font-black transition-all capitalize ${category===c.name? 'bg-gray-900 text-white shadow-xl shadow-gray-200':'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
                    >
                      <span>{c.name}</span>
                      <span className={`h-1.5 w-1.5 rounded-full ${category===c.name? 'bg-blue-400':'bg-transparent'}`}></span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-4 pt-4 border-t border-gray-50">
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Price Range (₹)</div>
                <div className="flex gap-3">
                  <input className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold outline-none" placeholder="Min" value={minPrice} onChange={e=>setMinPrice(e.target.value)} />
                  <input className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold outline-none" placeholder="Max" value={maxPrice} onChange={e=>setMaxPrice(e.target.value)} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
