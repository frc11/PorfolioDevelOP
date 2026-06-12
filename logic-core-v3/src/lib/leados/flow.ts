/**
 * LeadOS B3 — Reglas puras del flujo del setter. Sin Prisma ni 'use server':
 * este archivo se importa tanto desde server components/actions como desde
 * client components (solo trae tipos de @prisma/client, que se borran al
 * compilar). Acá vive la ÚNICA copia de:
 *
 *   - qué estados comerciales cuentan como "respondió" (la consume dossier.ts
 *     para el gate EVALUADA→BRIEF),
 *   - la señal mínima de la ficha (gate de señal, no de completitud),
 *   - el mapeo de vistas del home-hub y la próxima acción por lead.
 */
import type { DossierStage, LeadStatus } from '@prisma/client'
import { calculateNextFollowUp } from '@/lib/follow-up'
import {
  AgendaSchema,
  BriefSchema,
  EvaluacionSchema,
  FichaSchema,
  RechazosSchema,
  SelfCheckSchema,
  type Agenda,
  type Brief,
  type Evaluacion,
  type Ficha,
  type Rechazo,
  type SelfCheck,
} from '@/lib/leados/contracts'

// ── Gate del flujo invertido ─────────────────────────────────────────────────

/**
 * Estados comerciales que implican que el lead YA respondió el primer
 * contacto. PERDIDO y POSTERGADO quedan afuera adrede: pueden alcanzarse sin
 * respuesta alguna, y producir una demo para un lead muerto/pausado no tiene
 * sentido (el camino score >= 4 sigue disponible si la señal lo amerita).
 */
export const RESPONDED_STATUSES = [
  'RESPONDIO',
  'CALL_AGENDADA',
  'CERRADO',
] as const satisfies readonly LeadStatus[]

export function leadRespondio(status: LeadStatus): boolean {
  return (RESPONDED_STATUSES as readonly LeadStatus[]).includes(status)
}

/** Gate EVALUADA→BRIEF: respondió el primer contacto O score 4–5 (caliente). */
export function gateBriefAbierto(status: LeadStatus, score: number | null): boolean {
  return leadRespondio(status) || (score !== null && score >= 4)
}

/**
 * B6 — Gate del envío del link (el momento clave del flujo invertido): SOLO
 * con dossier APROBADA + finalUrl registrada + lead que respondió — o
 * caliente score >= 4 (demo preventiva: el mismo criterio que el gate del
 * brief). La UI no ofrece el envío antes; la action lo re-valida server-side.
 */
export function gateEnvioDemo(params: {
  status: LeadStatus
  score: number | null
  stage: DossierStage | null
  finalUrl: string | null
}): boolean {
  return (
    params.stage === 'APROBADA' &&
    Boolean(params.finalUrl) &&
    gateBriefAbierto(params.status, params.score)
  )
}

// ── Parseo tolerante de los blobs Json del dossier ──────────────────────────

export function parseFicha(json: unknown): Ficha | null {
  const parsed = FichaSchema.safeParse(json)
  return parsed.success ? parsed.data : null
}

export function parseEvaluacion(json: unknown): Evaluacion | null {
  const parsed = EvaluacionSchema.safeParse(json)
  return parsed.success ? parsed.data : null
}

export function parseBrief(json: unknown): Brief | null {
  const parsed = BriefSchema.safeParse(json)
  return parsed.success ? parsed.data : null
}

export function parseSelfCheck(json: unknown): SelfCheck | null {
  const parsed = SelfCheckSchema.safeParse(json)
  return parsed.success ? parsed.data : null
}

export function parseRechazos(json: unknown): Rechazo[] {
  const parsed = RechazosSchema.safeParse(json)
  return parsed.success ? parsed.data : []
}

/** B5: el rechazo más reciente del historial — guía de retrabajo del setter. */
export function ultimoRechazo(json: unknown): Rechazo | null {
  const rechazos = parseRechazos(json)
  return rechazos.length > 0 ? rechazos[rechazos.length - 1] : null
}

/** B7: agenda de la reunión (booking Cal.com + traspaso + cierre). */
export function parseAgenda(json: unknown): Agenda | null {
  const parsed = AgendaSchema.safeParse(json)
  return parsed.success ? parsed.data : null
}

/** B7: el lead tiene reunión confirmada por Cal.com (uid real). */
export function reunionAgendada(agenda: Agenda | null): boolean {
  return agenda?.estado === 'AGENDADA' && Boolean(agenda.calBookingUid)
}

// ── B4: shell de construcción (Claude Design) ────────────────────────────────

export type ShellFase = {
  titulo: string
  detalle: string
  items: string[]
}

/**
 * PROVISORIO: refinar tras el test de Claude Design (registro v0.4).
 *
 * Secuencia guiada del Paso 4 — Construcción. El panel NO construye la demo:
 * acompaña al setter mientras la arma en Claude Design (herramienta externa).
 * Esta constante es la ÚNICA copia del contenido del shell: la UI la consume
 * tal cual, así Franco reemplaza la secuencia por la validada editando SOLO
 * este array, sin tocar componentes.
 */
export const SHELL_CONSTRUCCION: ShellFase[] = [
  {
    titulo: 'Estructura',
    detalle: 'Generá el esqueleto de la demo en Claude Design a partir del brief.',
    items: [
      'Copiá el bloque del brief (está acá abajo) y pegalo en Claude Design como primer mensaje.',
      'Pedile una landing de una sola página con las secciones del brief, en ese orden.',
      'No agregues secciones que el brief no pide — el brief es el plano.',
    ],
  },
  {
    titulo: 'Personalización con datos del negocio',
    detalle: 'Reemplazá todo texto genérico por la realidad del negocio.',
    items: [
      'Nombre, rubro y zona reales en el hero y el pie.',
      'Usá frases de las reseñas reales como prueba social (las tenés en la ficha).',
      'Horarios, dirección y servicios tal como los publica el negocio.',
    ],
  },
  {
    titulo: 'Assets reales',
    detalle: 'Logo y fotos del negocio, no placeholders. Este sub-paso no se saltea.',
    items: [
      'Bajá el logo y 3–5 fotos del Instagram o Google Maps del negocio.',
      'Insertalas donde Claude Design puso imágenes genéricas o de stock.',
      'Si el negocio no tiene logo, usá el nombre tipografiado — nunca un logo inventado.',
    ],
  },
  {
    titulo: 'CTA de WhatsApp',
    detalle: 'El botón de contacto es el corazón comercial de la demo.',
    items: [
      'Botón de WhatsApp con el número real del negocio (formato wa.me/549...).',
      'Mensaje pre-cargado simple: "Hola! Vi la página y quiero hacer una consulta".',
      'Probá el link: tiene que abrir el chat correcto.',
    ],
  },
  {
    titulo: 'Calidad y motion',
    detalle: 'El pulido que separa una demo creíble de una plantilla.',
    items: [
      'Máximo 2–3 colores, tomados de la marca del negocio.',
      'Espaciados consistentes y jerarquía clara (un solo título grande por sección).',
      'Animaciones sutiles si Claude Design las ofrece — nada que maree.',
    ],
  },
  {
    titulo: 'Mobile',
    detalle: 'La mayoría de los dueños la van a abrir desde el celular.',
    items: [
      'Achicá la ventana al ancho de un celular (o usá la vista mobile de Claude Design).',
      'Nada cortado, nada desbordado, textos legibles sin hacer zoom.',
      'El botón de WhatsApp tiene que quedar alcanzable con el pulgar.',
    ],
  },
]

// ── B4: self-check de dos niveles (gate de envío a revisión) ─────────────────

export type HardCheck = {
  id: string
  /** Lo que se guarda en selfCheckJson.itemsDuros[].nombre (lo lee B5). */
  nombre: string
  comoVerificar: string
  /** Arreglo concreto que ve el setter cuando el ítem falla. */
  arreglo: string
}

/**
 * Hard-blocks: dealbreakers binarios verificables por un no-técnico. Si
 * CUALQUIERA falla, el envío a revisión queda bloqueado (la action lo
 * re-valida server-side con `selfCheckAprobado`, no confía en la UI).
 */
export const HARD_CHECKS: HardCheck[] = [
  {
    id: 'carga',
    nombre: 'La demo carga',
    comoVerificar: 'Abrí la URL del draft en otra pestaña (mejor en incógnito).',
    arreglo: 'Si no carga, volvé al Paso 5 y re-publicá el index.html en Netlify Drop.',
  },
  {
    id: 'mobile',
    nombre: 'Se ve bien en tu celular',
    comoVerificar: 'Abrila en TU celular y recorrela entera: que no se rompa nada.',
    arreglo: 'Volvé a Claude Design (Paso 4, fase Mobile), ajustá y re-publicá el draft.',
  },
  {
    id: 'sinRelleno',
    nombre: 'No hay lorem ipsum ni textos de relleno',
    comoVerificar: 'Leé toda la página de punta a punta buscando texto inventado o genérico.',
    arreglo: 'Reemplazá cada relleno con datos reales del negocio (Paso 4, fase Personalización).',
  },
  {
    id: 'linksWhatsapp',
    nombre: 'Los links y el botón de WhatsApp funcionan',
    comoVerificar: 'Tocá cada link y el botón de WhatsApp: tiene que abrir el chat correcto.',
    arreglo: 'Corregí los links rotos en Claude Design (Paso 4, fase CTA) y re-publicá.',
  },
  {
    id: 'datosReales',
    nombre: 'Usa los datos y assets reales del negocio',
    comoVerificar: 'Logo, fotos, nombre y dirección reales — nada de placeholders ni stock.',
    arreglo: 'Insertá los assets del negocio (Paso 4, fase Assets reales) y re-publicá.',
  },
  {
    id: 'fielAlBrief',
    nombre: 'La demo dice lo que el brief pedía',
    comoVerificar: 'Compará sección por sección contra el brief: ¿está todo lo que pedía?',
    arreglo: 'Volvé al Paso 4 con el brief al lado y completá lo que falta.',
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
 */
export const SOFT_CHECKS: SoftCheck[] = [
  { id: 'coloresDeMas', etiqueta: 'Tiene más de 3 colores' },
  { id: 'fuenteDefault', etiqueta: 'La fuente parece la default, sin intención' },
  { id: 'glassNavbar', etiqueta: 'Glassmorphism en la navbar' },
  { id: 'imagenesDeformadas', etiqueta: 'Hay imágenes deformadas o estiradas' },
]

/**
 * Arma el SelfCheck persistible desde el input del setter. Server-side: la
 * action mapea por id contra LA lista vigente (HARD_CHECKS/SOFT_CHECKS) — el
 * cliente nunca define los nombres que viajan a B5. Un hard ausente cuenta
 * como NO verificado (ok: false).
 */
export function buildSelfCheck(
  duros: Record<string, boolean>,
  softIds: string[],
): SelfCheck {
  return {
    itemsDuros: HARD_CHECKS.map((check) => ({
      nombre: check.nombre,
      ok: duros[check.id] === true,
    })),
    softFlags: SOFT_CHECKS.filter((soft) => softIds.includes(soft.id)).map(
      (soft) => soft.etiqueta,
    ),
  }
}

/**
 * Gate de CONSTRUCCION→EN_REVISION: todos los hard-blocks VIGENTES en verde.
 * Se valida contra HARD_CHECKS (no contra lo que el blob diga tener): si la
 * lista cambió después de guardado, el self-check viejo deja de aprobar y el
 * setter lo repasa — dientes, no ceremonia.
 */
export function selfCheckAprobado(selfCheck: SelfCheck | null): boolean {
  if (!selfCheck) return false
  return HARD_CHECKS.every((check) =>
    selfCheck.itemsDuros.some((item) => item.nombre === check.nombre && item.ok),
  )
}

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
 */
export const CANAL_INSTAGRAM: CanalParams = {
  topeDiarioDms: 30,
  avisoDesdeDms: 24,
  ritmoPorHora: 6,
  warmUp: [
    'Cuenta nueva o fría: semana 1, 5–10 DMs por día.',
    'Semana 2: 10–20 DMs por día si no hubo señales de restricción.',
    'Semana 3 en adelante: hasta el tope diario.',
  ],
  openerMaxCaracteres: 300,
  disciplina: [
    'Revisá la carpeta "Solicitudes de mensajes" todos los días: ahí caen las respuestas de cuentas que no te siguen.',
    'Ritmo humano: espaciá los envíos a lo largo del día — nunca ráfagas seguidas.',
    'El link va SIEMPRE en el segundo mensaje, después de que respondan. Nunca en el opener.',
  ],
}

/**
 * B6 — Hard-block de links en el opener (acá la UI sí hace imposible): el
 * link viaja recién con la demo aprobada, en el segundo mensaje.
 */
const LINK_PATTERN =
  /(https?:\/\/|www\.|wa\.me\/|bit\.ly\/|linktr\.ee\/|\S+\.(com|com\.ar|ar|net|org|io|app|dev|shop|online|site|me)\b)/i

export function contieneLink(texto: string): boolean {
  return LINK_PATTERN.test(texto)
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

// ── B6: cadencia de follow-up (la calcula la maquinaria, no el setter) ───────

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

export type CadenciaInfo = {
  /** Toques de follow-up YA hechos (sin contar el opener). */
  toquesHechos: number
  /** Número del próximo toque (1-based) o null si la cadencia cortó. */
  proximoToque: number | null
  /** true cuando el cálculo existente ya no agenda más toques (stop). */
  agotada: boolean
}

/**
 * Estado de la cadencia a partir del conteo de SIN_RESPUESTA del lead
 * (opener incluido — el mismo countFollowUps de la maquinaria). El corte
 * sale del MISMO cálculo que arma las fechas (calculateNextFollowUp): si
 * para el conteo actual no hay próxima fecha, la cadencia cortó.
 */
export function cadenciaInfo(sinRespuestaCount: number): CadenciaInfo {
  if (sinRespuestaCount <= 0) {
    return { toquesHechos: 0, proximoToque: null, agotada: false }
  }
  const agotada = calculateNextFollowUp(sinRespuestaCount) === null
  return {
    toquesHechos: sinRespuestaCount - 1,
    proximoToque: agotada ? null : sinRespuestaCount,
    agotada,
  }
}

/**
 * B6 — Fecha corta determinística (TZ Argentina fija, server y cliente dan
 * lo mismo → cero hydration mismatch, lección de B4).
 */
export function formatFechaCorta(iso: string): string {
  return new Intl.DateTimeFormat('es-AR', {
    timeZone: 'America/Argentina/Buenos_Aires',
    day: '2-digit',
    month: '2-digit',
  }).format(new Date(iso))
}

/**
 * B7 — Fecha + hora de la reunión, siempre en huso de Buenos Aires (mismo
 * criterio determinístico que formatFechaCorta). Ej: "lun 15/06, 14:30 h".
 */
export function formatFechaHora(iso: string): string {
  const fecha = new Intl.DateTimeFormat('es-AR', {
    timeZone: 'America/Argentina/Buenos_Aires',
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
  }).format(new Date(iso))
  const hora = new Intl.DateTimeFormat('es-AR', {
    timeZone: 'America/Argentina/Buenos_Aires',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(iso))
  return `${fecha}, ${hora} h`
}

// ── Señal mínima de la ficha (gate de señal, no de completitud) ──────────────

/**
 * La ficha habilita la evaluación cuando tiene señal mínima: identidad +
 * presencia digital con contenido + al menos uno de reseñas/contenido real.
 * Devuelve la lista de lo que falta (vacía = señal suficiente) con mensajes
 * listos para mostrar — el setter nunca adivina qué le falta.
 */
export function fichaFaltantes(ficha: Ficha | null | undefined): string[] {
  const faltantes: string[] = []
  const identidadOk = Boolean(
    ficha?.identidad && (ficha.identidad.notas || ficha.identidad.igManejadoPor),
  )
  if (!identidadOk) {
    faltantes.push('Identidad: marcá quién maneja el IG o anotá algo de quién está detrás del negocio')
  }
  if (!ficha?.presenciaDigital) {
    faltantes.push('Presencia digital: contá qué tienen (IG, web, Maps) y qué tan vivo está')
  }
  if (!ficha?.resenas && !ficha?.contenidoReal) {
    faltantes.push('Reseñas o contenido real: al menos uno de los dos — es la materia prima del Evaluador')
  }
  return faltantes
}

export function fichaTieneSenal(ficha: Ficha | null | undefined): boolean {
  return fichaFaltantes(ficha).length === 0
}

// ── Labels en castellano (única copia, las usan home y wizard) ──────────────

export const STATUS_LABELS: Record<LeadStatus, string> = {
  PROSPECTO: 'Prospecto',
  DEMO_ENVIADA: 'Demo enviada',
  VIO_VIDEO: 'Vio el video',
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

// ── Mapeo de vistas del home-hub ─────────────────────────────────────────────

export type HomeGroupKey = 'trabajar' | 'revision' | 'seguimiento' | 'agendadas' | 'archivo'

export type HomeLeadInput = {
  id: string
  businessName: string
  industry: string | null
  zone: string | null
  status: LeadStatus
  createdAt: Date
  stage: DossierStage | null
  ficha: Ficha | null
  evaluacion: Evaluacion | null
  /** B5: último rechazo del admin — el card RECHAZADA lo muestra completo. */
  ultimoRechazo: Rechazo | null
  /** B6: contactos reales registrados (opener + toques) — 0 = opener pendiente. */
  contactos: number
  /** B6: el toque agendado por la maquinaria ya venció (nextFollowUpAt <= ahora). */
  followUpVencido: boolean
  /** B6: la demo aprobada ya se envió (dossier.enviadaAt). */
  demoEnviada: boolean
}

export type HomeLead = HomeLeadInput & {
  score: number | null
  caliente: boolean
  gateAbierto: boolean
  grupo: HomeGroupKey
  proximaAccion: string
  /** true = el setter tiene algo para HACER ya; false = está esperando. */
  accionable: boolean
}

/**
 * Mapeo exacto del bloque — la precedencia resuelve los solapamientos:
 *   1. PERDIDO o DESCARTADA → archivo (colapsado, sin ruido).
 *   2. CALL_AGENDADA → agendadas (la reunión manda; la próxima acción del
 *      dossier se sigue mostrando en el card).
 *   3. EN_REVISION → esperando revisión.
 *   4. POSTERGADO → en seguimiento (pausado: no es trabajo de ahora).
 *   5. EVALUADA con gate CERRADO → en seguimiento (avanzable, falta respuesta).
 *   6. APROBADA → en seguimiento (el envío llega en bloques posteriores).
 *   7. Resto (sin dossier, FICHA, EVALUADA gate abierto, BRIEF, CONSTRUCCION,
 *      RECHAZADA) → para trabajar ahora.
 */
function grupoPara(input: HomeLeadInput, gateAbierto: boolean): HomeGroupKey {
  if (input.status === 'PERDIDO' || input.stage === 'DESCARTADA') return 'archivo'
  if (input.status === 'CALL_AGENDADA') return 'agendadas'
  if (input.stage === 'EN_REVISION') return 'revision'
  if (input.status === 'POSTERGADO') return 'seguimiento'
  if (input.stage === 'EVALUADA' && !gateAbierto) {
    // B6: gate cerrado pero con conversación pendiente → es trabajo de AHORA.
    if (input.contactos === 0 || input.followUpVencido) return 'trabajar'
    return 'seguimiento'
  }
  if (input.stage === 'APROBADA') {
    // B6: demo lista para enviar, o toque de seguimiento vencido → trabajo.
    if (!input.demoEnviada && gateAbierto) return 'trabajar'
    if (input.followUpVencido) return 'trabajar'
    return 'seguimiento'
  }
  return 'trabajar'
}

function proximaAccionPara(
  input: HomeLeadInput,
  gateAbierto: boolean,
): { proximaAccion: string; accionable: boolean } {
  if (input.status === 'PERDIDO') {
    return { proximaAccion: 'Perdido — sin acción pendiente', accionable: false }
  }
  if (input.stage === 'DESCARTADA') {
    return { proximaAccion: 'Descartado tras evaluación — bien filtrado', accionable: false }
  }
  if (input.status === 'POSTERGADO') {
    return { proximaAccion: 'Postergado — se retoma cuando se reactive', accionable: false }
  }

  switch (input.stage) {
    case 'EN_REVISION':
      return { proximaAccion: 'Esperando revisión de Franco', accionable: false }
    case 'APROBADA': {
      // B6: el envío del link vive en el Paso 9 del wizard.
      if (!input.demoEnviada && gateAbierto) {
        return { proximaAccion: 'Demo aprobada — enviá el link (Paso 9)', accionable: true }
      }
      if (!input.demoEnviada) {
        return {
          proximaAccion: 'Demo aprobada — se envía cuando el negocio responda',
          accionable: false,
        }
      }
      if (input.followUpVencido) {
        return { proximaAccion: 'Demo enviada — toca el follow-up (Paso 9)', accionable: true }
      }
      return {
        proximaAccion: 'Demo enviada — registrá lo que pase en la conversación (Paso 9)',
        accionable: false,
      }
    }
    case 'BRIEF':
      return {
        proximaAccion: 'Brief listo — arrancá la construcción de la demo',
        accionable: true,
      }
    case 'CONSTRUCCION':
      return {
        proximaAccion: 'Demo en construcción — publicá el draft y pasá el self-check',
        accionable: true,
      }
    case 'RECHAZADA':
      return {
        proximaAccion: 'Franco pidió correcciones — reabrí la construcción y rehacé',
        accionable: true,
      }
    case 'EVALUADA': {
      if (gateAbierto) {
        return { proximaAccion: 'Generá el brief', accionable: true }
      }
      // B6: gate cerrado = la conversación manda — opener o toque pendiente.
      if (input.contactos === 0) {
        return { proximaAccion: 'Mandá el opener (Paso 7)', accionable: true }
      }
      if (input.followUpVencido) {
        return { proximaAccion: 'Toca el follow-up — mandalo y registralo (Paso 9)', accionable: true }
      }
      return { proximaAccion: 'Esperando respuesta del negocio', accionable: false }
    }
    case 'FICHA':
      return fichaTieneSenal(input.ficha)
        ? { proximaAccion: 'Pasala por el Evaluador', accionable: true }
        : { proximaAccion: 'Completá la ficha', accionable: true }
    default:
      return { proximaAccion: 'Completá la ficha', accionable: true }
  }
}

export function clasificarLead(input: HomeLeadInput): HomeLead {
  const score = input.evaluacion?.score ?? null
  const caliente = score !== null && score >= 4 && input.stage !== 'DESCARTADA'
  const gateAbierto = gateBriefAbierto(input.status, score)
  const { proximaAccion, accionable } = proximaAccionPara(input, gateAbierto)
  return {
    ...input,
    score,
    caliente,
    gateAbierto,
    grupo: grupoPara(input, gateAbierto),
    proximaAccion,
    accionable,
  }
}

/**
 * Agrupa y ordena. "Para trabajar ahora" usa el orden obligatorio del bloque:
 * primero los que respondieron y esperan demo (urgencia de turnaround),
 * después calientes (score >= 4), después el resto por antigüedad. Los demás
 * grupos quedan por antigüedad (asume input ordenado por createdAt asc).
 */
export function agruparParaHome(inputs: HomeLeadInput[]): Record<HomeGroupKey, HomeLead[]> {
  const grupos: Record<HomeGroupKey, HomeLead[]> = {
    trabajar: [],
    revision: [],
    seguimiento: [],
    agendadas: [],
    archivo: [],
  }
  for (const input of inputs) {
    const lead = clasificarLead(input)
    grupos[lead.grupo].push(lead)
  }
  const urgencia = (lead: HomeLead): number => {
    if (leadRespondio(lead.status)) return 0
    if (lead.caliente) return 1
    return 2
  }
  grupos.trabajar.sort(
    (a, b) => urgencia(a) - urgencia(b) || a.createdAt.getTime() - b.createdAt.getTime(),
  )
  return grupos
}
