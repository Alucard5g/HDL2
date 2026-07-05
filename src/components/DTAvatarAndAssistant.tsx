import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ChevronRight, X, ArrowRight, RefreshCw, Trophy, HelpCircle, Palette, Check, Settings2, Minimize2, Maximize2 } from 'lucide-react';
import { DTAvatarRenderer, AvatarConfig } from './DTAvatarRenderer';
import { ValeriaRenderer } from './ValeriaRenderer';

interface DTAvatarAndAssistantProps {
  isRegistered: boolean;
  userSubscription: string;
  currentConfig?: AvatarConfig;
  onSaveAvatarConfig: (config: AvatarConfig, newUsername?: string) => void;
  onTriggerFormaciónRecomendada?: (formation: string) => void;
  activeCountryName?: string;
  currentActiveMenuTab?: string; // Tab being viewed in App.tsx
  onChangeTab?: (tab: 'menu_hub' | 'album' | 'board' | 'leaderboard' | 'groups_fixture' | 'flutter' | 'subscription' | 'admin') => void;
  currentUsername?: string;
  isExpanded?: boolean;
  onToggleExpanded?: (expanded: boolean) => void;
  // Context adaptation properties passed from App.tsx
  coins?: number;
  score?: number;
  unlockedStickersCount?: number;
  activeFormation?: string;
}

const HAIR_OPTIONS = [
  { id: 'lacio', name: 'Lacio Anime', icon: '💇‍♂️' },
  { id: 'punta', name: 'De Punta Heroico', icon: '🔥' },
  { id: 'afro', name: 'Afro Voluminoso', icon: '🦁' },
  { id: 'militar', name: 'Corto Militar', icon: '🎖️' },
  { id: 'samurai', name: 'Moño Samurai', icon: '🎋' },
  { id: 'gorra', name: 'Gorra de Director', icon: 'Cap' }
];

const FACE_OPTIONS = [
  { id: 'concentrado', name: 'Concentrado Táctico', icon: '🧐' },
  { id: 'sonriente', name: 'Líder Sonriente', icon: '😎' },
  { id: 'heroico', name: 'Mirada Manga', icon: '👁️' },
  { id: 'determinado', name: 'Foco de Campeón', icon: '✊' },
  { id: 'lentes', name: 'Lentes Holográficos', icon: '👓' }
];

const JERSEY_OPTIONS = [
  { id: 'tricolor', name: 'Ecuador Tricolor', color: '#FDDF2B', label: '🇪🇨 TRICOLOR' },
  { id: 'crimson', name: 'Crimson Fury', color: '#e11d48', label: '🔥 CRIMSON' },
  { id: 'forest', name: 'Forest Shield', color: '#0f766e', label: '🌿 FOREST' },
  { id: 'shadow', name: 'Shadow Carbon', color: '#111827', label: '💀 SHADOW' },
  { id: 'hightech', name: 'Neon Cyber Blue', color: '#06b6d4', label: '⚡ CYBER' },
  { id: 'gold', name: 'Golden Champion', color: '#eab308', label: '🏆 GOLD' }
];

const ACCESSORY_OPTIONS = [
  { id: 'pizarra', name: 'Pizarra de Campo', icon: '📋', perk: '+2% precisión' },
  { id: 'silbato', name: 'Silbato de Oro', icon: '🪙', perk: 'Autoridad máxima' },
  { id: 'tablet', name: 'Tablet Táctica', icon: '📱', perk: 'Análisis IA' },
  { id: 'termo', name: 'Termo de Yerba', icon: '🧉', perk: 'Concentración (+5)' },
  { id: 'auriculares', name: 'Auriculares Radio', icon: '🎧', perk: 'Conexión cabina' }
];

// Complete menu-by-menu dialogue database for SophIA the Tactical Assistant
const TAB_EXPLANATIONS: { [key: string]: { text: string; state: 'explaining' | 'happy' | 'excited' | 'thinking'; badge: string } } = {
  menu_hub: {
    text: "¡Bienvenido a tu Centro de Control Táctico, DT! Desde aquí puedes acceder al álbum de cromos, pronosticar el fixture, armar tu alineación en la pizarra táctica, competir en las Ligas de Honor y adquirir paquetes de selección.",
    state: "happy",
    badge: "CENTRO DE CONTROL"
  },
  album: {
    text: "¡Este es tu Álbum Oficial de Cromos! Aquí coleccionas las plantillas de 26 jugadores por país. Responde las trivias para ganar puntos, desbloquea cromos y sube el nivel de tus plantillas para ser un estratega legendario.",
    state: "explaining",
    badge: "ÁLBUM DE CROMOS"
  },
  board: {
    text: "¡La Pizarra Táctica interactiva, DT! Arma tu 11 titular arrastrando tus cromos desbloqueados. ¿Te faltan tus cracks favoritos? ¡Te recomiendo comprar cromos digitales en la Tienda! Cada compra no solo completa tu equipo de inmediato, sino que te otorga fabulosos puntos de bonificación que te harán subir rápido en el Ranking de DT y asegurar los espectaculares premios de $1.000 USD, $500 USD o $250 USD.",
    state: "excited",
    badge: "PIZARRA TÁCTICA"
  },
  leaderboard: {
    text: "¡Ligas de Honor en tiempo real! Aquí mides tu precisión táctica y conocimientos contra directores técnicos de todo el mundo. Los puestos más altos ganarán el Álbum de Lujo impreso y premios oficiales de la Copa.",
    state: "thinking",
    badge: "LIGAS DE HONOR"
  },
  groups_fixture: {
    text: "¡Calendario de Grupos y Simulador de Pronósticos! Registra tus pronósticos exactos para cada partido antes de que suene el silbato inicial. ¡Adivinar el marcador te otorgará increíbles bonus de puntaje!",
    state: "happy",
    badge: "FIXTURE & PRONÓSTICOS"
  },
  subscription: {
    text: "¡Tienda de Cromos y Paquetes de Selección! Desbloquea países con el Sobre Nacional ($5) o continentes enteros con el Pase Regional ($15) en Pago Único sin suscripciones recurrentes. ¡El 5% de cada compra va destinado a nuestra fundación aliada!",
    state: "excited",
    badge: "TIENDA SOLIDARIA"
  },
  admin: {
    text: "¡Panel de Administración Central! Aquí auditas los sorteos de fe pública, gestionas códigos de licencia notariados y supervisas las transacciones del sistema.",
    state: "thinking",
    badge: "SISTEMA CENTRAL"
  },
  flutter: {
    text: "Aquí se encuentra la documentación oficial para la integración del SDK móvil de alto rendimiento.",
    state: "explaining",
    badge: "DOCS SDK"
  }
};

const GENERAL_GUIDE_STEPS = [
  {
    text: "¡Hola, DT! Soy SophIA, tu Asistente de Campo. ¡Bienvenido al cuartel general táctico! Tu misión es coleccionar cromos, superar trivias de fútbol y armar alineaciones perfectas para liderar el ranking mundial.",
    state: "happy",
    badge: "INICIO"
  },
  {
    text: "En el menú 'Álbum', cada país tiene 26 cromos que desbloqueas respondiendo trivias y acumulando puntos para abrir tus sobres.",
    state: "explaining",
    badge: "ÁLBUM"
  },
  {
    text: "En la 'Pizarra Táctica' diseñas tu once inicial. Si colocas jugadores que coinciden con la alineación titular oficial del partido real, ¡sumas muchos puntos extra de precisión!",
    state: "excited",
    badge: "TÁCTICA"
  },
  {
    text: "Ingresa al 'Fixture' y pronostica el marcador de cada partido. El juego es 100% gratuito y de pura habilidad. ¡El ranking general de Directores Técnicos otorga grandes premios físicos como camisetas firmadas y el álbum impreso de lujo!",
    state: "thinking",
    badge: "PREMIOS"
  },
  {
    text: "En la 'Tienda', puedes adquirir cromos de Pago Único (sin suscripciones recurrentes) para completar tu álbum más rápido. Además, el 5% de cada compra apoya directamente a fundaciones locales.",
    state: "excited",
    badge: "IMPACTO SOCIAL"
  }
];

export const DTAvatarAndAssistant: React.FC<DTAvatarAndAssistantProps> = ({
  isRegistered,
  userSubscription,
  currentConfig,
  onSaveAvatarConfig,
  onTriggerFormaciónRecomendada,
  activeCountryName = 'Ecuador',
  currentActiveMenuTab = 'menu_hub',
  onChangeTab,
  currentUsername = 'Invitado (Director Técnico)',
  isExpanded,
  onToggleExpanded,
  coins = 350,
  score = 0,
  unlockedStickersCount = 0,
  activeFormation = '4-3-3'
}) => {
  // Config state
  const [avatar, setAvatar] = useState<AvatarConfig>(() => {
    if (currentConfig && currentConfig.hair) return currentConfig;
    try {
      const saved = localStorage.getItem('dt_avatar_custom_config');
      return saved ? JSON.parse(saved) : {
        hair: 'punta',
        face: 'determinado',
        jersey: 'tricolor',
        accessory: 'pizarra'
      };
    } catch {
      return {
        hair: 'punta',
        face: 'determinado',
        jersey: 'tricolor',
        accessory: 'pizarra'
      };
    }
  });

  const [activeTab, setActiveTab] = useState<'asistente' | 'avatar'>('asistente');
  const [generalStep, setGeneralStep] = useState<number>(0);
  const [showBubble, setShowBubble] = useState<boolean>(true);
  const [localIsCompanionExpanded, setLocalIsCompanionExpanded] = useState<boolean>(false);
  const isCompanionExpanded = isExpanded !== undefined ? isExpanded : localIsCompanionExpanded;
  const setIsCompanionExpanded = onToggleExpanded ? onToggleExpanded : setLocalIsCompanionExpanded;
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  
  // State for editing username / DT name
  const [editUsername, setEditUsername] = useState<string>(() => {
    return currentUsername || localStorage.getItem('dt_username') || 'Invitado (Director Técnico)';
  });

  useEffect(() => {
    if (currentUsername) {
      setEditUsername(currentUsername);
    }
  }, [currentUsername]);

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

  useEffect(() => {
    const defaultVal = { hair: 'punta', face: 'determinado', jersey: 'tricolor', accessory: 'pizarra', avatarType: 'vector', uploadedPhoto: '' };
    const compareTo = currentConfig && currentConfig.hair ? currentConfig : defaultVal;
    const isAvatarChanged = (
      avatar.hair !== compareTo.hair ||
      avatar.face !== compareTo.face ||
      avatar.jersey !== compareTo.jersey ||
      avatar.accessory !== compareTo.accessory ||
      avatar.avatarType !== compareTo.avatarType ||
      avatar.uploadedPhoto !== compareTo.uploadedPhoto
    );
    const isNameChanged = editUsername.trim() !== currentUsername.trim();
    setHasUnsavedChanges(isAvatarChanged || isNameChanged);
  }, [avatar, editUsername, currentConfig, currentUsername]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setAvatar(prev => ({
          ...prev,
          avatarType: 'photo',
          uploadedPhoto: base64String
        }));
        setSaveSuccess(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOptionChange = (key: keyof AvatarConfig, value: string) => {
    const updated = { ...avatar, [key]: value };
    setAvatar(updated);
    setSaveSuccess(false);
  };

  const handleSave = () => {
    localStorage.setItem('dt_avatar_custom_config', JSON.stringify(avatar));
    const trimmedName = editUsername.trim();
    if (trimmedName) {
      onSaveAvatarConfig(avatar, trimmedName);
    } else {
      onSaveAvatarConfig(avatar);
    }
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 4000);
  };

  const getJerseyDetails = () => {
    return JERSEY_OPTIONS.find(j => j.id === avatar.jersey) || JERSEY_OPTIONS[0];
  };

  // Get active dialogue depending on context
  const isMenuHub = currentActiveMenuTab === 'menu_hub';
  const tabExplanation = TAB_EXPLANATIONS[currentActiveMenuTab] || TAB_EXPLANATIONS.menu_hub;

  const currentDialogueText = isMenuHub 
    ? GENERAL_GUIDE_STEPS[generalStep].text 
    : tabExplanation.text;

  const currentDialogueState = isMenuHub 
    ? GENERAL_GUIDE_STEPS[generalStep].state 
    : tabExplanation.state;

  const activeDialogueState = currentDialogueState as "normal" | "thinking" | "excited" | "tactical" | "happy";

  const currentDialogueBadge = isMenuHub 
    ? GENERAL_GUIDE_STEPS[generalStep].badge 
    : tabExplanation.badge;

  const handleNextGeneralStep = () => {
    if (generalStep < GENERAL_GUIDE_STEPS.length - 1) {
      setGeneralStep(prev => prev + 1);
    } else {
      setShowBubble(false);
    }
  };

  const handleResetGeneralGuide = () => {
    setGeneralStep(0);
    setShowBubble(true);
    setActiveTab('asistente');
  };



  // Render Core content for DT Avatar configuration
  const renderAvatarCreator = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Visual rendering canvas of DT */}
        <div className="md:col-span-5 flex flex-col items-center justify-center bg-slate-950/60 rounded-2xl border-2 border-black p-5 relative shadow-inner">
          <div className="absolute top-2 left-2 bg-slate-900 text-rose-500 text-[8px] font-mono px-2 py-0.5 border border-black rounded-md uppercase font-bold tracking-widest opacity-60">
            DT_RENDER_SYS_V2
          </div>

          {/* Vector SVG Avatar */}
          <div className="mb-4">
            <DTAvatarRenderer config={avatar} size={140} glow={true} />
          </div>

          {/* Saved configuration status indicator */}
          <div className="text-center space-y-1 mt-2">
            {saveSuccess ? (
              <span className="bg-[#10b981]/20 text-[#10b981] border border-[#10b981] px-2.5 py-0.5 text-[8.5px] font-mono rounded-full uppercase font-black animate-pulse block">
                ✓ Sincronizado en BD
              </span>
            ) : hasUnsavedChanges ? (
              <span className="bg-amber-950 text-amber-400 border border-amber-900 px-2.5 py-0.5 text-[8.5px] font-mono rounded-full uppercase font-black block">
                ⚠️ Cambios sin Guardar
              </span>
            ) : (
              <span className="bg-emerald-950 text-emerald-400 border border-emerald-900 px-2.5 py-0.5 text-[8.5px] font-mono rounded-full uppercase font-black block">
                ✓ Guardado en BD
              </span>
            )}
            <p className="text-[10.5px] text-slate-300 font-bold uppercase tracking-wide">
              Estilo: {HAIR_OPTIONS.find(h => h.id === avatar.hair)?.name}
            </p>
            <p className="text-[9.5px] text-[#22c55e] font-mono">
              Beneficio: {ACCESSORY_OPTIONS.find(a => a.id === avatar.accessory)?.perk}
            </p>
          </div>
        </div>

        {/* Interactive controls */}
        <div className="md:col-span-7 space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
          {/* Nombre de DT para las Ligas de Honor */}
          <div className="bg-slate-900/60 p-2.5 border border-slate-800 rounded-xl space-y-1">
            <span className="text-[9.5px] font-mono font-black uppercase text-yellow-400 block">👤 NOMBRE DEL DIRECTOR TÉCNICO (D.T.)</span>
            <input
              type="text"
              value={editUsername}
              onChange={(e) => {
                setEditUsername(e.target.value);
                setSaveSuccess(false);
              }}
              maxLength={25}
              placeholder="Ingresa tu nombre de D.T."
              className="w-full bg-slate-950 border-2 border-black rounded-xl px-3 py-1.5 text-xs text-white font-sans font-bold focus:outline-none focus:border-rose-500 placeholder:text-slate-600 shadow-[2px_2px_0px_rgba(0,0,0,0.5)]"
            />
            <p className="text-[8.5px] text-slate-400 font-sans leading-tight">
              Sincroniza tu nombre oficial para competir en la <strong>Liga de Honor</strong>.
            </p>
          </div>

          {/* Selector de Tipo de Avatar */}
          <div className="bg-slate-900/60 p-2 border border-slate-800 rounded-xl space-y-1">
            <span className="text-[9.5px] font-mono font-black uppercase text-yellow-400 block">🎭 TIPO DE AVATAR</span>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setAvatar(prev => ({ ...prev, avatarType: 'vector' }));
                  setSaveSuccess(false);
                }}
                className={`py-1.5 px-2 text-[9px] font-sans font-black uppercase rounded-lg border-2 border-black transition-all cursor-pointer text-center ${
                  (avatar.avatarType || 'vector') === 'vector'
                    ? 'bg-rose-600 text-white shadow-[2px_2px_0px_#000]'
                    : 'bg-slate-950 text-slate-400 hover:bg-slate-900'
                }`}
              >
                🤖 Avatar Digital Vector
              </button>
              <button
                type="button"
                onClick={() => {
                  setAvatar(prev => ({ ...prev, avatarType: 'photo' }));
                  setSaveSuccess(false);
                }}
                className={`py-1.5 px-2 text-[9px] font-sans font-black uppercase rounded-lg border-2 border-black transition-all cursor-pointer text-center ${
                  avatar.avatarType === 'photo'
                    ? 'bg-rose-600 text-white shadow-[2px_2px_0px_#000]'
                    : 'bg-slate-950 text-slate-400 hover:bg-slate-900'
                }`}
              >
                📸 Subir Foto Personal
              </button>
            </div>
          </div>

          {(avatar.avatarType || 'vector') === 'vector' ? (
            <>
              {/* Cabello */}
              <div className="space-y-1">
                <span className="text-[9.5px] font-mono font-black uppercase text-slate-400">🧑‍🦰 Estilo de Peinado</span>
                <div className="grid grid-cols-3 gap-1">
                  {HAIR_OPTIONS.map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => handleOptionChange('hair', opt.id)}
                      className={`px-1.5 py-1 text-[9px] font-bold border-2 border-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 ${
                        avatar.hair === opt.id ? 'bg-emerald-500 text-black shadow-[2px_2px_0px_#000]' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span>{opt.icon}</span>
                      <span className="truncate">{opt.name.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Rostro */}
              <div className="space-y-1">
                <span className="text-[9.5px] font-mono font-black uppercase text-slate-400">👁️ Expresión del Rostro</span>
                <div className="grid grid-cols-3 gap-1">
                  {FACE_OPTIONS.map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => handleOptionChange('face', opt.id)}
                      className={`px-1.5 py-1 text-[9px] font-bold border-2 border-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 ${
                        avatar.face === opt.id ? 'bg-emerald-500 text-black shadow-[2px_2px_0px_#000]' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span>{opt.icon}</span>
                      <span className="truncate">{opt.name.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Jersey */}
              <div className="space-y-1">
                <span className="text-[9.5px] font-mono font-black uppercase text-slate-400">👕 Uniforme del Director</span>
                <div className="grid grid-cols-3 gap-1">
                  {JERSEY_OPTIONS.map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => handleOptionChange('jersey', opt.id)}
                      className={`px-1.5 py-1 text-[9px] font-bold border-2 border-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        avatar.jersey === opt.id ? 'bg-emerald-500 text-black shadow-[2px_2px_0px_#000]' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full border border-black inline-block" style={{ backgroundColor: opt.color }} />
                      <span className="truncate">{opt.name.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-slate-900/50 p-3 border border-slate-800 rounded-xl space-y-2.5">
              <span className="text-[10px] font-mono font-black uppercase text-[#11b782] block text-center">📸 CARGAR FOTO REAL DE DT</span>
              <p className="text-[10px] text-slate-300 leading-snug text-center">
                ¡Conviértete en un Héroe del Deporte real! Tu foto se procesará localmente y se guardará en la base de datos de tu perfil.
              </p>
              
              <label className="block w-full py-4 bg-slate-950 hover:bg-slate-900/80 border-2 border-dashed border-[#11b782]/40 rounded-xl cursor-pointer transition-all relative text-center">
                <span className="text-[10px] font-sans font-black text-emerald-400 uppercase tracking-wider flex items-center justify-center gap-1.5">
                  📁 {avatar.uploadedPhoto ? '🔄 Reemplazar Foto Cargada' : '➕ Elegir Imagen desde Dispositivo'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>

              {avatar.uploadedPhoto ? (
                <div className="bg-slate-950 p-2 rounded-lg flex items-center justify-between border border-emerald-900/40">
                  <span className="text-[9px] text-emerald-400 font-mono flex items-center gap-1">
                    🟢 FOTO LISTA PARA GUARDAR
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setAvatar(prev => ({ ...prev, uploadedPhoto: undefined, avatarType: 'vector' }));
                      setSaveSuccess(false);
                    }}
                    className="text-[9.5px] text-rose-500 font-bold hover:underline cursor-pointer"
                  >
                    Eliminar
                  </button>
                </div>
              ) : (
                <div className="text-[9px] text-slate-400 italic text-center">
                  Soporta formatos JPG, PNG o WebP de hasta 5MB.
                </div>
              )}
            </div>
          )}

          {/* Accesorio */}
          <div className="space-y-1">
            <span className="text-[9.5px] font-mono font-black uppercase text-slate-400">🎒 Accesorio Táctico</span>
            <div className="grid grid-cols-3 gap-1">
              {ACCESSORY_OPTIONS.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => handleOptionChange('accessory', opt.id)}
                  className={`px-1.5 py-1 text-[9px] font-bold border-2 border-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 ${
                    avatar.accessory === opt.id ? 'bg-rose-600 text-white shadow-[2px_2px_0px_#000]' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span>{opt.icon}</span>
                  <span className="truncate">{opt.name.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="pt-2 border-t border-slate-900/40">
        <button
          onClick={handleSave}
          className={`w-full py-3.5 px-4 rounded-2xl border-[3px] border-black font-sans font-black text-xs uppercase tracking-wider text-center transition-all cursor-pointer shadow-[3.5px_3.5px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)] ${
            saveSuccess 
              ? 'bg-[#10b981] text-black' 
              : hasUnsavedChanges 
                ? 'bg-yellow-400 text-black hover:bg-yellow-300 animate-pulse' 
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          {saveSuccess 
            ? '✓ ¡AVATAR GUARDADO Y CONFIRMADO EN EL SERVIDOR!' 
            : hasUnsavedChanges 
              ? '💾 GUARDAR ESTILO EN MI BASE DE DATOS' 
              : '💾 AVATAR CONFIRMADO EN LA BASE DE DATOS'}
        </button>
      </div>
    </div>
  );

  // IF RENDERING ON COMPANION SIDEBAR / CORNER OF FLOATING SCREEN (Active on other tabs)
  if (!isMenuHub) {
    return (
      <>
        {/* Floating trigger button removed to avoid bottom-right obstruction. Toggled from header now. */}

        {/* Collapsible Tactical Panel floating dialog */}
        <AnimatePresence>
          {isCompanionExpanded && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              className="fixed bottom-16 right-4 sm:bottom-6 sm:right-6 z-[110] w-[92vw] sm:w-[420px] bg-[#0b1411] border-4 border-black rounded-3xl p-4.5 shadow-[8px_8px_0px_rgba(0,0,0,1)] overflow-hidden font-sans"
            >
              {/* Glossy radial graphics */}
              <div className="absolute inset-0 pointer-events-none bg-radial-gradient opacity-[0.03] bg-white mix-blend-overlay" />
              
              {/* Header */}
              <div className="flex items-center justify-between border-b-2 border-black pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <span className="bg-[#10b981] text-black text-[9px] font-black uppercase px-2 py-0.5 rounded border border-black rotate-[-1deg]">
                    🕵️ ASISTENCIA TÁCTICA
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">VALERIA AI</span>
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setActiveTab(activeTab === 'asistente' ? 'avatar' : 'asistente')}
                    className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-black rounded-lg text-slate-300 hover:text-white transition-all text-[10px]"
                    title="Configurar tu Avatar de DT"
                  >
                    {activeTab === 'asistente' ? '🥋 Ajustar DT' : '📋 Ver Consejos'}
                  </button>
                  <button
                    onClick={() => setIsCompanionExpanded(false)}
                    className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-black rounded-lg text-rose-500 hover:text-rose-400 transition-all"
                  >
                    <Minimize2 size={12} className="stroke-[3]" />
                  </button>
                </div>
              </div>

              {activeTab === 'asistente' ? (
                <div className="space-y-3.5 max-h-[480px] overflow-y-auto pr-0.5">
                  {/* Dialog bubble */}
                  <div className="flex gap-3 items-center">
                    <ValeriaRenderer size={70} state={activeDialogueState} />
                    <div className="flex-1 bg-white border-2 border-black rounded-xl p-3 shadow-[2.5px_2.5px_0px_#000] relative">
                      <div className="absolute top-1/2 -left-2.5 -translate-y-1/2 w-0 h-0 border-t-[5px] border-t-transparent border-r-[5px] border-r-black border-b-[5px] border-b-transparent" />
                      <span className="text-[7.5px] font-black text-emerald-600 font-mono tracking-widest uppercase block mb-0.5">
                        {currentDialogueBadge}
                      </span>
                      <p className="text-[10px] font-sans font-bold text-black leading-tight">
                        "{currentDialogueText}"
                      </p>
                    </div>
                  </div>

                  {/* Actions depending on menu */}
                  {currentActiveMenuTab === 'board' && (
                    <div className="space-y-2">
                      {onTriggerFormaciónRecomendada && (
                        <button
                          onClick={() => {
                            onTriggerFormaciónRecomendada('4-3-3');
                            setIsCompanionExpanded(false);
                          }}
                          className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-black text-[10px] font-black uppercase rounded-xl border-2 border-black transition-all shadow-[2.5px_2.5px_0px_#000] cursor-pointer"
                        >
                          ⚡ RECOMENDAR FORMACIÓN REAL OFICIAL (4-3-3)
                        </button>
                      )}
                      
                      <div className="bg-slate-950 border border-[#22c55e]/30 rounded-xl p-2.5 text-[10.5px] leading-snug text-slate-300 font-sans space-y-2 shadow-inner text-left">
                        <p className="font-extrabold text-[#11b782] flex items-center gap-1 text-[11px] uppercase tracking-wide">
                          💎 ¡Estrategia de SophIA para Ganar!
                        </p>
                        <p className="text-[10px] text-slate-350">
                          Al adquirir <strong>cromos digitales oficiales</strong> completas tu plantilla de inmediato, lo que te otorga <strong>puntos masivos de bonificación de patrocinio</strong> para escalar en el Ranking General de DT y asegurar los premios en efectivo.
                        </p>
                        {onChangeTab && (
                          <button
                            onClick={() => {
                              onChangeTab('subscription');
                              setIsCompanionExpanded(false);
                            }}
                            className="w-full py-2 bg-[#FDDF2B] hover:bg-yellow-400 text-black font-sans font-black text-[9px] uppercase rounded-lg border border-black transition-all cursor-pointer shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)] text-center block"
                          >
                            🛒 IR A COMPRAR CROMOS DIGITALES 🚀
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="text-[9px] text-slate-500 text-center font-mono leading-none">
                    SophIA te asiste automáticamente en cada menú.
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {renderAvatarCreator()}
                  <button
                    onClick={() => {
                      handleSave();
                      setActiveTab('asistente');
                    }}
                    className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border-2 border-black font-sans font-black text-[10px] uppercase rounded-xl transition-all cursor-pointer"
                  >
                    Regresar a Consejos de SophIA 📋
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }

  // STANDARD EXPANDED RENDER FOR THE MAIN MENU HUB SIDEBAR
  return (
    <div id="avatar-assistant-module" className="bg-[#0b1411] border-[3.5px] border-black rounded-3xl p-5 relative shadow-[6px_6px_0px_#000] overflow-hidden">
      {/* Matte Graphic Novel Overlays */}
      <div className="absolute inset-0 pointer-events-none bg-radial-gradient opacity-[0.03] bg-white mix-blend-overlay"></div>
      <div className="absolute -top-16 -right-16 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full"></div>
      <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-rose-500/10 blur-3xl rounded-full"></div>

      {/* Header Tabs */}
      <div className="flex items-center justify-between border-b-4 border-black pb-4 mb-4">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('asistente')}
            className={`px-3.5 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-xl border-2 border-black transition-all cursor-pointer ${
              activeTab === 'asistente'
                ? 'bg-[#11b782] text-black shadow-[3px_3px_0px_#000]'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            📋 TÁCTICA SOPHIA
          </button>
          <button
            onClick={() => setActiveTab('avatar')}
            className={`px-3.5 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-xl border-2 border-black transition-all cursor-pointer ${
              activeTab === 'avatar'
                ? 'bg-rose-600 text-white shadow-[3px_3px_0px_#000]'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            🥋 AVATAR CREADOR
          </button>
        </div>

        <span className="font-mono text-[9px] text-slate-500 uppercase tracking-widest hidden sm:inline opacity-30 select-none">
          SYS_AUDIT: ENGAGE_SOPHIA_V2
        </span>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'asistente' ? (
          <motion.div
            key="asistente-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {showBubble ? (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                {/* Premium Animated Valeria Vector */}
                <div className="md:col-span-3 flex justify-center shrink-0">
                  <div className="relative group">
                    <ValeriaRenderer size={84} state={activeDialogueState} />
                    <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#11b782] rounded-full animate-ping" />
                    <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#11b782] rounded-full border border-black" />
                  </div>
                </div>

                {/* Comic Speech Dialogue Bubble */}
                <div className="md:col-span-9 space-y-3">
                  <div className="relative bg-white border-4 border-black rounded-2xl p-4 shadow-[4px_4px_0px_#000]">
                    <div className="hidden md:block absolute top-1/2 -left-3.5 -mt-2 w-0 h-0 border-t-[8px] border-t-transparent border-r-[8px] border-r-black border-b-[8px] border-b-transparent"></div>
                    
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="bg-[#11b782] text-black text-[9px] font-black uppercase px-2 py-0.5 rounded border border-black">
                        SophIA - Asistente de Campo
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        Paso {generalStep + 1} de {GENERAL_GUIDE_STEPS.length}
                      </span>
                    </div>

                    <p className="text-xs text-black font-sans font-bold leading-relaxed">
                      "{currentDialogueText}"
                    </p>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    <button
                      onClick={() => setShowBubble(false)}
                      className="px-2 py-1 text-slate-400 hover:text-white text-[10px] uppercase font-black tracking-wider transition-all cursor-pointer"
                    >
                      Omitir Introducción
                    </button>

                    <button
                      onClick={handleNextGeneralStep}
                      className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-black uppercase tracking-wider rounded-xl border-2 border-black transition-all shadow-[3px_3px_0px_#000] flex items-center gap-1.5 cursor-pointer"
                    >
                      Siguiente
                      <ArrowRight size={12} className="stroke-[3]" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-950/80 border-2 border-dashed border-slate-800 rounded-2xl p-4 text-center flex flex-wrap items-center justify-between gap-3">
                <div className="text-left">
                  <p className="text-xs text-slate-200 font-extrabold uppercase">Guía de Campo de SophIA</p>
                  <p className="text-[10.5px] text-slate-400 font-medium">Revisa los tutoriales de bienvenida en cualquier momento.</p>
                </div>
                <button
                  onClick={handleResetGeneralGuide}
                  className="px-3.5 py-1.5 bg-[#11b782] hover:bg-emerald-500 text-black text-[9.5px] font-black uppercase rounded-xl border-2 border-black shadow-[2px_2px_0px_#000] cursor-pointer inline-flex items-center gap-1"
                >
                  <RefreshCw size={11} className="animate-spin-slow" />
                  Reiniciar Guía
                </button>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="avatar-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {renderAvatarCreator()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
