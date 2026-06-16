import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../lib/api'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { CONFIG } from '../../shared/lib/config.js'

const COLORS = ['#8b5cf6', '#7c3aed', '#a78bfa', '#6d28d9', '#c4b5fd', '#ddd6fe']

export default function PartnerDashboard() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem('partnerData')
      return saved ? JSON.parse(saved) : null
    } catch { return null }
  })

  const logout = () => {
    localStorage.removeItem('partnerToken')
    localStorage.removeItem('partnerData')
    setData(null)
    navigate('/partner')
  }

  useEffect(() => {
    const token = localStorage.getItem('partnerToken')
    if (!token) {
      navigate('/partner')
      return
    }

    if (!data) {
      setLoading(true)
      api.get('/api/public/partner/me')
        .then(({ data }) => {
          setData(data)
          localStorage.setItem('partnerData', JSON.stringify(data))
        })
        .catch(() => {
          localStorage.removeItem('partnerToken')
          localStorage.removeItem('partnerData')
          setData(null)
          navigate('/partner')
        })
        .finally(() => setLoading(false))
    }
  }, [data, navigate])

  if (loading || !data) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'DM Sans' }}>
        Loading...
      </div>
    )
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,700&display=swap');

        .pr-root {
          font-family: 'DM Sans', system-ui, sans-serif;
          background: #f5f3ff;
          min-height: 100vh;
          color: #1e1b2e;
          position: relative;
          overflow-x: hidden;
        }

        .pr-root::before {
          content: '';
          position: fixed; inset: 0;
          background-image:
            linear-gradient(rgba(139,92,246,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139,92,246,0.04) 1px, transparent 1px);
          background-size: 60px 60px;
          pointer-events: none; z-index: 0;
        }

        .pr-blob {
          position: fixed; top: -200px; left: 50%; transform: translateX(-50%);
          width: 900px; height: 600px; border-radius: 50%;
          background: radial-gradient(ellipse, rgba(139,92,246,0.1), transparent 65%);
          pointer-events: none; z-index: 0;
        }
        .pr-blob2 {
          position: fixed; bottom: -200px; right: -150px;
          width: 600px; height: 600px; border-radius: 50%;
          background: radial-gradient(ellipse, rgba(109,40,217,0.07), transparent 65%);
          pointer-events: none; z-index: 0;
        }

        .pr-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 48px 24px 80px;
          position: relative; z-index: 1;
        }

        .pr-profile {
          background: white;
          border: 1px solid rgba(139,92,246,0.15);
          border-radius: 28px; padding: 36px 40px;
          position: relative; overflow: hidden;
          box-shadow: 0 8px 40px rgba(139,92,246,0.07);
          animation: prFadeUp 0.6s ease both;
        }
        .pr-profile::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 3px;
          background: linear-gradient(90deg, transparent 10%, #7c3aed 50%, transparent 90%);
        }
        .pr-profile-glow {
          position: absolute; top: -60px; right: -60px;
          width: 280px; height: 280px; border-radius: 50%;
          background: radial-gradient(ellipse, rgba(139,92,246,0.06), transparent 70%);
          pointer-events: none;
        }

        .pr-avatar {
          width: 64px; height: 64px; border-radius: 18px;
          background: linear-gradient(135deg, #6d28d9, #a855f7);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 26px; color: white; letter-spacing: 0.05em;
          box-shadow: 0 8px 24px rgba(109,40,217,0.3);
          border: 1px solid rgba(167,139,250,0.3); margin-bottom: 14px;
        }

        .pr-partner-name {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 32px; color: #1e1b2e; letter-spacing: 0.02em; line-height: 1;
        }
        .pr-meta { display: flex; flex-wrap: wrap; gap: 14px; margin-top: 8px; }
        .pr-meta-chip { display: flex; align-items: center; gap: 5px; font-size: 12px; color: #6b7280; font-weight: 500; }

        .pr-code-pill {
          display: inline-flex; align-items: center; gap: 8px;
          background: #f5f3ff; border: 1px solid rgba(139,92,246,0.25);
          padding: 10px 20px; border-radius: 12px;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 22px; color: #7c3aed; letter-spacing: 0.08em;
        }
        .pr-rate {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 10px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.15em; color: #059669; margin-top: 8px;
        }
        .pr-rate-dot { width: 6px; height: 6px; border-radius: 50%; background: #10b981; box-shadow: 0 0 6px #10b981; }

        .pr-stats {
          display: grid; grid-template-columns: repeat(2, 1fr);
          gap: 12px; margin-top: 28px;
        }
        @media(min-width:640px) { .pr-stats { grid-template-columns: repeat(4, 1fr); } }

        .pr-stat {
          background: #f9f7ff; border: 1px solid rgba(139,92,246,0.1);
          border-radius: 18px; padding: 20px 18px;
          transition: all 0.3s; position: relative; overflow: hidden;
        }
        .pr-stat::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, transparent, rgba(139,92,246,0.35), transparent);
          opacity: 0; transition: opacity 0.3s;
        }
        .pr-stat:hover { background: white; border-color: rgba(124,58,237,0.25); box-shadow: 0 6px 24px rgba(124,58,237,0.08); transform: translateY(-2px); }
        .pr-stat:hover::before { opacity: 1; }
        .pr-stat-label { font-size: 9px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: #9ca3af; margin-bottom: 8px; }
        .pr-stat-val { font-family: 'Bebas Neue', sans-serif; font-size: 26px; color: #1e1b2e; letter-spacing: 0.02em; line-height: 1; }
        .pr-stat.green .pr-stat-label { color: #059669; }
        .pr-stat.green .pr-stat-val { color: #059669; }
        .pr-stat.blue .pr-stat-label { color: #2563eb; }
        .pr-stat.blue .pr-stat-val { color: #2563eb; }

        .pr-charts {
          display: grid; grid-template-columns: 1fr;
          gap: 16px; margin-top: 16px;
          animation: prFadeUp 0.6s 0.15s ease both;
        }
        @media(min-width:768px) { .pr-charts { grid-template-columns: 1fr 1fr; } }

        .pr-card {
          background: white;
          border: 1px solid rgba(139,92,246,0.12);
          border-radius: 24px; padding: 30px;
          box-shadow: 0 4px 24px rgba(139,92,246,0.05);
          position: relative; overflow: hidden;
          transition: all 0.3s;
        }
        .pr-card:hover { box-shadow: 0 8px 40px rgba(139,92,246,0.1); border-color: rgba(124,58,237,0.25); }
        .pr-card::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, transparent, rgba(139,92,246,0.4), transparent);
        }
        .pr-card-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 22px; }
        .pr-card-title { font-size: 9px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: #9ca3af; }
        .pr-card-dot { width: 6px; height: 6px; border-radius: 50%; background: #7c3aed; box-shadow: 0 0 6px rgba(124,58,237,0.4); animation: prPulse 2s ease infinite; }
        @keyframes prPulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.7)} }
        .pr-count-tag { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; color: #7c3aed; background: #f5f3ff; border: 1px solid rgba(139,92,246,0.2); padding: 3px 10px; border-radius: 8px; }

        .pr-empty-chart {
          height: 260px; display: flex; align-items: center; justify-content: center;
          background: #f9f7ff; border-radius: 14px;
          border: 1px dashed rgba(139,92,246,0.2);
          font-size: 13px; color: #9ca3af; font-weight: 500;
        }

        .pr-payout {
          background: #f9f7ff; border: 1px solid rgba(139,92,246,0.08);
          border-radius: 14px; padding: 16px 18px; margin-bottom: 10px; transition: all 0.25s;
        }
        .pr-payout:hover { background: white; border-color: rgba(124,58,237,0.2); box-shadow: 0 4px 16px rgba(124,58,237,0.06); }
        .pr-payout-amount { font-family: 'Bebas Neue', sans-serif; font-size: 22px; color: #7c3aed; letter-spacing: 0.03em; }
        .pr-payout-date { font-size: 10px; color: #9ca3af; font-weight: 600; }
        .pr-method { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; color: #7c3aed; background: #f5f3ff; border: 1px solid rgba(139,92,246,0.2); padding: 3px 10px; border-radius: 6px; }
        .pr-utr { font-size: 10px; color: #9ca3af; font-weight: 600; }
        .pr-notes { font-size: 11px; color: #9ca3af; font-style: italic; margin-top: 6px; }

        .pr-sale {
          background: #f9f7ff; border: 1px solid rgba(139,92,246,0.08);
          border-radius: 14px; padding: 14px 16px; margin-bottom: 8px;
          display: flex; justify-content: space-between; align-items: center;
        }
        .pr-sale-phone { font-size: 13px; font-weight: 700; color: #1e1b2e; }
        .pr-sale-amount { font-family: 'Bebas Neue', sans-serif; font-size: 18px; color: #059669; }
        .pr-sale-date { font-size: 9px; color: #9ca3af; font-weight: 600; text-transform: uppercase; }

        .pr-scroll { max-height: 300px; overflow-y: auto; padding-right: 4px; }
        .pr-scroll::-webkit-scrollbar { width: 3px; }
        .pr-scroll::-webkit-scrollbar-thumb { background: rgba(139,92,246,0.25); border-radius: 10px; }

        .pr-no-pay { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 220px; gap: 10px; text-align: center; }

        @keyframes prFadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="pr-root">
        <div className="pr-blob" />
        <div className="pr-blob2" />

        <div className="pr-inner">
          <div style={{ display: 'flex', justifyContent: 'end', marginBottom: 24 }}>
            <button
              type="button"
              onClick={logout}
              title="Sign out"
              aria-label="Sign out"
              className="h-11 w-11 inline-flex items-center justify-center rounded-xl border border-red-100 bg-white text-red-500 shadow-sm transition-all hover:bg-red-50 hover:shadow-md active:scale-95"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>

          <div className="pr-profile">
            <div className="pr-profile-glow" />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div className="pr-avatar">{data.partnerName?.charAt(0) || 'P'}</div>
                  <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#9ca3af', marginBottom: 6 }}>Partner Profile</div>
                  <div className="pr-partner-name">{data.partnerName || '—'}</div>
                  <div className="pr-meta">
                    {data.partnerPhone && (
                      <span className="pr-meta-chip">
                        <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                        {data.partnerPhone}
                      </span>
                    )}
                    {data.partnerEmail && (
                      <span className="pr-meta-chip">
                        <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        {data.partnerEmail}
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#9ca3af', marginBottom: 10 }}>Active Coupons</div>
                  <div className="flex flex-col gap-2 items-end">
                    {data.coupons?.map(c => (
                      <div key={c.code} className="flex items-center gap-3">
                        <div className="pr-code-pill"># {c.code}</div>
                        <div className="pr-rate" style={{ marginTop: 0 }}><span className="pr-rate-dot" /> {c.commissionPercent}%</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pr-stats">
                <div className="pr-stat">
                  <div className="pr-stat-label">Generated Sales</div>
                  <div className="pr-stat-val">₹{data.totalSales.toLocaleString()}</div>
                </div>
                <div className="pr-stat">
                  <div className="pr-stat-label">Total Earnings</div>
                  <div className="pr-stat-val">₹{data.totalCommission.toLocaleString()}</div>
                </div>
                <div className="pr-stat green">
                  <div className="pr-stat-label">Withdrawn</div>
                  <div className="pr-stat-val">₹{data.totalPaid.toLocaleString()}</div>
                </div>
                <div className="pr-stat blue">
                  <div className="pr-stat-label">Current Balance</div>
                  <div className="pr-stat-val">₹{data.balance.toLocaleString()}</div>
                </div>
                <div className="pr-stat" style={{ border: '1px solid rgba(139,92,246,0.1)', background: 'white' }}>
                  <div className="pr-stat-label">Total Referrals</div>
                  <div className="pr-stat-val">{data.bills?.length || 0}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="pr-charts">
            <div className="pr-card">
              <div className="pr-card-head">
                <span className="pr-card-title">Coupon Performance</span>
              </div>
              <div style={{ height: 260, width: '100%', marginTop: 10 }}>
                {data.coupons?.some(c => c.sales > 0) ? (
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={data.coupons.filter(c => c.sales > 0)} dataKey="sales" nameKey="code" cx="50%" cy="50%" outerRadius={80} stroke="none">
                        {data.coupons.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
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

            <div className="pr-card">
              <div className="pr-card-head">
                <span className="pr-card-title">Recent Referrals</span>
                {data.bills?.length > 0 && <span className="pr-count-tag">{data.bills.length} Orders</span>}
              </div>
              {data.bills && data.bills.length > 0 ? (
                <div className="pr-scroll">
                  {data.bills.map((b, i) => (
                    <div key={i} className="pr-sale">
                      <div>
                        <div className="pr-sale-phone">{b.customerPhone}</div>
                        <div className="flex items-center gap-2">
                          <div className="pr-sale-date">{new Date(b.createdAt).toLocaleDateString()}</div>
                          <div style={{ fontSize: 9, fontWeight: 800, color: '#7c3aed', background: '#f5f3ff', padding: '1px 6px', borderRadius: 4 }}>{b.couponCode}</div>
                        </div>
                      </div>
                      <div className="pr-sale-amount">₹{b.payable.toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="pr-empty-chart">No referral orders yet.</div>
              )}
            </div>

            <div className="pr-card">
              <div className="pr-card-head">
                <span className="pr-card-title">Payout History</span>
                {data.payouts?.length > 0 && <span className="pr-count-tag">{data.payouts.length} Payments</span>}
              </div>
              {data.payouts && data.payouts.length > 0 ? (
                <div className="pr-scroll">
                  {data.payouts.map((p, i) => (
                    <div key={i} className="pr-payout">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                        <div className="pr-payout-amount">₹{p.amount.toLocaleString()}</div>
                        <div className="pr-payout-date">{new Date(p.createdAt).toLocaleDateString()}</div>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                        <span className="pr-method">{p.method}</span>
                        {p.couponCode && <span style={{ fontSize: 9, fontWeight: 800, color: '#7c3aed', background: '#f5f3ff', padding: '3px 10px', borderRadius: 6, border: '1px solid rgba(139,92,246,0.2)' }}>{p.couponCode}</span>}
                        {p.utr && <span className="pr-utr">UTR: {p.utr}</span>}
                        {p.razorpayPaymentId && <span className="pr-utr">ID: {p.razorpayPaymentId}</span>}
                      </div>
                      {p.notes && <div className="pr-notes">"{p.notes}"</div>}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="pr-no-pay">
                  <div style={{ fontSize: 36 }}>💸</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#1e1b2e' }}>No Payouts Yet</div>
                  <div style={{ fontSize: 12, color: '#9ca3af' }}>Commission payments will appear here.</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
