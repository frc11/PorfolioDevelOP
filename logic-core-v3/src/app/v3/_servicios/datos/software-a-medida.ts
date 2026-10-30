/**
 * [SERVICIOS S1a · L7a] SOFTWARE A MEDIDA — los datos de SPEC §7.2, expandidos en L7a.
 *
 * Los hechos son los del SPEC (el «desde», el soporte incluido, los pasos) y los textos del home (`05-TEXTOS.md` de la cola 2 y los ítems
 * de la sección Servicios): nada inventado. [L7a] Los trabajos del Portfolio son de web, así que esta página no muestra casos propios:
 * en su lugar, «Lo que podemos construir» (`posibles`). Sin `null`: la página no muestra marcadores.
 */

import { LOGOTIPO } from '../../_componentes/marca/sistema'
import { usd } from '../formato'
import type { Servicio } from '../tipos'

const NOMBRE = 'Software a medida'

const QUE_HACEMOS = {
  titulo: 'Tu problema, convertido en un sistema',
  texto: 'Nos contás cómo trabajás y qué te frena; lo convertimos en una herramienta que encaja exacto en tu negocio.',
}

/** Aparecen en varios lugares (el incluye, «después de la entrega» y el FAQ): una sola redacción. */
const SOPORTE_INCLUIDO = '1 o 2 meses de soporte gratis después de entregar'
const CHARLA = 'Una charla corta alcanza para saber si te podemos ayudar.'
const DESDE = 1000

export const SOFTWARE_A_MEDIDA: Servicio = {
  slug: 'software-a-medida',
  idEnElHome: 'software',
  nombre: NOMBRE,
  seo: {
    title: `${NOMBRE} · ${LOGOTIPO}`, // C2: provisorio (L7a)
    description: // C2: provisorio (L7a)
      'Sistemas hechos para cómo trabaja tu negocio: gestión, turnos, stock, presupuestos y paneles internos. Primero entendemos, después presupuestamos.',
  },
  problema: {
    titulo: 'El software enlatado es igual para todos',
    texto: 'Planillas, sistemas genéricos y procesos a mano que no se adaptan a cómo trabaja tu negocio.',
  },
  queHacemos: QUE_HACEMOS,
  // 05-TEXTOS (Servicios · Software a medida), tal cual.
  detalle: [
    'Si hoy tu negocio funciona con planillas, cuadernos y mensajes sueltos, hay horas que se te van en cosas que una herramienta haría sola.',
    'Primero nos sentamos a entender cómo trabajás: qué se carga, quién lo usa y dónde se traba. Después presupuestamos, no antes.',
    'Lo usás desde la compu o el celular, con tus datos guardados y seguros, y crece cuando crece tu negocio.',
  ],
  ejemplos: [
    { nombre: 'Si todo vive en planillas', texto: 'Clientes, ventas y pagos repartidos en archivos que se pisan. Los juntamos en un solo lugar.' },
    { nombre: 'Si los turnos van por mensaje', texto: 'Una agenda que se carga sola y avisa, en vez de anotar en un cuaderno y confirmar uno por uno.' },
    { nombre: 'Si el stock no cierra', texto: 'Entradas, salidas y remitos registrados, para saber qué tenés sin contar a mano.' },
    { nombre: 'Si armar un presupuesto te lleva una hora', texto: 'Presupuestos y comprobantes que salen con tus precios y tu marca en un par de clics.' },
  ],
  // Los ítems de la sección Servicios del home: lo que se arma, no casos.
  posibles: [
    { nombre: 'Un sistema de gestión', texto: 'Clientes, ventas y pagos en un solo lugar, con permisos por persona según lo que cada una tiene que ver.' },
    { nombre: 'Turnos y agenda', texto: 'Para negocios que trabajan con reservas: la agenda del equipo, los turnos y sus recordatorios.' },
    { nombre: 'Stock, remitos y comprobantes', texto: 'Lo que entra, lo que sale y los papeles de cada movimiento, sin planillas sueltas.' },
    { nombre: 'Presupuestos', texto: 'Un armador de presupuestos con tus productos y tus precios, que deja registro de cada uno.' },
    { nombre: 'Un panel interno', texto: 'Los números de tu negocio a la vista, con reportes que se exportan.' },
    { nombre: 'Tus planillas, pasadas al sistema', texto: 'Migramos lo que ya tenés para que no arranques de cero.' },
  ],
  incluye: [
    'Relevamiento del problema',
    'Diseño y desarrollo a medida',
    'Portal del cliente',
    SOPORTE_INCLUIDO,
    'Ambiente de prueba antes de salir',
    'Capacitación del equipo',
  ],
  aparte: [],
  precio: {
    tipo: 'proyecto',
    desde: DESDE,
    nota: 'Se cotiza según lo que necesites.',
  },
  extra: null,
  proceso: {
    pasos: [
      { nombre: 'Relevamiento', texto: 'Nos sentamos a entender cómo trabajás: qué se carga, quién lo usa y dónde se traba. Después presupuestamos, no antes.' },
      { nombre: 'Prototipo', texto: 'Antes de construir, ves cómo va a funcionar: las pantallas principales y el recorrido de cada tarea.' },
      { nombre: 'Desarrollo', texto: 'Lo construimos y lo probás en un ambiente de prueba antes de salir.' },
      { nombre: 'Entrega', texto: 'Lo ponemos en marcha, migramos tus planillas y capacitamos a tu equipo para usarlo.' },
      { nombre: 'Soporte', texto: `Los primeros meses te acompañamos de cerca: ${SOPORTE_INCLUIDO}.` },
    ],
    plazo: 'Depende de la complejidad',
  },
  entrega: [
    'El sistema funcionando, desde la compu o el celular',
    'Tus planillas, migradas al sistema',
    'Tu equipo capacitado para usarlo',
    'Acceso a tu portal del cliente',
  ],
  despues: [
    `Los primeros meses no estás solo: ${SOPORTE_INCLUIDO}.`,
    'Después, cada cambio o mejora se presupuesta antes de hacerlo: nunca te cobramos algo que no aprobaste. El sistema crece cuando crece tu negocio.',
  ],
  prueba: {
    casos: [],
    nota: null,
    ctaPanel: null,
    video: null, // M3: el video de trabajos es solo de Desarrollo web; el slot 6 no se monta
  },
  faq: [
    {
      pregunta: '¿Cómo sé si necesito un sistema propio?',
      // SPEC §7.2: el problema que resolvemos y el cierre del CTA
      respuesta: `Una señal son las planillas, los sistemas genéricos y los procesos a mano que no se adaptan a cómo trabaja tu negocio. ${CHARLA}`,
    },
    {
      pregunta: '¿Cuánto cuesta?',
      // L7a: SPEC §7.2 (el «desde» y «se cotiza según lo que necesites») y 05-TEXTOS (después presupuestamos, no antes)
      respuesta: `Arranca desde ${usd(DESDE)} y se cotiza según lo que necesites. Primero entendemos cómo trabajás y después te pasamos el presupuesto, antes de empezar.`,
    },
    {
      pregunta: '¿Cuánto tarda?',
      // L7a: SPEC §7.2 (depende de la complejidad) y 05-TEXTOS (primero entendemos, después presupuestamos)
      respuesta: 'Depende de la complejidad: primero entendemos qué hay que hacer y recién ahí se puede estimar.',
    },
    {
      pregunta: '¿Qué pasa con mis planillas?',
      // L7a: la sección Servicios del home (migración de tus planillas)
      respuesta: 'Las pasamos al sistema: la migración de tus planillas es parte de lo que hacemos, para que no arranques de cero.',
    },
    {
      pregunta: '¿Qué pasa si después necesito cambios?',
      // M0 §8 (dictado): el SPEC §7.2 no decía cómo se tratan los cambios después de la entrega
      respuesta:
        'Los primeros 1 o 2 meses después de entregar, el soporte va incluido. Después, cada cambio o mejora se presupuesta antes de hacerlo: nunca te cobramos algo que no aprobaste.',
    },
    {
      pregunta: '¿Lo puedo usar desde el celular?',
      // L7a: 05-TEXTOS (lo usás desde la compu o el celular, con tus datos guardados y seguros)
      respuesta: 'Sí. Lo usás desde la compu o el celular, con tus datos guardados y seguros.',
    },
  ],
  cta: {
    titulo: 'Contanos tu problema',
    texto: CHARLA,
    boton: 'Quiero mi software a medida', // C2: 05-TEXTOS, el CTA del servicio en el home
  },
  articulos: [
    { titulo: 'Señales de que tu negocio necesita un sistema propio y no más planillas', href: null },
  ],
}
