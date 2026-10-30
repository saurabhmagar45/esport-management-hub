import React from 'react';
import gojoReferenceImg from '../../assets/gojo-reference.png';

/**
 * GojoFallback Component
 * Renders the clean, authentic Gojo Satoru character with soft background aura:
 * - Pure artwork without artificial beam overlays, geometric rings, or blocking rocks
 * - Feathered edge masking with 50% transparency for seamless borderless web integration
 * - Dramatic high-contrast and micro-detailing filter
 */
export const GojoFallback = ({ className = '' }) => {
  return (
    <div className={`relative w-full h-full flex items-center justify-center pointer-events-none select-none ${className}`}>
      
      {/* 1. Multi-Layered Soft Cursed Energy Background Aura (Radiating behind Gojo) */}
      {/* Core Ultraviolet Cursed Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 sm:w-96 sm:h-96 bg-purple-600/35 rounded-full blur-[100px] animate-pulse -z-20" />
      
      {/* Electric Cyan Rim Flare */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 sm:w-80 sm:h-80 bg-cyan-400/25 rounded-full blur-[80px] -z-20" />
      
      {/* Deep Violet Domain Expansion Horizon */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] sm:w-[500px] sm:h-[500px] bg-indigo-900/30 rounded-full blur-[130px] -z-30" />

      {/* 2. Clean Character Silhouette Container */}
      <div className="relative w-full max-w-[480px] lg:max-w-[560px]">
        {/* Feathered Edge Masking on Character (High Contrast & Detailing, 50% transparency, zero border seams) */}
        <img
          src={gojoReferenceImg}
          alt="Gojo Satoru - Limitless Hollow Purple"
          className="w-full h-auto object-contain drop-shadow-[0_0_40px_rgba(168,85,247,0.45)]"
          style={{
            opacity: 0.50,
            filter: 'contrast(1.26) saturate(1.20) brightness(1.03)',
            maskImage: 'radial-gradient(ellipse 68% 68% at 50% 50%, black 35%, rgba(0,0,0,0.65) 60%, transparent 88%)',
            WebkitMaskImage: 'radial-gradient(ellipse 68% 68% at 50% 50%, black 35%, rgba(0,0,0,0.65) 60%, transparent 88%)'
          }}
          loading="eager"
        />
      </div>
    </div>
  );
};
