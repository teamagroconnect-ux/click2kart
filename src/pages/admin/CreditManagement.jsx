import React, { useEffect, useState } from 'react'
import api from '../../lib/api'
import { useToast } from '../../components/Toast'
import { PopularBanksPicker, CompleteIndianBankSelector } from '../user/Profile'

export default function CreditManagement() {
  const { notify } = useToast()

  // Navigation tab: 'trade_credit' | 'business_apps' | 'business_facilities' | 'bureau_report' | 'product_settings'
  const [mainTab, setMainTab] = useState('trade_credit')

  // Overall Trade Stats
  const [stats, setStats] = useState({
    totalLimit: 0,
    totalAvailable: 0,
    totalUsed: 0,
    totalOutstanding: 0,
    enabledCount: 0,
    mandatesActiveCount: 0,
    bankVerifiedCount: 0
  })

  // ==========================================
  // TRADE CREDIT (ORDER CREDIT) STATE
  // ==========================================
  const [retailers, setRetailers] = useState([])
  const [loadingRetailers, setLoadingRetailers] = useState(true)
  const [searchQ, setSearchQ] = useState('')
  const [statusFilter, setStatusFilter] = useState('all') // 'all' | 'enabled' | 'disabled' | 'mandate_active' | 'bank_linked' | 'has_dues'

  // Retailer Quick Detail Modal state
  const [quickDetailRetailer, setQuickDetailRetailer] = useState(null)
  const [quickDetailOpen, setQuickDetailOpen] = useState(false)
  const [loadingQuickDetail, setLoadingQuickDetail] = useState(false)

  // Modals state
  const [selectedRetailer, setSelectedRetailer] = useState(null)
  const [toggleModalOpen, setToggleModalOpen] = useState(false)
  const [limitModalOpen, setLimitModalOpen] = useState(false)
  const [adjustModalOpen, setAdjustModalOpen] = useState(false)
  const [ledgerModalOpen, setLedgerModalOpen] = useState(false)

  // Form states
  const [formReason, setFormReason] = useState('')
  const [formLimit, setFormLimit] = useState('')
  const [formAdjustAmount, setFormAdjustAmount] = useState('')
  const [formAdjustType, setFormAdjustType] = useState('INCREASE')
  const [actionLoading, setActionLoading] = useState(false)
  const [ledgerHistory, setLedgerHistory] = useState([])
  const [reconciling, setReconciling] = useState(false)
  const [notifyModalOpen, setNotifyModalOpen] = useState(false)
  const [notifying, setNotifying] = useState(false)

  // Trade Credit AutoPay Schedule Modal state
  const [tradeAutoPayModalOpen, setTradeAutoPayModalOpen] = useState(false)
  const [selectedTradeAutoPayRetailer, setSelectedTradeAutoPayRetailer] = useState(null)
  const [tradeAutoPayFrequency, setTradeAutoPayFrequency] = useState('WEEKLY')
  const [tradeAutoPayDebitDay, setTradeAutoPayDebitDay] = useState('MONDAY')
  const [tradeAutoPayDebitTime, setTradeAutoPayDebitTime] = useState('10:00 AM')
  const [savingTradeAutoPay, setSavingTradeAutoPay] = useState(false)

  // Admin Retailer Bank Account Details Modal state
  const [adminBankModalOpen, setAdminBankModalOpen] = useState(false)
  const [selectedBankRetailer, setSelectedBankRetailer] = useState(null)
  const [adminBankForm, setAdminBankForm] = useState({
    accountHolder: '',
    bankName: '',
    accountNumber: '',
    ifsc: '',
    accountType: 'CURRENT',
    isVerified: true
  })
  const [savingAdminBank, setSavingAdminBank] = useState(false)

  const openAdminBankModal = (retailer) => {
    setSelectedBankRetailer(retailer)
    const bk = retailer.bankDetails || {}
    setAdminBankForm({
      accountHolder: bk.accountHolder || retailer.kyc?.businessName || retailer.name || '',
      bankName: bk.bankName || '',
      accountNumber: bk.accountNumber || '',
      ifsc: bk.ifsc || '',
      accountType: bk.accountType || 'CURRENT',
      isVerified: bk.isVerified !== undefined ? Boolean(bk.isVerified) : true
    })
    setAdminBankModalOpen(true)
  }

  const handleSaveAdminBank = async (e) => {
    e?.preventDefault()
    if (!selectedBankRetailer) return
    setSavingAdminBank(true)
    try {
      await api.put(`/api/credit/admin/retailers/${selectedBankRetailer._id}/bank`, adminBankForm)
      notify('Retailer bank account details updated successfully', 'success')
      setAdminBankModalOpen(false)
      loadRetailers()
    } catch (err) {
      notify(err?.response?.data?.message || err?.response?.data?.error || 'Failed to update bank details', 'error')
    } finally {
      setSavingAdminBank(false)
    }
  }

  // Presets
  const ADJUST_PRESETS = {
    INCREASE: [
      'Credit limit enhancement based on consistent repayment history',
      'Seasonal credit enhancement for festive/bulk wholesale demand',
      'Approved higher credit facility per business verification',
      'Operational limit increase per admin review'
    ],
    DECREASE: [
      'Periodic risk management limit reduction',
      'Limit reduction per merchant formal request',
      'Overdue balance containment adjustment',
      'Credit line reduction following account review'
    ]
  }

  const TOGGLE_PRESETS = {
    ENABLE: [
      'Approved after verification of trade license and business volume',
      'KYC verified and approved for B2B wholesale credit facility',
      'Initial credit limit granted per onboarding criteria'
    ],
    DISABLE: [
      'Temporarily deactivated per credit risk assessment',
      'Credit facility paused per merchant request',
      'Overdue outstanding dues hold pending clearance',
      'Account deactivated following annual compliance review'
    ]
  }

  // ==========================================
  // BUSINESS CREDIT APPLICATIONS STATE
  // ==========================================
  const [businessApps, setBusinessApps] = useState([])
  const [loadingApps, setLoadingApps] = useState(false)
  const [appStatusFilter, setAppStatusFilter] = useState('ALL')
  const [appSearchQ, setAppSearchQ] = useState('')
  const [selectedApp, setSelectedApp] = useState(null)

  // Review modal
  const [reviewModalOpen, setReviewModalOpen] = useState(false)
  const [reviewAction, setReviewAction] = useState('APPROVE')
  const [reviewLimit, setReviewLimit] = useState('')
  const [reviewRate, setReviewRate] = useState(18)
  const [reviewTenure, setReviewTenure] = useState(3) // 3 to 5 months
  const [reviewFreq, setReviewFreq] = useState('WEEKLY')
  const [reviewFee, setReviewFee] = useState(2)
  const [reviewReason, setReviewReason] = useState('')
  const [reviewRemarks, setReviewRemarks] = useState('')

  // Proactive grant modal
  const [proactiveModalOpen, setProactiveModalOpen] = useState(false)
  const [proactiveRetailerId, setProactiveRetailerId] = useState('')
  const [proactiveLimit, setProactiveLimit] = useState('50000')
  const [proactiveTenure, setProactiveTenure] = useState(3)
  const [proactiveRate, setProactiveRate] = useState(18)
  const [proactiveFreq, setProactiveFreq] = useState('WEEKLY')
  const [proactiveFee, setProactiveFee] = useState(2)
  const [proactivePurpose, setProactivePurpose] = useState('Working Capital Expansion')
  const [proactiveRemarks, setProactiveRemarks] = useState('')

  // Disbursement confirmation modal
  const [disburseModalOpen, setDisburseModalOpen] = useState(false)
  const [disburseRef, setDisburseRef] = useState('')
  const [disburseMode, setDisburseMode] = useState('NEFT')
  const [disburseRemarks, setDisburseRemarks] = useState('')

  // Application Timeline & Audit Trail modal
  const [timelineModalOpen, setTimelineModalOpen] = useState(false)
  const [selectedTimelineApp, setSelectedTimelineApp] = useState(null)

  // ==========================================
  // BUSINESS CREDIT FACILITIES STATE
  // ==========================================
  const [businessFacilities, setBusinessFacilities] = useState([])
  const [loadingFacilities, setLoadingFacilities] = useState(false)
  const [facStatusFilter, setFacStatusFilter] = useState('ALL')
  const [facSearchQ, setFacSearchQ] = useState('')
  const [selectedFacility, setSelectedFacility] = useState(null)
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false)

  // Facility offline repayment reconciliation modal
  const [facRepayModalOpen, setFacRepayModalOpen] = useState(false)
  const [facRepayAmount, setFacRepayAmount] = useState('')
  const [facRepayMode, setFacRepayMode] = useState('BANK_TRANSFER')
  const [facRepayRef, setFacRepayRef] = useState('')
  const [facRepayNotes, setFacRepayNotes] = useState('')
  const [runningAccrual, setRunningAccrual] = useState(false)

  // ==========================================
  // CREDIT BUREAU REPORT STATE
  // ==========================================
  const [bureauData, setBureauData] = useState(null)
  const [loadingBureau, setLoadingBureau] = useState(false)

  // ==========================================
  // PRODUCT SETTINGS STATE
  // ==========================================
  const [productSettings, setProductSettings] = useState({
    isProductEnabled: true,
    defaultAnnualInterestRatePercent: 18,
    minAnnualInterestRatePercent: 12,
    maxAnnualInterestRatePercent: 36,
    defaultTenureMonths: 3,
    minTenureMonths: 1,
    maxTenureMonths: 12,
    permittedTenures: [1, 2, 3, 4, 5],
    autoPayEnabled: false,
    processingFeePercent: 2,
    minCreditLimit: 10000,
    maxCreditLimit: 1000000,
    tradeCreditDefaultSchedule: {
      frequency: 'WEEKLY',
      weeklyDebitDay: 'MONDAY',
      debitTime: '10:00 AM'
    }
  })
  const [loadingSettings, setLoadingSettings] = useState(false)
  const [savingSettings, setSavingSettings] = useState(false)

  // ==========================================
  // DATA LOADERS
  // ==========================================

  // Load Trade Credit Retailers
  const loadRetailers = async () => {
    setLoadingRetailers(true)
    try {
      const { data } = await api.get('/api/credit/admin/retailers', {
        params: { q: searchQ, status: statusFilter }
      })
      setRetailers(data.items || [])
      if (data.stats) setStats(data.stats)
    } catch (err) {
      notify(err?.response?.data?.error || 'Failed to load credit retailers', 'error')
    } finally {
      setLoadingRetailers(false)
    }
  }

  // Load Business Credit Applications
  const loadBusinessApplications = async () => {
    setLoadingApps(true)
    try {
      const { data } = await api.get('/api/credit/admin/business/applications', {
        params: { status: appStatusFilter, q: appSearchQ }
      })
      setBusinessApps(data.applications || [])
    } catch (err) {
      notify(err?.response?.data?.message || 'Failed to load business credit applications', 'error')
    } finally {
      setLoadingApps(false)
    }
  }

  // Load Business Credit Facilities
  const loadBusinessFacilities = async () => {
    setLoadingFacilities(true)
    try {
      const { data } = await api.get('/api/credit/admin/business/facilities', {
        params: { status: facStatusFilter, q: facSearchQ }
      })
      setBusinessFacilities(data.facilities || [])
    } catch (err) {
      notify(err?.response?.data?.message || 'Failed to load credit facilities', 'error')
    } finally {
      setLoadingFacilities(false)
    }
  }

  // Load Bureau Report
  const loadBureauReport = async () => {
    setLoadingBureau(true)
    try {
      const { data } = await api.get('/api/credit/admin/business/bureau-report')
      setBureauData(data)
    } catch (err) {
      notify(err?.response?.data?.message || 'Failed to load credit bureau dataset', 'error')
    } finally {
      setLoadingBureau(false)
    }
  }

  // Load Product Settings
  const loadProductSettings = async () => {
    setLoadingSettings(true)
    try {
      const { data } = await api.get('/api/credit/admin/business/settings')
      if (data?.settings) {
        const s = data.settings;
        setProductSettings(prev => ({
          ...prev,
          ...s,
          isProductEnabled: Boolean(s.isEnabled !== undefined ? s.isEnabled : (s.isProductEnabled !== undefined ? s.isProductEnabled : true)),
          defaultAnnualInterestRatePercent: s.interestRatePerAnnum || s.defaultAnnualInterestRatePercent || 18,
          defaultTenureMonths: s.defaultTenureMonths || 3,
          permittedTenures: s.permittedTenures && s.permittedTenures.length > 0 ? s.permittedTenures : [1, 2, 3, 4, 5],
          processingFeePercent: s.processingFeeValue !== undefined ? s.processingFeeValue : (s.processingFeePercent || 2),
          maxCreditLimit: s.maxAmount || s.maxCreditLimit || 500000,
          minCreditLimit: s.minAmount || s.minCreditLimit || 10000,
          autoPayEnabled: Boolean(s.autoPayEnabled),
          tradeCreditDefaultSchedule: s.tradeCreditDefaultSchedule || {
            frequency: 'WEEKLY',
            weeklyDebitDay: 'MONDAY',
            debitTime: '10:00 AM'
          }
        }))
      }
    } catch (err) {
      console.warn('Could not load credit product settings', err)
    } finally {
      setLoadingSettings(false)
    }
  }

  useEffect(() => {
    loadProductSettings()
  }, [])

  useEffect(() => {
    if (mainTab === 'trade_credit') loadRetailers()
    if (mainTab === 'business_apps') loadBusinessApplications()
    if (mainTab === 'business_facilities') loadBusinessFacilities()
    if (mainTab === 'bureau_report') loadBureauReport()
    if (mainTab === 'product_settings') loadProductSettings()
  }, [mainTab, searchQ, statusFilter, appStatusFilter, appSearchQ, facStatusFilter, facSearchQ])

  // Open Retailer Quick Detail Modal
  const openRetailerQuickDetail = async (retailer) => {
    setQuickDetailOpen(true)
    setLoadingQuickDetail(true)
    try {
      const { data } = await api.get(`/api/admin/customers/${retailer._id}`)
      setQuickDetailRetailer(data)
    } catch (err) {
      setQuickDetailRetailer({ user: retailer, orders: [] })
    } finally {
      setLoadingQuickDetail(false)
    }
  }

  // Toggle credit modal submit
  const handleToggleCredit = async (e) => {
    e.preventDefault()
    if (!formReason.trim()) return notify('Reason is required for audit trail', 'error')
    setActionLoading(true)
    try {
      const isEnabling = !selectedRetailer.isCreditEnabled
      const payload = {
        isCreditEnabled: isEnabling,
        reason: formReason.trim()
      }
      if (isEnabling && formLimit) {
        payload.creditLimit = Number(formLimit)
      }
      await api.post(`/api/credit/admin/retailers/${selectedRetailer._id}/toggle`, payload)
      notify(`Credit facility ${isEnabling ? 'enabled' : 'disabled'} successfully`, 'success')
      setToggleModalOpen(false)
      setFormReason('')
      setFormLimit('')
      loadRetailers()
    } catch (err) {
      notify(err?.response?.data?.message || err?.response?.data?.error || 'Failed to update credit', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  // Manual Adjust credit submit
  const handleAdjustCredit = async (e) => {
    e.preventDefault()
    if (!formAdjustAmount || Number(formAdjustAmount) <= 0) return notify('Valid amount is required', 'error')
    if (!formReason.trim()) return notify('Reason is required for audit trail', 'error')
    setActionLoading(true)
    try {
      await api.post(`/api/credit/admin/retailers/${selectedRetailer._id}/adjust`, {
        amount: Number(formAdjustAmount),
        type: formAdjustType,
        reason: formReason.trim()
      })
      notify(`Credit successfully ${formAdjustType === 'INCREASE' ? 'increased' : 'decreased'}`, 'success')
      setAdjustModalOpen(false)
      setFormReason('')
      setFormAdjustAmount('')
      loadRetailers()
    } catch (err) {
      notify(err?.response?.data?.message || err?.response?.data?.error || 'Failed to adjust credit', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  // Set Credit Limit submit
  const handleSetLimit = async (e) => {
    e.preventDefault()
    if (!formLimit || Number(formLimit) < 0) return notify('Valid limit is required', 'error')
    if (!formReason.trim()) return notify('Reason is required for audit trail', 'error')
    setActionLoading(true)
    try {
      await api.post(`/api/credit/admin/retailers/${selectedRetailer._id}/adjust`, {
        amount: Number(formLimit),
        type: 'SET_LIMIT',
        reason: formReason.trim()
      })
      notify('Credit limit updated successfully', 'success')
      setLimitModalOpen(false)
      setFormReason('')
      setFormLimit('')
      loadRetailers()
    } catch (err) {
      notify(err?.response?.data?.message || 'Failed to update limit', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  // Open Trade Credit AutoPay modal
  const openTradeAutoPayModal = (retailer) => {
    setSelectedTradeAutoPayRetailer(retailer)
    const sched = retailer?.tradeCreditAutoPaySchedule || {}
    setTradeAutoPayFrequency(sched.frequency || 'WEEKLY')
    setTradeAutoPayDebitDay(sched.weeklyDebitDay || 'MONDAY')
    setTradeAutoPayDebitTime(sched.debitTime || '10:00 AM')
    setTradeAutoPayModalOpen(true)
  }

  // Save Trade Credit AutoPay Schedule
  const handleSaveTradeAutoPaySchedule = async (e) => {
    e.preventDefault()
    if (!selectedTradeAutoPayRetailer) return
    setSavingTradeAutoPay(true)
    try {
      await api.put(`/api/credit/admin/retailers/${selectedTradeAutoPayRetailer._id}/autopay-schedule`, {
        frequency: tradeAutoPayFrequency,
        weeklyDebitDay: tradeAutoPayDebitDay,
        debitTime: tradeAutoPayDebitTime
      })
      notify('Trade Credit AutoPay schedule updated successfully!', 'success')
      setTradeAutoPayModalOpen(false)
      loadRetailers()
    } catch (err) {
      notify(err?.response?.data?.message || err?.response?.data?.error || 'Failed to update AutoPay schedule', 'error')
    } finally {
      setSavingTradeAutoPay(false)
    }
  }

  // View ledger
  const openLedgerModal = async (retailer) => {
    setSelectedRetailer(retailer)
    setLedgerModalOpen(true)
    try {
      const { data } = await api.get(`/api/credit/admin/retailers/${retailer._id}`)
      setLedgerHistory(data.transactions || [])
    } catch (err) {
      notify('Failed to load ledger history', 'error')
    }
  }

  // Run Reconciliation
  const handleReconcile = async () => {
    setReconciling(true)
    try {
      const { data } = await api.post('/api/credit/admin/reconcile')
      const r = data.report || {}
      notify(
        `Reconciliation complete: ${r.ordersReconciled || 0} orders & ${r.repaymentsReconciled || 0} repayments synced`,
        'success'
      )
      loadRetailers()
    } catch (err) {
      notify(err?.response?.data?.message || 'Reconciliation failed', 'error')
    } finally {
      setReconciling(false)
    }
  }

  // Notify Outstanding Balance Holders
  const handleNotifyOutstanding = async () => {
    setNotifying(true)
    try {
      const { data } = await api.post('/api/credit/admin/notify-outstanding')
      notify(data.message || `Sent reminders to ${data.sentCount || 0} retailers`, 'success')
      setNotifyModalOpen(false)
    } catch (err) {
      notify(err?.response?.data?.message || err?.response?.data?.error || 'Failed to send notifications', 'error')
    } finally {
      setNotifying(false)
    }
  }

  // ==========================================
  // BUSINESS CREDIT ACTIONS
  // ==========================================

  // Submit Review on Business Credit Application
  const handleReviewApplication = async (e) => {
    e.preventDefault()
    if (!selectedApp) return
    if (reviewAction === 'REJECT' && !reviewReason.trim()) {
      return notify('Rejection reason is required', 'error')
    }
    if ((reviewAction === 'APPROVE' || reviewAction === 'PARTIAL_APPROVE')) {
      const t = Number(reviewTenure)
      if (t < 1 || t > 12) return notify('Valid tenure is required (1 to 5 months)', 'error')
      if (!reviewLimit || Number(reviewLimit) <= 0) return notify('Valid approved limit is required', 'error')
    }

    setActionLoading(true)
    try {
      const normalizedAction = reviewAction === 'APPROVE' ? 'APPROVED' : reviewAction
      await api.post(`/api/credit/admin/business/applications/${selectedApp._id}/review`, {
        action: normalizedAction,
        approvedLimit: Number(reviewLimit),
        approvedAmount: Number(reviewLimit),
        approvedTenureMonths: Number(reviewTenure),
        approvedFrequency: reviewFreq,
        annualInterestRatePercent: Number(reviewRate),
        processingFeePercent: Number(reviewFee),
        rejectionReason: reviewReason.trim(),
        remarks: reviewRemarks.trim(),
        adminNotes: reviewRemarks.trim()
      })
      notify(`Application status updated to ${normalizedAction}`, 'success')
      setReviewModalOpen(false)
      loadBusinessApplications()
    } catch (err) {
      notify(err?.response?.data?.message || err?.response?.data?.error || 'Review submission failed', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  // Submit Proactive Credit Grant
  const handleProactiveGrant = async (e) => {
    e.preventDefault()
    if (!proactiveRetailerId) return notify('Please select or specify a verified retailer', 'error')
    const t = Number(proactiveTenure)
    if (t < 1 || t > 12) return notify('Valid tenure is required (1 to 5 months)', 'error')
    if (!proactiveLimit || Number(proactiveLimit) <= 0) return notify('Valid credit limit is required', 'error')

    setActionLoading(true)
    try {
      await api.post('/api/credit/admin/business/proactive-grant', {
        retailerId: proactiveRetailerId,
        approvedLimit: Number(proactiveLimit),
        approvedAmount: Number(proactiveLimit),
        approvedTenureMonths: t,
        approvedFrequency: proactiveFreq,
        annualInterestRatePercent: Number(proactiveRate),
        processingFeePercent: Number(proactiveFee),
        purpose: proactivePurpose.trim(),
        reason: proactivePurpose.trim() || 'Proactive Working Capital Credit Line Grant',
        remarks: proactiveRemarks.trim(),
        adminNotes: proactiveRemarks.trim()
      })
      notify('Proactive credit line granted successfully! Retailer can now review & accept.', 'success')
      setProactiveModalOpen(false)
      setProactiveLimit('50000')
      setProactiveRemarks('')
      loadBusinessApplications()
    } catch (err) {
      notify(err?.response?.data?.message || err?.response?.data?.error || 'Failed to grant proactive credit', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  // Confirm Disbursement
  const handleConfirmDisbursement = async (e) => {
    e.preventDefault()
    if (!selectedApp) return
    if (!disburseRef.trim()) return notify('Bank transfer transaction reference (UTR/Ref) is required', 'error')

    setActionLoading(true)
    try {
      const { data } = await api.post(`/api/credit/admin/business/applications/${selectedApp._id}/disburse`, {
        bankTransferReference: disburseRef.trim(),
        disbursementMode: disburseMode,
        remarks: disburseRemarks.trim()
      })
      notify(`Disbursement confirmed! Facility activated with ${data.schedulesCount} scheduled instalments.`, 'success')
      setDisburseModalOpen(false)
      setDisburseRef('')
      setDisburseRemarks('')
      loadBusinessApplications()
      loadBusinessFacilities()
    } catch (err) {
      notify(err?.response?.data?.message || err?.response?.data?.error || 'Failed to confirm disbursement', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  // Reconcile Offline Repayment for Facility
  const handleReconcileFacilityRepayment = async (e) => {
    e.preventDefault()
    if (!selectedFacility) return
    const amt = Number(facRepayAmount)
    if (!amt || amt <= 0) return notify('Valid repayment amount is required', 'error')

    setActionLoading(true)
    try {
      await api.post(`/api/credit/admin/business/facilities/${selectedFacility._id}/repay-reconcile`, {
        amount: amt,
        paymentMode: facRepayMode,
        paymentReference: facRepayRef.trim() || `OFFLINE_REC_${Date.now()}`,
        notes: facRepayNotes.trim()
      })
      notify('Repayment successfully recorded and applied to outstanding balance!', 'success')
      setFacRepayModalOpen(false)
      setFacRepayAmount('')
      setFacRepayRef('')
      setFacRepayNotes('')
      loadBusinessFacilities()
    } catch (err) {
      notify(err?.response?.data?.message || 'Repayment reconciliation failed', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  // Trigger Daily Compounding Interest Accrual
  const handleRunDailyAccrual = async () => {
    if (!window.confirm('Trigger daily compounding interest accrual for all active facilities now?')) return
    setRunningAccrual(true)
    try {
      const { data } = await api.post('/api/credit/admin/business/run-accrual')
      const r = data.result || {}
      notify(
        `Daily accrual executed! Processed ${r.processedCount || 0} active facilities. Total Interest Accrued: ₹${(r.totalInterestAccrued || 0).toLocaleString('en-IN')}`,
        'success'
      )
      loadBusinessFacilities()
    } catch (err) {
      notify(err?.response?.data?.message || 'Daily accrual run failed', 'error')
    } finally {
      setRunningAccrual(false)
    }
  }

  // Save Product Settings
  const handleSaveProductSettings = async (e) => {
    e.preventDefault()
    const activeTenures = productSettings.permittedTenures && productSettings.permittedTenures.length > 0
      ? productSettings.permittedTenures
      : [1, 2, 3, 4, 5];

    if (activeTenures.length === 0) {
      return notify('Please enable at least one permitted tenure month (1 to 12).', 'error');
    }

    const tDef = Number(productSettings.defaultTenureMonths)
    if (!activeTenures.includes(tDef)) {
      return notify(`Default tenure (${tDef}M) must be one of the enabled permitted tenures: ${activeTenures.join(', ')}M`, 'error')
    }

    setSavingSettings(true)
    try {
      const payload = {
        ...productSettings,
        isEnabled: productSettings.isProductEnabled,
        permittedTenures: activeTenures,
        minTenureMonths: Math.min(...activeTenures),
        maxTenureMonths: Math.max(...activeTenures),
        interestRatePerAnnum: Number(productSettings.defaultAnnualInterestRatePercent),
        processingFeeValue: Number(productSettings.processingFeePercent),
        maxAmount: Number(productSettings.maxCreditLimit),
        minAmount: Number(productSettings.minCreditLimit),
        tradeCreditDefaultSchedule: productSettings.tradeCreditDefaultSchedule
      };
      const { data } = await api.put('/api/credit/admin/business/settings', payload)
      notify('Product configuration updated successfully! Active tenures saved.', 'success')
      if (data?.settings) {
        setProductSettings(prev => ({
          ...prev,
          ...data.settings,
          permittedTenures: data.settings.permittedTenures || activeTenures
        }))
      }
    } catch (err) {
      notify(err?.response?.data?.message || 'Failed to save product settings', 'error')
    } finally {
      setSavingSettings(false)
    }
  }

  // Export Bureau JSON
  const handleExportBureauJSON = () => {
    if (!bureauData) return
    const blob = new Blob([JSON.stringify(bureauData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Click2Kart_Credit_Bureau_Report_${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Credit Management & Financing</h1>
          <p className="text-sm text-gray-500 font-medium mt-1 uppercase tracking-widest text-[10px]">
            Trade Credit Line • Business Credit Line (Working Capital) • Bureau Compliance Audit
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setNotifyModalOpen(true)}
            disabled={notifying}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-black uppercase tracking-wider rounded-2xl transition-all shadow-md active:scale-95 disabled:opacity-50"
            title="Dispatch payment reminders to all retailers with outstanding dues"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            Notify Outstanding ({stats.totalOutstanding > 0 ? `₹${(stats.totalOutstanding || 0).toLocaleString('en-IN')}` : 'All Clear'})
          </button>
          <button
            onClick={handleReconcile}
            disabled={reconciling}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-2xl transition-all shadow-sm active:scale-95 disabled:opacity-50"
          >
            <svg className={`w-4 h-4 ${reconciling ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {reconciling ? 'Reconciling...' : 'Reconcile Gateway'}
          </button>
        </div>
      </div>

      {/* Top Main Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-3 overflow-x-auto no-scrollbar">
        {[
          { id: 'trade_credit', label: 'Trade Credit (Orders)', badge: retailers.filter(r => r.isCreditEnabled).length },
          { id: 'business_apps', label: 'Business Credit Applications', badge: businessApps.filter(a => ['SUBMITTED', 'UNDER_REVIEW', 'PENDING_REVIEW'].includes(a.status)).length, badgeColor: 'bg-amber-100 text-amber-800' },
          { id: 'business_facilities', label: 'Active Facilities & Amortization', badge: businessFacilities.filter(f => f.status === 'ACTIVE').length, badgeColor: 'bg-emerald-100 text-emerald-800' },
          { id: 'bureau_report', label: 'Credit Bureau Export & Audit' },
          { id: 'product_settings', label: 'Product Settings & Terms' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setMainTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${
              mainTab === tab.id
                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-200'
                : 'bg-white text-gray-600 hover:text-gray-900 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <span>{tab.label}</span>
            {tab.badge !== undefined && tab.badge > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${mainTab === tab.id ? 'bg-white/20 text-white' : tab.badgeColor || 'bg-gray-100 text-gray-700'}`}>
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: TRADE CREDIT (ORDER CREDIT) */}
      {/* ========================================================================= */}
      {mainTab === 'trade_credit' && (
        <div className="space-y-6">
          {/* Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
            <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Credit Users</div>
              <div className="text-xl font-black text-gray-900 mt-1">{stats.enabledCount}</div>
              <div className="text-[10px] text-gray-500 mt-0.5">Active facility</div>
            </div>

            <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
              <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Mandates Active</div>
              <div className="text-xl font-black text-emerald-700 mt-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>{stats.mandatesActiveCount || 0}</span>
              </div>
              <div className="text-[10px] text-gray-500 mt-0.5">AutoPay enabled</div>
            </div>

            <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
              <div className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Banks Verified</div>
              <div className="text-xl font-black text-indigo-700 mt-1">{stats.bankVerifiedCount || 0}</div>
              <div className="text-[10px] text-gray-500 mt-0.5">Disbursement accounts</div>
            </div>

            <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
              <div className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">Total Limit</div>
              <div className="text-xl font-black text-blue-600 mt-1">₹{(stats.totalLimit || 0).toLocaleString('en-IN')}</div>
              <div className="text-[10px] text-gray-500 mt-0.5">Assigned credit</div>
            </div>

            <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
              <div className="text-[10px] font-bold text-teal-600 uppercase tracking-wider">Available</div>
              <div className="text-xl font-black text-teal-600 mt-1">₹{(stats.totalAvailable || 0).toLocaleString('en-IN')}</div>
              <div className="text-[10px] text-gray-500 mt-0.5">Spendable pool</div>
            </div>

            <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
              <div className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">Used Credit</div>
              <div className="text-xl font-black text-amber-600 mt-1">₹{(stats.totalUsed || 0).toLocaleString('en-IN')}</div>
              <div className="text-[10px] text-gray-500 mt-0.5">Orders drawn</div>
            </div>

            <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
              <div className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">Outstanding</div>
              <div className="text-xl font-black text-rose-600 mt-1">₹{(stats.totalOutstanding || 0).toLocaleString('en-IN')}</div>
              <div className="text-[10px] text-gray-500 mt-0.5">Pending collection</div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <input
                className="w-full bg-white border border-gray-200 text-gray-900 text-sm rounded-2xl pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                placeholder="Search by retailer, phone, business..."
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
              />
              <svg className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { label: 'All Retailers', value: 'all' },
                { label: 'Credit Enabled', value: 'enabled' },
                { label: 'Mandate Active ⚡', value: 'mandate_active' },
                { label: 'Bank Linked 🏛️', value: 'bank_linked' },
                { label: 'Outstanding Dues ⚠️', value: 'has_dues' },
                { label: 'Credit Disabled', value: 'disabled' }
              ].map((f) => (
                <button
                  key={f.value}
                  onClick={() => setStatusFilter(f.value)}
                  className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    statusFilter === f.value
                      ? 'bg-violet-600 text-white shadow-sm'
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Retailers Table */}
          <div className="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead className="bg-gray-50/50 border-b border-gray-50 text-gray-400 font-black uppercase tracking-[0.2em] text-[10px]">
                  <tr>
                    <th className="px-6 py-5">Retailer Profile</th>
                    <th className="px-6 py-5">Credit Status</th>
                    <th className="px-6 py-5">AutoPay Mandate</th>
                    <th className="px-6 py-5">Bank Account</th>
                    <th className="px-6 py-5">Limit (₹)</th>
                    <th className="px-6 py-5">Available (₹)</th>
                    <th className="px-6 py-5">Outstanding (₹)</th>
                    <th className="px-6 py-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loadingRetailers ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td colSpan="8" className="px-6 py-8"><div className="h-5 bg-gray-50 rounded-full w-full"></div></td>
                      </tr>
                    ))
                  ) : retailers.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-6 py-16 text-center text-gray-400 italic font-medium uppercase tracking-[0.2em] text-[10px]">
                        No retailers match your search or filter criteria.
                      </td>
                    </tr>
                  ) : (
                    retailers.map((r) => {
                      const isEn = Boolean(r.isCreditEnabled)
                      const isMandateActive = r.autoPayMandate?.status === 'ACTIVE'
                      return (
                        <tr key={r._id} className="group hover:bg-gray-50/40 transition-colors">
                          <td
                            className="px-6 py-5 cursor-pointer"
                            onClick={() => openRetailerQuickDetail(r)}
                            title="Click to view full retailer KYC & trade details"
                          >
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 shrink-0 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xs border border-blue-100 shadow-sm">
                                {r.name?.charAt(0)?.toUpperCase() || 'R'}
                              </div>
                              <div className="min-w-0">
                                <div className="font-black text-gray-900 text-sm flex items-center gap-1.5">
                                  <span className="truncate">{r.name}</span>
                                  <span className="text-[10px] text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity font-bold">ℹ️</span>
                                </div>
                                <div className="text-[11px] text-gray-400 font-semibold truncate mt-0.5">
                                  {r.kyc?.businessName || 'Direct Retailer'} • {r.phone}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black tracking-widest border uppercase ${
                                isEn ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-gray-100 text-gray-500 border-gray-200'
                              }`}
                            >
                              {isEn ? 'Approved' : 'Disabled'}
                            </span>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex flex-col gap-1 items-start">
                              {isMandateActive ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                  <span>Mandate Active</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-500 border border-gray-200">
                                  Mandate Inactive
                                </span>
                              )}
                              {isMandateActive ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-700 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200/70">
                                  <span>🗓️</span>
                                  <span>
                                    {r.tradeCreditAutoPaySchedule?.frequency === 'DAILY'
                                      ? `Daily (${r.tradeCreditAutoPaySchedule?.debitTime || '10:00 AM'})`
                                      : `Weekly (${r.tradeCreditAutoPaySchedule?.weeklyDebitDay ? r.tradeCreditAutoPaySchedule.weeklyDebitDay.slice(0, 3) : 'Mon'} ${r.tradeCreditAutoPaySchedule?.debitTime || '10:00 AM'})`}
                                  </span>
                                </span>
                              ) : (
                                <span className="text-[10px] text-gray-400 font-medium italic">Manual Clearance</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            {r.bankDetails?.accountNumber ? (
                              <div className="flex flex-col gap-0.5 items-start text-xs">
                                <div className="flex items-center gap-1.5 font-black text-gray-900">
                                  <span className="truncate max-w-[130px]">{r.bankDetails.bankName || 'Bank'}</span>
                                  <span className={`px-1.5 py-0.2 rounded-md text-[9px] font-black uppercase tracking-wider border ${
                                    r.bankDetails.isVerified ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-blue-50 text-blue-700 border-blue-200'
                                  }`}>
                                    {r.bankDetails.isVerified ? 'Verified ✓' : 'Linked'}
                                  </span>
                                </div>
                                <div className="font-mono text-[11px] text-gray-600 font-bold">
                                  ••••{String(r.bankDetails.accountNumber).slice(-4)}
                                  <span className="font-sans text-[10px] text-gray-400 font-semibold ml-1.5">({r.bankDetails.ifsc || 'IFSC'})</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => openAdminBankModal(r)}
                                  className="text-[10px] text-indigo-600 hover:text-indigo-800 font-black hover:underline cursor-pointer flex items-center gap-0.5 mt-0.5"
                                >
                                  ✏️ Edit Bank
                                </button>
                              </div>
                            ) : (
                              <div className="flex flex-col gap-1 items-start">
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200 uppercase tracking-wider">
                                  Not Linked
                                </span>
                                <button
                                  type="button"
                                  onClick={() => openAdminBankModal(r)}
                                  className="text-[11px] text-indigo-600 hover:text-indigo-800 font-black hover:underline cursor-pointer flex items-center gap-0.5"
                                >
                                  + Add Bank
                                </button>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-5 font-black text-gray-900 text-sm">
                            ₹{(r.creditLimit || 0).toLocaleString('en-IN')}
                          </td>
                          <td className="px-6 py-5 font-black text-emerald-600 text-sm">
                            ₹{(r.availableCredit || 0).toLocaleString('en-IN')}
                          </td>
                          <td className="px-6 py-5 font-black text-rose-600 text-sm">
                            ₹{(r.outstandingBalance || 0).toLocaleString('en-IN')}
                          </td>
                          <td className="px-6 py-5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => openAdminBankModal(r)}
                                title="View & Configure Bank Account"
                                className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                              >
                                <span>🏛️</span>
                                <span className="hidden xl:inline">Bank</span>
                              </button>
                              <button
                                onClick={() => openTradeAutoPayModal(r)}
                                title="Configure Auto-Debit Schedule (Daily / Weekly)"
                                className="px-2.5 py-1.5 bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                              >
                                <span>⚙️</span>
                                <span>Schedule</span>
                              </button>
                              <button
                                onClick={() => openLedgerModal(r)}
                                title="View Credit Ledger"
                                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold transition-all cursor-pointer"
                              >
                                Ledger
                              </button>
                              {isEn ? (
                                <>
                                  <button
                                    onClick={() => {
                                      setSelectedRetailer(r)
                                      setFormAdjustAmount('')
                                      setFormAdjustType('INCREASE')
                                      setFormReason('Credit limit enhancement based on consistent repayment history')
                                      setAdjustModalOpen(true)
                                    }}
                                    className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                                  >
                                    Adjust
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedRetailer(r)
                                      setFormReason('Temporarily deactivated per credit risk assessment')
                                      setToggleModalOpen(true)
                                    }}
                                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                                  >
                                    Disable
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={() => {
                                    setSelectedRetailer(r)
                                    setFormLimit('50000')
                                    setFormReason('Approved after verification of trade license and business volume')
                                    setToggleModalOpen(true)
                                  }}
                                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
                                >
                                  Enable Credit
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: BUSINESS CREDIT APPLICATIONS */}
      {/* ========================================================================= */}
      {mainTab === 'business_apps' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <input
                className="w-full sm:w-80 bg-white border border-gray-200 text-gray-900 text-sm rounded-2xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-violet-500 shadow-sm"
                placeholder="Search applications by retailer / business..."
                value={appSearchQ}
                onChange={(e) => setAppSearchQ(e.target.value)}
              />
              <select
                value={appStatusFilter}
                onChange={(e) => setAppStatusFilter(e.target.value)}
                className="bg-white border border-gray-200 text-gray-900 text-xs font-bold rounded-2xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-violet-500 shadow-sm"
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING_REVIEW">Pending Review</option>
                <option value="APPROVED">Approved</option>
                <option value="ACCEPTED">Offer Accepted (Ready for Disburse)</option>
                <option value="DISBURSED">Disbursed & Active</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>

            <button
              onClick={() => {
                setProactiveRetailerId(retailers[0]?._id || '')
                setProactiveModalOpen(true)
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-xs font-black uppercase tracking-wider rounded-2xl shadow-md shadow-violet-200 transition-all active:scale-95"
            >
              <span>+ Proactive Credit Grant</span>
            </button>
          </div>

          {/* Applications Table */}
          <div className="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead className="bg-gray-50/50 border-b border-gray-50 text-gray-400 font-black uppercase tracking-[0.2em] text-[10px]">
                  <tr>
                    <th className="px-6 py-4">App # & Retailer</th>
                    <th className="px-6 py-4">Requested Terms</th>
                    <th className="px-6 py-4">Approved Terms</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Submitted</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loadingApps ? (
                    <tr>
                      <td colSpan="6" className="text-center py-12 text-gray-400 font-semibold">Loading applications...</td>
                    </tr>
                  ) : businessApps.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-12 text-gray-400">No applications found</td>
                    </tr>
                  ) : (
                    businessApps.map((app) => {
                      const ret = app.retailerId || {}
                      return (
                        <tr key={app._id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-mono text-xs font-bold text-violet-600">{app.applicationNumber}</div>
                            <div className="font-bold text-gray-900 mt-0.5">{ret.name || 'Retailer'}</div>
                            <div className="text-xs text-gray-500">{ret.kyc?.businessName || ret.phone}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-bold text-gray-900">₹{(app.requestedAmount || 0).toLocaleString('en-IN')}</div>
                            <div className="text-xs text-gray-500">
                              {app.requestedTenureMonths} Months • {app.requestedFrequency}
                            </div>
                            <div className="text-[11px] text-gray-400 italic truncate max-w-xs">{app.purpose || 'Working capital'}</div>
                          </td>
                          <td className="px-6 py-4">
                            {(app.approvedOffer?.approvedAmount || app.approvedLimit) ? (
                              <>
                                <div className="font-black text-emerald-600">
                                  ₹{(app.approvedOffer?.approvedAmount || app.approvedLimit || 0).toLocaleString('en-IN')}
                                </div>
                                <div className="text-xs text-gray-600">
                                  {app.approvedOffer?.approvedTenureMonths || app.approvedTenureMonths}M @ {app.approvedOffer?.interestRatePerAnnum || app.annualInterestRatePercent || 18}% p.a.
                                </div>
                                <div className="text-[10px] text-gray-400 capitalize">
                                  {app.approvedOffer?.repaymentFrequency || app.approvedFrequency || 'WEEKLY'} instalments
                                </div>
                              </>
                            ) : (
                              <span className="text-xs text-gray-400 italic">Under Review</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {(() => {
                              const isUnderReview = ['SUBMITTED', 'UNDER_REVIEW', 'PENDING_REVIEW'].includes(app.status);
                              const isReadyToDisburse = ['OFFER_ACCEPTED', 'ACCEPTED', 'DISBURSEMENT_PENDING'].includes(app.status);
                              return (
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                  isUnderReview ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                  app.status === 'APPROVED' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                                  isReadyToDisburse ? 'bg-purple-50 text-purple-700 border border-purple-200 font-bold' :
                                  app.status === 'DISBURSED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                  app.status === 'REJECTED' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                                  'bg-slate-50 text-slate-700 border border-slate-200'
                                }`}>
                                  {isUnderReview ? 'Needs Review' :
                                   isReadyToDisburse ? 'Ready for Payout' :
                                   app.status === 'APPROVED' ? 'Sanctioned (Pending Acceptance)' :
                                   app.status}
                                </span>
                              );
                            })()}
                          </td>
                          <td className="px-6 py-4 text-xs text-gray-500">
                            {new Date(app.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </td>
                          <td className="px-6 py-4 text-right">
                            {(() => {
                              const isUnderReview = ['SUBMITTED', 'UNDER_REVIEW', 'PENDING_REVIEW'].includes(app.status);
                              const isReadyToDisburse = ['OFFER_ACCEPTED', 'ACCEPTED', 'DISBURSEMENT_PENDING'].includes(app.status);
                              return (
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedTimelineApp(app);
                                      setTimelineModalOpen(true);
                                    }}
                                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                                    title="View timestamped audit history"
                                  >
                                    <span>📜 Timeline</span>
                                  </button>
                                  {isUnderReview && (
                                    <button
                                      onClick={() => {
                                        setSelectedApp(app)
                                        setReviewLimit(String(app.approvedOffer?.approvedAmount || app.requestedAmount || ''))
                                        setReviewTenure(app.approvedOffer?.approvedTenureMonths || app.requestedTenureMonths || 3)
                                        setReviewFreq(app.approvedOffer?.repaymentFrequency || app.requestedFrequency || 'WEEKLY')
                                        setReviewRate(app.approvedOffer?.interestRatePerAnnum || app.annualInterestRatePercent || 18)
                                        setReviewFee(2)
                                        setReviewAction('APPROVE')
                                        setReviewReason('')
                                        setReviewRemarks('')
                                        setReviewModalOpen(true)
                                      }}
                                      className="px-3.5 py-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
                                    >
                                      Review
                                    </button>
                                  )}
                                  {isReadyToDisburse && (
                                    <button
                                      onClick={() => {
                                        setSelectedApp(app)
                                        setDisburseRef('')
                                        setDisburseRemarks('')
                                        setDisburseModalOpen(true)
                                      }}
                                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
                                    >
                                      Confirm Payout
                                    </button>
                                  )}
                                </div>
                              );
                            })()}
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: BUSINESS FACILITIES & REPAYMENT AMORTIZATION */}
      {/* ========================================================================= */}
      {mainTab === 'business_facilities' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <input
                className="w-full sm:w-80 bg-white border border-gray-200 text-gray-900 text-sm rounded-2xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
                placeholder="Search facility by number or retailer..."
                value={facSearchQ}
                onChange={(e) => setFacSearchQ(e.target.value)}
              />
              <select
                value={facStatusFilter}
                onChange={(e) => setFacStatusFilter(e.target.value)}
                className="bg-white border border-gray-200 text-gray-900 text-xs font-bold rounded-2xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
              >
                <option value="ALL">All Accounts</option>
                <option value="ACTIVE">Active Loans</option>
                <option value="OVERDUE">Overdue Accounts</option>
                <option value="CLOSED">Fully Closed</option>
              </select>
            </div>

            <button
              onClick={handleRunDailyAccrual}
              disabled={runningAccrual}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-black uppercase tracking-wider rounded-2xl shadow-md shadow-emerald-200 transition-all active:scale-95 disabled:opacity-50"
            >
              <svg className={`w-4 h-4 ${runningAccrual ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>{runningAccrual ? 'Calculating Accrual...' : 'Run Daily Accrual Now'}</span>
            </button>
          </div>

          {/* Facilities Table */}
          <div className="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead className="bg-gray-50/50 border-b border-gray-50 text-gray-400 font-black uppercase tracking-[0.2em] text-[10px]">
                  <tr>
                    <th className="px-6 py-4">Facility # & Borrower</th>
                    <th className="px-6 py-4">Disbursed (₹)</th>
                    <th className="px-6 py-4">Principal Bal (₹)</th>
                    <th className="px-6 py-4">Accrued Interest (₹)</th>
                    <th className="px-6 py-4">Total Payable (₹)</th>
                    <th className="px-6 py-4">Next Due Date</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loadingFacilities ? (
                    <tr>
                      <td colSpan="8" className="text-center py-12 text-gray-400 font-semibold">Loading facilities...</td>
                    </tr>
                  ) : businessFacilities.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center py-12 text-gray-400">No active facilities found</td>
                    </tr>
                  ) : (
                    businessFacilities.map((fac) => {
                      const ret = fac.retailerId || {}
                      return (
                        <tr key={fac._id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-mono text-xs font-black text-indigo-600">{fac.facilityNumber}</div>
                            <div className="font-bold text-gray-900 mt-0.5">{ret.name || 'Retailer'}</div>
                            <div className="text-xs text-gray-500">{ret.kyc?.businessName || ret.phone}</div>
                          </td>
                          <td className="px-6 py-4 font-bold text-gray-900">
                            ₹{(fac.disbursedAmount || 0).toLocaleString('en-IN')}
                            <div className="text-[10px] text-gray-400">{fac.tenureMonths}M @ {fac.annualInterestRatePercent}%</div>
                          </td>
                          <td className="px-6 py-4 font-black text-gray-800">
                            ₹{(fac.currentPrincipalBalance || 0).toLocaleString('en-IN')}
                          </td>
                          <td className="px-6 py-4 font-bold text-amber-600">
                            ₹{(fac.accruedInterestUnpaid || 0).toLocaleString('en-IN')}
                          </td>
                          <td className="px-6 py-4 font-black text-rose-600">
                            ₹{(fac.totalPayable || 0).toLocaleString('en-IN')}
                          </td>
                          <td className="px-6 py-4 text-xs font-semibold text-gray-700">
                            {fac.nextDueDate ? new Date(fac.nextDueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              fac.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                              fac.status === 'OVERDUE' ? 'bg-rose-50 text-rose-700 border border-rose-200 animate-pulse' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {fac.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  setSelectedFacility(fac)
                                  setScheduleModalOpen(true)
                                }}
                                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold transition-all"
                              >
                                Schedules ({fac.schedules?.length || 0})
                              </button>
                              {fac.status !== 'CLOSED' && (
                                <button
                                  onClick={() => {
                                    setSelectedFacility(fac)
                                    setFacRepayAmount('')
                                    setFacRepayRef('')
                                    setFacRepayNotes('')
                                    setFacRepayModalOpen(true)
                                  }}
                                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-bold transition-all"
                                >
                                  Reconcile
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: CREDIT BUREAU REPORTING (CIBIL / EQUIFAX) */}
      {/* ========================================================================= */}
      {mainTab === 'bureau_report' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-gray-900">Commercial Credit Bureau Feed</h2>
              <p className="text-xs text-gray-500 mt-0.5">Automated asset classification & DPD tracking compliant with RBI norms</p>
            </div>
            <button
              onClick={handleExportBureauJSON}
              disabled={!bureauData || bureauData.records?.length === 0}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 hover:bg-black text-white text-xs font-black uppercase tracking-wider rounded-2xl shadow-md transition-all disabled:opacity-50 active:scale-95"
            >
              <span>Download CIBIL JSON Extract 📥</span>
            </button>
          </div>

          {/* Bureau Summary Cards */}
          {bureauData?.summary && (
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
                <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Standard Accounts (STD)</div>
                <div className="text-2xl font-black text-gray-900 mt-2">{bureauData.summary.standardAccounts}</div>
                <div className="text-[11px] text-gray-500 mt-1">0 - 30 DPD (Healthy)</div>
              </div>
              <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
                <div className="text-xs font-bold text-amber-500 uppercase tracking-wider">Special Mention (SMA)</div>
                <div className="text-2xl font-black text-amber-600 mt-2">{bureauData.summary.smaAccounts}</div>
                <div className="text-[11px] text-gray-500 mt-1">31 - 90 DPD (Early stress)</div>
              </div>
              <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
                <div className="text-xs font-bold text-rose-500 uppercase tracking-wider">NPA Accounts (SUB)</div>
                <div className="text-2xl font-black text-rose-600 mt-2">{bureauData.summary.npaAccounts}</div>
                <div className="text-[11px] text-gray-500 mt-1">&gt; 90 DPD (Defaulted)</div>
              </div>
              <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
                <div className="text-xs font-bold text-blue-500 uppercase tracking-wider">Total Portfolio Exposure</div>
                <div className="text-2xl font-black text-blue-600 mt-2">₹{(bureauData.summary.totalOutstanding || 0).toLocaleString('en-IN')}</div>
                <div className="text-[11px] text-gray-500 mt-1">Across all facilities</div>
              </div>
            </div>
          )}

          {/* Bureau Records Table */}
          <div className="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead className="bg-gray-50/50 border-b border-gray-50 text-gray-400 font-black uppercase tracking-[0.2em] text-[10px]">
                  <tr>
                    <th className="px-6 py-4">Borrower Entity</th>
                    <th className="px-6 py-4">Tax IDs (PAN / GSTIN)</th>
                    <th className="px-6 py-4">Facility #</th>
                    <th className="px-6 py-4">Sanctioned (₹)</th>
                    <th className="px-6 py-4">Current Outstanding (₹)</th>
                    <th className="px-6 py-4">DPD</th>
                    <th className="px-6 py-4">Classification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loadingBureau ? (
                    <tr>
                      <td colSpan="7" className="text-center py-12 text-gray-400 font-semibold">Generating Bureau extract...</td>
                    </tr>
                  ) : !bureauData || bureauData.records?.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-12 text-gray-400">No loan records available for bureau reporting</td>
                    </tr>
                  ) : (
                    bureauData.records.map((r, i) => (
                      <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-gray-900">{r.borrower.entityName}</div>
                          <div className="text-xs text-gray-500">Contact: {r.borrower.keyPersonName} • {r.borrower.phone}</div>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-gray-700">
                          <div>PAN: {r.borrower.pan || '—'}</div>
                          <div>GSTIN: {r.borrower.gstin || '—'}</div>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs font-bold text-indigo-600">
                          {r.account.facilityNumber}
                        </td>
                        <td className="px-6 py-4 font-bold text-gray-900">
                          ₹{(r.account.sanctionedAmount || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="px-6 py-4 font-black text-rose-600">
                          ₹{(r.performance.currentOutstandingTotal || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="px-6 py-4 font-black text-gray-900">
                          {r.performance.daysPastDue} DPD
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            r.performance.assetClassification === 'STD' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            r.performance.assetClassification.startsWith('SMA') ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                            'bg-rose-50 text-rose-700 border border-rose-200 font-black'
                          }`}>
                            {r.performance.assetClassification}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: PRODUCT SETTINGS */}
      {/* ========================================================================= */}
      {mainTab === 'product_settings' && (
        <div className="max-w-2xl bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm space-y-6">
          <div>
            <h2 className="text-xl font-black text-gray-900">Business Credit Product Configuration</h2>
            <p className="text-xs text-gray-500 mt-1">Configure parameters, interest engine bounds, and tenure limits</p>
          </div>

          <form onSubmit={handleSaveProductSettings} className="space-y-5">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <div>
                <div className="text-sm font-black text-gray-900">Business Credit Facility Active</div>
                <div className="text-xs text-gray-500">Allow verified retailers to apply for short-term working capital</div>
              </div>
              <input
                type="checkbox"
                checked={productSettings.isProductEnabled}
                onChange={(e) => setProductSettings(p => ({ ...p, isProductEnabled: e.target.checked }))}
                className="w-5 h-5 rounded accent-violet-600 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <div>
                <div className="text-sm font-black text-gray-900">AutoPay Recurring e-Mandates</div>
                <div className="text-xs text-gray-500">Allow retailers to register automated Razorpay e-Mandates / UPI AutoPay for collections</div>
              </div>
              <input
                type="checkbox"
                checked={Boolean(productSettings.autoPayEnabled)}
                onChange={(e) => setProductSettings(p => ({ ...p, autoPayEnabled: e.target.checked }))}
                className="w-5 h-5 rounded accent-violet-600 cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Default Annual Interest Rate (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="5"
                  max="60"
                  required
                  value={productSettings.defaultAnnualInterestRatePercent}
                  onChange={(e) => setProductSettings(p => ({ ...p, defaultAnnualInterestRatePercent: e.target.value }))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-violet-500"
                />
                <span className="text-[10px] text-gray-400 mt-1 block">Accrued daily on reducing balance</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Default Initial Tenure (Months)
                </label>
                <select
                  value={productSettings.defaultTenureMonths}
                  onChange={(e) => setProductSettings(p => ({ ...p, defaultTenureMonths: Number(e.target.value) }))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-violet-500"
                >
                  {(productSettings.permittedTenures && productSettings.permittedTenures.length > 0
                    ? productSettings.permittedTenures
                    : [1, 2, 3, 4, 5]
                  ).map((m) => (
                    <option key={m} value={m}>{m} Month{m > 1 ? 's' : ''}</option>
                  ))}
                </select>
                <span className="text-[10px] text-slate-500 font-bold mt-1 block">
                  Active range: {Math.min(...(productSettings.permittedTenures || [1]))}M to {Math.max(...(productSettings.permittedTenures || [12]))}M
                </span>
              </div>
            </div>

            {/* 1 to 12 Month Permitted Tenures Grid */}
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Permitted Loan Tenures (1 to 12 Months)
                  </div>
                  <div className="text-[11px] text-gray-500">
                    Click any month to enable or disable it. Only active months will be selectable across retailer application and admin sanctioning.
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-black bg-violet-100 text-violet-700 border border-violet-200">
                  {(productSettings.permittedTenures || [1, 2, 3, 4, 5]).length} Active
                </span>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-2 pt-1">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((month) => {
                  const currentTenures = productSettings.permittedTenures && productSettings.permittedTenures.length > 0
                    ? productSettings.permittedTenures
                    : [1, 2, 3, 4, 5];
                  const isEnabled = currentTenures.includes(month);
                  return (
                    <button
                      key={month}
                      type="button"
                      onClick={() => {
                        let updated;
                        if (isEnabled) {
                          if (currentTenures.length <= 1) {
                            return notify('At least one tenure month must remain active', 'error');
                          }
                          updated = currentTenures.filter(m => m !== month);
                        } else {
                          updated = [...currentTenures, month].sort((a, b) => a - b);
                        }
                        const newDef = updated.includes(productSettings.defaultTenureMonths)
                          ? productSettings.defaultTenureMonths
                          : updated[0];
                        setProductSettings(prev => ({
                          ...prev,
                          permittedTenures: updated,
                          defaultTenureMonths: newDef,
                          minTenureMonths: Math.min(...updated),
                          maxTenureMonths: Math.max(...updated)
                        }));
                      }}
                      className={`p-2.5 rounded-xl font-black text-xs transition-all border flex flex-col items-center justify-center gap-1 cursor-pointer ${
                        isEnabled
                          ? 'bg-violet-600 text-white border-violet-600 shadow-sm shadow-violet-200'
                          : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300 hover:text-gray-600'
                      }`}
                    >
                      <span className="text-sm font-black">{month}M</span>
                      <span className="text-[9px] font-semibold opacity-90">
                        {isEnabled ? '✓ Active' : 'Disabled'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Processing Fee (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  required
                  value={productSettings.processingFeePercent}
                  onChange={(e) => setProductSettings(p => ({ ...p, processingFeePercent: e.target.value }))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-violet-500"
                />
                <span className="text-[10px] text-gray-400 mt-1 block">Deducted upfront + 18% GST</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Max Credit Limit per Retailer (₹)
                </label>
                <input
                  type="number"
                  step="10000"
                  min="50000"
                  max="5000000"
                  required
                  value={productSettings.maxCreditLimit}
                  onChange={(e) => setProductSettings(p => ({ ...p, maxCreditLimit: e.target.value }))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
            </div>

            {/* Trade Credit Default Auto-Debit Schedule */}
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200/80 space-y-3">
              <div>
                <div className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                  <span>🗓️</span>
                  <span>Trade Credit Default Auto-Debit Schedule</span>
                </div>
                <div className="text-[11px] text-gray-500 mt-0.5">
                  Default auto-debit frequency and schedule applied when trade credit is enabled for retailers. Retailers will be notified of exact balance requirements before debits.
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Frequency
                  </label>
                  <select
                    value={productSettings.tradeCreditDefaultSchedule?.frequency || 'WEEKLY'}
                    onChange={(e) => setProductSettings(p => ({
                      ...p,
                      tradeCreditDefaultSchedule: {
                        ...(p.tradeCreditDefaultSchedule || {}),
                        frequency: e.target.value
                      }
                    }))}
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    <option value="WEEKLY">Weekly (Recommended)</option>
                    <option value="DAILY">Daily</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Debit Day {productSettings.tradeCreditDefaultSchedule?.frequency === 'DAILY' ? '(N/A for Daily)' : ''}
                  </label>
                  <select
                    disabled={productSettings.tradeCreditDefaultSchedule?.frequency === 'DAILY'}
                    value={productSettings.tradeCreditDefaultSchedule?.weeklyDebitDay || 'MONDAY'}
                    onChange={(e) => setProductSettings(p => ({
                      ...p,
                      tradeCreditDefaultSchedule: {
                        ...(p.tradeCreditDefaultSchedule || {}),
                        weeklyDebitDay: e.target.value
                      }
                    }))}
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-violet-500 disabled:opacity-50"
                  >
                    {['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'].map(day => (
                      <option key={day} value={day}>{day.charAt(0) + day.slice(1).toLowerCase()}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Debit Time
                  </label>
                  <input
                    type="text"
                    placeholder="10:00 AM"
                    value={productSettings.tradeCreditDefaultSchedule?.debitTime || '10:00 AM'}
                    onChange={(e) => setProductSettings(p => ({
                      ...p,
                      tradeCreditDefaultSchedule: {
                        ...(p.tradeCreditDefaultSchedule || {}),
                        debitTime: e.target.value
                      }
                    }))}
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                disabled={savingSettings}
                className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md shadow-violet-200 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {savingSettings ? 'Saving Configuration...' : 'Save Product Settings'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALS */}
      {/* ========================================================================= */}

      {/* MODAL: Review Business Credit Application */}
      {reviewModalOpen && selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-gray-100 space-y-5 my-8">
            <h3 className="text-xl font-black text-gray-900">Review Application #{selectedApp.applicationNumber}</h3>
            <p className="text-xs text-gray-500">
              Retailer: <span className="font-bold text-gray-800">{selectedApp.retailerId?.name}</span> ({selectedApp.retailerId?.phone})
            </p>

            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-1 text-xs">
              <div>Requested: <strong>₹{(selectedApp.requestedAmount || 0).toLocaleString('en-IN')}</strong> over <strong>{selectedApp.requestedTenureMonths} Months</strong> ({selectedApp.requestedFrequency})</div>
              <div>Purpose: <span className="italic">{selectedApp.purpose}</span></div>
            </div>

            <form onSubmit={handleReviewApplication} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Decision Action</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'APPROVE', label: 'Approve', color: 'text-emerald-700 bg-emerald-50 border-emerald-300' },
                    { id: 'PARTIAL_APPROVE', label: 'Partial Offer', color: 'text-blue-700 bg-blue-50 border-blue-300' },
                    { id: 'REJECT', label: 'Reject', color: 'text-rose-700 bg-rose-50 border-rose-300' }
                  ].map(act => (
                    <button
                      key={act.id}
                      type="button"
                      onClick={() => setReviewAction(act.id)}
                      className={`py-2 text-xs font-black rounded-xl border transition-all ${reviewAction === act.id ? act.color : 'bg-white text-gray-500 border-gray-200'}`}
                    >
                      {act.label}
                    </button>
                  ))}
                </div>
              </div>

              {reviewAction !== 'REJECT' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Sanction Limit (₹)</label>
                      <input
                        type="number"
                        step="5000"
                        min="10000"
                        required
                        value={reviewLimit}
                        onChange={(e) => setReviewLimit(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Tenure (Months)</label>
                      <select
                        value={reviewTenure}
                        onChange={(e) => setReviewTenure(Number(e.target.value))}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold"
                      >
                        {(productSettings.permittedTenures && productSettings.permittedTenures.length > 0
                          ? productSettings.permittedTenures
                          : [1, 2, 3, 4, 5]
                        ).map((m) => (
                          <option key={m} value={m}>{m} Month{m > 1 ? 's' : ''}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Interest Rate (% p.a.)</label>
                      <input
                        type="number"
                        step="0.5"
                        min="10"
                        max="36"
                        required
                        value={reviewRate}
                        onChange={(e) => setReviewRate(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Repayment Frequency</label>
                      <select
                        value={reviewFreq}
                        onChange={(e) => setReviewFreq(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold"
                      >
                        <option value="WEEKLY">Weekly Instalments</option>
                        <option value="DAILY">Daily Instalments</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              {reviewAction === 'REJECT' && (
                <div>
                  <label className="block text-xs font-bold text-rose-700 uppercase tracking-wider mb-1">Rejection Reason</label>
                  <textarea
                    required
                    rows="2"
                    value={reviewReason}
                    onChange={(e) => setReviewReason(e.target.value)}
                    placeholder="Enter reason for rejecting the credit application..."
                    className="w-full bg-rose-50 border border-rose-200 rounded-xl p-3 text-sm text-gray-900 outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Admin Remarks</label>
                <input
                  type="text"
                  value={reviewRemarks}
                  onChange={(e) => setReviewRemarks(e.target.value)}
                  placeholder="Notes for internal record..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setReviewModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2.5 text-xs font-black uppercase tracking-wider text-white bg-violet-600 hover:bg-violet-700 rounded-xl shadow-md transition-all disabled:opacity-50"
                >
                  {actionLoading ? 'Submitting...' : 'Submit Decision'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Proactive Credit Grant */}
      {proactiveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-gray-100 space-y-5 my-8">
            <h3 className="text-xl font-black text-gray-900">Grant Proactive Credit Line</h3>
            <p className="text-xs text-gray-500">
              Grant a pre-approved business credit facility directly to an eligible verified partner.
            </p>

            <form onSubmit={handleProactiveGrant} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Select Retailer</label>
                <select
                  required
                  value={proactiveRetailerId}
                  onChange={(e) => setProactiveRetailerId(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-bold text-gray-900"
                >
                  <option value="">-- Choose Retailer --</option>
                  {retailers.map(r => (
                    <option key={r._id} value={r._id}>
                      {r.name} ({r.kyc?.businessName || r.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Sanctioned Limit (₹)</label>
                  <input
                    type="number"
                    step="5000"
                    min="10000"
                    required
                    value={proactiveLimit}
                    onChange={(e) => setProactiveLimit(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Tenure (Months)</label>
                  <select
                    value={proactiveTenure}
                    onChange={(e) => setProactiveTenure(Number(e.target.value))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold"
                  >
                    {(productSettings.permittedTenures && productSettings.permittedTenures.length > 0
                      ? productSettings.permittedTenures
                      : [1, 2, 3, 4, 5]
                    ).map((m) => (
                      <option key={m} value={m}>{m} Month{m > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Interest Rate (% p.a.)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="10"
                    max="36"
                    required
                    value={proactiveRate}
                    onChange={(e) => setProactiveRate(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Repayment Frequency</label>
                  <select
                    value={proactiveFreq}
                    onChange={(e) => setProactiveFreq(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold"
                  >
                    <option value="WEEKLY">Weekly</option>
                    <option value="DAILY">Daily</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Purpose / Facility Tag</label>
                <input
                  type="text"
                  value={proactivePurpose}
                  onChange={(e) => setProactivePurpose(e.target.value)}
                  placeholder="e.g. Bulk Procurement Financing"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setProactiveModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2.5 text-xs font-black uppercase tracking-wider text-white bg-violet-600 hover:bg-violet-700 rounded-xl shadow-md transition-all disabled:opacity-50"
                >
                  {actionLoading ? 'Granting...' : 'Grant Proactive Credit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Confirm Disbursement */}
      {disburseModalOpen && selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-100 space-y-4">
            <h3 className="text-xl font-black text-gray-900">Confirm Loan Payout</h3>
            <p className="text-xs text-gray-500">
              Retailer accepted terms. Record bank transaction reference to activate the facility.
            </p>

            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Sanctioned Limit:</span>
                <strong>₹{(selectedApp.approvedLimit || selectedApp.approvedOffer?.approvedAmount || selectedApp.requestedAmount || 0).toLocaleString('en-IN')}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tenure:</span>
                <strong>{selectedApp.approvedTenureMonths || selectedApp.approvedOffer?.approvedTenureMonths} Months ({selectedApp.approvedFrequency || selectedApp.approvedOffer?.repaymentFrequency || 'WEEKLY'})</strong>
              </div>
              <div className="flex justify-between pt-1 border-t border-emerald-200/60 font-bold text-emerald-900">
                <span>Net Payout Amount:</span>
                <span className="text-sm font-black text-emerald-700">
                  ₹{(selectedApp.approvedOffer?.netDisbursementAmount || Math.round((selectedApp.approvedLimit || selectedApp.requestedAmount || 0) * (1 - 0.02 * 1.18))).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Destination Bank Account Details */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1.5">
              <div className="font-bold text-slate-800 flex items-center justify-between pb-1 border-b border-slate-200/60">
                <span>Disbursement Destination Account:</span>
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100/60 px-2 py-0.5 rounded-full">
                  Retailer Bank Details
                </span>
              </div>
              <div>Account Holder: <strong>{selectedApp.businessDetails?.bankDetails?.accountHolder || selectedApp.retailerId?.name || 'Retailer'}</strong></div>
              <div>Bank Name: <strong>{selectedApp.businessDetails?.bankDetails?.bankName || 'Not specified'}</strong></div>
              <div className="font-mono">Account No: <strong>{selectedApp.businessDetails?.bankDetails?.accountNumber || 'Pending verification'}</strong></div>
              <div className="font-mono">IFSC Code: <strong>{selectedApp.businessDetails?.bankDetails?.ifsc || 'N/A'}</strong></div>
            </div>

            <form onSubmit={handleConfirmDisbursement} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Disbursement Mode</label>
                <select
                  value={disburseMode}
                  onChange={(e) => setDisburseMode(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold"
                >
                  <option value="NEFT">NEFT Bank Transfer</option>
                  <option value="RTGS">RTGS Bank Transfer</option>
                  <option value="IMPS">IMPS Instant Transfer</option>
                  <option value="CHEQUE">Company Cheque</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Bank Transfer Reference / UTR (Required)
                </label>
                <input
                  type="text"
                  required
                  value={disburseRef}
                  onChange={(e) => setDisburseRef(e.target.value)}
                  placeholder="Enter Bank UTR or Transaction Ref"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Remarks</label>
                <input
                  type="text"
                  value={disburseRemarks}
                  onChange={(e) => setDisburseRemarks(e.target.value)}
                  placeholder="e.g. Transferred via HDFC Bank"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setDisburseModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2.5 text-xs font-black uppercase tracking-wider text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition-all disabled:opacity-50"
                >
                  {actionLoading ? 'Activating...' : 'Confirm & Activate Facility'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Facility Repayment Schedules */}
      {scheduleModalOpen && selectedFacility && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 max-w-3xl w-full shadow-2xl border border-gray-100 space-y-5 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-xl font-black text-gray-900">Amortization Schedule — {selectedFacility.facilityNumber}</h3>
                <p className="text-xs text-gray-500">
                  Total Payable: ₹{(selectedFacility.totalPayable || 0).toLocaleString('en-IN')} • Frequency: {selectedFacility.repaymentFrequency}
                </p>
              </div>
              <button
                onClick={() => setScheduleModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full text-gray-400"
              >
                ✕
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-gray-50 border-b border-gray-100 text-gray-400 uppercase font-black tracking-wider text-[9px] sticky top-0">
                  <tr>
                    <th className="px-4 py-3">#</th>
                    <th className="px-4 py-3">Due Date</th>
                    <th className="px-4 py-3">Principal (₹)</th>
                    <th className="px-4 py-3">Interest (₹)</th>
                    <th className="px-4 py-3">Total (₹)</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {selectedFacility.schedules?.map((s) => (
                    <tr key={s._id} className="hover:bg-gray-50">
                      <td className="px-4 py-2.5 font-bold text-gray-900">{s.instalmentNumber}</td>
                      <td className="px-4 py-2.5 font-semibold text-gray-700">
                        {new Date(s.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-2.5 font-mono text-gray-800">₹{(s.principalDue || 0).toLocaleString('en-IN')}</td>
                      <td className="px-4 py-2.5 font-mono text-amber-600">₹{(s.interestDue || 0).toLocaleString('en-IN')}</td>
                      <td className="px-4 py-2.5 font-mono font-black text-gray-900">
                        ₹{((s.principalDue || 0) + (s.interestDue || 0) + (s.feeDue || 0)).toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-2.5">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                          s.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' :
                          s.status === 'OVERDUE' ? 'bg-rose-100 text-rose-800' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {s.status}
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
                onClick={() => setScheduleModalOpen(false)}
                className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Reconcile Offline Facility Repayment */}
      {facRepayModalOpen && selectedFacility && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-100 space-y-4">
            <h3 className="text-xl font-black text-gray-900">Record Offline Repayment</h3>
            <p className="text-xs text-gray-500">
              Facility: <span className="font-mono font-bold text-gray-800">{selectedFacility.facilityNumber}</span> • Remaining Total Payable: ₹{(selectedFacility.totalPayable || 0).toLocaleString('en-IN')}
            </p>

            <form onSubmit={handleReconcileFacilityRepayment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Repayment Amount (₹)</label>
                <input
                  type="number"
                  min="1"
                  step="50"
                  required
                  value={facRepayAmount}
                  onChange={(e) => setFacRepayAmount(e.target.value)}
                  placeholder="Enter amount received"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Payment Mode</label>
                <select
                  value={facRepayMode}
                  onChange={(e) => setFacRepayMode(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold"
                >
                  <option value="BANK_TRANSFER">Bank Transfer (NEFT/RTGS/IMPS)</option>
                  <option value="UPI">UPI Payment</option>
                  <option value="CHEQUE">Cheque Clearance</option>
                  <option value="CASH">Cash Collection</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">UTR / Transaction Reference</label>
                <input
                  type="text"
                  value={facRepayRef}
                  onChange={(e) => setFacRepayRef(e.target.value)}
                  placeholder="Enter bank reference number"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Notes</label>
                <input
                  type="text"
                  value={facRepayNotes}
                  onChange={(e) => setFacRepayNotes(e.target.value)}
                  placeholder="e.g. Received in current account"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setFacRepayModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2.5 text-xs font-black uppercase tracking-wider text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition-all disabled:opacity-50"
                >
                  {actionLoading ? 'Recording...' : 'Apply Repayment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Toggle Credit Status (Existing) */}
      {toggleModalOpen && selectedRetailer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-100 space-y-5">
            <h3 className="text-xl font-black text-gray-900">
              {selectedRetailer.isCreditEnabled ? 'Disable Credit Facility' : 'Enable Credit Facility'}
            </h3>
            <p className="text-xs text-gray-500">
              Retailer: <span className="font-bold text-gray-800">{selectedRetailer.name}</span> ({selectedRetailer.phone})
            </p>

            <form onSubmit={handleToggleCredit} className="space-y-4">
              {!selectedRetailer.isCreditEnabled && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Initial Credit Limit (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={formLimit}
                    onChange={(e) => setFormLimit(e.target.value)}
                    placeholder="e.g. 50000"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Audit Reason (Required)
                </label>
                <textarea
                  required
                  rows="3"
                  value={formReason}
                  onChange={(e) => setFormReason(e.target.value)}
                  placeholder="Reason for enabling/disabling credit..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setToggleModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className={`px-5 py-2.5 text-xs font-black uppercase tracking-wider text-white rounded-xl shadow-md transition-all ${
                    selectedRetailer.isCreditEnabled ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  {actionLoading ? 'Updating...' : selectedRetailer.isCreditEnabled ? 'Disable Credit' : 'Enable Credit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Manual Credit Adjustment (Existing) */}
      {adjustModalOpen && selectedRetailer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-100 space-y-5">
            <h3 className="text-xl font-black text-gray-900">Manual Credit Adjustment</h3>
            <p className="text-xs text-gray-500">
              Retailer: <span className="font-bold text-gray-800">{selectedRetailer.name}</span> • Available: ₹{(selectedRetailer.availableCredit || 0).toLocaleString('en-IN')}
            </p>

            <form onSubmit={handleAdjustCredit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Adjustment Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFormAdjustType('INCREASE')
                      setFormReason('Credit limit enhancement based on consistent repayment history')
                    }}
                    className={`py-2 text-xs font-black rounded-xl border transition-all ${
                      formAdjustType === 'INCREASE'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                        : 'bg-white text-gray-500 border-gray-200'
                    }`}
                  >
                    + Increase Credit
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFormAdjustType('DECREASE')
                      setFormReason('Periodic risk management limit reduction')
                    }}
                    className={`py-2 text-xs font-black rounded-xl border transition-all ${
                      formAdjustType === 'DECREASE'
                        ? 'bg-rose-50 text-rose-700 border-rose-300'
                        : 'bg-white text-gray-500 border-gray-200'
                    }`}
                  >
                    - Decrease Credit
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  min="1"
                  step="100"
                  required
                  value={formAdjustAmount}
                  onChange={(e) => setFormAdjustAmount(e.target.value)}
                  placeholder="Enter amount to adjust"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Audit Reason (Required)
                </label>
                <textarea
                  required
                  rows="2"
                  value={formReason}
                  onChange={(e) => setFormReason(e.target.value)}
                  placeholder="Reason for adjustment..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setAdjustModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2.5 text-xs font-black uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-all"
                >
                  {actionLoading ? 'Saving...' : 'Apply Adjustment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Ledger History (Existing) */}
      {ledgerModalOpen && selectedRetailer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 max-w-4xl w-full shadow-2xl border border-gray-100 space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-xl font-black text-gray-900">Credit Ledger — {selectedRetailer.name}</h3>
                <p className="text-xs text-gray-500">
                  Approved Limit: ₹{(selectedRetailer.creditLimit || 0).toLocaleString('en-IN')} • Outstanding: ₹{(selectedRetailer.outstandingBalance || 0).toLocaleString('en-IN')}
                </p>
              </div>
              <button
                onClick={() => setLedgerModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full text-gray-400"
              >
                ✕
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-gray-50 border-b border-gray-100 text-gray-400 uppercase font-black tracking-wider text-[9px] sticky top-0">
                  <tr>
                    <th className="px-4 py-3">Timestamp</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Amount (₹)</th>
                    <th className="px-4 py-3">Available Balance</th>
                    <th className="px-4 py-3">Notes / Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {ledgerHistory.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-8 text-gray-400">No transaction entries found</td>
                    </tr>
                  ) : (
                    ledgerHistory.map((entry) => (
                      <tr key={entry._id} className="hover:bg-gray-50">
                        <td className="px-4 py-2.5 text-gray-500 whitespace-nowrap">
                          {new Date(entry.createdAt).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className="px-4 py-2.5 font-bold text-gray-800">{entry.type}</td>
                        <td className="px-4 py-2.5 font-black text-gray-900">₹{(entry.amount || 0).toLocaleString('en-IN')}</td>
                        <td className="px-4 py-2.5 font-mono text-emerald-600">₹{(entry.balanceAfter || 0).toLocaleString('en-IN')}</td>
                        <td className="px-4 py-2.5 text-gray-500 max-w-xs truncate">{entry.description || entry.reason || '—'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setLedgerModalOpen(false)}
                className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Retailer Quick Detail Modal (Existing) */}
      {quickDetailOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-gray-100 overflow-hidden my-8">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-gray-900">Retailer Detail</h3>
                <p className="text-xs text-gray-500">Official business profile & credit parameters</p>
              </div>
              <button onClick={() => setQuickDetailOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400">✕</button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {loadingQuickDetail ? (
                <div className="py-12 text-center text-gray-400">Loading details...</div>
              ) : quickDetailRetailer ? (
                (() => {
                  const u = quickDetailRetailer.user || quickDetailRetailer
                  const kyc = u.kyc || {}
                  return (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="p-3 bg-gray-50 rounded-xl">
                          <span className="text-gray-400 font-bold uppercase block text-[10px]">Name</span>
                          <span className="font-bold text-gray-900">{u.name}</span>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-xl">
                          <span className="text-gray-400 font-bold uppercase block text-[10px]">Phone</span>
                          <span className="font-bold text-gray-900">{u.phone}</span>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-xl">
                          <span className="text-gray-400 font-bold uppercase block text-[10px]">Business Name</span>
                          <span className="font-bold text-gray-900">{kyc.businessName || '—'}</span>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-xl">
                          <span className="text-gray-400 font-bold uppercase block text-[10px]">GSTIN</span>
                          <span className="font-mono font-bold text-gray-900">{kyc.gstin || '—'}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div className="p-3 bg-blue-50/60 rounded-xl text-center">
                          <div className="text-[10px] font-bold text-blue-600 uppercase">Limit</div>
                          <div className="text-base font-black text-blue-700 mt-1">₹{(u.creditLimit || 0).toLocaleString('en-IN')}</div>
                        </div>
                        <div className="p-3 bg-emerald-50/60 rounded-xl text-center">
                          <div className="text-[10px] font-bold text-emerald-600 uppercase">Available</div>
                          <div className="text-base font-black text-emerald-700 mt-1">₹{(u.availableCredit || 0).toLocaleString('en-IN')}</div>
                        </div>
                        <div className="p-3 bg-rose-50/60 rounded-xl text-center">
                          <div className="text-[10px] font-bold text-rose-600 uppercase">Outstanding</div>
                          <div className="text-base font-black text-rose-700 mt-1">₹{(u.outstandingBalance || 0).toLocaleString('en-IN')}</div>
                        </div>
                      </div>
                    </div>
                  )
                })()
              ) : null}
            </div>

            <div className="p-4 bg-gray-50 flex justify-end">
              <button
                type="button"
                onClick={() => setQuickDetailOpen(false)}
                className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-bold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Notify Outstanding Retailers (Existing) */}
      {notifyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-100 space-y-4">
            <h3 className="text-lg font-black text-gray-900">Notify Outstanding Retailers</h3>
            <p className="text-xs text-gray-500">
              Email statements & payment reminders to all retailers with outstanding trade credit dues.
            </p>

            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-1">
              <div>Total Outstanding: <strong>₹{(stats.totalOutstanding || 0).toLocaleString('en-IN')}</strong></div>
              <div>Recipients: <strong>{stats.enabledCount} credit retailers</strong></div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setNotifyModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleNotifyOutstanding}
                disabled={notifying}
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md transition-all disabled:opacity-50"
              >
                {notifying ? 'Sending Reminders...' : 'Send Reminders'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Application Activity & Audit Timeline */}
      {timelineModalOpen && selectedTimelineApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 max-w-xl w-full shadow-2xl border border-gray-100 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-gray-900">Application Audit Trail & Timeline</h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-violet-50 text-violet-700 border border-violet-200">
                    {selectedTimelineApp.applicationNumber}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  Retailer: <strong className="text-gray-800">{selectedTimelineApp.retailerId?.name || selectedTimelineApp.retailerId?.phone || 'Retailer'}</strong> • Status: <strong>{selectedTimelineApp.status}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setTimelineModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Event Timeline */}
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              {(() => {
                const events = (selectedTimelineApp.timeline && selectedTimelineApp.timeline.length > 0)
                  ? selectedTimelineApp.timeline
                  : [
                      {
                        status: selectedTimelineApp.status,
                        title: 'Application Created',
                        description: `Requested ₹${(selectedTimelineApp.requestedAmount || 0).toLocaleString('en-IN')} for ${selectedTimelineApp.requestedTenureMonths || 3} months.`,
                        timestamp: selectedTimelineApp.createdAt,
                        performedBy: selectedTimelineApp.isProactiveGrant ? 'Admin' : 'Retailer'
                      },
                      ...(selectedTimelineApp.reviewedAt ? [{
                        status: selectedTimelineApp.status,
                        title: `Reviewed by ${selectedTimelineApp.reviewedByName || 'Admin'}`,
                        description: selectedTimelineApp.adminNotes || selectedTimelineApp.rejectionReason || 'Review decision recorded.',
                        timestamp: selectedTimelineApp.reviewedAt,
                        performedBy: selectedTimelineApp.reviewedByName || 'Admin'
                      }] : []),
                      ...(selectedTimelineApp.approvedOffer?.offerAcceptedAt ? [{
                        status: 'OFFER_ACCEPTED',
                        title: 'Offer Accepted by Retailer',
                        description: 'Agreement digitally confirmed and signed.',
                        timestamp: selectedTimelineApp.approvedOffer.offerAcceptedAt,
                        performedBy: 'Retailer'
                      }] : [])
                    ];

                return (
                  <div className="relative border-l-2 border-violet-100 ml-4 space-y-6 py-2">
                    {events.map((evt, idx) => (
                      <div key={idx} className="relative pl-6 group">
                        <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white border-2 border-violet-600 flex items-center justify-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-violet-600" />
                        </div>
                        <div className="bg-gray-50 rounded-2xl p-3.5 border border-gray-100 space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-gray-900">{evt.title}</span>
                            <span className="text-[10px] text-gray-400 font-mono">
                              {evt.timestamp ? new Date(evt.timestamp).toLocaleString('en-IN', {
                                day: '2-digit', month: 'short', year: 'numeric',
                                hour: '2-digit', minute: '2-digit', hour12: true
                              }) : '—'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 leading-relaxed">
                            {evt.description}
                          </p>
                          <div className="flex items-center gap-2 pt-1 text-[10px] text-gray-400">
                            <span>Actor: <strong className="text-gray-600">{evt.performedBy || 'System'}</strong></span>
                            {evt.status && (
                              <span className="px-1.5 py-0.5 rounded bg-white border border-gray-200 text-gray-600 font-semibold">
                                {evt.status}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            <div className="pt-2 text-right">
              <button
                type="button"
                onClick={() => setTimelineModalOpen(false)}
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-all"
              >
                Close Audit Log
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Configure Trade Credit AutoPay Schedule */}
      {tradeAutoPayModalOpen && selectedTradeAutoPayRetailer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-gray-100 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-gray-900">Trade Credit AutoPay Schedule</h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-violet-50 text-violet-700 border border-violet-200">
                    Auto-Debit Policy
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  Retailer: <strong className="text-gray-800">{selectedTradeAutoPayRetailer.name}</strong> • {selectedTradeAutoPayRetailer.phone}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setTradeAutoPayModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Account Status Card */}
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-gray-500 font-medium">AutoPay e-Mandate Status:</span>
                {selectedTradeAutoPayRetailer.autoPayMandate?.status === 'ACTIVE' ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Mandate Active</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                    Mandate Pending Retailer Activation
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 font-medium">Current Outstanding Balance:</span>
                <span className="font-black text-rose-600">
                  ₹{(selectedTradeAutoPayRetailer.outstandingBalance || 0).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 font-medium">Credit Limit:</span>
                <span className="font-bold text-gray-900">
                  ₹{(selectedTradeAutoPayRetailer.creditLimit || 0).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveTradeAutoPaySchedule} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Debit Recurrence Frequency
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setTradeAutoPayFrequency('WEEKLY')}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      tradeAutoPayFrequency === 'WEEKLY'
                        ? 'border-violet-600 bg-violet-50/60 ring-2 ring-violet-500'
                        : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div className="text-xs font-black text-gray-900 flex items-center gap-1.5">
                      <span>🗓️ Weekly</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-violet-100 text-violet-700 font-bold">Standard</span>
                    </div>
                    <div className="text-[11px] text-gray-500 mt-1">
                      Auto-debit once every week on a specific day
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTradeAutoPayFrequency('DAILY')}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      tradeAutoPayFrequency === 'DAILY'
                        ? 'border-violet-600 bg-violet-50/60 ring-2 ring-violet-500'
                        : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div className="text-xs font-black text-gray-900 flex items-center gap-1.5">
                      <span>⚡ Daily</span>
                    </div>
                    <div className="text-[11px] text-gray-500 mt-1">
                      Daily clearance of outstanding invoices
                    </div>
                  </button>
                </div>
              </div>

              {tradeAutoPayFrequency === 'WEEKLY' && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Designated Weekly Debit Day
                  </label>
                  <select
                    value={tradeAutoPayDebitDay}
                    onChange={(e) => setTradeAutoPayDebitDay(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    {['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'].map((day) => (
                      <option key={day} value={day}>
                        {day.charAt(0) + day.slice(1).toLowerCase()}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Scheduled Auto-Debit Time
                </label>
                <input
                  type="text"
                  placeholder="e.g. 10:00 AM"
                  required
                  value={tradeAutoPayDebitTime}
                  onChange={(e) => setTradeAutoPayDebitTime(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-violet-500"
                />
                <span className="text-[10px] text-gray-400 mt-1 block">
                  Debit attempt will trigger at this time in Indian Standard Time (IST).
                </span>
              </div>

              {/* Retailer Advisory Notice Preview */}
              <div className="p-3.5 bg-amber-50/80 border border-amber-200/80 rounded-2xl space-y-1">
                <div className="text-[11px] font-black text-amber-900 flex items-center gap-1">
                  <span>📢</span>
                  <span>Retailer Dashboard Advisory Preview:</span>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed font-medium">
                  {tradeAutoPayFrequency === 'DAILY'
                    ? `Automatic debit will run every day at ${tradeAutoPayDebitTime || '10:00 AM'}. Retailer is instructed to maintain minimum balance of ₹${(selectedTradeAutoPayRetailer.outstandingBalance || 0).toLocaleString('en-IN')} in their linked bank account.`
                    : `Automatic debit will run every ${tradeAutoPayDebitDay ? tradeAutoPayDebitDay.charAt(0) + tradeAutoPayDebitDay.slice(1).toLowerCase() : 'Monday'} at ${tradeAutoPayDebitTime || '10:00 AM'}. Retailer is instructed to maintain minimum balance of ₹${(selectedTradeAutoPayRetailer.outstandingBalance || 0).toLocaleString('en-IN')} in their linked bank account.`}
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setTradeAutoPayModalOpen(false)}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingTradeAutoPay}
                  className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold shadow-md shadow-violet-200 transition-all disabled:opacity-50"
                >
                  {savingTradeAutoPay ? 'Saving Schedule...' : 'Save AutoPay Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: View / Update Retailer Bank Account Details */}
      {adminBankModalOpen && selectedBankRetailer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-gray-100 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-gray-900">Retailer Bank Account Details</h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    Disbursement & Payouts
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  Retailer: <strong className="text-gray-800">{selectedBankRetailer.name}</strong> • {selectedBankRetailer.kyc?.businessName || selectedBankRetailer.phone}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAdminBankModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAdminBank} className="space-y-4">
              <CompleteIndianBankSelector
                selectedBankName={adminBankForm.bankName}
                onSelectBank={(bank) => {
                  setAdminBankForm(p => ({
                    ...p,
                    bankName: bank.name,
                    ifsc: p.ifsc && p.ifsc.startsWith(bank.ifscPrefix) ? p.ifsc : bank.ifscPrefix
                  }))
                }}
              />

              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Account Holder Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={adminBankForm.accountHolder}
                    onChange={(e) => setAdminBankForm(p => ({ ...p, accountHolder: e.target.value }))}
                    placeholder="e.g. Ramesh Trading Private Limited"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-gray-800 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Bank Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={adminBankForm.bankName}
                    onChange={(e) => setAdminBankForm(p => ({ ...p, bankName: e.target.value }))}
                    placeholder="e.g. HDFC Bank, State Bank of India"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-gray-800 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Account Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={adminBankForm.accountNumber}
                      onChange={(e) => setAdminBankForm(p => ({ ...p, accountNumber: e.target.value }))}
                      placeholder="Bank Account Number"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-gray-800 outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                      IFSC Code *
                    </label>
                    <input
                      type="text"
                      required
                      value={adminBankForm.ifsc}
                      onChange={(e) => setAdminBankForm(p => ({ ...p, ifsc: e.target.value.toUpperCase() }))}
                      placeholder="e.g. HDFC0001234"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold uppercase text-gray-800 outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Account Type
                    </label>
                    <select
                      value={adminBankForm.accountType}
                      onChange={(e) => setAdminBankForm(p => ({ ...p, accountType: e.target.value }))}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-gray-800 outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="CURRENT">Current Account</option>
                      <option value="SAVINGS">Savings Account</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2 pt-6">
                    <input
                      type="checkbox"
                      id="adminBankVerified"
                      checked={adminBankForm.isVerified}
                      onChange={(e) => setAdminBankForm(p => ({ ...p, isVerified: e.target.checked }))}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="adminBankVerified" className="text-xs font-bold text-gray-700 cursor-pointer">
                      Mark as Verified ✓
                    </label>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-indigo-50 rounded-2xl border border-indigo-100 text-[11px] text-indigo-900 leading-relaxed">
                🏛️ This verified bank account will receive Business Credit loan disbursements via NEFT/RTGS and is registered for AutoPay repayment reconciliations.
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAdminBankModalOpen(false)}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingAdminBank}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-200 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {savingAdminBank ? 'Saving Bank Details...' : 'Save & Verify Bank Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
