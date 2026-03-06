import { useLocation, useNavigate, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import api from '../../lib/api'
import { useCart } from '../../lib/CartContext'
import { useToast } from '../../components/Toast'
import logo from '../../click2kart.png'

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
  const [ship, setShip] = useState({ loading: false, amount: 0, discount: 0, final: 0 })
  const [paymentMethod, setPaymentMethod] = useState('RAZORPAY')
  const [codAdvMethod, setCodAdvMethod] = useState('RAZORPAY')
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
      const { data } = await api.get('/api/shipping/check-pincode', { params: { pincode: pin } })
      const etaStart = data?.etaStart ? new Date(data.etaStart) : computeEtaRange().start
      const etaEnd = data?.etaEnd ? new Date(data.etaEnd) : computeEtaRange().end
      setSvc({ loading: false, available: !!data.delivery_available, cod: !!data.cod_available, etaStart, etaEnd, error: '' })
      if (data.delivery_available) {
        setShip(s => ({ ...s, loading: true }))
        try {
          const { data: calc } = await api.post('/api/shipping/calculate', {
            destination_pin: pin,
            weight: 1,
            order_amount: cartTotal
          })
          setShip({ loading: false, amount: calc?.shipping ?? calc?.amount ?? 85, discount: calc?.discount ?? 85, final: calc?.final ?? 0 })
        } catch {
          setShip({ loading: false, amount: 85, discount: 85, final: 0 })
        }
      } else {
        setShip({ loading: false, amount: 0, discount: 0, final: 0 })
      }
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

  const unitPrice = (it) => {
    let p = Number(it.price || 0)
    const qty = Math.max(1, Number(it.quantity || 1))
    if (Array.isArray(it.bulkTiers) && it.bulkTiers.length) {
      const tiers = it.bulkTiers.slice().sort((a, b) => Number(a.quantity || 0) - Number(b.quantity || 0))
      const applicable = tiers.filter(t => qty >= Number(t.quantity || 0)).pop()
      if (applicable) {
        const off = Number(applicable.priceReduction ?? applicable.price_reduction ?? 0)
        p = Math.max(0, p - off)
      }
    } else if (Number(it.bulkQty || it.bulkDiscountQuantity) > 0) {
      const off = Number(it.bulkRed || it.bulkDiscountPriceReduction || 0)
      if (qty >= Number(it.bulkQty || it.bulkDiscountQuantity)) {
        p = Math.max(0, p - off)
      }
    }
    return p
  }
  const lineTotal = (it) => unitPrice(it) * Math.max(1, Number(it.quantity || 1))
  const computedVisibleTotal = (arr) =>
    arr
      .filter(it => typeof it.productId === 'string' && it.productId.length >= 12)
      .reduce((sum, it) => sum + lineTotal(it), 0)

  const handleRazorpay = async ({ items, paymentMethod, razorpayOrderId, amountPaise }) => {
    try {
      await ensureRazorpayLoaded()
    } catch {
      notify('Unable to load payment gateway. Please try again.', 'error')
      return
    }
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_placeholder",
      amount: amountPaise,
      currency: "INR",
      name: "Click2Kart",
      description: "B2B Order Payment",
      image: logo,
      order_id: razorpayOrderId,
      handler: async function (response) {
        try {
          await api.post('/api/orders/create-after-verify', {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            items,
            paymentMethod
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
      const { data: svc } = await api.get('/api/shipping/check-pincode', { params: { pincode: pin } })
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
      const visibleTotal = computedVisibleTotal(items)
      if (visibleTotal < minAmount) {
        notify(`Minimum order amount is ₹${minAmount.toLocaleString()}`, 'error')
        setLoading(false)
        return
      }
      if (paymentMethod === 'MANUAL') {
        setLoading(false)
        nav('/manual-payment', { state: { items: cleanItems, amount: visibleTotal } })
        return
      }
      if (paymentMethod === 'RAZORPAY') {
        try {
          const { data } = await api.post('/api/orders/prepare-payment', { items: cleanItems, paymentMethod: 'RAZORPAY' })
          await handleRazorpay({ items: cleanItems, paymentMethod: 'RAZORPAY', razorpayOrderId: data.razorpayOrderId, amountPaise: data.amountPaise })
        } catch {
          notify('Payment initialization failed. Please retry.', 'error')
        }
      } else if (paymentMethod === 'COD') {
        if (codAdvMethod === 'MANUAL') {
          setLoading(false)
          nav('/manual-payment', { state: { items: cleanItems, amount: Math.round(visibleTotal * 0.2), cod20: true } })
          return
        }
        try {
          const { data } = await api.post('/api/orders/prepare-payment', { items: cleanItems, paymentMethod: 'COD_20' })
          await handleRazorpay({ items: cleanItems, paymentMethod: 'COD_20', razorpayOrderId: data.razorpayOrderId, amountPaise: data.amountPaise })
        } catch {
          notify('Payment initialization failed. Please retry.', 'error')
        }
      }
    } catch (err) {
      const code = err?.response?.data?.error
      const lower = typeof code === 'string' ? code.toLowerCase() : ''
      const serverMin = Number(err?.response?.data?.minAmount || minAmount)
      const message =
        code === 'kyc_required' ? 'Please complete KYC to place orders' :
        code === 'product_not_found' ? 'Some items are no longer available' :
        code === 'insufficient_stock' || lower.includes('insufficient stock') ? 'Insufficient stock for one of the items' :
        code === 'min_order_not_met' ? `Minimum order amount is ₹${serverMin.toLocaleString()}` :
        code === 'invalid_payment_method' ? 'Invalid payment method selected' :
        code === 'service_unavailable' ? 'Delivery not available for your pincode' :
        code === 'cod_unavailable' ? 'COD not available for your pincode' :
        code === 'razorpay_not_configured' ? 'Payment gateway configuration missing. Please contact support.' :
        code === 'invalid_amount' ? 'Invalid payable amount. Please refresh and try again.' :
        code === 'payment_initiation_failed' ? 'Payment gateway error. Please try again.' :
        code === 'delhivery_not_configured' ? 'Shipping configuration is incomplete. Please contact support.' :
        'Failed to place order. If amount is deducted, please contact support with your payment ID.'
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
                    Qty: {item.quantity} • Unit: ₹{unitPrice(item)}
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
                <div className="text-lg font-black text-gray-900">₹{lineTotal(item)}</div>
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
                        <span>
                          {svc.available
                            ? <>Service available <span className="mx-1">•</span> PIN {String(profile?.kyc?.pincode || '').trim() || '—'}</>
                            : 'Service not available'
                          }
                        </span>
                      </div>
                      {svc.available && (
                        <div className="mt-1 text-[10px]">
                          {svc.cod ? 'COD available' : 'COD not available'} • {(() => {
                            const fmt = (d) => d ? new Date(d).toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short' }) : '-'
                            return <>ETA: {fmt(svc.etaStart)} – {fmt(svc.etaEnd)}</>
                          })()}
                        </div>
                      )}
                      {svc.available && (
                        <div className="mt-1 text-[10px] font-black text-emerald-700">
                          {ship.loading ? 'Calculating shipping…' : (ship.final === 0 ? 'FREE DELIVERY' : `Shipping: ₹${ship.final} (₹${ship.discount} off)`) }
                        </div>
                      )}
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
              disabled={!svc.available}
              className={`p-6 rounded-[2rem] border-2 transition-all text-left flex items-center gap-6 ${!svc.available ? 'opacity-50 cursor-not-allowed' : (paymentMethod === 'RAZORPAY' ? 'border-violet-600 bg-violet-50 shadow-xl shadow-violet-100' : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50')}`}
            >
              <span className="text-4xl">💳</span>
              <div className="flex flex-col">
                <span className="text-base font-black uppercase tracking-widest text-gray-900 leading-none">Razorpay</span>
                <span className="text-[10px] text-violet-600 font-black uppercase tracking-[0.2em] mt-2">Online Payment (Auto Confirmation)</span>
              </div>
            </button>
            {false && (
              <button type="button" />
            )}
            <button
              type="button"
              onClick={() => setPaymentMethod('MANUAL')}
              disabled={!svc.available}
              className={`p-6 rounded-[2rem] border-2 transition-all text-left flex items-center gap-6 ${!svc.available ? 'opacity-50 cursor-not-allowed' : (paymentMethod === 'MANUAL' ? 'border-emerald-600 bg-emerald-50 shadow-xl shadow-emerald-100' : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50')}`}
            >
              <span className="text-4xl">📱</span>
              <div className="flex flex-col">
                <span className="text-base font-black uppercase tracking-widest text-gray-900 leading-none">Manual Payment (UPI/Bank)</span>
                <span className="text-[10px] text-emerald-600 font-black uppercase tracking-[0.2em] mt-2">Submit UTR for approval</span>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod('COD')}
              disabled={!svc.available || !svc.cod}
              className={`p-6 rounded-[2rem] border-2 transition-all text-left flex items-center gap-6 ${(!svc.available || !svc.cod) ? 'opacity-50 cursor-not-allowed' : (paymentMethod === 'COD' ? 'border-violet-600 bg-violet-50 shadow-xl shadow-violet-100' : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50')}`}
            >
              <span className="text-4xl">🚚</span>
              <div className="flex flex-col">
                <span className="text-base font-black uppercase tracking-widest text-gray-900 leading-none">Cash on Delivery</span>
                <span className={`text-[10px] font-black uppercase tracking-[0.2em] mt-2 ${svc.cod ? 'text-blue-600' : 'text-gray-400'}`}>{svc.cod ? 'Pay 20% now • Rest on delivery' : 'COD not available'}</span>
              </div>
            </button>
            {paymentMethod === 'COD' && (
              <div className="pl-4">
                <div className="inline-flex items-center gap-2 bg-white border border-gray-100 rounded-2xl p-2">
                  <button
                    type="button"
                    onClick={()=>setCodAdvMethod('RAZORPAY')}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${codAdvMethod==='RAZORPAY' ? 'bg-violet-600 text-white border-violet-600' : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-300'}`}
                  >
                    Pay 20% via Razorpay
                  </button>
                  <button
                    type="button"
                    onClick={()=>setCodAdvMethod('MANUAL')}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${codAdvMethod==='MANUAL' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-300'}`}
                  >
                    Pay 20% via UPI/Bank
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <button 
          disabled={loading || cartTotal < minAmount || !svc.available}
          className={`py-6 rounded-[2rem] w-full text-sm font-black uppercase tracking-widest transition-all mt-6 shadow-2xl ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-900 hover:bg-black text-white shadow-gray-300 transform hover:-translate-y-2 active:scale-95'}`}
        >
          {loading ? 'Processing...' : (
            !svc.available
              ? 'Service not available for your pincode'
              : cartTotal < minAmount
                ? `Minimum order ₹${minAmount.toLocaleString()}`
                : paymentMethod === 'RAZORPAY'
                  ? 'Pay & Confirm Order'
                  : paymentMethod === 'MANUAL'
                    ? 'Proceed to Manual Payment'
                    : paymentMethod === 'COD'
                      ? (codAdvMethod === 'RAZORPAY' ? 'Pay 20% & Confirm COD' : 'Submit UTR for COD Advance')
                      : 'Continue'
          )}
        </button>
      </form>
    </div>
  )
}
