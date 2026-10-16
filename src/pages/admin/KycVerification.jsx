import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../lib/api'
import { useToast } from '../../components/Toast'

export default function KycVerification() {
  const { notify } = useToast()

  const [loading, setLoading] = useState(true)
  const [data, setData] = useState({ items: [], counts: { pending: 0, verified: 0, rejected: 0, total: 0 } })
  const [statusFilter, setStatusFilter] = useState('PENDING')
  const [searchQuery, setSearchQuery] = useState('')
  const [actionLoading, setActionLoading] = useState(null) // ID of retailer being acted upon

  // Image zoom modal
  const [zoomedImage, setZoomedImage] = useState(null)
  const [zoomedDocTitle, setZoomedDocTitle] = useState('')

  // Rejection modal
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [selectedRetailer, setSelectedRetailer] = useState(null)
  const [rejectReason, setRejectReason] = useState('')

  const loadData = async () => {
    try {
      setLoading(true)
      const { data: res } = await api.get('/api/admin/kyc/requests', {
        params: {
          status: statusFilter,
          q: searchQuery.trim() || undefined
        }
      })
      setData(res || { items: [], counts: { pending: 0, verified: 0, rejected: 0, total: 0 } })
    } catch (err) {
      console.error('Failed to load KYC requests:', err)
      notify('Failed to load KYC records', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [statusFilter])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    loadData()
  }

  const handleApprove = async (retailer) => {
    if (!window.confirm(`Are you sure you want to approve KYC for "${retailer.kyc?.businessName || retailer.name}"?`)) {
      return
    }

    setActionLoading(retailer._id)
    try {
      await api.post(`/api/admin/customers/${retailer._id}/approve-kyc`)
      notify(`KYC approved for ${retailer.name}! Wholesale access unlocked.`, 'success')
      await loadData()
    } catch (err) {
      notify(err?.response?.data?.error || 'Approval failed', 'error')
    } finally {
      setActionLoading(null)
    }
  }

  const handleOpenReject = (retailer) => {
    setSelectedRetailer(retailer)
    setRejectReason('')
    setRejectModalOpen(true)
  }

  const handleConfirmReject = async (e) => {
    e.preventDefault()
    if (!selectedRetailer) return
    if (!rejectReason.trim()) {
      notify('Please provide a reason for revision', 'error')
      return
    }

    setActionLoading(selectedRetailer._id)
    try {
      await api.post(`/api/admin/customers/${selectedRetailer._id}/reject-kyc`, {
        reason: rejectReason.trim()
      })
      notify(`KYC rejected. Retailer notified to re-upload.`, 'success')
      setRejectModalOpen(false)
      setSelectedRetailer(null)
      await loadData()
    } catch (err) {
      notify(err?.response?.data?.error || 'Rejection failed', 'error')
    } finally {
      setActionLoading(null)
    }
  }

  const counts = data.counts || { pending: 0, verified: 0, rejected: 0, total: 0 }

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-8 space-y-6">
      
      {/* Top Header Card */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-gradient-to-br from-violet-600 to-indigo-600 text-white rounded-2xl shadow-lg shadow-violet-200">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="m9 12 2 2 4-4" />
              </svg>
            </span>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">KYC Verification Desk</h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Review and manually approve retailer Aadhaar, PAN, and business licenses
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={loadData}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-slate-900 text-xs font-bold shadow-sm hover:bg-slate-50 transition-all flex items-center gap-1.5"
          >
            <span>↻ Refresh</span>
          </button>
          <Link
            to="/admin/retailers"
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition-all"
          >
            All Retailers →
          </Link>
        </div>
      </div>

      {/* Stats Counter Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <button
          type="button"
          onClick={() => setStatusFilter('PENDING')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            statusFilter === 'PENDING'
              ? 'bg-purple-50/80 border-purple-200 ring-2 ring-purple-400'
              : 'bg-white border-slate-200/80 hover:bg-slate-50'
          }`}
        >
          <div className="text-[10px] font-black uppercase tracking-wider text-purple-700">Pending Review</div>
          <div className="text-2xl font-black text-purple-900 mt-1">{counts.pending}</div>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('VERIFIED')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            statusFilter === 'VERIFIED'
              ? 'bg-emerald-50/80 border-emerald-200 ring-2 ring-emerald-400'
              : 'bg-white border-slate-200/80 hover:bg-slate-50'
          }`}
        >
          <div className="text-[10px] font-black uppercase tracking-wider text-emerald-700">Verified Retailers</div>
          <div className="text-2xl font-black text-emerald-900 mt-1">{counts.verified}</div>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('REJECTED')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            statusFilter === 'REJECTED'
              ? 'bg-rose-50/80 border-rose-200 ring-2 ring-rose-400'
              : 'bg-white border-slate-200/80 hover:bg-slate-50'
          }`}
        >
          <div className="text-[10px] font-black uppercase tracking-wider text-rose-700">Revision Required</div>
          <div className="text-2xl font-black text-rose-900 mt-1">{counts.rejected}</div>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('all')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            statusFilter === 'all'
              ? 'bg-slate-100 border-slate-300 ring-2 ring-slate-400'
              : 'bg-white border-slate-200/80 hover:bg-slate-50'
          }`}
        >
          <div className="text-[10px] font-black uppercase tracking-wider text-slate-500">All Submissions</div>
          <div className="text-2xl font-black text-slate-800 mt-1">{counts.total}</div>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full flex items-center gap-2">
          <input
            type="text"
            placeholder="Search by Business Name, Owner, Phone, PAN, Aadhaar, GSTIN..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 font-medium"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-[10px] uppercase font-bold text-slate-400">Filter:</span>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            <option value="PENDING">Pending Review ({counts.pending})</option>
            <option value="VERIFIED">Approved / Verified ({counts.verified})</option>
            <option value="REJECTED">Revision Required ({counts.rejected})</option>
            <option value="all">All Retailers</option>
          </select>
        </div>
      </div>

      {/* Retailer Applications Feed */}
      {loading ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
          <div className="w-10 h-10 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-600">Loading KYC Applications...</p>
        </div>
      ) : data.items.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
          <span className="text-3xl block">📋</span>
          <h3 className="text-sm font-bold text-slate-800">No Applications Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {statusFilter === 'PENDING'
              ? 'No retailer applications currently waiting for manual approval.'
              : 'No records matched the selected filter or search criteria.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.items.map(retailer => {
            const kyc = retailer.kyc || {}
            const isApproved = retailer.approvalStatus === 'approved' || kyc.status === 'VERIFIED'
            const isPending = retailer.approvalStatus === 'pending' || kyc.status === 'PENDING_VERIFICATION'
            const isRej = retailer.approvalStatus === 'rejected' || kyc.status === 'REJECTED'

            return (
              <div
                key={retailer._id}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 hover:border-slate-300 transition-all space-y-5"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-md shadow-violet-200 flex-shrink-0">
                      {(kyc.businessName || retailer.name || 'R').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-extrabold text-slate-900">
                          {kyc.businessName || retailer.name}
                        </h3>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                          isApproved ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          isPending ? 'bg-purple-50 text-purple-700 border-purple-200' :
                          isRej ? 'bg-rose-50 text-rose-700 border-rose-200' :
                          'bg-slate-100 text-slate-600 border-slate-200'
                        }`}>
                          {isApproved ? 'APPROVED ✓' : isPending ? 'PENDING APPROVAL' : isRej ? 'REVISION REQUESTED' : 'UNVERIFIED'}
                        </span>
                        {kyc.businessType && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                            {kyc.businessType}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 font-medium flex-wrap">
                        <span>👤 Owner: <strong className="text-slate-700">{retailer.name}</strong></span>
                        <span>•</span>
                        <span>📞 {retailer.phone}</span>
                        {retailer.email && (
                          <>
                            <span>•</span>
                            <span>✉️ {retailer.email}</span>
                          </>
                        )}
                        <span>•</span>
                        <span>📅 Submitted: {kyc.submittedAt ? new Date(kyc.submittedAt).toLocaleString('en-IN') : new Date(retailer.createdAt).toLocaleDateString('en-IN')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Manual Approval Action Buttons */}
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <Link
                      to={`/admin/retailers/${retailer._id}`}
                      className="px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors"
                      title="View full history & edit"
                    >
                      Retailer Details ↗
                    </Link>

                    {isPending && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleOpenReject(retailer)}
                          disabled={actionLoading === retailer._id}
                          className="px-3.5 py-2 text-xs font-bold rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-50"
                        >
                          Request Revision
                        </button>

                        <button
                          type="button"
                          onClick={() => handleApprove(retailer)}
                          disabled={actionLoading === retailer._id}
                          className="px-5 py-2 text-xs font-extrabold rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md shadow-emerald-200 transition-all disabled:opacity-50 flex items-center gap-1.5"
                        >
                          {actionLoading === retailer._id ? (
                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <span>✓ Manually Approve</span>
                          )}
                        </button>
                      </>
                    )}

                    {isApproved && (
                      <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1">
                        <span>✓ Verified on {kyc.verifiedAt ? new Date(kyc.verifiedAt).toLocaleDateString('en-IN') : 'Record'}</span>
                      </span>
                    )}

                    {isRej && (
                      <button
                        type="button"
                        onClick={() => handleApprove(retailer)}
                        disabled={actionLoading === retailer._id}
                        className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-colors"
                      >
                        Override & Approve
                      </button>
                    )}
                  </div>
                </div>

                {/* Identity & License Data Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  {/* Address & GST */}
                  <div className="p-3.5 bg-slate-50/70 rounded-2xl border border-slate-100 space-y-2">
                    <div>
                      <span className="text-[10px] font-black uppercase text-slate-400 block">Registered Shop Address</span>
                      <span className="text-slate-800 font-semibold leading-relaxed block mt-0.5">
                        {kyc.addressLine1} {kyc.addressLine2 ? `, ${kyc.addressLine2}` : ''}
                        <br />
                        {kyc.city}, {kyc.state} - <strong>{kyc.pincode}</strong>
                      </span>
                    </div>
                    {kyc.gstin ? (
                      <div className="pt-2 border-t border-slate-200">
                        <span className="text-[10px] font-black uppercase text-slate-400 block">GSTIN License</span>
                        <span className="font-mono font-bold text-slate-900">{kyc.gstin}</span>
                      </div>
                    ) : (
                      <div className="pt-1 text-[11px] text-slate-400 italic">No GSTIN provided (Exempt/Composite)</div>
                    )}
                  </div>

                  {/* PAN Card Photo & Number */}
                  <div className="p-3.5 bg-slate-50/70 rounded-2xl border border-slate-100 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-black uppercase text-slate-400">PAN Card</span>
                        <span className="font-mono font-extrabold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 text-xs">
                          {kyc.pan || '—'}
                        </span>
                      </div>
                      {kyc.panCard ? (
                        <div
                          className="relative group rounded-xl overflow-hidden border border-slate-200 bg-white cursor-pointer mt-2"
                          onClick={() => {
                            setZoomedImage(kyc.panCard)
                            setZoomedDocTitle(`PAN Card - ${kyc.pan || retailer.name}`)
                          }}
                        >
                          <img src={kyc.panCard} alt="PAN Card" className="h-28 w-full object-cover group-hover:scale-105 transition-all" />
                          <div className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[11px] font-bold">
                            🔍 Click to Enlarge
                          </div>
                        </div>
                      ) : (
                        <div className="h-28 rounded-xl border border-dashed border-slate-200 flex items-center justify-center text-slate-400 text-xs">
                          No PAN photo uploaded
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Aadhaar Photos & Number */}
                  <div className="p-3.5 bg-slate-50/70 rounded-2xl border border-slate-100 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-black uppercase text-slate-400">Aadhaar Card</span>
                        <span className="font-mono font-extrabold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-xs">
                          {kyc.aadhaarNumber ? `XXXX-XXXX-${kyc.aadhaarNumber.slice(-4)}` : '—'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {kyc.aadhaarFront ? (
                          <div
                            className="relative group rounded-xl overflow-hidden border border-slate-200 bg-white cursor-pointer"
                            onClick={() => {
                              setZoomedImage(kyc.aadhaarFront)
                              setZoomedDocTitle(`Aadhaar Front - ${retailer.name}`)
                            }}
                          >
                            <img src={kyc.aadhaarFront} alt="Aadhaar Front" className="h-28 w-full object-cover group-hover:scale-105 transition-all" />
                            <div className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold">
                              Front 🔍
                            </div>
                          </div>
                        ) : (
                          <div className="h-28 rounded-xl border border-dashed border-slate-200 flex items-center justify-center text-slate-400 text-[10px] text-center p-1">
                            No Front Photo
                          </div>
                        )}

                        {kyc.aadhaarBack ? (
                          <div
                            className="relative group rounded-xl overflow-hidden border border-slate-200 bg-white cursor-pointer"
                            onClick={() => {
                              setZoomedImage(kyc.aadhaarBack)
                              setZoomedDocTitle(`Aadhaar Back - ${retailer.name}`)
                            }}
                          >
                            <img src={kyc.aadhaarBack} alt="Aadhaar Back" className="h-28 w-full object-cover group-hover:scale-105 transition-all" />
                            <div className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold">
                              Back 🔍
                            </div>
                          </div>
                        ) : (
                          <div className="h-28 rounded-xl border border-dashed border-slate-200 flex items-center justify-center text-slate-400 text-[10px] text-center p-1">
                            Back (Not provided)
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Show Rejection Feedback Banner if present */}
                {kyc.rejectionReason && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center justify-between">
                    <div>
                      <strong>Last Feedback to Retailer:</strong> {kyc.rejectionReason}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* ── HIGH RESOLUTION DOCUMENT PREVIEW MODAL ── */}
      {zoomedImage && (
        <div
          className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setZoomedImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-[95vh] bg-white rounded-3xl overflow-hidden shadow-2xl p-4 flex flex-col items-center"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-full flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-sm font-extrabold text-slate-900">{zoomedDocTitle || 'Document Full Preview'}</span>
              <button
                type="button"
                onClick={() => setZoomedImage(null)}
                className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all"
              >
                Close ✕
              </button>
            </div>
            <div className="p-3 overflow-auto max-h-[80vh]">
              <img
                src={zoomedImage}
                alt="Enlarged Document"
                className="max-h-[75vh] w-auto rounded-2xl object-contain shadow-sm mx-auto"
              />
            </div>
            <div className="pt-2 text-xs text-slate-500 font-medium text-center">
              Click anywhere outside or Close to exit
            </div>
          </div>
        </div>
      )}

      {/* ── REJECTION / REVISION MODAL ── */}
      {rejectModalOpen && selectedRetailer && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Request Document Revision</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Retailer: <strong>{selectedRetailer.kyc?.businessName || selectedRetailer.name}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setRejectModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmReject} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Rejection Reason / Required Changes <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Specify what needs to be fixed (e.g. Aadhaar photo is blurry, PAN name doesn't match registered owner, wrong GSTIN)..."
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-violet-500 outline-none"
                />
              </div>

              {/* Quick Preset Buttons */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Quick Reasons:</span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Blurry Aadhaar photo. Please re-upload a clear picture.',
                    'PAN Card photo is cut or unreadable.',
                    'Business name mismatch with GST registration.',
                    'Invalid address proof.'
                  ].map(preset => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setRejectReason(preset)}
                      className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-lg transition-colors text-left"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-rose-50 rounded-xl text-[11px] text-rose-800 leading-relaxed border border-rose-100">
                ⚠️ Sending this will mark the application as <strong>Revision Needed</strong>, notify the retailer by email, and allow them to upload fresh documents on their portal.
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading === selectedRetailer._id}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-md transition-all disabled:opacity-50"
                >
                  Confirm & Send Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
