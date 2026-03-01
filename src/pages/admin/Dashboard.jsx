import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../lib/api'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [inv, setInv] = useState({ totalSkus: 0, totalUnits: 0, outOfStock: 0, lowStock: 0 })
  const [orders, setOrders] = useState({ total: 0, open: 0, today: 0, recent: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [statsRes, productsRes, ordersRes] = await Promise.all([
          api.get('/api/admin/stats'),
          api.get('/api/products', { params: { page: 1, limit: 5000 } }).catch(() => ({ data: { items: [] } })),
          api.get('/api/orders', { params: { page: 1, limit: 50 } }).catch(() => ({ data: { items: [] } }))
        ])
        setStats(statsRes.data)

        const products = productsRes.data?.items || []
        const totalSkus = products.length
        const totalUnits = products.reduce((sum, p) => sum + (p.stock || 0), 0)
        const outOfStock = products.filter(p => (p.stock || 0) === 0).length
        const lowStock = products.filter(p => (p.stock || 0) > 0 && (p.stock || 0) <= Number(process.env.LOW_STOCK_THRESHOLD || 5)).length
        setInv({ totalSkus, totalUnits, outOfStock, lowStock })

        const items = ordersRes.data?.items || []
        const now = new Date()
        const todayStr = now.toISOString().slice(0, 10)
        const open = items.filter(o => o.status === 'NEW' || o.status === 'CONFIRMED').length
        const today = items.filter(o => o.createdAt && o.createdAt.slice(0, 10) === todayStr).length
        const recent = items.slice(0, 5)
        setOrders({ total: items.length, open, today, recent })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Inventory Dashboard</h1>
            <p className="text-xs text-gray-500">Loading latest inventory and orders…</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white border rounded-xl p-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
              <div className="h-6 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border rounded-xl p-4 animate-pulse h-40" />
          <div className="bg-white border rounded-xl p-4 animate-pulse h-40" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">Welcome back! Here's an overview of your platform</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card iconBg="bg-blue-50" icon="📦" title="Total Products" value={stats?.totalProducts ?? inv.totalSkus} />
        <Card iconBg="bg-emerald-50" icon="✅" title="Active Customers" value={stats?.totalCustomers ?? 0} />
        <Card iconBg="bg-violet-50" icon="🧾" title="Total Bills" value={stats?.totalBills ?? 0} />
        <Card iconBg="bg-green-50" icon="🧰" title="Units in Stock" value={inv.totalUnits} />
        <Card iconBg="bg-amber-50" icon="⚠️" title="Low Stock Alerts" value={inv.lowStock} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="font-semibold">Low Stock Products</h2>
          </div>
          <div className="divide-y max-h-64 overflow-y-auto">
            {(stats?.lowStock || []).map(p => (
              <div key={p._id} className="px-6 py-3 flex items-center justify-between">
                <div className="truncate">{p.name}</div>
                <span className="px-2 py-0.5 rounded-lg text-[11px] font-bold bg-red-50 text-red-700 border border-red-100">{p.stock}</span>
              </div>
            ))}
            {(!stats?.lowStock || stats.lowStock.length === 0) && (
              <div className="px-6 py-6 text-gray-500 text-sm">No low stock items</div>
            )}
          </div>
        </div>

        <div className="bg-white border rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b flex items-center justify-between">
            <div>
              <h2 className="font-semibold">Recent Orders</h2>
              <p className="text-xs text-gray-500">Today: {orders.today} • Loaded: {orders.total}</p>
            </div>
            <Link to="/admin/orders" className="text-sm text-blue-600">View all</Link>
          </div>
          <div className="divide-y max-h-64 overflow-y-auto">
            {orders.recent.map(o => (
              <div key={o._id} className="px-6 py-3 flex items-center justify-between">
                <div className="truncate">
                  <div className="font-medium text-gray-900">{o.customer?.name}</div>
                  <div className="text-xs text-gray-500">{o.createdAt ? new Date(o.createdAt).toLocaleString() : ''} • ₹{o.totalEstimate}</div>
                </div>
                <span className={`px-2 py-0.5 rounded-lg text-[11px] font-bold ${
                  o.status === 'FULFILLED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                  o.status === 'CANCELLED' ? 'bg-red-50 text-red-700 border border-red-100' :
                  'bg-blue-50 text-blue-700 border border-blue-100'
                }`}>
                  {o.status}
                </span>
              </div>
            ))}
            {orders.recent.length === 0 && (
              <div className="px-6 py-6 text-gray-500 text-sm">No orders yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function Card({ icon, iconBg, title, value }) {
  return (
    <div className="bg-white border rounded-2xl p-5 flex items-center gap-4">
      <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${iconBg}`}>
        <span className="text-xl">{icon}</span>
      </div>
      <div className="flex-1">
        <div className="text-[12px] text-gray-500 font-bold">{title}</div>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
      </div>
    </div>
  )
}
