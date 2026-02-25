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
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Orders</h1>
          <p className="text-[11px] text-gray-500">
            Monitor Click2Kart orders and quickly update their status.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            className="border border-gray-300 bg-white text-gray-900 text-xs rounded-lg px-3 py-2"
            value={status}
            onChange={e => setStatus(e.target.value)}
          >
            <option value="">All statuses</option>
            <option value="NEW">NEW</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="FULFILLED">FULFILLED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl divide-y divide-gray-100 shadow-sm">
        {!loading &&
          items.map(o => {
            const badgeClass =
              o.status === 'FULFILLED'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : o.status === 'CANCELLED'
                ? 'bg-red-50 text-red-700 border border-red-200'
                : o.status === 'CONFIRMED'
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            return (
              <div key={o._id} className="p-3 md:p-4 space-y-2">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <div className="font-medium text-gray-900 text-sm">
                      {o.customer.name} • {o.customer.phone}
                    </div>
                    <div className="text-[11px] text-gray-500">
                      {o.createdAt ? new Date(o.createdAt).toLocaleString() : ''} • Items:{' '}
                      {o.items.length} • ₹{o.totalEstimate}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex flex-wrap justify-end gap-1.5">
                      {['NEW', 'CONFIRMED', 'FULFILLED', 'CANCELLED'].map(s => (
                        <button
                          key={s}
                          onClick={() => update(o._id, s)}
                          className={`px-2 py-1 rounded-full text-[10px] border ${
                            o.status === s
                              ? 'bg-blue-600 text-white border-blue-500'
                              : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] ${badgeClass}`}>
                        {o.status}
                      </span>
                      <button
                        onClick={() => toggle(o._id)}
                        className="text-[11px] text-blue-600 hover:text-blue-500"
                      >
                        {expandedId === o._id ? 'Hide items' : 'View items'}
                      </button>
                    </div>
                  </div>
                </div>
                {expandedId === o._id && (
                  <div className="mt-2 border-t border-gray-200 pt-2 text-[11px] text-gray-700 space-y-1">
                    {o.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span className="truncate">{it.name}</span>
                        <span>Qty {it.quantity}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        {loading &&
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="p-3 md:p-4 animate-pulse space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/3" />
              <div className="h-3 bg-gray-200 rounded w-1/4" />
            </div>
          ))}
        {items.length === 0 && !loading && (
          <div className="p-4 text-gray-500 text-sm">No orders found.</div>
        )}
      </div>
      <div className="flex justify-end gap-2 text-[11px]">
        <button
          onClick={() => load(Math.max(1, page - 1))}
          className="px-3 py-1.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
        >
          Prev
        </button>
        <button
          onClick={() => load(page + 1)}
          className="px-3 py-1.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
        >
          Next
        </button>
      </div>
    </div>
  )
}
