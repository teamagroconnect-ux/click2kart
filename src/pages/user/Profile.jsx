import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../lib/api';
import { useAuth } from '../../lib/AuthContext';
import { useToast } from '../../components/Toast';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getImageUrl } from '../../lib/cloudinary';

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh',
  'Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka',
  'Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram',
  'Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana',
  'Tripura','Uttar Pradesh','Uttarakhand','West Bengal',
  'Andaman and Nicobar Islands','Chandigarh','Dadra and Nagar Haveli',
  'Daman and Diu','Delhi','Jammu and Kashmir','Ladakh','Lakshadweep','Puducherry'
];

/* ── Icons ── */
const Ico = ({ n, cls = 'w-5 h-5' }) => {
  const d = {
    home:     'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
    user:     'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
    pkg:      'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
    heart:    'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
    gear:     'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426-1.756 2.924 0-3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.066c-.426-1.756-2.924-1.756-3.35 0a1.724 1.724 0 001.065-2.573c.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.066z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
    logout:   'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1',
    lock:     'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
    back:     'M10 19l-7-7m0 0l7-7m-7 7h18',
    chevL:    'M15 19l-7-7 7-7',
    chevR:    'M9 5l7 7-7 7',
  };
  return (
    <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
      {d[n]?.split(' M').map((seg, i) => (
        <path key={i} d={i === 0 ? seg : 'M' + seg} />
      ))}
    </svg>
  );
};

/* ── Avatar ── */
const Avatar = ({ user, size = 'md' }) => {
  const sz = { sm: 'w-9 h-9 text-sm', md: 'w-12 h-12 text-base', lg: 'w-16 h-16 text-xl' }[size];
  const avatarUrl = user?.kyc?.profilePicture;
  if (avatarUrl)
    return <img src={getImageUrl(avatarUrl) || avatarUrl} alt={user.name} className={`${sz} rounded-2xl object-cover ring-2 ring-white shadow-md`} />;
  return (
    <div className={`${sz} rounded-2xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center font-black text-white ring-2 ring-white shadow-md`}>
      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
    </div>
  );
};

/* ── Field ── */
const Field = ({ label, children }) => (
  <div>
    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">{label}</label>
    {children}
  </div>
);

const inputCls = 'w-full px-4 py-3 rounded-xl border border-violet-200 bg-white text-slate-800 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all placeholder:text-slate-300';
const disabledCls = 'w-full px-4 py-3 rounded-xl border border-slate-100 bg-slate-50 text-slate-400 font-semibold text-sm cursor-not-allowed';
const btnPrimary = 'w-full py-3.5 rounded-xl font-black text-sm text-white bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 active:scale-[0.98] transition-all shadow-lg shadow-violet-200 disabled:opacity-50 disabled:cursor-not-allowed';

/* ════════════════════════════════════════ MAIN COMPONENT ════════════════════════════════════════ */
export default function Profile() {
  const { user, token, refreshProfile } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeSection, setActiveSection] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [formData, setFormData] = useState({ 
    name: '', phone: '', dob: '',
    businessName: '', gstin: '', pan: '', panCard: '', aadhaarCard: '', addressLine1: '', addressLine2: '', 
    city: '', district: '', state: '', pincode: '', profilePicture: ''
  });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  useEffect(() => {
    if (!token) { navigate('/login', { state: { from: location.pathname } }); return; }
    loadProfile();
  }, [token]);

  const loadProfile = async () => {
    try {
      const { data } = await api.get('/api/user/me');
      setFormData({
        name: data.name || '', phone: data.phone || '', dob: data.dob ? new Date(data.dob).toISOString().split('T')[0] : '',
        businessName: data.kyc?.businessName || '', gstin: data.kyc?.gstin || '', pan: data.kyc?.pan || '',
        panCard: data.kyc?.panCard || '', aadhaarCard: data.kyc?.aadhaarCard || '',
        addressLine1: data.kyc?.addressLine1 || '', addressLine2: data.kyc?.addressLine2 || '',
        city: data.kyc?.city || '', district: data.kyc?.district || '', state: data.kyc?.state || '', 
        pincode: data.kyc?.pincode || '', profilePicture: data.kyc?.profilePicture || ''
      });
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleFileUpload = async (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      try {
        setSaving(true);
        const formDataUpload = new FormData();
        formDataUpload.append('file', file);
        const response = await api.post('/api/upload/image', formDataUpload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setFormData(p => ({ ...p, [fieldName]: response.data.url }));
        notify(`${fieldName} uploaded!`, 'success');
      } catch (err) {
        notify('Failed to upload file', 'error');
      } finally {
        setSaving(false);
      }
    }
  };

  const handleProfilePictureChange = (e) => handleFileUpload(e, 'profilePicture');
  const handlePanCardChange = (e) => handleFileUpload(e, 'panCard');
  const handleAadhaarCardChange = (e) => handleFileUpload(e, 'aadhaarCard');

  const handleSaveProfile = async (e) => {
    e.preventDefault(); 
    setSaving(true);
    try { 
      // Update personal info
      await api.put('/api/user/profile', { name: formData.name, phone: formData.phone, dob: formData.dob });
      // Update KYC/business info
      await api.put('/api/user/kyc', {
        businessName: formData.businessName,
        gstin: formData.gstin,
        pan: formData.pan,
        panCard: formData.panCard,
        aadhaarCard: formData.aadhaarCard,
        addressLine1: formData.addressLine1,
        addressLine2: formData.addressLine2,
        city: formData.city,
        district: formData.district,
        state: formData.state,
        pincode: formData.pincode,
        profilePicture: formData.profilePicture
      });
      await refreshProfile(); 
      notify('Profile updated!', 'success'); 
    }
    catch (e) { notify(e?.response?.data?.error || 'Failed to update', 'error'); }
    finally { setSaving(false); }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) { notify('Passwords don\'t match', 'error'); return; }
    if (passwordForm.newPassword.length < 6) { notify('Minimum 6 characters', 'error'); return; }
    setChangingPassword(true);
    try {
      await api.put('/api/user/change-password', { currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword });
      notify('Password changed!', 'success');
      setShowPasswordChange(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (e) { notify(e?.response?.data?.error || 'Failed', 'error'); }
    finally { setChangingPassword(false); }
  };

  const handleLogout = () => {
    localStorage.removeItem('token'); localStorage.removeItem('user'); navigate('/');
  };

  /* Nav config */
  const navItems = [
    { id: 'overview',   label: 'Overview',   icon: 'home'  },
    { id: 'personal',   label: 'Profile',    icon: 'user'  },
    { id: 'settings',   label: 'Settings',   icon: 'gear'  },
  ];

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-violet-50">
      <LoadingSpinner text="Loading profile…" />
    </div>
  );

  /* ════ RENDER ════ */
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800;900&family=DM+Sans:wght400;500;600&display=swap');

        .pf-root { font-family: 'DM Sans', system-ui, sans-serif; }
        .pf-display { font-family: 'Sora', system-ui, sans-serif; }

        @keyframes slideUp {
          from { opacity:0; transform:translateY(12px); }
          to   { opacity:1; transform:translateY(0);    }
        }
        .pf-panel { animation: slideUp 0.28s cubic-bezier(0.16,1,0.3,1) forwards; }

        /* hide scrollbar on mobile nav strip */
        .pf-nav-strip::-webkit-scrollbar { display:none; }
        .pf-nav-strip { -ms-overflow-style:none; scrollbar-width:none; }
      `}</style>

      <div className="pf-root min-h-screen bg-violet-50 pb-24 lg:pb-8">

        {/* ── TOP HEADER ── */}
        <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white">
          <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
            <button onClick={() => navigate('/')} className="p-2 rounded-xl hover:bg-white/10 transition-colors flex-shrink-0">
              <Ico n="back" cls="w-4 h-4" />
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black uppercase tracking-widest text-violet-200">My Account</p>
              <h1 className="pf-display font-black text-base leading-tight truncate">{user?.name || 'User'}</h1>
              {/* KYC Status Badge */}
              <div className="mt-1">
                {user?.isKycComplete ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-wider border border-emerald-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    KYC Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-600 text-[10px] font-bold uppercase tracking-wider border border-amber-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    KYC Pending
                  </span>
                )}
              </div>
            </div>
            <Avatar user={user} size="sm" />
          </div>

          {/* ── MOBILE: horizontal scrollable tab strip ── */}
          <div className="lg:hidden pf-nav-strip flex overflow-x-auto px-4 pb-0 gap-1">
            {navItems.map(({ id, label, icon }) => (
              <button key={id} onClick={() => setActiveSection(id)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold rounded-t-xl transition-all
                  ${activeSection === id
                    ? 'bg-violet-50 text-violet-600'
                    : 'text-violet-200 hover:text-white'}`}>
                <Ico n={icon} cls="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-5 lg:py-8 lg:flex lg:gap-6">

          {/* ── DESKTOP SIDEBAR ── */}
          <aside className="hidden lg:flex flex-col gap-3 w-56 flex-shrink-0">
            {/* User card */}
            <div className="bg-white rounded-2xl p-4 border border-violet-100 shadow-sm flex items-center gap-3">
              <Avatar user={user} size="md" />
              <div className="min-w-0">
                <div className="pf-display font-black text-slate-800 text-sm truncate">{user?.name}</div>
                <div className="text-[11px] text-slate-400 truncate">{user?.email}</div>
              </div>
            </div>

            {/* Nav */}
            <nav className="bg-white rounded-2xl border border-violet-100 shadow-sm overflow-hidden">
              {navItems.map(({ id, label, icon }) => (
                <button key={id} onClick={() => setActiveSection(id)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 text-sm font-semibold text-left transition-all border-l-2
                    ${activeSection === id
                      ? 'border-violet-600 bg-violet-50 text-violet-700'
                      : 'border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-800'}`}>
                  <Ico n={icon} cls="w-4 h-4 flex-shrink-0" />
                  {label}
                </button>
              ))}
              <div className="border-t border-slate-100">
                <button onClick={() => navigate('/orders')} className="w-full flex items-center gap-3 px-4 py-3.5 text-sm font-semibold text-left text-slate-600 hover:bg-slate-50 border-l-2 border-transparent transition-all">
                  <Ico n="pkg" cls="w-4 h-4 flex-shrink-0" /> My Orders
                </button>
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3.5 text-sm font-semibold text-left text-red-500 hover:bg-red-50 border-l-2 border-transparent transition-all">
                  <Ico n="logout" cls="w-4 h-4 flex-shrink-0" /> Logout
                </button>
              </div>
            </nav>
          </aside>

          {/* ── MAIN CONTENT ── */}
          <main className="flex-1 min-w-0">

            {/* ──── OVERVIEW ──── */}
            {activeSection === 'overview' && (
              <div className="pf-panel space-y-4">
                {/* Welcome card */}
                <div className="bg-gradient-to-br from-violet-600 to-purple-700 rounded-2xl p-5 text-white relative overflow-hidden">
                  <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                  <div className="absolute right-8 bottom-0 w-20 h-20 bg-white/5 rounded-full translate-y-1/2" />
                  <p className="text-violet-200 text-xs font-bold uppercase tracking-widest mb-1">Welcome back</p>
                  <h2 className="pf-display font-black text-2xl leading-tight mb-3">{user?.name?.split(' ')[0]} 👋</h2>
                  <p className="text-violet-200 text-sm">{user?.email}</p>
                </div>

                {/* Quick action grid */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'My Orders', sub: 'Track & manage', icon: 'pkg', color: 'bg-blue-50 text-blue-600', action: () => navigate('/orders') },
                    { label: 'Edit Profile', sub: 'Update details', icon: 'user', color: 'bg-emerald-50 text-emerald-600', action: () => setActiveSection('personal') },
                    { label: 'Settings', sub: 'Account settings', icon: 'gear', color: 'bg-violet-50 text-violet-600', action: () => setActiveSection('settings') },
                  ].map(({ label, sub, icon, color, action }) => (
                    <button key={label} onClick={action}
                      className="bg-white rounded-2xl p-4 border border-violet-100 shadow-sm hover:shadow-md hover:border-violet-200 active:scale-[0.97] transition-all text-left">
                      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}>
                        <Ico n={icon} cls="w-5 h-5" />
                      </div>
                      <div className="pf-display font-black text-slate-800 text-sm">{label}</div>
                      <div className="text-slate-400 text-xs mt-0.5">{sub}</div>
                    </button>
                  ))}
                </div>

                {/* Profile summary */}
                <div className="bg-white rounded-2xl p-4 border border-violet-100 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="pf-display font-black text-slate-800 text-sm">Profile Info</h3>
                    <button onClick={() => setActiveSection('personal')} className="text-violet-600 text-xs font-bold hover:underline">Edit →</button>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 flex-shrink-0">
                        <Ico n="user" cls="w-4 h-4" />
                      </div>
                      <span className="text-slate-600 font-medium">{user?.name || '—'}</span>
                    </div>
                    {user?.phone && (
                      <div className="flex items-center gap-3 text-sm">
                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 flex-shrink-0">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                        </div>
                        <span className="text-slate-600 font-medium">{user.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Mobile logout */}
                <div className="lg:hidden">
                  <button onClick={handleLogout}
                    className="w-full bg-white rounded-2xl p-4 border border-red-100 shadow-sm text-red-500 font-bold text-sm flex items-center justify-center gap-2 hover:bg-red-50 active:scale-[0.98] transition-all">
                    <Ico n="logout" cls="w-4 h-4" /> Sign Out
                  </button>
                </div>
              </div>
            )}

            {/* ──── PERSONAL ──── */}
            {activeSection === 'personal' && (
              <div className="pf-panel bg-white rounded-2xl border border-violet-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-violet-100">
                  <h2 className="pf-display font-black text-slate-800">Personal & Business Info</h2>
                  <p className="text-slate-400 text-xs mt-0.5">Update your details</p>
                </div>
                <form onSubmit={handleSaveProfile} className="p-5 space-y-4">
                  {/* Profile Picture */}
                  <div className="flex items-center gap-6">
                    <div className="relative group">
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center text-white text-3xl font-black border-4 border-violet-100 overflow-hidden">
                        {formData.profilePicture ? (
                          <img src={getImageUrl(formData.profilePicture) || formData.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          user?.name?.charAt(0)?.toUpperCase() || 'U'
                        )}
                      </div>
                      <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-2xl">
                        <Ico n="user" cls="w-8 h-8 text-white" />
                        <input type="file" accept="image/*" className="hidden" onChange={handleProfilePictureChange} />
                      </label>
                    </div>
                    <div>
                      <div className="font-bold text-slate-800">Profile Picture</div>
                      <div className="text-xs text-slate-400 mt-1">Click to change photo</div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <Field label="Full Name">
                      <input type="text" name="name" value={formData.name}
                        onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                        className={inputCls} placeholder="Your full name" />
                    </Field>
                    <Field label="Email Address">
                      <input type="email" value={user?.email || ''} disabled className={disabledCls} />
                    </Field>
                    <Field label="Date of Birth">
                      <input type="date" name="dob" value={formData.dob}
                        onChange={e => setFormData(p => ({ ...p, dob: e.target.value }))}
                        className={inputCls} />
                    </Field>
                    <Field label="Phone Number">
                      <input type="tel" name="phone" value={formData.phone}
                        onChange={e => setFormData(p => ({ ...p, phone: e.target.value.replace(/\D/g,'').slice(0,10) }))}
                        className={inputCls} placeholder="10-digit mobile number" />
                    </Field>
                    <Field label="Business Name">
                      <input type="text" value={formData.businessName}
                        onChange={e => setFormData(p => ({ ...p, businessName: e.target.value }))}
                        className={inputCls} placeholder="Your business name" />
                    </Field>
                    <Field label="GSTIN">
                      <input type="text" value={formData.gstin}
                        onChange={e => setFormData(p => ({ ...p, gstin: e.target.value }))}
                        className={inputCls} placeholder="22ABCDE1234F1Z5" />
                    </Field>
                    <Field label="PAN">
                      <input type="text" value={formData.pan}
                        onChange={e => setFormData(p => ({ ...p, pan: e.target.value }))}
                        className={inputCls} placeholder="ABCDE1234F" />
                    </Field>
                  </div>

                  {/* Document uploads */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <Field label="PAN Card (Upload)">
                      <div className="relative group">
                        {formData.panCard ? (
                          <div className="w-full h-40 rounded-xl border-2 border-dashed border-violet-200 bg-violet-50 flex items-center justify-center overflow-hidden">
                            <img src={getImageUrl(formData.panCard) || formData.panCard} alt="PAN Card" className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-full h-40 rounded-xl border-2 border-dashed border-violet-200 bg-violet-50 flex flex-col items-center justify-center cursor-pointer hover:border-violet-400 transition-colors">
                            <Ico n="user" cls="w-8 h-8 text-violet-400 mb-2" />
                            <div className="text-xs text-violet-500 font-semibold">Click to upload PAN Card</div>
                          </div>
                        )}
                        <label className="absolute inset-0 cursor-pointer rounded-xl">
                          <input type="file" accept="image/*" className="hidden" onChange={handlePanCardChange} />
                        </label>
                      </div>
                    </Field>

                    <Field label="Aadhaar Card (Upload)">
                      <div className="relative group">
                        {formData.aadhaarCard ? (
                          <div className="w-full h-40 rounded-xl border-2 border-dashed border-violet-200 bg-violet-50 flex items-center justify-center overflow-hidden">
                            <img src={getImageUrl(formData.aadhaarCard) || formData.aadhaarCard} alt="Aadhaar Card" className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-full h-40 rounded-xl border-2 border-dashed border-violet-200 bg-violet-50 flex flex-col items-center justify-center cursor-pointer hover:border-violet-400 transition-colors">
                            <Ico n="user" cls="w-8 h-8 text-violet-400 mb-2" />
                            <div className="text-xs text-violet-500 font-semibold">Click to upload Aadhaar Card</div>
                          </div>
                        )}
                        <label className="absolute inset-0 cursor-pointer rounded-xl">
                          <input type="file" accept="image/*" className="hidden" onChange={handleAadhaarCardChange} />
                        </label>
                      </div>
                    </Field>
                  </div>
                  <Field label="Address Line 1">
                    <textarea name="addressLine1" value={formData.addressLine1}
                      onChange={e => setFormData(p => ({ ...p, addressLine1: e.target.value }))}
                      className={inputCls} placeholder="Street address" rows={2} />
                  </Field>
                  <Field label="Address Line 2">
                    <textarea name="addressLine2" value={formData.addressLine2}
                      onChange={e => setFormData(p => ({ ...p, addressLine2: e.target.value }))}
                      className={inputCls} placeholder="Landmark, area (optional)" rows={2} />
                  </Field>
                  <div className="grid md:grid-cols-4 gap-4">
                    <Field label="City">
                      <input type="text" name="city" value={formData.city}
                        onChange={e => setFormData(p => ({ ...p, city: e.target.value }))}
                        className={inputCls} placeholder="City" />
                    </Field>
                    <Field label="District">
                      <input type="text" name="district" value={formData.district}
                        onChange={e => setFormData(p => ({ ...p, district: e.target.value }))}
                        className={inputCls} placeholder="District" />
                    </Field>
                    <Field label="State">
                      <select name="state" value={formData.state}
                        onChange={e => setFormData(p => ({ ...p, state: e.target.value }))}
                        className={inputCls}
                      >
                        <option value="">Select State</option>
                        {INDIAN_STATES.map(state => <option key={state} value={state}>{state}</option>)}
                      </select>
                    </Field>
                    <Field label="Pincode">
                      <input type="text" name="pincode" value={formData.pincode}
                        onChange={e => setFormData(p => ({ ...p, pincode: e.target.value.replace(/\D/g,'').slice(0,6) }))}
                        className={inputCls} placeholder="Pincode" />
                    </Field>
                  </div>
                  <button type="submit" disabled={saving} className={btnPrimary}>
                    {saving ? 'Saving…' : 'Save Changes'}
                  </button>
                </form>
              </div>
            )}

            {/* ──── SETTINGS ──── */}
            {activeSection === 'settings' && (
              <div className="pf-panel space-y-3">
                <div>
                  <h2 className="pf-display font-black text-slate-800">Settings</h2>
                  <p className="text-slate-400 text-xs mt-0.5">Security & account preferences</p>
                </div>

                {!showPasswordChange ? (
                  <button onClick={() => setShowPasswordChange(true)}
                    className="w-full bg-white rounded-2xl border border-violet-100 shadow-sm p-4 text-left flex items-center gap-3 hover:border-violet-200 hover:shadow-md active:scale-[0.98] transition-all">
                    <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center flex-shrink-0">
                      <Ico n="lock" cls="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="pf-display font-black text-slate-800 text-sm">Change Password</div>
                      <div className="text-slate-400 text-xs mt-0.5">Update your account credentials</div>
                    </div>
                    <Ico n="chevR" cls="w-4 h-4 text-slate-300" />
                  </button>
                ) : (
                  <div className="bg-white rounded-2xl border border-violet-100 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-violet-100 flex items-center gap-3">
                      <button onClick={() => { setShowPasswordChange(false); setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' }); }}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                        <Ico n="chevL" cls="w-4 h-4" />
                      </button>
                      <h3 className="pf-display font-black text-slate-800 text-sm">Change Password</h3>
                    </div>
                    <form onSubmit={handlePasswordUpdate} className="p-5 space-y-4">
                      <Field label="Current Password">
                        <input type="password" name="currentPassword" value={passwordForm.currentPassword}
                          onChange={e => setPasswordForm(p => ({ ...p, currentPassword: e.target.value }))}
                          className={inputCls} placeholder="Current password" />
                      </Field>
                      <Field label="New Password">
                        <input type="password" name="newPassword" value={passwordForm.newPassword}
                          onChange={e => setPasswordForm(p => ({ ...p, newPassword: e.target.value }))}
                          className={inputCls} placeholder="At least 6 characters" />
                      </Field>
                      <Field label="Confirm Password">
                        <input type="password" name="confirmPassword" value={passwordForm.confirmPassword}
                          onChange={e => setPasswordForm(p => ({ ...p, confirmPassword: e.target.value }))}
                          className={inputCls} placeholder="Repeat new password" />
                      </Field>
                      {passwordForm.newPassword && passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword && (
                        <p className="text-red-500 text-xs font-semibold">Passwords don't match</p>
                      )}
                      <button type="submit"
                        disabled={changingPassword || passwordForm.newPassword !== passwordForm.confirmPassword || !passwordForm.newPassword}
                        className={btnPrimary}>
                        {changingPassword ? 'Updating…' : 'Update Password'}
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
  );
}
