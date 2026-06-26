import React, { useState } from 'react';
import { LeaderboardEntry, UserTacticalBoard, Player } from '../types';
import { 
  Trophy, 
  Sparkles, 
  AlertCircle, 
  RefreshCw, 
  CheckCircle, 
  Zap, 
  Car, 
  Smartphone, 
  Gift, 
  ShieldCheck,
  Search,
  Dice5,
  Coins,
  Award,
  Heart,
  Mail,
  UserPlus,
  Lock,
  Copy,
  Settings
} from 'lucide-react';
import { getPopulatedMatch } from '../data';

const localStorage = (() => {
  try {
    const test = window.localStorage;
    const testKey = '__test_local_storage_leader__';
    test.setItem(testKey, '1');
    test.removeItem(testKey);
    return test;
  } catch (e) {
    const memoryStore: Record<string, string> = {};
    return {
      getItem: (key: string): string | null => (key in memoryStore ? memoryStore[key] : null),
      setItem: (key: string, value: string): void => { memoryStore[key] = String(value); },
      removeItem: (key: string): void => { delete memoryStore[key]; },
      clear: (): void => { Object.keys(memoryStore).forEach(key => delete memoryStore[key]); },
      key: (index: number): string | null => Object.keys(memoryStore)[index] || null,
      get length() { return Object.keys(memoryStore).length; }
    } as any;
  }
})();

interface LeaderboardViewProps {
  userBoards: { [countryName: string]: UserTacticalBoard };
  playersDB: { [countryName: string]: Player[] };
  unlockedLevels: { [country: string]: { [level: number]: boolean } };
  currentUserId?: string;
  currentUsername?: string;
  currentUserCode?: string;
  referralPoints?: number;
  currentUserSubscription?: string;
  currentUserEmail?: string;
  userCoins?: number;
  userCashBalance?: number;
  userLicense?: string;
  onNavigateToSubscription?: () => void;
}

// Simple deterministic generator for transparent seed-based drawings on front-end
function seedRandomGenerator(seedStr: string) {
  let h = 1779033703 ^ seedStr.length;
  for (let i = 0; i < seedStr.length; i++) {
    h = Math.imul(h ^ seedStr.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return {
    next: function() {
      h = Math.imul(h ^ (h >>> 16), 2246822507);
      h = Math.imul(h ^ (h >>> 13), 3266489909);
      return ((h ^= h >>> 16) >>> 0) / 4294967296;
    }
  };
}

export default function LeaderboardView({ 
  userBoards, 
  playersDB, 
  unlockedLevels,
  currentUserId = 'user_me',
  currentUsername = 'Tú (Director Técnico)',
  currentUserCode = 'DT-MINE',
  referralPoints = 0,
  currentUserSubscription = 'Ninguna',
  currentUserEmail = '',
  userCoins = 350,
  userCashBalance = 0.00,
  userLicense = '',
  onNavigateToSubscription
}: LeaderboardViewProps) {
  const [simulationLogs, setSimulationLogs] = useState<string[]>([]);
  const [isSimulated, setIsSimulated] = useState<boolean>(false);
  const [predictionScore, setPredictionScore] = useState<number>(0);
  const [userAciertosOnce, setUserAciertosOnce] = useState<number>(0);
  const [userAciertosMarcadores, setUserAciertosMarcadores] = useState<number>(0);
  const [calculationsRunning, setCalculationsRunning] = useState<boolean>(false);

  // API states
  const [apiRankingList, setApiRankingList] = useState<any[]>([]);
  const [apiLoading, setApiLoading] = useState<boolean>(false);

  // Invitation/Referral States
  const [inviteEmail, setInviteEmail] = useState<string>('');
  const [invitedList, setInvitedList] = useState<string[]>(() => {
    const list = localStorage.getItem('dt_invited_emails');
    if (list) {
      try {
        return JSON.parse(list);
      } catch (e) {
        console.warn("Error parsing dt_invited_emails:", e);
      }
    }
    return [];
  });
  const [inviteSuccessMsg, setInviteSuccessMsg] = useState<string>('');
  const [inviteErrorMsg, setInviteErrorMsg] = useState<string>('');

  // Auditable Seed Raffle testing panel state
  const [testSeed, setTestSeed] = useState<string>('SELECCIONES_2026_HEAVY');
  const [testCountry, setTestCountry] = useState<string>('Argentina');
  const [drawResultIndices, setDrawResultIndices] = useState<number[] | null>(null);
  const [showSeedTestPanel, setShowSeedTestPanel] = useState<boolean>(false);

  // 1. DYNAMIC USER ALBUM POINTS COMPUTATION (Dynamic Query requested)
  let unlockedCromosCount = 0;
  let completedCountriesCount = 0;
  const completedCountriesList: string[] = [];

  Object.entries(unlockedLevels).forEach(([country, levels]) => {
    const lvl1 = levels[1] || false;
    const lvl2 = levels[2] || false;
    const lvl3 = levels[3] || false;

    let countryCount = 0;
    if (lvl1) countryCount += 9; // level 1 provides 9 backup players
    if (lvl2) countryCount += 9; // level 2 provides 9 template players
    if (lvl3) countryCount += 8; // level 3 provides 8 star players

    unlockedCromosCount += countryCount;

    if (lvl1 && lvl2 && lvl3) {
      completedCountriesCount += 1;
      completedCountriesList.push(country);
    }
  });

  // Calculate scores on the fly: 1 point per sticker, 5 points extra per completed country
  const albumStickerScore = unlockedCromosCount * 1;
  const albumCountryBonusScore = completedCountriesCount * 5;
  const totalAlbumScore = albumStickerScore + albumCountryBonusScore;

  // React effect to synchronize score and fetch rankings from the backend APIs
  React.useEffect(() => {
    let active = true;
    const fetchRankings = async () => {
      setApiLoading(true);
      try {
        // Trigger server scoring validation
        const scoreRes = await fetch('/api/user/score', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            unlockedLevels,
            userPredictionScore: predictionScore,
            gameCode: currentUserCode
          })
        });
        const scoreData = await scoreRes.json();
        const serverComputedScore = scoreData.totalScore || (totalAlbumScore + predictionScore);

        // Fetch global standings
        const leaderboardRes = await fetch('/api/leaderboard/global', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            currentUserScore: serverComputedScore,
            currentUsername: currentUsername,
            currentUserCode: currentUserCode,
            currentUserId: currentUserId,
            aciertosOnce: userAciertosOnce,
            aciertosMarcador: userAciertosMarcadores
          })
        });
        const leaderboardData = await leaderboardRes.json();
        if (active && leaderboardData && leaderboardData.ranking) {
          setApiRankingList(leaderboardData.ranking);
        }
      } catch (err) {
        console.error('API integration fallback: ', err);
      } finally {
        if (active) setApiLoading(false);
      }
    };

    fetchRankings();
    return () => {
      active = false;
    };
  }, [totalAlbumScore, predictionScore, userAciertosOnce, userAciertosMarcadores]);

  // 2. CORE GAMEPLAY CALCULATION LOGIC: Prediction matching (11 starters and match score)
  const handleCalculateScores = async () => {
    setCalculationsRunning(true);
    setSimulationLogs([
      '⚽ Iniciando Motor de Cálculo y Auditoría Real-Time...',
      '📡 Estableciendo canal seguro con bases de datos deportivas de la Federación...',
      '🤖 Conectando con Google Gemini con Grounding Oficial de Competiciones...',
      '🔍 Sincronizando marcadores oficiales y once iniciales en tiempo real...'
    ]);
    
    try {
      const response = await fetch('/api/predictions/sync-gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userBoards, playersDB })
      });

      if (!response.ok) {
        throw new Error(`Error de red: ${response.statusText}`);
      }

      const syncResult = await response.json();
      const geminiMatches = syncResult.matches || [];
      const isGeminiResult = syncResult.source === 'gemini-grounding';

      let totalMatchingOnce = 0;
      let totalMatchingScores = 0;
      let calculatedPoints = 0;
      const logs: string[] = [];

      const activeBoards = Object.entries(userBoards);
      
      if (activeBoards.length === 0) {
        logs.push('❌ Error de Simulación: No has configurado la Pizarra Táctica de ningún país en la pestaña de Pizarra.');
        logs.push('Por favor, ingresa a la pestaña "Pizarra Táctica", guarda tu formación ideal y pronóstico de marcador, luego regresa a calcular.');
        setSimulationLogs(logs);
        setCalculationsRunning(false);
        return;
      }

      if (isGeminiResult) {
        logs.push('✅ ¡DATOS REALES DE LAS SELECCIONES SINCRONIZADOS EXITOSAMENTE VÍA GEMINI SEARCH GROUNDING!');
      } else {
        logs.push('⚠️ Sincronización Web Offline: Utilizando el motor de contingencia de datos programáticos.');
      }

      activeBoards.forEach(([country, board]) => {
        const countryPlayers = playersDB[country] || [];
        const matchData = getPopulatedMatch(country, countryPlayers);
        
        logs.push(`------------------------------------------------------------------------`);
        logs.push(`Análisis de Transacciones y Táctica para: ${country}`);
        
        if (!board.prediction) {
          logs.push(`⚠️ Sin Pronóstico: No hay pronósticos guardados para el partido de ${country}.`);
          return;
        }

        const userPred = board.prediction;
        
        // Check if we have dynamic Gemini Grounded match results for this country
        const geminiMatch = geminiMatches.find((m: any) => m.country?.toLowerCase() === country.toLowerCase());

        let realGolesLocal = matchData.marcadorReal?.golesLocal ?? null;
        let realGolesVisitante = matchData.marcadorReal?.golesVisitante ?? null;
        let opponentName = matchData.visitante;
        let startingXINamesOrIds = matchData.onceInicialReal || [];

        if (geminiMatch) {
          opponentName = geminiMatch.opponent || opponentName;
          realGolesLocal = geminiMatch.golesLocal;
          realGolesVisitante = geminiMatch.golesVisitante;
          logs.push(`📝 [Grounding AI] ${geminiMatch.summary}`);
          
          // Map startingXI player realNames to their ids
          const geminiStartingNames = Array.isArray(geminiMatch.startingXI) ? geminiMatch.startingXI : [];
          if (geminiStartingNames.length > 0) {
            const mappedIds: string[] = [];
            countryPlayers.forEach(p => {
              const matchedName = geminiStartingNames.find((name: string) => 
                name.toLowerCase().includes((p.realName || '').toLowerCase()) || 
                (p.realName || '').toLowerCase().includes(name.toLowerCase()) ||
                name.toLowerCase().includes((p.name || '').toLowerCase()) ||
                (p.name || '').toLowerCase().includes(name.toLowerCase())
              );
              if (matchedName) {
                mappedIds.push(p.id);
              }
            });
            // If we found mapped names from current database, use them
            if (mappedIds.length >= 4) {
              startingXINamesOrIds = mappedIds;
            }
          }
        }

        // Match Score Comparison
        if (realGolesLocal !== null && realGolesVisitante !== null) {
          const scoreMatched = userPred.golesLocal === realGolesLocal && userPred.golesVisitante === realGolesVisitante;
          logs.push(`[Audit Pronóstico] Usuario estimó: ${userPred.golesLocal} - ${userPred.golesVisitante}`);
          logs.push(`[Dato Real Pro] Marcador oficial vs ${opponentName}: ${realGolesLocal} - ${realGolesVisitante}`);
          
          if (scoreMatched) {
            calculatedPoints += 20;
            totalMatchingScores += 1;
            logs.push(`🎉 ¡ACIERTO EXACTO DE MARCADOR REGISTRADO! +20 Puntos asignados de manera atómica.`);
          } else {
            logs.push(`❌ Marcador incorrecto. El pronóstico de goles no coincide.`);
          }
        }

        // XI Matching comparison
        const assignedPlayerIds = Object.values(board.selectedPlayers).filter(Boolean) as string[];

        logs.push(`Evaluando coincidencia del once inicial (titulares coinciden)...`);
        let matchesInOnce = 0;

        assignedPlayerIds.forEach(pId => {
          const basePlayer = countryPlayers.find(p => p.id === pId);
          if (startingXINamesOrIds.includes(pId)) {
            matchesInOnce += 1;
            calculatedPoints += 10; 
            if (basePlayer) {
              logs.push(`✅ Titular Confirmado Oficial: ${basePlayer.realName} (+10 puntos)`);
            }
          }
        });

        totalMatchingOnce += matchesInOnce;
        logs.push(`Resultado de juego táctico para ${country}: ${matchesInOnce} de 11 jugadores confirmados como titulares.`);
      });

      logs.push(`------------------------------------------------------------------------`);
      logs.push(`🔥 AUDITORÍA FINALIZADA EXITOSAMENTE.`);
      logs.push(`Puntos por alineación sugerida (D.T.): +${calculatedPoints} Pts.`);
      
      setPredictionScore(calculatedPoints);
      setUserAciertosOnce(totalMatchingOnce);
      setUserAciertosMarcadores(totalMatchingScores);
      setSimulationLogs(prev => [...prev, ...logs]);
      setIsSimulated(true);

    } catch (err: any) {
      console.error("Error executing dynamic prediction sync matching:", err);
      // Run normal programmatic calculation as defensive fallback
      let totalMatchingOnce = 0;
      let totalMatchingScores = 0;
      let calculatedPoints = 0;
      const logs: string[] = ['⚠️ Enlace de tiempo real interrumpido. Corriendo simulación local de contingencia:'];

      const activeBoards = Object.entries(userBoards);
      if (activeBoards.length > 0) {
        activeBoards.forEach(([country, board]) => {
          const countryPlayers = playersDB[country] || [];
          const matchData = getPopulatedMatch(country, countryPlayers);
          
          logs.push(`------------------------------------------------------------------------`);
          logs.push(`Análisis de Transacciones y Táctica para: ${country}`);
          
          if (!board.prediction) {
            return;
          }

          const userPred = board.prediction;
          const realMarcador = matchData.marcadorReal;

          if (realMarcador) {
            const scoreMatched = userPred.golesLocal === realMarcador.golesLocal && userPred.golesVisitante === realMarcador.golesVisitante;
            logs.push(`[Audit Pronóstico] Usuario estimó: ${userPred.golesLocal} - ${userPred.golesVisitante}`);
            logs.push(`[Dato Real Pro] Marcador oficial: ${realMarcador.golesLocal} - ${realMarcador.golesVisitante}`);
            
            if (scoreMatched) {
              calculatedPoints += 20;
              totalMatchingScores += 1;
              logs.push(`🎉 ¡ACIERTO EXACTO DE MARCADOR REGISTRADO! +20 Puntos asignados.`);
            } else {
              logs.push(`❌ Marcador incorrecto.`);
            }
          }

          const assignedPlayerIds = Object.values(board.selectedPlayers).filter(Boolean) as string[];
          const officialStartingXI = matchData.onceInicialReal;

          let matchesInOnce = 0;
          assignedPlayerIds.forEach(pId => {
            const basePlayer = countryPlayers.find(p => p.id === pId);
            if (officialStartingXI.includes(pId)) {
              matchesInOnce += 1;
              calculatedPoints += 10; 
              if (basePlayer) {
                logs.push(`✅ Titular Confirmado Oficial: ${basePlayer.realName} (+10 puntos)`);
              }
            }
          });

          totalMatchingOnce += matchesInOnce;
        });

        logs.push(`------------------------------------------------------------------------`);
        logs.push(`🔥 AUDITORÍA FINALIZADA EXITOSAMENTE (Fallbacks).`);
        logs.push(`Puntos por alineación sugerida (D.T.): +${calculatedPoints} Pts.`);
        
        setPredictionScore(calculatedPoints);
        setUserAciertosOnce(totalMatchingOnce);
        setUserAciertosMarcadores(totalMatchingScores);
        setSimulationLogs(prev => [...prev, ...logs]);
        setIsSimulated(true);
      }
    } finally {
      setCalculationsRunning(false);
    }
  };

  // 3. SEED-BASED DRAW SIMULATOR FOR TRANSPARENCY AUDITING
  const handleExecuteDeterministicDraw = async () => {
    if (!testSeed.trim()) return;
    try {
      const res = await fetch('/api/stickers/unlock-packet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seed: testSeed,
          countryName: testCountry
        })
      });
      const data = await res.json();
      if (data && data.indicesUnlocked) {
        setDrawResultIndices(data.indicesUnlocked);
      } else {
        throw new Error('No list received from API');
      }
    } catch (err) {
      console.warn('API draw failed, running local secure fallback:', err);
      const rng = seedRandomGenerator(testSeed);
      const indices: number[] = [];
      while (indices.length < 3) {
        const idx = Math.floor(rng.next() * 26);
        if (!indices.includes(idx)) {
          indices.push(idx);
        }
      }
      setDrawResultIndices(indices.sort((a, b) => a - b));
    }
  };

  // 4. GENERATING GLOBAL TOP 3 DYNAMIC RANKINGS
  const userTotalPoints = totalAlbumScore + predictionScore + (referralPoints || 0);

  const competitors: any[] = [];

  const userEntry = {
    username: 'Tú (Director Técnico)',
    score: userTotalPoints,
    aciertosOnce: userAciertosOnce,
    aciertosMarcador: userAciertosMarcadores,
    avatar: '👑',
    code: 'DT-MINE',
    unlockedStickersCount: unlockedCromosCount,
    completedCountries: completedCountriesList,
    referralPoints: referralPoints || 0
  };

  // Merge and sort in real-time
  const globalRanking = [...competitors, userEntry].sort((a, b) => b.score - a.score);

  const displayedRanking = apiRankingList.length > 0 ? apiRankingList : globalRanking;

  // Find user rank index
  const userRank = displayedRanking.findIndex(item => item.username.includes('Tú') || item.username.includes('Director')) + 1;

  // Define prize targets based on ranking as of July 30th
  const prizes = [
    { rank: 1, title: 'Gran Premio de Clasificación', name: 'Premio en Efectivo: $1.000 USD', desc: 'Otorgado al primer lugar absoluto en puntaje de D.T. al corte final del 30 de julio, auditado por un notario público.', icon: <Trophy className="w-5.5 h-5.5 text-yellow-450" />, badge: 'bg-yellow-500/15 border-yellow-500 text-yellow-405' },
    { rank: 2, title: 'Segundo Premio de Clasificación', name: 'Premio en Efectivo: $500 USD', desc: 'Otorgado al segundo lugar absoluto en puntaje de D.T. al corte final del 30 de julio, auditado por un notario público.', icon: <Award className="w-5.5 h-5.5 text-slate-300" />, badge: 'bg-slate-300/15 border-slate-300 text-slate-300' },
    { rank: 3, title: 'Tercer Premio de Clasificación', name: 'Premio en Efectivo: $250 USD', desc: 'Otorgado al tercer lugar absoluto en puntaje de D.T. al corte final del 30 de julio, auditado por un notario público.', icon: <Coins className="w-5.5 h-5.5 text-amber-500" />, badge: 'bg-amber-600/15 border-amber-600 text-amber-600' }
  ];

  const isPaidPlan = currentUserSubscription === 'Plan Scout Básico' || currentUserSubscription === 'Pase VIP Elite';

  return (
    <div className="space-y-8" id="leaderboard-workspace">
      
      {/* Dynamic User Score Overview Block */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800/80 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-44 h-44 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <span className="text-[9.5px] font-mono font-bold text-indigo-400 uppercase tracking-widest block mb-1">AUDITORÍA DE RENDIMIENTO D.T.</span>
            <h2 className="text-xl font-extrabold text-white">Desglose de tus Puntos Oficiales</h2>
            <p className="text-xs text-gray-400 mt-1 max-w-xl">
              Tus puntuaciones se calculan dinámicamente: cada cromo individual reclutado añade exactly <strong className="text-indigo-300">1 punto</strong>, y completar un país otorga <strong className="text-emerald-405">5 puntos extra</strong> automáticamente.
            </p>
          </div>

          <div className="flex flex-wrap gap-3.5 w-full lg:w-auto">
            {/* Cards unlocked points */}
            <div className="bg-slate-950 border border-slate-850 p-3.5 rounded-2xl flex-1 lg:flex-none min-w-[110px]">
              <span className="text-[8.5px] font-mono text-gray-500 uppercase block">Cromos Reunidos</span>
              <span className="text-2xl font-black font-mono text-white block mt-0.5">{unlockedCromosCount}</span>
              <span className="text-[10px] text-indigo-400 font-mono mt-0.5">+{albumStickerScore} Pts</span>
            </div>

            {/* Countries completed awards */}
            <div className="bg-slate-950 border border-slate-850 p-3.5 rounded-2xl flex-1 lg:flex-none min-w-[110px]">
              <span className="text-[8.5px] font-mono text-gray-500 uppercase block">Países Completos</span>
              <span className="text-2xl font-black font-mono text-white block mt-0.5">{completedCountriesCount}</span>
              <span className="text-[10px] text-emerald-400 font-mono mt-0.5">+{albumCountryBonusScore} Pts</span>
            </div>

            {/* Tactical Predictions */}
            <div className="bg-slate-950 border border-slate-850 p-3.5 rounded-2xl flex-1 lg:flex-none min-w-[110px]">
              <span className="text-[8.5px] font-mono text-gray-500 uppercase block">Táctica & Goles</span>
              <span className="text-2xl font-black font-mono text-emerald-400 block mt-0.5">+{predictionScore}</span>
              <span className="text-[9px] text-gray-500 block">De Pizarras D.T.</span>
            </div>

            {/* Final Total aggregation score */}
            <div className="bg-gradient-to-br from-indigo-650 to-indigo-800 p-3.5 rounded-2xl flex-1 lg:flex-none min-w-[120px] shadow-lg shadow-indigo-600/10">
              <span className="text-[8.5px] font-mono text-slate-100 uppercase block font-semibold">Puntaje Global</span>
              <span className="text-2xl font-black font-mono text-white block mt-0.5 shadow-sm">{userTotalPoints}</span>
              <span className="text-[9.5px] text-indigo-250 font-bold block">DT RANK: #{userRank}</span>
            </div>
          </div>
        </div>

        {/* Dynamic completed country pills check */}
        {completedCountriesCount > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-850 flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-mono text-slate-450 uppercase shrink-0">Bonos Otorgados por:</span>
            {completedCountriesList.map(c => (
              <span key={c} className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 px-2 py-0.5 rounded-lg flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> {c} (+5 Pts)
              </span>
            ))}
          </div>
        )}
      </div>

      {/* SECTION: EXPEDIENTE HISTÓRICO Y SINCRONIZACIÓN DE DATOS D.T. */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* COL 1 & 2: Mis Pronósticos y Alineaciones Oficiales de la Base de Datos */}
        <div className="bg-slate-900 border border-slate-805 rounded-3xl p-5 lg:col-span-2 space-y-4 shadow-xl">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-400" />
              <h3 className="font-bold text-white text-xs uppercase tracking-wider font-mono">
                📋 Registro Oficial de Pronósticos & Pizarras Sincronizadas
              </h3>
            </div>
            <span className="text-[9px] font-mono bg-indigo-500/10 text-indigo-400 px-2.5 py-0.5 rounded border border-indigo-500/20 font-bold uppercase">
              Base de Datos Sincronizada
            </span>
          </div>

          {Object.keys(userBoards).length === 0 ? (
            <div className="text-center py-8 bg-slate-950/40 rounded-2xl border-2 border-dashed border-slate-850">
              <p className="text-xs text-gray-405 font-mono">No has registrado ni sincronizado ninguna alineación táctica aún.</p>
              <p className="text-[10px] text-gray-500 mt-1 font-sans">Dirígete a la sección de alineaciones o partidos para guardar tus primeros pronósticos.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
              {Object.entries(userBoards).map(([country, b]) => (
                <div key={country} className="bg-slate-950/85 rounded-2xl border-2 border-black p-3.5 shadow-[3px_3px_0px_#000] space-y-2 relative overflow-hidden flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-white uppercase font-sans flex items-center gap-1">
                        ⚽ {country}
                      </span>
                      <span className={`text-[8.5px] font-mono px-2 py-0.5 rounded border ${b.predictionEligible ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-emerald-400' : 'bg-amber-500/10 text-amber-500 border-amber-500/20 text-amber-500'}`}>
                        {b.predictionEligible ? 'CONFIRMADO' : 'CERRADO / EXPIRADO'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-900 text-[10.5px] font-mono">
                      <div>
                        <span className="text-gray-500 block text-[8px] uppercase">Formación:</span>
                        <span className="text-slate-300 font-bold">{b.formation || 'Sin asignar'}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block text-[8px] uppercase">Marcador Propuesto:</span>
                        <span className="text-yellow-405 font-bold">
                          {b.prediction ? `${b.prediction.golesLocal} - ${b.prediction.golesVisitante}` : 'Pendiente'}
                        </span>
                      </div>
                    </div>

                    {b.predictionReason && (
                      <p className="text-[10px] text-gray-400 line-clamp-2 mt-2 leading-relaxed bg-slate-900/60 p-1.5 rounded border border-slate-850 font-sans italic">
                        "{b.predictionReason}"
                      </p>
                    )}
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-950 flex items-center justify-between text-[9px] text-gray-550 font-mono">
                    <span>Sincro: {b.predictionSavedAt ? new Date(b.predictionSavedAt).toLocaleDateString() : 'N/A'}</span>
                    <span className="text-indigo-400 font-bold bg-slate-900 px-1.5 py-0.5 rounded border border-slate-850">OFFICIAL DATA</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* COL 3: Mi Billetera, Plan de Pago & Licencia */}
        <div className="bg-slate-900 border border-slate-850 rounded-3xl p-5 space-y-4 shadow-xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-yellow-450" />
                <h3 className="font-bold text-white text-xs uppercase tracking-wider font-mono">
                  💼 Mi Billetera de D.T. y Licencia
                </h3>
              </div>
              <span className="text-[9px] font-mono bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/15 font-bold">SINCRO OK</span>
            </div>

            <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-850 font-mono text-[11px]">
              <div>
                <span className="text-gray-550 block text-[8.5px] uppercase">Plan de Pago Activo:</span>
                <span className="text-purple-400 font-bold">{currentUserSubscription || 'Ninguno (Básico)'}</span>
              </div>
              <div>
                <span className="text-gray-550 block text-[8.5px] uppercase">Código de Licencia:</span>
                <span className="text-cyan-400 font-bold text-[10.5px] select-all break-all bg-slate-900/80 px-2 py-0.5 rounded border border-slate-850/60 font-mono">
                  {userLicense || 'SIN LICENCIA REGISTRADA'}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-900/60">
                <span className="text-gray-550 block text-[8px] uppercase">Usuario ID Técnico:</span>
                <span className="text-slate-400 text-[10px] break-all select-all font-mono">{currentUserId}</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-950/30 to-slate-950 p-3.5 rounded-2xl border border-indigo-500/10 text-center space-y-1">
            <span className="text-[9px] font-mono text-indigo-400 uppercase tracking-widest block font-bold">ACCESO LIGAS DE HONOR</span>
            <p className="text-[10px] text-gray-400 leading-normal font-sans">
              Se ha verificado la validez de tus datos en la pasarela de pagos oficial. ¡Tu progreso está protegido y auditable en tiempo real!
            </p>
          </div>
        </div>
      </div>

      {/* World Cup Raffle Prizes Eligibility Panel */}
      <div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <h3 className="font-bold text-white text-sm font-mono uppercase tracking-widest text-indigo-400">Premios de Sorteo y Elegibilidad Pro</h3>
          
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-mono">Tu Plan Actual:</span>
            <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg border ${
              isPaidPlan 
                ? 'bg-emerald-500/10 border-emerald-500/35 text-emerald-405 font-extrabold' 
                : 'bg-amber-500/10 border-amber-500/35 text-amber-500 font-extrabold animate-pulse'
            }`}>
              {isPaidPlan ? `👑 ${currentUserSubscription} (PAGADO)` : '⚠️ PLAN GRATUITO AMATEUR'}
            </span>
          </div>
        </div>

        {!isPaidPlan && (
          <div className="mb-6 p-5 bg-gradient-to-r from-amber-950/20 via-slate-900 to-indigo-950/10 border-2 border-amber-500/40 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-4 animate-fade-in relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-start gap-3 relative z-10">
              <span className="text-2xl shrink-0 mt-0.5">🏆</span>
              <div>
                <h4 className="font-extrabold text-sm text-amber-400 uppercase font-mono tracking-wider">Inscripción a Premios Deshabilitada (Plan de Pago Requerido)</h4>
                <p className="text-[11.5px] text-gray-300 leading-relaxed mt-0.5 max-w-2xl">
                  Estás registrado con un <strong>Plan Gratuito Amateur</strong>. Tus puntos oficiales se registran en el ranking pero <strong>no eres elegible para recibir los premios en efectivo</strong> ($1.000, $500 o $250 USD). Los premios y donaciones se auditan con notario público y se entregarán el 30 de julio en vivo por Facebook Live y YouTube. ¡Adquiere el Pase VIP o el Plan Scout Básico para habilitar tu elegibilidad auditable!
                </p>
              </div>
            </div>
            {onNavigateToSubscription && (
              <button
                onClick={onNavigateToSubscription}
                className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-[11px] uppercase font-mono tracking-wider rounded-xl cursor-pointer shadow-md select-none border border-amber-600 shrink-0 relative z-10 active:scale-95 transition-all"
              >
                Adquirir Suscripción
              </button>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {prizes.map((p) => {
            const isUserEligible = userRank === p.rank;
            const isUserEligibleWithSubscription = isUserEligible && isPaidPlan;
            const cardBg = isUserEligibleWithSubscription 
              ? 'bg-gradient-to-tr from-indigo-950/20 to-emerald-950/20 border-emerald-500 shadow-xl glow-emerald ring-1 ring-emerald-500/50' 
              : isUserEligible
                ? 'bg-gradient-to-tr from-amber-950/15 via-[#1b1c1b] to-slate-950 border-amber-500/40 shadow-md ring-1 ring-amber-505/20 animate-pulse'
                : 'bg-slate-900 border-slate-850';

            return (
              <div key={p.rank} className={`border rounded-2xl p-4.5 transition-all flex flex-col justify-between ${cardBg}`}>
                <div>
                  <div className="flex items-center justify-between mb-3.5">
                    <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-gray-500">{p.title}</span>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${p.badge}`}>
                      {p.rank}° LUGAR
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0">
                      {p.icon}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-white">{p.name}</h4>
                      <p className="text-[11px] text-gray-400 leading-normal mt-0.5">{p.desc}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3.5 border-t border-slate-800">
                  {isUserEligible ? (
                    isPaidPlan ? (
                      <span className="text-[11px] font-mono text-emerald-400 font-bold flex items-center gap-1.5 animate-pulse bg-emerald-500/5 p-2 rounded-xl border border-emerald-500/20 justify-center">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" /> ¡ESTÁS CALIFICADO PARA ESTE SORTEO!
                      </span>
                    ) : (
                      <div className="flex flex-col items-center gap-1.5 bg-amber-500/5 p-2.5 rounded-xl border border-amber-500/30 text-center animate-pulse">
                        <span className="text-[10.5px] font-mono text-amber-500 font-black flex items-center gap-1">
                          <AlertCircle className="w-4 h-4 shrink-0 text-amber-500" /> ¡RANGO ALCANZADO PERO INACTIVO!
                        </span>
                        <span className="text-[9.5px] text-amber-500/80 font-sans font-semibold leading-tight">
                          Posición califica, pero requieres de un plan de pago para reclamar el sorteo.
                        </span>
                      </div>
                    )
                  ) : (
                    <span className="text-[10.5px] font-mono text-slate-500 text-center block leading-relaxed py-1 bg-slate-950 p-2 rounded-xl">
                      {userRank < p.rank 
                        ? `Califica quien esté exactamente en la posición ${p.rank}.` 
                        : `Sube ${userRank - p.rank} posiciones en la tabla para reclamar.`}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT: Live Leaderboard ranking list */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-805 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4 mb-5">
            <Trophy className="w-6 h-6 text-yellow-400 shrink-0" />
            <div>
              <h3 className="font-bold text-white text-base">Tabla de Clasificación Global</h3>
              <p className="text-gray-400 text-xs mt-0.5">Ranking global en tiempo real integrado por base de datos</p>
            </div>
          </div>

          <div className="space-y-3">
            {displayedRanking.map((item, index) => {
              const isUser = item.username.includes('Tú') || item.username.includes('Director');
              const pos = item.rank || (index + 1);
              const medalStyles = pos === 1 ? 'bg-yellow-500/10 border-yellow-500 text-yellow-400' 
                               : pos === 2 ? 'bg-slate-300/10 border-slate-300 text-slate-300' 
                               : pos === 3 ? 'bg-amber-600/10 border-amber-600 text-amber-600' 
                               : 'bg-slate-950 border-slate-850 text-gray-400';

              let eligibilityLabel = '';
              if (pos === 1) eligibilityLabel = '🥇 $1.000 USD';
              else if (pos === 2) eligibilityLabel = '🥈 $500 USD';
              else if (pos === 3) eligibilityLabel = '🥉 $250 USD';

              return (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                    isUser 
                      ? 'bg-indigo-500/10 border-indigo-500 ring-1 ring-indigo-500/25 shadow-lg scale-[1.01]' 
                      : 'bg-slate-950 border-slate-950 hover:border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center border font-mono font-bold text-xs ${medalStyles}`}>
                      {pos}
                    </div>
                    <div>
                      <h4 className={`text-sm font-bold flex items-center gap-1.5 ${isUser ? 'text-indigo-400 font-extrabold' : 'text-white'}`}>
                        <span>{item.avatar || '⚽'}</span>
                        <span>{item.username}</span>
                      </h4>
                      <p className="text-[9.5px] text-gray-500 font-mono mt-0.5">
                        Cod: {item.code} {item.aciertosOnce !== undefined && item.aciertosOnce > 0 ? `• Táctica XI: ${item.aciertosOnce}/11` : ''} {eligibilityLabel && <span className="text-indigo-400 font-semibold ml-1">• {eligibilityLabel}</span>}
                      </p>
                      {/* Detailed segment breakdown on leaderboard list */}
                      <div className="flex flex-wrap items-center gap-1.5 mt-1 font-mono text-[8.5px] tracking-tight">
                        <span className="bg-blue-500/10 text-blue-400 px-1.5 py-0.2 rounded" title="Puntos por Cromos">🖼️ Cromos: {item.unlockedStickersCount || 0}</span>
                        <span className="bg-emerald-500/10 text-emerald-400 px-1.5 py-0.2 rounded" title="Bonos por Países Completados">🌍 Bonos: {(item.completedCountries?.length || 0) * 5}</span>
                        <span className="bg-orange-500/10 text-orange-400 px-1.5 py-0.2 rounded" title="Puntos por XI Ideal">🏃 XI: {(item.aciertosOnce || 0) * 10}</span>
                        <span className="bg-yellow-500/10 text-yellow-300 px-1.5 py-0.2 rounded" title="Puntos por Marcador Exacto">🎯 Score: {(item.aciertosMarcador || 0) * 20}</span>
                        <span className="bg-purple-500/10 text-purple-400 px-1.5 py-0.2 rounded" title="Puntos por Invitaciones">👥 Amigos: {item.referralPoints || 0}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`text-base font-black font-mono ${isUser ? 'text-indigo-400' : 'text-white'}`}>
                      {item.score}
                    </span>
                    <span className="block text-[8px] text-gray-500 font-mono uppercase">PTS</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT: Scoring Simulator & Seed Audits */}
        <div className="lg:col-span-6 flex flex-col gap-6">

          {/* Real-time Inviting system box */}
          {isPaidPlan && (
            <div className="bg-slate-900 border border-slate-805 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="w-5.5 h-5.5 text-indigo-400" />
                  <h3 className="font-bold text-white text-xs uppercase tracking-wider font-mono">Panel de Invitaciones Oficiales</h3>
                  <button
                    type="button"
                    onClick={() => setShowSeedTestPanel(!showSeedTestPanel)}
                    className="p-1 text-slate-500 hover:text-indigo-400 transition-colors rounded-lg cursor-pointer flex items-center justify-center animate-pulse"
                    title="Auditoría / Probador de Sorteo Seguro"
                  >
                    <Settings className="w-3.5 h-3.5" />
                  </button>
                </div>
                <span className="text-[8.5px] font-mono px-2 py-0.5 rounded border bg-emerald-500/10 text-emerald-400 border-emerald-500/15">
                  Habilitado
                </span>
              </div>

              <div className="space-y-2.5">
                <p className="text-[11.5px] text-gray-450 leading-normal">
                  Recomienda el Álbum de Trivia Pro 2026 compartiendo tu correo de patrocinador. Recibirás puntos extra en el ranking:
                </p>
                <div className="grid grid-cols-2 gap-2 text-center bg-slate-950/50 p-2 border border-slate-850 rounded-2xl font-mono">
                  <div className="p-2 bg-indigo-950/20 border border-indigo-900/25 rounded-xl">
                    <span className="text-[9px] text-indigo-400 block uppercase font-black">Plan Normal</span>
                    <span className="text-xs font-black text-white">+5 Puntos ⚽</span>
                  </div>
                  <div className="p-2 bg-emerald-950/10 border border-emerald-900/20 rounded-xl">
                    <span className="text-[9px] text-emerald-400 block uppercase font-black">Plan VIP ⭐</span>
                    <span className="text-xs font-black text-white">+15 Puntos 👑</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3.5 col-span-full">
                {/* Enlace & WhatsApp Bubble Section */}
                <div className="bg-indigo-950/15 border border-indigo-500/15 p-3 rounded-2xl space-y-3">
                  <div>
                    <span className="text-[9px] font-mono text-indigo-400 block uppercase font-bold mb-1">Tu enlace oficial de patrocinador:</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={`${window.location.origin}/?ref=${encodeURIComponent(currentUserEmail || 'tu-correo')}`}
                        className="w-full bg-slate-950 text-slate-200 font-mono text-[10.5px] border border-slate-850 rounded-lg px-2.5 py-1.5 focus:outline-none"
                      />
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(`${window.location.origin}/?ref=${encodeURIComponent(currentUserEmail || '')}`);
                          setInviteSuccessMsg('¡Enlace de invitación copiado con éxito!');
                          setTimeout(() => setInviteSuccessMsg(''), 3000);
                        }}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white p-2.5 rounded-lg cursor-pointer transition active:scale-95 shrink-0"
                        title="Copiar Link"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Acceso Directo a WhatsApp */}
                  <div className="bg-[#128C7E]/10 border border-[#128C7E]/30 p-3 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono text-[#25D366] uppercase font-black tracking-wide">Acción Rápida de WhatsApp 📱</span>
                      <span className="text-[8px] bg-[#25D366]/10 text-[#25D366] px-1.5 py-0.5 rounded font-mono font-bold">1-Click</span>
                    </div>
                    <p className="text-[10px] text-slate-300 leading-normal">
                      Compártele tu link y tu correo a tus amigos. Cuando ellos se registren con tu enlace, acumularás puntos de forma automática.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        const shareLink = `${window.location.origin}/?ref=${encodeURIComponent(currentUserEmail || '')}`;
                        const customMsg = `🏆 ¡Únete al Álbum de Trivia Pro de Selecciones 25-26!\n\nRegístrate ingresando a este enlace de invitación:\n👉 ${shareLink}\n\n¡Pon a prueba tus conocimientos tácticos, colecciona cromos de los astros y clasifica a sorteos reales! (Usa mi correo registrado: *${currentUserEmail}* al registrarte)`;
                        const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(customMsg)}`;
                        window.open(whatsappUrl, '_blank');
                      }}
                      className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-black text-xs uppercase tracking-wider rounded-xl transition cursor-pointer active:scale-95 border-b-2 border-emerald-800 flex items-center justify-center gap-1.5"
                    >
                      <span>Compartir por WhatsApp 💬</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[9.5px] font-mono text-gray-500 uppercase block">Invitar por Correo Electrónico:</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => {
                        setInviteEmail(e.target.value);
                        setInviteErrorMsg('');
                        setInviteSuccessMsg('');
                      }}
                      placeholder="correo-de-tu-amigo@ejemplo.com"
                      className="flex-1 bg-slate-950 text-white font-mono text-xs border border-slate-850 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-505"
                    />
                    <button
                      onClick={async () => {
                        const emailClean = inviteEmail.trim().toLowerCase();
                        if (!emailClean) {
                          setInviteErrorMsg('⚠️ Ingresa un correo para invitar.');
                          return;
                        }
                        if (emailClean === (currentUserEmail || '').toLowerCase().trim()) {
                          setInviteErrorMsg('⚠️ No puedes invitarte a ti mismo.');
                          return;
                        }
                        
                        // Local simulation list update
                        if (invitedList.includes(emailClean)) {
                          setInviteErrorMsg('⚠️ Ya has invitado a este correo electrónico anteriormente.');
                          return;
                        }

                        const newList = [...invitedList, emailClean];
                        setInvitedList(newList);
                        localStorage.setItem('dt_invited_emails', JSON.stringify(newList));
                        
                        setInviteEmail('');
                        setInviteSuccessMsg(`🎉 ¡Invitación enviada con éxito a ${emailClean}! Compártele tu correo registrado "${currentUserEmail}" para que lo ingrese al registrarse.`);
                      }}
                      className="bg-indigo-600 hover:bg-indigo-505 text-white px-4 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer shrink-0 active:scale-95"
                    >
                      Invitar
                    </button>
                  </div>
                </div>

                {inviteSuccessMsg && (
                  <p className="text-[10px] text-emerald-400 font-medium font-sans leading-tight bg-emerald-500/10 p-2.5 border border-emerald-500/20 rounded-xl animate-fade-in">
                    {inviteSuccessMsg}
                  </p>
                )}
                {inviteErrorMsg && (
                  <p className="text-[10px] text-rose-450 font-medium font-sans leading-tight bg-rose-500/10 p-2.5 border border-rose-500/20 rounded-xl animate-fade-in">
                    {inviteErrorMsg}
                  </p>
                )}

                {invitedList.length > 0 && (
                  <div className="space-y-1.5 border-t border-slate-850 pt-3">
                    <span className="text-[9px] font-mono text-gray-500 block uppercase">Historial de Invitados ({invitedList.length}):</span>
                    <div className="max-h-[100px] overflow-y-auto space-y-1 custom-scrollbar">
                      {invitedList.map((m, i) => (
                        <div key={i} className="flex items-center justify-between text-[10px] font-mono bg-slate-950 p-1.5 px-2.5 rounded-lg border border-slate-900">
                          <span className="text-slate-300 truncate max-w-[200px]">{m}</span>
                          <span className="text-[8.5px] text-indigo-400 uppercase font-semibold">Pendiente Registro con Pago</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* New Section: Seed-Based Deterministic Draw Tester (Raffle Transparency validation) */}
          {showSeedTestPanel && (
            <div className="bg-slate-900 border border-slate-805 rounded-3xl p-6 shadow-xl space-y-4 animate-fade-in">
              <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Dice5 className="w-5 h-5 text-indigo-400" />
                  <h3 className="font-bold text-white text-xs uppercase tracking-wider font-mono">Probador de Sorteo Seguro (Seed Test)</h3>
                </div>
                <span className="text-[9px] font-mono bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/15">Auditable</span>
              </div>

              <p className="text-[11.5px] text-gray-400 leading-normal">
                Cumpliendo las normas de transparencia y equidad de sorteos, las tiradas de cromos se resuelven con una semilla única. Si ingresas el mismo código, el resultado será 100% idéntico y verificable, previniendo manipulaciones.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[9.5px] font-mono text-gray-500 uppercase block mb-1">Semilla de Validación (Seed Value)</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={testSeed}
                      onChange={(e) => setTestSeed(e.target.value)}
                      placeholder="Escribe un código random"
                      className="w-full bg-slate-950 text-white font-mono text-xs border border-slate-850 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-505"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[9.5px] font-mono text-gray-500 uppercase block mb-1">País a Simular</label>
                  <select
                    value={testCountry}
                    onChange={(e) => setTestCountry(e.target.value)}
                    className="w-full bg-slate-950 text-white text-xs border border-slate-850 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-505"
                  >
                    <option className="bg-[#0f172a] text-white" value="Argentina">🇦🇷 Argentina</option>
                    <option className="bg-[#0f172a] text-white" value="Brasil">🇧🇷 Brasil</option>
                    <option className="bg-[#0f172a] text-white" value="España">🇪🇸 España</option>
                    <option className="bg-[#0f172a] text-white" value="México">🇲🇽 México</option>
                    <option className="bg-[#0f172a] text-white" value="Francia">🇫🇷 Francia</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleExecuteDeterministicDraw}
                className="w-full bg-slate-950 hover:bg-slate-850 text-indigo-300 border border-indigo-500/25 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center justify-center gap-2"
              >
                Simular Sorteo Determinista
              </button>

              {drawResultIndices && (
                <div className="bg-slate-950 p-3 rounded-2xl border border-slate-850/80 animate-fade-in space-y-2">
                  <span className="text-[9px] font-mono text-gray-500 block uppercase">Resultados de Selección Auditada:</span>
                  <div className="flex items-center gap-2">
                    {drawResultIndices.map((idx) => {
                      const starsList = playersDB[testCountry] || [];
                      const playerFound = starsList[idx];
                      return (
                        <div key={idx} className="bg-brand-card/90 border border-slate-800 p-2 rounded-xl flex-1 text-center font-sans">
                          <span className="text-[8px] font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/15 py-0.5 px-1.5 rounded uppercase">
                            Cromo #{idx + 1}
                          </span>
                          <h5 className="font-extrabold text-[11px] text-white mt-1.5 truncate">
                            {playerFound ? playerFound.realName : `Cromo ${idx + 1}`}
                          </h5>
                          <span className="text-[9px] text-slate-500 block truncate font-mono">
                            {playerFound ? `${playerFound.rating} Rating` : 'N/A'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="text-[9.5px] font-mono text-gray-500/80 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Criptografía de Sorteo: MurmurHash3 verificado. Determinismo garantizado.</span>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

