import React, { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import QRCode from 'react-qr-code';
import api from '../../lib/api';
import { useToast } from '../../components/Toast';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getImageUrl } from '../../lib/cloudinary';
const logoImg = '/layoutlogo.png';
const appIcon = '/app-icon.png';
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
    gear:     'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0',
    lock:     'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
    chevL:    'M15 19l-7-7 7-7',
    chevR:    'M9 5l7 7-7 7',
    download: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4',
  };
  return (
    <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
      {d[n]?.split(' M').map((seg, i) => (
        <path key={i} d={i === 0 ? seg : 'M' + seg} />
      ))}
    </svg>
  );
};

/* ── Digital Seal SVG (replaces signature) ── */
const DigitalSeal = () => (
  <svg width="90" height="90" viewBox="0 0 90 90" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Outer ring */}
    <circle cx="45" cy="45" r="43" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeDasharray="4 3" />
    {/* Middle ring */}
    <circle cx="45" cy="45" r="35" stroke="rgba(255,255,255,0.55)" strokeWidth="1" />
    {/* Inner fill */}
    <circle cx="45" cy="45" r="28" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
    {/* Shield icon */}
    <path d="M45 20 L58 26 L58 40 Q58 52 45 58 Q32 52 32 40 L32 26 Z" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.6)" strokeWidth="1.2" />
    {/* Checkmark */}
    <path d="M38 40 L43 45 L53 35" stroke="rgba(255,255,255,0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    {/* Text on arc - top */}
    <path id="topArc" d="M 10,45 A 35,35 0 0,1 80,45" fill="none" />
    <text fontSize="6.5" fontWeight="700" fill="rgba(255,255,255,0.65)" letterSpacing="2.2" fontFamily="Inter,sans-serif">
      <textPath href="#topArc" startOffset="10%">AUTHORISED  •  CLICK2KART</textPath>
    </text>
    {/* Text on arc - bottom */}
    <path id="botArc" d="M 10,45 A 35,35 0 0,0 80,45" fill="none" />
    <text fontSize="6" fontWeight="600" fill="rgba(255,255,255,0.5)" letterSpacing="1.8" fontFamily="Inter,sans-serif">
      <textPath href="#botArc" startOffset="12%">VERIFIED  PARTNER  •  {new Date().getFullYear()}</textPath>
    </text>
  </svg>
);

/* ── Partner ID Card ── */
const PartnerIDCard = React.forwardRef(({ partner }, ref) => {
  const addressLine = [partner?.address, partner?.city, partner?.district, partner?.state, partner?.pincode]
    .filter(Boolean).join(', ');

  const fmt = (val) => {
    if (!val) return null;
    return new Date(val).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const joiningDate = fmt(partner?.createdAt);
  const dob = fmt(partner?.dob);
  const year = new Date().getFullYear();

  return (
    <div
      ref={ref}
      style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}
      className="relative w-full overflow-hidden rounded-2xl shadow-2xl bg-white"
      /* Fixed aspect ratio for consistent download */
      /* We use a flex row layout */
    >
      <div className="flex" style={{ minHeight: '380px' }}>

        {/* ── LEFT PANEL ── */}
        <div className="relative flex flex-col overflow-hidden bg-white" style={{ width: '62%', padding: '24px 22px 18px 24px' }}>
          {/* Subtle background circle */}
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, #e0e7ff 0%, transparent 70%)' }} />

          {/* Brand */}
          <div className="flex items-center gap-3 mb-4 relative z-10">
            <img src={appIcon} alt={CONFIG.BRAND_NAME} className="h-12 w-auto" />
            <div>
              <div className="font-black leading-tight" style={{ fontSize: '20px', color: '#1e1b4b', letterSpacing: '-0.5px' }}>
                Click<span style={{ color: '#f97316' }}>2</span><span style={{ color: '#16a34a' }}>kart</span>
              </div>
              <div style={{ fontSize: '9px', color: '#6b7280', fontWeight: 600, letterSpacing: '0.3px' }}>India's trusted b2b hub</div>
              <div style={{ fontSize: '9px', color: '#4f46e5', fontWeight: 700 }}>🌐 click2kart.net</div>
            </div>
          </div>

          {/* Photo + Info */}
          <div className="flex gap-4 items-start relative z-10 flex-1">
            {/* Photo */}
            <div className="flex-shrink-0 rounded-xl overflow-hidden border-4"
              style={{ width: '108px', height: '128px', borderColor: '#e0e7ff', background: 'linear-gradient(135deg,#4f46e5,#7c3aed)' }}>
              {partner?.profilePicture
                ? <img src={getImageUrl(partner.profilePicture)} alt={partner?.name} className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center text-white font-black" style={{ fontSize: '40px' }}>
                    {partner?.name?.charAt(0)?.toUpperCase() || 'P'}
                  </div>
              }
            </div>

            {/* Text info */}
            <div className="flex flex-col gap-2 pt-1 flex-1">
              <div className="font-black uppercase leading-tight" style={{ fontSize: '17px', color: '#111827', letterSpacing: '-0.3px' }}>
                {partner?.name || 'PARTNER NAME'}
              </div>

              {partner?.kycVerified && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full w-fit"
                  style={{ background: '#3730a3', color: '#fff', fontSize: '9px', fontWeight: 800, letterSpacing: '0.8px' }}>
                  <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  VERIFIED PARTNER
                </div>
              )}

              {partner?.email && (
                <div className="flex items-center gap-2" style={{ fontSize: '11px', color: '#374151', fontWeight: 600 }}>
                  <div className="flex items-center justify-center rounded-full flex-shrink-0"
                    style={{ width: '22px', height: '22px', background: '#eef2ff', color: '#4f46e5', fontSize: '11px' }}>✉</div>
                  {partner.email}
                </div>
              )}
              {partner?.phone && (
                <div className="flex items-center gap-2" style={{ fontSize: '11px', color: '#374151', fontWeight: 600 }}>
                  <div className="flex items-center justify-center rounded-full flex-shrink-0"
                    style={{ width: '22px', height: '22px', background: '#eef2ff', color: '#4f46e5', fontSize: '11px' }}>📞</div>
                  {partner.phone}
                </div>
              )}
              {addressLine && (
                <div className="flex items-start gap-2" style={{ fontSize: '11px', color: '#374151', fontWeight: 600, lineHeight: '1.4' }}>
                  <div className="flex items-center justify-center rounded-full flex-shrink-0 mt-0.5"
                    style={{ width: '22px', height: '22px', background: '#eef2ff', color: '#4f46e5', fontSize: '11px' }}>📍</div>
                  {addressLine}
                </div>
              )}
            </div>
          </div>

          {/* QR */}
          <div className="flex items-center gap-3 mt-3 relative z-10">
            <div className="rounded-xl flex items-center justify-center bg-white p-1.5"
              style={{ width: '72px', height: '72px', border: '2px solid #d1d5db' }}>
              <QRCode
                value={`${window.location.origin}/partner/verify/${partner?._id || ''}`}
                size={60}
                level="H"
              />
            </div>
            <div style={{ fontSize: '9px', color: '#6b7280', fontWeight: 500, lineHeight: '1.5' }}>
              Scan to verify<br />partner details
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div
          className="relative flex flex-col overflow-hidden text-white"
          style={{
            width: '38%',
            padding: '18px 18px 16px 18px',
            background: 'linear-gradient(155deg, #312e81 0%, #1e1b4b 100%)',
          }}
        >
          {/* Dot pattern */}
          <div className="absolute inset-0 pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)', backgroundSize: '18px 18px' }} />
          <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full pointer-events-none"
            style={{ background: 'rgba(255,255,255,0.03)' }} />

          {/* ID Badge */}
          <div className="relative z-10 text-center rounded-2xl mb-3"
            style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.12)', padding: '8px 10px' }}>
            <div style={{ fontSize: '9px', fontWeight: 700, color: 'rgba(255,255,255,0.55)', letterSpacing: '1.5px' }}>ID CARD</div>
            <div style={{ fontSize: '28px', fontWeight: 900, lineHeight: 1 }}>{year}</div>
          </div>

          {/* Detail list */}
          <div className="relative z-10 flex flex-col flex-1" style={{ gap: 0 }}>
            {dob && (
              <div style={{ padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize: '9px', fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '2px' }}>
                  📅 DATE OF BIRTH
                </div>
                <div style={{ fontSize: '14px', fontWeight: 800 }}>{dob}</div>
              </div>
            )}
            {partner?.bloodGroup && (
              <div style={{ padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize: '9px', fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '2px' }}>
                  💧 BLOOD GROUP
                </div>
                <div style={{ fontSize: '14px', fontWeight: 800 }}>{partner.bloodGroup}</div>
              </div>
            )}
            {joiningDate && (
              <div style={{ padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize: '9px', fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '2px' }}>
                  🗓️ JOINING DATE
                </div>
                <div style={{ fontSize: '14px', fontWeight: 800 }}>{joiningDate}</div>
              </div>
            )}
            <div style={{ padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ fontSize: '9px', fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '2px' }}>
                🛡️ PARTNER ID
              </div>
              <div style={{ fontSize: '13px', fontWeight: 700, fontFamily: 'monospace', letterSpacing: '1.5px' }}>
                {partner?._id?.slice(-8) || '--------'}
              </div>
            </div>
            <div style={{ padding: '7px 0' }}>
              <div style={{ fontSize: '9px', fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '2px' }}>
                🎁 INVITE CODE
              </div>
              <div style={{ fontSize: '22px', fontWeight: 900, color: '#fbbf24' }}>
                {partner?.inviteCode || '----'}
              </div>
            </div>
          </div>

          {/* Digital Seal (replaces signature) */}
          <div className="relative z-10 flex justify-center mt-auto pt-2">
            <DigitalSeal />
          </div>
        </div>
      </div>

      {/* ── FOOTER BAR ── */}
      <div className="flex items-center justify-around"
        style={{ background: '#f5f7ff', borderTop: '1.5px solid #e0e7ff', padding: '10px 16px', height: '52px' }}>
        {[
          { icon: '🏆', label: 'Trusted\nNetwork' },
          { icon: '🤝', label: 'Genuine\nPartners' },
          { icon: '🔐', label: 'Secure\nTransactions' },
          { icon: '🎧', label: '24x7\nSupport' },
        ].map((item, i) => (
          <React.Fragment key={i}>
            {i > 0 && <div style={{ width: '1px', height: '28px', background: '#e0e7ff' }} />}
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center rounded-lg flex-shrink-0"
                style={{ width: '28px', height: '28px', background: '#eef2ff', fontSize: '14px' }}>
                {item.icon}
              </div>
              <div style={{ fontSize: '10px', color: '#374151', fontWeight: 600, lineHeight: '1.3', whiteSpace: 'pre-line' }}>
                {item.label}
              </div>
            </div>
          </React.Fragment>
        ))}
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
const btnPrimary = 'w-full py-3.5 rounded-xl font-black text-sm text-white bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 active:scale-[0.98] transition-all shadow-lg shadow-orange-200 disabled:opacity-50 disabled:cursor-not-allowed';
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
  const [passwordChangeMode, setPasswordChangeMode] = useState('password');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [partner, setPartner] = useState(null);
  const [formData, setFormData] = useState({
    name: '', phone: '', whatsappNumber: '', sameAsPhone: false, bloodGroup: '', dob: '', address: '', city: '', district: '', state: '', pincode: '', profilePicture: '', panCard: '', aadhaarCard: ''
  });
  const [bankForm, setBankForm] = useState({ accountHolder: '', accountNumber: '', ifscCode: '', bankName: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  useEffect(() => { loadPartner(); }, []);

  const loadPartner = async () => {
    try {
      const { data } = await api.get('/api/partner/me');
      setPartner(data);
      setFormData({
        name: data.name || '',
        phone: data.phone || '',
        whatsappNumber: data.whatsappNumber || '',
        sameAsPhone: data.whatsappNumber === data.phone,
        bloodGroup: data.bloodGroup || '',
        dob: data.dob ? data.dob.substring(0, 10) : '',
        address: data.address || '',
        city: data.city || '',
        district: data.district || '',
        state: data.state || '',
        pincode: data.pincode || '',
        profilePicture: data.profilePicture || '',
        panCard: data.panCard || '',
        aadhaarCard: data.aadhaarCard || ''
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

  const handleFileUpload = async (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setSaving(true);
      const fd = new FormData();
      fd.append('file', file);
      const response = await api.post('/api/upload/image', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setFormData(p => ({ ...p, [fieldName]: response.data.url }));
      notify(`${fieldName.replace('pan', 'Pan').replace('aadhaar', 'Aadhaar')} uploaded!`, 'success');
    } catch {
      notify('Failed to upload file', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleProfilePictureChange = (e) => handleFileUpload(e, 'profilePicture');
  const handlePanCardChange = (e) => handleFileUpload(e, 'panCard');
  const handleAadhaarCardChange = (e) => handleFileUpload(e, 'aadhaarCard');

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { sameAsPhone, ...rest } = formData;
      const finalWhatsappNumber = sameAsPhone ? formData.phone : formData.whatsappNumber;
      const { data } = await api.put('/api/partner/profile', { ...rest, whatsappNumber: finalWhatsappNumber });
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
    if (passwordForm.newPassword !== passwordForm.confirmPassword) return notify('Passwords do not match', 'error');
    if (passwordForm.newPassword.length < 6) return notify('Minimum 6 characters', 'error');
    setChangingPassword(true);
    try {
      await api.put('/api/public/partner/change-password', passwordForm);
      notify('Password changed!', 'success');
      setShowPasswordChange(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (e) {
      notify(e?.response?.data?.error || 'Failed', 'error');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleSendOTP = async () => {
    setOtpLoading(true);
    try {
      await api.post('/api/public/partner/forgot-password', { email: partner.email });
      setOtpSent(true);
      notify('OTP sent to email!', 'success');
    } catch (e) {
      notify(e?.response?.data?.error || 'Failed to send OTP', 'error');
    } finally {
      setOtpLoading(false);
    }
  };

  const handlePasswordUpdateViaOTP = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) { notify('Passwords do not match', 'error'); return; }
    if (passwordForm.newPassword.length < 6) { notify('Minimum 6 characters', 'error'); return; }
    setChangingPassword(true);
    try {
      await api.post('/api/public/partner/reset-password', { email: partner.email, otp, newPassword: passwordForm.newPassword });
      notify('Password changed!', 'success');
      setShowPasswordChange(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setOtpSent(false);
      setOtp('');
    } catch (e) { notify(e?.response?.data?.error || 'Failed', 'error'); }
    finally { setChangingPassword(false); }
  };

  const handleDownloadID = async () => {
    if (!idCardRef.current) return;
    try {
      notify('Preparing download…', 'info');
      const canvas = await html2canvas(idCardRef.current, {
        scale: 3,
        backgroundColor: '#ffffff',
        useCORS: true,
        allowTaint: true,
        logging: false,
      });
      const link = document.createElement('a');
      link.download = `click2kart-id-${partner?._id?.slice(-8) || 'partner'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      notify('ID card downloaded!', 'success');
    } catch (e) {
      console.error(e);
      notify('Failed to download ID card', 'error');
    }
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: 'home' },
    { id: 'profile',  label: 'Profile',  icon: 'user' },
    { id: 'bank',     label: 'Bank Details', icon: 'gear' },
    { id: 'settings', label: 'Settings', icon: 'lock' },
  ];

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <LoadingSpinner text="Loading profile…" />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-gray-900 mb-1">Partner Profile</h1>
        <p className="text-gray-500 text-sm">Manage your profile and account details</p>
      </div>

      {/* Nav */}
      <div className="flex overflow-x-auto gap-2 pb-2">
        {navItems.map(({ id, label, icon }) => (
          <button
            key={id}
            onClick={() => setActiveSection(id)}
            className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all border
              ${activeSection === id
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-transparent shadow-lg shadow-indigo-200'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}
          >
            <Ico n={icon} cls="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* ──── OVERVIEW ──── */}
      {activeSection === 'overview' && (
        <div className="space-y-6">
          {/* Welcome */}
          <div className="bg-gradient-to-br from-orange-600 to-red-600 rounded-2xl p-6 text-white relative overflow-hidden">
            <div className="absolute right-0 top-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute right-12 bottom-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2" />
            <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest mb-1">Welcome back</p>
            <h2 className="font-black text-2xl leading-tight mb-1">{partner?.name?.split(' ')[0]}</h2>
            <p className="text-indigo-200 text-sm">{partner?.email}</p>
            {partner?.kycVerified && (
              <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                KYC Verified
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { section: 'profile',  icon: 'user', color: 'indigo', title: 'Edit Profile',   sub: 'Update your details' },
              { section: 'bank',     icon: 'gear', color: 'purple', title: 'Bank Details',   sub: 'Payment information' },
              { section: 'settings', icon: 'lock', color: 'blue',   title: 'Settings',       sub: 'Account preferences' },
            ].map(({ section, icon, color, title, sub }) => (
              <button key={section} onClick={() => setActiveSection(section)}
                className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 active:scale-[0.97] transition-all text-left">
                <div className={`w-12 h-12 rounded-xl bg-${color}-50 text-${color}-600 flex items-center justify-center mb-4`}>
                  <Ico n={icon} cls="w-6 h-6" />
                </div>
                <div className="font-black text-gray-800 text-sm">{title}</div>
                <div className="text-gray-400 text-xs mt-1">{sub}</div>
              </button>
            ))}
          </div>

          {/* ID Card */}
          <div className="space-y-4">
            <PartnerIDCard ref={idCardRef} partner={partner} />
            <button
              onClick={handleDownloadID}
              className="w-full py-4 rounded-xl font-black text-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 active:scale-[0.98] transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
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
                  {formData.profilePicture
                    ? <img src={getImageUrl(formData.profilePicture) || formData.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                    : partner?.name?.charAt(0)?.toUpperCase() || 'P'
                  }
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
                <input type="text" value={formData.name}
                  onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                  className={inputCls} placeholder="Your full name" />
              </Field>
              <Field label="Email Address">
                <input type="email" value={partner?.email || ''} disabled className={disabledCls} />
              </Field>
              <Field label="Phone Number">
                <input type="tel" value={formData.phone}
                  onChange={e => setFormData(p => ({ ...p, phone: e.target.value.replace(/\D/g,'').slice(0,10) }))}
                  className={inputCls} placeholder="10-digit mobile number" />
              </Field>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">WhatsApp Number</label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={formData.sameAsPhone}
                      onChange={(e) => setFormData(p => ({
                        ...p,
                        sameAsPhone: e.target.checked,
                        whatsappNumber: e.target.checked ? p.phone : p.whatsappNumber
                      }))}
                      className="w-4 h-4 text-orange-600 bg-orange-50 border-orange-200 rounded focus:ring-orange-500"
                    />
                    <span className="text-xs font-bold text-slate-600">Same as phone</span>
                  </label>
                </div>
                <input
                  type="tel"
                  name="whatsappNumber"
                  value={formData.sameAsPhone ? formData.phone : formData.whatsappNumber}
                  onChange={e => setFormData(p => ({ ...p, whatsappNumber: e.target.value.replace(/\D/g,'').slice(0,10) }))}
                  disabled={formData.sameAsPhone}
                  className={formData.sameAsPhone ? disabledCls : inputCls}
                  placeholder="10-digit WhatsApp number"
                />
              </div>
              <Field label="Date of Birth">
                <input type="date" value={formData.dob}
                  onChange={e => setFormData(p => ({ ...p, dob: e.target.value }))}
                  className={inputCls} />
              </Field>
              <Field label="Blood Group">
                <select value={formData.bloodGroup}
                  onChange={e => setFormData(p => ({ ...p, bloodGroup: e.target.value }))}
                  className={inputCls}>
                  <option value="">Select Blood Group</option>
                  {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                </select>
              </Field>
            </div>

            <Field label="Address">
              <textarea value={formData.address}
                onChange={e => setFormData(p => ({ ...p, address: e.target.value }))}
                className={inputCls} placeholder="Street address" rows={2} />
            </Field>

            <div className="grid md:grid-cols-4 gap-5">
              <Field label="City">
                <input type="text" value={formData.city}
                  onChange={e => setFormData(p => ({ ...p, city: e.target.value }))}
                  className={inputCls} placeholder="City" />
              </Field>
              <Field label="District">
                <input type="text" value={formData.district}
                  onChange={e => setFormData(p => ({ ...p, district: e.target.value }))}
                  className={inputCls} placeholder="District" />
              </Field>
              <Field label="State">
                <select value={formData.state}
                  onChange={e => setFormData(p => ({ ...p, state: e.target.value }))}
                  className={inputCls}>
                  <option value="">Select State</option>
                  {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="Pincode">
                <input type="text" value={formData.pincode}
                  onChange={e => setFormData(p => ({ ...p, pincode: e.target.value.replace(/\D/g,'').slice(0,6) }))}
                  className={inputCls} placeholder="Pincode" />
              </Field>
            </div>

            {/* Document uploads */}
            <div className="grid md:grid-cols-2 gap-5">
              <Field label="PAN Card (Upload)">
                <div className="relative group">
                  {formData.panCard ? (
                    <div className="w-full h-40 rounded-xl border-2 border-dashed border-indigo-200 bg-indigo-50 flex items-center justify-center overflow-hidden">
                      <img src={getImageUrl(formData.panCard) || formData.panCard} alt="PAN Card" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-full h-40 rounded-xl border-2 border-dashed border-indigo-200 bg-indigo-50 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 transition-colors">
                      <Ico n="user" cls="w-8 h-8 text-indigo-400 mb-2" />
                      <div className="text-xs text-indigo-500 font-semibold">Click to upload PAN Card</div>
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
                    <div className="w-full h-40 rounded-xl border-2 border-dashed border-indigo-200 bg-indigo-50 flex items-center justify-center overflow-hidden">
                      <img src={getImageUrl(formData.aadhaarCard) || formData.aadhaarCard} alt="Aadhaar Card" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-full h-40 rounded-xl border-2 border-dashed border-indigo-200 bg-indigo-50 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 transition-colors">
                      <Ico n="user" cls="w-8 h-8 text-indigo-400 mb-2" />
                      <div className="text-xs text-indigo-500 font-semibold">Click to upload Aadhaar Card</div>
                    </div>
                  )}
                  <label className="absolute inset-0 cursor-pointer rounded-xl">
                    <input type="file" accept="image/*" className="hidden" onChange={handleAadhaarCardChange} />
                  </label>
                </div>
              </Field>
            </div>

            <button type="submit" disabled={saving} className={btnPrimary}>
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </form>
        </div>
      )}

      {/* ──── BANK ──── */}
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
              className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-left flex items-center gap-4 hover:border-gray-200 hover:shadow-md active:scale-[0.98] transition-all">
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
                <button onClick={() => { setShowPasswordChange(false); setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' }); setPasswordChangeMode('password'); setOtpSent(false); setOtp(''); }}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                  <Ico n="chevL" cls="w-5 h-5" />
                </button>
                <h3 className="font-black text-gray-800 text-sm">Change Password</h3>
              </div>
              <div className="p-6">
                <div className="flex gap-2 mb-5 p-1 bg-gray-50 rounded-xl">
                  <button
                    onClick={() => setPasswordChangeMode('password')}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                      passwordChangeMode === 'password'
                        ? 'bg-white text-indigo-600 shadow-sm'
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    Via Current Password
                  </button>
                  <button
                    onClick={() => setPasswordChangeMode('otp')}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                      passwordChangeMode === 'otp'
                        ? 'bg-white text-indigo-600 shadow-sm'
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    Via OTP
                  </button>
                </div>

                {passwordChangeMode === 'password' ? (
                  <form onSubmit={handlePasswordUpdate} className="space-y-5">
                    <Field label="Current Password">
                      <input type="password" value={passwordForm.currentPassword}
                        onChange={e => setPasswordForm(p => ({ ...p, currentPassword: e.target.value }))}
                        className={inputCls} placeholder="Current password" />
                    </Field>
                    <Field label="New Password">
                      <input type="password" value={passwordForm.newPassword}
                        onChange={e => setPasswordForm(p => ({ ...p, newPassword: e.target.value }))}
                        className={inputCls} placeholder="At least 6 characters" />
                    </Field>
                    <Field label="Confirm Password">
                      <input type="password" value={passwordForm.confirmPassword}
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
                ) : (
                  <form onSubmit={handlePasswordUpdateViaOTP} className="space-y-5">
                    <div className="grid md:grid-cols-2 gap-5">
                      <Field label="Email">
                        <input
                          type="email"
                          value={partner.email}
                          disabled
                          className={disabledCls}
                        />
                      </Field>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block">
                          {otpSent ? 'Enter OTP' : 'Send OTP'}
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            inputMode="numeric"
                            maxLength="4"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                            disabled={!otpSent}
                            className={inputCls}
                            placeholder={otpSent ? '1234' : ''}
                          />
                          <button
                            type="button"
                            onClick={handleSendOTP}
                            disabled={otpLoading}
                            className="px-3 rounded-xl bg-indigo-100 text-indigo-600 text-xs font-bold hover:bg-indigo-200 transition-all disabled:opacity-50"
                          >
                            {otpLoading ? 'Sending...' : (otpSent ? 'Resend' : 'Send')}
                          </button>
                        </div>
                      </div>
                    </div>
                    {otpSent && (
                      <>
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
                      </>
                    )}
                    <button type="submit"
                      disabled={changingPassword || !otpSent || !otp || passwordForm.newPassword !== passwordForm.confirmPassword || !passwordForm.newPassword}
                      className={btnPrimary}>
                      {changingPassword ? 'Updating…' : 'Update Password'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
