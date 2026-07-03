/**
 * LeadOS B2 — Dossier de producción: acceso por ownership + máquina de stage.
 *
 * REGLA DE ORO (espejo de ownership.ts), sin excepción:
 *   1. Todo cambio de `OsLeadDossier.stage` pasa por `transitionDossier()`.
 *      Setear `stage` directo con Prisma fuera de esta lib está PROHIBIDO:
 *      acá viven las transiciones legales y el gate comercial; un update
 *      suelto las saltea.
 *   2. Desde código de setter el dossier NUNCA se busca por su propio id:
 *      siempre se llega vía el lead propio (`getOwnedDossier` /
 *      `ensureOwnedDossier`, que derivan de `getOwnedLead`).
 *
 * Esta máquina (PRODUCCIÓN del activo demo) convive con la máquina COMERCIAL
 * del lead (`LeadStatus` + cron de follow-up) y no la pisa: de `OsLead` solo
 * se LEEN `status` y `caliente` para el gate de BRIEF — jamás se escriben.
 */
import type { DossierStage, OsLeadDossier, Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { getOwnedLead } from '@/lib/leados/ownership'
import {
  BriefSchema,
  EvaluacionSchema,
  FichaSchema,
  ProgresoSchema,
  RechazosSchema,
  SelfCheckSchema,
  type Brief,
  type Evaluacion,
  type Ficha,
  type Progreso,
  type Rechazo,
  type SelfCheck,
} from '@/lib/leados/contracts'
import { gateBriefAbierto } from '@/lib/leados/flow'
import {
  buildEscaladoPatch,
  esReloopRechazo,
  ESCALADO_RESET,
  RELOOP_RESET,
} from '@/lib/leados/escalamiento'

/**
 * Transiciones legales de la máquina de producción. Ninguna otra existe.
 *
 *   FICHA → EVALUADA → BRIEF → CONSTRUCCION → EN_REVISION → APROBADA
 *              │                     ▲              │
 *              ▼                     └── RECHAZADA ◄┘
 *          DESCARTADA
 */
const LEGAL_TRANSITIONS: Record<DossierStage, readonly DossierStage[]> = {
  FICHA: ['EVALUADA'],
  EVALUADA: ['DESCARTADA', 'BRIEF'],
  BRIEF: ['CONSTRUCCION'],
  CONSTRUCCION: ['EN_REVISION'],
  EN_REVISION: ['APROBADA', 'RECHAZADA'],
  RECHAZADA: ['CONSTRUCCION'],
  APROBADA: [],
  DESCARTADA: [],
}

// RESPONDED_STATUSES vive en flow.ts (B3): es regla pura compartida con la UI
// del setter — acá solo se consume para el gate EVALUADA→BRIEF.

export class DossierTransitionError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'DossierTransitionError'
  }
}

export type DossierTransitionInput =
  | { to: 'EVALUADA'; evaluacion: Evaluacion }
  | { to: 'BRIEF' }
  | { to: 'CONSTRUCCION' }
  | { to: 'EN_REVISION' }
  // B5: finalUrl opcional acá para no romper tooling pre-B5 (b2-verify);
  // la action admin de revisión la exige SIEMPRE por zod antes de llegar.
  | { to: 'APROBADA'; finalUrl?: string }
  | { to: 'RECHAZADA'; motivo: string; detalle?: string; donde?: string; arreglo?: string }
  | { to: 'DESCARTADA'; motivoDescarte: string }

/**
 * Dossier del lead, solo si el lead es del setter. `null` si el lead no
 * existe, no es suyo, o todavía no tiene dossier (404-style, sin leakear
 * existencia — mismo criterio que `getOwnedLead`).
 */
export async function getOwnedDossier(
  leadId: string,
  userId: string,
): Promise<OsLeadDossier | null> {
  const lead = await getOwnedLead(leadId, userId)
  if (!lead) return null
  return prisma.osLeadDossier.findUnique({ where: { leadId: lead.id } })
}

/**
 * Creación idempotente del dossier 1:1: si ya existe para el lead, devuelve
 * el existente (el unique en `leadId` lo garantiza a nivel DB). `null` si el
 * lead no es del setter — nunca crea un dossier sobre un lead ajeno.
 */
export async function ensureOwnedDossier(
  leadId: string,
  userId: string,
): Promise<OsLeadDossier | null> {
  const lead = await getOwnedLead(leadId, userId)
  if (!lead) return null
  return prisma.osLeadDossier.upsert({
    where: { leadId: lead.id },
    update: {},
    create: { leadId: lead.id },
  })
}

/**
 * LA única puerta del stage. Valida la transición contra LEGAL_TRANSITIONS y
 * aplica las reglas que el caller no puede saltear:
 *
 *   - EVALUADA exige la evaluación (parseada con su contrato) — queda estampada
 *     para el veredicto del admin y el gate de DESCARTADA (el gate de BRIEF ya
 *     no la lee).
 *   - BRIEF aplica el gate del flujo invertido con `gateBriefAbierto` (LA MISMA
 *     regla pura que la UI y el flag del action — única copia, sin drift): solo
 *     si el lead respondió el primer contacto (RESPONDIO o posterior) O está
 *     marcado caliente (campo `OsLead.caliente` de Franco — D4). Lee el lead acá
 *     adentro; no confía en el caller.
 *   - DESCARTADA exige motivoDescarte (queda en `evaluacionJson`).
 *   - RECHAZADA exige motivo y lo appendea al historial `rechazos`.
 *
 * QUIÉN puede transicionar no se resuelve acá: el caller setter llega vía
 * `getOwnedDossier`/`ensureOwnedDossier` (ownership), el admin vía
 * `requireSuperAdmin()`. Lanza `DossierTransitionError` ante cualquier regla
 * violada.
 */
export async function transitionDossier(
  leadId: string,
  input: DossierTransitionInput,
): Promise<OsLeadDossier> {
  const dossier = await prisma.osLeadDossier.findUnique({
    where: { leadId },
    include: { lead: { select: { status: true, caliente: true } } },
  })
  if (!dossier) {
    throw new DossierTransitionError('No existe dossier para ese lead')
  }

  const from = dossier.stage
  if (!LEGAL_TRANSITIONS[from].includes(input.to)) {
    throw new DossierTransitionError(`Transición ilegal: ${from} → ${input.to}`)
  }

  // El escalamiento "me trabé" es de la CONSTRUCCION vigente: cualquier cambio
  // de stage lo resuelve/invalida (ESCALADO_RESET — aditivo, no altera ninguna
  // transición legal). Así no sobrevive a un re-loop RECHAZADA→CONSTRUCCION.
  //
  // B6.2: SOLO en el re-loop RECHAZADA→CONSTRUCCION se agrega RELOOP_RESET, que
  // limpia el self-check (GATE) → `selfCheckAprobado` vuelve a false y el setter
  // RE-verifica antes de reenviar. NO se aplica en las demás transiciones: en
  // CONSTRUCCION→EN_REVISION el self-check DEBE sobrevivir para la superficie de
  // revisión del admin. PRESERVA `progresoJson` (fases) y `draftUrl` (la demo) —
  // RELOOP_RESET solo toca `selfCheckJson`.
  const data: Prisma.OsLeadDossierUpdateManyMutationInput = {
    stage: input.to,
    ...ESCALADO_RESET,
    ...(esReloopRechazo(from, input.to) ? RELOOP_RESET : {}),
  }

  switch (input.to) {
    case 'EVALUADA': {
      const evaluacion = EvaluacionSchema.parse(input.evaluacion)
      // B5: estampa de fecha de la evaluación (ventana 30d de la métrica
      // descarte/avance del admin). Si el caller ya la trae, se respeta.
      data.evaluacionJson = {
        ...evaluacion,
        fecha: evaluacion.fecha ?? new Date().toISOString(),
      } as Prisma.InputJsonValue
      break
    }
    case 'BRIEF': {
      // D4/admin-1d: el gate del flujo invertido sale del CAMPO `caliente` (de
      // Franco), no del score del setter. Reusa `gateBriefAbierto` — LA MISMA
      // función pura que la UI (lead-wizard, evaluacion-step) y el flag del
      // action: una sola copia de la regla, server y UI no pueden divergir.
      // El stage acá es EVALUADA (LEGAL_TRANSITIONS), nunca DESCARTADA → el
      // guardrail DESCARTADA de esCaliente no aplica.
      if (!gateBriefAbierto(dossier.lead.status, dossier.lead.caliente)) {
        throw new DossierTransitionError(
          'Gate EVALUADA→BRIEF: el lead no respondió el primer contacto y no está marcado caliente',
        )
      }
      break
    }
    case 'DESCARTADA': {
      const motivo = input.motivoDescarte.trim()
      if (!motivo) {
        throw new DossierTransitionError('EVALUADA→DESCARTADA requiere motivoDescarte')
      }
      const evaluacion = EvaluacionSchema.safeParse(dossier.evaluacionJson)
      if (!evaluacion.success) {
        throw new DossierTransitionError(
          'EVALUADA→DESCARTADA: evaluacionJson ausente o inválido — no debería pasar, EVALUADA lo exige',
        )
      }
      data.evaluacionJson = {
        ...evaluacion.data,
        motivoDescarte: motivo,
      } as Prisma.InputJsonValue
      break
    }
    case 'APROBADA': {
      // B5: la aprobación registra la URL permanente que el admin publicó a
      // mano (el panel NO publica nada) y la fecha. No crea OsDemo ni toca
      // LeadStatus — el envío es territorio de B6.
      data.aprobadaAt = new Date()
      const finalUrl = input.finalUrl?.trim()
      if (finalUrl) {
        data.finalUrl = finalUrl
      }
      break
    }
    case 'RECHAZADA': {
      const motivo = input.motivo.trim()
      if (!motivo) {
        throw new DossierTransitionError('EN_REVISION→RECHAZADA requiere motivo')
      }
      const historial =
        dossier.rechazos === null ? [] : RechazosSchema.parse(dossier.rechazos)
      const detalle = input.detalle?.trim()
      const donde = input.donde?.trim()
      const arreglo = input.arreglo?.trim()
      const rechazo: Rechazo = {
        fecha: new Date().toISOString(),
        motivo,
        ...(detalle ? { detalle } : {}),
        ...(donde ? { donde } : {}),
        ...(arreglo ? { arreglo } : {}),
      }
      data.rechazos = [...historial, rechazo] as Prisma.InputJsonValue
      break
    }
    default:
      break
  }

  // Guard optimista: si otro proceso movió el stage entre la lectura y acá,
  // el where no matchea y no se pisa nada.
  const updated = await prisma.osLeadDossier.updateMany({
    where: { leadId, stage: from },
    data,
  })
  if (updated.count === 0) {
    throw new DossierTransitionError(
      'El dossier cambió de stage durante la transición — reintentar',
    )
  }

  const fresh = await prisma.osLeadDossier.findUnique({ where: { leadId } })
  if (!fresh) {
    throw new DossierTransitionError('El dossier desapareció durante la transición')
  }
  return fresh
}

// ── B3 — Writes de blobs Json con ownership (NUNCA tocan `stage`) ────────────

/**
 * Guardado (parcial o final) de la ficha de observación. Crea el dossier si
 * no existe (idempotente vía `ensureOwnedDossier`). Solo se edita mientras el
 * stage es FICHA: después de la evaluación la ficha queda congelada — es el
 * insumo que el Evaluador ya leyó. `null` si el lead no es del setter.
 */
export async function saveOwnedFicha(
  leadId: string,
  userId: string,
  ficha: Ficha,
): Promise<OsLeadDossier | null> {
  const dossier = await ensureOwnedDossier(leadId, userId)
  if (!dossier) return null
  if (dossier.stage !== 'FICHA') {
    throw new DossierTransitionError('La ficha solo se edita antes de registrar la evaluación')
  }
  const parsed = FichaSchema.parse(ficha)
  // Guard optimista análogo al de transitionDossier: si el stage se movió
  // entre la lectura y acá, no se pisa nada.
  const updated = await prisma.osLeadDossier.updateMany({
    where: { leadId: dossier.leadId, stage: 'FICHA' },
    data: { fichaJson: parsed as Prisma.InputJsonValue },
  })
  if (updated.count === 0) {
    throw new DossierTransitionError('El dossier cambió de stage durante el guardado — recargá')
  }
  return prisma.osLeadDossier.findUnique({ where: { leadId: dossier.leadId } })
}

/**
 * B4 — Guardado de la URL del draft publicado (Netlify Drop). Solo durante
 * CONSTRUCCION: antes no hay nada que publicar, y en EN_REVISION el dossier
 * queda congelado para el admin. `null` si el lead no es del setter.
 */
export async function saveOwnedDraftUrl(
  leadId: string,
  userId: string,
  draftUrl: string,
): Promise<OsLeadDossier | null> {
  const dossier = await getOwnedDossier(leadId, userId)
  if (!dossier) return null
  if (dossier.stage !== 'CONSTRUCCION') {
    throw new DossierTransitionError('El draft se publica durante la construcción — arrancala primero')
  }
  const updated = await prisma.osLeadDossier.updateMany({
    where: { leadId: dossier.leadId, stage: 'CONSTRUCCION' },
    data: { draftUrl: draftUrl.trim() },
  })
  if (updated.count === 0) {
    throw new DossierTransitionError('El dossier cambió de stage durante el guardado — recargá')
  }
  return prisma.osLeadDossier.findUnique({ where: { leadId: dossier.leadId } })
}

/**
 * B-beta — Persiste el escalamiento "me trabé" en el dossier. Aditivo y
 * stage-guarded: solo durante CONSTRUCCION (única etapa donde el setter escala)
 * y NUNCA toca `stage` (no es una transición — el patch viene de
 * `buildEscaladoPatch`, que no incluye `stage`). Mirror de `saveOwnedDraftUrl`:
 * ownership arriba + guard optimista. Persistir acá hace que Franco lo vea en el
 * panel aunque el Telegram falle. `null` si el lead no es del setter.
 */
export async function marcarEscaladoOwned(
  leadId: string,
  userId: string,
  descripcion: string,
): Promise<OsLeadDossier | null> {
  const dossier = await getOwnedDossier(leadId, userId)
  if (!dossier) return null
  if (dossier.stage !== 'CONSTRUCCION') {
    throw new DossierTransitionError('El escalamiento es de la construcción en curso')
  }
  const updated = await prisma.osLeadDossier.updateMany({
    where: { leadId: dossier.leadId, stage: 'CONSTRUCCION' },
    data: buildEscaladoPatch(descripcion, new Date()),
  })
  if (updated.count === 0) {
    throw new DossierTransitionError('El dossier cambió de stage durante el escalamiento — recargá')
  }
  return prisma.osLeadDossier.findUnique({ where: { leadId: dossier.leadId } })
}

/**
 * B4 — Guardado del self-check (parcial o completo: el gate de envío lo
 * valida la action con `selfCheckAprobado`, no este write). Solo durante
 * CONSTRUCCION. `null` si el lead no es del setter.
 */
export async function saveOwnedSelfCheck(
  leadId: string,
  userId: string,
  selfCheck: SelfCheck,
): Promise<OsLeadDossier | null> {
  const dossier = await getOwnedDossier(leadId, userId)
  if (!dossier) return null
  if (dossier.stage !== 'CONSTRUCCION') {
    throw new DossierTransitionError('El self-check se completa durante la construcción')
  }
  const parsed = SelfCheckSchema.parse(selfCheck)
  const updated = await prisma.osLeadDossier.updateMany({
    where: { leadId: dossier.leadId, stage: 'CONSTRUCCION' },
    data: { selfCheckJson: parsed as Prisma.InputJsonValue },
  })
  if (updated.count === 0) {
    throw new DossierTransitionError('El dossier cambió de stage durante el guardado — recargá')
  }
  return prisma.osLeadDossier.findUnique({ where: { leadId: dossier.leadId } })
}

/**
 * E.1 — Guardado del progreso del checklist de Construcción. Espejo EXACTO de
 * `saveOwnedSelfCheck`: ownership arriba (`getOwnedDossier`) + guard optimista
 * por stage, y NUNCA toca `stage` (el write es solo `progresoJson`). Solo
 * durante CONSTRUCCION.
 *
 * Es un CHECKLIST auto-reportado, NO un gate: `progresoJson` jamás se cablea a
 * la transición CONSTRUCCION→EN_REVISION — ese gate sigue siendo draftUrl +
 * `selfCheckAprobado`, intacto. El re-loop RECHAZADA→CONSTRUCCION lo PRESERVA
 * (`transitionDossier` no lo resetea). `null` si el lead no es del setter.
 */
export async function saveOwnedProgreso(
  leadId: string,
  userId: string,
  progreso: Progreso,
): Promise<OsLeadDossier | null> {
  const dossier = await getOwnedDossier(leadId, userId)
  if (!dossier) return null
  if (dossier.stage !== 'CONSTRUCCION') {
    throw new DossierTransitionError('El progreso se registra durante la construcción')
  }
  const parsed = ProgresoSchema.parse(progreso)
  const updated = await prisma.osLeadDossier.updateMany({
    where: { leadId: dossier.leadId, stage: 'CONSTRUCCION' },
    data: { progresoJson: parsed as Prisma.InputJsonValue },
  })
  if (updated.count === 0) {
    throw new DossierTransitionError('El dossier cambió de stage durante el guardado — recargá')
  }
  return prisma.osLeadDossier.findUnique({ where: { leadId: dossier.leadId } })
}

/**
 * B6 — Marca atómica de "demo enviada": la llave de idempotencia del envío.
 * Solo en APROBADA y solo si `enviadaAt` está vacío — el updateMany
 * condicional hace de claim: dos clicks simultáneos producen UN solo
 * 'marcada'. El caller dispara la maquinaria createDemo ÚNICAMENTE si obtuvo
 * el claim; si ya estaba enviada, no re-crea OsDemo ni re-dispara nada.
 */
export async function marcarDemoEnviadaOwned(
  leadId: string,
  userId: string,
): Promise<'marcada' | 'ya-enviada' | null> {
  const dossier = await getOwnedDossier(leadId, userId)
  if (!dossier) return null
  if (dossier.stage !== 'APROBADA') {
    throw new DossierTransitionError('La demo se envía cuando Franco la aprobó')
  }
  if (dossier.enviadaAt) return 'ya-enviada'
  const updated = await prisma.osLeadDossier.updateMany({
    where: { leadId: dossier.leadId, stage: 'APROBADA', enviadaAt: null },
    data: { enviadaAt: new Date() },
  })
  return updated.count === 0 ? 'ya-enviada' : 'marcada'
}

/**
 * B6 — Compensación EXCLUSIVA del envío fallido: si el claim de
 * `marcarDemoEnviadaOwned` se obtuvo pero crear el OsDemo falló, libera la
 * marca para que el setter pueda reintentar. No usar para nada más.
 */
export async function revertirDemoEnviadaOwned(
  leadId: string,
  userId: string,
): Promise<void> {
  const dossier = await getOwnedDossier(leadId, userId)
  if (!dossier) return
  await prisma.osLeadDossier.updateMany({
    where: { leadId: dossier.leadId, stage: 'APROBADA' },
    data: { enviadaAt: null },
  })
}

/**
 * Guardado del brief de diseño. Se permite en EVALUADA (captura inicial; el
 * caller transiciona a BRIEF después vía `transitionDossier`, que valida el
 * gate) y en BRIEF (re-pegado tras el sanity-check visual). `null` si el lead
 * no es del setter.
 */
export async function saveOwnedBrief(
  leadId: string,
  userId: string,
  brief: Brief,
): Promise<OsLeadDossier | null> {
  const dossier = await getOwnedDossier(leadId, userId)
  if (!dossier) return null
  if (dossier.stage !== 'EVALUADA' && dossier.stage !== 'BRIEF') {
    throw new DossierTransitionError('El brief se captura después de la evaluación')
  }
  const parsed = BriefSchema.parse(brief)
  const updated = await prisma.osLeadDossier.updateMany({
    where: { leadId: dossier.leadId, stage: dossier.stage },
    data: { briefJson: parsed as Prisma.InputJsonValue },
  })
  if (updated.count === 0) {
    throw new DossierTransitionError('El dossier cambió de stage durante el guardado — recargá')
  }
  return prisma.osLeadDossier.findUnique({ where: { leadId: dossier.leadId } })
}
