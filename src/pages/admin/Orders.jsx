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
          <h1 className="text-lg font-semibold text-slate-50">Orders</h1>
          <p className="text-[11px] text-slate-400">
            Monitor Click2Kart orders and quickly update their status.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            className="border border-slate-700 bg-slate-900/70 text-slate-50 text-xs rounded-lg px-3 py-2"
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

      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl divide-y divide-slate-800">
        {!loading &&
          items.map(o => {
            const badgeClass =
              o.status === 'FULFILLED'
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                : o.status === 'CANCELLED'
                ? 'bg-red-500/10 text-red-300 border border-red-500/30'
                : o.status === 'CONFIRMED'
                ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
            return (
              <div key={o._id} className="p-3 md:p-4 space-y-2">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <div className="font-medium text-slate-50 text-sm">
                      {o.customer.name} • {o.customer.phone}
                    </div>
                    <div className="text-[11px] text-slate-400">
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
                              : 'border-slate-700 text-slate-200 hover:bg-slate-800'
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
                        className="text-[11px] text-blue-400 hover:text-blue-300"
                      >
                        {expandedId === o._id ? 'Hide items' : 'View items'}
                      </button>
                    </div>
                  </div>
                </div>
                {expandedId === o._id && (
                  <div className="mt-2 border-t border-slate-800 pt-2 text-[11px] text-slate-200 space-y-1">
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
              <div className="h-4 bg-slate-800 rounded w-1/3" />
              <div className="h-3 bg-slate-800 rounded w-1/4" />
            </div>
          ))}
        {items.length === 0 && !loading && (
          <div className="p-4 text-slate-400 text-sm">No orders found.</div>
        )}
      </div>
      <div className="flex justify-end gap-2 text-[11px]">
        <button
          onClick={() => load(Math.max(1, page - 1))}
          className="px-3 py-1.5 border border-slate-700 rounded-lg text-slate-200 hover:bg-slate-800"
        >
          Prev
        </button>
        <button
          onClick={() => load(page + 1)}
          className="px-3 py-1.5 border border-slate-700 rounded-lg text-slate-200 hover:bg-slate-800"
        >
          Next
        </button>
      </div>
    </div>
  )
}
