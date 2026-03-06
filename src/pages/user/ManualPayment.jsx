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
    if (!items.length) { nav('/order'); return }
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
    <div className="max-w-3xl mx-auto p-6 md:p-10">
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl overflow-hidden">
        <div className="p-6 md:p-8 border-b border-gray-100">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-widest border border-emerald-100">
            Secure Transaction
          </div>
          <h1 className="mt-3 text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900">Order Payment via UPI</h1>
          <div className="text-sm text-gray-500 mt-1">Submit your UPI payment details for verification</div>
        </div>

        <div className="p-6 md:p-8">
          <div className="relative grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="absolute left-3 top-2 bottom-2 w-[2px] bg-emerald-100 hidden md:block" />
            <div className="flex md:block items-start gap-4">
              <div className="hidden md:flex items-center justify-center h-6 w-6 rounded-full bg-emerald-600 text-white text-[10px] font-black absolute -left-0.5">1</div>
              <div className="w-full">
                <div className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Transfer Amount via UPI</div>
                <div className="relative overflow-hidden rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-emerald-50 p-5 space-y-4">
                  <div className="flex items-center gap-4">
                    {qr
                      ? <img src={qr} alt="UPI QR" className="h-28 w-28 rounded-xl border border-emerald-100 shadow" />
                      : <div className="h-28 w-28 rounded-xl border border-dashed border-emerald-200 flex items-center justify-center text-emerald-400 text-xs">QR</div>
                    }
                    <div className="space-y-2">
                      <div className="text-[10px] font-black uppercase tracking-widest text-gray-500">UPI ID</div>
                      <div className="inline-flex items-center gap-2 bg-white rounded-xl px-3 py-2 border border-emerald-100">
                        <span className="text-sm font-bold text-emerald-700">{upiId}</span>
                        <button onClick={()=>copy(upiId)} className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100">Copy</button>
                      </div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-emerald-700">Scan QR or pay using any UPI app</div>
                    </div>
                  </div>
                  <div className="text-[11px] text-emerald-800 font-bold">
                    Amount: {cod20 ? `20% of Total • ${totalText}` : totalText}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex md:block items-start gap-4">
              <div className="hidden md:flex items-center justify-center h-6 w-6 rounded-full bg-gray-200 text-gray-600 text-[10px] font-black absolute -left-0.5">2</div>
              <form onSubmit={submit} className="w-full space-y-4">
                <div className="text-xs font-black text-gray-500 uppercase tracking-widest">Submit Payment Details</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Amount Paid (₹)</label>
                    <input type="number" step="0.01" value={form.amountPaid} onChange={e=>setForm({...form, amountPaid: e.target.value})} className="w-full mt-1 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="0.00" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Bank UTR / Ref No.</label>
                    <input value={form.utr} onChange={e=>setForm({...form, utr: e.target.value})} className="w-full mt-1 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="12-digit UTR number" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Note (Optional)</label>
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
        </div>
      </div>
    </div>
  )
}
