import React, { Fragment, useEffect, useState } from 'react'
import api from '../../lib/api'
import { io } from 'socket.io-client'
import { useToast } from '../../components/Toast'

export default function Orders(){
  const { notify } = useToast()
  const [items, setItems] = useState([])
  const [status, setStatus] = useState('')
  const [billQuery, setBillQuery] = useState('')
  const [billResults, setBillResults] = useState([])
  const [page, setPage] = useState(1)
  const [expandedId, setExpandedId] = useState(null)
  const limit = 20
  const [loading, setLoading] = useState(false)
  const [sendingId, setSendingId] = useState('')
  const [shipOpen, setShipOpen] = useState(null)
  const [shipForm, setShipForm] = useState({ provider:'', waybill:'', trackingUrl:'' })

  // Delhivery LTL state
  const [delhiveryLabelOpen, setDelhiveryLabelOpen] = useState(null)
  const [labelSize, setLabelSize] = useState('std')
  const [pickupOpen, setPickupOpen] = useState(null)
  const [pickupForm, setPickupForm] = useState({ client_warehouse:'', pickup_date:'', start_time:'09:00:00', expected_package_count:1 })
  const [lrnForm, setLrnForm] = useState({ orderId: null, lrn: '' })
  const [lrnOpen, setLrnOpen] = useState(null)

  const load = async(p=1)=>{ 
    setLoading(true)
    try { const {data}=await api.get('/api/orders',{params:{status:status||undefined,page:p,limit}}); setItems(data.items||[]); setPage(p) }
    finally { setLoading(false) }
  }

  // Delhivery LTL actions
  const cancelDelhiveryShipment = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this Delhivery shipment?')) return
    try {
      await api.delete(`/api/orders/${id}/delhivery/cancel`)
      notify('Shipment cancelled successfully', 'success')
      load(page)
    } catch (err) {
      notify(err.response?.data?.error || 'Failed to cancel shipment', 'error')
    }
  }

  const getDelhiveryLabels = async (id, size) => {
    try {
      const { data } = await api.get(`/api/orders/${id}/delhivery/labels`, { params: { size } })
      if (data && data.length > 0) {
        data.forEach(url => window.open(url, '_blank'))
        notify('Labels generated successfully', 'success')
      } else {
        notify('No label URLs returned', 'warning')
      }
    } catch (err) {
      notify(err.response?.data?.error || 'Failed to get labels', 'error')
    }
  }

  const createDelhiveryPickup = async (id) => {
    try {
      await api.post(`/api/orders/${id}/delhivery/pickup`, pickupForm)
      notify('Pickup request created successfully', 'success')
      setPickupOpen(null)
      load(page)
    } catch (err) {
      notify(err.response?.data?.error || 'Failed to create pickup request', 'error')
    }
  }

  const cancelDelhiveryPickup = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this pickup request?')) return
    try {
      await api.delete(`/api/orders/${id}/delhivery/pickup`)
      notify('Pickup request cancelled successfully', 'success')
      load(page)
    } catch (err) {
      notify(err.response?.data?.error || 'Failed to cancel pickup', 'error')
    }
  }

  const saveLrn = async () => {
    try {
      await api.patch(`/api/orders/${lrnForm.orderId}/status`, { lrn: lrnForm.lrn })
      notify('LRN saved successfully', 'success')
      setLrnOpen(null)
      load(page)
    } catch (err) {
      notify('Failed to save LRN', 'error')
    }
  }

  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000');
    
    socket.on('connect', () => {
      socket.emit('join_admin');
    });

    socket.on('new_offline_order', (order) => {
      notify(`New Offline Payment Request from ${order.customer.name}`, 'info');
      load(page); // Reload the current page to show the new order
      
      // Play a notification sound
      try {
        const audio = new Audio('/notification.mp3');
        audio.play();
      } catch (err) {
        console.log('Audio playback blocked');
      }
    });

    return () => socket.disconnect();
  }, [page]);

  useEffect(()=>{ load(1) }, [status])
  const update = async(id, s)=>{ await api.patch(`/api/orders/${id}/status`, { status: s }); load(page) }
  const approveCash = async(id)=>{ await api.patch(`/api/orders/${id}/approve-cash`); load(page) }
  const toggle = (id) => setExpandedId(expandedId === id ? null : id)
  const sendInvoice = async (billId) => {
    try {
      setSendingId(billId)
      await api.post(`/api/bills/${billId}/send-email`)
      notify('Invoice email sent to customer', 'success')
    } catch (err) {
      notify(err?.response?.data?.error || 'Failed to send invoice email', 'error')
    } finally {
      setSendingId('')
    }
  }
  const searchBills = async () => {
    if (!billQuery.trim()) { setBillResults([]); return }
    try {
      const { data } = await api.get('/api/bills/search', { params: { q: billQuery } })
      setBillResults(data || [])
    } catch {
      setBillResults([])
    }
  }
  return (
    <>
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-500">
            Manage your store orders and track customer purchases.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              className="appearance-none bg-white border border-gray-200 text-gray-900 text-sm rounded-xl pl-4 pr-10 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm transition-all"
              value={status}
              onChange={e => setStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="NEW">New</option>
              <option value="PENDING_CASH_APPROVAL">Pending Cash Approval</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="FULFILLED">Fulfilled</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
          <div className="relative">
            <input
              className="bg-white border border-gray-200 text-gray-900 text-sm rounded-xl pl-10 pr-4 py-2.5 w-64 outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all"
              placeholder="Search invoice no..."
              value={billQuery}
              onChange={e => setBillQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && searchBills()}
            />
            <svg className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          <button
            onClick={searchBills}
            className="px-4 py-2.5 rounded-xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest"
          >
            Search
          </button>
        </div>
      </div>
      {billResults.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm p-4">
          <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Invoice Results</div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {billResults.map(b => (
              <div key={b._id} className="border rounded-2xl p-3 flex items-center justify-between">
                <div>
                  <div className="text-sm font-black text-gray-900">{b.invoiceNumber}</div>
                  <div className="text-[10px] text-gray-500">{b.customer?.name} • ₹{(b.payable || b.total).toLocaleString()}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const token = localStorage.getItem('token');
                      window.open(`${api.defaults.baseURL}/api/bills/${b._id}/pdf?token=${token}`, '_blank');
                    }}
                    className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"
                    title="View PDF"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  </button>
                  <button
                    onClick={() => {
                      const token = localStorage.getItem('token');
                      window.open(`${api.defaults.baseURL}/api/bills/${b._id}/html?token=${token}`, '_blank');
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                    title="View HTML"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7h18M3 12h18M3 17h18" /></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-gray-50/50 border-b border-gray-100 text-gray-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="5" className="px-6 py-8"><div className="h-4 bg-gray-100 rounded w-full"></div></td>
                  </tr>
                ))
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-400 italic font-medium">No orders found.</td>
                </tr>
              ) : (
                items.map(o => {
                  const isExpanded = expandedId === o._id;
                  const statusColors = {
                    FULFILLED: 'bg-emerald-50 text-emerald-700 border-emerald-100',
                    CANCELLED: 'bg-red-50 text-red-700 border-red-100',
                    CONFIRMED: 'bg-blue-50 text-blue-700 border-blue-100',
                    NEW: 'bg-amber-50 text-amber-700 border-amber-100',
                    PENDING_CASH_APPROVAL: 'bg-purple-50 text-purple-700 border-purple-100'
                  };
                  return (
                    <Fragment key={o._id}>
                      <tr 
                        className={`group hover:bg-gray-50/50 transition-all cursor-pointer ${isExpanded ? 'bg-gray-50/80' : ''}`}
                        onClick={() => toggle(o._id)}
                      >
                        <td className="px-6 py-4">
                          <div className="font-bold text-gray-900">{o.customer.name}</div>
                          <div className="text-[11px] text-gray-400 font-medium tracking-tight">{o.customer.phone}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${statusColors[o.status] || 'bg-gray-50 text-gray-600'}`}>
                            {o.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-black text-gray-900">₹{o.totalEstimate.toLocaleString()}</div>
                          <div className="text-[10px] text-gray-400 font-bold">{o.items.length} items</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-gray-600 font-medium">{new Date(o.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</div>
                          <div className="text-[10px] text-gray-400">{new Date(o.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {o.paymentStatus === 'PAID' && o.billId && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const token = localStorage.getItem('token');
                                  window.open(`${api.defaults.baseURL}/api/bills/${o.billId}/pdf?token=${token}`, '_blank');
                                }}
                                className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"
                                title="View Bill"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                              </button>
                            )}
                            {o.paymentStatus === 'PAID' && o.billId && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const token = localStorage.getItem('token');
                                  window.open(`${api.defaults.baseURL}/api/bills/${o.billId}/html?token=${token}`, '_blank');
                                }}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                                title="View HTML Invoice"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7h18M3 12h18M3 17h18" /></svg>
                              </button>
                            )}
                            {o.paymentStatus === 'PAID' && o.billId && (
                              <button
                                onClick={(e) => { e.stopPropagation(); sendInvoice(o.billId) }}
                                disabled={sendingId === o.billId}
                                className="p-2 text-violet-700 hover:bg-violet-50 rounded-xl transition-colors disabled:opacity-50"
                                title="Send Invoice Email"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                              </button>
                            )}
                            <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                            </div>
                          </div>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr>
                          <td colSpan="5" className="px-6 py-6 bg-gray-50/30">
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
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Payment & Actions</h4>
                                <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                      <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Method</div>
                                      <div className="flex items-center gap-2">
                                        <span className="text-lg">{o.paymentMethod === 'CASH' ? '💼' : '💳'}</span>
                                        <span className="text-xs font-black text-gray-900">
                                          {o.paymentMethod === 'CASH' ? 'Offline Payment' : 'Online Payment'}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="space-y-1">
                                      <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Payment Status</div>
                                      <div className={`text-xs font-black uppercase tracking-widest ${o.paymentStatus === 'PAID' ? 'text-emerald-600' : 'text-amber-600'}`}>
                                        {o.paymentStatus}
                                      </div>
                                    </div>
                                  </div>

                                  {o.paymentMethod === 'CASH' && o.status === 'PENDING_CASH_APPROVAL' && (
                                    <div className="space-y-3">
                                      <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 text-[11px] text-amber-700 font-medium">
                                        User has requested an Offline/Manual Payment. Please verify the payment before approving.
                                      </div>
                                      <div className="grid grid-cols-2 gap-3">
                                        <button 
                                          onClick={(e) => { e.stopPropagation(); approveCash(o._id); }}
                                          className="bg-emerald-600 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-100 hover:bg-emerald-500 transition-all transform hover:-translate-y-0.5"
                                        >
                                          Approve & Confirm
                                        </button>
                                        <button 
                                          onClick={(e) => { e.stopPropagation(); update(o._id, 'CANCELLED'); }}
                                          className="bg-red-50 text-red-600 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-red-100 hover:bg-red-100 transition-all"
                                        >
                                          Decline & Cancel
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                  {o.paymentMethod === 'COD_20' && o.paymentStatus === 'PARTIAL' && (
                                    <button 
                                      onClick={(e) => { 
                                        e.stopPropagation(); 
                                        api.patch(`/api/orders/${o._id}/finalize-cod`).then(()=>{ notify('COD finalized & bill generated','success'); load(page) }).catch(()=>notify('Finalize failed','error'))
                                      }}
                                      className="w-full bg-blue-600 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-100 hover:bg-blue-500 transition-all transform hover:-translate-y-0.5"
                                    >
                                      Finalize COD & Generate Bill
                                    </button>
                                  )}

                                  <div className="space-y-2">
                                    <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Real-World Flow</div>
                                    <div className="grid grid-cols-2 gap-2">
                                      <button
                                        onClick={(e)=>{ e.stopPropagation(); update(o._id, 'CONFIRMED').then(()=>notify('Order confirmed','success')).catch(()=>notify('Failed to confirm','error')) }}
                                        disabled={o.status==='CONFIRMED' || o.status==='FULFILLED' || o.status==='CANCELLED'}
                                        className="px-4 py-2 rounded-xl text-[10px] font-bold border bg-white hover:bg-gray-50 disabled:opacity-40"
                                      >
                                        Confirm
                                      </button>
                                      <button
                                        onClick={(e)=>{ e.stopPropagation(); api.patch(`/api/orders/${o._id}/pack`).then(()=>{ notify('Marked as Packed','success'); load(page) }).catch(()=>notify('Failed to update','error')) }}
                                        disabled={o.status==='CANCELLED' || o.status==='FULFILLED' || (o.status!=='CONFIRMED' && o.paymentMethod!=='CASH' && o.paymentMethod!=='RAZORPAY')}
                                        className="px-4 py-2 rounded-xl text-[10px] font-bold border bg-white hover:bg-gray-50 disabled:opacity-40"
                                      >
                                        Mark Packed
                                      </button>
                                      <button
                                        onClick={(e)=>{ e.stopPropagation(); setShipOpen(o._id); setShipForm({ provider:o.shipping?.provider||'', waybill:o.shipping?.waybill||'', trackingUrl:o.shipping?.trackingUrl||'' }) }}
                                        disabled={o.status==='CANCELLED' || o.status==='FULFILLED'}
                                        className="px-4 py-2 rounded-xl text-[10px] font-bold border bg-white hover:bg-gray-50 disabled:opacity-40"
                                      >
                                        Create Shipment
                                      </button>
                                      <button
                                        onClick={(e)=>{ e.stopPropagation(); api.patch(`/api/orders/${o._id}/deliver`).then(()=>{ notify('Marked Delivered','success'); load(page) }).catch(()=>notify('Failed to update','error')) }}
                                        disabled={o.status==='CANCELLED' || o.status==='FULFILLED'}
                                        className="px-4 py-2 rounded-xl text-[10px] font-bold border bg-white hover:bg-gray-50 disabled:opacity-40"
                                      >
                                        Mark Delivered
                                      </button>
                                      <button
                                        onClick={(e)=>{ e.stopPropagation(); update(o._id, 'CANCELLED').then(()=>notify('Order cancelled','success')).catch(()=>notify('Failed to cancel','error')) }}
                                        disabled={o.status==='FULFILLED' || o.status==='CANCELLED'}
                                        className="px-4 py-2 rounded-xl text-[10px] font-bold border bg-white hover:bg-gray-50 disabled:opacity-40 col-span-2"
                                      >
                                        Cancel Order
                                      </button>
                                    </div>
                                  </div>

                                  {/* Delhivery LTL Actions */}
                                  <div className="space-y-2 pt-2 border-t border-gray-100">
                                    <div className="text-[9px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2">
                                      <span className="w-4 h-px bg-indigo-200" />
                                      Delhivery LTL Shipping
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                      <button
                                        onClick={(e)=>{ e.stopPropagation(); setLrnForm({ orderId: o._id, lrn: o.lrn || '' }); setLrnOpen(o._id) }}
                                        className="px-4 py-2 rounded-xl text-[10px] font-bold border bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
                                      >
                                        {o.lrn ? 'Update LRN' : 'Add LRN'}
                                      </button>
                                      
                                      <button
                                        onClick={(e)=>{ e.stopPropagation(); setDelhiveryLabelOpen(o._id) }}
                                        disabled={!o.lrn}
                                        className="px-4 py-2 rounded-xl text-[10px] font-bold border bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors disabled:opacity-40"
                                      >
                                        Generate Labels
                                      </button>

                                      {!o.pickup_id ? (
                                        <button
                                          onClick={(e)=>{ e.stopPropagation(); setPickupOpen(o._id); setPickupForm({...pickupForm, pickup_date: new Date().toISOString().split('T')[0]}) }}
                                          className="px-4 py-2 rounded-xl text-[10px] font-bold border bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
                                        >
                                          Request Pickup
                                        </button>
                                      ) : (
                                        <button
                                          onClick={(e)=>{ e.stopPropagation(); cancelDelhiveryPickup(o._id) }}
                                          className="px-4 py-2 rounded-xl text-[10px] font-bold border bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors"
                                        >
                                          Cancel Pickup
                                        </button>
                                      )}

                                      <button
                                        onClick={(e)=>{ e.stopPropagation(); cancelDelhiveryShipment(o._id) }}
                                        disabled={!o.lrn}
                                        className="px-4 py-2 rounded-xl text-[10px] font-bold border bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors disabled:opacity-40"
                                      >
                                        Cancel Shipment
                                      </button>
                                    </div>
                                    {o.lrn && (
                                      <div className="text-[10px] font-bold text-indigo-600 bg-indigo-50/50 px-3 py-1.5 rounded-lg border border-indigo-100">
                                        LRN: {o.lrn} {o.pickup_id && `• Pickup: ${o.pickup_id}`}
                                      </div>
                                    )}
                                  </div>
                                  {(o.shipping?.provider || o.shipping?.status || o.shipping?.waybill) && (
                                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                      <div className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">Fulfillment</div>
                                      <div className="text-[12px] text-gray-700 font-medium">
                                        {o.shipping?.status || '—'} • {o.shipping?.provider || '—'} • {o.shipping?.waybill || '—'}
                                      </div>
                                      {o.shipping?.trackingUrl && (
                                        <a href={o.shipping.trackingUrl} target="_blank" rel="noreferrer" className="text-[11px] text-blue-600 font-bold">Track</a>
                                      )}
                                    </div>
                                  )}
                                  {o.notes && (
                                    <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100/50">
                                      <div className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1">Notes</div>
                                      <div className="text-[11px] text-blue-700 font-medium italic">"{o.notes}"</div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    {shipOpen && (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={()=>setShipOpen(null)}>
        <div onClick={(e)=>e.stopPropagation()} className="bg-white rounded-3xl p-6 w-full max-w-md border border-gray-100 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-black uppercase tracking-widest text-gray-500">Create Shipment</div>
            <button onClick={()=>setShipOpen(null)} className="h-8 w-8 rounded-lg bg-gray-50 border border-gray-100">
              <svg className="w-4 h-4 m-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <div className="space-y-3">
            <input className="w-full bg-gray-50 border rounded-xl px-4 py-3 text-sm font-bold" placeholder="Provider (e.g., Delhivery, Bluedart)" value={shipForm.provider} onChange={e=>setShipForm({...shipForm, provider:e.target.value})} />
            <input className="w-full bg-gray-50 border rounded-xl px-4 py-3 text-sm font-bold" placeholder="Waybill / AWB" value={shipForm.waybill} onChange={e=>setShipForm({...shipForm, waybill:e.target.value})} />
            <input className="w-full bg-gray-50 border rounded-xl px-4 py-3 text-sm font-bold" placeholder="Tracking URL (optional)" value={shipForm.trackingUrl} onChange={e=>setShipForm({...shipForm, trackingUrl:e.target.value})} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={()=>setShipOpen(null)} className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 text-sm font-bold">Cancel</button>
            <button
              onClick={async ()=> {
                try {
                  await api.patch(`/api/orders/${shipOpen}/ship`, shipForm)
                  notify('Shipment created','success'); setShipOpen(null); setShipForm({ provider:'', waybill:'', trackingUrl:'' }); load(page)
                } catch { notify('Failed to create shipment','error') }
              }}
              disabled={!shipForm.provider || !shipForm.waybill}
              className="px-4 py-2 rounded-xl bg-gray-900 text-white text-sm font-bold disabled:opacity-40"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Delhivery LRN Modal */}
    {lrnOpen && (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={()=>setLrnOpen(null)}>
        <div onClick={(e)=>e.stopPropagation()} className="bg-white rounded-3xl p-6 w-full max-w-md border border-gray-100 shadow-xl space-y-4">
          <div className="text-sm font-black uppercase tracking-widest text-indigo-600">Enter Delhivery LRN</div>
          <input 
            className="w-full bg-gray-50 border rounded-xl px-4 py-3 text-sm font-bold" 
            placeholder="LR Number (e.g., 220110457)" 
            value={lrnForm.lrn} 
            onChange={e=>setLrnForm({...lrnForm, lrn: e.target.value})} 
          />
          <div className="flex justify-end gap-2">
            <button onClick={()=>setLrnOpen(null)} className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 text-sm font-bold">Cancel</button>
            <button onClick={saveLrn} className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-bold">Save LRN</button>
          </div>
        </div>
      </div>
    )}

    {/* Delhivery Label Modal */}
    {delhiveryLabelOpen && (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={()=>setDelhiveryLabelOpen(null)}>
        <div onClick={(e)=>e.stopPropagation()} className="bg-white rounded-3xl p-6 w-full max-w-md border border-gray-100 shadow-xl space-y-4">
          <div className="text-sm font-black uppercase tracking-widest text-indigo-600">Select Label Size</div>
          <div className="grid grid-cols-2 gap-2">
            {[
              {v:'std', l:'Standard (3"x2")'},
              {v:'sm', l:'Small (4"x2")'},
              {v:'md', l:'Medium (4"x2.5")'},
              {v:'a4', l:'A4 Sheet'}
            ].map(s => (
              <button 
                key={s.v}
                onClick={()=>setLabelSize(s.v)}
                className={`px-4 py-3 rounded-xl text-xs font-bold border transition-all ${labelSize === s.v ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-gray-50 text-gray-700 border-gray-200'}`}
              >
                {s.l}
              </button>
            ))}
          </div>
          <button 
            onClick={()=> { getDelhiveryLabels(delhiveryLabelOpen, labelSize); setDelhiveryLabelOpen(null) }}
            className="w-full bg-indigo-600 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest"
          >
            Download Labels
          </button>
        </div>
      </div>
    )}

    {/* Delhivery Pickup Modal */}
    {pickupOpen && (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={()=>setPickupOpen(null)}>
        <div onClick={(e)=>e.stopPropagation()} className="bg-white rounded-3xl p-8 w-full max-w-lg border border-gray-100 shadow-2xl space-y-6">
          <div>
            <h3 className="text-lg font-black text-gray-900">Request Delhivery Pickup</h3>
            <p className="text-xs text-gray-500 font-medium">Schedule a pickup for your manifested shipments.</p>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Warehouse Name</label>
              <input 
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500" 
                placeholder="e.g., Main Warehouse" 
                value={pickupForm.client_warehouse} 
                onChange={e=>setPickupForm({...pickupForm, client_warehouse: e.target.value})} 
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pickup Date</label>
                <input 
                  type="date"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500" 
                  value={pickupForm.pickup_date} 
                  onChange={e=>setPickupForm({...pickupForm, pickup_date: e.target.value})} 
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Start Time</label>
                <input 
                  type="time"
                  step="1"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500" 
                  value={pickupForm.start_time} 
                  onChange={e=>setPickupForm({...pickupForm, start_time: e.target.value})} 
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Expected Package Count</label>
              <input 
                type="number"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500" 
                value={pickupForm.expected_package_count} 
                onChange={e=>setPickupForm({...pickupForm, expected_package_count: e.target.value})} 
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={()=>setPickupOpen(null)} className="flex-1 py-4 rounded-2xl bg-gray-100 text-gray-700 text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 transition-all">Cancel</button>
            <button 
              onClick={()=>createDelhiveryPickup(pickupOpen)} 
              disabled={!pickupForm.client_warehouse || !pickupForm.pickup_date}
              className="flex-1 py-4 rounded-2xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-500 transition-all disabled:opacity-40"
            >
              Request Pickup
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  )
}
