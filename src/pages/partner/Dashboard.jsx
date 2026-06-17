import React, { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

const COLORS = ['#8b5cf6', '#7c3aed', '#a78bfa', '#6d28d9', '#c4b5fd', '#ddd6fe']

export default function PartnerDashboard() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem('partnerData')
      return saved ? JSON.parse(saved) : null
    } catch { return null }
  })

  useEffect(() => {
    const token = localStorage.getItem('partnerToken')
    if (!token) {
      return
    }

    if (!data) {
      setLoading(true)
      // Mock data for now
      setTimeout(() => {
        setData({
          partnerName: 'John Doe',
          partnerPhone: '+91 9876543210',
          partnerEmail: 'john@example.com',
          totalSales: 234500,
          totalCommission: 23450,
          totalPaid: 18000,
          balance: 5450,
          coupons: [
            { code: 'SAVE10', commissionPercent: 10, sales: 120000 },
            { code: 'SPECIAL20', commissionPercent: 20, sales: 80000 }
          ],
          bills: [
            { customerPhone: '+91 9876543211', createdAt: new Date(), payable: 45000, couponCode: 'SAVE10' },
            { customerPhone: '+91 9876543212', createdAt: new Date(), payable: 35000, couponCode: 'SPECIAL20' }
          ],
          payouts: []
        })
        setLoading(false)
      }, 500)
    }
  }, [data])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-gray-900 mb-2">Welcome back{data?.partnerName || 'Partner'}</h1>
            <p className="text-gray-500">Track your performance and earnings</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Generated Sales</div>
          <div className="text-3xl font-black text-gray-900">₹{data?.totalSales?.toLocaleString() || 0}</div>
        </div>
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

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Coupon Performance</span>
          </div>
          <div style={{ height: 260, width: '100%' }}>
            {data?.coupons?.some(c => c.sales > 0) ? (
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={data.coupons.filter(c => c.sales > 0)} dataKey="sales" nameKey="code" cx="50%" cy="50%" outerRadius={80} stroke="none">
                    {data.coupons.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', fontSize: '11px', fontWeight: 'bold' } as any}
                    formatter={(v) => `₹${v.toLocaleString()}`}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-3">
                <div style={{ fontSize: 32 }}>📊</div>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>No Sales Data Yet</div>
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Recent Referrals</span>
            {data?.bills?.length > 0 && <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">{data.bills.length} Orders</span>}
          </div>
          {data?.bills && data.bills.length > 0 ? (
            <div className="space-y-2 max-h-[260px] overflow-y-auto">
              {data.bills.map((b, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                  <div>
                    <div className="text-sm font-bold text-gray-900">{b.customerPhone}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="text-xs text-gray-400">{new Date(b.createdAt).toLocaleDateString()}</div>
                      <div className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{b.couponCode}</div>
                    </div>
                  </div>
                  <div className="text-lg font-black text-emerald-600">₹{b.payable.toLocaleString()}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[260px] text-gray-400 gap-2">
              <div style={{ fontSize: 32 }}>📦</div>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>No Referrals Yet</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
