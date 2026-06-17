import React, { useState, useEffect } from 'react'
import api from '../../lib/api'
import { useToast } from '../../components/Toast'
import LoadingSpinner from '../../components/LoadingSpinner'

export default function MyCoupons() {
  const { notify } = useToast()
  const [loading, setLoading] = useState(true)
  const [coupons, setCoupons] = useState([])

  useEffect(() => {
    loadCoupons()
  }, [])

  const loadCoupons = async () => {
    setLoading(true)
    try {
      // This is a placeholder since we don't have an actual endpoint yet
      setCoupons([
        {
          code: 'SAVE10',
          discountPercent: 10,
          usageCount: 23,
          totalSales: 45000,
          status: 'active',
          createdAt: new Date()
        },
        {
          code: 'SPECIAL20',
          discountPercent: 20,
          usageCount: 15,
          totalSales: 78000,
          status: 'active',
          createdAt: new Date()
        }
      ])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-gray-900 mb-2">My Coupons</h1>
        <p className="text-gray-500">Track your coupon performance and usage</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {coupons.map((coupon, index) => (
          <div key={index} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="text-2xl font-black text-indigo-600">{coupon.code}</div>
              <div className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold uppercase">
                {coupon.status}
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Discount</span>
                <span className="text-base font-bold text-gray-900">{coupon.discountPercent}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Usage Count</span>
                <span className="text-base font-bold text-gray-900">{coupon.usageCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Total Sales</span>
                <span className="text-base font-bold text-emerald-600">₹{coupon.totalSales.toLocaleString()}</span>
              </div>
            </div>
            
            <button
              onClick={() => navigator.clipboard.writeText(coupon.code).then(() => notify('Coupon copied!', 'success'))}
              className="w-full mt-4 py-3 rounded-xl text-sm font-black text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 active:scale-[0.98] transition-all"
            >
              Copy Coupon Code
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
