import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../lib/api';
import { getImageUrl } from '../../lib/cloudinary';
import LoadingSpinner from '../../components/LoadingSpinner';
const logoImg = '/layoutlogo.png';
import { CONFIG } from '../../shared/lib/config';

export default function PartnerVerify() {
  const { id } = useParams();
  const [partner, setPartner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadPartner() {
      try {
        const { data } = await api.get(`/api/public/partner/${id}`);
        setPartner(data);
      } catch (err) {
        setError(err.response?.data?.error || 'Partner not found');
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadPartner();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 flex items-center justify-center">
        <LoadingSpinner text="Loading partner details..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 flex items-center justify-center p-8">
        <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-2xl w-full text-center">
          <div className="text-8xl mb-6">❌</div>
          <h1 className="text-4xl font-black text-gray-900 mb-4">Partner Not Found</h1>
          <p className="text-gray-600 text-lg mb-8">{error}</p>
          <Link 
            to="/" 
            className="px-12 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold text-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const addressLine = [partner?.address, partner?.city, partner?.district, partner?.state, partner?.pincode]
    .filter(Boolean)
    .join(', ');

  const joiningDate = partner?.createdAt 
    ? new Date(partner.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : 'Date not available';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-4">
            <img src={logoImg} alt={CONFIG.BRAND_NAME} className="h-12" />
          </Link>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-3">Partner Verification</h1>
          <p className="text-gray-600 text-base md:text-lg">Verify the authenticity of this partner</p>
        </div>

        {/* Verification Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Left Section - White Background */}
          <div className="flex flex-col lg:flex-row">
            {/* Left Panel */}
            <div className="lg:w-3/5 bg-white p-6 md:p-8 relative overflow-hidden">
              {/* Subtle background pattern */}
              <div className="absolute top-0 right-0 w-64 md:w-96 h-64 md:h-96 bg-gradient-to-br from-indigo-100/30 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
              
              <div className="relative z-10">
                {/* Logo Section */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-16 w-auto">
                    <img src={logoImg} alt={CONFIG.BRAND_NAME} className="h-full w-auto" />
                  </div>
                </div>
                
                {/* Verification Badge */}
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 ${partner.kycVerified ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
                  <span className="text-xl">{partner.kycVerified ? '✅' : '⏳'}</span>
                  <span className="text-base font-black uppercase tracking-widest">
                    {partner.kycVerified ? 'Verified Partner' : 'Pending Verification'}
                  </span>
                </div>
                
                {/* Partner Photo and Details */}
                <div className="flex flex-col sm:flex-row items-start gap-6 mb-6">
                  <div className="flex-shrink-0 mx-auto sm:mx-0">
                    {partner?.profilePicture ? (
                      <img 
                        src={getImageUrl(partner.profilePicture)} 
                        alt={partner?.name} 
                        className="h-36 w-36 sm:h-44 sm:w-44 rounded-2xl object-cover border-4 border-indigo-100 shadow-xl"
                      />
                    ) : (
                      <div className="h-36 w-36 sm:h-44 sm:w-44 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center border-4 border-indigo-100 shadow-xl">
                        <div className="text-6xl font-black text-white">
                          {partner?.name?.charAt(0)?.toUpperCase() || 'P'}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col justify-center text-center sm:text-left w-full">
                    <h1 className="text-2xl md:text-3xl font-black text-gray-900 leading-tight mb-3">
                      {(partner?.name || 'PARTNER NAME').toUpperCase()}
                    </h1>
                    
                    <div className="space-y-3 w-full">
                      {partner?.email && (
                        <div className="flex items-center justify-center sm:justify-start gap-3">
                          <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-700 text-xl">
                            ✉️
                          </div>
                          <span className="text-gray-700 font-semibold text-sm md:text-base break-all">{partner.email}</span>
                        </div>
                      )}
                      {partner?.phone && (
                        <div className="flex items-center justify-center sm:justify-start gap-3">
                          <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-700 text-xl">
                            📞
                          </div>
                          <span className="text-gray-700 font-semibold text-sm md:text-base">{partner.phone}</span>
                        </div>
                      )}
                      {addressLine && (
                        <div className="flex items-start justify-center sm:justify-start gap-3">
                          <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-700 text-xl mt-1">
                            📍
                          </div>
                          <span className="text-gray-700 font-semibold text-sm md:text-base leading-snug">{addressLine}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Panel - Blue Gradient Background */}
            <div className="lg:w-2/5 bg-gradient-to-br from-indigo-800 to-indigo-900 text-white p-6 md:p-8 relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10" style={{ 
                backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', 
                backgroundSize: '16px 16px' 
              }} />
              
              <div className="relative z-10 h-full flex flex-col">
                {/* Verification Status */}
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 md:p-6 text-center mb-6 md:mb-8">
                  <div className="text-sm md:text-xl font-medium mb-1">PARTNER ID</div>
                  <div className="text-3xl md:text-4xl font-black font-mono">{partner?._id?.slice(-8) || '--------'}</div>
                </div>
                
                {/* Details List */}
                <div className="space-y-5 md:space-y-6 flex-1">
                  {partner?.bloodGroup && (
                    <div className="space-y-2 border-b border-white/20 pb-4">
                      <div className="text-gray-300 font-semibold text-sm md:text-xl flex items-center gap-2 md:gap-3">
                        💧 BLOOD GROUP
                      </div>
                      <div className="text-xl md:text-2xl font-black">{partner.bloodGroup}</div>
                    </div>
                  )}
                  
                  <div className="space-y-2 border-b border-white/20 pb-4">
                    <div className="text-gray-300 font-semibold text-sm md:text-xl flex items-center gap-2 md:gap-3">
                      🗓️ JOINING DATE
                    </div>
                    <div className="text-lg md:text-xl font-black">{joiningDate}</div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-gray-300 font-semibold text-sm md:text-xl flex items-center gap-2 md:gap-3">
                      🎁 INVITE CODE
                    </div>
                    <div className="text-xl md:text-2xl font-black">{partner?.inviteCode || '----'}</div>
                  </div>
                </div>
                
                {/* Trust Message */}
                <div className="mt-6 md:mt-8 text-center">
                  <div className="text-base md:text-2xl font-serif italic opacity-70 mb-1">Trusted Partner</div>
                  <div className="text-sm md:text-xl font-semibold">Click2kart</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Trust Badges at Bottom */}
          <div className="bg-gradient-to-br from-indigo-50 to-white border-t-2 border-indigo-200 p-4 md:p-6">
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
              {[
                { icon: '🏆', label: 'Trusted Network' },
                { icon: '🤝', label: 'Genuine Partners' },
                { icon: '🔐', label: 'Secure Transactions' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 px-4 py-3 md:px-6 md:py-4 rounded-2xl border-2 border-indigo-300 bg-white/80 shadow-md">
                  <span className="text-2xl md:text-3xl">{item.icon}</span>
                  <div className="font-semibold text-gray-700 text-xs md:text-base">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Back Button */}
        <div className="text-center mt-8 md:mt-12">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 md:gap-3 px-8 md:px-12 py-3 md:py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl md:rounded-3xl font-bold text-base md:text-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-xl hover:scale-105 active:scale-95"
          >
            <svg className="w-5 h-5 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}