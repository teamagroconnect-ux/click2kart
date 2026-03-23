import React, { useEffect, useState, useMemo } from 'react'
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom'
import api from '../../lib/api'
import { useCart, getStockStatus } from '../../lib/CartContext'
import { setSEO, injectJsonLd } from '../../shared/lib/seo.js'
import { useToast } from '../../components/Toast'
import RecommendationModal from '../../components/RecommendationModal'

/* ═══════════════════════════════════════════════
   PRODUCT DETAIL  –  Click2Kart B2B
═══════════════════════════════════════════════ */
export default function ProductDetail() {
  const { id }        = useParams()
  const navigate      = useNavigate()
  const location      = useLocation()
  const { addToCart } = useCart()
  const { notify }    = useToast()

  const [p, setP]                         = useState(null)
  const [error, setError]                 = useState(null)
  const [selected, setSelected]           = useState({})
  const [activeVariant, setActiveVariant] = useState(null)
  const [activeImg, setActiveImg]         = useState(0)
  const [lightbox, setLightbox]           = useState(false)
  const [zoom, setZoom]                   = useState({ on:false, x:50, y:50 })
  const [similar, setSimilar]             = useState([])
  const [recItems, setRecItems]           = useState([])
  const [recOpen, setRecOpen]             = useState(false)
  const [reviewOpen, setReviewOpen]       = useState(false)
  const [myRating, setMyRating]           = useState(0)
  const [myComment, setMyComment]         = useState('')
  const [hoverStar, setHoverStar]         = useState(0)
  const [qty, setQty]                     = useState(1)
  const [pincode, setPincode]             = useState('')
  const [deliveryDate, setDeliveryDate]   = useState(null)
  const [countdown, setCountdown]         = useState({ h:0, m:0, s:0 })
  const [kycData, setKycData]             = useState(null)
  const [kycLoading, setKycLoading]       = useState(false)
  const authed = !!localStorage.getItem('token')

  const variantAttrs = useMemo(() => {
    if (!p || !p.attributes) return []
    return Array.isArray(p.attributes) ? p.attributes : []
  }, [p])

  const matchedVariant = useMemo(() => {
    if (!p || !p.variants || !Array.isArray(p.variants) || !p.variants.length) return null
    return p.variants.find(v => {
      const vAttrs = (v && v.attributes && typeof v.attributes === 'object' && !(v.attributes instanceof Map)) 
        ? v.attributes 
        : (v && v.attributes instanceof Map ? Object.fromEntries(v.attributes) : {})
      if (!vAttrs || v.isActive === false) return false
      
      // A variant is a match only if ALL product attributes match the selection
      return variantAttrs.every(attr => {
        const val = selected[attr];
        if (!val) return false; // Incomplete selection
        return String(vAttrs[attr] || '').toLowerCase() === String(val || '').toLowerCase()
      })
    })
  }, [p, selected, variantAttrs])

  const imgs = useMemo(() => {
    if (matchedVariant?.images?.length > 0) return matchedVariant.images
    return Array.isArray(p?.images) ? p.images : []
  }, [p, matchedVariant])

  /* KYC / pincode */
  useEffect(() => {
    if (!authed) return
    setKycLoading(true)
    api.get('/api/user/me').then(({ data }) => {
      const kyc = data.kyc || {}
      if (kyc.pincode) {
        setPincode(kyc.pincode); setKycData(kyc)
        const days = 2 + (Number(kyc.pincode[0]) % 4)
        const d = new Date(); d.setDate(d.getDate() + days)
        setDeliveryDate(d.toLocaleDateString('en-IN', { day:'numeric', month:'short', weekday:'short' }))
      }
    }).catch(() => {}).finally(() => setKycLoading(false))
  }, [authed])

  /* countdown */
  useEffect(() => {
    const t = setInterval(() => {
      const now = new Date(), co = new Date()
      co.setHours(18, 0, 0, 0)
      let diff = co - now
      if (diff < 0) { co.setDate(co.getDate() + 1); diff = co - now }
      setCountdown({ h:Math.floor(diff/3600000), m:Math.floor((diff%3600000)/60000), s:Math.floor((diff%60000)/1000) })
    }, 1000)
    return () => clearInterval(t)
  }, [])

  const checkDelivery = (e) => {
    e?.preventDefault()
    if (pincode.length !== 6) return
    const days = 2 + (Number(pincode[0]) % 4)
    const d = new Date(); d.setDate(d.getDate() + days)
    setDeliveryDate(d.toLocaleDateString('en-IN', { day:'numeric', month:'short', weekday:'short' }))
  }

  /* load product */
  useEffect(() => {
    setError(null);
    api.get(`/api/products/${id}`).then(({ data }) => {
      if (!data) throw new Error('no_data');
      setP(data); setQty(Math.max(1, Number(data.minOrderQty || 1)))
    }).catch(err => {
      console.error("Product load failed:", err);
      const msg = err?.response?.data?.error || err.message || 'Product not found';
      setError(msg === 'not_found' ? 'This product is no longer available.' : msg);
    })
    api.get(`/api/recommendations/similar/${id}`).then(({ data }) => setSimilar(data||[])).catch(() => {})
    api.get(`/api/recommendations/frequently-bought/${id}?limit=6`).then(({ data }) => setRecItems(data||[])).catch(() => {})
  }, [id])

  /* variant selection */
  useEffect(() => {
    if (!p || !Array.isArray(p.variants) || !p.variants.length) { setActiveVariant(null); return }
    const attrs = Array.isArray(p.attributes) ? p.attributes : []
    const initial = {}
    attrs.forEach(a => {
      const vals = [...new Set(p.variants.map(v => {
        const vAttrs = (v && v.attributes && typeof v.attributes === 'object' && !(v.attributes instanceof Map)) 
          ? v.attributes 
          : (v && v.attributes instanceof Map ? Object.fromEntries(v.attributes) : {})
        return vAttrs ? vAttrs[a] : null
      }).filter(Boolean))]
      if (vals.length) initial[a] = vals[0]
    })
    setSelected(prev => ({ ...initial, ...prev }))
  }, [p])

  useEffect(() => {
    if (!p || !Array.isArray(p.variants) || !p.variants.length) { setActiveVariant(null); return }
    const attrs = Array.isArray(p.attributes) ? p.attributes : []
    const v = p.variants.find(v => {
      const vAttrs = (v && v.attributes && typeof v.attributes === 'object' && !(v.attributes instanceof Map)) 
        ? v.attributes 
        : (v && v.attributes instanceof Map ? Object.fromEntries(v.attributes) : {})
      if (!vAttrs) return false
      return attrs.every(k => {
        const val = selected[k];
        if (!val) return true;
        return String(vAttrs[k] || '').toLowerCase() === String(val || '').toLowerCase()
      })
    }) || null
    
    if (!v && Object.keys(selected).length > 0) {
      // Fallback: try to find any variant that matches the first selected attribute
      const firstKey = attrs[0]
      if (firstKey) {
        const pick = p.variants.find(x => {
          const xAttrs = (x && x.attributes && typeof x.attributes === 'object' && !(x.attributes instanceof Map)) 
            ? x.attributes 
            : (x && x.attributes instanceof Map ? Object.fromEntries(x.attributes) : {})
          if (!xAttrs) return false
          return String(xAttrs[firstKey] || '').toLowerCase() === String(selected[firstKey] || '').toLowerCase()
        }) || p.variants[0]
        
        if (pick) {
          const pickAttrs = (pick && pick.attributes && typeof pick.attributes === 'object' && !(pick.attributes instanceof Map)) 
            ? pick.attributes 
            : (pick && pick.attributes instanceof Map ? Object.fromEntries(pick.attributes) : {})
          setSelected(pickAttrs || {})
          return
        }
      }
    }
    setActiveVariant(v); setActiveImg(0)
  }, [selected, p])

  /* SEO */
  useEffect(() => {
    if (!p) return
    setSEO(`${p.name} Wholesale Price | Click2Kart`, `Buy ${p.name} at wholesale B2B rates with GST invoice and fast delivery.`)
    const cleanup = injectJsonLd({
      "@context":"https://schema.org/","@type":"Product","name":p.name,
      "brand":{"@type":"Brand","name":p.brand?.name || p.brand || "Click2Kart"},
      "image":(p.images||[]).map(i=>i.url).filter(Boolean),"category":p.category?.name || p.category || "General",
      "offers":{"@type":"Offer","priceCurrency":"INR","price":String(p.price||0),
        "availability":p.stock>0?"https://schema.org/InStock":"https://schema.org/OutOfStock","url":`${window.location.origin}/products/${p._id}`},
      "aggregateRating":{"@type":"AggregateRating","ratingValue":String(p.ratingAvg||0),"reviewCount":String(p.ratingCount||0)}
    })
    return cleanup
  }, [p])

  /* ── LOADING & ERROR ── */
  if (error) return (
    <div className="pd-error-root">
      <style>{`
        .pd-error-root { font-family:'DM Sans',sans-serif; background:#f5f3ff; min-height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:20px; text-align:center; }
        .pd-error-box { background:white; padding:40px; border-radius:24px; box-shadow:0 10px 40px rgba(0,0,0,.05); border:1px solid rgba(124,58,237,.1); max-width:400px; width:100%; }
        .pd-error-ico { font-size:40px; margin-bottom:20px; display:block; }
        .pd-error-h { font-family:'Bebas Neue',sans-serif; font-size:32px; color:#1e1b2e; margin-bottom:10px; }
        .pd-error-p { font-size:14px; color:#6b7280; margin-bottom:24px; line-height:1.6; }
        .pd-error-btn { background:#7c3aed; color:white; padding:12px 24px; border-radius:12px; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.1em; text-decoration:none; display:inline-block; transition:all .2s; }
        .pd-error-btn:hover { transform:translateY(-2px); box-shadow:0 8px 20px rgba(124,58,237,.3); }
      `}</style>
      <div className="pd-error-box">
        <span className="pd-error-ico">🛍️</span>
        <h2 className="pd-error-h">Oops!</h2>
        <p className="pd-error-p">{error}</p>
        <Link to="/products" className="pd-error-btn">Back to Catalogue</Link>
      </div>
    </div>
  )

  if (!p) return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;600;700&display=swap');
        .pdload{font-family:'DM Sans',sans-serif;background:#f5f3ff;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:24px;position:relative;overflow:hidden;}
        .pdload::before{content:'';position:absolute;inset:0;background-image:linear-gradient(rgba(139,92,246,.03)1px,transparent 1px),linear-gradient(90deg,rgba(139,92,246,.03)1px,transparent 1px);background-size:60px 60px;}
        .pdload-wrap{position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;}
        .pdload-outer{width:80px;height:80px;border-radius:50%;border:4px solid rgba(124,58,237,.08);display:flex;align-items:center;justify-content:center;position:relative;}
        .pdload-inner{width:60px;height:60px;border-radius:50%;border:4px solid transparent;border-top-color:#7c3aed;border-right-color:#7c3aed;animation:pdSpin 1s cubic-bezier(.4,0,.2,1) infinite;}
        .pdload-center{position:absolute;width:30px;height:30px;background:rgba(124,58,237,.1);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;animation:pdPulse 1.5s ease-in-out infinite;}
        .pdload-txt{font-size:10px;font-weight:800;letter-spacing:.25em;text-transform:uppercase;color:#7c3aed;margin-top:20px;opacity:.6;animation:pdFade 1.5s ease-in-out infinite;}
        @keyframes pdSpin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes pdPulse{0%,100%{transform:scale(1);opacity:.5}50%{transform:scale(1.2);opacity:1}}
        @keyframes pdFade{0%,100%{opacity:.4}50%{opacity:1}}
      `}</style>
      <div className="pdload">
        <div className="pdload-wrap">
          <div className="pdload-outer">
            <div className="pdload-inner"/>
            <div className="pdload-center">📦</div>
          </div>
          <span className="pdload-txt">Fetching Product…</span>
        </div>
      </div>
    </>
  )

  /* variant helpers */
  // Variant selection helper: get available values for a specific attribute key
  const variantOpts = (key) => {
    if (!p?.variants?.length) return []
    const set = new Set()
    p.variants.forEach(v => {
      if (v.isActive === false) return;
      const vAttrs = (v.attributes && typeof v.attributes === 'object' && !(v.attributes instanceof Map)) 
        ? v.attributes 
        : (v.attributes instanceof Map ? Object.fromEntries(v.attributes) : {})
      if (vAttrs[key]) set.add(vAttrs[key])
    })
    return Array.from(set).sort()
  }

  // Flipkart Style Logic: Check if an option is enabled based on current other selections
  const isOptEnabled = (key, val) => {
    if (!p?.variants?.length) return true
    
    // We want to know if there's ANY variant that has this 'val' for 'key'
    // AND matches the OTHER currently selected attributes.
    const otherSelections = { ...selected };
    delete otherSelections[key]; 

    return p.variants.some(v => {
      if (v.isActive === false) return false;
      const vAttrs = (v && v.attributes && typeof v.attributes === 'object' && !(v.attributes instanceof Map)) 
        ? v.attributes 
        : (v && v.attributes instanceof Map ? Object.fromEntries(v.attributes) : {})
      if (!vAttrs) return false;
      
      // Must match the value we're checking
      if (String(vAttrs[key] || '').toLowerCase() !== String(val || '').toLowerCase()) return false;

      // Must match all other selected attributes
      const matchOthers = Object.entries(otherSelections).every(([k, vVal]) => {
        if (!vVal) return true;
        return String(vAttrs[k] || '').toLowerCase() === String(vVal || '').toLowerCase();
      });

      // Flipkart style: also check if it's in stock for it to be "available"
      return matchOthers && (v.stock > 0);
    });
  }

  const currentPrice = matchedVariant?.price ?? p?.price
  const currentMrp = matchedVariant?.mrp ?? p?.mrp
  const currentStock = matchedVariant?.stock ?? p?.stock
  const currentSku = matchedVariant?.sku
  const isAvailable = currentStock > 0

  const canAddToCart = variantAttrs.every(attr => !!selected[attr]) && !!matchedVariant && isAvailable

  /* ── PRICE CALCULATIONS ── */
  const basePrice  = Number(currentPrice ?? 0)
  const sortedAsc  = Array.isArray(p.bulkTiers) ? p.bulkTiers.slice().sort((a,b) => a.quantity-b.quantity) : []
  const sortedDesc = Array.isArray(p.bulkTiers) ? p.bulkTiers.slice().sort((a,b) => b.quantity-a.quantity) : []
  const minTierQty = sortedAsc.length > 0 ? Math.max(1, Number(sortedAsc[0].quantity||1)) : (p.bulkDiscountQuantity||1)
  let effPrice     = basePrice
  const hitTier    = sortedDesc.find(t => qty >= Number(t.quantity||0))
  if (hitTier) effPrice = Math.max(0, basePrice - Number(hitTier.priceReduction||0))
  else if (p.bulkDiscountQuantity > 0 && qty >= Number(p.bulkDiscountQuantity)) effPrice = Math.max(0, basePrice - Number(p.bulkDiscountPriceReduction||0))
  const savingsTotal = Math.max(0, (basePrice - effPrice) * qty)
  const mrp          = Number(currentMrp ?? 0)
  const unitSave     = mrp > 0 ? Math.max(0, mrp - effPrice) : Math.max(0, basePrice - effPrice)
  const gstRate      = Number(p.gst || 0)
  const isBestseller = (p.ratingCount||0) >= 50
  const isHotDeal    = mrp > 0 && ((mrp - (p.price||0)) / mrp) * 100 >= 20

  const currentImg   = imgs[activeImg]?.url || imgs[0]?.url
  const stock        = currentStock ?? 0
  const stockSt      = getStockStatus(stock)

  const handleAddToCart = async () => {
    if (!authed) { navigate('/login'); return }
    if (variantAttrs.length > 0 && !matchedVariant) return
    const ok = await addToCart({ ...p, minOrderQty: Math.max(minTierQty, qty) }, matchedVariant||undefined)
    if (ok) {
      try {
        const { data } = await api.get(`/api/recommendations/frequently-bought/${id}`)
        const filtered = (data||[]).filter(item => (item._id||item.id) !== id)
        setRecItems(filtered)
        if (filtered.length > 0) setRecOpen(true)
      } catch {}
    }
  }

  /* ── RENDER ── */
  return (
    <>
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800&display=swap');
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

      /* ─── ROOT ─── */
      .pd {
        font-family: 'DM Sans', system-ui, sans-serif;
        background: #f5f3ff; color: #1e1b2e;
        min-height: 100vh; overflow-x: hidden;
        padding-bottom: env(safe-area-inset-bottom, 0px);
      }
      .pd::before {
        content: ''; position: fixed; inset: 0; pointer-events: none; z-index: 0;
        background-image:
          linear-gradient(rgba(139,92,246,.035) 1px, transparent 1px),
          linear-gradient(90deg, rgba(139,92,246,.035) 1px, transparent 1px);
        background-size: 60px 60px;
      }
      .pd-glow1 { position:fixed;top:-200px;left:-150px;width:580px;height:580px;border-radius:50%;background:radial-gradient(ellipse,rgba(139,92,246,.1),transparent 65%);pointer-events:none;z-index:0; }
      .pd-glow2 { position:fixed;bottom:-180px;right:-120px;width:480px;height:480px;border-radius:50%;background:radial-gradient(ellipse,rgba(99,102,241,.08),transparent 65%);pointer-events:none;z-index:0; }

      /* ─── TOPBAR ─── */
      .pd-topbar {
        position: sticky; top: 0; z-index: 50;
        background: rgba(245,243,255,.93); backdrop-filter: blur(18px);
        border-bottom: 1px solid rgba(139,92,246,.12);
        box-shadow: 0 2px 20px rgba(124,58,237,.07);
        padding: 13px 20px; display: flex; align-items: center; justify-content: space-between; gap: 12px;
      }
      @media (min-width: 768px) { .pd-topbar { padding: 14px 32px; } }
      .pd-back {
        display: inline-flex; align-items: center; gap: 7px;
        font-size: 11px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase;
        color: #7c3aed; background: rgba(124,58,237,.08);
        border: 1.5px solid rgba(124,58,237,.2); padding: 7px 16px; border-radius: 10px;
        cursor: pointer; transition: all .2s; font-family: 'DM Sans', sans-serif;
        text-decoration: none; white-space: nowrap;
      }
      .pd-back:hover { background: rgba(124,58,237,.14); transform: translateX(-2px); }
      .pd-breadcrumb {
        display: flex; align-items: center; gap: 6px; overflow: hidden;
        font-size: 11px; font-weight: 600; color: #9ca3af;
      }
      .pd-breadcrumb-sep { color: rgba(124,58,237,.3); }
      .pd-breadcrumb span:last-child { color: #7c3aed; font-weight: 700; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 200px; }

      /* ─── MAIN LAYOUT ─── */
      .pd-wrap {
        max-width: 1260px; margin: 0 auto;
        padding: 24px 16px 60px; position: relative; z-index: 1;
      }
      @media (min-width: 768px) { .pd-wrap { padding: 28px 24px 80px; } }
      .pd-grid {
        display: grid; grid-template-columns: 1fr; gap: 24px;
      }
      @media (min-width: 900px) {
        .pd-grid { grid-template-columns: 460px 1fr; gap: 40px; align-items: start; }
      }
      @media (min-width: 1100px) {
        .pd-grid { grid-template-columns: 500px 1fr; gap: 52px; }
      }

      /* ─── IMAGE PANEL ─── */
      .pd-img-panel { position: relative; }
      @media (min-width: 900px) { .pd-img-panel { position: sticky; top: 76px; } }

      .pd-img-main {
        background: white; border: 1px solid rgba(124,58,237,.1);
        border-radius: 22px; overflow: hidden; aspect-ratio: 1;
        position: relative; cursor: zoom-in;
        display: flex; align-items: center; justify-content: center;
        transition: box-shadow .3s, border-color .3s;
        box-shadow: 0 4px 24px rgba(124,58,237,.07);
      }
      .pd-img-main:hover { box-shadow: 0 12px 44px rgba(124,58,237,.13); border-color: rgba(124,58,237,.2); }
      .pd-img-main img {
        width: 100%; height: 100%; object-fit: contain; padding: 20px;
        transition: transform .35s cubic-bezier(.34,1.2,.64,1);
      }
      .pd-img-main::after {
        content: ''; position: absolute; inset: 0;
        background: linear-gradient(135deg, rgba(124,58,237,.03) 0%, transparent 60%);
        pointer-events: none;
      }

      /* fullview btn */
      .pd-fullview {
        position: absolute; bottom: 12px; right: 12px; z-index: 2;
        display: inline-flex; align-items: center; gap: 6px;
        background: rgba(255,255,255,.92); backdrop-filter: blur(8px);
        border: 1px solid rgba(124,58,237,.18);
        border-radius: 9px; padding: 6px 13px;
        font-size: 9px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase;
        color: #7c3aed; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all .2s;
      }
      .pd-fullview:hover { background: white; border-color: rgba(124,58,237,.35); }

      /* badge chips on image */
      .pd-img-chips { position: absolute; top: 12px; left: 12px; z-index: 2; display: flex; flex-direction: column; gap: 5px; }
      .pd-img-chip {
        display: inline-flex; align-items: center; gap: 4px;
        padding: 3px 9px; border-radius: 7px;
        font-size: 8px; font-weight: 800; letter-spacing: .1em; text-transform: uppercase;
        color: white;
      }
      .pd-img-chip.bs { background: linear-gradient(135deg, #ec4899, #db2777); box-shadow: 0 3px 10px rgba(219,39,119,.3); }
      .pd-img-chip.hd { background: linear-gradient(135deg, #f59e0b, #d97706); box-shadow: 0 3px 10px rgba(217,119,6,.3); }

      /* thumbnails */
      .pd-thumbs { display: flex; gap: 8px; padding: 12px 0 2px; overflow-x: auto; scrollbar-width: none; }
      .pd-thumbs::-webkit-scrollbar { display: none; }
      .pd-thumb {
        width: 68px; height: 68px; flex-shrink: 0; background: white;
        border: 2px solid rgba(124,58,237,.1);
        border-radius: 12px; overflow: hidden; cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        transition: all .2s; padding: 6px;
      }
      .pd-thumb.on { border-color: #7c3aed; box-shadow: 0 0 0 3px rgba(124,58,237,.12); }
      .pd-thumb:not(.on):hover { border-color: rgba(124,58,237,.35); }
      .pd-thumb img { width: 100%; height: 100%; object-fit: contain; }

      /* variant combinations below image */
      .pd-img-variants { margin-top: 24px; padding: 16px; background: white; border-radius: 18px; border: 1px solid rgba(124,58,237,.1); box-shadow: 0 4px 15px rgba(124,58,237,.05); }
      .pd-img-vars-title { font-size: 10px; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; color: #9ca3af; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }
      .pd-img-vars-title::after { content: ''; flex: 1; height: 1px; background: rgba(124,58,237,.1); }
      .pd-img-vars-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 10px; }
      .pd-img-var-card { 
        padding: 8px; border-radius: 12px; border: 1.5px solid rgba(124,58,237,.08); 
        background: #fdfcff; cursor: pointer; transition: all .2s;
        display: flex; align-items: center; gap: 10px;
      }
      .pd-img-var-card:hover { border-color: #7c3aed; background: white; transform: translateY(-2px); box-shadow: 0 5px 15px rgba(124,58,237,.1); }
      .pd-img-var-card.active { border-color: #7c3aed; background: #f5f3ff; box-shadow: inset 0 0 0 1px #7c3aed; }
      .pd-img-var-mini-img { width: 40px; height: 40px; border-radius: 8px; object-fit: contain; background: white; border: 1px solid rgba(124,58,237,.05); flex-shrink: 0; }
      .pd-img-var-info { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
      .pd-img-var-attrs { font-size: 10px; font-weight: 700; color: #1e1b2e; line-height: 1.2; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .pd-img-var-price { font-size: 12px; font-weight: 800; color: #7c3aed; font-family: 'Bebas Neue', sans-serif; letter-spacing: 0.02em; }
      .pd-img-var-stock { font-size: 8px; font-weight: 700; text-transform: uppercase; color: #9ca3af; }
      .pd-img-var-stock.low { color: #d97706; }
      .pd-img-var-stock.out { color: #dc2626; }

      /* ─── INFO PANEL ─── */
      .pd-info { display: flex; flex-direction: column; gap: 0; }

      /* badges row */
      .pd-badges { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 14px; }
      .pd-badge {
        display: inline-flex; align-items: center; gap: 4px;
        font-size: 9px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase;
        padding: 4px 10px; border-radius: 100px;
      }
      .pd-badge-v  { background: rgba(124,58,237,.09); border: 1px solid rgba(124,58,237,.2); color: #7c3aed; }
      .pd-badge-g  { background: rgba(5,150,105,.09);  border: 1px solid rgba(5,150,105,.2);  color: #059669; }
      .pd-badge-a  { background: rgba(245,158,11,.09); border: 1px solid rgba(245,158,11,.2); color: #d97706; }

      /* product name */
      .pd-name {
        font-family: 'Bebas Neue', sans-serif;
        font-size: clamp(30px, 4.5vw, 46px);
        color: #1e1b2e; letter-spacing: .02em; line-height: 1.05;
        margin-bottom: 12px;
      }

      /* rating row */
      .pd-rat-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 20px; }
      .pd-stars { display: flex; gap: 2px; }
      .pd-star { width: 15px; height: 15px; }
      .pd-rat-ct { font-size: 12px; color: #6b7280; font-weight: 600; }
      .pd-rev-btn {
        font-size: 10px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase;
        color: #7c3aed; background: none; border: none; cursor: pointer;
        font-family: 'DM Sans', sans-serif; text-decoration: underline; text-underline-offset: 3px; padding: 0;
        transition: color .15s;
      }
      .pd-rev-btn:hover { color: #6d28d9; }

      /* ─── PRICE BLOCK ─── */
      .pd-price-block {
        background: white; border: 1px solid rgba(124,58,237,.12);
        border-radius: 18px; padding: 20px 22px 18px;
        margin-bottom: 18px; position: relative; overflow: hidden;
        box-shadow: 0 4px 20px rgba(124,58,237,.06);
      }
      .pd-price-block::before {
        content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
        background: linear-gradient(90deg, transparent, #7c3aed 40%, #a78bfa 70%, transparent);
      }
      .pd-price-main {
        font-family: 'Bebas Neue', sans-serif;
        font-size: clamp(34px, 5.5vw, 52px);
        color: #7c3aed; letter-spacing: .03em; line-height: 1;
      }
      .pd-price-main .pd-unit { font-size: 45%; opacity: .55; margin-left: 2px; }
      .pd-price-row { display: flex; align-items: baseline; gap: 12px; flex-wrap: wrap; margin-bottom: 4px; }
      .pd-price-mrp { font-size: 13px; color: #9ca3af; text-decoration: line-through; font-weight: 500; }
      .pd-price-save { font-size: 12px; color: #059669; font-weight: 700; background: rgba(5,150,105,.08); border: 1px solid rgba(5,150,105,.18); padding: 2px 10px; border-radius: 6px; }
      .pd-price-gst { font-size: 11px; color: #9ca3af; font-weight: 600; margin-top: 4px; }
      .pd-price-trend {
        display: inline-flex; align-items: center; gap: 4px;
        font-size: 10px; font-weight: 700; padding: 3px 9px; border-radius: 7px;
      }
      .pd-trend-down { background: rgba(5,150,105,.1); color: #059669; }
      .pd-trend-up   { background: rgba(239,68,68,.1);  color: #dc2626; }

      /* masked price */
      .pd-price-mask {
        display: inline-flex; align-items: center; gap: 7px;
        padding: 10px 16px; border-radius: 12px;
        background: linear-gradient(135deg, rgba(124,58,237,.09), rgba(99,102,241,.07));
        border: 1px solid rgba(124,58,237,.2);
        cursor: pointer; text-decoration: none; transition: all .2s;
        position: relative; overflow: hidden; margin-bottom: 4px;
      }
      .pd-price-mask::after {
        content: ''; position: absolute; inset: 0;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,.3), transparent);
        transform: translateX(-100%); animation: pdSheen 3.5s ease infinite;
      }
      .pd-price-mask:hover { background: rgba(124,58,237,.14); border-color: rgba(124,58,237,.35); }
      .pd-mask-rupee { font-size: 18px; font-weight: 800; color: #7c3aed; }
      .pd-mask-stars {
        font-family: monospace; font-size: 20px; font-weight: 900;
        color: #7c3aed; letter-spacing: 4px; filter: blur(5px);
        user-select: none; animation: pdMaskPulse 4s ease infinite;
      }
      .pd-mask-eye { color: #7c3aed; }
      .pd-mask-hint { font-size: 11px; color: #7c3aed; font-weight: 600; margin-top: 6px; }

      /* qty controller */
      .pd-qty-row { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin-top: 16px; }
      .pd-qty {
        display: inline-flex; align-items: center;
        background: #f5f3ff; border: 1.5px solid rgba(124,58,237,.2); border-radius: 12px; overflow: hidden;
      }
      .pd-qty-btn {
        width: 38px; height: 38px; display: flex; align-items: center; justify-content: center;
        font-size: 20px; font-weight: 700; color: #7c3aed;
        background: none; border: none; cursor: pointer; transition: background .15s; font-family: 'DM Sans', sans-serif;
      }
      .pd-qty-btn:hover { background: rgba(124,58,237,.1); }
      .pd-qty-btn:disabled { opacity: .35; cursor: not-allowed; }
      .pd-qty-val {
        min-width: 44px; text-align: center; font-size: 15px; font-weight: 800; color: #1e1b2e;
        border-left: 1px solid rgba(124,58,237,.12); border-right: 1px solid rgba(124,58,237,.12);
        padding: 0 8px; line-height: 38px;
      }
      .pd-save-tag {
        display: inline-flex; align-items: center; gap: 5px;
        font-size: 11px; font-weight: 700; color: #059669;
        background: rgba(5,150,105,.08); border: 1px solid rgba(5,150,105,.18);
        padding: 5px 12px; border-radius: 8px;
      }
      .pd-mintier-tag {
        font-size: 11px; font-weight: 700; color: #d97706;
        background: rgba(245,158,11,.08); border: 1px solid rgba(245,158,11,.18);
        padding: 5px 12px; border-radius: 8px;
      }

      /* ─── VARIANTS ─── */
      .pd-variants { margin-bottom: 20px; }
      .pd-var-sec { margin-bottom: 14px; }
      .pd-var-lbl {
        font-size: 8px; font-weight: 700; letter-spacing: .22em; text-transform: uppercase;
        color: #9ca3af; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;
      }
      .pd-var-lbl::before { content: ''; width: 14px; height: 2px; background: rgba(124,58,237,.25); border-radius: 2px; }
      .pd-var-opts { display: flex; flex-wrap: wrap; gap: 6px; }
      .pd-var-btn {
        padding: 7px 14px; border-radius: 9px; font-size: 12px; font-weight: 700;
        border: 1.5px solid rgba(124,58,237,.18); background: white; color: #1e1b2e;
        cursor: pointer; transition: all .15s; font-family: 'DM Sans', sans-serif;
      }
      .pd-var-btn.on { background: #7c3aed; border-color: #7c3aed; color: white; box-shadow: 0 3px 10px rgba(124,58,237,.25); }
      .pd-var-btn:not(.on):not(.disabled):hover { border-color: #7c3aed; color: #7c3aed; }
      .pd-var-btn.disabled { 
        opacity: 0.4; 
        cursor: not-allowed; 
        background: #f9fafb; 
        border-style: dashed; 
        border-color: #d1d5db; 
        color: #9ca3af;
        position: relative;
        overflow: hidden;
      }
      .pd-var-btn.disabled::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 0;
        width: 100%;
        height: 1px;
        background: #9ca3af;
        transform: rotate(-25deg);
        pointer-events: none;
      }
      .pd-sku { font-size: 11px; color: #9ca3af; font-weight: 600; margin-top: 8px; }

      /* ─── STOCK STATUS ─── */
      .pd-stock {
        display: inline-flex; align-items: center; gap: 7px;
        font-size: 10px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase;
        padding: 6px 14px; border-radius: 100px; margin-bottom: 16px;
      }
      .pd-stock-dot { width: 6px; height: 6px; border-radius: 50%; }
      @keyframes pdStockPulse { 0%,100%{opacity:1;transform:scale(1);} 50%{opacity:.4;transform:scale(.65);} }

      /* ─── CTA BUTTONS ─── */
      .pd-cta { display: flex; gap: 10px; flex-wrap: wrap; }
      .pd-btn-primary {
        flex: 1; min-width: 140px;
        background: linear-gradient(135deg, #7c3aed, #6d28d9); color: white; border: none;
        padding: 15px 24px; border-radius: 13px;
        font-size: 11px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase;
        cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all .25s;
        box-shadow: 0 6px 22px rgba(124,58,237,.3);
        display: flex; align-items: center; justify-content: center; gap: 8px;
      }
      .pd-btn-primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 32px rgba(124,58,237,.42); }
      .pd-btn-primary:active:not(:disabled) { transform: translateY(0); }
      .pd-btn-primary:disabled { opacity: .4; cursor: not-allowed; transform: none; box-shadow: none; }

      /* ─── TRUST STRIP ─── */
      .pd-trust { display: flex; flex-wrap: wrap; gap: 10px; padding-top: 16px; border-top: 1px solid rgba(124,58,237,.08); margin-top: 16px; }
      .pd-trust-item { display: inline-flex; align-items: center; gap: 6px; font-size: 10px; font-weight: 600; color: #6b7280; }

      /* ─── DELIVERY PANEL ─── */
      .pd-delivery {
        background: white; border: 1px solid rgba(124,58,237,.12);
        border-radius: 18px; overflow: hidden; margin-bottom: 18px;
        box-shadow: 0 4px 20px rgba(124,58,237,.05);
      }
      .pd-delivery-head {
        background: linear-gradient(135deg, rgba(124,58,237,.05), rgba(99,102,241,.04));
        border-bottom: 1px solid rgba(124,58,237,.08);
        padding: 14px 18px;
        display: flex; align-items: center; justify-content: space-between;
      }
      .pd-delivery-head-left { display: flex; align-items: center; gap: 12px; }
      .pd-del-ico { width: 38px; height: 38px; border-radius: 10px; background: white; border: 1px solid rgba(124,58,237,.12); display: flex; align-items: center; justify-content: center; color: #7c3aed; box-shadow: 0 2px 8px rgba(124,58,237,.08); flex-shrink: 0; }
      .pd-del-label { font-size: 9px; font-weight: 700; letter-spacing: .18em; text-transform: uppercase; color: #9ca3af; }
      .pd-del-countdown { font-size: 13px; font-weight: 800; color: #dc2626; font-family: monospace; letter-spacing: .04em; }
      .pd-del-ships-lbl { font-size: 9px; font-weight: 700; letter-spacing: .15em; text-transform: uppercase; color: #059669; text-align: right; }
      .pd-del-ships-val { font-size: 13px; font-weight: 800; color: #1e1b2e; text-align: right; }
      .pd-delivery-body { padding: 16px 18px; }
      .pd-del-pinput { display: flex; gap: 8px; }
      .pd-del-inp {
        flex: 1; padding: 10px 14px; border-radius: 11px;
        border: 1.5px solid rgba(124,58,237,.18);
        font-size: 13px; font-weight: 600; color: #1e1b2e;
        outline: none; font-family: 'DM Sans', sans-serif; transition: all .2s;
      }
      .pd-del-inp:focus { border-color: rgba(124,58,237,.45); box-shadow: 0 0 0 3px rgba(124,58,237,.08); }
      .pd-del-check {
        padding: 10px 18px; border-radius: 11px; border: none;
        background: #7c3aed; color: white;
        font-size: 10px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase;
        cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all .2s;
        white-space: nowrap;
      }
      .pd-del-check:hover { background: #6d28d9; }
      .pd-del-result {
        margin-top: 12px; display: flex; align-items: center; gap: 10px;
        background: rgba(5,150,105,.06); border: 1px solid rgba(5,150,105,.18);
        border-radius: 12px; padding: 10px 14px;
      }
      .pd-del-res-ico { width: 32px; height: 32px; border-radius: 9px; background: rgba(5,150,105,.12); display: flex; align-items: center; justify-content: center; color: #059669; flex-shrink: 0; }
      .pd-del-res-lbl { font-size: 9px; font-weight: 700; letter-spacing: .15em; text-transform: uppercase; color: #059669; }
      .pd-del-res-date { font-size: 13px; font-weight: 800; color: #1e1b2e; margin-top: 1px; }
      .pd-del-addr { display: flex; align-items: center; justify-content: space-between; }
      .pd-del-addr-left { display: flex; align-items: center; gap: 10px; }
      .pd-del-addr-ico { width: 36px; height: 36px; border-radius: 9px; background: rgba(124,58,237,.08); display: flex; align-items: center; justify-content: center; color: #7c3aed; flex-shrink: 0; }
      .pd-del-change {
        font-size: 10px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase;
        color: #7c3aed; background: rgba(124,58,237,.07); border: 1px solid rgba(124,58,237,.15);
        padding: 6px 12px; border-radius: 8px; cursor: pointer; font-family: 'DM Sans', sans-serif; border-width:0;
        transition: all .2s;
      }
      .pd-del-change:hover { background: rgba(124,58,237,.13); }

      /* ─── SECTION CARD ─── */
      .pd-card {
        background: white; border: 1px solid rgba(124,58,237,.1);
        border-radius: 18px; overflow: hidden; margin-bottom: 16px;
        box-shadow: 0 4px 20px rgba(124,58,237,.05); position: relative;
      }
      .pd-card::before {
        content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
        background: linear-gradient(90deg, transparent, rgba(124,58,237,.25), transparent);
      }
      .pd-card-head {
        padding: 16px 20px 14px; border-bottom: 1px solid rgba(124,58,237,.07);
        display: flex; align-items: center; gap: 10px;
      }
      .pd-card-head-ico { width: 34px; height: 34px; border-radius: 9px; background: rgba(124,58,237,.08); display: flex; align-items: center; justify-content: center; color: #7c3aed; flex-shrink: 0; }
      .pd-card-head-label { font-size: 8px; font-weight: 700; letter-spacing: .2em; text-transform: uppercase; color: #9ca3af; }
      .pd-card-head-title { font-size: 15px; font-weight: 800; color: #1e1b2e; margin-top: 1px; }
      .pd-card-body { padding: 18px 20px; }

      /* ─── BULK PRICING TABLE ─── */
      .pd-bulk-table { width: 100%; border-collapse: separate; border-spacing: 0; }
      .pd-bulk-table thead tr { background: #f9f7ff; }
      .pd-bulk-table th {
        padding: 11px 16px; text-align: left;
        font-size: 9px; font-weight: 700; letter-spacing: .18em; text-transform: uppercase; color: #9ca3af;
        border-bottom: 1px solid rgba(124,58,237,.08);
      }
      .pd-bulk-table th:last-child { text-align: right; }
      .pd-bulk-table td {
        padding: 14px 16px; font-size: 13px; font-weight: 600; color: #4b5563;
        border-bottom: 1px solid rgba(124,58,237,.05); transition: all .2s;
      }
      .pd-bulk-table td:last-child { text-align: right; }
      .pd-bulk-table tbody tr:last-child td { border-bottom: none; }
      /* active tier row */
      .pd-bulk-table tbody tr.pd-tier-hit td {
        background: linear-gradient(135deg, rgba(124,58,237,.06), rgba(99,102,241,.04));
        color: #1e1b2e;
      }
      .pd-bulk-table tbody tr.pd-tier-hit td:first-child { border-left: 3px solid #7c3aed; padding-left: 13px; }
      /* qty cell */
      .pd-tier-qty { font-weight: 800; color: #1e1b2e; display: flex; align-items: center; gap: 8px; }
      .pd-tier-current {
        display: inline-flex; align-items: center; gap: 3px;
        font-size: 8px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase;
        color: white; background: #7c3aed; padding: 2px 7px; border-radius: 5px;
        animation: pdTierIn .35s cubic-bezier(.34,1.56,.64,1) both;
      }
      @keyframes pdTierIn { from{opacity:0;transform:scale(.7);} to{opacity:1;transform:scale(1);} }
      /* price cell */
      .pd-tier-price { font-family: 'Bebas Neue', sans-serif; font-size: 18px; color: #7c3aed; letter-spacing: .03em; }
      /* save cell */
      .pd-tier-save {
        display: inline-flex; align-items: center; gap: 4px;
        font-size: 11px; font-weight: 700;
        padding: 4px 10px; border-radius: 7px;
        float: right;
      }
      .pd-tier-save.active { background: #7c3aed; color: white; box-shadow: 0 3px 10px rgba(124,58,237,.3); }
      .pd-tier-save.normal { background: rgba(124,58,237,.08); color: #7c3aed; border: 1px solid rgba(124,58,237,.15); }
      /* bulk progress bar */
      .pd-bulk-progress { margin-top: 16px; padding: 14px 16px; background: rgba(124,58,237,.04); border: 1px solid rgba(124,58,237,.1); border-radius: 12px; }
      .pd-bulk-prog-label { font-size: 11px; font-weight: 700; color: #6b7280; margin-bottom: 8px; display: flex; justify-content: space-between; }
      .pd-bulk-prog-label span { color: #7c3aed; font-weight: 800; }
      .pd-bulk-prog-bar { height: 6px; background: rgba(124,58,237,.12); border-radius: 100px; overflow: hidden; }
      .pd-bulk-prog-fill { height: 100%; background: linear-gradient(90deg, #7c3aed, #a78bfa); border-radius: 100px; transition: width .4s cubic-bezier(.34,1.56,.64,1); }

      /* ─── HIGHLIGHTS ─── */
      .pd-highlights { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
      @media (max-width: 480px) { .pd-highlights { grid-template-columns: 1fr; } }
      .pd-hl-item { display: flex; align-items: flex-start; gap: 9px; font-size: 13px; color: #374151; font-weight: 500; line-height: 1.4; padding: 10px 12px; background: #f9f7ff; border-radius: 10px; border: 1px solid rgba(124,58,237,.07); }
      .pd-hl-dot { width: 7px; height: 7px; border-radius: 50%; background: #7c3aed; margin-top: 4px; flex-shrink: 0; }

      /* ─── DESCRIPTION ─── */
      .pd-desc { font-size: 14px; color: #4b5563; font-weight: 400; line-height: 1.9; white-space: pre-line; }

      /* ─── SIMILAR PRODUCTS (SCROLLABLE) ─── */
      .pd-sim-scroll { display: flex; gap: 12px; overflow-x: auto; padding-bottom: 8px; scrollbar-width: none; -webkit-overflow-scrolling: touch; }
      .pd-sim-scroll::-webkit-scrollbar { display: none; }
      .pd-sim-item {
        flex-shrink: 0; width: 160px;
        background: white; border-radius: 16px; overflow: hidden;
        border: 1px solid rgba(124,58,237,.08); cursor: pointer;
        transition: all .25s; display: flex; flex-direction: column;
        box-shadow: 0 2px 10px rgba(0,0,0,.03);
      }
      .pd-sim-item:hover { border-color: #7c3aed; transform: translateY(-3px); box-shadow: 0 10px 25px rgba(124,58,237,.12); }
      .pd-sim-img { aspect-ratio: 1; background: #f9f7ff; display: flex; align-items: center; justify-content: center; overflow: hidden; }
      .pd-sim-img img { width: 100%; height: 100%; object-fit: contain; padding: 14px; transition: transform .4s; }
      .pd-sim-item:hover .pd-sim-img img { transform: scale(1.08); }
      .pd-sim-body { padding: 10px 12px; }
      .pd-sim-cat { font-size: 8px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: #9ca3af; margin-bottom: 3px; }
      .pd-sim-name { font-size: 11px; font-weight: 700; color: #1e1b2e; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .pd-sim-price { font-family: 'Bebas Neue', sans-serif; font-size: 16px; color: #7c3aed; letter-spacing: .03em; margin-top: 4px; }

      /* ─── BELOW SECTIONS ─── */
      .pd-below { max-width: 1260px; margin: 0 auto; padding: 0 16px 80px; position: relative; z-index: 1; }
      @media (min-width: 768px) { .pd-below { padding: 0 24px 80px; } }
      .pd-below-header { display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 18px; }
      .pd-below-eyebrow { font-size: 8px; font-weight: 700; letter-spacing: .22em; text-transform: uppercase; color: #9ca3af; margin-bottom: 4px; display: flex; align-items: center; gap: 7px; }
      .pd-below-eyebrow::before { content:''; width:18px; height:2px; background:#7c3aed; border-radius:2px; }
      .pd-below-title { font-family: 'Bebas Neue', sans-serif; font-size: 26px; color: #1e1b2e; letter-spacing: .03em; line-height: 1; }
      .pd-view-all {
        display: inline-flex; align-items: center; gap: 5px;
        font-size: 10px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase;
        color: #7c3aed; text-decoration: none; transition: gap .2s;
      }
      .pd-view-all:hover { gap: 8px; }

      /* rec scroll */
      .pd-rec-scroll { display: flex; gap: 14px; overflow-x: auto; padding-bottom: 8px; scrollbar-width: none; -webkit-overflow-scrolling: touch; }
      .pd-rec-scroll::-webkit-scrollbar { display: none; }
      .pd-rec-item {
        flex-shrink: 0; width: 190px; background: white;
        border-radius: 18px; overflow: hidden;
        border: 1px solid rgba(124,58,237,.09);
        cursor: pointer; transition: all .28s;
        box-shadow: 0 2px 12px rgba(124,58,237,.05);
      }
      .pd-rec-item:hover { transform: translateY(-4px); box-shadow: 0 10px 30px rgba(124,58,237,.12); border-color: rgba(124,58,237,.2); }
      .pd-rec-img { aspect-ratio: 1; background: #f9f7ff; overflow: hidden; display: flex; align-items: center; justify-content: center; }
      .pd-rec-img img { width: 100%; height: 100%; object-fit: contain; padding: 16px; transition: transform .4s; }
      .pd-rec-item:hover .pd-rec-img img { transform: scale(1.08); }
      .pd-rec-body { padding: 12px 14px; }
      .pd-rec-cat { font-size: 9px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: #9ca3af; margin-bottom: 3px; }
      .pd-rec-name { font-size: 12px; font-weight: 700; color: #1e1b2e; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .pd-rec-price { font-family: 'Bebas Neue', sans-serif; font-size: 17px; color: #7c3aed; letter-spacing: .03em; margin-top: 4px; }

      /* ─── LIGHTBOX ─── */
      .pd-lightbox {
        position: fixed; inset: 0; z-index: 200;
        background: rgba(0,0,0,.88); backdrop-filter: blur(10px);
        display: flex; align-items: center; justify-content: center; padding: 16px;
        animation: pdFadeIn .2s ease both;
      }
      .pd-lb-inner { position: relative; max-width: 860px; width: 100%; }
      .pd-lb-img { width: 100%; max-height: 72vh; object-fit: contain; border-radius: 18px; background: white; padding: 16px; }
      .pd-lb-close {
        position: absolute; top: -12px; right: -12px;
        width: 38px; height: 38px; border-radius: 100px;
        background: white; border: none; cursor: pointer;
        display: flex; align-items: center; justify-content: center; font-size: 16px;
        box-shadow: 0 4px 16px rgba(0,0,0,.2); transition: transform .15s;
      }
      .pd-lb-close:hover { transform: scale(1.1); }
      .pd-lb-nav { display: flex; align-items: center; justify-content: space-between; margin-top: 14px; gap: 8px; }
      .pd-lb-navbtn {
        padding: 8px 18px; border-radius: 10px; background: rgba(255,255,255,.9); border: none;
        font-size: 11px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase;
        cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all .15s;
      }
      .pd-lb-navbtn:hover:not(:disabled) { background: white; }
      .pd-lb-navbtn:disabled { opacity: .3; cursor: not-allowed; }
      .pd-lb-thumbs { display: flex; gap: 6px; overflow-x: auto; flex: 1; justify-content: center; scrollbar-width: none; }
      .pd-lb-thumbs::-webkit-scrollbar { display: none; }
      .pd-lb-thumb {
        width: 50px; height: 50px; flex-shrink: 0; border-radius: 8px;
        overflow: hidden; border: 2px solid transparent; cursor: pointer; background: white;
      }
      .pd-lb-thumb.on { border-color: #7c3aed; }
      .pd-lb-thumb img { width: 100%; height: 100%; object-fit: contain; }

      /* ─── REVIEW MODAL ─── */
      .pd-modal-back {
        position: fixed; inset: 0; z-index: 200;
        background: rgba(0,0,0,.6); backdrop-filter: blur(5px);
        display: flex; align-items: center; justify-content: center; padding: 16px;
      }
      .pd-modal {
        background: white; border-radius: 22px; padding: 28px;
        width: 100%; max-width: 400px; position: relative; overflow: hidden;
      }
      .pd-modal::before {
        content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
        background: linear-gradient(90deg, transparent, #7c3aed, transparent); border-radius: 22px 22px 0 0;
      }
      .pd-modal-title { font-family: 'Bebas Neue', sans-serif; font-size: 28px; color: #1e1b2e; letter-spacing: .03em; margin-bottom: 16px; }
      .pd-modal-stars { display: flex; gap: 6px; margin-bottom: 16px; }
      .pd-modal-star { background: none; border: none; padding: 0; cursor: pointer; transition: transform .15s; }
      .pd-modal-star:hover { transform: scale(1.2); }
      .pd-modal-ta {
        width: 100%; background: #f5f3ff; border: 1.5px solid rgba(124,58,237,.18);
        border-radius: 12px; padding: 12px 14px;
        font-size: 13px; font-weight: 500; color: #1e1b2e;
        font-family: 'DM Sans', sans-serif; resize: none; outline: none; margin-bottom: 16px;
        transition: all .2s;
      }
      .pd-modal-ta:focus { border-color: rgba(124,58,237,.4); background: white; box-shadow: 0 0 0 3px rgba(124,58,237,.08); }
      .pd-modal-btns { display: flex; gap: 10px; }
      .pd-modal-cancel {
        flex: 1; padding: 11px; border-radius: 10px;
        background: #f5f3ff; border: 1px solid rgba(124,58,237,.15); color: #6b7280;
        font-size: 11px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase;
        cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all .2s;
      }
      .pd-modal-cancel:hover { background: rgba(124,58,237,.08); }
      .pd-modal-submit {
        flex: 1; padding: 11px; border-radius: 10px;
        background: #7c3aed; color: white; border: none;
        font-size: 11px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase;
        cursor: pointer; font-family: 'DM Sans', sans-serif;
        box-shadow: 0 4px 14px rgba(124,58,237,.28); transition: all .2s;
      }
      .pd-modal-submit:hover { background: #6d28d9; }

      /* ─── MOBILE STICKY BAR ─── */
      .pd-mob-bar {
        display: none;
        position: fixed; bottom: 0; left: 0; right: 0; z-index: 90;
        background: rgba(255,255,255,.96); backdrop-filter: blur(14px);
        border-top: 1px solid rgba(124,58,237,.12);
        padding: 12px 16px env(safe-area-inset-bottom, 12px);
        align-items: center; gap: 12px;
        box-shadow: 0 -4px 24px rgba(0,0,0,.08);
        animation: pdSlideUp .4s ease both;
      }
      @media (max-width: 899px) { .pd-mob-bar { display: flex; } }
      @keyframes pdSlideUp { from{transform:translateY(100%);} to{transform:translateY(0);} }
      .pd-mob-price { flex: 1; }
      .pd-mob-price-lbl { font-size: 9px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: #9ca3af; }
      .pd-mob-price-val { font-family: 'Bebas Neue', sans-serif; font-size: 22px; color: #7c3aed; letter-spacing: .03em; line-height: 1; }

      /* ─── ANIMATIONS ─── */
      @keyframes pdFadeIn  { from{opacity:0;} to{opacity:1;} }
      @keyframes pdFadeUp  { from{opacity:0;transform:translateY(14px);} to{opacity:1;transform:translateY(0);} }
      @keyframes pdSheen   { 0%,70%,100%{transform:translateX(-100%);} 35%{transform:translateX(200%);} }
      @keyframes pdMaskPulse { 0%,90%,100%{filter:blur(5px);} 94%{filter:blur(3px);} }
    `}</style>

    <div className="pd">
      <div className="pd-glow1"/><div className="pd-glow2"/>

      {/* ── TOPBAR ── */}
      <div className="pd-topbar">
        <button className="pd-back" onClick={() => navigate(-1)}>
          <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 16l-4-4m0 0l4-4m-4 4h18"/>
          </svg>
          Back
        </button>
        <div className="pd-breadcrumb">
          <span>Catalogue</span>
          <span className="pd-breadcrumb-sep">›</span>
          {p.category && <><span>{p.category?.name || p.category}</span><span className="pd-breadcrumb-sep">›</span></>}
          <span>{p.name}</span>
        </div>
      </div>

      {/* ── MAIN ── */}
      <div className="pd-wrap">
        <div className="pd-grid" style={{ animation:'pdFadeUp .5s ease both' }}>

          {/* ══ LEFT — IMAGE PANEL ══ */}
          <div className="pd-img-panel">
            <div
              className="pd-img-main"
              onMouseEnter={() => setZoom(z => ({...z, on:true}))}
              onMouseLeave={() => setZoom({ on:false, x:50, y:50 })}
              onMouseMove={e => { const r=e.currentTarget.getBoundingClientRect(); setZoom({on:true,x:((e.clientX-r.left)/r.width)*100,y:((e.clientY-r.top)/r.height)*100}) }}
              onClick={() => setLightbox(true)}
            >
              {currentImg
                ? <img src={currentImg} alt={p.name} style={{ transform: zoom.on ? 'scale(1.55)' : 'scale(1)', transformOrigin:`${zoom.x}% ${zoom.y}%` }}/>
                : <span style={{fontSize:80,opacity:.2}}>📦</span>
              }
              {/* image corner chips */}
              {(isBestseller || isHotDeal) && (
                <div className="pd-img-chips">
                  {isBestseller && <span className="pd-img-chip bs">⭐ Bestseller</span>}
                  {isHotDeal    && <span className="pd-img-chip hd">🔥 Hot Deal</span>}
                </div>
              )}
              <button className="pd-fullview" onClick={e => { e.stopPropagation(); setLightbox(true) }}>
                <svg width="11" height="11" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/>
                </svg>
                Full View
              </button>
            </div>

            {imgs.length > 1 && (
              <div className="pd-thumbs">
                {imgs.map((img, i) => (
                  <button key={i} className={`pd-thumb${i===activeImg?' on':''}`} onClick={() => setActiveImg(i)}>
                    <img src={img.url} alt={`${p.name} ${i+1}`} loading="lazy"/>
                  </button>
                ))}
              </div>
            )}

            {/* VARIANT COMBINATIONS BELOW IMAGE */}
            {Array.isArray(p.variants) && p.variants.length > 1 && (
              <div className="pd-img-variants">
                <div className="pd-img-vars-title">Variant Combinations</div>
                <div className="pd-img-vars-grid">
                  {p.variants.filter(v => v.isActive !== false).map((v, i) => {
                    const vAttrs = (v.attributes && typeof v.attributes === 'object' && !(v.attributes instanceof Map)) 
                      ? v.attributes 
                      : (v.attributes instanceof Map ? Object.fromEntries(v.attributes) : {})
                    
                    const attrText = Object.entries(vAttrs).map(([k, val]) => `${val}`).join(' / ')
                    const isActive = matchedVariant?._id === v._id
                    const vImg = v.images?.[0]?.url || p.images?.[0]?.url

                    return (
                      <div 
                        key={v._id || i} 
                        className={`pd-img-var-card${isActive ? ' active' : ''}`}
                        onClick={() => setSelected(vAttrs)}
                      >
                        <img src={vImg} className="pd-img-var-mini-img" alt={attrText} />
                        <div className="pd-img-var-info">
                          <span className="pd-img-var-attrs" title={attrText}>{attrText}</span>
                          <span className="pd-img-var-price">₹{Number(v.price).toLocaleString()}</span>
                          {v.stock <= 0 ? (
                            <span className="pd-img-var-stock out">Out of stock</span>
                          ) : v.stock <= 5 ? (
                            <span className="pd-img-var-stock low">Only {v.stock} left</span>
                          ) : (
                            <span className="pd-img-var-stock">{v.stock} Units</span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ══ RIGHT — INFO PANEL ══ */}
          <div className="pd-info">

            {/* badges */}
            <div className="pd-badges">
              {p.category && <span className="pd-badge pd-badge-v">{p.category?.name || p.category}</span>}
              <span className="pd-badge pd-badge-g">✓ GST Invoice</span>
              <span className="pd-badge pd-badge-a">⚡ Fast Dispatch</span>
            </div>

            {/* STOCK STATUS */}
            <div className="pd-stock" style={{
              background: stock>0?(stock<=5?'rgba(245,158,11,.1)':'rgba(5,150,105,.1)'):'rgba(220,38,38,.1)',
              border: `1px solid ${stock>0?(stock<=5?'rgba(245,158,11,.25)':'rgba(5,150,105,.25)'):'rgba(220,38,38,.25)'}`,
              color: stock>0?(stock<=5?'#d97706':'#059669'):'#dc2626',
              marginBottom: 12
            }}>
              <span className="pd-stock-dot" style={{
                background: stock>0?(stock<=5?'#d97706':'#10b981'):'#ef4444',
                boxShadow: `0 0 5px ${stock>0?(stock<=5?'#d97706':'#10b981'):'#ef4444'}`,
                animation: stock<=5 && stock>0 ? 'pdStockPulse 2s infinite' : 'none',
              }}/>
              {stockSt.text}
              {stock > 0 && stock <= 10 && <span style={{fontWeight:500,opacity:.7,textTransform:'none',letterSpacing:0}}> — only {stock} left</span>}
            </div>

            {/* name */}
            <h1 className="pd-name">{p.name}</h1>

            {/* rating */}
            <div className="pd-rat-row">
              <div className="pd-stars">
                {Array.from({length:5}).map((_,i) => (
                  <svg key={i} className="pd-star" viewBox="0 0 24 24">
                    <path d="M12 .587l3.668 7.431L24 9.748l-6 5.848L19.335 24 12 19.771 4.665 24 6 15.596 0 9.748l8.332-1.73z"
                      fill={i < Math.round(p.ratingAvg||0) ? '#f59e0b' : '#e5e7eb'}/>
                  </svg>
                ))}
              </div>
              <span className="pd-rat-ct">{Number(p.ratingAvg||0).toFixed(1)} ({p.ratingCount||0} ratings)</span>
              {authed && <button className="pd-rev-btn" onClick={() => setReviewOpen(true)}>Write a Review</button>}
            </div>

            {/* VARIANTS */}
            {Array.isArray(p.variants) && p.variants.length > 0 && (
              <div className="pd-variants">
                {variantAttrs.map(attrKey => {
                  const options = variantOpts(attrKey)
                  if (!options.length) return null
                  return (
                    <div key={attrKey} className="pd-var-sec">
                      <div className="pd-var-lbl" style={{ textTransform: 'capitalize' }}>{attrKey}</div>
                      <div className="pd-var-opts">
                        {options.map((opt, i) => {
                          const enabled = isOptEnabled(attrKey, opt)
                          const on = selected[attrKey] === opt
                          return (
                            <button 
                              key={i} 
                              className={`pd-var-btn${on ? ' on' : ''}${!enabled ? ' disabled' : ''}`}
                              onClick={() => enabled && setSelected(prev => ({ ...prev, [attrKey]: opt }))}
                              title={!enabled ? 'Out of Stock / Unavailable' : ''}
                            >
                              {opt}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
                {matchedVariant && <div className="pd-sku">SKU: {matchedVariant.sku || '—'}</div>}
              </div>
            )}

            {/* PRICE BLOCK */}
            <div className="pd-price-block">
              {authed ? (
                <>
                  <div className="pd-price-row">
                    <div className="pd-price-main">
                      ₹{effPrice.toLocaleString()}<span className="pd-unit">/unit</span>
                    </div>
                    {mrp > 0 && <span className="pd-price-mrp">MRP ₹{mrp.toLocaleString()}</span>}
                    {unitSave > 0 && <span className="pd-price-save">Save ₹{unitSave.toLocaleString()}/unit</span>}
                    {p.priceTrend !== undefined && (
                      <div className={`pd-price-trend ${p.priceTrend === 0 ? 'pd-trend-down' : 'pd-trend-up'}`}>
                        <svg width="11" height="11" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                          {p.priceTrend === 0
                            ? <path strokeLinecap="round" strokeLinejoin="round" d="M7 13l5 5 5-5M12 18V6"/>
                            : <path strokeLinecap="round" strokeLinejoin="round" d="M7 11l5-5 5 5M12 6v12"/>}
                        </svg>
                        {p.priceTrend === 0 ? 'Price Drop' : 'Trending Up'}
                      </div>
                    )}
                  </div>
                  <div className="pd-price-gst">Inclusive of {gstRate}% GST</div>

                  {/* qty */}
                  <div className="pd-qty-row">
                    <div className="pd-qty">
                      <button className="pd-qty-btn"
                        disabled={qty <= Math.max(1, Number(p.minOrderQty||1))}
                        onClick={() => setQty(q => Math.max(Math.max(1, Number(p.minOrderQty||1)), q - 1))}>−</button>
                      <div className="pd-qty-val">{qty}</div>
                      <button className="pd-qty-btn" onClick={() => setQty(q => q + 1)}>+</button>
                    </div>
                    {savingsTotal > 0 && (
                      <span className="pd-save-tag">
                        <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        Saving ₹{savingsTotal.toLocaleString()} total
                      </span>
                    )}
                    {sortedAsc.length > 0 && qty < minTierQty && (
                      <span className="pd-mintier-tag">Min {minTierQty} units for bulk price</span>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <Link to="/login" className="pd-price-mask" onClick={e => e.stopPropagation()}>
                    <span className="pd-mask-rupee">₹</span>
                    <span className="pd-mask-stars">*****</span>
                    <svg className="pd-mask-eye" width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    </svg>
                  </Link>
                  <div className="pd-mask-hint">🔒 Login to view B2B wholesale price</div>
                </>
              )}
            </div>

            {/* DELIVERY PANEL */}
            <div className="pd-delivery">
              <div className="pd-delivery-head">
                <div className="pd-delivery-head-left">
                  <div className="pd-del-ico">
                    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                    </svg>
                  </div>
                  <div>
                    <div className="pd-del-label">Express Dispatch</div>
                    <div className="pd-del-countdown">
                      {String(countdown.h).padStart(2,'0')}:{String(countdown.m).padStart(2,'0')}:{String(countdown.s).padStart(2,'0')}
                    </div>
                  </div>
                </div>
                <div>
                  <div className="pd-del-ships-lbl">Ships</div>
                  <div className="pd-del-ships-val">{new Date().getHours() < 18 ? 'Today' : 'Tomorrow'}</div>
                </div>
              </div>

              <div className="pd-delivery-body">
                {kycLoading ? (
                  <div style={{display:'flex',alignItems:'center',gap:10}}>
                    <div style={{width:32,height:32,borderRadius:9,background:'#f5f3ff',animation:'pdFadeIn .5s ease infinite alternate'}}/>
                    <div style={{flex:1}}>
                      <div style={{height:8,background:'#f5f3ff',borderRadius:6,width:'40%',marginBottom:6}}/>
                      <div style={{height:10,background:'#f5f3ff',borderRadius:6,width:'60%'}}/>
                    </div>
                  </div>
                ) : kycData?.pincode ? (
                  <>
                    <div className="pd-del-addr">
                      <div className="pd-del-addr-left">
                        <div className="pd-del-addr-ico">
                          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                          </svg>
                        </div>
                        <div>
                          <div style={{fontSize:9,fontWeight:700,letterSpacing:'.14em',textTransform:'uppercase',color:'#9ca3af'}}>Shipping to Business</div>
                          <div style={{fontSize:13,fontWeight:800,color:'#1e1b2e',marginTop:2}}>{kycData.city||'Your Hub'}, {pincode}</div>
                        </div>
                      </div>
                      <button className="pd-del-change" onClick={() => { setKycData(null); setPincode(''); setDeliveryDate(null) }}>Change</button>
                    </div>
                    {deliveryDate && (
                      <div className="pd-del-result" style={{marginTop:12}}>
                        <div className="pd-del-res-ico">
                          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                          </svg>
                        </div>
                        <div>
                          <div className="pd-del-res-lbl">Estimated Delivery</div>
                          <div className="pd-del-res-date">by {deliveryDate}</div>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div style={{fontSize:9,fontWeight:700,letterSpacing:'.16em',textTransform:'uppercase',color:'#9ca3af',marginBottom:10}}>Check Delivery Availability</div>
                    <form className="pd-del-pinput" onSubmit={checkDelivery}>
                      <input
                        className="pd-del-inp" type="text" maxLength="6"
                        placeholder="Enter 6-digit Pincode"
                        value={pincode}
                        onChange={e => setPincode(e.target.value.replace(/\D/g,''))}
                      />
                      <button type="submit" className="pd-del-check">Check</button>
                    </form>
                    {deliveryDate && (
                      <div className="pd-del-result">
                        <div className="pd-del-res-ico">
                          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                        </div>
                        <div>
                          <div className="pd-del-res-lbl">Estimated Delivery</div>
                          <div className="pd-del-res-date">by {deliveryDate}</div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* CTA */}
            <div className="pd-cta">
              <button
                className="pd-btn-primary"
                disabled={!authed || !isAvailable || (variantAttrs.length > 0 && !matchedVariant) || (sortedAsc.length > 0 && qty < minTierQty)}
                onClick={handleAddToCart}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M7 6h13l-1.2 7H9.2L7 6Z" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="10" cy="19" r="1.4" fill="currentColor"/>
                  <circle cx="17" cy="19" r="1.4" fill="currentColor"/>
                </svg>
                {!authed ? 'Login to Buy' : !isAvailable ? 'Out of Stock' : (variantAttrs.length > 0 && !matchedVariant) ? 'Select Options' : (sortedAsc.length > 0 && qty < minTierQty) ? `Min Order ${minTierQty}` : 'Add to Cart'}
              </button>
            </div>

            {/* TRUST STRIP */}
            <div className="pd-trust">
              {[['🔒','Secure Payment'],['✅','Verified Genuine'],['🧾','GST Invoice'],['⚡','Fast Dispatch'],['📦','Pan India Delivery']].map(([ico,t]) => (
                <div key={t} className="pd-trust-item"><span style={{fontSize:13}}>{ico}</span><span>{t}</span></div>
              ))}
            </div>

            {/* ═══════════════════════════════
                BULK PRICING TABLE
            ═══════════════════════════════ */}
            {authed && sortedAsc.length > 0 && (
              <div className="pd-card" style={{marginTop:22}}>
                <div className="pd-card-head">
                  <div className="pd-card-head-ico">
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                    </svg>
                  </div>
                  <div>
                    <div className="pd-card-head-label">Wholesale Pricing</div>
                    <div className="pd-card-head-title">Bulk Purchase Tiers</div>
                  </div>
                </div>
                <div style={{overflowX:'auto'}}>
                  <table className="pd-bulk-table">
                    <thead>
                      <tr>
                        <th>
                          <div style={{display:'flex',alignItems:'center',gap:6}}>
                            <svg width="10" height="10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/></svg>
                            Qty Range
                          </div>
                        </th>
                        <th>
                          <div style={{display:'flex',alignItems:'center',gap:6}}>
                            <svg width="10" height="10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2" strokeLinecap="round"/></svg>
                            Price / Unit
                          </div>
                        </th>
                        <th>Your Savings</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedAsc.map((t, idx) => {
                        const next    = sortedAsc[idx + 1]
                        const from    = t.quantity
                        const to      = next ? next.quantity - 1 : null
                        const label   = to ? `${from} – ${to} units` : `${from}+ units`
                        const tierEff = Math.max(0, basePrice - Number(t.priceReduction||0))
                        const perSave = Math.max(0, basePrice - tierEff)
                        const isHit   = qty >= from && (!next || qty < next.quantity)
                        return (
                          <tr key={idx} className={isHit ? 'pd-tier-hit' : ''}>
                            <td>
                              <div className="pd-tier-qty">
                                {label}
                                {isHit && <span className="pd-tier-current">✓ Active</span>}
                              </div>
                            </td>
                            <td>
                              <div className="pd-tier-price">₹{tierEff.toLocaleString()}</div>
                            </td>
                            <td>
                              <span className={`pd-tier-save ${isHit ? 'active' : 'normal'}`}>
                                {isHit && <svg width="10" height="10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>}
                                ₹{perSave.toLocaleString()} / unit
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Progress to next tier */}
                {(() => {
                  const nextTier = sortedAsc.find(t => qty < Number(t.quantity))
                  if (!nextTier) return (
                    <div style={{padding:'12px 16px',background:'rgba(5,150,105,.05)',borderTop:'1px solid rgba(5,150,105,.12)',display:'flex',alignItems:'center',gap:8}}>
                      <span style={{fontSize:16}}>🎉</span>
                      <div style={{fontSize:12,fontWeight:700,color:'#059669'}}>You're getting the best bulk price!</div>
                    </div>
                  )
                  const needed = Number(nextTier.quantity) - qty
                  const prevTier = sortedDesc.find(t => qty >= Number(t.quantity))
                  const from = prevTier ? Number(prevTier.quantity) : 1
                  const progress = Math.min(100, ((qty - from) / (Number(nextTier.quantity) - from)) * 100)
                  const nextEff = Math.max(0, basePrice - Number(nextTier.priceReduction||0))
                  const extraSave = Math.max(0, effPrice - nextEff)
                  return (
                    <div className="pd-bulk-progress">
                      <div className="pd-bulk-prog-label">
                        <span>Add <span>{needed} more</span> units to unlock ₹{nextEff.toLocaleString()}/unit</span>
                        <span>Save extra ₹{extraSave}/unit</span>
                      </div>
                      <div className="pd-bulk-prog-bar">
                        <div className="pd-bulk-prog-fill" style={{width:`${progress}%`}}/>
                      </div>
                    </div>
                  )
                })()}
              </div>
            )}

            {/* HIGHLIGHTS */}
            {Array.isArray(p.highlights) && p.highlights.length > 0 && (
              <div className="pd-card" style={{marginTop:16}}>
                <div className="pd-card-head">
                  <div className="pd-card-head-ico">
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                    </svg>
                  </div>
                  <div>
                    <div className="pd-card-head-label">Quick Facts</div>
                    <div className="pd-card-head-title">Product Highlights</div>
                  </div>
                </div>
                <div className="pd-card-body">
                  <div className="pd-highlights">
                    {p.highlights.map((h,i) => (
                      <div key={i} className="pd-hl-item">
                        <span className="pd-hl-dot"/>
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* DESCRIPTION */}
            {p.description && (
              <div className="pd-card" style={{marginTop:16}}>
                <div className="pd-card-head">
                  <div className="pd-card-head-ico">
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h12"/>
                    </svg>
                  </div>
                  <div>
                    <div className="pd-card-head-label">Details</div>
                    <div className="pd-card-head-title">About This Product</div>
                  </div>
                </div>
                <div className="pd-card-body">
                  <p className="pd-desc">{p.description}</p>
                </div>
              </div>
            )}

            {/* SIMILAR PRODUCTS */}
            {similar.length > 0 && (
              <div className="pd-card" style={{marginTop:16}}>
                <div className="pd-card-head">
                  <div className="pd-card-head-ico">
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                    </svg>
                  </div>
                  <div>
                    <div className="pd-card-head-label">More Like This</div>
                    <div className="pd-card-head-title">Similar Products</div>
                  </div>
                </div>
                <div className="pd-card-body" style={{padding:'12px 16px 18px'}}>
                  <div className="pd-sim-scroll">
                    {similar.slice(0,8).map(item => (
                      <div key={item._id} className="pd-sim-item" onClick={() => navigate(`/products/${item._id}`)}>
                        <div className="pd-sim-img">
                          {item.images?.[0]?.url
                            ? <img src={item.images[0].url} alt={item.name}/>
                            : <span style={{fontSize:24,opacity:.2}}>📦</span>}
                        </div>
                        <div className="pd-sim-body">
                          <div className="pd-sim-cat">{item.category?.name || item.category || 'General'}</div>
                          <div className="pd-sim-name">{item.name}</div>
                          <div className="pd-sim-price">
                            {authed && item.price != null ? `₹${Number(item.price).toLocaleString()}` : 'Login'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>{/* end info panel */}
        </div>{/* end grid */}

        {/* ══ BELOW — RECOMMENDED ══ */}
        {recItems.length > 0 && (
          <div className="pd-below" style={{padding:'40px 0 0'}}>
            <div className="pd-below-header">
              <div>
                <div className="pd-below-eyebrow">Frequently Bought Together</div>
                <div className="pd-below-title">Recommended For You</div>
              </div>
              <Link to="/products" className="pd-view-all">
                View All
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"/>
                </svg>
              </Link>
            </div>
            <div className="pd-rec-scroll">
              {recItems.map(item => (
                <div key={item._id} className="pd-rec-item" onClick={() => navigate(`/products/${item._id}`)}>
                  <div className="pd-rec-img">
                    {item.images?.[0]?.url
                      ? <img src={item.images[0].url} alt={item.name}/>
                      : <span style={{fontSize:32,opacity:.2}}>📦</span>}
                  </div>
                  <div className="pd-rec-body">
                    <div className="pd-rec-cat">{item.category?.name || item.category || 'General'}</div>
                    <div className="pd-rec-name">{item.name}</div>
                    <div className="pd-rec-price">
                      {authed && item.price != null ? `₹${Number(item.price).toLocaleString()}` : 'Login to view'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>{/* end wrap */}

      {/* ══ LIGHTBOX ══ */}
      {lightbox && (
        <div className="pd-lightbox" onClick={() => setLightbox(false)}>
          <div className="pd-lb-inner" onClick={e => e.stopPropagation()}>
            <img src={currentImg} alt={p.name} className="pd-lb-img"/>
            <button className="pd-lb-close" onClick={() => setLightbox(false)}>✕</button>
            <div className="pd-lb-nav">
              <button className="pd-lb-navbtn" onClick={() => setActiveImg(i => Math.max(0,i-1))} disabled={activeImg<=0}>← Prev</button>
              <div className="pd-lb-thumbs">
                {imgs.map((img,i) => (
                  <button key={i} className={`pd-lb-thumb${i===activeImg?' on':''}`} onClick={() => setActiveImg(i)}>
                    <img src={img.url} alt={`${p.name} ${i+1}`}/>
                  </button>
                ))}
              </div>
              <button className="pd-lb-navbtn" onClick={() => setActiveImg(i => Math.min(imgs.length-1,i+1))} disabled={activeImg>=imgs.length-1}>Next →</button>
            </div>
          </div>
        </div>
      )}

      {/* ══ REVIEW MODAL ══ */}
      {reviewOpen && (
        <div className="pd-modal-back" onClick={() => setReviewOpen(false)}>
          <div className="pd-modal" onClick={e => e.stopPropagation()}>
            <div className="pd-modal-title">Your Feedback</div>
            <div className="pd-modal-stars">
              {Array.from({length:5}).map((_,i) => (
                <button key={i} className="pd-modal-star"
                  onMouseEnter={() => setHoverStar(i+1)}
                  onMouseLeave={() => setHoverStar(0)}
                  onClick={() => setMyRating(i+1)}>
                  <svg width="34" height="34" viewBox="0 0 24 24">
                    <path d="M12 .587l3.668 7.431L24 9.748l-6 5.848L19.335 24 12 19.771 4.665 24 6 15.596 0 9.748l8.332-1.73z"
                      fill={i < (hoverStar||myRating) ? '#f59e0b' : '#e5e7eb'}/>
                  </svg>
                </button>
              ))}
            </div>
            <textarea className="pd-modal-ta" rows="4" placeholder="Share your experience (optional)…"
              value={myComment} onChange={e => setMyComment(e.target.value)}/>
            <div className="pd-modal-btns">
              <button className="pd-modal-cancel" onClick={() => setReviewOpen(false)}>Cancel</button>
              <button className="pd-modal-submit" onClick={async () => {
                if (myRating < 1) return
                try {
                  const { data } = await api.post(`/api/products/${id}/reviews`, { rating:myRating, comment:myComment })
                  setP(prev => ({...prev, ratingAvg:data.ratingAvg, ratingCount:data.ratingCount}))
                  setReviewOpen(false); setMyRating(0); setMyComment('')
                } catch(e) { alert(e?.response?.data?.error || 'Failed to submit') }
              }}>Submit Review</button>
            </div>
          </div>
        </div>
      )}

      {/* ══ RECOMMENDATION MODAL ══ */}
      <RecommendationModal
        open={recOpen} items={recItems}
        onClose={() => setRecOpen(false)}
        onAddToCart={async (item) => {
          await addToCart(item)
          const updated = recItems.filter(i => (i._id||i.id) !== (item._id||item.id))
          setRecItems(updated)
          if (updated.length === 0) setRecOpen(false)
        }}
      />

      {/* ══ MOBILE FLOATING BAR ══ */}
      <div className="pd-mob-bar">
        <div className="pd-mob-price">
          <div className="pd-mob-price-lbl">Wholesale Price</div>
          <div className="pd-mob-price-val">
            {authed ? `₹${effPrice.toLocaleString()}` : '₹ ****'}
          </div>
        </div>
        <button
          className="pd-btn-primary"
          style={{flex:2,padding:'12px 20px',borderRadius:13,minWidth:'auto'}}
          disabled={!authed || !isAvailable || (variantAttrs.length > 0 && !matchedVariant) || (sortedAsc.length > 0 && qty < minTierQty)}
          onClick={handleAddToCart}
        >
          {!authed ? '🔒 Login' : !isAvailable ? 'Out of Stock' : (variantAttrs.length > 0 && !matchedVariant) ? 'Select' : 'Add to Cart'}
        </button>
      </div>

    </div>
    </>
  )
}