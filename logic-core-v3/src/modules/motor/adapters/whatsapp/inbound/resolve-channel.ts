/**
 * Resolución canal→organización por channelToken (B1-S1).
 *
 * ÚNICA unsafeGlobalQuery del sprint, permitida por el pliego: el webhook
 * llega PRE-tenant — no existe organización hasta resolver el canal, y el
 * token opaco es justamente la clave global de esa resolución (por eso es el
 * segundo unique global deliberado del bloque, junto a providerMessageId).
 * TODO lo que sigue a esta llamada corre scoped con forOrg(organizationId).
 */
import type { WabaChannelStatus } from '@prisma/client'
import { unsafeGlobalQuery } from '@/lib/isolation'
import { CHANNEL_TOKEN_PATTERN } from '@/modules/motor/domain/channel-credentials'

export interface ResolvedChannel {
  id: string
  organizationId: string
  phoneNumberId: string
  status: WabaChannelStatus
  webhookSecretHash: string | null
}

export async function resolveChannelByToken(channelToken: string): Promise<ResolvedChannel | null> {
  // Shape inválido → ni siquiera se toca la DB (y un token malformado es
  // indistinguible de uno desconocido para el caller: 401 en ambos casos).
  if (!CHANNEL_TOKEN_PATTERN.test(channelToken)) return null
  return unsafeGlobalQuery('TENANT-RESOLUTION: webhook inbound', (client) =>
    client.wabaChannel.findUnique({
      where: { channelToken },
      select: {
        id: true,
        organizationId: true,
        phoneNumberId: true,
        status: true,
        webhookSecretHash: true,
      },
    }),
  )
}
