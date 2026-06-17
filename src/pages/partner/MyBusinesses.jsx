import React, { useState, useEffect } from 'react'
import api from '../../lib/api'
import { useToast } from '../../components/Toast'
import LoadingSpinner from '../../components/LoadingSpinner'

export default function MyBusinesses() {
  const { notify } = useToast()
  const [loading, setLoading] = useState(true)
  const [businesses, setBusinesses] = useState([])
  const [showAddModal, setShowAddModal] = useState(false)

  useEffect(() => {
    loadBusinesses()
  }, [])

  const loadBusinesses = async () => {
    setLoading(true)
    try {
      // This is a placeholder since we don't have an actual endpoint yet
      setBusinesses([
        {
          name: 'Tech Solutions Inc',
          email: 'tech@example.com',
          phone: '+91 9876543210',
          city: 'Mumbai',
          joinedDate: new Date(),
          totalOrders: 12,
          totalSpent: 245000,
          status: 'active'
        },
        {
          name: 'Digital Marketing Pro',
          email: 'digital@example.com',
          phone: '+91 9876543211',
          city: 'Delhi',
          joinedDate: new Date(),
          totalOrders: 8,
          totalSpent: 156000,
          status: 'active'
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">My Businesses</h1>
          <p className="text-gray-500">Manage your referred businesses</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-6 py-3 rounded-xl text-sm font-black text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 active:scale-[0.98] transition-all shadow-lg shadow-indigo-200"
        >
          Add New Business
        </button>
      </div>

      <div className="grid gap-4">
        {businesses.map((business, index) => (
          <div key={index} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-black text-gray-900 mb-1">{business.name}</h3>
                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {business.email}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {business.phone}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    {business.city}
                  </span>
                </div>
              </div>
              <div className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold uppercase">
                {business.status}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-gray-50">
                <div className="text-xs font-bold uppercase text-gray-400 mb-1">Total Orders</div>
                <div className="text-2xl font-black text-gray-900">{business.totalOrders}</div>
              </div>
              <div className="p-4 rounded-xl bg-gray-50">
                <div className="text-xs font-bold uppercase text-gray-400 mb-1">Total Spent</div>
                <div className="text-2xl font-black text-emerald-600">₹{business.totalSpent.toLocaleString()}</div>
              </div>
              <div className="p-4 rounded-xl bg-gray-50">
                <div className="text-xs font-bold uppercase text-gray-400 mb-1">Joined Date</div>
                <div className="text-lg font-bold text-gray-900">{business.joinedDate.toLocaleDateString()}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
