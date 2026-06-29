import React, { useState, useEffect } from 'react';
import { COUNTRIES, MATCH_FIXTURES, KNOCKOUT_FIXTURES } from '../data';
import { Player, UserTacticalBoard, Match } from '../types';
import { 
  Calendar, 
  Users, 
  Search, 
  ChevronRight, 
  Award, 
  Lock, 
  Unlock, 
  CheckCircle, 
  TrendingUp, 
  Filter, 
  Star,
  Info,
  Zap,
  Trophy,
  MapPin,
  Clock
} from 'lucide-react';

interface GroupsFixtureViewProps {
  unlockedLevels: { [countryName: string]: { [level: number]: boolean } };
  playersDB: { [countryName: string]: Player[] };
  userBoards: { [countryName: string]: UserTacticalBoard };
  onSelectCountry: (countryName: string) => void;
  setActiveTab: (tab: 'album' | 'board' | 'leaderboard' | 'groups_fixture' | 'flutter') => void;
  matchSyncKey?: number;
  onSavePlayoffs?: (winners: { [id: string]: string }, scores: { [id: string]: { golesLocal: number; golesVisitante: number } }) => void;
}

export default function GroupsFixtureView({ 
  unlockedLevels, 
  playersDB, 
  userBoards, 
  onSelectCountry, 
  setActiveTab,
  matchSyncKey,
  onSavePlayoffs
}: GroupsFixtureViewProps) {
  const [subTab, setSubTab] = useState<'groups' | 'fixtures' | 'knockouts'>('knockouts');
  const [groupFilter, setGroupFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [knockoutMode, setKnockoutMode] = useState<'list' | 'bracket'>('bracket');
  
  // Local bracket simulator selections loaded from userBoards if exists
  const [bracketWinners, setBracketWinners] = useState<{ [id: string]: string }>(() => {
    const saved = userBoards['__playoffPredictions'];
    return (saved as any)?.winners || {};
  });

  const [playoffScores, setPlayoffScores] = useState<{ [matchId: string]: { golesLocal: number; golesVisitante: number } }>(() => {
    const saved = userBoards['__playoffPredictions'];
    return (saved as any)?.scores || {};
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    const saved = userBoards['__playoffPredictions'];
    if (saved) {
      setBracketWinners((saved as any).winners || {});
      setPlayoffScores((saved as any).scores || {});
    }
  }, [userBoards]);

  const handleSelectWinner = (matchId: string, teamName: string, dependentKeys: string[]) => {
    setBracketWinners(prev => {
      const next = { ...prev, [matchId]: teamName };
      // Clear downstream predictions that depend on this match
      for (const dKey of dependentKeys) {
        delete next[dKey];
      }
      return next;
    });
  };

  const handleSavePlayoffsToDb = async () => {
    if (!onSavePlayoffs) {
      // Fallback local storage saving if no parent prop
      setIsSaving(true);
      setSaveStatus('idle');
      try {
        const updatedPlayoffs = {
          winners: bracketWinners,
          scores: playoffScores,
          predictionSavedAt: new Date().toISOString()
        };
        const updatedBoards = {
          ...userBoards,
          '__playoffPredictions': {
            country: '__playoffPredictions',
            formation: 'playoffs',
            selectedPlayers: {},
            prediction: null,
            winners: bracketWinners,
            scores: playoffScores,
            predictionSavedAt: new Date().toISOString()
          } as any
        };
        localStorage.setItem('scouting_tactical_boards', JSON.stringify(updatedBoards));
        setSaveStatus('success');
        setShowSuccessModal(true);
        setTimeout(() => setSaveStatus('idle'), 4000);
      } catch (err) {
        console.error(err);
        setSaveStatus('error');
      } finally {
        setIsSaving(false);
      }
      return;
    }

    setIsSaving(true);
    setSaveStatus('idle');
    try {
      await onSavePlayoffs(bracketWinners, playoffScores);
      setSaveStatus('success');
      setShowSuccessModal(true);
      setTimeout(() => setSaveStatus('idle'), 4000);
    } catch (err) {
      console.error(err);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const [bracketActiveTab, setBracketActiveTab] = useState<'left' | 'center' | 'right'>('center');
  const [bracketViewMode, setBracketViewMode] = useState<'fit' | 'full'>('fit');

  // Helper to calculate unlocked player count for any country
  const getUnlockedCount = (countryName: string): number => {
    const levels = unlockedLevels[countryName] || { 1: false, 2: false, 3: false };
    let count = 0;
    if (levels[1]) count += 9;
    if (levels[2]) count += 9;
    if (levels[3]) count += 8;
    return count;
  };

  // Helper to get flag emoji by country name
  const getFlagByName = (name: string): string => {
    const found = COUNTRIES.find(c => c.name.toLowerCase() === name.toLowerCase());
    return found ? found.flag : '🏳️';
  };

  // Group countries by their group
  const groupsList = ['Grupo A', 'Grupo B', 'Grupo C', 'Grupo D', 'Grupo E', 'Grupo F', 'Grupo G', 'Grupo H', 'Grupo I', 'Grupo J', 'Grupo K', 'Grupo L'];

  const getCountriesInGroup = (gName: string) => {
    return COUNTRIES.filter(c => c.group === gName);
  };

  // Filter matches based on group and user text search
  const filteredMatches = MATCH_FIXTURES.filter(m => {
    const matchesGroup = groupFilter === 'all' || m.grupo === groupFilter;
    const matchesSearch = searchQuery === '' || 
      m.local.toLowerCase().includes(searchQuery.toLowerCase()) || 
      m.visitante.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesGroup && matchesSearch;
  });

  const handleCountryClick = (cName: string) => {
    onSelectCountry(cName);
    setActiveTab('album');
  };

  return (
    <div className="space-y-8 animate-fade-in" id="groups-fixture-workspace">
      
      {/* Dynamic Tab Switcher */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-slate-900 border border-slate-850 p-2 rounded-2xl gap-3">
        <div className="flex w-full sm:w-auto bg-slate-950 p-1 rounded-xl">
          <button
            onClick={() => setSubTab('knockouts')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold transition duration-200 cursor-pointer ${
              subTab === 'knockouts'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Trophy className="w-4 h-4 text-yellow-400" />
            Playoffs (Bracket 32)
          </button>
          <button
            onClick={() => setSubTab('groups')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold transition duration-200 cursor-pointer ${
              subTab === 'groups'
                ? 'bg-indigo-650 text-white shadow-md shadow-indigo-600/10'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            Grilla de Grupos (A-L)
          </button>
          <button
            onClick={() => setSubTab('fixtures')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold transition duration-200 cursor-pointer ${
              subTab === 'fixtures'
                ? 'bg-indigo-650 text-white shadow-md shadow-indigo-600/10'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Calendario de Partidos (Fixture)
          </button>
        </div>

        {/* Quick statistics badge */}
        <div className="flex items-center gap-2 bg-slate-950/65 px-4 py-2 border border-slate-850 rounded-xl text-[11px] font-mono text-indigo-400">
          <Award className="w-3.5 h-3.5 text-yellow-400" />
          <span>
            {subTab === 'knockouts' 
              ? 'Fase Eliminatoria: 32 Selecciones • 16 Llaves de Dieciseisavos' 
              : 'Fase de Grupos: 48 Selecciones • 12 Grupos • 36 Partidos'}
          </span>
        </div>
      </div>

      {subTab === 'knockouts' ? (
        // KNOCKOUTS PLAYOFF BRACKET VIEW
        <div className="space-y-8 animate-fade-in" id="playoffs-bracket-root">
          {/* Header & Simulator Toggle */}
          <div className="bg-[#0c130d] border-4 border-black p-6 rounded-3xl shadow-[8px_8px_0px_rgba(0,0,0,1)] relative overflow-hidden">
            {/* Halftone Dot decorative overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(rgba(34,197,94,0.1)_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
            
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <span className="bg-red-600 text-white font-mono text-[10px] font-black px-3 py-1 rounded-md uppercase border-2 border-black tracking-widest inline-block skew-x-[-4deg]">
                  FASE DE ELIMINACIÓN DIRECTA
                </span>
                <h2 className="text-2xl font-black text-white mt-2 uppercase tracking-tight font-sans">
                  DIECISEISAVOS DE FINAL - HÉROES DEL DEPORTE
                </h2>
                <p className="text-xs text-gray-400 font-mono mt-1">
                  Hora de Ecuador (ECT) • Sorteo y Emparejamientos Oficiales Confirmados
                </p>
              </div>

              {/* View toggle button with graphic novel bubble look */}
              <div className="flex bg-black/60 p-1.5 rounded-xl border-2 border-slate-800 gap-1 shrink-0">
                <button
                  onClick={() => setKnockoutMode('bracket')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition duration-150 cursor-pointer flex items-center gap-1.5 uppercase ${
                    knockoutMode === 'bracket'
                      ? 'bg-red-600 text-white border border-black font-black'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Trophy className="w-3.5 h-3.5" />
                  Cuadro Interactivo
                </button>
                <button
                  onClick={() => setKnockoutMode('list')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition duration-150 cursor-pointer flex items-center gap-1.5 uppercase ${
                    knockoutMode === 'list'
                      ? 'bg-red-600 text-white border border-black font-black'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  Lista de Partidos
                </button>
              </div>
            </div>
          </div>

          {knockoutMode === 'list' ? (
            // LIST VIEW (The 16 matches with explicit requested fields)
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {KNOCKOUT_FIXTURES.map((match, idx) => {
                  const winner = bracketWinners[match.id];
                  const localSelected = winner === match.local;
                  const visiteSelected = winner === match.visitante;

                  const localCountry = COUNTRIES.find(c => c.name === match.local);
                  const visiteCountry = COUNTRIES.find(c => c.name === match.visitante);

                  return (
                    <div 
                      key={match.id}
                      className="bg-[#0f1411] border-4 border-black hover:border-red-600 rounded-3xl p-5 shadow-[6px_6px_0px_rgba(0,0,0,1)] transition-all flex flex-col justify-between relative group"
                    >
                      {/* Top ribbon: Phase, Date, Hour */}
                      <div className="flex justify-between items-center border-b-2 border-black pb-3 mb-4">
                        <span className="bg-red-600/10 border border-red-500/20 text-red-500 text-[10px] font-black font-mono uppercase px-2.5 py-1 rounded">
                          LLAVE {idx + 1} • {match.fase}
                        </span>
                        
                        <div className="flex items-center gap-3 text-xs font-bold text-gray-400 font-mono">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-red-500" />
                            {match.fecha}
                          </span>
                          <span className="flex items-center gap-1 bg-black/45 px-2 py-0.5 rounded border border-slate-800 text-yellow-400 text-[11px]">
                            <Clock className="w-3 h-3 text-yellow-400" />
                            {match.hora_ect}
                          </span>
                        </div>
                      </div>

                      {/* Head-to-head match details in comic panel slots */}
                      <div className="grid grid-cols-3 items-center text-center my-3 gap-1">
                        {/* Local */}
                        <div 
                          onClick={() => setBracketWinners(prev => ({ ...prev, [match.id]: match.local }))}
                          className={`p-3 rounded-2xl border-2 transition-all cursor-pointer select-none flex flex-col items-center justify-center gap-2 ${
                            localSelected 
                              ? 'bg-red-600/20 border-red-500 shadow-lg scale-105' 
                              : 'bg-white border-black text-black hover:bg-gray-100'
                          }`}
                        >
                          <span className="text-4xl filter drop-shadow">{localCountry?.flag || '🏳️'}</span>
                          <span className={`text-xs font-extrabold uppercase tracking-tight ${localSelected ? 'text-white' : 'text-black'}`}>
                            {match.local}
                          </span>
                          <span className="bg-black/10 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded text-black/70">
                            LOCAL
                          </span>
                        </div>

                        {/* VS Bubble */}
                        <div className="flex flex-col items-center justify-center">
                          <div className="w-12 h-12 rounded-full bg-black border-4 border-red-600 text-white font-mono font-black text-sm flex items-center justify-center shadow-lg transform rotate-[-8deg] shrink-0">
                            VS
                          </div>
                          {winner ? (
                            <div className="mt-3 bg-red-600 border-2 border-black text-white text-[9px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider skew-x-[-6deg] animate-pulse">
                              {winner} AVANZA
                            </div>
                          ) : (
                            <span className="text-[9px] font-mono text-gray-550 uppercase font-bold mt-2 tracking-wide block">
                              Haz click para avanzar
                            </span>
                          )}
                        </div>

                        {/* Visitante */}
                        <div 
                          onClick={() => setBracketWinners(prev => ({ ...prev, [match.id]: match.visitante }))}
                          className={`p-3 rounded-2xl border-2 transition-all cursor-pointer select-none flex flex-col items-center justify-center gap-2 ${
                            visiteSelected 
                              ? 'bg-red-600/20 border-red-500 shadow-lg scale-105' 
                              : 'bg-white border-black text-black hover:bg-gray-100'
                          }`}
                        >
                          <span className="text-4xl filter drop-shadow">{visiteCountry?.flag || '🏳️'}</span>
                          <span className={`text-xs font-extrabold uppercase tracking-tight ${visiteSelected ? 'text-white' : 'text-black'}`}>
                            {match.visitante}
                          </span>
                          <span className="bg-black/10 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded text-black/70">
                            VISITA
                          </span>
                        </div>
                      </div>

                      {/* Sede / Estadio */}
                      <div className="mt-4 pt-3.5 border-t border-slate-800/60 flex items-center justify-between text-xs font-mono text-gray-400">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                          <span>Estadio: <strong>{match.estadio}</strong></span>
                        </span>

                        <span className="text-[10px] uppercase font-bold text-gray-500 bg-black/40 border border-slate-850 px-2 py-0.5 rounded">
                          Ecuador (ECT)
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            // BRACKET VIEW (Spectacular Left/Right symmetrical tournament tree inspired by the uploaded image)
            <div className="space-y-6" id="interactive-bracket-tree">
              
              {/* Dynamic View Settings Header */}
              <div className="flex flex-col md:flex-row justify-between items-center bg-slate-900 border-4 border-black p-4 rounded-3xl gap-4 shadow-[6px_6px_0px_#000] relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(rgba(0,0,0,0.15)_1.5px,transparent_1.5px)] [background-size:12px_12px] pointer-events-none" />
                <div className="flex items-center gap-3 relative z-10">
                  <div className="w-10 h-10 bg-yellow-400 border-3 border-black rounded-xl flex items-center justify-center font-bold text-lg shadow-[2px_2px_0px_#000]">
                    🏆
                  </div>
                  <div>
                    <h4 className="font-bangers text-lg tracking-wider text-white uppercase drop-shadow-[1px_1px_0px_#000]">VISTA DEL SIMULADOR</h4>
                    <p className="text-[9px] font-mono text-[#10b981] uppercase tracking-widest font-black">Ajusta el tamaño del fixture a tu pantalla</p>
                  </div>
                </div>

                <div className="flex bg-slate-950 border-2 border-slate-800 p-1 rounded-2xl gap-1 shrink-0 relative z-10">
                  <button
                    onClick={() => setBracketViewMode('fit')}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                      bracketViewMode === 'fit'
                        ? 'bg-[#ef4444] text-white border border-black shadow-[2px_2px_0px_#000]'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    📱 Una Pantalla (Compacto)
                  </button>
                  <button
                    onClick={() => setBracketViewMode('full')}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                      bracketViewMode === 'full'
                        ? 'bg-[#ef4444] text-white border border-black shadow-[2px_2px_0px_#000]'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    🌳 Árbol Completo (Scroll)
                  </button>
                </div>
              </div>

              {/* Symmetrical Tree Zone Sub-Navigation */}
              <div className={`flex bg-slate-900 border-4 border-black p-1.5 rounded-2xl gap-1.5 justify-center max-w-lg mx-auto relative z-10 shadow-[4px_4px_0px_#000] ${
                bracketViewMode === 'fit' ? 'flex' : 'lg:hidden flex'
              }`}>
                <button
                  onClick={() => setBracketActiveTab('left')}
                  className={`flex-1 py-2 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer text-center border-2 ${
                    bracketActiveTab === 'left'
                      ? 'bg-[#ef4444] text-white border-black shadow-[3px_3px_0px_#000] translate-y-[-1px]'
                      : 'bg-slate-950 text-gray-400 border-slate-800 hover:text-white'
                  }`}
                >
                  ◀ LADO IZQ.
                </button>
                <button
                  onClick={() => setBracketActiveTab('center')}
                  className={`flex-1 py-2 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer text-center border-2 ${
                    bracketActiveTab === 'center'
                      ? 'bg-[#10b981] text-white border-black shadow-[3px_3px_0px_#000] translate-y-[-1px]'
                      : 'bg-slate-950 text-gray-400 border-slate-800 hover:text-white'
                  }`}
                >
                  🏆 GRAN FINAL
                </button>
                <button
                  onClick={() => setBracketActiveTab('right')}
                  className={`flex-1 py-2 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer text-center border-2 ${
                    bracketActiveTab === 'right'
                      ? 'bg-[#ef4444] text-white border-black shadow-[3px_3px_0px_#000] translate-y-[-1px]'
                      : 'bg-slate-950 text-gray-400 border-slate-800 hover:text-white'
                  }`}
                >
                  LADO DER. ▶
                </button>
              </div>

              {/* High-Fidelity Playoff Stage Map */}
              <div className="relative rounded-3xl overflow-hidden border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] bg-slate-950 p-3 md:p-5">
                
                {/* Comic skyline sunset horizon background with drone stars overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-red-950/40 via-slate-950 to-slate-950 pointer-events-none" />
                
                {/* Stars/Drones glow effects in background */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-red-600/15 rounded-full blur-[80px] pointer-events-none animate-pulse" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[220px] h-[220px] bg-emerald-600/10 rounded-full blur-[60px] pointer-events-none animate-pulse duration-4000" />
                
                {/* Silhouetted skyline decorator along the bottom of the section */}
                <div className="absolute bottom-0 left-0 right-0 h-28 opacity-10 pointer-events-none bg-cover bg-bottom select-none mix-blend-screen" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1519501025264-65ba15a82390?q=80&w=600&auto=format&fit=crop')` }} />

                {/* Symmetrical columns block */}
                <div className={`relative z-10 w-full select-none custom-scrollbar ${
                  bracketViewMode === 'fit' ? 'overflow-visible' : 'overflow-x-auto'
                }`}>
                  
                  {/* Container representing the layout of the user's uploaded mockup */}
                  <div className={
                    bracketViewMode === 'fit'
                      ? "w-full max-w-full grid grid-cols-5 gap-2 xl:gap-3 items-center py-4"
                      : "min-w-[1240px] xl:min-w-[1400px] grid grid-cols-11 gap-2 xl:gap-4 items-center py-6"
                  }>
                    
                    {/* COLUMN 1: Left Round of 32 (Dieciseisavos) */}
                    <div className={`col-span-2 ${
                      bracketViewMode === 'fit'
                        ? (bracketActiveTab === 'left' ? 'block space-y-2' : 'hidden')
                        : (bracketActiveTab === 'left' ? 'block space-y-4' : 'hidden lg:block space-y-4')
                    }`}>
                      <div className="text-center bg-black/80 border-2 border-red-600 py-1.5 px-3 rounded-xl mb-2">
                        <span className="text-[10px] font-black text-white uppercase font-mono tracking-widest">Dieciseisavos Izq.</span>
                      </div>
                      
                      {[
                        { id: 'ko-3', l: 'Alemania', v: 'Paraguay', next: 'oct-L1' },
                        { id: 'ko-6', l: 'Francia', v: 'Suecia', next: 'oct-L1' },
                        { id: 'ko-1', l: 'Sudáfrica', v: 'Canadá', next: 'oct-L2' },
                        { id: 'ko-4', l: 'Países Bajos', v: 'Marruecos', next: 'oct-L2' },
                        { id: 'ko-11', l: 'Portugal', v: 'Croacia', next: 'oct-L3' },
                        { id: 'ko-12', l: 'España', v: 'Austria', next: 'oct-L3' },
                        { id: 'ko-9', l: 'Estados Unidos', v: 'Bosnia y Herzegovina', next: 'oct-L4' },
                        { id: 'ko-10', l: 'Bélgica', v: 'Senegal', next: 'oct-L4' }
                      ].map((m, idx) => {
                        const winner = bracketWinners[m.id];
                        return (
                          <div key={m.id} className={`bg-slate-900/90 border-2 border-black rounded-2xl shadow-md relative group ${
                            bracketViewMode === 'fit' ? 'p-1.5 space-y-1' : 'p-2.5 space-y-1.5'
                          }`}>
                            <span className="text-[8px] font-mono font-bold text-red-500 block uppercase">LLAVE {idx+1}</span>
                            
                            {/* Team Local (Sticker slot layout: clean white backgrounds for strong contrast) */}
                            <div 
                              className={`flex items-center justify-between px-2 py-1 rounded-xl border-2 transition-all ${
                                bracketViewMode === 'fit' ? 'text-[10px]' : 'text-xs'
                              } ${
                                winner === m.l 
                                  ? 'bg-[#ef4444] border-black text-white font-black' 
                                  : 'bg-white border-black text-black font-extrabold'
                              }`}
                              style={{ minHeight: bracketViewMode === 'fit' ? '32px' : '44px' }}
                            >
                              <div 
                                onClick={() => handleSelectWinner(m.id, m.l, [m.next, 'qf-L' + Math.ceil((idx+1)/4), 'sf-L', 'final'])}
                                className="truncate flex items-center gap-1 cursor-pointer flex-1 py-1"
                              >
                                <span className="text-lg filter drop-shadow">{getFlagByName(m.l)}</span>
                                <span className="uppercase tracking-tight truncate">{m.l}</span>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                <input 
                                  type="text" 
                                  placeholder="0"
                                  value={playoffScores[m.id]?.golesLocal ?? ''}
                                  onClick={(e) => e.stopPropagation()}
                                  onChange={(e) => {
                                    const val = e.target.value === '' ? 0 : Math.max(0, parseInt(e.target.value, 10) || 0);
                                    setPlayoffScores(prev => ({
                                      ...prev,
                                      [m.id]: {
                                        ...prev[m.id],
                                        golesLocal: val,
                                        golesVisitante: prev[m.id]?.golesVisitante ?? 0
                                      }
                                    }));
                                  }}
                                  className={`bg-slate-100 text-black border-2 border-black font-mono text-center rounded outline-none font-bold ${
                                    bracketViewMode === 'fit' ? 'w-7 h-6 text-[10px]' : 'w-8 h-7 text-[11px]'
                                  }`}
                                />
                                {winner === m.l && <CheckCircle className="w-3.5 h-3.5 text-white shrink-0" />}
                              </div>
                            </div>

                            {/* Team Visitante */}
                            <div 
                              className={`flex items-center justify-between px-2 py-1 rounded-xl border-2 transition-all ${
                                bracketViewMode === 'fit' ? 'text-[10px]' : 'text-xs'
                              } ${
                                winner === m.v 
                                  ? 'bg-[#ef4444] border-black text-white font-black' 
                                  : 'bg-white border-black text-black font-extrabold'
                              }`}
                              style={{ minHeight: bracketViewMode === 'fit' ? '32px' : '44px' }}
                            >
                              <div 
                                onClick={() => handleSelectWinner(m.id, m.v, [m.next, 'qf-L' + Math.ceil((idx+1)/4), 'sf-L', 'final'])}
                                className="truncate flex items-center gap-1 cursor-pointer flex-1 py-1"
                              >
                                <span className="text-lg filter drop-shadow">{getFlagByName(m.v)}</span>
                                <span className="uppercase tracking-tight truncate">{m.v}</span>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                <input 
                                  type="text" 
                                  placeholder="0"
                                  value={playoffScores[m.id]?.golesVisitante ?? ''}
                                  onClick={(e) => e.stopPropagation()}
                                  onChange={(e) => {
                                    const val = e.target.value === '' ? 0 : Math.max(0, parseInt(e.target.value, 10) || 0);
                                    setPlayoffScores(prev => ({
                                      ...prev,
                                      [m.id]: {
                                        ...prev[m.id],
                                        golesLocal: prev[m.id]?.golesLocal ?? 0,
                                        golesVisitante: val
                                      }
                                    }));
                                  }}
                                  className={`bg-slate-100 text-black border-2 border-black font-mono text-center rounded outline-none font-bold ${
                                    bracketViewMode === 'fit' ? 'w-7 h-6 text-[10px]' : 'w-8 h-7 text-[11px]'
                                  }`}
                                />
                                {winner === m.v && <CheckCircle className="w-3.5 h-3.5 text-white shrink-0" />}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* COLUMN 2: Left Octavos de Final */}
                    <div className={`col-span-1 ${
                      bracketViewMode === 'fit'
                        ? (bracketActiveTab === 'left' ? 'block space-y-4' : 'hidden')
                        : (bracketActiveTab === 'left' ? 'block space-y-12' : 'hidden lg:block space-y-12')
                    }`}>
                      <div className="text-center bg-black/80 border-2 border-indigo-600 py-1 px-1.5 rounded-lg mb-4">
                        <span className="text-[9px] font-black text-white uppercase font-mono tracking-wider">Octavos Izq</span>
                      </div>

                      {[
                        { id: 'oct-L1', p1_id: 'ko-3', p2_id: 'ko-6', next: 'qf-L1', dkeys: ['qf-L1', 'sf-L', 'final'] },
                        { id: 'oct-L2', p1_id: 'ko-1', p2_id: 'ko-4', next: 'qf-L1', dkeys: ['qf-L1', 'sf-L', 'final'] },
                        { id: 'oct-L3', p1_id: 'ko-11', p2_id: 'ko-12', next: 'qf-L2', dkeys: ['qf-L2', 'sf-L', 'final'] },
                        { id: 'oct-L4', p1_id: 'ko-9', p2_id: 'ko-10', next: 'qf-L2', dkeys: ['qf-L2', 'sf-L', 'final'] }
                      ].map((m, idx) => {
                        const t1 = bracketWinners[m.p1_id] || '';
                        const t2 = bracketWinners[m.p2_id] || '';
                        const winner = bracketWinners[m.id];

                        return (
                          <div key={m.id} className="bg-slate-900/50 border border-slate-800 p-1.5 rounded-xl space-y-1.5 relative">
                            {/* Branch Connector lines */}
                            <div className="absolute left-[-10px] top-1/2 w-2.5 h-[1.5px] bg-red-600/60" />
                            <div className="absolute right-[-10px] top-1/2 w-2.5 h-[1.5px] bg-red-600/60" />

                            <span className="text-[8px] font-mono text-indigo-400 font-bold block uppercase">OCTAVOS L{idx+1}</span>
                            
                            {/* Team A Slot */}
                            <div
                              onClick={() => t1 && handleSelectWinner(m.id, t1, m.dkeys)}
                              className={`flex items-center justify-between p-1.5 rounded-lg border transition-all ${
                                t1 ? 'cursor-pointer hover:bg-slate-850' : 'cursor-not-allowed opacity-35'
                              } ${
                                winner === t1 && t1
                                  ? 'bg-[#ef4444] border-black text-white font-black'
                                  : 'bg-white border-black text-black font-extrabold'
                              }`}
                              style={{ minHeight: bracketViewMode === 'fit' ? '28px' : '34px' }}
                            >
                              <span className="truncate text-[10px]">{t1 ? `${getFlagByName(t1)} ${t1}` : '❓ Ganador'}</span>
                            </div>

                            {/* Team B Slot */}
                            <div
                              onClick={() => t2 && handleSelectWinner(m.id, t2, m.dkeys)}
                              className={`flex items-center justify-between p-1.5 rounded-lg border transition-all ${
                                t2 ? 'cursor-pointer hover:bg-slate-850' : 'cursor-not-allowed opacity-35'
                              } ${
                                winner === t2 && t2
                                  ? 'bg-[#ef4444] border-black text-white font-black'
                                  : 'bg-white border-black text-black font-extrabold'
                              }`}
                              style={{ minHeight: bracketViewMode === 'fit' ? '28px' : '34px' }}
                            >
                              <span className="truncate text-[10px]">{t2 ? `${getFlagByName(t2)} ${t2}` : '❓ Ganador'}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* COLUMN 3: Left Cuartos de Final */}
                    <div className={
                      bracketViewMode === 'fit'
                        ? (bracketActiveTab === 'left' ? 'col-span-1 space-y-8' : 'hidden')
                        : `col-span-1 ${bracketActiveTab === 'left' ? 'block space-y-24' : 'hidden lg:block space-y-24'}`
                    }>
                      <div className="text-center bg-black/80 border-2 border-yellow-500 py-1 px-1.5 rounded-lg mb-4">
                        <span className="text-[9px] font-black text-white uppercase font-mono tracking-wider">Cuartos Izq</span>
                      </div>

                      {[
                        { id: 'qf-L1', p1_id: 'oct-L1', p2_id: 'oct-L2', next: 'sf-L', dkeys: ['sf-L', 'final'] },
                        { id: 'qf-L2', p1_id: 'oct-L3', p2_id: 'oct-L4', next: 'sf-L', dkeys: ['sf-L', 'final'] }
                      ].map((m, idx) => {
                        const t1 = bracketWinners[m.p1_id] || '';
                        const t2 = bracketWinners[m.p2_id] || '';
                        const winner = bracketWinners[m.id];

                        return (
                          <div key={m.id} className="bg-slate-900/50 border border-slate-800 p-1.5 rounded-xl space-y-1.5 relative">
                            <span className="text-[8px] font-mono text-yellow-500 font-bold block uppercase font-mono">CUARTOS L{idx+1}</span>
                            
                            {/* Team A Slot */}
                            <div
                              onClick={() => t1 && handleSelectWinner(m.id, t1, m.dkeys)}
                              className={`flex items-center justify-between p-1.5 rounded-lg border transition-all ${
                                t1 ? 'cursor-pointer' : 'opacity-35'
                              } ${
                                winner === t1 && t1
                                  ? 'bg-[#ef4444] border-black text-white font-black'
                                  : 'bg-white border-black text-black font-extrabold'
                              }`}
                              style={{ minHeight: bracketViewMode === 'fit' ? '28px' : '34px' }}
                            >
                              <span className="truncate text-[10px]">{t1 ? `${getFlagByName(t1)} ${t1}` : '❓ Ganador'}</span>
                            </div>

                            {/* Team B Slot */}
                            <div
                              onClick={() => t2 && handleSelectWinner(m.id, t2, m.dkeys)}
                              className={`flex items-center justify-between p-1.5 rounded-lg border transition-all ${
                                t2 ? 'cursor-pointer' : 'opacity-35'
                              } ${
                                winner === t2 && t2
                                  ? 'bg-[#ef4444] border-black text-white font-black'
                                  : 'bg-white border-black text-black font-extrabold'
                              }`}
                              style={{ minHeight: bracketViewMode === 'fit' ? '28px' : '34px' }}
                            >
                              <span className="truncate text-[10px]">{t2 ? `${getFlagByName(t2)} ${t2}` : '❓ Ganador'}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* COLUMN 4: Left Semifinal */}
                    <div className={
                      bracketViewMode === 'fit'
                        ? (bracketActiveTab === 'left' || bracketActiveTab === 'center' ? 'col-span-1 space-y-4 flex flex-col justify-center' : 'hidden')
                        : `col-span-1 space-y-4 flex flex-col justify-center ${bracketActiveTab === 'left' || bracketActiveTab === 'center' ? 'block' : 'hidden lg:block'}`
                    }>
                      <div className="text-center bg-black/80 border border-emerald-500 py-1 px-1.5 rounded-lg">
                        <span className="text-[9px] font-black text-emerald-400 uppercase font-mono tracking-wider">Semifinal Izq</span>
                      </div>

                      {(() => {
                        const t1 = bracketWinners['qf-L1'] || '';
                        const t2 = bracketWinners['qf-L2'] || '';
                        const winner = bracketWinners['sf-L'];

                        return (
                          <div className="bg-slate-900/50 border border-slate-850 p-1.5 rounded-xl space-y-1.5 relative">
                            {/* Team A */}
                            <div
                              onClick={() => t1 && handleSelectWinner('sf-L', t1, ['final'])}
                              className={`flex items-center justify-between p-1.5 rounded-lg border transition-all ${
                                t1 ? 'cursor-pointer' : 'opacity-35'
                              } ${
                                winner === t1 && t1
                                  ? 'bg-[#ef4444] border-black text-white font-black'
                                  : 'bg-white border-black text-black font-extrabold'
                              }`}
                              style={{ minHeight: bracketViewMode === 'fit' ? '28px' : '36px' }}
                            >
                              <span className="truncate text-[10px]">{t1 ? `${getFlagByName(t1)} ${t1}` : '❓ Semifinalista L1'}</span>
                            </div>

                            {/* Team B */}
                            <div
                              onClick={() => t2 && handleSelectWinner('sf-L', t2, ['final'])}
                              className={`flex items-center justify-between p-1.5 rounded-lg border transition-all ${
                                t2 ? 'cursor-pointer' : 'opacity-35'
                              } ${
                                winner === t2 && t2
                                  ? 'bg-[#ef4444] border-black text-white font-black'
                                  : 'bg-white border-black text-black font-extrabold'
                              }`}
                              style={{ minHeight: bracketViewMode === 'fit' ? '28px' : '36px' }}
                            >
                              <span className="truncate text-[10px]">{t2 ? `${getFlagByName(t2)} ${t2}` : '❓ Semifinalista L2'}</span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* CENTER STAGE (Columns 5, 6, 7): Glowing drone-light cup, skyline backdrop, and final cards */}
                    <div className={
                      bracketViewMode === 'fit'
                        ? (bracketActiveTab === 'center'
                            ? 'col-span-3 flex flex-col items-center justify-center space-y-4 text-center px-1.5 py-3 border-2 border-dashed border-red-600/25 rounded-3xl bg-black/40 min-h-[380px] relative'
                            : (bracketActiveTab === 'left' || bracketActiveTab === 'right' ? 'col-span-1 flex flex-col items-center justify-center space-y-3 text-center px-1.5 py-3 border border-slate-800 rounded-2xl bg-black/20 relative' : 'hidden')
                          )
                        : `col-span-3 flex flex-col items-center justify-center space-y-8 text-center px-2 py-4 border-2 border-dashed border-red-600/25 rounded-3xl bg-black/40 min-h-[480px] relative ${bracketActiveTab === 'center' ? 'block' : 'hidden lg:block'}`
                    }>
                      
                      {/* Glorious Glowing Drone Soccer Trophy Illustration */}
                      {!(bracketViewMode === 'fit' && bracketActiveTab !== 'center') && (
                        <div className="relative w-full flex flex-col items-center justify-center my-1 select-none pointer-events-none">
                          
                          {/* Glowing drone circle lights */}
                          <div className="w-24 h-24 rounded-full border-4 border-red-600/40 bg-red-600/20 absolute blur-md animate-pulse" />
                          
                          {/* Inner Trophy structure built out of high-fidelity vector lights */}
                          <div className="relative z-10 flex flex-col items-center">
                            <Trophy className="w-14 h-14 text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.8)] animate-bounce duration-3000" />
                            
                            {/* Symmetrical dot circles simulating drone performance */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-dotted border-red-500/30 rounded-full animate-spin duration-10000" />
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 border border-dashed border-emerald-500/20 rounded-full animate-spin duration-15000" />
                          </div>

                          {/* Sparkles / Drone star dots */}
                          <span className="absolute top-0 left-1/4 w-1 h-1 bg-red-400 rounded-full animate-ping" />
                          <span className="absolute top-1/3 right-1/4 w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping duration-2000" />
                          <span className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-yellow-400 rounded-full animate-ping duration-1500" />
                          <span className="absolute top-2/3 right-1/3 w-1.5 h-1.5 bg-red-400 rounded-full animate-ping duration-3000" />
                          
                          <div className="text-center mt-3 z-10">
                            <span className="text-[9px] bg-red-600/20 border border-red-500/30 text-red-400 px-3 py-0.5 rounded-full font-mono font-black uppercase tracking-widest inline-block scale-95">
                              DRONE LIGHT SHOW LIVE
                            </span>
                          </div>
                        </div>
                      )}

                      {/* GRAN FINAL CARD (The central clash) */}
                      <div className={`w-full bg-slate-900 border-4 border-black rounded-3xl shadow-[4px_4px_0px_#000] relative overflow-hidden ${
                        bracketViewMode === 'fit' && bracketActiveTab !== 'center' ? 'p-2 max-w-full' : 'p-4 max-w-[280px]'
                      }`}>
                        {/* Banner header */}
                        <div className="absolute top-0 left-0 right-0 bg-[#e11d48] text-white font-black text-[9px] font-mono uppercase tracking-widest py-1 border-b-2 border-black text-center">
                          {bracketViewMode === 'fit' && bracketActiveTab !== 'center' ? '⚡ FINAL ⚡' : '⚡ GRAN FINAL DE HÉROES ⚡'}
                        </div>
                        
                        <div className={`space-y-2 text-left ${
                          bracketViewMode === 'fit' && bracketActiveTab !== 'center' ? 'mt-3' : 'mt-4'
                        }`}>
                          {(() => {
                            const leftFinalist = bracketWinners['sf-L'] || '';
                            const rightFinalist = bracketWinners['sf-R'] || '';
                            const champion = bracketWinners['final'];

                            return (
                              <div className="space-y-1">
                                {/* Left finalist block */}
                                <div
                                  onClick={() => leftFinalist && handleSelectWinner('final', leftFinalist, [])}
                                  className={`flex items-center justify-between px-2 py-1 rounded-xl border-2 transition-all ${
                                    leftFinalist ? 'cursor-pointer hover:scale-102' : 'opacity-40'
                                  } ${
                                    champion === leftFinalist && leftFinalist
                                      ? 'bg-[#10b981] border-black text-white font-black'
                                      : 'bg-white border-black text-black font-extrabold'
                                  }`}
                                  style={{ minHeight: bracketViewMode === 'fit' && bracketActiveTab !== 'center' ? '28px' : '44px' }}
                                >
                                  <span className="truncate flex items-center gap-1.5">
                                    <span className="text-lg filter drop-shadow">{getFlagByName(leftFinalist)}</span>
                                    <span className="uppercase text-[10px] truncate">{leftFinalist || 'Ganador Izq.'}</span>
                                  </span>
                                  {champion === leftFinalist && leftFinalist && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                                </div>

                                {/* VS decorative bubble */}
                                <div className="text-center font-black text-gray-500 font-mono text-[9px] uppercase py-0.5 flex items-center justify-center gap-1">
                                  <span>VS</span>
                                </div>

                                {/* Right finalist block */}
                                <div
                                  onClick={() => rightFinalist && handleSelectWinner('final', rightFinalist, [])}
                                  className={`flex items-center justify-between px-2 py-1 rounded-xl border-2 transition-all ${
                                    rightFinalist ? 'cursor-pointer hover:scale-102' : 'opacity-40'
                                  } ${
                                    champion === rightFinalist && rightFinalist
                                      ? 'bg-[#10b981] border-black text-white font-black'
                                      : 'bg-white border-black text-black font-extrabold'
                                  }`}
                                  style={{ minHeight: bracketViewMode === 'fit' && bracketActiveTab !== 'center' ? '28px' : '44px' }}
                                >
                                  <span className="truncate flex items-center gap-1.5">
                                    <span className="text-lg filter drop-shadow">{getFlagByName(rightFinalist)}</span>
                                    <span className="uppercase text-[10px] truncate">{rightFinalist || 'Ganador Der.'}</span>
                                  </span>
                                  {champion === rightFinalist && rightFinalist && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      </div>

                      {/* CHAMPION CORONATION BOARD */}
                      {(() => {
                        const champion = bracketWinners['final'];
                        return (
                          <div className={`bg-gradient-to-br from-[#1c2e21] to-[#0a120d] border-4 border-black rounded-3xl text-center shadow-[4px_4px_0px_#000] relative shrink-0 ${
                            bracketViewMode === 'fit' && bracketActiveTab !== 'center' ? 'p-2 w-full max-w-full' : 'p-5 w-full max-w-[240px]'
                          }`}>
                            {/* Inner comic tag */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-600 text-white font-black font-mono text-[9px] px-2 py-0.5 rounded-md border-2 border-black uppercase tracking-wider skew-x-[-6deg] whitespace-nowrap">
                              👑 {bracketViewMode === 'fit' && bracketActiveTab !== 'center' ? 'CAMPEÓN' : 'CAMPEÓN SUPREMO'} 👑
                            </div>

                            {!(bracketViewMode === 'fit' && bracketActiveTab !== 'center') && (
                              <div className="flex justify-center my-2">
                                <Star className={`w-12 h-12 text-yellow-400 filter drop-shadow-[0_0_8px_rgba(250,204,21,0.5)] ${champion ? 'animate-bounce' : 'opacity-20'}`} />
                              </div>
                            )}

                            {champion ? (
                              <div className="space-y-1">
                                <span className={`block animate-pulse ${bracketViewMode === 'fit' && bracketActiveTab !== 'center' ? 'text-2xl mt-1' : 'text-4xl'}`}>{getFlagByName(champion)}</span>
                                <h4 className="text-xs font-black text-white uppercase font-sans tracking-wide">
                                  {champion}
                                </h4>
                              </div>
                            ) : (
                              <span className="text-[9px] text-slate-400 italic font-mono uppercase font-bold block leading-relaxed py-1">
                                {bracketViewMode === 'fit' && bracketActiveTab !== 'center' ? 'Sin coronar' : 'Selecciona ganadores para coronar al monarca'}
                              </span>
                            )}
                          </div>
                        );
                      })()}
                    </div>

                    {/* COLUMN 8: Right Semifinal */}
                    <div className={
                      bracketViewMode === 'fit'
                        ? (bracketActiveTab === 'right' || bracketActiveTab === 'center' ? 'col-span-1 space-y-4 flex flex-col justify-center' : 'hidden')
                        : `col-span-1 space-y-4 flex flex-col justify-center ${bracketActiveTab === 'right' || bracketActiveTab === 'center' ? 'block' : 'hidden lg:block'}`
                    }>
                      <div className="text-center bg-black/80 border border-emerald-500 py-1 px-1.5 rounded-lg">
                        <span className="text-[9px] font-black text-emerald-400 uppercase font-mono tracking-wider">Semifinal Der</span>
                      </div>

                      {(() => {
                        const t1 = bracketWinners['qf-R1'] || '';
                        const t2 = bracketWinners['qf-R2'] || '';
                        const winner = bracketWinners['sf-R'];

                        return (
                          <div className="bg-slate-900/50 border border-slate-850 p-1.5 rounded-xl space-y-1.5 relative">
                            {/* Team A */}
                            <div
                              onClick={() => t1 && handleSelectWinner('sf-R', t1, ['final'])}
                              className={`flex items-center justify-between p-1.5 rounded-lg border transition-all ${
                                t1 ? 'cursor-pointer' : 'opacity-35'
                              } ${
                                winner === t1 && t1
                                  ? 'bg-[#ef4444] border-black text-white font-black'
                                  : 'bg-white border-black text-black font-extrabold'
                              }`}
                              style={{ minHeight: bracketViewMode === 'fit' ? '28px' : '36px' }}
                            >
                              <span className="truncate text-[10px]">{t1 ? `${getFlagByName(t1)} ${t1}` : '❓ Semifinalista R1'}</span>
                            </div>

                            {/* Team B */}
                            <div
                              onClick={() => t2 && handleSelectWinner('sf-R', t2, ['final'])}
                              className={`flex items-center justify-between p-1.5 rounded-lg border transition-all ${
                                t2 ? 'cursor-pointer' : 'opacity-35'
                              } ${
                                winner === t2 && t2
                                  ? 'bg-[#ef4444] border-black text-white font-black'
                                  : 'bg-white border-black text-black font-extrabold'
                              }`}
                              style={{ minHeight: bracketViewMode === 'fit' ? '28px' : '36px' }}
                            >
                              <span className="truncate text-[10px]">{t2 ? `${getFlagByName(t2)} ${t2}` : '❓ Semifinalista R2'}</span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* COLUMN 9: Right Cuartos de Final */}
                    <div className={
                      bracketViewMode === 'fit'
                        ? (bracketActiveTab === 'right' ? 'col-span-1 space-y-8' : 'hidden')
                        : `col-span-1 ${bracketActiveTab === 'right' ? 'block space-y-24' : 'hidden lg:block space-y-24'}`
                    }>
                      <div className="text-center bg-black/80 border-2 border-yellow-500 py-1 px-1.5 rounded-lg mb-4">
                        <span className="text-[9px] font-black text-white uppercase font-mono tracking-wider">Cuartos Der</span>
                      </div>

                      {[
                        { id: 'qf-R1', p1_id: 'oct-R1', p2_id: 'oct-R2', next: 'sf-R', dkeys: ['sf-R', 'final'] },
                        { id: 'qf-R2', p1_id: 'oct-R3', p2_id: 'oct-R4', next: 'sf-R', dkeys: ['sf-R', 'final'] }
                      ].map((m, idx) => {
                        const t1 = bracketWinners[m.p1_id] || '';
                        const t2 = bracketWinners[m.p2_id] || '';
                        const winner = bracketWinners[m.id];

                        return (
                          <div key={m.id} className="bg-slate-900/50 border border-slate-800 p-1.5 rounded-xl space-y-1.5 relative">
                            <span className="text-[8px] font-mono text-yellow-500 font-bold block uppercase font-mono">CUARTOS R{idx+1}</span>
                            
                            {/* Team A Slot */}
                            <div
                              onClick={() => t1 && handleSelectWinner(m.id, t1, m.dkeys)}
                              className={`flex items-center justify-between p-1.5 rounded-lg border transition-all ${
                                t1 ? 'cursor-pointer' : 'opacity-35'
                              } ${
                                winner === t1 && t1
                                  ? 'bg-[#ef4444] border-black text-white font-black'
                                  : 'bg-white border-black text-black font-extrabold'
                              }`}
                              style={{ minHeight: bracketViewMode === 'fit' ? '28px' : '34px' }}
                            >
                              <span className="truncate text-[10px]">{t1 ? `${getFlagByName(t1)} ${t1}` : '❓ Ganador'}</span>
                            </div>

                            {/* Team B Slot */}
                            <div
                              onClick={() => t2 && handleSelectWinner(m.id, t2, m.dkeys)}
                              className={`flex items-center justify-between p-1.5 rounded-lg border transition-all ${
                                t2 ? 'cursor-pointer' : 'opacity-35'
                              } ${
                                winner === t2 && t2
                                  ? 'bg-[#ef4444] border-black text-white font-black'
                                  : 'bg-white border-black text-black font-extrabold'
                              }`}
                              style={{ minHeight: bracketViewMode === 'fit' ? '28px' : '34px' }}
                            >
                              <span className="truncate text-[10px]">{t2 ? `${getFlagByName(t2)} ${t2}` : '❓ Ganador'}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* COLUMN 10: Right Octavos de Final */}
                    <div className={`col-span-1 ${
                      bracketViewMode === 'fit'
                        ? (bracketActiveTab === 'right' ? 'block space-y-4' : 'hidden')
                        : (bracketActiveTab === 'right' ? 'block space-y-12' : 'hidden lg:block space-y-12')
                    }`}>
                      <div className="text-center bg-black/80 border-2 border-indigo-600 py-1 px-1.5 rounded-lg mb-4">
                        <span className="text-[9px] font-black text-white uppercase font-mono tracking-wider">Octavos Der</span>
                      </div>

                      {[
                        { id: 'oct-R1', p1_id: 'ko-2', p2_id: 'ko-5', next: 'qf-R1', dkeys: ['qf-R1', 'sf-R', 'final'] },
                        { id: 'oct-R2', p1_id: 'ko-7', p2_id: 'ko-8', next: 'qf-R1', dkeys: ['qf-R1', 'sf-R', 'final'] },
                        { id: 'oct-R3', p1_id: 'ko-14', p2_id: 'ko-16', next: 'qf-R2', dkeys: ['qf-R2', 'sf-R', 'final'] },
                        { id: 'oct-R4', p1_id: 'ko-13', p2_id: 'ko-15', next: 'qf-R2', dkeys: ['qf-R2', 'sf-R', 'final'] }
                      ].map((m, idx) => {
                        const t1 = bracketWinners[m.p1_id] || '';
                        const t2 = bracketWinners[m.p2_id] || '';
                        const winner = bracketWinners[m.id];

                        return (
                          <div key={m.id} className="bg-slate-900/50 border border-slate-800 p-1.5 rounded-xl space-y-1.5 relative">
                            <span className="text-[8px] font-mono text-indigo-400 font-bold block uppercase">OCTAVOS R{idx+1}</span>
                            
                            {/* Team A Slot */}
                            <div
                              onClick={() => t1 && handleSelectWinner(m.id, t1, m.dkeys)}
                              className={`flex items-center justify-between p-1.5 rounded-lg border transition-all ${
                                t1 ? 'cursor-pointer' : 'opacity-35'
                              } ${
                                winner === t1 && t1
                                  ? 'bg-[#ef4444] border-black text-white font-black'
                                  : 'bg-white border-black text-black font-extrabold'
                              }`}
                              style={{ minHeight: bracketViewMode === 'fit' ? '28px' : '34px' }}
                            >
                              <span className="truncate text-[10px]">{t1 ? `${getFlagByName(t1)} ${t1}` : '❓ Ganador'}</span>
                            </div>

                            {/* Team B Slot */}
                            <div
                              onClick={() => t2 && handleSelectWinner(m.id, t2, m.dkeys)}
                              className={`flex items-center justify-between p-1.5 rounded-lg border transition-all ${
                                t2 ? 'cursor-pointer' : 'opacity-35'
                              } ${
                                winner === t2 && t2
                                  ? 'bg-[#ef4444] border-black text-white font-black'
                                  : 'bg-white border-black text-black font-extrabold'
                              }`}
                              style={{ minHeight: bracketViewMode === 'fit' ? '28px' : '34px' }}
                            >
                              <span className="truncate text-[10px]">{t2 ? `${getFlagByName(t2)} ${t2}` : '❓ Ganador'}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* COLUMN 11: Right Round of 32 (Dieciseisavos) */}
                    <div className={
                      bracketViewMode === 'fit'
                        ? (bracketActiveTab === 'right' ? 'col-span-1 space-y-2' : 'hidden')
                        : `col-span-2 space-y-4 ${bracketActiveTab === 'right' ? 'block' : 'hidden lg:block'}`
                    }>
                      <div className="text-center bg-black/80 border-2 border-red-600 py-1 px-1.5 rounded-lg mb-2">
                        <span className="text-[9px] font-black text-white uppercase font-mono tracking-wider">Dieciseisavos Der</span>
                      </div>
                      
                      {[
                        { id: 'ko-2', l: 'Brasil', v: 'Japón', next: 'oct-R1' },
                        { id: 'ko-5', l: 'Costa de Marfil', v: 'Noruega', next: 'oct-R1' },
                        { id: 'ko-7', l: 'México', v: 'Ecuador', next: 'oct-R2' },
                        { id: 'ko-8', l: 'Inglaterra', v: 'RD Congo', next: 'oct-R2' },
                        { id: 'ko-14', l: 'Argentina', v: 'Cabo Verde', next: 'oct-R3' },
                        { id: 'ko-16', l: 'Australia', v: 'Egipto', next: 'oct-R3' },
                        { id: 'ko-13', l: 'Suiza', v: 'Argelia', next: 'oct-R4' },
                        { id: 'ko-15', l: 'Colombia', v: 'Ghana', next: 'oct-R4' }
                      ].map((m, idx) => {
                        const winner = bracketWinners[m.id];
                        return (
                          <div key={m.id} className={`bg-slate-900/90 border-2 border-black rounded-2xl shadow-md relative group ${
                            bracketViewMode === 'fit' ? 'p-1.5 space-y-1' : 'p-2.5 space-y-1.5'
                          }`}>
                            <span className="text-[8px] font-mono font-bold text-red-500 block uppercase font-mono">LLAVE {idx+9}</span>
                            
                            {/* Team Local */}
                            <div 
                              className={`flex items-center justify-between rounded-xl border-2 transition-all ${
                                winner === m.l 
                                  ? 'bg-[#ef4444] border-black text-white font-black' 
                                  : 'bg-white border-black text-black font-extrabold'
                              } ${
                                bracketViewMode === 'fit' ? 'p-1' : 'p-2'
                              }`}
                              style={{ minHeight: bracketViewMode === 'fit' ? '28px' : '44px' }}
                            >
                              <div 
                                onClick={() => handleSelectWinner(m.id, m.l, [m.next, 'qf-R' + Math.ceil((idx+1)/4), 'sf-R', 'final'])}
                                className="truncate flex items-center gap-1 cursor-pointer flex-1 py-0.5"
                              >
                                <span className="text-lg filter drop-shadow">{getFlagByName(m.l)}</span>
                                <span className="uppercase tracking-tight text-[10px] truncate">{m.l}</span>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                <input 
                                  type="text" 
                                  placeholder="0"
                                  value={playoffScores[m.id]?.golesLocal ?? ''}
                                  onClick={(e) => e.stopPropagation()}
                                  onChange={(e) => {
                                    const val = e.target.value === '' ? 0 : Math.max(0, parseInt(e.target.value, 10) || 0);
                                    setPlayoffScores(prev => ({
                                      ...prev,
                                      [m.id]: {
                                        ...prev[m.id],
                                        golesLocal: val,
                                        golesVisitante: prev[m.id]?.golesVisitante ?? 0
                                      }
                                    }));
                                  }}
                                  className="w-7 h-6 bg-slate-100 text-black border border-black font-mono text-[10px] text-center rounded outline-none font-bold"
                                />
                                {winner === m.l && <CheckCircle className="w-3.5 h-3.5 text-white shrink-0" />}
                              </div>
                            </div>
 
                            {/* Team Visitante */}
                            <div 
                              className={`flex items-center justify-between rounded-xl border-2 transition-all ${
                                winner === m.v 
                                  ? 'bg-[#ef4444] border-black text-white font-black' 
                                  : 'bg-white border-black text-black font-extrabold'
                              } ${
                                bracketViewMode === 'fit' ? 'p-1' : 'p-2'
                              }`}
                              style={{ minHeight: bracketViewMode === 'fit' ? '28px' : '44px' }}
                            >
                              <div 
                                onClick={() => handleSelectWinner(m.id, m.v, [m.next, 'qf-R' + Math.ceil((idx+1)/4), 'sf-R', 'final'])}
                                className="truncate flex items-center gap-1 cursor-pointer flex-1 py-0.5"
                              >
                                <span className="text-lg filter drop-shadow">{getFlagByName(m.v)}</span>
                                <span className="uppercase tracking-tight text-[10px] truncate">{m.v}</span>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                <input 
                                  type="text" 
                                  placeholder="0"
                                  value={playoffScores[m.id]?.golesVisitante ?? ''}
                                  onClick={(e) => e.stopPropagation()}
                                  onChange={(e) => {
                                    const val = e.target.value === '' ? 0 : Math.max(0, parseInt(e.target.value, 10) || 0);
                                    setPlayoffScores(prev => ({
                                      ...prev,
                                      [m.id]: {
                                        ...prev[m.id],
                                        golesLocal: prev[m.id]?.golesLocal ?? 0,
                                        golesVisitante: val
                                      }
                                    }));
                                  }}
                                  className="w-7 h-6 bg-slate-100 text-black border border-black font-mono text-[10px] text-center rounded outline-none font-bold"
                                />
                                {winner === m.v && <CheckCircle className="w-3.5 h-3.5 text-white shrink-0" />}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                  </div>
                </div>

                {/* Symmetrical Footnote Legend info & Save prediction container */}
                <div className="mt-4 pt-4 border-t border-slate-800 text-center text-xs text-slate-400 font-mono flex flex-col items-center gap-6">
                  <span>💡 Simulación en tiempo real: Haz click sobre cualquiera de las selecciones en blanco (sticker slots) para avanzarla a la siguiente fase de <strong>Héroes del Deporte</strong>. Puedes ingresar los marcadores directamente.</span>
                  
                  {/* SAVE PLAYOFFS ACTION SECTION */}
                  <div className="w-full max-w-2xl flex flex-col sm:flex-row items-center justify-between bg-[#07100a] border-2 border-emerald-500 p-5 rounded-2xl gap-4 shadow-lg text-left relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(rgba(16,185,129,0.06)_1px,transparent_1px)] [background-size:10px_10px] pointer-events-none" />
                    <div className="relative z-10 flex-1">
                      <h4 className="text-sm font-black text-white uppercase tracking-tight font-sans flex items-center gap-2">
                        <span>💾 REGISTRAR PRONÓSTICOS DE PLAYOFFS</span>
                        {saveStatus === 'success' && <span className="bg-emerald-600/25 border border-emerald-500 text-emerald-400 text-[9px] font-mono px-2 py-0.5 rounded-full animate-bounce">GUARDADO</span>}
                        {saveStatus === 'error' && <span className="bg-red-600/25 border border-red-500 text-red-400 text-[9px] font-mono px-2 py-0.5 rounded-full">ERROR</span>}
                      </h4>
                      <p className="text-[11px] text-gray-400 mt-1 font-mono">
                        Guarda tus llaves ganadoras y pronósticos de marcadores en el servidor de <strong>Héroes del Deporte</strong>.
                      </p>
                    </div>
                    <button
                      onClick={handleSavePlayoffsToDb}
                      disabled={isSaving}
                      className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-sans text-xs font-black px-5 py-3 rounded-xl border-2 border-black uppercase tracking-widest cursor-pointer shadow-[3px_3px_0px_#000] hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_#000] active:translate-y-[1px] active:shadow-[1px_1px_0px_#000] transition-all flex items-center gap-2 relative z-10 shrink-0"
                    >
                      {isSaving ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Zap className="w-4 h-4 text-yellow-300 fill-yellow-300" />
                      )}
                      {isSaving ? 'GUARDANDO...' : 'GUARDAR PRONÓSTICOS'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : subTab === 'groups' ? (
        // GROUPS VIEW
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {groupsList.map((gName) => {
            const countries = getCountriesInGroup(gName);
            
            // Calculate total unlocked in this group to display status
            const totalUnlockedInGroup = countries.reduce((acc, c) => acc + getUnlockedCount(c.name), 0);
            const totalPlayersInGroup = countries.length * 26;
            const progressPct = Math.round((totalUnlockedInGroup / totalPlayersInGroup) * 100);

            return (
              <div 
                key={gName} 
                className="bg-slate-900 border border-slate-850 hover:border-slate-800 rounded-3xl p-5 shadow-lg flex flex-col justify-between transition-all group duration-200"
              >
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="text-sm font-extrabold text-white uppercase tracking-wider font-mono">{gName}</h3>
                    <span className="text-[10px] font-semibold font-mono text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-lg">
                      {progressPct}% Desbloqueado
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden mb-4">
                    <div 
                      className="bg-indigo-500 h-full rounded-full transition-all duration-550"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>

                  <div className="space-y-3">
                    {countries.map((c) => {
                      const unlockedCount = getUnlockedCount(c.name);
                      const isCompleted = unlockedCount === 26;
                      const hasBoard = !!userBoards[c.name];

                      return (
                        <div 
                          key={c.code}
                          onClick={() => handleCountryClick(c.name)}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-900 hover:border-slate-800 hover:bg-slate-900 transition-all cursor-pointer group/item"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xl shrink-0 filter drop-shadow-md select-none">{c.flag}</span>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <h4 className="text-xs font-bold text-white group-hover/item:text-indigo-400 transition-colors">
                                  {c.name}
                                </h4>
                                {isCompleted && (
                                  <Unlock className="w-3 h-3 text-emerald-400" />
                                )}
                              </div>
                              <p className="text-[10px] text-gray-500 font-mono">
                                {unlockedCount}/26 Cromos Desbloqueados
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {hasBoard ? (
                              <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 uppercase font-mono">
                                Táctica OK
                              </span>
                            ) : isCompleted ? (
                              <span className="text-[9px] font-bold text-yellow-400 bg-yellow-500/10 px-1.5 py-0.5 rounded border border-yellow-500/20 uppercase font-mono">
                                Pendiente D.T.
                              </span>
                            ) : null}
                            <ChevronRight className="w-3.5 h-3.5 text-gray-600 group-hover/item:text-indigo-400 transition-transform group-hover/item:translate-x-0.5" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="border-t border-slate-850 pt-3 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[10px] text-gray-550">
                    <Info className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Selecciona país para ver trivia</span>
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 group-hover:text-indigo-400 transition-colors uppercase font-mono flex items-center gap-0.5">
                    Ir al Álbum <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // FIXTURES VIEW WITH FILTERS
        <div className="space-y-6">
          {/* Calendar Search, Filter Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-900 border border-slate-850 p-4 rounded-2xl">
            {/* Group selector */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider font-mono">Filtrar por Grupo</label>
              <div className="relative">
                <select
                  value={groupFilter}
                  onChange={(e) => setGroupFilter(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 text-slate-350 text-xs rounded-xl px-3 py-2.5 cursor-pointer outline-none focus:border-indigo-500 transition-colors appearance-none"
                >
                  <option className="bg-[#0f172a] text-white" value="all">🏆 Todos los Grupos</option>
                  {groupsList.map(g => (
                    <option className="bg-[#0f172a] text-white" key={g} value={g}>{g}</option>
                  ))}
                </select>
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none text-[10px]">▼</span>
              </div>
            </div>

            {/* Keyword Search */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider font-mono">Buscar por Selección</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Ej: México, Argentina, Brasil..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 text-slate-300 text-xs rounded-xl pl-9 pr-4 py-2.5 placeholder-slate-600 outline-none focus:border-indigo-500 transition-colors"
                />
                <Search className="w-3.5 h-3.5 text-gray-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Reset Filter Button */}
            <div className="flex items-end">
              <button
                onClick={() => {
                  setGroupFilter('all');
                  setSearchQuery('');
                }}
                disabled={groupFilter === 'all' && searchQuery === ''}
                className={`w-full py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 border transition cursor-pointer ${
                  groupFilter === 'all' && searchQuery === ''
                    ? 'border-slate-855 text-slate-600 bg-slate-900/40 cursor-not-allowed'
                    : 'border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/5 hover:border-indigo-500/40'
                }`}
              >
                Limpiar Filtros
              </button>
            </div>
          </div>

          {/* Match Fixture Cards list */}
          {filteredMatches.length === 0 ? (
            <div className="text-center py-16 bg-slate-900 border border-slate-850 rounded-3xl">
              <Search className="w-10 h-10 text-slate-700 mx-auto mb-3" />
              <p className="text-slate-400 text-sm font-semibold">No se encontraron partidos con los filtros aplicados</p>
              <p className="text-slate-600 text-xs mt-1">Prueba seleccionando "Todos los Grupos" o borrando tu término de búsqueda.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredMatches.map((m) => {
                const localCountry = COUNTRIES.find(c => c.name === m.local);
                const visiteCountry = COUNTRIES.find(c => c.name === m.visitante);

                const localUnlocked = getUnlockedCount(m.local);
                const visiteUnlocked = getUnlockedCount(m.visitante);

                const isLocalComplete = localUnlocked === 26;
                const isVisiteComplete = visiteUnlocked === 26;

                // Check predictions saved for local or visitante
                const localBoard = userBoards[m.local];
                const visiteBoard = userBoards[m.visitante];
                
                // Active prediction
                const prediction = localBoard?.prediction || visiteBoard?.prediction;
                const hasPrediction = !!prediction;

                return (
                  <div 
                    key={m.id}
                    className="bg-slate-900 border border-slate-850 hover:border-slate-800 rounded-3xl p-4 shadow-md flex flex-col justify-between transition"
                  >
                    {/* Header info */}
                    <div className="flex justify-between items-center border-b border-slate-850 pb-2.5 mb-3.5">
                      <span className="text-[10px] font-bold font-mono text-indigo-400 uppercase tracking-wider">{m.grupo}</span>
                      <div className="flex items-center gap-1.5 text-gray-500 font-mono text-[10px]">
                        <Calendar className="w-3 h-3 text-gray-650" />
                        <span>{m.fecha}</span>
                      </div>
                    </div>

                    {/* Match Score Display */}
                    <div className="grid grid-cols-3 items-center text-center my-1.5">
                      {/* Local team */}
                      <div 
                        onClick={() => handleCountryClick(m.local)}
                        className="flex flex-col items-center gap-1.5 cursor-pointer group/local"
                      >
                        <span className="text-3xl select-none filter drop-shadow">{localCountry?.flag || '🎌'}</span>
                        <span className="text-xs font-bold text-white group-hover/local:text-indigo-400 transition-colors uppercase tracking-tight">{m.local}</span>
                        <span className={`text-[9px] font-mono ${isLocalComplete ? 'text-emerald-400' : 'text-gray-550'}`}>
                          {localUnlocked}/26 Cromos
                        </span>
                      </div>

                      {/* Versus / Score box */}
                      <div className="flex flex-col items-center justify-center">
                        {m.jugado && m.marcadorReal ? (
                          <div className="space-y-1">
                            <span className="text-[10px] uppercase font-bold text-gray-500 font-mono block">FINAL REAL</span>
                            <div className="bg-slate-950 font-mono text-base font-extrabold text-indigo-400 border border-slate-850 px-3 py-1.5 rounded-xl inline-block shadow-inner">
                              {m.marcadorReal.golesLocal} - {m.marcadorReal.golesVisitante}
                            </div>
                          </div>
                        ) : (
                          <div className="bg-slate-950 font-mono text-xs font-semibold text-gray-500 border border-slate-855 px-2.5 py-1 rounded-lg uppercase tracking-wider">
                            VS
                          </div>
                        )}
                      </div>

                      {/* Visitante team */}
                      <div 
                        onClick={() => handleCountryClick(m.visitante)}
                        className="flex flex-col items-center gap-1.5 cursor-pointer group/visit"
                      >
                        <span className="text-3xl select-none filter drop-shadow">{visiteCountry?.flag || '🎌'}</span>
                        <span className="text-xs font-bold text-white group-hover/visit:text-indigo-400 transition-colors uppercase tracking-tight">{m.visitante}</span>
                        <span className={`text-[9px] font-mono ${isVisiteComplete ? 'text-emerald-400' : 'text-gray-550'}`}>
                          {visiteUnlocked}/26 Cromos
                        </span>
                      </div>
                    </div>

                    {/* Prediction status and dynamic buttons */}
                    <div className="mt-4 pt-3 border-t border-slate-850/60 flex flex-col gap-2.5">
                      
                      {/* Show user's prediction if exists */}
                      {hasPrediction ? (
                        <div className="flex items-center justify-between bg-slate-950/65 px-3 py-2 rounded-xl border border-slate-850">
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wide flex items-center gap-1.5">
                            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                            Tu Pronóstico:
                          </span>
                          <span className="text-xs text-emerald-400 font-extrabold font-mono">
                            {prediction.golesLocal} - {prediction.golesVisitante}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between text-[11px] text-gray-550 italic bg-slate-950/20 px-3 py-1.5 rounded-lg">
                          <span>Sin pronóstico cargado aún</span>
                        </div>
                      )}

                      {/* Direct Navigation Button */}
                      {(isLocalComplete || isVisiteComplete) ? (
                        <button
                          onClick={() => {
                            // Pick the country that is complete to edit tactical board
                            const targetCountryName = isLocalComplete ? m.local : m.visitante;
                            onSelectCountry(targetCountryName);
                            setActiveTab('board');
                          }}
                          className="w-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:text-white hover:bg-indigo-600 hover:border-indigo-600 transition text-[11px] font-bold py-2 rounded-xl uppercase font-mono flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Award className="w-3.5 h-3.5 text-yellow-400" />
                          <span>Pizarra D.T. de {isLocalComplete ? m.local : m.visitante}</span>
                        </button>
                      ) : (
                        <div className="text-[10px] text-gray-550 flex items-center justify-center gap-1 font-mono">
                          <Lock className="w-3 h-3 text-slate-700" />
                          <span>Completa 26 cromos para desbloquear Pizarra de D.T.</span>
                        </div>
                      )}

                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* COMIC BLAST SUCCESS CONFIRMATION MODAL */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div 
            className="bg-slate-900 border-4 border-black text-white rounded-3xl w-full max-w-md shadow-[8px_8px_0px_#000] overflow-hidden relative animate-[scaleIn_0.2s_ease-out]"
            id="success-playoffs-modal"
          >
            {/* Comic panel banner decoration */}
            <div className="bg-emerald-600 border-b-4 border-black p-6 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(rgba(0,0,0,0.15)_1.5px,transparent_1.5px)] [background-size:12px_12px] pointer-events-none" />
              <div className="w-16 h-16 bg-yellow-400 border-3 border-black rounded-full flex items-center justify-center mx-auto mb-3 shadow-[3px_3px_0px_#000] animate-bounce">
                <Trophy className="w-9 h-9 text-black fill-black" />
              </div>
              <h3 className="font-bangers text-3xl tracking-wider text-white uppercase drop-shadow-[2px_2px_0px_#000]">
                ¡PRONÓSTICOS SALVADOS!
              </h3>
              <p className="text-[10px] font-mono text-emerald-100 uppercase tracking-widest font-bold mt-1">
                ⚙️ REGISTRO DE PLAYOFFS ACTUALIZADO
              </p>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div className="bg-slate-950/80 border-2 border-black p-4 rounded-2xl space-y-2.5 shadow-[4px_4px_0px_#000]">
                <div className="flex items-center gap-2 border-b border-slate-900 pb-2">
                  <span className="text-xl">📋</span>
                  <span className="text-xs font-mono font-black text-emerald-400 uppercase tracking-wider">Certificado de Transparencia</span>
                </div>
                <p className="text-xs font-comic text-slate-300 leading-relaxed">
                  Estimado Director Técnico, tus llaves simuladas y pronósticos de marcadores para la fase de playoffs (Dieciseisavos de final a la Gran Final) han sido <strong>sincronizados con éxito en la base de datos central</strong>.
                </p>
                <p className="text-xs font-comic text-slate-300 leading-relaxed">
                  Tus datos ahora son completamente <strong>audibles en tiempo real</strong> desde tu perfil en la consola del administrador.
                </p>
              </div>

              <div className="text-[10px] text-slate-500 font-mono text-center flex items-center justify-center gap-2">
                <span>🔒 Servidores Encriptados 2026</span>
                <span>•</span>
                <span>⏱️ {new Date().toLocaleTimeString()}</span>
              </div>

              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full py-3.5 bg-yellow-400 hover:bg-yellow-500 text-black font-bangers text-sm tracking-wider uppercase border-3 border-black rounded-2xl cursor-pointer transition-all shadow-[4px_4px_0px_#000] hover:translate-y-[-1px] hover:shadow-[5px_5px_0px_#000] active:translate-y-[1px] active:shadow-[1px_1px_0px_#000]"
              >
                ¡ENTENDIDO, MI SARGENTO D.T.! ⚡
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
