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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 py-12 px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Link to="/" className="inline-flex items-center gap-4 mb-6">
            <img src={logoImg} alt={CONFIG.BRAND_NAME} className="h-16" />
          </Link>
          <h1 className="text-5xl font-black text-gray-900 mb-4">Partner Verification</h1>
          <p className="text-gray-600 text-xl">Verify the authenticity of this partner</p>
        </div>

        {/* Verification Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Left Section - White Background */}
          <div className="flex flex-col lg:flex-row">
            {/* Left Panel */}
            <div className="lg:w-3/5 bg-white p-10 relative overflow-hidden">
              {/* Subtle background pattern */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-100/30 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
              
              <div className="relative z-10">
                {/* Logo Section */}
                <div className="flex items-center gap-6 mb-10">
                  <div className="h-20 w-auto">
                    <img src={logoImg} alt={CONFIG.BRAND_NAME} className="h-full w-auto" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <h2 className="text-4xl font-black text-indigo-900 leading-tight">
                      Click<span className="text-orange-500">2</span><span className="text-green-600">kart</span>
                    </h2>
                    <p className="text-gray-500 text-sm font-medium">Indian's trusted b2b hub</p>
                  </div>
                </div>
                
                {/* Verification Badge */}
                <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-full mb-8 ${partner.kycVerified ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
                  <span className="text-2xl">{partner.kycVerified ? '✅' : '⏳'}</span>
                  <span className="text-xl font-black uppercase tracking-widest">
                    {partner.kycVerified ? 'Verified Partner' : 'Pending Verification'}
                  </span>
                </div>
                
                {/* Partner Photo and Details */}
                <div className="flex items-start gap-10 mb-10">
                  <div className="flex-shrink-0">
                    {partner?.profilePicture ? (
                      <img 
                        src={getImageUrl(partner.profilePicture)} 
                        alt={partner?.name} 
                        className="h-52 w-52 rounded-3xl object-cover border-6 border-indigo-100 shadow-xl"
                      />
                    ) : (
                      <div className="h-52 w-52 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center border-6 border-indigo-100 shadow-xl">
                        <div className="text-8xl font-black text-white">
                          {partner?.name?.charAt(0)?.toUpperCase() || 'P'}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col justify-center">
                    <h1 className="text-5xl font-black text-gray-900 leading-tight mb-4">
                      {(partner?.name || 'PARTNER NAME').toUpperCase()}
                    </h1>
                    
                    <div className="space-y-4">
                      {partner?.email && (
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-700 text-2xl">
                            ✉️
                          </div>
                          <span className="text-gray-700 font-semibold text-xl">{partner.email}</span>
                        </div>
                      )}
                      {partner?.phone && (
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-700 text-2xl">
                            📞
                          </div>
                          <span className="text-gray-700 font-semibold text-xl">{partner.phone}</span>
                        </div>
                      )}
                      {addressLine && (
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-700 text-2xl mt-1">
                            📍
                          </div>
                          <span className="text-gray-700 font-semibold text-xl leading-snug">{addressLine}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Panel - Blue Gradient Background */}
            <div className="lg:w-2/5 bg-gradient-to-br from-indigo-800 to-indigo-900 text-white p-10 relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10" style={{ 
                backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', 
                backgroundSize: '20px 20px' 
              }} />
              
              <div className="relative z-10 h-full flex flex-col">
                {/* Verification Status */}
                <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 text-center mb-10">
                  <div className="text-3xl font-medium mb-1">PARTNER ID</div>
                  <div className="text-5xl font-black font-mono">{partner?._id?.slice(-8) || '--------'}</div>
                </div>
                
                {/* Details List */}
                <div className="space-y-8 flex-1">
                  {partner?.bloodGroup && (
                    <div className="space-y-3 border-b border-white/20 pb-6">
                      <div className="text-gray-300 font-semibold text-xl flex items-center gap-3">
                        💧 BLOOD GROUP
                      </div>
                      <div className="text-3xl font-black">{partner.bloodGroup}</div>
                    </div>
                  )}
                  
                  <div className="space-y-3 border-b border-white/20 pb-6">
                    <div className="text-gray-300 font-semibold text-xl flex items-center gap-3">
                      🗓️ JOINING DATE
                    </div>
                    <div className="text-3xl font-black">{joiningDate}</div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="text-gray-300 font-semibold text-xl flex items-center gap-3">
                      🎁 INVITE CODE
                    </div>
                    <div className="text-4xl font-black">{partner?.inviteCode || '----'}</div>
                  </div>
                </div>
                
                {/* Trust Message */}
                <div className="mt-10 text-center">
                  <div className="text-2xl font-serif italic opacity-70 mb-2">Trusted Partner</div>
                  <div className="text-xl font-semibold">Click2kart</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Trust Badges at Bottom */}
          <div className="bg-gradient-to-br from-indigo-50 to-white border-t-2 border-indigo-200 p-8">
            <div className="flex flex-wrap items-center justify-center gap-8">
              <div className="flex items-center gap-4 px-8 py-4 rounded-3xl border-2 border-indigo-300 bg-white/80 shadow-lg">
                <span className="text-4xl">🏆</span>
                <div className="font-semibold text-gray-700 text-xl">Trusted Network</div>
              </div>
              <div className="flex items-center gap-4 px-8 py-4 rounded-3xl border-2 border-indigo-300 bg-white/80 shadow-lg">
                <span className="text-4xl">🤝</span>
                <div className="font-semibold text-gray-700 text-xl">Genuine Partners</div>
              </div>
              <div className="flex items-center gap-4 px-8 py-4 rounded-3xl border-2 border-indigo-300 bg-white/80 shadow-lg">
                <span className="text-4xl">🔐</span>
                <div className="font-semibold text-gray-700 text-xl">Secure Transactions</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Back Button */}
        <div className="text-center mt-12">
          <Link 
            to="/" 
            className="inline-flex items-center gap-3 px-12 py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-3xl font-bold text-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-xl hover:scale-105 active:scale-95"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
