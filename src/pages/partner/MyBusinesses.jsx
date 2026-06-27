import React, { useState, useEffect } from 'react'
import api from '../../lib/api'
import { useToast } from '../../components/Toast'
import LoadingSpinner from '../../components/LoadingSpinner'

export default function MyRetailers() {
  const { notify } = useToast()
  const [loading, setLoading] = useState(true)
  const [retailers, setRetailers] = useState([])

  useEffect(() => {
    loadRetailers()
  }, [])

  const loadRetailers = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/api/partner/me')
      setRetailers(data.referredBusinesses || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingSpinner text="Loading retailers…" />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-gray-900 mb-2">My Retailers</h1>
        <p className="text-gray-500">Manage your referred retailers</p>
      </div>

      {retailers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
          <div className="text-gray-400 mb-3">📦</div>
          <p className="text-sm text-gray-500">No referred retailers yet</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {retailers.map((retailer, index) => (
            <div key={retailer._id || index} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                <div>
                  <h3 className="text-lg font-black text-gray-900">{retailer.name}</h3>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mt-1">
                    {retailer.email && (
                      <span>{retailer.email}</span>
                    )}
                    {retailer.phone && (
                      <span>{retailer.phone}</span>
                    )}
                    {retailer.kyc?.city && (
                      <span>{retailer.kyc.city}</span>
                    )}
                  </div>
                </div>
                <div className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold uppercase">
                  {retailer.isActive ? 'Active' : 'Inactive'}
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-gray-50">
                  <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Joined</div>
                  <div className="text-base font-bold text-gray-900">{retailer.createdAt ? new Date(retailer.createdAt).toLocaleDateString() : '—'}</div>
                </div>
                <div className="p-4 rounded-xl bg-gray-50">
                  <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Total Orders</div>
                  <div className="text-base font-bold text-gray-900">{retailer.purchaseHistory?.length || 0}</div>
                </div>
                <div className="p-4 rounded-xl bg-gray-50">
                  <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">KYC Status</div>
                  <div className={`text-base font-bold ${retailer.isKycComplete ? 'text-emerald-600' : 'text-gray-500'}`}>
                    {retailer.isKycComplete ? 'Verified' : 'Not Verified'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
