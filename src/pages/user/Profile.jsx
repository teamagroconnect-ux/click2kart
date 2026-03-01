import React, { useEffect, useState } from 'react'
import api from '../../lib/api'
import { useToast } from '../../components/Toast'
import { useAuth } from '../../lib/AuthContext'

export default function Profile() {
  const { notify } = useToast()
  const { token, refreshProfile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [isKycComplete, setIsKycComplete] = useState(false)
  const [kyc, setKyc] = useState({
    businessName: '', gstin: '', pan: '',
    addressLine1: '', addressLine2: '', city: '', state: '', pincode: ''
  })

  useEffect(() => {
    if (!token) return
    ;(async () => {
      try {
        const { data } = await api.get('/api/user/me')
        setIsKycComplete(!!data.isKycComplete)
        setKyc({ ...kyc, ...(data.kyc || {}) })
      } finally {
        setLoading(false)
      }
    })()
  }, [token])

  const save = async (e) => {
    e.preventDefault()
    try {
      const { data } = await api.put('/api/user/kyc', kyc)
      setIsKycComplete(data.isKycComplete)
      notify(data.isKycComplete ? 'KYC completed' : 'KYC updated', 'success')
      refreshProfile()
    } catch (err) {
      notify(err?.response?.data?.error || 'Failed to save KYC', 'error')
    }
  }

  if (loading) return <div className="max-w-3xl mx-auto p-6">Loading…</div>

  return (
    <div className="max-w-3xl mx-auto p-6 md:p-10 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Your Profile & KYC</h1>
          <p className="text-sm text-gray-500">{isKycComplete ? 'KYC is complete. You can place orders.' : 'Please complete KYC to place orders.'}</p>
        </div>
      </div>
      <form onSubmit={save} className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Business Name" value={kyc.businessName} onChange={v => setKyc({ ...kyc, businessName: v })} required />
          <Field label="GSTIN" value={kyc.gstin} onChange={v => setKyc({ ...kyc, gstin: v })} required />
          <Field label="PAN" value={kyc.pan} onChange={v => setKyc({ ...kyc, pan: v })} required />
          <Field label="Pincode" value={kyc.pincode} onChange={v => setKyc({ ...kyc, pincode: v })} required />
          <Field label="State" value={kyc.state} onChange={v => setKyc({ ...kyc, state: v })} required />
          <Field label="City" value={kyc.city} onChange={v => setKyc({ ...kyc, city: v })} required />
          <Field label="Address Line 1" value={kyc.addressLine1} onChange={v => setKyc({ ...kyc, addressLine1: v })} required className="md:col-span-2" />
          <Field label="Address Line 2" value={kyc.addressLine2} onChange={v => setKyc({ ...kyc, addressLine2: v })} className="md:col-span-2" />
        </div>
        <div className="flex justify-end">
          <button className="px-6 py-3 rounded-xl bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest">Save KYC</button>
        </div>
      </form>
    </div>
  )
}

function Field({ label, value, onChange, required, className='' }) {
  return (
    <div className={`space-y-1 ${className}`}>
      <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">{label}{required && ' *'}</label>
      <input
        className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        required={required}
      />
    </div>
  )
}
