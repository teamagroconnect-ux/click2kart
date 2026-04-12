import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import api from '../../lib/api'
import { useToast } from '../../components/Toast'
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts'

/** Rows for SKU dropdown (same shape as previous inline useMemo). */
function buildSkuRows(selectedProduct) {
  if (!selectedProduct) return []
  const list = []
  if (selectedProduct.variants && selectedProduct.variants.length > 0) {
    selectedProduct.variants.forEach(v => {
      const vAttrs = (v.attributes && typeof v.attributes === 'object' && !(v.attributes instanceof Map))
        ? v.attributes
        : (v.attributes instanceof Map ? Object.fromEntries(v.attributes) : {})
      const attrLabel = Object.entries(vAttrs).map(([k, val]) => `${k}: ${val}`).join(', ')
      list.push({
        productId: selectedProduct._id,
        productName: selectedProduct.name,
        sku: v.sku,
        attrLabel,
        image: v.images?.[0]?.url || selectedProduct.images?.[0]?.url,
        stock: v.stock,
        isVariant: true,
        variantId: v._id,
      })
    })
  } else {
    list.push({
      productId: selectedProduct._id,
      productName: selectedProduct.name,
      sku: selectedProduct.sku || '',
      image: selectedProduct.images?.[0]?.url,
      stock: selectedProduct.stock,
      isVariant: false,
    })
  }
  return list
}

/** Parse `/api/inventory/overview` row id → product ObjectId + optional variant SKU. */
function parseOverviewItemId(raw) {
  const s = String(raw || '')
  const m = s.match(/^([a-f\d]{24})_(.*)$/i)
  if (m) return { productId: m[1], variantSku: m[2] || '' }
  if (/^[a-f\d]{24}$/i.test(s)) return { productId: s, variantSku: '' }
  return { productId: s, variantSku: '' }
}

function skuHintLine(p) {
  const brand = p.brand?.name || p.brand
  const cat = p.category?.name || p.category
  const bits = [brand, cat].filter(Boolean)
  const sku = p.sku || (Array.isArray(p.variants) ? p.variants.find(v => v.sku)?.sku : '') || ''
  const tail = sku ? `SKU: ${sku}` : ''
  return [bits.join(' · '), tail].filter(Boolean).join(' · ') || '—'
}

export default function InventoryPage() {
  const { notify } = useToast()
  const [q, setQ] = useState('')
  const [options, setOptions] = useState([])
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [selectedSku, setSelectedSku] = useState(null)
  const [qty, setQty] = useState('')
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState({ kpis: { totalSkus:0, totalUnits:0, lowStockCount:0, totalAdded30d:0 }, daily: [], topProducts: [], lowStock: [] })
  const [overview, setOverview] = useState([])
  const [showSkuModal, setShowSkuModal] = useState(false)
  const [selectedProductForSkuView, setSelectedProductForSkuView] = useState(null)
  const [topSkus, setTopSkus] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchHi, setSearchHi] = useState(-1)
  const searchBoxRef = useRef(null)

  useEffect(() => {
    if (selectedProductForSkuView) {
      const fetchTopSkus = async () => {
        try {
          const { data } = await api.get(`/api/products/${selectedProductForSkuView.productId}/top-skus`)
          setTopSkus(data.items || [])
        } catch (error) {
          console.error('Failed to fetch top SKUs', error)
        }
      }
      fetchTopSkus()
    }
  }, [selectedProductForSkuView])

  const canSubmit = selectedSku && Number.isInteger(Number(qty)) && Number(qty) > 0

  const productSkus = useMemo(() => buildSkuRows(selectedProduct), [selectedProduct])

  // Filter overview to only show individual SKUs (variants or simple products)
  const skuOverview = useMemo(() => {
    return overview.filter(o => o.sku); // Only items with a specific identity
  }, [overview]);

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
      if (!q.trim()) { setOptions([]); setSearchLoading(false); return }
      setSearchLoading(true)
      try {
        const { data } = await api.get('/api/products', { params: { q: q.trim(), limit: 35, page: 1 }, signal: ctrl.signal })
        setOptions(data.items || [])
      } catch { /* ignore */ }
      finally {
        if (!ctrl.signal.aborted) setSearchLoading(false)
      }
    }
    const id = setTimeout(run, 160)
    return () => { clearTimeout(id); ctrl.abort() }
  }, [q])

  useEffect(() => {
    setSearchHi(options.length ? 0 : -1)
  }, [options])

  useEffect(() => {
    const close = (e) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target)) setOptions([])
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const pickProduct = useCallback(async (productId, preferredVariantSku = '') => {
    if (!productId) return
    try {
      const { data } = await api.get(`/api/products/${productId}`)
      const rows = buildSkuRows(data)
      setSelectedProduct(data)
      setQ('')
      setOptions([])
      setSearchHi(-1)
      if (preferredVariantSku) {
        const row = rows.find(r => r.sku === preferredVariantSku)
        setSelectedSku(row || rows[0] || null)
      } else {
        setSelectedSku(rows[0] || null)
      }
    } catch {
      notify('Could not load product', 'error')
    }
  }, [notify])

  const submit = async (e) => {
    e.preventDefault()
    if (!canSubmit) return
    
    // Enforce SKU identity
    if (!selectedSku.sku) {
      notify('This item has no SKU. Please assign a SKU in Product Management first.', 'error')
      return
    }

    setSubmitting(true)
    try {
      await api.post('/api/inventory/in', {
        productId: selectedProduct._id,
        variantSku: selectedSku.sku,
        quantity: Number(qty),
        note
      })
      notify(`Stock added to SKU: ${selectedSku.sku}`, 'success')
      setQty('')
      setNote('')
      setQ('')
      setSelectedProduct(null)
      setSelectedSku(null)
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
                <Bar dataKey="quantity" fill="#10b981" onClick={(data) => { setSelectedProductForSkuView(data); setShowSkuModal(true); }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {showSkuModal && selectedProductForSkuView && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-5 shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-gray-900">Top 5 SKUs for {selectedProductForSkuView.name}</h2>
              <button onClick={() => setShowSkuModal(false)} className="text-gray-500 hover:text-gray-800">&times;</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50/50 border-b border-gray-100 text-gray-500 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-4 py-3 text-left">SKU</th>
                    <th className="px-4 py-3 text-left">Quantity Sold</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {topSkus.map(sku => (
                    <tr key={sku.sku}>
                      <td className="px-4 py-3 font-semibold text-gray-900">{sku.sku}</td>
                      <td className="px-4 py-3 text-gray-800">{sku.quantity}</td>
                    </tr>
                  ))}
                  {topSkus.length === 0 && (
                    <tr>
                      <td colSpan="2" className="px-4 py-6 text-center text-gray-400">No SKU data available for this product.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

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
              {skuOverview.map(o => (
                <tr key={o.id}>
                  <td className="px-4 py-3 font-semibold text-gray-900">{o.sku ? `${o.name} (${o.sku})` : o.name}</td>
                  <td className="px-4 py-3 text-gray-800">{o.total}</td>
                  <td className="px-4 py-3 text-gray-800">{o.reserved}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-lg text-[11px] font-bold border ${o.low ? 'bg-red-50 text-red-700 border-red-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>
                      {o.available}
                    </span>
                  </td>
                </tr>
              ))}
              {skuOverview.length === 0 && (<tr><td colSpan="4" className="px-4 py-6 text-center text-gray-400">No SKUs available. Assign SKUs to products/variants to manage stock.</td></tr>)}
            </tbody>
          </table>
        </div>
      </div>

      <form onSubmit={submit} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4">
        {!selectedProduct && skuOverview.length > 0 && (
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1.5 block">Quick pick (overview)</label>
            <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto pr-1">
              {skuOverview.slice(0, 18).map(o => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => {
                    const { productId, variantSku } = parseOverviewItemId(o.id)
                    pickProduct(productId, variantSku)
                  }}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-gray-200 bg-gray-50 hover:bg-violet-50 hover:border-violet-200 text-left transition-colors max-w-[280px]"
                >
                  <span className="text-[11px] font-bold text-gray-900 truncate">{o.name}</span>
                  {o.sku && <span className="text-[10px] font-mono text-violet-700 shrink-0">{o.sku}</span>}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-3">
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1 block">Select Product</label>
            <div className="relative" ref={searchBoxRef}>
              {!selectedProduct ? (
                <>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                    </span>
                    <input
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-10 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Search name, brand, or SKU…"
                      value={q}
                      autoComplete="off"
                      onChange={e => setQ(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'ArrowDown' && options.length) {
                          e.preventDefault()
                          setSearchHi(i => {
                            const next = i < 0 ? 0 : i + 1
                            return Math.min(options.length - 1, next)
                          })
                          return
                        }
                        if (e.key === 'ArrowUp' && options.length) {
                          e.preventDefault()
                          setSearchHi(i => Math.max(0, (i < 0 ? 0 : i - 1)))
                          return
                        }
                        if (e.key === 'Enter') {
                          if (options.length > 0 && searchHi >= 0 && options[searchHi]) {
                            e.preventDefault()
                            pickProduct(options[searchHi]._id)
                          } else {
                            e.preventDefault()
                          }
                          return
                        }
                        if (e.key === 'Escape') {
                          setOptions([])
                        }
                      }}
                    />
                    {searchLoading && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-violet-200 border-t-violet-600 rounded-full animate-spin" aria-hidden />
                    )}
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">Type 1+ characters · ↑↓ to move · Enter to select · matches SKU</p>
                  {options.length > 0 && (
                    <div className="absolute z-20 mt-2 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-xl max-h-80 overflow-y-auto">
                      {options.map((p, idx) => (
                        <button
                          key={p._id}
                          type="button"
                          onClick={() => pickProduct(p._id)}
                          onMouseEnter={() => setSearchHi(idx)}
                          className={`w-full px-3 py-2.5 text-left flex items-center gap-3 border-b last:border-0 border-gray-50 ${idx === searchHi ? 'bg-violet-50 ring-1 ring-inset ring-violet-200' : 'hover:bg-gray-50'}`}
                        >
                          <div className="h-10 w-10 rounded-lg bg-gray-50 border border-gray-100 overflow-hidden flex items-center justify-center flex-shrink-0">
                            {p.images?.[0]?.url ? (
                              <img src={p.images[0].url} alt="" className="h-full w-full object-contain" />
                            ) : <span className="text-[10px] text-gray-400">📦</span>}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-bold text-gray-900 truncate">{p.name}</div>
                            <div className="text-[10px] text-gray-500 truncate mt-0.5">{skuHintLine(p)}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl bg-gray-50">
                  <div className="h-10 w-10 rounded-lg bg-white border border-gray-100 overflow-hidden flex items-center justify-center flex-shrink-0">
                    {selectedProduct.images?.[0]?.url ? (
                      <img src={selectedProduct.images[0].url} alt={selectedProduct.name} className="h-full w-full object-contain" />
                    ) : <span className="text-[10px] text-gray-400">📦</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-gray-900 truncate">{selectedProduct.name}</div>
                  </div>
                  <button type="button" onClick={() => { setSelectedProduct(null); setSelectedSku(null); setQ(''); }} className="px-3 py-1.5 rounded-lg bg-white border text-gray-600 hover:bg-gray-100 text-xs font-bold">Change</button>
                </div>
              )}
            </div>
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1 block">Select SKU</label>
            <select 
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
              disabled={!selectedProduct || productSkus.length === 0}
              value={selectedSku ? selectedSku.sku : ''}
              onChange={e => setSelectedSku(productSkus.find(s => s.sku === e.target.value) || null)}
            >
              <option value="">{productSkus.length > 0 ? '-- Select SKU --' : (selectedProduct ? 'No SKUs for this product' : 'Select a product first')}</option>
              {productSkus.map(s => (
                <option key={s.sku} value={s.sku}>{s.attrLabel ? `${s.sku} (${s.attrLabel})` : s.sku} (Stock: {s.stock ?? 0})</option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr_auto] gap-3">
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
          <div className="flex items-end">
            <button
              type="submit"
              disabled={!canSubmit || submitting}
              className="px-5 py-3 rounded-xl bg-gray-900 text-white text-sm font-black uppercase tracking-widest disabled:opacity-40 w-full"
            >
              {submitting ? 'Saving...' : 'Add Stock'}
            </button>
          </div>
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
                <th className="px-4 py-3 text-left">Product / SKU</th>
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
                    <td className="px-4 py-3">
                      <div className="font-semibold text-gray-900 leading-tight">{h.productName || h.productId}</div>
                      {h.variantSku && <div className="text-[10px] text-blue-600 font-bold uppercase tracking-wider mt-0.5">SKU: {h.variantSku}</div>}
                    </td>
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
