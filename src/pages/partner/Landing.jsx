import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CONFIG } from '../../shared/lib/config';

export default function PartnerLanding() {
  const navigate = useNavigate();
  useEffect(() => {
    const token = localStorage.getItem('partnerToken');
    if (token) {
      navigate('/partner/dashboard', { replace: true });
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-white relative overflow-hidden font-sans">
      {/* Background Decorations - matching Home page style */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-80 left-1/2 -translate-x-1/2 w-[1400px] h-[900px] rounded-full bg-gradient-to-br from-purple-500/20 to-transparent blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-full h-[400px] bg-gradient-to-t from-indigo-900/5 to-transparent"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-xl border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 group">
              <img
                src="/layoutlogo.png"
                alt={CONFIG.BRAND_NAME}
                className="h-10 sm:h-12 w-auto object-contain shadow-xl border border-gray-100 rounded-2xl group-hover:scale-105 transition-transform duration-300"
              />
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hidden sm:block">
                Partner Program
              </span>
            </Link>
            <div className="flex items-center gap-3">
              <Link
                to="/"
                className="px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl text-sm font-black uppercase tracking-widest text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-all duration-300"
              >
                Home
              </Link>
              <Link
                to="/partner/login"
                className="px-5 sm:px-6 py-2.5 sm:py-3 rounded-2xl text-sm font-black uppercase tracking-widest bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xl shadow-indigo-200 hover:shadow-2xl hover:shadow-indigo-300 hover:-translate-y-0.5 active:scale-95 transition-all duration-300"
              >
                Login
              </Link>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-12 sm:pb-20">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div className="space-y-8 animate-in fade-in slide-in-from-left-8 duration-700">
              <div className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-white border border-gray-200 shadow-lg shadow-gray-100">
                <div className="h-2 w-2 sm:h-3 sm:w-3 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 animate-pulse shadow-lg shadow-indigo-300"></div>
                <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-gray-700">
                  Become a Partner
                </span>
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-gray-900 leading-[1.05]">
                Join Our
                <br />
                <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Partner Program
                </span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-gray-600 font-medium leading-relaxed max-w-xl mx-auto lg:mx-0">
                Become a mediator and earn commissions by referring businesses to {CONFIG.BRAND_NAME}. Simple, transparent, and rewarding.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 sm:gap-4">
                <Link
                  to="/partner/onboarding"
                  className="group inline-flex items-center justify-center gap-3 px-8 sm:px-10 py-4 sm:py-5 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-black uppercase tracking-widest text-xs sm:text-sm shadow-2xl shadow-indigo-300 hover:shadow-3xl hover:shadow-indigo-400 hover:-translate-y-1.5 active:scale-95 transition-all duration-300"
                >
                  Join Now
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1.5 transition-transform duration-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </Link>
                <Link
                  to="/partner/login"
                  className="inline-flex items-center justify-center gap-3 px-8 sm:px-10 py-4 sm:py-5 rounded-2xl sm:rounded-3xl bg-white border-2 border-gray-200 text-gray-900 font-black uppercase tracking-widest text-xs sm:text-sm shadow-xl shadow-gray-100 hover:bg-gray-50 hover:border-indigo-200 hover:-translate-y-1.5 active:scale-95 transition-all duration-300"
                >
                  Partner Login
                </Link>
              </div>

              {/* Trust Metrics */}
              <div className="grid grid-cols-3 gap-4 sm:gap-8 pt-4 sm:pt-6">
                {[
                  { number: '500+', label: 'Active Partners' },
                  { number: '₹10Cr+', label: 'Sales Generated' },
                  { number: '4.8★', label: 'Partner Rating' },
                ].map((stat, i) => (
                  <div
                    key={i}
                    className="text-center p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white/80 backdrop-blur-sm border border-gray-100 shadow-lg shadow-gray-100/50"
                  >
                    <div className="text-2xl sm:text-3xl md:text-4xl md:text-5xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                      {stat.number}
                    </div>
                    <div className="text-[9px] sm:text-[10px] md:text-[11px] font-bold uppercase tracking-widest text-gray-500">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero Visual */}
            <div className="relative animate-in fade-in slide-in-from-right-8 duration-700 delay-150">
              <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl sm:rounded-[3rem] p-6 sm:p-8 shadow-2xl shadow-indigo-400/40 overflow-hidden">
                <div className="bg-white/95 backdrop-blur-2xl rounded-2xl sm:rounded-3xl p-6 sm:p-10 border border-white/70">
                  <div className="grid grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-3">
                      <div className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-gray-400">
                        Monthly Earnings
                      </div>
                      <div className="text-3xl sm:text-4xl md:text-5xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        ₹45,820
                      </div>
                      <div className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-gradient-to-r from-emerald-50 to-cyan-50 text-emerald-700 text-[10px] sm:text-[11px] font-black border border-emerald-100">
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                          />
                        </svg>
                        24% this month
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-gray-400">
                        Referred Businesses
                      </div>
                      <div className="text-3xl sm:text-4xl md:text-5xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        128
                      </div>
                      <div className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 text-[10px] sm:text-[11px] font-black border border-blue-100">
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                        34 new this week
                      </div>
                    </div>
                  </div>
                  <div className="mt-8 sm:mt-10 h-32 sm:h-40 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-xl sm:rounded-2xl flex items-end p-4 sm:p-6 gap-2 sm:gap-3 border border-indigo-200/50">
                    {[30, 55, 40, 70, 50, 85, 60].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-gradient-to-t from-indigo-600 via-purple-600 to-pink-600 rounded-t-xl sm:rounded-t-2xl transition-all duration-300 hover:-translate-y-2 hover:scale-105"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="text-center mb-12 sm:mb-16">
            <span className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 mb-6">
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 text-purple-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-purple-700">
                How It Works
              </span>
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-4">
              Simple Process
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 font-medium max-w-2xl mx-auto">
              Join in just 4 simple steps and start earning today!
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {[
              {
                number: 1,
                icon: '📧',
                title: 'Sign Up',
                desc: 'Register on our partner platform and tell us about yourself',
              },
              {
                number: 2,
                icon: '✅',
                title: 'Get Verified',
                desc: 'Our team will review and approve your partner account quickly',
              },
              {
                number: 3,
                icon: '🔑',
                title: 'Get Your Code',
                desc: 'Receive your unique referral code and exclusive coupons',
              },
              {
                number: 4,
                icon: '💰',
                title: 'Start Earning',
                desc: 'Refer retailers/businesses and earn commissions on every sale',
              },
            ].map((step, i) => (
              <div key={i} className="relative group">
                <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl sm:rounded-3xl p-6 sm:p-10 border border-gray-200 shadow-xl shadow-gray-200/60 hover:shadow-2xl hover:shadow-indigo-100 hover:-translate-y-3 transition-all duration-400 h-full">
                  <div className="h-12 w-12 sm:h-16 sm:w-16 md:h-20 md:w-20 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center text-2xl sm:text-4xl mb-6 group-hover:scale-110 transition-transform duration-400 shadow-lg shadow-purple-300">
                    {step.icon}
                  </div>
                  <div className="text-[10px] sm:text-[11px] md:text-[12px] font-black uppercase tracking-[0.25em] text-indigo-600 mb-4">
                    Step {step.number}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-4">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 font-medium leading-relaxed text-base sm:text-lg">
                    {step.desc}
                  </p>
                </div>
                {i < 3 && (
                  <div className="hidden lg:block absolute top-1/2 -right-5 -translate-y-1/2 text-4xl text-indigo-200 group-hover:text-indigo-400 transition-colors duration-400">
                    →
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Benefits Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="text-center mb-12 sm:mb-16">
            <span className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-gradient-to-r from-indigo-50 to-cyan-50 border border-indigo-200 mb-6">
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
              <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-indigo-700">
                Why Join Us
              </span>
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-4">
              Top Partner Benefits
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 font-medium max-w-3xl mx-auto">
              Everything you need to grow your earnings and maximize success.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                icon: '💸',
                title: 'High Commissions',
                desc: 'Earn competitive commission rates on every referral. Higher volume = higher earnings.',
              },
              {
                icon: '⚡',
                title: 'Instant Payouts',
                desc: 'Get paid quickly with our automated payout system. No waiting for weeks.',
              },
              {
                icon: '📊',
                title: 'Real-time Analytics',
                desc: 'Track your referrals, earnings, and performance with beautiful dashboards.',
              },
              {
                icon: '🎁',
                title: 'Exclusive Coupons',
                desc: 'Get unique coupons for your referrals to boost conversions and sales.',
              },
              {
                icon: '🤝',
                title: 'Dedicated Support',
                desc: 'Your personal account manager to help you grow and succeed with us.',
              },
              {
                icon: '🏆',
                title: 'Performance Rewards',
                desc: 'Unlock bonus rewards and incentives for top-performing partners every month.',
              },
            ].map((benefit, i) => (
              <div
                key={i}
                className="group bg-gradient-to-br from-white to-gray-50 rounded-2xl sm:rounded-3xl p-6 sm:p-10 border border-gray-200 shadow-xl shadow-gray-200/60 hover:shadow-2xl hover:shadow-indigo-100 hover:-translate-y-3 transition-all duration-400 h-full"
              >
                <div className="h-12 w-12 sm:h-16 sm:w-16 md:h-20 md:w-20 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 flex items-center justify-center text-2xl sm:text-4xl mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-400 border border-indigo-200/60">
                  {benefit.icon}
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-4">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 font-medium leading-relaxed text-base sm:text-lg">
                  {benefit.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16 sm:pb-24 md:pb-28">
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl sm:rounded-[3rem] p-8 sm:p-12 md:p-16 lg:p-20 text-center text-white relative overflow-hidden shadow-2xl shadow-indigo-400/40">
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,.3),transparent_45%),radial-gradient(circle_at_80%_80%,rgba(255,255,255,.3),transparent_45%)]"></div>
            </div>
            <div className="relative z-10">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black mb-4 sm:mb-6">
                Ready to become a partner?
              </h2>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/95 font-medium mb-6 sm:mb-10 max-w-2xl mx-auto">
                Start earning today. Apply now and our team will review your application within 24 hours!
              </p>
              <Link
                to="/partner/onboarding"
                className="inline-flex items-center justify-center gap-3 px-8 sm:px-10 md:px-12 py-4 sm:py-5 md:py-6 rounded-2xl sm:rounded-3xl bg-white text-indigo-700 font-black uppercase tracking-[0.25em] text-xs sm:text-sm md:text-base shadow-2xl shadow-white/30 hover:shadow-3xl hover:shadow-white/40 hover:-translate-y-1.5 active:scale-95 transition-all duration-300"
              >
                Apply Now
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
