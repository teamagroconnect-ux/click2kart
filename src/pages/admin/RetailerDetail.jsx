import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../lib/api'
import { useToast } from '../../components/Toast'
import PasswordConfirmModal from '../../components/PasswordConfirmModal'

export default function RetailerDetail() {
  const { id } = useParams()
  const nav = useNavigate()
  const { notify } = useToast()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState(null)
  const [partnerForm, setPartnerForm] = useState(null)
  const [partnerError, setPartnerError] = useState('')
  const [saving, setSaving] = useState(false)
  const load = async () => {
    setLoading(true)
    try {
      const { data } = await api.get(`/api/admin/customers/${id}`)
      setData(data)
      setFormData({
        name: data.user.name || '',
        phone: data.user.phone || '',
        email: data.user.email || '',
        kyc: {
          businessName: data.user.kyc?.businessName || '',
          gstin: data.user.kyc?.gstin || '',
          pan: data.user.kyc?.pan || '',
          pincode: data.user.kyc?.pincode || '',
          state: data.user.kyc?.state || '',
          city: data.user.kyc?.city || '',
          addressLine1: data.user.kyc?.addressLine1 || '',
          addressLine2: data.user.kyc?.addressLine2 || '',
          partnerInviteCode: data.user.kyc?.partnerInviteCode || ''
        },
        deliverySettings: {
          delhiveryEnabled: data.user.deliverySettings?.delhiveryEnabled ?? true,
          localDeliveryEnabled: data.user.deliverySettings?.localDeliveryEnabled ?? false
        }
      })
      setPartnerForm(data.partner ? {
        name: data.partner.name || '',
        email: data.partner.email || '',
        phone: data.partner.phone || '',
        businessName: data.partner.businessName || '',
        gstNumber: data.partner.gstNumber || '',
        panNumber: data.partner.panNumber || '',
        address: data.partner.address || '',
        city: data.partner.city || '',
        district: data.partner.district || '',
        state: data.partner.state || '',
        pincode: data.partner.pincode || '',
        inviteCode: data.partner.inviteCode || ''
      } : null)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { load() }, [id])

  const handleDeleteConfirm = async (password) => {
    try {
      await api.delete(`/api/admin/customers/${id}`, { data: { password } })
      setDeleteModalOpen(false)
      notify('Retailer deleted', 'success')
      nav('/admin/customers')
    } catch {
      notify('Invalid deletion password', 'error')
    }
  }

  const remove = async () => {
    setDeleteModalOpen(true)
  }

  const handleSave = async () => {
    if (!formData) return
    if (formData.kyc?.partnerInviteCode && !/^\d{4}$/.test(formData.kyc.partnerInviteCode)) {
      notify('Partner invite code must be a 4-digit number', 'error')
      return
    }

    setSaving(true)
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        kyc: formData.kyc,
        partnerInviteCode: formData.kyc?.partnerInviteCode || '',
        deliverySettings: formData.deliverySettings
      }
      if (partnerForm) {
        payload.partnerUpdate = partnerForm
      }
      await api.put(`/api/admin/customers/${id}`, payload)
      notify('Retailer updated successfully', 'success')
      setEditMode(false)
      await load()
    } catch (err) {
      notify(err?.response?.data?.error || 'Failed to update retailer', 'error')
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    if (!editMode || !formData) return
    const code = String(formData.kyc?.partnerInviteCode || '').trim()
    if (!/^\d{4}$/.test(code)) {
      setPartnerForm(null)
      if (!code) {
        setPartnerError('')
      } else {
        setPartnerError('Enter a valid 4-digit partner invite code')
      }
      return
    }

    let cancelled = false
    const fetchPartner = async () => {
      setPartnerError('')
      try {
        const { data } = await api.get(`/api/admin/partners/invite/${code}`)
        if (cancelled) return
        setPartnerForm({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          businessName: data.businessName || '',
          gstNumber: data.gstNumber || '',
          panNumber: data.panNumber || '',
          address: data.address || '',
          city: data.city || '',
          district: data.district || '',
          state: data.state || '',
          pincode: data.pincode || '',
          inviteCode: data.inviteCode || ''
        })
      } catch (err) {
        if (cancelled) return
        setPartnerForm(null)
        setPartnerError(err?.response?.status === 404 ? 'No partner found with this invite code' : 'Failed to load partner details')
      }
    }

    fetchPartner()
    return () => { cancelled = true }
  }, [editMode, formData])

  const approve = async () => {
    await api.post(`/api/admin/customers/${id}/approve`)
    notify('Retailer approved', 'success')
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
          <div className="flex flex-wrap items-center gap-3">
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
            <button onClick={() => setEditMode((prev) => !prev)} className="px-5 py-2.5 rounded-2xl bg-blue-600 text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-200/30 hover:bg-blue-500 transition-all">
              {editMode ? 'Cancel Edit' : 'Edit Details'}
            </button>
            <button onClick={remove} className="px-5 py-2.5 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 text-xs font-black uppercase tracking-widest hover:bg-rose-100 transition-all">
              Delete
            </button>
          </div>
        </div>

        {editMode && formData && (
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-black text-gray-900">Edit Retailer & Partner Details</h3>
                <p className="text-sm text-gray-500">Update retailer details, KYC fields, and partner assignment.</p>
              </div>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-3 rounded-2xl bg-emerald-600 text-white text-xs font-black uppercase tracking-widest hover:bg-emerald-500 transition-all disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Retailer Name"
                value={formData.name}
                onChange={(value) => setFormData(prev => ({ ...prev, name: value }))}
              />
              <FormField
                label="Retailer Phone"
                value={formData.phone}
                onChange={(value) => setFormData(prev => ({ ...prev, phone: value }))}
              />
              <FormField
                label="Retailer Email"
                value={formData.email}
                onChange={(value) => setFormData(prev => ({ ...prev, email: value }))}
              />
              <div>
                <FormField
                  label="Partner Invite Code"
                  value={formData.kyc.partnerInviteCode}
                  onChange={(value) => setFormData(prev => ({ ...prev, kyc: { ...prev.kyc, partnerInviteCode: value } }))}
                  placeholder="4-digit code"
                />
                <p className="text-[11px] text-gray-500 mt-2">Enter a 4-digit partner invite code to auto-fill partner details.</p>
                {partnerError && <p className="text-[11px] text-rose-600 mt-2">{partnerError}</p>}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <FormField
                label="Business Name"
                value={formData.kyc.businessName}
                onChange={(value) => setFormData(prev => ({ ...prev, kyc: { ...prev.kyc, businessName: value } }))}
              />
              <FormField
                label="GSTIN"
                value={formData.kyc.gstin}
                onChange={(value) => setFormData(prev => ({ ...prev, kyc: { ...prev.kyc, gstin: value } }))}
              />
              <FormField
                label="PAN"
                value={formData.kyc.pan}
                onChange={(value) => setFormData(prev => ({ ...prev, kyc: { ...prev.kyc, pan: value } }))}
              />
              <FormField
                label="Pincode"
                value={formData.kyc.pincode}
                onChange={(value) => setFormData(prev => ({ ...prev, kyc: { ...prev.kyc, pincode: value } }))}
              />
              <FormField
                label="State"
                value={formData.kyc.state}
                onChange={(value) => setFormData(prev => ({ ...prev, kyc: { ...prev.kyc, state: value } }))}
              />
              <FormField
                label="City"
                value={formData.kyc.city}
                onChange={(value) => setFormData(prev => ({ ...prev, kyc: { ...prev.kyc, city: value } }))}
              />
              <FormField
                label="Address Line 1"
                value={formData.kyc.addressLine1}
                onChange={(value) => setFormData(prev => ({ ...prev, kyc: { ...prev.kyc, addressLine1: value } }))}
              />
              <FormField
                label="Address Line 2"
                value={formData.kyc.addressLine2}
                onChange={(value) => setFormData(prev => ({ ...prev, kyc: { ...prev.kyc, addressLine2: value } }))}
              />
              <div className="md:col-span-2 bg-gray-50 p-4 rounded-2xl border border-gray-200 mt-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Delivery Channels Configuration
                </label>
                <div className="flex flex-wrap gap-6 text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.deliverySettings?.delhiveryEnabled ?? true}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        deliverySettings: { ...prev.deliverySettings, delhiveryEnabled: e.target.checked }
                      }))}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="font-bold text-gray-800">Delhivery Express Enabled</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.deliverySettings?.localDeliveryEnabled ?? false}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        deliverySettings: { ...prev.deliverySettings, localDeliveryEnabled: e.target.checked }
                      }))}
                      className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
                    />
                    <span className="font-bold text-gray-800">Local Delivery Enabled</span>
                  </label>
                </div>
              </div>
            </div>
            {partnerForm ? (
              <div className="mt-8">
                <h4 className="text-base font-black text-gray-900 mb-4">Partner Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label="Partner Name" value={partnerForm.name} onChange={(value) => setPartnerForm(prev => ({ ...prev, name: value }))} />
                  <FormField label="Partner Email" value={partnerForm.email} onChange={(value) => setPartnerForm(prev => ({ ...prev, email: value }))} />
                  <FormField label="Partner Phone" value={partnerForm.phone} onChange={(value) => setPartnerForm(prev => ({ ...prev, phone: value }))} />
                  <FormField label="Partner Business Name" value={partnerForm.businessName} onChange={(value) => setPartnerForm(prev => ({ ...prev, businessName: value }))} />
                  <FormField label="Partner GST Number" value={partnerForm.gstNumber} onChange={(value) => setPartnerForm(prev => ({ ...prev, gstNumber: value }))} />
                  <FormField label="Partner PAN Number" value={partnerForm.panNumber} onChange={(value) => setPartnerForm(prev => ({ ...prev, panNumber: value }))} />
                  <FormField label="Partner Address" value={partnerForm.address} onChange={(value) => setPartnerForm(prev => ({ ...prev, address: value }))} />
                  <FormField label="Partner City" value={partnerForm.city} onChange={(value) => setPartnerForm(prev => ({ ...prev, city: value }))} />
                  <FormField label="Partner State" value={partnerForm.state} onChange={(value) => setPartnerForm(prev => ({ ...prev, state: value }))} />
                  <FormField label="Partner Pincode" value={partnerForm.pincode} onChange={(value) => setPartnerForm(prev => ({ ...prev, pincode: value }))} />
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* Credit & Delivery Settings overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black text-gray-900 italic">Credit Account</h3>
              <button
                onClick={() => nav('/admin/credit-management')}
                className="text-xs font-bold text-blue-600 hover:underline"
              >
                Open Credit Management →
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-3 rounded-2xl">
                <div className="text-[10px] font-bold text-gray-400 uppercase">Status</div>
                <div className="mt-1">
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-black uppercase ${
                    user.isCreditEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {user.isCreditEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded-2xl">
                <div className="text-[10px] font-bold text-gray-400 uppercase">Credit Limit</div>
                <div className="text-base font-black text-gray-900 mt-1">₹{(user.creditLimit || 0).toLocaleString('en-IN')}</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-2xl">
                <div className="text-[10px] font-bold text-gray-400 uppercase">Available Credit</div>
                <div className="text-base font-black text-emerald-600 mt-1">₹{(user.availableCredit || 0).toLocaleString('en-IN')}</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-2xl">
                <div className="text-[10px] font-bold text-gray-400 uppercase">Outstanding Balance</div>
                <div className="text-base font-black text-rose-600 mt-1">₹{(user.outstandingBalance || 0).toLocaleString('en-IN')}</div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
            <h3 className="text-lg font-black text-gray-900 italic mb-4">Delivery Channels</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50">
                <div>
                  <div className="text-xs font-black text-gray-900">Delhivery Express</div>
                  <div className="text-[11px] text-gray-500">Automated B2B courier fulfillment</div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                  (user.deliverySettings?.delhiveryEnabled ?? true) ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-600'
                }`}>
                  {(user.deliverySettings?.delhiveryEnabled ?? true) ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50">
                <div>
                  <div className="text-xs font-black text-gray-900">Local Delivery</div>
                  <div className="text-[11px] text-gray-500">Self-managed warehouse/driver dispatch</div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                  (user.deliverySettings?.localDeliveryEnabled ?? false) ? 'bg-purple-100 text-purple-800' : 'bg-gray-200 text-gray-600'
                }`}>
                  {(user.deliverySettings?.localDeliveryEnabled ?? false) ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
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
              <KycItem label="GST Number" value={partner.gstNumber} />
            </div>
          </div>
        )}
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
        title="Delete Retailer"
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

function FormField({ label, value, onChange, placeholder = '' }) {
  return (
    <div>
      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block">{label}</label>
      <input
        type="text"
        value={value || ''}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm font-bold text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
      />
    </div>
  )
}
