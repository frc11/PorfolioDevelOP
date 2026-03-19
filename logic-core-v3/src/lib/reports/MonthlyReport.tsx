import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import type { AnalyticsData } from '@/lib/analytics'
import type { SearchConsoleData } from '@/lib/searchconsole'

// ─── Data types ───────────────────────────────────────────────────────────────

export interface ReportProject {
  name: string
  status: string
  totalTasks: number
  doneTasks: number
}

export interface ReportService {
  type: string
  status: string
}

export interface MonthlyReportData {
  companyName: string
  month: string // "YYYY-MM"
  analytics: AnalyticsData | null
  searchConsole: SearchConsoleData | null
  project: ReportProject | null
  services: ReportService[]
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CYAN = '#06b6d4'
const BLACK = '#18181b'
const GRAY = '#71717a'
const LIGHT_BG = '#f4f4f5'
const BORDER = '#e4e4e7'
const WHITE = '#ffffff'

const MONTHS_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

const SERVICE_TYPE_LABEL: Record<string, string> = {
  WEB_DEV: 'Desarrollo Web',
  AI: 'Inteligencia Artificial',
  AUTOMATION: 'Automatización',
  SOFTWARE: 'Software a Medida',
}

const PROJECT_STATUS_LABEL: Record<string, string> = {
  PLANNING: 'Planificación',
  IN_PROGRESS: 'En curso',
  REVIEW: 'En revisión',
  COMPLETED: 'Completado',
}

function formatMonth(yyyyMM: string): string {
  const [year, month] = yyyyMM.split('-')
  return `${MONTHS_ES[parseInt(month) - 1]} ${year}`
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return s > 0 ? `${m}m ${s}s` : `${m}m`
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  // Page
  page: {
    fontFamily: 'Helvetica',
    backgroundColor: WHITE,
    paddingTop: 0,
    paddingBottom: 48,
    paddingHorizontal: 0,
    fontSize: 10,
    color: BLACK,
  },

  // Cover
  cover: {
    backgroundColor: BLACK,
    padding: 48,
    minHeight: 200,
  },
  coverBrand: {
    fontSize: 11,
    color: CYAN,
    letterSpacing: 3,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    marginBottom: 40,
  },
  coverTitle: {
    fontSize: 28,
    color: WHITE,
    fontFamily: 'Helvetica-Bold',
    lineHeight: 1.2,
    marginBottom: 8,
  },
  coverSub: {
    fontSize: 13,
    color: '#a1a1aa',
    marginBottom: 4,
  },
  coverMonth: {
    fontSize: 13,
    color: CYAN,
    fontFamily: 'Helvetica-Bold',
  },
  coverBar: {
    marginTop: 40,
    height: 3,
    width: 48,
    backgroundColor: CYAN,
    borderRadius: 2,
  },

  // Content wrapper
  content: {
    paddingHorizontal: 48,
    paddingTop: 36,
  },

  // Section
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  sectionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: CYAN,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: BLACK,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  // Cards grid
  cardRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  card: {
    flex: 1,
    backgroundColor: LIGHT_BG,
    borderRadius: 6,
    padding: 12,
  },
  cardLabel: {
    fontSize: 8,
    color: GRAY,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: CYAN,
    lineHeight: 1,
  },
  cardSub: {
    fontSize: 8,
    color: GRAY,
    marginTop: 2,
  },

  // Table
  table: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 6,
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  tableRowLast: {
    borderBottomWidth: 0,
  },
  tableRowAlt: {
    backgroundColor: LIGHT_BG,
  },
  tableHead: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: GRAY,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableCell: {
    fontSize: 9,
    color: BLACK,
  },
  tableCellRight: {
    fontSize: 9,
    color: GRAY,
    textAlign: 'right',
  },

  // Bullets
  bullet: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  bulletDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: CYAN,
    marginTop: 4,
    marginRight: 10,
    flexShrink: 0,
  },
  bulletText: {
    fontSize: 10,
    color: BLACK,
    lineHeight: 1.5,
    flex: 1,
  },

  // Progress bar
  progressOuter: {
    height: 6,
    backgroundColor: BORDER,
    borderRadius: 3,
    marginTop: 8,
    marginBottom: 4,
  },
  progressInner: {
    height: 6,
    backgroundColor: CYAN,
    borderRadius: 3,
  },
  progressLabel: {
    fontSize: 8,
    color: GRAY,
    textAlign: 'right',
  },

  // Service pill
  pill: {
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
    backgroundColor: LIGHT_BG,
    marginRight: 6,
    marginBottom: 6,
  },
  pillText: {
    fontSize: 9,
    color: BLACK,
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 48,
    right: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: BORDER,
    paddingTop: 8,
  },
  footerText: {
    fontSize: 8,
    color: GRAY,
  },
  footerCyan: {
    fontSize: 8,
    color: CYAN,
  },
})

// ─── Helper components ────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={s.section}>
      <View style={s.sectionHeader}>
        <View style={s.sectionDot} />
        <Text style={s.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  )
}

function MetricCards({
  items,
}: {
  items: Array<{ label: string; value: string; sub?: string }>
}) {
  // Split into rows of max 4
  const rows: typeof items[] = []
  for (let i = 0; i < items.length; i += 4) {
    rows.push(items.slice(i, i + 4))
  }
  return (
    <>
      {rows.map((row, ri) => (
        <View style={s.cardRow} key={ri}>
          {row.map(({ label, value, sub }) => (
            <View style={s.card} key={label}>
              <Text style={s.cardLabel}>{label}</Text>
              <Text style={s.cardValue}>{value}</Text>
              {sub && <Text style={s.cardSub}>{sub}</Text>}
            </View>
          ))}
        </View>
      ))}
    </>
  )
}

// ─── Executive summary generator ─────────────────────────────────────────────

function buildSummaryBullets(data: MonthlyReportData): string[] {
  const bullets: string[] = []

  if (data.analytics) {
    const a = data.analytics
    bullets.push(
      `Tu sitio web recibió ${a.sessions.toLocaleString('es-AR')} visitas este mes, con ${a.activeUsers.toLocaleString('es-AR')} usuarios activos.`
    )
  }

  if (data.searchConsole) {
    const sc = data.searchConsole
    bullets.push(
      `Tu sitio apareció ${sc.totalImpressions.toLocaleString('es-AR')} veces en los resultados de Google, generando ${sc.totalClicks.toLocaleString('es-AR')} visitas directas. Posición promedio: #${sc.avgPosition}.`
    )
  }

  if (data.project) {
    const p = data.project
    const pct =
      p.totalTasks > 0 ? Math.round((p.doneTasks / p.totalTasks) * 100) : 0
    bullets.push(
      `Tu proyecto "${p.name}" está en estado ${PROJECT_STATUS_LABEL[p.status] ?? p.status} con un ${pct}% de avance (${p.doneTasks} de ${p.totalTasks} tareas completadas).`
    )
  }

  const activeServices = data.services.filter((s) => s.status === 'ACTIVE')
  if (activeServices.length > 0) {
    const names = activeServices.map((s) => SERVICE_TYPE_LABEL[s.type] ?? s.type)
    bullets.push(
      `Tenés ${activeServices.length} servicio${activeServices.length !== 1 ? 's' : ''} activo${activeServices.length !== 1 ? 's' : ''} con develOP: ${names.join(', ')}.`
    )
  }

  if (bullets.length === 0) {
    bullets.push('Este es tu reporte mensual de develOP. Próximamente encontrarás aquí métricas de tu sitio, posicionamiento y avance de tu proyecto.')
  }

  return bullets
}

// ─── PDF Document ─────────────────────────────────────────────────────────────

export function MonthlyReport({ data }: { data: MonthlyReportData }) {
  const bullets = buildSummaryBullets(data)
  const monthLabel = formatMonth(data.month)
  const activeServices = data.services.filter((s) => s.status === 'ACTIVE')

  return (
    <Document
      title={`Reporte mensual ${monthLabel} — ${data.companyName}`}
      author="develOP"
      creator="develOP"
    >
      <Page size="A4" style={s.page}>
        {/* ── Cover ── */}
        <View style={s.cover}>
          <Text style={s.coverBrand}>develOP</Text>
          <Text style={s.coverTitle}>{data.companyName}</Text>
          <Text style={s.coverSub}>Reporte mensual</Text>
          <Text style={s.coverMonth}>{monthLabel}</Text>
          <View style={s.coverBar} />
        </View>

        <View style={s.content}>
          {/* ── Executive Summary ── */}
          <Section title="Resumen ejecutivo">
            {bullets.map((bullet, i) => (
              <View style={s.bullet} key={i}>
                <View style={s.bulletDot} />
                <Text style={s.bulletText}>{bullet}</Text>
              </View>
            ))}
          </Section>

          {/* ── Analytics ── */}
          {data.analytics && (
            <Section title="Tu sitio web">
              <MetricCards
                items={[
                  {
                    label: 'Sesiones',
                    value: data.analytics.sessions.toLocaleString('es-AR'),
                    sub: 'visitas totales',
                  },
                  {
                    label: 'Usuarios activos',
                    value: data.analytics.activeUsers.toLocaleString('es-AR'),
                  },
                  {
                    label: 'Rebote',
                    value: `${data.analytics.bounceRate}%`,
                    sub: 'tasa de rebote',
                  },
                  {
                    label: 'Duración promedio',
                    value: formatDuration(data.analytics.avgSessionDurationSec),
                    sub: 'por sesión',
                  },
                ]}
              />

              {data.analytics.topPages.length > 0 && (
                <>
                  <Text style={[s.cardLabel, { marginBottom: 6, marginTop: 4 }]}>
                    Páginas más visitadas
                  </Text>
                  <View style={s.table}>
                    {data.analytics.topPages.slice(0, 3).map((page, i) => (
                      <View
                        key={i}
                        style={[
                          s.tableRow,
                          i % 2 === 1 ? s.tableRowAlt : {},
                          i === Math.min(2, data.analytics!.topPages.length - 1)
                            ? s.tableRowLast
                            : {},
                        ]}
                      >
                        <Text style={[s.tableCell, { flex: 1 }]}>{page.page}</Text>
                        <Text style={[s.tableCellRight, { width: 60 }]}>
                          {page.sessions.toLocaleString('es-AR')} sesiones
                        </Text>
                      </View>
                    ))}
                  </View>
                </>
              )}
            </Section>
          )}

          {/* ── Search Console ── */}
          {data.searchConsole && (
            <Section title="Posicionamiento en Google">
              <MetricCards
                items={[
                  {
                    label: 'Clicks',
                    value: data.searchConsole.totalClicks.toLocaleString('es-AR'),
                    sub: 'visitas desde Google',
                  },
                  {
                    label: 'Impresiones',
                    value: data.searchConsole.totalImpressions.toLocaleString('es-AR'),
                    sub: 'veces mostrado',
                  },
                  {
                    label: 'CTR',
                    value: `${data.searchConsole.avgCtr}%`,
                    sub: 'tasa de clic',
                  },
                  {
                    label: 'Posición',
                    value:
                      data.searchConsole.avgPosition > 0
                        ? `#${data.searchConsole.avgPosition}`
                        : '—',
                    sub: 'promedio en resultados',
                  },
                ]}
              />

              {data.searchConsole.topQueries.length > 0 && (
                <>
                  <Text style={[s.cardLabel, { marginBottom: 6, marginTop: 4 }]}>
                    Top palabras clave
                  </Text>
                  <View style={s.table}>
                    {/* Header */}
                    <View style={[s.tableRow, { backgroundColor: LIGHT_BG }]}>
                      <Text style={[s.tableHead, { flex: 1 }]}>Consulta</Text>
                      <Text style={[s.tableHead, { width: 44, textAlign: 'right' }]}>
                        Clicks
                      </Text>
                      <Text style={[s.tableHead, { width: 60, textAlign: 'right' }]}>
                        Impr.
                      </Text>
                      <Text style={[s.tableHead, { width: 44, textAlign: 'right' }]}>
                        Pos.
                      </Text>
                    </View>
                    {data.searchConsole.topQueries.slice(0, 5).map((q, i) => (
                      <View
                        key={i}
                        style={[
                          s.tableRow,
                          i % 2 === 0 ? {} : s.tableRowAlt,
                          i === Math.min(4, data.searchConsole!.topQueries.length - 1)
                            ? s.tableRowLast
                            : {},
                        ]}
                      >
                        <Text style={[s.tableCell, { flex: 1 }]}>{q.query}</Text>
                        <Text style={[s.tableCellRight, { width: 44 }]}>
                          {q.clicks}
                        </Text>
                        <Text style={[s.tableCellRight, { width: 60 }]}>
                          {q.impressions}
                        </Text>
                        <Text style={[s.tableCellRight, { width: 44 }]}>
                          #{q.position}
                        </Text>
                      </View>
                    ))}
                  </View>
                </>
              )}
            </Section>
          )}

          {/* ── Project ── */}
          {data.project && (
            <Section title="Estado del proyecto">
              <View style={s.cardRow}>
                <View style={[s.card, { flex: 2 }]}>
                  <Text style={s.cardLabel}>Proyecto</Text>
                  <Text
                    style={[
                      s.tableCell,
                      { fontSize: 12, fontFamily: 'Helvetica-Bold', marginBottom: 2 },
                    ]}
                  >
                    {data.project.name}
                  </Text>
                  <Text style={s.cardSub}>
                    {PROJECT_STATUS_LABEL[data.project.status] ?? data.project.status}
                  </Text>
                </View>
                <View style={s.card}>
                  <Text style={s.cardLabel}>Avance</Text>
                  <Text style={s.cardValue}>
                    {data.project.totalTasks > 0
                      ? `${Math.round((data.project.doneTasks / data.project.totalTasks) * 100)}%`
                      : '—'}
                  </Text>
                  <Text style={s.cardSub}>
                    {data.project.doneTasks}/{data.project.totalTasks} tareas
                  </Text>
                </View>
              </View>
              {data.project.totalTasks > 0 && (
                <>
                  <View style={s.progressOuter}>
                    <View
                      style={[
                        s.progressInner,
                        {
                          width: `${Math.round(
                            (data.project.doneTasks / data.project.totalTasks) * 100
                          )}%`,
                        },
                      ]}
                    />
                  </View>
                  <Text style={s.progressLabel}>
                    {Math.round(
                      (data.project.doneTasks / data.project.totalTasks) * 100
                    )}
                    % completado
                  </Text>
                </>
              )}
            </Section>
          )}

          {/* ── Services ── */}
          {activeServices.length > 0 && (
            <Section title="Servicios activos">
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {activeServices.map((svc, i) => (
                  <View style={s.pill} key={i}>
                    <Text style={s.pillText}>
                      {SERVICE_TYPE_LABEL[svc.type] ?? svc.type}
                    </Text>
                  </View>
                ))}
              </View>
            </Section>
          )}
        </View>

        {/* ── Footer ── */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>
            Reporte generado por develOP • develop.com.ar
          </Text>
          <Text style={s.footerCyan}>contacto@develop.com.ar</Text>
        </View>
      </Page>
    </Document>
  )
}
