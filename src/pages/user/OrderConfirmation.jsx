import React, { useEffect, useState, useMemo } from 'react'
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom'
import { useAuth } from '../../lib/AuthContext'
import { useCart } from '../../lib/CartContext'
import api from '../../lib/api'
import { useToast } from '../../components/Toast'
import { getCloudinaryUrl } from '../../lib/cloudinary'

export default function OrderConfirmation() {
  const { orderId } = useParams()
  const { state } = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { clearCart } = useCart()
  const { notify } = useToast()

  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [copiedId, setCopiedId] = useState(false)
  const [copiedUtr, setCopiedUtr] = useState(false)
  const [copiedWaybill, setCopiedWaybill] = useState(false)

  // Determine target order ID from params or router state
  const targetId = orderId || state?.orderId

  // Explicit failure check from state or URL query
  const queryParams = new URLSearchParams(window.location.search)
  const isExplicitFailed = state?.status === 'FAILED' || queryParams.get('status') === 'failed'
  const failureReason = state?.reason || queryParams.get('reason') || 'Your payment was not completed or was cancelled.'

  useEffect(() => {
    // If order was successful or submitted, ensure cart is cleared
    if (!isExplicitFailed) {
      try {
        clearCart()
      } catch (e) {
        console.error('Error clearing cart:', e)
      }
    }
  }, [isExplicitFailed, clearCart])

  useEffect(() => {
    let active = true

    if (isExplicitFailed && !targetId) {
      setLoading(false)
      return
    }

    if (!targetId) {
      // If neither failed nor valid target ID, redirect to orders or home
      setLoading(false)
      return
    }

    const fetchOrder = async () => {
      try {
        setLoading(true)
        const { data } = await api.get(`/api/orders/my/${targetId}`)
        if (active) setOrder(data)
      } catch (err) {
        console.warn('Customer order lookup failed, trying fallback:', err)
        try {
          const { data } = await api.get(`/api/orders/${targetId}`)
          if (active) setOrder(data)
        } catch (adminErr) {
          if (active && !isExplicitFailed) {
            notify('Unable to load order receipt', 'error')
          }
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    fetchOrder()

    return () => {
      active = false
    }
  }, [targetId, isExplicitFailed, notify])

  const copyToClipboard = (text, type) => {
    if (!text) return
    try {
      navigator.clipboard.writeText(text)
      if (type === 'id') {
        setCopiedId(true)
        setTimeout(() => setCopiedId(false), 2000)
        notify('Order ID copied to clipboard!', 'info')
      } else if (type === 'utr') {
        setCopiedUtr(true)
        setTimeout(() => setCopiedUtr(false), 2000)
        notify('UTR number copied!', 'info')
      } else if (type === 'waybill') {
        setCopiedWaybill(true)
        setTimeout(() => setCopiedWaybill(false), 2000)
        notify('Waybill number copied!', 'info')
      }
    } catch {
      notify('Failed to copy', 'error')
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  const getEstimatedDelivery = (dateStr) => {
    const base = dateStr ? new Date(dateStr) : new Date()
    const start = new Date(base)
    start.setDate(start.getDate() + 3)
    const end = new Date(base)
    end.setDate(end.getDate() + 5)

    const opt = { weekday: 'short', day: 'numeric', month: 'short' }
    return `${start.toLocaleDateString('en-IN', opt)} – ${end.toLocaleDateString('en-IN', opt)}`
  }

  const handlePrint = () => {
    window.print()
  }

  // Derive order status details
  const isFailed = isExplicitFailed || order?.status === 'CANCELLED' || order?.paymentStatus === 'FAILED'
  const isPendingApproval = order?.status === 'PENDING_ADMIN_APPROVAL' || order?.paymentStatus === 'PAYMENT_SUBMITTED' || state?.isManual
  const isCredit = order?.paymentMethod === 'CREDIT' || state?.paymentMethod === 'CREDIT'
  const isCod = order?.paymentMethod === 'COD_20' || order?.paymentMethod === 'COD' || order?.codAdvancePercent > 0
  const isRazorpay = order?.paymentMethod === 'RAZORPAY'

  const waybill = order?.shipping?.waybill || order?.delhiveryWaybill || order?.awb_number
  const isLocalDelivery = order?.deliveryChannel === 'LOCAL_DELIVERY'

  // Timeline computation
  const getTimelineProgress = () => {
    const s = String(order?.status || '').toUpperCase()
    if (s === 'DELIVERED' || s === 'FULFILLED') return { index: 4, width: '100%', label: 'Delivered' }
    if (s === 'OUT_FOR_DELIVERY') return { index: 3, width: '75%', label: 'Out for Delivery' }
    if (s === 'SHIPPED') return { index: 2, width: '50%', label: 'Shipped' }
    if (['CONFIRMED', 'PACKED', 'PROCESSING'].includes(s)) return { index: 1, width: '25%', label: 'Confirmed' }
    if (s === 'PENDING_ADMIN_APPROVAL') return { index: 0, width: '10%', label: 'Verification' }
    return { index: 0, width: '10%', label: 'Order Placed' }
  }
  const progress = getTimelineProgress()

  // Calculated amounts
  const totalAmount = Number(order?.totalEstimate || state?.amount || 0)
  const advancePaid = isCod
    ? (order?.advancePaidAmount || Math.round(totalAmount * 0.2))
    : (isCredit ? 0 : totalAmount)
  const balanceDue = isCod
    ? (order?.codDueAmount || Math.round(totalAmount * 0.8))
    : 0

  // Buyer Info Resolution
  const buyer = useMemo(() => {
    const b = order?.buyerDetails || {}
    const c = order?.customer || {}
    const u = user || {}
    return {
      name: b.name || c.name || u.name || 'Valued Retailer',
      businessName: b.businessName || u.kyc?.businessName || '',
      phone: b.phone || c.phone || u.phone || '',
      whatsappNumber: b.whatsappNumber || u.whatsappNumber || b.phone || c.phone || '',
      email: b.email || c.email || u.email || '',
      gstin: b.gstin || u.kyc?.gstin || '',
      pan: b.pan || u.kyc?.pan || ''
    }
  }, [order, user])

  // Shipping Address Resolution
  const shippingAddress = useMemo(() => {
    const a = order?.shippingAddress || {}
    const uKyc = user?.kyc || {}
    return {
      line1: a.line1 || uKyc.addressLine1 || user?.address || '',
      line2: a.line2 || uKyc.addressLine2 || '',
      city: a.city || uKyc.city || '',
      state: a.state || uKyc.state || '',
      pincode: a.pincode || uKyc.pincode || ''
    }
  }, [order, user])

  /* ── 1. LOADING STATE ── */
  if (loading) {
    return (
      <div className="oc-screen-loading">
        <style>{`
          .oc-screen-loading {
            min-height: 80vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: #f8fafc;
            font-family: 'DM Sans', system-ui, sans-serif;
            color: #475569;
          }
          .oc-spinner {
            width: 52px;
            height: 52px;
            border: 4px solid rgba(124, 58, 237, 0.12);
            border-top: 4px solid #7c3aed;
            border-radius: 50%;
            animation: ocSpin 0.9s cubic-bezier(0.5, 0.1, 0.4, 0.9) infinite;
            margin-bottom: 20px;
          }
          @keyframes ocSpin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
        <div className="oc-spinner"></div>
        <h2 className="text-lg font-bold text-slate-800">Generating Your Order Receipt...</h2>
        <p className="text-sm text-slate-500 mt-1">Please wait while we confirm your details.</p>
      </div>
    )
  }

  /* ── 2. FAILED STATE ── */
  if (isFailed && !order) {
    return (
      <div className="oc-wrapper">
        <style>{styles}</style>
        <div className="oc-container max-w-xl">
          <div className="oc-card oc-failed-card text-center">
            {/* Failed Icon */}
            <div className="oc-failed-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 9l-6 6M9 9l6 6" />
              </svg>
            </div>

            <div className="oc-status-pill oc-status-failed">PAYMENT / ORDER FAILED</div>
            <h1 className="oc-hero-title text-slate-900 mt-3">Payment Not Completed</h1>
            <p className="oc-hero-sub text-slate-600 mt-2">
              {failureReason}
            </p>

            <div className="oc-alert-box mt-6">
              <div className="flex items-start gap-3 text-left">
                <span className="text-rose-500 text-lg">ℹ️</span>
                <div className="text-xs text-slate-600 leading-relaxed">
                  <strong>Did money get debited from your account?</strong>
                  <br />
                  Don't worry! In rare gateway timeouts, any debited amount is securely reversed back to your bank account or card automatically within <strong>3-5 business days</strong>.
                </div>
              </div>
            </div>

            {targetId && (
              <div className="oc-info-strip mt-4">
                <span className="text-xs text-slate-400">Attempted Order Ref:</span>
                <span className="text-xs font-mono font-bold text-slate-700">{targetId}</span>
              </div>
            )}

            <div className="oc-actions-grid mt-8">
              <Link to="/cart" className="oc-btn oc-btn-primary">
                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M22 6l-10 7L2 6" />
                </svg>
                Retry from Cart
              </Link>
              <a
                href="https://wa.me/919999999999?text=Hello%20Click2Kart%20Support,%20I%20faced%20an%20issue%20with%20my%20order%20payment."
                target="_blank"
                rel="noreferrer"
                className="oc-btn oc-btn-outline"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-emerald-600">
                  <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2z" />
                </svg>
                Chat With Support
              </a>
            </div>

            <div className="mt-6">
              <Link to="/" className="text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors">
                ← Return to Home Catalogue
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  /* ── 3. ORDER NOT FOUND FALLBACK ── */
  if (!order) {
    return (
      <div className="oc-wrapper">
        <style>{styles}</style>
        <div className="oc-container max-w-md text-center">
          <div className="oc-card p-8">
            <div className="text-4xl mb-3">🔍</div>
            <h2 className="text-xl font-bold text-slate-900">Order Record Not Found</h2>
            <p className="text-sm text-slate-500 mt-2 mb-6">
              We couldn't retrieve the details for this order. It might still be processing or you might need to check your order history.
            </p>
            <div className="flex flex-col gap-3">
              <Link to="/orders" className="oc-btn oc-btn-primary">
                View All Orders
              </Link>
              <Link to="/" className="oc-btn oc-btn-outline">
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  /* ── 4. SUCCESS / CONFIRMED / SUBMITTED SCREEN ── */
  return (
    <div className="oc-wrapper">
      <style>{styles}</style>

      {/* Background Ambience */}
      <div className="oc-ambient-glow" />

      <div className="oc-container">
        {/* Top Hero Banner */}
        <div className="oc-card oc-hero-card">
          <div className="oc-hero-content">
            {isPendingApproval ? (
              <div className="oc-success-icon oc-icon-pending">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            ) : (
              <div className="oc-success-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3.2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}

            <div className="oc-badge-wrap">
              {isPendingApproval ? (
                <span className="oc-status-pill oc-status-amber">
                  <span className="oc-dot oc-dot-amber"></span> PAYMENT SUBMITTED · PENDING VERIFICATION
                </span>
              ) : isCredit ? (
                <span className="oc-status-pill oc-status-purple">
                  <span className="oc-dot oc-dot-purple"></span> ORDER CONFIRMED · RETAILER CREDIT
                </span>
              ) : isCod ? (
                <span className="oc-status-pill oc-status-blue">
                  <span className="oc-dot oc-dot-blue"></span> ORDER CONFIRMED · ADVANCE COD (20%)
                </span>
              ) : (
                <span className="oc-status-pill oc-status-emerald">
                  <span className="oc-dot oc-dot-emerald"></span> ORDER PLACED & PAYMENT RECEIVED
                </span>
              )}
            </div>

            <h1 className="oc-hero-title">
              {isPendingApproval ? (
                <>Order Received, <span>Verifying Payment</span></>
              ) : (
                <>Order Officially <span>Confirmed!</span></>
              )}
            </h1>

            <p className="oc-hero-sub">
              {isPendingApproval ? (
                <>
                  Thank you, <strong>{buyer.name}</strong>. Your payment details have been submitted. Our accounts team will verify your UTR and begin fulfillment.
                </>
              ) : (
                <>
                  Thank you for your order, <strong>{buyer.name}</strong>. We've verified your transaction and sent an email receipt. Your items are being prepared for dispatch!
                </>
              )}
            </p>

            {/* Quick Reference Bar */}
            <div className="oc-quick-bar">
              <div className="oc-quick-item">
                <span className="oc-quick-lbl">Order Reference</span>
                <div className="oc-quick-val flex items-center gap-1.5 font-mono">
                  <span>#{String(order._id).slice(-8).toUpperCase()}</span>
                  <button
                    onClick={() => copyToClipboard(String(order._id), 'id')}
                    title="Copy full Order ID"
                    className="oc-copy-icon-btn"
                  >
                    {copiedId ? '✓' : (
                      <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" strokeWidth="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" strokeWidth="2"></path>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="oc-quick-divider" />

              <div className="oc-quick-item">
                <span className="oc-quick-lbl">Order Placed On</span>
                <span className="oc-quick-val">{formatDate(order.createdAt)}</span>
              </div>

              <div className="oc-quick-divider" />

              <div className="oc-quick-item">
                <span className="oc-quick-lbl">Estimated Delivery</span>
                <span className="oc-quick-val text-purple-700 font-extrabold">
                  {getEstimatedDelivery(order.createdAt)}
                </span>
              </div>

              <div className="oc-quick-divider" />

              <div className="oc-quick-item">
                <span className="oc-quick-lbl">Net Total Payable</span>
                <span className="oc-quick-val text-slate-900 font-extrabold">
                  ₹{Math.round(totalAmount).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Visual Fulfillment Tracker */}
        <div className="oc-card oc-timeline-card">
          <div className="oc-timeline-header">
            <div className="flex items-center gap-2">
              <div className="oc-section-dot"></div>
              <h2 className="oc-section-title">Fulfillment Progress</h2>
            </div>
            {waybill ? (
              <span className="oc-courier-tag">
                DELHIVERY EXPRESS
              </span>
            ) : isLocalDelivery ? (
              <span className="oc-courier-tag oc-tag-local">
                LOCAL EXPRESS STORE DELIVERY
              </span>
            ) : (
              <span className="text-xs font-semibold text-slate-500">
                Current Status: <strong className="text-purple-700">{progress.label}</strong>
              </span>
            )}
          </div>

          <div className="oc-timeline">
            <div className="oc-timeline-bg-line" />
            <div className="oc-timeline-active-line" style={{ width: progress.width }} />

            <div className={`oc-t-step ${progress.index >= 0 ? 'active' : ''} ${progress.index === 0 ? 'current' : ''}`}>
              <div className="oc-t-node">
                {progress.index > 0 ? '✓' : '1'}
              </div>
              <span className="oc-t-label">Order Placed</span>
              <span className="oc-t-sub">{order.createdAt ? new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
            </div>

            <div className={`oc-t-step ${progress.index >= 1 ? 'active' : ''} ${progress.index === 1 ? 'current' : ''}`}>
              <div className="oc-t-node">
                {progress.index > 1 ? '✓' : '2'}
              </div>
              <span className="oc-t-label">Confirmed</span>
              <span className="oc-t-sub">{isPendingApproval ? 'Verifying' : 'Approved'}</span>
            </div>

            <div className={`oc-t-step ${progress.index >= 2 ? 'active' : ''} ${progress.index === 2 ? 'current' : ''}`}>
              <div className="oc-t-node">
                {progress.index > 2 ? '✓' : '3'}
              </div>
              <span className="oc-t-label">Packed & Shipped</span>
              <span className="oc-t-sub">{waybill ? 'Dispatched' : 'Warehouse'}</span>
            </div>

            <div className={`oc-t-step ${progress.index >= 3 ? 'active' : ''} ${progress.index === 3 ? 'current' : ''}`}>
              <div className="oc-t-node">
                {progress.index > 3 ? '✓' : '4'}
              </div>
              <span className="oc-t-label">Out for Delivery</span>
              <span className="oc-t-sub">Courier Hub</span>
            </div>

            <div className={`oc-t-step ${progress.index >= 4 ? 'active' : ''}`}>
              <div className="oc-t-node">
                {progress.index >= 4 ? '✓' : '5'}
              </div>
              <span className="oc-t-label">Delivered</span>
              <span className="oc-t-sub">Destination</span>
            </div>
          </div>

          {/* Courier Waybill / Tracking Banner */}
          {waybill && (
            <div className="oc-waybill-banner">
              <div className="flex items-center gap-3">
                <div className="oc-truck-icon">🚚</div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Delhivery Express AWB</div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-slate-800">{waybill}</span>
                    <button
                      onClick={() => copyToClipboard(waybill, 'waybill')}
                      className="text-xs text-purple-600 hover:text-purple-800 font-semibold"
                    >
                      {copiedWaybill ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>
              </div>
              <a
                href={`https://www.delhivery.com/track/package/${waybill}`}
                target="_blank"
                rel="noreferrer"
                className="oc-track-btn"
              >
                Track Live on Delhivery ↗
              </a>
            </div>
          )}

          {isLocalDelivery && order.localDelivery?.assignedPerson && (
            <div className="oc-waybill-banner">
              <div className="flex items-center gap-3">
                <div className="oc-truck-icon">🛵</div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Assigned Delivery Agent</div>
                  <div className="font-bold text-sm text-slate-800">
                    {order.localDelivery.assignedPerson}
                    {order.localDelivery.contactPhone && (
                      <span className="text-xs text-slate-500 font-normal ml-2">({order.localDelivery.contactPhone})</span>
                    )}
                  </div>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                Direct Store Dispatch
              </span>
            </div>
          )}
        </div>

        {/* 2-Column Grid: Buyer & Shipping Details (Requested Highlight) */}
        <div className="oc-two-col-grid">
          {/* Card A: Buyer & Business Information */}
          <div className="oc-card oc-info-card">
            <div className="oc-card-header">
              <div className="flex items-center gap-2">
                <span className="oc-card-icon">👤</span>
                <h3 className="oc-card-heading">Buyer & Business Details</h3>
              </div>
              <span className="oc-pill-tag">B2B Registered</span>
            </div>

            <div className="oc-details-body">
              <div className="oc-detail-row">
                <span className="oc-detail-label">Buyer / Contact Name</span>
                <span className="oc-detail-val font-bold text-slate-900">{buyer.name}</span>
              </div>

              {buyer.businessName && (
                <div className="oc-detail-row">
                  <span className="oc-detail-label">Business / Shop Name</span>
                  <span className="oc-detail-val font-semibold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-md">
                    {buyer.businessName}
                  </span>
                </div>
              )}

              <div className="oc-detail-row">
                <span className="oc-detail-label">Primary Mobile</span>
                <div className="oc-detail-val flex items-center gap-2">
                  <span className="font-mono">{buyer.phone || '—'}</span>
                  {buyer.phone && (
                    <a href={`tel:${buyer.phone}`} className="text-xs text-purple-600 hover:underline">
                      Call
                    </a>
                  )}
                </div>
              </div>

              {buyer.whatsappNumber && (
                <div className="oc-detail-row">
                  <span className="oc-detail-label">WhatsApp Contact</span>
                  <div className="oc-detail-val flex items-center gap-1.5 text-emerald-600 font-mono">
                    <span>{buyer.whatsappNumber}</span>
                    <span className="text-[10px] font-bold bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">Active</span>
                  </div>
                </div>
              )}

              <div className="oc-detail-row">
                <span className="oc-detail-label">Email Address</span>
                <span className="oc-detail-val text-slate-600">{buyer.email || '—'}</span>
              </div>

              {buyer.gstin && (
                <div className="oc-detail-row">
                  <span className="oc-detail-label">GSTIN</span>
                  <span className="oc-detail-val font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                    {buyer.gstin}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Card B: Delivery & Shipping Address */}
          <div className="oc-card oc-info-card">
            <div className="oc-card-header">
              <div className="flex items-center gap-2">
                <span className="oc-card-icon">📍</span>
                <h3 className="oc-card-heading">Delivery & Shipping Address</h3>
              </div>
              <span className="oc-pill-tag oc-pill-emerald">Destination</span>
            </div>

            <div className="oc-details-body">
              <div className="oc-address-box">
                <div className="font-bold text-slate-900 text-sm mb-1">{buyer.name}</div>
                <div className="text-xs text-slate-600 leading-relaxed">
                  {shippingAddress.line1 ? (
                    <>
                      {shippingAddress.line1}
                      {shippingAddress.line2 && <>, {shippingAddress.line2}</>}
                      <br />
                      {shippingAddress.city && `${shippingAddress.city}, `}
                      {shippingAddress.state && `${shippingAddress.state} `}
                      <strong className="text-slate-900">- {shippingAddress.pincode}</strong>
                    </>
                  ) : (
                    <span className="text-slate-400 italic">Address details on profile</span>
                  )}
                </div>
              </div>

              <div className="oc-detail-row mt-3">
                <span className="oc-detail-label">Delivery Channel</span>
                <span className="oc-detail-val font-semibold text-slate-800">
                  {isLocalDelivery ? 'Local Store Express Courier' : 'Delhivery Express Surface'}
                </span>
              </div>

              <div className="oc-detail-row">
                <span className="oc-detail-label">Estimated Transit</span>
                <span className="oc-detail-val text-purple-700 font-bold">
                  3 – 5 Business Days
                </span>
              </div>

              <div className="oc-detail-row">
                <span className="oc-detail-label">Package Handling</span>
                <span className="oc-detail-val text-emerald-600 font-semibold text-xs flex items-center gap-1">
                  <span>🛡️</span> Insured B2B Logistics
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Items Purchased List */}
        <div className="oc-card oc-items-card">
          <div className="oc-card-header">
            <div className="flex items-center gap-2">
              <span className="oc-card-icon">📦</span>
              <h3 className="oc-card-heading">
                Items In This Order ({order.items?.length || 0})
              </h3>
            </div>
            <span className="text-xs text-slate-400">Wholesale Verified</span>
          </div>

          <div className="oc-items-list">
            {(order.items || []).map((it, idx) => {
              const attributesStr = it.attributes && typeof it.attributes === 'object'
                ? (it.attributes instanceof Map ? Array.from(it.attributes.entries()) : Object.entries(it.attributes))
                    .filter(([, v]) => v)
                    .map(([k, v]) => `${k}: ${v}`)
                    .join(' · ')
                : ''

              const imgUrl = it.image ? getCloudinaryUrl(it.image, 160) : null

              return (
                <div key={idx} className="oc-item-row">
                  <div className="oc-item-thumb">
                    {imgUrl ? (
                      <img src={imgUrl} alt={it.name} />
                    ) : (
                      <span className="text-2xl">📦</span>
                    )}
                  </div>

                  <div className="oc-item-details">
                    <h4 className="oc-item-title" title={it.name}>
                      {it.name}
                    </h4>

                    <div className="oc-item-meta">
                      {it.variantSku && (
                        <span className="oc-variant-badge">SKU: {it.variantSku}</span>
                      )}
                      {attributesStr && (
                        <span className="text-slate-500">{attributesStr}</span>
                      )}
                    </div>

                    <div className="oc-item-pricing">
                      <span className="oc-item-qty">
                        Qty: <strong>{it.quantity}</strong> unit{it.quantity > 1 ? 's' : ''}
                      </span>
                      <span className="text-slate-300">|</span>
                      <span className="oc-item-unit">
                        Rate: ₹{Math.round(Number(it.price || 0)).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  <div className="oc-item-total">
                    <span className="oc-item-total-lbl">Line Total</span>
                    <span className="oc-item-total-amt">
                      ₹{Math.round(Number(it.lineTotal || (it.price * it.quantity))).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Cost & Payment Summary Breakdown */}
        <div className="oc-two-col-grid">
          {/* Payment Method & Transaction Information */}
          <div className="oc-card oc-info-card">
            <div className="oc-card-header">
              <div className="flex items-center gap-2">
                <span className="oc-card-icon">💳</span>
                <h3 className="oc-card-heading">Payment Information</h3>
              </div>
              {order.paymentStatus === 'PAID' ? (
                <span className="oc-pill-tag oc-pill-emerald">Fully Paid</span>
              ) : isPendingApproval ? (
                <span className="oc-pill-tag oc-pill-amber">Pending Approval</span>
              ) : (
                <span className="oc-pill-tag oc-pill-purple">Active</span>
              )}
            </div>

            <div className="oc-details-body">
              <div className="oc-detail-row">
                <span className="oc-detail-label">Payment Method</span>
                <span className="oc-detail-val font-bold text-slate-800">
                  {order.paymentMethod === 'CREDIT' ? 'Retailer Credit Account' :
                   order.paymentMethod === 'RAZORPAY' ? 'Online Gateway (UPI/Card/NetBanking)' :
                   order.paymentMethod === 'MANUAL' ? 'Direct Bank Transfer / UPI' :
                   order.paymentMethod === 'COD_20' ? 'Advance COD (20% Prepaid + 80% On Delivery)' :
                   order.paymentMethod || 'Prepaid'}
                </span>
              </div>

              {/* Specific info depending on method */}
              {isRazorpay && order.razorpayPaymentId && (
                <div className="oc-detail-row">
                  <span className="oc-detail-label">Razorpay Payment ID</span>
                  <span className="oc-detail-val font-mono text-xs text-slate-700">
                    {order.razorpayPaymentId}
                  </span>
                </div>
              )}

              {isCredit && (
                <div className="oc-notice-card oc-notice-purple mt-2">
                  <div className="font-bold text-xs text-purple-900 mb-0.5">Charged to Retailer Credit Balance</div>
                  <div className="text-[11px] text-purple-700 leading-relaxed">
                    This order was processed with your pre-approved Click2Kart Credit Line. Invoices will follow regular billing cycle terms.
                  </div>
                </div>
              )}

              {(isPendingApproval || order.manualPayment?.utr) && (
                <div className="oc-notice-card oc-notice-amber mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-amber-900">Submitted UTR / Transaction ID</span>
                    <button
                      onClick={() => copyToClipboard(order.manualPayment?.utr || state?.utr, 'utr')}
                      className="text-[10px] text-amber-800 font-bold hover:underline"
                    >
                      {copiedUtr ? 'Copied' : 'Copy UTR'}
                    </button>
                  </div>
                  <div className="font-mono text-xs font-bold text-slate-800">
                    {order.manualPayment?.utr || state?.utr || '—'}
                  </div>
                  <div className="text-[11px] text-amber-700 mt-1">
                    Accounts team is cross-referencing this deposit. Your confirmation is secured.
                  </div>
                </div>
              )}

              {isCod && (
                <div className="oc-notice-card oc-notice-blue mt-2">
                  <div className="font-bold text-xs text-blue-900 mb-0.5">Advance COD Structure</div>
                  <div className="text-[11px] text-blue-700">
                    20% advance received. The remaining <strong>80% (₹{Math.round(balanceDue).toLocaleString('en-IN')})</strong> will be collected by the courier delivery agent upon parcel handover.
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Receipt Financial Breakdown */}
          <div className="oc-card oc-summary-card">
            <div className="oc-card-header">
              <div className="flex items-center gap-2">
                <span className="oc-card-icon">🧾</span>
                <h3 className="oc-card-heading">Financial Receipt</h3>
              </div>
              <span className="text-xs font-mono font-bold text-slate-500">INR (₹)</span>
            </div>

            <div className="oc-details-body">
              <div className="oc-receipt-row">
                <span className="text-slate-600 text-xs">Items Subtotal</span>
                <span className="font-semibold text-slate-800 text-xs">
                  ₹{Math.round(totalAmount + (order.couponDiscount || 0) - (order.shipping_charge || 0)).toLocaleString('en-IN')}
                </span>
              </div>

              {order.couponDiscount > 0 && (
                <div className="oc-receipt-row">
                  <span className="text-emerald-700 font-semibold text-xs flex items-center gap-1.5">
                    <span>🏷️</span> Coupon ({order.couponCode || 'APPLIED'})
                  </span>
                  <span className="text-emerald-700 font-bold text-xs">
                    -₹{Math.round(order.couponDiscount).toLocaleString('en-IN')}
                  </span>
                </div>
              )}

              <div className="oc-receipt-row">
                <span className="text-slate-600 text-xs">Logistics & Handling</span>
                <span className="text-xs">
                  {order.shipping_charge > 0 ? (
                    <span className="font-semibold text-slate-800">
                      ₹{Math.round(order.shipping_charge).toLocaleString('en-IN')}
                    </span>
                  ) : (
                    <span className="oc-free-badge">FREE DELIVERY</span>
                  )}
                </span>
              </div>

              <div className="oc-receipt-divider" />

              <div className="oc-receipt-row oc-total-row">
                <div>
                  <div className="text-sm font-extrabold text-slate-900">Total Order Value</div>
                  <div className="text-[10px] text-slate-400 font-medium">Inclusive of all applicable GST taxes</div>
                </div>
                <div className="text-xl font-extrabold text-purple-700">
                  ₹{Math.round(totalAmount).toLocaleString('en-IN')}
                </div>
              </div>

              {/* Payment Split */}
              {isCod ? (
                <div className="oc-split-box mt-3">
                  <div className="oc-split-row">
                    <span className="text-xs font-semibold text-slate-600">Advance Paid (20%)</span>
                    <span className="text-xs font-bold text-emerald-600">
                      ₹{Math.round(advancePaid).toLocaleString('en-IN')} ✓
                    </span>
                  </div>
                  <div className="oc-split-row oc-split-due mt-1.5 pt-1.5 border-t border-amber-200">
                    <span className="text-xs font-bold text-amber-900">Remaining Balance on Delivery</span>
                    <span className="text-sm font-extrabold text-amber-900">
                      ₹{Math.round(balanceDue).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              ) : isCredit ? (
                <div className="oc-split-box oc-split-credit mt-3">
                  <div className="oc-split-row">
                    <span className="text-xs font-bold text-purple-900">B2B Credit Settled</span>
                    <span className="text-xs font-extrabold text-purple-900">
                      ₹{Math.round(totalAmount).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="oc-split-box oc-split-paid mt-3">
                  <div className="oc-split-row">
                    <span className="text-xs font-bold text-emerald-900">Total Paid Amount</span>
                    <span className="text-sm font-extrabold text-emerald-900">
                      ₹{Math.round(totalAmount).toLocaleString('en-IN')} ✓
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Controls & Assistance Bar */}
        <div className="oc-footer-actions">
          <div className="oc-btn-row">
            <Link to="/orders" className="oc-btn oc-btn-primary">
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Track In My Orders
            </Link>

            <button onClick={handlePrint} className="oc-btn oc-btn-outline">
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4H7v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print / Save Receipt
            </button>

            <Link to="/products" className="oc-btn oc-btn-subtle">
              Continue Shopping
            </Link>
          </div>

          {/* Help Box */}
          <div className="oc-help-box">
            <div className="flex items-center gap-3">
              <span className="text-2xl">💬</span>
              <div>
                <div className="font-bold text-xs text-slate-800">Have questions about your wholesale shipment?</div>
                <div className="text-[11px] text-slate-500">Our customer care and fulfillment team are ready to assist you.</div>
              </div>
            </div>
            <a
              href={`https://wa.me/919999999999?text=Hello%20Click2Kart,%20I%20have%20an%20inquiry%20regarding%20my%20Order%20%23${String(order._id).slice(-8).toUpperCase()}`}
              target="_blank"
              rel="noreferrer"
              className="oc-help-wa-btn"
            >
              WhatsApp Support ↗
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── STYLES (Elevated UI matching Click2Kart brand palette) ── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&display=swap');

  .oc-wrapper {
    font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: #f8fafc;
    min-height: 100vh;
    color: #1e293b;
    padding: 36px 16px 80px;
    position: relative;
    overflow-x: hidden;
  }

  .oc-ambient-glow {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 900px;
    height: 380px;
    background: radial-gradient(circle, rgba(124, 58, 237, 0.08) 0%, rgba(139, 92, 246, 0.02) 60%, transparent 80%);
    pointer-events: none;
    z-index: 0;
  }

  .oc-container {
    max-width: 900px;
    margin: 0 auto;
    position: relative;
    z-index: 1;
  }

  /* Main Card Layout */
  .oc-card {
    background: #ffffff;
    border: 1px solid rgba(139, 92, 246, 0.14);
    border-radius: 24px;
    box-shadow: 0 4px 20px -2px rgba(124, 58, 237, 0.04), 0 2px 6px -1px rgba(0, 0, 0, 0.02);
    margin-bottom: 24px;
    overflow: hidden;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  /* Hero Card */
  .oc-hero-card {
    padding: 44px 24px 36px;
    text-align: center;
    background: linear-gradient(180deg, #ffffff 0%, #faf5ff 100%);
    border-top: 4px solid #7c3aed;
  }

  @media (min-width: 640px) {
    .oc-hero-card {
      padding: 52px 40px 40px;
    }
  }

  .oc-success-icon {
    width: 76px;
    height: 76px;
    border-radius: 50%;
    background: rgba(16, 185, 129, 0.1);
    border: 3px solid #10b981;
    color: #10b981;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 20px;
    box-shadow: 0 10px 25px -5px rgba(16, 185, 129, 0.3);
    animation: ocPop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both;
  }

  .oc-success-icon svg {
    width: 38px;
    height: 38px;
  }

  .oc-icon-pending {
    background: rgba(245, 158, 11, 0.1);
    border-color: #f59e0b;
    color: #f59e0b;
    box-shadow: 0 10px 25px -5px rgba(245, 158, 11, 0.3);
  }

  .oc-failed-icon {
    width: 76px;
    height: 76px;
    border-radius: 50%;
    background: rgba(225, 29, 72, 0.1);
    border: 3px solid #e11d48;
    color: #e11d48;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 16px;
    box-shadow: 0 10px 25px -5px rgba(225, 29, 72, 0.3);
  }

  .oc-failed-icon svg {
    width: 40px;
    height: 40px;
  }

  .oc-hero-title {
    font-family: 'Bebas Neue', 'DM Sans', sans-serif;
    font-size: clamp(34px, 5vw, 48px);
    letter-spacing: 0.02em;
    color: #0f172a;
    line-height: 1.1;
    margin-bottom: 8px;
  }

  .oc-hero-title span {
    color: #7c3aed;
  }

  .oc-hero-sub {
    font-size: 14px;
    color: #64748b;
    max-width: 580px;
    margin: 0 auto 28px;
    line-height: 1.6;
  }

  /* Status Pills */
  .oc-status-pill {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 6px 14px;
    border-radius: 9999px;
    margin-bottom: 12px;
  }

  .oc-status-emerald {
    background: rgba(16, 185, 129, 0.1);
    color: #059669;
    border: 1px solid rgba(16, 185, 129, 0.25);
  }

  .oc-status-purple {
    background: rgba(124, 58, 237, 0.08);
    color: #7c3aed;
    border: 1px solid rgba(124, 58, 237, 0.25);
  }

  .oc-status-blue {
    background: rgba(37, 99, 235, 0.08);
    color: #2563eb;
    border: 1px solid rgba(37, 99, 235, 0.25);
  }

  .oc-status-amber {
    background: rgba(217, 119, 6, 0.1);
    color: #d97706;
    border: 1px solid rgba(217, 119, 6, 0.25);
  }

  .oc-status-failed {
    background: rgba(225, 29, 72, 0.1);
    color: #e11d48;
    border: 1px solid rgba(225, 29, 72, 0.25);
  }

  .oc-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
  }
  .oc-dot-emerald { background: #10b981; }
  .oc-dot-purple { background: #7c3aed; }
  .oc-dot-blue { background: #2563eb; }
  .oc-dot-amber { background: #d97706; }

  /* Quick Bar */
  .oc-quick-bar {
    display: grid;
    grid-template-columns: 1fr;
    gap: 16px;
    background: #ffffff;
    border: 1px solid rgba(139, 92, 246, 0.12);
    border-radius: 18px;
    padding: 16px 20px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);
  }

  @media (min-width: 640px) {
    .oc-quick-bar {
      grid-template-columns: repeat(4, 1fr);
      align-items: center;
    }
    .oc-quick-divider {
      display: none;
    }
  }

  .oc-quick-item {
    text-align: center;
  }

  .oc-quick-lbl {
    display: block;
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #94a3b8;
    margin-bottom: 4px;
  }

  .oc-quick-val {
    font-size: 13px;
    font-weight: 700;
    color: #1e293b;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .oc-copy-icon-btn {
    border: none;
    background: rgba(124, 58, 237, 0.08);
    color: #7c3aed;
    border-radius: 6px;
    padding: 3px 5px;
    display: inline-flex;
    align-items: center;
    cursor: pointer;
    transition: background 0.2s;
  }
  .oc-copy-icon-btn:hover {
    background: rgba(124, 58, 237, 0.18);
  }

  /* Timeline Stepper */
  .oc-timeline-card {
    padding: 24px;
  }

  .oc-timeline-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 24px;
  }

  .oc-section-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #7c3aed;
  }

  .oc-section-title {
    font-size: 14px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: #0f172a;
    margin: 0;
  }

  .oc-courier-tag {
    font-size: 10px;
    font-weight: 800;
    padding: 4px 10px;
    border-radius: 8px;
    background: rgba(124, 58, 237, 0.1);
    color: #7c3aed;
    border: 1px solid rgba(124, 58, 237, 0.25);
    letter-spacing: 0.06em;
  }

  .oc-tag-local {
    background: rgba(5, 150, 105, 0.1);
    color: #059669;
    border-color: rgba(5, 150, 105, 0.25);
  }

  .oc-timeline {
    display: flex;
    justify-content: space-between;
    position: relative;
    padding: 10px 0 20px;
  }

  .oc-timeline-bg-line {
    position: absolute;
    top: 24px;
    left: 20px;
    right: 20px;
    height: 3px;
    background: #e2e8f0;
    z-index: 0;
  }

  .oc-timeline-active-line {
    position: absolute;
    top: 24px;
    left: 20px;
    height: 3px;
    background: #7c3aed;
    z-index: 1;
    transition: width 0.4s ease;
  }

  .oc-t-step {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    z-index: 2;
    width: 64px;
  }

  .oc-t-node {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: #ffffff;
    border: 2px solid #cbd5e1;
    color: #94a3b8;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 800;
    margin-bottom: 8px;
    transition: all 0.3s ease;
  }

  .oc-t-step.active .oc-t-node {
    background: #7c3aed;
    border-color: #7c3aed;
    color: #ffffff;
    box-shadow: 0 0 12px rgba(124, 58, 237, 0.35);
  }

  .oc-t-step.current .oc-t-node {
    background: #6d28d9;
    border-color: #6d28d9;
    color: #ffffff;
    box-shadow: 0 0 16px rgba(109, 40, 217, 0.5);
    animation: ocPulse 1.8s infinite;
  }

  .oc-t-label {
    font-size: 11px;
    font-weight: 700;
    color: #64748b;
    text-align: center;
    line-height: 1.2;
  }

  .oc-t-step.active .oc-t-label {
    color: #0f172a;
  }

  .oc-t-step.current .oc-t-label {
    color: #7c3aed;
    font-weight: 800;
  }

  .oc-t-sub {
    font-size: 9px;
    color: #94a3b8;
    margin-top: 2px;
  }

  .oc-waybill-banner {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 18px;
    padding-top: 16px;
    border-top: 1px solid #f1f5f9;
  }

  .oc-truck-icon {
    width: 38px;
    height: 38px;
    border-radius: 10px;
    background: #f1f5f9;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
  }

  .oc-track-btn {
    display: inline-flex;
    align-items: center;
    font-size: 12px;
    font-weight: 700;
    color: #7c3aed;
    background: rgba(124, 58, 237, 0.08);
    border: 1px solid rgba(124, 58, 237, 0.2);
    padding: 7px 14px;
    border-radius: 10px;
    text-decoration: none;
    transition: all 0.2s ease;
  }
  .oc-track-btn:hover {
    background: #7c3aed;
    color: #ffffff;
  }

  /* Two Column Grid */
  .oc-two-col-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 20px;
    margin-bottom: 24px;
  }

  @media (min-width: 680px) {
    .oc-two-col-grid {
      grid-template-columns: 1fr 1fr;
    }
  }

  /* Card Headers */
  .oc-card-header {
    padding: 16px 20px;
    background: #fdfcff;
    border-bottom: 1px solid rgba(139, 92, 246, 0.08);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .oc-card-icon {
    font-size: 16px;
  }

  .oc-card-heading {
    font-size: 13px;
    font-weight: 800;
    color: #0f172a;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin: 0;
  }

  .oc-pill-tag {
    font-size: 10px;
    font-weight: 700;
    background: #f1f5f9;
    color: #64748b;
    padding: 3px 8px;
    border-radius: 6px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
  .oc-pill-emerald {
    background: rgba(16, 185, 129, 0.1);
    color: #059669;
  }
  .oc-pill-purple {
    background: rgba(124, 58, 237, 0.1);
    color: #7c3aed;
  }
  .oc-pill-amber {
    background: rgba(217, 119, 6, 0.1);
    color: #d97706;
  }

  .oc-details-body {
    padding: 20px;
  }

  .oc-detail-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px dashed #f1f5f9;
  }
  .oc-detail-row:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }

  .oc-detail-label {
    font-size: 12px;
    color: #64748b;
  }

  .oc-detail-val {
    font-size: 12px;
    color: #1e293b;
    text-align: right;
  }

  .oc-address-box {
    background: #faf5ff;
    border: 1px solid rgba(139, 92, 246, 0.12);
    border-radius: 14px;
    padding: 12px 14px;
  }

  /* Items Card */
  .oc-items-card {
    margin-bottom: 24px;
  }

  .oc-items-list {
    padding: 12px 20px;
  }

  .oc-item-row {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 14px 0;
    border-bottom: 1px solid #f1f5f9;
  }
  .oc-item-row:last-child {
    border-bottom: none;
  }

  .oc-item-thumb {
    width: 58px;
    height: 58px;
    border-radius: 12px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .oc-item-thumb img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    padding: 4px;
  }

  .oc-item-details {
    flex: 1;
    min-width: 0;
  }

  .oc-item-title {
    font-size: 13px;
    font-weight: 700;
    color: #0f172a;
    margin: 0 0 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .oc-item-meta {
    font-size: 11px;
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 4px;
  }

  .oc-variant-badge {
    background: rgba(124, 58, 237, 0.08);
    color: #7c3aed;
    font-size: 10px;
    font-weight: 700;
    padding: 1px 6px;
    border-radius: 4px;
  }

  .oc-item-pricing {
    font-size: 11px;
    color: #64748b;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .oc-item-total {
    text-align: right;
    flex-shrink: 0;
  }

  .oc-item-total-lbl {
    display: block;
    font-size: 9px;
    text-transform: uppercase;
    color: #94a3b8;
    font-weight: 700;
  }

  .oc-item-total-amt {
    font-size: 14px;
    font-weight: 800;
    color: #0f172a;
  }

  /* Receipt Summary */
  .oc-receipt-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px 0;
  }

  .oc-free-badge {
    font-size: 10px;
    font-weight: 800;
    color: #059669;
    background: rgba(16, 185, 129, 0.1);
    padding: 2px 7px;
    border-radius: 6px;
  }

  .oc-receipt-divider {
    height: 1px;
    background: #e2e8f0;
    margin: 10px 0;
  }

  .oc-total-row {
    padding-top: 4px;
  }

  .oc-split-box {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 10px 14px;
  }

  .oc-split-paid {
    background: rgba(16, 185, 129, 0.06);
    border-color: rgba(16, 185, 129, 0.2);
  }

  .oc-split-credit {
    background: rgba(124, 58, 237, 0.06);
    border-color: rgba(124, 58, 237, 0.2);
  }

  .oc-split-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .oc-notice-card {
    border-radius: 12px;
    padding: 10px 12px;
  }

  .oc-notice-purple {
    background: rgba(124, 58, 237, 0.06);
    border: 1px solid rgba(124, 58, 237, 0.18);
  }

  .oc-notice-amber {
    background: rgba(245, 158, 11, 0.08);
    border: 1px solid rgba(245, 158, 11, 0.25);
  }

  .oc-notice-blue {
    background: rgba(37, 99, 235, 0.06);
    border: 1px solid rgba(37, 99, 235, 0.2);
  }

  /* Footer Actions */
  .oc-footer-actions {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-top: 12px;
  }

  .oc-btn-row {
    display: grid;
    grid-template-columns: 1fr;
    gap: 12px;
  }

  @media (min-width: 600px) {
    .oc-btn-row {
      grid-template-columns: 1.4fr 1fr 1fr;
    }
  }

  .oc-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    height: 48px;
    border-radius: 14px;
    font-size: 13px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    text-decoration: none;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    border: none;
  }

  .oc-btn-primary {
    background: #7c3aed;
    color: #ffffff;
    box-shadow: 0 4px 18px rgba(124, 58, 237, 0.28);
  }
  .oc-btn-primary:hover {
    background: #6d28d9;
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(124, 58, 237, 0.38);
    color: #ffffff;
  }

  .oc-btn-outline {
    background: #ffffff;
    border: 1px solid #cbd5e1;
    color: #334155;
  }
  .oc-btn-outline:hover {
    background: #f8fafc;
    border-color: #94a3b8;
    color: #0f172a;
    transform: translateY(-2px);
  }

  .oc-btn-subtle {
    background: rgba(124, 58, 237, 0.06);
    border: 1px solid rgba(124, 58, 237, 0.14);
    color: #7c3aed;
  }
  .oc-btn-subtle:hover {
    background: rgba(124, 58, 237, 0.12);
    color: #6d28d9;
    transform: translateY(-2px);
  }

  .oc-help-box {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;
    background: #ffffff;
    border: 1px solid rgba(139, 92, 246, 0.12);
    border-radius: 16px;
    padding: 14px 18px;
  }

  .oc-help-wa-btn {
    font-size: 12px;
    font-weight: 700;
    background: rgba(16, 185, 129, 0.1);
    color: #059669;
    border: 1px solid rgba(16, 185, 129, 0.25);
    padding: 8px 14px;
    border-radius: 10px;
    text-decoration: none;
    transition: background 0.2s;
  }
  .oc-help-wa-btn:hover {
    background: #10b981;
    color: #ffffff;
  }

  .oc-failed-card {
    padding: 44px 28px;
    border-top: 4px solid #e11d48;
  }

  .oc-alert-box {
    background: #fff1f2;
    border: 1px solid #fecdd3;
    border-radius: 14px;
    padding: 14px;
  }

  .oc-info-strip {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: #f1f5f9;
    padding: 6px 14px;
    border-radius: 8px;
  }

  @keyframes ocPop {
    from { opacity: 0; transform: scale(0.4); }
    to { opacity: 1; transform: scale(1); }
  }

  @keyframes ocPulse {
    0%, 100% { transform: scale(1); box-shadow: 0 0 12px rgba(124, 58, 237, 0.3); }
    50% { transform: scale(1.08); box-shadow: 0 0 20px rgba(124, 58, 237, 0.6); }
  }

  /* Print Stylesheet for Invoices */
  @media print {
    body {
      background: white !important;
      color: black !important;
    }
    .oc-ambient-glow,
    .oc-footer-actions,
    .oc-copy-icon-btn,
    .oc-waybill-banner a,
    nav,
    footer,
    header {
      display: none !important;
    }
    .oc-wrapper {
      padding: 0 !important;
      background: white !important;
    }
    .oc-card {
      box-shadow: none !important;
      border: 1px solid #e2e8f0 !important;
      page-break-inside: avoid;
    }
    .oc-two-col-grid {
      display: grid !important;
      grid-template-columns: 1fr 1fr !important;
    }
  }
`
