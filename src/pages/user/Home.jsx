import React, { useEffect, useRef, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { CONFIG } from '../../shared/lib/config.js'
import { SEO } from '../../shared/lib/seo.jsx'
import api from '../../lib/api'
import { getCloudinaryUrl } from '../../lib/cloudinary'

function useCountUp(target, duration = 1800, start = false) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!start) return
    let startTime = null
    const num = parseFloat(target.replace(/[^0-9.]/g, ''))
    const step = (ts) => {
      if (!startTime) startTime = ts
      const progress = Math.min((ts - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setVal(Math.floor(eased * num))
      if (progress < 1) requestAnimationFrame(step)
      else setVal(num)
    }
    requestAnimationFrame(step)
  }, [start])
  return val
}

function StatItem({ n, t, delay }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => e.isIntersecting && setVisible(true), { threshold: 0.3 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  const prefix = n.match(/^[₹]/) ? '₹' : ''
  const suffix = n.replace(/^[₹]?[\d.]+/, '')
  const count = useCountUp(n, 1600, visible)
  return (
    <div ref={ref} className="hm-stat" style={{ animationDelay: `${delay}ms` }}>
      <div className="hm-stat-num">{prefix}{visible ? count : 0}{suffix}</div>
      <div className="hm-stat-label">{t}</div>
    </div>
  )
}

export default function Home() {
  const [scrollY, setScrollY] = useState(0)
  const [cats, setCats] = useState([])
  const [brands, setBrands] = useState([])
  const [recs, setRecs] = useState([])
  const [offers, setOffers] = useState([])
  
  useEffect(() => {
    const fn = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const line1 = CONFIG.HERO_TITLE_LINE1 || 'India\'s Premier'
  const line2 = CONFIG.HERO_TITLE_LINE2 || 'B2B Marketplace'

  useEffect(() => {
    api.get('/api/public/categories').then(({ data }) => setCats(data || [])).catch(() => setCats([]))
    api.get('/api/brands/featured').then(({ data }) => setBrands(data || [])).catch(() => setBrands([]))
    api.get('/api/recommendations/trending').then(({ data }) => setRecs(data || [])).catch(() => setRecs([]))
    api.get('/api/offers?activeOnly=true').then(({ data }) => setOffers(data || [])).catch(() => setOffers([]))
  }, [])

  const tickerLoop = useMemo(() => {
    const fromApi = (offers || [])
      .filter(o => o && (o.title || o.bannerImage))
      .map(o => ({
        key: o._id || o.title,
        label: String(o.title || 'Offer').trim(),
        pill: o.discountPercent != null && o.discountPercent !== '' ? `${o.discountPercent}% off` : 'Live offer',
      }))
    const neutral = [
      { key: 'n1', label: 'GST-ready invoicing · bulk price tiers', pill: 'B2B' },
      { key: 'n2', label: 'Pan-India dispatch on stocked SKUs', pill: 'Logistics' },
      { key: 'n3', label: 'Login for wholesale rates on the catalogue', pill: 'Secure' },
      { key: 'n4', label: 'Verified catalogue · partner onboarding', pill: 'Click2Kart' },
    ]
    const base = fromApi.length > 0 ? fromApi : neutral
    return [...base, ...base]
  }, [offers])

  return (
    <>
      <SEO
        title="India's Premier B2B Electronics Wholesale Marketplace"
        description="Buy electronics wholesale across India with GST billing, secure payments, logistics support and trusted B2B suppliers on Click2Kart."
        url="/"
      />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,700;1,9..40,300;1,9..40,400&display=swap');

        .hm-root {
          font-family: 'DM Sans', system-ui, -apple-system, sans-serif;
          background: radial-gradient(circle at 0% 0%, rgba(255,255,255,1) 0%, rgba(248,245,255,1) 25%, radial-gradient(circle at 100% 100%, rgba(245,243,255,1) 0%, rgba(240,245,255,1) 40%, rgba(255,255,255,1) 100%) 100%);
          color: #1e1b2e;
          overflow-x: hidden;
          padding-bottom: env(safe-area-inset-bottom, 0px);
        }

        .hm-root::before {
          content: '';
          position: fixed; inset: 0;
          background-image: 
            radial-gradient(rgba(124,58,237,0.08) 1px, transparent 1px),
            radial-gradient(rgba(59,130,246,0.06) 1px, transparent 1px);
          background-size: 40px 40px, 60px 60px;
          background-position: 0 0, 30px 30px;
          pointer-events: none; z-index: 0;
        }

        @keyframes hmFloat {
          0%, 100% { transform: translateY(0) rotate(0.25deg); }
          25% { transform: translateY(-12px) rotate(-0.25deg); }
          50% { transform: translateY(-8px) rotate(0.15deg); }
          75% { transform: translateY(-16px) rotate(-0.15deg); }
        }
        .hm-float {
          animation: hmFloat 8s ease-in-out infinite;
        }

        /* Enhanced glow blobs */
        .hm-blob1 {
          position: fixed; 
          top: -600px; left: 50%; transform: translateX(-50%);
          width: 2200px; height: 1400px; border-radius: 50%;
          background: radial-gradient(ellipse at 30% 30%, rgba(124,58,237,0.25) 0%, rgba(59,130,246,0.18) 30%, transparent 70%);
          pointer-events: none; z-index: 0;
          filter: blur(120px);
          animation: blobFloat1 16s ease-in-out infinite;
        }
        @keyframes blobFloat1 {
          0%, 100% { transform: translateX(-50%) scale(1); }
          33% { transform: translateX(-45%) scale(1.1); }
          66% { transform: translateX(-55%) scale(0.95); }
        }
        .hm-blob2 {
          position: fixed; 
          bottom: -500px; right: -400px;
          width: 1200px; height: 1200px; border-radius: 50%;
          background: radial-gradient(ellipse at 70% 70%, rgba(236,72,153,0.22) 0%, rgba(124,58,237,0.16) 40%, transparent 70%);
          pointer-events: none; z-index: 0;
          filter: blur(100px);
          animation: blobFloat2 18s ease-in-out infinite;
        }
        @keyframes blobFloat2 {
          0%, 100% { transform: scale(1) rotate(0deg); }
          50% { transform: scale(1.15) rotate(15deg); }
        }
        .hm-blob3 {
          position: fixed; 
          top: 30%; left: -300px;
          width: 900px; height: 900px; border-radius: 50%;
          background: radial-gradient(ellipse at 50% 50%, rgba(16,185,129,0.14) 0%, rgba(59,130,246,0.08) 35%, transparent 65%);
          pointer-events: none; z-index: 0;
          filter: blur(80px);
          animation: blobFloat3 22s ease-in-out infinite;
        }
        @keyframes blobFloat3 {
          0%, 100% { transform: translateY(0) scale(1) rotate(0deg); }
          25% { transform: translateY(-30px) scale(1.05) rotate(5deg); }
          75% { transform: translateY(15px) scale(0.98) rotate(-3deg); }
        }

        /* ────────────── HERO ────────────── */
        .hm-hero {
          position: relative;
          min-height: 100svh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 180px 24px 140px;
          overflow: hidden;
          z-index: 1;
        }

        .hm-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 14px;
          padding: 12px 28px;
          border-radius: 120px;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(248, 245, 255, 0.98));
          backdrop-filter: blur(30px) saturate(150%);
          border: 1px solid rgba(124, 58, 237, 0.5);
          color: #7c3aed;
          font-size: clamp(7px, 2vw, 10px);
          font-weight: 900;
          letter-spacing: 0.32em;
          text-transform: uppercase;
          margin-bottom: 52px;
          animation: hmFadeUp 0.9s ease both;
          box-shadow:
            0 30px 80px -20px rgba(124, 58, 237, 0.35),
            0 0 40px -10px rgba(124, 58, 237, 0.25) inset,
            0 0 0 1px rgba(255, 255, 255, 0.6) inset;
        }
        .hm-eyebrow-dot {
          width: 10px; height: 10px; border-radius: 50%;
          background: linear-gradient(135deg, #7c3aed 0%, #3b82f6 50%, #ec4899 100%);
          box-shadow: 
            0 0 20px rgba(124,58,237,0.8),
            0 0 40px rgba(59,130,246,0.6);
          animation: hmPulse 2.5s ease infinite;
        }
        @keyframes hmPulse { 
          0%,100%{opacity:1;transform:scale(1);box-shadow: 0 0 20px rgba(124,58,237,0.8), 0 0 40px rgba(59,130,246,0.6)} 
          50%{opacity:0.35;transform:scale(0.65);box-shadow: 0 0 10px rgba(124,58,237,0.4), 0 0 20px rgba(59,130,246,0.3)} 
        }

        .hm-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(80px, 16vw, 220px);
          line-height: 0.80; text-align: center;
          letter-spacing: -0.04em;
          margin-bottom: 40px;
          animation: hmFadeUp 0.9s 0.15s ease both;
          filter: drop-shadow(0 40px 80px rgba(0,0,0,0.18));
        }
        .hm-title .accent {
          background: linear-gradient(135deg, #7c3aed 0%, #3b82f6 30%, #10b981 65%, #ec4899 100%);
          background-size: 300% 300%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          position: relative;
          animation: gradientShift 12s ease infinite;
        }
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .hm-title .accent::after {
          content: '';
          position: absolute;
          bottom: 8px; left: 0; width: 100%; height: 12px;
          background: linear-gradient(90deg, 
            rgba(124,58,237,0.25), 
            rgba(59,130,246,0.2), 
            rgba(16,185,129,0.25), 
            rgba(236,72,153,0.2), 
            rgba(124,58,237,0.25)
          );
          z-index: -1;
          border-radius: 12px;
          filter: blur(4px);
        }

        .hm-sub {
          font-size: clamp(17px, 2.6vw, 22px);
          color: #4b5563; font-weight: 450;
          max-width: 720px; text-align: center; line-height: 1.75;
          margin-bottom: 72px;
          animation: hmFadeUp 0.9s 0.3s ease both;
        }

        .hm-ctas {
          display: flex; flex-direction: column; gap: 20px; align-items: center;
          animation: hmFadeUp 0.8s 0.45s ease both;
        }
        @media(min-width:480px) { .hm-ctas { flex-direction: row; gap: 24px; } }

        .hm-btn-primary {
          display: inline-flex; align-items: center; gap: 18px;
          background: linear-gradient(135deg, #7c3aed, #6366f1, #3b82f6, #ec4899);
          background-size: 400% 400%;
          color: white;
          padding: 26px 64px; border-radius: 32px;
          font-size: 11px; font-weight: 900;
          text-transform: uppercase; letter-spacing: 0.32em;
          text-decoration: none; transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
          box-shadow: 
            0 30px 100px -20px rgba(124,58,237,0.65),
            0 0 60px -15px rgba(124,58,237,0.4) inset,
            0 0 0 1px rgba(255,255,255,0.4) inset;
          position: relative; overflow: hidden;
          animation: bgShift 10s ease infinite;
        }
        @keyframes bgShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .hm-btn-primary::before {
          content: '';
          position: absolute;
          top: 0; left: -120%;
          width: 120%; height: 100%;
          background: linear-gradient(120deg, transparent, rgba(255,255,255,0.55), transparent);
          transition: left 0.7s cubic-bezier(0.23,1,0.32,1);
        }
        .hm-btn-primary:hover { 
          transform: translateY(-16px) scale(1.06); 
          box-shadow: 
            0 45px 120px -25px rgba(124,58,237,0.8),
            0 0 80px -20px rgba(124,58,237,0.5) inset,
            0 0 0 1px rgba(255,255,255,0.6) inset;
        }
        .hm-btn-primary:hover::before { left: 120%; }
        .hm-btn-primary:active { transform: translateY(-8px) scale(0.98); }

        .hm-btn-secondary {
          display: inline-flex; align-items: center; gap: 18px;
          border: 2px solid rgba(124,58,237,0.4);
          background: rgba(255, 255, 255, 0.92);
          backdrop-filter: blur(30px) saturate(160%);
          color: #7c3aed;
          padding: 26px 64px; border-radius: 32px;
          font-size: 11px; font-weight: 900;
          text-transform: uppercase; letter-spacing: 0.32em;
          text-decoration: none; transition: all 0.6s cubic-bezier(0.23,1,0.32,1);
          box-shadow: 
            0 10px 60px -20px rgba(124,58,237,0.25),
            0 0 0 1px rgba(255,255,255,0.9) inset;
        }
        .hm-btn-secondary:hover {
          background: linear-gradient(135deg, rgba(255,255,255,1), rgba(248,245,255,1));
          border-color: #7c3aed;
          transform: translateY(-12px);
          box-shadow: 
            0 35px 90px -25px rgba(124,58,237,0.35),
            0 0 0 1px rgba(124,58,237,0.15) inset;
        }
        .hm-btn-secondary:active { transform: translateY(-4px) scale(0.98); }

        .hm-trust-grid {
          display: grid; grid-template-columns: repeat(2, 1fr);
          gap: 28px; width: 100%; max-width: 1200px; margin-top: 120px;
          animation: hmFadeUp 0.9s 0.6s ease both;
        }
        @media(min-width:640px) { .hm-trust-grid { grid-template-columns: repeat(4,1fr); gap: 32px; } }

        .hm-trust-card {
          background: linear-gradient(145deg, rgba(255,255,255,0.98), rgba(248,245,255,0.96));
          backdrop-filter: blur(30px) saturate(180%);
          border: 1px solid rgba(124,58,237,0.22);
          border-radius: 40px; padding: 44px 32px;
          transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
          position: relative; overflow: hidden;
          box-shadow: 
            0 20px 80px -25px rgba(124,58,237,0.25),
            0 0 0 1px rgba(255,255,255,0.9) inset;
          text-align: center;
          transform-style: preserve-3d;
          perspective: 1200px;
        }
        .hm-trust-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 50% -20%, rgba(124,58,237,0.18), transparent 60%);
          opacity: 0; transition: opacity 0.6s;
        }
        .hm-trust-card:hover {
          border-color: rgba(124,58,237,0.7);
          transform: translateY(-22px) rotateX(6deg) scale(1.03);
          box-shadow: 
            0 60px 120px -30px rgba(124,58,237,0.35),
            0 0 0 1px rgba(124,58,237,0.2) inset;
          background: linear-gradient(145deg, rgba(255,255,255,1), rgba(250,245,255,1));
        }
        .hm-trust-card:hover::before { opacity: 1; }
        .hm-trust-icon { 
          font-size: 56px; margin-bottom: 24px; display: block;
          filter: drop-shadow(0 25px 35px rgba(0,0,0,0.22));
          transition: transform 0.6s cubic-bezier(0.23,1,0.32,1);
        }
        .hm-trust-card:hover .hm-trust-icon {
          transform: scale(1.35) rotate(10deg) translateZ(30px);
        }
        .hm-trust-title { font-size: 16px; font-weight: 800; color: #111827; margin-bottom: 10px; letter-spacing: -0.02em; }
        .hm-trust-desc { font-size: 14px; color: #6b7280; line-height: 1.75; font-weight: 450; }

        .hm-scroll-hint {
          position: absolute;
          bottom: 40px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          opacity: 0.35;
          animation: hmFadeUp 0.9s 1.2s ease both;
          z-index: 10;
        }
        .hm-scroll-hint span { font-size: 9px; letter-spacing: 0.26em; text-transform: uppercase; color: #9ca3af; font-weight: 800; }
        .hm-scroll-line {
          width: 2px; height: 60px;
          background: linear-gradient(to bottom, 
            transparent,
            #7c3aed,
            #3b82f6,
            #10b981,
            #ec4899,
            transparent
          );
          animation: hmScrollLine 3s ease infinite;
        }
        @keyframes hmScrollLine {
          0%{transform:scaleY(0);transform-origin:top}
          25%{transform:scaleY(0.6);transform-origin:top}
          50%{transform:scaleY(1);transform-origin:top}
          51%{transform-origin:bottom}
          100%{transform:scaleY(0);transform-origin:bottom}
        }

        /* ────────────── BRANDS (logo-only) ────────────── */
        .hm-brands-section {
          padding: 160px 24px 140px; 
          background: linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(248,245,255,0.85) 50%, rgba(255,255,255,1) 100%);
          position: relative; zIndex: 1;
        }
        .hm-brands-inner { max-width: 1280px; margin: 0 auto; }
        .hm-brands-head { text-align: center; margin-bottom: 64px; }
        .hm-brands-kicker {
          display: inline-flex; align-items: center; gap: 12px;
          font-size: 10px; font-weight: 800; letter-spacing: 0.3em;
          text-transform: uppercase; color: #7c3aed; margin-bottom: 18px;
        }
        .hm-brands-kicker::before, .hm-brands-kicker::after {
          content: ''; width: 32px; height: 2px; background: linear-gradient(90deg, transparent, rgba(124,58,237,0.7));
        }
        .hm-brands-kicker::after { background: linear-gradient(90deg, rgba(124,58,237,0.7), transparent); }
        .hm-brands-title {
          font-family: 'Bebas Neue', sans-serif; font-size: clamp(40px, 6.5vw, 72px);
          color: #111827; letter-spacing: 0.025em; line-height: 1.05; margin-bottom: 16px;
        }
        .hm-brands-sub { color: #6b7280; font-size: 16px; font-weight: 450; max-width: 580px; margin: 0 auto; line-height: 1.7; }
        
        .hm-brands-scroll-container {
          overflow-x: auto;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .hm-brands-scroll-container::-webkit-scrollbar {
          display: none;
        }
        
        .hm-brands-grid {
          display: flex;
          gap: 24px;
          padding: 16px 0;
          animation: hmScrollBrands 60s linear infinite;
        }
        .hm-brands-grid:hover {
          animation-play-state: paused;
        }
        
        @keyframes hmScrollBrands {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        
        .hm-brand-logo-card {
          flex-shrink: 0;
          width: 160px;
          aspect-ratio: 1;
          border-radius: 36px;
          background: linear-gradient(145deg, rgba(255,255,255,1), rgba(248,245,255,1));
          border: 1px solid rgba(124,58,237,0.18);
          box-shadow: 
            0 10px 40px -15px rgba(0,0,0,0.08),
            0 0 0 1px rgba(255,255,255,0.9) inset;
          display: flex; align-items: center; justify-content: center;
          padding: 32px;
          text-decoration: none;
          overflow: hidden;
          transition: all 0.5s cubic-bezier(0.23,1,0.32,1);
        }
        .hm-brand-logo-card::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 36px;
          padding: 2.5px;
          background: linear-gradient(135deg, #7c3aed, #3b82f6, #10b981, #ec4899, #7c3aed);
          background-size: 300% 300%;
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          opacity: 0;
          transition: opacity 0.5s;
          animation: borderGradient 8s linear infinite;
        }
        @keyframes borderGradient {
          0% { background-position: 0% 50%; }
          100% { background-position: 100% 50%; }
        }
        .hm-brand-logo-card:hover {
          transform: translateY(-16px) scale(1.06);
          box-shadow: 
            0 40px 90px -25px rgba(124,58,237,0.35),
            0 0 0 1px rgba(255,255,255,0.8) inset;
        }
        .hm-brand-logo-card:hover::before {
          opacity: 1;
        }
        .hm-brand-logo-card img {
          max-width: 100%; max-height: 100%; width: auto; height: auto;
          object-fit: contain;
          transition: transform 0.5s cubic-bezier(0.23,1,0.32,1);
          filter: drop-shadow(0 8px 16px rgba(0,0,0,0.1));
        }
        .hm-brand-logo-card:hover img {
          transform: scale(1.18);
        }
        .hm-brand-logo-fallback {
          font-size: 44px; line-height: 1; opacity: 0.3;
        }

        /* ────────────── STATS BAND ────────────── */
        .hm-stats-section {
          position: relative; z-index: 1;
          background: linear-gradient(135deg, #1e1b2e 0%, #312e81 45%, #1f2937 100%);
          padding: 100px 24px;
          overflow: hidden;
        }
        .hm-stats-section::before {
          content: ''; position: absolute; inset: 0;
          background-image: 
            radial-gradient(circle at 20% 50%, rgba(124,58,237,0.22) 0%, transparent 55%),
            radial-gradient(circle at 80% 50%, rgba(59,130,246,0.18) 0%, transparent 55%);
        }
        .hm-stats-section::after {
          content: ''; position: absolute; inset: 0;
          background-image: 
            radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px);
          background-size: 30px 30px;
          opacity: 0.3;
        }

        /* ── TICKER ── */
        .hm-ticker-section {
          background: linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%);
          padding: 18px 0;
          overflow: hidden;
          position: relative;
          z-index: 10;
          border-bottom: 1px solid rgba(255,255,255,0.18);
          box-shadow: 0 10px 60px -20px rgba(124,58,237,0.45);
        }
        .hm-ticker-inner {
          display: flex;
          width: fit-content;
          animation: hmTicker 40s linear infinite;
        }
        .hm-ticker-item {
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 0 56px;
          color: white;
          font-weight: 800;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          white-space: nowrap;
        }
        .hm-ticker-item span.highlight {
          background: white;
          color: #7c3aed;
          padding: 5px 14px;
          border-radius: 12px;
          font-size: 10px;
          box-shadow: 0 10px 30px -10px rgba(0,0,0,0.3);
        }
        .hm-ticker-item .fire { font-size: 18px; }

        @keyframes hmTicker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .hm-stats-inner {
          max-width: 920px; margin: 0 auto;
          display: grid; grid-template-columns: repeat(2, 1fr);
          gap: 48px 32px;
          position: relative; z-index: 1;
        }
        @media(min-width:640px) { .hm-stats-inner { grid-template-columns: repeat(4,1fr); } }

        .hm-stat { text-align: center; opacity: 0; animation: hmFadeUp 0.8s ease both; }
        .hm-stat-num {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(56px, 8vw, 96px);
          background: linear-gradient(to bottom right, #ffffff, #93c5fd, #a5b4fc, #f9a8d4);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1; letter-spacing: 0.03em;
          filter: drop-shadow(0 20px 40px rgba(0,0,0,0.35));
        }
        .hm-stat-label {
          font-size: 11px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.24em; color: rgba(255,255,255,0.8); margin-top: 10px;
        }

        .hm-divider {
          width: 100%; height: 1px; position: relative; z-index: 1;
          background: linear-gradient(90deg, transparent, rgba(124,58,237,0.28), rgba(59,130,246,0.25), rgba(16,185,129,0.28), transparent);
        }

        /* ────────────── FEATURES ────────────── */
        .hm-features-section {
          max-width: 1280px; margin: 0 auto;
          padding: 120px 24px; position: relative; z-index: 1;
        }

        .hm-section-label {
          display: inline-flex; align-items: center; gap: 14px;
          font-size: 10px; font-weight: 800; letter-spacing: 0.28em;
          text-transform: uppercase; color: #7c3aed; margin-bottom: 20px;
        }
        .hm-section-label::before { content: ''; width: 36px; height: 2px; background: linear-gradient(90deg, #7c3aed, transparent); border-radius: 4px; }

        .hm-section-heading {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(44px, 6vw, 80px);
          line-height: 1; letter-spacing: 0.02em; color: #111827;
          margin-bottom: 20px;
        }
        .hm-section-heading em { 
          background: linear-gradient(135deg, #7c3aed 0%, #3b82f6 50%, #10b981 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-style: normal; 
        }

        .hm-section-sub {
          font-size: 16px; color: #6b7280; font-weight: 400;
          max-width: 580px; line-height: 1.8; margin-bottom: 72px;
        }

        .hm-features-grid {
          display: grid; grid-template-columns: 1fr;
          gap: 2px;
          background: linear-gradient(135deg, rgba(124,58,237,0.1), rgba(59,130,246,0.08));
          border: 1px solid rgba(124,58,237,0.18);
          border-radius: 28px; overflow: hidden;
          position: relative;
        }
        .hm-features-grid::before {
          content: '';
          position: absolute; inset: 0;
          background: radial-gradient(circle at 50% 0%, rgba(124,58,237,0.15), transparent 65%);
          opacity: 0.8;
          pointer-events: none;
        }
        @media(min-width:540px) { .hm-features-grid { grid-template-columns: repeat(2,1fr); } }
        @media(min-width:900px) { .hm-features-grid { grid-template-columns: repeat(3,1fr); } }

        .hm-feature-item {
          background: rgba(255,255,255,0.98); 
          backdrop-filter: blur(20px);
          padding: 44px 36px;
          transition: all 0.5s cubic-bezier(0.23,1,0.32,1);
          position: relative; z-index: 1;
        }
        .hm-feature-item:hover { 
          background: linear-gradient(145deg, #ffffff, #faf8ff); 
          box-shadow: 
            inset 0 0 0 1px rgba(124,58,237,0.22),
            0 20px 60px -20px rgba(124,58,237,0.2);
          transform: translateY(-4px);
        }
        .hm-feature-item:hover .hm-feature-num { color: #7c3aed; }

        .hm-feature-num {
          font-family: 'Bebas Neue', sans-serif; font-size: 14px;
          letter-spacing: 0.15em; color: #d1d5db; margin-bottom: 22px;
          transition: color 0.5s;
        }
        .hm-feature-icon {
          width: 56px; height: 56px; border-radius: 20px;
          background: linear-gradient(135deg, rgba(124,58,237,0.12), rgba(59,130,246,0.1));
          border: 1px solid rgba(124,58,237,0.2);
          display: flex; align-items: center; justify-content: center;
          font-size: 24px; margin-bottom: 20px;
          box-shadow: 0 6px 24px -12px rgba(124,58,237,0.25);
        }
        .hm-feature-title { font-size: 17px; font-weight: 800; color: #111827; margin-bottom: 12px; letter-spacing: -0.02em; }
        .hm-feature-desc { font-size: 14px; color: #6b7280; line-height: 1.8; font-weight: 420; }

        /* ────────────── CTA ────────────── */
        .hm-cta-section {
          max-width: 1280px; margin: 0 auto 120px;
          padding: 0 24px; position: relative; z-index: 1;
        }

        .hm-cta-inner {
          background: linear-gradient(145deg, rgba(255,255,255,1), rgba(248,245,255,0.98));
          border: 1px solid rgba(124,58,237,0.22);
          border-radius: 40px; padding: 88px 48px;
          text-align: center; position: relative; overflow: hidden;
          box-shadow: 
            0 40px 120px -30px rgba(124,58,237,0.3),
            0 0 0 1px rgba(255,255,255,0.9) inset;
        }
        .hm-cta-inner::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 4px;
          background: linear-gradient(90deg, transparent 10%, #7c3aed 33%, #3b82f6 50%, #10b981 67%, transparent 90%);
        }
        .hm-cta-inner::after {
          content: ''; position: absolute;
          top: -100px; left: 50%; transform: translateX(-50%);
          width: 700px; height: 320px; border-radius: 50%;
          background: radial-gradient(ellipse, rgba(124,58,237,0.12), transparent 70%);
          pointer-events: none;
        }

        .hm-cta-badge {
          display: inline-flex; align-items: center; gap: 10px;
          background: linear-gradient(135deg, rgba(124,58,237,0.12), rgba(59,130,246,0.1));
          border: 1px solid rgba(124,58,237,0.25);
          color: #7c3aed; font-size: 10px; font-weight: 800;
          letter-spacing: 0.24em; text-transform: uppercase;
          padding: 6px 20px; border-radius: 100px;
          margin-bottom: 28px; position: relative; z-index: 1;
        }

        .hm-cta-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(40px, 7vw, 88px);
          line-height: 1; letter-spacing: 0.02em; color: #111827;
          margin-bottom: 24px; position: relative; z-index: 1;
        }
        .hm-cta-title em { 
          background: linear-gradient(135deg, #7c3aed 0%, #3b82f6 50%, #ec4899 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-style: normal; 
        }

        .hm-cta-sub {
          font-size: 17px; color: #6b7280; font-weight: 420;
          max-width: 640px; margin: 0 auto 56px; line-height: 1.8;
          position: relative; z-index: 1;
        }

        .hm-cta-btns {
          display: flex; gap: 18px; justify-content: center; flex-wrap: wrap;
          position: relative; z-index: 1;
        }

        /* ── HOW IT WORKS STEPS ── */
        .hm-steps-section {
          max-width: 1280px; margin: 0 auto 120px;
          padding: 0 24px; position: relative; z-index: 1;
        }

        .hm-steps-header { margin-bottom: 64px; }

        .hm-steps-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
          position: relative;
        }
        @media(min-width:540px) { .hm-steps-grid { grid-template-columns: repeat(2,1fr); } }
        @media(min-width:900px) { .hm-steps-grid { grid-template-columns: repeat(4,1fr); } }

        @media(min-width:900px) {
          .hm-steps-grid::before {
            content: '';
            position: absolute;
            top: 40px; left: calc(12.5% + 24px); right: calc(12.5% + 24px);
            height: 3px;
            background: linear-gradient(90deg,
              rgba(124,58,237,0.4),
              rgba(59,130,246,0.3),
              rgba(16,185,129,0.4)
            );
            z-index: 0;
            border-radius: 10px;
          }
        }

        .hm-step-card {
          background: linear-gradient(145deg, #ffffff, #faf8ff);
          border: 1px solid rgba(124,58,237,0.18);
          border-radius: 28px;
          padding: 36px 32px;
          position: relative; z-index: 1;
          transition: all 0.6s cubic-bezier(0.23,1,0.32,1);
          box-shadow: 
            0 8px 40px -16px rgba(124,58,237,0.15),
            0 0 0 1px rgba(255,255,255,0.9) inset;
        }
        .hm-step-card::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 4px;
          border-radius: 28px 28px 0 0;
          background: linear-gradient(90deg, transparent, rgba(124,58,237,0.45), transparent);
          opacity: 0; transition: opacity 0.6s;
        }
        .hm-step-card:hover { transform: translateY(-10px); box-shadow: 0 24px 80px -25px rgba(124,58,237,0.3), 0 0 0 1px rgba(124,58,237,0.25) inset; }
        .hm-step-card:hover::before { opacity: 1; }

        .hm-step-card.s-active {
          border-color: rgba(124,58,237,0.35);
          background: linear-gradient(145deg, #ffffff, #f8f5ff);
          box-shadow: 0 12px 56px -20px rgba(124,58,237,0.25);
        }
        .hm-step-card.s-active::before { opacity: 1; background: linear-gradient(90deg, transparent, #7c3aed, transparent); }

        .hm-step-card.s-done {
          border-color: rgba(16,185,129,0.3);
          background: linear-gradient(145deg, #ffffff, #f0fdf4);
        }
        .hm-step-card.s-done::before { opacity: 1; background: linear-gradient(90deg, transparent, #10b981, transparent); }

        .hm-step-num {
          width: 52px; height: 52px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 18px; letter-spacing: 0.06em;
          margin-bottom: 24px;
          background: linear-gradient(145deg, #f5f3ff, #f1f5f9);
          border: 2px solid rgba(124,58,237,0.22);
          color: #9ca3af;
          transition: all 0.6s cubic-bezier(0.23,1,0.32,1);
          box-shadow: 0 8px 24px -12px rgba(124,58,237,0.2);
        }
        .hm-step-card:hover .hm-step-num { border-color: rgba(124,58,237,0.5); color: #7c3aed; }
        .hm-step-card.s-active .hm-step-num { 
          background: linear-gradient(135deg, #7c3aed, #6366f1);
          border-color: #7c3aed; color: white; 
          box-shadow: 0 12px 40px -15px rgba(124,58,237,0.45);
        }
        .hm-step-card.s-done .hm-step-num { 
          background: linear-gradient(135deg, #10b981, #34d399);
          border-color: #10b981; color: white; 
          box-shadow: 0 12px 40px -15px rgba(16,185,129,0.45);
          font-size: 16px; 
        }

        .hm-step-tag-pill {
          display: inline-block;
          font-size: 9px; font-weight: 800; letter-spacing: 0.2em; text-transform: uppercase;
          color: #7c3aed; background: linear-gradient(135deg, rgba(124,58,237,0.12), rgba(59,130,246,0.08));
          border: 1px solid rgba(124,58,237,0.22);
          padding: 4px 14px; border-radius: 100px;
          margin-bottom: 14px;
        }
        .hm-step-tag-pill.green { 
          color: #10b981; 
          background: linear-gradient(135deg, rgba(16,185,129,0.12), rgba(59,130,246,0.06));
          border-color: rgba(16,185,129,0.22);
        }

        .hm-step-h {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 22px; color: #111827; letter-spacing: 0.03em; line-height: 1.05;
          margin-bottom: 12px;
        }
        .hm-step-p {
          font-size: 14px; color: #6b7280; font-weight: 420; line-height: 1.8;
        }

        /* ────────────── OFFERS ────────────── */
        .hm-offers-section { max-width: 1280px; margin: 0 auto; padding: 40px 24px 100px; position: relative; z-index: 1; }
        .hm-offers-grid { display: grid; grid-template-columns: 1fr; gap: 28px; }
        @media(min-width:768px) { .hm-offers-grid { grid-template-columns: repeat(2, 1fr); } }
        .hm-offer-card { 
          position: relative; border-radius: 32px; overflow: hidden; aspect-ratio: 16/9; 
          background: linear-gradient(135deg, #f5f3ff, #e0e7ff);
          border: 1px solid rgba(124,58,237,0.2);
          transition: all 0.6s cubic-bezier(0.23,1,0.32,1);
          box-shadow: 0 20px 60px -25px rgba(124,58,237,0.3);
        }
        .hm-offer-card:hover { 
          transform: translateY(-14px) scale(1.02); 
          box-shadow: 0 40px 100px -35px rgba(124,58,237,0.45);
        }
        .hm-offer-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.8s cubic-bezier(0.23,1,0.32,1); }
        .hm-offer-card:hover .hm-offer-img { transform: scale(1.08); }
        .hm-offer-content { 
          position: absolute; inset: 0; padding: 40px; 
          background: linear-gradient(to right, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.55) 45%, transparent 100%);
          display: flex; flex-direction: column; justify-content: center; color: white;
        }
        .hm-offer-tag { 
          display: inline-block; width: fit-content; padding: 6px 18px; border-radius: 100px;
          background: linear-gradient(135deg, #7c3aed, #ec4899);
          font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.2em; 
          margin-bottom: 16px;
          box-shadow: 0 10px 30px -10px rgba(124,58,237,0.5);
        }
        .hm-offer-title { font-family: 'Bebas Neue', sans-serif; font-size: 48px; line-height: 1; letter-spacing: 0.02em; margin-bottom: 16px; }
        .hm-offer-btn { 
          width: fit-content; padding: 14px 32px; border-radius: 20px; background: white; color: #111827;
          font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.2em; 
          transition: all 0.5s cubic-bezier(0.23,1,0.32,1);
          box-shadow: 0 12px 30px -10px rgba(0,0,0,0.4);
        }
        .hm-offer-card:hover .hm-offer-btn { 
          background: linear-gradient(135deg, #7c3aed, #3b82f6);
          color: white;
          box-shadow: 0 20px 50px -15px rgba(124,58,237,0.6);
        }

        @media(max-width:768px) {
          .hm-steps-section { margin-bottom: 80px; }
          .hm-cta-section { margin-bottom: 120px; }
          .hm-cta-inner { padding: 56px 24px; }
          .hm-cta-title { font-size: clamp(36px, 10vw, 56px); }
          .hm-cta-sub { font-size: 15px; margin-bottom: 40px; }
          .hm-features-section { padding: 80px 16px; }
          .hm-hero { padding: 100px 16px 80px; }
          .hm-trust-grid { margin-top: 64px; }
          .hm-btn-primary, .hm-btn-secondary { width: 100%; justify-content: center; padding-inline: 32px; }
          .hm-cta-btns { flex-direction: column; align-items: center; }
          .hm-cta-btns a { width: 100%; max-width: 360px; }
          .hm-offer-title { font-size: 36px; }
        }

        @keyframes hmFadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="hm-root">
        <div className="hm-blob1" />
        <div className="hm-blob2" />
        <div className="hm-blob3" />

        {/* ── HERO ── */}
        <section className="hm-hero">
          <div className="hm-eyebrow hm-float whitespace-nowrap">
            <span className="hm-eyebrow-dot" />
            India's Trusted B2B Wholesale Platform
          </div>

          <h1 className="hm-title hm-float" style={{ animationDelay: '0.2s' }}>
            <span style={{ display: 'block' }}>{line1}</span>
            <span style={{ display: 'block' }} className="accent">{line2}</span>
          </h1>

          <p className="hm-sub">{CONFIG.HERO_SUBHEAD}</p>

          <div className="hm-ctas">
            <Link to="/products" className="hm-btn-primary">
              Wholesale Catalog
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link to="/signup" className="hm-btn-secondary" style={{ whiteSpace: 'nowrap' }}>
              Create Your Retailer Account
            </Link>
          </div>

          <div className="hm-trust-grid">
            {[
              { t: 'GST Invoicing',   d: 'Claim 18% ITC easily',      i: '📄' },
              { t: 'Bulk Pricing',    d: 'Up to 40% Volume Off',       i: '📦' },
              { t: 'Express Freight', d: 'Priority Pan-India Delivery',     i: '✈️' },
              { t: 'Brand Warranty',  d: '100% Genuine Authorized',    i: '🛡️' },
            ].map((f, i) => (
              <div key={i} className="hm-trust-card">
                <span className="hm-trust-icon">{f.i}</span>
                <div className="hm-trust-title">{f.t}</div>
                <div className="hm-trust-desc">{f.d}</div>
              </div>
            ))}
          </div>

          <div className="hm-scroll-hint">
            <span>Scroll to explore</span>
            <div className="hm-scroll-line" />
          </div>
        </section>

        {/* ── BRANDS SECTION ── */}
        {brands.length > 0 && (
          <section className="hm-brands-section">
            <div className="hm-brands-inner">
              <div className="hm-brands-head">
                <div className="hm-brands-kicker">Industry Leaders</div>
                <h2 className="hm-brands-title">Global Technology Partners</h2>
                <p className="hm-brands-sub">Seamlessly procure inventory from world-renowned electronics manufacturers through our verified network.</p>
              </div>
              <div className="hm-brands-scroll-container">
                <div className="hm-brands-grid">
                  {[...brands, ...brands].map((b, i) => (
                    <Link
                      key={`${b._id}-${i}`}
                      to={`/brand/${b.slug}`}
                      className="hm-brand-logo-card"
                      aria-label={`Open ${b.name} catalogue`}
                      title={b.name}
                    >
                      {b.logo
                        ? <img src={getCloudinaryUrl(b.logo, 140)} alt={b.name} loading="lazy" decoding="async" width="140" height="70" />
                        : <span className="hm-brand-logo-fallback" aria-hidden="true">✦</span>}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── TICKER: live offers from API, else neutral B2B copy (no hardcoded promos) ── */}
        <div className="hm-ticker-section">
          <div className="hm-ticker-inner">
            {tickerLoop.map((row, i) => (
              <div key={`${row.key}-${i}`} className="hm-ticker-item">
                <span className="fire">✦</span>
                <span>{row.label}</span>
                <span className="highlight">{row.pill}</span>
                <Link to="/products" style={{ color: 'inherit', textDecoration: 'underline', fontWeight: 800 }}>Catalogue</Link>
              </div>
            ))}
          </div>
        </div>

        {/* ── STATS BAND ── */}
        <section className="hm-stats-section">
          <div className="hm-stats-inner">
            {[
              { n: '500+', t: 'Active Partners',       delay: 0   },
              { n: '10+',  t: 'Crore Sales Generated', delay: 150 },
              { n: '50+',  t: 'Top Brands',        delay: 300 },
              { n: '1000+', t: 'Products',        delay: 450 },
            ].map((s, i) => (
              <StatItem key={i} n={s.n} t={s.t} delay={s.delay} />
            ))}
          </div>
        </section>

        {/* ── OFFERS SECTION ── */}
        {offers.length > 0 && (
          <section className="hm-offers-section">
            <div className="hm-section-label">Limited Time Deals</div>
            <h2 className="hm-section-heading">🔥 Special <em>Offers</em></h2>
            <div className="hm-offers-grid">
              {offers.map(off => (
                <div key={off._id} className="hm-offer-card">
                  <img src={getCloudinaryUrl(off.bannerImage, 900)} alt={off.title} className="hm-offer-img" loading="lazy" width="900" height="450" />
                  <div className="hm-offer-content">
                    <div className="hm-offer-tag">{off.discountPercent}% OFF</div>
                    <h3 className="hm-offer-title">{off.title}</h3>
                    <Link to="/products" className="hm-offer-btn">Shop Now</Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="hm-divider" />

        {/* ── FEATURES ── */}
        <section className="hm-features-section">
          <div className="hm-section-label">Why Click2Kart</div>
          <h2 className="hm-section-heading">
            Built for <em>Serious</em><br />Business
          </h2>
          <p className="hm-section-sub">
            Everything a growing B2B business needs — from flexible credit lines to dedicated account managers.
          </p>
          <div className="hm-features-grid">
            {[
              { num:'01', icon:'🏭', title:'Factory-Direct Stock',   desc:'Source directly from authorized distributors. No middlemen. Guaranteed authentic products at the best margins.' },
              { num:'02', icon:'💳', title:'B2B Credit Lines',       desc:'Flexible payment terms up to 60 days. Grow your inventory without straining your cash flow.' },
              { num:'03', icon:'📊', title:'Volume Intelligence',    desc:'Dynamic pricing that rewards scale. The more you buy, the better your margin per unit.' },
              { num:'04', icon:'🚀', title:'Priority Dispatch',      desc:'Dedicated freight lanes ensure your bulk orders ship first. Sub-48hr processing for verified partners.' },
              { num:'05', icon:'🧾', title:'Clean GST Compliance',   desc:'Every invoice is GST-ready. Maximize your input tax credit on every purchase, automatically.' },
              { num:'06', icon:'🤝', title:'Account Managers',       desc:"A dedicated human who knows your business. Not a chatbot — a real expert in your category." },
            ].map((f, i) => (
              <div key={i} className="hm-feature-item">
                <div className="hm-feature-num">{f.num}</div>
                <div className="hm-feature-icon">{f.icon}</div>
                <div className="hm-feature-title">{f.title}</div>
                <div className="hm-feature-desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </section>


        <div className="hm-divider" />

        {/* ── CTA ── */}
        <section className="hm-cta-section">
          <div className="hm-cta-inner">
            <div className="hm-cta-badge">
              <span className="hm-eyebrow-dot" style={{ width: '8px', height: '8px' }} />
              Get Started Today
            </div>
            <h2 className="hm-cta-title">
              Ready to <em>Grow</em> Your Business?
            </h2>
            <p className="hm-cta-sub">
              Join thousands of verified retailers across India who trust Click2Kart for their bulk procurement needs.
            </p>
            <div className="hm-cta-btns">
              <Link to="/signup" className="hm-btn-primary">
                Sign Up Now
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link to="/products" className="hm-btn-secondary">
                Browse Catalog
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
