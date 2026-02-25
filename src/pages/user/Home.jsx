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
    <div className="bg-gray-50">
      <section className="bg-gradient-to-r from-blue-700 to-blue-500 text-white">
        <div className="max-w-6xl mx-auto px-4 py-10 md:py-14 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-4 max-w-xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-sm font-medium tracking-wide">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Trusted local electronics store
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Click2Kart
            </h1>
            <p className="mt-2 text-base md:text-lg text-blue-100">
              Mobiles, accessories & electronics delivered with a clean, premium shopping
              experience.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-4">
              <Link
                to="/products"
                className="inline-flex justify-center items-center bg-white text-blue-700 px-6 py-3 rounded-md text-base font-semibold shadow-sm hover:bg-blue-50"
              >
                Browse products
              </Link>
              <Link
                to="/order"
                className="inline-flex justify-center items-center border border-white/70 text-white px-6 py-3 rounded-md text-base hover:bg-white/10"
              >
                Order now
              </Link>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="bg-white/10 rounded-xl p-6 grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-semibold text-base">Fast delivery</div>
                <div className="text-blue-100">Same‑day on selected pin codes</div>
              </div>
              <div>
                <div className="font-semibold text-base">Assured quality</div>
                <div className="text-blue-100">Genuine, GST‑billed products</div>
              </div>
              <div>
                <div className="font-semibold text-base">Easy support</div>
                <div className="text-blue-100">Store + WhatsApp assistance</div>
              </div>
              <div>
                <div className="font-semibold text-base">Great prices</div>
                <div className="text-blue-100">Curated deals on top brands</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-10">
        <section>
          <h2 className="text-xl font-semibold mb-4">Shop by category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {cats.map((c) => (
              <Link
                key={c._id}
                to={`/products?category=${encodeURIComponent(c.name)}`}
                className="bg-white border rounded-lg p-4 capitalize hover:shadow-sm flex flex-col transition-shadow"
              >
                <div className="font-medium text-base truncate">{c.name}</div>
                <div className="text-sm text-gray-500 line-clamp-2 mt-1">
                  {c.description}
                </div>
              </Link>
            ))}
            {cats.length === 0 && (
              <div className="text-gray-600 text-base">No categories</div>
            )}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Featured products</h2>
            <Link to="/products" className="text-sm text-blue-600 font-medium">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {featured.map((p) => (
              <div
                key={p._id}
                className="group bg-white border rounded-2xl overflow-hidden hover:shadow-xl flex flex-col transition-all duration-300 transform hover:-translate-y-1"
              >
                <Link to={`/products/${p._id}`} className="block">
                  <div className="bg-gray-50 aspect-square flex items-center justify-center overflow-hidden">
                    {p.images && p.images.length > 0 ? (
                      <img
                        src={p.images[0].url}
                        alt={p.name}
                        className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110 p-4"
                      />
                    ) : (
                      <span className="text-sm text-gray-400 font-medium">No image available</span>
                    )}
                  </div>
                </Link>
                <div className="p-5 flex-1 flex flex-col space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <div className="text-[10px] uppercase text-blue-600 font-bold tracking-widest bg-blue-50 px-2 py-0.5 rounded-md">
                      {p.category || 'General'}
                    </div>
                    <div className="text-sm font-bold text-gray-900">₹{p.price.toLocaleString()}</div>
                  </div>
                  <Link to={`/products/${p._id}`} className="block group-hover:text-blue-600 transition-colors">
                    <div className="font-bold text-gray-900 line-clamp-2 min-h-[3rem] text-sm leading-tight">{p.name}</div>
                  </Link>
                  <div className="pt-2 flex gap-2">
                    <button 
                      onClick={() => addToCart(p)}
                      className="flex-1 bg-gray-900 text-white py-2 rounded-lg text-xs font-bold hover:bg-gray-800 transition-colors"
                    >
                      Add to Cart
                    </button>
                    <Link 
                      to={`/products/${p._id}`}
                      className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
            {featured.length === 0 && (
              <div className="col-span-full py-12 text-center text-gray-500 font-medium italic">Discover our latest arrivals soon...</div>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}
