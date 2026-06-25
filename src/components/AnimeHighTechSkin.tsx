import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Cpu, Sliders, Play, Zap, RefreshCw, Eye, EyeOff } from 'lucide-react';

// Lightweight Canvas Background Particles
const HighTechCanvasBg: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Particle design
    const particles: Array<{
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      color: string;
      alpha: number;
      pulseSpeed: number;
    }> = [];
    const colors = ['rgba(255, 255, 255, ', 'rgba(34, 197, 94, '];

    for (let i = 0; i < 30; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 1.5 + 0.5,
        speedX: (Math.random() - 0.5) * 0.15,
        speedY: (Math.random() - 0.5) * 0.15,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.4 + 0.1,
        pulseSpeed: 0.005 + Math.random() * 0.01,
      });
    }

    const drawGrid = () => {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.012)';
      ctx.lineWidth = 1;
      const gridSize = 60;
      
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    };

    const drawHexagons = () => {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.015)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(width * 0.85, height * 0.2, 100, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(width * 0.1, height * 0.75, 140, 0, Math.PI * 2);
      ctx.stroke();
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      
      // Draw static tech grid
      drawGrid();
      drawHexagons();

      // Render floating stars/particles
      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;

        // Wrap around boundaries
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Alpha pulsation for anime-like sparkles
        p.alpha += p.pulseSpeed;
        if (p.alpha > 0.6 || p.alpha < 0.05) {
          p.pulseSpeed = -p.pulseSpeed;
        }

        ctx.fillStyle = `${p.color}${Math.max(0, p.alpha)})`;
        ctx.shadowBlur = 0; // Completely disable shadow glow for clean minimalist feel

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw horizontal scanner wave (very subtle)
      const time = Date.now() * 0.0003;
      const scanY = (time * 100) % (height + 200) - 100;
      const gradient = ctx.createLinearGradient(0, scanY - 20, 0, scanY + 20);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
      gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.005)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, scanY - 20, width, 40);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />;
};

interface AnimeHighTechSkinProps {
  children: React.ReactNode;
  isActive: boolean;
  onToggleActive: () => void;
}

export const AnimeHighTechSkin: React.FC<AnimeHighTechSkinProps> = ({ children, isActive, onToggleActive }) => {
  return (
    <>
      {/* Dynamic Style Injection for Global Aesthetic Transformation */}
      {isActive && (
        <style dangerouslySetInnerHTML={{ __html: `
          /* Scanline overlay effect */
          .high-tech-scanlines::after {
            content: " ";
            display: block;
            position: fixed;
            top: 0; left: 0; bottom: 0; right: 0;
            background: linear-gradient(rgba(10, 10, 10, 0) 50%, rgba(0, 0, 0, 0.2) 50%), linear-gradient(90deg, rgba(255, 255, 255, 0.01), rgba(0, 0, 0, 0.03));
            aspect-ratio: auto;
            background-size: 100% 4px, 6px 100%;
            pointer-events: none;
            z-index: 100;
            opacity: 0.06;
          }

          /* Overriding comic-based headers & wrappers to Anime High-tech Minimalist Glassmorphism */
          .high-tech-active .bg-\\[\\#080c09\\] {
            background: rgba(13, 16, 15, 0.9) !important;
            backdrop-filter: blur(12px) !important;
            -webkit-backdrop-filter: blur(12px) !important;
            border: 1px solid rgba(255, 255, 255, 0.08) !important;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6) !important;
            border-radius: 16px !important;
          }

          .high-tech-active .bg-\\[\\#041208\\] {
            background: rgba(11, 13, 12, 0.95) !important;
            backdrop-filter: blur(12px) !important;
            -webkit-backdrop-filter: blur(12px) !important;
            border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5) !important;
          }

          .high-tech-active .bg-\\[\\#000000\\] {
            background: #090a0a !important;
            background-image: none !important;
          }

          .high-tech-active .border-black {
            border-color: rgba(255, 255, 255, 0.08) !important;
          }

          .high-tech-active .shadow-\\[8px_8px_0px_rgba\\(0\\,0\\,0\\,1\\)\\] {
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5) !important;
          }

          .high-tech-active .shadow-\\[6px_6px_0px_rgba\\(0\\,0\\,0\\,1\\)\\] {
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.45) !important;
          }

          .high-tech-active .shadow-\\[4px_4px_0px_rgba\\(0\\,0\\,0\\,1\\)\\] {
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.35) !important;
          }

          .high-tech-active .shadow-\\[5px_5px_0px_\\#22c55e\\] {
            box-shadow: 0 4px 15px rgba(34, 197, 94, 0.05) !important;
          }

          /* Card Background, Lists, Tables & Frame transformations for light-background elements */
          .high-tech-active .bg-white,
          .high-tech-active .bg-slate-50,
          .high-tech-active .bg-slate-100,
          .high-tech-active .bg-slate-200,
          .high-tech-active .bg-gray-50,
          .high-tech-active .bg-gray-100,
          .high-tech-active .bg-zinc-50,
          .high-tech-active .bg-zinc-100,
          .high-tech-active .bg-emerald-50,
          .high-tech-active .bg-red-50 {
            background: rgba(18, 20, 22, 0.92) !important;
            backdrop-filter: blur(12px) !important;
            -webkit-backdrop-filter: blur(12px) !important;
            color: #f1f5f9 !important;
            border: 1px solid rgba(255, 255, 255, 0.08) !important;
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4) !important;
          }

          /* Unlocked/Completed Level Cards (bg-rose-100) */
          .high-tech-active .bg-rose-100 {
            background: rgba(239, 68, 68, 0.04) !important;
            backdrop-filter: blur(12px) !important;
            -webkit-backdrop-filter: blur(12px) !important;
            color: #f1f5f9 !important;
            border: 1px solid rgba(239, 68, 68, 0.3) !important;
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4) !important;
          }

          /* Pending/Gift Pack Level Cards (bg-amber-100) */
          .high-tech-active .bg-amber-100 {
            background: rgba(245, 158, 11, 0.04) !important;
            backdrop-filter: blur(12px) !important;
            -webkit-backdrop-filter: blur(12px) !important;
            color: #f1f5f9 !important;
            border: 1px solid rgba(245, 158, 11, 0.25) !important;
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4) !important;
          }

          /* Blocked Level Cards (bg-slate-200/50) */
          .high-tech-active .bg-slate-200\/50 {
            background: rgba(15, 18, 20, 0.5) !important;
            backdrop-filter: blur(12px) !important;
            -webkit-backdrop-filter: blur(12px) !important;
            color: #64748b !important;
            border: 1px dashed rgba(255, 255, 255, 0.08) !important;
            box-shadow: none !important;
          }

          .high-tech-active .bg-slate-200\/50 p,
          .high-tech-active .bg-slate-200\/50 span,
          .high-tech-active .bg-slate-200\/50 h5 {
            color: #475569 !important;
            text-shadow: none !important;
          }

          /* Global text overrides for ALL dark/grey typography to guarantee pristine contrast on dark themes */
          .high-tech-active .text-black,
          .high-tech-active .text-slate-900,
          .high-tech-active .text-slate-800,
          .high-tech-active .text-slate-700,
          .high-tech-active .text-slate-600,
          .high-tech-active .text-gray-900,
          .high-tech-active .text-gray-800,
          .high-tech-active .text-gray-700,
          .high-tech-active .text-gray-600,
          .high-tech-active .text-zinc-900,
          .high-tech-active .text-zinc-800,
          .high-tech-active .text-zinc-700,
          .high-tech-active .text-zinc-600,
          .high-tech-active .text-neutral-900,
          .high-tech-active .text-neutral-800,
          .high-tech-active .text-neutral-700,
          .high-tech-active .bg-white .text-black,
          .high-tech-active .bg-white .text-slate-900,
          .high-tech-active .bg-white .text-slate-800,
          .high-tech-active .bg-white .text-slate-700,
          .high-tech-active .bg-white .text-slate-600,
          .high-tech-active .bg-white .text-gray-900,
          .high-tech-active .bg-white .text-gray-800,
          .high-tech-active .bg-white .text-gray-700,
          .high-tech-active .bg-white .text-gray-600,
          .high-tech-active .bg-white h1,
          .high-tech-active .bg-white h2,
          .high-tech-active .bg-white h3,
          .high-tech-active .bg-white h4,
          .high-tech-active .bg-white p,
          .high-tech-active .bg-white span,
          .high-tech-active .bg-white li,
          .high-tech-active .bg-white strong {
            color: #e2e8f0 !important;
          }

          /* Interactive form components (Select, Inputs, Textareas) dark mode styling */
          .high-tech-active select,
          .high-tech-active input:not([type="checkbox"]):not([type="radio"]),
          .high-tech-active textarea {
            background: rgba(10, 12, 13, 0.9) !important;
            color: #f1f5f9 !important;
            border: 1px solid rgba(255, 255, 255, 0.12) !important;
            box-shadow: none !important;
            border-radius: 6px !important;
          }
          .high-tech-active select option {
            background: #111314 !important;
            color: #f1f5f9 !important;
          }

          /* Ensure secondary text is still legible but slightly dimmed */
          .high-tech-active .text-gray-500,
          .high-tech-active .text-slate-500,
          .high-tech-active .text-slate-400,
          .high-tech-active .text-zinc-500,
          .high-tech-active .text-zinc-400,
          .high-tech-active .bg-white .text-gray-500,
          .high-tech-active .bg-white .text-slate-500,
          .high-tech-active .bg-white .text-slate-400 {
            color: #94a3b8 !important;
          }

          .high-tech-active .bg-indigo-50,
          .high-tech-active span.bg-indigo-50 {
            background: rgba(99, 102, 241, 0.1) !important;
            border: 1px solid rgba(129, 140, 248, 0.3) !important;
            color: #c7d2fe !important;
            text-shadow: none !important;
          }

          .high-tech-active .bg-amber-50,
          .high-tech-active span.bg-amber-50 {
            background: rgba(245, 158, 11, 0.1) !important;
            border: 1px solid rgba(251, 191, 36, 0.3) !important;
            color: #fef08a !important;
            text-shadow: none !important;
          }

          .high-tech-active .bg-slate-100,
          .high-tech-active span.bg-slate-100 {
            background: rgba(148, 163, 184, 0.1) !important;
            border: 1px solid rgba(203, 213, 225, 0.25) !important;
            color: #f1f5f9 !important;
            text-shadow: none !important;
          }

          /* Highlighted red/crimson accents - subtle minimalist glow */
          .high-tech-active .text-[#EF4444],
          .high-tech-active .text-rose-500,
          .high-tech-active .text-rose-600,
          .high-tech-active .text-red-500 {
            color: #f87171 !important;
            text-shadow: 0 0 4px rgba(239, 68, 68, 0.2) !important;
          }

          /* Green / Successful text highlights */
          .high-tech-active .text-[#10B981],
          .high-tech-active .text-emerald-500,
          .high-tech-active .text-green-500 {
            color: #34d399 !important;
            text-shadow: 0 0 4px rgba(16, 185, 129, 0.2) !important;
          }

          /* Gold / Amber text highlights */
          .high-tech-active .text-yellow-400,
          .high-tech-active .text-amber-400,
          .high-tech-active .text-amber-500,
          .high-tech-active .text-amber-600 {
            color: #fbbf24 !important;
            text-shadow: 0 0 4px rgba(245, 158, 11, 0.2) !important;
          }

          /* Buttons styled as high-tech minimal slate outline buttons */
          .high-tech-active button:not(.nav-item-btn):not(.sticker-card-btn),
          .high-tech-active .bg-\\[\\#FDDF2B\\] {
            background: rgba(255, 255, 255, 0.04) !important;
            backdrop-filter: blur(6px) !important;
            color: #f1f5f9 !important;
            border: 1px solid rgba(255, 255, 255, 0.15) !important;
            box-shadow: none !important;
            text-shadow: none !important;
            border-radius: 6px !important;
            transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
            font-family: 'Space Grotesk', system-ui, sans-serif !important;
            letter-spacing: 0.03em !important;
            font-weight: 700 !important;
          }

          .high-tech-active button:not(.nav-item-btn):not(.sticker-card-btn):hover,
          .high-tech-active .bg-\\[\\#FDDF2B\\]:hover {
            background: rgba(34, 197, 94, 0.08) !important;
            border-color: #22c55e !important;
            color: #22c55e !important;
            box-shadow: 0 0 12px rgba(34, 197, 94, 0.2) !important;
            transform: translateY(-1px) !important;
          }

          /* Red/Action highlights - minimalist */
          .high-tech-active .bg-\\[\\#EF4444\\] {
            background: rgba(239, 68, 68, 0.08) !important;
            border-color: rgba(239, 68, 68, 0.4) !important;
            color: #fca5a5 !important;
          }

          .high-tech-active .bg-\\[\\#EF4444\\]:hover {
            background: rgba(239, 68, 68, 0.15) !important;
            border-color: #ef4444 !important;
            color: #ffffff !important;
            box-shadow: 0 0 12px rgba(239, 68, 68, 0.25) !important;
          }

          /* Green / Verified badges - minimalist */
          .high-tech-active .bg-\\[\\#11b782\\] {
            background: rgba(16, 185, 129, 0.08) !important;
            border-color: rgba(16, 185, 129, 0.4) !important;
            color: #a7f3d0 !important;
          }

          /* Outer frame border */
          .high-tech-active {
            border-color: #111315 !important;
          }

          /* Typography refinement - sleek high-contrast sans-serif */
          .high-tech-active h1,
          .high-tech-active h2,
          .high-tech-active h3,
          .high-tech-active h4,
          .high-tech-active .font-bangers {
            font-family: 'Space Grotesk', system-ui, -apple-system, sans-serif !important;
            font-weight: 700 !important;
            letter-spacing: -0.01em !important;
            text-transform: uppercase !important;
          }

          /* Halftone dot masking overrides */
          .high-tech-active .bg-halftone-dots,
          .high-tech-active .bg-halftone-red,
          .high-tech-active .bg-halftone-green,
          .high-tech-active .bg-halftone-yellow {
            background-image: none !important;
          }

          /* Glow borders */
          .high-tech-glow-border {
            position: relative;
          }
          .high-tech-glow-border::before {
            content: '';
            position: absolute;
            inset: 0;
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: inherit;
            pointer-events: none;
          }

          /* Space Brackets decorator for picture frames */
          .high-tech-bracket-decor {
            position: relative;
          }
          .high-tech-bracket-decor::before,
          .high-tech-bracket-decor::after {
            content: '';
            position: absolute;
            width: 8px;
            height: 8px;
            border-color: rgba(255, 255, 255, 0.2);
            border-style: solid;
            pointer-events: none;
          }
          .high-tech-bracket-decor::before {
            top: -2px;
            left: -2px;
            border-width: 1px 0 0 1px;
          }
          .high-tech-bracket-decor::after {
            bottom: -2px;
            right: -2px;
            border-width: 0 1px 1px 0;
          }

          /* Neon Scrollbars */
          .high-tech-active ::-webkit-scrollbar {
            width: 6px;
            height: 6px;
          }
          .high-tech-active ::-webkit-scrollbar-track {
            background: rgba(0, 0, 0, 0.3);
          }
          .high-tech-active ::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.12);
            border-radius: 3px;
          }
          .high-tech-active ::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.25);
          }
        ` }} />
      )}

      {/* Main Skin Layout wrapper */}
      <div className={`${isActive ? 'high-tech-active high-tech-scanlines bg-[#020503] text-slate-100' : ''} transition-all duration-350 relative min-h-screen`}>
        {/* Particle Overlay */}
        {isActive && <HighTechCanvasBg />}

        {/* Floating Toggle Skin Control Panel */}
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`flex items-center gap-2.5 p-2 px-3.5 rounded-full border-[2.5px] border-black bg-[#08150d]/90 backdrop-blur-md shadow-[4px_4px_0px_#000] text-white select-none ${isActive ? 'border-[#22c55e]/50 shadow-[0_0_15px_rgba(34,197,94,0.25)]' : ''}`}
          >
            <div className="relative flex h-3.5 w-3.5 shrink-0">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isActive ? 'bg-red-500' : 'bg-emerald-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-3.5 w-3.5 ${isActive ? 'bg-emerald-500' : 'bg-emerald-500'}`}></span>
            </div>

            <div className="flex flex-col text-left leading-none">
              <span className="text-[9.5px] font-bold uppercase tracking-wider font-mono text-slate-400">Skin de Interfaz</span>
              <span className="text-[11px] font-black uppercase font-sans tracking-wide text-white">
                {isActive ? '🌌 ANIME HIGH-TECH' : '🎨 CÓMIC RETRO'}
              </span>
            </div>

            <button
              onClick={onToggleActive}
              className="ml-1.5 p-1.5 rounded-lg bg-black/40 hover:bg-black/60 border border-slate-700 hover:border-slate-500 text-white transition-all cursor-pointer active:scale-95 flex items-center justify-center"
              title={isActive ? "Cambiar a Estilo Cómic Retro" : "Cambiar a Estilo Anime High-Tech (Honkai: Star Rail Style)"}
            >
              {isActive ? (
                <EyeOff className="w-3.5 h-3.5 text-red-500" />
              ) : (
                <Eye className="w-3.5 h-3.5 text-emerald-400" />
              )}
            </button>
          </motion.div>
        </div>

        {/* Floating Tech Corners overlay to accent the theme when active */}
        {isActive && (
          <>
            <div className="fixed top-2 left-2 z-50 pointer-events-none font-mono text-[9px] text-[#22c55e]/40 tracking-widest hidden lg:block select-none">
              SYS_BOOT_STABLE // STICKER_ENGINE_V2_0
            </div>
            <div className="fixed top-2 right-2 z-50 pointer-events-none font-mono text-[9px] text-[#22c55e]/40 tracking-widest hidden lg:block select-none">
              LATENCY_OK // CLOUD_RUN_INGRESS
            </div>
          </>
        )}

        {/* Renders actual application content */}
        <div className="relative z-10 w-full min-h-screen">
          {children}
        </div>
      </div>
    </>
  );
};
