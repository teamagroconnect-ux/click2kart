import React from 'react'
import { Link } from 'react-router-dom'
import { CONFIG } from '../../shared/lib/config'

export default function PartnerLanding() {
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
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                <span className="text-white font-black text-lg">C2K</span>
              </div>
              <div>
                <div className="text-lg font-black tracking-tight text-gray-900">{CONFIG.BRAND_NAME}</div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Partner Program</div>
              </div>
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
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-in fade-in slide-in-from-left-8 duration-700">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 shadow-sm">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] font-black uppercase tracking-widest text-gray-600">
                  Become a Click2Kart Partner
                </span>
              </div>
              <h1 className="text-5xl md:text-7xl font-black tracking-tight text-gray-900 leading-[1.1]">
                Build your <br />
                <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  business empire
                </span>
              </h1>
              <p className="text-lg text-gray-600 font-medium leading-relaxed max-w-lg">
                Join India's fastest-growing B2B tech platform. Earn generous commissions on every referral, access exclusive pricing, and grow your business with us.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link 
                  to="/partner/onboarding"
                  className="group inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black uppercase tracking-widest text-sm shadow-2xl shadow-indigo-500/30 hover:shadow-indigo-500/40 hover:-translate-y-1 transition-all"
                >
                  Start Your Journey
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
                      <div className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Referrals</div>
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
                {/* Floating Cards */}
                <div className="absolute -top-8 -left-8 bg-white rounded-2xl p-4 shadow-2xl border border-gray-100 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-xl">
                    🎉
                  </div>
                  <div>
                    <div className="text-sm font-black text-gray-900">New Partner</div>
                    <div className="text-[11px] text-gray-500 font-bold">Welcome to the team!</div>
                  </div>
                </div>
                <div className="absolute -bottom-6 -right-6 bg-white rounded-2xl p-4 shadow-2xl border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-3">
                      {[1,2,3].map(i => (
                        <div key={i} className="h-10 w-10 rounded-full border-2 border-white bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-sm font-black text-gray-600">
                          {String.fromCharCode(64 + i)}
                        </div>
                      ))}
                    </div>
                    <div className="text-sm font-black text-gray-900">
                      You're in the top 10%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 mb-4">
              <span className="text-[11px] font-black uppercase tracking-widest text-indigo-700">Why Join Us</span>
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              Premium partner benefits
            </h2>
            <p className="text-lg text-gray-600 font-medium max-w-2xl mx-auto">
              Everything you need to scale your business and maximize your earnings.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: '💰',
                title: 'High Commissions',
                description: 'Earn competitive commission rates on every referral. Higher volume = higher earnings.'
              },
              {
                icon: '⚡',
                title: 'Instant Payouts',
                description: 'Get paid quickly with our automated payout system. No waiting for weeks.'
              },
              {
                icon: '🎯',
                title: 'Exclusive Pricing',
                description: 'Access special partner-only pricing on all products for your referrals.'
              },
              {
                icon: '📊',
                title: 'Real-time Analytics',
                description: 'Track your referrals, earnings, and performance with beautiful dashboards.'
              },
              {
                icon: '🎨',
                title: 'Marketing Tools',
                description: 'Get access to banners, links, and materials to promote Click2Kart effectively.'
              },
              {
                icon: '🤝',
                title: 'Dedicated Support',
                description: 'Your personal account manager to help you grow and succeed.'
              }
            ].map((benefit, i) => (
              <div key={i} className="group bg-white rounded-3xl p-8 border border-gray-100 shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:-translate-y-2 transition-all">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-3">{benefit.title}</h3>
                <p className="text-gray-600 font-medium leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How it Works */}
        <section className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 border border-purple-100 mb-4">
              <span className="text-[11px] font-black uppercase tracking-widest text-purple-700">Simple Process</span>
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              How it works
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { number: 1, title: 'Sign Up', desc: 'Fill the form and complete verification' },
              { number: 2, title: 'Get Link', desc: 'Receive your unique referral link' },
              { number: 3, title: 'Share', desc: 'Promote Click2Kart with your network' },
              { number: 4, title: 'Earn', desc: 'Get paid for every successful referral' }
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

        {/* CTA Section */}
        <section className="max-w-7xl mx-auto px-6 pb-24">
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-[3rem] p-12 md:p-16 text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.3),transparent_40%),radial-gradient(circle_at_80%_80%,rgba(255,255,255,0.3),transparent_40%)]" />
            </div>
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-black mb-4">Ready to become a partner?</h2>
              <p className="text-lg text-white/90 font-medium mb-8 max-w-2xl mx-auto">
                Start earning today. Join thousands of successful partners growing their business with Click2Kart.
              </p>
              <Link 
                to="/partner/onboarding"
                className="inline-flex items-center gap-3 px-10 py-5 rounded-2xl bg-white text-indigo-700 font-black uppercase tracking-widest text-sm shadow-2xl hover:shadow-3xl hover:-translate-y-1 transition-all"
              >
                Get Started Now
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
