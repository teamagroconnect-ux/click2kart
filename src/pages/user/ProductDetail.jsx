import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import api from '../../lib/api'
import { useCart, getStockStatus } from '../../lib/CartContext'
import { setSEO, injectJsonLd } from '../../shared/lib/seo.js'
import { useToast } from '../../components/Toast'
import RecommendationModal from '../../components/RecommendationModal'

/* ── Recommendation mini grid ── */
const RecGrid = ({ items, authed, onAdd }) => (
  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:12 }}>
    {items.map((p) => (
      <div
        key={p._id||p.id}
        onClick={() => { window.location.href = `/products/${p._id||p.id}` }}
        role="button" tabIndex={0}
        onKeyDown={e => e.key==='Enter' && (window.location.href=`/products/${p._id||p.id}`)}
        aria-label={`Open ${p.name}`}
        style={{
          background:'white', borderRadius:12, overflow:'hidden',
          border:'1px solid rgba(139,92,246,.1)', cursor:'pointer',
          transition:'all .25s', display:'flex', flexDirection:'column'
        }}
        onMouseEnter={e => { e.currentTarget.style.boxShadow='0 6px 24px rgba(124,58,237,.1)'; e.currentTarget.style.borderColor='rgba(124,58,237,.25)'; e.currentTarget.style.transform='translateY(-2px)' }}
        onMouseLeave={e => { e.currentTarget.style.boxShadow='none'; e.currentTarget.style.borderColor='rgba(139,92,246,.1)'; e.currentTarget.style.transform='none' }}
      >
        <div style={{ background:'#f9f7ff', padding:16, aspectRatio:'1', display:'flex', alignItems:'center', justifyContent:'center' }}>
          {p.images?.length
            ? <img src={p.images[0]?.url||p.images[0]} alt={p.name} style={{ width:'100%', height:'100%', objectFit:'contain' }} />
            : <span style={{ fontSize:32, opacity:.3 }}>📦</span>}
        </div>
        <div style={{ padding:'10px 12px', flex:1, display:'flex', flexDirection:'column', gap:6 }}>
          <div style={{ fontSize:13, fontWeight:700, color:'#1e1b2e', lineHeight:1.3,
            display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
            {p.name}
          </div>
          <div style={{ marginTop:'auto', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <span style={{ fontSize:14, fontWeight:800, color: authed && p.price!=null ? '#7c3aed' : '#9ca3af' }}>
              {authed && p.price!=null ? `₹${Number(p.price).toLocaleString()}` : 'Login'}
            </span>
            <button
              onClick={e => { e.stopPropagation(); if(!authed) return; if(Array.isArray(p.variants)&&p.variants.length>0){window.location.href=`/products/${p._id||p.id}`;return;} onAdd(p) }}
              disabled={!authed || (Array.isArray(p.variants)&&p.variants.length===0 && p.stock!=null && p.stock<=0)}
              style={{ width:32, height:32, borderRadius:8, background:'#7c3aed', border:'none', color:'white',
                display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer',
                opacity: (!authed||(Array.isArray(p.variants)&&p.variants.length===0&&p.stock<=0)) ? .4 : 1 }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M7 6h13l-1.2 7H9.2L7 6Z" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="10" cy="19" r="1.4" fill="currentColor"/><circle cx="17" cy="19" r="1.4" fill="currentColor"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    ))}
  </div>
)

export default function ProductDetail() {
  const { id }          = useParams()
  const navigate        = useNavigate()
  const { addToCart }   = useCart()
  const { notify }      = useToast()

  const [p, setP]                         = useState(null)
  const [selected, setSelected]           = useState({ color:'', storage:'', ram:'' })
  const [activeVariant, setActiveVariant] = useState(null)
  const [activeImg, setActiveImg]         = useState(0)
  const [lightbox, setLightbox]           = useState(false)
  const [zoom, setZoom]                   = useState({ on:false, x:50, y:50 })
  const [similar, setSimilar]             = useState([])
  const [recItems, setRecItems]           = useState([])
  const [recOpen, setRecOpen]             = useState(false)
  const [reviewOpen, setReviewOpen]       = useState(false)
  const [myRating, setMyRating]           = useState(0)
  const [myComment, setMyComment] = useState('')
  const [qty, setQty] = useState(1)
  const [pincode, setPincode] = useState('')
  const [deliveryDate, setDeliveryDate] = useState(null)
  const [countdown, setCountdown] = useState({ h: 0, m: 0, s: 0 })
  const [kycData, setKycData] = useState(null)
  const authed = !!localStorage.getItem('token')

  // Fetch KYC to get pincode
  useEffect(() => {
    if (authed) {
      api.get('/api/user/profile').then(({ data }) => {
        if (data.kyc?.pincode) {
          setPincode(data.kyc.pincode)
          setKycData(data.kyc)
          // Trigger initial estimate
          const days = 2 + (Number(data.kyc.pincode[0]) % 4)
          const date = new Date()
          date.setDate(date.getDate() + days)
          setDeliveryDate(date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', weekday: 'short' }))
        }
      }).catch(() => {})
    }
  }, [authed])

  // Timer logic for same-day dispatch (Cut-off 6 PM)
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date()
      const cutoff = new Date()
      cutoff.setHours(18, 0, 0, 0) // 6 PM Cut-off

      let diff = cutoff - now
      if (diff < 0) {
        cutoff.setDate(cutoff.getDate() + 1)
        diff = cutoff - now
      }

      const h = Math.floor(diff / (1000 * 60 * 60))
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const s = Math.floor((diff % (1000 * 60)) / 1000)
      setCountdown({ h, m, s })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const checkDelivery = (e) => {
    e?.preventDefault()
    if (pincode.length !== 6) return
    // Mock delivery logic: 2-5 days based on pincode first digit
    const days = 2 + (Number(pincode[0]) % 4)
    const date = new Date()
    date.setDate(date.getDate() + days)
    setDeliveryDate(date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', weekday: 'short' }))
  }

  useEffect(() => {
    api.get(`/api/products/${id}`).then(({data})=>{
      setP(data)
      const moq = Math.max(1, Number(data.minOrderQty || 0))
      setQty(moq)
    })
    // Fetch similar products for the bottom section
    api.get(`/api/recommendations/similar/${id}`).then(({data})=>setSimilar(data||[])).catch(()=>setSimilar([]))
    
    // Pre-fetch frequently bought products for recommendation section
    api.get(`/api/recommendations/frequently-bought/${id}?limit=6`).then(({data}) => setRecItems(data || [])).catch(() => setRecItems([]))
  }, [id])
  useEffect(() => {
    if (!p||!Array.isArray(p.variants)||!p.variants.length) { setActiveVariant(null); return }
    const colors   = [...new Set(p.variants.map(v=>v.attributes?.color).filter(Boolean))]
    const rams     = [...new Set(p.variants.map(v=>v.attributes?.ram).filter(Boolean))]
    const storages = [...new Set(p.variants.map(v=>v.attributes?.storage).filter(Boolean))]
    setSelected(prev=>({ color:prev.color||colors[0]||'', ram:prev.ram||rams[0]||'', storage:prev.storage||storages[0]||'' }))
  }, [p])
  useEffect(() => {
    if (!p||!Array.isArray(p.variants)||!p.variants.length) { setActiveVariant(null); return }
    const v = p.variants.find(v=>
      (v.attributes?.color||'')===(selected.color||'') &&
      (v.attributes?.ram||'')===(selected.ram||'') &&
      (v.attributes?.storage||'')===(selected.storage||'')
    ) || null
    if (!v) {
      const pick = p.variants.filter(x=>(x.attributes?.color||'')===(selected.color||''))[0]||p.variants[0]
      if (pick) { setSelected({ color:pick.attributes?.color||'', ram:pick.attributes?.ram||'', storage:pick.attributes?.storage||'' }); return }
    }
    setActiveVariant(v); setActiveImg(0)
  }, [selected, p])
  useEffect(() => {
    if (!p) return
    const title = `${p.name} Wholesale Price | Click2Kart`
    const desc  = `Buy ${p.name} at wholesale B2B rates with GST invoice and fast delivery across India. Category: ${p.category||'General'}.`
    setSEO(title, desc)
    const cleanup = injectJsonLd({
      "@context":"https://schema.org/","@type":"Product","name":p.name,
      "image":(p.images||[]).map(i=>i.url).filter(Boolean),"category":p.category||"General",
      "offers":{"@type":"Offer","priceCurrency":"INR","price":String(p.price||0),
        "availability":p.stock>0?"https://schema.org/InStock":"https://schema.org/OutOfStock","url":`${location.origin}/products/${p._id}`},
      "aggregateRating":{"@type":"AggregateRating","ratingValue":String(p.ratingAvg||0),"reviewCount":String(p.ratingCount||0)}
    })
    return cleanup
  }, [p])

  if (!p) return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;700&display=swap');
        .pd-loader{font-family:'DM Sans',sans-serif;background:#f5f3ff;min-height:100vh;display:flex;align-items:center;justify-content:center;}
        .pd-spin{width:38px;height:38px;border:3px solid rgba(139,92,246,0.15);border-top-color:#7c3aed;border-radius:50%;animation:pds .8s linear infinite;}
        @keyframes pds{to{transform:rotate(360deg)}}
      `}</style>
      <div className="pd-loader"><div className="pd-spin"/></div>
    </>
  )

  /* ── price calculations ── */
  const basePrice        = Number(activeVariant?.price ?? p.price ?? 0)
  const sortedTiersAsc   = Array.isArray(p?.bulkTiers) ? p.bulkTiers.slice().sort((a,b)=>a.quantity-b.quantity) : []
  const sortedTiersDesc  = Array.isArray(p?.bulkTiers) ? p.bulkTiers.slice().sort((a,b)=>b.quantity-a.quantity) : []
  const minTierQty       = sortedTiersAsc.length > 0 ? Math.max(1,Number(sortedTiersAsc[0].quantity||1)) : (p?.bulkDiscountQuantity||1)
  let effectiveUnitPrice = basePrice
  const hitTier = sortedTiersDesc.find(t=>qty>=Number(t.quantity||0))
  if (hitTier) effectiveUnitPrice = Math.max(0, basePrice-Number(hitTier.priceReduction||0))
  else if (p?.bulkDiscountQuantity>0&&qty>=Number(p.bulkDiscountQuantity)) effectiveUnitPrice=Math.max(0,basePrice-Number(p.bulkDiscountPriceReduction||0))
  const savingsTotal = Math.max(0,(basePrice-effectiveUnitPrice))*qty
  const mrp          = Number(activeVariant?.mrp ?? p.mrp ?? 0)
  const unitSave     = mrp>0 ? Math.max(0,mrp-effectiveUnitPrice) : Math.max(0,basePrice-effectiveUnitPrice)
  
  // B2B GST Calculator
  const gstRate = Number(p.gst || 0)
  const taxableValue = effectiveUnitPrice / (1 + (gstRate / 100))
  const gstAmount = effectiveUnitPrice - taxableValue
  const gstSavingTotal = gstAmount * qty

  const isBestseller = (p.ratingCount||0)>=50
  const isHotDeal    = (mrp>0 ? ((mrp-(p.price||0))/mrp)*100 : 0)>=20
  const imgs         = (activeVariant?.images?.length ? activeVariant.images : (p.images||[]))
  const currentImg   = imgs[activeImg]?.url || imgs[0]?.url
  const stock        = activeVariant ? (activeVariant.stock||0) : p.stock
  const stockSt      = getStockStatus(stock)

  const handleAddToCart = async () => {
    if (!authed) { navigate('/login'); return }
    if (Array.isArray(p.variants) && p.variants.length > 0 && !activeVariant) return
    const ok = await addToCart({ ...p, minOrderQty: Math.max(minTierQty, qty) }, activeVariant || undefined)
    if (ok) {
      try {
        const { data } = await api.get(`/api/recommendations/frequently-bought/${id}`)
        if (data && data.length > 0) {
          const filtered = data.filter(item => (item._id || item.id) !== id)
          setRecItems(filtered)
          if (filtered.length > 0) setRecOpen(true)
        }
      } catch (err) {
        console.error("Rec failed:", err)
      }
    }
  }

  /* ── variant option helper ── */
  const variantOpts = (key) => [...new Set(p.variants.map(v=>v.attributes?.[key]).filter(Boolean))]
  const isOptEnabled = (key, val) => p.variants.some(v => {
    const checks = { color:selected.color, ram:selected.ram, storage:selected.storage }
    delete checks[key]
    return (v.attributes?.[key]||'')===(val) &&
      Object.entries(checks).every(([k,sv])=>!sv||(v.attributes?.[k]||'')===(sv))
  })

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&display=swap');

        .pd-root{
          font-family:'DM Sans',system-ui,sans-serif;
          background:#f5f3ff; color:#1e1b2e;
          min-height:100vh; overflow-x:hidden;
          padding-bottom:env(safe-area-inset-bottom,0px);
        }
        .pd-root::before{
          content:''; position:fixed; inset:0; pointer-events:none; z-index:0;
          background-image:linear-gradient(rgba(139,92,246,.04)1px,transparent 1px),linear-gradient(90deg,rgba(139,92,246,.04)1px,transparent 1px);
          background-size:60px 60px;
        }

        /* ── TOPBAR ── */
        .pd-topbar{
          background:white; border-bottom:1px solid rgba(139,92,246,.1);
          padding:14px 24px; display:flex; align-items:center; justify-content:space-between;
          position:sticky; top:0; z-index:40;
          box-shadow:0 1px 12px rgba(139,92,246,.07);
        }
        .pd-back{
          display:inline-flex; align-items:center; gap:7px;
          font-size:11px; font-weight:700; letter-spacing:.12em; text-transform:uppercase;
          color:#7c3aed; background:rgba(139,92,246,.08);
          border:1px solid rgba(139,92,246,.2); padding:7px 16px; border-radius:10px;
          cursor:pointer; transition:all .2s; font-family:'DM Sans',sans-serif;
          text-decoration:none;
        }
        .pd-back:hover{background:rgba(139,92,246,.14); transform:translateX(-2px);}
        .pd-topbar-label{
          font-size:9px; font-weight:700; letter-spacing:.22em; text-transform:uppercase; color:#9ca3af;
          display:flex; align-items:center; gap:8px;
        }

        /* ── MAIN LAYOUT ── */
        .pd-main{
          max-width:1240px; margin:0 auto;
          padding:24px 16px 48px; position:relative; z-index:1;
          display:grid; grid-template-columns:1fr; gap:0;
        }
        @media(min-width:900px){
          .pd-main{ grid-template-columns:480px 1fr; gap:40px; align-items:start; }
        }
        @media(min-width:1100px){
          .pd-main{ grid-template-columns:520px 1fr; gap:56px; }
        }

        /* ── IMAGE PANEL ── */
        .pd-img-panel{
          position:relative;
        }
        @media(min-width:900px){
          .pd-img-panel{ position:sticky; top:80px; }
        }

        .pd-img-main{
          background:white;
          border:1px solid rgba(139,92,246,.1);
          border-radius:20px; overflow:hidden;
          aspect-ratio:1; position:relative;
          cursor:zoom-in; display:flex; align-items:center; justify-content:center;
          transition:box-shadow .3s;
        }
        .pd-img-main:hover{ box-shadow:0 12px 40px rgba(124,58,237,.12); }
        .pd-img-main img{
          width:100%; height:100%; object-fit:contain; padding:32px;
          transition:transform .3s;
        }

        .pd-img-fullbtn{
          position:absolute; bottom:12px; right:12px;
          background:rgba(255,255,255,.9); border:1px solid rgba(139,92,246,.2);
          border-radius:8px; padding:6px 12px;
          font-size:9px; font-weight:700; letter-spacing:.15em; text-transform:uppercase;
          color:#7c3aed; cursor:pointer; font-family:'DM Sans',sans-serif;
          display:flex; align-items:center; gap:6px;
        }

        .pd-thumbs{
          display:flex; gap:8px; overflow-x:auto; padding:12px 0 4px;
          scrollbar-width:none;
        }
        .pd-thumbs::-webkit-scrollbar{ display:none; }
        .pd-thumb{
          width:72px; height:72px; flex-shrink:0;
          background:white; border:2px solid transparent;
          border-radius:10px; overflow:hidden; cursor:pointer;
          display:flex; align-items:center; justify-content:center;
          transition:all .2s; padding:6px;
        }
        .pd-thumb.active{ border-color:#7c3aed; box-shadow:0 0 0 3px rgba(124,58,237,.12); }
        .pd-thumb:not(.active):hover{ border-color:rgba(139,92,246,.35); }
        .pd-thumb img{ width:100%; height:100%; object-fit:contain; }

        /* ── PRODUCT PANEL ── */
        .pd-info{ padding:4px 0; }

        /* category + badges row */
        .pd-badges{ display:flex; flex-wrap:wrap; gap:6px; margin-bottom:14px; }
        .pd-badge{
          display:inline-flex; align-items:center; gap:5px;
          font-size:9px; font-weight:700; letter-spacing:.15em; text-transform:uppercase;
          padding:4px 10px; border-radius:100px;
        }
        .pd-badge.cat{ background:rgba(139,92,246,.1); border:1px solid rgba(139,92,246,.2); color:#7c3aed; }
        .pd-badge.green{ background:rgba(5,150,105,.1); border:1px solid rgba(5,150,105,.2); color:#059669; }
        .pd-badge.amber{ background:rgba(245,158,11,.1); border:1px solid rgba(245,158,11,.2); color:#d97706; }
        .pd-badge.red{ background:rgba(220,38,38,.1); border:1px solid rgba(220,38,38,.2); color:#dc2626; }
        .pd-badge.pink{ background:rgba(236,72,153,.1); border:1px solid rgba(236,72,153,.2); color:#db2777; }

        /* product name */
        .pd-name{
          font-family:'Bebas Neue',sans-serif;
          font-size:clamp(28px,4vw,44px);
          color:#1e1b2e; letter-spacing:.02em; line-height:1.05;
          margin-bottom:12px;
        }

        /* rating row */
        .pd-rating-row{ display:flex; align-items:center; gap:10px; margin-bottom:20px; }
        .pd-stars{ display:flex; gap:2px; }
        .pd-star{ width:16px; height:16px; }
        .pd-rating-count{ font-size:12px; color:#6b7280; font-weight:600; }
        .pd-review-btn{
          font-size:10px; font-weight:700; letter-spacing:.1em; text-transform:uppercase;
          color:#7c3aed; background:none; border:none; cursor:pointer;
          font-family:'DM Sans',sans-serif; padding:0; text-decoration:underline; text-underline-offset:3px;
        }

        /* price block */
        .pd-price-block{
          background:white; border:1px solid rgba(139,92,246,.12);
          border-radius:16px; padding:20px 20px 16px;
          margin-bottom:20px; position:relative; overflow:hidden;
        }
        .pd-price-block::before{
          content:''; position:absolute; top:0; left:0; right:0; height:2px;
          background:linear-gradient(90deg,transparent,#7c3aed,transparent);
        }
        .pd-price-main{
          font-family:'Bebas Neue',sans-serif;
          font-size:clamp(32px,5vw,48px);
          color:#7c3aed; letter-spacing:.03em; line-height:1;
        }
        .pd-price-login{
          font-size:15px; font-weight:600; color:#9ca3af; padding:8px 0;
        }
        .pd-price-mrp{ font-size:13px; color:#9ca3af; text-decoration:line-through; font-weight:500; }
        .pd-price-save{ font-size:13px; color:#059669; font-weight:700; }
        .pd-price-row{ display:flex; align-items:baseline; gap:12px; flex-wrap:wrap; margin-bottom:6px; }

        /* qty + add */
        .pd-qty-row{
          display:flex; align-items:center; gap:12px; flex-wrap:wrap; margin-top:14px;
        }
        .pd-qty-ctrl{
          display:inline-flex; align-items:center;
          background:#f5f3ff; border:1px solid rgba(139,92,246,.2);
          border-radius:10px; overflow:hidden;
        }
        .pd-qty-btn{
          width:36px; height:36px; display:flex; align-items:center; justify-content:center;
          font-size:18px; font-weight:700; color:#7c3aed; background:none; border:none;
          cursor:pointer; transition:background .15s; font-family:'DM Sans',sans-serif;
        }
        .pd-qty-btn:hover{ background:rgba(139,92,246,.1); }
        .pd-qty-val{
          min-width:40px; text-align:center;
          font-size:15px; font-weight:800; color:#1e1b2e;
          border-left:1px solid rgba(139,92,246,.12); border-right:1px solid rgba(139,92,246,.12);
          padding:0 8px; line-height:36px;
        }
        .pd-savings-tag{
          font-size:11px; font-weight:700; color:#059669;
          background:rgba(5,150,105,.08); border:1px solid rgba(5,150,105,.18);
          padding:5px 12px; border-radius:8px;
        }
        .pd-mintier-tag{
          font-size:11px; font-weight:700; color:#d97706;
          background:rgba(245,158,11,.08); border:1px solid rgba(245,158,11,.18);
          padding:5px 12px; border-radius:8px;
        }

        /* stock status */
        .pd-stock{
          display:inline-flex; align-items:center; gap:7px;
          font-size:10px; font-weight:700; letter-spacing:.12em; text-transform:uppercase;
          padding:6px 14px; border-radius:100px; margin-bottom:16px;
        }
        .pd-stock-dot{ width:6px; height:6px; border-radius:50%; }

        /* CTA buttons */
        .pd-cta-row{ display:flex; gap:10px; flex-wrap:wrap; margin-top:20px; }
        .pd-btn-buy{
          flex:1; min-width:140px;
          background:#7c3aed; color:white; border:none;
          padding:15px 28px; border-radius:12px;
          font-size:12px; font-weight:700; letter-spacing:.14em; text-transform:uppercase;
          cursor:pointer; font-family:'DM Sans',sans-serif; transition:all .25s;
          box-shadow:0 6px 20px rgba(124,58,237,.28); display:flex; align-items:center; justify-content:center; gap:8px;
        }
        .pd-btn-buy:hover:not(:disabled){ transform:translateY(-2px); box-shadow:0 10px 30px rgba(124,58,237,.4); }
        .pd-btn-buy:disabled{ opacity:.4; cursor:not-allowed; }

        /* mobile floating bar */
        .pd-mobile-bar{
          position:fixed; bottom:0; left:0; right:0;
          background:rgba(255,255,255,.95); backdrop-filter:blur(12px);
          border-top:1px solid rgba(139,92,246,.12);
          padding:12px 16px env(safe-area-inset-bottom,12px);
          z-index:90; display:flex; align-items:center; gap:12px;
          box-shadow:0 -4px 20px rgba(0,0,0,.08);
          animation:slideUp .4s ease both;
        }
        @media(min-width:900px){ .pd-mobile-bar{ display:none; } }
        @keyframes slideUp{ from{transform:translateY(100%);} to{transform:translateY(0);} }
        .pd-m-price{ flex:1; }
        .pd-m-price-label{ font-size:9px; font-weight:700; color:#9ca3af; text-transform:uppercase; letter-spacing:.05em; }
        .pd-m-price-val{ font-size:18px; font-weight:800; color:#7c3aed; line-height:1; }

        .pd-btn-cart{
          flex:1; min-width:140px;
          background:white; color:#7c3aed;
          border:1.5px solid rgba(124,58,237,.35);
          padding:15px 28px; border-radius:12px;
          font-size:12px; font-weight:700; letter-spacing:.14em; text-transform:uppercase;
          cursor:pointer; font-family:'DM Sans',sans-serif; transition:all .25s;
          display:flex; align-items:center; justify-content:center; gap:8px;
        }
        .pd-btn-cart:hover:not(:disabled){ background:#f5f3ff; border-color:#7c3aed; transform:translateY(-2px); }
        .pd-btn-cart:disabled{ opacity:.4; cursor:not-allowed; }

        /* trust strip */
        .pd-trust{
          display:flex; flex-wrap:wrap; gap:8px; margin-top:16px; padding-top:16px;
          border-top:1px solid rgba(139,92,246,.08);
        }
        .pd-trust-item{
          display:inline-flex; align-items:center; gap:6px;
          font-size:10px; font-weight:600; color:#6b7280;
        }
        .pd-trust-icon{ color:#059669; }

        /* ── VARIANTS ── */
        .pd-variants{ margin-bottom:20px; }
        .pd-var-section{ margin-bottom:16px; }
        .pd-var-label{
          font-size:9px; font-weight:700; letter-spacing:.2em; text-transform:uppercase;
          color:#9ca3af; margin-bottom:8px;
        }
        .pd-var-opts{ display:flex; flex-wrap:wrap; gap:6px; }
        .pd-var-btn{
          padding:7px 14px; border-radius:9px;
          font-size:12px; font-weight:700;
          border:1.5px solid rgba(139,92,246,.18);
          background:white; color:#1e1b2e;
          cursor:pointer; transition:all .15s; font-family:'DM Sans',sans-serif;
        }
        .pd-var-btn.active{ background:#7c3aed; border-color:#7c3aed; color:white; box-shadow:0 3px 10px rgba(124,58,237,.25); }
        .pd-var-btn:not(.active):not(:disabled):hover{ border-color:#7c3aed; color:#7c3aed; }
        .pd-var-btn:disabled{ opacity:.35; cursor:not-allowed; background:#f5f3ff; }
        .pd-sku{ font-size:11px; color:#9ca3af; font-weight:600; margin-top:8px; }

        /* ── BULK PRICING ── */
        .pd-bulk{
          background:white; border:1px solid rgba(139,92,246,.12);
          border-radius:16px; overflow:hidden; margin-bottom:20px;
        }
        .pd-bulk-head{
          padding:14px 18px 12px;
          border-bottom:1px solid rgba(139,92,246,.08);
          font-size:9px; font-weight:700; letter-spacing:.2em;
          text-transform:uppercase; color:#9ca3af;
          display:flex; align-items:center; gap:8px;
        }
        .pd-bulk table{ width:100%; border-collapse:collapse; }
        .pd-bulk th{
          padding:10px 18px; text-align:left;
          font-size:9px; font-weight:700; letter-spacing:.15em; text-transform:uppercase; color:#9ca3af;
          background:#faf9ff;
        }
        .pd-bulk td{ padding:10px 18px; font-size:13px; font-weight:600; color:#1e1b2e; border-top:1px solid rgba(139,92,246,.06); }
        .pd-bulk tr.hit td{ background:rgba(5,150,105,.05); color:#059669; font-weight:700; }

        /* ── HIGHLIGHTS ── */
        .pd-section{
          background:white; border:1px solid rgba(139,92,246,.1);
          border-radius:16px; padding:20px; margin-bottom:16px;
          position:relative; overflow:hidden;
        }
        .pd-section::before{
          content:''; position:absolute; top:0; left:0; right:0; height:2px;
          background:linear-gradient(90deg,transparent,rgba(139,92,246,.25),transparent);
        }
        .pd-section-label{
          font-size:9px; font-weight:700; letter-spacing:.2em; text-transform:uppercase;
          color:#9ca3af; margin-bottom:14px;
        }
        .pd-highlights{ display:grid; grid-template-columns:1fr 1fr; gap:8px; }
        @media(max-width:480px){ .pd-highlights{ grid-template-columns:1fr; } }
        .pd-highlight-item{
          display:flex; align-items:flex-start; gap:8px;
          font-size:13px; color:#1e1b2e; font-weight:500; line-height:1.4;
        }
        .pd-hl-dot{ width:6px; height:6px; border-radius:50%; background:#7c3aed; margin-top:5px; flex-shrink:0; }

        /* description */
        .pd-desc{
          font-size:14px; color:#4b5563; font-weight:400; line-height:1.8;
          white-space:pre-line;
        }

        /* ── SECTIONS BELOW ── */
        .pd-below{ max-width:1240px; margin:0 auto; padding:0 16px 60px; position:relative; z-index:1; }
        .pd-below-section{ margin-bottom:36px; }
        .pd-below-label{
          font-size:9px; font-weight:700; letter-spacing:.2em; text-transform:uppercase;
          color:#9ca3af; margin-bottom:16px; display:flex; align-items:center; gap:10px;
        }
        .pd-below-label::before{ content:''; width:24px; height:2px; background:#7c3aed; border-radius:2px; }

        /* ── LIGHTBOX ── */
        .pd-lightbox{
          position:fixed; inset:0; z-index:200;
          background:rgba(0,0,0,.85); backdrop-filter:blur(8px);
          display:flex; align-items:center; justify-content:center; padding:16px;
        }
        .pd-lightbox-inner{ position:relative; max-width:900px; width:100%; }
        .pd-lightbox-img{ width:100%; max-height:70vh; object-fit:contain; border-radius:16px; background:white; }
        .pd-lightbox-close{
          position:absolute; top:10px; right:10px;
          width:36px; height:36px; border-radius:10px;
          background:rgba(255,255,255,.9); border:none; cursor:pointer;
          display:flex; align-items:center; justify-content:center; font-size:18px;
        }
        .pd-lightbox-nav{
          display:flex; align-items:center; justify-content:space-between; margin-top:12px; gap:8px;
        }
        .pd-lb-navbtn{
          padding:8px 18px; border-radius:10px; background:white; border:none;
          font-size:11px; font-weight:700; letter-spacing:.1em; text-transform:uppercase;
          cursor:pointer; font-family:'DM Sans',sans-serif;
        }
        .pd-lb-navbtn:disabled{ opacity:.3; cursor:not-allowed; }
        .pd-lb-thumbs{ display:flex; gap:6px; overflow-x:auto; flex:1; justify-content:center; }
        .pd-lb-thumb{
          width:52px; height:52px; border-radius:8px; overflow:hidden;
          border:2px solid transparent; cursor:pointer; flex-shrink:0;
          background:white;
        }
        .pd-lb-thumb.active{ border-color:#7c3aed; }
        .pd-lb-thumb img{ width:100%; height:100%; object-fit:contain; }

        /* ── REC SHEET ── */
        .pd-rec-sheet{
          position:fixed; inset:0; z-index:100;
        }
        .pd-rec-backdrop{ position:absolute; inset:0; background:rgba(0,0,0,.5); backdrop-filter:blur(4px); }
        .pd-rec-panel{
          position:absolute; bottom:0; inset-x:0;
          background:white; border-radius:24px 24px 0 0;
          box-shadow:0 -8px 40px rgba(0,0,0,.15);
          max-height:70vh; overflow:hidden;
          display:flex; flex-direction:column;
        }
        .pd-rec-handle{ display:flex; justify-content:center; padding:12px 0 6px; }
        .pd-rec-pill{ width:36px; height:4px; border-radius:100px; background:#e5e7eb; }
        .pd-rec-head{
          display:flex; align-items:center; justify-content:space-between;
          padding:12px 20px 14px; border-bottom:1px solid rgba(139,92,246,.08);
        }
        .pd-rec-title{ font-size:13px; font-weight:800; color:#1e1b2e; letter-spacing:.04em; text-transform:uppercase; }

        /* ── REVIEW MODAL ── */
        .pd-modal-backdrop{
          position:fixed; inset:0; z-index:200;
          background:rgba(0,0,0,.6); backdrop-filter:blur(4px);
          display:flex; align-items:center; justify-content:center; padding:16px;
        }
        .pd-modal{
          background:white; border-radius:20px; padding:28px;
          width:100%; max-width:420px; position:relative;
        }
        .pd-modal::before{
          content:''; position:absolute; top:0; left:0; right:0; height:3px;
          background:linear-gradient(90deg,transparent,#7c3aed,transparent); border-radius:20px 20px 0 0;
        }
        .pd-modal-title{ font-family:'Bebas Neue',sans-serif; font-size:26px; color:#1e1b2e; margin-bottom:16px; letter-spacing:.03em; }
        .pd-modal-stars{ display:flex; gap:8px; margin-bottom:16px; }
        .pd-modal-star{ width:36px; height:36px; cursor:pointer; transition:transform .15s; background:none; border:none; padding:0; }
        .pd-modal-star:hover{ transform:scale(1.15); }
        .pd-modal-star svg{ width:36px; height:36px; }
        .pd-modal-textarea{
          width:100%; box-sizing:border-box;
          background:#f5f3ff; border:1px solid rgba(139,92,246,.18); border-radius:12px;
          padding:12px 14px; font-size:13px; font-weight:500; color:#1e1b2e;
          font-family:'DM Sans',sans-serif; resize:none; outline:none; margin-bottom:16px;
        }
        .pd-modal-textarea:focus{ border-color:rgba(124,58,237,.4); background:white; box-shadow:0 0 0 3px rgba(124,58,237,.08); }
        .pd-modal-btns{ display:flex; gap:10px; }
        .pd-modal-cancel{
          flex:1; padding:11px; border-radius:10px;
          background:#f5f3ff; border:1px solid rgba(139,92,246,.15); color:#6b7280;
          font-size:11px; font-weight:700; letter-spacing:.1em; text-transform:uppercase;
          cursor:pointer; font-family:'DM Sans',sans-serif;
        }
        .pd-modal-submit{
          flex:1; padding:11px; border-radius:10px;
          background:#7c3aed; color:white; border:none;
          font-size:11px; font-weight:700; letter-spacing:.1em; text-transform:uppercase;
          cursor:pointer; font-family:'DM Sans',sans-serif;
          box-shadow:0 4px 14px rgba(124,58,237,.25);
        }

        @keyframes pdUp{ from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:translateY(0);} }
      `}</style>

      <div className="pd-root">

        {/* ── TOPBAR ── */}
        <div className="pd-topbar">
          <button className="pd-back" onClick={() => navigate(-1)}>
            <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 16l-4-4m0 0l4-4m-4 4h18"/>
            </svg>
            Back to Catalog
          </button>
          <div className="pd-topbar-label">
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z M16 3H8a2 2 0 00-2 2v2h12V5a2 2 0 00-2-2z"/>
            </svg>
            Product Detail
          </div>
        </div>

        {/* ── MAIN 2-COL ── */}
        <div className="pd-main" style={{ animation:'pdUp .5s ease both' }}>

          {/* LEFT — image panel */}
          <div className="pd-img-panel">
            <div
              className="pd-img-main"
              onMouseEnter={()=>setZoom(z=>({...z,on:true}))}
              onMouseLeave={()=>setZoom({on:false,x:50,y:50})}
              onMouseMove={e=>{const r=e.currentTarget.getBoundingClientRect();setZoom({on:true,x:((e.clientX-r.left)/r.width)*100,y:((e.clientY-r.top)/r.height)*100})}}
              onClick={()=>setLightbox(true)}
            >
              {currentImg
                ? <img src={currentImg} alt={p.name}
                    style={{ transform:zoom.on?'scale(1.6)':'scale(1)', transformOrigin:`${zoom.x}% ${zoom.y}%` }} />
                : <span style={{ fontSize:80, opacity:.25 }}>📦</span>
              }
              <button className="pd-img-fullbtn">
                <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/>
                </svg>
                Full View
              </button>
            </div>
            {imgs.length > 1 && (
              <div className="pd-thumbs">
                {imgs.map((img,i) => (
                  <button key={i} className={`pd-thumb${i===activeImg?' active':''}`} onClick={()=>setActiveImg(i)}>
                    <img src={img.url} alt={`${p.name} ${i+1}`} loading="lazy"/>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT — info panel */}
          <div className="pd-info">

            {/* badges */}
            <div className="pd-badges">
              {p.category && <span className="pd-badge cat">{p.category}</span>}
              {isBestseller && <span className="pd-badge pink">⭐ Bestseller</span>}
              {isHotDeal    && <span className="pd-badge red">🔥 Hot Deal</span>}
              <span className="pd-badge green">✓ GST Invoice</span>
              <span className="pd-badge amber">⚡ Fast Dispatch</span>
            </div>

            {/* name */}
            <h1 className="pd-name">{p.name}</h1>

            {/* rating row */}
            <div className="pd-rating-row">
              <div className="pd-stars">
                {Array.from({length:5}).map((_,i) => (
                  <svg key={i} className="pd-star" viewBox="0 0 24 24">
                    <path d="M12 .587l3.668 7.431L24 9.748l-6 5.848L19.335 24 12 19.771 4.665 24 6 15.596 0 9.748l8.332-1.73z"
                      fill={i<Math.round(p.ratingAvg||0)?'#f59e0b':'#e5e7eb'}/>
                  </svg>
                ))}
              </div>
              <span className="pd-rating-count">({p.ratingCount||0} ratings)</span>
              {authed && <button className="pd-review-btn" onClick={()=>setReviewOpen(true)}>Write a Review</button>}
            </div>

            {/* VARIANTS */}
            {Array.isArray(p.variants) && p.variants.length > 0 && (
              <div className="pd-variants">
                {variantOpts('color').length > 0 && (
                  <div className="pd-var-section">
                    <div className="pd-var-label">Color</div>
                    <div className="pd-var-opts">
                      {variantOpts('color').map((c,i) => (
                        <button key={i} disabled={!isOptEnabled('color',c)}
                          className={`pd-var-btn${selected.color===c?' active':''}`}
                          onClick={()=>isOptEnabled('color',c)&&setSelected(s=>({...s,color:c}))}
                        >{c}</button>
                      ))}
                    </div>
                  </div>
                )}
                {variantOpts('storage').length > 0 && (
                  <div className="pd-var-section">
                    <div className="pd-var-label">Storage</div>
                    <div className="pd-var-opts">
                      {variantOpts('storage').map((s,i) => (
                        <button key={i} disabled={!isOptEnabled('storage',s)}
                          className={`pd-var-btn${selected.storage===s?' active':''}`}
                          onClick={()=>isOptEnabled('storage',s)&&setSelected(prev=>({...prev,storage:s}))}
                        >{s}</button>
                      ))}
                    </div>
                  </div>
                )}
                {variantOpts('ram').length > 0 && (
                  <div className="pd-var-section">
                    <div className="pd-var-label">RAM</div>
                    <div className="pd-var-opts">
                      {variantOpts('ram').map((r,i) => (
                        <button key={i} disabled={!isOptEnabled('ram',r)}
                          className={`pd-var-btn${selected.ram===r?' active':''}`}
                          onClick={()=>isOptEnabled('ram',r)&&setSelected(prev=>({...prev,ram:r}))}
                        >{r}</button>
                      ))}
                    </div>
                  </div>
                )}
                {activeVariant && <div className="pd-sku">SKU: {activeVariant.sku||'—'}</div>}
              </div>
            )}

            {/* PRICE BLOCK */}
            <div className="pd-price-block">
              {authed ? (
                <>
                  <div className="pd-price-row">
                    <div className="pd-price-main">₹{effectiveUnitPrice.toLocaleString()}<span style={{fontSize:'50%',opacity:.6}}>/unit</span></div>
                    {mrp > 0 && <span className="pd-price-mrp">MRP ₹{mrp.toLocaleString()}</span>}
                    {mrp > 0 && <span className="pd-price-save">You save ₹{unitSave.toLocaleString()}/unit</span>}
                    {p.priceTrend !== undefined && (
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black ${p.priceTrend === 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                        {p.priceTrend === 0 ? (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
                            <path d="M7 13l5 5 5-5M12 18V6" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        ) : (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
                            <path d="M7 11l5-5 5 5M12 6v12" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                        {p.priceTrend === 0 ? 'Price Drop' : 'Trending Up'}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div style={{fontSize:11,color:'#9ca3af',fontWeight:600}}>Inclusive of {gstRate}% GST</div>
                    <div className="bg-emerald-50 text-emerald-700 text-[10px] font-black px-2 py-0.5 rounded-md border border-emerald-100">
                      TAX INPUT: ₹{gstAmount.toFixed(2)} / unit
                    </div>
                  </div>

                  {/* qty */}
                  <div className="pd-qty-row">
                    <div className="pd-qty-ctrl">
                      <button className="pd-qty-btn" onClick={()=>setQty(q=>Math.max(Number(p.minOrderQty || 1), q - 1))}>−</button>
                      <div className="pd-qty-val">{qty}</div>
                      <button className="pd-qty-btn" onClick={()=>setQty(q=>q+1)}>+</button>
                    </div>
                    <div className="flex flex-col gap-1">
                      {savingsTotal > 0 && <span className="pd-savings-tag">Wholesale Save: ₹{savingsTotal.toLocaleString()}</span>}
                      {gstSavingTotal > 0 && <span className="pd-savings-tag" style={{ background:'rgba(124,58,237,0.08)', color:'#7c3aed', borderColor:'rgba(124,58,237,0.18)' }}>GST Input Claim: ₹{gstSavingTotal.toLocaleString()}</span>}
                    </div>
                  </div>
                </>
              ) : (
                <div className="pd-price-login">🔒 Login to view wholesale price</div>
              )}
            </div>

            {/* DELIVERY PANEL */}
            <div className="pd-section" style={{ background:'white', border:'1px solid rgba(139,92,246,0.12)', padding:'0' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(139,92,246,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-indigo-600 border border-indigo-50">
                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Express Dispatch</div>
                    <div className="text-sm font-black text-gray-900 leading-none">Order in {countdown.h}h {countdown.m}m {countdown.s}s</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest leading-none mb-1">Ships</div>
                  <div className="text-sm font-black text-emerald-700 leading-none">{new Date().getHours() < 18 ? 'Today' : 'Tomorrow'}</div>
                </div>
              </div>

              <div style={{ padding: '20px' }}>
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Check Delivery Availability</div>
                <form onSubmit={checkDelivery} className="flex gap-2">
                  <input 
                    type="text" 
                    maxLength="6"
                    placeholder="Enter 6-digit Pincode"
                    value={pincode}
                    onChange={e => setPincode(e.target.value.replace(/\D/g,''))}
                    style={{ flex: 1, padding: '10px 14px', borderRadius: '12px', border: '1.5px solid #e2e8f0', fontSize: '13px', fontWeight: '600', outline: 'none' }}
                  />
                  <button 
                    type="submit"
                    className="px-6 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                  >
                    Check
                  </button>
                </form>

                {deliveryDate && (
                  <div className="mt-4 flex items-center gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest leading-none mb-1">Estimated Delivery</div>
                      <div className="text-sm font-black text-emerald-800 leading-none">by {deliveryDate}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* STOCK STATUS */}
            <div className="pd-stock" style={{ background: stock>0?(stock<=5?'rgba(245,158,11,.1)':'rgba(5,150,105,.1)'):'rgba(220,38,38,.1)', border:`1px solid ${stock>0?(stock<=5?'rgba(245,158,11,.25)':'rgba(5,150,105,.25)'):'rgba(220,38,38,.25)'}`, color: stock>0?(stock<=5?'#d97706':'#059669'):'#dc2626' }}>
              <span className="pd-stock-dot" style={{ background:stock>0?(stock<=5?'#d97706':'#10b981'):'#ef4444', boxShadow:`0 0 5px ${stock>0?(stock<=5?'#d97706':'#10b981'):'#ef4444'}`, animation:stock>5?'none':'ohpulse 2s infinite' }}/>
              {stockSt.text}
            </div>

            {/* CTA BUTTONS */}
            <div className="pd-cta-row">
              <button className="pd-btn-buy"
                disabled={!authed||stock<=0||(sortedTiersAsc.length>0&&qty<minTierQty)}
                onClick={handleAddToCart}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M7 6h13l-1.2 7H9.2L7 6Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="10" cy="19" r="1.4" fill="currentColor"/><circle cx="17" cy="19" r="1.4" fill="currentColor"/>
                </svg>
                {!authed ? 'Login to Buy' : stock<=0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
            </div>

            {/* TRUST STRIP */}
            <div className="pd-trust">
              {[['Secure Payment','🔒'],['Verified Genuine','✓'],['GST Invoice Included','🧾'],['Fast Dispatch','⚡']].map(([t,i])=>(
                <div key={t} className="pd-trust-item">
                  <span className="pd-trust-icon" style={{fontSize:13}}>{i}</span>
                  <span>{t}</span>
                </div>
              ))}
            </div>

            {/* BULK PRICING */}
            {authed && Array.isArray(p.bulkTiers) && p.bulkTiers.length > 0 && (
              <div className="pd-bulk" style={{ marginTop:24, background:'linear-gradient(135deg, #fff 0%, #f9f7ff 100%)' }}>
                <div className="pd-bulk-head" style={{ borderBottom:'1px solid rgba(124,58,237,0.1)' }}>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                      </svg>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Wholesale Tiers</span>
                      <span className="text-sm font-black text-gray-900">Bulk Purchase Savings</span>
                    </div>
                  </div>
                </div>
                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {sortedTiersAsc.map((t,idx)=>{
                    const next    = sortedTiersAsc[idx+1]
                    const from    = t.quantity
                    const to      = next ? next.quantity-1 : null
                    const label   = to ? `${from}–${to} Units` : `${from}+ Units`
                    const eff     = Math.max(0, basePrice-Number(t.priceReduction||0))
                    const perSave = Math.max(0, basePrice-eff)
                    const hit     = qty>=from && (!next||qty<=to||to===null)
                    return (
                      <div 
                        key={idx} 
                        className={`p-4 rounded-2xl border-2 transition-all duration-300 flex items-center justify-between ${
                          hit 
                          ? 'bg-white border-emerald-500 shadow-lg shadow-emerald-500/10 scale-[1.02]' 
                          : 'bg-white/50 border-gray-100 hover:border-indigo-200'
                        }`}
                      >
                        <div>
                          <div className={`text-[10px] font-black uppercase tracking-widest mb-1 ${hit ? 'text-emerald-600' : 'text-gray-400'}`}>
                            {label}
                          </div>
                          <div className="text-lg font-black text-gray-900">₹{eff.toLocaleString()}<span className="text-[10px] text-gray-400 ml-1">/unit</span></div>
                        </div>
                        <div className={`text-center px-3 py-2 rounded-xl border ${hit ? 'bg-emerald-50 border-emerald-100' : 'bg-indigo-50 border-indigo-100'}`}>
                          <div className={`text-[9px] font-black uppercase tracking-tighter ${hit ? 'text-emerald-600' : 'text-indigo-600'}`}>Save</div>
                          <div className={`text-sm font-black ${hit ? 'text-emerald-700' : 'text-indigo-700'}`}>₹{perSave.toLocaleString()}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* HIGHLIGHTS */}
            {Array.isArray(p.highlights) && p.highlights.length > 0 && (
              <div className="pd-section" style={{ marginTop:20 }}>
                <div className="pd-section-label">Product Highlights</div>
                <div className="pd-highlights">
                  {p.highlights.map((h,i) => (
                    <div key={i} className="pd-highlight-item">
                      <span className="pd-hl-dot"/>
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* DESCRIPTION */}
            {p.description && (
              <div className="pd-section" style={{ marginTop:16 }}>
                <div className="pd-section-label">Product Specifications</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                  <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">HSN Code</span>
                    <span className="text-sm font-black text-gray-900">{p.hsnCode || '—'}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">GST Rate</span>
                    <span className="text-sm font-black text-gray-900">{p.gst || 0}%</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Weight</span>
                    <span className="text-sm font-black text-gray-900">{p.weight || 0}g</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">MOQ</span>
                    <span className="text-sm font-black text-gray-900">{p.minOrderQty || 1} Units</span>
                  </div>
                </div>
                <div className="mt-6">
                  <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Detailed Description</div>
                  <p className="pd-desc">{p.description}</p>
                </div>
              </div>
            )}

            {/* Suggested Products Grid (Directly after description) */}
            {similar.length > 0 && (
              <div className="pd-section" style={{ marginTop: 16 }}>
                <div className="pd-section-label">Suggested Products</div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {similar.slice(0, 6).map((item) => (
                    <div 
                      key={item._id} 
                      onClick={() => navigate(`/products/${item._id}`)}
                      className="group cursor-pointer bg-gray-50/50 rounded-2xl p-3 border border-transparent hover:border-indigo-100 hover:bg-white hover:shadow-xl transition-all duration-500"
                    >
                      <div className="aspect-square rounded-xl bg-white border border-gray-100 p-3 mb-2 overflow-hidden flex items-center justify-center">
                        {item.images?.[0]?.url 
                          ? <img src={item.images[0].url} alt={item.name} className="h-full w-full object-contain group-hover:scale-110 transition-transform duration-500" />
                          : <div className="text-2xl opacity-20">📦</div>}
                      </div>
                      <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 truncate">{item.category}</div>
                      <h4 className="text-[11px] font-bold text-gray-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">{item.name}</h4>
                      <div className="text-indigo-600 font-black text-xs mt-1">
                        {authed ? `₹${Number(item.price).toLocaleString()}` : 'Login'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* ── BELOW SECTIONS ── */}
        <div className="pd-below">
          {/* Recommended Section (Horizontal Scroll) */}
          {recItems.length > 0 && (
            <div className="pd-below-section">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="pd-below-label" style={{ marginBottom: 4 }}>You Might Also Like</div>
                  <h3 className="text-xl font-black text-gray-900 tracking-tight">Recommended For You</h3>
                </div>
                <Link to="/products" className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:translate-x-1 transition-transform flex items-center gap-2">
                  View All <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m4-4H3"/></svg>
                </Link>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-6 -mx-4 px-4 scrollbar-hide custom-scrollbar">
                {recItems.map((item) => (
                  <div key={item._id} onClick={() => navigate(`/products/${item._id}`)} className="flex-shrink-0 w-[200px] group cursor-pointer">
                    <div className="aspect-square rounded-2xl bg-white border border-gray-100 p-4 mb-3 group-hover:shadow-xl group-hover:border-indigo-100 transition-all duration-500 overflow-hidden">
                      {item.images?.[0]?.url 
                        ? <img src={item.images[0].url} alt={item.name} className="h-full w-full object-contain group-hover:scale-110 transition-transform duration-500" />
                        : <div className="h-full w-full flex items-center justify-center text-3xl">📦</div>}
                    </div>
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 truncate">{item.category}</div>
                    <h4 className="text-sm font-bold text-gray-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">{item.name}</h4>
                    <div className="text-indigo-600 font-black text-sm mt-1">
                      {authed ? `₹${Number(item.price).toLocaleString()}` : 'Login to view'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── LIGHTBOX ── */}
        {lightbox && (
          <div className="pd-lightbox" onClick={()=>setLightbox(false)}>
            <div className="pd-lightbox-inner" onClick={e=>e.stopPropagation()}>
              <img src={currentImg} alt={p.name} className="pd-lightbox-img"/>
              <button className="pd-lightbox-close" onClick={()=>setLightbox(false)}>✕</button>
              <div className="pd-lightbox-nav">
                <button className="pd-lb-navbtn" onClick={()=>setActiveImg(i=>Math.max(0,i-1))} disabled={activeImg<=0}>← Prev</button>
                <div className="pd-lb-thumbs">
                  {imgs.map((img,i)=>(
                    <button key={i} className={`pd-lb-thumb${i===activeImg?' active':''}`} onClick={()=>setActiveImg(i)}>
                      <img src={img.url} alt={`${p.name} ${i+1}`}/>
                    </button>
                  ))}
                </div>
                <button className="pd-lb-navbtn" onClick={()=>setActiveImg(i=>Math.min(imgs.length-1,i+1))} disabled={activeImg>=imgs.length-1}>Next →</button>
              </div>
            </div>
          </div>
        )}

        {/* Global Recommendation Modal */}
        <RecommendationModal 
          open={recOpen} 
          items={recItems} 
          onClose={() => setRecOpen(false)} 
          onAddToCart={async (item) => {
            await addToCart(item);
            const updated = recItems.filter(i => (i._id || i.id) !== (item._id || item.id));
            setRecItems(updated);
            if (updated.length === 0) setRecOpen(false);
          }}
        />

        {/* ── REVIEW MODAL ── */}
        {reviewOpen && (
          <div className="pd-modal-backdrop" onClick={()=>setReviewOpen(false)}>
            <div className="pd-modal" onClick={e=>e.stopPropagation()}>
              <div className="pd-modal-title">Your Feedback</div>
              <div className="pd-modal-stars">
                {Array.from({length:5}).map((_,i)=>(
                  <button key={i} className="pd-modal-star" onClick={()=>setMyRating(i+1)}>
                    <svg viewBox="0 0 24 24">
                      <path d="M12 .587l3.668 7.431L24 9.748l-6 5.848L19.335 24 12 19.771 4.665 24 6 15.596 0 9.748l8.332-1.73z"
                        fill={i<myRating?'#f59e0b':'#e5e7eb'}/>
                    </svg>
                  </button>
                ))}
              </div>
              <textarea className="pd-modal-textarea" rows="4" placeholder="Share your experience (optional)…"
                value={myComment} onChange={e=>setMyComment(e.target.value)}/>
              <div className="pd-modal-btns">
                <button className="pd-modal-cancel" onClick={()=>setReviewOpen(false)}>Cancel</button>
                <button className="pd-modal-submit" onClick={async()=>{
                  if(myRating<1) return
                  try {
                    const {data}=await api.post(`/api/products/${id}/reviews`,{rating:myRating,comment:myComment})
                    setP(prev=>({...prev,ratingAvg:data.ratingAvg,ratingCount:data.ratingCount}))
                    setReviewOpen(false); setMyRating(0); setMyComment('')
                  } catch(e){ alert(e?.response?.data?.error||'Failed to submit') }
                }}>Submit Review</button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* MOBILE FLOATING BAR */}
      {p && (
        <div className="pd-mobile-bar">
          <div className="pd-m-price">
            <div className="pd-m-price-label">Wholesale Price</div>
            <div className="pd-m-price-val">
              {authed ? `₹${effectiveUnitPrice.toLocaleString()}` : 'Login'}
            </div>
          </div>
          <button 
            className="pd-btn-buy" 
            style={{ flex: 2, padding: '12px 20px', borderRadius: 14 }}
            disabled={!authed || stock <= 0 || (sortedTiersAsc.length > 0 && qty < minTierQty)}
            onClick={handleAddToCart}
          >
            {!authed ? 'Login' : stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      )}
    </>
  )
}