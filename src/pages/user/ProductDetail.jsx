import React, { useEffect, useState, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import api from '../../lib/api'
import { useCart, getStockStatus } from '../../lib/CartContext'
import { setSEO, injectJsonLd } from '../../shared/lib/seo.js'
import { useToast } from '../../components/Toast'
import RecommendationModal from '../../components/RecommendationModal'
import { motion, AnimatePresence } from 'framer-motion'

/* ── Premium Components ── */
const PremiumBadge = ({ children, variant = 'default' }) => {
  const variants = {
    default: 'bg-gray-100 text-gray-700',
    category: 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 border-indigo-200',
    bestseller: 'bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 border-amber-200',
    hot: 'bg-gradient-to-r from-rose-50 to-red-50 text-rose-700 border-rose-200',
    gst: 'bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 border-emerald-200',
    dispatch: 'bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 border-blue-200'
  }
  
  return (
    <motion.span 
      whileHover={{ scale: 1.05 }}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-full border ${variants[variant]}`}
    >
      {children}
    </motion.span>
  )
}

const PremiumButton = ({ children, variant = 'primary', disabled, onClick, fullWidth, icon }) => {
  const baseStyles = "relative overflow-hidden group font-black tracking-wider transition-all duration-300 ease-out"
  const variants = {
    primary: "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300 hover:scale-[1.02]",
    secondary: "bg-white text-indigo-600 border-2 border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50",
    outline: "bg-transparent text-gray-700 border border-gray-200 hover:border-indigo-300 hover:text-indigo-600"
  }
  
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} px-6 py-3 rounded-xl text-sm`}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        {icon && <span className="text-lg">{icon}</span>}
        {children}
      </span>
      <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
    </motion.button>
  )
}

const PremiumPriceCard = ({ price, mrp, savings, gstRate, unitPrice }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-gradient-to-br from-white to-gray-50/80 rounded-2xl p-6 border border-gray-100 shadow-lg shadow-gray-100/50"
  >
    <div className="flex items-baseline gap-3 flex-wrap">
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-black text-indigo-600">₹{price}</span>
        <span className="text-sm text-gray-500 font-medium">/unit</span>
      </div>
      {mrp > 0 && (
        <>
          <span className="text-lg text-gray-400 line-through">₹{mrp}</span>
          <span className="text-sm font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
            Save ₹{savings}
          </span>
        </>
      )}
    </div>
    <div className="mt-3 text-xs text-gray-500 font-medium border-t border-gray-100 pt-3">
      Inclusive of {gstRate}% GST | {unitPrice}/unit
    </div>
  </motion.div>
)

const PremiumDeliveryCard = ({ countdown, pincode, setPincode, deliveryDate, kycData, checkDelivery, kycLoading }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.1 }}
    className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden"
  >
    <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 p-4 border-b border-indigo-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-indigo-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <div className="text-[10px] font-black text-indigo-600 uppercase tracking-wider">Express Dispatch</div>
            <div className="text-sm font-black text-rose-600">
              Order in {countdown.h}h {countdown.m}m {countdown.s}s
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] font-black text-emerald-600 uppercase tracking-wider">Ships</div>
          <div className="text-sm font-black text-emerald-700">
            {new Date().getHours() < 18 ? 'Today' : 'Tomorrow'}
          </div>
        </div>
      </div>
    </div>

    <div className="p-4">
      {kycLoading ? (
        <div className="flex items-center gap-3 animate-pulse">
          <div className="w-10 h-10 rounded-xl bg-gray-100" />
          <div className="flex-1 space-y-2">
            <div className="h-2 bg-gray-100 rounded w-1/3" />
            <div className="h-3 bg-gray-100 rounded w-1/2" />
          </div>
        </div>
      ) : !kycData?.pincode ? (
        <form onSubmit={checkDelivery} className="space-y-3">
          <div className="text-xs font-black text-gray-400 uppercase tracking-wider">Check Delivery</div>
          <div className="flex gap-2">
            <input
              type="text"
              maxLength="6"
              placeholder="Enter pincode"
              value={pincode}
              onChange={e => setPincode(e.target.value.replace(/\D/g, ''))}
              className="flex-1 px-4 py-3 text-sm font-medium bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all"
            />
            <PremiumButton variant="primary" onClick={checkDelivery} icon="🔍">
              Check
            </PremiumButton>
          </div>
        </form>
      ) : (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Shipping to</div>
              <div className="text-sm font-black text-gray-900">{kycData.city || 'Business Hub'}, {pincode}</div>
            </div>
          </div>
          <button 
            onClick={() => { setKycData(null); setPincode(''); setDeliveryDate(null); }}
            className="text-xs font-black text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            Change
          </button>
        </div>
      )}

      {deliveryDate && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4 flex items-center gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-100"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <div className="text-[10px] font-black text-emerald-600 uppercase tracking-wider">Delivery by</div>
            <div className="text-sm font-black text-emerald-800">{deliveryDate}</div>
          </div>
        </motion.div>
      )}
    </div>
  </motion.div>
)

const PremiumVariantSelector = ({ variants, selected, setSelected, isOptEnabled, variantOpts }) => {
  const sections = [
    { key: 'color', label: 'Color', icon: '🎨' },
    { key: 'storage', label: 'Storage', icon: '💾' },
    { key: 'ram', label: 'RAM', icon: '⚡' }
  ]

  return (
    <div className="space-y-4">
      {sections.map(({ key, label, icon }) => {
        const options = variantOpts(key)
        if (options.length === 0) return null
        
        return (
          <motion.div 
            key={key}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-2"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">{icon}</span>
              <span className="text-xs font-black text-gray-400 uppercase tracking-wider">{label}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {options.map((value) => {
                const isSelected = selected[key] === value
                const isEnabled = isOptEnabled(key, value)
                
                return (
                  <motion.button
                    key={value}
                    whileHover={{ scale: isEnabled ? 1.05 : 1 }}
                    whileTap={{ scale: isEnabled ? 0.95 : 1 }}
                    disabled={!isEnabled}
                    onClick={() => isEnabled && setSelected(prev => ({ ...prev, [key]: value }))}
                    className={`
                      relative px-4 py-2 text-sm font-bold rounded-xl transition-all duration-200
                      ${isSelected 
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-200' 
                        : isEnabled
                          ? 'bg-white text-gray-700 border-2 border-gray-100 hover:border-indigo-200 hover:text-indigo-600'
                          : 'bg-gray-50 text-gray-300 border-2 border-gray-100 cursor-not-allowed'
                      }
                    `}
                  >
                    {value}
                    {!isEnabled && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-gray-300 rounded-full" />
                    )}
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

const PremiumBulkPricingTable = ({ tiers, basePrice, qty }) => {
  const sortedTiers = [...tiers].sort((a, b) => a.quantity - b.quantity)
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden"
    >
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 border-b border-indigo-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-indigo-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div>
            <div className="text-[10px] font-black text-indigo-600 uppercase tracking-wider">Bulk Pricing</div>
            <div className="text-sm font-black text-gray-900">Volume Discounts</div>
          </div>
        </div>
      </div>
      
      <div className="divide-y divide-gray-100">
        {sortedTiers.map((tier, index) => {
          const nextTier = sortedTiers[index + 1]
          const range = nextTier 
            ? `${tier.quantity}–${nextTier.quantity - 1} units`
            : `${tier.quantity}+ units`
          const tierPrice = basePrice - (tier.priceReduction || 0)
          const savings = tier.priceReduction || 0
          const isActive = qty >= tier.quantity && (!nextTier || qty < nextTier.quantity)
          
          return (
            <motion.div
              key={index}
              whileHover={{ backgroundColor: 'rgba(79, 70, 229, 0.02)' }}
              className={`p-4 transition-colors ${isActive ? 'bg-indigo-50/30' : ''}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-gray-900">{range}</span>
                    {isActive && (
                      <span className="text-[10px] font-black text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full">
                        Selected
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-lg font-black text-indigo-600">₹{tierPrice}</span>
                    <span className="text-xs text-gray-400">/unit</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-black text-emerald-600">Save ₹{savings}</div>
                  <div className="text-xs text-gray-400">per unit</div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}

const PremiumImageGallery = ({ images, activeImg, setActiveImg, setLightbox, zoom, setZoom }) => {
  return (
    <div className="space-y-3">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative group"
      >
        <div
          className="aspect-square bg-white rounded-2xl border border-gray-100 overflow-hidden cursor-zoom-in shadow-xl shadow-gray-100/50"
          onMouseEnter={() => setZoom(z => ({ ...z, on: true }))}
          onMouseLeave={() => setZoom({ on: false, x: 50, y: 50 })}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect()
            setZoom({
              on: true,
              x: ((e.clientX - rect.left) / rect.width) * 100,
              y: ((e.clientY - rect.top) / rect.height) * 100
            })
          }}
          onClick={() => setLightbox(true)}
        >
          {images[activeImg]?.url ? (
            <img
              src={images[activeImg].url}
              alt="Product"
              className="w-full h-full object-contain p-8 transition-transform duration-200"
              style={{
                transform: zoom.on ? 'scale(1.8)' : 'scale(1)',
                transformOrigin: `${zoom.x}% ${zoom.y}%`
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl text-gray-200">
              📦
            </div>
          )}
        </div>
        
        <button
          onClick={() => setLightbox(true)}
          className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl px-3 py-2 text-xs font-black text-gray-600 hover:text-indigo-600 transition-all hover:scale-105 shadow-lg"
        >
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
            Full Screen
          </span>
        </button>
      </motion.div>

      {images.length > 1 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
        >
          {images.map((img, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveImg(index)}
              className={`
                flex-shrink-0 w-16 h-16 rounded-xl border-2 overflow-hidden bg-white p-1 transition-all
                ${index === activeImg 
                  ? 'border-indigo-600 shadow-lg shadow-indigo-100' 
                  : 'border-transparent hover:border-indigo-200'
                }
              `}
            >
              <img src={img.url} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-contain" />
            </motion.button>
          ))}
        </motion.div>
      )}
    </div>
  )
}

const PremiumLightbox = ({ images, activeImg, setActiveImg, onClose }) => (
  <AnimatePresence>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-lg flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        className="relative max-w-5xl w-full"
        onClick={e => e.stopPropagation()}
      >
        <img
          src={images[activeImg]?.url}
          alt="Product"
          className="w-full h-auto max-h-[80vh] object-contain rounded-2xl"
        />
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center text-white hover:bg-white/20 transition-all"
        >
          ✕
        </button>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4">
          <button
            onClick={() => setActiveImg(i => Math.max(0, i - 1))}
            disabled={activeImg === 0}
            className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-xl text-white text-sm font-black disabled:opacity-30 hover:bg-white/20 transition-all"
          >
            ← Prev
          </button>
          
          <div className="flex gap-2">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveImg(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === activeImg ? 'w-6 bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
          
          <button
            onClick={() => setActiveImg(i => Math.min(images.length - 1, i + 1))}
            disabled={activeImg === images.length - 1}
            className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-xl text-white text-sm font-black disabled:opacity-30 hover:bg-white/20 transition-all"
          >
            Next →
          </button>
        </div>
      </motion.div>
    </motion.div>
  </AnimatePresence>
)

/* ── Main Component ── */
export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const { notify } = useToast()
  const pageRef = useRef(null)

  const [product, setProduct] = useState(null)
  const [selected, setSelected] = useState({ color: '', storage: '', ram: '' })
  const [activeVariant, setActiveVariant] = useState(null)
  const [activeImg, setActiveImg] = useState(0)
  const [lightbox, setLightbox] = useState(false)
  const [zoom, setZoom] = useState({ on: false, x: 50, y: 50 })
  const [similar, setSimilar] = useState([])
  const [recItems, setRecItems] = useState([])
  const [recOpen, setRecOpen] = useState(false)
  const [reviewOpen, setReviewOpen] = useState(false)
  const [myRating, setMyRating] = useState(0)
  const [myComment, setMyComment] = useState('')
  const [qty, setQty] = useState(1)
  const [pincode, setPincode] = useState('')
  const [deliveryDate, setDeliveryDate] = useState(null)
  const [countdown, setCountdown] = useState({ h: 0, m: 0, s: 0 })
  const [kycData, setKycData] = useState(null)
  const [kycLoading, setKycLoading] = useState(false)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  
  const authed = !!localStorage.getItem('token')

  // Fetch KYC
  useEffect(() => {
    if (authed) {
      setKycLoading(true)
      api.get('/api/user/me')
        .then(({ data }) => {
          const kyc = data.kyc || {}
          if (kyc.pincode) {
            setPincode(kyc.pincode)
            setKycData(kyc)
            const days = 2 + (Number(kyc.pincode[0]) % 4)
            const date = new Date()
            date.setDate(date.getDate() + days)
            setDeliveryDate(date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', weekday: 'short' }))
          }
        })
        .finally(() => setKycLoading(false))
    }
  }, [authed])

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date()
      const cutoff = new Date()
      cutoff.setHours(18, 0, 0, 0)

      let diff = cutoff - now
      if (diff < 0) {
        cutoff.setDate(cutoff.getDate() + 1)
        diff = cutoff - now
      }

      setCountdown({
        h: Math.floor(diff / (1000 * 60 * 60)),
        m: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        s: Math.floor((diff % (1000 * 60)) / 1000)
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const checkDelivery = (e) => {
    e?.preventDefault()
    if (pincode.length !== 6) return
    const days = 2 + (Number(pincode[0]) % 4)
    const date = new Date()
    date.setDate(date.getDate() + days)
    setDeliveryDate(date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', weekday: 'short' }))
  }

  // Fetch product data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productRes, similarRes, recRes] = await Promise.all([
          api.get(`/api/products/${id}`),
          api.get(`/api/recommendations/similar/${id}`).catch(() => ({ data: [] })),
          api.get(`/api/recommendations/frequently-bought/${id}?limit=6`).catch(() => ({ data: [] }))
        ])
        
        setProduct(productRes.data)
        setSimilar(similarRes.data || [])
        setRecItems(recRes.data || [])
        
        const moq = Math.max(1, Number(productRes.data.minOrderQty || 1))
        setQty(moq)
      } catch (error) {
        console.error('Failed to fetch product:', error)
      }
    }
    
    fetchData()
  }, [id])

  // Handle variant selection
  useEffect(() => {
    if (!product || !Array.isArray(product.variants) || !product.variants.length) {
      setActiveVariant(null)
      return
    }

    const colors = [...new Set(product.variants.map(v => v.attributes?.color).filter(Boolean))]
    const rams = [...new Set(product.variants.map(v => v.attributes?.ram).filter(Boolean))]
    const storages = [...new Set(product.variants.map(v => v.attributes?.storage).filter(Boolean))]
    
    setSelected(prev => ({
      color: prev.color || colors[0] || '',
      ram: prev.ram || rams[0] || '',
      storage: prev.storage || storages[0] || ''
    }))
  }, [product])

  useEffect(() => {
    if (!product || !Array.isArray(product.variants) || !product.variants.length) {
      setActiveVariant(null)
      return
    }

    const variant = product.variants.find(v =>
      (v.attributes?.color || '') === (selected.color || '') &&
      (v.attributes?.ram || '') === (selected.ram || '') &&
      (v.attributes?.storage || '') === (selected.storage || '')
    )

    if (variant) {
      setActiveVariant(variant)
      setActiveImg(0)
    } else {
      const firstMatch = product.variants.find(v => 
        (v.attributes?.color || '') === (selected.color || '')
      ) || product.variants[0]
      
      if (firstMatch) {
        setSelected({
          color: firstMatch.attributes?.color || '',
          ram: firstMatch.attributes?.ram || '',
          storage: firstMatch.attributes?.storage || ''
        })
      }
    }
  }, [selected, product])

  // SEO
  useEffect(() => {
    if (!product) return
    
    const title = `${product.name} | Wholesale Price B2B | Click2Kart`
    const desc = `Buy ${product.name} at wholesale prices with GST invoice. Bulk discounts available. ${product.category || 'Business'} supplies across India.`
    setSEO(title, desc)
    
    const cleanup = injectJsonLd({
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": product.name,
      "image": (product.images || []).map(i => i.url).filter(Boolean),
      "category": product.category || "General",
      "offers": {
        "@type": "Offer",
        "priceCurrency": "INR",
        "price": String(product.price || 0),
        "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        "url": `${window.location.origin}/products/${product._id}`
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": String(product.ratingAvg || 0),
        "reviewCount": String(product.ratingCount || 0)
      }
    })
    
    return cleanup
  }, [product])

  // Calculations
  const basePrice = Number(activeVariant?.price ?? product?.price ?? 0)
  const sortedTiers = Array.isArray(product?.bulkTiers) 
    ? [...product.bulkTiers].sort((a, b) => a.quantity - b.quantity)
    : []
  const minTierQty = sortedTiers.length > 0 ? Math.max(1, Number(sortedTiers[0].quantity)) : (product?.bulkDiscountQuantity || 1)
  
  let effectiveUnitPrice = basePrice
  const activeTier = sortedTiers
    .slice()
    .reverse()
    .find(t => qty >= Number(t.quantity))
  
  if (activeTier) {
    effectiveUnitPrice = Math.max(0, basePrice - Number(activeTier.priceReduction || 0))
  } else if (product?.bulkDiscountQuantity > 0 && qty >= Number(product.bulkDiscountQuantity)) {
    effectiveUnitPrice = Math.max(0, basePrice - Number(product.bulkDiscountPriceReduction || 0))
  }
  
  const savingsTotal = Math.max(0, (basePrice - effectiveUnitPrice)) * qty
  const mrp = Number(activeVariant?.mrp ?? product?.mrp ?? 0)
  const unitSave = mrp > 0 ? Math.max(0, mrp - effectiveUnitPrice) : Math.max(0, basePrice - effectiveUnitPrice)
  
  const gstRate = Number(product?.gst || 0)
  const isBestseller = (product?.ratingCount || 0) >= 50
  const isHotDeal = mrp > 0 ? ((mrp - (product?.price || 0)) / mrp) * 100 >= 20 : false
  
  const images = activeVariant?.images?.length ? activeVariant.images : (product?.images || [])
  const stock = activeVariant ? (activeVariant.stock || 0) : (product?.stock || 0)
  const stockStatus = getStockStatus(stock)

  const handleAddToCart = async () => {
    if (!authed) {
      navigate('/login')
      return
    }
    
    if (Array.isArray(product?.variants) && product.variants.length > 0 && !activeVariant) {
      return
    }
    
    setIsAddingToCart(true)
    
    try {
      const success = await addToCart(
        { ...product, minOrderQty: Math.max(minTierQty, qty) },
        activeVariant || undefined
      )
      
      if (success) {
        notify('Added to cart successfully!', 'success')
        
        const { data } = await api.get(`/api/recommendations/frequently-bought/${id}`).catch(() => ({ data: [] }))
        if (data && data.length > 0) {
          const filtered = data.filter(item => (item._id || item.id) !== id)
          setRecItems(filtered)
          if (filtered.length > 0) setRecOpen(true)
        }
      }
    } catch (error) {
      notify('Failed to add to cart', 'error')
    } finally {
      setIsAddingToCart(false)
    }
  }

  const handleBuyNow = async () => {
    await handleAddToCart()
    navigate('/checkout')
  }

  const handleReviewSubmit = async () => {
    if (myRating < 1) return
    
    try {
      const { data } = await api.post(`/api/products/${id}/reviews`, {
        rating: myRating,
        comment: myComment
      })
      
      setProduct(prev => ({
        ...prev,
        ratingAvg: data.ratingAvg,
        ratingCount: data.ratingCount
      }))
      
      setReviewOpen(false)
      setMyRating(0)
      setMyComment('')
      notify('Review submitted successfully!', 'success')
    } catch (error) {
      notify(error?.response?.data?.error || 'Failed to submit review', 'error')
    }
  }

  // Helper functions
  const variantOpts = (key) => {
    if (!product?.variants) return []
    return [...new Set(product.variants.map(v => v.attributes?.[key]).filter(Boolean))]
  }

  const isOptEnabled = (key, value) => {
    if (!product?.variants) return false
    
    return product.variants.some(v => {
      const checks = { color: selected.color, ram: selected.ram, storage: selected.storage }
      delete checks[key]
      return (v.attributes?.[key] || '') === value &&
        Object.entries(checks).every(([k, sv]) => !sv || (v.attributes?.[k] || '') === sv)
    })
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50/30 flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-white rounded-full" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div ref={pageRef} className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30">
      {/* Top Bar */}
      <motion.div 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <motion.button
              whileHover={{ x: -4 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-sm font-black text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </motion.button>
            
            <div className="flex items-center gap-4">
              <span className="text-xs font-black text-gray-400 uppercase tracking-wider">
                Product Details
              </span>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center text-sm font-black">
                {product.name.charAt(0)}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Column - Images */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <PremiumImageGallery
              images={images}
              activeImg={activeImg}
              setActiveImg={setActiveImg}
              setLightbox={setLightbox}
              zoom={zoom}
              setZoom={setZoom}
            />
          </div>

          {/* Right Column - Product Info */}
          <div className="space-y-6">
            {/* Badges */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-wrap gap-2"
            >
              {product.category && (
                <PremiumBadge variant="category">
                  <span>🏷️</span> {product.category}
                </PremiumBadge>
              )}
              {isBestseller && (
                <PremiumBadge variant="bestseller">
                  <span>⭐</span> Bestseller
                </PremiumBadge>
              )}
              {isHotDeal && (
                <PremiumBadge variant="hot">
                  <span>🔥</span> Hot Deal
                </PremiumBadge>
              )}
              <PremiumBadge variant="gst">
                <span>✓</span> GST Invoice
              </PremiumBadge>
              <PremiumBadge variant="dispatch">
                <span>⚡</span> Fast Dispatch
              </PremiumBadge>
            </motion.div>

            {/* Product Name */}
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl lg:text-5xl font-black text-gray-900 tracking-tight"
            >
              {product.name}
            </motion.h1>

            {/* Rating */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-4"
            >
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className={`w-5 h-5 ${
                      star <= Math.round(product.ratingAvg || 0)
                        ? 'text-amber-400'
                        : 'text-gray-200'
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm font-bold text-gray-600">
                ({product.ratingCount || 0} reviews)
              </span>
              {authed && (
                <button
                  onClick={() => setReviewOpen(true)}
                  className="text-xs font-black text-indigo-600 hover:text-indigo-800 transition-colors underline underline-offset-2"
                >
                  Write a Review
                </button>
              )}
            </motion.div>

            {/* Variants */}
            {Array.isArray(product.variants) && product.variants.length > 0 && (
              <PremiumVariantSelector
                variants={product.variants}
                selected={selected}
                setSelected={setSelected}
                isOptEnabled={isOptEnabled}
                variantOpts={variantOpts}
              />
            )}

            {/* SKU */}
            {activeVariant && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs font-medium text-gray-400"
              >
                SKU: {activeVariant.sku || '—'}
              </motion.div>
            )}

            {/* Price Card */}
            {authed ? (
              <PremiumPriceCard
                price={effectiveUnitPrice.toLocaleString()}
                mrp={mrp.toLocaleString()}
                savings={unitSave.toLocaleString()}
                gstRate={gstRate}
                unitPrice="unit"
              />
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-2xl p-6 border border-gray-200"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🔒</span>
                  <div>
                    <div className="text-sm font-black text-gray-400">Login to view wholesale price</div>
                    <PremiumButton variant="primary" onClick={() => navigate('/login')} icon="→">
                      Login / Register
                    </PremiumButton>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Quantity Selector */}
            {authed && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-4"
              >
                <div className="flex items-center border-2 border-gray-100 rounded-xl overflow-hidden">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setQty(q => Math.max(Number(product.minOrderQty || 1), q - 1))}
                    className="w-10 h-10 flex items-center justify-center text-lg font-black text-indigo-600 hover:bg-indigo-50 transition-colors"
                  >
                    −
                  </motion.button>
                  <div className="w-12 text-center font-black text-gray-900">
                    {qty}
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setQty(q => q + 1)}
                    className="w-10 h-10 flex items-center justify-center text-lg font-black text-indigo-600 hover:bg-indigo-50 transition-colors"
                  >
                    +
                  </motion.button>
                </div>
                {savingsTotal > 0 && (
                  <div className="text-sm font-black text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg">
                    Save ₹{savingsTotal.toLocaleString()}
                  </div>
                )}
              </motion.div>
            )}

            {/* Stock Status */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider ${
                stock > 0
                  ? stock <= 5
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${
                stock > 0
                  ? stock <= 5
                    ? 'bg-amber-500 animate-pulse'
                    : 'bg-emerald-500'
                  : 'bg-rose-500'
              }`} />
              {stockStatus.text}
            </motion.div>

            {/* Action Buttons */}
            {authed && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3"
              >
                <PremiumButton
                  variant="primary"
                  onClick={handleAddToCart}
                  disabled={stock <= 0 || (sortedTiers.length > 0 && qty < minTierQty) || isAddingToCart}
                  icon="🛒"
                  fullWidth
                >
                  {isAddingToCart ? 'Adding...' : stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
                </PremiumButton>
                <PremiumButton
                  variant="secondary"
                  onClick={handleBuyNow}
                  disabled={stock <= 0 || (sortedTiers.length > 0 && qty < minTierQty) || isAddingToCart}
                  icon="⚡"
                  fullWidth
                >
                  Buy Now
                </PremiumButton>
              </motion.div>
            )}

            {/* Delivery Card */}
            <PremiumDeliveryCard
              countdown={countdown}
              pincode={pincode}
              setPincode={setPincode}
              deliveryDate={deliveryDate}
              kycData={kycData}
              checkDelivery={checkDelivery}
              kycLoading={kycLoading}
            />

            {/* Bulk Pricing */}
            {authed && sortedTiers.length > 0 && (
              <PremiumBulkPricingTable
                tiers={sortedTiers}
                basePrice={basePrice}
                qty={qty}
              />
            )}

            {/* Highlights */}
            {Array.isArray(product.highlights) && product.highlights.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-lg"
              >
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-4">
                  Product Highlights
                </h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {product.highlights.map((highlight, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-start gap-2"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-2" />
                      <span className="text-sm text-gray-700">{highlight}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Description */}
            {product.description && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-lg"
              >
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-4">
                  About This Product
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </motion.div>
            )}
          </div>
        </div>

        {/* Similar Products */}
        {similar.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-16"
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xs font-black text-indigo-600 uppercase tracking-wider mb-2">
                  You Might Also Like
                </h2>
                <h3 className="text-2xl font-black text-gray-900">Similar Products</h3>
              </div>
              <Link to="/products">
                <PremiumButton variant="outline" icon="→">
                  View All
                </PremiumButton>
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {similar.slice(0, 6).map((item) => (
                <motion.div
                  key={item._id}
                  whileHover={{ y: -8 }}
                  onClick={() => navigate(`/products/${item._id}`)}
                  className="group cursor-pointer"
                >
                  <div className="aspect-square bg-white rounded-xl border border-gray-100 p-4 mb-3 group-hover:shadow-xl group-hover:border-indigo-100 transition-all duration-300 overflow-hidden">
                    {item.images?.[0]?.url ? (
                      <img
                        src={item.images[0].url}
                        alt={item.name}
                        className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl text-gray-200">
                        📦
                      </div>
                    )}
                  </div>
                  <div className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1 truncate">
                    {item.category}
                  </div>
                  <h4 className="text-sm font-bold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
                    {item.name}
                  </h4>
                  <div className="text-indigo-600 font-black text-sm mt-1">
                    {authed ? `₹${Number(item.price).toLocaleString()}` : 'Login'}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <PremiumLightbox
            images={images}
            activeImg={activeImg}
            setActiveImg={setActiveImg}
            onClose={() => setLightbox(false)}
          />
        )}
      </AnimatePresence>

      {/* Recommendation Modal */}
      <RecommendationModal
        open={recOpen}
        items={recItems}
        onClose={() => setRecOpen(false)}
        onAddToCart={async (item) => {
          await addToCart(item)
          setRecItems(prev => prev.filter(i => (i._id || i.id) !== (item._id || item.id)))
        }}
      />

      {/* Review Modal */}
      <AnimatePresence>
        {reviewOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setReviewOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-2xl font-black text-gray-900 mb-4">Write a Review</h3>
              
              <div className="flex justify-center gap-2 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <motion.button
                    key={star}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setMyRating(star)}
                    className="focus:outline-none"
                  >
                    <svg
                      className={`w-8 h-8 transition-colors ${
                        star <= myRating ? 'text-amber-400' : 'text-gray-200'
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </motion.button>
                ))}
              </div>

              <textarea
                value={myComment}
                onChange={e => setMyComment(e.target.value)}
                placeholder="Share your experience with this product..."
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all resize-none"
                rows="4"
              />

              <div className="flex gap-3 mt-4">
                <PremiumButton
                  variant="outline"
                  onClick={() => setReviewOpen(false)}
                  fullWidth
                >
                  Cancel
                </PremiumButton>
                <PremiumButton
                  variant="primary"
                  onClick={handleReviewSubmit}
                  disabled={myRating < 1}
                  fullWidth
                >
                  Submit Review
                </PremiumButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Floating Bar */}
      {authed && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-100 p-4 z-40"
        >
          <div className="flex items-center gap-3">
            <div>
              <div className="text-xs text-gray-400">Wholesale Price</div>
              <div className="text-xl font-black text-indigo-600">₹{effectiveUnitPrice.toLocaleString()}</div>
            </div>
            <PremiumButton
              variant="primary"
              onClick={handleAddToCart}
              disabled={stock <= 0 || (sortedTiers.length > 0 && qty < minTierQty) || isAddingToCart}
              icon="🛒"
              fullWidth
            >
              {isAddingToCart ? 'Adding...' : stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
            </PremiumButton>
          </div>
        </motion.div>
      )}
    </div>
  )
}