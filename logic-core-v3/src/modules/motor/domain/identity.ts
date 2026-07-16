/**
 * Resolución de identidad BSUID-first del contacto (B1-S1, diseño del sprint).
 *
 * El BSUID (`user_id`) es LA clave de matching; el teléfono (`waId`) es dato
 * de transición para reconciliar filas legacy creadas antes de la migración
 * de Meta. Orden de resolución:
 *
 *   1. (org, WHATSAPP, externalId = BSUID) — match directo.
 *   2. Sin match y con teléfono: fila legacy por waId AÚN NO reconciliada →
 *      backfill de externalId con el BSUID + reconciledAt (la migración
 *      teléfono→BSUID en caliente, sin duplicar el contacto). Una fila ya
 *      reconciliada a OTRO BSUID no se toca: un número reciclado puede
 *      pertenecer hoy a otra persona — pisar su BSUID mezclaría identidades.
 *   3. Nada: alta por upsert idempotente (upsertByExternalId absorbe la
 *      carrera de dos webhooks concurrentes del mismo contacto nuevo).
 *
 * Todas las funciones aceptan OrgScopeAccessors: corren igual sobre el scope
 * directo o dentro de forOrg().$transaction (los handlers del webhook las
 * envuelven en transacción). El tipo se importa del registry del helper —
 * import type solamente, el acceso a datos sigue entrando por forOrg.
 */
import type { ContactIdentity } from '@prisma/client'
import type { OrgScopeAccessors } from '@/lib/isolation/registry'
import { isUniqueViolation } from './prisma-errors'

export interface InboundContactRef {
  /** BSUID del contacto — SIEMPRE presente en webhooks de mensaje. */
  bsuid: string
  /** Teléfono estilo Cloud API si vino; null si wa_id ya era BSUID o faltó. */
  phone: string | null
}

export type IdentityVia = 'bsuid' | 'reconciled' | 'created'

export interface IdentityResolution {
  identity: ContactIdentity
  via: IdentityVia
}

export async function resolveInboundIdentity(
  db: OrgScopeAccessors,
  ref: InboundContactRef,
): Promise<IdentityResolution> {
  const byBsuid = await db.contactIdentity.findFirst({
    where: { channelType: 'WHATSAPP', externalId: ref.bsuid },
  })
  if (byBsuid !== null) {
    // Aprendizaje lateral: si la fila no conocía el teléfono y ahora vino, se guarda.
    if (ref.phone !== null && byBsuid.waId === null) {
      const updated = await db.contactIdentity.update(byBsuid.id, { waId: ref.phone })
      return { identity: updated, via: 'bsuid' }
    }
    return { identity: byBsuid, via: 'bsuid' }
  }

  if (ref.phone !== null) {
    const legacy = await db.contactIdentity.findFirst({
      where: { channelType: 'WHATSAPP', waId: ref.phone, reconciledAt: null },
    })
    if (legacy !== null) {
      const updated = await db.contactIdentity.update(legacy.id, {
        externalId: ref.bsuid,
        reconciledAt: new Date(),
      })
      return { identity: updated, via: 'reconciled' }
    }
  }

  const created = await db.contactIdentity.upsertByExternalId({
    channelType: 'WHATSAPP',
    externalId: ref.bsuid,
    create: { waId: ref.phone },
    update: {},
  })
  return { identity: created, via: 'created' }
}

export interface UserIdUpdateInput {
  oldExternalId: string
  newExternalId: string
}

export type UserIdUpdateOutcome = 'migrated' | 'unknown-identity' | 'conflict'

/**
 * Aplica el evento `user_id_update` (el usuario cambió de número; Meta emite
 * el user_id viejo y el nuevo). SIEMPRE deja una fila en
 * ContactIdentityTransition — incluso cuando el ID viejo no matchea nada
 * (el dato no se tira: el rastro sirve para reconciliación posterior).
 *
 *   - migrated: la identidad existía y su externalId pasó al ID nuevo.
 *   - unknown-identity: el ID viejo no matchea; queda solo la transición y el
 *     próximo inbound con el ID nuevo crea la identidad por el camino normal.
 *   - conflict: YA existe otra identidad con el ID nuevo. Cero operaciones
 *     destructivas acá (no se mergean conversaciones ni se borra nada): queda
 *     la transición marcada para triage de ops.
 *
 * Corre SIN transacción a propósito: tras una violación de constraint,
 * Postgres aborta la transacción entera (25P02) y el registro de la
 * transición del path de conflicto fallaría dentro de la misma tx. Cada paso
 * es idempotente/no-destructivo y el retry del BSP re-entra limpio, así que
 * la atomicidad multi-statement no compra nada acá. El conflicto se
 * PRE-chequea (camino común sin excepción) y el catch de P2002 queda solo
 * como backstop de carrera entre el check y el update.
 */
export async function applyUserIdUpdate(
  db: OrgScopeAccessors,
  input: UserIdUpdateInput,
): Promise<UserIdUpdateOutcome> {
  const identity = await db.contactIdentity.findFirst({
    where: { channelType: 'WHATSAPP', externalId: input.oldExternalId },
  })
  if (identity === null) {
    await recordTransition(db, input, null, 'user_id_update:unknown-identity')
    return 'unknown-identity'
  }
  const conflicting = await db.contactIdentity.findFirst({
    where: { channelType: 'WHATSAPP', externalId: input.newExternalId },
    select: { id: true },
  })
  if (conflicting !== null) {
    await recordTransition(db, input, identity.id, 'user_id_update:conflict')
    return 'conflict'
  }
  try {
    // waId se ANULA a propósito: user_id_update significa "cambió de número"
    // y el número viejo puede estar reasignado a otra persona — conservarlo
    // arriesga enviarle a un desconocido en B1-S2. El aprendizaje lateral de
    // resolveInboundIdentity lo repobla con el próximo mensaje entrante.
    await db.contactIdentity.update(identity.id, { externalId: input.newExternalId, waId: null })
  } catch (error) {
    if (isUniqueViolation(error, 'externalId')) {
      await recordTransition(db, input, identity.id, 'user_id_update:conflict')
      return 'conflict'
    }
    throw error
  }
  await recordTransition(db, input, identity.id, 'user_id_update')
  return 'migrated'
}

async function recordTransition(
  db: OrgScopeAccessors,
  input: UserIdUpdateInput,
  contactIdentityId: string | null,
  source: string,
): Promise<void> {
  await db.contactIdentityTransition.create({
    contactIdentityId,
    channelType: 'WHATSAPP',
    fromExternalId: input.oldExternalId,
    toExternalId: input.newExternalId,
    source,
  })
}
