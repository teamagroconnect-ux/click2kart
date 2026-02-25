import { useEffect, useState } from 'react'
import api from '../../lib/api'

export default function Customers() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/api/admin/customers', { params: { q } })
      setItems(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [q])

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Customers</h1>
          <p className="text-sm text-gray-500">View and manage your customer database and their purchase history.</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            className="border border-gray-300 bg-white text-gray-900 text-sm rounded-lg px-4 py-2 w-64 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Search by name or phone..."
            value={q}
            onChange={e => setQ(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Contact</th>
              <th className="px-6 py-4">Purchases</th>
              <th className="px-6 py-4">Address</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-24"></div></td>
                  <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-32"></div></td>
                  <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-16"></div></td>
                  <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-40"></div></td>
                  <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-12"></div></td>
                </tr>
              ))
            ) : items.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-10 text-center text-gray-500 italic">No customers found.</td>
              </tr>
            ) : (
              items.map((c) => (
                <tr key={c._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900">{c.name}</div>
                    <div className="text-[10px] text-gray-400 uppercase tracking-tighter">Joined {new Date(c.createdAt).toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-700">{c.phone}</div>
                    <div className="text-xs text-gray-400">{c.email || 'No email'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold text-xs">
                      {c.purchaseHistory?.length || 0} Orders
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 text-xs max-w-xs truncate">
                    {c.address || 'Not provided'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${c.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                      {c.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
