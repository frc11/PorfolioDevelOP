/**
 * [SERVICIOS S1a · L7a] DESARROLLO WEB — los datos de SPEC §7.1, expandidos en L7a.
 *
 * Los números y los hechos son los del SPEC (los calibres, el plazo, el mantenimiento) y los textos del home (`05-TEXTOS.md` de la cola 2,
 * la sección Servicios): nada inventado, ni clientes, ni cifras, ni garantías. [L7a] El nombre es el del servicio en el home
 * («Desarrollo web», `SERVICIOS` de `acento.ts`); el slug sigue siendo `paginas-web` para no romper los enlaces. Sin `null`: la página no
 * muestra marcadores (L7: el texto es genérico pero real).
 * La marca se importa de `LOGOTIPO`: no se escribe suelta en los datos. El acento no se guarda acá: sale del tema por `idEnElHome`.
 */

import { LOGOTIPO } from '../../_componentes/marca/sistema'
import { usd } from '../formato'
import type { Caso, Servicio } from '../tipos'

const NOMBRE = 'Desarrollo web'

/** Los trabajos de Desarrollo web: las frases de Cómo trabajamos y, por su nombre, la línea del video. */
const CASOS: readonly Caso[] = [
  {
    tipo: 'proyecto',
    slug: 'el-garage',
    texto: 'Ordenó su catálogo, que antes vivía en publicaciones de Facebook que quedaban viejas.',
  },
  { tipo: 'proyecto', slug: 'esquina-estudio', texto: 'Pasó a tener presencia online.' },
  { tipo: 'proyecto', slug: 'banu-scents', texto: 'Catálogo y presencia online.' },
]

/** [M3] Las demos del video de trabajos (D1), por su slug en el catálogo del home. */
const DEMOS_DEL_VIDEO = ['ethereal', 'noir', 'skyline'] as const

/** [M3] La línea del video, dictada por Valentino, con la marca de LOGOTIPO (los nombres, contra PROYECTOS y Demos del home). */
const LINEA_DEL_VIDEO = `Sitios para clientes (El Garage, Esquina Estudio y Banú Scents) y demos propias de ${LOGOTIPO} (The Ethereal Resort, Noir Dining in the Void y Skyline Estates).` // M3 (dictado)

const QUE_HACEMOS = {
  titulo: 'Construimos tu presencia, bloque por bloque',
  texto: 'Diseñamos y desarrollamos la web de tu negocio para que te encuentren, te entiendan y te escriban.',
}

/** Lo que cuestan los cambios del mantenimiento: lo usan el extra, «después de la entrega» y el FAQ, así no se desfasan. */
const CAMBIO_MEDIANO_DESDE = 50
const CAMBIO_GRANDE_DESDE = 100

/** El plazo de referencia (SPEC §7.1): una referencia, nunca una promesa. Lo usan el proceso y el FAQ. */
const PLAZO = 'De 2–3 semanas a 2–3 meses según el calibre'

export const PAGINAS_WEB: Servicio = {
  slug: 'paginas-web',
  idEnElHome: 'web',
  nombre: NOMBRE,
  seo: {
    title: `${NOMBRE} · ${LOGOTIPO}`, // C2: provisorio (L7a)
    description: // C2: provisorio (L7a)
      'Páginas web a medida para tu negocio: que te encuentren, te entiendan y te escriban. Se ven bien en el celular y las manejás vos desde tu panel.',
  },
  problema: {
    titulo: '¿Te buscan y no te encuentran?',
    texto: 'Si tu negocio no tiene web, o tiene una vieja que no vende, perdés clientes que ya te estaban buscando.',
  },
  queHacemos: QUE_HACEMOS,
  // 05-TEXTOS (Servicios · Desarrollo web), tal cual.
  detalle: [
    'Tu página es lo primero que ve un cliente antes de escribirte. Por eso no arrancamos de una plantilla: arrancamos de tu negocio, de lo que vendés y de cómo te buscan.',
    'Pensamos cada pantalla para que se entienda sola, cargue rápido y se vea bien en el celular, que es donde te van a encontrar.',
    'Y cuando está lista no te la tiramos por la cabeza: la manejás vos desde tu panel. Cambiás precios, fotos y textos sin depender de nadie.',
  ],
  ejemplos: [
    { nombre: 'Una landing', texto: 'Una sola página que cuenta qué hacés y lleva a escribirte. Para arrancar, para un producto o para una campaña.' },
    { nombre: 'Un sitio institucional', texto: 'Varias páginas para mostrar tu negocio, tus servicios y cómo contactarte, con la información ordenada.' },
    { nombre: 'Un catálogo', texto: 'Tus productos con fotos, precios y un buscador, sin compras: el cliente elige y te escribe.' },
    { nombre: 'Una tienda online', texto: 'El catálogo con carrito y pago, para que te compren sin que tengas que contestar uno por uno.' },
  ],
  posibles: [],
  incluye: [
    'Diseño a medida de tu marca',
    'Adaptada a celular y tablet',
    'Formulario de contacto conectado',
    'Portal del cliente (métricas, tickets y acceso a más servicios)',
    'Imágenes y fuentes optimizadas para que cargue rápido',
    'Metadatos y datos estructurados para los buscadores',
  ],
  aparte: ['Chatbot con IA', 'Extras'],
  precio: {
    tipo: 'calibres',
    calibres: [
      {
        nombre: 'Simple',
        desde: 200,
        descripcion: 'Una sola página, tipo landing, sin nada extravagante',
        incluye: [],
        autogestionable: null, // SPEC §7.1: «Si la Simple tiene panel: [a definir]»
      },
      {
        nombre: 'Mediana',
        desde: 600,
        descripcion: 'Varias páginas, buscador o catálogo sin compras',
        incluye: [],
        autogestionable: true,
      },
      {
        nombre: 'Premium',
        desde: 1000,
        descripcion: 'E-commerce. El precio crece con el alcance',
        incluye: [],
        autogestionable: true,
      },
    ],
    // M2a (dictado): la Mediana al centro, con el acento, su marca y esta línea; ningún otro texto de venta.
    destacada: {
      nombre: 'Mediana',
      marca: 'Recomendada',
      linea: 'Todo lo de la Simple, en varias páginas y con catálogo o buscador para mostrar lo que vendés.',
    },
  },
  extra: {
    titulo: 'Mantenimiento',
    items: [
      { nombre: 'Ediciones chicas', detalle: 'Textos, precios, fotos, horarios', precio: 'Desde el panel' },
      {
        nombre: 'Cambios medianos',
        detalle: 'Sumar sección o formulario, cambiar colores o tipografía',
        precio: `Desde ${usd(CAMBIO_MEDIANO_DESDE)}`,
      },
      {
        nombre: 'Cambios grandes',
        detalle: 'Página nueva, integración, módulo',
        precio: `Desde ${usd(CAMBIO_GRANDE_DESDE)}`,
      },
      { nombre: 'Arreglos', detalle: 'De algo roto', precio: 'Siempre incluidos' },
      { nombre: 'Plan mensual', detalle: 'Solo web', precio: null }, // SPEC §7.1: «Plan mensual solo web: USD [a definir]» (no se monta)
    ],
    nota: 'Todo extra se presupuesta antes.',
  },
  proceso: {
    pasos: [
      { nombre: 'Charla', texto: 'Nos contás de tu negocio, qué vendés, a quién y cómo te buscan. De ahí sale qué página te conviene.' },
      { nombre: 'Propuesta', texto: 'Te pasamos por escrito qué incluye, el calibre, el precio y los tiempos. Arrancamos cuando estás de acuerdo.' },
      { nombre: 'Diseño', texto: 'Armamos cómo se va a ver cada pantalla, en el celular y en la computadora, y lo ajustamos con vos.' },
      { nombre: 'Desarrollo', texto: 'La construimos y vas viendo el avance. Cargamos tus textos y fotos, y conectamos el formulario.' },
      { nombre: 'Entrega', texto: 'La dejamos publicada y funcionando, y te mostramos cómo manejarla desde tu panel.' },
    ],
    plazo: PLAZO,
  },
  entrega: [
    'Tu página publicada y funcionando',
    'El formulario de contacto conectado: cada consulta te llega',
    'Acceso a tu portal del cliente, con las métricas y los tickets',
    'En las webs Mediana y Premium, el panel para editar textos, precios, fotos y horarios',
  ],
  despues: [
    `Si algo se rompe, lo arreglamos: los arreglos siempre están incluidos. Las ediciones chicas las hacés vos desde el panel.`,
    `Si querés sumar algo, se presupuesta antes: los cambios medianos (una sección, un formulario, colores o tipografía) salen desde ${usd(CAMBIO_MEDIANO_DESDE)} y los grandes (una página nueva, una integración, un módulo), desde ${usd(CAMBIO_GRANDE_DESDE)}.`,
  ],
  prueba: {
    casos: CASOS,
    nota: null,
    ctaPanel: null,
    // M3: los medios los escribe scripts-servicios/montar.ts, y su recibo (docs/servicios/entregas/m3/medios.json) lo lee medios.invariant.
    video: {
      horizontal: { video: '/servicios/paginas-web/trabajos-horizontal.mp4', poster: '/servicios/paginas-web/trabajos-horizontal.webp', ancho: 1280, alto: 800 },
      vertical: { video: '/servicios/paginas-web/trabajos-vertical.mp4', poster: '/servicios/paginas-web/trabajos-vertical.webp', ancho: 720, alto: 1560 },
      demos: DEMOS_DEL_VIDEO,
      linea: LINEA_DEL_VIDEO,
    },
  },
  faq: [
    {
      pregunta: '¿Cuánto tarda una web?',
      // SPEC §7.1: el proceso y el plazo de referencia, que es una referencia y nunca una promesa
      respuesta: `Como referencia, ${PLAZO.charAt(0).toLowerCase()}${PLAZO.slice(1)}. Va de la charla a la propuesta, el diseño, el desarrollo y la entrega, y vas viendo el avance mientras se construye.`,
    },
    {
      pregunta: '¿Puedo editarla yo después?',
      // SPEC §7.1: Mediana y Premium son autogestionables; las ediciones chicas se hacen desde el panel
      respuesta: 'Las webs Mediana y Premium son autogestionables: las ediciones chicas (textos, precios, fotos, horarios) las hacés vos desde el panel, sin depender de nadie.',
    },
    {
      pregunta: '¿Se va a ver bien en el celular?',
      // L7a: SPEC §7.1 (adaptada a celular y tablet) y 05-TEXTOS (se vea bien en el celular)
      respuesta: 'Sí. Cada pantalla se piensa para el celular, la tablet y la computadora: no es la versión de escritorio apretada.',
    },
    {
      pregunta: '¿Me ayudan con el dominio y la publicación?',
      // L7a: la sección Servicios del home (hosting, dominio y certificado) y la base (`pagina-base/faq.ts`)
      respuesta: 'Sí. Te acompañamos con el dominio y dejamos la página publicada y funcionando antes de darla por terminada.',
    },
    {
      pregunta: '¿Qué pasa después de la entrega?',
      // SPEC §7.1: el mantenimiento
      respuesta: `Los arreglos de algo roto siempre están incluidos. Los cambios medianos salen desde ${usd(CAMBIO_MEDIANO_DESDE)} y los grandes desde ${usd(CAMBIO_GRANDE_DESDE)}. Todo extra se presupuesta antes.`,
    },
    {
      pregunta: '¿El chatbot viene incluido?',
      // SPEC §7.1: «No, va aparte»; dónde sumarlo, el tercer servicio
      respuesta: 'No, el chatbot con IA va aparte. Lo podés sumar cuando quieras: está en Integraciones con IA.',
    },
  ],
  cta: {
    titulo: '¿Arrancamos con tu web?',
    texto: 'Contanos de tu negocio y te respondemos con una propuesta.',
    boton: 'Quiero mi desarrollo web', // C2: 05-TEXTOS, el CTA del servicio en el home
  },
  articulos: [
    { titulo: 'Cuánto cuesta una página web', href: null },
    { titulo: 'Tienda Nube o web propia', href: null },
  ],
}
