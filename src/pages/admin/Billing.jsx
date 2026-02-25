import { useEffect, useMemo, useState } from 'react'
import api from '../../lib/api'
import { useToast } from '../../components/Toast'

export default function Billing(){
  const { notify } = useToast()
  const [q, setQ] = useState('')
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [selected, setSelected] = useState([])
  const [customer, setCustomer] = useState({ name:'', phone:'', email:'', address:'' })
  const [couponCode, setCouponCode] = useState('')
  const [couponInfo, setCouponInfo] = useState(null)
  const [paymentType, setPaymentType] = useState('CASH')
  const limit = 8

  const load = async (p=1) => {
    setLoading(true)
    try { const {data} = await api.get('/api/products', { params: { q, page:p, limit } }); setProducts(data.items); setTotal(data.total); setPage(p) }
    finally { setLoading(false) }
  }
  useEffect(()=>{ load(1) }, [q])

  const addItem = (p) => {
    if (p.stock <= 0) {
      notify('This product is out of stock', 'error')
      return
    }
    const existing = selected.find(x=>x.productId===p._id)
    if (existing) {
      if (existing.quantity + 1 > p.stock) {
        notify(`Only ${p.stock} units available in stock`, 'error')
        return
      }
      setSelected(selected.map(x=> x.productId===p._id? {...x, quantity: x.quantity+1}: x))
    }
    else setSelected([...selected, { 
      productId:p._id, 
      name:p.name, 
      price:p.price, 
      gst:p.gst, 
      quantity:1,
      stock: p.stock,
      bulkQty: p.bulkDiscountQuantity || 0,
      bulkRed: p.bulkDiscountPriceReduction || 0
    }])
  }

  const updateQty = (id, q) => {
    if (q < 1) return
    const item = selected.find(x => x.productId === id)
    if (item && q > item.stock) {
      notify(`Only ${item.stock} units available in stock`, 'error')
      return
    }
    setSelected(selected.map(x => x.productId === id ? { ...x, quantity: q } : x))
  }
  const removeItem = (id) => setSelected(selected.filter(x=>x.productId!==id))

  const totals = useMemo(()=>{
    let subtotal=0, gstTotal=0
    for(const it of selected){
      let effectivePrice = it.price
      if (it.bulkQty > 0 && it.quantity >= it.bulkQty) {
        effectivePrice = Math.max(0, it.price - it.bulkRed)
      }
      const lineSubtotal = effectivePrice * it.quantity
      const lineGst = (lineSubtotal*(it.gst||0))/100
      subtotal += lineSubtotal
      gstTotal += lineGst
    }
    const totalAmount = subtotal+gstTotal
    let discount=0
    if (couponInfo?.valid){ discount = couponInfo.discount }
    const payable = Math.max(0, totalAmount - discount)
    return { subtotal, gstTotal, total: totalAmount, discount, payable }
  }, [selected, couponInfo])

  const applyCoupon = async () => {
    if (!couponCode) return setCouponInfo(null)
    try {
      const { data } = await api.post('/api/coupons/validate', { code: couponCode, amount: totals.total })
      setCouponInfo(data)
    } catch (e) {
      setCouponInfo({ valid:false })
    }
  }

  const submit = async () => {
    const payload = { customer, items: selected.map(x=>({ productId:x.productId, quantity:x.quantity })), couponCode: couponInfo?.valid? couponCode: undefined, paymentType }
    try {
      const { data } = await api.post('/api/bills', payload)
      notify('Bill generated','success')
      
      // Open PDF with token in URL
      const token = localStorage.getItem('token')
      const pdfUrl = `${api.defaults.baseURL}/api/bills/${data._id}/pdf?token=${token}`
      window.open(pdfUrl, '_blank')

      setSelected([]); setCouponCode(''); setCouponInfo(null)
    } catch (err) {
      const code = err?.response?.data?.error || 'bill_failed'
      notify(`Bill failed: ${code}`, 'error')
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
      <div className="lg:col-span-2 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Point of Sale</h1>
            <p className="text-sm text-gray-500 font-medium">Quickly create bills and manage in-store sales.</p>
          </div>
          <div className="relative group">
            <input
              className="bg-white border border-gray-200 text-gray-900 text-sm rounded-2xl pl-10 pr-4 py-2.5 w-64 outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all"
              placeholder="Search products..."
              value={q}
              onChange={e => setQ(e.target.value)}
            />
            <svg className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
          {!loading &&
            products.map(p => (
              <div
                key={p._id}
                className="group bg-white border border-gray-100 rounded-3xl p-4 flex flex-col justify-between shadow-sm hover:shadow-md transition-all cursor-pointer border-transparent hover:border-blue-100"
                onClick={() => addItem(p)}
              >
                <div className="space-y-2">
                  <div className="font-bold text-gray-900 text-sm line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">
                    {p.name}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-black text-gray-900">₹{p.price}</div>
                    <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${p.stock <= 5 ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-400'}`}>
                      {p.stock} left
                    </div>
                  </div>
                </div>
                <button
                  className="mt-3 w-full bg-gray-50 group-hover:bg-blue-600 text-gray-400 group-hover:text-white py-2 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest"
                >
                  Add to Cart
                </button>
              </div>
            ))}
        </div>
        
        <div className="flex justify-between items-center px-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
          <div>Page {page} of {Math.max(1, Math.ceil(total / limit))}</div>
          <div className="flex gap-2">
            <button onClick={() => load(Math.max(1, page - 1))} className="p-2 border border-gray-200 rounded-xl hover:bg-white disabled:opacity-30 transition-all" disabled={page === 1}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button onClick={() => load(page + 1)} className="p-2 border border-gray-200 rounded-xl hover:bg-white disabled:opacity-30 transition-all" disabled={page * limit >= total}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>
      </div>

      <div className="lg:col-span-1 space-y-6">
        <div className="bg-gray-900 rounded-[2.5rem] p-8 shadow-2xl sticky top-6 text-white space-y-8 border border-gray-800">
          <div className="space-y-1">
            <h3 className="text-xl font-black tracking-tight">Checkout</h3>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Customer & Order Details</p>
          </div>

          <div className="space-y-4">
            <input className="w-full bg-gray-800/50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-white placeholder-gray-600 outline-none focus:ring-2 focus:ring-blue-500 transition-all" placeholder="Customer Name" value={customer.name} onChange={e=>setCustomer({...customer, name:e.target.value})} />
            <input className="w-full bg-gray-800/50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-white placeholder-gray-600 outline-none focus:ring-2 focus:ring-blue-500 transition-all" placeholder="Phone Number" value={customer.phone} onChange={e=>setCustomer({...customer, phone:e.target.value})} />
            
            <div className="space-y-3 pt-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Order Summary</h4>
              <div className="max-h-[200px] overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                {selected.map(it => {
                  const isBulkApplied = it.bulkQty > 0 && it.quantity >= it.bulkQty;
                  return (
                    <div key={it.productId} className="flex items-center justify-between gap-4 group">
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold truncate flex items-center gap-2">
                          {it.name}
                          {isBulkApplied && (
                            <span className="bg-emerald-500/10 text-emerald-400 text-[8px] px-1 rounded uppercase font-black tracking-tighter border border-emerald-500/20">
                              Bulk applied
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-gray-500 font-bold">
                          {isBulkApplied ? (
                            <>
                              <span className="line-through text-gray-600">₹{it.price}</span>
                              <span className="ml-1 text-emerald-400">₹{it.price - it.bulkRed}</span>
                            </>
                          ) : (
                            `₹${it.price}`
                          )}
                          {' '} × {it.quantity}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                      <div className="flex items-center bg-gray-800 rounded-lg p-1">
                        <button onClick={() => updateQty(it.productId, it.quantity - 1)} className="w-6 h-6 flex items-center justify-center hover:text-blue-400 transition-colors text-xs">－</button>
                        <span className="w-6 text-center text-xs font-bold">{it.quantity}</span>
                        <button onClick={() => updateQty(it.productId, it.quantity + 1)} className="w-6 h-6 flex items-center justify-center hover:text-blue-400 transition-colors text-xs">＋</button>
                      </div>
                      <button onClick={() => removeItem(it.productId)} className="text-gray-600 hover:text-red-400 transition-colors p-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  </div>
                );
              })}
              {selected.length === 0 && (
                <div className="text-center py-6 text-gray-600 text-xs italic font-medium">
                  Cart is empty
                </div>
              )}
              </div>
            </div>

            <div className="pt-6 border-t border-gray-800 space-y-4">
              <div className="flex gap-2">
                <input className="flex-1 bg-gray-800/50 border-none rounded-2xl px-4 py-3 text-xs font-bold text-white placeholder-gray-600 outline-none" placeholder="Promo Code" value={couponCode} onChange={e=>setCouponCode(e.target.value)} />
                <button onClick={applyCoupon} className="bg-blue-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black hover:bg-blue-500 transition-all uppercase tracking-widest shadow-lg shadow-blue-900/20">Apply</button>
              </div>
              {couponInfo && (
                <div className={`px-4 py-2 rounded-xl text-[10px] font-bold border ${couponInfo.valid ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                  {couponInfo.valid ? `🎉 Savings: ₹${couponInfo.discount}` : 'Invalid coupon code'}
                </div>
              )}
            </div>

            <div className="space-y-2 pt-4">
              <div className="flex justify-between text-xs font-bold text-gray-400">
                <span>Subtotal</span>
                <span>₹{totals.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-gray-400">
                <span>GST (Tax)</span>
                <span>₹{totals.gstTotal.toFixed(2)}</span>
              </div>
              {totals.discount > 0 && (
                <div className="flex justify-between text-xs font-bold text-emerald-400">
                  <span>Discount</span>
                  <span>- ₹{totals.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-black pt-4 border-t border-gray-800 text-white tracking-tight">
                <span>Total Payable</span>
                <span className="text-blue-400">₹{totals.payable.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-6">
              {['CASH', 'UPI', 'CARD'].map(type => (
                <button
                  key={type}
                  onClick={() => setPaymentType(type)}
                  className={`flex-1 py-3 rounded-2xl text-[10px] font-black border transition-all ${paymentType === type ? 'bg-white text-gray-900 border-white shadow-xl scale-105' : 'bg-transparent text-gray-500 border-gray-800 hover:border-gray-600'}`}
                >
                  {type}
                </button>
              ))}
            </div>

            <button
              onClick={submit}
              disabled={selected.length === 0 || !customer.name || !customer.phone}
              className="w-full bg-blue-600 text-white py-5 rounded-3xl text-sm font-black shadow-2xl shadow-blue-900/40 hover:bg-blue-500 transition-all transform hover:-translate-y-1 active:scale-95 disabled:opacity-30 disabled:hover:translate-y-0 uppercase tracking-widest mt-4"
            >
              Generate Bill
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
