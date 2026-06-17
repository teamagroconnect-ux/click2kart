import React, { useState, useEffect } from 'react'
import api from '../../lib/api'
import { useToast } from '../../components/Toast'
import LoadingSpinner from '../../components/LoadingSpinner'

export default function MyCoupons() {
  const { notify } = useToast()
  const [loading, setLoading] = useState(true)
  const [coupons, setCoupons] = useState([])
  const [expandedId, setExpandedId] = useState(null)

  useEffect(() => {
    loadCoupons()
  }, [])

  const loadCoupons = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/api/partner/me')
      setCoupons(data.coupons || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingSpinner text="Loading coupons..." />

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-black text-gray-900 mb-2">My Coupons</h1>
        <p className="text-gray-500 font-medium">Track your coupon performance and share your codes!</p>
      </div>

      {coupons.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-12 text-center">
          <div className="text-5xl mb-4">🎟️</div>
          <p className="text-sm text-gray-500 font-medium">No coupons assigned yet. Contact admin to get your codes!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {coupons.map((c, index) => {
            const isExpanded = expandedId === (c._id || index);
            return (
              <div 
                key={c._id || index} 
                className={`bg-white border border-gray-100 rounded-3xl p-6 shadow-sm transition-all cursor-pointer hover:shadow-md ${!c.isActive ? 'opacity-60 grayscale' : ''}`}
                onClick={() => setExpandedId(isExpanded ? null : (c._id || index))}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-sm tracking-tighter shadow-inner ${c.type === 'PERCENT' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                      {c.type === 'PERCENT' ? `${c.value}%` : `₹${c.value}`}
                    </div>
                    <div>
                      <div className="text-xl font-black text-gray-900 tracking-tight">{c.code}</div>
                      <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                        {c.type === 'PERCENT' ? 'Percentage Discount' : 'Flat Discount'} • {c.usageCount || 0} uses
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest border ${c.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                      {c.isActive ? 'ACTIVE' : 'DISABLED'}
                    </div>
                    <svg className={`w-6 h-6 text-gray-300 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-6 pt-6 border-t border-gray-50 grid md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-2">
                    <div className="space-y-4">
                      <h4 className="text-[9px] font-black uppercase tracking-widest text-gray-400">Coupon Details</h4>
                      <div className="grid grid-cols-2 gap-4">
                        {c.minOrderValue > 0 && (
                          <div>
                            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">MIN ORDER</div>
                            <div className="text-sm font-black text-gray-900">₹{c.minOrderValue}</div>
                          </div>
                        )}
                        {c.maxDiscount > 0 && (
                          <div>
                            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">MAX DISCOUNT</div>
                            <div className="text-sm font-black text-gray-900">₹{c.maxDiscount}</div>
                          </div>
                        )}
                        {c.expiryDate && (
                          <div>
                            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">EXPIRY</div>
                            <div className="text-sm font-black text-gray-900">{new Date(c.expiryDate).toLocaleDateString()}</div>
                          </div>
                        )}
                        {c.usageLimit && (
                          <div>
                            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">USAGE LIMIT</div>
                            <div className="text-sm font-black text-gray-900">{c.usageLimit}</div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-[9px] font-black uppercase tracking-widest text-gray-400">Performance</h4>
                      <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100/50">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Commission</span>
                          <span className="text-lg font-black text-indigo-900">{c.partnerCommissionPercent}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Total Sales</span>
                          <span className="text-lg font-black text-indigo-900">₹{(c.sales || 0).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="md:col-span-2 pt-4">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          navigator.clipboard.writeText(c.code);
                          notify('Coupon code copied!', 'success');
                        }} 
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-2xl text-sm font-black uppercase tracking-widest hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:scale-95"
                      >
                        Copy Coupon Code
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
