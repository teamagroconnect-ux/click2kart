import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import api from '../../lib/api'

export default function Home() {
  const [cats, setCats] = useState([])
  const [featured, setFeatured] = useState([])

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
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-medium tracking-wide">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Trusted local electronics store
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              Click2Kart
            </h1>
            <p className="mt-1 text-sm md:text-base text-blue-100">
              Mobiles, accessories & electronics delivered with a clean, premium shopping
              experience.
            </p>
            <div className="mt-4 flex flex-col sm:flex-row gap-3">
              <Link
                to="/products"
                className="inline-flex justify-center items-center bg-white text-blue-700 px-4 py-2 rounded-md text-sm font-semibold shadow-sm hover:bg-blue-50"
              >
                Browse products
              </Link>
              <Link
                to="/order"
                className="inline-flex justify-center items-center border border-white/70 text-white px-4 py-2 rounded-md text-sm hover:bg-white/10"
              >
                Order now
              </Link>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="bg-white/10 rounded-xl p-4 grid grid-cols-2 gap-3 text-xs">
              <div>
                <div className="font-semibold">Fast delivery</div>
                <div className="text-blue-100">Same‑day on selected pin codes</div>
              </div>
              <div>
                <div className="font-semibold">Assured quality</div>
                <div className="text-blue-100">Genuine, GST‑billed products</div>
              </div>
              <div>
                <div className="font-semibold">Easy support</div>
                <div className="text-blue-100">Store + WhatsApp assistance</div>
              </div>
              <div>
                <div className="font-semibold">Great prices</div>
                <div className="text-blue-100">Curated deals on top brands</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-8">
        <section>
          <h2 className="text-lg font-semibold mb-3">Shop by category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {cats.map((c) => (
              <Link
                key={c._id}
                to={`/products?category=${encodeURIComponent(c.name)}`}
                className="bg-white border rounded-lg p-3 capitalize hover:shadow-sm flex flex-col transition-shadow"
              >
                <div className="font-medium text-sm truncate">{c.name}</div>
                <div className="text-xs text-gray-500 line-clamp-2 mt-1">
                  {c.description}
                </div>
              </Link>
            ))}
            {cats.length === 0 && (
              <div className="text-gray-600 text-sm">No categories</div>
            )}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Featured products</h2>
            <Link to="/products" className="text-xs text-blue-600">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {featured.map((p) => (
              <Link
                key={p._id}
                to={`/products/${p._id}`}
                className="bg-white border rounded-lg overflow-hidden hover:shadow-sm flex flex-col transition-shadow"
              >
                <div className="bg-gray-100 aspect-[4/3] flex items-center justify-center">
                  {p.images && p.images.length > 0 ? (
                    <img
                      src={p.images[0].url}
                      alt={p.name}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <span className="text-xs text-gray-400">No image</span>
                  )}
                </div>
                <div className="p-3 space-y-1 flex-1 flex flex-col">
                  <div className="text-xs uppercase text-gray-500 tracking-wide">
                    {p.category || 'Uncategorized'}
                  </div>
                  <div className="font-medium text-sm line-clamp-2">{p.name}</div>
                  <div className="mt-auto">
                    <div className="text-base font-semibold text-gray-900">
                      ₹{p.price}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
            {featured.length === 0 && (
              <div className="text-gray-600 text-sm">No products yet.</div>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}
