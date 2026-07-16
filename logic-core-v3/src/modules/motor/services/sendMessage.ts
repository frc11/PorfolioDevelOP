/**
 * sendMessage — la ÚNICA puerta de salida del motor (B1-S2).
 *
 * Recibe (orgId, conversationId, contenido tipado FreeText | Template) y:
 *   1. Idempotencia de salida: si el caller pasa `idempotencyKey`, un reintento
 *      del despacho NO duplica — se devuelve el mensaje ya reservado.
 *   2. Regla de ventana (dominio puro `windowState`): texto libre SOLO dentro de
 *      las 24h del último inbound; fuera, RECHAZA con error tipado — no manda
 *      igual. Las plantillas aprobadas SÍ pueden salir fuera de ventana.
 *   3. Marketing es imposible por construcción: MotorTemplateCategory solo tiene
 *      UTILITY/SERVICE; este servicio jamás despacha marketing.
 *   4. Reserva el MotorMessage OUT (PENDING) ANTES de llamar al BSP, despacha, y
 *      lo marca SENT (con el wamid que S1 reconcilia por status) o FAILED.
 *
 * Todo el acceso a datos pasa por `forOrg` (aislamiento multi-tenant). La API
 * key del canal se decrypta en memoria (antes de reservar la fila, para que una
 * falla de descifrado rechace limpio sin dejar un OUT colgado ni quemar la
 * idempotencyKey) y nunca se loguea ni se persiste.
 */
import type { MotorConversation } from '@prisma/client'
import { forOrg, type OrgScope } from '@/lib/isolation'
import { createSecretBox, type EncryptedSecret, type SecretBox } from '@/lib/crypto/secret-box'
import { windowState } from '@/modules/motor/domain/window'
import { isUniqueViolation } from '@/modules/motor/domain/prisma-errors'
import {
  sendViaProvider,
  type OutboundDeps,
  type OutboundError,
  type OutboundLogger,
  type ProviderContent,
} from '@/modules/motor/adapters/whatsapp/outbound/client'

/** Env key del cifrado de la API key del canal (ver src/lib/crypto/secret-box.ts). */
const CHANNEL_KEY_ENV = 'MOTOR_CHANNEL_SECRET_KEY'

// ── Contenido a enviar (caller-facing) ──────────────────────────────────────

export interface FreeTextContent {
  readonly kind: 'text'
  readonly body: string
}
export interface TemplateContent {
  readonly kind: 'template'
  readonly name: string
  readonly language: string
  readonly bodyParameters?: readonly string[]
}
export type OutboundContent = FreeTextContent | TemplateContent

export interface SendMessageInput {
  readonly orgId: string
  readonly conversationId: string
  readonly content: OutboundContent
  /** Clave opcional de idempotencia de salida (ver módulo). */
  readonly idempotencyKey?: string
}

/** Motivos de rechazo PRE-despacho (no se llamó al BSP, no hay fila FAILED). */
export type RejectionReason =
  | 'conversation_not_found'
  | 'channel_not_configured'
  | 'channel_key_invalid'
  | 'contact_unavailable'
  | 'window_closed'
  | 'template_not_approved'

export type SendMessageResult =
  | { readonly status: 'sent'; readonly messageId: string; readonly wamid: string }
  | { readonly status: 'deduped'; readonly messageId: string; readonly wamid: string | null }
  | { readonly status: 'failed'; readonly messageId: string; readonly error: OutboundError }
  | { readonly status: 'rejected'; readonly reason: RejectionReason }

export interface SendMessageDeps extends OutboundDeps {
  /** Caja de cifrado del canal; default: la ligada a MOTOR_CHANNEL_SECRET_KEY. */
  secretBox?: SecretBox
  /** Instante para el cálculo de ventana; default: ahora. */
  now?: Date
  logger?: OutboundLogger
}

function describeTemplate(content: TemplateContent): string {
  const params = content.bodyParameters ?? []
  const suffix = params.length > 0 ? ` [${params.length} params]` : ''
  return `template:${content.name} (${content.language})${suffix}`
}

function toProviderContent(content: OutboundContent): ProviderContent {
  if (content.kind === 'text') return { kind: 'text', body: content.body }
  return {
    kind: 'template',
    name: content.name,
    language: content.language,
    bodyParameters: content.bodyParameters,
  }
}

interface DispatchTargets {
  readonly conversation: MotorConversation
  /** API key del canal cifrada (ya verificada no-null), lista para decrypt. */
  readonly apiKeySecret: EncryptedSecret
  readonly to: string
}

/** Conversación → canal (con API key configurada) → destinatario, todo scoped. */
async function resolveTargets(
  scope: OrgScope,
  conversationId: string,
): Promise<{ ok: true; targets: DispatchTargets } | { ok: false; reason: RejectionReason }> {
  const conversation = await scope.motorConversation.findById(conversationId)
  if (conversation === null) return { ok: false, reason: 'conversation_not_found' }

  const channel = await scope.wabaChannel.findById(conversation.wabaChannelId)
  if (channel === null || channel.apiKeyEncrypted === null || channel.apiKeyIv === null || channel.apiKeyTag === null) {
    return { ok: false, reason: 'channel_not_configured' }
  }
  // Narrowing capturado acá: el EncryptedSecret sale con strings no-null.
  const apiKeySecret: EncryptedSecret = {
    encrypted: channel.apiKeyEncrypted,
    iv: channel.apiKeyIv,
    tag: channel.apiKeyTag,
  }

  const identity = await scope.contactIdentity.findById(conversation.contactIdentityId)
  // Destinatario: teléfono si se conoce, si no el BSUID (el contacto solo-BSUID
  // se direcciona por BSUID). Las plantillas de AUTENTICACIÓN no aceptan BSUID —
  // irrelevante acá (solo utility/service).
  const to = identity?.waId ?? identity?.externalId ?? null
  if (to === null) return { ok: false, reason: 'contact_unavailable' }

  return { ok: true, targets: { conversation, apiKeySecret, to } }
}

/** Aplica la regla de ventana / validación de plantilla. null = puede salir. */
async function checkSendable(
  scope: OrgScope,
  content: OutboundContent,
  conversation: MotorConversation,
  now: Date,
): Promise<RejectionReason | null> {
  if (content.kind === 'text') {
    // PROHIBIDO texto libre fuera de ventana: se rechaza, no se manda igual.
    return windowState(conversation.lastInboundAt, now).state === 'CLOSED' ? 'window_closed' : null
  }
  const template = await scope.motorTemplate.findFirst({
    where: { wabaChannelId: conversation.wabaChannelId, name: content.name, language: content.language },
    select: { status: true },
  })
  // Solo una plantilla APPROVED sale (dentro o fuera de ventana). La categoría ya
  // está acotada a utility/service por el enum — marketing no existe.
  return template === null || template.status !== 'APPROVED' ? 'template_not_approved' : null
}

/**
 * Reserva la fila OUT (PENDING) ANTES del despacho. La clave de idempotencia va
 * acá: el unique compuesto por org es la garantía de carrera (P2002 → otro
 * despacho ya la tomó → se devuelve el existente sin re-despachar).
 */
async function reserveOutbound(
  scope: OrgScope,
  input: SendMessageInput,
): Promise<{ reserved: true; messageId: string } | { reserved: false; result: SendMessageResult }> {
  const messageType = input.content.kind === 'text' ? 'text' : 'template'
  const body = input.content.kind === 'text' ? input.content.body : describeTemplate(input.content)
  try {
    const created = await scope.motorMessage.create({
      conversationId: input.conversationId,
      direction: 'OUT',
      body,
      messageType,
      status: 'PENDING',
      outboundIdempotencyKey: input.idempotencyKey ?? null,
    })
    return { reserved: true, messageId: created.id }
  } catch (error) {
    if (input.idempotencyKey !== undefined && isUniqueViolation(error, 'outboundIdempotencyKey')) {
      const existing = await findByIdempotencyKey(scope, input.idempotencyKey)
      if (existing !== null) {
        return { reserved: false, result: { status: 'deduped', messageId: existing.id, wamid: existing.providerMessageId } }
      }
    }
    throw error
  }
}

function findByIdempotencyKey(
  scope: OrgScope,
  key: string,
): Promise<{ id: string; providerMessageId: string | null } | null> {
  return scope.motorMessage.findFirst({
    where: { direction: 'OUT', outboundIdempotencyKey: key },
    select: { id: true, providerMessageId: true },
  })
}

/** Quita el secreto de un texto libre antes de persistirlo (defensa en profundidad). */
function redact(text: string, secret: string): string {
  return secret.length > 0 ? text.split(secret).join('[REDACTED]') : text
}

/**
 * Despacha un mensaje de salida aplicando la regla de ventana y la idempotencia.
 * Punto único de salida del motor — B2 lo consume, no habla con el BSP directo.
 */
export async function sendMotorMessage(
  input: SendMessageInput,
  deps: SendMessageDeps = {},
): Promise<SendMessageResult> {
  const scope = forOrg(input.orgId)
  const now = deps.now ?? new Date()
  const secretBox = deps.secretBox ?? createSecretBox(CHANNEL_KEY_ENV)

  // 1. Idempotencia: si ya existe una salida con esta clave, no se re-despacha.
  if (input.idempotencyKey !== undefined) {
    const existing = await findByIdempotencyKey(scope, input.idempotencyKey)
    if (existing !== null) {
      return { status: 'deduped', messageId: existing.id, wamid: existing.providerMessageId }
    }
  }

  // 2. Conversación → canal → destinatario.
  const resolved = await resolveTargets(scope, input.conversationId)
  if (!resolved.ok) return { status: 'rejected', reason: resolved.reason }
  const { conversation, apiKeySecret, to } = resolved.targets

  // 3. Regla de ventana / validación de plantilla.
  const notSendable = await checkSendable(scope, input.content, conversation, now)
  if (notSendable !== null) return { status: 'rejected', reason: notSendable }

  // 4. Descifrar la API key ANTES de reservar: una key ausente/rotada/corrupta
  //    rechaza limpio (sin fila colgada ni idempotencyKey quemada). Se atrapa sin
  //    ligar el error para no arriesgar nada del secreto en logs.
  let apiKey: string
  try {
    apiKey = secretBox.decrypt(apiKeySecret)
  } catch {
    return { status: 'rejected', reason: 'channel_key_invalid' }
  }

  // 5. Reservar la fila OUT (PENDING).
  const reservation = await reserveOutbound(scope, input)
  if (!reservation.reserved) return reservation.result
  const { messageId } = reservation

  // 6. Despacho: API key usada solo como header del fetch.
  const result = await sendViaProvider({ apiKey, to, content: toProviderContent(input.content) }, deps)

  if (result.ok) {
    await scope.motorMessage.update(messageId, { status: 'SENT', providerMessageId: result.wamid })
    return { status: 'sent', messageId, wamid: result.wamid }
  }
  await scope.motorMessage.update(messageId, {
    status: 'FAILED',
    error: redact(`${result.error.kind}: ${result.error.detail}`, apiKey),
  })
  return { status: 'failed', messageId, error: result.error }
}
