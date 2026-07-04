import React from 'react';

export interface AvatarConfig {
  hair: string;
  face: string;
  jersey: string;
  accessory: string;
  avatarType?: 'vector' | 'photo';
  uploadedPhoto?: string;
}

interface DTAvatarRendererProps {
  config?: AvatarConfig;
  size?: number;
  className?: string;
  showAccessory?: boolean;
  glow?: boolean;
}

// Color schemes matching our database and system definition
const JERSEY_SCHEMES: { [key: string]: { base: string; stripe: string; accent: string } } = {
  tricolor: { base: '#FDDF2B', stripe: '#0B2F83', accent: '#EF4444' }, // Ecuador
  crimson: { base: '#DC2626', stripe: '#111827', accent: '#F59E0B' },  // Crimson Fury
  forest: { base: '#0D9488', stripe: '#F8FAFC', accent: '#115E59' },   // Forest Shield
  shadow: { base: '#1E293B', stripe: '#EF4444', accent: '#0F172A' },   // Shadow Carbon
  hightech: { base: '#06B6D4', stripe: '#0F172A', accent: '#22D3EE' }, // Cyber Blue
  gold: { base: '#EAB308', stripe: '#FFFFFF', accent: '#CA8A04' }      // Golden Champion
};

export const DTAvatarRenderer: React.FC<DTAvatarRendererProps> = ({
  config,
  size = 120,
  className = '',
  showAccessory = true,
  glow = true
}) => {
  // Safe default fallback
  const avatar = config || {
    hair: 'punta',
    face: 'determinado',
    jersey: 'tricolor',
    accessory: 'pizarra'
  };

  const jerseyColors = JERSEY_SCHEMES[avatar.jersey] || JERSEY_SCHEMES.tricolor;

  if (avatar.avatarType === 'photo' && avatar.uploadedPhoto) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`relative rounded-full flex items-center justify-center select-none bg-slate-950 border-3 border-[#22c55e] overflow-hidden ${className} ${
          glow ? 'shadow-[0_0_15px_rgba(34,197,94,0.3)]' : ''
        }`}
      >
        <img
          src={avatar.uploadedPhoto}
          alt="Avatar de DT"
          className="w-full h-full object-cover rounded-full"
          referrerPolicy="no-referrer"
        />
        {/* Floating high-res Accessory badge if active and requested */}
        {showAccessory && (
          <div className="absolute -bottom-1 -right-1 bg-black border-2 border-[#22C55E] text-white w-9 h-9 rounded-xl flex items-center justify-center text-lg shadow-[3px_3px_0px_#000] z-20">
            {avatar.accessory === 'pizarra' && '📋'}
            {avatar.accessory === 'silbato' && '🪙'}
            {avatar.accessory === 'tablet' && '📱'}
            {avatar.accessory === 'termo' && '🧉'}
            {avatar.accessory === 'auriculares' && '🎧'}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      style={{ width: size, height: size }}
      className={`relative rounded-full flex items-center justify-center select-none ${className} ${
        glow ? 'shadow-[0_0_15px_rgba(34,197,94,0.15)]' : ''
      }`}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full overflow-visible drop-shadow-[2px_3px_5px_rgba(0,0,0,0.4)]"
      >
        <defs>
          {/* Skin and Shadow Gradients */}
          <radialGradient id="skinGrad" cx="50%" cy="40%" r="50%">
            <stop offset="0%" stopColor="#FFE0BD" />
            <stop offset="100%" stopColor="#F5C393" />
          </radialGradient>
          <linearGradient id="jerseyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={jerseyColors.base} />
            <stop offset="100%" stopColor={jerseyColors.base} stopOpacity={0.85} />
          </linearGradient>
          {/* Hair Gradients */}
          <linearGradient id="hairDark" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#312E81" />
            <stop offset="100%" stopColor="#1E1B4B" />
          </linearGradient>
          <linearGradient id="hairSpiky" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#DC2626" />
            <stop offset="50%" stopColor="#991B1B" />
            <stop offset="100%" stopColor="#450A0A" />
          </linearGradient>
          <linearGradient id="hairGold" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#B45309" />
          </linearGradient>
          <linearGradient id="capGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1E293B" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>
          <linearGradient id="holoLens" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#22D3EE" stopOpacity={0.8} />
            <stop offset="50%" stopColor="#EC4899" stopOpacity={0.8} />
            <stop offset="100%" stopColor="#A855F7" stopOpacity={0.8} />
          </linearGradient>

          {/* Background circle ring */}
          <radialGradient id="bgRing" cx="50%" cy="50%" r="50%">
            <stop offset="70%" stopColor="#0F172A" />
            <stop offset="100%" stopColor="#1E293B" />
          </radialGradient>
        </defs>

        {/* 1. Base Studio Ring */}
        <circle cx="50" cy="50" r="47" fill="url(#bgRing)" stroke="#000" strokeWidth="2.5" />
        <circle cx="50" cy="50" r="42" fill="none" stroke="#22C55E" strokeWidth="1" strokeDasharray="3,3" opacity="0.4" />

        {/* 2. Neck */}
        <rect x="45" y="55" width="10" height="15" rx="2" fill="#E2A676" stroke="#000" strokeWidth="2" />

        {/* 3. Base Chest/Jersey */}
        <path
          d="M 22 76 C 22 66, 32 60, 50 60 C 68 60, 78 66, 78 76 L 75 92 L 25 92 Z"
          fill="url(#jerseyGrad)"
          stroke="#000"
          strokeWidth="2.5"
        />
        {/* Stripe detailing */}
        <path
          d="M 38 61.2 C 42 66, 46 68, 50 68 C 54 68, 58 66, 62 61.2 L 63 91.5 L 37 91.5 Z"
          fill={jerseyColors.stripe}
          stroke="#000"
          strokeWidth="1.5"
        />
        {/* Accent Collar */}
        <path
          d="M 42 60 C 45 64, 55 64, 58 60"
          fill="none"
          stroke={jerseyColors.accent}
          strokeWidth="3.5"
          strokeLinecap="round"
        />

        {/* 4. Head/Face Base */}
        <circle cx="50" cy="45" r="21" fill="url(#skinGrad)" stroke="#000" strokeWidth="2.5" />

        {/* Ears */}
        <circle cx="28" cy="45" r="4" fill="#F5C393" stroke="#000" strokeWidth="1.5" />
        <circle cx="72" cy="45" r="4" fill="#F5C393" stroke="#000" strokeWidth="1.5" />

        {/* 5. Custom Hair */}
        {avatar.hair === 'lacio' && (
          // Lacio / Sleek Anime style (Dark Blue/Purple sleek bangs)
          <path
            d="M 28 36 C 28 20, 72 20, 72 36 C 72 36, 68 33, 62 34 C 58 35, 54 39, 50 35 C 46 39, 42 35, 38 34 C 32 33, 28 36, 28 36 Z"
            fill="url(#hairDark)"
            stroke="#000"
            strokeWidth="2"
          />
        )}

        {avatar.hair === 'punta' && (
          // Spiky hero hair (Fierce Crimson Spikes)
          <path
            d="M 26 38 C 24 32, 28 25, 33 22 C 30 18, 38 12, 42 16 C 45 8, 53 8, 56 15 C 60 11, 68 17, 66 22 C 72 26, 75 32, 73 38 C 70 34, 65 33, 61 35 C 56 32, 53 36, 50 32 C 47 36, 44 32, 39 35 C 35 33, 30 34, 26 38 Z"
            fill="url(#hairSpiky)"
            stroke="#000"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        )}

        {avatar.hair === 'afro' && (
          // Afro puffy style
          <g>
            <circle cx="34" cy="30" r="11" fill="url(#hairDark)" stroke="#000" strokeWidth="1.5" />
            <circle cx="50" cy="24" r="13" fill="url(#hairDark)" stroke="#000" strokeWidth="1.5" />
            <circle cx="66" cy="30" r="11" fill="url(#hairDark)" stroke="#000" strokeWidth="1.5" />
            <circle cx="28" cy="40" r="9" fill="url(#hairDark)" stroke="#000" strokeWidth="1.5" />
            <circle cx="72" cy="40" r="9" fill="url(#hairDark)" stroke="#000" strokeWidth="1.5" />
          </g>
        )}

        {avatar.hair === 'militar' && (
          // Crew cut / military sleek hair
          <path
            d="M 29 40 C 29 25, 71 25, 71 40"
            fill="none"
            stroke="#111827"
            strokeWidth="5"
            strokeLinecap="round"
          />
        )}

        {avatar.hair === 'samurai' && (
          // Moño Samurai style
          <g>
            {/* Samurai bun top */}
            <circle cx="50" cy="18" r="6" fill="url(#hairDark)" stroke="#000" strokeWidth="2" />
            <path d="M 46 22 L 54 22 L 52 16 L 48 16 Z" fill="#E11D48" stroke="#000" strokeWidth="1" />
            {/* Smooth top hair */}
            <path
              d="M 28 38 C 28 22, 72 22, 72 38 C 72 38, 62 33, 50 34 C 38 33, 28 38, 28 38 Z"
              fill="url(#hairDark)"
              stroke="#000"
              strokeWidth="2"
            />
          </g>
        )}

        {avatar.hair === 'gorra' && (
          // Tactical manager cap/hat
          <g>
            {/* Cap dome */}
            <path
              d="M 27 34 C 27 18, 73 18, 73 34 Z"
              fill="url(#capGrad)"
              stroke="#000"
              strokeWidth="2"
            />
            {/* Cap visor */}
            <path
              d="M 20 34 C 35 31, 65 31, 80 34 C 75 39, 25 39, 20 34 Z"
              fill="#111827"
              stroke="#000"
              strokeWidth="2.5"
            />
            {/* Cap badge emblem */}
            <circle cx="50" cy="27" r="3" fill="#22C55E" />
          </g>
        )}

        {/* 6. Eyes/Face Expressions */}
        {avatar.face === 'concentrado' && (
          // Concentrated tactician (sharp eyebrows, narrow eyes)
          <g>
            {/* Eyebrows */}
            <path d="M 36 37 L 45 40" stroke="#000" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 64 37 L 55 40" stroke="#000" strokeWidth="2.5" strokeLinecap="round" />
            {/* Eyes */}
            <ellipse cx="40" cy="43" rx="3.5" ry="1.5" fill="#111827" />
            <ellipse cx="60" cy="43" rx="3.5" ry="1.5" fill="#111827" />
            <circle cx="41" cy="43" r="0.7" fill="#FFF" />
            <circle cx="61" cy="43" r="0.7" fill="#FFF" />
            {/* Mouth: straight line */}
            <path d="M 45 52 L 55 52" stroke="#000" strokeWidth="2" strokeLinecap="round" />
          </g>
        )}

        {avatar.face === 'sonriente' && (
          // Happy leader
          <g>
            {/* Eyebrows */}
            <path d="M 35 36 C 39 34, 43 35, 45 37" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" />
            <path d="M 65 36 C 61 34, 57 35, 55 37" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" />
            {/* Eyes (arched smiles) */}
            <path d="M 36 43 C 38 41, 42 41, 44 43" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 64 43 C 62 41, 58 41, 56 43" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" />
            {/* Mouth: smiling open mouth */}
            <path d="M 43 51 C 45 55, 55 55, 57 51 Z" fill="#991B1B" stroke="#000" strokeWidth="1.5" />
          </g>
        )}

        {avatar.face === 'heroico' && (
          // Graphic novel manga look (large focus eyes)
          <g>
            {/* Eyebrows */}
            <path d="M 34 35 C 38 34, 43 37, 45 39" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 66 35 C 62 34, 57 37, 55 39" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" />
            {/* Large anime eyes */}
            <rect x="36" y="41" width="8" height="5" rx="2" fill="#1E1B4B" stroke="#000" strokeWidth="1.5" />
            <rect x="56" y="41" width="8" height="5" rx="2" fill="#1E1B4B" stroke="#000" strokeWidth="1.5" />
            <circle cx="39" cy="43" r="1.5" fill="#FFF" />
            <circle cx="59" cy="43" r="1.5" fill="#FFF" />
            {/* Mouth: confident smirk */}
            <path d="M 46 51 C 48 53, 54 53, 56 50" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" />
          </g>
        )}

        {avatar.face === 'determinado' && (
          // Standard determined champ focus
          <g>
            {/* Eyebrows */}
            <path d="M 33 37 L 44 39" stroke="#000" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 67 37 L 56 39" stroke="#000" strokeWidth="2.5" strokeLinecap="round" />
            {/* Sharp Eyes */}
            <path d="M 35 44 L 45 42" stroke="#000" strokeWidth="3" strokeLinecap="round" />
            <path d="M 65 44 L 55 42" stroke="#000" strokeWidth="3" strokeLinecap="round" />
            {/* Iris points */}
            <circle cx="40" cy="44" r="1.5" fill="#111827" />
            <circle cx="60" cy="44" r="1.5" fill="#111827" />
            {/* Mouth: determined line */}
            <path d="M 44 51 L 56 51" stroke="#000" strokeWidth="2.5" strokeLinecap="round" />
          </g>
        )}

        {avatar.face === 'lentes' && (
          // Neon holographic tech glass overlay
          <g>
            {/* Normal determined eyes underneath */}
            <path d="M 35 44 L 43 43" stroke="#000" strokeWidth="2" />
            <path d="M 65 44 L 57 43" stroke="#000" strokeWidth="2" />
            <circle cx="39" cy="44" r="1" fill="#000" />
            <circle cx="61" cy="44" r="1" fill="#000" />
            <path d="M 44 51 L 56 51" stroke="#000" strokeWidth="2" />
            {/* Holographic glowing visor glasses */}
            <path
              d="M 28 40 L 72 40 L 68 47 L 32 47 Z"
              fill="url(#holoLens)"
              stroke="#000"
              strokeWidth="1.5"
            />
            {/* Glasses rim glow reflection */}
            <line x1="30" y1="42" x2="70" y2="42" stroke="#FFF" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
          </g>
        )}

        {/* Nose: subtle shadow */}
        <path d="M 50 45 L 48 49 L 50 49" fill="none" stroke="#D19E75" strokeWidth="1.5" strokeLinecap="round" />

        {/* 7. Accessories (floating inside the container frame at bottom right of rendering) */}
      </svg>

      {/* Floating high-res Accessory badge if active and requested */}
      {showAccessory && (
        <div className="absolute -bottom-1 -right-1 bg-black border-2 border-[#22C55E] text-white w-9 h-9 rounded-xl flex items-center justify-center text-lg shadow-[3px_3px_0px_#000] animate-bounce-slow">
          {avatar.accessory === 'pizarra' && '📋'}
          {avatar.accessory === 'silbato' && '🪙'}
          {avatar.accessory === 'tablet' && '📱'}
          {avatar.accessory === 'termo' && '🧉'}
          {avatar.accessory === 'auriculares' && '🎧'}
        </div>
      )}
    </div>
  );
};
