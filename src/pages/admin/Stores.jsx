import { useEffect, useState } from 'react'
import api from '../../lib/api'
import { useToast } from '../../components/Toast'

export default function Stores() {
  const { notify } = useToast()
  const [items, setItems] = useState([])
  const [name, setName] = useState('')
  const [section, setSection] = useState('')
  const [activeId, setActiveId] = useState('')
  const [browseStore, setBrowseStore] = useState('')
  const [browseSection, setBrowseSection] = useState('')
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)

  const load = async () => {
    const { data } = await api.get('/api/stores')
    setItems(data || [])
  }
  useEffect(() => { load() }, [])

  const create = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    try { await api.post('/api/stores', { name }); setName(''); load(); notify('Store added','success') }
    catch (e) { notify(e?.response?.data?.error || 'Failed','error') }
  }
  const addSection = async (storeId) => {
    if (!section.trim() || !activeId) return
    try { await api.post(`/api/stores/${storeId}/sections`, { name: section }); setSection(''); load(); notify('Section added','success') }
    catch { notify('Failed','error') }
  }

  const loadProducts = async (storeName, sectionName='') => {
    if (!storeName) { setProducts([]); return }
    setLoading(true)
    try {
      const params = { store: storeName, limit: 100 }
      if (sectionName) params.section = sectionName
      const { data } = await api.get('/api/products', { params })
      setProducts(data.items || [])
    } finally { setLoading(false) }
  }

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Fulfillment Centers</h1>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-1">Inventory Location Management</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-8">
        <form onSubmit={create} className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm space-y-6 h-fit">
          <div>
            <h3 className="text-lg font-black text-gray-900 italic">Add New Store</h3>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Warehouse or Outlet</p>
          </div>
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-500 uppercase ml-1">Store Name</label>
              <input className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-gray-900 outline-none transition-all" placeholder="e.g. Warehouse A" value={name} onChange={e=>setName(e.target.value)} />
            </div>
            <button className="w-full py-4 rounded-2xl bg-gray-900 text-white text-xs font-black uppercase tracking-[0.2em] hover:bg-gray-800 transition-all shadow-xl shadow-gray-900/10">Register Store</button>
          </div>
        </form>

        <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm space-y-6">
          <div>
            <h3 className="text-lg font-black text-gray-900 italic">Active Locations</h3>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Manage sections and racks</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map(s => (
              <div key={s._id} className={`p-6 rounded-3xl border transition-all ${activeId === s._id ? 'border-indigo-500 bg-indigo-50/30 ring-1 ring-indigo-500/20' : 'border-gray-100 bg-gray-50/30 hover:bg-gray-50'}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-white border flex items-center justify-center text-gray-400">
                      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
                    </div>
                    <div className="font-black text-gray-900 text-sm">{s.name}</div>
                  </div>
                  <button onClick={()=>setActiveId(activeId===s._id?'':s._id)} className={`p-2 rounded-xl transition-all ${activeId === s._id ? 'bg-indigo-600 text-white' : 'bg-white text-gray-400 border'}`}>
                    <svg className={`w-4 h-4 transition-transform ${activeId === s._id ? 'rotate-45' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
                  </button>
                </div>
                
                {activeId===s._id ? (
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-2">
                      <input className="flex-1 bg-white border-none rounded-xl px-4 py-2 text-xs font-bold focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Add section (e.g. Rack B2)" value={section} onChange={e=>setSection(e.target.value)} />
                      <button onClick={()=>addSection(s._id)} className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest">Add</button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(s.sections || []).map(sec => (
                        <span key={sec} className="px-3 py-1.5 rounded-lg bg-white border border-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-tight">{sec}</span>
                      ))}
                      {(s.sections || []).length === 0 && (
                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest py-2">No sections defined</div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{(s.sections || []).length} Sections</span>
                    <span className="h-1 w-1 rounded-full bg-gray-300"></span>
                    <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Manage</span>
                  </div>
                )}
              </div>
            ))}
            {items.length === 0 && (
              <div className="col-span-2 py-12 text-center text-gray-400 text-[10px] font-black uppercase tracking-[0.3em]">No fulfillment centers configured</div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-black text-gray-900 italic">Inventory Explorer</h3>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Browse products by physical location</p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="min-w-[200px]">
              <select className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-xs font-black uppercase tracking-widest focus:ring-2 focus:ring-gray-900 outline-none appearance-none cursor-pointer"
                value={browseStore}
                onChange={e => { 
                  const val = e.target.value; 
                  setBrowseStore(val); 
                  setBrowseSection(''); 
                  loadProducts(val, '') 
                }}>
                <option value="">Select Store</option>
                {items.map(s => <option key={s._id} value={s.name}>{s.name}</option>)}
              </select>
            </div>
            <div className="min-w-[200px]">
              <select className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-xs font-black uppercase tracking-widest focus:ring-2 focus:ring-gray-900 outline-none appearance-none cursor-pointer disabled:opacity-50"
                value={browseSection}
                onChange={e => { 
                  const sec = e.target.value; 
                  setBrowseSection(sec); 
                  loadProducts(browseStore, sec) 
                }}
                disabled={!browseStore}
              >
                <option value="">All Sections</option>
                {(items.find(s => s.name === browseStore)?.sections || []).map(sec => <option key={sec} value={sec}>{sec}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div>
          {!browseStore ? (
            <div className="py-20 text-center bg-gray-50/50 rounded-[2rem] border border-dashed border-gray-200">
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Select a center to begin exploring</div>
            </div>
          ) : loading ? (
            <div className="py-20 text-center animate-pulse">
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Mapping Inventory...</div>
            </div>
          ) : products.length === 0 ? (
            <div className="py-20 text-center bg-gray-50/50 rounded-[2rem] border border-dashed border-gray-200">
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">No items found in this location</div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {products.map(p => (
                <div key={p._id} className="group cursor-pointer">
                  <div className="aspect-square w-full bg-white border border-gray-100 rounded-3xl flex items-center justify-center overflow-hidden p-4 group-hover:shadow-xl transition-all group-hover:-translate-y-1">
                    {p.images?.[0]?.url ? (
                      <img src={p.images[0].url} alt={p.name} className="h-full w-full object-contain" />
                    ) : (
                      <span className="text-[10px] text-gray-300 font-black uppercase">No Image</span>
                    )}
                  </div>
                  <div className="mt-4 px-1">
                    <div className="text-[11px] font-black text-gray-900 truncate uppercase tracking-tight">{p.name}</div>
                    <div className="flex items-center justify-between mt-1">
                      <div className="text-[9px] text-indigo-600 font-bold uppercase">{(p.store || '')}{p.section ? ` · ${p.section}` : ''}</div>
                      <div className={`text-[9px] font-black px-1.5 py-0.5 rounded ${p.stock <= 5 ? 'text-rose-600 bg-rose-50' : 'text-emerald-600 bg-emerald-50'}`}>{p.stock ?? 0} UNITS</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
