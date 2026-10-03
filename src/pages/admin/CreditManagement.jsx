import React, { useEffect, useState } from 'react'
import api from '../../lib/api'
import { useToast } from '../../components/Toast'

export default function CreditManagement() {
  const { notify } = useToast()
  const [activeTab, setActiveTab] = useState('retailers') // 'retailers' | 'repayments'
  const [stats, setStats] = useState({
    totalLimit: 0,
    totalAvailable: 0,
    totalUsed: 0,
    totalOutstanding: 0,
    enabledCount: 0
  })

  // Retailers state
  const [retailers, setRetailers] = useState([])
  const [loadingRetailers, setLoadingRetailers] = useState(true)
  const [searchQ, setSearchQ] = useState('')
  const [statusFilter, setStatusFilter] = useState('all') // 'all' | 'enabled' | 'disabled'

  // Repayments state
  const [repayments, setRepayments] = useState([])
  const [loadingRepayments, setLoadingRepayments] = useState(false)
  const [repaymentStatusFilter, setRepaymentStatusFilter] = useState('PENDING_VERIFICATION')

  // Modals state
  const [selectedRetailer, setSelectedRetailer] = useState(null)
  const [toggleModalOpen, setToggleModalOpen] = useState(false)
  const [limitModalOpen, setLimitModalOpen] = useState(false)
  const [adjustModalOpen, setAdjustModalOpen] = useState(false)
  const [ledgerModalOpen, setLedgerModalOpen] = useState(false)
  const [verifyRepaymentModalOpen, setVerifyRepaymentModalOpen] = useState(false)
  const [rejectRepaymentModalOpen, setRejectRepaymentModalOpen] = useState(false)
  const [selectedRepayment, setSelectedRepayment] = useState(null)

  // Form states
  const [formReason, setFormReason] = useState('')
  const [formLimit, setFormLimit] = useState('')
  const [formAdjustAmount, setFormAdjustAmount] = useState('')
  const [formAdjustType, setFormAdjustType] = useState('INCREASE')
  const [formAdminNotes, setFormAdminNotes] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [ledgerHistory, setLedgerHistory] = useState([])
  const [reconciling, setReconciling] = useState(false)

  // Load retailers
  const loadRetailers = async () => {
    setLoadingRetailers(true)
    try {
      const { data } = await api.get('/api/credit/admin/retailers', {
        params: { q: searchQ, status: statusFilter }
      })
      setRetailers(data.items || [])
      if (data.stats) setStats(data.stats)
    } catch (err) {
      notify(err?.response?.data?.error || 'Failed to load credit retailers', 'error')
    } finally {
      setLoadingRetailers(false)
    }
  }

  // Load repayments
  const loadRepayments = async () => {
    setLoadingRepayments(true)
    try {
      const { data } = await api.get('/api/credit/admin/repayments', {
        params: { status: repaymentStatusFilter }
      })
      setRepayments(data.items || [])
    } catch (err) {
      notify(err?.response?.data?.error || 'Failed to load repayments', 'error')
    } finally {
      setLoadingRepayments(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'retailers') {
      loadRetailers()
    } else {
      loadRepayments()
    }
  }, [activeTab, searchQ, statusFilter, repaymentStatusFilter])

  // Toggle credit modal submit
  const handleToggleCredit = async (e) => {
    e.preventDefault()
    if (!formReason.trim()) return notify('Reason is required for audit trail', 'error')
    setActionLoading(true)
    try {
      const isEnabling = !selectedRetailer.isCreditEnabled
      const payload = {
        isCreditEnabled: isEnabling,
        reason: formReason.trim()
      }
      if (isEnabling && formLimit) {
        payload.creditLimit = Number(formLimit)
      }
      await api.post(`/api/credit/admin/retailers/${selectedRetailer._id}/toggle`, payload)
      notify(`Credit facility ${isEnabling ? 'enabled' : 'disabled'} successfully`, 'success')
      setToggleModalOpen(false)
      setFormReason('')
      setFormLimit('')
      loadRetailers()
    } catch (err) {
      notify(err?.response?.data?.message || err?.response?.data?.error || 'Failed to update credit', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  // Set limit submit
  const handleSetLimit = async (e) => {
    e.preventDefault()
    if (formLimit === '' || Number(formLimit) < 0) return notify('Valid credit limit is required', 'error')
    if (!formReason.trim()) return notify('Reason is required for audit trail', 'error')
    setActionLoading(true)
    try {
      await api.post(`/api/credit/admin/retailers/${selectedRetailer._id}/set-limit`, {
        creditLimit: Number(formLimit),
        reason: formReason.trim()
      })
      notify('Credit limit updated successfully', 'success')
      setLimitModalOpen(false)
      setFormReason('')
      setFormLimit('')
      loadRetailers()
    } catch (err) {
      notify(err?.response?.data?.message || err?.response?.data?.error || 'Failed to set limit', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  // Manual Adjust credit submit
  const handleAdjustCredit = async (e) => {
    e.preventDefault()
    if (!formAdjustAmount || Number(formAdjustAmount) <= 0) return notify('Valid amount is required', 'error')
    if (!formReason.trim()) return notify('Reason is required for audit trail', 'error')
    setActionLoading(true)
    try {
      await api.post(`/api/credit/admin/retailers/${selectedRetailer._id}/adjust`, {
        amount: Number(formAdjustAmount),
        type: formAdjustType,
        reason: formReason.trim()
      })
      notify(`Credit successfully ${formAdjustType === 'INCREASE' ? 'increased' : 'decreased'}`, 'success')
      setAdjustModalOpen(false)
      setFormReason('')
      setFormAdjustAmount('')
      loadRetailers()
    } catch (err) {
      notify(err?.response?.data?.message || err?.response?.data?.error || 'Failed to adjust credit', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  // View ledger
  const openLedgerModal = async (retailer) => {
    setSelectedRetailer(retailer)
    setLedgerModalOpen(true)
    try {
      const { data } = await api.get(`/api/credit/admin/retailers/${retailer._id}`)
      setLedgerHistory(data.transactions || [])
    } catch (err) {
      notify('Failed to load ledger history', 'error')
    }
  }

  // Verify Bank Transfer Repayment
  const handleVerifyRepayment = async (e) => {
    e.preventDefault()
    setActionLoading(true)
    try {
      await api.post(`/api/credit/admin/repayments/${selectedRepayment._id}/verify`, {
        notes: formAdminNotes.trim()
      })
      notify('Bank transfer repayment verified and credited successfully', 'success')
      setVerifyRepaymentModalOpen(false)
      setFormAdminNotes('')
      loadRepayments()
      loadRetailers()
    } catch (err) {
      notify(err?.response?.data?.message || err?.response?.data?.error || 'Failed to verify repayment', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  // Reject Bank Transfer Repayment
  const handleRejectRepayment = async (e) => {
    e.preventDefault()
    if (!formReason.trim()) return notify('Rejection reason is required', 'error')
    setActionLoading(true)
    try {
      await api.post(`/api/credit/admin/repayments/${selectedRepayment._id}/reject`, {
        reason: formReason.trim()
      })
      notify('Repayment marked as rejected', 'success')
      setRejectRepaymentModalOpen(false)
      setFormReason('')
      loadRepayments()
    } catch (err) {
      notify(err?.response?.data?.message || err?.response?.data?.error || 'Failed to reject repayment', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  // Run Reconciliation
  const handleReconcile = async () => {
    setReconciling(true)
    try {
      const { data } = await api.post('/api/credit/admin/reconcile')
      const r = data.report || {}
      notify(
        `Reconciliation complete: ${r.ordersReconciled || 0} orders & ${r.repaymentsReconciled || 0} repayments synced`,
        'success'
      )
      loadRetailers()
      loadRepayments()
    } catch (err) {
      notify(err?.response?.data?.message || 'Reconciliation failed', 'error')
    } finally {
      setReconciling(false)
    }
  }

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Credit Management</h1>
          <p className="text-sm text-gray-500 font-medium mt-1 uppercase tracking-widest text-[10px]">
            Retailer Credit Limits, Balance Ledgers & Repayment Verification
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleReconcile}
            disabled={reconciling}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-2xl transition-all shadow-sm active:scale-95 disabled:opacity-50"
          >
            <svg className={`w-4 h-4 ${reconciling ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {reconciling ? 'Reconciling...' : 'Reconcile Gateway Payments'}
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Credit Retailers</div>
          <div className="text-2xl font-black text-gray-900 mt-2">{stats.enabledCount}</div>
          <div className="text-[11px] text-gray-500 mt-1">Authorized for credit checkout</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
          <div className="text-xs font-bold text-blue-500 uppercase tracking-wider">Total Credit Limit</div>
          <div className="text-2xl font-black text-blue-600 mt-2">₹{(stats.totalLimit || 0).toLocaleString('en-IN')}</div>
          <div className="text-[11px] text-gray-500 mt-1">Total credit assigned</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
          <div className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Available Credit</div>
          <div className="text-2xl font-black text-emerald-600 mt-2">₹{(stats.totalAvailable || 0).toLocaleString('en-IN')}</div>
          <div className="text-[11px] text-gray-500 mt-1">Ready for purchases</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
          <div className="text-xs font-bold text-amber-500 uppercase tracking-wider">Used Credit</div>
          <div className="text-2xl font-black text-amber-600 mt-2">₹{(stats.totalUsed || 0).toLocaleString('en-IN')}</div>
          <div className="text-[11px] text-gray-500 mt-1">Currently utilized</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
          <div className="text-xs font-bold text-rose-500 uppercase tracking-wider">Outstanding Due</div>
          <div className="text-2xl font-black text-rose-600 mt-2">₹{(stats.totalOutstanding || 0).toLocaleString('en-IN')}</div>
          <div className="text-[11px] text-gray-500 mt-1">Total pending repayment</div>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex items-center gap-4 border-b border-gray-100 pb-2">
        <button
          onClick={() => setActiveTab('retailers')}
          className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all ${
            activeTab === 'retailers'
              ? 'bg-gray-900 text-white shadow-md'
              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          Retailer Credit Directory
        </button>
        <button
          onClick={() => setActiveTab('repayments')}
          className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all ${
            activeTab === 'repayments'
              ? 'bg-gray-900 text-white shadow-md'
              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          Bank Transfer Repayments
        </button>
      </div>

      {/* Tab 1: Retailers Directory */}
      {activeTab === 'retailers' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <input
                className="w-full bg-white border border-gray-200 text-gray-900 text-sm rounded-2xl pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                placeholder="Search by retailer, phone, business..."
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
              />
              <svg className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <div className="flex items-center gap-2">
              {[
                { label: 'All Retailers', value: 'all' },
                { label: 'Credit Enabled', value: 'enabled' },
                { label: 'Credit Disabled', value: 'disabled' }
              ].map((f) => (
                <button
                  key={f.value}
                  onClick={() => setStatusFilter(f.value)}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                    statusFilter === f.value
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Retailers Table */}
          <div className="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead className="bg-gray-50/50 border-b border-gray-50 text-gray-400 font-black uppercase tracking-[0.2em] text-[10px]">
                  <tr>
                    <th className="px-6 py-4">Retailer</th>
                    <th className="px-6 py-4">Credit Status</th>
                    <th className="px-6 py-4">Limit (₹)</th>
                    <th className="px-6 py-4">Available (₹)</th>
                    <th className="px-6 py-4">Outstanding (₹)</th>
                    <th className="px-6 py-4">Delivery Channel</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loadingRetailers ? (
                    <tr>
                      <td colSpan="7" className="text-center py-12 text-gray-400">Loading retailers...</td>
                    </tr>
                  ) : retailers.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-12 text-gray-400">No retailers found matching criteria</td>
                    </tr>
                  ) : (
                    retailers.map((r) => {
                      const isEn = Boolean(r.isCreditEnabled)
                      const dDelhivery = r.deliverySettings?.delhiveryEnabled ?? true
                      const dLocal = r.deliverySettings?.localDeliveryEnabled ?? false
                      return (
                        <tr key={r._id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-bold text-gray-900">{r.name}</div>
                            <div className="text-xs text-gray-500">{r.kyc?.businessName || 'Individual'} • {r.phone}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                                isEn ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-100 text-gray-500'
                              }`}
                            >
                              {isEn ? 'Enabled' : 'Disabled'}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-bold text-gray-900">
                            ₹{(r.creditLimit || 0).toLocaleString('en-IN')}
                          </td>
                          <td className="px-6 py-4 font-black text-emerald-600">
                            ₹{(r.availableCredit || 0).toLocaleString('en-IN')}
                          </td>
                          <td className="px-6 py-4 font-black text-rose-600">
                            ₹{(r.outstandingBalance || 0).toLocaleString('en-IN')}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1">
                              {dDelhivery && (
                                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-md">
                                  Delhivery
                                </span>
                              )}
                              {dLocal && (
                                <span className="px-2 py-0.5 bg-purple-50 text-purple-700 text-[10px] font-bold rounded-md">
                                  Local
                                </span>
                              )}
                              {!dDelhivery && !dLocal && (
                                <span className="text-[10px] text-gray-400">None</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => openLedgerModal(r)}
                                title="View Credit Ledger"
                                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold transition-all"
                              >
                                Ledger
                              </button>
                              {isEn ? (
                                <>
                                  <button
                                    onClick={() => {
                                      setSelectedRetailer(r)
                                      setFormLimit(String(r.creditLimit || 0))
                                      setLimitModalOpen(true)
                                    }}
                                    className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold transition-all"
                                  >
                                    Set Limit
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedRetailer(r)
                                      setFormAdjustAmount('')
                                      setAdjustModalOpen(true)
                                    }}
                                    className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-xl text-xs font-bold transition-all"
                                  >
                                    Adjust
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedRetailer(r)
                                      setToggleModalOpen(true)
                                    }}
                                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition-all"
                                  >
                                    Disable
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={() => {
                                    setSelectedRetailer(r)
                                    setFormLimit('50000')
                                    setToggleModalOpen(true)
                                  }}
                                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
                                >
                                  Enable Credit
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Bank Transfer Repayments Verification */}
      {activeTab === 'repayments' && (
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            {[
              { label: 'Pending Verification', value: 'PENDING_VERIFICATION' },
              { label: 'Approved (Success)', value: 'SUCCESS' },
              { label: 'Rejected', value: 'REJECTED' },
              { label: 'All Submissions', value: 'ALL' }
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => setRepaymentStatusFilter(f.value)}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                  repaymentStatusFilter === f.value
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead className="bg-gray-50/50 border-b border-gray-50 text-gray-400 font-black uppercase tracking-[0.2em] text-[10px]">
                  <tr>
                    <th className="px-6 py-4">Retailer</th>
                    <th className="px-6 py-4">Amount (₹)</th>
                    <th className="px-6 py-4">Method / UTR</th>
                    <th className="px-6 py-4">Date Submitted</th>
                    <th className="px-6 py-4">Proof / Slip</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loadingRepayments ? (
                    <tr>
                      <td colSpan="7" className="text-center py-12 text-gray-400">Loading repayment requests...</td>
                    </tr>
                  ) : repayments.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-12 text-gray-400">No repayment records in this filter</td>
                    </tr>
                  ) : (
                    repayments.map((rep) => {
                      const ret = rep.retailerId || {}
                      return (
                        <tr key={rep._id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-bold text-gray-900">{ret.name || 'Unknown Retailer'}</div>
                            <div className="text-xs text-gray-500">{ret.phone} • {ret.kyc?.businessName || ''}</div>
                          </td>
                          <td className="px-6 py-4 font-black text-gray-900">
                            ₹{Number(rep.amount).toLocaleString('en-IN')}
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-bold text-gray-800">{rep.method}</div>
                            <div className="text-xs font-mono text-gray-500">
                              UTR: {rep.bankTransferDetails?.utr || rep.razorpayPaymentId || 'N/A'}
                            </div>
                            {rep.bankTransferDetails?.note && (
                              <div className="text-[11px] text-gray-400 italic mt-0.5">
                                "{rep.bankTransferDetails.note}"
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 text-xs text-gray-500">
                            {new Date(rep.createdAt).toLocaleString('en-IN')}
                          </td>
                          <td className="px-6 py-4">
                            {rep.bankTransferDetails?.paymentSlip ? (
                              <a
                                href={rep.bankTransferDetails.paymentSlip}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline"
                              >
                                View Receipt
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                              </a>
                            ) : (
                              <span className="text-xs text-gray-400">—</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                                rep.status === 'SUCCESS'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : rep.status === 'REJECTED'
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}
                            >
                              {rep.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            {rep.status === 'PENDING_VERIFICATION' && (
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => {
                                    setSelectedRepayment(rep)
                                    setFormAdminNotes('')
                                    setVerifyRepaymentModalOpen(true)
                                  }}
                                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
                                >
                                  Verify & Approve
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedRepayment(rep)
                                    setFormReason('')
                                    setRejectRepaymentModalOpen(true)
                                  }}
                                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition-all"
                                >
                                  Reject
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Toggle Credit Status */}
      {toggleModalOpen && selectedRetailer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-100 space-y-5">
            <h3 className="text-xl font-black text-gray-900">
              {selectedRetailer.isCreditEnabled ? 'Disable Credit Facility' : 'Enable Credit Facility'}
            </h3>
            <p className="text-xs text-gray-500">
              Retailer: <span className="font-bold text-gray-800">{selectedRetailer.name}</span> ({selectedRetailer.phone})
            </p>

            <form onSubmit={handleToggleCredit} className="space-y-4">
              {!selectedRetailer.isCreditEnabled && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Initial Credit Limit (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    required
                    value={formLimit}
                    onChange={(e) => setFormLimit(e.target.value)}
                    placeholder="e.g. 50000"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Audit Reason (Required)
                </label>
                <textarea
                  required
                  rows="3"
                  value={formReason}
                  onChange={(e) => setFormReason(e.target.value)}
                  placeholder="Explain why this retailer's credit status is being modified..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setToggleModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className={`px-5 py-2.5 text-xs font-black uppercase tracking-wider text-white rounded-xl shadow-md transition-all ${
                    selectedRetailer.isCreditEnabled ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  {actionLoading ? 'Updating...' : selectedRetailer.isCreditEnabled ? 'Disable Credit' : 'Enable Credit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Set Credit Limit */}
      {limitModalOpen && selectedRetailer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-100 space-y-5">
            <h3 className="text-xl font-black text-gray-900">Set Credit Limit</h3>
            <p className="text-xs text-gray-500">
              Retailer: <span className="font-bold text-gray-800">{selectedRetailer.name}</span>
            </p>

            <form onSubmit={handleSetLimit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  New Credit Limit (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  required
                  value={formLimit}
                  onChange={(e) => setFormLimit(e.target.value)}
                  placeholder="Enter credit limit in INR"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="text-[11px] text-gray-400 mt-1">
                  Current Limit: ₹{(selectedRetailer.creditLimit || 0).toLocaleString('en-IN')}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Audit Reason (Required)
                </label>
                <textarea
                  required
                  rows="3"
                  value={formReason}
                  onChange={(e) => setFormReason(e.target.value)}
                  placeholder="Reason for limit modification..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setLimitModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2.5 text-xs font-black uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-all"
                >
                  {actionLoading ? 'Saving...' : 'Update Limit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Manual Credit Adjustment */}
      {adjustModalOpen && selectedRetailer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-100 space-y-5">
            <h3 className="text-xl font-black text-gray-900">Manual Credit Adjustment</h3>
            <p className="text-xs text-gray-500">
              Retailer: <span className="font-bold text-gray-800">{selectedRetailer.name}</span> • Available: ₹{(selectedRetailer.availableCredit || 0).toLocaleString('en-IN')}
            </p>

            <form onSubmit={handleAdjustCredit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Adjustment Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormAdjustType('INCREASE')}
                    className={`py-2 text-xs font-black rounded-xl border transition-all ${
                      formAdjustType === 'INCREASE'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                        : 'bg-white text-gray-500 border-gray-200'
                    }`}
                  >
                    + Increase Credit
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormAdjustType('DECREASE')}
                    className={`py-2 text-xs font-black rounded-xl border transition-all ${
                      formAdjustType === 'DECREASE'
                        ? 'bg-rose-50 text-rose-700 border-rose-300'
                        : 'bg-white text-gray-500 border-gray-200'
                    }`}
                  >
                    - Decrease Credit
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  min="1"
                  step="100"
                  required
                  value={formAdjustAmount}
                  onChange={(e) => setFormAdjustAmount(e.target.value)}
                  placeholder="Enter amount to adjust"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Audit Reason (Required)
                </label>
                <textarea
                  required
                  rows="3"
                  value={formReason}
                  onChange={(e) => setFormReason(e.target.value)}
                  placeholder="Explain the reason for this manual adjustment..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setAdjustModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2.5 text-xs font-black uppercase tracking-wider text-white bg-gray-900 hover:bg-black rounded-xl shadow-md transition-all"
                >
                  {actionLoading ? 'Processing...' : 'Apply Adjustment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Credit Ledger History */}
      {ledgerModalOpen && selectedRetailer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 max-w-4xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-xl font-black text-gray-900">Credit Transaction Audit Ledger</h3>
                <p className="text-xs text-gray-500">
                  Retailer: <span className="font-bold text-gray-800">{selectedRetailer.name}</span> • Limit: ₹{(selectedRetailer.creditLimit || 0).toLocaleString('en-IN')}
                </p>
              </div>
              <button
                onClick={() => setLedgerModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-700 rounded-xl"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-1">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-gray-50 sticky top-0 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Balance Before → After</th>
                    <th className="px-4 py-3">Reason</th>
                    <th className="px-4 py-3">Actor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {ledgerHistory.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-8 text-gray-400">No ledger entries found</td>
                    </tr>
                  ) : (
                    ledgerHistory.map((tx) => (
                      <tr key={tx._id} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3 whitespace-nowrap text-gray-500">
                          {new Date(tx.createdAt).toLocaleString('en-IN')}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                              tx.type.includes('GRANTED') || tx.type.includes('ADDED') || tx.type.includes('REPAID')
                                ? 'bg-emerald-50 text-emerald-700'
                                : tx.type.includes('USED')
                                ? 'bg-rose-50 text-rose-700'
                                : 'bg-blue-50 text-blue-700'
                            }`}
                          >
                            {tx.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-bold text-gray-900">
                          ₹{Number(tx.amount).toLocaleString('en-IN')}
                        </td>
                        <td className="px-4 py-3 text-gray-600 font-mono text-[11px]">
                          ₹{Number(tx.balanceBefore).toLocaleString('en-IN')} → ₹{Number(tx.balanceAfter).toLocaleString('en-IN')}
                        </td>
                        <td className="px-4 py-3 text-gray-700 max-w-xs truncate" title={tx.reason}>
                          {tx.reason}
                        </td>
                        <td className="px-4 py-3 text-gray-500">
                          {tx.createdByName || tx.createdBy || 'System'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-2 border-t border-gray-100">
              <button
                onClick={() => setLedgerModalOpen(false)}
                className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Verify Bank Repayment */}
      {verifyRepaymentModalOpen && selectedRepayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-100 space-y-4">
            <h3 className="text-xl font-black text-gray-900">Approve Bank Repayment</h3>
            <div className="bg-gray-50 p-4 rounded-2xl space-y-2 text-xs text-gray-600">
              <div>Retailer: <span className="font-bold text-gray-900">{selectedRepayment.retailerId?.name}</span></div>
              <div>Amount to Credit: <span className="font-black text-emerald-600 text-base">₹{Number(selectedRepayment.amount).toLocaleString('en-IN')}</span></div>
              <div>UTR Number: <span className="font-mono font-bold text-gray-900">{selectedRepayment.bankTransferDetails?.utr}</span></div>
            </div>

            <form onSubmit={handleVerifyRepayment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Verification Notes (Optional)
                </label>
                <input
                  type="text"
                  value={formAdminNotes}
                  onChange={(e) => setFormAdminNotes(e.target.value)}
                  placeholder="e.g. Bank statement verified with Ref #1234"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setVerifyRepaymentModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2.5 text-xs font-black uppercase tracking-wider text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition-all"
                >
                  {actionLoading ? 'Verifying...' : 'Approve & Credit Balance'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Reject Bank Repayment */}
      {rejectRepaymentModalOpen && selectedRepayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-100 space-y-4">
            <h3 className="text-xl font-black text-rose-600">Reject Repayment</h3>
            <p className="text-xs text-gray-500">
              Rejecting submission for ₹{Number(selectedRepayment.amount).toLocaleString('en-IN')}. Outstanding balance will NOT be updated.
            </p>

            <form onSubmit={handleRejectRepayment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Rejection Reason (Required)
                </label>
                <textarea
                  required
                  rows="3"
                  value={formReason}
                  onChange={(e) => setFormReason(e.target.value)}
                  placeholder="e.g. UTR not found on company bank statement"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectRepaymentModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2.5 text-xs font-black uppercase tracking-wider text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md transition-all"
                >
                  {actionLoading ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
