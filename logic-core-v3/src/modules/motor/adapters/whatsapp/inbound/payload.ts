/**
 * Shapes del webhook de la Cloud API reenviado por 360dialog (B1-S1).
 *
 * Validación estricta del SUBSET consumido (Zod descarta claves extra al
 * parsear — los campos que la Cloud API agregue no rompen nada). Reglas de
 * los datos verificados del sprint:
 *   - contacts[].user_id (BSUID) es SIEMPRE requerido en eventos de mensaje.
 *   - contacts[].wa_id puede ser teléfono O BSUID — se clasifica por formato,
 *     nunca se asume E.164.
 *   - Los status `failed` OMITEN el bloque contacts → contacts es opcional.
 *   - `user_id_update` trae el ID viejo y el nuevo. La forma exacta del
 *     payload vivo queda por confirmar contra el sandbox del BSP
 *     (verificación humana del sprint); el parser acepta la variante
 *     canónica old_user_id/new_user_id.
 *
 * Un change que no parsea se clasifica 'invalid' y se saltea con log — nunca
 * tumba el batch entero ni provoca un 4xx/5xx que dispare el retry del BSP
 * por un evento que jamás va a parsear.
 *
 * B1-S3 — eventos de SALUD (quality/tier/estado del número, ciclo de vida de
 * plantillas). Confianza de shape por evento (fuentes en
 * docs/motor-whatsapp/bitacora.md, sección "Fuentes de los shapes de eventos
 * de salud"):
 *   - `message_template_status_update`: CONFIRMADO contra la referencia de
 *     Meta Cloud API (field, value.event, message_template_id/name/language,
 *     reason) — se parsea completo.
 *   - `phone_number_quality_update`: solo `current_limit` (el tier) está
 *     confirmado. El color de calidad (GREEN/YELLOW/RED) no tiene shape
 *     confirmado en ninguna doc accesible (ni 360dialog ni Meta de forma
 *     consistente) — el schema NO lo declara; el handler solo loguea `event`.
 *   - `account_update`: la LISTA de valores de `event` está confirmada
 *     (enum literal de la doc de Meta); las formas anidadas
 *     (ban_info/restriction_info/violation_info) no lo están — el schema
 *     solo toma `event`, nunca inventa un campo anidado.
 */
import { z } from 'zod'
import { classifyContactAddress, isBsuid } from '@/modules/motor/domain/bsuid'

const contactSchema = z.object({
  user_id: z.string().min(1),
  wa_id: z.string().min(1).optional(),
  profile: z.object({ name: z.string().optional() }).optional(),
})

const messageSchema = z.object({
  /** wamid — la clave de idempotencia (MotorMessage.providerMessageId UNIQUE). */
  id: z.string().min(1),
  from: z.string().min(1),
  timestamp: z.string().optional(),
  type: z.string().min(1),
  text: z.object({ body: z.string() }).optional(),
  button: z.object({ text: z.string().optional() }).optional(),
  interactive: z
    .object({
      button_reply: z.object({ title: z.string().optional() }).optional(),
      list_reply: z.object({ title: z.string().optional() }).optional(),
    })
    .optional(),
  image: z.object({ caption: z.string().optional() }).optional(),
  video: z.object({ caption: z.string().optional() }).optional(),
  document: z.object({ caption: z.string().optional() }).optional(),
})

const statusErrorSchema = z.object({
  code: z.number().optional(),
  title: z.string().optional(),
  message: z.string().optional(),
})

const statusSchema = z.object({
  /** wamid del mensaje OUT referido. */
  id: z.string().min(1),
  // string (no enum): un status desconocido se saltea en el handler con log,
  // sin invalidar el change entero.
  status: z.string().min(1),
  recipient_id: z.string().optional(),
  recipient_user_id: z.string().optional(),
  errors: z.array(statusErrorSchema).optional(),
})

const metadataSchema = z.object({
  display_phone_number: z.string().optional(),
  phone_number_id: z.string().min(1),
})

const messagesValueSchema = z.object({
  messaging_product: z.literal('whatsapp'),
  metadata: metadataSchema,
  contacts: z.array(contactSchema).optional(),
  messages: z.array(messageSchema).optional(),
  statuses: z.array(statusSchema).optional(),
})

// A diferencia del path de mensajes (aditivo: crear una identidad con un id
// raro es benigno), user_id_update REESCRIBE identidades existentes — acá los
// ids se validan contra el patrón BSUID. Un evento que no cumpla se saltea
// con log (recuperable por observabilidad), nunca 400.
const bsuidString = z.string().refine(isBsuid, { message: 'no es un BSUID válido' })

const userIdUpdateValueSchema = z.object({
  messaging_product: z.literal('whatsapp').optional(),
  metadata: metadataSchema.optional(),
  user_id_update: z.object({
    old_user_id: bsuidString,
    new_user_id: bsuidString,
  }),
})

// B1-S3 — shape confirmado (message_template_id puede llegar number o string
// según el proxy del BSP; se normaliza a string en classifyChange).
const templateStatusUpdateValueSchema = z.object({
  event: z.string().min(1),
  message_template_id: z.union([z.string(), z.number()]).optional(),
  message_template_name: z.string().optional(),
  message_template_language: z.string().optional(),
  reason: z.string().nullable().optional(),
})

// B1-S3 — solo `current_limit` (tier) tiene shape confirmado; el color de
// calidad no se declara acá a propósito (ver docstring del archivo).
const phoneNumberQualityUpdateValueSchema = z.object({
  event: z.string().optional(),
  current_limit: z.string().optional(),
})

// B1-S3 — solo `event` tiene shape confirmado (lista de literales de la doc
// de Meta); las formas anidadas no se declaran a propósito.
const accountUpdateValueSchema = z.object({
  event: z.string().optional(),
})

const changeSchema = z.object({ field: z.string(), value: z.unknown() })

export const webhookEnvelopeSchema = z.object({
  object: z.string(),
  entry: z.array(
    z.object({
      id: z.string().optional(),
      changes: z.array(changeSchema).optional(),
    }),
  ),
})

export type WebhookEnvelope = z.infer<typeof webhookEnvelopeSchema>
export type MessagesValue = z.infer<typeof messagesValueSchema>
export type InboundMessage = z.infer<typeof messageSchema>
export type InboundContact = z.infer<typeof contactSchema>
export type StatusEvent = z.infer<typeof statusSchema>
export type StatusEventError = z.infer<typeof statusErrorSchema>

export type InboundEvent =
  | { kind: 'messages'; value: MessagesValue }
  | { kind: 'user_id_update'; oldExternalId: string; newExternalId: string; phoneNumberId: string | null }
  | {
      kind: 'template_status_update'
      event: string
      templateId: string | null
      name: string | null
      language: string | null
      reason: string | null
    }
  | { kind: 'phone_quality_update'; event: string | null; currentLimit: string | null }
  | { kind: 'account_update'; event: string | null }
  | { kind: 'other'; field: string }
  | { kind: 'invalid'; field: string }

/**
 * Clasifica un change del envelope en un evento tipado del pipeline.
 * `value` es opcional en el tipo inferido (quirk de Zod v3 con z.unknown());
 * un change sin value no parsea contra ningún schema → 'invalid'.
 */
export function classifyChange(change: { field: string; value?: unknown }): InboundEvent {
  if (change.field === 'messages') {
    const parsed = messagesValueSchema.safeParse(change.value)
    if (!parsed.success) return { kind: 'invalid', field: change.field }
    return { kind: 'messages', value: parsed.data }
  }
  if (change.field === 'user_id_update') {
    const parsed = userIdUpdateValueSchema.safeParse(change.value)
    if (!parsed.success) return { kind: 'invalid', field: change.field }
    return {
      kind: 'user_id_update',
      oldExternalId: parsed.data.user_id_update.old_user_id,
      newExternalId: parsed.data.user_id_update.new_user_id,
      phoneNumberId: parsed.data.metadata?.phone_number_id ?? null,
    }
  }
  if (change.field === 'message_template_status_update') {
    const parsed = templateStatusUpdateValueSchema.safeParse(change.value)
    if (!parsed.success) return { kind: 'invalid', field: change.field }
    return {
      kind: 'template_status_update',
      event: parsed.data.event,
      templateId: parsed.data.message_template_id !== undefined ? String(parsed.data.message_template_id) : null,
      name: parsed.data.message_template_name ?? null,
      language: parsed.data.message_template_language ?? null,
      reason: parsed.data.reason ?? null,
    }
  }
  if (change.field === 'phone_number_quality_update') {
    const parsed = phoneNumberQualityUpdateValueSchema.safeParse(change.value)
    if (!parsed.success) return { kind: 'invalid', field: change.field }
    return {
      kind: 'phone_quality_update',
      event: parsed.data.event ?? null,
      currentLimit: parsed.data.current_limit ?? null,
    }
  }
  if (change.field === 'account_update') {
    const parsed = accountUpdateValueSchema.safeParse(change.value)
    if (!parsed.success) return { kind: 'invalid', field: change.field }
    return { kind: 'account_update', event: parsed.data.event ?? null }
  }
  return { kind: 'other', field: change.field }
}

export interface ResolvedContactRef {
  bsuid: string
  phone: string | null
}

/**
 * Referencia de contacto de un mensaje: matchea el contact por wa_id ===
 * from (payloads con varios remitentes) con fallback al primero. El teléfono
 * sale de wa_id o de from SOLO si clasifican como teléfono — un BSUID en
 * esos campos jamás se guarda como waId.
 */
export function contactRefForMessage(value: MessagesValue, message: InboundMessage): ResolvedContactRef | null {
  const contacts = value.contacts ?? []
  const matched = contacts.find((contact) => contact.wa_id === message.from) ?? contacts[0]
  if (matched === undefined) return null
  const waIdPhone =
    matched.wa_id !== undefined && classifyContactAddress(matched.wa_id) === 'phone' ? matched.wa_id : null
  const fromPhone = classifyContactAddress(message.from) === 'phone' ? message.from : null
  return { bsuid: matched.user_id, phone: waIdPhone ?? fromPhone }
}

/**
 * Cuerpo persistible del mensaje: texto, o el texto de la interacción, o el
 * caption del medio. Vacío para tipos no textuales — messageType conserva
 * el tipo original (la descarga de media es de sprints posteriores).
 */
export function extractMessageBody(message: InboundMessage): string {
  if (message.text?.body !== undefined) return message.text.body
  if (message.button?.text !== undefined) return message.button.text
  const reply = message.interactive?.button_reply?.title ?? message.interactive?.list_reply?.title
  if (reply !== undefined) return reply
  const caption = message.image?.caption ?? message.video?.caption ?? message.document?.caption
  if (caption !== undefined) return caption
  return ''
}
