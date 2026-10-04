import React, { useEffect, useState } from 'react'
import api from '../../lib/api'
import { useToast } from '../../components/Toast'

export default function CreditManagement() {
  const { notify } = useToast()
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

  // Retailer Quick Detail Modal state
  const [quickDetailRetailer, setQuickDetailRetailer] = useState(null)
  const [quickDetailOpen, setQuickDetailOpen] = useState(false)
  const [loadingQuickDetail, setLoadingQuickDetail] = useState(false)

  // Modals state
  const [selectedRetailer, setSelectedRetailer] = useState(null)
  const [toggleModalOpen, setToggleModalOpen] = useState(false)
  const [limitModalOpen, setLimitModalOpen] = useState(false)
  const [adjustModalOpen, setAdjustModalOpen] = useState(false)
  const [ledgerModalOpen, setLedgerModalOpen] = useState(false)

  // Form states
  const [formReason, setFormReason] = useState('')
  const [formLimit, setFormLimit] = useState('')
  const [formAdjustAmount, setFormAdjustAmount] = useState('')
  const [formAdjustType, setFormAdjustType] = useState('INCREASE')
  const [formAdminNotes, setFormAdminNotes] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [ledgerHistory, setLedgerHistory] = useState([])
  const [reconciling, setReconciling] = useState(false)
  const [notifyModalOpen, setNotifyModalOpen] = useState(false)
  const [notifying, setNotifying] = useState(false)

  // Reason presets
  const ADJUST_PRESETS = {
    INCREASE: [
      'Credit limit enhancement based on consistent repayment history',
      'Seasonal credit enhancement for festive/bulk wholesale demand',
      'Approved higher credit facility per business verification',
      'Operational limit increase per admin review'
    ],
    DECREASE: [
      'Periodic risk management limit reduction',
      'Limit reduction per merchant formal request',
      'Overdue balance containment adjustment',
      'Credit line reduction following account review'
    ]
  }

  const TOGGLE_PRESETS = {
    ENABLE: [
      'Approved after verification of trade license and business volume',
      'KYC verified and approved for B2B wholesale credit facility',
      'Initial credit limit granted per onboarding criteria'
    ],
    DISABLE: [
      'Temporarily deactivated per credit risk assessment',
      'Credit facility paused per merchant request',
      'Overdue outstanding dues hold pending clearance',
      'Account deactivated following annual compliance review'
    ]
  }

  const REJECT_PRESETS = [
    'UTR transaction not found in company bank account statement',
    'Amount mismatch between payment receipt and bank credit',
    'Payment receipt image is illegible or missing UTR details',
    'Duplicate payment claim already credited previously'
  ]

  // Notify All Outstanding Balance Holders
  const handleNotifyOutstanding = async () => {
    setNotifying(true)
    try {
      const { data } = await api.post('/api/credit/admin/notify-outstanding')
      notify(data.message || `Sent reminders to ${data.sentCount || 0} retailers`, 'success')
      setNotifyModalOpen(false)
    } catch (err) {
      notify(err?.response?.data?.message || err?.response?.data?.error || 'Failed to send notifications', 'error')
    } finally {
      setNotifying(false)
    }
  }

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

  // Open Retailer Quick Detail Modal
  const openRetailerQuickDetail = async (retailer) => {
    setQuickDetailOpen(true)
    setLoadingQuickDetail(true)
    try {
      const { data } = await api.get(`/api/admin/customers/${retailer._id}`)
      setQuickDetailRetailer(data)
    } catch (err) {
      setQuickDetailRetailer({ user: retailer, orders: [] })
    } finally {
      setLoadingQuickDetail(false)
    }
  }

  useEffect(() => {
    loadRetailers()
  }, [searchQ, statusFilter])

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
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setNotifyModalOpen(true)}
            disabled={notifying}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-black uppercase tracking-wider rounded-2xl transition-all shadow-md active:scale-95 disabled:opacity-50"
            title="Dispatch payment reminders to all retailers with outstanding dues"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            Notify Outstanding ({stats.totalOutstanding > 0 ? `₹${(stats.totalOutstanding || 0).toLocaleString('en-IN')}` : 'All Clear'})
          </button>
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

      {/* Retailers Directory */}
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
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loadingRetailers ? (
                    <tr>
                      <td colSpan="6" className="text-center py-12 text-gray-400">Loading retailers...</td>
                    </tr>
                  ) : retailers.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-12 text-gray-400">No retailers found matching criteria</td>
                    </tr>
                  ) : (
                    retailers.map((r) => {
                      const isEn = Boolean(r.isCreditEnabled)
                      return (
                        <tr key={r._id} className="hover:bg-gray-50/50 transition-colors">
                          <td
                            className="px-6 py-4 cursor-pointer hover:bg-blue-50/50 transition-colors"
                            onClick={() => openRetailerQuickDetail(r)}
                            title="Click to view full retailer KYC & trade details"
                          >
                            <div className="font-bold text-gray-900 group flex items-center gap-1.5">
                              <span>{r.name}</span>
                              <span className="text-[10px] text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity font-semibold">ℹ️ Details</span>
                            </div>
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
                                      setFormAdjustAmount('')
                                      setFormAdjustType('INCREASE')
                                      setFormReason('Credit limit enhancement based on consistent repayment history')
                                      setAdjustModalOpen(true)
                                    }}
                                    className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-xl text-xs font-bold transition-all"
                                  >
                                    Adjust
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedRetailer(r)
                                      setFormReason('Temporarily deactivated per credit risk assessment')
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
                                    setFormReason('Approved after verification of trade license and business volume')
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
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Audit Reason (Required)
                  </label>
                  <span className="text-[10px] text-gray-400 font-medium">Quick Presets:</span>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {(selectedRetailer.isCreditEnabled ? TOGGLE_PRESETS.DISABLE : TOGGLE_PRESETS.ENABLE).map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setFormReason(preset)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all text-left ${
                        formReason === preset
                          ? 'bg-blue-50 text-blue-700 border-blue-300'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-transparent'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
                <textarea
                  required
                  rows="2"
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
                    onClick={() => {
                      setFormAdjustType('INCREASE')
                      setFormReason('Credit limit enhancement based on consistent repayment history')
                    }}
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
                    onClick={() => {
                      setFormAdjustType('DECREASE')
                      setFormReason('Periodic risk management limit reduction')
                    }}
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
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Audit Reason (Required)
                  </label>
                  <span className="text-[10px] text-gray-400 font-medium">Quick Presets:</span>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {(ADJUST_PRESETS[formAdjustType] || []).map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setFormReason(preset)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all text-left ${
                        formReason === preset
                          ? 'bg-blue-50 text-blue-700 border-blue-300'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-transparent'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
                <textarea
                  required
                  rows="2"
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

      {/* MODAL: Retailer Quick Detail */}
      {quickDetailOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 bg-gradient-to-r from-gray-900 to-gray-800 text-white flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black tracking-tight">Retailer Account Profile</h3>
                <p className="text-xs text-gray-400">KYC Verification, Credit Limits & Trade Details</p>
              </div>
              <button
                onClick={() => setQuickDetailOpen(false)}
                className="p-2 text-gray-400 hover:text-white rounded-xl transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              {loadingQuickDetail ? (
                <div className="py-12 text-center text-gray-400 text-xs">Loading retailer details...</div>
              ) : quickDetailRetailer ? (
                <>
                  {/* Header identity */}
                  {(() => {
                    const u = quickDetailRetailer.user || quickDetailRetailer
                    const kyc = u.kyc || {}
                    return (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-black text-gray-900">{u.name}</span>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              u.isCreditEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-600'
                            }`}>
                              {u.isCreditEnabled ? 'Credit Active' : 'No Credit'}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              u.isKycComplete ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {u.isKycComplete ? 'KYC Verified' : 'KYC Pending'}
                            </span>
                          </div>
                          <div className="text-xs font-semibold text-gray-600 mt-1">
                            {kyc.businessName ? `🏢 ${kyc.businessName}` : 'Individual Trader'}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            📞 {u.phone} {u.email ? `• ✉️ ${u.email}` : ''}
                          </div>
                        </div>
                      </div>
                    )
                  })()}

                  {/* Credit Metrics */}
                  {(() => {
                    const u = quickDetailRetailer.user || quickDetailRetailer
                    return (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="bg-blue-50/60 p-3 rounded-2xl border border-blue-100 text-center">
                          <div className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">Credit Limit</div>
                          <div className="text-base font-black text-blue-700 mt-1">₹{(u.creditLimit || 0).toLocaleString('en-IN')}</div>
                        </div>
                        <div className="bg-emerald-50/60 p-3 rounded-2xl border border-emerald-100 text-center">
                          <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Available</div>
                          <div className="text-base font-black text-emerald-700 mt-1">₹{(u.availableCredit || 0).toLocaleString('en-IN')}</div>
                        </div>
                        <div className="bg-amber-50/60 p-3 rounded-2xl border border-amber-100 text-center">
                          <div className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">Used Credit</div>
                          <div className="text-base font-black text-amber-700 mt-1">₹{(u.usedCredit || 0).toLocaleString('en-IN')}</div>
                        </div>
                        <div className="bg-rose-50/60 p-3 rounded-2xl border border-rose-100 text-center">
                          <div className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">Outstanding</div>
                          <div className="text-base font-black text-rose-700 mt-1">₹{(u.outstandingBalance || 0).toLocaleString('en-IN')}</div>
                        </div>
                      </div>
                    )
                  })()}

                  {/* Trade & Tax Information */}
                  {(() => {
                    const u = quickDetailRetailer.user || quickDetailRetailer
                    const kyc = u.kyc || {}
                    return (
                      <div className="bg-white border border-gray-100 rounded-2xl p-4 space-y-3">
                        <h4 className="text-xs font-black uppercase tracking-wider text-gray-400">Trade & Tax Registration</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div>
                            <span className="text-gray-400 font-medium">Business / Trade Name:</span>
                            <div className="font-bold text-gray-900">{kyc.businessName || '—'}</div>
                          </div>
                          <div>
                            <span className="text-gray-400 font-medium">GSTIN:</span>
                            <div className="font-mono font-bold text-gray-900">{kyc.gstin || '—'}</div>
                          </div>
                          <div>
                            <span className="text-gray-400 font-medium">PAN Number:</span>
                            <div className="font-mono font-bold text-gray-900">{kyc.pan || '—'}</div>
                          </div>
                          <div>
                            <span className="text-gray-400 font-medium">Account Role:</span>
                            <div className="font-bold text-gray-900 uppercase">{u.role || 'RETAILER'}</div>
                          </div>
                        </div>
                      </div>
                    )
                  })()}

                  {/* Registered Business & Billing Address */}
                  {(() => {
                    const u = quickDetailRetailer.user || quickDetailRetailer
                    const kyc = u.kyc || {}
                    return (
                      <div className="bg-white border border-gray-100 rounded-2xl p-4 space-y-2">
                        <h4 className="text-xs font-black uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                          <span>📍</span> Registered Business / KYC Address
                        </h4>
                        {kyc.addressLine1 || kyc.city || kyc.pincode ? (
                          <div className="text-xs text-gray-700 leading-relaxed bg-gray-50/60 p-3 rounded-xl border border-gray-100">
                            <div>{kyc.addressLine1}</div>
                            {kyc.addressLine2 && <div>{kyc.addressLine2}</div>}
                            <div className="font-semibold text-gray-900">
                              {[kyc.city, kyc.district, kyc.state].filter(Boolean).join(', ')} — {kyc.pincode}
                            </div>
                          </div>
                        ) : (
                          <div className="text-xs text-gray-400 italic">No business address recorded in KYC profile.</div>
                        )}
                      </div>
                    )
                  })()}
                </>
              ) : null}
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
              <a
                href={quickDetailRetailer?.user?._id ? `/admin/retailers/${quickDetailRetailer.user._id}` : '/admin/retailers'}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline"
              >
                Open Full Retailer Profile ↗
              </a>
              <button
                type="button"
                onClick={() => setQuickDetailOpen(false)}
                className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-bold rounded-xl transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Notify Outstanding Retailers */}
      {notifyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-black text-gray-900">Notify Outstanding Retailers</h3>
                <p className="text-xs text-gray-500">Dispatch repayment notices via official email</p>
              </div>
            </div>

            <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-100 space-y-2 text-xs text-amber-900">
              <p className="font-semibold">
                This action will immediately email all credit-enabled retailers who currently have an outstanding balance.
              </p>
              <div className="pt-1 text-[11px] text-amber-800 space-y-1">
                <div>• Total Outstanding: <strong>₹{(stats.totalOutstanding || 0).toLocaleString('en-IN')}</strong></div>
                <div>• Active Credit Retailers: <strong>{stats.enabledCount}</strong></div>
                <div>• Notice includes: statement breakdown, outstanding balance, online Razorpay repayment link, and credit terms notice.</div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setNotifyModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleNotifyOutstanding}
                disabled={notifying}
                className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {notifying ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Sending Reminders...
                  </>
                ) : (
                  'Send Notifications Now'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
