import React from 'react'

export default function BrandLogo({ variant = 'default', extraText, className = '' }) {
  const sizeClass = variant === 'sm' ? 'text-base md:text-lg' : 'text-lg sm:text-xl md:text-2xl'

  return (
    <div className={`flex flex-col ${className}`}>
      <div className={`${sizeClass} font-black leading-tight`}>
        <span className="text-[#151B8D]">CLICK</span>
        <span className="text-[#F97316]">2</span>
        <span className="text-[#16A34A]">KART</span>
      </div>
      <div className="text-[10px] font-black uppercase tracking-[0.35em] text-[#4338ca]">
        B2B MARKETPLACE
      </div>
      {extraText && (
        <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-1">
          {extraText}
        </div>
      )}
    </div>
  )
}
