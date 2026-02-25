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
    try {
      const { data } = await api.post('/api/bills', payload)
      notify('Bill generated','success')
      
      // Fetch PDF with token and open
      const response = await api.get(`/api/bills/${data._id}/pdf`, { responseType: 'blob' })
      const file = new Blob([response.data], { type: 'application/pdf' })
      const fileURL = URL.createObjectURL(file)
      window.open(fileURL, '_blank')

      setSelected([]); setCouponCode(''); setCouponInfo(null)
    } catch (err) {
      const code = err?.response?.data?.error || 'bill_failed'
      notify(`Bill failed: ${code}`, 'error')
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-5 md:gap-6">
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Billing</h1>
            <p className="text-[11px] text-gray-500">
              Build a cart and generate GST bills for in‑store or online customers.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input
              className="border border-gray-300 bg-white text-gray-900 text-sm rounded-lg px-3 py-2 w-56"
              placeholder="Search products"
              value={q}
              onChange={e => setQ(e.target.value)}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
          {!loading &&
            products.map(p => (
              <div
                key={p._id}
                className="bg-white border border-gray-200 rounded-xl p-3 flex flex-col justify-between shadow-sm"
              >
                <div>
                  <div className="font-medium text-xs md:text-sm text-gray-900 mb-1 line-clamp-2">
                    {p.name}
                  </div>
                  <div className="text-[11px] text-gray-500">
                    ₹{p.price} • {p.stock} in stock
                  </div>
                </div>
                <button
                  onClick={() => addItem(p)}
                  className="mt-2 w-full bg-blue-600 hover:bg-blue-500 text-white py-1.5 rounded-lg text-xs font-semibold"
                >
                  Add to cart
                </button>
              </div>
            ))}
          {loading &&
            Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="bg-white border border-gray-200 rounded-xl p-3 animate-pulse"
              >
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
                <div className="mt-2 h-8 bg-gray-200 rounded" />
              </div>
            ))}
        </div>
        <div className="flex justify-between items-center text-[11px] text-gray-500">
          <div>
            Page {page} of {Math.max(1, Math.ceil(total / limit))}
          </div>
          <div className="space-x-2">
            <button
              onClick={() => load(Math.max(1, page - 1))}
              className="px-2 py-1 border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-40"
              disabled={page === 1}
            >
              Prev
            </button>
            <button
              onClick={() => load(page + 1)}
              className="px-2 py-1 border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-40"
              disabled={page * limit >= total}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-2 shadow-sm">
          <div className="font-semibold text-gray-900 text-sm">Customer</div>
          <input
            className="border border-gray-300 bg-white text-gray-900 text-sm rounded-lg px-3 py-2 w-full"
            placeholder="Name"
            value={customer.name}
            onChange={e => setCustomer({ ...customer, name: e.target.value })}
          />
          <input
            className="border border-gray-300 bg-white text-gray-900 text-sm rounded-lg px-3 py-2 w-full"
            placeholder="Phone"
            value={customer.phone}
            onChange={e => setCustomer({ ...customer, phone: e.target.value })}
          />
          <input
            className="border border-gray-300 bg-white text-gray-900 text-sm rounded-lg px-3 py-2 w-full"
            placeholder="Email"
            value={customer.email}
            onChange={e => setCustomer({ ...customer, email: e.target.value })}
          />
          <input
            className="border border-gray-300 bg-white text-gray-900 text-sm rounded-lg px-3 py-2 w-full"
            placeholder="Address"
            value={customer.address}
            onChange={e => setCustomer({ ...customer, address: e.target.value })}
          />
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-2 shadow-sm">
          <div className="font-semibold text-gray-900 text-sm">Cart</div>
          {selected.map(it => (
            <div key={it.productId} className="flex items-center justify-between gap-2">
              <div className="text-xs md:text-sm flex-1 text-gray-900 truncate">{it.name}</div>
              <input
                type="number"
                min="1"
                className="border border-gray-300 bg-white text-gray-900 text-xs rounded-lg w-16 px-2 py-1"
                value={it.quantity}
                onChange={e => updateQty(it.productId, Number(e.target.value))}
              />
              <button
                onClick={() => removeItem(it.productId)}
                className="text-red-600 text-[11px] hover:text-red-500"
              >
                Remove
              </button>
            </div>
          ))}
          {selected.length === 0 && (
            <div className="text-xs text-gray-500">No items in cart yet.</div>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-2 text-sm text-gray-900 shadow-sm">
          <div className="flex gap-2">
            <input
              className="border border-gray-300 bg-white text-gray-900 text-sm rounded-lg px-3 py-2 flex-1"
              placeholder="Coupon code"
              value={couponCode}
              onChange={e => setCouponCode(e.target.value)}
            />
            <button
              onClick={applyCoupon}
              className="px-3 bg-gray-900 text-white rounded-lg text-xs font-semibold hover:bg-gray-800"
            >
              Apply
            </button>
          </div>
          <div className="text-xs text-gray-500">
            Subtotal: <span className="text-gray-900">₹{totals.subtotal.toFixed(2)}</span>
          </div>
          <div className="text-xs text-gray-500">
            GST: <span className="text-gray-900">₹{totals.gstTotal.toFixed(2)}</span>
          </div>
          <div className="text-xs text-gray-500">
            Total: <span className="text-gray-900">₹{totals.total.toFixed(2)}</span>
          </div>
          {totals.discount > 0 && (
            <div className="text-xs text-emerald-700">
              Discount: -₹{totals.discount.toFixed(2)}
            </div>
          )}
          <div className="text-xs text-gray-500 flex items-center justify-between pt-1">
            <span>Payment type</span>
            <select
              className="border border-gray-300 bg-white text-gray-900 text-xs rounded-lg px-2 py-1"
              value={paymentType}
              onChange={e => setPaymentType(e.target.value)}
            >
              <option value="CASH">Cash</option>
              <option value="CARD">Card</option>
              <option value="UPI">UPI</option>
              <option value="ONLINE">Online</option>
            </select>
          </div>
          <div className="font-semibold text-sm pt-1">
            Payable: <span className="text-emerald-700">₹{totals.payable.toFixed(2)}</span>
          </div>
          <button
            disabled={selected.length === 0 || !customer.name || !customer.phone}
            onClick={submit}
            className="mt-1 w-full bg-emerald-500 hover:bg-emerald-400 text-white py-2 rounded-lg text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Generate bill & PDF
          </button>
        </div>
      </div>
    </div>
  )
}
