import React from 'react';
const logoImg = '/src/assets/images/heroes_del_deporte_logo_1782326056278.jpg';

interface TactikAiLogoProps {
  /**
   * Layout format:
   * - 'full': Main hero header (Hexagon avatar stacked with big text & sports slogan)
   * - 'horizontal': Compact layout (Hexagon inline left with text right)
   * - 'badge': Icon-only graphic (glowing hexagon runner)
   */
  layout?: 'full' | 'horizontal' | 'badge';
  className?: string;
  iconSize?: number;
}

export const TactikAiLogo: React.FC<TactikAiLogoProps> = ({
  layout = 'full',
  className = '',
  iconSize = 130
}) => {
  if (layout === 'badge') {
    return (
      <div className={`inline-flex items-center justify-center p-1 ${className}`}>
        <img
          src={logoImg}
          alt="Héroes del Deporte Badge"
          className="rounded-xl object-cover border-2 border-emerald-500/40 shadow-lg shadow-emerald-500/20 hover:scale-105 transition-transform duration-200"
          style={{ width: iconSize, height: iconSize }}
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  if (layout === 'horizontal') {
    return (
      <div className={`flex items-center gap-3.5 select-none ${className}`}>
        {/* Small glowing cropped-avatar badge representation */}
        <div className="shrink-0 transition-all duration-300 transform hover:scale-110">
          <img
            src={logoImg}
            alt="Héroes del Deporte Icon"
            className="w-12 h-12 rounded-xl object-cover border-2 border-[#22c55e]/60 shadow-[0_0_12px_rgba(34,197,94,0.3)]"
            referrerPolicy="no-referrer"
          />
        </div>
        
        {/* Text Container aligned with extreme comic novel style */}
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-1 font-bangers tracking-wider uppercase leading-none">
            <span className="text-2xl md:text-3xl font-extrabold text-[#FFFDEC] drop-shadow-[2.5px_2.5px_0px_#000] tracking-normal">
              HÉROES
            </span>
            {/* Styled "DEL DEPORTE" letters matching the glowing technology design */}
            <span className="inline-flex items-center justify-center text-center font-black px-2 py-0.5 rounded-lg bg-[#15803d]/35 border-2 border-[#22c55e]/60 text-xs text-[#22c55e] shadow-[0_0_12px_rgba(34,197,94,0.4)] tracking-wider h-6 ml-1 relative overflow-hidden transform -rotate-2">
              DEL DEPORTE
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
            </span>
          </div>
          
          <span className="text-[8.5px] md:text-[9.5px] font-mono tracking-widest font-black text-[#22c55e] uppercase leading-none mt-1.5">
            EL ÁLBUM DIGITAL DE LOS HÉROES DEL DEPORTE
          </span>
        </div>
      </div>
    );
  }

  // default: 'full' Hero Cover style Logo (DC/Marvel layout matching original reference exactly)
  return (
    <div className={`flex flex-col items-center justify-center text-center p-4 select-none ${className}`} id="tactikai-premium-branding">
      <div className="relative group overflow-hidden border-4 border-black rounded-3xl shadow-[8px_8px_0px_rgba(0,0,0,1)] transition-all duration-300 hover:shadow-[12px_12px_0px_rgba(0,0,0,1)] hover:-translate-y-1.5 max-w-[340px] sm:max-w-[400px] w-full bg-slate-950">
        {/* Metallic reflections glow */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none group-hover:translate-x-full transition-transform duration-1000" />
        
        {/* Main high-fidelity cover image */}
        <img
          src={logoImg}
          alt="Héroes del Deporte Digital Album Official Logo"
          className="w-full h-auto object-cover block transition-transform duration-500 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />
        
        {/* Intense Green/Red border shimmer action */}
        <div className="absolute inset-0 border-2 border-transparent group-hover:border-[#22c55e]/60 transition-colors pointer-events-none rounded-2xl" />
      </div>
    </div>
  );
};

