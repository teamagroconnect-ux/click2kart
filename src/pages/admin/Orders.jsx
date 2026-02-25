import { useEffect, useState } from 'react'
import api from '../../lib/api'

export default function Orders(){
  const [items, setItems] = useState([])
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [expandedId, setExpandedId] = useState(null)
  const limit = 20
  const [loading, setLoading] = useState(false)
  const load = async(p=1)=>{ 
    setLoading(true)
    try { const {data}=await api.get('/api/orders',{params:{status:status||undefined,page:p,limit}}); setItems(data.items||[]); setPage(p) }
    finally { setLoading(false) }
  }
  useEffect(()=>{ load(1) }, [status])
  const update = async(id, s)=>{ await api.patch(`/api/orders/${id}/status`, { status: s }); load(page) }
  const toggle = (id) => setExpandedId(expandedId === id ? null : id)
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <select className="border p-2" value={status} onChange={e=>setStatus(e.target.value)}>
          <option value="">All</option>
          <option value="NEW">NEW</option>
          <option value="CONFIRMED">CONFIRMED</option>
          <option value="FULFILLED">FULFILLED</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>
      </div>
      <div className="bg-white border rounded divide-y">
        {!loading && items.map(o => (
          <div key={o._id} className="p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">{o.customer.name} • {o.customer.phone}</div>
                <div className="text-xs text-gray-500">{o.createdAt ? new Date(o.createdAt).toLocaleString() : ''}</div>
                <div className="text-sm text-gray-600">Items: {o.items.length} • ₹{o.totalEstimate}</div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <div className="space-x-2">
                  {['NEW','CONFIRMED','FULFILLED','CANCELLED'].map(s => (
                    <button key={s} onClick={()=>update(o._id, s)} className={`px-2 py-1 border rounded text-xs ${o.status===s?'bg-blue-600 text-white':''}`}>{s}</button>
                  ))}
                </div>
                <button onClick={()=>toggle(o._id)} className="text-xs text-blue-600 mt-1">
                  {expandedId===o._id ? 'Hide items' : 'View items'}
                </button>
              </div>
            </div>
            {expandedId===o._id && (
              <div className="mt-2 border-t pt-2 text-xs text-gray-700 space-y-1">
                {o.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>{it.name}</span>
                    <span>Qty {it.quantity}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        {loading && Array.from({length:5}).map((_,i)=> (
          <div key={i} className="p-3 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"/>
            <div className="h-3 bg-gray-200 rounded w-1/4"/>
          </div>
        ))}
        {items.length===0 && !loading && <div className="p-3 text-gray-500">No orders</div>}
      </div>
      <div className="space-x-2">
        <button onClick={()=>load(Math.max(1,page-1))} className="px-2 py-1 border rounded">Prev</button>
        <button onClick={()=>load(page+1)} className="px-2 py-1 border rounded">Next</button>
      </div>
    </div>
  )
}
