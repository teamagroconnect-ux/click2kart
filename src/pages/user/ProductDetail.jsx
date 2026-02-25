import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../../lib/api'

export default function ProductDetail(){
  const { id } = useParams()
  const [p, setP] = useState(null)
  useEffect(()=>{ api.get(`/api/products/${id}`).then(({data})=>setP(data)) }, [id])
  if (!p) return <div className="p-6">Loading...</div>
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto p-4 md:p-6">
        <div className="bg-white border rounded-xl p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-100 rounded-lg flex items-center justify-center aspect-[4/3]">
            {p.images && p.images.length>0
              ? <img src={p.images[0].url} alt={p.name} className="w-full h-full object-contain" />
              : <span className="text-xs text-gray-400">No image available</span>}
          </div>
          <div className="space-y-3">
            <div className="text-xs uppercase text-gray-500 tracking-wide">{p.category || 'Uncategorized'}</div>
            <div className="text-2xl font-semibold">{p.name}</div>
            <div className="text-xl font-bold text-gray-900">₹{p.price}</div>
            <div className="text-xs text-gray-500">Stock: {p.stock > 0 ? `${p.stock} available` : 'Out of stock'}</div>
            <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{p.description}</div>
            <div className="pt-3">
              <Link
                to="/enquiry"
                state={{ productId: p._id, name: p.name }}
                className="inline-block bg-blue-600 text-white px-5 py-2 rounded-md text-sm font-semibold"
              >
                Enquire
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

