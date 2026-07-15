/**
 * Superficie pública del adaptador de entrada WhatsApp/360dialog (B1-S1).
 * El route handler consume SOLO esto; los internos (auth, identidad,
 * clasificación, persistencia) no se exportan fuera del módulo.
 */
export { handleInboundWebhookRequest } from './handle-request'
