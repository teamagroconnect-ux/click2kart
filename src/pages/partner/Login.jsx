import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../lib/api'
import PasswordInput from '../../components/PasswordInput'
import { CONFIG } from '../../shared/lib/config.js'

export default function PartnerLogin() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [useOtp, setUseOtp] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('partnerToken')
    if (token) {
      navigate('/partner/dashboard')
    }
  }, [navigate])

  const validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      )
  }

  const sendOtp = async () => {
    if (!validateEmail(email)) {
      setError('Please enter a valid business email address')
      return
    }
    setLoading(true)
    setError(null)
    try {
      await api.post('/api/public/partner/send-otp', { email })
      setOtpSent(true)
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateEmail(email)) {
      setError('Please enter a valid business email address')
      return
    }
    if (!password && !otp) return
    setLoading(true)
    setError(null)
    try {
      const payload = useOtp ? { otp, email } : { password, email }
      const { data } = await api.post(`/api/public/partner/login`, payload)
      if (data.token) {
        localStorage.setItem('partnerToken', data.token)
        localStorage.setItem('partnerData', JSON.stringify(data))
      }
      navigate('/partner/dashboard')
    } catch (err) {
      setError(err?.response?.data?.error || 'Authentication failed. Please check your credentials.')
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

        .pr-header {
          display: flex; flex-direction: column; gap: 32px;
          margin-bottom: 48px;
          animation: prFadeUp 0.7s ease both;
        }
        @media(min-width:900px) {
          .pr-header { flex-direction: row; align-items: flex-start; justify-content: space-between; }
        }

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

        .pr-btn {
          width: 100%;
          display: inline-flex; align-items: center; justify-content: center; gap: 12px;
          background: linear-gradient(135deg, #7c3aed, #6366f1); color: white;
          border: none; border-radius: 16px; padding: 16px 32px;
          font-size: 11px; font-weight: 800;
          letter-spacing: 0.15em; text-transform: uppercase;
          cursor: pointer; font-family: 'DM Sans', sans-serif;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          box-shadow: 0 8px 24px rgba(124,58,237,0.3);
          position: relative; overflow: hidden;
        }
        .pr-btn::after {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transform: translateX(-100%); transition: transform 0.6s;
        }
        .pr-btn:hover:not(:disabled) {
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 16px 48px rgba(124,58,237,0.45);
        }
        .pr-btn:hover:not(:disabled)::after { transform: translateX(100%); }
        .pr-btn:active:not(:disabled) { transform: translateY(-1px) scale(0.97); }
        .pr-btn:disabled { background: #f3f4f6; color: #d1d5db; box-shadow: none; cursor: not-allowed; }

        .pr-error {
          display: flex; align-items: center; gap: 12px;
          background: #fef2f2; border: 1px solid #fecaca;
          color: #dc2626; font-size: 13px; font-weight: 600;
          padding: 14px 20px; border-radius: 14px; margin-bottom: 20px;
          animation: prFadeUp 0.4s ease;
        }

        .pr-onboard {
          background: white;
          border: 1px solid rgba(139,92,246,0.15);
          border-radius: 32px; padding: 64px 40px; text-align: center;
          position: relative; overflow: hidden;
          box-shadow: 0 8px 50px rgba(139,92,246,0.07);
          animation: prFadeUp 0.7s 0.1s ease both;
        }
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

        .pr-steps-layout {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }
        @media(min-width: 900px) {
          .pr-steps-layout {
            grid-template-columns: 1fr 1fr 1fr;
            gap: 16px;
            align-items: start;
          }
        }

        .pr-step-card {
          background: white;
          border: 1px solid rgba(139,92,246,0.12);
          border-radius: 20px;
          padding: 28px 28px 28px 24px;
          position: relative;
          overflow: hidden;
          transition: all 0.3s;
          display: flex;
          gap: 20px;
          box-shadow: 0 2px 16px rgba(139,92,246,0.05);
        }
        .pr-step-card:hover {
          border-color: rgba(124,58,237,0.28);
          box-shadow: 0 8px 32px rgba(124,58,237,0.1);
          transform: translateY(-2px);
        }
        .pr-step-card::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, transparent, rgba(139,92,246,0.3), transparent);
          opacity: 0; transition: opacity 0.3s;
        }
        .pr-step-card:hover::before { opacity: 1; }
        .pr-step-card.active-card {
          border-color: rgba(124,58,237,0.25);
          background: linear-gradient(135deg, white 60%, #faf8ff);
          box-shadow: 0 4px 24px rgba(124,58,237,0.1);
        }
        .pr-step-card.active-card::before { opacity: 1; background: linear-gradient(90deg, transparent, #7c3aed, transparent); }
        .pr-step-card.done-card {
          border-color: rgba(5,150,105,0.2);
          background: linear-gradient(135deg, white 60%, #f0fdf4);
        }
        .pr-step-card.done-card::before { opacity: 1; background: linear-gradient(90deg, transparent, #059669, transparent); }

        .pr-step-num-col {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex-shrink: 0;
          padding-top: 2px;
        }
        .pr-step-circle {
          width: 44px; height: 44px; border-radius: 50%;
          background: #f5f3ff;
          border: 2px solid rgba(139,92,246,0.18);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 18px; color: #9ca3af; letter-spacing: 0.05em;
          flex-shrink: 0;
          transition: all 0.3s;
        }
        .pr-step-circle.active {
          background: #7c3aed; border-color: #7c3aed; color: white;
          box-shadow: 0 6px 20px rgba(124,58,237,0.35);
        }
        .pr-step-circle.done {
          background: #059669; border-color: #059669; color: white;
          box-shadow: 0 6px 20px rgba(5,150,105,0.28);
          font-size: 17px;
        }

        .pr-step-content { flex: 1; min-width: 0; }
        .pr-step-tag {
          display: inline-block;
          font-size: 9px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase;
          color: #7c3aed;
          background: rgba(139,92,246,0.08);
          border: 1px solid rgba(139,92,246,0.18);
          padding: 3px 10px; border-radius: 100px;
          margin-bottom: 8px;
        }
        .pr-step-tag.green { color: #059669; background: rgba(5,150,105,0.08); border-color: rgba(5,150,105,0.18); }
        .pr-step-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 24px; color: #1e1b2e; letter-spacing: 0.03em; line-height: 1;
          margin-bottom: 10px;
        }
        .pr-step-desc {
          font-size: 13px; color: #6b7280; font-weight: 400; line-height: 1.72;
          margin-bottom: 18px;
        }

        .pr-step-contact {
          display: inline-flex; align-items: center; gap: 12px;
          background: #f5f3ff; border: 1px solid rgba(139,92,246,0.18);
          padding: 12px 16px; border-radius: 12px;
        }
        .pr-contact-icon {
          width: 36px; height: 36px; border-radius: 10px;
          background: linear-gradient(135deg, #7c3aed, #a855f7);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 6px 18px rgba(124,58,237,0.3); flex-shrink: 0;
        }
        .pr-contact-label { font-size: 9px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: #7c3aed; }
        .pr-contact-value { font-size: 13px; font-weight: 700; color: #1e1b2e; margin-top: 3px; }
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
          <div className="pr-header">
            <div>
              <span className="pr-eyebrow">
                <span className="pr-eyebrow-dot" />
                Partner Portal
              </span>
              <h1 className="pr-title">Partner <span>Login</span></h1>
              <p className="pr-subtitle">Enter your referral credentials to track your performance and earnings in real-time.</p>
            </div>

            <form onSubmit={handleSubmit} className="pr-form">
              <input
                type="email"
                className="pr-input"
                placeholder="Partner Email…"
                value={email}
                onChange={e => setEmail(e.target.value.toLowerCase())}
              />

              <div className="flex gap-2 p-1 bg-gray-100 rounded-xl mb-1">
                <button
                  type="button"
                  onClick={() => setUseOtp(false)}
                  className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${!useOtp ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-400'}`}
                >
                  Password
                </button>
                <button
                  type="button"
                  onClick={() => setUseOtp(true)}
                  className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${useOtp ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-400'}`}
                >
                  OTP
                </button>
              </div>

              {useOtp ? (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      className="pr-input"
                      placeholder="Enter 4-digit OTP…"
                      value={otp}
                      onChange={e => setOtp(e.target.value)}
                    />
                    {!otpSent ? (
                      <button
                        type="button"
                        onClick={sendOtp}
                        className="px-4 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-indigo-100 hover:bg-indigo-100 transition-all"
                        disabled={loading || !email}
                      >
                        Send
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => { setOtpSent(false); setOtp(''); }}
                        className="px-3 text-[9px] font-black uppercase text-gray-400 hover:text-indigo-600 transition-all"
                      >
                        Resend
                      </button>
                    )}
                  </div>
                  {otpSent && (
                    <div className="text-[10px] text-emerald-600 font-bold ml-1 flex items-center gap-1">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      OTP sent to your email!
                    </div>
                  )}
                  <button type="submit" className="pr-btn" disabled={!otp || loading}>
                    {loading ? '⟳ Verifying…' : 'Access Dashboard →'}
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <PasswordInput
                    autoComplete="current-password"
                    inputClassName="pr-input"
                    placeholder="Portal Password…"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                  <button type="submit" className="pr-btn" disabled={!password || loading}>
                    {loading ? '⟳ Authenticating…' : 'Access Dashboard →'}
                  </button>
                </div>
              )}
            </form>
          </div>

          {error && (
            <div className="pr-error">
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4m0 4h.01M21 12a9 9 a0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error === 'not_found' ? 'Invalid coupon code or inactive partner.'
                : error === 'invalid_password' ? 'Incorrect portal password.' : error}
            </div>
          )}

          <div className="pr-onboard">
            <div className="pr-onboard-glow" />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ marginBottom: 36 }}>
                <span className="pr-eyebrow" style={{ display: 'inline-flex', marginBottom: 16 }}>
                  <span className="pr-eyebrow-dot" /> Onboarding Process
                </span>
                <h2 className="pr-onboard-title">How to Become a <em>Partner?</em></h2>
                <p className="pr-onboard-sub">
                  Join India's most exclusive B2B tech distribution network. Follow these simple steps and start earning commissions on every order.
                </p>
              </div>

              <div className="pr-steps-layout">
                <div className="pr-step-card active-card">
                  <div className="pr-step-num-col">
                    <div className="pr-step-circle active">1</div>
                  </div>
                  <div className="pr-step-content">
                    <div className="pr-step-tag">Get Started</div>
                    <div className="pr-step-title">Send Us an Email</div>
                    <div className="pr-step-desc">
                      Write to us from your business email address expressing your interest in becoming a Click2Kart partner. Our team personally reviews every request.
                    </div>
                    <div className="pr-step-contact">
                      <div className="pr-contact-icon">
                        <svg width="16" height="16" fill="none" stroke="white" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <div className="pr-contact-label">Email us at</div>
                        <div className="pr-contact-value">{CONFIG.SUPPORT_EMAIL}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pr-step-card">
                  <div className="pr-step-num-col">
                    <div className="pr-step-circle">2</div>
                  </div>
                  <div className="pr-step-content">
                    <div className="pr-step-tag">Verification</div>
                    <div className="pr-step-title">Identity Verification</div>
                    <div className="pr-step-desc">
                      Our onboarding team will reach out to verify your business credentials — GST number, business PAN, and address proof. A quick, completely guided process.
                    </div>
                    <div className="pr-step-info">
                      <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: 1 }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Verification is typically completed within <strong>24–48 hours.</strong>
                    </div>
                  </div>
                </div>

                <div className="pr-step-card done-card">
                  <div className="pr-step-num-col">
                    <div className="pr-step-circle done">✓</div>
                  </div>
                  <div className="pr-step-content">
                    <div className="pr-step-tag green">You're a Partner!</div>
                    <div className="pr-step-title">Start Ordering & Earning</div>
                    <div className="pr-step-desc">
                      Your partner account is fully live. Access exclusive wholesale pricing, place bulk orders across 500+ products, and earn commission on every successful referral — all tracked on this dashboard.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
