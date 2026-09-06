/**
 * LeadOS — CONTENIDO editable del flujo del setter (copy + datos AJUSTABLES).
 *
 * Hermano de `guidance-content.ts` (guía de cada paso) y `herramientas.ts`
 * (herramientas externas): acá viven los DATOS de copy que Franco ajusta
 * editando SOLO este archivo, sin tocar componentes ni gates.
 *
 * REGLA DE LÍMITE — esto es CONTENIDO, no lógica (misma frontera que
 * `guidance-content.ts`):
 *   - Acá viven las PALABRAS y los PARÁMETROS editables (shell de construcción,
 *     checklists del self-check, parámetros de canal, guardrail de rol,
 *     plantillas de follow-up, labels de estado/etapa).
 *   - El CRITERIO que los CONSUME (el gate `selfCheckAprobado`, el hard-block
 *     `contieneLink`, el cálculo `cadenciaInfo`, la clasificación del home)
 *     sigue en `flow.ts`: ese módulo importa estos datos y decide. Acá nunca se
 *     decide nada.
 *
 * Sin Prisma ni 'use server': solo trae TIPOS de @prisma/client (se borran al
 * compilar), así se importa igual desde server components/actions que desde
 * client components — exactamente como `flow.ts`. Los call-sites históricos que
 * importan estos símbolos desde `flow` siguen funcionando: `flow.ts` los
 * re-exporta.
 */
import type { DossierStage, LeadStatus } from '@prisma/client'
import type { FaseId } from './contracts'

// ── B4: shell de construcción (Claude Design) ────────────────────────────────

export type ShellFase = {
  /**
   * E.1: id ESTABLE de la fase, atado al enum `FaseId` (contracts.ts). Es la
   * llave del progreso persistido (`progresoJson`): reordenar este array no
   * corrompe un progreso ya guardado. El `<ol>` sigue mostrando por posición.
   */
  id: FaseId
  titulo: string
  detalle: string
  items: string[]
}

/**
 * PROVISORIO: refinar tras el test de Claude Design (registro v0.4).
 *
 * Secuencia guiada de la Construcción (mc1/mc2). El panel NO construye la demo:
 * acompaña al setter mientras la arma en Claude Design (herramienta externa).
 * Esta constante es la ÚNICA copia del contenido del shell: la UI la consume
 * tal cual, así Franco reemplaza la secuencia por la validada editando SOLO
 * este array, sin tocar componentes.
 */
export const SHELL_CONSTRUCCION: ShellFase[] = [
  {
    id: 'estructura',
    titulo: 'Estructura',
    detalle: 'Generá el esqueleto de la demo en Claude Design a partir del brief.',
    items: [
      'Copiá el bloque «para Claude Design» y pegalo ahí como primer mensaje.',
      'Pedile una landing de una sola página con las secciones del brief, en ese orden.',
      'No agregues secciones que el brief no pide — el brief es el plano.',
    ],
  },
  {
    id: 'personalizacion',
    titulo: 'Personalización con datos del negocio',
    detalle: 'Reemplazá todo texto genérico por la realidad del negocio.',
    items: [
      'Nombre, rubro y zona reales en el hero y el pie.',
      'Usá frases de las reseñas reales como prueba social (las tenés en la ficha).',
      'Horarios, dirección y servicios tal como los publica el negocio.',
    ],
  },
  {
    id: 'assets',
    titulo: 'Assets reales',
    detalle: 'Logo y fotos del negocio, no placeholders. Este sub-paso no se saltea.',
    items: [
      'Bajá el logo y 3–5 fotos del Instagram o Google Maps del negocio.',
      'Insertalas donde Claude Design puso imágenes genéricas o de stock.',
      'Si el negocio no tiene logo, usá el nombre tipografiado — nunca un logo inventado.',
    ],
  },
  {
    id: 'cta',
    titulo: 'CTA de WhatsApp',
    detalle: 'El botón de contacto es el corazón comercial de la demo.',
    items: [
      'Botón de WhatsApp con el número real del negocio (formato wa.me/549...).',
      'Mensaje pre-cargado simple: "Hola! Vi la página y quiero hacer una consulta".',
      'Probá el link: tiene que abrir el chat correcto.',
    ],
  },
  {
    id: 'calidad',
    titulo: 'Calidad y motion',
    detalle: 'El pulido que separa una demo creíble de una plantilla.',
    items: [
      'Máximo 2–3 colores, tomados de la marca del negocio.',
      'Espaciados consistentes y jerarquía clara (un solo título grande por sección).',
      'Animaciones sutiles si Claude Design las ofrece — nada que maree.',
    ],
  },
  {
    id: 'mobile',
    titulo: 'Mobile',
    detalle: 'La mayoría de los dueños la van a abrir desde el celular.',
    items: [
      'Achicá la ventana al ancho de un celular (o usá la vista mobile de Claude Design).',
      'Nada cortado, nada desbordado, textos legibles sin hacer zoom.',
      'El botón de WhatsApp tiene que quedar alcanzable con el pulgar.',
    ],
  },
]

// ── B4: contenido del self-check de dos niveles ─────────────────────────────
// Las listas; el gate que las valida (selfCheckAprobado) vive en flow.ts.

/**
 * P7 — en qué grupo se presenta un hard-check. Es información de PRESENTACIÓN:
 * el gate (`selfCheckAprobado`) recorre TODA la lista sin mirar el grupo, así
 * que mover un ítem de grupo no cambia qué bloquea el envío.
 *
 *   - `setter`: el setter lo juzga solo, mirando la demo. Sí o no, sin opinar.
 *   - `franco`: hoy pide el criterio de Franco. El setter marca lo que ve; el
 *     ojo final es de él. Bloquean igual — el punto es que el setter MIRE los
 *     tres antes de mandar, no que decida por Franco.
 */
export type GrupoChequeo = 'setter' | 'franco'

export type HardCheck = {
  id: string
  /**
   * Lo que se guarda en selfCheckJson.itemsDuros[].nombre (lo lee B5) — y la
   * llave con la que el formulario re-encuentra un tilde ya guardado. Renombrar
   * uno hace que el tilde viejo deje de matchear: los seis originales quedan
   * literales a propósito (P7).
   */
  nombre: string
  comoVerificar: string
  /** Arreglo concreto que ve el setter cuando el ítem falla. */
  arreglo: string
  /** P7: dónde se presenta. NO lo lee el gate. */
  grupo: GrupoChequeo
}

/** Rótulos de los dos grupos, en el orden en que se presentan (P7). */
export const GRUPOS_CHEQUEO = [
  {
    id: 'setter',
    titulo: 'Esto lo revisás vos',
    detalle: 'Lo mirás en la demo publicada y decidís sí o no. No hace falta preguntarle a nadie.',
  },
  {
    id: 'franco',
    titulo: 'Esto lo mira Franco',
    detalle:
      'Marcá lo que ves vos. El ojo final es de Franco: lo que se te pase, lo cacha él y vuelve como rechazo.',
  },
] as const satisfies readonly { id: GrupoChequeo; titulo: string; detalle: string }[]

/**
 * Hard-blocks: dealbreakers binarios verificables por un no-técnico. Si
 * CUALQUIERA falla, el envío a revisión queda bloqueado (la action lo
 * re-valida server-side con `selfCheckAprobado`, no confía en la UI).
 *
 * P7 — los seis motivos de rechazo de una demo entraron acá, repartidos en los
 * dos grupos. Tres se FUNDIERON con ítems que ya existían (celular → `mobile`,
 * fotos/logo reales → `datosReales`, texto de relleno → `sinRelleno` sigue
 * aparte porque es mecánico y `textoDelNegocio` es la vara alta) y tres son
 * nuevos (`ctaClaro`, `noPareceIa`, `tonoDelNegocio`). Los `nombre` de los seis
 * originales NO se tocaron: son la llave de lo ya guardado y del gate.
 */
export const HARD_CHECKS: HardCheck[] = [
  {
    id: 'carga',
    nombre: 'La demo carga',
    comoVerificar: 'Abrí la URL del borrador en otra pestaña (mejor en incógnito).',
    arreglo: 'Si no carga, volvé a Borrador y re-publicá el index.html en Netlify Drop.',
    grupo: 'setter',
  },
  {
    id: 'mobile',
    nombre: 'Se ve bien en tu celular',
    comoVerificar:
      'Abrila en TU celular y recorrela entera: que se lea sin agrandar y que nada quede cortado.',
    arreglo: 'Volvé a Claude Design («Refinar», fase Mobile), ajustá y re-publicá el borrador.',
    grupo: 'setter',
  },
  {
    id: 'sinRelleno',
    nombre: 'No hay lorem ipsum ni textos de relleno',
    comoVerificar: 'Leé la página entera buscando texto de mentira o puesto para llenar espacio.',
    arreglo: 'Reemplazá cada relleno con datos reales del negocio («Construir», fase Personalización).',
    grupo: 'setter',
  },
  {
    id: 'linksWhatsapp',
    nombre: 'Los links y el botón de WhatsApp funcionan',
    comoVerificar: 'Tocá cada link y el botón de WhatsApp: tiene que abrir el chat correcto.',
    arreglo: 'Corregí los links rotos en Claude Design («Refinar», fase CTA) y re-publicá.',
    grupo: 'setter',
  },
  {
    // P7 · criterio 2. Distinto de `linksWhatsapp`: allá se prueba que el botón
    // FUNCIONE, acá que SE VEA y se entienda sin buscarlo.
    id: 'ctaClaro',
    nombre: 'Se entiende qué tiene que hacer el visitante',
    comoVerificar:
      'Entrá como si fueras un cliente: sin bajar, ¿ves un botón que te diga qué hacer (escribir, llamar, reservar)?',
    arreglo:
      'Volvé a Claude Design («Refinar», fase CTA) y pedile UN botón grande y arriba, con el texto de la acción.',
    grupo: 'setter',
  },
  {
    // P7 · criterio 3 fundido acá. `nombre` intacto (llave de lo guardado).
    id: 'datosReales',
    nombre: 'Usa los datos y assets reales del negocio',
    comoVerificar:
      'Logo, fotos, nombre y dirección del negocio de verdad — nada bajado de un banco de imágenes.',
    arreglo: 'Insertá los assets del negocio («Construir», fase Assets reales) y re-publicá.',
    grupo: 'setter',
  },
  {
    id: 'fielAlBrief',
    nombre: 'La demo dice lo que el brief pedía',
    comoVerificar: 'Compará sección por sección contra el brief: ¿está todo lo que pedía?',
    arreglo: 'Volvé a la Construcción («Construir» o «Refinar») con el brief al lado y completá lo que falta.',
    grupo: 'setter',
  },
  {
    // P7 · criterio 4. Los delatores concretos son los del «Ojo de diseño» de
    // más abajo: se nombran acá para que el tilde sea verificable, no una
    // impresión.
    id: 'noPareceIa',
    nombre: 'No se nota que la hizo una IA',
    comoVerificar:
      'Miralo de una: ¿parece hecha para este negocio o salida de una plantilla? Los delatores concretos están abajo, en «Delatores de siempre».',
    arreglo:
      'Pedile a Claude Design que baje a tres colores, elija una tipografía con intención y saque los efectos de vidrio. Después re-publicá.',
    grupo: 'franco',
  },
  {
    // P7 · criterio 5. La vara alta del texto: `sinRelleno` (grupo del setter)
    // pide que no haya relleno; esto pide que el texto sea de ESTE negocio.
    id: 'textoDelNegocio',
    nombre: 'El texto es de este negocio y de ningún otro',
    comoVerificar:
      'Tapá el nombre y leelo: si el mismo texto le sirve igual a cualquier otro del rubro, no sirve.',
    arreglo:
      'Volvé a Claude Design con la ficha al lado y reescribí con lo del negocio: qué vende, hace cuánto está, quién atiende, de dónde es.',
    grupo: 'franco',
  },
  {
    // P7 · criterio 6.
    id: 'tonoDelNegocio',
    nombre: 'Suena como habla el negocio',
    comoVerificar:
      'Compará con cómo escribe en Instagram: si allá tutea y acá trata de usted, no es su voz.',
    arreglo:
      'Pegale a Claude Design tres textos reales del negocio (la bio y un par de posteos) y pedile que reescriba con ese tono.',
    grupo: 'franco',
  },
]

export type SoftCheck = {
  id: string
  /** Lo que se guarda en selfCheckJson.softFlags[] (lo lee B5). */
  etiqueta: string
}

/**
 * Soft-flags: los delatores del Ojo de diseño. NO bloquean el envío — viajan
 * en selfCheckJson a la superficie de revisión del admin (B5 ya los muestra).
 *
 * P7 — se CONSERVAN tal cual (no están entre los seis criterios) y pasan a
 * presentarse DENTRO del grupo de Franco, como el detalle concreto del check
 * `noPareceIa`: son exactamente los delatores que lo hacen verificable. Marcar
 * uno acá significa «lo vi», al revés que los duros — por eso quedan en su
 * propio sub-bloque rotulado y no mezclados con los tildes de verificación.
 */
export const SOFT_CHECKS: SoftCheck[] = [
  { id: 'coloresDeMas', etiqueta: 'Tiene más de 3 colores' },
  { id: 'fuenteDefault', etiqueta: 'La fuente parece la default, sin intención' },
  { id: 'glassNavbar', etiqueta: 'Efecto vidrio (blur) en la navbar' },
  { id: 'imagenesDeformadas', etiqueta: 'Hay imágenes deformadas o estiradas' },
]

// ── B6: parámetros del canal Instagram (capa de seguridad INFORMATIVA) ──────

export type CanalParams = {
  /** Tope diario de DMs en frío por setter (cuenta ya calentada). */
  topeDiarioDms: number
  /** Desde cuántos DMs del día aparece el aviso "te estás acercando". */
  avisoDesdeDms: number
  /** Ritmo máximo recomendado por hora — humano, nunca ráfagas. */
  ritmoPorHora: number
  /** Escalado de warm-up para cuentas nuevas o frías (texto guía). */
  warmUp: string[]
  /** Umbral recomendado de largo del opener (aviso, no bloqueo). */
  openerMaxCaracteres: number
  /** Recordatorios de disciplina de canal, visibles en la superficie. */
  disciplina: string[]
}

/**
 * DERIVADO DEL RESEARCH de canal — valores AJUSTABLES editando SOLO esta
 * constante (mismo patrón que SHELL_CONSTRUCCION): la UI los consume tal
 * cual. La capa que alimenta es INFORMATIVA por decisión registrada de
 * Franco: avisa al acercarse/pasar el tope pero NUNCA bloquea — el setter
 * está capacitado y decide.
 *
 * P1 (sprint poda): perfil conservador de CUENTA NUEVA, no un techo
 * permanente. Treinta DMs/día es agresivo para una cuenta sin historial de
 * outreach — el research recomienda arrancar bajo y subir gradualmente
 * (ver `warmUp` abajo). Franco sube estos tres números a mano, en este
 * archivo, a medida que la cuenta real que usa el setter acumula
 * historial sin restricciones.
 */
export const CANAL_INSTAGRAM: CanalParams = {
  topeDiarioDms: 10,
  avisoDesdeDms: 8,
  ritmoPorHora: 3,
  warmUp: [
    'Cuenta nueva o fría: arrancá con la mitad del tope diario, más lento que rápido.',
    'Si no hubo señales de restricción, subís hasta el tope diario en la semana 2.',
    'De ahí en adelante, Franco sube el tope a medida que la cuenta acumula historial.',
  ],
  openerMaxCaracteres: 300,
  disciplina: [
    'Revisá la carpeta "Solicitudes de mensajes" todos los días: ahí caen las respuestas de cuentas que no te siguen.',
    'Ritmo humano: espaciá los envíos a lo largo del día — nunca ráfagas seguidas.',
    'El link va SIEMPRE en el segundo mensaje, después de que respondan. Nunca en el opener.',
  ],
}

// ── B6: guardrail de rol (el setter nunca cotiza ni negocia) ─────────────────

/**
 * El guardrail DURO del rol, visible y repetido en la superficie de
 * conversación. Ante cualquier deriva a precio/condiciones la jugada es una
 * sola: agendar la reunión, no responder la objeción.
 */
export const GUARDRAIL_ROL = {
  regla: 'Vos nunca cotizás ni negociás precio o condiciones. Nunca.',
  guion:
    'Mirá, de los números y los detalles se encarga el equipo — te coordino una reunión cortita y lo ven ahí. ¿Te queda mejor mañana o pasado?',
  jugada:
    'Ante cualquier pregunta de precio o condiciones: no respondés la objeción — agendás la reunión. El objetivo siempre es la reunión, no la charla.',
} as const

// ── B6: plantillas de follow-up (cuándo toca lo calcula la maquinaria) ───────

/**
 * Mensajes base de los toques de seguimiento — AJUSTABLES editando solo este
 * array (el criterio fino vive en Fundamentos). CUÁNDO toca cada uno NO vive
 * acá: lo calcula calculateNextFollowUp y lo avisa el cron os-follow-up. Sin
 * link y sin precio, igual que el opener.
 */
export const PLANTILLAS_FOLLOW_UP: string[] = [
  'Hola! Te escribí hace un par de días — sé que el día a día del negocio no da respiro. Lo que te comentaba es puntual y te puede estar costando clientes: ¿tenés 2 minutos esta semana?',
  'Vengo siguiendo lo que publican y se nota el laburo que le meten. Justo por eso te insistí: hay algo concreto que podrían estar aprovechando mejor. Si te interesa, lo vemos en una llamada corta.',
  'Último mensaje, prometido 🙂 — si ahora no es el momento, todo bien. Si en algún momento querés ver lo que te comentaba, escribime y lo coordinamos.',
]

// ── Labels en castellano (única copia, las usan home y wizard) ──────────────

export const STATUS_LABELS: Record<LeadStatus, string> = {
  PROSPECTO: 'Prospecto',
  DEMO_ENVIADA: 'Demo enviada',
  VIO_VIDEO: 'En conversación',
  RESPONDIO: 'Respondió',
  CALL_AGENDADA: 'Reunión agendada',
  CERRADO: 'Cerrado',
  PERDIDO: 'Perdido',
  POSTERGADO: 'Postergado',
}

export const STAGE_LABELS: Record<DossierStage, string> = {
  FICHA: 'Ficha',
  EVALUADA: 'Evaluada',
  BRIEF: 'Brief',
  CONSTRUCCION: 'Construcción',
  EN_REVISION: 'En revisión',
  APROBADA: 'Aprobada',
  RECHAZADA: 'Rechazada',
  DESCARTADA: 'Descartada',
}
