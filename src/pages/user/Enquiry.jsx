import { useLocation, useNavigate, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import api from '../../lib/api'
import { useCart } from '../../lib/CartContext'
import { useToast } from '../../components/Toast'

export default function Enquiry(){
  const { notify } = useToast()
  const nav = useNavigate()
  const loc = useLocation()
  const { cart, clearCart, cartTotal } = useCart()
  
  const initialItems = cart.length > 0 
    ? cart.map(item => ({ productId: item._id, quantity: item.quantity, name: item.name, price: item.price, image: item.images?.[0]?.url }))
    : (loc.state?.productId ? [{ productId: loc.state.productId, quantity: 1, name: loc.state.name }] : [])

  const [items, setItems] = useState(initialItems)
  const [customer, setCustomer] = useState({ 
    name: '', 
    phone: localStorage.getItem('userPhone') || '', 
    email: '' 
  })
  const [paymentMethod, setPaymentMethod] = useState('RAZORPAY')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (cart.length > 0) {
      setItems(cart.map(item => ({ productId: item._id, quantity: item.quantity, name: item.name, price: item.price, image: item.images?.[0]?.url })))
    }
  }, [cart])

  const handleRazorpay = (orderData, razorpayOrderId) => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_placeholder",
      amount: Math.round(cartTotal * 100),
      currency: "INR",
      name: "Click2Kart",
      description: "B2B Order Payment",
      order_id: razorpayOrderId,
      handler: async function (response) {
        try {
          await api.post('/api/orders/verify-payment', {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            orderId: orderData._id
          });
          notify('Payment Successful!', 'success');
          clearCart();
          nav('/orders');
        } catch (err) {
          notify('Payment verification failed', 'error');
        }
      },
      prefill: {
        name: customer.name,
        email: customer.email,
        contact: customer.phone
      },
      theme: {
        color: "#2563eb"
      }
    };
    const rzp = new window.Razorpay(options);
    rzp.open();
  }

  const submit = async (e)=>{
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await api.post('/api/orders', { customer, items, paymentMethod })
      
      if (paymentMethod === 'RAZORPAY') {
        handleRazorpay(data.order, data.razorpayOrderId);
      } else {
        notify('Order requested! Pending admin approval for cash payment.', 'success')
        clearCart()
        nav('/orders')
      }
    } catch (err) {
      notify(err?.response?.data?.error || 'Failed to place order', 'error')
    } finally {
      setLoading(false)
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

        <div className="space-y-4 pt-4 border-t border-gray-100">
          <div className="text-sm font-black uppercase tracking-widest text-gray-400">Payment Method</div>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setPaymentMethod('RAZORPAY')}
              className={`p-4 rounded-2xl border-2 transition-all text-left flex flex-col gap-2 ${paymentMethod === 'RAZORPAY' ? 'border-blue-600 bg-blue-50' : 'border-gray-100 hover:border-gray-200'}`}
            >
              <span className="text-xl">💳</span>
              <span className="text-xs font-black uppercase tracking-widest">Razorpay</span>
              <span className="text-[10px] text-gray-500 font-medium leading-none">Automatic Billing</span>
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod('CASH')}
              className={`p-4 rounded-2xl border-2 transition-all text-left flex flex-col gap-2 ${paymentMethod === 'CASH' ? 'border-blue-600 bg-blue-50' : 'border-gray-100 hover:border-gray-200'}`}
            >
              <span className="text-xl">💵</span>
              <span className="text-xs font-black uppercase tracking-widest">Cash</span>
              <span className="text-[10px] text-gray-500 font-medium leading-none">Admin Approval</span>
            </button>
          </div>
        </div>

        <button 
          disabled={loading}
          className={`py-5 rounded-3xl w-full text-sm font-black uppercase tracking-widest transition-all mt-6 shadow-2xl ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-100 transform hover:-translate-y-1 active:scale-95'}`}
        >
          {loading ? 'Processing...' : paymentMethod === 'RAZORPAY' ? 'Pay & Confirm' : 'Request Cash Order'}
        </button>
      </form>
    </div>
  )
}

