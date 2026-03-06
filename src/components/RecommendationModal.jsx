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
      {/* Backdrop with heavy blur */}
      <div 
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-[12px] transition-opacity duration-500 animate-fade-in" 
        onClick={onClose} 
      />
      
      {/* Modal Container */}
      <div className="relative bg-white/95 backdrop-blur-2xl rounded-[2.5rem] overflow-hidden shadow-[0_32px_128px_-12px_rgba(0,0,0,0.5)] w-full max-w-2xl animate-zoom-in border border-white/40 flex flex-col max-h-[90vh]">
        
        {/* Header Section */}
        <div className="bg-gradient-to-br from-indigo-700 via-indigo-600 to-purple-700 p-8 text-white relative overflow-hidden shrink-0">
          {/* Decorative elements */}
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-purple-400/20 rounded-full blur-3xl" />
          
          <button 
            onClick={onClose} 
            className="absolute top-6 right-6 h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center hover:bg-white/20 hover:rotate-90 transition-all duration-500 backdrop-blur-md border border-white/10 group"
          >
            <svg className="w-6 h-6 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-black uppercase tracking-[0.2em] border border-white/10">
                Exclusive Deals
              </span>
              <span className="h-1 w-1 rounded-full bg-white/40" />
              <span className="text-[10px] font-bold text-indigo-100 uppercase tracking-widest">Smart Recommendations</span>
            </div>
            <h3 className="text-3xl font-black tracking-tight leading-none mb-2">
              Frequently Bought <span className="text-purple-200">Together</span>
            </h3>
            <p className="text-indigo-100/80 text-sm font-medium">Add these top-rated items to your order and save more.</p>
          </div>
        </div>
        
        {/* Items Grid Section */}
        <div className="p-6 sm:p-10 overflow-y-auto custom-scrollbar bg-gray-50/30 flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {items.map((item, idx) => (
              <div 
                key={item._id || item.id} 
                className="bg-white rounded-[2.5rem] border border-gray-100 p-6 hover:shadow-[0_20px_50px_rgba(79,70,229,0.15)] hover:border-indigo-200 transition-all duration-500 group animate-fade-in-up relative overflow-hidden"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                {/* Subtle glow */}
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-50/50 rounded-full blur-3xl group-hover:bg-indigo-100/50 transition-colors duration-700" />
                
                {/* Image */}
                <div className="aspect-square w-full rounded-3xl bg-gray-50 border border-gray-100 overflow-hidden flex items-center justify-center mb-5 p-6 group-hover:bg-white transition-colors duration-500 relative z-10 shadow-inner">
                  {item.images && (item.images[0]?.url || item.images[0])
                    ? <img 
                        src={item.images[0]?.url || item.images[0]} 
                        alt={item.name} 
                        className="h-full w-full object-contain group-hover:scale-110 transition-transform duration-1000 ease-out" 
                      />
                    : <span className="text-4xl text-gray-300">📦</span>}
                </div>
                
                {/* Info */}
                <div className="relative z-10 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-[10px] font-black text-indigo-500 uppercase tracking-widest px-2 py-0.5 bg-indigo-50 rounded-md border border-indigo-100/50 truncate max-w-[120px]">
                      {item.category || 'General'}
                    </div>
                    {item.ratingAvg > 0 && (
                      <div className="flex items-center gap-1 text-[10px] font-black text-amber-500">
                        ⭐ {item.ratingAvg}
                      </div>
                    )}
                  </div>
                  
                  <div className="text-base font-bold text-gray-900 line-clamp-2 group-hover:text-indigo-600 transition-colors leading-snug min-h-[2.5rem]">
                    {item.name}
                  </div>
                  
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-50 mt-4">
                    <div className="flex flex-col">
                      <div className="text-xl font-black text-gray-900 tracking-tight">
                        {item.price != null ? `₹${Number(item.price).toLocaleString()}` : 'Login'}
                      </div>
                      {item.mrp > item.price && (
                        <div className="text-xs text-gray-400 line-through font-medium">₹{Number(item.mrp).toLocaleString()}</div>
                      )}
                    </div>
                    
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        await onAddToCart(item);
                      }}
                      className="h-12 w-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 hover:shadow-[0_10px_20px_rgba(79,70,229,0.3)] hover:scale-110 active:scale-95 transition-all duration-300 group/btn shadow-lg shadow-indigo-500/10"
                    >
                      <svg className="w-6 h-6 group-hover/btn:rotate-90 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                        <path d="M12 4v16m8-8H4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Footer Actions */}
        <div className="p-8 border-t border-gray-100 bg-white flex flex-col sm:flex-row gap-4 shrink-0">
          <button 
            onClick={onClose} 
            className="flex-1 py-5 rounded-[1.5rem] bg-gray-50 border border-gray-200 text-gray-500 text-[11px] font-black uppercase tracking-[0.25em] hover:bg-gray-100 hover:text-gray-700 hover:border-gray-300 transition-all duration-300 active:scale-95"
          >
            Skip For Now
          </button>
          <Link 
            to="/cart" 
            className="flex-1 py-5 rounded-[1.5rem] bg-gradient-to-r from-indigo-600 to-indigo-500 text-white text-[11px] font-black uppercase tracking-[0.25em] text-center shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-1 active:scale-95 transition-all duration-500"
          >
            View My Cart →
          </Link>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes zoom-in {
          from { opacity: 0; transform: scale(0.95) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.4s ease-out forwards; }
        .animate-zoom-in { animation: zoom-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-fade-in-up { animation: fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
    </div>
  );
}
