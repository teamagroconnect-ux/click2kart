import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Premium Recommendation Modal (Flipkart Style)
 * Renders as a full-screen fixed overlay to ensure it's always "on top".
 */
export default function RecommendationModal({ open, items, onClose, onAddToCart }) {
  if (!open || !items || items.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      {/* Backdrop with premium frosted blur */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[20px] transition-opacity duration-700 animate-fade-in" 
        onClick={onClose} 
      />
      
      {/* Modal Container */}
      <div className="relative bg-white/80 backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-[0_40px_120px_-20px_rgba(0,0,0,0.3)] w-full max-w-2xl animate-premium-zoom border border-white/60 flex flex-col max-h-[85vh]">
        
        {/* Header Section - Modern Minimalist */}
        <div className="p-8 pb-4 relative shrink-0 text-center">
          <button 
            onClick={onClose} 
            className="absolute top-6 right-8 h-10 w-10 rounded-full bg-slate-100/80 flex items-center justify-center hover:bg-slate-200 transition-all duration-300 backdrop-blur-md group"
          >
            <svg className="w-5 h-5 text-slate-500 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">Smart Pairing</span>
          </div>
          
          <h3 className="text-3xl font-black text-slate-900 tracking-tight leading-tight mb-2">
            Perfect <span className="text-indigo-600">Add-ons</span>
          </h3>
          <p className="text-slate-500 text-sm font-medium max-w-md mx-auto">Partners often buy these items together. Add them to your order for better margins.</p>
        </div>
        
        {/* Items Section - Horizontal Scroll or Grid */}
        <div className="px-8 py-6 overflow-y-auto custom-scrollbar flex-1">
          <div className="space-y-4">
            {items.map((item, idx) => (
              <div 
                key={item._id || item.id} 
                className="group bg-white rounded-3xl border border-slate-100 p-4 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-500 flex items-center gap-6 relative overflow-hidden animate-fade-in-up"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                {/* Image */}
                <div className="h-24 w-24 rounded-2xl bg-slate-50 border border-slate-50 flex-shrink-0 flex items-center justify-center p-3 group-hover:bg-white transition-colors duration-500">
                  {item.images && (item.images[0]?.url || item.images[0])
                    ? <img 
                        src={item.images[0]?.url || item.images[0]} 
                        alt={item.name} 
                        className="h-full w-full object-contain group-hover:scale-110 transition-transform duration-700" 
                      />
                    : <span className="text-2xl text-slate-300">📦</span>}
                </div>
                
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">{item.category || 'General'}</span>
                    {item.ratingAvg > 0 && <span className="text-[9px] font-bold text-amber-500">★ {item.ratingAvg}</span>}
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">{item.name}</h4>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-lg font-black text-slate-900">₹{Number(item.price).toLocaleString()}</span>
                    {item.mrp > item.price && (
                      <span className="text-xs text-slate-400 line-through">₹{Number(item.mrp).toLocaleString()}</span>
                    )}
                  </div>
                </div>
                
                {/* Action */}
                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    await onAddToCart(item);
                  }}
                  className="h-12 px-6 rounded-2xl bg-slate-900 text-white text-[11px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 active:scale-95"
                >
                  Add
                </button>
              </div>
            ))}
          </div>
        </div>
        
        {/* Footer */}
        <div className="p-8 bg-slate-50/50 backdrop-blur-md flex items-center justify-between gap-6 shrink-0 border-t border-slate-100">
          <button 
            onClick={onClose} 
            className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-slate-600 transition-colors"
          >
            Skip for now
          </button>
          <Link 
            to="/cart" 
            className="px-8 py-4 rounded-2xl bg-indigo-600 text-white text-[11px] font-black uppercase tracking-[0.2em] shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-1 transition-all duration-300"
          >
            Go to Cart →
          </Link>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes premium-zoom { 
          from { opacity: 0; transform: scale(0.9) translateY(30px); } 
          to { opacity: 1; transform: scale(1) translateY(0); } 
        }
        @keyframes fade-in-up { 
          from { opacity: 0; transform: translateY(20px); } 
          to { opacity: 1; transform: translateY(0); } 
        }
        .animate-fade-in { animation: fade-in 0.6s ease-out forwards; }
        .animate-premium-zoom { animation: premium-zoom 0.7s cubic-bezier(0.19, 1, 0.22, 1) forwards; }
        .animate-fade-in-up { animation: fade-in-up 0.8s cubic-bezier(0.19, 1, 0.22, 1) forwards; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </div>
  );
}
