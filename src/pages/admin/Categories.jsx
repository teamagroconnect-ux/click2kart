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
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Product Categories</h1>
          <p className="text-sm text-gray-500 font-medium">Organize your products into logical groups for better browsing.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-6">
            <h3 className="text-sm font-black uppercase tracking-widest text-gray-400">Add New Category</h3>
            <form onSubmit={create} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Category Name</label>
                <input className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Summer Collection" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} required />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Description</label>
                <textarea className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none min-h-[100px]" placeholder="Briefly describe this category..." value={form.description} onChange={e=>setForm({...form, description:e.target.value})} />
              </div>
              <button className="w-full bg-gray-900 text-white py-4 rounded-2xl text-sm font-black shadow-lg hover:bg-gray-800 transition-all transform hover:-translate-y-0.5 active:scale-95 uppercase tracking-widest">Create Category</button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Active Categories</h3>
          <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
            <div className="divide-y divide-gray-50">
              {items.map(c => (
                <div key={c._id} className="p-6 flex justify-between items-center hover:bg-gray-50/50 transition-colors">
                  <div className="space-y-1">
                    <div className="font-bold text-gray-900 capitalize text-lg tracking-tight">{c.name}</div>
                    <div className="text-sm text-gray-500 font-medium">{c.description || 'No description provided.'}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest border ${c.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                      {c.isActive ? 'ACTIVE' : 'DISABLED'}
                    </div>
                    <button 
                      onClick={()=>toggle(c)} 
                      className={`p-2 rounded-xl transition-all ${c.isActive ? 'text-red-500 hover:bg-red-50' : 'text-emerald-500 hover:bg-emerald-50'}`}
                      title={c.isActive ? 'Disable Category' : 'Enable Category'}
                    >
                      {c.isActive ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                      )}
                    </button>
                  </div>
                </div>
              ))}
              {items.length === 0 && (
                <div className="p-12 text-center text-gray-400 italic font-medium">No categories found. Start by creating one.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
