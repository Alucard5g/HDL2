import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Play, Zap, Shield, Flame, ChevronLeft, ChevronRight, Volume2, Award, RotateCcw } from 'lucide-react';
import { Player } from '../types';

interface DigitalStickerCardProps {
  player: Player;
  idx: number;
  slant: string;
  onGenerateImage?: (player: Player) => void;
  isGenerating?: boolean;
  onPasteImageUrl?: (player: Player, url: string) => void;
}

interface ComicPanel {
  title: string;
  comicLabel: string;
  narrative: string;
  soundEffect: string;
  soundColor: string;
  iconType: 'prep' | 'action' | 'climax';
}

export const DigitalStickerCard: React.FC<DigitalStickerCardProps> = ({ player, idx, slant, onGenerateImage, isGenerating, onPasteImageUrl }) => {
  const [isPlayingAction, setIsPlayingAction] = useState(false);
  const [currentPanelIndex, setCurrentPanelIndex] = useState(0);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkValue, setLinkValue] = useState("");
  const [imageLoadError, setImageLoadError] = useState(false);
  const [isImgLoaded, setIsImgLoaded] = useState(false);
  const imgRef = React.useRef<HTMLImageElement>(null);

  useEffect(() => {
    setImageLoadError(false);
    if (imgRef.current && imgRef.current.complete) {
      setIsImgLoaded(true);
    } else {
      setIsImgLoaded(false);
    }
  }, [player.imageUrl]);
  
  const isElite = player.rating >= 90;
  const isKey = player.rating >= 80 && player.rating < 90;

  // Reset panel on action play
  const triggerActionPlay = () => {
    setCurrentPanelIndex(0);
    setIsPlayingAction(true);
  };
  
  // High-fidelity comic colors scheme
  const cardBorder = isElite 
    ? 'border-[4.5px] border-black bg-[#FDDF2B] text-black shadow-[6px_6px_0px_#000]' 
    : isKey 
      ? 'border-[4.5px] border-black bg-white text-black shadow-[6px_6px_0px_#10B981]' 
      : 'border-[4.5px] border-black bg-white text-black shadow-[6px_6px_0px_#EF4444]';

  const badgeColor = player.position === 'GK'
    ? 'bg-blue-600'
    : player.position === 'DF'
      ? 'bg-emerald-600'
      : player.position === 'MF'
        ? 'bg-amber-500'
        : 'bg-rose-600';

  // Splash words
  const bubbleBadge = player.position === 'GK' 
    ? '¡ZAP!' 
    : player.position === 'DF' 
      ? '¡POW!' 
      : player.position === 'MF' 
        ? '¡BOOM!' 
        : '¡GOLAZO!';

  // Whether this country has images of active players (Only Argentina & Ecuador) or if a custom generation exists
  const hasImageEnabled = player.country === 'Argentina' || player.country === 'Ecuador' || !!player.imageUrl;

  // Extract nickname & descriptive title or fallback
  const apodo = player.nickname || player.name || 'Héroe del Campo';
  const descriptiveTitle = player.descriptiveTitle || `Crac de ${player.country}`;
  const shirtNum = player.shirtNumber || ((idx % 23) + 2);

  // Generate the robust comic play stages considering internet real tactics
  const getComicPanels = (p: Player): ComicPanel[] => {
    const isMessi = p.nickname === 'La Pulga' || p.realName === 'L. Messi';
    const isDibu = p.nickname === 'El Dibu' || p.realName === 'E. Martínez';
    const isSuperman = p.nickname === 'Superman' || p.realName === 'Enner Valencia';
    const isMoi = p.nickname === 'El Niño Moi' || p.realName === 'Moises Caicedo';
    const isLaJoya = p.nickname === 'La Joya Páez' || p.realName === 'Kendry Paez';
    const isPervis = p.nickname === 'La Locomotora' || p.realName === 'Pervis Estupinan';
    const isPacho = p.nickname === 'El Muro Pacho' || p.realName === 'Willian Pacho';
    const isMinda = p.nickname === 'La Bala Minda' || p.realName === 'Alan Minda';

    if (isMessi) {
      return [
        {
          title: "Ⅰ. ANÁLISIS DE LA BARRERA",
          comicLabel: "PERSPECTIVA LEYENDA",
          narrative: "La Pulga acomoda meticulosamente la de gajos a unos 25 metros. En un silencio sepulcral, analiza la posición de la barrera contraria e inventa en milésimas una curva ingrávida.",
          soundEffect: "¡FIIIU...!",
          soundColor: "text-blue-450 bg-blue-950/40 border-blue-500",
          iconType: "prep"
        },
        {
          title: "Ⅱ. IMPACTO DE LEYENDA",
          comicLabel: "ROSCA EXTRAORDINARIA",
          narrative: "¡ZURDAZO DE ORO! Messi impacta el esférico con un giro pronunciado en el tobillo. La barrera salta pero la física cede ante la rosca del Astro que viaja con velocidad de crucero.",
          soundEffect: "¡CRACK!",
          soundColor: "text-yellow-400 bg-yellow-950/40 border-yellow-500",
          iconType: "action"
        },
        {
          title: "Ⅲ. EL GOL DE LA HISTORIA",
          comicLabel: "DYNAMITA EN EL ÁNGULO",
          narrative: "¡INATRAVABLE! La bola besa el cordel en la mismísima escuadra izquierda. La afición explota con un clamor ensordecedor y la red se sacude con violencia dramática.",
          soundEffect: "¡GOLAZO!",
          soundColor: "text-red-500 bg-red-950/40 border-red-500",
          iconType: "climax"
        }
      ];
    }

    if (isDibu) {
      return [
        {
          title: "Ⅰ. GUERRA PSICOLÓGICA",
          comicLabel: "DESAFÍO AL DELANTERO",
          narrative: "El ariete acomoda para el fusilamiento. Dibu Martínez gesticula con picardía, moviendo los brazos en cruz y acorralando mentalmente la seguridad de su contendor.",
          soundEffect: "¡SANGRE-FRÍA!",
          soundColor: "text-purple-400 bg-purple-950/40 border-purple-500",
          iconType: "prep"
        },
        {
          title: "Ⅱ. EL EMBATE COHETE",
          comicLabel: "REFLEJO INMEDIATO",
          narrative: "El atacante suelta un bombazo potente pegado a la base del metal izquierdo. Con reflejo digno de un héroe de cómic, el Dibu vuela cuan largo es en décimas de segundo.",
          soundEffect: "¡POW!",
          soundColor: "text-cyan-400 bg-cyan-950/40 border-cyan-500",
          iconType: "action"
        },
        {
          title: "Ⅲ. LA CELEBRACIÓN ICÓNICA",
          comicLabel: "CANDADO DE ACERO",
          narrative: "Usa la yema de sus guantes de titanio para empujar el remate rozando el paral izquierdo. Se reincorpora de golpe y ejecuta sus icónicos pasos con irreverencia de campeón.",
          soundEffect: "¡NO-PASAS!",
          soundColor: "text-emerald-450 bg-emerald-950/40 border-emerald-500",
          iconType: "climax"
        }
      ];
    }

    if (isSuperman) {
      return [
        {
          title: "Ⅰ. HUNDIMIENTO EN ZAGA",
          comicLabel: "RADAR ENCENDIDO",
          narrative: "Un tiro libre medido viaja flotante desde el extremo. Enner Valencia camina a espaldas del zaguero central con el instinto goleador completamente desatado.",
          soundEffect: "¡TRACK!",
          soundColor: "text-orange-400 bg-orange-950/30 border-orange-500",
          iconType: "prep"
        },
        {
          title: "Ⅱ. RETANDO A GRAVEDAD",
          comicLabel: "POTENCIA DE IMPULSO",
          narrative: "¡DESPEGUE SÓNICO! Superman dobla rodillas y se eleva a una altura sobrehumana, suspendido en el aire mientras los zagueros intentan inútilmente obstaculizarlo.",
          soundEffect: "¡ZAS!",
          soundColor: "text-red-400 bg-red-950/30 border-red-500",
          iconType: "action"
        },
        {
          title: "Ⅲ. EL FRENTAZO SUPREMO",
          comicLabel: "FUEGO EN LA RED",
          narrative: "Impacto seco con la frenta que manda el cuero picado a ras de césped. El portero vuela sin tocarla y Ecuador celebra un grito de gol colosal.",
          soundEffect: "¡GOL!",
          soundColor: "text-yellow-400 bg-yellow-950/30 border-yellow-500",
          iconType: "climax"
        }
      ];
    }

    if (isMoi) {
      return [
        {
          title: "Ⅰ. PATRULLAJE SIN CESAR",
          comicLabel: "INTERCEPTOR ACTIVO",
          narrative: "Moisés Caicedo rastrea las venas creativas del rival. Con lectura posicional premium, acorta distancia en diagonal al ver la aproximación adversaria.",
          soundEffect: "¡FIIIU!",
          soundColor: "text-sky-400 bg-sky-950/30 border-sky-500",
          iconType: "prep"
        },
        {
          title: "Ⅱ. LA BARRIDA DE ACERO",
          comicLabel: "DESARME CRÍTICO",
          narrative: "¡ENTRADA IMPLACABLE! Caicedo se barre lateralmente de manera quirúrgica y retiene la pelota con firmeza colosal, dejando al rival revolcarse en el césped.",
          soundEffect: "¡POW!",
          soundColor: "text-yellow-400 bg-yellow-950/30 border-yellow-500",
          iconType: "action"
        },
        {
          title: "Ⅲ. TRANSICIÓN EXQUISITA",
          comicLabel: "DESCARGA LETAL",
          narrative: "De pie al instante, descarga de tres dedos un pase de ruptura que lanza al tridente ofensivo directo a portería contraria.",
          soundEffect: "¡ASIST!",
          soundColor: "text-emerald-450 bg-emerald-950/30 border-emerald-500",
          iconType: "climax"
        }
      ];
    }

    if (isLaJoya) {
      return [
        {
          title: "Ⅰ. CONTROL Y RETO",
          comicLabel: "BALDOSA MÁGICA",
          narrative: "Kendry Páez recibe el balón orillado al sector derecho de la zaga. Dos volantes de corte le cierran de forma agresiva para desarmarlo.",
          soundEffect: "¡CHECK!",
          soundColor: "text-pink-400 bg-pink-950/30 border-pink-500",
          iconType: "prep"
        },
        {
          title: "Ⅱ. EL AMAGUE DE HECHIZO",
          comicLabel: "FINTA SÓNICA",
          narrative: "Con sutil toque de taco, la Joya simula enganchar por fuera, frena y sale con quiebre de cintura majestuoso. Los rivales chocan entre sí.",
          soundEffect: "¡ZAP!",
          soundColor: "text-amber-400 bg-amber-950/30 border-amber-500",
          iconType: "action"
        },
        {
          title: "Ⅲ. ZURDAZO ENVENENADO",
          comicLabel: "GOL DE ANTOLOGÍA",
          narrative: "Saca un disparo bombeado de zurda. La comba mete la pelota milimétricamente debajo de la cruceta derecha de la portería rival. ¡Delirio tricolor!",
          soundEffect: "¡GOOL!",
          soundColor: "text-red-550 bg-red-955/30 border-red-500",
          iconType: "climax"
        }
      ];
    }

    if (isPervis) {
      return [
        {
          title: "Ⅰ. SPRINT ULTRASÓNICO",
          comicLabel: "LOCOMOTORA DE BANDA",
          narrative: "Pervis Estupiñán enciende los cohetes y recorre el carril izquierdo. Atraviesa la medular devorando metros a velocidad relámpago.",
          soundEffect: "¡WUUUSH!",
          soundColor: "text-blue-400 bg-blue-955/30 border-blue-500",
          iconType: "prep"
        },
        {
          title: "Ⅱ. DESBORDE SIN PIEDAD",
          comicLabel: "QUÉBREDER COMBATE",
          narrative: "Ante la salida del zaguero, Pervis mete una diagonal seca y gana la línea de meta por pura exuberancia física y empuje táctico.",
          soundEffect: "¡POW!",
          soundColor: "text-yellow-450 bg-yellow-955/30 border-yellow-500",
          iconType: "action"
        },
        {
          title: "Ⅲ. ENVÍO QUIRÚRGICO",
          comicLabel: "CENTRO CURVADO",
          narrative: "Lanza un envío tenso de zurda rozando las estatuas sagradas de la defensa adversaria, cayendo milimétricamente para la volea del ariete.",
          soundEffect: "¡CENTRO!",
          soundColor: "text-emerald-400 bg-emerald-955/30 border-emerald-500",
          iconType: "climax"
        }
      ];
    }

    if (isPacho) {
      return [
        {
          title: "Ⅰ. CLAUSURA DE ACCESO",
          comicLabel: "MURALLA INMEDIATA",
          narrative: "El delantero habilidoso busca filtrarse en el área central. Willian Pacho achica rápido con templanza y le cierra los vectores tácticos.",
          soundEffect: "¡STAP!",
          soundColor: "text-neutral-400 bg-neutral-950/35 border-neutral-500",
          iconType: "prep"
        },
        {
          title: "Ⅱ. LA BARRADA IMPERIAL",
          comicLabel: "BREGAR SOBERBIO",
          narrative: "Con cálculo espacial sublime, Pacho clava el banquillo en el pasto y arrebata de tajo el balón limpiamente con fuerza de titán.",
          soundEffect: "¡BOOM!",
          soundColor: "text-emerald-450 bg-emerald-955/35 border-emerald-500",
          iconType: "action"
        },
        {
          title: "Ⅲ. LÍDER DE SALIDA",
          comicLabel: "PRESTANCIA TÁCTICA",
          narrative: "De pie al instante, proyecta un soberbio pase de trazo al centro de mediocampo, conjurando todo foco de riesgo con extrema madurez de juego.",
          soundEffect: "¡SALIDA!",
          soundColor: "text-yellow-450 bg-yellow-955/35 border-yellow-500",
          iconType: "climax"
        }
      ];
    }

    if (isMinda) {
      return [
        {
          title: "Ⅰ. SPRINT DE CONTRAGOLPE",
          comicLabel: "VELOCÍMETRO COMPROMETIDO",
          narrative: "Alan Minda intercepta en zona tricolor y pica con zancadas colosales, arrastrando al lateral y quebrando el contraataque rival.",
          soundEffect: "¡ZUUUM!",
          soundColor: "text-sky-450 bg-sky-955/35 border-sky-400",
          iconType: "prep"
        },
        {
          title: "Ⅱ. LA ROTURA DE CADERA",
          comicLabel: "ENGANCHE ELÉCTRICO",
          narrative: "Frena en una baldosa táctica, dejando al central contrario deslizarse de largo. Minda ingresa plenamente libre al callejón frente al meta.",
          soundEffect: "¡ZAC!",
          soundColor: "text-yellow-400 bg-yellow-955/35 border-yellow-400",
          iconType: "action"
        },
        {
          title: "Ⅲ. COLD BLOOD FINISH",
          comicLabel: "REVOLUCIÓN DE TRES DEDOS",
          narrative: "Sutil toque por un flanco del guardameta con el exterior de su pie dominante. El cromo animado corona una jugada digna del salón de la fama.",
          soundEffect: "¡GOLAZO!",
          soundColor: "text-red-500 bg-red-955/35 border-red-500",
          iconType: "climax"
        }
      ];
    }

    // Role-dependent fallbacks (GK)
    if (p.position === 'GK') {
      return [
        {
          title: "Ⅰ. LECTURA Y CONCENTRACIÓN",
          comicLabel: "COBERTURA DE RED",
          narrative: `${apodo} achica el marco plantando firmes las botas. Mira el disparo rival y calcula inmediatamente la trayectoria.`,
          soundEffect: "¡TENS-IÓN!",
          soundColor: "text-blue-400 bg-blue-955/30 border-blue-500",
          iconType: "prep"
        },
        {
          title: "Ⅱ. ESTIRADA TRIDIMENSIONAL",
          comicLabel: "VUELO MAGISTRAL",
          narrative: "¡TIRO ENVENENADO! El proyectil rival busca el ángulo, pero el guardameta vuela en una plástica estirada suspendida en el aire.",
          soundEffect: "¡POW!",
          soundColor: "text-cyan-400 bg-cyan-955/30 border-cyan-500",
          iconType: "action"
        },
        {
          title: "Ⅲ. CERROJO DE SELECCIÓN",
          comicLabel: "DESVÍO IMPAGABLE",
          narrative: "Con el puño de acero, desvía el esférico lejos del peligro. Cae con categoría al césped salvaguardando la meta imbatida.",
          soundEffect: "¡ATAJADA!",
          soundColor: "text-emerald-450 bg-emerald-955/30 border-emerald-500",
          iconType: "climax"
        }
      ];
    }

    // Role-dependent fallbacks (DF)
    if (p.position === 'DF') {
      return [
        {
          title: "Ⅰ. SÓLIDA CONTENCIÓN",
          comicLabel: "PERFIL TÁCTICO",
          narrative: `El adversario se acerca con amagues peligrosos. ${apodo} aguanta con serenidad, midiendo el balance del oponente sin regalar terreno.`,
          soundEffect: "¡ZAS!",
          soundColor: "text-slate-400 bg-slate-950/30 border-slate-500",
          iconType: "prep"
        },
        {
          title: "Ⅱ. EL CHOQUE DE TITANES",
          comicLabel: "CRUCE SOBRE EL BALÓN",
          narrative: "Inyectando potencia a la zancada, intercepta con una limpia y vigorosa barrida deslizante, extirpando el balón de manera estelar.",
          soundEffect: "¡KRAK!",
          soundColor: "text-rose-500 bg-rose-955/30 border-rose-500",
          iconType: "action"
        },
        {
          title: "Ⅲ. PELIGRO CONJURADO",
          comicLabel: "SALIDA CON ESTILO",
          narrative: "Segundos después de su majestuosa deconstrucción defensiva, levanta la mirada y despacha una excelsa habilitación larga.",
          soundEffect: "¡TRINCHERA!",
          soundColor: "text-yellow-400 bg-yellow-955/30 border-yellow-500",
          iconType: "climax"
        }
      ];
    }

    // Role-dependent fallbacks (MF)
    if (p.position === 'MF') {
      return [
        {
          title: "Ⅰ. CONTROL Y ORQUESTACIÓN",
          comicLabel: "FRACTURA EN LA MEDULAR",
          narrative: `En la densa fricción del centro, ${apodo} domina con el pecho y realiza un sutil medio giro saliendo del asfixiante doble marcaje.`,
          soundEffect: "¡GIR-OO!",
          soundColor: "text-violet-400 bg-violet-955/30 border-violet-500",
          iconType: "prep"
        },
        {
          title: "Ⅱ. LA FILTRACIÓN MAGISTRAL",
          comicLabel: "PASE MILIMÉTRICO",
          narrative: "Saca de la galera un pase templado con tres dedos que pasa rasante e inverosímil en medio de toda la telaraña defensiva rival.",
          soundEffect: "¡BAMM!",
          soundColor: "text-amber-400 bg-amber-955/30 border-amber-500",
          iconType: "action"
        },
        {
          title: "Ⅲ. LA ASISTENCIA EXQUISITA",
          comicLabel: "CRAC DEL TIMÓN",
          narrative: "El pase deja al compañero de ataque mano a mano con el portero rival. ¡Organización creativa de absoluto nivel de cómic de selecciones!",
          soundEffect: "¡ASIST!",
          soundColor: "text-emerald-450 bg-emerald-955/30 border-emerald-550",
          iconType: "climax"
        }
      ];
    }

    // Role-dependent fallbacks (FW)
    return [
      {
        title: "Ⅰ. EN LA LÍNEA DE FUEGO",
        comicLabel: "CAZADOR ACECHANDO",
        narrative: `${apodo} se sitúa al límite del fuera de juego, amagando el desmarque en diagonal para descolocar a la zaga y picar al espacio.`,
        soundEffect: "¡ACECHO!",
        soundColor: "text-orange-400 bg-orange-955/30 border-orange-500",
        iconType: "prep"
      },
      {
        title: "Ⅱ. EL DISPARO DE VOLCÁN",
        comicLabel: "CHUTE FULMINANTE",
        narrative: "¡BOMBAZO DESCOMUNAL! El balón viaja con fuerza supersónica dibujando un halo carmesí vibrante directo a las redes contrarias.",
        soundEffect: "¡BOOM!",
        soundColor: "text-[#EF4444] bg-red-955/30 border-red-500",
        iconType: "action"
      },
      {
        title: "Ⅲ. ¡ESTALLIDO EN LA RED!",
        comicLabel: "GRITO DE CAMPEÓN",
        narrative: "El misil quiebra la estirada del guardameta y sacude las mallas. ¡El ariete sale disparado a celebrar con la hinchada con su festejo de autor!",
        soundEffect: "¡GOLAZO!",
        soundColor: "text-yellow-450 bg-yellow-955/30 border-yellow-500",
        iconType: "climax"
      }
    ];
  };

  const panels = getComicPanels(player);
  const activePanel = panels[currentPanelIndex];

  // Auto-play comic effect timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPlayingAction) {
      interval = setInterval(() => {
        setCurrentPanelIndex((prev) => {
          if (prev >= 2) {
            // Loop or stay at climax
            return 2; 
          }
          return prev + 1;
        });
      }, 5000); // auto advance every 5 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlayingAction]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut", delay: idx * 0.03 }}
      id={`sticker-card-${player.id}`}
      className={`p-4 flex flex-col justify-between transition-all duration-300 relative select-none rounded-xl min-h-[440px] sm:min-h-[490px] h-auto overflow-hidden ${slant} ${cardBorder} group`}
    >
      {/* Matte print texture overlay */}
      <div className="absolute inset-0 bg-matte-texture opacity-[0.03] mix-blend-overlay pointer-events-none" />

      {/* Comic Slanted Splash Text on top corner */}
      <div className="absolute top-1 right-1 bg-red-650 text-white font-bangers text-[10px] px-2 py-0.5 border border-black shadow-[1.5px_1.5px_0px_#000] z-20 uppercase rotate-6 tracking-wide">
        {bubbleBadge}
      </div>

      {/* Card Header stats & badges */}
      <div className="flex items-center justify-between mb-3 relative z-10">
        <span className={`text-[9px] font-mono font-black border-2 border-black rounded px-2 py-0.5 text-white ${badgeColor}`}>
          {player.position} • CAMISETA #{shirtNum}
        </span>
        <span className="text-xs font-bangers border-2 border-black rounded px-2 py-0.5 bg-black text-[#FDDF2B] shadow-[1.5px_1.5px_0px_#000]">
          {player.rating} GL
        </span>
      </div>

      {/* Dynamic Action Block Section */}
      <div className="relative w-full h-44 sm:h-52 rounded-xl overflow-hidden mb-3 border-[3px] border-black bg-black shadow-md">
        
        {showLinkInput ? (
          /* Render input form to paste/edit URL if requested, overriding the view */
          <div className="w-full h-full bg-[#111827] flex flex-col items-center justify-center relative z-20 w-full px-2 text-center">
            <div className="absolute inset-0 bg-halftone-dots opacity-10 pointer-events-none" />
            <span className="text-[10px] font-bangers text-[#10B981] tracking-wider uppercase mb-1 relative z-10">
              VINCULAR ILUSTRACIÓN FAL
            </span>
            <input
              type="text"
              placeholder="https://queue.fal.run/files/..."
              value={linkValue}
              onChange={(e) => setLinkValue(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className="w-full text-[9px] font-mono bg-black text-[#10B981] border-2 border-black rounded p-1 mb-2 placeholder-slate-600 focus:outline-none focus:border-[#10B981] relative z-10"
            />
            <div className="flex gap-1.5 w-full justify-center relative z-10">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (linkValue.trim() && onPasteImageUrl) {
                    onPasteImageUrl(player, linkValue.trim());
                    setShowLinkInput(false);
                  }
                }}
                className="flex-1 text-[8.5px] font-bangers uppercase tracking-wider bg-emerald-600 hover:bg-emerald-500 border-2 border-black py-1 text-white rounded shadow-[1.5px_1.5px_0px_#000] cursor-pointer"
              >
                Guardar ✔
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowLinkInput(false);
                  setLinkValue("");
                }}
                className="flex-1 text-[8.5px] font-bangers uppercase tracking-wider bg-[#EF4444] hover:bg-red-500 border-2 border-black py-1 text-white rounded shadow-[1.5px_1.5px_0px_#000] cursor-pointer"
              >
                Atrás ✖
              </button>
            </div>
          </div>
        ) : hasImageEnabled && player.imageUrl && !imageLoadError ? (
          <div className="w-full h-full relative group/img">
            {/* High-fidelity responsive comic book loader shown while image loads */}
            {!isImgLoaded && (
              <div className="absolute inset-0 bg-slate-900/60 flex flex-col items-center justify-center p-3 text-center overflow-hidden z-20 backdrop-blur-[1px]">
                <div className="absolute inset-0 bg-halftone-dots opacity-20 pointer-events-none animate-pulse" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-red-950/20 opacity-90" />
                
                {/* Comic style neon spinner indicator */}
                <div className="relative z-10 w-9 h-9 rounded-full border-4 border-dashed border-red-500 flex items-center justify-center animate-spin mb-1.5">
                  <div className="w-3.5 h-3.5 rounded-full bg-emerald-550 animate-ping" />
                </div>
                
                <span className="relative z-10 text-[10px] font-bangers text-[#FDDF2B] tracking-wider uppercase animate-bounce">
                  ⚡ INTEGRANDO... ⚡
                </span>
                <span className="relative z-10 text-[7px] font-mono text-slate-400 block mt-0.5 uppercase tracking-wider">
                  CÓMIC INDUMENTARIA
                </span>
              </div>
            )}
            <img
              ref={imgRef}
              src={player.imageUrl}
              alt={apodo}
              referrerPolicy="no-referrer"
              loading="lazy"
              decoding="async"
              onLoad={() => setIsImgLoaded(true)}
              onError={() => {
                console.error(`Error loading image for player ${player.realName}:`, player.imageUrl);
                setImageLoadError(true);
              }}
              className={`w-full h-full object-cover group-hover/img:scale-105 transition-all duration-500 ${isImgLoaded ? 'opacity-100 scale-100' : 'opacity-30 scale-95'}`}
            />
            {/* Dark vignette gradient overlay */}
            {isImgLoaded && (
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-75 pointer-events-none" />
            )}
            
            {/* Permanent/Hover Edit button for existing images */}
            {onPasteImageUrl && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLinkValue(player.imageUrl || "");
                  setShowLinkInput(true);
                }}
                className="absolute top-2 left-2 text-[8.5px] font-bangers uppercase tracking-wider bg-[#10B981] hover:bg-[#34D399] border-2 border-black py-1 px-1.5 text-white rounded-lg shadow-[1.5px_1.5px_0px_#000] cursor-pointer active:scale-95 transition-all text-center z-30"
              >
                Editar Enlace 🔗
              </button>
            )}
          </div>
        ) : imageLoadError ? (
          /* Error fallback representation for images that failed to load */
          <div className="w-full h-full bg-[#1e1b1b] flex flex-col items-center justify-center relative p-2 text-center border-2 border-red-500/50">
            <div className="absolute inset-0 bg-halftone-dots opacity-10 pointer-events-none" />
            <div className="flex flex-col items-center justify-center space-y-1 relative z-10 w-full">
              <span className="text-[9px] font-bangers text-[#EF4444] tracking-wide uppercase">
                ⚠️ ENLACE DE IMAGEN CON ERROR
              </span>
              <p className="text-[7.5px] font-mono text-slate-300 leading-tight px-1">
                Asegúrate de vincular la URL directa de la imagen (e.g. que termina en png, jpg o tiene formato de CDN de fal.run) y no la web del playground.
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLinkValue(player.imageUrl || "");
                  setShowLinkInput(true);
                }}
                className="mt-1.5 text-[8.5px] font-bangers uppercase tracking-wider bg-red-650 hover:bg-neutral-800 border-2 border-black px-2 py-0.5 text-white rounded shadow-[1.5px_1.5px_0px_#000] cursor-pointer"
              >
                Volver a Pegar URL 🔗
              </button>
            </div>
          </div>
        ) : (
          /* "SIN IMÁGENES" fallback representation for other countries with Fal.ai GPU support */
          <div className="w-full h-full bg-[#111827] flex flex-col items-center justify-center relative p-3 text-center border-dashed border-2 border-slate-750">
            {/* Halftone dot pattern canvas fallback */}
            <div className="absolute inset-0 bg-halftone-dots opacity-10 pointer-events-none" />
            
            {isGenerating ? (
              <div className="flex flex-col items-center justify-center space-y-2 relative z-10">
                <div className="w-8 h-8 rounded-full border-4 border-t-yellow-400 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
                <span className="text-[9px] font-mono text-yellow-400 tracking-wider uppercase animate-pulse font-bold">
                  Conectando GPU Fal.ai...
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center relative z-10 w-full">
                <div className="w-10 h-10 rounded-full border-2 border-[#10B981] flex items-center justify-center bg-black/40 text-[#10B981] mb-1">
                  <Sparkles className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bangers tracking-wider text-yellow-400 uppercase">
                  CROMO DIGITAL PREMIUM
                </span>
                <span className="text-[8px] font-mono text-slate-400 block mt-0.5 uppercase mb-1">
                  (Ilustración Exclusiva en Cola)
                </span>
                <div className="flex flex-col gap-1.5 items-center justify-center w-full mt-1.5 px-2">
                  {onPasteImageUrl && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setLinkValue(player.imageUrl || "");
                        setShowLinkInput(true);
                      }}
                      className="w-full text-[10px] font-bangers uppercase tracking-wider bg-emerald-600 hover:bg-emerald-500 border-2 border-black py-1.5 text-white rounded-lg shadow-[2.5px_2.5px_0px_#000] cursor-pointer active:scale-95 transition-all text-center"
                    >
                      Pegar URL de Fal 🔗
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <span className="absolute bottom-1 right-2 text-[8px] font-bangers text-[#FDDF2B] bg-black border border-black px-1.5 py-0.5 rounded rotate-1 tracking-wider uppercase z-10">
          STICKER DIGITAL COPA '26
        </span>
      </div>

      {/* Action Comic Presentation Full Overlay Coverage (High-Fidelity Interaction) - Hidden for now as requested */}
      {false && isPlayingAction && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute inset-0 z-40 bg-slate-950 text-white p-3.5 flex flex-col justify-between border-[5px] border-black rounded-lg shadow-2xl"
          >
            {/* Half-tone dots background to feel physical */}
            <div className="absolute inset-0 bg-halftone-dots opacity-20 pointer-events-none" />

            {/* Comic Header bar */}
            <div className="flex items-center justify-between border-b-2 border-black/50 pb-1.5 relative z-10">
              <div className="flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-[#FDDF2B] animate-pulse" />
                <span className="font-bangers text-xs tracking-wider text-[#FDDF2B]">ANIMACIÓN DEL CRAC</span>
              </div>
              <span className="font-mono text-[9px] text-slate-400 font-bold bg-slate-910 border border-slate-800 px-1.5 py-0.5 rounded">
                PASO {currentPanelIndex + 1} DE 3
              </span>
            </div>

            {/* The Animated Simulation Visual Frame Screen */}
            <div className="relative w-full h-[150px] bg-slate-900 border-[3.5px] border-black rounded-xl overflow-hidden shadow-[3px_3px_0px_#000] flex flex-col justify-between items-center p-2 mt-1">
              
              {/* Dynamic stage visualizations */}
              <AnimatePresence mode="wait">
                {activePanel.iconType === 'prep' && (
                  <motion.div
                    key="prep"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center overflow-hidden"
                  >
                    {/* Concentric radar circles and coordinates HUD overlay */}
                    <div className="absolute border border-[#10B981]/20 w-32 h-32 rounded-full animate-ping" />
                    <div className="absolute border border-dashed border-[#10B981]/15 w-24 h-24 rounded-full" />
                    <div className="absolute h-px w-full bg-[#10B981]/25 border-dashed" />
                    <div className="absolute w-px h-full bg-[#10B981]/25 border-dashed" />
                    
                    {/* Retro coordinate text */}
                    <div className="absolute top-2 left-2 text-[8px] font-mono text-emerald-450 uppercase opacity-75 tracking-wider">
                      COORD: 25.10N / {shirtNum}Y
                    </div>
                    
                    <div className="relative z-10 w-10 h-10 rounded-full bg-slate-900/85 border-2 border-dashed border-[#10B981] flex items-center justify-center animate-bounce">
                      <Sparkles className="w-5 h-5 text-yellow-400" />
                    </div>
                    
                    <span className="text-[9px] font-bangers text-emerald-450 tracking-wider uppercase mt-1.5">
                      PREPARANDO LA MANIOBRA TÁCTICA...
                    </span>
                  </motion.div>
                )}

                {activePanel.iconType === 'action' && (
                  <motion.div
                    key="action"
                    initial={{ opacity: 0, x: -100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 100 }}
                    className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center overflow-hidden"
                  >
                    {/* Fast diagonal Speed lines */}
                    <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_8px,rgba(255,255,255,0.06)_8px,rgba(255,255,255,0.06)_16px)]" />
                    
                    {/* Trajectory vector curve */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 200 100">
                      <path
                        d="M 20 80 Q 100 10 180 40"
                        fill="transparent"
                        stroke="#EF4444"
                        strokeWidth="3.5"
                        strokeDasharray="6,4"
                        className="animate-[dash_1.5s_linear_infinite]"
                      />
                    </svg>

                    {/* The soaring ball particle */}
                    <motion.div
                      animate={{ 
                        x: [-75, 75],
                        y: [28, -20],
                        rotate: 360,
                        scale: [0.9, 1.4, 1.1]
                      }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                      className="absolute z-10 text-3xl filter drop-shadow-[0_0_9px_rgba(239,68,68,0.95)]"
                    >
                      ⚽
                    </motion.div>

                    <div className="absolute bottom-2 bg-black/85 border border-red-500 rounded px-2 py-0.5 text-[8.5px] font-mono text-red-400 font-extrabold flex items-center gap-1">
                      <Zap className="w-3 h-3 text-[#FDDF2B] animate-pulse" />
                      CALCULANDO VELOCIDAD Y ENERGÍA
                    </div>
                  </motion.div>
                )}

                {activePanel.iconType === 'climax' && (
                  <motion.div
                    key="climax"
                    initial={{ scale: 0.3, rotate: -20, opacity: 0 }}
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: [0, -3, 3, 0],
                      opacity: 1 
                    }}
                    transition={{
                      duration: 0.45,
                      scale: { type: 'tween', ease: 'easeInOut' },
                      rotate: { type: 'tween', ease: 'easeInOut' },
                      opacity: { type: 'spring', damping: 12 }
                    }}
                    className="absolute inset-0 bg-red-650 flex flex-col items-center justify-center overflow-hidden p-2"
                  >
                    {/* Concentric red comic rays */}
                    <div className="absolute inset-0 bg-gradient-radial from-red-550 via-red-750 to-red-900" />
                    <div className="absolute inset-0 bg-halftone-dots opacity-40 pointer-events-none" />

                    {/* Glowing golden ball embedded in net */}
                    <motion.div
                      animate={{ scale: [1, 1.25, 1] }}
                      transition={{ repeat: Infinity, duration: 0.7 }}
                      className="text-4xl filter drop-shadow-[0_0_12px_#FDDF2B] z-10"
                    >
                      🥅⚽🔥
                    </motion.div>

                    <span className="text-[9.5px] font-mono font-black text-white bg-black/95 border-2 border-black rounded-lg px-2.5 py-0.5 tracking-wider uppercase rotate-2 mt-2 shadow-[2px_2px_0px_#000] z-10">
                      🎯 ACCIÓN EJECUTADA CON ÉXITO
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Sound effect explosive popup bubble */}
              <motion.div
                key={`sound-${currentPanelIndex}`}
                initial={{ scale: 0.4, opacity: 0, rotate: -15 }}
                animate={{ scale: 1.25, opacity: 1, rotate: 6 }}
                transition={{ type: 'spring', stiffness: 220, damping: 10 }}
                className={`absolute top-2.5 right-2 px-3 py-1 font-sans font-black text-base uppercase rounded border-[2.5px] border-black shadow-[3.5px_3.5px_0px_#000] tracking-widest z-20 select-none ${activePanel.soundColor}`}
              >
                {activePanel.soundEffect}
              </motion.div>

              {/* Text label in the bottom left corner */}
              <span className="absolute bottom-2 left-2.5 text-[8.5px] font-mono font-black border-2 border-black rounded-md px-2 py-0.5 bg-black text-[#FDDF2B] shadow-[1.5px_1.5px_0px_#000] uppercase z-20">
                {activePanel.comicLabel}
              </span>
            </div>

            {/* Dynamic Step Title */}
            <div className="text-left mt-3">
              <h5 className="font-bangers text-[#FDDF2B] text-sm tracking-wider uppercase border-b border-white/20 pb-1">
                {activePanel.title}
              </h5>
            </div>

            {/* Interactive Narrative Comic Dialog box */}
            <div className="flex-1 bg-white hover:bg-neutral-50 transition-colors border-[3px] border-black p-3 my-2.5 rounded-xl shadow-[3px_3px_0px_#EF4444] text-black">
              <div className="text-[11px] leading-relaxed font-comic font-semibold text-neutral-900 text-justify overflow-y-auto max-h-[92px] pr-1">
                <span className="font-sans font-black text-rose-500 uppercase tracking-wide mr-1 inline-block">[NARRADOR]:</span>
                {activePanel.narrative}
              </div>
            </div>

            {/* Multi-panel controls utility belt */}
            <div className="grid grid-cols-3 gap-2 py-1.5 border-t border-white/10 items-center">
              
              <button
                type="button"
                disabled={currentPanelIndex === 0}
                onClick={() => setCurrentPanelIndex(prev => Math.max(0, prev - 1))}
                className="py-1 px-1.5 rounded bg-slate-900 hover:bg-slate-850 border border-slate-700 font-bangers text-[10px] uppercase flex items-center justify-center gap-1 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>ATRÁS</span>
              </button>

              {/* Re-play reset button */}
              <button
                type="button"
                onClick={() => setCurrentPanelIndex(0)}
                className="py-1 px-1 rounded bg-slate-905 hover:bg-slate-800 border border-slate-800 font-mono text-[8.5px] uppercase flex items-center justify-center gap-1 cursor-pointer font-bold text-yellow-405"
                title="Reiniciar Simulación"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#FDDF2B]" />
                <span>REINICIAR</span>
              </button>

              <button
                type="button"
                disabled={currentPanelIndex === 2}
                onClick={() => setCurrentPanelIndex(prev => Math.min(2, prev + 1))}
                className="py-1 px-1.5 rounded bg-emerald-600 hover:bg-emerald-500 border border-black font-bangers text-[10px] text-slate-950 uppercase flex items-center justify-center gap-1 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <span>SIGTE</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Massive Close Button Cover */}
            <button
              onClick={() => setIsPlayingAction(false)}
              className="w-full py-2 bg-red-650 hover:bg-red-500 text-white font-bangers text-xs tracking-widest uppercase border-[2.5px] border-black rounded-lg cursor-pointer shadow-[3px_3px_0px_#000] active:scale-95 transition-all mt-1"
            >
              CERRAR ANIMACIÓN ✕
            </button>
          </motion.div>
        </AnimatePresence>
      )}

      {/* Animated Action Bubble Button trigger (Red/Green energy color bursts) - Hidden for now as requested */}
      {false && (
        <div className="mb-2.5">
          <button
            onClick={triggerActionPlay}
            className="w-full py-2 bg-gradient-to-r from-red-650 to-emerald-650 hover:from-red-500 hover:to-emerald-555 text-white font-bangers text-xs tracking-widest uppercase border-[2.5px] border-black rounded-lg cursor-pointer shadow-[4px_4px_0px_#000] active:scale-95 active:shadow-[1.5px_1.5px_0px_#000] transition-all flex items-center justify-center gap-1.5"
          >
            <Play className="w-3.5 h-3.5 fill-current animate-pulse text-amber-390" />
            <span>VER ACCIÓN 🎬</span>
          </button>
        </div>
      )}

      {/* Player Identity (No real name shown, just Nickname & Descriptive Title) */}
      <div className="text-left border-t-2 border-black/15 pt-2 mb-2">
        <h4 className="font-bangers tracking-wider text-lg uppercase leading-none text-black font-extrabold flex items-center gap-1 flex-wrap">
          {apodo}
        </h4>
        <span className="text-[10.5px] font-comic font-black block mt-1 leading-none text-rose-600 tracking-wide uppercase">
          "{descriptiveTitle}"
        </span>
      </div>

      {/* Player Bio Statistics Block (Height, Weight, Dominant Foot, Position on Pitch, Shirt num) */}
      <div className="space-y-1 text-[10px] border-y-2 border-black/15 py-1.5 font-mono text-slate-800 font-bold mb-2">
        <div className="flex justify-between items-center">
          <span className="text-[9.5px] text-gray-500">Estatura / Peso</span>
          <span className="font-black text-black">{player.height}cm / {player.weight}kg</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[9.5px] text-gray-500">Pie Dominante</span>
          <span className="font-black text-black">{player.dominantFoot}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[9.5px] text-gray-500">Posición en Campo</span>
          <span className="font-extrabold bg-slate-900 text-[#FDDF2B] rounded text-[9.5px] px-1.5 py-0.5 uppercase tracking-wide">{player.subPosition.replace(/Leyenda|Elite|Comic/gi, '').trim()}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[9.5px] text-gray-500">N° Camiseta</span>
          <span className="font-black text-[#EF4444] font-mono text-[11px]">#{shirtNum}</span>
        </div>
      </div>

      {/* Scouting player style description */}
      <p className="text-[10px] leading-tight bg-black/5 p-2 rounded-lg border border-black/10 text-justify text-slate-900 font-comic font-bold font-semibold">
        {player.styleOfPlay}
      </p>
    </motion.div>
  );
};
