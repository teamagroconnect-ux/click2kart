import React, { useEffect, useMemo, useState, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import api from '../../lib/api'
import { getCloudinaryUrl } from '../../lib/cloudinary'
import { useCart, getStockStatus } from '../../lib/CartContext'
import { setSEO } from '../../shared/lib/seo.js'
import RecommendationModal from '../../components/RecommendationModal'

/* ══════════════════════════════════════════
   CATALOGUE  –  Click2Kart B2B
══════════════════════════════════════════ */
export default function Catalogue({ initialBrand, brandName }) {
  const { addToCart } = useCart()
  const authed   = !!localStorage.getItem('token')
  const navigate = useNavigate()
  const location = useLocation()

  const [q,           setQ]           = useState('')
  const [sug,         setSug]         = useState([])
  const [showSug,     setShowSug]     = useState(false)
  const [items,       setItems]       = useState([])
  const [groupedItems, setGroupedItems] = useState([])
  const [total,       setTotal]       = useState(0)
  const [page,        setPage]        = useState(1)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [brands,      setBrands]      = useState([])
  const [categories,  setCategories]  = useState([])
  const [subcategories, setSubcategories] = useState([])
  const [brand,       setBrand]       = useState(initialBrand || '')
  const [category,    setCategory]    = useState('')
  const [subCategory, setSubCategory] = useState('')
  const [browsePath,  setBrowsePath]  = useState(initialBrand ? 'brand' : null)
  const [viewMode,    setViewMode]    = useState(initialBrand ? 'CATEGORIES' : 'PRODUCTS')
  const [sort,        setSort]        = useState('NEW')
  const [minPrice,    setMinPrice]    = useState('')
  const [maxPrice,    setMaxPrice]    = useState('')
  const [loading,     setLoading]     = useState(false)
  const [recOpen,     setRecOpen]     = useState(false)
  const [recItems,    setRecItems]    = useState([])
  const searchRef = useRef(null)
  const limit = 12

  const load = async (p = 1) => {
    setLoading(true)
    try {
      if (viewMode === 'PRODUCTS' || q) {
        const { data } = await api.get('/api/products', {
          params: { q, page: p, limit, brand: brand || undefined, category: category || undefined, subCategory: subCategory || undefined },
        })
        if (p === 1) setItems(data.items)
        else setItems(prev => [...prev, ...data.items])
        setTotal(data.total); setPage(p)
      } else if (viewMode === 'GROUPED' || (viewMode === 'START' && !browsePath)) {
        // Grouped mode for Brands/Categories pages
        const { data } = await api.get('/api/products/grouped', {
          params: { brand: brand || undefined, category: category || undefined }
        })
        setGroupedItems(data || [])
      }
    } finally { setLoading(false) }
  }

  useEffect(() => {
    if (q) setViewMode('PRODUCTS')
    else if (!browsePath) setViewMode('PRODUCTS')
    else if (!brand && !category) {
      setViewMode('PRODUCTS')
      // No need to setBrowsePath here to avoid loop, it's already null or will be set by clicks
    }
    else if (browsePath === 'brand') {
      if (!brand) setViewMode('BRANDS')
      else if (!category) setViewMode('GROUPED') // Show products grouped by category for this brand
      else if (!subCategory) setViewMode('SUBCATEGORIES')
      else setViewMode('PRODUCTS')
    } else if (browsePath === 'category') {
      if (!category) setViewMode('PRODUCTS') // Show all products in category mode if no category selected
      else if (!subCategory) setViewMode('SUBCATEGORIES')
      else setViewMode('PRODUCTS')
    }
  }, [q, browsePath, brand, category, subCategory])

  useEffect(() => { load(1) }, [q, brand, category, subCategory, viewMode])
  
  useEffect(() => {
    api.get('/api/brands', { params: { active: true } }).then(({ data }) => setBrands(data || []))
    // Fetch all active categories by default
    api.get('/api/categories', { params: { active: true } }).then(({ data }) => setCategories(data || []))
  }, [])

  useEffect(() => {
    if (brand && browsePath === 'brand') {
      api.get('/api/categories', { params: { brand, active: true } }).then(({ data }) => setCategories(data || []))
    } else if (browsePath === 'category') {
      api.get('/api/categories', { params: { active: true } }).then(({ data }) => setCategories(data || []))
    }
  }, [brand, browsePath])
  
  useEffect(() => {
    if (category) {
      api.get('/api/subcategories', { params: { category: category, active: true } }).then(({ data }) => setSubcategories(data || []))
    } else {
      setSubcategories([])
      setSubCategory('')
    }
  }, [category])
  useEffect(() => {
    const cat = new URLSearchParams(location.search).get('category')
    if (cat) setCategory(cat)
  }, [location.search])
  useEffect(() => {
    let t
    if (q.trim().length >= 2) {
      t = setTimeout(async () => {
        try {
          const { data } = await api.get('/api/products/suggest', { params: { q } })
          setSug(data || []); setShowSug(true)
        } catch { setSug([]) }
      }, 250)
    } else { setSug([]); setShowSug(false) }
    return () => t && clearTimeout(t)
  }, [q])
  useEffect(() => {
    const title = category ? `${category} · Wholesale | Click2Kart`
      : q ? `Search: ${q} | Click2Kart` : 'B2B Collection | Click2Kart'
    setSEO(title, 'Discover quality wholesale electronics with exclusive B2B pricing, GST billing, and bulk discounts.')
  }, [q, category])

  const filteredSorted = useMemo(() => {
    const getMinPrice = (p) => {
      if (!Array.isArray(p.variants) || p.variants.length === 0) return p.price || 0;
      const activeVariants = p.variants.filter(v => v.isActive !== false && v.price > 0);
      if (activeVariants.length === 0) return p.price || 0;
      return Math.min(...activeVariants.map(v => v.price));
    };

    let list = [...items]
    if (authed) {
      const mn = Number(minPrice), mx = Number(maxPrice)
      if (!isNaN(mn) && minPrice !== '') list = list.filter(p => getMinPrice(p) >= mn)
      if (!isNaN(mx) && maxPrice !== '') list = list.filter(p => getMinPrice(p) <= mx)
      
      if (sort === 'PRICE_LOW')  list.sort((a, b) => getMinPrice(a) - getMinPrice(b))
      if (sort === 'PRICE_HIGH') list.sort((a, b) => getMinPrice(b) - getMinPrice(a))
    }
    if (sort === 'NEW') list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    return list
  }, [items, minPrice, maxPrice, sort, authed])

  const totalPages = Math.max(1, Math.ceil(total / limit))

  /* ── SORT OPTIONS ── */
  const sortOpts = [
    { v: 'NEW',        l: 'Newest First',     ico: '✨' },
    ...(authed ? [
      { v: 'PRICE_LOW',  l: 'Price: Low → High', ico: '💰' },
      { v: 'PRICE_HIGH', l: 'Price: High → Low', ico: '💎' },
    ] : [])
  ]

  if (loading && items.length === 0) return (
    <div className="ct">
      <style>{`
        .ct { font-family: 'DM Sans', system-ui, sans-serif; background: #f5f3ff; min-height: 100vh; position: relative; overflow-x: hidden; padding-top: env(safe-area-inset-top, 0px); }
        .ct-skel-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; padding: 12px; }
        @media (min-width: 640px) { .ct-skel-grid { grid-template-columns: repeat(3, 1fr); gap: 20px; padding: 20px; } }
        @media (min-width: 1024px) { .ct-skel-grid { grid-template-columns: repeat(4, 1fr); } }
        @media (min-width: 1280px) { .ct-skel-grid { grid-template-columns: repeat(5, 1fr); } }
        .ct-skel-card { background: white; border-radius: 20px; overflow: hidden; border: 1px solid rgba(124,58,237,.06); height: 320px; position: relative; }
        .ct-skel-img { height: 180px; background: #f9fafb; position: relative; overflow: hidden; }
        .ct-skel-body { padding: 12px; display: flex; flex-direction: column; gap: 10px; }
        .ct-skel-line { height: 12px; background: #f3f4f6; border-radius: 6px; position: relative; overflow: hidden; }
        .ct-skel-shim { position: absolute; inset: 0; background: linear-gradient(90deg, transparent, rgba(124,58,237,0.05), transparent); transform: translateX(-100%); animation: ctSkelShim 1.5s infinite; }
        @keyframes ctSkelShim { 100% { transform: translateX(100%); } }
      `}</style>
      <div className="ct-skel-grid">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="ct-skel-card">
            <div className="ct-skel-img"><div className="ct-skel-shim"/></div>
            <div className="ct-skel-body">
              <div className="ct-skel-line" style={{width:'40%'}}><div className="ct-skel-shim"/></div>
              <div className="ct-skel-line" style={{width:'90%'}}><div className="ct-skel-shim"/></div>
              <div className="ct-skel-line" style={{width:'70%'}}><div className="ct-skel-shim"/></div>
              <div className="ct-skel-line" style={{width:'50%',marginTop:'auto',height:20}}><div className="ct-skel-shim"/></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <>
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800&display=swap');
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

      /* ─── ROOT ─── */
      .ct {
        font-family: 'DM Sans', system-ui, sans-serif;
        background: #f5f3ff;
        min-height: 100vh;
        color: #1e1b2e;
        overflow-x: hidden;
        position: relative;
      }

      /* grid overlay */
      .ct::before {
        content: '';
        position: fixed; inset: 0;
        pointer-events: none; z-index: 0;
        background-image:
          linear-gradient(rgba(139,92,246,.035) 1px, transparent 1px),
          linear-gradient(90deg, rgba(139,92,246,.035) 1px, transparent 1px);
        background-size: 60px 60px;
      }

      /* ambient glows */
      .ct-glow1 {
        position: fixed; top: -200px; left: -160px;
        width: 600px; height: 600px; border-radius: 50%;
        background: radial-gradient(ellipse, rgba(139,92,246,.11), transparent 65%);
        pointer-events: none; z-index: 0;
      }
      .ct-glow2 {
        position: fixed; bottom: -200px; right: -160px;
        width: 500px; height: 500px; border-radius: 50%;
        background: radial-gradient(ellipse, rgba(99,102,241,.08), transparent 65%);
        pointer-events: none; z-index: 0;
      }

      /* ─── TOP-BAR (MOBILE) ─── */
      .ct-topbar-mob {
        position: sticky; top: 0; z-index: 50;
        background: rgba(245,243,255,.92);
        backdrop-filter: blur(18px);
        border-bottom: 1px solid rgba(139,92,246,.12);
        box-shadow: 0 2px 24px rgba(124,58,237,.07);
      }
      @media (min-width: 1024px) { .ct-topbar-mob { display: none; } }

      .ct-searchbar-wrap { padding: 12px 14px 0; }

      /* THE PREMIUM SEARCH BAR */
      .ct-searchbar {
        display: flex; align-items: center; gap: 0;
        background: white;
        border: 1.5px solid rgba(124,58,237,.22);
        border-radius: 16px;
        box-shadow: 0 2px 18px rgba(124,58,237,.08), inset 0 1px 0 rgba(255,255,255,.9);
        overflow: hidden;
        transition: border-color .2s, box-shadow .2s;
        position: relative;
      }
      .ct-searchbar:focus-within {
        border-color: rgba(124,58,237,.55);
        box-shadow: 0 0 0 4px rgba(124,58,237,.1), 0 4px 24px rgba(124,58,237,.12);
      }
      .ct-searchbar-ico {
        flex-shrink: 0; padding: 0 0 0 14px;
        color: #7c3aed; display: flex; align-items: center;
        pointer-events: none;
      }
      .ct-searchbar input {
        flex: 1; border: none; outline: none; background: none;
        padding: 13px 12px;
        font-size: 14px; font-weight: 500;
        color: #1e1b2e; font-family: 'DM Sans', sans-serif;
      }
      .ct-searchbar input::placeholder { color: #c4b5fd; }
      .ct-searchbar-kbd {
        flex-shrink: 0; margin-right: 10px;
        padding: 3px 7px; border-radius: 6px;
        background: rgba(139,92,246,.07); border: 1px solid rgba(139,92,246,.15);
        font-size: 9px; font-weight: 700; letter-spacing: .08em;
        color: #9ca3af; white-space: nowrap;
      }
      .ct-searchbar-clear {
        flex-shrink: 0; margin-right: 10px;
        width: 26px; height: 26px; border-radius: 8px; border: none;
        background: rgba(139,92,246,.09); color: #7c3aed;
        display: flex; align-items: center; justify-content: center;
        cursor: pointer; transition: all .15s;
      }
      .ct-searchbar-clear:hover { background: rgba(139,92,246,.18); }

      /* suggest dropdown (YT STYLE) */
      .ct-suggest {
        position: absolute; top: calc(100% + 8px); left: 0; right: 0; z-index: 200;
        background: white; border-radius: 18px; overflow: hidden;
        box-shadow: 0 16px 48px rgba(0,0,0,.15);
        border: 1.5px solid rgba(124,58,237,.1); padding: 8px 0;
        animation: ctFadeUp .18s ease both;
      }
      .ct-suggest-item {
        display: flex; align-items: center; gap: 14px;
        padding: 10px 18px; cursor: pointer;
        transition: background .12s;
      }
      .ct-suggest-item:hover, .ct-suggest-item.act { background: #f5f3ff; }
      .ct-sug-ico { color: #9ca3af; flex-shrink: 0; display: flex; align-items: center; }
      .ct-sug-thumb {
        width: 34px; height: 34px; border-radius: 8px;
        background: #f9f7ff; border: 1px solid rgba(139,92,246,.1);
        overflow: hidden; flex-shrink: 0;
        display: flex; align-items: center; justify-content: center;
      }
      .ct-sug-thumb img { width: 100%; height: 100%; object-fit: contain; padding: 4px; }
      .ct-sug-name { font-size: 14px; font-weight: 600; color: #1e1b2e; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .ct-sug-cat { font-size: 10px; font-weight: 700; color: #7c3aed; text-transform: uppercase; letter-spacing: .04em; margin-top: 1px; }
      .ct-sug-fill { color: #c4b5fd; margin-left: auto; flex-shrink: 0; display: flex; align-items: center; transform: rotate(-45deg); transition: transform .15s, color .15s; }
      .ct-suggest-item:hover .ct-sug-fill { color: #7c3aed; transform: rotate(-45deg) scale(1.1); }

      /* category chips */
      .ct-chips { display: flex; gap: 7px; padding: 10px 14px 13px; overflow-x: auto; scrollbar-width: none; }
      .ct-chips::-webkit-scrollbar { display: none; }
      .ct-chip {
        flex-shrink: 0; padding: 6px 15px; border-radius: 100px;
        font-size: 11px; font-weight: 700; letter-spacing: .05em;
        border: 1.5px solid rgba(124,58,237,.18);
        background: white; color: #6b7280; cursor: pointer; transition: all .2s;
      }
      .ct-chip.on { background: #7c3aed; border-color: #7c3aed; color: white; box-shadow: 0 4px 12px rgba(124,58,237,.3); }
      .ct-chip:not(.on):hover { border-color: rgba(124,58,237,.4); color: #7c3aed; }

      /* ─── TOP-BAR (DESKTOP) ─── */
      .ct-topbar-desk {
        display: none;
        position: sticky; top: 0; z-index: 50;
        background: rgba(245,243,255,.93);
        backdrop-filter: blur(18px);
        border-bottom: 1px solid rgba(139,92,246,.1);
        box-shadow: 0 2px 24px rgba(124,58,237,.06);
      }
      @media (min-width: 1024px) { .ct-topbar-desk { display: block; } }
      .ct-desk-inner {
        max-width: 1280px; margin: 0 auto; padding: 16px 32px;
        display: flex; align-items: center; gap: 24px;
      }
      .ct-brand { flex-shrink: 0; }
      .ct-brand-ey {
        font-size: 9px; font-weight: 700; letter-spacing: .22em; text-transform: uppercase;
        color: #7c3aed; display: flex; align-items: center; gap: 6px; margin-bottom: 3px;
      }
      .ct-brand-dot {
        width: 5px; height: 5px; border-radius: 50%; background: #7c3aed;
        animation: ctPulse 2s ease infinite;
      }
      .ct-brand-title {
        font-family: 'Bebas Neue', sans-serif; font-size: 26px;
        color: #1e1b2e; letter-spacing: .03em; line-height: 1;
      }
      .ct-brand-title span { color: #7c3aed; }
      .ct-desk-search { flex: 1; max-width: 520px; position: relative; }
      .ct-sort-wrap { position: relative; flex-shrink: 0; }
      .ct-sort-sel {
        appearance: none; background: white;
        border: 1.5px solid rgba(124,58,237,.2); border-radius: 14px;
        color: #1e1b2e; font-size: 13px; font-weight: 700;
        padding: 11px 40px 11px 16px; outline: none;
        cursor: pointer; font-family: 'DM Sans', sans-serif;
        box-shadow: 0 2px 12px rgba(124,58,237,.06);
        transition: border-color .2s, box-shadow .2s;
      }
      .ct-sort-sel:focus { border-color: rgba(124,58,237,.45); box-shadow: 0 0 0 3px rgba(124,58,237,.09); }
      .ct-sort-arr { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); pointer-events: none; color: #7c3aed; }

      /* ─── MAIN LAYOUT ─── */
      .ct-layout { max-width: 1280px; margin: 0 auto; position: relative; z-index: 1; }
      @media (min-width: 1024px) { .ct-layout { display: grid; grid-template-columns: 268px 1fr; } }

      /* ─── SIDEBAR ─── */
      .ct-sidebar {
        display: none;
        background: rgba(255,255,255,.65); backdrop-filter: blur(10px);
        border-right: 1px solid rgba(124,58,237,.08);
        min-height: calc(100vh - 68px);
      }
      @media (min-width: 1024px) { .ct-sidebar { display: block; } }
      .ct-sidebar-in {
        position: sticky; top: 68px;
        padding: 24px 18px; display: flex; flex-direction: column; gap: 26px;
        overflow-y: auto; max-height: calc(100vh - 68px);
      }

      .ct-sb-label {
        font-size: 8px; font-weight: 700; letter-spacing: .24em; text-transform: uppercase;
        color: #9ca3af; display: flex; align-items: center; gap: 7px; margin-bottom: 10px;
      }
      .ct-sb-label::before { content: ''; width: 16px; height: 2px; background: rgba(124,58,237,.25); border-radius: 2px; }

      /* sort buttons */
      .ct-sb-sort-btn {
        width: 100%; display: flex; align-items: center; gap: 10px;
        padding: 10px 12px; border-radius: 12px; border: none;
        font-size: 13px; font-weight: 700; color: #6b7280;
        background: transparent; cursor: pointer; text-align: left;
        font-family: 'DM Sans', sans-serif; transition: all .2s;
      }
      .ct-sb-sort-btn:hover { background: rgba(124,58,237,.06); color: #7c3aed; }
      .ct-sb-sort-btn.on { background: #7c3aed; color: white; box-shadow: 0 4px 16px rgba(124,58,237,.3); }
      .ct-sb-sort-ico { width: 34px; height: 34px; border-radius: 9px; background: rgba(124,58,237,.08); display: flex; align-items: center; justify-content: center; font-size: 15px; flex-shrink: 0; transition: background .2s; }
      .ct-sb-sort-btn.on .ct-sb-sort-ico { background: rgba(255,255,255,.2); }

      /* category buttons */
      .ct-sb-cats { max-height: 340px; overflow-y: auto; display: flex; flex-direction: column; gap: 3px; scrollbar-width: thin; scrollbar-color: rgba(124,58,237,.2) transparent; }
      .ct-sb-cat-btn {
        width: 100%; display: flex; align-items: center; gap: 10px;
        padding: 9px 12px; border-radius: 12px; border: none;
        font-size: 13px; font-weight: 600; color: #6b7280;
        background: transparent; cursor: pointer; text-align: left;
        font-family: 'DM Sans', sans-serif; transition: all .2s;
      }
      .ct-sb-cat-btn:hover { background: rgba(124,58,237,.06); color: #7c3aed; }
      .ct-sb-cat-btn.on { background: rgba(124,58,237,.09); color: #7c3aed; border: 1px solid rgba(124,58,237,.2); }
      .ct-sb-cat-img { width: 38px; height: 38px; border-radius: 9px; background: #f5f3ff; border: 1px solid rgba(124,58,237,.1); overflow: hidden; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
      .ct-sb-cat-img img { width: 100%; height: 100%; object-fit: contain; padding: 4px; }
      .ct-sb-cat-check { width: 18px; height: 18px; border-radius: 5px; background: #7c3aed; display: flex; align-items: center; justify-content: center; margin-left: auto; flex-shrink: 0; }

      /* price inputs */
      .ct-price-row { display: flex; gap: 8px; }
      .ct-price-inp-w { position: relative; flex: 1; }
      .ct-price-inp {
        width: 100%; background: white; border: 1.5px solid rgba(124,58,237,.15);
        border-radius: 10px; padding: 10px 10px 10px 22px;
        font-size: 13px; font-weight: 600; color: #1e1b2e;
        outline: none; font-family: 'DM Sans', sans-serif; transition: all .2s;
      }
      .ct-price-inp:focus { border-color: rgba(124,58,237,.45); box-shadow: 0 0 0 3px rgba(124,58,237,.08); }
      .ct-price-inp:disabled { opacity: .4; cursor: not-allowed; }
      .ct-price-pfx { position: absolute; left: 9px; top: 50%; transform: translateY(-50%); font-size: 12px; font-weight: 700; color: #7c3aed; pointer-events: none; }
      .ct-price-lock {
        font-size: 11px; color: #7c3aed; background: rgba(124,58,237,.07);
        border: 1px solid rgba(124,58,237,.15); border-radius: 9px;
        padding: 7px 12px; display: flex; align-items: center; gap: 6px; margin-bottom: 8px;
      }

      /* sidebar stats box */
      .ct-sb-stats {
        background: rgba(124,58,237,.06); border: 1px solid rgba(124,58,237,.12);
        border-radius: 14px; padding: 14px 16px;
      }
      .ct-sb-stat { display: flex; align-items: center; justify-content: space-between; }
      .ct-sb-stat + .ct-sb-stat { margin-top: 6px; }
      .ct-sb-stat-k { font-size: 12px; font-weight: 500; color: #6b7280; }
      .ct-sb-stat-v { font-family: 'Bebas Neue', sans-serif; font-size: 22px; color: #7c3aed; letter-spacing: .03em; }
      .ct-sb-stat-vs { font-size: 12px; font-weight: 700; color: #6b7280; }

      /* ─── MAIN AREA ─── */
      .ct-main { padding: 18px 14px 48px; }
      @media (min-width: 640px)  { .ct-main { padding: 22px 18px 48px; } }
      @media (min-width: 1024px) { .ct-main { padding: 26px 26px 56px; } }

      /* mobile top bar */
      .ct-mob-bar { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; }
      @media (min-width: 1024px) { .ct-mob-bar { display: none; } }
      .ct-filter-btn {
        display: flex; align-items: center; gap: 6px;
        padding: 9px 15px; border-radius: 12px;
        background: white; border: 1.5px solid rgba(124,58,237,.2);
        color: #7c3aed; font-size: 10px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase;
        cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all .2s;
        box-shadow: 0 2px 10px rgba(124,58,237,.07); white-space: nowrap;
      }
      .ct-filter-btn:hover { background: #f5f3ff; }
      .ct-mob-sorts { display: flex; gap: 6px; overflow-x: auto; flex: 1; scrollbar-width: none; }
      .ct-mob-sorts::-webkit-scrollbar { display: none; }
      .ct-mob-sort-chip {
        flex-shrink: 0; padding: 8px 12px; border-radius: 10px;
        font-size: 10px; font-weight: 700;
        border: 1.5px solid rgba(124,58,237,.14);
        background: white; color: #6b7280; cursor: pointer; transition: all .2s;
      }
      .ct-mob-sort-chip.on { background: #7c3aed; border-color: #7c3aed; color: white; box-shadow: 0 3px 10px rgba(124,58,237,.25); }
      .ct-total-pill {
        flex-shrink: 0; padding: 8px 11px; border-radius: 10px;
        background: rgba(124,58,237,.08); border: 1px solid rgba(124,58,237,.14);
        font-size: 10px; font-weight: 700; color: #7c3aed; white-space: nowrap;
      }

      /* desktop result bar */
      .ct-res-bar { display: none; align-items: center; justify-content: space-between; margin-bottom: 20px; }
      @media (min-width: 1024px) { .ct-res-bar { display: flex; } }
      .ct-res-bar b { font-family: 'Bebas Neue', sans-serif; font-size: 26px; color: #7c3aed; letter-spacing: .03em; margin-right: 5px; }
      .ct-res-bar span { font-size: 13px; color: #6b7280; font-weight: 500; }
      .ct-page-info { font-size: 11px; font-weight: 600; color: #9ca3af; }

      /* ─── PRODUCT GRID ─── */
      .ct-grid { display: grid; gap: 13px; grid-template-columns: repeat(2, 1fr); }
      @media (min-width: 540px)  { .ct-grid { grid-template-columns: repeat(3, 1fr); gap: 14px; } }
      @media (min-width: 1280px) { .ct-grid { grid-template-columns: repeat(4, 1fr); } }

      /* ─── SKELETON ─── */
      .ct-skel { background: white; border-radius: 20px; overflow: hidden; border: 1px solid rgba(124,58,237,.07); }
      .ct-skel-img { aspect-ratio: 1; animation: ctShim 1.5s ease infinite; background: linear-gradient(90deg, #f0ecff 25%, #e8e2ff 50%, #f0ecff 75%); background-size: 200% 100%; }
      .ct-skel-body { padding: 14px; }
      .ct-skel-line { height: 10px; border-radius: 6px; margin-bottom: 8px; animation: ctShim 1.5s ease infinite; background: linear-gradient(90deg, #f0ecff 25%, #e8e2ff 50%, #f0ecff 75%); background-size: 200% 100%; }

      /* ─── PRODUCT CARD ─── */
      .ct-card {
        background: white; border-radius: 20px; overflow: hidden;
        border: 1px solid rgba(124,58,237,.09);
        display: flex; flex-direction: column; cursor: pointer;
        transition: transform .3s cubic-bezier(.34,1.4,.64,1), box-shadow .3s, border-color .3s;
        position: relative;
        box-shadow: 0 2px 14px rgba(124,58,237,.05);
        animation: ctFadeUp .45s ease both;
      }
      .ct-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 14px 40px rgba(124,58,237,.14);
        border-color: rgba(124,58,237,.22);
      }
      /* top gradient accent */
      .ct-card::before {
        content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
        background: linear-gradient(90deg, transparent 0%, #7c3aed 40%, #a78bfa 70%, transparent 100%);
        opacity: 0; transition: opacity .3s;
      }
      .ct-card:hover::before { opacity: 1; }

      /* image zone */
      .ct-card-img-z {
        position: relative; background: #f9f7ff;
        overflow: hidden; aspect-ratio: 1;
        display: flex; align-items: center; justify-content: center;
      }
      .ct-card-img {
        width: 100%; height: 100%; object-fit: contain; padding: 18px;
        transition: transform .5s cubic-bezier(.34,1.56,.64,1);
      }
      .ct-card:hover .ct-card-img { transform: scale(1.09); }
      .ct-card-img-ph { font-size: 46px; opacity: .18; }

      /* shimmer bottom bar on hover */
      .ct-card-bar {
        position: absolute; bottom: 0; left: 0; right: 0; height: 3px;
        background: linear-gradient(90deg, #7c3aed, #a78bfa, #7c3aed);
        background-size: 200% 100%;
        transform: scaleX(0); transform-origin: left;
        transition: transform .4s cubic-bezier(.34,1.56,.64,1);
      }
      .ct-card:hover .ct-card-bar { transform: scaleX(1); animation: ctSlide 1.4s linear infinite; }

      /* ── BULK BADGE – violet-aurora pill ── */
      .ct-bulk {
        position: absolute; top: 10px; left: 10px; z-index: 3;
        display: inline-flex; align-items: center; gap: 5px;
        padding: 4px 10px 4px 7px; border-radius: 100px;
        font-size: 9px; font-weight: 800; letter-spacing: .1em; text-transform: uppercase;
        color: white;
        background: linear-gradient(130deg, #7c3aed 0%, #5b21b6 60%, #4c1d95 100%);
        box-shadow: 0 4px 16px rgba(124,58,237,.45), 0 0 0 1px rgba(255,255,255,.18) inset;
        animation: ctBulkIn .4s cubic-bezier(.34,1.56,.64,1) both;
      }
      .ct-bulk-dot {
        width: 6px; height: 6px; border-radius: 50%; background: #c4b5fd; flex-shrink: 0;
        animation: ctBulkDot 1.8s ease infinite;
        box-shadow: 0 0 5px rgba(196,181,253,.8);
      }
      @keyframes ctBulkDot { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:.4; transform:scale(.65); } }
      @keyframes ctBulkIn  { from { opacity:0; transform:scale(.6) translateY(-4px); } to { opacity:1; transform:scale(1) translateY(0); } }

      /* discount badge */
      .ct-disc {
        position: absolute; top: 10px; left: 10px; z-index: 3;
        padding: 4px 9px; border-radius: 8px;
        font-size: 9px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase;
        color: white; background: linear-gradient(135deg, #059669, #047857);
        box-shadow: 0 3px 10px rgba(5,150,105,.32);
      }

      /* action buttons */
      .ct-actions {
        position: absolute; top: 9px; right: 9px;
        display: flex; flex-direction: column; gap: 5px;
        opacity: 0; transform: translateX(7px); transition: all .22s;
      }
      .ct-card:hover .ct-actions { opacity: 1; transform: translateX(0); }
      .ct-act-btn {
        width: 32px; height: 32px; border-radius: 9px; border: none;
        background: rgba(255,255,255,.92); backdrop-filter: blur(8px);
        box-shadow: 0 2px 8px rgba(0,0,0,.09);
        display: flex; align-items: center; justify-content: center;
        cursor: pointer; transition: all .18s; color: #9ca3af;
      }
      .ct-act-btn:hover { background: white; transform: scale(1.1); }
      .ct-act-btn.wished { color: #ef4444; }

      /* card body */
      .ct-body { padding: 13px; flex: 1; display: flex; flex-direction: column; gap: 7px; }

      /* top row */
      .ct-top-row { display: flex; align-items: center; justify-content: space-between; }
      .ct-stars { display: flex; gap: 1px; }
      .ct-star { width: 11px; height: 11px; }
      .ct-rat-ct { font-size: 10px; color: #9ca3af; font-weight: 600; margin-left: 3px; }
      .ct-cat-pill { font-size: 9px; font-weight: 700; letter-spacing: .07em; text-transform: capitalize; color: #6b7280; background: #f5f3ff; border: 1px solid rgba(124,58,237,.1); padding: 2px 8px; border-radius: 100px; }
      .ct-verified { display: inline-flex; align-items: center; gap: 3px; font-size: 8px; font-weight: 700; letter-spacing: .1em; color: #7c3aed; background: rgba(124,58,237,.07); border: 1px solid rgba(124,58,237,.13); padding: 2px 7px; border-radius: 100px; }

      /* product name */
      .ct-pname {
        font-size: 13px; font-weight: 700; color: #1e1b2e; line-height: 1.35;
        display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
        text-decoration: none; transition: color .15s;
      }
      .ct-pname:hover { color: #7c3aed; }

      /* price row */
      .ct-price-area { margin-top: auto; display: flex; align-items: flex-end; justify-content: space-between; gap: 6px; }
      .ct-price-authed { font-family: 'Bebas Neue', sans-serif; font-size: 21px; color: #7c3aed; letter-spacing: .02em; line-height: 1; display: flex; align-items: center; gap: 6px; }
      .ct-price-off { font-family: 'DM Sans', sans-serif; font-size: 11px; font-weight: 800; color: #059669; background: rgba(5,150,105,.08); padding: 2px 6px; border-radius: 6px; letter-spacing: 0; }
      .ct-price-mrp { font-size: 11px; color: #9ca3af; text-decoration: line-through; font-weight: 500; margin-top: 2px; }

      /* ── MASKED PRICE (guest) ── */
      .ct-price-mask {
        display: inline-flex; align-items: center; gap: 5px;
        padding: 6px 11px; border-radius: 10px;
        background: linear-gradient(135deg, rgba(124,58,237,.09), rgba(99,102,241,.07));
        border: 1px solid rgba(124,58,237,.2);
        cursor: pointer; text-decoration: none; transition: all .2s;
        position: relative; overflow: hidden;
      }
      .ct-price-mask::after {
        content: ''; position: absolute; inset: 0;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,.35), transparent);
        transform: translateX(-100%);
        animation: ctMaskSheen 3s ease infinite;
      }
      .ct-price-mask:hover { background: rgba(124,58,237,.14); border-color: rgba(124,58,237,.35); transform: scale(1.03); }
      .ct-rupee { font-size: 14px; font-weight: 800; color: #7c3aed; }
      .ct-stars-blur {
        font-family: monospace; font-size: 15px; font-weight: 900;
        color: #7c3aed; letter-spacing: 4px;
        filter: blur(4px); user-select: none;
        animation: ctMaskPulse 3.5s ease infinite;
      }
      .ct-eye { color: #7c3aed; flex-shrink: 0; }
      .ct-mask-hint { font-size: 9px; font-weight: 700; letter-spacing: .09em; color: #7c3aed; margin-top: 3px; text-transform: uppercase; }

      @keyframes ctMaskSheen { 0%,70%,100% { transform:translateX(-100%); } 35% { transform:translateX(200%); } }
      @keyframes ctMaskPulse { 0%,90%,100% { filter:blur(4px); } 94% { filter:blur(2.5px); } }

      /* add-to-cart button */
      .ct-atc {
        width: 40px; height: 40px; border-radius: 12px; border: none; flex-shrink: 0;
        display: flex; align-items: center; justify-content: center;
        cursor: pointer; transition: all .22s;
        background: linear-gradient(135deg, #7c3aed, #6d28d9);
        color: white; box-shadow: 0 4px 14px rgba(124,58,237,.3);
      }
      .ct-atc:hover:not(:disabled) { transform: scale(1.1); box-shadow: 0 6px 20px rgba(124,58,237,.42); }
      .ct-atc:active:not(:disabled) { transform: scale(.94); }
      .ct-atc:disabled { background: #e5e7eb; color: #9ca3af; box-shadow: none; cursor: not-allowed; }

      /* bottom tags */
      .ct-tags { display: flex; flex-wrap: wrap; gap: 4px; }
      .ct-tag { font-size: 8px; font-weight: 700; letter-spacing: .07em; text-transform: uppercase; padding: 3px 8px; border-radius: 6px; }

      /* ─── EMPTY ─── */
      .ct-empty { padding: 80px 20px; display: flex; flex-direction: column; align-items: center; gap: 14px; text-align: center; }
      .ct-empty-ico { width: 96px; height: 96px; border-radius: 26px; background: #f5f3ff; border: 1px solid rgba(124,58,237,.14); display: flex; align-items: center; justify-content: center; font-size: 42px; box-shadow: 0 4px 24px rgba(124,58,237,.1); }
      .ct-empty-h { font-family: 'Bebas Neue', sans-serif; font-size: 28px; color: #1e1b2e; letter-spacing: .03em; }
      .ct-empty-p { font-size: 13px; color: #9ca3af; max-width: 300px; line-height: 1.6; }
      .ct-empty-btn {
        padding: 12px 28px; border-radius: 12px; background: #7c3aed; color: white; border: none;
        font-size: 11px; font-weight: 700; letter-spacing: .13em; text-transform: uppercase;
        cursor: pointer; font-family: 'DM Sans', sans-serif;
        box-shadow: 0 6px 20px rgba(124,58,237,.28); transition: all .22s;
      }
      .ct-empty-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(124,58,237,.38); }

      /* ─── LOAD MORE ─── */
      .ct-lm-wrap { display: flex; flex-direction: column; align-items: center; gap: 9px; padding: 40px 0 16px; }
      .ct-lm-btn {
        display: flex; align-items: center; gap: 8px;
        padding: 13px 32px; border-radius: 14px;
        background: white; border: 1.5px solid rgba(124,58,237,.2);
        color: #7c3aed; font-size: 11px; font-weight: 700; letter-spacing: .13em; text-transform: uppercase;
        cursor: pointer; font-family: 'DM Sans', sans-serif;
        box-shadow: 0 3px 16px rgba(124,58,237,.07); transition: all .22s;
      }
      .ct-lm-btn:hover { border-color: rgba(124,58,237,.38); box-shadow: 0 8px 24px rgba(124,58,237,.13); transform: translateY(-2px); }
      .ct-lm-sub { font-size: 10px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: #9ca3af; }
      .ct-end { display: flex; justify-content: center; padding: 32px 0; }
      .ct-end-pill {
        display: inline-flex; align-items: center; gap: 7px;
        padding: 8px 20px; border-radius: 100px;
        background: white; border: 1px solid rgba(124,58,237,.1);
        font-size: 10px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: #9ca3af;
      }

      /* ─── MOBILE FILTER SHEET ─── */
      .ct-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,.38); backdrop-filter: blur(4px); z-index: 100; }
      .ct-sheet {
        position: fixed; bottom: 0; inset-x: 0; z-index: 101;
        background: white; border-radius: 24px 24px 0 0;
        box-shadow: 0 -8px 48px rgba(0,0,0,.12);
        max-height: 86vh; overflow: hidden; display: flex; flex-direction: column;
        padding-bottom: env(safe-area-inset-bottom, 0px);
      }
      .ct-sheet-handle { display: flex; justify-content: center; padding: 13px 0 8px; }
      .ct-sheet-pill { width: 34px; height: 4px; border-radius: 100px; background: #e5e7eb; }
      .ct-sheet-head {
        display: flex; align-items: center; justify-content: space-between;
        padding: 4px 20px 14px; border-bottom: 1px solid rgba(124,58,237,.08);
      }
      .ct-sheet-title { font-family: 'Bebas Neue', sans-serif; font-size: 22px; color: #1e1b2e; letter-spacing: .03em; }
      .ct-sheet-close { width: 30px; height: 30px; border-radius: 8px; background: #f5f3ff; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #7c3aed; }
      .ct-sheet-body { padding: 18px 18px 24px; overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 20px; }
      .ct-sheet-lbl { font-size: 8px; font-weight: 700; letter-spacing: .22em; text-transform: uppercase; color: #9ca3af; margin-bottom: 10px; }
      .ct-sheet-cats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 7px; }
      .ct-sheet-cat {
        padding: 11px; border-radius: 12px; border: 1.5px solid rgba(124,58,237,.14);
        background: white; font-size: 12px; font-weight: 700; color: #6b7280;
        cursor: pointer; font-family: 'DM Sans', sans-serif; text-align: center;
        transition: all .18s; text-transform: capitalize;
      }
      .ct-sheet-cat.on { background: #7c3aed; border-color: #7c3aed; color: white; box-shadow: 0 4px 12px rgba(124,58,237,.25); }
      .ct-sheet-apply {
        padding: 14px; border-radius: 13px;
        background: linear-gradient(135deg, #7c3aed, #6d28d9); color: white; border: none;
        font-size: 11px; font-weight: 700; letter-spacing: .13em; text-transform: uppercase;
        cursor: pointer; font-family: 'DM Sans', sans-serif; width: 100%;
        box-shadow: 0 6px 20px rgba(124,58,237,.28); transition: all .22s;
      }
      .ct-sheet-apply:hover { transform: translateY(-1px); box-shadow: 0 10px 24px rgba(124,58,237,.36); }

      @media (min-width: 480px) {
        .ct-sheet-cats {
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          gap: 9px;
        }
        .ct-sheet-cat { padding: 12px 11px; font-size: 12.5px; }
      }
      @media (min-width: 600px) {
        .ct-sheet {
          left: 50%;
          right: auto;
          transform: translateX(-50%);
          width: min(420px, calc(100vw - 32px));
          max-width: 420px;
          bottom: max(12px, env(safe-area-inset-bottom, 0px));
          border-radius: 22px;
          max-height: min(82vh, 620px);
          box-shadow: 0 24px 60px rgba(0,0,0,.18);
        }
        .ct-sheet-handle { padding-top: 10px; }
        .ct-sheet-head { padding: 2px 22px 12px; }
        .ct-sheet-body { padding: 16px 22px 22px; gap: 18px; }
        .ct-sheet-title { font-size: 24px; }
      }
      @media (min-width: 900px) {
        .ct-sheet {
          width: min(460px, calc(100vw - 48px));
          max-width: 460px;
          max-height: min(78vh, 640px);
        }
        .ct-sheet-cats {
          grid-template-columns: repeat(auto-fill, minmax(148px, 1fr));
        }
      }
      @media (max-width: 360px) {
        .ct-sheet-cats { grid-template-columns: 1fr; }
        .ct-sheet-cat { font-size: 11.5px; padding: 10px; }
      }

      /* ─── SKELETON ─── */
      .ct-skel-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; padding: 12px; }
      @media (min-width: 640px) { .ct-skel-grid { grid-template-columns: repeat(3, 1fr); gap: 20px; padding: 20px; } }
      @media (min-width: 1024px) { .ct-skel-grid { grid-template-columns: repeat(4, 1fr); } }
      @media (min-width: 1280px) { .ct-skel-grid { grid-template-columns: repeat(5, 1fr); } }
      .ct-skel-card { background: white; border-radius: 20px; overflow: hidden; border: 1px solid rgba(124,58,237,.06); height: 320px; position: relative; }
      .ct-skel-img { height: 180px; background: #f9fafb; position: relative; overflow: hidden; }
      .ct-skel-body { padding: 12px; display: flex; flex-direction: column; gap: 10px; }
      .ct-skel-line { height: 12px; background: #f3f4f6; border-radius: 6px; position: relative; overflow: hidden; }
      .ct-skel-shim { position: absolute; inset: 0; background: linear-gradient(90deg, transparent, rgba(124,58,237,0.05), transparent); transform: translateX(-100%); animation: ctSkelShim 1.5s infinite; }
      @keyframes ctSkelShim { 100% { transform: translateX(100%); } }

      /* ─── ANIMATIONS ─── */
      @keyframes ctFadeUp   { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
      @keyframes ctShim     { 0% { background-position:200% 0; } 100% { background-position:-200% 0; } }
      @keyframes ctPulse    { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:.35; transform:scale(.65); } }
      @keyframes ctSlide    { 0% { background-position:0% 0; } 100% { background-position:200% 0; } }
    `}</style>

    <div className="ct">
      <div className="ct-glow1"/><div className="ct-glow2"/>

      {/* ══ MOBILE TOP BAR ══ */}
      <div className="ct-topbar-mob">
        <div className="ct-searchbar-wrap">
          <div className="ct-searchbar">
            <div className="ct-searchbar-ico">
              <svg width="17" height="17" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>
            <input
              ref={searchRef}
              placeholder="Search products…"
              value={q}
              onChange={e => setQ(e.target.value)}
              onFocus={() => q.trim().length >= 2 && setShowSug(true)}
              onBlur={() => setTimeout(() => setShowSug(false), 150)}
            />
            {!q && <span className="ct-searchbar-kbd">⌘ K</span>}
            {q && (
              <button className="ct-searchbar-clear" onClick={() => { setQ(''); setSug([]); setShowSug(false) }}>
                <svg width="11" height="11" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            )}
            {showSug && sug.length > 0 && <SuggestList items={sug} setQ={setQ}/>}
          </div>
        </div>
        <div className="ct-chips">
          <button className={`ct-chip${category===''?' on':''}`} onClick={() => { setCategory(''); setSubCategory(''); setBrowsePath('category') }}>All</button>
          {categories.map(c => (
            <button key={c._id} className={`ct-chip${category===c._id?' on':''}`} onClick={() => { setCategory(c._id); setSubCategory(''); setBrowsePath('category') }}>{c.name}</button>
          ))}
        </div>
      </div>

      {/* ══ DESKTOP TOP BAR ══ */}
      <div className="ct-topbar-desk">
        <div className="ct-desk-inner">
          <div className="ct-brand">
            <div className="ct-brand-ey"><span className="ct-brand-dot"/>B2B Catalogue</div>
            <div className="ct-brand-title">Wholesale <span>Products</span></div>
          </div>
          <div className="ct-desk-search">
            <div className="ct-searchbar">
              <div className="ct-searchbar-ico">
                <svg width="17" height="17" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
              </div>
              <input
                placeholder="Search products, brands, categories…"
                value={q}
                onChange={e => setQ(e.target.value)}
                onFocus={() => q.trim().length >= 2 && setShowSug(true)}
                onBlur={() => setTimeout(() => setShowSug(false), 150)}
              />
              {!q && <span className="ct-searchbar-kbd">⌘ K</span>}
              {q && (
                <button className="ct-searchbar-clear" onClick={() => { setQ(''); setSug([]); setShowSug(false) }}>
                  <svg width="11" height="11" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              )}
              {showSug && sug.length > 0 && <SuggestList items={sug} setQ={setQ}/>}
            </div>
          </div>
          <div className="ct-sort-wrap">
            <select className="ct-sort-sel" value={sort} onChange={e => setSort(e.target.value)}>
              <option value="NEW">✨ Newest First</option>
              {authed && <option value="PRICE_LOW">💰 Price: Low → High</option>}
              {authed && <option value="PRICE_HIGH">💎 Price: High → Low</option>}
            </select>
            <svg className="ct-sort-arr" width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"/></svg>
          </div>
        </div>
      </div>

      {/* ══ LAYOUT ══ */}
      <div className="ct-layout">

        {/* ── SIDEBAR ── */}
        <aside className="ct-sidebar">
          <div className="ct-sidebar-in">

            {/* Sort */}
            <div>
              <div className="ct-sb-label">Sort By</div>
              {sortOpts.map(o => (
                <button key={o.v} className={`ct-sb-sort-btn${sort===o.v?' on':''}`} onClick={() => setSort(o.v)}>
                  <div className="ct-sb-sort-ico">{o.ico}</div>
                  {o.l}
                  {sort === o.v && (
                    <svg style={{marginLeft:'auto',flexShrink:0}} width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
                  )}
                </button>
              ))}
            </div>

            {/* Categories */}
            <div>
              <div className="ct-sb-label">Categories</div>
              <div className="ct-sb-cats">
                <button className={`ct-sb-cat-btn${category===''?' on':''}`} onClick={() => { setCategory(''); setSubCategory(''); if(!brand) setBrowsePath(null) }}>
                  <div className="ct-sb-cat-img"><span style={{fontSize:17}}>📦</span></div>
                  <div style={{flex:1,textAlign:'left'}}>
                    <div style={{fontWeight:700,fontSize:13}}>All Categories</div>
                  </div>
                  {category==='' && <div className="ct-sb-cat-check"><svg width="9" height="9" fill="none" stroke="white" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.5" d="M5 13l4 4L19 7"/></svg></div>}
                </button>
                {categories.map(c => (
                  <button key={c._id} className={`ct-sb-cat-btn${category===c._id?' on':''}`} onClick={() => { setCategory(c._id); setBrowsePath('category') }}>
                    <div className="ct-sb-cat-img">
                      {c.image ? <img src={getCloudinaryUrl(c.image, 100)} alt={c.name} loading="lazy" width="50" height="50" /> : <span style={{fontSize:17}}>📦</span>}
                    </div>
                    <div style={{flex:1,textAlign:'left'}}>
                      <div style={{fontWeight:700,fontSize:13,textTransform:'capitalize'}}>{c.name}</div>
                    </div>
                    {category===c._id && <div className="ct-sb-cat-check"><svg width="9" height="9" fill="none" stroke="white" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.5" d="M5 13l4 4L19 7"/></svg></div>}
                  </button>
                ))}
              </div>
            </div>

            {/* Subcategories (category specific) */}
            {category && subcategories.length > 0 && (
              <div>
                <div className="ct-sb-label">Subcategories</div>
                <div className="ct-sb-cats">
                  {subcategories.map(s => (
                    <button key={s._id} className={`ct-sb-cat-btn${subCategory===s._id?' on':''}`} onClick={() => setSubCategory(s._id)}>
                      <div className="ct-sb-cat-img"><span style={{fontSize:17}}>🔹</span></div>
                      <div style={{flex:1,textAlign:'left'}}>
                        <div style={{fontWeight:700,fontSize:13,textTransform:'capitalize'}}>{s.name}</div>
                      </div>
                      {subCategory===s._id && <div className="ct-sb-cat-check"><svg width="9" height="9" fill="none" stroke="white" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.5" d="M5 13l4 4L19 7"/></svg></div>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Brands */}
            <div>
              <div className="ct-sb-label">Filter by Brand</div>
              <div className="ct-sb-cats">
                <button className={`ct-sb-cat-btn${brand===''?' on':''}`} onClick={() => { setBrand(''); if(!category) setBrowsePath(null) }}>
                  <div className="ct-sb-cat-img"><span style={{fontSize:17}}>🏷️</span></div>
                  <div style={{flex:1,textAlign:'left'}}>
                    <div style={{fontWeight:700,fontSize:13}}>All Brands</div>
                  </div>
                  {brand==='' && <div className="ct-sb-cat-check"><svg width="9" height="9" fill="none" stroke="white" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.5" d="M5 13l4 4L19 7"/></svg></div>}
                </button>
                {brands.map(b => (
                  <button key={b._id} className={`ct-sb-cat-btn${brand===b._id?' on':''}`} onClick={() => { setBrand(b._id); setBrowsePath('brand') }}>
                    <div className="ct-sb-cat-img">
                      {b.logo ? <img src={getCloudinaryUrl(b.logo, 100)} alt={b.name} loading="lazy" width="50" height="50" /> : <span style={{fontSize:17}}>🏭</span>}
                    </div>
                    <div style={{flex:1,textAlign:'left'}}>
                      <div style={{fontWeight:700,fontSize:13,textTransform:'capitalize'}}>{b.name}</div>
                    </div>
                    {brand===b._id && <div className="ct-sb-cat-check"><svg width="9" height="9" fill="none" stroke="white" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.5" d="M5 13l4 4L19 7"/></svg></div>}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div>
              <div className="ct-sb-label">Price Range (₹)</div>
              {!authed && (
                <div className="ct-price-lock">
                  <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                  <span style={{fontSize:11,fontWeight:600}}>Login to filter by price</span>
                </div>
              )}
              <div className="ct-price-row">
                <div className="ct-price-inp-w"><span className="ct-price-pfx">₹</span><input className="ct-price-inp" disabled={!authed} placeholder="Min" value={minPrice} onChange={e => setMinPrice(e.target.value)}/></div>
                <div className="ct-price-inp-w"><span className="ct-price-pfx">₹</span><input className="ct-price-inp" disabled={!authed} placeholder="Max" value={maxPrice} onChange={e => setMaxPrice(e.target.value)}/></div>
              </div>
            </div>

            {/* Stats */}
            <div className="ct-sb-stats">
              <div className="ct-sb-stat">
                <span className="ct-sb-stat-k">Total Products</span>
                <span className="ct-sb-stat-v">{total}</span>
              </div>
              <div className="ct-sb-stat">
                <span className="ct-sb-stat-k" style={{fontSize:11}}>Page</span>
                <span className="ct-sb-stat-vs">{page} / {totalPages}</span>
              </div>
            </div>

          </div>
        </aside>

        {/* ── MAIN ── */}
        <main className="ct-main">

          {/* mobile bar */}
          <div className="ct-mob-bar">
            <button className="ct-filter-btn" onClick={() => setFiltersOpen(true)}>
              <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 6h18M7 12h10M10 18h4"/></svg>
              Filters
            </button>
            <div className="ct-mob-sorts">
              {sortOpts.map(o => (
                <button key={o.v} className={`ct-mob-sort-chip${sort===o.v?' on':''}`} onClick={() => setSort(o.v)}>{o.ico} {o.l.split(':')[0]}</button>
              ))}
            </div>
            <div className="ct-total-pill">{total}</div>
          </div>

          {/* desktop result bar */}
          <div className="ct-res-bar">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="ct-breadcrumb">
                <button className="ct-bc-item" onClick={() => { setBrowsePath(null); setBrand(''); setCategory(''); setSubCategory(''); setQ('') }}>Catalogue</button>
                {browsePath && (
                  <>
                    <span className="ct-bc-sep">›</span>
                    <button className="ct-bc-item" onClick={() => { setBrand(''); setCategory(''); setSubCategory('') }}>{browsePath === 'brand' ? 'Brands' : 'Categories'}</button>
                  </>
                )}
                {brand && (
                  <>
                    <span className="ct-bc-sep">›</span>
                    <button className="ct-bc-item" onClick={() => { setCategory(''); setSubCategory('') }}>{brands.find(b => b._id === brand)?.name || 'Brand'}</button>
                  </>
                )}
                {category && (
                  <>
                    <span className="ct-bc-sep">›</span>
                    <button className="ct-bc-item" onClick={() => setSubCategory('')}>{categories.find(c => c._id === category)?.name || 'Category'}</button>
                  </>
                )}
                {subCategory && (
                  <>
                    <span className="ct-bc-sep">›</span>
                    <span className="ct-bc-item active">{subcategories.find(s => s._id === subCategory)?.name || 'Subcategory'}</span>
                  </>
                )}
              </div>
            </div>
            <span className="ct-page-info">
              {viewMode === 'PRODUCTS' ? `Page ${page} of ${totalPages}` : ''}
            </span>
          </div>

          {/* premium loader */}
          {loading && (
            <>
              <div className="ct-grid">
                {[1,2,3,4,5,6,7,8].map(i => (
                  <div key={i} className="ct-skel" style={{ animationDelay: `${i*40}ms` }}>
                    <div className="ct-skel-img"/>
                    <div className="ct-skel-body">
                      <div className="ct-skel-line" style={{width:'72%'}}/>
                      <div className="ct-skel-line" style={{width:'48%'}}/>
                      <div className="ct-skel-line" style={{width:'60%',marginTop:10}}/>
                    </div>
                  </div>
                ))}
              </div>
              <div className="ct-load-txt-wrap">
                <style>{`
                  .ct-load-txt-wrap { text-align:center; padding:40px 0; animation:ctFadeUp .6s ease both; }
                  .ct-load-h { font-family:'Bebas Neue',sans-serif; font-size:24px; color:#1e1b2e; letter-spacing:.05em; margin-bottom:4px; }
                  .ct-load-p { font-size:10px; font-weight:800; color:#7c3aed; text-transform:uppercase; letter-spacing:.25em; opacity:.5; animation:ctPulse 1.5s ease infinite; }
                `}</style>
                <h2 className="ct-load-h">Wholesale Collection</h2>
                <p className="ct-load-p">Fetching products…</p>
              </div>
            </>
          )}

          {/* NEW STEP-BY-STEP FLOW */}
          {!loading && !q && (
            <div className="ct-flow-wrap">
              <style>{`
                .ct-flow-wrap { padding: 40px 0; max-width: 1000px; margin: 0 auto; }
                .ct-flow-h { font-family: 'Bebas Neue', sans-serif; font-size: 48px; color: #1e1b2e; margin-bottom: 32px; text-align: center; letter-spacing: 0.02em; }
                .ct-flow-desc { text-align: center; color: #6b7280; font-size: 14px; margin-top: -24px; margin-bottom: 48px; font-weight: 500; }
                
                .ct-grid-flow { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 32px; justify-content: center; }
                
                .ct-start-card { 
                  background: white; border: 1px solid rgba(124,58,237,.1); border-radius: 32px; padding: 48px 32px; 
                  display: flex; flex-direction: column; align-items: center; text-align: center; gap: 24px;
                  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); cursor: pointer; position: relative; overflow: hidden;
                  box-shadow: 0 10px 40px rgba(0,0,0,0.03);
                }
                .ct-start-card:hover { 
                  transform: translateY(-10px); 
                  box-shadow: 0 20px 60px rgba(124,58,237,0.15); 
                  border-color: rgba(124,58,237,0.4); 
                }
                .ct-start-card::after {
                  content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, rgba(124,58,237,0.05), transparent); opacity: 0; transition: opacity 0.4s;
                }
                .ct-start-card:hover::after { opacity: 1; }
                
                .ct-start-ico { 
                  width: 80px; height: 80px; border-radius: 24px; background: #f5f3ff; 
                  display: flex; align-items: center; justify-content: center; font-size: 32px; 
                  color: #7c3aed; transition: all 0.4s;
                }
                .ct-start-card:hover .ct-start-ico { background: #7c3aed; color: white; transform: scale(1.1) rotate(5deg); }
                
                .ct-start-name { font-size: 20px; font-weight: 800; color: #1e1b2e; text-transform: uppercase; letter-spacing: 0.05em; }
                .ct-start-sub { font-size: 13px; color: #6b7280; font-weight: 500; line-height: 1.6; }
                .ct-start-btn { 
                  margin-top: 8px; padding: 12px 24px; border-radius: 14px; background: #f5f3ff; 
                  color: #7c3aed; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em;
                  transition: all 0.3s;
                }
                .ct-start-card:hover .ct-start-btn { background: #7c3aed; color: white; }

                /* Inner grid for Brands/Categories */
                .ct-inner-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 20px; }
                .ct-inner-card {
                  background: white; border: 1.5px solid rgba(124,58,237,.08); border-radius: 24px; padding: 24px;
                  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px;
                  transition: all 0.3s; cursor: pointer; text-align: center;
                }
                .ct-inner-card:hover { transform: translateY(-5px); box-shadow: 0 10px 30px rgba(124,58,237,0.1); border-color: rgba(124,58,237,0.3); }
                .ct-inner-img { height: 50px; width: 100%; display: flex; align-items: center; justify-content: center; }
                .ct-inner-img img { max-height: 100%; max-width: 100%; object-fit: contain; }
                .ct-inner-name { font-size: 12px; font-weight: 800; color: #1e1b2e; text-transform: uppercase; letter-spacing: 0.05em; }
                
                .ct-bc-item { background: none; border: none; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: .1em; color: #9ca3af; cursor: pointer; transition: color .2s; }
                .ct-bc-item:hover { color: #7c3aed; }
                .ct-bc-item.active { color: #7c3aed; pointer-events: none; }
                .ct-bc-sep { color: #d1d5db; font-size: 14px; font-weight: 400; }
                .ct-breadcrumb { display: flex; align-items: center; gap: 8px; }
              `}</style>

              {viewMode === 'START' && (
                <>
                  <h2 className="ct-flow-h">How would you like to browse?</h2>
                  <p className="ct-flow-desc">Select your preferred way to discover our premium wholesale products</p>
                  <div className="ct-grid-flow">
                    <div className="ct-start-card" onClick={() => setBrowsePath('brand')}>
                      <div className="ct-start-ico">🏷️</div>
                      <div>
                        <div className="ct-start-name">Browse by Brand</div>
                        <div className="ct-start-sub">Explore products by manufacturer like Samsung, Oppo, and Boat</div>
                      </div>
                      <div className="ct-start-btn">View All Brands</div>
                    </div>
                    <div className="ct-start-card" onClick={() => setBrowsePath('category')}>
                      <div className="ct-start-ico">📦</div>
                      <div>
                        <div className="ct-start-name">Browse by Category</div>
                        <div className="ct-start-sub">Find products by type like Chargers, Cables, or Earphones</div>
                      </div>
                      <div className="ct-start-btn">View Categories</div>
                    </div>
                    <div className="ct-start-card" style={{ background: '#faf8ff', borderStyle: 'dashed' }} onClick={() => { setBrowsePath('category'); setViewMode('PRODUCTS') }}>
                      <div className="ct-start-ico" style={{ background: 'white' }}>🔍</div>
                      <div>
                        <div className="ct-start-name">Direct Catalog</div>
                        <div className="ct-start-sub">Browse our entire inventory with advanced filtering options</div>
                      </div>
                      <div className="ct-start-btn" style={{ background: 'white' }}>Quick Search</div>
                    </div>
                  </div>
                </>
              )}

              {viewMode === 'BRANDS' && (
                <>
                  <h2 className="ct-flow-h">Choose a Brand</h2>
                  <div className="ct-inner-grid">
                    {brands.map(b => (
                      <div key={b._id} className="ct-inner-card" onClick={() => setBrand(b._id)}>
                        <div className="ct-inner-img">
                          {b.logo ? <img src={getCloudinaryUrl(b.logo, 160)} alt={b.name} loading="lazy" width="80" height="80" /> : <span style={{fontSize:32}}>🏭</span>}
                        </div>
                        <div className="ct-inner-name">{b.name}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {viewMode === 'CATEGORIES' && (
                <>
                  <h2 className="ct-flow-h">
                    {browsePath === 'brand' 
                      ? `${brands.find(b => b._id === brand)?.name} Categories` 
                      : 'Product Categories'}
                  </h2>
                  <div className="ct-inner-grid">
                    {categories.map(c => (
                      <div key={c._id} className="ct-inner-card" onClick={() => setCategory(c._id)}>
                        <div className="ct-inner-img">
                          {c.image ? <img src={getCloudinaryUrl(c.image, 160)} alt={c.name} loading="lazy" width="80" height="80" /> : <span style={{fontSize:32}}>📦</span>}
                        </div>
                        <div className="ct-inner-name">{c.name}</div>
                      </div>
                    ))}
                    {browsePath === 'brand' && (
                      <div className="ct-inner-card" style={{ background: '#faf8ff', borderStyle: 'dashed' }} onClick={() => setViewMode('PRODUCTS')}>
                        <div className="ct-inner-img" style={{fontSize:24}}>🔍</div>
                        <div className="ct-inner-name">All Products</div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {viewMode === 'SUBCATEGORIES' && (
                <>
                  <h2 className="ct-flow-h">{categories.find(c => c._id === category)?.name} Collections</h2>
                  <div className="ct-inner-grid">
                    {subcategories.map(s => (
                      <div key={s._id} className="ct-inner-card" onClick={() => setSubCategory(s._id)}>
                        <div className="ct-inner-img" style={{fontSize:32}}>🔹</div>
                        <div className="ct-inner-name">{s.name}</div>
                      </div>
                    ))}
                    <div className="ct-inner-card" style={{ background: '#faf8ff', borderStyle: 'dashed' }} onClick={() => setViewMode('PRODUCTS')}>
                      <div className="ct-inner-img" style={{fontSize:24}}>📦</div>
                      <div className="ct-inner-name">View All</div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* grid */}
          {!loading && (viewMode === 'PRODUCTS' || q) && (
            <div className="ct-grid">
              {filteredSorted.map((p, idx) => (
                <ProductCard key={p._id} p={p} authed={authed} addToCart={addToCart}
                  navigate={navigate} index={idx} setRecOpen={setRecOpen} setRecItems={setRecItems}/>
              ))}
            </div>
          )}

          {/* Grouped View (Category-wise) */}
          {!loading && !q && viewMode === 'GROUPED' && (
            <div className="space-y-12">
              {groupedItems.map(group => (
                <section key={group.category._id} className="space-y-6">
                  <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                    <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight flex items-center gap-3">
                      <span className="w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center text-sm">📦</span>
                      {group.category.name}
                    </h3>
                    <button 
                      onClick={() => { setCategory(group.category._id); setViewMode('PRODUCTS') }}
                      className="text-xs font-black text-indigo-600 uppercase tracking-widest hover:underline"
                    >View All {group.category.name}</button>
                  </div>
                  <div className="ct-grid">
                    {group.items.slice(0, 4).map((p, idx) => (
                      <ProductCard key={p._id} p={p} authed={authed} addToCart={addToCart}
                        navigate={navigate} index={idx} setRecOpen={setRecOpen} setRecItems={setRecItems}/>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}

          {/* empty */}
          {!loading && filteredSorted.length === 0 && (
            <div className="ct-empty">
              <div className="ct-empty-ico">🔍</div>
              <div className="ct-empty-h">No Products Found</div>
              <p className="ct-empty-p">We couldn't find anything matching your criteria. Try adjusting your filters or search.</p>
              <button className="ct-empty-btn" onClick={() => { setCategory(''); setQ(''); setMinPrice(''); setMaxPrice('') }}>
                Clear All Filters
              </button>
            </div>
          )}

          {/* load more */}
          {!loading && page * limit < total && (
            <div className="ct-lm-wrap">
              <button className="ct-lm-btn" onClick={() => load(page + 1)}>
                Load More
                <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"/></svg>
              </button>
              <span className="ct-lm-sub">Showing {items.length} of {total}</span>
            </div>
          )}
          {!loading && page * limit >= total && total > 0 && (
            <div className="ct-end">
              <div className="ct-end-pill">
                <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/></svg>
                End of collection
              </div>
            </div>
          )}
        </main>
      </div>

      {/* mobile filter sheet */}
      {filtersOpen && (
        <>
          <div className="ct-backdrop" onClick={() => setFiltersOpen(false)}/>
          <div className="ct-sheet">
            <div className="ct-sheet-handle"><div className="ct-sheet-pill"/></div>
            <div className="ct-sheet-head">
              <div className="ct-sheet-title">Filters</div>
              <button className="ct-sheet-close" onClick={() => setFiltersOpen(false)}>
                <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <div className="ct-sheet-body">
              <div>
                <div className="ct-sheet-lbl">Category</div>
                <div className="ct-sheet-cats">
                  <button className={`ct-sheet-cat${category===''?' on':''}`} onClick={() => setCategory('')}>All Categories</button>
                  {categories.map(c => (
                    <button key={c._id} className={`ct-sheet-cat${category===c._id?' on':''}`} onClick={() => setCategory(c._id)}>{c.name}</button>
                  ))}
                </div>
              </div>
              {category && subcategories.length > 0 && (
                <div>
                  <div className="ct-sheet-lbl">Subcategory</div>
                  <div className="ct-sheet-cats">
                    {subcategories.map(s => (
                      <button key={s._id} className={`ct-sheet-cat${subCategory===s._id?' on':''}`} onClick={() => setSubCategory(s._id)}>{s.name}</button>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <div className="ct-sheet-lbl">Brand</div>
                <div className="ct-sheet-cats">
                  <button className={`ct-sheet-cat${brand===''?' on':''}`} onClick={() => setBrand('')}>All Brands</button>
                  {brands.map(b => (
                    <button key={b._id} className={`ct-sheet-cat${brand===b._id?' on':''}`} onClick={() => setBrand(b._id)}>{b.name}</button>
                  ))}
                </div>
              </div>
              <div>
                <div className="ct-sheet-lbl">Price Range (₹)</div>
                <div className="ct-price-row">
                  <div className="ct-price-inp-w"><span className="ct-price-pfx">₹</span><input className="ct-price-inp" placeholder="Min" value={minPrice} onChange={e => setMinPrice(e.target.value)}/></div>
                  <div className="ct-price-inp-w"><span className="ct-price-pfx">₹</span><input className="ct-price-inp" placeholder="Max" value={maxPrice} onChange={e => setMaxPrice(e.target.value)}/></div>
                </div>
              </div>
              <button className="ct-sheet-apply" onClick={() => setFiltersOpen(false)}>Apply Filters</button>
            </div>
          </div>
        </>
      )}

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
    </div>
    </>
  )
}

/* ══════════════════════════════════════════
   PRODUCT CARD
══════════════════════════════════════════ */
function ProductCard({ p, authed, addToCart, navigate, index, setRecOpen, setRecItems }) {
  // Calculate overall stock status based on variants
  const totalStock = Array.isArray(p.variants) && p.variants.length > 0
    ? p.variants.filter(v => v.isActive !== false).reduce((sum, v) => sum + (v.stock || 0), 0)
    : (p.stock || 0)
  
  // Find the lowest price among active variants
  const minPrice = useMemo(() => {
    if (!Array.isArray(p.variants) || p.variants.length === 0) return p.price;
    const activeVariants = p.variants.filter(v => v.isActive !== false && v.price > 0);
    if (activeVariants.length === 0) return p.price;
    return Math.min(...activeVariants.map(v => v.price));
  }, [p.variants, p.price]);

  // Find the MRP corresponding to the min price or the highest MRP
  const displayMrp = useMemo(() => {
    if (!Array.isArray(p.variants) || p.variants.length === 0) return p.mrp || p.price;
    const variantWithMinPrice = p.variants.find(v => v.isActive !== false && v.price === minPrice);
    return variantWithMinPrice?.mrp || p.mrp || minPrice;
  }, [p.variants, minPrice, p.mrp]);

  const hasMultiplePrices = useMemo(() => {
    if (!Array.isArray(p.variants) || p.variants.length <= 1) return false;
    const prices = new Set(p.variants.filter(v => v.isActive !== false && v.price > 0).map(v => v.price));
    return prices.size > 1;
  }, [p.variants]);

  const status   = getStockStatus(totalStock)
  const hasBulk  = p.bulkDiscountQuantity > 0
  const discount = displayMrp > minPrice
    ? Math.round(((displayMrp - minPrice) / displayMrp) * 100) : 0

  const [wished, setWished] = useState(() => {
    try { return JSON.parse(localStorage.getItem('wishlist') || '[]').includes(p._id) } catch { return false }
  })

  const toggleWish = (e) => {
    e.stopPropagation(); e.preventDefault()
    try {
      const arr  = JSON.parse(localStorage.getItem('wishlist') || '[]')
      const next = arr.includes(p._id) ? arr.filter(id => id !== p._id) : [...arr, p._id]
      localStorage.setItem('wishlist', JSON.stringify(next)); setWished(!arr.includes(p._id))
    } catch {}
  }
  const share = (e) => {
    e.stopPropagation(); e.preventDefault()
    const url = `${window.location.origin}/products/${p._id}`
    if (navigator.share) navigator.share({ title: p.name, url }).catch(() => {})
    else navigator.clipboard?.writeText(url)
  }

  return (
    <div className="ct-card" style={{ animationDelay: `${index * 38}ms` }} onClick={() => navigate(`/products/${p._id}`)}>

      {/* image zone */}
      <div className="ct-card-img-z">
        {p.images?.length
          ? <img src={getCloudinaryUrl(p.images[0].url, 300)} alt={p.name} className="ct-card-img" loading="lazy" width="300" height="300" />
          : <span className="ct-card-img-ph">📦</span>}
        <div className="ct-card-bar"/>

        {/* BULK BADGE */}
        {authed && hasBulk && (
          <div className="ct-bulk">
            <span className="ct-bulk-dot"/>
            Bulk Offer
          </div>
        )}

        {/* DISCOUNT BADGE (no bulk) */}
        {authed && !hasBulk && discount >= 10 && (
          <div className="ct-disc">{discount}% OFF</div>
        )}

        {/* actions */}
        <div className="ct-actions">
          <button className={`ct-act-btn${wished ? ' wished' : ''}`} onClick={toggleWish}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill={wished ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={wished ? 0 : 2}>
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </button>
          <button className="ct-act-btn" onClick={share}>
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
              <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98"/>
            </svg>
          </button>
        </div>
      </div>

      {/* body */}
      <div className="ct-body">
        {/* top row */}
        <div className="ct-top-row">
          {p.ratingCount > 0 ? (
            <div style={{display:'flex',alignItems:'center'}}>
              <div className="ct-stars">
                {[1,2,3,4,5].map(s => (
                  <svg key={s} className="ct-star" viewBox="0 0 24 24" fill={s <= Math.round(p.ratingAvg || 0) ? '#f59e0b' : '#e5e7eb'}>
                    <path d="M12 .587l3.668 7.431L24 9.748l-6 5.848L19.335 24 12 19.771 4.665 24 6 15.596 0 9.748l8.332-1.73z"/>
                  </svg>
                ))}
              </div>
              <span className="ct-rat-ct">({p.ratingCount >= 1000 ? `${(p.ratingCount/1000).toFixed(1)}k` : p.ratingCount})</span>
            </div>
          ) : (
            <span className="ct-cat-pill">{p.category?.name || (typeof p.category === 'string' ? p.category : 'General')}</span>
          )}
          <span className="ct-verified">
            <svg width="8" height="8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
            Verified
          </span>
        </div>

        {/* name */}
        <Link to={`/products/${p._id}`} onClick={e => e.stopPropagation()} className="ct-pname">{p.name}</Link>

        {/* price + cart */}
        <div className="ct-price-area">
          <div>
            {authed ? (
              <>
                <div className="ct-price-authed">
                  {hasMultiplePrices && <span style={{fontSize:10,color:'#9ca3af',marginRight:4,textTransform:'uppercase',fontWeight:800}}>From</span>}
                  ₹{Number(minPrice).toLocaleString()}
                  {displayMrp > minPrice && (
                    <span className="ct-price-off">
                      {Math.round(((displayMrp - minPrice) / displayMrp) * 100)}% OFF
                    </span>
                  )}
                </div>
                {displayMrp > minPrice && <div className="ct-price-mrp">MRP ₹{Number(displayMrp).toLocaleString()}</div>}
              </>
            ) : (
              <>
                {/* ── PREMIUM MASKED PRICE ── */}
                <Link to="/login" className="ct-price-mask" onClick={e => e.stopPropagation()} title="Login to see price">
                  <span className="ct-rupee">₹</span>
                  <span className="ct-stars-blur">****</span>
                  {/* 👁️ eye icon */}
                  <svg className="ct-eye" width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                </Link>
                <div className="ct-mask-hint">Login to view</div>
              </>
            )}
          </div>

          <button
            className="ct-atc"
            disabled={!authed || totalStock <= 0}
            title={!authed ? 'Login to add' : totalStock <= 0 ? 'Out of stock' : p.variants?.length > 0 ? 'Select options' : 'Add to cart'}
            onClick={async e => {
              e.stopPropagation(); e.preventDefault()
              if (!authed) { navigate('/login'); return }
              
              // If product has variants, redirect to detail page for selection
              if (p.variants?.length > 0) {
                navigate(`/products/${p._id}`)
                return
              }

              const ok = await addToCart(p)
              if (ok) {
                try {
                  const { data } = await api.get(`/api/recommendations/frequently-bought/${p._id}`)
                  const filtered = (data || []).filter(i => (i._id||i.id) !== p._id)
                  setRecItems(filtered)
                  if (filtered.length > 0) setRecOpen(true)
                } catch {}
              }
            }}
          >
            {p.variants?.length > 0 ? (
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M7 6h13l-1.2 7H9.2L7 6Z" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="10" cy="19" r="1.4" fill="currentColor"/>
                <circle cx="17" cy="19" r="1.4" fill="currentColor"/>
              </svg>
            )}
          </button>
        </div>

        {/* tags */}
        <div className="ct-tags">
          <span className="ct-tag" style={{
            background: totalStock<=0 ? 'rgba(220,38,38,.08)' : totalStock<=5 ? 'rgba(245,158,11,.08)' : 'rgba(5,150,105,.08)',
            color:      totalStock<=0 ? '#dc2626' : totalStock<=5 ? '#d97706' : '#059669',
            border:     `1px solid ${totalStock<=0 ? 'rgba(220,38,38,.18)' : totalStock<=5 ? 'rgba(245,158,11,.18)' : 'rgba(5,150,105,.18)'}`,
          }}>{status.text}</span>
          <span className="ct-tag" style={{background:'rgba(124,58,237,.08)',color:'#7c3aed',border:'1px solid rgba(124,58,237,.15)'}}>⚡ Fast</span>
          {p.gst > 0 && <span className="ct-tag" style={{background:'rgba(5,150,105,.08)',color:'#059669',border:'1px solid rgba(5,150,105,.15)'}}>GST</span>}
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════
   SUGGEST LIST (YT STYLE)
══════════════════════════════════════════ */
function SuggestList({ items, setQ }) {
  const [active, setActive] = useState(0)
  const navigate = useNavigate()
  return (
    <div className="ct-suggest">
      {items.map((s, i) => (
        <div
          key={s.id}
          className={`ct-suggest-item${i===active?' act':''}`}
          onMouseEnter={() => setActive(i)}
          onClick={() => navigate(`/products/${s.id}`)}
        >
          <div className="ct-sug-ico">
            <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </div>
          <div className="ct-sug-thumb">
            {s.image ? <img src={getCloudinaryUrl(s.image, 100)} alt={s.name} loading="lazy" width="40" height="40" /> : <span style={{fontSize:15,opacity:.25}}>📦</span>}
          </div>
          <div style={{flex:1,minWidth:0}}>
            <div className="ct-sug-name">{s.name}</div>
            <div className="ct-sug-cat">{s.category?.name || (typeof s.category === 'string' ? s.category : 'General')}</div>
          </div>
          <div className="ct-sug-fill" onClick={e => { e.stopPropagation(); setQ(s.name) }}>
            <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 17l10-10m0 0H8m9 0v9"/>
            </svg>
          </div>
        </div>
      ))}
    </div>
  )
}