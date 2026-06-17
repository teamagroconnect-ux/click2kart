import React, { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import api from '../../lib/api'
import LoadingSpinner from '../../components/LoadingSpinner'
import { useToast } from '../../components/Toast'

const COLORS = ['#8b5cf6', '#7c3aed', '#a78bfa', '#6d28d9', '#c4b5fd', '#ddd6fe']

export default function PartnerDashboard() {
  const { notify } = useToast()
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState(null)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const { data } = await api.get('/api/partner/me')
      setDashboardData({
        partnerName: data.name || 'Partner',
        partnerPhone: data.phone || '',
        partnerEmail: data.email || '',
        inviteCode: data.inviteCode || '',
        totalSales: data.totalSales || 0,
        totalCommission: data.totalCommission || 0,
        totalPaid: data.totalPaid || 0,
        balance: data.balance || 0,
        coupons: data.coupons || [],
        bills: data.referredOrders || [],
        payouts: data.payouts || []
      })
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const copyInviteCode = () => {
    if (dashboardData?.inviteCode) {
      navigator.clipboard.writeText(dashboardData.inviteCode)
      notify('Invite code copied!', 'success')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner text="Loading dashboard…" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-gray-900 mb-2">Welcome back {dashboardData?.partnerName?.split(' ')[0] || 'Partner'}</h1>
            <p className="text-gray-500">Track your performance and earnings</p>
          </div>
        </div>
      </div>

      {/* Invite Code Card */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute right-20 bottom-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2" />
        <div className="relative z-10">
          <div className="text-xs font-bold uppercase tracking-widest text-indigo-100 mb-2">Your Invite Code</div>
          <div className="flex items-center gap-4">
            <div className="text-4xl font-black tracking-widest">
              {dashboardData?.inviteCode || '----'}
            </div>
            <button 
              onClick={copyInviteCode}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-6 py-3 rounded-xl font-bold text-sm transition-all active:scale-[0.97] border border-white/30"
            >
              Copy Code
            </button>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Generated Sales</div>
          <div className="text-3xl font-black text-gray-900">₹{dashboardData?.totalSales?.toLocaleString() || 0}</div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Total Earnings</div>
          <div className="text-3xl font-black text-indigo-600">₹{dashboardData?.totalCommission?.toLocaleString() || 0}</div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Withdrawn</div>
          <div className="text-3xl font-black text-emerald-600">₹{dashboardData?.totalPaid?.toLocaleString() || 0}</div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Current Balance</div>
          <div className="text-3xl font-black text-blue-600">₹{dashboardData?.balance?.toLocaleString() || 0}</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Coupon Performance</span>
          </div>
          <div style={{ height: 260, width: '100%' }}>
            {dashboardData?.coupons?.some(c => c.sales > 0) ? (
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={dashboardData.coupons.filter(c => c.sales > 0)} dataKey="sales" nameKey="code" cx="50%" cy="50%" outerRadius={80} stroke="none">
                    {dashboardData.coupons.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', fontSize: '11px', fontWeight: 'bold' }}
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
            {dashboardData?.bills?.length > 0 && <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">{dashboardData.bills.length} Orders</span>}
          </div>
          {dashboardData?.bills && dashboardData.bills.length > 0 ? (
            <div className="space-y-2 max-h-[260px] overflow-y-auto">
              {dashboardData.bills.map((b, i) => (
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
