import React, { useState, useEffect } from 'react'
import api from '../../lib/api'
import LoadingSpinner from '../../components/LoadingSpinner'

export default function ReferredOrders() {
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState([])

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    try {
      const { data } = await api.get('/api/partner/me')
      setOrders(data.referredOrders || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingSpinner text="Loading orders…" />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-gray-900 mb-2">Referred Orders</h1>
        <p className="text-gray-500">Track orders referred by you</p>
      </div>

      {orders.length > 0 ? (
        <div className="space-y-3">
          {orders.map((order, index) => (
            <div key={index} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-bold text-gray-900">Order #{index + 1}</div>
                <div className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold uppercase">
                  {order.couponCode}
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Customer</div>
                  <div className="font-semibold text-gray-800">{order.customerPhone}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Date</div>
                  <div className="font-semibold text-gray-800">{new Date(order.createdAt).toLocaleDateString()}</div>
                </div>
                <div className="text-right">
                  <div className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Amount</div>
                  <div className="text-lg font-black text-emerald-600">₹{order.payable?.toLocaleString()}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
          <div className="text-gray-400 mb-3">📦</div>
          <p className="text-sm text-gray-500">No referred orders yet</p>
        </div>
      )}
    </div>
  )
}
