import React, { useState, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { getCloudinaryUrl } from '../lib/cloudinary';
import { getStockStatus } from '../lib/CartContext';

export default function ProductCard({ p, authed, addToCart, navigate, index, setRecOpen, setRecItems }) {
  const location = useLocation()
  const queryClient = useQueryClient()

  const prefetchProduct = () => {
    queryClient.prefetchQuery({
      queryKey: ['product', p._id],
      queryFn: () => api.get(`/api/products/${p._id}`).then(res => res.data),
      staleTime: 1000 * 60 * 5,
    })
  }

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
    <div 
      className="ct-card group" 
      style={{ 
        animationDelay: `${index * 38}ms`,
        background: 'white',
        borderRadius: '20px',
        border: '1px solid rgba(124, 58, 237, 0.08)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
        position: 'relative'
      }}
      onClick={() => navigate(`/products/${p._id}`)}
      onMouseEnter={prefetchProduct}
    >
      {/* Image Section */}
      <div style={{ 
        position: 'relative', 
        aspectRatio: '1', 
        background: '#fcfaff', 
        overflow: 'hidden'
      }}>
        {/* Top Badges Row */}
        <div style={{ 
          position: 'absolute', top: 10, left: 10, right: 10, 
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
          zIndex: 10 
        }}>
          <div style={{ display: 'flex', gap: 6 }}>
            {authed && hasBulk && (
              <div style={{ 
                background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                color: 'white', padding: '4px 10px', borderRadius: '6px',
                fontSize: '9px', fontWeight: 900, textTransform: 'uppercase',
                boxShadow: '0 4px 12px rgba(124, 58, 237, 0.2)'
              }}>
                Bulk Offer
              </div>
            )}
            {authed && !hasBulk && discount >= 10 && (
              <div style={{ 
                background: '#059669', color: 'white', 
                padding: '4px 10px', borderRadius: '6px',
                fontSize: '9px', fontWeight: 900, textTransform: 'uppercase'
              }}>
                {discount}% OFF
              </div>
            )}
          </div>

          <button 
            onClick={toggleWish}
            style={{ 
              width: 30, height: 30, borderRadius: '50%', 
              background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: 'none',
              color: wished ? '#ef4444' : '#d1d5db', transition: 'all 0.2s'
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill={wished ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2}>
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </button>
        </div>

        {/* Product Image */}
        <div style={{ width: '100%', height: '100%', padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {p.images?.length ? (
            <img 
              src={getCloudinaryUrl(p.images[0].url, 400)} 
              alt="" 
              loading="lazy" 
              style={{ width: '100%', height: '100%', objectFit: 'contain', transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)' }}
              className="group-hover:scale-110"
            />
          ) : (
            <span style={{ fontSize: '40px', opacity: 0.1 }}>📦</span>
          )}
        </div>

        {/* Verified Badge - Floating inside image at bottom */}
        <div style={{ 
          position: 'absolute', bottom: 10, left: 10, 
          background: 'rgba(255, 255, 255, 0.95)', 
          backdropFilter: 'blur(4px)',
          border: '1px solid rgba(124, 58, 237, 0.12)',
          padding: '3px 8px',
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          zIndex: 5,
          boxShadow: '0 2px 10px rgba(0,0,0,0.04)'
        }}>
          <span style={{ fontSize: '8px', fontWeight: 800, color: '#9ca3af' }}>
            {p._id?.toString().slice(-8).toUpperCase()}
          </span>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="#7c3aed">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
          </svg>
          <span style={{ fontSize: '8px', fontWeight: 900, color: '#7c3aed', letterSpacing: '0.05em' }}>VERIFIED</span>
        </div>
      </div>

      {/* Content Section */}
      <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: 6 }}>
          {p.category?.name && (
            <span style={{ 
              fontSize: '8px', fontWeight: 900, color: '#7c3aed', 
              background: 'rgba(124, 58, 237, 0.05)', 
              padding: '2px 6px', borderRadius: '4px', 
              textTransform: 'uppercase', letterSpacing: '0.08em' 
            }}>
              {p.category.name}
            </span>
          )}
        </div>

        <Link 
          to={`/products/${p._id}`} 
          onClick={e => e.stopPropagation()} 
          style={{ 
            fontSize: '14px', fontWeight: 700, color: '#111827', 
            lineHeight: 1.4, marginBottom: 12, display: '-webkit-box', 
            WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
            minHeight: '2.8em', textDecoration: 'none', transition: 'color 0.2s'
          }}
          className="hover:text-purple-600"
        >
          {p.name}
        </Link>

        {/* Pricing & CTA */}
        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 10 }}>
          <div style={{ flex: 1 }}>
            {authed ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 1 }}>
                  <span style={{ fontSize: '20px', fontWeight: 800, color: '#111827' }}>
                    ₹{Number(minPrice).toLocaleString()}
                  </span>
                  {displayMrp > minPrice && (
                    <span style={{ 
                      fontSize: '10px', fontWeight: 800, color: '#059669', 
                      background: 'rgba(5, 150, 105, 0.08)', 
                      padding: '1px 5px', borderRadius: '4px' 
                    }}>
                      -{Math.round(((displayMrp - minPrice) / displayMrp) * 100)}%
                    </span>
                  )}
                </div>
                {displayMrp > minPrice && (
                  <div style={{ fontSize: '11px', color: '#9ca3af', textDecoration: 'line-through' }}>
                    MRP ₹{Number(displayMrp).toLocaleString()}
                  </div>
                )}
              </>
            ) : (
              <Link to="/login" style={{ textDecoration: 'none' }}>
                <div style={{ 
                  display: 'inline-flex', alignItems: 'center', gap: 5, 
                  background: '#f9fafb', border: '1px solid #f3f4f6', 
                  padding: '5px 10px', borderRadius: '8px'
                }}>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#7c3aed' }}>₹</span>
                  <span style={{ filter: 'blur(3px)', fontWeight: 900, color: '#7c3aed', letterSpacing: '1px' }}>****</span>
                  <svg width="10" height="10" fill="none" stroke="#7c3aed" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <div style={{ fontSize: '8px', fontWeight: 800, color: '#7c3aed', marginTop: 3, textTransform: 'uppercase' }}>Login for Price</div>
              </Link>
            )}
          </div>

          <button
            disabled={!authed || totalStock <= 0}
            style={{ 
              width: 40, height: 40, borderRadius: '12px', 
              background: totalStock <= 0 ? '#f3f4f6' : 'linear-gradient(135deg, #7c3aed, #6d28d9)',
              color: totalStock <= 0 ? '#9ca3af' : 'white',
              border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: totalStock <= 0 ? 'not-allowed' : 'pointer',
              boxShadow: totalStock <= 0 ? 'none' : '0 4px 12px rgba(124, 58, 237, 0.2)',
              transition: 'all 0.2s'
            }}
            onClick={async e => {
              e.stopPropagation(); e.preventDefault()
              if (!authed) { navigate('/login', { state: { from: location.pathname + location.search } }); return }
              if (p.variants?.length > 0) { navigate(`/products/${p._id}`); return }
              const ok = await addToCart(p)
              if (ok && typeof setRecOpen === 'function') {
                try {
                  const { data } = await api.get(`/api/recommendations/frequently-bought/${p._id}`)
                  const filtered = (data || []).filter(i => (i._id || i.id) !== p._id)
                  setRecItems(filtered)
                  if (filtered.length > 0) setRecOpen(true)
                } catch { }
              }
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path d={p.variants?.length > 0 ? "M9 5l7 7-7 7" : "M12 4v16m8-8H4"} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Clean Bottom Tags Row */}
        <div style={{ 
          marginTop: 14, paddingTop: 10, 
          borderTop: '1px solid #f3f4f6',
          display: 'flex', gap: 8
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <div style={{ width: 4, height: 4, background: '#059669', borderRadius: '50%' }} />
            <span style={{ fontSize: '8px', fontWeight: 800, color: '#374151', textTransform: 'uppercase' }}>In Stock</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <span style={{ fontSize: '10px' }}>⚡</span>
            <span style={{ fontSize: '8px', fontWeight: 800, color: '#374151', textTransform: 'uppercase' }}>Fast</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <span style={{ fontSize: '10px' }}>🧾</span>
            <span style={{ fontSize: '8px', fontWeight: 800, color: '#374151', textTransform: 'uppercase' }}>GST</span>
          </div>
        </div>
      </div>
    </div>
  )
}
