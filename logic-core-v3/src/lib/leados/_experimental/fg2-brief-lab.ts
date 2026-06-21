/**
 * 🧪 EXPERIMENTAL / DESCARTABLE — FG-2.0.
 *
 * Prototipo ACOTADO para testear la hipótesis central de FG-2: «un formulario
 * estructurado produce mejores demos que el prompteo libre». NO es producción
 * (eso sería 2.1). NO está conectado al flujo del setter. Su único propósito es
 * generar las 5 demos del experimento de UN rubro (gastronomía) y medir su costo.
 * BORRAR tras la decisión del experimento.
 *
 * Core puro: sin Prisma, sin 'use server', sin React. Solo string-building y
 * tipos — testeable e importable desde el page (server) y el client del lab.
 *
 * SENSIBLE-lite: este módulo SOLO LEE datos del negocio para armar el prompt;
 * no escribe lógica de dossier ni toca gates/transiciones. Los datos que entran
 * al prompt son todos de cara pública del negocio (nombre, zona, reseñas ya
 * públicas, links de assets, WhatsApp comercial) — ver `Fg2BriefInput`.
 */

// ── Catálogo del rubro (gastronomía) ────────────────────────────────────────
// Cada opción carga su DIRECTIVA: el texto opinado que viaja al prompt. Acá vive
// el conocimiento de rubro que el formulario codifica (y que el prompteo libre
// deja librado a la memoria del setter). Es lo que el experimento pone a prueba.

export type EstiloVisualId =
  | 'apetitoso-calido'
  | 'moderno-minimal'
  | 'rustico-artesanal'
  | 'nocturno-premium'

export type TonoId = 'cercano-familiar' | 'sofisticado' | 'divertido-joven'

export type SeccionId =
  | 'hero-plato'
  | 'menu-destacado'
  | 'sobre-nosotros'
  | 'galeria'
  | 'resenas'
  | 'ubicacion-horarios'
  | 'cta-contacto'

export type CtaId = 'whatsapp-pedido' | 'reserva' | 'ver-menu' | 'llamar'

export type OpcionEstilo = { id: EstiloVisualId; label: string; directiva: string }
export type OpcionTono = { id: TonoId; label: string; directiva: string }
export type OpcionSeccion = { id: SeccionId; label: string; linea: string }
export type OpcionCta = { id: CtaId; label: string; accion: string }

export const ESTILOS_GASTRO = [
  {
    id: 'apetitoso-calido',
    label: 'Cálido y apetitoso',
    directiva:
      'Paleta cálida y apetitosa (terracota, mostaza, crema, marrón cálido). Fotografía de comida en primer plano, grande, que dé hambre. Sensación acogedora, de mesa servida. Una serif amable para los títulos.',
  },
  {
    id: 'moderno-minimal',
    label: 'Moderno minimalista',
    directiva:
      'Minimalismo moderno: mucho aire y espacio en blanco, paleta sobria (2 neutros + 1 acento), tipografía sans limpia. Fotos editoriales bien recortadas. Sensación premium y ordenada, sin saturar.',
  },
  {
    id: 'rustico-artesanal',
    label: 'Rústico artesanal',
    directiva:
      'Estética rústica y artesanal: texturas de madera y papel kraft, paleta tierra (verde oliva, marrón, crema). Detalles hechos a mano. Sensación auténtica, de producto casero.',
  },
  {
    id: 'nocturno-premium',
    label: 'Nocturno premium',
    directiva:
      'Modo nocturno premium: fondo oscuro, acentos dorados/ámbar, contraste alto, para cena o bar. Fotografía con luz cálida y sombras. Sensación elegante, de ocasión especial.',
  },
] as const satisfies readonly OpcionEstilo[]

export const TONOS_GASTRO = [
  {
    id: 'cercano-familiar',
    label: 'Cercano y familiar',
    directiva: 'Cercano y familiar: tuteo, frases cortas, calidez, como te recibe el dueño.',
  },
  {
    id: 'sofisticado',
    label: 'Sofisticado',
    directiva: 'Sofisticado y cuidado: prolijo, descriptivo con los platos, sin ser acartonado.',
  },
  {
    id: 'divertido-joven',
    label: 'Divertido y joven',
    directiva: 'Divertido y joven: desenfadado, con chispa, ideal para público joven y redes.',
  },
] as const satisfies readonly OpcionTono[]

export const SECCIONES_GASTRO = [
  {
    id: 'hero-plato',
    label: 'Hero con plato estrella',
    linea:
      'Hero a pantalla con la foto del plato/producto estrella, el nombre del negocio y una frase-gancho. CTA de WhatsApp visible desde el primer scroll.',
  },
  {
    id: 'menu-destacado',
    label: 'Menú destacado',
    linea:
      'Menú destacado: 3 a 6 platos con foto, nombre, breve descripción y precio. Grilla limpia y legible.',
  },
  {
    id: 'sobre-nosotros',
    label: 'Sobre nosotros',
    linea: 'Sobre nosotros: historia corta y honesta del lugar y qué lo hace distinto.',
  },
  {
    id: 'galeria',
    label: 'Galería',
    linea: 'Galería: 4 a 8 fotos reales del local y los platos, en grilla tipo mosaico.',
  },
  {
    id: 'resenas',
    label: 'Reseñas (prueba social)',
    linea:
      'Reseñas reales de clientes como prueba social, citadas textualmente — nunca inventar reseñas.',
  },
  {
    id: 'ubicacion-horarios',
    label: 'Ubicación y horarios',
    linea: 'Ubicación y horarios: dirección, mapa embebido, días y horarios de atención.',
  },
  {
    id: 'cta-contacto',
    label: 'Cierre con CTA de contacto',
    linea: 'Cierre con CTA fuerte de contacto (WhatsApp / reserva) y los datos del negocio.',
  },
] as const satisfies readonly OpcionSeccion[]

export const CTAS_GASTRO = [
  {
    id: 'whatsapp-pedido',
    label: 'Pedí por WhatsApp',
    accion: 'Botón grande «Pedí por WhatsApp» que abre el chat con un mensaje pre-cargado simple.',
  },
  {
    id: 'reserva',
    label: 'Reservá tu mesa',
    accion: 'Botón «Reservá tu mesa» que abre WhatsApp para coordinar la reserva.',
  },
  {
    id: 'ver-menu',
    label: 'Mirá el menú',
    accion: 'Botón «Mirá el menú» como acción principal + botón de WhatsApp para consultas.',
  },
  {
    id: 'llamar',
    label: 'Llamanos',
    accion: 'Botón de llamar como acción principal + botón de WhatsApp como alternativa.',
  },
] as const satisfies readonly OpcionCta[]

// ── Input del prototipo ──────────────────────────────────────────────────────

/**
 * Lo que el formulario ensambla. Mezcla datos AUTOCOMPLETABLES de la ficha
 * (nombre, zona, reseñas, tono/contenido, links de assets) con las DECISIONES
 * estructuradas que el setter toma (estilo, tono, secciones, CTA, diferencial,
 * color, WhatsApp). El WhatsApp se carga a mano a propósito: es el número
 * comercial público, no el `phone` posiblemente privado del lead.
 */
export type Fg2BriefInput = {
  nombre: string
  zona: string
  estilo: EstiloVisualId
  tono: TonoId
  /** Secciones tildadas. El orden de salida es el canónico de `SECCIONES_GASTRO`. */
  secciones: SeccionId[]
  cta: CtaId
  whatsapp: string
  /** El gancho: plato estrella o diferencial real del negocio. */
  diferencial: string
  /** Color de marca a respetar (opcional). */
  colorMarca: string
  /** Reseñas reales (de la ficha) — prueba social textual. */
  resenas: string
  /** Tono y contenido real (de la ficha). */
  tonoContenido: string
  /** Links de origen para bajar logo y fotos reales. */
  assets: { instagram: string; maps: string; web: string }
}

// ── Tipo de lead para autocompletar (serializable, sin Dates) ───────────────

/** Vista mínima de un lead con ficha para precargar el formulario del lab. */
export type LabLead = {
  id: string
  businessName: string
  industry: string | null
  zone: string | null
  resenas: string
  tonoContenido: string
  instagram: string
  maps: string
  web: string
}

// ── Helpers de catálogo ──────────────────────────────────────────────────────

function buscarEstilo(id: EstiloVisualId): OpcionEstilo {
  return ESTILOS_GASTRO.find((e) => e.id === id) ?? ESTILOS_GASTRO[0]
}

function buscarTono(id: TonoId): OpcionTono {
  return TONOS_GASTRO.find((t) => t.id === id) ?? TONOS_GASTRO[0]
}

function buscarCta(id: CtaId): OpcionCta {
  return CTAS_GASTRO.find((c) => c.id === id) ?? CTAS_GASTRO[0]
}

// ── Ensamblado del prompt estructurado ───────────────────────────────────────

function bloque(titulo: string, contenido: string | null): string | null {
  const texto = contenido?.trim()
  if (!texto) return null
  return `${titulo}\n${texto}`
}

/**
 * Arma el prompt estructurado para Claude Design a partir del input del
 * formulario. Es deliberadamente MÁS prescriptivo que `buildConstruccionBlock`
 * (el camino libre): codifica el orden canónico de las secciones del rubro, una
 * dirección visual elegida, y los guardrails de calidad/mobile como parte del
 * brief, no como recordatorio aparte. Esa prescripción ES la hipótesis a testear.
 */
export function assembleGastroPrompt(input: Fg2BriefInput): string {
  const estilo = buscarEstilo(input.estilo)
  const tono = buscarTono(input.tono)
  const cta = buscarCta(input.cta)

  const seccionesElegidas = SECCIONES_GASTRO.filter((s) => input.secciones.includes(s.id))
  const seccionesLineas =
    seccionesElegidas.length > 0
      ? seccionesElegidas.map((s, i) => `${i + 1}. ${s.linea}`).join('\n')
      : '1. Hero con CTA de WhatsApp visible.'

  const assetsLineas = [
    input.assets.instagram ? `Instagram: ${input.assets.instagram}` : null,
    input.assets.maps ? `Google Maps: ${input.assets.maps}` : null,
    input.assets.web ? `Web actual: ${input.assets.web}` : null,
  ]
    .filter(Boolean)
    .join('\n')

  const direccionVisual = [
    estilo.directiva,
    `Tono del copy: ${tono.directiva}`,
    input.colorMarca.trim() ? `Color de marca a respetar: ${input.colorMarca.trim()}` : null,
  ]
    .filter(Boolean)
    .join('\n')

  const cabecera = [
    `DEMO WEB — ${input.nombre || 'Negocio gastronómico'}${input.zona.trim() ? ` (${input.zona.trim()})` : ''}`,
    'Rubro: Gastronomía',
  ].join('\n')

  const partes: Array<string | null> = [
    cabecera,
    'Construí una landing de UNA sola página para este negocio gastronómico. Seguí esta especificación al pie: es un brief estructurado, no una sugerencia.',
    bloque('DIRECCIÓN VISUAL', direccionVisual),
    bloque('SECCIONES (en este orden exacto, ni más ni menos)', seccionesLineas),
    bloque('LO QUE HACE ÚNICO AL NEGOCIO (usalo en el hero y el copy)', input.diferencial),
    bloque(
      'LLAMADO A LA ACCIÓN',
      [
        cta.accion,
        input.whatsapp.trim()
          ? `WhatsApp real del negocio: ${input.whatsapp.trim()} (link wa.me, mensaje pre-cargado simple).`
          : 'WhatsApp real del negocio: COMPLETAR con el número público antes de generar.',
        'El botón de WhatsApp es el corazón comercial: siempre visible y alcanzable con el pulgar en mobile.',
      ].join('\n'),
    ),
    bloque(
      'DATOS REALES (obligatorio — nada de placeholders ni lorem ipsum)',
      [
        input.resenas.trim()
          ? `Reseñas reales como prueba social (textuales):\n${input.resenas.trim()}`
          : null,
        input.tonoContenido.trim()
          ? `Tono y contenido real del negocio:\n${input.tonoContenido.trim()}`
          : null,
        assetsLineas ? `Bajá el logo y las fotos reales de:\n${assetsLineas}` : null,
      ]
        .filter(Boolean)
        .join('\n\n'),
    ),
    bloque(
      'CALIDAD (no negociable)',
      [
        'Máximo 2–3 colores, tomados de la marca del negocio.',
        'Jerarquía clara: un solo título grande por sección, espaciados consistentes.',
        'Mobile-first: la mayoría la abre del celular. Nada cortado ni desbordado, textos legibles sin zoom.',
        'Fotografía de comida protagonista: grande y apetitosa, nunca de stock genérico.',
      ].join('\n'),
    ),
  ]

  return partes.filter((p): p is string => Boolean(p)).join('\n\n')
}

// ── Medición de costo del prompt ─────────────────────────────────────────────

export type CostoPrompt = {
  caracteres: number
  palabras: number
  /** ESTIMACIÓN heurística (~4 caracteres por token). No es una medición exacta. */
  tokensEstimados: number
}

/** Aproxima el costo de INPUT del prompt. El costo de generación de la demo
 *  (output) lo cobra Claude Design y se registra a mano en el harness. */
export function estimarCostoPrompt(texto: string): CostoPrompt {
  const caracteres = texto.length
  const limpio = texto.trim()
  const palabras = limpio === '' ? 0 : limpio.split(/\s+/).length
  const tokensEstimados = Math.ceil(caracteres / 4)
  return { caracteres, palabras, tokensEstimados }
}

// ── Fila de log para la tabla del experimento ────────────────────────────────

export type MetodoExperimento = 'formulario' | 'a-mano'

export type LogRowInput = {
  negocio: string
  metodo: MetodoExperimento
  estiloLabel: string
  seccionesCount: number
  tokensPrompt: number
  tiempoGenSegundos: number | null
  /** Cuota/créditos que Claude Design consumió (lo lee Franco en la herramienta). */
  cuotaConsumida: string
  /** Juicio de calidad 1–5 (lo pone Franco / el setter). */
  calidad: string
  notas: string
}

const LOG_COLUMNAS = [
  'negocio',
  'metodo',
  'estilo',
  'secciones',
  'tokens_prompt',
  'tiempo_gen_s',
  'cuota_consumida',
  'calidad_1a5',
  'notas',
] as const

/** Encabezado TSV de la tabla — pegable una sola vez arriba del log. */
export function logHeaderTsv(): string {
  return LOG_COLUMNAS.join('\t')
}

/** Una fila TSV lista para pegar en la tabla del experimento. */
export function buildLogRowTsv(row: LogRowInput): string {
  const limpiar = (valor: string) => valor.replace(/[\t\n]/g, ' ').trim()
  return [
    limpiar(row.negocio) || '—',
    row.metodo,
    limpiar(row.estiloLabel) || '—',
    String(row.seccionesCount),
    String(row.tokensPrompt),
    row.tiempoGenSegundos != null ? row.tiempoGenSegundos.toFixed(0) : '—',
    limpiar(row.cuotaConsumida) || '—',
    limpiar(row.calidad) || '—',
    limpiar(row.notas) || '—',
  ].join('\t')
}
