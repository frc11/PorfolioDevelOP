import type { PreguntaFrecuente } from '../_componentes/faq/preguntas'

/**
 * [L7b] EL TEXTO DE NOSOTROS — la historia sale de lo que escribió Valentino (`ESTRUCTURA-PAGINAS.md`), expandida sin sumar hechos; los
 * valores son los suyos, palabra por palabra. Genérico pero real: Valentino lo ajusta después.
 */
export const INTRO_DE_NOSOTROS = {
  bajada: 'Somos Franco y Valentino, dos amigos de Tucumán que hacemos sitios, software y automatizaciones para negocios.',
  etiqueta: 'De qué se trata',
  deQueSeTrata: 'Esta es nuestra historia, cómo trabajamos y lo que nos importa a la hora de ocuparnos de tu proyecto.',
} as const

export const HISTORIA = {
  titulo: 'Nuestra historia',
  parrafos: [
    'Somos dos amigos que nos conocemos de toda la vida. Fuimos al mismo colegio y, cuando llegó el momento de elegir, decidimos estudiar la misma carrera.',
    'Estudiamos en la Universidad Nacional de Tucumán, en la Facultad de Ciencias Exactas (FACET), y los dos estamos en el último año. Nos desenvolvemos bien en lo académico y somos de Tucumán, de Yerba Buena.',
    'Con el final de la carrera cerca nos quedó un hambre: trabajar, crecer y ganar experiencia. Queremos emprender siendo dueños de nuestro propio negocio y entregar un trabajo de calidad excepcional. Los dos somos perfeccionistas y trabajadores: no paramos hasta terminar todo.',
    'Más allá de lo económico, develOP significa para nosotros crecimiento personal y el forjamiento de una marca que va a guiar nuestras vidas. No es un proyecto aislado: es nuestra historia y la huella que queremos dejar. Nuestra idea es ofrecer soluciones tecnológicas a empresas que las necesiten, no solo acá sino también afuera. No tenemos límites.',
  ],
} as const

export const EQUIPO = {
  titulo: 'El equipo',
  franco: {
    texto:
      'Franco se ocupa de la estrategia, de lo comercial y de la planificación. Su trabajo es entender qué necesita tu negocio, ordenar lo que hay que hacer y armar el camino para llegar. Es enfocado, creativo y perfeccionista, y se encarga de toda la estructura de develOP, para que cada proyecto tenga un orden claro de principio a fin.',
  },
  valentino: {
    texto:
      'Valentino está a cargo de la ejecución técnica: escribe el sistema, lo pone a andar y lo mantiene. Es obsesivo, curioso e inconformista, de los que no se conforman con que algo funcione si todavía se puede hacer mejor. Se ocupa de que lo que se planificó se vea y se comporte como corresponde, tanto en la computadora como en el teléfono.',
  },
} as const

export const PROCESO = {
  titulo: 'Cómo trabajamos',
  bajada: 'Cuatro pasos, sin sorpresas: sabés qué viene antes de que arranque.',
  pasos: [
    { numero: '01', titulo: 'Hablamos y entendemos tu negocio', texto: 'Empezamos conversando. Queremos saber a qué te dedicás, qué necesitás y qué te está faltando hoy.' },
    { numero: '02', titulo: 'Propuesta y presupuesto antes de empezar', texto: 'Te contamos qué proponemos y cuánto cuesta, por escrito. Si estás de acuerdo, arrancamos.' },
    { numero: '03', titulo: 'Construimos con revisiones en el camino', texto: 'Vas viendo cómo avanza y nos decís qué cambiarías. Ajustamos sobre la marcha, no al final.' },
    { numero: '04', titulo: 'Entrega, panel y soporte', texto: 'Te entregamos todo funcionando, con tu panel para seguir tu proyecto, y seguimos a tu lado después.' },
  ],
} as const

export const VALORES = {
  titulo: 'Nuestros valores',
  lista: [
    { nombre: 'Transparencia', texto: 'Vas a saber en todo momento en qué estado está tu proyecto, qué estamos haciendo y por qué. Sin letra chica ni costos escondidos.' },
    { nombre: 'Compromiso', texto: 'Cuando tomamos un proyecto, lo tratamos como si fuera nuestro. Cumplimos lo que acordamos y no lo soltamos hasta que funcione como tiene que funcionar.' },
    { nombre: 'Honestidad', texto: 'Si algo no se puede hacer, o no te conviene, te lo decimos de frente, aunque eso signifique no venderte nada.' },
    { nombre: 'Cooperación', texto: 'Trabajamos con vos, no para vos. Tu conocimiento del negocio y el nuestro de la tecnología se suman en cada decisión.' },
    { nombre: 'Calidad', texto: 'Cuidamos cada detalle, de lo que se ve a lo que no se ve. No entregamos nada que no usaríamos nosotros mismos.' },
  ],
} as const

export const CTA_DE_NOSOTROS = {
  titulo: '¿Charlamos sobre tu proyecto?',
  texto: 'Contanos qué necesitás. Te respondemos nosotros, sin vueltas.',
  rotulo: 'Hablemos',
} as const

export const PREGUNTAS_DE_NOSOTROS: readonly PreguntaFrecuente[] = [
  { pregunta: '¿Quiénes se ocupan de mi proyecto?', respuesta: 'Franco y Valentino, los dos socios de develOP. Franco lleva la estrategia, lo comercial y la planificación; Valentino, la parte técnica. Hablás directamente con quienes lo construyen.' },
  { pregunta: '¿Cómo empezamos a trabajar juntos?', respuesta: 'Nos escribís y conversamos para entender tu negocio. Después te mandamos una propuesta con su presupuesto y, si te sirve, arrancamos.' },
  { pregunta: '¿Trabajan con negocios de otras ciudades o países?', respuesta: 'Sí. Somos de Tucumán, pero nuestra idea es ofrecer soluciones tecnológicas a empresas de acá y de afuera. En la primera charla vemos cómo organizarnos.' },
  { pregunta: '¿Voy a saber cómo avanza mi proyecto?', respuesta: 'Sí. Tenés un panel donde ves el estado del proyecto y pedís cambios, y nosotros te contamos qué estamos haciendo y por qué en cada etapa.' },
  { pregunta: '¿Qué pasa después de la entrega?', respuesta: 'No desaparecemos. Te entregamos todo funcionando, con tu panel, y seguimos disponibles para soporte y para lo que quieras sumar más adelante.' },
  { pregunta: '¿Qué tipo de proyectos hacen?', respuesta: 'Páginas web, integraciones con inteligencia artificial y automatizaciones, y software a medida. Si no estás seguro de qué te conviene, te lo decimos de frente.' },
]
