/**
 * 🧪 EXPERIMENTAL / DESCARTABLE — FG-2.0.
 *
 * Los 5 casos de gastronomía PRECARGADOS para correr el experimento 5-vs-5 sin
 * tipear nada. Cada caso trae el `Fg2BriefInput` completo (campos de ficha +
 * decisiones estructuradas) Y un `promptLibre` de referencia (el camino "a mano"
 * que escribiría el setter sin el formulario). El lab los ofrece en un selector;
 * el generador (`scripts/_experimental/fg2-gen-prompts.ts`) emite los 10 prompts
 * desde acá. BORRAR junto con el resto del prototipo tras la decisión.
 *
 * PROCEDENCIA DE LOS DATOS (no inventar nada como real):
 *  - `seed-real`     → ficha cargada verbatim en un seed del repo.
 *  - `seed-lead`     → el LEAD existe en un seed (nombre/zona/IG/Maps reales del
 *                      seed) pero su ficha NO carga reseñas/contenido — esos
 *                      campos quedan vacíos o son dirección representativa.
 *  - `representativo`→ arquetipo realista de PyME gastronómica AR, NO un cliente
 *                      real. Marcado fuerte en el label y en `nota`.
 *
 * Reglas que se respetan acá:
 *  - NUNCA se inyecta una reseña inventada como "real": los casos sin reseñas
 *    reales viajan SIN sección de reseñas y con `resenas: ''`.
 *  - Los WhatsApp son números de ejemplo (la calidad de la demo no depende del
 *    número). Reemplazables por el real si se quiere probar el link.
 */

import type { Fg2BriefInput } from './fg2-brief-lab'

export type OrigenCaso = 'seed-real' | 'seed-lead' | 'representativo'

export type CasoGastro = {
  id: string
  /** Etiqueta del selector — lleva el marcador de procedencia adelante. */
  label: string
  origen: OrigenCaso
  /** De dónde salió cada dato — para la trazabilidad del experimento. */
  nota: string
  /** Todo lo que el formulario necesita; el lab lo vuelca a su estado tal cual. */
  input: Fg2BriefInput
  /** El prompt "a mano" (camino libre) equivalente, para el brazo de control. */
  promptLibre: string
}

// Número de ejemplo: la demo no depende del dígito. Flag explícito en la doc.
const WA_EJEMPLO = (n: number) => `54900000000${n}`

export const CASOS_GASTRO: readonly CasoGastro[] = [
  // ── Caso 1 — REAL (ficha seed completa) ────────────────────────────────────
  {
    id: 'noir-dining',
    label: '● Real (seed) — Noir Dining · restaurante de autor',
    origen: 'seed-real',
    nota: 'Ficha verbatim de scripts/demos-seed-review-queue.ts (reseñas, contenido, presencia e identidad). WhatsApp de ejemplo (el negocio reserva por DM, sin número público en el seed).',
    input: {
      nombre: 'Noir Dining',
      zona: 'Yerba Buena',
      estilo: 'nocturno-premium',
      tono: 'sofisticado',
      secciones: [
        'hero-plato',
        'menu-destacado',
        'sobre-nosotros',
        'galeria',
        'resenas',
        'ubicacion-horarios',
        'cta-contacto',
      ],
      cta: 'reserva',
      whatsapp: WA_EJEMPLO(1),
      diferencial:
        'Menú degustación de cocina de autor en un salón dark e inmersivo; cupos limitados por noche, reservan con anticipación.',
      colorMarca: 'Negro profundo con acentos cálidos dorados, serif elegante',
      // Verbatim del seed (ficha.resenas / ficha.contenidoReal).
      resenas: 'Reseñas que mencionan la ambientación y la cocina de autor.',
      tonoContenido: 'Fotos propias de platos sobre fondo negro, logo serif.',
      assets: {
        instagram: 'https://instagram.com/noir.dining.demo',
        maps: '',
        web: '',
      },
    },
    promptLibre:
      'Hola, necesito una landing de una sola página para Noir Dining, un restaurante de autor en Yerba Buena. Que sea oscura y elegante, tipo fine dining, con menú degustación. Poné un hero con una foto de plato, el menú, algo del ambiente y un botón para reservar por WhatsApp. Usá las fotos reales del Instagram (instagram.com/noir.dining.demo). Que quede bien en el celular.',
  },

  // ── Caso 2 — REAL (ficha QA seed; sin contenidoReal) ───────────────────────
  {
    id: 'pizzeria-don-carlo',
    label: '● Real (seed) — Pizzería Don Carlo · pizza a la piedra',
    origen: 'seed-real',
    nota: 'Reseña y presencia verbatim de la ficha QA de scripts/b6-qa-outreach.ts; el seed no carga contenidoReal, así que la voz de marca es dirección representativa derivada de la identidad ("el dueño contesta los DMs"). WhatsApp de ejemplo.',
    input: {
      nombre: 'Pizzería Don Carlo',
      zona: 'Barrio Norte',
      estilo: 'apetitoso-calido',
      tono: 'cercano-familiar',
      secciones: ['hero-plato', 'menu-destacado', 'resenas', 'ubicacion-horarios', 'cta-contacto'],
      cta: 'whatsapp-pedido',
      whatsapp: WA_EJEMPLO(2),
      diferencial: 'Pizza a la piedra; el dueño atiende y arma cada pedido en persona.',
      colorMarca: '',
      // Reseña verbatim del seed (mixta: el "nunca sé si está abierto" pide una
      // sección de horarios clara — buena señal para el formulario).
      resenas: '"Atienden de diez pero nunca sé si está abierto" — reseña de Google.',
      // Dirección representativa (el seed no carga contenidoReal).
      tonoContenido:
        'Instagram activo con stories diarias de las pizzas del día; tono de barrio, cercano. El dueño contesta los DMs él mismo.',
      assets: {
        instagram: 'https://instagram.com/pizzeria.doncarlo.qa',
        maps: '',
        web: '',
      },
    },
    promptLibre:
      'Necesito una web simple de una sola página para Pizzería Don Carlo, en Barrio Norte. Es pizza a la piedra y atiende el dueño. Que dé hambre, cálida. Un hero con la pizza, el menú con precios, las reseñas de Google y un botón de WhatsApp para pedir. El WhatsApp es 549000000002.',
  },

  // ── Caso 3 — LEAD REAL del seed; ficha sin contenido ───────────────────────
  {
    id: 'cafe-la-esquina',
    label: '◐ Lead real (seed), contenido representativo — Café La Esquina',
    origen: 'seed-lead',
    nota: 'El lead, IG y Maps son del seed (scripts/b3-qa-assign-leads.ts), pero ese seed NO carga reseñas ni contenido de ficha. Sin reseñas reales → viaja SIN sección de reseñas. Estilo/tono/diferencial son dirección representativa de café de barrio. WhatsApp de ejemplo.',
    input: {
      nombre: 'Café La Esquina',
      zona: 'Yerba Buena',
      estilo: 'rustico-artesanal',
      tono: 'cercano-familiar',
      secciones: [
        'hero-plato',
        'menu-destacado',
        'sobre-nosotros',
        'galeria',
        'ubicacion-horarios',
        'cta-contacto',
      ],
      cta: 'ver-menu',
      whatsapp: WA_EJEMPLO(3),
      diferencial: 'Café de especialidad y pastelería casera, en la esquina del barrio.',
      colorMarca: '',
      resenas: '', // sin reseñas reales — no se inventan
      tonoContenido:
        'Café de barrio, cercano y tranquilo; pastelería casera. Posteos simples de los productos del día.',
      assets: {
        instagram: 'https://instagram.com/cafelaesquina.qa',
        maps: 'https://maps.google.com/?q=cafe+la+esquina+qa',
        web: '',
      },
    },
    promptLibre:
      'Armame una landing de una página para un café de barrio, Café La Esquina, en Yerba Buena. Café de especialidad y pastelería casera, onda rústica y acogedora. Hero, el menú, una sección de quiénes somos, una galería de fotos y dónde estamos. Botón para ver el menú y uno de WhatsApp. Sacá las fotos del Instagram (instagram.com/cafelaesquina.qa).',
  },

  // ── Caso 4 — REPRESENTATIVO ────────────────────────────────────────────────
  {
    id: 'parrilla-el-fogon',
    label: '▣ REPRESENTATIVO (no es cliente real) — Parrilla El Fogón',
    origen: 'representativo',
    nota: 'Arquetipo de parrilla/bodegón familiar AR. NO es un negocio real. Sin reseñas reales → sin sección de reseñas. IG con sufijo .demo para marcar que es placeholder. WhatsApp de ejemplo.',
    input: {
      nombre: 'Parrilla El Fogón',
      zona: 'San Miguel de Tucumán',
      estilo: 'apetitoso-calido',
      tono: 'cercano-familiar',
      secciones: ['hero-plato', 'menu-destacado', 'sobre-nosotros', 'ubicacion-horarios', 'cta-contacto'],
      cta: 'reserva',
      whatsapp: WA_EJEMPLO(4),
      diferencial: 'Asado a la leña, achuras y vacío; porciones generosas para compartir en familia.',
      colorMarca: 'Rojo ladrillo y madera',
      resenas: '',
      tonoContenido:
        'Parrilla tradicional de barrio, ambiente familiar y abundante. Fotos de las carnes y la brasa.',
      assets: {
        instagram: 'https://instagram.com/parrilla.elfogon.demo',
        maps: '',
        web: '',
      },
    },
    promptLibre:
      'Landing de una sola página para una parrilla, El Fogón, en Tucumán. Asado a la leña, ambiente familiar, porciones generosas. Que se vea apetitosa y cálida. Hero con la parrilla, el menú, una sección sobre nosotros, ubicación y un botón para reservar mesa por WhatsApp.',
  },

  // ── Caso 5 — REPRESENTATIVO ────────────────────────────────────────────────
  {
    id: 'verde-hoja-cafe',
    label: '▣ REPRESENTATIVO (no es cliente real) — Verde Hoja · brunch saludable',
    origen: 'representativo',
    nota: 'Arquetipo de café saludable / brunch para público joven. NO es un negocio real. Sin reseñas reales → sin sección de reseñas. IG con sufijo .demo. WhatsApp de ejemplo.',
    input: {
      nombre: 'Verde Hoja',
      zona: 'Palermo, CABA',
      estilo: 'moderno-minimal',
      tono: 'divertido-joven',
      secciones: ['hero-plato', 'menu-destacado', 'galeria', 'ubicacion-horarios', 'cta-contacto'],
      cta: 'whatsapp-pedido',
      whatsapp: WA_EJEMPLO(5),
      diferencial: 'Brunch saludable, bowls y café de especialidad; opciones veggie y sin TACC.',
      colorMarca: 'Verde salvia y crema',
      resenas: '',
      tonoContenido:
        'Café moderno y saludable, público joven. Estética clara, fotos luminosas de bowls y latte art.',
      assets: {
        instagram: 'https://instagram.com/verdehoja.cafe.demo',
        maps: '',
        web: '',
      },
    },
    promptLibre:
      'Necesito una web de una página para Verde Hoja, un café saludable con brunch y bowls, público joven, en Palermo. Moderna, minimalista, bien clarita. Hero, el menú con fotos, una galería y dónde estamos. Botón de WhatsApp para pedir. Que ande bien en mobile.',
  },
] as const
