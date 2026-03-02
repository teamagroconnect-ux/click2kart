import { useState } from 'react'

export default function VariantQuickAdd({ onAdd }) {
  const [v, setV] = useState({ color:'', ram:'', storage:'', capacity:'', price:'', mrp:'', stock:'', sku:'', images:'' })
  const add = (e) => {
    e.preventDefault()
    const hasAny = ['color','ram','storage','capacity','price','mrp','stock','sku','images'].some(k => (v[k] || '').toString().trim())
    if (!hasAny) return
    onAdd?.(v)
    setV({ color:'', ram:'', storage:'', capacity:'', price:'', mrp:'', stock:'', sku:'', images:'' })
  }
  return (
    <form onSubmit={add} className="grid grid-cols-2 gap-2">
      <input className="bg-white border rounded-xl px-3 py-2 text-[11px] font-bold" placeholder="Color" value={v.color} onChange={e=>setV({...v,color:e.target.value})}/>
      <input className="bg-white border rounded-xl px-3 py-2 text-[11px] font-bold" placeholder="RAM" value={v.ram} onChange={e=>setV({...v,ram:e.target.value})}/>
      <input className="bg-white border rounded-xl px-3 py-2 text-[11px] font-bold" placeholder="Storage" value={v.storage} onChange={e=>setV({...v,storage:e.target.value})}/>
      <input className="bg-white border rounded-xl px-3 py-2 text-[11px] font-bold" placeholder="Capacity" value={v.capacity} onChange={e=>setV({...v,capacity:e.target.value})}/>
      <input className="bg-white border rounded-xl px-3 py-2 text-[11px] font-bold" placeholder="Price (₹)" value={v.price} onChange={e=>setV({...v,price:e.target.value})}/>
      <input className="bg-white border rounded-xl px-3 py-2 text-[11px] font-bold" placeholder="MRP (₹)" value={v.mrp} onChange={e=>setV({...v,mrp:e.target.value})}/>
      <input className="bg-white border rounded-xl px-3 py-2 text-[11px] font-bold" placeholder="Stock" value={v.stock} onChange={e=>setV({...v,stock:e.target.value})}/>
      <input className="bg-white border rounded-xl px-3 py-2 text-[11px] font-bold" placeholder="SKU" value={v.sku} onChange={e=>setV({...v,sku:e.target.value})}/>
      <input className="bg-white border rounded-xl px-3 py-2 text-[11px] font-bold col-span-2" placeholder="Images (comma URLs)" value={v.images} onChange={e=>setV({...v,images:e.target.value})}/>
      <div className="col-span-2 flex justify-end">
        <button className="px-3 py-2 rounded-xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest">Add Variant</button>
      </div>
    </form>
  )
}
