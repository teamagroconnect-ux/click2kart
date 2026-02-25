import { useEffect, useState } from 'react'
import api from '../../lib/api'
import { useToast } from '../../components/Toast'
import ConfirmModal from '../../components/ConfirmModal'
import ImageUpload from '../../components/ImageUpload'

export default function Products() {
  const { notify } = useToast()
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [q, setQ] = useState('')
  const [form, setForm] = useState({ name:'', price:'', category:'', stock:'', gst:'', images: '', description:'' })
  const [editing, setEditing] = useState(null)
  const [toDelete, setToDelete] = useState(null)
  const [categories, setCategories] = useState([])
  const limit = 10

  const [loading, setLoading] = useState(false)
  const load = async (p=1) => {
    setLoading(true)
    try {
      const { data } = await api.get('/api/products', { params: { page:p, limit, q } })
      setItems(data.items); setTotal(data.total); setPage(p)
    } finally { setLoading(false) }
  }
  useEffect(()=>{ load(1) }, [q])

  useEffect(() => {
    api.get('/api/categories').then(({ data }) => {
      setCategories((data || []).filter(c => c.isActive))
    }).catch(() => {})
  }, [])

  const create = async (e) => {
    e.preventDefault()
    const images = form.images.split(',').map(s=>s.trim()).filter(Boolean)
    await api.post('/api/products', { ...form, price: Number(form.price), stock: Number(form.stock), gst: Number(form.gst||0), images })
    setForm({ name:'', price:'', category:'', stock:'', gst:'', images: '', description:'' }); load(page); notify('Product added','success')
  }

  const reduceStock = async (id) => {
    const qty = Number(prompt('Reduce by quantity?')||'0')
    if (qty>0){ await api.patch(`/api/products/${id}/stock`, { quantity: qty }); load(page) }
  }

  const openEdit = (p) => setEditing({ ...p, images: (p.images||[]).map(i=>i.url||i).join(', ') })
  const saveEdit = async (e) => {
    e.preventDefault()
    const payload = {
      name: editing.name,
      description: editing.description,
      price: Number(editing.price),
      category: editing.category,
      stock: Number(editing.stock),
      gst: Number(editing.gst||0),
      images: (editing.images||'').split(',').map(s=>s.trim()).filter(Boolean)
    }
    await api.put(`/api/products/${editing._id}`, payload)
    setEditing(null); load(page); notify('Product updated','success')
  }
  const remove = (p) => setToDelete(p)
  const confirmDelete = async () => { if (!toDelete) return; await api.delete(`/api/products/${toDelete._id}`); setToDelete(null); load(page); notify('Product deleted','success') }

  return (
    <>
      <div className="space-y-8 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Product Inventory</h1>
            <p className="text-sm text-gray-500 font-medium">Manage your catalogue, track stock levels and adjust pricing.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative group">
              <input
                placeholder="Search products..."
                className="bg-white border border-gray-200 text-gray-900 text-sm rounded-2xl pl-10 pr-4 py-2.5 w-64 outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all"
                value={q}
                onChange={e => setQ(e.target.value)}
              />
              <svg className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Product List</h3>
            <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead className="bg-gray-50/50 border-b border-gray-50 text-gray-500 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="px-6 py-4">Product Info</th>
                      <th className="px-6 py-4">Price & GST</th>
                      <th className="px-6 py-4">Inventory</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {!loading &&
                      items.map(p => (
                        <tr key={p._id} className="group hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-bold text-gray-900 truncate max-w-[200px]">{p.name}</div>
                            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{p.category || 'General'}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-black text-gray-900">₹{p.price.toLocaleString()}</div>
                            <div className="text-[10px] text-gray-400 font-bold">{p.gst}% GST</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black border ${p.stock <= 5 ? 'bg-red-50 text-red-600 border-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                              {p.stock} IN STOCK
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => openEdit(p)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors" title="Edit Product">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                              </button>
                              <button onClick={() => reduceStock(p._id)} className="p-2 text-amber-600 hover:bg-amber-50 rounded-xl transition-colors" title="Adjust Stock">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" /></svg>
                              </button>
                              <button onClick={() => remove(p)} className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors" title="Delete Product">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-between items-center px-6 py-4 border-t border-gray-50 bg-gray-50/30">
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Page {page} of {Math.max(1, Math.ceil(total / limit))}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => load(Math.max(1, page - 1))} className="p-2 border border-gray-200 rounded-xl hover:bg-white disabled:opacity-30 transition-all" disabled={page === 1}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                  </button>
                  <button onClick={() => load(page + 1)} className="p-2 border border-gray-200 rounded-xl hover:bg-white disabled:opacity-30 transition-all" disabled={page * limit >= total}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-6">
              <h3 className="text-sm font-black uppercase tracking-widest text-gray-400">Add New Product</h3>
              <form onSubmit={create} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Product Name</label>
                  <input className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Classic Cotton Tee" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Price (₹)</label>
                    <input className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none" placeholder="999" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Stock</label>
                    <input className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none" placeholder="50" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Category</label>
                    <select className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none appearance-none" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} required>
                      <option value="">Select...</option>
                      {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">GST %</label>
                    <input className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none" placeholder="12" value={form.gst} onChange={e => setForm({ ...form, gst: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Images</label>
                  <div className="flex gap-2">
                    <input className="flex-1 bg-gray-50 border-none rounded-2xl px-4 py-3 text-[10px] font-bold focus:ring-2 focus:ring-blue-500 outline-none" placeholder="URLs..." value={form.images} onChange={e => setForm({ ...form, images: e.target.value })} />
                    <ImageUpload onUploaded={url => setForm(f => ({ ...f, images: (f.images ? f.images + ', ' : '') + url }))} />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Description</label>
                  <textarea className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none min-h-[80px]" placeholder="Product details..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                </div>
                <button className="w-full bg-gray-900 text-white py-4 rounded-2xl text-sm font-black shadow-lg hover:bg-gray-800 transition-all transform hover:-translate-y-0.5 active:scale-95">ADD TO INVENTORY</button>
              </form>
            </div>
          </div>
        </div>
      </div>
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-40">
          <form
            onSubmit={saveEdit}
            className="bg-slate-950 border border-slate-800 rounded-2xl p-5 w-full max-w-xl grid grid-cols-1 md:grid-cols-2 gap-3 shadow-[0_18px_45px_rgba(15,23,42,1)]"
          >
            <div className="md:col-span-2 text-base font-semibold mb-1 text-slate-50">
              Edit product
            </div>
            <input
              className="border border-slate-700 bg-slate-900/70 text-slate-50 text-sm rounded-lg px-3 py-2 w-full"
              placeholder="Name"
              value={editing.name}
              onChange={e => setEditing({ ...editing, name: e.target.value })}
            />
            <input
              className="border border-slate-700 bg-slate-900/70 text-slate-50 text-sm rounded-lg px-3 py-2 w-full"
              placeholder="Price"
              value={editing.price}
              onChange={e => setEditing({ ...editing, price: e.target.value })}
            />
            <select
              className="border border-slate-700 bg-slate-900/70 text-slate-50 text-sm rounded-lg px-3 py-2 w-full"
              value={editing.category || ''}
              onChange={e => setEditing({ ...editing, category: e.target.value })}
            >
              <option value="">Select category</option>
              {categories.map(c => (
                <option key={c._id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
            <input
              className="border border-slate-700 bg-slate-900/70 text-slate-50 text-sm rounded-lg px-3 py-2 w-full"
              placeholder="Stock"
              value={editing.stock}
              onChange={e => setEditing({ ...editing, stock: e.target.value })}
            />
            <input
              className="border border-slate-700 bg-slate-900/70 text-slate-50 text-sm rounded-lg px-3 py-2 w-full"
              placeholder="GST %"
              value={editing.gst}
              onChange={e => setEditing({ ...editing, gst: e.target.value })}
            />
            <div className="md:col-span-2 flex flex-col md:flex-row items-stretch md:items-center gap-2">
              <input
                className="border border-slate-700 bg-slate-900/70 text-slate-50 text-sm rounded-lg px-3 py-2 flex-1"
                placeholder="Images (comma separated)"
                value={editing.images}
                onChange={e => setEditing({ ...editing, images: e.target.value })}
              />
              <ImageUpload
                onUploaded={url =>
                  setEditing(ed => ({
                    ...ed,
                    images: (ed.images ? ed.images + ', ' : '') + url
                  }))
                }
              />
            </div>
            <textarea
              className="border border-slate-700 bg-slate-900/70 text-slate-50 text-sm rounded-lg px-3 py-2 md:col-span-2 min-h-[72px]"
              placeholder="Description"
              value={editing.description || ''}
              onChange={e => setEditing({ ...editing, description: e.target.value })}
            />
            <div className="md:col-span-2 flex justify-end gap-2 mt-1">
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="px-3 py-1.5 border border-slate-700 rounded-lg text-xs text-slate-200 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold">
                Save
              </button>
            </div>
          </form>
        </div>
      )}
      <ConfirmModal
        open={!!toDelete}
        title="Delete Product"
        message={`Delete ${toDelete?.name}?`}
        onCancel={() => setToDelete(null)}
        onConfirm={confirmDelete}
      />
    </>
  )
}

