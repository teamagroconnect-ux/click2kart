import React, { useState, useEffect } from 'react'
import api from '../../lib/api'
import LoadingSpinner from '../../components/LoadingSpinner'
import { useToast } from '../../components/Toast'

export default function Earnings() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)
  const { notify } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const res = await api.get('/api/partner/me')
      setData(res.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const copyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code)
      notify('Coupon code copied to clipboard!', 'success')
    } catch (e) {
      notify('Failed to copy code', 'error')
    }
  }

  if (loading) return <LoadingSpinner text="Loading earnings…" />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-gray-900 mb-2">Earnings & Coupons</h1>
        <p className="text-gray-500">Track your performance, earnings, and share your coupons</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Total Earnings</div>
          <div className="text-3xl font-black text-indigo-600">₹{data?.totalCommission?.toLocaleString() || 0}</div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Withdrawn</div>
          <div className="text-3xl font-black text-emerald-600">₹{data?.totalPaid?.toLocaleString() || 0}</div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Current Balance</div>
          <div className="text-3xl font-black text-blue-600">₹{data?.balance?.toLocaleString() || 0}</div>
        </div>
      </div>

      {/* Partner Coupons (Invite Codes) */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-black text-gray-800 mb-4">Your Coupons (Invite Codes)</h3>
        {data?.coupons?.length > 0 ? (
          <div className="space-y-3">
            {data.coupons.map((coupon, index) => (
              <div key={index} className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-100">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="font-black text-xl text-violet-700 font-mono">{coupon.code}</div>
                    {coupon.isActive ? (
                      <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest">Active</span>
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-[10px] font-black uppercase tracking-widest">Inactive</span>
                    )}
                  </div>
                  <div className="mt-2 flex items-center gap-4 text-xs text-gray-600">
                    <div><span className="font-black">Commission:</span> {coupon.partnerCommissionPercent}%</div>
                    <div><span className="font-black">Sales:</span> ₹{coupon.sales?.toLocaleString() || 0}</div>
                    <div><span className="font-black">Used:</span> {coupon.usageCount} times</div>
                    {coupon.minOrderValue && <div><span className="font-black">Min Order:</span> ₹{coupon.minOrderValue}</div>}
                    {coupon.maxDiscount && <div><span className="font-black">Max Discount:</span> ₹{coupon.maxDiscount}</div>}
                  </div>
                </div>
                <button
                  onClick={() => copyCode(coupon.code)}
                  className="ml-4 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white text-sm font-black uppercase tracking-widest hover:from-violet-700 hover:to-purple-700 transition-all active:scale-95"
                >
                  Copy
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-gray-400">
            <p className="text-sm">No coupons assigned yet</p>
          </div>
        )}
      </div>

      {/* Referred Businesses */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-black text-gray-800 mb-4">Referred Businesses</h3>
        {data?.referredBusinesses?.length > 0 ? (
          <div className="space-y-3">
            {data.referredBusinesses.map((business, index) => (
              <div key={index} className="flex items-center justify-between p-4 rounded-xl bg-gray-50">
                <div>
                  <div className="text-sm font-bold text-gray-900">{business.name}</div>
                  {business.email && <div className="text-xs text-gray-500">{business.email}</div>}
                  {business.phone && <div className="text-xs text-gray-500">{business.phone}</div>}
                </div>
                <div className="text-xs text-gray-400 font-bold">Joined {new Date(business.createdAt).toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-gray-400">
            <p className="text-sm">No referred businesses yet</p>
          </div>
        )}
      </div>

      {/* Payout History */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-black text-gray-800 mb-4">Payout History</h3>
        {data?.payouts?.length > 0 ? (
          <div className="space-y-3">
            {data.payouts.map((payout, index) => (
              <div key={index} className="flex items-center justify-between p-4 rounded-xl bg-gray-50">
                <div>
                  <div className="text-sm font-bold text-gray-900">Payout #{index + 1}</div>
                  <div className="text-xs text-gray-500">{new Date(payout.createdAt).toLocaleDateString()}</div>
                  {payout.utr && <div className="text-xs text-gray-400">UTR: {payout.utr}</div>}
                  {payout.razorpayPaymentId && <div className="text-xs text-gray-400">Razorpay: {payout.razorpayPaymentId}</div>}
                </div>
                <div className="text-lg font-black text-emerald-600">₹{payout.amount?.toLocaleString()}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-gray-400">
            <p className="text-sm">No payouts yet</p>
          </div>
        )}
      </div>
    </div>
  )
}
