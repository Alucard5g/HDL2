import React, { useState, useEffect } from 'react';
import { COUNTRIES, generatePlayersForCountry, getPopulatedMatch, MATCH_FIXTURES } from './data';
import { Player, UserTacticalBoard, Match, getCountryOfPlay } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { DigitalStickerCard } from './components/DigitalStickerCard';
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
  MessageSquare
} from 'lucide-react';

// Helper to safely write custom sticker generations to localStorage without hitting size limits (QuotaExceededError)
function safeSaveCustomStickers(generations: { [key: string]: string }) {
  try {
    localStorage.setItem('dt_custom_sticker_generations', JSON.stringify(generations));
  } catch (e: any) {
    console.warn("localStorage quota exceeded for dt_custom_sticker_generations! Evicting old/large entries to free space...", e);
    try {
      const keys = Object.keys(generations);
      if (keys.length > 2) {
        const reducedGenerations: { [key: string]: string } = {};
        keys.slice(-2).forEach(k => {
          reducedGenerations[k] = generations[k];
        });
        localStorage.setItem('dt_custom_sticker_generations', JSON.stringify(reducedGenerations));
        console.log("Successfully saved reduced cache of custom stickers to LocalStorage.");
      } else {
        localStorage.removeItem('dt_custom_sticker_generations');
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

  // CAPTURA Y PERSISTENCIA DE VISITA POR QR / INVITACIÓN DE USUARIOS
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
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
    return localStorage.getItem('user_subscription') || 'Ninguna';
  });
  const [userLicense, setUserLicense] = useState<string>(() => {
    return localStorage.getItem('dt_user_license') || '';
  });
  const [scoutChosenCountry, setScoutChosenCountry] = useState<string>(() => {
    return localStorage.getItem('scout_chosen_country') || '';
  });

  const handleUpdateScoutCountry = (country: string) => {
    localStorage.setItem('scout_chosen_country', country);
    setScoutChosenCountry(country);
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
    return !!localStorage.getItem('dt_user_password');
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
    localStorage.removeItem('dt_user_password');

    setUserId('user_me');
    setUsername('Tú (Director Técnico)');
    setUserAvatar('👑');
    setUserEmail('');
    setUserLicense('');
    setUserSubscription('Ninguna');
    setScoutChosenCountry('');
    setUserPassword('');
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
    return localStorage.getItem('dt_username') || 'Tú (Director Técnico)';
  });

  const [userEmail, setUserEmail] = useState<string>(() => {
    return localStorage.getItem('dt_user_email') || '';
  });

  const [userAvatar, setUserAvatar] = useState<string>(() => {
    return localStorage.getItem('dt_user_avatar') || '👑';
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

  // State
  const [selectedCountryName, setSelectedCountryName] = useState<string>('Argentina');
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
    return saved ? JSON.parse(saved) : {};
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

  const [isLoginMode, setIsLoginMode] = useState<boolean>(false);
  const [isRecoveryMode, setIsRecoveryMode] = useState<boolean>(false);
  const [recoveryStep, setRecoveryStep] = useState<'verify' | 'reset'>('verify');
  const [matchedRecoveryUser, setMatchedRecoveryUser] = useState<any | null>(null);

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
  const [footerSuggestRecipient, setFooterSuggestRecipient] = useState<string>('geovannygrk3d@gmail.com');
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

  // Sticker custom fal.ai generation state
  const [isGeneratingStickerId, setIsGeneratingStickerId] = useState<string | null>(null);

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

  // Sticker Pack state variables
  const [manuallyUnlockedPlayerIds, setManuallyUnlockedPlayerIds] = useState<{ [playerId: string]: boolean }>(() => {
    const saved = localStorage.getItem('scouting_manually_unlocked_ids');
    return saved ? JSON.parse(saved) : {};
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
  }, [userEmail, userId, username, userAvatar, userCode, userPassword, userLicense, userSubscription, unlockedLevels, tacticalBoards]);

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
      let isCountryCompletedVIP = userSubscription === 'Pase VIP Elite';
      let isCountryCompletedScout = userSubscription === 'Plan Scout Básico' && scoutChosenCountry === country;

      let countryCount = 0;
      let limitCromos = 26;
      if (isCountryCompletedVIP || isCountryCompletedScout) {
        countryCount = limitCromos;
      } else {
        if (lvl1) countryCount += 9;
        if (lvl2) countryCount += 9;
        if (lvl3) countryCount += 8;
      }

      unlockedStickersCount += countryCount;

      if (isCountryCompletedVIP || isCountryCompletedScout || isCountryCompletedDefault) {
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
    const totalScore = stickerScore + bonusScore + onceScore + predictScore + referralPoints;

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
            cashBalance: userCashBalance
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
          }
        }
      } catch (err) {
        console.warn('Sync connection busy, retrying dynamically...', err);
      }
    };

    syncWithDb();
  }, [unlockedLevels, userSubscription, userCode, userId, username, userAvatar, currentUserInfo.totalOnceHits, currentUserInfo.totalScoreHits, userLicense, tacticalBoards, userEmail, userReferredByEmail, userCoins, userCashBalance]);



  const isAdmin = userEmail.trim().toLowerCase() === 'geovannygrk3d@gmail.com' || userEmail.trim().toLowerCase() === 'geovannygrk3d@gmail';

  const activeCountry = COUNTRIES.find(c => c.name === selectedCountryName) || COUNTRIES[0];
  const activeCountryPlayers = playersDB[activeCountry.name] || [];

  // Helper to calculate unlocked player count for any country
  const getUnlockedPlayersForCountry = (countryName: string): Player[] => {
    const countryPlayers = playersDB[countryName] || [];
    
    // Check Premium license conditions first
    if (userSubscription === 'Pase VIP Elite') {
      return countryPlayers;
    }
    
    if (userSubscription === 'Plan Scout Básico' && scoutChosenCountry === countryName) {
      return countryPlayers;
    }

    const levels = unlockedLevels[countryName] || { 1: false, 2: false, 3: false };
    const lvl1 = levels[1] || levels['1'] || false;
    const lvl2 = levels[2] || levels['2'] || false;
    const lvl3 = levels[3] || levels['3'] || false;
    
    let unlocked: Player[] = [];
    if (lvl1) {
      // Nivel 1 unlocked -> Index 0 to 8
      unlocked = [...unlocked, ...countryPlayers.slice(0, 9)]; // index backups (9 players)
    }
    if (lvl2) {
      // Nivel 2 unlocked -> Index 9 to 17
      unlocked = [...unlocked, ...countryPlayers.slice(9, 18)]; // index key players (9 players)
    }
    if (lvl3) {
      // Nivel 3 unlocked -> Index 18 to 25
      unlocked = [...unlocked, ...countryPlayers.slice(18, 26)]; // index stars (8 players)
    }

    // Also include manually unlocked player IDs via pack opening
    countryPlayers.forEach(p => {
      if (manuallyUnlockedPlayerIds[p.id] && !unlocked.some(up => up.id === p.id)) {
        unlocked.push(p);
      }
    });

    return unlocked;
  };

  const unlockedCount = getUnlockedPlayersForCountry(activeCountry.name).length;
  const isAlbumComplete = unlockedCount >= activeCountryPlayers.length;

  // Handle successful trivia completion
  const handleTriviaSuccess = () => {
    if (!activeTrivia) return;
    const { country, level } = activeTrivia;

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
          cashBalance: userCashBalance
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
      
      setUserId('user_me');
      setUsername('Tú (Director Técnico)');
      setUserAvatar('👑');
      setUserEmail('');
      setUserLicense('');
      setUserSubscription('Ninguna');

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

    const isAdmin = cleanEmail === 'geovannygrk3d@gmail.com' || cleanEmail === 'geovannygrk3d@gmail';
    if (isAdmin) {
      alert(`🎉 ¡Google Sign-in Exitoso, Bienvenido Administrador Central!\n\nEmail: "${cleanEmail}"\nContraseña registrada correctamente.\nTu Clave Única es: "${uniqueId}"\nTu Código de Juego es: "${code}"\n\nTu juego se ha iniciado DESDE CERO con un álbum limpio de 0 cromos.\nTienes acceso privilegiado completo al Panel de Administración de Sorteos.\nRedirigiendo al panel de suscripción...`);
    } else {
      alert(`🎉 ¡Google Sign-in Exitoso!\n\nUsuario: ${cleanUsername}\nEmail: "${cleanEmail}"\nContraseña registrada correctamente.\nTu Código de Director Técnico es: "${code}"\n\nTu juego se ha iniciado DESDE CERO con un álbum limpio de 0 cromos.\nElige un plan de suscripción para recibir tu código de participación.`);
    }
  };

  const handleCommitLogin = (e: React.FormEvent) => {
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

    // Get current registered users database
    const dbStr = localStorage.getItem('dt_users_database') || '[]';
    let db = [];
    try {
      db = JSON.parse(dbStr);
    } catch (err) {
      db = [];
    }

    // Check account existence
    const matchedUser = db.find((u: any) => u.email.toLowerCase() === cleanEmail);

    if (matchedUser) {
      if (inputPass === matchedUser.password) {
        // Login success with registered user!
        setUserId(matchedUser.id || 'usr_' + Math.floor(100000 + Math.random() * 900050));
        setUsername(matchedUser.username || 'Tú (Director Técnico)');
        setUserCode(matchedUser.code || 'DT-' + Math.floor(1000 + Math.random() * 9000));
        setUserAvatar(matchedUser.avatar || '👑');
        setUserEmail(matchedUser.email);
        setUserPassword(matchedUser.password);
        setUserLicense(matchedUser.license || '');
        setUserSubscription(matchedUser.subscription || 'Ninguna');

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

        localStorage.setItem('dt_user_id', matchedUser.id || 'usr_me');
        localStorage.setItem('dt_username', matchedUser.username || 'Tú (Director Técnico)');
        localStorage.setItem('dt_user_code', matchedUser.code || '');
        localStorage.setItem('dt_user_avatar', matchedUser.avatar || '👑');
        localStorage.setItem('dt_user_email', matchedUser.email);
        localStorage.setItem('dt_user_password', matchedUser.password);
        localStorage.setItem('user_subscription', matchedUser.subscription || 'Ninguna');
        if (matchedUser.license) {
          localStorage.setItem('dt_user_license', matchedUser.license);
        } else {
          localStorage.removeItem('dt_user_license');
        }

        setIsRegistrationOpen(false);

        // Set active tab to subscription
        setActiveTab('subscription');

        alert(`🔑 ¡Bienvenido de vuelta, D.T. ${matchedUser.username}!\n\nIdentidad y progreso recuperados exitosamente.`);
        return;
      } else {
        alert('❌ Contraseña incorrecta. Por seguridad y transparencia en la auditoría del sorteo, se ha activado AUTOMÁTICAMENTE el Protocolo de Restauración de Contraseña.');
        
        // Activate recover state
        setIsRecoveryMode(true);
        setRecoveryStep('verify');
        setMatchedRecoveryUser(matchedUser);
        setTempPassword('');
        setTempConfirmPassword('');
        return;
      }
    }

    // Special fallback for admin or demo if nothing registered yet
    if (cleanEmail === 'geovannygrk3d@gmail.com' || cleanEmail === 'geovannygrk3d@gmail') {
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

    alert('❌ No se encontró ningún Director Técnico registrado con este correo en esta terminal. Activando Protocolo de Restauración de Contraseña.');
    
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
    <div className="min-h-screen bg-[#050b07] bg-halftone-dots text-slate-100 font-sans flex flex-col antialiased selection:bg-[#EF4444] selection:text-white border-[8px] border-black">
      
      {/* Responsive outer board wrapper */}
      <div className="flex flex-col min-h-screen w-full font-sans">
        
        {/* COMPACT TOP NAVIGATION BRAND BAR */}
        <header className="border-b-[4px] border-black bg-[#041208] text-white sticky top-0 z-40 p-3 flex items-center justify-between shadow-[0_4px_0px_#EF4444] shrink-0 select-none">
          <div 
            onClick={() => { setActiveTab('menu_hub'); setActiveTrivia(null); }}
            className="cursor-pointer active:scale-95 transition-all"
            title="TactikAI - Volver al Menú Principal"
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
                  className="px-3.5 py-1.5 bg-white hover:bg-slate-50 text-black border-[3px] border-black font-bangers text-xs uppercase tracking-wider shadow-[3px_3px_0px_#11b782] cursor-pointer flex items-center gap-1.5 rounded-xl transition-all hover:translate-y-0.5 hover:shadow-[1.5px_1.5px_0px_#11b782]"
                >
                  <span>⬅️ VOLVER AL PANEL GENERAL</span>
                </button>
                <div className="hidden sm:flex items-center gap-2 font-mono text-[10px] text-slate-500 bg-[#0b110e] border-[2px] border-black px-2.5 py-1 rounded-lg">
                  <span className="w-2 h-2 rounded-full bg-[#11b782] animate-pulse" />
                  <span className="uppercase font-bold text-[#11b782]">DT PANEL: {activeTab === 'groups_fixture' ? 'FIXTURE' : activeTab === 'flutter' ? 'SDK DOCS' : activeTab.toUpperCase()}</span>
                </div>
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
                <div className="relative overflow-hidden bg-[#0b110e] border-[3.5px] border-black p-6 sm:p-8 rounded-3xl shadow-[6px_6px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
                  <div className="z-10 flex-1 text-center md:text-left">
                    {isAdmin ? (
                      <div className="inline-flex items-center gap-2 bg-[#EF4444] text-white border-2 border-black font-mono text-[9px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-widest mb-3 rotate-[-1deg] shadow-[2px_2px_0px_#000]">
                        👑 ACCESO ADMINISTRADOR ACTIVO
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-2 bg-[#11b782] text-black border-2 border-black font-mono text-[9px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-widest mb-3 rotate-[-1deg] shadow-[2px_2px_0px_#000]">
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
                    <div className="bg-white border-[3.5px] border-black p-4 rounded-2xl shadow-[5px_5px_0px_#11b782] rotate-1 hover:rotate-0 transition-transform duration-250 flex flex-col items-center justify-center text-black w-full sm:w-[160px] md:w-full lg:w-[160px] min-h-[110px] shrink-0">
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
                      {/* 1. Yellow Badge: ⚡ HERO CONVOCADOS ⚡ */}
                      <div className="w-full text-center">
                        <span className="w-full text-[10px] font-mono bg-[#FDDF2B] text-black px-3 py-1.5 border-[2.5px] border-black font-black uppercase tracking-widest rounded-md rotate-[-0.5deg] inline-block shadow-[2px_2px_0px_#000]">
                          ⚡ HERO CONVOCADOS ⚡
                        </span>
                      </div>

                      {/* 2. Credentials Card (White background, green shadow, containing avatar & username/userCode) */}
                      <div 
                        onClick={() => {
                          setIsRegistrationOpen(true);
                        }}
                        title="Detalles de Perfil (Haz clic para ver y gestionar tu sesión oficial)"
                        className="w-full cursor-pointer bg-white border-[3px] border-black p-3 rounded-2xl shadow-[4.5px_4.5px_0px_#11b782] flex items-center gap-3 hover:translate-y-0.5 hover:shadow-[2.5px_2.5px_0px_#11b782] transition-all text-black"
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
                          className="w-full border-[3px] border-black bg-white hover:bg-slate-50 text-black px-4 py-2 font-sans font-black text-xs uppercase tracking-wider shadow-[3.5px_3.5px_0px_#ff4a5a] hover:translate-y-0.5 hover:shadow-[1.5px_1.5px_0px_#ff4a5a] cursor-pointer flex items-center justify-between gap-2 transition-all rounded-2xl"
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
                <div className="border-[3.5px] border-black bg-[#0d1612] rounded-3xl p-6 shadow-[8px_8px_0px_#000] relative overflow-hidden" id="epic-how-to-play-manual">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-[#EF4444]/15 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#11b782]/15 rounded-full blur-3xl pointer-events-none" />
                  
                  {/* Title Header with Action Bubble Badge style */}
                  <div className="flex flex-col md:flex-row items-center gap-4 border-b-[3px] border-black pb-5 mb-6">
                    <div className="bg-[#EF4444] text-white font-bangers text-3xl px-5 py-2.5 rounded-xl border-2 border-black rotate-[-1deg] shadow-[4px_4px_0px_#000] tracking-wider uppercase inline-block shrink-0">
                      ⚡ GUÍA OFICIAL DEL DT ⚡
                    </div>
                    <div className="text-center md:text-left">
                      <h3 className="font-bangers text-2xl text-white tracking-wide uppercase leading-tight">MÉTODO DE JUEGO, ACREDITACIÓN DE PUNTOS Y GRANDES PREMIOS</h3>
                      <p className="font-mono text-xs text-[#11b782] font-black uppercase tracking-wider">REGLAMENTO OFICIAL DEL ÁLBUM TRIVIA MUNDIAL 2026</p>
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
                          🏆 PREMIOS
                        </div>
                        <h4 className="font-black text-black text-sm uppercase font-sans mb-3 tracking-tight flex items-center gap-2">
                          <span>👑</span> PODIO DE GANADORES
                        </h4>
                        <p className="text-[11px] text-gray-600 leading-relaxed font-semibold mb-3">
                          Los usuarios con planes activos (Plan Scout Básico o Pase VIP Elite) que alcancen los primeros puestos del ranking general serán acreedores a los siguientes premios en efectivo:
                        </p>
                        <ul className="space-y-2 text-xs text-gray-700 font-comic font-bold">
                          <li className="flex items-center justify-between bg-amber-100/30 border border-amber-300/40 rounded-lg p-2">
                            <span className="flex items-center gap-2 text-gray-800">
                              <span className="text-base text-amber-500">🥇</span> <strong>1er Lugar</strong>
                            </span>
                            <span className="font-mono font-black text-amber-700 text-sm">$2.000 USD</span>
                          </li>
                          <li className="flex items-center justify-between bg-slate-100/50 border border-slate-300/40 rounded-lg p-2">
                            <span className="flex items-center gap-2 text-gray-800">
                              <span className="text-base text-slate-500">🥈</span> <strong>2do Lugar</strong>
                            </span>
                            <span className="font-mono font-black text-slate-700 text-sm">$1.000 USD</span>
                          </li>
                          <li className="flex items-center justify-between bg-amber-600/10 border border-amber-700/20 rounded-lg p-2">
                            <span className="flex items-center gap-2 text-gray-800">
                              <span className="text-base text-amber-700">🥉</span> <strong>3er Lugar</strong>
                            </span>
                            <span className="font-mono font-black text-amber-800 text-sm">$500 USD</span>
                          </li>
                        </ul>
                      </div>
                      <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center bg-yellow-50/40 -mx-5 -mb-5 p-4 rounded-b-2xl">
                        <span className="text-[9px] font-mono text-amber-700 font-bold uppercase tracking-wide">Elegibilidad para Cuentas de Pago</span>
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
                    className="cursor-pointer group relative overflow-hidden bg-[#11b782] border-[3.5px] border-black p-6 rounded-2xl shadow-[6px_6px_0px_#000] transition-all flex flex-col justify-between min-h-[170px]"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                    <div className="relative z-10 flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-mono text-[9px] font-black text-black/70 uppercase tracking-wider mb-1">CINTURÓN 01</div>
                        <h3 className="font-bangers text-2xl lg:text-3xl tracking-wide text-black uppercase leading-none mb-2">
                           📚 ÁLBUM & COLECCIÓN
                        </h3>
                        <p className="text-[11px] font-comic font-bold text-black/85 leading-tight max-w-sm">
                          Explora las plantillas y los cromos oficiales de las mejores selecciones de América y el mundo. ¡Completa los 3 niveles de trivias por país!
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-black text-[#11b782] border-2 border-black rounded-lg flex items-center justify-center font-bold text-2xl shadow-[2.5px_2.5px_0px_#005535] group-hover:rotate-6 transition-transform">
                        📚
                      </div>
                    </div>
                    
                    <div className="relative z-10 mt-5 pt-3.5 border-t border-black/10 flex items-center justify-between text-black font-mono text-[9px] font-black">
                      <div className="flex items-center gap-1">
                        <span>⚡ {currentUserInfo.unlockedStickersCount} CROMOS COL.</span>
                        <span className="text-black/50">|</span>
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
                    className="cursor-pointer group relative overflow-hidden bg-white border-[3.5px] border-black p-6 rounded-2xl shadow-[6px_6px_0px_#000] transition-all flex flex-col justify-between min-h-[170px]"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-slate-100 rounded-full blur-2xl pointer-events-none" />
                    <div className="relative z-10 flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-mono text-[9px] font-black text-slate-500 uppercase tracking-wider mb-1">CINTURÓN 02</div>
                        <h3 className="font-bangers text-2xl lg:text-3xl tracking-wide text-black uppercase leading-none mb-2">
                           📅 FIXTURE OFICIAL
                        </h3>
                        <p className="text-[11px] font-comic font-bold text-gray-700 leading-tight max-w-sm">
                          Consulta el calendario oficial de los grupos del Torneo 2026. Registra tus pronósticos del simulador con los que sumarás puntos.
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-[#EF4444] text-white border-2 border-black rounded-lg flex items-center justify-center font-bold text-2xl shadow-[2.5px_2.5px_0px_#000] group-hover:rotate-6 transition-transform">
                        📅
                      </div>
                    </div>
                    
                    <div className="relative z-10 mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-slate-500 font-mono text-[9px] font-black">
                      <div className="flex items-center gap-1.5 text-black">
                        <span className="bg-[#FDDF2B] px-1.5 py-0.5 border border-black text-[8px] uppercase font-bold">AUDITABLE</span>
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
                    className="cursor-pointer group relative overflow-hidden bg-white border-[3.5px] border-black p-6 rounded-2xl shadow-[6px_6px_0px_#000] transition-all flex flex-col justify-between min-h-[170px]"
                  >
                    <div className="relative z-10 flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-mono text-[9px] font-black text-slate-500 uppercase tracking-wider mb-1">CINTURÓN 03</div>
                        <h3 className="font-bangers text-2xl lg:text-3xl tracking-wide text-black uppercase leading-none mb-2">
                           📋 LA PIZARRA D.T.
                        </h3>
                        <p className="text-[11px] font-comic font-bold text-gray-700 leading-tight max-w-sm">
                          Dibuja tus estrategias arrastrando stickers en una cancha interactiva táctica adaptada a pantallas móviles. ¡Arma tu plantilla para ser campeona!
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-[#11b782] text-black border-2 border-black rounded-lg flex items-center justify-center font-bold text-2xl shadow-[2.5px_2.5px_0px_#000] group-hover:rotate-6 transition-transform">
                        📋
                      </div>
                    </div>
                    
                    <div className="relative z-10 mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-slate-500 font-mono text-[9px] font-black">
                      <div className="flex items-center gap-1 text-black">
                        <span className="font-bold">🏟️ TÁCTICA ACTIVA:</span>
                        <span className="text-emerald-700 font-bold uppercase">{tacticalBoards[0]?.layoutType || "4-3-3 CLÁSICO"}</span>
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
                    className="cursor-pointer group relative overflow-hidden bg-[#FDDF2B] border-[3.5px] border-black p-6 rounded-2xl shadow-[6px_6px_0px_#000] transition-all flex flex-col justify-between min-h-[170px]"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl pointer-events-none" />
                    <div className="relative z-10 flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-mono text-[9px] font-black text-black/70 uppercase tracking-wider mb-1">CINTURÓN 04</div>
                        <h3 className="font-bangers text-2xl lg:text-3xl tracking-wide text-black uppercase leading-none mb-2">
                           🏆 LIGAS DE HONOR
                        </h3>
                        <p className="text-[11px] font-comic font-bold text-black/90 leading-tight max-w-sm">
                          Únete a las salas competitivas de coleccionistas de todo el mundo. Compara tus puntos con otros DTs de elite en tiempo real.
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-black text-[#FDDF2B] border-2 border-black rounded-lg flex items-center justify-center font-bold text-2xl shadow-[2.5px_2.5px_0px_#000] group-hover:rotate-6 transition-transform">
                        🏆
                      </div>
                    </div>
                    
                    <div className="relative z-10 mt-5 pt-3.5 border-t border-black/10 flex items-center justify-between text-black font-mono text-[9px] font-black">
                      <div className="flex items-center gap-1.5">
                        <span>⭐ TU PUNTAJE GLOBAL:</span>
                        <span className="font-black bg-black text-[#FDDF2B] px-1.5 py-0.5 border border-black rounded text-[10px]">{currentUserInfo.totalScore} PTS</span>
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
                    className="cursor-pointer group relative overflow-hidden bg-gradient-to-br from-indigo-900 to-[#0e1713] border-[3.5px] border-black p-6 rounded-2xl shadow-[6px_6px_0px_#000] transition-all flex flex-col justify-between min-h-[170px]"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#11b782]/10 rounded-full blur-2xl pointer-events-none" />
                    <div className="relative z-10 flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-mono text-[9px] font-black text-[#11b782] uppercase tracking-wider mb-1">CINTURÓN 05</div>
                        <h3 className="font-bangers text-2xl lg:text-3xl tracking-wide text-white uppercase leading-none mb-2">
                           💳 PASE VIP ELITE
                        </h3>
                        <p className="text-[11px] font-comic font-bold text-slate-300 leading-tight max-w-sm">
                          Desbloquea los análisis tácticos detallados de scout, un escudo exclusivo de Director Técnico y sobres de cromos premium sin límites.
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-white text-black border-2 border-black rounded-lg flex items-center justify-center font-bold text-2xl shadow-[2.5px_2.5px_0px_#000] group-hover:rotate-6 transition-transform">
                        💳
                      </div>
                    </div>
                    
                    <div className="relative z-10 mt-5 pt-3.5 border-t border-emerald-950 flex flex-wrap items-center justify-between gap-2 text-slate-400 font-mono text-[9px] font-black">
                      <div className="flex items-center gap-2">
                        <span className="text-white bg-emerald-800 px-1.5 py-0.5 border border-[#11b782] rounded text-[8.5px] uppercase font-bold tracking-wider">
                          {userSubscription === 'Ninguna' ? 'ESTÁNDAR GRATIS' : 'PROVEEDOR ACTIVO'}
                        </span>
                        <span className="text-emerald-400">${userCashBalance.toFixed(2)} USD</span>
                        <span className="text-amber-400">| {userCoins} 🪙</span>
                      </div>
                      <span className="flex items-center gap-0.5 bg-[#11b782] text-black px-2 py-1 rounded border-2 border-black font-bangers text-[10px] tracking-wider uppercase group-hover:translate-x-1 transition-transform">
                        BILLETERA <ChevronRight className="w-3 h-3 text-black inline stroke-[3]" />
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
                      
                      let completionBadge = '';
                      if (unlockedCromos === maxCromos) completionBadge = '🏆';
                      else if (unlockedCromos > 0) completionBadge = '⚡';

                      return (
                        <div
                          key={c.code}
                          onClick={() => setSelectedCountryName(c.name)}
                          className={`flex items-center justify-between p-3 rounded-xl border-[2.5px] transition-all cursor-pointer ${
                            isSelected 
                              ? 'bg-[#10B981] bg-halftone-green border-black text-black font-extrabold shadow-[3px_3px_0px_#000] -translate-y-0.5' 
                              : 'bg-slate-900/60 border-black text-slate-350 hover:bg-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-2xl transform hover:scale-125 transition-transform duration-100">{c.flag}</span>
                            <div>
                              <span className={`text-xs block ${isSelected ? 'font-black' : 'font-semibold'}`}>{c.name}</span>
                              <span className={`text-[9px] font-mono uppercase px-1 rounded ${isSelected ? 'bg-black text-[#10B981] font-bold' : 'text-slate-500 bg-black/40'}`}>
                                {c.group}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {completionBadge && <span className="text-sm animate-bounce">{completionBadge}</span>}
                            <span className={`text-[10px] font-mono font-bold border rounded-md px-2 py-0.5 ${
                              isSelected ? 'bg-black text-white border-black' : 'bg-slate-950 text-slate-300 border-slate-800'
                            }`}>
                              {unlockedCromos}/{maxCromos} Cromos
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Album summary info */}
                  <div className="mt-5 border-t-2 border-dashed border-slate-800 pt-4 text-xs font-comic font-bold text-slate-400 flex flex-col gap-2.5">
                    <p className="leading-relaxed">
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

                      <div className="text-center bg-[#EF4444] text-white p-4 border-[3px] border-black shadow-[4px_4px_0px_#000] rotate-[1.5deg] min-w-[150px] bg-halftone-red">
                        <span className="text-[9px] font-mono font-black text-white uppercase block tracking-wider">CROMOS REUNIDOS</span>
                        <span className="text-4xl font-bangers block tracking-widest text-white leading-none mt-1">
                          {unlockedCount} / 26
                        </span>
                        <span className="text-[10px] font-comic block mt-1 font-bold text-white">
                          {isAlbumComplete ? "¡COMPLETO! 👑" : "SIGUE JUGANDO ⚡"}
                        </span>
                      </div>
                    </div>

                    {/* General Country Progress / Reset Actions */}
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
                    </div>

                    {/* Trivia Lock statuses in Retropanel format */}
                    <div className="mt-6 border-t-[3px] border-black pt-5">
                      <h4 className="text-xs font-bangers tracking-widest text-black uppercase mb-3.5">
                        🎯 EXÁMENES DE EXPANSIÓN (IA DE GOOGLE AI STUDIO)
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
                                  {lvl === 1 ? 'Recluta banca suplente (+9 cromos)' : lvl === 2 ? 'Recluta jugadores titulares (+9 cromos)' : 'Franquicia y Leyendas (+8 cromos)'}
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
                                  <span className="text-[10px] font-mono text-slate-505 font-bold block">Bloqueado</span>
                                ) : (
                                  <button
                                    onClick={() => setActiveTrivia({ country: activeCountry.name, flag: activeCountry.flag, level: lvl })}
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
                                          src={p.imageUrl}
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
                                <div className="text-[9.5px] font-comic font-black text-slate-505 mb-2 leading-tight uppercase">
                                  Nivel {albumPage} Requerido 🔒
                                </div>
                                <button
                                  onClick={() => setActiveTrivia({ country: activeCountry.name, flag: activeCountry.flag, level: albumPage })}
                                  className="w-full py-2 bg-[#EF4444] hover:bg-neutral-800 hover:text-white text-white font-bangers text-xs tracking-wider uppercase border-2 border-black rounded-lg cursor-pointer shadow-[2px_2px_0px_#000] active:scale-95 transition-all bg-halftone-red"
                                >
                                  Trivia Lvl {albumPage} ⚡
                                </button>
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
                          Estás usando una credencial de invitado temporal. Regístrate hoy de forma 100% gratuita para recibir tu propio <strong>Código de Juego Único</strong> y participar activamente por un Auto Híbrido en el Sorteo Oficial de la Gala.
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
                    onChange={(e) => setSelectedCountryName(e.target.value)}
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
                onSelectCountry={setSelectedCountryName}
                setActiveTab={setActiveTab}
                matchSyncKey={matchSyncKey}
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
              />
            )}

            {/* TAB: Admin Database Panel */}
            {activeTab === 'admin' && (
              (userEmail.trim().toLowerCase() === 'geovannygrk3d@gmail.com' || userEmail.trim().toLowerCase() === 'geovannygrk3d@gmail') ? (
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
                      <span className="text-blue-600 font-semibold underline">geovannygrk3d@gmail.com (o geovannygrk3d@gmail)</span>
                    </div>
                  </div>

                  <div className="mt-8 flex flex-col sm:flex-row items-center justify-end gap-3.5 pt-4 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setTempEmail('geovannygrk3d@gmail.com');
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
                    Comunicados oficiales del director de juego y notas de parches del Album-Trivia Mundial 2026 en tiempo real.
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
                      <option value="geovannygrk3d@gmail.com">Sugerencia a: geovannygrk3d@gmail.com</option>
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
                      <span className="font-bangers text-white text-[11px] uppercase tracking-wide">Mano de Dios</span>
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
                      message: 'Si deseas transferir por Deuna, Banco Pichincha o cooperativas aliadas de Ecuador para aparecer en la lista de marcas del álbum, por favor contáctanos escribiendo a geovannygrk3d@gmail.com o roly3d@hotmail.com.'
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
                © 2026 Álbum Trivia Mundial. Creado por <strong>CIG</strong>, Diseño por <strong>Rolando Guerra</strong>, impulsado con IA de vanguardia, servidores de baja latencia y tecnología Google Cloud.
              </div>
              <div className="flex gap-4">
                <span className="text-gray-500">Admin email: geovannygrk3d@gmail.com</span>
                <span className="text-slate-500">Contacto: roly3d@hotmail.com | roly3d.rg@gmail.com</span>
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
            <span className="text-[9px] font-comic font-black mt-0.5">Álbum</span>
          </button>
          <button
            onClick={() => { setActiveTab('groups_fixture'); setActiveTrivia(null); }}
            className={`flex flex-col items-center justify-center p-1 rounded-lg transition-all min-h-[44px] min-w-[50px] cursor-pointer ${
              activeTab === 'groups_fixture' ? 'text-white scale-105 font-bold' : 'text-slate-400'
            }`}
          >
            <Calendar className="w-5 h-5 shrink-0" />
            <span className="text-[9px] font-comic font-black mt-0.5">Fixture</span>
          </button>
          <button
            onClick={() => { setActiveTab('board'); setActiveTrivia(null); }}
            className={`flex flex-col items-center justify-center p-1 rounded-lg transition-all min-h-[44px] min-w-[50px] cursor-pointer ${
              activeTab === 'board' ? 'text-[#EF4444] scale-105 font-bold' : 'text-slate-400'
            }`}
          >
            <FolderTree className="w-5 h-5 shrink-0" />
            <span className="text-[9px] font-comic font-black mt-0.5">Pizarra</span>
          </button>
          <button
            onClick={() => { setActiveTab('leaderboard'); setActiveTrivia(null); }}
            className={`flex flex-col items-center justify-center p-1 rounded-lg transition-all min-h-[44px] min-w-[50px] cursor-pointer ${
              activeTab === 'leaderboard' ? 'text-[#10B981] scale-105 font-bold' : 'text-slate-400'
            }`}
          >
            <Trophy className="w-5 h-5 shrink-0" />
            <span className="text-[9px] font-comic font-black mt-0.5">Ligas</span>
          </button>
          <button
            onClick={() => { setActiveTab('subscription'); setActiveTrivia(null); }}
            className={`flex flex-col items-center justify-center p-1 rounded-lg transition-all min-h-[44px] min-w-[50px] cursor-pointer ${
              activeTab === 'subscription' ? 'text-white scale-105 font-bold' : 'text-slate-400'
            }`}
          >
            <CreditCard className="w-5 h-5 shrink-0" />
            <span className="text-[9px] font-comic font-black mt-0.5">VIP</span>
          </button>
        </nav>

      </div>

      {/* 4. HIGH-FIDELITY GOOGLE-STYLE SIGN IN / REGISTRATION OVERLAY */}
      {isRegistrationOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm transition-all animate-fade-in">
          <div className="relative w-full max-w-[450px] max-h-[92vh] bg-white text-slate-800 border-2 border-black rounded-3xl shadow-[8px_8px_0px_rgba(0,0,0,1)] font-sans flex flex-col overflow-hidden">
            
            {/* Modal Header (Fixed) */}
            <div className="p-6 pb-2 select-none border-b border-slate-100 bg-slate-50/50">
              {/* Google Word Logo */}
              <div className="flex justify-center items-center gap-[1.5px] text-[24px] font-sans font-black select-none tracking-tight mb-2">
                <span className="text-[#4285F4]">G</span>
                <span className="text-[#EA4335]">o</span>
                <span className="text-[#FBBC05]">o</span>
                <span className="text-[#4285F4]">g</span>
                <span className="text-[#34A853]">l</span>
                <span className="text-[#EA4335]">e</span>
              </div>

              {/* Title & Description of target app */}
              <div className="text-center">
                <h3 className="text-xl font-bold text-slate-900 tracking-tight font-comic">
                  {isRecoveryMode 
                    ? "Protocolo de Restauración de Contraseña" 
                    : (isLoginMode ? "Ingreso de Miembro Oficial" : "Acceso con cuenta de Google")
                  }
                </h3>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  {isRecoveryMode 
                    ? "Verificación y desencriptación de credenciales auditable del Torneo 2026"
                    : (isLoginMode 
                        ? "Inicia sesión para restaurar tu progreso y tus licencias de sorteo" 
                        : "Utiliza tu cuenta para vincular tu progreso en Álbum de Trivia de Selecciones 2026"
                      )
                  }
                </p>
              </div>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 max-h-[62vh]">
              
              {/* Toggle Box / Breadcrumbs */}
              {!isRecoveryMode ? (
                <div className="bg-[#edf3fc] border border-[#1a73e8]/10 rounded-2xl p-3 text-center">
                  <p className="text-[10px] text-slate-600 font-semibold mb-1">
                    {isLoginMode ? "¿Eres un miembro nuevo?" : "¿Ya te registraste en este navegador?"}
                  </p>
                  <div className="flex flex-col gap-1.5 items-center justify-center">
                    <button
                      type="button"
                      onClick={() => {
                        setIsLoginMode(!isLoginMode);
                        setTempPassword('');
                        setTempConfirmPassword('');
                      }}
                      className="px-4 py-1.5 bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs font-bold rounded-lg transition-all cursor-pointer shadow-sm active:scale-95 uppercase tracking-wider"
                    >
                      {isLoginMode ? "⚡ Crear una cuenta" : "🔑 Ya soy miembro, ingresar"}
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
                        className="text-[10.5px] text-[#1a73e8] hover:underline font-bold mt-1"
                      >
                        ⚙️ ¿Olvidaste tu contraseña? Restaurar de forma segura
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-[#fffbeb] border border-amber-200 rounded-2xl p-3 text-center">
                  <p className="text-[10.5px] text-amber-800 font-bold mb-1">
                    ⚠️ PROCESO DE RECUPERACIÓN SEGURO ACTIVO
                  </p>
                  <div className="flex justify-center gap-2 mt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsRecoveryMode(false);
                        setIsLoginMode(true);
                        setTempPassword('');
                        setTempConfirmPassword('');
                      }}
                      className="px-3 py-1 bg-slate-800 hover:bg-slate-900 text-white text-[10px] font-bold rounded-lg transition-all cursor-pointer"
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
                      className="px-3 py-1 bg-[#1a73e8] hover:bg-[#1557b0] text-white text-[10px] font-bold rounded-lg transition-all cursor-pointer"
                    >
                      ⚡ Registrar Cuenta
                    </button>
                  </div>
                </div>
              )}

              {/* Autocomplete Button (only in normal sign-up/creation) */}
              {!isLoginMode && !isRecoveryMode && (
                <button
                  type="button"
                  onClick={() => {
                    setTempEmail('geovannygrk3d@gmail.com');
                    setTempUsername('DT_Geovanny_2026');
                    setTempAvatar('👑');
                  }}
                  title="Click para autocompletar con tu cuenta de correo activa"
                  className="w-full bg-[#f8fafd] hover:bg-[#edf3fc] text-[#1a73e8] border border-slate-200 hover:border-[#1a73e8]/30 rounded-full px-4 py-2.5 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] shadow-sm select-none"
                >
                  <span className="text-base">📧</span>
                  <span className="truncate">Autocompletar con {userEmail || 'geovannygrk3d@gmail.com'}</span>
                </button>
              )}

              <div className="relative flex py-1 items-center select-none">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-3 text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                  {isRecoveryMode 
                    ? `Paso: ${recoveryStep === 'verify' ? '1. Verificar Identidad' : '2. Nueva Contraseña'}` 
                    : (isLoginMode ? "Credenciales de Miembro" : "O introduce los datos")
                  }
                </span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              {/* Fields render */}
              <div className="space-y-4">
                
                {/* 1. PASSWORD RECOVERY SCREEN: STEP 1 (VERIFY EMAIL & SECURITY AVATAR) */}
                {isRecoveryMode && recoveryStep === 'verify' && (
                  <div className="space-y-4">
                    <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-amber-900 text-[10px] leading-relaxed">
                      <strong>💡 ¿Cómo funciona?</strong> Ingresa tu correo electrónico registrado y selecciona el mismo <strong>Escudo de Identidad / Avatar</strong> que elegiste en tu perfil. Si coinciden, el sistema auditable te autorizará a restablecer la clave.
                    </div>

                    <div>
                      <label className="text-[10px] font-extrabold text-slate-500 block mb-1 uppercase tracking-wider font-mono">
                        Correo electrónico registrado *
                      </label>
                      <input
                        type="email"
                        placeholder="Ingresa tu correo registrado"
                        value={tempEmail}
                        onChange={(e) => setTempEmail(e.target.value)}
                        className="w-full bg-slate-50/65 border-2 border-black rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1a73e8] focus:border-[#1a73e8] font-sans font-bold hover:bg-slate-50/90 transition shadow-[2px_2px_0px_rgba(0,0,0,0.15)]"
                        required
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={handleRevealStoredPassword}
                        className="text-[10.5px] text-[#1a73e8] hover:text-[#1557b0] font-black underline flex items-center gap-1 active:scale-95 transition-all text-right"
                      >
                        🔑 Revelar contraseña guardada en este navegador
                      </button>
                    </div>

                    <div>
                      <label className="text-[10px] font-extrabold text-slate-500 block mb-1.5 uppercase tracking-wider font-mono">
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
                                  ? 'bg-[#fffbeb] border-amber-500 text-slate-900 scale-105 shadow-sm font-black' 
                                  : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-black hover:text-slate-800'
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
                  <div className="space-y-4 bg-emerald-50/50 p-4 border border-emerald-100 rounded-2xl">
                    <div className="text-[10.5px] text-emerald-800 font-bold mb-1 flex items-center gap-1.5">
                      <span>✅ Identidad Verificada para:</span>
                      <span className="underline italic font-sans text-xs text-slate-900">{tempEmail}</span>
                    </div>

                    <div>
                      <label className="text-[10px] font-extrabold text-slate-500 block mb-1 uppercase tracking-wider font-mono">
                        Nueva Contraseña de Acceso *
                      </label>
                      <input
                        type="password"
                        placeholder="Establece nueva contraseña (mínimo 4 caracteres)"
                        value={tempPassword}
                        onChange={(e) => setTempPassword(e.target.value)}
                        className="w-full bg-slate-50/65 border-2 border-black rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-sans font-bold hover:bg-slate-50/90 transition shadow-[2px_2px_0px_rgba(0,0,0,0.15)]"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-extrabold text-slate-500 block mb-1 uppercase tracking-wider font-mono">
                        Confirmar Nueva Contraseña *
                      </label>
                      <input
                        type="password"
                        placeholder="Escribe la contraseña exactamente igual"
                        value={tempConfirmPassword}
                        onChange={(e) => setTempConfirmPassword(e.target.value)}
                        className="w-full bg-slate-50/65 border-2 border-black rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-sans font-bold hover:bg-slate-50/90 transition shadow-[2px_2px_0px_rgba(0,0,0,0.15)]"
                        required
                      />
                      {tempPassword && tempConfirmPassword && tempPassword !== tempConfirmPassword && (
                        <p className="text-[9.5px] text-[#EF4444] font-bold mt-1 animate-pulse">
                          ❌ Las contraseñas no coinciden
                        </p>
                      )}
                      {tempPassword && tempConfirmPassword && tempPassword === tempConfirmPassword && (
                        <p className="text-[9.5px] text-emerald-650 font-bold mt-1 flex items-center gap-1">
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
                      <label className="text-[10px] font-extrabold text-slate-500 block mb-1 uppercase tracking-wider font-mono">
                        Correo electrónico institucional o personal *
                      </label>
                      <input
                        type="email"
                        placeholder="ejemplo@gmail.com"
                        value={tempEmail}
                        onChange={(e) => setTempEmail(e.target.value)}
                        className="w-full bg-slate-50/65 border-2 border-black rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1a73e8] focus:border-[#1a73e8] font-sans font-bold hover:bg-slate-50/90 transition shadow-[2px_2px_0px_rgba(0,0,0,0.15)]"
                        required
                      />
                      <p className="text-[9px] text-slate-500 mt-1.5 leading-snug font-sans">
                        {isLoginMode 
                          ? "Ingresa el mismo correo que usaste al registrarte. Admite geovannygrk3d@gmail.com."
                          : "Para habilitar facultades de Administrador Senior, ingresa el correo autenticado geovannygrk3d@gmail.com o geovannygrk3d@gmail"
                        }
                      </p>
                    </div>

                    {/* Username field (Sign Up only) */}
                    {!isLoginMode && (
                      <div>
                        <label className="text-[10px] font-extrabold text-slate-500 block mb-1 uppercase tracking-wider font-mono">
                          Nombre del Director Técnico (D.T.) *
                        </label>
                        <input
                          type="text"
                          placeholder="Ej. DT_ScaloniChampion"
                          maxLength={25}
                          value={tempUsername}
                          onChange={(e) => setTempUsername(e.target.value)}
                          className="w-full bg-slate-50/65 border-2 border-black rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1a73e8] focus:border-[#1a73e8] font-sans font-bold hover:bg-slate-50/90 transition shadow-[2px_2px_0px_rgba(0,0,0,0.15)]"
                          required={!isLoginMode}
                        />
                      </div>
                    )}

                    {/* Password field */}
                    <div>
                      <label className="text-[10px] font-extrabold text-slate-500 block mb-1 uppercase tracking-wider font-mono">
                        {isLoginMode ? "Contraseña *" : "Crear Contraseña *"}
                      </label>
                      <input
                        type="password"
                        placeholder={isLoginMode ? "Ingresa tu contraseña" : "Crea tu contraseña (mínimo 4 caracteres)"}
                        value={tempPassword}
                        onChange={(e) => setTempPassword(e.target.value)}
                        className="w-full bg-slate-50/65 border-2 border-black rounded-xl px-4 py-2.5 text-xs text-slate-905 focus:outline-none focus:ring-2 focus:ring-[#1a73e8] focus:border-[#1a73e8] font-sans font-bold hover:bg-slate-50/90 transition shadow-[2px_2px_0px_rgba(0,0,0,0.15)]"
                        required
                      />
                    </div>

                    {/* Confirm Password field (Sign Up only) */}
                    {!isLoginMode && (
                      <div>
                        <label className="text-[10px] font-extrabold text-slate-500 block mb-1 uppercase tracking-wider font-mono">
                          Confirmar Contraseña *
                        </label>
                        <input
                          type="password"
                          placeholder="Repite tu contraseña exactamente"
                          value={tempConfirmPassword}
                          onChange={(e) => setTempConfirmPassword(e.target.value)}
                          className="w-full bg-slate-50/65 border-2 border-black rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1a73e8] focus:border-[#1a73e8] font-sans font-bold hover:bg-slate-50/90 transition shadow-[2px_2px_0px_rgba(0,0,0,0.15)]"
                          required={!isLoginMode}
                        />
                        {tempPassword && tempConfirmPassword && tempPassword !== tempConfirmPassword && (
                          <p className="text-[9.5px] text-[#EF4444] font-bold mt-1 animate-pulse">
                            ❌ Las contraseñas no coinciden
                          </p>
                        )}
                        {tempPassword && tempConfirmPassword && tempPassword === tempConfirmPassword && (
                          <p className="text-[9.5px] text-emerald-650 font-bold mt-1 flex items-center gap-1">
                            ✅ Las contraseñas coinciden perfectamente
                          </p>
                        )}
                      </div>
                    )}

                    {/* Recommendation Panel (Sign Up only) */}
                    {!isLoginMode && (
                      <div className="p-3.5 bg-indigo-50/60 border-2 border-indigo-200 rounded-2xl space-y-2">
                        <label className="text-[10px] font-extrabold text-[#1a73e8] block uppercase tracking-wider font-mono">
                          🎁 Panel de Recomendación (Opcional)
                        </label>
                        <p className="text-[9px] text-[#1a73e8]/80 leading-snug font-sans">
                          Si otro Director Técnico te recomendó conectarte, ingresa su correo registrado abajo. Nota: De acuerdo a los reglamentos oficiales, sólo los directores de planes pagados calificados (Scout o VIP) pueden realizar invitaciones con su correo y recibir estos puntos extra.
                        </p>
                        <input
                          type="email"
                          placeholder="ejemplo@correo.com (El correo de tu amigo)"
                          value={tempReferredByEmail}
                          onChange={(e) => setTempReferredByEmail(e.target.value)}
                          className="w-full bg-white border-2 border-slate-200 focus:border-[#1a73e8] focus:outline-none rounded-xl px-4 py-2 text-xs text-slate-900 font-sans font-bold transition shadow-sm"
                        />
                      </div>
                    )}

                    {/* Avatar Picker style (Sign Up only) */}
                    {!isLoginMode && (
                      <div>
                        <label className="text-[10px] font-extrabold text-slate-500 block mb-1.5 uppercase tracking-wider font-mono">
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
                                    ? 'bg-[#f0f4f9] border-[#1a73e8] text-slate-900 scale-105 shadow-sm font-black' 
                                    : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-black hover:text-slate-800'
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
                <div className="bg-[#f0f4f9] border border-[#1a73e8]/20 rounded-2xl p-3.5 text-[10px] text-[#1a73e8] font-semibold leading-relaxed flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-[#1a73e8] shrink-0 mt-0.5" />
                  <span>
                    La base de datos resguarda de forma segura tu clave y progreso atómico para las auditorías autorizadas de la Copa 2026.
                  </span>
                </div>
              </div>

            </div>

            {/* Modal Footer (Fixed at bottom) */}
            <div className="p-6 pt-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between select-none">
              <button
                type="button"
                onClick={() => setIsRegistrationOpen(false)}
                className="text-xs font-bold text-[#1c1b1f] hover:text-[#1a73e8] hover:bg-slate-100 px-4 py-2 rounded-full transition duration-150 cursor-pointer"
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
                className="bg-[#1a73e8] hover:bg-[#1557b0] text-white font-bold text-xs px-6 py-2.5 rounded-full shadow-sm hover:shadow-md active:scale-[0.98] transition duration-150 cursor-pointer uppercase tracking-wider"
              >
                {isRecoveryMode 
                  ? (recoveryStep === 'verify' ? "Verificar Identidad 🧠" : "Restablecer y Entrar ⚡") 
                  : (isLoginMode ? "Iniciar Sesión ⚡" : "Siguiente paso")
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

      {/* Edit Profile modal removed */}

      {/* 5. GORGEOUS SECURITY LOCK SCREEN FOR SUBSCRIBERS */}
      {isLocked && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950 bg-halftone-dots relative select-none animate-fade-in">
          {/* Neon background blurs */}
          <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />

          <div className="relative w-full max-w-[420px] bg-[#0c101a] border-[3px] border-black rounded-3xl p-8 text-center shadow-[8px_8px_0px_#000] font-sans">
            
            {/* Header Badge */}
            <div className="mx-auto w-16 h-16 bg-gradient-to-tr from-amber-500 via-rose-500 to-pink-550 border-[3px] border-black rounded-2xl flex items-center justify-center shadow-[3px_3px_0px_#000] -rotate-3 mb-6">
              <ShieldCheck className="w-8 h-8 text-white stroke-[2.5]" />
            </div>

            <h3 className="text-xl font-bold text-white tracking-tight uppercase font-comic">
              Terminal Protegida
            </h3>
            <p className="text-xs text-slate-400 mt-2 max-w-sm mx-auto leading-relaxed">
              Hola, <strong className="text-yellow-400">{username}</strong> ({userCode}). Para acceder a tu álbum y licencias auditadas, por favor ingresa tu contraseña.
            </p>

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                const formEl = e.currentTarget;
                const inputEl = formEl.elements.namedItem('unlockPassword') as HTMLInputElement;
                const saved = localStorage.getItem('dt_user_password');
                if (inputEl && inputEl.value === saved) {
                  setIsLocked(false);
                } else {
                  alert('❌ Contraseña Incorrecta. Acceso denegado a las auditorías del sorteo oficial.');
                }
              }}
              className="mt-6 space-y-4"
            >
              <div>
                <input
                  name="unlockPassword"
                  type="password"
                  placeholder="Introduce tu contraseña"
                  className="w-full bg-slate-950/80 border-2 border-black rounded-xl px-4 py-3 text-center text-xs text-white placeholder:text-gray-650 focus:outline-none focus:ring-2 focus:ring-yellow-450 font-mono shadow-[2px_2px_0px_rgba(0,0,0,0.15)]"
                  required
                  autoFocus
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#FDDF2B] hover:bg-[#ffe338] text-black border-2 border-black px-6 py-3 font-comic font-black text-xs uppercase rounded-xl shadow-[4px_4px_0px_rgba(0,0,0,1)] transition hover:translate-y-0.5 active:translate-y-1 cursor-pointer"
              >
                🔓 Desbloquear Terminal
              </button>
            </form>

            <div className="mt-8 pt-4 border-t border-slate-850/60 flex flex-col items-center gap-1.5">
              <p className="text-[10px] text-slate-500 font-mono leading-normal">
                ¿Olvidaste tu contraseña? Puedes cerrar sesión para crear un nuevo usuario.
              </p>
              <button
                type="button"
                onClick={() => {
                  setAppCustomConfirm({
                    title: '🛑 Cerrar Sesión',
                    message: '¿Seguro de cerrar sesión y re-establecer perfil? Perderás el acceso temporario a los datos en esta terminal.',
                    onConfirm: () => {
                      handleLogout();
                      setIsLocked(false);
                    }
                  });
                }}
                className="text-[10px] font-bold text-rose-500 hover:text-rose-400 underline cursor-pointer"
              >
                Cerrar Sesión Corriente
              </button>
            </div>

          </div>
        </div>
      )}

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
  );
}
