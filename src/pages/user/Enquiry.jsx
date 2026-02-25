import { useLocation, useNavigate, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import api from '../../lib/api'
import { useCart } from '../../lib/CartContext'

export default function Enquiry(){
  const nav = useNavigate()
  const loc = useLocation()
  const { cart, clearCart, cartTotal } = useCart()
  
  // Use cart items if available, otherwise fallback to single product from state
  const initialItems = cart.length > 0 
    ? cart.map(item => ({ productId: item._id, quantity: item.quantity, name: item.name, price: item.price, image: item.images?.[0]?.url }))
    : (loc.state?.productId ? [{ productId: loc.state.productId, quantity: 1, name: loc.state.name }] : [])

  const [items, setItems] = useState(initialItems)
  const [customer, setCustomer] = useState({ 
    name: '', 
    phone: localStorage.getItem('userPhone') || '', 
    email: '' 
  })

  useEffect(() => {
    if (cart.length > 0) {
      setItems(cart.map(item => ({ productId: item._id, quantity: item.quantity, name: item.name, price: item.price, image: item.images?.[0]?.url })))
    }
  }, [cart])

  const submit = async (e)=>{
    e.preventDefault()
    try {
      await api.post('/api/orders', { customer, items })
      clearCart()
      nav('/orders')
    } catch (err) {
      alert('Failed to place order. Please try again.')
    }
  }

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto p-10 text-center space-y-4">
        <h2 className="text-2xl font-bold">Your cart is empty</h2>
        <p className="text-gray-600">Add some products to your cart before placing an order.</p>
        <Link to="/products" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md">Browse Products</Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-10">
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Order Summary</h2>
        <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 space-y-4">
            {items.map((item, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-50 rounded border overflow-hidden flex-shrink-0 flex items-center justify-center">
                  {item.image ? (
                    <img src={item.image} alt="" className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-[8px] text-gray-400">No img</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold truncate">{item.name}</div>
                  <div className="text-xs text-gray-500">Qty: {item.quantity}</div>
                </div>
                <div className="text-sm font-bold">₹{item.price * item.quantity}</div>
              </div>
            ))}
          </div>
          <div className="bg-gray-50 p-4 border-t flex justify-between items-center">
            <span className="font-bold">Total Amount</span>
            <span className="text-xl font-bold text-blue-600">₹{cartTotal}</span>
          </div>
        </div>
      </div>

      <form onSubmit={submit} className="bg-white border rounded-xl p-8 space-y-4 shadow-sm h-fit">
        <div className="text-2xl font-bold mb-4">Customer Details</div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input className="border p-3 w-full rounded-md text-base" placeholder="Enter your name" value={customer.name} onChange={e=>setCustomer({...customer, name:e.target.value})} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input className="border p-3 w-full rounded-md text-base" placeholder="Enter phone number" value={customer.phone} onChange={e=>setCustomer({...customer, phone:e.target.value})} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address (Optional)</label>
            <input className="border p-3 w-full rounded-md text-base" placeholder="Enter email address" value={customer.email} onChange={e=>setCustomer({...customer, email:e.target.value})} />
          </div>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-lg w-full text-lg font-bold transition-colors mt-6">
          Confirm Order
        </button>
      </form>
    </div>
  )
}

