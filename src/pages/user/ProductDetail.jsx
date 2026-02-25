import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import api from '../../lib/api'
import { useCart, getStockStatus } from '../../lib/CartContext'

export default function ProductDetail(){
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const [p, setP] = useState(null)
  useEffect(()=>{ api.get(`/api/products/${id}`).then(({data})=>setP(data)) }, [id])
  if (!p) return <div className="p-10 text-center text-lg text-gray-500">Loading product details...</div>
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
            <div className="bg-gray-50/50 border border-gray-100 rounded-[3rem] overflow-hidden aspect-square flex items-center justify-center p-12 group hover:shadow-2xl transition-all duration-700">
              {p.images && p.images.length>0
                ? <img src={p.images[0].url} alt={p.name} className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110" />
                : <div className="text-8xl">📦</div>}
            </div>
            {p.images && p.images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                {p.images.map((img, i) => (
                  <div key={i} className="h-24 w-24 flex-shrink-0 bg-gray-50 border border-gray-100 rounded-2xl p-4 cursor-pointer hover:border-blue-500 transition-colors">
                    <img src={img.url} className="w-full h-full object-contain" />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-10 py-4">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest border border-blue-100">
                {p.category || 'General Collection'}
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter leading-tight">{p.name}</h1>
              <div className="flex items-center gap-4 pt-2">
                <div className="text-4xl font-black text-gray-900 tracking-tighter">₹{p.price.toLocaleString()}</div>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-lg">Inclusive of all taxes</div>
              </div>
            </div>

            {p.bulkDiscountQuantity > 0 && (
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

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                {(() => {
                  const status = getStockStatus(p.stock)
                  return (
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border ${status.bg} ${status.color} ${status.border}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${p.stock > 0 ? (p.stock <= 5 ? 'bg-orange-500 animate-pulse' : 'bg-emerald-500') : 'bg-red-500'}`} />
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

            <div className="space-y-4 pt-8 border-t border-gray-50">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Product Narrative</h3>
              <p className="text-base text-gray-500 font-medium leading-[1.8] whitespace-pre-line max-w-xl">
                {p.description || "Experience the perfect blend of innovation and craftsmanship. This product is meticulously designed to exceed your expectations and integrate seamlessly into your digital ecosystem."}
              </p>
            </div>

            <div className="pt-10 flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => {
                  if (addToCart(p)) {
                    navigate('/cart')
                  }
                }}
                disabled={p.stock <= 0}
                className="flex-2 bg-gray-900 text-white px-12 py-5 rounded-[2rem] text-sm font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-gray-800 transition-all transform hover:-translate-y-1 active:scale-95 disabled:opacity-30 disabled:hover:translate-y-0 disabled:cursor-not-allowed"
              >
                {p.stock > 0 ? 'Secure Buy Now' : 'Sold Out'}
              </button>
              <button
                onClick={() => {
                  addToCart(p)
                }}
                disabled={p.stock <= 0}
                className="flex-1 bg-white border-2 border-gray-100 text-gray-900 px-10 py-5 rounded-[2rem] text-sm font-black uppercase tracking-[0.2em] hover:bg-gray-50 hover:border-gray-200 transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {p.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
              </button>
            </div>
            
            <div className="pt-8 flex items-center gap-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">
              <div className="flex items-center gap-2"><svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg> 7-Day Returns</div>
              <div className="flex items-center gap-2"><svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg> Secure Payment</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
}

