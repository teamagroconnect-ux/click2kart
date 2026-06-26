import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../lib/api'
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [inv, setInv] = useState({ totalSkus: 0, totalUnits: 0, outOfStock: 0, lowStock: 0 })
  const [orders, setOrders] = useState({ total: 0, open: 0, today: 0, recent: [] })
  const [revenue, setRevenue] = useState({ totalRevenue: 0, thisMonthRevenue: 0, pendingOrders: 0, topProducts: [], topBuyers: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [statsRes, ordersRes, revenueRes] = await Promise.all([
          api.get('/api/admin/stats'),
          api.get('/api/orders', { params: { page: 1, limit: 50 } }).catch(() => ({ data: { items: [] } })),
          api.get('/api/admin/revenue/summary').catch(() => ({ data: { totalRevenue: 0, thisMonthRevenue: 0, pendingOrders: 0, topProducts: [], topBuyers: [] } }))
        ])
        const s = statsRes.data
        setStats(s)
        setRevenue(revenueRes.data)
        setInv({ 
          totalSkus: s.totalProducts, 
          totalUnits: s.totalUnits, 
          outOfStock: s.outOfStock, 
          lowStock: s.lowStockCount 
        })

        const items = ordersRes.data?.items || []
        const now = new Date()
        const todayStr = now.toISOString().slice(0, 10)
        const open = items.filter(o => o.status === 'NEW' || o.status === 'CONFIRMED').length
        const today = items.filter(o => o.createdAt && o.createdAt.slice(0, 10) === todayStr).length
        const recent = items.slice(0, 10)
        setOrders({ total: items.length, open, today, recent })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-10 bg-gray-100 rounded-xl w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="h-32 bg-gray-50 rounded-3xl border border-gray-100" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-gray-50 rounded-3xl border border-gray-100" />
          <div className="h-96 bg-gray-50 rounded-3xl border border-gray-100" />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[1600px] mx-auto space-y-10 pb-12">
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .gradient-bg {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .glass-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
        }
      `}</style>
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 p-6 bg-gradient-to-r from-indigo-600 to-purple-700 rounded-[2.5rem] text-white shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="h-2 w-2 rounded-full bg-white animate-pulse"></span>
            <span className="text-[10px] font-black uppercase tracking-wider opacity-80">Live Dashboard</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight">Executive Dashboard</h1>
          <p className="text-sm font-bold opacity-80 uppercase tracking-[0.2em] mt-1">Platform Overview & Performance</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => window.location.reload()} className="p-2.5 bg-white/20 border border-white/30 rounded-2xl shadow-sm hover:bg-white/30 hover:shadow-md transition-all text-white">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
          </button>
        </div>
      </div>

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Total Revenue" 
          value={`₹${Math.round(revenue.totalRevenue).toLocaleString()}`} 
          sub={`₹${Math.round(revenue.thisMonthRevenue).toLocaleString()} this month`}
          icon={<svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.407 2.671 1M12 8V7m0 1c-1.11 0-2.08-.407-2.671-1M12 8V7m0 11v1m0-1c1.11 0 2.08-.407 2.671-1M12 18c-1.11 0-2.08.407-2.671 1M12 18v1m9-7a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
          color="indigo"
        />
        <StatCard 
          label="Sales Velocity" 
          value={orders.today} 
          sub="Orders placed today"
          icon={<svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>}
          color="amber"
          to="/admin/orders"
        />
        <StatCard 
          label="Product Catalog" 
          value={stats?.actualProductsCount ?? inv.totalSkus} 
          sub={`${inv.totalUnits} Units in stock`}
          icon={<svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>}
          color="emerald"
          to="/admin/products"
        />
        <StatCard 
          label="Support Tickets" 
          value={stats?.pendingSupportTickets ?? 0} 
          sub={`${stats?.inProgressSupportTickets ?? 0} in progress, ${stats?.resolvedSupportTickets ?? 0} resolved`}
          icon={<svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>}
          color="rose"
          to="/admin/support-tickets"
        />
      </div>

      {/* Main Analysis Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Top Products & Charts Placeholder */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-black text-gray-900 tracking-tight">Top Performance</h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Highest revenue generating products</p>
              </div>
              <div className="flex gap-2">
                <div className="h-2 w-2 rounded-full bg-indigo-500"></div>
                <div className="h-2 w-2 rounded-full bg-indigo-100"></div>
              </div>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenue.topProducts.slice(0, 5)}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" hide />
                  <YAxis hide />
                  <Tooltip 
                    cursor={{fill: '#f9fafb'}}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white p-4 shadow-2xl rounded-2xl border border-gray-100">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{payload[0].payload.name}</p>
                            <p className="text-lg font-black text-gray-900">₹{Math.round(payload[0].value).toLocaleString()}</p>
                            <p className="text-[10px] font-bold text-indigo-600">Qty: {payload[0].payload.quantity}</p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Bar dataKey="revenue" radius={[12, 12, 12, 12]} barSize={40}>
                    {revenue.topProducts.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#4f46e5' : '#e5e7eb'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 pt-8 border-t border-gray-50">
              {revenue.topProducts.slice(0, 3).map((p, i) => (
                <div key={i} className="p-4 rounded-2xl bg-gray-50/50 border border-gray-100">
                  <div className="text-[9px] font-black text-gray-400 uppercase tracking-[0.15em] truncate mb-1">{p.name}</div>
                  <div className="text-sm font-black text-gray-900">₹{Math.round(p.revenue).toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-xl font-black tracking-tight italic">Need to manage inventory?</h3>
                <p className="text-indigo-100 text-sm font-medium mt-1">Check for low stock items and update your warehouse listings.</p>
              </div>
              <div className="flex gap-3">
                <Link to="/admin/inventory" className="px-6 py-3 bg-white text-indigo-600 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-900/20 hover:scale-105 transition-transform active:scale-95">Check Stock</Link>
                <Link to="/admin/billing" className="px-6 py-3 bg-indigo-500 text-white border border-indigo-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-400 transition-colors">Create Bill</Link>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Intelligence */}
        <div className="space-y-8">
          {/* Top Buyers */}
          <div className="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-sm">
            <div className="p-6 border-b border-gray-50 bg-gray-50/30">
              <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest">Top Buyers</h3>
            </div>
            <div className="divide-y divide-gray-50">
              {revenue.topBuyers.slice(0, 5).map((b, i) => (
                <div key={i} className="p-6 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center text-xs font-black text-indigo-600 border border-indigo-100">
                      {b.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <div className="text-sm font-black text-gray-900 truncate max-w-[120px]">{b.name || b.phone}</div>
                      <div className="text-[10px] font-bold text-gray-400">{b.phone}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-black text-gray-900">₹{Math.round(b.total).toLocaleString()}</div>
                    <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-tighter">Top</div>
                  </div>
                </div>
              ))}
              {revenue.topBuyers.length === 0 && (
                <div className="p-12 text-center text-gray-400 text-[10px] font-black uppercase tracking-widest">No buyer data</div>
              )}
            </div>
          </div>

          {/* Low Stock Alerts */}
          <div className="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-sm border-l-4 border-l-rose-500">
            <div className="p-6 border-b border-gray-50 bg-rose-50/30 flex items-center justify-between">
              <h3 className="text-xs font-black text-rose-600 uppercase tracking-widest flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping"></span>
                Stock Alerts
              </h3>
              <span className="text-[10px] font-black bg-rose-100 text-rose-600 px-2 py-0.5 rounded-md">{inv.lowStock} Items</span>
            </div>
            <div className="divide-y divide-gray-50 max-h-[300px] overflow-y-auto custom-scrollbar">
              {(stats?.lowStock || []).slice(0, 5).map(p => (
                <div key={p._id} className="p-6 flex items-center justify-between">
                  <div className="text-sm font-bold text-gray-700 truncate max-w-[150px]">{p.name}</div>
                  <span className="text-xs font-black text-rose-600 tabular-nums">{p.stock} Left</span>
                </div>
              ))}
              {(!stats?.lowStock || stats.lowStock.length === 0) && (
                <div className="p-12 text-center text-gray-400 text-[10px] font-black uppercase tracking-widest italic">All stock healthy</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-sm">
        <div className="p-8 border-b border-gray-50 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black text-gray-900 tracking-tight italic underline decoration-indigo-500/30 underline-offset-4">Recent Operations</h3>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Live transaction feed</p>
          </div>
          <Link to="/admin/orders" className="px-5 py-2.5 bg-gray-50 text-gray-600 border border-gray-200 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-100 transition-all">Full History</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                <th className="px-8 py-4">Customer</th>
                <th className="px-8 py-4">Transaction Details</th>
                <th className="px-8 py-4 text-center">Status</th>
                <th className="px-8 py-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.recent.map(o => (
                <tr key={o._id} className="group hover:bg-indigo-50/30 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-white border shadow-sm flex items-center justify-center text-xs font-black text-gray-400 group-hover:border-indigo-200 transition-colors">
                        {o.customer?.name?.charAt(0) || 'C'}
                      </div>
                      <div className="font-black text-sm text-gray-900">{o.customer?.name || 'Guest User'}</div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{o.createdAt ? new Date(o.createdAt).toLocaleString() : ''}</div>
                    <div className="text-xs font-bold text-gray-600 mt-0.5">#{o._id.slice(-8).toUpperCase()}</div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex justify-center">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                        o.status === 'FULFILLED' ? 'bg-emerald-100 text-emerald-700' :
                        o.status === 'CANCELLED' ? 'bg-rose-100 text-rose-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {o.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="text-sm font-black text-gray-900 tabular-nums">₹{o.totalEstimate?.toLocaleString()}</div>
                  </td>
                </tr>
              ))}
              {orders.recent.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-8 py-20 text-center text-gray-400 text-[10px] font-black uppercase tracking-[0.3em]">No activity detected</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, sub, icon, color, to }) {
  const colors = {
    indigo: 'bg-gradient-to-br from-indigo-50 to-purple-50 text-indigo-600 border-indigo-100',
    amber: 'bg-gradient-to-br from-amber-50 to-orange-50 text-amber-600 border-amber-100',
    emerald: 'bg-gradient-to-br from-emerald-50 to-green-50 text-emerald-600 border-emerald-100',
    rose: 'bg-gradient-to-br from-rose-50 to-pink-50 text-rose-600 border-rose-100',
  }

  const content = (
    <div className="p-6 bg-white border border-gray-100 rounded-[2.5rem] shadow-md hover:shadow-xl transition-all relative overflow-hidden group hover:-translate-y-2 duration-300">
      {/* Decorative gradient background */}
      <div className="absolute top-0 left-0 w-full h-full opacity-0 group-hover:opacity-10 transition-opacity bg-gradient-to-br from-indigo-50 to-purple-50" />
      
      <div className={`h-14 w-14 rounded-2xl ${colors[color]} flex items-center justify-center mb-4 transition-all group-hover:scale-110 group-hover:rotate-5 duration-500 shadow-sm`}>
        {icon}
      </div>
      <div>
        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</h3>
        <div className="text-3xl font-black text-gray-900 mt-1 tabular-nums">{value}</div>
        <p className="text-[10px] font-bold text-gray-500 mt-2 flex items-center gap-1.5">
          <span className="h-1 w-1 rounded-full bg-gray-300"></span>
          {sub}
        </p>
      </div>
      <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0 text-gray-400 group-hover:text-indigo-500">
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
      </div>
    </div>
  )

  if (to) return <Link to={to} className="block">{content}</Link>
  return content
}
