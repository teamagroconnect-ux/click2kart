import React, { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CONFIG } from '../../shared/lib/config'

export default function PartnerLanding() {
  const navigate = useNavigate()
  useEffect(() => {
    const token = localStorage.getItem('partnerToken')
    if (token) {
      navigate('/partner/dashboard', { replace: true })
    }
  }, [navigate])
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-indigo-50/50 font-sans">
      {/* Background Decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full blur-3xl" />
        <div className="absolute top-40 right-0 w-[500px] h-[500px] bg-gradient-to-br from-purple-400/15 to-pink-400/15 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-full h-[400px] bg-gradient-to-t from-indigo-900/5 to-transparent" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <img src="/layoutlogo.png" alt={CONFIG.BRAND_NAME} className="h-12 object-contain shadow-xl border border-gray-100 rounded-2xl" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Partner Program</span>
            </Link>
            <div className="flex items-center gap-3">
              <Link 
                to="/"
                className="px-5 py-3 rounded-xl text-sm font-black uppercase tracking-widest text-gray-500 hover:text-gray-900 transition-all"
              >
                Home
              </Link>
              <Link 
                to="/partner/login"
                className="px-6 py-3 rounded-xl text-sm font-black uppercase tracking-widest bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-200 hover:shadow-xl hover:-translate-y-0.5 transition-all"
              >
                Login
              </Link>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 pt-24 pb-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-in fade-in slide-in-from-left-8 duration-700">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 shadow-sm">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] font-black uppercase tracking-widest text-gray-600">
                  Become a Partner
                </span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight text-gray-900 leading-[1.1]">
                Join Our <br />
                <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Partner Program
                </span>
              </h1>
              <p className="text-lg text-gray-600 font-medium leading-relaxed max-w-lg">
                Become a mediator and earn commissions by referring businesses to {CONFIG.BRAND_NAME}. Simple, transparent, and rewarding.
              </p>

              <div className="flex flex-wrap gap-4">
        <Link 
          to="/partner/onboarding"
          className="group inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black uppercase tracking-widest text-sm shadow-2xl shadow-indigo-500/30 hover:shadow-indigo-500/40 hover:-translate-y-1 transition-all"
        >
          Join Now
          <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
        <Link 
          to="/partner/login"
          className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-white border border-gray-200 text-gray-900 font-black uppercase tracking-widest text-sm shadow-xl hover:bg-gray-50 hover:-translate-y-1 transition-all"
        >
          Partner Login
        </Link>
      </div>

              {/* Trust Metrics */}
              <div className="grid grid-cols-3 gap-6 pt-4">
                {[
                  { number: '500+', label: 'Active Partners' },
                  { number: '₹10Cr+', label: 'Sales Generated' },
                  { number: '4.8★', label: 'Partner Rating' }
                ].map((stat, i) => (
                  <div key={i} className="text-center">
                    <div className="text-3xl font-black text-gray-900 mb-1">{stat.number}</div>
                    <div className="text-[11px] font-bold uppercase tracking-widest text-gray-400">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero Visual */}
            <div className="relative animate-in fade-in slide-in-from-right-8 duration-700 delay-150">
              <div className="relative bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[3rem] p-8 shadow-2xl shadow-indigo-400/30">
                <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-8 border border-white/50">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Monthly Earnings</div>
                      <div className="text-4xl font-black text-gray-900">₹45,820</div>
                      <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold">
                        ↑ 24% this month
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Referred Businesses</div>
                      <div className="text-4xl font-black text-gray-900">128</div>
                      <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold">
                        34 new this week
                      </div>
                    </div>
                  </div>
                  <div className="mt-8 h-32 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-xl flex items-end p-4 gap-2">
                    {[30, 55, 40, 70, 50, 85, 60].map((h, i) => (
                      <div 
                        key={i}
                        className="flex-1 bg-gradient-to-t from-indigo-600 to-purple-500 rounded-t-lg transition-all hover:-translate-y-1"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 border border-purple-100 mb-4">
              <span className="text-[11px] font-black uppercase tracking-widest text-purple-700">How It Works</span>
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-4">
              Simple Process
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { number: 1, title: 'Email Us', desc: 'Send us an email to express your interest' },
              { number: 2, title: 'Get Approved', desc: 'Our team will review and create your partner account' },
              { number: 3, title: 'Get Your Code', desc: 'Receive your unique referral code and coupons' },
              { number: 4, title: 'Start Earning', desc: 'Refer businesses and earn commissions on every sale' }
            ].map((step, i) => (
              <div key={i} className="relative">
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-3xl p-8 border border-gray-100 shadow-xl">
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white text-2xl font-black mb-6">
                    {step.number}
                  </div>
                  <h3 className="text-xl font-black text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600 font-medium">{step.desc}</p>
                </div>
                {i < 3 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 -translate-y-1/2 text-2xl text-gray-300">
                    →
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Benefits */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 mb-4">
            <span className="text-[11px] font-black uppercase tracking-widest text-indigo-700">Why Join Us</span>
          </span>
          <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-4">
            Top Partner Benefits
          </h2>
          <p className="text-lg text-gray-600 font-medium max-w-2xl mx-auto">
            Everything you need to grow your earnings and maximize success.
          </p>
        </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: '💰',
                title: 'High Commissions',
                desc: 'Earn competitive commission rates on every referral. Higher volume = higher earnings.'
              },
              {
                icon: '⚡',
                title: 'Instant Payouts',
                desc: 'Get paid quickly with our automated payout system. No waiting for weeks.'
              },
              {
                icon: '📊',
                title: 'Real-time Analytics',
                desc: 'Track your referrals, earnings, and performance with beautiful dashboards.'
              },
              {
                icon: '🎟️',
                title: 'Exclusive Coupons',
                desc: 'Get unique coupons for your referrals to boost conversions.'
              },
              {
                icon: '🤝',
                title: 'Dedicated Support',
                desc: 'Your personal account manager to help you grow and succeed.'
              },
              {
                icon: '🏆',
                title: 'Performance Rewards',
                desc: 'Unlock bonus rewards and incentives for top-performing partners.'
              }
            ].map((benefit, i) => (
              <div key={i} className="group bg-white rounded-3xl p-8 border border-gray-100 shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:-translate-y-2 transition-all">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-3">{benefit.title}</h3>
                <p className="text-gray-600 font-medium leading-relaxed">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-[3rem] p-12 md:p-16 text-center text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,.3),transparent_40%),radial-gradient(circle_at_80%_80%,rgba(255,255,255,.3),transparent_40%)]">

            </div>
          </div>
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-black mb-4">Ready to become a partner?</h2>
            <p className="text-lg text-white/90 font-medium mb-8 max-w-2xl mx-auto">
              Start earning today. Apply now and our team will review your application.
            </p>
            <Link 
              to="/partner/onboarding"
              className="inline-flex items-center gap-3 px-10 py-5 rounded-2xl bg-white text-indigo-700 font-black uppercase tracking-widest text-sm shadow-2xl hover:shadow-3xl hover:-translate-y-1 transition-all"
            >
              Apply Now
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
      </div>
    </div>
  )
}
