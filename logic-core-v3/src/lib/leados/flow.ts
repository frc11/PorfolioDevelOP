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
  CANAL_INSTAGRAM,
  GUARDRAIL_ROL,
  PLANTILLAS_FOLLOW_UP,
  STATUS_LABELS,
  STAGE_LABELS,
} from './flow-content.ts'
export type { ShellFase, HardCheck, SoftCheck, CanalParams } from './flow-content.ts'

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
  /** B6: contactos reales registrados (opener + toques) — 0 = opener pendiente. */
  contactos: number
  /** B6: el toque agendado por la maquinaria ya venció (nextFollowUpAt <= ahora). */
  followUpVencido: boolean
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

/**
 * B-beta — Rótulo INFORMATIVO de por qué una card ocupa su lugar en el carril
 * "trabajar". NO recalcula el orden: lee los MISMOS tres tiers que la función
 * `urgencia` de agruparParaHome (respondió → caliente → resto), traducidos al
 * idioma del setter. Solo aplica a "trabajar" — el único lane ordenado por
 * urgencia; los demás van por antigüedad, ya visible en la meta "hace X días".
 * Devuelve null cuando no hay rótulo que mostrar.
 *
 * MANTENER EN SINCRONÍA con `urgencia`: si cambian los tiers del sort, cambian
 * estas ramas. Es deliberado que el criterio (el sort) y su traducción (este
 * rótulo) sean dos lecturas de la misma regla, no una sola: tocar el sort está
 * fuera de alcance acá.
 */
export function motivoOrden(lead: HomeLead): string | null {
  if (lead.grupo !== 'trabajar') return null
  if (leadRespondio(lead.status)) return 'Respondió — va primero'
  if (lead.caliente) return 'Caliente — va antes del resto'
  return 'Por orden de llegada'
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

/** Partición de la cartera con la organización propia del setter por encima. */
export type CarteraParticion = {
  /** Fijados por el setter — flotan arriba, sacados de su cola natural. */
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
 *   - fijado → fijados (flota arriba: prioridad explícita del setter);
 *   - pausado → pausados (lo escondió hasta una fecha que él eligió);
 *   - el resto cae en su cola natural.
 * Puro: no mira el reloj — `snoozed`/`pinned` ya vienen resueltos en el input.
 *
 * Nota (2.3 — pin en MODO DIRECCIÓN): que un fijado accionable quede FUERA del
 * foco (sale de la cola `trabajar`) es organización-de-cartera, no foco. Si su
 * única accionable está fijada, el home cae en "todo en espera" (2.1b ya lo
 * cuenta honesto). Si el pin debería poder SER foco —revertir esta exclusión— es
 * decisión pendiente de Franco (flagueada en bitácora 2.1b). 2.3 lo DEJA como
 * está: el pin sigue sacando el lead de su cola natural.
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
    } else if (lead.pinned) {
      fijados.push(lead)
    } else if (lead.snoozed) {
      pausados.push(lead)
    } else {
      grupos[lead.grupo].push(lead)
    }
  }
  fijados.sort(ordenUrgencia)
  grupos.trabajar.sort(ordenUrgencia)
  // Pausados: el que despierta antes, primero.
  pausados.sort(
    (a, b) => (a.snoozedUntil?.getTime() ?? 0) - (b.snoozedUntil?.getTime() ?? 0),
  )
  return { fijados, pausados, grupos }
}

/** Órdenes elegibles. `colas` = vista agrupada por defecto; el resto, lista plana. */
export type OrdenCartera = 'colas' | 'urgencia' | 'reciente' | 'antiguo' | 'alfabetico'

/** Vista de un lead para el filtro por estado (la cola que el setter ve). */
export type VistaCartera = HomeGroupKey | 'pausados'
export type EstadoFiltro = 'todos' | VistaCartera

/** En qué cola cae el lead a ojos del setter (snooze pesa sobre la cola natural). */
export function vistaDeLead(lead: HomeLead): VistaCartera {
  if (lead.grupo === 'archivo') return 'archivo'
  if (lead.snoozed) return 'pausados'
  return lead.grupo
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
