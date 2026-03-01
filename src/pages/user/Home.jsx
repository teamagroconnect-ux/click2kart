import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { CONFIG } from '../../shared/lib/config.js'

/* ── tiny hook: count up numbers on mount ── */
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
    const obs = new IntersectionObserver(([e]) => e.isIntersecting && setVisible(true), { threshold: 0.4 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  const raw = parseFloat(n.replace(/[^0-9.]/g, ''))
  const prefix = n.match(/^[₹]/) ? '₹' : ''
  const suffix = n.replace(/^[₹]?[\d.]+/, '')
  const count = useCountUp(n, 1600, visible)
  return (
    <div
      ref={ref}
      className="stat-item text-center"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="stat-number">
        {prefix}{visible ? count : 0}{suffix}
      </div>
      <div className="stat-label">{t}</div>
    </div>
  )
}

export default function Home() {
  const heroRef = useRef(null)
  const [scrollY, setScrollY] = useState(0)
  useEffect(() => {
    const fn = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const line1 = CONFIG.HERO_TITLE_LINE1 || 'Wholesale with'
  const line2 = CONFIG.HERO_TITLE_LINE2 || 'Click2Kart'

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,700;1,9..40,300&display=swap');

        :root {
          --gold: #c9a84c;
          --gold-light: #e8c96d;
          --gold-dim: rgba(201,168,76,0.12);
          --ink: #080a0f;
          --ink-mid: #0e1117;
          --ink-card: #111520;
          --muted: #4a5168;
          --text-dim: #8892a4;
          --white: #f4f5f7;
        }

        .home-root {
          font-family: 'DM Sans', system-ui, sans-serif;
          background: var(--ink);
          color: var(--white);
          overflow-x: hidden;
        }

        /* ── grain overlay ── */
        .home-root::before {
          content: '';
          position: fixed;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
          pointer-events: none;
          z-index: 1000;
          opacity: 0.35;
        }

        /* ── hero ── */
        .hero {
          position: relative;
          min-height: 100svh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 120px 24px 80px;
          overflow: hidden;
        }

        .hero-bg {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 80% 60% at 50% -10%, rgba(201,168,76,0.08) 0%, transparent 60%),
            radial-gradient(ellipse 50% 40% at 80% 80%, rgba(139,92,246,0.04) 0%, transparent 50%),
            linear-gradient(180deg, var(--ink) 0%, #090c14 100%);
        }

        /* subtle diagonal grid lines */
        .hero-bg::after {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(201,168,76,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(201,168,76,0.03) 1px, transparent 1px);
          background-size: 80px 80px;
          mask-image: radial-gradient(ellipse 70% 70% at 50% 40%, black 40%, transparent 100%);
        }

        .hero-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 8px 20px;
          border: 1px solid rgba(201,168,76,0.3);
          border-radius: 100px;
          background: rgba(201,168,76,0.06);
          backdrop-filter: blur(12px);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: var(--gold-light);
          margin-bottom: 32px;
          animation: fadeUp 0.8s ease both;
        }

        .hero-eyebrow-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: var(--gold);
          box-shadow: 0 0 8px var(--gold);
          animation: pulse 2s ease infinite;
        }

        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.8)} }

        .hero-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(72px, 14vw, 160px);
          line-height: 0.92;
          text-align: center;
          letter-spacing: 0.01em;
          color: var(--white);
          margin-bottom: 28px;
        }

        .hero-title .line-gold {
          color: var(--gold);
          text-shadow: 0 0 80px rgba(201,168,76,0.3);
        }

        .hero-title .line1 { animation: fadeUp 0.8s 0.1s ease both; display: block; }
        .hero-title .line2 { animation: fadeUp 0.8s 0.25s ease both; display: block; }

        .hero-sub {
          font-size: clamp(15px, 2vw, 20px);
          color: var(--text-dim);
          font-weight: 300;
          max-width: 560px;
          text-align: center;
          line-height: 1.7;
          margin-bottom: 48px;
          animation: fadeUp 0.8s 0.4s ease both;
        }

        .hero-ctas {
          display: flex;
          flex-direction: column;
          gap: 16px;
          align-items: center;
          animation: fadeUp 0.8s 0.55s ease both;
        }
        @media(min-width:480px) { .hero-ctas { flex-direction: row; } }

        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          background: var(--gold);
          color: #080a0f;
          padding: 16px 36px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          transition: all 0.25s;
          box-shadow: 0 8px 40px rgba(201,168,76,0.25);
          text-decoration: none;
          position: relative;
          overflow: hidden;
        }
        .btn-primary::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.15), transparent);
          opacity: 0;
          transition: opacity 0.25s;
        }
        .btn-primary:hover { transform: translateY(-3px); box-shadow: 0 16px 50px rgba(201,168,76,0.4); }
        .btn-primary:hover::before { opacity: 1; }
        .btn-primary:active { transform: translateY(0) scale(0.97); }

        .btn-secondary {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.04);
          color: var(--white);
          padding: 16px 36px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          transition: all 0.25s;
          text-decoration: none;
          backdrop-filter: blur(8px);
        }
        .btn-secondary:hover {
          border-color: rgba(201,168,76,0.4);
          background: rgba(201,168,76,0.06);
          color: var(--gold-light);
          transform: translateY(-2px);
        }

        /* ── trust badges ── */
        .trust-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          width: 100%;
          max-width: 900px;
          margin-top: 80px;
          animation: fadeUp 0.8s 0.7s ease both;
        }
        @media(min-width:768px) { .trust-grid { grid-template-columns: repeat(4,1fr); gap: 16px; } }

        .trust-card {
          background: var(--ink-card);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          padding: 24px 20px;
          transition: all 0.35s;
          position: relative;
          overflow: hidden;
        }
        .trust-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(201,168,76,0.4), transparent);
          opacity: 0;
          transition: opacity 0.35s;
        }
        .trust-card:hover { border-color: rgba(201,168,76,0.2); transform: translateY(-4px); }
        .trust-card:hover::before { opacity: 1; }

        .trust-icon {
          font-size: 28px;
          margin-bottom: 14px;
          display: block;
        }
        .trust-title {
          font-size: 13px;
          font-weight: 700;
          color: var(--white);
          margin-bottom: 6px;
          letter-spacing: -0.01em;
        }
        .trust-desc {
          font-size: 11px;
          color: var(--muted);
          font-weight: 400;
          line-height: 1.5;
        }

        /* scroll indicator */
        .scroll-hint {
          position: absolute;
          bottom: 40px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          animation: fadeUp 1s 1.2s ease both;
          opacity: 0.4;
        }
        .scroll-hint span { font-size: 9px; letter-spacing: 0.2em; text-transform: uppercase; color: var(--muted); }
        .scroll-line {
          width: 1px; height: 40px;
          background: linear-gradient(to bottom, var(--gold), transparent);
          animation: scrollLine 1.8s ease infinite;
        }
        @keyframes scrollLine { 0%{transform:scaleY(0);transform-origin:top} 50%{transform:scaleY(1);transform-origin:top} 51%{transform-origin:bottom} 100%{transform:scaleY(0);transform-origin:bottom} }

        /* ── stats band ── */
        .stats-section {
          position: relative;
          background: var(--ink-card);
          border-top: 1px solid rgba(255,255,255,0.05);
          border-bottom: 1px solid rgba(255,255,255,0.05);
          padding: 60px 24px;
          overflow: hidden;
        }
        .stats-section::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent, rgba(201,168,76,0.03), transparent);
        }

        .stats-inner {
          max-width: 900px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 40px 20px;
        }
        @media(min-width:768px) { .stats-inner { grid-template-columns: repeat(4,1fr); } }

        .stat-item { opacity: 0; animation: fadeUp 0.6s ease both; }
        .stat-number {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(44px, 6vw, 68px);
          color: var(--gold);
          line-height: 1;
          letter-spacing: 0.02em;
          text-shadow: 0 0 40px rgba(201,168,76,0.25);
        }
        .stat-label {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: var(--muted);
          margin-top: 8px;
        }

        /* ── features strip ── */
        .features-section {
          max-width: 1200px;
          margin: 0 auto;
          padding: 100px 24px;
        }

        .section-label {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: var(--gold);
          margin-bottom: 20px;
        }
        .section-label::before {
          content: '';
          width: 32px; height: 1px;
          background: var(--gold);
        }

        .section-heading {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(40px, 6vw, 72px);
          line-height: 1;
          letter-spacing: 0.02em;
          color: var(--white);
          margin-bottom: 16px;
        }
        .section-heading em { color: var(--gold); font-style: normal; }

        .section-sub {
          font-size: 16px;
          color: var(--text-dim);
          font-weight: 300;
          max-width: 480px;
          line-height: 1.7;
          margin-bottom: 64px;
        }

        .features-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2px;
          background: rgba(255,255,255,0.04);
          border-radius: 20px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.06);
        }
        @media(min-width:640px) { .features-grid { grid-template-columns: repeat(2,1fr); } }
        @media(min-width:1024px) { .features-grid { grid-template-columns: repeat(3,1fr); } }

        .feature-item {
          background: var(--ink-card);
          padding: 40px 36px;
          transition: background 0.3s;
          position: relative;
        }
        .feature-item:hover { background: #131825; }
        .feature-item:hover .feature-num { color: var(--gold); }

        .feature-num {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 13px;
          letter-spacing: 0.1em;
          color: var(--muted);
          margin-bottom: 20px;
          transition: color 0.3s;
        }
        .feature-icon-wrap {
          width: 48px; height: 48px;
          border-radius: 12px;
          background: var(--gold-dim);
          border: 1px solid rgba(201,168,76,0.15);
          display: flex; align-items: center; justify-content: center;
          font-size: 22px;
          margin-bottom: 20px;
        }
        .feature-title {
          font-size: 16px;
          font-weight: 700;
          color: var(--white);
          margin-bottom: 10px;
          letter-spacing: -0.02em;
        }
        .feature-desc {
          font-size: 13px;
          color: var(--muted);
          line-height: 1.65;
          font-weight: 400;
        }

        /* ── CTA banner ── */
        .cta-section {
          max-width: 1200px;
          margin: 0 auto 100px;
          padding: 0 24px;
        }

        .cta-inner {
          position: relative;
          background: var(--ink-card);
          border: 1px solid rgba(201,168,76,0.15);
          border-radius: 24px;
          padding: 72px 48px;
          text-align: center;
          overflow: hidden;
        }
        .cta-inner::before {
          content: '';
          position: absolute;
          top: -120px; left: 50%; transform: translateX(-50%);
          width: 600px; height: 400px;
          background: radial-gradient(ellipse, rgba(201,168,76,0.08), transparent 70%);
          pointer-events: none;
        }
        .cta-inner::after {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent 10%, var(--gold) 50%, transparent 90%);
          opacity: 0.5;
        }

        .cta-badge {
          display: inline-block;
          background: var(--gold-dim);
          border: 1px solid rgba(201,168,76,0.25);
          color: var(--gold-light);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          padding: 6px 18px;
          border-radius: 100px;
          margin-bottom: 28px;
        }

        .cta-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(40px, 7vw, 80px);
          line-height: 1;
          color: var(--white);
          margin-bottom: 20px;
          letter-spacing: 0.02em;
        }
        .cta-title em { color: var(--gold); font-style: normal; }

        .cta-sub {
          font-size: 16px;
          color: var(--text-dim);
          font-weight: 300;
          max-width: 520px;
          margin: 0 auto 48px;
          line-height: 1.7;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* divider */
        .gold-divider {
          width: 100%;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(201,168,76,0.2), transparent);
          margin: 0;
        }
      `}</style>

      <div className="home-root">

        {/* ── HERO ── */}
        <section className="hero" ref={heroRef}>
          <div className="hero-bg" style={{ transform: `translateY(${scrollY * 0.15}px)` }} />

          <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
            <div className="hero-eyebrow">
              <span className="hero-eyebrow-dot" />
              India's Premier B2B Tech Hub
            </div>

            <h1 className="hero-title">
              <span className="line1">{line1}</span>
              <span className="line2 line-gold">{line2}</span>
            </h1>

            <p className="hero-sub">{CONFIG.HERO_SUBHEAD}</p>

            <div className="hero-ctas">
              <Link to="/products" className="btn-primary">
                Wholesale Catalog
                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link to="/partner" className="btn-secondary">
                Become a Partner
              </Link>
            </div>

            {/* Trust badges */}
            <div className="trust-grid">
              {[
                { t: 'GST Invoicing', d: 'Claim 18% Input Tax Credit', i: '📄' },
                { t: 'Bulk Pricing', d: 'Up to 40% Volume Discounts', i: '📦' },
                { t: 'Express Freight', d: 'Priority Pan-India Logistics', i: '✈️' },
                { t: 'Brand Warranty', d: '100% Genuine Authorized Stock', i: '🛡️' },
              ].map((f, i) => (
                <div key={i} className="trust-card">
                  <span className="trust-icon">{f.i}</span>
                  <div className="trust-title">{f.t}</div>
                  <div className="trust-desc">{f.d}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="scroll-hint">
            <div className="scroll-line" />
            <span>Scroll</span>
          </div>
        </section>

        {/* ── STATS ── */}
        <section className="stats-section">
          <div className="stats-inner">
            {[
              { n: '500+', t: 'Active Partners', delay: 0 },
              { n: '10+', t: 'Crore Sales Generated', delay: 100 },
              { n: '50+', t: 'Premium Brands', delay: 200 },
              { n: '24', t: 'Hr B2B Support', delay: 300 },
            ].map((s, i) => (
              <StatItem key={i} n={s.n} t={s.t} delay={s.delay} />
            ))}
          </div>
        </section>

        <div className="gold-divider" />

        {/* ── FEATURES ── */}
        <section className="features-section">
          <div className="section-label">Why Click2Kart</div>
          <h2 className="section-heading">
            Built for <em>Serious</em><br />Business
          </h2>
          <p className="section-sub">
            Everything a growing B2B business needs — from flexible credit lines to dedicated account managers.
          </p>
          <div className="features-grid">
            {[
              { num: '01', icon: '🏭', title: 'Factory-Direct Stock', desc: 'Source directly from authorized distributors. No middlemen. Guaranteed authentic products at the best margins.' },
              { num: '02', icon: '💳', title: 'B2B Credit Lines', desc: 'Flexible payment terms up to 60 days. Grow your inventory without straining your cash flow.' },
              { num: '03', icon: '📊', title: 'Volume Intelligence', desc: 'Dynamic pricing that rewards scale. The more you buy, the better your margin per unit.' },
              { num: '04', icon: '🚀', title: 'Priority Dispatch', desc: 'Dedicated freight lanes ensure your bulk orders ship first. Sub-48hr processing for verified partners.' },
              { num: '05', icon: '🧾', title: 'Clean GST Compliance', desc: 'Every invoice is GST-ready. Maximize your input tax credit on every purchase, automatically.' },
              { num: '06', icon: '🤝', title: 'Account Managers', desc: 'A dedicated human who knows your business. Not a chatbot — a real expert in your category.' },
            ].map((f, i) => (
              <div key={i} className="feature-item">
                <div className="feature-num">{f.num}</div>
                <div className="feature-icon-wrap">{f.icon}</div>
                <div className="feature-title">{f.title}</div>
                <div className="feature-desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </section>

        <div className="gold-divider" />

        {/* ── CTA ── */}
        <section className="cta-section">
          <div className="cta-inner">
            <div className="cta-badge">Limited Onboarding Slots</div>
            <h2 className="cta-title">
              Ready to <em>Transform</em><br />Your Inventory?
            </h2>
            <p className="cta-sub">
              Join 500+ businesses sourcing directly from Click2Kart. Get access to credit lines,
              dedicated account managers, and exclusive factory-direct stock.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/signup" className="btn-primary">
                Create B2B Account
                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link to="/products" className="btn-secondary">
                Browse Catalog
              </Link>
            </div>
          </div>
        </section>

      </div>
    </>
  )
}