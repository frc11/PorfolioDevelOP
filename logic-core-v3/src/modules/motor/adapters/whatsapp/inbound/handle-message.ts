/**
 * Persistencia de un mensaje entrante (B1-S1, paso f del pipeline).
 *
 * Idempotencia en dos capas (los retries del BSP son la norma — hasta 7 días
 * con backoff): pre-check barato por wamid, y el unique global de
 * MotorMessage.providerMessageId como garantía real bajo carrera (P2002 →
 * 'duplicate', 200 silencioso).
 *
 * Identidad + conversación + mensaje corren en UNA transacción scoped: un
 * retry tras fallo parcial re-entra limpio (nada queda a medias). El P2002
 * del duplicado se captura FUERA del $transaction — la tx entera ya quedó
 * rollbackeada y no se ejecuta ningún statement post-aborto.
 */
import type { MotorConversation } from '@prisma/client'
import type { OrgScope } from '@/lib/isolation'
import type { OrgScopeAccessors } from '@/lib/isolation/registry'
import { resolveInboundIdentity } from '@/modules/motor/domain/identity'
import { isUniqueViolation } from '@/modules/motor/domain/prisma-errors'
import { contactRefForMessage, extractMessageBody, type InboundMessage, type MessagesValue } from './payload'
import type { ResolvedChannel } from './resolve-channel'

export type InboundMessageOutcome = 'persisted' | 'duplicate' | 'unresolvable'

export async function handleInboundMessage(
  scope: OrgScope,
  channel: ResolvedChannel,
  value: MessagesValue,
  message: InboundMessage,
): Promise<InboundMessageOutcome> {
  const ref = contactRefForMessage(value, message)
  // Sin bloque contacts no hay BSUID y sin BSUID no hay identidad: se saltea
  // con log (los datos verificados dicen que en mensajes SIEMPRE viene).
  if (ref === null) return 'unresolvable'

  const existing = await scope.motorMessage.findFirst({
    where: { providerMessageId: message.id },
    select: { id: true },
  })
  if (existing !== null) return 'duplicate'

  try {
    await scope.$transaction(async (tx) => {
      const resolution = await resolveInboundIdentity(tx, ref)
      const conversation = await upsertOpenConversation(tx, channel.id, resolution.identity.id)
      await tx.motorMessage.create({
        conversationId: conversation.id,
        direction: 'IN',
        body: extractMessageBody(message),
        messageType: message.type,
        providerMessageId: message.id,
        status: 'RECEIVED',
      })
    })
  } catch (error) {
    if (isUniqueViolation(error, 'providerMessageId')) return 'duplicate'
    throw error
  }
  return 'persisted'
}

/**
 * Conversación OPEN del par (canal, identidad): se reutiliza la más vieja si
 * existe (elección determinística si una carrera dejó dos — no hay unique
 * parcial en DB, limitación conocida y documentada en bitácora) y se
 * actualiza lastInboundAt = now(), la base del cálculo de la ventana de 24h.
 */
async function upsertOpenConversation(
  tx: OrgScopeAccessors,
  wabaChannelId: string,
  contactIdentityId: string,
): Promise<MotorConversation> {
  const existing = await tx.motorConversation.findFirst({
    where: { wabaChannelId, contactIdentityId, status: 'OPEN' },
    orderBy: { createdAt: 'asc' },
  })
  const now = new Date()
  if (existing !== null) {
    return tx.motorConversation.update(existing.id, { lastInboundAt: now })
  }
  return tx.motorConversation.create({ wabaChannelId, contactIdentityId, lastInboundAt: now })
}
