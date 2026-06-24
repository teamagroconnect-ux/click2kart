import { useEffect, useState } from 'react'
import api from '../../lib/api'

export default function Customers() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('')
  const [busyId, setBusyId] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/api/admin/customers', { params: { q, status } })
      setItems(data)
    } finally {
      setLoading(false)
    }
  }

  const approve = async (id) => {
    setBusyId(id)
    try {
      await api.post(`/api/admin/customers/${id}/approve`)
      setItems(prev => prev.map(x => x._id === id ? { ...x, isActive: true, approvalStatus: 'approved' } : x))
    } finally {
      setBusyId('')
    }
  }

  const skip = async (id) => {
    setBusyId(id)
    try {
      await api.post(`/api/admin/customers/${id}/skip`)
      setItems(prev => prev.map(x => x._id === id ? { ...x, approvalStatus: 'skipped' } : x))
    } finally {
      setBusyId('')
    }
  }

  useEffect(() => {
    load()
  }, [q, status])

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Customer Intelligence</h1>
          <p className="text-sm text-gray-500 font-medium mt-1 uppercase tracking-widest text-[10px]">Relationship Management & Lifetime Value</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative group">
            <input
              className="bg-white border border-gray-200 text-gray-900 text-sm rounded-2xl pl-10 pr-4 py-2.5 w-64 outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all"
              placeholder="Search customers..."
              value={q}
              onChange={e => setQ(e.target.value)}
            />
            <svg className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
        </div>
      </div>

      {/* Filters & Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-100 pb-1">
        {[
          { label: 'All Customers', value: '' },
          { label: 'Pending Approval', value: 'pending' },
          { label: 'Skipped', value: 'skipped' },
          { label: 'Active', value: 'approved' }
        ].map(tab => (
          <button
            key={tab.value}
            onClick={() => setStatus(tab.value)}
            className={`px-5 py-3 text-xs font-black uppercase tracking-widest transition-all relative ${
              status === tab.value 
              ? 'text-blue-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-blue-600' 
              : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-gray-50/50 border-b border-gray-50 text-gray-400 font-black uppercase tracking-[0.2em] text-[10px]">
              <tr>
                <th className="px-8 py-5">Customer Profile</th>
                <th className="px-8 py-5">Contact Info</th>
                <th className="px-8 py-5">Engagement</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="5" className="px-8 py-10"><div className="h-4 bg-gray-50 rounded-full w-full"></div></td>
                  </tr>
                ))
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-8 py-20 text-center text-gray-400 italic font-medium uppercase tracking-[0.2em] text-[10px]">No customers match your criteria.</td>
                </tr>
              ) : (
                items.map((c) => (
                  <tr key={c._id} className="group hover:bg-gray-50/30 transition-colors cursor-pointer" onClick={()=>location.href=`/admin/customers/${c._id}`}>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xs border border-blue-100">
                          {c.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <div className="font-black text-gray-900 text-sm">{c.name}</div>
                          <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Joined {new Date(c.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="font-bold text-gray-700">{c.phone}</div>
                      <div className="text-xs text-gray-400 font-medium">{c.email || 'No Email Address'}</div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 font-black text-[10px] tracking-widest border border-indigo-100 uppercase">
                        {c.orderCount || 0} Total Orders
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black tracking-widest border uppercase ${
                        c.approvalStatus === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                        c.approvalStatus === 'skipped' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                        'bg-rose-50 text-rose-700 border-rose-100'
                      }`}>
                        {c.approvalStatus || (c.isActive ? 'approved' : 'pending')}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2" onClick={e => e.stopPropagation()}>
                        {(c.approvalStatus === 'pending' || c.approvalStatus === 'skipped') && (
                          <>
                            <button
                              onClick={() => approve(c._id)}
                              disabled={busyId === c._id}
                              className="px-4 py-2 rounded-xl bg-gray-900 text-white text-[10px] font-black tracking-widest uppercase hover:bg-gray-800 transition-all disabled:opacity-50 shadow-md shadow-gray-900/10"
                            >
                              {busyId === c._id ? 'Processing...' : 'Approve'}
                            </button>
                            {c.approvalStatus === 'pending' && (
                              <button
                                onClick={() => skip(c._id)}
                                disabled={busyId === c._id}
                                className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-600 text-[10px] font-black tracking-widest uppercase hover:bg-gray-50 transition-all disabled:opacity-50"
                              >
                                Skip
                              </button>
                            )}
                          </>
                        )}
                        {c.approvalStatus === 'approved' && (
                          <div className="p-2 text-emerald-500">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
