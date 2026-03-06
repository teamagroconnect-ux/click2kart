import React, { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useToast } from '../../components/Toast'
import api from '../../lib/api'

export default function ManualPayment() {
  const nav = useNavigate()
  const { notify } = useToast()
  const loc = useLocation()
  const items = Array.isArray(loc.state?.items) ? loc.state.items : []
  const amountDefault = Number(loc.state?.amount || 0)
  const cod20 = !!loc.state?.cod20

  const upiId = import.meta.env.VITE_UPI_ID || 'payments@click2kart'
  const upiName = import.meta.env.VITE_UPI_NAME || 'Click2Kart'
  const qr = import.meta.env.VITE_UPI_QR || ''

  const [form, setForm] = useState({ amountPaid: amountDefault, utr: '', note: '' })
  const totalText = useMemo(() => `₹${Number(amountDefault).toLocaleString('en-IN')}`, [amountDefault])

  const copy = async (text) => {
    try { await navigator.clipboard.writeText(text); notify('Copied', 'success') } catch {}
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!items.length) { nav('/products'); return }
    if (!form.amountPaid || Number(form.amountPaid) <= 0) { notify('Enter valid amount', 'error'); return }
    if (!form.utr || form.utr.trim().length < 6) { notify('Enter valid UTR/Txn ID', 'error'); return }
    try {
      await api.post('/api/orders/manual-submit', {
        items,
        amountPaid: Number(form.amountPaid),
        utr: form.utr.trim(),
        note: form.note?.trim(),
        codAdvance20: cod20
      })
      notify('Payment details submitted. Awaiting verification.', 'success')
      nav('/orders')
    } catch {
      notify('Failed to submit payment details', 'error')
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-12 space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-gray-900">Manual Payment</h1>
          <div className="text-[10px] uppercase tracking-widest font-black text-gray-400">UPI / Bank Transfer</div>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-widest border border-emerald-100">
          Secure • Auto-verification by Admin
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="relative overflow-hidden rounded-[2rem] border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-emerald-50 p-8 space-y-6">
          <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-100 rounded-full -mr-16 -mt-16 opacity-30 blur-2xl"></div>
          <div className="flex items-start justify-between gap-4 relative z-10">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-200">
                <svg className="w-4.5 h-4.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
              </div>
              <div className="text-xs font-black text-emerald-700 uppercase tracking-widest">Pay via UPI</div>
            </div>
            <div className="text-[10px] font-black uppercase tracking-widest bg-white/80 backdrop-blur px-3 py-1 rounded-xl border border-emerald-100 text-emerald-700">
              Amount: {cod20 ? `20% of Total • ${totalText}` : totalText}
            </div>
          </div>
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-4">
              {qr
                ? <img src={qr} alt="UPI QR" className="h-32 w-32 rounded-xl border border-emerald-100 shadow" />
                : <div className="h-32 w-32 rounded-xl border border-dashed border-emerald-200 flex items-center justify-center text-emerald-400 text-xs">UPI QR</div>
              }
              <div className="space-y-2">
                <div className="text-sm font-black text-emerald-900">UPI ID</div>
                <div className="inline-flex items-center gap-2 bg-white rounded-xl px-3 py-2 border border-emerald-100">
                  <span className="text-sm font-bold text-emerald-700">{upiId}</span>
                  <button onClick={()=>copy(upiId)} className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100">Copy</button>
                </div>
                <div className="text-[10px] font-black uppercase tracking-widest text-emerald-700">Account: {upiName}</div>
              </div>
            </div>
            <div className="text-xs text-emerald-800 font-bold">
              Scan the QR or pay to the UPI ID above. Then submit your payment details for verification.
            </div>
          </div>
        </div>

        <form onSubmit={submit} className="bg-white rounded-[2rem] border border-gray-100 p-8 space-y-6">
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Amount Paid</label>
            <input type="number" step="0.01" value={form.amountPaid} onChange={e=>setForm({...form, amountPaid: e.target.value})} className="w-full mt-1 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none" />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">UTR / Transaction ID</label>
            <input value={form.utr} onChange={e=>setForm({...form, utr: e.target.value})} className="w-full mt-1 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="e.g., 1234567890" />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Note (optional)</label>
            <textarea value={form.note} onChange={e=>setForm({...form, note: e.target.value})} className="w-full mt-1 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none min-h-[90px]" placeholder="Any additional details..." />
          </div>
          <button className="w-full py-4 rounded-2xl bg-emerald-600 text-white text-sm font-black uppercase tracking-widest shadow-xl shadow-emerald-200 hover:bg-emerald-500 active:scale-95">
            Submit Payment Details
          </button>
          <button type="button" onClick={()=>nav(-1)} className="w-full py-3 rounded-2xl bg-gray-100 text-gray-700 text-xs font-black uppercase tracking-widest hover:bg-gray-200">
            Back
          </button>
        </form>
      </div>
    </div>
  )
}
