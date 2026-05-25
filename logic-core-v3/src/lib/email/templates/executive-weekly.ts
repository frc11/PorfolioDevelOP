/**
 * Template HTML del reporte ejecutivo semanal al cliente.
 *
 * Diseño:
 * - Tabla-based, inline CSS, sin webfonts, sin imágenes (los clientes de email
 *   bloquean recursos externos por default).
 * - Dark mode consistente con el resto de los emails del proyecto
 *   (ver `weekly-report.ts` del chatbot al admin).
 * - Mobile-friendly: max-width 540px, padding fluido.
 * - Estilo de copy: rioplatense, breve, directo al dueño del negocio.
 */

export interface TopHotLead {
  name: string
  email: string | null
  phone: string | null
  heatLabel: 'Caliente' | 'Tibio' | 'Frío'
  heatAccent: string
  whatTheyWant: string | null
  reasons: string[]
}

export interface ExecutiveWeeklyEmailInput {
  companyName: string
  recipientName?: string | null
  weekLabel: string
  briefText: string
  health: {
    total: number
    deltaVsLastWeek: number | null
  }
  leads: {
    value: number
    deltaPercent: number | null
  }
  messagesAnswered: {
    value: number
    deltaPercent: number | null
  }
  tasksCompleted: {
    value: number
    deltaPercent: number | null
  }
  /**
   * Sección Business-only (B6.3): top 3 leads más calientes de la semana,
   * ranqueados por score EFECTIVO (con decay). El builder solo lo pasa para
   * orgs con plan BUSINESS — en PRO/STARTER queda `undefined` y la sección
   * no se renderiza.
   */
  topHotLeads?: TopHotLead[]
  dashboardUrl: string
  unsubscribeUrl: string
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function deltaIcon(delta: number | null): string {
  if (delta === null) return ''
  if (delta > 0) return '↑'
  if (delta < 0) return '↓'
  return '→'
}

function deltaColor(delta: number | null, invert = false): string {
  if (delta === null || delta === 0) return '#a1a1aa'
  const positive = invert ? delta < 0 : delta > 0
  return positive ? '#10b981' : '#f43f5e'
}

function formatDelta(delta: number | null, suffix: string): string {
  if (delta === null) return 'sin datos previos'
  if (delta === 0) return 'igual que la semana anterior'
  const sign = delta > 0 ? '+' : ''
  return `${sign}${delta}${suffix} vs semana anterior`
}

function renderTopHotLeads(leads: TopHotLead[]): string {
  if (leads.length === 0) return ''

  const cards = leads
    .map((lead, idx) => {
      const contactBits: string[] = []
      if (lead.phone) {
        contactBits.push(
          `<a href="tel:${escapeHtml(lead.phone)}" style="color:#06b6d4; text-decoration:none;">${escapeHtml(lead.phone)}</a>`,
        )
      }
      if (lead.email) {
        contactBits.push(
          `<a href="mailto:${escapeHtml(lead.email)}" style="color:#06b6d4; text-decoration:none;">${escapeHtml(lead.email)}</a>`,
        )
      }
      const contactLine =
        contactBits.length > 0
          ? `<p style="margin:0 0 8px; font-size:13px; color:#a1a1aa;">${contactBits.join(' · ')}</p>`
          : ''

      const whatLine = lead.whatTheyWant
        ? `<p style="margin:0 0 6px; font-size:13px; color:#e4e4e7; line-height:1.5;"><span style="color:#71717a;">Pidió:</span> ${escapeHtml(lead.whatTheyWant)}</p>`
        : ''

      const reasonsLine =
        lead.reasons.length > 0
          ? `<p style="margin:0; font-size:12px; color:#71717a; line-height:1.5;"><span style="color:#52525b;">Por qué:</span> ${lead.reasons.map(escapeHtml).join(' · ')}</p>`
          : ''

      return `
        <tr><td style="padding:${idx === 0 ? '0' : '12px'} 0 0;">
          <div style="background:#0f0f12; border:1px solid #27272a; border-radius:14px; padding:16px;">
            <table cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td style="padding-bottom:8px;">
                  <span style="display:inline-block; font-size:10px; letter-spacing:0.18em; text-transform:uppercase; font-weight:600; color:${lead.heatAccent};">
                    ${escapeHtml(lead.heatLabel)}
                  </span>
                  <span style="display:inline-block; margin-left:8px; font-size:14px; font-weight:600; color:#fafafa;">
                    ${escapeHtml(lead.name)}
                  </span>
                </td>
              </tr>
            </table>
            ${contactLine}
            ${whatLine}
            ${reasonsLine}
          </div>
        </td></tr>`
    })
    .join('')

  return `
          <tr><td style="padding-bottom:24px;">
            <p style="margin:0 0 12px; font-size:11px; letter-spacing:0.24em; text-transform:uppercase; color:#71717a;">
              Tus 3 leads más calientes de la semana
            </p>
            <table cellpadding="0" cellspacing="0" width="100%">
              ${cards}
            </table>
          </td></tr>`
}

function renderTopHotLeadsText(leads: TopHotLead[]): string {
  if (leads.length === 0) return ''
  const lines: string[] = ['', 'Tus 3 leads más calientes de la semana:']
  leads.forEach((lead, idx) => {
    lines.push('')
    lines.push(`${idx + 1}. ${lead.heatLabel} — ${lead.name}`)
    const contact = [lead.phone, lead.email].filter((v): v is string => Boolean(v)).join(' · ')
    if (contact) lines.push(`   ${contact}`)
    if (lead.whatTheyWant) lines.push(`   Pidió: ${lead.whatTheyWant}`)
    if (lead.reasons.length > 0) lines.push(`   Por qué: ${lead.reasons.join(' · ')}`)
  })
  return lines.join('\n')
}

function metricCard(opts: {
  label: string
  value: string
  accentColor: string
  delta: number | null
  deltaSuffix: string
  invertColor?: boolean
}): string {
  const dColor = deltaColor(opts.delta, opts.invertColor)
  const dIcon = deltaIcon(opts.delta)
  return `
    <div style="background:#18181b; border-radius:16px; padding:20px;">
      <p style="margin:0; font-size:10px; letter-spacing:0.24em; text-transform:uppercase; color:#71717a;">${escapeHtml(opts.label)}</p>
      <p style="margin:8px 0 4px; font-size:32px; font-weight:600; color:${opts.accentColor};">${escapeHtml(opts.value)}</p>
      <p style="margin:0; font-size:12px; color:${dColor};">
        ${dIcon ? `${dIcon} ` : ''}${escapeHtml(formatDelta(opts.delta, opts.deltaSuffix))}
      </p>
    </div>`
}

export function executiveWeeklyEmail(input: ExecutiveWeeklyEmailInput): {
  subject: string
  htmlContent: string
  textContent: string
} {
  const greeting = input.recipientName
    ? `Hola ${escapeHtml(input.recipientName)},`
    : 'Hola,'

  const subject = `Tu semana en ${input.companyName}`

  const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0; padding:0; background:#09090b; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; color:#fafafa;">
  <table cellpadding="0" cellspacing="0" width="100%" style="background:#09090b; padding:24px 16px;">
    <tr>
      <td align="center">
        <table cellpadding="0" cellspacing="0" width="100%" style="max-width:540px;">

          <!-- Header -->
          <tr><td style="padding-bottom:24px;">
            <p style="margin:0; font-size:11px; letter-spacing:0.24em; text-transform:uppercase; color:#71717a;">
              develOP · ${escapeHtml(input.weekLabel)}
            </p>
            <h1 style="margin:8px 0 0; font-size:24px; font-weight:600; color:#fafafa;">
              Tu semana en ${escapeHtml(input.companyName)}
            </h1>
          </td></tr>

          <!-- Greeting + Brief -->
          <tr><td style="padding-bottom:24px;">
            <div style="background:#18181b; border-radius:16px; padding:24px;">
              <p style="margin:0 0 12px; font-size:14px; color:#a1a1aa;">
                ${greeting}
              </p>
              <p style="margin:0; font-size:16px; line-height:1.6; color:#fafafa;">
                ${escapeHtml(input.briefText)}
              </p>
            </div>
          </td></tr>

          <!-- Metrics grid -->
          <tr><td style="padding-bottom:12px;">
            <table cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td width="50%" style="padding:0 6px 12px 0;" valign="top">
                  ${metricCard({
                    label: 'Health Score',
                    value: `${input.health.total}/100`,
                    accentColor: '#a78bfa',
                    delta: input.health.deltaVsLastWeek,
                    deltaSuffix: ' pts',
                  })}
                </td>
                <td width="50%" style="padding:0 0 12px 6px;" valign="top">
                  ${metricCard({
                    label: 'Leads',
                    value: String(input.leads.value),
                    accentColor: '#10b981',
                    delta: input.leads.deltaPercent,
                    deltaSuffix: '%',
                  })}
                </td>
              </tr>
              <tr>
                <td width="50%" style="padding:0 6px 0 0;" valign="top">
                  ${metricCard({
                    label: 'Conversaciones',
                    value: String(input.messagesAnswered.value),
                    accentColor: '#06b6d4',
                    delta: input.messagesAnswered.deltaPercent,
                    deltaSuffix: '%',
                  })}
                </td>
                <td width="50%" style="padding:0 0 0 6px;" valign="top">
                  ${metricCard({
                    label: 'Tareas',
                    value: String(input.tasksCompleted.value),
                    accentColor: '#f59e0b',
                    delta: input.tasksCompleted.deltaPercent,
                    deltaSuffix: '%',
                  })}
                </td>
              </tr>
            </table>
          </td></tr>

          ${renderTopHotLeads(input.topHotLeads ?? [])}

          <!-- CTA -->
          <tr><td style="padding:12px 0 24px; text-align:center;">
            <a href="${escapeHtml(input.dashboardUrl)}" style="display:inline-block; background:#06b6d4; color:#09090b; padding:14px 32px; border-radius:12px; text-decoration:none; font-weight:600; font-size:14px;">
              Ver el detalle en mi panel
            </a>
          </td></tr>

          <!-- Footer -->
          <tr><td style="padding-top:24px; border-top:1px solid #27272a;">
            <p style="margin:0 0 8px; font-size:12px; color:#71717a; text-align:center; line-height:1.6;">
              Este resumen llega cada lunes con lo que pasó la semana anterior en tu negocio.
            </p>
            <p style="margin:0; font-size:12px; color:#71717a; text-align:center; line-height:1.6;">
              <a href="${escapeHtml(input.unsubscribeUrl)}" style="color:#71717a; text-decoration:underline;">Dejar de recibir este reporte</a>
            </p>
          </td></tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

  // Versión plain-text para clientes que no renderizan HTML o filtros antispam.
  const textLines = [
    `develOP · ${input.weekLabel}`,
    `Tu semana en ${input.companyName}`,
    '',
    input.recipientName ? `Hola ${input.recipientName},` : 'Hola,',
    '',
    input.briefText,
    '',
    `Health Score: ${input.health.total}/100 (${formatDelta(input.health.deltaVsLastWeek, ' pts')})`,
    `Leads: ${input.leads.value} (${formatDelta(input.leads.deltaPercent, '%')})`,
    `Conversaciones: ${input.messagesAnswered.value} (${formatDelta(input.messagesAnswered.deltaPercent, '%')})`,
    `Tareas: ${input.tasksCompleted.value} (${formatDelta(input.tasksCompleted.deltaPercent, '%')})`,
    renderTopHotLeadsText(input.topHotLeads ?? []),
    '',
    `Ver el detalle: ${input.dashboardUrl}`,
    '',
    `Dejar de recibir: ${input.unsubscribeUrl}`,
  ]
  const textContent = textLines.join('\n')

  return { subject, htmlContent, textContent }
}
