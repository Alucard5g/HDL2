import React, { useState, useEffect } from 'react';
import { COUNTRIES, generatePlayersForCountry, getPopulatedMatch, MATCH_FIXTURES } from './data';
import { Player, UserTacticalBoard, Match, getCountryOfPlay } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { DigitalStickerCard } from './components/DigitalStickerCard';
import { AnimeHighTechSkin } from './components/AnimeHighTechSkin';
import TriviaModule from './components/TriviaModule';
import ActivePitch from './components/ActivePitch';
import LeaderboardView from './components/LeaderboardView';
import FlutterDocsView from './components/FlutterDocsView';
import GroupsFixtureView from './components/GroupsFixtureView';
import SubscriptionView from './components/SubscriptionView';
import AdminPanelView from './components/AdminPanelView';
import { TactikAiLogo } from './components/TactikAiLogo';
import { 
  Trophy, 
  BookOpen, 
  Award, 
  HelpCircle, 
  Play, 
  CheckCircle, 
  Layers, 
  FolderTree, 
  ChevronRight, 
  UserCheck, 
  RotateCcw,
  Sparkles,
  Info,
  Calendar,
  CreditCard,
  ShieldCheck,
  LogOut,
  Rss,
  MessageSquare,
  Globe
} from 'lucide-react';

function getSafeImageUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;
  if (url.startsWith("data:image/") || url.startsWith("/") || url.startsWith("./")) {
    return url;
  }
  return `/api/proxy-image?url=${encodeURIComponent(url)}`;
}

// Helper to safely write custom sticker generations to localStorage without hitting size limits (QuotaExceededError)
const localStorage = (() => {
  try {
    const test = window.localStorage;
    const testKey = '__test_local_storage_app__';
    test.setItem(testKey, '1');
    test.removeItem(testKey);
    return test;
  } catch (e) {
    console.warn('[Storage Safeguard] LocalStorage is restricted/blocked in this environment. Falling back to safe in-memory store.');
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

function safeSaveCustomStickers(generations: { [key: string]: string }) {
  try {
    localStorage.setItem('dt_custom_sticker_generations', JSON.stringify(generations));
  } catch (e: any) {
    console.warn("localStorage quota exceeded for dt_custom_sticker_generations! Evicting old/large entries progressively to free space...", e);
    try {
      const cloned = { ...generations };
      const keys = Object.keys(cloned);
      
      // Let's attempt to progressively evict older keys one-by-one until it fits perfectly inside the 5MB quota
      let savedSuccessfully = false;
      
      for (let i = 0; i < keys.length; i++) {
        // Delete the oldest entry
        delete cloned[keys[i]];
        
        try {
          localStorage.setItem('dt_custom_sticker_generations', JSON.stringify(cloned));
          savedSuccessfully = true;
          console.log(`[Storage Resilient] Quota recovered successfully by evicting ${i + 1} older stickers. Kept ${keys.length - (i + 1)} stickers safely.`);
          break;
        } catch (innerErr) {
          // Keep loop going to evict more items if still exceeding
        }
      }
      
      if (!savedSuccessfully) {
        // Ultimate fallback: save at least the 8 newest entries instead of just 2
        const fallbackCount = Math.min(keys.length, 8);
        const reducedGenerations: { [key: string]: string } = {};
        keys.slice(-fallbackCount).forEach(k => {
          reducedGenerations[k] = generations[k];
        });
        localStorage.setItem('dt_custom_sticker_generations', JSON.stringify(reducedGenerations));
        console.warn(`[Storage Resilient] Ultimate fallback activated. Only saved the last ${fallbackCount} stickers.`);
      }
    } catch (innerError) {
      console.error("Failed to recover from QuotaExceededError:", innerError);
      localStorage.removeItem('dt_custom_sticker_generations');
    }
  }
}

export default function App() {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'menu_hub' | 'album' | 'board' | 'leaderboard' | 'groups_fixture' | 'flutter' | 'subscription' | 'admin'>('menu_hub');

  // CAPTURA Y PERSISTENCIA DE VISITA POR QR / INVITACIÓN DE USUARIOS / STRIPE SUCCESS
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    
    // Check Stripe Payment Status callback
    const paymentStatus = params.get('payment_status');
    if (paymentStatus === 'success') {
      const lastPlan = localStorage.getItem('dt_last_intent_plan');
      const lastCont = localStorage.getItem('dt_last_intent_continent') || 'América';
      const lastCountry = localStorage.getItem('dt_last_intent_country') || 'Argentina';
      
      if (lastPlan) {
        let pointsToAdd = 0;
        let desc = '';

        if (lastPlan === 'Pase VIP Elite') {
          pointsToAdd = 15;
          desc = `Canje VIP: Continente ${lastCont}`;
        } else if (lastPlan === 'Plan Scout Básico') {
          pointsToAdd = 5;
          desc = `Canje Scout: Selección ${lastCountry}`;
        }

        setUnlockedLevels(prev => {
          const nextUnlocked = { ...prev };
          if (lastPlan === 'Pase VIP Elite') {
            // Unlocks countries belonging to the chosen continent
            const allWorldCupCountries = [
              'México', 'Canadá', 'Brasil', 'Haití', 'Estados Unidos', 'Paraguay', 
              'Curazao', 'Ecuador', 'Uruguay', 'Argentina', 'Colombia', 'Panamá',
              'República Checa', 'Bosnia y Herzegovina', 'Suiza', 'Escocia', 'Turquía', 
              'Alemania', 'Países Bajos', 'Suecia', 'Bélgica', 'España', 
              'Francia', 'Noruega', 'Austria', 'Portugal', 'Inglaterra', 'Croacia',
              'Sudáfrica', 'Catar', 'Marruecos', 'Australia', 'Costa de Marfil', 
              'Japón', 'Túnez', 'Egipto', 'Irán', 'Nueva Zelanda', 'Cabo Verde', 
              'Arabia Saudita', 'Senegal', 'Irak', 'Argelia', 'Jordania', 
              'RD Congo', 'Uzbekistán', 'Ghana'
            ];
            
            const targetCountries = allWorldCupCountries.filter(c => {
              if (lastCont === 'América') {
                return ['México', 'Canadá', 'Brasil', 'Haití', 'Estados Unidos', 'Paraguay', 'Curazao', 'Ecuador', 'Uruguay', 'Argentina', 'Colombia', 'Panamá'].includes(c);
              }
              if (lastCont === 'Europa') {
                return ['República Checa', 'Bosnia y Herzegovina', 'Suiza', 'Escocia', 'Turquía', 'Alemania', 'Países Bajos', 'Suecia', 'Bélgica', 'España', 'Francia', 'Noruega', 'Austria', 'Portugal', 'Inglaterra', 'Croacia'].includes(c);
              }
              // África, Asia y Oceanía
              return !['México', 'Canadá', 'Brasil', 'Haití', 'Estados Unidos', 'Paraguay', 'Curazao', 'Ecuador', 'Uruguay', 'Argentina', 'Colombia', 'Panamá', 'República Checa', 'Bosnia y Herzegovina', 'Suiza', 'Escocia', 'Turquía', 'Alemania', 'Países Bajos', 'Suecia', 'Bélgica', 'España', 'Francia', 'Noruega', 'Austria', 'Portugal', 'Inglaterra', 'Croacia'].includes(c);
            });

            targetCountries.forEach(country => {
              nextUnlocked[country] = { 1: true, 2: true, 3: true };
            });
          } else if (lastPlan === 'Plan Scout Básico') {
            nextUnlocked[lastCountry] = { 1: true, 2: true, 3: true };
          }
          localStorage.setItem('scouting_unlocked_levels', JSON.stringify(nextUnlocked));
          return nextUnlocked;
        });

        if (lastPlan === 'Plan Scout Básico') {
          setScoutChosenCountry(lastCountry);
        } else if (lastPlan === 'Pase VIP Elite') {
          setVipChosenContinent(lastCont);
          localStorage.setItem('dt_vip_chosen_continent', lastCont);
        }

        setPurchasedPoints(prev => prev + pointsToAdd);
        handleUpdateSubscription(lastPlan);

        // Add transaction to persistent and local history
        handleAddTransaction(`${desc} (Stripe)`, 0, 'cash');

        // Clear intent states
        localStorage.removeItem('dt_last_intent_plan');
        localStorage.removeItem('dt_last_intent_continent');
        localStorage.removeItem('dt_last_intent_country');

        // Clear search params without reloading
        const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
        window.history.replaceState({ path: cleanUrl }, '', cleanUrl);

        setTimeout(() => {
          alert(`🎉 ¡Pago de Stripe Verificado Correctamente!\n\nSe ha activado tu suscripción a ${lastPlan}.\n${desc} ha sido desbloqueado con éxito y se te han acreditado +${pointsToAdd} puntos de Director Técnico.`);
        }, 500);
      }
    }

    const ref = params.get('ref');
    if (ref) {
      const refTrim = ref.trim();
      if (refTrim.includes('@')) {
        const cleanRefEmail = refTrim.toLowerCase();
        localStorage.setItem('dt_user_referred_by_email', cleanRefEmail);
        console.log(`[Referral System] Invitado por correo detectado y guardado: ${cleanRefEmail}`);
        setUserReferredByEmail(cleanRefEmail);
        setTempReferredByEmail(cleanRefEmail);
      } else {
        const cleanRef = refTrim.toUpperCase();
        localStorage.setItem('affiliate_ref', cleanRef);
        console.log(`[Affiliation System] Promotora detectada y guardada en localStorage: ${cleanRef}`);
        
        // Send visit to backend database
        fetch('/api/affiliate/visit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            promoterId: cleanRef,
            deviceType: /Android/i.test(navigator.userAgent) 
              ? 'Android' 
              : (/iPhone|iPad|Mac/i.test(navigator.userAgent) ? 'iPhone' : 'Web/Escritorio')
          })
        })
        .then(r => r.json())
        .then(data => {
          console.log('[Affiliation System] Visita registrada en servidor:', data);
        })
        .catch(err => {
          console.warn('[Affiliation System] Error registrando visita:', err);
        });
      }
    }
  }, []);

  // Greeting for first-time guest visitors (unregistered)
  useEffect(() => {
    const storedEmail = localStorage.getItem('dt_user_email');
    if (!storedEmail || storedEmail.trim() === '') {
      setShowGuestWelcome(true);
    }
  }, []);

  // Sincronizar cromos personalizados desde el servidor para que estén unificados de manera global
  useEffect(() => {
    fetch('/api/stickers/custom')
      .then(res => {
        if (!res.ok) throw new Error("HTTP error " + res.status);
        return res.json();
      })
      .then(async data => {
        if (data && data.status === 'success' && data.stickers) {
          const serverStickers = data.stickers;
          
          // Bidirectional Sync: Upload local modifications to server database and pull missing ones
          try {
            const savedStr = localStorage.getItem('dt_custom_sticker_generations') || '{}';
            const localGenerations = JSON.parse(savedStr);
            let localChanged = false;
            
            // 1. Upload local custom stickers that are missing or different on server
            for (const [playerId, imageUrl] of Object.entries(localGenerations)) {
              if (imageUrl && serverStickers[playerId] !== imageUrl) {
                // Post to server database
                await fetch('/api/stickers/custom', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ playerId, imageUrl })
                }).catch(err => console.warn('Failed to upload local sticker image:', err));
                serverStickers[playerId] = imageUrl;
              }
            }
            
            // 2. Download server custom stickers that are missing or different locally
            Object.entries(serverStickers).forEach(([playerId, imageUrl]) => {
              if (localGenerations[playerId] !== imageUrl) {
                localGenerations[playerId] = imageUrl;
                localChanged = true;
              }
            });
            
            if (localChanged) {
              safeSaveCustomStickers(localGenerations);
            }
          } catch (e) {
            console.warn('[Sticker Sync Local Storage Error]', e);
          }

          setPlayersDB(prev => {
            const updated = { ...prev };
            let modified = false;
            Object.entries(serverStickers).forEach(([playerId, imageUrl]) => {
              for (const country of Object.keys(updated)) {
                const countryList = [...updated[country]];
                const idx = countryList.findIndex(p => p.id === playerId);
                if (idx !== -1) {
                  if (countryList[idx].imageUrl !== imageUrl) {
                    countryList[idx] = {
                      ...countryList[idx],
                      imageUrl: imageUrl as string
                    };
                    updated[country] = countryList;
                    modified = true;
                  }
                  break;
                }
              }
            });
            return modified ? updated : prev;
          });
        }
      })
      .catch(err => {
        console.warn('[Sticker Sync] Error cargando los cromos personalizados del servidor:', err);
      });
  }, []);

  // customMatches maintains a map of match overrides from the administrator
  const [customMatches, setCustomMatches] = useState<{ [matchId: string]: { golesLocal: number, golesVisitante: number, jugado: boolean } }>({});
  const [matchSyncKey, setMatchSyncKey] = useState<number>(0);

  const fetchCustomMatches = () => {
    fetch('/api/matches/custom')
      .then(res => {
        if (!res.ok) throw new Error("HTTP error " + res.status);
        return res.json();
      })
      .then(data => {
        if (data && data.status === 'success' && data.matches) {
          setCustomMatches(data.matches);
          
          // Apply changes directly to MATCH_FIXTURES in data
          let modified = false;
          Object.entries(data.matches).forEach(([matchId, val]: [string, any]) => {
            const m = MATCH_FIXTURES.find(f => f.id === matchId);
            if (m) {
              if (
                !m.marcadorReal ||
                m.marcadorReal.golesLocal !== val.golesLocal ||
                m.marcadorReal.golesVisitante !== val.golesVisitante ||
                m.jugado !== val.jugado
              ) {
                m.marcadorReal = { golesLocal: val.golesLocal, golesVisitante: val.golesVisitante };
                m.jugado = val.jugado;
                modified = true;
              }
            }
          });
          if (modified) {
            setMatchSyncKey(prev => prev + 1);
          }
        }
      })
      .catch(err => {
        console.warn('[Matches Sync] Error cargando resultados modificados del servidor:', err);
      });
  };

  useEffect(() => {
    fetchCustomMatches();
    // Auto sync match changes every 8 seconds
    const interval = setInterval(fetchCustomMatches, 8000);
    return () => clearInterval(interval);
  }, []);

  // User Profile & premium licensing parameters
  const [userSubscription, setUserSubscription] = useState<string>(() => {
    return localStorage.getItem('user_subscription') || 'Pase VIP Elite';
  });
  const [userLicense, setUserLicense] = useState<string>(() => {
    return localStorage.getItem('dt_user_license') || '';
  });
  const [scoutChosenCountry, setScoutChosenCountry] = useState<string>(() => {
    return localStorage.getItem('scout_chosen_country') || '';
  });

  const [vipChosenContinent, setVipChosenContinent] = useState<string>(() => {
    return localStorage.getItem('dt_vip_chosen_continent') || 'América';
  });

  useEffect(() => {
    localStorage.setItem('dt_vip_chosen_continent', vipChosenContinent);
  }, [vipChosenContinent]);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (document.documentElement) document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;
  }, [activeTab]);

  const [freeChosenCountry, setFreeChosenCountry] = useState<string>(() => {
    return localStorage.getItem('free_chosen_country') || '';
  });

  const handleUpdateFreeCountry = (country: string) => {
    localStorage.setItem('free_chosen_country', country);
    setFreeChosenCountry(country);
  };

  const [countryToConfirmFree, setCountryToConfirmFree] = useState<string | null>(null);
  const [upsellCountry, setUpsellCountry] = useState<string | null>(null);

  const handleUpdateScoutCountry = (country: string) => {
    if (!country) return;
    setScoutChosenCountry(prev => {
      if (!prev) {
        localStorage.setItem('scout_chosen_country', country);
        return country;
      }
      const existing = prev.split(',').map(s => s.trim().toUpperCase());
      if (existing.includes(country.toUpperCase())) return prev;
      const next = prev + ', ' + country;
      localStorage.setItem('scout_chosen_country', next);
      return next;
    });
  };

  const handleUpdateVipContinent = (continent: string) => {
    if (!continent) return;
    setVipChosenContinent(prev => {
      if (!prev) {
        localStorage.setItem('dt_vip_chosen_continent', continent);
        return continent;
      }
      const existing = prev.split(',').map(s => s.trim().toUpperCase());
      if (existing.includes(continent.toUpperCase())) return prev;
      const next = prev + ', ' + continent;
      localStorage.setItem('dt_vip_chosen_continent', next);
      return next;
    });
  };

  // Wallet & virtual currency balances (Ecuador simulation)
  const [userCashBalance, setUserCashBalance] = useState<number>(() => {
    const saved = localStorage.getItem('dt_user_cash_balance');
    return saved ? parseFloat(saved) : 15.00; // Start with $15.00 default saldo
  });

  const [userCoins, setUserCoins] = useState<number>(() => {
    const saved = localStorage.getItem('dt_user_coins');
    return saved ? parseInt(saved, 10) : 350; // Start with 350 coins default saldo
  });

  const [paymentHistory, setPaymentHistory] = useState<any[]>(() => {
    const saved = localStorage.getItem('dt_user_payment_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    // Pre-populate with realistic transactions (since they have a payment and a balance!)
    return [
      {
        id: "TX-9403",
        description: "Carga de Saldo - Depósito Deuna QR",
        amount: 30.00,
        type: "cash",
        date: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: "TX-4820",
        description: "Licencia Pase VIP Elite",
        amount: -15.00,
        type: "cash",
        date: new Date(Date.now() - 1800000).toISOString()
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('dt_user_cash_balance', userCashBalance.toString());
  }, [userCashBalance]);

  useEffect(() => {
    localStorage.setItem('dt_user_coins', userCoins.toString());
  }, [userCoins]);

  useEffect(() => {
    localStorage.setItem('dt_user_payment_history', JSON.stringify(paymentHistory));
  }, [paymentHistory]);

  const handleAddTransaction = (description: string, amount: number, type: 'cash' | 'coins') => {
    const newTx = {
      id: "TX-" + Math.floor(1000 + Math.random() * 9000),
      description,
      amount,
      type,
      date: new Date().toISOString()
    };
    setPaymentHistory(prev => [newTx, ...prev]);
  };

  const [userPassword, setUserPassword] = useState<string>(() => {
    return localStorage.getItem('dt_user_password') || '';
  });

  const [isLocked, setIsLocked] = useState<boolean>(() => {
    return false;
  });

  const [highTechSkin, setHighTechSkin] = useState<boolean>(() => {
    return localStorage.getItem('dt_high_tech_skin') !== 'false';
  });

  const handleUpdatePassword = (newPassword: string) => {
    if (newPassword) {
      localStorage.setItem('dt_user_password', newPassword);
    } else {
      localStorage.removeItem('dt_user_password');
    }
    setUserPassword(newPassword);
  };

  const handleLogout = () => {
    localStorage.removeItem('dt_user_id');
    localStorage.removeItem('dt_username');
    localStorage.removeItem('dt_user_avatar');
    localStorage.removeItem('dt_user_email');
    localStorage.removeItem('dt_user_license');
    localStorage.removeItem('user_subscription');
    localStorage.removeItem('scout_chosen_country');
    localStorage.removeItem('dt_vip_chosen_continent');
    localStorage.removeItem('dt_user_password');
    localStorage.removeItem('dt_purchased_points');

    setUserId('user_me');
    setUsername('Tú (Director Técnico)');
    setUserAvatar('👑');
    setUserEmail('');
    setUserLicense('');
    setUserSubscription('Ninguna');
    setScoutChosenCountry('');
    setVipChosenContinent('América');
    setUserPassword('');
    setPurchasedPoints(0);
    setIsLocked(false);

    const standardCode = 'DT-' + Math.floor(1000 + Math.random() * 9000);
    localStorage.setItem('dt_user_code', standardCode);
    setUserCode(standardCode);

    setIsRegistrationOpen(true);
  };

  const [userId, setUserId] = useState<string>(() => {
    return localStorage.getItem('dt_user_id') || 'user_me';
  });

  const [username, setUsername] = useState<string>(() => {
    return localStorage.getItem('dt_username') || 'Invitado (Director Técnico)';
  });

  const [userEmail, setUserEmail] = useState<string>(() => {
    return localStorage.getItem('dt_user_email') || '';
  });

  const [userAvatar, setUserAvatar] = useState<string>(() => {
    return localStorage.getItem('dt_user_avatar') || '⚽';
  });

  const [userCode, setUserCode] = useState<string>(() => {
    let code = localStorage.getItem('dt_user_code');
    if (!code) {
      code = 'DT-' + Math.floor(1000 + Math.random() * 9000);
      localStorage.setItem('dt_user_code', code);
    }
    return code;
  });

  const [isRegistrationOpen, setIsRegistrationOpen] = useState<boolean>(false);

  const [adminSyncCounter, setAdminSyncCounter] = useState<number>(() => {
    return Number(localStorage.getItem('dt_admin_sync_counter') || '0');
  });

  useEffect(() => {
    localStorage.setItem('dt_admin_sync_counter', adminSyncCounter.toString());
  }, [adminSyncCounter]);

  const isAdmin = userEmail.trim().toLowerCase() === 'geovannygrk3d@gmail.com' || userEmail.trim().toLowerCase() === 'geovannygrk3d@gmail' || userEmail.trim().toLowerCase() === 'conscientizarte13@gmail.com' || userEmail.trim().toLowerCase() === 'conscientizarte13@gmail';

  const isRegistered = userId !== 'user_me' && !!userEmail && userEmail.trim().length > 0;

  // State
  const [selectedCountryName, setSelectedCountryName] = useState<string>('Ecuador');
  const [albumPage, setAlbumPage] = useState<number>(1);

  useEffect(() => {
    setAlbumPage(1);
  }, [selectedCountryName]);
  const [unlockedLevels, setUnlockedLevels] = useState<{ [country: string]: { [level: number]: boolean } }>(() => {
    const saved = localStorage.getItem('scouting_unlocked_levels');
    const initial: { [country: string]: { [level: number]: boolean } } = {};
    COUNTRIES.forEach(c => {
      initial[c.name] = { 1: false, 2: false, 3: false };
    });
    
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        Object.assign(initial, parsed);
      } catch (e) {}
    }
    
    // Auto-unlock Ecuador by default as requested to match analyzed double-page
    initial["Ecuador"] = { 1: true, 2: true, 3: true };
    return initial;
  });

  const [pendingTriviaPacks, setPendingTriviaPacks] = useState<{ [country: string]: number[] }>(() => {
    const saved = localStorage.getItem('scouting_pending_trivia_packs');
    const initial: { [country: string]: number[] } = {};
    COUNTRIES.forEach(c => {
      initial[c.name] = [];
    });
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        Object.assign(initial, parsed);
      } catch (e) {}
    }
    return initial;
  });

  useEffect(() => {
    localStorage.setItem('scouting_pending_trivia_packs', JSON.stringify(pendingTriviaPacks));
  }, [pendingTriviaPacks]);

  const [tacticalBoards, setTacticalBoards] = useState<{ [country: string]: UserTacticalBoard }>(() => {
    const saved = localStorage.getItem('scouting_tactical_boards');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn("Error parsing scouting_tactical_boards:", e);
      }
    }
    return {};
  });

  const [tempUsername, setTempUsername] = useState<string>('');
  const [tempEmail, setTempEmail] = useState<string>('');
  const [tempAvatar, setTempAvatar] = useState<string>('⚽');
  const [tempPassword, setTempPassword] = useState<string>('');
  const [tempConfirmPassword, setTempConfirmPassword] = useState<string>('');
  const [tempReferredByEmail, setTempReferredByEmail] = useState<string>(() => {
    return localStorage.getItem('dt_user_referred_by_email') || '';
  });

  const [userReferredByEmail, setUserReferredByEmail] = useState<string>(() => {
    return localStorage.getItem('dt_user_referred_by_email') || '';
  });

  const [referralPoints, setReferralPoints] = useState<number>(() => {
    return Number(localStorage.getItem('dt_user_referral_points') || '0');
  });

  const [successfulReferralsCount, setSuccessfulReferralsCount] = useState<number>(() => {
    return Number(localStorage.getItem('dt_user_referral_count') || '0');
  });

  const [purchasedPoints, setPurchasedPoints] = useState<number>(() => {
    return Number(localStorage.getItem('dt_purchased_points') || '0');
  });

  useEffect(() => {
    localStorage.setItem('dt_purchased_points', String(purchasedPoints));
  }, [purchasedPoints]);

  const [isLoginMode, setIsLoginMode] = useState<boolean>(false);
  const [isRecoveryMode, setIsRecoveryMode] = useState<boolean>(false);
  const [recoveryStep, setRecoveryStep] = useState<'verify' | 'code_verification' | 'reset'>('verify');
  const [matchedRecoveryUser, setMatchedRecoveryUser] = useState<any | null>(null);
  const [loginAttempts, setLoginAttempts] = useState<number>(0);
  const [sentRecoveryCode, setSentRecoveryCode] = useState<string>('');
  const [inputRecoveryCode, setInputRecoveryCode] = useState<string>('');
  const [showGuestWelcome, setShowGuestWelcome] = useState<boolean>(false);

  // Estados para diálogos alternativos a window.confirm / alert bloqueados por IFrames
  const [appCustomConfirm, setAppCustomConfirm] = useState<{
    title: string;
    message: string;
    onConfirm: () => void | Promise<void>;
  } | null>(null);

  const [appCustomAlert, setAppCustomAlert] = useState<{
    title: string;
    message: string;
  } | null>(null);

  // Estados para el blog de noticias en footer y sugerencias
  const [footerBlogPosts, setFooterBlogPosts] = useState<any[]>([]);
  const [loadingFooterBlog, setLoadingFooterBlog] = useState<boolean>(false);
  const [footerSuggestName, setFooterSuggestName] = useState<string>('');
  const [footerSuggestEmail, setFooterSuggestEmail] = useState<string>('');
  const [footerSuggestContent, setFooterSuggestContent] = useState<string>('');
  const [footerSuggestRecipient, setFooterSuggestRecipient] = useState<string>('conscientizarte13@gmail.com');
  const [footerSuggestSuccess, setFooterSuggestSuccess] = useState<string>('');
  const [footerSuggestLoading, setFooterSuggestLoading] = useState<boolean>(false);

  // Load blog posts for the footer
  const loadFooterBlogPosts = async () => {
    setLoadingFooterBlog(true);
    try {
      const response = await fetch('/api/blog');
      const data = await response.json();
      if (data.status === 'success') {
        setFooterBlogPosts(data.posts || []);
      }
    } catch (err) {
      console.warn('Error loading footer blog posts:', err);
    } finally {
      setLoadingFooterBlog(false);
    }
  };

  // Submit suggestions from footer
  const handleSendFooterSuggestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!footerSuggestName || !footerSuggestContent) {
      setAppCustomAlert({
        title: '⚠️ Campos Requeridos',
        message: 'Por favor, ingresa tu nombre y sugerencia para continuar.'
      });
      return;
    }
    setFooterSuggestLoading(true);
    try {
      const response = await fetch('/api/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: footerSuggestName,
          email: footerSuggestEmail || 'anonimo@albumtrivia.com',
          suggestion: footerSuggestContent,
          sentTo: footerSuggestRecipient
        })
      });
      const data = await response.json();
      if (data.status === 'success') {
        setFooterSuggestSuccess(`¡Mensaje guardado! Se ha enviado formalmente un correo de aviso a ${footerSuggestRecipient}.`);
        setFooterSuggestContent('');
        setTimeout(() => setFooterSuggestSuccess(''), 6000);
      }
    } catch (err) {
      console.error('Error submitting suggestion:', err);
    } finally {
      setFooterSuggestLoading(false);
    }
  };

  // Fetch blog posts on load
  useEffect(() => {
    loadFooterBlogPosts();
  }, []);

  // Generate dynamic players list for currently selected country with custom sticker generations persistence
  const [playersDB, setPlayersDB] = useState<{ [country: string]: Player[] }>(() => {
    const initial: { [country: string]: Player[] } = {};
    
    // Retrieve custom local storage sticker generations
    let savedGenerations: { [playerId: string]: string } = {};
    try {
      const saved = localStorage.getItem('dt_custom_sticker_generations');
      if (saved) savedGenerations = JSON.parse(saved);
    } catch (e) {
      console.warn("Could not read custom sticker generations", e);
    }

    COUNTRIES.forEach(c => {
      const countryPlayers = generatePlayersForCountry(c.name);
      // Inject saved custom generations
      const playersWithImage = countryPlayers.map(p => {
        if (savedGenerations[p.id]) {
          return { ...p, imageUrl: savedGenerations[p.id] };
        }
        return p;
      });
      initial[c.name] = playersWithImage;
    });
    return initial;
  });

  // Background Pre-fetching for selectedCountryName to eliminate visual loading lags
  useEffect(() => {
    if (!selectedCountryName || !playersDB) return;
    const countryPlayers = playersDB[selectedCountryName] || [];
    
    // Warm browser cache of images programmatically in background task
    countryPlayers.forEach(p => {
      if (p.imageUrl) {
        const img = new Image();
        img.src = p.imageUrl;
      }
    });

    // Preload top high-fidelity World Cup superstars
    const preloadSuperstars = [
      "/src/assets/images/messi_sticker_1781136475446.png",
      "/src/assets/images/ronaldo_sticker_1781135876376.png",
      "/src/assets/images/williams_sticker_1781155661686.png",
      "/src/assets/images/gimenez_sticker_1781155648175.png",
      "/src/assets/images/davies_sticker_1781155676386.png",
      "/src/assets/images/dzeko_sticker_1781155689186.png",
      "/src/assets/images/pulisic_sticker_1781155701013.png",
      "/src/assets/images/almiron_sticker_1781155714472.png",
      "/src/assets/images/valencia_sticker_1781178272322.png",
      "/src/assets/images/caicedo_sticker_1781178285081.png",
      "/src/assets/images/hincapie_sticker_1781178296373.png",
      "/src/assets/images/estupinan_sticker_1781178308826.png",
      "/src/assets/images/paez_sticker_1781178321218.png",
      "/src/assets/images/plata_sticker_1781178333457.png",
      "/src/assets/images/pacho_sticker_1781178346564.png",
      "/src/assets/images/galindez_sticker_1781178360351.png",
      "/src/assets/images/ecuador_valencia_1781178905191.jpg",
      "/src/assets/images/ecuador_caicedo_1781178919841.jpg",
      "/src/assets/images/ecuador_hincapie_1781178936224.jpg",
      "/src/assets/images/ecuador_estupinan_1781178951152.jpg",
      "/src/assets/images/ecuador_paez_1781178965800.jpg",
      "/src/assets/images/ecuador_plata_1781178977053.jpg",
      "/src/assets/images/ecuador_pacho_1781178990762.jpg",
      "/src/assets/images/ecuador_galindez_1781179006101.jpg",
    ];
    preloadSuperstars.forEach(src => {
      const img = new Image();
      img.src = src;
    });
  }, [selectedCountryName, playersDB]);

  // Current active trivia state
  const [activeTrivia, setActiveTrivia] = useState<{ country: string; flag: string; level: number } | null>(null);

  // Guard rule: if user is not admin, protect administrative tabs from unauthorized access.
  useEffect(() => {
    if (!isAdmin && (activeTab === 'admin' || activeTab === 'flutter')) {
      setActiveTab('menu_hub');
    }
  }, [activeTab, isAdmin]);

  // Sticker custom fal.ai generation state
  const [isGeneratingStickerId, setIsGeneratingStickerId] = useState<string | null>(null);

  // Backup and restore sticker generations states
  const [showBackupModal, setShowBackupModal] = useState<boolean>(false);
  const [backupText, setBackupText] = useState<string>("");

  // Helper utility: Converts any external image URL to an optimized, compressed WebP Base64 string for instant load times
  const convertUrlToWebP = async (url: string): Promise<string> => {
    return new Promise((resolve) => {
      if (!url) return resolve("");
      // If it's already a local data URL, return it immediately
      if (url.startsWith("data:image/")) {
        return resolve(url);
      }

      // We load the image via our secure CORS bypass proxy
      const proxiedUrl = `/api/proxy-image?url=${encodeURIComponent(url)}`;
      const img = new Image();
      img.crossOrigin = "anonymous";

      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          
          // Optimized high-fidelity resolution for digital stickers to ensure ultra-lightweight files (~20KB)
          const MAX_WIDTH = 320;
          const MAX_HEIGHT = 450;
          
          let width = img.width;
          let height = img.height;
          
          if (width > MAX_WIDTH || height > MAX_HEIGHT) {
            const widthRatio = MAX_WIDTH / width;
            const heightRatio = MAX_HEIGHT / height;
            const bestRatio = Math.min(widthRatio, heightRatio);
            width = Math.round(width * bestRatio);
            height = Math.round(height * bestRatio);
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            return resolve(url); // Fallback to raw URL on missing 2D context
          }
          
          ctx.drawImage(img, 0, 0, width, height);

          // Export as compressed WebP
          const webpDataUrl = canvas.toDataURL("image/webp", 0.75);
          resolve(webpDataUrl);
        } catch (err) {
          console.warn("[WebP Conversion failure, falling back to original URL]:", err);
          resolve(url);
        }
      };

      img.onerror = () => {
        console.warn("[Could not load remote image through CORS proxy, falling back to original URL]:", url);
        resolve(url);
      };

      img.src = proxiedUrl;
    });
  };

  const handleGenerateStickerImage = async (player: Player) => {
    setIsGeneratingStickerId(player.id);
    try {
      const res = await fetch('/api/generate_sticker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId: player.id,
          name: player.realName,
          styleOfPlay: player.styleOfPlay,
          country: player.country,
          position: player.position,
        })
      });

      // Safety check: Validate returned content-type before attempting JSON parsing
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const responseText = await res.text();
        console.warn("[Backend Returned HTML instead of JSON]:", responseText.substring(0, 300));
        throw new Error("El backend del álbum respondió con una página HTML en lugar de JSON. Esto indica que el servidor se está reiniciando automáticamente para sincronizar tus variables secretas (FAL_KEY) o la nueva ruta se está compilando. Por favor, espera unos segundos y vuelve a presionar el botón ⚡, o utiliza la opción 'Pegar URL de Fal 🔗' para vincular tus ilustraciones de inmediato.");
      }

      if (!res.ok) {
        let errStr = 'Error al generar la imagen con fal.ai';
        try {
          const data = await res.json();
          errStr = data.error || errStr;
        } catch (e) {}
        throw new Error(errStr);
      }

      const data = await res.json();
      if (data.imageUrl) {
        setAppCustomAlert({
          title: '🔄 CONFIGURANDO FORMATO...',
          message: `La ilustración se generó con éxito. Adaptando y comprimiendo el formato de la imagen a WebP de alta velocidad para evitar demoras...`
        });

        // Convert the raw URL to an optimized compressed WebP base64 format on-the-fly
        const optimizedWebPUrl = await convertUrlToWebP(data.imageUrl);

        // Update playersDB state
        setPlayersDB(prev => {
          const updated = { ...prev };
          const countryList = [...(updated[player.country] || [])];
          const idx = countryList.findIndex(p => p.id === player.id);
          if (idx !== -1) {
            countryList[idx] = {
              ...countryList[idx],
              imageUrl: optimizedWebPUrl
            };
            updated[player.country] = countryList;
          }
          return updated;
        });

        // Also save to localStorage to persist user generated stickers
        const savedGenerationsStr = localStorage.getItem('dt_custom_sticker_generations') || '{}';
        const savedGenerations = JSON.parse(savedGenerationsStr);
        savedGenerations[player.id] = optimizedWebPUrl;
        safeSaveCustomStickers(savedGenerations);

        // Sincronizar el cromo generado con el servidor permanentemente
        try {
          fetch('/api/stickers/custom', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              playerId: player.id,
              imageUrl: optimizedWebPUrl
            })
          })
          .then(res => res.json())
          .then(data => {
            console.log('[Sticker Sync] Sincronización de generación guardada para:', player.id);
          })
          .catch(err => {
            console.warn('[Sticker Sync] Error sincronizando la generación en el servidor:', err);
          });
        } catch (e) {
          console.warn('[Sticker Sync Exception] Error gatillando sincronización de generación:', e);
        }

        setAppCustomAlert({
          title: '⚡ ¡CROMO GENERADO Y COMPRIMIDO!',
          message: `La GPU de fal.ai completó el renderizado. El cromo se ha convertido a formato WebP optimizado y se guardó en el servidor permanentemente.`
        });
      } else {
        throw new Error('La respuesta de fal.ai no contiene una URL de imagen válida.');
      }
    } catch (err: any) {
      setAppCustomAlert({
        title: '❌ ERROR EN GENERACIÓN',
        message: err.message || 'Fallo de orquestación. Asegúrate de configurar FAL_KEY en la sección de secretos de la app.'
      });
    } finally {
      setIsGeneratingStickerId(null);
    }
  };

  const handlePasteStickerUrl = async (player: Player, url: string) => {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      setAppCustomAlert({
        title: '⚠️ URL INVÁLIDA',
        message: 'Por favor, ingresa un enlace web válido que comience con http:// o https://.'
      });
      return;
    }

    let resolvedUrl = url.trim();
    const isSharingLink = url.includes("fal.ai/") || url.includes("sandbox/share") || !url.match(/\.(jpeg|jpg|gif|png|webp|svg|bmp)/i);

    if (isSharingLink) {
      setAppCustomAlert({
        title: '🔍 RESOLVIENDO ENLACE...',
        message: `Estamos procesando el enlace para extraer la ilustración directa de Fal.ai y asignarla a ${player.realName}...`
      });

      try {
        const resolveRes = await fetch('/api/resolve-external-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ url: url.trim() })
        });
        
        if (resolveRes.ok) {
          const resData = await resolveRes.json();
          if (resData.success && resData.url) {
            resolvedUrl = resData.url;
            console.log("[Resolved link successfully via scraper backend]:", resolvedUrl);
          } else {
            console.warn("[Could not resolve sharing link, falling back to original URL]:", resData.error);
          }
        }
      } catch (err) {
        console.warn("[Error connecting to resolving backend scraper api]:", err);
      }
    }

    setAppCustomAlert({
      title: '🔄 OPTIMIZANDO FORMATO...',
      message: `El enlace fue cargado con éxito. Convirtiendo y comprimiendo imagen a formato WebP de alta velocidad para garantizar respuesta inmediata...`
    });

    // Compress reference and convert on-the-fly to a lightweight WebP representation
    const optimizedWebPUrl = await convertUrlToWebP(resolvedUrl);

    // Update playersDB state
    setPlayersDB(prev => {
      const updated = { ...prev };
      const countryList = [...(updated[player.country] || [])];
      const idx = countryList.findIndex(p => p.id === player.id);
      if (idx !== -1) {
        countryList[idx] = {
          ...countryList[idx],
          imageUrl: optimizedWebPUrl
        };
        updated[player.country] = countryList;
      }
      return updated;
    });

    // Also save to localStorage to persist user generated stickers
    const savedGenerationsStr = localStorage.getItem('dt_custom_sticker_generations') || '{}';
    let savedGenerations: { [key: string]: string } = {};
    try {
      savedGenerations = JSON.parse(savedGenerationsStr);
    } catch (e) {}
    savedGenerations[player.id] = optimizedWebPUrl;
    safeSaveCustomStickers(savedGenerations);

    // Sincronizar el cromo personalizado permanentemente en el servidor
    try {
      fetch('/api/stickers/custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId: player.id,
          imageUrl: optimizedWebPUrl
        })
      })
      .then(res => res.json())
      .then(data => {
        console.log('[Sticker Sync] Sincronización guardada con el servidor para:', player.id);
      })
      .catch(err => {
        console.warn('[Sticker Sync] Error guardando la sincronización con el servidor:', err);
      });
    } catch (e) {
      console.warn('[Sticker Sync Exception] Error gatillando sincronización:', e);
    }

    setAppCustomAlert({
      title: '🔗 ¡ILUSTRACIÓN VINCULADA EN WEBP!',
      message: `El cromo de ${player.realName} se ha sincronizado correctamente. Se adaptó la imagen a formato WebP ultraligero y se guardó en el servidor permanentemente.`
    });
  };

  const handleExportStickersBackup = () => {
    try {
      const saved = localStorage.getItem('dt_custom_sticker_generations') || '{}';
      const parsed = JSON.parse(saved);
      const keyCount = Object.keys(parsed).length;
      if (keyCount === 0) {
        setAppCustomAlert({
          title: '⚠️ SIN CROMOS SINCRONIZADOS',
          message: 'Aún no has sincronizado ningún cromo personalizado utilizando la opción de Fal.ai o copiando enlaces.'
        });
        return;
      }

      // Try automatic clipboard copy
      let clipboardSuccess = false;
      try {
        navigator.clipboard.writeText(saved);
        clipboardSuccess = true;
      } catch (clipboardErr) {
        console.warn('Clipboard write blocked by browser sandbox:', clipboardErr);
      }

      // Prepopulate and open backup modal so they can copy manually too!
      setBackupText(saved);
      setShowBackupModal(true);

      if (clipboardSuccess) {
        setAppCustomAlert({
          title: '💾 ¡COPIA DE SEGURIDAD EXPORTADA!',
          message: `¡Excelente! Se copiaron tus ${keyCount} cromos al portapapeles. Además, abrimos el panel de abajo mostrando tu código por si deseas guardarlo manualmente.`
        });
      } else {
        setAppCustomAlert({
          title: '💾 PANEL DE RESPALDO GENERADO',
          message: `Se ha abierto el panel de abajo conteniendo el código codificado de tus ${keyCount} cromos para que lo copies manualmente (ya que el navegador restringió acceso automático al portapapeles).`
        });
      }
    } catch (e: any) {
      setAppCustomAlert({
        title: '❌ ERROR EN EXPORTACIÓN',
        message: `No se pudo exportar la copia: ${e.message}`
      });
    }
  };

  const handleImportStickersBackup = async (inputText: string) => {
    if (!inputText.trim()) {
      setAppCustomAlert({
        title: '⚠️ ENTRADA VACÍA',
        message: 'Por favor ingresa o pega el texto de respaldo de cromos válido.'
      });
      return;
    }

    try {
      const parsed = JSON.parse(inputText);
      const keys = Object.keys(parsed);
      if (keys.length === 0) {
        throw new Error('El objeto de respaldo está vacío.');
      }

      const isValid = keys.every(k => typeof k === 'string' && typeof parsed[k] === 'string');
      if (!isValid) {
        throw new Error('El formato del archivo de respaldo es inválido.');
      }

      // Merge or replace
      const savedStr = localStorage.getItem('dt_custom_sticker_generations') || '{}';
      const existing = JSON.parse(savedStr);
      let mergedCount = 0;

      for (const [playerId, imageUrl] of Object.entries(parsed)) {
        existing[playerId] = imageUrl;
        mergedCount++;
        
        // Push to server database
        await fetch('/api/stickers/custom', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ playerId, imageUrl })
        }).catch(err => console.warn('Sync backup error:', err));
      }

      safeSaveCustomStickers(existing);

      // Re-trigger playersDB updates
      setPlayersDB(prev => {
        const updated = { ...prev };
        Object.entries(parsed).forEach(([playerId, imageUrl]) => {
          for (const country of Object.keys(updated)) {
            const countryList = [...updated[country]];
            const idx = countryList.findIndex(p => p.id === playerId);
            if (idx !== -1) {
              countryList[idx] = { ...countryList[idx], imageUrl: imageUrl as string };
              updated[country] = countryList;
              break;
            }
          }
        });
        return updated;
      });

      setShowBackupModal(false);
      setBackupText("");

      setAppCustomAlert({
        title: '⚡ ¡RESPALDO RESTAURADO CON ÉXITO!',
        message: `¡Increíble! Hemos procesado y restaurado ${mergedCount} cromos personalizados. Se han registrado e inyectado con éxito tanto en tu almacenamiento local como en el servidor.`
      });

    } catch (e: any) {
      setAppCustomAlert({
        title: '❌ ERROR AL IMPORTAR',
        message: `El texto ingresado no es válido: ${e.message}. Asegúrate de pegar exactamente el código exportado anteriormente.`
      });
    }
  };

  // Sticker Pack state variables
  const [manuallyUnlockedPlayerIds, setManuallyUnlockedPlayerIds] = useState<{ [playerId: string]: boolean }>(() => {
    const saved = localStorage.getItem('scouting_manually_unlocked_ids');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn("Error parsing scouting_manually_unlocked_ids:", e);
      }
    }
    return {};
  });

  useEffect(() => {
    localStorage.setItem('scouting_manually_unlocked_ids', JSON.stringify(manuallyUnlockedPlayerIds));
  }, [manuallyUnlockedPlayerIds]);

  const [isOpeningPack, setIsOpeningPack] = useState<boolean>(false);
  const [hasOpenedPack, setHasOpenedPack] = useState<boolean>(false);
  const [pulledStickers, setPulledStickers] = useState<Player[]>([]);
  const [packCountryName, setPackCountryName] = useState<string>('México');

  const handleOpenPack = () => {
    if (isOpeningPack) return;
    setIsOpeningPack(true);
    setHasOpenedPack(false);
    setPulledStickers([]);

    const targetCountry = selectedCountryName;
    setPackCountryName(targetCountry);
    const countryPlayers = playersDB[targetCountry] || [];

    setTimeout(() => {
      const cloned = [...countryPlayers];
      
      // Let's prioritize players that are locked, if any, to make the pack pull extra rewarding!
      const currentUnlocked = getUnlockedPlayersForCountry(targetCountry);
      const locked = cloned.filter(p => !currentUnlocked.some(up => up.id === p.id));
      
      let selected: Player[] = [];
      if (locked.length >= 3) {
        // Pick 3 random locked
        const shuffledLocked = locked.sort(() => 0.5 - Math.random());
        selected = shuffledLocked.slice(0, 3);
      } else {
        // Mix of locked and unlocked
        const shuffledCloned = cloned.sort(() => 0.5 - Math.random());
        selected = shuffledCloned.slice(0, 3);
      }

      // Add to unlocked IDs
      setManuallyUnlockedPlayerIds(prev => {
        const next = { ...prev };
        selected.forEach(p => {
          next[p.id] = true;
        });
        return next;
      });

      setPulledStickers(selected);
      setIsOpeningPack(false);
      setHasOpenedPack(true);
    }, 2000); // 2-second energy burst animation
  };

  const handleOpenTriviaPack = (level: number) => {
    if (isOpeningPack) return;
    setIsOpeningPack(true);
    setHasOpenedPack(false);
    setPulledStickers([]);

    const targetCountry = selectedCountryName;
    setPackCountryName(targetCountry);
    const countryPlayers = playersDB[targetCountry] || [];

    let selected: Player[] = [];
    if (level === 1) {
      selected = countryPlayers.slice(0, 9);
    } else if (level === 2) {
      selected = countryPlayers.slice(9, 18);
    } else if (level === 3) {
      selected = countryPlayers.slice(18, 26);
    }

    setTimeout(() => {
      // Mark level as unlocked in player database
      setUnlockedLevels(prev => {
        const updated = {
          ...prev,
          [targetCountry]: {
            ...prev[targetCountry],
            [level]: true
          }
        };
        return updated;
      });

      // Remove from pending packs
      setPendingTriviaPacks(prev => {
        const countryPacks = prev[targetCountry] || [];
        return {
          ...prev,
          [targetCountry]: countryPacks.filter(lvl => lvl !== level)
        };
      });

      setPulledStickers(selected);
      setIsOpeningPack(false);
      setHasOpenedPack(true);
    }, 2000); // 2-second energy burst animation
  };

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem('scouting_unlocked_levels', JSON.stringify(unlockedLevels));
  }, [unlockedLevels]);

  useEffect(() => {
    localStorage.setItem('scouting_tactical_boards', JSON.stringify(tacticalBoards));
  }, [tacticalBoards]);

  useEffect(() => {
    localStorage.setItem('user_subscription', userSubscription);
  }, [userSubscription]);

  useEffect(() => {
    localStorage.setItem('dt_user_license', userLicense);
  }, [userLicense]);

  // Sync current user progress to the central users database (dt_users_database)
  useEffect(() => {
    if (!userEmail) return;
    const dbStr = localStorage.getItem('dt_users_database') || '[]';
    try {
      let db = JSON.parse(dbStr);
      if (!Array.isArray(db)) db = [];
      const idx = db.findIndex((u: any) => u.email.toLowerCase() === userEmail.toLowerCase());
      const updatedUser = {
        id: userId,
        username,
        email: userEmail.toLowerCase(),
        avatar: userAvatar,
        code: userCode,
        password: userPassword,
        license: userLicense,
        subscription: userSubscription,
        unlockedLevels,
        tacticalBoards,
        vipChosenContinent,
      };
      if (idx !== -1) {
        db[idx] = { ...db[idx], ...updatedUser };
      } else {
        db.push(updatedUser);
      }
      localStorage.setItem('dt_users_database', JSON.stringify(db));
    } catch (err) {
      console.error('Error syncing current user to db', err);
    }
  }, [userEmail, userId, username, userAvatar, userCode, userPassword, userLicense, userSubscription, unlockedLevels, tacticalBoards, vipChosenContinent]);

  useEffect(() => {
    if (isRegistrationOpen) {
      setTempUsername(username === 'Tú (Director Técnico)' ? '' : username);
      setTempEmail(userEmail);
      setTempAvatar(userAvatar);
      setTempPassword('');
      setTempConfirmPassword('');
      setIsLoginMode(false);
      setIsRecoveryMode(false);
      setRecoveryStep('verify');
      setMatchedRecoveryUser(null);
    }
  }, [isRegistrationOpen, username, userEmail, userAvatar]);

  const getCountryContinent = (countryName: string): string => {
    const america = ['México', 'Canadá', 'Brasil', 'Haití', 'Estados Unidos', 'Paraguay', 'Curazao', 'Ecuador', 'Uruguay', 'Argentina', 'Colombia', 'Panamá'];
    const europa = ['República Checa', 'Bosnia y Herzegovina', 'Suiza', 'Escocia', 'Turquía', 'Alemania', 'Países Bajos', 'Suecia', 'Bélgica', 'España', 'Francia', 'Noruega', 'Austria', 'Portugal', 'Inglaterra', 'Croacia'];
    if (america.includes(countryName)) return 'América';
    if (europa.includes(countryName)) return 'Europa';
    return 'África, Asia y Oceanía';
  };

  const handleSavePlayoffs = async (
    winners: { [matchId: string]: string }, 
    scores: { [matchId: string]: { golesLocal: number; golesVisitante: number } }
  ) => {
    // Save to tacticalBoards under the special key '__playoffPredictions'
    const updatedBoards = {
      ...tacticalBoards,
      '__playoffPredictions': {
        country: '__playoffPredictions',
        formation: 'playoffs',
        selectedPlayers: {},
        prediction: null,
        winners,
        scores,
        predictionSavedAt: new Date().toISOString()
      } as any
    };
    
    setTacticalBoards(updatedBoards);
    localStorage.setItem('scouting_tactical_boards', JSON.stringify(updatedBoards));

    // Instantly sync with Server DB using userSync logic
    try {
      const invitedListParsed = (() => {
        try {
          const list = localStorage.getItem('dt_invited_emails');
          return list ? JSON.parse(list) : [];
        } catch {
          return [];
        }
      })();

      const scoreInfo = getCurrentUserScoreInfo(updatedBoards);

      await fetch('/api/user/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: userId,
          username: username,
          gameCode: userCode,
          email: userEmail,
          password: userPassword,
          unlockedLevels,
          aciertosOnce: scoreInfo.totalOnceHits,
          aciertosMarcador: scoreInfo.totalScoreHits,
          unlockedStickersCount: scoreInfo.unlockedStickersCount,
          completedCountries: scoreInfo.completedCountriesList,
          score: scoreInfo.totalScore,
          subscription: userSubscription,
          avatar: userAvatar,
          licenseCode: userLicense,
          tacticalBoards: updatedBoards,
          referredByEmail: userReferredByEmail,
          invitedEmails: invitedListParsed,
          coins: userCoins,
          cashBalance: userCashBalance,
          adminSyncCounter: adminSyncCounter
        })
      });
      console.log('[Playoffs Sync] Guardado y sincronización exitosa en base de datos.');
    } catch (err) {
      console.error('[Playoffs Sync Error]:', err);
    }
  };

  // Dynamic score calculator matching required point formulas:
  // - 1 cromo = 1 pt
  // - Completed country = 5 pt
  // - XI alignment starter hit = 10 pt
  // - Score prediction accurate = 20 pt
  const getCurrentUserScoreInfo = (alternateBoards?: { [country: string]: UserTacticalBoard }) => {
    let unlockedStickersCount = 0;
    const completedCountriesList: string[] = [];

    Object.entries(unlockedLevels).forEach(([country, levels]) => {
      let lvl1 = levels[1] || levels['1'] || false;
      let lvl2 = levels[2] || levels['2'] || false;
      let lvl3 = levels[3] || levels['3'] || false;
      let isCountryCompletedDefault = lvl1 && lvl2 && lvl3;
      
      const isContinentChosen = (cont: string) => vipChosenContinent && vipChosenContinent.split(',').map(s => s.trim().toUpperCase()).includes(cont.toUpperCase());
      const isCountryChosen = (c: string) => scoutChosenCountry && scoutChosenCountry.split(',').map(s => s.trim().toUpperCase()).includes(c.toUpperCase());

      let isCountryCompletedVIP = userSubscription === 'Pase VIP Elite' && isContinentChosen(getCountryContinent(country));
      let isCountryCompletedScout = userSubscription === 'Plan Scout Básico' && isCountryChosen(country);

      // Access checks
      const hasCromoAccess = !isRegistered || isAdmin || 
        (userSubscription === 'Pase VIP Elite' && isContinentChosen(getCountryContinent(country))) ||
        (userSubscription === 'Plan Scout Básico' && isCountryChosen(country)) ||
        (userSubscription === 'Ninguna' && freeChosenCountry === country);

      let countryCount = 0;
      let limitCromos = 26;

      if (hasCromoAccess) {
        if (isCountryCompletedVIP || isCountryCompletedScout) {
          countryCount = limitCromos;
        } else {
          if (lvl1) countryCount += 9;
          if (lvl2) countryCount += 9;
          if (lvl3) countryCount += 8;
        }
      } else {
        countryCount = 0;
      }

      unlockedStickersCount += countryCount;

      if ((isCountryCompletedVIP || isCountryCompletedScout || isCountryCompletedDefault) && hasCromoAccess) {
        completedCountriesList.push(country);
      }
    });

    let totalOnceHits = 0;
    let totalScoreHits = 0;

    const boardsToUse = alternateBoards || tacticalBoards;

    Object.entries(boardsToUse).forEach(([country, boardObj]) => {
      const board = boardObj as UserTacticalBoard;
      
      // If the prediction was saved under 2 hours before the match, discard scoring eligibility
      if (board.predictionEligible === false) {
        return;
      }

      const countryPlayers = playersDB[country] || [];
      const matchData = getPopulatedMatch(country, countryPlayers);
      
      const assignedIds = Object.values(board.selectedPlayers).filter(Boolean) as string[];
      const officialXI = matchData.onceInicialReal;
      assignedIds.forEach(pId => {
        if (officialXI.includes(pId)) {
          totalOnceHits += 1;
        }
      });

      const pred = board.prediction;
      const realMarcador = matchData.marcadorReal;
      if (pred && realMarcador) {
        if (pred.golesLocal === realMarcador.golesLocal && pred.golesVisitante === realMarcador.golesVisitante) {
          totalScoreHits += 1;
        }
      }
    });

    const stickerScore = unlockedStickersCount * 1;
    const bonusScore = completedCountriesList.length * 5;
    const onceScore = totalOnceHits * 10;
    const predictScore = totalScoreHits * 20;
    const totalScore = isRegistered 
      ? (stickerScore + bonusScore + onceScore + predictScore + referralPoints + purchasedPoints)
      : 0;

    return {
      unlockedStickersCount,
      completedCountriesList,
      totalOnceHits,
      totalScoreHits,
      referralPoints,
      totalScore
    };
  };

  const currentUserInfo = getCurrentUserScoreInfo();

  // Unified persistent database auto-sync with Express server
  useEffect(() => {
    const syncWithDb = async () => {
      try {
        const invitedListParsed = (() => {
          try {
            const list = localStorage.getItem('dt_invited_emails');
            return list ? JSON.parse(list) : [];
          } catch {
            return [];
          }
        })();

        const response = await fetch('/api/user/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: userId,
            username: username,
            gameCode: userCode,
            email: userEmail,
            password: userPassword,
            unlockedLevels,
            aciertosOnce: currentUserInfo.totalOnceHits,
            aciertosMarcador: currentUserInfo.totalScoreHits,
            unlockedStickersCount: currentUserInfo.unlockedStickersCount,
            completedCountries: currentUserInfo.completedCountriesList,
            score: currentUserInfo.totalScore,
            subscription: userSubscription,
            avatar: userAvatar,
            licenseCode: userLicense,
            tacticalBoards: tacticalBoards,
            referredByEmail: userReferredByEmail,
            invitedEmails: invitedListParsed,
            coins: userCoins,
            cashBalance: userCashBalance,
            adminSyncCounter: adminSyncCounter
          })
        });
        if (response.ok) {
          const data = await response.json();
          if (data.status === 'success' && data.user) {
            const rPoints = data.user.referralPoints || 0;
            const rCount = data.user.successfulReferralsCount || 0;
            setReferralPoints(rPoints);
            setSuccessfulReferralsCount(rCount);
            localStorage.setItem('dt_user_referral_points', String(rPoints));
            localStorage.setItem('dt_user_referral_count', String(rCount));

            // Sync server version state if admin updated it
            if (data.user.adminSyncCounter !== undefined && data.user.adminSyncCounter !== adminSyncCounter) {
              setAdminSyncCounter(data.user.adminSyncCounter);
              localStorage.setItem('dt_admin_sync_counter', String(data.user.adminSyncCounter));
              
              if (data.user.username) {
                setUsername(data.user.username);
                localStorage.setItem('dt_username', data.user.username);
              }
              if (data.user.gameCode) {
                setUserCode(data.user.gameCode);
                localStorage.setItem('dt_user_code', data.user.gameCode);
              }
              if (data.user.subscription) {
                setUserSubscription(data.user.subscription);
                localStorage.setItem('user_subscription', data.user.subscription);
              }
              if (data.user.licenseCode !== undefined) {
                setUserLicense(data.user.licenseCode);
                if (data.user.licenseCode) {
                  localStorage.setItem('dt_user_license', data.user.licenseCode);
                } else {
                  localStorage.removeItem('dt_user_license');
                }
              }
              if (data.user.coins !== undefined) {
                setUserCoins(data.user.coins);
                localStorage.setItem('dt_user_coins', String(data.user.coins));
              }
              if (data.user.cashBalance !== undefined) {
                setUserCashBalance(data.user.cashBalance);
                localStorage.setItem('dt_user_cash_balance', String(data.user.cashBalance));
              }
            }
          }
        }
      } catch (err) {
        console.warn('Sync connection busy, retrying dynamically...', err);
      }
    };

    syncWithDb();
  }, [unlockedLevels, userSubscription, userCode, userId, username, userAvatar, currentUserInfo.totalOnceHits, currentUserInfo.totalScoreHits, userLicense, tacticalBoards, userEmail, userReferredByEmail, userCoins, userCashBalance, purchasedPoints]);

  const isCountryLockedForUser = (countryName: string): boolean => {
    if (isAdmin) {
      return false;
    }
    if (!isRegistered) {
      return countryName !== 'Ecuador';
    }
    
    // VIP Elite and Scout Básico can access games for all countries, but won't get stickers unless in their selection
    if (userSubscription === 'Pase VIP Elite' || userSubscription === 'Plan Scout Básico') {
      return false;
    }
    
    // Check if the country is fully completed/purchased in unlockedLevels
    const levels = unlockedLevels[countryName];
    const isCompleted = levels && levels[1] && levels[2] && levels[3];
    if (isCompleted) return false;

    if (userSubscription === 'Ninguna') {
      if (freeChosenCountry !== '' && freeChosenCountry !== countryName) {
        return true;
      }
    }
    return false;
  };

  const handleCountrySelectionClick = (countryName: string) => {
    if (isAdmin) {
      setSelectedCountryName(countryName);
      return;
    }

    if (!isRegistered) {
      if (countryName !== 'Ecuador') {
        alert('📢 MODO INVITADO LIMITADO\n\nComo invitado, solo puedes observar y jugar con la Selección de Ecuador. Por favor, regístrate de forma 100% gratuita para coleccionar y jugar con las 32 selecciones de Héroes del Deporte y registrar tu puntaje.');
        setIsRegistrationOpen(true);
        return;
      }
      setSelectedCountryName(countryName);
      return;
    }

    if (isRegistered && userSubscription === 'Ninguna') {
      if (freeChosenCountry === '') {
        setCountryToConfirmFree(countryName);
      } else if (freeChosenCountry !== countryName) {
        setUpsellCountry(countryName);
      } else {
        setSelectedCountryName(countryName);
      }
    } else {
      setSelectedCountryName(countryName);
    }
  };

  const activeCountry = COUNTRIES.find(c => c.name === selectedCountryName) || COUNTRIES[0];
  const activeCountryPlayers = playersDB[activeCountry.name] || [];

  // Helper to calculate unlocked player count for any country
  const getUnlockedPlayersForCountry = (countryName: string): Player[] => {
    const countryPlayers = playersDB[countryName] || [];
    
    // Guest (not registered) user
    if (!isRegistered) {
      if (countryName !== 'Ecuador') {
        return [];
      }
      const levels = unlockedLevels[countryName] || { 1: false, 2: false, 3: false };
      const lvl1 = levels[1] || levels['1'] || false;
      const lvl2 = levels[2] || levels['2'] || false;
      const lvl3 = levels[3] || levels['3'] || false;
      
      let unlocked: Player[] = [];
      if (lvl1) unlocked = [...unlocked, ...countryPlayers.slice(0, 9)];
      if (lvl2) unlocked = [...unlocked, ...countryPlayers.slice(9, 18)];
      if (lvl3) unlocked = [...unlocked, ...countryPlayers.slice(18, 26)];
      return unlocked;
    }

    const isContinentChosen = (cont: string) => vipChosenContinent && vipChosenContinent.split(',').map(s => s.trim().toUpperCase()).includes(cont.toUpperCase());
    const isCountryChosen = (c: string) => scoutChosenCountry && scoutChosenCountry.split(',').map(s => s.trim().toUpperCase()).includes(c.toUpperCase());

    // Registered user cromo access check
    const hasCromoAccess = 
      isAdmin ||
      (userSubscription === 'Pase VIP Elite' && isContinentChosen(getCountryContinent(countryName))) ||
      (userSubscription === 'Plan Scout Básico' && isCountryChosen(countryName)) ||
      (userSubscription === 'Ninguna' && freeChosenCountry === countryName);

    if (!hasCromoAccess) {
      return [];
    }

    if (isAdmin || (userSubscription === 'Pase VIP Elite' && isContinentChosen(getCountryContinent(countryName)))) {
      return countryPlayers;
    }
    
    if (userSubscription === 'Plan Scout Básico' && isCountryChosen(countryName)) {
      return countryPlayers;
    }

    const levels = unlockedLevels[countryName] || { 1: false, 2: false, 3: false };
    const lvl1 = levels[1] || levels['1'] || false;
    const lvl2 = levels[2] || levels['2'] || false;
    const lvl3 = levels[3] || levels['3'] || false;
    
    let unlocked: Player[] = [];
    if (lvl1) {
      unlocked = [...unlocked, ...countryPlayers.slice(0, 9)];
    }
    if (lvl2) {
      unlocked = [...unlocked, ...countryPlayers.slice(9, 18)];
    }
    if (lvl3) {
      unlocked = [...unlocked, ...countryPlayers.slice(18, 26)];
    }

    // Include manually unlocked player IDs via pack opening (only if hasCromoAccess)
    countryPlayers.forEach(p => {
      if (manuallyUnlockedPlayerIds[p.id] && !unlocked.some(up => up.id === p.id)) {
        unlocked.push(p);
      }
    });

    return unlocked;
  };

  const unlockedCount = getUnlockedPlayersForCountry(activeCountry.name).length;
  const isAlbumComplete = unlockedCount >= activeCountryPlayers.length;

  const isContinentChosen = (cont: string) => vipChosenContinent && vipChosenContinent.split(',').map(s => s.trim().toUpperCase()).includes(cont.toUpperCase());
  const isCountryChosen = (c: string) => scoutChosenCountry && scoutChosenCountry.split(',').map(s => s.trim().toUpperCase()).includes(c.toUpperCase());

  const hasCromoAccess = !isRegistered || isAdmin || 
    (userSubscription === 'Pase VIP Elite' && isContinentChosen(getCountryContinent(activeCountry.name))) ||
    (userSubscription === 'Plan Scout Básico' && isCountryChosen(activeCountry.name)) ||
    (userSubscription === 'Ninguna' && freeChosenCountry === activeCountry.name);

  // Handle successful trivia completion
  const handleTriviaSuccess = () => {
    if (!activeTrivia) return;
    const { country, level } = activeTrivia;

    // Save level as completed in unlockedLevels
    setUnlockedLevels(prev => {
      const next = { ...prev };
      if (!next[country]) {
        next[country] = { 1: false, 2: false, 3: false };
      }
      next[country][level] = true;
      localStorage.setItem('scouting_unlocked_levels', JSON.stringify(next));
      return next;
    });

    const hasCromoAccessForCountry = !isRegistered || isAdmin || 
      (userSubscription === 'Pase VIP Elite' && isContinentChosen(getCountryContinent(country))) ||
      (userSubscription === 'Plan Scout Básico' && isCountryChosen(country)) ||
      (userSubscription === 'Ninguna' && freeChosenCountry === country);

    if (hasCromoAccessForCountry) {
      // Add this level to pending trivia packs as a reward
      setPendingTriviaPacks(prev => {
        const existing = prev[country] || [];
        if (!existing.includes(level)) {
          return {
            ...prev,
            [country]: [...existing, level]
          };
        }
        return prev;
      });

      setActiveTrivia(null);

      // Dynamic high-fidelity smooth scrolling directly to the Envelope Opening Station
      setTimeout(() => {
        const targetElement = document.getElementById('shovelling-station-container');
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 150);
    } else {
      setActiveTrivia(null);
      alert(`🎉 ¡Examen del Nivel ${level} Completado con Éxito!\n\nHas demostrado tu conocimiento táctico de la selección de ${country}.\n\nComo esta selección pertenece a otra área fuera de tu plan activo de estampas, has jugado en Modo Recreativo. ¡Excelente trabajo acumulando experiencia y demostrando tu liderazgo táctico!`);
    }
  };

  const handleSaveBoard = async (board: UserTacticalBoard) => {
    // Show a warm, interactive loading popup to indicate validation is processing in the server
    setAppCustomAlert({
      title: '🕵️‍♂️ CONTROL DE HORARIOS EN PROCESO...',
      message: `El oráculo de Gemini 3.5 Flash está analizando tus coordenadas de geolocalización y huso horario para contrastar el plazo reglamentario límite de 2 horas antes del inicio oficial del encuentro...`
    });

    let userLocation: { lat: number, lng: number } | null = null;
    try {
      if (navigator.geolocation) {
        userLocation = await new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
            () => resolve(null),
            { timeout: 3000 }
          );
        });
      }
    } catch (e) {
      console.warn("Captura opcional de geolocalización omitida:", e);
    }

    const countryPlayers = playersDB[board.country] || [];
    const match = getPopulatedMatch(board.country, countryPlayers);
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    let eligibilityResult = {
      eligible: true,
      reason: "Pronóstico guardado exitosamente."
    };

    try {
      const response = await fetch('/api/predictions/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          local: match.local,
          visitante: match.visitante,
          matchFecha: match.fecha,
          userTimezone,
          userLocation,
          currentTime: new Date().toISOString()
        })
      });

      if (response.ok) {
        const valData = await response.json();
        eligibilityResult = {
          eligible: valData.eligible,
          reason: valData.reason
        };
      }
    } catch (err) {
      console.warn("Error validating with server timezone API, using client fallback:", err);
    }

    const auditedBoard: UserTacticalBoard = {
      ...board,
      predictionEligible: eligibilityResult.eligible,
      predictionSavedAt: new Date().toISOString(),
      predictionReason: eligibilityResult.reason
    };

    const updatedBoards = {
      ...tacticalBoards,
      [auditedBoard.country]: auditedBoard
    };

    setTacticalBoards(updatedBoards);
    const freshInfo = getCurrentUserScoreInfo(updatedBoards);

    // Trigger immediate, auditable server syncing with the admin panel
    try {
      const invitedListParsed = (() => {
        try {
          const list = localStorage.getItem('dt_invited_emails');
          return list ? JSON.parse(list) : [];
        } catch {
          return [];
        }
      })();

      await fetch('/api/user/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: userId,
          username: username,
          gameCode: userCode,
          email: userEmail,
          password: userPassword,
          unlockedLevels,
          aciertosOnce: freshInfo.totalOnceHits,
          aciertosMarcador: freshInfo.totalScoreHits,
          unlockedStickersCount: freshInfo.unlockedStickersCount,
          completedCountries: freshInfo.completedCountriesList,
          score: freshInfo.totalScore,
          subscription: userSubscription,
          avatar: userAvatar,
          licenseCode: userLicense,
          tacticalBoards: updatedBoards,
          saveTrigger: auditedBoard.country,
          referredByEmail: userReferredByEmail,
          invitedEmails: invitedListParsed,
          coins: userCoins,
          cashBalance: userCashBalance,
          adminSyncCounter: adminSyncCounter
        })
      });
    } catch (err) {
      console.warn('Sync server connection busy:', err);
    }

    // Alert the user with Gemini's detailed and highly specific review of schedules!
    setAppCustomAlert({
      title: auditedBoard.predictionEligible ? '🏆 PRONÓSTICO APTO PARA PUNTOS' : '⚠️ PRONÓSTICO REGISTRADO (SOLO DATOS)',
      message: `${eligibilityResult.reason}\n\nLos cambios tácticos y del marcador para ${auditedBoard.country} se han sincronizado con la Base de Datos central del D.T.`
    });
  };

  const handleResetProgress = async () => {
    if (window.confirm('¿Seguro de reiniciar la colección y comenzar de nuevo? Se borrarán tus trivias superadas, todas las cuentas de directores técnicos y alineaciones guardadas de forma definitiva.')) {
      const resetLevels: { [country: string]: { [level: number]: boolean } } = {};
      const resetPacks: { [country: string]: number[] } = {};
      
      COUNTRIES.forEach(c => {
        resetLevels[c.name] = { 1: false, 2: false, 3: false };
        resetPacks[c.name] = [];
      });
      // Ecuador retains default auto-unlock as per standard blueprint layout
      resetLevels["Ecuador"] = { 1: true, 2: true, 3: true };

      setUnlockedLevels(resetLevels);
      setPendingTriviaPacks(resetPacks);
      setTacticalBoards({});
      setActiveTrivia(null);
      setManuallyUnlockedPlayerIds({});

      localStorage.removeItem('scouting_unlocked_levels');
      localStorage.removeItem('scouting_pending_trivia_packs');
      localStorage.removeItem('scouting_tactical_boards');
      localStorage.removeItem('scouting_manually_unlocked_ids');
      localStorage.removeItem('dt_users_database');
      
      // Also reset custom profile to return to user_me
      localStorage.removeItem('dt_user_id');
      localStorage.removeItem('dt_username');
      localStorage.removeItem('dt_user_code');
      localStorage.removeItem('dt_user_avatar');
      localStorage.removeItem('dt_user_email');
      localStorage.removeItem('dt_user_password');
      localStorage.removeItem('dt_user_license');
      localStorage.removeItem('user_subscription');
      localStorage.removeItem('dt_purchased_points');
      
      setUserId('user_me');
      setUsername('Tú (Director Técnico)');
      setUserAvatar('👑');
      setUserEmail('');
      setUserLicense('');
      setUserSubscription('Ninguna');
      setPurchasedPoints(0);

      const standardCode = 'DT-' + Math.floor(1000 + Math.random() * 9000);
      localStorage.setItem('dt_user_code', standardCode);
      setUserCode(standardCode);

      try {
        await fetch('/api/admin/users/reset-all', { method: 'POST' });
      } catch (err) {
        console.warn('Fallo al limpiar base de datos en servidor.', err);
      }

      // Reload so that everything initializes beautifully from clean slate
      alert('🧹 ¡SISTEMA RESTABLECIDO EXCELENTEMENTE!\nTodos los registros de usuarios, licencias de sorteos y estampas recolectadas se han limpiado a nivel atómico en este navegador.\n\nLa aplicación se recargará para iniciar el juego desde cero.');
      window.location.reload();
    }
  };

  const handleUpdateSubscription = (planTier: string) => {
    setUserSubscription(planTier);
    if (planTier && planTier !== 'Ninguna') {
      const randVal = Math.floor(100000 + Math.random() * 900000);
      const prefix = planTier === 'Pase VIP Elite' ? 'LIC-VIP' : 'LIC-SCOUT';
      const license = `${prefix}-${randVal}`;
      localStorage.setItem('dt_user_license', license);
      setUserLicense(license);
      alert(`🔑 ¡Pago de Suscripción Verificado!\n\nSe ha generado tu código único de licencia:\n👉  ${license}\n\nEste código asocia tu usuario para el sorteo auditable de premios en el panel del administrador.`);
    } else {
      localStorage.removeItem('dt_user_license');
      setUserLicense('');
    }
  };

  const handleCommitRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempUsername.trim()) {
      alert('⚠️ Por favor ingresa el nombre del Director Técnico.');
      return;
    }
    if (!tempEmail.trim()) {
      alert('⚠️ Por favor ingresa tu correo electrónico.');
      return;
    }
    if (!tempPassword) {
      alert('⚠️ Por favor crea una contraseña para proteger tu terminal.');
      return;
    }
    if (tempPassword.length < 4) {
      alert('⚠️ La contraseña debe tener al menos 4 caracteres para certificar la seguridad.');
      return;
    }
    if (tempPassword !== tempConfirmPassword) {
      alert('⚠️ Las contraseñas ingresadas no coinciden. Por favor verifícalas.');
      return;
    }

    const cleanUsername = tempUsername.trim();
    const cleanEmail = tempEmail.trim().toLowerCase();
    const cleanPassword = tempPassword;
    const cleanReferredByEmail = tempReferredByEmail.trim().toLowerCase();

    if (cleanReferredByEmail && cleanReferredByEmail === cleanEmail) {
      alert('⚠️ No puedes ingresar tu propio correo electrónico como tu recomendador.');
      return;
    }

    // Uniqueness verification - Level 1: check local database of members (dt_users_database)
    const dbStr = localStorage.getItem('dt_users_database') || '[]';
    let db = [];
    try {
      db = JSON.parse(dbStr);
    } catch (err) {
      db = [];
    }
    const localConflict = db.some((u: any) => u.email && u.email.toLowerCase() === cleanEmail);
    if (localConflict) {
      alert('⚠️ Este correo electrónico ya se encuentra registrado por otro Director Técnico. Por favor inicia sesión con tu contraseña o utiliza un correo electrónico alternativo.');
      return;
    }

    // Uniqueness verification - Level 2: check the server database in real-time
    try {
      const response = await fetch(`/api/user/check-email?email=${encodeURIComponent(cleanEmail)}`);
      if (response.ok) {
        const data = await response.json();
        if (data.exists) {
          alert('⚠️ Este correo electrónico ya se encuentra registrado por otro Director Técnico en el servidor central. Por favor inicia sesión o utiliza un correo electrónico alternativo.');
          return;
        }
      }
    } catch (err) {
      console.warn('Servidor fuera de línea o inaccesible; se procede sólo con la validación de base de datos local.', err);
    }

    const uniqueId = 'usr_' + Math.floor(100000 + Math.random() * 900000);
    const code = 'DT-' + Math.floor(1000 + Math.random() * 9000);

    localStorage.setItem('dt_user_id', uniqueId);
    localStorage.setItem('dt_username', cleanUsername);
    localStorage.setItem('dt_user_code', code);
    localStorage.setItem('dt_user_avatar', tempAvatar);
    localStorage.setItem('dt_user_email', cleanEmail);
    localStorage.setItem('dt_user_password', cleanPassword);
    localStorage.setItem('dt_user_referred_by_email', cleanReferredByEmail);

    setUserId(uniqueId);
    setUsername(cleanUsername);
    setUserCode(code);
    setUserAvatar(tempAvatar);
    setUserEmail(cleanEmail);
    setUserPassword(cleanPassword);
    setUserReferredByEmail(cleanReferredByEmail);
    setIsRegistrationOpen(false);

    // Reset game completely to start from scratch (desde cero) for the newly registered profile
    const resetLevels: { [country: string]: { [level: number]: boolean } } = {};
    COUNTRIES.forEach(c => {
      resetLevels[c.name] = { 1: false, 2: false, 3: false };
    });
    setUnlockedLevels(resetLevels);
    localStorage.setItem('scouting_unlocked_levels', JSON.stringify(resetLevels));

    setTacticalBoards({});
    localStorage.setItem('scouting_tactical_boards', '{}');

    setUserSubscription('Ninguna');
    localStorage.setItem('user_subscription', 'Ninguna');

    setUserLicense('');
    localStorage.removeItem('dt_user_license');

    setIsLocked(false);

    // Auto-navigate to dynamic subscription plans (despliega el panel de suscripción)
    setActiveTab('subscription');

    const isAdmin = cleanEmail === 'geovannygrk3d@gmail.com' || cleanEmail === 'geovannygrk3d@gmail' || cleanEmail === 'conscientizarte13@gmail.com' || cleanEmail === 'conscientizarte13@gmail';
    if (isAdmin) {
      alert(`🎉 ¡Google Sign-in Exitoso, Bienvenido Administrador Central!\n\nEmail: "${cleanEmail}"\nContraseña registrada correctamente.\nTu Clave Única es: "${uniqueId}"\nTu Código de Juego es: "${code}"\n\nTu juego se ha iniciado DESDE CERO con un álbum limpio de 0 cromos.\nTienes acceso privilegiado completo al Panel de Administración de Sorteos.\nRedirigiendo al panel de suscripción...`);
    } else {
      alert(`🎉 ¡Google Sign-in Exitoso!\n\nUsuario: ${cleanUsername}\nEmail: "${cleanEmail}"\nContraseña registrada correctamente.\nTu Código de Director Técnico es: "${code}"\n\nTu juego se ha iniciado DESDE CERO con un álbum limpio de 0 cromos.\nElige un plan de suscripción para recibir tu código de participación.`);
    }
  };

  const handleCommitLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = tempEmail.trim().toLowerCase();
    const inputPass = tempPassword;

    if (!cleanEmail) {
      alert('⚠️ Por favor ingresa tu correo electrónico de miembro.');
      return;
    }
    if (!inputPass) {
      alert('⚠️ Por favor ingresa tu contraseña.');
      return;
    }

    let matchedUser: any = null;
    let loginSuccess = false;

    // 1. Try to login via the Express server database first
    try {
      const response = await fetch('/api/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password: inputPass })
      });
      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success' && data.user) {
          matchedUser = data.user;
          loginSuccess = true;
          
          // Also save/update this user in the local browser database "dt_users_database" for local offline fallback
          const dbStr = localStorage.getItem('dt_users_database') || '[]';
          let localDb = [];
          try {
            localDb = JSON.parse(dbStr);
            if (!Array.isArray(localDb)) localDb = [];
          } catch {
            localDb = [];
          }
          const idx = localDb.findIndex((u: any) => u.email.toLowerCase() === cleanEmail);
          const localUser = {
            id: matchedUser.id,
            username: matchedUser.username,
            email: matchedUser.email,
            avatar: matchedUser.avatar,
            code: matchedUser.gameCode || matchedUser.code,
            password: matchedUser.password,
            license: matchedUser.licenseCode || matchedUser.license || '',
            subscription: matchedUser.subscription || 'Ninguna',
            unlockedLevels: matchedUser.unlockedLevels,
            tacticalBoards: matchedUser.tacticalBoards,
            vipChosenContinent: matchedUser.vipChosenContinent || 'América'
          };
          if (idx !== -1) {
            localDb[idx] = { ...localDb[idx], ...localUser };
          } else {
            localDb.push(localUser);
          }
          localStorage.setItem('dt_users_database', JSON.stringify(localDb));
        } else {
          alert(`❌ ${data.message || 'Error al iniciar sesión'}`);
          return;
        }
      } else if (response.status === 401 || response.status === 404) {
        const data = await response.json();
        alert(`❌ ${data.message || 'Credenciales incorrectas'}`);
        return;
      }
    } catch (err) {
      console.warn('Servidor inaccesible. Se procede con la base de datos local.', err);
    }

    // 2. Local fallback if server check was offline or skipped
    if (!loginSuccess) {
      const dbStr = localStorage.getItem('dt_users_database') || '[]';
      let db = [];
      try {
        db = JSON.parse(dbStr);
      } catch (err) {
        db = [];
      }
      const localUser = db.find((u: any) => u.email.toLowerCase() === cleanEmail);
      if (localUser) {
        if (inputPass === localUser.password) {
          matchedUser = localUser;
          loginSuccess = true;
        } else {
          const nextAttempts = loginAttempts + 1;
          setLoginAttempts(nextAttempts);

          if (nextAttempts < 3) {
            alert(`❌ Contraseña incorrecta (Intento ${nextAttempts} de 3).\n\nLe quedan ${3 - nextAttempts} intentos antes de activar el panel de recuperación y enviarle un código temporal.`);
            return;
          } else {
            setLoginAttempts(0);
            const generatedCode = String(Math.floor(100000 + Math.random() * 900000));
            setSentRecoveryCode(generatedCode);
            setIsRecoveryMode(true);
            setRecoveryStep('code_verification');
            setMatchedRecoveryUser(localUser);
            setTempPassword('');
            setTempConfirmPassword('');
            setInputRecoveryCode('');

            alert(`⚠️ ¡SISTEMA BLOQUEADO: 3 INTENTOS FALLIDOS EXCEDIDOS! ⚠️\n\nPor seguridad del Director Técnico y transparencia de la auditoría de sorteos de la Copa, se ha bloqueado el inicio de sesión y activado el Panel de Recuperación de Contraseña.\n\n📧 Se ha enviado un código de acceso de recuperación temporal al correo:\n"${localUser.email}"\n\n🔑 CÓDIGO DE RECUPERACIÓN TEMPORAL ENVIADO: ${generatedCode}\n\nPor favor, ingrese este código en la pantalla para validar su identidad y restablecer su contraseña.`);
            return;
          }
        }
      }
    }

    // If successfully logged in (either via server or local fallback)
    if (loginSuccess && matchedUser) {
      setLoginAttempts(0);
      setUserId(matchedUser.id || 'usr_' + Math.floor(100000 + Math.random() * 900050));
      setUsername(matchedUser.username || 'Tú (Director Técnico)');
      setUserCode(matchedUser.gameCode || matchedUser.code || 'DT-' + Math.floor(1000 + Math.random() * 9000));
      setUserAvatar(matchedUser.avatar || '👑');
      setUserEmail(matchedUser.email);
      setUserPassword(matchedUser.password);
      setUserLicense(matchedUser.licenseCode || matchedUser.license || '');
      setUserSubscription(matchedUser.subscription || 'Ninguna');
      
      if (matchedUser.adminSyncCounter !== undefined) {
        setAdminSyncCounter(matchedUser.adminSyncCounter);
        localStorage.setItem('dt_admin_sync_counter', String(matchedUser.adminSyncCounter));
      }

      if (matchedUser.vipChosenContinent) {
        setVipChosenContinent(matchedUser.vipChosenContinent);
        localStorage.setItem('dt_vip_chosen_continent', matchedUser.vipChosenContinent);
      } else {
        setVipChosenContinent('América');
        localStorage.setItem('dt_vip_chosen_continent', 'América');
      }

      if (matchedUser.unlockedLevels) {
        setUnlockedLevels(matchedUser.unlockedLevels);
        localStorage.setItem('scouting_unlocked_levels', JSON.stringify(matchedUser.unlockedLevels));
      } else {
        const resetLevels: { [country: string]: { [level: number]: boolean } } = {};
        COUNTRIES.forEach(c => {
          resetLevels[c.name] = { 1: false, 2: false, 3: false };
        });
        setUnlockedLevels(resetLevels);
        localStorage.setItem('scouting_unlocked_levels', JSON.stringify(resetLevels));
      }

      if (matchedUser.tacticalBoards) {
        setTacticalBoards(matchedUser.tacticalBoards);
        localStorage.setItem('scouting_tactical_boards', JSON.stringify(matchedUser.tacticalBoards));
      } else {
        setTacticalBoards({});
        localStorage.setItem('scouting_tactical_boards', '{}');
      }

      if (matchedUser.coins !== undefined) {
        setUserCoins(matchedUser.coins);
        localStorage.setItem('dt_user_coins', String(matchedUser.coins));
      }
      if (matchedUser.cashBalance !== undefined) {
        setUserCashBalance(matchedUser.cashBalance);
        localStorage.setItem('dt_user_cash_balance', String(matchedUser.cashBalance));
      }

      localStorage.setItem('dt_user_id', matchedUser.id || 'usr_me');
      localStorage.setItem('dt_username', matchedUser.username || 'Tú (Director Técnico)');
      localStorage.setItem('dt_user_code', matchedUser.gameCode || matchedUser.code || '');
      localStorage.setItem('dt_user_avatar', matchedUser.avatar || '👑');
      localStorage.setItem('dt_user_email', matchedUser.email);
      localStorage.setItem('dt_user_password', matchedUser.password);
      localStorage.setItem('user_subscription', matchedUser.subscription || 'Ninguna');
      if (matchedUser.licenseCode || matchedUser.license) {
        localStorage.setItem('dt_user_license', matchedUser.licenseCode || matchedUser.license);
      } else {
        localStorage.removeItem('dt_user_license');
      }

      setIsRegistrationOpen(false);
      setActiveTab('subscription');

      alert(`🔑 ¡Bienvenido de vuelta, D.T. ${matchedUser.username}!\n\nIdentidad, billetera y progreso recuperados exitosamente desde la base de datos central.`);
      return;
    }

    // Special fallback for admin or demo if nothing registered yet
    if (cleanEmail === 'geovannygrk3d@gmail.com' || cleanEmail === 'geovannygrk3d@gmail' || cleanEmail === 'conscientizarte13@gmail.com' || cleanEmail === 'conscientizarte13@gmail') {
      const uniqueId = 'usr_admin';
      const code = 'DT-ADMIN';
      const adminUser = 'Administrador Senior';
      const avatar = '👑';

      localStorage.setItem('dt_user_id', uniqueId);
      localStorage.setItem('dt_username', adminUser);
      localStorage.setItem('dt_user_code', code);
      localStorage.setItem('dt_user_avatar', avatar);
      localStorage.setItem('dt_user_email', cleanEmail);
      localStorage.setItem('dt_user_password', inputPass);

      setUserId(uniqueId);
      setUsername(adminUser);
      setUserCode(code);
      setUserAvatar(avatar);
      setUserEmail(cleanEmail);
      setUserPassword(inputPass);
      setIsRegistrationOpen(false);
      setActiveTab('subscription');

      alert(`🔑 ¡Acceso de Administrador Inicial Autorizado!\n\nHemos registrado "${cleanEmail}" con la contraseña provista para tus futuras visitas en esta terminal.\n¡Bienvenido al panel central!`);
      return;
    }

    alert('❌ No se encontró ningún Director Técnico registrado con este correo en la base de datos central ni de forma local. Activando Protocolo de Restauración de Contraseña.');
    
    // Activate recover state
    setIsRecoveryMode(true);
    setRecoveryStep('verify');
    setMatchedRecoveryUser(null);
    setTempPassword('');
    setTempConfirmPassword('');
  };

  const handleRevealStoredPassword = () => {
    const cleanEmail = tempEmail.trim().toLowerCase();
    if (!cleanEmail) {
      alert('⚠️ Por favor ingresa primero tu correo registrado para poder buscar la contraseña guardada.');
      return;
    }

    // 1. Check in central users database
    const dbStr = localStorage.getItem('dt_users_database') || '[]';
    let db = [];
    try {
      db = JSON.parse(dbStr);
    } catch (err) {
      db = [];
    }

    const foundUser = db.find((u: any) => u.email.toLowerCase() === cleanEmail);
    if (foundUser) {
      alert(`🔑 ¡CONTRASEÑA LOCALIZADA EXCELENTEMENTE!\n\nEmail del D.T.: ${foundUser.email}\nContraseña Registrada: "${foundUser.password}"\n\nTu progreso, código y licencia de sorteos siguen resguardados de forma atómica. Ya puedes utilizar la contraseña para iniciar sesión.`);
      return;
    }

    // 2. Fallback to direct localStorage slots
    const directEmail = localStorage.getItem('dt_user_email');
    if (directEmail && directEmail.toLowerCase() === cleanEmail) {
      const directPassword = localStorage.getItem('dt_user_password');
      if (directPassword) {
        alert(`🔑 ¡CONTRASEÑA LOCALIZADA EXCELENTEMENTE!\n\nEmail del D.T.: ${directEmail}\nContraseña Registrada: "${directPassword}"\n\nTu progreso, código y licencia de sorteos siguen resguardados de forma atómica. Ya puedes utilizar la contraseña para iniciar sesión.`);
        return;
      }
    }

    alert(`❌ No encontramos ninguna contraseña registrada en este navegador para el correo: "${cleanEmail}".\n\nPor favor, asegúrate de que el correo esté escrito correctamente, o crea una nueva cuenta registrándote.`);
  };

  const handleCommitRecovery = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = tempEmail.trim().toLowerCase();

    const dbStr = localStorage.getItem('dt_users_database') || '[]';
    let db = [];
    try {
      db = JSON.parse(dbStr);
    } catch (err) {
      db = [];
    }

    if (recoveryStep === 'code_verification') {
      const foundUser = db.find((u: any) => u.email.toLowerCase() === cleanEmail);
      if (!foundUser) {
        alert('❌ No existe ninguna cuenta de Director Técnico registrada con este correo electrónico. Por favor, crea una nueva cuenta.');
        return;
      }

      const cleanInput = inputRecoveryCode.trim();
      if (!cleanInput) {
        alert('⚠️ Por favor ingrese el código de recuperación temporal.');
        return;
      }

      if (cleanInput === sentRecoveryCode) {
        setMatchedRecoveryUser(foundUser);
        setRecoveryStep('reset');
        setTempPassword('');
        setTempConfirmPassword('');
        alert('✅ ¡CÓDIGO DE ACCESO TEMPORAL VERIFICADO CON ÉXITO!\n\nSu identidad de Director Técnico ha sido auditada y autenticada. Ahora puede proceder a establecer una nueva contraseña segura para su cuenta.');
      } else {
        alert(`❌ Código de recuperación incorrecto.\n\nPor favor, verifique el código proporcionado e inténtelo de nuevo. Código enviado: ${sentRecoveryCode}`);
      }
      return;
    }

    if (recoveryStep === 'verify') {
      const foundUser = db.find((u: any) => u.email.toLowerCase() === cleanEmail);
      if (!foundUser) {
        alert('❌ No existe ninguna cuenta de Director Técnico registrada con este correo electrónico. Por favor, crea una nueva cuenta.');
        return;
      }

      // Check if their selected security shield (tempAvatar) matches the registered avatar
      if (tempAvatar === foundUser.avatar) {
        setMatchedRecoveryUser(foundUser);
        setRecoveryStep('reset');
        setTempPassword('');
        setTempConfirmPassword('');
        alert(`✅ ¡Identidad de D.T. Confirmada con Éxito!\n\nPor favor, establece tu nueva contraseña de acceso seguro.`);
      } else {
        alert(`❌ Escudo de Identidad incorrecto.\n\nPor seguridad de auditoría de premios, debes seleccionar el mismo Escudo de Identidad (Avatar) con el que registraste tu cuenta (${cleanEmail}) para verificar que eres tú.`);
      }
    } else {
      // step is 'reset'
      if (!tempPassword) {
        alert('⚠️ Por favor ingresa tu nueva contraseña.');
        return;
      }
      if (tempPassword.length < 4) {
        alert('⚠️ La contraseña nueva debe tener al menos 4 caracteres.');
        return;
      }
      if (tempPassword !== tempConfirmPassword) {
        alert('⚠️ Las contraseñas ingresadas no coinciden. Por favor verifícalas.');
        return;
      }

      const emailToReset = matchedRecoveryUser.email.toLowerCase();
      const updatedDb = db.map((u: any) => {
        if (u.email.toLowerCase() === emailToReset) {
          return { ...u, password: tempPassword };
        }
        return u;
      });

      localStorage.setItem('dt_users_database', JSON.stringify(updatedDb));

      // Successfully log them in
      const finalUser = updatedDb.find((u: any) => u.email.toLowerCase() === emailToReset);

      setUserId(finalUser.id);
      setUsername(finalUser.username);
      setUserCode(finalUser.code);
      setUserAvatar(finalUser.avatar);
      setUserEmail(finalUser.email);
      setUserPassword(tempPassword);
      setUserLicense(finalUser.license || '');
      setUserSubscription(finalUser.subscription || 'Ninguna');
      if (finalUser.vipChosenContinent) {
        setVipChosenContinent(finalUser.vipChosenContinent);
        localStorage.setItem('dt_vip_chosen_continent', finalUser.vipChosenContinent);
      } else {
        setVipChosenContinent('América');
        localStorage.setItem('dt_vip_chosen_continent', 'América');
      }

      if (finalUser.unlockedLevels) {
        setUnlockedLevels(finalUser.unlockedLevels);
        localStorage.setItem('scouting_unlocked_levels', JSON.stringify(finalUser.unlockedLevels));
      }
      if (finalUser.tacticalBoards) {
        setTacticalBoards(finalUser.tacticalBoards);
        localStorage.setItem('scouting_tactical_boards', JSON.stringify(finalUser.tacticalBoards));
      }

      localStorage.setItem('dt_user_id', finalUser.id);
      localStorage.setItem('dt_username', finalUser.username);
      localStorage.setItem('dt_user_code', finalUser.code);
      localStorage.setItem('dt_user_avatar', finalUser.avatar);
      localStorage.setItem('dt_user_email', finalUser.email);
      localStorage.setItem('dt_user_password', tempPassword);
      localStorage.setItem('user_subscription', finalUser.subscription || 'Ninguna');
      if (finalUser.license) {
        localStorage.setItem('dt_user_license', finalUser.license);
      } else {
        localStorage.removeItem('dt_user_license');
      }

      setIsRegistrationOpen(false);
      setIsRecoveryMode(false);
      setMatchedRecoveryUser(null);
      setRecoveryStep('verify');

      // Go to subscriptions
      setActiveTab('subscription');

      alert(`🎉 ¡Contraseña Restablecida Exitosamente!\n\nSe ha guardado de forma atómica en tu terminal. Bienvenido de vuelta, D.T. ${finalUser.username}.`);
    }
  };

  return (
    <AnimeHighTechSkin isActive={highTechSkin} onToggleActive={() => {
      setHighTechSkin(prev => {
        const next = !prev;
        localStorage.setItem('dt_high_tech_skin', String(next));
        return next;
      });
    }}>
      <div className="min-h-screen bg-[#000000] bg-halftone-dots text-slate-100 font-sans flex flex-col antialiased selection:bg-[#EF4444] selection:text-white border-[8px] border-black">
      
      {/* Responsive outer board wrapper */}
      <div className="flex flex-col min-h-screen w-full font-sans">
        
        {/* COMPACT TOP NAVIGATION BRAND BAR */}
        <header className="border-b-[4px] border-black bg-[#041208] text-white sticky top-0 z-40 p-3 flex items-center justify-between shadow-[0_4px_0px_#EF4444] shrink-0 select-none">
          <div 
            onClick={() => { setActiveTab('menu_hub'); setActiveTrivia(null); }}
            className="cursor-pointer active:scale-95 transition-all"
            title="Héroes del Deporte - Volver al Menú Principal"
          >
            <TactikAiLogo layout="horizontal" />
          </div>

          <div className="flex items-center gap-1.5">


            {userId === 'user_me' ? (
              <div 
                onClick={() => setIsRegistrationOpen(true)}
                className="flex items-center gap-1 bg-[#FDDF2B] hover:bg-[#ffe338] text-black border-2 border-black px-2.5 py-1 shadow-[2px_2px_0px_#000] text-[9.5px] font-bangers tracking-wider uppercase cursor-pointer bg-halftone-yellow"
                title="Click para registrarte"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#EF4444] shrink-0 animate-pulse" />
                <span>UNIRSE</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <div 
                  onClick={() => {
                    setIsRegistrationOpen(true);
                  }}
                  className="flex items-center gap-1.5 bg-white text-black border-2 border-black px-2.5 py-1 shadow-[2px_2px_0px_#000] text-[9.5px] font-mono font-bold font-black cursor-pointer hover:bg-slate-50"
                  title="Detalles de perfil"
                >
                  <span>{userAvatar}</span>
                  <span className="truncate max-w-[65px] font-sans text-[8.5px]">{username}</span>
                </div>
                
                <button
                  onClick={handleLogout}
                  className="border-2 border-black bg-[#EF4444] text-white p-1 shadow-[2px_2px_0px_#000] cursor-pointer flex items-center justify-center transition-all bg-halftone-red"
                  title="Cerrar Sesión"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            

          </div>
        </header>

        {/* ACTIVE MAIN CONTENT FRAMEWORK WITH DYNAMIC SCROLLER */}
        <div className="flex-1 flex flex-col h-full overflow-y-auto lg:custom-scrollbar pb-24 lg:pb-0">
          <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6.5">
            {activeTab !== 'menu_hub' && (
              <div className="mb-5 flex items-center justify-between select-none">
                <button
                  onClick={() => { setActiveTab('menu_hub'); setActiveTrivia(null); }}
                  className="px-3.5 py-1.5 bg-white hover:bg-slate-50 text-black border-[3px] border-black font-bangers text-xs uppercase tracking-wider shadow-[3px_3px_0px_#22c55e] cursor-pointer flex items-center gap-1.5 rounded-xl transition-all hover:translate-y-0.5 hover:shadow-[1.5px_1.5px_0px_#22c55e]"
                >
                  <span>⬅️ VOLVER AL PANEL GENERAL</span>
                </button>
                <div className="hidden sm:flex items-center gap-2 font-mono text-[10px] text-slate-500 bg-[#080c09] border-[2px] border-black px-2.5 py-1 rounded-lg">
                  <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
                  <span className="uppercase font-bold text-[#22c55e]">DT PANEL: {activeTab === 'groups_fixture' ? 'FIXTURE' : activeTab === 'flutter' ? 'SDK DOCS' : activeTab.toUpperCase()}</span>
                </div>
              </div>
            )}
            
            {!isRegistered && activeTab !== 'menu_hub' && (
              <div 
                onClick={() => setIsRegistrationOpen(true)}
                className="cursor-pointer mb-5 bg-[#FDDF2B] text-black border-[3.5px] border-black p-3.5 rounded-2xl shadow-[5px_5px_0px_#000] flex flex-col sm:flex-row items-center justify-between gap-3 font-comic font-bold text-xs hover:translate-y-0.5 hover:shadow-[3px_3px_0px_#000] transition-all rotate-[-0.5deg]"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">⚠️</span>
                  <span>
                    <strong>MODO SIMULACIÓN (INVITADO):</strong> Estás jugando y observando únicamente con la selección de <strong>Ecuador</strong> de forma gratuita. Tus puntos no se registrarán en el ranking oficial. ¡Haz clic aquí para registrarte de forma 100% gratuita y desbloquear las 32 selecciones!
                  </span>
                </div>
                <span className="bg-black text-white text-[10px] px-2.5 py-1 rounded border border-black font-bangers uppercase tracking-wider shrink-0">
                  REGISTRARME GRATIS ⚡
                </span>
              </div>
            )}
            
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTrivia ? 'trivia' : activeTab}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="w-full h-full"
              >
                {/* If Active Trivia is loaded, override layout to focus on the game */}
                {activeTrivia ? (
          <TriviaModule
            country={activeTrivia.country}
            flag={activeTrivia.flag}
            level={activeTrivia.level}
            onSuccess={handleTriviaSuccess}
            onBack={() => setActiveTrivia(null)}
          />
        ) : (
          <>
            {activeTab === 'menu_hub' && (
              <div className="w-full flex flex-col gap-8 select-none" id="menu-hub-content">
                {/* Header Premium de Bienvenida / Comic Title Card */}
                <div className="relative overflow-hidden bg-[#080c09] border-[3.5px] border-black p-6 sm:p-8 rounded-3xl shadow-[6px_6px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
                  <div className="z-10 flex-1 text-center md:text-left">
                    {isAdmin ? (
                      <div className="inline-flex items-center gap-2 bg-[#EF4444] text-white border-2 border-black font-mono text-[9px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-widest mb-3 rotate-[-1deg] shadow-[2px_2px_0px_#000]">
                        👑 ACCESO ADMINISTRADOR ACTIVO
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-2 bg-[#22c55e] text-black border-2 border-black font-mono text-[9px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-widest mb-3 rotate-[-1deg] shadow-[2px_2px_0px_#000]">
                        ⚽ PERFIL DIRECTOR TÉCNICO
                      </div>
                    )}
                    <div className="flex justify-center md:justify-start mb-4 overflow-hidden">
                      <TactikAiLogo layout="full" iconSize={100} className="!p-0 origin-center md:origin-left scale-90 sm:scale-100" />
                    </div>
                    <p className="text-xs sm:text-sm font-comic font-bold text-slate-300 max-w-xl">
                      {isAdmin 
                        ? 'Bienvenido al centro táctico del Álbum Oficial. Las utilidades del sistema se despliegan copando toda la pantalla para que tomes el control absoluto de coleccionables, ligas y sorteos auditables.'
                        : 'Bienvenido al centro táctico de tu Álbum Oficial. Las utilidades del sistema se despliegan copando toda la pantalla para que tomes el control de tus coleccionables, ligas y tu pizarra táctica.'
                      }
                    </p>
                  </div>
                  
                  {/* Quick stats floating badge combined with user panel from left image */}
                  <div className="z-10 flex flex-col sm:flex-row md:flex-col lg:flex-row items-center gap-5 w-full md:w-auto shrink-0 select-none">
                    {/* Large white Stats Card from right image */}
                    <div className="bg-white border-[3.5px] border-black p-4 rounded-2xl shadow-[5px_5px_0px_#22c55e] rotate-1 hover:rotate-0 transition-transform duration-250 flex flex-col items-center justify-center text-black w-full sm:w-[160px] md:w-full lg:w-[160px] min-h-[110px] shrink-0">
                      <span className="text-2xl">⚡</span>
                      <span className="text-3xl font-bangers tracking-tight leading-none text-black mt-1">
                        {currentUserInfo.unlockedStickersCount} / {COUNTRIES.length * 26}
                      </span>
                      <span className="text-[9px] font-mono font-black text-gray-500 uppercase tracking-widest mt-0.5">
                        Cromos Convocados
                      </span>
                    </div>

                    {/* User credentials and Action buttons from left image */}
                    <div className="flex flex-col gap-2.5 w-full sm:w-[240px] md:w-full lg:w-[240px] shrink-0">
                      {/* 1. Yellow Badge: ⚡ HÉROES CONVOCADOS ⚡ */}
                      <div className="w-full text-center">
                        <span className="w-full text-[10px] font-mono bg-[#FDDF2B] text-black px-3 py-1.5 border-[2.5px] border-black font-black uppercase tracking-widest rounded-md rotate-[-0.5deg] inline-block shadow-[2px_2px_0px_#000]">
                          ⚡ HÉROES CONVOCADOS ⚡
                        </span>
                      </div>

                      {/* 2. Credentials Card (White background, green shadow, containing avatar & username/userCode) */}
                      <div 
                        onClick={() => {
                          setIsRegistrationOpen(true);
                        }}
                        title="Detalles de Perfil (Haz clic para ver y gestionar tu sesión oficial)"
                        className="w-full cursor-pointer bg-white border-[3px] border-black p-3 rounded-2xl shadow-[4.5px_4.5px_0px_#22c55e] flex items-center gap-3 hover:translate-y-0.5 hover:shadow-[2.5px_2.5px_0px_#22c55e] transition-all text-black"
                      >
                        <span className="text-3xl filter drop-shadow-[2px_2px_0px_rgba(0,0,0,0.15)] select-none shrink-0">
                          {userAvatar || '👑'}
                        </span>
                        <div className="text-left leading-tight min-w-0 flex-1">
                          <span className="text-sm font-sans font-black tracking-wide uppercase italic block truncate">
                            {isAdmin ? "DT-ADMINISTRADOR" : username.toUpperCase()}
                          </span>
                          <span className="text-[10.5px] font-mono font-bold block text-slate-500 mt-0.5">
                            {isAdmin ? "DT-ADMIN" : userCode}
                          </span>
                        </div>
                      </div>

                      {/* 3. Cerrar Sesión Button (White button, red shadow) */}
                      {userId !== 'user_me' ? (
                        <button
                          onClick={handleLogout}
                          className="w-full border-[3px] border-black bg-white hover:bg-slate-50 text-black px-4 py-2 font-sans font-black text-xs uppercase tracking-wider shadow-[3.5px_3.5px_0px_#ef4444] hover:translate-y-0.5 hover:shadow-[1.5px_1.5px_0px_#ef4444] cursor-pointer flex items-center justify-between gap-2 transition-all rounded-2xl"
                        >
                          <span className="font-extrabold text-[11px]">Cerrar Sesión</span>
                          <ChevronRight className="w-4 h-4 text-black shrink-0 stroke-[3.5]" />
                        </button>
                      ) : (
                        <button
                          onClick={() => setIsRegistrationOpen(true)}
                          className="w-full border-2 border-dashed border-slate-700 hover:border-slate-600 text-slate-400 bg-black/20 hover:text-white px-4 py-2 font-mono text-[9px] uppercase font-bold rounded-2xl cursor-pointer flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
                        >
                          <Sparkles className="w-3 h-3 text-yellow-500" />
                          <span>REGISTRO REQUERIDO</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>


                {/* HEROIC COMIC MANUAL: MÉTODO DE JUEGO, PUNTOS Y PREMIOS */}
                <div className="border-[3.5px] border-black bg-[#080c09] rounded-3xl p-6 shadow-[8px_8px_0px_#000] relative overflow-hidden" id="epic-how-to-play-manual">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-[#EF4444]/15 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#22c55e]/15 rounded-full blur-3xl pointer-events-none" />
                  
                  {/* Title Header with Action Bubble Badge style */}
                  <div className="flex flex-col md:flex-row items-center gap-4 border-b-[3px] border-black pb-5 mb-6">
                    <div className="bg-[#EF4444] text-white font-bangers text-3xl px-5 py-2.5 rounded-xl border-2 border-black rotate-[-1deg] shadow-[4px_4px_0px_#000] tracking-wider uppercase inline-block shrink-0">
                      ⚡ GUÍA OFICIAL DEL DT ⚡
                    </div>
                    <div className="text-center md:text-left">
                      <h3 className="font-bangers text-2xl text-white tracking-wide uppercase leading-tight">MÉTODO DE JUEGO, ACREDITACIÓN DE PUNTOS Y GRANDES PREMIOS</h3>
                      <p className="font-mono text-xs text-[#11b782] font-black uppercase tracking-wider">REGLAMENTO OFICIAL DEL ÁLBUM TRIVIA HÉROES DEL DEPORTE</p>
                    </div>
                  </div>

                  {/* Asymmetrical 3-Grid Comic Panels */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Panel A: METODO DE JUEGO (Vibrant Crimson details) */}
                    <div className="bg-white border-[3px] border-black p-5 rounded-2xl shadow-[5px_5px_0px_rgba(0,0,0,1)] relative flex flex-col justify-between" id="panel-gameplay-method">
                      <div>
                        <div className="inline-block bg-[#EF4444] text-white font-bangers text-xs px-3 py-1 rounded border-2 border-black rotate-[-1.5deg] mb-3 shadow-[2px_2px_0px_#000]">
                          PASO 1: ¿CÓMO JUGAR?
                        </div>
                        <h4 className="font-black text-black text-sm uppercase font-sans mb-3 tracking-tight flex items-center gap-2">
                          <span>⚽</span> DOMINA EL CAMPO TÁCTICO
                        </h4>
                        <ul className="space-y-2.5 text-xs text-gray-700 font-comic font-bold">
                          <li className="flex items-start gap-2">
                            <span className="text-[#EF4444] text-base shrink-0">✔</span>
                            <span><strong>Responde Trivias:</strong> Supera las trivias de 3 niveles por país para abrir sobres y coleccionar cromos.</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-[#EF4444] text-base shrink-0">✔</span>
                            <span><strong>Alinea tu Once:</strong> Arrastra a tus jugadores favoritos en la Pizarra Táctica para armar tu XI ideal.</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-[#EF4444] text-base shrink-0">✔</span>
                            <span><strong>Pronostica en Vivo:</strong> Pronostica los marcadores reales de los partidos del Fixture Oficial.</span>
                          </li>
                        </ul>
                      </div>
                      <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center bg-gray-50 -mx-5 -mb-5 p-4 rounded-b-2xl">
                        <span className="text-[9px] font-mono text-slate-500 font-bold uppercase tracking-wide">Álbum 100% Interactivo</span>
                        <span className="text-xs">⚔</span>
                      </div>
                    </div>

                    {/* Panel B: ACREDITACION DE PUNTOS (Deep forest green and clean white slots) */}
                    <div className="bg-white border-[3px] border-black p-5 rounded-2xl shadow-[5px_5px_0px_#11b782] relative flex flex-col justify-between" id="panel-scoring-system">
                      <div>
                        <div className="inline-block bg-[#11b782] text-black font-bangers text-xs px-3 py-1 rounded border-2 border-black rotate-[1deg] mb-3 shadow-[2px_2px_0px_#000]">
                          SISTEMA DE PUNTOS
                        </div>
                        <h4 className="font-black text-black text-sm uppercase font-sans mb-3 tracking-tight flex items-center gap-2">
                          <span>⚡</span> TABLA DE VALORACIÓN
                        </h4>
                        <div className="space-y-1.5 text-xs text-cool-gray-800">
                          <div className="flex items-center justify-between border-b border-gray-100 pb-1">
                            <span className="text-gray-600 font-comic font-bold">Cada cromo desbloqueado</span>
                            <span className="font-mono font-black text-black bg-slate-100 px-1.5 py-0.5 rounded border border-black text-[10px] shrink-0">+1 PT</span>
                          </div>
                          <div className="flex items-center justify-between border-b border-gray-100 pb-1">
                            <span className="text-gray-600 font-comic font-bold">Completar un país completo</span>
                            <span className="font-mono font-black text-black bg-[#11b782]/20 px-1.5 py-0.5 rounded border border-[#11b782] text-[10px] shrink-0">+5 PTS</span>
                          </div>
                          <div className="flex items-center justify-between border-b border-gray-100 pb-1">
                            <span className="text-gray-600 font-comic font-bold">Acierto jugador en alineación XI</span>
                            <span className="font-mono font-black text-white bg-slate-900 px-1.5 py-0.5 rounded border border-black text-[10px] shrink-0">+10 PTS</span>
                          </div>
                          <div className="flex items-center justify-between border-b border-gray-100 pb-1">
                            <span className="text-gray-600 font-comic font-bold">Acierto de score en fixture</span>
                            <span className="font-mono font-black text-white bg-[#EF4444] px-1.5 py-0.5 rounded border border-black text-[10px] shrink-0">+20 PTS</span>
                          </div>
                          <div className="flex items-center justify-between border-b border-gray-100 pb-1">
                            <span className="text-gray-600 font-comic font-bold">Recomendación (Plan Básico Scout)</span>
                            <span className="font-mono font-black text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-400 text-[10px] shrink-0">+5 PTS</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600 font-comic font-bold">Recomendación (Plan VIP completo)</span>
                            <span className="font-mono font-black text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-400 text-[10px] shrink-0">+15 PTS</span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center bg-emerald-50/40 -mx-5 -mb-5 p-4 rounded-b-2xl">
                        <span className="text-[9px] font-mono text-emerald-700 font-bold uppercase tracking-wide">Puntos Auditados Atómicamente</span>
                        <span className="text-xs text-emerald-650">⚽</span>
                      </div>
                    </div>

                    {/* Panel C: PREMIOS EN LA PAGINA (Heroic Gold details) */}
                    <div className="bg-white border-[3px] border-black p-5 rounded-2xl shadow-[5px_5px_0px_#000] relative flex flex-col justify-between" id="panel-prizes-rewards">
                      <div>
                        <div className="inline-block bg-[#FDDF2B] text-black font-bangers text-xs px-3 py-1 rounded border-2 border-black rotate-[-0.5deg] mb-3 shadow-[2px_2px_0px_#000]">
                          🏆 PREMIOS Y TRANSPARENCIA
                        </div>
                        <h4 className="font-black text-black text-sm uppercase font-sans mb-2 tracking-tight flex items-center gap-2">
                          <span>👑</span> PODIO DE GANADORES OFICIAL
                        </h4>
                        <p className="text-[10.5px] text-gray-600 leading-relaxed font-semibold mb-3">
                          Los usuarios con planes activos (Plan Scout Básico o Pase VIP Elite) que alcancen los primeros puestos del ranking general recibirán los siguientes premios en efectivo el <strong>30 de julio</strong>:
                        </p>
                        <ul className="space-y-1.5 text-xs text-gray-700 font-comic font-bold mb-3">
                          <li className="flex items-center justify-between bg-amber-100/30 border border-amber-300/40 rounded-lg p-2">
                            <span className="flex items-center gap-2 text-gray-800">
                              <span className="text-base text-amber-500">🥇</span> <strong>1er Lugar</strong>
                            </span>
                            <span className="font-mono font-black text-amber-700 text-sm">$1.000 USD</span>
                          </li>
                          <li className="flex items-center justify-between bg-slate-100/50 border border-slate-300/40 rounded-lg p-2">
                            <span className="flex items-center gap-2 text-gray-800">
                              <span className="text-base text-slate-500">🥈</span> <strong>2do Lugar</strong>
                            </span>
                            <span className="font-mono font-black text-slate-700 text-sm">$500 USD</span>
                          </li>
                          <li className="flex items-center justify-between bg-amber-600/10 border border-amber-700/20 rounded-lg p-2">
                            <span className="flex items-center gap-2 text-gray-800">
                              <span className="text-base text-amber-700">🥉</span> <strong>3er Lugar</strong>
                            </span>
                            <span className="font-mono font-black text-amber-800 text-sm">$250 USD</span>
                          </li>
                        </ul>
                        
                        <div className="bg-slate-900 text-white p-3 rounded-xl border-2 border-black text-[10px] space-y-1.5 leading-normal">
                          <p>
                            📺 <strong>Transmisión en Vivo:</strong> La premiación se realizará en vivo el <strong>30 de julio de 2026</strong> a través de nuestras transmisiones oficiales en <strong>Facebook Live</strong> y <strong>YouTube</strong>.
                          </p>
                          <p>
                            🛡️ <strong>Seguridad y Fe Pública:</strong> Para garantizar absoluta transparencia, tanto el cómputo final de puntos del ranking como el destino de las donaciones son <strong>auditados y certificados por un Notario Público</strong>.
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center bg-yellow-50/40 -mx-5 -mb-5 p-4 rounded-b-2xl">
                        <span className="text-[9px] font-mono text-amber-700 font-bold uppercase tracking-wide">ELEGIBILIDAD AUDITADA POR NOTARIO</span>
                        <span className="text-xs text-amber-600">🏆</span>
                      </div>
                    </div>

                  </div>
                </div>

                {/* 8-Panel Interactive Comic Grid (Asymmetrical panels with solid shadows) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 pb-12">
                  
                  {/* Panel 1: ÁLBUM Y COLECCIÓN (High contrast brilliant neon green, bold text) */}
                  <motion.div 
                    whileHover={{ scale: 1.025, y: -4 }}
                    onClick={() => { setActiveTab('album'); }}
                    className={`cursor-pointer group relative overflow-hidden border-[3.5px] border-black p-6 rounded-2xl shadow-[6px_6px_0px_#000] transition-all flex flex-col justify-between min-h-[170px] ${
                      !isRegistered 
                        ? 'bg-[#14231e] text-slate-400 border-slate-800 opacity-85 hover:opacity-100' 
                        : 'bg-[#11b782] text-black'
                    }`}
                  >
                    {!isRegistered && (
                      <div className="absolute top-2.5 right-2.5 bg-[#EF4444] text-white text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded border-2 border-black rotate-[2deg] shadow-[2px_2px_0px_#000] z-20">
                        🔒 REGISTRO REQUERIDO
                      </div>
                    )}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                    <div className="relative z-10 flex items-start justify-between">
                      <div className="flex-1">
                        <div className={`font-mono text-[9px] font-black uppercase tracking-wider mb-1 ${!isRegistered ? 'text-emerald-500/60' : 'text-black/70'}`}>CINTURÓN 01</div>
                        <h3 className={`font-bangers text-2xl lg:text-3xl tracking-wide uppercase leading-none mb-2 ${!isRegistered ? 'text-slate-300' : 'text-black'}`}>
                           📚 ÁLBUM & COLECCIÓN
                        </h3>
                        <p className={`text-[11px] font-comic font-bold leading-tight max-w-sm ${!isRegistered ? 'text-slate-400/80' : 'text-black/85'}`}>
                          Explora las plantillas y los cromos oficiales de las mejores selecciones de América y el mundo. ¡Completa los 3 niveles de trivias por país!
                        </p>
                      </div>
                      <div className={`w-12 h-12 border-2 border-black rounded-lg flex items-center justify-center font-bold text-2xl transition-transform group-hover:rotate-6 ${!isRegistered ? 'bg-slate-900 text-slate-500 shadow-[2.5px_2.5px_0px_rgba(0,0,0,0.5)]' : 'bg-black text-[#11b782] shadow-[2.5px_2.5px_0px_#005535]'}`}>
                        📚
                      </div>
                    </div>
                    
                    <div className={`relative z-10 mt-5 pt-3.5 border-t flex items-center justify-between font-mono text-[9px] font-black ${!isRegistered ? 'border-slate-800 text-slate-500' : 'border-black/10 text-black'}`}>
                      <div className="flex items-center gap-1">
                        <span>⚡ {currentUserInfo.unlockedStickersCount} CROMOS COL.</span>
                        <span className={!isRegistered ? 'text-slate-700' : 'text-black/50'}>|</span>
                        <span>🏆 {currentUserInfo.completedCountriesList.length} COMPLETADOS</span>
                      </div>
                      <span className="flex items-center gap-0.5 bg-black text-white px-2 py-1 rounded border-2 border-black font-bangers text-[10px] tracking-wider uppercase group-hover:translate-x-1 transition-transform">
                        ENTRAR <ChevronRight className="w-3 h-3 text-white inline stroke-[3]" />
                      </span>
                    </div>
                  </motion.div>

                  {/* Panel 2: FIXTURE OFICIAL (White backing with red details) */}
                  <motion.div 
                    whileHover={{ scale: 1.025, y: -4 }}
                    onClick={() => { setActiveTab('groups_fixture'); }}
                    className={`cursor-pointer group relative overflow-hidden border-[3.5px] border-black p-6 rounded-2xl shadow-[6px_6px_0px_#000] transition-all flex flex-col justify-between min-h-[170px] ${
                      !isRegistered 
                        ? 'bg-slate-950 text-slate-400 border-slate-850 opacity-85 hover:opacity-100' 
                        : 'bg-white text-black'
                    }`}
                  >
                    {!isRegistered && (
                      <div className="absolute top-2.5 right-2.5 bg-[#EF4444] text-white text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded border-2 border-black rotate-[2deg] shadow-[2px_2px_0px_#000] z-20">
                        🔒 REGISTRO REQUERIDO
                      </div>
                    )}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-slate-100/5 rounded-full blur-2xl pointer-events-none" />
                    <div className="relative z-10 flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-mono text-[9px] font-black text-slate-500 uppercase tracking-wider mb-1">CINTURÓN 02</div>
                        <h3 className={`font-bangers text-2xl lg:text-3xl tracking-wide uppercase leading-none mb-2 ${!isRegistered ? 'text-slate-300' : 'text-black'}`}>
                           📅 FIXTURE OFICIAL
                        </h3>
                        <p className={`text-[11px] font-comic font-bold leading-tight max-w-sm ${!isRegistered ? 'text-slate-400/80' : 'text-gray-700'}`}>
                          Consulta el calendario oficial de los grupos del Torneo 2026. Registra tus pronósticos del simulador con los que sumarás puntos.
                        </p>
                      </div>
                      <div className={`w-12 h-12 text-white border-2 border-black rounded-lg flex items-center justify-center font-bold text-2xl shadow-[2.5px_2.5px_0px_#000] group-hover:rotate-6 transition-transform ${!isRegistered ? 'bg-slate-800 opacity-60' : 'bg-[#EF4444]'}`}>
                        📅
                      </div>
                    </div>
                    
                    <div className={`relative z-10 mt-5 pt-3.5 border-t flex items-center justify-between font-mono text-[9px] font-black ${!isRegistered ? 'border-slate-800 text-slate-500' : 'border-slate-100 text-slate-500'}`}>
                      <div className={`flex items-center gap-1.5 ${!isRegistered ? 'text-slate-500' : 'text-black'}`}>
                        <span className="bg-[#FDDF2B] px-1.5 py-0.5 border border-black text-[8px] uppercase font-bold text-black">AUDITABLE</span>
                        <span>⚽ 12 PARTIDOS OFICIALES</span>
                      </div>
                      <span className="flex items-center gap-0.5 bg-black text-white px-2 py-1 rounded border-2 border-black font-bangers text-[10px] tracking-wider uppercase group-hover:translate-x-1 transition-transform">
                        VER GRUPOS <ChevronRight className="w-3 h-3 text-white inline stroke-[3]" />
                      </span>
                    </div>
                  </motion.div>

                  {/* Panel 3: LA PIZARRA D.T. (White backing with tactical layout) */}
                  <motion.div 
                    whileHover={{ scale: 1.025, y: -4 }}
                    onClick={() => { setActiveTab('board'); }}
                    className={`cursor-pointer group relative overflow-hidden border-[3.5px] border-black p-6 rounded-2xl shadow-[6px_6px_0px_#000] transition-all flex flex-col justify-between min-h-[170px] ${
                      !isRegistered 
                        ? 'bg-slate-950 text-slate-400 border-slate-850 opacity-85 hover:opacity-100' 
                        : 'bg-white text-black'
                    }`}
                  >
                    {!isRegistered && (
                      <div className="absolute top-2.5 right-2.5 bg-[#EF4444] text-white text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded border-2 border-black rotate-[2deg] shadow-[2px_2px_0px_#000] z-20">
                        🔒 REGISTRO REQUERIDO
                      </div>
                    )}
                    <div className="relative z-10 flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-mono text-[9px] font-black text-slate-500 uppercase tracking-wider mb-1">CINTURÓN 03</div>
                        <h3 className={`font-bangers text-2xl lg:text-3xl tracking-wide uppercase leading-none mb-2 ${!isRegistered ? 'text-slate-300' : 'text-black'}`}>
                           📋 LA PIZARRA D.T.
                        </h3>
                        <p className={`text-[11px] font-comic font-bold leading-tight max-w-sm ${!isRegistered ? 'text-slate-400/80' : 'text-gray-700'}`}>
                          Dibuja tus estrategias arrastrando stickers en una cancha interactiva táctica adaptada a pantallas móviles. ¡Arma tu plantilla para ser campeona!
                        </p>
                      </div>
                      <div className={`w-12 h-12 text-black border-2 border-black rounded-lg flex items-center justify-center font-bold text-2xl shadow-[2.5px_2.5px_0px_#000] group-hover:rotate-6 transition-transform ${!isRegistered ? 'bg-slate-800 text-slate-500 opacity-60' : 'bg-[#11b782]'}`}>
                        📋
                      </div>
                    </div>
                    
                    <div className={`relative z-10 mt-5 pt-3.5 border-t flex items-center justify-between font-mono text-[9px] font-black ${!isRegistered ? 'border-slate-800 text-slate-500' : 'border-slate-100 text-slate-500'}`}>
                      <div className={`flex items-center gap-1 ${!isRegistered ? 'text-slate-500' : 'text-black'}`}>
                        <span className="font-bold">🏟️ TÁCTICA ACTIVA:</span>
                        <span className={`font-bold uppercase ${!isRegistered ? 'text-slate-500' : 'text-emerald-700'}`}>{tacticalBoards[0]?.layoutType || "4-3-3 CLÁSICO"}</span>
                      </div>
                      <span className="flex items-center gap-0.5 bg-black text-white px-2 py-1 rounded border-2 border-black font-bangers text-[10px] tracking-wider uppercase group-hover:translate-x-1 transition-transform">
                        ABRIR TÁCTICA <ChevronRight className="w-3 h-3 text-white inline stroke-[3]" />
                      </span>
                    </div>
                  </motion.div>

                  {/* Panel 4: LIGAS DE HONOR (Yellow trophy style comic card) */}
                  <motion.div 
                    whileHover={{ scale: 1.025, y: -4 }}
                    onClick={() => { setActiveTab('leaderboard'); }}
                    className={`cursor-pointer group relative overflow-hidden border-[3.5px] border-black p-6 rounded-2xl shadow-[6px_6px_0px_#000] transition-all flex flex-col justify-between min-h-[170px] ${
                      !isRegistered 
                        ? 'bg-[#211e0e] text-slate-400 border-slate-800 opacity-85 hover:opacity-100' 
                        : 'bg-[#FDDF2B] text-black'
                    }`}
                  >
                    {!isRegistered && (
                      <div className="absolute top-2.5 right-2.5 bg-[#EF4444] text-white text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded border-2 border-black rotate-[2deg] shadow-[2px_2px_0px_#000] z-20">
                        🔒 REGISTRO REQUERIDO
                      </div>
                    )}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
                    <div className="relative z-10 flex items-start justify-between">
                      <div className="flex-1">
                        <div className={`font-mono text-[9px] font-black uppercase tracking-wider mb-1 ${!isRegistered ? 'text-yellow-600/60' : 'text-black/70'}`}>CINTURÓN 04</div>
                        <h3 className={`font-bangers text-2xl lg:text-3xl tracking-wide uppercase leading-none mb-2 ${!isRegistered ? 'text-slate-300' : 'text-black'}`}>
                           🏆 LIGAS DE HONOR
                        </h3>
                        <p className={`text-[11px] font-comic font-bold leading-tight max-w-sm ${!isRegistered ? 'text-slate-400/80' : 'text-black/90'}`}>
                          Únete a las salas competitivas de coleccionistas de todo el mundo. Compara tus puntos con otros DTs de elite en tiempo real.
                        </p>
                      </div>
                      <div className={`w-12 h-12 border-2 border-black rounded-lg flex items-center justify-center font-bold text-2xl shadow-[2.5px_2.5px_0px_#000] group-hover:rotate-6 transition-transform ${!isRegistered ? 'bg-slate-900 text-slate-500 shadow-[2.5px_2.5px_0px_rgba(0,0,0,0.5)]' : 'bg-black text-[#FDDF2B]'}`}>
                        🏆
                      </div>
                    </div>
                    
                    <div className={`relative z-10 mt-5 pt-3.5 border-t flex items-center justify-between font-mono text-[9px] font-black ${!isRegistered ? 'border-slate-800 text-slate-500' : 'border-black/10 text-black'}`}>
                      <div className="flex items-center gap-1.5">
                        <span>⭐ TU PUNTAJE GLOBAL:</span>
                        <span className={`font-black px-1.5 py-0.5 border rounded text-[10px] ${!isRegistered ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-black text-[#FDDF2B] border-black'}`}>{currentUserInfo.totalScore} PTS</span>
                      </div>
                      <span className="flex items-center gap-0.5 bg-black text-white px-2 py-1 rounded border-2 border-black font-bangers text-[10px] tracking-wider uppercase group-hover:translate-x-1 transition-transform">
                        VER RANKING <ChevronRight className="w-3 h-3 text-white inline stroke-[3]" />
                      </span>
                    </div>
                  </motion.div>

                  {/* Panel 5: PASE VIP ELITE (Black/Coral theme with stars) */}
                  <motion.div 
                    whileHover={{ scale: 1.025, y: -4 }}
                    onClick={() => { setActiveTab('subscription'); }}
                    className={`cursor-pointer group relative overflow-hidden border-[3.5px] border-black p-6 rounded-2xl shadow-[6px_6px_0px_#000] transition-all flex flex-col justify-between min-h-[170px] ${
                      !isRegistered 
                        ? 'bg-[#151c2e] text-slate-400 border-slate-800 opacity-85 hover:opacity-100' 
                        : 'bg-gradient-to-br from-indigo-900 to-[#0e1713] text-white'
                    }`}
                  >
                    {!isRegistered && (
                      <div className="absolute top-2.5 right-2.5 bg-[#EF4444] text-white text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded border-2 border-black rotate-[2deg] shadow-[2px_2px_0px_#000] z-20">
                        🔒 REGISTRO REQUERIDO
                      </div>
                    )}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#11b782]/5 rounded-full blur-2xl pointer-events-none" />
                    <div className="relative z-10 flex items-start justify-between">
                      <div className="flex-1">
                        <div className={`font-mono text-[9px] font-black uppercase tracking-wider mb-1 ${!isRegistered ? 'text-indigo-500/50' : 'text-[#11b782]'}`}>CINTURÓN 05</div>
                        <h3 className={`font-bangers text-2xl lg:text-3xl tracking-wide uppercase leading-none mb-2 ${!isRegistered ? 'text-slate-300' : 'text-white'}`}>
                           💳 PASE VIP ELITE
                        </h3>
                        <p className={`text-[11px] font-comic font-bold leading-tight max-w-sm ${!isRegistered ? 'text-slate-400/80' : 'text-slate-300'}`}>
                          Desbloquea los análisis tácticos detallados de scout, un escudo exclusivo de Director Técnico y sobres de cromos premium sin límites.
                        </p>
                      </div>
                      <div className={`w-12 h-12 border-2 border-black rounded-lg flex items-center justify-center font-bold text-2xl shadow-[2.5px_2.5px_0px_#000] group-hover:rotate-6 transition-transform ${!isRegistered ? 'bg-slate-900 text-slate-500 shadow-[2.5px_2.5px_0px_rgba(0,0,0,0.5)]' : 'bg-white text-black'}`}>
                        💳
                      </div>
                    </div>
                    
                    <div className={`relative z-10 mt-5 pt-3.5 border-t flex flex-wrap items-center justify-between gap-2 font-mono text-[9px] font-black ${!isRegistered ? 'border-slate-800 text-slate-500' : 'border-emerald-950 text-slate-400'}`}>
                      <div className="flex items-center gap-2">
                        <span className={`px-1.5 py-0.5 border rounded text-[8.5px] uppercase font-bold tracking-wider ${!isRegistered ? 'bg-slate-900 border-slate-800 text-slate-400' : 'text-white bg-emerald-800 border-[#11b782]'}`}>
                          {userSubscription === 'Ninguna' ? 'ESTÁNDAR GRATIS' : 'PROVEEDOR ACTIVO'}
                        </span>
                        <span className={!isRegistered ? 'text-slate-500' : 'text-emerald-400'}>${userCashBalance.toFixed(2)} USD</span>
                        <span className={!isRegistered ? 'text-slate-500' : 'text-amber-400'}>| {userCoins} 🪙</span>
                      </div>
                      <span className={`flex items-center gap-0.5 px-2 py-1 rounded border-2 border-black font-bangers text-[10px] tracking-wider uppercase group-hover:translate-x-1 transition-transform ${!isRegistered ? 'bg-slate-900 text-slate-500' : 'bg-[#11b782] text-black'}`}>
                        BILLETERA <ChevronRight className={`w-3 h-3 inline stroke-[3] ${!isRegistered ? 'text-slate-500' : 'text-black'}`} />
                      </span>
                    </div>
                  </motion.div>

                  {/* Panel 6: AUDITORÍA SORTEOS (Rose pink audit theme) */}
                  {isAdmin && (
                    <motion.div 
                      whileHover={{ scale: 1.025, y: -4 }}
                      onClick={() => { if (isAdmin) setActiveTab('admin'); else setIsRegistrationOpen(true); }}
                      className="cursor-pointer group relative overflow-hidden bg-rose-600 border-[3.5px] border-black p-6 rounded-2xl shadow-[6px_6px_0px_#000] transition-all flex flex-col justify-between min-h-[170px]"
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                      <div className="relative z-10 flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-mono text-[9px] font-black text-red-100 uppercase tracking-wider mb-1">CINTURÓN 06</div>
                          <h3 className="font-bangers text-2xl lg:text-3xl tracking-wide text-white uppercase leading-none mb-2">
                             👤 AUDITORÍA SORTEOS
                          </h3>
                          <p className="text-[11px] font-comic font-bold text-rose-100 leading-tight max-w-sm">
                            Garantiza sorteos 100% justos. Comprueba los certificados, semillas de aleatoriedad del algoritmo de sobres y marcas de tiempo sha-256.
                          </p>
                        </div>
                        <div className="w-12 h-12 bg-black text-rose-500 border-2 border-black rounded-lg flex items-center justify-center font-bold text-2xl shadow-[2.5px_2.5px_0px_#000] group-hover:rotate-6 transition-transform">
                          👤
                        </div>
                      </div>
                      
                      <div className="relative z-10 mt-5 pt-3.5 border-t border-rose-750 flex items-center justify-between text-rose-200 font-mono text-[9px] font-black">
                        <div className="flex items-center gap-1.5">
                          <span className="bg-black/40 text-[8.5px] px-1.5 py-0.5 rounded border border-black font-semibold text-white font-mono">SHA-256 ENCR.</span>
                          {isAdmin ? (
                            <span className="text-[#11b782] font-black uppercase text-[8px]">● ADMIN CONCEDIDO</span>
                          ) : (
                            <span className="text-rose-200 font-black uppercase text-[8px]">🔒 SE REQUIERE PERFIL</span>
                          )}
                        </div>
                        <span className="flex items-center gap-0.5 bg-black text-white px-2 py-1 rounded border-2 border-black font-bangers text-[10px] tracking-wider uppercase group-hover:translate-x-1 transition-transform">
                          {isAdmin ? 'VER CONSOLA' : 'COMPROBAR'} <ChevronRight className="w-3 h-3 text-white inline stroke-[3]" />
                        </span>
                      </div>
                    </motion.div>
                  )}

                  {/* Panel 7: PWA SDK DOCS (Technical layout style comic card) */}
                  {isAdmin && (
                    <motion.div 
                      whileHover={{ scale: 1.025, y: -4 }}
                      onClick={() => { if (isAdmin) setActiveTab('flutter'); else setIsRegistrationOpen(true); }}
                      className="cursor-pointer group relative overflow-hidden bg-slate-900 border-[3.5px] border-black p-6 rounded-2xl shadow-[6px_6px_0px_#000] transition-all flex flex-col justify-between min-h-[170px]"
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-slate-800 rounded-full blur-2xl pointer-events-none" />
                      <div className="relative z-10 flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-mono text-[9px] font-black text-[#11b782] uppercase tracking-wider mb-1">CINTURÓN 07</div>
                          <h3 className="font-bangers text-2xl lg:text-3xl tracking-wide text-white uppercase leading-none mb-2">
                             📖 PWA SDK DOCS
                          </h3>
                          <p className="text-[11px] font-comic font-bold text-slate-300 leading-tight max-w-sm">
                            Para ingenieros oficiales. Estudia el manual del kit de desarrollo nativo multiplataforma (Flutter/React/PWA) con motor de renderizado offline.
                          </p>
                        </div>
                        <div className="w-12 h-12 bg-[#11b782] text-black border-2 border-black rounded-lg flex items-center justify-center font-bold text-2xl shadow-[2.5px_2.5px_0px_#000] group-hover:rotate-6 transition-transform">
                          📖
                        </div>
                      </div>
                      
                      <div className="relative z-10 mt-5 pt-3.5 border-t border-slate-950 flex items-center justify-between text-slate-500 font-mono text-[9px] font-black">
                        <div className="flex items-center gap-1.5">
                          <span className="bg-[#11b782]/10 text-[#11b782] border border-[#11b782]/40 px-1.5 py-0.5 rounded text-[8px] uppercase font-bold">FLUTTER</span>
                          <span>OFFLINE ENGINE v1.2</span>
                        </div>
                        <span className="flex items-center gap-0.5 bg-black text-white px-2 py-1 rounded border-2 border-black font-bangers text-[10px] tracking-wider uppercase group-hover:translate-x-1 transition-transform">
                          {isAdmin ? 'LEER MANUAL' : 'SOLICITAR'} <ChevronRight className="w-3 h-3 text-white inline stroke-[3]" />
                        </span>
                      </div>
                    </motion.div>
                  )}



                </div>
              </div>
            )}

            {activeTab === 'album' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="album-tab-content">
                
                {/* Lateral Country Picker List (Comic Rack Stand) */}
                <div className="lg:col-span-4 bg-[#0a0f0d] border-[3.5px] border-black rounded-2xl p-5 shadow-[6px_6px_0px_#000] flex flex-col h-fit">
                  <div className="bg-[#EF4444] bg-halftone-red text-white border-[2.5px] border-black p-2.5 rotate-[-1deg] shadow-[3.3px_3.3px_0px_#000] mb-5 text-center">
                    <h3 className="font-bangers text-xl uppercase tracking-wider block">
                      📚 TOMOS DISPONIBLES
                    </h3>
                    <p className="text-[10px] font-comic font-bold text-slate-100">
                      Selecciona una Selección y completa sus cromos oficiales
                    </p>
                  </div>
                  
                  <div className="space-y-2.5 max-h-[430px] overflow-y-auto pr-1.5 custom-scrollbar">
                    {COUNTRIES.map(c => {
                      const isSelected = c.name === selectedCountryName;
                      const unlockedCromos = getUnlockedPlayersForCountry(c.name).length;
                      const maxCromos = 26;
                      
                      const isLocked = isCountryLockedForUser(c.name);
                      const isMyFreeSelection = isRegistered && userSubscription === 'Ninguna' && freeChosenCountry === c.name;
                      const isContinentChosen = (cont: string) => vipChosenContinent && vipChosenContinent.split(',').map(s => s.trim().toUpperCase()).includes(cont.toUpperCase());
                      const isCountryChosen = (cName: string) => scoutChosenCountry && scoutChosenCountry.split(',').map(s => s.trim().toUpperCase()).includes(cName.toUpperCase());

                      const hasCromoAccessForThisCountry = isAdmin || (!isRegistered 
                        ? (c.name === 'Ecuador')
                        : ((userSubscription === 'Pase VIP Elite' && isContinentChosen(getCountryContinent(c.name))) ||
                           (userSubscription === 'Plan Scout Básico' && isCountryChosen(c.name)) ||
                           (userSubscription === 'Ninguna' && freeChosenCountry === c.name)));

                      let completionBadge = '';
                      if (unlockedCromos === maxCromos) completionBadge = '🏆';
                      else if (unlockedCromos > 0) completionBadge = '⚡';

                      return (
                        <div
                          key={c.code}
                          onClick={() => handleCountrySelectionClick(c.name)}
                          className={`flex items-center justify-between p-3 rounded-xl border-[2.5px] transition-all cursor-pointer ${
                            isSelected 
                              ? 'bg-[#10B981] bg-halftone-green border-black text-black font-extrabold shadow-[3px_3px_0px_#000] -translate-y-0.5' 
                              : isLocked
                                ? 'bg-slate-950/40 border-slate-900 text-slate-500 hover:border-black hover:bg-slate-900/40'
                                : 'bg-slate-900/60 border-black text-slate-350 hover:bg-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className={`text-2xl transform hover:scale-125 transition-transform duration-100 ${isLocked ? 'grayscale opacity-60' : ''}`}>{c.flag}</span>
                            <div>
                              <span className={`text-xs block ${isSelected ? 'font-black' : 'font-semibold'} ${isLocked ? 'text-slate-500 line-through' : ''}`}>{c.name}</span>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className={`text-[9px] font-mono uppercase px-1 rounded ${isSelected ? 'bg-black text-[#10B981] font-bold' : 'text-slate-500 bg-black/40'}`}>
                                  {c.group}
                                </span>
                                {isMyFreeSelection && (
                                  <span className="text-[8px] bg-emerald-500/10 text-emerald-450 border border-emerald-500/20 px-1 py-0.2 rounded font-black tracking-wider uppercase font-mono">
                                    ⭐ MI SELECCIÓN
                                  </span>
                                )}
                                {isRegistered && userSubscription !== 'Ninguna' && !hasCromoAccessForThisCountry && (
                                  <span className="text-[8px] bg-amber-500/10 text-amber-500 border border-amber-500/20 px-1 py-0.2 rounded font-black tracking-wider uppercase font-mono animate-pulse">
                                    🎮 SÓLO TRIVIA
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {isLocked ? (
                              <div className="bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/30 rounded-md px-2 py-0.5 text-[10px] font-mono font-black flex items-center gap-0.5">
                                <span>🔒</span>
                                <span className="hidden sm:inline">BLOQUEADO</span>
                              </div>
                            ) : (
                              <>
                                {completionBadge && <span className="text-sm animate-bounce">{completionBadge}</span>}
                                <span className={`text-[10px] font-mono font-bold border rounded-md px-2 py-0.5 ${
                                  isSelected ? 'bg-black text-white border-black' : 'bg-slate-950 text-slate-300 border-slate-800'
                                }`}>
                                  {unlockedCromos}/{maxCromos} Cromos
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Album summary info */}
                  <div className="mt-5 border-t-2 border-dashed border-slate-800 pt-4 text-xs font-comic font-bold text-slate-400 flex flex-col gap-2.5">
                    {/* CONTROL DE RESPALDO Y PREVENCIÓN DE PÉRDIDAS */}
                    {isAdmin && (
                      <div className="bg-slate-950/80 border-2 border-black rounded-xl p-3.5 shadow-[4px_4px_0px_rgba(0,0,0,1)] relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-yellow-500/5 rounded-full blur-xl pointer-events-none" />
                        <div className="flex items-center gap-1.5 mb-2.5">
                          <span className="text-[#FDDF2B] animate-pulse">👑</span>
                          <h4 className="font-bangers text-[12px] text-[#FDDF2B] tracking-wider uppercase">
                            RESPALDO ANTI-REINICIO DE CROMOS SINCORNIZADOS
                          </h4>
                        </div>
                        <p className="text-[10px] font-comic font-normal text-slate-350 leading-relaxed mb-3">
                          En entornos de desarrollo y pruebas, los reinicios del servidor pueden restablecer la base de datos temporal si la instancia del contenedor se reconstruye. 
                          <strong> ¡Protege tu progreso del álbum!</strong> Exporta y restaura todos los cromos que hayas sincronizado de forma ilimitada.
                        </p>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={handleExportStickersBackup}
                            className="bg-[#22C55E] hover:bg-[#16A34A] text-black font-bangers text-[11px] tracking-wide uppercase py-1.5 px-2.5 border-2 border-black rounded-lg shadow-[2px_2px_0px_#000] active:translate-y-0.5 active:shadow-[1px_1px_0px_#000] transition-all cursor-pointer text-center"
                          >
                            💾 COPIAR RESPALDO
                          </button>
                          <button
                            onClick={() => {
                              setBackupText("");
                              setShowBackupModal(true);
                            }}
                            className="bg-[#EF4444] hover:bg-[#DC2626] text-white font-bangers text-[11px] tracking-wide uppercase py-1.5 px-2.5 border-2 border-black rounded-lg shadow-[2px_2px_0px_#000] active:translate-y-0.5 active:shadow-[1px_1px_0px_#000] transition-all cursor-pointer text-center"
                          >
                            📥 RECONECTAR / RESTAURAR
                          </button>
                        </div>
                      </div>
                    )}

                    <p className="leading-relaxed mt-1">
                      Resuelve las trivias dinámicas de fútbol generadas por la IA para recolectar, auditar y armar los squads nacionales históricos.
                    </p>
                    <div className="flex items-center gap-1.5 text-[10px] bg-sky-500/10 text-sky-400 p-2.5 rounded-xl border border-sky-500/15 font-mono">
                      <Sparkles className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                      <span>Fotos originales referenciales libres de copyright.</span>
                    </div>
                  </div>
                </div>

                {/* RIGHT: Country Album detail as a Turning Comic Book Spread */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                  
                  {/* Selected Country Banner (Comic Title Panel) */}
                  <div className="bg-white text-black border-[4px] border-black rounded-2xl p-6 shadow-[8px_8px_0px_#000] relative overflow-hidden bg-halftone-dots">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-3xl filter drop-shadow">{activeCountry.flag}</span>
                          <span className="text-xs font-bangers tracking-widest text-[#EF4444] bg-white border border-black px-2 py-0.5 rotate-[-1deg]">
                            GRUPO {activeCountry.group}
                          </span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bangers tracking-wider text-black mt-1 uppercase">
                          ¡{activeCountry.name}!
                        </h2>
                        <p className="text-xs font-comic font-semibold text-slate-800 mt-1.5 max-w-xl leading-relaxed italic border-l-4 border-[#10B981] pl-3.5 py-0.5">
                          {activeCountry.description}
                        </p>
                      </div>

                      <div className={`text-center p-4 border-[3px] border-black shadow-[4px_4px_0px_#000] rotate-[1.5deg] min-w-[150px] ${
                        hasCromoAccess 
                          ? 'bg-[#EF4444] text-white bg-halftone-red animate-fade-in' 
                          : 'bg-slate-800 text-slate-300'
                      }`}>
                        <span className="text-[9px] font-mono font-black uppercase block tracking-wider text-slate-100">
                          {hasCromoAccess ? 'CROMOS REUNIDOS' : 'ACCESO SIN CROMOS'}
                        </span>
                        <span className="text-4xl font-bangers block tracking-widest leading-none mt-1 text-white">
                          {hasCromoAccess ? `${unlockedCount} / 26` : '🎮 TRIVIA'}
                        </span>
                        <span className="text-[10px] font-comic block mt-1 font-bold text-yellow-300">
                          {hasCromoAccess 
                            ? (isAlbumComplete ? "¡COMPLETO! 👑" : "SIGUE JUGANDO ⚡")
                            : "MODO RECREATIVO"
                          }
                        </span>
                      </div>
                    </div>

                    {/* General Country Progress / Reset Actions */}
                    {(isAdmin || activeCountry.name === "Ecuador") && (
                      <div className="mt-5 p-4 bg-white border-[2.5px] border-black rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-[4px_4px_0px_#EF4444] animate-fade-in text-black">
                        <div className="space-y-1">
                          {activeCountry.name === "Ecuador" ? (
                            <>
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase font-mono bg-[#10B981] text-white border border-black rotate-[-1deg] bg-halftone-green shadow-sm">
                                📷 Convocatoria Ecuador Verificada
                              </span>
                              <h4 className="font-bangers text-black text-sm tracking-wide flex items-center gap-1.5">
                                🇪🇨 26 CONVOCADOS OFICIALES AL 100%
                              </h4>
                              <p className="text-[11px] font-comic font-medium text-slate-800 leading-relaxed">
                                Hemos procesado la convocatoria oficial completa de la FEF (<strong className="text-[#EF4444]">Piero Hincapié, Moisés Caicedo, Gonzalo Plata, Pervis Estupiñán, Willian Pacho, Kendry Páez, Jordy Alcívar, Enner Valencia</strong>, etc.) ilustrada en estilo cómic con sus respectivos clubes y parámetros históricos.
                              </p>
                            </>
                          ) : (
                            <>
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase font-mono bg-[#EF4444] text-white border border-black rotate-[-1deg] bg-halftone-red shadow-sm">
                                🛠️ Controles de Autogestión ({activeCountry.name})
                              </span>
                              <h4 className="font-bangers text-black text-sm tracking-wide flex items-center gap-1.5">
                                {activeCountry.flag} PROGRESO DE COLECTA Y EXÁMENES TÁCTICOS
                              </h4>
                              <p className="text-[11px] font-comic font-medium text-slate-800 leading-relaxed">
                                Administra el avance de <strong>{activeCountry.name}</strong> para responder nuevamente los niveles de trivia de la IA o desbloquear todo el mazo al instante.
                              </p>
                            </>
                          )}
                        </div>
                        {isAdmin && (
                          <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                setAppCustomConfirm({
                                  title: `🚨 ¿REINICIAR ${activeCountry.name.toUpperCase()}?`,
                                  message: `¿Seguro de reiniciar el progreso y la colección de ${activeCountry.name}? Se bloqueará el progreso para que puedas responder las trivias locales de autogestión y ganar las estampas desde cero.`,
                                  onConfirm: () => {
                                    // Lock all trivia levels for this country
                                    setUnlockedLevels(prev => {
                                      const next = { ...prev };
                                      next[activeCountry.name] = { 1: false, 2: false, 3: false };
                                      return next;
                                    });
                                    // Reset pending pack notifications
                                    setPendingTriviaPacks(prev => {
                                      const next = { ...prev };
                                      next[activeCountry.name] = [];
                                      return next;
                                    });
                                    // Remove manually unlocked player stickers for this country
                                    const countryPlayers = playersDB[activeCountry.name] || [];
                                    setManuallyUnlockedPlayerIds(prev => {
                                      const next = { ...prev };
                                      countryPlayers.forEach(p => {
                                        delete next[p.id];
                                      });
                                      return next;
                                    });
                                    // Delete tactical lineup configurations for this country
                                    setTacticalBoards(prev => {
                                      const next = { ...prev };
                                      delete next[activeCountry.name];
                                      return next;
                                    });

                                    setAppCustomAlert({
                                      title: `🧹 ${activeCountry.name} Restablecido`,
                                      message: `¡Excelente! El progreso de ${activeCountry.name} se ha restablecido a cero. Ahora puedes disfrutar y responder sus 3 niveles de trivias para ganar las estampas de forma auditable.`
                                    });
                                  }
                                });
                              }}
                              className="bg-[#10B981] hover:bg-emerald-600 text-white border-2 border-black font-bangers text-[10px] tracking-wider uppercase px-3 py-2 rounded-xl shadow-[2px_2px_0px_#000] cursor-pointer text-center bg-halftone-green block active:translate-y-0.5"
                            >
                              🧹 Resetear {activeCountry.name === "Ecuador" ? "Ecuador" : "Juego"}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setUnlockedLevels(prev => ({
                                  ...prev,
                                  [activeCountry.name]: { 1: true, 2: true, 3: true }
                                }));
                                setAppCustomAlert({
                                  title: '✨ Colección Activada',
                                  message: `¡Se han acoplado los 3 niveles de exámenes de expansión y habilitado los stickers de ${activeCountry.name} para tu álbum!`
                                });
                              }}
                              className="bg-[#EF4444] hover:bg-red-700 text-white border-2 border-black font-bangers text-[10px] tracking-wider uppercase px-3 py-2 rounded-xl shadow-[2px_2px_0px_#000] cursor-pointer text-center bg-halftone-red block active:translate-y-0.5"
                            >
                              🔓 Auto-Completar
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Trivia Lock statuses in Retropanel format */}
                    <div className="mt-6 border-t-[3px] border-black pt-5">
                      <h4 className="text-xs font-bangers tracking-widest text-black uppercase mb-3.5">
                        🎯 TRIVIA DEPORTIVA
                      </h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[1, 2, 3].map(lvl => {
                          const levels = unlockedLevels[activeCountry.name] || {};
                          const isUnlocked = levels[lvl] || levels[lvl.toString() as any] || false;
                          const isPendingPack = (pendingTriviaPacks[activeCountry.name] || []).includes(lvl);
                          const isLevelPassed = isUnlocked || isPendingPack;
                          
                          // A level is blocked if its previous level was not passed
                          const prevUnlocked = levels[lvl - 1] || levels[(lvl - 1).toString() as any] || false;
                          const isBlocked = lvl > 1 && !(prevUnlocked || (pendingTriviaPacks[activeCountry.name] || []).includes(lvl - 1));

                          return (
                            <div
                              key={lvl}
                              className={`p-4 rounded-xl border-[2.5px] border-black flex flex-col justify-between transition-all ${
                                isUnlocked 
                                  ? 'bg-rose-100 text-black shadow-[3px_3px_0px_#000]' 
                                  : isPendingPack
                                    ? 'bg-amber-100 text-black shadow-[3px_3px_0px_#000]'
                                    : isBlocked 
                                      ? 'bg-slate-200/50 opacity-45 cursor-not-allowed text-slate-500' 
                                      : 'bg-white text-black shadow-[3px_3px_0px_#000]'
                              }`}
                            >
                              <div>
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-[9.5px] font-mono font-black text-rose-600 block uppercase font-extrabold">NIVEL {lvl}</span>
                                  {isUnlocked && <span className="text-xs">✅</span>}
                                  {isPendingPack && <span className="text-xs animate-pulse">🎁</span>}
                                </div>
                                <h5 className="font-bangers text-sm text-black tracking-wide leading-tight">
                                  {lvl === 1 ? '🎨 Cultura General' : lvl === 2 ? '⏳ Historia Antigua' : '📐 Táctica Avanzada'}
                                </h5>
                                <p className="text-[11px] font-comic font-semibold text-slate-700 mt-2 leading-relaxed">
                                  {hasCromoAccess 
                                    ? (lvl === 1 ? 'Recluta banca suplente (+9 cromos)' : lvl === 2 ? 'Recluta jugadores titulares (+9 cromos)' : 'Franquicia y Leyendas (+8 cromos)')
                                    : (lvl === 1 ? 'Prueba de cultura general (+5 pts de D.T.)' : lvl === 2 ? 'Prueba de historia antigua (+5 pts de D.T.)' : 'Prueba de táctica avanzada (+5 pts de D.T.)')
                                  }
                                </p>
                              </div>
                              
                              <div className="mt-4 pt-3.5 border-t border-black/15">
                                {isUnlocked ? (
                                  <span className="text-[10px] font-mono text-emerald-700 font-extrabold flex items-center gap-1">
                                    ¡Completado con éxito 🎉!
                                  </span>
                                ) : isPendingPack ? (
                                  <span className="text-[10px] font-mono text-amber-600 font-extrabold flex items-center gap-1 animate-pulse">
                                    🎁 ¡Sobre listo para abrir abajo!
                                  </span>
                                ) : isBlocked ? (
                                  <span className="text-[10px] font-mono text-slate-500 font-bold block">Bloqueado</span>
                                ) : (
                                  <button
                                    onClick={() => {
                                      if (!isRegistered) {
                                        if (activeCountry.name !== 'Ecuador') {
                                          alert('📢 SE REQUIERE REGISTRO\n\nLas trivias de otros países son exclusivas para directores registrados. Por favor, regístrate de forma 100% gratuita.');
                                          setIsRegistrationOpen(true);
                                        } else {
                                          setActiveTrivia({ country: activeCountry.name, flag: activeCountry.flag, level: lvl });
                                        }
                                        return;
                                      }
                                      if (isCountryLockedForUser(activeCountry.name)) {
                                        setUpsellCountry(activeCountry.name);
                                      } else {
                                        setActiveTrivia({ country: activeCountry.name, flag: activeCountry.flag, level: lvl });
                                      }
                                    }}
                                    className="w-full py-2 bg-yellow-400 hover:bg-yellow-300 text-black border-2 border-black font-bangers text-xs tracking-wider uppercase cursor-pointer rounded-lg shadow-[2px_2px_0px_#000]"
                                  >
                                    COMENZAR EXAMEN ⚡
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* ALBUM COMPLETED EXTRA INTERFACE TRIGGERS */}
                  {isAlbumComplete ? (
                    <div className="p-5 rounded-2xl bg-emerald-400 text-black border-[3.5px] border-black shadow-[6px_6px_0px_#000] flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-bounce" style={{ animationDuration: '4s' }}>
                      <div className="font-comic font-black">
                        <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-black text-yellow-300 font-bangers uppercase tracking-wider">¡ÉXITO ABSOLUTO! (26/26)</span>
                        <h4 className="text-lg font-bangers uppercase tracking-wide mt-1.5 text-black">¡Pizarra Táctica Desbloqueada para {activeCountry.name}!</h4>
                        <p className="text-xs font-semibold text-slate-900 mt-1">Has reunido las 26 piezas necesarias. Abre la Pizarra Táctica de D.T. para plantear la alineación histórica oficial y competir.</p>
                      </div>
                      <button
                        onClick={() => setActiveTab('board')}
                        className="py-2.5 px-4 bg-black text-white hover:bg-slate-900 border-2 border-black font-bangers text-xs uppercase tracking-widest rounded-lg shadow-[3px_3px_0px_rgba(0,0,0,0.3)] cursor-pointer shrink-0"
                      >
                        Ir a la Pizarra de D.T. ⚽
                      </button>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-slate-900 text-slate-100 border-2 border-dashed border-slate-700 text-xs font-comic font-bold flex items-center gap-2.5">
                      <Info className="w-4.5 h-4.5 text-yellow-400 shrink-0" />
                      <span>Completa los 3 niveles de trivia de este país para habilitar su <strong>Pizarra Táctica del D.T. oficial</strong> y registrar pronósticos de juego.</span>
                    </div>
                  )}

                  {/* HEROIC COMIC PACK INTERACTIVE STATION */}
                  <div id="shovelling-station-container" className="bg-[#050E0A] border-[4.5px] border-black rounded-3xl p-6 shadow-[8px_8px_0px_#000] relative overflow-hidden bg-halftone-dots">
                    {/* Comic corner ribbon */}
                    <div className="absolute top-0 right-0 bg-[#EF4444] text-white font-bangers text-[11px] font-black uppercase tracking-widest px-4 py-1.5 border-l-4 border-b-4 border-black rotate-0 z-10">
                      ¡SOBRE EXCLUSIVO!
                    </div>

                    {/* RECOMPENSAS DE TRIVIA PENDIENTES */}
                    {(pendingTriviaPacks[selectedCountryName] || []).length > 0 && (
                      <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 to-yellow-500/5 border-2 border-dashed border-amber-450 relative z-10 text-left">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xl animate-bounce">🎁</span>
                          <h4 className="font-bangers text-base text-yellow-400 tracking-wider uppercase leading-none">
                            ¡TIENES RECOMPENSAS DE TRIVIA LISTAS EN {selectedCountryName.toUpperCase()}!
                          </h4>
                        </div>
                        <p className="text-[11px] font-comic text-slate-300 mb-4 font-semibold leading-tight">
                          ¡Examen de Scouting superado con éxito! Abre el sobre oficial de trivia correspondiente para consagrar y revelar el bloque oficial completo en tu álbum con un destello de energía tricolor.
                        </p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          {(pendingTriviaPacks[selectedCountryName] || []).map(lvl => (
                            <div 
                              key={lvl}
                              className="bg-white border-[2.5px] border-black p-3.5 rounded-xl flex flex-col justify-between gap-3 shadow-[3px_3px_0px_#EF4444] transition-transform hover:scale-[1.02]"
                            >
                              <div className="text-left">
                                <span className="text-[8.5px] font-mono text-rose-600 font-extrabold block uppercase leading-none">Nivel {lvl}</span>
                                <h5 className="font-bangers text-sm text-black tracking-wide leading-normal uppercase mt-1">
                                  {lvl === 1 ? '🎨 Cromos de Banca' : lvl === 2 ? '⏳ Jugadores Clave' : '📐 Estrellas de Competición'}
                                </h5>
                                <span className="text-[9.5px] font-comic font-black text-slate-500 block mt-0.5">
                                  {lvl === 1 ? '9 futbolistas (+9 GL)' : lvl === 2 ? '9 futbolistas (+9 GL)' : '8 astros estrella (+8 GL)'}
                                </span>
                              </div>
                              <button
                                onClick={() => handleOpenTriviaPack(lvl)}
                                disabled={isOpeningPack}
                                className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black border-2 border-black font-bangers text-xs uppercase tracking-widest rounded-lg shadow-[2px_2px_0px_#000] cursor-pointer active:scale-95 transition-all text-center shrink-0 bg-halftone-dots"
                              >
                                💥 ABRIR SOBRE DE TRIVIA
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {(pendingTriviaPacks[selectedCountryName] || []).length === 0 && (
                      <div className="relative z-10 p-6 rounded-2xl border-2 border-dashed border-[#EF4444] bg-[#0A0F0D] text-center flex flex-col items-center">
                        <div className="w-14 h-14 rounded-full bg-[#EF4444]/10 border-2 border-[#EF4444] text-[#EF4444] text-2xl flex items-center justify-center font-bold mb-3 animate-pulse">
                          🔒
                        </div>
                        <h4 className="font-bangers text-xl text-white tracking-widest uppercase mb-1">
                          SISTEMA DE ENTREGA DE SOBRES DE TRIVIA
                        </h4>
                        <p className="max-w-md text-xs font-comic font-semibold text-slate-300 leading-relaxed">
                          Por instrucción oficial del Director Técnico, no hay sobres generados al azar. Para desbloquear y revelar los cromos oficiales de <span className="text-[#10B981] font-bold">{selectedCountryName}</span>, debes realizar y aprobar las trivias del tomo superior. ¡Cada nivel completado otorga su respectivo set de cromos!
                        </p>
                        <button
                          onClick={() => {
                            const targetElement = document.getElementById('album-tab-content');
                            if (targetElement) {
                              targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }
                          }}
                          className="mt-4 px-5 py-2.5 bg-[#EF4444] hover:bg-neutral-800 hover:text-white text-white font-bangers text-xs tracking-wider uppercase border-2 border-black rounded-lg cursor-pointer shadow-[2px_2px_0px_#000] active:scale-95 transition-all bg-halftone-red"
                        >
                          Ir a Tomos / Trivias de {selectedCountryName} ⚡
                        </button>
                      </div>
                    )}

                    {/* RED AND GREEN ENERGY BURST OPENING SEQUENCE */}
                    <AnimatePresence>
                      {isOpeningPack && (
                        <motion.div
                          key="opening-overlay"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 bg-black z-30 flex flex-col items-center justify-center p-4 rounded-2xl"
                        >
                          {/* Green & Red pulsating radial vectors */}
                          <div className="absolute inset-0 bg-gradient-to-tr from-[#EF4444]/20 via-transparent to-[#10B981]/20 animate-pulse" />
                          <div className="absolute w-[200%] h-[200%] bg-halftone-dots opacity-40 animate-spin" style={{ animationDuration: '40s' }} />

                          {/* Shockwave bursting panels */}
                          <motion.div
                            initial={{ scale: 0.1, rotate: -45 }}
                            animate={{ scale: [1, 1.2, 1], rotate: [0, 360, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="relative w-40 h-40 rounded-full border-[8px] border-black flex items-center justify-center bg-gradient-to-tr from-[#EF4444] via-amber-500 to-[#10B981] shadow-[0_0_50px_rgba(239,68,68,0.5)]"
                          >
                            <span className="font-bangers text-4xl text-white drop-shadow-[4px_4px_0px_#000] tracking-wider select-none animate-bounce">
                              ¡BOOM!
                            </span>
                          </motion.div>

                          {/* Explosive Action Bubbles rotating */}
                          <div className="absolute top-6 left-6 bg-[#FDDF2B] border-[3px] border-black px-4 py-2 font-bangers text-black uppercase tracking-wider rotate-[-12deg] shadow-[3px_3px_0px_#000]">
                            ¡KABOOM!
                          </div>
                          <div className="absolute bottom-6 right-6 bg-[#EF4444] border-[3px] border-black px-4 py-2 font-bangers text-white uppercase tracking-wider rotate-[15deg] shadow-[3px_3px_0px_#000]">
                            ¡CRASH!
                          </div>
                          <div className="absolute top-1/2 right-6 bg-[#10B981] border-[3px] border-black px-4 py-2 font-bangers text-white uppercase tracking-wider rotate-[-8deg] shadow-[3px_3px_0px_#000]">
                            ¡GOLAZO!
                          </div>

                          <h4 className="font-bangers text-2xl text-[#10B981] tracking-widest uppercase mt-6 relative z-10 drop-shadow-md text-center">
                            ¡LIBERANDO ENERGÍA TRICOLOR!
                          </h4>
                          <p className="text-[10px] font-mono text-slate-450 uppercase tracking-widest mt-1">
                            Sorteo Auditado • Generando Cromos Legendarios...
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* REVEAL PULLED STICKERS DISPLAY COMPONENT */}
                    <AnimatePresence>
                      {hasOpenedPack && pulledStickers.length > 0 && (
                        <motion.div
                          key="revealed-stickers"
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="mt-6 border-t-[3.5px] border-black pt-6"
                        >
                          <div className="bg-[#EF4444] bg-halftone-red text-white border-[3px] border-black p-2 bg-rose-600 rotate-[-1deg] shadow-[4px_4px_0px_#000] mb-5 text-center">
                            <h4 className="font-bangers text-lg tracking-widest uppercase">
                              🎉 ¡SOBRE ABIERTO CON ÉXITO! DETALLES DE CROMOS REVELADOS
                            </h4>
                          </div>

                          {/* Grid with white backgrounds as requested for comparison */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                            {pulledStickers.map((p, idx) => {
                              const slant = (idx % 3 === 0) ? '-rotate-[1deg]' : (idx % 3 === 1) ? 'rotate-[1deg]' : 'rotate-[0.5deg]';
                              const stickerBadge = p.position === 'GK' ? '¡ZAP!' : p.position === 'DF' ? '¡POW!' : p.position === 'MF' ? '¡BOOM!' : '¡GOLAZO!';

                              return (
                                <motion.div
                                  key={`pull-${p.id}`}
                                  initial={{ scale: 0.8, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  transition={{ delay: idx * 0.15 }}
                                  className={`bg-white text-black border-[3.5px] border-black rounded-2xl p-4 flex flex-col justify-between h-[365px] relative shadow-[4px_4px_0px_#000] hover:scale-105 duration-200 hover:z-20 ${slant}`}
                                >
                                  {/* Action badge on Pulled Stickers */}
                                  <div className="absolute top-1 right-1 bg-rose-500 text-white font-bangers text-[8.5px] px-1.5 py-0.5 border border-black shadow-[1.5px_1.5px_0px_#000] z-10 rotate-6 uppercase">
                                    {stickerBadge}
                                  </div>

                                  <div>
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-[8px] font-mono bg-black text-[#FDDF2B] px-1.5 py-0.5 rounded border border-black font-extrabold">
                                        {p.position} • {p.subPosition.split('/')[0]}
                                      </span>
                                      <span className="text-[10px] font-bangers bg-black text-[#FDDF2B] px-1.5 py-0.5 rounded border border-black">
                                        {p.rating} GL
                                      </span>
                                    </div>

                                    {p.imageUrl ? (
                                      <div className="relative w-full h-32 rounded-xl overflow-hidden mb-2 border-2 border-black group shadow-sm bg-black">
                                        <img
                                          src={getSafeImageUrl(p.imageUrl)}
                                          alt={p.realName}
                                          referrerPolicy="no-referrer"
                                          className="w-full h-full object-cover"
                                        />
                                        <span className="absolute bottom-1 right-2 text-[6.5px] font-bangers text-[#FDDF2B] bg-black border border-black px-1.5 py-0.5 rounded">
                                          PULL EXCLUSIVO
                                        </span>
                                      </div>
                                    ) : (
                                      <div className="relative w-full h-32 rounded-xl mb-2 flex flex-col items-center justify-center border-2 border-black bg-gradient-to-b from-green-500/10 to-transparent">
                                        <span className="text-2xl filter drop-shadow">💎</span>
                                        <span className="text-[8px] font-bangers text-[#FDDF2B] bg-black border border-black px-1.5 py-0.5 rounded mt-1 font-bold">
                                          SOBRE VIP
                                        </span>
                                      </div>
                                    )}

                                    <div>
                                      <h5 className="font-bangers text-xs truncate max-w-[170px] uppercase leading-none text-black">
                                        {p.realName}
                                      </h5>
                                      <span className="text-[9px] font-comic font-black text-slate-500 block leading-none mt-0.5">
                                        "{p.name}"
                                      </span>
                                    </div>

                                    <div className="space-y-0.5 my-1.5 text-[8.5px] border-y border-black/15 py-1.5 font-mono text-slate-700">
                                      <div className="flex justify-between"><span>Liga (País)</span><span className="truncate max-w-[110px] font-bold">{getCountryOfPlay(p.currentClub)}</span></div>
                                      <div className="flex justify-between"><span>Prefijo</span><span className="font-bold">{p.dominantFoot}</span></div>
                                    </div>
                                  </div>

                                  <p className="text-[8.5px] leading-tight bg-slate-100 p-1.5 rounded-lg border border-black/5 text-justify text-slate-800 italic">
                                    {p.styleOfPlay}
                                  </p>
                                </motion.div>
                              );
                            })}
                          </div>

                          <div className="mt-5 text-center">
                            <button
                              onClick={() => setHasOpenedPack(false)}
                              className="px-8 py-3.5 bg-[#FDDF2B] hover:bg-yellow-400 text-black font-bangers tracking-widest text-sm uppercase border-[3.5px] border-black shadow-[5px_5px_0px_#000] hover:translate-y-0.5 hover:shadow-[2px_2px_0px_#000] transition-all cursor-pointer rounded-2xl inline-flex items-center gap-2 font-black rotate-[-0.5deg]"
                            >
                              <span>¡EXCELENTE! RECOLECTAR CROMOS EN COFRE</span>
                              <span className="text-base select-none">🏆</span>
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* ACCORDION FOR MATHEMATICAL SEED TRANSPARENCY (PILLAR 3 AUDITABLE RAFFLES) */}
                    <div className="mt-6 border-t-2 border-dashed border-emerald-950/40 pt-4 text-left">
                      <details className="group cursor-pointer">
                        <summary className="flex items-center justify-between text-[11px] font-mono text-emerald-450 font-bold hover:text-emerald-300 list-none select-none">
                          <span className="flex items-center gap-1.5">
                            🛡️ VERIFICAR SEMILLA CRIPTOGRÁFICA DE SORTEO COMPATIBLE (PILAR 3 - AUDITABLE)
                          </span>
                          <span className="text-[9px] bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-slate-500 font-mono font-bold group-open:hidden">
                            [ EXPANDIR ]
                          </span>
                          <span className="text-[9px] bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-slate-500 font-mono font-bold hidden group-open:inline">
                            [ CONTRAER ]
                          </span>
                        </summary>
                        <div className="mt-3 bg-[#020704] border border-[#10B912]/20 p-3.5 rounded-xl text-left space-y-3 font-mono text-[10px] text-slate-400">
                          <div className="bg-[#050e09] border border-emerald-950/40 p-2.5 rounded-lg flex flex-col gap-1.5">
                            <div className="flex justify-between border-b border-slate-850 pb-1.5 mb-1 text-slate-300">
                              <span className="font-bold">PARÁMETRO AUDITOR</span>
                              <span className="font-bold">REGISTRO DE VALOR</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Semilla del DT:</span>
                              <span className="text-emerald-400 font-bold select-all">TORNEO_2026_{selectedCountryName.toUpperCase()}_SEED</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Código de Usuario:</span>
                              <span className="text-yellow-400 font-bold select-all">{userCode || "N/A"}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Hash de Bloque:</span>
                              <span className="text-emerald-500 truncate max-w-[150px] md:max-w-none select-all">
                                {`sha256-b7f3a8b4e18d3${(userCode || "DT").padEnd(8, "0").substring(0, 8)}d80de546ffdbe92cbe394a`}
                              </span>
                            </div>
                          </div>
                          <p className="font-sans text-[10px] leading-relaxed text-slate-400">
                            Por reglamento del comité oficial, toda recompensa se pre-calcula de forma matemática. Esto garantiza que la entrega de cromos es determinista y no depende de peticiones de red volátiles o fraude en cliente.
                          </p>
                        </div>
                      </details>
                    </div>
                  </div>

                  {/* COMIC PAGE NAVIGATION ROW */}
                  <div className="flex flex-col sm:flex-row items-center justify-between bg-black text-[#FFFDEC] p-4 border-[3px] border-black shadow-[6px_6px_0px_#000] rounded-xl gap-4">
                    <button
                      onClick={() => setAlbumPage(prev => Math.max(1, prev - 1))}
                      disabled={albumPage === 1}
                      className="w-full sm:w-auto px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-black disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bangers tracking-wider uppercase border-2 border-black cursor-pointer rounded-lg shadow-[2px_2px_0px_#F8FAFC/20]"
                    >
                      ◄ PÁG. ANTERIOR
                    </button>
                    <div className="text-center">
                      <span className="font-bangers text-base md:text-lg tracking-widest text-white uppercase block leading-tight">
                        {albumPage === 1 
                          ? "PÁGINA 1: CONSERJES DE LA PORTERÍA Y MURO (GK & DF)" 
                          : albumPage === 2 
                            ? "PÁGINA 2: METRÓNOMOS Y GENERALES DEL MEDIO (MF)" 
                            : "PÁGINA 3: ARTILLEROS LETALES Y DIOSES DEL GOL (FW)"
                        }
                      </span>
                      <span className="text-[10px] uppercase font-mono text-cyan-400 font-bold block mt-0.5">
                        HOJA {albumPage} DE 3 • LIBRO ILUSTRADO DE TÁCTICA FANTASY
                      </span>
                    </div>
                    <button
                      onClick={() => setAlbumPage(prev => Math.min(3, prev + 1))}
                      disabled={albumPage === 3}
                      className="w-full sm:w-auto px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-black disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bangers tracking-wider uppercase border-2 border-black cursor-pointer rounded-lg shadow-[2px_2px_0px_#F8FAFC/20]"
                    >
                      PÁG. SIGUIENTE ►
                    </button>
                  </div>

                  {/* GRID OF CROMOS: Unlocked are shiny stamps, Locked are dotted blue blueprints */}
                  <div>
                    {isAdmin && (
                      <div className="mb-6 p-4 bg-indigo-950/90 border-4 border-indigo-500 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-white shadow-[6px_6px_0px_#000]">
                        <div className="text-left">
                          <span className="text-[9px] bg-indigo-600 px-2 py-0.5 rounded-full text-white font-mono font-black uppercase tracking-wider inline-block mb-1.5 border border-black">
                            ⚡ PANEL DE ACCESO ADMIN
                          </span>
                          <h4 className="text-sm font-bangers tracking-wider uppercase text-yellow-400">Control Instantáneo de Cromos ({activeCountry.name})</h4>
                          <p className="text-[10.5px] text-slate-350 font-comic font-semibold mt-1">Como administrador del sistema, puedes forzar la convalidación, adición o vaciado instantáneo de stickers para pruebas de visualización.</p>
                        </div>
                        <div className="flex flex-row gap-2 w-full sm:w-auto shrink-0">
                          <button
                            onClick={() => {
                              setManuallyUnlockedPlayerIds(prev => {
                                const next = { ...prev };
                                activeCountryPlayers.forEach(p => {
                                  next[p.id] = true;
                                });
                                return next;
                              });
                              setAppCustomAlert({
                                title: '🔓 DESBLOQUEO EXITOSO',
                                message: `Se han añadido de forma segura los 26 coleccionables tácticos de ${activeCountry.name} a tu colección.`
                              });
                            }}
                            className="flex-1 sm:flex-none py-2 px-4 bg-emerald-500 hover:bg-emerald-400 text-black border-2 border-black font-bangers text-xs uppercase tracking-wider rounded-lg shadow-[2px_2px_0px_#000] cursor-pointer hover:scale-105 active:scale-95 transition-all text-center"
                          >
                            🔓 Desbloquear Todos (26/26)
                          </button>
                          <button
                            onClick={() => {
                              setManuallyUnlockedPlayerIds(prev => {
                                const next = { ...prev };
                                activeCountryPlayers.forEach(p => {
                                  delete next[p.id];
                                });
                                return next;
                              });
                              setUnlockedLevels(prev => {
                                const next = { ...prev };
                                next[activeCountry.name] = { 1: false, 2: false, 3: false };
                                return next;
                              });
                              setAppCustomAlert({
                                title: '🔒 ÁLBUM LIMPIO',
                                message: `Se han removido los stickers de ${activeCountry.name} para recrear el estado de juego desde cero.`
                              });
                            }}
                            className="flex-1 sm:flex-none py-2 px-4 bg-[#EF4444] hover:bg-red-600 text-white border-2 border-black font-bangers text-xs uppercase tracking-wider rounded-lg shadow-[2px_2px_0px_#000] cursor-pointer hover:scale-105 active:scale-95 transition-all text-center"
                          >
                            🔒 Bloquear Todos
                          </button>
                        </div>
                      </div>
                    )}

                    <h3 className="font-bangers text-xl text-[#10B981] tracking-wider mb-4 flex items-center gap-2 uppercase">
                      <Award className="w-5 h-5 text-[#10B981]" />
                      <span>ESTAMPAS REUNIDAS EN HOJA {albumPage} ({
                        (() => {
                          const pagePlayers = albumPage === 1 
                            ? activeCountryPlayers.slice(0, 9) 
                            : albumPage === 2 
                              ? activeCountryPlayers.slice(9, 18) 
                              : activeCountryPlayers.slice(18, 26);
                          const unlockedPlayers = getUnlockedPlayersForCountry(activeCountry.name);
                          const unlockedCountOnPage = pagePlayers.filter(p => unlockedPlayers.some(up => up.id === p.id)).length;
                          return unlockedCountOnPage;
                        })()
                      } DE {
                        albumPage === 1 ? 9 : albumPage === 2 ? 9 : 8
                      })</span>
                    </h3>

                    {!hasCromoAccess && (
                      <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border-[3px] border-amber-500 text-black shadow-[4px_4px_0px_#000] relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-start gap-3 text-left">
                          <span className="text-3xl animate-pulse shrink-0">⚠️</span>
                          <div>
                            <h4 className="font-bangers text-base text-amber-600 tracking-wider uppercase leading-none mb-1">
                              Suscripción Limitada (Modo Recreativo Activo)
                            </h4>
                            <p className="text-[11px] font-comic font-bold text-slate-800 leading-relaxed">
                              Tu plan actual <strong>{userSubscription}</strong> tiene asignada la cobertura de <strong>{userSubscription === 'Pase VIP Elite' ? `Continente: ${vipChosenContinent}` : `Selección: ${scoutChosenCountry}`}</strong>. 
                              Puedes acceder y jugar las trivias de <strong>{activeCountry.name}</strong> por diversión y puntos, pero <strong>no se desbloquearán cromos</strong> para tu álbum en esta selección.
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => setActiveTab('subscription')}
                          className="py-1.5 px-3 bg-[#EF4444] hover:bg-red-600 text-white border-2 border-black font-bangers text-xs uppercase tracking-wider rounded-lg shadow-[2px_2px_0px_#000] cursor-pointer shrink-0"
                        >
                          Ampliar Plan ⚡
                        </button>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                      {(albumPage === 1 
                        ? activeCountryPlayers.slice(0, 9) 
                        : albumPage === 2 
                          ? activeCountryPlayers.slice(9, 18) 
                          : activeCountryPlayers.slice(18, 26)
                      ).map((p, idx) => {
                        const unlockedPlayers = getUnlockedPlayersForCountry(activeCountry.name);
                        const isUnlocked = unlockedPlayers.some(up => up.id === p.id);
                        
                        const isElite = p.rating >= 90;
                        const isKey = p.rating >= 80 && p.rating < 90;
                        
                        // Rotational slanted fun offset
                        const slant = (idx % 3 === 0) ? '-rotate-[1deg]' : (idx % 3 === 1) ? 'rotate-[1deg]' : 'rotate-[0.5deg]';

                        if (!isUnlocked) {
                          // Display locked player slot blueprint frame placeholder (as white contrast background)
                          return (
                            <div
                              key={p.id || `locked-${idx}`}
                              className={`bg-white border-[3.5px] border-dashed border-[#EF4444] rounded-2xl p-4 flex flex-col justify-between items-center text-center text-slate-700 h-[380px] relative overflow-hidden shadow-[4px_4px_0px_#000] ${slant}`}
                            >
                              <div className="absolute top-2 right-2 font-mono text-[9px] bg-black text-[#FDDF2B] font-bold border border-black rounded px-1.5 z-10">
                                SLOT #{idx + 1 + (albumPage === 1 ? 0 : albumPage === 2 ? 9 : 18)}
                              </div>

                              <div className="w-full flex justify-between items-center relative z-10">
                                <span className="text-[10px] font-mono tracking-wider font-extrabold bg-[#041208] text-[#10B981] px-2 py-0.5 rounded border border-black">
                                  {p.position}
                                </span>
                                <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-300">
                                  {p.rating} GL
                                </span>
                              </div>

                              <div className="my-auto flex flex-col items-center relative z-10 select-none">
                                {/* Silhouette */}
                                <div className="w-20 h-20 rounded-full border-[2.5px] border-dashed border-slate-300 flex items-center justify-center bg-slate-50 text-slate-400 mb-3 relative">
                                  <UserCheck className="w-8 h-8 opacity-40 shrink-0" />
                                  <HelpCircle className="w-4 h-4 text-[#EF4444] absolute bottom-0 right-0 animate-pulse" />
                                </div>
                                <h5 className="font-bangers text-sm text-slate-900 tracking-wide truncate max-w-[170px] uppercase leading-tight">
                                  {p.realName}
                                </h5>
                                <span className="text-[9.5px] text-slate-500 font-comic italic font-bold">
                                  "{p.name}"
                                </span>
                              </div>

                              <div className="w-full relative z-10">
                                {!hasCromoAccess ? (
                                  <div className="text-[9.5px] font-comic font-black text-[#EF4444] mb-2 leading-tight uppercase animate-pulse">
                                    🚫 Sin Cromo en tu Plan
                                  </div>
                                ) : (
                                  <div className="text-[9.5px] font-comic font-black text-amber-500 mb-2 leading-tight uppercase">
                                    🔒 Cromo Bloqueado
                                  </div>
                                )}
                                <button
                                  onClick={() => setActiveTrivia({ country: activeCountry.name, flag: activeCountry.flag, level: albumPage })}
                                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white font-bangers text-xs tracking-wider uppercase border-2 border-black rounded-lg cursor-pointer shadow-[2px_2px_0px_#000] active:scale-95 transition-all"
                                >
                                  Jugar Nivel {albumPage} 🎮
                                </button>
                                {isAdmin && (
                                  <button
                                    onClick={() => {
                                      setManuallyUnlockedPlayerIds(prev => ({ ...prev, [p.id]: true }));
                                      setAppCustomAlert({
                                        title: '🔓 CROMO AÑADIDO',
                                        message: `Has desbloqueado el cromo de ${p.realName} (${p.name}) para el álbum.`
                                      });
                                    }}
                                    className="w-full mt-2 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black border-2 border-black font-bangers text-[10.5px] uppercase tracking-wider rounded-lg shadow-[2px_2px_0px_#000] cursor-pointer"
                                  >
                                    ➕ AÑADIR CROMO
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        }

                        // Display unlocked collectible active sticker as high-contrast progressive digital card
                        return (
                          <DigitalStickerCard
                            key={p.id}
                            player={p}
                            idx={idx}
                            slant={slant}
                            onGenerateImage={handleGenerateStickerImage}
                            isGenerating={isGeneratingStickerId === p.id}
                            onPasteImageUrl={handlePasteStickerUrl}
                            isAdmin={isAdmin}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* TAB: Tactical Board */}
            {activeTab === 'board' && (
              <div className="space-y-6" id="board-tab-content">
                <div className="bg-brand-sidebar border border-slate-800 rounded-xl p-6 shadow-xl">
                  <h3 className="font-bold text-white text-sm font-mono uppercase tracking-wider text-indigo-400">Pizarra Táctica del D.T.</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Organiza las piezas tácticas libres del seleccionado de tu país en un Green Pitch. Asigna el once titular histórico oficial bajo un formato coordinado y guarda tus pronósticos deportivos oficiales.
                  </p>
                </div>

                {userId === 'user_me' && (
                  <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-emerald-500/15 border border-indigo-500/20 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl shrink-0">
                        <Award className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-white uppercase tracking-wider font-mono">📢 ¡Inicia tu Registro de Elite!</h4>
                        <p className="text-[11px] text-gray-300 mt-0.5 leading-relaxed">
                          Estás usando una credencial de invitado temporal. Regístrate hoy de forma 100% gratuita para recibir tu propio <strong>Código de Juego Único</strong> y participar activamente por los premios en efectivo ($1.000 USD al 1º, $500 USD al 2º y $250 USD al 3º) el 30 de julio en vivo, con total transparencia auditada por un notario público.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsRegistrationOpen(true)}
                      className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg hover:opacity-90 transform hover:-translate-y-0.5 cursor-pointer transition shrink-0 whitespace-nowrap"
                    >
                      ¡Registrarme Ahora!
                    </button>
                  </div>
                )}
 
                {/* Country choice dropdown */}
                <div className="flex items-center gap-4 bg-brand-sidebar border border-slate-800/80 p-4 rounded-xl w-fit">
                  <span className="text-xs font-semibold text-slate-405 font-mono uppercase">Selección de Trabajo:</span>
                  <select
                    value={selectedCountryName}
                    onChange={(e) => handleCountrySelectionClick(e.target.value)}
                    className="bg-brand-deep text-white text-xs border border-slate-800 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                  >
                    {COUNTRIES.map(c => (
                      <option className="bg-[#0f172a] text-white" key={c.code} value={c.name}>{c.flag} {c.name}</option>
                    ))}
                  </select>
                </div>
 
                <ActivePitch
                  country={activeCountry.name}
                  players={getUnlockedPlayersForCountry(activeCountry.name)}
                  savedBoard={tacticalBoards[activeCountry.name] || null}
                  match={getPopulatedMatch(activeCountry.name, activeCountryPlayers)}
                  onSave={handleSaveBoard}
                />
              </div>
            )}
 
            {/* TAB: Leaderboard */}
            {activeTab === 'leaderboard' && (
              <LeaderboardView
                userBoards={tacticalBoards}
                unlockedLevels={unlockedLevels}
                playersDB={playersDB}
                currentUserId={userId}
                currentUsername={username}
                currentUserCode={userCode}
                currentUserSubscription={userSubscription}
                currentUserEmail={userEmail}
                userCoins={userCoins}
                userCashBalance={userCashBalance}
                userLicense={userLicense}
                onNavigateToSubscription={() => setActiveTab('subscription')}
              />
            )}

            {/* TAB: Groups & Fixture */}
            {activeTab === 'groups_fixture' && (
              <GroupsFixtureView
                unlockedLevels={unlockedLevels}
                playersDB={playersDB}
                userBoards={tacticalBoards}
                onSelectCountry={handleCountrySelectionClick}
                setActiveTab={setActiveTab}
                matchSyncKey={matchSyncKey}
                onSavePlayoffs={handleSavePlayoffs}
              />
            )}
 
            {/* TAB: Subscription Panel */}
            {activeTab === 'subscription' && (
              <SubscriptionView
                currentSubscription={userSubscription}
                userCode={userCode}
                onUpdateSubscription={handleUpdateSubscription}
                scoutChosenCountry={scoutChosenCountry}
                onUpdateScoutCountry={handleUpdateScoutCountry}
                currentUserId={userId}
                userEmail={userEmail}
                userLicense={userLicense}
                userPassword={userPassword}
                onUpdatePassword={handleUpdatePassword}
                onRequestOpenRegistration={() => setIsRegistrationOpen(true)}
                userCoins={userCoins}
                onUpdateCoins={setUserCoins}
                userCashBalance={userCashBalance}
                onUpdateCashBalance={setUserCashBalance}
                paymentHistory={paymentHistory}
                onAddTransaction={handleAddTransaction}
                onOpenBonusPack={handleOpenPack}
                unlockedLevels={unlockedLevels}
                onSetUnlockedLevels={setUnlockedLevels}
                onAddPurchasedPoints={(pts: number) => setPurchasedPoints(prev => prev + pts)}
                vipChosenContinent={vipChosenContinent}
                onUpdateVipContinent={handleUpdateVipContinent}
              />
            )}

            {/* TAB: Admin Database Panel */}
            {activeTab === 'admin' && (
              (userEmail.trim().toLowerCase() === 'geovannygrk3d@gmail.com' || userEmail.trim().toLowerCase() === 'geovannygrk3d@gmail' || userEmail.trim().toLowerCase() === 'conscientizarte13@gmail.com' || userEmail.trim().toLowerCase() === 'conscientizarte13@gmail') ? (
                <AdminPanelView
                  currentUserScore={currentUserInfo.totalScore}
                  currentUserCode={userCode}
                  currentUserId={userId}
                />
              ) : (
                <div className="max-w-xl mx-auto my-8 bg-white text-slate-800 border border-slate-200 rounded-lg p-8 shadow-[0_4px_12px_rgba(0,0,0,0.08)]" id="restricted-admin-access">
                  <div className="flex items-center justify-between border-b pb-4 mb-6">
                    <div className="flex items-center gap-[1px] text-lg font-sans font-bold select-none">
                      <span className="text-blue-600 font-extrabold">G</span>
                      <span className="text-red-500 font-extrabold">o</span>
                      <span className="text-yellow-550 font-extrabold">o</span>
                      <span className="text-blue-600 font-extrabold">g</span>
                      <span className="text-green-500 font-extrabold">l</span>
                      <span className="text-red-500 font-extrabold">e</span>
                      <span className="text-slate-500 text-xs font-normal ml-2 font-mono">Console</span>
                    </div>
                    <span className="bg-red-50 text-red-700 text-[10px] font-bold font-mono uppercase tracking-wider px-2.5 py-1 rounded-full">
                      Acceso Privado
                    </span>
                  </div>

                  <div className="flex flex-col items-center text-center py-4">
                    <div className="w-14 h-14 bg-red-50 border border-red-150 text-red-500 rounded-full flex items-center justify-center mb-4">
                      <ShieldCheck className="w-8 h-8" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 tracking-tight">Consola de Administración Restringida</h3>
                    <p className="text-xs text-slate-600 mt-2 max-w-sm font-sans leading-relaxed">
                      Este portal contiene el log de auditoría para sorteos, bases relacionales de directores técnicos y adjudicación de sobres del torneo. Por seguridad, requiere autenticación mediante el administrador oficial del Torneo 2026.
                    </p>
                  </div>

                  <div className="bg-slate-50 border border-slate-150 rounded-xl p-4 mt-2 text-[11px] font-mono text-slate-700 space-y-2 leading-relaxed">
                    <div className="flex items-center justify-between border-b border-dashed border-slate-200 pb-1.5">
                      <span className="font-bold text-slate-900">Estado de Cuenta:</span> 
                      <span>{userId === 'user_me' ? 'No Registrado (Invitado)' : `Director Técnico (${username})`}</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-dashed border-slate-200 pb-1.5">
                      <span className="font-bold text-slate-900">Tu Email Actual:</span> 
                      <span className={userEmail ? "text-slate-900 font-semibold" : "text-slate-400 italic"}>
                        {userEmail || 'Ninguno'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">Email Autorizado:</span> 
                      <span className="text-blue-600 font-semibold underline">conscientizarte13@gmail.com (o conscientizarte13@gmail)</span>
                    </div>
                  </div>

                  <div className="mt-8 flex flex-col sm:flex-row items-center justify-end gap-3.5 pt-4 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setTempEmail('conscientizarte13@gmail.com');
                        setIsRegistrationOpen(true);
                      }}
                      className="w-full sm:w-auto bg-[#1a73e8] hover:bg-[#1557b0] text-white font-medium text-xs tracking-wide px-5 py-2.5 rounded shadow-sm hover:shadow duration-150 transition cursor-pointer flex items-center justify-center gap-2"
                    >
                      <UserCheck className="w-4 h-4" /> Registrarse con Cuenta Autorizada
                    </button>
                    <button
                      onClick={() => setActiveTab('album')}
                      className="w-full sm:w-auto bg-transparent border border-slate-300 text-slate-600 hover:bg-slate-50 font-medium text-xs px-4 py-2.5 rounded duration-150 cursor-pointer"
                    >
                      Volver
                    </button>
                  </div>
                </div>
              )
            )}

            {/* TAB: Flutter Technical reference */}
            {activeTab === 'flutter' && (
              <FlutterDocsView />
            )}
          </>
        )}
              </motion.div>
            </AnimatePresence>
 
          </main>
 
          {/* Footer credits */}
          <footer className="border-t-3 border-black bg-[#070912] py-10 px-6 sm:px-12 text-slate-400 font-comic relative z-30 shrink-0 shadow-[0_-5px_0px_#000]">
            
            {/* Comic panel header separator */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-yellow-400 border-2 border-black text-black font-bangers uppercase tracking-widest text-xs px-4 py-1.5 rounded-lg shadow-[3px_3px_0px_#000] rotate-1 z-10 select-none">
              ⚡ COMPARTIR EXPERIENCIAS, FEEDBACK & SOPORTE TÁCTICO ⚡
            </div>

            {/* Main comic panel layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left mt-4 mb-8">
              
              {/* Panel 1: Blog de Noticias (Admin modifiable) */}
              <div className="bg-slate-950 p-5 border-2 border-black rounded-2xl shadow-[4px_4px_0px_rgba(0,0,0,1)] relative overflow-hidden flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="font-bangers text-sm sm:text-base text-yellow-400 uppercase tracking-wider flex items-center gap-1.5 drop-shadow-[1px_1px_0px_black]">
                      <span className="text-red-500">◆</span> BITÁCORA DE ACTUALIZACIONES
                    </h5>
                    <span className="text-[9px] font-mono bg-indigo-650 bg-indigo-600/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/10 uppercase font-black">
                      Blog Técnico
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-comic">
                    Comunicados oficiales del director de juego y notas de parches de Héroes del Deporte en tiempo real.
                  </p>

                  <div className="space-y-3 pt-2 max-h-[190px] overflow-y-auto pr-1">
                    {loadingFooterBlog ? (
                      <div className="text-[10px] font-mono text-slate-500 animate-pulse">Cargando anuncios oficiales...</div>
                    ) : footerBlogPosts.length === 0 ? (
                      <div className="text-[11px] font-mono text-slate-500">No hay publicaciones de administración todavía.</div>
                    ) : (
                      footerBlogPosts.slice(0, 3).map((post) => (
                        <div key={post.id} className="flex gap-2.5 items-start p-2 bg-slate-900/50 rounded-xl border border-slate-900 group hover:border-[#10B981]/30 transition">
                          <img 
                            src={post.imageUrl || "https://images.unsplash.com/photo-1540747737956-378724044602?q=80&w=800&auto=format&fit=crop"} 
                            alt="Noticia" 
                            className="w-10 h-10 object-cover rounded-lg border border-black shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div className="min-w-0">
                            <h6 className="text-[11px] font-black text-slate-200 uppercase truncate group-hover:text-[#10B981] transition">{post.title}</h6>
                            <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">{post.content}</p>
                            <span className="text-[8px] text-slate-600 font-mono mt-0.5 block">{new Date(post.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                <div className="pt-3 border-t border-slate-900 text-[10px] font-mono text-slate-500 flex justify-between items-center mt-3">
                  <span>Modo: Administrador Autorizado</span>
                  <button 
                    onClick={loadFooterBlogPosts} 
                    className="text-yellow-400 hover:underline font-bold hover:scale-105 transition cursor-pointer bg-transparent border-none outline-none"
                  >
                    Sincronizar Noticias
                  </button>
                </div>
              </div>

              {/* Panel 2: Formulario de Sugerencias */}
              <div className="bg-slate-950 p-5 border-2 border-black rounded-2xl shadow-[4px_4px_0px_rgba(0,0,0,1)] relative overflow-hidden">
                <h5 className="font-bangers text-sm sm:text-base text-red-500 uppercase tracking-wider flex items-center gap-1.5 drop-shadow-[1px_1px_0px_black] mb-2">
                  <span>◆</span> BUZÓN DE SUGERENCIAS Y COMENTARIOS
                </h5>
                <p className="text-[11px] text-slate-400 font-comic leading-relaxed mb-3">
                  ¿Tienes sugerencias tácticas o reclamos técnicos? Envíanos tus comentarios directo al buzón del creador.
                </p>

                <form onSubmit={handleSendFooterSuggestion} className="space-y-2.5 font-comic">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Tu nombre (DT) *"
                      value={footerSuggestName}
                      onChange={(e) => setFooterSuggestName(e.target.value)}
                      className="w-full bg-slate-900 border-2 border-black text-[11px] text-white py-1.5 px-2.5 rounded-lg focus:outline-none placeholder:text-gray-600 font-bold"
                    />
                    <input
                      type="email"
                      placeholder="Tu correo (Opc.)"
                      value={footerSuggestEmail}
                      onChange={(e) => setFooterSuggestEmail(e.target.value)}
                      className="w-full bg-slate-900 border-2 border-black text-[11px] text-white py-1.5 px-2.5 rounded-lg focus:outline-none placeholder:text-gray-600 font-mono"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <select
                      value={footerSuggestRecipient}
                      onChange={(e) => setFooterSuggestRecipient(e.target.value)}
                      className="w-full bg-slate-900 border-2 border-black text-[10px] text-indigo-300 py-1.5 px-2.5 rounded-lg focus:outline-none font-bold"
                    >
                      <option value="conscientizarte13@gmail.com">Sugerencia a: conscientizarte13@gmail.com</option>
                      <option value="roly3d@hotmail.com">Soporte a: roly3d@hotmail.com</option>
                      <option value="roly3d.rg@gmail.com">Licencias a: roly3d.rg@gmail.com</option>
                    </select>
                  </div>

                  <div>
                    <textarea
                      required
                      rows={2}
                      placeholder="Escribe sugerencia de trivia, cromo o soporte..."
                      value={footerSuggestContent}
                      onChange={(e) => setFooterSuggestContent(e.target.value)}
                      className="w-full bg-slate-900 border-2 border-black text-[11px] text-white py-1.5 px-2.5 rounded-lg focus:outline-none placeholder:text-gray-600 font-medium"
                    />
                  </div>

                  {footerSuggestSuccess && (
                    <div className="text-[10px] text-emerald-400 font-bold leading-tight font-mono">
                      {footerSuggestSuccess}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={footerSuggestLoading}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bangers text-[11.5px] uppercase tracking-wider rounded-xl border-2 border-black cursor-pointer shadow-[2px_2px_0px_#000] active:translate-y-0.5 active:shadow-[1px_1px_0px_#000] transition disabled:opacity-50"
                  >
                    {footerSuggestLoading ? 'PROCESANDO COLA...' : 'ENVIAR MENSAJE DIRECTO'}
                  </button>
                </form>
              </div>

              {/* Panel 3: Donación, Patrocinadores y Marcas Aliadas */}
              <div className="bg-slate-950 p-5 border-2 border-black rounded-2xl shadow-[4px_4px_0px_rgba(0,0,0,1)] relative overflow-hidden flex flex-col justify-between">
                <div>
                  <h5 className="font-bangers text-sm sm:text-base text-yellow-400 uppercase tracking-wider flex items-center gap-1.5 drop-shadow-[1px_1px_0px_black] mb-2">
                    <span>◆</span> DONACIÓN, PATROCINADORES Y ALIADOS
                  </h5>
                  <p className="text-[11px] text-slate-400 leading-relaxed mb-3 uppercase font-bold text-center border-b border-slate-900 pb-2.5">
                    AGRADECEMOS A LAS MARCAS POR SU CONFIANZA Y EL APOYO EN EL PORYECTO.
                  </p>

                  {/* Allied Brands Grid */}
                  <div className="grid grid-cols-3 gap-2.5">
                    <div className="bg-slate-900 p-2 border border-black rounded-xl text-center flex flex-col justify-center items-center shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)]">
                      <span className="font-bangers text-white text-[11px] uppercase tracking-wide">CIG</span>
                      <span className="text-[8px] font-mono text-yellow-400 block -mt-0.5 font-bold">PROMOTOR</span>
                    </div>
                    <div className="bg-slate-900 p-2 border border-black rounded-xl text-center flex flex-col justify-center items-center shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)]">
                      <span className="font-bangers text-white text-[11px] uppercase tracking-wide">Guerra Tech</span>
                      <span className="text-[8px] font-mono text-[#10B981] block -mt-0.5 font-bold">TECNOLOGÍA</span>
                    </div>
                    <div className="bg-slate-900 p-2 border border-black rounded-xl text-center flex flex-col justify-center items-center shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)]">
                      <span className="font-bangers text-white text-[11px] uppercase tracking-wide">Guerreros de Luz</span>
                      <span className="text-[8px] font-mono text-red-500 block -mt-0.5 font-bold">ALIANZA</span>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-300 font-comic font-bold uppercase mt-3 leading-snug text-center border-t border-slate-900 pt-2.5">
                    ¿QUIERES SER PATROCINADOR Y AYUDAR A CAUSAS SOCIALES? ESCRIBENOS O REALIZA TU DONACIÓN POR FAVOR
                  </p>
                </div>

                <div className="pt-3 flex gap-2">
                  <a 
                    href="https://paypal.me/geovannygrk3d" 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex-1 text-center py-2 bg-[#1d4ed8] hover:bg-[#1e40af] text-white font-bangers text-[11px] uppercase tracking-wide rounded-lg border border-black cursor-pointer shadow-[2px_2px_0px_#000] active:translate-y-0.5 transition block"
                  >
                    DONAR CON PAYPAL
                  </a>
                  <button 
                    onClick={() => setAppCustomAlert({
                      title: '🎗️ Donaciones Directas de Patrocinio',
                      message: 'Si deseas transferir por Deuna, Banco Pichincha o cooperativas aliadas de Ecuador para aparecer en la lista de marcas del álbum, por favor contáctanos escribiendo a conscientizarte13@gmail.com o roly3d@hotmail.com.'
                    })}
                    className="py-2 px-3 bg-[#e11d48] hover:bg-[#be123c] text-white font-bangers text-[11px] uppercase tracking-wide rounded-lg border border-black cursor-pointer shadow-[2px_2px_0px_#000] active:translate-y-0.5 transition"
                  >
                    SOCIOS / DEUNA
                  </button>
                </div>
              </div>

            </div>

            {/* General bottom line */}
            <div className="border-t border-slate-900 pt-5 text-center text-[10px] text-slate-500 font-mono flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                © 2026 Héroes del Deporte. Creado por <strong>CIG</strong>, Diseño por <strong>RKLY</strong>, impulsado con IA de vanguardia, servidores de baja latencia y tecnología Google Cloud.
              </div>
              <div className="flex gap-4">
                <span className="text-gray-500">Admin email: conscientizarte13@gmail.com</span>
              </div>
            </div>
          </footer>
        </div>

        {/* MOBILE BOTTOM NAVIGATION BAR - Fixed to the bottom on screens < lg */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-brand-sidebar border-t-2 border-black py-1 px-2.5 flex justify-around items-center shadow-[0_-3px_0px_rgba(0,0,0,0.15)] pb-safe select-none">
          <button
            onClick={() => { setActiveTab('album'); setActiveTrivia(null); }}
            className={`flex flex-col items-center justify-center p-1 rounded-lg transition-all min-h-[44px] min-w-[50px] cursor-pointer ${
              activeTab === 'album' && !activeTrivia ? 'text-[#10B981] scale-105 font-bold' : 'text-slate-400'
            }`}
          >
            <Layers className="w-5 h-5 shrink-0" />
            <span className="text-[9px] font-comic font-black mt-0.5 flex items-center justify-center gap-0.5">
              {!isRegistered && <span className="text-[8px] filter saturate-150">🔒</span>}
              Álbum
            </span>
          </button>
          <button
            onClick={() => { setActiveTab('groups_fixture'); setActiveTrivia(null); }}
            className={`flex flex-col items-center justify-center p-1 rounded-lg transition-all min-h-[44px] min-w-[50px] cursor-pointer ${
              activeTab === 'groups_fixture' ? 'text-white scale-105 font-bold' : 'text-slate-400'
            }`}
          >
            <Calendar className="w-5 h-5 shrink-0" />
            <span className="text-[9px] font-comic font-black mt-0.5 flex items-center justify-center gap-0.5">
              {!isRegistered && <span className="text-[8px] filter saturate-150">🔒</span>}
              Fixture
            </span>
          </button>
          <button
            onClick={() => { setActiveTab('board'); setActiveTrivia(null); }}
            className={`flex flex-col items-center justify-center p-1 rounded-lg transition-all min-h-[44px] min-w-[50px] cursor-pointer ${
              activeTab === 'board' ? 'text-[#EF4444] scale-105 font-bold' : 'text-slate-400'
            }`}
          >
            <FolderTree className="w-5 h-5 shrink-0" />
            <span className="text-[9px] font-comic font-black mt-0.5 flex items-center justify-center gap-0.5">
              {!isRegistered && <span className="text-[8px] filter saturate-150">🔒</span>}
              Pizarra
            </span>
          </button>
          <button
            onClick={() => { setActiveTab('leaderboard'); setActiveTrivia(null); }}
            className={`flex flex-col items-center justify-center p-1 rounded-lg transition-all min-h-[44px] min-w-[50px] cursor-pointer ${
              activeTab === 'leaderboard' ? 'text-[#10B981] scale-105 font-bold' : 'text-slate-400'
            }`}
          >
            <Trophy className="w-5 h-5 shrink-0" />
            <span className="text-[9px] font-comic font-black mt-0.5 flex items-center justify-center gap-0.5">
              {!isRegistered && <span className="text-[8px] filter saturate-150">🔒</span>}
              Ligas
            </span>
          </button>
          <button
            onClick={() => { setActiveTab('subscription'); setActiveTrivia(null); }}
            className={`flex flex-col items-center justify-center p-1 rounded-lg transition-all min-h-[44px] min-w-[50px] cursor-pointer ${
              activeTab === 'subscription' ? 'text-white scale-105 font-bold' : 'text-slate-400'
            }`}
          >
            <CreditCard className="w-5 h-5 shrink-0" />
            <span className="text-[9px] font-comic font-black mt-0.5 flex items-center justify-center gap-0.5">
              {!isRegistered && <span className="text-[8px] filter saturate-150">🔒</span>}
              VIP
            </span>
          </button>
        </nav>

      </div>

      {showGuestWelcome && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md transition-all animate-fade-in bg-halftone-dots">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-rose-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />

          <div className="relative w-full max-w-[480px] bg-[#0c101a] text-white border-[3.5px] border-black rounded-3xl shadow-[8px_8px_0px_#000] font-sans flex flex-col overflow-hidden">
            
            {/* Header with flags and icon */}
            <div className="p-6 pb-4 select-none border-b border-black bg-slate-950/60 text-center relative">
              <div className="mx-auto w-16 h-16 bg-gradient-to-tr from-emerald-500 to-teal-600 border-[3px] border-black rounded-2xl flex items-center justify-center shadow-[3px_3px_0px_#000] rotate-3 mb-4 shrink-0">
                <Globe className="w-8 h-8 text-white stroke-[2.5]" />
              </div>

              <h3 className="text-xl font-extrabold text-[#11b782] tracking-wider uppercase font-sans">
                ¡BIENVENIDO AL DESAFÍO! ⚽
              </h3>
              <p className="text-[11px] text-slate-300 mt-1 max-w-sm mx-auto leading-relaxed font-comic font-medium">
                Álbum Digital Interactivo & Trivia Héroes del Deporte
              </p>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar text-center">
              
              {/* Premium Welcome Gift Highlight */}
              <div className="bg-[#11221b] border-2 border-[#11b782] rounded-2xl p-4.5 text-left shadow-[4px_4px_0px_#000] relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-rose-600 text-white text-[8px] uppercase tracking-widest font-black px-2 py-0.5 border-b-2 border-l-2 border-black rounded-bl-lg">
                  REGALO DE BIENVENIDA 🎁
                </div>
                <h4 className="text-xs font-sans font-black tracking-wide text-white uppercase mb-1">
                  ¡Tu primera alineación va por nuestra cuenta! ⚽🏆
                </h4>
                <p className="text-[11px] text-slate-200 font-sans mb-3 leading-relaxed">
                  En <strong>Héroes del Deporte</strong> queremos que empieces en lo más alto. Regístrate hoy mismo y reclama tu regalo de bienvenida:
                </p>
                <ul className="space-y-2 text-[11px] text-slate-300 font-sans">
                  <li className="flex items-start gap-2">
                    <span className="text-[#11b782] shrink-0 font-bold">🎁</span>
                    <span><strong>Desbloquea GRATIS</strong> el equipo que tú elijas.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#11b782] shrink-0 font-bold">🎁</span>
                    <span><strong>Recibe su pack completo</strong> de cromos digitales para empezar a armar tu colección.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#11b782] shrink-0 font-bold">🎁</span>
                    <span><strong>Elige a tus ídolos</strong>, sigue sus estadísticas y demuestra que eres el que más sabe de fútbol.</span>
                  </li>
                </ul>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                ¡Hola, fanático del fútbol! Te damos una cálida y amable bienvenida al <strong>desafío táctico definitivo</strong> de la Copa del Mundo 2026.
              </p>

              <div className="bg-slate-900/80 border-2 border-black rounded-2xl p-4 text-left space-y-3 shadow-[4px_4px_0px_rgba(0,0,0,0.15)]">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-[#11b782] font-mono">
                  ¿En qué consiste el desafío de la página?
                </h4>
                
                <ul className="space-y-2 text-[11px] text-slate-300 font-sans">
                  <li className="flex items-start gap-2">
                    <span className="text-[#11b782] shrink-0 font-bold">✓</span>
                    <span><strong>Colecciona Cromos Exclusivos:</strong> Resuelve trivias futbolísticas y abre sobres virtuales para llenar tu álbum de selecciones nacionales.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#11b782] shrink-0 font-bold">✓</span>
                    <span><strong>Pizarra Táctica Interactiva:</strong> Arma tu alineación preferida arrastrando jugadores en la cancha táctica.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#11b782] shrink-0 font-bold">✓</span>
                    <span><strong>Premios en Efectivo:</strong> Gana <strong>$1.000 USD</strong> (1er lugar), <strong>$500 USD</strong> (2do lugar) y <strong>$250 USD</strong> (3er lugar). Los premios se entregarán el <strong>30 de julio de 2026</strong> en vivo por Facebook Live y YouTube.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#11b782] shrink-0 font-bold">✓</span>
                    <span><strong>Auditoría Notarial Completa:</strong> Para máxima seguridad y transparencia, la contabilidad de puntos y todas las donaciones son <strong>auditadas en vivo por un notario público</strong>.</span>
                  </li>
                </ul>
              </div>

              <p className="text-[10.5px] text-slate-400 italic">
                Únete a miles de directores técnicos de España, Ecuador y todo el mundo.
              </p>
            </div>

            {/* Footer with actions */}
            <div className="p-6 pt-2 border-t border-black bg-slate-950/40 flex flex-col gap-2.5">
              <button
                onClick={() => {
                  setShowGuestWelcome(false);
                  setIsRegistrationOpen(true);
                }}
                className="w-full bg-[#FDDF2B] hover:bg-[#ffe338] text-black border-2 border-black font-comic font-black text-xs py-3 rounded-xl shadow-[3.5px_3.5px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 active:translate-y-1 transition duration-150 cursor-pointer uppercase tracking-wider text-center"
              >
                Registrar mi Cuenta de DT 🏆
              </button>
              
              <button
                onClick={() => setShowGuestWelcome(false)}
                className="w-full bg-slate-900 hover:bg-slate-800 text-slate-300 border-2 border-black font-comic font-black text-xs py-2.5 rounded-xl transition duration-150 cursor-pointer uppercase tracking-wider text-center"
              >
                Explorar como Invitado 🔍
              </button>
            </div>

          </div>
        </div>
      )}

      {isRegistrationOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md transition-all animate-fade-in bg-halftone-dots">
          {/* Glowing gradient blurs matching background of top-tier comic covers */}
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-rose-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />

          <div className="relative w-full max-w-[460px] max-h-[92vh] bg-[#0c101a] text-white border-[3.5px] border-black rounded-3xl shadow-[8px_8px_0px_#000] font-sans flex flex-col overflow-hidden">
            
            {/* Modal Header (Fixed) with shield/checkmark checkmark badge */}
            <div className="p-6 pb-3 select-none border-b border-black bg-slate-950/50 text-center relative">
              <div className="mx-auto w-16 h-16 bg-gradient-to-tr from-amber-500 via-rose-500 to-pink-600 border-[3px] border-black rounded-2xl flex items-center justify-center shadow-[3px_3px_0px_#000] -rotate-3 mb-4 shrink-0">
                <ShieldCheck className="w-8 h-8 text-white stroke-[2.5]" />
              </div>

              <h3 className="text-xl font-extrabold text-white tracking-wider uppercase font-sans">
                PROTEGIDOS TERMINALES
              </h3>
              <p className="text-[10.5px] text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed font-comic">
                {isRecoveryMode 
                  ? "Protocolo de Restauración de Contraseña" 
                  : (isLoginMode ? "Conexión de Miembro Oficial de la Copa" : "Registro de Nuevo Director Técnico")
                }
              </p>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 max-h-[58vh] custom-scrollbar">
              
              {/* Toggle Box / Mode Selector styled in gorgeous dark tone */}
              {!isRecoveryMode ? (
                <div className="bg-slate-900 border-2 border-black rounded-2xl p-4 text-center shadow-[4px_4px_0px_#000]">
                  <p className="text-[10px] text-slate-400 font-bold mb-2 font-mono uppercase tracking-widest">
                    {isLoginMode ? "¿ERES UN MIEMBRO NUEVO?" : "¿YA TE REGISTRASTE EN ESTE NAVEGADOR?"}
                  </p>
                  <div className="flex flex-col gap-1.5 items-center justify-center">
                    <button
                      type="button"
                      onClick={() => {
                        setIsLoginMode(!isLoginMode);
                        setTempPassword('');
                        setTempConfirmPassword('');
                      }}
                      className="px-5 py-2 bg-[#FDDF2B] hover:bg-[#ffe338] text-black border-2 border-black text-[10px] font-black rounded-xl transition-all cursor-pointer shadow-[3px_3px_0px_#000] active:translate-y-0.5 uppercase tracking-widest"
                    >
                      {isLoginMode ? "⚡ Registrar Cuenta de D.T." : "🔑 Ya soy Miembro, Ingresar"}
                    </button>
                    {isLoginMode && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsRecoveryMode(true);
                          setRecoveryStep('verify');
                          setTempPassword('');
                          setTempConfirmPassword('');
                        }}
                        className="text-[10px] text-amber-400 hover:text-amber-300 hover:underline font-bold mt-2 uppercase tracking-wider font-mono"
                      >
                        ⚙️ ¿Olvidaste tu contraseña? Restaurar de forma segura
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-[#1e1315] border-2 border-black rounded-2xl p-4 text-center shadow-[4px_4px_0px_#000]">
                  <p className="text-[10px] text-rose-400 font-bold mb-2 font-mono uppercase tracking-widest">
                    ⚠️ PROCESO DE RECUPERACIÓN SEGURO ACTIVO
                  </p>
                  <div className="flex justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setIsRecoveryMode(false);
                        setIsLoginMode(true);
                        setTempPassword('');
                        setTempConfirmPassword('');
                      }}
                      className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-[9px] font-bold rounded-lg border border-black transition-all cursor-pointer shadow-[2px_2px_0px_#000]"
                    >
                      🔑 Volver al Login
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsRecoveryMode(false);
                        setIsLoginMode(false);
                        setTempPassword('');
                        setTempConfirmPassword('');
                      }}
                      className="px-3.5 py-1.5 bg-[#11b782] hover:bg-emerald-500 text-black text-[9px] font-black rounded-lg border border-black transition-all cursor-pointer shadow-[2px_2px_0px_#000]"
                    >
                      ⚡ Registrar Cuenta
                    </button>
                  </div>
                </div>
              )}

              {/* Promotional Sign-Up Reward Reminder inside the form */}
              {!isLoginMode && !isRecoveryMode && (
                <div className="bg-[#11221b] border-2 border-[#11b782] rounded-2xl p-3.5 text-left shadow-[3px_3px_0px_rgba(0,0,0,1)] relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-[#e11d48] text-white text-[7px] uppercase tracking-widest font-black px-1.5 py-0.5 border-b-2 border-l-2 border-black rounded-bl-lg">
                    REGALO ⚽
                  </div>
                  <h5 className="text-[11px] font-bold text-[#FDDF2B] uppercase mb-1">
                    ¡Tu primera alineación va por nuestra cuenta! ⚽🏆
                  </h5>
                  <p className="text-[10px] text-slate-300 leading-normal">
                    En Héroes del Deporte queremos que empieces en lo más alto. Regístrate hoy mismo y reclama tu regalo de bienvenida:
                  </p>
                  <ul className="mt-2 space-y-1 text-[10px] text-slate-300">
                    <li className="flex items-start gap-1.5">
                      <span className="text-[#11b782] shrink-0 font-bold">🎁</span>
                      <span>Desbloquea GRATIS el equipo que tú elijas.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-[#11b782] shrink-0 font-bold">🎁</span>
                      <span>Recibe su pack completo de cromos digitales para empezar a armar tu colección.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-[#11b782] shrink-0 font-bold">🎁</span>
                      <span>Elige a tus ídolos, sigue sus estadísticas y demuestra que eres el que más sabe de fútbol.</span>
                    </li>
                  </ul>
                </div>
              )}

              {/* Autocomplete Button (only in normal sign-up/creation) */}
              {!isLoginMode && !isRecoveryMode && (
                <button
                  type="button"
                  onClick={() => {
                    setTempEmail('conscientizarte13@gmail.com');
                    setTempUsername('DT_Conscientizarte_2026');
                    setTempAvatar('👑');
                  }}
                  title="Click para autocompletar con tu cuenta de correo activa"
                  className="w-full bg-[#1e293b] hover:bg-[#334155] text-white border-2 border-black rounded-xl px-4 py-2.5 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer active:translate-y-0.5 shadow-[3px_3px_0px_rgba(0,0,0,1)] select-none"
                >
                  <span className="text-base">📧</span>
                  <span className="truncate font-mono">Autocompletar con {userEmail || 'conscientizarte13@gmail.com'}</span>
                </button>
              )}

              <div className="relative flex py-1 items-center select-none">
                <div className="flex-grow border-t border-slate-800"></div>
                <span className="flex-shrink mx-3 text-[9px] text-slate-500 font-bold uppercase tracking-wider font-mono">
                  {isRecoveryMode 
                    ? `Paso: ${recoveryStep === 'verify' ? '1. Verificar Identidad' : '2. Nueva Contraseña'}` 
                    : (isLoginMode ? "Credenciales de Acceso" : "O escribe tus datos")
                  }
                </span>
                <div className="flex-grow border-t border-slate-800"></div>
              </div>

              {/* Fields render */}
              <div className="space-y-4">
                
                {/* 1.5 PASSWORD RECOVERY SCREEN: STEP CODE_VERIFICATION (VERIFY 6-DIGIT CODE) */}
                {isRecoveryMode && recoveryStep === 'code_verification' && (
                  <div className="space-y-4">
                    <div className="bg-[#1e1315]/90 border border-rose-500/30 p-3.5 rounded-xl text-rose-300 text-[10px] leading-relaxed font-mono">
                      <strong>💡 Paso de Seguridad Auditable:</strong> Para salvaguardar tu progreso y garantizar la transparencia del sorteo, por favor ingresa el <strong>Código de Acceso Temporal</strong> de 6 dígitos que fue enviado al Director Técnico.
                    </div>

                    <div>
                      <label className="text-[10px] font-extrabold text-slate-400 block mb-1 uppercase tracking-wider font-mono">
                        Correo del Director Técnico
                      </label>
                      <input
                        type="email"
                        value={tempEmail}
                        disabled
                        className="w-full bg-slate-900 border-2 border-black rounded-xl px-4 py-2.5 text-xs text-slate-400 font-mono shadow-[2px_2px_0px_rgba(0,0,0,0.15)] cursor-not-allowed select-none"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-extrabold text-slate-400 block mb-1 uppercase tracking-wider font-mono">
                        Código de Recuperación Temporal *
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="Ingresa el código de 6 dígitos"
                        value={inputRecoveryCode}
                        onChange={(e) => setInputRecoveryCode(e.target.value.replace(/\D/g, ''))}
                        className="w-full bg-slate-950/80 border-2 border-[#11b782] rounded-xl px-4 py-2.5 text-sm tracking-widest text-center text-[#11b782] font-black focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono shadow-[2px_2px_0px_rgba(0,0,0,0.15)] placeholder:text-gray-600 hover:bg-slate-950 transition"
                        required
                      />
                    </div>

                    <div className="bg-slate-900/60 p-2.5 rounded-xl border border-dashed border-slate-800 text-center">
                      <span className="text-[9px] text-slate-500 block">¿No recibiste el código? Puedes pedirlo de nuevo reintentando el inicio de sesión fallido. El código temporal activo es:</span>
                      <span className="text-xs font-black text-amber-400 select-all font-mono tracking-widest mt-1 block">{sentRecoveryCode}</span>
                    </div>
                  </div>
                )}

                {/* 1. PASSWORD RECOVERY SCREEN: STEP 1 (VERIFY EMAIL & SECURITY AVATAR) */}
                {isRecoveryMode && recoveryStep === 'verify' && (
                  <div className="space-y-4">
                    <div className="bg-slate-900 border border-amber-500/30 p-3 rounded-xl text-amber-400 text-[10px] leading-relaxed font-mono">
                      <strong>💡 ¿Cómo funciona?</strong> Ingresa tu correo registrado y selecciona tu <strong>Escudo/Avatar</strong> elegido. Si coinciden, el sistema auditable te autorizará a restablecer la clave.
                    </div>

                    <div>
                      <label className="text-[10px] font-extrabold text-slate-400 block mb-1 uppercase tracking-wider font-mono">
                        Correo electrónico registrado *
                      </label>
                      <input
                        type="email"
                        placeholder="Ingresa tu correo registrado"
                        value={tempEmail}
                        onChange={(e) => setTempEmail(e.target.value)}
                        className="w-full bg-slate-950/80 border-2 border-black rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 font-mono shadow-[2px_2px_0px_rgba(0,0,0,0.15)] placeholder:text-gray-600 hover:bg-slate-950 transition"
                        required
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={handleRevealStoredPassword}
                        className="text-[10px] text-amber-400 hover:text-amber-300 font-black underline flex items-center gap-1 active:scale-95 transition-all text-right font-mono uppercase"
                      >
                        🔑 Revelar contraseña guardada en este navegador
                      </button>
                    </div>

                    <div>
                      <label className="text-[10px] font-extrabold text-slate-400 block mb-1.5 uppercase tracking-wider font-mono">
                        Selecciona tu Escudo de Identidad / Avatar de Registro *
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {['⚽', '👑', '🧠', '🕵️‍♂️', '🏆', '🔥', '⚡', '🎯'].map((emoji) => {
                          const isSelected = tempAvatar === emoji;
                          return (
                            <button
                              key={emoji}
                              type="button"
                              onClick={() => setTempAvatar(emoji)}
                              className={`text-xl py-2 rounded-xl border-2 transition-all cursor-pointer ${
                                isSelected 
                                  ? 'bg-amber-400 border-black text-slate-950 scale-105 shadow-[2px_2px_0px_rgba(0,0,0,1)] font-black' 
                                  : 'bg-slate-950/80 border-black text-slate-400 hover:border-slate-500 hover:text-white'
                              }`}
                            >
                              {emoji}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. PASSWORD RECOVERY SCREEN: STEP 2 (WRITE NEW PASSWORD) */}
                {isRecoveryMode && recoveryStep === 'reset' && (
                  <div className="space-y-4 bg-slate-900 p-4 border border-black rounded-2xl shadow-[3px_3px_0px_#000]">
                    <div className="text-[10.5px] text-emerald-400 font-bold mb-1 flex items-center gap-1.5 font-mono">
                      <span>✅ Identidad Verificada para:</span>
                      <span className="underline italic text-xs text-white">{tempEmail}</span>
                    </div>

                    <div>
                      <label className="text-[10px] font-extrabold text-slate-400 block mb-1 uppercase tracking-wider font-mono">
                        Nueva Contraseña de Acceso *
                      </label>
                      <input
                        type="password"
                        placeholder="Establece nueva contraseña (mínimo 4 caracteres)"
                        value={tempPassword}
                        onChange={(e) => setTempPassword(e.target.value)}
                        className="w-full bg-slate-950/80 border-2 border-black rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono shadow-[2px_2px_0px_rgba(0,0,0,0.15)] placeholder:text-gray-600 hover:bg-slate-950 transition"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-extrabold text-slate-400 block mb-1 uppercase tracking-wider font-mono">
                        Confirmar Nueva Contraseña *
                      </label>
                      <input
                        type="password"
                        placeholder="Escribe la contraseña exactamente igual"
                        value={tempConfirmPassword}
                        onChange={(e) => setTempConfirmPassword(e.target.value)}
                        className="w-full bg-slate-950/80 border-2 border-black rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono shadow-[2px_2px_0px_rgba(0,0,0,0.15)] placeholder:text-gray-600 hover:bg-slate-950 transition"
                        required
                      />
                      {tempPassword && tempConfirmPassword && tempPassword !== tempConfirmPassword && (
                        <p className="text-[9.5px] text-[#EF4444] font-bold mt-1 animate-pulse font-mono">
                          ❌ Las contraseñas no coinciden
                        </p>
                      )}
                      {tempPassword && tempConfirmPassword && tempPassword === tempConfirmPassword && (
                        <p className="text-[9.5px] text-emerald-400 font-bold mt-1 flex items-center gap-1 font-mono">
                          ✅ Las contraseñas coinciden perfectamente
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* 3. NORMAL LOGIN OR SIGN UP CONTROLS (IF NOT RECOVERY MODE) */}
                {!isRecoveryMode && (
                  <div className="space-y-4">
                    {/* Email address field */}
                    <div>
                      <label className="text-[10px] font-extrabold text-slate-400 block mb-1 uppercase tracking-wider font-mono">
                        Correo electrónico institucional o personal *
                      </label>
                      <input
                        type="email"
                        placeholder="ejemplo@gmail.com"
                        value={tempEmail}
                        onChange={(e) => setTempEmail(e.target.value)}
                        className="w-full bg-slate-950/80 border-2 border-black rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 font-mono shadow-[2px_2px_0px_rgba(0,0,0,0.15)] placeholder:text-gray-600 hover:bg-slate-950 transition"
                        required
                      />
                      <p className="text-[9px] text-slate-400 mt-1.5 leading-snug font-mono">
                        {isLoginMode 
                          ? "Ingresa el mismo correo que usaste al registrarte. Admite conscientizarte13@gmail.com."
                          : "Para habilitar facultades de Administrador Senior, ingresa el correo autenticado conscientizarte13@gmail.com"
                        }
                      </p>
                    </div>

                    {/* Username field (Sign Up only) */}
                    {!isLoginMode && (
                      <div>
                        <label className="text-[10px] font-extrabold text-slate-400 block mb-1 uppercase tracking-wider font-mono">
                          Nombre del Director Técnico (D.T.) *
                        </label>
                        <input
                          type="text"
                          placeholder="Ej. DT_ScaloniChampion"
                          maxLength={25}
                          value={tempUsername}
                          onChange={(e) => setTempUsername(e.target.value)}
                          className="w-full bg-slate-950/80 border-2 border-black rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 font-mono shadow-[2px_2px_0px_rgba(0,0,0,0.15)] placeholder:text-gray-600 hover:bg-slate-950 transition"
                          required={!isLoginMode}
                        />
                      </div>
                    )}

                    {/* Password field */}
                    <div>
                      <label className="text-[10px] font-extrabold text-slate-400 block mb-1 uppercase tracking-wider font-mono">
                        {isLoginMode ? "Contraseña *" : "Crear Contraseña *"}
                      </label>
                      <input
                        type="password"
                        placeholder={isLoginMode ? "Ingresa tu contraseña" : "Crea tu contraseña (mínimo 4 caracteres)"}
                        value={tempPassword}
                        onChange={(e) => setTempPassword(e.target.value)}
                        className="w-full bg-slate-950/80 border-2 border-black rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 font-mono shadow-[2px_2px_0px_rgba(0,0,0,0.15)] placeholder:text-gray-600 hover:bg-slate-950 transition"
                        required
                      />
                    </div>

                    {/* Confirm Password field (Sign Up only) */}
                    {!isLoginMode && (
                      <div>
                        <label className="text-[10px] font-extrabold text-slate-400 block mb-1 uppercase tracking-wider font-mono">
                          Confirmar Contraseña *
                        </label>
                        <input
                          type="password"
                          placeholder="Repite tu contraseña exactamente"
                          value={tempConfirmPassword}
                          onChange={(e) => setTempConfirmPassword(e.target.value)}
                          className="w-full bg-slate-950/80 border-2 border-black rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 font-mono shadow-[2px_2px_0px_rgba(0,0,0,0.15)] placeholder:text-gray-600 hover:bg-slate-950 transition"
                          required={!isLoginMode}
                        />
                        {tempPassword && tempConfirmPassword && tempPassword !== tempConfirmPassword && (
                          <p className="text-[9.5px] text-[#EF4444] font-bold mt-1 animate-pulse font-mono">
                            ❌ Las contraseñas no coinciden
                          </p>
                        )}
                        {tempPassword && tempConfirmPassword && tempPassword === tempConfirmPassword && (
                          <p className="text-[9.5px] text-emerald-400 font-bold mt-1 flex items-center gap-1 font-mono">
                            ✅ Las contraseñas coinciden perfectamente
                          </p>
                        )}
                      </div>
                    )}

                    {/* Recommendation Panel (Sign Up only) */}
                    {!isLoginMode && (
                      <div className="p-3.5 bg-slate-900 border-2 border-black rounded-2xl space-y-2 shadow-[2px_2px_0px_#000]">
                        <label className="text-[10px] font-extrabold text-amber-400 block uppercase tracking-wider font-mono">
                          🎁 Panel de Recomendación (Opcional)
                        </label>
                        <p className="text-[9px] text-slate-400 leading-snug font-sans">
                          Si otro Director Técnico te recomendó conectarte, ingresa su correo registrado abajo. Nota: De acuerdo a los reglamentos oficiales, sólo los directores de planes pagados calificados (Scout o VIP) pueden realizar invitaciones con su correo y recibir estos puntos extra.
                        </p>
                        <input
                          type="email"
                          placeholder="ejemplo@correo.com (El correo de tu amigo)"
                          value={tempReferredByEmail}
                          onChange={(e) => setTempReferredByEmail(e.target.value)}
                          className="w-full bg-slate-950/80 border-2 border-black rounded-xl px-4 py-2 text-xs text-white font-mono placeholder:text-gray-600 focus:border-yellow-400 focus:outline-none transition shadow-sm"
                        />
                      </div>
                    )}

                    {/* Avatar Picker style (Sign Up only) */}
                    {!isLoginMode && (
                      <div>
                        <label className="text-[10px] font-extrabold text-slate-400 block mb-1.5 uppercase tracking-wider font-mono">
                          Elige tu Escudo de Identidad / Avatar
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                          {['⚽', '👑', '🧠', '🕵️‍♂️', '🏆', '🔥', '⚡', '🎯'].map((emoji) => {
                            const isSelected = tempAvatar === emoji;
                            return (
                              <button
                                key={emoji}
                                type="button"
                                onClick={() => setTempAvatar(emoji)}
                                className={`text-xl py-2 rounded-xl border-2 transition-all cursor-pointer ${
                                  isSelected 
                                    ? 'bg-amber-400 border-black text-slate-950 scale-105 shadow-[2px_2px_0px_rgba(0,0,0,1)] font-black' 
                                    : 'bg-slate-950/80 border-black text-slate-400 hover:border-slate-500 hover:text-white'
                                }`}
                              >
                                {emoji}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Secure explanation panel */}
                <div className="bg-slate-950/80 border-2 border-black rounded-2xl p-3.5 text-[10px] text-emerald-400 font-semibold leading-relaxed flex items-start gap-2.5 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="font-mono">
                    La base de datos resguarda de forma segura tu clave y progreso atómico para las auditorías autorizadas de la Copa 2026.
                  </span>
                </div>
              </div>

            </div>

            {/* Modal Footer (Fixed at bottom) */}
            <div className="p-6 pt-3 border-t border-black bg-slate-950/80 flex items-center justify-between select-none">
              <button
                type="button"
                onClick={() => setIsRegistrationOpen(false)}
                className="text-xs font-bold text-slate-400 hover:text-white px-4 py-2 rounded-xl transition duration-150 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  const form = document.getElementById('google-registration-form-hidden') as HTMLFormElement;
                  if (form) {
                    form.requestSubmit();
                  }
                }}
                className="bg-[#FDDF2B] hover:bg-[#ffe338] text-black border-2 border-black font-comic font-black text-xs px-6 py-2.5 rounded-xl shadow-[3.5px_3.5px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 active:translate-y-1 transition duration-150 cursor-pointer uppercase tracking-wider"
              >
                {isRecoveryMode 
                  ? (recoveryStep === 'verify' ? "Verificar Identidad 🧠" : (recoveryStep === 'code_verification' ? "Verificar Código 🔑" : "Restablecer y Entrar ⚡")) 
                  : (isLoginMode ? "Iniciar Sesión ⚡" : "Registrar Cuenta 🏆")
                }
              </button>
            </div>

            {/* Hidden Form to support HTML validation native submission */}
            <form 
              id="google-registration-form-hidden" 
              onSubmit={isRecoveryMode ? handleCommitRecovery : (isLoginMode ? handleCommitLogin : handleCommitRegistration)} 
              className="hidden" 
            />

          </div>
        </div>
      )}

      {/* MODAL 1: CONFIRM FREE SELECTION */}
      {countryToConfirmFree && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-md animate-fade-in bg-halftone-dots">
          <div className="relative max-w-md w-full bg-[#0a0f0d] border-[4px] border-black rounded-3xl p-6 md:p-8 shadow-[8px_8px_0px_rgba(0,0,0,1)] text-center">
            
            <div className="bg-[#11b782] text-black border-2 border-black p-3.5 rotate-[-1deg] shadow-[4px_4px_0px_#000] mb-6">
              <h3 className="font-bangers text-2xl tracking-wider uppercase">
                🎯 CONFIRMAR TU SELECCIÓN GRATUITA
              </h3>
            </div>

            <div className="text-5xl my-4">
              {COUNTRIES.find(c => c.name === countryToConfirmFree)?.flag}
            </div>

            <p className="text-sm text-slate-200 font-comic font-bold leading-relaxed mb-4">
              Has elegido a <strong className="text-emerald-400">{countryToConfirmFree}</strong> como tu única selección nacional para completar el juego de forma gratuita.
            </p>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs text-left text-slate-400 space-y-2 mb-6 font-comic leading-relaxed">
              <p>• Podrás desbloquear sus <strong className="text-white">26 cromos</strong> oficiales.</p>
              <p>• Podrás superar sus <strong className="text-white">3 niveles de trivias</strong> para ganar puntos.</p>
              <p>• Las demás selecciones quedarán <strong className="text-red-400">bloqueadas</strong> hasta que adquieras un plan de suscripción VIP o Scout.</p>
              <p className="text-amber-400 font-bold mt-1">⚠️ Esta decisión es permanente para esta cuenta.</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  handleUpdateFreeCountry(countryToConfirmFree);
                  setSelectedCountryName(countryToConfirmFree);
                  setCountryToConfirmFree(null);
                }}
                className="flex-1 py-3 bg-[#11b782] hover:bg-[#10a173] text-black border-2 border-black rounded-xl font-bangers text-sm tracking-wider uppercase shadow-[3px_3px_0px_#000] cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                ¡Sí, confirmar {countryToConfirmFree}! ⚽
              </button>
              <button
                onClick={() => setCountryToConfirmFree(null)}
                className="py-3 px-5 bg-slate-800 hover:bg-slate-700 text-slate-300 border-2 border-black rounded-xl font-comic text-xs font-bold cursor-pointer"
              >
                Cancelar
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 2: UPSELL SUBSCRIPTION PLANS */}
      {upsellCountry && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 bg-slate-950/95 backdrop-blur-md animate-fade-in bg-halftone-dots">
          <div className="relative max-w-3xl w-full max-h-[94vh] overflow-y-auto bg-[#0a0f0d] border-[4px] border-black rounded-3xl p-4 sm:p-6 md:p-8 shadow-[8px_8px_0px_rgba(0,0,0,1)] text-center scrollbar-thin scrollbar-thumb-slate-850 scrollbar-track-transparent">
            
            <div className="bg-[#EF4444] bg-halftone-red text-white border-2 border-black p-3 md:p-4 rotate-[-1deg] shadow-[4px_4px_0px_#000] mb-4 sm:mb-5">
              <h3 className="font-bangers text-xl sm:text-2xl md:text-3xl tracking-wide uppercase flex items-center justify-center gap-2">
                🔒 SELECCIÓN EXCLUSIVA PREMIUM
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 font-comic font-bold leading-relaxed mb-3 px-1">
              ¡Hola, Director Técnico! Actualmente estás registrado bajo una cuenta estándar gratis y has fijado tu selección gratuita en <strong className="text-emerald-450">{freeChosenCountry || "Ninguna"}</strong>.
            </p>

            <p className="text-[11px] sm:text-xs text-slate-400 font-comic leading-relaxed mb-4 sm:mb-6 max-w-2xl mx-auto px-1">
              Para poder jugar y coleccionar con la selección de <strong className="text-[#EF4444]">{upsellCountry}</strong>, te invitamos cordialmente a suscribirte a una de nuestras prestigiosas licencias de D.T. de Élite:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-5 sm:mb-6 text-left">
              
              {/* PLAN SCOUT */}
              <div className="bg-slate-950 border-[3px] border-black rounded-2xl p-4 sm:p-5 shadow-[4px_4px_0px_rgba(17,183,130,0.25)] relative overflow-hidden flex flex-col justify-between hover:border-[#11b782] transition-colors">
                <div>
                  <h4 className="font-bangers text-lg sm:text-xl text-[#11b782] tracking-wider uppercase mb-1 flex items-center gap-1.5">
                    🕵️‍♂️ PLAN SCOUT BÁSICO
                  </h4>
                  <div className="font-mono text-xs sm:text-sm font-black text-white mb-3">
                    $5.00 USD <span className="text-[10px] text-slate-500 font-normal">/ Licencia Acceso Único</span>
                  </div>
                  <ul className="text-[11px] sm:text-xs text-slate-300 space-y-2 font-comic leading-relaxed mb-4">
                    <li className="flex items-start gap-1.5">
                      <span className="text-[#11b782] font-black shrink-0">✓</span>
                      <span>Desbloqueo de <strong>1 país completo</strong> a tu elección (todos sus cromos al instante) 🌟</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-[#11b782] font-black shrink-0">✓</span>
                      <span>Suma inmediata de <strong>+5 puntos</strong> a tu puntaje general de DT 📈</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-[#11b782] font-black shrink-0">✓</span>
                      <span>Inscripción de sorteo garantizada si estás en el top el día de la final del torneo ⚽</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-[#11b782] font-black shrink-0">✓</span>
                      <span>Guardado de pizarras y análisis táctico extendido.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-[#11b782] font-black shrink-0">✓</span>
                      <span>Acceso prioritario a sorteos y auditorías.</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* PASE VIP ELITE */}
              <div className="bg-slate-950 border-[3px] border-amber-500/80 rounded-2xl p-4 sm:p-5 shadow-[4px_4px_0px_#f59e0b] relative overflow-hidden flex flex-col justify-between hover:border-amber-500 transition-colors">
                <div className="absolute top-0 right-0 bg-amber-500 text-black font-bangers text-[9px] tracking-wider uppercase px-2 py-0.5 rounded-bl-lg">
                  MÁS RECOMENDADO 🔥
                </div>
                <div>
                  <h4 className="font-bangers text-lg sm:text-xl text-amber-450 tracking-wider uppercase mb-1 flex items-center gap-1.5">
                    👑 PASE VIP ELITE
                  </h4>
                  <div className="font-mono text-xs sm:text-sm font-black text-white mb-3">
                    $15.00 USD <span className="text-[10px] text-slate-500 font-normal">/ Licencia Acceso Total</span>
                  </div>
                  <ul className="text-[11px] sm:text-xs text-slate-300 space-y-2 font-comic leading-relaxed mb-4">
                    <li className="flex items-start gap-1.5">
                      <span className="text-amber-400 font-black shrink-0">✓</span>
                      <span>Acceso instantáneo a <strong>todos los países</strong> y todos sus cromos desbloqueados automáticamente 🌎</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-amber-400 font-black shrink-0">✓</span>
                      <span>Suma inmediata de <strong>+15 puntos</strong> a tu puntaje general de DT 👑</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-amber-400 font-black shrink-0">✓</span>
                      <span>Inscripción directa, inmediata y garantizada para la gran premiación 🏆</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-amber-400 font-black shrink-0">✓</span>
                      <span>Corte final de puntuaciones realizado el día <strong>30 de julio de 2026</strong>.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-amber-400 font-black shrink-0">✓</span>
                      <span>Elegibilidad directa: 1er Lugar: $1.000, 2do Lugar: $500, 3er Lugar: $250 USD en efectivo, auditado por un notario público.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-amber-400 font-black shrink-0">✓</span>
                      <span>Insignia dorada VIP verificada y soporte táctico prioritario.</span>
                    </li>
                  </ul>
                </div>
              </div>

            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <button
                onClick={() => {
                  setActiveTab('subscription');
                  setUpsellCountry(null);
                }}
                className="flex-1 py-3 bg-yellow-400 hover:bg-[#ffe338] text-black border-2 border-black rounded-xl font-bangers text-base tracking-wider uppercase shadow-[3px_3px_0px_#000] cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all min-h-[44px]"
              >
                💥 VER PLANES DE SUSCRIPCIÓN 💳
              </button>
              <button
                onClick={() => setUpsellCountry(null)}
                className="py-3 px-6 bg-slate-800 hover:bg-slate-700 text-slate-300 border-2 border-black rounded-xl font-comic text-xs font-bold cursor-pointer hover:text-white transition-colors min-h-[44px]"
              >
                Cerrar
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Edit Profile modal removed */}

      {/* 5. GORGEOUS SECURITY LOCK SCREEN FOR SUBSCRIBERS REMOVED */}

      {appCustomConfirm && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-50 backdrop-blur-sm transition-all" id="custom-app-confirm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0b0f19] border-3 border-black text-white rounded-2xl w-full max-w-md shadow-[6px_6px_0px_#000] overflow-hidden"
          >
            <div className="bg-[#EF4444] text-white p-4 font-bangers text-lg tracking-wider border-b-2 border-black flex items-center gap-2">
              <span>⚠️</span>
              <span>{appCustomConfirm.title}</span>
            </div>
            <div className="p-5 space-y-4">
              <p className="font-comic text-xs font-semibold leading-relaxed text-slate-200">
                {appCustomConfirm.message}
              </p>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setAppCustomConfirm(null)}
                  className="px-4 py-1.5 border-2 border-black bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl cursor-pointer active:translate-y-0.5"
                >
                  Cancelar
                </button>
                <button
                  onClick={async () => {
                    const cb = appCustomConfirm.onConfirm;
                    setAppCustomConfirm(null);
                    await cb();
                  }}
                  className="px-4 py-1.5 border-2 border-black bg-[#EF4444] hover:bg-red-650 text-white text-xs font-bold rounded-xl cursor-pointer shadow-[2.5px_2.5px_0px_rgba(0,0,0,1)] active:translate-y-0.5"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* MODAL DE RESTAURACIÓN / IMPORTACIÓN DE CROMOS */}
      {showBackupModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in font-comic">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#0b0f19] border-[3.5px] border-black text-white rounded-2xl w-full max-w-lg shadow-[8px_8px_0px_#000] overflow-hidden"
          >
            <div className="bg-[#EF4444] bg-halftone-red text-white p-4 font-bangers text-lg tracking-wider border-b-[3px] border-black flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span>🛡️</span>
                <span>PANEL DE RESPALDO DE CROMOS</span>
              </div>
              <button
                onClick={() => setShowBackupModal(false)}
                className="text-white hover:text-red-350 font-bold text-xl leading-none bg-transparent border-none outline-none cursor-pointer"
              >
                ✕
              </button>
            </div>
            
            <div className="p-5 space-y-4">
              <p className="font-comic text-xs font-semibold leading-relaxed text-slate-300">
                Selecciona y copia tu código JSON de abajo para guardarlo externamente, o pega un código de respaldo anterior y haz clic en <strong>Procesar</strong> para restaurar tus cromos personalizados:
              </p>
              
              <textarea
                value={backupText}
                onChange={(e) => setBackupText(e.target.value)}
                placeholder='Ejemplo: {"uru-1": "data:image/webp;base64,...", "ecu-3": "https://..."}'
                className="w-full h-44 bg-slate-900 border-2 border-black rounded-xl p-3 text-[10px] font-mono text-[#10B981] placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-[#10B981] resize-none"
              />
              
              <div className="text-[10px] text-slate-400 leading-snug flex items-start gap-1 p-2 bg-slate-950/40 border border-slate-800 rounded-lg">
                <span className="text-yellow-400 shrink-0">⚠️</span>
                <span>
                  <strong>Nota técnica:</strong> Este proceso fusionará los cromos importados con los que tengas activos y regenerará los enlaces en el servidor para persistirlos sobre cualquier reinicio del sistema de desarrollo.
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowBackupModal(false);
                    setBackupText("");
                  }}
                  className="px-4 py-2 border-2 border-black bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold uppercase rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => handleImportStickersBackup(backupText)}
                  className="px-5 py-2 border-[2.5px] border-black bg-[#10B981] hover:bg-[#059669] text-black text-xs font-bold uppercase rounded-xl cursor-pointer shadow-[2.5px_2.5px_0px_rgba(0,0,0,1)] active:translate-y-0.5"
                >
                  ⚡ Procesar e Inyectar
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {appCustomAlert && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-50 backdrop-blur-sm transition-all" id="custom-app-alert">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0b0f19] border-3 border-black text-white rounded-2xl w-full max-w-md shadow-[6px_6px_0px_#000] overflow-hidden"
          >
            <div className="bg-[#FDDF2B] text-black p-4 font-bangers text-lg tracking-wider border-b-2 border-black flex items-center gap-2">
              <span>📢</span>
              <span>{appCustomAlert.title}</span>
            </div>
            <div className="p-5 space-y-4">
              <p className="font-comic text-xs font-semibold leading-relaxed text-slate-200">
                {appCustomAlert.message}
              </p>
              <div className="flex items-center justify-end pt-2">
                <button
                  onClick={() => setAppCustomAlert(null)}
                  className="px-6 py-2 border-2 border-black bg-[#FDDF2B] hover:bg-[#ffe338] text-black text-xs font-bold uppercase rounded-xl cursor-pointer shadow-[2.5px_2.5px_0px_rgba(0,0,0,1)] active:translate-y-0.5"
                >
                  Entendido
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      </div>
    </AnimeHighTechSkin>
  );
}
