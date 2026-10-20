import { useEffect, useState, useMemo } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import api from '../../lib/api'
import { getCloudinaryUrl } from '../../lib/cloudinary'
import { useAuth } from '../../lib/AuthContext'
import { useToast } from '../../components/Toast'

function orderLineProductId(item) {
  const x = item?.product
  if (typeof x === 'string' && /^[a-f\d]{24}$/i.test(x)) return x
  if (x && typeof x === 'object' && x._id) return String(x._id)
  return ''
}

const fmtIST = (d) => new Date(d).toLocaleString('en-IN', {
  timeZone: 'Asia/Kolkata', year: 'numeric', month: 'short', day: 'numeric',
  hour: '2-digit', minute: '2-digit', hour12: true
})
const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', {
  timeZone: 'Asia/Kolkata', month: 'short', day: 'numeric', year: 'numeric'
})

const STATUS_STEPS = ['Placed', 'Processing', 'Packed', 'Shipped', 'Delivered']

function getStatusIndex(order) {
  if (order.status === 'FULFILLED' || order.status === 'DELIVERED') return 4
  if (order.status === 'SHIPPED' || order.shipping?.waybill) return 3
  if (order.status === 'PACKED') return 2
  if (order.status === 'PROCESSING' || order.status === 'CONFIRMED') return 1
  return 0
}

function getStatusBadge(status) {
  switch (status) {
    case 'DELIVERED':
    case 'FULFILLED':
      return {
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        dot: 'bg-emerald-500',
        label: 'Delivered'
      }
    case 'SHIPPED':
    case 'OUT_FOR_DELIVERY':
      return {
        bg: 'bg-amber-50 text-amber-700 border-amber-200',
        dot: 'bg-amber-500 animate-pulse',
        label: status === 'OUT_FOR_DELIVERY' ? 'Out for Delivery' : 'In Transit (Shipped)'
      }
    case 'PACKED':
      return {
        bg: 'bg-blue-50 text-blue-700 border-blue-200',
        dot: 'bg-blue-500',
        label: 'Packed & Ready'
      }
    case 'PROCESSING':
    case 'CONFIRMED':
      return {
        bg: 'bg-violet-50 text-violet-700 border-violet-200',
        dot: 'bg-violet-500 animate-pulse',
        label: 'Processing'
      }
    case 'PENDING_PAYMENT':
      return {
        bg: 'bg-rose-50 text-rose-700 border-rose-200',
        dot: 'bg-rose-500 animate-ping',
        label: 'Payment Pending'
      }
    case 'CANCELLED':
      return {
        bg: 'bg-red-50 text-red-700 border-red-200',
        dot: 'bg-red-500',
        label: 'Cancelled'
      }
    case 'RETURNED':
      return {
        bg: 'bg-slate-100 text-slate-700 border-slate-200',
        dot: 'bg-slate-500',
        label: 'Returned'
      }
    default:
      return {
        bg: 'bg-purple-50 text-purple-700 border-purple-200',
        dot: 'bg-purple-500',
        label: status || 'Placed'
      }
  }
}

function getPaymentMethodDisplay(method) {
  switch (method) {
    case 'CREDIT':
      return { label: 'Trade Credit', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: '💳' }
    case 'RAZORPAY':
      return { label: 'Online (Razorpay)', bg: 'bg-blue-50 text-blue-700 border-blue-200', icon: '⚡' }
    case 'BANK_TRANSFER':
      return { label: 'Bank Transfer / IMPS', bg: 'bg-violet-50 text-violet-700 border-violet-200', icon: '🏛️' }
    case 'CASH':
      return { label: 'Cash / Deposit', bg: 'bg-purple-50 text-purple-700 border-purple-200', icon: '🏦' }
    case 'COD':
    case 'COD_20':
      return { label: method === 'COD_20' ? 'Advance COD (20%)' : 'Cash on Delivery', bg: 'bg-slate-100 text-slate-700 border-slate-200', icon: '💵' }
    default:
      return { label: method || 'Prepaid', bg: 'bg-slate-100 text-slate-700 border-slate-200', icon: '💳' }
  }
}

function getETA(createdAt) {
  const d = new Date(createdAt)
  d.setDate(d.getDate() + 4)
  return d
}

export default function OrderHistory() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState(null)
  const [reviewedProductIds, setReviewedProductIds] = useState(new Set())
  const [cancellingOrder, setCancellingOrder] = useState(null)
  const [cancelReasonOption, setCancelReasonOption] = useState('Ordered by mistake')
  const [cancelCustomReason, setCancelCustomReason] = useState('')
  const [cancellingLoading, setCancellingLoading] = useState(false)
  const [copiedWaybill, setCopiedWaybill] = useState(null)
  const [retryingPaymentId, setRetryingPaymentId] = useState(null)
  
  // Search & Filter state
  const [searchQ, setSearchQ] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL') // 'ALL' | 'ACTIVE' | 'DELIVERED' | 'CANCELLED' | 'CREDIT'

  const navigate = useNavigate()
  const location = useLocation()
  const { user, token } = useAuth()
  const { notify } = useToast()

  const isLocalDeliveryOrder = (o) => {
    if (!o) return false
    if (o.shipping?.waybill) return false
    return o.deliveryChannel === 'LOCAL_DELIVERY'
  }

  const isLocalDispatchedOrAssigned = (o) => {
    if (!isLocalDeliveryOrder(o)) return false
    const ld = o.localDelivery
    if (!ld) return false
    if (ld.dispatchedAt || ld.deliveredAt) return true
    if (ld.status && ['ASSIGNED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(ld.status)) return true
    if (ld.assignedPerson || ld.contactPhone || ld.trackingNumber) return true
    return false
  }

  const handleRetryOrderPayment = async (order) => {
    try {
      setRetryingPaymentId(order._id)
      notify('Initiating payment gateway...', 'info')
      const { data } = await api.post(`/api/orders/${order._id}/retry-payment`)

      const options = {
        key: data.keyId,
        amount: data.amountPaise,
        currency: 'INR',
        name: 'Click2Kart',
        description: `Order #${order._id.slice(-6).toUpperCase()} Payment`,
        order_id: data.razorpayOrderId,
        prefill: {
          name: order.customer?.name,
          email: order.customer?.email,
          contact: order.customer?.phone
        },
        theme: { color: '#7c3aed' },
        handler: async (response) => {
          try {
            notify('Verifying payment with server...', 'info')
            const verifyRes = await api.post('/api/orders/verify-payment', {
              orderId: order._id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            })
            if (verifyRes.data.success) {
              notify('Payment successful! Your order is confirmed.', 'success')
              setOrders(prev => prev.map(o => o._id === order._id ? {
                ...o,
                paymentStatus: 'PAID',
                status: 'CONFIRMED'
              } : o))
            }
          } catch (verErr) {
            notify(verErr?.response?.data?.message || 'Payment received. Server confirmation in progress.', 'warning')
            api.get('/api/orders/my').then(res => setOrders(res.data)).catch(() => {})
          }
        },
        modal: {
          ondismiss: () => {
            setRetryingPaymentId(null)
          }
        }
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (err) {
      notify(err?.response?.data?.message || err?.response?.data?.error || 'Failed to initiate payment', 'error')
    } finally {
      setRetryingPaymentId(null)
    }
  }

  const handleCopyWaybill = (waybill) => {
    if (!waybill) return
    navigator.clipboard.writeText(waybill)
    setCopiedWaybill(waybill)
    notify('AWB Tracking Number copied to clipboard', 'info')
    setTimeout(() => {
      setCopiedWaybill(null)
    }, 2500)
  }

  const canCancelOrder = (order) => {
    if (!order) return false
    if (order.status === 'CANCELLED') return false
    const nonCancellable = ['SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FULFILLED', 'RETURNED']
    if (nonCancellable.includes(order.status)) return false
    if (order.shipping?.waybill) return false
    if (isLocalDeliveryOrder(order) && ['OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.localDelivery?.status)) return false
    return true
  }

  const handleConfirmCancelOrder = async () => {
    if (!cancellingOrder) return
    const finalReason = cancelReasonOption === 'Other'
      ? (cancelCustomReason.trim() || 'Retailer cancellation')
      : cancelReasonOption

    setCancellingLoading(true)
    try {
      const res = await api.post(`/api/orders/${cancellingOrder._id}/cancel`, {
        reason: finalReason
      })
      notify('Order cancelled successfully', 'success')
      setOrders(prev => prev.map(o => {
        if (o._id === cancellingOrder._id) {
          return {
            ...o,
            status: 'CANCELLED',
            cancellation: res.data.order?.cancellation || {
              cancelledBy: 'Retailer',
              reason: finalReason,
              cancelledAt: new Date().toISOString()
            }
          }
        }
        return o
      }))
      setCancellingOrder(null)
      setCancelCustomReason('')
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data?.error || 'Failed to cancel order'
      notify(msg, 'error')
    } finally {
      setCancellingLoading(false)
    }
  }

  const markProductReviewed = (pid) => {
    setReviewedProductIds((prev) => {
      const next = new Set(prev)
      next.add(pid)
      return next
    })
  }

  useEffect(() => {
    if (!token) { navigate('/login', { state: { from: location.pathname + location.search } }); return }
    
    Promise.all([
      api.get('/api/orders/my'),
      api.get('/api/user/reviews/products')
    ]).then(([ordersRes, reviewsRes]) => {
      setOrders(ordersRes.data || [])
      setReviewedProductIds(new Set(reviewsRes.data?.productIds || []))
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [token, navigate])

  // Filtered orders calculation
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      // Status filter
      if (statusFilter === 'ACTIVE') {
        if (!['PROCESSING', 'CONFIRMED', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY'].includes(o.status)) return false
      } else if (statusFilter === 'DELIVERED') {
        if (!['DELIVERED', 'FULFILLED'].includes(o.status)) return false
      } else if (statusFilter === 'CANCELLED') {
        if (o.status !== 'CANCELLED') return false
      } else if (statusFilter === 'CREDIT') {
        if (o.paymentMethod !== 'CREDIT') return false
      }

      // Search query
      if (searchQ.trim()) {
        const q = searchQ.trim().toLowerCase()
        const idMatch = o._id.toLowerCase().includes(q)
        const waybillMatch = o.shipping?.waybill?.toLowerCase().includes(q)
        const cityMatch = o.shippingAddress?.city?.toLowerCase().includes(q)
        const itemMatch = o.items?.some(it => it.name?.toLowerCase().includes(q))
        if (!idMatch && !waybillMatch && !cityMatch && !itemMatch) return false
      }

      return true
    })
  }, [orders, statusFilter, searchQ])

  // Stats calculation
  const stats = useMemo(() => {
    const totalCount = orders.length
    const activeCount = orders.filter(o => ['PROCESSING', 'CONFIRMED', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY'].includes(o.status)).length
    const deliveredCount = orders.filter(o => ['DELIVERED', 'FULFILLED'].includes(o.status)).length
    const totalSpend = orders
      .filter(o => o.status !== 'CANCELLED')
      .reduce((sum, o) => sum + (o.totalEstimate || 0), 0)

    return { totalCount, activeCount, deliveredCount, totalSpend }
  }, [orders])

  /* ── LOADING SKELETON ── */
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/60 py-12 px-4 sm:px-6 max-w-5xl mx-auto space-y-6">
        <div className="h-28 bg-white rounded-3xl border border-slate-200/80 animate-pulse p-6" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 bg-white rounded-2xl border border-slate-200/80 animate-pulse" />
          ))}
        </div>
        <div className="space-y-4 pt-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-44 bg-white rounded-3xl border border-slate-200/80 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50/80 text-slate-900 pb-24 pt-6">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-6">
        
        {/* ── HEADER BANNER ── */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-violet-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-72 h-72 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/10">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-violet-500/20 text-violet-300 border border-violet-400/30">
                  Wholesale Procurement
                </span>
                <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-white/10 text-slate-200 border border-white/15">
                  Welcome Back, {user?.name || 'Partner'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-1">
                Wholesale Order History
              </h1>
              <p className="text-xs text-slate-400 max-w-lg">
                Manage your B2B inventory shipments, live Delhivery tracking, order confirmation receipts, and official GST tax invoices.
              </p>
            </div>

            <div className="flex items-center gap-2.5 self-start md:self-center">
              <button
                type="button"
                onClick={() => navigate('/products')}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-violet-900/30 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <span>🛒 Wholesale Catalogue</span>
              </button>
            </div>
          </div>

          {/* KPI Summary Grid */}
          <div className="relative z-10 pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10 backdrop-blur-xs">
              <div className="text-[10px] uppercase font-black tracking-wider text-slate-400">Total Orders</div>
              <div className="text-2xl font-black text-white mt-1">{stats.totalCount}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Lifetime wholesale POs</div>
            </div>
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10 backdrop-blur-xs">
              <div className="text-[10px] uppercase font-black tracking-wider text-amber-400">In Transit & Active</div>
              <div className="text-2xl font-black text-amber-400 mt-1">{stats.activeCount}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Being packed / delivered</div>
            </div>
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10 backdrop-blur-xs">
              <div className="text-[10px] uppercase font-black tracking-wider text-emerald-400">Delivered</div>
              <div className="text-2xl font-black text-emerald-400 mt-1">{stats.deliveredCount}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Successfully fulfilled</div>
            </div>
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10 backdrop-blur-xs">
              <div className="text-[10px] uppercase font-black tracking-wider text-indigo-300">Procurement Value</div>
              <div className="text-xl sm:text-2xl font-black text-white mt-1">₹{stats.totalSpend.toLocaleString('en-IN')}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Net inventory purchase</div>
            </div>
          </div>
        </div>

        {/* ── SEARCH & FILTER CONTROLS ── */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
            <input
              type="text"
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              placeholder="Search by Order #, Item Name, City, or AWB..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white transition-all"
            />
            {searchQ && (
              <button
                type="button"
                onClick={() => setSearchQ('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {[
              { id: 'ALL', label: 'All Orders', count: orders.length },
              { id: 'ACTIVE', label: 'Active', count: stats.activeCount },
              { id: 'DELIVERED', label: 'Delivered', count: stats.deliveredCount },
              { id: 'CREDIT', label: '💳 Credit Line', count: orders.filter(o => o.paymentMethod === 'CREDIT').length },
              { id: 'CANCELLED', label: 'Cancelled', count: orders.filter(o => o.status === 'CANCELLED').length }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  statusFilter === tab.id
                    ? 'bg-violet-600 text-white shadow-sm shadow-violet-200'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/70'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                  statusFilter === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200/80 text-slate-700'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ── ORDER LIST ── */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 border border-slate-200/80 shadow-xs text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-violet-50 text-violet-600 flex items-center justify-center text-3xl mx-auto shadow-sm">
              📦
            </div>
            <h3 className="font-black text-xl text-slate-900">
              {searchQ || statusFilter !== 'ALL' ? 'No matching wholesale orders found' : 'No orders placed yet'}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchQ || statusFilter !== 'ALL'
                ? 'Try adjusting your search terms or filter selection to find what you are looking for.'
                : 'Browse our complete B2B wholesale catalogue to order FMCG, staples, and products on instant credit.'}
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => { setSearchQ(''); setStatusFilter('ALL'); navigate('/products') }}
                className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-black uppercase tracking-wider shadow-md shadow-violet-200 transition-all cursor-pointer"
              >
                Browse Wholesale Catalogue →
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const isExpanded = expandedId === order._id
              const badge = getStatusBadge(order.status)
              const payment = getPaymentMethodDisplay(order.paymentMethod)
              const statusIdx = getStatusIndex(order)
              const isDelivered = ['DELIVERED', 'FULFILLED'].includes(order.status)
              const isDelhivery = Boolean(order.shipping?.waybill)
              const isLocal = isLocalDeliveryOrder(order)
              const tokenStr = localStorage.getItem('token')

              return (
                <div
                  key={order._id}
                  className={`bg-white rounded-3xl border transition-all duration-200 overflow-hidden shadow-xs hover:shadow-sm ${
                    isExpanded ? 'border-violet-300 ring-2 ring-violet-500/10' : 'border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  {/* Top Order Summary Row */}
                  <div
                    onClick={() => setExpandedId(isExpanded ? null : order._id)}
                    className="p-5 sm:p-6 cursor-pointer bg-white hover:bg-slate-50/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex items-start sm:items-center gap-4 flex-1">
                      {/* Delivery Icon Avatar */}
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0 shadow-xs ${
                        isDelhivery ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                        isLocal ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                        'bg-violet-50 text-violet-600 border border-violet-200'
                      }`}>
                        {isDelhivery ? '🚀' : isLocal ? '🚚' : '📦'}
                      </div>

                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="font-mono font-black text-sm text-slate-900 tracking-tight">
                            #{order._id.slice(-6).toUpperCase()}
                          </span>
                          
                          {/* Status Pill */}
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badge.bg}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                            <span>{badge.label}</span>
                          </span>

                          {/* Payment Method Badge */}
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${payment.bg}`}>
                            <span>{payment.icon}</span>
                            <span>{payment.label}</span>
                          </span>

                          {/* Delivery Route Badge */}
                          {isDelhivery ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                              <span>🚀 Delhivery Express</span>
                            </span>
                          ) : isLocal ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              <span>🚚 Local Express Fleet</span>
                            </span>
                          ) : null}
                        </div>

                        <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                          <span>Placed on <strong>{fmtDate(order.createdAt)}</strong></span>
                          <span>•</span>
                          <span>{order.items?.length || 0} wholesale item{order.items?.length === 1 ? '' : 's'}</span>
                          {order.shippingAddress?.city && (
                            <>
                              <span>•</span>
                              <span>To {order.shippingAddress.city}, {order.shippingAddress.state}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right Price & Actions */}
                    <div className="flex items-center justify-between md:justify-end gap-5 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                      <div className="text-left md:text-right">
                        <div className="text-[10px] uppercase font-bold text-slate-400">Total Order Amount</div>
                        <div className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                          ₹{Number(order.totalEstimate || 0).toLocaleString('en-IN')}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className={`w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-transform ${
                            isExpanded ? 'rotate-180 bg-slate-100' : ''
                          }`}
                        >
                          ▼
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Thumbnail Row Preview (Collapsed Only) */}
                  {!isExpanded && order.items?.length > 0 && (
                    <div className="px-6 pb-4 pt-1 flex items-center gap-2 overflow-x-auto no-scrollbar border-t border-slate-100/60 bg-slate-50/30">
                      {order.items.slice(0, 5).map((it, idx) => (
                        <div
                          key={idx}
                          className="w-10 h-10 rounded-xl bg-white border border-slate-200 p-1 shrink-0 flex items-center justify-center overflow-hidden shadow-2xs"
                          title={`${it.name} (Qty: ${it.quantity})`}
                        >
                          {it.image ? (
                            <img src={getCloudinaryUrl(it.image, 80)} alt={it.name} className="w-full h-full object-contain" />
                          ) : (
                            <span className="text-[10px] font-bold text-slate-400">📦</span>
                          )}
                        </div>
                      ))}
                      {order.items.length > 5 && (
                        <span className="text-[11px] font-bold text-slate-500 pl-1">
                          +{order.items.length - 5} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* ── EXPANDED ORDER DETAILS BODY ── */}
                  {isExpanded && (
                    <div className="p-5 sm:p-7 border-t border-slate-200/80 bg-slate-50/40 space-y-6">
                      
                      {/* Step Progress Tracker */}
                      {order.status !== 'CANCELLED' && (
                        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-black text-slate-800 text-sm">Fulfillment Status Progression</span>
                            <span className="text-violet-700 font-bold">
                              ETA: {fmtDate(getETA(order.createdAt))}
                            </span>
                          </div>
                          
                          <div className="relative pt-3 pb-1">
                            {/* Track line */}
                            <div className="absolute top-5 left-4 right-4 h-1 bg-slate-100 -translate-y-1/2 z-0" />
                            <div
                              className="absolute top-5 left-4 h-1 bg-gradient-to-r from-violet-600 to-indigo-600 -translate-y-1/2 z-0 transition-all duration-500"
                              style={{ width: `${Math.min(100, Math.max(0, (statusIdx / (STATUS_STEPS.length - 1)) * 100))}%` }}
                            />

                            <div className="relative z-10 flex justify-between">
                              {STATUS_STEPS.map((step, idx) => {
                                const isPassed = idx <= statusIdx
                                const isCurrent = idx === statusIdx
                                return (
                                  <div key={step} className="flex flex-col items-center">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                                      isPassed
                                        ? 'bg-violet-600 text-white shadow-md shadow-violet-200'
                                        : 'bg-white border-2 border-slate-200 text-slate-400'
                                    }`}>
                                      {isPassed ? '✓' : idx + 1}
                                    </div>
                                    <span className={`text-[10px] font-black uppercase tracking-wider mt-1.5 ${
                                      isCurrent ? 'text-violet-700' : isPassed ? 'text-slate-800' : 'text-slate-400'
                                    }`}>
                                      {step}
                                    </span>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 2-Column Details: Shipping & Fulfillment info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Delivery Channel / Tracking */}
                        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase font-black tracking-wider text-slate-400">
                              Shipping & Logistics
                            </span>
                            {isDelhivery ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                🚀 Delhivery Surface/Air
                              </span>
                            ) : isLocal ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                🚚 Local Dispatch Fleet
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                                Standard Warehouse Fulfillment
                              </span>
                            )}
                          </div>

                          {isDelhivery && order.shipping?.waybill ? (
                            <div className="p-3.5 bg-amber-50/50 rounded-xl border border-amber-200/80 space-y-2 text-xs">
                              <div className="flex items-center justify-between">
                                <span className="text-amber-900 font-bold">Delhivery AWB Tracking:</span>
                                <button
                                  type="button"
                                  onClick={() => handleCopyWaybill(order.shipping.waybill)}
                                  className="text-[10px] font-black uppercase text-amber-800 hover:underline cursor-pointer"
                                >
                                  {copiedWaybill === order.shipping.waybill ? '✓ Copied' : '📋 Copy AWB'}
                                </button>
                              </div>
                              <div className="font-mono font-bold text-amber-950 text-sm">
                                {order.shipping.waybill}
                              </div>
                              <div className="pt-1">
                                <a
                                  href={`https://www.delhivery.com/track/package/${order.shipping.waybill}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 text-[11px] font-black text-amber-800 hover:text-amber-900 underline"
                                >
                                  <span>Track Live on Delhivery Portal</span>
                                  <span>↗</span>
                                </a>
                              </div>
                            </div>
                          ) : isLocal && isLocalDispatchedOrAssigned(order) ? (
                            <div className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-200/80 space-y-2 text-xs">
                              <div className="font-bold text-emerald-900 flex justify-between">
                                <span>Driver / Courier: {order.localDelivery?.assignedPerson || 'Local Partner'}</span>
                                {order.localDelivery?.status && (
                                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                                    {order.localDelivery.status}
                                  </span>
                                )}
                              </div>
                              {order.localDelivery?.contactPhone && (
                                <div className="text-emerald-800">
                                  Contact: <a href={`tel:${order.localDelivery.contactPhone}`} className="font-mono font-bold underline">{order.localDelivery.contactPhone}</a>
                                </div>
                              )}
                              {order.localDelivery?.trackingNumber && (
                                <div className="text-[11px] text-emerald-700">
                                  Tracking #: <span className="font-mono font-bold">{order.localDelivery.trackingNumber}</span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
                              Order is routed to our central supply hub. Tracking credentials will appear once packed.
                            </div>
                          )}
                        </div>

                        {/* Delivery Destination Address */}
                        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-2 text-xs">
                          <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 block">
                            Delivery Destination Address
                          </span>
                          <div className="font-bold text-slate-900 text-sm">
                            {order.shippingAddress?.fullName || user?.name || 'Retail Business'}
                          </div>
                          <p className="text-slate-600 leading-relaxed">
                            {order.shippingAddress?.line1 || order.shippingAddress?.addressLine1 || 'Registered Store Address'}
                            {(order.shippingAddress?.line2 || order.shippingAddress?.addressLine2) && `, ${order.shippingAddress.line2 || order.shippingAddress.addressLine2}`}
                            {order.shippingAddress?.city && `, ${order.shippingAddress.city}`}
                            {order.shippingAddress?.state && ` - ${order.shippingAddress.state}`}
                            {order.shippingAddress?.pincode && ` (${order.shippingAddress.pincode})`}
                          </p>
                          {order.shippingAddress?.phone && (
                            <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                              Recipient Phone: <strong className="text-slate-800 font-mono">{order.shippingAddress.phone}</strong>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Items Table */}
                      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                        <div className="px-5 py-3.5 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between text-xs">
                          <span className="font-black text-slate-800">Purchased Wholesale Inventory ({order.items?.length || 0})</span>
                          <span className="text-slate-500 font-semibold">Prices inclusive of GST</span>
                        </div>

                        <div className="divide-y divide-slate-100">
                          {order.items?.map((item, idx) => {
                            const pid = orderLineProductId(item)
                            const canRateProduct = isDelivered && Boolean(pid)
                            const alreadyRated = pid && reviewedProductIds.has(pid)

                            return (
                              <div key={idx} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                                  <div
                                    onClick={() => pid && navigate(`/products/${pid}`)}
                                    className={`w-14 h-14 rounded-2xl bg-white border border-slate-200 p-1 shrink-0 flex items-center justify-center overflow-hidden shadow-2xs ${
                                      pid ? 'cursor-pointer hover:border-violet-400' : ''
                                    }`}
                                  >
                                    {item.image ? (
                                      <img src={getCloudinaryUrl(item.image, 120)} alt={item.name} className="w-full h-full object-contain" />
                                    ) : (
                                      <span className="text-lg">📦</span>
                                    )}
                                  </div>

                                  <div className="space-y-0.5 flex-1 min-w-0">
                                    <div
                                      onClick={() => pid && navigate(`/products/${pid}`)}
                                      className={`font-black text-slate-900 text-sm truncate ${
                                        pid ? 'cursor-pointer hover:text-violet-700 hover:underline' : ''
                                      }`}
                                    >
                                      {item.name}
                                    </div>
                                    <div className="text-xs text-slate-500 flex items-center gap-2">
                                      <span>Qty: <strong className="text-slate-800 font-bold">{item.quantity}</strong></span>
                                      <span>•</span>
                                      <span>₹{Number(item.price || 0).toLocaleString('en-IN')} / unit</span>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between sm:justify-end gap-6 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                                  {canRateProduct && (
                                    <div className="flex items-center gap-1.5">
                                      {alreadyRated ? (
                                        <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                                          ✓ Reviewed
                                        </span>
                                      ) : (
                                        <div className="flex items-center gap-1 bg-amber-50/60 px-2.5 py-1 rounded-xl border border-amber-200/80">
                                          <span className="text-[10px] font-bold text-amber-800">Rate:</span>
                                          {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                              key={star}
                                              type="button"
                                              onClick={async () => {
                                                try {
                                                  await api.post(`/api/products/${pid}/reviews`, { rating: star, comment: '' })
                                                  markProductReviewed(pid)
                                                  notify('Thank you for your rating!', 'success')
                                                } catch (err) {
                                                  notify('Unable to save rating right now', 'error')
                                                }
                                              }}
                                              className="text-amber-400 hover:text-amber-500 text-xs cursor-pointer transition-transform hover:scale-125"
                                            >
                                              ★
                                            </button>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  <div className="text-right">
                                    <div className="text-[10px] text-slate-400 font-bold uppercase">Subtotal</div>
                                    <div className="font-black text-slate-900 text-base">
                                      ₹{(Number(item.price || 0) * Number(item.quantity || 1)).toLocaleString('en-IN')}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>

                      {/* Action Bar */}
                      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          {order.paymentStatus === 'PAID' && order.billId && (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  window.open(`${api.defaults.baseURL}/api/bills/${order.billId}/pdf?token=${tokenStr}`, '_blank')
                                }}
                                className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-200 transition cursor-pointer flex items-center gap-1.5"
                              >
                                <span>📄 Download PDF Tax Invoice</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  window.open(`${api.defaults.baseURL}/api/bills/${order.billId}/html?token=${tokenStr}`, '_blank')
                                }}
                                className="px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200 transition cursor-pointer"
                              >
                                View HTML Invoice ↗
                              </button>
                            </>
                          )}

                          <button
                            type="button"
                            onClick={() => navigate(`/order-confirmation/${order._id}`)}
                            className="px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200 transition cursor-pointer flex items-center gap-1.5"
                          >
                            <span>Receipt & Details →</span>
                          </button>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center">
                          {order.paymentStatus !== 'PAID' && order.status !== 'CANCELLED' && (
                            <button
                              type="button"
                              disabled={retryingPaymentId === order._id}
                              onClick={() => handleRetryOrderPayment(order)}
                              className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-violet-200 active:scale-95 transition cursor-pointer"
                            >
                              {retryingPaymentId === order._id ? 'Connecting Gateway…' : `Pay ₹${Number(order.totalEstimate || 0).toLocaleString('en-IN')} Online`}
                            </button>
                          )}

                          {canCancelOrder(order) && (
                            <button
                              type="button"
                              onClick={() => {
                                setCancellingOrder(order)
                                setCancelReasonOption('Ordered by mistake')
                                setCancelCustomReason('')
                              }}
                              className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 transition cursor-pointer"
                            >
                              Cancel Order
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* ── CANCELLATION MODAL ── */}
        {cancellingOrder && (
          <div
            className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setCancellingOrder(null)}
          >
            <div
              className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-5 animate-scale-up"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center text-xl shrink-0">
                    ⚠️
                  </div>
                  <div>
                    <h3 className="font-black text-lg text-slate-900">Cancel Wholesale Order</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Order #{cancellingOrder._id.slice(-6).toUpperCase()} • ₹{Number(cancellingOrder.totalEstimate || 0).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCancellingOrder(null)}
                  className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs text-slate-700 space-y-1.5">
                <p>Are you sure you want to cancel this wholesale order? Allocated inventory will be returned to stock.</p>
                {cancellingOrder.paymentMethod === 'CREDIT' && (
                  <p className="font-bold text-emerald-700 pt-1 border-t border-slate-200/60">
                    ✓ The ₹{Number(cancellingOrder.totalEstimate || 0).toLocaleString('en-IN')} credit utilized will be restored instantly to your available Trade Credit balance.
                  </p>
                )}
              </div>

              <div className="space-y-2 text-xs">
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Reason for Cancellation
                </label>
                {[
                  'Ordered by mistake',
                  'Found a better alternative / price',
                  'Need to change items or delivery address',
                  'Expected faster dispatch',
                  'Other'
                ].map((opt) => (
                  <label
                    key={opt}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border transition cursor-pointer ${
                      cancelReasonOption === opt ? 'border-violet-600 bg-violet-50/60' : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="cancelReason"
                      checked={cancelReasonOption === opt}
                      onChange={() => setCancelReasonOption(opt)}
                      className="accent-violet-600"
                    />
                    <span className="font-semibold text-slate-800">{opt}</span>
                  </label>
                ))}

                {cancelReasonOption === 'Other' && (
                  <textarea
                    value={cancelCustomReason}
                    onChange={(e) => setCancelCustomReason(e.target.value)}
                    placeholder="Please specify reason for cancellation..."
                    rows={2}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white"
                  />
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCancellingOrder(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-100 transition cursor-pointer"
                >
                  Keep Order
                </button>
                <button
                  type="button"
                  disabled={cancellingLoading}
                  onClick={handleConfirmCancelOrder}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-rose-200 transition cursor-pointer disabled:opacity-50"
                >
                  {cancellingLoading ? 'Cancelling…' : 'Confirm Cancel'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}