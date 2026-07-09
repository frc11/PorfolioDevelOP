/**
 * Orquestador del pipeline de entrada (B1-S1, paso c): clasifica cada change
 * del envelope y despacha al handler correspondiente. Contrato de errores:
 *   - Shape inválido / evento irresoluble / metadata ajena → se saltea con
 *     log y el batch sigue (200: reintentar no lo va a arreglar).
 *   - Error de infraestructura (DB caída, etc.) → burbujea al route → 500 →
 *     el BSP reintenta y la idempotencia por wamid absorbe el replay.
 *
 * Cross-check de tenant (defensa en profundidad): metadata.phone_number_id
 * del evento debe coincidir con el phoneNumberId del canal resuelto por
 * token — un payload válido de OTRO canal (secret filtrado, URL confundida)
 * no escribe en esta org.
 */
import { logger } from '@/lib/logger'
import type { OrgScope } from '@/lib/isolation'
import { applyUserIdUpdate } from '@/modules/motor/domain/identity'
import { handleInboundMessage } from './handle-message'
import { handleStatusUpdate } from './handle-status'
import { classifyChange, type InboundEvent, type MessagesValue, type WebhookEnvelope } from './payload'
import type { ResolvedChannel } from './resolve-channel'

export interface InboundProcessSummary {
  persisted: number
  duplicates: number
  statusesApplied: number
  statusesSkipped: number
  transitions: number
  ignored: number
  skipped: number
}

const EMPTY_SUMMARY: InboundProcessSummary = Object.freeze({
  persisted: 0,
  duplicates: 0,
  statusesApplied: 0,
  statusesSkipped: 0,
  transitions: 0,
  ignored: 0,
  skipped: 0,
})

function addTo(summary: InboundProcessSummary, key: keyof InboundProcessSummary): InboundProcessSummary {
  return { ...summary, [key]: summary[key] + 1 }
}

const WHATSAPP_OBJECT = 'whatsapp_business_account'

export async function processInboundPayload(
  scope: OrgScope,
  channel: ResolvedChannel,
  envelope: WebhookEnvelope,
): Promise<InboundProcessSummary> {
  // Envelope de otro producto de Meta: se ignora con 200 (un 400 dispararía
  // el retry del BSP por algo que jamás va a parsear distinto).
  if (envelope.object !== WHATSAPP_OBJECT) {
    logger.warn('motor-inbound: envelope con object ajeno a WhatsApp, ignorado', {
      channelId: channel.id,
      object: envelope.object,
    })
    return addTo(EMPTY_SUMMARY, 'ignored')
  }
  let summary = EMPTY_SUMMARY
  for (const entry of envelope.entry) {
    for (const change of entry.changes ?? []) {
      summary = await applyEvent(scope, channel, classifyChange(change), summary)
    }
  }
  return summary
}

async function applyEvent(
  scope: OrgScope,
  channel: ResolvedChannel,
  event: InboundEvent,
  summary: InboundProcessSummary,
): Promise<InboundProcessSummary> {
  if (event.kind === 'invalid') {
    logger.warn('motor-inbound: change con shape inválido, salteado', {
      channelId: channel.id,
      field: event.field,
    })
    return addTo(summary, 'skipped')
  }
  if (event.kind === 'other') {
    logger.debug('motor-inbound: evento no manejado por B1-S1, ignorado', {
      channelId: channel.id,
      field: event.field,
    })
    return addTo(summary, 'ignored')
  }
  if (event.kind === 'user_id_update') {
    if (event.phoneNumberId !== null && event.phoneNumberId !== channel.phoneNumberId) {
      logger.warn('motor-inbound: user_id_update con phone_number_id ajeno al canal, descartado', {
        channelId: channel.id,
      })
      return addTo(summary, 'skipped')
    }
    const outcome = await applyUserIdUpdate(scope, {
      oldExternalId: event.oldExternalId,
      newExternalId: event.newExternalId,
    })
    logger.info('motor-inbound: user_id_update registrado', { channelId: channel.id, outcome })
    return addTo(summary, 'transitions')
  }
  return applyMessagesEvent(scope, channel, event.value, summary)
}

async function applyMessagesEvent(
  scope: OrgScope,
  channel: ResolvedChannel,
  value: MessagesValue,
  summary: InboundProcessSummary,
): Promise<InboundProcessSummary> {
  if (value.metadata.phone_number_id !== channel.phoneNumberId) {
    logger.warn('motor-inbound: metadata.phone_number_id no coincide con el canal del token, descartado', {
      channelId: channel.id,
    })
    return addTo(summary, 'skipped')
  }
  let next = summary
  for (const message of value.messages ?? []) {
    const outcome = await handleInboundMessage(scope, channel, value, message)
    if (outcome === 'persisted') next = addTo(next, 'persisted')
    else if (outcome === 'duplicate') next = addTo(next, 'duplicates')
    else {
      logger.warn('motor-inbound: mensaje sin contacto resoluble, salteado', { channelId: channel.id })
      next = addTo(next, 'skipped')
    }
  }
  for (const status of value.statuses ?? []) {
    const outcome = await handleStatusUpdate(scope, status)
    if (outcome === 'applied') next = addTo(next, 'statusesApplied')
    else {
      logger.debug('motor-inbound: status no aplicado', { channelId: channel.id, outcome })
      next = addTo(next, 'statusesSkipped')
    }
  }
  return next
}
