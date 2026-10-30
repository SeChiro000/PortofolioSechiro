'use client'

import React from 'react'

interface ArtFrameProps {
  children: React.ReactNode
  borderSrc?: string // Path to border PNG texture
  aspectRatio?: string // e.g. "aspect-[4/5]", "aspect-[16/9]"
  className?: string
}

export default function ArtFrame({
  children,
  borderSrc,
  aspectRatio = 'aspect-square',
  className = '',
}: ArtFrameProps) {
  return (
    <div className={`relative overflow-hidden group ${aspectRatio} ${className}`}>
      {/* Content wrapper */}
      <div className="w-full h-full p-2 transition-transform duration-700 ease-out group-hover:scale-105">
        {children}
      </div>

      {/* Dynamic Border Overlay (Custom PNG or Fallback Brutalist Border) */}
      {borderSrc ? (
        <div
          className="absolute inset-0 pointer-events-none z-10 bg-contain bg-no-repeat bg-center"
          style={{
            backgroundImage: `url(${borderSrc})`,
            borderImageSource: `url(${borderSrc})`,
            borderImageSlice: '30 fill',
          }}
        />
      ) : (
        /* Fallback Modern Geometric Border */
        <div className="absolute inset-0 pointer-events-none z-10 border border-white/20 group-hover:border-white/60 transition-colors duration-500">
          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-white" />
          <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-white" />
          <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-white" />
          <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-white" />
        </div>
      )}
    </div>
  )
}