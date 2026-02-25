import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../../lib/api'

export default function ProductDetail(){
  const { id } = useParams()
  const [p, setP] = useState(null)
  useEffect(()=>{ api.get(`/api/products/${id}`).then(({data})=>setP(data)) }, [id])
  if (!p) return <div className="p-10 text-center text-lg text-gray-500">Loading product details...</div>
  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-5xl mx-auto p-4 md:p-8">
        <div className="bg-white border rounded-2xl p-6 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-10 shadow-sm">
          <div className="bg-gray-50 rounded-xl flex items-center justify-center aspect-square md:aspect-auto">
            {p.images && p.images.length>0
              ? <img src={p.images[0].url} alt={p.name} className="w-full h-full object-contain p-4" />
              : <span className="text-base text-gray-400">No image available</span>}
          </div>
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="text-sm uppercase text-blue-600 font-semibold tracking-wider">{p.category || 'Uncategorized'}</div>
              <h1 className="text-3xl font-bold text-gray-900 leading-tight">{p.name}</h1>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-gray-900">₹{p.price}</span>
              <span className="text-sm text-gray-500">inclusive of all taxes</span>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-sm font-medium">
              <div className={`w-2 h-2 rounded-full ${p.stock > 0 ? 'bg-emerald-500' : 'bg-red-500'}`} />
              {p.stock > 0 ? `${p.stock} units in stock` : 'Currently out of stock'}
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-semibold text-gray-900">Description</h3>
              <p className="text-base text-gray-600 leading-relaxed whitespace-pre-line">{p.description}</p>
            </div>
            <div className="pt-6 border-t">
              <Link
                to="/order"
                state={{ productId: p._id, name: p.name }}
                className="w-full md:w-auto inline-flex justify-center items-center bg-blue-600 text-white px-10 py-4 rounded-xl text-lg font-bold shadow-lg hover:bg-blue-700 transition-colors"
              >
                Order now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

