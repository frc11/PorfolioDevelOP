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
 *
 * El CONTENIDO editable del flujo (shell de construcción, checklists del
 * self-check, parámetros de canal, guardrail de rol, plantillas de follow-up,
 * labels de estado/etapa) se extrajo a `flow-content.ts` y se re-exporta abajo:
 * este archivo queda con SOLO reglas/gates/clasificación.
 */
import type { DossierStage, LeadStatus } from '@prisma/client'
// Imports relativos a propósito (no `@/`): este módulo lo carga el harness de
// invariante con ts-node SIN tsconfig-paths, así que un `@/` en la cadena de
// runtime rompe el `require`. Todo el árbol de runtime de flow.ts es relativo o
// node_modules (follow-up no importa nada; contracts solo zod; flow-content y
// revision solo `import type`) — por eso `flow.invariant.ts` puede importar
// `clasificarLead` de verdad. Es además el patrón ya usado por home.ts/foco.ts.
import { calculateNextFollowUp } from '../follow-up.ts'
import {
  AgendaSchema,
  BriefSchema,
  EvaluacionSchema,
  FichaSchema,
  ProgresoSchema,
  RechazosSchema,
  SelfCheckSchema,
  type Agenda,
  type Brief,
  type Evaluacion,
  type Ficha,
  type Progreso,
  type Rechazo,
  type SelfCheck,
} from './contracts.ts'
import { HARD_CHECKS, SOFT_CHECKS } from './flow-content.ts'
import { esCaliente } from './revision.ts'

// El contenido editable del flujo vive en flow-content.ts. Se re-exporta acá
// para que los call-sites que importan estos símbolos desde `flow` sigan
// funcionando intactos. HARD_CHECKS/SOFT_CHECKS además se importan arriba: los
// gates de self-check (buildSelfCheck/selfCheckAprobado) los consumen.
export {
  SHELL_CONSTRUCCION,
  HARD_CHECKS,
  SOFT_CHECKS,
  GRUPOS_CHEQUEO,
  CANAL_INSTAGRAM,
  GUARDRAIL_ROL,
  PLANTILLAS_FOLLOW_UP,
  STATUS_LABELS,
  STAGE_LABELS,
} from './flow-content.ts'
export type { ShellFase, HardCheck, SoftCheck, GrupoChequeo, CanalParams } from './flow-content.ts'

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

/** Gate EVALUADA→BRIEF: respondió el primer contacto O el lead está marcado caliente. */
export function gateBriefAbierto(status: LeadStatus, caliente: boolean): boolean {
  return leadRespondio(status) || esCaliente(caliente)
}

/**
 * B6 — Gate del envío del link (el momento clave del flujo invertido): SOLO
 * con dossier APROBADA + finalUrl registrada + lead que respondió — o caliente
 * (demo preventiva: el mismo criterio que el gate del brief). Desde admin-1b el
 * "caliente" es el campo que marca Franco, no el score. La UI no ofrece el envío
 * antes; la action lo re-valida server-side.
 */
export function gateEnvioDemo(params: {
  status: LeadStatus
  caliente: boolean
  stage: DossierStage | null
  finalUrl: string | null
}): boolean {
  return (
    params.stage === 'APROBADA' &&
    Boolean(params.finalUrl) &&
    gateBriefAbierto(params.status, params.caliente)
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

/**
 * E.1/E.2 — Progreso del checklist de Construcción. A diferencia del resto de
 * los blobs NO devuelve `null`: un `progresoJson` ausente o inválido equivale a
 * un checklist FRESCO (`{ completadas: [] }`), estado legítimo por diseño (es un
 * auto-reporte, NO un gate — ver `progreso-isolation.invariant.ts`).
 */
export function parseProgreso(json: unknown): Progreso {
  const parsed = ProgresoSchema.safeParse(json)
  return parsed.success ? parsed.data : { completadas: [] }
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

// ── B4: self-check de dos niveles (gate de envío a revisión) ─────────────────
// Las listas HARD_CHECKS/SOFT_CHECKS viven en flow-content.ts; acá el gate.

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

// ── B6: hard-block de links en el opener ─────────────────────────────────────
// (los parámetros INFORMATIVOS del canal, CANAL_INSTAGRAM, viven en flow-content.ts)

/**
 * B6 — Hard-block de links en el opener (acá la UI sí hace imposible): el
 * link viaja recién con la demo aprobada, en el segundo mensaje.
 */
const LINK_PATTERN =
  /(https?:\/\/|www\.|wa\.me\/|bit\.ly\/|linktr\.ee\/|\S+\.(com|com\.ar|ar|net|org|io|app|dev|shop|online|site|me)\b)/i

export function contieneLink(texto: string): boolean {
  return LINK_PATTERN.test(texto)
}

// ── B6: cadencia de follow-up (la calcula la maquinaria, no el setter) ───────
// (guardrail GUARDRAIL_ROL y plantillas PLANTILLAS_FOLLOW_UP viven en flow-content.ts)

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

// ── Mapeo de vistas del home-hub ─────────────────────────────────────────────

export type HomeGroupKey = 'trabajar' | 'revision' | 'seguimiento' | 'agendadas' | 'archivo'

export type HomeLeadInput = {
  id: string
  businessName: string
  industry: string | null
  zone: string | null
  status: LeadStatus
  /** admin-1b: campo persistido que Franco marca a ojo — fuente del caliente operativo. */
  caliente: boolean
  createdAt: Date
  stage: DossierStage | null
  ficha: Ficha | null
  evaluacion: Evaluacion | null
  /** B5: último rechazo del admin — el card RECHAZADA lo muestra completo. */
  ultimoRechazo: Rechazo | null
  /** A-09: la reunión agendada (booking + resultado post-reunión del admin) —
   * fuente de la nota de PERDIDO en el archivo categorizado. */
  agenda: Agenda | null
  /** B6: contactos reales registrados (opener + toques) — 0 = opener pendiente. */
  contactos: number
  /** B6: el toque agendado por la maquinaria ya venció (nextFollowUpAt <= ahora). */
  followUpVencido: boolean
  /**
   * 2.1: no hay próximo toque agendado (nextFollowUpAt null) — cadencia agotada
   * (opener + 3 toques sin respuesta) o rechazado. Refina la próxima acción del lead
   * en outreach: sin toque que mandar, se enfría (pasivo, el cierre lo decide Franco).
   * Opcional: ausente = sin refinamiento (se trata como un toque futuro → "esperando");
   * los invariantes que no ejercen este eje lo omiten.
   */
  sinProximoToque?: boolean
  /**
   * 2.1b/D6: POSTERGADO cuya fecha de reactivación ya pasó (reactivateAt <= ahora).
   * El cron solo notifica — no reactiva el lead solo: por eso el home lo vuelve a
   * tratar como trabajo. Derivado en `buildHomeLeads` (reloj request-time, fuera
   * del render), igual que `followUpVencido`.
   */
  postergadoVencido: boolean
  /** B6: la demo aprobada ya se envió (dossier.enviadaAt). */
  demoEnviada: boolean
  /** B-beta: el setter fijó este lead en su cartera (organización propia, privada). */
  pinned: boolean
  /** B-beta: pausa personal del setter vigente (snoozedUntil > ahora), ya resuelta. */
  snoozed: boolean
  /** B-beta: hasta cuándo dura la pausa personal — para mostrar "pausado hasta X". */
  snoozedUntil: Date | null
  /** B-beta: nota privada del setter (NO es lead.notes del admin). null = sin nota. */
  note: string | null
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
  if (input.status === 'POSTERGADO') {
    // 2.1b/D6: la postergación vencida vuelve a ser trabajo de ahora (el cron solo
    // notifica, no reactiva); con la fecha aún en el futuro, sigue en seguimiento.
    return input.postergadoVencido ? 'trabajar' : 'seguimiento'
  }
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
    // 2.1b/D6: vencida la postergación, retomar el contacto es acción de ahora;
    // con la fecha aún en el futuro, sigue pausado a la espera de reactivarse.
    return input.postergadoVencido
      ? { proximaAccion: 'Se venció la postergación — retomá el contacto', accionable: true }
      : { proximaAccion: 'Postergado — se retoma cuando se reactive', accionable: false }
  }
  // B8A/H3: el lead con reunión agendada lo cierra Franco — la próxima acción
  // es la reunión, no el paso del dossier (que puede estar atrás). Sin este
  // caso, un CALL_AGENDADA en stage FICHA mostraba "Completá la ficha" dentro
  // de "Agendadas" (incoherencia observada en runtime).
  if (input.status === 'CALL_AGENDADA') {
    return { proximaAccion: 'Reunión agendada — la cierra Franco', accionable: false }
  }

  switch (input.stage) {
    case 'EN_REVISION':
      return { proximaAccion: 'Esperando revisión de Franco', accionable: false }
    case 'APROBADA': {
      // B6: el envío del link vive en el Paso 9 del wizard.
      if (!input.demoEnviada && gateAbierto) {
        return { proximaAccion: 'Demo aprobada — enviá el link (Envío)', accionable: true }
      }
      if (!input.demoEnviada) {
        return {
          proximaAccion: 'Demo aprobada — se envía cuando el negocio responda',
          accionable: false,
        }
      }
      if (input.followUpVencido) {
        return { proximaAccion: 'Demo enviada — te toca un toque (Seguimiento)', accionable: true }
      }
      return {
        proximaAccion: 'Demo enviada — registrá lo que pase en la conversación (Seguimiento)',
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
        proximaAccion: 'Demo en construcción — publicá el borrador y pasá el chequeo final',
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
        return { proximaAccion: 'Mandá el opener (Opener)', accionable: true }
      }
      if (input.followUpVencido) {
        return { proximaAccion: 'Te toca un toque — mandalo y registralo (Seguimiento)', accionable: true }
      }
      // 2.1: cadencia agotada o rechazado (sin próximo toque) → no hay toque que
      // mandar. Pasivo visible; el cierre a PERDIDO lo decide Franco, jamás se
      // automatiza. Distinto de "esperando" (que aún tiene un toque futuro).
      if (input.sinProximoToque) {
        return { proximaAccion: 'Se enfría — el cierre lo decide Franco', accionable: false }
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

/**
 * P8 — Rótulo INFORMATIVO de por qué una card ocupa su lugar en el carril
 * "trabajar". NO recalcula nada: lee el MISMO `trabajoTier` que ordena la cola,
 * traducido al idioma del setter. Solo aplica a "trabajar" — el único lane
 * ordenado por prioridad; los demás van por antigüedad, ya visible en la meta
 * "hace X días". Devuelve null cuando no hay rótulo que mostrar.
 *
 * Sincronía POR CONSTRUCCIÓN (antes era por disciplina): el `switch` es
 * exhaustivo sobre `TrabajoTier`, así que agregar un tier al criterio no compila
 * hasta darle rótulo. A-05/6.1: el pin es el tier de más peso (sube el fijado a
 * la cima), así que su rótulo va PRIMERO — sin él, un fijado que es foco mostraría
 * el rótulo de su tier y mentiría sobre por qué está arriba.
 *
 * Tono: oportunidad, nunca reproche. Ninguna rama mide el comportamiento del
 * setter ("hace X días que no tocás esto") — todas nombran lo que HAY para hacer.
 */
export function motivoOrden(lead: HomeLead): string | null {
  if (lead.grupo !== 'trabajar') return null
  if (lead.pinned) return 'Fijado por vos — va primero'
  switch (trabajoTier(lead)) {
    case TRABAJO_TIER.CONSTRUIR:
      return 'Pasó el filtro y le falta la demo — construila'
    case TRABAJO_TIER.ESPERA_TU_ACCION:
      return 'Te está esperando a vos'
    case TRABAJO_TIER.CONTACTAR_CON_DEMO:
      return 'La demo está lista para mandar'
    case TRABAJO_TIER.EVALUAR:
      return 'Todavía no sabés si sirve — evalualo'
    case TRABAJO_TIER.CONTACTO_SIN_DEMO:
      return 'Todavía no hay demo que mostrar'
  }
}

export function clasificarLead(input: HomeLeadInput): HomeLead {
  const score = input.evaluacion?.score ?? null
  // admin-1b: el caliente operativo (badge, orden, gate) sale del CAMPO, no del
  // score. `score` se conserva solo para el dato informativo `HomeLead.score`.
  const caliente = esCaliente(input.caliente, input.stage)
  const gateAbierto = gateBriefAbierto(input.status, input.caliente)
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
  grupos.trabajar.sort(ordenUrgencia)
  return grupos
}

// ── B-beta: palancas de organización propia del setter sobre la cartera ──────

/** Tier de urgencia del carril "trabajar": respondió → caliente → resto. */
function urgenciaTier(lead: HomeLead): number {
  if (leadRespondio(lead.status)) return 0
  if (lead.caliente) return 1
  return 2
}

/** Comparador de urgencia (tier, y a igualdad, antigüedad). Única copia. */
function ordenUrgencia(a: HomeLead, b: HomeLead): number {
  return urgenciaTier(a) - urgenciaTier(b) || a.createdAt.getTime() - b.createdAt.getTime()
}

// ── P8: qué es "trabajo pendiente" ahora que el recorrido se dio vuelta ───────

/**
 * P8 — El criterio del FOCO. El recorrido cambió: antes el setter contactaba
 * primero y construía si el negocio respondía; ahora llega con la demo hecha. El
 * orden viejo (`urgenciaTier`: respondió → caliente → resto) razonaba con el
 * recorrido anterior — no miraba el stage en ningún momento, así que una demo a
 * medio construir quedaba en el último tier detrás de cualquier prospecto frío
 * marcado caliente. Este tier lo reemplaza COMO CRITERIO PRIMARIO de la cola
 * `trabajar`; la urgencia vieja sobrevive como DESEMPATE dentro del tier (ver
 * `ordenFoco`), donde sigue siendo señal útil sin poder dominar.
 *
 * Números bajos = más prioritario. El orden es el del sprint:
 *   0 CONSTRUIR            — pasó la evaluación y todavía no tiene demo. Es el
 *                            trabajo que produce valor y el que antes no se sugería.
 *   1 ESPERA_TU_ACCION     — algo quedó trabado esperándolo a él: correcciones de
 *                            Franco, un toque vencido, una postergación cumplida.
 *   2 CONTACTAR_CON_DEMO   — la demo está aprobada y lista para mandar.
 *   3 EVALUAR              — lead nuevo sin veredicto todavía.
 *   4 CONTACTO_SIN_DEMO    — contacto del recorrido VIEJO (opener sin demo). Va
 *                            último a propósito: sigue siendo visible y
 *                            accionable, pero ya no es lo que abre el día.
 *
 * RESTRICCIÓN DEL PREMORTEM (la que no se negocia): construir nunca se sugiere
 * para un lead sin veredicto. Cada demo son treinta minutos del setter; hacerla
 * para quien no califica es la forma más cara de perder el día. Un lead sin
 * evaluar cae SIEMPRE en EVALUAR — la única puerta a CONSTRUIR es un stage que
 * solo se alcanza después del veredicto (BRIEF/CONSTRUCCION vienen de EVALUADA,
 * y EVALUADA es el veredicto mismo). La garantía es estructural, no un `if`.
 *
 * Es criterio de PRESENTACIÓN: lee stage/status/flags ya persistidos y no
 * transiciona nada. Gates intactos — en particular `gateBriefAbierto`, que sigue
 * exigiendo respuesta (o caliente) para abrir el brief. Por eso un lead que pasó
 * la evaluación pero está frío NO puede construir todavía y cae en el tier de
 * contacto viejo: el foco ordena dentro de lo que el gate permite, nunca contra él.
 */
const TRABAJO_TIER = {
  CONSTRUIR: 0,
  ESPERA_TU_ACCION: 1,
  CONTACTAR_CON_DEMO: 2,
  EVALUAR: 3,
  CONTACTO_SIN_DEMO: 4,
} as const

type TrabajoTier = (typeof TRABAJO_TIER)[keyof typeof TRABAJO_TIER]

/**
 * El orden de los `if` ES el orden de prioridad: el primero que matchea gana. Un
 * lead puede calificar para dos tiers (una demo a medio construir con un toque
 * vencido encima) y ahí construir manda — es lo que el sprint pone primero.
 */
function trabajoTier(lead: HomeLead): TrabajoTier {
  // Construir: pasó el filtro y la demo todavía no existe. EVALUADA entra solo
  // con el gate abierto — con el gate cerrado el brief está bloqueado y mandarlo
  // a construir sería mentirle. RECHAZADA queda fuera a propósito: es retrabajo
  // sobre una demo que ya existe, y el sprint lo pone en el tier de abajo.
  if (lead.stage === 'BRIEF' || lead.stage === 'CONSTRUCCION') return TRABAJO_TIER.CONSTRUIR
  if (lead.stage === 'EVALUADA' && lead.gateAbierto) return TRABAJO_TIER.CONSTRUIR

  // Lo que quedó trabado esperándolo a él: correcciones de Franco, un toque que
  // venció, una postergación que se cumplió.
  if (lead.stage === 'RECHAZADA') return TRABAJO_TIER.ESPERA_TU_ACCION
  if (lead.followUpVencido || lead.postergadoVencido) return TRABAJO_TIER.ESPERA_TU_ACCION

  // La demo ya está aprobada: lo que queda es mandarla.
  if (lead.stage === 'APROBADA') return TRABAJO_TIER.CONTACTAR_CON_DEMO

  // Sin veredicto: evaluar. Nunca construir (restricción del premortem).
  if (lead.stage === null || lead.stage === 'FICHA') return TRABAJO_TIER.EVALUAR

  // Resto: EVALUADA con el gate cerrado — el brief no se puede abrir, así que lo
  // único disponible es el contacto del recorrido viejo (opener/toque). Último.
  return TRABAJO_TIER.CONTACTO_SIN_DEMO
}

/**
 * A-05 + P8 — Comparador del foco (cola `trabajar`). Tres niveles, en orden:
 *   1. el fijado va PRIMERO (A-05: el pin es preferencia de ORDEN, no exclusión —
 *      sube el lead a la cima de la cola accionable en vez de sacarlo de ella,
 *      mismo patrón `Number(b.pinned) - Number(a.pinned)` que `filtrarYOrdenarCartera`);
 *   2. a igualdad de pin manda `trabajoTier` — el criterio nuevo (construir primero);
 *   3. a igualdad de tier, la urgencia de siempre (respondió → caliente → antigüedad),
 *      que queda como desempate: sigue siendo señal, ya no es el criterio.
 *
 * `ordenUrgencia` NO cambió: la cartera (orden "urgencia") y los `fijados` en vuelo
 * conservan exactamente el orden que tenían. Lo que cambia es la cola del foco.
 */
function ordenFoco(a: HomeLead, b: HomeLead): number {
  return (
    Number(b.pinned) - Number(a.pinned) ||
    trabajoTier(a) - trabajoTier(b) ||
    ordenUrgencia(a, b)
  )
}

/** Partición de la cartera con la organización propia del setter por encima. */
export type CarteraParticion = {
  /**
   * A-05: fijados que NO son accionables (en vuelo: seguimiento/revisión/
   * agendadas, o fijado+pausado) — flotan aparte porque no hay foco que ordenar.
   * El fijado ACCIONABLE ya no cae acá: entra a `grupos.trabajar` en la cima
   * (el pin ordena el foco, no lo excluye).
   */
  fijados: HomeLead[]
  /** Pausados por el setter (snooze personal vigente) — fuera de las colas. */
  pausados: HomeLead[]
  /** Las cinco colas de trabajo, sin fijados/pausados (salvo archivo). */
  grupos: Record<HomeGroupKey, HomeLead[]>
}

/**
 * Reordena la cartera YA clasificada con las palancas propias del setter. La
 * precedencia es deliberada:
 *   - archivo (perdido/descartada) manda: ni pin ni snooze lo rescatan de ahí;
 *   - fijado ACCIONABLE y vigente → `grupos.trabajar` en la CIMA (A-05: el pin
 *     ordena el foco, no lo excluye — ver `ordenFoco`);
 *   - fijado NO accionable (en vuelo) o fijado+pausado → fijados (flota aparte);
 *   - pausado → pausados (lo escondió hasta una fecha que él eligió);
 *   - el resto cae en su cola natural.
 * Puro: no mira el reloj — `snoozed`/`pinned` ya vienen resueltos en el input.
 *
 * A-05 (pin en MODO DIRECCIÓN — decisión de Franco, revierte la exclusión 2.1a):
 * un fijado accionable ya NO sale de la cola `trabajar`; sube a su cima y puede
 * SER el foco. Antes quedaba fuera y, si era la única accionable, el home caía en
 * "todo en espera" con un fijado esperando — elegir/fijar dejaba el foco
 * falsamente vacío. Ahora el pin es preferencia de ORDEN dentro de la cola
 * accionable. El `!lead.snoozed` es la guarda mínima: una pausa personal vigente
 * gana al pin (un lead que el setter escondió no debe saltar al foco); ese fijado
 * pausado cae en `fijados`, como cualquier fijado no accionable.
 */
export function particionarCartera(leads: HomeLead[]): CarteraParticion {
  const fijados: HomeLead[] = []
  const pausados: HomeLead[] = []
  const grupos: Record<HomeGroupKey, HomeLead[]> = {
    trabajar: [],
    revision: [],
    seguimiento: [],
    agendadas: [],
    archivo: [],
  }
  for (const lead of leads) {
    if (lead.grupo === 'archivo') {
      grupos.archivo.push(lead)
    } else if (lead.pinned && lead.grupo === 'trabajar' && !lead.snoozed) {
      // A-05: el fijado accionable y vigente entra al foco (la cima la fija
      // `ordenFoco`, abajo) en vez de excluirse en `fijados`.
      grupos.trabajar.push(lead)
    } else if (lead.pinned) {
      // Fijado no accionable (en vuelo) o fijado+pausado: flota aparte — no hay
      // foco que ordenar. (Se preserva la precedencia pin>snooze de la cartera.)
      fijados.push(lead)
    } else if (lead.snoozed) {
      pausados.push(lead)
    } else {
      grupos[lead.grupo].push(lead)
    }
  }
  fijados.sort(ordenUrgencia)
  // A-05: fijado primero (si lo hay), después la urgencia de siempre.
  grupos.trabajar.sort(ordenFoco)
  // Pausados: el que despierta antes, primero.
  pausados.sort(
    (a, b) => (a.snoozedUntil?.getTime() ?? 0) - (b.snoozedUntil?.getTime() ?? 0),
  )
  return { fijados, pausados, grupos }
}

/** Órdenes elegibles. `colas` = vista agrupada por defecto; el resto, lista plana. */
export type OrdenCartera = 'colas' | 'urgencia' | 'reciente' | 'antiguo' | 'alfabetico'

/** Vista de un lead para el filtro por estado (la cola que el setter ve). A-09:
 * el archivo se filtra por causa real, no como bloque único sin categoría. */
export type VistaCartera = Exclude<HomeGroupKey, 'archivo'> | `archivo-${ArchivoCausa}` | 'pausados'
export type EstadoFiltro = 'todos' | VistaCartera

/** En qué cola cae el lead a ojos del setter (snooze pesa sobre la cola natural). */
export function vistaDeLead(lead: HomeLead): VistaCartera {
  if (lead.grupo === 'archivo') return `archivo-${archivoCausaDe(lead)}`
  if (lead.snoozed) return 'pausados'
  return lead.grupo
}

/**
 * A-09: por qué causa real cayó el lead al archivo — DESCARTADA (evaluación
 * previa a la demo; motivo SIEMPRE persistido, `transitionDossier` lo exige)
 * o PERDIDO (post-reunión; nota del admin opcional, la deja `resultado` de la
 * agenda). Deriva sobre datos ya persistidos — presentación/agregación pura,
 * el gate/transición que los escribe no se toca.
 */
export type ArchivoCausa = 'descartado' | 'perdido'

function archivoCausaDe(lead: HomeLead): ArchivoCausa {
  return lead.stage === 'DESCARTADA' ? 'descartado' : 'perdido'
}

export function archivoMotivo(
  lead: HomeLead,
): { causa: ArchivoCausa; motivo: string | null } | null {
  if (lead.grupo !== 'archivo') return null
  const causa = archivoCausaDe(lead)
  return {
    causa,
    motivo:
      causa === 'descartado'
        ? (lead.evaluacion?.motivoDescarte ?? null)
        : (lead.agenda?.resultado?.nota ?? null),
  }
}

/** Normaliza para búsqueda: sin acentos, minúsculas (es-AR escribe con y sin tilde). */
function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
}

/** El lead matchea la búsqueda por nombre, rubro, zona o su nota propia. */
export function leadCoincideBusqueda(lead: HomeLead, queryNorm: string): boolean {
  if (queryNorm === '') return true
  const campos = [lead.businessName, lead.industry, lead.zone, lead.note]
  return campos.some((campo) => campo != null && normalizar(campo).includes(queryNorm))
}

const COMPARADORES: Record<
  Exclude<OrdenCartera, 'colas'>,
  (a: HomeLead, b: HomeLead) => number
> = {
  urgencia: ordenUrgencia,
  reciente: (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
  antiguo: (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
  alfabetico: (a, b) => a.businessName.localeCompare(b.businessName, 'es'),
}

/**
 * Lista plana de la cartera para el modo "lista" (cuando el setter busca,
 * filtra o elige un orden): aplica búsqueda + filtro de estado + orden. Los
 * fijados SIEMPRE flotan arriba — pin = "mostrámelo primero", gana al orden
 * elegido. Devuelve un array nuevo; no muta el input.
 */
export function filtrarYOrdenarCartera(
  leads: HomeLead[],
  query: string,
  estado: EstadoFiltro,
  orden: Exclude<OrdenCartera, 'colas'>,
): HomeLead[] {
  const queryNorm = normalizar(query.trim())
  const filtrados = leads.filter(
    (lead) =>
      leadCoincideBusqueda(lead, queryNorm) &&
      (estado === 'todos' || vistaDeLead(lead) === estado),
  )
  const comparar = COMPARADORES[orden]
  return filtrados.sort(
    (a, b) => Number(b.pinned) - Number(a.pinned) || comparar(a, b),
  )
}
