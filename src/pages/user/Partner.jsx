import { useState } from 'react'
import api from '../../lib/api'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export default function Partner() {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [data, setData] = useState(null)

  const fetchSummary = async (e) => {
    e.preventDefault()
    if (!code) return
    setLoading(true)
    setError('')
    setData(null)
    try {
      const { data } = await api.get(`/api/partners/summary/${code}`)
      setData(data)
    } catch (e) {
      setError('Could not find details for this coupon. Please check the code.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-12">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-8 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="space-y-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="h-10 w-10 rounded-2xl bg-blue-600 flex items-center justify-center text-xs font-black text-white shadow-xl shadow-blue-100 border border-blue-500">
                C2K
              </span>
              <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-3 py-1 rounded-full tracking-widest border border-blue-100">Partner Portal</span>
            </div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Partner Dashboard</h1>
            <p className="text-sm text-gray-500 font-medium max-w-xl">
              Track your referral performance, view commission earnings by category, and manage your payouts in real-time.
            </p>
          </div>
          
          <form onSubmit={fetchSummary} className="flex items-center bg-gray-50 p-1.5 rounded-3xl border border-gray-100 shadow-inner group focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
            <input
              className="bg-transparent border-none rounded-2xl px-5 py-3 text-sm font-bold text-gray-900 placeholder-gray-400 outline-none min-w-[240px]"
              placeholder="Enter Coupon Code..."
              value={code}
              onChange={e=>setCode(e.target.value)}
            />
            <button
              type="submit"
              className="px-8 py-3 bg-gray-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg hover:bg-gray-800 transition-all disabled:opacity-30 active:scale-95"
              disabled={!code || loading}
            >
              {loading ? 'Verifying...' : 'Access Portal'}
            </button>
          </form>
        </header>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-xs font-bold px-6 py-4 rounded-[2rem] animate-in zoom-in-95">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {error === 'not_found' ? 'Invalid coupon code. Please check and try again.' : error}
            </div>
          </div>
        )}

        {data && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <section className="bg-white border border-gray-100 rounded-[3rem] shadow-sm p-8 md:p-12 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full -mr-32 -mt-32 opacity-50 blur-3xl"></div>
              
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 relative z-10 border-b border-gray-50 pb-8 mb-8">
                <div className="space-y-4">
                  <div className="h-20 w-20 rounded-3xl bg-gray-900 flex items-center justify-center text-white text-3xl font-black shadow-2xl">
                    {data.partnerName?.charAt(0) || 'P'}
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Partner Profile</div>
                    <div className="text-3xl font-black text-gray-900 tracking-tight">{data.partnerName || '-'}</div>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 font-bold">
                      {data.partnerPhone && <span className="flex items-center gap-1.5"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>{data.partnerPhone}</span>}
                      {data.partnerEmail && <span className="flex items-center gap-1.5"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>{data.partnerEmail}</span>}
                    </div>
                  </div>
                </div>
                <div className="text-left md:text-right space-y-2">
                  <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Active Referral Code</div>
                  <div className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gray-900 text-white text-lg font-black tracking-widest shadow-xl shadow-gray-200">
                    {data.code}
                  </div>
                  <div className="text-[10px] text-emerald-500 font-black uppercase tracking-widest mt-2 flex items-center md:justify-end gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                    Comm. Rate: {data.commissionPercent}%
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
                <div className="bg-gray-50/50 rounded-[2rem] p-6 border border-gray-100 hover:bg-white hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
                  <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Generated Sales</div>
                  <div className="text-2xl font-black text-gray-900 tracking-tight">₹{data.totalSales.toLocaleString()}</div>
                </div>
                <div className="bg-gray-50/50 rounded-[2rem] p-6 border border-gray-100 hover:bg-white hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
                  <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Total Earnings</div>
                  <div className="text-2xl font-black text-gray-900 tracking-tight">₹{data.totalCommission.toLocaleString()}</div>
                </div>
                <div className="bg-emerald-50/50 rounded-[2rem] p-6 border border-emerald-100 hover:bg-white hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
                  <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">Withdrawn</div>
                  <div className="text-2xl font-black text-emerald-700 tracking-tight">₹{data.totalPaid.toLocaleString()}</div>
                </div>
                <div className="bg-blue-50/50 rounded-[2rem] p-6 border border-blue-100 hover:bg-white hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
                  <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2">Current Balance</div>
                  <div className="text-2xl font-black text-blue-700 tracking-tight">₹{data.balance.toLocaleString()}</div>
                </div>
              </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
              <section className="bg-white border border-gray-100 rounded-[3rem] p-8 md:p-10 shadow-sm space-y-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-black uppercase tracking-widest text-gray-400">Commission by Category</h2>
                  <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></div>
                </div>
                {data.categoryBreakdown && data.categoryBreakdown.length > 0 ? (
                  <div className="h-[340px] w-full bg-gray-50/50 rounded-[2.5rem] p-6">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data.categoryBreakdown}
                          cx="50%"
                          cy="50%"
                          innerRadius={70}
                          outerRadius={100}
                          paddingAngle={8}
                          dataKey="value"
                        >
                          {data.categoryBreakdown.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value) => `₹${Number(value).toFixed(2)}`}
                          contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', padding: '12px 20px' }}
                        />
                        <Legend verticalAlign="bottom" height={36} iconType="circle"/>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-[340px] flex items-center justify-center text-gray-400 text-xs italic font-medium bg-gray-50/50 rounded-[2.5rem] border border-dashed border-gray-200">
                    No category data available yet.
                  </div>
                )}
              </section>

              {data.payouts && data.payouts.length > 0 ? (
                <section className="bg-white border border-gray-100 rounded-[3rem] p-8 md:p-10 shadow-sm space-y-8">
                  <div className="flex items-center justify-between border-b border-gray-50 pb-6">
                    <h2 className="text-sm font-black uppercase tracking-widest text-gray-400">Payout History</h2>
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">
                      {data.payouts.length} Payments
                    </span>
                  </div>
                  <div className="max-h-[340px] overflow-y-auto pr-4 custom-scrollbar space-y-4">
                    {data.payouts.map((p, idx) => (
                      <div key={idx} className="bg-gray-50/50 hover:bg-white border border-transparent hover:border-blue-100 p-6 rounded-3xl transition-all duration-300 group">
                        <div className="flex justify-between items-start mb-3">
                          <div className="text-xl font-black text-gray-900 group-hover:text-blue-600 transition-colors">₹{p.amount.toLocaleString()}</div>
                          <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{new Date(p.createdAt).toLocaleDateString()}</div>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="text-[9px] font-black uppercase text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg tracking-widest border border-blue-100">{p.method}</span>
                          {p.utr && <span className="text-[10px] text-gray-500 font-bold">UTR: {p.utr}</span>}
                          {p.razorpayPaymentId && <span className="text-[10px] text-gray-500 font-bold">ID: {p.razorpayPaymentId}</span>}
                        </div>
                        {p.notes && <div className="mt-3 text-[11px] text-gray-400 font-medium italic">"{p.notes}"</div>}
                      </div>
                    ))}
                  </div>
                </section>
              ) : (
                <section className="bg-white border border-gray-100 rounded-[3rem] p-8 md:p-10 shadow-sm flex flex-col items-center justify-center text-center space-y-4">
                  <div className="h-20 w-20 rounded-full bg-gray-50 flex items-center justify-center text-3xl">💸</div>
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-widest text-gray-900">No Payouts Yet</h3>
                    <p className="text-xs text-gray-400 font-bold mt-1">Your commission payments will appear here.</p>
                  </div>
                </section>
              )}
            </div>
          </div>
        )}

        {!data && !loading && !error && (
          <div className="py-32 flex flex-col items-center justify-center text-center animate-in fade-in duration-1000">
            <div className="h-24 w-24 rounded-[2rem] bg-gray-50 flex items-center justify-center text-4xl mb-6 shadow-inner">🎟️</div>
            <h3 className="text-xl font-black text-gray-900 tracking-tight">Ready to check your earnings?</h3>
            <p className="text-sm text-gray-400 font-bold mt-2 max-w-xs">
              Enter your unique partner coupon code in the field above to access your performance data.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

        {!data && !loading && !error && (
          <div className="text-center text-sm text-gray-500">
            Enter your coupon code above to view your dashboard.
          </div>
        )}
      </div>
    </div>
  )
}

