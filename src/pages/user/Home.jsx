import React from 'react'
import { Link } from 'react-router-dom'
import { CONFIG } from '../../shared/lib/config.js'

export default function Home() {
  // Home page intentionally does not load or display products/categories

  return (
    <div className="bg-gray-950 selection:bg-violet-300 selection:text-violet-900">
      {/* Hero Section - B2B Aggressive Style */}
      <section className="relative overflow-hidden bg-gray-950 pt-20 pb-32 md:pt-32 md:pb-48">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[800px] bg-violet-600/10 rounded-full blur-[140px] -z-0"></div>
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-violet-500/5 rounded-full blur-[100px] -z-0"></div>
        
        <div className="max-w-7xl mx-auto px-6 md:px-10 relative z-10 flex flex-col items-center text-center space-y-12 animate-in fade-in slide-in-from-bottom-12 duration-1000">
          <div className="space-y-8 max-w-4xl">
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-violet-500/10 text-violet-400 text-[10px] font-black tracking-[0.3em] uppercase border border-violet-500/20 shadow-2xl backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-violet-500 animate-ping"></span>
              India's Premier B2B Tech Hub
            </div>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white leading-[0.95]">
              {CONFIG.HERO_TITLE_LINE1 || CONFIG.HERO_TITLE_LINE2 ? (
                <>
                  <span className="block">{CONFIG.HERO_TITLE_LINE1 || 'Scale Your Business'}</span>
                  <span className="block">{CONFIG.HERO_TITLE_LINE2 || 'With Premium Tech.'}</span>
                </>
              ) : (
                <>
                  Scale Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-500">Business</span> <br />
                  With Premium <span className="text-gray-400">Tech.</span>
                </>
              )}
            </h1>
            <p className="text-lg md:text-2xl text-gray-400 font-medium leading-relaxed max-w-3xl mx-auto">
              {CONFIG.HERO_SUBHEAD}
            </p>
            <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link
                to="/products"
                className="group relative inline-flex items-center justify-center bg-violet-600 text-white px-12 py-5 rounded-3xl text-sm font-black uppercase tracking-widest shadow-[0_20px_50px_rgba(139,92,246,0.3)] hover:bg-violet-500 transition-all transform hover:-translate-y-2 active:scale-95 overflow-hidden"
              >
                <span className="relative z-10 flex items-center">
                  Wholesale Catalog
                  <svg className="w-5 h-5 ml-3 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-violet-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </Link>
              <Link
                to="/partner"
                className="inline-flex items-center justify-center border-2 border-white/10 bg-white/5 text-white backdrop-blur-md px-12 py-5 rounded-3xl text-sm font-black uppercase tracking-widest hover:bg-white/10 hover:border-white/20 transition-all transform hover:-translate-y-1 active:scale-95"
              >
                Become a Partner
              </Link>
            </div>
          </div>

          {/* B2B Trust Badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-6xl pt-12">
            {[
              { t: 'GST Invoicing', d: 'Claim 18% Input Tax Credit', i: '📄' },
              { t: 'Bulk Pricing', d: 'Up to 40% Volume Discounts', i: '📦' },
              { t: 'Express Freight', d: 'Priority Pan-India Logistics', i: '✈️' },
              { t: 'Brand Warranty', d: '100% Genuine Authorized Stock', i: '🛡️' }
            ].map((f, i) => (
              <div key={i} className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] text-left hover:bg-white/10 hover:border-violet-500/50 transition-all duration-500 group cursor-default shadow-2xl">
                <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform duration-500">{f.i}</div>
                <div className="font-black text-white text-base tracking-tight">{f.t}</div>
                <div className="text-xs text-gray-500 font-bold mt-2 leading-relaxed">{f.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-violet-600 py-16 -mt-10 relative z-20 rounded-[4rem] shadow-[0_-20px_50px_rgba(0,0,0,0.1)]">
        <div className="max-w-7xl mx-auto px-10 grid grid-cols-2 lg:grid-cols-4 gap-12 text-center">
          {[
            { n: '500+', t: 'Active Partners' },
            { n: '₹10Cr+', t: 'Sales Generated' },
            { n: '50+', t: 'Premium Brands' },
            { n: '24/7', t: 'B2B Support' }
          ].map((s, i) => (
            <div key={i} className="space-y-1">
              <div className="text-4xl md:text-5xl font-black text-white tracking-tighter">{s.n}</div>
              <div className="text-[10px] font-black text-violet-100 uppercase tracking-widest">{s.t}</div>
            </div>
          ))}
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-6 md:px-10 py-32 space-y-32">
        {/* Intentionally no product/category listings on Home. Browse page handles catalogue. */}

        {/* B2B Partnership Banner */}
        <section className="relative overflow-hidden bg-gray-900 rounded-[4rem] p-12 md:p-24 text-center space-y-10">
          <div className="absolute inset-0 bg-violet-600/10 blur-[120px] -z-0"></div>
          <div className="relative z-10 max-w-3xl mx-auto space-y-6">
            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-tight">
              Ready to <span className="text-violet-500">Transform</span> Your Inventory?
            </h2>
            <p className="text-lg text-gray-400 font-medium leading-relaxed">
              Join 500+ businesses sourcing directly from Click2Kart. Get access to credit lines, 
              dedicated account managers, and exclusive factory-direct stock.
            </p>
            <div className="pt-8">
              <Link
                to="/signup"
                className="inline-flex items-center justify-center bg-violet-600 text-white px-12 py-5 rounded-3xl text-sm font-black uppercase tracking-widest shadow-2xl hover:bg-violet-500 transition-all transform hover:-translate-y-2 active:scale-95"
              >
                Create B2B Account
                <svg className="w-5 h-5 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Floating WhatsApp Button */}
      <a 
        href={`https://wa.me/${CONFIG.SUPPORT_WHATSAPP}`} 
        target="_blank" 
        rel="noreferrer"
        className="fixed bottom-24 right-6 lg:bottom-10 lg:right-10 z-50 group flex items-center gap-3"
      >
        <div className="bg-white px-5 py-3 rounded-2xl shadow-2xl border border-gray-50 flex-col items-end hidden lg:flex group-hover:translate-x-0 translate-x-4 opacity-0 group-hover:opacity-100 transition-all duration-500">
          <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest leading-none">Need Help?</span>
          <span className="text-[9px] font-bold text-emerald-600 mt-1">Chat on WhatsApp</span>
        </div>
        <div className="h-16 w-16 bg-emerald-500 text-white rounded-[2rem] flex items-center justify-center shadow-[0_20px_50px_rgba(16,185,129,0.3)] transition-all transform hover:-translate-y-2 active:scale-95 animate-in zoom-in duration-700">
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.246 2.248 3.484 5.232 3.484 8.412-.003 6.557-5.338 11.892-11.893 11.892-1.997-.001-3.951-.5-5.688-1.448l-6.309 1.656zm6.224-3.82c1.516.903 3.125 1.378 4.773 1.379 5.428 0 9.843-4.415 9.845-9.845.001-2.631-1.023-5.104-2.883-6.964s-4.333-2.883-6.964-2.884c-5.43 0-9.844 4.415-9.846 9.845-.001 1.696.442 3.351 1.282 4.796l-1.07 3.907 4.008-1.052zm11.332-6.845c-.312-.156-1.848-.912-2.126-1.013-.279-.1-.482-.15-.683.15-.201.3-.778 1.013-.954 1.213-.177.2-.353.226-.665.07-.312-.156-1.318-.486-2.512-1.55-.928-.828-1.555-1.85-1.737-2.163-.182-.313-.02-.482.137-.638.141-.14.312-.363.469-.544.156-.181.209-.312.312-.519.104-.207.052-.389-.026-.544-.078-.156-.683-1.646-.936-2.257-.246-.594-.497-.514-.683-.524-.176-.01-.378-.011-.58-.011s-.53.076-.807.377c-.278.301-1.061 1.038-1.061 2.532s1.087 2.94 1.238 3.141c.151.201 2.138 3.265 5.18 4.577.723.312 1.288.499 1.728.639.726.231 1.387.198 1.909.12.583-.087 1.848-.755 2.11-1.482.261-.728.261-1.355.183-1.482-.078-.127-.29-.203-.602-.359z"/></svg>
        </div>
      </a>
    </div>
  )
}
