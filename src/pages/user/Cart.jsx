import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart, getStockStatus } from '../../lib/CartContext'
import api from '../../lib/api'

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, cartTotal, addToCart } = useCart()
  const navigate = useNavigate()
  const [suggestions, setSuggestions] = useState([])

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
    <div className="max-w-6xl mx-auto p-4 md:p-10">
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
                  <p className="text-sm text-gray-500">₹{item.price.toLocaleString()}</p>
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
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center border rounded-lg overflow-hidden">
                    <button
                      onClick={() => updateQuantity((item.productId || item._id), item.quantity - 1)}
                      className="px-3 py-1 bg-gray-50 hover:bg-gray-100 text-gray-600"
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
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900">₹{item.price * item.quantity}</p>
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
          <div className="space-y-2 border-b pb-4">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>₹{cartTotal}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Shipping</span>
              <span className="text-emerald-600 font-medium">Free</span>
            </div>
          </div>
          <div className="flex justify-between text-xl font-bold text-gray-900">
            <span>Total</span>
            <span>₹{cartTotal}</span>
          </div>
          <button
            onClick={() => navigate('/order')}
            className="w-full bg-blue-600 text-white py-4 rounded-xl text-lg font-bold shadow-lg hover:bg-blue-700 transition-colors"
          >
            Checkout
          </button>
          <p className="text-xs text-center text-gray-500">
            Secure checkout powered by Click2Kart
          </p>
        </div>
      </div>
    </div>
  )
}
