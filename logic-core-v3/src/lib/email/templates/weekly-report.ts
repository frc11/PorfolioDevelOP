import type { WeeklyReportData } from '@/modules/chatbot/server/reports/buildWeeklyReport'

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function formatDate(d: Date): string {
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })
}

function deltaIcon(delta: number): string {
  if (delta > 0) return '↑'
  if (delta < 0) return '↓'
  return '→'
}

function deltaColor(delta: number): string {
  return delta >= 0 ? '#10b981' : '#f43f5e'
}

export function weeklyReportEmail(data: WeeklyReportData & { dashboardUrl: string }): {
  subject: string
  htmlContent: string
} {
  const leadsHtml =
    data.leads.capturedItems.length > 0
      ? `
          <tr><td style="padding-bottom:24px;">
            <div style="background:#18181b; border-radius:16px; padding:20px;">
              <p style="margin:0 0 12px; font-size:11px; letter-spacing:0.24em; text-transform:uppercase; color:#71717a;">
                Leads capturados
              </p>
              ${data.leads.capturedItems
                .map(
                  (lead) => `
              <p style="margin:0 0 6px; font-size:13px; color:#e4e4e7;">
                ${escapeHtml(lead.name ?? 'Anónimo')}
                <span style="color:#71717a; font-size:11px;">
                  · ${formatDate(lead.date)}
                </span>
              </p>`,
                )
                .join('')}
            </div>
          </td></tr>`
      : ''

  const topQueriesHtml =
    data.topQueries.length > 0
      ? `
          <tr><td style="padding-bottom:24px;">
            <div style="background:#18181b; border-radius:16px; padding:20px;">
              <p style="margin:0 0 12px; font-size:11px; letter-spacing:0.24em; text-transform:uppercase; color:#71717a;">
                Consultas frecuentes
              </p>
              ${data.topQueries
                .map(
                  (q) => `
              <p style="margin:0 0 6px; font-size:13px; color:#e4e4e7;">"${escapeHtml(q)}"</p>`,
                )
                .join('')}
            </div>
          </td></tr>`
      : ''

  return {
    subject: `Tu chatbot ${data.botName}: resumen de la semana`,
    htmlContent: `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Resumen semanal — ${escapeHtml(data.botName)}</title>
</head>
<body style="margin:0; padding:0; background:#09090b; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table cellpadding="0" cellspacing="0" width="100%" style="background:#09090b; padding:24px 16px;">
    <tr>
      <td align="center">
        <table cellpadding="0" cellspacing="0" width="100%" style="max-width:540px;">

          <!-- Header -->
          <tr><td style="padding-bottom:24px;">
            <p style="margin:0; font-size:11px; letter-spacing:0.24em; text-transform:uppercase; color:#71717a;">
              develOP · ${formatDate(data.weekStart)} – ${formatDate(data.weekEnd)}
            </p>
            <h1 style="margin:8px 0 0; font-size:24px; font-weight:600; color:#fafafa;">
              ${escapeHtml(data.botName)}
            </h1>
            <p style="margin:4px 0 0; font-size:14px; color:#a1a1aa;">
              ${escapeHtml(data.orgName)}
            </p>
          </td></tr>

          <!-- Summary -->
          <tr><td style="padding-bottom:24px;">
            <div style="background:#18181b; border-radius:16px; padding:20px;">
              <p style="margin:0; font-size:15px; line-height:1.6; color:#e4e4e7;">
                ${escapeHtml(data.summary)}
              </p>
            </div>
          </td></tr>

          <!-- Stats grid -->
          <tr><td style="padding-bottom:24px;">
            <table cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td width="50%" style="padding-right:8px;">
                  <div style="background:#18181b; border-radius:16px; padding:20px;">
                    <p style="margin:0; font-size:10px; letter-spacing:0.24em; text-transform:uppercase; color:#71717a;">Charlas</p>
                    <p style="margin:8px 0 4px; font-size:32px; font-weight:600; color:#06b6d4;">${data.conversations.total}</p>
                    <p style="margin:0; font-size:12px; color:${deltaColor(data.conversations.deltaFromPrevWeek)};">
                      ${deltaIcon(data.conversations.deltaFromPrevWeek)} ${Math.abs(data.conversations.deltaFromPrevWeek)}% vs semana anterior
                    </p>
                  </div>
                </td>
                <td width="50%" style="padding-left:8px;">
                  <div style="background:#18181b; border-radius:16px; padding:20px;">
                    <p style="margin:0; font-size:10px; letter-spacing:0.24em; text-transform:uppercase; color:#71717a;">Leads</p>
                    <p style="margin:8px 0 4px; font-size:32px; font-weight:600; color:#10b981;">${data.leads.total}</p>
                    <p style="margin:0; font-size:12px; color:${deltaColor(data.leads.deltaFromPrevWeek)};">
                      ${deltaIcon(data.leads.deltaFromPrevWeek)} ${Math.abs(data.leads.deltaFromPrevWeek)}%
                    </p>
                  </div>
                </td>
              </tr>
            </table>
          </td></tr>

          <!-- Response time -->
          ${
            data.responseTime.avgSeconds > 0
              ? `
          <tr><td style="padding-bottom:24px;">
            <div style="background:#18181b; border-radius:16px; padding:20px;">
              <p style="margin:0; font-size:10px; letter-spacing:0.24em; text-transform:uppercase; color:#71717a;">Tiempo de respuesta promedio</p>
              <p style="margin:8px 0 4px; font-size:28px; font-weight:600; color:#a78bfa;">${data.responseTime.avgSeconds}s</p>
              <p style="margin:0; font-size:12px; color:${deltaColor(-data.responseTime.deltaFromPrevWeek)};">
                ${deltaIcon(-data.responseTime.deltaFromPrevWeek)} ${Math.abs(data.responseTime.deltaFromPrevWeek)}% vs semana anterior
              </p>
            </div>
          </td></tr>`
              : ''
          }

          ${leadsHtml}
          ${topQueriesHtml}

          <!-- CTA -->
          <tr><td style="padding-bottom:24px; text-align:center;">
            <a href="${data.dashboardUrl}" style="display:inline-block; background:#06b6d4; color:#09090b; padding:14px 32px; border-radius:12px; text-decoration:none; font-weight:600; font-size:14px;">
              Ver todo en mi panel
            </a>
          </td></tr>

          <!-- Footer -->
          <tr><td style="padding-top:24px; border-top:1px solid #27272a;">
            <p style="margin:0; font-size:12px; color:#71717a; text-align:center;">
              Este reporte se envía cada lunes. Si querés dejar de recibirlo,
              <a href="${data.dashboardUrl}/preferences" style="color:#06b6d4; text-decoration:none;">cambiá tus preferencias</a>.
            </p>
          </td></tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  }
}
