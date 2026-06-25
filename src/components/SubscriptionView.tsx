import React, { useState } from 'react';
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
  Gift
} from 'lucide-react';
import { motion } from 'motion/react';
import { COUNTRIES } from '../data';

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
  onUpdateVipContinent = () => {}
}: SubscriptionViewProps) {
  const [purchaseLoading, setPurchaseLoading] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [promoCode, setPromoCode] = useState<string>('');
  const [promoError, setPromoError] = useState<string>('');

  // Payment checkout modal states
  const [showPaymentModal, setShowPaymentModal] = useState<string | null>(null);
  // payment modes: 'deuna' | 'payphone' | 'transferencia' | 'efectivo' | 'saldo'
  const [paymentGateway, setPaymentGateway] = useState<'deuna' | 'payphone' | 'transferencia' | 'efectivo' | 'saldo'>('deuna');
  
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
  
  const [submittingPayment, setSubmittingPayment] = useState<boolean>(false);
  const [paymentError, setPaymentError] = useState<string>('');

  // Warning when unregistered user clicks on any plan
  const [showUnregisteredAlert, setShowUnregisteredAlert] = useState<boolean>(false);

  // Charity & Social Impact Module States (Nutrición y Alfabetización Infantil)
  const [personalDonationTotal, setPersonalDonationTotal] = useState<number>(() => {
    return Number(localStorage.getItem('album_user_donations_total') || '0');
  });
  const [communityBasePool, setCommunityBasePool] = useState<number>(() => {
    return Number(localStorage.getItem('album_community_donations_base') || '14250');
  });
  const [donationInput, setDonationInput] = useState<string>('10');
  const [chosenCharityCause, setChosenCharityCause] = useState<'nutrition' | 'literacy' | 'all'>('all');
  const [showDonationSuccessAlert, setShowDonationSuccessAlert] = useState<boolean>(false);
  const [lastDonatedAmount, setLastDonatedAmount] = useState<number>(0);
  const [isDonatingProgress, setIsDonatingProgress] = useState<boolean>(false);
  const [donationPaymentMethod, setDonationPaymentMethod] = useState<'deuna' | 'payphone' | 'transferencia'>('deuna');
  const [donationFormReference, setDonationFormReference] = useState<string>('');
  const [donationErrorStr, setDonationErrorStr] = useState<string>('');

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
      const newPersonalTotal = personalDonationTotal + amount;
      const newCommunityBase = communityBasePool + amount; 
      setPersonalDonationTotal(newPersonalTotal);
      localStorage.setItem('album_user_donations_total', String(newPersonalTotal));
      
      setCommunityBasePool(newCommunityBase);
      localStorage.setItem('album_community_donations_base', String(newCommunityBase));
      
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
    let pointsToAdd = 0;
    let desc = '';

    if (planTier === 'Pase VIP Elite') {
      const countries = getCountriesForVIPSelection(selectedContinentToPurchase);
      countries.forEach(country => {
        nextUnlocked[country] = { 1: true, 2: true, 3: true };
      });
      pointsToAdd = 15;
      desc = `Canje VIP: Continente ${selectedContinentToPurchase}`;
      onUpdateVipContinent(selectedContinentToPurchase);
    } else if (planTier === 'Plan Scout Básico') {
      nextUnlocked[selectedCountryToPurchase] = { 1: true, 2: true, 3: true };
      onUpdateScoutCountry(selectedCountryToPurchase);
      pointsToAdd = 5;
      desc = `Canje Scout: Selección ${selectedCountryToPurchase}`;
    }

    onSetUnlockedLevels(nextUnlocked);
    localStorage.setItem('scouting_unlocked_levels', JSON.stringify(nextUnlocked));

    if (onAddPurchasedPoints) {
      onAddPurchasedPoints(pointsToAdd);
    }

    return { pointsToAdd, desc };
  };

  const getPlanDetails = (planId: string | null) => {
    if (!planId || planId === 'Ninguna') {
      return { price: '$0.00', amount: 0, text: 'Plan Activo por Defecto' };
    }
    if (planId === 'Plan Scout Básico') {
      if (pricingLocation === 'Ecuador') {
        return { price: '$5.00', amount: 5.00, text: `Desbloquear ${selectedCountryToPurchase} ($5.00)` };
      } else if (pricingLocation === 'España') {
        return { price: '10.00 €', amount: 10.00, text: `Desbloquear ${selectedCountryToPurchase} (10.00 €)` };
      } else {
        return { price: '$10.00', amount: 10.00, text: `Desbloquear ${selectedCountryToPurchase} ($10.00)` };
      }
    }
    // Pase VIP Elite
    if (pricingLocation === 'Ecuador') {
      return { price: '$15.00', amount: 15.00, text: `Canjear Continente ${selectedContinentToPurchase} ($15.00)` };
    } else if (pricingLocation === 'España') {
      return { price: '20.00 €', amount: 20.00, text: `Canjear Continente ${selectedContinentToPurchase} (20.00 €)` };
    } else {
      return { price: '$20.00', amount: 20.00, text: `Canjear Continente ${selectedContinentToPurchase} ($20.00)` };
    }
  };

  const plans = [
    {
      id: 'Ninguna',
      name: 'Plan Gratuito Amateur',
      price: '$0.00',
      period: 'Gratis por siempre',
      desc: 'Acceso básico para coleccionistas casuales.',
      features: [
        'Colecciona sobres resolviendo trivias ordinarias',
        'Hasta 3 pizarras tácticas guardadas simultáneamente',
        'Estadísticas de aciertos globales básicas'
      ],
      buttonText: 'Plan Activo por Defecto',
      popular: false,
      color: 'border-slate-800 bg-slate-900/40 text-gray-400'
    },
    {
      id: 'Plan Scout Básico',
      name: 'Plan de Suscripción Scout',
      price: getPlanDetails('Plan Scout Básico').price,
      period: 'Por Selección Individual',
      desc: 'Compra cromos de selecciones individuales por $5 cada una. Cada selección acreditada te suma +5 puntos de score de DT y desbloquea el país completo.',
      features: [
        'Cuesta $5.00 por cada país/selección de tu elección 🎯',
        'Suma inmediata de +5 puntos de score a tu puntuación de DT 📈',
        'Desbloqueo al 100% de todos los cromos (26/26) del país elegido inmediatamente 🌟',
        'Paga de forma flexible y canjea múltiples selecciones individuales',
        'Inscripción de sorteo garantizada si estás en el top el día de la final'
      ],
      buttonText: 'Adquirir Selección ($5.00)',
      popular: false,
      color: 'border-indigo-500/20 bg-indigo-950/10 text-indigo-300'
    },
    {
      id: 'Pase VIP Elite',
      name: 'Pase VIP Elite (Suscripción VIP)',
      price: getPlanDetails('Pase VIP Elite').price,
      period: 'Por Continente Completo',
      desc: 'Canjea los cromos de un continente a tu elección por $15. Cada canje de continente te acredita +15 puntos de score de DT y desbloquea todos sus países.',
      features: [
        'Cuesta $15.00 por continente (América, Europa o África/Asia/Oceanía juntas) 🌍',
        'Suma inmediata de +15 puntos de score a tu puntuación de DT por cada continente canjeado 👑',
        'Desbloqueo automático al 100% de todos los cromos de todos los países de ese continente 🏆',
        'Corte final de puntuaciones realizado el día 20 de julio de 2026',
        'Insignia dorada VIP de DT verificado en el panel de control'
      ],
      buttonText: 'Adquirir Continente ($15.00)',
      popular: true,
      color: 'border-amber-500 bg-amber-500/5 text-amber-400'
    }
  ];

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
    
    // Check if user is logged in / registered (non-guest account with real email)
    const isUnregistered = currentUserId === 'user_me' || !userEmail || userEmail.trim() === '';
    
    if (isUnregistered) {
      setShowUnregisteredAlert(true);
      return;
    }

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
      if (!bankReference.trim() || bankReference.trim().length < 5) {
        setPaymentError('Ingresa el número de referencia, comprobante o secuencial de tu transferencia bancaria de la cooperativa o banco.');
        return;
      }
    } else if (paymentGateway === 'efectivo') {
      const code = cashCodeVal.trim().toUpperCase();
      if (!code) {
        setPaymentError('Ingresa el código impreso en tu boleto de caja / factura física.');
        return;
      }
      
      // Let's add fun simulation validations for cash codes!
      if (isVIP) {
        if (code !== 'EFECTIVO15' && code !== 'CASH15' && code.length < 6) {
          setPaymentError('Código física inválido para este plan. Prueba usando el código de prueba: "EFECTIVO15" o "CASH15".');
          return;
        }
      } else {
        if (code !== 'EFECTIVO5' && code !== 'CASH5' && code.length < 5) {
          setPaymentError('Código física inválido para este plan. Prueba usando el código de prueba: "EFECTIVO5" o "CASH5".');
          return;
        }
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
      
      setSuccessMsg(`¡Canje de "${showPaymentModal}" activado con éxito! Se han descontado ${getPlanDetails(showPaymentModal).price} de tu saldo de cuenta y desbloqueado tus cromos.`);
      setShowPaymentModal(null);
      return;
    }

    setSubmittingPayment(true);

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
            onUpdateSubscription(showPaymentModal);
            setSuccessMsg(`¡Pago validado con éxito! Has canjeado "${showPaymentModal}". Tu ID de transacción es ${data.transactionId}.`);
            setShowPaymentModal(null);
          } else {
            // Simulated fallback client unlock
            processPurchaseUnlocks(showPaymentModal);
            onUpdateSubscription(showPaymentModal);
            setSuccessMsg(`¡Pago de Payphone simulado con éxito! Has desbloqueado "${showPaymentModal}" y tus puntos.`);
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
            reference: deunaReference || bankReference || cashCodeVal,
            promoterId: localStorage.getItem('affiliate_ref') || ''
          })
        });
        const data = await response.json();
        
        const unlockInfo = processPurchaseUnlocks(showPaymentModal);
        const transactionDesc = unlockInfo ? `${unlockInfo.desc} (${paymentGateway})` : `Licencia ${showPaymentModal} (${paymentGateway})`;
        let cost = getPlanDetails(showPaymentModal).amount;
        onAddTransaction(transactionDesc, -cost, 'cash');
        
        if (data.status === 'success') {
          onUpdateSubscription(showPaymentModal);
          setSuccessMsg(`¡Gracias! Pago verificado. Has completado tu canje de "${showPaymentModal}". Se te han acreditado +${unlockInfo?.pointsToAdd || 0} puntos.`);
        } else {
          onUpdateSubscription(showPaymentModal);
          setSuccessMsg(`¡Gracias! Conectado con éxito. Se ha activado tu canje "${showPaymentModal}" y sumado tus respectivos puntos.`);
        }
      } catch (err) {
        console.error('Subscription premium payment error:', err);
        // Fallback successful client unlock
        const unlockInfo = processPurchaseUnlocks(showPaymentModal);
        const transactionDesc = unlockInfo ? `${unlockInfo.desc} (${paymentGateway})` : `Licencia ${showPaymentModal} (${paymentGateway})`;
        let cost = getPlanDetails(showPaymentModal).amount;
        onAddTransaction(transactionDesc, -cost, 'cash');
        onUpdateSubscription(showPaymentModal);
        setSuccessMsg(`¡Suscripción desbloqueada con éxito! Disfruta de tu plan premium "${showPaymentModal}" y tus puntos.`);
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

      {/* Dynamic Location & Promoter Rate Adaptor Panel */}
      <div className="bg-[#0f172a] border-2 border-black rounded-3xl p-5 shadow-[4px_4px_0px_rgba(0,0,0,1)] space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <span className="text-[9px] font-mono text-emerald-400 font-bold uppercase tracking-widest block bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/15 w-fit">
              📌 Tasa Tarifaria Oficial por Región
            </span>
            <h3 className="text-sm font-bold text-white mt-1">Tarificación de Promotores de Calle Autorizados</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Los promotores autorizados de Ecuador y España cuentan con tasas especiales reguladas. Selecciona tu región para cotizar:
            </p>
          </div>
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0">
            <button
              onClick={() => setPricingLocation('Ecuador')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition font-mono ${
                pricingLocation === 'Ecuador'
                  ? 'bg-emerald-600 text-white border border-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🇪🇨 Ecuador ($5 / $15)
            </button>
            <button
              onClick={() => setPricingLocation('España')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition font-mono ${
                pricingLocation === 'España'
                  ? 'bg-indigo-600 text-white border border-indigo-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🇪🇸 España (10€ / 20€)
            </button>
            <button
              onClick={() => setPricingLocation('Internacional')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition font-mono ${
                pricingLocation === 'Internacional'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🌎 Global ($10 / $20)
            </button>
          </div>
        </div>

        {/* Dynamic badge if sponsor is active */}
        {localStorage.getItem('affiliate_ref') && (
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3 flex items-center justify-between text-xs text-slate-350">
            <div className="flex items-center gap-2">
              <span className="text-emerald-400">✨</span>
              <span>
                Promotor de Referencia Activo: <strong className="text-emerald-400 font-mono select-all uppercase">{localStorage.getItem('affiliate_ref')}</strong> 
                {pricingLocation === 'Ecuador' && ' (Ciudad: Quito/Guayaquil, Ecuador. Precio Reducido Aplicado)'}
                {pricingLocation === 'España' && ' (Ciudad: Madrid, España. Precio Especial en Euros € Aplicado)'}
              </span>
            </div>
            <button 
              onClick={() => {
                localStorage.removeItem('affiliate_ref');
                window.location.reload();
              }}
              className="text-[10px] text-rose-400 hover:underline font-mono bg-transparent border-none cursor-pointer"
            >
              [Eliminar Referencia]
            </button>
          </div>
        )}
      </div>

      {/* 3. Plans comparison cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((p) => {
          const isActive = currentSubscription === p.id || (p.id === 'Ninguna' && !currentSubscription);
          const isVIP = p.id === 'Pase VIP Elite';
          const isScout = p.id === 'Plan Scout Básico';

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
                    {p.id === 'Pase VIP Elite' && <span className="text-amber-400">👑</span>}
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
                      🎯 Elige Selección de País:
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
                {isActive ? (
                  <div className="w-full py-2.5 text-[11px] font-bold font-mono uppercase tracking-wider rounded-xl bg-slate-850 border-2 border-slate-800 text-emerald-400 flex items-center justify-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" /> Plan Activo Actual
                  </div>
                ) : (
                  <button
                    onClick={() => handlePlanSelection(p.id)}
                    disabled={purchaseLoading !== null || p.id === 'Ninguna'}
                    className={`w-full py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 relative border-2 border-black shadow-[2.5px_2.5px_0px_#000] active:translate-y-0.5 ${
                      isVIP 
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-450 text-slate-950 hover:bg-amber-400' 
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>{isVIP ? `Canjear ${selectedContinentToPurchase} ($15)` : isScout ? `Canjear ${selectedCountryToPurchase} ($5)` : p.buttonText}</span>
                  </button>
                )}
              </div>
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
                ¡Enhorabuena! Has desbloqueado <strong>todos los países y todos sus cromos al 100% al instante</strong>. Ya no requieres superar trivias para coleccionar. Además has recibido tu boost de 15 puntos y tu inscripción oficial al sorteo auditable de premios físicos.
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
            Todos los cobros y adquisiciones de licencias quedan registrados bajo el amparo de tu credencial única de Director Técnico. Esto previene re-intentos fallidos, duplicaciones de cromos y garantiza una auditoría pública.
          </p>
        </div>

        {successMsg && (
          <div className="bg-emerald-500/15 border-2 border-emerald-500/30 rounded-2xl p-3 flex items-start gap-2.5 mt-3">
            <ShieldCheck className="w-4.5 h-4.5 text-emerald-400 shrink-0 mt-0.5" />
            <p className="text-[10px] text-slate-300 leading-normal">{successMsg}</p>
          </div>
        )}

        <div className="bg-slate-950/50 border border-slate-850 p-3 rounded-xl flex items-start gap-2 mt-3">
          <Info className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
          <div className="text-[10px] text-gray-400 leading-normal">
            Pasarela de simulación comercial con soporte para Ecuador (Deuna, Payphone, Transferencias) totalmente funcional.
          </div>
        </div>
      </div>

      {/* SECCIÓN SOLIDARIA: DEPORTISTAS POR LA INFANCIA */}
      <div className="bg-[#0b0e17] border-[3.5px] border-black rounded-3xl p-6 shadow-[6px_6px_0px_#EF4444] relative overflow-hidden mt-8" id="social-responsibility-portal">
        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex items-center gap-3 border-b-2 border-black pb-4 mb-5">
          <Heart className="w-7 h-7 text-[#EF4444] animate-pulse shrink-0 fill-[#EF4444]" />
          <div>
            <h3 className="font-bangers text-2xl text-white tracking-wider uppercase">MÓDULO SOLIDARIO: DEPORTISTAS POR LA INFANCIA</h3>
            <p className="text-[#10B981] font-mono text-xs uppercase tracking-widest font-bold">5% de Utilidad Neto Donado Automáticamente & Aportes Voluntarios</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left panel info */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-slate-950/80 border border-slate-850 p-4.5 rounded-2xl">
              <h4 className="font-extrabold text-sm text-white mb-2 flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-400" /> Nuestro Compromiso Real
              </h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Este álbum no solo es para divertirnos y competir: <strong className="text-white">nos comprometemos a donar el 5% de la utilidad neta</strong> de cada pase VIP y paquete de stickers adquirido para <strong className="text-emerald-405">impulsar fondos de Inteligencia nutricional, para niños-as en situación de riesgo</strong>.
              </p>
            </div>

            {/* Pooled statistics widgets with real counts */}
            <div className="space-y-3">
              <div className="bg-slate-950/50 border border-slate-900 p-3 rounded-xl flex justify-between items-center">
                <span className="text-[11px] text-gray-500 font-mono uppercase">Fondo 5% de Utilidad:</span>
                <span className="text-xs text-emerald-400 font-bold font-mono">
                  {communityBasePool.toLocaleString('es-EC', { style: 'currency', currency: 'USD' })}
                </span>
              </div>

              <div className="bg-slate-950/50 border border-slate-900 p-3 rounded-xl flex justify-between items-center">
                <span className="text-[11px] text-gray-500 font-mono uppercase">Tus Donaciones Directas:</span>
                <span className="text-xs text-[#EF4444] font-bold font-mono">
                  {personalDonationTotal.toLocaleString('es-EC', { style: 'currency', currency: 'USD' })}
                </span>
              </div>

              <div className="bg-gradient-to-r from-red-950/20 to-emerald-950/20 border-2 border-black p-3.5 rounded-xl flex justify-between items-center">
                <span className="text-xs text-white font-mono uppercase font-bold">Pool Solidario Total:</span>
                <span className="text-sm text-yellow-450 font-extrabold font-mono animate-pulse">
                  {(communityBasePool + personalDonationTotal).toLocaleString('es-EC', { style: 'currency', currency: 'USD' })}
                </span>
              </div>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/25 p-3 rounded-xl text-[10.5px] text-amber-300 leading-normal flex items-start gap-2">
              <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-450" />
              <span>
                Simulación solidaria totalmente interactiva. Haz tus aportes ficticios de ayuda mediante transferencias o Deuna para ver cómo el pozo total crece. ¡Hagamos la diferencia!
              </span>
            </div>
          </div>

          {/* Right form widget */}
          <div className="lg:col-span-7 bg-brand-sidebar border-2 border-black rounded-2xl p-5 shadow-[4px_4px_0_#000] relative">
            <h4 className="font-extrabold text-sm text-white mb-3.5 flex items-center gap-1.5 uppercase font-mono tracking-wide text-indigo-400">
              <Sparkles className="w-4 h-4" /> Realizar Aporte Voluntario
            </h4>

            {showDonationSuccessAlert && (
              <div className="bg-[#10B981]/15 border border-[#10B981]/40 text-[#10B981] p-4 rounded-xl mb-4 text-xs font-mono relative">
                <button 
                  onClick={() => setShowDonationSuccessAlert(false)}
                  className="absolute top-2 right-2 text-gray-500 hover:text-white transition cursor-pointer font-bold text-xs"
                >
                  ✕
                </button>
                <div className="flex items-start gap-2 text-left">
                  <span className="text-lg">💖</span>
                  <div>
                    <strong className="block text-white">¡Aporte Solidario Registrado!</strong>
                    Haz donado <strong className="text-yellow-405">${lastDonatedAmount} USD</strong> con éxito. Tu nombre de D.T. y aporte han quedado anotados en el registro público de causas sociales infantiles del Torneo. ¡Muchas gracias por tu corazón solidario!
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleDonationSubmit} className="space-y-4">
              {/* Select preset amount */}
              <div>
                <label className="text-[10px] text-gray-500 font-mono uppercase tracking-wider block mb-1.5 text-left">Monto del Aporte (USD)</label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {['5', '10', '25', '50'].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setDonationInput(preset)}
                      className={`py-2 text-xs font-bold font-mono rounded-xl border transition-all cursor-pointer ${
                        donationInput === preset
                          ? 'bg-[#EF4444] text-white border-black shadow-[2px_2px_0_#000]'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      ${preset}
                    </button>
                  ))}
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 font-mono">$</span>
                  <input
                    type="number"
                    min="1"
                    placeholder="Otro valor personalizado"
                    value={donationInput}
                    onChange={(e) => setDonationInput(e.target.value)}
                    className="bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 text-white font-mono placeholder:text-gray-600 w-full"
                  />
                </div>
              </div>

              {/* Donation simulated payment methods */}
              <div>
                <label className="text-[10px] text-gray-500 font-mono uppercase tracking-wider block mb-1.5 text-left">Canal de Pago (Simulado Ecuador)</label>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => { setDonationPaymentMethod('deuna'); setDonationFormReference(''); }}
                    className={`py-1.5 text-[10.5px] font-bold rounded-xl border text-center transition cursor-pointer ${
                      donationPaymentMethod === 'deuna'
                        ? 'bg-teal-500/10 text-teal-400 border-teal-500'
                        : 'bg-slate-950 text-slate-400 border-slate-850'
                    }`}
                  >
                    Deuna QR
                  </button>

                  <button
                    type="button"
                    onClick={() => { setDonationPaymentMethod('payphone'); setDonationFormReference(''); }}
                    className={`py-1.5 text-[10.5px] font-bold rounded-xl border text-center transition cursor-pointer ${
                      donationPaymentMethod === 'payphone'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500'
                        : 'bg-slate-950 text-slate-400 border-slate-855'
                    }`}
                  >
                    Payphone App
                  </button>

                  <button
                    type="button"
                    onClick={() => { setDonationPaymentMethod('transferencia'); setDonationFormReference(''); }}
                    className={`py-1.5 text-[10.5px] font-bold rounded-xl border text-center transition cursor-pointer ${
                      donationPaymentMethod === 'transferencia'
                        ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500'
                        : 'bg-slate-950 text-slate-400 border-slate-855'
                    }`}
                  >
                    Transferencia
                  </button>
                </div>

                {donationPaymentMethod === 'deuna' && (
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 space-y-2">
                    <p className="text-[10px] text-gray-400 leading-relaxed font-mono text-left">
                      Deuna el monto al celular de la Fundación <strong className="text-white">0998765432</strong> o ingresa la referencia ficticia de transacción para validar.
                    </p>
                    <input
                      type="text"
                      placeholder="Monto enviado o referencia (ej: 098123456)"
                      value={donationFormReference}
                      onChange={(e) => setDonationFormReference(e.target.value)}
                      className="bg-brand-deep border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder:text-gray-600 w-full font-mono focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                  </div>
                )}

                {donationPaymentMethod === 'payphone' && (
                  <div className="bg-slate-955 p-3 rounded-xl border border-slate-850 text-left">
                    <p className="text-[10px] text-gray-400 font-mono leading-relaxed">
                      Lanzaremos una petición segura a la app móvil de PayPhone vinculada a tu ID. Cobro en simulación inmediata de fondos de prueba.
                    </p>
                  </div>
                )}

                {donationPaymentMethod === 'transferencia' && (
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 space-y-2 text-left">
                    <div className="text-[9.5px] text-gray-400 leading-normal font-mono space-y-0.5">
                      <p><strong className="text-white">Banco:</strong> Banco Solidario S.A. (Ecuador)</p>
                      <p><strong className="text-white">Cuenta de Ahorros:</strong> 1200456111</p>
                      <p><strong className="text-white">Beneficiario:</strong> Ayuda Infantil y Educación Global</p>
                    </div>
                    <input
                      type="text"
                      placeholder="Número de Comprobante / Voucher"
                      value={donationFormReference}
                      onChange={(e) => setDonationFormReference(e.target.value)}
                      className="bg-brand-deep border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder:text-gray-600 w-full font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                )}
              </div>

              {donationErrorStr && (
                <div className="text-[10px] text-rose-450 italic font-mono text-left">
                  ⚠ {donationErrorStr}
                </div>
              )}

              {/* Form submit button */}
              <button
                type="submit"
                disabled={isDonatingProgress}
                className="w-full py-3 bg-[#EF4444] hover:bg-[#DC2626] text-white font-bangers text-sm rounded-xl tracking-widest border-2 border-black uppercase cursor-pointer shadow-[4px_4px_0px_#000] active:translate-y-0.5 select-none transition-all flex items-center justify-center gap-1.5"
              >
                {isDonatingProgress ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Procesando Donación...
                  </>
                ) : (
                  <>
                    <Heart className="w-4.5 h-4.5 fill-white text-white" /> Donar ${donationInput} USD de Corazón 💖
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
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
              
              {/* Payment Gateways Selection list / Ecuador Adaptation */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1.5 bg-slate-950 border-2 border-black rounded-2xl p-1.5 text-center">

                <button
                  type="button"
                  onClick={() => { setPaymentGateway('deuna'); setPaymentError(''); }}
                  className={`py-2 px-1 text-[10.5px] font-black rounded-xl transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-1 border ${
                    paymentGateway === 'deuna' 
                      ? 'bg-teal-500 text-black border-black shadow' 
                      : 'text-gray-400 hover:text-white border-transparent'
                  }`}
                >
                  <QrCode className="w-4 h-4" /> Deuna
                </button>

                <button
                  type="button"
                  onClick={() => { setPaymentGateway('payphone'); setPaymentError(''); }}
                  className={`py-2 px-1 text-[10.5px] font-black rounded-xl transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-1 border ${
                    paymentGateway === 'payphone' 
                      ? 'bg-amber-500 text-slate-950 border-black shadow' 
                      : 'text-gray-400 hover:text-white border-transparent'
                  }`}
                >
                  <Smartphone className="w-4 h-4" /> Payphone
                </button>

                <button
                  type="button"
                  onClick={() => { setPaymentGateway('transferencia'); setPaymentError(''); }}
                  className={`py-2 px-1 text-[10.5px] font-black rounded-xl transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-1 border ${
                    paymentGateway === 'transferencia' 
                      ? 'bg-indigo-600 text-white border-black shadow' 
                      : 'text-gray-400 hover:text-white border-transparent'
                  }`}
                >
                  <Building className="w-4 h-4" /> Transfer
                </button>

                <button
                  type="button"
                  onClick={() => { setPaymentGateway('efectivo'); setPaymentError(''); }}
                  className={`py-2 px-1 text-[10.5px] font-black rounded-xl transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-1 border ${
                    paymentGateway === 'efectivo' 
                      ? 'bg-rose-500 text-black border-black shadow' 
                      : 'text-gray-400 hover:text-white border-transparent'
                  }`}
                >
                  <Coins className="w-4 h-4" /> Efectivo
                </button>

                <button
                  type="button"
                  onClick={() => { setPaymentGateway('saldo'); setPaymentError(''); }}
                  className={`py-2 px-1 text-[10.5px] font-black rounded-xl transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-1 border ${
                    paymentGateway === 'saldo' 
                      ? 'bg-emerald-500 text-black border-black shadow' 
                      : 'text-gray-400 hover:text-white border-transparent'
                  }`}
                >
                  <Award className="w-4 h-4" /> Mi Saldo
                </button>
              </div>

              {/* Dynamic Payment Gateways viewport */}
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
                    <p><strong className="text-white">Banco:</strong> Banco Pichincha (Ecuador)</p>
                    <p><strong className="text-white">Tipo de Cuenta:</strong> Corriente</p>
                    <p><strong className="text-white">Número de Cuenta:</strong> 2100456123</p>
                    <p><strong className="text-white">Beneficiario:</strong> Álbum de Trivia de Selecciones S.A.</p>
                    <p><strong className="text-white">RUC:</strong> 1792837482001</p>
                    <p><strong className="text-white">Email:</strong> pagos@albumtrivia2026.com</p>
                    <p><strong className="text-white">Monto:</strong> <span className="text-emerald-400 font-bold">{getPlanDetails(showPaymentModal).price}</span></p>
                  </div>

                  <div className="text-left space-y-1">
                    <label className="text-[10px] text-indigo-400 font-mono uppercase tracking-wider block font-bold">Concepto / Número de Documento / Referencia de Transferencia</label>
                    <input
                      type="text"
                      placeholder="Ej: Secuencial, número de comprobante o clave"
                      value={bankReference}
                      onChange={(e) => setBankReference(e.target.value)}
                      className="w-full bg-slate-950 border-2 border-black rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                    />
                    <span className="text-[9.5px] text-gray-500 block italic leading-tight">* El abono será auditado dinámicamente en menos de 5 minutos.</span>
                  </div>
                </div>
              )}

              {/* 4. CASH COUPON (EFECTIVO) */}
              {paymentGateway === 'efectivo' && (
                <div className="space-y-3.5 animate-fade-in bg-rose-950/20 border-2 border-black p-4 rounded-2xl">
                  <div className="text-center">
                    <span className="text-[10px] text-rose-450 uppercase tracking-widest font-mono font-bold block mb-1">ACTIVACIÓN FÍSICA EN EFECTIVO</span>
                    <p className="text-xs text-slate-300">
                      Habilite su pase mediante un cupón impreso de caja o vale emitido en efectivo en puntos físicos:
                    </p>
                  </div>

                  <div className="bg-slate-950 p-3.5 rounded-xl border border-rose-500/15 text-center">
                    <p className="text-xs text-slate-400">
                      Si realizó su pago offline en tiendas habilitadas de álbumes, ingrese el código táctil impreso en su recibo oficial para desbloqueo atómico.
                    </p>
                    <p className="text-[10px] text-rose-400 font-mono mt-2 uppercase">
                      ⚠️ CÓDIGOS DE PRUEBA:
                    </p>
                    <p className="text-[11px] text-slate-205 font-mono">
                      Plan Scout ({pricingLocation === 'España' ? '10 €' : pricingLocation === 'Ecuador' ? '$5' : '$10'}): <strong className="text-amber-400 select-all">EFECTIVO5</strong> o <strong className="text-amber-400 select-all">CASH5</strong>
                    </p>
                    <p className="text-[11px] text-slate-205 font-mono mt-0.5">
                      Pase VIP ({pricingLocation === 'España' ? '20 €' : pricingLocation === 'Ecuador' ? '$15' : '$20'}): <strong className="text-amber-400 select-all">EFECTIVO15</strong> o <strong className="text-amber-400 select-all">CASH15</strong>
                    </p>
                  </div>

                  <div className="text-left space-y-1">
                    <label className="text-[10px] text-rose-400 font-mono uppercase tracking-wider block font-bold">Código del Cupón de Caja</label>
                    <input
                      type="text"
                      placeholder="Ej: EFECTIVO5, CASH15..."
                      value={cashCodeVal}
                      onChange={(e) => setCashCodeVal(e.target.value)}
                      className="w-full bg-slate-950 border-2 border-black rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-rose-500 font-mono uppercase text-center"
                    />
                  </div>
                </div>
              )}

              {/* 5. PAY WITH BALANCE (SALDO) */}
              {paymentGateway === 'saldo' && (
                <div className="space-y-3.5 animate-fade-in bg-emerald-950/20 border-2 border-black p-4 rounded-2xl text-center">
                  <div className="flex justify-center items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] text-emerald-400 uppercase tracking-widest font-mono font-bold">DEBITAR DE MI SALDO DE BIEN ESTAR</span>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-xl border border-emerald-500/25">
                    <p className="text-xs text-slate-350 leading-relaxed">
                      Tienes un dinero cargado en tu billetera digital táctica que puedes utilizar inmediatamente para comprar este plan sin necesidad de escanear o transferir.
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4 my-3 text-left">
                      <div className="bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-500/10 text-center">
                        <span className="text-[9px] text-emerald-400 font-mono block uppercase">Mi Saldo Disponible</span>
                        <span className="text-lg font-black text-white font-mono">${userCashBalance.toFixed(2)}</span>
                      </div>
                      
                      <div className="bg-[#1f1616] p-2.5 rounded-xl border border-rose-500/10 text-center">
                        <span className="text-[9px] text-gray-400 font-mono block uppercase">Costo del Plan</span>
                        <span className="text-lg font-black text-rose-400 font-mono">
                          {getPlanDetails(showPaymentModal).price}
                        </span>
                      </div>
                    </div>

                    {userCashBalance >= getPlanDetails(showPaymentModal).amount ? (
                      <span className="text-xs text-emerald-400 font-mono font-bold flex items-center justify-center gap-1.5 mt-2 bg-emerald-500/5 px-2 py-1 rounded">
                        ✅ Saldo suficiente. Presiona "Confirmar Pago" abajo para activar.
                      </span>
                    ) : (
                      <span className="text-xs text-rose-400 font-mono font-bold flex items-center justify-center gap-1.5 mt-2 bg-rose-500/5 px-2 py-1 rounded animate-pulse">
                        ❌ Saldo insuficiente ({getPlanDetails(showPaymentModal).price}). Recárgalo en tu panel de Billetera.
                      </span>
                    )}
                  </div>
                </div>
              )}

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
                    Confirmar Pago de {getPlanDetails(showPaymentModal).price}
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

    </div>
  );
}
