import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import React, { useEffect, useState } from 'react'
import { useCart } from '../lib/CartContext'

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function UserLayout() {
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const { cartCount } = useCart()
  const user = JSON.parse(localStorage.getItem('user') || 'null')

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.reload()
  }

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
                <div className="h-12 w-12 rounded-2xl bg-violet-600 text-white flex items-center justify-center text-xs font-black shadow-xl shadow-violet-100 border border-violet-500 transition-all group-hover:scale-110 overflow-hidden relative">
                  {/* Logo Placeholder */}
                  <img 
                    src="/logo.png" 
                    alt="Logo" 
                    className="w-full h-full object-cover absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                  />
                  <span className="relative z-10">C2K</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-black tracking-tighter text-gray-900 leading-none group-hover:text-violet-600 transition-colors">Click2Kart</span>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-1 hidden xs:block">Premium B2B Tech</span>
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
                <svg className="w-6 h-6 text-gray-600 group-hover:text-violet-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-[10px] font-black text-white bg-violet-600 rounded-lg shadow-lg shadow-violet-200 border-2 border-white">
                    {cartCount}
                  </span>
                )}
              </Link>
              <div className="hidden sm:flex items-center gap-2">
                {user ? (
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-black uppercase text-gray-900 leading-none">{user.name}</span>
                      <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-1">Business Account</span>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="px-6 py-3 rounded-2xl bg-gray-50 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <>
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
                  </>
                )}
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
                {user ? (
                  <button
                    onClick={handleLogout}
                    className="w-full px-6 py-4 rounded-2xl bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest text-center shadow-xl shadow-red-100"
                  >
                    Logout ({user.name})
                  </button>
                ) : (
                  <>
                    <Link to="/login" className="flex-1 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center border border-gray-100">Login</Link>
                    <Link to="/signup" className="flex-1 px-6 py-4 rounded-2xl bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest text-center shadow-xl">Join Now</Link>
                  </>
                )}
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
            <div className="flex gap-4 items-center">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Store Status: Online</span>
            </div>
          </div>
          <div className="flex items-center gap-8">
            <a 
              href="https://wa.me/917978880244" 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center gap-2 group"
            >
              <span className="h-8 w-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.246 2.248 3.484 5.232 3.484 8.412-.003 6.557-5.338 11.892-11.893 11.892-1.997-.001-3.951-.5-5.688-1.448l-6.309 1.656zm6.224-3.82c1.516.903 3.125 1.378 4.773 1.379 5.428 0 9.843-4.415 9.845-9.845.001-2.631-1.023-5.104-2.883-6.964s-4.333-2.883-6.964-2.884c-5.43 0-9.844 4.415-9.846 9.845-.001 1.696.442 3.351 1.282 4.796l-1.07 3.907 4.008-1.052zm11.332-6.845c-.312-.156-1.848-.912-2.126-1.013-.279-.1-.482-.15-.683.15-.201.3-.778 1.013-.954 1.213-.177.2-.353.226-.665.07-.312-.156-1.318-.486-2.512-1.55-.928-.828-1.555-1.85-1.737-2.163-.182-.313-.02-.482.137-.638.141-.14.312-.363.469-.544.156-.181.209-.312.312-.519.104-.207.052-.389-.026-.544-.078-.156-.683-1.646-.936-2.257-.246-.594-.497-.514-.683-.524-.176-.01-.378-.011-.58-.011s-.53.076-.807.377c-.278.301-1.061 1.038-1.061 2.532s1.087 2.94 1.238 3.141c.151.201 2.138 3.265 5.18 4.577.723.312 1.288.499 1.728.639.726.231 1.387.198 1.909.12.583-.087 1.848-.755 2.11-1.482.261-.728.261-1.355.183-1.482-.078-.127-.29-.203-.602-.359z"/></svg>
              </span>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest leading-none">WhatsApp Support</span>
                <span className="text-[9px] font-bold text-emerald-600 mt-1">+91 79788 80244</span>
              </div>
            </a>
            <div className="h-8 w-[1px] bg-gray-100"></div>
            {['Privacy Policy', 'Terms of Service', 'Support'].map((f) => (
              <span key={f} className="text-[10px] font-black text-gray-400 uppercase tracking-widest cursor-pointer hover:text-gray-900 transition-colors">{f}</span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}

