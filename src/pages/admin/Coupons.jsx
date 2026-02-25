import { useEffect, useState } from 'react'
import api from '../../lib/api'

export default function Coupons(){
  const [items, setItems] = useState([])
  const [form, setForm] = useState({
    code:'', type:'PERCENT', value:'', minAmount:'', expiryDate:'', usageLimit:'',
    partnerId:'', partnerCommissionPercent:'', maxTotalSales:'', isActive:true
  })
  const [partners, setPartners] = useState([])
  const [newPartner, setNewPartner] = useState({ name:'', email:'', phone:'' })
  const load = async()=>{ const {data}=await api.get('/api/coupons'); setItems(data) }
  const loadPartners = async()=>{ const {data}=await api.get('/api/partner-accounts'); setPartners(data) }
  useEffect(()=>{ load(); loadPartners() }, [])
  const create = async (e)=>{ e.preventDefault(); await api.post('/api/coupons', {
    ...form,
    value: Number(form.value),
    minAmount: form.minAmount? Number(form.minAmount): undefined,
    usageLimit: form.usageLimit? Number(form.usageLimit): undefined,
    partnerCommissionPercent: form.partnerCommissionPercent ? Number(form.partnerCommissionPercent) : undefined,
    maxTotalSales: form.maxTotalSales ? Number(form.maxTotalSales) : undefined
  }); setForm({
    code:'', type:'PERCENT', value:'', minAmount:'', expiryDate:'', usageLimit:'',
    partnerId:'', partnerCommissionPercent:'', maxTotalSales:'', isActive:true
  }); load() }
  const disable = async (c)=>{ await api.delete(`/api/coupons/${c._id}`); load() }
  const createPartner = async (e)=> {
    e.preventDefault()
    if (!newPartner.name) return
    const { data } = await api.post('/api/partner-accounts', newPartner)
    setNewPartner({ name:'', email:'', phone:'' })
    setPartners([...partners, data])
  }
  return (
    <div className="space-y-6">
      <form onSubmit={create} className="bg-white border rounded p-4 grid grid-cols-6 gap-3">
        <input className="border p-2" placeholder="CODE" value={form.code} onChange={e=>setForm({...form, code:e.target.value})} />
        <select className="border p-2" value={form.type} onChange={e=>setForm({...form, type:e.target.value})}><option value="PERCENT">PERCENT</option><option value="FLAT">FLAT</option></select>
        <input className="border p-2" placeholder="Value" value={form.value} onChange={e=>setForm({...form, value:e.target.value})} />
        <input className="border p-2" placeholder="Min Amount" value={form.minAmount} onChange={e=>setForm({...form, minAmount:e.target.value})} />
        <input className="border p-2" placeholder="Expiry Date" type="date" value={form.expiryDate} onChange={e=>setForm({...form, expiryDate:e.target.value})} />
        <input className="border p-2" placeholder="Usage Limit (number of uses)" value={form.usageLimit} onChange={e=>setForm({...form, usageLimit:e.target.value})} />
        <select className="border p-2 col-span-3" value={form.partnerId} onChange={e=>setForm({...form, partnerId:e.target.value})}>
          <option value="">Select partner (optional)</option>
          {partners.map(p => <option key={p._id} value={p._id}>{p.name} {p.email? `(${p.email})`:''}</option>)}
        </select>
        <input className="border p-2 col-span-3" placeholder="Partner commission % (optional)" value={form.partnerCommissionPercent} onChange={e=>setForm({...form, partnerCommissionPercent:e.target.value})} />
        <input className="border p-2 col-span-3" placeholder="Max total transaction amount (optional)" value={form.maxTotalSales} onChange={e=>setForm({...form, maxTotalSales:e.target.value})} />
        <label className="col-span-3 flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.isActive} onChange={e=>setForm({...form, isActive:e.target.checked})} />
          Active
        </label>
        <button className="bg-blue-600 text-white py-2 rounded col-span-6">Create</button>
      </form>
      <div className="bg-white border rounded p-4 space-y-3">
        <div className="font-semibold mb-1 text-sm">Add partner</div>
        <form onSubmit={createPartner} className="grid grid-cols-4 gap-3 items-center">
          <input className="border p-2 col-span-1" placeholder="Name" value={newPartner.name} onChange={e=>setNewPartner({...newPartner, name:e.target.value})} />
          <input className="border p-2 col-span-1" placeholder="Email" value={newPartner.email} onChange={e=>setNewPartner({...newPartner, email:e.target.value})} />
          <input className="border p-2 col-span-1" placeholder="Phone" value={newPartner.phone} onChange={e=>setNewPartner({...newPartner, phone:e.target.value})} />
          <button className="bg-gray-800 text-white py-2 rounded col-span-1">Save</button>
        </form>
      </div>
      <div className="bg-white border rounded divide-y">
        {items.map(c => (
          <div key={c._id} className="p-3 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="font-semibold">{c.code}</div>
              <div className="text-sm">{c.type} {c.value}</div>
              <div className="text-sm text-gray-600">Min ₹{c.minAmount||0} • Exp {new Date(c.expiryDate).toLocaleDateString()}</div>
              {c.partnerName && <div className="text-sm text-blue-700">Partner: {c.partnerName} ({c.partnerCommissionPercent || 0}%)</div>}
              {c.maxTotalSales > 0 && <div className="text-xs text-gray-600">Max txn: ₹{c.maxTotalSales}</div>}
              {!c.isActive && <span className="text-xs text-red-600">DISABLED</span>}
            </div>
            <button onClick={()=>disable(c)} className="px-3 py-1 bg-red-600 text-white rounded">Disable</button>
          </div>
        ))}
        {items.length===0 && <div className="p-3 text-gray-500">No coupons</div>}
      </div>
    </div>
  )
}

