import React, { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import api from '../../lib/api'
import { useCart, getStockStatus } from '../../lib/CartContext'

export default function Catalogue(){
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

  useEffect(()=>{
    let t
    if (q.trim().length >= 2) {
      t = setTimeout(async ()=>{
        try {
          const { data } = await api.get('/api/products/suggest', { params: { q } })
          setSug(data || []); setShowSug(true)
        } catch { setSug([]) }
      }, 250)
    } else {
      setSug([]); setShowSug(false)
    }
    return ()=> t && clearTimeout(t)
  }, [q])

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
          <div className="flex flex-col sm:flex-row items-stretch gap-3 relative">
            <div className="relative group w-full sm:w-auto">
              <input 
                className="bg-white/90 border border-gray-200 text-gray-900 text-sm rounded-2xl pl-11 pr-10 py-3.5 w-full sm:w-80 outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-300 shadow-[inset_0_2px_8px_rgba(0,0,0,0.05)] transition-all" 
                placeholder="Search products, brands…" 
                value={q} 
                onChange={e=>setQ(e.target.value)} 
                onFocus={()=> q.trim().length>=2 && setShowSug(true)}
                onBlur={()=> setTimeout(()=>setShowSug(false), 150)}
              />
              <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-violet-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              {q && (
                <button
                  onClick={()=>{ setQ(''); setSug([]); setShowSug(false) }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-gray-50 text-gray-400 hover:text-gray-600 border border-gray-200 flex items-center justify-center"
                  aria-label="Clear"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.3 5.71 12 12l6.3 6.29-1.41 1.42L10.59 13.4 4.3 19.71 2.89 18.3 9.17 12 2.89 5.71 4.3 4.29l6.29 6.3 6.3-6.3z"/></svg>
                </button>
              )}
              {showSug && sug.length > 0 && <SuggestList items={sug} />}
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
                <div 
                  key={p._id} 
                  className="group relative bg-white/80 backdrop-blur border border-gray-100 rounded-[2rem] overflow-hidden shadow-md hover:shadow-xl flex flex-col transition-all duration-300 hover:scale-[1.01] cursor-pointer"
                  onClick={()=>navigate(`/products/${p._id}`)}
                >
                  <Link to={`/products/${p._id}`} className="relative block" onClick={(e)=>e.stopPropagation()}>
                    <div 
                      className="bg-gray-50/50 h-[160px] sm:h-[170px] flex items-center justify-center overflow-hidden"
                    >
                      {p.images && p.images.length>0
                        ? <img src={p.images[0].url} alt={p.name} className="w-full h-full object-contain p-3" />
                        : <div className="text-4xl">📦</div>}
                    </div>
                    <button
                      onClick={(e)=>{ e.preventDefault(); e.stopPropagation(); }}
                      className="absolute top-3 right-3 h-9 w-9 rounded-full bg-white/90 backdrop-blur border border-gray-200 flex items-center justify-center text-gray-400 hover:text-rose-500 shadow-md"
                      title="Wishlist"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 6 4 4 6.5 4c1.74 0 3.41 1.01 4.22 2.5C11.09 5.01 12.76 4 14.5 4 17 4 19 6 19 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                    </button>
                    {authed && p.bulkDiscountQuantity > 0 && (
                      <div className="absolute top-3 left-3 bg-gradient-to-r from-orange-500 to-amber-400 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-md uppercase tracking-widest">
                        Bulk Offer
                      </div>
                    )}
                  </Link>
                  <div className="p-4 md:p-4 flex-1 flex flex-col space-y-2" onClick={(e)=>e.stopPropagation()}>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        {p.ratingCount > 0 ? (
                          <div className="inline-flex items-center gap-1 text-amber-500">
                            <svg className="w-4 h-4 fill-amber-400" viewBox="0 0 24 24"><path d="M12 .587l3.668 7.431L24 9.748l-6 5.848L19.335 24 12 19.771 4.665 24 6 15.596 0 9.748l8.332-1.73z"/></svg>
                            <span className="text-xs font-bold text-gray-700">{Number(p.ratingAvg||0).toFixed(1)}</span>
                            <span className="text-[10px] font-bold text-gray-400">| {p.ratingCount >= 1000 ? `${(p.ratingCount/1000).toFixed(1)}k` : p.ratingCount}</span>
                          </div>
                        ) : (
                          <span className="text-[10px] uppercase text-gray-400 font-black tracking-widest">{p.category || 'General'}</span>
                        )}
                        <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                          ✔ Verified
                        </span>
                      </div>
                      <Link to={`/products/${p._id}`} className="block group-hover:text-blue-600 transition-colors">
                        <div className="font-black text-gray-900 line-clamp-1 text-sm md:text-base leading-tight tracking-tight">{p.name}</div>
                      </Link>
                    </div>

                    <div className="flex flex-col space-y-2 pt-2 border-t border-gray-50 mt-auto">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="text-xl font-black text-gray-900 tracking-tighter">
                            {authed && p.price != null ? `₹${Number(p.price).toLocaleString()}` : '₹***'}
                          </div>
                          {authed && p.mrp != null && p.mrp > p.price && (
                            <div className="flex items-center gap-2 mt-0.5">
                              <div className="text-[11px] text-gray-400 line-through">
                                ₹{Number(p.mrp).toLocaleString()}
                              </div>
                              <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-black uppercase tracking-widest">
                                {Math.round(((Number(p.mrp)-Number(p.price))/Number(p.mrp))*100)}% OFF
                              </div>
                            </div>
                          )}
                        </div>
                        <button 
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (authed) addToCart(p); }}
                          disabled={!authed || p.stock <= 0}
                          title={authed ? (p.stock > 0 ? 'Add to Cart' : 'Sold Out') : 'Login to add'}
                          className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-[#0f172a] text-white shadow-md hover:bg-[#111827] active:scale-95 disabled:opacity-40"
                        >
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M7 6h13l-1.2 7H9.2L7 6Z" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                            <circle cx="10" cy="19" r="1.4" fill="currentColor" />
                            <circle cx="17" cy="19" r="1.4" fill="currentColor" />
                          </svg>
                        </button>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        {(() => {
                          const status = getStockStatus(p.stock)
                          return (
                            <div className="flex items-center gap-2 text-[11px]">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border ${status.bg} ${status.color} ${status.border}`}>✔ {status.text}</span>
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-gray-200 text-gray-600">🚚 Fast</span>
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-gray-200 text-gray-600">🧾 GST</span>
                            </div>
                          )
                        })()}
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

function SuggestList({ items }) {
  const [active, setActive] = React.useState(0)
  const navigate = useNavigate()
  return (
    <div
      className="absolute z-30 mt-2 w-full bg-white rounded-2xl border border-gray-100 shadow-2xl overflow-hidden"
      onKeyDown={(e)=>{
        if (e.key === 'ArrowDown') { e.preventDefault(); setActive(a => Math.min(items.length-1, a+1)) }
        if (e.key === 'ArrowUp') { e.preventDefault(); setActive(a => Math.max(0, a-1)) }
        if (e.key === 'Enter') { e.preventDefault(); navigate(`/products/${items[active]?.id}`) }
      }}
      tabIndex={0}
    >
      {items.map((s, i) => (
        <div
          key={s.id}
          onMouseEnter={()=>setActive(i)}
          onClick={()=>navigate(`/products/${s.id}`)}
          className={`flex items-center gap-3 px-4 py-3 transition-colors cursor-pointer ${i===active ? 'bg-gray-50' : 'hover:bg-gray-50'}`}
        >
          <div className="h-8 w-8 rounded-lg bg-gray-50 border border-gray-100 overflow-hidden flex items-center justify-center">
            {s.image ? <img src={s.image} alt={s.name} className="h-full w-full object-contain" /> : <span className="text-[10px] text-gray-400">Img</span>}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-bold text-gray-900 truncate">{s.name}</div>
            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest truncate">{s.category || 'General'}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
