/**
 * Eventos de SALUD del canal (B1-S3): ciclo de vida de plantillas, tier de
 * mensajería y estado del número, más las alertas operativas que disparan.
 * Mitigación del premortem de ban de Meta por calidad — enterarse ANTES del
 * ban, no después.
 *
 * Todo se aplica sobre el `channel` YA resuelto por el token del webhook
 * (frontera de tenant establecida en la auth, no en el payload del evento):
 * ninguno de estos tres eventos trae phone_number_id/org en su `value`
 * (confirmado contra la doc — ver payload.ts), así que aplicar siempre sobre
 * `channel` es lo que preserva el aislamiento sin inventar un cruce.
 *
 * Confianza de shape por evento (detalle en payload.ts y en la bitácora):
 *   - message_template_status_update: CONFIRMADO → se mapea completo.
 *   - phone_number_quality_update: solo el tier (`current_limit`) está
 *     confirmado. El color de calidad NO se persiste acá — qualityRating
 *     queda en UNKNOWN (default de la migración) hasta que el campo se
 *     confirme en producción.
 *   - account_update: solo el NOMBRE del evento está confirmado; se mapea a
 *     través de una whitelist — un evento fuera de la whitelist se loguea y
 *     se ignora, nunca se inventa un estado.
 */
import type {
  MotorAlertSeverity,
  MotorAlertType,
  MotorMessagingLimitTier,
  MotorPhoneStatus,
  MotorTemplateStatus,
  Prisma,
} from '@prisma/client'
import { logger } from '@/lib/logger'
import type { OrgScope } from '@/lib/isolation'
import type { InboundEvent } from './payload'
import type { ResolvedChannel } from './resolve-channel'

const ALERT_DEDUPE_WINDOW_MS = 24 * 60 * 60 * 1000

type TemplateStatusEvent = Extract<
  InboundEvent,
  { kind: 'template_status_update' }
>
type PhoneQualityEvent = Extract<InboundEvent, { kind: 'phone_quality_update' }>
type AccountUpdateEvent = Extract<InboundEvent, { kind: 'account_update' }>

const TEMPLATE_STATUS_MAP: Readonly<Record<string, MotorTemplateStatus>> = {
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  PAUSED: 'PAUSED',
  PENDING: 'PENDING',
}

// Valores de current_limit confirmados (ver payload.ts). Cualquier otro
// string se loguea y se ignora — nunca se guarda un tier inventado.
const MESSAGING_TIER_VALUES: ReadonlySet<string> = new Set([
  'TIER_50',
  'TIER_250',
  'TIER_2K',
  'TIER_10K',
  'TIER_100K',
  'TIER_NOT_SET',
  'TIER_UNLIMITED',
])

// Whitelist de account_update.event → estado del número. PARTNER_ADDED y el
// resto de los eventos de partner/negocio quedan afuera a propósito (no son
// de salud del NÚMERO) — caen a 'ignored' con log, mismo comportamiento que
// B1-S1 ya probaba (test (j)).
const ACCOUNT_STATUS_MAP: Readonly<Record<string, MotorPhoneStatus>> = {
  ACCOUNT_RECONNECTED: 'CONNECTED',
  ACCOUNT_RESTRICTION: 'RESTRICTED',
  ACCOUNT_VIOLATION: 'RESTRICTED',
  DISABLED_UPDATE: 'RESTRICTED',
  ACCOUNT_DELETED: 'BANNED',
  ACCOUNT_OFFBOARDED: 'DISCONNECTED',
}

const ALERTING_PHONE_STATUSES: ReadonlySet<MotorPhoneStatus> = new Set([
  'RESTRICTED',
  'BANNED',
])

export type TemplateStatusOutcome =
  'applied' | 'unmapped-event' | 'template-not-found'
export type PhoneQualityOutcome = 'tier-applied' | 'log-only'
export type AccountUpdateOutcome = 'applied' | 'ignored'

interface AlertInput {
  type: MotorAlertType
  severity: MotorAlertSeverity
  title: string
  description: string
  metadata: Record<string, unknown>
}

/**
 * Crea la alerta salvo que ya exista una del mismo tipo para el mismo canal
 * dentro de la ventana de dedupe — un retry del webhook (o varios eventos
 * seguidos del mismo tipo) no debe spamear el registro consultable.
 */
async function createAlertIfFresh(
  scope: OrgScope,
  channel: ResolvedChannel,
  input: AlertInput,
): Promise<void> {
  const since = new Date(Date.now() - ALERT_DEDUPE_WINDOW_MS)
  const recent = await scope.motorAlert.findFirst({
    where: {
      wabaChannelId: channel.id,
      type: input.type,
      createdAt: { gte: since },
    },
    select: { id: true },
  })
  if (recent !== null) return
  await scope.motorAlert.create({
    wabaChannelId: channel.id,
    type: input.type,
    severity: input.severity,
    title: input.title,
    description: input.description,
    metadata: input.metadata as Prisma.InputJsonObject,
  })
}

/** message_template_status_update: mapea a MotorTemplateStatus y alerta si REJECTED. */
export async function handleTemplateStatusUpdate(
  scope: OrgScope,
  channel: ResolvedChannel,
  event: TemplateStatusEvent,
): Promise<TemplateStatusOutcome> {
  const nextStatus = TEMPLATE_STATUS_MAP[event.event]
  if (nextStatus === undefined) {
    logger.debug(
      'motor-inbound: message_template_status_update con event sin mapeo, log-only',
      {
        channelId: channel.id,
        event: event.event,
      },
    )
    return 'unmapped-event'
  }

  const template =
    (event.templateId !== null
      ? await scope.motorTemplate.findFirst({
          where: {
            wabaChannelId: channel.id,
            providerTemplateId: event.templateId,
          },
          select: { id: true, name: true },
        })
      : null) ??
    (event.name !== null && event.language !== null
      ? await scope.motorTemplate.findFirst({
          where: {
            wabaChannelId: channel.id,
            name: event.name,
            language: event.language,
          },
          select: { id: true, name: true },
        })
      : null)
  if (template === null) {
    logger.warn(
      'motor-inbound: message_template_status_update sin plantilla local que matchee, salteado',
      {
        channelId: channel.id,
        templateId: event.templateId,
        name: event.name,
        language: event.language,
      },
    )
    return 'template-not-found'
  }

  await scope.motorTemplate.update(template.id, { status: nextStatus })

  if (nextStatus === 'REJECTED') {
    await createAlertIfFresh(scope, channel, {
      type: 'TEMPLATE_REJECTED',
      severity: 'HIGH',
      title: `Plantilla rechazada: ${template.name}`,
      description:
        `Meta rechazó la plantilla "${template.name}"${event.language !== null ? ` (${event.language})` : ''}.` +
        (event.reason !== null ? ` Motivo: ${event.reason}.` : ''),
      metadata: {
        templateId: template.id,
        providerTemplateId: event.templateId,
        reason: event.reason,
      },
    })
  }
  return 'applied'
}

/**
 * phone_number_quality_update: solo persiste el tier confirmado
 * (current_limit). El color de calidad no se toca — ver docstring del
 * archivo.
 */
export async function handlePhoneQualityUpdate(
  scope: OrgScope,
  channel: ResolvedChannel,
  event: PhoneQualityEvent,
): Promise<PhoneQualityOutcome> {
  logger.debug(
    'motor-inbound: phone_number_quality_update recibido (color de calidad sin shape confirmado, log-only)',
    {
      channelId: channel.id,
      event: event.event,
      currentLimit: event.currentLimit,
    },
  )
  if (
    event.currentLimit === null ||
    !MESSAGING_TIER_VALUES.has(event.currentLimit)
  )
    return 'log-only'
  await scope.wabaChannel.update(channel.id, {
    messagingLimitTier: event.currentLimit as MotorMessagingLimitTier,
  })
  return 'tier-applied'
}

/** account_update: mapea event → MotorPhoneStatus vía whitelist; alerta si restringido/baneado. */
export async function handleAccountUpdate(
  scope: OrgScope,
  channel: ResolvedChannel,
  event: AccountUpdateEvent,
): Promise<AccountUpdateOutcome> {
  const nextStatus =
    event.event !== null ? ACCOUNT_STATUS_MAP[event.event] : undefined
  if (nextStatus === undefined) {
    logger.debug(
      'motor-inbound: account_update sin mapeo a estado del número, ignorado',
      {
        channelId: channel.id,
        event: event.event,
      },
    )
    return 'ignored'
  }
  await scope.wabaChannel.update(channel.id, { channelStatus: nextStatus })

  if (ALERTING_PHONE_STATUSES.has(nextStatus)) {
    await createAlertIfFresh(scope, channel, {
      type: 'PHONE_RESTRICTED_OR_BANNED',
      severity: nextStatus === 'BANNED' ? 'CRITICAL' : 'HIGH',
      title: nextStatus === 'BANNED' ? 'Número baneado' : 'Número restringido',
      description: `El canal ${channel.phoneNumberId} pasó a estado ${nextStatus} (evento ${event.event}).`,
      metadata: { event: event.event, channelStatus: nextStatus },
    })
  }
  return 'applied'
}
