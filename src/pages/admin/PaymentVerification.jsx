import React, { useEffect, useState } from 'react'
import api from '../../lib/api'
import { io } from 'socket.io-client'
import { useToast } from '../../components/Toast'
import ImageUpload from '../../components/ImageUpload'

export default function PaymentVerification() {
  const { notify } = useToast()
  const [items, setItems] = useState([])
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [processingId, setProcessingId] = useState(null)
  const [tab, setTab] = useState('pending') // 'pending' | 'history' | 'bank_setup'
  const [expandedId, setExpandedId] = useState(null)

  // Company Bank Details & UPI QR Configuration
  const [bankConfig, setBankConfig] = useState({
    enabled: false,
    bankName: '',
    accountHolder: '',
    accountNumber: '',
    ifscCode: '',
    branch: '',
    upiId: '',
    qrCodeUrl: ''
  })
  const [loadingBankConfig, setLoadingBankConfig] = useState(false)
  const [savingBankConfig, setSavingBankConfig] = useState(false)

  const toggleExpand = (id) => setExpandedId(expandedId === id ? null : id)

  const loadPending = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/api/orders', { params: { status: 'PENDING_ADMIN_APPROVAL', limit: 100 } })
      setItems(data.items || [])
    } catch (err) {
      notify('Failed to load pending payments', 'error')
    } finally {
      setLoading(false)
    }
  }

  const loadHistory = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/api/orders/payment-history')
      setHistory(data || [])
    } catch (err) {
      notify('Failed to load history', 'error')
    } finally {
      setLoading(false)
    }
  }

  const loadBankConfig = async () => {
    setLoadingBankConfig(true)
    try {
      const { data } = await api.get('/api/admin/settings')
      if (data?.bankDetails) {
        setBankConfig({
          enabled: Boolean(data.bankDetails.enabled),
          bankName: data.bankDetails.bankName || '',
          accountHolder: data.bankDetails.accountHolder || '',
          accountNumber: data.bankDetails.accountNumber || '',
          ifscCode: data.bankDetails.ifscCode || '',
          branch: data.bankDetails.branch || '',
          upiId: data.bankDetails.upiId || '',
          qrCodeUrl: data.bankDetails.qrCodeUrl || ''
        })
      }
    } catch (err) {
      notify('Failed to load company bank configuration', 'error')
    } finally {
      setLoadingBankConfig(false)
    }
  }

  const handleSaveBankConfig = async (e) => {
    e.preventDefault()
    setSavingBankConfig(true)
    try {
      await api.put('/api/admin/settings', { bankDetails: bankConfig })
      notify('Company Bank & QR settings updated successfully!', 'success')
    } catch (err) {
      notify(err?.response?.data?.message || err?.response?.data?.error || 'Failed to update bank configuration', 'error')
    } finally {
      setSavingBankConfig(false)
    }
  }

  useEffect(() => {
    if (tab === 'pending') loadPending()
    else if (tab === 'history') loadHistory()
    else if (tab === 'bank_setup') loadBankConfig()
  }, [tab])

  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000')
    
    socket.on('connect', () => {
      socket.emit('join_admin')
    })

    socket.on('new_manual_payment', (order) => {
      notify(`New Manual Payment submitted by ${order.customer.name}`, 'info')
      if (tab === 'pending') loadPending()
      
      try {
        const audio = new Audio('/notification.mp3')
        audio.play()
      } catch (err) {
        console.log('Audio playback blocked')
      }
    })

    return () => socket.disconnect()
  }, [tab])

  const approve = async (id) => {
    if (!window.confirm('Are you sure you want to approve this payment?')) return
    setProcessingId(id)
    try {
      await api.patch(`/api/orders/${id}/approve-manual`)
      notify('Payment approved successfully', 'success')
      loadPending()
    } catch (err) {
      notify(err.response?.data?.error || 'Failed to approve payment', 'error')
    } finally {
      setProcessingId(null)
    }
  }

  const reject = async (id) => {
    if (!window.confirm('Are you sure you want to reject this payment?')) return
    setProcessingId(id)
    try {
      await api.patch(`/api/orders/${id}/reject-manual`)
      notify('Payment rejected', 'warning')
      loadPending()
    } catch (err) {
      notify(err.response?.data?.error || 'Failed to reject payment', 'error')
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payment Verification</h1>
          <p className="text-sm text-gray-500">
            Verify manual UPI and Bank Transfer payments.
          </p>
        </div>
        
        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-2xl border border-gray-200">
          <button
            onClick={() => setTab('pending')}
            className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${tab === 'pending' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Pending
          </button>
          <button
            onClick={() => setTab('history')}
            className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${tab === 'history' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            History
          </button>
          <button
            onClick={() => setTab('bank_setup')}
            className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${tab === 'bank_setup' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Company Bank & QR Setup
          </button>
        </div>
      </div>

      {tab === 'bank_setup' ? (
        <BankSetupPanel
          bankConfig={bankConfig}
          setBankConfig={setBankConfig}
          handleSaveBankConfig={handleSaveBankConfig}
          savingBankConfig={savingBankConfig}
        />
      ) : (
        <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          {tab === 'pending' ? (
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-gray-50/50 border-b border-gray-100 text-gray-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Payment Details</th>
                  <th className="px-6 py-4">Order Info</th>
                  <th className="px-6 py-4">Submitted At</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading && items.length === 0 ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan="5" className="px-6 py-8"><div className="h-4 bg-gray-100 rounded w-full"></div></td>
                    </tr>
                  ))
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-400 italic font-medium">No pending payments to verify.</td>
                  </tr>
                ) : (
                  items.map(o => (
                    <React.Fragment key={o._id}>
                      <tr 
                        className={`group hover:bg-gray-50/50 transition-all cursor-pointer ${expandedId === o._id ? 'bg-gray-50' : ''}`}
                        onClick={() => toggleExpand(o._id)}
                      >
                        <td className="px-6 py-4">
                          <div className="font-bold text-gray-900">{o.customer.name}</div>
                          <div className="text-[11px] text-gray-400 font-medium tracking-tight">{o.customer.phone}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 text-[10px] font-black uppercase">
                                {o.paymentMethod}
                              </span>
                              <span className="font-black text-gray-900">₹{o.manualPayment?.amountPaid?.toLocaleString()}</span>
                            </div>
                            <div className="text-[11px] text-gray-500 font-medium">UTR: <span className="text-gray-900 font-bold">{o.manualPayment?.utr || 'N/A'}</span></div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-xs font-bold text-gray-900">ID: {o._id.toString().slice(-8).toUpperCase()}</div>
                          <div className="text-[10px] text-gray-400 font-bold">{o.items.length} items • ₹{o.totalEstimate.toLocaleString()}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-gray-600 font-medium">{new Date(o.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</div>
                          <div className="text-[10px] text-gray-400">{new Date(o.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <button
                              onClick={(e) => { e.stopPropagation(); approve(o._id); }}
                              disabled={processingId === o._id}
                              className={`flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all shadow-sm border border-emerald-100 group ${processingId === o._id ? 'opacity-50 cursor-not-allowed' : ''}`}
                              title="Verify & Approve"
                            >
                              {processingId === o._id ? (
                                <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); reject(o._id); }}
                              disabled={processingId === o._id}
                              className={`flex items-center justify-center w-10 h-10 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-all shadow-sm border border-rose-100 ${processingId === o._id ? 'opacity-50 cursor-not-allowed' : ''}`}
                              title="Reject Payment"
                            >
                              {processingId === o._id ? (
                                <div className="w-4 h-4 border-2 border-rose-600 border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              )}
                            </button>
                            <div className={`transition-transform duration-300 ${expandedId === o._id ? 'rotate-180' : ''}`}>
                              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                            </div>
                          </div>
                        </td>
                      </tr>
                      {expandedId === o._id && (
                        <tr>
                          <td colSpan="5" className="px-6 py-6 bg-gray-50/50">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-top-2 duration-300">
                              <div className="space-y-4">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Order Items</h4>
                                <div className="space-y-3">
                                  {o.items.map((it, idx) => (
                                    <div key={idx} className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
                                      <div className="w-12 h-12 bg-gray-50 rounded-xl border flex-shrink-0 flex items-center justify-center overflow-hidden">
                                        {it.image ? <img src={it.image} className="w-full h-full object-contain p-1" /> : <span className="text-[8px] text-gray-300 font-bold uppercase">No Img</span>}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="text-xs font-bold text-gray-900 truncate">{it.name}</div>
                                        <div className="text-[10px] text-gray-500 font-medium">Qty: {it.quantity} × ₹{it.price}</div>
                                      </div>
                                      <div className="text-xs font-black text-gray-900">₹{it.lineTotal || (it.price * it.quantity)}</div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div className="space-y-4">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Additional Info</h4>
                                <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                                  <div>
                                    <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Full Order ID</div>
                                    <div className="text-xs font-bold text-gray-900">{o._id}</div>
                                  </div>
                                  {o.notes && (
                                    <div>
                                      <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">User Notes</div>
                                      <div className="text-xs text-gray-600 italic">"{o.notes}"</div>
                                    </div>
                                  )}
                                  {o.manualPayment?.note && (
                                    <div>
                                      <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Payment Note</div>
                                      <div className="text-xs text-gray-600 italic">"{o.manualPayment.note}"</div>
                                    </div>
                                  )}
                                  <div className="pt-2 border-t border-gray-50">
                                    <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Order Total</div>
                                    <div className="text-lg font-black text-blue-600">₹{o.totalEstimate.toLocaleString()}</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-gray-50/50 border-b border-gray-100 text-gray-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-6 py-4">Action At</th>
                  <th className="px-6 py-4">Order / Customer</th>
                  <th className="px-6 py-4">Payment</th>
                  <th className="px-6 py-4">Result</th>
                  <th className="px-6 py-4">Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading && history.length === 0 ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan="5" className="px-6 py-8"><div className="h-4 bg-gray-100 rounded w-full"></div></td>
                    </tr>
                  ))
                ) : history.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-400 italic font-medium">No history found.</td>
                  </tr>
                ) : (
                  history.map(log => (
                    <React.Fragment key={log._id}>
                      <tr 
                        className={`group hover:bg-gray-50/50 transition-all cursor-pointer ${expandedId === log._id ? 'bg-gray-50' : ''}`}
                        onClick={() => toggleExpand(log._id)}
                      >
                        <td className="px-6 py-4">
                          <div className="text-gray-600 font-medium">{new Date(log.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</div>
                          <div className="text-[10px] text-gray-400">{new Date(log.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
                        </td>
                        <td className="px-6 py-4">
                          {log.order ? (
                            <>
                              <div className="font-bold text-gray-900">{log.order.customer.name}</div>
                              <div className="text-[10px] text-gray-500 font-bold">ID: {log.entityId.slice(-8).toUpperCase()}</div>
                            </>
                          ) : (
                            <div className="text-gray-400 italic">Order Deleted</div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {log.order ? (
                            <>
                              <div className="font-black text-gray-900">₹{log.order.manualPayment?.amountPaid?.toLocaleString()}</div>
                              <div className="text-[10px] text-gray-400 font-bold">{log.order.paymentMethod} • UTR: {log.order.manualPayment?.utr}</div>
                            </>
                          ) : '—'}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                            log.note.includes('approved') 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                              : 'bg-rose-50 text-rose-700 border-rose-100'
                          }`}>
                            {log.note.includes('approved') ? 'Approved' : 'Rejected'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Admin ID</div>
                          <div className="text-xs font-bold text-gray-700">{log.actorId.slice(-6).toUpperCase()}</div>
                        </td>
                      </tr>
                      {expandedId === log._id && log.order && (
                        <tr>
                          <td colSpan="5" className="px-6 py-6 bg-gray-50/50">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-top-2 duration-300">
                              <div className="space-y-4">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Items (Snapshot)</h4>
                                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                                  <div className="text-xs text-gray-500">Order ID: {log.entityId}</div>
                                  <div className="mt-2 text-sm font-bold">Total Amount: ₹{log.order.totalEstimate?.toLocaleString()}</div>
                                  <div className="mt-1 text-xs text-gray-400">Payment UTR: {log.order.manualPayment?.utr}</div>
                                </div>
                              </div>
                              <div className="space-y-4">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Action Details</h4>
                                <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                                  <div>
                                    <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">System Note</div>
                                    <div className="text-xs font-bold text-gray-900">{log.note}</div>
                                  </div>
                                  <div>
                                    <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Performed By</div>
                                    <div className="text-xs font-bold text-gray-700">Role: {log.actorRole} (ID: {log.actorId})</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
      )}
    </div>
  )
}

function BankSetupPanel({ bankConfig, setBankConfig, handleSaveBankConfig, savingBankConfig }) {
  return (
    <div className="bg-white border border-gray-100 rounded-[2.5rem] p-6 sm:p-8 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-100 gap-4">
        <div>
          <h2 className="text-lg font-black text-gray-900 tracking-tight">Official Company Bank & QR Setup</h2>
          <p className="text-xs text-gray-500 mt-1 max-w-xl">
            Configure your official company bank account and UPI QR code. When enabled, retailers can pay via NEFT/IMPS/UPI at Checkout, COD Advance, and Credit Repayment.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-xs font-black uppercase tracking-wider text-gray-600 cursor-pointer">
            Direct Bank Transfer
          </label>
          <button
            type="button"
            onClick={() => setBankConfig(prev => ({ ...prev, enabled: !prev.enabled }))}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
              bankConfig.enabled ? 'bg-emerald-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                bankConfig.enabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <span className={`text-xs font-black uppercase ${bankConfig.enabled ? 'text-emerald-600' : 'text-gray-400'}`}>
            {bankConfig.enabled ? 'Active' : 'Disabled'}
          </span>
        </div>
      </div>

      {!bankConfig.enabled && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
          <span className="text-lg">⚠️</span>
          <div className="text-xs text-amber-800 leading-relaxed">
            <strong>Direct Bank Transfer is currently disabled.</strong> Retailers will not see the Direct Bank Transfer / UPI option at checkout, credit repayment, or COD 20% advance payment. Enable this switch and enter details below when you wish to accept manual transfers.
          </div>
        </div>
      )}

      <form onSubmit={handleSaveBankConfig} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Bank Name
            </label>
            <input
              type="text"
              placeholder="e.g. HDFC Bank, ICICI Bank, State Bank of India"
              value={bankConfig.bankName}
              onChange={(e) => setBankConfig(prev => ({ ...prev, bankName: e.target.value }))}
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Account Holder Name
            </label>
            <input
              type="text"
              placeholder="e.g. CLICK2KART PRIVATE LIMITED"
              value={bankConfig.accountHolder}
              onChange={(e) => setBankConfig(prev => ({ ...prev, accountHolder: e.target.value }))}
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Account Number
            </label>
            <input
              type="text"
              placeholder="e.g. 50200012345678"
              value={bankConfig.accountNumber}
              onChange={(e) => setBankConfig(prev => ({ ...prev, accountNumber: e.target.value }))}
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm font-mono font-bold text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              IFSC Code
            </label>
            <input
              type="text"
              placeholder="e.g. HDFC0001234"
              value={bankConfig.ifscCode}
              onChange={(e) => setBankConfig(prev => ({ ...prev, ifscCode: e.target.value.toUpperCase() }))}
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm font-mono font-bold text-gray-900 uppercase outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Branch Name
            </label>
            <input
              type="text"
              placeholder="e.g. Main Branch, Commercial Complex"
              value={bankConfig.branch}
              onChange={(e) => setBankConfig(prev => ({ ...prev, branch: e.target.value }))}
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Official UPI ID / VPA
            </label>
            <input
              type="text"
              placeholder="e.g. click2kart@hdfcbank"
              value={bankConfig.upiId}
              onChange={(e) => setBankConfig(prev => ({ ...prev, upiId: e.target.value }))}
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm font-mono font-bold text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* QR Code Upload & Preview */}
        <div className="pt-4 border-t border-gray-100">
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
            Company UPI QR Code
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
            <div className="space-y-3">
              <ImageUpload
                value={bankConfig.qrCodeUrl}
                onChange={(url) => setBankConfig(prev => ({ ...prev, qrCodeUrl: url }))}
              />
              <p className="text-[11px] text-gray-400">
                Upload your high-resolution UPI QR code image (PNG, JPG, SVG).
              </p>
            </div>
            {bankConfig.qrCodeUrl && (
              <div className="bg-gray-50 border border-gray-200 rounded-3xl p-4 flex flex-col items-center justify-center text-center space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Customer Display Preview</span>
                <img
                  src={bankConfig.qrCodeUrl}
                  alt="UPI QR Code"
                  className="w-48 h-48 object-contain rounded-2xl border border-gray-200 bg-white p-2 shadow-sm"
                />
                <div className="text-xs font-bold text-gray-800">{bankConfig.upiId || 'Scan to Pay'}</div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            type="submit"
            disabled={savingBankConfig}
            className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-blue-200 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {savingBankConfig ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Saving Settings...
              </>
            ) : (
              'Save Bank & QR Settings'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
