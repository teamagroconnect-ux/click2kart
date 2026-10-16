import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../lib/api'
import { useToast } from '../../components/Toast'
import PasswordConfirmModal from '../../components/PasswordConfirmModal'

export default function CustomerDetail() {
  const { id } = useParams()
  const nav = useNavigate()
  const { notify } = useToast()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [previewDoc, setPreviewDoc] = useState(null)
  const load = async () => {
    setLoading(true)
    try {
      const { data } = await api.get(`/api/admin/customers/${id}`)
      setData(data)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { load() }, [id])

  const handleDeleteConfirm = async (password) => {
    try {
      await api.delete(`/api/admin/customers/${id}`, { data: { password } })
      setDeleteModalOpen(false)
      notify('Customer deleted', 'success')
      nav('/admin/customers')
    } catch {
      notify('Invalid deletion password', 'error')
    }
  }

  const remove = async () => {
    setDeleteModalOpen(true)
  }

  const approve = async () => {
    await api.post(`/api/admin/customers/${id}/approve`)
    notify('Customer approved', 'success')
    load()
  }

  const skip = async () => {
    await api.post(`/api/admin/customers/${id}/skip`)
    notify('Customer skipped', 'success')
    load()
  }

  if (loading) return (
    <div className="max-w-6xl mx-auto p-8 animate-pulse">
      <div className="h-10 bg-gray-100 rounded-xl w-64 mb-6"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-64 bg-gray-50 rounded-3xl"></div>
        <div className="h-64 bg-gray-50 rounded-3xl"></div>
      </div>
    </div>
  )
  if (!data) return <div className="p-8">Not found</div>
  const { user, orders, bills, partner } = data
  return (
    <>
      <div className="max-w-6xl mx-auto p-8 space-y-8">
        <div className="flex flex-col md:flex-row items-start justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-indigo-500/30">
              {user.name?.charAt(0) || 'C'}
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">{user.name}</h1>
              <div className="flex items-center gap-4 mt-1">
                <div className="text-sm font-bold text-gray-600">{user.phone}</div>
                {user.email && <div className="text-sm text-gray-500">• {user.email}</div>}
              </div>
              <div className="flex items-center gap-3 mt-2">
                <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                  user.approvalStatus === 'approved' || user.isActive
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : user.approvalStatus === 'skipped'
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-rose-50 text-rose-800 border-rose-200'
                }`}>
                  {user.approvalStatus || (user.isActive ? 'APPROVED' : 'PENDING')}
                </span>
                {user.isKycComplete && (
                  <span className="px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-blue-50 text-blue-800 border border-blue-200">
                    KYC COMPLETE
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {(user.approvalStatus !== 'approved' && !user.isActive) && (
              <>
                <button onClick={approve} className="px-5 py-2.5 rounded-2xl bg-gray-900 text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-gray-900/10 hover:bg-gray-800 transition-all">
                  Approve
                </button>
                {user.approvalStatus !== 'skipped' && (
                  <button onClick={skip} className="px-5 py-2.5 rounded-2xl bg-white text-gray-700 border border-gray-200 text-xs font-black uppercase tracking-widest hover:bg-gray-50 transition-all">
                    Skip
                  </button>
                )}
              </>
            )}
            <button onClick={remove} className="px-5 py-2.5 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 text-xs font-black uppercase tracking-widest hover:bg-rose-100 transition-all">
              Delete
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/30">
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Orders Placed</div>
              <div className="text-3xl font-black text-gray-900 mt-1">{orders.length}</div>
            </div>
          </div>
          <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/30">
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Total Spent</div>
              <div className="text-3xl font-black text-gray-900 mt-1">
                ₹{orders.reduce((sum, o) => sum + o.totalEstimate, 0).toLocaleString()}
              </div>
            </div>
          </div>
          <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/30">
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Bills Generated</div>
              <div className="text-3xl font-black text-gray-900 mt-1">{bills.length}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/30">
              <h3 className="text-lg font-black text-gray-900 italic">Recent Orders</h3>
            </div>
            <div className="divide-y divide-gray-50">
              {orders.map(o => (
                <div key={o._id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                  <div className="min-w-0">
                    <div className="font-black text-gray-900">₹{o.totalEstimate.toLocaleString()}</div>
                    <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-0.5">{o.status}</div>
                  </div>
                  <div className="text-xs text-gray-500 font-medium">{new Date(o.createdAt).toLocaleString('en-IN')}</div>
                </div>
              ))}
              {orders.length === 0 && <div className="px-6 py-10 text-center text-gray-400 text-[10px] font-black uppercase tracking-[0.3em]">No orders yet</div>}
            </div>
          </div>
          <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/30">
              <h3 className="text-lg font-black text-gray-900 italic">Recent Bills</h3>
            </div>
            <div className="divide-y divide-gray-50">
              {bills.map(b => (
                <div key={b._id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                  <div className="min-w-0">
                    <div className="font-black text-gray-900">{b.invoiceNumber}</div>
                    <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-0.5">₹{b.payable.toLocaleString()}</div>
                  </div>
                  <div className="text-xs text-gray-500 font-medium">{new Date(b.createdAt).toLocaleString('en-IN')}</div>
                </div>
              ))}
              {bills.length === 0 && <div className="px-6 py-10 text-center text-gray-400 text-[10px] font-black uppercase tracking-[0.3em]">No bills yet</div>}
            </div>
          </div>
        </div>

        {partner && (
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
            <h3 className="text-lg font-black text-gray-900 italic mb-6">Partner Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <KycItem label="Partner Name" value={partner.name} />
              <KycItem label="Partner Email" value={partner.email} />
              <KycItem label="Partner Phone" value={partner.phone} />
              <KycItem label="Invite Code" value={partner.inviteCode} />
              <KycItem label="Business Name" value={partner.businessName} />
              <KycItem label="GST Number" value={partner.gstNumber} />
            </div>
          </div>
        )}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-black text-gray-900 italic">KYC & Account Details</h3>
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
              user.kyc?.status === 'VERIFIED' || user.isKycComplete
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : user.kyc?.status === 'PENDING_VERIFICATION'
                ? 'bg-purple-50 text-purple-800 border-purple-200'
                : user.kyc?.status === 'REJECTED'
                ? 'bg-rose-50 text-rose-800 border-rose-200'
                : 'bg-gray-100 text-gray-600 border-gray-200'
            }`}>
              {user.kyc?.status || (user.isKycComplete ? 'VERIFIED' : 'PENDING')}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <KycItem label="Business Name" value={user.kyc?.businessName} />
            <KycItem label="Business Type" value={user.kyc?.businessType || 'Retail Store'} />
            <KycItem label="GSTIN" value={user.kyc?.gstin} />
            <KycItem label="PAN Number" value={user.kyc?.pan} />
            <KycItem label="Aadhaar Number" value={user.kyc?.aadhaarNumber ? `XXXX-XXXX-${user.kyc.aadhaarNumber.slice(-4)}` : '—'} />
            <KycItem label="Verification Date" value={user.kyc?.verifiedAt ? new Date(user.kyc.verifiedAt).toLocaleDateString('en-IN') : '—'} />
            <KycItem label="Pincode" value={user.kyc?.pincode} />
            <KycItem label="State" value={user.kyc?.state} />
            <KycItem label="City" value={user.kyc?.city} />
            <KycItem label="Address Line 1" value={user.kyc?.addressLine1} className="md:col-span-2" />
            <KycItem label="Address Line 2" value={user.kyc?.addressLine2} className="md:col-span-2" />
          </div>

          {/* Documents Gallery */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4">Official Verification Documents (Click to Enlarge)</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* PAN Document */}
              <div className="border border-gray-200 rounded-2xl p-3 bg-gray-50/50">
                <span className="text-[10px] font-bold text-gray-500 uppercase block mb-1">PAN Card Photo</span>
                {user.kyc?.panCard ? (
                  <div
                    className="relative group rounded-xl overflow-hidden bg-white border border-gray-200 cursor-pointer"
                    onClick={() => setPreviewDoc(user.kyc.panCard)}
                  >
                    <img src={user.kyc.panCard} alt="PAN Card" className="h-32 w-full object-cover group-hover:scale-105 transition-all" />
                    <div className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold">
                      🔍 Click to Zoom
                    </div>
                  </div>
                ) : (
                  <div className="h-32 rounded-xl border border-dashed border-gray-200 flex items-center justify-center text-gray-400 text-xs font-medium">
                    No PAN photo uploaded
                  </div>
                )}
              </div>

              {/* Aadhaar Front */}
              <div className="border border-gray-200 rounded-2xl p-3 bg-gray-50/50">
                <span className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Aadhaar Front Photo</span>
                {(user.kyc?.aadhaarFront || user.kyc?.aadhaarCard) ? (
                  <div
                    className="relative group rounded-xl overflow-hidden bg-white border border-gray-200 cursor-pointer"
                    onClick={() => setPreviewDoc(user.kyc?.aadhaarFront || user.kyc?.aadhaarCard)}
                  >
                    <img
                      src={user.kyc?.aadhaarFront || user.kyc?.aadhaarCard}
                      alt="Aadhaar Front"
                      className="h-32 w-full object-cover group-hover:scale-105 transition-all"
                    />
                    <div className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold">
                      🔍 Click to Zoom
                    </div>
                  </div>
                ) : (
                  <div className="h-32 rounded-xl border border-dashed border-gray-200 flex items-center justify-center text-gray-400 text-xs font-medium">
                    No Aadhaar Front photo
                  </div>
                )}
              </div>

              {/* Aadhaar Back */}
              <div className="border border-gray-200 rounded-2xl p-3 bg-gray-50/50">
                <span className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Aadhaar Back Photo</span>
                {user.kyc?.aadhaarBack ? (
                  <div
                    className="relative group rounded-xl overflow-hidden bg-white border border-gray-200 cursor-pointer"
                    onClick={() => setPreviewDoc(user.kyc.aadhaarBack)}
                  >
                    <img
                      src={user.kyc.aadhaarBack}
                      alt="Aadhaar Back"
                      className="h-32 w-full object-cover group-hover:scale-105 transition-all"
                    />
                    <div className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold">
                      🔍 Click to Zoom
                    </div>
                  </div>
                ) : (
                  <div className="h-32 rounded-xl border border-dashed border-gray-200 flex items-center justify-center text-gray-400 text-xs font-medium">
                    No Aadhaar Back photo
                  </div>
                )}
              </div>
            </div>
          </div>

          {user.kyc?.profilePicture && (
            <div className="mt-6 pt-6 border-t border-gray-50">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-3">Profile Picture</h4>
              <img src={user.kyc.profilePicture} alt="Profile" className="h-24 w-24 rounded-2xl border border-gray-100 shadow-sm" />
            </div>
          )}
        </div>
      </div>

      {previewDoc && (
        <div
          className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setPreviewDoc(null)}
        >
          <div
            className="relative max-w-4xl max-h-[95vh] bg-white rounded-3xl overflow-hidden shadow-2xl p-4 flex flex-col items-center"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-full flex items-center justify-between pb-3 border-b border-gray-100">
              <span className="text-sm font-extrabold text-gray-900">Official Customer Document</span>
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="px-3.5 py-1.5 bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold rounded-xl"
              >
                Close ✕
              </button>
            </div>
            <div className="p-3 overflow-auto max-h-[80vh]">
              <img src={previewDoc} alt="Document Preview" className="max-h-[75vh] w-auto rounded-2xl object-contain mx-auto" />
            </div>
          </div>
        </div>
      )}

      <PasswordConfirmModal
        open={deleteModalOpen}
        title="Delete Customer"
        message="Enter deletion password to confirm permanent removal:"
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setDeleteModalOpen(false)
        }}
      />
    </>
  )
}

function KycItem({ label, value, className = '' }) {
  return (
    <div className={className}>
      <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">{label}</div>
      <div className={`px-4 py-3 rounded-2xl border text-sm font-bold transition-all ${
        value ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-gray-50 border-gray-100 text-gray-400'
      }`}>
        {value || '—'}
      </div>
    </div>
  )
}
