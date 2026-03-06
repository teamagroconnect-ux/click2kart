import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart, getStockStatus } from '../../lib/CartContext'
import api from '../../lib/api'

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, cartTotal, addToCart } = useCart()
  const navigate = useNavigate()
  const [suggestions, setSuggestions] = useState([])
  const minAmount = Number(import.meta.env.VITE_MIN_ORDER_AMOUNT || 5000)
  const getBulkTiers = (item) => {
    if (Array.isArray(item.bulkTiers) && item.bulkTiers.length) return item.bulkTiers.slice().sort((a,b) => a.quantity - b.quantity)
    if (item.bulkDiscountQuantity > 0) return [{ quantity: item.bulkDiscountQuantity, priceReduction: item.bulkDiscountPriceReduction || 0 }]
    return []
  }
  const getNextTier = (qty, tiers) => tiers.find(t => qty < t.quantity) || null
  const unitPrice = (it) => {
    let p = Number(it.price || 0)
    const qty = Math.max(1, Number(it.quantity || 1))
    const tiers = getBulkTiers(it)
    if (tiers.length) {
      const applicable = tiers.filter(t => qty >= Number(t.quantity || 0)).pop()
      if (applicable) p = Math.max(0, p - Number(applicable.priceReduction || 0))
    }
    return p
  }
  const lineTotal = (it) => unitPrice(it) * Math.max(1, Number(it.quantity || 1))
  const mrpTotal = cart.reduce((sum, it) => sum + Number(it.mrp || it.price || 0) * Math.max(1, Number(it.quantity || 1)), 0)
  const effTotal = cart.reduce((sum, it) => sum + lineTotal(it), 0)
  const bulkDiscount = Math.max(0, mrpTotal - effTotal)
  const shipping = 0
  const gst = 0
  const totalPayable = effTotal + shipping + gst
  const etaText = (() => {
    const now = new Date()
    const eta = new Date(now.getTime()); eta.setDate(eta.getDate() + 4)
    return eta.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
  })()

  useEffect(() => {
    const first = cart[0];
    if (!first) { setSuggestions([]); return }
    const pid = first.productId || first._id;
    if (!pid) return;
    api.get(`/api/recommendations/frequently-bought/${pid}`).then(({ data }) => setSuggestions(data || [])).catch(() => setSuggestions([]))
  }, [cart])

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-4 md:p-10 text-center space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Your Cart is Empty</h1>
        <p className="text-gray-600">Looks like you haven't added anything to your cart yet.</p>
        <Link
          to="/products"
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          Browse Products
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-10 relative">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <div key={(item.productId || item._id)} className="flex items-center gap-4 bg-white p-4 rounded-xl border shadow-sm">
              <div className="w-20 h-20 bg-gray-50 rounded-lg border flex-shrink-0 overflow-hidden flex items-center justify-center">
                {(item.image || item.images?.[0]?.url) ? (
                  <img src={(item.image || item.images?.[0]?.url)} alt={item.name} className="w-full h-full object-contain" />
                ) : (
                  <span className="text-xs text-gray-400">No image</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-gray-900 truncate">{item.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-sm text-gray-500">Unit ₹{unitPrice(item).toLocaleString()}</p>
                  {(() => {
                    const status = getStockStatus(item.stock)
                    if (item.stock > 20) return null
                    return (
                      <span className={`text-[9px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded ${status.bg} ${status.color} border ${status.border}`}>
                        {status.text}
                      </span>
                    )
                  })()}
                </div>
                <div className="text-xs text-gray-500">Delivery by {etaText} • Free Delivery</div>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center border rounded-lg overflow-hidden">
                    <button
                      onClick={() => updateQuantity((item.productId || item._id), item.quantity - 1)}
                      disabled={item.quantity <= Math.max(1, Number(item.minOrderQty || 0))}
                      className="px-3 py-1 bg-gray-50 hover:bg-gray-100 text-gray-600 disabled:opacity-40"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 text-sm font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity((item.productId || item._id), item.quantity + 1)}
                      className="px-3 py-1 bg-gray-50 hover:bg-gray-100 text-gray-600"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart((item.productId || item._id))}
                    className="text-sm text-red-600 hover:text-red-500 font-medium"
                  >
                    Remove
                  </button>
                  <button
                    onClick={() => { try { const saved = JSON.parse(localStorage.getItem('saved') || '[]'); localStorage.setItem('saved', JSON.stringify([...saved, item])); removeFromCart((item.productId || item._id)) } catch {} }}
                    className="text-sm text-gray-600 hover:text-gray-900 font-medium"
                  >
                    Save for later
                  </button>
                </div>
              {(() => {
                const tiers = getBulkTiers(item)
                if (!tiers.length) return null
                const next = getNextTier(item.quantity, tiers)
                const maxQ = Math.max(item.quantity, tiers[tiers.length - 1].quantity)
                const pct = Math.min(100, Math.round((item.quantity / maxQ) * 100))
                return (
                  <div className="mt-3 space-y-2 rounded-xl border border-emerald-100 bg-emerald-50 p-3">
                    <div className="w-full h-2 rounded-full bg-white overflow-hidden">
                      <div className="h-2 bg-emerald-500" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-emerald-700">
                      {next ? (() => {
                        const delta = next.quantity - item.quantity
                        const perUnitOff = Number(next.priceReduction || 0)
                        const effectiveUnit = Math.max(0, Number(item.price || 0) - perUnitOff)
                        const estSave = perUnitOff * (item.quantity + delta)
                        return (
                          <>
                            <div>
                              Add {delta} more to get ₹{effectiveUnit.toLocaleString()}/unit • save approx ₹{estSave.toLocaleString()}
                            </div>
                            <button
                              onClick={() => updateQuantity((item.productId || item._id), next.quantity)}
                              className="ml-3 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-[10px]"
                            >
                              Add {delta} More
                            </button>
                          </>
                        )
                      })() : <div>Max bulk savings applied</div>}
                    </div>
                  </div>
                )
              })()}
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900">₹{lineTotal(item).toLocaleString()}</p>
                {item.bulkDiscountQuantity > 0 && item.quantity < item.bulkDiscountQuantity && (
                  <div className="mt-1 text-[10px] text-emerald-700 font-black uppercase tracking-widest">
                    Add {item.bulkDiscountQuantity - item.quantity} more to unlock bulk savings
                  </div>
                )}
              </div>
            </div>
          ))}
          {suggestions.length > 0 && (
            <div className="mt-6">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-3">You may also need</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3">
                {suggestions.map((p) => (
                  <div key={p._id || p.id} className="bg-white border border-gray-100 rounded-xl p-3 flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-gray-50 border border-gray-100 overflow-hidden flex items-center justify-center flex-shrink-0">
                      {p.images && p.images[0]?.url
                        ? <img src={p.images[0].url} alt={p.name} className="h-full w-full object-contain" />
                        : <span className="text-[10px] text-gray-400">📦</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-gray-900 truncate">{p.name}</div>
                      <div className="text-[11px] text-gray-500">{p.price != null ? `₹${Number(p.price).toLocaleString()}` : 'Login to view'}</div>
                    </div>
                    <button
                      onClick={() => addToCart(p)}
                      className="px-3 py-1.5 rounded-lg bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest"
                    >
                      Add
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-xl border shadow-sm h-fit space-y-6">
          <h2 className="text-xl font-bold text-gray-900">Order Summary</h2>
          <div className="space-y-2">
            <div className="flex justify-between text-gray-600"><span>MRP Total</span><span className="font-bold">₹{mrpTotal.toLocaleString()}</span></div>
            <div className="flex justify-between text-emerald-700"><span>Bulk Discount</span><span className="font-bold">−₹{bulkDiscount.toLocaleString()}</span></div>
            <div className="flex justify-between text-gray-600"><span>Shipping</span><span className="font-bold">{shipping === 0 ? 'FREE' : `₹${shipping}`}</span></div>
            <div className="flex justify-between text-gray-600"><span>GST</span><span className="font-bold">₹{gst.toLocaleString()}</span></div>
            <div className="border-t pt-2 flex justify-between text-xl font-bold text-gray-900"><span>Total</span><span>₹{totalPayable.toLocaleString()}</span></div>
          </div>
          {bulkDiscount > 0 && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs font-bold px-3 py-2">
              You saved ₹{bulkDiscount.toLocaleString()} on this order
            </div>
          )}
          <button
            onClick={() => navigate('/order')}
            disabled={totalPayable < minAmount}
            className={`w-full py-4 rounded-xl text-lg font-bold shadow-lg transition-colors ${totalPayable < minAmount ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
          >
            {totalPayable < minAmount ? `Minimum order ₹${minAmount.toLocaleString()}` : 'Checkout'}
          </button>
          <p className="text-xs text-center text-gray-500">
            Secure checkout powered by Click2Kart
          </p>
        </div>
      </div>
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40">
          <div className="max-w-6xl mx-auto px-4 md:px-10 pb-4">
            <div className="bg-white/95 backdrop-blur rounded-2xl border border-gray-200 shadow-2xl px-4 py-3 flex items-center justify-between">
              <div className="text-lg font-black text-gray-900">₹{totalPayable.toLocaleString()}</div>
              <button
                onClick={() => navigate('/order')}
                className="px-6 py-3 rounded-xl bg-gray-900 text-white text-xs font-black uppercase tracking-widest hover:bg-black active:scale-95"
              >
                Place Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
