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
    const existing = selected.find(x=>x.productId===p._id)
    if (existing) setSelected(selected.map(x=> x.productId===p._id? {...x, quantity: x.quantity+1}: x))
    else setSelected([...selected, { productId:p._id, name:p.name, price:p.price, gst:p.gst, quantity:1 }])
  }
  const updateQty = (id, qty) => setSelected(selected.map(x=> x.productId===id? {...x, quantity: Math.max(1, qty)}: x))
  const removeItem = (id) => setSelected(selected.filter(x=>x.productId!==id))

  const totals = useMemo(()=>{
    let subtotal=0, gstTotal=0
    for(const it of selected){
      const lineSubtotal = it.price*it.quantity
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
    const { data } = await api.post('/api/bills', payload)
    notify('Bill generated','success')
    window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/bills/${data._id}/pdf`, '_blank')
    setSelected([]); setCouponCode(''); setCouponInfo(null)
  }

  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-2 space-y-4">
        <div className="flex items-center gap-2"><input className="border p-2 flex-1" placeholder="Search products" value={q} onChange={e=>setQ(e.target.value)} /></div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {!loading && products.map(p => (
            <div key={p._id} className="bg-white border rounded p-3">
              <div className="font-medium text-sm mb-1">{p.name}</div>
              <div className="text-xs text-gray-600">₹{p.price} • {p.stock} in stock</div>
              <button onClick={()=>addItem(p)} className="mt-2 w-full bg-blue-600 text-white py-1 rounded">Add</button>
            </div>
          ))}
          {loading && Array.from({length:8}).map((_,i)=> (
            <div key={i} className="bg-white border rounded p-3 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"/>
              <div className="h-3 bg-gray-200 rounded w-1/2"/>
              <div className="mt-2 h-8 bg-gray-200 rounded"/>
            </div>
          ))}
        </div>
        <div className="flex justify-between p-2">
          <div>Page {page} of {Math.max(1, Math.ceil(total/limit))}</div>
          <div className="space-x-2">
            <button onClick={()=>load(Math.max(1, page-1))} className="px-2 py-1 border rounded" disabled={page===1}>Prev</button>
            <button onClick={()=>load(page+1)} className="px-2 py-1 border rounded" disabled={page*limit>=total}>Next</button>
          </div>
        </div>
      </div>
      <div className="space-y-4">
        <div className="bg-white border rounded p-4 space-y-2">
          <div className="font-semibold">Customer</div>
          <input className="border p-2 w-full" placeholder="Name" value={customer.name} onChange={e=>setCustomer({...customer, name:e.target.value})} />
          <input className="border p-2 w-full" placeholder="Phone" value={customer.phone} onChange={e=>setCustomer({...customer, phone:e.target.value})} />
          <input className="border p-2 w-full" placeholder="Email" value={customer.email} onChange={e=>setCustomer({...customer, email:e.target.value})} />
          <input className="border p-2 w-full" placeholder="Address" value={customer.address} onChange={e=>setCustomer({...customer, address:e.target.value})} />
        </div>
        <div className="bg-white border rounded p-4 space-y-2">
          <div className="font-semibold">Cart</div>
          {selected.map(it => (
            <div key={it.productId} className="flex items-center justify-between gap-2">
              <div className="text-sm flex-1">{it.name}</div>
              <input type="number" min="1" className="border w-16 p-1" value={it.quantity} onChange={e=>updateQty(it.productId, Number(e.target.value))} />
              <button onClick={()=>removeItem(it.productId)} className="text-red-600 text-sm">Remove</button>
            </div>
          ))}
          {selected.length===0 && <div className="text-sm text-gray-500">No items</div>}
        </div>
        <div className="bg-white border rounded p-4 space-y-2">
          <div className="flex gap-2">
            <input className="border p-2 flex-1" placeholder="Coupon code" value={couponCode} onChange={e=>setCouponCode(e.target.value)} />
            <button onClick={applyCoupon} className="px-3 bg-gray-800 text-white rounded">Apply</button>
          </div>
          <div className="text-sm">Subtotal: ₹{totals.subtotal.toFixed(2)}</div>
          <div className="text-sm">GST: ₹{totals.gstTotal.toFixed(2)}</div>
          <div className="text-sm">Total: ₹{totals.total.toFixed(2)}</div>
          {totals.discount>0 && <div className="text-sm">Discount: -₹{totals.discount.toFixed(2)}</div>}
          <div className="text-sm">
            Payment type:
            <select className="border p-1 ml-2 text-xs" value={paymentType} onChange={e=>setPaymentType(e.target.value)}>
              <option value="CASH">Cash</option>
              <option value="CARD">Card</option>
              <option value="UPI">UPI</option>
              <option value="ONLINE">Online</option>
            </select>
          </div>
          <div className="font-semibold">Payable: ₹{totals.payable.toFixed(2)}</div>
          <button disabled={selected.length===0 || !customer.name || !customer.phone} onClick={submit} className="w-full bg-green-600 text-white py-2 rounded disabled:opacity-50">Generate Bill</button>
        </div>
      </div>
    </div>
  )
}
