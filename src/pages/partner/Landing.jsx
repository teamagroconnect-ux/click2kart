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
        <div className="absolute -top-60 -left-60 w-[800px] h-[800px] bg-gradient-to-br from-indigo-400/25 to-purple-400/25 rounded-full blur-3xl" />
        <div className="absolute top-20 right-0 w-[700px] h-[700px] bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-full h-[500px] bg-gradient-to-t from-indigo-900/8 to-transparent" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-2xl border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 group">
              <img src="/layoutlogo.png" alt={CONFIG.BRAND_NAME} className="h-12 object-contain shadow-xl border border-gray-100 rounded-2xl group-hover:scale-105 transition-transform" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Partner Program</span>
            </Link>
            <div className="flex items-center gap-3">
              <Link 
                to="/"
                className="px-5 py-3 rounded-2xl text-sm font-black uppercase tracking-widest text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-all"
              >
                Home
              </Link>
              <Link 
                to="/partner/login"
                className="px-6 py-3 rounded-2xl text-sm font-black uppercase tracking-widest bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xl shadow-indigo-200 hover:shadow-2xl hover:shadow-indigo-300 hover:-translate-y-0.5 active:scale-95 transition-all"
              >
                Login
              </Link>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 pt-28 pb-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-in fade-in slide-in-from-left-8 duration-700">
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white border border-gray-200 shadow-lg shadow-gray-100">
                <div className="h-3 w-3 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 animate-pulse shadow-lg shadow-emerald-200" />
                <span className="text-[11px] font-black uppercase tracking-widest text-gray-700">
                  Become a Partner
                </span>
              </div>
              <h1 className="text-4xl md:text-7xl font-black tracking-tight text-gray-900 leading-[1.05]">
                Join Our <br />
                <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Partner Program
                </span>
              </h1>
              <p className="text-lg md:text-xl text-gray-600 font-medium leading-relaxed max-w-xl">
                Become a mediator and earn commissions by referring businesses to {CONFIG.BRAND_NAME}. Simple, transparent, and rewarding.
              </p>

              <div className="flex flex-wrap gap-4">
        <Link 
          to="/partner/onboarding"
          className="group inline-flex items-center gap-3 px-10 py-5 rounded-3xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black uppercase tracking-widest text-sm shadow-2xl shadow-indigo-500/35 hover:shadow-3xl hover:shadow-indigo-500/45 hover:-translate-y-1.5 active:scale-95 transition-all"
        >
          Join Now
          <svg className="w-6 h-6 group-hover:translate-x-1.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
        <Link 
          to="/partner/login"
          className="inline-flex items-center gap-3 px-10 py-5 rounded-3xl bg-white border-2 border-gray-200 text-gray-900 font-black uppercase tracking-widest text-sm shadow-xl shadow-gray-100 hover:bg-gray-50 hover:border-indigo-200 hover:-translate-y-1.5 active:scale-95 transition-all"
        >
          Partner Login
        </Link>
      </div>

              {/* Trust Metrics */}
              <div className="grid grid-cols-3 gap-8 pt-6">
                {[
                  { number: '500+', label: 'Active Partners' },
                  { number: '₹10Cr+', label: 'Sales Generated' },
                  { number: '4.8★', label: 'Partner Rating' }
                ].map((stat, i) => (
                  <div key={i} className="text-center p-6 rounded-3xl bg-white/80 backdrop-blur-sm border border-gray-100 shadow-lg shadow-gray-100/50">
                    <div className="text-4xl md:text-5xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">{stat.number}</div>
                    <div className="text-[11px] font-bold uppercase tracking-widest text-gray-500">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero Visual */}
            <div className="relative animate-in fade-in slide-in-from-right-8 duration-700 delay-150">
              <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-[3rem] p-8 shadow-2xl shadow-indigo-400/40">
                <div className="bg-white/95 backdrop-blur-2xl rounded-3xl p-10 border border-white/70">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="text-[11px] font-black uppercase tracking-widest text-gray-400">Monthly Earnings</div>
                      <div className="text-5xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">₹45,820</div>
                      <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-50 to-cyan-50 text-emerald-700 text-[11px] font-black border border-emerald-100">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
                        24% this month
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="text-[11px] font-black uppercase tracking-widest text-gray-400">Referred Businesses</div>
                      <div className="text-5xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">128</div>
                      <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 text-[11px] font-black border border-blue-100">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
                        34 new this week
                      </div>
                    </div>
                  </div>
                  <div className="mt-10 h-40 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-2xl flex items-end p-6 gap-3 border border-indigo-200/50">
                    {[30, 55, 40, 70, 50, 85, 60].map((h, i) => (
                      <div 
                        key={i}
                        className="flex-1 bg-gradient-to-t from-indigo-600 via-purple-600 to-pink-600 rounded-t-2xl transition-all duration-300 hover:-translate-y-2 hover:scale-105"
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
        <section className="max-w-7xl mx-auto px-6 py-24">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 mb-6">
              <svg className="w-5 h-5 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
              <span className="text-[11px] font-black uppercase tracking-widest text-purple-700">How It Works</span>
            </span>
            <h2 className="text-4xl md:text-6xl font-black text-gray-900 mb-4">
              Simple Process
            </h2>
            <p className="text-lg text-gray-600 font-medium max-w-2xl mx-auto">
              Join in just 4 simple steps and start earning today!
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { number: 1, icon: '📧', title: 'Email Us', desc: 'Send us an email to express your interest' },
              { number: 2, icon: '✅', title: 'Get Approved', desc: 'Our team will review and create your partner account' },
              { number: 3, icon: '🔑', title: 'Get Your Code', desc: 'Receive your unique referral code and coupons' },
              { number: 4, icon: '💰', title: 'Start Earning', desc: 'Refer businesses and earn commissions on every sale' }
            ].map((step, i) => (
              <div key={i} className="relative group">
                <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl p-10 border border-gray-200 shadow-xl shadow-gray-200/60 hover:shadow-2xl hover:shadow-indigo-100 hover:-translate-y-3 transition-all duration-400">
                  <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center text-4xl mb-8 group-hover:scale-110 transition-transform duration-400 shadow-lg shadow-purple-300">
                    {step.icon}
                  </div>
                  <div className="text-[12px] font-black uppercase tracking-[0.25em] text-indigo-600 mb-4">Step {step.number}</div>
                  <h3 className="text-2xl font-black text-gray-900 mb-4">{step.title}</h3>
                  <p className="text-gray-600 font-medium leading-relaxed text-lg">{step.desc}</p>
                </div>
                {i < 3 && (
                  <div className="hidden md:block absolute top-1/2 -right-5 -translate-y-1/2 text-4xl text-indigo-200 group-hover:text-indigo-400 transition-colors duration-400">
                    →
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Benefits */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-indigo-50 to-cyan-50 border border-indigo-200 mb-6">
            <svg className="w-5 h-5 text-indigo-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
            <span className="text-[11px] font-black uppercase tracking-widest text-indigo-700">Why Join Us</span>
          </span>
          <h2 className="text-4xl md:text-6xl font-black text-gray-900 mb-4">
            Top Partner Benefits
          </h2>
          <p className="text-lg md:text-xl text-gray-600 font-medium max-w-3xl mx-auto">
            Everything you need to grow your earnings and maximize success.
          </p>
        </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: '💸',
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
                icon: '🎁',
                title: 'Exclusive Coupons',
                desc: 'Get unique coupons for your referrals to boost conversions and sales.'
              },
              {
                icon: '🤝',
                title: 'Dedicated Support',
                desc: 'Your personal account manager to help you grow and succeed with us.'
              },
              {
                icon: '🏆',
                title: 'Performance Rewards',
                desc: 'Unlock bonus rewards and incentives for top-performing partners every month.'
              }
            ].map((benefit, i) => (
              <div key={i} className="group bg-gradient-to-br from-white to-gray-50 rounded-3xl p-10 border border-gray-200 shadow-xl shadow-gray-200/60 hover:shadow-2xl hover:shadow-indigo-100 hover:-translate-y-3 transition-all duration-400">
                <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 flex items-center justify-center text-4xl mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all duration-400 border border-indigo-200/60">
                  {benefit.icon}
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-4">{benefit.title}</h3>
                <p className="text-gray-600 font-medium leading-relaxed text-lg">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-6 pb-28">
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-[3rem] p-12 md:p-20 text-center text-white relative overflow-hidden shadow-2xl shadow-indigo-400/40">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,.4),transparent_45%),radial-gradient(circle_at_80%_80%,rgba(255,255,255,.4),transparent_45%)]" />
          </div>
          <div className="relative z-10">
            <h2 className="text-4xl md:text-6xl font-black mb-6">Ready to become a partner?</h2>
            <p className="text-xl md:text-2xl text-white/95 font-medium mb-10 max-w-2xl mx-auto">
              Start earning today. Apply now and our team will review your application within 24 hours!
            </p>
            <Link 
              to="/partner/onboarding"
              className="inline-flex items-center gap-4 px-12 py-6 rounded-3xl bg-white text-indigo-700 font-black uppercase tracking-[0.3em] text-base shadow-2xl shadow-white/30 hover:shadow-3xl hover:shadow-white/40 hover:-translate-y-1.5 active:scale-95 transition-all"
            >
              Apply Now
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
      </div>
    </div>
  )
}
