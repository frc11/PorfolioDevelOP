/**
 * B5.8 — Módulo CRM: sync de leads del chatbot al CRM del cliente vía n8n.
 *
 * Diseño:
 *  - DB primero, sync después (un lead JAMÁS se pierde por falla de n8n).
 *  - Multi-tenant: toda lectura/escritura filtra por organizationId.
 *  - Gateado por plan.crmEnabled (B4) + defensa en profundidad en server.
 *  - Anti-SSRF en la URL del webhook (validateWebhookUrl).
 *  - Secret opcional cifrado con AES-256-GCM (encryptSecret).
 *  - Stale resolution en lectura (getEffectiveSyncStatus), sin cron.
 *  - Payload sanitizado sin PII en logs ni jerga interna (buildLeadPayload).
 */

export {
  validateWebhookUrl,
  type WebhookValidationResult,
} from './validateWebhookUrl'

export {
  encryptSecret,
  decryptSecret,
  isCrmEncryptionConfigured,
  CrmEncryptionError,
  type EncryptedSecret,
} from './encryptSecret'

export {
  getEffectiveSyncStatus,
  isStaleSync,
  SYNC_STALE_THRESHOLD_MS,
} from './getEffectiveSyncStatus'

export {
  buildLeadPayload,
  type LeadWebhookPayload,
} from './buildLeadPayload'

export {
  postToN8nWithRetry,
  testN8nConnection,
  type PostInput,
  type PostToN8nResult,
  type SinglePostResult,
} from './postToN8n'

export {
  syncLeadToCrm,
  type SyncLeadToCrmInput,
} from './syncLeadToCrm'
