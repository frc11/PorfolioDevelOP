import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import type { AnalyticsData } from '@/lib/analytics'
import type { SearchConsoleData } from '@/lib/searchconsole'

// ─── Types ────────────────────────────────────────────────────────────────────

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

const SERVICE_LABEL: Record<string, string> = {
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
  return `${MONTHS_ES[parseInt(month) - 1] ?? month} ${year}`
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return s > 0 ? `${m}m ${s}s` : `${m}m`
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    backgroundColor: WHITE,
    paddingBottom: 52,
    fontSize: 10,
    color: BLACK,
  },

  // Cover
  cover: {
    backgroundColor: BLACK,
    padding: 48,
    paddingBottom: 52,
  },
  coverBrand: {
    fontSize: 9,
    color: CYAN,
    letterSpacing: 4,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    marginBottom: 44,
  },
  coverCompany: {
    fontSize: 26,
    color: WHITE,
    fontFamily: 'Helvetica-Bold',
    lineHeight: 1.25,
    marginBottom: 10,
  },
  coverSub: {
    fontSize: 12,
    color: '#a1a1aa',
    marginBottom: 4,
  },
  coverMonth: {
    fontSize: 14,
    color: CYAN,
    fontFamily: 'Helvetica-Bold',
  },
  coverAccent: {
    marginTop: 44,
    height: 3,
    width: 40,
    backgroundColor: CYAN,
    borderRadius: 2,
  },

  // Body
  body: {
    paddingHorizontal: 48,
    paddingTop: 36,
  },

  // Section
  section: { marginBottom: 30 },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
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
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: BLACK,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  // Metric cards
  cardRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  card: {
    flex: 1,
    backgroundColor: LIGHT_BG,
    borderRadius: 6,
    padding: 12,
  },
  cardLabel: {
    fontSize: 7,
    color: GRAY,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 5,
  },
  cardValue: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    color: CYAN,
    lineHeight: 1,
    marginBottom: 2,
  },
  cardSub: { fontSize: 7.5, color: GRAY },

  // Table
  table: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 6,
    overflow: 'hidden',
    marginTop: 8,
  },
  tableHead: {
    flexDirection: 'row',
    backgroundColor: LIGHT_BG,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  tableHeadCell: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: GRAY,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  tableRowLast: { borderBottomWidth: 0 },
  tableRowAlt: { backgroundColor: '#fafafa' },
  tableCell: { fontSize: 9, color: BLACK },
  tableCellMuted: { fontSize: 9, color: GRAY, textAlign: 'right' },

  // Bullet list
  bullet: { flexDirection: 'row', marginBottom: 9, alignItems: 'flex-start' },
  bulletDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: CYAN,
    marginTop: 4.5,
    marginRight: 10,
    flexShrink: 0,
  },
  bulletText: { fontSize: 10, color: BLACK, lineHeight: 1.55, flex: 1 },

  // Progress
  progressOuter: {
    height: 6,
    backgroundColor: BORDER,
    borderRadius: 3,
    marginTop: 10,
    marginBottom: 3,
  },
  progressInner: { height: 6, backgroundColor: CYAN, borderRadius: 3 },
  progressLabel: { fontSize: 8, color: GRAY, textAlign: 'right' },

  // Service pills
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  pill: {
    backgroundColor: LIGHT_BG,
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  pillText: { fontSize: 9, color: BLACK },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 18,
    left: 48,
    right: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: BORDER,
    paddingTop: 8,
  },
  footerLeft: { fontSize: 7.5, color: GRAY },
  footerRight: { fontSize: 7.5, color: CYAN },
})

// ─── Helpers ─────────────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={s.section}>
      <View style={s.sectionHead}>
        <View style={s.sectionDot} />
        <Text style={s.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  )
}

function CardRow({
  items,
}: {
  items: Array<{ label: string; value: string; sub?: string }>
}) {
  return (
    <View style={s.cardRow}>
      {items.map(({ label, value, sub }) => (
        <View style={s.card} key={label}>
          <Text style={s.cardLabel}>{label}</Text>
          <Text style={s.cardValue}>{value}</Text>
          {sub ? <Text style={s.cardSub}>{sub}</Text> : null}
        </View>
      ))}
    </View>
  )
}

// ─── Executive bullets ────────────────────────────────────────────────────────

function buildBullets(data: MonthlyReportData): string[] {
  const out: string[] = []

  if (data.analytics) {
    const a = data.analytics
    out.push(
      `Tu sitio recibió ${a.sessions.toLocaleString('es-AR')} visitas este mes con ${a.activeUsers.toLocaleString('es-AR')} usuarios activos. La duración promedio por sesión fue de ${formatDuration(a.avgSessionDurationSec)}.`
    )
  }

  if (data.searchConsole) {
    const sc = data.searchConsole
    out.push(
      `Tu sitio apareció ${sc.totalImpressions.toLocaleString('es-AR')} veces en los resultados de Google, generando ${sc.totalClicks.toLocaleString('es-AR')} visitas directas${sc.avgPosition > 0 ? ` con una posición promedio de #${sc.avgPosition}` : ''}.`
    )
  }

  if (data.project) {
    const p = data.project
    const pct = p.totalTasks > 0 ? Math.round((p.doneTasks / p.totalTasks) * 100) : 0
    out.push(
      `Tu proyecto "${p.name}" está ${pct > 0 ? `${pct}% completado` : 'iniciando'} (${p.doneTasks} de ${p.totalTasks} tareas finalizadas) y se encuentra en estado ${PROJECT_STATUS_LABEL[p.status] ?? p.status}.`
    )
  }

  const active = data.services.filter((s) => s.status === 'ACTIVE')
  if (active.length > 0) {
    const names = active.map((s) => SERVICE_LABEL[s.type] ?? s.type).join(', ')
    out.push(
      `Servicios activos con develOP: ${names}.`
    )
  }

  if (out.length === 0) {
    out.push('Tu portal está en configuración. Pronto verás aquí un resumen completo del rendimiento de tu sitio, posicionamiento en Google y avance del proyecto.')
  }

  return out
}

// ─── PDF Document ─────────────────────────────────────────────────────────────

export function MonthlyReport({ data }: { data: MonthlyReportData }) {
  const bullets = buildBullets(data)
  const monthLabel = formatMonth(data.month)
  const activeServices = data.services.filter((s) => s.status === 'ACTIVE')

  return (
    <Document
      title={`Reporte ${monthLabel} — ${data.companyName}`}
      author="develOP"
      creator="develOP"
    >
      <Page size="A4" style={s.page}>

        {/* Cover */}
        <View style={s.cover}>
          <Text style={s.coverBrand}>develOP</Text>
          <Text style={s.coverCompany}>{data.companyName}</Text>
          <Text style={s.coverSub}>Reporte mensual</Text>
          <Text style={s.coverMonth}>{monthLabel}</Text>
          <View style={s.coverAccent} />
        </View>

        <View style={s.body}>

          {/* Executive summary */}
          <Section title="Resumen ejecutivo">
            {bullets.map((b, i) => (
              <View style={s.bullet} key={i}>
                <View style={s.bulletDot} />
                <Text style={s.bulletText}>{b}</Text>
              </View>
            ))}
          </Section>

          {/* Analytics */}
          {data.analytics && (() => {
            const a = data.analytics!
            return (
              <Section title="Tu sitio web">
                <CardRow items={[
                  { label: 'Sesiones', value: a.sessions.toLocaleString('es-AR'), sub: 'visitas totales' },
                  { label: 'Usuarios activos', value: a.activeUsers.toLocaleString('es-AR') },
                  { label: 'Tasa de rebote', value: `${a.bounceRate}%` },
                  { label: 'Duración promedio', value: formatDuration(a.avgSessionDurationSec), sub: 'por sesión' },
                ]} />

                {a.topPages.length > 0 && (
                  <>
                    <Text style={[s.cardLabel, { marginTop: 6, marginBottom: 0 }]}>
                      Páginas más visitadas
                    </Text>
                    <View style={s.table}>
                      {a.topPages.slice(0, 3).map((p, i) => (
                        <View
                          key={i}
                          style={[
                            s.tableRow,
                            i % 2 !== 0 ? s.tableRowAlt : {},
                            i === Math.min(2, a.topPages.length - 1) ? s.tableRowLast : {},
                          ]}
                        >
                          <Text style={[s.tableCell, { flex: 1 }]}>{p.page}</Text>
                          <Text style={[s.tableCellMuted, { width: 72 }]}>
                            {p.sessions.toLocaleString('es-AR')} sesiones
                          </Text>
                        </View>
                      ))}
                    </View>
                  </>
                )}
              </Section>
            )
          })()}

          {/* Search Console */}
          {data.searchConsole && (() => {
            const sc = data.searchConsole!
            return (
              <Section title="Posicionamiento en Google">
                <CardRow items={[
                  { label: 'Clicks', value: sc.totalClicks.toLocaleString('es-AR'), sub: 'desde Google' },
                  { label: 'Impresiones', value: sc.totalImpressions.toLocaleString('es-AR'), sub: 'veces mostrado' },
                  { label: 'CTR', value: `${sc.avgCtr}%`, sub: 'tasa de clic' },
                  { label: 'Posición promedio', value: sc.avgPosition > 0 ? `#${sc.avgPosition}` : '—', sub: 'menor es mejor' },
                ]} />

                {sc.topQueries.length > 0 && (
                  <>
                    <Text style={[s.cardLabel, { marginTop: 6, marginBottom: 0 }]}>
                      Top palabras clave
                    </Text>
                    <View style={s.table}>
                      <View style={s.tableHead}>
                        <Text style={[s.tableHeadCell, { flex: 1 }]}>Consulta</Text>
                        <Text style={[s.tableHeadCell, { width: 44, textAlign: 'right' }]}>Clicks</Text>
                        <Text style={[s.tableHeadCell, { width: 60, textAlign: 'right' }]}>Impr.</Text>
                        <Text style={[s.tableHeadCell, { width: 44, textAlign: 'right' }]}>Pos.</Text>
                      </View>
                      {sc.topQueries.slice(0, 5).map((q, i) => (
                        <View
                          key={i}
                          style={[
                            s.tableRow,
                            i % 2 !== 0 ? s.tableRowAlt : {},
                            i === Math.min(4, sc.topQueries.length - 1) ? s.tableRowLast : {},
                          ]}
                        >
                          <Text style={[s.tableCell, { flex: 1 }]}>{q.query}</Text>
                          <Text style={[s.tableCellMuted, { width: 44 }]}>{q.clicks}</Text>
                          <Text style={[s.tableCellMuted, { width: 60 }]}>{q.impressions}</Text>
                          <Text style={[s.tableCellMuted, { width: 44 }]}>#{q.position}</Text>
                        </View>
                      ))}
                    </View>
                  </>
                )}
              </Section>
            )
          })()}

          {/* Project */}
          {data.project && (() => {
            const p = data.project!
            const pct = p.totalTasks > 0
              ? Math.round((p.doneTasks / p.totalTasks) * 100)
              : 0
            return (
              <Section title="Estado del proyecto">
                <View style={s.cardRow}>
                  <View style={[s.card, { flex: 2 }]}>
                    <Text style={s.cardLabel}>Proyecto</Text>
                    <Text style={[s.tableCell, { fontSize: 13, fontFamily: 'Helvetica-Bold', marginBottom: 3 }]}>
                      {p.name}
                    </Text>
                    <Text style={s.cardSub}>
                      {PROJECT_STATUS_LABEL[p.status] ?? p.status}
                    </Text>
                  </View>
                  <View style={s.card}>
                    <Text style={s.cardLabel}>Avance</Text>
                    <Text style={s.cardValue}>
                      {p.totalTasks > 0 ? `${pct}%` : '—'}
                    </Text>
                    <Text style={s.cardSub}>
                      {p.doneTasks}/{p.totalTasks} tareas
                    </Text>
                  </View>
                </View>

                {p.totalTasks > 0 && (
                  <>
                    <View style={s.progressOuter}>
                      <View style={[s.progressInner, { width: `${pct}%` }]} />
                    </View>
                    <Text style={s.progressLabel}>{pct}% completado</Text>
                  </>
                )}
              </Section>
            )
          })()}

          {/* Active services */}
          {activeServices.length > 0 && (
            <Section title="Servicios activos">
              <View style={s.pillRow}>
                {activeServices.map((svc, i) => (
                  <View style={s.pill} key={i}>
                    <Text style={s.pillText}>{SERVICE_LABEL[svc.type] ?? svc.type}</Text>
                  </View>
                ))}
              </View>
            </Section>
          )}

        </View>

        {/* Footer */}
        <View style={s.footer} fixed>
          <Text style={s.footerLeft}>
            Reporte generado por develOP • develop.com.ar
          </Text>
          <Text style={s.footerRight}>contacto@develop.com.ar</Text>
        </View>

      </Page>
    </Document>
  )
}
