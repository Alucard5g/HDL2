import React, { useState, useEffect } from 'react';
import { 
  Check, 
  ShieldCheck, 
  Sparkles, 
  AlertCircle, 
  Award, 
  CreditCard, 
  RefreshCw, 
  MapPin, 
  Globe, 
  QrCode, 
  Smartphone, 
  Building, 
  Coins, 
  UserCheck, 
  ArrowRight,
  Info,
  Heart,
  BookOpen,
  Users,
  Gift,
  Lock,
  Zap
} from 'lucide-react';
import { motion } from 'motion/react';
import SocialImpactStadium from './SocialImpactStadium';
import { COUNTRIES } from '../data';
import { DTAvatarRenderer, AvatarConfig } from './DTAvatarRenderer';

const localStorage = (() => {
  try {
    const test = window.localStorage;
    const testKey = '__test_local_storage_sub__';
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

interface SubscriptionViewProps {
  currentSubscription: string;
  userCode: string;
  onUpdateSubscription: (newPlan: string) => void;
  scoutChosenCountry: string;
  onUpdateScoutCountry: (country: string) => void;
  currentUserId?: string;
  userEmail?: string;
  userLicense?: string;
  userPassword?: string;
  onUpdatePassword?: (pass: string) => void;
  onRequestOpenRegistration?: () => void;
  userCoins?: number;
  onUpdateCoins?: (newCoins: number) => void;
  userCashBalance?: number;
  onUpdateCashBalance?: (newBalance: number) => void;
  paymentHistory?: any[];
  onAddTransaction?: (desc: string, amt: number, type: 'cash' | 'coins') => void;
  onOpenBonusPack?: () => void;
  unlockedLevels?: { [country: string]: { [level: number]: boolean } };
  onSetUnlockedLevels?: (levels: { [country: string]: { [level: number]: boolean } }) => void;
  onAddPurchasedPoints?: (points: number) => void;
  vipChosenContinent?: string;
  onUpdateVipContinent?: (continent: string) => void;
  manuallyUnlockedPlayerIds?: { [playerId: string]: boolean };
  onUpdateManuallyUnlockedPlayerIds?: (ids: { [playerId: string]: boolean }) => void;
  communityBasePool?: number;
  onUpdateCommunityBasePool?: (newVal: number) => void;
  personalDonationTotal?: number;
  onUpdatePersonalDonationTotal?: (newVal: number) => void;
}

export default function SubscriptionView({ 
  currentSubscription, 
  userCode, 
  onUpdateSubscription,
  scoutChosenCountry,
  onUpdateScoutCountry,
  currentUserId = 'user_me',
  userEmail = '',
  userLicense = '',
  userPassword = '',
  onUpdatePassword = () => {},
  onRequestOpenRegistration = () => {},
  userCoins = 350,
  onUpdateCoins = () => {},
  userCashBalance = 15.00,
  onUpdateCashBalance = () => {},
  paymentHistory = [],
  onAddTransaction = () => {},
  onOpenBonusPack = () => {},
  unlockedLevels = {},
  onSetUnlockedLevels = () => {},
  onAddPurchasedPoints = () => {},
  vipChosenContinent = 'América',
  onUpdateVipContinent = () => {},
  manuallyUnlockedPlayerIds = {},
  onUpdateManuallyUnlockedPlayerIds = () => {},
  communityBasePool,
  onUpdateCommunityBasePool,
  personalDonationTotal,
  onUpdatePersonalDonationTotal
}: SubscriptionViewProps) {
  const [purchaseLoading, setPurchaseLoading] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [promoCode, setPromoCode] = useState<string>('');
  const [promoError, setPromoError] = useState<string>('');

  // Fichajes Flash States & Calculation
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    const updateTimer = () => {
      const now = Date.now();
      const twelveHoursMs = 12 * 60 * 60 * 1000;
      const nextRefresh = Math.ceil(now / twelveHoursMs) * twelveHoursMs;
      const diff = nextRefresh - now;

      const hrs = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(`${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
    };

    updateTimer();
    const timerId = setInterval(updateTimer, 1000);
    return () => clearInterval(timerId);
  }, []);

  const getFichajesFlashPlayers = () => {
    const period = Math.floor(Date.now() / (12 * 60 * 60 * 1000));
    const candidates = [
      { id: 'ar-10', name: 'El 10 de Argentina', realName: 'Lionel Messi', country: 'Argentina', rating: 98, price: 0.99, imageSeed: 'messi_star_wc' },
      { id: 'br-10', name: 'La Joya de Brasil', realName: 'Neymar Jr', country: 'Brasil', rating: 94, price: 0.79, imageSeed: 'neymar_star_wc' },
      { id: 'fr-10', name: 'El Rayo de Francia', realName: 'Kylian Mbappé', country: 'Francia', rating: 96, price: 0.99, imageSeed: 'mbappe_star_wc' },
      { id: 'no-9', name: 'El Cíborg de Noruega', realName: 'Erling Haaland', country: 'Noruega', rating: 95, price: 0.99, imageSeed: 'haaland_star_wc' },
      { id: 'es-16', name: 'El Motor de España', realName: 'Rodri', country: 'España', rating: 93, price: 0.79, imageSeed: 'rodri_star_wc' },
      { id: 'de-10', name: 'El Cerebro de Alemania', realName: 'Florian Wirtz', country: 'Alemania', rating: 91, price: 0.49, imageSeed: 'wirtz_star_wc' },
      { id: 'eg-10', name: 'El Faraón de Egipto', realName: 'Mohamed Salah', country: 'Egipto', rating: 92, price: 0.79, imageSeed: 'salah_star_wc' },
      { id: 'uy-15', name: 'El Halcón de Uruguay', realName: 'Federico Valverde', country: 'Uruguay', rating: 91, price: 0.49, imageSeed: 'valverde_star_wc' },
      { id: 'ec-10', name: 'El Diez de Ecuador', realName: 'Kendry Páez', country: 'Ecuador', rating: 88, price: 0.49, imageSeed: 'paez_star_wc' }
    ];

    const idx1 = period % candidates.length;
    const idx2 = (period + 3) % candidates.length;
    const idx3 = (period + 7) % candidates.length;
    
    const finalCandidates = [candidates[idx1]];
    if (candidates[idx2].id !== candidates[idx1].id) {
      finalCandidates.push(candidates[idx2]);
    } else {
      finalCandidates.push(candidates[(idx2 + 1) % candidates.length]);
    }

    const thirdIdx = candidates[idx3].id !== candidates[idx1].id && candidates[idx3].id !== finalCandidates[1].id
      ? idx3
      : (idx3 + 2) % candidates.length;
    finalCandidates.push(candidates[thirdIdx]);

    return finalCandidates;
  };

  const handlePurchaseFlashPlayer = (player: any) => {
    setSuccessMsg(null);
    if (!manuallyUnlockedPlayerIds) {
      alert("Error: El sistema de inventario no está listo. Intenta de nuevo.");
      return;
    }

    if (manuallyUnlockedPlayerIds[player.id]) {
      alert("¡Ya posees esta tarjeta en tu colección!");
      return;
    }

    // Set payment target states
    setSelectedFlashPlayer(player);
    
    // Reset modal states
    setPaymentError('');
    setCardName('');
    setCardNumber('');
    setCardExpiry('');
    setCardCvv('');
    setPhoneNumber('');
    setPayphoneOtp('');
    setOtpSent(false);
    setDeunaReference('');
    setBankReference('');
    setCashCodeVal('');
    setTransferCodeVal('');

    setShowPaymentModal('flash-player');
  };

  // Payment checkout modal states
  const [showPaymentModal, setShowPaymentModal] = useState<string | null>(null);
  // payment modes: 'deuna' | 'payphone' | 'transferencia' | 'efectivo' | 'stripe'
  const [paymentGateway, setPaymentGateway] = useState<'deuna' | 'payphone' | 'transferencia' | 'efectivo' | 'stripe'>('efectivo');
  
  // Selection states for Segmented pricing of purchases
  const [selectedContinentToPurchase, setSelectedContinentToPurchase] = useState<string>('América');
  const [selectedCountryToPurchase, setSelectedCountryToPurchase] = useState<string>('Argentina');
  
  // Form values
  const [cardName, setCardName] = useState<string>('');
  const [cardNumber, setCardNumber] = useState<string>('');
  const [cardExpiry, setCardExpiry] = useState<string>('');
  const [cardCvv, setCardCvv] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [payphoneOtp, setPayphoneOtp] = useState<string>('');
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [payphoneSubMode, setPayphoneSubMode] = useState<'app' | 'card'>('app');
  
  const [deunaReference, setDeunaReference] = useState<string>('');
  const [bankReference, setBankReference] = useState<string>('');
  const [cashCodeVal, setCashCodeVal] = useState<string>('');
  const [transferCodeVal, setTransferCodeVal] = useState<string>('');
  
  const [submittingPayment, setSubmittingPayment] = useState<boolean>(false);
  const [paymentError, setPaymentError] = useState<string>('');

  // Warning when unregistered user clicks on any plan
  const [showUnregisteredAlert, setShowUnregisteredAlert] = useState<boolean>(false);

  const [showGoldenGiftModal, setShowGoldenGiftModal] = useState<boolean>(false);
  const [lastPurchasedDetails, setLastPurchasedDetails] = useState<{ name: string; price: string; contribution: string }>({ name: '', price: '', contribution: '' });
  const [addDonation, setAddDonation] = useState<boolean>(true);

  // Flash Player target selection
  const [selectedFlashPlayer, setSelectedFlashPlayer] = useState<any | null>(null);

  // Charity & Social Impact Module States (Nutrición y Alfabetización Infantil)
  const [localPersonalDonationTotal, setLocalPersonalDonationTotal] = useState<number>(() => {
    return Number(localStorage.getItem('album_user_donations_total') || '0');
  });
  const [localCommunityBasePool, setLocalCommunityBasePool] = useState<number>(() => {
    const stored = localStorage.getItem('album_community_donations_base');
    if (!stored || stored === '14250') {
      localStorage.setItem('album_community_donations_base', '50');
      return 50;
    }
    return Number(stored);
  });

  const activePersonalDonationTotal = personalDonationTotal !== undefined ? personalDonationTotal : localPersonalDonationTotal;
  const activeCommunityBasePool = communityBasePool !== undefined ? communityBasePool : localCommunityBasePool;

  const updatePersonalDonationTotal = (val: number) => {
    if (onUpdatePersonalDonationTotal) {
      onUpdatePersonalDonationTotal(val);
    } else {
      setLocalPersonalDonationTotal(val);
      localStorage.setItem('album_user_donations_total', String(val));
    }
  };

  const updateCommunityBasePool = (val: number) => {
    if (onUpdateCommunityBasePool) {
      onUpdateCommunityBasePool(val);
    } else {
      setLocalCommunityBasePool(val);
      localStorage.setItem('album_community_donations_base', String(val));
    }
  };
  const [donationInput, setDonationInput] = useState<string>('10');
  const [chosenCharityCause, setChosenCharityCause] = useState<'nutrition' | 'literacy' | 'all'>('all');
  const [showDonationSuccessAlert, setShowDonationSuccessAlert] = useState<boolean>(false);
  const [lastDonatedAmount, setLastDonatedAmount] = useState<number>(0);
  const [isDonatingProgress, setIsDonatingProgress] = useState<boolean>(false);
  const [donationPaymentMethod, setDonationPaymentMethod] = useState<'deuna' | 'payphone' | 'transferencia'>('deuna');
  const [donationFormReference, setDonationFormReference] = useState<string>('');
  const [donationErrorStr, setDonationErrorStr] = useState<string>('');

  const handleDonateDirectly = (amount: number) => {
    // Under the "no hay billetera" rule, we directly process donation updates without wallet checks or deductions
    onAddTransaction(`Aporte Solidario Directo para causas infantiles`, -amount, 'cash');
    
    // Update personal donations total
    const nextPersonalTotal = activePersonalDonationTotal + amount;
    updatePersonalDonationTotal(nextPersonalTotal);

    // Also increase the community base pool in real-time
    const nextCommunityPool = activeCommunityBasePool + amount;
    updateCommunityBasePool(nextCommunityPool);
    
    setLastDonatedAmount(amount);
    setShowDonationSuccessAlert(true);
  };

  const handleDonationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDonationErrorStr('');
    
    const amount = parseFloat(donationInput);
    if (isNaN(amount) || amount <= 0) {
      setDonationErrorStr('Por favor, ingresa un monto válido mayor a $0.');
      return;
    }

    if (donationPaymentMethod !== 'payphone' && (!donationFormReference.trim() || donationFormReference.trim().length < 4)) {
      setDonationErrorStr('Por favor ingresa la referencia o número de transferencia de tu envío.');
      return;
    }

    setIsDonatingProgress(true);

    setTimeout(() => {
      const newPersonalTotal = activePersonalDonationTotal + amount;
      const newCommunityBase = activeCommunityBasePool + amount; 
      updatePersonalDonationTotal(newPersonalTotal);
      updateCommunityBasePool(newCommunityBase);
      
      setLastDonatedAmount(amount);
      setShowDonationSuccessAlert(true);
      setIsDonatingProgress(false);
      setDonationFormReference('');
    }, 1200);
  };

  // Dynamic state for location-based pricing selection: Ecuador, España, Internacional
  const [pricingLocation, setPricingLocation] = useState<'Ecuador' | 'España' | 'Internacional'>(() => {
    const ref = localStorage.getItem('affiliate_ref') || '';
    const cleanRef = ref.toUpperCase().trim();
    if (cleanRef.startsWith('UIO') || cleanRef.startsWith('GYE')) {
      return 'Ecuador';
    } else if (cleanRef.startsWith('MAD')) {
      return 'España';
    }
    return 'Ecuador'; // Default to Ecuador per instructions
  });

  const getCountriesForVIPSelection = (selection: string): string[] => {
    if (selection === 'América') {
      return [
        'México', 'Canadá', 'Brasil', 'Haití', 'Estados Unidos', 'Paraguay', 
        'Curazao', 'Ecuador', 'Uruguay', 'Argentina', 'Colombia', 'Panamá'
      ];
    }
    if (selection === 'Europa') {
      return [
        'República Checa', 'Bosnia y Herzegovina', 'Suiza', 'Escocia', 'Turquía', 
        'Alemania', 'Países Bajos', 'Suecia', 'Bélgica', 'España', 
        'Francia', 'Noruega', 'Austria', 'Portugal', 'Inglaterra', 'Croacia'
      ];
    }
    // África, Asia y Oceanía
    return [
      'Sudáfrica', 'Catar', 'Marruecos', 'Australia', 'Costa de Marfil', 
      'Japón', 'Túnez', 'Egipto', 'Irán', 'Nueva Zelanda', 'Cabo Verde', 
      'Arabia Saudita', 'Senegal', 'Irak', 'Argelia', 'Jordania', 
      'RD Congo', 'Uzbekistán', 'Ghana'
    ];
  };

  const processPurchaseUnlocks = (planTier: string) => {
    if (!unlockedLevels || !onSetUnlockedLevels) return null;

    const nextUnlocked = { ...unlockedLevels };
    let desc = '';

    if (planTier === 'Pase de Temporada') {
      COUNTRIES.forEach(country => {
        nextUnlocked[country.name] = { 1: true, 2: true, 3: true };
      });
      desc = `Pase de Temporada: Acceso Total`;
      onUpdateSubscription('Pase de Temporada');
    } else if (planTier === 'Pase VIP Elite') {
      const countries = getCountriesForVIPSelection(selectedContinentToPurchase);
      countries.forEach(country => {
        nextUnlocked[country] = { 1: true, 2: true, 3: true };
      });
      desc = `Canje VIP: Continente ${selectedContinentToPurchase}`;
      onUpdateVipContinent(selectedContinentToPurchase);
      onUpdateSubscription('Pase VIP Elite');
    } else if (planTier === 'Plan Scout Básico') {
      nextUnlocked[selectedCountryToPurchase] = { 1: true, 2: true, 3: true };
      onUpdateScoutCountry(selectedCountryToPurchase);
      desc = `Canje Scout: Selección ${selectedCountryToPurchase}`;
      
      const scoutUnlocked = JSON.parse(localStorage.getItem('scout_unlocked_countries') || '[]');
      if (!scoutUnlocked.includes(selectedCountryToPurchase)) {
        scoutUnlocked.push(selectedCountryToPurchase);
        localStorage.setItem('scout_unlocked_countries', JSON.stringify(scoutUnlocked));
      }
    } else if (planTier === 'Paquete Diario de Estampas') {
      const dailySpends = JSON.parse(localStorage.getItem('daily_pack_spends') || '{}');
      const currentSpend = dailySpends[selectedCountryToPurchase] || 0;
      const nextSpend = currentSpend + 2;
      dailySpends[selectedCountryToPurchase] = nextSpend;
      localStorage.setItem('daily_pack_spends', JSON.stringify(dailySpends));

      if (nextSpend >= 10) {
        nextUnlocked[selectedCountryToPurchase] = { 1: true, 2: true, 3: true };
        desc = `Límite Diario Alcanzado: Selección ${selectedCountryToPurchase} Desbloqueada`;
        setTimeout(() => {
          alert(`🎉 ¡PROTECCIÓN CONTRA DUPLICADOS ACTIVADA!\n\n¡Increíble! Has alcanzado un gasto acumulado de $10 en Paquetes Diarios de Estampas para ${selectedCountryToPurchase}. La protección legal contra duplicados se ha activado y esta selección se ha desbloqueado permanentemente y de forma gratuita para tus predicciones.`);
        }, 500);
      } else {
        desc = `Paquete Diario de Estampas: ${selectedCountryToPurchase} ($2) - Gasto Acumulado: $${nextSpend}/$10`;
      }
    } else if (planTier === 'flash-player' && selectedFlashPlayer) {
      const nextUnlockedPlayers = {
        ...manuallyUnlockedPlayerIds,
        [selectedFlashPlayer.id]: true
      };
      if (onUpdateManuallyUnlockedPlayerIds) {
        onUpdateManuallyUnlockedPlayerIds(nextUnlockedPlayers);
      }
      desc = `Fichaje Flash: Adquisición Directa de ${selectedFlashPlayer.realName} (${selectedFlashPlayer.country})`;
    }

    onSetUnlockedLevels(nextUnlocked);
    localStorage.setItem('scouting_unlocked_levels', JSON.stringify(nextUnlocked));

    return { desc };
  };

  const getPlanDetails = (planId: string | null) => {
    if (!planId || planId === 'Ninguna') {
      return { price: '$0.00', amount: 0, text: 'Plan Activo por Defecto' };
    }
    if (planId === 'flash-player' && selectedFlashPlayer) {
      return {
        price: `$${selectedFlashPlayer.price.toFixed(2)}`,
        amount: selectedFlashPlayer.price,
        text: `Fichaje Flash: ${selectedFlashPlayer.realName} (${selectedFlashPlayer.country})`
      };
    }
    if (planId === 'Plan Scout Básico') {
      return { price: '$5.00', amount: 5.00, text: `Desbloquear ${selectedCountryToPurchase} ($5.00)` };
    }
    if (planId === 'Paquete Diario de Estampas') {
      return { price: '$2.00', amount: 2.00, text: `Paquete Diario ${selectedCountryToPurchase} ($2.00)` };
    }
    if (planId === 'Pase VIP Elite') {
      return { price: '$15.00', amount: 15.00, text: `Canjear Continente ${selectedContinentToPurchase} ($15.00)` };
    }
    if (planId === 'Pase de Temporada') {
      return { price: '$20.00', amount: 20.00, text: `Pase de Temporada ($20.00)` };
    }
    return { price: '$0.00', amount: 0, text: 'Plan Activo' };
  };

  const plans = [
    {
      id: 'Ninguna',
      name: 'Plan Gratuito Amateur',
      price: '$0.00',
      period: 'Gratis por siempre',
      desc: 'Acceso básico para coleccionistas casuales.',
      features: [
        'Colecciona sobres resolviendo trivias gratis',
        'Hasta 3 pizarras tácticas guardadas simultáneamente',
        'Hasta 3 selecciones desbloqueables gratis por Trivia'
      ],
      buttonText: 'Plan Activo por Defecto',
      popular: false,
      color: 'border-slate-800 bg-slate-900/40 text-gray-400'
    },
    {
      id: 'Plan Scout Básico',
      name: 'Paquete Scout — Pago Único',
      price: '$5.00',
      period: 'Pago Único por Selección',
      desc: 'Desbloquea una selección nacional al instante por $5.00 (pago único). Permite realizar todos los pronósticos y coleccionar sin límites.',
      features: [
        'Cuesta $5.00 por cada país/selección de tu elección 🎯',
        'Desbloqueo al 100% de la selección elegida inmediatamente 🌟',
        'Inscripción de sorteo garantizada ante notario público'
      ],
      buttonText: 'Adquirir Selección ($5.00)',
      popular: false,
      color: 'border-indigo-500/20 bg-indigo-950/10 text-indigo-300'
    },
    {
      id: 'Paquete Diario de Estampas',
      name: 'Paquete Diario de Estampas',
      price: '$2.00',
      period: 'Adquisición Diaria de Sobres',
      desc: 'Adquiere un paquete diario por $2.00. Con un tope legal acumulado de $10 por selección, se activa la protección contra duplicados y se desbloquea permanentemente.',
      features: [
        'Cuesta $2.00 por paquete de tarjetas de un país diario 📂',
        'Tope estricto de $10 acumulados por selección (5 compras máx) 🛑',
        'Protección contra duplicados: desbloqueo definitivo al llegar a $10 🛡'
      ],
      buttonText: 'Comprar Sobre Diario ($2.00)',
      popular: false,
      color: 'border-emerald-500/20 bg-emerald-950/10 text-emerald-300'
    },
    {
      id: 'Pase VIP Elite',
      name: 'Pase VIP Elite',
      price: '$15.00',
      period: 'Pago Único',
      desc: 'Canjea las tarjetas y predicciones de una confederación o continente entero por $15 (pago único, sin cargos recurrentes).',
      features: [
        'Cuesta $15.00 por continente/confederación de tu elección 🌍',
        'Desbloqueo automático al 100% de todos los países de ese continente 🏆',
        'Insignia dorada VIP de DT verificado en el panel de control'
      ],
      buttonText: 'Adquirir Continente ($15.00)',
      popular: true,
      color: 'border-amber-500 bg-amber-500/5 text-amber-400'
    },
    {
      id: 'Pase de Temporada',
      name: 'Pase de Temporada Full Access',
      price: '$20.00',
      period: 'Pago Único Completo',
      desc: 'Acceso ilimitado a todas las selecciones de todos los continentes sin restricción por solo $20.00 (pago único).',
      features: [
        'Desbloqueo total al 100% de todas las selecciones del juego 🏆',
        'Acceso de por vida a los sorteos de la Copa Mundial 2026',
        'Cero límites en predicciones y pizarras tácticas de fútbol'
      ],
      buttonText: 'Adquirir Pase de Temporada ($20.00)',
      popular: false,
      color: 'border-pink-500 bg-pink-500/5 text-pink-400'
    }
  ];

  const getAvatarConfig = (): AvatarConfig => {
    try {
      const saved = localStorage.getItem('dt_avatar_custom_config');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error(e);
    }
    return {
      avatarType: 'vector',
      hair: 'punta',
      face: 'determinado',
      jersey: 'ecuador',
      accessory: 'none'
    };
  };

  const handleApplyPromo = () => {
    setPromoError('');
    if (promoCode.trim().toUpperCase() === 'GOLDENDT2026') {
      onUpdateSubscription('Pase VIP Elite');
      setSuccessMsg('¡Código Promocional VIP Canjeado con éxito! Bienvenido al Pase VIP Elite con acceso total desbloqueado y +15 puntos acreditados.');
      setPromoCode('');
    } else {
      setPromoError('El código ingresado no existe o ha expirado.');
    }
  };

  // Check registration and open either warning or billing modal
  const handlePlanSelection = (planId: string) => {
    if (planId === 'Ninguna') return;

    setPaymentError('');
    setCardName('');
    setCardNumber('');
    setCardExpiry('');
    setCardCvv('');
    setPhoneNumber('');
    setPayphoneOtp('');
    setOtpSent(false);
    setDeunaReference('');
    setBankReference('');
    setCashCodeVal('');
    
    setShowPaymentModal(planId);
  };

  const incrementDonationsPools = (planTier: string, costAmount: number, addedDonationActive: boolean) => {
    const autoAmount = costAmount * 0.05;
    const suggestedAmount = addedDonationActive ? (costAmount * 0.10) : 0;
    
    const communityAdd = autoAmount + suggestedAmount;
    const personalAdd = autoAmount + suggestedAmount;
    
    if (communityAdd > 0) {
      const newCommunity = activeCommunityBasePool + communityAdd;
      updateCommunityBasePool(newCommunity);
    }
    
    if (personalAdd > 0) {
      const newPersonal = activePersonalDonationTotal + personalAdd;
      updatePersonalDonationTotal(newPersonal);
    }
  };

  const triggerGoldenGiftSticker = (planTier: string) => {
    const details = getPlanDetails(planTier);
    const costAmount = details.amount || 5.00;
    const contributionValue = (costAmount * 0.05).toFixed(2);
    setLastPurchasedDetails({
      name: planTier === 'Pase VIP Elite' 
        ? `Continente ${selectedContinentToPurchase}` 
        : (planTier === 'flash-player' && selectedFlashPlayer 
          ? `Fichaje Flash: ${selectedFlashPlayer.realName}` 
          : `Selección ${selectedCountryToPurchase}`),
      price: details.price,
      contribution: `$${contributionValue}`
    });
    incrementDonationsPools(planTier, costAmount, addDonation);
    setShowGoldenGiftModal(true);
  };

  const executePaymentSubmit = async () => {
    if (!showPaymentModal) return;
    setPaymentError('');

    const isVIP = showPaymentModal === 'Pase VIP Elite';
    const amountStr = getPlanDetails(showPaymentModal).price;

    if (paymentGateway === 'deuna') {
      if (!deunaReference.trim() || deunaReference.trim().length < 4) {
        setPaymentError('Por favor introduce el número celular emisor o los dígitos secuenciales de transacción de Deuna.');
        return;
      }
    } else if (paymentGateway === 'payphone') {
      if (payphoneSubMode === 'app') {
        if (!phoneNumber.trim()) {
          setPaymentError('Por favor introduce tu número celular registrado en PayPhone.');
          return;
        }
        if (!otpSent) {
          setPaymentError('Tienes que solicitar el código SMS de verificación de PayPhone primero.');
          return;
        }
        if (!payphoneOtp.trim()) {
          setPaymentError('Introduce la clave OTP enviada a tu celular.');
          return;
        }
        if (payphoneOtp !== '2026') {
          setPaymentError('Código OTP de simulación incorrecto. Pista: ingresa "2026" para validar.');
          return;
        }
      } else {
        if (!cardName.trim() || !cardNumber.trim() || !cardExpiry.trim() || !cardCvv.trim()) {
          setPaymentError('Por favor completa todos los campos de tu tarjeta de crédito o débito PayPhone.');
          return;
        }
        if (cardNumber.replace(/\D/g, '').length < 13) {
          setPaymentError('Número de tarjeta de crédito/débito inválido.');
          return;
        }
      }
    } else if (paymentGateway === 'transferencia') {
      if (!bankReference.trim() || bankReference.trim().length < 4) {
        setPaymentError('Por favor, ingresa el número de comprobante o referencia de tu transferencia al Banco de Guayaquil.');
        return;
      }
      const code = transferCodeVal.trim().toUpperCase();
      if (!code) {
        setPaymentError('Por favor, ingresa el código de activación proporcionado por el administrador para convalidar tu transferencia.');
        return;
      }
      
      // Validate the code asynchronously against the server database
      try {
        const response = await fetch('/api/user/validate-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code,
            planTier: showPaymentModal
          })
        });
        const data = await response.json();
        if (!data.valid) {
          setPaymentError(data.error || 'Código de activación de transferencia inválido o ya canjeado.');
          return;
        }
      } catch (err: any) {
        setPaymentError('Error al conectar con la pasarela de validación: ' + err.message);
        return;
      }
    } else if (paymentGateway === 'efectivo') {
      const code = cashCodeVal.trim().toUpperCase();
      if (!code) {
        setPaymentError('Ingresa el código impreso en tu boleto de caja / factura física.');
        return;
      }
      
      // Validate the code asynchronously against the server database
      try {
        const response = await fetch('/api/user/validate-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code,
            planTier: showPaymentModal
          })
        });
        const data = await response.json();
        if (!data.valid) {
          setPaymentError(data.error || 'Código inválido o ya canjeado.');
          return;
        }
      } catch (err: any) {
        setPaymentError('Error al conectar con la pasarela de validación: ' + err.message);
        return;
      }
    }

    if (paymentGateway === 'saldo') {
      const coste = getPlanDetails(showPaymentModal).amount;
      if (userCashBalance < coste) {
        setPaymentError('❌ Saldo de cuenta insuficiente. Visita la sección de Billetera para recargar fondos de simulación.');
        return;
      }
      
      const unlockInfo = processPurchaseUnlocks(showPaymentModal);
      const transactionDesc = unlockInfo ? unlockInfo.desc : `Licencia ${showPaymentModal}`;
      
      onUpdateCashBalance(userCashBalance - coste);
      onAddTransaction(transactionDesc, -coste, 'cash');
      onUpdateSubscription(showPaymentModal);
      
      triggerGoldenGiftSticker(showPaymentModal);
      setSuccessMsg(`¡Canje de "${showPaymentModal}" activado con éxito! Se ha procesado tu suscripción y desbloqueado tus tarjetas oficiales.`);
      setShowPaymentModal(null);
      return;
    }

    setSubmittingPayment(true);

    if (paymentGateway === 'stripe') {
      try {
        // Save checkout intent states so callbacks can parse it
        localStorage.setItem('dt_last_intent_plan', showPaymentModal);
        localStorage.setItem('dt_last_intent_continent', vipChosenContinent);
        localStorage.setItem('dt_last_intent_country', scoutChosenCountry);

        const response = await fetch('/api/checkout/stripe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: currentUserId,
            planTier: showPaymentModal,
            country: scoutChosenCountry,
            continent: vipChosenContinent,
            promoterId: localStorage.getItem('affiliate_ref') || ''
          })
        });
        const data = await response.json();
        
        if (data.url) {
          window.location.href = data.url; // Redirects safely to Stripe checkout session
          return;
        } else {
          setPaymentError(data.error || 'Error al crear la sesión de pago de Stripe.');
        }
      } catch (err: any) {
        setPaymentError('Fallo de conexión con el servidor de pagos Stripe: ' + err.message);
      } finally {
        setSubmittingPayment(false);
      }
      return;
    }

    if (paymentGateway === 'payphone') {
      try {
        const response = await fetch('/api/checkout/payphone', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: currentUserId,
            planTier: showPaymentModal,
            phoneNumber: phoneNumber,
            promoterId: localStorage.getItem('affiliate_ref') || ''
          })
        });
        const data = await response.json();
        
        const targetName = showPaymentModal === 'flash-player' ? (selectedFlashPlayer?.realName || 'Tarjeta') : showPaymentModal;
        if (data.status === 'simulated_success') {
          // Process simulated success right away
          const subscribeRes = await fetch('/api/user/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: currentUserId,
              planTier: showPaymentModal,
              gateway: 'payphone',
              reference: data.transactionId,
              promoterId: localStorage.getItem('affiliate_ref') || ''
            })
          });
          const subData = await subscribeRes.json();
          if (subData.status === 'success') {
            processPurchaseUnlocks(showPaymentModal);
            if (showPaymentModal !== 'flash-player') onUpdateSubscription(showPaymentModal);
            triggerGoldenGiftSticker(showPaymentModal);
            setSuccessMsg(`¡Pago validado con éxito! Has canjeado "${targetName}". Tu ID de transacción es ${data.transactionId}.`);
            setShowPaymentModal(null);
          } else {
            // Simulated fallback client unlock
            processPurchaseUnlocks(showPaymentModal);
            if (showPaymentModal !== 'flash-player') onUpdateSubscription(showPaymentModal);
            triggerGoldenGiftSticker(showPaymentModal);
            setSuccessMsg(`¡Pago de Payphone simulado con éxito! Has desbloqueado "${targetName}" y tus puntos.`);
            setShowPaymentModal(null);
          }
        } else if (data.url) {
          window.location.href = data.url; // Redirect real payment gateway on production
          return;
        } else {
          setPaymentError('Error de respuesta de la API de PayPhone.');
        }
      } catch (err: any) {
        setPaymentError('Fallo al conectar con la pasarela de PayPhone: ' + err.message);
      } finally {
        setSubmittingPayment(false);
      }
      return;
    }

    // Default offline/manual fallbacks (Deuna, Bank wire transfer, Cash coupon)
    setTimeout(async () => {
      try {
        const response = await fetch('/api/user/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: currentUserId,
            planTier: showPaymentModal,
            gateway: paymentGateway,
            reference: paymentGateway === 'transferencia' ? transferCodeVal : (deunaReference || bankReference || cashCodeVal),
            promoterId: localStorage.getItem('affiliate_ref') || ''
          })
        });
        const data = await response.json();
        
        const unlockInfo = processPurchaseUnlocks(showPaymentModal);
        const transactionDesc = unlockInfo ? `${unlockInfo.desc} (${paymentGateway})` : `Licencia ${showPaymentModal} (${paymentGateway})`;
        let cost = getPlanDetails(showPaymentModal).amount;
        onAddTransaction(transactionDesc, -cost, 'cash');
        
        const referenceVal = deunaReference || bankReference || cashCodeVal;
        const isTransfer = paymentGateway === 'transferencia';
        const targetName = showPaymentModal === 'flash-player' ? (selectedFlashPlayer?.realName || 'Tarjeta') : showPaymentModal;
        if (data.status === 'success') {
          if (showPaymentModal !== 'flash-player') onUpdateSubscription(showPaymentModal);
          triggerGoldenGiftSticker(showPaymentModal);
          if (isTransfer) {
            setSuccessMsg(`¡Transferencia y Código Verificados! El comprobante al Banco de Guayaquil (#${referenceVal}) ha sido convalidado exitosamente con el código del administrador. Tu canje "${targetName}" se ha activado.`);
          } else {
            setSuccessMsg(`¡Gracias! Código verificado. Has completado tu canje de "${targetName}". Tu selección ha sido habilitada con éxito.`);
          }
        } else {
          if (showPaymentModal !== 'flash-player') onUpdateSubscription(showPaymentModal);
          triggerGoldenGiftSticker(showPaymentModal);
          if (isTransfer) {
            setSuccessMsg(`¡Transferencia y Código Verificados! El comprobante al Banco de Guayaquil (#${referenceVal}) ha sido convalidado exitosamente con el código del administrador. Tu canje "${targetName}" se ha activado.`);
          } else {
            setSuccessMsg(`¡Gracias! Conectado con éxito. Se ha activado tu canje "${targetName}" y tu selección ya está disponible.`);
          }
        }
      } catch (err) {
        console.error('Subscription premium payment error:', err);
        // Fallback successful client unlock
        const unlockInfo = processPurchaseUnlocks(showPaymentModal);
        const transactionDesc = unlockInfo ? `${unlockInfo.desc} (${paymentGateway})` : `Licencia ${showPaymentModal} (${paymentGateway})`;
        let cost = getPlanDetails(showPaymentModal).amount;
        onAddTransaction(transactionDesc, -cost, 'cash');
        if (showPaymentModal !== 'flash-player') onUpdateSubscription(showPaymentModal);
        triggerGoldenGiftSticker(showPaymentModal);
        const targetName = showPaymentModal === 'flash-player' ? (selectedFlashPlayer?.realName || 'Tarjeta') : showPaymentModal;
        setSuccessMsg(`¡Suscripción desbloqueada con éxito! Disfruta de tu plan premium "${targetName}" de forma segura.`);
      } finally {
        setSubmittingPayment(false);
        setShowPaymentModal(null);
      }
    }, 1200);
  };

  const sendPayphoneSmsCode = () => {
    if (!phoneNumber.trim() || phoneNumber.length < 8) {
      setPaymentError('Ingresa un número celular de Ecuador válido (9 dígitos, ej: 998765432).');
      return;
    }
    setSubmittingPayment(true);
    setTimeout(() => {
      setSubmittingPayment(false);
      setOtpSent(true);
      setPaymentError('');
      alert('📲 [SIMULACIÓN PAYPHONE] Código OTP enviado con éxito vía SMS a tu celular. Ingresa "2026" para validar la transacción de forma segura.');
    }, 1100);
  };

  const isUserRegistered = currentUserId !== 'user_me' && userEmail && userEmail.trim().length > 0;

  return (
    <div className="space-y-8 animate-fade-in" id="subscription-panel-section">
      
      {/* 1. Header Promo Banner & DT Registry Verification */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/50 to-slate-900 border-2 border-black rounded-3xl p-6.5 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-mono bg-emerald-500/15 border border-emerald-500/20 px-2.5 py-0.5 rounded-full text-emerald-400 font-bold tracking-widest inline-block">
              ÁREA DE COMPRAS premium & COBROS
            </span>
            <h2 className="text-xl font-extrabold text-white">Adquiere tu Plan de Scouting y Suma Puntos Extras</h2>
            <p className="text-xs text-slate-400 max-w-xl">
              Al desbloquear tus selecciones deportivas con dinero físico o digital, tu cuenta recibe automáticamente un impulso de puntuación de DT (<strong>+5 puntos</strong> en el Plan Scout básico y <strong>+15 puntos</strong> en el Pase VIP). ¡Sincroniza y gana la gloria!
            </p>
          </div>
          
          <div className="bg-slate-950 border-2 border-black p-4 rounded-2xl text-center min-w-[200px] shadow-[4px_4px_0px_#000]">
            <span className="text-[9px] uppercase font-mono text-gray-500 block">Tu Registro DT</span>
            <span className="text-xs font-bold text-emerald-400 block mt-1 font-mono uppercase bg-emerald-500/5 border border-emerald-500/10 rounded px-2.5 py-1">
              {currentSubscription || 'Ninguna'}
            </span>
            <div className="text-[9px] text-gray-400 font-mono mt-1.5 flex flex-col gap-1 items-center">
              <span>CÓDIGO GESTOR: {userCode}</span>
              {isUserRegistered ? (
                <span className="text-emerald-400 font-bold flex items-center gap-1 text-[8.5px]">
                  ● REGISTRADO ({userEmail})
                </span>
              ) : (
                <span className="text-rose-400 font-bold flex items-center gap-1 text-[8.5px] animate-pulse">
                  ⚠️ CUENTA DE INVITADO (No Registrado)
                </span>
              )}
            </div>
            {userLicense && (
              <span className="text-[9px] text-amber-400 font-mono mt-1 bg-amber-500/10 border border-amber-500/20 px-1 py-0.5 rounded block select-all" title="Licencia de Pago Auditada">
                🔑 {userLicense}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* MIDNIGHT TRANSFER MARKET: FICHAJES FLASH (12H ROTATION) */}
      <div className="bg-[#0b0c16] border-[3.5px] border-black rounded-3xl p-5 shadow-[6px_6px_0px_#8b5cf6] relative overflow-hidden my-6">
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-black pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl shrink-0">⚡</span>
            <div>
              <h3 className="font-bangers text-2xl text-white tracking-wider uppercase">Fichajes Flash de Medianoche</h3>
              <p className="text-purple-400 font-mono text-[10.5px] uppercase tracking-wider font-bold">Rotación Automática cada 12 Horas • Micro-adquisiciones Directas</p>
            </div>
          </div>

          {/* Countdown Clock */}
          <div className="flex items-center gap-2 bg-black border border-slate-800 rounded-xl px-3 py-1.5 self-start md:self-auto shadow-md">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-ping" />
            <span className="text-[10px] text-gray-500 font-mono uppercase">Rotación en:</span>
            <span className="text-xs text-purple-300 font-bold font-mono tracking-widest">{timeLeft || 'Calculando...'}</span>
          </div>
        </div>

        {/* Market Description */}
        <p className="text-[11.5px] text-slate-300 leading-normal mb-5">
          ¿Te falta esa estrella clave para completar tu álbum o tu pizarra táctica PvP? El mercado flash te permite <strong className="text-purple-300">adquirir tarjetas individuales</strong> mediante pasarelas de pago directo. Al igual que con los pases, el <strong>5% de cada fichaje flash se destina automáticamente</strong> a causas sociales infantiles.
        </p>

        {/* Rotating Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {getFichajesFlashPlayers().map((p) => {
            const isOwned = manuallyUnlockedPlayerIds[p.id];
            
            return (
              <div 
                key={p.id} 
                className={`bg-slate-950 border-3 border-black rounded-2xl p-4.5 flex flex-col justify-between transition-all relative ${
                  isOwned 
                    ? 'opacity-85 border-emerald-500/40 bg-emerald-950/5 shadow-[3px_3px_0px_rgba(16,185,129,0.2)]' 
                    : 'shadow-[4px_4px_0px_#000] hover:border-purple-500/40 hover:-translate-y-0.5'
                }`}
              >
                {/* Visual Header */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[8.5px] font-mono uppercase font-black text-purple-400 bg-purple-500/10 border border-purple-500/15 px-2 py-0.5 rounded-lg">
                    {p.country}
                  </span>
                  <div className="flex items-center gap-1 bg-black px-2 py-0.5 rounded border border-slate-800">
                    <span className="text-[8.5px] text-gray-400 font-mono">VAL:</span>
                    <span className="text-xs font-black text-amber-400 font-mono">{p.rating}</span>
                  </div>
                </div>

                {/* Player details */}
                <div className="space-y-1 mb-4">
                  <span className="text-[9.5px] text-slate-500 uppercase font-mono block tracking-wider">{p.name}</span>
                  <h4 className="font-extrabold text-white text-sm">{p.realName}</h4>
                  <p className="text-[10px] text-gray-400">Posición: <strong className="text-slate-300">Superestrella</strong></p>
                </div>

                {/* Pricing and Action */}
                <div className="pt-3 border-t border-slate-900 flex items-center justify-between gap-2.5">
                  <div className="text-left font-mono">
                    <span className="text-[8.5px] text-gray-500 block uppercase">Precio Directo:</span>
                    <span className="text-sm font-black text-emerald-400">${p.price.toFixed(2)} USD</span>
                  </div>

                  {isOwned ? (
                    <span className="text-[9.5px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/15 px-3 py-1.5 rounded-xl font-bold uppercase text-center block flex-1">
                      ✓ EN PROPIEDAD
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handlePurchaseFlashPlayer(p)}
                      className="flex-1 py-2 bg-purple-600 hover:bg-purple-500 text-white font-sans font-black text-[10px] uppercase rounded-xl border border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:shadow-none cursor-pointer transition active:translate-y-0.5"
                    >
                      Fichar Tarjeta
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. WARNING ALERT FOR UNREGISTERED USERS */}
      {showUnregisteredAlert && (
        <div className="bg-rose-950/40 border-3 border-black text-white p-5 rounded-3xl shadow-[5px_5px_0px_#ef4444] animate-bounce-short space-y-3">
          <div className="flex items-center gap-3">
            <div className="bg-rose-500 text-black p-1.5 rounded-full">
              <AlertCircle className="w-5 h-5 shrink-0" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white uppercase tracking-wider font-mono">🚨 ¡Registro Requerido en la Página!</h4>
              <p className="text-xs text-rose-300 mt-0.5 leading-relaxed">
                No es posible habilitar la pasarela de pagos para cuentas de invitado temporal. Para reclamar tus puntos extras (+5 o +15 pts) y registrar tu sorteo auditable de premios en el panel del administrador, primero debes completar el registro gratuito de tu cuenta de Director Técnico.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 justify-end pt-2">
            <button
              onClick={() => setShowUnregisteredAlert(false)}
              className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-xl cursor-pointer"
            >
              Cerrar
            </button>
            <button
              onClick={() => {
                setShowUnregisteredAlert(false);
                onRequestOpenRegistration();
              }}
              className="px-4 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-md border-2 border-black hover:scale-[1.03] duration-150 cursor-pointer flex items-center gap-1.5"
            >
              <UserCheck className="w-3.5 h-3.5" /> Registrarme Gratis Ahora <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* 3. Plans comparison cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="plans-grid">
        {plans.map((p) => {
          const isActive = currentSubscription === p.id || (p.id === 'Ninguna' && !currentSubscription);
          const isVIP = p.id === 'Pase VIP Elite';
          const isScout = p.id === 'Plan Scout Básico';
          const isDailyPack = p.id === 'Paquete Diario de Estampas';
          const isSeasonPass = p.id === 'Pase de Temporada';

          // Inline check if the selected country is unlocked
          const scoutUnlockedList = JSON.parse(localStorage.getItem('scout_unlocked_countries') || '[]');
          const dailySpendsMap = JSON.parse(localStorage.getItem('daily_pack_spends') || '{}');
          const isSelectedCountryUnlocked = 
            currentSubscription === 'Pase de Temporada' ||
            scoutUnlockedList.includes(selectedCountryToPurchase) ||
            (dailySpendsMap[selectedCountryToPurchase] || 0) >= 10;

          const isDailyCountryUnlocked = 
            currentSubscription === 'Pase de Temporada' ||
            scoutUnlockedList.includes(selectedCountryToPurchase) ||
            (dailySpendsMap[selectedCountryToPurchase] || 0) >= 10;

          const currentDailySpend = dailySpendsMap[selectedCountryToPurchase] || 0;

          return (
            <div
              key={p.id}
              className={`border-3 border-black rounded-3xl p-5 flex flex-col justify-between transition-all duration-300 relative ${
                isActive 
                  ? 'border-emerald-500 bg-emerald-950/15 shadow-[5px_5px_0px_#10b981] scale-[1.01]' 
                  : p.popular 
                    ? 'border-amber-500 bg-gradient-to-b from-[#0e1320] to-[#080b13] shadow-[5px_5px_0px_#f59e0b]' 
                    : 'border-slate-800 bg-[#0d121f] hover:border-slate-700 shadow-[5px_5px_0px_#000]'
              }`}
            >
              {p.popular && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-yellow-450 text-slate-950 text-[9.5px] font-black uppercase px-3.5 py-1 rounded-full shadow border-2 border-black font-mono tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3 mr-0.5" /> MÁS RECOMENDADO
                </span>
              )}

              <div>
                <div className="mb-4">
                  <h4 className="font-extrabold text-white text-base flex items-center gap-1.5">
                    {p.id === 'Ninguna' && <span className="text-slate-550">🥚</span>}
                    {p.id === 'Plan Scout Básico' && <span className="text-indigo-400">🛡️</span>}
                    {p.id === 'Paquete Diario de Estampas' && <span className="text-emerald-400">📂</span>}
                    {p.id === 'Pase VIP Elite' && <span className="text-amber-400">👑</span>}
                    {p.id === 'Pase de Temporada' && <span className="text-pink-400">✨</span>}
                    {p.name}
                  </h4>
                  <p className="text-[10.5px] text-gray-400 mt-1 lines-clamp-2 leading-relaxed">{p.desc}</p>
                </div>

                <div className="flex items-baseline mb-5">
                  <span className="text-3xl font-black text-white font-mono">{p.price}</span>
                  <span className="text-xs text-gray-500 ml-1 font-mono">{p.period}</span>
                </div>

                {/* Segmented Selectors for purchase options */}
                {isScout && (
                  <div className="mt-4 mb-5 p-3.5 bg-slate-950/80 border border-slate-850 rounded-2xl space-y-2">
                    <label className="text-[10px] text-indigo-400 font-mono font-bold uppercase tracking-wider block">
                      🎯 Elige Selección de País ($5):
                    </label>
                    <select
                      value={selectedCountryToPurchase}
                      onChange={(e) => setSelectedCountryToPurchase(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl py-2 px-2.5 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    >
                      {COUNTRIES.map((c) => (
                        <option className="bg-slate-900 text-white" key={c.name} value={c.name}>
                          {c.flag} {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {isDailyPack && (
                  <div className="mt-4 mb-5 p-3.5 bg-slate-950/80 border border-slate-850 rounded-2xl space-y-2">
                    <label className="text-[10px] text-emerald-400 font-mono font-bold uppercase tracking-wider block">
                      📂 Elige Selección para Sobre Diario ($2):
                    </label>
                    <select
                      value={selectedCountryToPurchase}
                      onChange={(e) => setSelectedCountryToPurchase(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl py-2 px-2.5 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    >
                      {COUNTRIES.map((c) => (
                        <option className="bg-slate-900 text-white" key={c.name} value={c.name}>
                          {c.flag} {c.name}
                        </option>
                      ))}
                    </select>
                    
                    <div className="pt-1.5">
                      <div className="flex justify-between text-[9px] font-mono font-bold text-slate-400">
                        <span>Límite Legal Acumulado:</span>
                        <span className={currentDailySpend >= 10 ? 'text-emerald-400' : 'text-amber-400'}>
                          ${currentDailySpend} / $10
                        </span>
                      </div>
                      <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden mt-1 border border-slate-850">
                        <div 
                          className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, (currentDailySpend / 10) * 100)}%` }}
                        />
                      </div>
                      <span className="text-[8.5px] text-slate-500 font-sans block mt-1 leading-snug">
                        Al llegar a $10, se desbloquea permanentemente de forma gratuita.
                      </span>
                    </div>
                  </div>
                )}

                {isVIP && (
                  <div className="mt-4 mb-5 p-3.5 bg-slate-950/80 border border-slate-850 rounded-2xl space-y-2">
                    <label className="text-[10px] text-amber-400 font-mono font-bold uppercase tracking-wider block">
                      🌍 Elige Continente a Canjear ($15):
                    </label>
                    <div className="grid grid-cols-1 gap-1.5">
                      {['América', 'Europa', 'África, Asia y Oceanía'].map((cont) => (
                        <button
                          key={cont}
                          type="button"
                          onClick={() => setSelectedContinentToPurchase(cont)}
                          className={`py-1.5 px-2.5 rounded-xl text-left font-mono text-[10.5px] font-bold border transition flex items-center justify-between ${
                            selectedContinentToPurchase === cont
                              ? 'bg-amber-500/15 text-amber-400 border-amber-500/50 shadow-[0_0_8px_rgba(245,158,11,0.15)]'
                              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                          }`}
                        >
                          <span className="flex items-center gap-1.5">
                            {cont === 'América' && '🌎'}
                            {cont === 'Europa' && '🇪🇺'}
                            {cont === 'África, Asia y Oceanía' && '🌍'}
                            {cont}
                          </span>
                          {selectedContinentToPurchase === cont && (
                            <span className="text-[9px] bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded font-black uppercase">ELEGIDO</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <ul className="space-y-3 pt-3 border-t-2 border-dashed border-slate-850/80 mb-6">
                  {p.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                      <Check className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${isVIP ? 'text-amber-400' : isScout ? 'text-indigo-400' : 'text-slate-500'}`} />
                      <span className="leading-tight">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6">
                {isVIP ? (
                  (() => {
                    const continentsList = vipChosenContinent ? vipChosenContinent.split(',').map(s => s.trim().toUpperCase()) : [];
                    const isSelectedContPurchased = continentsList.includes(selectedContinentToPurchase.toUpperCase());
                    
                    if (isSelectedContPurchased) {
                      return (
                        <div className="space-y-2">
                          <div className="w-full py-2.5 text-[11px] font-bold font-mono uppercase tracking-wider rounded-xl bg-slate-850 border-2 border-slate-800 text-emerald-400 flex items-center justify-center gap-1.5">
                            <ShieldCheck className="w-4 h-4 text-emerald-400" /> {selectedContinentToPurchase} Desbloqueado 🏆
                          </div>
                          {currentSubscription !== 'Pase VIP Elite' && (
                            <button
                              onClick={() => handlePlanSelection(p.id)}
                              className="w-full py-2.5 text-xs font-black uppercase tracking-wider rounded-xl bg-amber-500 text-slate-950 hover:bg-amber-400 border-2 border-black shadow-[2.5px_2.5px_0px_#000] cursor-pointer"
                            >
                              Activar Pase VIP Elite
                            </button>
                          )}
                        </div>
                      );
                    } else {
                      return (
                        <button
                          onClick={() => handlePlanSelection(p.id)}
                          disabled={purchaseLoading !== null}
                          className="w-full py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 relative border-2 border-black shadow-[2.5px_2.5px_0px_#000] bg-gradient-to-r from-amber-500 to-yellow-450 text-slate-950 hover:bg-amber-400 active:translate-y-0.5"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Adquirir {selectedContinentToPurchase} ($15) 🇪🇺</span>
                        </button>
                      );
                    }
                  })()
                ) : isScout ? (
                  (() => {
                    if (isSelectedCountryUnlocked) {
                      return (
                        <div className="space-y-2">
                          <div className="w-full py-2.5 text-[11px] font-bold font-mono uppercase tracking-wider rounded-xl bg-slate-850 border-2 border-slate-800 text-emerald-400 flex items-center justify-center gap-1.5">
                            <ShieldCheck className="w-4 h-4 text-emerald-400" /> {selectedCountryToPurchase} Desbloqueado 🏆
                          </div>
                        </div>
                      );
                    } else {
                      return (
                        <button
                          onClick={() => handlePlanSelection(p.id)}
                          disabled={purchaseLoading !== null}
                          className="w-full py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 relative border-2 border-black shadow-[2.5px_2.5px_0px_#000] bg-indigo-600 hover:bg-indigo-500 text-white active:translate-y-0.5"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Adquirir {selectedCountryToPurchase} ($5) 🎯</span>
                        </button>
                      );
                    }
                  })()
                ) : isDailyPack ? (
                  (() => {
                    if (isDailyCountryUnlocked) {
                      return (
                        <div className="space-y-2">
                          <div className="w-full py-2.5 text-[11px] font-bold font-mono uppercase tracking-wider rounded-xl bg-slate-850 border-2 border-slate-800 text-emerald-400 flex items-center justify-center gap-1.5">
                            <ShieldCheck className="w-4 h-4 text-emerald-400" /> {selectedCountryToPurchase} Desbloqueado 🏆
                          </div>
                        </div>
                      );
                    } else {
                      return (
                        <button
                          onClick={() => handlePlanSelection(p.id)}
                          disabled={purchaseLoading !== null}
                          className="w-full py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 relative border-2 border-black shadow-[2.5px_2.5px_0px_#000] bg-emerald-600 hover:bg-emerald-500 text-white active:translate-y-0.5"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Comprar Sobre Diario ($2) 📂</span>
                        </button>
                      );
                    }
                  })()
                ) : isSeasonPass ? (
                  currentSubscription === 'Pase de Temporada' ? (
                    <div className="w-full py-2.5 text-[11px] font-bold font-mono uppercase tracking-wider rounded-xl bg-slate-850 border-2 border-slate-800 text-emerald-400 flex items-center justify-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" /> Pase de Temporada Activo ✨
                    </div>
                  ) : (
                    <button
                      onClick={() => handlePlanSelection(p.id)}
                      disabled={purchaseLoading !== null}
                      className="w-full py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 relative border-2 border-black shadow-[2.5px_2.5px_0px_#000] bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:opacity-90 active:translate-y-0.5"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Adquirir Pase de Temporada ($20)</span>
                    </button>
                  )
                ) : isActive ? (
                  <div className="w-full py-2.5 text-[11px] font-bold font-mono uppercase tracking-wider rounded-xl bg-slate-850 border-2 border-slate-800 text-emerald-400 flex items-center justify-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" /> Plan Activo Actual
                  </div>
                ) : (
                  <button
                    onClick={() => handlePlanSelection(p.id)}
                    disabled={purchaseLoading !== null || p.id === 'Ninguna'}
                    className="w-full py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 relative border-2 border-black shadow-[2.5px_2.5px_0px_#000] bg-indigo-600 hover:bg-indigo-500 text-white active:translate-y-0.5"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>{p.buttonText}</span>
                  </button>
                )}
              </div>

              {p.id !== 'Ninguna' && (
                <p className="text-[8.5px] text-slate-400 mt-4 leading-normal bg-slate-950/40 p-2 rounded-lg border border-slate-850/60 font-sans">
                  Al adquirir este paquete, el 5% se destina automáticamente al fondo de desarrollo deportivo de la Fundación Guerreros de luz, apoyando a niños en condiciones vulnerables.
                </p>
              )}
            </div>
          );
        })}
      </div>



      {/* 4. Active Plan Specials (Scout chosen country) */}
      {currentSubscription === 'Plan Scout Básico' && (
        <div className="bg-gradient-to-r from-indigo-950/40 via-slate-900 to-indigo-950/40 border-2 border-black rounded-3xl p-5 shadow-[4px_4px_0px_rgba(0,0,0,1)] animate-fade-in" id="scout-country-selector-box">
          <div className="flex items-center gap-2.5 mb-3.5">
            <Globe className="w-5 h-5 text-indigo-400" />
            <div>
              <h4 className="font-extrabold text-white text-sm">🎯 Elige tu País Desbloqueado (Beneficio Plan Scout +5 puntos)</h4>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Tu plan te otorga la recompensa de desbloqueo premium de 1 país completo de tu elección. Selecciona el país que deseas desbloquear:
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <select
              value={scoutChosenCountry}
              onChange={(e) => onUpdateScoutCountry(e.target.value)}
              className="w-full sm:w-64 bg-slate-950 text-white text-xs border border-slate-800 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option className="bg-slate-900 text-white" value="">-- Elige un País para Desbloquear --</option>
              {COUNTRIES.map((c) => (
                <option className="bg-slate-900 text-white" key={c.name} value={c.name}>
                  {c.flag} {c.name}
                </option>
              ))}
            </select>

            {scoutChosenCountry ? (
              <span className="text-xs text-emerald-400 font-mono font-bold flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                <ShieldCheck className="w-4 h-4 shrink-0" /> ¡{scoutChosenCountry} desbloqueado al 100%! Revisa tu álbum.
              </span>
            ) : (
              <span className="text-xs text-amber-400 font-mono flex items-center gap-1.5 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20 animate-pulse">
                <AlertCircle className="w-4 h-4 shrink-0" /> Elige un país para activar el desbloqueo.
              </span>
            )}
          </div>
        </div>
      )}

      {currentSubscription === 'Pase VIP Elite' && (
        <div className="bg-gradient-to-r from-amber-500/10 via-slate-900 to-amber-500/10 border-2 border-black rounded-3xl p-5 shadow-[4px_4px_0px_#f59e0b] animate-fade-in" id="vip-access-info-box">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5.5 h-5.5 text-amber-450 animate-pulse shrink-0" />
            <div>
              <h4 className="font-extrabold text-amber-400 text-sm">👑 ¡Pase VIP Elite Activado (+15 puntos)!</h4>
              <p className="text-[11.5px] text-gray-300 mt-1 max-w-2xl leading-relaxed">
                ¡Enhorabuena! Has desbloqueado <strong>todos los países y todas sus tarjetas al 100% al instante</strong>. Ya no requieres superar trivias para coleccionar. Además has recibido tu boost de 15 puntos y tu inscripción oficial al sorteo auditable de premios físicos.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 5. Support Info center */}
      <div className="bg-brand-sidebar border-2 border-black rounded-3xl p-5 shadow-[4px_4px_0px_#000] flex flex-col justify-between mt-4">
        <div>
          <h4 className="font-bold text-white text-xs uppercase tracking-wider text-indigo-400 flex items-center gap-1.5 font-mono">
            <ShieldCheck className="w-4 h-4" /> Garantía de Sorteo
          </h4>
          <p className="text-[11px] text-gray-400 mt-1.5 leading-relaxed">
            Todos los cobros y adquisiciones de licencias quedan registrados bajo el amparo de tu credencial única de Director Técnico. Esto previene re-intentos fallidos, duplicaciones de tarjetas y garantiza una auditoría pública.
          </p>
        </div>

        {successMsg && (
          <div className="bg-emerald-500/15 border-2 border-emerald-500/30 rounded-2xl p-3 flex items-start gap-2.5 mt-3">
            <ShieldCheck className="w-4.5 h-4.5 text-emerald-400 shrink-0 mt-0.5" />
            <p className="text-[10px] text-slate-300 leading-normal">{successMsg}</p>
          </div>
        )}
      </div>

      {/* SECCIÓN SOLIDARIA: ESTADIO SOCIAL 3D */}
      <div className="mt-8" id="social-responsibility-portal">
        <SocialImpactStadium
          socialFundTotal={communityBasePool}
          personalDonationTotal={personalDonationTotal}
          onDonateDirectly={handleDonateDirectly}
          userCashBalance={userCashBalance}
        />
      </div>

      {/* 6. ADAPTIVE PREMIUM PASARELA DE PAGOS MODAL OVERLAY */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-[150] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-[#0b0e17] border-3 border-black text-white rounded-3xl w-full max-w-lg overflow-hidden shadow-[8px_8px_0_rgba(0,0,0,1)] flex flex-col relative"
          >
            {/* Modal Header */}
            <div className="bg-slate-900 p-5 border-b-2 border-black flex items-center justify-between">
              <div>
                <h4 className="font-extrabold text-white text-sm uppercase font-mono tracking-wider">Pasarela de Pagos Oficial</h4>
                <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider mt-0.5">Adquiriendo: {showPaymentModal}</p>
              </div>
              <button 
                onClick={() => setShowPaymentModal(null)}
                className="text-white hover:bg-rose-650 px-3 py-1 bg-slate-800 shadow border-2 border-black transition font-mono rounded-lg cursor-pointer text-xs uppercase"
              >
                Cerrar x
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              
              {/* Payment Gateways Selection list */}
              <div className="grid grid-cols-2 gap-2 bg-slate-950 border-2 border-black rounded-2xl p-2 text-center">

                <button
                  type="button"
                  onClick={() => { setPaymentGateway('stripe'); setPaymentError(''); }}
                  className={`py-2 px-1 text-[10.5px] font-black rounded-xl transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-1 border ${
                    paymentGateway === 'stripe' 
                      ? 'bg-[#635BFF] text-white border-black shadow-[2px_2px_0_#000]' 
                      : 'text-gray-400 hover:text-white border-transparent'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-[#8a85ff]" />
                  <span>Stripe (España/Global)</span>
                  <span className="text-[7.5px] uppercase bg-black/40 text-[#8a85ff] px-1 rounded">Tarjeta Real 💳</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setPaymentGateway('payphone'); setPaymentError(''); }}
                  className={`py-2 px-1 text-[10.5px] font-black rounded-xl transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-1 border ${
                    paymentGateway === 'payphone' 
                      ? 'bg-amber-500 text-slate-950 border-black shadow-[2px_2px_0_#000]' 
                      : 'text-gray-400 hover:text-white border-transparent'
                  }`}
                >
                  <Smartphone className="w-4 h-4 text-amber-350" />
                  <span>Payphone (Ecuador)</span>
                  <span className="text-[7.5px] uppercase bg-black/40 text-amber-400 px-1 rounded">Tarjetas/App 🇪🇨</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setPaymentGateway('deuna'); setPaymentError(''); }}
                  className={`py-2 px-1 text-[10.5px] font-black rounded-xl transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-1 border ${
                    paymentGateway === 'deuna' 
                      ? 'bg-teal-500 text-black border-black shadow-[2px_2px_0_#000]' 
                      : 'text-gray-400 hover:text-white border-transparent'
                  }`}
                >
                  <QrCode className="w-4 h-4 text-teal-300" />
                  <span>Deuna QR (Ecuador)</span>
                  <span className="text-[7.5px] uppercase bg-black/40 text-teal-400 px-1 rounded">Banco Pichincha 📲</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setPaymentGateway('transferencia'); setPaymentError(''); }}
                  className={`py-2 px-1 text-[10.5px] font-black rounded-xl transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-1 border ${
                    paymentGateway === 'transferencia' 
                      ? 'bg-indigo-600 text-white border-black shadow-[2px_2px_0_#000]' 
                      : 'text-gray-400 hover:text-white border-transparent'
                  }`}
                >
                  <Building className="w-4 h-4 text-indigo-300" />
                  <span>Transf. Bancaria</span>
                  <span className="text-[7.5px] uppercase bg-black/40 text-indigo-400 px-1 rounded">Manual / Depósito</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setPaymentGateway('efectivo'); setPaymentError(''); }}
                  className={`py-2 px-1 text-[10.5px] font-black rounded-xl transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-1 border ${
                    paymentGateway === 'efectivo' 
                      ? 'bg-rose-500 text-black border-black shadow-[2px_2px_0_#000]' 
                      : 'text-gray-400 hover:text-white border-transparent'
                  }`}
                >
                  <Coins className="w-4 h-4 text-rose-350" />
                  <span>Código Físico</span>
                  <span className="text-[7.5px] uppercase bg-black/40 text-rose-500 px-1 rounded">Activación 🎫</span>
                </button>

              </div>

              {/* Dynamic Payment Gateways viewport */}
              {paymentGateway === 'stripe' && (
                <div className="space-y-3.5 animate-fade-in text-center border-2 border-black bg-[#10132c] p-4 rounded-2xl">
                  <div className="flex justify-center items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#635BFF] animate-pulse" />
                    <span className="text-[10px] text-[#8a85ff] uppercase tracking-widest font-mono font-bold">PAGO SEGURO CON STRIPE CHECKOUT</span>
                  </div>

                  <div className="bg-slate-950/80 p-3 rounded-xl border border-[#635BFF]/20 flex flex-col items-center text-center space-y-2">
                    <div className="p-3 bg-gradient-to-br from-[#635BFF] to-[#4338ca] rounded-2xl border-2 border-black shadow">
                      <CreditCard className="w-10 h-10 text-white" />
                    </div>

                    <p className="text-[11px] text-slate-300">
                      Será redirigido al portal oficial y seguro de <strong>Stripe Checkout</strong> para completar su transacción mediante tarjeta de crédito o débito internacional.
                    </p>

                    <div className="text-[10.5px] font-extrabold text-[#8a85ff] mt-2 font-mono bg-[#635BFF]/10 px-3 py-1.5 rounded-lg border border-[#635BFF]/20">
                      Monto a Procesar: {getPlanDetails(showPaymentModal).price}
                    </div>

                    <p className="text-[9px] text-gray-450 italic max-w-xs leading-normal">
                      Soporta todas las tarjetas de crédito importantes (Visa, Mastercard, American Express) de Ecuador, España y del mundo con liquidación segura.
                    </p>
                  </div>
                </div>
              )}

              {paymentGateway === 'deuna' && (
                <div className="space-y-3.5 animate-fade-in text-center border-2 border-black bg-[#061e1b] p-4 rounded-2xl">
                  <div className="flex justify-center items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse" />
                    <span className="text-[10px] text-teal-400 uppercase tracking-widest font-mono font-bold">Pago inmediato vía DEUNA QR</span>
                  </div>

                  <div className="bg-slate-950/80 p-3 rounded-xl border border-teal-500/10 flex flex-col items-center">
                    {/* Simulated High-Fidelity Custom Illustrated QR Code */}
                    <div className="relative w-36 h-36 bg-white p-3 rounded-2xl border-4 border-black flex items-center justify-center shadow-lg mb-3">
                      <div className="absolute inset-2 border-2 border-teal-600 border-dashed" />
                      <QrCode className="w-28 h-28 text-black" />
                      <div className="absolute bg-[#001715] text-teal-400 font-sans font-black text-[9px] px-1.5 py-0.5 border border-teal-500 rounded lowercase">
                        deuna
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-300">
                      Escanea el código QR desde tu app <strong>Deuna</strong> o transfiere al celular:
                    </p>
                    <p className="text-sm font-extrabold text-white mt-1 select-all font-mono">
                      📞 099 876 5432
                    </p>
                    <p className="text-[10px] text-teal-300 mt-1 uppercase font-mono">
                      Beneficiario: Álbum de Trivia Pro S.A.
                    </p>
                    <p className="text-[10.5px] font-extrabold text-emerald-400 mt-2">
                      Valor a pagar: {getPlanDetails(showPaymentModal).price}
                    </p>
                  </div>

                  <div className="text-left space-y-1">
                    <label className="text-[9.5px] text-teal-400 font-mono uppercase tracking-wider block font-bold">
                      Celular Emisor / Código Secuencial de Transacción
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Celular emisor o código de transacción secuencial"
                      value={deunaReference}
                      onChange={(e) => setDeunaReference(e.target.value)}
                      className="w-full bg-slate-950 border-2 border-black rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-teal-500 font-mono"
                    />
                    <span className="text-[9px] text-gray-400 block italic leading-tight">
                      * El secuencial se obtiene directamente tras convalidar tu pago en la aplicación de Deuna.
                    </span>
                  </div>
                </div>
              )}

              {/* 2. PAYPHONE PAYMENTS */}
              {paymentGateway === 'payphone' && (
                <div className="space-y-4 animate-fade-in">
                  {/* Option App vs Card */}
                  <div className="flex gap-2 justify-center bg-slate-950 p-1 border border-slate-850 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setPayphoneSubMode('app')}
                      className={`flex-1 py-1 px-2.5 text-xs font-bold rounded-lg ${
                        payphoneSubMode === 'app' ? 'bg-amber-500 text-slate-950' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      App Celular OTP
                    </button>
                    <button
                      type="button"
                      onClick={() => setPayphoneSubMode('card')}
                      className={`flex-1 py-1 px-2.5 text-xs font-bold rounded-lg ${
                        payphoneSubMode === 'card' ? 'bg-amber-500 text-slate-950' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      Tarjeta de Crédito / Débito
                    </button>
                  </div>

                  {payphoneSubMode === 'app' ? (
                    <div className="space-y-3.5 bg-amber-950/15 border-2 border-black p-4 rounded-2xl">
                      <div className="bg-slate-950 px-3 py-2 border border-slate-850 rounded-xl flex items-center justify-between text-xs">
                        <span className="text-gray-400">Total a debitar (Payphone):</span>
                        <span className="font-mono font-black text-amber-400 text-sm">
                          {getPlanDetails(showPaymentModal).price}
                        </span>
                      </div>

                      <div>
                        <label className="text-[10px] text-gray-400 font-mono uppercase tracking-wider block mb-1">Celu Ecuador (+593)</label>
                        <div className="flex gap-2">
                          <span className="bg-slate-950 border-2 border-black rounded-xl px-3 py-2 text-white text-xs flex items-center font-bold font-mono">+593</span>
                          <input
                            type="tel"
                            maxLength={9}
                            placeholder="998765432"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                            className="bg-slate-950 border-2 border-black rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-550 font-mono flex-1"
                          />
                        </div>
                      </div>

                      {otpSent ? (
                        <div className="bg-slate-950/60 p-3 rounded-xl border border-dashed border-amber-500/20 animate-fade-in space-y-1">
                          <label className="text-[10px] text-amber-500 font-mono uppercase tracking-wider block font-bold">Código SMS Recibido (Simulación: "2026")</label>
                          <input
                            type="text"
                            maxLength={6}
                            placeholder="Introduce '2026'"
                            value={payphoneOtp}
                            onChange={(e) => setPayphoneOtp(e.target.value)}
                            className="w-full bg-slate-950 border-2 border-black rounded-xl px-3 py-2 text-xs text-white tracking-widest text-center focus:outline-none focus:ring-1 focus:ring-amber-550 font-mono"
                          />
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={sendPayphoneSmsCode}
                          disabled={submittingPayment || !phoneNumber}
                          className="w-full py-2.5 bg-slate-950 hover:bg-slate-900 border-2 border-black text-amber-400 text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${submittingPayment ? 'animate-spin' : ''}`} />
                          Solicitar SMS OTP de Payphone
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3 bg-amber-950/10 border-2 border-black p-4 rounded-2xl">
                      <div className="bg-slate-950 px-3 py-2 border border-slate-850 rounded-xl flex items-center justify-between text-xs">
                        <span className="text-gray-400">Total a pagar con Tarjeta:</span>
                        <span className="font-mono font-black text-emerald-400 text-sm">
                          {getPlanDetails(showPaymentModal).price}
                        </span>
                      </div>

                      <div>
                        <label className="text-[10px] text-gray-500 font-mono uppercase block mb-1">Titular de la Tarjeta</label>
                        <input
                          type="text"
                          placeholder="Ej. Geovanny Solorzano"
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                          className="w-full bg-slate-950 border-2 border-black rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] text-gray-500 font-mono uppercase block mb-1">Número de Tarjeta</label>
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="4000 •••• •••• 4000"
                            value={cardNumber}
                            maxLength={19}
                            onChange={(e) => setCardNumber(e.target.value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim())}
                            className="w-full bg-slate-950 border-2 border-black rounded-xl pl-3 pr-10 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                          />
                          <CreditCard className="w-4 h-4 text-gray-500 absolute right-3 top-2.5" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] text-gray-500 font-mono uppercase block mb-1">Expiración (MM/AA)</label>
                          <input
                            type="text"
                            placeholder="12/28"
                            maxLength={5}
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            className="w-full bg-slate-950 border-2 border-black rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono text-center"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-gray-500 font-mono uppercase block mb-1">CVC / CVV</label>
                          <input
                            type="password"
                            placeholder="***"
                            maxLength={4}
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value)}
                            className="w-full bg-slate-950 border-2 border-black rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono text-center"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 3. WIRE TRANSFER BANCARIA */}
              {paymentGateway === 'transferencia' && (
                <div className="space-y-3.5 animate-fade-in bg-slate-900 border-2 border-black p-4 rounded-2xl">
                  <div className="text-center">
                    <span className="text-[10px] text-indigo-400 uppercase tracking-widest font-mono font-bold block mb-1">Transferencia Directa Interbancaria</span>
                    <p className="text-xs text-slate-300">
                      Realiza depósito o transferencia bancaria y completa los campos inferiores para acreditar tu pase:
                    </p>
                  </div>

                  <div className="bg-slate-950/90 p-4 rounded-xl border border-slate-800 space-y-1.5 text-xs text-slate-350 select-all font-mono">
                    <p><strong className="text-white">Banco:</strong> Banco de Guayaquil</p>
                    <p><strong className="text-white">Número de Cuenta:</strong> 56399432</p>
                    <p><strong className="text-white">Beneficiario:</strong> Rolando Guerra</p>
                    <p><strong className="text-white">Cédula:</strong> 1722491949</p>
                    <p><strong className="text-white">Monto a Transferir:</strong> <span className="text-emerald-400 font-bold">{getPlanDetails(showPaymentModal).price}</span></p>
                  </div>

                  <div className="text-left space-y-3">
                    <div className="space-y-1">
                      <label className="text-[10px] text-indigo-400 font-mono uppercase tracking-wider block font-bold">Número de Comprobante / Referencia de Transferencia</label>
                      <input
                        type="text"
                        placeholder="Ingrese el número de comprobante o secuencial de transferencia..."
                        value={bankReference}
                        onChange={(e) => setBankReference(e.target.value)}
                        className="w-full bg-slate-950 border-2 border-black rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-center"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-yellow-400 font-mono uppercase tracking-wider block font-bold">Código de Validación / Activación (Proporcionado por el Administrador)</label>
                      <input
                        type="text"
                        placeholder="Ej: EFECTIVO15 o el código generado por el Administrador..."
                        value={transferCodeVal}
                        onChange={(e) => setTransferCodeVal(e.target.value)}
                        className="w-full bg-slate-950 border-2 border-black rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono uppercase text-center"
                      />
                      <span className="text-[9.5px] text-amber-300 block font-bold italic leading-tight">* Se requiere un código válido provisto por el administrador para convalidar y activar tu transferencia al instante.</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 4. CASH COUPON (EFECTIVO) */}
              {paymentGateway === 'efectivo' && (
                <div className="space-y-3.5 animate-fade-in bg-rose-950/20 border-2 border-black p-4 rounded-2xl">
                  <div className="text-center">
                    <span className="text-[10px] text-rose-450 uppercase tracking-widest font-mono font-bold block mb-1">ACTIVACIÓN FÍSICA / CORTESÍA EN EFECTIVO</span>
                    <p className="text-xs text-slate-300">
                      Habilite su plan premium ingresando un código válido de activación o cortesía:
                    </p>
                  </div>

                  <div className="bg-slate-950 p-3.5 rounded-xl border border-rose-500/15 text-center">
                    <p className="text-xs text-slate-400">
                      Si realizó su pago offline en tiendas físicas o recibió un código de cortesía directo del administrador, ingrese el código de licencia oficial a continuación para su activación inmediata en el álbum táctico.
                    </p>
                  </div>

                  <div className="text-left space-y-1">
                    <label className="text-[10px] text-rose-400 font-mono uppercase tracking-wider block font-bold">Código de Activación / Cortesía</label>
                    <input
                      type="text"
                      placeholder="Ingrese su código de cortesía o efectivo..."
                      value={cashCodeVal}
                      onChange={(e) => setCashCodeVal(e.target.value)}
                      className="w-full bg-slate-950 border-2 border-black rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-rose-500 font-mono uppercase text-center"
                    />
                  </div>
                </div>
              )}



              {/* Desglose Social y Donación Sugerida 10% */}
              {showPaymentModal && showPaymentModal !== 'Ninguna' && (() => {
                const isVIP = showPaymentModal === 'Pase VIP Elite';
                const baseCost = getPlanDetails(showPaymentModal).amount || 0;
                const suggestedDonation = baseCost * 0.10;
                return (
                  <div className="bg-slate-950 border-2 border-black p-4 rounded-2xl space-y-3 text-left">
                    <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                      <span className="text-xs text-gray-400">Precio Base del Plan:</span>
                      <span className="text-xs text-white font-mono font-bold">{getPlanDetails(showPaymentModal).price}</span>
                    </div>
                    
                    <div className="bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-xl text-left space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-emerald-400 font-bold flex items-center gap-1">🌱 Aporte Social Automático (5%):</span>
                        <span className="text-white font-mono font-bold">
                          {isVIP ? '$0.75' : '$0.25'} USD
                        </span>
                      </div>
                      <p className="text-[9.5px] text-gray-400 leading-normal">
                        Incluido automáticamente con tu compra. Con el plan de $5 se donan $0.25 y con el de $15 se donan $0.75 para financiar la creación de los proyectos de la <strong className="text-white">Fundación Guerreros de Luz</strong> (guerrerosdeluz.com) que se detallan en la página.
                      </p>
                    </div>

                    <div className="bg-[#EF4444]/10 border border-[#EF4444]/20 p-3 rounded-xl text-left space-y-2">
                      <label className="flex items-start gap-2.5 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={addDonation}
                          onChange={(e) => setAddDonation(e.target.checked)}
                          className="mt-1 w-4 h-4 rounded border-black text-[#EF4444] bg-slate-900 focus:ring-[#EF4444] cursor-pointer"
                        />
                        <div className="space-y-1">
                          <span className="text-xs font-black text-rose-400 uppercase font-mono tracking-wide flex items-center gap-1">
                            💖 Donación voluntaria del 10% (+{isVIP ? '$1.50' : '$0.50'} USD)
                          </span>
                          <p className="text-[10px] text-slate-350 leading-relaxed">
                            Súmate a la causa. Sugerimos un 10% adicional (ej. $0.50 en paquete de $5) para financiar los proyectos de la <strong className="text-white">Fundación Guerreros de Luz</strong> de ayuda social detallados en guerrerosdeluz.com.
                          </p>
                        </div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-850">
                      <span className="text-xs text-white font-bold">Total Neto a Pagar:</span>
                      <span className="text-sm text-yellow-450 font-mono font-extrabold animate-pulse">
                        {pricingLocation === 'España' 
                          ? `${(baseCost + (addDonation ? suggestedDonation : 0)).toFixed(2)} €`
                          : `$${(baseCost + (addDonation ? suggestedDonation : 0)).toFixed(2)} USD`
                        }
                      </span>
                    </div>
                  </div>
                );
              })()}

              {/* Payment Alert error feedback */}
              {paymentError && (
                <div className="bg-rose-500/10 border-2 border-black text-rose-400 text-xs p-3 rounded-2xl flex items-center gap-2 font-mono leading-relaxed">
                  <AlertCircle className="w-4.5 h-4.5 shrink-0 text-rose-500" />
                  <span>{paymentError}</span>
                </div>
              )}

              {/* Primary action trigger buttons */}
              <button
                onClick={executePaymentSubmit}
                disabled={submittingPayment}
                className={`w-full py-3.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all border-2 border-black shadow-[4px_4px_0_#000] cursor-pointer active:translate-y-0.5 ${
                  paymentGateway === 'deuna'
                    ? 'bg-teal-400 text-black hover:bg-teal-350'
                    : paymentGateway === 'payphone'
                      ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                      : paymentGateway === 'stripe'
                        ? 'bg-[#635BFF] text-white hover:bg-[#5249f0]'
                        : paymentGateway === 'transferencia'
                          ? 'bg-indigo-600 text-white hover:bg-indigo-500'
                          : 'bg-rose-500 text-black hover:bg-rose-400'
                }`}
              >
                {submittingPayment ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Procesando Licencia...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4.5 h-4.5" /> 
                    Confirmar Pago de {(() => {
                      const baseCost = getPlanDetails(showPaymentModal).amount || 0;
                      const suggestedDonation = baseCost * 0.10;
                      return pricingLocation === 'España'
                        ? `${(baseCost + (addDonation ? suggestedDonation : 0)).toFixed(2)} €`
                        : `$${(baseCost + (addDonation ? suggestedDonation : 0)).toFixed(2)} USD`;
                    })()}
                  </>
                )}
              </button>

              <div className="text-center">
                <span className="text-[9.5px] text-slate-500 font-mono uppercase tracking-widest block font-bold">
                  🔒 ENCRIPTACIÓN AES-256 Sorteos Ecuador 2026
                </span>
                <p className="text-[9px] text-gray-550 italic mt-0.5">
                  Conexión segura certificada. Todos los tickets de compra constan inmediatamente en base de datos.
                </p>
              </div>

            </div>
          </motion.div>
        </div>
      )}

      {showGoldenGiftModal && (
        <div className="fixed inset-0 z-[160] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-[#0c0f1d] border-4 border-amber-400 text-white rounded-3xl w-full max-w-md p-6 overflow-hidden shadow-[0_0_35px_rgba(234,179,8,0.35)] flex flex-col items-center relative text-center"
          >
            {/* Shimmer overlay effect */}
            <div className="absolute top-2 left-2 text-amber-400 opacity-60"><Sparkles className="w-5 h-5 animate-pulse" /></div>
            <div className="absolute top-2 right-2 text-amber-400 opacity-60"><Sparkles className="w-5 h-5 animate-spin" /></div>
            
            {/* Golden Header Badge */}
            <div className="bg-gradient-to-r from-amber-500 to-yellow-300 text-slate-950 font-black text-[10px] uppercase tracking-widest px-4 py-1 rounded-full shadow border border-amber-200 mt-2 font-mono">
              ★ REGALO EXCLUSIVO: TARJETA GOLDEN ★
            </div>

            {/* The Actual Golden Card Box */}
            <div className="my-6 relative bg-gradient-to-b from-amber-400/20 via-yellow-500/5 to-slate-950 border-3 border-amber-400 p-5 rounded-2xl w-full max-w-[280px] shadow-[0_10px_25px_rgba(234,179,8,0.2)] text-center relative overflow-hidden group">
              {/* Inner glowing badge */}
              <div className="absolute top-1 right-1 bg-amber-400 text-slate-950 font-black text-[8px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                GOLDEN DT
              </div>

              {/* Avatar renderer with golden halo */}
              <div className="relative mx-auto w-36 h-36 flex items-center justify-center rounded-full bg-gradient-to-tr from-amber-400/30 via-slate-900/95 to-amber-500/30 p-1.5 border-2 border-amber-300 shadow-[0_0_20px_rgba(234,179,8,0.4)] overflow-hidden">
                <DTAvatarRenderer config={getAvatarConfig()} size={120} glow={true} />
              </div>

              {/* Player / Hero Label */}
              <h5 className="text-sm font-extrabold text-amber-300 uppercase tracking-wide mt-4 font-mono">
                ¡HÉROE DEL DEPORTE!
              </h5>
              <div className="text-[10px] uppercase font-mono text-white/90 tracking-wider bg-amber-400/10 border border-amber-400/25 py-1 px-2.5 rounded-lg mt-1.5 inline-block">
                Socio Colaborador
              </div>

              {/* Ribbon Seal */}
              <div className="text-[8px] font-mono text-amber-400/80 mt-3 border-t border-amber-400/20 pt-2 flex items-center justify-center gap-1">
                <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> Aporte del 5% del Canje
              </div>
            </div>

            {/* Social Cause Explanation */}
            <div className="space-y-3 px-2">
              <h4 className="text-sm font-bold text-white uppercase tracking-wide">
                ¡Gracias por tu contribución social!
              </h4>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Con tu compra de <strong className="text-amber-300 font-bold">{lastPurchasedDetails.name}</strong> ({lastPurchasedDetails.price}), estás donando el <strong className="text-emerald-400 font-extrabold">5% ({lastPurchasedDetails.contribution})</strong> directamente para proyectos de ayuda social de la <span className="text-amber-300 font-black">Fundación Guerreros de Luz</span>.
              </p>
              <div className="bg-slate-950/80 border border-amber-400/30 p-2.5 rounded-xl flex items-center gap-2 text-left text-[10.5px] text-amber-200">
                <Gift className="w-5 h-5 shrink-0 text-amber-400 animate-bounce" />
                <span className="leading-normal font-medium">
                  Gracias héroe del deporte, con tu contribución ayudas a proyectos de ayuda social para la fundación Guerreros de Luz. Esta tarjeta dorada de edición especial es tuya.
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="w-full mt-5 flex flex-col gap-2">
              <button
                onClick={() => setShowGoldenGiftModal(false)}
                className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-[4px_4px_0px_#000] border-2 border-slate-950 active:translate-y-0.5 transition cursor-pointer"
              >
                Reclamar Tarjeta Dorada ✨
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}
