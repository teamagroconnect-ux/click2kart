import React, { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { CONFIG } from '../shared/lib/config.js'
import logoImg from '../click2kart.png'

const Icon = ({ name }) => (
  <span className="inline-flex items-center justify-center w-6 h-6 mr-3 flex-shrink-0">
    {name === 'dash' && (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
      </svg>
    )}
    {name === 'earnings' && (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 1v22" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        <path d="M16 15l-4 4-4-4" />
      </svg>
    )}
    {name === 'orders' && (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
        <path d="M3 6h18" />
        <path d="M16 10a4 4 0 0 1-8 0" />
        <path d="M12 8v4" />
        <path d="M10 10h4" />
      </svg>
    )}
    {name === 'business' && (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 21h18" />
        <path d="M5 21V7l8-4 8 4v14" />
        <path d="M9 21v-8a3 3 0 0 1 6 0v8" />
      </svg>
    )}
    {name === 'coupon' && (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6" />
        <path d="M14 4l8 4v6l-8 4" />
        <path d="M10 8l-2 2M10 12l-2 2M14 12l2 2M14 8l2-2" />
        <path d="M8 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z" />
      </svg>
    )}
    {name === 'profile' && (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        <path d="M8 14l-4 4" />
        <path d="M16 14l4 4" />
      </svg>
    )}
  </span>
)

export default function PartnerLayout() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  
  const logout = () => {
    localStorage.removeItem('partnerToken')
    localStorage.removeItem('partnerData')
    navigate('/partner/login')
  }

  const link = (to, label, end = false) => {
    return (
      <NavLink
        to={to}
        end={end}
        onClick={() => setOpen(false)}
        className={({ isActive }) =>
          [
            'flex items-center px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200 group',
            isActive
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-200 scale-[1.02]'
              : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 hover:pl-5'
          ].join(' ')
        }
      >
        {label}
      </NavLink>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white text-gray-900 selection:bg-indigo-100 selection:text-indigo-900">
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #d1d5db; }
      `}</style>
      <div className="flex h-20 items-center justify-between border-b border-gray-100 bg-white/80 backdrop-blur-md px-4 md:px-6 lg:px-10 sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <button
            className="md:hidden p-2 rounded-xl hover:bg-gray-50 border border-gray-100 transition-colors"
            onClick={() => setOpen(!open)}
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <div className="flex items-center gap-3">
            <div className="h-10 md:h-12 rounded-2xl bg-white flex items-center justify-center shadow-xl border border-gray-100 p-1 overflow-hidden">
              <img src={logoImg} alt="Click2Kart" className="h-full w-auto object-contain" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-sm md:text-base font-black tracking-tight text-gray-900">{CONFIG.BRAND_NAME}</span>
                <span className="px-2 py-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-[10px] font-black text-white rounded-lg tracking-widest uppercase">Partner</span>
              </div>
              <div className="text-[9px] md:text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">Partner Portal</div>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={logout}
          title="Sign out"
          aria-label="Sign out"
          className="group inline-flex h-10 md:h-11 w-10 md:w-11 items-center justify-center rounded-2xl border border-gray-200 text-gray-600 transition-all hover:bg-red-50 hover:border-red-100 hover:text-red-600 active:scale-95"
        >
          <svg className="w-5 h-5 transition-transform group-hover:-translate-x-px" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>

      <div className="grid min-h-[calc(100vh-5rem)] md:grid-cols-[260px_minmax(0,1fr)]">
        <aside
          className={`border-r border-gray-100 bg-white/50 backdrop-blur-sm ${
            open ? 'fixed inset-0 z-40 bg-white pt-20' : 'hidden'
          } md:block sticky top-20 h-[calc(100vh-5rem)]`}
        >
          <div className="h-full flex flex-col p-4 md:p-6 overflow-hidden">
            <nav className="flex-1 space-y-2 overflow-y-auto pr-2 custom-scrollbar">
              {link('/partner/dashboard', (
                <>
                  <Icon name="dash" />
                  Dashboard
                </>
              ), true)}
              {link('/partner/my-businesses', (
                <>
                  <Icon name="business" />
                  My Businesses
                </>
              ))}
              {link('/partner/my-coupons', (
                <>
                  <Icon name="coupon" />
                  My Coupons
                </>
              ))}
              {link('/partner/earnings', (
                <>
                  <Icon name="earnings" />
                  Earnings
                </>
              ))}
              {link('/partner/orders', (
                <>
                  <Icon name="orders" />
                  Referred Orders
                </>
              ))}
              {link('/partner/profile', (
                <>
                  <Icon name="profile" />
                  Profile
                </>
              ))}
            </nav>
            <div className="mt-auto pt-6 border-t border-gray-50 px-2">
              <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                System Online
              </div>
            </div>
          </div>
        </aside>

        <main className="bg-gray-50/30">
          <div className="max-w-[1400px] mx-auto p-6 md:p-10">
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
