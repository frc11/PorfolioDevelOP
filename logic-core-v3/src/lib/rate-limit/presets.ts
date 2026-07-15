// Presets de rate-limit centralizados (B14.1). Single source of truth
// para los límites de auth + chatbot. Cualquier ajuste futuro se hace acá,
// no en los call sites.
//
// Convención de scope: prefijo corto, snake-case implícito. Forma la
// primera parte de la `key` en la tabla rate_limit: "{scope}:{hash24}".

export const RATE_LIMIT_PRESETS = {
  // ── Auth ────────────────────────────────────────────────────────────────
  // Solicitud de reset (público): protege contra spam de "olvidé contraseña".
  forgotPasswordPerIp: { limit: 5, windowMs: 15 * 60_000 },
  forgotPasswordPerEmail: { limit: 3, windowMs: 60 * 60_000 },
  // Completar reset (público): protege contra brute force del token.
  resetPasswordPerIp: { limit: 10, windowMs: 15 * 60_000 },
  // Admin: re-envío de credenciales (anti doble-click y anti cuenta comprometida).
  resendCredentialsPerAdmin: { limit: 10, windowMs: 60 * 60_000 },
  // Admin: envío manual del reporte ejecutivo semanal, 1 org por click (P2.B.1).
  // Cada click intenta mandar un mail real por Brevo — anti doble-click y anti
  // abuso de cuenta admin comprometida. Precedente: resendCredentialsPerAdmin.
  sendExecutiveReportNowPerAdmin: { limit: 5, windowMs: 5 * 60_000 },

  // ── Chatbot ─────────────────────────────────────────────────────────────
  // Capa CORS (route handler) — clave: origin + IP hasheada (no sessionId,
  // que era controlable por el atacante — SEC-RATELIMIT-02). Frena al
  // visitante antes de entrar al handler interno. Cubre el costo Vertex.
  // Complementa (no reemplaza) el SOFT_CAP_THRESHOLD de turnos en el prompt.
  chatbotPerSession: { limit: 30, windowMs: 60_000 },
  // Capa handler interno (handleChatRequest) — clave: slug + sessionId.
  // Defense-in-depth heredada del MVP. En el flujo actual el más restrictivo
  // (este) gana sobre el de la route. Migrado a la tabla por B14.1 pero
  // queda como pendiente consolidar con chatbotPerSession en otro sprint
  // — fuera de scope de B14.1 (no es seguridad de costo extra, es limpieza).
  chatbotPerBotSession: { limit: 10, windowMs: 60_000 },

  // ── Dashboard CRM (B5.8) ────────────────────────────────────────────────
  // Antispam del botón "reintentar sync" y "probar conexión" del dashboard
  // del cliente. Identifica por orgId (no sensible — no se hashea).
  crmRetryPerOrg: { limit: 10, windowMs: 60_000 },
  crmTestPerOrg: { limit: 5, windowMs: 60_000 },

  // ── Admin: test de notificación de leads (config del bot) ────────────────
  // Antispam del botón "Test email" — cada click manda un mail real por
  // Resend. Clave: id del admin (precedente: resendCredentialsPerAdmin).
  testNotificationPerAdmin: { limit: 3, windowMs: 60_000 },

  // ── Formulario de contacto público (landing) ─────────────────────────────
  // Protege contra spam de leads. Un visitante real nunca necesita enviar el
  // form más de 5 veces en 15 minutos. Clave: IP hasheada (no controlable
  // por el atacante — no se expone ningún campo del FormData).
  contactFormPerIp: { limit: 5, windowMs: 15 * 60_000 },

  // ── Motor WhatsApp (B1-S1) ──────────────────────────────────────────────
  // Webhook entrante del BSP (360dialog). Clave: hash del channelToken (el
  // token es material secreto de URL — no se persiste en claro en la tabla
  // compartida). Techo por canal pensado para ráfagas legítimas de Meta,
  // retries incluidos (~10 msg/s sostenidos), sin dejar la URL pública sin
  // freno frente a floods.
  motorWebhookPerChannel: { limit: 600, windowMs: 60_000 },

  // ── Aviso de lead al cliente (P2.A) ───────────────────────────────────────
  // Anti-spam del email "nuevo lead" al dueño: máximo 5 avisos individuales por
  // org por hora. Superado el tope, el aviso se AGRUPA en un digest (no se
  // silencia). Clave: orgId (no sensible). NO aplica a leads calientes en Pro+
  // (un caliente siempre avisa — saltea el cap). Ver `client-notifications`.
  leadNotifyPerOrg: { limit: 5, windowMs: 60 * 60_000 },
  // El digest en sí se limita a 1 por org por hora: una vez superado el cap de
  // individuales, se manda UN solo resumen agrupado — los leads siguientes de
  // esa hora no vuelven a disparar mail (evita spamear con un digest por lead).
  leadDigestPerOrg: { limit: 1, windowMs: 60 * 60_000 },
} as const

export type RateLimitScope = keyof typeof RATE_LIMIT_PRESETS
