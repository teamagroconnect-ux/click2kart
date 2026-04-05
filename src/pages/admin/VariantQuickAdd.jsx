import { useState, useEffect } from 'react'

export default function VariantQuickAdd({ onAdd, productAttributes = [], productName = '', mainImages = [], existingVariants = [], price = '', weight = '' }) {
  const [v, setV] = useState({ 
    attributes: {}, 
    price: price || '', 
    mrp: '', 
    stock: '', 
    sku: '', 
    images: '',
    weight: weight || '',
    useProductImage: false
  })

  // Extract unique existing values for each attribute to provide suggestions
  const getSuggestions = (attrKey) => {
    const values = new Set();
    const variantsArr = Array.isArray(existingVariants) ? existingVariants : []
    variantsArr.forEach(variant => {
      const val = variant.attributes?.[attrKey.toLowerCase().trim()];
      if (val) values.add(val);
    });
    return Array.from(values);
  };

  // Initialize attributes based on product attributes
  useEffect(() => {
    const attrs = {}
    productAttributes.forEach(attr => {
      const [name] = attr.split(':');
      const key = name.toLowerCase().trim();
      if (key) attrs[key] = v.attributes[key] || '';
    })
    // Default price and weight to main product values if not set
    setV(prev => ({ 
      ...prev, 
      attributes: attrs,
      price: prev.price || price || '',
      weight: prev.weight || weight || ''
    }))
  }, [productAttributes, price, weight])

  // Auto-generate SKU when attributes or productName changes
  useEffect(() => {
    const values = productAttributes
      .map(attr => {
        const [name] = attr.split(':');
        return (v.attributes[name.toLowerCase().trim()] || '').trim()
      })
      .filter(Boolean)
    
    if (productName && values.length > 0) {
      // Create a short code from product name (first letter of each word or first 3 letters)
      const nameParts = productName.split(' ').filter(Boolean)
      let nameCode = ''
      if (nameParts.length >= 2) {
        nameCode = nameParts.map(p => p[0]).join('').substring(0, 4)
      } else {
        nameCode = productName.substring(0, 3)
      }

      const cleanValues = values.map(val => 
        val.toLowerCase()
          .replace(/[^a-z0-9]/g, '')
          .trim()
      ).join('-')

      const generatedSku = `${nameCode.toUpperCase()}-${cleanValues.toUpperCase()}`
      setV(prev => ({ ...prev, sku: generatedSku }))
    }
  }, [v.attributes, productName, productAttributes])

  const add = (e) => {
    e.preventDefault()
    
    // Validate attributes
    const missing = productAttributes.filter(a => !v.attributes[a.toLowerCase().trim()]);
    if (missing.length > 0) {
      alert(`Please fill all attributes: ${missing.join(', ')}`);
      return;
    }

    if (!v.price || !v.stock) {
      alert('Price and Stock are required');
      return;
    }
    
    let images = v.images.split(',').map(s=>s.trim()).filter(Boolean);
    const imagesArr = Array.isArray(mainImages) ? mainImages : []
    if (v.useProductImage && images.length === 0) {
      images = imagesArr.map(img => typeof img === 'string' ? img : img.url).filter(Boolean);
    }

    onAdd?.({
      ...v,
      attributes: v.attributes,
      price: v.price,
      mrp: v.mrp,
      stock: v.stock,
      sku: v.sku,
      images: images.join(', ')
    })

    // Reset while keeping attribute keys
    const resetAttrs = {}
    productAttributes.forEach(attr => {
      resetAttrs[attr.toLowerCase().trim()] = ''
    })
    setV({ 
      attributes: resetAttrs, 
      price: '', 
      mrp: '', 
      stock: '', 
      sku: '', 
      images: '',
      useProductImage: false
    })
  }

  const handleAttrChange = (key, val) => {
    setV(prev => ({
      ...prev,
      attributes: {
        ...prev.attributes,
        [key.toLowerCase().trim()]: val
      }
    }))
  }

  return (
    <div className="space-y-4 bg-white p-5 rounded-3xl border border-blue-50 shadow-sm">
      <div className="flex items-center justify-between">
        <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">Quick Add Variant</h5>
        {v.sku && <span className="text-[8px] font-black bg-blue-50 text-blue-600 px-2 py-0.5 rounded uppercase">Auto SKU: {v.sku}</span>}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {productAttributes.map(attr => {
          const [name, valuesStr] = attr.split(':');
          const predefinedValues = valuesStr ? valuesStr.split(',').filter(Boolean) : [];
          const attrKey = name.toLowerCase().trim();
          const suggestions = getSuggestions(name);
          const currentVal = v.attributes[attrKey] || '';

          return (
            <div key={name} className="space-y-2">
              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">{name}</label>
              
              {predefinedValues.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {predefinedValues.map(pv => (
                    <button
                      key={pv}
                      type="button"
                      onClick={() => handleAttrChange(name, pv)}
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase transition-all border-2 ${
                        currentVal.toLowerCase() === pv.toLowerCase()
                          ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                          : 'bg-white border-gray-100 text-gray-600 hover:border-blue-200'
                      }`}
                    >
                      {pv}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <input 
                  className="flex-1 bg-gray-50 border-2 border-transparent focus:border-blue-100 rounded-xl px-3 py-2.5 text-[11px] font-bold outline-none transition-all" 
                  placeholder={`Type or select ${name}...`}
                  value={currentVal} 
                  onChange={e => handleAttrChange(name, e.target.value)}
                  list={`list-${name}`}
                  required
                />
                <datalist id={`list-${name}`}>
                  {[...new Set([...predefinedValues, ...suggestions])].map(s => <option key={s} value={s} />)}
                </datalist>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-3 gap-3 pt-3 border-t border-gray-50">
        <div className="space-y-1">
          <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Price</label>
          <input className="w-full bg-gray-50 border-none rounded-xl px-3 py-2 text-[11px] font-bold outline-none focus:ring-2 focus:ring-blue-500" placeholder="₹" value={v.price} onChange={e=>setV({...v, price: e.target.value})} />
        </div>
        <div className="space-y-1">
          <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Stock</label>
          <input className="w-full bg-gray-50 border-none rounded-xl px-3 py-2 text-[11px] font-bold outline-none focus:ring-2 focus:ring-blue-500" placeholder="0" value={v.stock} onChange={e=>setV({...v, stock: e.target.value})} />
        </div>
        <div className="space-y-1">
          <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Weight(g)</label>
          <input className="w-full bg-gray-50 border-none rounded-xl px-3 py-2 text-[11px] font-bold outline-none focus:ring-2 focus:ring-blue-500" placeholder="Grams" value={v.weight || ''} onChange={e=>setV({...v, weight: e.target.value})} />
        </div>
      </div>

      <div className="space-y-3">
        <div className="space-y-1">
          <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Variant Images (Optional)</label>
          <input className="w-full bg-gray-50 border-none rounded-xl px-3 py-2 text-[11px] font-bold outline-none focus:ring-2 focus:ring-blue-500" placeholder="Comma separated URLs..." value={v.images} onChange={e=>setV({...v, images: e.target.value, useProductImage: false})} />
        </div>
        
        <label className="flex items-center gap-2 cursor-pointer group w-fit">
          <input 
            type="checkbox" 
            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
            checked={v.useProductImage} 
            onChange={e => setV({ ...v, useProductImage: e.target.checked })} 
          />
          <span className="text-[10px] font-black text-gray-500 group-hover:text-blue-600 transition-colors uppercase tracking-tight">Use Main Product Images</span>
        </label>
      </div>

      <button 
        type="button"
        onClick={add} 
        className="w-full py-3.5 rounded-2xl bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-black transition-all active:scale-95"
      >
        Add Variant to List
      </button>
    </div>
  )
}
