import { PrismaClient, type Prisma, type DossierStage, type LeadStatus } from '@prisma/client'
import dotenv from 'dotenv'

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

// Nombres EXACTOS de los hard-checks (espejo de src/lib/leados/flow-content.ts
// HARD_CHECKS[].nombre). Seedear un self-check "aprobado" requiere los 6 en ok.
const HARD_CHECK_NOMBRES = [
  'La demo carga',
  'Se ve bien en tu celular',
  'No hay lorem ipsum ni textos de relleno',
  'Los links y el botón de WhatsApp funcionan',
  'Usa los datos y assets reales del negocio',
  'La demo dice lo que el brief pedía',
] as const

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
    base.rechazos = rechazoJson()
  }
  if (stage === 'DESCARTADA') {
    base.evaluacionJson = evaluacionJson(2, 'DESCARTAR')
  }
  return base
}

/** Crea un OsLead namespaced + su dossier en el stage pedido, asignado al setter. */
export async function createLead(tracker: SmokeTracker, opts: SeedLeadOpts): Promise<{ id: string; businessName: string }> {
  const stamp = Date.now() + Math.floor(Math.random() * 1000)
  const businessName = `${SMOKE_TAG} ${opts.businessName ?? 'Negocio'} ${stamp}`
  const lead = await prisma.osLead.create({
    data: {
      businessName,
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
