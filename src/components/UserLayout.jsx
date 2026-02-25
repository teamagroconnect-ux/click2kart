import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useCart } from '../lib/CartContext'

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function UserLayout() {
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const { cartCount } = useCart()

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="flex items-center justify-between h-20 gap-8">
            <div className="flex items-center gap-6">
              <button
                className="lg:hidden p-2 rounded-xl hover:bg-gray-50 border border-gray-100 transition-colors"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
              </button>
              <Link to="/" className="flex items-center gap-3 group">
                <span className="h-10 w-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-xs font-black shadow-xl shadow-blue-100 border border-blue-500 transition-transform group-hover:scale-110">
                  C2K
                </span>
                <div className="flex flex-col">
                  <span className="text-lg font-black tracking-tighter text-gray-900 leading-none">Click2Kart</span>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1 hidden xs:block">Premium Tech</span>
                </div>
              </Link>
            </div>

            <nav className="hidden lg:flex items-center gap-2">
              {[
                { to: '/', label: 'Home' },
                { to: '/products', label: 'Catalogue' },
                { to: '/order', label: 'Order Online' },
                { to: '/orders', label: 'My Orders' },
                { to: '/partner', label: 'Partner Portal' }
              ].map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    classNames(
                      'px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-200',
                      isActive 
                        ? 'bg-gray-900 text-white shadow-xl shadow-gray-200 scale-105' 
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
                className="group relative h-12 w-12 flex items-center justify-center rounded-2xl bg-gray-50 border border-gray-100 hover:bg-white hover:shadow-xl transition-all active:scale-95"
              >
                <svg className="w-6 h-6 text-gray-600 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-[10px] font-black text-white bg-blue-600 rounded-lg shadow-lg shadow-blue-200 border-2 border-white">
                    {cartCount}
                  </span>
                )}
              </Link>
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-gray-900 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-8 py-3 rounded-2xl bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-gray-200 hover:bg-gray-800 transition-all active:scale-95"
                >
                  Join Now
                </Link>
              </div>
            </div>
          </div>

          {mobileOpen && (
            <div className="lg:hidden py-8 space-y-6 animate-in slide-in-from-top-4 duration-300">
              <nav className="flex flex-col gap-2 border-t border-gray-50 pt-6">
                {[
                  { to: '/', label: 'Home' },
                  { to: '/products', label: 'Catalogue' },
                  { to: '/order', label: 'Order Online' },
                  { to: '/orders', label: 'My Orders' },
                  { to: '/partner', label: 'Partner Portal' }
                ].map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={({ isActive }) =>
                      classNames(
                        'px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all',
                        isActive ? 'bg-gray-900 text-white shadow-xl' : 'text-gray-500 hover:bg-gray-50'
                      )
                    }
                  >
                    {link.label}
                  </NavLink>
                ))}
              </nav>
              <div className="flex gap-4 pt-4">
                <Link to="/login" className="flex-1 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center border border-gray-100">Login</Link>
                <Link to="/signup" className="flex-1 px-6 py-4 rounded-2xl bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest text-center shadow-xl">Join Now</Link>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 min-h-0 pb-20 lg:pb-0 animate-in fade-in duration-700">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-6 inset-x-6 z-40">
        <div className="max-w-md mx-auto h-16 bg-gray-900/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 flex items-center justify-around px-4">
          {[
            { to: '/', i: <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />, l: 'Home' },
            { to: '/products', i: <path d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />, l: 'Browse' },
            { to: '/order', i: <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />, l: 'Order' },
            { to: '/login', i: <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />, l: 'Profile' }
          ].map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                classNames(
                  'flex flex-col items-center justify-center gap-1 transition-all',
                  isActive ? 'text-blue-400 scale-110' : 'text-gray-500 hover:text-white'
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

      <footer className="hidden lg:block border-t border-gray-50 bg-white py-12">
        <div className="max-w-7xl mx-auto px-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">© {new Date().getFullYear()} Click2Kart Premium</span>
            <div className="flex gap-4">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Store Status: Online</span>
            </div>
          </div>
          <div className="flex gap-8">
            {['Privacy Policy', 'Terms of Service', 'Support'].map((f) => (
              <span key={f} className="text-[10px] font-black text-gray-400 uppercase tracking-widest cursor-pointer hover:text-gray-900 transition-colors">{f}</span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}

