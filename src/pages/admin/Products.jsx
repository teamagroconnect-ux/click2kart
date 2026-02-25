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
      <div className="flex items-center gap-2">
        <input placeholder="Search" className="border p-2" value={q} onChange={e=>setQ(e.target.value)} />
      </div>
      <div className="bg-white border rounded overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="text-left bg-gray-100"><th className="p-2">Name</th><th>Price</th><th>Stock</th><th>GST</th><th className="p-2">Actions</th></tr></thead>
          <tbody>
            {!loading && items.map(p => (
              <tr key={p._id} className="border-t">
                <td className="p-2">{p.name}</td>
                <td>{p.price}</td>
                <td>{p.stock}</td>
                <td>{p.gst}%</td>
                <td className="p-2 space-x-2">
                  <button onClick={()=>openEdit(p)} className="px-2 py-1 bg-blue-600 text-white rounded">Edit</button>
                  <button onClick={()=>reduceStock(p._id)} className="px-2 py-1 bg-yellow-500 text-white rounded">Reduce</button>
                  <button onClick={()=>remove(p)} className="px-2 py-1 bg-red-600 text-white rounded">Delete</button>
                </td>
              </tr>
            ))}
            {loading && Array.from({length:5}).map((_,i)=> (
              <tr key={i} className="border-t animate-pulse"><td className="p-2"><div className="h-4 bg-gray-200 rounded w-2/3"/></td><td><div className="h-4 bg-gray-200 rounded w-16"/></td><td><div className="h-4 bg-gray-200 rounded w-12"/></td><td><div className="h-4 bg-gray-200 rounded w-10"/></td><td className="p-2"><div className="h-8 bg-gray-200 rounded w-full"/></td></tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-between p-2">
          <div>Page {page} of {Math.max(1, Math.ceil(total/limit))}</div>
          <div className="space-x-2">
            <button onClick={()=>load(Math.max(1, page-1))} className="px-2 py-1 border rounded" disabled={page===1}>Prev</button>
            <button onClick={()=>load(page+1)} className="px-2 py-1 border rounded" disabled={page*limit>=total}>Next</button>
          </div>
        </div>
      </div>

      <form onSubmit={create} className="bg-white border rounded p-4 grid grid-cols-2 gap-3">
        <input className="border p-2" placeholder="Name" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} />
        <input className="border p-2" placeholder="Price" value={form.price} onChange={e=>setForm({...form, price:e.target.value})} />
        <select className="border p-2" value={form.category} onChange={e=>setForm({...form, category:e.target.value})}>
          <option value="">Select category</option>
          {categories.map(c => (
            <option key={c._id} value={c.name}>{c.name}</option>
          ))}
        </select>
        <input className="border p-2" placeholder="Stock" value={form.stock} onChange={e=>setForm({...form, stock:e.target.value})} />
        <input className="border p-2" placeholder="GST %" value={form.gst} onChange={e=>setForm({...form, gst:e.target.value})} />
        <div className="col-span-2 flex items-center gap-2">
          <input className="border p-2 flex-1" placeholder="Image URLs (comma separated)" value={form.images} onChange={e=>setForm({...form, images:e.target.value})} />
          <ImageUpload onUploaded={(url)=> setForm(f => ({ ...f, images: (f.images? f.images+', ':'') + url }))} />
        </div>
        <textarea className="border p-2 col-span-2" placeholder="Description" value={form.description} onChange={e=>setForm({...form, description:e.target.value})} />
        <button className="bg-blue-600 text-white py-2 rounded col-span-2">Add Product</button>
      </form>
    </div>

    {editing && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
        <form onSubmit={saveEdit} className="bg-white rounded shadow p-6 w-[600px] grid grid-cols-2 gap-3">
          <div className="col-span-2 text-lg font-semibold mb-2">Edit Product</div>
          <input className="border p-2" placeholder="Name" value={editing.name} onChange={e=>setEditing({...editing, name:e.target.value})} />
          <input className="border p-2" placeholder="Price" value={editing.price} onChange={e=>setEditing({...editing, price:e.target.value})} />
          <select className="border p-2" value={editing.category||''} onChange={e=>setEditing({...editing, category:e.target.value})}>
            <option value="">Select category</option>
            {categories.map(c => (
              <option key={c._id} value={c.name}>{c.name}</option>
            ))}
          </select>
          <input className="border p-2" placeholder="Stock" value={editing.stock} onChange={e=>setEditing({...editing, stock:e.target.value})} />
          <input className="border p-2" placeholder="GST %" value={editing.gst} onChange={e=>setEditing({...editing, gst:e.target.value})} />
          <div className="col-span-2 flex items-center gap-2">
            <input className="border p-2 flex-1" placeholder="Images (comma separated)" value={editing.images} onChange={e=>setEditing({...editing, images:e.target.value})} />
            <ImageUpload onUploaded={(url)=> setEditing(ed => ({ ...ed, images: (ed.images? ed.images+', ':'') + url }))} />
          </div>
          <textarea className="border p-2 col-span-2" placeholder="Description" value={editing.description||''} onChange={e=>setEditing({...editing, description:e.target.value})} />
          <div className="col-span-2 flex justify-end gap-2 mt-2">
            <button type="button" onClick={()=>setEditing(null)} className="px-3 py-1 border rounded">Cancel</button>
            <button className="px-3 py-1 bg-blue-600 text-white rounded">Save</button>
          </div>
        </form>
      </div>
    )}
    <ConfirmModal open={!!toDelete} title="Delete Product" message={`Delete ${toDelete?.name}?`} onCancel={()=>setToDelete(null)} onConfirm={confirmDelete} />
  </>
  )
}

