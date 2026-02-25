import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
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
      <section className="relative overflow-hidden bg-white py-12 md:py-24">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-50/50 rounded-full blur-[120px] -z-10"></div>
        <div className="max-w-7xl mx-auto px-6 md:px-10 flex flex-col items-center text-center space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="space-y-6 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black tracking-[0.2em] uppercase border border-blue-100 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse"></span>
              The Premium Tech Experience
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-gray-900 leading-[1.1]">
              Elevate Your <span className="text-blue-600">Digital Lifestyle</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-500 font-medium leading-relaxed max-w-2xl mx-auto">
              Discover a curated selection of premium electronics, mobiles, and accessories with GST billing and nationwide reliability.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/products"
                className="group relative inline-flex items-center justify-center bg-gray-900 text-white px-10 py-4 rounded-2xl text-sm font-black uppercase tracking-widest shadow-2xl hover:bg-gray-800 transition-all transform hover:-translate-y-1 active:scale-95"
              >
                Explore Catalog
                <svg className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </Link>
              <Link
                to="/order"
                className="inline-flex items-center justify-center border-2 border-gray-100 bg-white text-gray-900 px-10 py-4 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-gray-50 hover:border-gray-200 transition-all active:scale-95"
              >
                Order Now
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-5xl">
            {[
              { t: 'Fast Delivery', d: 'Same-day delivery available', i: '🚚' },
              { t: 'GST Billed', d: 'Genuine products with tax invoices', i: '📜' },
              { t: 'Store Pickup', d: 'Visit our local experience centers', i: '🏢' },
              { t: 'Top Brands', d: 'Curated deals from market leaders', i: '⭐' }
            ].map((f, i) => (
              <div key={i} className="bg-white/50 backdrop-blur-sm border border-gray-100 p-6 rounded-[2rem] text-left hover:shadow-xl transition-all group cursor-default">
                <div className="text-2xl mb-3">{f.i}</div>
                <div className="font-black text-gray-900 text-sm tracking-tight">{f.t}</div>
                <div className="text-xs text-gray-400 font-bold mt-1 leading-relaxed">{f.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-6 md:px-10 py-20 space-y-24">
        <section className="space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">Explore Collections</div>
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">Shop by Category</h2>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {cats.map((c) => (
              <Link
                key={c._id}
                to={`/products?category=${encodeURIComponent(c.name)}`}
                className="group relative bg-gray-50/50 border border-gray-100 rounded-[2.5rem] p-8 overflow-hidden hover:bg-white hover:shadow-2xl hover:scale-[1.05] transition-all duration-500"
              >
                <div className="relative z-10 space-y-2">
                  <div className="font-black text-gray-900 text-base tracking-tight capitalize group-hover:text-blue-600 transition-colors">{c.name}</div>
                  <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest line-clamp-1">
                    {c.description || 'Discover More'}
                  </div>
                </div>
                <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-blue-100/30 rounded-full group-hover:scale-[3] transition-transform duration-700 blur-xl"></div>
              </Link>
            ))}
          </div>
        </section>

        <section className="space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-50 pb-8">
            <div className="space-y-2">
              <div className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">Our Best Sellers</div>
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">Featured Products</h2>
            </div>
            <Link to="/products" className="group flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-colors">
              View All Arrivals
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {featured.map((p) => (
              <div
                key={p._id}
                className="group bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] flex flex-col transition-all duration-500 transform hover:-translate-y-2"
              >
                <Link to={`/products/${p._id}`} className="relative block">
                  <div className="bg-gray-50/50 aspect-square flex items-center justify-center overflow-hidden">
                    {p.images && p.images.length > 0 ? (
                      <img
                        src={p.images[0].url}
                        alt={p.name}
                        className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110 p-8"
                      />
                    ) : (
                      <div className="text-4xl">📱</div>
                    )}
                  </div>
                  {p.bulkDiscountQuantity > 0 && (
                    <div className="absolute top-4 right-4 bg-amber-400 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg shadow-amber-200 uppercase tracking-widest animate-bounce">
                      Bulk Offer
                    </div>
                  )}
                </Link>
                <div className="p-8 flex-1 flex flex-col space-y-4">
                  <div className="space-y-1">
                    <div className="text-[10px] uppercase text-blue-600 font-black tracking-widest">
                      {p.category || 'General'}
                    </div>
                    <Link to={`/products/${p._id}`} className="block group-hover:text-blue-600 transition-colors">
                      <div className="font-black text-gray-900 line-clamp-2 min-h-[3rem] text-sm leading-tight tracking-tight">{p.name}</div>
                    </Link>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2 border-t border-gray-50 mt-auto">
                    <div className="text-xl font-black text-gray-900 tracking-tighter">₹{p.price.toLocaleString()}</div>
                    <button 
                      onClick={() => addToCart(p)}
                      className="h-10 w-10 bg-gray-900 text-white rounded-xl flex items-center justify-center hover:bg-blue-600 transition-all shadow-lg active:scale-90"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
}
