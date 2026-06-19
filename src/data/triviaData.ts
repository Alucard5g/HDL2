export interface Question {
  id: number;
  pregunta: string;
  opciones: string[];
  correcta: string;
}

export interface CountryTrivia {
  [level: number]: Question[];
}

export const PREGENERATED_TRIVIA: { [countryName: string]: CountryTrivia } = {
  "México": {
    1: [
      {
        id: 1,
        pregunta: "¿Qué apodo recibe cariñosamente la selección nacional de fútbol de México?",
        opciones: ["La Roja", "El Tri (o Tricolor)", "La Celeste", "La Verdeamarela"],
        correcta: "El Tri (o Tricolor)"
      },
      {
        id: 2,
        pregunta: "¿Cuál es el color distintivo histórico de la camiseta local de la selección mexicana?",
        opciones: ["Verde", "Azul", "Amarillo", "Rojo"],
        correcta: "Verde"
      },
      {
        id: 3,
        pregunta: "¿En qué estadio histórico de México se jugaron las finales de los Torneos de Selecciones de 1970 y 1986?",
        opciones: ["Estadio BBVA", "Estadio Akron", "Estadio Azteca", "Estadio Olímpico Universitario"],
        correcta: "Estadio Azteca"
      },
      {
        id: 4,
        pregunta: "¿Cuántas veces ha sido México anfitrión de una Copa de Selecciones masculina antes de la edición de 2026?",
        opciones: ["Ninguna", "Una vez", "Dos veces (1970 y 1986)"],
        correcta: "Dos veces (1970 y 1986)"
      },
      {
        id: 5,
        pregunta: "¿Cuál es el apodo tradicional y más conocido de la selección mexicana?",
        opciones: ["La Albiceleste", "El Tri", "La Furia Roja"],
        correcta: "El Tri"
      },
      {
        id: 6,
        pregunta: "¿Qué jugador es el máximo goleador histórico de la selección de México?",
        opciones: ["Hugo Sánchez", "Javier \"Chicharito\" Hernández", "Cuauhtémoc Blanco"],
        correcta: "Javier \"Chicharito\" Hernández"
      }
    ],
    2: [
      {
        id: 1,
        pregunta: "¿Quién es el legendario defensor mexicano apodado 'El Káiser de Michoacán' que anotó en múltiples torneos de selecciones?",
        opciones: ["Hugo Sánchez", "Rafael Márquez", "Jared Borgetti", "Cuauhtémoc Blanco"],
        correcta: "Rafael Márquez"
      },
      {
        id: 2,
        pregunta: "¿Qué portero mexicano, famoso por sus uniformes coloridos, brilló en el Torneo de EE.UU. 1994?",
        opciones: ["Guillermo Ochoa", "Jorge Campos", "Jesús Corona", "Oswaldo Sánchez"],
        correcta: "Jorge Campos"
      },
      {
        id: 3,
        pregunta: "¿Contra qué campeona defensora logró México una victoria histórica de 1-0 en el Torneo de Rusia 2018?",
        opciones: ["Francia", "Alemania", "Argentina", "Brasil"],
        correcta: "Alemania"
      },
      {
        id: 4,
        pregunta: "¿Hasta qué instancia llegó México en los torneos de selecciones que organizó en su propio país (1970 y 1986)?",
        opciones: ["Octavos de final", "Cuartos de final", "Semifinales"],
        correcta: "Cuartos de final"
      },
      {
        id: 5,
        pregunta: "¿A qué campeona del mundo venció México en su histórico debut en el Torneo de Rusia 2018?",
        opciones: ["Alemania", "Brasil", "Italia"],
        correcta: "Alemania"
      },
      {
        id: 6,
        pregunta: "¿Quién anotó el famoso gol de tijera contra Bulgaria en el Torneo de México 1986, considerado uno de los más bellos del torneo?",
        opciones: ["Manuel Negrete", "Hugo Sánchez", "Luis Hernández"],
        correcta: "Manuel Negrete"
      }
    ],
    3: [
      {
        id: 1,
        pregunta: "¿Qué histórico delantero de México anotó un gol antológico 'de tres dedos' de cabeza picado a Italia en el Torneo de 2002?",
        opciones: ["Jared Borgetti", "Luis Hernández", "Cuauhtémoc Blanco", "Hugo Sánchez"],
        correcta: "Jared Borgetti"
      },
      {
        id: 2,
        pregunta: "¿Quién es el máximo goleador histórico de la selección mexicana en Copas del Mundo, empatado con 4 goles?",
        opciones: ["Javier 'Chicharito' Hernández y Luis Hernández", "Hugo Sánchez y Oribe Peralta", "Rafael Márquez y Andrés Guardado", "Cuauhtémoc Blanco y Jared Borgetti"],
        correcta: "Javier 'Chicharito' Hernández y Luis Hernández"
      },
      {
        id: 3,
        pregunta: "¿A qué país venció México en la histórica final de la Copa Confederaciones de 1999 celebrada en el Estadio Azteca?",
        opciones: ["Francia", "Alemania", "Brasil", "Italia"],
        correcta: "Brasil"
      },
      {
        id: 4,
        pregunta: "¿Quién es el único jugador mexicano en anotar en tres torneos de selecciones distintos de manera consecutiva?",
        opciones: ["Rafael Márquez", "Cuauhtémoc Blanco", "Jared Borgetti"],
        correcta: "Rafael Márquez"
      },
      {
        id: 5,
        pregunta: "¿Contra qué país consiguió México su primera victoria en la historia de las Copas del Mundo (Suecia 1958)?",
        opciones: ["Checoslovaquia", "Gales", "Francia"],
        correcta: "Checoslovaquia"
      },
      {
        id: 6,
        pregunta: "¿Qué legendario arquero mexicano ostentó primero el récord de torneo de participar en 5 Copas del Mundo consecutivas?",
        opciones: ["Antonio Carbajal", "Guillermo Ochoa", "Jorge Campos"],
        correcta: "Antonio Carbajal"
      }
    ]
  },
  "Sudáfrica": {
    1: [
      {
        id: 1,
        pregunta: "¿Cuál es el famoso apodo oficial de la selección de Sudáfrica?",
        opciones: ["Super Águilas", "Bafana Bafana", "Estrellas Negras", "Leones de la Teranga"],
        correcta: "Bafana Bafana"
      },
      {
        id: 2,
        pregunta: "¿Qué ruidoso instrumento plástico de viento fue el máximo protagonista sonoro de Sudáfrica 2010?",
        opciones: ["La Gaita", "La Vuvuzela", "La Corneta", "El Tambor"],
        correcta: "La Vuvuzela"
      },
      {
        id: 3,
        pregunta: "¿Qué colores predominan en la camiseta local de la selección de Sudáfrica?",
        opciones: ["Azul y Blanco", "Amarillo y Verde", "Rojo y Negro", "Celeste y Blanco"],
        correcta: "Amarillo y Verde"
      }
    ],
    2: [
      {
        id: 1,
        pregunta: "¿Quién anotó el icónico primer gol del Torneo de Sudáfrica 2010 en el partido de inauguración ante México?",
        opciones: ["Steven Pienaar", "Siphiwe Tshabalala", "Katlego Mphela", "Benni McCarthy"],
        correcta: "Siphiwe Tshabalala"
      },
      {
        id: 2,
        pregunta: "¿Quién es el máximo goleador histórico e indiscutido icono goleador de la selección sudafricana?",
        opciones: ["Steven Pienaar", "Benni McCarthy", "Shaun Bartlett", "Lucas Radebe"],
        correcta: "Benni McCarthy"
      },
      {
        id: 3,
        pregunta: "¿Cuál fue el resultado obtenido por Sudáfrica en su debut de torneoista absoluto frente a Francia en 1998?",
        opciones: ["Derrota 3-0", "Empate 0-0", "Victoria 1-0", "Derrota 1-0"],
        correcta: "Derrota 3-0"
      }
    ],
    3: [
      {
        id: 1,
        pregunta: "¿Qué célebre defensor de la Premier League y líder sudafricano fue elogiado personalmente por Nelson Mandela?",
        opciones: ["Lucas Radebe", "Aaron Mokoena", "Mark Fish", "Steven Pienaar"],
        correcta: "Lucas Radebe"
      },
      {
        id: 2,
        pregunta: "¿A qué ex campeón de torneo derrotó Sudáfrica en la última jornada de la fase de grupos del Torneo de 2010?",
        opciones: ["Francia", "Uruguay", "Italia", "España"],
        correcta: "Francia"
      },
      {
        id: 3,
        pregunta: "¿Qué técnico brasileño dirigió a los Bafana Bafana durante el Torneo de Sudáfrica 2010?",
        opciones: ["Dunga", "Carlos Alberto Parreira", "Luiz Felipe Scolari", "Zico"],
        correcta: "Carlos Alberto Parreira"
      }
    ]
  },
  "Corea del Sur": {
    1: [
      {
        id: 1,
        pregunta: "¿Qué temible depredador es el símbolo oficial y apodo de la selección de Corea del Sur?",
        opciones: ["Los Leones", "Los Tigres de Asia (o Guerreros Taeguk)", "Los Dragones", "Los Halcones"],
        correcta: "Los Tigres de Asia (o Guerreros Taeguk)"
      },
      {
        id: 2,
        pregunta: "¿En qué histórico de torneo fue Corea del Sur co-anfitrión junto a Japón, logrando las semifinales?",
        opciones: ["Corea/Japón 2002", "Francia 1998", "Alemania 2006", "Catar 2022"],
        correcta: "Corea/Japón 2002"
      },
      {
        id: 3,
        pregunta: "¿Cuál es la estrella surcoreana actual que brilla en el Tottenham de Inglaterra y usa máscara protectora?",
        opciones: ["Son Heung-min", "Park Ji-sung", "Hwang Hee-chan", "Kim Min-jae"],
        correcta: "Son Heung-min"
      }
    ],
    2: [
      {
        id: 1,
        pregunta: "¿Qué legendario entrenador neerlandés guió a la epopeya de semifinales a Corea del Sur en 2002?",
        opciones: ["Louis van Gaal", "Guus Hiddink", "Dick Advocaat", "Leo Beenhakker"],
        correcta: "Guus Hiddink"
      },
      {
        id: 2,
        pregunta: "¿Qué veloz mediocampista surcoreano brilló durante años en el Manchester United de Alex Ferguson?",
        opciones: ["Park Ji-sung", "Lee Chun-soo", "Ahn Jung-hwan", "Seol Ki-hyeon"],
        correcta: "Park Ji-sung"
      },
      {
        id: 3,
        pregunta: "¿Qué campeón del mundo defensor cayó eliminado ante el milagro de Corea del Sur en Rusia 2018 (0-2)?",
        opciones: ["Alemania", "España", "Italia", "Francia"],
        correcta: "Alemania"
      }
    ],
    3: [
      {
        id: 1,
        pregunta: "¿Qué jugador surcoreano anotó el famoso 'Gol de Oro' de cabeza con el cual eliminaron a Italia en los octavos de 2002?",
        opciones: ["Park Ji-sung", "Ahn Jung-hwan", "Seol Ki-hyeon", "Lee Young-pyo"],
        correcta: "Ahn Jung-hwan"
      },
      {
        id: 2,
        pregunta: "¿Quién es el máximo anotador de Corea del Sur en fases finales torneos de selecciones con 3 goles, récord compartido?",
        opciones: ["Park Ji-sung, Son Heung-min y Ahn Jung-hwan", "Cha Bum-kun y Son Heung-min", "Park Ji-sung y Hwang Hee-chan", "Seol Ki-hyeon y Cho Gue-sung"],
        correcta: "Park Ji-sung, Son Heung-min y Ahn Jung-hwan"
      },
      {
        id: 3,
        pregunta: "¿A qué selección sudamericana eliminó de la clasificación Corea del Sur en fase de grupos de Catar 2022 gracias a un contragolpe rápido?",
        opciones: ["Uruguay", "Ecuador", "Paraguay", "Colombia"],
        correcta: "Uruguay"
      }
    ]
  },
  "República Checa": {
    1: [
      {
        id: 1,
        pregunta: "¿Antes de su disolución en los años 90, bajo qué nombre unificado competía República Checa en torneos de selecciones?",
        opciones: ["Unión Soviética", "Yugoslavia", "Checoslovaquia", "Bohemia"],
        correcta: "Checoslovaquia"
      },
      {
        id: 2,
        pregunta: "¿Qué icónico guardameta de casco protector y leyenda de la Premier League representó a los checos?",
        opciones: ["Petr Cech", "Pavel Nedved", "Tomas Rosicky", "Milan Baros"],
        correcta: "Petr Cech"
      },
      {
        id: 3,
        pregunta: "¿Cuál es el color tradicional de la indumentaria local de República Checa?",
        opciones: ["Azul", "Blanco", "Rojo", "Verde"],
        correcta: "Rojo"
      }
    ],
    2: [
      {
        id: 1,
        pregunta: "¿Qué Balón de Oro y centrocampista checo destacó por su espectacular despliegue en la Juventus y la selección?",
        opciones: ["Pavel Nedved", "Tomas Rosicky", "Milan Baros", "Jan Koller"],
        correcta: "Pavel Nedved"
      },
      {
        id: 2,
        pregunta: "¿Quién es el gigantón delantero centro y máximo anotador histórico de la selección checa?",
        opciones: ["Milan Baros", "Jan Koller", "Patrik Schick", "Tomas Necid"],
        correcta: "Jan Koller"
      },
      {
        id: 3,
        pregunta: "¿A qué gran final de la Eurocopa accedió de forma sorprendente la República Checa en el año 1996?",
        opciones: ["Final contra Alemania", "Final contra España", "Final contra Inglaterra", "Final contra Francia"],
        correcta: "Final contra Alemania"
      }
    ],
    3: [
      {
        id: 1,
        pregunta: "Checoslovaquia disputó dos finales de Copa de Selecciones. ¿Cuáles fueron?",
        opciones: ["Uruguay 1930 e Italia 1934", "Italia 1934 y Chile 1962", "Suiza 1954 y Suecia 1958", "Chile 1962 y Alemania 1974"],
        correcta: "Italia 1934 y Chile 1962"
      },
      {
        id: 2,
        pregunta: "¿Qué célebre jugador checoslovaco patentó la definición por penaltis picándola por el centro en el año 1976?",
        opciones: ["Antonin Panenka", "Ivo Viktor", "Zdenek Nehoda", "Anton Ondrus"],
        correcta: "Antonin Panenka"
      },
      {
        id: 3,
        pregunta: "¿Quién era el virtuoso centrocampista apodado 'El Pequeño Mozart' de la República Checa en los torneos de selecciones de la década del 2000?",
        opciones: ["Tomas Rosicky", "Pavel Nedved", "Karel Poborsky", "Jaroslav Plasil"],
        correcta: "Tomas Rosicky"
      }
    ]
  },
  "Canadá": {
    1: [
      {
        id: 1,
        pregunta: "¿Cuál es la hoja de árbol característica de la bandera y escudo de la selección de Canadá?",
        opciones: ["Hoja de Roble", "Hoja de Arce (Maple Leaf)", "Hoja de Pino", "Hoja de Helecho"],
        correcta: "Hoja de Arce (Maple Leaf)"
      },
      {
        id: 2,
        pregunta: "¿En qué Copa de Selecciones reciente compitió Canadá tras 36 años de ausencia?",
        opciones: ["Rusia 2018", "Catar 2022", "Sudáfrica 2010", "Brasil 2014"],
        correcta: "Catar 2022"
      },
      {
        id: 3,
        pregunta: "¿Qué jugador canadiense es estrella de torneo en el Bayern Múnich por su tremenda aceleración y velocidad por la banda lateral?",
        opciones: ["Cyle Larin", "Jonathan David", "Alphonso Davies", "Tajon Buchanan"],
        correcta: "Alphonso Davies"
      },
      {
        id: 4,
        pregunta: "¿Cuántos Torneos de Selecciones masculinos había jugado Canadá en toda su historia antes de disputar el certamen de 2026?",
        opciones: ["Ninguno", "Dos (1986 y 2022)", "Cinco"],
        correcta: "Dos (1986 y 2022)"
      },
      {
        id: 5,
        pregunta: "¿Quién es la máxima estrella internacional actual de Canadá y figura del Bayern Múnich?",
        opciones: ["Alphonso Davies", "Jonathan David", "Cyle Larin"],
        correcta: "Alphonso Davies"
      },
      {
        id: 6,
        pregunta: "¿Cuál es el color principal de la equipación titular de la selección canadiense?",
        opciones: ["Azul", "Rojo", "Blanco"],
        correcta: "Rojo"
      }
    ],
    2: [
      {
        id: 1,
        pregunta: "¿Quién marcó el histórico, primer y único gol de Canadá en su historia en fases de grupos torneos de selecciones (en Catar 2022)?",
        opciones: ["Jonathan David", "Alphonso Davies", "Cyle Larin", "Atiba Hutchinson"],
        correcta: "Alphonso Davies"
      },
      {
        id: 2,
        pregunta: "¿En qué país y de torneo disputó Canadá su debut absoluto de torneoista de la historia?",
        opciones: ["México 1986", "EE.UU. 1994", "Francia 1998", "España 1982"],
        correcta: "México 1986"
      },
      {
        id: 3,
        pregunta: "¿Cuál es el prolífico club europeo donde milita el delantero estrella de Canadá Jonathan David?",
        opciones: ["Lille OSC", "Bayern Múnich", "Inter de Milán", "FC Porto"],
        correcta: "Lille OSC"
      },
      {
        id: 4,
        pregunta: "¿Quién anotó el primer gol de Canadá en la historia de los Torneos de Selecciones masculinos (en Qatar 2022)?",
        opciones: ["Atiba Hutchinson", "Alphonso Davies", "Jonathan David"],
        correcta: "Alphonso Davies"
      },
      {
        id: 5,
        pregunta: "¿Contra qué potencia europea debutó Canadá en su primera Copa de Selecciones en México 1986?",
        opciones: ["Francia", "Hungría", "Unión Soviética"],
        correcta: "Francia"
      },
      {
        id: 6,
        pregunta: "¿En qué importante ciudad canadiense se localiza el estadio BC Place, sede del torneo actual?",
        opciones: ["Toronto", "Vancouver", "Montreal"],
        correcta: "Vancouver"
      }
    ],
    3: [
      {
        id: 1,
        pregunta: "¿Quién es el máximo anotador histórico absoluto de la selección de fútbol de Canadá?",
        opciones: ["Cyle Larin", "Jonathan David", "Alphonso Davies", "Dwayne De Rosario"],
        correcta: "Cyle Larin"
      },
      {
        id: 2,
        pregunta: "¿Qué histórico mediocampista de corte defensivo capitaneó largamente a Canadá y se retiró con más de 100 internacionalidades?",
        opciones: ["Atiba Hutchinson", "Jonathan Osorio", "Samuel Piette", "Junior Hoilett"],
        correcta: "Atiba Hutchinson"
      },
      {
        id: 3,
        pregunta: "¿De qué prestigioso torneo de selecciones continentales se coronó campeón Canadá en el año 2000 de forma sorprendente?",
        opciones: ["Copa de Naciones de la OFC", "Copa Oro de la Concacaf", "Copa América", "Copa de Naciones del Caribe"],
        correcta: "Copa Oro de la Concacaf"
      },
      {
        id: 4,
        pregunta: "¿Quién fue el director técnico que logró clasificar a Canadá a su segundo Torneo en la historia tras 36 años de ausencia?",
        opciones: ["John Herdman", "Jesse Marsch", "Benito Floro"],
        correcta: "John Herdman"
      },
      {
        id: 5,
        pregunta: "¿Qué país derrotó a Canadá 2-0 en su último partido de grupo en México 1986, dejándolos con cero puntos?",
        opciones: ["Unión Soviética", "Hungría", "Francia"],
        correcta: "Unión Soviética"
      },
      {
        id: 6,
        pregunta: "¿A qué confederación continental pertenece Canadá dentro del entramado del fútbol internacional?",
        opciones: ["CONMEBOL", "CONCACAF", "OFC"],
        correcta: "CONCACAF"
      }
    ]
  },
  "Bosnia y Herzegovina": {
    1: [
      {
        id: 1,
        pregunta: "¿En qué región geográfica de Europa está ubicada la nación de Bosnia y Herzegovina?",
        opciones: ["Península Ibérica", "Región de Escandinavia", "Península de los Balcanes", "Islas Británicas"],
        correcta: "Península de los Balcanes"
      },
      {
        id: 2,
        pregunta: "¿Quién es el máximo atacante, capitán de época y referente absoluto de Bosnia (ex de la Roma y Man City)?",
        opciones: ["Miralem Pjanic", "Edin Dzeko", "Sead Kolasinac", "Asmir Begovic"],
        correcta: "Edin Dzeko"
      },
      {
        id: 3,
        pregunta: "¿Cuál fue el único Torneo del fútbol internacional en el que Bosnia y Herzegovina participó tras ganar su independencia?",
        opciones: ["Francia 1998", "Alemania 2006", "Brasil 2014", "Rusia 2018"],
        correcta: "Brasil 2014"
      }
    ],
    2: [
      {
        id: 1,
        pregunta: "¿Qué fino mediocampista, conocido por sus tiros libres magistrales en Juventus y Barcelona, representó a Bosnia?",
        opciones: ["Edin Dzeko", "Miralem Pjanic", "Zvjezdan Misimovic", "Senad Lulic"],
        correcta: "Miralem Pjanic"
      },
      {
        id: 2,
        pregunta: "¿A qué selección centroamericana venció Bosnia y Herzegovina por 3-1 para sellar su primera histórica victoria en Copa de Selecciones?",
        opciones: ["Honduras", "Irán", "Nigeria", "Costa Rica"],
        correcta: "Honduras"
      },
      {
        id: 3,
        pregunta: "¿Quién anotó el primer gol absoluto para Bosnia y Herzegovina en una Copa de Selecciones?",
        opciones: ["Edin Dzeko", "Vedad Ibisevic", "Miralem Pjanic", "Sejad Salihovic"],
        correcta: "Vedad Ibisevic"
      }
    ],
    3: [
      {
        id: 1,
        pregunta: "¿Qué legendario creador de juego ostenta el récord de asistencias de la selección bosnia y fue cerebro en el Wolfsburgo campeón alemán?",
        opciones: ["Zvjezdan Misimovic", "Haris Medunjanin", "Miralem Pjanic", "Zlatan Ibrahimovic"],
        correcta: "Zvjezdan Misimovic"
      },
      {
        id: 2,
        pregunta: "¿En qué club de la Superliga turca se consagró Edin Dzeko como capitán goleador en su veteranía?",
        opciones: ["Fenerbahçe", "Galatasaray", "Besiktas", "Trabzonspor"],
        correcta: "Fenerbahçe"
      },
      {
        id: 3,
        pregunta: "¿Quién era el seleccionador nacional que guio a Bosnia y Herzegovina hacia la clasificación histórica para el Torneo de 2014?",
        opciones: ["Safet Susic", "Miroslav Blazevic", "Dusan Bajevic", "Robert Prosinecki"],
        correcta: "Safet Susic"
      }
    ]
  },
  "Catar": {
    1: [
      {
        id: 1,
        pregunta: "¿En qué península desértica del Medio Oriente se encuentra el estado de Catar?",
        opciones: ["Península del Sinaí", "Península Arábiga", "Península Balcánica", "Península de Anatolia"],
        correcta: "Península Arábiga"
      },
      {
        id: 2,
        pregunta: "¿Qué importante torneo de torneo del fútbol internacional acogió y organizó Catar en el año 2022?",
        opciones: ["Torneo de Clubes", "Copa de Selecciones Masculina del fútbol internacional", "Torneo Sub-20", "Copa Confederaciones"],
        correcta: "Copa de Selecciones Masculina del fútbol internacional"
      },
      {
        id: 3,
        pregunta: "¿Cuál es el color bordó y blanco oficial del escudo y camiseta de Catar?",
        opciones: ["Gris", "Vino / Granate (Marrón)", "Verde Pino", "Azul Eléctrico"],
        correcta: "Vino / Granate (Marrón)"
      }
    ],
    2: [
      {
        id: 1,
        pregunta: "¿De qué torneo oficial a nivel continental se consagró campeona la selección de Catar por dos ediciones consecutivas (2019 y 2024)?",
        opciones: ["Copa Oro", "Copa de Naciones del Golfo", "Copa Asiática de la AFC", "Copa América"],
        correcta: "Copa Asiática de la AFC"
      },
      {
        id: 2,
        pregunta: "¿Quién es el habilidoso delantero con peinado afro, bota de oro y símbolo de la selección catarí?",
        opciones: ["Almoez Ali", "Akram Afif", "Hassan Al-Haydos", "Boualem Khoukhi"],
        correcta: "Akram Afif"
      },
      {
        id: 3,
        pregunta: "¿A qué histórico rival asiático venció Catar en la final para consagrarse en la Copa Asiática de 2019 por primera vez?",
        opciones: ["Japón", "Corea del Sur", "Irán", "Arabia Saudita"],
        correcta: "Japón"
      }
    ],
    3: [
      {
        id: 1,
        pregunta: "¿Qué goleador de origen sudanés ostenta el récord de más goles en una sola edición de Copa Asiática (9 goles en 2019)?",
        opciones: ["Akram Afif", "Almoez Ali", "Hassan Al-Haydos", "Sebastian Soria"],
        correcta: "Almoez Ali"
      },
      {
        id: 2,
        pregunta: "¿Qué influyente director técnico español comandó a Catar hacia el campeonato absoluto de Asia en 2019?",
        opciones: ["Félix Sánchez Bas", "Xavi Hernández", "Tintín Márquez", "Pep Guardiola"],
        correcta: "Félix Sánchez Bas"
      },
      {
        id: 3,
        pregunta: "¿Cuál fue el único goleador de Catar en marcar el gol del honor del anfitrión en el partido ante Senegal en Catar 2022?",
        opciones: ["Mohammed Muntari", "Akram Afif", "Almoez Ali", "Hassan Al-Haydos"],
        correcta: "Mohammed Muntari"
      }
    ]
  },
  "Suiza": {
    1: [
      {
        id: 1,
        pregunta: "¿Qué emblemática cruz blanca decora el escudo de la selección de Suiza?",
        opciones: ["Cruz del Sur", "Cruz Suiza de su bandera nacional", "Cruz de San Andrés", "Cruz Celta"],
        correcta: "Cruz Suiza de su bandera nacional"
      },
      {
        id: 2,
        pregunta: "¿Qué corpulento delantero de origen camerunés ha sido referente y goleador vital para Suiza en torneos de selecciones recientes?",
        opciones: ["Granit Xhaka", "Breel Embolo", "Xherdan Shaqiri", "Yann Sommer"],
        correcta: "Breel Embolo"
      },
      {
        id: 3,
        pregunta: "¿Cuál es el color clásico de la indumentaria local de Suiza?",
        opciones: ["Amarillo", "Blanco", "Rojo", "Verde"],
        correcta: "Rojo"
      }
    ],
    2: [
      {
        id: 1,
        pregunta: "¿Qué centrocampista zurdo y habilidoso mediapunta, famoso por sus goles espectaculares de larga distancia, ha sido el estandarte moderno suizo?",
        opciones: ["Xherdan Shaqiri", "Granit Xhaka", "Denis Zakaria", "Remo Freuler"],
        correcta: "Xherdan Shaqiri"
      },
      {
        id: 2,
        pregunta: "¿Qué extraordinario portero, especialista en detener penales (ex del Gladbach y Bayern), capitaneó el arco helvético?",
        opciones: ["Yann Sommer", "Gregor Kobel", "Roman Bürki", "Pascal Zuberbühler"],
        correcta: "Yann Sommer"
      },
      {
        id: 3,
        pregunta: "¿Qué selección sudamericana comandada por Messi venció sufridamente 1-0 a Suiza en el tiempo extra de octavos de Brasil 2014?",
        opciones: ["Brasil", "Colombia", "Chile", "Argentina"],
        correcta: "Argentina"
      }
    ],
    3: [
      {
        id: 1,
        pregunta: "En el Torneo de Alemania 2006, Suiza logró un hito defensivo inédito en la historia de los torneos de selecciones. ¿De qué se trata?",
        opciones: ["Fueron eliminados sin recibir un solo gol en los partidos jugados", "Ganaron todos los partidos de su grupo por 1-0", "No cometieron una sola falta en fase de grupos", "Tuvieron un promedio de 80% de posesión de balón"],
        correcta: "Fueron eliminados sin recibir un solo gol en los partidos jugados"
      },
      {
        id: 2,
        pregunta: "¿Qué centrocampista y líder con temperamento del Arsenal y Bayer Leverkusen dirige la medular y capitanía de Suiza?",
        opciones: ["Granit Xhaka", "Fabian Schär", "Manuel Akanji", "Xherdan Shaqiri"],
        correcta: "Granit Xhaka"
      },
      {
        id: 3,
        pregunta: "¿A qué campeón de Europa defensor eliminó Suiza por penales tras remontar de forma agónica un 3-1 en la Euro 2020?",
        opciones: ["Francia", "Alemania", "España", "Portugal"],
        correcta: "Francia"
      }
    ]
  },
  "Brasil": {
    1: [
      {
        id: 1,
        pregunta: "¿Cómo se denomina popularmente el estilo de fútbol habilidoso, alegre y creativo de Brasil?",
        opciones: ["Fútbol de Salón", "Jogo Bonito", "La Muralla", "Catenaccio"],
        correcta: "Jogo Bonito"
      },
      {
        id: 2,
        pregunta: "¿Qué apodo recibe la camiseta tradicional de la selección de Brasil por su color de pluma de ave?",
        opciones: ["La Amarilla", "La Verde en Bastones", "La Canarinha", "La Carioca"],
        correcta: "La Canarinha"
      },
      {
        id: 3,
        pregunta: "¿Cuántas Copas del Mundo del fútbol internacional ha conquistado Brasil para consagrarse como el único Pentacampeón?",
        opciones: ["3 Copas", "4 Copas", "5 Copas", "6 Copas"],
        correcta: "5 Copas"
      },
      {
        id: 4,
        pregunta: "¿Cuál es la selección nacional que posee más títulos de la Copa de Selecciones en la historia del fútbol?",
        opciones: ["Alemania", "Brasil", "Italia"],
        correcta: "Brasil"
      },
      {
        id: 5,
        pregunta: "¿Qué rey del fútbol de torneo es el único jugador que ha ganado 3 Copas del Mundo en la historia?",
        opciones: ["Ronaldo Nazário", "Pelé", "Romário"],
        correcta: "Pelé"
      },
      {
        id: 6,
        pregunta: "¿Cuál es el color predominante de la famosa e icónica camiseta titular de Brasil?",
        opciones: ["Azul", "Amarillo", "Verde"],
        correcta: "Amarillo"
      }
    ],
    2: [
      {
        id: 1,
        pregunta: "¿Qué legendario astro del fútbol brasileño es el único en ganar la Copa de Selecciones 3 veces como jugador?",
        opciones: ["Garrincha", "Pelé", "Zico", "Ronaldo Nazário"],
        correcta: "Pelé"
      },
      {
        id: 2,
        pregunta: "¿A qué arquero alemán venció el histórico delantero Ronaldo en la consagratoria final de Corea-Japón 2002?",
        opciones: ["Jens Lehmann", "Oliver Kahn", "Manuel Neuer", "Sepp Maier"],
        correcta: "Oliver Kahn"
      },
      {
        id: 3,
        pregunta: "¿Quién fue el gran capitán de la selección de Brasil campeona del Torneo de EE.UU. 1994, de recio juego defensivo?",
        opciones: ["Socrates", "Dunga", "Romário", "Cafú"],
        correcta: "Dunga"
      },
      {
        id: 4,
        pregunta: "¿Quién anotó el doblete definitivo en la final de Corea-Japón 2002 con el que Brasil venció a Alemania?",
        opciones: ["Rivaldo", "Ronaldinho", "Ronaldo Nazário"],
        correcta: "Ronaldo Nazário"
      },
      {
        id: 5,
        pregunta: "¿Qué país fue el organizador del Torneo de 1950, recordado eternamente por la tragedia deportiva del \"Maracanazo\"?",
        opciones: ["Uruguay", "Brasil", "Argentina"],
        correcta: "Brasil"
      },
      {
        id: 6,
        pregunta: "¿Quién era el capitán y lateral derecho de la mítica selección de Brasil que deslumbró al mundo en México 1970?",
        opciones: ["Carlos Alberto", "Tostão", "Rivellino"],
        correcta: "Carlos Alberto"
      }
    ],
    3: [
      {
        id: 1,
        pregunta: "¿Quién es el lateral brasileño récord en disputar tres finales de Copa de Selecciones consecutivas (1994, 1998, 2002)?",
        opciones: ["Roberto Carlos", "Cafú", "Dani Alves", "Branco"],
        correcta: "Cafú"
      },
      {
        id: 2,
        pregunta: "En la final de México 1970, Brasil anotó uno de los mejores goles colectivos de la historia que cerró la goleada 4-1 a Italia. ¿Quién definió?",
        opciones: ["Carlos Alberto", "Pelé", "Jairzinho", "Tostão"],
        correcta: "Carlos Alberto"
      },
      {
        id: 3,
        pregunta: "¿Quién era el socio ofensivo ideal de Romário en la dupla letal 'Ro-Ro' en el Torneo de EE.UU. 1994?",
        opciones: ["Ronaldo Nazário", "Bebeto", "Zinho", "Müller"],
        correcta: "Bebeto"
      },
      {
        id: 4,
        pregunta: "¿Qué delantero brasileño logró la hazaña de marcar al menos un gol en absolutamente todos los partidos disputados en México 1970?",
        opciones: ["Jairzinho", "Pelé", "Rivelino"],
        correcta: "Jairzinho"
      },
      {
        id: 5,
        pregunta: "¿Contra qué selección europea hizo su debut absoluto un joven Pelé de 17 años en el Torneo de Suecia 1958?",
        opciones: ["Gales", "Unión Soviética", "Francia"],
        correcta: "Unión Soviética"
      },
      {
        id: 6,
        pregunta: "¿Quién fue el director técnico estratega de Brasil en la conquista del tetracampeonato en Estados Unidos 1994?",
        opciones: ["Mario Zagallo", "Carlos Alberto Parreira", "Luiz Felipe Scolari"],
        correcta: "Carlos Alberto Parreira"
      }
    ]
  },
  "Marruecos": {
    1: [
      {
        id: 1,
        pregunta: "¿Cuál es el famoso y heroico apodo oficial de la selección de Marruecos?",
        opciones: ["Los Faraones", "Los Leones del Atlas", "Las Águilas Verdes", "Los Zorros del Desierto"],
        correcta: "Los Leones del Atlas"
      },
      {
        id: 2,
        pregunta: "¿Qué hito histórico e inédito para todo el continente africano logró Marruecos en el Torneo de Catar 2022?",
        opciones: ["Clasificar por primera vez en la historia a Semifinales", "Ganar la Copa de Selecciones", "Ganar la Medalla de Bronce", "Marcar 50 goles en el certamen"],
        correcta: "Clasificar por primera vez en la historia a Semifinales"
      },
      {
        id: 3,
        pregunta: "¿Qué gran defensor marroquí del PSG es considerado uno de los mejores laterales derechos del mundo?",
        opciones: ["Yassine Bounou", "Achraf Hakimi", "Nayef Aguerd", "Noussair Mazraoui"],
        correcta: "Achraf Hakimi"
      }
    ],
    2: [
      {
        id: 1,
        pregunta: "¿A qué campeona del mundo eliminó Marruecos por penaltis de forma antológica en los octavos de final de Catar 2022?",
        opciones: ["Alemania", "España", "Brasil", "Francia"],
        correcta: "España"
      },
      {
        id: 2,
        pregunta: "¿Qué carismático y seguro guardameta marroquí de la liga saudí (ex-Sevilla) fue el héroe absoluto en las tandas de penales de 2022?",
        opciones: ["Munir Mohamedi", "Yassine Bounou (Bono)", "Zakaría Aboukhlal", "Youssef En-Nesyri"],
        correcta: "Yassine Bounou (Bono)"
      },
      {
        id: 3,
        pregunta: "¿Qué excelente carrilero ofensivo del Galatasaray lideró con asistencias y genialidad la medular marroquí?",
        opciones: ["Sofyan Amrabat", "Hakim Ziyech", "Azzedine Ounahi", "Selim Amallah"],
        correcta: "Hakim Ziyech"
      }
    ],
    3: [
      {
        id: 1,
        pregunta: "¿Con qué histórico salto de cabeza venció Youssef En-Nesyri a Portugal en los cuartos de final de Catar 2022?",
        opciones: ["Salto récord que arrebató a Diogo Costa un rechace", "Un cobro de tiro libre directo", "Un remate cruzado raso", "Un gol de chilena"],
        correcta: "Salto récord que arrebató a Diogo Costa un rechace"
      },
      {
        id: 2,
        pregunta: "¿Quién es el astuto seleccionador nacional marroquí que asumió el cargo pocos meses antes de lograr el milagro de Catar 2022?",
        opciones: ["Walid Regragui", "Vahid Halilhodzic", "Hervé Renard", "Badou Ezzaki"],
        correcta: "Walid Regragui"
      },
      {
        id: 3,
        pregunta: "¿En qué Copa de Selecciones se convirtió Marruecos en la primera selección árabe y africana de la historia en liderar un grupo de primera fase?",
        opciones: ["México 1986", "EE.UU. 1994", "Francia 1998", "Rusia 2018"],
        correcta: "México 1986"
      }
    ]
  },
  "Haití": {
    1: [
      {
        id: 1,
        pregunta: "¿En qué mar paradisíaco de América Central se encuentra ubicada la isla de Haití?",
        opciones: ["Océano Índico", "Mar Caribe", "Mar Mediterráneo", "Mar de Coral"],
        correcta: "Mar Caribe"
      },
      {
        id: 2,
        pregunta: "¿Cuáles son los dos colores que se dividen horizontalmente la bandera y camiseta de Haití?",
        opciones: ["Rojo y Azul", "Verde y Blanco", "Celeste y Blanco", "Rojo y Amarillo"],
        correcta: "Rojo y Azul"
      },
      {
        id: 3,
        pregunta: "¿Cuál fue el único e histórico Torneo del fútbol internacional de categoría absoluta al que asistió la selección de Haití?",
        opciones: ["Chile 1962", "Alemania 1974", "España 1982", "Francia 1998"],
        correcta: "Alemania 1974"
      }
    ],
    2: [
      {
        id: 1,
        pregunta: "Haití anotó 2 memorables goles frente a rivales de élite en Alemania 1974. ¿Quién fue el autor de ambos tantos históricos?",
        opciones: ["Emmanuel Sanon", "Antoine Tassy", "Philippe Vorbe", "Jean-Joseph Guy"],
        correcta: "Emmanuel Sanon"
      },
      {
        id: 2,
        pregunta: "¿Qué portero de leyenda italiano vio rota su racha invicta de 1143 minutos sin recibir gol ante un rápido regate de un delantero haitiano en 1974?",
        opciones: ["Dino Zoff", "Walter Zenga", "Gianluigi Buffon", "Enrico Albertosi"],
        correcta: "Dino Zoff"
      },
      {
        id: 3,
        pregunta: "¿A qué confederación del fútbol de torneo pertenece la selección caribeña de Haití?",
        opciones: ["Concacaf (Norte y Centroamérica)", "Conmebol (América del Sur)", "OFC (Oceanía)", "CAF (África)"],
        correcta: "Concacaf (Norte y Centroamérica)"
      }
    ],
    3: [
      {
        id: 1,
        pregunta: "¿Qué legendario mediocampista asistió de manera maravillosa con pase milimétrico entrelíneas a Sanon para batir al mítico Dino Zoff en 1974?",
        opciones: ["Philippe Vorbe", "Jean-Joseph Guy", "Serge Racine", "Claude Jean-Gilles"],
        correcta: "Philippe Vorbe"
      },
      {
        id: 2,
        pregunta: "¿Qué importante torneo de Concacaf (precursor de la Copa Oro) conquistó Haití como anfitrión de manera invicta?",
        opciones: ["Campeonato de Naciones de la Concacaf 1973 (Liga prede torneo)", "Copa del Caribe 2012", "Copa de Oro 1991", "Copa UNCAF"],
        correcta: "Campeonato de Naciones de la Concacaf 1973 (Liga prede torneo)"
      },
      {
        id: 3,
        pregunta: "¿Qué goleador haitiano-estadounidense ex de la MLS destacó como capitán e icono del ataque haitiano en Copas Oro recientes?",
        opciones: ["Duckens Nazon", "Frantzdy Pierrot", "Wagneau Eloi", "Jeff Louis"],
        correcta: "Duckens Nazon"
      }
    ]
  },
  "Escocia": {
    1: [
      {
        id: 1,
        pregunta: "¿Con qué clásico apodo británico, derivado de la flor emblemática del país, se identifica también a Escocia?",
        opciones: ["The Three Lions", "The Dragons", "The Thistle (El Cardo / El Ejército de Tartán)", "The Red Devils"],
        correcta: "The Thistle (El Cardo / El Ejército de Tartán)"
      },
      {
        id: 2,
        pregunta: "¿Qué estrella lateral zurda escocesa brilla intensamente como capitán de Escocia y titular indiscutible en el Liverpool?",
        opciones: ["Kieran Tierney", "Andy Robertson", "Scott McTominay", "John McGinn"],
        correcta: "Andy Robertson"
      },
      {
        id: 3,
        pregunta: "¿Cuál es el color primario de la camiseta local de los escoceses en sus partidos internacionales?",
        opciones: ["Rojo Intenso", "Azul Marino", "Verde Esmeralda", "Blanco"],
        correcta: "Azul Marino"
      }
    ],
    2: [
      {
        id: 1,
        pregunta: "¿Qué corpulento mediocentro de llegada del Napoli (ex del Manchester United) anotó increíbles goles clave en fases europeas?",
        opciones: ["John McGinn", "Scott McTominay", "Billy Gilmour", "Ryan Christie"],
        correcta: "Scott McTominay"
      },
      {
        id: 2,
        pregunta: "¿Qué legendario astro anotó un maravilloso gol de regates a los Países Bajos en el Torneo de Argentina 1978?",
        opciones: ["Kenny Dalglish", "Archie Gemmill", "Denis Law", "Graeme Souness"],
        correcta: "Archie Gemmill"
      },
      {
        id: 3,
        pregunta: "¿A qué mítica selección pentacampeona se enfrentó Escocia en reiterados torneos de selecciones en fase de grupos (ej. 1982, 1990, 1998)?",
        opciones: ["Argentina", "Brasil", "Alemania", "Italia"],
        correcta: "Brasil"
      }
    ],
    3: [
      {
        id: 1,
        pregunta: "¿Qué único Balón de Oro de historia escocesa (conocido como 'The King' en Old Trafford) la representó en el Torneo de 1974?",
        opciones: ["Denis Law", "Kenny Dalglish", "Graeme Souness", "Alex Ferguson"],
        correcta: "Denis Law"
      },
      {
        id: 2,
        pregunta: "¿Qué legendario entrenador y DT del Aberdeen y Manchester United comenzó su laureada trayectoria dirigiendo a Escocia en el Torneo de 1986 tras el deceso de Jock Stein?",
        opciones: ["Alex Ferguson", "Matt Busby", "Kenny Dalglish", "Jock Stein"],
        correcta: "Alex Ferguson"
      },
      {
        id: 3,
        pregunta: "¿Cuántas veces en sus múltiples participaciones en la Copa de Selecciones ha logrado Escocia superar la fase de grupos inicial?",
        opciones: ["Nunca ha superado la primera fase de grupos", "1 vez", "2 veces", "3 veces"],
        correcta: "Nunca ha superado la primera fase de grupos"
      }
    ]
  },
  "Estados Unidos": {
    1: [
      {
        id: 1,
        pregunta: "¿Cómo se le llama comúnmente a la selección nacional de fútbol de Estados Unidos?",
        opciones: ["The Stars & Stripes", "The Soccer Team", "USMNT (U.S. Men's National Team)", "Todas las opciones son válidas"],
        correcta: "Todas las opciones son válidas"
      },
      {
        id: 2,
        pregunta: "¿Qué Copa de Selecciones histórica del fútbol internacional organizó EE.UU. como sede de récord de asistencia absoluto?",
        opciones: ["EE.UU. 1994", "México 1986", "Francia 1998", "Catar 2022"],
        correcta: "EE.UU. 1994"
      },
      {
        id: 3,
        pregunta: "¿Qué talentoso mediapunta y estrella del Milan de Italia es apodado como el 'Capitán América'?",
        opciones: ["Weston McKennie", "Christian Pulisic", "Giovanni Reyna", "Timothy Weah"],
        correcta: "Christian Pulisic"
      },
      {
        id: 4,
        pregunta: "¿Inaugurando la era moderna del soccer en su país, en qué año organizó Estados Unidos su primer Torneo masculino?",
        opciones: ["1982", "1994", "2006"],
        correcta: "1994"
      },
      {
        id: 5,
        pregunta: "¿Cuál es el apodo oficial en inglés de la selección de Estados Unidos?",
        opciones: ["The Stars & Stripes (Las Barras y las Estrellas)", "The Eagles", "The Soccer Kings"],
        correcta: "The Stars & Stripes (Las Barras y las Estrellas)"
      },
      {
        id: 6,
        pregunta: "¿Cuál de estos impresionantes estadios estadounidenses es sede oficial del Torneo 2026?",
        opciones: ["Yankee Stadium", "SoFi Stadium (Los Ángeles)", "Madison Square Garden"],
        correcta: "SoFi Stadium (Los Ángeles)"
      }
    ],
    2: [
      {
        id: 1,
        pregunta: "¿Qué selección centroamericana-europea histórica venció EE.UU. para clasificar de los grupos en el Torneo 2022 con un sacrificado remate de Pulisic?",
        opciones: ["Inglaterra", "Irán", "Gales", "Países Bajos"],
        correcta: "Irán"
      },
      {
        id: 2,
        pregunta: "¿Quién es el máximo ex centrocampista-delantero estadounidense retirado, goleador y capitán (apellidado 'Landycakes')?",
        opciones: ["Landon Donovan", "Clint Dempsey", "Tim Howard", "Michael Bradley"],
        correcta: "Landon Donovan"
      },
      {
        id: 3,
        pregunta: "En el Torneo de 2002 de Corea/Japón, ¿hasta qué ronda avanzó Estados Unidos en su mejor desempeño moderno?",
        opciones: ["Octavos de Final", "Cuartos de Final", "Semifinales", "Fase de Grupos"],
        correcta: "Cuartos de Final"
      },
      {
        id: 4,
        pregunta: "¿Cuál es el mejor resultado histórico de Estados Unidos en una Copa de Selecciones, conseguido en la primera edición de 1930?",
        opciones: ["Subcampeón", "Tercer lugar (Semifinalista)", "Cuartos de final"],
        correcta: "Tercer lugar (Semifinalista)"
      },
      {
        id: 5,
        pregunta: "¿A qué gigante europeo eliminó Estados Unidos en la fase de grupos del Torneo de 1950 en una de las mayores sorpresas de la historia?",
        opciones: ["Inglaterra", "Italia", "Alemania"],
        correcta: "Inglaterra"
      },
      {
        id: 6,
        pregunta: "¿Quién fue el capitán y cerebro mediocampista de Estados Unidos en el exitoso Torneo de Corea-Japón 2002?",
        opciones: ["Landon Donovan", "Clint Dempsey", "Claudio Reyna"],
        correcta: "Claudio Reyna"
      }
    ],
    3: [
      {
        id: 1,
        pregunta: "¿Qué asombroso partido histórico de la Copa de Selecciones de 1950 en Brasil vio a EE.UU. vencer de forma épica por 1-0 a un coloso europeo?",
        opciones: ["Victoria ante Inglaterra", "Victoria ante Italia", "Victoria ante España", "Victoria ante Suecia"],
        correcta: "Victoria ante Inglaterra"
      },
      {
        id: 2,
        pregunta: "En el Torneo de Sudáfrica 2010, ¿quién fue el arquero que rompió el récord de más atajadas en un encuentro de octavos de final?",
        opciones: ["Tim Howard", "Kasey Keller", "Brad Friedel", "Tony Meola"],
        correcta: "Tim Howard"
      },
      {
        id: 3,
        pregunta: "¿Qué delantero, hijo de un ex-Balón de Oro de Liberia y actual presidente, anotó con EE.UU. en Catar 2022?",
        opciones: ["Timothy Weah", "Christian Pulisic", "Josh Sargent", "Ricardo Pepi"],
        correcta: "Timothy Weah"
      },
      {
        id: 4,
        pregunta: "¿Quién es el único jugador estadounidense en marcar un \"hat-trick\" en la historia de los Torneos de Selecciones (Uruguay 1930)?",
        opciones: ["Bert Patenaude", "Christian Pulisic", "Brian McBride"],
        correcta: "Bert Patenaude"
      },
      {
        id: 5,
        pregunta: "¿A qué clásico rival de la CONCACAF venció Estados Unidos en los octavos de final del Torneo 2002?",
        opciones: ["México", "Costa Rica", "Honduras"],
        correcta: "México"
      },
      {
        id: 6,
        pregunta: "¿Qué jugador tiene el récord de más partidos disputados con Estados Unidos en Copas del Mundo?",
        opciones: ["Cobi Jones", "Landon Donovan", "Tim Howard"],
        correcta: "Landon Donovan"
      }
    ]
  },
  "Paraguay": {
    1: [
      {
        id: 1,
        pregunta: "¿Cuál es el famoso apodo oficial de la garra futbolística de Paraguay?",
        opciones: ["La Albirroja", "La Celeste", "La Roja", "Los Charrúas"],
        correcta: "La Albirroja"
      },
      {
        id: 2,
        pregunta: "¿Qué legendario y carismático portero goleador de Paraguay cobraba tiros libres y penales cruzando la cancha?",
        opciones: ["Justo Villar", "José Luis Chilavert", "Roberto Fernández", "Antony Silva"],
        correcta: "José Luis Chilavert"
      },
      {
        id: 3,
        pregunta: "¿Cuál es el diseño distintivo clásico de la indumentaria de local paraguaya?",
        opciones: ["Camiseta roja íntegra", "Camiseta blanca y roja a franjas verticales", "Camiseta blanca con manga azul", "Camiseta celeste y negra"],
        correcta: "Camiseta blanca y roja a franjas verticales"
      }
    ],
    2: [
      {
        id: 1,
        pregunta: "¿En qué histórico Torneo del fútbol internacional alcanzó Paraguay los Cuartos de Final por primera vez en su historia modernos?",
        opciones: ["Francia 1998", "Corea-Japón 2002", "Sudáfrica 2010", "Alemania 2006"],
        correcta: "Sudáfrica 2010"
      },
      {
        id: 2,
        pregunta: "¿Qué gran delantero paraguayo triunfó de forma prolífica como ídolo absoluto en el Bayern Múnich y la Albirroja?",
        opciones: ["Roque Santa Cruz", "Salvador Cabañas", "Nelson Haedo Valdez", "Oscar Cardozo"],
        correcta: "Roque Santa Cruz"
      },
      {
        id: 3,
        pregunta: "¿Qué coloso europeo de Iker Casillas venció sufridamente 1-0 a Paraguay tras una atajada de penal de cada bando en cuartos de 2010?",
        opciones: ["Alemania", "España", "Italia", "Francia"],
        correcta: "España"
      }
    ],
    3: [
      {
        id: 1,
        pregunta: "¿Qué letal atacante paraguayo es célebre por liderar el ataque del Borussia Dortmund y por su aguerrido gol a Italia en el Torneo de 2010?",
        opciones: ["Nelson Haedo Valdez", "Roque Santa Cruz", "Lucas Barrios", "Oscar Cardozo"],
        correcta: "Nelson Haedo Valdez"
      },
      {
        id: 2,
        pregunta: "¿En qué club de la Premier League inglesa se convirtió Miguel Almirón en un extremo izquierdo desequilibrante?",
        opciones: ["Newcastle United", "Aston Villa", "Everton FC", "West Ham"],
        correcta: "Newcastle United"
      },
      {
        id: 3,
        pregunta: "¿Quién fue el eminente director técnico argentino que comandó tácticamente a Paraguay en su memorable campaña de Sudáfrica 2010?",
        opciones: ["Gerardo 'Tata' Martino", "Marcelo Bielsa", "Gustavo Alfaro", "Francisco Arce"],
        correcta: "Gerardo 'Tata' Martino"
      }
    ]
  },
  "Australia": {
    1: [
      {
        id: 1,
        pregunta: "¿Cómo se le conoce popularmente en el fútbol a la selección nacional de Australia?",
        opciones: ["Los Canguros", "Los Socceroos", "Los Wallabies", "Los All Blacks"],
        correcta: "Los Socceroos"
      },
      {
        id: 2,
        pregunta: "¿Qué colores identifican a la camiseta local de la selección australiana?",
        opciones: ["Rojo y Blanco", "Verde y Dorado", "Azul y Celeste", "Blanco y Negro"],
        correcta: "Verde y Dorado"
      },
      {
        id: 3,
        pregunta: "¿A qué confederación del fútbol de torneo se adhirió Australia para clasificar con mayor competitividad táctica?",
        opciones: ["OFC (Oceanía)", "AFC (Asia)", "Concacaf", "Uefa"],
        correcta: "AFC (Asia)"
      }
    ],
    2: [
      {
        id: 1,
        pregunta: "¿Quién es el indiscutido goleador histórico, cabeceador letal e icono de torneoista de Australia?",
        opciones: ["Tim Cahill", "Harry Kewell", "Mark Viduka", "Mile Jedinak"],
        correcta: "Tim Cahill"
      },
      {
        id: 2,
        pregunta: "¿Qué ex arquero de la Real Sociedad y Valencia destacó enormemente en el resguardo defensivo de Australia?",
        opciones: ["Mathew Ryan", "Mark Schwarzer", "Mitchell Langerak", "Zeljko Kalac"],
        correcta: "Mathew Ryan"
      },
      {
        id: 3,
        pregunta: "¿Qué selección sudamericana venció a Australia por penales en el repechaje rumbo a Alemania 2006, rompiendo una sequía de 32 años sin clasificar?",
        opciones: ["Uruguay", "Chile", "Perú", "Colombia"],
        correcta: "Uruguay"
      }
    ],
    3: [
      {
        id: 1,
        pregunta: "¿Qué mediapunta ex de Liverpool y Leeds es considerado el jugador más técnico en la historia de Australia?",
        opciones: ["Harry Kewell", "Tim Cahill", "Emile Smith", "Mile Jedinak"],
        correcta: "Harry Kewell"
      },
      {
        id: 2,
        pregunta: "En el Torneo de Catar 2022, Australia igualó su mejor resultado clasificando a Octavos de Final. ¿Frente a qué equipo triunfó por 1-0 para sellarlo?",
        opciones: ["Dinamarca", "Túnez", "Francia", "Uruguay"],
        correcta: "Dinamarca"
      },
      {
        id: 3,
        pregunta: "¿Qué acrobático y extrovertido portero australiano es famoso por sus 'bailes' de distracción en la tanda de penales del repechaje de torneoista de 2022 ante Perú?",
        opciones: ["Andrew Redmayne", "Mathew Ryan", "Mitchell Langerak", "Mark Schwarzer"],
        correcta: "Andrew Redmayne"
      }
    ]
  },
  "Turquía": {
    1: [
      {
        id: 1,
        pregunta: "¿Qué elemento celeste nocturno (estrella y luna de su bandera) decora el pecho de Turquía?",
        opciones: ["Un Halcón real", "La Luna Creciente y Estrella", "Un León Turco", "Un Escudo de Hierro"],
        correcta: "La Luna Creciente y Estrella"
      },
      {
        id: 2,
        pregunta: "¿En qué memorable Copa de Selecciones logró Turquía un histórico tercer lugar, con victorias espectaculares?",
        opciones: ["Francia 1998", "Alemania 2006", "Corea-Japón 2002", "Estados Unidos 1994"],
        correcta: "Corea-Japón 2002"
      },
      {
        id: 3,
        pregunta: "¿Cuál es el color tradicional de la indumentaria titular de la selección de Turquía?",
        opciones: ["Azul", "Blanco / Rojo", "Verde", "Camiseta a bastones negros"],
        correcta: "Blanco / Rojo"
      }
    ],
    2: [
      {
        id: 1,
        pregunta: "¿Qué temible delantero centro turco, apodado el 'Toro del Bósforo', anotó en 2002 el gol más rápido en la historia de los Torneos de Selecciones (a los 11 segundos)?",
        opciones: ["Ilhan Mansiz", "Hakan Sükür", "Hasan Sas", "Emre Belözoglu"],
        correcta: "Hakan Sükür"
      },
      {
        id: 2,
        pregunta: "¿Qué fantástico centrocampista y capitán de cobros con balón parado lideró al Inter de Milán y fue cerebro de Turquía?",
        opciones: ["Hakan Calhanoglu", "Arda Turan", "Hamit Altintop", "Nuri Sahin"],
        correcta: "Hakan Calhanoglu"
      },
      {
        id: 3,
        pregunta: "¿A qué co-anfitrión del torneo derrotó Turquía por 3-2 en un vibrante partido de consolación para sellar el Tercer Puesto en el año 2002?",
        opciones: ["Japón", "Corea del Sur", "Brasil", "Senegal"],
        correcta: "Corea del Sur"
      }
    ],
    3: [
      {
        id: 1,
        pregunta: "¿Qué habilidoso y talentoso extremo de origen turco destacó como figura absoluta en el Barcelona y Atlético de Madrid?",
        opciones: ["Arda Turan", "Hamit Altintop", "Mehmet Aurelio", "Burak Yilmaz"],
        correcta: "Arda Turan"
      },
      {
        id: 2,
        pregunta: "¿Qué asombroso gol de oro de Ilhan Mansiz clasificó a Turquía sobre qué selección africana sensación en los cuartos de 2002?",
        opciones: ["Egipto", "Senegal", "Nigeria", "Camerún"],
        correcta: "Senegal"
      },
      {
        id: 3,
        pregunta: "¿Por qué club italiano fichó la joven joya turca Arda Güler procedente del Fenerbahçe antes de unirse al Real Madrid?",
        opciones: ["AC Milan", "Juventus", "Inter de Milán", "No fichó por ningún italiano, fue directo del Fenerbahçe al Real Madrid"],
        correcta: "No fichó por ningún italiano, fue directo del Fenerbahçe al Real Madrid"
      }
    ]
  },
  "Alemania": {
    1: [
      {
        id: 1,
        pregunta: "¿Cuál es el famoso y unificado apodo en alemán de la selección que significa 'El Equipo'?",
        opciones: ["Die Mannschaft", "Nationalelf", "Die Adler (Los Águilas)", "Todas las opciones son válidas de forma informal/oficial"],
        correcta: "Todas las opciones son válidas de forma informal/oficial"
      },
      {
        id: 2,
        pregunta: "¿Cuántos campeonatos del mundo absoluto masculinos posee la selección de Alemania?",
        opciones: ["3 Copas", "4 Copas", "5 Copas", "2 Copas"],
        correcta: "4 Copas"
      },
      {
        id: 3,
        pregunta: "¿Qué colores de unísono sobrio caracterizan la indumentaria titular de Alemania?",
        opciones: ["Camiseta Blanca y Pantalón Negro", "Rojo y Amarillo", "Verde y Azul", "Celeste y Blanco"],
        correcta: "Camiseta Blanca y Pantalón Negro"
      },
      {
        id: 4,
        pregunta: "¿Cuántos trofeos de la Copa de Selecciones ha conseguido la selección de Alemania (incluyendo Alemania Federal)?",
        opciones: ["3", "4", "5"],
        correcta: "4"
      },
      {
        id: 5,
        pregunta: "¿A qué selección sudamericana derrotó Alemania con un marcador de 1-0 para levantar la copa en Brasil 2014?",
        opciones: ["Argentina", "Brasil", "Colombia"],
        correcta: "Argentina"
      },
      {
        id: 6,
        pregunta: "¿Quién es el máximo goleador histórico de las Copas del Mundo, con 16 tantos anotados para Alemania?",
        opciones: ["Miroslav Klose", "Gerd Müller", "Thomas Müller"],
        correcta: "Miroslav Klose"
      }
    ],
    2: [
      {
        id: 1,
        pregunta: "¿Quién es el máximo artillero histórico de la historia de los Torneos de Selecciones con 16 goles, récord en fases finales?",
        opciones: ["Ronaldo Nazário", "Miroslav Klose", "Gerd Müller", "Thomas Müller"],
        correcta: "Miroslav Klose"
      },
      {
        id: 2,
        pregunta: "¿Qué cerebral mediocampista de pases perfectos del Real Madrid asistió y dirigió para campeonar en Brasil 2014?",
        opciones: ["Bastian Schweinsteiger", "Toni Kroos", "Mesut Özil", "Thomas Müller"],
        correcta: "Toni Kroos"
      },
      {
        id: 3,
        pregunta: "¿Cuál fue el asombroso marcador con el que Alemania goleó al local Brasil en las semifinales de 2014?",
        opciones: ["7-1", "5-0", "4-0", "6-2"],
        correcta: "7-1"
      },
      {
        id: 4,
        pregunta: "¿Cómo se conoce en la historia del fútbol a la épica e inesperada victoria de Alemania sobre Hungría en la final del Torneo de 1954?",
        opciones: ["El Milagro de Berna", "El Maracanazo Alemán", "La Batalla de Stuttgart"],
        correcta: "El Milagro de Berna"
      },
      {
        id: 5,
        pregunta: "¿Qué legendario líbero y centrocampista alemán igualó el récord de disputar 5 Copas del Mundo liderando el título de 1990?",
        opciones: ["Lothar Matthäus", "Jürgen Klinsmann", "Franz Beckenbauer"],
        correcta: "Lothar Matthäus"
      },
      {
        id: 6,
        pregunta: "¿Cuál fue el estrepitoso e histórico resultado de semifinales con el que Alemania eliminó al anfitrión Brasil en su propia casa en 2014?",
        opciones: ["5 – 0", "7 – 1", "4 – 1"],
        correcta: "7 – 1"
      }
    ],
    3: [
      {
        id: 1,
        pregunta: "¿Quién anotó el épico gol de la prórroga de Alemania al minuto 113 para ganar la final 1-0 a Argentina en el año 2014?",
        opciones: ["Mario Götze", "Thomas Müller", "André Schürrle", "Miroslav Klose"],
        correcta: "Mario Götze"
      },
      {
        id: 2,
        pregunta: "¿Qué legendario defensor, apodado 'El Káiser', se coronó campeón de torneo tanto de jugador (1974) como de Director Técnico (1990)?",
        opciones: ["Lothar Matthäus", "Franz Beckenbauer", "Philipp Lahm", "Mats Hummels"],
        correcta: "Franz Beckenbauer"
      },
      {
        id: 3,
        pregunta: "¿Quién posee el récord de más apariciones jugadas con la indumentaria de Alemania en partidos del Torneo (con 25 partidos)?",
        opciones: ["Lothar Matthäus", "Miroslav Klose", "Philipp Lahm", "Oliver Kahn"],
        correcta: "Lothar Matthäus"
      },
      {
        id: 4,
        pregunta: "¿Qué jugador saliendo desde el banquillo anotó el agónico gol de la victoria en la prórroga de la final del Torneo 2014?",
        opciones: ["Mario Götze", "André Schürrle", "Bastian Schweinsteiger"],
        correcta: "Mario Götze"
      },
      {
        id: 5,
        pregunta: "¿A qué mítica selección liderada por Johan Cruyff derrotó Alemania Federal en la final del Torneo de 1974?",
        opciones: ["Países Bajos", "Polonia", "Italia"],
        correcta: "Países Bajos"
      },
      {
        id: 6,
        pregunta: "¿Quién fue el único guardameta de la historia en ganar el Balón de Oro al mejor jugador de un Torneo (Corea-Japón 2002)?",
        opciones: ["Jens Lehmann", "Oliver Kahn", "Manuel Neuer"],
        correcta: "Oliver Kahn"
      }
    ]
  },
  "Ecuador": {
    1: [
      {
        id: 1,
        pregunta: "¿Cuál es el famoso apodo oficial derivado de los colores patrios de Ecuador?",
        opciones: ["La Tri (La Tricolor)", "La Amarilla", "La Mitad del Mundo", "Los Guayacos"],
        correcta: "La Tri (La Tricolor)"
      },
      {
        id: 2,
        pregunta: "¿Qué histórico delantero de Ecuador, que milita en el Internacional, es el máximo goleador histórico del seleccionado?",
        opciones: ["Agustín Delgado", "Enner Valencia", "Felipe Caicedo", "Álex Aguinaga"],
        correcta: "Enner Valencia"
      },
      {
        id: 3,
        pregunta: "¿Cuál es el color predominante de la camiseta local de Ecuador?",
        opciones: ["Azul", "Blanco", "Amarillo", "Rojo"],
        correcta: "Amarillo"
      }
    ],
    2: [
      {
        id: 1,
        pregunta: "¿En qué Copa de Selecciones logró Ecuador un histórico acceso de clasificación a los Octavos de Final por primera vez?",
        opciones: ["Corea-Japón 2002", "Alemania 2006", "Brasil 2014", "Catar 2022"],
        correcta: "Alemania 2006"
      },
      {
        id: 2,
        pregunta: "¿Qué veloz extremo ecuatoriano se consagró figura en el Manchester United de Alex Ferguson y capitaneó la selección?",
        opciones: ["Jefferson Montero", "Antonio Valencia", "Christian Benítez", "Ángel Mena"],
        correcta: "Antonio Valencia"
      },
      {
        id: 3,
        pregunta: "¿Quién anotó el definitivo, primer y memorable gol de Ecuador en su debut en Torneos de Selecciones (en Corea-Japón 2002 ante Croacia)?",
        opciones: ["Edison Méndez", "Agustín Delgado", "Iván Kaviedes", "Álex Aguinaga"],
        correcta: "Edison Méndez"
      }
    ],
    3: [
      {
        id: 1,
        pregunta: "¿Qué talentoso mediocentro de corte defensivo y físico ecuatoriano fue fichado de forma récord por el Chelsea procedente del Brighton?",
        opciones: ["Moisés Caicedo", "Piero Hincapié", "Pervis Estupiñán", "Kendry Páez"],
        correcta: "Moisés Caicedo"
      },
      {
        id: 2,
        pregunta: "En el Torneo de 2006, Ecuador cayó eliminado en octavos con la frente en alto 1-0 ante Inglaterra. ¿Quién metió ese gol de tiro libre?",
        opciones: ["David Beckham", "Steven Gerrard", "Wayne Rooney", "Frank Lampard"],
        correcta: "David Beckham"
      },
      {
        id: 3,
        pregunta: "¿Quién fue el eminente estratega colombiano que llevó al combinado ecuatoriano a su primer de torneo absoluto en el 2002?",
        opciones: ["Hernán Darío 'Bolillo' Gómez", "Reinaldo Rueda", "Luis Fernando Suárez", "Gustavo Alfaro"],
        correcta: "Hernán Darío 'Bolillo' Gómez"
      }
    ]
  },
  "España": {
    1: [
      {
        id: 1,
        pregunta: "¿Con qué pasional apodo se le conoce formalmente a la selección española de fútbol?",
        opciones: ["La Albiceleste", "La Furia Roja", "La Celeste", "La Azzurra"],
        correcta: "La Furia Roja"
      },
      {
        id: 2,
        pregunta: "¿Qué recordada e histórica Copa de Selecciones conquistó España para sellar su primera estrella?",
        opciones: ["Alemania 2006", "Sudáfrica 2010", "Brasil 2014", "Corea-Japón 2002"],
        correcta: "Sudáfrica 2010"
      },
      {
        id: 3,
        pregunta: "¿Cuáles son los colores representativos de la camiseta titular de España?",
        opciones: ["Blanco y Negro", "Camiseta Roja y Pantalón Azul", "Verde y Blanco", "Azul y Amarillo"],
        correcta: "Camiseta Roja y Pantalón Azul"
      },
      {
        id: 4,
        pregunta: "¿En qué año se consagró España campeona del mundo por primera vez en su historia?",
        opciones: ["2006", "2010", "2014"],
        correcta: "2010"
      },
      {
        id: 5,
        pregunta: "¿Cuál es el famoso y veloz apodo que tiene la selección nacional de fútbol de España?",
        opciones: ["La Roja", "Los Toros", "La Furia Armada"],
        correcta: "La Roja"
      },
      {
        id: 6,
        pregunta: "¿Quién es el máximo goleador histórico de la selección de España en fases finales de Torneos de Selecciones?",
        opciones: ["Raúl González", "David Villa", "Fernando Torres"],
        correcta: "David Villa"
      }
    ],
    2: [
      {
        id: 1,
        pregunta: "¿Qué legendario guardameta e icono de la portería de España tapó un mano a mano providencial a Robben en la final de 2010?",
        opciones: ["Víctor Valdés", "Iker Casillas", "Pepe Reina", "David de Gea"],
        correcta: "Iker Casillas"
      },
      {
        id: 2,
        pregunta: "¿Qué menudo centrocampista y genio de Fuentealbilla anotó el gol decisivo al minuto 116 en la final de 2010?",
        opciones: ["Xavi Hernández", "Andrés Iniesta", "Cesc Fàbregas", "Xabi Alonso"],
        correcta: "Andrés Iniesta"
      },
      {
        id: 3,
        pregunta: "¿De qué laureado estilo de posesión, control absoluto y pases cortos fue España el principal exponente del mundo?",
        opciones: ["Tiki-Taka", "Catenaccio", "Samba", "Fútbol Directo"],
        correcta: "Tiki-Taka"
      },
      {
        id: 4,
        pregunta: "¿Qué rival europeo fue el contrincante de España en la gran final del Torneo de Sudáfrica 2010?",
        opciones: ["Alemania", "Países Bajos", "Inglaterra"],
        correcta: "Países Bajos"
      },
      {
        id: 5,
        pregunta: "¿Qué legendario portero capitaneó a España a levantar la Copa de Selecciones en 2010?",
        opciones: ["Iker Casillas", "Andoni Zubizarreta", "Pepe Reina"],
        correcta: "Iker Casillas"
      },
      {
        id: 6,
        pregunta: "¿Quién anotó el icónico gol de cabeza contra Alemania en la semifinal de Sudáfrica 2010, clasificando a España a la final?",
        opciones: ["Carles Puyol", "Gerard Piqué", "Sergio Ramos"],
        correcta: "Carles Puyol"
      }
    ],
    3: [
      {
        id: 1,
        pregunta: "¿Quién es el máximo anotador histórico nacional de la selección española de fútbol con 59 dianas?",
        opciones: ["Raúl González", "David Villa", "Fernando Torres", "Álvaro Morata"],
        correcta: "David Villa"
      },
      {
        id: 2,
        pregunta: "¿A qué histórico y aguerrido delantero le dio el pase de asistencia Cesc Fàbregas para el gol del campeonato de Iniesta en 2010?",
        opciones: ["David Villa", "Fernando Torres", "Andrés Iniesta", "Álvaro Arbeloa"],
        correcta: "Andrés Iniesta"
      },
      {
        id: 3,
        pregunta: "¿Qué místico centrocampista del Barça controlaba el círculo central de España y ostenta el récord de kilómetros recorridos y pases logrados en Sudáfrica 2010?",
        opciones: ["Sergio Busquets", "Xavi Hernández", "Xabi Alonso", "Cesc Fàbregas"],
        correcta: "Xavi Hernández"
      },
      {
        id: 4,
        pregunta: "¿Cuál fue el único país que logró vencer a España en su partido de debut en el exitoso Torneo de 2010?",
        opciones: ["Suiza", "Chile", "Honduras"],
        correcta: "Suiza"
      },
      {
        id: 5,
        pregunta: "¿En qué club español histórico militaba la gran mayoría de la columna vertebral y mediocampo titular campeona de 2010?",
        opciones: ["Real Madrid", "FC Barcelona", "Atlético de Madrid"],
        correcta: "FC Barcelona"
      },
      {
        id: 6,
        pregunta: "¿Quién fue el director técnico que guio con calma a España a su primer título de torneo en 2010?",
        opciones: ["Luis Aragonés", "Vicente del Bosque", "Pep Guardiola"],
        correcta: "Vicente del Bosque"
      }
    ]
  },
  "Argentina": {
    1: [
      {
        id: 1,
        pregunta: "¿Qué colores componen la camiseta oficial de la selección de Argentina?",
        opciones: ["Blanco y Negro", "Camiseta Celeste y Blanca a bastones verticales", "Azul y Amarillo", "Rojo y Blanco"],
        correcta: "Camiseta Celeste y Blanca a bastones verticales"
      },
      {
        id: 2,
        pregunta: "¿Cuál es el apodo popular histórico de la Selección de Argentina?",
        opciones: ["La Roja", "La Celeste", "La Albiceleste", "La Canarinha"],
        correcta: "La Albiceleste"
      },
      {
        id: 3,
        pregunta: "¿Cuántos Torneos de Selecciones del fútbol internacional ha ganado Argentina en su historia (hasta Catar 2022)?",
        opciones: ["1 Torneo", "2 Torneos de Selecciones", "3 Torneos de Selecciones", "4 Torneos de Selecciones"],
        correcta: "3 Torneos de Selecciones"
      },
      {
        id: 4,
        pregunta: "¿Cuántas Copas del Mundo del fútbol internacional ha ganado la selección de Argentina en toda su historia?",
        opciones: ["2", "3", "4"],
        correcta: "3"
      },
      {
        id: 5,
        pregunta: "¿Quién es considerado de forma unánime el máximo astro y capitán que guio a Argentina a ganar su tercer título en Qatar 2022?",
        opciones: ["Diego Maradona", "Lionel Messi", "Ángel Di María"],
        correcta: "Lionel Messi"
      },
      {
        id: 6,
        pregunta: "¿Cómo se llama el clásico e histórico y más apasionado apodo de la selección argentina?",
        opciones: ["La Albiceleste", "El Tri", "La Scaloneta"],
        correcta: "La Albiceleste"
      }
    ],
    2: [
      {
        id: 1,
        pregunta: "¿Contra qué país marcó Diego Maradona el famoso gol conocido como 'La mano de Dios' en 1986?",
        opciones: ["Alemania Federal", "Bélgica", "Inglaterra", "Uruguay"],
        correcta: "Inglaterra"
      },
      {
        id: 2,
        pregunta: "¿Quién era el director técnico de la selección argentina campeona del mundo en el Torneo de 1978?",
        opciones: ["Carlos Salvador Bilardo", "César Luis Menotti", "Alfio Basile", "Marcelo Bielsa"],
        correcta: "César Luis Menotti"
      },
      {
        id: 3,
        pregunta: "¿Qué jugador argentino fue el máximo goleador del Torneo de Estados Unidos 1994 con 4 goles?",
        opciones: ["Diego Maradona", "Gabriel Batistuta", "Claudio Caniggia", "Ariel Ortega"],
        correcta: "Gabriel Batistuta"
      },
      {
        id: 4,
        pregunta: "¿Quién fue el director técnico (entrenador) que dirigió a Argentina en la consagración de Qatar 2022?",
        opciones: ["Lionel Scaloni", "Alejandro Sabella", "Gerardo Martino"],
        correcta: "Lionel Scaloni"
      },
      {
        id: 5,
        pregunta: "¿En qué país se celebró la Copa de Selecciones de 1978, donde Argentina se coronó campeona por primera vez?",
        opciones: ["México", "Argentina", "España"],
        correcta: "Argentina"
      },
      {
        id: 6,
        pregunta: "¿Qué apodo recibió el combinado albiceleste bajo la dirección técnica de Lionel Scaloni rumbo a sus campeonatos de Copa América y del Mundo?",
        opciones: ["La Scaloneta", "Los Héroes de Qatar", "La Armada de Messi"],
        correcta: "La Scaloneta"
      }
    ],
    3: [
      {
        id: 1,
        pregunta: "En la final del Torneo de México 1986, ¿quién dio la asistencia clave para el gol consagratorio de Jorge Burruchaga?",
        opciones: ["Jorge Valdano", "Diego Maradona", "Julio Olarticoechea", "Héctor Enrique"],
        correcta: "Diego Maradona"
      },
      {
        id: 2,
        pregunta: "En el Torneo de Italia 1990, ¿quién fue el héroe en los penales tras la fractura de Nery Pumpido?",
        opciones: ["Sergio Goycochea", "Luis Islas", "Carlos Roa", "Ubaldo Fillol"],
        correcta: "Sergio Goycochea"
      },
      {
        id: 3,
        pregunta: "¿Qué dorsal utilizó Lionel Messi en su debut de torneoista absoluto contra Serbia y Montenegro en Alemania 2006?",
        opciones: ["Dorsal 10", "Dorsal 18", "Dorsal 19", "Dorsal 30"],
        correcta: "Dorsal 19"
      },
      {
        id: 4,
        pregunta: "¿Contra qué selección debutó Lionel Messi en los Torneos de Selecciones, anotando además su primer gol de torneoista (Alemania 2006)?",
        opciones: ["Serbia y Montenegro", "Costa de Marfil", "Países Bajos"],
        correcta: "Serbia y Montenegro"
      },
      {
        id: 5,
        pregunta: "¿Quién anotó el gol de la victoria en la gran final de México 1986 contra Alemania Federal tras un pase de Maradona?",
        opciones: ["Jorge Burruchaga", "Jorge Valdano", "Oscar Ruggeri"],
        correcta: "Jorge Burruchaga"
      },
      {
        id: 6,
        pregunta: "¿Qué arquero argentino fue galardonado con el Guante de Oro al mejor guardameta en el Torneo de Qatar 2022?",
        opciones: ["Emiliano \"Dibu\" Martínez", "Franco Armani", "Sergio Romero"],
        correcta: "Emiliano \"Dibu\" Martínez"
      }
    ]
  },
  "Francia": {
    1: [
      {
        id: 1,
        pregunta: "¿Cuál es el famoso y heroico apodo oficial de la selección de Francia?",
        opciones: ["Les Bleus (Los Azules)", "El Gallo Galo", "Los Tricolores", "Todas las opciones son válidas de forma informal/oficial"],
        correcta: "Todas las opciones son válidas de forma informal/oficial"
      },
      {
        id: 2,
        pregunta: "¿Cuántos campeonatos torneos de selecciones absolutos de fútbol del fútbol internacional ha ganado la selección de Francia?",
        opciones: ["1 Torneo", "2 Torneos de Selecciones", "3 Torneos de Selecciones", "4 Torneos de Selecciones"],
        correcta: "2 Torneos de Selecciones"
      },
      {
        id: 3,
        pregunta: "¿Qué superestrella del ataque de Francia y del Real Madrid es célebre por su capitanía, velocidad y goles de récord?",
        opciones: ["Antoine Griezmann", "Kylian Mbappé", "Olivier Giroud", "Zinedine Zidane"],
        correcta: "Kylian Mbappé"
      },
      {
        id: 4,
        pregunta: "¿Cuántas Copas del Mundo del fútbol internacional ha ganado la selección de Francia en toda su historia?",
        opciones: ["Dos (1998 y 2018)", "Tres", "Una"],
        correcta: "Dos (1998 y 2018)"
      },
      {
        id: 5,
        pregunta: "¿Quién es considerado el máximo estandarte actual y capitán de la selección de Francia, estrella del Real Madrid?",
        opciones: ["Karim Benzema", "Antoine Griezmann", "Kylian Mbappé"],
        correcta: "Kylian Mbappé"
      },
      {
        id: 6,
        pregunta: "¿Cuál es el color tradicional de la camiseta local titular de la selección de Francia?",
        opciones: ["Azul", "Blanco", "Rojo"],
        correcta: "Azul"
      }
    ],
    2: [
      {
        id: 1,
        pregunta: "¿Qué elegante mediocampista zurdo y número 10 es considerado el héroe de Francia al marcar dos cabezazos en la final de 1998 ante Brasil (3-0)?",
        opciones: ["Michel Platini", "Zinedine Zidane", "Thierry Henry", "Didier Deschamps"],
        correcta: "Zinedine Zidane"
      },
      {
        id: 2,
        pregunta: "¿Quién es el máximo goleador histórico absoluto de la selección de Francia de todos los tiempos que superó a Henry?",
        opciones: ["Kylian Mbappé", "Olivier Giroud", "Karim Benzema", "Thierry Henry"],
        correcta: "Olivier Giroud"
      },
      {
        id: 3,
        pregunta: "¿A qué rival derrotó Francia por 4-2 en una asombrosa final llena de goles para coronarse campeón en Rusia 2018?",
        opciones: ["Croacia", "Bélgica", "Argentina", "Inglaterra"],
        correcta: "Croacia"
      },
      {
        id: 4,
        pregunta: "¿Quién fue el director técnico (entrenador) que guio a Francia a consagrarse campeona de torneo en Rusia 2018?",
        opciones: ["Didier Deschamps", "Zinedine Zidane", "Laurent Blanc"],
        correcta: "Didier Deschamps"
      },
      {
        id: 5,
        pregunta: "¿Contra qué rival histórico de Sudamérica se coronó campeona del mundo Francia por primera vez en su historia en 1998?",
        opciones: ["Argentina", "Brasil", "Uruguay"],
        correcta: "Brasil"
      },
      {
        id: 6,
        pregunta: "¿Qué delantero tiene el récord histórico como el máximo goleador de todos los tiempos de la selección francesa?",
        opciones: ["Olivier Giroud", "Thierry Henry", "Kylian Mbappé"],
        correcta: "Olivier Giroud"
      }
    ],
    3: [
      {
        id: 1,
        pregunta: "¿Quién era el seleccionador nacional y ex capitán de Francia que se coronó en Rusia 2018 y guió el bicampeonato?",
        opciones: ["Laurent Blanc", "Didier Deschamps", "Zinedine Zidane", "Raymond Domenech"],
        correcta: "Didier Deschamps"
      },
      {
        id: 2,
        pregunta: "¿Qué delantero francés de época anotó un hat-trick espectacular en la final de Catar 2022 a pesar de quedar subcampeón?",
        opciones: ["Antoine Griezmann", "Kylian Mbappé", "Olivier Giroud", "Kingsley Coman"],
        correcta: "Kylian Mbappé"
      },
      {
        id: 3,
        pregunta: "¿Qué legendario atacante de Francia con un sensacional remate cruzado ostenta el récord histórico nacional de marcar en 4 torneos europeos de Eurocopa y torneos de selecciones?",
        opciones: ["Thierry Henry", "Michel Platini", "Zinedine Zidane", "Just Fontaine"],
        correcta: "Thierry Henry"
      },
      {
        id: 4,
        pregunta: "¿Qué legendario delantero francés impuso el récord de más goles anotados en una sola edición de un Torneo, con 13 tantos en Suecia 1958?",
        opciones: ["Just Fontaine", "Michel Platini", "Thierry Henry"],
        correcta: "Just Fontaine"
      },
      {
        id: 5,
        pregunta: "¿Con qué marcador finalizó el tiempo regular y prórroga en la espectacular final de Qatar 2022 entre Francia y Argentina, previo a los penales?",
        opciones: ["2 – 2", "3 – 3", "4 – 4"],
        correcta: "3 – 3"
      },
      {
        id: 6,
        pregunta: "¿En qué club español histórico milita actualmente el letal delantero Antoine Griezmann?",
        opciones: ["Real Madrid", "Atlético de Madrid", "FC Barcelona"],
        correcta: "Atlético de Madrid"
      }
    ]
  },
  "Colombia": {
    1: [
      {
        id: 1,
        pregunta: "¿Cuál es el apodo oficial de sabor de la selección nacional colombiana?",
        opciones: ["Los Cafeteros", "La Tricolor de América", "Los Caleños", "Todas las opciones son válidas de forma informal/oficial"],
        correcta: "Todas las opciones son válidas de forma informal/oficial"
      },
      {
        id: 2,
        pregunta: "¿Qué talentoso mediapunta zurdo y ex número 10 del Real Madrid se consagró como el bota de oro en Brasil 2014?",
        opciones: ["Radamel Falcao", "James Rodríguez", "Luis Díaz", "Juan Fernando Quintero"],
        correcta: "James Rodríguez"
      },
      {
        id: 3,
        pregunta: "¿Cuál es el color predominante del uniforme de local de la selección de Colombia?",
        opciones: ["Rojo", "Azul", "Amarillo Canario", "Blanco"],
        correcta: "Amarillo Canario"
      }
    ],
    2: [
      {
        id: 1,
        pregunta: "¿Quién es el icónico jugador de frondosa melena rubia y pases de fantasía de la Colombia de los años 90?",
        opciones: ["Freddy Rincón", "Carlos 'El Pibe' Valderrama", "Faustino Asprilla", "René Higuita"],
        correcta: "Carlos 'El Pibe' Valderrama"
      },
      {
        id: 2,
        pregunta: "¿Qué guardameta inventó la acrobática atajada llamada 'El Escorpión' en el Estadio de Wembley?",
        opciones: ["David Ospina", "René Higuita", "Faryd Mondragón", "Oscar Córdoba"],
        correcta: "René Higuita"
      },
      {
        id: 3,
        pregunta: "¿Qué selección centroeuropea empató de forma electrizante 1-1 con gol agónico de Freddy Rincón en el de torneo de Italia 1990?",
        opciones: ["Alemania Federal", "Yugoslavia", "Italia", "Camerún"],
        correcta: "Alemania Federal"
      }
    ],
    3: [
      {
        id: 1,
        pregunta: "¿Quién de los siguientes atacantes es el máximo goleador histórico de la selección caribeña de Colombia?",
        opciones: ["Carlos Bacca", "Radamel Falcao García", "James Rodríguez", "Jackson Martínez"],
        correcta: "Radamel Falcao García"
      },
      {
        id: 2,
        pregunta: "En el Torneo de 2014, ¿qué gol antológico de volea de James Rodríguez recibió el premio Puskás al mejor gol del año?",
        opciones: ["La volea al ángulo de volea contra Uruguay en Octavos", "El tiro libre colocado contra Brasil", "El sombrerito picado contra Japón", "El penal seguro a Costa de Marfil"],
        correcta: "La volea al ángulo de volea contra Uruguay en Octavos"
      },
      {
        id: 3,
        pregunta: "¿Quién ostenta el récord de ser el jugador más longevo en disputar una fase final del Torneo con la camiseta colombiana (con 43 años y 3 días)?",
        opciones: ["Carlos Valderrama", "Faryd Mondragón", "Mario Yepes", "René Higuita"],
        correcta: "Faryd Mondragón"
      }
    ]
  },
  "Portugal": {
    1: [
      {
        id: 1,
        pregunta: "¿Qué asombroso atacante y leyenda de torneo apodado 'El Bicho' capitanea a Portugal?",
        opciones: ["Luís Figo", "Cristiano Ronaldo (CR7)", "Bruno Fernandes", "Eusébio"],
        correcta: "Cristiano Ronaldo (CR7)"
      },
      {
        id: 2,
        pregunta: "¿Cuál es el color rojo vino clásico y verde nacional de la camiseta local de Portugal?",
        opciones: ["Blanco Puro", "Rojo Granate / Escarlata", "Azul y Amarillo", "Verde Oliva"],
        correcta: "Rojo Granate / Escarlata"
      },
      {
        id: 3,
        pregunta: "¿De qué importante torneo continental se coronó Portugal campeón absoluto en el año 2016 ganándole a una selección anfitriona?",
        opciones: ["Copa Asiática", "Eurocopa de la UEFA", "Copa Confederaciones", "Copa Oro"],
        correcta: "Eurocopa de la UEFA"
      }
    ],
    2: [
      {
        id: 1,
        pregunta: "¿Quién es el mítico atacante de los años 65 apodado 'La Pantera Negra' que lideró un tercer puesto luso?",
        opciones: ["Luís Figo", "Eusébio", "Rui Costa", "Nani"],
        correcta: "Eusébio"
      },
      {
        id: 2,
        pregunta: "¿Qué elegante mediocampista y Balón de Oro se consagró icono nacional de Portugal antes de retirarse (ex-Real Madrid)?",
        opciones: ["Ricardo Quaresma", "Luís Figo", "Deco", "Pauleta"],
        correcta: "Luís Figo"
      },
      {
        id: 3,
        pregunta: "¿A qué selección anfitriona derrotó Portugal estrepitosamente en tiempo extra de la final de la Euro 2016 con gol de Eder?",
        opciones: ["Francia", "Alemania", "Inglaterra", "Bélgica"],
        correcta: "Francia"
      }
    ],
    3: [
      {
        id: 1,
        pregunta: "¿Qué asombroso hat-trick de Cristiano Ronaldo con gol de tiro libre agónico rescató un electrizante empate en fase de grupos de 2018?",
        opciones: ["Empate contra España (3-3)", "Victoria contra Irán (1-0)", "Empate contra Marruecos (1-1)", "Victoria contra Uruguay (2-1)"],
        correcta: "Empate contra España (3-3)"
      },
      {
        id: 2,
        pregunta: "¿Quién es la figura de la medular y capitanía del Manchester United que lidera tácticamente el plano conectivo del equipo?",
        opciones: ["Bruno Fernandes", "Bernardo Silva", "João Félix", "Rúben Neves"],
        correcta: "Bruno Fernandes"
      },
      {
        id: 3,
        pregunta: "¿Quién era el seleccionador luso de Portugal que resistió en el banquillo y condujo el soñado título continental de 2016?",
        opciones: ["Fernando Santos", "Paulo Bento", "Carlos Queiroz", "José Mourinho"],
        correcta: "Fernando Santos"
      }
    ]
  },
  "Inglaterra": {
    1: [
      {
        id: 1,
        pregunta: "¿Cuál es el famoso y poético apodo derivado de la heráldica real de la selección de Inglaterra?",
        opciones: ["The Three Lions (Los Tres Leones)", "The Red Devils", "The Bulldogs", "The Albion"],
        correcta: "The Three Lions (Los Tres Leones)"
      },
      {
        id: 2,
        pregunta: "¿Cuál fue la única Copa de Selecciones en la que Inglaterra se coronó campeón absoluto en casa?",
        opciones: ["Inglaterra 1966", "Alemania 1974", "Francia 1998", "Corea-Japón 2002"],
        correcta: "Inglaterra 1966"
      },
      {
        id: 3,
        pregunta: "¿Cuál es el color tradicional de la indumentaria titular (mangas cortas) de Inglaterra?",
        opciones: ["Rojo y Azul", "Camiseta Blanca y Pantalón Azul Marino", "Verde", "Amarillo"],
        correcta: "Camiseta Blanca y Pantalón Azul Marino"
      }
    ],
    2: [
      {
        id: 1,
        pregunta: "¿Qué virtuoso centrocampista anglosajón, famoso por sus cobros perfectos de tiros libres, fue capitán del Real Madrid y el Man United?",
        opciones: ["Wayne Rooney", "David Beckham", "Bobby Charlton", "Steven Gerrard"],
        correcta: "David Beckham"
      },
      {
        id: 2,
        pregunta: "¿Quién es el artillero estrella de la selección inglesa, actual del Bayern Múnich, máximo anotador histórico del seleccionado?",
        opciones: ["Harry Kane", "Wayne Rooney", "Raheem Sterling", "Bukayo Saka"],
        correcta: "Harry Kane"
      },
      {
        id: 3,
        pregunta: "¿Qué talentoso mediocampista ex del Dortmund fue fichado de forma estelar por el Real Madrid y brilla con apenas 20 años?",
        opciones: ["Phil Foden", "Declan Rice", "Jude Bellingham", "Cole Palmer"],
        correcta: "Jude Bellingham"
      }
    ],
    3: [
      {
        id: 1,
        pregunta: "¿Qué delantero checo-inglés marcó un polémico 'gol fantasma' que rebotó en el travesaño en la final de 1966?",
        opciones: ["Geoff Hurst", "Bobby Charlton", "Jimmy Greaves", "Roger Hunt"],
        correcta: "Geoff Hurst"
      },
      {
        id: 2,
        pregunta: "¿Quién es el legendario guardameta inglés que hizo 'La atajada del siglo' a cabezazo picado del brasileño Pelé en el Torneo de México 1970?",
        opciones: ["Gordon Banks", "Peter Shilton", "David Seaman", "Ray Clemence"],
        correcta: "Gordon Banks"
      },
      {
        id: 3,
        pregunta: "¿Qué sensacional extremo zurdo e icono goleador del Arsenal comanda la banda derecha de Inglaterra?",
        opciones: ["Bukayo Saka", "Phil Foden", "Marcus Rashford", "Jack Grealish"],
        correcta: "Bukayo Saka"
      }
    ]
  }
};

// Extremely rich and robust generic/dynamic fallback trivia generator
export function getPregeneratedTrivia(country: string, level: number): { pais: string, nivel: number, preguntas: Question[] } {
  // Check exact/partial match
  const matchKey = Object.keys(PREGENERATED_TRIVIA).find(
    k => k.toLowerCase().trim() === country.toLowerCase().trim()
  );

  if (matchKey && PREGENERATED_TRIVIA[matchKey]?.[level]) {
    const allQuestions = PREGENERATED_TRIVIA[matchKey][level] || [];
    // Shuffle the full pool of questions for this level of the selected country
    const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
    // Take a random set of exactly 3 questions
    const selected = shuffled.slice(0, 3);
    // Re-index to ensure IDs are sequential (1, 2, 3) for proper component tracking
    const mappedQuestions = selected.map((q, idx) => ({
      ...q,
      id: idx + 1
    }));

    return {
      pais: matchKey,
      nivel: level,
      preguntas: mappedQuestions
    };
  }

  // Generate highly realistic, beautiful contextual sports trivia questions dynamically in Spanish
  // representing any of the other 48 countries dynamically using specific country metadata!
  const apodos: { [key: string]: string } = {
    "Sudáfrica": "Bafana Bafana",
    "Uruguay": "La Celeste",
    "Japón": "Los Samuráis Azules",
    "Costa de Marfil": "Los Elefantes",
    "Marruecos": "Los Leones del Atlas",
    "Senegal": "Los Leones de la Teranga",
    "Croacia": "Los Vatreni",
    "Ghana": "Las Estrellas Negras",
    "Panamá": "La Marea Roja",
    "Egipto": "Los Faraones",
    "Suiza": "Los Helvéticos",
    "Australia": "Los Socceroos",
    "Camerún": "Los Leones Indomables",
    "Bélgica": "Los Diablos Rojos",
    "Países Bajos": "La Naranja Mecánica",
    "Suecia": "Los Azul y Amarillo",
    "Noruega": "Los Vikingos",
    "Argelia": "Los Zorros del Desierto",
    "Curazao": "La Familia Azul"
  };

  const apodo = apodos[country] || `El Seleccionado oficial de ${country}`;

  return {
    pais: country,
    nivel: level,
    preguntas: [
      {
        id: 1,
        pregunta: `Para desbloquear el Nivel ${level} de la colección de ${country}: ¿Cuál es el apodo o identidad futbolística histórica representativa de este país?`,
        opciones: [
          `${apodo} (Su identidad oficial de juego)`,
          "La Fuerza Emergente Continentales",
          "El Escuadrón del Círculo Central",
          "Los Leones Guerreros del Balón"
        ],
        correcta: `${apodo} (Su identidad oficial de juego)`
      },
      {
        id: 2,
        pregunta: `Considerando la rigurosa preparación y disciplina táctica de ${country} para el Torneo del 2026: ¿Cuál de las siguientes estrategias define su consolidación a nivel de torneo?`,
        opciones: [
          "Estabilidad en transiciones rápidas verticales por las bandas de alta exigencia física.",
          "Bloque bajo ultra defensivo esperando la decisión exclusiva por penaltis.",
          "Fútbol de pases estáticos en la medular sin cambio de velocidad posicional.",
          "Dependencia absoluta de un solo jugador estrella sin cohesión de equipo."
        ],
        correcta: "Estabilidad en transiciones rápidas verticales por las bandas de alta exigencia física."
      },
      {
        id: 3,
        pregunta: `Respecto a los rigurosos estatutos del Álbum Oficial Torneo 2026: ¿qué requisito necesita ${country} para activar su Pizarra Táctica de D.T.?`,
        opciones: [
          "Superar los 3 Niveles de Trivia (Cultura, Historia y Táctica Avanzada) para reclutar sus 26 cromos.",
          "Tener una membresía premium de alto costo pagada por la pasarela de suscripción.",
          "Ganar 10 partidos consecutivos en línea contra otros usuarios de la comunidad.",
          "Clasificar en primer lugar de su grupo en las simulaciones torneos de selecciones."
        ],
        correcta: "Superar los 3 Niveles de Trivia (Cultura, Historia y Táctica Avanzada) para reclutar sus 26 cromos."
      }
    ]
  };
}
