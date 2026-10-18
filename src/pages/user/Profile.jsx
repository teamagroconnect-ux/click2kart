import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
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
    credit:   'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
  };
  return (
    <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
      {d[n]?.split(' M').map((seg, i) => (
        <path key={i} d={i === 0 ? seg : 'M' + seg} />
      ))}
    </svg>
  );
};

/* ── Razorpay Script Loader ── */
const ensureRazorpayLoaded = async () => {
  if (window.Razorpay) return true;
  return new Promise((res, rej) => {
    const ex = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (ex) {
      ex.addEventListener('load', () => res(true), { once: true });
      ex.addEventListener('error', () => rej(new Error('razorpay_load_failed')), { once: true });
      return;
    }
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.async = true;
    s.onload = () => res(true);
    s.onerror = () => rej(new Error('razorpay_load_failed'));
    document.body.appendChild(s);
  });
};

/* ── Blue Professional Verified Badge Icon ── */
export const BlueVerifiedIcon = ({ cls = "w-4 h-4", title = "Verified Partner" }) => (
  <svg
    className={`${cls} text-blue-500 fill-current inline-block flex-shrink-0 drop-shadow-xs`}
    viewBox="0 0 24 24"
    role="img"
    aria-label={title}
  >
    <title>{title}</title>
    <path
      fillRule="evenodd"
      d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
      clipRule="evenodd"
    />
  </svg>
);

export const VerifiedPartnerPill = ({ verified = false }) => {
  if (verified) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200 shadow-xs shadow-blue-100">
        <BlueVerifiedIcon cls="w-3.5 h-3.5 text-blue-600" />
        <span>Verified Partner</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
      <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
      <span>Partner Account</span>
    </span>
  );
};

/* ── Avatar Component (Clean Profile Photo) ── */
const Avatar = ({ user, size = 'md' }) => {
  const sz = { sm: 'w-9 h-9 text-sm', md: 'w-12 h-12 text-base', lg: 'w-16 h-16 text-xl' }[size];
  const avatarUrl = user?.kyc?.profilePicture || user?.avatar;

  return (
    <div className="relative inline-block flex-shrink-0">
      {avatarUrl ? (
        <img
          src={getImageUrl(avatarUrl)}
          alt={user?.name}
          className={`${sz} rounded-2xl object-cover ring-2 ring-white shadow-md`}
        />
      ) : (
        <div
          className={`${sz} rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center font-black text-white ring-2 ring-white shadow-md`}
        >
          {user?.name?.charAt(0)?.toUpperCase() || 'U'}
        </div>
      )}
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

const txnTypeBadge = (type) => {
  const map = {
    CREDIT_GRANTED: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', label: 'Credit Granted' },
    CREDIT_ADDED: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Credit Added' },
    CREDIT_USED: { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200', label: 'Credit Used' },
    CREDIT_REPAID: { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200', label: 'Credit Repaid' },
    CREDIT_ADJUSTMENT: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: 'Adjustment' },
    REFUND_CREDIT: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', label: 'Refund' },
    REVERSAL: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Credit Reversal (+)' }
  };
  const t = map[type] || { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200', label: type };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${t.bg} ${t.text} ${t.border}`}>
      {t.label}
    </span>
  );
};

const repayStatusBadge = (status) => {
  const map = {
    PAYMENT_PENDING: { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200', label: 'Payment Pending' },
    PENDING_VERIFICATION: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: 'Verification Pending' },
    SUCCESS: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Completed' },
    REJECTED: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', label: 'Rejected' }
  };
  const s = map[status] || { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200', label: status };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${s.bg} ${s.text} ${s.border}`}>
      {s.label}
    </span>
  );
};

/* ════════════════════════════════════════ MAIN COMPONENT ════════════════════════════════════════ */
export default function Profile() {
  const { user, token, refreshProfile } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const getInitialTab = () => {
    try {
      const params = new URLSearchParams(location.search);
      const tab = params.get('tab');
      if (tab && ['overview', 'credit', 'business', 'personal', 'addresses', 'support', 'settings'].includes(tab)) {
        return tab === 'personal' ? 'business' : tab;
      }
    } catch (e) {}
    return 'overview';
  };

  const [activeSection, setActiveSection] = useState(getInitialTab);

  useEffect(() => {
    try {
      const params = new URLSearchParams(location.search);
      const tab = params.get('tab');
      if (tab && ['overview', 'credit', 'business', 'personal', 'addresses', 'support', 'settings'].includes(tab)) {
        setActiveSection(tab === 'personal' ? 'business' : tab);
      }
    } catch (e) {}
  }, [location.search]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [originalKyc, setOriginalKyc] = useState({});
  const [changingPassword, setChangingPassword] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordChangeMode, setPasswordChangeMode] = useState('password'); // 'password' or 'otp'
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [formData, setFormData] = useState({
    name: '', phone: '', 
    profilePicture: '', panCard: '', aadhaarCard: '',
    aadhaarFront: '', aadhaarBack: '', aadhaarNumber: '',
    businessName: '', tradeName: '', businessType: 'Retail Store', gstin: '', pan: '',
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
  const [selectedBusinessAddress, setSelectedBusinessAddress] = useState(null);

  // Retailer Credit State
  const [isCreditEnabled, setIsCreditEnabled] = useState(() => Boolean(user?.isCreditEnabled));
  const [creditData, setCreditData] = useState(null);
  const [creditLoading, setCreditLoading] = useState(false);
  const [creditTransactions, setCreditTransactions] = useState([]);
  const [creditRepayments, setCreditRepayments] = useState([]);
  const [creditTab, setCreditTab] = useState('ledger'); // 'ledger' | 'repayments'
  const [showRepayModal, setShowRepayModal] = useState(false);
  const [repayMethod, setRepayMethod] = useState('RAZORPAY'); // 'RAZORPAY' | 'BANK_TRANSFER'
  const [repayAmount, setRepayAmount] = useState('');
  const [repaySubmitting, setRepaySubmitting] = useState(false);
  const [bankForm, setBankForm] = useState({ utr: '', paymentSlip: '', note: '' });
  const [uploadingSlip, setUploadingSlip] = useState(false);
  const [companyBankConfig, setCompanyBankConfig] = useState({ enabled: false, bankDetails: null });

  // Facility Sub-tabs: 'trade' | 'business'
  const [creditFacilityType, setCreditFacilityType] = useState('trade');

  // Business Credit Facility State
  const [businessEligibility, setBusinessEligibility] = useState(null);
  const [businessApps, setBusinessApps] = useState([]);
  const [businessFacilities, setBusinessFacilities] = useState([]);
  const [loadingBusinessCredit, setLoadingBusinessCredit] = useState(false);
  const [showBusinessApplyModal, setShowBusinessApplyModal] = useState(false);
  const [businessApplyForm, setBusinessApplyForm] = useState({
    requestedAmount: '',
    purpose: 'Working Capital Expansion',
    requestedTenureMonths: 3,
    requestedFrequency: 'WEEKLY'
  });
  const [submittingBusinessApp, setSubmittingBusinessApp] = useState(false);
  const [showAcceptOfferModal, setShowAcceptOfferModal] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [acceptedTermsChecked, setAcceptedTermsChecked] = useState(false);
  const [acceptingOffer, setAcceptingOffer] = useState(false);
  const [disburseBankDetails, setDisburseBankDetails] = useState({
    accountHolder: '',
    bankName: '',
    accountNumber: '',
    confirmAccountNumber: '',
    ifsc: '',
    accountType: 'CURRENT'
  });
  const [showBusinessRepayModal, setShowBusinessRepayModal] = useState(false);
  const [selectedRepayFacility, setSelectedRepayFacility] = useState(null);
  const [businessRepayAmount, setBusinessRepayAmount] = useState('');
  const [businessRepayMethod, setBusinessRepayMethod] = useState('RAZORPAY');
  const [businessBankForm, setBusinessBankForm] = useState({ utr: '', paymentSlip: '', notes: '' });
  const [submittingBusinessRepay, setSubmittingBusinessRepay] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedScheduleFacility, setSelectedScheduleFacility] = useState(null);

  const loadBankDetails = async () => {
    try {
      const { data } = await api.get('/api/public/bank-details');
      if (data) {
        setCompanyBankConfig(data);
        if (!data.enabled) {
          setRepayMethod('RAZORPAY');
        }
      }
    } catch (e) {
      console.error('Failed to load company bank details', e);
    }
  };

  const loadCredit = async () => {
    if (!isCreditEnabled && !user?.isCreditEnabled) return;
    setCreditLoading(true);
    try {
      const [resCredit, resTxns] = await Promise.all([
        api.get('/api/credit/me'),
        api.get('/api/credit/me/transactions')
      ]);
      setCreditData(resCredit.data);
      if (resCredit.data?.isCreditEnabled !== undefined) {
        setIsCreditEnabled(Boolean(resCredit.data.isCreditEnabled));
      }
      setCreditTransactions(resTxns.data?.transactions || []);
      setCreditRepayments(resTxns.data?.repayments || []);
    } catch (err) {
      console.error('Failed to load credit details:', err);
    } finally {
      setCreditLoading(false);
    }
  };

  const handleRazorpayRepayment = async () => {
    const amt = Number(repayAmount);
    if (!amt || amt <= 0) return notify('Please enter a valid repayment amount', 'error');
    if (creditData && amt > creditData.outstandingBalance) {
      return notify(`Repayment cannot exceed outstanding balance of ₹${creditData.outstandingBalance.toLocaleString('en-IN')}`, 'error');
    }

    try {
      await ensureRazorpayLoaded();
    } catch {
      return notify('Unable to load payment gateway', 'error');
    }

    try {
      setRepaySubmitting(true);
      const { data } = await api.post('/api/credit/me/repay/razorpay-init', { amount: amt });

      const logo = typeof window !== 'undefined' ? `${window.location.origin}/layoutlogo.png` : '/layoutlogo.png';
      const options = {
        key: data.keyId,
        amount: data.amountPaise,
        currency: 'INR',
        name: 'Click2Kart',
        description: 'Retailer Credit Repayment',
        image: logo,
        order_id: data.razorpayOrderId,
        prefill: {
          name: user?.name,
          email: user?.email,
          contact: user?.phone
        },
        theme: { color: '#7c3aed' },
        handler: async (response) => {
          try {
            notify('Verifying payment with server...', 'info');
            const verifyRes = await api.post('/api/credit/me/repay/razorpay-verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });
            if (verifyRes.data.success) {
              notify('Repayment successful! Outstanding balance reduced.', 'success');
              setShowRepayModal(false);
              setRepayAmount('');
              await loadCredit();
              await refreshProfile();
            }
          } catch (verErr) {
            notify(verErr?.response?.data?.message || 'Repayment verification pending. Check transactions.', 'warning');
            loadCredit();
          }
        },
        modal: {
          ondismiss: () => {
            setRepaySubmitting(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      notify(err?.response?.data?.message || err?.response?.data?.error || 'Failed to initiate repayment', 'error');
    } finally {
      setRepaySubmitting(false);
    }
  };

  const handleRetryRepayment = async (rp) => {
    try {
      notify('Initiating payment gateway...', 'info');
      const { data } = await api.post(`/api/credit/me/repay/retry/${rp._id}`);
      const logo = typeof window !== 'undefined' ? `${window.location.origin}/layoutlogo.png` : '/layoutlogo.png';
      const options = {
        key: data.keyId,
        amount: data.amountPaise,
        currency: 'INR',
        name: 'Click2Kart',
        description: `Retailer Credit Repayment ₹${rp.amount}`,
        image: logo,
        order_id: data.razorpayOrderId,
        prefill: {
          name: user?.name,
          email: user?.email,
          contact: user?.phone
        },
        theme: { color: '#7c3aed' },
        handler: async (response) => {
          try {
            notify('Verifying payment with server...', 'info');
            const verifyRes = await api.post('/api/credit/me/repay/razorpay-verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });
            if (verifyRes.data.success) {
              notify('Repayment successful! Outstanding balance reduced.', 'success');
              await loadCredit();
              await refreshProfile();
            }
          } catch (verErr) {
            notify(verErr?.response?.data?.message || 'Repayment verification pending.', 'warning');
            loadCredit();
          }
        }
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      notify(err?.response?.data?.message || 'Failed to retry repayment', 'error');
    }
  };

  const handleBankTransferRepayment = async (e) => {
    e.preventDefault();
    const amt = Number(repayAmount);
    if (!amt || amt <= 0) return notify('Please enter a valid repayment amount', 'error');
    if (!bankForm.utr.trim()) return notify('UTR / Reference number is required', 'error');

    try {
      setRepaySubmitting(true);
      await api.post('/api/credit/me/repay/bank-transfer', {
        amount: amt,
        utr: bankForm.utr.trim(),
        paymentSlip: bankForm.paymentSlip,
        note: bankForm.note.trim()
      });
      notify('Bank transfer submitted successfully! Pending admin verification.', 'success');
      setShowRepayModal(false);
      setRepayAmount('');
      setBankForm({ utr: '', paymentSlip: '', note: '' });
      await loadCredit();
    } catch (err) {
      notify(err?.response?.data?.message || err?.response?.data?.error || 'Failed to submit bank transfer', 'error');
    } finally {
      setRepaySubmitting(false);
    }
  };

  const handleSlipUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setUploadingSlip(true);
      const fd = new FormData();
      fd.append('file', file);
      const response = await api.post('/api/upload/image', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setBankForm(p => ({ ...p, paymentSlip: response.data.url }));
      notify('Payment receipt uploaded successfully', 'success');
    } catch {
      notify('Failed to upload receipt', 'error');
    } finally {
      setUploadingSlip(false);
    }
  };

  const adminIcon = "https://cdn-icons-png.flaticon.com/512/4140/4140047.png" // Female executive icon

  useEffect(() => {
    if (!token) { navigate('/login', { state: { from: location.pathname } }); return; }
    loadProfile();
    loadAddresses();
    loadTickets();
    loadBankDetails();
  }, [token]);

  useEffect(() => {
    if (activeSection === 'support' && tickets.length === 0) loadTickets();
  }, [activeSection]);

  const loadBusinessCredit = async () => {
    setLoadingBusinessCredit(true);
    try {
      const [resElig, resApps, resFacs] = await Promise.all([
        api.get('/api/credit/business/eligibility').catch(() => ({ data: { isEligible: false } })),
        api.get('/api/credit/business/my-applications').catch(() => ({ data: { applications: [] } })),
        api.get('/api/credit/business/my-facilities').catch(() => ({ data: { facilities: [] } }))
      ]);
      setBusinessEligibility(resElig.data || {});
      setBusinessApps(resApps.data?.applications || []);
      setBusinessFacilities(resFacs.data?.facilities || []);
    } catch (err) {
      console.error('Failed to load business credit details', err);
    } finally {
      setLoadingBusinessCredit(false);
    }
  };

  const handleApplyBusinessCredit = async (e) => {
    e.preventDefault();
    const amt = Number(businessApplyForm.requestedAmount);
    if (!amt || amt <= 0) return notify('Please enter a valid requested amount', 'error');
    const tenure = Number(businessApplyForm.requestedTenureMonths);
    const allowedTenures = businessEligibility?.settings?.permittedTenures && businessEligibility.settings.permittedTenures.length > 0
      ? businessEligibility.settings.permittedTenures
      : [1, 2, 3, 4, 5];
    if (!allowedTenures.includes(tenure)) return notify('Please select a valid facility tenure', 'error');

    setSubmittingBusinessApp(true);
    try {
      await api.post('/api/credit/business/apply', {
        requestedAmount: amt,
        purpose: businessApplyForm.purpose,
        requestedTenureMonths: tenure,
        requestedFrequency: businessApplyForm.requestedFrequency
      });
      notify('Business Credit application submitted for review!', 'success');
      setShowBusinessApplyModal(false);
      setBusinessApplyForm({
        requestedAmount: '',
        purpose: 'Working Capital Expansion',
        requestedTenureMonths: 3,
        requestedFrequency: 'WEEKLY'
      });
      await loadBusinessCredit();
    } catch (err) {
      notify(err?.response?.data?.message || err?.response?.data?.error || 'Failed to submit application', 'error');
    } finally {
      setSubmittingBusinessApp(false);
    }
  };

  const openAcceptOfferModal = (offer) => {
    setSelectedOffer(offer);
    setAcceptedTermsChecked(false);
    setDisburseBankDetails({
      accountHolder: offer.businessDetails?.bankDetails?.accountHolder || user?.kyc?.businessName || user?.name || '',
      bankName: offer.businessDetails?.bankDetails?.bankName || '',
      accountNumber: offer.businessDetails?.bankDetails?.accountNumber || '',
      confirmAccountNumber: offer.businessDetails?.bankDetails?.accountNumber || '',
      ifsc: offer.businessDetails?.bankDetails?.ifsc || '',
      accountType: offer.businessDetails?.bankDetails?.accountType || 'CURRENT'
    });
    setShowAcceptOfferModal(true);
  };

  const handleAcceptBusinessOffer = async (e) => {
    e.preventDefault();
    if (!selectedOffer) return;
    if (!disburseBankDetails.accountHolder.trim()) return notify('Account Holder Name is required', 'error');
    if (!disburseBankDetails.bankName.trim()) return notify('Bank Name is required', 'error');
    if (!disburseBankDetails.accountNumber.trim()) return notify('Bank Account Number is required', 'error');
    if (disburseBankDetails.accountNumber.trim() !== disburseBankDetails.confirmAccountNumber.trim()) {
      return notify('Bank account numbers do not match', 'error');
    }
    if (!disburseBankDetails.ifsc.trim() || disburseBankDetails.ifsc.trim().length < 8) {
      return notify('Valid Bank IFSC code is required', 'error');
    }
    if (!acceptedTermsChecked) return notify('Please review and check the agreement acceptance checkbox', 'error');

    setAcceptingOffer(true);
    try {
      await api.post(`/api/credit/business/accept-offer/${selectedOffer._id}`, {
        bankDetails: {
          accountHolder: disburseBankDetails.accountHolder.trim(),
          bankName: disburseBankDetails.bankName.trim(),
          accountNumber: disburseBankDetails.accountNumber.trim(),
          ifsc: disburseBankDetails.ifsc.trim().toUpperCase(),
          accountType: disburseBankDetails.accountType
        },
        acceptedTerms: true
      });
      notify('Offer accepted & bank details recorded! Payout will be processed to your account.', 'success');
      setShowAcceptOfferModal(false);
      setSelectedOffer(null);
      await loadBusinessCredit();
      await refreshProfile();
    } catch (err) {
      notify(err?.response?.data?.message || err?.response?.data?.error || 'Failed to accept offer', 'error');
    } finally {
      setAcceptingOffer(false);
    }
  };

  const handleBusinessRazorpayRepayment = async (facility) => {
    const amt = Number(businessRepayAmount);
    if (!amt || amt <= 0) return notify('Please enter a valid repayment amount', 'error');
    if (amt > facility.totalPayable) {
      return notify(`Repayment cannot exceed total payable of ₹${facility.totalPayable.toLocaleString('en-IN')}`, 'error');
    }

    try {
      await ensureRazorpayLoaded();
    } catch {
      return notify('Unable to load payment gateway', 'error');
    }

    setSubmittingBusinessRepay(true);
    try {
      const { data } = await api.post('/api/credit/business/repay/razorpay-init', {
        facilityId: facility._id,
        amount: amt
      });

      const logo = typeof window !== 'undefined' ? `${window.location.origin}/layoutlogo.png` : '/layoutlogo.png';
      const options = {
        key: data.key,
        amount: data.order.amount,
        currency: 'INR',
        name: 'Click2Kart Business Credit',
        description: `Loan Repayment — ${facility.facilityNumber}`,
        image: logo,
        order_id: data.order.id,
        prefill: {
          name: user?.name,
          email: user?.email,
          contact: user?.phone
        },
        theme: { color: '#7c3aed' },
        handler: async (response) => {
          try {
            notify('Verifying business loan repayment...', 'info');
            const verifyRes = await api.post('/api/credit/business/repay/razorpay-verify', {
              facilityId: facility._id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              amount: amt
            });
            if (verifyRes.data.success) {
              notify('Repayment successfully verified and applied!', 'success');
              setShowBusinessRepayModal(false);
              setBusinessRepayAmount('');
              await loadBusinessCredit();
            }
          } catch (verErr) {
            notify(verErr?.response?.data?.message || 'Repayment verification pending', 'warning');
            loadBusinessCredit();
          }
        },
        modal: {
          ondismiss: () => {
            setSubmittingBusinessRepay(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      notify(err?.response?.data?.message || err?.response?.data?.error || 'Failed to initiate repayment', 'error');
    } finally {
      setSubmittingBusinessRepay(false);
    }
  };

  const handleBusinessBankTransferRepayment = async (facility) => {
    const amt = Number(businessRepayAmount);
    if (!amt || amt <= 0) return notify('Please enter a valid repayment amount', 'error');
    if (!businessBankForm.utr.trim()) return notify('UTR number is required', 'error');

    setSubmittingBusinessRepay(true);
    try {
      await api.post('/api/credit/business/repay/bank-transfer', {
        facilityId: facility._id,
        amount: amt,
        utr: businessBankForm.utr.trim(),
        paymentSlip: businessBankForm.paymentSlip,
        notes: businessBankForm.notes.trim()
      });
      notify('Bank transfer proof submitted for admin verification!', 'success');
      setShowBusinessRepayModal(false);
      setBusinessRepayAmount('');
      setBusinessBankForm({ utr: '', paymentSlip: '', notes: '' });
      await loadBusinessCredit();
    } catch (err) {
      notify(err?.response?.data?.message || 'Failed to submit bank transfer', 'error');
    } finally {
      setSubmittingBusinessRepay(false);
    }
  };

  const handleInitAutoPay = async (facility) => {
    try {
      notify('Initiating AutoPay mandate setup...', 'info');
      const { data } = await api.post('/api/credit/business/mandate/init', { facilityId: facility._id });
      const order = data.mandate?.mandateOrder || data.mandateOrder;
      const key = data.mandate?.key || data.key || import.meta.env.VITE_RAZORPAY_KEY_ID;
      const customerId = data.mandate?.customerId || data.customerId;

      if (order && order.id) {
        await ensureRazorpayLoaded();
        const options = {
          key: key,
          amount: order.amount,
          currency: order.currency || 'INR',
          name: 'Click2Kart AutoPay Mandate',
          description: `Auto-debit setup for ${facility.facilityNumber}`,
          order_id: order.id,
          customer_id: customerId || undefined,
          recurring: 1,
          theme: { color: '#7c3aed' },
          prefill: {
            name: user?.name,
            contact: user?.phone,
            email: user?.email
          },
          handler: async (response) => {
            try {
              notify('Verifying mandate authorization...', 'info');
              await api.post('/api/credit/business/mandate/verify', {
                facilityId: facility._id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
                razorpaySignature: response.razorpay_signature
              });
              notify('AutoPay mandate active! Instalments will be debited automatically on due dates.', 'success');
              await loadBusinessCredit();
            } catch (vErr) {
              notify(vErr?.response?.data?.message || 'Failed to confirm mandate status', 'error');
              await loadBusinessCredit();
            }
          }
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        notify(data.message || data.mandate?.message || 'AutoPay is not yet active for this account. Manual payment is enabled.', 'info');
      }
    } catch (err) {
      notify(err?.response?.data?.message || 'AutoPay mandate setup requires bank authorization', 'info');
    }
  };

  useEffect(() => {
    if (activeSection === 'credit' || activeSection === 'overview') {
      if (isCreditEnabled || user?.isCreditEnabled) loadCredit();
      loadBusinessCredit();
    }
  }, [isCreditEnabled, user?.isCreditEnabled, activeSection]);

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
      if (data.isCreditEnabled !== undefined) {
        setIsCreditEnabled(Boolean(data.isCreditEnabled));
      }
      setFormData({
        name: data.name || '',
        phone: data.phone || '',
        profilePicture: data.kyc?.profilePicture || data.avatar || '',
        panCard: data.kyc?.panCard || '',
        aadhaarCard: data.kyc?.aadhaarFront || data.kyc?.aadhaarCard || '',
        aadhaarFront: data.kyc?.aadhaarFront || data.kyc?.aadhaarCard || '',
        aadhaarBack: data.kyc?.aadhaarBack || '',
        aadhaarNumber: data.kyc?.aadhaarNumber || '',
        businessName: data.kyc?.businessName || '',
        tradeName: data.kyc?.tradeName || data.kyc?.businessName || '',
        businessType: data.kyc?.businessType || 'Retail Store',
        gstin: data.kyc?.gstin || '',
        pan: data.kyc?.pan || '',
        addressLine1: data.kyc?.addressLine1 || '',
        addressLine2: data.kyc?.addressLine2 || '',
        city: data.kyc?.city || '',
        district: data.kyc?.district || '',
        state: data.kyc?.state || '',
        pincode: data.kyc?.pincode || ''
      });
      
      // If there's an existing KYC address, set it as the selected one
      if (data.kyc?.addressLine1) {
        const existingAddr = {
          _id: 'kyc',
          fullName: data.name,
          phone: data.phone,
          addressLine1: data.kyc.addressLine1,
          addressLine2: data.kyc.addressLine2 || '',
          city: data.kyc.city,
          district: data.kyc.district,
          state: data.kyc.state,
          pincode: data.kyc.pincode,
          isDefault: true
        };
        setSelectedBusinessAddress(existingAddr);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleRequestContactChange = () => {
    setNewTicketForm({
      subject: 'Request for Registered Mobile / Email Update',
      category: 'Account',
      description: `Hello Support Team,\n\nI would like to request an update to my registered contact details:\nCurrent Name: ${formData.name || user?.name || ''}\nCurrent Registered Phone: ${formData.phone || user?.phone || ''}\nCurrent Registered Email: ${user?.email || ''}\n\nRequested New Phone / Email & Reason for update:\n`,
      relatedOrder: ''
    });
    setShowNewTicketModal(true);
  };

  const loadAddresses = async () => {
    try { 
      const { data } = await api.get('/api/user/addresses'); 
      setSavedAddresses(data);
      
      // Auto-select default address
      if (data && data.length > 0) {
        const defaultAddr = data.find(a => a.isDefault) || data[0];
        setSelectedBusinessAddress(defaultAddr);
        setFormData(p => ({
          ...p,
          addressLine1: defaultAddr.addressLine1,
          addressLine2: defaultAddr.addressLine2 || '',
          city: defaultAddr.city,
          district: defaultAddr.district,
          state: defaultAddr.state,
          pincode: defaultAddr.pincode
        }));
      }
    } catch (e) { console.error(e); }
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
      // Only save personal info (name); phone & email locked
      await api.put('/api/user/profile', {
        name: formData.name
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

  const handleSendOTP = async () => {
    setOtpLoading(true);
    try {
      await api.post('/api/auth/customer/forgot-password', { email: user.email });
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
      await api.post('/api/auth/customer/reset-password', { email: user.email, otp, newPassword: passwordForm.newPassword });
      notify('Password changed!', 'success');
      setShowPasswordChange(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setOtpSent(false);
      setOtp('');
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
      let newAddr;
      if (editingAddress) { 
        const { data } = await api.put(`/api/user/addresses/${editingAddress._id}`, addressForm);
        newAddr = data;
        notify('Address updated!', 'success'); 
      } else { 
        const { data } = await api.post('/api/user/addresses', addressForm); 
        newAddr = data;
        notify('Address added!', 'success'); 
      }
      await loadAddresses(); 
      await refreshProfile(); 
      
      // Auto-select the new/edited address for business info
      setSelectedBusinessAddress(newAddr);
      setFormData(p => ({
        ...p,
        addressLine1: newAddr.addressLine1,
        addressLine2: newAddr.addressLine2 || '',
        city: newAddr.city,
        district: newAddr.district,
        state: newAddr.state,
        pincode: newAddr.pincode
      }));
      
      setShowAddressModal(false);
    } catch (e) { notify(e?.response?.data?.error || 'Failed', 'error'); }
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm('Delete this address?')) return;
    try { 
      await api.delete(`/api/user/addresses/${id}`); 
      await loadAddresses(); 
      await refreshProfile(); 
      
      // If we deleted the selected business address, clear the selection
      if (selectedBusinessAddress?._id === id) {
        setSelectedBusinessAddress(null);
      }
      
      notify('Address deleted', 'success'); 
    } catch (e) { notify(e?.response?.data?.error || 'Failed', 'error'); }
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

  const handleSelectBusinessAddress = (addr) => {
    setSelectedBusinessAddress(addr);
    setFormData(p => ({
      ...p,
      addressLine1: addr.addressLine1,
      addressLine2: addr.addressLine2 || '',
      city: addr.city,
      district: addr.district,
      state: addr.state,
      pincode: addr.pincode
    }));
  };

  /* Nav config - 5 clean primary destinations for mobile and desktop */
  const navItems = [
    { id: 'overview',   label: 'Overview',            shortLabel: 'Overview', icon: 'home'   },
    { id: 'credit',     label: 'Credit Facilities',   shortLabel: 'Credit',   icon: 'credit' },
    { id: 'business',   label: 'Profile & Business',  shortLabel: 'Business', icon: 'pkg'    },
    { id: 'addresses',  label: 'Saved Addresses',     shortLabel: 'Address',  icon: 'map'    },
    { id: 'support',    label: 'Support Desk',        shortLabel: 'Support',  icon: 'help'   },
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

      <div className="pf-root min-h-screen bg-slate-50/70 pb-24 lg:pb-12">

        {/* ── TOP EXECUTIVE HEADER (Clean, Light B2B Luxury) ── */}
        <div className="bg-white border-b border-slate-200/80 shadow-xs relative">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <button
                  onClick={() => navigate('/')}
                  className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-all flex-shrink-0 border border-slate-200 active:scale-95 shadow-xs"
                  title="Back to Home"
                >
                  <Ico n="back" cls="w-4 h-4" />
                </button>
                <Avatar user={user} size="md" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="pf-display font-black text-lg text-slate-900 leading-tight truncate">
                      {formData.businessName || user?.name || 'Partner Account'}
                    </h1>
                    <VerifiedPartnerPill verified={user?.kyc?.status === 'VERIFIED' || user?.isKycComplete} />
                    {user?.kyc?.gstin && (
                      <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        GSTIN: {user.kyc.gstin}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 mt-1 flex items-center gap-2 font-medium">
                    {user?.phone && <span>{user.phone}</span>}
                    {user?.phone && user?.email && <span>•</span>}
                    {user?.email && <span className="text-slate-400">{user.email}</span>}
                  </div>
                </div>
              </div>

              {/* Quick Credit Pill in Header */}
              {(isCreditEnabled || user?.isCreditEnabled) && (
                <button
                  onClick={() => setActiveSection('credit')}
                  className="inline-flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/90 hover:border-emerald-300 hover:bg-emerald-100/70 text-slate-800 text-xs font-bold transition-all shadow-xs hover:scale-[1.01] active:scale-95 text-left group"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <div>
                    <div className="text-[10px] text-emerald-800 uppercase tracking-widest font-black">Available Credit</div>
                    <div className="text-sm font-black text-emerald-700">
                      ₹{Number(creditData?.availableCredit ?? user?.availableCredit ?? 0).toLocaleString('en-IN')}
                    </div>
                  </div>
                  <span className="text-xs text-emerald-700 font-bold group-hover:translate-x-0.5 transition-transform">→</span>
                </button>
              )}
            </div>

            {/* ── MOBILE: horizontal scrollable tab strip ── */}
            <div className="lg:hidden pf-nav-strip flex overflow-x-auto pt-3.5 gap-1.5 border-t border-slate-100 mt-3.5">
              {navItems.map(({ id, label, icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveSection(id)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition-all ${
                    activeSection === id
                      ? 'bg-violet-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200/60'
                  }`}
                >
                  <Ico n={icon} cls="w-3.5 h-3.5" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 lg:py-8 lg:flex lg:gap-8">

          {/* ── DESKTOP SIDEBAR ── */}
          <aside className="hidden lg:flex flex-col gap-4 w-64 flex-shrink-0">
            {/* Account Card */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex items-center gap-3.5">
              <Avatar user={user} size="md" />
              <div className="min-w-0">
                <div className="pf-display font-black text-slate-900 text-sm truncate">
                  <span className="truncate">{formData.businessName || user?.name || 'Partner Account'}</span>
                </div>
                <div className="text-[11px] text-slate-500 font-medium truncate">{user?.phone || user?.email}</div>
                <div className="mt-1">
                  {(user?.kyc?.status === 'VERIFIED' || user?.isKycComplete) ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/80">
                      <BlueVerifiedIcon cls="w-3 h-3 text-blue-600" />
                      <span>Verified Partner</span>
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-500 font-bold">● Partner Account</span>
                  )}
                </div>
              </div>
            </div>

            {/* Navigation Menu */}
            <nav className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden p-2 space-y-1">
              {navItems.map(({ id, label, icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveSection(id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 text-xs font-bold rounded-2xl text-left transition-all ${
                    activeSection === id
                      ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-200'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Ico n={icon} cls="w-4 h-4 flex-shrink-0" />
                  <span>{label}</span>
                </button>
              ))}
              <div className="border-t border-slate-100 pt-1 mt-1 space-y-1">
                <button onClick={() => navigate('/orders')} className="w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-bold text-left text-slate-600 hover:bg-slate-50 rounded-2xl transition-all">
                  <Ico n="pkg" cls="w-4 h-4 flex-shrink-0" /> My Orders
                </button>
                <button onClick={() => navigate('/wishlist')} className="w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-bold text-left text-slate-600 hover:bg-slate-50 rounded-2xl transition-all">
                  <Ico n="heart" cls="w-4 h-4 flex-shrink-0" /> Wishlist
                </button>
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-bold text-left text-rose-600 hover:bg-rose-50 rounded-2xl transition-all">
                  <Ico n="logout" cls="w-4 h-4 flex-shrink-0" /> Sign Out
                </button>
              </div>
            </nav>
          </aside>

          {/* ── MAIN CONTENT ── */}
          <main className="flex-1 min-w-0 pb-28 lg:pb-8">

            {/* ──── OVERVIEW ──── */}
            {activeSection === 'overview' && (
              <div className="pf-panel space-y-6">
                {/* Executive Welcome Card */}
                <div className="bg-gradient-to-r from-violet-50/70 via-indigo-50/40 to-slate-50 rounded-3xl p-6 sm:p-8 text-slate-900 relative overflow-hidden border border-violet-100/80 shadow-xs">
                  <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                      <h2 className="pf-display font-black text-2xl sm:text-3xl tracking-tight text-slate-900">
                        Welcome Back
                      </h2>
                      <p className="text-slate-600 text-xs sm:text-sm mt-1 max-w-lg leading-relaxed font-medium">
                        Manage your partner orders, business verification, and credit facility with Click2Kart.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        onClick={() => navigate('/products')}
                        className="px-5 py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-violet-200 active:scale-95 transition-all"
                      >
                        Product Catalogue →
                      </button>
                      <button
                        onClick={() => navigate('/orders')}
                        className="px-5 py-3 rounded-2xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs active:scale-95 transition-all border border-slate-200 shadow-xs"
                      >
                        View Orders
                      </button>
                    </div>
                  </div>
                </div>

                {/* Credit Facility Spotlight on Overview (Bright, Clean B2B Luxury) */}
                {(isCreditEnabled || user?.isCreditEnabled) && (
                  <div className="bg-white rounded-3xl p-6 border border-emerald-200/90 shadow-xs text-slate-900 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-base font-black tracking-tight text-slate-900">Approved Credit Facility</span>
                          <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                            Active Revolving Line
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">Use your revolving credit balance at checkout for instant order dispatch without cash outflow.</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setActiveSection('credit')}
                          className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all border border-slate-200"
                        >
                          View Ledger
                        </button>
                        <button
                          onClick={() => {
                            setRepayAmount(String(creditData?.outstandingBalance || ''));
                            setShowRepayModal(true);
                          }}
                          disabled={!creditData || (creditData.outstandingBalance || 0) <= 0}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider transition-all disabled:opacity-40 shadow-sm shadow-emerald-200 active:scale-95"
                        >
                          Repay Dues
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-100 shadow-xs">
                        <div className="text-[10px] uppercase font-black tracking-wider text-emerald-800">Available Credit</div>
                        <div className="text-2xl font-black text-emerald-600 mt-1">
                          ₹{Number(creditData?.availableCredit ?? user?.availableCredit ?? 0).toLocaleString('en-IN')}
                        </div>
                        <div className="text-[10px] text-emerald-700/80 font-medium mt-0.5">Ready for checkout</div>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 shadow-xs">
                        <div className="text-[10px] uppercase font-black tracking-wider text-slate-500">Approved Limit</div>
                        <div className="text-2xl font-black text-slate-900 mt-1">
                          ₹{Number(creditData?.creditLimit ?? user?.creditLimit ?? 0).toLocaleString('en-IN')}
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium mt-0.5">Sanctioned facility</div>
                      </div>
                      <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200/80 shadow-xs">
                        <div className="text-[10px] uppercase font-black tracking-wider text-amber-800">Used Credit</div>
                        <div className="text-2xl font-black text-amber-600 mt-1">
                          ₹{Number(creditData?.usedCredit ?? Math.max(0, (creditData?.creditLimit || 0) - (creditData?.availableCredit || 0))).toLocaleString('en-IN')}
                        </div>
                        <div className="text-[10px] text-amber-700/80 font-medium mt-0.5">Drawn balance</div>
                      </div>
                      <div className="bg-rose-50/60 p-4 rounded-2xl border border-rose-200/80 shadow-xs">
                        <div className="text-[10px] uppercase font-black tracking-wider text-rose-800">Outstanding Due</div>
                        <div className="text-2xl font-black text-rose-600 mt-1">
                          ₹{Number(creditData?.outstandingBalance || 0).toLocaleString('en-IN')}
                        </div>
                        <div className="text-[10px] text-rose-700/80 font-medium mt-0.5">
                          {Number(creditData?.outstandingBalance || 0) > 0 ? 'Pending repayment' : 'All clear'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Quick action grid */}
                <div className={`grid ${(isCreditEnabled || user?.isCreditEnabled) ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-2'} gap-2.5 sm:gap-4`}>
                  {[
                    ...((isCreditEnabled || user?.isCreditEnabled) ? [{
                      label: 'Credit Facility',
                      sub: `₹${Number(creditData?.availableCredit || user?.availableCredit || 0).toLocaleString('en-IN')} available`,
                      icon: 'credit',
                      color: 'bg-emerald-50 text-emerald-600',
                      action: () => setActiveSection('credit')
                    }] : []),
                    { label: 'My Orders', sub: 'Track & manage purchases', icon: 'pkg', color: 'bg-blue-50 text-blue-600', action: () => navigate('/orders') },
                    { label: 'Wishlist', sub: 'Saved products', icon: 'heart', color: 'bg-rose-50 text-rose-600', action: () => navigate('/wishlist') },
                    { label: 'Addresses', sub: `${savedAddresses.length} saved destinations`, icon: 'map', color: 'bg-teal-50 text-teal-600', action: () => setActiveSection('addresses') },
                    { label: 'Support Desk', sub: `${tickets.length} active tickets`, icon: 'help', color: 'bg-violet-50 text-violet-600', action: () => setActiveSection('support') },
                    { label: 'Business Profile', sub: formData.businessName || 'Tax & KYC', icon: 'gear', color: 'bg-amber-50 text-amber-600', action: () => setActiveSection('business') },
                  ].map(({ label, sub, icon, color, action }) => (
                    <button
                      key={label}
                      type="button"
                      onClick={action}
                      className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 border border-slate-200/70 shadow-xs hover:shadow-md hover:border-violet-200 hover:-translate-y-0.5 active:scale-[0.98] transition-all text-left group"
                    >
                      <div className={`w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl ${color} flex items-center justify-center mb-2.5 sm:mb-3.5 group-hover:scale-105 transition-transform`}>
                        <Ico n={icon} cls="w-4 h-4 sm:w-6 h-6" />
                      </div>
                      <div className="pf-display font-black text-slate-900 text-xs sm:text-sm leading-snug truncate">{label}</div>
                      <div className="text-slate-400 text-[10px] sm:text-xs mt-0.5 font-medium truncate">{sub}</div>
                    </button>
                  ))}
                </div>

                {/* Profile summary card */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="pf-display font-black text-slate-900 text-base">Account Identity & Verification</h3>
                        {(user?.kyc?.status === 'VERIFIED' || user?.isKycComplete) && (
                          <BlueVerifiedIcon cls="w-5 h-5 text-blue-600" />
                        )}
                      </div>
                      <p className="text-xs text-slate-400">Verified wholesaler contact and business profile</p>
                    </div>
                    <button
                      onClick={() => setActiveSection('personal')}
                      className="text-xs font-bold text-violet-600 hover:text-violet-800 bg-violet-50 px-3 py-1.5 rounded-xl transition"
                    >
                      Edit Profile →
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                      <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Contact Person</span>
                      <div className="font-bold text-slate-900 text-sm mt-1">{user?.name || '—'}</div>
                    </div>
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                      <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Registered Mobile (Protected)</span>
                      <div className="font-bold text-slate-900 text-sm mt-1 flex items-center gap-1.5">
                        <span>{user?.phone || '—'}</span>
                        <span className="text-[10px]">🔒</span>
                      </div>
                    </div>
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                      <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Registered Email (Protected)</span>
                      <div className="font-bold text-slate-900 text-sm mt-1 flex items-center gap-1.5 truncate">
                        <span className="truncate">{user?.email || '—'}</span>
                        <span className="text-[10px]">🔒</span>
                      </div>
                    </div>
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

            {/* ──── CREDIT ACCOUNT ──── */}
            {activeSection === 'credit' && (
              <div className="pf-panel space-y-6">
                {/* Dual Product Facility Switcher */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
                  <div>
                    <h2 className="pf-display font-black text-xl text-slate-800">Partner Financing & Credit Lines</h2>
                    <p className="text-slate-400 text-xs mt-0.5">Switch between order trade credit and direct business capital</p>
                  </div>
                  <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl w-fit">
                    <button
                      type="button"
                      onClick={() => setCreditFacilityType('trade')}
                      className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                        creditFacilityType === 'trade'
                          ? 'bg-white text-violet-700 shadow-sm'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Trade Credit (Orders)
                    </button>
                    <button
                      type="button"
                      onClick={() => setCreditFacilityType('business')}
                      className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
                        creditFacilityType === 'business'
                          ? 'bg-white text-violet-700 shadow-sm'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <span>Business Credit Line</span>
                      {businessFacilities.some(f => f.status === 'ACTIVE') ? (
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      ) : businessApps.some(a => a.status === 'APPROVED' || a.status === 'PROACTIVE_GRANTED') ? (
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                      ) : null}
                    </button>
                  </div>
                </div>

                {creditFacilityType === 'trade' ? (
                  (!isCreditEnabled && !user?.isCreditEnabled) ? (
                    <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xs text-center max-w-xl mx-auto space-y-4">
                      <div className="w-14 h-14 rounded-3xl bg-violet-50 text-violet-600 flex items-center justify-center text-2xl mx-auto shadow-sm">
                        💳
                      </div>
                      <h3 className="pf-display font-black text-xl text-slate-900">Trade Credit Facility for Wholesale Orders</h3>
                      <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
                        Trade Credit allows verified partners to order wholesale catalogue inventory without upfront cash.
                        Dues can be cleared within the agreed revolving billing cycle via online gateway or bank transfer.
                      </p>
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-left text-xs space-y-2 text-slate-700">
                        <div className="font-bold text-slate-900">Eligibility Criteria:</div>
                        <div className="flex items-center gap-2">
                          <span>{user?.kyc?.status === 'VERIFIED' ? '✓' : '○'}</span>
                          <span>Officially Verified KYC Documentation</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>○</span>
                          <span>Consistent wholesale order and trade volume on Click2Kart</span>
                        </div>
                      </div>
                      <div className="pt-2">
                        <Link
                          to="/verify-kyc"
                          className="inline-block px-6 py-3 rounded-xl font-black text-xs text-white bg-gradient-to-r from-violet-600 to-indigo-600 shadow-md shadow-violet-200"
                        >
                          Complete Verification Desk →
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-5">
                {/* Header card */}
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="pf-display font-black text-xl text-slate-800">Partner Credit Facility</h2>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Active Account
                      </span>
                    </div>
                    <p className="text-slate-400 text-xs mt-1">
                      Revolving credit limit for seamless purchasing and flexible repayments
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setRepayAmount(String(creditData?.outstandingBalance || ''));
                      setShowRepayModal(true);
                    }}
                    disabled={!creditData || (creditData.outstandingBalance || 0) <= 0}
                    className="px-5 py-3 rounded-xl font-black text-xs text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-200 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Repay Outstanding Dues
                  </button>
                </div>

                {/* 4 Cards Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Available Credit</div>
                    <div className="pf-display font-black text-2xl text-emerald-600">
                      ₹{Number(creditData?.availableCredit || 0).toLocaleString('en-IN')}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">Spendable at checkout</div>
                  </div>

                  <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Approved Credit Limit</div>
                    <div className="pf-display font-black text-2xl text-slate-800">
                      ₹{Number(creditData?.creditLimit || 0).toLocaleString('en-IN')}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">Total sanctioned limit</div>
                  </div>

                  <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Used Credit</div>
                    <div className="pf-display font-black text-2xl text-slate-700">
                      ₹{Number(creditData?.usedCredit || 0).toLocaleString('en-IN')}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">Drawn against orders</div>
                  </div>

                  <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Outstanding Balance</div>
                    <div className="pf-display font-black text-2xl text-rose-600">
                      ₹{Number(creditData?.outstandingBalance || 0).toLocaleString('en-IN')}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      {Number(creditData?.outstandingBalance || 0) > 0 ? 'Pending repayment' : 'No dues pending'}
                    </div>
                  </div>
                </div>

                {/* Utilization Progress Bar */}
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700">Credit Limit Utilization</span>
                    <span className="font-black text-violet-700">{creditData?.utilization || 0}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500 transition-all duration-500 rounded-full"
                      style={{ width: `${Math.min(100, Math.max(0, creditData?.utilization || 0))}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>₹{Number(creditData?.usedCredit || 0).toLocaleString('en-IN')} used</span>
                    <span>₹{Number(creditData?.creditLimit || 0).toLocaleString('en-IN')} limit</span>
                  </div>
                </div>

                {/* Ledger & Repayment History Tabs */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setCreditTab('ledger')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                          creditTab === 'ledger'
                            ? 'bg-white text-violet-700 shadow-sm border border-slate-200'
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        Credit Ledger ({creditTransactions.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setCreditTab('repayments')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                          creditTab === 'repayments'
                            ? 'bg-white text-violet-700 shadow-sm border border-slate-200'
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        Repayment Requests ({creditRepayments.length})
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={loadCredit}
                      disabled={creditLoading}
                      className="text-xs font-semibold text-violet-600 hover:text-violet-800 disabled:opacity-50"
                    >
                      {creditLoading ? 'Refreshing...' : '↻ Refresh'}
                    </button>
                  </div>

                  {creditTab === 'ledger' ? (
                    <div className="overflow-x-auto">
                      {creditTransactions.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 text-xs">
                          No credit transactions recorded yet.
                        </div>
                      ) : (
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50 text-[10px] uppercase font-black tracking-wider text-slate-400 border-b border-slate-100">
                            <tr>
                              <th className="px-4 py-3">Date</th>
                              <th className="px-4 py-3">Type</th>
                              <th className="px-4 py-3">Amount</th>
                              <th className="px-4 py-3">Available Balance</th>
                              <th className="px-4 py-3">Outstanding</th>
                              <th className="px-4 py-3">Reference / Order</th>
                              <th className="px-4 py-3">Reason / Details</th>
                              <th className="px-4 py-3">Initiated By</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {creditTransactions.map((tx) => (
                              <tr key={tx._id} className="hover:bg-slate-50/60 transition-colors">
                                <td className="px-4 py-3 whitespace-nowrap text-slate-500 font-medium">
                                  {new Date(tx.createdAt).toLocaleDateString('en-IN', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  {txnTypeBadge(tx.type)}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap font-black">
                                  <span className={tx.type === 'CREDIT_USED' ? 'text-rose-600' : 'text-emerald-600'}>
                                    {tx.type === 'CREDIT_USED' ? '-' : '+'}₹{Number(tx.amount || 0).toLocaleString('en-IN')}
                                  </span>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-slate-600 font-semibold">
                                  ₹{Number(tx.balanceBefore || 0).toLocaleString('en-IN')} → <span className="text-slate-900 font-bold">₹{Number(tx.balanceAfter || 0).toLocaleString('en-IN')}</span>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-slate-600 font-semibold">
                                  ₹{Number(tx.outstandingBefore || 0).toLocaleString('en-IN')} → <span className="text-slate-900 font-bold">₹{Number(tx.outstandingAfter || 0).toLocaleString('en-IN')}</span>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap font-mono text-[11px] text-slate-500">
                                  {tx.referenceId ? `#${tx.referenceId.slice(-8)}` : '—'}
                                </td>
                                <td className="px-4 py-3 max-w-xs truncate text-slate-600" title={tx.reason}>
                                  {tx.reason || '—'}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-[11px] text-slate-500 font-medium">
                                  {tx.createdByName || tx.createdBy || 'System'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      {creditRepayments.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 text-xs">
                          No repayment requests submitted yet.
                        </div>
                      ) : (
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50 text-[10px] uppercase font-black tracking-wider text-slate-400 border-b border-slate-100">
                            <tr>
                              <th className="px-4 py-3">Date</th>
                              <th className="px-4 py-3">Amount</th>
                              <th className="px-4 py-3">Method</th>
                              <th className="px-4 py-3">Status</th>
                              <th className="px-4 py-3">UTR / Payment ID</th>
                              <th className="px-4 py-3">Notes & Verification</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {creditRepayments.map((rp) => (
                              <tr key={rp._id} className="hover:bg-slate-50/60 transition-colors">
                                <td className="px-4 py-3 whitespace-nowrap text-slate-500 font-medium">
                                  {new Date(rp.createdAt).toLocaleDateString('en-IN', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap font-black text-slate-900">
                                  ₹{Number(rp.amount || 0).toLocaleString('en-IN')}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap font-semibold text-slate-600">
                                  {rp.method === 'RAZORPAY' ? 'Razorpay (Online)' : 'Bank Transfer'}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <div className="flex items-center gap-2">
                                    {repayStatusBadge(rp.status)}
                                    {rp.status === 'PAYMENT_PENDING' && rp.method === 'RAZORPAY' && (
                                      <button
                                        type="button"
                                        onClick={() => handleRetryRepayment(rp)}
                                        className="px-2.5 py-1 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-bold text-[10px] shadow-sm transition-all flex items-center gap-1"
                                        title="Complete payment for this repayment request"
                                      >
                                        <span>⚡ Pay Now</span>
                                      </button>
                                    )}
                                  </div>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap font-mono text-[11px] text-slate-600">
                                  {rp.bankTransferDetails?.utr || rp.razorpayPaymentId || rp.razorpayOrderId || '—'}
                                </td>
                                <td className="px-4 py-3 text-slate-600 max-w-xs">
                                  {rp.status === 'REJECTED' && (
                                    <div className="text-rose-600 font-bold">
                                      Rejected: {rp.rejectionReason || 'Receipt invalid'}
                                    </div>
                                  )}
                                  {rp.bankTransferDetails?.note && (
                                    <div className="text-[11px] text-slate-500">{rp.bankTransferDetails.note}</div>
                                  )}
                                  {rp.bankTransferDetails?.paymentSlip && (
                                    <a
                                      href={rp.bankTransferDetails.paymentSlip}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-[10px] text-violet-600 font-bold hover:underline block"
                                    >
                                      View Uploaded Slip ↗
                                    </a>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          ) : (
            <div className="space-y-6">
                    {/* Header Card */}
                    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 className="pf-display font-black text-xl text-slate-800">Business Credit Line</h2>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-violet-50 text-violet-700 border border-violet-200">
                            Working Capital
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                            18% p.a. Accrual Rate
                          </span>
                        </div>
                        <p className="text-slate-400 text-xs mt-1">
                          Dedicated working capital term facility for inventory procurement & business expansion. Transparent structured repayments via Bank Transfer or Razorpay.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {(businessEligibility?.isEligible || businessEligibility?.eligible || user?.isKycComplete || user?.kyc?.status === 'VERIFIED') && (
                          <button
                            type="button"
                            onClick={() => setShowBusinessApplyModal(true)}
                            className="px-4 py-2.5 rounded-xl font-black text-xs text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-md shadow-violet-200 active:scale-[0.98] transition-all whitespace-nowrap"
                          >
                            + Apply for Working Capital
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={loadBusinessCredit}
                          disabled={loadingBusinessCredit}
                          className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-all text-xs"
                          title="Refresh Facility"
                        >
                          🔄
                        </button>
                      </div>
                    </div>

                    {/* Pending Offers (Waiting for Acceptance) */}
                    {businessApps.filter(a => a.status === 'APPROVED' || a.status === 'PROACTIVE_GRANTED').map(offer => (
                      <div
                        key={offer._id}
                        className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-violet-500/10 rounded-2xl p-6 border-2 border-amber-300 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">🎉</span>
                            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-400 text-amber-950 shadow-xs">
                              {offer.status === 'PROACTIVE_GRANTED' ? 'Pre-Approved Credit Grant' : 'Facility Sanctioned'}
                            </span>
                          </div>
                          <h3 className="pf-display font-black text-2xl text-slate-900">
                            ₹{Number(offer.approvedAmount || offer.requestedAmount).toLocaleString('en-IN')} Working Capital Approved
                          </h3>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
                            <div className="bg-white/80 p-2.5 rounded-xl border border-amber-200">
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Tenure</span>
                              <span className="font-black text-slate-800">{offer.approvedTenureMonths || offer.requestedTenureMonths} Months</span>
                            </div>
                            <div className="bg-white/80 p-2.5 rounded-xl border border-amber-200">
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Interest Rate</span>
                              <span className="font-black text-slate-800">{offer.approvedInterestRateAnnual || 18}% p.a.</span>
                            </div>
                            <div className="bg-white/80 p-2.5 rounded-xl border border-amber-200">
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Frequency</span>
                              <span className="font-black text-slate-800 capitalize">{offer.repaymentFrequency || 'WEEKLY'}</span>
                            </div>
                            <div className="bg-white/80 p-2.5 rounded-xl border border-amber-200">
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Processing Fee</span>
                              <span className="font-black text-slate-800">2% + 18% GST</span>
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => openAcceptOfferModal(offer)}
                          className="px-6 py-4 rounded-xl font-black text-sm text-amber-950 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 shadow-lg shadow-amber-300/40 active:scale-[0.98] transition-all whitespace-nowrap cursor-pointer"
                        >
                          Review & Accept Agreement →
                        </button>
                      </div>
                    ))}

                    {/* Active Facilities Section */}
                    {loadingBusinessCredit ? (
                      <div className="bg-white rounded-2xl p-12 text-center text-slate-400 font-medium">
                        Loading business credit line details...
                      </div>
                    ) : businessFacilities.length === 0 ? (
                      (() => {
                        const isKycVerified = Boolean(user?.isKycComplete || user?.kyc?.status === 'VERIFIED');
                        const isKycPending = user?.kyc?.status === 'PENDING_VERIFICATION' || user?.kyc?.status === 'UNDER_REVIEW' || user?.kyc?.status === 'SUBMITTED';
                        const payoutPendingApp = businessApps.find(a => ['OFFER_ACCEPTED', 'ACCEPTED', 'DISBURSEMENT_PENDING'].includes(a.status));
                        const pendingApp = businessApps.find(a => ['SUBMITTED', 'UNDER_REVIEW', 'PENDING_REVIEW'].includes(a.status));
                        const infoReqApp = businessApps.find(a => a.status === 'ADDITIONAL_INFO_REQUIRED');

                        if (payoutPendingApp) {
                          return (
                            <div className="bg-white rounded-3xl p-8 border border-purple-200 shadow-sm text-center max-w-xl mx-auto space-y-4">
                              <div className="w-14 h-14 rounded-3xl bg-purple-50 text-purple-600 flex items-center justify-center text-2xl mx-auto shadow-sm">
                                🏦
                              </div>
                              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200">
                                <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                                <span>Offer Accepted — Payout In Process</span>
                              </div>
                              <h3 className="pf-display font-black text-xl text-slate-900">
                                ₹{Number(payoutPendingApp.approvedOffer?.approvedAmount || payoutPendingApp.requestedAmount).toLocaleString('en-IN')} Sanction Confirmed
                              </h3>
                              <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
                                Your facility agreement has been accepted. Administration is processing the disbursement bank transfer (NEFT/RTGS). Funds will be credited directly to your registered bank account shortly.
                              </p>
                              <div className="p-3.5 bg-purple-50/60 rounded-2xl border border-purple-100 text-xs text-purple-950 font-medium space-y-1 text-left">
                                <div className="flex justify-between font-bold text-slate-800">
                                  <span>Application #{payoutPendingApp.applicationNumber}</span>
                                  <span className="text-emerald-700">Net Payout: ₹{Math.round(Number(payoutPendingApp.approvedOffer?.approvedAmount || payoutPendingApp.requestedAmount) * (1 - 0.02 * 1.18)).toLocaleString('en-IN')}</span>
                                </div>
                                {payoutPendingApp.businessDetails?.bankDetails?.accountNumber ? (
                                  <div className="text-[11px] text-slate-600 pt-1 border-t border-purple-100">
                                    Beneficiary Account: <strong className="text-slate-800">{payoutPendingApp.businessDetails.bankDetails.bankName || 'Bank'}</strong> (A/C: <span className="font-mono">{payoutPendingApp.businessDetails.bankDetails.accountNumber}</span>, IFSC: <span className="font-mono">{payoutPendingApp.businessDetails.bankDetails.ifsc}</span>)
                                  </div>
                                ) : (
                                  <div className="text-[11px] text-slate-600 pt-1 border-t border-purple-100">
                                    Tenure: {payoutPendingApp.approvedOffer?.approvedTenureMonths || payoutPendingApp.requestedTenureMonths} Months ({payoutPendingApp.approvedOffer?.repaymentFrequency || 'Weekly'})
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        }

                        if (pendingApp) {
                          return (
                            <div className="bg-white rounded-3xl p-8 border border-amber-200 shadow-sm text-center max-w-xl mx-auto space-y-4">
                              <div className="w-14 h-14 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center text-2xl mx-auto shadow-sm">
                                ⏳
                              </div>
                              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
                                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                <span>Application Under Review</span>
                              </div>
                              <h3 className="pf-display font-black text-xl text-slate-900">
                                ₹{Number(pendingApp.requestedAmount).toLocaleString('en-IN')} Working Capital Requested
                              </h3>
                              <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
                                Our risk and compliance committee is evaluating your application (#{pendingApp.applicationNumber}). You will be notified as soon as sanctioned loan terms are ready.
                              </p>
                              <div className="p-3 bg-amber-50/50 rounded-2xl border border-amber-100 text-xs text-amber-900 font-semibold">
                                Requested Tenure: {pendingApp.requestedTenureMonths} Months • {pendingApp.requestedFrequency || 'Weekly'} instalments
                              </div>
                            </div>
                          );
                        }

                        if (infoReqApp) {
                          return (
                            <div className="bg-white rounded-3xl p-8 border border-amber-200 shadow-sm text-center max-w-xl mx-auto space-y-4">
                              <div className="w-14 h-14 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center text-2xl mx-auto shadow-sm">
                                📋
                              </div>
                              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
                                <span>Additional Information Required</span>
                              </div>
                              <h3 className="pf-display font-black text-xl text-slate-900">
                                Application #{infoReqApp.applicationNumber}
                              </h3>
                              <p className="text-xs text-slate-700 bg-amber-50 p-3 rounded-xl border border-amber-100 leading-relaxed max-w-md mx-auto font-medium">
                                Reviewer Note: {infoReqApp.adminNotes || 'Please submit updated documentation.'}
                              </p>
                              <button
                                type="button"
                                onClick={() => setActiveSection('support')}
                                className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-amber-600 hover:bg-amber-700 transition-all shadow-sm"
                              >
                                Contact Support Desk →
                              </button>
                            </div>
                          );
                        }

                        if (isKycVerified) {
                          return (
                            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xs text-center max-w-xl mx-auto space-y-4">
                              <div className="w-14 h-14 rounded-3xl bg-violet-50 text-violet-600 flex items-center justify-center text-2xl mx-auto shadow-sm">
                                💼
                              </div>
                              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <span>✓ Pre-Qualified Partner</span>
                              </div>
                              <h3 className="pf-display font-black text-xl text-slate-900">Working Capital Credit Facility</h3>
                              <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
                                Access dedicated working capital to finance wholesale purchase orders, supplier settlements, and seasonal inventory expansion with structured repayment.
                              </p>
                              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-left text-xs space-y-2.5 text-slate-700">
                                <div className="font-bold text-slate-900">Facility Features & Terms:</div>
                                <div className="flex items-center gap-2">
                                  <span className="text-violet-600 font-bold">✓</span>
                                  <span>Flexible tenure: 1 to 5 months with weekly or daily structured instalments</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-violet-600 font-bold">✓</span>
                                  <span>Interest rate: 18% p.a. calculated on outstanding principal balance</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-violet-600 font-bold">✓</span>
                                  <span>Transparent 2% processing fee (+ 18% GST) deducted directly at disbursement</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-violet-600 font-bold">✓</span>
                                  <span>Repayment methods: Instant bank transfer (NEFT/RTGS) and Razorpay checkout</span>
                                </div>
                              </div>

                              <div className="pt-2 space-y-2">
                                <button
                                  type="button"
                                  onClick={() => setShowBusinessApplyModal(true)}
                                  className="inline-block px-6 py-3 rounded-xl font-black text-xs text-white bg-gradient-to-r from-violet-600 to-indigo-600 shadow-md shadow-violet-200 hover:from-violet-700 hover:to-indigo-700 active:scale-[0.98] transition-all"
                                >
                                  + Apply for Working Capital Facility →
                                </button>
                                <p className="text-[11px] text-slate-400">Sanctioned limits up to ₹5,00,000. No collateral required.</p>
                              </div>
                            </div>
                          );
                        }

                        if (isKycPending) {
                          return (
                            <div className="bg-white rounded-3xl p-8 border border-purple-100 shadow-xs text-center max-w-xl mx-auto space-y-4">
                              <div className="w-14 h-14 rounded-3xl bg-purple-50 text-purple-600 flex items-center justify-center text-2xl mx-auto shadow-sm animate-pulse">
                                ⏳
                              </div>
                              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200">
                                <span>Verification in Progress</span>
                              </div>
                              <h3 className="pf-display font-black text-xl text-slate-900">KYC Under Review</h3>
                              <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
                                Your business KYC documentation is currently being verified by our compliance team. Once approved, the Business Credit application desk will automatically unlock.
                              </p>
                              <div className="pt-2">
                                <Link
                                  to="/verify-kyc"
                                  className="inline-block px-6 py-3 rounded-xl font-black text-xs text-white bg-purple-600 hover:bg-purple-700 shadow-md shadow-purple-200 transition-all"
                                >
                                  View Verification Status →
                                </Link>
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xs text-center max-w-xl mx-auto space-y-4">
                            <div className="w-14 h-14 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center text-2xl mx-auto shadow-sm">
                              🛡️
                            </div>
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
                              <span>KYC Verification Required</span>
                            </div>
                            <h3 className="pf-display font-black text-xl text-slate-900">Complete Your Partner KYC</h3>
                            <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
                              Complete your 3-step structured business verification to activate wholesale ordering and apply for high-limit business working capital facilities.
                            </p>
                            <div className="pt-2">
                              <Link
                                to="/verify-kyc"
                                className="inline-block px-6 py-3 rounded-xl font-black text-xs text-white bg-gradient-to-r from-violet-600 to-indigo-600 shadow-md shadow-violet-200 hover:from-violet-700 hover:to-indigo-700 transition-all"
                              >
                                Complete KYC Verification Desk →
                              </Link>
                            </div>
                          </div>
                        );
                      })()
                    ) : (
                      <div className="space-y-6">
                        {businessFacilities.map(fac => {
                          const isDelinquent = fac.status === 'DELINQUENT';
                          const isClosed = fac.status === 'CLOSED';
                          return (
                            <div
                              key={fac._id}
                              className={`bg-white rounded-2xl border ${
                                isDelinquent ? 'border-rose-200' : 'border-slate-100'
                              } shadow-sm overflow-hidden`}
                            >
                              {/* Facility Header */}
                              <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-50/50">
                                <div>
                                  <div className="flex items-center gap-2.5">
                                    <h3 className="pf-display font-black text-lg text-slate-900">
                                      {fac.facilityNumber || 'Facility Account'}
                                    </h3>
                                    <span
                                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                                        fac.status === 'ACTIVE'
                                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                          : fac.status === 'DELINQUENT'
                                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                                          : 'bg-slate-100 text-slate-600 border-slate-200'
                                      }`}
                                    >
                                      {fac.status}
                                    </span>
                                    <span className="text-xs text-slate-400">
                                      Sanctioned {new Date(fac.createdAt).toLocaleDateString('en-IN')}
                                    </span>
                                  </div>
                                  <p className="text-xs text-slate-500 mt-1">
                                    Tenure: {fac.tenureMonths} Months ({fac.repaymentFrequency} instalments) • {fac.interestRateAnnual}% p.a. accrued daily on principal
                                  </p>
                                </div>

                                <div className="flex items-center gap-2">
                                  {!isClosed && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setSelectedRepayFacility(fac);
                                        setBusinessRepayAmount(String(fac.nextDueAmount || fac.totalOutstandingBalance || ''));
                                        setShowBusinessRepayModal(true);
                                      }}
                                      className="px-4 py-2.5 rounded-xl font-black text-xs text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-md shadow-violet-200 active:scale-[0.98] transition-all"
                                    >
                                      Repay Facility
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedScheduleFacility(fac);
                                      setShowScheduleModal(true);
                                    }}
                                    className="px-4 py-2.5 rounded-xl font-bold text-xs border border-slate-200 text-slate-700 hover:bg-slate-100 transition-all"
                                  >
                                    View Schedule
                                  </button>
                                </div>
                              </div>

                              {/* 4 Cards Grid */}
                              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-6">
                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                  <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                                    Principal Outstanding
                                  </div>
                                  <div className="font-black text-slate-900 text-xl mt-1">
                                    ₹{Math.round(fac.currentPrincipalBalance || 0).toLocaleString('en-IN')}
                                  </div>
                                  <div className="text-[10px] text-slate-400 mt-0.5">
                                    Original: ₹{Math.round(fac.disbursedAmount || 0).toLocaleString('en-IN')}
                                  </div>
                                </div>

                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                  <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                                    Accrued Interest
                                  </div>
                                  <div className="font-black text-violet-700 text-xl mt-1">
                                    ₹{Number(fac.accruedInterestBalance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </div>
                                  <div className="text-[10px] text-slate-400 mt-0.5">
                                    Accrued daily on outstanding principal
                                  </div>
                                </div>

                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                  <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                                    Next Due Instalment
                                  </div>
                                  <div className="font-black text-amber-700 text-xl mt-1">
                                    ₹{Math.round(fac.nextDueAmount || 0).toLocaleString('en-IN')}
                                  </div>
                                  <div className="text-[10px] text-slate-400 mt-0.5">
                                    {fac.nextDueDate ? `Due ${new Date(fac.nextDueDate).toLocaleDateString('en-IN')}` : 'None'}
                                  </div>
                                </div>

                                <div className="p-4 rounded-2xl bg-violet-50/50 border border-violet-100">
                                  <div className="text-[10px] font-black uppercase tracking-wider text-violet-600">
                                    Total Outstanding
                                  </div>
                                  <div className="font-black text-slate-900 text-xl mt-1">
                                    ₹{Math.round(fac.totalOutstandingBalance || 0).toLocaleString('en-IN')}
                                  </div>
                                  <div className="text-[10px] text-violet-600 font-bold mt-0.5">
                                    Principal + Accrued Interest
                                  </div>
                                </div>
                              </div>

                              {/* Mandate Bar */}
                              <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-slate-700">AutoPay Status:</span>
                                  {(fac.autoPayMandate?.status === 'ACTIVE' || fac.mandate?.status === 'ACTIVE') ? (
                                    <span className="text-emerald-700 font-bold flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                                      <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                      <span>AutoPay Active</span>
                                      <span className="text-slate-400 font-mono text-[10px]">({fac.autoPayMandate?.mandateId || fac.mandate?.mandateId})</span>
                                    </span>
                                  ) : (
                                    <span className="text-slate-600 font-medium flex items-center gap-1.5 bg-amber-50/70 px-2.5 py-1 rounded-full border border-amber-200">
                                      <span className="inline-block w-2 h-2 rounded-full bg-amber-500" />
                                      <span>Manual Repayment Active</span>
                                      <span className="text-slate-400 font-normal hidden sm:inline">• (AutoPay optional)</span>
                                    </span>
                                  )}
                                </div>

                                {!(fac.autoPayMandate?.status === 'ACTIVE' || fac.mandate?.status === 'ACTIVE') && (
                                  <button
                                    type="button"
                                    onClick={() => handleInitAutoPay(fac)}
                                    className="px-3.5 py-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                                  >
                                    <span>⚡ Set up AutoPay Mandate</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Applications Tracker */}
                    {businessApps.length > 0 && (
                      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100">
                          <h3 className="pf-display font-black text-base text-slate-900">Application History</h3>
                          <p className="text-xs text-slate-400">All submitted business credit line requests</p>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs text-slate-600">
                            <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100">
                              <tr>
                                <th className="px-6 py-3">Date</th>
                                <th className="px-6 py-3">Requested Limit</th>
                                <th className="px-6 py-3">Tenure</th>
                                <th className="px-6 py-3">Frequency</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Action</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {businessApps.map(app => (
                                <tr key={app._id} className="hover:bg-slate-50/50">
                                  <td className="px-6 py-3 whitespace-nowrap font-medium text-slate-900">
                                    {new Date(app.createdAt).toLocaleDateString('en-IN')}
                                  </td>
                                  <td className="px-6 py-3 whitespace-nowrap font-bold text-slate-900">
                                    ₹{Number(app.requestedAmount).toLocaleString('en-IN')}
                                  </td>
                                  <td className="px-6 py-3 whitespace-nowrap font-semibold">
                                    {app.requestedTenureMonths} Months
                                  </td>
                                  <td className="px-6 py-3 whitespace-nowrap capitalize">
                                    {app.repaymentFrequency}
                                  </td>
                                  <td className="px-6 py-3 whitespace-nowrap">
                                    <span
                                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                        app.status === 'APPROVED' || app.status === 'PROACTIVE_GRANTED'
                                          ? 'bg-amber-100 text-amber-800'
                                          : app.status === 'DISBURSED' || app.status === 'ACCEPTED'
                                          ? 'bg-emerald-100 text-emerald-800'
                                          : app.status === 'REJECTED'
                                          ? 'bg-rose-100 text-rose-800'
                                          : 'bg-slate-100 text-slate-700'
                                      }`}
                                    >
                                      {app.status}
                                    </span>
                                  </td>
                                  <td className="px-6 py-3 whitespace-nowrap">
                                    {(app.status === 'APPROVED' || app.status === 'PROACTIVE_GRANTED') && (
                                      <button
                                        type="button"
                                        onClick={() => openAcceptOfferModal(app)}
                                        className="text-violet-600 font-bold hover:underline cursor-pointer"
                                      >
                                        Accept Offer →
                                      </button>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}
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
                      <div className="relative">
                        <input type="email" value={user?.email || formData.email || ''} disabled className={disabledCls + ' pl-10'} />
                        <div className="absolute left-3.5 top-3.5 text-slate-400">
                          <Ico n="lock" cls="w-4 h-4" />
                        </div>
                      </div>
                    </Field>
                    <Field label="Phone Number">
                      <div className="relative">
                        <input type="tel" value={formData.phone || user?.phone || ''} disabled className={disabledCls + ' pl-10'} />
                        <div className="absolute left-3.5 top-3.5 text-slate-400">
                          <Ico n="lock" cls="w-4 h-4" />
                        </div>
                      </div>
                    </Field>
                  </div>

                  {/* Informational card for locked contact info */}
                  <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-xl bg-amber-100 text-amber-700 flex-shrink-0">
                        <Ico n="lock" cls="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-black text-amber-900">Email & Mobile Number are Protected</div>
                        <div className="text-[11px] text-amber-800/80 mt-0.5 leading-relaxed">
                          For account security and GST verification, registered email and phone number cannot be edited directly. To request an update, please raise a support ticket.
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRequestContactChange}
                      className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-black tracking-wide whitespace-nowrap active:scale-95 transition-all shadow-sm shadow-amber-200 flex-shrink-0"
                    >
                      Raise Ticket to Update
                    </button>
                  </div>

                  <button type="submit" disabled={saving} className={btnPrimary}>
                    {saving ? 'Saving…' : 'Save Changes'}
                  </button>
                </form>
              </div>
            )}

            {/* ──── BUSINESS INFO & KYC (Strictly Read-Only, No Direct Uploads) ──── */}
            {activeSection === 'business' && (
              <div className="pf-panel bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden space-y-6 p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <h2 className="pf-display font-black text-xl text-slate-800 tracking-tight">Business Profile & KYC Records</h2>
                    <p className="text-slate-400 text-xs mt-0.5">Verified partner identity records, GSTIN, and encrypted compliance documents</p>
                  </div>
                  <Link
                    to="/verify-kyc"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-violet-200 transition-all whitespace-nowrap active:scale-95"
                  >
                    <span>🛡️ KYC Verification Desk →</span>
                  </Link>
                </div>

                {/* ── STATUS BANNERS ── */}
                {(!user?.kyc?.status || user?.kyc?.status === 'NOT_SUBMITTED' || (!user?.isKycComplete && !user?.kyc?.status)) && (
                  <div className="p-5 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xl flex-shrink-0">⚠️</div>
                      <div>
                        <h4 className="font-black text-amber-900 text-sm">Complete Your KYC Verification</h4>
                        <p className="text-xs text-amber-700/90 mt-0.5 font-medium leading-relaxed">
                          Your KYC is currently unverified. Complete the 3-step structured verification to unlock order placement and GST invoicing.
                        </p>
                      </div>
                    </div>
                    <Link to="/verify-kyc" className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs uppercase tracking-wider shadow-sm transition-all whitespace-nowrap">
                      Complete Your KYC →
                    </Link>
                  </div>
                )}

                {user?.kyc?.status === 'PENDING_VERIFICATION' && (
                  <div className="p-5 bg-gradient-to-r from-purple-500/10 via-purple-500/5 to-transparent border border-purple-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-xl flex-shrink-0 animate-pulse">⏳</div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-black text-purple-900 text-sm">Already Submitted, Wait for Approval</h4>
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-300">In Review</span>
                        </div>
                        <p className="text-xs text-purple-700/90 mt-0.5 font-medium leading-relaxed">
                          Wait for some time, your KYC details are in review. It will be verified soon by administration.
                        </p>
                      </div>
                    </div>
                    <Link to="/verify-kyc" className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs uppercase tracking-wider shadow-sm transition-all whitespace-nowrap">
                      View Status →
                    </Link>
                  </div>
                )}

                {(user?.kyc?.status === 'VERIFIED' || user?.isKycComplete) && (
                  <div className="p-5 bg-gradient-to-r from-blue-500/10 via-indigo-500/5 to-transparent border border-blue-200/90 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-blue-200">
                        <BlueVerifiedIcon cls="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-black text-blue-950 text-sm">KYC Verified & Officially Locked</h4>
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-300">
                            <BlueVerifiedIcon cls="w-3 h-3 text-blue-600" />
                            Verified Partner
                          </span>
                        </div>
                        <p className="text-xs text-blue-900/80 mt-0.5 font-medium leading-relaxed">
                          Your business documentation is officially verified. For compliance security, records are locked against direct edits.
                        </p>
                      </div>
                    </div>
                    <Link to="/verify-kyc" className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs uppercase tracking-wider shadow-md shadow-blue-200 transition-all whitespace-nowrap active:scale-95">
                      View Certificate →
                    </Link>
                  </div>
                )}

                {user?.kyc?.status === 'REJECTED' && (
                  <div className="p-5 bg-gradient-to-r from-rose-500/10 via-rose-500/5 to-transparent border border-rose-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-2xl bg-rose-100 text-rose-800 flex items-center justify-center font-bold text-xl flex-shrink-0">⚠️</div>
                      <div>
                        <h4 className="font-black text-rose-900 text-sm">KYC Revision Required</h4>
                        <p className="text-xs text-rose-700/90 mt-0.5 font-medium leading-relaxed">
                          {user?.kyc?.rejectionReason || 'Please review admin feedback and re-submit corrected documents.'}
                        </p>
                      </div>
                    </div>
                    <Link to="/verify-kyc" className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs uppercase tracking-wider shadow-sm transition-all whitespace-nowrap">
                      Re-upload Documents →
                    </Link>
                  </div>
                )}

                {/* ── READ-ONLY BUSINESS INFORMATION ── */}
                <div className="space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Official Business Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs">
                    <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Business / Shop Name</span>
                      <div className="font-extrabold text-slate-900 text-sm">{formData.businessName || user?.kyc?.businessName || '—'}</div>
                    </div>
                    <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Trade Name</span>
                      <div className="font-bold text-slate-800 text-sm">{formData.tradeName || user?.kyc?.tradeName || formData.businessName || '—'}</div>
                    </div>
                    <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Business Constitution</span>
                      <div className="font-bold text-slate-800 text-sm">{formData.businessType || user?.kyc?.businessType || 'Retail Store'}</div>
                    </div>
                    <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">GSTIN Number</span>
                      <div className="font-mono font-bold text-slate-900 text-sm">{formData.gstin || user?.kyc?.gstin || 'Not Provided (Exempt)'}</div>
                    </div>
                    <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">PAN Number</span>
                      <div className="font-mono font-bold text-purple-700 text-sm">{formData.pan || user?.kyc?.pan || '—'}</div>
                    </div>
                    <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Aadhaar Number</span>
                      <div className="font-mono font-bold text-slate-900 text-sm">
                        {(formData.aadhaarNumber || user?.kyc?.aadhaarNumber)
                          ? `•••• •••• ${(formData.aadhaarNumber || user?.kyc?.aadhaarNumber).slice(-4)}`
                          : '—'}
                      </div>
                    </div>
                    <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 sm:col-span-2 lg:col-span-3">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Registered Business Address</span>
                      <div className="font-semibold text-slate-800 text-xs leading-relaxed">
                        {formData.addressLine1
                          ? `${formData.addressLine1}${formData.addressLine2 ? ', ' + formData.addressLine2 : ''}, ${formData.city}, ${formData.state} - ${formData.pincode}`
                          : (user?.address || 'No registered address on file')}
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── OFFICIAL VERIFICATION DOCUMENTS (Hidden by default, Eye button to view) ── */}
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Official Verification Documents</h3>
                      <p className="text-[11px] text-slate-500 font-medium">Click the eye icon to securely inspect submitted documents</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-wider">
                      Encrypted Records 🔒
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    {/* PAN Document Card */}
                    <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-3 hover:bg-slate-100/70 transition-all">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center font-bold text-base flex-shrink-0">
                          🪪
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-black text-slate-900 truncate">PAN Card Photo</div>
                          <div className="text-[10px] text-slate-500 font-medium">
                            {formData.panCard || user?.kyc?.panCard ? 'Document on file' : 'Not uploaded'}
                          </div>
                        </div>
                      </div>
                      {(formData.panCard || user?.kyc?.panCard) ? (
                        <button
                          type="button"
                          onClick={() => setPreviewDoc({
                            url: getImageUrl(formData.panCard || user?.kyc?.panCard) || (formData.panCard || user?.kyc?.panCard),
                            title: 'PAN Card Official Photo'
                          })}
                          className="px-3 py-1.5 rounded-xl bg-white hover:bg-violet-50 text-violet-700 border border-violet-200 hover:border-violet-300 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-xs transition-all active:scale-95 flex-shrink-0"
                          title="View PAN Card"
                        >
                          <span>👁️</span>
                          <span>View</span>
                        </button>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-400 italic">Pending</span>
                      )}
                    </div>

                    {/* Aadhaar Front Card */}
                    <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-3 hover:bg-slate-100/70 transition-all">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-base flex-shrink-0">
                          📄
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-black text-slate-900 truncate">Aadhaar Front</div>
                          <div className="text-[10px] text-slate-500 font-medium">
                            {(formData.aadhaarFront || user?.kyc?.aadhaarFront || user?.kyc?.aadhaarCard) ? 'Document on file' : 'Not uploaded'}
                          </div>
                        </div>
                      </div>
                      {(formData.aadhaarFront || user?.kyc?.aadhaarFront || user?.kyc?.aadhaarCard) ? (
                        <button
                          type="button"
                          onClick={() => setPreviewDoc({
                            url: getImageUrl(formData.aadhaarFront || user?.kyc?.aadhaarFront || user?.kyc?.aadhaarCard) || (formData.aadhaarFront || user?.kyc?.aadhaarFront || user?.kyc?.aadhaarCard),
                            title: 'Aadhaar Card Front Photo'
                          })}
                          className="px-3 py-1.5 rounded-xl bg-white hover:bg-violet-50 text-violet-700 border border-violet-200 hover:border-violet-300 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-xs transition-all active:scale-95 flex-shrink-0"
                          title="View Aadhaar Front"
                        >
                          <span>👁️</span>
                          <span>View</span>
                        </button>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-400 italic">Pending</span>
                      )}
                    </div>

                    {/* Aadhaar Back Card */}
                    <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-3 hover:bg-slate-100/70 transition-all">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-base flex-shrink-0">
                          📑
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-black text-slate-900 truncate">Aadhaar Back</div>
                          <div className="text-[10px] text-slate-500 font-medium">
                            {(formData.aadhaarBack || user?.kyc?.aadhaarBack) ? 'Document on file' : 'Not uploaded'}
                          </div>
                        </div>
                      </div>
                      {(formData.aadhaarBack || user?.kyc?.aadhaarBack) ? (
                        <button
                          type="button"
                          onClick={() => setPreviewDoc({
                            url: getImageUrl(formData.aadhaarBack || user?.kyc?.aadhaarBack) || (formData.aadhaarBack || user?.kyc?.aadhaarBack),
                            title: 'Aadhaar Card Back Photo'
                          })}
                          className="px-3 py-1.5 rounded-xl bg-white hover:bg-violet-50 text-violet-700 border border-violet-200 hover:border-violet-300 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-xs transition-all active:scale-95 flex-shrink-0"
                          title="View Aadhaar Back"
                        >
                          <span>👁️</span>
                          <span>View</span>
                        </button>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-400 italic">Pending</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Notice & Support Ticket Redirection */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 text-slate-600">
                    <span className="text-base">🔒</span>
                    <span className="font-medium">Direct document uploads are disabled here to prevent tampering. To update any details, raise a compliance ticket.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setNewTicketForm({ subject: 'KYC Document Update Request', description: '', category: 'KYC/Profile', relatedOrder: '' });
                      setShowNewTicketModal(true);
                    }}
                    className="text-violet-700 font-bold hover:underline whitespace-nowrap text-left"
                  >
                    Raise KYC Ticket →
                  </button>
                </div>
              </div>
            )}

            {/* ──── BUSINESS ADDRESS ──── */}
            {activeSection === 'addresses' && (
              <div className="pf-panel space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="pf-display font-black text-slate-800">Business Address</h2>
                    <p className="text-slate-400 text-xs mt-0.5">This address will be used for your business profile</p>
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
                    <h3 className="pf-display font-black text-slate-700 mb-1">No business address yet</h3>
                    <p className="text-slate-400 text-sm mb-4">Add your business address to complete your profile</p>
                    <button onClick={handleAddAddress} className="px-5 py-2.5 bg-violet-600 text-white rounded-xl font-bold text-sm hover:bg-violet-700 transition-all">
                      Add Address
                    </button>
                  </div>
                ) : (
                  savedAddresses.map(addr => (
                    <div key={addr._id} className={`bg-white rounded-2xl border-2 shadow-sm p-4 ${
                      (addr.isDefault || selectedBusinessAddress?._id === addr._id) 
                        ? 'border-violet-500 shadow-violet-100' 
                        : 'border-slate-100 hover:border-violet-200'
                    }`}>
                      <div className="flex items-start gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          (addr.isDefault || selectedBusinessAddress?._id === addr._id) 
                            ? 'bg-violet-600 text-white' 
                            : 'bg-violet-50 text-violet-600'
                        }`}>
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
                            {selectedBusinessAddress?._id === addr._id && (
                              <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-black rounded-full border border-amber-200">Selected for KYC</span>
                            )}
                          </div>
                          <p className="text-slate-500 text-xs leading-relaxed">
                            {addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ''}<br />
                            {addr.city}, {addr.district}, {addr.state} – {addr.pincode}
                          </p>
                          <div className="flex gap-3 mt-2">
                            {!addr.isDefault && (
                              <button onClick={() => handleSetDefault(addr._id)}
                                className="text-violet-600 text-xs font-bold hover:underline">
                                Set as default
                              </button>
                            )}
                            <button 
                              onClick={() => handleSelectBusinessAddress(addr)}
                              className="text-violet-600 text-xs font-bold hover:underline">
                              Use for KYC
                            </button>
                          </div>
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
                      <button onClick={() => { setShowPasswordChange(false); setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' }); setPasswordChangeMode('password'); setOtpSent(false); setOtp(''); }}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                        <Ico n="chevL" cls="w-4 h-4" />
                      </button>
                      <h3 className="pf-display font-black text-slate-800 text-sm">Change Password</h3>
                    </div>
                    <div className="p-5">
                      <div className="flex gap-2 mb-5 p-1 bg-slate-50 rounded-xl">
                        <button
                          onClick={() => setPasswordChangeMode('password')}
                          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                            passwordChangeMode === 'password'
                              ? 'bg-white text-violet-600 shadow-sm'
                              : 'text-slate-400 hover:text-slate-600'
                          }`}
                        >
                          Via Current Password
                        </button>
                        <button
                          onClick={() => setPasswordChangeMode('otp')}
                          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                            passwordChangeMode === 'otp'
                              ? 'bg-white text-violet-600 shadow-sm'
                              : 'text-slate-400 hover:text-slate-600'
                          }`}
                        >
                          Via OTP
                        </button>
                      </div>

                      {passwordChangeMode === 'password' ? (
                        <form onSubmit={handlePasswordUpdate} className="space-y-4">
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
                      ) : (
                        <form onSubmit={handlePasswordUpdateViaOTP} className="space-y-4">
                          <div className="grid grid-cols-2 gap-3">
                            <Field label="Email">
                              <input
                                type="email"
                                value={user.email}
                                disabled
                                className={disabledCls}
                              />
                            </Field>
                            <div className="space-y-1">
                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">
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
                                  className="px-3 rounded-xl bg-violet-100 text-violet-600 text-xs font-bold hover:bg-violet-200 transition-all disabled:opacity-50"
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

          </main>
        </div>

        {/* ── MOBILE BOTTOM NAV ── */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200/80 z-40 safe-area-pb shadow-lg">
          <div className="flex items-center justify-around px-1 py-1 overflow-x-auto no-scrollbar">
            {navItems.map(({ id, label, shortLabel, icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveSection(id)}
                className={`min-w-[46px] flex-1 flex flex-col items-center justify-center gap-0.5 py-1.5 px-0.5 rounded-xl transition-all ${
                  activeSection === id ? 'text-violet-600 font-extrabold' : 'text-slate-400 hover:text-slate-600 font-medium'
                }`}
              >
                <Ico n={icon} cls="w-4 h-4 sm:w-5 h-5 flex-shrink-0" />
                <span className="text-[9px] uppercase tracking-wider truncate max-w-[56px] text-center leading-tight">
                  {shortLabel || label}
                </span>
                {activeSection === id && <div className="w-1 h-1 rounded-full bg-violet-600 mt-0.5" />}
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

      {/* ════ CREDIT REPAYMENT MODAL ════ */}
      {showRepayModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-100">
            <div className="sticky top-0 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-slate-100 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">
                  <Ico n="credit" cls="w-5 h-5" />
                </div>
                <div>
                  <h2 className="pf-display font-black text-slate-900 text-base">Repay Credit Facility</h2>
                  <p className="text-slate-400 text-xs">Clear your revolving balance to restore credit limit</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowRepayModal(false)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
              >
                <Ico n="close" cls="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Due Summary Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-50/70 via-slate-50 to-indigo-50/40 border border-rose-100 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-wider text-rose-800">Total Outstanding Due</div>
                  <div className="text-2xl font-black text-rose-600 mt-0.5">
                    ₹{Number(creditData?.outstandingBalance || 0).toLocaleString('en-IN')}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Available Limit</div>
                  <div className="text-sm font-bold text-slate-700 mt-0.5">
                    ₹{Number(creditData?.availableCredit || 0).toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Select Payment Method</label>
                {companyBankConfig?.enabled ? (
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setRepayMethod('RAZORPAY')}
                      className={`p-3.5 rounded-2xl border text-left transition-all ${
                        repayMethod === 'RAZORPAY'
                          ? 'border-violet-600 bg-violet-50/60 ring-2 ring-violet-500/20 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-900">Instant Online</span>
                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">Instant</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1">UPI (GPay, PhonePe), Cards, Netbanking</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRepayMethod('BANK_TRANSFER')}
                      className={`p-3.5 rounded-2xl border text-left transition-all ${
                        repayMethod === 'BANK_TRANSFER'
                          ? 'border-violet-600 bg-violet-50/60 ring-2 ring-violet-500/20 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-900">Direct Bank</span>
                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">Manual</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1">NEFT / RTGS / IMPS / QR</div>
                    </button>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-2xl border border-violet-100 bg-violet-50/50 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-900">Instant Online Gateway (Razorpay)</div>
                      <div className="text-[11px] text-slate-500">Supports UPI (GPay, PhonePe, Paytm), Netbanking, Debit & Credit Cards</div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full whitespace-nowrap">Instant Sync</span>
                  </div>
                )}
              </div>

              {/* Quick Amount Chips */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Quick Select Repayment Amount</label>
                <div className="flex flex-wrap gap-2">
                  {[2000, 5000, 10000, 25000]
                    .filter(val => val <= Number(creditData?.outstandingBalance || 0))
                    .map(val => {
                      const isSelected = Number(repayAmount) === val;
                      return (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setRepayAmount(String(val))}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            isSelected
                              ? 'bg-violet-600 text-white shadow-sm shadow-violet-200 scale-105'
                              : 'border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                          }`}
                        >
                          ₹{val.toLocaleString('en-IN')}
                        </button>
                      );
                    })}
                  {Number(creditData?.outstandingBalance || 0) > 0 && (
                    <button
                      type="button"
                      onClick={() => setRepayAmount(String(creditData?.outstandingBalance || 0))}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        Number(repayAmount) === Number(creditData?.outstandingBalance || 0)
                          ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-200 scale-105'
                          : 'border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                      }`}
                    >
                      Pay Full Due (₹{Number(creditData?.outstandingBalance || 0).toLocaleString('en-IN')})
                    </button>
                  )}
                </div>
              </div>

              {/* Amount Input */}
              <Field label="Repayment Amount (₹)">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400 text-base">₹</span>
                  <input
                    type="number"
                    min="1"
                    max={creditData?.outstandingBalance || undefined}
                    value={repayAmount}
                    onChange={(e) => setRepayAmount(e.target.value)}
                    placeholder="Enter amount to repay"
                    className={`${inputCls} pl-9 text-base font-bold`}
                    required
                  />
                </div>
                {Number(repayAmount) > 0 && (
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1.5 px-1 font-medium">
                    <span>Remaining Due after payment:</span>
                    <strong className="text-slate-800">
                      ₹{Math.max(0, (creditData?.outstandingBalance || 0) - Number(repayAmount)).toLocaleString('en-IN')}
                    </strong>
                  </div>
                )}
              </Field>

              {repayMethod === 'BANK_TRANSFER' && companyBankConfig?.enabled && (
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <div className="p-3.5 bg-gradient-to-br from-amber-50 to-orange-50/50 rounded-2xl border border-amber-200/80 text-amber-900 text-xs space-y-2">
                    <div className="font-bold flex items-center justify-between">
                      <span>🏦 Official Receiving Account</span>
                      <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-semibold">NEFT / RTGS / IMPS / UPI</span>
                    </div>
                    {companyBankConfig.bankDetails ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] bg-white/70 p-3 rounded-xl border border-amber-100">
                        {companyBankConfig.bankDetails.bankName && (
                          <div><span className="text-gray-500">Bank:</span> <strong>{companyBankConfig.bankDetails.bankName}</strong></div>
                        )}
                        {companyBankConfig.bankDetails.accountHolder && (
                          <div><span className="text-gray-500">Beneficiary:</span> <strong>{companyBankConfig.bankDetails.accountHolder}</strong></div>
                        )}
                        {companyBankConfig.bankDetails.accountNumber && (
                          <div><span className="text-gray-500">A/C Number:</span> <strong className="font-mono">{companyBankConfig.bankDetails.accountNumber}</strong></div>
                        )}
                        {companyBankConfig.bankDetails.ifscCode && (
                          <div><span className="text-gray-500">IFSC:</span> <strong className="font-mono">{companyBankConfig.bankDetails.ifscCode}</strong></div>
                        )}
                        {companyBankConfig.bankDetails.branch && (
                          <div><span className="text-gray-500">Branch:</span> <strong>{companyBankConfig.bankDetails.branch}</strong></div>
                        )}
                        {companyBankConfig.bankDetails.upiId && (
                          <div><span className="text-gray-500">UPI ID:</span> <strong className="font-mono">{companyBankConfig.bankDetails.upiId}</strong></div>
                        )}
                      </div>
                    ) : (
                      <div className="text-[11px] text-amber-800">
                        A/C: Click2Kart Pvt Ltd • Contact Admin for bank transfer instructions
                      </div>
                    )}
                    {companyBankConfig.bankDetails?.qrCodeUrl && (
                      <div className="flex items-center gap-3 p-2 bg-white rounded-xl border border-amber-100">
                        <img src={companyBankConfig.bankDetails.qrCodeUrl} alt="UPI QR" className="w-16 h-16 object-contain rounded-lg border p-1" />
                        <div className="text-[11px] text-gray-600">
                          <div className="font-bold text-gray-800">Scan UPI QR to Pay</div>
                          <div>Scan via any UPI app and enter UTR reference below</div>
                        </div>
                      </div>
                    )}
                    <div className="text-[10px] text-amber-700 italic">Balance will be updated once payment is verified on company bank statement.</div>
                  </div>

                  <Field label="UTR / Transaction Reference (Required)">
                    <input
                      type="text"
                      value={bankForm.utr}
                      onChange={(e) => setBankForm({ ...bankForm, utr: e.target.value })}
                      placeholder="e.g., UTR1234567890"
                      className={inputCls}
                      required
                    />
                  </Field>

                  <Field label="Upload Payment Receipt / Slip">
                    <div className="space-y-2">
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={handleSlipUpload}
                        disabled={uploadingSlip}
                        className="text-xs text-slate-500 file:mr-2 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
                      />
                      {uploadingSlip && <p className="text-[10px] text-violet-600 font-bold">Uploading receipt...</p>}
                      {bankForm.paymentSlip && (
                        <p className="text-[10px] text-emerald-600 font-bold">✓ Receipt attached</p>
                      )}
                    </div>
                  </Field>

                  <Field label="Notes / Remarks">
                    <input
                      type="text"
                      value={bankForm.note}
                      onChange={(e) => setBankForm({ ...bankForm, note: e.target.value })}
                      placeholder="Optional notes for accountant"
                      className={inputCls}
                    />
                  </Field>
                </div>
              )}

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRepayModal(false)}
                  className={btnOutline}
                >
                  Cancel
                </button>
                {repayMethod === 'RAZORPAY' ? (
                  <button
                    type="button"
                    onClick={handleRazorpayRepayment}
                    disabled={repaySubmitting || !repayAmount || Number(repayAmount) <= 0}
                    className={btnPrimary}
                  >
                    {repaySubmitting ? 'Processing Gateway…' : `Pay ₹${Number(repayAmount || 0).toLocaleString('en-IN')} Online`}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleBankTransferRepayment}
                    disabled={repaySubmitting || !repayAmount || Number(repayAmount) <= 0 || !bankForm.utr.trim()}
                    className={btnPrimary}
                  >
                    {repaySubmitting ? 'Submitting…' : 'Submit Transfer for Verification'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Business Credit Application Modal ── */}
      {showBusinessApplyModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setShowBusinessApplyModal(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6 my-8 animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="pf-display font-black text-xl text-slate-900">Apply for Business Credit Facility</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Working capital term facility for inventory, stock expansion and business operations
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowBusinessApplyModal(false)}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center"
              >
                <Ico n="close" cls="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleApplyBusinessCredit} className="space-y-4">
              <Field label="Requested Facility Amount (₹)">
                <input
                  type="number"
                  min="10000"
                  max="1000000"
                  step="5000"
                  value={businessApplyForm.requestedAmount}
                  onChange={(e) => setBusinessApplyForm(p => ({ ...p, requestedAmount: e.target.value }))}
                  placeholder="e.g., 100000"
                  className={inputCls}
                  required
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Pre-qualified limit up to ₹{(businessEligibility?.preQualifiedLimit || 100000).toLocaleString('en-IN')}. Min ₹10,000.
                </p>
              </Field>

              <Field label="Facility Tenure">
                <div className="grid grid-cols-5 gap-2">
                  {(businessEligibility?.settings?.permittedTenures || [1, 2, 3, 4, 5]).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setBusinessApplyForm(p => ({ ...p, requestedTenureMonths: m }))}
                      className={`py-2.5 rounded-xl font-black text-xs transition-all border ${
                        Number(businessApplyForm.requestedTenureMonths) === m
                          ? 'bg-violet-600 text-white border-violet-600 shadow-md shadow-violet-200'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {m} {m === 1 ? 'Month' : 'Months'}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="Repayment Frequency">
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'WEEKLY', label: 'Weekly Instalments' },
                    { id: 'DAILY', label: 'Daily Instalments' }
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setBusinessApplyForm(p => ({ ...p, requestedFrequency: f.id }))}
                      className={`py-2.5 rounded-xl font-bold text-xs transition-all border ${
                        businessApplyForm.requestedFrequency === f.id
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="Business Purpose">
                <select
                  value={businessApplyForm.purpose}
                  onChange={(e) => setBusinessApplyForm(p => ({ ...p, purpose: e.target.value }))}
                  className={inputCls}
                >
                  <option value="Working Capital Expansion">Working Capital Expansion</option>
                  <option value="Bulk Inventory Procurement">Bulk Inventory Procurement</option>
                  <option value="Store Renovation & Fitout">Store Renovation & Fitout</option>
                  <option value="Vendor / Supplier Settlement">Vendor / Supplier Settlement</option>
                  <option value="Logistics & Warehousing">Logistics & Warehousing</option>
                  <option value="Other Business Operations">Other Business Operations</option>
                </select>
              </Field>

              {/* Estimate Summary */}
              {businessApplyForm.requestedAmount && Number(businessApplyForm.requestedAmount) > 0 && (
                <div className="p-4 bg-violet-50/60 rounded-2xl border border-violet-100 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Sanction Amount:</span>
                    <span className="font-bold text-slate-900">₹{Number(businessApplyForm.requestedAmount).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Processing Fee (2% + 18% GST):</span>
                    <span className="font-bold text-slate-900">
                      ₹{Math.round(Number(businessApplyForm.requestedAmount) * 0.02 * 1.18).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Interest Rate:</span>
                    <span className="font-bold text-violet-700">18.00% p.a. (Accrued Daily on Principal)</span>
                  </div>
                  <div className="flex justify-between text-slate-600 pt-1 border-t border-violet-100">
                    <span>Estimated Net Payout:</span>
                    <span className="font-black text-slate-900">
                      ₹{Math.round(Number(businessApplyForm.requestedAmount) * (1 - 0.02 * 1.18)).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBusinessApplyModal(false)}
                  className={btnOutline}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingBusinessApp || !businessApplyForm.requestedAmount}
                  className={btnPrimary}
                >
                  {submittingBusinessApp ? 'Submitting Application…' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Business Credit Offer Acceptance Modal ── */}
      {showAcceptOfferModal && selectedOffer && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setShowAcceptOfferModal(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6 my-8 animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-200">
                  Facility Sanction Letter
                </span>
                <h3 className="pf-display font-black text-xl text-slate-900 mt-2">
                  Accept Business Credit Line Facility
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAcceptOfferModal(false)}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center"
              >
                <Ico n="close" cls="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Sanctioned Principal:</span>
                <span className="font-black text-slate-900 text-base">
                  ₹{Number(selectedOffer.approvedAmount || selectedOffer.requestedAmount).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Facility Tenure:</span>
                <span className="font-bold text-slate-800">
                  {selectedOffer.approvedTenureMonths || selectedOffer.requestedTenureMonths} Months
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Interest Calculation:</span>
                <span className="font-bold text-violet-700">
                  {selectedOffer.approvedInterestRateAnnual || 18}% p.a. (Accrued Daily on Principal)
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Repayment Frequency:</span>
                <span className="font-bold text-slate-800 capitalize">
                  {selectedOffer.repaymentFrequency || 'WEEKLY'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Processing Fee (2% + 18% GST):</span>
                <span className="font-bold text-slate-800">
                  ₹{Math.round(Number(selectedOffer.approvedAmount || selectedOffer.requestedAmount) * 0.02 * 1.18).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between py-1 font-bold text-slate-900">
                <span>Net Disbursal to Bank Account:</span>
                <span className="font-black text-emerald-600 text-base">
                  ₹{Math.round(Number(selectedOffer.approvedAmount || selectedOffer.requestedAmount) * (1 - 0.02 * 1.18)).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Disbursement Destination Bank Account */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3 text-xs">
              <div className="font-bold text-slate-800 flex items-center justify-between">
                <span>Disbursement Destination Bank Account</span>
                <span className="text-[10px] text-violet-700 font-bold bg-violet-100/60 px-2 py-0.5 rounded-full border border-violet-200">
                  NEFT / RTGS Payout
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Please enter or confirm the bank account where the net sanctioned amount will be disbursed.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Account Holder Name *</label>
                  <input
                    type="text"
                    required
                    value={disburseBankDetails.accountHolder}
                    onChange={(e) => setDisburseBankDetails(p => ({ ...p, accountHolder: e.target.value }))}
                    placeholder="e.g. Ramesh Trading Co."
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Bank Name *</label>
                  <input
                    type="text"
                    required
                    value={disburseBankDetails.bankName}
                    onChange={(e) => setDisburseBankDetails(p => ({ ...p, bankName: e.target.value }))}
                    placeholder="e.g. State Bank of India, HDFC Bank"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Account Number *</label>
                  <input
                    type="text"
                    required
                    value={disburseBankDetails.accountNumber}
                    onChange={(e) => setDisburseBankDetails(p => ({ ...p, accountNumber: e.target.value }))}
                    placeholder="Enter account number"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Confirm Account Number *</label>
                  <input
                    type="text"
                    required
                    value={disburseBankDetails.confirmAccountNumber}
                    onChange={(e) => setDisburseBankDetails(p => ({ ...p, confirmAccountNumber: e.target.value }))}
                    placeholder="Re-enter account number"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">IFSC Code *</label>
                  <input
                    type="text"
                    required
                    value={disburseBankDetails.ifsc}
                    onChange={(e) => setDisburseBankDetails(p => ({ ...p, ifsc: e.target.value.toUpperCase() }))}
                    placeholder="e.g. SBIN0001234"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold uppercase text-slate-800 outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Account Type</label>
                  <select
                    value={disburseBankDetails.accountType}
                    onChange={(e) => setDisburseBankDetails(p => ({ ...p, accountType: e.target.value }))}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    <option value="CURRENT">Current Account</option>
                    <option value="SAVINGS">Savings Account</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200 space-y-2 text-xs text-amber-950">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptedTermsChecked}
                  onChange={(e) => setAcceptedTermsChecked(e.target.checked)}
                  className="mt-0.5 rounded border-amber-300 text-violet-600 focus:ring-violet-500 w-4 h-4"
                />
                <span className="leading-relaxed">
                  I accept the Business Credit Line Facility terms. I understand that interest accrues daily on outstanding principal at 18% p.a., instalments will be due according to the amortization schedule, and performance records are maintained for partner credit standing.
                </span>
              </label>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAcceptOfferModal(false)}
                className={btnOutline}
              >
                Decline / Cancel
              </button>
              <button
                type="button"
                onClick={handleAcceptBusinessOffer}
                disabled={acceptingOffer || !acceptedTermsChecked}
                className={btnPrimary}
              >
                {acceptingOffer ? 'Executing Agreement…' : 'Confirm Bank Details & Accept Sanction Offer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Business Credit Repayment Modal ── */}
      {showBusinessRepayModal && selectedRepayFacility && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setShowBusinessRepayModal(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6 my-8 animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="pf-display font-black text-xl text-slate-900">
                  Repay Business Credit Facility
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Account: {selectedRepayFacility.facilityNumber}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowBusinessRepayModal(false)}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center"
              >
                <Ico n="close" cls="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Next Due</span>
                <span className="font-black text-amber-700 text-base">
                  ₹{Math.round(selectedRepayFacility.nextDueAmount || 0).toLocaleString('en-IN')}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Outstanding</span>
                <span className="font-black text-slate-900 text-base">
                  ₹{Math.round(selectedRepayFacility.totalOutstandingBalance || 0).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <Field label="Repayment Amount (₹)">
              <input
                type="number"
                min="1"
                max={selectedRepayFacility.totalOutstandingBalance}
                value={businessRepayAmount}
                onChange={(e) => setBusinessRepayAmount(e.target.value)}
                placeholder="Enter amount to pay"
                className={inputCls}
              />
              <div className="flex gap-2 mt-2">
                {selectedRepayFacility.nextDueAmount > 0 && (
                  <button
                    type="button"
                    onClick={() => setBusinessRepayAmount(String(Math.round(selectedRepayFacility.nextDueAmount)))}
                    className="text-[11px] font-bold text-violet-600 bg-violet-50 px-2.5 py-1 rounded-lg hover:bg-violet-100 transition"
                  >
                    Pay Next Due (₹{Math.round(selectedRepayFacility.nextDueAmount).toLocaleString('en-IN')})
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setBusinessRepayAmount(String(Math.round(selectedRepayFacility.totalOutstandingBalance)))}
                  className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg hover:bg-slate-200 transition"
                >
                  Pay Full Balance (₹{Math.round(selectedRepayFacility.totalOutstandingBalance).toLocaleString('en-IN')})
                </button>
              </div>
            </Field>

            <Field label="Payment Method">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setBusinessRepayMethod('RAZORPAY')}
                  className={`py-3 rounded-xl font-black text-xs transition-all border ${
                    businessRepayMethod === 'RAZORPAY'
                      ? 'bg-violet-600 text-white border-violet-600 shadow-md shadow-violet-200'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Online Gateway (Razorpay)
                </button>
                <button
                  type="button"
                  onClick={() => setBusinessRepayMethod('BANK_TRANSFER')}
                  className={`py-3 rounded-xl font-black text-xs transition-all border ${
                    businessRepayMethod === 'BANK_TRANSFER'
                      ? 'bg-violet-600 text-white border-violet-600 shadow-md shadow-violet-200'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Direct Bank Transfer
                </button>
              </div>
            </Field>

            {businessRepayMethod === 'BANK_TRANSFER' && (
              <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
                {companyBankConfig.bankDetails && (
                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                    <div className="font-bold text-slate-800">Click2Kart Collection Account:</div>
                    <div className="text-slate-600">Bank: {companyBankConfig.bankDetails.bankName || 'HDFC Bank'}</div>
                    <div className="text-slate-600">Account: {companyBankConfig.bankDetails.accountNumber}</div>
                    <div className="text-slate-600">IFSC: {companyBankConfig.bankDetails.ifscCode}</div>
                  </div>
                )}
                <Field label="UTR / Transaction Reference (Required)">
                  <input
                    type="text"
                    value={businessBankForm.utr}
                    onChange={(e) => setBusinessBankForm(p => ({ ...p, utr: e.target.value }))}
                    placeholder="e.g., UTR987654321"
                    className={inputCls}
                    required
                  />
                </Field>
                <Field label="Upload Receipt / Slip">
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (!file) return;
                      const fd = new FormData();
                      fd.append('file', file);
                      try {
                        const res = await api.post('/api/upload/image', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
                        setBusinessBankForm(p => ({ ...p, paymentSlip: res.data.url }));
                        notify('Receipt uploaded successfully', 'success');
                      } catch {
                        notify('Failed to upload receipt', 'error');
                      }
                    }}
                    className="text-xs text-slate-500 file:mr-2 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
                  />
                  {businessBankForm.paymentSlip && (
                    <p className="text-[10px] text-emerald-600 font-bold mt-1">✓ Receipt attached</p>
                  )}
                </Field>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowBusinessRepayModal(false)}
                className={btnOutline}
              >
                Cancel
              </button>
              {businessRepayMethod === 'RAZORPAY' ? (
                <button
                  type="button"
                  onClick={() => handleBusinessRazorpayRepayment(selectedRepayFacility)}
                  disabled={submittingBusinessRepay || !businessRepayAmount || Number(businessRepayAmount) <= 0}
                  className={btnPrimary}
                >
                  {submittingBusinessRepay ? 'Processing Gateway…' : `Pay ₹${Number(businessRepayAmount || 0).toLocaleString('en-IN')} Online`}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleBusinessBankTransferRepayment(selectedRepayFacility)}
                  disabled={submittingBusinessRepay || !businessRepayAmount || Number(businessRepayAmount) <= 0 || !businessBankForm.utr.trim()}
                  className={btnPrimary}
                >
                  {submittingBusinessRepay ? 'Submitting…' : 'Submit Bank Transfer Proof'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Business Credit Repayment Schedule Modal ── */}
      {showScheduleModal && selectedScheduleFacility && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setShowScheduleModal(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6 my-8 animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="pf-display font-black text-xl text-slate-900">
                  Amortization Schedule — {selectedScheduleFacility.facilityNumber}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Sanctioned Principal: ₹{Number(selectedScheduleFacility.disbursedAmount).toLocaleString('en-IN')} • Tenure: {selectedScheduleFacility.tenureMonths} Months ({selectedScheduleFacility.repaymentFrequency})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowScheduleModal(false)}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center"
              >
                <Ico n="close" cls="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-x-auto max-h-[60vh]">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="sticky top-0 bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-3">#</th>
                    <th className="px-4 py-3">Due Date</th>
                    <th className="px-4 py-3">Principal Due</th>
                    <th className="px-4 py-3">Interest Due</th>
                    <th className="px-4 py-3">Total Due</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(selectedScheduleFacility.repaymentSchedule || []).map((item) => (
                    <tr key={item.installmentNumber} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-bold text-slate-900">#{item.installmentNumber}</td>
                      <td className="px-4 py-3 whitespace-nowrap font-medium text-slate-900">
                        {new Date(item.dueDate).toLocaleDateString('en-IN')}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">₹{Math.round(item.principalDue).toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3 whitespace-nowrap">₹{Math.round(item.interestDue).toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3 whitespace-nowrap font-bold text-slate-900">₹{Math.round(item.totalDue).toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            item.status === 'PAID'
                              ? 'bg-emerald-100 text-emerald-800'
                              : item.status === 'OVERDUE'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowScheduleModal(false)}
                className="px-6 py-2.5 rounded-xl font-bold text-xs bg-slate-900 text-white hover:bg-slate-800 transition"
              >
                Close Schedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Document Inspection Modal ── */}
      {previewDoc && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fade-in"
          onClick={() => setPreviewDoc(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center font-bold text-sm">
                  👁️
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-sm tracking-tight">{previewDoc.title || 'Official Document Preview'}</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Confidential Verification Document</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={previewDoc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <span>Open Full</span>
                  <span>↗</span>
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewDoc(null)}
                  className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-all"
                  aria-label="Close modal"
                >
                  <Ico n="close" cls="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-auto flex items-center justify-center bg-slate-950/5 min-h-[300px]">
              {previewDoc.url && (previewDoc.url.toLowerCase().endsWith('.pdf') || previewDoc.url.toLowerCase().includes('.pdf')) ? (
                <iframe
                  src={previewDoc.url}
                  title={previewDoc.title}
                  className="w-full h-[65vh] rounded-xl border border-slate-200 bg-white"
                />
              ) : (
                <img
                  src={previewDoc.url}
                  alt={previewDoc.title}
                  className="max-h-[70vh] w-auto max-w-full rounded-2xl object-contain shadow-md border border-slate-200 bg-white"
                />
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="text-[11px] font-medium text-slate-500">
                🔒 Stored securely in official records
              </span>
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}