import { useEffect, useMemo, useState } from 'react'
import api from '../../lib/api'
import { useToast } from '../../components/Toast'
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts'

export default function InventoryPage() {
  const { notify } = useToast()
  const [q, setQ] = useState('')
  const [options, setOptions] = useState([])
  const [selected, setSelected] = useState(null)
  const [qty, setQty] = useState('')
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState({ kpis: { totalSkus:0, totalUnits:0, lowStockCount:0, totalAdded30d:0 }, daily: [], topProducts: [], lowStock: [] })
  const [overview, setOverview] = useState([])

  const canSubmit = selected && Number.isInteger(Number(qty)) && Number(qty) > 0

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const { data } = await api.get('/api/inventory/history', { params: { limit: 20 } })
        setHistory(data.items || [])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  useEffect(() => {
    const loadSum = async () => {
      try {
        const { data } = await api.get('/api/inventory/summary', { params: { days: 30 } })
        setSummary(data)
      } catch {}
    }
    loadSum()
  }, [])

  useEffect(() => {
    const run = async () => {
      try {
        const { data } = await api.get('/api/inventory/overview')
        setOverview(data.items || [])
      } catch {}
    }
    run()
  }, [])

  useEffect(() => {
    const ctrl = new AbortController()
    const run = async () => {
      if (!q.trim()) { setOptions([]); return }
      try {
        const { data } = await api.get('/api/products', { params: { q, limit: 10 }, signal: ctrl.signal })
        setOptions(data.items || [])
      } catch { /* ignore */ }
    }
    const id = setTimeout(run, 250)
    return () => { clearTimeout(id); ctrl.abort() }
  }, [q])

  const submit = async (e) => {
    e.preventDefault()
    if (!canSubmit) return
    setSubmitting(true)
    try {
      await api.post('/api/inventory/in', {
        productId: selected._id,
        quantity: Number(qty),
        note
      })
      notify('Stock added successfully', 'success')
      setQty('')
      setNote('')
      setQ('')
      setSelected(null)
      const { data } = await api.get('/api/inventory/history', { params: { limit: 20 } })
      setHistory(data.items || [])
    } catch (err) {
      notify(err?.response?.data?.error || 'Failed to add stock', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
        <p className="text-sm text-gray-500">Log incoming stock and review analytics.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
          <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total SKUs</div>
          <div className="text-2xl font-black">{summary.kpis.totalSkus}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
          <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total Units</div>
          <div className="text-2xl font-black">{summary.kpis.totalUnits}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
          <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">Low Stock</div>
          <div className="text-2xl font-black">{summary.kpis.lowStockCount}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
          <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">Stock-In (30d)</div>
          <div className="text-2xl font-black">+{summary.kpis.totalAdded30d}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-semibold text-gray-700">Daily Stock-In (30 days)</div>
          </div>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <AreaChart data={summary.daily}>
                <defs>
                  <linearGradient id="c1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#f3f4f6" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Area type="monotone" dataKey="quantity" stroke="#2563eb" fillOpacity={1} fill="url(#c1)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
          <div className="text-sm font-semibold text-gray-700 mb-2">Top Stocked Products</div>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={summary.topProducts}>
                <CartesianGrid stroke="#f3f4f6" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-30} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="quantity" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-black uppercase tracking-widest text-gray-500">Product Stock Overview</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50/50 border-b border-gray-100 text-gray-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3 text-left">Product</th>
                <th className="px-4 py-3 text-left">Total</th>
                <th className="px-4 py-3 text-left">Reserved</th>
                <th className="px-4 py-3 text-left">Available</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {overview.map(o => (
                <tr key={o.id}>
                  <td className="px-4 py-3 font-semibold text-gray-900">{o.name}</td>
                  <td className="px-4 py-3 text-gray-800">{o.total}</td>
                  <td className="px-4 py-3 text-gray-800">{o.reserved}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-lg text-[11px] font-bold border ${o.low ? 'bg-red-50 text-red-700 border-red-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>
                      {o.available}
                    </span>
                  </td>
                </tr>
              ))}
              {overview.length === 0 && (<tr><td colSpan="4" className="px-4 py-6 text-center text-gray-400">No products</td></tr>)}
            </tbody>
          </table>
        </div>
      </div>

      <form onSubmit={submit} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-3">
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1 block">Select Product</label>
            <div className="relative">
              {!selected ? (
                <>
                  <input
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Search product by name"
                    value={q}
                    onChange={e => setQ(e.target.value)}
                  />
                  {options.length > 0 && (
                    <div className="absolute z-10 mt-2 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg max-h-64 overflow-y-auto">
                      {options.map(p => (
                        <button
                          key={p._id}
                          type="button"
                          onClick={() => { setSelected(p); setOptions([]); }}
                          className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-3"
                        >
                          <div className="h-10 w-10 rounded-lg bg-gray-50 border border-gray-100 overflow-hidden flex items-center justify-center flex-shrink-0">
                            {p.images?.[0]?.url ? (
                              <img src={p.images[0].url} alt={p.name} className="h-full w-full object-contain" />
                            ) : <span className="text-[10px] text-gray-400">📦</span>}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900">{p.name}</div>
                            <div className="text-[11px] text-gray-500">Stock: {p.stock ?? 0}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl bg-gray-50">
                  <div className="h-10 w-10 rounded-lg bg-white border border-gray-100 overflow-hidden flex items-center justify-center flex-shrink-0">
                    {selected.images?.[0]?.url ? (
                      <img src={selected.images[0].url} alt={selected.name} className="h-full w-full object-contain" />
                    ) : <span className="text-[10px] text-gray-400">📦</span>}
                  </div>
                  <div className="flex-1">
                        <div className="text-sm font-semibold text-gray-900">{selected.name}</div>
                    <div className="text-[11px] text-gray-500">Current stock: {selected.stock ?? 0}</div>
                    {(selected.store || selected.section) && (
                      <div className="text-[11px] text-gray-600">Location: {(selected.store || '-')}{selected.section ? `(${selected.section})` : ''}</div>
                    )}
                  </div>
                  <button type="button" onClick={() => { setSelected(null); setQ('') }} className="px-3 py-1.5 rounded-lg bg-white border text-gray-600 hover:bg-gray-100 text-xs font-bold">Change</button>
                </div>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1 block">Quantity</label>
              <input
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                type="number" min="1" step="1"
                placeholder="e.g. 100"
                value={qty}
                onChange={e => setQty(e.target.value)}
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1 block">Note (optional)</label>
              <input
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="e.g. GRN #123, supplier name"
                value={note}
                onChange={e => setNote(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div>
          <button
            type="submit"
            disabled={!canSubmit || submitting}
            className="px-5 py-3 rounded-xl bg-gray-900 text-white text-sm font-black uppercase tracking-widest disabled:opacity-40"
          >
            {submitting ? 'Saving...' : 'Add Stock'}
          </button>
        </div>
      </form>

      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-black uppercase tracking-widest text-gray-500">Recent Stock-In</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50/50 border-b border-gray-100 text-gray-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Product</th>
                <th className="px-4 py-3 text-left">Quantity</th>
                <th className="px-4 py-3 text-left">Location</th>
                <th className="px-4 py-3 text-left">Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan="5" className="px-4 py-6 text-center text-gray-400">Loading...</td></tr>
              ) : history.length === 0 ? (
                <tr><td colSpan="5" className="px-4 py-6 text-center text-gray-400">No stock-in records yet</td></tr>
              ) : (
                history.map((h) => (
                  <tr key={h.id}>
                    <td className="px-4 py-3 text-gray-600">{new Date(h.createdAt).toLocaleString('en-IN', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' })}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{h.productName || h.productId}</td>
                    <td className="px-4 py-3 text-emerald-700 font-bold">+{h.quantity}</td>
                    <td className="px-4 py-3 text-gray-600">{(h.store || '-')}{h.section ? `(${h.section})` : ''}</td>
                    <td className="px-4 py-3 text-gray-600">{h.note || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-black uppercase tracking-widest text-gray-500">Low Stock</h2>
        </div>
        <div className="divide-y">
          {summary.lowStock.map(p => (
            <div key={p.id} className="py-2 flex items-center justify-between">
              <div className="text-sm font-semibold text-gray-800 truncate">{p.name}</div>
              <div className="text-sm font-bold text-red-600">{p.stock}</div>
            </div>
          ))}
          {summary.lowStock.length === 0 && (
            <div className="py-3 text-gray-500 text-sm">No low stock items</div>
          )}
        </div>
      </div>
    </div>
  )
}
