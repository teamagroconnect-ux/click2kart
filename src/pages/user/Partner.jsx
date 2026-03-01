import React, { useState } from 'react'
import api from '../../lib/api'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { CONFIG } from '../../shared/lib/config.js'

const COLORS = ['#a78bfa', '#7c3aed', '#c4b5fd', '#6d28d9', '#ddd6fe', '#8b5cf6']

export default function Partner() {
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)

  const fetchSummary = async (e) => {
    e.preventDefault()
    if (!code || !password) return
    setLoading(true)
    setError(null)
    setData(null)
    try {
      const { data } = await api.post(`/api/public/partner/summary/${code}`, { password })
      setData(data)
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to fetch summary')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,700;1,9..40,300&display=swap');

        .partner-root {
          font-family: 'DM Sans', system-ui, sans-serif;
          background: #06040f;
          min-height: 100vh;
          color: #e8e4f0;
          position: relative;
          overflow-x: hidden;
        }

        /* grain */
        .partner-root::before {
          content: '';
          position: fixed; inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
          pointer-events: none; z-index: 999; opacity: 0.4;
        }

        /* mesh bg blobs */
        .partner-blob1 {
          position: fixed; top: -200px; left: -200px;
          width: 700px; height: 700px; border-radius: 50%;
          background: radial-gradient(ellipse, rgba(109,40,217,0.18), transparent 70%);
          pointer-events: none; z-index: 0;
        }
        .partner-blob2 {
          position: fixed; bottom: -300px; right: -200px;
          width: 800px; height: 800px; border-radius: 50%;
          background: radial-gradient(ellipse, rgba(139,92,246,0.1), transparent 70%);
          pointer-events: none; z-index: 0;
        }

        .partner-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 48px 24px 80px;
          position: relative; z-index: 1;
        }

        /* ── header ── */
        .p-header {
          display: flex;
          flex-direction: column;
          gap: 32px;
          margin-bottom: 48px;
          animation: fadeUp 0.7s ease both;
        }
        @media(min-width:900px) {
          .p-header { flex-direction: row; align-items: flex-start; justify-content: space-between; }
        }

        .p-logo-row {
          display: flex; align-items: center; gap: 12px; margin-bottom: 12px;
        }

        .p-logo {
          width: 48px; height: 48px; border-radius: 14px;
          background: linear-gradient(135deg, #7c3aed, #a855f7);
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; font-weight: 900; color: white;
          box-shadow: 0 8px 24px rgba(124,58,237,0.4);
          border: 1px solid rgba(167,139,250,0.3);
          overflow: hidden; position: relative;
        }

        .p-badge {
          font-size: 9px; font-weight: 700;
          letter-spacing: 0.2em; text-transform: uppercase;
          background: rgba(139,92,246,0.15);
          border: 1px solid rgba(139,92,246,0.3);
          color: #a78bfa;
          padding: 5px 14px; border-radius: 100px;
        }

        .p-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(36px, 5vw, 56px);
          color: #f0ecff;
          letter-spacing: 0.02em;
          line-height: 1;
          margin-bottom: 8px;
        }

        .p-subtitle {
          font-size: 14px; color: #6b6882; font-weight: 400;
          max-width: 380px; line-height: 1.6;
        }

        /* ── login form ── */
        .p-form {
          display: flex;
          flex-direction: column;
          gap: 12px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(139,92,246,0.15);
          border-radius: 20px;
          padding: 20px;
          backdrop-filter: blur(12px);
          width: 100%;
          max-width: 460px;
          align-self: flex-start;
        }

        .p-form-row {
          display: flex; flex-direction: column; gap: 8px;
        }
        @media(min-width:500px) { .p-form-row { flex-direction: row; } }

        .p-input {
          flex: 1;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(139,92,246,0.2);
          border-radius: 12px;
          padding: 13px 16px;
          font-size: 13px;
          font-weight: 600;
          color: #e8e4f0;
          outline: none;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.2s;
        }
        .p-input::placeholder { color: #4a4665; }
        .p-input:focus {
          border-color: rgba(139,92,246,0.5);
          background: rgba(139,92,246,0.06);
          box-shadow: 0 0 0 3px rgba(139,92,246,0.1);
        }

        .p-btn {
          width: 100%;
          background: linear-gradient(135deg, #7c3aed, #6d28d9);
          color: white;
          border: none;
          border-radius: 12px;
          padding: 14px 24px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.25s;
          box-shadow: 0 8px 30px rgba(109,40,217,0.35);
          font-family: 'DM Sans', sans-serif;
          position: relative; overflow: hidden;
        }
        .p-btn::before {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.12), transparent);
          opacity: 0; transition: opacity 0.25s;
        }
        .p-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(109,40,217,0.5); }
        .p-btn:hover:not(:disabled)::before { opacity: 1; }
        .p-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        /* ── error ── */
        .p-error {
          display: flex; align-items: center; gap: 12px;
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.2);
          color: #f87171;
          font-size: 13px; font-weight: 600;
          padding: 16px 24px; border-radius: 14px;
          animation: fadeUp 0.4s ease;
          margin-bottom: 16px;
        }

        /* ── empty state ── */
        .p-empty {
          display: flex; flex-direction: column; align-items: center;
          justify-content: center; text-align: center;
          padding: 80px 24px;
          animation: fadeUp 0.7s ease both;
        }
        .p-empty-icon {
          width: 80px; height: 80px; border-radius: 24px;
          background: rgba(139,92,246,0.1);
          border: 1px solid rgba(139,92,246,0.2);
          display: flex; align-items: center; justify-content: center;
          font-size: 32px; margin-bottom: 20px;
        }
        .p-empty h3 {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 28px; color: #e8e4f0; letter-spacing: 0.05em;
        }
        .p-empty p { font-size: 13px; color: #6b6882; margin-top: 8px; max-width: 280px; }

        /* ── onboarding hero ── */
        .p-onboard {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(139,92,246,0.15);
          border-radius: 28px;
          padding: 64px 40px;
          text-align: center;
          position: relative; overflow: hidden;
          animation: fadeUp 0.7s 0.1s ease both;
        }
        .p-onboard::before {
          content: '';
          position: absolute; top: 0; left: 50%; transform: translateX(-50%);
          width: 600px; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(139,92,246,0.5), transparent);
        }
        .p-onboard-glow {
          position: absolute; top: -100px; left: 50%; transform: translateX(-50%);
          width: 400px; height: 300px; border-radius: 50%;
          background: radial-gradient(ellipse, rgba(109,40,217,0.15), transparent 70%);
          pointer-events: none;
        }

        .p-onboard-eyebrow {
          display: inline-block;
          font-size: 9px; font-weight: 700; letter-spacing: 0.25em; text-transform: uppercase;
          color: #a78bfa;
          background: rgba(139,92,246,0.1);
          border: 1px solid rgba(139,92,246,0.25);
          padding: 6px 16px; border-radius: 100px;
          margin-bottom: 24px;
        }

        .p-onboard-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(36px, 6vw, 64px);
          line-height: 1; letter-spacing: 0.02em;
          color: #f0ecff; margin-bottom: 16px;
        }
        .p-onboard-title em { color: #a78bfa; font-style: normal; }

        .p-onboard-sub {
          font-size: 16px; color: #6b6882; font-weight: 300;
          max-width: 480px; margin: 0 auto 40px; line-height: 1.7;
        }

        .p-contact-card {
          display: inline-flex; align-items: center; gap: 16px;
          background: rgba(139,92,246,0.08);
          border: 1px solid rgba(139,92,246,0.2);
          padding: 20px 32px; border-radius: 16px;
          text-align: left;
          transition: all 0.25s;
        }
        .p-contact-card:hover { background: rgba(139,92,246,0.14); border-color: rgba(139,92,246,0.4); }

        .p-contact-icon {
          width: 48px; height: 48px; border-radius: 14px;
          background: linear-gradient(135deg, #7c3aed, #a855f7);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 6px 20px rgba(124,58,237,0.35);
        }

        .p-contact-label { font-size: 9px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: #7c3aed; }
        .p-contact-value { font-size: 16px; font-weight: 700; color: #e8e4f0; margin-top: 2px; }

        /* ── dashboard ── */
        .p-profile-card {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(139,92,246,0.15);
          border-radius: 24px;
          padding: 36px 40px;
          margin-bottom: 24px;
          position: relative; overflow: hidden;
          animation: fadeUp 0.6s ease both;
        }
        .p-profile-card::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(139,92,246,0.5), transparent);
        }
        .p-profile-glow {
          position: absolute; top: -80px; right: -80px;
          width: 300px; height: 300px; border-radius: 50%;
          background: radial-gradient(ellipse, rgba(109,40,217,0.12), transparent 70%);
          pointer-events: none;
        }

        .p-avatar {
          width: 68px; height: 68px; border-radius: 20px;
          background: linear-gradient(135deg, #6d28d9, #7c3aed);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 28px; color: white; letter-spacing: 0.05em;
          box-shadow: 0 8px 28px rgba(109,40,217,0.4);
          border: 1px solid rgba(167,139,250,0.25);
          margin-bottom: 16px;
        }

        .p-name {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 32px; color: #f0ecff; letter-spacing: 0.02em;
          line-height: 1;
        }

        .p-contact-row {
          display: flex; flex-wrap: wrap; gap: 12px; margin-top: 8px;
        }
        .p-contact-chip {
          display: flex; align-items: center; gap: 6px;
          font-size: 12px; color: #8b7aaa; font-weight: 500;
        }

        .p-code-tag {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(139,92,246,0.12);
          border: 1px solid rgba(139,92,246,0.3);
          padding: 10px 20px; border-radius: 12px;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 22px; color: #a78bfa; letter-spacing: 0.1em;
        }

        .p-rate-tag {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 10px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.15em; color: #34d399; margin-top: 8px;
        }
        .p-rate-dot { width: 6px; height: 6px; border-radius: 50%; background: #34d399; box-shadow: 0 0 6px #34d399; }

        /* stats */
        .p-stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          margin-top: 28px;
        }
        @media(min-width:768px) { .p-stats-grid { grid-template-columns: repeat(4, 1fr); } }

        .p-stat-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(139,92,246,0.1);
          border-radius: 18px;
          padding: 22px 20px;
          transition: all 0.3s;
          position: relative; overflow: hidden;
        }
        .p-stat-card:hover {
          background: rgba(139,92,246,0.06);
          border-color: rgba(139,92,246,0.3);
          transform: translateY(-3px);
        }
        .p-stat-card::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(139,92,246,0.3), transparent);
          opacity: 0; transition: opacity 0.3s;
        }
        .p-stat-card:hover::before { opacity: 1; }

        .p-stat-label {
          font-size: 9px; font-weight: 700; letter-spacing: 0.2em;
          text-transform: uppercase; color: #4a4665; margin-bottom: 10px;
        }
        .p-stat-value {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 28px; color: #f0ecff; letter-spacing: 0.02em; line-height: 1;
        }
        .p-stat-card.green .p-stat-label { color: #059669; }
        .p-stat-card.green .p-stat-value { color: #34d399; }
        .p-stat-card.blue .p-stat-label { color: #3b82f6; }
        .p-stat-card.blue .p-stat-value { color: #60a5fa; }

        /* charts row */
        .p-charts-row {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
          margin-top: 16px;
          animation: fadeUp 0.6s 0.15s ease both;
        }
        @media(min-width:768px) { .p-charts-row { grid-template-columns: 1fr 1fr; } }

        .p-card {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(139,92,246,0.12);
          border-radius: 24px;
          padding: 32px;
          position: relative; overflow: hidden;
        }
        .p-card::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(139,92,246,0.35), transparent);
        }

        .p-card-title {
          font-size: 9px; font-weight: 700; letter-spacing: 0.2em;
          text-transform: uppercase; color: #4a4665; margin-bottom: 24px;
          display: flex; align-items: center; justify-content: space-between;
        }
        .p-card-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #7c3aed; box-shadow: 0 0 8px #7c3aed;
          animation: pulse 2s ease infinite;
        }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }

        /* payout items */
        .p-payout-item {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(139,92,246,0.08);
          border-radius: 14px;
          padding: 18px 20px;
          margin-bottom: 10px;
          transition: all 0.25s;
        }
        .p-payout-item:hover {
          background: rgba(139,92,246,0.06);
          border-color: rgba(139,92,246,0.2);
        }
        .p-payout-amount {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 22px; color: #a78bfa; letter-spacing: 0.05em;
        }
        .p-payout-date { font-size: 10px; color: #4a4665; font-weight: 600; }
        .p-method-tag {
          font-size: 9px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.15em; color: #7c3aed;
          background: rgba(139,92,246,0.1);
          border: 1px solid rgba(139,92,246,0.2);
          padding: 3px 10px; border-radius: 6px;
        }
        .p-utr { font-size: 10px; color: #4a4665; font-weight: 600; }
        .p-notes { font-size: 11px; color: #4a4665; font-style: italic; margin-top: 8px; }

        .p-empty-chart {
          height: 280px; display: flex; align-items: center; justify-content: center;
          background: rgba(139,92,246,0.04); border-radius: 16px;
          border: 1px dashed rgba(139,92,246,0.15);
          font-size: 13px; color: #4a4665; font-weight: 500;
        }

        .p-scroll { max-height: 320px; overflow-y: auto; padding-right: 4px; }
        .p-scroll::-webkit-scrollbar { width: 3px; }
        .p-scroll::-webkit-scrollbar-track { background: transparent; }
        .p-scroll::-webkit-scrollbar-thumb { background: rgba(139,92,246,0.3); border-radius: 10px; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="partner-root">
        <div className="partner-blob1" />
        <div className="partner-blob2" />

        <div className="partner-inner">

          {/* ── HEADER ── */}
          <div className="p-header">
            <div>
              <div className="p-logo-row">
                <div className="p-logo">
                  <img src="/logo.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }}
                    onError={e => e.target.style.display = 'none'} />
                  <span style={{ position: 'relative', zIndex: 1 }}>C2K</span>
                </div>
                <span className="p-badge">Partner Portal</span>
              </div>
              <h1 className="p-title">Partner Dashboard</h1>
              <p className="p-subtitle">Enter your referral credentials to track your performance and earnings in real-time.</p>
            </div>

            <form onSubmit={fetchSummary} className="p-form">
              <div className="p-form-row">
                <input
                  className="p-input"
                  placeholder="Coupon Code..."
                  value={code}
                  onChange={e => setCode(e.target.value.toUpperCase())}
                />
                <input
                  type="password"
                  className="p-input"
                  placeholder="Portal Password..."
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
              <button
                type="submit"
                className="p-btn"
                disabled={!code || !password || loading}
              >
                {loading ? '⟳ Verifying...' : 'Access Portal →'}
              </button>
            </form>
          </div>

          {/* ── ERROR ── */}
          {error && (
            <div className="p-error">
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error === 'not_found' ? 'Invalid coupon code or inactive partner.' : error === 'invalid_password' ? 'Incorrect portal password.' : error}
            </div>
          )}

          {/* ── ONBOARDING / HOW TO JOIN ── */}
          {!data && !loading && !error && (
            <div className="p-onboard">
              <div className="p-onboard-glow" />
              <span className="p-onboard-eyebrow">Onboarding Process</span>
              <h2 className="p-onboard-title">
                How to Become a <em>Partner?</em>
              </h2>
              <p className="p-onboard-sub">
                Join India's most exclusive network of B2B tech distributors.
                Get your unique referral credentials and start earning today.
              </p>
              <div className="p-contact-card">
                <div className="p-contact-icon">
                  <svg width="22" height="22" fill="none" stroke="white" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <div className="p-contact-label">Direct Email</div>
                  <div className="p-contact-value">{CONFIG.SUPPORT_EMAIL}</div>
                </div>
              </div>
            </div>
          )}

          {/* ── EMPTY CTA ── */}
          {!data && !loading && !error && (
            <div className="p-empty" style={{ marginTop: 32 }}>
              <div className="p-empty-icon">🎟️</div>
              <h3>Ready to check your earnings?</h3>
              <p>Enter your unique partner coupon code above to access your performance data.</p>
            </div>
          )}

          {/* ── DASHBOARD DATA ── */}
          {data && (
            <div style={{ animation: 'fadeUp 0.6s ease both' }}>

              {/* Profile + Stats */}
              <div className="p-profile-card">
                <div className="p-profile-glow" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24, position: 'relative', zIndex: 1 }}>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div className="p-avatar">{data.partnerName?.charAt(0) || 'P'}</div>
                      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#4a4665', marginBottom: 6 }}>Partner Profile</div>
                      <div className="p-name">{data.partnerName || '—'}</div>
                      <div className="p-contact-row">
                        {data.partnerPhone && (
                          <span className="p-contact-chip">
                            <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                            {data.partnerPhone}
                          </span>
                        )}
                        {data.partnerEmail && (
                          <span className="p-contact-chip">
                            <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                            {data.partnerEmail}
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#4a4665', marginBottom: 10 }}>Active Code</div>
                      <div className="p-code-tag"># {data.code}</div>
                      <div className="p-rate-tag">
                        <span className="p-rate-dot" />
                        Commission: {data.commissionPercent}%
                      </div>
                    </div>
                  </div>

                  {/* 4 stat cards */}
                  <div className="p-stats-grid">
                    <div className="p-stat-card">
                      <div className="p-stat-label">Generated Sales</div>
                      <div className="p-stat-value">₹{data.totalSales.toLocaleString()}</div>
                    </div>
                    <div className="p-stat-card">
                      <div className="p-stat-label">Total Earnings</div>
                      <div className="p-stat-value">₹{data.totalCommission.toLocaleString()}</div>
                    </div>
                    <div className="p-stat-card green">
                      <div className="p-stat-label">Withdrawn</div>
                      <div className="p-stat-value">₹{data.totalPaid.toLocaleString()}</div>
                    </div>
                    <div className="p-stat-card blue">
                      <div className="p-stat-label">Current Balance</div>
                      <div className="p-stat-value">₹{data.balance.toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chart + Payouts */}
              <div className="p-charts-row">
                <div className="p-card">
                  <div className="p-card-title">
                    Commission by Category
                    <span className="p-card-dot" />
                  </div>
                  {data.categoryBreakdown && data.categoryBreakdown.length > 0 ? (
                    <div style={{ height: 280 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={data.categoryBreakdown} cx="50%" cy="50%" innerRadius={65} outerRadius={95} paddingAngle={6} dataKey="value">
                            {data.categoryBreakdown.map((_, i) => (
                              <Cell key={i} fill={COLORS[i % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={v => `₹${Number(v).toFixed(2)}`}
                            contentStyle={{
                              background: '#0e0b1a', border: '1px solid rgba(139,92,246,0.3)',
                              borderRadius: 12, color: '#e8e4f0', fontSize: 12, padding: '10px 16px'
                            }}
                          />
                          <Legend
                            verticalAlign="bottom" height={36} iconType="circle"
                            wrapperStyle={{ fontSize: 10, color: '#8b7aaa' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="p-empty-chart">No category data available yet.</div>
                  )}
                </div>

                <div className="p-card">
                  <div className="p-card-title">
                    Payout History
                    {data.payouts && data.payouts.length > 0 && (
                      <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#7c3aed', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', padding: '3px 10px', borderRadius: 8 }}>
                        {data.payouts.length} Payments
                      </span>
                    )}
                  </div>

                  {data.payouts && data.payouts.length > 0 ? (
                    <div className="p-scroll">
                      {data.payouts.map((p, i) => (
                        <div key={i} className="p-payout-item">
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                            <div className="p-payout-amount">₹{p.amount.toLocaleString()}</div>
                            <div className="p-payout-date">{new Date(p.createdAt).toLocaleDateString()}</div>
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                            <span className="p-method-tag">{p.method}</span>
                            {p.utr && <span className="p-utr">UTR: {p.utr}</span>}
                            {p.razorpayPaymentId && <span className="p-utr">ID: {p.razorpayPaymentId}</span>}
                          </div>
                          {p.notes && <div className="p-notes">"{p.notes}"</div>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 240, gap: 12 }}>
                      <div style={{ fontSize: 36 }}>💸</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#e8e4f0', textAlign: 'center' }}>No Payouts Yet</div>
                      <div style={{ fontSize: 11, color: '#4a4665', textAlign: 'center' }}>Your commission payments will appear here.</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}