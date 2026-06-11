import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import React, { useEffect, useState } from 'react'
import { useCart } from '../lib/CartContext'
import { CONFIG } from '../shared/lib/config.js'
import logoImg from '../click2kart.png'

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function UserLayout() {
  const location = useLocation()
  const { cartCount } = useCart()
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  const bottomNavItems = [
    { to: '/', l: 'Home', i: (<path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />) },
    { to: '/products', l: 'Browse', i: (<path d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />) },
    { to: '/orders', l: 'Orders', i: (<path d="M5 3h14a2 2 0 012 2v2H3V5a2 2 0 012-2zm16 6H3v8a2 2 0 002 2h14a2 2 0 002-2V9z" />) },
    { to: user ? '/profile' : '/login', state: user ? undefined : { from: location.pathname + location.search }, l: 'Profile', i: (<path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />) }
  ]

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.reload()
  }

  useEffect(() => {}, [location.pathname])

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/95 backdrop-blur-xl shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-14 sm:h-14 md:h-16 gap-4">
            <Link to="/" className="flex items-center group">
              <div className="relative h-10 w-10 sm:h-12 sm:w-12 md:h-13 md:w-13 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-[1px] shadow-lg shadow-indigo-100 transition-all duration-300">
                <div className="absolute inset-0 rounded-full overflow-hidden">
                  <img
                    src={logoImg}
                    alt="Click2Kart"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
              <div className="flex flex-col ml-2 md:ml-2.5">
                <span className="text-lg sm:text-xl md:text-2xl font-black tracking-tighter text-gray-900 leading-none">
                  CLICK2<span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">KART</span>
                </span>
                <div className="mt-0.5 flex items-center gap-1">
                  <span className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-[7px] sm:text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">
                    B2B Marketplace
                  </span>
                </div>
              </div>
            </Link>

            <nav className="hidden lg:flex items-center gap-3">
              {[
                { to: '/', label: 'Dashboard' },
                { to: '/products', label: 'Catalogue' },
                { to: '/orders', label: 'Orders' },
                { to: '/partner', label: 'Partners' }
              ].map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    classNames(
                      'px-5 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-[0.15em] transition-all duration-300',
                      isActive
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-100 scale-105'
                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                    )
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>

            <div className="flex items-center gap-4">
              <Link
                to="/cart"
                className="group relative h-11 w-11 md:h-12 md:w-12 flex items-center justify-center rounded-2xl bg-gray-50 border border-gray-100 hover:bg-white hover:shadow-xl transition-all active:scale-95"
              >
                <svg className="w-5 h-5 md:w-6 md:h-6 text-gray-700 group-hover:text-indigo-600 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M7 6h13l-1.2 7H9.2L7 6Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="10" cy="19" r="1.5" fill="currentColor" />
                  <circle cx="17" cy="19" r="1.5" fill="currentColor" />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 h-5 w-5 flex items-center justify-center text-[10px] font-black text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg shadow-md border-2 border-white">
                    {cartCount}
                  </span>
                )}
              </Link>
              <div className="hidden sm:flex items-center gap-3">
                {user ? (
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end">
                      <Link to="/profile" className="inline-flex flex-col items-end gap-0.5 px-4 py-2.5 rounded-2xl border border-gray-200 bg-white shadow-lg shadow-gray-100 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-100 transition-all cursor-pointer">
                        <div className="inline-flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-200"></span>
                          <span className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-900">{user.name}</span>
                        </div>
                        <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-gray-500 leading-none">BUSINESS ACCOUNT</span>
                      </Link>
                    </div>
                    <button
                      type="button"
                      onClick={handleLogout}
                      title="Sign out"
                      aria-label="Sign out"
                      className="h-14 w-14 inline-flex items-center justify-center rounded-3xl border border-gray-100 bg-white text-gray-400 shadow-lg shadow-gray-100 transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-600 hover:shadow-xl hover:shadow-red-100 active:scale-95"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <>
                    <Link
                      to="/login"
                      state={{ from: location.pathname + location.search }}
                      className="px-7 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                    >
                      Login
                    </Link>
                    <Link
                      to="/signup"
                      state={{ from: location.pathname + location.search }}
                      className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-200 hover:from-indigo-700 hover:to-purple-700 transition-all active:scale-95"
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 min-h-0 pb-20 lg:pb-0 animate-in fade-in duration-700">
        {user && user.isKycComplete === false && (
          <div className="max-w-7xl mx-auto px-6 md:px-10 mt-4">
            <div className="rounded-2xl border border-amber-200 bg-amber-50 text-amber-800 px-4 py-3 text-[12px] font-bold flex items-center justify-between">
              <div>Complete your KYC to place orders.</div>
              <Link to="/profile" className="px-3 py-1.5 rounded-lg bg-amber-600 text-white text-[10px] uppercase tracking-widest">Update KYC</Link>
            </div>
          </div>
        )}
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-6 inset-x-6 z-40">
        <div className="max-w-md mx-auto h-16 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-violet-100 flex items-center justify-around px-4">
          {bottomNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              state={item.state}
              className={({ isActive }) =>
                classNames(
                  'flex flex-col items-center justify-center gap-1 transition-all',
                  isActive ? 'text-violet-600 scale-110' : 'text-gray-600 hover:text-violet-600'
                )
              }
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                {item.i}
              </svg>
              <span className="text-[9px] font-black uppercase tracking-widest">{item.l}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      <footer className="border-t border-gray-50 bg-white py-12 pb-32 lg:pb-12">
        <div className="max-w-7xl mx-auto px-6 md:px-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <img src={logoImg} alt="Click2Kart" className="h-10 w-auto rounded-xl border border-gray-100 shadow-sm" />
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">© {new Date().getFullYear()} Click2Kart B2B</span>
            <div className="flex gap-4 items-center">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Store Status: Online</span>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
            <a 
              href={`mailto:${CONFIG.SUPPORT_EMAIL}`} 
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 border border-gray-100 text-[10px] font-black uppercase tracking-widest text-gray-700 hover:bg-white transition-all"
            >
              <span>Support</span>
              <span className="text-violet-600">{CONFIG.SUPPORT_EMAIL}</span>
            </a>
            <div className="hidden md:block h-8 w-[1px] bg-gray-100"></div>
            <div className="flex gap-6 md:gap-8">
              <Link to="/privacy-policy" className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-900 transition-colors">Privacy Policy</Link>
              <Link to="/terms-of-service" className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-900 transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
