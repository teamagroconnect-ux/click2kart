import React, { useState, useEffect } from 'react'
import api from '../../lib/api'
import LoadingSpinner from '../../components/LoadingSpinner'

export default function Earnings() {
  const [loading, setLoading] = useState(true)
  const [earnings, setEarnings] = useState(null)

  useEffect(() => {
    loadEarnings()
  }, [])

  const loadEarnings = async () => {
    try {
      const { data } = await api.get('/api/partner/me')
      setEarnings({
        totalEarnings: data.totalCommission || 0,
        withdrawn: data.totalPaid || 0,
        balance: data.balance || 0,
        payouts: data.payouts || []
      })
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingSpinner text="Loading earnings…" />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-gray-900 mb-2">Earnings</h1>
        <p className="text-gray-500">Track your earnings and withdrawals</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Total Earnings</div>
          <div className="text-3xl font-black text-indigo-600">₹{earnings?.totalEarnings?.toLocaleString() || 0}</div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Withdrawn</div>
          <div className="text-3xl font-black text-emerald-600">₹{earnings?.withdrawn?.toLocaleString() || 0}</div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Current Balance</div>
          <div className="text-3xl font-black text-blue-600">₹{earnings?.balance?.toLocaleString() || 0}</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-black text-gray-800 mb-4">Payout History</h3>
        {earnings?.payouts?.length > 0 ? (
          <div className="space-y-3">
            {earnings.payouts.map((payout, index) => (
              <div key={index} className="flex items-center justify-between p-4 rounded-xl bg-gray-50">
                <div>
                  <div className="text-sm font-bold text-gray-900">Payout #{index + 1}</div>
                  <div className="text-xs text-gray-500">{new Date(payout.createdAt).toLocaleDateString()}</div>
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
