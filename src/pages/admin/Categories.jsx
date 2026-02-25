import { useEffect, useState } from 'react'
import api from '../../lib/api'

export default function Categories(){
  const [items, setItems] = useState([])
  const [form, setForm] = useState({ name:'', description:'' })
  const load = async () => { const {data} = await api.get('/api/categories'); setItems(data) }
  useEffect(()=>{ load() }, [])
  const create = async (e) => { e.preventDefault(); await api.post('/api/categories', form); setForm({ name:'', description:'' }); load() }
  const toggle = async (c) => { await api.put(`/api/categories/${c._id}`, { isActive: !c.isActive }); load() }
  return (
    <div className="space-y-6">
      <form onSubmit={create} className="bg-white border rounded p-4 grid grid-cols-3 gap-3">
        <input className="border p-2" placeholder="Name" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} />
        <input className="border p-2" placeholder="Description" value={form.description} onChange={e=>setForm({...form, description:e.target.value})} />
        <button className="bg-blue-600 text-white py-2 rounded">Add</button>
      </form>
      <div className="bg-white border rounded divide-y">
        {items.map(c => (
          <div key={c._id} className="p-3 flex justify-between items-center">
            <div><div className="font-medium capitalize">{c.name}</div><div className="text-sm text-gray-500">{c.description}</div></div>
            <button onClick={()=>toggle(c)} className={`px-3 py-1 rounded ${c.isActive? 'bg-red-600':'bg-green-600'} text-white`}>{c.isActive? 'Disable':'Enable'}</button>
          </div>
        ))}
      </div>
    </div>
  )
}
