import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../lib/api'
import { useAuth } from '../../lib/AuthContext'
import { useToast } from '../../components/Toast'

const INDIAN_STATES = [
  'Andaman and Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam',
  'Bihar', 'Chandigarh', 'Chhattisgarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir',
  'Jharkhand', 'Karnataka', 'Kerala', 'Ladakh', 'Lakshadweep', 'Madhya Pradesh',
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha',
  'Puducherry', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana',
  'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
]

export default function VerifyKyc() {
  const { user, refreshProfile } = useAuth()
  const { notify } = useToast()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [kycData, setKycData] = useState(null)
  const [currentStep, setCurrentStep] = useState(1) // 1: Business & Address, 2: Documents, 3: Review
  const [previewImage, setPreviewImage] = useState(null)
  const [ticketModalOpen, setTicketModalOpen] = useState(false)
  const [ticketSubject, setTicketSubject] = useState('KYC Document Update Request')
  const [ticketDescription, setTicketDescription] = useState('')
  const [ticketSubmitting, setTicketSubmitting] = useState(false)

  // Form State
  const [form, setForm] = useState({
    businessName: '',
    tradeName: '',
    businessType: 'Proprietorship',
    gstin: '',
    pan: '',
    panCard: '',
    aadhaarNumber: '',
    aadhaarFront: '',
    aadhaarBack: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    district: '',
    state: 'Odisha',
    pincode: '',
    declaration: false
  })

  // Uploading states for individual files
  const [uploadingPan, setUploadingPan] = useState(false)
  const [uploadingAadhaarFront, setUploadingAadhaarFront] = useState(false)
  const [uploadingAadhaarBack, setUploadingAadhaarBack] = useState(false)

  const loadKyc = async () => {
    try {
      setLoading(true)
      const { data } = await api.get('/api/user/kyc')
      setKycData(data)
      const k = data.kyc || {}
      setForm(prev => ({
        ...prev,
        businessName: k.businessName || '',
        tradeName: k.tradeName || k.businessName || '',
        businessType: k.businessType || 'Proprietorship',
        gstin: k.gstin || '',
        pan: k.pan || '',
        panCard: k.panCard || '',
        aadhaarNumber: k.aadhaarNumber || '',
        aadhaarFront: k.aadhaarFront || k.aadhaarCard || '',
        aadhaarBack: k.aadhaarBack || '',
        addressLine1: k.addressLine1 || '',
        addressLine2: k.addressLine2 || '',
        city: k.city || '',
        district: k.district || '',
        state: k.state || 'Odisha',
        pincode: k.pincode || ''
      }))
    } catch (err) {
      console.error('Failed to load KYC info:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadKyc()
  }, [])

  const handleFileUpload = async (e, type) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Max 10MB check
    if (file.size > 10 * 1024 * 1024) {
      notify('File size must be under 10MB', 'error')
      return
    }

    const fd = new FormData()
    fd.append('file', file)

    if (type === 'panCard') setUploadingPan(true)
    if (type === 'aadhaarFront') setUploadingAadhaarFront(true)
    if (type === 'aadhaarBack') setUploadingAadhaarBack(true)

    try {
      const { data } = await api.post('/api/uploads/image', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      if (data?.url) {
        setForm(prev => ({ ...prev, [type]: data.url }))
        notify('Document uploaded successfully!', 'success')
      }
    } catch (err) {
      console.error('Upload failed:', err)
      notify('Failed to upload image. Please try again.', 'error')
    } finally {
      if (type === 'panCard') setUploadingPan(false)
      if (type === 'aadhaarFront') setUploadingAadhaarFront(false)
      if (type === 'aadhaarBack') setUploadingAadhaarBack(false)
      e.target.value = ''
    }
  }

  const validateStep1 = () => {
    if (!form.businessName.trim()) {
      notify('Please enter your Business / Shop name', 'error')
      return false
    }
    if (!form.addressLine1.trim()) {
      notify('Please enter Address Line 1', 'error')
      return false
    }
    if (!form.city.trim()) {
      notify('Please enter City', 'error')
      return false
    }
    if (!form.pincode.trim() || !/^\d{6}$/.test(form.pincode.trim())) {
      notify('Please enter a valid 6-digit Pincode', 'error')
      return false
    }
    if (form.gstin.trim()) {
      const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/
      if (!gstRegex.test(form.gstin.trim().toUpperCase())) {
        notify('Please enter a valid 15-character GSTIN or leave it blank', 'error')
        return false
      }
    }
    return true
  }

  const validateStep2 = () => {
    const cleanPan = form.pan.trim().toUpperCase()
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/
    if (!panRegex.test(cleanPan)) {
      notify('Please enter a valid 10-character PAN number (e.g. ABCDE1234F)', 'error')
      return false
    }
    if (!form.panCard) {
      notify('Please upload your PAN card photo', 'error')
      return false
    }

    const cleanAadhaar = form.aadhaarNumber.replace(/\D/g, '')
    if (cleanAadhaar.length !== 12) {
      notify('Please enter a valid 12-digit Aadhaar number', 'error')
      return false
    }
    if (!form.aadhaarFront) {
      notify('Please upload your Aadhaar Card Front photo', 'error')
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e?.preventDefault()
    if (!form.declaration) {
      notify('Please agree to the accuracy declaration before submitting', 'error')
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        businessName: form.businessName.trim(),
        tradeName: form.tradeName.trim() || form.businessName.trim(),
        businessType: form.businessType,
        gstin: form.gstin.trim().toUpperCase(),
        pan: form.pan.trim().toUpperCase(),
        panCard: form.panCard,
        aadhaarNumber: form.aadhaarNumber.replace(/\D/g, ''),
        aadhaarFront: form.aadhaarFront,
        aadhaarBack: form.aadhaarBack,
        addressLine1: form.addressLine1.trim(),
        addressLine2: form.addressLine2.trim(),
        city: form.city.trim(),
        district: form.district.trim() || form.city.trim(),
        state: form.state,
        pincode: form.pincode.trim()
      }

      const { data } = await api.post('/api/user/kyc/submit', payload)
      notify('KYC submitted successfully! Compliance team will review shortly.', 'success')
      await loadKyc()
      if (refreshProfile) {
        try { await refreshProfile() } catch {}
      }
    } catch (err) {
      notify(err?.response?.data?.message || err?.response?.data?.error || 'Submission failed', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleRaiseTicket = async (e) => {
    e.preventDefault()
    if (!ticketDescription.trim()) {
      notify('Please describe the correction or update needed', 'error')
      return
    }
    setTicketSubmitting(true)
    try {
      await api.post('/api/support-tickets', {
        subject: ticketSubject,
        category: 'KYC/Profile',
        description: ticketDescription.trim()
      })
      notify('Support ticket raised successfully! Our compliance desk will assist you.', 'success')
      setTicketModalOpen(false)
      setTicketDescription('')
    } catch (err) {
      notify(err?.response?.data?.error || 'Failed to submit ticket', 'error')
    } finally {
      setTicketSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 rounded-full border-4 border-violet-200 border-t-violet-600 animate-spin mb-4" />
        <h2 className="text-base font-bold text-slate-700">Loading KYC Verification...</h2>
      </div>
    )
  }

  const kyc = kycData?.kyc || {}
  const status = kyc.status || 'NOT_SUBMITTED'
  const isLocked = kyc.isLocked || ['PENDING_VERIFICATION', 'VERIFIED'].includes(status)
  const isVerified = status === 'VERIFIED'
  const isUnderReview = status === 'PENDING_VERIFICATION'
  const isRejected = status === 'REJECTED'

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Top Header Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm ${
              isVerified ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
              isUnderReview ? 'bg-purple-50 text-purple-600 border border-purple-200 animate-pulse' :
              isRejected ? 'bg-rose-50 text-rose-600 border border-rose-200' :
              'bg-violet-50 text-violet-600 border border-violet-200'
            }`}>
              {isVerified ? '🛡️' : isUnderReview ? '⏳' : isRejected ? '⚠️' : '📋'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Retailer KYC Verification</h1>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                  isVerified ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                  isUnderReview ? 'bg-purple-50 text-purple-700 border-purple-200' :
                  isRejected ? 'bg-rose-50 text-rose-700 border-rose-200' :
                  'bg-slate-100 text-slate-600 border-slate-200'
                }`}>
                  {isVerified ? 'VERIFIED ✓' : isUnderReview ? 'UNDER REVIEW' : isRejected ? 'REVISION NEEDED' : 'REQUIRED'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
                {isVerified ? 'Your business identity is fully verified. Enjoy wholesale prices and credit limits.' :
                 isUnderReview ? 'Your documents are being checked by Click2Kart Compliance.' :
                 isRejected ? 'Please review the admin feedback and re-submit corrected documents.' :
                 'Complete your one-time verification to unlock wholesale electronics buying and GST billing.'}
              </p>
            </div>
          </div>
          <Link
            to="/profile"
            className="text-xs font-bold text-slate-600 hover:text-slate-900 border border-slate-200 px-4 py-2 rounded-xl hover:bg-slate-50 transition-colors"
          >
            ← My Profile
          </Link>
        </div>

        {/* ── CASE 1: LOCKED VIEW (UNDER REVIEW OR VERIFIED) ── */}
        {isLocked && !isRejected ? (
          <div className="space-y-6">
            {/* Status Alert Banner */}
            {isVerified ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-start gap-4">
                <span className="text-2xl">🎉</span>
                <div>
                  <h3 className="text-sm font-bold text-emerald-900">Retailer Account Verified & Active</h3>
                  <p className="text-xs text-emerald-700 mt-1 leading-relaxed">
                    Your KYC documentation has been officially verified by Click2Kart on {kyc.verifiedAt ? new Date(kyc.verifiedAt).toLocaleDateString('en-IN') : 'recently'}. 
                    All wholesale rates, official GST tax invoicing, and credit facilities are enabled.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-purple-50 border border-purple-200 rounded-2xl p-5 flex items-start gap-4">
                <span className="text-2xl">⏳</span>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-purple-900">Application Under Verification</h3>
                  <p className="text-xs text-purple-700 mt-1 leading-relaxed">
                    We have received your KYC application submitted on {kyc.submittedAt ? new Date(kyc.submittedAt).toLocaleDateString('en-IN', { hour: '2-digit', minute: '2-digit' }) : 'today'}. 
                    Our verification team is cross-checking your PAN and Aadhaar details with government databases. This usually completes within <strong>2 to 24 hours</strong>.
                  </p>
                </div>
              </div>
            )}

            {/* Read-Only Details Display */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🔒</span>
                  <h2 className="text-base font-bold text-slate-800">Locked Verification Records</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setTicketModalOpen(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-violet-700 hover:text-violet-800 bg-violet-50 hover:bg-violet-100 px-3.5 py-1.5 rounded-xl border border-violet-200 transition-colors"
                >
                  <span>✏️ Request Document Edit</span>
                </button>
              </div>

              {/* Business Overview */}
              <div>
                <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-3">1. Business Profile</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Business / Shop Name</span>
                    <span className="text-slate-800 font-extrabold text-sm">{kyc.businessName || '—'}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Business Type</span>
                    <span className="text-slate-800 font-bold">{kyc.businessType || 'Retail Store'}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">GSTIN Number</span>
                    <span className="text-slate-800 font-mono font-bold">{kyc.gstin || 'Not Provided (Exempt)'}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Registered Address</span>
                    <span className="text-slate-800 font-semibold leading-relaxed">
                      {kyc.addressLine1} {kyc.addressLine2 ? `, ${kyc.addressLine2}` : ''}, {kyc.city}, {kyc.state} - {kyc.pincode}
                    </span>
                  </div>
                </div>
              </div>

              {/* Identity & Uploaded Documents */}
              <div>
                <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-3">2. Identity Proofs & Official Documents</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* PAN Card Details */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">PAN Card</span>
                      <span className="text-xs font-mono font-extrabold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                        {kyc.pan || '—'}
                      </span>
                    </div>
                    {kyc.panCard ? (
                      <div className="relative group rounded-xl overflow-hidden border border-slate-200 bg-white">
                        <img
                          src={kyc.panCard}
                          alt="PAN Document"
                          className="h-32 w-full object-cover cursor-pointer group-hover:scale-105 transition-transform duration-200"
                          onClick={() => setPreviewImage(kyc.panCard)}
                        />
                        <button
                          type="button"
                          onClick={() => setPreviewImage(kyc.panCard)}
                          className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold gap-1"
                        >
                          🔍 View Full Document
                        </button>
                      </div>
                    ) : (
                      <div className="h-28 rounded-xl border border-dashed border-slate-200 flex items-center justify-center text-slate-400 text-xs font-medium">
                        No image uploaded
                      </div>
                    )}
                  </div>

                  {/* Aadhaar Details */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">Aadhaar Card</span>
                      <span className="text-xs font-mono font-extrabold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {kyc.aadhaarNumber ? `•••• •••• ${kyc.aadhaarNumber.slice(-4)}` : '—'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {kyc.aadhaarFront ? (
                        <div className="relative group rounded-xl overflow-hidden border border-slate-200 bg-white">
                          <img
                            src={kyc.aadhaarFront}
                            alt="Aadhaar Front"
                            className="h-28 w-full object-cover cursor-pointer group-hover:scale-105 transition-transform duration-200"
                            onClick={() => setPreviewImage(kyc.aadhaarFront)}
                          />
                          <button
                            type="button"
                            onClick={() => setPreviewImage(kyc.aadhaarFront)}
                            className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[11px] font-bold"
                          >
                            Front 🔍
                          </button>
                        </div>
                      ) : (
                        <div className="h-28 rounded-xl border border-dashed border-slate-200 flex items-center justify-center text-slate-400 text-[11px] font-medium text-center p-2">
                          Front image not uploaded
                        </div>
                      )}

                      {kyc.aadhaarBack ? (
                        <div className="relative group rounded-xl overflow-hidden border border-slate-200 bg-white">
                          <img
                            src={kyc.aadhaarBack}
                            alt="Aadhaar Back"
                            className="h-28 w-full object-cover cursor-pointer group-hover:scale-105 transition-transform duration-200"
                            onClick={() => setPreviewImage(kyc.aadhaarBack)}
                          />
                          <button
                            type="button"
                            onClick={() => setPreviewImage(kyc.aadhaarBack)}
                            className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[11px] font-bold"
                          >
                            Back 🔍
                          </button>
                        </div>
                      ) : (
                        <div className="h-28 rounded-xl border border-dashed border-slate-200 flex items-center justify-center text-slate-400 text-[11px] font-medium text-center p-2">
                          Back (optional)
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Locked Notice & Helpdesk Ticket Trigger */}
              <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="text-xs text-amber-900 leading-relaxed">
                  <strong>Need to correct your business details or documents?</strong>
                  <br />
                  For security and compliance reasons, identity records cannot be overwritten directly. Please raise a ticket with Click2Kart Support.
                </div>
                <button
                  type="button"
                  onClick={() => setTicketModalOpen(true)}
                  className="whitespace-nowrap px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
                >
                  Raise Support Ticket
                </button>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Link
                  to="/products"
                  className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-bold rounded-xl hover:from-violet-700 hover:to-indigo-700 shadow-md transition-all"
                >
                  Browse Wholesale Products →
                </Link>
              </div>
            </div>
          </div>
        ) : (
          /* ── CASE 2: STEP-BY-STEP GUIDED WIZARD FLOW ── */
          <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200/80 space-y-8">
            
            {/* Rejection Alert if Applicable */}
            {isRejected && (
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 flex items-start gap-4">
                <span className="text-2xl">⚠️</span>
                <div>
                  <h3 className="text-sm font-bold text-rose-900">KYC Revision Required</h3>
                  <p className="text-xs text-rose-700 mt-1">
                    {kyc.rejectionReason || 'Your previous submission had document clarity issues. Please review and re-upload authentic photos below.'}
                  </p>
                </div>
              </div>
            )}

            {/* Stepper Wizard Indicator */}
            <div className="flex items-center justify-between relative max-w-xl mx-auto px-4">
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 -translate-y-1/2 z-0" />
              <div
                className="absolute top-1/2 left-0 h-0.5 bg-violet-600 -translate-y-1/2 transition-all duration-300 z-0"
                style={{ width: currentStep === 1 ? '0%' : currentStep === 2 ? '50%' : '100%' }}
              />

              {/* Step 1 */}
              <div className="relative z-10 flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-extrabold transition-all ${
                    currentStep === 1
                      ? 'bg-violet-600 text-white ring-4 ring-violet-100 shadow-md'
                      : currentStep > 1
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white text-slate-400 border-2 border-slate-200'
                  }`}
                >
                  {currentStep > 1 ? '✓' : '1'}
                </button>
                <span className="text-[11px] font-bold text-slate-700 mt-1.5">Business Info</span>
              </div>

              {/* Step 2 */}
              <div className="relative z-10 flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => {
                    if (validateStep1()) setCurrentStep(2)
                  }}
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-extrabold transition-all ${
                    currentStep === 2
                      ? 'bg-violet-600 text-white ring-4 ring-violet-100 shadow-md'
                      : currentStep > 2
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white text-slate-400 border-2 border-slate-200'
                  }`}
                >
                  {currentStep > 2 ? '✓' : '2'}
                </button>
                <span className="text-[11px] font-bold text-slate-700 mt-1.5">ID & Documents</span>
              </div>

              {/* Step 3 */}
              <div className="relative z-10 flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => {
                    if (validateStep1() && validateStep2()) setCurrentStep(3)
                  }}
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-extrabold transition-all ${
                    currentStep === 3
                      ? 'bg-violet-600 text-white ring-4 ring-violet-100 shadow-md'
                      : 'bg-white text-slate-400 border-2 border-slate-200'
                  }`}
                >
                  3
                </button>
                <span className="text-[11px] font-bold text-slate-700 mt-1.5">Review & Submit</span>
              </div>
            </div>

            {/* ── STEP 1: BUSINESS & ADDRESS ── */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-base font-extrabold text-slate-900">Step 1: Business Profile & Registered Address</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Please provide legal business information for invoice generation.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Business / Shop Legal Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Mahavir Electronics & Telecom"
                      value={form.businessName}
                      onChange={e => setForm(p => ({ ...p, businessName: e.target.value }))}
                      className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Trade / Store Name <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Mahavir Store"
                      value={form.tradeName}
                      onChange={e => setForm(p => ({ ...p, tradeName: e.target.value }))}
                      className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Business Constitution
                    </label>
                    <select
                      value={form.businessType}
                      onChange={e => setForm(p => ({ ...p, businessType: e.target.value }))}
                      className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 font-medium bg-white"
                    >
                      <option value="Proprietorship">Sole Proprietorship</option>
                      <option value="Partnership">Partnership Firm</option>
                      <option value="Private Limited">Private Limited Company</option>
                      <option value="Retail Store">Individual Retailer / Shop</option>
                      <option value="Other">Other Wholesale Entity</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-700">
                        GSTIN Number <span className="text-slate-400 font-normal">(Optional if exempt)</span>
                      </label>
                      <span className="text-[10px] text-slate-400 font-medium">15 Alpha-numeric digits</span>
                    </div>
                    <input
                      type="text"
                      maxLength={15}
                      placeholder="e.g. 21ABCDE1234F1Z5"
                      value={form.gstin}
                      onChange={e => setForm(p => ({ ...p, gstin: e.target.value.toUpperCase() }))}
                      className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 font-mono uppercase"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3">Shop / Dispatch Address</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Address Line 1 (Shop No., Building, Street) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Shop #4, Market Complex, Station Road"
                        value={form.addressLine1}
                        onChange={e => setForm(p => ({ ...p, addressLine1: e.target.value }))}
                        className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 font-medium"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Address Line 2 (Landmark, Area)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Near City Bus Stand"
                        value={form.addressLine2}
                        onChange={e => setForm(p => ({ ...p, addressLine2: e.target.value }))}
                        className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        City / Town <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Bhubaneswar"
                        value={form.city}
                        onChange={e => setForm(p => ({ ...p, city: e.target.value }))}
                        className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        District
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Khordha"
                        value={form.district}
                        onChange={e => setForm(p => ({ ...p, district: e.target.value }))}
                        className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        State <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={form.state}
                        onChange={e => setForm(p => ({ ...p, state: e.target.value }))}
                        className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 font-medium bg-white"
                      >
                        {INDIAN_STATES.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Pincode <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        placeholder="e.g. 751001"
                        value={form.pincode}
                        onChange={e => setForm(p => ({ ...p, pincode: e.target.value.replace(/\D/g, '') }))}
                        className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      if (validateStep1()) setCurrentStep(2)
                    }}
                    className="px-6 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
                  >
                    Proceed to Step 2: Documents →
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 2: DOCUMENTS (PAN & AADHAAR) ── */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-base font-extrabold text-slate-900">Step 2: Identity Documents Verification</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Upload authentic government ID proofs. Once approved, these are locked.</p>
                </div>

                {/* PAN Section */}
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="text-base">💳</span>
                    <h4 className="text-sm font-bold text-slate-800">Permanent Account Number (PAN)</h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        10-Digit PAN Number <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        maxLength={10}
                        required
                        placeholder="ABCDE1234F"
                        value={form.pan}
                        onChange={e => setForm(p => ({ ...p, pan: e.target.value.toUpperCase() }))}
                        className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 font-mono font-bold uppercase"
                      />
                      <span className="text-[10px] text-slate-400 mt-1 block">Entity or Authorized Proprietor PAN</span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Upload PAN Card Photo <span className="text-rose-500">*</span>
                      </label>
                      {form.panCard ? (
                        <div className="flex items-center gap-3 p-2 bg-white rounded-xl border border-slate-200">
                          <img
                            src={form.panCard}
                            alt="PAN preview"
                            className="h-12 w-16 object-cover rounded-lg border border-slate-100 cursor-pointer"
                            onClick={() => setPreviewImage(form.panCard)}
                          />
                          <div className="flex-1 min-w-0">
                            <span className="text-xs font-bold text-slate-800 block truncate">PAN Uploaded ✓</span>
                            <span className="text-[10px] text-emerald-600 font-semibold">Ready for verification</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setForm(p => ({ ...p, panCard: '' }))}
                            className="text-xs text-rose-500 hover:text-rose-700 font-bold px-2 py-1"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <label className={`w-full flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
                          uploadingPan ? 'bg-slate-100 border-slate-300' : 'bg-white hover:bg-violet-50/50 border-slate-300 hover:border-violet-400'
                        }`}>
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            className="hidden"
                            onChange={e => handleFileUpload(e, 'panCard')}
                            disabled={uploadingPan}
                          />
                          <span className="text-lg mb-1">{uploadingPan ? '⏳' : '📤'}</span>
                          <span className="text-xs font-bold text-violet-700">
                            {uploadingPan ? 'Uploading Photo...' : 'Click to Upload PAN Card'}
                          </span>
                          <span className="text-[10px] text-slate-400 mt-0.5">JPG, PNG or PDF up to 10MB</span>
                        </label>
                      )}
                    </div>
                  </div>
                </div>

                {/* Aadhaar Section */}
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🪪</span>
                    <h4 className="text-sm font-bold text-slate-800">Aadhaar Card (Owner / Proprietor)</h4>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      12-Digit Aadhaar Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      maxLength={14}
                      required
                      placeholder="1234 5678 9012"
                      value={form.aadhaarNumber}
                      onChange={e => {
                        const digits = e.target.value.replace(/\D/g, '').slice(0, 12)
                        const formatted = digits.replace(/(\d{4})(?=\d)/g, '$1 ')
                        setForm(p => ({ ...p, aadhaarNumber: formatted }))
                      }}
                      className="w-full sm:w-1/2 px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 font-mono font-bold"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    {/* Front Photo */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Aadhaar Front Photo <span className="text-rose-500">*</span>
                      </label>
                      {form.aadhaarFront ? (
                        <div className="flex items-center gap-3 p-2 bg-white rounded-xl border border-slate-200">
                          <img
                            src={form.aadhaarFront}
                            alt="Aadhaar Front"
                            className="h-12 w-16 object-cover rounded-lg border border-slate-100 cursor-pointer"
                            onClick={() => setPreviewImage(form.aadhaarFront)}
                          />
                          <div className="flex-1 min-w-0">
                            <span className="text-xs font-bold text-slate-800 block truncate">Front Uploaded ✓</span>
                            <span className="text-[10px] text-emerald-600 font-semibold">Photo & Name Visible</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setForm(p => ({ ...p, aadhaarFront: '' }))}
                            className="text-xs text-rose-500 hover:text-rose-700 font-bold px-2 py-1"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <label className={`w-full flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
                          uploadingAadhaarFront ? 'bg-slate-100 border-slate-300' : 'bg-white hover:bg-violet-50/50 border-slate-300 hover:border-violet-400'
                        }`}>
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            className="hidden"
                            onChange={e => handleFileUpload(e, 'aadhaarFront')}
                            disabled={uploadingAadhaarFront}
                          />
                          <span className="text-lg mb-1">{uploadingAadhaarFront ? '⏳' : '📷'}</span>
                          <span className="text-xs font-bold text-violet-700">
                            {uploadingAadhaarFront ? 'Uploading Front...' : 'Upload Front Side'}
                          </span>
                          <span className="text-[10px] text-slate-400 mt-0.5">Clear picture with name visible</span>
                        </label>
                      )}
                    </div>

                    {/* Back Photo */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Aadhaar Back Photo <span className="text-slate-400 font-normal">(Recommended)</span>
                      </label>
                      {form.aadhaarBack ? (
                        <div className="flex items-center gap-3 p-2 bg-white rounded-xl border border-slate-200">
                          <img
                            src={form.aadhaarBack}
                            alt="Aadhaar Back"
                            className="h-12 w-16 object-cover rounded-lg border border-slate-100 cursor-pointer"
                            onClick={() => setPreviewImage(form.aadhaarBack)}
                          />
                          <div className="flex-1 min-w-0">
                            <span className="text-xs font-bold text-slate-800 block truncate">Back Uploaded ✓</span>
                            <span className="text-[10px] text-emerald-600 font-semibold">Address Visible</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setForm(p => ({ ...p, aadhaarBack: '' }))}
                            className="text-xs text-rose-500 hover:text-rose-700 font-bold px-2 py-1"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <label className={`w-full flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
                          uploadingAadhaarBack ? 'bg-slate-100 border-slate-300' : 'bg-white hover:bg-violet-50/50 border-slate-300 hover:border-violet-400'
                        }`}>
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            className="hidden"
                            onChange={e => handleFileUpload(e, 'aadhaarBack')}
                            disabled={uploadingAadhaarBack}
                          />
                          <span className="text-lg mb-1">{uploadingAadhaarBack ? '⏳' : '📷'}</span>
                          <span className="text-xs font-bold text-slate-700">
                            {uploadingAadhaarBack ? 'Uploading Back...' : 'Upload Back Side'}
                          </span>
                          <span className="text-[10px] text-slate-400 mt-0.5">Address proof verification</span>
                        </label>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="px-5 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs rounded-xl transition-all"
                  >
                    ← Back to Step 1
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (validateStep2()) setCurrentStep(3)
                    }}
                    className="px-6 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
                  >
                    Proceed to Step 3: Review & Submit →
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 3: REVIEW & SUBMIT ── */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-base font-extrabold text-slate-900">Step 3: Verification Summary & Final Submission</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Please review your records carefully. Once submitted, documents cannot be edited directly.</p>
                </div>

                {/* Summary Card */}
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Business Name</span>
                      <span className="text-slate-900 font-extrabold text-sm">{form.businessName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Business Type</span>
                      <span className="text-slate-800 font-bold">{form.businessType}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">GSTIN</span>
                      <span className="text-slate-800 font-mono font-bold">{form.gstin || 'None (Exempt)'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Registered Address</span>
                      <span className="text-slate-800 font-medium leading-relaxed">
                        {form.addressLine1}, {form.city}, {form.state} - {form.pincode}
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200">
                      {form.panCard && (
                        <img
                          src={form.panCard}
                          alt="PAN"
                          className="h-10 w-14 object-cover rounded cursor-pointer border"
                          onClick={() => setPreviewImage(form.panCard)}
                        />
                      )}
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">PAN Document</span>
                        <span className="font-mono font-extrabold text-slate-900">{form.pan}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200">
                      {form.aadhaarFront && (
                        <img
                          src={form.aadhaarFront}
                          alt="Aadhaar"
                          className="h-10 w-14 object-cover rounded cursor-pointer border"
                          onClick={() => setPreviewImage(form.aadhaarFront)}
                        />
                      )}
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Aadhaar Card</span>
                        <span className="font-mono font-extrabold text-slate-900">{form.aadhaarNumber}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Declaration Checkbox */}
                <div className="p-4 bg-violet-50/60 border border-violet-200/80 rounded-2xl flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="kyc-declaration"
                    checked={form.declaration}
                    onChange={e => setForm(p => ({ ...p, declaration: e.target.checked }))}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                  />
                  <label htmlFor="kyc-declaration" className="text-xs text-slate-700 leading-relaxed cursor-pointer select-none">
                    <strong>Legal Declaration:</strong> I hereby declare that all provided business details, PAN, and Aadhaar documents are authentic, accurate, and valid under Indian laws. I understand that once submitted, these records are locked and revisions require a formal support request.
                  </label>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    disabled={submitting}
                    className="px-5 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs rounded-xl transition-all disabled:opacity-50"
                  >
                    ← Back to Step 2
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitting || !form.declaration}
                    className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Submitting Application...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit KYC for Verification ✓</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* ── IMAGE FULL PREVIEW MODAL ── */}
      {previewImage && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-2xl max-h-[90vh] bg-white rounded-2xl overflow-hidden shadow-2xl p-2" onClick={e => e.stopPropagation()}>
            <img src={previewImage} alt="Document View" className="max-h-[80vh] w-auto mx-auto rounded-xl object-contain" />
            <div className="flex justify-between items-center p-3">
              <span className="text-xs font-bold text-slate-700">Official Document Preview</span>
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="px-4 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800"
              >
                Close ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── RAISE SUPPORT TICKET MODAL FOR KYC UPDATE ── */}
      {ticketModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-4 animate-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">Request Document Revision</h3>
                <p className="text-xs text-slate-500 mt-0.5">Submit an official ticket to update locked KYC records.</p>
              </div>
              <button
                type="button"
                onClick={() => setTicketModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRaiseTicket} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Ticket Subject</label>
                <input
                  type="text"
                  required
                  value={ticketSubject}
                  onChange={e => setTicketSubject(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Reason / Document Correction Details <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Explain what details or documents need to be updated (e.g. Changed address, new GSTIN, re-uploaded clearer PAN card photo)..."
                  value={ticketDescription}
                  onChange={e => setTicketDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-violet-500 outline-none"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-500 leading-relaxed">
                ℹ️ Our compliance team will review your ticket and unlock your submission or directly contact you within 24 hours.
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setTicketModalOpen(false)}
                  className="px-4 py-2 text-slate-600 font-bold border border-slate-200 rounded-xl hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={ticketSubmitting}
                  className="px-6 py-2 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl shadow-md disabled:opacity-50"
                >
                  {ticketSubmitting ? 'Raising Ticket...' : 'Submit Support Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
