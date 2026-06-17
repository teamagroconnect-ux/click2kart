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
    chevronLeft: 'M15 19l-7-7 7-7',
    logout: 'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1',
    camera: 'M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9zM15 12a3 3 0 11-6 0 3 3 0 016 0z'
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
  const { token, refreshProfile, logout: authLogout } = useAuth()
  
  const [activeSection, setActiveSection] = useState('profile')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savingAddress, setSavingAddress] = useState(false)
  const [user, setUser] = useState(null)
  const [formData, setFormData] = useState({
    businessName: '', gstin: '', pan: '', addressLine1: '', addressLine2: '', city: '', district: '', state: '', pincode: ''
  });
  const [addressForm, setAddressForm] = useState({
    name: '', phone: '', addressLine1: '', addressLine2: '', city: '', district: '', state: '', pincode: '', type: 'home'
  })
  const [showAddAddress, setShowAddAddress] = useState(false)
  const [profilePicture, setProfilePicture] = useState(null)

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
        district: data.kyc?.district || '',
        state: data.kyc?.state || '',
        pincode: data.kyc?.pincode || ''
      })
      if (data.kyc?.profilePicture) {
        setProfilePicture(data.kyc.profilePicture)
      }
      // Initialize address form with default address if available
      if (data.defaultAddress) {
        try {
          const addr = typeof data.defaultAddress === 'string' ? JSON.parse(data.defaultAddress) : data.defaultAddress
          setAddressForm({
            name: addr.name || '',
            phone: addr.phone || data.phone || '',
            addressLine1: addr.addressLine1 || '',
            addressLine2: addr.addressLine2 || '',
            city: addr.city || '',
            district: addr.district || '',
            state: addr.state || '',
            pincode: addr.pincode || '',
            type: addr.type || 'home'
          })
        } catch (e) {
          // If parsing fails, use default
        }
      }
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
      const { data } = await api.put('/api/user/kyc', { ...formData, profilePicture })
      setUser(data)
      notify('Profile updated!', 'success')
      refreshProfile()
    } catch (e) {
      notify(e?.response?.data?.error || 'Failed to update', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveAddress = async (e) => {
    e.preventDefault()
    setSavingAddress(true)
    try {
      // Update user's address
      await api.put('/api/user/profile', { address: JSON.stringify(addressForm) })
      await loadUser()
      notify('Address saved!', 'success')
      setShowAddAddress(false)
    } catch (e) {
      notify(e?.response?.data?.error || 'Failed to save', 'error')
    } finally {
      setSavingAddress(false)
    }
  }

  const handleLogout = () => {
    authLogout()
    navigate('/login')
  }

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setProfilePicture(event.target.result)
      }
      reader.readAsDataURL(file)
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
              {/* KYC Status Badge */}
              <div className="mt-2">
                {user?.isKycComplete ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-widest">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    KYC Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold uppercase tracking-widest">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    KYC Pending
                  </span>
                )}
              </div>
            </div>
            {/* Profile Picture with Upload */}
            <div className="relative group">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-3xl border border-white/30 font-black overflow-hidden">
                {profilePicture ? (
                  <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span>{user?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                )}
              </div>
              <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-2xl">
                <Ico n="camera" cls="w-6 h-6 text-white" />
                <input type="file" accept="image/*" className="hidden" onChange={handleProfilePictureChange} />
              </label>
            </div>
          </div>

          {/* Mobile Nav */}
          <div className="lg:hidden pf-nav-strip flex overflow-x-auto px-4 pb-0 gap-1">
            {[
              { id: 'profile', label: 'Business Profile', icon: 'user' },
              { id: 'addresses', label: 'Addresses', icon: 'map' }
            ].map((item) => (
              <button key={item.id} onClick={() => setActiveSection(item.id)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold rounded-t-xl transition-all
                  ${activeSection === item.id ? 'bg-white text-violet-600' : 'text-violet-200 hover:text-white'}`}
              >
                <Ico n={item.icon} cls="w-4 h-4" />
                {item.label}
              </button>
            ))}
            <button onClick={handleLogout} className="flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold rounded-t-xl text-violet-200 hover:text-white transition-all">
              <Ico n="logout" cls="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-5 lg:py-8 lg:flex lg:gap-6">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:flex flex-col gap-3 w-56 flex-shrink-0">
            <div className="bg-white rounded-2xl p-4 border border-violet-100 shadow-sm flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center font-black text-white text-lg overflow-hidden group">
                {profilePicture ? (
                  <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span>{user?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                )}
                <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-2xl">
                  <Ico n="camera" cls="w-5 h-5 text-white" />
                  <input type="file" accept="image/*" className="hidden" onChange={handleProfilePictureChange} />
                </label>
              </div>
              <div className="min-w-0">
                <div className="pf-display font-black text-gray-800 text-sm truncate">{user?.name}</div>
                <div className="text-[11px] text-gray-400 truncate">{user?.email}</div>
              </div>
            </div>

            <nav className="bg-white rounded-2xl border border-violet-100 shadow-sm overflow-hidden">
              {[
                { id: 'profile', label: 'Business Profile', icon: 'user' },
                { id: 'addresses', label: 'Saved Addresses', icon: 'map' }
              ].map((item) => (
                <button key={item.id} onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 text-sm font-semibold text-left transition-all border-l-2
                    ${activeSection === item.id ? 'border-violet-500 bg-violet-50 text-violet-700' : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-800'}`}
                >
                  <Ico n={item.icon} cls="w-5 h-5" />
                  {item.label}
                </button>
              ))}
              <button onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-sm font-semibold text-left transition-all border-l-2 border-transparent text-red-600 hover:bg-red-50"
              >
                <Ico n="logout" cls="w-5 h-5" />
                Logout
              </button>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0 space-y-4">
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
                  <div className="grid md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">City</label>
                      <input type="text" value={formData.city} onChange={e => setFormData(p => ({...p, city: e.target.value}))} className="w-full px-4 py-3 rounded-xl border border-violet-200 bg-violet-50/50 text-gray-800 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all" placeholder="City" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">District</label>
                      <input type="text" value={formData.district} onChange={e => setFormData(p => ({...p, district: e.target.value}))} className="w-full px-4 py-3 rounded-xl border border-violet-200 bg-violet-50/50 text-gray-800 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all" placeholder="District" />
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
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="pf-display font-black text-gray-800">Saved Addresses</h3>
                    <button 
                      onClick={() => setShowAddAddress(!showAddAddress)} 
                      className="px-4 py-2 rounded-xl bg-violet-600 text-white text-xs font-black uppercase tracking-widest hover:bg-violet-700 transition-colors"
                    >
                      {showAddAddress ? 'Cancel' : 'Add Address'}
                    </button>
                  </div>
                  
                  {/* Add Address Form */}
                  {showAddAddress && (
                    <form onSubmit={handleSaveAddress} className="mb-6 p-4 border border-violet-100 rounded-xl bg-violet-50/50 space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">Full Name</label>
                          <input type="text" value={addressForm.name} onChange={e => setAddressForm(p => ({...p, name: e.target.value}))} className="w-full px-4 py-3 rounded-xl border border-violet-200 bg-white text-gray-800 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all" placeholder="Full name" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">Phone Number</label>
                          <input type="text" value={addressForm.phone} onChange={e => setAddressForm(p => ({...p, phone: e.target.value}))} className="w-full px-4 py-3 rounded-xl border border-violet-200 bg-white text-gray-800 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all" placeholder="Phone number" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">Address Line 1</label>
                        <textarea value={addressForm.addressLine1} onChange={e => setAddressForm(p => ({...p, addressLine1: e.target.value}))} className="w-full px-4 py-3 rounded-xl border border-violet-200 bg-white text-gray-800 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all" placeholder="Street address" rows={2} />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">Address Line 2</label>
                        <textarea value={addressForm.addressLine2} onChange={e => setAddressForm(p => ({...p, addressLine2: e.target.value}))} className="w-full px-4 py-3 rounded-xl border border-violet-200 bg-white text-gray-800 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all" placeholder="Landmark, area (optional)" rows={2} />
                      </div>
                      <div className="grid md:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">City</label>
                          <input type="text" value={addressForm.city} onChange={e => setAddressForm(p => ({...p, city: e.target.value}))} className="w-full px-4 py-3 rounded-xl border border-violet-200 bg-white text-gray-800 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all" placeholder="City" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">District</label>
                          <input type="text" value={addressForm.district} onChange={e => setAddressForm(p => ({...p, district: e.target.value}))} className="w-full px-4 py-3 rounded-xl border border-violet-200 bg-white text-gray-800 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all" placeholder="District" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">State</label>
                          <input type="text" value={addressForm.state} onChange={e => setAddressForm(p => ({...p, state: e.target.value}))} className="w-full px-4 py-3 rounded-xl border border-violet-200 bg-white text-gray-800 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all" placeholder="State" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">Pincode</label>
                          <input type="text" value={addressForm.pincode} onChange={e => setAddressForm(p => ({...p, pincode: e.target.value}))} className="w-full px-4 py-3 rounded-xl border border-violet-200 bg-white text-gray-800 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all" placeholder="Pincode" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">Address Type</label>
                        <div className="flex gap-3">
                          {['home', 'work', 'other'].map(type => (
                            <label key={type} className="flex items-center gap-2 cursor-pointer">
                              <input 
                                type="radio" 
                                name="type" 
                                value={type} 
                                checked={addressForm.type === type} 
                                onChange={e => setAddressForm(p => ({...p, type: e.target.value}))} 
                                className="w-4 h-4 text-violet-600 border-gray-300 focus:ring-violet-500" 
                              />
                              <span className="text-sm font-semibold text-gray-700 capitalize">{type}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <button type="submit" disabled={savingAddress} className="w-full py-3.5 rounded-xl font-black text-sm text-white bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 active:scale-[0.98] transition-all shadow-lg shadow-violet-200 disabled:opacity-50 disabled:cursor-not-allowed">
                        {savingAddress ? 'Saving...' : 'Save Address'}
                      </button>
                    </form>
                  )}

                  {/* Display Address */}
                  {user?.defaultAddress ? (
                    <div className="p-4 border border-gray-200 rounded-xl bg-gray-50">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="text-sm font-black text-gray-800 flex items-center gap-2">
                            {addressForm.name}
                            <span className="text-xs px-2 py-0.5 bg-violet-100 text-violet-700 rounded-full font-semibold capitalize">{addressForm.type}</span>
                          </div>
                          <div className="text-sm font-semibold text-gray-600">{addressForm.phone}</div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-700">
                        {addressForm.addressLine1}
                        {addressForm.addressLine2 && `, ${addressForm.addressLine2}`}
                      </div>
                      <div className="text-sm text-gray-700">
                        {addressForm.city}, {addressForm.district}, {addressForm.state} - {addressForm.pincode}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-10 text-gray-400">
                      <div className="w-16 h-16 rounded-2xl bg-violet-50 text-violet-300 flex items-center justify-center mx-auto mb-3">
                        <Ico n="map" cls="w-8 h-8" />
                      </div>
                      <p className="text-sm">No saved addresses yet</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  )
}
