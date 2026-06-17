import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import api from '../../lib/api'
import { useToast } from '../../components/Toast'
import { useAuth } from '../../lib/AuthContext'

const Ico = ({ n, cls = 'w-5 h-5' }) => {
  const d = {
    home: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
    user: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
    map: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0',
    package: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
    heart: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
    help: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    gear: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0',
    lock: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
    cart: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z',
    chevronRight: 'M9 5l7 7-7 7',
    chevronLeft: 'M15 19l-7-7 7-7'
  }
  return (
    <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
      {d[n]?.split(' M').map((seg, i) => (
        <path key={i} d={i === 0 ? seg : 'M' + seg} />
      ))}
    </svg>
  )
}

export default function Profile() {
  const navigate = useNavigate()
  const location = useLocation()
  const { notify } = useToast()
  const { token, refreshProfile } = useAuth()
  
  const [activeSection, setActiveSection] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [showPasswordChange, setShowPasswordChange] = useState(false)
  const [user, setUser] = useState(null)
  const [formData, setFormData] = useState({
    businessName: '', gstin: '', pan: '', addressLine1: '', addressLine2: '', city: '', state: '', pincode: ''
  })
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })

  useEffect(() => {
    if (!token) {
      navigate('/login', { state: { from: location.pathname + location.search } })
      return
    }
    loadUser()
  }, [token])

  const loadUser = async () => {
    try {
      const { data } = await api.get('/api/user/me')
      setUser(data)
      setFormData({
        businessName: data.kyc?.businessName || '',
        gstin: data.kyc?.gstin || '',
        pan: data.kyc?.pan || '',
        addressLine1: data.kyc?.addressLine1 || '',
        addressLine2: data.kyc?.addressLine2 || '',
        city: data.kyc?.city || '',
        state: data.kyc?.state || '',
        pincode: data.kyc?.pincode || ''
      })
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const { data } = await api.put('/api/user/kyc', formData)
      setUser(data)
      notify('Profile updated!', 'success')
      refreshProfile()
    } catch (e) {
      notify(e?.response?.data?.error || 'Failed to update', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordUpdate = async (e) => {
    e.preventDefault()
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      notify('Passwords do not match', 'error')
      return
    }
    if (passwordForm.newPassword.length < 6) {
      notify('Minimum 6 characters', 'error')
      return
    }
    setChangingPassword(true)
    try {
      await api.put('/api/user/change-password', passwordForm)
      notify('Password changed!', 'success')
      setShowPasswordChange(false)
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (e) {
      notify(e?.response?.data?.error || 'Failed', 'error')
    } finally {
      setChangingPassword(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-violet-50 to-white">
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center mx-auto mb-4 animate-pulse">
          <Ico n="user" cls="w-8 h-8 text-white" />
        </div>
        <div className="text-lg font-bold text-gray-800">Loading Profile...</div>
      </div>
    </div>
  )

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700&display=swap');
        
        .pf-root { font-family: 'DM Sans', system-ui, sans-serif; }
        .pf-display { font-family: 'Bebas Neue', system-ui, sans-serif; }
        
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .pf-panel { animation: slideUp 0.28s cubic-bezier(0.16,1,0.3,1) forwards; }
        
        .pf-nav-strip::-webkit-scrollbar { display: none; }
        .pf-nav-strip { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div className="pf-root min-h-screen bg-gradient-to-b from-violet-50 to-white pb-32 lg:pb-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white">
          <div className="max-w-5xl mx-auto px-4 py-6 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black uppercase tracking-widest text-violet-200">My Account</p>
              <h1 className="pf-display font-black text-2xl leading-tight truncate">{user?.name || 'User'}</h1>
              {user?.kyc?.businessName && (
                <p className="text-violet-200 text-sm mt-1">{user.kyc.businessName}</p>
              )}
            </div>
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-2xl border border-white/30 font-black">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
          </div>

          {/* Mobile Nav */}
          <div className="lg:hidden pf-nav-strip flex overflow-x-auto px-4 pb-0 gap-1">
            {[
              { id: 'overview', label: 'Overview', icon: 'home' },
              { id: 'profile', label: 'Profile', icon: 'user' },
              { id: 'addresses', label: 'Addresses', icon: 'map' },
              { id: 'support', label: 'Support', icon: 'help' },
              { id: 'settings', label: 'Settings', icon: 'gear' }
            ].map((item) => (
              <button key={item.id} onClick={() => setActiveSection(item.id)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold rounded-t-xl transition-all
                  ${activeSection === item.id ? 'bg-white text-violet-600' : 'text-violet-200 hover:text-white'}`}
              >
                <Ico n={item.icon} cls="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-5 lg:py-8 lg:flex lg:gap-6">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:flex flex-col gap-3 w-56 flex-shrink-0">
            <div className="bg-white rounded-2xl p-4 border border-violet-100 shadow-sm flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center font-black text-white text-lg">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="min-w-0">
                <div className="pf-display font-black text-gray-800 text-sm truncate">{user?.name}</div>
                <div className="text-[11px] text-gray-400 truncate">{user?.email}</div>
              </div>
            </div>

            <nav className="bg-white rounded-2xl border border-violet-100 shadow-sm overflow-hidden">
              {[
                { id: 'overview', label: 'Overview', icon: 'home' },
                { id: 'profile', label: 'Profile & KYC', icon: 'user' },
                { id: 'addresses', label: 'Saved Addresses', icon: 'map' },
                { id: 'support', label: 'Support', icon: 'help' },
                { id: 'settings', label: 'Settings', icon: 'gear' }
              ].map((item) => (
                <button key={item.id} onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 text-sm font-semibold text-left transition-all border-l-2
                    ${activeSection === item.id ? 'border-violet-500 bg-violet-50 text-violet-700' : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-800'}`}
                >
                  <Ico n={item.icon} cls="w-5 h-5" />
                  {item.label}
                </button>
              ))}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* Overview */}
            {activeSection === 'overview' && (
              <div className="pf-panel space-y-4">
                <div className="bg-gradient-to-br from-violet-600 to-purple-600 rounded-2xl p-5 text-white relative overflow-hidden">
                  <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                  <div className="absolute right-8 bottom-0 w-20 h-20 bg-white/5 rounded-full translate-y-1/2"></div>
                  <p className="text-violet-200 text-xs font-bold uppercase tracking-widest mb-1">Welcome back</p>
                  <h2 className="pf-display font-black text-2xl leading-tight mb-3">{user?.name?.split(' ')[0]}</h2>
                  <p className="text-violet-200 text-sm">{user?.email}</p>
                  {user?.isKycComplete && (
                    <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      KYC Verified
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setActiveSection('profile')}
                    className="bg-white rounded-2xl p-4 border border-violet-100 shadow-sm hover:shadow-md hover:border-violet-200 active:scale-[0.97] transition-all text-left"
                  >
                    <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center mb-3">
                      <Ico n="user" cls="w-5 h-5" />
                    </div>
                    <div className="pf-display font-black text-gray-800 text-sm">Edit Profile</div>
                    <div className="text-gray-400 text-xs mt-0.5">Update KYC details</div>
                  </button>
                  <button 
                    onClick={() => navigate('/orders')}
                    className="bg-white rounded-2xl p-4 border border-violet-100 shadow-sm hover:shadow-md hover:border-violet-200 active:scale-[0.97] transition-all text-left"
                  >
                    <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
                      <Ico n="package" cls="w-5 h-5" />
                    </div>
                    <div className="pf-display font-black text-gray-800 text-sm">My Orders</div>
                    <div className="text-gray-400 text-xs mt-0.5">View order history</div>
                  </button>
                </div>

                <div className="bg-white rounded-2xl border border-violet-100 shadow-sm p-5">
                  <h3 className="pf-display font-black text-gray-800 mb-3">Quick Links</h3>
                  <div className="space-y-2">
                    <Link to="/products" className="flex items-center justify-between p-3 rounded-xl hover:bg-violet-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-violet-100 text-violet-600 flex items-center justify-center">
                          <Ico n="cart" cls="w-4 h-4" />
                        </div>
                        <span className="text-sm font-semibold text-gray-700">Browse Catalog</span>
                      </div>
                      <Ico n="chevronRight" cls="w-4 h-4 text-violet-500" />
                    </Link>
                    <Link to="/cart" className="flex items-center justify-between p-3 rounded-xl hover:bg-violet-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                          <Ico n="package" cls="w-4 h-4" />
                        </div>
                        <span className="text-sm font-semibold text-gray-700">View Cart</span>
                      </div>
                      <Ico n="chevronRight" cls="w-4 h-4 text-violet-500" />
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Profile & KYC */}
            {activeSection === 'profile' && (
              <div className="pf-panel bg-white rounded-2xl border border-violet-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-violet-50">
                  <h2 className="pf-display font-black text-gray-800">Business Profile</h2>
                  <p className="text-gray-400 text-xs mt-0.5">Update your KYC and business details</p>
                </div>
                <form onSubmit={handleSaveProfile} className="p-5 space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">Business Name</label>
                      <input type="text" value={formData.businessName} onChange={e => setFormData(p => ({...p, businessName: e.target.value}))} className="w-full px-4 py-3 rounded-xl border border-violet-200 bg-violet-50/50 text-gray-800 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all" placeholder="Your business name" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">Email Address</label>
                      <input type="email" value={user?.email || ''} disabled className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 text-gray-400 font-semibold text-sm cursor-not-allowed" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">GSTIN</label>
                      <input type="text" value={formData.gstin} onChange={e => setFormData(p => ({...p, gstin: e.target.value}))} className="w-full px-4 py-3 rounded-xl border border-violet-200 bg-violet-50/50 text-gray-800 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all" placeholder="22ABCDE1234F1Z5" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">PAN</label>
                      <input type="text" value={formData.pan} onChange={e => setFormData(p => ({...p, pan: e.target.value}))} className="w-full px-4 py-3 rounded-xl border border-violet-200 bg-violet-50/50 text-gray-800 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all" placeholder="ABCDE1234F" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">Address Line 1</label>
                    <textarea value={formData.addressLine1} onChange={e => setFormData(p => ({...p, addressLine1: e.target.value}))} className="w-full px-4 py-3 rounded-xl border border-violet-200 bg-violet-50/50 text-gray-800 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all" placeholder="Street address" rows={2} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">Address Line 2</label>
                    <textarea value={formData.addressLine2} onChange={e => setFormData(p => ({...p, addressLine2: e.target.value}))} className="w-full px-4 py-3 rounded-xl border border-violet-200 bg-violet-50/50 text-gray-800 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all" placeholder="Landmark, area (optional)" rows={2} />
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">City</label>
                      <input type="text" value={formData.city} onChange={e => setFormData(p => ({...p, city: e.target.value}))} className="w-full px-4 py-3 rounded-xl border border-violet-200 bg-violet-50/50 text-gray-800 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all" placeholder="City" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">State</label>
                      <input type="text" value={formData.state} onChange={e => setFormData(p => ({...p, state: e.target.value}))} className="w-full px-4 py-3 rounded-xl border border-violet-200 bg-violet-50/50 text-gray-800 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all" placeholder="State" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">Pincode</label>
                      <input type="text" value={formData.pincode} onChange={e => setFormData(p => ({...p, pincode: e.target.value}))} className="w-full px-4 py-3 rounded-xl border border-violet-200 bg-violet-50/50 text-gray-800 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all" placeholder="Pincode" />
                    </div>
                  </div>
                  <button type="submit" disabled={saving} className="w-full py-3.5 rounded-xl font-black text-sm text-white bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 active:scale-[0.98] transition-all shadow-lg shadow-violet-200 disabled:opacity-50 disabled:cursor-not-allowed">
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </form>
              </div>
            )}

            {/* Saved Addresses */}
            {activeSection === 'addresses' && (
              <div className="pf-panel space-y-3">
                <div className="bg-white rounded-2xl border border-violet-100 shadow-sm p-5">
                  <h3 className="pf-display font-black text-gray-800 mb-4">Saved Addresses</h3>
                  <div className="text-center py-10 text-gray-400">
                    <div className="w-16 h-16 rounded-2xl bg-violet-50 text-violet-300 flex items-center justify-center mx-auto mb-3">
                      <Ico n="map" cls="w-8 h-8" />
                    </div>
                    <p className="text-sm">No saved addresses yet</p>
                    <button className="mt-4 px-6 py-2 rounded-xl bg-violet-600 text-white text-xs font-black uppercase tracking-widest hover:bg-violet-700 transition-colors">
                      Add Address
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Support */}
            {activeSection === 'support' && (
              <div className="pf-panel space-y-3">
                <div className="bg-white rounded-2xl border border-violet-100 shadow-sm p-5">
                  <h3 className="pf-display font-black text-gray-800 mb-4">Get Support</h3>
                  <div className="space-y-4">
                    <a href={`mailto:support@click2kart.com`} className="flex items-center gap-4 p-4 rounded-xl bg-violet-50 border border-violet-100 hover:bg-violet-100 transition-colors">
                      <div className="w-10 h-10 rounded-xl bg-violet-600 text-white flex items-center justify-center">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-bold text-gray-800">Email Support</div>
                        <div className="text-sm text-gray-500">support@click2kart.com</div>
                      </div>
                    </a>
                    <a href={`tel:+911234567890`} className="flex items-center gap-4 p-4 rounded-xl bg-violet-50 border border-violet-100 hover:bg-violet-100 transition-colors">
                      <div className="w-10 h-10 rounded-xl bg-violet-600 text-white flex items-center justify-center">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-bold text-gray-800">Phone Support</div>
                        <div className="text-sm text-gray-500">+91 123 456 7890</div>
                      </div>
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Settings */}
            {activeSection === 'settings' && (
              <div className="pf-panel space-y-3">
                <div>
                  <h2 className="pf-display font-black text-gray-800">Settings</h2>
                  <p className="text-gray-400 text-xs mt-0.5">Security and account preferences</p>
                </div>

                {!showPasswordChange ? (
                  <button onClick={() => setShowPasswordChange(true)}
                    className="w-full bg-white rounded-2xl border border-violet-100 shadow-sm p-4 text-left flex items-center gap-4 hover:border-violet-200 hover:shadow-md active:scale-[0.98] transition-all"
                  >
                    <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center flex-shrink-0">
                      <Ico n="lock" cls="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="pf-display font-black text-gray-800 text-sm">Change Password</div>
                      <div className="text-gray-400 text-xs mt-0.5">Update your account credentials</div>
                    </div>
                    <Ico n="chevronRight" cls="w-4 h-4 text-gray-300" />
                  </button>
                ) : (
                  <div className="bg-white rounded-2xl border border-violet-100 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-violet-50 flex items-center gap-3">
                      <button onClick={() => { setShowPasswordChange(false); setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' }); }}
                        className="p-1.5 rounded-lg hover:bg-gray-50 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <Ico n="chevronLeft" cls="w-4 h-4" />
                      </button>
                      <h3 className="pf-display font-black text-gray-800 text-sm">Change Password</h3>
                    </div>
                    <form onSubmit={handlePasswordUpdate} className="p-5 space-y-4">
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">Current Password</label>
                        <input type="password" value={passwordForm.currentPassword} onChange={e => setPasswordForm(p => ({...p, currentPassword: e.target.value}))} className="w-full px-4 py-3 rounded-xl border border-violet-200 bg-violet-50/50 text-gray-800 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all" placeholder="Current password" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">New Password</label>
                        <input type="password" value={passwordForm.newPassword} onChange={e => setPasswordForm(p => ({...p, newPassword: e.target.value}))} className="w-full px-4 py-3 rounded-xl border border-violet-200 bg-violet-50/50 text-gray-800 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all" placeholder="At least 6 characters" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">Confirm Password</label>
                        <input type="password" value={passwordForm.confirmPassword} onChange={e => setPasswordForm(p => ({...p, confirmPassword: e.target.value}))} className="w-full px-4 py-3 rounded-xl border border-violet-200 bg-violet-50/50 text-gray-800 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all" placeholder="Repeat new password" />
                      </div>
                      {passwordForm.newPassword && passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword && (
                        <p className="text-red-500 text-xs font-semibold">Passwords don't match</p>
                      )}
                      <button type="submit"
                        disabled={changingPassword || passwordForm.newPassword !== passwordForm.confirmPassword || !passwordForm.newPassword}
                        className="w-full py-3.5 rounded-xl font-black text-sm text-white bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 active:scale-[0.98] transition-all shadow-lg shadow-violet-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {changingPassword ? 'Updating...' : 'Update Password'}
                      </button>
                    </form>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  )
}
