import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getCloudinaryUrl } from '../lib/cloudinary';

/**
 * Premium Recommendation Modal (Smart Pairing)
 * Optimized for Mobile (Bottom Sheet style) and Desktop (Centered Glass Card)
 */
export default function RecommendationModal({ open, items, onClose, onAddToCart }) {
  if (!items || items.length === 0) return null;

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center overflow-hidden">
          {/* Backdrop with premium frosted blur */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" 
            onClick={onClose} 
          />
          
          {/* Modal Container */}
          <motion.div 
            initial={{ y: "100%", opacity: 0.5, scale: 1 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative bg-white sm:bg-white/90 sm:backdrop-blur-2xl rounded-t-[2.5rem] sm:rounded-[3rem] overflow-hidden shadow-[0_-20px_80px_-20px_rgba(0,0,0,0.3)] sm:shadow-[0_40px_120px_-20px_rgba(0,0,0,0.4)] w-full max-w-2xl flex flex-col max-h-[90vh] sm:max-h-[85vh] border-t sm:border border-white/40"
          >
            {/* Mobile Drag Handle */}
            <div className="sm:hidden w-12 h-1.5 bg-slate-200 rounded-full mx-auto mt-4 mb-2 shrink-0" />

            {/* Header Section */}
            <div className="px-6 sm:px-10 pt-4 sm:pt-8 pb-4 relative shrink-0 text-center">
              <button 
                onClick={onClose} 
                className="absolute top-4 sm:top-6 right-6 sm:right-8 h-10 w-10 rounded-full bg-slate-100/80 flex items-center justify-center hover:bg-slate-200 transition-all duration-300 backdrop-blur-md group"
              >
                <svg className="w-5 h-5 text-slate-500 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
              
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 mb-3 sm:mb-4">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">Smart Pairing</span>
              </div>
              
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight mb-1 sm:mb-2">
                Perfect <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Add-ons</span>
              </h3>
              <p className="text-slate-500 text-xs sm:text-sm font-medium max-w-md mx-auto px-4">Partners often buy these items together. Boost your margins with these picks.</p>
            </div>
            
            {/* Items Section */}
            <div className="px-4 sm:px-10 py-4 sm:py-6 overflow-y-auto custom-scrollbar flex-1">
              <div className="space-y-3 sm:space-y-4">
                {items.map((item, idx) => (
                  <motion.div 
                    key={item._id || item.id} 
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1 + (idx * 0.05) }}
                    className="group bg-slate-50/50 sm:bg-white rounded-2xl sm:rounded-3xl border border-slate-100 p-3 sm:p-4 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-500 flex items-center gap-4 sm:gap-6 relative overflow-hidden"
                  >
                    {/* Image */}
                    <div className="h-16 w-16 sm:h-24 sm:w-24 rounded-xl sm:rounded-2xl bg-white border border-slate-50 flex-shrink-0 flex items-center justify-center p-2 sm:p-3 group-hover:scale-105 transition-transform duration-500">
                      {item.images && (item.images[0]?.url || item.images[0])
                        ? <img 
                            src={getCloudinaryUrl(item.images[0]?.url || item.images[0], 200)} 
                            alt={item.name} 
                            loading="lazy"
                            width="100"
                            height="100"
                            className="h-full w-full object-contain transition-transform duration-700" 
                          />
                        : <span className="text-xl sm:text-2xl text-slate-300">📦</span>}
                    </div>
                    
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 sm:mb-1">
                        <span className="text-[8px] sm:text-[9px] font-black text-indigo-500 uppercase tracking-widest">{item.category?.name || item.category || 'General'}</span>
                        {item.ratingAvg > 0 && <span className="text-[8px] sm:text-[9px] font-bold text-amber-500 flex items-center gap-0.5">★ {item.ratingAvg}</span>}
                      </div>
                      <h4 className="text-sm sm:text-base font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">{item.name}</h4>
                      <div className="flex items-baseline gap-2 mt-1 sm:mt-2">
                        <span className="text-base sm:text-lg font-black text-slate-900">₹{Number(item.price).toLocaleString()}</span>
                        {item.mrp > item.price && (
                          <span className="text-[10px] sm:text-xs text-slate-400 line-through">₹{Number(item.mrp).toLocaleString()}</span>
                        )}
                      </div>
                    </div>
                    
                    {/* Action */}
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        await onAddToCart(item);
                      }}
                      className="h-10 sm:h-12 px-4 sm:px-6 rounded-xl sm:rounded-2xl bg-slate-900 text-white text-[10px] sm:text-[11px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 active:scale-95 flex items-center justify-center gap-2"
                    >
                      <span className="hidden sm:inline">Add</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"/>
                      </svg>
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
            
            {/* Footer */}
            <div className="p-6 sm:p-8 bg-slate-50/80 sm:bg-slate-50/50 backdrop-blur-md flex items-center justify-between gap-4 sm:gap-6 shrink-0 border-t border-slate-100">
              <button 
                onClick={onClose} 
                className="text-[10px] sm:text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-slate-600 transition-colors"
              >
                Skip
              </button>
              <Link 
                to="/cart" 
                onClick={onClose}
                className="flex-1 sm:flex-none text-center px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all duration-300"
              >
                View Cart →
              </Link>
            </div>
          </motion.div>

          <style dangerouslySetInnerHTML={{ __html: `
            .custom-scrollbar::-webkit-scrollbar { width: 4px; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
          `}} />
        </div>
      )}
    </AnimatePresence>
  );
}
