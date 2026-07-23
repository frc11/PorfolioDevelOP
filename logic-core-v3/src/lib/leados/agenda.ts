/**
 * LeadOS B7 — Agenda y traspaso: config Cal.com de la org, oferta de
 * horarios y persistencia del booking en `dossier.agendaJson`.
 *
 * Invariantes (no negociables):
 *   - El claim `AGENDANDO` se toma ANTES de llamar a Cal.com (updateMany
 *     condicional sobre agendaJson vacío u OFRECIDOS — mismo patrón que
 *     `enviadaAt` de B6): dos clicks simultáneos producen UN solo booking.
 *   - 6.1: la oferta de horarios se PERSISTE (`OFRECIDOS`) y sobrevive al
 *     claim: si Cal.com falla, la compensación la restaura en vez de borrarla.
 *   - `AGENDADA` se escribe SOLO con el uid confirmado por Cal.com; si la
 *     API falla, el claim se revierte y el lead no avanza.
 *   - Los writes del setter pasan por ownership (getOwnedDossier); los del
 *     admin (realizada/resultado) son exclusivos de las actions con
 *     requireSuperAdmin — GANADO nunca lo marca el setter.
 *   - Ningún write de agenda toca `stage` (regla de los blobs desde B3).
 */
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { AgendaSchema, type Agenda, type ResultadoReunion } from '@/lib/leados/contracts'
import { getOwnedDossier } from '@/lib/leados/dossier'
import type { SlotsPorDia } from '@/lib/integrations/cal-com-v2'

// ── Config Cal.com de la org (setup B7.0, manual de Franco) ─────────────────

export type CalConfigLeadOS =
  | { ok: true; username: string; eventTypeSlug: string }
  | { ok: false; motivo: string }

const SETUP_B7 =
  'Setup B7.0 pendiente: cargá en la organización develOP el username de Cal.com ' +
  '(calComUsername) y el slug del event type (calComEmbedUrl, vale el slug pelado ' +
  'o la URL https://cal.com/usuario/slug).'

/**
 * Resuelve la agenda de Franco desde Organization (calComUsername +
 * calComEmbedUrl). Esos campos también los usa el módulo agenda-inteligente
 * de los CLIENTES, así que la lectura es estricta: si hay más de una org con
 * username cargado, se reporta la ambigüedad en vez de arriesgar un booking
 * en el calendario equivocado. Nunca explota: devuelve el motivo legible.
 */
export async function getCalConfigLeadOS(): Promise<CalConfigLeadOS> {
  const orgs = await prisma.organization.findMany({
    where: { calComUsername: { not: null } },
    select: { slug: true, calComUsername: true, calComEmbedUrl: true },
  })

  if (orgs.length === 0) {
    return { ok: false, motivo: SETUP_B7 }
  }
  if (orgs.length > 1) {
    return {
      ok: false,
      motivo:
        `Config Cal.com ambigua: ${orgs.length} organizaciones tienen calComUsername ` +
        `(${orgs.map((org) => org.slug).join(', ')}). LeadOS necesita UNA sola — ` +
        'limpiá las que no sean la agenda de Franco.',
    }
  }

  const [org] = orgs
  const username = org.calComUsername?.trim()
  const eventTypeSlug = parseEventTypeSlug(org.calComEmbedUrl)
  if (!username || !eventTypeSlug) {
    return { ok: false, motivo: SETUP_B7 }
  }
  return { ok: true, username, eventTypeSlug }
}

/** Acepta el slug pelado ("reunion-develop") o la URL completa de Cal.com. */
export function parseEventTypeSlug(valor: string | null): string | null {
  const limpio = valor?.trim().replace(/\/+$/, '')
  if (!limpio) return null
  const segmento = limpio.split('/').pop()?.split('?')[0]?.split('#')[0]?.trim()
  return segmento || null
}

// ── Oferta de horarios (reglas puras sobre la respuesta de slots) ───────────

/** Ventana de oferta: desde mañana, ~2 semanas — cubre los próximos hábiles. */
export function rangoOferta(desde: Date = new Date()): { start: string; end: string } {
  const start = new Date(desde.getTime() + 24 * 60 * 60 * 1000)
  const end = new Date(desde.getTime() + 15 * 24 * 60 * 60 * 1000)
  return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) }
}

/**
 * Elige 3 horarios para ofrecer: el primero de cada uno de los primeros 3
 * días con disponibilidad (días distintos = más chance de que uno le quede
 * bien al prospecto). Si hay menos de 3 días, completa con horarios
 * espaciados de los días que haya. Devuelve starts ISO ordenados.
 */
export function elegirTresSlots(slotsPorDia: SlotsPorDia): string[] {
  const dias = Object.keys(slotsPorDia)
    .filter((dia) => slotsPorDia[dia].length > 0)
    .sort()

  const elegidos: string[] = []
  for (const dia of dias) {
    if (elegidos.length >= 3) break
    elegidos.push(slotsPorDia[dia][0].start)
  }

  if (elegidos.length < 3) {
    for (const dia of dias) {
      const slots = slotsPorDia[dia]
      for (const idx of [Math.floor(slots.length / 2), slots.length - 1]) {
        const start = slots[idx]?.start
        if (start && !elegidos.includes(start)) {
          elegidos.push(start)
          if (elegidos.length >= 3) break
        }
      }
      if (elegidos.length >= 3) break
    }
  }

  return elegidos.sort()
}

/**
 * Re-validación al confirmar: el slot elegido sigue libre en la respuesta
 * FRESCA de Cal.com. Compara por instante (epoch), no por string — el
 * formato del offset puede variar.
 */
export function slotSigueLibre(slotsPorDia: SlotsPorDia, slotStart: string): boolean {
  const objetivo = new Date(slotStart).getTime()
  if (Number.isNaN(objetivo)) return false
  return Object.values(slotsPorDia).some((slots) =>
    slots.some((slot) => new Date(slot.start).getTime() === objetivo),
  )
}

// ── Persistencia del booking (claim atómico + write final, con ownership) ───

/**
 * 6.1 — Los DOS estados de partida desde los que la agenda es reclamable:
 * blob vacío (el lead nunca pasó por acá) u oferta de horarios ya hecha. Un
 * AGENDANDO (confirmación en vuelo) o una AGENDADA (reunión confirmada) NO
 * matchean ninguna rama: siguen sin ser reclamables, igual que antes de 6.1.
 *
 * La misma condición gobierna el write de la oferta: quien ofrece horarios
 * pisa una oferta previa, pero jamás un claim en vuelo ni una reunión.
 */
const PARTIDA_RECLAMABLE: Prisma.OsLeadDossierWhereInput[] = [
  { agendaJson: { equals: Prisma.AnyNull } },
  { agendaJson: { path: ['estado'], equals: 'OFRECIDOS' } },
]

/**
 * Claim atómico ANTES de llamar a Cal.com: solo si `agendaJson` está vacío o
 * quedó en OFRECIDOS. El updateMany condicional hace de llave — dos clicks
 * simultáneos producen UN solo 'claim'. Devuelve el estado existente si ya
 * había agenda en vuelo o confirmada.
 *
 * POR QUÉ acepta dos estados de partida (6.1, NO es un descuido): desde que
 * `ofrecerHorarios` persiste la oferta, el punto de partida normal del booking
 * dejó de ser el blob vacío — exigir NULL habría dejado inreclamable a todo
 * lead que ya tenía horarios ofrecidos. La condición se ENSANCHÓ; el mecanismo
 * es el mismo de siempre: UNA sola query decide el ganador. El pre-read de
 * `getOwnedDossier` (que ya existía, para ownership) solo da FORMA al payload
 * —arrastrar la memoria de la oferta dentro del claim— y nunca decide quién
 * gana; si esa lectura quedó vieja, el perdedor igual pierde en el `where`.
 */
export async function marcarAgendandoOwned(
  leadId: string,
  userId: string,
): Promise<'claim' | 'agendando' | 'agendada' | null> {
  const dossier = await getOwnedDossier(leadId, userId)
  if (!dossier) return null

  // La memoria viaja DENTRO del claim: el updateMany reemplaza el blob entero,
  // así que si los horarios no se copian acá, la compensación no tiene qué
  // restaurar y un fallo de Cal.com se come la oferta.
  const existente = AgendaSchema.safeParse(dossier.agendaJson)
  const oferta =
    existente.success && existente.data.estado === 'OFRECIDOS' ? existente.data : null

  const claim: Agenda = {
    estado: 'AGENDANDO',
    claimedAt: new Date().toISOString(),
    ...(oferta?.horariosOfrecidos ? { horariosOfrecidos: oferta.horariosOfrecidos } : {}),
    ...(oferta?.ofrecidosAt ? { ofrecidosAt: oferta.ofrecidosAt } : {}),
  }
  const updated = await prisma.osLeadDossier.updateMany({
    where: { leadId: dossier.leadId, OR: PARTIDA_RECLAMABLE },
    data: { agendaJson: claim as Prisma.InputJsonValue },
  })
  if (updated.count === 1) return 'claim'

  if (existente.success && existente.data.estado === 'AGENDADA') return 'agendada'
  return 'agendando'
}

/**
 * Compensación EXCLUSIVA del booking fallido: libera el claim AGENDANDO para
 * reintentar. Filtra por estado vía path Json — jamás pisa una AGENDADA.
 *
 * 6.1 — RESTAURA el estado previo al claim en vez de vaciar: si el claim traía
 * la memoria de una oferta (horarios que el prospecto ya tiene en la mano), el
 * blob vuelve a OFRECIDOS con esos horarios; si el claim nació de un blob
 * vacío, sigue compensando a NULL. Nunca resucita una AGENDADA vieja: el
 * payload restaurado sale del propio claim y el `where` sigue exigiendo
 * AGENDANDO.
 */
export async function revertirAgendandoOwned(leadId: string, userId: string): Promise<void> {
  const dossier = await getOwnedDossier(leadId, userId)
  if (!dossier) return

  const claim = AgendaSchema.safeParse(dossier.agendaJson)
  const memoria =
    claim.success && claim.data.estado === 'AGENDANDO' && claim.data.horariosOfrecidos?.length
      ? claim.data
      : null
  const restaurada: Agenda | null = memoria
    ? {
        estado: 'OFRECIDOS',
        horariosOfrecidos: memoria.horariosOfrecidos,
        ...(memoria.ofrecidosAt ? { ofrecidosAt: memoria.ofrecidosAt } : {}),
      }
    : null

  await prisma.osLeadDossier.updateMany({
    where: { leadId: dossier.leadId, agendaJson: { path: ['estado'], equals: 'AGENDANDO' } },
    data: { agendaJson: restaurada ? (restaurada as Prisma.InputJsonValue) : Prisma.DbNull },
  })
}

/**
 * 6.1 — Persiste la oferta de horarios que el setter le pasó al prospecto: la
 * memoria del booking. Sin esto, si el prospecto tarda y el setter cierra la
 * pestaña, los horarios ofrecidos se pierden y hay que pedirlos de nuevo (con
 * el riesgo de ofrecer otros distintos a los que ya circulan por el chat).
 *
 * Re-ofrecer REEMPLAZA la oferta anterior (last-write-wins, deliberado: lo que
 * vale es lo último que el prospecto tiene en la mano). Devuelve false cuando
 * no había nada que pisar legítimamente —lead ajeno, o una confirmación en
 * vuelo/ya cerrada— sin tocar el blob: la oferta se le muestra igual al setter,
 * lo que no se hace es pisar un claim ajeno al camino.
 */
export async function guardarHorariosOfrecidosOwned(
  leadId: string,
  userId: string,
  horarios: string[],
): Promise<boolean> {
  const dossier = await getOwnedDossier(leadId, userId)
  if (!dossier) return false

  const oferta: Agenda = {
    estado: 'OFRECIDOS',
    horariosOfrecidos: horarios,
    ofrecidosAt: new Date().toISOString(),
  }
  const parsed = AgendaSchema.parse(oferta)
  const updated = await prisma.osLeadDossier.updateMany({
    where: { leadId: dossier.leadId, OR: PARTIDA_RECLAMABLE },
    data: { agendaJson: parsed as Prisma.InputJsonValue },
  })
  return updated.count === 1
}

/**
 * B8A/H1 — Compensación del registro local fallido DESPUÉS del booking: borra
 * la agenda recién escrita por ESTE flujo cuando ya quedó en AGENDADA (el caso
 * que `revertirAgendandoOwned` NO cubre, porque filtra por AGENDANDO). Se filtra
 * por `calBookingUid` puntual para no pisar JAMÁS una agenda ajena — y como el
 * claim exigió `agendaJson` NULL, no puede haber una previa distinta. Sin esto,
 * un fallo entre `guardarAgendaOwned` y `registrarContactoComercial` dejaba al
 * lead con una reunión "AGENDADA" cuyo booking ya se canceló en Cal.com.
 */
export async function revertirAgendaConfirmadaOwned(
  leadId: string,
  userId: string,
  bookingUid: string,
): Promise<void> {
  const dossier = await getOwnedDossier(leadId, userId)
  if (!dossier) return
  await prisma.osLeadDossier.updateMany({
    where: {
      leadId: dossier.leadId,
      AND: [
        { agendaJson: { path: ['estado'], equals: 'AGENDADA' } },
        { agendaJson: { path: ['calBookingUid'], equals: bookingUid } },
      ],
    },
    data: { agendaJson: Prisma.DbNull },
  })
}

/**
 * Write final tras el OK de Cal.com: AGENDANDO → AGENDADA con uid, slot,
 * attendee y notas de traspaso (obligatorias — las valida la action antes).
 * Solo pisa el claim propio: si no está AGENDANDO, lanza.
 */
export async function guardarAgendaOwned(
  leadId: string,
  userId: string,
  agenda: Agenda,
): Promise<void> {
  const dossier = await getOwnedDossier(leadId, userId)
  if (!dossier) throw new Error('Lead no encontrado al guardar la agenda')

  const parsed = AgendaSchema.parse(agenda)
  const updated = await prisma.osLeadDossier.updateMany({
    where: { leadId: dossier.leadId, agendaJson: { path: ['estado'], equals: 'AGENDANDO' } },
    data: { agendaJson: parsed as Prisma.InputJsonValue },
  })
  if (updated.count === 0) {
    throw new Error('El claim de la agenda desapareció durante el guardado')
  }
}

// ── Cierre de loop post-reunión (SOLO actions admin con requireSuperAdmin) ──

/**
 * Marca "reunión realizada" — la métrica real del piloto (B8 la mide). Solo
 * sobre una agenda AGENDADA y una sola vez. Devuelve false si no aplica.
 */
export async function marcarReunionRealizadaAdmin(leadId: string): Promise<boolean> {
  const agenda = await leerAgendaAgendada(leadId)
  if (!agenda || agenda.realizadaAt) return false

  const parsed = AgendaSchema.parse({ ...agenda, realizadaAt: new Date().toISOString() })
  const updated = await prisma.osLeadDossier.updateMany({
    where: { leadId, agendaJson: { path: ['estado'], equals: 'AGENDADA' } },
    data: { agendaJson: parsed as Prisma.InputJsonValue },
  })
  return updated.count === 1
}

/**
 * Registra el resultado post-reunión de forma consultable (GANADO es el
 * evento que a futuro dispara el 20% — acá SOLO se registra, sin cálculo).
 * Una sola vez por reunión. El movimiento de LeadStatus lo hace la action.
 */
export async function guardarResultadoReunionAdmin(
  leadId: string,
  tipo: ResultadoReunion,
  nota?: string,
): Promise<boolean> {
  const agenda = await leerAgendaAgendada(leadId)
  if (!agenda || agenda.resultado) return false

  const parsed = AgendaSchema.parse({
    ...agenda,
    resultado: { tipo, fecha: new Date().toISOString(), nota },
  })
  const updated = await prisma.osLeadDossier.updateMany({
    where: { leadId, agendaJson: { path: ['estado'], equals: 'AGENDADA' } },
    data: { agendaJson: parsed as Prisma.InputJsonValue },
  })
  return updated.count === 1
}

async function leerAgendaAgendada(leadId: string): Promise<Agenda | null> {
  const dossier = await prisma.osLeadDossier.findUnique({
    where: { leadId },
    select: { agendaJson: true },
  })
  if (!dossier) return null
  const agenda = AgendaSchema.safeParse(dossier.agendaJson)
  return agenda.success && agenda.data.estado === 'AGENDADA' ? agenda.data : null
}
