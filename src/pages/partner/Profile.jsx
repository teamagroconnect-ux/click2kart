import React, { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import { QRCodeSVG } from 'qrcode.react';
import api from '../../lib/api';
import { useToast } from '../../components/Toast';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getImageUrl } from '../../lib/cloudinary';
import logoImg from '../../click2kart.png';
import { CONFIG } from '../../shared/lib/config';

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
    map:      'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0',
    pkg:      'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
    heart:    'M4.318 6.318a4.5 4.0 0 000 6.364L12 20.364l7.682-7.682a4.5 4.0 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.0 0 00-6.364 0z',
    help:     'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    gear:     'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426-1.756 2.924 0-3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.066c-.426-1.756-2.924-1.756-3.35 0a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0',
    logout:   'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1',
    lock:     'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
    plus:     'M12 4v16m8-8H4',
    back:     'M10 19l-7-7m0 0l7-7m-7 7h18',
    chevL:    'M15 19l-7-7 7-7',
    chevR:    'M9 5l7 7-7 7',
    edit:     'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
    trash:    'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
    close:    'M6 18L18 6M6 6l12 12',
    send:     'M12 19l9 2-9-18-9 18 9-2zm0 0v-8',
    check:    'M5 13l4 4L19 7',
    download: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4'
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
const Avatar = ({ partner, size = 'md' }) => {
  const sz = { sm: 'w-9 h-9 text-sm', md: 'w-12 h-12 text-base', lg: 'w-16 h-16 text-xl' }[size];
  if (partner?.profilePicture)
    return <img src={getImageUrl(partner.profilePicture)} alt={partner.name} className={`${sz} rounded-2xl object-cover ring-2 ring-white shadow-md`} />;
  return (
    <div className={`${sz} rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center font-black text-white ring-2 ring-white shadow-md`}>
      {partner?.name?.charAt(0)?.toUpperCase() || 'P'}
    </div>
  );
};

/* ── Partner ID Card Component ── */
const PartnerIDCard = React.forwardRef(({ partner }, ref) => {
  // Format address into 1 line
  const addressLine = [partner?.address, partner?.city, partner?.district, partner?.state, partner?.pincode]
    .filter(Boolean)
    .join(', ');
  
  // Get joining date (placeholder for now, can be replaced with actual data from backend)
  const joiningDate = partner?.createdAt 
    ? new Date(partner.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : 'Date not available';
  
  return (
    <div ref={ref} className="bg-white rounded-3xl shadow-2xl overflow-hidden relative max-w-5xl mx-auto" style={{ aspectRatio: '1.586/1' }}>
      {/* Left Section - White Background */}
      <div className="flex h-full">
        {/* Left Panel (70%) */}
        <div className="w-3/5 bg-white p-8 relative overflow-hidden">
          {/* Background patterns (subtle) */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-indigo-100/50 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative z-10 h-full flex flex-col justify-between">
            {/* Logo Section */}
            <div className="flex items-center gap-6 mb-6">
              <div className="h-20 w-auto">
                <img src={logoImg} alt={CONFIG.BRAND_NAME} className="h-full w-auto" />
              </div>
              <div className="flex flex-col gap-1">
                <h2 className="text-4xl font-black text-indigo-900 leading-tight">
                  Click<span className="text-orange-500">2</span><span className="text-green-600">kart</span>
                </h2>
                <p className="text-gray-500 text-sm font-medium">Indian's trusted b2b hub</p>
                <p className="text-gray-600 font-semibold text-sm flex items-center gap-2">
                  🌐 click2kart.net
                </p>
              </div>
            </div>
            
            {/* Partner Photo and Details */}
            <div className="flex items-start gap-8 mb-8">
              {/* Photo */}
              <div className="flex-shrink-0">
                {partner?.profilePicture ? (
                  <img 
                    src={getImageUrl(partner.profilePicture)} 
                    alt={partner?.name} 
                    className="h-48 w-48 rounded-2xl object-cover border-4 border-indigo-100 shadow-lg"
                  />
                ) : (
                  <div className="h-48 w-48 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center border-4 border-indigo-100 shadow-lg">
                    <div className="text-7xl font-black text-white">
                      {partner?.name?.charAt(0)?.toUpperCase() || 'P'}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Name and Info */}
              <div className="flex flex-col justify-center">
                <h1 className="text-4xl font-black text-gray-900 leading-tight mb-4">
                  {(partner?.name || 'PARTNER NAME').toUpperCase()}
                </h1>
                {partner?.kycVerified && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-indigo-700 text-white rounded-full border border-indigo-600 mb-4 w-fit">
                    <span className="text-lg">✅</span>
                    <span className="font-bold uppercase tracking-widest">Verified Partner</span>
                  </div>
                )}
                
                <div className="space-y-3">
                  {partner?.email && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700">
                        ✉️
                      </div>
                      <span className="text-gray-700 font-semibold text-lg">{partner.email}</span>
                    </div>
                  )}
                  {partner?.phone && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700">
                        📞
                      </div>
                      <span className="text-gray-700 font-semibold text-lg">{partner.phone}</span>
                    </div>
                  )}
                  {addressLine && (
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 mt-1">
                        �
                      </div>
                      <span className="text-gray-700 font-semibold text-lg leading-snug">{addressLine}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* QR and Trust Badges */}
            <div className="flex items-center gap-8 mt-auto">
              <div className="flex items-center gap-4">
                <div className="w-32 h-32 border-2 border-gray-300 rounded-2xl flex items-center justify-center bg-white p-2">
                  <QRCodeSVG 
                    value={`${window.location.origin}/partner/verify/${partner?._id || ''}`}
                    size="100%"
                    level="H"
                  />
                </div>
                <div className="text-gray-700 font-medium text-sm">Scan to verify<br/>partner details</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Panel (30%) - Blue Gradient Background */}
        <div className="w-2/5 bg-gradient-to-br from-indigo-800 to-indigo-900 text-white p-8 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10" style={{ 
            backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', 
            backgroundSize: '20px 20px' 
          }} />
          
          <div className="relative z-10 h-full flex flex-col justify-between">
            {/* Top Right - ID Card Year */}
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-4 text-center mb-8">
              <div className="text-2xl font-medium mb-1">ID CARD</div>
              <div className="text-4xl font-black">{new Date().getFullYear()}</div>
            </div>
            
            {/* Details List */}
            <div className="space-y-6 mb-8">
              {/* Blood Group */}
              {partner?.bloodGroup && (
                <div className="space-y-2 border-b border-white/20 pb-4">
                  <div className="text-gray-300 font-semibold text-lg flex items-center gap-2">
                    💧 BLOOD GROUP
                  </div>
                  <div className="text-2xl font-black">{partner.bloodGroup}</div>
                </div>
              )}
              
              {/* Joining Date */}
              <div className="space-y-2 border-b border-white/20 pb-4">
                <div className="text-gray-300 font-semibold text-lg flex items-center gap-2">
                  🗓️ JOINING DATE
                </div>
                <div className="text-2xl font-black">{joiningDate}</div>
              </div>
              
              {/* Partner ID */}
              <div className="space-y-2 border-b border-white/20 pb-4">
                <div className="text-gray-300 font-semibold text-lg flex items-center gap-2">
                  🛡️ PARTNER ID
                </div>
                <div className="text-2xl font-black font-mono">{partner?._id?.slice(-8) || '--------'}</div>
              </div>
              
              {/* Invite Code */}
              <div className="space-y-2">
                <div className="text-gray-300 font-semibold text-lg flex items-center gap-2">
                  🎁 INVITE CODE
                </div>
                <div className="text-3xl font-black">{partner?.inviteCode || '----'}</div>
              </div>
            </div>
            
            {/* Signature Area */}
            <div className="mt-auto text-right">
              <div className="text-3xl font-serif italic opacity-70 mb-2">Authorised</div>
              <div className="text-lg font-semibold">Click2kart</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Trust Badges at Bottom */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-br from-indigo-50 to-white/95 backdrop-blur-sm p-4 border-t-2 border-indigo-200">
        <div className="flex items-center justify-center gap-8">
          <div className="flex items-center gap-3 px-6 py-2 rounded-2xl border border-indigo-300 bg-white/50">
            <span className="text-3xl">🏆</span>
            <div className="font-semibold text-gray-700">Trusted Network</div>
          </div>
          <div className="flex items-center gap-3 px-6 py-2 rounded-2xl border border-indigo-300 bg-white/50">
            <span className="text-3xl">🤝</span>
            <div className="font-semibold text-gray-700">Genuine Partners</div>
          </div>
          <div className="flex items-center gap-3 px-6 py-2 rounded-2xl border border-indigo-300 bg-white/50">
            <span className="text-3xl">🔐</span>
            <div className="font-semibold text-gray-700">Secure Transactions</div>
          </div>
          <div className="flex items-center gap-3 px-6 py-2 rounded-2xl border border-indigo-300 bg-white/50">
            <span className="text-3xl">🎧</span>
            <div className="font-semibold text-gray-700">24x7 Support</div>
          </div>
        </div>
      </div>
    </div>
  );
});

/* ── Field ── */
const Field = ({ label, children }) => (
  <div>
    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">{label}</label>
    {children}
  </div>
);

const inputCls = 'w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-white text-slate-800 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-slate-300';
const disabledCls = 'w-full px-4 py-3.5 rounded-xl border border-slate-100 bg-slate-50 text-slate-400 font-semibold text-sm cursor-not-allowed';
const btnPrimary = 'w-full py-3.5 rounded-xl font-black text-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 active:scale-[0.98] transition-all shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed';
const btnOutline = 'flex-1 py-3.5 rounded-xl font-bold text-sm border border-slate-200 text-slate-600 hover:bg-slate-50 active:scale-[0.98] transition-all';

/* ════════════════════════════════════════ MAIN COMPONENT ════════════════════════════════════════ */
export default function PartnerProfile() {
  const { notify } = useToast();
  const idCardRef = useRef(null);
  
  const [activeSection, setActiveSection] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [partner, setPartner] = useState(null);
  const [formData, setFormData] = useState({
    name: '', phone: '', bloodGroup: '', address: '', city: '', district: '', state: '', pincode: '', profilePicture: ''
  });
  const [bankForm, setBankForm] = useState({ accountHolder: '', accountNumber: '', ifscCode: '', bankName: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  useEffect(() => {
    loadPartner();
  }, []);

  const loadPartner = async () => {
    try {
      const { data } = await api.get('/api/partner/me');
      setPartner(data);
      setFormData({
        name: data.name || '',
        phone: data.phone || '',
        bloodGroup: data.bloodGroup || '',
        address: data.address || '',
        city: data.city || '',
        district: data.district || '',
        state: data.state || '',
        pincode: data.pincode || '',
        profilePicture: data.profilePicture || ''
      });
      setBankForm({
        accountHolder: data.bankAccount?.accountHolder || '',
        accountNumber: data.bankAccount?.accountNumber || '',
        ifscCode: data.bankAccount?.ifscCode || '',
        bankName: data.bankAccount?.bankName || ''
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePictureChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        setSaving(true);
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post('/api/upload/image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setFormData(p => ({ ...p, profilePicture: response.data.url }));
        notify('Profile picture uploaded!', 'success');
      } catch (err) {
        notify('Failed to upload profile picture', 'error');
      } finally {
        setSaving(false);
      }
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put('/api/partner/profile', formData);
      setPartner(data);
      notify('Profile updated!', 'success');
    } catch (e) {
      notify(e?.response?.data?.error || 'Failed to update', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveBankDetails = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put('/api/partner/profile', { bankAccount: bankForm });
      setPartner(data);
      notify('Bank details updated!', 'success');
    } catch (e) {
      notify(e?.response?.data?.error || 'Failed to update', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      notify('Passwords do not match', 'error');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      notify('Minimum 6 characters', 'error');
      return;
    }
    setChangingPassword(true);
    try {
      await api.put('/api/partner/change-password', passwordForm);
      notify('Password changed!', 'success');
      setShowPasswordChange(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (e) {
      notify(e?.response?.data?.error || 'Failed', 'error');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleDownloadID = async () => {
    if (!idCardRef.current) return;
    try {
      const canvas = await html2canvas(idCardRef.current, {
        scale: 2,
        backgroundColor: null,
        useCORS: true,
      });
      const link = document.createElement('a');
      link.download = `partner-id-card-${partner?._id || 'partner'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      notify('ID card downloaded!', 'success');
    } catch (e) {
      console.error(e);
      notify('Failed to download ID card', 'error');
    }
  };

  /* Nav config */
  const navItems = [
    { id: 'overview',   label: 'Overview',   icon: 'home'  },
    { id: 'profile',    label: 'Profile',    icon: 'user'  },
    { id: 'bank',       label: 'Bank Details', icon: 'gear' },
    { id: 'settings',   label: 'Settings',   icon: 'lock'  },
  ];

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <LoadingSpinner text="Loading profile…" />
    </div>
  );

  /* ════ RENDER ════ */
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-black text-gray-900 mb-2">Partner Profile</h1>
        <p className="text-gray-500">Manage your profile and account details</p>
      </div>

      {/* Section nav */}
      <div className="flex overflow-x-auto gap-2 pb-2">
        {navItems.map(({ id, label, icon }) => (
          <button
            key={id}
            onClick={() => setActiveSection(id)}
            className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all border
              ${activeSection === id
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-transparent shadow-lg shadow-indigo-200'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
          >
            <Ico n={icon} cls="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* ──── OVERVIEW ──── */}
      {activeSection === 'overview' && (
        <div className="space-y-6">
          {/* Welcome card */}
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white relative overflow-hidden">
            <div className="absolute right-0 top-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute right-12 bottom-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2" />
            <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest mb-1">Welcome back</p>
            <h2 className="font-black text-2xl leading-tight mb-3">{partner?.name?.split(' ')[0]}</h2>
            <p className="text-indigo-200 text-sm">{partner?.email}</p>
            {partner?.kycVerified && (
              <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                KYC Verified
              </div>
            )}
          </div>

          {/* Quick action grid */}
          <div className="grid md:grid-cols-3 gap-4">
            <button 
              onClick={() => setActiveSection('profile')}
              className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 active:scale-[0.97] transition-all text-left"
            >
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                <Ico n="user" cls="w-6 h-6" />
              </div>
              <div className="font-black text-gray-800 text-sm">Edit Profile</div>
              <div className="text-gray-400 text-xs mt-1">Update your details</div>
            </button>
            <button 
              onClick={() => setActiveSection('bank')}
              className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 active:scale-[0.97] transition-all text-left"
            >
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
                <Ico n="gear" cls="w-6 h-6" />
              </div>
              <div className="font-black text-gray-800 text-sm">Bank Details</div>
              <div className="text-gray-400 text-xs mt-1">Payment information</div>
            </button>
            <button 
              onClick={() => setActiveSection('settings')}
              className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 active:scale-[0.97] transition-all text-left"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                <Ico n="lock" cls="w-6 h-6" />
              </div>
              <div className="font-black text-gray-800 text-sm">Settings</div>
              <div className="text-gray-400 text-xs mt-1">Account preferences</div>
            </button>
          </div>

          {/* Partner ID Card */}
          <div className="space-y-4">
            <PartnerIDCard ref={idCardRef} partner={partner} />
            <button
              onClick={handleDownloadID}
              className="w-full py-4 rounded-xl font-black text-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 active:scale-[0.98] transition-all shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Ico n="download" cls="w-5 h-5" />
              Download ID Card
            </button>
          </div>
        </div>
      )}

      {/* ──── PROFILE ──── */}
      {activeSection === 'profile' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100">
            <h2 className="font-black text-gray-800">Personal Information</h2>
            <p className="text-gray-400 text-xs mt-1">Update your personal details</p>
          </div>
          <form onSubmit={handleSaveProfile} className="p-6 space-y-5">
            {/* Profile Picture */}
            <div className="flex items-center gap-6">
              <div className="relative group">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white text-4xl font-black border-4 border-gray-100 overflow-hidden">
                  {formData.profilePicture ? (
                    <img src={getImageUrl(formData.profilePicture) || formData.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    partner?.name?.charAt(0)?.toUpperCase() || 'P'
                  )}
                </div>
                <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-2xl">
                  <Ico n="user" cls="w-8 h-8 text-white" />
                  <input type="file" accept="image/*" className="hidden" onChange={handleProfilePictureChange} />
                </label>
              </div>
              <div>
                <div className="font-bold text-gray-800">Profile Picture</div>
                <div className="text-xs text-gray-400 mt-1">Click to change your photo</div>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-5">
              <Field label="Full Name">
                <input type="text" name="name" value={formData.name}
                  onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                  className={inputCls} placeholder="Your full name" />
              </Field>
              <Field label="Email Address">
                <input type="email" value={partner?.email || ''} disabled className={disabledCls} />
              </Field>
              <Field label="Phone Number">
                <input type="tel" name="phone" value={formData.phone}
                  onChange={e => setFormData(p => ({ ...p, phone: e.target.value.replace(/\D/g,'').slice(0,10) }))}
                  className={inputCls} placeholder="10-digit mobile number" />
              </Field>
              <Field label="Blood Group">
                <select 
                  name="bloodGroup" 
                  value={formData.bloodGroup}
                  onChange={e => setFormData(p => ({ ...p, bloodGroup: e.target.value }))}
                  className={inputCls}
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
              </Field>
            </div>
            <Field label="Address">
              <textarea 
                name="address" 
                value={formData.address}
                onChange={e => setFormData(p => ({ ...p, address: e.target.value }))}
                className={inputCls} 
                placeholder="Street address"
                rows={3}
              />
            </Field>
            <div className="grid md:grid-cols-4 gap-5">
              <Field label="City">
                <input 
                  type="text" 
                  name="city" 
                  value={formData.city}
                  onChange={e => setFormData(p => ({ ...p, city: e.target.value }))}
                  className={inputCls} 
                  placeholder="City"
                />
              </Field>
              <Field label="District">
                <input 
                  type="text" 
                  name="district" 
                  value={formData.district}
                  onChange={e => setFormData(p => ({ ...p, district: e.target.value }))}
                  className={inputCls} 
                  placeholder="District"
                />
              </Field>
              <Field label="State">
                <select 
                  name="state" 
                  value={formData.state}
                  onChange={e => setFormData(p => ({ ...p, state: e.target.value }))}
                  className={inputCls}
                >
                  <option value="">Select State</option>
                  {INDIAN_STATES.map(state => <option key={state} value={state}>{state}</option>)}
                </select>
              </Field>
              <Field label="Pincode">
                <input 
                  type="text" 
                  name="pincode" 
                  value={formData.pincode}
                  onChange={e => setFormData(p => ({ ...p, pincode: e.target.value.replace(/\D/g,'').slice(0,6) }))}
                  className={inputCls} 
                  placeholder="Pincode"
                />
              </Field>
            </div>
            <button type="submit" disabled={saving} className={btnPrimary}>
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </form>
        </div>
      )}

      {/* ──── BANK DETAILS ──── */}
      {activeSection === 'bank' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100">
            <h2 className="font-black text-gray-800">Bank Details</h2>
            <p className="text-gray-400 text-xs mt-1">Update your payment information</p>
          </div>
          <form onSubmit={handleSaveBankDetails} className="p-6 space-y-5">
            <Field label="Account Holder Name">
              <input type="text" value={bankForm.accountHolder}
                onChange={e => setBankForm(p => ({ ...p, accountHolder: e.target.value }))}
                className={inputCls} placeholder="Account holder name" />
            </Field>
            <div className="grid md:grid-cols-2 gap-5">
              <Field label="Account Number">
                <input type="text" value={bankForm.accountNumber}
                  onChange={e => setBankForm(p => ({ ...p, accountNumber: e.target.value }))}
                  className={inputCls} placeholder="Account number" />
              </Field>
              <Field label="IFSC Code">
                <input type="text" value={bankForm.ifscCode}
                  onChange={e => setBankForm(p => ({ ...p, ifscCode: e.target.value.toUpperCase() }))}
                  className={inputCls} placeholder="IFSC code" />
              </Field>
            </div>
            <Field label="Bank Name">
              <input type="text" value={bankForm.bankName}
                onChange={e => setBankForm(p => ({ ...p, bankName: e.target.value }))}
                className={inputCls} placeholder="Bank name" />
            </Field>
            <button type="submit" disabled={saving} className={btnPrimary}>
              {saving ? 'Saving…' : 'Save Bank Details'}
            </button>
          </form>
        </div>
      )}

      {/* ──── SETTINGS ──── */}
      {activeSection === 'settings' && (
        <div className="space-y-4">
          <div>
            <h2 className="font-black text-gray-800">Settings</h2>
            <p className="text-gray-400 text-xs mt-1">Security and account preferences</p>
          </div>

          {!showPasswordChange ? (
            <button onClick={() => setShowPasswordChange(true)}
              className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-left flex items-center gap-4 hover:border-gray-200 hover:shadow-md active:scale-[0.98] transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
                <Ico n="lock" cls="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="font-black text-gray-800 text-sm">Change Password</div>
                <div className="text-gray-400 text-xs mt-1">Update your account credentials</div>
              </div>
              <Ico n="chevR" cls="w-5 h-5 text-gray-300" />
            </button>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
                <button onClick={() => { setShowPasswordChange(false); setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' }); }}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <Ico n="chevL" cls="w-5 h-5" />
                </button>
                <h3 className="font-black text-gray-800 text-sm">Change Password</h3>
              </div>
              <form onSubmit={handlePasswordUpdate} className="p-6 space-y-5">
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
                  className={btnPrimary}
                >
                  {changingPassword ? 'Updating…' : 'Update Password'}
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
