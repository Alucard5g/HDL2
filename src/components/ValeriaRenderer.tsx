import React from 'react';

interface ValeriaRendererProps {
  size?: number;
  className?: string;
  state?: 'explaining' | 'happy' | 'excited' | 'thinking';
}

export const ValeriaRenderer: React.FC<ValeriaRendererProps> = ({
  size = 100,
  className = '',
  state = 'explaining'
}) => {
  return (
    <div
      style={{ width: size, height: size }}
      className={`relative rounded-2xl flex items-center justify-center overflow-visible select-none ${className}`}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full overflow-visible drop-shadow-[2px_3px_6px_rgba(0,0,0,0.5)]"
      >
        <defs>
          {/* Cyber gradients for Valeria's hair and details */}
          <linearGradient id="valeriaHair" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0D9488" />
            <stop offset="50%" stopColor="#0F766E" />
            <stop offset="100%" stopColor="#115E59" />
          </linearGradient>
          <linearGradient id="valeriaSuit" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1E293B" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>
          <radialGradient id="cyberGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#10B981" stopOpacity={0.25} />
            <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
          </radialGradient>
          <linearGradient id="headsetGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F43F5E" />
            <stop offset="100%" stopColor="#BE123C" />
          </linearGradient>
        </defs>

        {/* Ambient tactical radar background */}
        <circle cx="50" cy="50" r="47" fill="url(#cyberGlow)" />
        <circle cx="50" cy="50" r="46" fill="none" stroke="#10B981" strokeWidth="1" strokeDasharray="5,3" opacity="0.15" />
        <circle cx="50" cy="50" r="35" fill="none" stroke="#10B981" strokeWidth="0.5" strokeDasharray="1,2" opacity="0.2" />

        {/* 1. Shoulders & Blazer Suit */}
        <path
          d="M 24 78 C 24 67, 34 62, 50 62 C 66 62, 76 67, 76 78 L 73 95 L 27 95 Z"
          fill="url(#valeriaSuit)"
          stroke="#000"
          strokeWidth="2"
        />
        {/* Neon Emerald shirt detailing */}
        <path
          d="M 40 63 C 44 68, 47 72, 50 72 C 53 72, 56 68, 60 63 L 57 94 L 43 94 Z"
          fill="#10B981"
          stroke="#000"
          strokeWidth="1.2"
        />
        {/* Collar of shirt */}
        <path d="M 40 63 L 44 70 L 50 72 L 56 70 L 60 63" fill="none" stroke="#FFF" strokeWidth="1" />

        {/* 2. Neck */}
        <rect x="44" y="55" width="12" height="12" fill="#FCE5CD" stroke="#000" strokeWidth="2" />
        <path d="M 44 57 C 48 61, 52 61, 56 57" fill="none" stroke="#E6B8AF" strokeWidth="1.5" />

        {/* 3. Base Head */}
        <circle cx="50" cy="44" r="18" fill="#FCE5CD" stroke="#000" strokeWidth="2.5" />

        {/* 4. Hair (Back and sides) */}
        <path
          d="M 28 44 C 25 35, 27 24, 38 18 C 45 15, 55 15, 62 18 C 73 24, 75 35, 72 44 L 74 60 C 74 60, 71 58, 68 62 L 67 44"
          fill="url(#valeriaHair)"
          stroke="#000"
          strokeWidth="2"
        />
        <path
          d="M 32 44 L 26 60 C 26 60, 29 58, 32 62 L 33 44"
          fill="url(#valeriaHair)"
          stroke="#000"
          strokeWidth="2"
        />

        {/* 5. Headset band across top of head */}
        <path
          d="M 34 33 C 34 25, 66 25, 66 33"
          fill="none"
          stroke="#1E293B"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        {/* Headset ear-piece left */}
        <rect x="30" y="32" width="4" height="8" rx="1.5" fill="url(#headsetGrad)" stroke="#000" strokeWidth="1.5" />
        {/* Microphone boom extending to mouth */}
        <path
          d="M 32 38 C 32 46, 38 49, 44 48"
          fill="none"
          stroke="#111827"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="44" cy="48" r="1.5" fill="#10B981" />

        {/* 6. Hair Bangs (Premium front styled layers) */}
        <path
          d="M 32 35 C 36 24, 46 22, 50 30 C 54 22, 64 24, 68 35 C 64 30, 56 31, 52 35 C 48 31, 40 30, 32 35 Z"
          fill="url(#valeriaHair)"
          stroke="#000"
          strokeWidth="1.8"
        />
        {/* Side sideburn strands */}
        <path d="M 31 38 L 30 49 L 32 46" fill="url(#valeriaHair)" stroke="#000" strokeWidth="1" />
        <path d="M 69 38 L 70 49 L 68 46" fill="url(#valeriaHair)" stroke="#000" strokeWidth="1" />

        {/* 7. Eyes (Blinking/intelligent expressions based on state) */}
        <g>
          {/* Eyebrows */}
          <path d="M 38 34 C 41 33, 44 34, 46 36" fill="none" stroke="#111827" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M 62 34 C 59 33, 56 34, 54 36" fill="none" stroke="#111827" strokeWidth="1.8" strokeLinecap="round" />

          {/* Intelligent Eyes */}
          {state === 'thinking' ? (
            // Eyes looking upwards/thinking
            <>
              <ellipse cx="42" cy="40" rx="3.5" ry="3" fill="#FFF" stroke="#000" strokeWidth="1.5" />
              <ellipse cx="58" cy="40" rx="3.5" ry="3" fill="#FFF" stroke="#000" strokeWidth="1.5" />
              <circle cx="43" cy="39" r="1.8" fill="#10B981" />
              <circle cx="59" cy="39" r="1.8" fill="#10B981" />
              <circle cx="44.5" cy="38" r="0.6" fill="#FFF" />
              <circle cx="60.5" cy="38" r="0.6" fill="#FFF" />
            </>
          ) : state === 'excited' ? (
            // Sparkly happy squint
            <>
              <path d="M 38 41 C 41 38, 44 38, 46 41" fill="none" stroke="#000" strokeWidth="3" strokeLinecap="round" />
              <path d="M 62 41 C 59 38, 56 38, 54 41" fill="none" stroke="#000" strokeWidth="3" strokeLinecap="round" />
            </>
          ) : (
            // Explaining / Happy Standard
            <>
              <ellipse cx="41" cy="41" rx="3.5" ry="3.5" fill="#FFF" stroke="#000" strokeWidth="1.5" />
              <ellipse cx="59" cy="41" rx="3.5" ry="3.5" fill="#FFF" stroke="#000" strokeWidth="1.5" />
              <circle cx="41.5" cy="41" r="2" fill="#0D9488" />
              <circle cx="58.5" cy="41" r="2" fill="#0D9488" />
              <circle cx="42.5" cy="40" r="0.8" fill="#FFF" />
              <circle cx="59.5" cy="40" r="0.8" fill="#FFF" />
              <line x1="37" y1="40" x2="45" y2="40" stroke="#000" strokeWidth="1" opacity="0.3" />
              <line x1="63" y1="40" x2="55" y2="40" stroke="#000" strokeWidth="1" opacity="0.3" />
            </>
          )}

          {/* Cute pink cheek blushes */}
          <ellipse cx="37" cy="46" rx="2" ry="1" fill="#FDA4AF" opacity="0.6" />
          <ellipse cx="63" cy="46" rx="2" ry="1" fill="#FDA4AF" opacity="0.6" />

          {/* Nose */}
          <path d="M 50 43 L 49 46 L 50 46" fill="none" stroke="#E6B8AF" strokeWidth="1.2" strokeLinecap="round" />

          {/* Mouth */}
          {state === 'happy' || state === 'excited' ? (
            <path d="M 46 49 C 48 53, 52 53, 54 49 Z" fill="#E11D48" stroke="#000" strokeWidth="1.2" />
          ) : (
            // Speaking/explaining shape
            <ellipse cx="50" cy="50" rx="2.5" ry="1.5" fill="#991B1B" stroke="#000" strokeWidth="1" />
          )}
        </g>

        {/* Foreground dynamic HUD indicator rings overlay */}
        <path d="M 12 30 A 40 40 0 0 1 20 18" fill="none" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
        <path d="M 88 30 A 40 40 0 0 0 80 18" fill="none" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
        <line x1="12" y1="30" x2="16" y2="30" stroke="#10B981" strokeWidth="2" opacity="0.5" />
        <line x1="88" y1="30" x2="84" y2="30" stroke="#10B981" strokeWidth="2" opacity="0.5" />
      </svg>
    </div>
  );
};
