import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../lib/api'
import { useToast } from '../../components/Toast'

export default function PartnerOnboarding() {
  const { notify } = useToast()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    businessName: '',
    gstNumber: '',
    panNumber: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    bloodGroup: '',
    password: ''
  })
  const [otp, setOtp] = useState('')

  const handleNext = async (e) => {
    e.preventDefault()
    if (step === 1) {
      setLoading(true)
      try {
        await api.post('/api/public/partner/signup', formData)
        notify('OTP sent to your email!', 'success')
        setStep(2)
      } catch (err) {
        notify(err?.response?.data?.error || 'Something went wrong', 'error')
      } finally {
        setLoading(false)
      }
    } else if (step === 2) {
      setLoading(true)
      try {
        await api.post('/api/public/partner/verify-otp', {
          email: formData.email,
          otp
        })
        notify('Application submitted successfully!', 'success')
        navigate('/partner/login')
      } catch (err) {
        notify(err?.response?.data?.error || 'Invalid OTP', 'error')
      } finally {
        setLoading(false)
      }
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-indigo-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Link to="/partner" className="inline-flex items-center gap-2 mb-6 text-gray-600 hover:text-indigo-700 font-bold transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Partner Program
          </Link>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
            Partner Onboarding
          </h1>
          <p className="text-lg text-gray-600 font-medium">
            Complete these steps to join our partner program
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-12">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`h-12 w-12 rounded-2xl flex items-center justify-center font-black text-lg transition-all duration-300 ${
                step === s 
                  ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-200 scale-110' 
                  : step > s 
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200'
                    : 'bg-gray-100 text-gray-400'
              }`}>
                {step > s ? '✓' : s}
              </div>
              {s < 2 && (
                <div className={`h-1 w-16 rounded-full transition-all duration-300 ${
                  step > s ? 'bg-emerald-500' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Form */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-gray-100 p-8 md:p-12">
          {step === 1 ? (
            <form onSubmit={handleNext} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="text-[11px] font-black uppercase tracking-widest text-gray-500 ml-1 mb-2 block">
                    Full Name
                  </label>
                  <input
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-black uppercase tracking-widest text-gray-500 ml-1 mb-2 block">
                    Email Address
                  </label>
                  <input
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    placeholder="john@business.com"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-black uppercase tracking-widest text-gray-500 ml-1 mb-2 block">
                    Phone Number
                  </label>
                  <input
                    name="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-black uppercase tracking-widest text-gray-500 ml-1 mb-2 block">
                    Blood Group
                  </label>
                  <select
                    name="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={handleChange}
                    className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  >
                    <option value="">Select Blood Group</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <h3 className="text-lg font-black text-gray-900 mb-6">Business Details</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[11px] font-black uppercase tracking-widest text-gray-500 ml-1 mb-2 block">
                      Business Name
                    </label>
                    <input
                      name="businessName"
                      type="text"
                      required
                      value={formData.businessName}
                      onChange={handleChange}
                      className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                      placeholder="Your Business Name"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-black uppercase tracking-widest text-gray-500 ml-1 mb-2 block">
                      GST Number
                    </label>
                    <input
                      name="gstNumber"
                      type="text"
                      required
                      value={formData.gstNumber}
                      onChange={handleChange}
                      className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                      placeholder="27AAECF1234D1Z5"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-black uppercase tracking-widest text-gray-500 ml-1 mb-2 block">
                      PAN Number
                    </label>
                    <input
                      name="panNumber"
                      type="text"
                      required
                      value={formData.panNumber}
                      onChange={handleChange}
                      className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                      placeholder="ABCDE1234F"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-black uppercase tracking-widest text-gray-500 ml-1 mb-2 block">
                      Create Password
                    </label>
                    <input
                      name="password"
                      type="password"
                      required
                      minLength={6}
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <h3 className="text-lg font-black text-gray-900 mb-6">Address</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-[11px] font-black uppercase tracking-widest text-gray-500 ml-1 mb-2 block">
                      Street Address
                    </label>
                    <input
                      name="address"
                      type="text"
                      required
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                      placeholder="123 Business Street"
                    />
                  </div>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <label className="text-[11px] font-black uppercase tracking-widest text-gray-500 ml-1 mb-2 block">
                        City
                      </label>
                      <input
                        name="city"
                        type="text"
                        required
                        value={formData.city}
                        onChange={handleChange}
                        className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                        placeholder="Mumbai"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-black uppercase tracking-widest text-gray-500 ml-1 mb-2 block">
                        State
                      </label>
                      <input
                        name="state"
                        type="text"
                        required
                        value={formData.state}
                        onChange={handleChange}
                        className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                        placeholder="Maharashtra"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-black uppercase tracking-widest text-gray-500 ml-1 mb-2 block">
                        Pincode
                      </label>
                      <input
                        name="pincode"
                        type="text"
                        required
                        value={formData.pincode}
                        onChange={handleChange}
                        className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                        placeholder="400001"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-5 rounded-3xl text-sm font-black uppercase tracking-widest shadow-2xl shadow-indigo-200 hover:shadow-indigo-300 hover:-translate-y-1 transition-all disabled:opacity-50 mt-8"
              >
                {loading ? 'Sending OTP...' : 'Continue to Verify'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleNext} className="space-y-8">
              <div className="text-center">
                <h3 className="text-2xl font-black text-gray-900 mb-2">Verify your email</h3>
                <p className="text-gray-600 font-medium">
                  We've sent a 4-digit verification code to <span className="font-black text-indigo-700">{formData.email}</span>
                </p>
              </div>
              
              <div className="text-center">
                <label className="text-[11px] font-black uppercase tracking-widest text-gray-500 mb-6 block">
                  Enter Verification Code
                </label>
                <input
                  type="text"
                  required
                  maxLength={4}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="w-full md:w-64 bg-gray-50 border-none rounded-2xl px-5 py-6 text-4xl font-black text-center text-gray-900 tracking-[0.5em] placeholder-gray-300 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  placeholder="0000"
                />
              </div>

              <div className="flex flex-col gap-4 pt-4">
                <button
                  type="submit"
                  disabled={loading || otp.length < 4}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-5 rounded-3xl text-sm font-black uppercase tracking-widest shadow-2xl shadow-indigo-200 hover:shadow-indigo-300 hover:-translate-y-1 transition-all disabled:opacity-50"
                >
                  {loading ? 'Verifying...' : 'Complete Application'}
                </button>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-sm text-gray-500 hover:text-gray-700 font-bold"
                >
                  ← Go back
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
