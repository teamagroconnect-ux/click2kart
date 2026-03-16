import { useState, useEffect } from 'react'

export default function VariantQuickAdd({ onAdd, productAttributes = [] }) {
  const [v, setV] = useState({ 
    attributes: {}, 
    price: '', 
    mrp: '', 
    stock: '', 
    sku: '', 
    images: '' 
  })

  // Initialize attributes based on product attributes
  useEffect(() => {
    const attrs = {}
    productAttributes.forEach(attr => {
      attrs[attr.toLowerCase()] = ''
    })
    setV(prev => ({ ...prev, attributes: attrs }))
  }, [productAttributes])

  const add = (e) => {
    e.preventDefault()
    const hasAnyAttr = Object.values(v.attributes).some(val => val.trim() !== '')
    if (!hasAnyAttr && !v.price && !v.stock) return
    
    onAdd?.({
      ...v,
      attributes: v.attributes,
      price: v.price,
      mrp: v.mrp,
      stock: v.stock,
      sku: v.sku,
      images: v.images
    })

    // Reset while keeping attribute keys
    const resetAttrs = {}
    productAttributes.forEach(attr => {
      resetAttrs[attr.toLowerCase()] = ''
    })
    setV({ 
      attributes: resetAttrs, 
      price: '', 
      mrp: '', 
      stock: '', 
      sku: '', 
      images: '' 
    })
  }

  const handleAttrChange = (key, val) => {
    setV(prev => ({
      ...prev,
      attributes: {
        ...prev.attributes,
        [key.toLowerCase()]: val
      }
    }))
  }

  return (
    <div className="space-y-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
      <div className="grid grid-cols-2 gap-3">
        {productAttributes.map(attr => (
          <div key={attr} className="space-y-1">
            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">{attr}</label>
            <input 
              className="w-full bg-gray-50 border-none rounded-xl px-3 py-2 text-[11px] font-bold focus:ring-2 focus:ring-blue-500 outline-none" 
              placeholder={`e.g. ${attr === 'model' ? 'iPhone 15' : 'Black'}`}
              value={v.attributes[attr.toLowerCase()] || ''} 
              onChange={e => handleAttrChange(attr, e.target.value)}
            />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3 pt-2 border-t border-gray-50">
        <div className="space-y-1">
          <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Price</label>
          <input className="w-full bg-gray-50 border-none rounded-xl px-3 py-2 text-[11px] font-bold outline-none" placeholder="₹" value={v.price} onChange={e=>setV({...v, price: e.target.value})} />
        </div>
        <div className="space-y-1">
          <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Stock</label>
          <input className="w-full bg-gray-50 border-none rounded-xl px-3 py-2 text-[11px] font-bold outline-none" placeholder="0" value={v.stock} onChange={e=>setV({...v, stock: e.target.value})} />
        </div>
        <div className="space-y-1">
          <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">SKU</label>
          <input className="w-full bg-gray-50 border-none rounded-xl px-3 py-2 text-[11px] font-bold outline-none" placeholder="Code" value={v.sku} onChange={e=>setV({...v, sku: e.target.value})} />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Variant Images (Comma separated URLs)</label>
        <input className="w-full bg-gray-50 border-none rounded-xl px-3 py-2 text-[11px] font-bold outline-none" placeholder="https://..." value={v.images} onChange={e=>setV({...v, images: e.target.value})} />
      </div>

      <button 
        type="button"
        onClick={add} 
        className="w-full py-3 rounded-xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95"
      >
        Add Variant to List
      </button>
    </div>
  )
}
