import type { PreguntaFrecuente } from '../_componentes/faq/preguntas'

/**
 * [L7b] EL TEXTO DE NOSOTROS — la historia sale de lo que escribió Valentino (`ESTRUCTURA-PAGINAS.md`), expandida sin sumar hechos; los
 * valores son los suyos, palabra por palabra. Genérico pero real: Valentino lo ajusta después.
 */
export const INTRO_DE_NOSOTROS = {
  bajada: 'Somos Franco y Valentino, dos amigos de Tucumán que hacemos sitios, software y automatizaciones para negocios.',
  etiqueta: 'Qué vas a encontrar',
  // [M1] El bloque del giro (el lugar que el home le da a Quiénes somos): qué hay más abajo, sin hechos nuevos.
  deQueSeTrata: [
    'Nos conocemos de toda la vida: fuimos al mismo colegio y elegimos la misma carrera. develOP es lo que armamos juntos.',
    'Más abajo está nuestra historia, quién se ocupa de qué, cómo trabajamos con cada negocio paso por paso y lo que nos importa cuando tomamos tu proyecto.',
  ],
} as const

/** [M1] Un tramo de la historia; `destacado`: una de las tres frases que se pintan con el scroll (lo único que se pinta). */
export interface TramoDeLaHistoria {
  readonly texto: string
  readonly destacado?: boolean
}

/**
 * [M1] La historia, en palabras de Valentino (`ESTRUCTURA-PAGINAS.md`, «La historia»; el texto del prototipo 6 de `l7/lab`): cuatro
 * párrafos, sin hechos nuevos. Sólo las tres frases que el prototipo destacaba se pintan; todo lo demás sube desde abajo.
 */
export const HISTORIA: { readonly titulo: string; readonly parrafos: readonly (readonly TramoDeLaHistoria[])[] } = {
  titulo: 'Nuestra historia',
  parrafos: [
    [
      { texto: 'Somos dos amigos que nos conocemos de toda la vida.' },
      { texto: 'Fuimos al mismo colegio y decidimos estudiar la misma carrera.' },
      { texto: 'Ya estamos en el último año, con hambre de trabajar y de salir al mundo laboral.' },
    ],
    [
      { texto: 'Queremos emprender con esto: ser dueños de nuestro propio negocio y entregar un trabajo de' },
      { texto: 'calidad excepcional.', destacado: true },
      { texto: 'Somos muy perfeccionistas y trabajadores; no paramos hasta terminar todo.' },
    ],
    [
      { texto: 'Más allá de lo económico, develOP es para nosotros crecimiento personal y una marca que va a guiar nuestras vidas.' },
      { texto: 'Esto no es un proyecto aislado:', destacado: true },
      { texto: 'es nuestra historia, y lo que queremos dejar como nuestra huella.' },
    ],
    [
      { texto: 'Estudiamos en la Universidad Nacional de Tucumán, en la Facultad de Ciencias Exactas, y somos de Yerba Buena.' },
      { texto: 'Queremos ofrecer soluciones tecnológicas a las empresas que las necesiten, acá y en el resto del mundo.' },
      { texto: 'No tenemos límites.', destacado: true },
    ],
  ],
}

/** [M1] El equipo: el párrafo largo de cada uno (el texto del prototipo 2 de `l7/lab`, armado con ESTRUCTURA y los roles del home). */
export const EQUIPO = {
  titulo: 'El equipo',
  franco: [
    'Franco es la mitad de develOP que piensa antes de que se escriba una línea: la estrategia, lo comercial y la planificación. Es el que se sienta con cada negocio a entender qué necesita y cómo trabaja, y el que ordena el camino para llegar.',
    'Somos de Yerba Buena, en Tucumán, y nos conocemos de toda la vida: fuimos al mismo colegio y elegimos la misma carrera. Los dos estamos en el último año, con hambre de salir a trabajar y de construir algo propio.',
  ],
  valentino: [
    'Valentino es la ejecución técnica: escribe el sistema, lo pone a andar y lo mantiene. Perfeccionista como Franco, no para hasta que todo está terminado y bien hecho.',
    'Para los dos, develOP es más que un trabajo: es crecimiento personal y una marca que queremos que nos guíe. No es un proyecto aislado, es nuestra historia, y queremos llevarla a empresas de acá y de afuera.',
  ],
} as const

/** [M1] La foto de la facultad (la real, de Valentino): 500 × 298, se muestra a su ancho como mucho. */
export const FACULTAD = {
  titulo: 'Donde estudiamos',
  leyenda: 'FACET · Universidad Nacional de Tucumán',
  src: '/v3/nosotros/facultad.webp',
  alt: 'La Facultad de Ciencias Exactas (FACET) de la Universidad Nacional de Tucumán, donde estudiamos los dos',
  ancho: 500,
  alto: 298,
} as const

/**
 * [M1] Cómo trabajamos: los pasos del prototipo 7 (`l7/lab`), armados SÓLO con lo que el home ya dice («Primero nos sentamos a entender
 * cómo trabajás… Después presupuestamos, no antes», «Hablás con quien lo hace», «Ves cómo va tu proyecto y pedís cambios sin esperar un
 * mail», «la manejás vos desde tu panel», «Tu panel crece con vos»). Valentino los revisa después.
 */
export const PROCESO = {
  titulo: 'Cómo trabajamos',
  pasos: [
    { titulo: 'Charlamos', texto: 'Nos sentamos a entender tu negocio: qué vendés, cómo trabajás, quién lo usa y dónde se traba. Hablás con quienes lo van a hacer.' },
    { titulo: 'Presupuestamos', texto: 'Después de entender, no antes. Te decimos qué te conviene y por qué.' },
    { titulo: 'Lo construimos', texto: 'Desde cero, para tu negocio. Ves cómo va en tu panel y pedís cambios sin esperar un mail.' },
    { titulo: 'Lo manejás vos', texto: 'Cuando está listo, no te lo tiramos por la cabeza: cambiás precios, fotos y textos desde tu panel, sin depender de nadie.' },
    { titulo: 'Crece con vos', texto: 'Sumamos módulos nuevos cuando tu negocio los necesita.' },
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
