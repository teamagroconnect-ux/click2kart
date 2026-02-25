import { useEffect, useState } from 'react'
import api from '../../lib/api'
import { useToast } from '../../components/Toast'

export default function Partners() {
  const { notify } = useToast()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCode, setSelectedCode] = useState(null)
  const [form, setForm] = useState({ amount:'', method:'MANUAL', utr:'', razorpayPaymentId:'', notes:'' })

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/api/partners')
      setItems(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const openPayout = (code) => {
    setSelectedCode(code)
    setForm({ amount:'', method:'MANUAL', utr:'', razorpayPaymentId:'', notes:'' })
  }

  const submitPayout = async (e) => {
    e.preventDefault()
    if (!selectedCode) return
    try {
      await api.post(`/api/partners/${selectedCode}/payout`, {
        amount: Number(form.amount),
        method: form.method,
        utr: form.utr || undefined,
        razorpayPaymentId: form.razorpayPaymentId || undefined,
        notes: form.notes || undefined
      })
      notify('Payout recorded','success')
      setSelectedCode(null)
      load()
    } catch {
      notify('Failed to record payout','error')
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold mb-2">Partners</h1>
      <div className="bg-white border rounded">
        <div className="grid grid-cols-7 gap-2 px-4 py-2 text-sm font-semibold border-b">
          <div>Partner</div>
          <div>Coupon</div>
          <div>Txn Amount</div>
          <div>Commission %</div>
          <div>Total Commission</div>
          <div>Paid</div>
          <div>Balance</div>
        </div>
        {loading && <div className="p-4 text-sm text-gray-500">Loading...</div>}
        {!loading && items.map(p => (
          <div key={p.couponId} className="border-t px-4 py-2 text-sm flex flex-col gap-1">
            <div className="grid grid-cols-7 gap-2 items-center">
              <div>
                <div className="font-medium">{p.partnerName || '-'}</div>
                {p.partnerPhone && <div className="text-xs text-gray-600">{p.partnerPhone}</div>}
              </div>
              <div>{p.code}</div>
              <div>₹{p.totalSales.toFixed(2)}</div>
              <div>{p.commissionPercent}%</div>
              <div>₹{p.totalCommission.toFixed(2)}</div>
              <div>₹{p.totalPaid.toFixed(2)}</div>
              <div className="flex items-center gap-2">
                <span>₹{p.balance.toFixed(2)}</span>
                <button className="px-2 py-1 text-xs bg-blue-600 text-white rounded" onClick={()=>openPayout(p.code)}>Mark paid</button>
              </div>
            </div>
            {p.payouts && p.payouts.length>0 && (
              <div className="text-xs text-gray-600 mt-1">
                Last payout: ₹{p.payouts[0].amount.toFixed(2)} on {new Date(p.payouts[0].createdAt).toLocaleString()} via {p.payouts[0].method}{p.payouts[0].utr? ` • UTR ${p.payouts[0].utr}`:''}{p.payouts[0].razorpayPaymentId? ` • Razorpay ${p.payouts[0].razorpayPaymentId}`:''}
              </div>
            )}
          </div>
        ))}
        {!loading && items.length===0 && <div className="p-4 text-sm text-gray-500">No partners configured. Create coupons with partner details to see them here.</div>}
      </div>
      {selectedCode && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-20">
          <div className="bg-white rounded shadow-lg p-6 w-full max-w-md space-y-3">
            <h2 className="text-lg font-semibold">Record payout for {selectedCode}</h2>
            <form onSubmit={submitPayout} className="space-y-3">
              <input className="border p-2 w-full" placeholder="Amount" type="number" min="0" step="0.01" value={form.amount} onChange={e=>setForm({...form, amount:e.target.value})} required />
              <select className="border p-2 w-full" value={form.method} onChange={e=>setForm({...form, method:e.target.value})}>
                <option value="MANUAL">Manual / Bank transfer</option>
                <option value="RAZORPAY">Razorpay</option>
              </select>
              <input className="border p-2 w-full" placeholder="UTR (for bank transfer)" value={form.utr} onChange={e=>setForm({...form, utr:e.target.value})} />
              {form.method==='RAZORPAY' && (
                <input className="border p-2 w-full" placeholder="Razorpay payment ID" value={form.razorpayPaymentId} onChange={e=>setForm({...form, razorpayPaymentId:e.target.value})} />
              )}
              <textarea className="border p-2 w-full" placeholder="Notes (optional)" value={form.notes} onChange={e=>setForm({...form, notes:e.target.value})} />
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" className="px-3 py-1 border rounded" onClick={()=>setSelectedCode(null)}>Cancel</button>
                <button type="submit" className="px-3 py-1 bg-blue-600 text-white rounded">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

