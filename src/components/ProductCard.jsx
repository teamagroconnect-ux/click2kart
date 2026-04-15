import React, { useState, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../lib/api';
import { getCloudinaryUrl } from '../lib/cloudinary';
import { getStockStatus } from '../lib/CartContext';

export default function ProductCard({ p, authed, addToCart, navigate, index, setRecOpen, setRecItems }) {
  const location = useLocation()
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

  const status = getStockStatus(totalStock)
  const hasBulk = p.bulkDiscountQuantity > 0
  const discount = displayMrp > minPrice
    ? Math.round(((displayMrp - minPrice) / displayMrp) * 100) : 0

  const [wished, setWished] = useState(() => {
    try { return JSON.parse(localStorage.getItem('wishlist') || '[]').includes(p._id) } catch { return false }
  })

  const toggleWish = (e) => {
    e.stopPropagation(); e.preventDefault()
    try {
      const arr = JSON.parse(localStorage.getItem('wishlist') || '[]')
      const next = arr.includes(p._id) ? arr.filter(id => id !== p._id) : [...arr, p._id]
      localStorage.setItem('wishlist', JSON.stringify(next)); setWished(!arr.includes(p._id))
    } catch { }
  }
  const share = (e) => {
    e.stopPropagation(); e.preventDefault()
    const url = `${window.location.origin}/products/${p._id}`
    if (navigator.share) navigator.share({ title: p.name, url }).catch(() => { })
    else navigator.clipboard?.writeText(url)
  }

  return (
    <div className="ct-card" style={{ animationDelay: `${index * 38}ms` }} onClick={() => navigate(`/products/${p._id}`)}>

      {/* image zone */}
      <div className="ct-card-img-z">
        {p.images?.length
          ? <img src={getCloudinaryUrl(p.images[0].url, 300)} alt={p.name} className="ct-card-img" loading="lazy" width="300" height="300" />
          : <span className="ct-card-img-ph">📦</span>}
        <div className="ct-card-bar" />

        {/* BULK BADGE */}
        {authed && hasBulk && (
          <div className="ct-bulk">
            <span className="ct-bulk-dot" />
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
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </button>
          <button className="ct-act-btn" onClick={share}>
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
              <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" />
            </svg>
          </button>
        </div>
      </div>

      {/* body */}
      <div className="ct-body">
        {/* top row */}
        <div className="ct-top-row">
          {p.ratingCount > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div className="ct-stars">
                {[1, 2, 3, 4, 5].map(s => (
                  <svg key={s} className="ct-star" viewBox="0 0 24 24" fill={s <= Math.round(p.ratingAvg || 0) ? '#f59e0b' : '#e5e7eb'}>
                    <path d="M12 .587l3.668 7.431L24 9.748l-6 5.848L19.335 24 12 19.771 4.665 24 6 15.596 0 9.748l8.332-1.73z" />
                  </svg>
                ))}
              </div>
              <span className="ct-rat-ct">({p.ratingCount >= 1000 ? `${(p.ratingCount / 1000).toFixed(1)}k` : p.ratingCount})</span>
            </div>
          ) : (
            <span className="ct-cat-pill">{p.category?.name || (typeof p.category === 'string' ? p.category : 'General')}</span>
          )}
          <span className="ct-verified">
            <svg width="8" height="8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
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
                  {hasMultiplePrices && <span style={{ fontSize: 10, color: '#9ca3af', marginRight: 4, textTransform: 'uppercase', fontWeight: 800 }}>From</span>}
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
                <Link to="/login" state={{ from: location.pathname + location.search }} className="ct-price-mask" onClick={e => e.stopPropagation()} title="Login to see price">
                  <span className="ct-rupee">₹</span>
                  <span className="ct-stars-blur">****</span>
                  {/* 👁️ eye icon */}
                  <svg className="ct-eye" width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
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
              if (!authed) { navigate('/login', { state: { from: location.pathname + location.search } }); return }

              // If product has variants, redirect to detail page for selection
              if (p.variants?.length > 0) {
                navigate(`/products/${p._id}`)
                return
              }

              const ok = await addToCart(p)
              if (ok) {
                try {
                  const { data } = await api.get(`/api/recommendations/frequently-bought/${p._id}`)
                  const filtered = (data || []).filter(i => (i._id || i.id) !== p._id)
                  setRecItems(filtered)
                  if (filtered.length > 0) setRecOpen(true)
                } catch { }
              }
            }}
          >
            {p.variants?.length > 0 ? (
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M7 6h13l-1.2 7H9.2L7 6Z" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="10" cy="19" r="1.4" fill="currentColor" />
                <circle cx="17" cy="19" r="1.4" fill="currentColor" />
              </svg>
            )}
          </button>
        </div>

        {/* tags */}
        <div className="ct-tags">
          <span className="ct-tag" style={{
            background: totalStock <= 0 ? 'rgba(220,38,38,.08)' : totalStock <= 5 ? 'rgba(245,158,11,.08)' : 'rgba(5,150,105,.08)',
            color: totalStock <= 0 ? '#dc2626' : totalStock <= 5 ? '#d97706' : '#059669',
            border: `1px solid ${totalStock <= 0 ? 'rgba(220,38,38,.18)' : totalStock <= 5 ? 'rgba(245,158,11,.18)' : 'rgba(5,150,105,.18)'}`,
          }}>{status.text}</span>
          <span className="ct-tag" style={{ background: 'rgba(124,58,237,.08)', color: '#7c3aed', border: '1px solid rgba(124,58,237,.15)' }}>⚡ Fast</span>
          {p.gst > 0 && <span className="ct-tag" style={{ background: 'rgba(5,150,105,.08)', color: '#059669', border: '1px solid rgba(5,150,105,.15)' }}>GST</span>}
        </div>
      </div>
    </div>
  )
}
