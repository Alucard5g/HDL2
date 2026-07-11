import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  Sparkles, 
  BookOpen, 
  Flame, 
  Apple, 
  Activity, 
  GraduationCap, 
  HelpCircle, 
  ChevronRight, 
  Info,
  Gift,
  Trophy,
  Coins
} from 'lucide-react';

interface SocialImpactStadiumProps {
  socialFundTotal: number;
  personalDonationTotal: number;
  onDonateDirectly?: (amount: number) => void;
  userCashBalance?: number;
}

const MILESTONES = [
  {
    id: 1,
    axis: 'Nutrición',
    target: 100,
    desc: 'Programa de nutrición y meriendas saludables para 50 niños de la escuela local.',
    icon: <Apple className="w-4 h-4 text-emerald-400" />,
    color: 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
  },
  {
    id: 2,
    axis: 'Deporte',
    target: 250,
    desc: 'Equipamiento completo de fútbol (balones, chalecos, conos) para clubes barriales infantiles.',
    icon: <Flame className="w-4 h-4 text-[#FF7F00]" />,
    color: 'border-[#FF7F00] bg-[#FF7F00]/10 text-[#FF7F00]'
  },
  {
    id: 3,
    axis: 'Alfabetización',
    target: 450,
    desc: 'Donación de colecciones de novelas gráficas e historietas para motivar la lectura juvenil.',
    icon: <BookOpen className="w-4 h-4 text-indigo-400" />,
    color: 'border-indigo-500 bg-indigo-500/10 text-indigo-300'
  },
  {
    id: 4,
    axis: 'Salud',
    target: 700,
    desc: 'Brigadas de salud integral, vitaminas de crecimiento y chequeo odontológico gratuito.',
    icon: <Activity className="w-4 h-4 text-rose-400" />,
    color: 'border-rose-500 bg-rose-500/10 text-rose-300'
  },
  {
    id: 5,
    axis: 'Educación',
    target: 1000,
    desc: 'Conectividad a internet por 1 año y entrega de tablets para niños de centros rurales.',
    icon: <GraduationCap className="w-4 h-4 text-cyan-400" />,
    color: 'border-cyan-500 bg-cyan-500/10 text-cyan-300'
  }
];

export default function SocialImpactStadium({
  socialFundTotal = 258.45,
  personalDonationTotal = 0,
  onDonateDirectly,
  userCashBalance = 15.00
}: SocialImpactStadiumProps) {
  const [activeAxisIndex, setActiveAxisIndex] = useState<number>(0);
  const [rotationInterval, setRotationInterval] = useState<boolean>(true);
  const [customDonationAmount, setCustomDonationAmount] = useState<string>('5');
  const [localDonationError, setLocalDonationError] = useState<string>('');
  const [localDonationSuccess, setLocalDonationSuccess] = useState<string>('');

  const globalPoolTotal = socialFundTotal + personalDonationTotal;

  // Auto-rotate social milestones every 6 seconds
  useEffect(() => {
    if (!rotationInterval) return;
    const timer = setInterval(() => {
      setActiveAxisIndex(prev => (prev + 1) % MILESTONES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [rotationInterval]);

  // Determine construction progress percentage
  // 1000 USD total corresponds to 100% completed stadium
  const stadiumProgress = Math.min(100, Math.round((globalPoolTotal / 1000) * 100));

  // Determine how many seats/blocks to light up (up to 4 tiers)
  const activeTiers = Math.min(4, Math.floor(stadiumProgress / 25) + 1);

  const handleManualDonation = () => {
    setLocalDonationError('');
    setLocalDonationSuccess('');
    const amt = parseFloat(customDonationAmount);
    if (isNaN(amt) || amt <= 0) {
      setLocalDonationError('Por favor ingresa un monto mayor a $0.');
      return;
    }
    if (userCashBalance !== undefined && userCashBalance < amt) {
      setLocalDonationError('Saldo insuficiente en tu billetera. Visita Billetera para recargar.');
      return;
    }

    if (onDonateDirectly) {
      onDonateDirectly(amt);
      setLocalDonationSuccess(`¡Gracias! Has donado $${amt.toFixed(2)} USD con éxito. El estadio se ha actualizado.`);
      setTimeout(() => setLocalDonationSuccess(''), 5000);
    }
  };

  return (
    <div className="bg-[#0b0f19] border-[3.5px] border-black rounded-3xl p-6 shadow-[8px_8px_0px_#000] relative overflow-hidden" id="social-stadium-canvas">
      {/* Dynamic Ambient Blur */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-44 h-44 bg-[#FF7F00]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header and Title */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b-2 border-black pb-5 mb-6">
        <div>
          <span className="bg-red-500/15 text-[#EF4444] border-2 border-black text-[9px] font-mono font-black uppercase tracking-wider px-2 py-0.5 rounded shadow-[2.5px_2.5px_0px_#000] inline-block mb-1">
            ❤️ RESPONSABILIDAD SOCIAL TACTIKAI
          </span>
          <h3 className="font-bangers text-3xl text-white tracking-wide uppercase leading-none">
            Estadio 3D Causa Social
          </h3>
          <p className="text-slate-400 text-xs mt-1 max-w-xl">
            Construimos juntos el futuro. El <strong className="text-emerald-400">5% de cada transacción</strong> de sobres, pases y fichajes flash se destina de forma atómica y transparente a nuestro fondo de impacto comunitario.
          </p>
        </div>

        {/* Counter Badge */}
        <div className="bg-white border-3 border-black px-4.5 py-2.5 rounded-2xl text-black shadow-[4px_4px_0px_#FF7F00] flex flex-col items-center shrink-0">
          <span className="text-[9px] font-mono font-black text-slate-500 uppercase tracking-widest">Fondo Acumulado Live</span>
          <span className="text-2xl font-mono font-black text-black">
            ${globalPoolTotal.toFixed(2)} <span className="text-xs text-slate-500">USD</span>
          </span>
          <span className="text-[10px] font-bold text-emerald-600 font-mono mt-0.5 animate-pulse">
            🏟️ Estadio {stadiumProgress}% Lleno / Construido
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* LEFT COLUMN: ISOMETRIC 3D STADIUM MODEL (CSS Transforms) */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center py-6 relative">
          
          {/* Beautiful Container with perspective */}
          <div className="relative w-full max-w-[320px] aspect-square flex items-center justify-center [perspective:1000px]">
            
            {/* 3D Stadium wrapper */}
            <motion.div 
              style={{ transformStyle: 'preserve-3d' }}
              animate={{ 
                rotateX: 58, 
                rotateZ: [ -35, -45, -35 ] 
              }}
              transition={{
                rotateZ: {
                  repeat: Infinity,
                  duration: 20,
                  ease: "easeInOut"
                }
              }}
              className="relative w-64 h-64 bg-emerald-950/40 rounded-[40px] border-[4px] border-black shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center justify-center cursor-pointer group"
            >
              {/* STADIUM LAYERS (Tiers stack vertically on translateZ) */}

              {/* Pitch level (Bottom-most) */}
              <div 
                style={{ transform: 'translateZ(0px)' }}
                className="absolute inset-4 bg-emerald-800 border-[3.5px] border-white/60 rounded-[32px] overflow-hidden flex items-center justify-center shadow-inner"
              >
                {/* Grass stripes */}
                <div className="absolute inset-0 grid grid-cols-6 opacity-20 pointer-events-none">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className={`h-full ${i % 2 === 0 ? 'bg-black' : 'bg-transparent'}`} />
                  ))}
                </div>

                {/* Center Circle */}
                <div className="w-20 h-20 border-[2.5px] border-white/50 rounded-full flex items-center justify-center" />
                <div className="w-1.5 h-1.5 bg-white/70 rounded-full absolute" />
                
                {/* Penalty Boxes */}
                <div className="absolute top-0 w-32 h-10 border-b-[2.5px] border-x-[2.5px] border-white/40" />
                <div className="absolute bottom-0 w-32 h-10 border-t-[2.5px] border-x-[2.5px] border-white/40" />
              </div>

              {/* Tier 1 - Low seats (Z-index 20px) */}
              <div 
                style={{ 
                  transform: 'translateZ(18px)',
                  borderWidth: '4px'
                }}
                className={`absolute inset-2 border-black rounded-[36px] pointer-events-none transition-all duration-1000 ${
                  activeTiers >= 1 
                    ? 'border-emerald-500 bg-emerald-600/10 shadow-[0_0_15px_rgba(16,185,129,0.3)]' 
                    : 'border-slate-800/40 bg-transparent'
                }`}
              >
                {/* Simulated tiny spectator seats */}
                <div className="absolute inset-1 border border-dashed border-white/10 rounded-[30px] flex items-center justify-between p-1.5 font-mono text-[6px] text-white/10">
                  <span>● ● ● ● ●</span>
                  <span>● ● ● ● ●</span>
                </div>
              </div>

              {/* Tier 2 - Mid seats (Z-index 36px) */}
              <div 
                style={{ 
                  transform: 'translateZ(36px)',
                  borderWidth: '4px'
                }}
                className={`absolute inset-0 border-black rounded-[40px] pointer-events-none transition-all duration-1000 ${
                  activeTiers >= 2 
                    ? 'border-[#FF7F00] bg-orange-500/10 shadow-[0_0_18px_rgba(255,127,0,0.35)]' 
                    : 'border-slate-800/20 bg-transparent'
                }`}
              >
                {/* Simulated tiny spectator seats */}
                <div className="absolute inset-1 border border-dashed border-white/10 rounded-[34px] flex items-center justify-between p-2 font-mono text-[6px] text-white/5">
                  <span>■ ■ ■</span>
                  <span>■ ■ ■</span>
                </div>
              </div>

              {/* Tier 3 - VIP Boxes (Z-index 52px) */}
              <div 
                style={{ 
                  transform: 'translateZ(54px)',
                  borderWidth: '3.5px'
                }}
                className={`absolute -inset-2 border-black rounded-[44px] pointer-events-none transition-all duration-1000 ${
                  activeTiers >= 3 
                    ? 'border-indigo-500 bg-indigo-500/15 shadow-[0_0_20px_rgba(99,102,241,0.4)]' 
                    : 'border-slate-800/10 bg-transparent'
                }`}
              >
                {/* VIP lighting spotlights */}
                {activeTiers >= 3 && (
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 w-4 h-1 bg-cyan-400 rounded blur-[2px] animate-pulse" />
                )}
              </div>

              {/* Tier 4 - Outer High Roof & Floodlights (Z-index 70px) */}
              <div 
                style={{ 
                  transform: 'translateZ(72px)',
                  borderWidth: '5px'
                }}
                className={`absolute -inset-4 border-black rounded-[48px] pointer-events-none transition-all duration-1000 flex items-center justify-center ${
                  activeTiers >= 4 
                    ? 'border-yellow-450 bg-yellow-400/5 shadow-[0_0_25px_rgba(253,223,43,0.3)]' 
                    : 'border-slate-800/5 bg-transparent'
                }`}
              >
                {/* Floodlights at the corners */}
                {activeTiers >= 4 && (
                  <>
                    <div className="absolute top-0 left-0 w-3.5 h-3.5 bg-yellow-300 border-2 border-black rounded-full shadow-[0_0_12px_#FDDF2B] -translate-x-1 -translate-y-1" />
                    <div className="absolute top-0 right-0 w-3.5 h-3.5 bg-yellow-300 border-2 border-black rounded-full shadow-[0_0_12px_#FDDF2B] translate-x-1 -translate-y-1" />
                    <div className="absolute bottom-0 left-0 w-3.5 h-3.5 bg-yellow-300 border-2 border-black rounded-full shadow-[0_0_12px_#FDDF2B] -translate-x-1 translate-y-1" />
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-yellow-300 border-2 border-black rounded-full shadow-[0_0_12px_#FDDF2B] translate-x-1 translate-y-1" />
                  </>
                )}
              </div>

              {/* Hover card label */}
              <div 
                style={{ transform: 'translateZ(90px) rotateY(0deg)' }} 
                className="absolute bg-black/90 border-2 border-[#FF7F00] text-white text-[8px] font-mono uppercase tracking-widest px-2.5 py-1 rounded shadow-[3px_3px_0px_rgba(0,0,0,1)] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none font-bold"
              >
                Isométrico 3D Activo
              </div>

            </motion.div>

            {/* Stadium Shadow base */}
            <div className="absolute bottom-0 w-56 h-12 bg-black/60 rounded-full blur-xl -z-10 pointer-events-none" />
          </div>

          {/* Interactive Legends */}
          <div className="mt-5 flex items-center gap-4 flex-wrap justify-center text-[9px] font-mono font-black uppercase text-slate-400">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-emerald-500 rounded border border-black" /> Nutrición (L1)</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-[#FF7F00] rounded border border-black" /> Deporte (L2)</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-indigo-500 rounded border border-black" /> Lectura (L3)</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-yellow-400 rounded border border-black" /> Completo (L4)</span>
          </div>
        </div>

        {/* RIGHT COLUMN: INTERACTIVE MILESTONES & VOLUNTARY DONATIONS */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* ROTATING SOCIAL MILESTONES (Ejes de Impacto Social) */}
          <div className="bg-slate-950/80 border-3 border-black p-5 rounded-2xl shadow-[4px_4px_0px_#000] relative">
            <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
              <span className="text-[10px] font-mono font-black text-indigo-400 uppercase tracking-widest flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 animate-pulse" />
                Ejes de Causa Comunitaria
              </span>
              <button 
                onClick={() => setRotationInterval(!rotationInterval)}
                className={`text-[8px] font-mono font-black px-1.5 py-0.5 rounded border border-black cursor-pointer transition ${
                  rotationInterval ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400'
                }`}
              >
                {rotationInterval ? '⏸️ AUTO' : '▶️ PAUSADO'}
              </button>
            </div>

            {/* Render selected axis with high-fidelity transition */}
            <div className="min-h-[110px] flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className={`border-2 border-black p-1.5 rounded-lg shadow-[2px_2px_0px_rgba(0,0,0,1)] ${MILESTONES[activeAxisIndex].color.split(' ')[0]} ${MILESTONES[activeAxisIndex].color.split(' ')[1]}`}>
                    {MILESTONES[activeAxisIndex].icon}
                  </div>
                  <div>
                    <h4 className="font-sans font-black text-xs text-white uppercase">{MILESTONES[activeAxisIndex].axis}</h4>
                    <p className="text-[9px] font-mono font-black text-[#FF7F00] uppercase">Meta: ${MILESTONES[activeAxisIndex].target} USD</p>
                  </div>
                  <span className={`text-[8.5px] font-mono font-black ml-auto px-2 py-0.5 rounded border uppercase ${
                    globalPoolTotal >= MILESTONES[activeAxisIndex].target 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                      : 'bg-slate-900 text-slate-500 border-slate-800'
                  }`}>
                    {globalPoolTotal >= MILESTONES[activeAxisIndex].target ? '✅ ALCANZADO' : '⏳ EN CAMINO'}
                  </span>
                </div>
                <p className="text-xs font-comic text-slate-300 leading-normal mt-1 text-left">
                  {MILESTONES[activeAxisIndex].desc}
                </p>
              </div>

              {/* Navigation dots */}
              <div className="flex items-center gap-1.5 mt-4 pt-3 border-t border-white/5">
                {MILESTONES.map((m, idx) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      setActiveAxisIndex(idx);
                      setRotationInterval(false); // pause auto-rotation when user clicks
                    }}
                    className={`w-2.5 h-2.5 rounded-full border border-black cursor-pointer transition-all ${
                      activeAxisIndex === idx 
                        ? 'bg-[#FF7F00] scale-110' 
                        : 'bg-slate-800'
                    }`}
                    title={m.axis}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* VOLUNTARY DIRECT APORT WITH COINS OR CASH */}
          <div className="bg-slate-950/40 border-2 border-black p-5 rounded-2xl">
            <h4 className="font-extrabold text-sm text-white mb-2 flex items-center gap-1.5 uppercase font-mono tracking-wide text-indigo-400">
              <Gift className="w-4 h-4 text-emerald-400" /> Aporte Voluntario Directo
            </h4>
            <p className="text-[10px] text-slate-400 leading-relaxed mb-3">
              Puedes realizar aportes directos desde tu saldo virtual de micro-pagos para potenciar la causa. Cada dólar donado suma un acelerador del 10% en tu suerte para los sobres de tarjetas.
            </p>

            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-500">$</span>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={customDonationAmount}
                  onChange={(e) => setCustomDonationAmount(e.target.value)}
                  className="w-full bg-black text-white text-xs border-2 border-black rounded-xl px-7 py-2 font-mono focus:outline-none focus:border-[#FF7F00]"
                  placeholder="Monto USD"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] font-mono font-black text-slate-500">USD</span>
              </div>
              <button
                onClick={handleManualDonation}
                className="bg-emerald-500 hover:bg-emerald-400 text-black border-2 border-black font-sans font-black text-[10px] uppercase px-4 py-2.5 rounded-xl shadow-[3px_3px_0px_#000] cursor-pointer transition active:translate-y-0.5 active:shadow-[1px_1px_0px_#000] shrink-0 flex items-center gap-1"
              >
                <span>DONAR AHORA</span>
                <ChevronRight className="w-3 h-3 stroke-[3]" />
              </button>
            </div>

            {/* Error and success labels */}
            {localDonationError && (
              <p className="text-[9px] font-mono font-bold text-rose-500 mt-2">⚠️ {localDonationError}</p>
            )}
            {localDonationSuccess && (
              <p className="text-[10px] font-comic font-bold text-emerald-400 mt-2 bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">{localDonationSuccess}</p>
            )}

            <div className="mt-3.5 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-slate-500">
              <span>Tu Saldo de Caja: <strong className="text-white">${userCashBalance.toFixed(2)} USD</strong></span>
              <span className="text-[#FF7F00] font-bold">❤️ 100% Sin Fines de Lucro</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
