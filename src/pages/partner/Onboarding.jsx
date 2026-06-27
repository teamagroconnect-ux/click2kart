import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { useToast } from '../../components/Toast';
import { CONFIG } from '../../shared/lib/config';
const logoImg = '/layoutlogo.png';

export default function PartnerOnboarding() {
  const { notify } = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingPin, setLoadingPin] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    pincode: '',
    state: '',
    district: '',
    password: ''
  });
  const [otp, setOtp] = useState('');

  const handlePincodeChange = async (e) => {
    const pincode = e.target.value;
    setFormData({ ...formData, pincode, state: '', district: '' });
    
    if (pincode.length === 6) {
      setLoadingPin(true);
      try {
        const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
        const data = await response.json();
        if (data[0]?.Status === 'Success') {
          const postOffice = data[0]?.PostOffice?.[0];
          if (postOffice) {
            setFormData(prev => ({
              ...prev,
              state: postOffice.State,
              district: postOffice.District
            }));
          }
        }
      } catch (err) {
        console.error('Error fetching pincode data:', err);
      } finally {
        setLoadingPin(false);
      }
    }
  };

  const handleNext = async (e) => {
    e.preventDefault();
    if (step === 1) {
      setLoading(true);
      try {
        await api.post('/api/public/partner/signup', formData);
        notify('OTP sent to your email!', 'success');
        setStep(2);
      } catch (err) {
        notify(err?.response?.data?.error || 'Something went wrong', 'error');
      } finally {
        setLoading(false);
      }
    } else if (step === 2) {
      setLoading(true);
      try {
        await api.post('/api/public/partner/verify-otp', {
          email: formData.email,
          otp
        });
        notify('Application submitted successfully!', 'success');
        setStep(3);
      } catch (err) {
        notify(err?.response?.data?.error || 'Invalid OTP', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-white py-8 md:py-12 px-4 relative overflow-hidden">
      {/* Background Decorations - matching Home/Landing */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-80 left-1/2 -translate-x-1/2 w-[1400px] h-[900px] rounded-full bg-gradient-to-br from-purple-500/20 to-transparent blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-full h-[400px] bg-gradient-to-t from-indigo-900/5 to-transparent"></div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800;900&family=DM+Sans:wght@400;500;600&display=swap');
      `}</style>
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-8 md:mb-10">
          <Link to="/partner" className="inline-flex items-center gap-2 mb-6 text-slate-600 hover:text-indigo-700 font-bold transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Partner Program
          </Link>
          <div className="flex justify-center mb-4">
            <div className="h-14 w-14 md:h-16 md:w-16 rounded-2xl md:rounded-3xl bg-white flex items-center justify-center shadow-xl border border-slate-100 p-2 overflow-hidden">
              <img src={logoImg} alt={CONFIG.BRAND_NAME} className="h-full w-auto object-contain" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 mb-4" style={{ fontFamily: 'Sora, system-ui, sans-serif' }}>
            Join Our Partner Program
          </h1>
          <p className="text-base md:text-lg text-slate-600 font-medium">Complete these steps to start earning</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
          {/* Left Column - How to Become Steps */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm sticky top-4 md:top-6">
              <h3 className="text-xl font-black text-slate-900 mb-6" style={{ fontFamily: 'Sora, system-ui, sans-serif' }}>How to Become a Partner</h3>
              <div className="space-y-6">
                <div className={`flex gap-4 ${step === 1 ? 'opacity-100' : step > 1 ? 'opacity-100' : 'opacity-50'}`}>
                  <div className={`h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl flex items-center justify-center text-white text-lg font-black flex-shrink-0 transition-all ${
                    step === 1
                      ? 'bg-gradient-to-br from-indigo-600 to-purple-600 shadow-lg shadow-indigo-200'
                      : step > 1
                        ? 'bg-emerald-500 shadow-lg shadow-emerald-200'
                        : 'bg-slate-200'
                  }`}>
                    {step > 1 ? '✓' : 1}
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900" style={{ fontFamily: 'Sora, system-ui, sans-serif' }}>Get Started</h4>
                    <p className="text-slate-600 font-medium text-sm">Fill the form with your details</p>
                  </div>
                </div>
                <div className={`flex gap-4 ${step === 2 ? 'opacity-100' : step > 2 ? 'opacity-100' : 'opacity-50'}`}>
                  <div className={`h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl flex items-center justify-center text-lg font-black flex-shrink-0 transition-all ${
                    step === 2
                      ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-200'
                      : step > 2
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200'
                        : 'bg-slate-200 text-slate-500'
                  }`}>
                    {step > 2 ? '✓' : 2}
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900" style={{ fontFamily: 'Sora, system-ui, sans-serif' }}>Verification</h4>
                    <p className="text-slate-600 font-medium text-sm">Verify your email with OTP</p>
                  </div>
                </div>
                <div className={`flex gap-4 ${step === 3 ? 'opacity-100' : 'opacity-50'}`}>
                  <div className={`h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl flex items-center justify-center text-lg font-black flex-shrink-0 transition-all ${
                    step === 3
                      ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-200'
                      : 'bg-slate-200 text-slate-500'
                  }`}>
                    {step === 3 ? '✓' : 3}
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900" style={{ fontFamily: 'Sora, system-ui, sans-serif' }}>You're a Partner!</h4>
                    <p className="text-slate-600 font-medium text-sm">Start referring and earning commissions</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100">
                <h4 className="font-black text-slate-900 mb-3" style={{ fontFamily: 'Sora, system-ui, sans-serif' }}>Benefits of Being a Partner</h4>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-slate-700 font-medium text-sm">
                    <span className="text-emerald-500">✓</span> High commission rates
                  </li>
                  <li className="flex items-center gap-2 text-slate-700 font-medium text-sm">
                    <span className="text-emerald-500">✓</span> Real-time tracking
                  </li>
                  <li className="flex items-center gap-2 text-slate-700 font-medium text-sm">
                    <span className="text-emerald-500">✓</span> Dedicated support
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Right Column - Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl md:rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-100 p-6 md:p-8 lg:p-12">
              {step === 1 ? (
                <form onSubmit={handleNext} className="space-y-6">
                  <h2 className="text-xl md:text-2xl font-black text-slate-900 mb-6" style={{ fontFamily: 'Sora, system-ui, sans-serif' }}>
                    Step 1: Your Details
                  </h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 mb-2">Full Name</label>
                      <input
                        name="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-white text-slate-800 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-slate-300"
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 mb-2">Email Address</label>
                      <input
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-white text-slate-800 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-slate-300"
                        placeholder="you@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 mb-2">Phone Number</label>
                      <input
                        name="phone"
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-white text-slate-800 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-slate-300"
                        placeholder="+91 98765 43210"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 mb-2">Pincode</label>
                      <input
                        name="pincode"
                        type="text"
                        required
                        maxLength={6}
                        value={formData.pincode}
                        onChange={handlePincodeChange}
                        className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-white text-slate-800 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-slate-300"
                        placeholder="110001"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 mb-2">State</label>
                      <input
                        name="state"
                        type="text"
                        required
                        value={formData.state}
                        onChange={handleChange}
                        className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-white text-slate-800 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-slate-300"
                        placeholder="Delhi"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 mb-2">District</label>
                      <input
                        name="district"
                        type="text"
                        required
                        value={formData.district}
                        onChange={handleChange}
                        className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-white text-slate-800 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-slate-300"
                        placeholder="Central Delhi"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 mb-2">Create Password</label>
                    <input
                      name="password"
                      type="password"
                      required
                      minLength={6}
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-white text-slate-800 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-slate-300"
                      placeholder="At least 6 characters"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 rounded-xl font-black text-sm text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 active:scale-[0.98] transition-all shadow-xl shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Sending OTP…' : 'Continue to Verify'}
                  </button>
                </form>
              ) : step === 2 ? (
                <form onSubmit={handleNext} className="space-y-8">
                  <div className="text-center">
                    <h2 className="text-xl md:text-2xl font-black text-slate-900 mb-2" style={{ fontFamily: 'Sora, system-ui, sans-serif' }}>
                      Step 2: Verify Your Email
                    </h2>
                    <p className="text-slate-600 font-medium">
                      We've sent a 4-digit verification code to <span className="font-black text-indigo-700">{formData.email}</span>
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">
                      Enter Verification Code
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={4}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      className="w-full md:w-64 mx-auto bg-slate-50 border-none rounded-xl px-5 py-5 text-4xl font-black text-center text-slate-900 tracking-[0.5em] placeholder:text-slate-300 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                      placeholder="0000"
                    />
                  </div>

                  <div className="flex flex-col gap-4 pt-4">
                    <button
                      type="submit"
                      disabled={loading || otp.length < 4}
                      className="w-full py-4 rounded-xl font-black text-sm text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 active:scale-[0.98] transition-all shadow-xl shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Verifying…' : 'Complete Application'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-sm text-slate-500 hover:text-slate-700 font-bold"
                    >
                      ← Go back
                    </button>
                  </div>
                </form>
              ) : (
                <div className="text-center py-10">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 md:w-10 md:h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-4" style={{ fontFamily: 'Sora, system-ui, sans-serif' }}>
                    Welcome to the Team! 🎉
                  </h2>
                  <p className="text-slate-600 font-medium mb-8 max-w-md mx-auto">
                    Your application has been submitted successfully. Our team will review it and activate your account soon.
                  </p>
                  <Link
                    to="/partner/login"
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-black text-sm text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 active:scale-[0.98] transition-all shadow-xl shadow-indigo-200"
                  >
                    Go to Login
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
