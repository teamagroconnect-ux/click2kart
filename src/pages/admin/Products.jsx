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
  const [form, setForm] = useState({ name:'', price:'', mrp:'', category:'', subcategory:'', stock:'', gst:'', images: '', description:'', bulkDiscountQuantity: '', bulkDiscountPriceReduction: '' })
  const [editing, setEditing] = useState(null)
  const [toDelete, setToDelete] = useState(null)
  const [categories, setCategories] = useState([])
  const limit = 10
  const [preview, setPreview] = useState('')

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
    await api.post('/api/products', { 
      ...form, 
      price: Number(form.price), 
      stock: Number(form.stock), 
      gst: Number(form.gst||0), 
      mrp: form.mrp ? Number(form.mrp) : undefined,
      bulkDiscountQuantity: Number(form.bulkDiscountQuantity||0),
      bulkDiscountPriceReduction: Number(form.bulkDiscountPriceReduction||0),
      images 
    })
    setForm({ name:'', price:'', mrp:'', category:'', subcategory:'', stock:'', gst:'', images: '', description:'', bulkDiscountQuantity: '', bulkDiscountPriceReduction: '' }); load(page); notify('Product added','success')
  }

  const reduceStock = async (id) => {
    const qty = Number(prompt('Reduce by quantity?')||'0')
    if (qty>0){ await api.patch(`/api/products/${id}/stock`, { quantity: qty }); load(page) }
  }

  const openEdit = (p) => setEditing({ 
    ...p, 
    images: (p.images||[]).map(i=>i.url||i).join(', '),
    bulkDiscountQuantity: p.bulkDiscountQuantity || '',
    bulkDiscountPriceReduction: p.bulkDiscountPriceReduction || ''
  })
  const saveEdit = async (e) => {
    e.preventDefault()
    const payload = {
      name: editing.name,
      description: editing.description,
      price: Number(editing.price),
      category: editing.category,
      subcategory: editing.subcategory || undefined,
      stock: Number(editing.stock),
      gst: Number(editing.gst||0),
      mrp: editing.mrp ? Number(editing.mrp) : undefined,
      bulkDiscountQuantity: Number(editing.bulkDiscountQuantity||0),
      bulkDiscountPriceReduction: Number(editing.bulkDiscountPriceReduction||0),
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
                            <div className="flex items-center gap-3">
                              <div className="h-12 w-12 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden flex items-center justify-center cursor-zoom-in" onClick={() => { if (p.images?.[0]?.url) setPreview(p.images[0].url) }}>
                                {p.images?.[0]?.url ? (
                                  <img src={p.images[0].url} alt={p.name} className="h-full w-full object-contain p-1" />
                                ) : (
                                  <span className="text-[10px] text-gray-400">No Img</span>
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="font-bold text-gray-900 truncate max-w-[240px]">{p.name}</div>
                                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{p.category || 'General'}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-black text-gray-900">₹{p.price.toLocaleString()}</div>
                            <div className="text-[10px] text-gray-400 font-bold">{p.gst}% GST</div>
                            {p.bulkDiscountQuantity > 0 && (
                              <div className="mt-1 inline-flex items-center gap-1 text-[9px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-100 uppercase tracking-tight">
                                {p.bulkDiscountQuantity}+: -₹{p.bulkDiscountPriceReduction}
                              </div>
                            )}
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
                    <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">MRP (₹)</label>
                    <input className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none" placeholder="1099" value={form.mrp} onChange={e => setForm({ ...form, mrp: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
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
                    <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Subcategory (optional)</label>
                    <input className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. mi" value={form.subcategory} onChange={e => setForm({ ...form, subcategory: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">GST %</label>
                    <input className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none" placeholder="12" value={form.gst} onChange={e => setForm({ ...form, gst: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Bulk Qty</label>
                    <input className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. 10" value={form.bulkDiscountQuantity} onChange={e => setForm({ ...form, bulkDiscountQuantity: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Reduction/Unit (₹)</label>
                    <input className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. 50" value={form.bulkDiscountPriceReduction} onChange={e => setForm({ ...form, bulkDiscountPriceReduction: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Images</label>
                  <div className="flex gap-2">
                    <input className="flex-1 bg-gray-50 border-none rounded-2xl px-4 py-3 text-[10px] font-bold focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Multiple URLs comma-separated" value={form.images} onChange={e => setForm({ ...form, images: e.target.value })} />
                    <ImageUpload onUploaded={url => setForm(f => ({ ...f, images: (f.images ? f.images + ', ' : '') + url }))} />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Description</label>
                  <textarea className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none min-h-[80px]" placeholder="Product details..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                </div>
                <button className="w-full bg-gray-900 text-white py-4 rounded-2xl text-sm font-black shadow-lg hover:bg-gray-800 transition-all transform hover:-translate-y-0.5 active:scale-95 uppercase tracking-widest">ADD TO INVENTORY</button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-300">
          <form
            onSubmit={saveEdit}
            className="bg-white border border-gray-100 rounded-3xl p-8 w-full max-w-2xl shadow-2xl space-y-6 animate-in zoom-in-95 duration-300"
          >
            <div className="flex items-center justify-between border-b border-gray-50 pb-4">
              <div>
                <h3 className="text-xl font-black text-gray-900 tracking-tight">Edit Product</h3>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Update item details</p>
              </div>
              <button type="button" onClick={() => setEditing(null)} className="p-2 hover:bg-gray-50 rounded-xl transition-colors text-gray-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Product Name</label>
                <input className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Name" value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} required />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Price (₹)</label>
                <input className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Price" value={editing.price} onChange={e => setEditing({ ...editing, price: e.target.value })} required />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Category</label>
                <select className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none appearance-none" value={editing.category || ''} onChange={e => setEditing({ ...editing, category: e.target.value })} required>
                  <option value="">Select category</option>
                  {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Subcategory (optional)</label>
                <input className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Subcategory" value={editing.subcategory || ''} onChange={e => setEditing({ ...editing, subcategory: e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Stock</label>
                <input className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Stock" value={editing.stock} onChange={e => setEditing({ ...editing, stock: e.target.value })} required />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">GST %</label>
                <input className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none" placeholder="GST %" value={editing.gst} onChange={e => setEditing({ ...editing, gst: e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Bulk Qty</label>
                <input className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none" placeholder="10" value={editing.bulkDiscountQuantity} onChange={e => setEditing({ ...editing, bulkDiscountQuantity: e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Reduction (₹)</label>
                <input className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none" placeholder="50" value={editing.bulkDiscountPriceReduction} onChange={e => setEditing({ ...editing, bulkDiscountPriceReduction: e.target.value })} />
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Images</label>
                <div className="flex gap-2">
                  <input className="flex-1 bg-gray-50 border-none rounded-2xl px-4 py-3 text-[10px] font-bold focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Multiple URLs comma-separated" value={editing.images} onChange={e => setEditing({ ...editing, images: e.target.value })} />
                  <ImageUpload onUploaded={url => setEditing(f => ({ ...f, images: (f.images ? f.images + ', ' : '') + url }))} />
                </div>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">MRP (₹)</label>
                    <input className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-[10px] font-bold focus:ring-2 focus:ring-blue-500 outline-none" placeholder="1099" value={editing.mrp || ''} onChange={e => setEditing({ ...editing, mrp: e.target.value })} />
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap mt-2">
                  {(editing.images || '').split(',').map(s => s.trim()).filter(Boolean).map((url, i) => (
                    <img key={i} src={url} className="h-12 w-12 object-contain bg-gray-50 border rounded-xl p-1" />
                  ))}
                </div>
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Description</label>
                <textarea className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none min-h-[100px]" placeholder="Description" value={editing.description} onChange={e => setEditing({ ...editing, description: e.target.value })} />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button type="button" onClick={() => setEditing(null)} className="flex-1 bg-gray-100 text-gray-600 py-4 rounded-2xl text-sm font-black hover:bg-gray-200 transition-all uppercase tracking-widest">Cancel</button>
              <button className="flex-2 bg-gray-900 text-white py-4 px-12 rounded-2xl text-sm font-black shadow-lg hover:bg-gray-800 transition-all transform hover:-translate-y-0.5 active:scale-95 uppercase tracking-widest">Save Changes</button>
            </div>
          </form>
        </div>
      )}

      <ConfirmModal
        open={!!toDelete}
        title="Delete Product?"
        message={`Are you sure you want to remove "${toDelete?.name}"? This action cannot be undone.`}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
      {preview && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-6" onClick={() => setPreview('')}>
          <div className="max-w-2xl w-full">
            <img src={preview} alt="Preview" className="w-full h-auto max-h-[80vh] rounded-3xl shadow-2xl object-contain" />
          </div>
        </div>
      )}
    </>
  )
}

