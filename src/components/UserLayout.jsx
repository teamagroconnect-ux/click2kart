import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import React, { useEffect, useState } from 'react'
import { useCart } from '../lib/CartContext'
import { useAuth } from '../lib/AuthContext'
import { CONFIG } from '../shared/lib/config.js'

import ConfirmModal from './ConfirmModal'
import { getImageUrl } from '../lib/cloudinary'

function Avatar({ user, size = 'md' }) {
  const sz = { sm: 'h-8 w-8', md: 'h-12 w-12', lg: 'h-16 w-16' }[size]
  const avatarUrl = user?.kyc?.profilePicture
  if (avatarUrl)
    return <img src={getImageUrl(avatarUrl) || avatarUrl} alt={user.name} className={`${sz} rounded-2xl object-cover ring-2 ring-white shadow-md`} />
  return (
    <div className={`${sz} rounded-2xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center font-black text-white ring-2 ring-white shadow-md`}>
      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
    </div>
  )
}

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function UserLayout() {
  const location = useLocation()
  const { cartCount } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [isPwaInstalled, setIsPwaInstalled] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [getAppDismissed, setGetAppDismissed] = useState(() => localStorage.getItem('get_app_dismissed') === '1')
  const [showInstallHelp, setShowInstallHelp] = useState(false)
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

  useEffect(() => {
    // detect PWA install prompt availability
    const onBeforeInstallPrompt = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }
    const onAppInstalled = () => setIsPwaInstalled(true)
    // check if already installed
    const checkInstalled = () => {
      const standalone = window.matchMedia && window.matchMedia('(display-mode: standalone)').matches
      if (navigator.standalone || standalone) setIsPwaInstalled(true)
    }
    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    window.addEventListener('appinstalled', onAppInstalled)
    checkInstalled()
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
      window.removeEventListener('appinstalled', onAppInstalled)
    }
  }, [])

  const handleGetAppClick = async () => {
    // Trigger direct APK download
    const link = document.createElement('a')
    link.href = CONFIG.APK_DOWNLOAD_URL
    link.download = 'click2kart-app.apk'
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const dismissGetApp = () => {
    setGetAppDismissed(true)
    try { localStorage.setItem('get_app_dismissed', '1') } catch {}
  }

  const installMessage = (() => {
    try {
      const ua = navigator.userAgent || ''
      if (/iPhone|iPad|iPod/i.test(ua)) {
        return 'iOS: Tap the Share icon (bottom) → Add to Home Screen → Add.'
      }
      return 'Android / Desktop: Open your browser menu and choose "Add to Home screen". On Chrome for Android you may also see an install prompt.'
    } catch (e) { return 'Open browser menu and choose "Add to Home screen".' }
  })()

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/95 backdrop-blur-xl shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-14 sm:h-14 md:h-16 gap-4">
            <Link to="/" className="flex items-center group">
              <div className="relative h-12 w-24 sm:h-14 sm:w-28 md:h-16 md:w-32 transition-all duration-300 group-hover:scale-105">
                <img
                  src="/newlogo.png"
                  alt="Click2Kart"
                  className="h-full w-full object-contain"
                />
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
                    <Link to="/profile" className="inline-flex items-center gap-3 px-4 py-2.5 rounded-2xl border border-gray-200 bg-white shadow-lg shadow-gray-100 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-100 transition-all cursor-pointer">
                      <Avatar user={user} size="md" />
                      <div className="flex flex-col items-start gap-0.5">
                        <div className="inline-flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-200"></span>
                          <span className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-900">{user.name}</span>
                        </div>
                        <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-gray-500 leading-none">BUSINESS ACCOUNT</span>
                      </div>
                    </Link>
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
                {/* Get App button for non-installed users (visible to both logged-in and logged-out) */}
                {!isPwaInstalled && !getAppDismissed && (
                  <button
                    onClick={handleGetAppClick}
                    className="ml-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-indigo-200 hover:from-indigo-700 hover:to-purple-700 transition-all active:scale-95 lg:hidden"
                    title="Install App"
                  >
                    Install App
                  </button>
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

      {location.pathname === '/' && (
        <footer className="border-t border-gray-50 bg-white py-12 pb-32 lg:pb-12">
          <div className="max-w-7xl mx-auto px-6 md:px-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <img src="/newlogo.png" alt="Click2Kart" className="h-12 w-auto rounded-xl border border-gray-100 shadow-sm" />
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">© {new Date().getFullYear()} Click2Kart. All rights reserved.</span>
              <div className="flex gap-4 items-center">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Store Status: Online</span>
              </div>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
              <div className="flex items-center gap-4">
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white shadow-md hover:scale-110 transition-transform">
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-md hover:scale-110 transition-transform">
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                  </svg>
                </a>
                <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white shadow-md hover:scale-110 transition-transform">
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
              </div>
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
      )}
      {/* Floating Install App button visible on all screens when appropriate */}
      {!isPwaInstalled && !getAppDismissed && (
        <div className="fixed bottom-6 right-4 z-50 flex items-center gap-3 lg:hidden">
          <button
            onClick={handleGetAppClick}
            className="px-6 py-3 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black text-sm shadow-xl shadow-indigo-300 hover:from-indigo-700 hover:to-purple-700 transition-all active:scale-95"
            title="Install App"
          >
            Install App
          </button>
          <button
            onClick={dismissGetApp}
            className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-white border border-gray-100 shadow-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all"
            title="Dismiss"
          >
            ×
          </button>
        </div>
      )}
      <ConfirmModal
        open={showInstallHelp}
        title="Install Instructions"
        message={installMessage}
        onCancel={() => setShowInstallHelp(false)}
        onConfirm={() => { try { navigator.clipboard.writeText(installMessage) } catch {} ; setShowInstallHelp(false); alert('Instructions copied to clipboard') }}
      />
      <ConfirmModal
        open={showUpgradeModal}
        title="Premium Required"
        message="Get App is a premium feature. Upgrade to premium to enable app installation. Proceed to upgrade?"
        onCancel={() => setShowUpgradeModal(false)}
        onConfirm={() => { setShowUpgradeModal(false); navigate('/profile') }}
      />
    </div>
  )
}
