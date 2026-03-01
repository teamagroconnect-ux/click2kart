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
  const [profile, setProfile] = useState({ name: '', phone: '', email: '' })
  const [paymentMethod, setPaymentMethod] = useState('RAZORPAY')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (cart.length > 0) {
      setItems(cart.map(item => ({ productId: item._id, quantity: item.quantity, name: item.name, price: item.price, image: item.images?.[0]?.url })))
    }
  }, [cart])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { 
      nav('/login')
      return
    }
    ;(async () => {
      try {
        const { data } = await api.get('/api/user/me')
        if (!data.isKycComplete) {
          notify('Complete your KYC to place orders', 'error')
          nav('/profile')
          return
        }
        setProfile({ name: data.name || '', phone: data.phone || '', email: data.email || '' })
      } catch {
        nav('/login')
      }
    })()
  }, [])

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
        name: profile.name,
        email: profile.email,
        contact: profile.phone
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
      const { data } = await api.post('/api/orders', { items, paymentMethod })
      
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
      <div className="max-w-xl mx-auto p-20 text-center space-y-8 animate-in fade-in zoom-in duration-700">
        <div className="h-24 w-24 bg-violet-50 rounded-[2rem] flex items-center justify-center text-4xl mx-auto shadow-inner">🛒</div>
        <div className="space-y-2">
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Your cart is empty</h2>
          <p className="text-gray-500 font-medium">Add some products to your cart before placing an order.</p>
        </div>
        <Link to="/products" className="inline-flex items-center px-10 py-4 bg-violet-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-violet-100 hover:bg-violet-500 transition-all active:scale-95">Browse Inventory</Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-10 grid grid-cols-1 lg:grid-cols-12 gap-12">
      <div className="lg:col-span-5 space-y-8">
        <div className="space-y-2">
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Order Summary</h2>
          <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">Review your wholesale selection</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-[3rem] overflow-hidden shadow-2xl">
          <div className="p-8 space-y-6 max-h-[500px] overflow-y-auto custom-scrollbar">
            {items.map((item, idx) => (
              <div key={idx} className="flex items-center gap-6 group">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center group-hover:scale-105 transition-transform">
                  {item.image ? (
                    <img src={item.image} alt="" className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-[10px] text-gray-400 font-black">BOX</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-base font-black text-gray-900 truncate tracking-tight">{item.name}</div>
                  <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Qty: {item.quantity} • Unit: ₹{item.price}</div>
                </div>
                <div className="text-lg font-black text-gray-900">₹{item.price * item.quantity}</div>
              </div>
            ))}
          </div>
          <div className="bg-violet-600 p-8 flex justify-between items-center text-white">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-200">Total Payable</span>
              <div className="text-3xl font-black tracking-tighter">₹{cartTotal.toLocaleString()}</div>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center text-xl">📦</div>
          </div>
        </div>
      </div>

      <form onSubmit={submit} className="lg:col-span-7 bg-white border border-gray-50 p-8 md:p-12 rounded-[3rem] shadow-2xl space-y-10 animate-in fade-in slide-in-from-right-8 duration-1000">
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <span className="h-10 w-10 rounded-2xl bg-violet-600 flex items-center justify-center text-xs font-black text-white shadow-xl shadow-violet-100 uppercase tracking-widest">01</span>
            <h3 className="text-lg font-black tracking-tight text-gray-900 uppercase">Account Details</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
              <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">Business Name</div>
              <div className="text-sm font-bold text-gray-900 mt-1">{profile.name || '-'}</div>
            </div>
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
              <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">Contact Phone</div>
              <div className="text-sm font-bold text-gray-900 mt-1">{profile.phone || '-'}</div>
            </div>
          </div>
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
            <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">Business Email</div>
            <div className="text-sm font-bold text-gray-900 mt-1">{profile.email || '-'}</div>
          </div>
        </div>

        <div className="space-y-6 pt-10 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <span className="h-10 w-10 rounded-2xl bg-violet-600 flex items-center justify-center text-xs font-black text-white shadow-xl shadow-violet-100 uppercase tracking-widest">02</span>
            <h3 className="text-lg font-black tracking-tight text-gray-900 uppercase">Payment Method</h3>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <button
              type="button"
              onClick={() => setPaymentMethod('RAZORPAY')}
              className={`p-6 rounded-[2rem] border-2 transition-all text-left flex items-center gap-6 ${paymentMethod === 'RAZORPAY' ? 'border-violet-600 bg-violet-50 shadow-xl shadow-violet-100' : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'}`}
            >
              <span className="text-4xl">💳</span>
              <div className="flex flex-col">
                <span className="text-base font-black uppercase tracking-widest text-gray-900 leading-none">Razorpay</span>
                <span className="text-[10px] text-violet-600 font-black uppercase tracking-[0.2em] mt-2">Online Payment (Auto Confirmation)</span>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod('CASH')}
              className={`p-6 rounded-[2rem] border-2 transition-all text-left flex items-center gap-6 ${paymentMethod === 'CASH' ? 'border-violet-600 bg-violet-50 shadow-xl shadow-violet-100' : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'}`}
            >
              <span className="text-4xl">💼</span>
              <div className="flex flex-col">
                <span className="text-base font-black uppercase tracking-widest text-gray-900 leading-none">Offline Payment</span>
                <span className="text-[10px] text-amber-600 font-black uppercase tracking-[0.2em] mt-2">Manual Approval Required</span>
              </div>
            </button>
          </div>
        </div>

        <button 
          disabled={loading}
          className={`py-6 rounded-[2rem] w-full text-sm font-black uppercase tracking-widest transition-all mt-6 shadow-2xl ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-violet-600 hover:bg-violet-500 text-white shadow-violet-200 transform hover:-translate-y-2 active:scale-95'}`}
        >
          {loading ? 'Processing...' : paymentMethod === 'RAZORPAY' ? 'Pay & Confirm Order' : 'Request Offline Order'}
        </button>
      </form>
    </div>
  )
}
