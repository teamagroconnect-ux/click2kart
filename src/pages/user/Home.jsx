import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../lib/api'
import { useCart } from '../../lib/CartContext'

export default function Home() {
  const [cats, setCats] = useState([])
  const [featured, setFeatured] = useState([])
  const { addToCart } = useCart()

  useEffect(() => {
    api.get('/api/public/categories').then(({ data }) => setCats(data))
  }, [])

  useEffect(() => {
    api
      .get('/api/products', { params: { page: 1, limit: 8 } })
      .then(({ data }) => setFeatured(data.items))
  }, [])

  return (
    <div className="bg-white">
      {/* Hero Section - B2B Aggressive Style */}
      <section className="relative overflow-hidden bg-gray-900 pt-20 pb-32 md:pt-32 md:pb-48">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[800px] bg-blue-600/10 rounded-full blur-[140px] -z-0"></div>
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[100px] -z-0"></div>
        
        <div className="max-w-7xl mx-auto px-6 md:px-10 relative z-10 flex flex-col items-center text-center space-y-12 animate-in fade-in slide-in-from-bottom-12 duration-1000">
          <div className="space-y-8 max-w-4xl">
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-black tracking-[0.3em] uppercase border border-blue-500/20 shadow-2xl backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-blue-500 animate-ping"></span>
              India's Premier B2B Tech Hub
            </div>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white leading-[0.95]">
              Scale Your <span className="text-blue-500">Business</span> <br />
              With Premium <span className="text-gray-400">Tech.</span>
            </h1>
            <p className="text-lg md:text-2xl text-gray-400 font-medium leading-relaxed max-w-3xl mx-auto">
              Direct wholesale access to top-tier electronics. GST compliant billing, 
              bulk-only pricing, and Pan-India logistics for modern enterprises.
            </p>
            <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link
                to="/products"
                className="group relative inline-flex items-center justify-center bg-blue-600 text-white px-12 py-5 rounded-3xl text-sm font-black uppercase tracking-widest shadow-[0_20px_50px_rgba(37,99,235,0.3)] hover:bg-blue-500 transition-all transform hover:-translate-y-2 active:scale-95 overflow-hidden"
              >
                <span className="relative z-10 flex items-center">
                  Wholesale Catalog
                  <svg className="w-5 h-5 ml-3 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </Link>
              <Link
                to="/partner"
                className="inline-flex items-center justify-center border-2 border-white/10 bg-white/5 text-white backdrop-blur-md px-12 py-5 rounded-3xl text-sm font-black uppercase tracking-widest hover:bg-white/10 hover:border-white/20 transition-all transform hover:-translate-y-1 active:scale-95"
              >
                Become a Partner
              </Link>
            </div>
          </div>

          {/* B2B Trust Badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-6xl pt-12">
            {[
              { t: 'GST Invoicing', d: 'Claim 18% Input Tax Credit', i: '📄' },
              { t: 'Bulk Pricing', d: 'Up to 40% Volume Discounts', i: '📦' },
              { t: 'Express Freight', d: 'Priority Pan-India Logistics', i: '✈️' },
              { t: 'Brand Warranty', d: '100% Genuine Authorized Stock', i: '🛡️' }
            ].map((f, i) => (
              <div key={i} className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] text-left hover:bg-white/10 hover:border-blue-500/50 transition-all duration-500 group cursor-default shadow-2xl">
                <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform duration-500">{f.i}</div>
                <div className="font-black text-white text-base tracking-tight">{f.t}</div>
                <div className="text-xs text-gray-500 font-bold mt-2 leading-relaxed">{f.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-blue-600 py-16 -mt-10 relative z-20 rounded-[4rem] shadow-[0_-20px_50px_rgba(0,0,0,0.1)]">
        <div className="max-w-7xl mx-auto px-10 grid grid-cols-2 lg:grid-cols-4 gap-12 text-center">
          {[
            { n: '500+', t: 'Active Partners' },
            { n: '₹10Cr+', t: 'Sales Generated' },
            { n: '50+', t: 'Premium Brands' },
            { n: '24/7', t: 'B2B Support' }
          ].map((s, i) => (
            <div key={i} className="space-y-1">
              <div className="text-4xl md:text-5xl font-black text-white tracking-tighter">{s.n}</div>
              <div className="text-[10px] font-black text-blue-100 uppercase tracking-widest">{s.t}</div>
            </div>
          ))}
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-6 md:px-10 py-32 space-y-32">
        {/* Categories Section - Professional B2B Grid */}
        <section className="space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3">
              <div className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em]">Verticals</div>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">Wholesale Verticals</h2>
            </div>
            <p className="text-sm text-gray-400 font-bold max-w-xs md:text-right">Select a vertical to explore bulk-ready inventory and exclusive volume pricing.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {cats.map((c) => (
              <Link
                key={c._id}
                to={`/products?category=${encodeURIComponent(c.name)}`}
                className="group relative bg-white border border-gray-100 rounded-[3rem] p-10 overflow-hidden hover:shadow-[0_40px_80px_-15px_rgba(37,99,235,0.15)] hover:scale-[1.05] transition-all duration-700"
              >
                <div className="relative z-10 space-y-3">
                  <div className="h-12 w-12 rounded-2xl bg-gray-50 flex items-center justify-center text-xl group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="font-black text-gray-900 text-lg tracking-tight capitalize group-hover:text-blue-600 transition-colors">{c.name}</div>
                  <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-tight">
                    {c.description || 'Explore Bulk Stock'}
                  </div>
                </div>
                <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-blue-50/50 rounded-full group-hover:scale-[4] transition-transform duration-1000 blur-2xl"></div>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured Products - B2B Catalog Style */}
        <section className="space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-gray-100 pb-10">
            <div className="space-y-3">
              <div className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em]">Market Ready</div>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">Top Movers</h2>
            </div>
            <Link to="/products" className="group flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] text-gray-400 hover:text-blue-600 transition-all">
              Full Inventory
              <svg className="w-5 h-5 transition-transform group-hover:translate-x-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </Link>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-10">
            {featured.map((p) => (
              <div
                key={p._id}
                className="group bg-white border border-gray-50 rounded-[3rem] overflow-hidden hover:shadow-[0_50px_100px_-20px_rgba(0,0,0,0.12)] flex flex-col transition-all duration-700 transform hover:-translate-y-4"
              >
                <Link to={`/products/${p._id}`} className="relative block">
                  <div className="bg-gray-50/50 aspect-square flex items-center justify-center overflow-hidden p-12">
                    {p.images && p.images.length > 0 ? (
                      <img
                        src={p.images[0].url}
                        alt={p.name}
                        className="w-full h-full object-contain transition-transform duration-1000 group-hover:scale-110"
                      />
                    ) : (
                      <div className="text-6xl">📦</div>
                    )}
                  </div>
                  {p.bulkDiscountQuantity > 0 && (
                    <div className="absolute top-6 right-6 bg-emerald-500 text-white text-[10px] font-black px-4 py-1.5 rounded-full shadow-xl shadow-emerald-200 uppercase tracking-[0.2em] animate-pulse">
                      Bulk Savings
                    </div>
                  )}
                </Link>
                <div className="p-10 flex-1 flex flex-col space-y-6">
                  <div className="space-y-2">
                    <div className="text-[10px] uppercase text-blue-600 font-black tracking-widest bg-blue-50 px-3 py-1 rounded-lg inline-block">
                      {p.category || 'General'}
                    </div>
                    <Link to={`/products/${p._id}`} className="block group-hover:text-blue-600 transition-colors">
                      <div className="font-black text-gray-900 line-clamp-2 min-h-[3.5rem] text-lg leading-tight tracking-tight">{p.name}</div>
                    </Link>
                  </div>
                  
                  <div className="flex items-center justify-between pt-6 border-t border-gray-50 mt-auto">
                    <div className="space-y-1">
                      <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Single Unit</div>
                      <div className="text-2xl font-black text-gray-900 tracking-tighter">₹{p.price.toLocaleString()}</div>
                    </div>
                    <button 
                      onClick={() => addToCart(p)}
                      className="h-14 w-14 bg-gray-900 text-white rounded-2xl flex items-center justify-center hover:bg-blue-600 transition-all shadow-2xl active:scale-90"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* B2B Partnership Banner */}
        <section className="relative overflow-hidden bg-gray-900 rounded-[4rem] p-12 md:p-24 text-center space-y-10">
          <div className="absolute inset-0 bg-blue-600/10 blur-[120px] -z-0"></div>
          <div className="relative z-10 max-w-3xl mx-auto space-y-6">
            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-tight">
              Ready to <span className="text-blue-500">Transform</span> Your Inventory?
            </h2>
            <p className="text-lg text-gray-400 font-medium leading-relaxed">
              Join 500+ businesses sourcing directly from Click2Kart. Get access to credit lines, 
              dedicated account managers, and exclusive factory-direct stock.
            </p>
            <div className="pt-8">
              <Link
                to="/signup"
                className="inline-flex items-center justify-center bg-white text-gray-900 px-12 py-5 rounded-3xl text-sm font-black uppercase tracking-widest shadow-2xl hover:bg-gray-100 transition-all transform hover:-translate-y-2 active:scale-95"
              >
                Create B2B Account
                <svg className="w-5 h-5 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Floating WhatsApp Button */}
      <a 
        href="https://wa.me/917978880244" 
        target="_blank" 
        rel="noreferrer"
        className="fixed bottom-24 right-6 lg:bottom-10 lg:right-10 z-50 group flex items-center gap-3"
      >
        <div className="bg-white px-5 py-3 rounded-2xl shadow-2xl border border-gray-50 flex-col items-end hidden lg:flex group-hover:translate-x-0 translate-x-4 opacity-0 group-hover:opacity-100 transition-all duration-500">
          <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest leading-none">Need Help?</span>
          <span className="text-[9px] font-bold text-emerald-600 mt-1">Chat on WhatsApp</span>
        </div>
        <div className="h-16 w-16 bg-emerald-500 text-white rounded-[2rem] flex items-center justify-center shadow-[0_20px_50px_rgba(16,185,129,0.3)] hover:bg-emerald-400 transition-all transform hover:-translate-y-2 active:scale-95 animate-in zoom-in duration-700">
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.246 2.248 3.484 5.232 3.484 8.412-.003 6.557-5.338 11.892-11.893 11.892-1.997-.001-3.951-.5-5.688-1.448l-6.309 1.656zm6.224-3.82c1.516.903 3.125 1.378 4.773 1.379 5.428 0 9.843-4.415 9.845-9.845.001-2.631-1.023-5.104-2.883-6.964s-4.333-2.883-6.964-2.884c-5.43 0-9.844 4.415-9.846 9.845-.001 1.696.442 3.351 1.282 4.796l-1.07 3.907 4.008-1.052zm11.332-6.845c-.312-.156-1.848-.912-2.126-1.013-.279-.1-.482-.15-.683.15-.201.3-.778 1.013-.954 1.213-.177.2-.353.226-.665.07-.312-.156-1.318-.486-2.512-1.55-.928-.828-1.555-1.85-1.737-2.163-.182-.313-.02-.482.137-.638.141-.14.312-.363.469-.544.156-.181.209-.312.312-.519.104-.207.052-.389-.026-.544-.078-.156-.683-1.646-.936-2.257-.246-.594-.497-.514-.683-.524-.176-.01-.378-.011-.58-.011s-.53.076-.807.377c-.278.301-1.061 1.038-1.061 2.532s1.087 2.94 1.238 3.141c.151.201 2.138 3.265 5.18 4.577.723.312 1.288.499 1.728.639.726.231 1.387.198 1.909.12.583-.087 1.848-.755 2.11-1.482.261-.728.261-1.355.183-1.482-.078-.127-.29-.203-.602-.359z"/></svg>
        </div>
      </a>
    </div>
  )
}
