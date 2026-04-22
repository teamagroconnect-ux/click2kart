import { useState, useMemo } from 'react'

export default function VariantMatrix({
  variants = [],
  product,
  authed,
  addToCart,
  notify,
  navigate,
  setRecItems,
  setRecOpen
}) {
  const [quantities, setQuantities] = useState({})
  const [loading, setLoading] = useState(false)

  const attrs = useMemo(() => {
    const allKeys = new Set()
    variants.forEach(v => {
      const a = v.attributes instanceof Map ? Object.fromEntries(v.attributes) : (v.attributes || {})
      Object.keys(a).forEach(k => allKeys.add(k))
    })
    return Array.from(allKeys)
  }, [variants])

  const attrValues = useMemo(() => {
    const result = {}
    attrs.forEach(attr => {
      const values = new Set()
      variants.forEach(v => {
        const a = v.attributes instanceof Map ? Object.fromEntries(v.attributes) : (v.attributes || {})
        if (a[attr]) values.add(a[attr])
      })
      result[attr] = Array.from(values)
    })
    return result
  }, [variants, attrs])

  const gridVariants = useMemo(() => {
    if (attrs.length === 0) return []
    if (attrs.length === 1) {
      return attrValues[attrs[0]].map(val => {
        const variant = variants.find(v => {
          const a = v.attributes instanceof Map ? Object.fromEntries(v.attributes) : (v.attributes || {})
          return a[attrs[0]] === val
        })
        return { attrKey: attrs[0], attrValue: val, variant }
      })
    }
    if (attrs.length === 2) {
      const [key1, key2] = attrs
      const result = []
      attrValues[key1].forEach(val1 => {
        attrValues[key2].forEach(val2 => {
          const variant = variants.find(v => {
            const a = v.attributes instanceof Map ? Object.fromEntries(v.attributes) : (v.attributes || {})
            return a[key1] === val1 && a[key2] === val2
          })
          result.push({ attrKey: key1, attrValue: val1, attrKey2: key2, attrValue2: val2, variant })
        })
      })
      return result
    }
    return variants.map(v => ({
      variant: v,
      attrKey: attrs[0],
      attrValue: Object.values(v.attributes instanceof Map ? Object.fromEntries(v.attributes) : (v.attributes || {}))[0]
    }))
  }, [variants, attrs, attrValues])

  const getPrice = (v) => {
    if (!v) return 0
    return Number(v.price ?? product.price) || 0
  }

  const getMrp = (v) => {
    if (!v) return 0
    return Number(v.mrp ?? product.mrp) || 0
  }

  const getStock = (v) => {
    if (!v) return 0
    return v.stock ?? 0
  }

  const handleQtyChange = (vId, val) => {
    const variant = variants.find(v => v._id === vId)
    const stock = getStock(variant)
    let qty = Number(val) || 0
    
    if (qty > stock) {
      qty = stock
      notify(`Only ${stock} units available for this variant`, 'warning')
    }
    if (qty < 0) qty = 0
    
    setQuantities(prev => ({ ...prev, [vId]: qty }))
  }

  const totalSelected = Object.values(quantities).reduce((s, v) => s + v, 0)
  const totalPrice = gridVariants.reduce((sum, item) => {
    const v = item.variant
    if (!v) return sum
    return sum + (getPrice(v) * (quantities[v._id] || 0))
  }, 0)

  const handleBulkAdd = async () => {
    if (!authed) { navigate('/login'); return }
    if (totalSelected === 0) { notify('Please select at least one quantity', 'error'); return }

    setLoading(true)
    try {
      const itemsToAdd = gridVariants
        .filter(item => item.variant && (quantities[item.variant._id] || 0) > 0)
        .map(item => ({
          productId: product._id,
          variantSku: item.variant.sku,
          quantity: quantities[item.variant._id],
          name: product.name,
          price: getPrice(item.variant),
          mrp: getMrp(item.variant),
          gst: product.gst || 0,
          attributes: item.variant.attributes instanceof Map
            ? Object.fromEntries(item.variant.attributes)
            : (item.variant.attributes || {})
        }))

      for (const item of itemsToAdd) {
        await addToCart(item)
      }

      if (itemsToAdd.length > 0 && setRecOpen) {
        try {
          const api = (await import('../lib/api')).default
          const { data } = await api.get(`/api/recommendations/frequently-bought/${product._id}`)
          const filtered = (data || []).filter(i => (i._id || i.id) !== product._id)
          if (setRecItems) setRecItems(filtered)
          if (filtered.length > 0 && setRecOpen) setRecOpen(true)
        } catch { }
      }

      notify(`Added ${totalSelected} items to cart!`, 'success')
      setQuantities({})
    } catch (err) {
      notify('Failed to add items', 'error')
    } finally {
      setLoading(false)
    }
  }

  if (variants.length === 0) return null

  const singleAttr = attrs.length === 1
  const dualAttr = attrs.length === 2

  return (
    <div style={{
      background: 'white',
      borderRadius: '20px',
      border: '1px solid rgba(124,58,237,0.1)',
      padding: '24px',
      marginTop: '20px'
    }}>
      <style>{`
        .vm-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 24px;
          letter-spacing: 0.05em;
          color: '#1e1b2e';
          margin-bottom: 20px;
        }
        .vm-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid #f0e8ff;
        }
        .vm-table th {
          background: #f9f7ff;
          color: #7c3aed;
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          padding: 10px 12px;
          text-align: center;
          border-bottom: 2px solid rgba(124,58,237,0.1);
        }
        .vm-table td {
          padding: 8px 10px;
          text-align: center;
          border-bottom: 1px solid #f5f3ff;
          vertical-align: middle;
        }
        .vm-table tr:last-child td { border-bottom: none; }
        .vm-table tr:hover td { background: #faf9ff; }
        .vm-attr-cell {
          font-size: 11px;
          font-weight: 700;
          color: #374151;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }
        .vm-price {
          font-size: 14px;
          font-weight: 800;
          color: #1e1b2e;
        }
        .vm-mrp {
          font-size: 10px;
          color: #9ca3af;
          text-decoration: line-through;
        }
        .vm-stock {
          font-size: 9px;
          font-weight: 800;
          padding: 2px 8px;
          border-radius: 6px;
          display: inline-block;
        }
        .vm-stock.in { background: rgba(5,150,105,0.08); color: #059669; }
        .vm-stock.low { background: rgba(245,158,11,0.08); color: #d97706; }
        .vm-stock.out { background: rgba(220,38,38,0.08); color: #dc2626; }
        .vm-qty-input {
          width: 60px;
          padding: 6px 8px;
          border: 1.5px solid #e5e7eb;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 700;
          text-align: center;
          outline: none;
          transition: border-color 0.2s;
        }
        .vm-qty-input:focus { border-color: #7c3aed; }
        .vm-footer {
          margin-top: 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
        }
        .vm-summary {
          display: flex;
          gap: 16px;
          align-items: center;
        }
        .vm-total-items {
          font-size: 12px;
          color: #6b7280;
          font-weight: 600;
        }
        .vm-total-items span {
          color: #7c3aed;
          font-weight: 800;
        }
        .vm-total-price {
          font-size: 18px;
          font-weight: 800;
          color: #1e1b2e;
        }
        .vm-add-btn {
          padding: 12px 28px;
          background: linear-gradient(135deg, #7c3aed, #6d28d9);
          color: white;
          border: none;
          border-radius: 14px;
          font-size: 12px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          cursor: pointer;
          box-shadow: 0 6px 20px rgba(124,58,237,0.25);
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .vm-add-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(124,58,237,0.35); }
        .vm-add-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
        @media (max-width: 640px) {
          .vm-table th:nth-child(3), .vm-table td:nth-child(3) { display: none; }
          .vm-qty-input { width: 50px; font-size: 12px; }
          .vm-footer { flex-direction: column; align-items: stretch; }
          .vm-add-btn { justify-content: center; }
        }
      `}</style>

      <div className="vm-title">Bulk Purchase Matrix</div>

      {singleAttr && (
        <table className="vm-table">
          <thead>
            <tr>
              <th>{attrs[0]}</th>
              <th>Price</th>
              <th>MRP</th>
              <th>Stock</th>
              <th>Qty</th>
            </tr>
          </thead>
          <tbody>
            {gridVariants.map((item, idx) => {
              const v = item.variant
              if (!v) return null
              const stock = getStock(v)
              const isOut = stock <= 0
              const isLow = stock > 0 && stock <= 5
              return (
                <tr key={idx}>
                  <td className="vm-attr-cell">{item.attrValue}</td>
                  <td className="vm-price">₹{getPrice(v)?.toLocaleString()}</td>
                  <td className="vm-mrp">₹{getMrp(v)?.toLocaleString()}</td>
                  <td>
                    <span className={`vm-stock ${isOut ? 'out' : isLow ? 'low' : 'in'}`}>
                      {isOut ? 'Out of Stock' : isLow ? `Only ${stock} left` : 'In Stock'}
                    </span>
                  </td>
                  <td>
                    <input
                      type="number"
                      className="vm-qty-input"
                      min={0}
                      max={stock}
                      value={quantities[v._id] || ''}
                      onChange={e => handleQtyChange(v._id, e.target.value)}
                      disabled={isOut || !authed}
                      placeholder="0"
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}

      {dualAttr && (
        <>
          <div style={{ overflowX: 'auto' }}>
            <table className="vm-table">
              <thead>
                <tr>
                  <th></th>
                  {attrValues[attrs[1]].map(val => (
                    <th key={val}>{val}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {attrValues[attrs[0]].map(val1 => (
                  <tr key={val1}>
                    <th style={{ background: '#f9f7ff', textAlign: 'left' }}>{val1}</th>
                    {attrValues[attrs[1]].map(val2 => {
                      const item = gridVariants.find(g =>
                        g.attrValue === val1 && g.attrValue2 === val2
                      )
                      const v = item?.variant
                      const stock = v ? getStock(v) : 0
                      const isOut = stock <= 0
                      const isLow = stock > 0 && stock <= 5
                      return (
                        <td key={`${val1}-${val2}`}>
                          {v ? (
                            <>
                              <div className="vm-price" style={{ fontSize: '12px' }}>₹{getPrice(v)?.toLocaleString()}</div>
                              <span className={`vm-stock ${isOut ? 'out' : isLow ? 'low' : 'in'}`} style={{ fontSize: '8px', marginTop: '2px' }}>
                                {isOut ? 'Out' : isLow ? `${stock} left` : 'OK'}
                              </span>
                              <input
                                type="number"
                                className="vm-qty-input"
                                style={{ marginTop: '4px', width: '50px' }}
                                min={0}
                                max={stock}
                                value={quantities[v._id] || ''}
                                onChange={e => handleQtyChange(v._id, e.target.value)}
                                disabled={isOut || !authed}
                                placeholder="0"
                              />
                            </>
                          ) : (
                            <span style={{ fontSize: '10px', color: '#d1d5db' }}>—</span>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ fontSize: '9px', color: '#9ca3af', marginTop: '8px', textAlign: 'center' }}>
            Row = {attrs[0]} · Column = {attrs[1]}
          </div>
        </>
      )}

      {!singleAttr && !dualAttr && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
          {gridVariants.map((item, idx) => {
            const v = item.variant
            if (!v) return null
            const stock = getStock(v)
            const isOut = stock <= 0
            return (
              <div key={idx} style={{
                background: '#faf9ff',
                borderRadius: '12px',
                padding: '12px',
                border: '1px solid rgba(124,58,237,0.08)'
              }}>
                <div style={{ fontSize: '10px', fontWeight: 700, color: '#6b7280', marginBottom: '4px' }}>
                  {item.attrValue}
                </div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#1e1b2e' }}>
                  ₹{getPrice(v)?.toLocaleString()}
                </div>
                <div style={{ fontSize: '10px', color: '#9ca3af', textDecoration: 'line-through' }}>
                  MRP ₹{getMrp(v)?.toLocaleString()}
                </div>
                <span className={`vm-stock ${isOut ? 'out' : 'in'}`} style={{ marginTop: '4px', display: 'inline-block' }}>
                  {isOut ? 'Out of Stock' : 'In Stock'}
                </span>
                <input
                  type="number"
                  className="vm-qty-input"
                  style={{ marginTop: '8px', width: '100%' }}
                  min={0}
                  max={stock}
                  value={quantities[v._id] || ''}
                  onChange={e => handleQtyChange(v._id, e.target.value)}
                  disabled={isOut || !authed}
                  placeholder="Enter qty"
                />
              </div>
            )
          })}
        </div>
      )}

      <div className="vm-footer">
        <div className="vm-summary">
          <div className="vm-total-items">
            Total: <span>{totalSelected}</span> units
          </div>
          {totalSelected > 0 && (
            <div className="vm-total-price">₹{totalPrice.toLocaleString()}</div>
          )}
        </div>
        <button
          className="vm-add-btn"
          disabled={totalSelected === 0 || loading || !authed}
          onClick={handleBulkAdd}
        >
          {loading ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
              <circle cx="12" cy="12" r="10" strokeOpacity="0.3" />
              <path d="M12 2a10 10 0 0 1 10 10" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M7 6h13l-1.2 7H9.2L7 6Z" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="10" cy="19" r="1.4" fill="currentColor" />
              <circle cx="17" cy="19" r="1.4" fill="currentColor" />
            </svg>
          )}
          {loading ? 'Adding...' : `Add ${totalSelected > 0 ? totalSelected : ''} to Cart`}
        </button>
      </div>
    </div>
  )
}
