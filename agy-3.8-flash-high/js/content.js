/**
 * CRONOLOGÍA DE LAS 4 REVOLUCIONES INDUSTRIALES
 * Datos narrativos, guión cinematográfico, hitos y métricas para el video educativo
 */

const REVOLUTIONS_DATA = {
  meta: {
    title: "CRONOLOGÍA DE LAS 4 REVOLUCIONES INDUSTRIALES",
    subtitle: "DE LA MÁQUINA DE VAPOR A LA INTELIGENCIA ARTIFICIAL",
    edition: "EDICIÓN EDUCATIVA NEOBRUTALISTA // DOCU-SERIES V4.0",
    totalDuration: 260 // Duración total base en segundos (4 min 20 seg)
  },

  acts: [
    {
      id: "act-0",
      number: 0,
      title: "PROLEGÓMENO",
      subtitle: "EL LÍMITE DE LA FUERZA BIOLÓGICA",
      epoch: "ANTES DE 1760",
      themeColor: "#FFE600", // Cyber Yellow
      bgPattern: "dots",
      musicMode: "preindustrial",
      duration: 30,
      scenes: [
        {
          id: "scene-0-1",
          start: 0,
          end: 15,
          headline: "EL MUNDO MUSCULAR",
          subheadline: "99% de la fuerza provenía de músculos humanos y animales",
          narration: "Durante milenios, el progreso humano estuvo restringido a los límites de la biología. Molinos de viento, corrientes fluviales y animales de tiro dictaban la velocidad de la civilización.",
          keyPoints: [
            "Fuerza muscular y tracción animal dominante",
            "Producción artesanal dispersa y gremial",
            "90% de la población dedicada a la agricultura de subsistencia",
            "Velocidad de transporte limitada al galope del caballo"
          ],
          stat: { value: "3 km/h", label: "Velocidad media de transporte terrestre" },
          visualType: "windmill_clockwork",
          tag: "ERA PREINDUSTRIAL"
        },
        {
          id: "scene-0-2",
          start: 15,
          end: 30,
          headline: "LA TRAMPA ENERGÉTICA",
          subheadline: "La deforestación europea y el dilema del carbón",
          narration: "A mediados del siglo XVIII, Europa agotaba sus bosques para leña y fundición. Bajo tierra británica yacían mares negros de carbón fósil, pero un muro invisible frenaba su extracción: las minas se inundaban de agua.",
          keyPoints: [
            "Agotamiento del combustible de madera en Europa",
            "Inundación masiva de galerías carboníferas subterráneas",
            "El carbón de piedra como reserva de alta densidad energética",
            "Nace la necesidad urgente de una bomba mecánica imparable"
          ],
          stat: { value: "100%", label: "Dependencia de recursos orgánicos renovables lentos" },
          visualType: "mine_water",
          tag: "EL DETONANTE"
        }
      ]
    },

    {
      id: "act-1",
      number: 1,
      title: "1ª REVOLUCIÓN INDUSTRIAL",
      subtitle: "EL REINO DEL VAPOR Y EL CARBÓN",
      epoch: "c. 1760 – 1840",
      themeColor: "#FF5252", // Industrial Coral Red
      bgPattern: "diagonal-stripes",
      musicMode: "steam",
      duration: 55,
      scenes: [
        {
          id: "scene-1-1",
          start: 30,
          end: 45,
          headline: "1769: EL PISTÓN DE JAMES WATT",
          subheadline: "Separación del condensador: la energía térmica se hace trabajo continuo",
          narration: "En 1769, James Watt perfecciona la rudimentaria máquina de Newcomen. Al añadir una cámara de condensación independiente, multiplica por cuatro la eficiencia térmica. Por primera vez en la historia, el ser humano transforma calor fósil en fuerza motriz continua.",
          keyPoints: [
            "Condensador separado patentado por James Watt (1769)",
            "Transformación directa de carbón mineral en par rotatorio",
            "Independencia de ríos y molinos: fábricas ubicables en cualquier ciudad",
            "Nacimiento del caballo de fuerza (HP) como unidad de medida"
          ],
          stat: { value: "400%", label: "Aumento de eficiencia térmica respecto a Newcomen" },
          visualType: "steam_engine",
          tag: "ENERGÍA TÉRMICA // VAPOR"
        },
        {
          id: "scene-1-2",
          start: 45,
          end: 60,
          headline: "LA MAQUINARIA TEXTIL Y LA FÁBRICA",
          subheadline: "Hargreaves, Arkwright y Cartwright transforman el algodón",
          narration: "La hiladora Spinning Jenny y el telar mecánico devoran miles de horas manuales. El trabajo doméstico artesanal es aniquilado por la factoría moderna, donde cientos de obreros operan al compás síncrono de un eje central impulsado por vapor.",
          keyPoints: [
            "Spinning Jenny (1764) y Water Frame (1769)",
            "Telar mecánico de Edmund Cartwright (1785)",
            "Nace la fábrica moderna con disciplina de reloj y turnos",
            "Gran Bretaña se convierte en el 'Taller del Mundo'"
          ],
          stat: { value: "100x", label: "Multiplicación en producción de hilo textil" },
          visualType: "textile_loom",
          tag: "MECANIZACIÓN EN MASA"
        },
        {
          id: "scene-1-3",
          start: 60,
          end: 72,
          headline: "1825: EL CABALLO DE HIERRO",
          subheadline: "Stephenson y la 'Locomotion Nº 1' unen los territorios",
          narration: "En 1825, George Stephenson inaugura el ferrocarril Stockton-Darlington. La locomotora a vapor derriba las barreras de la geografía, transportando toneladas de hierro y carbón a velocidades jamás soñadas.",
          keyPoints: [
            "Locomotora 'The Rocket' de Robert Stephenson (1829)",
            "Reducción drástica del coste y tiempo de flete de mercancías",
            "Navegación a vapor en ríos y océanos con barcos de paletas",
            "Unificación de mercados nacionales e inicio del comercio globalizado"
          ],
          stat: { value: "48 km/h", label: "Velocidad récord de la locomotora Rocket (1829)" },
          visualType: "steam_locomotive",
          tag: "REVOLUCIÓN DEL TRANSPORTE"
        },
        {
          id: "scene-1-4",
          start: 72,
          end: 85,
          headline: "EL ÉXODO Y LA SOCIEDAD INDUSTRIAL",
          subheadline: "Nace la metrópolis fabril, el proletariado y la cuestión social",
          narration: "Millones de campesinos emigran a urbes como Manchester y Birmingham. Entre chimeneas y hollín nacen jornadas de 16 horas, el trabajo infantil, los sindicatos obreros y las primeras leyes laborales modernas.",
          keyPoints: [
            "Urbanización explosiva: ciudades sin saneamiento previo",
            "Aparición de dos clases antagónicas: burguesía industrial y proletariado",
            "Movimiento ludista (1811) y primeras protestas obreras",
            "Factory Acts británicas: regulación incipiente del trabajo fabril"
          ],
          stat: { value: "14-16 h", label: "Jornada laboral media diaria en fábricas iniciales" },
          visualType: "urban_smoke",
          tag: "METAMORFOSIS SOCIAL"
        }
      ]
    },

    {
      id: "act-2",
      number: 2,
      title: "2ª REVOLUCIÓN INDUSTRIAL",
      subtitle: "ELECTRICIDAD, ACERO Y PRODUCCIÓN EN SERIE",
      epoch: "c. 1870 – 1914",
      themeColor: "#00F0FF", // Electric Cyan
      bgPattern: "grid-lines",
      musicMode: "electricity",
      duration: 55,
      scenes: [
        {
          id: "scene-2-1",
          start: 85,
          end: 100,
          headline: "LA RED ELÉCTRICA Y EL PETRÓLEO",
          subheadline: "Faraday, Edison, Tesla y el motor de combustión interna",
          narration: "A partir de 1870, la electricidad destrona al vapor como fluido vital de la industria. Tesla y Westinghouse imponen la corriente alterna; Edison electrifica las ciudades con la bombilla incandescente, mientras el petróleo despierta los motores de combustión de Otto, Daimler y Diesel.",
          keyPoints: [
            "Generación y distribución eléctrica a gran escala (Corriente Alterna)",
            "Primeros pozos petrolíferos comerciales (Drake, 1859)",
            "Motor de 4 tiempos de Nikolaus Otto (1876) y motor Diesel (1893)",
            "La noche es derrotada por el alumbrado público eléctrico"
          ],
          stat: { value: "24/7", label: "Producción ininterrumpida gracias a la luz eléctrica" },
          visualType: "electric_grid",
          tag: "ENERGÍA ELECTROMAGNÉTICA"
        },
        {
          id: "scene-2-2",
          start: 100,
          end: 112,
          headline: "EL CONVERTIDOR BESSEMER Y EL ACERO",
          subheadline: "De la fundición quebradiza al acero estructural hiperresistente",
          narration: "El convertidor de Henry Bessemer y los hornos Siemens-Martin permiten producir acero en masa a una fracción del costo. Nacen los rascacielos de Chicago, puentes colosales, blindados navales y rieles de alta durabilidad.",
          keyPoints: [
            "Convertidor Bessemer (1856): descarburación rápida del arrabio mediante aire",
            "Reducción del costo del acero en más del 80%",
            "Eclosión de la ingeniería civil: Torre Eiffel (1889), Home Insurance Building",
            "Química industrial: colorantes sintéticos, abonos nitrogenados y aspirina"
          ],
          stat: { value: "-80%", label: "Desplome en el coste de producción del acero" },
          visualType: "bessemer_furnace",
          tag: "MATERIALES AVANZADOS"
        },
        {
          id: "scene-2-3",
          start: 112,
          end: 126,
          headline: "1913: FORD Y LA CADENA DE MONTAJE",
          subheadline: "Taylorismo y fordismo: el automóvil al alcance del obrero",
          narration: "En Highland Park en 1913, Henry Ford instala la cinta transportadora continua para el Modelo T. El operario ya no camina hacia el chasis: la pieza viaja hacia él. El tiempo de ensamblaje cae de 12 horas a 93 minutos, naciendo el consumo masivo y la clase media.",
          keyPoints: [
            "Cadena de montaje móvil continua en 1913",
            "Tiempo de ensamble de un chasis: de 728 minutos a 93 minutos",
            "Jornada de 8 horas y salario de 5 dólares al día (Five Dollar Day)",
            "Estandarización absoluta de piezas intercambiables"
          ],
          stat: { value: "93 min", label: "Tiempo récord de ensamblaje de un Ford T (vs 12 horas)" },
          visualType: "assembly_line",
          tag: "PRODUCCIÓN EN SERIE"
        },
        {
          id: "scene-2-4",
          start: 126,
          end: 140,
          headline: "COMUNICACIÓN A LA VELOCIDAD DE LA LUZ",
          subheadline: "Telégrafo transatlántico, teléfono de Bell y ondas hertzianas",
          narration: "Cables de cobre submarinos cruzan los océanos. El telégrafo eléctrico, el teléfono de Alexander Graham Bell y la radio de Marconi sincronizan la economía global en tiempo real. Nace la corporación multinacional.",
          keyPoints: [
            "Cable telegráfico transatlántico operativo (1866)",
            "Patente del teléfono por Bell (1876)",
            "Telegrafía sin hilos de Guillermo Marconi (1896)",
            "Surgimiento de los mercados bursátiles interconectados globalmente"
          ],
          stat: { value: "0.1 seg", label: "Latencia para transmitir señales a través del Atlántico" },
          visualType: "telecom_waves",
          tag: "TELECOMUNICACIÓN GLOBAL"
        }
      ]
    },

    {
      id: "act-3",
      number: 3,
      title: "3ª REVOLUCIÓN INDUSTRIAL",
      subtitle: "LA ERA DIGITAL, EL SILICIO E INTERNET",
      epoch: "c. 1969 – 2000s",
      themeColor: "#00E676", // Cyber Lime Green
      bgPattern: "circuit-board",
      musicMode: "synthwave",
      duration: 55,
      scenes: [
        {
          id: "scene-3-1",
          start: 140,
          end: 155,
          headline: "EL TRANSISTOR Y EL MICROPROCESADOR",
          subheadline: "De las válvulas de vacío al chip de silicio en Silicon Valley",
          narration: "En los Bell Labs nace el transistor (1947), sustituyendo las frágiles válvulas de vacío. En 1971, Intel lanza el microprocesador 4004 con 2.300 transistores en un único chip. La Ley de Moore inicia su carrera imparable: cada dos años se duplica la potencia de cálculo.",
          keyPoints: [
            "Invención del transistor por Bardeen, Brattain y Shockley (1947)",
            "Circuito integrado monolítico de Robert Noyce y Jack Kilby (1958)",
            "Intel 4004 (1971): primer microprocesador comercial en un solo chip",
            "Ley de Moore: miniaturización exponencial del procesamiento de datos"
          ],
          stat: { value: "2.300", label: "Transistores en el Intel 4004 (frente a 50 mil millones hoy)" },
          visualType: "microchip_bus",
          tag: "SEMICONDUCTORES"
        },
        {
          id: "scene-3-2",
          start: 155,
          end: 168,
          headline: "ROBÓTICA INDUSTRIAL Y PLCs",
          subheadline: "Los autómatas programables sustituyen el músculo humano",
          narration: "En 1961, el robot Unimate se une a la cadena de General Motors para fundición a presión. Con el autómata programable PLC (Modicon 084 en 1969), las fábricas dejan de depender de relés cableados fijos para reprogramarse mediante software.",
          keyPoints: [
            "Unimate (1961): primer robot industrial articulado para soldadura pesada",
            "Modicon 084 (1969): invención del PLC por Dick Morley",
            "Líneas de ensamblaje robotizadas de precisión automotriz y electrónica",
            "Transición del obrero manual al técnico de mantenimiento y programador"
          ],
          stat: { value: "0.1 mm", label: "Tolerancia de precisión robótica en soldadura repetitiva" },
          visualType: "robotic_arm",
          tag: "AUTOMATIZACIÓN PROGRAMABLE"
        },
        {
          id: "scene-3-3",
          start: 168,
          end: 182,
          headline: "1969-1991: DE ARPANET A LA WORLD WIDE WEB",
          subheadline: "La red de paquetes de datos y el hipertexto de Tim Berners-Lee",
          narration: "En octubre de 1969, ARPANET transmite su primer mensaje entre UCLA y Stanford. Dos décadas más tarde, Tim Berners-Lee inventa en el CERN la World Wide Web (HTTP, HTML y URL). La información mundial se desmaterializa en bits.",
          keyPoints: [
            "ARPANET (1969): protocolo de conmutación de paquetes TCP/IP",
            "Propuesta de la World Wide Web en el CERN por Tim Berners-Lee (1989)",
            "Navegador Mosaic (1993) y comercialización abierta de Internet",
            "Comercio electrónico naciente, correo electrónico y telecomunicación digital"
          ],
          stat: { value: "3.000 M+", label: "Personas conectadas a Internet en las primeras décadas" },
          visualType: "network_nodes",
          tag: "INTERNET & LA WEB"
        },
        {
          id: "scene-3-4",
          start: 182,
          end: 195,
          headline: "LA COMPUTADORA PERSONAL Y EL SOFTWARE",
          subheadline: "Apple, IBM y Microsoft llevan la informática al escritorio",
          narration: "La informática deja de ser monopolio de agencias militares y corporaciones gigantes. Apple II (1977) e IBM PC (1981) democratizan el cómputo. El software se convierte en el bien más codiciado y valorado de la economía contemporánea.",
          keyPoints: [
            "Revolución del PC: Altair 8800, Apple II e IBM PC con MS-DOS",
            "Interfaces gráficas de usuario (GUI), ratón y tipografía interactiva",
            "Hojas de cálculo (VisiCalc) que revolucionan la gestión financiera",
            "Energía nuclear de fisión y primeros pasos en energías solares y eólicas"
          ],
          stat: { value: "1.000.000x", label: "Abaratamiento del coste por operación de cómputo" },
          visualType: "pc_terminal",
          tag: "SOCIEDAD DE LA INFORMACIÓN"
        }
      ]
    },

    {
      id: "act-4",
      number: 4,
      title: "4ª REVOLUCIÓN INDUSTRIAL",
      subtitle: "INDUSTRIA 4.0: IA, CYBER-FÍSICO Y BIOLOGÍA",
      epoch: "2016 – PRESENTE & FUTURO",
      themeColor: "#9D4EDD", // Cyber Neon Violet
      bgPattern: "matrix-grid",
      musicMode: "cyberpunk",
      duration: 50,
      scenes: [
        {
          id: "scene-4-1",
          start: 195,
          end: 208,
          headline: "LA CONVERGENCIA TOTAL: INDUSTRIA 4.0",
          subheadline: "La fusión irreversible de los dominios FÍSICO, DIGITAL y BIOLÓGICO",
          narration: "Formulada en el Foro Económico Mundial de 2016 por Klaus Schwab, la Cuarta Revolución Industrial no se define por herramientas aisladas, sino por la fusión ubicua entre átomos, bits y código genético. Sistemas ciberfísicos que se optimizan sin supervisión humana.",
          keyPoints: [
            "Concepto acuñado en Hannover Messe (2011) y popularizado por Schwab (2016)",
            "Interconexión holística de toda la cadena de valor mediante sensores IoT",
            "Gemelos Digitales (Digital Twins): réplicas virtuales en tiempo real de fábricas y órganos",
            "Manufactura aditiva (impresión 3D industrial) y nuevos metamateriales"
          ],
          stat: { value: "50.000 M", label: "Dispositivos conectados IoT activos globalmente" },
          visualType: "cyber_physical_core",
          tag: "FUSIÓN MULTIDOMINIO"
        },
        {
          id: "scene-4-2",
          start: 208,
          end: 220,
          headline: "INTELIGENCIA ARTIFICIAL & DEEP LEARNING",
          subheadline: "Redes neuronales, modelos generativos y computación cuántica",
          narration: "Algoritmos con billones de parámetros aprenden a razonar, crear código, diseñar proteínas y predecir sistemas complejos. La computación ya no solo ejecuta instrucciones humanas: sintetiza nuevo conocimiento a velocidades sobrehumanas.",
          keyPoints: [
            "Transformers y Modelos de Lenguaje Masivos (LLMs)",
            "AlphaFold: resolución del plegamiento de proteínas en biología molecular",
            "Computación cuántica de qubits superconductores y fotónica",
            "Visión por computadora en navegación autónoma y diagnóstico médico"
          ],
          stat: { value: ">10^15", label: "Operaciones de coma flotante por segundo en chips de IA" },
          visualType: "neural_network_3d",
          tag: "INTELIGENCIA SINTÉTICA"
        },
        {
          id: "scene-4-3",
          start: 220,
          end: 232,
          headline: "BIOLOGÍA SINTÉTICA Y COGNICIÓN",
          subheadline: "Edición genética CRISPR, nanotecnología e interfaces BCI",
          narration: "El código de la vida se vuelve editable como un programa de software. Con CRISPR-Cas9 la medicina personaliza terapias genéticas, mientras las interfaces cerebro-computadora exploran la integración directa entre neuronas biológicas y chips de silicio.",
          keyPoints: [
            "Edición genómica precisa con CRISPR-Cas9 (Doudna y Charpentier)",
            "Interfaces cerebro-ordenador (Neuralink, Synchron) para restaurar movilidad",
            "Robots colaborativos (Cobots) operando hombro a hombro con humanos",
            "Vehículos totalmente autónomos y drones de logística autónoma"
          ],
          stat: { value: "3.200 M", label: "Pares de bases de ADN humano editables digitalmente" },
          visualType: "dna_cyber_mesh",
          tag: "CÓDIGO BIOLÓGICO"
        },
        {
          id: "scene-4-4",
          start: 232,
          end: 245,
          headline: "LOS GRANDES DILEMAS DEL ANTROPOCENO",
          subheadline: "Ética de la IA, soberanía de datos y sostenibilidad planetaria",
          narration: "El poder tecnológico sin precedentes exige una gobernanza ética sin precedentes. La automatización del trabajo cognitivo, la huella energética del cómputo masivo y el control de datos sensibles sitúan a la humanidad ante su mayor prueba moral.",
          keyPoints: [
            "Automatización del trabajo intelectual y transformación del empleo",
            "Seguridad de datos, privacidad biométrica y ciberamenazas autónomas",
            "Transición ecológica obligatoria: descarbonización y economía circular",
            "Alineamiento de la inteligencia artificial con el bienestar humano"
          ],
          stat: { value: "100%", label: "Necesidad de gobernanza ética y ecológica compartida" },
          visualType: "dilemma_balance",
          tag: "DESAFÍO ÉTICO"
        }
      ]
    },

    {
      id: "act-5",
      number: 5,
      title: "EPÍLOGO & SÍNTESIS",
      subtitle: "LA CURVA EXPONENCIAL DEL DESTINO HUMANO",
      epoch: "COMPARATIVA HISTÓRICA TOTAL",
      themeColor: "#FFFFFF", // Stark White Neobrutalist
      bgPattern: "checkerboard",
      musicMode: "triumph",
      duration: 15,
      scenes: [
        {
          id: "scene-5-1",
          start: 245,
          end: 260,
          headline: "EL ACELERADOR HISTÓRICO",
          subheadline: "De siglos a décadas, de décadas a milisegundos",
          narration: "En menos de 300 años pasamos de la leña y el caballo a explorar el cosmos y diseñar vida artificial. Las cuatro revoluciones industriales no son solo capítulos del pasado: son los cimientos sobre los que decidiremos quiénes seremos mañana.",
          keyPoints: [
            "1ª Rev: Mecanización del músculo (Vapor y Carbón)",
            "2ª Rev: Multiplicación de la escala (Electricidad y Petróleo)",
            "3ª Rev: Automatización del cálculo (Silicio e Internet)",
            "4ª Rev: Integración de mente, máquina y genoma (IA e Industria 4.0)"
          ],
          stat: { value: "300 años", label: "Para transformar 10.000 años de historia agraria" },
          visualType: "comparison_matrix",
          tag: "SÍNTESIS FINAL"
        }
      ]
    }
  ],

  // Matriz comparativa para consulta rápida e interactiva
  comparisonMatrix: [
    {
      revolution: "1ª Revolución",
      period: "1760 – 1840",
      keyEnergy: "Carbón mineral & Vapor",
      flagshipInvention: "Máquina de Vapor (Watt) & Telar Mecánico",
      transport: "Ferrocarril a vapor & Barco fluvial",
      communication: "Prensa mecánica & Correo a caballo",
      socialShift: "Éxodo rural, nacimiento de la fábrica y el proletariado",
      color: "#FF5252"
    },
    {
      revolution: "2ª Revolución",
      period: "1870 – 1914",
      keyEnergy: "Electricidad & Petróleo",
      flagshipInvention: "Cadena de montaje (Ford), Acero Bessemer & Bombilla",
      transport: "Automóvil de combustión, Aviación & Rieles de acero",
      communication: "Telégrafo, Teléfono & Radio",
      socialShift: "Sociedad de consumo, clase media asalariada y metrópolis",
      color: "#00F0FF"
    },
    {
      revolution: "3ª Revolución",
      period: "1969 – 2000s",
      keyEnergy: "Energía Nuclear, Renovables & Red Eléctrica Digital",
      flagshipInvention: "Transistor, Microprocesador & Computadora Personal",
      transport: "Trenes de alta velocidad, Aviación comercial de turbina",
      communication: "Internet, World Wide Web & Telecomunicación satelital",
      socialShift: "Globalización financiera y sociedad de la información",
      color: "#00E676"
    },
    {
      revolution: "4ª Revolución",
      period: "2016 – Presente",
      keyEnergy: "Renovables avanzadas, Almacenamiento ión-litio & Fusión experimental",
      flagshipInvention: "Inteligencia Artificial, IoT, Impresión 3D & CRISPR",
      transport: "Vehículos autónomos eléctricos, Drones y Movilidad conectada",
      communication: "Redes 5G/6G, Ciberespacio inmersivo & Nube distribuida",
      socialShift: "Automatización cognitiva, bioética e integración ciberfísica",
      color: "#9D4EDD"
    }
  ]
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = REVOLUTIONS_DATA;
}
