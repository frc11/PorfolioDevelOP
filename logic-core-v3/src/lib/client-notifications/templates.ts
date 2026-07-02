/**
 * P2.A — Templates del aviso de lead al cliente. Puros (sin I/O): reciben datos
 * y devuelven { subject, html }. HTML simple y robusto para Gmail mobile
 * (layout con tablas + estilos inline), sentence case, lenguaje de dueño, cero
 * jerga. El template "caliente" es el único que usa lenguaje de clasificación.
 *
 * Remitente y envío los pone `notify.ts` vía `sendTransactionalEmail`
 * (Brevo — el mismo transaccional que el resto del repo: develOP
 * <hola@develop.com.ar>). Acá solo se arma el contenido.
 */
import type { LeadEmailTemplate } from './decide'

export interface LeadEmailData {
  organizationName: string
  botName: string
  leadName: string
  email: string | null
  phone: string | null
  /** Intent lowercase tal como lo capturó el bot (purchase_ready, etc.). */
  intent: string
  /** Resumen de qué busca el lead (contextSummary del bot). */
  message: string
  capturedAt: Date
  /** URL directa al lead en el panel del cliente. */
  leadUrl: string
}

/**
 * Etiqueta corta y en lenguaje de dueño para el intent — se usa en el asunto y
 * arriba del cuerpo. Sin jerga: "quiere comprar", no "purchase_ready".
 */
export function intentLabel(intent: string): string {
  switch (intent) {
    case 'purchase_ready':
      return 'quiere comprar'
    case 'schedule_visit':
      return 'quiere agendar una visita'
    case 'quote_request':
      return 'pidió una cotización'
    case 'human_request':
      return 'quiere que lo contactes'
    case 'support':
      return 'tiene una consulta de postventa'
    default:
      return 'dejó una consulta'
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function escapeAttribute(value: string): string {
  return escapeHtml(value).replace(/`/g, '&#096;')
}

/**
 * Asunto. El "normal" es factual ("Nuevo interesado: Juan · quiere comprar");
 * el "caliente" (solo Pro+) usa el lenguaje de clasificación y va primero para
 * que se distinga entre 40 mails sin leer.
 */
export function leadEmailSubject(
  template: LeadEmailTemplate,
  data: { leadName: string; intent: string },
): string {
  const who = data.leadName.trim() || 'Alguien'
  const label = intentLabel(data.intent)
  return template === 'hot'
    ? `Lead caliente: ${who} · ${label}`
    : `Nuevo interesado: ${who} · ${label}`
}

/** Fecha/hora legible en español AR para el cuerpo del mail. */
function formatWhen(date: Date): string {
  try {
    return date.toLocaleString('es-AR', {
      timeZone: 'America/Argentina/Buenos_Aires',
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return date.toISOString()
  }
}

interface ThemeCopy {
  accent: string
  headerBg: string
  eyebrow: string
  banner: string | null
}

function themeFor(template: LeadEmailTemplate): ThemeCopy {
  if (template === 'hot') {
    return {
      // Ámbar cálido: se lee como "urgente" sin gritar.
      accent: '#f59e0b',
      headerBg: '#7c2d12',
      eyebrow: 'Lead caliente',
      banner:
        'Este contacto mostró intención de compra fuerte. Responder en los primeros minutos multiplica la chance de cerrarlo — conviene contactarlo ya.',
    }
  }
  return {
    accent: '#06b6d4',
    headerBg: '#0f172a',
    eyebrow: 'Nuevo lead',
    banner: null,
  }
}

/**
 * Cuerpo HTML. Mismo esqueleto para ambos templates; el "caliente" agrega el
 * banner de urgencia y usa el acento ámbar. Solo datos factuales del lead.
 */
export function renderLeadEmail(template: LeadEmailTemplate, data: LeadEmailData): string {
  const theme = themeFor(template)
  const who = data.leadName.trim() || 'Un visitante'

  const contactRows = [
    data.phone
      ? `<p style="margin:6px 0;color:#334155;font-size:15px;"><strong>Teléfono:</strong> ${escapeHtml(data.phone)}</p>`
      : '',
    data.email
      ? `<p style="margin:6px 0;color:#334155;font-size:15px;"><strong>Email:</strong> ${escapeHtml(data.email)}</p>`
      : '',
  ]
    .filter(Boolean)
    .join('')

  const bannerHtml = theme.banner
    ? `<div style="margin:0 0 20px;padding:14px 16px;background:#fef3c7;border-left:4px solid ${theme.accent};border-radius:8px;color:#78350f;font-size:14px;line-height:1.5;">
         ${escapeHtml(theme.banner)}
       </div>`
    : ''

  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
  </head>
  <body style="margin:0;background:#f8fafc;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f8fafc;padding:28px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border:1px solid #e2e8f0;border-radius:14px;overflow:hidden;">
            <tr>
              <td style="padding:22px 28px;background:${theme.headerBg};color:#ffffff;">
                <p style="margin:0 0 6px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:${theme.accent};">${escapeHtml(theme.eyebrow)}</p>
                <h1 style="margin:0;font-size:20px;line-height:1.3;">${escapeHtml(who)} ${escapeHtml(intentLabel(data.intent))}</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:26px 28px;">
                ${bannerHtml}
                <p style="margin:0 0 4px;color:#64748b;font-size:13px;">Tu bot ${escapeHtml(data.botName)} capturó un nuevo contacto:</p>
                <h2 style="margin:6px 0 14px;font-size:19px;">${escapeHtml(who)}</h2>
                ${contactRows}
                <div style="margin:16px 0;padding:16px;background:#f1f5f9;border-left:4px solid ${theme.accent};border-radius:8px;color:#1e293b;font-size:15px;line-height:1.55;">
                  ${escapeHtml(data.message)}
                </div>
                <p style="margin:6px 0 20px;color:#64748b;font-size:13px;">Contactado el ${escapeHtml(formatWhen(data.capturedAt))} hs</p>
                <a href="${escapeAttribute(data.leadUrl)}" style="display:inline-block;padding:13px 20px;background:${theme.accent};color:#02121a;text-decoration:none;border-radius:8px;font-weight:700;font-size:15px;">
                  Ver este lead en mi panel
                </a>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 28px;background:#f8fafc;border-top:1px solid #e2e8f0;color:#94a3b8;font-size:12px;">
                Aviso automático de ${escapeHtml(data.organizationName)} · develOP
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`
}

export interface DigestEmailData {
  organizationName: string
  count: number
  /** URL a la lista de leads del panel. */
  leadsUrl: string
}

export function digestEmailSubject(count: number): string {
  return count === 1
    ? 'Tenés 1 lead nuevo en la última hora'
    : `Tenés ${count} leads nuevos en la última hora`
}

/**
 * Digest: cuando se supera el cap de avisos individuales, un solo mail agrupado
 * (en vez de silenciar los leads que pasan el tope).
 */
export function renderDigestEmail(data: DigestEmailData): string {
  const line =
    data.count === 1
      ? 'Tu bot capturó 1 lead nuevo en la última hora.'
      : `Tu bot capturó ${data.count} leads nuevos en la última hora.`

  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
  </head>
  <body style="margin:0;background:#f8fafc;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f8fafc;padding:28px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border:1px solid #e2e8f0;border-radius:14px;overflow:hidden;">
            <tr>
              <td style="padding:22px 28px;background:#0f172a;color:#ffffff;">
                <p style="margin:0 0 6px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#06b6d4;">Resumen de leads</p>
                <h1 style="margin:0;font-size:20px;line-height:1.3;">${escapeHtml(line)}</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:26px 28px;">
                <p style="margin:0 0 20px;color:#334155;font-size:15px;line-height:1.55;">Tuviste bastante movimiento. Entrá al panel para verlos todos y contactarlos.</p>
                <a href="${escapeAttribute(data.leadsUrl)}" style="display:inline-block;padding:13px 20px;background:#06b6d4;color:#02121a;text-decoration:none;border-radius:8px;font-weight:700;font-size:15px;">
                  Ver mis leads
                </a>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 28px;background:#f8fafc;border-top:1px solid #e2e8f0;color:#94a3b8;font-size:12px;">
                Aviso automático de ${escapeHtml(data.organizationName)} · develOP
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`
}
