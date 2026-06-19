import React, { useState } from 'react';
import { COUNTRIES, MATCH_FIXTURES } from '../data';
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
  Info 
} from 'lucide-react';

interface GroupsFixtureViewProps {
  unlockedLevels: { [countryName: string]: { [level: number]: boolean } };
  playersDB: { [countryName: string]: Player[] };
  userBoards: { [countryName: string]: UserTacticalBoard };
  onSelectCountry: (countryName: string) => void;
  setActiveTab: (tab: 'album' | 'board' | 'leaderboard' | 'groups_fixture' | 'flutter') => void;
  matchSyncKey?: number;
}

export default function GroupsFixtureView({ 
  unlockedLevels, 
  playersDB, 
  userBoards, 
  onSelectCountry, 
  setActiveTab,
  matchSyncKey
}: GroupsFixtureViewProps) {
  const [subTab, setSubTab] = useState<'groups' | 'fixtures'>('groups');
  const [groupFilter, setGroupFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Helper to calculate unlocked player count for any country
  const getUnlockedCount = (countryName: string): number => {
    const levels = unlockedLevels[countryName] || { 1: false, 2: false, 3: false };
    let count = 0;
    if (levels[1]) count += 9;
    if (levels[2]) count += 9;
    if (levels[3]) count += 8;
    return count;
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
          <span>Fase de Grupos: 48 Selecciones • 12 Grupos • 36 Partidos</span>
        </div>
      </div>

      {subTab === 'groups' ? (
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

    </div>
  );
}
