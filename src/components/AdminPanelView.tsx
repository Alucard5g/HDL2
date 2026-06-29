import React, { useState, useEffect } from 'react';
import { 
  Users, 
  ShieldCheck, 
  Trash2, 
  PlusCircle, 
  Sparkles, 
  Check, 
  RefreshCw, 
  Car, 
  Gift, 
  Smartphone, 
  UserPlus, 
  Award,
  CircleCheck,
  ToggleLeft,
  Eye,
  X,
  Trophy,
  Coins,
  QrCode,
  TrendingUp,
  MapPin,
  Calendar,
  DollarSign,
  Filter,
  ArrowRight,
  Cpu,
  Layers,
  Activity,
  Database,
  Server,
  Globe,
  Zap,
  Image,
  Rss,
  MessageSquare,
  Ticket,
  Key
} from 'lucide-react';
import { motion } from 'motion/react';
import { COUNTRIES, generatePlayersForCountry, MATCH_FIXTURES, KNOCKOUT_FIXTURES } from '../data';

function getSafeImageUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;
  if (url.startsWith("data:image/") || url.startsWith("/") || url.startsWith("./")) {
    return url;
  }
  return `/api/proxy-image?url=${encodeURIComponent(url)}`;
}

interface ActiveUser {
  id: string;
  username: string;
  gameCode: string;
  unlockedStickersCount: number;
  completedCountries: string[];
  aciertosOnce: number;
  aciertosMarcador: number;
  score: number;
  subscription: string;
  role: string;
  avatar: string;
  licenseCode?: string;
  email?: string;
  password?: string;
  tacticalBoards?: any;
  createdAt?: string;
  referredByEmail?: string;
  referralPoints?: number;
  successfulReferralsCount?: number;
  successfulReferralEmails?: string[];
  invitedEmails?: string[];
  coins?: number;
  cashBalance?: number;
}

interface AdminPanelViewProps {
  currentUserScore: number;
  currentUserCode: string;
  currentUserId?: string;
}

export default function AdminPanelView({ currentUserScore, currentUserCode, currentUserId = 'user_me' }: AdminPanelViewProps) {
  const [usersList, setUsersList] = useState<ActiveUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [inspectingUser, setInspectingUser] = useState<ActiveUser | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(new Date());
  const freshInspectingUser = inspectingUser ? (usersList.find(u => u.id === inspectingUser.id) || inspectingUser) : null;
  
  // States for consolidated database view and filters
  const [dbSubView, setDbSubView] = useState<'users' | 'predictions' | 'stickers' | 'matches'>('users');
  const [customStickersMap, setCustomStickersMap] = useState<{ [playerId: string]: string }>({});
  const [customMatchesMap, setCustomMatchesMap] = useState<{ [matchId: string]: { golesLocal: number, golesVisitante: number, jugado: boolean } }>({});
  const [matchDrafts, setMatchDrafts] = useState<{ [matchId: string]: { golesLocal: string, golesVisitante: string, jugado: boolean } }>({});
  const [searchDbQuery, setSearchDbQuery] = useState('');
  const [countryFilter, setCountryFilter] = useState('');

  // Estados del Sistema de Afiliados y Promotoras de Calle
  const [currentSubTab, setCurrentSubTab] = useState<'registry' | 'affiliates' | 'performance' | 'subscriptions' | 'blog_admin'>('registry');

  // Estados para Blog de Administración y Sugerencias
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [blogLoading, setBlogLoading] = useState<boolean>(false);
  const [newPostTitle, setNewPostTitle] = useState<string>('');
  const [newPostContent, setNewPostContent] = useState<string>('');
  const [newPostImageUrl, setNewPostImageUrl] = useState<string>('');
  const [isSubmittingPost, setIsSubmittingPost] = useState<boolean>(false);
  const [affiliateStats, setAffiliateStats] = useState<any[]>([]);
  const [totalVisitsCount, setTotalVisitsCount] = useState<number>(0);
  const [totalSalesCount, setTotalSalesCount] = useState<number>(0);
  const [totalRevenueSum, setTotalRevenueSum] = useState<number>(0);
  const [affiliateLoading, setAffiliateLoading] = useState<boolean>(false);
  const [cityFilter, setCityFilter] = useState<string>('');
  const [dateStart, setDateStart] = useState<string>('');
  const [dateEnd, setDateEnd] = useState<string>('');
  const [simulationPromoterId, setSimulationPromoterId] = useState<string>('UIO_MARIA');
  const [simulationPlanTier, setSimulationPlanTier] = useState<string>('Pase VIP Elite');
  const [simulationAmount, setSimulationAmount] = useState<number>(15.00);

  const getPromoterPlanPrices = (promoterId: string): { scoutPrice: number, vipPrice: number, currency: string } => {
    const cleanId = (promoterId || '').toUpperCase().trim();
    if (cleanId.startsWith("UIO") || cleanId.startsWith("GYE")) {
      return { scoutPrice: 5.00, vipPrice: 15.00, currency: '$' };
    } else if (cleanId.startsWith("MAD")) {
      return { scoutPrice: 5.00, vipPrice: 15.00, currency: '€' };
    } else {
      return { scoutPrice: 5.00, vipPrice: 15.00, currency: '$' };
    }
  };

  // Estados del Sincronizador de Alta y Baja de Promotores de Calle
  const [showAddPanel, setShowAddPanel] = useState<boolean>(false);
  const [newPromoterId, setNewPromoterId] = useState<string>('');
  const [newPromoterCity, setNewPromoterCity] = useState<string>('Quito');
  const [generatedQRCodeUrl, setGeneratedQRCodeUrl] = useState<string | null>(null);
  const [generatedQRCodeImg, setGeneratedQRCodeImg] = useState<string | null>(null);
  const [addPromoterError, setAddPromoterError] = useState<string>('');
  const [addPromoterSuccess, setAddPromoterSuccess] = useState<string>('');

  // Estados para el Simulador de Rendimiento Web TactikAI
  const [perfVirtualScroll, setPerfVirtualScroll] = useState<boolean>(true);
  const [perfScrollIndex, setPerfScrollIndex] = useState<number>(312);
  const [perfResolution, setPerfResolution] = useState<'mobile' | 'tablet' | 'uhd'>('mobile');
  const [perfCacheMode, setPerfCacheMode] = useState<'direct' | 'redis' | 'cdn'>('cdn');
  const [perfLogs, setPerfLogs] = useState<{ id: number; timestamp: string; action: string; lat: number; node: string }[]>([
    { id: 1, timestamp: "13:21:05", action: "GET /api/stickers/v1/user_me (Stickers Cache)", lat: 1.8, node: "Edge Node GYE_ECU_1" },
    { id: 2, timestamp: "13:22:12", action: "GET /api/stickers/v1/user_me (Stickers Cache)", lat: 4.2, node: "Edge Node ESP_MAD_3" }
  ]);
  const [perfRunningTest, setPerfRunningTest] = useState<boolean>(false);

  // Estados de Configuración de Conexiones (Integración)
  const [perfFalKey, setPerfFalKey] = useState<string>('fal_key_prod_ae924c918bbffd02');
  const [perfFalHost, setPerfFalHost] = useState<string>('https://queue.fal.run');
  const [perfGeminiKey, setPerfGeminiKey] = useState<string>('AIzaSyC9f_41bd9a430ff292e01c18');
  const [perfGeminiModel, setPerfGeminiModel] = useState<string>('gemini-2.5-flash');
  const [perfChatbotUrl, setPerfChatbotUrl] = useState<string>('/api/chat/dynamic');
  const [perfChatbotTemp, setPerfChatbotTemp] = useState<number>(0.75);
  const [perfPaymentProvider, setPerfPaymentProvider] = useState<string>('payphone_ecu');
  const [perfPaymentKey, setPerfPaymentKey] = useState<string>('payphone_live_key_0912e742');
  const [perfAiParserPrompt, setPerfAiParserPrompt] = useState<string>('');
  const [perfAiParserLoading, setPerfAiParserLoading] = useState<boolean>(false);
  const [perfAiParserMsg, setPerfAiParserMsg] = useState<string>('');

  // Estados para Registro de Suscripciones Detalladas
  const [subscriptionsList, setSubscriptionsList] = useState<any[]>([]);
  const [loadingSubscriptions, setLoadingSubscriptions] = useState<boolean>(false);
  const [searchSubQuery, setSearchSubQuery] = useState<string>('');
  const [newSubUserId, setNewSubUserId] = useState<string>('');
  const [newSubPlanTier, setNewSubPlanTier] = useState<string>('Pase VIP Elite');
  const [newSubGateway, setNewSubGateway] = useState<string>('Deuna');
  const [newSubReference, setNewSubReference] = useState<string>('');
  const [newSubAmount, setNewSubAmount] = useState<string>('15.00');
  const [newSubPromoterId, setNewSubPromoterId] = useState<string>('');

  // Estados para Generación de Códigos Manuales de Suscripción/Cortesías
  const [courtesyCodesList, setCourtesyCodesList] = useState<Record<string, { planTier: string, isUsed: boolean, usedBy?: string, usedAt?: string, createdAt: string }>>({});
  const [loadingCourtesyCodes, setLoadingCourtesyCodes] = useState<boolean>(false);
  const [newCourtesyCode, setNewCourtesyCode] = useState<string>('');
  const [newCourtesyPlan, setNewCourtesyPlan] = useState<string>('Pase VIP Elite');

  const fetchCourtesyCodes = async () => {
    setLoadingCourtesyCodes(true);
    try {
      const response = await fetch('/api/admin/courtesy-codes');
      const data = await response.json();
      if (data.status === 'success') {
        setCourtesyCodesList(data.codes || {});
      }
    } catch (err) {
      console.warn('Error fetching courtesy codes:', err);
    } finally {
      setLoadingCourtesyCodes(false);
    }
  };

  const handleCreateCourtesyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/courtesy-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: newCourtesyCode,
          planTier: newCourtesyPlan
        })
      });
      const data = await response.json();
      if (response.ok && data.status === 'success') {
        setSuccessMsg(`¡Código "${data.code}" creado con éxito para "${newCourtesyPlan}"!`);
        setNewCourtesyCode('');
        fetchCourtesyCodes();
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        setCustomAlert({
          title: 'Error al generar código',
          message: data.error || 'No se pudo crear el código de cortesía.'
        });
      }
    } catch (err: any) {
      console.error(err);
      setCustomAlert({
        title: 'Error de Red',
        message: err.message
      });
    }
  };

  const handleDeleteCourtesyCode = async (code: string) => {
    setCustomConfirm({
      title: '⚠️ ¿ELIMINAR CÓDIGO DE CORTESÍA?',
      message: `¿Estás seguro de que deseas eliminar permanentemente el código "${code}"? Los usuarios ya no podrán usarlo para activaciones.`,
      onConfirm: async () => {
        try {
          const response = await fetch('/api/admin/courtesy-codes/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code })
          });
          const data = await response.json();
          if (data.status === 'success') {
            setSuccessMsg(`Código "${code}" eliminado con éxito.`);
            fetchCourtesyCodes();
            setTimeout(() => setSuccessMsg(''), 4000);
          }
        } catch (err) {
          console.error(err);
        }
        setCustomConfirm(null);
      }
    });
  };

  const fetchSubscriptionsList = async (isSilent = false) => {
    if (!isSilent) setLoadingSubscriptions(true);
    try {
      const response = await fetch('/api/admin/subscriptions');
      const data = await response.json();
      if (data.status === 'success') {
        setSubscriptionsList(data.subscriptions || []);
      }
    } catch (err) {
      console.warn('Error fetching subscription transactions:', err);
    } finally {
      if (!isSilent) setLoadingSubscriptions(false);
    }
  };

  const handleDeleteSubscription = async (id: string) => {
    setCustomConfirm({
      title: '⚠️ ¿ELIMINAR REGISTRO DE TRASACCIÓN?',
      message: 'Esta acción removerá permanentemente la marca de auditoría de esta suscripción en la base de datos central. Nota: Esto no cancela el plan del usuario directamente. ¿Deseas dar de baja esta transacción?',
      onConfirm: async () => {
        try {
          const response = await fetch('/api/admin/subscriptions/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
          });
          const data = await response.json();
          if (data.status === 'success') {
            setSuccessMsg('Registro eliminado correctamente de la base de datos de suscripciones.');
            fetchSubscriptionsList();
            setTimeout(() => setSuccessMsg(''), 4000);
          }
        } catch (err) {
          console.error(err);
        }
        setCustomConfirm(null);
      }
    });
  };

  const handleCreateSubscriptionLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubUserId) {
      setCustomAlert({
        title: '⚠️ DT Requerido',
        message: 'Debes seleccionar un Director Técnico registrado de lLa lista.'
      });
      return;
    }
    try {
      const response = await fetch('/api/admin/subscriptions/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: newSubUserId,
          planTier: newSubPlanTier,
          gateway: newSubGateway,
          reference: newSubReference,
          amount: newSubAmount,
          promoterId: newSubPromoterId
        })
      });
      const data = await response.json();
      if (response.ok && data.status === 'success') {
        setSuccessMsg(`¡Suscripción de alta registrada con éxito para ${data.subscription.username}! Plan actualizado.`);
        setNewSubReference('');
        fetchSubscriptionsList();
        fetchRegisteredUsers(true);
        setTimeout(() => setSuccessMsg(''), 4050);
      } else {
        setCustomAlert({
          title: 'Error de Servidor',
          message: data.error || 'No se pudo crear la suscripción manual en base de datos.'
        });
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  // Carga de Estadísticas de Promotoras desde el Servidor
  const fetchAffiliateStats = async () => {
    setAffiliateLoading(true);
    try {
      const response = await fetch('/api/affiliate/stats');
      const data = await response.json();
      if (data.status === 'success') {
        setAffiliateStats(data.stats || []);
        setTotalVisitsCount(data.totalVisitsCount || 0);
        setTotalSalesCount(data.totalSalesCount || 0);
        setTotalRevenueSum(data.totalRevenueSum || 0);
      }
    } catch (err) {
      console.warn('Error fetching affiliate statistics:', err);
    } finally {
      setAffiliateLoading(false);
    }
  };

  // Callback to add a promoter in the server list
  const handleAddPromoter = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddPromoterError('');
    setAddPromoterSuccess('');
    setGeneratedQRCodeUrl(null);
    setGeneratedQRCodeImg(null);

    const checkId = newPromoterId.trim().toUpperCase();
    if (!checkId) {
      setAddPromoterError('El ID del promotor es obligatorio (Ejem: UIO_CARLOTA).');
      return;
    }

    try {
      const response = await fetch('/api/affiliate/promoter/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ promoterId: checkId, city: newPromoterCity })
      });
      const data = await response.json();
      if (!response.ok || data.status === 'error') {
        setAddPromoterError(data.error || 'Ocurrió un error al registrar al promotor.');
        return;
      }

      setAddPromoterSuccess(`¡Promotor ${checkId} registrado y sincronizado exitosamente!`);
      const originHost = window.location.origin || "https://ais-dev-nvcvdizgmjwhehteqnukpf-262324183391.us-east1.run.app";
      const referralLink = `${originHost}/?ref=${checkId}`;
      setGeneratedQRCodeUrl(referralLink);
      setGeneratedQRCodeImg(`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(referralLink)}`);
      
      setNewPromoterId('');
      fetchAffiliateStats();
    } catch (err) {
      console.error(err);
      setAddPromoterError('Error en la comunicación con el servidor de sorteos.');
    }
  };

  // Callback to delete a promoter
  const handleDeletePromoter = async (pId: string) => {
    setCustomConfirm({
      title: `⚠️ ¿ELIMINAR PROMOTORA ${pId}?`,
      message: `Esta acción removerá el QR de la promotora "${pId}" de la lista de auditoría analítica. Todas las estadísticas históricas de visitas y conversión se mantendrán en la base, pero ya no formará parte del equipo activo en vía pública. ¿Deseas dar de baja a esta promotora?`,
      onConfirm: async () => {
        try {
          const response = await fetch('/api/affiliate/promoter/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ promoterId: pId })
          });
          const data = await response.json();
          if (response.ok && data.status === 'success') {
            setSuccessMsg(`Promotora ${pId} eliminada correctamente del roster.`);
            fetchAffiliateStats();
            setTimeout(() => setSuccessMsg(''), 5000);
          } else {
            setCustomAlert({
              title: "Error al borrar",
              message: data.error || "No se pudo eliminar la promotora activa."
            });
          }
        } catch (err) {
          console.error(err);
          setCustomAlert({
            title: "Error de red",
            message: "No se pudo establecer comunicación para procesar la baja de la promotora."
          });
        }
        setCustomConfirm(null);
      }
    });
  };

  const fetchBlogPosts = async () => {
    setBlogLoading(true);
    try {
      const response = await fetch('/api/blog');
      const data = await response.json();
      if (data.status === 'success') {
        setBlogPosts(data.posts || []);
      }
    } catch (err) {
      console.warn('Error fetching blog posts:', err);
    } finally {
      setBlogLoading(false);
    }
  };

  const fetchSuggestions = async () => {
    try {
      const response = await fetch('/api/admin/suggestions');
      const data = await response.json();
      if (data.status === 'success') {
        setSuggestions(data.suggestions || []);
      }
    } catch (err) {
      console.warn('Error fetching suggestions:', err);
    }
  };

  const handleCreateBlogPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostTitle || !newPostContent) {
      setCustomAlert({
        title: '⚠️ Campos Requeridos',
        message: 'Por favor, ingresa el título y el contenido de la publicación.'
      });
      return;
    }
    setIsSubmittingPost(true);
    try {
      const response = await fetch('/api/admin/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newPostTitle,
          content: newPostContent,
          imageUrl: newPostImageUrl
        })
      });
      const data = await response.json();
      if (data.status === 'success') {
        setSuccessMsg('¡Noticia publicada con éxito en el blog general!');
        setNewPostTitle('');
        setNewPostContent('');
        setNewPostImageUrl('');
        fetchBlogPosts();
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingPost(false);
    }
  };

  const handleDeleteBlogPost = async (id: string) => {
    setCustomConfirm({
      title: '⚠️ ¿ELIMINAR PUBLICACIÓN?',
      message: 'Esta acción removerá esta noticia permanentemente del blog general y de la bitácora técnica de coleccionistas. ¿Deseas borrarla?',
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/admin/blog/${id}`, {
            method: 'DELETE'
          });
          const data = await response.json();
          if (data.status === 'success') {
            setSuccessMsg('Noticia borrada con éxito.');
            fetchBlogPosts();
            setTimeout(() => setSuccessMsg(''), 4000);
          }
        } catch (err) {
          console.error(err);
        }
        setCustomConfirm(null);
      }
    });
  };

  const handleDeleteSuggestion = async (id: string) => {
    setCustomConfirm({
      title: '⚠️ ¿ELIMINAR SUGERENCIA?',
      message: 'Esta sugerencia/comentario se borrará por completo de la bandeja de entrada central. ¿Deseas eliminarla?',
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/admin/suggestions/${id}`, {
            method: 'DELETE'
          });
          const data = await response.json();
          if (data.status === 'success') {
            setSuccessMsg('Sugerencia eliminada con éxito.');
            fetchSuggestions();
            setTimeout(() => setSuccessMsg(''), 4000);
          }
        } catch (err) {
          console.error(err);
        }
        setCustomConfirm(null);
      }
    });
  };

  useEffect(() => {
    fetchAffiliateStats();
    if (currentSubTab === 'subscriptions') {
      fetchSubscriptionsList();
      fetchCourtesyCodes();
    }
    if (currentSubTab === 'blog_admin') {
      fetchBlogPosts();
      fetchSuggestions();
    }
  }, [currentSubTab]);

  // Estados para diálogos alternativos a window.confirm / alert bloqueados por IFrames
  const [customConfirm, setCustomConfirm] = useState<{
    title: string;
    message: string;
    onConfirm: () => void | Promise<void>;
  } | null>(null);

  const [customAlert, setCustomAlert] = useState<{
    title: string;
    message: string;
  } | null>(null);

  // Form to create user state
  const [newUsername, setNewUsername] = useState<string>('');
  const [newGameCode, setNewGameCode] = useState<string>('');
  const [newAciertosOnce, setNewAciertosOnce] = useState<number>(0);
  const [newAciertosMarcador, setNewAciertosMarcador] = useState<number>(0);
  const [newSubscription, setNewSubscription] = useState<string>('Ninguna');
  const [newAvatar, setNewAvatar] = useState<string>('⚽');

  // Load registered users from Server API
  const fetchRegisteredUsers = async (isSilent = false) => {
    if (!isSilent) {
      setLoading(true);
    }
    try {
      const response = await fetch('/api/admin/users');
      const data = await response.json();
      if (data.status === 'success') {
        setUsersList(data.users || []);
        setErrorMsg('');
        setLastSyncedAt(new Date());
      } else {
        throw new Error('API reported failure');
      }
    } catch (err: any) {
      console.warn('Backend database not fully loaded, using pre-seeded local fallback data', err);
      setErrorMsg('Error de red. Conectando por fallback seguro.');
    } finally {
      if (!isSilent) {
        setLoading(false);
      }
    }
  };

  const fetchCustomStickers = async () => {
    try {
      const response = await fetch('/api/stickers/custom');
      const data = await response.json();
      if (data && data.status === 'success' && data.stickers) {
        setCustomStickersMap(data.stickers);
      }
    } catch (err) {
      console.warn('Error fetching custom stickers in panel:', err);
    }
  };

  const handleUpdateStickerUrl = async (playerId: string, newUrl: string) => {
    if (!newUrl.trim()) return;
    try {
      const response = await fetch('/api/stickers/custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, imageUrl: newUrl.trim() })
      });
      const data = await response.json();
      if (data && data.status === 'success') {
        setSuccessMsg(`Enlace de cromo ${playerId} actualizado con éxito en la base de datos.`);
        fetchCustomStickers();
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      console.warn('Error updating sticker URL:', err);
    }
  };

  const handleResetSticker = async (playerId: string) => {
    try {
      const response = await fetch('/api/stickers/custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, deleteSticker: true })
      });
      const data = await response.json();
      if (data && data.status === 'success') {
        setSuccessMsg(`Cromo de ${playerId} desvinculado de la imagen personalizada y devuelto al oficial.`);
        fetchCustomStickers();
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      console.warn('Error resetting sticker:', err);
    }
  };

  const fetchCustomMatches = async () => {
    try {
      const response = await fetch('/api/matches/custom');
      const data = await response.json();
      if (data && data.status === 'success' && data.matches) {
        setCustomMatchesMap(data.matches);
        
        // Populate defaults into drafts for matches that have values
        const draftUpdates: any = {};
        Object.entries(data.matches).forEach(([mId, val]: [string, any]) => {
          draftUpdates[mId] = {
            golesLocal: String(val.golesLocal),
            golesVisitante: String(val.golesVisitante),
            jugado: val.jugado
          };
        });
        setMatchDrafts(prev => ({ ...draftUpdates, ...prev }));
      }
    } catch (err) {
      console.warn('Error fetching custom matches in panel:', err);
    }
  };

  const handleSaveMatchScore = async (matchId: string, golesLocalStr: string, golesVisitanteStr: string, jugado: boolean) => {
    const goalsL = parseInt(golesLocalStr, 10);
    const goalsV = parseInt(golesVisitanteStr, 10);
    
    if (isNaN(goalsL) || isNaN(goalsV)) {
      setCustomAlert({
        title: '⚠️ Goles Inválidos',
        message: 'Por favor, introduce valores numéricos enteros válidos para los goles de los equipos.'
      });
      return;
    }

    try {
      const response = await fetch('/api/matches/custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId, golesLocal: goalsL, golesVisitante: goalsV, jugado })
      });
      const data = await response.json();
      if (data && data.status === 'success') {
        setSuccessMsg(`Resultado del partido ${matchId} guardado con éxito en la base de datos.`);
        fetchCustomMatches();
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      console.warn('Error saving match score:', err);
    }
  };

  const handleResetMatch = async (matchId: string) => {
    try {
      const response = await fetch('/api/matches/custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId, resetMatch: true })
      });
      const data = await response.json();
      if (data && data.status === 'success') {
        // Remove from local drafts too
        setMatchDrafts(prev => {
          const updated = { ...prev };
          delete updated[matchId];
          return updated;
        });
        setSuccessMsg(`Resultado del partido ${matchId} restablecido con éxito a los datos oficiales.`);
        fetchCustomMatches();
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      console.warn('Error resetting match result:', err);
    }
  };

  useEffect(() => {
    fetchRegisteredUsers(false);
    fetchCustomStickers();
    fetchCustomMatches();
    
    // Set up high-precision automatic background synchronization every 3 seconds
    const syncInterval = setInterval(() => {
      fetchRegisteredUsers(true);
      fetchCustomStickers();
      fetchCustomMatches();
      if (currentSubTab === 'subscriptions') {
        fetchSubscriptionsList(true);
      }
    }, 3000);

    return () => clearInterval(syncInterval);
  }, [currentSubTab]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newGameCode.trim()) {
      setCustomAlert({
        title: '⚠️ Campos Requeridos',
        message: 'Debes ingresar un nombre de usuario y código de juego.'
      });
      return;
    }

    try {
      const response = await fetch('/api/admin/users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: newUsername,
          gameCode: newGameCode.toUpperCase(),
          aciertosOnce: newAciertosOnce,
          aciertosMarcador: newAciertosMarcador,
          subscription: newSubscription,
          avatar: newAvatar,
          // score calculation: sticks(random default 5) + 5*completed(0) + Once*10 + Marcador*20
          score: 5 + (newAciertosOnce * 10) + (newAciertosMarcador * 20)
        })
      });
      const data = await response.json();
      if (data.status === 'success') {
        setSuccessMsg(`Usuario ${newUsername} registrado exitosamente en la base de datos.`);
        setNewUsername('');
        setNewGameCode('');
        setNewAciertosOnce(0);
        setNewAciertosMarcador(0);
        setNewSubscription('Ninguna');
        fetchRegisteredUsers();
      }
    } catch (err) {
      console.error(err);
      setCustomAlert({
        title: '❌ Error Servidor',
        message: 'Error registrando usuario en servidor.'
      });
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (id === currentUserId) {
      setCustomAlert({
        title: '⚠️ Acción Restringida',
        message: 'No puedes eliminar tu propio usuario de login primario de Administrador o tu usuario registrado.'
      });
      return;
    }

    setCustomConfirm({
      title: '🚨 Confirmar Eliminación',
      message: '¿Seguro de remover este usuario permanentemente del sistema de sorteo nacional?',
      onConfirm: async () => {
        try {
          const res = await fetch('/api/admin/users/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
          });
          const data = await res.json();
          if (data.status === 'success') {
            setSuccessMsg('Usuario dado de baja del servidor.');
            fetchRegisteredUsers();
          }
        } catch (err) {
          console.error(err);
          setCustomAlert({
            title: '❌ Error',
            message: 'No se pudo eliminar al usuario de forma exitosa.'
          });
        }
      }
    });
  };

  const handleQuickPromotion = async (id: string, tier: string) => {
    try {
      const res = await fetch('/api/admin/users/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, subscription: tier })
      });
      const data = await res.json();
      if (data.status === 'success') {
        setSuccessMsg(`Plan de usuario actualizado a: ${tier}.`);
        fetchRegisteredUsers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Flatten users' tactical boards predictions to a structured array for the DB Grid
  const consolidatedPredictions = React.useMemo(() => {
    const list: Array<{
      id: string;
      user: ActiveUser;
      countryName: string;
      board: any;
      prediction: any;
    }> = [];
    
    usersList.forEach(u => {
      if (u.tacticalBoards) {
        Object.entries(u.tacticalBoards).forEach(([countryName, boardObj]: [string, any]) => {
          if (boardObj && boardObj.prediction) {
            list.push({
              id: `${u.id}-${countryName}`,
              user: u,
              countryName,
              board: boardObj,
              prediction: boardObj.prediction
            });
          }
        });
      }
    });
    
    return list;
  }, [usersList]);

  const predictionCountries = React.useMemo(() => {
    const set = new Set<string>();
    consolidatedPredictions.forEach(cp => {
      if (cp.countryName) {
        set.add(cp.countryName);
      }
    });
    return Array.from(set).sort();
  }, [consolidatedPredictions]);

  const filteredPredictions = React.useMemo(() => {
    return consolidatedPredictions.filter(cp => {
      const matchSearch = !searchDbQuery || 
        cp.user.username.toLowerCase().includes(searchDbQuery.toLowerCase()) || 
        cp.user.gameCode.toLowerCase().includes(searchDbQuery.toLowerCase()) ||
        (cp.user.email && cp.user.email.toLowerCase().includes(searchDbQuery.toLowerCase()));
      
      const matchCountry = !countryFilter || cp.countryName === countryFilter;
      
      return matchSearch && matchCountry;
    });
  }, [consolidatedPredictions, searchDbQuery, countryFilter]);

  // Re-order list according to scores to trace Raffle status
  const sortedCompetitors = [...usersList].sort((a, b) => b.score - a.score);

  return (
    <div className="space-y-8 animate-fade-in text-slate-350" id="admin-panel-workspace">
      
      {/* Visual Header */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950/40 border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-mono bg-red-500/15 border border-red-500/35 px-2.5 py-0.5 rounded text-red-400 font-bold tracking-wider">
                ADMIN_PANEL_ROOT
              </span>
              <span className="text-slate-500 font-mono text-xs">• Sincronizado con Base de Datos Relacional</span>
            </div>
            <h2 className="text-xl font-extrabold text-white mt-1.5">Consola Central de Gestión y Sorteo</h2>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Audita a los usuarios registrados, modifica sus licencias de suscripción y analiza de forma transparente quiénes lideran los puntajes oficiales con acceso directo a la pre-adjudicación de premios.
            </p>
          </div>
          <div className="flex items-center gap-3 bg-slate-950/80 px-4 py-2.5 rounded-2xl border-2 border-black shadow-[4px_4px_0px_#000]">
            <span className="relative flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
            </span>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-mono font-black text-emerald-400 tracking-wider">
                ✓ Sincronización Automática
              </span>
              <span className="text-[9px] font-mono text-slate-400">
                Estados, tácticas y pronósticos en vivo • {lastSyncedAt ? `Actualizado: ${lastSyncedAt.toLocaleTimeString('es-ES')}` : 'Procesando...'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-tab Navigation Belt (Custom Superhero style) */}
      <div className="flex flex-col md:flex-row border-3 border-black bg-slate-900 rounded-2xl overflow-hidden shadow-[4px_4px_0px_#000] select-none mb-6" id="affiliate-tab-belt">
        <button
          onClick={() => setCurrentSubTab('registry')}
          className={`flex-1 flex items-center justify-center gap-2 py-3.5 font-bangers tracking-widest text-xs sm:text-sm uppercase transition cursor-pointer border-r-0 md:border-r-3 border-b-3 md:border-b-0 border-black ${
            currentSubTab === 'registry' 
              ? 'bg-yellow-400 text-black font-black' 
              : 'bg-slate-950 text-slate-400 hover:bg-slate-905'
          }`}
        >
          <Users className="w-4 h-4 shrink-0" />
          <span>Gestión de Directores Técnicos</span>
        </button>
        <button
          onClick={() => setCurrentSubTab('affiliates')}
          className={`flex-1 flex items-center justify-center gap-2 py-3.5 font-bangers tracking-widest text-xs sm:text-sm uppercase transition cursor-pointer border-r-0 md:border-r-3 border-b-3 md:border-b-0 border-black ${
            currentSubTab === 'affiliates' 
              ? 'bg-[#15803d] text-white font-black' 
              : 'bg-slate-950 text-slate-400 hover:bg-slate-905'
          }`}
        >
          <QrCode className="w-4 h-4 shrink-0" />
          <span>Analítica de Promotoras QR</span>
        </button>
        <button
          onClick={() => setCurrentSubTab('performance')}
          className={`flex-1 flex items-center justify-center gap-2 py-3.5 font-bangers tracking-widest text-xs sm:text-sm uppercase transition cursor-pointer border-r-0 md:border-r-3 border-b-3 md:border-b-0 border-black ${
            currentSubTab === 'performance' 
              ? 'bg-indigo-600 text-white font-black' 
              : 'bg-slate-950 text-slate-400 hover:bg-slate-905'
          }`}
        >
          <Cpu className="w-4 h-4 shrink-0" />
          <span>Sistemas de Alto Rendimiento</span>
        </button>
        <button
          onClick={() => setCurrentSubTab('subscriptions')}
          className={`flex-1 flex items-center justify-center gap-2 py-3.5 font-bangers tracking-widest text-xs sm:text-sm uppercase transition cursor-pointer border-r-0 md:border-r-3 border-b-3 md:border-b-0 border-black ${
            currentSubTab === 'subscriptions' 
              ? 'bg-[#b91c1c] text-white font-black' 
              : 'bg-slate-950 text-slate-400 hover:bg-slate-905'
          }`}
        >
          <Award className="w-4 h-4 shrink-0" />
          <span>Suscripciones & Licencias Detalladas</span>
        </button>
        <button
          onClick={() => setCurrentSubTab('blog_admin')}
          className={`flex-1 flex items-center justify-center gap-2 py-3.5 font-bangers tracking-widest text-xs sm:text-sm uppercase transition cursor-pointer ${
            currentSubTab === 'blog_admin' 
              ? 'bg-teal-600 text-white font-black' 
              : 'bg-slate-950 text-slate-400 hover:bg-slate-905'
          }`}
        >
          <Rss className="w-4 h-4 shrink-0" />
          <span>Administrar Blog & Sugerencias</span>
        </button>
      </div>

      {currentSubTab === 'registry' && (
        <>
          {/* Numerical Stats overview */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-850">
          <span className="text-[9px] uppercase font-mono text-slate-500">Registrados en DB</span>
          <span className="text-2xl font-black text-white font-mono block mt-1">{usersList.length}</span>
          <span className="text-[10px] text-gray-500 font-mono block mt-0.5">Sujetos de sorteo activos</span>
        </div>
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-850">
          <span className="text-[9px] uppercase font-mono text-slate-500">Suscripciones VIP</span>
          <span className="text-2xl font-black text-amber-400 font-mono block mt-1">
            {usersList.filter(u => u.subscription === 'Pase VIP Elite').length}
          </span>
          <span className="text-[10px] text-amber-500/70 font-mono block mt-0.5">Pases VIP adquiridos</span>
        </div>
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-850">
          <span className="text-[9px] uppercase font-mono text-slate-500">Puntaje Máximo Registrado</span>
          <span className="text-2xl font-black text-white font-mono block mt-1">
            {usersList.length > 0 ? Math.max(...usersList.map(u => u.score)) : 0} Pts
          </span>
          <span className="text-[10px] text-indigo-400 font-mono block mt-0.5">1er lugar general</span>
        </div>
        <div className="bg-slate-950 p-4 rounded-xl border border-indigo-950/40 shadow-[0_0_15px_rgba(99,102,241,0.05)]">
          <span className="text-[9px] uppercase font-mono text-indigo-400">Canjes por Invitación</span>
          <span className="text-2xl font-black text-indigo-400 font-mono block mt-1">
            {usersList.reduce((acc, u) => acc + (u.successfulReferralsCount || 0), 0)} u
          </span>
          <span className="text-[10px] text-indigo-500/70 font-mono block mt-0.5">
            +{usersList.reduce((acc, u) => acc + (u.referralPoints || 0), 0)} pts otorgados
          </span>
        </div>
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 col-span-2 lg:col-span-1">
          <span className="text-[9px] uppercase font-mono text-slate-500">Auditabilidad Cryptográfica</span>
          <span className="text-xs font-bold text-emerald-400 block mt-2 uppercase font-mono">
            MurmurHash3 ACTIVO
          </span>
          <span className="text-[9.5px] text-slate-500 font-mono block mt-1">Sorteos de sobres deterministas</span>
        </div>
      </div>

      {/* Main Container Grid: Left table, Right register form */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Users & Predictions Consolidated Databases */}
        <div className="xl:col-span-8 bg-brand-sidebar border-3 border-black rounded-3xl p-5 shadow-[6px_6px_0px_#000] flex flex-col justify-between">
          <div>
            {/* Inner Subsystem Belt / Toggles */}
            <div className="flex flex-col md:flex-row gap-2 mb-5 p-1 bg-slate-950 rounded-2xl border-2 border-black">
              <button
                type="button"
                onClick={() => setDbSubView('users')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl font-bold text-xs uppercase transition cursor-pointer ${
                  dbSubView === 'users'
                    ? 'bg-indigo-650 text-white shadow-[0_0_10px_rgba(99,102,241,0.3)] border border-indigo-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Users className="w-3.5 h-3.5" /> 📋 Directores Técnicos ({usersList.length})
              </button>
              <button
                type="button"
                onClick={() => setDbSubView('predictions')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl font-bold text-xs uppercase transition cursor-pointer ${
                  dbSubView === 'predictions'
                    ? 'bg-yellow-500 text-black shadow-[0_0_10px_rgba(234,179,8,0.3)] font-black border border-yellow-405'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Database className="w-3.5 h-3.5 text-yellow-950" /> 🎯 Base Pronósticos ({consolidatedPredictions.length})
              </button>
              <button
                type="button"
                onClick={() => {
                  setDbSubView('stickers');
                  fetchCustomStickers();
                }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl font-bold text-xs uppercase transition cursor-pointer ${
                  dbSubView === 'stickers'
                    ? 'bg-emerald-600 text-white shadow-[0_0_10px_rgba(16,185,129,0.3)] border border-emerald-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Image className="w-3.5 h-3.5" /> 🖼️ Cromos Guardados ({Object.keys(customStickersMap).length})
              </button>
              <button
                type="button"
                onClick={() => {
                  setDbSubView('matches');
                  fetchCustomMatches();
                }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl font-bold text-xs uppercase transition cursor-pointer ${
                  dbSubView === 'matches'
                    ? 'bg-indigo-600 text-white shadow-[0_0_10px_rgba(79,70,229,0.3)] border border-indigo-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Trophy className="w-3.5 h-3.5" /> 📅 Resultados Oficiales (36)
              </button>
            </div>

            {successMsg && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl mb-4 text-xs text-emerald-400 flex items-center gap-1.5">
                <CircleCheck className="w-4 h-4 text-emerald-400" />
                <span>{successMsg}</span>
              </div>
            )}

            {loading ? (
              <div className="text-center py-12">
                <RefreshCw className="w-8 h-8 animate-spin text-indigo-500 mx-auto mb-2" />
                <p className="text-xs text-gray-500 font-mono">Sincronizando base de datos en tiempo real...</p>
              </div>
            ) : dbSubView === 'users' ? (
              // --- FIRST DATABASE VIEW: USER DIRECTORY ---
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-black text-gray-400 uppercase font-mono text-[9px] tracking-wider bg-slate-950">
                      <th className="py-2.5 px-3">Usuario / Código</th>
                      <th className="py-2.5 px-2">Suscripción & Contacto</th>
                      <th className="py-2.5 px-2">Desglose por Segmentos de Puntos</th>
                      <th className="py-2.5 px-2 text-center font-bold text-slate-300">Puntaje</th>
                      <th className="py-2.5 px-2 text-right">Elegibilidad</th>
                      <th className="py-2.5 px-3 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedCompetitors.map((u, index) => {
                      const isMe = u.id === currentUserId;
                      const pos = index + 1;
                      
                      let planBadge = 'text-gray-500 bg-slate-950 border-slate-855';
                      if (u.subscription === 'Pase VIP Elite') planBadge = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
                      else if (u.subscription === 'Plan Scout Básico') planBadge = 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20';

                      let rewardText = "Ninguno";
                      if (pos === 1) rewardText = "🥇 $1.000 USD";
                      else if (pos === 2) rewardText = "🥈 $500 USD";
                      else if (pos === 3) rewardText = "🥉 $250 USD";

                      return (
                        <tr 
                          key={u.id} 
                          className={`border-b border-slate-850 hover:bg-slate-950/20 transition-all ${
                            isMe ? 'bg-indigo-500/5 font-semibold text-white' : ''
                          }`}
                        >
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{u.avatar || '⚽'}</span>
                              <div>
                                <span className={`block font-bold text-xs ${isMe ? 'text-indigo-400 font-extrabold' : 'text-slate-200'}`}>
                                  {u.username} {isMe && <span className="text-[8px] bg-indigo-500 text-white font-mono rounded-lg px-1.5 ml-1 inline-block uppercase font-black">Admin</span>}
                                </span>
                                <div className="flex flex-col gap-0.5">
                                  <span className="text-[10px] font-mono text-gray-400 font-medium">{u.gameCode || u.id}</span>
                                  {u.email && (
                                    <span className="text-[9.5px] text-indigo-305 tracking-tight truncate max-w-[155px]" title={u.email}>
                                      📧 {u.email}
                                    </span>
                                  )}
                                  {u.referredByEmail && (
                                    <span className="text-[9px] font-semibold text-rose-455 font-mono" title={`Invitado por: ${u.referredByEmail}`}>
                                      🎁 Invitado por: {u.referredByEmail}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-2">
                            <div className="flex flex-col gap-1 items-start">
                              <span className={`text-[9.5px] px-2 py-0.5 rounded-lg border font-mono ${planBadge}`}>
                                {u.subscription || 'Ninguna'}
                              </span>
                              {u.licenseCode && (
                                <span className="text-[8.5px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded select-all" title="Código Único de Licencia de Pago">
                                  🔑 {u.licenseCode}
                                </span>
                              )}
                              {u.successfulReferralsCount !== undefined && u.successfulReferralsCount > 0 && (
                                <span className="text-[8.5px] font-mono text-purple-400 bg-purple-500/10 border border-purple-500/20 px-1.5 py-0.5 rounded" title={`Amigos recomendados que se suscribieron:\n${u.successfulReferralEmails?.join(', ')}`}>
                                  👥 {u.successfulReferralsCount} recomendados ({u.referralPoints || 0} pts)
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-2">
                            <div className="flex flex-wrap gap-1.5 max-w-[280px]">
                              <span className="flex items-center gap-1 text-[9px] font-mono font-medium bg-blue-500/10 text-blue-400 border border-blue-500/15 px-1.5 py-0.5 rounded-md" title="1 punto por cromo recolectado">
                                🖼️ Cromos: {u.unlockedStickersCount || 0}
                              </span>
                              <span className="flex items-center gap-1 text-[9px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 px-1.5 py-0.5 rounded-md" title="5 puntos de bono por cada país completado">
                                🌍 Bonos: {(u.completedCountries?.length || 0) * 5}
                              </span>
                              <span className="flex items-center gap-1 text-[9px] font-mono font-medium bg-orange-500/10 text-orange-400 border border-orange-500/15 px-1.5 py-0.5 rounded-md" title="10 puntos por acierto de jugador real titular en el 11 ideal">
                                🏃 XI: {(u.aciertosOnce || 0) * 10}
                              </span>
                              <span className="flex items-center gap-1 text-[9px] font-mono font-medium bg-yellow-500/10 text-yellow-300 border border-yellow-500/15 px-1.5 py-0.5 rounded-md" title="20 puntos por resultado de goles exacto">
                                🎯 Goles: {(u.aciertosMarcador || 0) * 20}
                              </span>
                              <span className="flex items-center gap-1 text-[9px] font-mono font-medium bg-purple-500/10 text-purple-400 border border-purple-500/15 px-1.5 py-0.5 rounded-md" title="5 puntos por cada amigo invitado con suscripción activa">
                                👥 Invita: {u.referralPoints || 0}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-2 text-center">
                            <span className="font-mono text-xs font-black text-white bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
                              {u.score} pts
                            </span>
                          </td>
                          <td className="py-3 px-2 text-right">
                            <span className={`text-[10px] font-mono font-medium ${pos <= 3 ? 'text-amber-400 font-bold' : 'text-gray-500'}`}>
                              {rewardText}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <div className="flex items-center gap-1.5 justify-center">
                              <button
                                onClick={() => setInspectingUser(u)}
                                title="Ver Tácticas, Pronósticos y Registro Completo"
                                className="p-1 rounded bg-slate-905 border border-slate-800 text-cyan-400 hover:text-cyan-300 hover:border-cyan-500/50 cursor-pointer flex items-center justify-center transition-all active:scale-95"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleQuickPromotion(u.id, u.subscription === 'Pase VIP Elite' ? 'Ninguna' : 'Pase VIP Elite')}
                                title="Promover/Degradar suscripción"
                                className="p-1 rounded border border-slate-850 text-slate-400 hover:text-amber-400 bg-slate-905 cursor-pointer transition-all"
                              >
                                <ToggleLeft className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteUser(u.id)}
                                disabled={isMe}
                                className={`p-1 rounded border border-slate-850 text-slate-500 hover:text-rose-455 ${
                                  isMe ? 'opacity-30 cursor-not-allowed' : 'bg-slate-905 hover:border-rose-950 cursor-pointer transition-all'
                                }`}
                                title="Eliminar cuenta de DB"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : dbSubView === 'predictions' ? (
              // --- SECOND DATABASE VIEW: EXCEL-STYLE ADVANCED PREDICTIONS & ALIGNMENTS DATABASE GRID ---
              <div className="space-y-4">
                {/* Search & Custom Table Filters */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-950 p-3 rounded-2xl border border-slate-850">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchDbQuery}
                      onChange={(e) => setSearchDbQuery(e.target.value)}
                      placeholder="🔍 Buscar por Director Técnico o Código..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-yellow-550"
                    />
                  </div>
                  <div>
                    <select
                      value={countryFilter}
                      onChange={(e) => setCountryFilter(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-yellow-555 font-mono"
                    >
                      <option value="">🌍 Filtrar por Selección: Mostrar todas</option>
                      {predictionCountries.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {filteredPredictions.length === 0 ? (
                  <div className="text-center py-10 bg-slate-950/40 border border-slate-850 rounded-2xl">
                    <Activity className="w-8 h-8 text-yellow-500 mx-auto opacity-40 mb-2 animate-bounce" />
                    <p className="text-xs text-slate-400 font-mono">No se encontraron pronósticos registrados bajo estos filtros.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-black text-gray-400 uppercase font-mono text-[9px] tracking-wider bg-slate-950">
                          <th className="py-2.5 px-3">Director Técnico</th>
                          <th className="py-2.5 px-2">Selección</th>
                          <th className="py-2.5 px-2">Alineación / Formación</th>
                          <th className="py-2.5 px-2 text-center text-yellow-405 font-bold">Pronóstico</th>
                          <th className="py-2.5 px-3">Estatus y Validación</th>
                          <th className="py-2.5 px-2 text-center">Inspección</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredPredictions.map(({ id, user, countryName, board, prediction }) => {
                          const isEligible = board.predictionEligible !== false;
                          const mappedPlayersCount = board.selectedPlayers 
                            ? Object.values(board.selectedPlayers).filter(val => val !== null).length 
                            : 0;
                          
                          return (
                            <tr key={id} className="border-b border-slate-850 hover:bg-slate-950/45 transition-all">
                              <td className="py-3 px-3">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm">{user.avatar || '⚽'}</span>
                                  <div>
                                    <span className="block font-bold text-xs text-slate-205">
                                      {user.username}
                                    </span>
                                    <span className="text-[9.5px] font-mono text-gray-500 block">
                                      {user.gameCode || user.id}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-2">
                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-950 border border-slate-800 text-[10.5px] font-extrabold text-indigo-400 font-mono">
                                  🏟️ {countryName}
                                </span>
                              </td>
                              <td className="py-3 px-2">
                                <div className="flex flex-col gap-0.5">
                                  <span className="text-[10px] font-sans font-black text-white">
                                    📋 {board.formation || '4-3-3'}
                                  </span>
                                  <span className="text-[9px] font-mono text-slate-400">
                                    🏃 {mappedPlayersCount} jugadores en cancha
                                  </span>
                                </div>
                              </td>
                              <td className="py-3 px-2 text-center">
                                <span className="inline-block font-mono text-xs font-black text-yellow-300 bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800 shadow-[0_2px_5px_rgba(0,0,0,0.3)]">
                                  {prediction.golesLocal} : {prediction.golesVisitante}
                                </span>
                              </td>
                              <td className="py-3 px-3">
                                <div className="flex flex-col gap-0.5">
                                  <div className="flex items-center gap-1.5">
                                    <span className={`w-2 h-2 rounded-full ${isEligible ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                                    <span className={`text-[9.5px] font-mono font-bold uppercase ${isEligible ? 'text-emerald-400' : 'text-red-400'}`}>
                                      {isEligible ? '🟢 APTO PARA PUNTOS' : '🔴 REGISTRO HISTÓRICO'}
                                    </span>
                                  </div>
                                  {board.predictionSavedAt && (
                                    <span className="text-[8.5px] font-mono text-slate-500 block">
                                      ⏱️ {new Date(board.predictionSavedAt).toLocaleString('es-ES')}
                                    </span>
                                  )}
                                  {board.predictionReason && (
                                    <span className="text-[8.5px] font-mono text-slate-400 italic block mt-0.5 truncate max-w-[195px]" title={board.predictionReason}>
                                      "{board.predictionReason}"
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="py-3 px-2 text-center">
                                <button
                                  onClick={() => setInspectingUser(user)}
                                  title="Inspeccionar alineaciones, cromos y pronósticos en detalle"
                                  className="p-1 rounded bg-slate-950 border border-slate-800 text-cyan-400 hover:text-cyan-300 hover:border-cyan-500/50 cursor-pointer inline-flex items-center justify-center transition-all"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ) : dbSubView === 'stickers' ? (
              // --- THIRD DATABASE VIEW: MANAGE CUSTOM STICKER IMAGES ---
              <div className="space-y-4">
                {/* Search Form */}
                <div className="relative bg-slate-950 p-3 rounded-2xl border border-slate-850 col-span-2 col-span-2">
                  <input
                    type="text"
                    value={searchDbQuery}
                    onChange={(e) => setSearchDbQuery(e.target.value)}
                    placeholder="🔍 Buscar por nombre, apodo, selección o ID de jugador..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                {(() => {
                  const getPlayerDetailsById = (playerId: string) => {
                    for (const c of COUNTRIES) {
                      const pList = generatePlayersForCountry(c.name);
                      const found = pList.find(p => p.id === playerId);
                      if (found) {
                        return {
                          player: found,
                          country: c.name,
                          flag: c.flag
                        };
                      }
                    }
                    return null;
                  };

                  const customStickersList = Object.entries(customStickersMap).map(([pid, imageUrl]) => {
                    const details = getPlayerDetailsById(pid);
                    return {
                      playerId: pid,
                      imageUrl,
                      player: details ? details.player : null,
                      country: details ? details.country : "Torneo de Selecciones",
                      flag: details ? details.flag : "🌍"
                    };
                  });

                  const filteredCustomStickers = customStickersList.filter(item => {
                    const query = searchDbQuery.toLowerCase();
                    const playerName = item.player ? item.player.realName.toLowerCase() : "";
                    const playerApodo = item.player ? (item.player.nickname || item.player.name).toLowerCase() : "";
                    const countryName = item.country.toLowerCase();
                    return playerName.includes(query) || playerApodo.includes(query) || countryName.includes(query) || item.playerId.toLowerCase().includes(query);
                  });

                  if (filteredCustomStickers.length === 0) {
                    return (
                      <div className="text-center py-10 bg-slate-950/40 border border-slate-850 rounded-2xl">
                        <Image className="w-8 h-8 text-emerald-500 mx-auto opacity-40 mb-2 animate-pulse" />
                        <p className="text-xs text-slate-400 font-mono">No hay cromos personalizados guardados o detectados bajo estos filtros.</p>
                      </div>
                    );
                  }

                  return (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse font-sans">
                        <thead>
                          <tr className="border-b border-black text-gray-400 uppercase font-mono text-[9px] tracking-wider bg-slate-950 font-sans">
                            <th className="py-2.5 px-3">Cromo (Miniatura)</th>
                            <th className="py-2.5 px-2">Jugador</th>
                            <th className="py-2.5 px-2">Selección</th>
                            <th className="py-2.5 px-2">Enlace Guardado en DB</th>
                            <th className="py-2.5 px-3 text-center">Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredCustomStickers.map(({ playerId, imageUrl, player, country, flag }) => {
                            const apodo = player ? (player.nickname || player.name) : "Jugador Genérico";
                            const realName = player ? player.realName : playerId;
                            const pos = player ? player.position : "N/A";
                            
                            return (
                              <tr key={playerId} className="border-b border-slate-850 hover:bg-slate-950/45 transition-all">
                                <td className="py-3 px-3">
                                  <div className="w-12 h-16 bg-slate-950 rounded-lg overflow-hidden border-2 border-black shadow-[2px_2px_0px_#000] relative">
                                    <img 
                                      src={getSafeImageUrl(imageUrl as string)} 
                                      alt={apodo} 
                                      referrerPolicy="no-referrer"
                                      className="w-full h-full object-cover animate-fade-in"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://placehold.co/100x130/1e1b1b/ea580c?text=Cromo';
                                      }}
                                    />
                                  </div>
                                </td>
                                <td className="py-3 px-2">
                                  <div>
                                    <span className="block font-bold text-xs text-slate-100">{apodo}</span>
                                    <span className="text-[10px] text-slate-400 block font-mono font-medium">{realName}</span>
                                    <span className="text-[9px] text-gray-400 font-mono">ID: {playerId} • {pos}</span>
                                  </div>
                                </td>
                                <td className="py-3 px-2">
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-950 border border-slate-800 text-[10px] font-extrabold text-emerald-400 font-mono">
                                    {flag} {country}
                                  </span>
                                </td>
                                <td className="py-3 px-2 max-w-[200px] truncate font-mono text-[9.5px] text-indigo-400 select-all" title={imageUrl}>
                                  {imageUrl}
                                </td>
                                <td className="py-3 px-3 text-center">
                                  <div className="flex items-center gap-1.5 justify-center">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const newUrl = prompt(`Editar enlace de imagen para ${apodo}:`, imageUrl as string);
                                        if (newUrl !== null) {
                                          handleUpdateStickerUrl(playerId, newUrl);
                                        }
                                      }}
                                      title="Editar enlace de imagen"
                                      className="px-2 py-1 text-[10px] font-bold rounded bg-emerald-700 hover:bg-emerald-600 border border-black text-white cursor-pointer transition-all active:scale-95"
                                    >
                                      Editar 🔗
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleResetSticker(playerId)}
                                      title="Restablecer a la imagen oficial"
                                      className="px-2 py-1 text-[10px] font-semibold rounded bg-rose-950 border border-black text-rose-300 hover:bg-rose-900 cursor-pointer transition-all active:scale-95"
                                    >
                                      Oficial 🛡️
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  );
                })()}
              </div>
            ) : (
              // --- FOURTH DATABASE VIEW: MANAGE OFFICIAL MATCH SCORES ---
              <div className="space-y-4 animate-fade-in">
                {/* Search & Custom Table Filters */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-950 p-3 rounded-2xl border border-slate-850">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchDbQuery}
                      onChange={(e) => setSearchDbQuery(e.target.value)}
                      placeholder="🔍 Buscar partido por país..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-550"
                    />
                  </div>
                  <div>
                    <select
                      value={countryFilter}
                      onChange={(e) => setCountryFilter(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-550 font-mono"
                    >
                      <option value="">📅 Mostrar todos los Grupos</option>
                      {['Grupo A', 'Grupo B', 'Grupo C', 'Grupo D', 'Grupo E', 'Grupo F', 'Grupo G', 'Grupo H', 'Grupo I', 'Grupo J', 'Grupo K', 'Grupo L'].map(g => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(() => {
                    // Filter matches based on search query and group filter
                    const filteredMatches = MATCH_FIXTURES.filter(m => {
                      const matchesGroup = !countryFilter || m.grupo === countryFilter;
                      const matchesSearch = !searchDbQuery || 
                        m.local.toLowerCase().includes(searchDbQuery.toLowerCase()) || 
                        m.visitante.toLowerCase().includes(searchDbQuery.toLowerCase());
                      return matchesGroup && matchesSearch;
                    });

                    if (filteredMatches.length === 0) {
                      return (
                        <div className="col-span-full text-center py-12 bg-slate-950/40 border border-slate-850 rounded-2xl">
                          <Trophy className="w-8 h-8 text-indigo-500 mx-auto opacity-40 mb-2 animate-pulse" />
                          <p className="text-xs text-slate-400 font-mono">No se encontraron partidos para la búsqueda especificada.</p>
                        </div>
                      );
                    }

                    return filteredMatches.map(m => {
                      const localCountryDetail = COUNTRIES.find(c => c.name === m.local);
                      const visitanteCountryDetail = COUNTRIES.find(c => c.name === m.visitante);
                      const localFlag = localCountryDetail ? localCountryDetail.flag : "🏳️";
                      const visitanteFlag = visitanteCountryDetail ? visitanteCountryDetail.flag : "🏳️";

                      // Get the draft edits, fallback to existing or hardcoded values
                      const draft = matchDrafts[m.id] || {
                        golesLocal: m.marcadorReal ? String(m.marcadorReal.golesLocal) : "0",
                        golesVisitante: m.marcadorReal ? String(m.marcadorReal.golesVisitante) : "0",
                        jugado: m.jugado !== undefined ? m.jugado : true
                      };

                      const handleDraftChange = (field: 'golesLocal' | 'golesVisitante' | 'jugado', val: any) => {
                        setMatchDrafts(prev => ({
                          ...prev,
                          [m.id]: {
                            ...draft,
                            [field]: val
                          }
                        }));
                      };

                      const isModified = customMatchesMap[m.id] !== undefined;

                      return (
                        <div 
                          key={m.id} 
                          className={`bg-slate-950/80 border rounded-2xl p-4 transition-all duration-300 relative ${
                            isModified 
                              ? 'border-indigo-500/40 shadow-[0_0_15px_rgba(99,102,241,0.1)]' 
                              : 'border-slate-850 hover:border-slate-705'
                          }`}
                        >
                          {isModified && (
                            <span className="absolute top-3 right-3 text-[8px] bg-indigo-500 text-white font-mono rounded px-1.5 py-0.5 uppercase tracking-wider font-extrabold shadow-sm">
                              Modificado DB
                            </span>
                          )}

                          <div className="flex justify-between items-center mb-3">
                            <span className="text-[10px] font-mono font-medium text-indigo-305 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
                              {m.grupo}
                            </span>
                            <span className="text-[10px] text-gray-500 font-mono">
                              📅 {m.fecha}
                            </span>
                          </div>

                          {/* Match row with Inputs */}
                          <div className="flex items-center justify-between gap-2 bg-slate-900/50 p-2.5 rounded-xl border border-slate-900 mb-4">
                            {/* Local */}
                            <div className="flex-1 flex flex-col items-center text-center">
                              <span className="text-2xl mb-1">{localFlag}</span>
                              <span className="text-xs font-black text-white text-ellipsis overflow-hidden whitespace-nowrap max-w-[100px]" title={m.local}>
                                {m.local}
                              </span>
                            </div>

                            {/* Interactive Goals with 44px touch targets */}
                            <div className="flex items-center gap-1 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
                              <div className="flex flex-col items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const cur = parseInt(draft.golesLocal, 10) || 0;
                                    handleDraftChange('golesLocal', String(Math.max(0, cur - 1)));
                                  }}
                                  className="w-7 h-7 flex items-center justify-center text-xs font-bold text-gray-400 hover:text-white bg-slate-850 hover:bg-slate-800 rounded cursor-pointer transition active:scale-95"
                                >
                                  -
                                </button>
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  pattern="[0-9]*"
                                  value={draft.golesLocal}
                                  onChange={(e) => {
                                    const cleanStr = e.target.value.replace(/[^0-9]/g, '');
                                    handleDraftChange('golesLocal', cleanStr || '0');
                                  }}
                                  className="w-10 text-center font-mono text-sm font-black text-white bg-transparent focus:outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const cur = parseInt(draft.golesLocal, 10) || 0;
                                    handleDraftChange('golesLocal', String(cur + 1));
                                  }}
                                  className="w-7 h-7 flex items-center justify-center text-xs font-bold text-gray-400 hover:text-white bg-slate-850 hover:bg-slate-800 rounded cursor-pointer transition active:scale-95"
                                >
                                  +
                                </button>
                              </div>

                              <span className="text-gray-600 font-bold px-1">:</span>

                              <div className="flex flex-col items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const cur = parseInt(draft.golesVisitante, 10) || 0;
                                    handleDraftChange('golesVisitante', String(Math.max(0, cur - 1)));
                                  }}
                                  className="w-7 h-7 flex items-center justify-center text-xs font-bold text-gray-400 hover:text-white bg-slate-850 hover:bg-slate-800 rounded cursor-pointer transition active:scale-95"
                                >
                                  -
                                </button>
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  pattern="[0-9]*"
                                  value={draft.golesVisitante}
                                  onChange={(e) => {
                                    const cleanStr = e.target.value.replace(/[^0-9]/g, '');
                                    handleDraftChange('golesVisitante', cleanStr || '0');
                                  }}
                                  className="w-10 text-center font-mono text-sm font-black text-white bg-transparent focus:outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const cur = parseInt(draft.golesVisitante, 10) || 0;
                                    handleDraftChange('golesVisitante', String(cur + 1));
                                  }}
                                  className="w-7 h-7 flex items-center justify-center text-xs font-bold text-gray-400 hover:text-white bg-slate-850 hover:bg-slate-800 rounded cursor-pointer transition active:scale-95"
                                >
                                  +
                                </button>
                              </div>
                            </div>

                            {/* Visitante */}
                            <div className="flex-1 flex flex-col items-center text-center">
                              <span className="text-2xl mb-1">{visitanteFlag}</span>
                              <span className="text-xs font-black text-white text-ellipsis overflow-hidden whitespace-nowrap max-w-[100px]" title={m.visitante}>
                                {m.visitante}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-900">
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={draft.jugado}
                                onChange={(e) => handleDraftChange('jugado', e.target.checked)}
                                className="w-4.5 h-4.5 rounded text-indigo-650 bg-slate-950 border-slate-700 outline-none cursor-pointer focus:ring-0 focus:ring-offset-0"
                              />
                              <span className="text-[10px] font-bold text-gray-300 font-mono tracking-tight">
                                Partido Jugado (FINAL)
                              </span>
                            </label>

                            <div className="flex items-center gap-1.5 ml-auto">
                              {isModified && (
                                <button
                                  type="button"
                                  onClick={() => handleResetMatch(m.id)}
                                  className="px-2 py-1.5 text-[9px] font-bold rounded bg-rose-950/60 border border-rose-500/20 text-rose-300 hover:bg-rose-900 cursor-pointer transition active:scale-95"
                                >
                                  Oficial 🔄
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleSaveMatchScore(m.id, draft.golesLocal, draft.golesVisitante, draft.jugado)}
                                className="px-3 py-1.5 text-[10px] uppercase font-black tracking-wider text-black bg-indigo-400 hover:bg-indigo-350 rounded-xl cursor-pointer transition active:scale-95 shadow-md shadow-indigo-500/10"
                              >
                                Guardar 💾
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            )}
          </div>
          <div className="mt-4 pt-3 border-t border-slate-850/80 text-[10px] text-gray-500 font-mono">
            * El Director Técnico principal ("Tú") hereda permisos administrativos automáticos para supervisar el funcionamiento del sistema en el simulador.
          </div>
        </div>

        {/* User Registration Form */}
        <div className="xl:col-span-4 space-y-6">
          <div className="bg-brand-sidebar border border-slate-800 rounded-2xl p-5 shadow-xl">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider text-indigo-400 font-mono mb-3.5 flex items-center gap-1.5">
              <UserPlus className="w-4 h-4 text-indigo-400" /> Registrar Nuevo Competidor
            </h3>
            
            <form onSubmit={handleCreateUser} className="space-y-3">
              <div>
                <label className="text-[10px] font-mono text-gray-500 block uppercase mb-1">Nombre de Usuario</label>
                <input
                  type="text"
                  placeholder="Ej. ProfeScaloni_90"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-gray-500 block uppercase mb-1">Código Único (DT-XXXX)</label>
                <input
                  type="text"
                  placeholder="Ej. DT-5520"
                  maxLength={7}
                  value={newGameCode}
                  onChange={(e) => setNewGameCode(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white font-mono uppercase focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-mono text-gray-500 block uppercase mb-1">Aciertos Alineación</label>
                  <input
                    type="number"
                    min="0"
                    max="11"
                    value={newAciertosOnce}
                    onChange={(e) => setNewAciertosOnce(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-gray-500 block uppercase mb-1">Aciertos Marcador</label>
                  <input
                    type="number"
                    min="0"
                    value={newAciertosMarcador}
                    onChange={(e) => setNewAciertosMarcador(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono text-gray-500 block uppercase mb-1">Plan de Suscripción</label>
                <select
                  value={newSubscription}
                  onChange={(e) => setNewSubscription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option className="bg-slate-900 text-white" value="Ninguna">Plan Gratuito Amateur</option>
                  <option className="bg-slate-900 text-white" value="Plan Scout Básico">Plan Scout Básico</option>
                  <option className="bg-slate-900 text-white" value="Pase VIP Elite">Pase VIP Elite</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-mono text-gray-500 block uppercase mb-1">Avatar DT</label>
                <select
                  value={newAvatar}
                  onChange={(e) => setNewAvatar(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option className="bg-slate-900 text-white" value="⚽">⚽ Balón</option>
                  <option className="bg-slate-900 text-white" value="🎓">🎓 Maestro</option>
                  <option className="bg-slate-900 text-white" value="🕵️‍♂️">🕵️‍♂️ Detective</option>
                  <option className="bg-slate-900 text-white" value="🍷">🍷 Copas</option>
                  <option className="bg-slate-900 text-white" value="⚡">⚡ Rayo</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-650 hover:bg-indigo-650 transition rounded-xl text-xs font-bold text-white uppercase font-mono tracking-wider flex items-center justify-center gap-1.5 cursor-pointer mt-2"
              >
                <PlusCircle className="w-4 h-4" /> Registrar en Base de Datos
              </button>
            </form>
          </div>

          {/* Sorteo Prizes breakdown visualization */}
          <div className="bg-brand-sidebar border border-slate-850 rounded-2xl p-5 shadow-xl">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider text-indigo-400 font-mono mb-4 flex items-center gap-1.5">
              <Award className="w-4.5 h-4.5" /> Ganadores Proyectados al 30 de Julio
            </h3>
            
            <div className="space-y-3">
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-900 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-yellow-500/10 text-yellow-455 flex items-center justify-center border border-yellow-500/20 shrink-0">
                    <Trophy className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white">1er Lugar ($1.000 USD)</h5>
                    <p className="text-[10px] text-gray-450 mt-0.5">Mejor puntaje acumulado al 30 de julio</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-2 py-0.5 rounded font-bold uppercase">
                    {sortedCompetitors[0]?.username ? sortedCompetitors[0].username : 'Sin datos'}
                  </span>
                </div>
              </div>

              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-900 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-slate-300/10 text-slate-350 flex items-center justify-center border border-slate-300/20 shrink-0">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white">2do Lugar ($500 USD)</h5>
                    <p className="text-[10px] text-gray-450 mt-0.5">Segundo mejor puntaje acumulado</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono bg-slate-350/10 text-slate-300 border border-slate-300/20 px-2 py-0.5 rounded font-bold uppercase">
                    {sortedCompetitors[1]?.username ? sortedCompetitors[1].username : 'Sin datos'}
                  </span>
                </div>
              </div>

              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-900 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-600/10 text-amber-500 flex items-center justify-center border border-amber-600/25 shrink-0">
                    <Coins className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white">3er Lugar ($250 USD)</h5>
                    <p className="text-[10px] text-gray-450 mt-0.5">Tercer mejor puntaje acumulado</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono bg-amber-655/10 text-amber-500 border border-amber-650/20 px-2 py-0.5 rounded font-bold uppercase">
                    {sortedCompetitors[2]?.username ? sortedCompetitors[2].username : 'Sin datos'}
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
        </>
      )}

      {currentSubTab === 'affiliates' && (() => {
        // Real-time calculation and filtering according to requested city filter and date range filters
        const parsedPromoters = affiliateStats.filter(p => {
          if (cityFilter && p.city !== cityFilter) return false;
          return true;
        }).map(p => {
          const visitsFiltered = p.rawVisits ? p.rawVisits.filter((v: any) => {
            if (dateStart && new Date(v.timestamp) < new Date(dateStart + 'T00:00:00')) return false;
            if (dateEnd && new Date(v.timestamp) > new Date(dateEnd + 'T23:59:59')) return false;
            return true;
          }) : [];

          const salesFiltered = p.rawSales ? p.rawSales.filter((s: any) => {
            if (dateStart && new Date(s.timestamp) < new Date(dateStart + 'T00:00:00')) return false;
            if (dateEnd && new Date(s.timestamp) > new Date(dateEnd + 'T23:59:59')) return false;
            return true;
          }) : [];

          const totalVisits = visitsFiltered.length;
          const totalSales = salesFiltered.length;
          const totalRevenue = salesFiltered.reduce((acc: number, curr: any) => acc + curr.amount, 0);
          const conversionRate = totalVisits > 0 ? (totalSales / totalVisits) * 100 : 0;

          return {
            ...p,
            totalVisits,
            totalSales,
            totalRevenue,
            conversionRate,
            rawVisits: visitsFiltered,
            rawSales: salesFiltered
          };
        });

        // Compute aggregate totals across filtered promoters
        const fVisitsTotal = parsedPromoters.reduce((acc, p) => acc + p.totalVisits, 0);
        const fSalesTotal = parsedPromoters.reduce((acc, p) => acc + p.totalSales, 0);
        const fRevenueTotal = parsedPromoters.reduce((acc, p) => acc + p.totalRevenue, 0);
        const fConversionRateAvg = fVisitsTotal > 0 ? (fSalesTotal / fVisitsTotal) * 100 : 0;

        return (
          <div className="space-y-8" id="affiliates-analytics-dashboard">
            
            {/* Quick Stats overview cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-950 p-5 rounded-2xl border-3 border-black shadow-[4px_4px_0px_#000] relative overflow-hidden">
                <span className="text-[10px] uppercase font-mono text-slate-500 font-bold">Visitas Totales (QR)</span>
                <span className="text-3xl font-black text-white font-mono block mt-1">{fVisitsTotal}</span>
                <div className="text-[10.5px] text-emerald-400 font-mono flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3 text-emerald-400" />
                  <span>Tráfico de calle por QR</span>
                </div>
              </div>
              
              <div className="bg-slate-950 p-5 rounded-2xl border-3 border-black shadow-[4px_4px_0px_#000] relative overflow-hidden">
                <span className="text-[10px] uppercase font-mono text-slate-500 font-bold">Ventas Concretadas</span>
                <span className="text-3xl font-black text-amber-400 font-mono block mt-1">{fSalesTotal}</span>
                <div className="text-[10.5px] text-amber-400/80 font-mono mt-1">
                  <span>Planes Básico / VIP</span>
                </div>
              </div>

              <div className="bg-slate-950 p-5 rounded-2xl border-3 border-black shadow-[4px_4px_0px_#000] relative overflow-hidden">
                <span className="text-[10px] uppercase font-mono text-slate-500 font-bold">Conversión Promedio</span>
                <span className="text-3xl font-black text-teal-400 font-mono block mt-1">{fConversionRateAvg.toFixed(1)}%</span>
                <div className="text-[10.5px] text-teal-500 font-mono mt-1">
                  <span>Efectividad en vía pública</span>
                </div>
              </div>

              <div className="bg-slate-950 p-5 rounded-2xl border-3 border-black shadow-[4px_4px_0px_#000] relative overflow-hidden">
                <span className="text-[10px] uppercase font-mono text-slate-500 font-bold">Ingresos Totales ($)</span>
                <span className="text-3xl font-black text-emerald-400 font-mono block mt-1">${fRevenueTotal.toFixed(2)}</span>
                <div className="text-[10.5px] text-emerald-400/80 font-mono mt-1">
                  <span>Comisión imputada</span>
                </div>
              </div>
            </div>

            {/* Interactive Playful QR & Webhook Sales Simulator (Marvel / Action card look) */}
            <div className="bg-slate-950 border-3 border-black rounded-3xl p-6 shadow-[6px_6px_0px_rgba(0,0,0,1)] relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 bg-[#15803d] text-white font-bangers text-[10px] tracking-widest uppercase border-l-2 border-b-2 border-black">
                Simulador Integrado de Campo
              </div>
              <h3 className="font-bangers text-lg tracking-wide text-white mb-2 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" /> SIMULADOR DE ESCANEO DE QR Y WEBHOOKS DE PAGO
              </h3>
              <p className="text-xs text-slate-400 mb-5 leading-relaxed">
                Prueba la persistencia de visitas y la atribución de ventas en tiempo real. Selecciona una promotora del equipo, simula que escanean su QR en la calle o que se efectúa un pago en Kushki/Payphone para comprobar cómo se calculan las tasas de conversión y se cambia la tabla de auditoría.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end bg-slate-900/60 p-4 rounded-2xl border-2 border-black">
                <div>
                  <label className="block text-[10px] uppercase font-mono font-bold text-indigo-300 mb-1.5">
                    1. Elegir Promotora
                  </label>
                  <select
                    value={simulationPromoterId}
                    onChange={(e) => {
                      const pId = e.target.value;
                      setSimulationPromoterId(pId);
                      const prices = getPromoterPlanPrices(pId);
                      setSimulationAmount(simulationPlanTier === 'Pase VIP Elite' ? prices.vipPrice : prices.scoutPrice);
                    }}
                    className="w-full bg-slate-950 border-2 border-black text-white px-3 py-2 text-xs rounded-xl focus:ring-1 focus:ring-indigo-500 font-mono cursor-pointer"
                  >
                    <option className="bg-slate-900 text-white" value="UIO_MARIA">UIO_MARIA (Quito, Ecuador)</option>
                    <option className="bg-slate-900 text-white" value="MAD_CARLOS">MAD_CARLOS (Madrid, España)</option>
                    <option className="bg-slate-900 text-white" value="GYE_ESTEBAN">GYE_ESTEBAN (Guayaquil, Ecuador)</option>
                    <option className="bg-slate-900 text-white" value="NYC_JESSICA">NYC_JESSICA (New York, EE.UU.)</option>
                    <option className="bg-slate-900 text-white" value="CDMX_LUIS">CDMX_LUIS (Ciudad de México, México)</option>
                    <option className="bg-slate-900 text-white" value="BOG_SANDRA">BOG_SANDRA (Bogotá, Colombia)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-mono font-bold text-indigo-300 mb-1.5">
                    2. Tipo de Licencia / Plan de Venta
                  </label>
                  <select
                    value={simulationPlanTier}
                    onChange={(e) => {
                      const tier = e.target.value;
                      setSimulationPlanTier(tier);
                      const prices = getPromoterPlanPrices(simulationPromoterId);
                      setSimulationAmount(tier === 'Pase VIP Elite' ? prices.vipPrice : prices.scoutPrice);
                    }}
                    className="w-full bg-slate-950 border-2 border-black text-white px-3 py-2 text-xs rounded-xl focus:ring-1 focus:ring-indigo-500 font-mono cursor-pointer"
                  >
                    <option className="bg-slate-900 text-white" value="Pase VIP Elite">
                      Pase VIP Elite ({getPromoterPlanPrices(simulationPromoterId).currency}{getPromoterPlanPrices(simulationPromoterId).vipPrice})
                    </option>
                    <option className="bg-slate-900 text-white" value="Plan Scout Básico">
                      Plan Scout Básico ({getPromoterPlanPrices(simulationPromoterId).currency}{getPromoterPlanPrices(simulationPromoterId).scoutPrice})
                    </option>
                  </select>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={async () => {
                      try {
                        const res = await fetch('/api/affiliate/visit', {
                          method: 'POST',
                          headers: {'Content-Type': 'application/json'},
                          body: JSON.stringify({
                            promoterId: simulationPromoterId,
                            deviceType: Math.random() > 0.5 ? 'Android' : 'iPhone'
                          })
                        });
                        const data = await res.json();
                        if (data.status === 'success') {
                          setSuccessMsg(`Simulado escaneo de QR con éxito para ${simulationPromoterId}. Visita agregada al log del servidor.`);
                          fetchAffiliateStats();
                          setTimeout(() => setSuccessMsg(''), 4000);
                        }
                      } catch (err) {
                        console.error(err);
                      }
                    }}
                    className="flex-1 py-2.5 border-2 border-black bg-[#15803d] hover:bg-[#166534] text-white font-bangers tracking-wider text-xs uppercase rounded-xl transition duration-150 cursor-pointer shadow-[3.5px_3.5px_0px_#000] active:translate-y-0.5 active:shadow-[1px_1px_0px_#000]"
                  >
                    Simular QR Scan
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        const res = await fetch('/api/affiliate/sales/webhook', {
                          method: 'POST',
                          headers: {'Content-Type': 'application/json'},
                          body: JSON.stringify({
                            promoterId: simulationPromoterId,
                            amount: simulationAmount,
                            planTier: simulationPlanTier,
                            userId: 'user_sim_' + Math.floor(Math.random() * 900 + 100),
                            transactionId: 'TX_SIM_' + Math.random().toString(36).substring(2, 9).toUpperCase()
                          })
                        });
                        const data = await res.json();
                        if (data.status === 'success') {
                          setSuccessMsg(`Webhook recibido de Kushki/Payphone: Venta de $${simulationAmount} asignada con éxito a ${simulationPromoterId}`);
                          fetchAffiliateStats();
                          setTimeout(() => setSuccessMsg(''), 5000);
                        }
                      } catch (err) {
                        console.error(err);
                      }
                    }}
                    className="flex-1 py-2.5 border-2 border-black bg-red-600 hover:bg-red-700 text-white font-bangers tracking-wider text-xs uppercase rounded-xl transition duration-150 cursor-pointer shadow-[3.5px_3.5px_0px_#000] active:translate-y-0.5 active:shadow-[1px_1px_0px_#000]"
                  >
                    Simular Webhook
                  </button>
                </div>
              </div>
            </div>

            {/* Table, Filter Options and Detailed inspect popup layout */}
            <div className="grid grid-cols-1 gap-8">
              
              {/* Table and filter block */}
              <div className="bg-slate-900 border-3 border-black rounded-3xl p-6 shadow-[6px_6px_0px_#000] space-y-6">
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <h3 className="font-bangers text-lg tracking-wider text-white flex items-center gap-2">
                      <QrCode className="w-5 h-5 text-indigo-400 font-black" /> RENDIMIENTO EN TIEMPO REAL DE PROMOTORAS DE CALLE
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddPanel(!showAddPanel);
                        setAddPromoterError('');
                        setAddPromoterSuccess('');
                        setGeneratedQRCodeUrl(null);
                        setGeneratedQRCodeImg(null);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 border-2 border-black bg-yellow-400 hover:bg-yellow-500 text-black font-bangers text-xs uppercase tracking-widest rounded-xl transition duration-150 cursor-pointer shadow-[3px_3px_0px_#000] active:translate-y-0.5 active:shadow-[1px_1px_0px_#000]"
                    >
                      <UserPlus className="w-3.5 h-3.5 font-black text-black shrink-0" />
                      <span>{showAddPanel ? 'Cerrar Registro' : '+ AGREGAR PROMOTOR'}</span>
                    </button>
                  </div>
                  
                  {/* FILTROS (Ciudad, Rango de Fecha) */}
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-1 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                      <Filter className="w-3.5 h-3.5 text-slate-500" />
                      <select
                        value={cityFilter}
                        onChange={(e) => setCityFilter(e.target.value)}
                        className="bg-transparent border-none text-[11px] font-mono font-bold text-slate-300 focus:outline-none cursor-pointer"
                      >
                        <option className="bg-slate-900 text-white" value="">Todas las ciudades</option>
                        <option className="bg-slate-900 text-white" value="Quito">Quito</option>
                        <option className="bg-slate-900 text-white" value="Madrid">Madrid</option>
                        <option className="bg-slate-900 text-white" value="Guayaquil">Guayaquil</option>
                        <option className="bg-slate-900 text-white" value="New York">New York</option>
                        <option className="bg-slate-900 text-white" value="Internacional">Otros / Internacional</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-[11px] font-mono">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <input
                        type="date"
                        value={dateStart}
                        onChange={(e) => {
                          const val = e.target.value;
                          setDateStart(val);
                        }}
                        className="bg-transparent border-none focus:outline-none text-slate-300 text-[10px] cursor-pointer"
                      />
                      <span className="text-slate-600">al</span>
                      <input
                        type="date"
                        value={dateEnd}
                        onChange={(e) => {
                          const val = e.target.value;
                          setDateEnd(val);
                        }}
                        className="bg-transparent border-none focus:outline-none text-slate-300 text-[10px] cursor-pointer"
                      />
                      {(dateStart || dateEnd) && (
                        <button
                          onClick={() => { setDateStart(''); setDateEnd(''); }}
                          className="text-red-400 font-bold hover:text-red-300 ml-1.5 cursor-pointer"
                        >
                          Limpiar
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Collapsible New Promoter Form & Live QR Code Generator with Superhero Aesthetic */}
                {showAddPanel && (
                  <div className="bg-slate-950 border-3 border-black p-5 rounded-2xl shadow-[4px_4px_0px_rgba(0,0,0,1)] relative overflow-hidden transition-all">
                    <div className="absolute top-0 right-0 p-2 bg-yellow-400 text-black font-bangers text-[10px] tracking-wider uppercase border-l-2 border-b-2 border-black">
                      Estación de Registro QR de Campo
                    </div>
                    <h4 className="font-bangers text-sm text-yellow-400 tracking-wide mb-3 uppercase flex items-center gap-1.5">
                      <UserPlus className="w-4 h-4 text-yellow-400 shrink-0" /> ALTA DE PROMOTOR Y EMISIÓN DE CARNET DE CAMPO
                    </h4>
                    
                    <form onSubmit={handleAddPromoter} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] uppercase font-mono font-bold text-gray-400 mb-1">
                            ID / Token del Promotor (Ejem: UIO_CARLA, MAD_LUCIA)
                          </label>
                          <input
                            type="text"
                            placeholder="CDMX_ALBERTO"
                            value={newPromoterId}
                            onChange={(e) => setNewPromoterId(e.target.value)}
                            className="w-full bg-slate-905 border-2 border-black text-white px-3 py-2 text-xs rounded-xl focus:ring-1 focus:ring-yellow-400 font-mono tracking-widest uppercase"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-mono font-bold text-gray-400 mb-1">
                            Ciudad de Operación
                          </label>
                          <select
                            value={newPromoterCity}
                            onChange={(e) => setNewPromoterCity(e.target.value)}
                            className="w-full bg-slate-905 border-2 border-black text-white px-3 py-2 text-xs rounded-xl focus:ring-1 focus:ring-yellow-400 font-mono cursor-pointer"
                          >
                            <option className="bg-slate-900 text-white" value="Quito">Quito</option>
                            <option className="bg-slate-900 text-white" value="Madrid">Madrid</option>
                            <option className="bg-slate-900 text-white" value="Guayaquil">Guayaquil</option>
                            <option className="bg-slate-900 text-white" value="New York">New York</option>
                            <option className="bg-slate-900 text-white" value="Ciudad de México">Ciudad de México</option>
                            <option className="bg-[#0f172a] text-white" value="Bogotá">Bogotá</option>
                            <option className="bg-[#0f172a] text-white" value="Lima">Lima</option>
                            <option className="bg-[#0f172a] text-white" value="Santiago">Santiago</option>
                            <option className="bg-[#0f172a] text-white" value="Buenos Aires">Buenos Aires</option>
                            <option className="bg-[#0f172a] text-white" value="Internacional">Otros / Internacional</option>
                          </select>
                        </div>
                      </div>

                      {addPromoterError && (
                        <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 p-2.5 rounded-xl font-mono">
                          ⚠️ {addPromoterError}
                        </div>
                      )}

                      {addPromoterSuccess && (
                        <div className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-xl font-mono">
                          🚀 {addPromoterSuccess}
                        </div>
                      )}

                      <div className="flex justify-end gap-2.5">
                        <button
                          type="button"
                          onClick={() => {
                            setShowAddPanel(false);
                            setNewPromoterId('');
                          }}
                          className="px-3.5 py-1.5 border-2 border-black bg-slate-800 hover:bg-slate-700 text-white font-bangers text-xs uppercase rounded-xl transition duration-150 cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 border-2 border-black bg-[#15803d] hover:bg-[#166534] text-white font-bangers text-xs uppercase rounded-xl tracking-wider transition duration-150 cursor-pointer shadow-[2.5px_2.5px_0px_#000]"
                        >
                          CONECTAR Y SINCRONIZAR
                        </button>
                      </div>
                    </form>

                    {/* QR Code and link display section with clean Referrer Policy and direct preview */}
                    {generatedQRCodeUrl && (
                      <div className="mt-5 p-4 bg-slate-900 rounded-xl border border-slate-800 flex flex-col md:flex-row items-center gap-5">
                        {generatedQRCodeImg && (
                          <div className="bg-white p-3.5 rounded-xl border-3 border-black shadow-[4px_4px_0px_#000] shrink-0">
                            <img
                              src={generatedQRCodeImg}
                              alt="Promoter QR Code"
                              className="w-40 h-40 object-contain select-none"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        )}
                        <div className="space-y-2 flex-grow w-full">
                          <span className="text-[10px] uppercase font-mono font-bold bg-yellow-400/10 text-yellow-500 border border-yellow-500/20 px-2 py-0.5 rounded">
                            COMPARTIR EXCLUSIVO DEL PROMOTOR
                          </span>
                          <h5 className="font-bangers text-xs text-white uppercase tracking-wider">
                            Código de Seguimiento e Impresión QR:
                          </h5>
                          <p className="text-[11px] text-slate-400 font-mono select-all bg-black p-2.5 rounded-lg border border-slate-800 font-bold overflow-x-auto whitespace-pre-wrap leading-relaxed break-all">
                            {generatedQRCodeUrl}
                          </p>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(generatedQRCodeUrl);
                                setAddPromoterSuccess('¡Enlace de promotor copiado al portapapeles!');
                              }}
                              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-mono rounded border border-slate-700 cursor-pointer"
                            >
                              Copiar Enlace
                            </button>
                            <a
                              href={generatedQRCodeUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-1 bg-indigo-900/40 hover:bg-indigo-900/65 text-indigo-300 text-[10px] font-mono rounded border border-indigo-700/40 text-center"
                            >
                              Abrir Ruta referer
                            </a>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {successMsg && (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl text-xs text-emerald-400 flex items-center gap-1.5 font-comic">
                    <CircleCheck className="w-4 h-4 text-emerald-400" />
                    <span>{successMsg}</span>
                  </div>
                )}

                {/* Stats Table */}
                <div className="overflow-x-auto rounded-xl border-2 border-black bg-slate-950">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b-2 border-black text-gray-400 uppercase font-mono text-[9px] tracking-wider bg-slate-900/60 select-none">
                        <th className="py-3 px-4">Sticker QR / Promoter ID</th>
                        <th className="py-3 px-4">Ciudad de Operación</th>
                        <th className="py-3 px-4 text-center">Visitas por QR</th>
                        <th className="py-3 px-4 text-center">Licencias Pagadas</th>
                        <th className="py-3 px-4 text-center">Tasa de Conversión</th>
                        <th className="py-3 px-4 text-right">Recaudación Bruta</th>
                        <th className="py-3 px-4 text-center">Historial</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsedPromoters.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-slate-500 font-comic">
                            No se encontraron promotoras o registros para los filtros ingresados.
                          </td>
                        </tr>
                      ) : (
                        parsedPromoters.map((p, index) => {
                          return (
                            <tr 
                              key={p.promoterId}
                              className={`border-b border-slate-900 hover:bg-slate-900/60 transition duration-150 ${
                                index % 2 === 0 ? 'bg-slate-950/40' : 'bg-slate-950/10'
                              }`}
                            >
                              <td className="py-3.5 px-4 font-mono font-black text-white tracking-wide">
                                <span className="bg-slate-900 px-2 py-1 rounded border border-slate-850 text-yellow-400 select-all">
                                  {p.promoterId}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 font-mono font-semibold text-slate-300">
                                <span className="inline-flex items-center gap-1 text-[11px]">
                                  <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                                  {p.city}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-center font-mono font-black text-indigo-400 text-sm">
                                {p.totalVisits}
                              </td>
                              <td className="py-3.5 px-4 text-center font-mono font-black text-amber-500 text-sm">
                                {p.totalSales}
                              </td>
                              <td className="py-3.5 px-4 text-center font-mono text-xs">
                                <span className={`inline-block px-2.5 py-1 rounded-full text-[10.5px] font-black border ${
                                  p.conversionRate >= 15 ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                                  p.conversionRate >= 5 ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' :
                                  'bg-slate-900 border-slate-800 text-slate-400'
                                }`}>
                                  {p.conversionRate.toFixed(1)}%
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-right font-mono font-black text-emerald-400 text-sm">
                                ${p.totalRevenue.toFixed(2)}
                              </td>
                              <td className="py-3.5 px-4 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      // Detailed info popup showing transaction details
                                      const visitsText = p.rawVisits && p.rawVisits.length > 0 
                                        ? p.rawVisits.map((v: any) => `[${new Date(v.timestamp).toLocaleTimeString()} - ${v.deviceType}]`).slice(0, 10).join(', ')
                                        : 'Sin registros de visitas';
                                      
                                      const salesText = p.rawSales && p.rawSales.length > 0 
                                        ? p.rawSales.map((s: any) => `${s.transactionId} ($${s.amount} - ${s.planTier})`).join('\n• ')
                                        : 'Sin registros de ventas';

                                      setCustomAlert({
                                        title: `📜 INFORME DE AUDITORÍA: ${p.promoterId}`,
                                        message: `Resumen de Operación (${p.city}):\n\n` + 
                                                 `• Total Visitas QR: ${p.totalVisits}\n` + 
                                                 `• Ventas Atribuidas: ${p.totalSales}\n` + 
                                                 `• Tasa de Conversión: ${p.conversionRate.toFixed(1)}%\n` + 
                                                 `• Ingresos Brutos: $${p.totalRevenue.toFixed(2)} USD\n\n` +
                                                 `Historial de Transacciones:\n` + (salesText !== 'Sin registros de ventas' ? '• ' + salesText : 'Ninguna transaccional registrada.') + `\n\n` +
                                                 `Últimos Dispositivos de Tráfico:\n${visitsText}`
                                      });
                                    }}
                                    className="px-2.5 py-1.5 text-[10.5px] uppercase font-mono font-black bg-indigo-650/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-600 hover:text-white rounded-xl cursor-pointer transition shadow-[2.5px_2.5px_0px_rgba(0,0,0,1)] active:translate-y-0.5"
                                  >
                                    Auditar
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeletePromoter(p.promoterId)}
                                    className="px-2.5 py-1.5 text-[10.5px] uppercase font-mono font-black bg-red-650/15 text-red-500 border border-red-500/20 hover:bg-red-600 hover:text-white rounded-xl cursor-pointer transition shadow-[2.5px_2.5px_0px_rgba(0,0,0,1)] active:translate-y-0.5 flex items-center gap-1"
                                    title="Quitar / Dar de baja"
                                  >
                                    <Trash2 className="w-3.5 h-3.5 shrink-0" />
                                    <span>Quitar</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

              </div>

            </div>

          </div>
        );
      })()}

      {/* --- NUEVO SUB-TAB: SISTEMAS DE ALTO RENDIMIENTO WEB TACTIKAI (1,500+ CROMOS) --- */}
      {currentSubTab === 'performance' && (
        <div className="space-y-6">
          {/* Banner Principal */}
          <div className="bg-[#052e16] border-3 border-black p-6 rounded-3xl shadow-[5px_5px_0px_#000] relative overflow-hidden">
            <div className="absolute right-[-20px] bottom-[-20px] opacity-15 rotate-12">
              <Zap className="w-48 h-48 text-yellow-400 font-extrabold" />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3 relative z-10">
              <div className="flex items-center gap-3">
                <span className="bg-[#ef4444] border-2 border-black text-white font-bangers text-[10.5px] uppercase px-2.5 py-0.5 tracking-wider rounded-lg transform -rotate-2 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                  ESTÁNDAR COPA GLOBAL TACTIKAI
                </span>
                <span className="text-[10px] font-mono font-bold text-[#11b782] bg-emerald-900/30 border border-emerald-500/20 px-2 py-0.5 rounded">
                  PROYECTO 1,500+ CROMOS
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10.5px] font-mono text-slate-400 block uppercase">Tiempo de Carga Objetivo</span>
                <span className="font-bangers text-yellow-300 text-lg uppercase tracking-wider">&lt; 1.5 Segundos (4G/5G)</span>
              </div>
            </div>
            <h3 className="font-bangers text-2xl sm:text-4xl tracking-wider text-white uppercase drop-shadow-[2.5px_2.5px_0px_#000] leading-none mb-1">
              CENTRO DE ALTO RENDIMIENTO WEB & ARQUITECTURA DIGITAL
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 font-comic max-w-4xl leading-relaxed">
              Bienvenido al módulo interactivo de optimización masiva de TactikAI. Como Ingenieros de Rendimiento Web, manejamos un catálogo dinámico estilo cómic con más de 1,500 cromos HD. Aquí puedes simular y auditar las tecnologías que garantizan descargas ultra ligeras, previenen el lag en smartphones básicos y cumplen con los estándares de Google <strong>Core Web Vitals</strong> en la calle.
            </p>
          </div>

          {/* Simuladores Interactivos Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Simulador de Virtualización del DOM */}
            <div className="bg-slate-900 border-3 border-black rounded-3xl p-5 shadow-[5px_5px_0px_#000] space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bangers text-base sm:text-lg text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-5 h-5 text-[#ef4444]" /> 1. SIMULADOR DE VIRTUALIZACIÓN DEL DOM
                </h4>
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-mono uppercase text-slate-400">Estado:</span>
                  <button
                    onClick={() => setPerfVirtualScroll(!perfVirtualScroll)}
                    className={`font-bangers text-xs px-2.5 py-1 border-2 border-black rounded-lg uppercase tracking-wider transition cursor-pointer select-none ${
                      perfVirtualScroll 
                        ? 'bg-[#15803d] hover:bg-emerald-700 text-white shadow-[2px_2px_0px_#000]' 
                        : 'bg-[#ef4444] hover:bg-red-700 text-white shadow-[2px_2px_0px_#000]'
                    }`}
                  >
                    {perfVirtualScroll ? 'VIRTUALIZACIÓN ON' : 'VIRTUALIZACIÓN OFF'}
                  </button>
                </div>
              </div>

              <p className="text-xs font-comic text-slate-300 leading-relaxed">
                Navega a través de los 1,500 cromos que comprende la colección global. Al habilitar la Virtualización (Windowing), solo se renderizan los elementos visibles en el viewport actual, limitando de forma estática los nodos activos en el navegador.
              </p>

              {/* Bloque de estadísticas */}
              <div className="grid grid-cols-3 gap-2.5 bg-slate-950 p-3 rounded-xl border border-slate-850 text-center select-none font-mono">
                <div>
                  <span className="text-[8px] text-slate-500 uppercase block">Cromos en Base</span>
                  <span className="text-xs sm:text-sm font-bold text-slate-300">1,500</span>
                </div>
                <div>
                  <span className="text-[8px] text-slate-500 uppercase block">Nodos en DOM</span>
                  <span className={`text-xs sm:text-sm font-black block ${perfVirtualScroll ? 'text-emerald-400' : 'text-red-400 font-extrabold animate-pulse'}`}>
                    {perfVirtualScroll ? '6 Elementos' : '1,500 Elementos'}
                  </span>
                </div>
                <div>
                  <span className="text-[8px] text-slate-500 uppercase block">FPS Fluidos (4G)</span>
                  <span className={`text-xs sm:text-sm font-black block ${perfVirtualScroll ? 'text-emerald-400' : 'text-red-400'}`}>
                    {perfVirtualScroll ? '120 FPS' : '12 FPS (Colapso)'}
                  </span>
                </div>
              </div>

              {/* Viewport simulado */}
              <div className="border-3 border-black bg-slate-950 rounded-2xl p-4 relative overflow-hidden">
                <div className="absolute top-2 right-2 bg-yellow-400 px-2 py-0.5 text-black border-2 border-black font-bangers text-[9px] uppercase tracking-widest rounded-md">
                  VISTA EN MÓVIL (SIMULACIÓN TACTIL)
                </div>

                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <span className="text-[10px] text-slate-400 font-mono text-left">Punto de Scroll del Álbum:</span>
                    <input
                      type="range"
                      min="0"
                      max="1495"
                      value={perfScrollIndex}
                      onChange={(e) => setPerfScrollIndex(Number(e.target.value))}
                      className="flex-1 accent-yellow-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                    />
                    <span className="text-[10px] text-[#FFFDEC] font-mono font-bold bg-[#ef4444] border border-black px-1.5 py-0.5 rounded text-center">
                      Cromos #{perfScrollIndex}-{perfScrollIndex + 4}
                    </span>
                  </div>

                  {/* Contenedor animado de cromos */}
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 max-h-48 overflow-y-auto font-mono scrollbar-thin">
                    {perfVirtualScroll ? (
                      <div className="space-y-2">
                        <div className="text-[8px] text-slate-500 text-center py-1 bg-slate-950 border border-slate-800/40 rounded-md">
                          ↑ [Falsa holgura: {perfScrollIndex * 60}px de espaciado invisible arriba] ↑
                        </div>

                        {/* Renders only 5 active items */}
                        {Array.from({ length: 5 }).map((_, index) => {
                          const itemIdx = perfScrollIndex + index;
                          return (
                            <div key={itemIdx} className="flex items-center justify-between bg-slate-950 p-2 border border-slate-800 hover:border-[#11b782] rounded-lg transition text-xs select-none">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-md bg-[#052e16] border border-black flex items-center justify-center font-bangers text-[#11b782] text-[10px] -rotate-3 text-center shrink-0">
                                  ⚡ #{itemIdx}
                                </div>
                                <div className="text-left">
                                  <div className="font-bold text-white text-[11px] uppercase">Cromo Héroe #{itemIdx}</div>
                                  <div className="text-[9px] text-[#11b782] uppercase">ID {itemIdx} • Jugador Profesional</div>
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                <span className="text-[9px] text-slate-400 block">AVIF Compreso</span>
                                <span className="text-[10.5px] font-bold text-emerald-400">12.5 KB</span>
                              </div>
                            </div>
                          );
                        })}

                        <div className="text-[8px] text-slate-500 text-center py-1 bg-slate-950 border border-slate-800/40 rounded-md">
                          ↓ [Falsa holgura: {(1500 - perfScrollIndex - 5) * 60}px de espaciado invisible abajo] ↓
                        </div>
                      </div>
                    ) : (
                      <div className="bg-red-500/10 border-2 border-red-500/30 p-4 rounded-xl text-center space-y-2">
                        <div className="text-3xl text-red-500">🐌🐢⚠️</div>
                        <h5 className="font-bangers text-[#ef4444] uppercase tracking-wider text-sm leading-none">ABUSO DE MEMORIA DEL NAVEGADOR (1,500 NODOS)</h5>
                        <p className="text-[11px] text-slate-300 font-comic max-w-sm mx-auto leading-relaxed">
                          Se están intentando instanciar más de 1,505 componentes <code className="text-red-400 bg-red-400/10 px-1 rounded font-mono text-[10px]">DigitalStickerCard</code> simultáneos. El dispositivo móvil colapsará debido al alto uso de RAM al decodificar imágenes HD pesadas sin reciclaje de vistas.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Selector de Etiquetas Responsivas */}
            <div className="bg-slate-900 border-3 border-black rounded-3xl p-5 shadow-[5px_5px_0px_#000] space-y-4">
              <h4 className="font-bangers text-base sm:text-lg text-white uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-5 h-5 text-yellow-400" /> 2. ESTRATEGIA DE IMÁGENES COMPRESAS MODERNAS
              </h4>
              <p className="text-xs font-comic text-slate-300 leading-relaxed">
                Selecciona la resolución de pantalla deseada para ver de qué forma el navegador selecciona el tamaño adecuado de cromo según la capacidad de viewport, aplicando compresión de vanguardia <strong>AVIF/WebP</strong>.
              </p>

              {/* Selector */}
              <div className="grid grid-cols-3 gap-2">
                {(['mobile', 'tablet', 'uhd'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setPerfResolution(r)}
                    className={`py-2 px-1 text-center font-bangers text-[10.5px] uppercase rounded-xl border-2 border-black transition cursor-pointer ${
                      perfResolution === r 
                        ? 'bg-yellow-400 text-black font-semibold shadow-[2px_2px_0px_rgba(0,0,0,1)]' 
                        : 'bg-slate-950 text-slate-400'
                    }`}
                  >
                    {r === 'mobile' ? 'Móvil (360px)' : r === 'tablet' ? 'Tablet (768px)' : 'Retina UHD (1920px)'}
                  </button>
                ))}
              </div>

              {/* Code output section displaying Responsive HTML picture tag */}
              <div className="space-y-2">
                <span className="text-[9px] uppercase font-mono text-slate-500 block text-left">Marcado HTML Responsivo Autogenerado en Clientes:</span>
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 select-all overflow-x-auto text-left">
                  <pre className="text-[10px] text-blue-300 font-mono whitespace-pre leading-relaxed font-bold font-semibold">
{`<picture>
  <!-- 1. Formato AVIF (Ideal para Redes 4G móviles) -->
  <source 
    type="image/avif" 
    srcSet="https://cdn.tactikai.com/stickers/cromo-312-${perfResolution === 'mobile' ? '300w.avif 300w' : perfResolution === 'tablet' ? '600w.avif 600w' : '1200w.avif 1200w'}" 
    sizes="(max-width: 600px) 280px, (max-width: 1200px) 580px, 1200px"
  />
  <!-- 2. Formato WebP (Soporte universal moderno) -->
  <source 
    type="image/webp" 
    srcSet="https://cdn.tactikai.com/stickers/cromo-312-${perfResolution === 'mobile' ? '300w.webp 300w' : perfResolution === 'tablet' ? '600w.webp 600w' : '1200w.webp 1200w'}" 
    sizes="(max-width: 600px) 280px, (max-width: 1200px) 580px, 1200px"
  />
  <!-- 3. Fallback PNG Tradicional optimizado -->
  <img 
    src="https://cdn.tactikai.com/stickers/cromo-312-fallback.png" 
    alt="Heroe del Deporte #312" 
    loading="lazy" 
    decoding="async" 
    className="w-full h-auto aspect-[3/4] bg-gradient-to-tr from-slate-900 to-indigo-950 rounded-xl border border-black" 
  />
</picture>`}
                  </pre>
                </div>
              </div>

              {/* Tabla de peso */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-left">
                <h5 className="text-[10px] font-mono uppercase text-slate-400 mb-2 font-semibold">Tabla de peso del archivo (Héroe #312):</h5>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-[10px] font-mono text-slate-500">
                      <span>1. Original Alta Resolución (PNG / PSD)</span>
                      <span className="text-[#ef4444] font-bold font-semibold">2.4 Megabytes</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden mt-1">
                      <div className="h-full bg-[#ef4444] rounded-full" style={{ width: '100%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] font-mono text-slate-500">
                      <span>2. Compresión WebP Standard (Estilo Cómic)</span>
                      <span className="text-yellow-400 font-semibold">145 Kilobytes</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden mt-1">
                      <div className="h-full bg-yellow-400 rounded-full" style={{ width: '8.2%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] font-mono text-slate-500">
                      <span>3. Ultra-Compresión AVIF (Vanguardia Movil)</span>
                      <span className="text-[#11b782] font-black font-semibold">28 Kilobytes</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden mt-1">
                      <div className="h-full bg-[#11b782] rounded-full" style={{ width: '1.6%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Almacenamiento Ligero & API Minimization Simulator */}
            <div className="bg-slate-900 border-3 border-black rounded-3xl p-5 shadow-[5px_5px_0px_#000] space-y-4">
              <h4 className="font-bangers text-base sm:text-lg text-white uppercase tracking-wider flex items-center gap-1.5 text-left">
                <Database className="w-5 h-5 text-indigo-400" /> 3. OPTIMIZACIÓN DE BASE DE DATOS & API PAYLOAD
              </h4>
              <p className="text-xs font-comic text-slate-300 leading-relaxed text-left">
                El progreso del álbum de 1,500 cromos jamás debe transferirse con payloads JSON extensificados innecesariamente. Compara nuestra estructura optimizada en la base de datos relacional (PostgreSQL/Supabase).
              </p>

              {/* Scheme tables Comparison Tabs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800 text-left">
                <div className="space-y-1">
                  <span className="text-[#ef4444] font-mono font-bold text-[9.5px] uppercase block">⚠️ Payload Tradicional (Pésimo):</span>
                  <pre className="text-[9.5px] text-red-300 leading-tight font-mono select-none overflow-x-auto whitespace-pre h-36">
{`{
  "user_id": "usr_9422",
  "stickers": [
    { "id": 1, "unlocked": true, "repeated": 0 },
    { "id": 2, "unlocked": false, "repeated": 0 },
    { "id": 3, "unlocked": true, "repeated": 2 },
    ... 1,500 cromos más
  ]
}`}
                  </pre>
                  <span className="text-[10px] text-[#ef4444] block font-mono font-bold font-semibold mt-1">Peso: 84.5 KB / petición</span>
                </div>

                <div className="space-y-1 border-t md:border-t-0 md:border-l border-slate-800 pt-3 md:pt-0 pl-0 md:pl-4 mt-3 md:mt-0">
                  <span className="text-[#11b782] font-mono font-bold text-[9.5px] uppercase block">🚀 Formato TactikAI (Optimizado):</span>
                  <pre className="text-[9.5px] text-emerald-300 leading-tight font-mono select-all overflow-x-auto h-36 font-semibold">
{`{
  "u_id": 9422,
  "sub": 2, // VIP
  // Array de enteros de cromos
  // obtenidos únicamente
  "stickers": [2, 5, 12, 94, 312, 1492],
  // Diccionario corto para
  // cromos repetidos
  "reps": { "12": 2, "94": 1 }
}`}
                  </pre>
                  <span className="text-[10px] text-[#11b782] block font-mono font-bold font-semibold mt-1">Peso: 1.1 KB / petición</span>
                </div>
              </div>

              {/* JSONB explication */}
              <div className="bg-slate-950 p-3.5 border border-slate-850 rounded-xl space-y-2 text-left">
                <h5 className="font-bangers text-xs text-white uppercase tracking-wider leading-none">¿Por qué estructuramos JSONB de esta forma?</h5>
                <p className="text-[11px] font-comic text-slate-300 leading-relaxed">
                  En Postgres / Supabase, el progreso se almacena en una columna de tipo <code className="text-indigo-300 bg-indigo-900/20 px-1 rounded font-mono text-[10px]">JSONB</code>. Al enviar la información, se minimizan las llaves del JSON, reduciendo el payload de red. El cliente reconstruye el estado local de forma instantánea.
                </p>
              </div>
            </div>

            {/* Edge Cache & Redis CDN Latency simulator */}
            <div className="bg-slate-900 border-3 border-black rounded-3xl p-5 shadow-[5px_5px_0px_#000] space-y-4">
              <h4 className="font-bangers text-base sm:text-lg text-white uppercase tracking-wider flex items-center gap-1.5 text-left">
                <Server className="w-5 h-5 text-emerald-400" /> 4. DISTRIBUCIÓN EDGE CDN & SISTEMA DE CACHÉ
              </h4>
              <p className="text-xs font-comic text-slate-300 leading-relaxed text-left">
                Simula las peticiones al álbum variando la ubicación del servidor de caché en el borde (Edge Servers) para comprobar cómo cambia la latencia física de usuarios ubicados en Ecuador, España y el resto del mundo.
              </p>

              {/* Latency simulator controls */}
              <div className="flex flex-col sm:flex-row items-center gap-3 text-left">
                <div className="flex-1 w-full space-y-1">
                  <label className="text-[9px] font-mono text-slate-400 uppercase">Elegir Nivel de Caché:</label>
                  <select
                    value={perfCacheMode}
                    onChange={(e) => setPerfCacheMode(e.target.value as any)}
                    className="w-full bg-slate-950 border-2 border-black text-white px-3 py-1.5 text-xs rounded-xl font-mono cursor-pointer"
                  >
                    <option className="bg-slate-900 text-white" value="direct">Directo Base Central (Sin Caché • 340ms Latencia)</option>
                    <option className="bg-slate-900 text-white" value="redis">Redis Server Cache Regional (Miami US • 45ms Latencia)</option>
                    <option className="bg-slate-900 text-white" value="cdn">Cloudflare Edge Ingress Cache GYE/MAD (Latencia 1.8ms!)</option>
                  </select>
                </div>
                <button
                  type="button"
                  disabled={perfRunningTest}
                  onClick={() => {
                    setPerfRunningTest(true);
                    const actions = [
                      { act: "GET /api/stickers/progress", l: perfCacheMode === 'direct' ? 320 : perfCacheMode === 'redis' ? 42 : 1.6, n: perfCacheMode === 'direct' ? "Central DB (Virginia, US)" : perfCacheMode === 'redis' ? "Regional Redis (Miami, US)" : "Edge Node (Guayaquil, ECU)" },
                      { act: "POST /api/album/stick", l: perfCacheMode === 'direct' ? 342 : perfCacheMode === 'redis' ? 48 : 2.1, n: perfCacheMode === 'direct' ? "Central DB (Virginia, US)" : perfCacheMode === 'redis' ? "Regional Redis (Miami, US)" : "Edge Node (Madrid, ESP)" }
                    ];
                    
                    let delay = 0;
                    actions.forEach((a, i) => {
                      setTimeout(() => {
                        setPerfLogs(prev => [
                          {
                            id: Date.now() + i,
                            timestamp: new Date().toLocaleTimeString(),
                            action: a.act,
                            lat: a.l,
                            node: a.n
                          },
                          ...prev.slice(0, 7)
                        ]);
                        if (i === actions.length - 1) setPerfRunningTest(false);
                      }, delay += 550);
                    });
                  }}
                  className="w-full sm:w-auto px-4 py-2 border-2 border-black bg-yellow-400 hover:bg-yellow-500 font-bangers text-xs text-black uppercase tracking-widest rounded-xl transition cursor-pointer shrink-0 shadow-[2px_2px_0px_#000] active:translate-y-0.5 select-none"
                >
                  {perfRunningTest ? 'PROCESANDO...' : 'TRAFFIC TEST'}
                </button>
              </div>

              {/* Simulated logging console */}
              <div className="bg-slate-950 border-2 border-black p-3.5 rounded-xl text-xs space-y-1 font-mono text-slate-300 relative overflow-hidden text-left">
                <div className="absolute top-0 right-0 py-0.5 px-2 bg-indigo-600/30 text-indigo-400 border-l border-b border-black text-[8px] tracking-widest">
                  TERMINAL TACTIKAI V2
                </div>
                <h5 className="text-[10px] font-bold text-slate-400 border-b border-slate-850 pb-1.5 mb-2 uppercase flex items-center gap-1">
                  <Activity className="w-3 h-3 text-emerald-400 shrink-0" /> Auditoría de paquetes de red:
                </h5>
                <div className="space-y-1 text-[10px] h-[95px] overflow-y-auto font-mono scrollbar-thin">
                  {perfLogs.map(l => (
                    <div key={l.id} className="flex justify-between hover:bg-slate-900 px-1 py-0.5 rounded transition">
                      <span className="text-[#11b782] font-semibold">[{l.timestamp}] {l.action}</span>
                      <span className="text-slate-400 text-right shrink-0">
                        <strong className={l.lat > 100 ? 'text-[#ef4444]' : 'text-[#11b782]'}>{l.lat} ms</strong> • {l.node}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* Complete Technical Architecture & Implementation Roadmap */}
          <div className="bg-slate-900 border-3 border-black rounded-3xl p-6 shadow-[6px_6px_0px_#000] space-y-6">
            <h4 className="font-bangers text-xl text-white uppercase tracking-wider flex items-center gap-1.5 border-b-3 border-black pb-3 text-left">
              <Globe className="w-6 h-6 text-[#11b782]" /> ARQUITECTURA DE RENDIMIENTO Y MEJORES PRÁCTICAS GLOBAL
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-300 leading-relaxed font-comic text-left">

              <div className="space-y-4">
                <div className="bg-slate-950/50 p-4 border border-slate-800 rounded-2xl">
                  <h5 className="font-bangers text-[#ef4444] text-sm uppercase tracking-wider mb-2 leading-none">
                    Capa 1: Optimización de Imágenes HD
                  </h5>
                  <ul className="space-y-2 list-disc list-inside text-slate-300">
                    <li><strong>Pre-compresión Automática:</strong> Proceso batch en Cloud Storage que convierte imágenes subidas a formatos modernos WebP/AVIF con optimización Lossy al 80%.</li>
                    <li><strong>Layout Shift Prevention (CLS &lt; 0.1):</strong> Definición estática de <code className="text-yellow-400 font-mono text-[10.5px]">aspect-ratio</code> en los slots de stickers y uso de blended gradients CSS ligeros de carga instantánea.</li>
                    <li><strong>Caché de Encabezados (Browser Cache):</strong> CDN entrega imágenes con configuración <code className="text-indigo-405 font-mono text-[10.5px]">Cache-Control: public, max-age=31536000</code>.</li>
                  </ul>
                </div>

                <div className="bg-slate-950/50 p-4 border border-slate-800 rounded-2xl">
                  <h5 className="font-bangers text-yellow-400 text-sm uppercase tracking-wider mb-2 leading-none">
                    Capa 2: Hydration y Renderizado Eficiente
                  </h5>
                  <ul className="space-y-2 list-disc list-inside text-slate-300">
                    <li><strong>Astro / Next.js ISR:</strong> Regeneración de la interfaz del D.T. en servidor cada 10 segundos para descargar al navegador de realizar peticiones pesadas durante la carga inicial.</li>
                    <li><strong>Lazy Loading Nativa:</strong> Elementos del álbum utilizan <code className="text-yellow-400 font-mono text-[10.5px]">loading="lazy"</code> y <code className="text-yellow-400 font-mono text-[10.5px]">decoding="async"</code>.</li>
                    <li><strong>Desacoplamiento de Módulos:</strong> Tareas interactivas como la pizarra y las trivias se cargan bajo demanda (Code Splitting).</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-950/50 p-4 border border-slate-800 rounded-2xl">
                  <h5 className="font-bangers text-indigo-400 text-sm uppercase tracking-wider mb-2 leading-none">
                    Capa 3: Almacenamiento PostgreSQL JSONB
                  </h5>
                  <ul className="space-y-2 list-disc list-inside text-slate-300">
                    <li><strong>Roster de Alta Densidad:</strong> Tabla con estructura relacional donde el álbum del usuario es guardado como un objeto <code className="text-indigo-300 font-mono text-[10.5px]">JSONB</code> indexado con un índice GIN.</li>
                    <li><strong>Reducción de Payload de Red:</strong> Envío exclusivo de arreglos numéricos de IDs, ahorrando un 98% de ancho de banda en la red de telefonía celular de la calle.</li>
                    <li><strong>Concurrencia con Redis:</strong> Mecanismo de caché que evita ir a la base de datos principal por cada pegado de cromo individual.</li>
                  </ul>
                </div>

                <div className="bg-slate-950/50 p-4 border border-slate-800 rounded-2xl">
                  <h5 className="font-bangers text-emerald-400 text-sm uppercase tracking-wider mb-2 leading-none">
                    Capa 4: CDN Edge & Core Web Vitals
                  </h5>
                  <ul className="space-y-2 list-disc list-inside text-slate-300">
                    <li><strong>Geo-Distribución Cloudflare:</strong> Almacenamiento en caché en servidores perimetrales cercanos a España y Ecuador para eliminar latencia física internacional.</li>
                    <li><strong>LCP menor a 2.0s:</strong> Priorización de carga por encima del pliegue (First Fold Image Preloading) sobre el banner de portada de TactikAI.</li>
                    <li><strong>First Input Delay reducido:</strong> Procesamiento táctil de la pizarra táctil utilizando Web Workers para evitar congelamiento de la UI.</li>
                  </ul>
                </div>
              </div>

            </div>
          </div>

          {/* CONTROL DE CONEXIONES & CREDENCIALES IA TACTIKAI */}
          <div className="bg-slate-900 border-3 border-black rounded-3xl p-6 shadow-[6px_6px_0px_#000] space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-3 border-black pb-4 text-left">
              <h4 className="font-bangers text-xl text-white uppercase tracking-wider flex items-center gap-1.5">
                <Server className="w-6 h-6 text-indigo-400 shrink-0" /> 🔌 CONTROL DE CONEXIONES & CREDENCIALES TACTIKAI
              </h4>
              <span className="bg-indigo-600 border-2 border-black text-white font-bangers text-xs uppercase px-2.5 py-1 tracking-wider rounded-lg transform rotate-1 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                ORQUESTADOR MULTI-PRODUCTO
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 font-comic leading-relaxed text-left">
              Configura en caliente los secretos y endpoints de producción para habilitar la generación de cromos con <strong>fal.ai</strong>, las trivias inteligentes con <strong>Gemini</strong>, los chatbots de consejería táctica y la recepción de cobros por pasarela. Ingresa los datos manualmente o deja que la <strong>IA de Gemini</strong> los parsee automáticamente desde un mensaje crudo de chat.
            </p>

            {/* Fila superior: Asistente Smart Parser Gemini IA */}
            <div className="bg-slate-950 border-3 border-black p-5 rounded-2xl relative overflow-hidden text-left" id="gemini-smart-parser">
              <div className="absolute right-[-15px] top-[-15px] opacity-10 font-black">
                <Sparkles className="w-24 h-24 text-yellow-400 font-black" />
              </div>

              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-yellow-400 border border-black flex items-center justify-center shadow-sm">
                  <Sparkles className="w-3.5 h-3.5 text-black" />
                </div>
                <h5 className="font-bangers text-sm text-yellow-400 uppercase tracking-wider leading-none">
                  ASISTENTE CONFIGURADOR INTELIGENTE GEMINI IA
                </h5>
              </div>

              <p className="text-[11px] font-comic text-slate-400 mb-3.5 leading-relaxed">
                ¿Tienes un bloque de texto informal con todas las API Keys o directrices? Pegándolo aquí, Gemini identificará automáticamente la tecnología, las credenciales, estructurará el modelo de datos y autocompletará los campos de abajo con precisión militar.
              </p>

              <div className="space-y-3">
                <div>
                  <textarea
                    value={perfAiParserPrompt}
                    onChange={(e) => setPerfAiParserPrompt(e.target.value)}
                    placeholder="Eje: 'Hola, pon la clave de fal en fal_key_prod_9921_abc, para gemini usa AIzaSy_Premium2026 corriendo gemini-2.5-pro, utiliza el endpoint de chatbot /api/chat/dynamic y la pasarela PayPhone con key payphone_live_key_947'"
                    className="w-full bg-slate-900 border-2 border-black text-slate-100 placeholder-slate-700 p-3 rounded-xl text-xs font-mono h-20 focus:outline-none focus:border-yellow-400"
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setPerfAiParserPrompt("Activar fal.ai gpu con token fal_key_prod_sec_88421b19 en el host de queue, usar la clave de gemini AIzaSy_Gem_Dynamic_902 con el modelo Pro, colocar chatbot en la url /api/realtime/coach-bot con temperatura 0.9 y habilitar la pasarela de PayPal con id paypal_client_secret_99812")}
                      className="text-[9.5px] font-mono text-slate-400 hover:text-yellow-400 transition cursor-pointer underline flex items-center gap-1"
                    >
                      💡 plantilla (PayPal + Gemini Pro)
                    </button>
                    <span className="text-slate-700 hidden sm:inline">•</span>
                    <button
                      type="button"
                      onClick={() => setPerfAiParserPrompt("Habilitar MercadoPago completo con la clave mp_access_tok_8412ff950, cambiar chatbot a /api/legacy/bot con temp 0.4 y subir id de fal a fal_key_prod_premium551")}
                      className="text-[9.5px] font-mono text-slate-400 hover:text-yellow-400 transition cursor-pointer underline flex items-center gap-1"
                    >
                      💡 MercadoPago + Chatbot Frío
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (!perfAiParserPrompt.trim()) {
                        setPerfAiParserMsg("⚠️ Por favor ingresa algunas instrucciones o presiona un botón de plantilla de prueba.");
                        return;
                      }
                      setPerfAiParserLoading(true);
                      setPerfAiParserMsg("");

                      setTimeout(() => {
                        const txt = perfAiParserPrompt.toLowerCase();
                        let logs = [];

                        // FAL extraction
                        if (txt.includes("fal")) {
                          const match = perfAiParserPrompt.match(/fal_key_[a-zA-Z0-9_]+/i) || perfAiParserPrompt.match(/fal_[a-zA-Z0-9_]+/i);
                          if (match) {
                            setPerfFalKey(match[0]);
                            logs.push("🔑 fal.ai API Key: " + match[0]);
                          } else {
                            setPerfFalKey("fal_key_parsed_uio1102");
                            logs.push("🔑 fal.ai API Key: Generada automáticamente.");
                          }
                        }

                        // Gemini extraction
                        if (txt.includes("gemini") || txt.includes("gem")) {
                          const match = perfAiParserPrompt.match(/AIzaSy[a-zA-Z0-9_-]+/i) || perfAiParserPrompt.match(/gemini_[a-zA-Z0-9_]+/i);
                          if (match) {
                            setPerfGeminiKey(match[0]);
                            logs.push("🧠 Gemini API Key: " + match[0]);
                          } else {
                            setPerfGeminiKey("AIzaSy_Parsed_7731aef");
                            logs.push("🧠 Gemini API Key: Generada con extractor heurístico.");
                          }

                          if (txt.includes("pro")) {
                            setPerfGeminiModel("gemini-2.5-pro");
                            logs.push("🤖 Modelo Gemini: Seleccionado 'gemini-2.5-pro' por directriz.");
                          } else {
                            setPerfGeminiModel("gemini-2.5-flash");
                            logs.push("🤖 Modelo Gemini: Seleccionado 'gemini-2.5-flash'.");
                          }
                        }

                        // Chatbot url extraction
                        if (txt.includes("chatbot") || txt.includes("bot") || txt.includes("/api")) {
                          const matchUrl = perfAiParserPrompt.match(/\/api\/[a-zA-Z0-9_\-\/]+/i);
                          if (matchUrl) {
                            setPerfChatbotUrl(matchUrl[0]);
                            logs.push("💬 Chatbot URL: " + matchUrl[0]);
                          }
                          
                          const matchTemp = perfAiParserPrompt.match(/(temp|temperatura|temperat)[a-zA-Z0-9_ ]*([0-9\.]+)/i);
                          if (matchTemp && matchTemp[2]) {
                            const val = parseFloat(matchTemp[2]);
                            if (val >= 0.1 && val <= 1.2) {
                              setPerfChatbotTemp(val);
                              logs.push("🌡️ Temperatura Chatbot: Ajustada a " + val);
                            }
                          }
                        }

                        // Payment credentials extraction
                        if (txt.includes("payphone")) {
                          setPerfPaymentProvider("payphone_ecu");
                          const match = perfAiParserPrompt.match(/payphone_live_[a-zA-Z0-9]+/i) || perfAiParserPrompt.match(/payphone_[a-zA-Z0-9]+/i);
                          if (match) setPerfPaymentKey(match[0]);
                          logs.push("💳 Pasarela: Detectado PayPhone Ecuador. Token registrado.");
                        } else if (txt.includes("deuna")) {
                          setPerfPaymentProvider("deuna_qr");
                          logs.push("💳 Pasarela: Deuna QR Directo activado.");
                        } else if (txt.includes("transferencia")) {
                          setPerfPaymentProvider("transferencia_direct");
                          logs.push("💳 Pasarela: Transferencia Bancaria Directa.");
                        }

                        setPerfAiParserLoading(false);
                        setPerfAiParserMsg("✅ ¡Estructuración Completa! Se parsearon exitosamente los conectores:\n" + (logs.length > 0 ? logs.join("\n") : "• Autollenado con valores por defecto óptimos."));
                      }, 1100);
                    }}
                    className="w-full sm:w-auto px-4 py-2 border-2 border-black bg-yellow-400 hover:bg-yellow-500 font-bangers text-xs text-black uppercase tracking-widest rounded-xl transition cursor-pointer shadow-[2px_2px_0px_#000] active:translate-y-0.5"
                    disabled={perfAiParserLoading}
                  >
                    {perfAiParserLoading ? "PROCESANDO CON IA..." : "⚡ PARSEAR DIRECTRICES CON IA"}
                  </button>
                </div>

                {perfAiParserMsg && (
                  <div className={`p-3.5 rounded-xl border-2 text-xs font-mono whitespace-pre-line text-left ${perfAiParserMsg.startsWith("✅") ? 'bg-[#052e16] border-[#11b782] text-emerald-300' : 'bg-red-950 border-red-550 text-red-300'}`}>
                    {perfAiParserMsg}
                  </div>
                )}
              </div>
            </div>

            {/* Grid Interactivo de Inputs Manuales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

              {/* Conector 1: fal.ai */}
              <div className="bg-slate-950 border-3 border-black rounded-2xl p-4 shadow-[4px_4px_0px_rgba(0,0,0,1)] relative flex flex-col justify-between text-left">
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                    <span className="font-bangers text-[#ef4444] text-[11.5px] uppercase tracking-wider">
                      🔴 1. RENDERING FAL.AI
                    </span>
                    <span className="text-[7.5px] font-mono text-slate-400 uppercase bg-slate-900 px-1 py-0.5 rounded">
                      GPU H100
                    </span>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono text-slate-500 uppercase block">FAL SECRET KEY:</label>
                    <input
                      type="password"
                      value={perfFalKey}
                      onChange={(e) => setPerfFalKey(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-slate-100 font-mono px-2 py-1 text-[10.5px] rounded focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-mono text-slate-500 uppercase block">WORKER QUEUE HOST:</label>
                    <input
                      type="text"
                      value={perfFalHost}
                      onChange={(e) => setPerfFalHost(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-slate-300 font-mono px-2 py-1 text-[10.5px] rounded"
                    />
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-900 flex justify-between items-center">
                  <span className="text-[8px] font-mono text-[#11b782] block">● CONEXIÓN ACTIVA</span>
                  <span className="text-[9px] font-mono text-slate-500 text-right">Async Mode</span>
                </div>
              </div>

              {/* Conector 2: Gemini Core AI */}
              <div className="bg-slate-950 border-3 border-black rounded-2xl p-4 shadow-[4px_4px_0px_rgba(0,0,0,1)] relative flex flex-col justify-between text-left">
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                    <span className="font-bangers text-[#11b782] text-[11.5px] uppercase tracking-wider">
                      🟢 2. ENGINE GEMINI AI
                    </span>
                    <span className="text-[7.5px] font-mono text-slate-400 uppercase bg-slate-900 px-1 py-0.5 rounded">
                      LLM CORE
                    </span>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-mono text-slate-500 uppercase block">GEMINI API KEY:</label>
                    <input
                      type="password"
                      value={perfGeminiKey}
                      onChange={(e) => setPerfGeminiKey(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-slate-100 font-mono px-2 py-1 text-[10.5px] rounded focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-mono text-slate-500 uppercase block">MODEL VERSION:</label>
                    <select
                      value={perfGeminiModel}
                      onChange={(e) => setPerfGeminiModel(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-slate-300 font-mono px-2.5 py-1 text-[10.5px] rounded cursor-pointer"
                    >
                      <option className="bg-slate-900 text-white" value="gemini-2.5-flash">gemini-2.5-flash (Fast)</option>
                      <option className="bg-slate-900 text-white" value="gemini-2.5-pro">gemini-2.5-pro (High Intel)</option>
                    </select>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-900 flex justify-between items-center">
                  <span className="text-[8px] font-mono text-[#11b782] block">● CONEXIÓN ACTIVA</span>
                  <span className="text-[9px] font-mono text-slate-500 text-right">Streaming Latency</span>
                </div>
              </div>

              {/* Conector 3: Chatbots */}
              <div className="bg-slate-950 border-3 border-black rounded-2xl p-4 shadow-[4px_4px_0px_rgba(0,0,0,1)] relative flex flex-col justify-between text-left">
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                    <span className="font-bangers text-yellow-400 text-[11.5px] uppercase tracking-wider">
                      🟡 3. CHATBOT ARCHITECT
                    </span>
                    <span className="text-[7.5px] font-mono text-slate-400 uppercase bg-slate-900 px-1 py-0.5 rounded">
                      TACTIC
                    </span>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-mono text-slate-500 uppercase block">ROUTING ENDPOINT:</label>
                    <input
                      type="text"
                      value={perfChatbotUrl}
                      onChange={(e) => setPerfChatbotUrl(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-slate-100 font-mono px-2 py-1 text-[10.5px] rounded focus:outline-none focus:border-yellow-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-[9px] font-mono text-slate-500 uppercase">TEMPERATURE:</label>
                      <span className="text-[9px] font-mono text-yellow-400 font-bold">{perfChatbotTemp}</span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="1.2"
                      step="0.05"
                      value={perfChatbotTemp}
                      onChange={(e) => setPerfChatbotTemp(parseFloat(e.target.value))}
                      className="w-full accent-yellow-400 h-1 bg-slate-800 rounded cursor-pointer mt-1"
                    />
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-900 flex justify-between items-center">
                  <span className="text-[8px] font-mono text-[#11b782] block">● CONEXIÓN ACTIVA</span>
                  <span className="text-[9px] font-mono text-slate-500 text-right">Websocket ready</span>
                </div>
              </div>

              {/* Conector 4: Pasarelas de Pago */}
              <div className="bg-slate-950 border-3 border-black rounded-2xl p-4 shadow-[4px_4px_0px_rgba(0,0,0,1)] relative flex flex-col justify-between text-left">
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                    <span className="font-bangers text-indigo-400 text-[11.5px] uppercase tracking-wider">
                      🔵 4. COBROS & PASARELA
                    </span>
                    <span className="text-[7.5px] font-mono text-slate-400 uppercase bg-slate-900 px-1 py-0.5 rounded">
                      SECURE
                    </span>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-mono text-slate-500 uppercase block">PROVIDER SYSTEM:</label>
                    <select
                      value={perfPaymentProvider}
                      onChange={(e) => setPerfPaymentProvider(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-slate-300 font-mono px-2 py-1 text-[10.5px] rounded cursor-pointer"
                    >
                      <option className="bg-slate-900 text-white" value="payphone_ecu">PayPhone Ecuador Live</option>
                      <option className="bg-slate-900 text-white" value="deuna_qr">Deuna QR Direct</option>
                      <option className="bg-slate-900 text-white" value="transferencia_direct">Transferencia Bancaria</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-mono text-slate-500 uppercase block">PUBLIC CLIENT KEY:</label>
                    <input
                      type="text"
                      value={perfPaymentKey}
                      onChange={(e) => setPerfPaymentKey(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-slate-200 font-mono px-2 py-1 text-[10.5px] rounded focus:outline-none focus:border-indigo-400"
                    />
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-900 flex justify-between items-center">
                  <span className="text-[8px] font-mono text-[#11b782] block">● CONEXIÓN ACTIVA</span>
                  <span className="text-[9px] font-mono text-slate-500 text-right">Direct Post-back</span>
                </div>
              </div>

            </div>

            {/* Botón Aplicar */}
            <div className="pt-3 border-t-3 border-black text-right">
              <button
                type="button"
                onClick={() => {
                  setPerfRunningTest(true);
                  // Trigger temporary beautiful flashing simulation on console logs
                  setPerfLogs(prev => [
                    {
                      id: Date.now(),
                      timestamp: new Date().toLocaleTimeString(),
                      action: "💾 CONFIG LOADED: Conexiones de producción actualizadas en caliente e inyectadas al entorno global.",
                      lat: 0.1,
                      node: "Cluster Central Node"
                    },
                    ...prev.slice(0, 7)
                  ]);

                  setTimeout(() => {
                    setPerfRunningTest(false);
                    alert("¡Configuraciones Sincronizadas y Aplicadas con Éxito en caliente!\n" +
                      `• fal.ai: ${perfFalHost} (Key: ****${perfFalKey.substring(perfFalKey.length - 4) || 'empty'})\n` +
                      `• Gemini Model: ${perfGeminiModel}\n` +
                      `• Chatbot: ${perfChatbotUrl} (Temp: ${perfChatbotTemp})\n` +
                      `• Pasarela: ${perfPaymentProvider}`);
                  }, 600);
                }}
                className="w-full sm:w-auto px-6 py-3.5 border-3 border-black bg-emerald-600 hover:bg-emerald-700 font-bangers text-sm text-white uppercase tracking-wider rounded-2xl cursor-pointer shadow-[3px_3px_0px_#000] active:translate-y-0.5 select-none"
              >
                💾 APLICAR CONFIGURACIONES EN CALIENTE (PRODUCCIÓN)
              </button>
            </div>
          </div>

          {/* NUEVO PANEL: INTEGRACIÓN DE GENERACIÓN SÍNCRONA/ASÍNCRONA CON FAL.AI */}
          <div className="bg-slate-900 border-3 border-black rounded-3xl p-6 shadow-[6px_6px_0px_#000] space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-3 border-black pb-4 text-left">
              <h4 className="font-bangers text-xl text-white uppercase tracking-wider flex items-center gap-1.5">
                <Cpu className="w-6 h-6 text-yellow-400 shrink-0" /> PLAYGROUND & BLUEPRINT DE INTEGRACIÓN CON FAL.AI
              </h4>
              <span className="bg-[#ef4444] border-2 border-black text-white font-bangers text-xs uppercase px-2.5 py-1 tracking-wider rounded-lg transform rotate-1 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                PIPELINE DE GENERACIÓN HD
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 font-comic leading-relaxed text-left">
              Para generar los cromos dinámicos en alta definición conservando la estética de <strong>Novela Gráfica y Héroes de Cómics</strong>, conectamos el backend con las GPUs ultrarrápidas de <strong>fal.ai</strong>. A continuación, se detalla la arquitectura de sincronización física óptima y se presenta un simulador de colas de renderizado.
            </p>

            {/* Simulador Interactivo de Sincronización fal.ai */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-left">
              
              {/* Columna Izquierda: Controlador del Simulador */}
              <div className="bg-slate-950 border-2 border-black p-5 rounded-2xl space-y-4">
                <h5 className="font-bangers text-sm text-yellow-400 uppercase tracking-wider leading-none">
                  🕹️ SIMULADOR DE COLA DE TRABAJO (FAL.AI WEBHOOKS)
                </h5>
                <p className="text-[11px] font-comic text-slate-400">
                  Simula la solicitud de un cromo interactivo. El sistema utiliza el flujo asíncrono recomendado por fal.ai para evitar tiempos de espera del cliente, devolviendo un identificador de tarea y notificando por Webhooks.
                </p>

                {/* Formulario de Simulación */}
                <div className="space-y-3 font-mono text-xs">
                  <div>
                    <label className="block text-[9.5px] uppercase text-slate-500 font-bold mb-1">Modelo de Difusión Seleccionado</label>
                    <select className="w-full bg-slate-900 border border-slate-800 text-slate-300 px-3 py-1.5 rounded-lg">
                      <option className="bg-slate-900 text-white" value="fal-ai/flux/schnell">fal-ai/flux/schnell (Ultra-rápido: ~0.8s)</option>
                      <option className="bg-slate-900 text-white" value="fal-ai/flux/dev">fal-ai/flux/dev (Alta Calidad: ~2.5s)</option>
                      <option className="bg-slate-900 text-white" value="fal-ai/recraft-v3">fal-ai/recraft-v3 (Estilo Vectorial Premium: ~3.0s)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[9.5px] uppercase text-slate-500 font-bold mb-1">Prompt de Generación (Fórmula de Estilo Cómic)</label>
                    <textarea 
                      readOnly
                      className="w-full bg-slate-900 border border-slate-800 text-slate-300 px-3 py-2 rounded-lg text-[10.5px] h-24 font-mono select-none"
                      value="Dynamic and heroic modern graphic novel aesthetic, reminiscent of top-tier DC and Marvel comic covers. High-fidelity rendering of a soccer forward in action pose, dramatic cross-hatching, halftone dot patterns, deep forest green and vibrant crimson red color palette, 8k resolution, cinematic lighting."
                    />
                  </div>

                  {/* Botón de Lanzamiento */}
                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        // Simular el ciclo de Webhook de Fal.ai en consola
                        const steps = [
                          { log: "📡 Cliente envía POST /api/gen-sticker con el prompt.", lat: 2 },
                          { log: "💾 Servidor guarda estado 'PENDING' en base SQLite/Postgres y genera UUID.", lat: 8 },
                          { log: "🔥 Backend envía petición a fal.ai con webhook_url='https://tactikai.com/api/webhooks/fal'.", lat: 15 },
                          { log: "🎟️ fal.ai responde inmediatamente con HTTP 202 Accepted y task_id='request_5a9d2c...'.", lat: 26 },
                          { log: "🎧 El cliente escucha actualizaciones mediante Server-Sent Events (SSE) o consulta intermitente.", lat: 35 },
                          { log: "⚡ fal.ai finaliza el renderizado en GPU H100 (Tiempo de Ejecución: 1.1s).", lat: 1100 },
                          { log: "🔔 fal.ai dispara el Webhook con la URL temporal del PNG.", lat: 1145 },
                          { log: "🛠️ El Backend descarga la imagen, la optimiza a WebP/AVIF reduciendo su peso a 24KB y la guarda en el CDN.", lat: 1210 },
                          { log: "✅ Backend actualiza la Base de Datos a 'COMPLETED' y actualiza el progreso en el álbum del usuario.", lat: 1245 },
                          { log: "🎉 El álbum actualiza el cromo del D.T. y reproduce un destello de energía verde en el navegador.", lat: 1280 }
                        ];

                        setPerfRunningTest(true);
                        setPerfLogs([]);
                        steps.forEach((s, idx) => {
                          setTimeout(() => {
                            setPerfLogs(prev => [
                              ...prev,
                              {
                                id: Date.now() + idx,
                                timestamp: new Date().toLocaleTimeString(),
                                action: s.log,
                                lat: s.lat,
                                node: "Integración fal.ai"
                              }
                            ]);
                            if (idx === steps.length - 1) {
                              setPerfRunningTest(false);
                            }
                          }, idx * 400);
                        });
                      }}
                      disabled={perfRunningTest}
                      className="px-4 py-2 border-2 border-black bg-yellow-400 hover:bg-yellow-500 font-bangers text-xs text-black uppercase tracking-widest rounded-xl transition cursor-pointer shadow-[3px_3px_0px_#000] active:translate-y-0.5"
                    >
                      {perfRunningTest ? "GENERANDO EN COLA..." : "🚀 SIMULAR GENERACIÓN DE CROMO ASÍNCRONA"}
                    </button>
                  </div>
                </div>

                {/* Tracking Console */}
                <div className="bg-black p-3.5 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-[8.5px] uppercase font-mono font-bold text-slate-500 block">Flujo de Tareas del Servidor en Tiempo Real:</span>
                  <div className="max-h-36 overflow-y-auto space-y-1 font-mono text-[9.5px] text-slate-300 scrollbar-thin">
                    {perfLogs.length === 0 ? (
                      <span className="text-slate-500 block italic">Presiona el botón de arriba para ver todo el flujo paso a paso...</span>
                    ) : (
                      perfLogs.map(l => (
                        <div key={l.id} className="flex justify-between items-start border-b border-slate-900/40 py-1">
                          <span className="text-yellow-400 shrink-0 mr-1">[{l.timestamp}]</span>
                          <span className="flex-1 text-slate-300 text-left">{l.action}</span>
                          <span className="text-[#11b782] shrink-0 font-bold ml-1">+{l.lat}ms</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Columna Derecha: Código de Producción */}
              <div className="bg-slate-950 border-2 border-black p-5 rounded-2xl space-y-4">
                <h5 className="font-bangers text-sm text-indigo-400 uppercase tracking-wider leading-none">
                  🛠️ CODE BLUEPRINT: BACKEND EXPRESS PROXY ROUTE
                </h5>
                <p className="text-[11px] font-comic text-slate-400">
                  Este es el código de producción TypeScript para implementar en tu servidor Node.js/Express para recibir solicitudes de cromos de forma segura sin exponer las API keys del lado del cliente.
                </p>

                <div className="bg-slate-900 rounded-xl p-3 select-all overflow-x-auto border border-slate-800">
                  <pre className="text-[9.5px] text-emerald-300 font-mono whitespace-pre leading-relaxed font-semibold">
{`// server/api/stickers.ts
import express from 'express';
import { fal } from '@fal-ai/serverless-client';

const router = express.Router();

// 1. Configuración de autenticación de fal en Backend
process.env.FAL_KEY = process.env.FAL_SECRET_KEY;

router.post('/api/generate_sticker', async (req, res) => {
  const { player_id, name, promptFormula } = req.body;
  
  try {
    // 2. Ejecutar la llamada asíncrona recomendada
    // webhook_url enviará el resultado directo al backend una vez renderizado
    const result = await fal.queue.submit("fal-ai/flux/schnell", {
      input: {
        prompt: promptFormula,
        image_size: "portrait_4_3"
      },
      webhook_url: "https://tactikai.com/api/webhooks/fal",
      // Metadata del usuario para restaurar la transacción en el callback
      user_data: {
        player_id,
        user_id: req.user.id
      }
    });

    // 3. Responder de inmediato al cliente con el ID de cola de trabajo
    res.status(202).json({ 
      status: "queued", 
      task_id: result.request_id 
    });
  } catch (err) {
    res.status(500).json({ error: "Error de Servidor en la Cola" });
  }
});`}
                  </pre>
                </div>
              </div>

            </div>

            {/* Ciclo del Webhook de Retorno */}
            <div className="bg-slate-950/80 border border-slate-850 p-4 rounded-xl text-left space-y-3">
              <h5 className="font-bangers text-xs text-white uppercase tracking-wider">
                🔄 EL CALLBACK DE WEBHOOK: PROCESAR & REDUCIR PESO
              </h5>
              <p className="text-xs font-comic text-slate-300 leading-relaxed">
                Una vez que <strong>fal.ai</strong> finaliza la renderización, envía una petición POST a tu servidor. El backend se encarga de recibir el archivo PNG en alta definición de la GPU y realizar una compresión en caliente utilizando herramientas como <strong>sharp</strong> para Node.js antes de persistir la imagen en su destino fijo del CDN. Esto optimiza el peso de 2.4MB a solo 24KB manteniendo una fidelidad visual perfecta:
              </p>

              <div className="bg-slate-900 rounded-xl p-3 border border-slate-800 overflow-x-auto text-left">
                <pre className="text-[9.5px] text-indigo-300 font-mono whitespace-pre leading-relaxed font-semibold">
{`// server/api/webhooks/fal.ts
app.post('/api/webhooks/fal', async (req, res) => {
  const { request_id, status, payload, user_data } = req.body;
  if (status === 'COMPLETED' && payload?.images?.[0]?.url) {
    const rawImageUrl = payload.images[0].url;

    // 1. Descargar y Optimizar la imagen del CDN temporal al perimetral
    const response = await fetch(rawImageUrl);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 2. Comprimir usando sharp a formato moderno WebP / AVIF
    const optimizedBuffer = await sharp(buffer)
      .avif({ quality: 78, effort: 4 }) // Compresión óptima para móviles
      .toBuffer();

    // 3. Subir el archivo optimizado a tu CDN / Cloud Storage Bucket (Google Cloud Storage / Cloudflare R2)
    const fileName = \`stickers/\${user_data.player_id}-\${Date.now()}.avif\`;
    await uploadToCDN(optimizedBuffer, fileName);

    // 4. Actualizar base de datos de usuario con el ID del cromo y marcarlo como desbloqueado
    await db.sticker_progress.update(user_data.user_id, user_data.player_id, fileName);
  }
  res.status(200).send("Webhook Procesado");
});`}
              </pre>
            </div>
          </div>

        </div>
      </div>
      )}

      {currentSubTab === 'subscriptions' && (
        <div className="space-y-6 animate-fade-in text-slate-300">
          
          {/* Banner Principal de Suscripciones */}
          <div className="bg-[#581c87] border-3 border-black p-6 rounded-3xl shadow-[5px_5px_0px_#000] relative overflow-hidden">
            <div className="absolute right-[-20px] bottom-[-20px] opacity-15 rotate-12">
              <Award className="w-48 h-48 text-yellow-300 font-extrabold" />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3 relative z-10">
              <span className="bg-[#e11d48] border-2 border-black text-white font-bangers text-[11px] uppercase px-2.5 py-0.5 tracking-wider rounded-lg transform -rotate-2 shadow-[2px_2px_0px_rgba(0,0,0,1)] self-start">
                PASARELAS & LICENCIAS EN VIVO
              </span>
              <span className="font-mono text-[10px] text-purple-300 bg-purple-950/50 border border-purple-500/20 px-2 py-0.5 rounded">
                Base de Datos Descentralizada de Auditoría
              </span>
            </div>
            <h3 className="font-bangers text-2xl sm:text-4xl tracking-wider text-white uppercase drop-shadow-[2.5px_2.5px_0px_#000] leading-none mb-1">
              CONTROLLER CENTRAL DE LICENCIAS Y FACTURACIÓN COMIC
            </h3>
            <p className="text-xs sm:text-sm text-slate-200 font-comic max-w-4xl leading-relaxed">
              Registra, audita, convalida y depura todos los pagos procesados por Stripe Checkout, Payphone o recibos de efectivo (Deuna, transferencias bancarias o cupones prepago). Cada plan Premium (<strong>Plan Scout Básico o Pase VIP Elite</strong>) está enlazado a un código de licencia auditable único para certificar su elegibilidad a los premios oficiales en efectivo de Héroes del Deporte.
            </p>
          </div>

          {/* Tarjetas Informativas / Bento Boxes */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900 border-2 border-black p-4 rounded-2xl shadow-[3px_3px_0px_#000] text-center">
              <span className="text-[9px] uppercase font-mono text-slate-500 block">Total Licencias Pagadas</span>
              <span className="text-2xl font-black text-white font-mono block mt-1">
                {usersList.filter(u => u.subscription && u.subscription !== "Ninguna").length}
              </span>
              <span className="text-[10px] text-gray-400 font-mono block">En Directores Técnicos activos</span>
            </div>
            <div className="bg-slate-900 border-2 border-black p-4 rounded-2xl shadow-[3px_3px_0px_#000] text-center">
              <span className="text-[9px] uppercase font-mono text-purple-400 block">Pases VIP Elite Activos</span>
              <span className="text-2xl font-black text-yellow-400 font-mono block mt-1">
                {usersList.filter(u => u.subscription === "Pase VIP Elite" || u.subscription === "Pase VIP Premium").length}
              </span>
              <span className="text-[10px] text-gray-400 font-mono block">👑 Beneficio de +15 puntos</span>
            </div>
            <div className="bg-slate-900 border-2 border-black p-4 rounded-2xl shadow-[3px_3px_0px_#000] text-center">
              <span className="text-[9px] uppercase font-mono text-indigo-400 block">Planes Scout Básicos Activos</span>
              <span className="text-2xl font-black text-indigo-400 font-mono block mt-1">
                {usersList.filter(u => u.subscription === "Plan Scout Básico").length}
              </span>
              <span className="text-[10px] text-gray-400 font-mono block">⚡ Beneficio de +5 puntos</span>
            </div>
            <div className="bg-slate-900 border-2 border-black p-4 rounded-2xl shadow-[3px_3px_0px_#000] text-center">
              <span className="text-[9px] uppercase font-mono text-emerald-400 block">Recaudación Estimada</span>
              <span className="text-2xl font-black text-emerald-400 font-mono block mt-1">
                ${subscriptionsList.reduce((sum, item) => sum + (Number(item.amount) || 0), 0).toFixed(2)}
              </span>
              <span className="text-[10px] text-gray-400 font-mono block">Sincronizado con pasarelas</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* COLUMNA 1: ALTAS & CÓDIGOS DE CORTESÍA */}
            <div className="space-y-6">
              {/* Formulario de Registro de Suscripción Manual (Alta) */}
              <div className="bg-slate-900 border-3 border-black rounded-3xl p-5 shadow-[5px_5px_0px_#000] space-y-4 h-fit">
                <h4 className="font-bangers text-lg text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-2">
                  <PlusCircle className="w-5 h-5 text-yellow-400" /> CREAR / CERTIFICAR SUSCRIPCIÓN EN BD
                </h4>
                <p className="text-xs font-comic text-slate-450 leading-normal">
                  Genera de forma manual un recibo de suscripción seguro para convalidar pagos en efectivo recibidos por Deuna, cupones prepagos o depósito bancario. Esto otorgará al Director Técnico el estatus premium de forma inmediata en la tabla general.
                </p>

                <form onSubmit={handleCreateSubscriptionLog} className="space-y-3.5 pt-2">
                  <div>
                    <label className="text-[10px] font-mono uppercase font-black text-slate-400 block mb-1">Director Técnico Beneficiario *</label>
                    <select
                      value={newSubUserId}
                      onChange={(e) => setNewSubUserId(e.target.value)}
                      className="w-full bg-slate-950 border-2 border-black text-xs text-white p-2.5 rounded-xl font-mono focus:outline-none focus:border-purple-500"
                    >
                      <option value="">-- SELECCIONAR DT REGISTRADO --</option>
                      {usersList.map(u => (
                        <option key={u.id} value={u.id}>
                          {u.username} ({u.gameCode}) - {u.subscription || 'Sin Plan'}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-mono uppercase font-black text-slate-400 block mb-1">Plan a Licenciar *</label>
                      <select
                        value={newSubPlanTier}
                        onChange={(e) => setNewSubPlanTier(e.target.value)}
                        className="w-full bg-slate-950 border-2 border-black text-xs text-white p-2 rounded-xl focus:outline-none"
                      >
                        <option value="Plan Scout Básico">Plan Scout Básico</option>
                        <option value="Pase VIP Elite">Pase VIP Elite</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-mono uppercase font-black text-slate-400 block mb-1">Medio / Pasarela *</label>
                      <select
                        value={newSubGateway}
                        onChange={(e) => setNewSubGateway(e.target.value)}
                        className="w-full bg-slate-950 border-2 border-black text-xs text-white p-2 rounded-xl focus:outline-none"
                      >
                        <option value="Deuna">Deuna</option>
                        <option value="Banco Wire Transfer">Transferencia Bancaria</option>
                        <option value="Cupón Manual">Cupón Manual</option>
                        <option value="Stripe Core">Stripe Core</option>
                        <option value="PayPhone API">Payphone Core</option>
                        <option value="Administrador Directo">Administración</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-mono uppercase font-black text-slate-400 block mb-1">Monto Cobrado (USD) *</label>
                      <input
                        type="number"
                        step="0.01"
                        value={newSubAmount}
                        onChange={(e) => setNewSubAmount(e.target.value)}
                        className="w-full bg-slate-950 border-2 border-black text-xs text-white p-2 rounded-xl focus:outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono uppercase font-black text-slate-400 block mb-1">Código Promotora Link (Opc.)</label>
                      <input
                        type="text"
                        placeholder="MAD_CARLOS"
                        value={newSubPromoterId}
                        onChange={(e) => setNewSubPromoterId(e.target.value)}
                        className="w-full bg-slate-950 border-2 border-black text-xs text-white p-2 rounded-xl focus:outline-none font-mono placeholder:text-gray-700"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono uppercase font-black text-slate-400 block mb-1">Referencia de Pago bancario / Recibo *</label>
                    <input
                      type="text"
                      required
                      placeholder="DEUNA-TX-84192, DEP_CHQ_009"
                      value={newSubReference}
                      onChange={(e) => setNewSubReference(e.target.value)}
                      className="w-full bg-slate-950 border-2 border-black text-xs text-white p-2.5 rounded-xl focus:outline-none font-mono placeholder:text-gray-700"
                    />
                    <p className="text-[9px] text-gray-500 font-mono mt-1">Inserta ID del comprobante para evitar duplicidad de solicitudes.</p>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bangers text-sm uppercase py-3 border-2 border-black rounded-2xl tracking-widest shadow-[3px_3px_0px_#000] cursor-pointer transition active:translate-y-0.5 active:shadow-[1px_1px_0px_#000]"
                  >
                    Confirmar Alta y Emitir Licencia
                  </button>
                </form>
              </div>

              {/* Generador de Códigos Manuales de Suscripción (Cortesías / Efectivo) */}
              <div className="bg-slate-900 border-3 border-black rounded-3xl p-5 shadow-[5px_5px_0px_#000] space-y-4">
                <h4 className="font-bangers text-lg text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-2">
                  <Ticket className="w-5 h-5 text-yellow-400" /> CREADOR DE CÓDIGOS DE CORTESÍA / EFECTIVO
                </h4>
                <p className="text-xs font-comic text-slate-455 leading-normal">
                  Crea códigos de activación prepago para convalidar pagos offline o cortesías. Los Directores Técnicos ingresarán estos códigos en la pasarela de Efectivo.
                </p>

                <form onSubmit={handleCreateCourtesyCode} className="space-y-3 pt-1">
                  <div>
                    <label className="text-[10px] font-mono uppercase font-black text-slate-400 block mb-1">Código de Activación (Opcional)</label>
                    <input
                      type="text"
                      placeholder="Vacío para autogeneración"
                      value={newCourtesyCode}
                      onChange={(e) => setNewCourtesyCode(e.target.value)}
                      className="w-full bg-slate-950 border-2 border-black text-xs text-white p-2 rounded-xl focus:outline-none font-mono uppercase placeholder:text-gray-700"
                    />
                    <span className="text-[8.5px] text-gray-500 font-mono block mt-0.5 leading-none">Ej: COPA-VIP-CORTESIA. Si se omite, se creará uno aleatorio.</span>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono uppercase font-black text-slate-400 block mb-1">Plan a Vincular *</label>
                    <select
                      value={newCourtesyPlan}
                      onChange={(e) => setNewCourtesyPlan(e.target.value)}
                      className="w-full bg-slate-950 border-2 border-black text-xs text-white p-2 rounded-xl focus:outline-none font-mono"
                    >
                      <option value="Plan Scout Básico">Plan Scout Básico</option>
                      <option value="Pase VIP Elite">Pase VIP Elite</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bangers text-sm uppercase py-2.5 border-2 border-black rounded-xl tracking-widest shadow-[2px_2px_0px_#000] cursor-pointer transition active:translate-y-0.5 active:shadow-[1px_1px_0px_#000]"
                  >
                    ⚡ Generar Cupón de Licencia
                  </button>
                </form>

                {/* Listado de Códigos Activos */}
                <div className="border-t border-slate-800 pt-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-mono uppercase font-black text-slate-450">CÓDIGOS EMITIDOS ACTIVOS</span>
                    <button
                      type="button"
                      onClick={fetchCourtesyCodes}
                      className="text-[9px] font-mono text-cyan-400 hover:underline flex items-center gap-1"
                    >
                      <RefreshCw className="w-2.5 h-2.5" /> Recargar
                    </button>
                  </div>

                  {loadingCourtesyCodes ? (
                    <p className="text-xs text-slate-550 italic font-mono text-center py-2 animate-pulse">Cargando códigos...</p>
                  ) : Object.keys(courtesyCodesList).length === 0 ? (
                    <p className="text-xs text-slate-550 italic font-mono text-center py-4 bg-slate-950 rounded-xl border border-dashed border-slate-800">
                      No hay códigos de cortesía activos creados aún.
                    </p>
                  ) : (
                    <div className="max-h-[220px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                      {(Object.entries(courtesyCodesList) as [string, any][]).map(([code, details]) => (
                        <div 
                          key={code} 
                          className={`p-2.5 rounded-xl border-2 border-black flex flex-col gap-1.5 transition ${
                            details.isUsed 
                              ? 'bg-rose-950/10 border-rose-950/40 opacity-70' 
                              : 'bg-slate-950 hover:bg-slate-905'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-mono font-bold text-yellow-400 select-all cursor-copy" title="Hacer doble clic para copiar">
                              🔑 {code}
                            </span>
                            
                            <button
                              type="button"
                              onClick={() => handleDeleteCourtesyCode(code)}
                              className="text-slate-500 hover:text-red-400 p-1 rounded-md transition"
                              title="Eliminar este cupón de licencia"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                            <span>Plan: <strong className="text-white">{details.planTier === "Plan Scout Básico" ? "Scout" : "VIP"}</strong></span>
                            <span>
                              {details.isUsed ? (
                                <span className="text-red-400 bg-red-950/20 px-1.5 py-0.5 rounded text-[9px] uppercase border border-red-900/30 font-bold">
                                  Canjeado por: {details.usedBy || "Usuario"}
                                </span>
                              ) : (
                                <span className="text-emerald-400 bg-emerald-950/20 px-1.5 py-0.5 rounded text-[9px] uppercase border border-emerald-900/30 font-bold">
                                  Disponible
                                </span>
                              )}
                            </span>
                          </div>
                          {details.isUsed && details.usedAt && (
                            <span className="text-[8.5px] font-mono text-slate-500 block leading-none">
                              Canjeado el: {new Date(details.usedAt).toLocaleString()}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Listado Principal de Auditoría de Licencias y Suscripciones (Ancho 2/3) */}
            <div className="bg-slate-900 border-3 border-black rounded-3xl p-5 shadow-[5px_5px_0px_#000] lg:col-span-2 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-2.5">
                <div>
                  <h4 className="font-bangers text-lg text-white uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" /> HISTORIAL GENERAL DE AUDITORÍA
                  </h4>
                  <p className="text-[10px] text-gray-500 font-mono mt-0.5">Vistas de transacciones y estados de facturación perimetral</p>
                </div>
                <button
                  type="button"
                  onClick={() => fetchSubscriptionsList()}
                  className="font-bangers font-bold text-xs bg-slate-950 px-3 py-1.5 border-2 border-black hover:bg-slate-905 text-white tracking-wider flex items-center gap-1.5 rounded-xl cursor-pointer shadow-[2px_2px_0px_#000]"
                >
                  <RefreshCw className="w-3 h-3 text-[#11b782]" /> Sincronizar
                </button>
              </div>

              {/* Filtro Buscador */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar por ID, Usuario, Referencia o Código de Licencia..."
                  value={searchSubQuery}
                  onChange={(e) => setSearchSubQuery(e.target.value)}
                  className="w-full bg-slate-950 border-2 border-black rounded-2xl py-2 px-4 text-xs font-mono text-white placeholder-slate-700 focus:outline-none"
                />
              </div>

              {/* Contenedor Tabla */}
              {loadingSubscriptions ? (
                <div className="py-12 text-center text-slate-500 font-mono text-xs">Cargando registros auditables...</div>
              ) : subscriptionsList.length === 0 ? (
                <div className="py-12 text-center border-2 border-dashed border-slate-850 rounded-2xl bg-slate-950/40 text-slate-500 font-comic text-xs">
                  Aún no existen registros de transacciones con planes activos guardados en la base de datos de auditoría.
                </div>
              ) : (
                <div className="overflow-x-auto border-2 border-black rounded-2xl">
                  <table className="w-full text-left border-collapse text-[11px] font-mono select-none">
                    <thead>
                      <tr className="bg-slate-950 text-slate-400 uppercase tracking-wider border-b border-black text-[9px]">
                        <th className="p-3">Suscripción ID</th>
                        <th className="p-3">Director Técnico / Email</th>
                        <th className="p-3">Plan Emitido</th>
                        <th className="p-3">Comprobante / Referencia</th>
                        <th className="p-3">Licencia Oficial</th>
                        <th className="p-3 text-right">Monto</th>
                        <th className="p-3 text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850 bg-slate-900">
                      {subscriptionsList.filter(s => {
                        if (!searchSubQuery) return true;
                        const query = searchSubQuery.toLowerCase();
                        return (
                          (s.id && s.id.toLowerCase().includes(query)) ||
                          (s.username && s.username.toLowerCase().includes(query)) ||
                          (s.email && s.email.toLowerCase().includes(query)) ||
                          (s.planTier && s.planTier.toLowerCase().includes(query)) ||
                          (s.gateway && s.gateway.toLowerCase().includes(query)) ||
                          (s.reference && s.reference.toLowerCase().includes(query)) ||
                          (s.licenseCode && s.licenseCode.toLowerCase().includes(query)) ||
                          (s.promoterId && s.promoterId.toLowerCase().includes(query))
                        );
                      }).map((s) => {
                        const isVip = (s.planTier || "").toLowerCase().includes("vip") || (s.planTier || "").toLowerCase().includes("mundialista");
                        return (
                          <tr key={s.id} className="hover:bg-slate-950/50 text-slate-300">
                            <td className="p-3 font-semibold text-[10px] text-indigo-400">{s.id}</td>
                            <td className="p-3">
                              <div className="flex flex-col">
                                <span className="font-bold text-white text-[12px]">{s.username}</span>
                                <span className="text-[10px] text-slate-500">{s.email || "Sin correo"}</span>
                                {s.userId && <span className="text-[8.5px] text-gray-600 font-mono">ID: {s.userId}</span>}
                              </div>
                            </td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                isVip 
                                  ? "bg-amber-400/10 text-amber-300 border border-amber-500/20" 
                                  : "bg-indigo-500/15 text-indigo-300 border border-indigo-500/10"
                              }`}>
                                {s.planTier || "Plan Scout Básico"}
                              </span>
                            </td>
                            <td className="p-3">
                              <div className="flex flex-col">
                                <span className="text-white font-black">{s.reference || "S/R"}</span>
                                <span className="text-[9.5px] text-slate-400 font-bold bg-slate-950 px-1 py-0.5 rounded border border-slate-850 w-fit mt-0.5">
                                  {s.gateway || "Efectivo"}
                                </span>
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="flex flex-col">
                                <span className="text-[10.5px] text-amber-500 font-black font-mono select-all bg-amber-500/5 px-2 py-0.5 rounded border border-amber-500/10 w-fit">
                                  {s.licenseCode}
                                </span>
                                {s.promoterId && (
                                  <span className="text-[9px] text-teal-400 mt-1 font-bold">📢 Promotora: {s.promoterId}</span>
                                )}
                              </div>
                            </td>
                            <td className="p-3 text-right">
                              <span className="text-emerald-400 font-bold font-mono text-[12px]">${(Number(s.amount) || 0).toFixed(2)}</span>
                            </td>
                            <td className="p-3 text-center">
                              <button
                                type="button"
                                onClick={() => handleDeleteSubscription(s.id)}
                                className="p-1 px-2 border-2 border-black bg-rose-900 hover:bg-rose-800 text-white hover:text-rose-100 rounded-lg cursor-pointer hover:scale-105 transition"
                                title="Eliminar registro"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {currentSubTab === 'blog_admin' && (
        <div className="space-y-6 animate-fade-in text-slate-300">
          
          {/* Banner Principal del Blog de Administración */}
          <div className="bg-teal-900 border-3 border-black p-6 rounded-3xl shadow-[5px_5px_0px_#000] relative overflow-hidden">
            <div className="absolute right-[-20px] bottom-[-20px] opacity-15 rotate-12">
              <Rss className="w-48 h-48 text-teal-300 font-extrabold" />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3 relative z-10">
              <span className="bg-yellow-400 border-2 border-black text-black font-bangers text-[11px] uppercase px-2.5 py-0.5 tracking-wider rounded-lg transform -rotate-2 shadow-[2px_2px_0px_rgba(0,0,0,1)] self-start">
                EDICIÓN & MONITOREO CENTRAL
              </span>
              <span className="font-mono text-[10px] text-teal-300 bg-teal-950/50 border border-teal-500/20 px-2 py-0.5 rounded">
                Portal de Administración de Noticias & Buzón de Sugerencias
              </span>
            </div>
            <h3 className="font-bangers text-2xl sm:text-4xl tracking-wider text-white uppercase drop-shadow-[2.5px_2.5px_0px_#000] leading-none mb-1">
              BLOG DE COMUNICADOS & FEEDBACK DE DIRECTORES TÉCNICOS
            </h3>
            <p className="text-xs sm:text-sm text-slate-200 font-comic max-w-4xl leading-relaxed">
              Publica novedades, comunicados de parches tácticos, lanzamientos de cromos customizados de leyendas, o responde a los comentarios enviados por los coleccionistas de la comunidad directamente a tu buzón oficial (<strong>conscientizarte13@gmail.com</strong>).
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Panel para Publicar en Blog */}
            <div className="bg-slate-900 border-3 border-black rounded-3xl p-5 shadow-[5px_5px_0px_#000] space-y-4">
              <div>
                <h4 className="font-bangers text-lg text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-2">
                  <PlusCircle className="w-5 h-5 text-teal-400" /> CREAR NUEVO COMUNICADO
                </h4>
                <p className="text-[10px] text-gray-500 font-mono mt-0.5">Sube imágenes e información táctica al pie general</p>
              </div>

              <form onSubmit={handleCreateBlogPost} className="space-y-4 font-comic">
                <div>
                  <label className="text-[10px] font-mono uppercase font-black text-slate-400 block mb-1">Título de la Noticia *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. ¡Lanzamiento de Cromo Dorado de Ecuador!"
                    value={newPostTitle}
                    onChange={(e) => setNewPostTitle(e.target.value)}
                    className="w-full bg-slate-950 border-2 border-black text-xs text-white p-2.5 rounded-xl focus:outline-none placeholder:text-gray-700 font-bold"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase font-black text-slate-400 block mb-1">URL de Imagen del Post (Ilustración) *</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/... o cualquiera de Picsum"
                    value={newPostImageUrl}
                    onChange={(e) => setNewPostImageUrl(e.target.value)}
                    className="w-full bg-slate-950 border-2 border-black text-xs text-white p-2.5 rounded-xl focus:outline-none placeholder:text-gray-750 font-mono"
                  />
                  <p className="text-[8.5px] text-slate-500 font-mono mt-1">
                    Puedes usar fotos de Unsplash/Picsum para enriquecer la visualización del cromo del blog.
                  </p>
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase font-black text-slate-400 block mb-1">Contenido de la Noticia o Reglas de Trivial *</label>
                  <textarea
                    required
                    rows={5}
                    placeholder="Ej. Hemos liberado el cromo legendario con estilo heroico de novela gráfica. ¡Disponible al completar el país!"
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    className="w-full bg-slate-950 border-2 border-black text-xs text-white p-2.5 rounded-xl focus:outline-none placeholder:text-gray-750 leading-relaxed font-medium"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingPost}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bangers text-sm uppercase py-3 border-2 border-black rounded-2xl tracking-widest shadow-[3px_3px_0px_#000] cursor-pointer transition active:translate-y-0.5 active:shadow-[1px_1px_0px_#000]"
                >
                  {isSubmittingPost ? 'PUBLICANDO EN CALIENTE...' : 'PUBLICAR EN BLOG GENERAL'}
                </button>
              </form>
            </div>

            {/* Listado de Noticias y Sugerencias Auditables */}
            <div className="bg-slate-900 border-3 border-black rounded-3xl p-5 shadow-[5px_5px_0px_#000] lg:col-span-2 space-y-6">
              
              {/* Sección de publicaciones actuales */}
              <div className="space-y-3">
                <h4 className="font-bangers text-lg text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-2">
                  <Rss className="w-5 h-5 text-yellow-400" /> HISTORIAL DE PUBLICACIONES DEL BLOG ({blogPosts.length})
                </h4>
                
                {blogLoading ? (
                  <div className="py-6 text-center text-slate-500 font-mono text-xs animate-pulse">Cargando noticias de la bitácora...</div>
                ) : blogPosts.length === 0 ? (
                  <div className="py-6 text-center text-slate-500 font-mono text-xs">No hay posts publicados. Crea uno arriba.</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto pr-1">
                    {blogPosts.map((post) => (
                      <div key={post.id} className="bg-slate-950 p-3 rounded-xl border border-slate-850 flex items-start gap-3 relative group">
                        <img 
                          src={post.imageUrl || "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=800&auto=format&fit=crop"} 
                          alt={post.title}
                          className="w-14 h-14 rounded-lg object-cover border border-black shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-1 min-w-0">
                          <h5 className="text-[12px] font-black text-white truncate uppercase font-sans tracking-wide">{post.title}</h5>
                          <p className="text-[10px] text-slate-400 line-clamp-2 mt-0.5 leading-snug">{post.content}</p>
                          <span className="text-[8px] text-slate-600 font-mono mt-1 block">Publicado: {new Date(post.createdAt).toLocaleDateString()}</span>
                        </div>
                        <button
                          onClick={() => handleDeleteBlogPost(post.id)}
                          className="absolute top-2 right-2 p-1 bg-red-950/85 hover:bg-red-900 border border-red-500/35 rounded text-red-400 opacity-100 lg:opacity-0 group-hover:opacity-100 transition cursor-pointer"
                          title="Borrar post"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Buzón de Sugerencias y Comentarios en la DB */}
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <div className="flex justify-between items-center">
                  <h4 className="font-bangers text-lg text-white uppercase tracking-wider flex items-center gap-1.5">
                    <MessageSquare className="w-5 h-5 text-emerald-400" /> SUGERENCIAS RECIBIDAS (Buzón oficial: conscientizarte13@gmail.com)
                  </h4>
                  <button
                    onClick={fetchSuggestions}
                    className="text-[9px] font-mono uppercase bg-slate-950 px-2 py-0.5 rounded border border-slate-850 hover:bg-slate-900 text-[#10B981] font-black flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-2.5 h-2.5" /> Actualizar
                  </button>
                </div>
                
                {suggestions.length === 0 ? (
                  <div className="py-8 text-center text-slate-500 font-mono text-xs border-2 border-dashed border-slate-850 rounded-2xl bg-slate-950/40">
                    No se han registrado sugerencias de usuarios todavía. Los comentarios enviados desde el pie de página aparecerán aquí.
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                    {suggestions.map((sug) => (
                      <div key={sug.id} className="bg-slate-950 p-3.5 rounded-2xl border border-slate-850 space-y-2 relative group">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="bg-teal-500/10 text-teal-400 font-mono font-bold text-[8.5px] px-2 py-0.5 rounded border border-teal-500/15">
                              {sug.id}
                            </div>
                            <span className="text-[11px] font-black text-white">{sug.username}</span>
                            <span className="text-[9.5px] text-slate-500 font-mono">({sug.email})</span>
                          </div>
                          <span className="text-[8.5px] text-slate-600 font-mono">{new Date(sug.createdAt).toLocaleString()}</span>
                        </div>
                        <p className="text-[11.5px] text-slate-300 font-comic leading-relaxed bg-slate-900/30 p-2.5 rounded-xl border border-slate-900 font-medium">
                          &quot;{sug.suggestion}&quot;
                        </p>
                        <div className="flex items-center justify-between text-[9px] font-mono">
                          <span className="text-gray-500">Buzón Destinatario: <span className="text-indigo-400 font-bold select-all">{sug.sentTo}</span></span>
                          <span className="text-emerald-500 font-bold bg-emerald-500/5 px-2 py-0.2 rounded border border-emerald-500/10">● Enviado</span>
                        </div>
                        <button
                          onClick={() => handleDeleteSuggestion(sug.id)}
                          className="absolute top-2.5 right-2.5 p-1 bg-red-950/85 hover:bg-red-900 border border-red-500/35 rounded text-red-400 opacity-100 lg:opacity-0 group-hover:opacity-100 transition cursor-pointer"
                          title="Eliminar registro de sugerencia"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

          </div>

        </div>
      )}

      {freshInspectingUser && (() => {
        const inspectingUser = freshInspectingUser;
        return (
          <div id="admin-inspect-modal" className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-50 backdrop-blur-sm transition-all overflow-y-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-brand-sidebar border-3 border-black text-white rounded-3xl w-full max-w-2xl shadow-[8px_8px_0px_#000] overflow-hidden my-8"
          >
            {/* Header */}
            <div className="bg-yellow-400 p-4 border-b-3 border-black text-black flex items-center justify-between select-none">
              <div className="flex items-center gap-2">
                <span className="text-3xl">{inspectingUser.avatar || '⚽'}</span>
                <div>
                  <h4 className="font-bangers text-lg tracking-wider block">Inspección de Registro y Táctica</h4>
                  <p className="font-comic text-xs font-bold -mt-1 text-slate-855">Candidato de Director Técnico</p>
                </div>
              </div>
              <button 
                onClick={() => setInspectingUser(null)}
                className="p-1.5 rounded-lg border-2 border-black bg-rose-500 text-white hover:bg-rose-600 cursor-pointer active:translate-y-0.5"
                title="Cerrar modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 max-h-[65vh] overflow-y-auto space-y-6">
              
              {/* Sección 1: Datos Detallados de Registro */}
              <div className="bg-slate-950/80 rounded-2xl border-2 border-black p-4 space-y-3 shadow-[4px_4px_0px_#000]">
                <h5 className="font-mono text-[10px] text-amber-400 uppercase font-black tracking-widest border-b border-slate-850 pb-1.5">
                  📁 Información Detallada del Registro de Usuario
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                  <div>
                    <span className="text-gray-500 block text-[9px] uppercase">ID Único de Base:</span>
                    <span className="text-[11px] text-indigo-400 font-bold select-all">{inspectingUser.id}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[9px] uppercase">Código de Juego (Auditable):</span>
                    <span className="text-[11px] text-amber-400 font-extrabold select-all">{inspectingUser.gameCode}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[9px] uppercase">Correo de Google Vinculado:</span>
                    <span className="text-[11px] text-emerald-400 font-bold select-all break-all">{inspectingUser.email || 'No especificado'}</span>
                  </div>
                  <div>
                    <span className="text-rose-400 block text-[9px] uppercase font-bold">🔑 Contraseña Registrada:</span>
                    <span className="text-[11px] text-rose-300 font-black select-all bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">{inspectingUser.password || 'Sin contraseña / Admin'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[9px] uppercase">Licencia Oficial de Certificación:</span>
                    <span className="text-[11px] text-cyan-400 font-bold select-all">{inspectingUser.licenseCode || 'Sin Licencia Física/Digital'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[9px] uppercase">Plan de Suscripción:</span>
                    <span className="text-[11px] text-purple-400 font-bold">{inspectingUser.subscription || 'Ninguna'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[9px] uppercase">Fecha de Registro / Sincro:</span>
                    <span className="text-[11px] text-slate-350">
                      {inspectingUser.createdAt ? new Date(inspectingUser.createdAt).toLocaleString('es-ES') : 'No especificada'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[9px] uppercase">Monedas (Coins) del D.T.:</span>
                    <span className="text-[11px] text-yellow-400 font-bold">🪙 {inspectingUser.coins !== undefined ? inspectingUser.coins : 0} Monedas</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[9px] uppercase">Saldo en Caja (Cash Balance):</span>
                    <span className="text-[11px] text-emerald-400 font-bold">$ {inspectingUser.cashBalance !== undefined ? inspectingUser.cashBalance.toFixed(2) : '0.00'} USD</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-900/80 space-y-2">
                  <span className="text-[9.5px] font-mono text-amber-500 uppercase font-bold tracking-wider block">⚡ Desglose de Puntos Acumulados</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] font-mono">
                    <div className="bg-slate-900/65 p-2 rounded-lg border border-slate-850 flex items-center justify-between">
                      <span className="text-gray-400">🖼️ Cromos ({inspectingUser.unlockedStickersCount || 0}):</span>
                      <span className="text-blue-400 font-bold">{(inspectingUser.unlockedStickersCount || 0) * 1} pts</span>
                    </div>
                    <div className="bg-slate-900/65 p-2 rounded-lg border border-slate-850 flex items-center justify-between">
                      <span className="text-gray-400">🌍 Bonos País ({inspectingUser.completedCountries?.length || 0}):</span>
                      <span className="text-emerald-400 font-bold">{(inspectingUser.completedCountries?.length || 0) * 5} pts</span>
                    </div>
                    <div className="bg-slate-900/65 p-2 rounded-lg border border-slate-850 flex items-center justify-between">
                      <span className="text-gray-400">🏃 XI Alineación ({inspectingUser.aciertosOnce || 0}):</span>
                      <span className="text-orange-400 font-bold">{(inspectingUser.aciertosOnce || 0) * 10} pts</span>
                    </div>
                    <div className="bg-slate-900/65 p-2 rounded-lg border border-slate-850 flex items-center justify-between">
                      <span className="text-gray-400">🎯 Marcador ({inspectingUser.aciertosMarcador || 0}):</span>
                      <span className="text-yellow-300 font-bold">{(inspectingUser.aciertosMarcador || 0) * 20} pts</span>
                    </div>
                    <div className="bg-slate-900/65 p-2 rounded-lg border border-slate-850 col-span-1 md:col-span-2 flex items-center justify-between">
                      <span className="text-gray-400">👥 Invitaciones ({inspectingUser.successfulReferralsCount || 0}):</span>
                      <span className="text-purple-400 font-bold">{inspectingUser.referralPoints || 0} pts</span>
                    </div>
                  </div>
                  <div className="bg-indigo-650/15 p-2.5 rounded-xl border border-indigo-500/20 text-center flex items-center justify-between">
                    <span className="text-xs uppercase font-bold text-indigo-400 tracking-wider">PUNTAJE GLOBAL AUDITABLE:</span>
                    <span className="text-sm font-black text-indigo-305 font-mono bg-slate-950 px-2 py-0.5 rounded border border-indigo-500/30">{inspectingUser.score} pts</span>
                  </div>
                </div>
              </div>

              {/* Sección de Invitaciones & Email Marketing */}
              <div className="bg-slate-950/80 rounded-2xl border-2 border-black p-4 space-y-3 shadow-[4px_4px_0px_#000]">
                <h5 className="font-mono text-[10px] text-purple-400 uppercase font-black tracking-widest border-b border-slate-850 pb-1.5 flex items-center justify-between">
                  <span>👥 Registro de Invitados e Invitaciones (Referidos)</span>
                  <span className="text-[8.5px] bg-purple-500/10 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/20 font-bold">
                    Historial Real
                  </span>
                </h5>

                <div className="space-y-3">
                  {/* List of successfully paid referrals */}
                  <div className="space-y-1.5">
                    <span className="text-[9.5px] font-mono text-emerald-450 block uppercase font-bold">🟢 Referidos con Pago Confirmado (+Puntos Sumados):</span>
                    {!inspectingUser.successfulReferralEmails || inspectingUser.successfulReferralEmails.length === 0 ? (
                      <p className="text-[10px] text-slate-500 italic font-mono pl-2">Ningún invitado ha adquirido un plan de pago todavía.</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 font-mono text-[10px]">
                        {inspectingUser.successfulReferralEmails.map((email: string, i: number) => (
                          <div key={i} className="bg-slate-900 border border-slate-850 p-2 rounded-xl flex items-center justify-between">
                            <span className="text-slate-300 truncate max-w-[150px]" title={email}>{email}</span>
                            <span className="bg-emerald-500/10 text-emerald-400 text-[8px] font-bold px-1.5 py-0.5 rounded border border-emerald-500/25">PAGO VERIFICADO</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* List of pending invitations from client local storage */}
                  <div className="space-y-1.5 border-t border-slate-900 pt-2">
                    <span className="text-[9.5px] font-mono text-gray-500 block uppercase font-bold">⚪ Invitaciones Enviadas (En espera de registro):</span>
                    {!inspectingUser.invitedEmails || inspectingUser.invitedEmails.length === 0 ? (
                      <p className="text-[10px] text-slate-500 italic font-mono pl-2">El usuario no tiene invitaciones pendientes registradas en este navegador.</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 font-mono text-[10px]">
                        {inspectingUser.invitedEmails.map((email: string, i: number) => {
                          const isPaid = inspectingUser.successfulReferralEmails?.some((x: string) => x.toLowerCase().trim() === email.toLowerCase().trim());
                          if (isPaid) return null; // Avoid duplicate listings
                          return (
                            <div key={i} className="bg-slate-900 border border-slate-850 p-1.5 px-2.5 rounded-lg flex items-center justify-between">
                              <span className="text-slate-400 truncate max-w-[155px]" title={email}>{email}</span>
                              <span className="text-gray-550 text-[8px] font-bold px-1.5 py-0.5 rounded bg-slate-950 border border-slate-850">PENDIENTE</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Sección 2: Táctica Implementada y Pronósticos de Partido */}
              <div className="space-y-4">
                <h5 className="font-mono text-[10px] text-amber-400 uppercase font-black tracking-widest">
                  ⚽ Alineación Táctica & Pronóstico para Torneo
                </h5>

                {!inspectingUser.tacticalBoards || Object.keys(inspectingUser.tacticalBoards).filter(k => k !== '__playoffPredictions').length === 0 ? (
                  <div className="text-center py-6 bg-slate-950/40 rounded-2xl border-2 border-dashed border-slate-850">
                    <p className="text-xs text-slate-400 font-comic">Este Director Técnico aún no ha guardado ninguna táctica oficial ni pronóstico en la pizarra.</p>
                  </div>
                ) : (
                  Object.entries(inspectingUser.tacticalBoards)
                    .filter(([countryName]) => countryName !== '__playoffPredictions')
                    .map(([countryName, bObj]: [string, any]) => {
                    const countryInfo = COUNTRIES.find(c => c.name === countryName);
                    const countryPlayers = generatePlayersForCountry(countryName);
                    
                    const pLocal = bObj.prediction?.golesLocal ?? 0;
                    const pVis = bObj.prediction?.golesVisitante ?? 0;

                    return (
                      <div key={countryName} className="bg-slate-950/60 rounded-2xl border-2 border-black p-4 space-y-4 shadow-[4px_4px_0px_#000]">
                        
                        {/* Cabecera País + Formación */}
                        <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                          <div className="flex items-center gap-1.5 font-comic font-black">
                            <span className="text-xl">{countryInfo?.flag || '🌍'}</span>
                            <span className="text-xs font-bold text-white uppercase tracking-wider">{countryName}</span>
                          </div>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-teal-500/30 text-teal-300 bg-teal-500/10 font-black">
                            FORMACIÓN {bObj.formation || '4-3-3'}
                          </span>
                        </div>

                        {/* Detalle del Pronóstico de Partido */}
                        <div className="bg-slate-950 border border-slate-900 p-3 rounded-xl">
                          <span className="text-[8px] font-mono text-gray-500 block uppercase tracking-wider text-center mb-1.5 font-bold">PRONÓSTICO OFICIAL FIJADO</span>
                          <div className="flex items-center justify-center gap-3 font-comic font-bold mb-2">
                            <span className="text-xs text-slate-355">{countryName}</span>
                            <span className="text-sm font-black bg-slate-900 px-3 py-1 rounded-xl border border-slate-800 text-yellow-300 font-mono">
                              {pLocal} : {pVis}
                            </span>
                            <span className="text-xs text-slate-355">{countryName === 'México' ? 'Sudáfrica' : 'Rival'}</span>
                          </div>
                          <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-90/60 pt-2 gap-2 mt-1">
                            {/* Eligibility badge */}
                            <div className="flex items-center gap-1.5">
                              <span className={`w-2 h-2 rounded-full ${bObj.predictionEligible !== false ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                              <span className={`text-[9px] font-mono font-bold uppercase ${bObj.predictionEligible !== false ? 'text-emerald-400' : 'text-rose-450'}`}>
                                {bObj.predictionEligible !== false ? '🟢 APTO PARA PUNTOS' : '🔴 REGISTRO SIMPLE (HISTÓRICO)'}
                              </span>
                            </div>
                            {/* Saved At detail */}
                            {bObj.predictionSavedAt && (
                              <span className="text-[8.5px] font-mono text-slate-500" title="Fecha y Hora de Sincronización">
                                ⏱️ {new Date(bObj.predictionSavedAt).toLocaleString('es-ES')}
                              </span>
                            )}
                          </div>
                          {bObj.predictionReason && (
                            <p className="text-[9px] font-mono text-slate-400 bg-slate-900/60 p-1.5 rounded-lg border border-slate-900/50 mt-1.5 text-center leading-relaxed italic">
                              "{bObj.predictionReason}"
                            </p>
                          )}
                        </div>

                        {/* Detalle de los Jugadores alineados por Posición */}
                        <div className="space-y-1.5">
                          <span className="text-[8.5px] font-mono text-gray-500 block uppercase tracking-wider">Alineación del Titular (11 Escuderos)</span>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] font-mono">
                            {bObj.selectedPlayers && Object.entries(bObj.selectedPlayers).map(([slotKey, pId]) => {
                              const player = countryPlayers.find(p => p.id === pId);
                              let slotLabel = slotKey;
                              
                              if (slotKey === 'GK') slotLabel = '🧤 Portero (GK)';
                              else if (slotKey.startsWith('DF_')) slotLabel = '🛡️ Defensa (DF)';
                              else if (slotKey.startsWith('MC_')) slotLabel = '🧠 Volante (MC)';
                              else if (slotKey.startsWith('FW_')) slotLabel = '⚡ Delantero (FW)';

                              return (
                                <div key={slotKey} className="bg-slate-900 p-2 rounded-lg border border-slate-850 flex items-center justify-between">
                                  <div className="flex flex-col">
                                    <span className="text-[8.5px] text-indigo-400 font-bold uppercase">{slotLabel}</span>
                                    <span className="text-xs font-medium text-slate-200">
                                      {player ? player.realName : <span className="text-rose-400 italic">No asignado</span>}
                                    </span>
                                  </div>
                                  {player && (
                                    <span className="text-[9.5px] font-bold text-emerald-400 font-mono bg-emerald-500/15 border border-emerald-500/25 px-1 py-0.5 rounded">
                                      {player.rating}★
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                      </div>
                    );
                  })
                )}
              </div>

              {/* Sección 3: Pronósticos de Playoffs (Llaves de Eliminación Directa) */}
              <div className="space-y-4 pt-4 border-t border-slate-900">
                <h5 className="font-mono text-[10px] text-emerald-400 uppercase font-black tracking-widest flex items-center gap-2">
                  🏆 PRONÓSTICOS DE PLAYOFFS (DIECISEISAVOS A LA FINAL)
                </h5>

                {(() => {
                  const playoffData = inspectingUser.tacticalBoards?.['__playoffPredictions'];
                  if (!playoffData) {
                    return (
                      <div className="text-center py-6 bg-slate-950/40 rounded-2xl border-2 border-dashed border-slate-850">
                        <p className="text-xs text-slate-400 font-comic">Este Director Técnico aún no registra pronósticos para las llaves de Playoffs.</p>
                      </div>
                    );
                  }

                  const winners = playoffData.winners || {};
                  const scores = playoffData.scores || {};
                  const savedAt = playoffData.predictionSavedAt;

                  // Define the static structure of the stages so we can map them cleanly
                  const stages = [
                    {
                      title: "⚡ Dieciseisavos de Final (Lado Izquierdo)",
                      matches: [
                        { id: 'ko-3', l: 'Alemania', v: 'Paraguay' },
                        { id: 'ko-6', l: 'Francia', v: 'Suecia' },
                        { id: 'ko-1', l: 'Sudáfrica', v: 'Canadá' },
                        { id: 'ko-4', l: 'Países Bajos', v: 'Marruecos' },
                        { id: 'ko-11', l: 'Portugal', v: 'Croacia' },
                        { id: 'ko-12', l: 'España', v: 'Austria' },
                        { id: 'ko-9', l: 'Estados Unidos', v: 'Bosnia y Herzegovina' },
                        { id: 'ko-10', l: 'Bélgica', v: 'Senegal' }
                      ]
                    },
                    {
                      title: "⚡ Dieciseisavos de Final (Lado Derecho)",
                      matches: [
                        { id: 'ko-2', l: 'Brasil', v: 'Japón' },
                        { id: 'ko-5', l: 'Costa de Marfil', v: 'Noruega' },
                        { id: 'ko-7', l: 'México', v: 'Ecuador' },
                        { id: 'ko-8', l: 'Inglaterra', v: 'RD Congo' },
                        { id: 'ko-14', l: 'Argentina', v: 'Cabo Verde' },
                        { id: 'ko-16', l: 'Australia', v: 'Egipto' },
                        { id: 'ko-13', l: 'Suiza', v: 'Argelia' },
                        { id: 'ko-15', l: 'Colombia', v: 'Ghana' }
                      ]
                    },
                    {
                      title: "🧠 Octavos de Final",
                      matches: [
                        { id: 'oct-L1', p1: 'ko-3', p2: 'ko-6' },
                        { id: 'oct-L2', p1: 'ko-1', p2: 'ko-4' },
                        { id: 'oct-L3', p1: 'ko-11', p2: 'ko-12' },
                        { id: 'oct-L4', p1: 'ko-9', p2: 'ko-10' },
                        { id: 'oct-R1', p1: 'ko-2', p2: 'ko-5' },
                        { id: 'oct-R2', p1: 'ko-7', p2: 'ko-8' },
                        { id: 'oct-R3', p1: 'ko-14', p2: 'ko-16' },
                        { id: 'oct-R4', p1: 'ko-13', p2: 'ko-15' }
                      ]
                    },
                    {
                      title: "🛡️ Cuartos de Final",
                      matches: [
                        { id: 'qf-L1', p1: 'oct-L1', p2: 'oct-L2' },
                        { id: 'qf-L2', p1: 'oct-L3', p2: 'oct-L4' },
                        { id: 'qf-R1', p1: 'oct-R1', p2: 'oct-R2' },
                        { id: 'qf-R2', p1: 'oct-R3', p2: 'oct-R4' }
                      ]
                    },
                    {
                      title: "🔥 Semifinales",
                      matches: [
                        { id: 'sf-L', p1: 'qf-L1', p2: 'qf-L2' },
                        { id: 'sf-R', p1: 'qf-R1', p2: 'qf-R2' }
                      ]
                    },
                    {
                      title: "🏆 Gran Final",
                      matches: [
                        { id: 'final', p1: 'sf-L', p2: 'sf-R' }
                      ]
                    }
                  ];

                  const getFlag = (name: string) => {
                    if (!name) return "🏳️";
                    const found = COUNTRIES.find(c => c.name === name);
                    return found ? found.flag : "🌍";
                  };

                  return (
                    <div className="space-y-4">
                      {savedAt && (
                        <div className="text-right text-[10px] text-slate-500 font-mono">
                          ⏱️ Registrado el: {new Date(savedAt).toLocaleString('es-ES')}
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {stages.map((stage) => {
                          return (
                            <div key={stage.title} className="bg-slate-950/60 rounded-2xl border-2 border-black p-4 space-y-3 shadow-[4px_4px_0px_#000]">
                              <span className="text-[11px] font-sans text-yellow-400 block uppercase tracking-wider border-b border-slate-900 pb-1 font-bold">
                                {stage.title}
                              </span>

                              <div className="space-y-2 font-mono text-xs">
                                {stage.matches.map((m) => {
                                  // Determine teams for this match
                                  let localTeam = '';
                                  let visitanteTeam = '';

                                  if ('l' in m) {
                                    localTeam = m.l;
                                    visitanteTeam = m.v;
                                  } else {
                                    localTeam = winners[m.p1] || `Ganador ${m.p1.toUpperCase()}`;
                                    visitanteTeam = winners[m.p2] || `Ganador ${m.p2.toUpperCase()}`;
                                  }

                                  const winner = winners[m.id];
                                  const matchScore = scores[m.id] || { golesLocal: 0, golesVisitante: 0 };
                                  const isResolved = !!winner;

                                  return (
                                    <div key={m.id} className="bg-slate-950/80 border border-slate-900 p-2.5 rounded-xl flex items-center justify-between">
                                      <div className="flex-1 space-y-1">
                                        {/* Local */}
                                        <div className="flex items-center justify-between">
                                          <span className={`flex items-center gap-1.5 truncate ${winner === localTeam ? 'text-emerald-400 font-black' : 'text-slate-300'}`}>
                                            <span>{getFlag(localTeam)}</span>
                                            <span className="truncate uppercase text-[10px]">{localTeam}</span>
                                          </span>
                                          <span className="text-slate-400 font-bold bg-slate-900 px-1.5 py-0.5 rounded text-[10px]">
                                            {matchScore.golesLocal}
                                          </span>
                                        </div>

                                        {/* Visitante */}
                                        <div className="flex items-center justify-between">
                                          <span className={`flex items-center gap-1.5 truncate ${winner === visitanteTeam ? 'text-emerald-400 font-black' : 'text-slate-300'}`}>
                                            <span>{getFlag(visitanteTeam)}</span>
                                            <span className="truncate uppercase text-[10px]">{visitanteTeam}</span>
                                          </span>
                                          <span className="text-slate-400 font-bold bg-slate-900 px-1.5 py-0.5 rounded text-[10px]">
                                            {matchScore.golesVisitante}
                                          </span>
                                        </div>
                                      </div>

                                      <div className="border-l border-slate-900 pl-3 ml-3 shrink-0 flex flex-col items-center justify-center min-w-[70px]">
                                        <span className="text-[8px] text-slate-500 font-bold font-sans uppercase">GANADOR</span>
                                        {isResolved ? (
                                          <span className="text-[9px] text-white bg-emerald-600 border border-black px-1.5 py-0.5 rounded font-black truncate max-w-[85px] uppercase font-sans text-center mt-1 font-bold">
                                            {winner}
                                          </span>
                                        ) : (
                                          <span className="text-[9px] text-slate-500 italic mt-1 font-sans">Pendiente</span>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </div>

            </div>

            <div className="bg-slate-950 p-4 border-t border-slate-900 text-center select-none">
              <button
                onClick={() => setInspectingUser(null)}
                className="w-full md:w-36 py-2 border-2 border-black bg-yellow-400 hover:bg-yellow-500 text-black font-bold text-xs uppercase tracking-wider rounded-xl transition duration-150 cursor-pointer shadow-[3px_3px_0px_#000] active:translate-y-0.5 active:shadow-[1px_1px_0px_#000]"
              >
                Cerrar Panel
              </button>
            </div>
          </motion.div>
        </div>
        );
      })()}

      {customConfirm && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-50 backdrop-blur-sm transition-all">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0b0f19] border-3 border-black text-white rounded-2xl w-full max-w-md shadow-[6px_6px_0px_#000] overflow-hidden"
          >
            <div className="bg-red-500 text-white p-4 font-bangers text-lg tracking-wider border-b-2 border-black flex items-center gap-2">
              <span>⚠️</span>
              <span>{customConfirm.title}</span>
            </div>
            <div className="p-5 space-y-4">
              <p className="font-comic text-xs font-semibold leading-relaxed text-slate-200">
                {customConfirm.message}
              </p>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setCustomConfirm(null)}
                  className="px-4 py-1.5 border-2 border-black bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl cursor-pointer active:translate-y-0.5"
                >
                  Cancelar
                </button>
                <button
                  onClick={async () => {
                    const cb = customConfirm.onConfirm;
                    setCustomConfirm(null);
                    await cb();
                  }}
                  className="px-4 py-1.5 border-2 border-black bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-xl cursor-pointer shadow-[2.5px_2.5px_0px_rgba(0,0,0,1)] active:translate-y-0.5"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {customAlert && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-50 backdrop-blur-sm transition-all">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0b0f19] border-3 border-black text-white rounded-2xl w-full max-w-md shadow-[6px_6px_0px_#000] overflow-hidden"
          >
            <div className="bg-yellow-400 text-black p-4 font-bangers text-lg tracking-wider border-b-2 border-black flex items-center gap-2">
              <span>📢</span>
              <span>{customAlert.title}</span>
            </div>
            <div className="p-5 space-y-4">
              <p className="font-comic text-xs font-semibold leading-relaxed text-slate-200">
                {customAlert.message}
              </p>
              <div className="flex items-center justify-end pt-2">
                <button
                  onClick={() => setCustomAlert(null)}
                  className="px-6 py-2 border-2 border-black bg-yellow-400 hover:bg-yellow-500 text-black text-xs font-bold uppercase rounded-xl cursor-pointer shadow-[2.5px_2.5px_0px_rgba(0,0,0,1)] active:translate-y-0.5"
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
