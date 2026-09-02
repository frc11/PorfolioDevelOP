import { PrismaClient, type Prisma, type DossierStage, type LeadStatus } from '@prisma/client'
import dotenv from 'dotenv'
import { HARD_CHECKS } from '../../src/lib/leados/flow'

// El proceso de test necesita DATABASE_URL (Prisma) y AUTH_SECRET (minteo de
// cookie del 2º setter). No hay .env, solo .env.local. Idempotente: dotenv no
// pisa vars ya seteadas, así correr esto en config + helper no choca.
dotenv.config({ path: '.env.local' })

/**
 * Seed/teardown del smoke del setter. Datos NAMESPACED y teardown por id
 * EXACTO (la Neon dev es compartida y driftada → nunca borrar por heurística
 * amplia ni tocar datos pre-existentes). Sembrar `stage` directo es legítimo
 * SOLO en setup de test (colocar el lead en un punto de partida); el flujo real
 * lo verifica el test moviendo por la UI.
 */

export const SMOKE_TAG = 'SMOKE-SETTER'
export const prisma = new PrismaClient()

// Nombres de los hard-checks DERIVADOS de la lista viva, no copiados: seedear un
// self-check "aprobado" requiere TODOS los vigentes en ok, y `selfCheckAprobado`
// valida contra `HARD_CHECKS` (no contra lo que el blob diga tener). El espejo
// hardcodeado que había acá quedaba stale apenas la lista cambiaba — pasó en P7,
// que sumó tres puntos.
const HARD_CHECK_NOMBRES: readonly string[] = HARD_CHECKS.map((check) => check.nombre)

// ── Factories de JSON válido por contrato (src/lib/leados/contracts.ts) ───────

export function fichaConSenal(): Prisma.InputJsonValue {
  return {
    identidad: { igManejadoPor: 'DUENO', notas: 'Dueño visible en historias' },
    presenciaDigital: 'IG activo (~1.2k), web vieja sin mobile',
    resenas: '4.6 en Google Maps, 38 reseñas',
    contenidoReal: 'Logo propio + fotos reales del local',
  }
}

export function evaluacionJson(score: number, veredicto: 'AVANZAR' | 'CALIENTE' | 'DESCARTAR'): Prisma.InputJsonValue {
  return {
    score,
    veredicto,
    razonamiento: 'Negocio con presencia digital y reseñas reales — buen fit para una demo.',
    fecha: new Date().toISOString(),
    ...(veredicto === 'DESCARTAR' ? { motivoDescarte: 'Sin presencia ni materia prima suficiente' } : {}),
  }
}

export function briefJson(): Prisma.InputJsonValue {
  return {
    titulo: 'Landing demo — negocio local',
    concepto: 'One-page mobile-first con CTA de WhatsApp',
    secciones: ['Hero', 'Servicios', 'Reseñas', 'Contacto'],
    pegadoGem: 'Respuesta cruda del Gem de diseño (seed).',
  }
}

export function selfCheckAprobadoJson(): Prisma.InputJsonValue {
  return {
    itemsDuros: HARD_CHECK_NOMBRES.map((nombre) => ({ nombre, ok: true })),
    softFlags: [],
  }
}

/**
 * Self-check PARCIAL (M0/G): los `nombresOk` en verde, el resto de la lista VIVA
 * en falso. Derivado de `HARD_CHECKS` igual que el aprobado — con la lista
 * hardcodeada, un check nuevo entraría como "ausente" en vez de "sin tildar" y
 * el formulario lo re-encontraría vacío por otro motivo que el sembrado.
 * `softFlags` aparte: son los delatores del Ojo de diseño, no bloquean el gate.
 */
export function selfCheckParcialJson(
  nombresOk: readonly string[],
  softFlags: readonly string[] = [],
): Prisma.InputJsonValue {
  return {
    itemsDuros: HARD_CHECK_NOMBRES.map((nombre) => ({
      nombre,
      ok: nombresOk.includes(nombre),
    })),
    softFlags: [...softFlags],
  }
}

export function agendaAgendadaJson(): Prisma.InputJsonValue {
  return {
    estado: 'AGENDADA',
    calBookingUid: 'cal_smoke_uid_123',
    notasTraspaso: 'Reunión coordinada — traspaso al cierre.',
    agendadaAt: new Date().toISOString(),
  }
}

function rechazoJson(): Prisma.InputJsonValue {
  return [
    {
      fecha: new Date().toISOString(),
      motivo: 'Faltan datos reales del negocio',
      donde: 'Hero',
      arreglo: 'Reemplazar placeholders por nombre/fotos reales',
    },
  ]
}

/**
 * Historial de rechazos de N vueltas (M0): el re-loop muestra la corrección
 * NUEVA al frente y colapsa las anteriores (5.2) — con una sola entrada esa
 * variación no se ve. Cada entrada es más vieja que la siguiente, así el orden
 * del blob es el cronológico real que produciría el motor al appendear.
 */
export function rechazosJsonDeNVueltas(n: number): Prisma.InputJsonValue {
  const DIA_MS = 24 * 60 * 60 * 1000
  return Array.from({ length: n }, (_, i) => ({
    fecha: new Date(Date.now() - (n - i) * DIA_MS).toISOString(),
    motivo:
      i === n - 1
        ? 'El hero sigue sin los datos reales del negocio'
        : `Vuelta ${i + 1}: faltan fotos propias y el CTA no se ve en mobile`,
    donde: i === n - 1 ? 'Hero' : 'Contacto',
    arreglo:
      i === n - 1
        ? 'Poner nombre, dirección y fotos reales en el hero'
        : 'Reemplazar el stock por fotos del local y agrandar el botón de WhatsApp',
  }))
}

/** Checklist de Construcción con las fases indicadas ya tildadas (auto-reporte). */
export function progresoJsonCon(completadas: readonly string[]): Prisma.InputJsonValue {
  return { completadas: [...completadas] }
}

// ── Tracker para teardown por id exacto ──────────────────────────────────────

export type SmokeTracker = {
  leadIds: string[]
  userIds: string[]
}

export function newTracker(): SmokeTracker {
  return { leadIds: [], userIds: [] }
}

/** El setter persona-QA (setter-qa@develop.test). Falla claro si no está seedeado. */
export async function getSetterQa(): Promise<{ id: string; email: string }> {
  const user = await prisma.user.findUnique({
    where: { email: 'setter-qa@develop.test' },
    select: { id: true, email: true },
  })
  if (!user) {
    throw new Error(
      "Persona QA 'setter-qa@develop.test' no existe en la DB. Corré el seed del setter antes del smoke.",
    )
  }
  return user
}

/** Crea un 2º setter namespaced (aislamiento A↔B). Se borra en teardown. */
export async function createSetter(tracker: SmokeTracker, label: string): Promise<{ id: string; email: string; name: string | null }> {
  const stamp = Date.now()
  const email = `smoke-setter-${label}-${stamp}@develop.test`
  const name = `${SMOKE_TAG} ${label}`
  const user = await prisma.user.create({
    data: { email, name, role: 'SETTER' },
    select: { id: true, email: true, name: true },
  })
  tracker.userIds.push(user.id)
  return user
}

export type SeedLeadOpts = {
  setterId: string
  businessName?: string
  industry?: string
  zone?: string
  status?: LeadStatus
  stage?: DossierStage
  /** score para evaluacionJson (default 3 = AVANZAR no caliente). */
  score?: number
  veredicto?: 'AVANZAR' | 'CALIENTE' | 'DESCARTAR'
  /** sembrar pin/snooze/nota privada del setter. */
  meta?: { pinned?: boolean; snoozedUntil?: Date; note?: string }
  /** sembrar finalUrl (para APROBADA → envío). */
  finalUrl?: string
  /** marcar demo ya enviada (enviadaAt). */
  enviada?: boolean
  // ── Extensiones M0 (galería de estados) ────────────────────────────────────
  /**
   * Nombre EXACTO, sin el sufijo de timestamp. Lo usa la galería para que el
   * lead de cada estado sea reconciliable entre corridas (sembrado idempotente).
   */
  exactName?: string
  /** Fases de Construcción ya tildadas en el checklist (`progresoJson`). */
  progresoCompletadas?: readonly string[]
  /** Vueltas de rechazo a sembrar en RECHAZADA (default 1). */
  rechazosCount?: number
  /** APROBADA sin la URL final del admin → el gate del envío queda cerrado. */
  sinFinalUrl?: boolean
  /** Forzar draftUrl (o quitarlo con `null` en stages que lo traen por default). */
  draftUrl?: string | null
  /** Fecha del próximo toque (pasada = vencido; null = sin toque agendado). */
  nextFollowUpAt?: Date | null
  /**
   * P19 — Fecha de reactivación de un POSTERGADO (`lead.reactivateAt`). Pasada =
   * la pausa ya venció y el lead vuelve a ser trabajo; futura = sigue pausado.
   * Es el dato que separa las dos postergaciones que el `status` solo no separa.
   */
  reactivateAt?: Date | null
  /**
   * Tildes del chequeo final ya guardados, por NOMBRE de hard-check. Pisa el
   * self-check que el stage traiga por default. `[]` = grilla en cero pero con
   * blob presente (distinto de `undefined` = sin `selfCheckJson`).
   */
  selfCheckDurosOk?: readonly string[]
  /** Delatores del Ojo de diseño marcados (viajan en `softFlags`). */
  selfCheckSoftFlags?: readonly string[]
}

/** Construye el `dossier.create` acumulando el JSON necesario hasta el stage pedido. */
function dossierCreateFor(opts: SeedLeadOpts): Prisma.OsLeadDossierCreateWithoutLeadInput {
  const stage = opts.stage ?? 'FICHA'
  const score = opts.score ?? 3
  const veredicto = opts.veredicto ?? (score >= 4 ? 'CALIENTE' : 'AVANZAR')
  const base: Prisma.OsLeadDossierCreateWithoutLeadInput = { stage }

  // FICHA siempre con señal salvo que se quiera vacía (para test del gate de señal
  // se usa createLead con stage FICHA y se sobre-escribe por la UI).
  if (stage !== 'FICHA') base.fichaJson = fichaConSenal()
  if (['EVALUADA', 'BRIEF', 'CONSTRUCCION', 'EN_REVISION', 'APROBADA', 'RECHAZADA', 'DESCARTADA'].includes(stage)) {
    base.evaluacionJson = evaluacionJson(score, veredicto)
  }
  if (['BRIEF', 'CONSTRUCCION', 'EN_REVISION', 'APROBADA', 'RECHAZADA'].includes(stage)) {
    base.briefJson = briefJson()
  }
  if (['EN_REVISION', 'APROBADA'].includes(stage)) {
    base.selfCheckJson = selfCheckAprobadoJson()
    base.draftUrl = 'https://smoke-draft.netlify.app'
  }
  if (stage === 'APROBADA') {
    base.aprobadaAt = new Date()
    base.finalUrl = opts.finalUrl ?? 'https://smoke-final.example.com'
    if (opts.enviada) base.enviadaAt = new Date()
  }
  if (stage === 'RECHAZADA') {
    base.selfCheckJson = selfCheckAprobadoJson()
    base.draftUrl = 'https://smoke-draft.netlify.app'
    base.rechazos = opts.rechazosCount
      ? rechazosJsonDeNVueltas(opts.rechazosCount)
      : rechazoJson()
  }
  if (stage === 'DESCARTADA') {
    base.evaluacionJson = evaluacionJson(2, 'DESCARTAR')
  }
  // ── Extensiones M0 ──────────────────────────────────────────────────────────
  if (opts.progresoCompletadas) {
    base.progresoJson = progresoJsonCon(opts.progresoCompletadas)
  }
  if (opts.sinFinalUrl) base.finalUrl = null
  if (opts.draftUrl !== undefined) base.draftUrl = opts.draftUrl
  // Último a propósito: pisa el self-check aprobado que traen EN_REVISION /
  // APROBADA / RECHAZADA cuando el estado sembrado quiere una grilla a medias.
  if (opts.selfCheckDurosOk !== undefined) {
    base.selfCheckJson = selfCheckParcialJson(opts.selfCheckDurosOk, opts.selfCheckSoftFlags)
  }
  return base
}

/** Crea un OsLead namespaced + su dossier en el stage pedido, asignado al setter. */
export async function createLead(tracker: SmokeTracker, opts: SeedLeadOpts): Promise<{ id: string; businessName: string }> {
  const stamp = Date.now() + Math.floor(Math.random() * 1000)
  const businessName =
    opts.exactName ?? `${SMOKE_TAG} ${opts.businessName ?? 'Negocio'} ${stamp}`
  const lead = await prisma.osLead.create({
    data: {
      businessName,
      ...(opts.nextFollowUpAt !== undefined ? { nextFollowUpAt: opts.nextFollowUpAt } : {}),
      ...(opts.reactivateAt !== undefined ? { reactivateAt: opts.reactivateAt } : {}),
      industry: opts.industry ?? 'gastronomia',
      zone: opts.zone ?? 'Centro',
      status: opts.status ?? 'PROSPECTO',
      instagramUrl: 'https://instagram.com/smoke_negocio',
      phone: '5493815550000',
      assignedToId: opts.setterId,
      dossier: { create: dossierCreateFor(opts) },
      ...(opts.meta
        ? {
            setterMetas: {
              create: {
                setterId: opts.setterId,
                pinned: opts.meta.pinned ?? false,
                snoozedUntil: opts.meta.snoozedUntil ?? null,
                note: opts.meta.note ?? null,
              },
            },
          }
        : {}),
    },
    select: { id: true, businessName: true },
  })
  tracker.leadIds.push(lead.id)
  return lead
}

/** Registra una actividad comercial (o SISTEMA) sobre un lead. */
export async function registerActivity(
  leadId: string,
  channel: 'INSTAGRAM_DM' | 'WHATSAPP' | 'EMAIL' | 'LLAMADA' | 'LOOM_VIDEO' | 'OTRO' | 'SISTEMA',
  result: 'SIN_RESPUESTA' | 'RESPONDIO' | 'CALL_AGENDADA' | 'RECHAZADO' | 'POSTERGADO' | null,
  performedById: string | null,
  notes?: string,
): Promise<void> {
  await prisma.osLeadActivity.create({
    data: { leadId, channel, result, performedById, notes: notes ?? null },
  })
}

/** Simula que el negocio respondió el primer contacto (abre el gate del brief). */
export async function simulateLeadResponded(leadId: string): Promise<void> {
  await prisma.osLead.update({ where: { id: leadId }, data: { status: 'RESPONDIO' } })
}

/** Reasigna un lead a otro setter (simula la acción del admin a nivel datos). */
export async function reassignLead(leadId: string, toSetterId: string): Promise<void> {
  await prisma.osLead.update({ where: { id: leadId }, data: { assignedToId: toSetterId } })
}

export async function getDossier(leadId: string) {
  return prisma.osLeadDossier.findUnique({ where: { leadId } })
}

export async function getLead(leadId: string) {
  return prisma.osLead.findUnique({ where: { id: leadId } })
}

export async function countNoticesFor(setterId: string, kind?: string): Promise<number> {
  return prisma.osSetterNotice.count({
    where: { setterId, ...(kind ? { kind: kind as never } : {}) },
  })
}

/** Crea una novedad dirigida (OsSetterNotice). Se limpia en teardown por leadId/setterId trackeado. */
export async function createNotice(opts: {
  setterId: string
  leadId: string | null
  kind: 'LEAD_ASIGNADO' | 'DEMO_APROBADA' | 'DEMO_RECHAZADA' | 'LEAD_REASIGNADO_SALIENTE'
  title: string
  body: string
  read?: boolean
}): Promise<string> {
  const notice = await prisma.osSetterNotice.create({
    data: {
      setterId: opts.setterId,
      leadId: opts.leadId,
      kind: opts.kind,
      title: opts.title,
      body: opts.body,
      read: opts.read ?? false,
    },
    select: { id: true },
  })
  return notice.id
}

/** Teardown por id EXACTO. Orden: notices (SetNull no las borra en cascade) → leads → users creados. */
export async function teardown(tracker: SmokeTracker): Promise<void> {
  if (tracker.leadIds.length > 0) {
    await prisma.osSetterNotice.deleteMany({ where: { leadId: { in: tracker.leadIds } } })
  }
  if (tracker.userIds.length > 0) {
    await prisma.osSetterNotice.deleteMany({ where: { setterId: { in: tracker.userIds } } })
  }
  if (tracker.leadIds.length > 0) {
    // Cascade: dossier, activities, setterMetas, demos mueren con el lead.
    await prisma.osLead.deleteMany({ where: { id: { in: tracker.leadIds } } })
  }
  if (tracker.userIds.length > 0) {
    await prisma.user.deleteMany({ where: { id: { in: tracker.userIds } } })
  }
}

export async function disconnect(): Promise<void> {
  await prisma.$disconnect()
}
