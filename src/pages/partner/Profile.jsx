import React, { useState, useEffect } from 'react'
import api from '../../lib/api'
import { useToast } from '../../components/Toast'
import { CONFIG } from '../../shared/lib/config'

export default function PartnerProfile() {
  const { notify } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    businessName: '',
    gstNumber: '',
    panNumber: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    bloodGroup: '',
    password: '',
    newPassword: '',
    bankAccount: {
      accountHolder: '',
      accountNumber: '',
      ifscCode: '',
      bankName: '',
      branch: ''
    },
    profilePicture: ''
  })

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const { data } = await api.get('/api/public/partner/me')
      setProfile(data)
    } catch (err) {
      console.error('Failed to load profile:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const { password, newPassword, ...updateData } = profile
      await api.put('/api/public/partner/profile', updateData)
      notify('Profile updated successfully!', 'success')
    } catch (err) {
      notify('Failed to update profile', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleFileUpload = (e, field) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setProfile({ ...profile, [field]: event.target.result })
      }
      reader.readAsDataURL(file)
    }
  }

  const downloadIdCard = () => {
    alert('ID card download will be available soon!')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500 font-black text-lg">Loading profile...</div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-gray-900">Partner Profile</h1>
        <p className="text-gray-600 font-medium mt-1">Manage your profile and settings</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Photo & ID Card */}
        <div className="space-y-6">
          {/* Profile Picture */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xl">
            <h3 className="text-lg font-black text-gray-900 mb-4">Profile Picture</h3>
            <div className="flex flex-col items-center gap-4">
              {profile.profilePicture ? (
                <div className="relative group">
                  <img 
                    src={profile.profilePicture} 
                    alt="Profile" 
                    className="h-36 w-36 rounded-3xl object-cover border-4 border-indigo-100 shadow-xl"
                  />
                  <button
                    onClick={() => setProfile({ ...profile, profilePicture: '' })}
                    className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-red-500 text-white font-black shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div className="h-36 w-36 rounded-3xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-6xl border-4 border-indigo-50 shadow-xl">
                  👤
                </div>
              )}
              <label className="cursor-pointer px-6 py-3 bg-gray-50 border border-gray-200 text-gray-700 font-black text-sm uppercase tracking-widest rounded-2xl hover:bg-gray-100 transition-all">
                Upload Photo
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={(e) => handleFileUpload(e, 'profilePicture')}
                />
              </label>
            </div>
          </div>

          {/* Partner ID Card */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xl">
            <h3 className="text-lg font-black text-gray-900 mb-4">Partner ID Card</h3>
            <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-6 text-white shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center text-xl font-black">
                    C2K
                  </div>
                  <div>
                    <div className="text-xl font-black">{CONFIG.BRAND_NAME}</div>
                    <div className="text-[10px] uppercase tracking-widest opacity-80">Partner ID Card</div>
                  </div>
                </div>
                <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
                  {profile.profilePicture ? (
                    <img src={profile.profilePicture} className="h-full w-full rounded-xl object-cover" alt="" />
                  ) : (
                    '👤'
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="text-[10px] uppercase tracking-widest opacity-70 mb-1">Partner Name</div>
                  <div className="text-xl font-black">{profile.name || 'Your Name'}</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[10px] uppercase tracking-widest opacity-70 mb-1">Partner ID</div>
                    <div className="font-black">PTR-{profile._id?.slice(-6)?.toUpperCase() || '000000'}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-widest opacity-70 mb-1">Blood Group</div>
                    <div className="font-black">{profile.bloodGroup || 'Not Set'}</div>
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest opacity-70 mb-1">Business</div>
                  <div className="font-black truncate">{profile.businessName || 'Business Name'}</div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/20 flex items-center justify-between">
                <div className="text-[10px] uppercase tracking-widest opacity-70">
                  Since {new Date(profile.createdAt || Date.now()).getFullYear()}
                </div>
                <div className="flex items-center gap-2 text-emerald-300">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                  <span className="text-[11px] font-black uppercase tracking-widest">Active</span>
                </div>
              </div>
            </div>
            <button
              onClick={downloadIdCard}
              className="w-full mt-4 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black uppercase tracking-widest text-sm rounded-2xl shadow-lg shadow-indigo-200 hover:shadow-xl hover:-translate-y-1 transition-all"
            >
              Download ID Card
            </button>
          </div>
        </div>

        {/* Right Column - Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Details */}
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl">
            <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-3">
              <span className="h-10 w-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-lg">👤</span>
              Personal Details
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="text-[11px] font-black uppercase tracking-widest text-gray-500 ml-1 mb-2 block">Full Name</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="text-[11px] font-black uppercase tracking-widest text-gray-500 ml-1 mb-2 block">Email</label>
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="w-full bg-gray-100 border-none rounded-2xl px-5 py-4 text-sm font-bold text-gray-500 placeholder-gray-400 outline-none cursor-not-allowed"
                />
              </div>
              <div>
                <label className="text-[11px] font-black uppercase tracking-widest text-gray-500 ml-1 mb-2 block">Phone Number</label>
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  placeholder="+91 98765 43210"
                />
              </div>
              <div>
                <label className="text-[11px] font-black uppercase tracking-widest text-gray-500 ml-1 mb-2 block">Blood Group</label>
                <select
                  value={profile.bloodGroup}
                  onChange={(e) => setProfile({ ...profile, bloodGroup: e.target.value })}
                  className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                >
                  <option value="">Select Blood Group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
            </div>
          </div>

          {/* Change Password */}
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl">
            <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-3">
              <span className="h-10 w-10 rounded-2xl bg-purple-50 flex items-center justify-center text-lg">🔒</span>
              Change Password
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="text-[11px] font-black uppercase tracking-widest text-gray-500 ml-1 mb-2 block">Current Password</label>
                <input
                  type="password"
                  value={profile.password}
                  onChange={(e) => setProfile({ ...profile, password: e.target.value })}
                  className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="text-[11px] font-black uppercase tracking-widest text-gray-500 ml-1 mb-2 block">New Password</label>
                <input
                  type="password"
                  value={profile.newPassword}
                  onChange={(e) => setProfile({ ...profile, newPassword: e.target.value })}
                  className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          {/* Bank Details */}
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl">
            <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-3">
              <span className="h-10 w-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-lg">🏦</span>
              Bank Account Details
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="text-[11px] font-black uppercase tracking-widest text-gray-500 ml-1 mb-2 block">Account Holder Name</label>
                <input
                  type="text"
                  value={profile.bankAccount?.accountHolder}
                  onChange={(e) => setProfile({ ...profile, bankAccount: { ...profile.bankAccount, accountHolder: e.target.value } })}
                  className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="text-[11px] font-black uppercase tracking-widest text-gray-500 ml-1 mb-2 block">Account Number</label>
                <input
                  type="text"
                  value={profile.bankAccount?.accountNumber}
                  onChange={(e) => setProfile({ ...profile, bankAccount: { ...profile.bankAccount, accountNumber: e.target.value } })}
                  className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  placeholder="1234567890"
                />
              </div>
              <div>
                <label className="text-[11px] font-black uppercase tracking-widest text-gray-500 ml-1 mb-2 block">IFSC Code</label>
                <input
                  type="text"
                  value={profile.bankAccount?.ifscCode}
                  onChange={(e) => setProfile({ ...profile, bankAccount: { ...profile.bankAccount, ifscCode: e.target.value.toUpperCase() } })}
                  className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  placeholder="HDFC0001234"
                />
              </div>
              <div>
                <label className="text-[11px] font-black uppercase tracking-widest text-gray-500 ml-1 mb-2 block">Bank Name</label>
                <input
                  type="text"
                  value={profile.bankAccount?.bankName}
                  onChange={(e) => setProfile({ ...profile, bankAccount: { ...profile.bankAccount, bankName: e.target.value } })}
                  className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  placeholder="HDFC Bank"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-gray-500 ml-1 mb-2 block">Branch</label>
                <input
                  type="text"
                  value={profile.bankAccount?.branch}
                  onChange={(e) => setProfile({ ...profile, bankAccount: { ...profile.bankAccount, branch: e.target.value } })}
                  className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  placeholder="City Center Branch"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black uppercase tracking-widest text-sm rounded-2xl shadow-xl shadow-indigo-200 hover:shadow-xl hover:-translate-y-1 transition-all disabled:opacity-50"
          >
            {saving ? 'Saving Changes...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
