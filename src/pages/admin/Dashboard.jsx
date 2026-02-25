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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Inventory Dashboard</h1>
          <p className="text-xs text-gray-500">Amazon-style overview of stock, orders and billing.</p>
        </div>
        <div className="flex gap-2">
          <Link to="/admin/products" className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded">Add product</Link>
          <Link to="/admin/billing" className="px-3 py-1.5 text-xs border rounded">New bill</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat title="Total products" value={inv.totalSkus} />
        <Stat title="Units in stock" value={inv.totalUnits} />
        <Stat title="Open orders" value={orders.open} accent="blue" />
        <Stat title="Low / Out of stock" value={`${inv.lowStock} / ${inv.outOfStock}`} accent="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-sm">Low stock products</h2>
              <p className="text-xs text-gray-500">Below threshold and out-of-stock items.</p>
            </div>
            <Link to="/admin/products" className="text-xs text-blue-600">View all</Link>
          </div>
          <div className="divide-y max-h-56 overflow-y-auto text-sm">
            {(stats?.lowStock || []).map(p => (
              <div key={p._id} className="px-4 py-2 flex justify-between items-center">
                <div className="truncate">{p.name}</div>
                <div className="text-red-600 font-medium">{p.stock}</div>
              </div>
            ))}
            {(!stats?.lowStock || stats.lowStock.length === 0) && (
              <div className="px-4 py-3 text-gray-500 text-sm">No low stock items</div>
            )}
          </div>
        </div>

        <div className="bg-white border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-sm">Recent orders</h2>
              <p className="text-xs text-gray-500">Today: {orders.today} • Total loaded: {orders.total}</p>
            </div>
            <Link to="/admin/orders" className="text-xs text-blue-600">View all</Link>
          </div>
          <div className="divide-y max-h-56 overflow-y-auto text-sm">
            {orders.recent.map(o => (
              <div key={o._id} className="px-4 py-2 flex justify-between items-center">
                <div className="truncate">
                  <div className="font-medium">{o.customer?.name}</div>
                  <div className="text-xs text-gray-500">
                    {o.createdAt ? new Date(o.createdAt).toLocaleString() : ''} • ₹{o.totalEstimate}
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded text-xs ${
                  o.status === 'FULFILLED'
                    ? 'bg-green-100 text-green-800'
                    : o.status === 'CANCELLED'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-blue-50 text-blue-700'
                }`}>
                  {o.status}
                </span>
              </div>
            ))}
            {orders.recent.length === 0 && (
              <div className="px-4 py-3 text-gray-500 text-sm">No orders yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function Stat({ title, value, accent }) {
  const accentClass =
    accent === 'blue' ? 'text-blue-600' : accent === 'red' ? 'text-red-600' : 'text-gray-900'
  return (
    <div className="bg-white border rounded-xl p-4 shadow-sm">
      <div className="text-gray-500 text-xs uppercase tracking-wide">{title}</div>
      <div className={`text-2xl font-semibold mt-1 ${accentClass}`}>{value}</div>
    </div>
  )
}
