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
  const { user, orders, bills } = data
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

        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
          <h3 className="text-lg font-black text-gray-900 italic mb-6">KYC & Account Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <KycItem label="Business Name" value={user.kyc?.businessName} />
            <KycItem label="GSTIN" value={user.kyc?.gstin} />
            <KycItem label="PAN" value={user.kyc?.pan} />
            <KycItem label="Pincode" value={user.kyc?.pincode} />
            <KycItem label="State" value={user.kyc?.state} />
            <KycItem label="City" value={user.kyc?.city} />
            <KycItem label="Address Line 1" value={user.kyc?.addressLine1} className="md:col-span-2" />
            <KycItem label="Address Line 2" value={user.kyc?.addressLine2} className="md:col-span-2" />
          </div>
          {user.kyc?.profilePicture && (
            <div className="mt-6 pt-6 border-t border-gray-50">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-3">Profile Picture</h4>
              <img src={user.kyc.profilePicture} alt="Profile" className="h-24 w-24 rounded-2xl border border-gray-100 shadow-sm" />
            </div>
          )}
        </div>
      </div>

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
