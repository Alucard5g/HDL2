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
          {/* Platinum / Golden blonde hair gradient matching the comic style of the photo */}
          <linearGradient id="valeriaHair" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFDF0" /> {/* Platinum Highlight */}
            <stop offset="25%" stopColor="#FEF08A" /> {/* Soft Blonde */}
            <stop offset="65%" stopColor="#FDE047" /> {/* Warm Golden Blonde */}
            <stop offset="100%" stopColor="#CA8A04" /> {/* Golden Shadow */}
          </linearGradient>

          {/* Highlights for the hair shine */}
          <linearGradient id="hairHighlight" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#FEF08A" stopOpacity="0" />
          </linearGradient>

          {/* Clean pale-warm skin gradient resembling the photo */}
          <linearGradient id="valeriaSkin" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFF1E6" />
            <stop offset="100%" stopColor="#FADBD8" />
          </linearGradient>

          {/* Sleek black high-neck bodysuit matching the photo */}
          <linearGradient id="valeriaBodysuit" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2D2D30" />
            <stop offset="45%" stopColor="#18181B" />
            <stop offset="100%" stopColor="#09090B" />
          </linearGradient>

          {/* Ambient tactical radar background */}
          <radialGradient id="cyberGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ambient tactical radar background (SophIA AI theme) */}
        <circle cx="50" cy="50" r="47" fill="url(#cyberGlow)" />
        <circle cx="50" cy="50" r="46" fill="none" stroke="#10B981" strokeWidth="1" strokeDasharray="5,3" opacity="0.15" />
        <circle cx="50" cy="50" r="35" fill="none" stroke="#10B981" strokeWidth="0.5" strokeDasharray="1,2" opacity="0.2" />

        {/* 1. Hair Back Volume (Behind neck and shoulders) */}
        <path
          d="M 28 42 C 20 26, 30 13, 50 13 C 70 13, 80 26, 72 42 L 77 82 C 77 86, 73 90, 68 90 L 64 64 L 36 64 L 32 90 C 27 90, 23 86, 23 82 Z"
          fill="url(#valeriaHair)"
          stroke="#000"
          strokeWidth="2"
        />

        {/* 2. Neck */}
        <path
          d="M 44 52 L 44 60 C 44 63, 56 63, 56 60 L 56 52 Z"
          fill="url(#valeriaSkin)"
          stroke="#000"
          strokeWidth="2"
        />

        {/* 3. Sleek Black Bodysuit Torso & High-neck Turtleneck Collar */}
        <path
          d="M 22 80 C 22 66, 32 61, 50 61 C 68 61, 78 66, 78 80 L 75 95 L 25 95 Z"
          fill="url(#valeriaBodysuit)"
          stroke="#000"
          strokeWidth="2.2"
        />
        {/* Turtleneck collar around neck base */}
        <path
          d="M 43 58 C 43 58, 50 61, 57 58 L 57 64 C 57 64, 50 67, 43 64 Z"
          fill="#1C1C1E"
          stroke="#000"
          strokeWidth="1.8"
        />

        {/* 4. White & Emerald SOPHIA-CIG Styled Monospace Text on Bodysuit Chest */}
        <g transform="translate(50, 73)">
          <rect x="-18" y="-4" width="36" height="6.5" rx="1.5" fill="#000000" opacity="0.4" />
          <text
            textAnchor="middle"
            fill="#FFFFFF"
            fontSize="4.2"
            fontFamily="monospace"
            fontWeight="900"
            letterSpacing="0.6"
          >
            SOPHIA<tspan fill="#10B981" fontWeight="bold">-CIG</tspan>
          </text>
        </g>

        {/* 5. Base Head */}
        <circle cx="50" cy="40" r="15.5" fill="url(#valeriaSkin)" stroke="#000" strokeWidth="2" />

        {/* 6. Intelligent Eyes (Varies based on SophIA's state) */}
        <g>
          {state === 'thinking' ? (
            // Eyes looking upwards & thoughtful eyebrows
            <>
              {/* Left Eyebrow */}
              <path d="M 37 29 C 40 27, 44 28, 46 30" fill="none" stroke="#111827" strokeWidth="1.8" strokeLinecap="round" />
              {/* Left Eye */}
              <path d="M 36 35 C 38 32, 44 32, 46 35 C 44 38, 38 38, 36 35 Z" fill="#FFF" stroke="#000" strokeWidth="1.5" />
              <circle cx="42.5" cy="34" r="2.5" fill="#0EA5E9" stroke="#0369A1" strokeWidth="0.5" />
              <circle cx="42.5" cy="34" r="1.2" fill="#0F172A" />
              <circle cx="43.5" cy="33.2" r="0.6" fill="#FFF" />

              {/* Right Eyebrow */}
              <path d="M 63 29 C 60 27, 56 28, 54 30" fill="none" stroke="#111827" strokeWidth="1.8" strokeLinecap="round" />
              {/* Right Eye */}
              <path d="M 54 35 C 56 32, 62 32, 64 35 C 62 38, 56 38, 54 35 Z" fill="#FFF" stroke="#000" strokeWidth="1.5" />
              <circle cx="59.5" cy="34" r="2.5" fill="#0EA5E9" stroke="#0369A1" strokeWidth="0.5" />
              <circle cx="59.5" cy="34" r="1.2" fill="#0F172A" />
              <circle cx="60.5" cy="33.2" r="0.6" fill="#FFF" />
            </>
          ) : state === 'excited' ? (
            // Sparkly happy squint eyes (^ ^)
            <>
              {/* Left Eyebrow */}
              <path d="M 37 28 C 40 26, 44 27, 46 29" fill="none" stroke="#111827" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M 36 36 C 39 32, 43 32, 46 36" fill="none" stroke="#000" strokeWidth="2.8" strokeLinecap="round" />

              {/* Right Eyebrow */}
              <path d="M 63 28 C 60 26, 56 27, 54 29" fill="none" stroke="#111827" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M 54 36 C 57 32, 61 32, 64 36" fill="none" stroke="#000" strokeWidth="2.8" strokeLinecap="round" />
            </>
          ) : (
            // Explaining / Happy Standard: Gorgeous forward-looking blue-green eyes
            <>
              {/* Left Eyebrow */}
              <path d="M 37 29 C 40 27, 44 28, 46 30" fill="none" stroke="#111827" strokeWidth="1.8" strokeLinecap="round" />
              {/* Left Eye */}
              <path d="M 36 35 C 38 32, 44 32, 46 35 C 44 38, 38 38, 36 35 Z" fill="#FFF" stroke="#000" strokeWidth="1.5" />
              <circle cx="41.5" cy="35" r="2.6" fill="#0EA5E9" stroke="#0369A1" strokeWidth="0.5" />
              <circle cx="41.5" cy="35" r="1.2" fill="#0F172A" />
              <circle cx="42.5" cy="34.2" r="0.6" fill="#FFF" />
              <path d="M 35.5 34.5 C 37 31.5, 43 31, 46.5 34" fill="none" stroke="#000" strokeWidth="1.5" />
              <path d="M 45 33 L 47 31" stroke="#000" strokeWidth="0.8" strokeLinecap="round" />

              {/* Right Eyebrow */}
              <path d="M 63 29 C 60 27, 56 28, 54 30" fill="none" stroke="#111827" strokeWidth="1.8" strokeLinecap="round" />
              {/* Right Eye */}
              <path d="M 54 35 C 56 32, 62 32, 64 35 C 62 38, 56 38, 54 35 Z" fill="#FFF" stroke="#000" strokeWidth="1.5" />
              <circle cx="58.5" cy="35" r="2.6" fill="#0EA5E9" stroke="#0369A1" strokeWidth="0.5" />
              <circle cx="58.5" cy="35" r="1.2" fill="#0F172A" />
              <circle cx="59.5" cy="34.2" r="0.6" fill="#FFF" />
              <path d="M 53.5 34 C 57 31, 63 31.5, 64.5 34.5" fill="none" stroke="#000" strokeWidth="1.5" />
              <path d="M 55 33 L 53 31" stroke="#000" strokeWidth="0.8" strokeLinecap="round" />
            </>
          )}

          {/* Sweet Rosy Cheeks */}
          <ellipse cx="36" cy="41" rx="2" ry="1.2" fill="#FDA4AF" opacity="0.5" />
          <ellipse cx="64" cy="41" rx="2" ry="1.2" fill="#FDA4AF" opacity="0.5" />

          {/* Elegant Nose */}
          <path d="M 50 34 L 49 39 L 50 39" fill="none" stroke="#E6B8AF" strokeWidth="1.5" strokeLinecap="round" />

          {/* SophIA's Beautiful Lips / Mouth shape */}
          {state === 'happy' || state === 'excited' ? (
            // Joyful warm smile
            <path d="M 45 44 C 47 48, 53 48, 55 44 Z" fill="#F43F5E" stroke="#000" strokeWidth="1.5" />
          ) : state === 'thinking' ? (
            // Cute thoughtful line smile
            <path d="M 47 44 C 49 43, 51 43, 53 44" fill="none" stroke="#000" strokeWidth="1.8" strokeLinecap="round" />
          ) : (
            // Talking/explaining friendly mouth
            <ellipse cx="50" cy="44.5" rx="2.5" ry="1.5" fill="#E11D48" stroke="#000" strokeWidth="1.2" />
          )}
        </g>

        {/* 7. Beautiful Long Flowing Blonde Hair Strands (Draped over chest and shoulders) */}
        {/* Left Front Strand */}
        <path
          d="M 50 18 C 42 18, 32 23, 30 36 C 28 48, 31 60, 28 73 C 26 80, 29 86, 33 86 C 35 76, 36 66, 37 54 C 39 44, 44 40, 50 28 Z"
          fill="url(#valeriaHair)"
          stroke="#000"
          strokeWidth="1.8"
        />
        {/* Left Secondary Flowing Lock */}
        <path
          d="M 33 22 C 25 30, 22 43, 23 56 C 24 68, 26 78, 24 86 C 24 86, 27 88, 29 86 C 31 76, 29 66, 28 54 C 27 43, 30 33, 35 26 Z"
          fill="url(#valeriaHair)"
          stroke="#000"
          strokeWidth="1.5"
        />

        {/* Right Front Strand */}
        <path
          d="M 50 18 C 57 18, 68 23, 70 36 C 72 48, 69 60, 72 73 C 74 80, 71 86, 67 86 C 65 76, 64 66, 63 54 C 61 44, 56 40, 50 28 Z"
          fill="url(#valeriaHair)"
          stroke="#000"
          strokeWidth="1.8"
        />
        {/* Right Secondary Flowing Lock */}
        <path
          d="M 67 22 C 75 30, 78 43, 77 56 C 76 68, 74 78, 76 86 C 76 86, 73 88, 71 86 C 69 76, 71 66, 72 54 C 73 43, 70 33, 65 26 Z"
          fill="url(#valeriaHair)"
          stroke="#000"
          strokeWidth="1.5"
        />

        {/* Hair middle part split line */}
        <path d="M 50 16 L 50 24" fill="none" stroke="#A16207" strokeWidth="1.2" strokeLinecap="round" />

        {/* Blonde Hair Highlight Shine lines */}
        <path d="M 36 26 Q 42 22 46 26" fill="none" stroke="url(#hairHighlight)" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
        <path d="M 64 26 Q 58 22 54 26" fill="none" stroke="url(#hairHighlight)" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />

        {/* Foreground dynamic HUD indicator rings overlay (matching the DT Scout center of control) */}
        <path d="M 12 30 A 40 40 0 0 1 20 18" fill="none" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
        <path d="M 88 30 A 40 40 0 0 0 80 18" fill="none" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
        <line x1="12" y1="30" x2="16" y2="30" stroke="#10B981" strokeWidth="2" opacity="0.4" />
        <line x1="88" y1="30" x2="84" y2="30" stroke="#10B981" strokeWidth="2" opacity="0.4" />
      </svg>
    </div>
  );
};
