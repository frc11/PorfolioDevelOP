/**
 * P2.C — "Descargá el informe del mes". Documento PDF (1-2 páginas) pensado
 * para que el dueño se lo reenvíe a un socio o contador: marca develOP sobria
 * (sin publicidad, sin cifras infladas), cero jerga técnica.
 *
 * Mismo lenguaje visual (StyleSheet) que `src/lib/reports/MonthlyReport.tsx`
 * (el motor de analytics/SEO ya existente) — NO se comparte código entre
 * ambos: dominios de contenido distintos, cero acoplamiento.
 *
 * Degradación honesta en 3 niveles, todos ya decididos por P0.2 (se reusan,
 * no se reinventan):
 *  - Sin bot (`hasBot: false`) → una sola página con el mensaje de activación.
 *  - Categorías con muestra insuficiente (`categories.sufficient === false`)
 *    → mensaje de calibrando, cero porcentajes que no dicen nada.
 *  - Mes con actividad real en cero (leads/conversaciones/embudo) → números
 *    reales en cero, con copy calmo — nunca se ocultan ni se disfrazan.
 */
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { formatDateAR } from '@/lib/dates-ar'
import type { ClientMonthlyReportData } from './monthly-report-data'

const CYAN = '#06b6d4'
const BLACK = '#18181b'
const GRAY = '#71717a'
const LIGHT_BG = '#f4f4f5'
const BORDER = '#e4e4e7'
const WHITE = '#ffffff'

const s = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    backgroundColor: WHITE,
    padding: 40,
    paddingBottom: 52,
    fontSize: 10,
    color: BLACK,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    paddingBottom: 16,
    marginBottom: 24,
  },
  brand: {
    fontSize: 9,
    color: CYAN,
    letterSpacing: 3,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  companyName: { fontSize: 18, color: BLACK, fontFamily: 'Helvetica-Bold' },
  headerRight: { alignItems: 'flex-end' },
  monthLabel: { fontSize: 12, color: CYAN, fontFamily: 'Helvetica-Bold', marginBottom: 3 },
  generatedAt: { fontSize: 8, color: GRAY },

  section: { marginBottom: 22 },
  sectionHead: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  sectionDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: CYAN, marginRight: 8 },
  sectionTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: BLACK,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  cardRow: { flexDirection: 'row', gap: 10 },
  card: { flex: 1, backgroundColor: LIGHT_BG, borderRadius: 8, padding: 14 },
  cardLabel: {
    fontSize: 7.5,
    color: GRAY,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  cardValue: { fontSize: 22, fontFamily: 'Helvetica-Bold', color: BLACK, marginBottom: 3 },
  cardSub: { fontSize: 8.5, color: GRAY },

  categoryRow: { marginBottom: 10 },
  categoryHead: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  categoryLabel: { fontSize: 9.5, color: BLACK, fontFamily: 'Helvetica-Bold' },
  categoryCount: { fontSize: 9, color: GRAY },
  barOuter: { height: 5, backgroundColor: BORDER, borderRadius: 3 },
  barInner: { height: 5, backgroundColor: CYAN, borderRadius: 3 },

  insightCard: { borderWidth: 1, borderColor: BORDER, borderRadius: 8, padding: 14 },
  insightTitle: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: BLACK, marginBottom: 4 },
  insightDescription: { fontSize: 9.5, color: GRAY, lineHeight: 1.5, marginBottom: 8 },
  insightAction: {
    fontSize: 9.5,
    color: BLACK,
    lineHeight: 1.5,
    backgroundColor: LIGHT_BG,
    borderRadius: 6,
    padding: 10,
  },
  insightActionLabel: {
    fontSize: 7.5,
    color: CYAN,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 3,
    fontFamily: 'Helvetica-Bold',
  },

  emptyBlock: { backgroundColor: LIGHT_BG, borderRadius: 8, padding: 16 },
  emptyText: { fontSize: 9.5, color: GRAY, lineHeight: 1.5 },

  footer: {
    position: 'absolute',
    bottom: 20,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: BORDER,
    paddingTop: 8,
  },
  footerLeft: { fontSize: 7.5, color: GRAY },
  footerRight: { fontSize: 7.5, color: CYAN },
})

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

function EmptyBlock({ text }: { text: string }) {
  return (
    <View style={s.emptyBlock}>
      <Text style={s.emptyText}>{text}</Text>
    </View>
  )
}

function Header({ data, now }: { data: ClientMonthlyReportData; now: Date }) {
  return (
    <View style={s.header}>
      <View>
        <Text style={s.brand}>develOP</Text>
        <Text style={s.companyName}>{data.companyName}</Text>
      </View>
      <View style={s.headerRight}>
        <Text style={s.monthLabel}>Informe de {data.monthLabel}</Text>
        <Text style={s.generatedAt}>Generado el {formatDateAR(now)}</Text>
      </View>
    </View>
  )
}

function Footer() {
  return (
    <View style={s.footer} fixed>
      <Text style={s.footerLeft}>Reporte generado por develOP · develop.com.ar</Text>
      <Text style={s.footerRight}>contacto@develop.com.ar</Text>
    </View>
  )
}

function NumbersSection({
  data,
}: {
  data: Extract<ClientMonthlyReportData, { hasBot: true }>
}) {
  const { leads, series } = data
  return (
    <Section title="Los números del mes">
      <View style={s.cardRow}>
        <View style={s.card}>
          <Text style={s.cardLabel}>Leads</Text>
          <Text style={s.cardValue}>{leads.current.toLocaleString('es-AR')}</Text>
          <Text style={s.cardSub}>{leads.phrase ?? 'Sin actividad este mes'}</Text>
        </View>
        <View style={s.card}>
          <Text style={s.cardLabel}>Conversaciones</Text>
          <Text style={s.cardValue}>{(series.current?.count ?? 0).toLocaleString('es-AR')}</Text>
          <Text style={s.cardSub}>
            {series.variation?.label ??
              (series.current ? 'Sin mes anterior para comparar' : 'Sin actividad todavía')}
          </Text>
        </View>
      </View>
    </Section>
  )
}

function FunnelSection({
  data,
}: {
  data: Extract<ClientMonthlyReportData, { hasBot: true }>
}) {
  const { funnel } = data
  if (funnel.total === 0) {
    return (
      <Section title="Qué pasó con tus leads">
        <EmptyBlock text="Todavía no entraron leads este mes." />
      </Section>
    )
  }
  const steps = [
    { label: 'Entraron', value: funnel.total },
    { label: 'Contactaste', value: funnel.contacted },
    { label: 'Vendiste', value: funnel.sold },
  ]
  return (
    <Section title="Qué pasó con tus leads">
      <View style={s.cardRow}>
        {steps.map((step) => (
          <View style={s.card} key={step.label}>
            <Text style={s.cardLabel}>{step.label}</Text>
            <Text style={s.cardValue}>{step.value.toLocaleString('es-AR')}</Text>
          </View>
        ))}
      </View>
    </Section>
  )
}

function CategoriesSectionPdf({
  data,
}: {
  data: Extract<ClientMonthlyReportData, { hasBot: true }>
}) {
  const { categories } = data
  return (
    <Section title="Qué pregunta tu gente">
      {!categories.sufficient ? (
        <EmptyBlock text="Todavía estamos juntando datos de este mes — con unas conversaciones más vas a ver acá los temas que más pregunta tu gente." />
      ) : (
        <View>
          {categories.top.map((entry) => {
            const pct = Math.round(entry.share * 100)
            return (
              <View style={s.categoryRow} key={entry.category}>
                <View style={s.categoryHead}>
                  <Text style={s.categoryLabel}>{entry.label}</Text>
                  <Text style={s.categoryCount}>
                    {entry.count.toLocaleString('es-AR')} · {pct}%
                  </Text>
                </View>
                <View style={s.barOuter}>
                  <View style={[s.barInner, { width: `${Math.max(pct, 2)}%` }]} />
                </View>
              </View>
            )
          })}
        </View>
      )}
    </Section>
  )
}

function InsightSection({
  data,
}: {
  data: Extract<ClientMonthlyReportData, { hasBot: true }>
}) {
  if (!data.topInsight) return null
  const insight = data.topInsight
  return (
    <Section title="Lo que descubrimos este mes">
      <View style={s.insightCard}>
        <Text style={s.insightTitle}>{insight.title}</Text>
        <Text style={s.insightDescription}>{insight.description}</Text>
        <View style={s.insightAction}>
          <Text style={s.insightActionLabel}>Qué podés hacer</Text>
          <Text>{insight.suggestedAction}</Text>
        </View>
      </View>
    </Section>
  )
}

export function ClientMonthlyReportPdf({
  data,
  now = new Date(),
}: {
  data: ClientMonthlyReportData
  now?: Date
}) {
  return (
    <Document
      title={`Informe ${data.monthLabel} — ${data.companyName}`}
      author="develOP"
      creator="develOP"
    >
      <Page size="A4" style={s.page}>
        <Header data={data} now={now} />

        {!data.hasBot ? (
          <EmptyBlock text="El análisis mensual se activa con tu asistente virtual. Cuando tu chatbot develOP esté funcionando, este informe se va a completar con tendencias, temas de consulta y oportunidades." />
        ) : (
          <>
            <NumbersSection data={data} />
            <FunnelSection data={data} />
            <CategoriesSectionPdf data={data} />
            <InsightSection data={data} />
          </>
        )}

        <Footer />
      </Page>
    </Document>
  )
}
