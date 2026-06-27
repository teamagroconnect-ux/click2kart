import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import api from '../../lib/api'
import { useToast } from '../../components/Toast'
import PasswordInput from '../../components/PasswordInput'
import { useAuth } from '../../lib/AuthContext'

export default function Signup() {
  const { notify } = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const { setAuth, refreshProfile } = useAuth()

  // Use state if available, otherwise fallback to session storage, then home
  const [from] = useState(() => {
    const stateFrom = location.state?.from
    if (stateFrom && typeof stateFrom === 'string' && !stateFrom.includes('/login') && !stateFrom.includes('/signup')) {
      sessionStorage.setItem('login_redirect', stateFrom)
      return stateFrom
    }
    return sessionStorage.getItem('login_redirect') || '/'
  })

  const [step, setStep] = useState(1) // 1: Details, 2: OTP
  const [loading, setLoading] = useState(false)
  const [validatingInviteCode, setValidatingInviteCode] = useState(false)
  const [validInviteCode, setValidInviteCode] = useState(null) // null = not validated, true/false = validated
  const [partnerName, setPartnerName] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    inviteCode: ''
  })
  const [otp, setOtp] = useState('')
  
  // Validate invite code when user types
  const validateInviteCode = async (code) => {
    if (!code.trim()) {
      setValidInviteCode(null)
      setPartnerName('')
      return
    }
    setValidatingInviteCode(true)
    try {
      const response = await api.get('/api/public/validate-invite-code', { params: { code: code.trim() } })
      setValidInviteCode(true)
      setPartnerName(response.data.partnerName)
    } catch (err) {
      setValidInviteCode(false)
      setPartnerName('')
    } finally {
      setValidatingInviteCode(false)
    }
  }

  const handleSendOTP = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/api/auth/customer/signup', formData)
      notify('OTP sent to your email', 'success')
      setStep(2)
    } catch (err) {
      const errorMsg = err?.response?.data?.error || 'Failed to send OTP'
      if (errorMsg === 'invalid_invite_code') {
        setValidInviteCode(false)
        setPartnerName('')
      }
      notify(errorMsg, 'error')
    } finally {
      setLoading(false)
    }
  }
  
  // Update validateInviteCode when formData.inviteCode changes
  const debounce = (func, delay) => {
    let timerId
    return (...args) => {
      clearTimeout(timerId)
      timerId = setTimeout(() => func.apply(this, args), delay)
    }
  }

  const debouncedValidate = React.useCallback(debounce(validateInviteCode, 500), [])
  
  const handleChange = (e) => {
    const newFormData = { ...formData, [e.target.name]: e.target.value }
    setFormData(newFormData)
    if (e.target.name === 'inviteCode') {
      debouncedValidate(e.target.value)
    }
  }

  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await api.post('/api/auth/customer/verify-otp', {
        email: formData.email,
        otp
      })
      // Wait, but in backend, we don't auto-login anymore, right? Wait let's check backend!
      // Oh, in backend verify-otp, we return { message: "application_submitted", pendingApproval: true }
      // So we should adjust frontend accordingly!
      notify('Account created successfully! Please wait for admin approval.', 'success')
      navigate('/login')
    } catch (err) {
      notify(err?.response?.data?.error || 'Invalid OTP', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-gradient-to-br from-violet-50 to-purple-50">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-[2.5rem] shadow-xl border border-violet-100 animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img src="/layoutlogo.png" alt="Click2Kart" className="h-16 object-contain shadow-xl border border-gray-100 rounded-3xl" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">
            {step === 1 ? 'Create Business Account' : 'Verify Email'}
          </h2>
          <p className="text-sm text-gray-500 font-medium">
            {step === 1 
              ? 'Join 500+ businesses sourcing high-quality tech.' 
              : `We've sent a 4-digit code to ${formData.email}`}
          </p>
        </div>

        {step === 1 ? (
          <form className="mt-8 space-y-5" onSubmit={handleSendOTP}>
            <div className="space-y-4">
              <div className="group">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1 mb-1 block">Full Name</label>
                <input
                  name="name"
                  type="text"
                  required
                  className="w-full bg-violet-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
              <div className="group">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1 mb-1 block">Email Address</label>
                <input
                  name="email"
                  type="email"
                  required
                  className="w-full bg-violet-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                  placeholder="john.doe@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              <div className="group">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1 mb-1 block">Phone Number</label>
                <input
                  name="phone"
                  type="tel"
                  required
                  className="w-full bg-violet-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                  placeholder="+91 91234 56789"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
              <div className="group">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1 mb-1 block">Create Password</label>
                <PasswordInput
                  name="password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  inputClassName="w-full bg-violet-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
              <div className="group">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1 mb-1 block">Invite Code (Optional)</label>
                <input
                  name="inviteCode"
                  type="text"
                  className={`w-full bg-violet-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-violet-500 transition-all ${validInviteCode === false ? 'ring-2 ring-red-500' : validInviteCode === true ? 'ring-2 ring-green-500' : ''}`}
                  placeholder="Partner invite code"
                  value={formData.inviteCode}
                  onChange={handleChange}
                />
                {validatingInviteCode && (
                  <div className="mt-2 text-xs text-gray-500">Checking invite code...</div>
                )}
                {validInviteCode === true && partnerName && (
                  <div className="mt-2 text-xs text-green-600 font-semibold">
                    ✓ Invited by {partnerName}
                  </div>
                )}
                {validInviteCode === false && (
                  <div className="mt-2 text-xs text-red-600 font-semibold">
                    ✗ Invalid invite code
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || (validInviteCode === false)}
              className="w-full bg-gradient-to-br from-violet-600 to-purple-600 text-white py-5 rounded-3xl text-sm font-black uppercase tracking-widest shadow-2xl shadow-violet-200 hover:from-violet-700 hover:to-purple-700 transition-all transform hover:-translate-y-1 active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Sending OTP...' : 'Send Verification Code'}
            </button>

            <p className="text-center text-xs text-gray-400 font-bold mt-6 uppercase tracking-widest">
              Already have an account?{' '}
              <Link to="/login" state={{ from }} className="text-violet-600 hover:text-violet-700">
                Login
              </Link>
            </p>
          </form>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleVerifyOTP}>
            <div className="group text-center">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 block">Enter 4-Digit OTP</label>
              <input
                type="text"
                required
                maxLength={4}
                className="w-full bg-violet-50 border-none rounded-2xl px-5 py-6 text-3xl font-black text-center text-gray-900 tracking-[0.5em] placeholder-gray-300 outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                placeholder="0000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              />
            </div>

            <button
              type="submit"
              disabled={loading || otp.length < 4}
              className="w-full bg-gradient-to-br from-violet-600 to-purple-600 text-white py-5 rounded-3xl text-sm font-black uppercase tracking-widest shadow-2xl shadow-violet-200 hover:from-violet-700 hover:to-purple-700 transition-all transform hover:-translate-y-1 active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Complete Registration'}
            </button>

            <div className="flex flex-col gap-4 text-center">
              <button 
                type="button"
                onClick={() => setStep(1)}
                className="text-xs text-gray-400 font-bold uppercase tracking-widest hover:text-gray-600"
              >
                Change Details
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
