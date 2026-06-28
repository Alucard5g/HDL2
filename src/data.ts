import { Player, Match, LeaderboardEntry } from './types';
import { getFactualPlayers } from './data/squadsData';

export const COUNTRIES = [
  // Group A
  { code: 'MX', name: 'México', group: 'Grupo A', flag: '🇲🇽', description: 'Selección anfitriona dinámica y veloz por las bandas.' },
  { code: 'ZA', name: 'Sudáfrica', group: 'Grupo A', flag: '🇿🇦', description: 'Los Bafana Bafana. Juego de ritmo físico intenso.' },
  { code: 'KR', name: 'Corea del Sur', group: 'Grupo A', flag: '🇰🇷', description: 'Velocidad de circulación y resistencia incansable.' },
  { code: 'CZ', name: 'República Checa', group: 'Grupo A', flag: '🇨🇿', description: 'Orden táctico férreo y gran juego aéreo.' },

  // Group B
  { code: 'CA', name: 'Canadá', group: 'Grupo B', flag: '🇨🇦', description: 'Fuerza física norteamericana emergente en aceleración.' },
  { code: 'BA', name: 'Bosnia y Herzegovina', group: 'Grupo B', flag: '🇧🇦', description: 'Estructura sólida con experiencia defensiva europea.' },
  { code: 'QA', name: 'Catar', group: 'Grupo B', flag: '🇶🇦', description: 'Estilo combinativo de toques rápidos.' },
  { code: 'CH', name: 'Suiza', group: 'Grupo B', flag: '🇨🇭', description: 'Disciplina táctica helvética y solidez posicional.' },

  // Group C
  { code: 'BR', name: 'Brasil', group: 'Grupo C', flag: '🇧🇷', description: 'Rey del Jogo Bonito con extremos desequilibrantes y explosivos.' },
  { code: 'MA', name: 'Marruecos', group: 'Grupo C', flag: '🇲🇦', description: 'Leones del Atlas. Repliegue formidable y salidas letales.' },
  { code: 'HT', name: 'Haití', group: 'Grupo C', flag: '🇭🇹', description: 'Fuerza explosiva caribeña y orgullo colectivo.' },
  { code: 'SC', name: 'Escocia', group: 'Grupo C', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', description: 'Corazón batallador, presión física y remates directos.' },

  // Group D
  { code: 'US', name: 'Estados Unidos', group: 'Grupo D', flag: '🇺🇸', description: 'Fuerza atlética de alta intensidad y contras supersónicas.' },
  { code: 'PY', name: 'Paraguay', group: 'Grupo D', flag: '🇵🇾', description: 'La garra guaraní indomable en el juego aéreo defensivo.' },
  { code: 'AU', name: 'Australia', group: 'Grupo D', flag: '🇦🇺', description: 'Los Socceroos. Poderío aéreo y organización defensiva.' },
  { code: 'TR', name: 'Turquía', group: 'Grupo D', flag: '🇹🇷', description: 'Fútbol pasional de rápida circulación en medular.' },

  // Group E
  { code: 'DE', name: 'Alemania', group: 'Grupo E', flag: '🇩🇪', description: 'Estructura táctica rígida y alta presión alemana.' },
  { code: 'CW', name: 'Curazao', group: 'Grupo E', flag: '🇨🇼', description: 'Juego dinámico y adaptabilidad táctica.' },
  { code: 'CI', name: 'Costa de Marfil', group: 'Grupo E', flag: '🇨🇮', description: 'Los Elefantes. Despliegue físico imponente y desborde.' },
  { code: 'EC', name: 'Ecuador', group: 'Grupo E', flag: '🇪🇨', description: 'Fuerza juvenil ecuatoriana y transiciones veloces.' },

  // Group F
  { code: 'NL', name: 'Países Bajos', group: 'Grupo F', flag: '🇳🇱', description: 'Fútbol total con transiciones coordinadas por bandas.' },
  { code: 'JP', name: 'Japón', group: 'Grupo F', flag: '🇯🇵', description: 'Samuráis Azules. Disciplina táctica absoluta y pases cortos.' },
  { code: 'SE', name: 'Suecia', group: 'Grupo F', flag: '🇸🇪', description: 'Fisiología imponente y organización colectiva.' },
  { code: 'TN', name: 'Túnez', group: 'Grupo F', flag: '🇹🇳', description: 'Rigor y orden en el mediocampo de marcas agresivas.' },

  // Group G
  { code: 'BE', name: 'Bélgica', group: 'Grupo G', flag: '🇧🇪', description: 'Circulación creativa de balón y mediocentro técnico.' },
  { code: 'EG', name: 'Egipto', group: 'Grupo G', flag: '🇪🇬', description: 'Estructura defensiva con contraataques muy punzantes.' },
  { code: 'IR', name: 'Irán', group: 'Grupo G', flag: '🇮🇷', description: 'Rigor defensivo en bloque bajo ultra compacto.' },
  { code: 'NZ', name: 'Nueva Zelanda', group: 'Grupo G', flag: '🇳🇿', description: 'All Whites. Excelente juego de altura en balones parados.' },

  // Group H
  { code: 'ES', name: 'España', group: 'Grupo H', flag: '🇪🇸', description: 'Fútbol de toque, posesión absoluta y presión asfixiante.' },
  { code: 'CV', name: 'Cabo Verde', group: 'Grupo H', flag: '🇨🇻', description: 'Desborde físico por bandas y fútbol audaz.' },
  { code: 'SA', name: 'Arabia Saudita', group: 'Grupo H', flag: '🇸🇦', description: 'Bloque junto táctico y dinamismo colectivo.' },
  { code: 'UY', name: 'Uruguay', group: 'Grupo H', flag: '🇺🇾', description: 'La Garra Charrúa de gran desgaste defensivo.' },

  // Group I
  { code: 'FR', name: 'Francia', group: 'Grupo I', flag: '🇫🇷', description: 'Poderío con individualidades estelares y contras mortales.' },
  { code: 'SN', name: 'Senegal', group: 'Grupo I', flag: '🇸🇳', description: 'Leones de la Teranga de enorme fortaleza de marcas.' },
  { code: 'IQ', name: 'Irak', group: 'Grupo I', flag: '🇮🇶', description: 'Fútbol entusiasta de gran disciplina y orden.' },
  { code: 'NO', name: 'Noruega', group: 'Grupo I', flag: '🇳🇴', description: 'Estructura física directa con definición resolutiva.' },

  // Group J
  { code: 'AR', name: 'Argentina', group: 'Grupo J', flag: '🇦🇷', description: 'Campeones del Mundo. Inteligencia y juego creativo combinatorio.' },
  { code: 'DZ', name: 'Argelia', group: 'Grupo J', flag: '🇩🇿', description: 'Zorros del Desierto de rápida conducción y solidez.' },
  { code: 'AT', name: 'Austria', group: 'Grupo J', flag: '🇦🇹', description: 'Presión tras pérdida insaciable y ritmo germánico.' },
  { code: 'JO', name: 'Jordania', group: 'Grupo J', flag: '🇯🇴', description: 'Firmeza física en defensa y salidas ordenadas.' },

  // Group K
  { code: 'PT', name: 'Portugal', group: 'Grupo K', flag: '🇵🇹', description: 'Constelación de genios en líneas medias y ataque quirúrgico.' },
  { code: 'CD', name: 'RD Congo', group: 'Grupo K', flag: '🇨🇩', description: 'Poder de transiciones rápidas africanas.' },
  { code: 'UZ', name: 'Uzbekistán', group: 'Grupo K', flag: '🇺🇿', description: 'Rigor táctico de marca y bloque defensivo estrecho.' },
  { code: 'CO', name: 'Colombia', group: 'Grupo K', flag: '🇨🇴', description: 'Sabor de fútbol de toque alegre con velocidad deslumbrante.' },

  // Group L
  { code: 'EN', name: 'Inglaterra', group: 'Grupo L', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', description: 'Estructura británica imponente y ataque vertical.' },
  { code: 'HR', name: 'Croacia', group: 'Grupo L', flag: '🇭🇷', description: 'Poder combinatorio y carácter competitivo inquebrantable.' },
  { code: 'GH', name: 'Ghana', group: 'Grupo L', flag: '🇬🇭', description: 'Velocidad y despliegue físico sobresaliente en bandas.' },
  { code: 'PA', name: 'Panamá', group: 'Grupo L', flag: '🇵🇦', description: 'La Marea Roja de marcas férreas de la CONCACAF.' }
];

// Seeded real-inspired tactical star players for main countries
const PRESEEDED_STARS: { [country: string]: Partial<Player>[] } = {
  'Argentina': [
    { id: 'ar-1', name: 'El Guardián del Arco', realName: 'E. Martínez', rating: 90, position: 'GK', subPosition: 'Arquero Ataja Penales', styleOfPlay: 'Especialista en duelos 1v1 y atajadas críticas bajo presión con fuerte liderazgo vocal.' },
    { id: 'ar-10', name: 'El 10 de Argentina', realName: 'L. Messi', rating: 96, position: 'FW', subPosition: 'Mediapunta / Creador', styleOfPlay: 'Genio creativo con conducción en espacio reducido, pases milimétricos y definición excelsa.' },
    { id: 'ar-11', name: 'El Fideo Legendario', realName: 'A. Di María', rating: 88, position: 'FW', subPosition: 'Extremo Derecho', styleOfPlay: 'Extremo escurridizo que recorta hacia el centro, experto en partidos decisivos.' },
    { id: 'ar-7', name: 'El Motor Incansable', realName: 'R. De Paul', rating: 86, position: 'MF', subPosition: 'Mediocampista Box-to-Box', styleOfPlay: 'Alta intensidad física, coberturas constantes y gran capacidad de distribución progresiva.' },
    { id: 'ar-24', name: 'El Orquestador Joven', realName: 'E. Fernández', rating: 87, position: 'MF', subPosition: 'Mediocentro Organizador', styleOfPlay: 'Controlador del tempo, gran visión para pases largos de ruptura y recuperación coordinada.' },
    { id: 'ar-13', name: 'La Muralla de Córdoba', realName: 'C. Romero', rating: 89, position: 'DF', subPosition: 'Defensor Central Líbero', styleOfPlay: 'Anticipación agresiva, implacable en los cortes de juego aéreo y salida prolija por abajo.' },
  ],
  'Brasil': [
    { id: 'br-1', name: 'El Muro de la Premier', realName: 'Alisson B.', rating: 89, position: 'GK', subPosition: 'Arquero Líbero', styleOfPlay: 'Excelencia en salida con los pies, reflejos felinos y achiques posicionales excepcionales.' },
    { id: 'br-7', name: 'El Rayo de Madrid', realName: 'Vinicius Jr', rating: 94, position: 'FW', subPosition: 'Extremo Izquierdo', styleOfPlay: 'Velocidad de élite de torneo, regates impredecibles en el 1v1 y aceleración letal en espacios amplios.' },
    { id: 'br-10', name: 'El Último Ousado', realName: 'Neymar Jr', rating: 89, position: 'MF', subPosition: 'Mediapunta Asistidor', styleOfPlay: 'Improvisación pura, asistencias de fantasía, regateador de potrero y gran cobrador de faltas.' },
    { id: 'br-5', name: 'La Locomotora', realName: 'Casemiro', rating: 85, position: 'MF', subPosition: 'Pivote Defensivo', styleOfPlay: 'Gran despliegue táctico, robo agresivo de balones aéreos y terrestres, equilibrio defensivo absoluto.' },
    { id: 'br-4', name: 'El Mariscal de París', realName: 'Marquinhos', rating: 88, position: 'DF', subPosition: 'Defensor Central', styleOfPlay: 'Veloz en coberturas cruzadas, sobriedad táctica y gran cabeceador en ambas áreas.' },
  ],
  'Francia': [
    { id: 'fr-1', name: 'El Águila de Milán', realName: 'M. Maignan', rating: 87, position: 'GK', subPosition: 'Arquero Moderno', styleOfPlay: 'Gran alcance de brazos, reflejos instantáneos y excelente dominio del pase largo de contraataque.' },
    { id: 'fr-10', name: 'La Turbina Galáctica', realName: 'K. Mbappé', rating: 95, position: 'FW', subPosition: 'Delantero Centro / Extremo', styleOfPlay: 'Cambio de ritmo devastador, finalización quirúrgica de derecha y letal al contragolpe.' },
    { id: 'fr-7', name: 'El Principito', realName: 'A. Griezmann', rating: 89, position: 'MF', subPosition: 'Mediapunta Conectivo', styleOfPlay: 'Inteligencia táctica sublime, asistencia al primer toque e incansable sacrificio defensivo.' },
    { id: 'fr-4', name: 'El Tanque del Arsenal', realName: 'W. Saliba', rating: 89, position: 'DF', subPosition: 'Líbero Central', styleOfPlay: 'Imponente físico, velocidad coordinada en distancias cortas y anticipación limpia sin cometer faltas.' },
  ],
  'España': [
    { id: 'es-1', name: 'El Pararrayos del Norte', realName: 'Unai Simón', rating: 86, position: 'GK', subPosition: 'Arquero Clásico', styleOfPlay: 'Estabilidad mental en momentos de máxima presión, salidas valientes y atajador bajo los tres palos.' },
    { id: 'es-16', name: 'El Cerebro de Manchester', realName: 'Rodri H.', rating: 95, position: 'MF', subPosition: 'Pivote Organizador', styleOfPlay: 'Efectividad posicional del 100%, recuperador por interpretación espacial y un excelente golpeo de media distancia.' },
    { id: 'es-17', name: 'La Joya del Futuro', realName: 'Lamine Yamal', rating: 91, position: 'FW', subPosition: 'Extremo Invertido', styleOfPlay: 'Regate serpenteante desde banda derecha, desborde creativo, centros precisos y gran lectura de espacios.' },
    { id: 'es-10', name: 'El Director de Orquesta', realName: 'Dani Olmo', rating: 87, position: 'MF', subPosition: 'Volante Ofensivo', styleOfPlay: 'Rotación rápida de balón, desmarque entre líneas y disparo envenenado con ambas piernas.' },
  ]
};

// Generates exactly 26 players for a country
export function generatePlayersForCountry(countryName: string): Player[] {
  const factualRoster = getFactualPlayers(countryName);
  if (factualRoster) {
    // Ensure sorting stays consistent: GK at starting, then DF, MF, FW
    const posOrder = { 'GK': 0, 'DF': 1, 'MF': 2, 'FW': 3 };
    return (factualRoster as Player[]).sort((a, b) => {
      if (posOrder[a.position] !== posOrder[b.position]) {
        return posOrder[a.position] - posOrder[b.position];
      }
      return b.rating - a.rating;
    });
  }

  const players: Player[] = [];
  const starTemplates = PRESEEDED_STARS[countryName] || [];

  // Positions requirement: Exactly 1 GK, 9 DF, 9 MF, 7 FW = 26 players!
  const positionDistribution = [
    ...Array(1).fill('GK'),
    ...Array(9).fill('DF'),
    ...Array(9).fill('MF'),
    ...Array(7).fill('FW')
  ] as ('GK' | 'DF' | 'MF' | 'FW')[];

  const subPositions: { [key: string]: string[] } = {
    GK: ['Arquero Atajador', 'Portero Líbero', 'Guardián del Área'],
    DF: ['Defensor Central', 'Lateral Derecho', 'Lateral Izquierdo', 'Zaguero de Cobertura', 'Carrilero de Proyección'],
    MF: ['Pivote Defensivo', 'Interior Box-to-Box', 'Volante de Creación', 'Mediocentro Mixto', 'Volante Organizador'],
    FW: ['Delantero Centro', 'Extremo Izquierdo', 'Extremo Derecho', 'Mediapunta Móvil', 'Segundo Delantero']
  };

  const clubs = [
    'Real Madrid CF', 'FC Barcelona', 'Manchester City', 'Bayern de Múnich', 
    'París Saint-Germain', 'Arsenal FC', 'Liverpool FC', 'Inter de Milán',
    'Juventus FC', 'Atlético de Madrid', 'Borussia Dortmund', 'Boca Juniors', 
    'River Plate', 'Flamengo', 'Palmeiras', 'Benfica', 'Sporting CP'
  ];

  // Helper to generate a realistic football player
  for (let i = 0; i < 26; i++) {
    const position = positionDistribution[i];
    const countryStar = starTemplates.find((s, index) => s.position === position && !players.some(p => p.id === s.id));
    
    if (countryStar) {
      players.push({
        id: countryStar.id!,
        name: countryStar.name!,
        realName: countryStar.realName!,
        country: countryName,
        age: countryStar.age || Math.floor(Math.random() * 10) + 20, // 20-30 years
        weight: countryStar.weight || Math.floor(Math.random() * 20) + 65, // 65-85 kg
        height: countryStar.height || Math.floor(Math.random() * 25) + 172, // 172-197 cm
        dominantFoot: countryStar.dominantFoot || (Math.random() > 0.35 ? 'Derecho' : 'Izquierdo'),
        currentClub: countryStar.currentClub || clubs[Math.floor(Math.random() * clubs.length)],
        rating: countryStar.rating!,
        styleOfPlay: countryStar.styleOfPlay!,
        position: position,
        subPosition: countryStar.subPosition || subPositions[position][0],
        imageSeed: `${countryName.substring(0, 2).toLowerCase()}-${position.toLowerCase()}-${i}`,
      });
    } else {
      // Generate factual-like descriptive generic player with descriptive artistic name
      const subPosOptions = subPositions[position];
      const randomSubPos = subPosOptions[Math.floor(Math.random() * subPosOptions.length)];
      
      const numLabel = i + 1;
      const age = Math.floor(Math.random() * 12) + 19; // 19 to 31
      const weight = Math.floor(Math.random() * 18) + 68; // 68 to 86
      const height = Math.floor(Math.random() * 22) + 173; // 173 to 195
      const dominant = Math.random() > 0.25 ? 'Derecho' : 'Izquierdo';
      const club = clubs[Math.floor(Math.random() * clubs.length)];
      
      // Ratings: Star players are at high rank (85-94), generic reserves or backups are at lower rank (62-84)
      let rating = 0;
      if (i < 5) rating = Math.floor(Math.random() * 10) + 81; // Elite
      else if (i < 15) rating = Math.floor(Math.random() * 10) + 72; // Key players
      else rating = Math.floor(Math.random() * 10) + 64; // Reserve

      const descriptiveNames: { [key: string]: string[] } = {
        GK: ['La Muralla Certera', 'Reflejo de Gato', 'El Cerrojero', 'Vuelo Espectacular'],
        DF: ['El Zaguero Central', 'Fuerza Lateral', 'Anticipador Férreo', 'Escudo Defensivo', 'El Pulmón del Carril', 'El Mariscal del Área'],
        MF: ['El Motor del Mediocampo', 'Intermedio Creativo', 'Intercepte Perfecto', 'El Enlace de Transición', 'La Brújula Táctica'],
        FW: ['El Goleador del Área', 'Extremo Veloz', 'La Joya Extrema', 'Cazador de Rebotes', 'El Tanque de Ataque']
      };

      const lastNameSuffix = ['García', 'Fernández', 'Gomes', 'Müller', 'Silva', 'Smith', 'Tanaka', 'Díaz', 'Martínez', 'Alves', 'Sánchez', 'Dubois', 'Pérez'];
      const realName = `${position === 'GK' ? 'Arq.' : position[0]}. ${lastNameSuffix[Math.floor(Math.random() * lastNameSuffix.length)]}`;
      
      const namePool = descriptiveNames[position];
      const name = `${namePool[Math.floor(Math.random() * namePool.length)]} ${numLabel}`;
      const styleOfPlay = `${randomSubPos} con un nivel físico destacable, prolijo pase en corto y excelente vocación para la táctica colectiva de ${countryName}.`;

      players.push({
        id: `${countryName.substring(0,3).toLowerCase()}-${i}`,
        name,
        realName,
        country: countryName,
        age,
        weight,
        height,
        dominantFoot: dominant as any,
        currentClub: club,
        rating,
        styleOfPlay,
        position,
        subPosition: randomSubPos,
        imageSeed: `${countryName.substring(0,2).toLowerCase()}-${position.toLowerCase()}-${i}`,
      });
    }
  }

  // Ensure sorting stays consistent: GK at starting, then DF, MF, FW
  return players.sort((a, b) => {
    const posOrder = { 'GK': 0, 'DF': 1, 'MF': 2, 'FW': 3 };
    if (posOrder[a.position] !== posOrder[b.position]) {
      return posOrder[a.position] - posOrder[b.position];
    }
    return b.rating - a.rating;
  });
}

// Complete World Cup 36-match Group Stage Calendar/Fixture from visual inputs
export const MATCH_FIXTURES: Match[] = [
  // Primera Jornada (11 al 17 de junio)
  { id: 'm-1', local: 'México', visitante: 'Sudáfrica', fecha: 'Jue 11/6, 13:00', grupo: 'Grupo A', jugado: true, marcadorReal: { golesLocal: 2, golesVisitante: 0 }, onceInicialReal: [] },
  { id: 'm-2', local: 'Corea del Sur', visitante: 'República Checa', fecha: 'Jue 11/6, 20:00', grupo: 'Grupo A', jugado: true, marcadorReal: { golesLocal: 2, golesVisitante: 1 }, onceInicialReal: [] },
  { id: 'm-3', local: 'Catar', visitante: 'Suiza', fecha: 'Sáb 13/6, 13:00', grupo: 'Grupo B', jugado: true, marcadorReal: { golesLocal: 1, golesVisitante: 1 }, onceInicialReal: [] },
  { id: 'm-4', local: 'Brasil', visitante: 'Marruecos', fecha: 'Sáb 13/6, 16:00', grupo: 'Grupo C', jugado: true, marcadorReal: { golesLocal: 1, golesVisitante: 1 }, onceInicialReal: [] },
  { id: 'm-5', local: 'Escocia', visitante: 'Haití', fecha: 'Sáb 13/6, 19:00', grupo: 'Grupo C', jugado: true, marcadorReal: { golesLocal: 1, golesVisitante: 0 }, onceInicialReal: [] },
  { id: 'm-6', local: 'Australia', visitante: 'Turquía', fecha: 'Sáb 13/6, 22:00', grupo: 'Grupo D', jugado: true, marcadorReal: { golesLocal: 2, golesVisitante: 0 }, onceInicialReal: [] },
  { id: 'm-7', local: 'Alemania', visitante: 'Curazao', fecha: 'Dom 14/6, 11:00', grupo: 'Grupo E', jugado: true, marcadorReal: { golesLocal: 7, golesVisitante: 1 }, onceInicialReal: [] },
  { id: 'm-8', local: 'Países Bajos', visitante: 'Japón', fecha: 'Dom 14/6, 14:00', grupo: 'Grupo F', jugado: true, marcadorReal: { golesLocal: 2, golesVisitante: 2 }, onceInicialReal: [] },
  { id: 'm-9', local: 'Costa de Marfil', visitante: 'Ecuador', fecha: 'Dom 14/6, 17:05', grupo: 'Grupo E', jugado: true, marcadorReal: { golesLocal: 1, golesVisitante: 0 }, onceInicialReal: [] },
  { id: 'm-10', local: 'Suecia', visitante: 'Túnez', fecha: 'Dom 14/6, 20:00', grupo: 'Grupo F', jugado: true, marcadorReal: { golesLocal: 5, golesVisitante: 1 }, onceInicialReal: [] },
  { id: 'm-11', local: 'España', visitante: 'Cabo Verde', fecha: 'Lun 15/6, 10:00', grupo: 'Grupo H', jugado: true, marcadorReal: { golesLocal: 0, golesVisitante: 0 }, onceInicialReal: [] },
  { id: 'm-12', local: 'Bélgica', visitante: 'Egipto', fecha: 'Lun 15/6, 13:00', grupo: 'Grupo G', jugado: true, marcadorReal: { golesLocal: 1, golesVisitante: 1 }, onceInicialReal: [] },
  { id: 'm-13', local: 'Arabia Saudita', visitante: 'Uruguay', fecha: 'Lun 15/6, 16:00', grupo: 'Grupo H', jugado: true, marcadorReal: { golesLocal: 1, golesVisitante: 1 }, onceInicialReal: [] },
  { id: 'm-14', local: 'Irán', visitante: 'Nueva Zelanda', fecha: 'Lun 15/6, 19:00', grupo: 'Grupo G', jugado: true, marcadorReal: { golesLocal: 2, golesVisitante: 2 }, onceInicialReal: [] },
  { id: 'm-15', local: 'Francia', visitante: 'Senegal', fecha: 'Mar 16/6, 13:00', grupo: 'Grupo I', jugado: true, marcadorReal: { golesLocal: 3, golesVisitante: 1 }, onceInicialReal: [] },
  { id: 'm-16', local: 'Noruega', visitante: 'Irak', fecha: 'Mar 16/6, 16:05', grupo: 'Grupo I', jugado: true, marcadorReal: { golesLocal: 4, golesVisitante: 1 }, onceInicialReal: [] },
  { id: 'm-17', local: 'Argentina', visitante: 'Argelia', fecha: 'Mar 16/6, 19:00', grupo: 'Grupo J', jugado: true, marcadorReal: { golesLocal: 3, golesVisitante: 0 }, onceInicialReal: [] },
  { id: 'm-18', local: 'Austria', visitante: 'Jordania', fecha: 'Mar 16/6, 22:00', grupo: 'Grupo J', jugado: true, marcadorReal: { golesLocal: 3, golesVisitante: 1 }, onceInicialReal: [] },
  { id: 'm-19', local: 'Portugal', visitante: 'RD Congo', fecha: 'Mié 17/6, 11:00', grupo: 'Grupo K', jugado: true, marcadorReal: { golesLocal: 1, golesVisitante: 1 }, onceInicialReal: [] },
  { id: 'm-20', local: 'Inglaterra', visitante: 'Croacia', fecha: 'Mié 17/6, 14:00', grupo: 'Grupo L', jugado: true, marcadorReal: { golesLocal: 4, golesVisitante: 2 }, onceInicialReal: [] },
  { id: 'm-21', local: 'Ghana', visitante: 'Panamá', fecha: 'Mié 17/6, 17:05', grupo: 'Grupo L', jugado: true, marcadorReal: { golesLocal: 1, golesVisitante: 0 }, onceInicialReal: [] },
  { id: 'm-22', local: 'Colombia', visitante: 'Uzbekistán', fecha: 'Mié 17/6, 20:00', grupo: 'Grupo K', jugado: true, marcadorReal: { golesLocal: 3, golesVisitante: 1 }, onceInicialReal: [] },

  // Segunda Jornada (18 al 21 de junio)
  { id: 'm-23', local: 'República Checa', visitante: 'Sudáfrica', fecha: 'Jue 18/6, 13:00', grupo: 'Grupo A', jugado: true, marcadorReal: { golesLocal: 1, golesVisitante: 1 }, onceInicialReal: [] },
  { id: 'm-24', local: 'Suiza', visitante: 'Bosnia y Herzegovina', fecha: 'Jue 18/6, 16:00', grupo: 'Grupo B', jugado: true, marcadorReal: { golesLocal: 4, golesVisitante: 1 }, onceInicialReal: [] },
  { id: 'm-25', local: 'Canadá', visitante: 'Catar', fecha: 'Jue 18/6, 19:00', grupo: 'Grupo B', jugado: true, marcadorReal: { golesLocal: 6, golesVisitante: 0 }, onceInicialReal: [] },
  { id: 'm-26', local: 'México', visitante: 'Corea del Sur', fecha: 'Jue 18/6, 22:00', grupo: 'Grupo A', jugado: true, marcadorReal: { golesLocal: 1, golesVisitante: 0 }, onceInicialReal: [] },
  { id: 'm-27', local: 'España', visitante: 'Arabia Saudita', fecha: 'Dom 21/6, 11:00', grupo: 'Grupo H', jugado: true, marcadorReal: { golesLocal: 4, golesVisitante: 0 }, onceInicialReal: [] },
  { id: 'm-28', local: 'Bélgica', visitante: 'Irán', fecha: 'Dom 21/6, 14:00', grupo: 'Grupo G', jugado: true, marcadorReal: { golesLocal: 0, golesVisitante: 0 }, onceInicialReal: [] },
  { id: 'm-29', local: 'Uruguay', visitante: 'Cabo Verde', fecha: 'Dom 21/6, 17:00', grupo: 'Grupo H', jugado: true, marcadorReal: { golesLocal: 2, golesVisitante: 2 }, onceInicialReal: [] },
  { id: 'm-30', local: 'Egipto', visitante: 'Nueva Zelanda', fecha: 'Dom 21/6, 20:00', grupo: 'Grupo G', jugado: true, marcadorReal: { golesLocal: 3, golesVisitante: 1 }, onceInicialReal: [] },

  // Cierre de Grupos (24 al 27 de junio)
  { id: 'm-31', local: 'Suiza', visitante: 'Canadá', fecha: 'Mié 24/6, 10:00', grupo: 'Grupo B', jugado: true, marcadorReal: { golesLocal: 2, golesVisitante: 1 }, onceInicialReal: [] },
  { id: 'm-32', local: 'Bosnia y Herzegovina', visitante: 'Catar', fecha: 'Mié 24/6, 12:00', grupo: 'Grupo B', jugado: true, marcadorReal: { golesLocal: 3, golesVisitante: 1 }, onceInicialReal: [] },
  { id: 'm-33', local: 'Brasil', visitante: 'Escocia', fecha: 'Mié 24/6, 14:00', grupo: 'Grupo C', jugado: true, marcadorReal: { golesLocal: 3, golesVisitante: 0 }, onceInicialReal: [] },
  { id: 'm-34', local: 'Marruecos', visitante: 'Haití', fecha: 'Mié 24/6, 16:00', grupo: 'Grupo C', jugado: true, marcadorReal: { golesLocal: 4, golesVisitante: 2 }, onceInicialReal: [] },
  { id: 'm-35', local: 'México', visitante: 'República Checa', fecha: 'Mié 24/6, 18:00', grupo: 'Grupo A', jugado: true, marcadorReal: { golesLocal: 3, golesVisitante: 0 }, onceInicialReal: [] },
  { id: 'm-36', local: 'Sudáfrica', visitante: 'Corea del Sur', fecha: 'Mié 24/6, 20:00', grupo: 'Grupo A', jugado: true, marcadorReal: { golesLocal: 1, golesVisitante: 0 }, onceInicialReal: [] },
  { id: 'm-37', local: 'Ecuador', visitante: 'Alemania', fecha: 'Jue 25/6, 10:00', grupo: 'Grupo E', jugado: true, marcadorReal: { golesLocal: 2, golesVisitante: 1 }, onceInicialReal: [] },
  { id: 'm-38', local: 'Curazao', visitante: 'Costa de Marfil', fecha: 'Jue 25/6, 12:00', grupo: 'Grupo E', jugado: true, marcadorReal: { golesLocal: 0, golesVisitante: 2 }, onceInicialReal: [] },
  { id: 'm-39', local: 'Japón', visitante: 'Suecia', fecha: 'Jue 25/6, 14:00', grupo: 'Grupo F', jugado: true, marcadorReal: { golesLocal: 1, golesVisitante: 1 }, onceInicialReal: [] },
  { id: 'm-40', local: 'Túnez', visitante: 'Países Bajos', fecha: 'Jue 25/6, 16:00', grupo: 'Grupo F', jugado: true, marcadorReal: { golesLocal: 1, golesVisitante: 3 }, onceInicialReal: [] },
  { id: 'm-41', local: 'Turquía', visitante: 'Estados Unidos', fecha: 'Jue 25/6, 18:00', grupo: 'Grupo D', jugado: true, marcadorReal: { golesLocal: 3, golesVisitante: 2 }, onceInicialReal: [] },
  { id: 'm-42', local: 'Paraguay', visitante: 'Australia', fecha: 'Jue 25/6, 20:00', grupo: 'Grupo D', jugado: true, marcadorReal: { golesLocal: 0, golesVisitante: 0 }, onceInicialReal: [] },
  { id: 'm-43', local: 'Noruega', visitante: 'Francia', fecha: 'Vie 26/6, 10:00', grupo: 'Grupo I', jugado: true, marcadorReal: { golesLocal: 1, golesVisitante: 4 }, onceInicialReal: [] },
  { id: 'm-44', local: 'Senegal', visitante: 'Irak', fecha: 'Vie 26/6, 12:00', grupo: 'Grupo I', jugado: true, marcadorReal: { golesLocal: 5, golesVisitante: 0 }, onceInicialReal: [] },
  { id: 'm-45', local: 'España', visitante: 'Uruguay', fecha: 'Vie 26/6, 14:00', grupo: 'Grupo H', jugado: true, marcadorReal: { golesLocal: 1, golesVisitante: 0 }, onceInicialReal: [] },
  { id: 'm-46', local: 'Cabo Verde', visitante: 'Arabia Saudita', fecha: 'Vie 26/6, 16:00', grupo: 'Grupo H', jugado: true, marcadorReal: { golesLocal: 0, golesVisitante: 0 }, onceInicialReal: [] },
  { id: 'm-47', local: 'Bélgica', visitante: 'Nueva Zelanda', fecha: 'Vie 26/6, 18:00', grupo: 'Grupo G', jugado: true, marcadorReal: { golesLocal: 5, golesVisitante: 1 }, onceInicialReal: [] },
  { id: 'm-48', local: 'Egipto', visitante: 'Irán', fecha: 'Vie 26/6, 20:00', grupo: 'Grupo G', jugado: true, marcadorReal: { golesLocal: 1, golesVisitante: 1 }, onceInicialReal: [] },
  { id: 'm-49', local: 'Panamá', visitante: 'Inglaterra', fecha: 'Sáb 27/6, 10:00', grupo: 'Grupo L', jugado: true, marcadorReal: { golesLocal: 0, golesVisitante: 2 }, onceInicialReal: [] },
  { id: 'm-50', local: 'Croacia', visitante: 'Ghana', fecha: 'Sáb 27/6, 12:00', grupo: 'Grupo L', jugado: true, marcadorReal: { golesLocal: 2, golesVisitante: 1 }, onceInicialReal: [] },
  { id: 'm-51', local: 'Colombia', visitante: 'Portugal', fecha: 'Sáb 27/6, 14:00', grupo: 'Grupo K', jugado: true, marcadorReal: { golesLocal: 0, golesVisitante: 0 }, onceInicialReal: [] },
  { id: 'm-52', local: 'RD Congo', visitante: 'Uzbekistán', fecha: 'Sáb 27/6, 16:00', grupo: 'Grupo K', jugado: true, marcadorReal: { golesLocal: 3, golesVisitante: 1 }, onceInicialReal: [] },
  { id: 'm-53', local: 'Argentina', visitante: 'Jordania', fecha: 'Sáb 27/6, 18:00', grupo: 'Grupo J', jugado: true, marcadorReal: { golesLocal: 3, golesVisitante: 1 }, onceInicialReal: [] },
  { id: 'm-54', local: 'Argelia', visitante: 'Austria', fecha: 'Sáb 27/6, 20:00', grupo: 'Grupo J', jugado: true, marcadorReal: { golesLocal: 3, golesVisitante: 3 }, onceInicialReal: [] }
];

// Complete World Cup 16th-finals (Dieciseisavos de Final) Calendar
export const KNOCKOUT_FIXTURES: Match[] = [
  {
    id: 'ko-1',
    local: 'Sudáfrica',
    visitante: 'Canadá',
    fecha: '28 de junio',
    grupo: 'Dieciseisavos de Final',
    onceInicialReal: [],
    jugado: false,
    equipo_local: 'Sudáfrica',
    equipo_visitante: 'Canadá',
    hora_ect: '14:00 ECT',
    estadio: 'Los Angeles Stadium',
    fase: 'Dieciseisavos de Final'
  },
  {
    id: 'ko-2',
    local: 'Brasil',
    visitante: 'Japón',
    fecha: '29 de junio',
    grupo: 'Dieciseisavos de Final',
    onceInicialReal: [],
    jugado: false,
    equipo_local: 'Brasil',
    equipo_visitante: 'Japón',
    hora_ect: '12:00 ECT',
    estadio: 'Houston Stadium',
    fase: 'Dieciseisavos de Final'
  },
  {
    id: 'ko-3',
    local: 'Alemania',
    visitante: 'Paraguay',
    fecha: '29 de junio',
    grupo: 'Dieciseisavos de Final',
    onceInicialReal: [],
    jugado: false,
    equipo_local: 'Alemania',
    equipo_visitante: 'Paraguay',
    hora_ect: '15:30 ECT',
    estadio: 'Boston Stadium',
    fase: 'Dieciseisavos de Final'
  },
  {
    id: 'ko-4',
    local: 'Países Bajos',
    visitante: 'Marruecos',
    fecha: '29 de junio',
    grupo: 'Dieciseisavos de Final',
    onceInicialReal: [],
    jugado: false,
    equipo_local: 'Países Bajos',
    equipo_visitante: 'Marruecos',
    hora_ect: '20:00 ECT',
    estadio: 'Monterrey Stadium',
    fase: 'Dieciseisavos de Final'
  },
  {
    id: 'ko-5',
    local: 'Costa de Marfil',
    visitante: 'Noruega',
    fecha: '30 de junio',
    grupo: 'Dieciseisavos de Final',
    onceInicialReal: [],
    jugado: false,
    equipo_local: 'Costa de Marfil',
    equipo_visitante: 'Noruega',
    hora_ect: '12:00 ECT',
    estadio: 'Dallas Stadium',
    fase: 'Dieciseisavos de Final'
  },
  {
    id: 'ko-6',
    local: 'Francia',
    visitante: 'Suecia',
    fecha: '30 de junio',
    grupo: 'Dieciseisavos de Final',
    onceInicialReal: [],
    jugado: false,
    equipo_local: 'Francia',
    equipo_visitante: 'Suecia',
    hora_ect: '16:00 ECT',
    estadio: 'New York New Jersey Stadium',
    fase: 'Dieciseisavos de Final'
  },
  {
    id: 'ko-7',
    local: 'México',
    visitante: 'Ecuador',
    fecha: '30 de junio',
    grupo: 'Dieciseisavos de Final',
    onceInicialReal: [],
    jugado: false,
    equipo_local: 'México',
    equipo_visitante: 'Ecuador',
    hora_ect: '20:00 ECT',
    estadio: 'Mexico City Stadium',
    fase: 'Dieciseisavos de Final'
  },
  {
    id: 'ko-8',
    local: 'Inglaterra',
    visitante: 'RD Congo',
    fecha: '1 de julio',
    grupo: 'Dieciseisavos de Final',
    onceInicialReal: [],
    jugado: false,
    equipo_local: 'Inglaterra',
    equipo_visitante: 'RD Congo',
    hora_ect: '11:00 ECT',
    estadio: 'Atlanta Stadium',
    fase: 'Dieciseisavos de Final'
  },
  {
    id: 'ko-9',
    local: 'Estados Unidos',
    visitante: 'Bosnia y Herzegovina',
    fecha: '1 de julio',
    grupo: 'Dieciseisavos de Final',
    onceInicialReal: [],
    jugado: false,
    equipo_local: 'Estados Unidos',
    equipo_visitante: 'Bosnia y Herzegovina',
    hora_ect: 'Por definir',
    estadio: 'San Francisco Bay Area Stadium',
    fase: 'Dieciseisavos de Final'
  },
  {
    id: 'ko-10',
    local: 'Bélgica',
    visitante: 'Senegal',
    fecha: '1 de julio',
    grupo: 'Dieciseisavos de Final',
    onceInicialReal: [],
    jugado: false,
    equipo_local: 'Bélgica',
    equipo_visitante: 'Senegal',
    hora_ect: 'Por definir',
    estadio: 'Seattle Stadium',
    fase: 'Dieciseisavos de Final'
  },
  {
    id: 'ko-11',
    local: 'Portugal',
    visitante: 'Croacia',
    fecha: '2 de julio',
    grupo: 'Dieciseisavos de Final',
    onceInicialReal: [],
    jugado: false,
    equipo_local: 'Portugal',
    equipo_visitante: 'Croacia',
    hora_ect: 'Por definir',
    estadio: 'Toronto Stadium',
    fase: 'Dieciseisavos de Final'
  },
  {
    id: 'ko-12',
    local: 'España',
    visitante: 'Austria',
    fecha: '2 de julio',
    grupo: 'Dieciseisavos de Final',
    onceInicialReal: [],
    jugado: false,
    equipo_local: 'España',
    equipo_visitante: 'Austria',
    hora_ect: 'Por definir',
    estadio: 'Los Angeles Stadium',
    fase: 'Dieciseisavos de Final'
  },
  {
    id: 'ko-13',
    local: 'Suiza',
    visitante: 'Argelia',
    fecha: '2 de julio',
    grupo: 'Dieciseisavos de Final',
    onceInicialReal: [],
    jugado: false,
    equipo_local: 'Suiza',
    equipo_visitante: 'Argelia',
    hora_ect: 'Por definir',
    estadio: 'BC Place Vancouver',
    fase: 'Dieciseisavos de Final'
  },
  {
    id: 'ko-14',
    local: 'Argentina',
    visitante: 'Cabo Verde',
    fecha: '3 de julio',
    grupo: 'Dieciseisavos de Final',
    onceInicialReal: [],
    jugado: false,
    equipo_local: 'Argentina',
    equipo_visitante: 'Cabo Verde',
    hora_ect: 'Por definir',
    estadio: 'Miami Stadium',
    fase: 'Dieciseisavos de Final'
  },
  {
    id: 'ko-15',
    local: 'Colombia',
    visitante: 'Ghana',
    fecha: '3 de julio',
    grupo: 'Dieciseisavos de Final',
    onceInicialReal: [],
    jugado: false,
    equipo_local: 'Colombia',
    equipo_visitante: 'Ghana',
    hora_ect: 'Por definir',
    estadio: 'Kansas City Stadium',
    fase: 'Dieciseisavos de Final'
  },
  {
    id: 'ko-16',
    local: 'Australia',
    visitante: 'Egipto',
    fecha: '3 de julio',
    grupo: 'Dieciseisavos de Final',
    onceInicialReal: [],
    jugado: false,
    equipo_local: 'Australia',
    equipo_visitante: 'Egipto',
    hora_ect: 'Por definir',
    estadio: 'Dallas Stadium',
    fase: 'Dieciseisavos de Final'
  }
];

// Generates correct Fútbol Internacional match information and onceInicial for the matches
export function getPopulatedMatch(country: string, playersOfCountry: Player[]): Match {
  // Find real match containing country
  const bases = MATCH_FIXTURES.find(m => m.local === country || m.visitante === country) || {
    id: `match-gen-${country.substring(0,3).toLowerCase()}`,
    local: country,
    visitante: 'Uruguay',
    fecha: '20 de Junio, 19:30',
    grupo: 'Fase de Grupos',
    marcadorReal: { golesLocal: 2, golesVisitante: 0 },
    onceInicialReal: [],
    jugado: true
  };

  // Pre-seed matching players automatically from their generated players
  const onceIds: string[] = [];
  // Take the highest rating players of the proper position!
  // 1 GK, 4 DF, 3 MF, 3 FW
  const gk = playersOfCountry.filter(p => p.position === 'GK').slice(0, 1);
  const dfs = playersOfCountry.filter(p => p.position === 'DF').slice(0, 4);
  const mfs = playersOfCountry.filter(p => p.position === 'MF').slice(0, 3);
  const fws = playersOfCountry.filter(p => p.position === 'FW').slice(0, 3);
  
  [...gk, ...dfs, ...mfs, ...fws].forEach(p => onceIds.push(p.id));

  return {
    ...bases,
    onceInicialReal: onceIds
  };
}

// Initial Leaderboard list
export const INITIAL_LEADERBOARD: LeaderboardEntry[] = [
  { username: 'ProfeBielsa_Fans', score: 28, aciertosOnce: 18, aciertosMarcador: 2, avatar: '⚽' },
  { username: 'MisterTactico90', score: 24, aciertosOnce: 14, aciertosMarcador: 2, avatar: '🧠' },
  { username: 'EspiaScoutElite', score: 21, aciertosOnce: 16, aciertosMarcador: 1, avatar: '🕵️‍♂️' },
  { username: 'TacticoSolitaire', score: 18, aciertosOnce: 13, aciertosMarcador: 1, avatar: '🌍' },
  { username: 'AncelottiStyle', score: 15, aciertosOnce: 10, aciertosMarcador: 1, avatar: '🍷' }
];
