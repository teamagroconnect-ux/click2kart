import React, { useState } from 'react'
import api from '../../lib/api'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { CONFIG } from '../../shared/lib/config.js'

const COLORS = ['#8b5cf6', '#7c3aed', '#a78bfa', '#6d28d9', '#c4b5fd', '#ddd6fe']

export default function Partner() {
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)

  const fetchSummary = async (e) => {
    e.preventDefault()
    if (!code || !password) return
    setLoading(true); setError(null); setData(null)
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
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,700&display=swap');

        .pr-root {
          font-family: 'DM Sans', system-ui, sans-serif;
          background: #f5f3ff;
          min-height: 100vh;
          color: #1e1b2e;
          position: relative;
          overflow-x: hidden;
        }

        /* same grid pattern as Home hero */
        .pr-root::before {
          content: '';
          position: fixed; inset: 0;
          background-image:
            linear-gradient(rgba(139,92,246,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139,92,246,0.04) 1px, transparent 1px);
          background-size: 60px 60px;
          pointer-events: none; z-index: 0;
        }

        /* radial violet glow blobs — same as Home */
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

        /* ── HEADER ── */
        .pr-header {
          display: flex; flex-direction: column; gap: 32px;
          margin-bottom: 48px;
          animation: prFadeUp 0.7s ease both;
        }
        @media(min-width:900px) {
          .pr-header { flex-direction: row; align-items: flex-start; justify-content: space-between; }
        }

        .pr-logo-row { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }

        .pr-logo {
          width: 48px; height: 48px; border-radius: 14px;
          background: linear-gradient(135deg, #7c3aed, #a855f7);
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 900; color: white;
          box-shadow: 0 8px 24px rgba(124,58,237,0.3);
          border: 1px solid rgba(167,139,250,0.4);
          overflow: hidden; position: relative;
        }

        /* same eyebrow pill as Home */
        .pr-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 6px 18px; border-radius: 100px;
          background: rgba(139,92,246,0.1);
          border: 1px solid rgba(139,92,246,0.25);
          color: #7c3aed;
          font-size: 9px; font-weight: 700; letter-spacing: 0.22em; text-transform: uppercase;
        }
        .pr-eyebrow-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #7c3aed; box-shadow: 0 0 6px rgba(124,58,237,0.5);
          animation: prPulse 2s ease infinite;
        }
        @keyframes prPulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.7)} }

        /* Bebas Neue — exact same as Home h1 */
        .pr-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(40px, 6vw, 64px);
          color: #1e1b2e;
          letter-spacing: 0.02em; line-height: 0.95;
          margin: 12px 0 10px;
        }
        .pr-title span { color: #7c3aed; }

        .pr-subtitle {
          font-size: 14px; color: #6b7280; font-weight: 300;
          max-width: 380px; line-height: 1.65;
        }

        /* ── FORM ── */
        .pr-form {
          display: flex; flex-direction: column; gap: 10px;
          background: white;
          border: 1px solid rgba(139,92,246,0.15);
          border-radius: 24px; padding: 20px;
          box-shadow: 0 8px 40px rgba(139,92,246,0.08);
          width: 100%; max-width: 420px;
          align-self: flex-start;
        }

        .pr-input {
          width: 100%; box-sizing: border-box;
          background: #f5f3ff;
          border: 1px solid rgba(139,92,246,0.2);
          border-radius: 14px; padding: 13px 16px;
          font-size: 13px; font-weight: 600; color: #1e1b2e;
          outline: none; font-family: 'DM Sans', sans-serif;
          transition: all 0.2s;
        }
        .pr-input::placeholder { color: #9ca3af; }
        .pr-input:focus {
          border-color: rgba(124,58,237,0.5); background: white;
          box-shadow: 0 0 0 3px rgba(124,58,237,0.08);
        }

        /* same as Home btn-primary */
        .pr-btn {
          width: 100%;
          display: inline-flex; align-items: center; justify-content: center; gap: 10px;
          background: #7c3aed; color: white;
          border: none; border-radius: 14px; padding: 15px 24px;
          font-size: 11px; font-weight: 700;
          letter-spacing: 0.15em; text-transform: uppercase;
          cursor: pointer; font-family: 'DM Sans', sans-serif;
          transition: all 0.25s;
          box-shadow: 0 8px 30px rgba(124,58,237,0.3);
          position: relative; overflow: hidden;
        }
        .pr-btn::before {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.15), transparent);
          opacity: 0; transition: opacity 0.25s;
        }
        .pr-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 14px 40px rgba(124,58,237,0.45); }
        .pr-btn:hover:not(:disabled)::before { opacity: 1; }
        .pr-btn:active:not(:disabled) { transform: scale(0.97); }
        .pr-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        /* ── ERROR ── */
        .pr-error {
          display: flex; align-items: center; gap: 12px;
          background: #fef2f2; border: 1px solid #fecaca;
          color: #dc2626; font-size: 13px; font-weight: 600;
          padding: 14px 20px; border-radius: 14px; margin-bottom: 20px;
          animation: prFadeUp 0.4s ease;
        }

        /* ── ONBOARDING — mirrors Home CTA section ── */
        .pr-onboard {
          background: white;
          border: 1px solid rgba(139,92,246,0.15);
          border-radius: 32px; padding: 64px 40px; text-align: center;
          position: relative; overflow: hidden;
          box-shadow: 0 8px 50px rgba(139,92,246,0.07);
          animation: prFadeUp 0.7s 0.1s ease both;
        }
        /* same top violet stripe as Home CTA */
        .pr-onboard::after {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 3px;
          background: linear-gradient(90deg, transparent 10%, #7c3aed 50%, transparent 90%);
          border-radius: 32px 32px 0 0;
        }
        .pr-onboard-glow {
          position: absolute; top: -80px; left: 50%; transform: translateX(-50%);
          width: 500px; height: 300px; border-radius: 50%;
          background: radial-gradient(ellipse, rgba(139,92,246,0.07), transparent 70%);
          pointer-events: none;
        }
        .pr-onboard-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(36px, 6vw, 60px);
          line-height: 1; letter-spacing: 0.02em;
          color: #1e1b2e; margin: 16px 0;
        }
        .pr-onboard-title em { color: #7c3aed; font-style: normal; }
        .pr-onboard-sub {
          font-size: 16px; color: #6b7280; font-weight: 300;
          max-width: 460px; margin: 0 auto 40px; line-height: 1.7;
        }
        .pr-contact-card {
          display: inline-flex; align-items: center; gap: 16px;
          background: #f5f3ff; border: 1px solid rgba(139,92,246,0.2);
          padding: 18px 32px; border-radius: 16px; transition: all 0.25s;
        }
        .pr-contact-card:hover {
          background: white; border-color: rgba(124,58,237,0.4);
          box-shadow: 0 8px 24px rgba(124,58,237,0.1); transform: translateY(-2px);
        }
        .pr-contact-icon {
          width: 46px; height: 46px; border-radius: 13px;
          background: linear-gradient(135deg, #7c3aed, #a855f7);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 6px 18px rgba(124,58,237,0.3); flex-shrink: 0;
        }
        .pr-contact-label { font-size: 9px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: #7c3aed; }
        .pr-contact-value { font-size: 16px; font-weight: 700; color: #1e1b2e; margin-top: 3px; }

        /* ── EMPTY ── */
        .pr-empty {
          display: flex; flex-direction: column; align-items: center;
          text-align: center; padding: 60px 24px;
          animation: prFadeUp 0.7s 0.15s ease both;
        }
        .pr-empty-icon {
          width: 80px; height: 80px; border-radius: 24px;
          background: #f5f3ff; border: 1px solid rgba(139,92,246,0.2);
          display: flex; align-items: center; justify-content: center;
          font-size: 32px; margin-bottom: 20px;
          box-shadow: inset 0 2px 8px rgba(139,92,246,0.06);
        }
        .pr-empty h3 { font-family: 'Bebas Neue', sans-serif; font-size: 26px; color: #1e1b2e; letter-spacing: 0.05em; }
        .pr-empty p { font-size: 13px; color: #9ca3af; margin-top: 6px; max-width: 260px; }

        /* ── PROFILE CARD — same white card style as Home trust badges ── */
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

        /* ── STATS — same hover card style ── */
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

        /* ── CHARTS ROW ── */
        .pr-charts {
          display: grid; grid-template-columns: 1fr;
          gap: 16px; margin-top: 16px;
          animation: prFadeUp 0.6s 0.15s ease both;
        }
        @media(min-width:768px) { .pr-charts { grid-template-columns: 1fr 1fr; } }

        /* same white card as Home trust badges */
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
        .pr-count-tag { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; color: #7c3aed; background: #f5f3ff; border: 1px solid rgba(139,92,246,0.2); padding: 3px 10px; border-radius: 8px; }

        .pr-empty-chart {
          height: 260px; display: flex; align-items: center; justify-content: center;
          background: #f9f7ff; border-radius: 14px;
          border: 1px dashed rgba(139,92,246,0.2);
          font-size: 13px; color: #9ca3af; font-weight: 500;
        }

        /* ── PAYOUTS ── */
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

        .pr-scroll { max-height: 300px; overflow-y: auto; padding-right: 4px; }
        .pr-scroll::-webkit-scrollbar { width: 3px; }
        .pr-scroll::-webkit-scrollbar-thumb { background: rgba(139,92,246,0.25); border-radius: 10px; }

        .pr-no-pay { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 220px; gap: 10px; text-align: center; }

        /* ── STEPS ── */
        .pr-steps { display: flex; flex-direction: column; }

        .pr-step {
          display: flex; gap: 20px;
          margin-bottom: 0;
        }

        .pr-step-left {
          display: flex; flex-direction: column; align-items: center;
          flex-shrink: 0;
        }

        .pr-step-circle {
          width: 40px; height: 40px; border-radius: 50%;
          background: white;
          border: 2px solid rgba(139,92,246,0.2);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 17px; color: #9ca3af; letter-spacing: 0.05em;
          flex-shrink: 0; position: relative; z-index: 1;
          transition: all 0.3s;
        }
        .pr-step-circle.active {
          background: #7c3aed; border-color: #7c3aed; color: white;
          box-shadow: 0 4px 16px rgba(124,58,237,0.35);
        }
        .pr-step-circle.done {
          background: #059669; border-color: #059669; color: white;
          box-shadow: 0 4px 16px rgba(5,150,105,0.3);
          font-size: 16px;
        }

        .pr-step-line {
          width: 2px; flex: 1; min-height: 32px;
          background: linear-gradient(to bottom, rgba(139,92,246,0.2), rgba(139,92,246,0.06));
          margin: 6px 0;
        }

        .pr-step-body {
          padding-bottom: 32px; flex: 1; min-width: 0;
        }

        .pr-step-tag {
          display: inline-block;
          font-size: 9px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase;
          color: #7c3aed;
          background: rgba(139,92,246,0.08);
          border: 1px solid rgba(139,92,246,0.18);
          padding: 3px 10px; border-radius: 100px;
          margin-bottom: 8px;
        }

        .pr-step-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 22px; color: #1e1b2e; letter-spacing: 0.03em; line-height: 1;
          margin-bottom: 10px;
        }

        .pr-step-desc {
          font-size: 13px; color: #6b7280; font-weight: 400; line-height: 1.7;
          margin-bottom: 16px; max-width: 520px;
        }

        .pr-step-btn {
          display: inline-flex; align-items: center; gap: 8px;
          background: #7c3aed; color: white;
          padding: 11px 24px; border-radius: 10px;
          font-size: 11px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.14em;
          text-decoration: none; transition: all 0.25s;
          box-shadow: 0 6px 20px rgba(124,58,237,0.28);
        }
        .pr-step-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(124,58,237,0.4); }

        .pr-step-contact {
          display: inline-flex; align-items: center; gap: 12px;
          background: #f5f3ff; border: 1px solid rgba(139,92,246,0.18);
          padding: 12px 18px; border-radius: 12px;
        }

        .pr-step-info {
          display: inline-flex; align-items: flex-start; gap: 8px;
          background: rgba(139,92,246,0.05);
          border: 1px solid rgba(139,92,246,0.12);
          padding: 10px 14px; border-radius: 10px;
          font-size: 12px; color: #7c3aed; font-weight: 500; line-height: 1.5;
        }

        @keyframes prFadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="pr-root">
        <div className="pr-blob" />
        <div className="pr-blob2" />

        <div className="pr-inner">

          {/* ── HEADER ── */}
          <div className="pr-header">
            <div>
              <div className="pr-logo-row">
                <span className="pr-eyebrow">
                  <span className="pr-eyebrow-dot" />
                  Partner Portal
                </span>
              </div>
              <h1 className="pr-title">Partner <span>Dashboard</span></h1>
              <p className="pr-subtitle">Enter your referral credentials to track your performance and earnings in real-time.</p>
            </div>

            <form onSubmit={fetchSummary} className="pr-form">
              <input className="pr-input" placeholder="Coupon Code…" value={code} onChange={e => setCode(e.target.value.toUpperCase())} />
              <input type="password" className="pr-input" placeholder="Portal Password…" value={password} onChange={e => setPassword(e.target.value)} />
              <button type="submit" className="pr-btn" disabled={!code || !password || loading}>
                {loading ? '⟳  Verifying…' : 'Access Portal →'}
              </button>
            </form>
          </div>

          {/* ── ERROR ── */}
          {error && (
            <div className="pr-error">
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error === 'not_found' ? 'Invalid coupon code or inactive partner.'
                : error === 'invalid_password' ? 'Incorrect portal password.' : error}
            </div>
          )}

          {/* ── ONBOARDING STEPS ── */}
          {!data && !loading && !error && (
            <div className="pr-onboard">
              <div className="pr-onboard-glow" />
              <div style={{ position: 'relative', zIndex: 1 }}>

                {/* heading */}
                <div style={{ marginBottom: 36 }}>
                  <span className="pr-eyebrow" style={{ display: 'inline-flex', marginBottom: 16 }}>
                    <span className="pr-eyebrow-dot" /> Onboarding Process
                  </span>
                  <h2 className="pr-onboard-title">How to Become a <em>Partner?</em></h2>
                  <p className="pr-onboard-sub">
                    Join India's most exclusive B2B tech distribution network. Follow these simple steps and start earning commissions on every order.
                  </p>
                </div>

                {/* steps */}
                <div className="pr-steps">

                  {/* step 1 */}
                  <div className="pr-step">
                    <div className="pr-step-left">
                      <div className="pr-step-circle active">1</div>
                      <div className="pr-step-line" />
                    </div>
                    <div className="pr-step-body">
                      <div className="pr-step-tag">Get Started</div>
                      <div className="pr-step-title">Create Your Account</div>
                      <div className="pr-step-desc">
                        Click the button below to visit our sign-up page. Fill in your business details — it takes less than 2 minutes. No documents needed at this stage.
                      </div>
                      <a
                        href="/signup"
                        className="pr-step-btn"
                      >
                        Sign Up Now
                        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </a>
                    </div>
                  </div>

                  {/* step 2 */}
                  <div className="pr-step">
                    <div className="pr-step-left">
                      <div className="pr-step-circle">2</div>
                      <div className="pr-step-line" />
                    </div>
                    <div className="pr-step-body">
                      <div className="pr-step-tag">Activation</div>
                      <div className="pr-step-title">Request Account Activation</div>
                      <div className="pr-step-desc">
                        Once registered, send us an email from your registered address. Our team will manually review and activate your partner account within 24 hours.
                      </div>
                      <div className="pr-step-contact">
                        <div className="pr-contact-icon" style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0 }}>
                          <svg width="16" height="16" fill="none" stroke="white" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <div className="pr-contact-label">Email us at</div>
                          <div className="pr-contact-value" style={{ fontSize: 14 }}>{CONFIG.SUPPORT_EMAIL}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* step 3 */}
                  <div className="pr-step">
                    <div className="pr-step-left">
                      <div className="pr-step-circle">3</div>
                      <div className="pr-step-line" />
                    </div>
                    <div className="pr-step-body">
                      <div className="pr-step-tag">Verification</div>
                      <div className="pr-step-title">Complete Your KYC</div>
                      <div className="pr-step-desc">
                        After activation, you'll be prompted to complete a quick KYC (Know Your Customer) process. Submit your GST number, business PAN, and address proof to unlock full ordering privileges.
                      </div>
                      <div className="pr-step-info">
                        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: 1 }}>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        KYC typically takes 1–2 business days to verify.
                      </div>
                    </div>
                  </div>

                  {/* step 4 — final */}
                  <div className="pr-step" style={{ marginBottom: 0 }}>
                    <div className="pr-step-left">
                      <div className="pr-step-circle done">✓</div>
                    </div>
                    <div className="pr-step-body" style={{ paddingBottom: 0 }}>
                      <div className="pr-step-tag" style={{ background: 'rgba(5,150,105,0.1)', color: '#059669', borderColor: 'rgba(5,150,105,0.2)' }}>You're In!</div>
                      <div className="pr-step-title">Start Ordering & Earning</div>
                      <div className="pr-step-desc">
                        Your account is fully activated. Browse the entire wholesale catalogue, place bulk orders at exclusive partner pricing, and earn commission on every referral — tracked right here on this dashboard.
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* ── DASHBOARD ── */}
          {data && (
            <div style={{ animation: 'prFadeUp 0.6s ease both' }}>

              {/* Profile */}
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
                      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#9ca3af', marginBottom: 10 }}>Active Code</div>
                      <div className="pr-code-pill"># {data.code}</div>
                      <div className="pr-rate"><span className="pr-rate-dot" /> Commission: {data.commissionPercent}%</div>
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
                  </div>
                </div>
              </div>

              {/* Charts */}
              <div className="pr-charts">
                <div className="pr-card">
                  <div className="pr-card-head">
                    <span className="pr-card-title">Commission by Category</span>
                    <span className="pr-card-dot" />
                  </div>
                  {data.categoryBreakdown && data.categoryBreakdown.length > 0 ? (
                    <div style={{ height: 260 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={data.categoryBreakdown} cx="50%" cy="50%" innerRadius={65} outerRadius={95} paddingAngle={6} dataKey="value">
                            {data.categoryBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                          </Pie>
                          <Tooltip formatter={v => `₹${Number(v).toFixed(2)}`}
                            contentStyle={{ background: 'white', border: '1px solid rgba(139,92,246,0.2)', borderRadius: 12, fontSize: 12, padding: '10px 16px', boxShadow: '0 8px 24px rgba(139,92,246,0.12)' }} />
                          <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: 10, color: '#6b7280' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="pr-empty-chart">No category data available yet.</div>
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
          )}

        </div>
      </div>
    </>
  )
}