import React, { useState } from 'react';
import { Player, UserTacticalBoard, Match, getCountryOfPlay } from '../types';
import { Eye, Check, RefreshCw, Send, HelpCircle, Save, Info } from 'lucide-react';

interface ActivePitchProps {
  country: string;
  players: Player[];
  savedBoard: UserTacticalBoard | null;
  match: Match;
  onSave: (board: UserTacticalBoard) => void;
}

// Coordinate blueprints for soccer positions based on selected formation
const FORMATIONS: {
  [key: string]: { label: string; coords: { [key: string]: { x: number; y: number; role: 'GK' | 'DF' | 'MF' | 'FW' } } };
} = {
  '4-3-3': {
    label: 'Defensiva 4-3-3',
    coords: {
      'GK': { x: 50, y: 88, role: 'GK' },
      'DF_LI': { x: 15, y: 70, role: 'DF' },
      'DF_C1': { x: 38, y: 72, role: 'DF' },
      'DF_C2': { x: 62, y: 72, role: 'DF' },
      'DF_LD': { x: 85, y: 70, role: 'DF' },
      'MC_MC1': { x: 30, y: 48, role: 'MF' },
      'MC_MCO': { x: 50, y: 42, role: 'MF' },
      'MC_MC2': { x: 70, y: 48, role: 'MF' },
      'FW_EI': { x: 20, y: 22, role: 'FW' },
      'FW_DC': { x: 50, y: 16, role: 'FW' },
      'FW_ED': { x: 80, y: 22, role: 'FW' },
    }
  },
  '4-4-2': {
    label: 'Clásica 4-4-2',
    coords: {
      'GK': { x: 50, y: 88, role: 'GK' },
      'DF_LI': { x: 15, y: 70, role: 'DF' },
      'DF_C1': { x: 38, y: 72, role: 'DF' },
      'DF_C2': { x: 62, y: 72, role: 'DF' },
      'DF_LD': { x: 85, y: 70, role: 'DF' },
      'MC_MI': { x: 18, y: 44, role: 'MF' },
      'MC_MC1': { x: 40, y: 48, role: 'MF' },
      'MC_MC2': { x: 60, y: 48, role: 'MF' },
      'MC_MD': { x: 82, y: 44, role: 'MF' },
      'FW_DC1': { x: 35, y: 18, role: 'FW' },
      'FW_DC2': { x: 65, y: 18, role: 'FW' },
    }
  },
  '3-5-2': {
    label: 'Ofensiva 3-5-2',
    coords: {
      'GK': { x: 50, y: 88, role: 'GK' },
      'DF_C1': { x: 25, y: 72, role: 'DF' },
      'DF_LIO': { x: 50, y: 75, role: 'DF' },
      'DF_C2': { x: 75, y: 72, role: 'DF' },
      'MC_CAD': { x: 12, y: 48, role: 'MF' },
      'MC_MC1': { x: 35, y: 50, role: 'MF' },
      'MC_MCO': { x: 50, y: 38, role: 'MF' },
      'MC_MC2': { x: 65, y: 50, role: 'MF' },
      'MC_CAA': { x: 88, y: 48, role: 'MF' },
      'FW_DC1': { x: 35, y: 18, role: 'FW' },
      'FW_DC2': { x: 65, y: 18, role: 'FW' },
    }
  },
  '5-3-2': {
    label: 'Contención 5-3-2',
    coords: {
      'GK': { x: 50, y: 88, role: 'GK' },
      'DF_LI': { x: 10, y: 65, role: 'DF' },
      'DF_C1': { x: 30, y: 70, role: 'DF' },
      'DF_LIO': { x: 50, y: 72, role: 'DF' },
      'DF_C2': { x: 70, y: 70, role: 'DF' },
      'DF_LD': { x: 90, y: 65, role: 'DF' },
      'MC_MC1': { x: 30, y: 46, role: 'MF' },
      'MC_MCO': { x: 50, y: 42, role: 'MF' },
      'MC_MC2': { x: 70, y: 46, role: 'MF' },
      'FW_DC1': { x: 35, y: 20, role: 'FW' },
      'FW_DC2': { x: 65, y: 20, role: 'FW' },
    }
  }
};

export default function ActivePitch({ country, players, savedBoard, match, onSave }: ActivePitchProps) {
  const [formationKey, setFormationKey] = useState<string>(savedBoard?.formation || '4-3-3');
  const [selectedSpots, setSelectedSpots] = useState<{ [posLabel: string]: string | null }>(
    savedBoard?.selectedPlayers || {
      'GK': null,
      'DF_LI': null, 'DF_C1': null, 'DF_C2': null, 'DF_LD': null,
      'MC_MC1': null, 'MC_MCO': null, 'MC_MC2': null,
      'FW_EI': null, 'FW_DC': null, 'FW_ED': null,
    }
  );

  // Load correct structure if formation matches
  React.useEffect(() => {
    if (savedBoard && savedBoard.formation === formationKey) {
      setSelectedSpots(savedBoard.selectedPlayers);
    } else {
      // Initialize layout spots for selected formation key
      const activeCoords = FORMATIONS[formationKey].coords;
      const initialSpots: { [posLabel: string]: string | null } = {};
      Object.keys(activeCoords).forEach(label => {
        initialSpots[label] = null;
      });
      setSelectedSpots(initialSpots);
    }
  }, [formationKey, savedBoard]);

  // Scouting and selection fields
  const [predictionLocal, setPredictionLocal] = useState<number>(savedBoard?.prediction?.golesLocal ?? 0);
  const [predictionVisitante, setPredictionVisitante] = useState<number>(savedBoard?.prediction?.golesVisitante ?? 0);
  const [activeSlotSelection, setActiveSlotSelection] = useState<string | null>(null); // slot position label currently being configured
  const [scoutDetailsPlayer, setScoutDetailsPlayer] = useState<Player | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [showHeatmap, setShowHeatmap] = useState<boolean>(false);

  // Helper to retrieve player objects currently set on various spots
  const getAssignedPlayer = (idStr: string | null) => {
    if (!idStr) return null;
    return players.find(p => p.id === idStr) || null;
  };

  // Get list of players that aren't already assigned to another position
  const getSelectablePlayers = (positionType: 'GK' | 'DF' | 'MF' | 'FW') => {
    const assignedIds = Object.values(selectedSpots).filter(Boolean);
    return players.filter(p => !assignedIds.includes(p.id) && p.position === positionType);
  };

  const handleSpotClick = (posLabel: string) => {
    setActiveSlotSelection(posLabel);
  };

  const handleAssignPlayer = (posLabel: string, playerId: string | null) => {
    setSelectedSpots(prev => ({
      ...prev,
      [posLabel]: playerId
    }));
    setActiveSlotSelection(null);
  };

  const handleClearBoard = () => {
    const resetSpots: { [posLabel: string]: string | null } = {};
    Object.keys(FORMATIONS[formationKey].coords).forEach(label => {
      resetSpots[label] = null;
    });
    setSelectedSpots(resetSpots);
  };

  const handleQuickAutoFill = () => {
    // Fill each spot with the highest rating available player fitting that position
    const filledSpots: { [posLabel: string]: string | null } = {};
    const assigned: string[] = [];

    const activeCoords = FORMATIONS[formationKey].coords;
    Object.entries(activeCoords).forEach(([label, info]) => {
      const candidates = players
        .filter(p => p.position === info.role && !assigned.includes(p.id))
        .sort((a, b) => b.rating - a.rating);

      if (candidates.length > 0) {
        filledSpots[label] = candidates[0].id;
        assigned.push(candidates[0].id);
      } else {
        filledSpots[label] = null;
      }
    });

    setSelectedSpots(filledSpots);
  };

  const handleTriggerSave = () => {
    setShowConfirmModal(true);
  };

  const currentAssignedCount = Object.values(selectedSpots).filter(Boolean).length;
  const isFormComplete = currentAssignedCount === 11;

  // Adaptive player selector renderer for high touch-usability (Bottom sheet in mobile, sidebar card in desktop)
  const renderPlayerSelector = (isMobile: boolean = false) => {
    if (!activeSlotSelection) return null;
    const assignedPlayer = getAssignedPlayer(selectedSpots[activeSlotSelection]);
    const selectable = getSelectablePlayers(FORMATIONS[formationKey].coords[activeSlotSelection].role);
    
    return (
      <div className={isMobile ? "text-slate-100" : "bg-slate-900 border border-slate-800 rounded-3xl p-5"} id={isMobile ? "mobile-placement-drawer" : "placement-panel"}>
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
          <h4 className="font-bold text-white text-sm flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="truncate">Asignar: {activeSlotSelection.split('_')[1] || activeSlotSelection} ({FORMATIONS[formationKey].coords[activeSlotSelection].role})</span>
          </h4>
          <button
            onClick={() => setActiveSlotSelection(null)}
            className="text-xs text-gray-400 hover:text-white px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded transition cursor-pointer shrink-0"
          >
            Cerrar
          </button>
        </div>

        <p className="text-xs text-slate-450 mb-3 block leading-normal">
          Selecciona uno de tus cromos tácticos desbloqueados para cubrir esta vacante:
        </p>

        <div className="max-h-60 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          {selectable.length === 0 ? (
            <div className="text-center py-6 bg-slate-950 rounded-xl border border-dashed border-slate-800/80">
              <p className="text-xs text-gray-500 mb-1">Sin jugadores disponibles.</p>
              <p className="text-[10px] text-yellow-300 max-w-[200px] mx-auto leading-normal">
                Supera trivias de este país para desbloquear más cromos en esta demarcación.
              </p>
            </div>
          ) : (
            selectable.map(p => (
              <div
                key={p.id}
                onClick={() => handleAssignPlayer(activeSlotSelection, p.id)}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-805 hover:border-emerald-500/50 cursor-pointer transition active:scale-[0.99] hover:bg-slate-900"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {p.imageUrl ? (
                    <div className="w-8 h-8 rounded overflow-hidden border border-amber-500/30 shrink-0">
                      <img
                        src={p.imageUrl}
                        alt={p.realName}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded bg-slate-900 border border-slate-850 flex items-center justify-center font-bold font-mono text-[9px] text-slate-450 shrink-0">
                      {p.realName.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <h5 className="text-xs font-bold text-white flex items-center gap-1.5 truncate">
                      <span className="truncate">{p.realName}</span>
                      <span className="text-[9px] bg-slate-800 px-1 py-0.5 rounded text-slate-400 shrink-0">{p.subPosition}</span>
                    </h5>
                    <p className="text-[9.5px] text-slate-500 font-mono mt-0.5 truncate">{getCountryOfPlay(p.currentClub)} • {p.dominantFoot}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10.5px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                    {p.rating}
                  </span>
                  <button className="p-1 rounded bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {assignedPlayer && (
          <button
            onClick={() => handleAssignPlayer(activeSlotSelection, null)}
            className="w-full mt-3.5 py-2 text-xs font-bold rounded-xl border border-rose-500/20 text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
          >
            Retirar Jugador Actual
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="tactical-board-section">
      {/* LEFT: Green Field (Tactical Canvas) */}
      <div className="lg:col-span-7 flex flex-col">
        <div className="flex items-center justify-between bg-slate-900 border border-slate-800/80 rounded-2xl p-4 mb-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-mono text-emerald-400 font-bold uppercase tracking-wider">Alineación</span>
            <select
              value={formationKey}
              onChange={(e) => setFormationKey(e.target.value)}
              className="bg-slate-950 text-white text-xs border border-slate-800/80 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
            >
              {Object.entries(FORMATIONS).map(([key, info]) => (
                <option className="bg-[#0f172a] text-white" key={key} value={key}>{info.label}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowHeatmap(!showHeatmap)}
              className={`text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-bold transition cursor-pointer select-none ${
                showHeatmap 
                  ? 'bg-gradient-to-r from-red-600/30 to-amber-600/30 text-rose-300 border-rose-500/50 shadow-[0_0_12px_rgba(239,68,68,0.2)]' 
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
              }`}
            >
              🔥 {showHeatmap ? 'Ocultar Mapa' : 'Mapa de Calor'}
            </button>
            <button
              onClick={handleQuickAutoFill}
              className="text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/25 border border-emerald-500/30 font-medium transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Auto-completar XI
            </button>
            <button
              onClick={handleClearBoard}
              className="text-xs hover:text-white text-gray-400 transition"
            >
              Limpiar
            </button>
          </div>
        </div>

        {/* The green tactical pitch */}
        <div className="relative w-full aspect-[4/5] bg-gradient-to-b from-emerald-950 to-green-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl p-1" style={{ minHeight: '440px' }}>
          {/* Soccer grass design pattern stripes */}
          <div className="absolute inset-0 flex flex-col opacity-10 pointer-events-none">
            {Array.from({ length: 10 }).map((_, index) => (
              <div key={index} className={`flex-1 ${index % 2 === 0 ? 'bg-black' : 'bg-transparent'}`} />
            ))}
          </div>

          {/* Soccer pitch overlay graphics */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Center line */}
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/20 -translate-y-1/2" />
            {/* Center circle */}
            <div className="absolute top-1/2 left-1/2 w-28 h-28 border-2 border-white/20 rounded-full -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-white/20 rounded-full -translate-x-1/2 -translate-y-1/2" />
            {/* Penalty Box North */}
            <div className="absolute top-0 left-1/2 w-1/2 h-1/5 border-b-2 border-x-2 border-white/20 -translate-x-1/2" />
            <div className="absolute top-[20%] left-1/2 w-24 h-8 border-b-2 border-white/20 rounded-b-full -translate-x-1/2 overflow-hidden opacity-50" />
            {/* Penalty Box South */}
            <div className="absolute bottom-0 left-1/2 w-1/2 h-1/5 border-t-2 border-x-2 border-white/20 -translate-x-1/2" />
            {/* Penalty spots */}
            <div className="absolute top-[12%] left-1/2 w-1.5 h-1.5 bg-white/30 rounded-full -translate-x-1/2" />
            <div className="absolute bottom-[12%] left-1/2 w-1.5 h-1.5 bg-white/30 rounded-full -translate-x-1/2" />
          </div>

          {/* Dynamic Tactical Heatmap Layer (Optimized for mobile with inline GPU-backed gradients) */}
          {showHeatmap && (
            <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-90 transition-opacity duration-300">
              {Object.entries(FORMATIONS[formationKey].coords).map(([label, coord]) => {
                const playerId = selectedSpots[label];
                if (!playerId) return null;
                const pObj = getAssignedPlayer(playerId);
                if (!pObj) return null;

                // High-fidelity comic colors based on tactical position
                const colorRgb = pObj.position === 'FW' 
                  ? '239, 68, 68'   // Vibrant crimson red
                  : pObj.position === 'MF' 
                    ? '245, 158, 11'  // Warm amber gold
                    : '16, 185, 129'; // Deep forest emerald green

                const glowSize = 80 + (pObj.rating - 70) * 1.5; // Bigger glow radius for highly-rated players
                const pulseDelay = (pObj.rating % 5) * 0.2;

                return (
                  <div
                    key={`heatmap-blob-${label}`}
                    style={{
                      left: `${coord.x}%`,
                      top: `${coord.y}%`,
                      width: `${glowSize}px`,
                      height: `${glowSize}px`,
                      backgroundImage: `radial-gradient(circle, rgba(${colorRgb}, 0.45) 0%, rgba(${colorRgb}, 0) 70%)`,
                      animationDelay: `${pulseDelay}s`
                    }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full animate-pulse z-0 mix-blend-screen"
                  />
                );
              })}
            </div>
          )}

          {/* Interactive slots according to selected formation */}
          {Object.entries(FORMATIONS[formationKey].coords).map(([label, coord]) => {
            const playerId = selectedSpots[label];
            const pObj = getAssignedPlayer(playerId);

            return (
              <button
                key={label}
                onClick={() => handleSpotClick(label)}
                className="absolute -translate-x-1/2 -translate-y-1/2 group z-10 transition-all cursor-pointer hover:scale-105 active:scale-95"
                style={{ left: `${coord.x}%`, top: `${coord.y}%` }}
              >
                <div className="flex flex-col items-center">
                  {pObj ? (
                    /* Placed Player Badge */
                    <div className="relative">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-slate-900 border-2 border-emerald-400 flex items-center justify-center text-white shadow-xl group-hover:border-white transition-colors overflow-hidden">
                        {pObj.imageUrl ? (
                          <img
                            src={pObj.imageUrl}
                            alt={pObj.realName}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        ) : pObj.position === 'GK' ? (
                          <span className="text-yellow-400 font-bold font-mono text-xs">GK</span>
                        ) : (
                          <span className="text-white font-mono text-xs">{pObj.realName.split(' ')[0]}</span>
                        )}
                        {/* Rating Badging */}
                        <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-slate-950 font-bold text-[9px] w-5 h-5 rounded-full flex items-center justify-center font-mono border border-slate-900">
                          {pObj.rating}
                        </span>
                      </div>
                      {/* Name tag */}
                      <div className="mt-1 bg-slate-950/80 backdrop-blur-md px-1.5 py-0.5 rounded border border-slate-800 text-[9px] text-white font-medium max-w-[80px] overflow-hidden truncate">
                        {pObj.realName}
                      </div>
                    </div>
                  ) : (
                    /* Empty Slot */
                    <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-slate-950/70 backdrop-blur-md border border-white/30 flex items-center justify-center text-white/50 group-hover:border-emerald-400 group-hover:text-emerald-400 group-hover:bg-slate-950 transition shadow-inner">
                      <span className="text-[10px] font-mono font-bold">{coord.role}</span>
                    </div>
                  )}
                  {/* Position label */}
                  <span className="text-[8px] text-white/40 uppercase font-mono mt-0.5 bg-black/40 px-1 rounded">
                    {label.split('_')[1] || label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-2.5 flex items-center gap-1.5 text-xs text-gray-400 font-mono bg-slate-950/50 p-2.5 rounded-lg border border-slate-900">
          <Info className="w-3.5 h-3.5 text-yellow-500 shrink-0" />
          <span>Haz clic en un círculo de la cancha para ubicar o sustituir un jugador.</span>
        </div>
      </div>

      {/* RIGHT: Selected slot detail & Forecast Form */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        
        {/* Active Placement Dialog */}
        {activeSlotSelection && (
          <>
            {/* Desktop Inline Placement Panel */}
            <div className="hidden lg:block">
              {renderPlayerSelector(false)}
            </div>
            
            {/* Mobile Bottom Sliding Drawer Portal */}
            <div 
              className="lg:hidden fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end justify-center"
              onClick={() => setActiveSlotSelection(null)}
            >
              <div 
                className="w-full bg-slate-900 border-t-[4px] border-black rounded-t-3xl p-5 max-h-[80dvh] overflow-y-auto shadow-2xl animate-fade-in"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto mb-4" />
                {renderPlayerSelector(true)}
              </div>
            </div>
          </>
        )}

        {/* General Scouting Inspector details */}
        {(!activeSlotSelection || activeSlotSelection) && (
          <div className={activeSlotSelection ? "hidden lg:block" : "block"}>
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider text-emerald-400 mb-3">Inspección de Cromo Táctico</h4>
              
              <div className="bg-slate-950 rounded-2xl p-4 border border-slate-900 flex flex-col items-center text-center">
                <select
                  value={scoutDetailsPlayer?.id || ''}
                  onChange={(e) => {
                    const p = players.find(x => x.id === e.target.value);
                    setScoutDetailsPlayer(p || null);
                  }}
                  className="w-full bg-slate-900 text-xs border border-slate-800 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 mb-4 text-white"
                >
                  <option className="bg-[#0f172a] text-white" value="">Selecciona un cromo para inspeccionar...</option>
                  {players.map(p => (
                    <option className="bg-[#0f172a] text-white" key={p.id} value={p.id}>{p.realName} ({p.position} - {p.rating})</option>
                  ))}
                </select>

                {scoutDetailsPlayer ? (
                  <div className="w-full animate-fade-in text-center" id="scouting-card-inspector">
                    {scoutDetailsPlayer.imageUrl ? (
                      <div className="relative w-32 h-44 mx-auto rounded-xl border border-amber-500/40 shadow-lg mb-3.5 overflow-hidden group">
                        <img
                          src={scoutDetailsPlayer.imageUrl}
                          alt={scoutDetailsPlayer.realName}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2 right-2 bg-slate-950/90 text-amber-400 font-bold font-mono text-[10.5px] px-2 py-0.5 rounded border border-amber-500/30 shadow-md">
                          {scoutDetailsPlayer.rating} GL
                        </div>
                      </div>
                    ) : (
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 font-bold text-base mb-2 font-mono">
                        {scoutDetailsPlayer.rating}
                      </div>
                    )}
                    <h5 className="font-bold text-base text-white">{scoutDetailsPlayer.realName}</h5>
                    <p className="text-xs text-amber-300 font-mono italic mt-0.5">"{scoutDetailsPlayer.name}"</p>
                    
                    <div className="grid grid-cols-2 gap-2 mt-4 text-[11px] text-left">
                      <div className="bg-slate-900/50 p-2 rounded-lg"><span className="text-gray-500 font-mono block uppercase">Liga (País)</span><span className="text-white font-medium truncate block">{getCountryOfPlay(scoutDetailsPlayer.currentClub)}</span></div>
                      <div className="bg-slate-900/50 p-2 rounded-lg"><span className="text-gray-500 font-mono block uppercase">Demarcación</span><span className="text-white font-medium truncate block">{scoutDetailsPlayer.subPosition}</span></div>
                      <div className="bg-slate-900/50 p-2 rounded-lg"><span className="text-gray-500 font-mono block uppercase">Edad / Talla</span><span className="text-white font-medium block">{scoutDetailsPlayer.age}a / {scoutDetailsPlayer.height}cm</span></div>
                      <div className="bg-slate-900/50 p-2 rounded-lg"><span className="text-gray-500 font-mono block uppercase">Perfil</span><span className="text-white font-medium block">{scoutDetailsPlayer.dominantFoot}</span></div>
                    </div>

                    <p className="text-[11px] text-gray-450 text-left bg-slate-900 border border-slate-850 p-3 rounded-xl mt-3 italic leading-relaxed">
                      <span className="font-bold text-emerald-400 not-italic block mb-0.5">Informe del DT:</span>
                      {scoutDetailsPlayer.styleOfPlay}
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Info className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                    <p className="text-xs text-gray-500 max-w-[200px]">Selecciona uno de los 26 cromos del país anterior para desplegar su ficha de scouting técnico.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Prediction Form Section */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5" id="prediction-panel">
          <h4 className="font-bold text-white text-xs uppercase tracking-wider text-emerald-400 mb-3">
            Pronóstico Oficial
          </h4>

          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-900 mb-4 text-center">
            <span className="text-[10px] font-mono text-gray-455 uppercase block mb-2">Próximo Encuentro Oficial</span>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-white w-1/3 truncate text-right">{match.local}</span>
              <span className="text-xs text-yellow-300 font-bold bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/20 font-mono">VS</span>
              <span className="text-sm font-bold text-white w-1/3 truncate text-left">{match.visitante}</span>
            </div>
            <span className="text-[10px] text-gray-500 block mt-1 font-mono">{match.fecha} • {match.grupo}</span>

            {/* AUDIT STATUS BANNER FOR RECENT SAVE */}
            {savedBoard && (
              <div className={`mt-3 p-3 rounded-xl text-left border-2 bg-slate-950 font-mono text-[10.5px] relative overflow-hidden ${
                savedBoard.predictionEligible !== false 
                  ? 'border-emerald-600/60 shadow-[2px_2px_0px_rgba(16,185,129,0.15)] bg-slate-950' 
                  : 'border-[#EF4444]/60 shadow-[2px_2px_0px_rgba(239,68,68,0.15)] bg-slate-950'
              }`}>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className={`inline-block w-2.5 h-2.5 rounded-full ${
                    savedBoard.predictionEligible !== false ? 'bg-emerald-500 animate-pulse' : 'bg-[#EF4444]'
                  }`} />
                  <span className={`font-bold uppercase tracking-wider ${
                    savedBoard.predictionEligible !== false ? 'text-emerald-400 font-bangers' : 'text-[#EF4444] font-bangers'
                  }`}>
                    {savedBoard.predictionEligible !== false ? '🏆 APTO PARA PUNTOS' : '⚠️ SÓLO REGISTRO HISTÓRICO'}
                  </span>
                </div>
                
                {savedBoard.predictionReason ? (
                  <p className="text-slate-300 font-sans leading-tight mt-1 text-[11px]">
                    {savedBoard.predictionReason}
                  </p>
                ) : (
                  <p className="text-slate-400 font-sans leading-tight mt-1 text-[11px]">
                    Cambios guardados con éxito en la alineación táctica y el marcador de {savedBoard.country}.
                  </p>
                )}

                {savedBoard.predictionSavedAt && (
                  <span className="text-[8.5px] text-gray-500 font-mono block mt-1.5 uppercase font-semibold">
                    Registrado: {new Date(savedBoard.predictionSavedAt).toLocaleString('es-EC')}
                  </span>
                )}
              </div>
            )}

            {/* Input Counters - High Visibility Steppers */}
            <div className="flex items-center justify-center gap-6 mt-4">
              <div className="flex flex-col items-center">
                <span className="text-[9.5px] text-gray-500 font-mono uppercase mb-2 tracking-wider">Goles Local</span>
                <div className="flex items-center gap-2 bg-slate-900 border-2 border-black p-1 rounded-xl shadow-[3px_3px_0px_#000]">
                  <button
                    type="button"
                    onClick={() => setPredictionLocal(prev => Math.max(0, prev - 1))}
                    className="w-8 h-8 rounded-lg bg-red-600 hover:bg-red-500 text-white font-black flex items-center justify-center border border-black cursor-pointer text-sm transition-transform active:scale-90"
                    title="Decrementar"
                  >
                    -
                  </button>
                  <span className="w-10 text-center text-lg font-mono font-black text-emerald-400">
                    {predictionLocal}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPredictionLocal(prev => Math.min(20, prev + 1))}
                    className="w-8 h-8 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black flex items-center justify-center border border-black cursor-pointer text-sm transition-transform active:scale-90"
                    title="Incrementar"
                  >
                    +
                  </button>
                </div>
              </div>

              <span className="text-2xl text-slate-600 font-black pt-5 font-mono">:</span>

              <div className="flex flex-col items-center">
                <span className="text-[9.5px] text-gray-550 font-mono uppercase mb-2 tracking-wider">Goles Vis.</span>
                <div className="flex items-center gap-2 bg-slate-900 border-2 border-black p-1 rounded-xl shadow-[3px_3px_0px_#000]">
                  <button
                    type="button"
                    onClick={() => setPredictionVisitante(prev => Math.max(0, prev - 1))}
                    className="w-8 h-8 rounded-lg bg-red-600 hover:bg-red-500 text-white font-black flex items-center justify-center border border-black cursor-pointer text-sm transition-transform active:scale-90"
                    title="Decrementar"
                  >
                    -
                  </button>
                  <span className="w-10 text-center text-lg font-mono font-black text-emerald-400">
                    {predictionVisitante}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPredictionVisitante(prev => Math.min(20, prev + 1))}
                    className="w-8 h-8 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black flex items-center justify-center border border-black cursor-pointer text-sm transition-transform active:scale-90"
                    title="Incrementar"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleTriggerSave}
            className={`w-full py-3.5 rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-2 transition cursor-pointer ${
              isFormComplete 
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 hover:opacity-90 transform hover:-translate-y-0.5' 
                : 'bg-slate-800 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Save className="w-4 h-4" /> Guardar Táctica y Pronóstico
          </button>

          {!isFormComplete && (
            <p className="text-[10px] text-rose-400 text-center mt-2.5 font-mono">
              * Debes ubicar exactamente a los 11 jugadores titulares en la cancha de fútbol para guardar tu plantilla táctica. ({currentAssignedCount}/11)
            </p>
          )}

          {isFormComplete && (
            <p className="text-[10px] text-emerald-400 text-center mt-2.5 font-mono flex items-center justify-center gap-1">
              <Check className="w-3.5 h-3.5" /> ¡Pizarra completa! Copiado de alineación listo para guardar.
            </p>
          )}

        </div>

      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-50 backdrop-blur-sm transition-all">
          <div className="bg-[#0b0f19] border-3 border-black text-white rounded-2xl w-full max-w-md shadow-[6px_6px_0px_#000] overflow-hidden">
            
            {/* Header */}
            <div className="bg-emerald-500 text-black p-4 font-bold border-b-2 border-black flex items-center gap-2">
              <span className="text-xl">🏆</span>
              <span className="font-mono text-sm uppercase font-black tracking-wider">Confirmar Alineación</span>
            </div>

            {/* Content */}
            <div className="p-5 space-y-4">
              <p className="text-xs font-semibold leading-relaxed text-slate-200">
                ¿Deseas confirmar y guardar la alineación táctica (Formación: <strong className="text-emerald-400">{formationKey}</strong>) y tu pronóstico oficial (<strong>{predictionLocal} - {predictionVisitante}</strong>) para <strong>{country}</strong>?
              </p>
              <p className="text-[11px] text-gray-405 italic">
                Se guardará de forma segura en las estadísticas del DT y se sincronizará inmediatamente con el panel del administrador para la auditoría física y digital de sorteos.
              </p>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  className="px-4 py-1.5 border-2 border-black bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl cursor-pointer active:translate-y-0.5"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowConfirmModal(false);
                    onSave({
                      country,
                      formation: formationKey,
                      selectedPlayers: selectedSpots,
                      prediction: {
                        matchId: match.id,
                        golesLocal: predictionLocal,
                        golesVisitante: predictionVisitante
                      }
                    });
                  }}
                  className="px-4 py-1.5 border-2 border-black bg-emerald-500 hover:bg-emerald-650 text-slate-950 text-xs font-black rounded-xl cursor-pointer shadow-[2.5px_2.5px_0px_rgba(0,0,0,1)] active:translate-y-0.5"
                >
                  Confirmar y Guardar
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
