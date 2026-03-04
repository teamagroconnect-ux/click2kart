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
  const minAmount = Number(import.meta.env.VITE_MIN_ORDER_AMOUNT || 5000)
  
  const initialItems = cart.length > 0 
    ? cart.map(item => ({
        productId: item.productId || item._id,
        variantId: item.variantId,
        quantity: item.quantity,
        name: item.name,
        price: item.price,
        image: item.image || item.images?.[0]?.url,
        attributes: item.attributes,
        bulkQty: item.bulkDiscountQuantity || item.bulkQty || 0,
        bulkRed: item.bulkDiscountPriceReduction || item.bulkRed || 0
      }))
    : (loc.state?.productId ? [{ productId: loc.state.productId, quantity: 1, name: loc.state.name }] : [])

  const [items, setItems] = useState(initialItems)
  const [profile, setProfile] = useState({ name: '', phone: '', email: '', kyc: {} })
  const [svc, setSvc] = useState({ loading: true, available: null, cod: null, etaStart: null, etaEnd: null, error: '' })
  const [paymentMethod, setPaymentMethod] = useState('RAZORPAY')
  const [loading, setLoading] = useState(false)

  const computeEtaRange = () => {
    const addDays = (d, n) => {
      const x = new Date(d.getTime())
      for (let i = 0; i < n; i++) {
        x.setDate(x.getDate() + 1)
      }
      return x
    }
    const today = new Date()
    return { start: addDays(today, 3), end: addDays(today, 6) }
  }

  const loadServiceability = async (pin) => {
    if (!pin) { setSvc({ loading: false, available: null, cod: null, etaStart: null, etaEnd: null, error: 'no_pin' }); return }
    setSvc(prev => ({ ...prev, loading: true, error: '' }))
    try {
      const { data } = await api.get('/api/shipping/delhivery/serviceability', { params: { pincode: pin } })
      const etaStart = data?.etaStart ? new Date(data.etaStart) : computeEtaRange().start
      const etaEnd = data?.etaEnd ? new Date(data.etaEnd) : computeEtaRange().end
      setSvc({ loading: false, available: !!data.delivery_available, cod: !!data.cod_available, etaStart, etaEnd, error: '' })
    } catch {
      const { start, end } = computeEtaRange()
      setSvc({ loading: false, available: null, cod: null, etaStart: start, etaEnd: end, error: 'failed' })
    }
  }

  useEffect(() => {
    if (cart.length > 0) {
      setItems(cart.map(item => ({
        productId: item.productId || item._id,
        variantId: item.variantId,
        quantity: item.quantity,
        name: item.name,
        price: item.price,
        image: item.image || item.images?.[0]?.url,
        attributes: item.attributes,
        bulkQty: item.bulkDiscountQuantity || item.bulkQty || 0,
        bulkRed: item.bulkDiscountPriceReduction || item.bulkRed || 0
      })))
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
        const prof = { name: data.name || '', phone: data.phone || '', email: data.email || '', kyc: data.kyc || {} }
        setProfile(prof)
        const pin = String(prof?.kyc?.pincode || '').trim()
        if (pin) loadServiceability(pin)
      } catch {
        nav('/login')
      }
    })()
  }, [])

  const ensureRazorpayLoaded = async () => {
    if (window.Razorpay) return true
    return new Promise((resolve, reject) => {
      const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')
      if (existing) {
        existing.addEventListener('load', () => resolve(true), { once: true })
        existing.addEventListener('error', () => reject(new Error('razorpay_load_failed')), { once: true })
        return
      }
      const s = document.createElement('script')
      s.src = 'https://checkout.razorpay.com/v1/checkout.js'
      s.async = true
      s.onload = () => resolve(true)
      s.onerror = () => reject(new Error('razorpay_load_failed'))
      document.body.appendChild(s)
    })
  }

  const handleRazorpay = async (orderData, razorpayOrderId, amountPaise) => {
    try {
      await ensureRazorpayLoaded()
    } catch {
      notify('Unable to load payment gateway. Please try again.', 'error')
      return
    }
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_placeholder",
      amount: amountPaise ?? Math.round(cartTotal * 100),
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
    try {
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch {
      notify('Payment initialization failed. Please retry.', 'error')
    }
  }

  const submit = async (e)=>{
    e.preventDefault()
    if (cartTotal < minAmount) {
      notify(`Minimum order amount is ₹${minAmount.toLocaleString()}`, 'error')
      return
    }
    try {
      const pin = String(profile?.kyc?.pincode || '').trim()
      if (!pin) { notify('Please add delivery pincode in KYC', 'error'); nav('/profile'); return }
      const { data: svc } = await api.get('/api/shipping/delhivery/serviceability', { params: { pincode: pin } })
      if (!svc?.delivery_available) { notify('Delivery not available for your pincode', 'error'); return }
      if (paymentMethod === 'COD_20' && !svc?.cod_available) { notify('COD not available for your pincode', 'error'); return }
    } catch {
      notify('Unable to verify serviceability right now', 'error')
      return
    }
    setLoading(true)
    try {
      const cleanItems = items
        .filter(it => typeof it.productId === 'string' && it.productId.length >= 12)
        .map(it => ({ productId: it.productId, variantId: it.variantId, quantity: Math.max(1, Number(it.quantity || 1)) }))
      const { data } = await api.post('/api/orders', { items: cleanItems, paymentMethod })
      
      if (paymentMethod === 'RAZORPAY') {
        handleRazorpay(data.order, data.razorpayOrderId, Math.round(cartTotal * 100));
      } else if (paymentMethod === 'COD_20') {
        handleRazorpay(data.order, data.razorpayOrderId, Math.round(cartTotal * 0.2 * 100));
      } else {
        notify('Order requested! Pending admin approval for cash payment.', 'success')
        clearCart()
        nav('/orders')
      }
    } catch (err) {
      const code = err?.response?.data?.error
      const serverMin = Number(err?.response?.data?.minAmount || minAmount)
      const message =
        code === 'kyc_required' ? 'Please complete KYC to place orders' :
        code === 'product_not_found' ? 'Some items are no longer available' :
        code === 'insufficient_stock' ? 'Insufficient stock for one of the items' :
        code === 'min_order_not_met' ? `Minimum order amount is ₹${serverMin.toLocaleString()}` :
        code === 'invalid_payment_method' ? 'Invalid payment method selected' :
        'Failed to place order'
      notify(message, 'error')
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
                    <div className="w-10 h-10 rounded-xl bg-gray-100 border border-gray-200"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-base font-black text-gray-900 truncate tracking-tight">{item.name}</div>
                  <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                    Qty: {item.quantity} • Unit: ₹{item.price}
                    {item.attributes && (
                      <span className="ml-2 text-gray-500">
                        {Object.entries(item.attributes || {}).filter(([_,v])=>v).map(([k,v])=>`${k}: ${v}`).join(' • ')}
                      </span>
                    )}
                  </div>
                  {(() => {
                    const tiers = Array.isArray(item.bulkTiers) && item.bulkTiers.length
                      ? item.bulkTiers.slice().sort((a,b)=>a.quantity-b.quantity)
                      : (item.bulkQty > 0 ? [{ quantity: item.bulkQty, priceReduction: item.bulkRed || 0 }] : [])
                    if (!tiers.length) return null
                    const next = tiers.find(t => item.quantity < t.quantity)
                    const maxQ = Math.max(item.quantity, tiers[tiers.length - 1].quantity)
                    const pct = Math.min(100, Math.round((item.quantity / maxQ) * 100))
                    return (
                      <div className="mt-2 space-y-2">
                        <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                          <div className="h-2 bg-emerald-500" style={{ width: `${pct}%` }} />
                        </div>
                        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-gray-400">
                          <div className="flex items-center gap-2">
                            {tiers.map((t, idx) => (
                              <div key={idx} className="flex items-center gap-1">
                                <span className="h-1 w-1 rounded-full bg-gray-300"></span>
                                <span>{t.quantity}+</span>
                              </div>
                            ))}
                          </div>
                          {next
                            ? <div className="text-emerald-700">Add {next.quantity - item.quantity} more for extra ₹{Number(next.priceReduction).toLocaleString()}/unit off</div>
                            : <div className="text-emerald-700">Max bulk savings applied</div>
                          }
                        </div>
                      </div>
                    )
                  })()}
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
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <span className="h-10 w-10 rounded-2xl bg-violet-600 flex items-center justify-center text-xs font-black text-white shadow-xl shadow-violet-100 uppercase tracking-widest">01</span>
            <h3 className="text-lg font-black tracking-tight text-gray-900 uppercase">Contact & Delivery</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
              <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">Name</div>
              <div className="text-sm font-bold text-gray-900 mt-1">{profile.name || '-'}</div>
            </div>
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
              <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">Phone</div>
              <div className="text-sm font-bold text-gray-900 mt-1">{profile.phone || '-'}</div>
            </div>
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
              <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">Email</div>
              <div className="text-sm font-bold text-gray-900 mt-1">{profile.email || '-'}</div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 md:col-span-2">
              <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">Delivery Address</div>
              <div className="text-sm font-bold text-gray-900 mt-1">
                {profile?.kyc?.addressLine1 || '-'}{profile?.kyc?.addressLine2 ? `, ${profile.kyc.addressLine2}` : ''}
              </div>
              <div className="text-xs text-gray-500">
                {(profile?.kyc?.city || '-')}, {(profile?.kyc?.state || '-')} - {(profile?.kyc?.pincode || '-')}
              </div>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Serviceability</div>
              <div className={`rounded-xl border px-3 py-2 text-[11px] font-bold ${svc.loading ? 'border-gray-100 bg-gray-50 text-gray-500' : (svc.available ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-red-200 bg-red-50 text-red-700')}`}>
                {svc.loading
                  ? 'Checking your pincode…'
                  : (
                    <>
                      <div className="flex items-center justify-between">
                        <span>{svc.available ? 'Service available' : 'Service not available'}</span>
                        <span className="text-gray-500">PIN {String(profile?.kyc?.pincode || '').trim() || '—'}</span>
                      </div>
                      <div className="mt-1 text-[10px]">
                        {svc.available ? (svc.cod ? 'COD available' : 'COD not available') : '—'} • {(() => {
                          const fmt = (d) => d ? new Date(d).toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short' }) : '-'
                          return <>ETA: {fmt(svc.etaStart)} – {fmt(svc.etaEnd)}</>
                        })()}
                      </div>
                    </>
                  )
                }
              </div>
              {/* Removed action buttons for a cleaner, professional look */}
            </div>
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
            <button
              type="button"
              onClick={() => setPaymentMethod('COD_20')}
              className={`p-6 rounded-[2rem] border-2 transition-all text-left flex items-center gap-6 ${paymentMethod === 'COD_20' ? 'border-violet-600 bg-violet-50 shadow-xl shadow-violet-100' : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'}`}
            >
              <span className="text-4xl">🚚</span>
              <div className="flex flex-col">
                <span className="text-base font-black uppercase tracking-widest text-gray-900 leading-none">Cash on Delivery</span>
                <span className="text-[10px] text-blue-600 font-black uppercase tracking-[0.2em] mt-2">Pay 20% now • Rest on delivery</span>
              </div>
            </button>
          </div>
        </div>

        <button 
          disabled={loading || cartTotal < minAmount}
          className={`py-6 rounded-[2rem] w-full text-sm font-black uppercase tracking-widest transition-all mt-6 shadow-2xl ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-900 hover:bg-black text-white shadow-gray-300 transform hover:-translate-y-2 active:scale-95'}`}
        >
          {loading ? 'Processing...' : (cartTotal < minAmount ? `Minimum order ₹${minAmount.toLocaleString()}` : (paymentMethod === 'RAZORPAY' ? 'Pay & Confirm Order' : paymentMethod === 'COD_20' ? 'Pay 20% & Confirm COD' : 'Request Offline Order'))}
        </button>
      </form>
    </div>
  )
}
