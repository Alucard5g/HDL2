import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  Shield, 
  User, 
  ChevronRight, 
  Play, 
  Settings2, 
  AlertCircle, 
  Sparkles, 
  Check, 
  ArrowRight, 
  RefreshCw, 
  Layers, 
  Crosshair, 
  AlertTriangle, 
  Coins, 
  Save, 
  HelpCircle, 
  Eye, 
  Flame, 
  ShieldAlert,
  Sliders,
  ChevronDown,
  Lock,
  Compass,
  Zap,
  Info,
  Calendar,
  X,
  Gauge
} from 'lucide-react';
import { COUNTRIES } from '../data';
import { getFactualPlayers } from '../data/squadsData';
import { Player, TeamTactics, PVPChallenge, PVPSimulationResult, RunDirection } from '../types';

// Coordinate layouts for custom formations
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

const ARROW_PERKS: { [key in RunDirection]: { label: string; desc: string; icon: string } } = {
  'N': { label: 'Ataque Frontal', desc: 'Sube constantemente al remate. Potencia el desmarque y tiro.', icon: '⬆️' },
  'NE': { label: 'Diagonal Ofensiva Derecha', desc: 'Busca el centro desde la banda derecha. Facilita remate cruzado.', icon: '↗️' },
  'E': { label: 'Apertura Derecha', desc: 'Desborda por la banda derecha para enviar centros precisos.', icon: '➡️' },
  'SE': { label: 'Repliegue de Apoyo Derecho', desc: 'Ayuda en la cobertura defensiva del sector derecho.', icon: '↘️' },
  'S': { label: 'Defensa Estricta', desc: 'Mantiene posición atrasada. Prioriza marca física y corte limpio.', icon: '⬇️' },
  'SO': { label: 'Repliegue de Apoyo Izquierdo', desc: 'Ayuda en la cobertura defensiva del sector izquierdo.', icon: '↙️' },
  'O': { label: 'Apertura Izquierda', desc: 'Desborda por la banda izquierda buscando desequilibrio.', icon: '⬅️' },
  'NO': { label: 'Diagonal Ofensiva Izquierda', desc: 'Corta en diagonal hacia adentro desde la banda izquierda.', icon: '↖️' }
};

interface PVPArenaViewProps {
  currentSubscription: string;
  unlockedLevels: { [country: string]: { [level: number]: boolean } };
  manuallyUnlockedPlayerIds: { [playerId: string]: boolean };
  userCoins: number;
  onUpdateCoins: (newCoins: number) => void;
  userScore: number;
  onUpdateScore: (newScore: number) => void;
  username: string;
  userCode: string;
  onNavigateToVIP?: () => void;
}

export default function PVPArenaView({
  currentSubscription,
  unlockedLevels,
  manuallyUnlockedPlayerIds,
  userCoins,
  onUpdateCoins,
  userScore,
  onUpdateScore,
  username,
  userCode,
  onNavigateToVIP
}: PVPArenaViewProps) {
  // === ACCESS CONTROL GATING ===
  const hasAccess = true;
  const isPaidUser = 
    currentSubscription === 'Pase VIP Elite' || 
    currentSubscription === 'Plan Scout Básico' || 
    (currentSubscription && currentSubscription.toLowerCase().includes('vip')) || 
    (currentSubscription && currentSubscription.toLowerCase().includes('scout')) || 
    (username && username.toLowerCase().includes('admin'));

  // Core setup states
  const [is3D, setIs3D] = useState<boolean>(true);
  const [clubName, setClubName] = useState<string>(() => localStorage.getItem('pvp_club_name') || `${(username || '').toUpperCase()} FC`);
  const [escudoSeed, setEscudoSeed] = useState<string>(() => localStorage.getItem('pvp_escudo_seed') || '⭐');
  const [formationWithBall, setFormationWithBall] = useState<string>('4-3-3');
  const [formationWithoutBall, setFormationWithoutBall] = useState<string>('5-3-2');
  const [pressureLine, setPressureLine] = useState<number>(6);

  // Load unlocked players from all countries
  const [allUnlockedPlayers, setAllUnlockedPlayers] = useState<Player[]>([]);
  const [isLoadingPlayers, setIsLoadingPlayers] = useState<boolean>(true);

  // States for search and selection modes
  const [scoutingMode, setScoutingMode] = useState<'owned' | 'all'>('owned');
  const [playerSearchQuery, setPlayerSearchQuery] = useState<string>('');

  // Compiled global list of all factual players across all 32 World Cup countries
  const allGlobalPlayers = React.useMemo(() => {
    const list: Player[] = [];
    COUNTRIES.forEach((country) => {
      const countryPlayers = getFactualPlayers(country.name) || [];
      countryPlayers.forEach((p, idx) => {
        list.push({
          id: p.id,
          name: p.name || p.realName,
          realName: p.realName,
          country: country.name,
          rating: p.rating || (72 + (idx % 15)),
          position: p.position,
          subPosition: p.subPosition || 'Convocado',
          styleOfPlay: p.styleOfPlay || 'Juego ordenado',
          dominantFoot: idx % 3 === 0 ? 'Izquierdo' : 'Derecho',
          age: p.age || 25,
          height: p.height || 180,
          weight: p.weight || 75,
          currentClub: p.currentClub || 'Liga Oficial',
          imageSeed: p.id
        });
      });
    });
    return list;
  }, []);

  // Filtered list of players for active slot selection based on search query and owned/all tab
  const selectablePlayers = React.useMemo(() => {
    const baseList = scoutingMode === 'owned' ? allUnlockedPlayers : allGlobalPlayers;
    if (!playerSearchQuery.trim()) return baseList;
    const q = playerSearchQuery.toLowerCase();
    return baseList.filter(p => 
      p.name.toLowerCase().includes(q) || 
      (p.realName && p.realName.toLowerCase().includes(q)) || 
      p.country.toLowerCase().includes(q) || 
      p.position.toLowerCase().includes(q)
    );
  }, [scoutingMode, allUnlockedPlayers, allGlobalPlayers, playerSearchQuery]);

  // Squad selection
  const [selectedSpots, setSelectedSpots] = useState<{ [posLabel: string]: string | null }>({});
  const [activeSpotSelection, setActiveSpotSelection] = useState<string | null>(null);

  // Autocomplete using ONLY the player's currently owned/unlocked stickers
  const handleAutocompleteRoster = () => {
    if (allUnlockedPlayers.length === 0) {
      alert("⚠️ No tienes tarjetas desbloqueadas en tu álbum todavía. Resuelve trivias en el Álbum para conseguir tarjetas o utiliza 'Autocompletar Libre' para probar con cualquier jugador de la Copa Mundial.");
      return;
    }

    const formationLayout = FORMATIONS[formationWithBall].coords;
    const defaultSpots: { [posLabel: string]: string | null } = {};
    Object.keys(formationLayout).forEach((spot) => {
      defaultSpots[spot] = null;
    });

    const populatedSpots = { ...defaultSpots };
    const usedIds = new Set<string>();

    // Step 1: Match by specific position (GK, DF, MF, FW) using unlocked players
    Object.entries(formationLayout).forEach(([spot, meta]) => {
      const matchRole = meta.role;
      const matchingPlayers = allUnlockedPlayers
        .filter(p => p.position === matchRole && !usedIds.has(p.id))
        .sort((a, b) => b.rating - a.rating);

      if (matchingPlayers.length > 0) {
        populatedSpots[spot] = matchingPlayers[0].id;
        usedIds.add(matchingPlayers[0].id);
      }
    });

    // Step 2: Fill remaining empty spots with the best remaining unlocked players
    Object.entries(formationLayout).forEach(([spot, meta]) => {
      if (!populatedSpots[spot]) {
        const remainingPlayers = allUnlockedPlayers
          .filter(p => !usedIds.has(p.id))
          .sort((a, b) => b.rating - a.rating);

        if (remainingPlayers.length > 0) {
          populatedSpots[spot] = remainingPlayers[0].id;
          usedIds.add(remainingPlayers[0].id);
        }
      }
    });

    setSelectedSpots(populatedSpots);
    
    // Check if we populated fewer than 11 spots
    const filledCount = Object.values(populatedSpots).filter(id => id !== null).length;
    if (filledCount < 11) {
      alert(`⚠️ Solo tienes ${allUnlockedPlayers.length} tarjetas en tu inventario, así que no se completaron todas las posiciones. ¡Usa 'Autocompletar Libre' para llenar el equipo completo de inmediato!`);
    }
  };

  // Autocomplete using ANY player from the entire global World Cup list (Free Trial / High Performance mode)
  const handleAutocompleteRosterFree = () => {
    const formationLayout = FORMATIONS[formationWithBall].coords;
    const defaultSpots: { [posLabel: string]: string | null } = {};
    Object.keys(formationLayout).forEach((spot) => {
      defaultSpots[spot] = null;
    });

    const populatedSpots = { ...defaultSpots };
    const usedIds = new Set<string>();

    // Step 1: Match by specific position
    Object.entries(formationLayout).forEach(([spot, meta]) => {
      const matchRole = meta.role;
      const matchingPlayers = allGlobalPlayers
        .filter(p => p.position === matchRole && !usedIds.has(p.id))
        .sort((a, b) => b.rating - a.rating);

      if (matchingPlayers.length > 0) {
        populatedSpots[spot] = matchingPlayers[0].id;
        usedIds.add(matchingPlayers[0].id);
      }
    });

    // Step 2: Fill remaining empty spots
    Object.entries(formationLayout).forEach(([spot, meta]) => {
      if (!populatedSpots[spot]) {
        const remainingPlayers = allGlobalPlayers
          .filter(p => !usedIds.has(p.id))
          .sort((a, b) => b.rating - a.rating);

        if (remainingPlayers.length > 0) {
          populatedSpots[spot] = remainingPlayers[0].id;
          usedIds.add(remainingPlayers[0].id);
        }
      }
    });

    setSelectedSpots(populatedSpots);
  };

  // Clear all spots for custom manual selection
  const handleClearRoster = () => {
    const formationLayout = FORMATIONS[formationWithBall].coords;
    const clearedSpots: { [posLabel: string]: string | null } = {};
    Object.keys(formationLayout).forEach((spot) => {
      clearedSpots[spot] = null;
    });
    setSelectedSpots(clearedSpots);
  };

  // Player tactical variables: directions and markings
  const [playerRunDirections, setPlayerRunDirections] = useState<{ [playerId: string]: RunDirection }>({});
  const [playerMarkings, setPlayerMarkings] = useState<{ [playerId: string]: string }>({}); // playerId -> marked OpponentId or 'zonal'

  // Simulating matches & Challenges
  const [challenges, setChallenges] = useState<PVPChallenge[]>([]);
  const [activeChallenge, setActiveChallenge] = useState<PVPChallenge | null>(null);
  const [simulating, setSimulating] = useState<boolean>(false);
  const [simResult, setSimResult] = useState<PVPSimulationResult | null>(null);
  const [showSimModal, setShowSimModal] = useState<boolean>(false);
  const [arenaXp, setArenaXp] = useState<number>(() => Number(localStorage.getItem('pvp_arena_xp') || '0'));

  // Custom code coupon entry in Muro de Pago
  const [couponCode, setCouponCode] = useState<string>('');
  const [couponError, setCouponError] = useState<string>('');
  const [couponSuccess, setCouponSuccess] = useState<string>('');

  // Floating help state
  const [activeHelpCard, setActiveHelpCard] = useState<string | null>(null);

  // 1. Compile total roster based on verified stickers
  useEffect(() => {
    setIsLoadingPlayers(true);
    try {
      const unlockedList: Player[] = [];
      COUNTRIES.forEach((country) => {
        const countryPlayers = getFactualPlayers(country.name) || [];
        const levels = unlockedLevels[country.name] || { 1: false, 2: false, 3: false };
        
        countryPlayers.forEach((p, idx) => {
          // Rule for country-level unlocks:
          // Level 1: index 0-8
          // Level 2: index 9-17
          // Level 3: index 18-25
          const isLvl1 = levels[1] && idx < 9;
          const isLvl2 = levels[2] && idx >= 9 && idx < 18;
          const isLvl3 = levels[3] && idx >= 18 && idx < 26;
          const isManuallyUnlocked = manuallyUnlockedPlayerIds[p.id];

          if (isLvl1 || isLvl2 || isLvl3 || isManuallyUnlocked) {
            unlockedList.push({
              id: p.id,
              name: p.name || p.realName,
              realName: p.realName,
              country: country.name,
              rating: p.rating || (72 + (idx % 15)),
              position: p.position,
              subPosition: p.subPosition || 'Convocado',
              styleOfPlay: p.styleOfPlay || 'Juego ordenado',
              dominantFoot: idx % 3 === 0 ? 'Izquierdo' : 'Derecho',
              age: p.age || 25,
              height: p.height || 180,
              weight: p.weight || 75,
              currentClub: p.currentClub || 'Liga Oficial',
              imageSeed: p.id
            });
          }
        });
      });
      setAllUnlockedPlayers(unlockedList);

      // Pre-seed default spots
      const defaultSpots: { [posLabel: string]: string | null } = {};
      const formationLayout = FORMATIONS['4-3-3'].coords;
      Object.keys(formationLayout).forEach((spot) => {
        defaultSpots[spot] = null;
      });

      // Try to auto-populate from unlocked matching roles
      const populatedSpots = { ...defaultSpots };
      const usedIds = new Set<string>();
      
      Object.entries(formationLayout).forEach(([spot, meta]) => {
        const matchRole = meta.role;
        const available = unlockedList.find(p => p.position === matchRole && !usedIds.has(p.id));
        if (available) {
          populatedSpots[spot] = available.id;
          usedIds.add(available.id);
        }
      });
      setSelectedSpots(populatedSpots);

    } catch (e) {
      console.error("Error compilation rosters:", e);
    } finally {
      setIsLoadingPlayers(false);
    }
  }, [unlockedLevels, manuallyUnlockedPlayerIds]);

  // Load or Pre-seed Challenges List
  useEffect(() => {
    const preseeded: PVPChallenge[] = [
      {
        id: 'chal_berlin',
        opponentName: 'Muro de Berlín FC',
        opponentLogo: '🛡️',
        opponentRating: 84,
        opponentPlayers: ['de-1', 'de-4', 'de-13', 'de-15', 'de-22', 'de-5', 'de-8', 'de-10', 'de-18', 'de-7', 'de-26'],
        played: false
      },
      {
        id: 'chal_sambas',
        opponentName: 'Jogo Bonito SC',
        opponentLogo: '🤙',
        opponentRating: 88,
        opponentPlayers: ['br-1', 'br-7', 'br-10', 'br-5', 'br-4', 'br-11', 'br-13', 'br-22', 'br-19', 'br-20', 'br-15'],
        played: false
      },
      {
        id: 'chal_tikitaka',
        opponentName: 'Tiki Taka Athletic',
        opponentLogo: '🌀',
        opponentRating: 86,
        opponentPlayers: ['es-1', 'es-19', 'es-16', 'es-18', 'es-9', 'es-10', 'es-8', 'es-20', 'es-15', 'es-3', 'es-24'],
        played: false
      },
      {
        id: 'chal_counters',
        opponentName: 'Contraataque United',
        opponentLogo: '⚡',
        opponentRating: 85,
        opponentPlayers: ['fr-1', 'fr-10', 'fr-7', 'fr-4', 'fr-12', 'fr-14', 'fr-17', 'fr-19', 'fr-21', 'fr-24', 'fr-25'],
        played: false
      }
    ];

    // Load from local storage if exists
    const savedChallenges = localStorage.getItem('pvp_challenges_history');
    if (savedChallenges) {
      try {
        setChallenges(JSON.parse(savedChallenges));
      } catch (e) {
        setChallenges(preseeded);
      }
    } else {
      setChallenges(preseeded);
    }
  }, []);

  // Save changes helper
  const handleSaveClubSetup = () => {
    localStorage.setItem('pvp_club_name', clubName);
    localStorage.setItem('pvp_escudo_seed', escudoSeed);
    alert('¡Configuración de Club guardada con éxito! Tu identidad de DT está registrada.');
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    setCouponSuccess('');
    const cleanCode = couponCode.trim().toUpperCase();

    if (!cleanCode) {
      setCouponError('Por favor ingresa un código.');
      return;
    }

    // Validates some codes such as SCOUT2026, VIP2026, FEPUBLICA, NOTARIAL
    if (cleanCode === 'SCOUT2026' || cleanCode === 'FEPUBLICA' || cleanCode === 'DESAFIO_DT') {
      setCouponSuccess('¡Código de Pase de Cortesía validado! Se ha desbloqueado el PLAN SCOUT BÁSICO.');
      localStorage.setItem('album_user_subscription', 'Plan Scout Básico');
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } else if (cleanCode === 'VIP2026' || cleanCode === 'NOTARIAL') {
      setCouponSuccess('¡Código de Licencia Premium validado! Se ha desbloqueado el PASE VIP ELITE.');
      localStorage.setItem('album_user_subscription', 'Pase VIP Elite');
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } else {
      setCouponError('Código no válido. Verifica tu comprobante o adquiere un pase de selección en el panel VIP.');
    }
  };

  // 2. Tactical alignment changes
  const handleSpotClick = (spot: string) => {
    setActiveSpotSelection(spot);
  };

  const handleSelectPlayerForSpot = (playerId: string) => {
    if (!activeSpotSelection) return;

    // Check if player is already assigned somewhere else, if so swap or clear
    const nextSpots = { ...selectedSpots };
    Object.entries(nextSpots).forEach(([spot, id]) => {
      if (id === playerId) {
        nextSpots[spot] = null;
      }
    });

    nextSpots[activeSpotSelection] = playerId;
    setSelectedSpots(nextSpots);
    setActiveSpotSelection(null);

    // Seed default run directions and zonal markings if not set
    if (!playerRunDirections[playerId]) {
      setPlayerRunDirections(prev => ({ ...prev, [playerId]: 'N' }));
    }
    if (!playerMarkings[playerId]) {
      setPlayerMarkings(prev => ({ ...prev, [playerId]: 'zonal' }));
    }
  };

  // 3. Simulating game with REST call
  const handleSimulateChallenge = async (challenge: PVPChallenge) => {
    setActiveChallenge(challenge);
    setSimulating(true);
    setSimResult(null);
    setShowSimModal(true);

    // Build user starting roster of player objects
    const userRosterIds = Object.values(selectedSpots).filter(id => id !== null) as string[];
    const userRoster = userRosterIds.map(id => allGlobalPlayers.find(p => p.id === id)).filter(p => p !== undefined) as Player[];

    if (userRoster.length < 11) {
      alert(`Para simular el Desafío de DTs debes alinear los 11 jugadores requeridos. Actualmente tienes convocados ${userRoster.length}/11 de tu inventario.`);
      setSimulating(false);
      setShowSimModal(false);
      return;
    }

    // Build tactics payload
    const tacticsPayload: TeamTactics = {
      formationWithBall,
      formationWithoutBall,
      pressureLine,
      playerTactics: {}
    };

    userRoster.forEach(p => {
      tacticsPayload.playerTactics[p.id] = {
        playerId: p.id,
        runDirection: playerRunDirections[p.id] || 'N',
        markingTargetId: playerMarkings[p.id] || 'zonal'
      };
    });

    try {
      // API Post request
      const response = await fetch('/api/pvp/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challengeId: challenge.id,
          clubName,
          escudoSeed,
          userRoster: userRoster.map(p => ({
            id: p.id,
            name: p.name,
            realName: p.realName,
            position: p.position,
            rating: p.rating,
            country: p.country
          })),
          tactics: tacticsPayload,
          opponentPlayers: challenge.opponentPlayers
        })
      });

      if (!response.ok) {
        throw new Error('API simulation request failed');
      }

      const result: PVPSimulationResult = await response.json();
      setSimResult(result);

      // Award XP and Coins on Victory
      let xp = 50;
      let coins = 10;
      if (result.goalsLocal > result.goalsVisitante) {
        xp = 150;
        coins = 40;
      } else if (result.goalsLocal === result.goalsVisitante) {
        xp = 80;
        coins = 20;
      }

      // Update challenge history state
      const nextChallenges = challenges.map(c => {
        if (c.id === challenge.id) {
          return {
            ...c,
            played: true,
            scoreLocal: result.goalsLocal,
            scoreVisitante: result.goalsVisitante,
            xpAwarded: xp,
            coinsAwarded: coins,
            simulationResult: result
          };
        }
        return c;
      });

      setChallenges(nextChallenges);
      localStorage.setItem('pvp_challenges_history', JSON.stringify(nextChallenges));

      // Update economic state on client
      const nextXp = arenaXp + xp;
      setArenaXp(nextXp);
      localStorage.setItem('pvp_arena_xp', String(nextXp));

      onUpdateCoins(userCoins + coins);
      onUpdateScore(userScore + coins);

    } catch (err) {
      console.error("Simulation error:", err);
      // Fallback offline sim if server is unreachable or API key depleted
      const fallbackResult = generateLocalSimulation(userRoster, tacticsPayload, challenge);
      setSimResult(fallbackResult);

      const xp = fallbackResult.goalsLocal > fallbackResult.goalsVisitante ? 150 : (fallbackResult.goalsLocal === fallbackResult.goalsVisitante ? 80 : 50);
      const coins = fallbackResult.goalsLocal > fallbackResult.goalsVisitante ? 40 : (fallbackResult.goalsLocal === fallbackResult.goalsVisitante ? 20 : 10);

      const nextChallenges = challenges.map(c => {
        if (c.id === challenge.id) {
          return {
            ...c,
            played: true,
            scoreLocal: fallbackResult.goalsLocal,
            scoreVisitante: fallbackResult.goalsVisitante,
            xpAwarded: xp,
            coinsAwarded: coins,
            simulationResult: fallbackResult
          };
        }
        return c;
      });
      setChallenges(nextChallenges);
      localStorage.setItem('pvp_challenges_history', JSON.stringify(nextChallenges));

      const nextXp = arenaXp + xp;
      setArenaXp(nextXp);
      localStorage.setItem('pvp_arena_xp', String(nextXp));
      onUpdateCoins(userCoins + coins);
      onUpdateScore(userScore + coins);
    } finally {
      setSimulating(false);
    }
  };

  // Helper local simulator
  const generateLocalSimulation = (userRoster: Player[], tactics: TeamTactics, challenge: PVPChallenge): PVPSimulationResult => {
    // Average user rating
    const avgUserRating = userRoster.reduce((sum, p) => sum + p.rating, 0) / userRoster.length;
    const oppRating = challenge.opponentRating;

    // Tactical modifiers
    let tacticBonus = 0;
    if (tactics.formationWithBall !== tactics.formationWithoutBall) {
      tacticBonus += 3; // Fluid formation bonus
    }
    tacticBonus += (tactics.pressureLine > 7) ? 1.5 : -0.5; // Aggressive press

    // Calculate win weights
    const userWeight = avgUserRating + tacticBonus;
    const oppWeight = oppRating;
    const sumWeights = userWeight + oppWeight;

    const winProb = Math.round((userWeight / sumWeights) * 100);
    const drawProb = 20;

    // Probabilistic score generator
    const random = Math.random() * 100;
    let goalsLocal = 0;
    let goalsVisitante = 0;

    if (random < winProb - 10) {
      // Victory
      goalsLocal = Math.floor(Math.random() * 3) + 1;
      goalsVisitante = Math.floor(Math.random() * goalsLocal);
    } else if (random < winProb + drawProb) {
      // Draw
      goalsLocal = Math.floor(Math.random() * 3);
      goalsVisitante = goalsLocal;
    } else {
      // Defeat
      goalsVisitante = Math.floor(Math.random() * 3) + 1;
      goalsLocal = Math.floor(Math.random() * goalsVisitante);
    }

    // Possession & stats
    const possessionLocal = Math.round(50 + (tacticBonus * 2) + (Math.random() * 10 - 5));
    const possessionVisitante = 100 - possessionLocal;
    const shotsLocal = Math.floor(possessionLocal / 4) + Math.floor(Math.random() * 4);
    const shotsVisitante = Math.floor(possessionVisitante / 4) + Math.floor(Math.random() * 4);

    // Heat maps
    const heatMapLocal = Array.from({ length: 8 }, () => Array.from({ length: 8 }, () => Math.floor(Math.random() * 60)));
    const heatMapVisitante = Array.from({ length: 8 }, () => Array.from({ length: 8 }, () => Math.floor(Math.random() * 50)));

    // Extract scorers
    const forwards = userRoster.filter(p => p.position === 'FW');
    const midfielders = userRoster.filter(p => p.position === 'MF');
    const pool = forwards.length > 0 ? forwards : (midfielders.length > 0 ? midfielders : userRoster);

    const scorersLocal: string[] = [];
    for (let i = 0; i < goalsLocal; i++) {
      const lucky = pool[Math.floor(Math.random() * pool.length)];
      scorersLocal.push(lucky.name);
    }

    const scorersVisitante: string[] = [];
    for (let i = 0; i < goalsVisitante; i++) {
      scorersVisitante.push(`Oponente Crack ${i+1}`);
    }

    const report = `Análisis táctico local de SophIA: Tu club ${clubName} saltó al terreno de juego empleando una formación con balón ${tactics.formationWithBall} que se replegaba a ${tactics.formationWithoutBall} sin la posesión. La presión en bloque medio-alto (nivel ${tactics.pressureLine}/10) asfixió los circuitos creativos de ${challenge.opponentName}. Gracias al posicionamiento defensivo ordenado y el desmarque de tus delanteros estrella, lograste imponer condiciones tácticas, neutralizando las descolgadas individuales del oponente. Un partido sumamente parejo que certifica tu jerarquía táctica en la pizarra.`;

    return {
      goalsLocal,
      goalsVisitante,
      possessionLocal,
      possessionVisitante,
      shotsLocal,
      shotsVisitante,
      victoryChanceLocal: winProb,
      victoryChanceVisitante: 100 - winProb - drawProb,
      report,
      heatMapLocal,
      heatMapVisitante,
      scorersLocal,
      scorersVisitante
    };
  };

  // Reset matches
  const handleResetMatches = () => {
    if (confirm('¿Deseas reiniciar el historial de desafíos de la arena PVP?')) {
      localStorage.removeItem('pvp_challenges_history');
      window.location.reload();
    }
  };


  // === RENDER CORE PVP ARENA ===
  return (
    <div className="w-full flex flex-col gap-6 select-none" id="pvp-arena-content">
      
      {/* 1. HEADER SECTION: Club profile & Stats */}
      <div className="bg-[#080c09] border-[3.5px] border-black p-6 rounded-3xl shadow-[6px_6px_0px_rgba(0,0,0,1)] relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="z-10 flex-1 text-center md:text-left">
          <div className="inline-flex items-center gap-2 bg-[#FDDF2B] text-black border-2 border-black font-mono text-[9px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-widest mb-3 rotate-[-1deg] shadow-[2px_2px_0px_#000]">
            🏟️ PVP ARENA: DESAFÍO DE DTs
          </div>
          <h2 className="text-4xl font-bangers text-[#22c55e] tracking-wide mb-2 leading-tight uppercase">
            {clubName}
          </h2>
          <p className="text-xs font-comic font-bold text-slate-300 max-w-xl">
            Alinea tus tarjetas convocadas, configura estrategias avanzadas de Pro Evolution Soccer y mide tus capacidades en simulaciones tácticas en tiempo real.
          </p>
        </div>

        {/* Economic / XP Badges */}
        <div className="z-10 flex flex-wrap items-center justify-center gap-3 w-full md:w-auto shrink-0">
          <div className="bg-white border-[3px] border-black p-3 rounded-2xl shadow-[4px_4px_0px_#ef4444] text-black flex flex-col items-center justify-center min-w-[110px] min-h-[85px]">
            <span className="text-xl">🏆</span>
            <span className="text-2xl font-bangers leading-none text-black mt-0.5">
              {arenaXp} XP
            </span>
            <span className="text-[8px] font-mono font-black text-gray-500 uppercase tracking-widest mt-1">
              Rango de Arena
            </span>
          </div>

          <div className="bg-white border-[3px] border-black p-3 rounded-2xl shadow-[4px_4px_0px_#FDDF2B] text-black flex flex-col items-center justify-center min-w-[110px] min-h-[85px]">
            <span className="text-xl">📊</span>
            <span className="text-2xl font-bangers leading-none text-black mt-0.5">
              {userScore}
            </span>
            <span className="text-[8px] font-mono font-black text-gray-500 uppercase tracking-widest mt-1">
              Puntos del Álbum
            </span>
          </div>

          <button 
            onClick={handleResetMatches}
            className="border-2 border-dashed border-red-500 hover:border-red-400 text-red-500 hover:text-red-400 bg-red-500/10 px-3 py-1.5 font-mono text-[9px] uppercase font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 shrink-0 self-stretch min-h-[44px]"
          >
            <RefreshCw className="w-3.5 h-3.5 shrink-0" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* 2. SQUAD BUILDER & BOARD GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Tactics & Customizations (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Identity & Custom Settings */}
          <div className="bg-white border-[3.5px] border-black rounded-3xl p-5 text-black shadow-[6px_6px_0px_rgba(0,0,0,1)]">
            <h3 className="text-xl font-bangers tracking-wide mb-4 flex items-center gap-2 uppercase border-b-2 border-black pb-2 text-black">
              <Sliders className="w-5 h-5 text-emerald-500 stroke-[3]" />
              <span>Configuración del Club Táctico</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono font-black uppercase text-slate-500 tracking-wider">Nombre del Club</label>
                <input 
                  type="text" 
                  value={clubName}
                  onChange={(e) => setClubName(e.target.value)}
                  className="bg-slate-100 border-2 border-black rounded-xl px-3 py-2 text-xs font-sans font-bold text-black focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono font-black uppercase text-slate-500 tracking-wider">Escudo de Campo</label>
                <select 
                  value={escudoSeed}
                  onChange={(e) => setEscudoSeed(e.target.value)}
                  className="bg-slate-100 border-2 border-black rounded-xl px-3 py-2 text-xs font-sans font-bold text-black focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="⭐">⭐ Estrella Dorada</option>
                  <option value="🦁">🦁 León Indomable</option>
                  <option value="🛡️">🛡️ Escudo de Hierro</option>
                  <option value="🦅">🦅 Águila Real</option>
                  <option value="🔥">🔥 Antorcha Fuego</option>
                  <option value="⚡">⚡ Rayo Sónico</option>
                </select>
              </div>

              <div className="flex items-end">
                <button 
                  onClick={handleSaveClubSetup}
                  className="w-full bg-[#22c55e] hover:bg-[#1a9e4a] text-black border-2 border-black font-sans font-black text-xs uppercase py-2.5 rounded-xl shadow-[3px_3px_0px_#000] cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Guardar</span>
                </button>
              </div>
            </div>

            {/* Advanced Team Instructions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5 pt-4 border-t border-slate-200">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-mono font-black uppercase text-slate-500 tracking-wider flex items-center gap-1">
                  <span>Con Balón</span>
                  <HelpCircle className="w-3 h-3 text-emerald-500 cursor-pointer" onClick={() => setActiveHelpCard('con_balon')} />
                </label>
                <select 
                  value={formationWithBall}
                  onChange={(e) => {
                    setFormationWithBall(e.target.value);
                  }}
                  className="bg-slate-100 border-2 border-black rounded-xl px-2 py-1.5 text-xs font-sans font-bold text-black cursor-pointer"
                >
                  <option value="4-3-3">4-3-3 (Ofensivo)</option>
                  <option value="4-4-2">4-4-2 (Equilibrado)</option>
                  <option value="3-5-2">3-5-2 (Ataque Bandas)</option>
                  <option value="5-3-2">5-3-2 (Contraataque)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-mono font-black uppercase text-slate-500 tracking-wider flex items-center gap-1">
                  <span>Sin Balón</span>
                  <HelpCircle className="w-3 h-3 text-emerald-500 cursor-pointer" onClick={() => setActiveHelpCard('sin_balon')} />
                </label>
                <select 
                  value={formationWithoutBall}
                  onChange={(e) => setFormationWithoutBall(e.target.value)}
                  className="bg-slate-100 border-2 border-black rounded-xl px-2 py-1.5 text-xs font-sans font-bold text-black cursor-pointer"
                >
                  <option value="5-3-2">5-3-2 (Cerrojo)</option>
                  <option value="4-4-2">4-4-2 (Repliegue)</option>
                  <option value="3-5-2">3-5-2 (Bloque Alto)</option>
                  <option value="4-3-3">4-3-3 (Presión Adelantada)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-mono font-black uppercase text-slate-500 tracking-wider flex items-center gap-1">
                  <span>Presión: {pressureLine}/10</span>
                  <HelpCircle className="w-3 h-3 text-emerald-500 cursor-pointer" onClick={() => setActiveHelpCard('presion')} />
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <input 
                    type="range" 
                    min="1" 
                    max="10" 
                    value={pressureLine}
                    onChange={(e) => setPressureLine(Number(e.target.value))}
                    className="w-full accent-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Tactical Help Modal overlay */}
            <AnimatePresence>
              {activeHelpCard && (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="bg-[#0c140f] border-2 border-black text-white p-3.5 rounded-xl mt-3 text-xs font-comic font-bold relative"
                >
                  <button onClick={() => setActiveHelpCard(null)} className="absolute top-2 right-2 text-slate-400 hover:text-white cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                  {activeHelpCard === 'con_balon' && (
                    <p>⚽ <strong>Formación con Balón (Estilo Táctico):</strong> Define la disposición de tus carrileros y mediapuntas al iniciar las fases ofensivas. Se usa para ensanchar el terreno de juego o acumular gente en la medular.</p>
                  )}
                  {activeHelpCard === 'sin_balon' && (
                    <p>🛡️ <strong>Formación sin Balón:</strong> Determina la estructura defensiva al replegarse. Idealmente, cambiar de un 4-3-3 con balón a un 5-3-2 sin balón ayuda a poblar la última línea de contención.</p>
                  )}
                  {activeHelpCard === 'presion' && (
                    <p>⚡ <strong>Línea de Presión (1-10):</strong> Un valor alto (8-10) asfixia las líneas del rival pero deja desprotegidas tus espaldas contra delanteros veloces. Un valor bajo (1-3) defiende en bloque bajo.</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Auto & Manual Squad Builders */}
            <div className="mt-5 pt-4 border-t border-slate-200 flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-mono font-black uppercase text-slate-500 tracking-wider">Alineación Rápida:</span>
              <button
                type="button"
                onClick={handleAutocompleteRoster}
                className="px-3 py-1.5 bg-indigo-100 hover:bg-indigo-200 text-indigo-900 border-2 border-black rounded-xl text-[10px] font-sans font-black uppercase shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-0.5 cursor-pointer transition-all flex items-center gap-1"
                title="Autocompletar automáticamente usando los mejores stickers que posees desbloqueados"
              >
                <Zap className="w-3 h-3 text-indigo-600 shrink-0" />
                <span>Autocompletar Desbloqueados</span>
              </button>

              <button
                type="button"
                onClick={handleAutocompleteRosterFree}
                className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 border-2 border-black rounded-xl text-[10px] font-sans font-black uppercase shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-0.5 cursor-pointer transition-all flex items-center gap-1"
                title="Autocompletar con jugadores súper estrellas globales de manera libre"
              >
                <Sparkles className="w-3 h-3 text-amber-600 shrink-0" />
                <span>Autocompletar Libre</span>
              </button>

              <button
                type="button"
                onClick={handleClearRoster}
                className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-900 border-2 border-black rounded-xl text-[10px] font-sans font-black uppercase shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-0.5 cursor-pointer transition-all flex items-center gap-1"
                title="Vaciar la pizarra para alinear tus jugadores uno a uno de forma manual"
              >
                <X className="w-3 h-3 text-rose-600 shrink-0" />
                <span>Vaciar Pizarra (Manual)</span>
              </button>
            </div>
          </div>

          {/* SQUAD BUILDER BOARD CANVAS */}
          <div className="bg-[#111] border-[3.5px] border-black rounded-3xl p-4 text-white shadow-[6px_6px_0px_rgba(0,0,0,1)] relative overflow-hidden flex-1 min-h-[500px] flex flex-col justify-between">
            {/* Pitch Header */}
            <div className="z-10 flex justify-between items-center bg-black/80 px-4 py-2 rounded-xl border border-white/10 gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-black uppercase text-emerald-400">📋 Pizarra Interactiva</span>
                <button
                  type="button"
                  onClick={() => setIs3D(!is3D)}
                  className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-wider border transition-all cursor-pointer ${
                    is3D 
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-[0_0_8px_rgba(34,197,94,0.3)]' 
                      : 'bg-zinc-950 text-slate-400 border-zinc-800'
                  }`}
                >
                  {is3D ? 'Arena 3D' : 'Arena 2D'}
                </button>
              </div>
              <span className="text-[10px] font-sans font-bold bg-[#EF4444] px-2 py-0.5 rounded-full text-white uppercase tracking-wider shrink-0">Inventario Verificado</span>
            </div>

            {/* 3D Field Wrapper Slab */}
            <div 
              className="relative flex-1 flex flex-col justify-between transition-all duration-700 ease-out"
              style={is3D ? {
                transform: 'perspective(1200px) rotateX(25deg) scale(0.95) translateY(-5px)',
                transformStyle: 'preserve-3d',
              } : {}}
            >
              {/* Soccer Pitch Graphic Texture */}
              <div className="absolute inset-0 pointer-events-none opacity-15 flex flex-col justify-between p-4 border-[3px] border-dashed border-white rounded-2xl m-2">
                <div className="w-full h-[50%] border-b-2 border-dashed border-white flex justify-center items-end">
                  <div className="w-32 h-16 border-2 border-white rounded-t-full relative translate-y-8" />
                </div>
              </div>

              {/* Active spots according to selected formation */}
              <div className="relative w-full h-[410px] mt-4 z-10 flex items-center justify-center">
                {isLoadingPlayers ? (
                  <div className="flex flex-col items-center justify-center text-slate-400 gap-2">
                    <RefreshCw className="w-8 h-8 animate-spin" />
                    <span className="text-xs font-mono">Convocando inventario...</span>
                  </div>
                ) : (
                  Object.entries(FORMATIONS[formationWithBall].coords).map(([spot, meta]) => {
                    const assignedId = selectedSpots[spot];
                    const pObj = assignedId ? allGlobalPlayers.find(p => p.id === assignedId) : null;

                    return (
                      <button
                        key={spot}
                        type="button"
                        onClick={() => handleSpotClick(spot)}
                        style={{ 
                          left: `${meta.x}%`, 
                          top: `${meta.y}%`,
                          transform: is3D 
                            ? 'translate(-50%, -50%) rotateX(-25deg) translateZ(15px)' 
                            : 'translate(-50%, -50%)',
                          transformStyle: 'preserve-3d'
                        }}
                        className="absolute group flex flex-col items-center transition-all duration-500 cursor-pointer"
                      >
                        {/* Interactive Pin */}
                        <div className={`w-12 h-12 rounded-full border-2 border-black flex items-center justify-center text-xs font-black transition-all ${
                          pObj 
                            ? 'bg-[#22c55e] text-black shadow-[3px_3px_0px_#000] scale-105 hover:scale-110 active:scale-95 ring-4 ring-emerald-500/20' 
                            : 'bg-zinc-800 border-dashed border-zinc-600 hover:bg-zinc-700 hover:border-emerald-500 scale-100 hover:scale-105 active:scale-95 shadow-[1.5px_1.5px_0px_#000]'
                        }`}>
                          {pObj ? pObj.rating : '+'}
                        </div>

                        {/* Info Badge */}
                        <div className="bg-black/80 border border-white/20 rounded px-2 py-0.5 mt-1 text-[9px] font-sans font-bold tracking-tight max-w-[85px] truncate text-center text-white">
                          {pObj ? pObj.name : spot}
                        </div>

                        {/* Direction arrow indication */}
                        {pObj && playerRunDirections[pObj.id] && (
                          <div className="absolute -top-3 right-0 bg-amber-400 text-black border border-black rounded-full w-4.5 h-4.5 flex items-center justify-center text-[8px] font-black shadow">
                            {playerRunDirections[pObj.id] === 'N' ? 'N' : playerRunDirections[pObj.id]}
                          </div>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Pitch Footer Instruction */}
            <div className="z-10 text-center bg-black/60 px-4 py-2 rounded-xl border border-white/10 text-[10px] font-comic font-bold text-slate-400 mt-2">
              Selecciona un círculo vacío para alinear a uno de tus jugadores convocados del álbum de stickers.
            </div>

          </div>

        </div>

        {/* RIGHT COLUMN: Player Tactical Editors & Challenges (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* SQUAD SELECTION MODAL LIST (Inline right side context) */}
          {activeSpotSelection && (
            <div className="bg-white border-[3.5px] border-black rounded-3xl p-5 text-black shadow-[6px_6px_0px_rgba(0,0,0,1)] animate-fade-in relative">
              <button 
                onClick={() => {
                  setActiveSpotSelection(null);
                  setPlayerSearchQuery('');
                }}
                className="absolute top-4 right-4 text-slate-500 hover:text-black cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-sm font-sans font-black uppercase tracking-wider mb-2 text-rose-500">
                Selección de Jugador para {activeSpotSelection}
              </h3>
              
              {/* Segmented Mode Controls: Owned vs All */}
              <div className="grid grid-cols-2 gap-2 mb-3 bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setScoutingMode('owned')}
                  className={`py-1.5 text-xs font-sans font-black uppercase rounded-lg transition-all cursor-pointer ${
                    scoutingMode === 'owned'
                      ? 'bg-emerald-500 text-black shadow-[2px_2px_0px_#000]'
                      : 'text-slate-500 hover:text-black hover:bg-slate-200/50'
                  }`}
                >
                  Mis Stickers ({allUnlockedPlayers.length})
                </button>
                <button
                  type="button"
                  onClick={() => setScoutingMode('all')}
                  className={`py-1.5 text-xs font-sans font-black uppercase rounded-lg transition-all cursor-pointer ${
                    scoutingMode === 'all'
                      ? 'bg-indigo-500 text-white shadow-[2px_2px_0px_#000]'
                      : 'text-slate-500 hover:text-black hover:bg-slate-200/50'
                  }`}
                >
                  Mundial Libre ({allGlobalPlayers.length})
                </button>
              </div>

              {/* Search bar inside selection modal */}
              <div className="mb-3">
                <input 
                  type="text"
                  placeholder="Buscar jugador, país o posición..."
                  value={playerSearchQuery}
                  onChange={(e) => setPlayerSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-black rounded-xl px-3 py-1.5 text-xs font-sans font-bold text-black focus:outline-none focus:border-indigo-500 placeholder-slate-400"
                />
              </div>

              {/* Player list container */}
              <div className="max-h-[300px] overflow-y-auto flex flex-col gap-2.5 pr-2">
                {selectablePlayers.length === 0 ? (
                  <div className="text-center py-8 text-xs font-comic font-bold text-slate-400">
                    {scoutingMode === 'owned' ? (
                      <div className="space-y-2">
                        <p>⚠️ No tienes stickers desbloqueados que coincidan.</p>
                        <button
                          type="button"
                          onClick={() => setScoutingMode('all')}
                          className="px-3 py-1 bg-indigo-100 hover:bg-indigo-200 text-indigo-900 border border-indigo-300 rounded-lg text-[10px] font-black uppercase cursor-pointer"
                        >
                          Ver modo Mundial Libre
                        </button>
                      </div>
                    ) : (
                      <p>🔍 No se encontraron jugadores para "{playerSearchQuery}"</p>
                    )}
                  </div>
                ) : (
                  selectablePlayers.map((player) => {
                    const isSelected = Object.values(selectedSpots).includes(player.id);
                    return (
                      <div 
                        key={player.id}
                        onClick={() => !isSelected && handleSelectPlayerForSpot(player.id)}
                        className={`border-2 border-black p-2.5 rounded-xl flex items-center justify-between transition-all select-none ${
                          isSelected 
                            ? 'bg-slate-100 opacity-50 cursor-not-allowed' 
                            : 'bg-white hover:bg-emerald-50/50 cursor-pointer hover:shadow-[2px_2px_0px_#000]'
                        }`}
                      >
                        <div className="text-left leading-tight min-w-0">
                          <span className="text-xs font-sans font-black uppercase block truncate">{player.name}</span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[9px] font-mono font-bold text-slate-500">{player.country}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                            <span className="text-[9.5px] font-mono font-bold text-slate-400 uppercase">{player.position}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="bg-[#FDDF2B] text-black border border-black font-mono font-black text-[10.5px] px-1.5 py-0.5 rounded">
                            {player.rating}
                          </span>
                          {isSelected && <Check className="w-4 h-4 text-green-600 stroke-[3.5]" />}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* INDIVIDUAL PLAYER TACTICS: DIRECTIONS & MARKINGS */}
          <div className="bg-white border-[3.5px] border-black rounded-3xl p-5 text-black shadow-[6px_6px_0px_rgba(0,0,0,1)]">
            <h3 className="text-xl font-bangers tracking-wide mb-3 flex items-center gap-2 uppercase border-b-2 border-black pb-2">
              <Compass className="w-5 h-5 text-amber-500 stroke-[3]" />
              <span>Estrategia Avanzada de Flechas</span>
            </h3>

            <div className="flex flex-col gap-4">
              <p className="text-[11px] font-comic font-bold text-slate-500 leading-tight">
                Mapea las direcciones de carrera individuales (8 flechas clásicas) de tus jugadores titulares para potenciar desmarques o compactar líneas.
              </p>

              {/* Roster list with details */}
              <div className="max-h-[320px] overflow-y-auto flex flex-col gap-3 pr-2 border-b border-slate-200 pb-3">
                {Object.values(selectedSpots).some(id => id !== null) ? (
                  Object.entries(selectedSpots).map(([spot, playerId]) => {
                    if (!playerId) return null;
                    const pObj = allGlobalPlayers.find(p => p.id === playerId);
                    if (!pObj) return null;

                    const activeDir = playerRunDirections[pObj.id] || 'N';
                    const activeMark = playerMarkings[pObj.id] || 'zonal';

                    return (
                      <div key={spot} className="bg-slate-50 border-2 border-black p-3.5 rounded-2xl relative">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-sans font-black uppercase text-black">{pObj.name} ({spot})</span>
                          <span className="bg-emerald-100 text-emerald-800 font-mono text-[9px] font-black px-2 py-0.5 rounded border border-emerald-300">
                            {pObj.position} · Rating {pObj.rating}
                          </span>
                        </div>

                        {/* Arrows Run Selector */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="flex flex-col gap-1">
                            <label className="text-[9px] font-mono font-black uppercase text-slate-400">Flecha Dirección de Carrera</label>
                            <div className="flex items-center gap-1">
                              <select 
                                value={activeDir}
                                onChange={(e) => setPlayerRunDirections(prev => ({ ...prev, [pObj.id]: e.target.value as RunDirection }))}
                                className="bg-white border-2 border-black rounded-lg p-1 text-[11px] font-sans font-bold flex-1 cursor-pointer"
                              >
                                {Object.entries(ARROW_PERKS).map(([dir, meta]) => (
                                  <option key={dir} value={dir}>{meta.icon} {meta.label}</option>
                                ))}
                              </select>
                            </div>
                            <span className="text-[8px] text-slate-400 font-comic font-bold leading-none mt-1">
                              {ARROW_PERKS[activeDir].desc}
                            </span>
                          </div>

                          {/* Individual Marking Selection */}
                          <div className="flex flex-col gap-1">
                            <label className="text-[9px] font-mono font-black uppercase text-slate-400">Marcaje Individual</label>
                            <select 
                              value={activeMark}
                              onChange={(e) => setPlayerMarkings(prev => ({ ...prev, [pObj.id]: e.target.value }))}
                              className="bg-white border-2 border-black rounded-lg p-1 text-[11px] font-sans font-bold cursor-pointer"
                            >
                              <option value="zonal">🛡️ Marcaje Zonal Estándar</option>
                              <option value="star1">⚡ Marcar a Delantero Estrella Rival</option>
                              <option value="wing">📐 Marcar a Extremo Rápido</option>
                              <option value="mco">🧠 Marcar a Mediapunta Creativo</option>
                            </select>
                          </div>
                        </div>

                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-xs font-comic font-bold text-slate-400">
                    Alinea jugadores en la pizarra para editar sus instrucciones individuales.
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* ACTIVE TOURNAMENT CHALLENGES LIST */}
          <div className="bg-white border-[3.5px] border-black rounded-3xl p-5 text-black shadow-[6px_6px_0px_rgba(0,0,0,1)]">
            <h3 className="text-xl font-bangers tracking-wide mb-3 flex items-center gap-2 uppercase border-b-2 border-black pb-2">
              <Trophy className="w-5 h-5 text-emerald-500 stroke-[3]" />
              <span>Desafíos Disponibles en la Arena</span>
            </h3>

            <div className="flex flex-col gap-3">
              {!isPaidUser ? (
                <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 border-2 border-black p-6 rounded-2xl text-white shadow-[4px_4px_0px_#000] text-center space-y-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 mb-1">
                    <Lock className="w-5 h-5 animate-pulse" />
                  </div>
                  <h4 className="font-bangers text-xl tracking-wide uppercase text-indigo-300">
                    🔒 Arena de Simulación Protegida
                  </h4>
                  <p className="text-xs font-comic font-bold text-slate-300 leading-relaxed">
                    La simulación de partidos contra selecciones de élite requiere un <strong>Pase de Temporada, Plan Scout Básico o Pase VIP Élite</strong> activo.
                  </p>
                  <div className="bg-slate-900/60 p-3.5 rounded-xl border border-indigo-500/20 text-left">
                    <p className="text-[10.5px] font-sans text-slate-400 leading-normal">
                      🌱 <strong>Compromiso Social de Donación:</strong> El 5% de cada pase o paquete de stickers adquirido va directamente destinado a la <strong>Fundación Guerreros de luz</strong>, ayudando a brindar implementos deportivos, indumentaria, canchas y nutrición integral de calidad a niños talentosos de escasos recursos. ¡Tu apoyo fomenta el cambio!
                    </p>
                  </div>
                  <button
                    onClick={onNavigateToVIP}
                    className="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-sans font-black text-xs uppercase rounded-xl border-2 border-black shadow-[3px_3px_0px_#000] active:translate-y-0.5 cursor-pointer transition-all"
                  >
                    Adquirir Pase / Donar Fondos
                  </button>
                </div>
              ) : (
                challenges.map((challenge) => {
                  const userRosterCount = Object.values(selectedSpots).filter(id => id !== null).length;
                  const canPlay = userRosterCount === 11;

                  return (
                    <div key={challenge.id} className="border-2 border-black p-4 rounded-2xl bg-slate-50 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl bg-white border-2 border-black rounded-xl p-2 shadow-[2px_2px_0px_#000]">{challenge.opponentLogo}</span>
                        <div className="text-left leading-tight">
                          <span className="text-xs font-sans font-black uppercase block">{challenge.opponentName}</span>
                          <span className="text-[10px] font-mono font-bold text-slate-500 block">Dificultad de Arena: {challenge.opponentRating} Rating</span>
                          {challenge.played && (
                            <span className={`text-[9px] font-mono font-black uppercase mt-1 px-2 py-0.5 rounded border inline-block ${
                              challenge.scoreLocal! > challenge.scoreVisitante! 
                                ? 'bg-green-100 text-green-800 border-green-300' 
                                : challenge.scoreLocal! === challenge.scoreVisitante!
                                ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                                : 'bg-red-100 text-red-800 border-red-300'
                            }`}>
                              Resultado: {challenge.scoreLocal} - {challenge.scoreVisitante}
                            </span>
                          )}
                        </div>
                      </div>

                      <div>
                        {challenge.played ? (
                          <button 
                            onClick={() => {
                              setActiveChallenge(challenge);
                              setSimResult(challenge.simulationResult || null);
                              setShowSimModal(true);
                            }}
                            className="bg-white hover:bg-slate-100 text-black border-2 border-black font-sans font-black text-[10px] uppercase px-3 py-1.5 rounded-lg shadow-[2px_2px_0px_#000] cursor-pointer flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Ver</span>
                          </button>
                        ) : (
                          <button
                            disabled={!canPlay}
                            onClick={() => handleSimulateChallenge(challenge)}
                            className={`font-sans font-black text-[10px] uppercase px-4 py-2 border-2 border-black rounded-lg shadow-[2px_2px_0px_#000] cursor-pointer flex items-center gap-1.5 transition-all ${
                              canPlay 
                                ? 'bg-[#22c55e] hover:bg-[#1a9e4a] text-black active:translate-y-0.5' 
                                : 'bg-slate-300 text-slate-500 cursor-not-allowed opacity-60'
                            }`}
                          >
                            <Play className="w-3 h-3 fill-current" />
                            <span>Desafiar</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>

        </div>

      </div>

      {/* 3. SIMULATION MODAL & DETAILED MATCH REPORT */}
      <AnimatePresence>
        {showSimModal && activeChallenge && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="max-w-4xl w-full bg-[#0a0f0d] border-[4px] border-black p-6 rounded-3xl shadow-[8px_8px_0px_rgba(0,0,0,1)] text-white relative max-h-[90vh] overflow-y-auto"
            >
              <button 
                onClick={() => setShowSimModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer z-10"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Simulation State Header */}
              {simulating ? (
                <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
                  <div className="relative w-20 h-20 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-4 border-dashed border-emerald-500 animate-spin" />
                    <span className="text-3xl animate-bounce">⚽</span>
                  </div>
                  <h3 className="text-2xl font-bangers text-[#22c55e] tracking-wider uppercase">SIMULANDO ENCUENTRO EN TIEMPO REAL</h3>
                  <p className="text-xs font-comic text-slate-400 max-w-sm">
                    SophIA está cruzando las estadísticas de tus tarjetas alineadas con tus flechas de estrategia táctica para computar los marcadores...
                  </p>
                </div>
              ) : (
                simResult && (
                  <div className="flex flex-col gap-6">
                    
                    {/* Visual Scoreboard (Claymorphism style) */}
                    <div className="bg-white border-4 border-black p-6 rounded-3xl text-black shadow-[6px_6px_0px_#22c55e] flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
                      {/* Left Badge */}
                      <div className="text-center sm:text-left leading-tight">
                        <span className="text-3xl block">{escudoSeed}</span>
                        <span className="text-lg font-sans font-black uppercase text-black block mt-1">{clubName}</span>
                        <span className="text-[10px] font-mono text-slate-500 font-bold block uppercase mt-0.5">Local (Tu Club)</span>
                      </div>

                      {/* SCOREBOARD NUMBERS */}
                      <div className="flex items-center gap-6 select-none bg-slate-100 px-6 py-3 border-2 border-black rounded-2xl shadow-[3px_3px_0px_#000]">
                        <span className="text-5xl font-bangers text-black leading-none">{simResult.goalsLocal}</span>
                        <span className="text-2xl font-mono text-slate-400 font-bold">:</span>
                        <span className="text-5xl font-bangers text-black leading-none">{simResult.goalsVisitante}</span>
                      </div>

                      {/* Right Badge */}
                      <div className="text-center sm:text-right leading-tight">
                        <span className="text-3xl block">{activeChallenge.opponentLogo}</span>
                        <span className="text-lg font-sans font-black uppercase text-black block mt-1">{activeChallenge.opponentName}</span>
                        <span className="text-[10px] font-mono text-slate-500 font-bold block uppercase mt-0.5">Visitante (Rival)</span>
                      </div>
                    </div>

                    {/* STATS COMPARISON CHARTS & PREDICTIVE HEAT MAPS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                      
                      {/* Match stats progress */}
                      <div className="bg-white/5 border-2 border-black p-5 rounded-2xl shadow-[3px_3px_0px_#000]">
                        <h4 className="text-xs font-sans font-black uppercase text-[#FDDF2B] tracking-wider mb-4 border-b border-white/10 pb-2">Estadísticas del Encuentro</h4>
                        <div className="flex flex-col gap-4">
                          
                          {/* Possession */}
                          <div className="flex flex-col gap-1">
                            <div className="flex justify-between text-[11px] font-mono font-bold text-slate-300">
                              <span>Posesión: {simResult.possessionLocal}%</span>
                              <span>{simResult.possessionVisitante}%</span>
                            </div>
                            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden flex border border-black">
                              <div className="bg-emerald-500 h-full" style={{ width: `${simResult.possessionLocal}%` }} />
                              <div className="bg-[#EF4444] h-full" style={{ width: `${simResult.possessionVisitante}%` }} />
                            </div>
                          </div>

                          {/* Shots */}
                          <div className="flex flex-col gap-1">
                            <div className="flex justify-between text-[11px] font-mono font-bold text-slate-300">
                              <span>Remates: {simResult.shotsLocal}</span>
                              <span>{simResult.shotsVisitante}</span>
                            </div>
                            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden flex border border-black">
                              <div 
                                className="bg-emerald-500 h-full" 
                                style={{ width: `${(simResult.shotsLocal / (simResult.shotsLocal + simResult.shotsVisitante || 1)) * 100}%` }} 
                              />
                              <div 
                                className="bg-[#EF4444] h-full" 
                                style={{ width: `${(simResult.shotsVisitante / (simResult.shotsLocal + simResult.shotsVisitante || 1)) * 100}%` }} 
                              />
                            </div>
                          </div>

                          {/* Win probability breakdown */}
                          <div className="flex justify-around items-center mt-3 bg-white/5 p-3 rounded-xl border border-white/10">
                            <div className="text-center">
                              <span className="text-[9px] font-mono font-bold text-slate-400 block uppercase">Tu Victoria</span>
                              <span className="text-sm font-sans font-black text-emerald-400 block">{simResult.victoryChanceLocal}%</span>
                            </div>
                            <div className="text-center border-l border-white/15 pl-4">
                              <span className="text-[9px] font-mono font-bold text-slate-400 block uppercase">Victoria Rival</span>
                              <span className="text-sm font-sans font-black text-rose-400 block">{simResult.victoryChanceVisitante}%</span>
                            </div>
                          </div>

                        </div>
                      </div>

                      {/* PREDICTIVE HEAT MAPS (8X8 GRID CELLS) */}
                      <div className="bg-white/5 border-2 border-black p-5 rounded-2xl shadow-[3px_3px_0px_#000] relative overflow-hidden">
                        <h4 className="text-xs font-sans font-black uppercase text-emerald-400 tracking-wider mb-4 border-b border-white/10 pb-2 flex items-center gap-1">
                          <Gauge className="w-4 h-4 text-emerald-400" />
                          <span>Mapa de Calor Predictivo de SophIA</span>
                        </h4>
                        
                        <div className={`flex justify-around gap-4 ${!isPaidUser ? 'blur-sm select-none pointer-events-none opacity-20' : ''}`}>
                          {/* Local heat map */}
                          <div className="text-center">
                            <span className="text-[9px] font-mono font-black text-slate-400 block mb-2 uppercase">Tu Posesión</span>
                            <div className="grid grid-cols-5 gap-0.5 border border-white/10 p-1 bg-black rounded-lg">
                              {Array.from({ length: 5 }).map((_, r) => 
                                Array.from({ length: 5 }).map((_, c) => {
                                  const density = simResult.heatMapLocal[r]?.[c] || 10;
                                  // Color scale based on density
                                  let bgClass = 'bg-emerald-950/25';
                                  if (density > 50) bgClass = 'bg-emerald-400 animate-pulse';
                                  else if (density > 40) bgClass = 'bg-emerald-500';
                                  else if (density > 25) bgClass = 'bg-emerald-700';
                                  else if (density > 15) bgClass = 'bg-emerald-900';

                                  return <div key={`${r}-${c}`} className={`w-5.5 h-5.5 rounded-sm ${bgClass}`} title={`Densidad: ${density}`} />;
                                })
                              )}
                            </div>
                          </div>

                          {/* Visitante heat map */}
                          <div className="text-center">
                            <span className="text-[9px] font-mono font-black text-slate-400 block mb-2 uppercase">Ataque Rival</span>
                            <div className="grid grid-cols-5 gap-0.5 border border-white/10 p-1 bg-black rounded-lg">
                              {Array.from({ length: 5 }).map((_, r) => 
                                Array.from({ length: 5 }).map((_, c) => {
                                  const density = simResult.heatMapVisitante[r]?.[c] || 10;
                                  let bgClass = 'bg-rose-950/25';
                                  if (density > 50) bgClass = 'bg-rose-400 animate-pulse';
                                  else if (density > 40) bgClass = 'bg-rose-500';
                                  else if (density > 25) bgClass = 'bg-rose-700';
                                  else if (density > 15) bgClass = 'bg-rose-900';

                                  return <div key={`${r}-${c}`} className={`w-5.5 h-5.5 rounded-sm ${bgClass}`} title={`Densidad: ${density}`} />;
                                })
                              )}
                            </div>
                          </div>
                        </div>

                        {!isPaidUser && (
                          <div className="absolute inset-0 bg-black/85 backdrop-blur-[2px] flex flex-col items-center justify-center p-4 text-center">
                            <Lock className="w-5 h-5 text-amber-400 mb-1.5 shrink-0 animate-bounce" />
                            <span className="text-[9px] font-mono font-bold text-amber-400 uppercase tracking-widest block mb-1">Copa / Arena Premium</span>
                            <h5 className="font-sans font-black text-xs text-white uppercase tracking-wider mb-1">Mapa Predictivo de Calor</h5>
                            <p className="text-[9.5px] text-slate-300 max-w-[200px] leading-normal mb-2">
                              Adquiere el <strong>Pase Scout o VIP</strong> para analizar los recorridos de carrera y la posesión sectorizada.
                            </p>
                            <button
                              onClick={() => {
                                setShowSimModal(false);
                                if (onNavigateToVIP) onNavigateToVIP();
                              }}
                              className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-sans font-black text-[8.5px] uppercase tracking-wider rounded-lg border border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] cursor-pointer"
                            >
                              Adquirir Pase 👑
                            </button>
                          </div>
                        )}
                      </div>

                    </div>

                    {/* GOALSCORERS */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white/5 border border-white/10 p-4 rounded-xl">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest block mb-1">Goleadores Local:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {simResult.scorersLocal.length > 0 ? (
                            simResult.scorersLocal.map((sc, i) => (
                              <span key={i} className="bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded text-[11px] font-sans font-bold text-white flex items-center gap-1">⚽ {sc}</span>
                            ))
                          ) : (
                            <span className="text-slate-400 text-xs">-</span>
                          )}
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] font-mono font-bold text-rose-400 uppercase tracking-widest block mb-1">Goleadores Oponente:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {simResult.scorersVisitante.length > 0 ? (
                            simResult.scorersVisitante.map((sc, i) => (
                              <span key={i} className="bg-rose-500/10 border border-rose-500/30 px-2 py-0.5 rounded text-[11px] font-sans font-bold text-white flex items-center gap-1">⚽ {sc}</span>
                            ))
                          ) : (
                            <span className="text-slate-400 text-xs">-</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* DETAILED TACTICAL REPORT (SophIA Analysis) */}
                    <div className="bg-[#111] border-2 border-slate-800 p-5 rounded-2xl relative overflow-hidden">
                      <div className="absolute top-2 right-2 bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono font-black text-[9px] uppercase px-2 py-0.5 rounded tracking-widest flex items-center gap-1">
                        <Zap className="w-3 h-3 text-purple-400" /> REPORTE TÁCTICO PREMIUM
                      </div>
                      <h4 className="text-xs font-sans font-black uppercase text-slate-300 tracking-wider mb-2">Informe de Rendimiento de SophIA</h4>
                      
                      {isPaidUser ? (
                        <p className="text-xs font-comic text-slate-200 leading-relaxed text-left whitespace-pre-wrap">
                          {simResult.report}
                        </p>
                      ) : (
                        <div className="py-2 flex flex-col items-start gap-2.5">
                          <p className="text-xs text-slate-400 italic">
                            "Tu club saltó al terreno de juego empleando un esquema táctico fluido con presión nivel {pressureLine}/10. Para revelar los marcajes individuales detallados y el diagnóstico deportivo completo de SophIA..."
                          </p>
                          <div className="bg-purple-950/20 border border-purple-500/20 p-3.5 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 w-full text-left mt-1">
                            <div>
                              <strong className="text-[11px] text-purple-300 block uppercase font-mono tracking-wide">Desbloquear Análisis Completo</strong>
                              <p className="text-[10px] text-gray-400 leading-normal max-w-sm mt-0.5">
                                Obtén SophIA Analyst Report para saber con precisión científica por qué ganaste, empataste o perdiste y corregir tus flechas.
                              </p>
                            </div>
                            <button
                              onClick={() => {
                                setShowSimModal(false);
                                if (onNavigateToVIP) onNavigateToVIP();
                              }}
                              className="px-3.5 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-500 hover:scale-[1.03] transition duration-150 text-white font-sans font-black text-[9.5px] uppercase tracking-wider rounded-lg border border-black shadow-[2px_2px_0_#000] cursor-pointer"
                            >
                              Ver Planes 🔑
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Rewards Info if any */}
                    {activeChallenge.played && (
                      <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-yellow-500 shrink-0" />
                          <span className="text-xs font-comic font-bold text-emerald-400">¡Reto Registrado! El resultado ha sido acreditado en la clasificación global.</span>
                        </div>
                        <div className="flex gap-3 text-xs font-mono font-black">
                          <span className="text-green-400">+{activeChallenge.xpAwarded} XP</span>
                          <span className="text-yellow-400">+{activeChallenge.coinsAwarded} Puntos</span>
                        </div>
                      </div>
                    )}

                  </div>
                )
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
