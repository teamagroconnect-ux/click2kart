import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import api from '../../lib/api'
import { useCart, getStockStatus } from '../../lib/CartContext'
import { setSEO, injectJsonLd } from '../../shared/lib/seo.js'
import { useToast } from '../../components/Toast'

export default function ProductDetail(){
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const { notify } = useToast()
  const [p, setP] = useState(null)
  const [selected, setSelected] = useState({ color: '', storage: '', ram: '' })
  const [activeVariant, setActiveVariant] = useState(null)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [zoom, setZoom] = useState({ on: false, x: 0, y: 0 })
  const [similar, setSimilar] = useState([])
  const [rec, setRec] = useState(null)
  const [recOpen, setRecOpen] = useState(false)
  const [reviewOpen, setReviewOpen] = useState(false)
  const [myRating, setMyRating] = useState(0)
  const [myComment, setMyComment] = useState('')
  const [qty, setQty] = useState(1)
  const authed = !!localStorage.getItem('token')
  useEffect(()=>{ 
    api.get(`/api/products/${id}`).then(({data})=>setP(data)) 
    api.get(`/api/products/${id}/recommendations`).then(({data})=>setSimilar(data||[])).catch(()=>setSimilar([]))
  }, [id])
  useEffect(() => {
    api.get(`/api/products/recommend`, { params: { productId: id } })
      .then(({ data }) => {
        const item = data?.items?.[0] || data?.item || null
        setRec(item)
      })
      .catch(() => setRec(null))
  }, [id])
  useEffect(() => {
    if (!p || !Array.isArray(p.variants) || p.variants.length === 0) { setActiveVariant(null); return }
    const colors = [...new Set(p.variants.map(v => v.attributes?.color).filter(Boolean))]
    const rams = [...new Set(p.variants.map(v => v.attributes?.ram).filter(Boolean))]
    const storages = [...new Set(p.variants.map(v => v.attributes?.storage).filter(Boolean))]
    setSelected(prev => ({
      color: prev.color || colors[0] || '',
      ram: prev.ram || rams[0] || '',
      storage: prev.storage || storages[0] || ''
    }))
  }, [p])
  useEffect(() => {
    if (!p || !Array.isArray(p.variants) || p.variants.length === 0) { setActiveVariant(null); return }
    const v = p.variants.find(v =>
      (v.attributes?.color || '') === (selected.color || '') &&
      (v.attributes?.ram || '') === (selected.ram || '') &&
      (v.attributes?.storage || '') === (selected.storage || '')
    ) || null
    if (!v) {
      const all = p.variants
      const filteredByColor = all.filter(x => (x.attributes?.color || '') === (selected.color || '') || !selected.color)
      const pick = filteredByColor[0] || all[0] || null
      if (pick) {
        setSelected({
          color: pick.attributes?.color || '',
          ram: pick.attributes?.ram || '',
          storage: pick.attributes?.storage || ''
        })
        return
      }
    }
    setActiveVariant(v)
    setActiveImageIndex(0)
  }, [selected, p])
  useEffect(() => {
    if (!p) return
    const title = `${p.name} Wholesale Price | Click2Kart`
    const desc = `Buy ${p.name} at wholesale B2B rates with GST invoice and fast delivery across India. Category: ${p.category || 'General'}.`
    setSEO(title, desc)
    const cleanup = injectJsonLd({
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": p.name,
      "image": (p.images || []).map(i => i.url).filter(Boolean),
      "category": p.category || "General",
      "offers": {
        "@type": "Offer",
        "priceCurrency": "INR",
        "price": String(p.price || 0),
        "availability": p.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        "url": `${location.origin}/products/${p._id}`
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": String(p.ratingAvg || 0),
        "reviewCount": String(p.ratingCount || 0)
      }
    })
    return cleanup
  }, [p])
  if (!p) return <div className="p-10 text-center text-lg text-gray-500">Loading product details...</div>
  const basePrice = Number(activeVariant?.price ?? p.price ?? 0)
  const sortedTiersDesc = Array.isArray(p?.bulkTiers) ? p.bulkTiers.slice().sort((a,b)=>b.quantity-a.quantity) : []
  const sortedTiersAsc = Array.isArray(p?.bulkTiers) ? p.bulkTiers.slice().sort((a,b)=>a.quantity-b.quantity) : []
  const minTierQty = sortedTiersAsc.length > 0 ? Math.max(1, Number(sortedTiersAsc[0].quantity||1)) : (p?.bulkDiscountQuantity || 1)
  let effectiveUnitPrice = basePrice
  const hitTier = sortedTiersDesc.find(t => qty >= Number(t.quantity||0))
  if (hitTier) effectiveUnitPrice = Math.max(0, basePrice - Number(hitTier.priceReduction||0))
  else if (p?.bulkDiscountQuantity > 0 && qty >= Number(p.bulkDiscountQuantity)) effectiveUnitPrice = Math.max(0, basePrice - Number(p.bulkDiscountPriceReduction||0))
  const savingsTotal = Math.max(0, (basePrice - effectiveUnitPrice)) * qty
  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-12">
        <header className="flex items-center justify-between border-b border-gray-50 pb-8 animate-in fade-in slide-in-from-top-4 duration-700">
          <button 
            onClick={() => navigate(-1)} 
            className="group flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-colors"
          >
            <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16l-4-4m0 0l4-4m-4 4h18" /></svg>
            Back to Catalog
          </button>
          <div className="flex items-center gap-3">
            <span className="h-8 w-8 rounded-xl bg-blue-600 flex items-center justify-center text-[10px] font-black text-white shadow-lg border border-blue-500">
              C2K
            </span>
            <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Product Detail</span>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="space-y-6">
            {(() => {
              const imgs = (activeVariant?.images?.length ? activeVariant.images : (p.images || []))
              const current = imgs[activeImageIndex]?.url || imgs[0]?.url
              return (
                <>
                  <div
                    className="relative bg-gray-50/50 border border-gray-100 rounded-[3rem] overflow-hidden aspect-square flex items-center justify-center p-0 group hover:shadow-2xl transition-all duration-700"
                    onMouseEnter={() => setZoom(z => ({ ...z, on: true }))}
                    onMouseLeave={() => setZoom({ on: false, x: 0, y: 0 })}
                    onMouseMove={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect()
                      const x = ((e.clientX - rect.left) / rect.width) * 100
                      const y = ((e.clientY - rect.top) / rect.height) * 100
                      setZoom({ on: true, x, y })
                    }}
                    onClick={() => setLightboxOpen(true)}
                    title="Click to view fullscreen"
                  >
                    {current ? (
                      <>
                        <img
                          src={current}
                          alt={p.name}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-contain transition-transform duration-300"
                          style={{ padding: '3rem', transform: zoom.on ? 'scale(1.6)' : 'scale(1)', transformOrigin: `${zoom.x}% ${zoom.y}%` }}
                        />
                      </>
                    ) : (
                      <div className="text-8xl">📦</div>
                    )}
                  </div>
                  {imgs.length > 1 && (
                    <div className="flex gap-3 overflow-x-auto pb-2 pt-2 custom-scrollbar">
                      {imgs.map((img, i) => (
                        <button
                          key={i}
                          onClick={() => { setActiveImageIndex(i) }}
                          className={`h-20 w-20 sm:h-24 sm:w-24 flex-shrink-0 bg-white border rounded-2xl p-2 transition-all ${i===activeImageIndex ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-100 hover:border-blue-300'}`}
                          title={`Image ${i+1}`}
                        >
                          <img src={img.url} alt={`${p.name} ${i+1}`} loading="lazy" decoding="async" className="w-full h-full object-contain" />
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )
            })()}
          </div>

          <div className="space-y-10 py-4">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest border border-blue-100">
                {p.category || 'General Collection'}
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter leading-tight">{p.name}</h1>
              <div className="flex items-center gap-6 pt-2">
                <div className="flex items-center gap-2">
                  <div className="flex text-amber-500">
                    {Array.from({length:5}).map((_,i)=>(
                      <svg key={i} className={`w-5 h-5 ${i < Math.round(p.ratingAvg||0) ? 'fill-amber-400' : 'fill-gray-200'}`} viewBox="0 0 24 24"><path d="M12 .587l3.668 7.431L24 9.748l-6 5.848L19.335 24 12 19.771 4.665 24 6 15.596 0 9.748l8.332-1.73z"/></svg>
                    ))}
                  </div>
                  <div className="text-xs font-bold text-gray-500">({p.ratingCount || 0})</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-4xl font-black text-gray-900 tracking-tighter">
                    {authed ? `₹${effectiveUnitPrice.toLocaleString()}/u` : 'Login to view price'}
                  </div>
                  {authed && (
                    <button
                      onClick={async (e) => {
                        e.preventDefault()
                        if (!authed) { navigate('/login'); return }
                        if (Array.isArray(p.variants) && p.variants.length > 0 && !activeVariant) return
                        const minTier = (Array.isArray(p?.bulkTiers) && p.bulkTiers.length>0) ? Math.max(1, Number(p.bulkTiers.slice().sort((a,b)=>a.quantity-b.quantity)[0].quantity||1)) : (p?.bulkDiscountQuantity || 1)
                        const q = Math.max(minTier, 1)
                    const ok = await addToCart({ ...p, minOrderQty: Math.max(minTierQty, qty) }, activeVariant || undefined)
                        if (ok) {
                          try {
                            const { data } = await api.get(`/api/products/recommend`, { params: { productId: id } })
                            const item = data?.items?.[0] || null
                            setRec(item)
                            if (item) setRecOpen(true)
                          } catch {}
                        }
                      }}
                      disabled={!authed || ((activeVariant ? (activeVariant.stock || 0) : p.stock) <= 0) || (sortedTiersAsc.length>0 && qty < minTierQty)}
                      title={authed ? ((sortedTiersAsc.length>0 && qty < minTierQty) ? `Minimum order quantity is ${minTierQty} units` : ((activeVariant ? (activeVariant.stock || 0) : p.stock) > 0 ? 'Add to Cart' : 'Sold Out')) : 'Login to add'}
                      className="inline-flex items-center justify-center h-11 w-11 rounded-2xl bg-gray-900 text-white shadow-md hover:bg-gray-800 active:scale-95 disabled:opacity-40"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M7 6h13l-1.2 7H9.2L7 6Z" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                        <circle cx="10" cy="19" r="1.4" fill="currentColor" />
                        <circle cx="17" cy="19" r="1.4" fill="currentColor" />
                      </svg>
                    </button>
                  )}
                </div>
                {authed && (
                  <div className="flex items-center gap-3">
                    <div className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl bg-white border border-gray-100">
                      <button onClick={() => setQty(q => Math.max(1, q-1))} className="h-6 w-6 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center">−</button>
                      <span className="w-8 text-center text-sm font-black">{qty}</span>
                      <button onClick={() => setQty(q => q+1)} className="h-6 w-6 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center">+</button>
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-emerald-600">
                      {savingsTotal > 0 ? `You save ₹${savingsTotal.toLocaleString()} on this selection` : (sortedTiersAsc.length>0 && qty < minTierQty ? `Minimum order quantity is ${minTierQty}` : '')}
                    </div>
                  </div>
                )}
                {authed && <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-lg">Inclusive of all taxes</div>}
              </div>
            </div>

            {authed && p.bulkDiscountQuantity > 0 && (
              <div className="relative overflow-hidden bg-emerald-50/50 border border-emerald-100 rounded-[2.5rem] p-8 space-y-4 group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-100 rounded-full -mr-16 -mt-16 opacity-30 blur-2xl transition-transform group-hover:scale-150 duration-700"></div>
                <div className="flex items-center gap-3 relative z-10">
                  <div className="h-8 w-8 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-200">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <span className="text-xs font-black text-emerald-700 uppercase tracking-widest">Exclusive Bulk Buying Offer</span>
                </div>
                <div className="text-base font-bold text-emerald-900 relative z-10 leading-relaxed">
                  Unlock wholesale pricing! Buy <span className="text-xl font-black text-emerald-600 px-1">{p.bulkDiscountQuantity} units</span> or more and automatically receive <span className="text-xl font-black text-emerald-600 px-1">₹{p.bulkDiscountPriceReduction} OFF</span> on every single unit at checkout.
                </div>
              </div>
            )}
            {authed && Array.isArray(p.bulkTiers) && p.bulkTiers.length > 0 && (
              <div className="bg-white border border-gray-100 rounded-2xl p-6">
                <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Bulk Pricing</div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500">
                      <th className="py-2">Quantity</th>
                      <th className="py-2">Price/Unit</th>
                      <th className="py-2">Savings/unit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const tiers = p.bulkTiers.slice().sort((a,b) => a.quantity - b.quantity)
                      return tiers.map((t, idx) => {
                        const next = tiers[idx+1]
                        const from = t.quantity
                        const to = next ? (next.quantity - 1) : null
                        const label = to ? `${from}-${to}` : `${from}+`
                        const base = Number(activeVariant?.price ?? p.price ?? 0)
                        const eff = Math.max(0, base - Number(t.priceReduction || 0))
                        const perSave = Math.max(0, base - eff)
                        return (
                          <tr key={idx} className="border-t">
                            <td className="py-2 font-semibold text-gray-800">{label}</td>
                            <td className="py-2 font-bold text-gray-900">₹{eff.toLocaleString()}</td>
                            <td className="py-2 font-bold text-emerald-700">₹{perSave.toLocaleString()}</td>
                          </tr>
                        )
                      })
                    })()}
                  </tbody>
                </table>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                {(() => {
                  const stock = activeVariant ? (activeVariant.stock || 0) : p.stock
                  const status = getStockStatus(stock)
                  return (
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border ${status.bg} ${status.color} ${status.border}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${stock > 0 ? (stock <= 5 ? 'bg-orange-500 animate-pulse' : 'bg-emerald-500') : 'bg-red-500'}`} />
                      {status.text}
                    </div>
                  )
                })()}
                <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-gray-50 text-[10px] font-black uppercase tracking-widest text-gray-400">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                  Verified Genuine
                </div>
              </div>
            </div>

            {Array.isArray(p.variants) && p.variants.length > 0 && (
              <div className="space-y-6 pt-8 border-t border-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Color</div>
                    <div className="flex flex-wrap gap-2">
                      {[...new Set(p.variants.map(v => v.attributes?.color).filter(Boolean))].map((c,i)=> {
                        const enabled = p.variants.some(v =>
                          (v.attributes?.color || '') === c &&
                          ((selected.ram ? (v.attributes?.ram || '') === selected.ram : true)) &&
                          ((selected.storage ? (v.attributes?.storage || '') === selected.storage : true))
                        )
                        return (
                          <button key={i}
                            disabled={!enabled}
                            onClick={()=>enabled && setSelected(s=>({ ...s, color: c }))}
                            className={`px-3 py-1.5 rounded-xl text-[10px] font-black border transition-colors ${selected.color===c ? 'bg-gray-900 text-white border-gray-900' : enabled ? 'bg-white text-gray-700 border-gray-200 hover:border-gray-400' : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'}`}
                          >{c}</button>
                        )
                      })}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Storage</div>
                    <div className="flex flex-wrap gap-2">
                      {[...new Set(p.variants.map(v => v.attributes?.storage).filter(Boolean))].map((s,i)=> {
                        const enabled = p.variants.some(v =>
                          (selected.color ? (v.attributes?.color || '') === selected.color : true) &&
                          ((v.attributes?.storage || '') === s) &&
                          (selected.ram ? (v.attributes?.ram || '') === selected.ram : true)
                        )
                        return (
                          <button key={i}
                            disabled={!enabled}
                            onClick={()=>enabled && setSelected(prev=>({ ...prev, storage: s }))}
                            className={`px-3 py-1.5 rounded-xl text-[10px] font-black border transition-colors ${selected.storage===s ? 'bg-gray-900 text-white border-gray-900' : enabled ? 'bg-white text-gray-700 border-gray-200 hover:border-gray-400' : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'}`}
                          >{s}</button>
                        )
                      })}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">RAM</div>
                    <div className="flex flex-wrap gap-2">
                      {[...new Set(p.variants.map(v => v.attributes?.ram).filter(Boolean))].map((r,i)=> {
                        const enabled = p.variants.some(v =>
                          (selected.color ? (v.attributes?.color || '') === selected.color : true) &&
                          (selected.storage ? (v.attributes?.storage || '') === selected.storage : true) &&
                          ((v.attributes?.ram || '') === r)
                        )
                        return (
                          <button key={i}
                            disabled={!enabled}
                            onClick={()=>enabled && setSelected(prev=>({ ...prev, ram: r }))}
                            className={`px-3 py-1.5 rounded-xl text-[10px] font-black border transition-colors ${selected.ram===r ? 'bg-gray-900 text-white border-gray-900' : enabled ? 'bg-white text-gray-700 border-gray-200 hover:border-gray-400' : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'}`}
                          >{r}</button>
                        )
                      })}
                    </div>
                  </div>
                </div>
                {activeVariant && (
                  <div className="text-[11px] font-bold text-gray-600">
                    SKU: {activeVariant.sku || '-'}
                  </div>
                )}
              </div>
            )}

            {Array.isArray(p.highlights) && p.highlights.length > 0 && (
              <div className="space-y-3 pt-8 border-t border-gray-50">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Product Highlights</div>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {p.highlights.map((h,i)=>(
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-800">
                      <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                      <span className="font-medium">{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="space-y-4 pt-8 border-t border-gray-50">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Product Narrative</h3>
              <div className="relative overflow-hidden rounded-[2rem] border border-gray-100">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-white to-emerald-50"></div>
                <div className="relative p-8 space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-gray-100 text-[10px] font-black uppercase tracking-widest text-gray-500">
                    Product Details
                  </div>
                  <p className="text-base text-gray-700 font-medium leading-[1.9] whitespace-pre-line max-w-xl">
                    {p.description || "Experience the perfect blend of innovation and craftsmanship. This product is meticulously designed to exceed expectations and integrate seamlessly into modern workflows."}
                  </p>
                  <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-gray-500">
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white border border-gray-100">✔ Warranty</span>
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white border border-gray-100">✔ GST Invoice</span>
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white border border-gray-100">✔ Fast Dispatch</span>
                  </div>
                </div>
              </div>
              <div>
                <button
                  onClick={() => { if (!authed) { navigate('/login'); return } setReviewOpen(true) }}
                  className="px-6 py-3 rounded-2xl bg-violet-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-violet-500 transition-all"
                >
                  Rate this Product
                </button>
              </div>
            </div>

            <div className="pt-10 flex flex-col sm:flex-row gap-4">
              <button
                onClick={async () => {
                  if (!authed) { navigate('/login'); return }
                  const ok = await addToCart(p, activeVariant || undefined)
                  if (ok) {
                    try {
                      const { data } = await api.get(`/api/products/recommend`, { params: { productId: id } })
                      const item = data?.items?.[0] || null
                      setRec(item)
                      if (item) setRecOpen(true)
                    } catch {}
                  }
                }}
                disabled={!authed || ((activeVariant ? (activeVariant.stock || 0) : p.stock) <= 0)}
                className="flex-2 bg-gray-900 text-white px-12 py-5 rounded-[2rem] text-sm font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-gray-800 transition-all transform hover:-translate-y-1 active:scale-95 disabled:opacity-30 disabled:hover:translate-y-0 disabled:cursor-not-allowed"
              >
                {authed ? ((activeVariant ? (activeVariant.stock || 0) : p.stock) > 0 ? 'Secure Buy Now' : 'Sold Out') : 'Login to Buy'}
              </button>
            </div>
            
            <div className="pt-8 flex items-center gap-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">
              <div className="flex items-center gap-2"><svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg> 7-Day Returns</div>
              <div className="flex items-center gap-2"><svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg> Secure Payment</div>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-12">
        {similar.length > 0 && (
          <section className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Similar Products</h3>
            <RecGrid items={similar} />
          </section>
        )}
        {rec && (
          <section className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Recommended For You</h3>
            <RecGrid items={[rec]} />
          </section>
        )}
      </div>
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6" onClick={() => setLightboxOpen(false)}>
          <div className="relative w-full max-w-5xl" onClick={e => e.stopPropagation()}>
            {(() => {
              const imgs = (activeVariant?.images?.length ? activeVariant.images : (p.images || []))
              const current = imgs[activeImageIndex]?.url || imgs[0]?.url
              return (
                <>
                  <img src={current} alt={p.name} className="w-full max-h-[70vh] object-contain rounded-2xl bg-white" />
                  <button
                    className="absolute top-3 right-3 h-10 w-10 rounded-xl bg-white/90 text-gray-700 flex items-center justify-center"
                    onClick={() => setLightboxOpen(false)}
                    title="Close"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <div className="mt-4 flex items-center justify-between">
                    <button
                      className="px-3 py-2 rounded-lg bg-white text-gray-700"
                      onClick={() => setActiveImageIndex(i => Math.max(0, i - 1))}
                      disabled={activeImageIndex <= 0}
                    >
                      Prev
                    </button>
                    <div className="flex gap-2 overflow-x-auto custom-scrollbar">
                      {imgs.map((img, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveImageIndex(i)}
                          className={`h-16 w-16 rounded-xl overflow-hidden border ${i===activeImageIndex ? 'border-blue-500' : 'border-transparent opacity-70'}`}
                          title={`Image ${i+1}`}
                        >
                          <img src={img.url} alt={`${p.name} ${i+1}`} className="w-full h-full object-contain bg-white" />
                        </button>
                      ))}
                    </div>
                    <button
                      className="px-3 py-2 rounded-lg bg-white text-gray-700"
                      onClick={() => setActiveImageIndex(i => {
                        const imgs = (activeVariant?.images?.length ? activeVariant.images : (p.images || []))
                        const last = Math.max(0, imgs.length - 1)
                        return Math.min(last, i + 1)
                      })}
                      disabled={(() => {
                        const imgs = (activeVariant?.images?.length ? activeVariant.images : (p.images || []))
                        return activeImageIndex >= imgs.length - 1
                      })()}
                    >
                      Next
                    </button>
                  </div>
                </>
              )
            })()}
          </div>
        </div>
      )}
      {recOpen && rec && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setRecOpen(false)} />
          <div className="absolute bottom-0 inset-x-0 bg-white rounded-t-3xl overflow-hidden shadow-2xl" style={{ maxHeight: '70vh' }}>
            <div className="flex justify-center pt-3 pb-1">
              <div className="h-1 w-10 rounded-full bg-gray-200" />
            </div>
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
              <span className="text-sm font-black text-gray-900 uppercase tracking-widest">Recommended For You</span>
              <button onClick={() => setRecOpen(false)}
                className="h-8 w-8 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="overflow-y-auto p-5 space-y-3" style={{ maxHeight: 'calc(70vh - 80px)' }}>
              <div className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl p-3">
                <div className="h-12 w-12 rounded-lg bg-gray-50 border border-gray-100 overflow-hidden flex items-center justify-center flex-shrink-0">
                  {rec.images && rec.images[0]?.url
                    ? <img src={rec.images[0].url} alt={rec.name} className="h-full w-full object-contain" />
                    : <span className="text-[10px] text-gray-400">📦</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-gray-900 truncate">{rec.name}</div>
                  <div className="text-[11px] text-gray-500">{rec.price != null ? `₹${Number(rec.price).toLocaleString()}` : 'Login to view'}</div>
                </div>
              </div>
            </div>
            <div className="p-5">
              <div className="flex gap-3">
                <button
                  onClick={async () => { await addToCart(rec); setRecOpen(false) }}
                  className="flex-1 py-4 bg-gray-900 text-white rounded-2xl text-sm font-black uppercase tracking-widest"
                >
                  Add This Also
                </button>
                <button
                  onClick={() => setRecOpen(false)}
                  className="flex-1 py-4 bg-gray-100 text-gray-700 rounded-2xl text-sm font-black uppercase tracking-widest"
                >
                  Skip For Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {reviewOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6" onClick={()=>setReviewOpen(false)}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-md space-y-4" onClick={(e)=>e.stopPropagation()}>
            <div className="text-lg font-black text-gray-900">Your Feedback</div>
            <div className="flex items-center gap-2">
              {Array.from({length:5}).map((_,i)=>(
                <button key={i} onClick={()=>setMyRating(i+1)}>
                  <svg className={`w-8 h-8 ${i < myRating ? 'fill-amber-400' : 'fill-gray-200'}`} viewBox="0 0 24 24"><path d="M12 .587l3.668 7.431L24 9.748l-6 5.848L19.335 24 12 19.771 4.665 24 6 15.596 0 9.748l8.332-1.73z"/></svg>
                </button>
              ))}
            </div>
            <textarea className="w-full bg-gray-50 border rounded-2xl p-3 text-sm" rows="4" placeholder="Share your experience (optional)" value={myComment} onChange={e=>setMyComment(e.target.value)} />
            <div className="flex gap-3">
              <button onClick={()=>setReviewOpen(false)} className="flex-1 px-4 py-3 rounded-2xl bg-gray-100 text-gray-600 text-[10px] font-black uppercase tracking-widest">Cancel</button>
              <button
                onClick={async ()=>{
                  if (myRating < 1) return;
                  try {
                    const { data } = await api.post(`/api/products/${id}/reviews`, { rating: myRating, comment: myComment })
                    setP(prev => ({ ...prev, ratingAvg: data.ratingAvg, ratingCount: data.ratingCount }))
                    setReviewOpen(false); setMyRating(0); setMyComment('')
                  } catch (e) {
                    alert(e?.response?.data?.error || 'Failed to submit')
                  }
                }}
                className="flex-1 px-4 py-3 rounded-2xl bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
      
    </div>
  )
}

function RecGrid({ items }) {
  const navigate = useNavigate()
  const authed = !!localStorage.getItem('token')
  const { addToCart } = useCart()
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
      {items.map((p) => (
        <div
          key={p._id || p.id}
          className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col cursor-pointer border border-gray-100 hover:border-blue-100"
          onClick={() => navigate(`/products/${p._id || p.id}`)}
        >
          <div className="relative bg-gray-50">
            <div className="aspect-square flex items-center justify-center overflow-hidden p-4">
              {p.images && p.images.length > 0
                ? <img src={p.images[0].url || p.images[0]} alt={p.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" />
                : <div className="text-5xl opacity-30">📦</div>}
            </div>
          </div>
          <div className="p-3 flex-1 flex flex-col">
            <div className="text-sm font-bold text-gray-900 line-clamp-2 leading-tight hover:text-[#1244ea] transition-colors mb-2">
              {p.name}
            </div>
            <div className="mt-auto flex items-center justify-between">
              <div className="text-base font-black text-gray-900 leading-none">
                {authed && p.price != null ? `₹${Number(p.price).toLocaleString()}` : (
                  <span className="text-gray-400">Login to view</span>
                )}
              </div>
              <button
                onClick={e => { e.stopPropagation(); e.preventDefault(); if (!authed) return; if (Array.isArray(p.variants) && p.variants.length > 0) { navigate(`/products/${p._id || p.id}`); return; } addToCart(p) }}
                disabled={!authed || ((Array.isArray(p.variants) && p.variants.length > 0) ? false : (p.stock != null && p.stock <= 0))}
                className="h-9 w-9 rounded-xl bg-[#1244ea] text-white flex items-center justify-center shadow-sm hover:bg-[#0d35c7] active:scale-95 disabled:opacity-40 transition-all flex-shrink-0"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M7 6h13l-1.2 7H9.2L7 6Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="10" cy="19" r="1.4" fill="currentColor" />
                  <circle cx="17" cy="19" r="1.4" fill="currentColor" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
