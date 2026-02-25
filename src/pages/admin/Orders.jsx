import React, { useEffect, useState } from 'react'
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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-500">
            Manage your store orders and track customer purchases.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              className="appearance-none bg-white border border-gray-200 text-gray-900 text-sm rounded-xl pl-4 pr-10 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm transition-all"
              value={status}
              onChange={e => setStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="NEW">New</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="FULFILLED">Fulfilled</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-gray-50/50 border-b border-gray-100 text-gray-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="5" className="px-6 py-8"><div className="h-4 bg-gray-100 rounded w-full"></div></td>
                  </tr>
                ))
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-400 italic font-medium">No orders found.</td>
                </tr>
              ) : (
                items.map(o => {
                  const isExpanded = expandedId === o._id;
                  const statusColors = {
                    FULFILLED: 'bg-emerald-50 text-emerald-700 border-emerald-100',
                    CANCELLED: 'bg-red-50 text-red-700 border-red-100',
                    CONFIRMED: 'bg-blue-50 text-blue-700 border-blue-100',
                    NEW: 'bg-amber-50 text-amber-700 border-amber-100'
                  };
                  return (
                    <React.Fragment key={o._id}>
                      <tr 
                        className={`group hover:bg-gray-50/50 transition-all cursor-pointer ${isExpanded ? 'bg-gray-50/80' : ''}`}
                        onClick={() => toggle(o._id)}
                      >
                        <td className="px-6 py-4">
                          <div className="font-bold text-gray-900">{o.customer.name}</div>
                          <div className="text-[11px] text-gray-400 font-medium tracking-tight">{o.customer.phone}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${statusColors[o.status] || 'bg-gray-50 text-gray-600'}`}>
                            {o.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-black text-gray-900">₹{o.totalEstimate.toLocaleString()}</div>
                          <div className="text-[10px] text-gray-400 font-bold">{o.items.length} items</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-gray-600 font-medium">{new Date(o.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</div>
                          <div className="text-[10px] text-gray-400">{new Date(o.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {o.billId && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const token = localStorage.getItem('token');
                                  window.open(`${api.defaults.baseURL}/api/bills/${o.billId}/pdf?token=${token}`, '_blank');
                                }}
                                className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors title='View Bill'"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                              </button>
                            )}
                            <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                            </div>
                          </div>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr>
                          <td colSpan="5" className="px-6 py-6 bg-gray-50/30">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-top-2 duration-300">
                              <div className="space-y-4">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Order Items</h4>
                                <div className="space-y-3">
                                  {o.items.map((it, idx) => (
                                    <div key={idx} className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
                                      <div className="w-12 h-12 bg-gray-50 rounded-xl border flex-shrink-0 flex items-center justify-center overflow-hidden">
                                        {it.image ? <img src={it.image} className="w-full h-full object-contain p-1" /> : <span className="text-[8px] text-gray-300 font-bold uppercase">No Img</span>}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="text-xs font-bold text-gray-900 truncate">{it.name}</div>
                                        <div className="text-[10px] text-gray-500 font-medium">Qty: {it.quantity} × ₹{it.price}</div>
                                      </div>
                                      <div className="text-xs font-black text-gray-900">₹{it.lineTotal || (it.price * it.quantity)}</div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div className="space-y-4">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Order Actions</h4>
                                <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                                  <div className="flex flex-wrap gap-2">
                                    {['NEW', 'CONFIRMED', 'FULFILLED', 'CANCELLED'].map(s => (
                                      <button
                                        key={s}
                                        onClick={(e) => { e.stopPropagation(); update(o._id, s); }}
                                        className={`px-4 py-2 rounded-xl text-[10px] font-bold border transition-all ${
                                          o.status === s
                                            ? 'bg-gray-900 text-white border-gray-900 shadow-md transform scale-105'
                                            : 'border-gray-100 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                                        }`}
                                      >
                                        {s}
                                      </button>
                                    ))}
                                  </div>
                                  {o.notes && (
                                    <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100/50">
                                      <div className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1">Notes</div>
                                      <div className="text-[11px] text-blue-700 font-medium italic">"{o.notes}"</div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
