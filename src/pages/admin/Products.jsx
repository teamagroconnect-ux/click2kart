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
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold text-slate-50">Products</h1>
            <p className="text-[11px] text-slate-400">
              Manage Click2Kart catalogue, stock levels and pricing.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input
              placeholder="Search products"
              className="border border-slate-700 bg-slate-900/70 text-slate-50 text-sm rounded-lg px-3 py-2 w-56 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={q}
              onChange={e => setQ(e.target.value)}
            />
          </div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden shadow-inner">
          <div className="overflow-x-auto">
            <table className="w-full text-xs md:text-sm">
              <thead>
                <tr className="text-left bg-slate-900/80 text-slate-400 border-b border-slate-800">
                  <th className="px-3 py-2 font-medium">Name</th>
                  <th className="px-3 py-2 font-medium">Price</th>
                  <th className="px-3 py-2 font-medium">Stock</th>
                  <th className="px-3 py-2 font-medium">GST</th>
                  <th className="px-3 py-2 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {!loading &&
                  items.map(p => (
                    <tr
                      key={p._id}
                      className="border-t border-slate-800/80 hover:bg-slate-900/80"
                    >
                      <td className="px-3 py-2">
                        <div className="font-medium text-slate-50 truncate">{p.name}</div>
                      </td>
                      <td className="px-3 py-2 text-slate-200">₹{p.price}</td>
                      <td className="px-3 py-2 text-slate-200">{p.stock}</td>
                      <td className="px-3 py-2 text-slate-200">{p.gst}%</td>
                      <td className="px-3 py-2">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEdit(p)}
                            className="px-2 py-1 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => reduceStock(p._id)}
                            className="px-2 py-1 rounded-md bg-amber-500/90 hover:bg-amber-400 text-white text-xs"
                          >
                            Reduce
                          </button>
                          <button
                            onClick={() => remove(p)}
                            className="px-2 py-1 rounded-md bg-red-600 hover:bg-red-500 text-white text-xs"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                {loading &&
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-t border-slate-800 animate-pulse">
                      <td className="px-3 py-2">
                        <div className="h-4 bg-slate-800 rounded w-2/3" />
                      </td>
                      <td className="px-3 py-2">
                        <div className="h-4 bg-slate-800 rounded w-16" />
                      </td>
                      <td className="px-3 py-2">
                        <div className="h-4 bg-slate-800 rounded w-12" />
                      </td>
                      <td className="px-3 py-2">
                        <div className="h-4 bg-slate-800 rounded w-10" />
                      </td>
                      <td className="px-3 py-2">
                        <div className="h-8 bg-slate-800 rounded w-full" />
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-between items-center px-3 py-2 border-t border-slate-800 text-[11px] text-slate-400">
            <div>
              Page {page} of {Math.max(1, Math.ceil(total / limit))}
            </div>
            <div className="space-x-2">
              <button
                onClick={() => load(Math.max(1, page - 1))}
                className="px-2 py-1 border border-slate-700 rounded-md hover:bg-slate-800 disabled:opacity-40"
                disabled={page === 1}
              >
                Prev
              </button>
              <button
                onClick={() => load(page + 1)}
                className="px-2 py-1 border border-slate-700 rounded-md hover:bg-slate-800 disabled:opacity-40"
                disabled={page * limit >= total}
              >
                Next
              </button>
            </div>
          </div>
        </div>

        <form
          onSubmit={create}
          className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 md:p-5 grid grid-cols-1 md:grid-cols-2 gap-3"
        >
          <div className="md:col-span-2">
            <div className="text-sm font-semibold text-slate-50">Add new product</div>
            <div className="text-[11px] text-slate-400">
              Quickly create catalogue items for Click2Kart.
            </div>
          </div>
          <input
            className="border border-slate-700 bg-slate-950/40 text-slate-50 text-sm rounded-lg px-3 py-2 w-full"
            placeholder="Name"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
          />
          <input
            className="border border-slate-700 bg-slate-950/40 text-slate-50 text-sm rounded-lg px-3 py-2 w-full"
            placeholder="Price"
            value={form.price}
            onChange={e => setForm({ ...form, price: e.target.value })}
          />
          <select
            className="border border-slate-700 bg-slate-950/40 text-slate-50 text-sm rounded-lg px-3 py-2 w-full"
            value={form.category}
            onChange={e => setForm({ ...form, category: e.target.value })}
          >
            <option value="">Select category</option>
            {categories.map(c => (
              <option key={c._id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
          <input
            className="border border-slate-700 bg-slate-950/40 text-slate-50 text-sm rounded-lg px-3 py-2 w-full"
            placeholder="Stock"
            value={form.stock}
            onChange={e => setForm({ ...form, stock: e.target.value })}
          />
          <input
            className="border border-slate-700 bg-slate-950/40 text-slate-50 text-sm rounded-lg px-3 py-2 w-full"
            placeholder="GST %"
            value={form.gst}
            onChange={e => setForm({ ...form, gst: e.target.value })}
          />
          <div className="md:col-span-2 flex flex-col md:flex-row items-stretch md:items-center gap-2">
            <input
              className="border border-slate-700 bg-slate-950/40 text-slate-50 text-sm rounded-lg px-3 py-2 flex-1"
              placeholder="Image URLs (comma separated)"
              value={form.images}
              onChange={e => setForm({ ...form, images: e.target.value })}
            />
            <ImageUpload
              onUploaded={url =>
                setForm(f => ({
                  ...f,
                  images: (f.images ? f.images + ', ' : '') + url
                }))
              }
            />
          </div>
          <textarea
            className="border border-slate-700 bg-slate-950/40 text-slate-50 text-sm rounded-lg px-3 py-2 md:col-span-2 min-h-[72px]"
            placeholder="Description"
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
          />
          <button className="bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg md:col-span-2 text-sm font-semibold">
            Add product
          </button>
        </form>
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

