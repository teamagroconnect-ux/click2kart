import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../lib/api';
import { useAuth } from '../../lib/AuthContext';
import { useToast } from '../../components/Toast';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getImageUrl } from '../../lib/cloudinary';
import { io } from 'socket.io-client';
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
    map:      'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z',
    pkg:      'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
    heart:    'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
    help:     'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    gear:     'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
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
  const avatarUrl = user?.kyc?.profilePicture || user?.avatar;
  if (avatarUrl)
    return <img src={getImageUrl(avatarUrl)} alt={user?.name} className={`${sz} rounded-2xl object-cover ring-2 ring-white shadow-md`} />;
  return (
    <div className={`${sz} rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center font-black text-white ring-2 ring-white shadow-md`}>
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

const inputCls = 'w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all placeholder:text-slate-300';
const disabledCls = 'w-full px-4 py-3 rounded-xl border border-slate-100 bg-slate-50 text-slate-400 font-semibold text-sm cursor-not-allowed';
const btnPrimary = 'w-full py-3.5 rounded-xl font-black text-sm text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 active:scale-[0.98] transition-all shadow-lg shadow-violet-200 disabled:opacity-50 disabled:cursor-not-allowed';
const btnOutline = 'flex-1 py-3.5 rounded-xl font-bold text-sm border border-slate-200 text-slate-600 hover:bg-slate-50 active:scale-[0.98] transition-all';

/* ════════════════════════════════════════ MAIN COMPONENT ════════════════════════════════════════ */
export default function Profile() {
  const { user, token, refreshProfile } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeSection, setActiveSection] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [originalKyc, setOriginalKyc] = useState({});
  const [changingPassword, setChangingPassword] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [formData, setFormData] = useState({
    name: '', phone: '', 
    profilePicture: '', panCard: '', aadhaarCard: '',
    businessName: '', gstin: '', pan: '',
    addressLine1: '', addressLine2: '', city: '', district: '', state: '', pincode: ''
  });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressForm, setAddressForm] = useState({
    fullName: '', phone: '', addressLine1: '', addressLine2: '',
    city: '', district: '', state: '', pincode: '', isDefault: false
  });
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [newTicketForm, setNewTicketForm] = useState({ subject: '', description: '', category: 'Other', relatedOrder: '' });
  const [messageInput, setMessageInput] = useState('');
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [recentOrders, setRecentOrders] = useState([]);

  const adminIcon = "https://cdn-icons-png.flaticon.com/512/4140/4140047.png" // Female executive icon

  useEffect(() => {
    if (!token) { navigate('/login', { state: { from: location.pathname } }); return; }
    loadProfile();
    loadAddresses();
    loadTickets();
  }, [token]);

  useEffect(() => {
    if (activeSection === 'support' && tickets.length === 0) loadTickets();
  }, [activeSection]);

  useEffect(() => {
    let socket;
    if (selectedTicket) {
      socket = io(CONFIG.API_BASE_URL)
      socket.on(`ticket_update_${selectedTicket._id}`, (updatedTicket) => {
        setSelectedTicket(updatedTicket)
        // Also update the ticket in the list
        setTickets(prev => prev.map(t => t._id === updatedTicket._id ? updatedTicket : t))
      })
    }
    return () => {
      if (socket) socket.disconnect()
    }
  }, [selectedTicket?._id])

  useEffect(() => {
    if (showNewTicketModal) loadRecentOrders();
  }, [showNewTicketModal]);

  const loadRecentOrders = async () => {
    try {
      const { data } = await api.get('/api/orders/my');
      setRecentOrders(data.slice(0, 5) || []);
    } catch (e) { console.error('Failed to load recent orders', e); }
  };

  const loadProfile = async () => {
    try {
      const { data } = await api.get('/api/user/me');
      setOriginalKyc(data.kyc || {});
      setFormData({
        name: data.name || '',
        phone: data.phone || '',
        profilePicture: data.kyc?.profilePicture || data.avatar || '',
        panCard: data.kyc?.panCard || '',
        aadhaarCard: data.kyc?.aadhaarCard || '',
        businessName: data.kyc?.businessName || '',
        gstin: data.kyc?.gstin || '',
        pan: data.kyc?.pan || '',
        addressLine1: data.kyc?.addressLine1 || '',
        addressLine2: data.kyc?.addressLine2 || '',
        city: data.kyc?.city || '',
        district: data.kyc?.district || '',
        state: data.kyc?.state || '',
        pincode: data.kyc?.pincode || ''
      });
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const loadAddresses = async () => {
    try { const { data } = await api.get('/api/user/addresses'); setSavedAddresses(data); }
    catch (e) { console.error(e); }
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
      notify(`${fieldName.replace('pan', 'PAN').replace('aadhaar', 'Aadhaar').replace('profilePicture', 'Profile picture')} uploaded!`, 'success');
    } catch {
      notify('Failed to upload file', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleProfilePictureChange = (e) => handleFileUpload(e, 'profilePicture');
  const handlePanCardChange = (e) => handleFileUpload(e, 'panCard');
  const handleAadhaarCardChange = (e) => handleFileUpload(e, 'aadhaarCard');

  const loadTickets = async () => {
    setTicketsLoading(true);
    try { const { data } = await api.get('/api/support-tickets/my-tickets'); setTickets(data); }
    catch (e) { console.error(e); }
    finally { setTicketsLoading(false); }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      // Only save personal info, not KYC
      await api.put('/api/user/profile', {
        name: formData.name,
        phone: formData.phone
      });
      await refreshProfile();
      notify('Profile updated!', 'success');
    } catch (e) { notify(e?.response?.data?.error || 'Failed to update', 'error'); }
    finally { setSaving(false); }
  };

  const handleSaveKyc = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await api.put('/api/user/kyc', {
        profilePicture: formData.profilePicture,
        panCard: formData.panCard,
        aadhaarCard: formData.aadhaarCard,
        businessName: formData.businessName,
        gstin: formData.gstin,
        pan: formData.pan,
        addressLine1: formData.addressLine1,
        addressLine2: formData.addressLine2,
        city: formData.city,
        district: formData.district,
        state: formData.state,
        pincode: formData.pincode
      });
      await refreshProfile();
      await loadProfile();
      notify('KYC updated!', 'success');
    } catch (e) { notify(e?.response?.data?.error || 'Failed to update', 'error'); }
    finally { setSaving(false); }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) { notify('Passwords do not match', 'error'); return; }
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

  const handleAddressInputChange = async (e) => {
    const { name, value, type, checked } = e.target;
    let v = value;
    if (name === 'phone') v = value.replace(/\D/g, '').slice(0, 10);
    if (name === 'pincode') {
      v = value.replace(/\D/g, '').slice(0, 6);
      if (v.length === 6) {
        setPincodeLoading(true);
        try {
          const res = await fetch(`https://api.postalpincode.in/pincode/${v}`);
          const d = await res.json();
          if (d[0]?.Status === 'Success') {
            const po = d[0].PostOffice[0];
            setAddressForm(p => ({ ...p, pincode: v, district: po.District, state: po.State }));
            setPincodeLoading(false); return;
          } else notify('Invalid pincode', 'error');
        } catch { console.error('pincode fetch failed'); }
        finally { setPincodeLoading(false); }
      }
    }
    setAddressForm(p => ({ ...p, [name]: type === 'checkbox' ? checked : v }));
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    if (addressForm.phone.length !== 10) { notify('Phone must be 10 digits', 'error'); return; }
    if (addressForm.pincode.length !== 6) { notify('Pincode must be 6 digits', 'error'); return; }
    try {
      if (editingAddress) { await api.put(`/api/user/addresses/${editingAddress._id}`, addressForm); notify('Address updated!', 'success'); }
      else { await api.post('/api/user/addresses', addressForm); notify('Address added!', 'success'); }
      await loadAddresses(); await refreshProfile(); setShowAddressModal(false);
    } catch (e) { notify(e?.response?.data?.error || 'Failed', 'error'); }
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm('Delete this address?')) return;
    try { await api.delete(`/api/user/addresses/${id}`); await loadAddresses(); await refreshProfile(); notify('Address deleted', 'success'); }
    catch (e) { notify(e?.response?.data?.error || 'Failed', 'error'); }
  };

  const handleSetDefault = async (id) => {
    try { await api.post(`/api/user/addresses/${id}/set-default`); await loadAddresses(); await refreshProfile(); notify('Default updated!', 'success'); }
    catch (e) { notify(e?.response?.data?.error || 'Failed', 'error'); }
  };

  const handleAddAddress = () => {
    setEditingAddress(null);
    setAddressForm({ fullName: '', phone: '', addressLine1: '', addressLine2: '', city: '', district: '', state: '', pincode: '', isDefault: savedAddresses.length === 0 });
    setShowAddressModal(true);
  };

  const handleEditAddress = (addr) => {
    setEditingAddress(addr);
    setAddressForm({ fullName: addr.fullName, phone: addr.phone, addressLine1: addr.addressLine1, addressLine2: addr.addressLine2, city: addr.city, district: addr.district, state: addr.state, pincode: addr.pincode, isDefault: addr.isDefault });
    setShowAddressModal(true);
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    try { await api.post('/api/support-tickets', newTicketForm); notify('Ticket created!', 'success'); setShowNewTicketModal(false); setNewTicketForm({ subject: '', description: '', category: 'Other' }); loadTickets(); }
    catch (e) { notify(e?.response?.data?.error || 'Failed', 'error'); }
  };

  const handleAddMessage = async (ticketId) => {
    if (!messageInput.trim()) return;
    try { const { data } = await api.post(`/api/support-tickets/${ticketId}/messages`, { message: messageInput }); setSelectedTicket(data); setMessageInput(''); loadTickets(); }
    catch (e) { notify(e?.response?.data?.error || 'Failed', 'error'); }
  };

  const handleEditMessage = async (ticketId, messageId) => {
    if (!editValue.trim()) return;
    try {
      const { data } = await api.put(`/api/support-tickets/${ticketId}/messages/${messageId}`, { message: editValue });
      setSelectedTicket(data);
      setEditingMessageId(null);
      setEditValue('');
      notify('Message updated!', 'success');
    } catch (e) {
      notify('Failed to update message', 'error');
    }
  };

  const handleUploadImage = async (ticketId, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    try {
      notify('Uploading image...', 'info');
      const { data: uploadData } = await api.post('/api/upload/image', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      const { data: ticketData } = await api.post(`/api/support-tickets/${ticketId}/upload-image`, { imageUrl: uploadData.url });
      setSelectedTicket(ticketData);
      notify('Image uploaded!', 'success');
    } catch (e) {
      notify('Failed to upload image', 'error');
    } finally {
      e.target.value = '';
    }
  };

  const handleResolveTicket = async (ticketId) => {
    try { await api.put(`/api/support-tickets/${ticketId}/resolve`); notify('Ticket resolved!', 'success'); setSelectedTicket(null); loadTickets(); }
    catch (e) { notify(e?.response?.data?.error || 'Failed', 'error'); }
  };

  const handleLogout = () => {
    localStorage.removeItem('token'); localStorage.removeItem('user'); navigate('/');
  };

  /* Nav config */
  const navItems = [
    { id: 'overview',   label: 'Overview',   icon: 'home'  },
    { id: 'personal',   label: 'Profile',    icon: 'user'  },
    { id: 'business',   label: 'Business',   icon: 'pkg'   },
    { id: 'addresses',  label: 'Addresses',  icon: 'map'   },
    { id: 'support',    label: 'Support',    icon: 'help'  },
    { id: 'settings',   label: 'Settings',   icon: 'gear'  },
  ];

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <LoadingSpinner text="Loading profile…" />
    </div>
  );

  /* ── Status badge ── */
  const statusBadge = (status) => {
    const map = {
      Open:        'bg-amber-50 text-amber-600 border-amber-100',
      'In Progress':'bg-blue-50 text-blue-600 border-blue-100',
      Resolved:    'bg-emerald-50 text-emerald-600 border-emerald-100',
    };
    return `px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${map[status] || 'bg-slate-100 text-slate-600 border-slate-200'}`;
  };

  /* ════ RENDER ════ */
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800;900&family=DM+Sans:wght@400;500;600&display=swap');

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

      <div className="pf-root min-h-screen bg-slate-50 pb-24 lg:pb-8">

        {/* ── TOP HEADER ── */}
        <div className="bg-gradient-to-r from-violet-900 via-indigo-800 to-indigo-900 text-white">
          <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
            <button onClick={() => navigate('/')} className="p-2 rounded-xl hover:bg-white/10 transition-colors flex-shrink-0">
              <Ico n="back" cls="w-4 h-4" />
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black uppercase tracking-widest text-violet-200">My Account</p>
              <h1 className="pf-display font-black text-base leading-tight truncate">{user?.name || 'User'}</h1>
            </div>
            <Avatar user={user} size="sm" />
          </div>

          {/* ── MOBILE: horizontal scrollable tab strip ── */}
          <div className="lg:hidden pf-nav-strip flex overflow-x-auto px-4 pb-0 gap-1">
            {navItems.map(({ id, label, icon }) => (
              <button key={id} onClick={() => setActiveSection(id)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold rounded-t-xl transition-all
                  ${activeSection === id
                    ? 'bg-slate-50 text-violet-600'
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
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center gap-3">
              <Avatar user={user} size="md" />
              <div className="min-w-0">
                <div className="pf-display font-black text-slate-800 text-sm truncate">{user?.name}</div>
                <div className="text-[11px] text-slate-400 truncate">{user?.email}</div>
              </div>
            </div>

            {/* Nav */}
            <nav className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              {navItems.map(({ id, label, icon }) => (
                <button key={id} onClick={() => setActiveSection(id)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 text-sm font-semibold text-left transition-all border-l-2
                    ${activeSection === id
                      ? 'border-violet-500 bg-violet-50 text-violet-700'
                      : 'border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-800'}`}>
                  <Ico n={icon} cls="w-4 h-4 flex-shrink-0" />
                  {label}
                </button>
              ))}
              <div className="border-t border-slate-100">
                <button onClick={() => navigate('/orders')} className="w-full flex items-center gap-3 px-4 py-3.5 text-sm font-semibold text-left text-slate-600 hover:bg-slate-50 border-l-2 border-transparent transition-all">
                  <Ico n="pkg" cls="w-4 h-4 flex-shrink-0" /> My Orders
                </button>
                <button onClick={() => navigate('/wishlist')} className="w-full flex items-center gap-3 px-4 py-3.5 text-sm font-semibold text-left text-slate-600 hover:bg-slate-50 border-l-2 border-transparent transition-all">
                  <Ico n="heart" cls="w-4 h-4 flex-shrink-0" /> Wishlist
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
                <div className="bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl p-5 text-white relative overflow-hidden">
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
                    { label: 'Wishlist', sub: 'Saved items', icon: 'heart', color: 'bg-rose-50 text-rose-600', action: () => navigate('/wishlist') },
                    { label: 'Addresses', sub: `${savedAddresses.length} saved`, icon: 'map', color: 'bg-emerald-50 text-emerald-600', action: () => setActiveSection('addresses') },
                    { label: 'Support', sub: `${tickets.length} tickets`, icon: 'help', color: 'bg-violet-50 text-violet-600', action: () => setActiveSection('support') },
                  ].map(({ label, sub, icon, color, action }) => (
                    <button key={label} onClick={action}
                      className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 active:scale-[0.97] transition-all text-left">
                      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}>
                        <Ico n={icon} cls="w-5 h-5" />
                      </div>
                      <div className="pf-display font-black text-slate-800 text-sm">{label}</div>
                      <div className="text-slate-400 text-xs mt-0.5">{sub}</div>
                    </button>
                  ))}
                </div>

                {/* Profile summary */}
                <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
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
              <div className="pf-panel bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100">
                  <h2 className="pf-display font-black text-slate-800">Personal Info</h2>
                  <p className="text-slate-400 text-xs mt-0.5">Update your name and contact details</p>
                </div>
                <form onSubmit={handleSaveProfile} className="p-5 space-y-5">
                  {/* Profile Picture */}
                  <div className="flex items-center gap-6">
                    <div className="relative group">
                      <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white text-4xl font-black border-4 border-gray-100 overflow-hidden">
                        {formData.profilePicture
                          ? <img src={getImageUrl(formData.profilePicture) || formData.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                          : user?.name?.charAt(0)?.toUpperCase() || 'U'
                        }
                      </div>
                    </div>
                    <div>
                      <div className="font-bold text-gray-800">Profile Picture</div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-5">
                    <Field label="Full Name">
                      <input type="text" name="name" value={formData.name}
                        onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                        className={inputCls} placeholder="Your full name" />
                    </Field>
                    <Field label="Email Address">
                      <input type="email" value={user?.email || ''} disabled className={disabledCls} />
                    </Field>
                    <Field label="Phone Number">
                      <input type="tel" name="phone" value={formData.phone}
                        onChange={e => setFormData(p => ({ ...p, phone: e.target.value.replace(/\D/g,'').slice(0,10) }))}
                        className={inputCls} placeholder="10-digit mobile number" />
                    </Field>
                  </div>

                  <button type="submit" disabled={saving} className={btnPrimary}>
                    {saving ? 'Saving…' : 'Save Changes'}
                  </button>
                </form>
              </div>
            )}

            {/* ──── BUSINESS ──── */}
            {activeSection === 'business' && (
              <div className="pf-panel bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100">
                  <h2 className="pf-display font-black text-slate-800">Business Info</h2>
                  <p className="text-slate-400 text-xs mt-0.5">Update your business details and KYC documents</p>
                </div>
                <form onSubmit={handleSaveKyc} className="p-5 space-y-5">
                  {/* Profile Picture */}
                  <div className="flex items-center gap-6">
                    <div className="relative group">
                      <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white text-4xl font-black border-4 border-gray-100 overflow-hidden">
                        {formData.profilePicture
                          ? <img src={getImageUrl(formData.profilePicture) || formData.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                          : user?.name?.charAt(0)?.toUpperCase() || 'U'
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
                    <Field label="Business Name">
                      <input 
                        type="text" 
                        value={formData.businessName}
                        onChange={e => setFormData(p => ({ ...p, businessName: e.target.value }))}
                        className={originalKyc.businessName ? disabledCls : inputCls} 
                        placeholder="Your business name"
                        disabled={!!originalKyc.businessName}
                      />
                    </Field>
                    <Field label="GSTIN">
                      <input 
                        type="text" 
                        value={formData.gstin}
                        onChange={e => setFormData(p => ({ ...p, gstin: e.target.value }))}
                        className={originalKyc.gstin ? disabledCls : inputCls} 
                        placeholder="Your GSTIN"
                        disabled={!!originalKyc.gstin}
                      />
                    </Field>
                    <Field label="PAN Number">
                      <input 
                        type="text" 
                        value={formData.pan}
                        onChange={e => setFormData(p => ({ ...p, pan: e.target.value }))}
                        className={originalKyc.pan ? disabledCls : inputCls} 
                        placeholder="Your PAN number"
                        disabled={!!originalKyc.pan}
                      />
                    </Field>
                  </div>

                  {/* Document uploads */}
                  <div className="grid md:grid-cols-2 gap-5">
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

                  {/* Address fields for KYC */}
                  <div className="grid md:grid-cols-2 gap-5">
                    <Field label="Address Line 1">
                      <input 
                        type="text" 
                        value={formData.addressLine1}
                        onChange={e => setFormData(p => ({ ...p, addressLine1: e.target.value }))}
                        className={inputCls} 
                        placeholder="Your address line 1"
                      />
                    </Field>
                    <Field label="Address Line 2">
                      <input 
                        type="text" 
                        value={formData.addressLine2}
                        onChange={e => setFormData(p => ({ ...p, addressLine2: e.target.value }))}
                        className={inputCls} 
                        placeholder="Your address line 2 (optional)"
                      />
                    </Field>
                    <Field label="City">
                      <input 
                        type="text" 
                        value={formData.city}
                        onChange={e => setFormData(p => ({ ...p, city: e.target.value }))}
                        className={inputCls} 
                        placeholder="Your city"
                      />
                    </Field>
                    <Field label="District">
                      <input 
                        type="text" 
                        value={formData.district}
                        onChange={e => setFormData(p => ({ ...p, district: e.target.value }))}
                        className={inputCls} 
                        placeholder="Your district"
                      />
                    </Field>
                    <Field label="State">
                      <select 
                        value={formData.state}
                        onChange={e => setFormData(p => ({ ...p, state: e.target.value }))}
                        className={inputCls} 
                      >
                        <option value="">Select state</option>
                        {INDIAN_STATES.map(state => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Pincode">
                      <input 
                        type="text" 
                        value={formData.pincode}
                        onChange={e => setFormData(p => ({ ...p, pincode: e.target.value.replace(/\D/g,'').slice(0,6) }))}
                        className={inputCls} 
                        placeholder="Your pincode"
                      />
                    </Field>
                  </div>

                  <button type="submit" disabled={saving} className={btnPrimary}>
                    {saving ? 'Saving…' : 'Save Changes'}
                  </button>
                </form>
              </div>
            )}

            {/* ──── ADDRESSES ──── */}
            {activeSection === 'addresses' && (
              <div className="pf-panel space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="pf-display font-black text-slate-800">Addresses</h2>
                    <p className="text-slate-400 text-xs mt-0.5">{savedAddresses.length} saved</p>
                  </div>
                  <button onClick={handleAddAddress}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold text-xs shadow-md shadow-violet-200 active:scale-[0.97] transition-all">
                    <Ico n="plus" cls="w-4 h-4" /> Add New
                  </button>
                </div>

                {savedAddresses.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-10 text-center">
                    <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-3 text-slate-300">
                      <Ico n="map" cls="w-7 h-7" />
                    </div>
                    <h3 className="pf-display font-black text-slate-700 mb-1">No addresses yet</h3>
                    <p className="text-slate-400 text-sm mb-4">Add an address for faster checkout</p>
                    <button onClick={handleAddAddress} className="px-5 py-2.5 bg-violet-600 text-white rounded-xl font-bold text-sm hover:bg-violet-700 transition-all">
                      Add Address
                    </button>
                  </div>
                ) : (
                  savedAddresses.map(addr => (
                    <div key={addr._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Ico n="map" cls="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="pf-display font-black text-slate-800 text-sm">{addr.fullName}</span>
                            <span className="text-slate-300 text-xs">·</span>
                            <span className="text-slate-500 text-xs font-semibold">{addr.phone}</span>
                            {addr.isDefault && (
                              <span className="px-2 py-0.5 bg-violet-50 text-violet-600 text-[10px] font-black rounded-full border border-violet-100">Default</span>
                            )}
                          </div>
                          <p className="text-slate-500 text-xs leading-relaxed">
                            {addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ''}<br />
                            {addr.city}, {addr.district}, {addr.state} – {addr.pincode}
                          </p>
                          {!addr.isDefault && (
                            <button onClick={() => handleSetDefault(addr._id)}
                              className="mt-2 text-violet-600 text-xs font-bold hover:underline">
                              Set as default
                            </button>
                          )}
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <button onClick={() => handleEditAddress(addr)}
                            className="p-2 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors">
                            <Ico n="edit" cls="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDeleteAddress(addr._id)}
                            className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
                            <Ico n="trash" cls="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ──── SUPPORT ──── */}
            {activeSection === 'support' && (
              <div className="pf-panel space-y-3">
                {!selectedTicket ? (
                  <>
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="pf-display font-black text-slate-800">Support</h2>
                        <p className="text-slate-400 text-xs mt-0.5">{tickets.length} ticket{tickets.length !== 1 ? 's' : ''}</p>
                      </div>
                      <button onClick={() => setShowNewTicketModal(true)}
                        className="flex items-center gap-1.5 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold text-xs shadow-md shadow-violet-200 active:scale-[0.97] transition-all">
                        <Ico n="plus" cls="w-4 h-4" /> New Ticket
                      </button>
                    </div>

                    {ticketsLoading ? (
                      <div className="py-10 flex justify-center"><div className="w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" /></div>
                    ) : tickets.length === 0 ? (
                      <div className="bg-white rounded-3xl border-2 border-dashed border-slate-100 p-12 text-center">
                        <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-4 text-4xl shadow-inner">🎧</div>
                        <h3 className="pf-display font-black text-slate-800 text-lg mb-1">How can we help?</h3>
                        <p className="text-slate-400 text-sm mb-6 max-w-xs mx-auto">Raise a ticket for orders, payments, returns, or technical support.</p>
                        <button onClick={() => setShowNewTicketModal(true)} className="px-8 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-2xl font-black text-sm hover:from-violet-700 hover:to-indigo-700 shadow-xl shadow-violet-200 transition-all active:scale-95">
                          Create Your First Ticket
                        </button>
                      </div>
                    ) : (
                      <div className="grid gap-3">
                        {tickets.map(t => (
                          <button key={t._id} onClick={() => setSelectedTicket(t)}
                            className="w-full bg-white rounded-3xl border border-slate-100 shadow-sm p-5 text-left hover:border-violet-200 hover:shadow-lg transition-all active:scale-[0.98] group">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-[10px] font-black text-violet-600 bg-violet-50 px-2 py-0.5 rounded-md uppercase tracking-widest">#{t.ticketId || 'TK-NEW'}</span>
                                  <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{t.category}</span>
                                </div>
                                <div className="pf-display font-black text-slate-800 text-sm truncate group-hover:text-violet-600 transition-colors">{t.subject}</div>
                                <div className="text-slate-400 text-xs mt-1 line-clamp-1 font-medium">{t.description}</div>
                                <div className="flex items-center gap-2 mt-3">
                                  <div className="h-1 w-1 rounded-full bg-slate-200"></div>
                                  <div className="text-slate-300 text-[10px] font-bold uppercase tracking-widest">{new Date(t.updatedAt).toLocaleDateString()}</div>
                                </div>
                              </div>
                              <span className={statusBadge(t.status)}>{t.status}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  /* Ticket Detail - WhatsApp Style */
                  <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden flex flex-col h-[600px] bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat">
                    <div className="px-5 py-4 bg-white/95 backdrop-blur-md border-b border-slate-100 flex items-center gap-4 z-10 shadow-sm">
                      <button onClick={() => setSelectedTicket(null)} className="p-2 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors">
                        <Ico n="chevL" cls="w-5 h-5" />
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="pf-display font-black text-slate-800 text-sm truncate">#{selectedTicket.ticketId}</span>
                          <span className={statusBadge(selectedTicket.status)}>{selectedTicket.status}</span>
                        </div>
                        <div className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-0.5">{selectedTicket.subject}</div>
                      </div>
                      {selectedTicket.status !== 'Resolved' && (
                        <button onClick={() => handleResolveTicket(selectedTicket._id)}
                          className="px-4 py-2 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-100 transition-colors shadow-sm">
                          Resolve
                        </button>
                      )}
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 p-5 space-y-4 overflow-y-auto custom-scrollbar">
                      <div className="flex justify-center mb-4">
                        <div className="bg-white/80 backdrop-blur-sm px-4 py-1.5 rounded-full border border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest shadow-sm">
                          Support Request Initiated
                        </div>
                      </div>

                      {/* Initial Problem */}
                      <div className="flex justify-start">
                        <div className="bg-white rounded-2xl rounded-tl-none p-4 shadow-sm border border-slate-100 max-w-[85%]">
                          <div className="text-[10px] font-black text-violet-600 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                            <span className="h-1 w-1 rounded-full bg-violet-600"></span>
                            Original Request
                          </div>
                          <p className="text-sm font-bold text-slate-700 leading-relaxed">{selectedTicket.description}</p>
                        </div>
                      </div>

                      {selectedTicket.messages?.map((msg, i) => (
                        <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} items-end gap-2 group`}>
                          {msg.sender === 'admin' && (
                            <img src={adminIcon} alt="Support" className="h-8 w-8 rounded-full border border-white shadow-sm mb-1" />
                          )}
                          <div className={`max-w-[80%] px-5 py-3 rounded-2xl shadow-md relative
                            ${msg.sender === 'user'
                              ? 'bg-gradient-to-br from-violet-600 to-indigo-600 text-white rounded-br-none'
                              : 'bg-white text-slate-700 border border-slate-100 rounded-bl-none shadow-sm'}`}>
                            
                            {editingMessageId === msg._id ? (
                              <div className="flex flex-col gap-2 min-w-[200px]">
                                <textarea
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  className="bg-white/10 border border-white/20 rounded-lg p-2 text-sm text-white focus:outline-none"
                                  autoFocus
                                />
                                <div className="flex justify-end gap-2">
                                  <button onClick={() => setEditingMessageId(null)} className="text-[10px] font-bold uppercase hover:underline">Cancel</button>
                                  <button onClick={() => handleEditMessage(selectedTicket._id, msg._id)} className="text-[10px] font-black uppercase bg-white text-violet-600 px-2 py-1 rounded-md">Save</button>
                                </div>
                              </div>
                            ) : (
                              <>
                                {msg.sender === 'user' && (
                                  <button 
                                    onClick={() => { setEditingMessageId(msg._id); setEditValue(msg.message); }}
                                    className="absolute -left-8 top-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 text-slate-400 hover:text-violet-600"
                                  >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                  </button>
                                )}
                                <p className="text-sm font-bold leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                                
                                {msg.type === 'image_request' && (
                                  <div className="mt-3 pt-3 border-t border-slate-50">
                                    <label className="flex items-center justify-center gap-2 w-full py-2 bg-violet-50 text-violet-600 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-violet-100 transition-all border border-violet-100 shadow-inner">
                                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUploadImage(selectedTicket._id, e)} />
                                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                                      Upload Requested Image
                                    </label>
                                  </div>
                                )}

                                {msg.type === 'image' && msg.attachments?.length > 0 && (
                                  <div className="mt-2 rounded-xl overflow-hidden border border-black/5 shadow-inner">
                                    <img src={getImageUrl(msg.attachments[0])} alt="Attached" className="max-w-full h-auto max-h-[300px] object-contain mx-auto" />
                                  </div>
                                )}
                              </>
                            )}

                            <div className={`text-[9px] mt-2 font-black uppercase tracking-widest flex items-center justify-between gap-4 ${
                              msg.sender === 'user' ? 'text-violet-200' : 'text-slate-300'
                            }`}>
                              <div className="flex items-center gap-2">
                                <span>{msg.sender === 'user' ? 'You' : 'Executive Support'}</span>
                                {msg.isEdited && <span className="italic opacity-70">(Edited)</span>}
                              </div>
                              <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          </div>
                        </div>
                      ))}

                      {selectedTicket.status === 'Open' && (
                        <div className="flex justify-center mt-6">
                          <div className="bg-white/90 backdrop-blur-sm py-3 px-6 rounded-2xl border border-slate-100 text-center shadow-sm max-w-xs animate-pulse">
                            <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest italic">"Our executive will assist you soon..."</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Chat Input */}
                    {selectedTicket.status !== 'Closed' && (
                      <div className="p-4 bg-white/95 backdrop-blur-md border-t border-slate-100">
                        <div className="flex gap-2 items-center bg-slate-50 p-2 rounded-2xl border border-slate-200 focus-within:border-violet-300 transition-all">
                          <label className="p-3 text-slate-400 hover:text-violet-600 hover:bg-white rounded-xl transition-all cursor-pointer">
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUploadImage(selectedTicket._id, e)} />
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                          </label>
                          <input value={messageInput} onChange={e => setMessageInput(e.target.value)}
                            onKeyPress={e => e.key === 'Enter' && handleAddMessage(selectedTicket._id)}
                            placeholder="Type a message…"
                            className="flex-1 px-4 py-2 bg-transparent text-sm font-bold text-slate-700 placeholder-slate-400 outline-none" />
                          <button onClick={() => handleAddMessage(selectedTicket._id)}
                            disabled={!messageInput.trim()}
                            className="p-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl shadow-lg shadow-violet-100 disabled:opacity-40 transition-all active:scale-95">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
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
                    className="w-full bg-white rounded-2xl border border-slate-100 shadow-sm p-4 text-left flex items-center gap-4 hover:border-slate-200 hover:shadow-md active:scale-[0.98] transition-all">
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
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
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

        {/* ── MOBILE BOTTOM NAV ── */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-100 z-40 safe-area-pb">
          <div className="flex">
            {navItems.map(({ id, label, icon }) => (
              <button key={id} onClick={() => setActiveSection(id)}
                className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-all
                  ${activeSection === id ? 'text-violet-600' : 'text-slate-400 hover:text-slate-600'}`}>
                <Ico n={icon} cls="w-5 h-5" />
                <span className="text-[9px] font-black uppercase tracking-wider">{label}</span>
                {activeSection === id && <div className="w-1 h-1 rounded-full bg-violet-500" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ════ ADDRESS MODAL ════ */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-3xl max-h-[92vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white px-5 py-4 border-b border-slate-100 flex items-center justify-between z-10">
              <h2 className="pf-display font-black text-slate-800">{editingAddress ? 'Edit Address' : 'New Address'}</h2>
              <button onClick={() => setShowAddressModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                <Ico n="close" cls="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveAddress} className="p-5 space-y-3">
              <Field label="Full Name">
                <input type="text" name="fullName" value={addressForm.fullName} onChange={handleAddressInputChange} className={inputCls} required />
              </Field>
              <Field label="Phone">
                <input type="tel" name="phone" value={addressForm.phone} onChange={handleAddressInputChange} className={inputCls} required />
              </Field>
              <Field label="Pincode">
                <div className="relative">
                  <input type="text" name="pincode" value={addressForm.pincode} onChange={handleAddressInputChange} className={inputCls} required />
                  {pincodeLoading && <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />}
                </div>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="City">
                  <input type="text" name="city" value={addressForm.city} onChange={handleAddressInputChange} className={inputCls} required />
                </Field>
                <Field label="District">
                  <input type="text" name="district" value={addressForm.district} onChange={handleAddressInputChange} className={inputCls} required />
                </Field>
              </div>
              <Field label="State">
                <select name="state" value={addressForm.state} onChange={handleAddressInputChange} className={inputCls} required>
                  <option value="">Select state</option>
                  {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="Address Line 1">
                <input type="text" name="addressLine1" value={addressForm.addressLine1} onChange={handleAddressInputChange} className={inputCls} required />
              </Field>
              <Field label="Address Line 2 (optional)">
                <input type="text" name="addressLine2" value={addressForm.addressLine2} onChange={handleAddressInputChange} className={inputCls} />
              </Field>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" name="isDefault" checked={addressForm.isDefault} onChange={handleAddressInputChange}
                  className="w-4 h-4 rounded accent-violet-600" />
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Set as default</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddressModal(false)} className={btnOutline}>Cancel</button>
                <button type="submit" className="flex-1 py-3.5 rounded-xl font-black text-sm text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-200 transition-all active:scale-[0.98]">
                  {editingAddress ? 'Update' : 'Save Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════ NEW TICKET MODAL ════ */}
      {showNewTicketModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl max-h-[92vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white px-6 py-5 border-b border-slate-100 flex items-center justify-between z-10">
              <div>
                <h2 className="pf-display font-black text-slate-800 text-lg">Support Request</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">We're here to help you</p>
              </div>
              <button onClick={() => setShowNewTicketModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                <Ico n="close" cls="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateTicket} className="p-6 space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Category">
                  <select value={newTicketForm.category}
                    onChange={e => setNewTicketForm(p => ({ ...p, category: e.target.value }))}
                    className={inputCls}>
                    {['Order','Product','Payment','Return/Refund','Other'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="Subject">
                  <input type="text" value={newTicketForm.subject}
                    onChange={e => setNewTicketForm(p => ({ ...p, subject: e.target.value }))}
                    className={inputCls} placeholder="Brief title of issue" required />
                </Field>
              </div>

              {/* Recent Orders Suggestions */}
              {recentOrders.length > 0 && (
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Link Recent Order (Optional)</label>
                  <div className="flex gap-2 overflow-x-auto pb-2 pf-nav-strip">
                    {recentOrders.map(o => (
                      <button
                        key={o._id}
                        type="button"
                        onClick={() => setNewTicketForm(p => ({ ...p, relatedOrder: p.relatedOrder === o._id ? '' : o._id, subject: p.relatedOrder === o._id ? '' : `Issue with Order #${o._id.slice(-6).toUpperCase()}` }))}
                        className={`flex-shrink-0 px-4 py-2 rounded-xl border text-left transition-all ${
                          newTicketForm.relatedOrder === o._id 
                            ? 'bg-violet-600 border-violet-600 text-white shadow-lg shadow-violet-200' 
                            : 'bg-white border-slate-100 text-slate-600 hover:border-violet-200'
                        }`}
                      >
                        <div className="text-[10px] font-black uppercase tracking-wider mb-0.5">#{o._id.slice(-6).toUpperCase()}</div>
                        <div className={`text-[9px] font-bold ${newTicketForm.relatedOrder === o._id ? 'text-violet-100' : 'text-slate-400'}`}>₹{o.totalEstimate?.toLocaleString()} · {new Date(o.createdAt).toLocaleDateString()}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <Field label="How can we help?">
                <textarea value={newTicketForm.description}
                  onChange={e => setNewTicketForm(p => ({ ...p, description: e.target.value }))}
                  className={`${inputCls} h-32 resize-none`} placeholder="Please describe your issue in detail..." required />
              </Field>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowNewTicketModal(false)} className={btnOutline}>Discard</button>
                <button type="submit" className="flex-1 py-4 rounded-2xl font-black text-sm text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-xl shadow-violet-200 transition-all active:scale-[0.98]">
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}