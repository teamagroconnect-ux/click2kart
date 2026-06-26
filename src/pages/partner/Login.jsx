import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../lib/api'
import PasswordInput from '../../components/PasswordInput'
import { CONFIG } from '../../shared/lib/config'

export default function PartnerLogin() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [useOtp, setUseOtp] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [mode, setMode] = useState('login') // 'login' | 'setPassword'
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [otpLoginData, setOtpLoginData] = useState(null)

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
      setError('Please enter a valid email address')
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
    if (mode === 'login') {
      if (!validateEmail(email)) {
        setError('Please enter a valid email address')
        return
      }
      if (!password && !otp) return
      setLoading(true)
      setError(null)
      try {
        const payload = useOtp ? { otp, email } : { password, email }
        const { data } = await api.post(`/api/public/partner/login`, payload)
        if (useOtp) {
          // Instead of logging in directly, show password set prompt
          setOtpLoginData(data)
          setMode('setPassword')
        } else {
          if (data.token) {
            localStorage.setItem('partnerToken', data.token)
            localStorage.setItem('partnerData', JSON.stringify(data))
          }
          navigate('/partner/dashboard')
        }
      } catch (err) {
        setError(err?.response?.data?.error || 'Authentication failed. Please check your credentials.')
      } finally {
        setLoading(false)
      }
    } else if (mode === 'setPassword') {
      if (newPassword !== confirmNewPassword) {
        setError('Passwords do not match')
        return
      }
      if (newPassword.length < 6) {
        setError('Password must be at least 6 characters')
        return
      }
      setLoading(true)
      setError(null)
      try {
        // First log in with the OTP data
        if (otpLoginData.token) {
          localStorage.setItem('partnerToken', otpLoginData.token)
          localStorage.setItem('partnerData', JSON.stringify(otpLoginData))
        }
        // Then change the password
        await api.put('/api/public/partner/change-password', {
          currentPassword: '',
          newPassword: newPassword
        })
        navigate('/partner/dashboard')
      } catch (err) {
        setError(err?.response?.data?.error || 'Failed to set password')
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-gray-50">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-[2.5rem] shadow-xl border border-gray-100 animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Link to="/partner" className="inline-flex items-center justify-center">
              <img src="/layoutlogo.png" alt={CONFIG.BRAND_NAME} className="h-16 object-contain shadow-xl shadow-gray-200 border border-gray-100 rounded-3xl" />
            </Link>
          </div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Partner Login</h2>
          <p className="text-sm text-gray-600 font-medium">Access your partner dashboard</p>
        </div>

        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 a0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">{error}</span>
          </div>
        )}

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {mode === 'login' && (
              <>
                <div className="group">
                  <label className="text-[11px] font-black uppercase tracking-widest text-gray-500 ml-1 mb-2 block">Email Address</label>
                  <input
                    name="email"
                    type="email"
                    required
                    className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    placeholder="partner@example.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value.toLowerCase()); setError(null) }}
                  />
                </div>

                <div className="flex gap-2 p-1 bg-gray-100 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => { setUseOtp(false); setOtpSent(false) }}
                    className={`flex-1 py-3 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all ${!useOtp ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500'}`}
                  >
                    Password
                  </button>
                  <button
                    type="button"
                    onClick={() => setUseOtp(true)}
                    className={`flex-1 py-3 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all ${useOtp ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500'}`}
                  >
                    OTP
                  </button>
                </div>

                {useOtp ? (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <input
                        className="flex-1 bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                        placeholder="Enter 4-digit OTP"
                        value={otp}
                        maxLength={4}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      />
                      {!otpSent ? (
                        <button
                          type="button"
                          onClick={sendOtp}
                          className="px-5 bg-indigo-50 text-indigo-600 rounded-2xl text-[11px] font-black uppercase tracking-widest border border-indigo-100 hover:bg-indigo-100 transition-all disabled:opacity-50"
                          disabled={loading || !email}
                        >
                          Send
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => { setOtpSent(false); setOtp('') }}
                          className="px-4 text-[11px] font-black uppercase text-gray-500 hover:text-indigo-600 transition-all"
                        >
                          Resend
                        </button>
                      )}
                    </div>
                    {otpSent && (
                      <div className="text-[11px] text-emerald-600 font-bold ml-1 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M20 6L9 17l-5-5" />
                        </svg>
                        OTP sent to your email!
                      </div>
                    )}
                  </div>
                ) : (
                  <PasswordInput
                    name="password"
                    required
                    autoComplete="current-password"
                    inputClassName="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(null) }}
                  />
                )}
              </>
            )}
            {mode === 'setPassword' && (
              <>
                <div className="group">
                  <label className="text-[11px] font-black uppercase tracking-widest text-gray-500 ml-1 mb-2 block">New Password</label>
                  <PasswordInput
                    name="newPassword"
                    required
                    autoComplete="new-password"
                    inputClassName="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div className="group">
                  <label className="text-[11px] font-black uppercase tracking-widest text-gray-500 ml-1 mb-2 block">Confirm New Password</label>
                  <PasswordInput
                    name="confirmNewPassword"
                    required
                    autoComplete="new-password"
                    inputClassName="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    placeholder="••••••••"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMode('login')
                    setOtpLoginData(null)
                  }}
                  className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-gray-700"
                >
                  ← Back to Login
                </button>
              </>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || (mode === 'login' && (useOtp ? !otp : !password))}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-5 rounded-3xl text-sm font-black uppercase tracking-widest shadow-xl shadow-indigo-200 hover:shadow-indigo-300 hover:-translate-y-1 transition-all disabled:opacity-50"
          >
            {loading ? 'Processing...' : (mode === 'login' ? 'Access Dashboard →' : 'Set Password & Continue →')}
          </button>

          <div className="text-center mt-4">
            <span className="text-gray-600 font-medium text-sm">Want to become a partner?</span>
            <Link 
              to="/partner/onboarding" 
              className="text-indigo-600 font-black text-sm ml-2 hover:text-indigo-700 transition-colors"
            >
              Click here →
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
