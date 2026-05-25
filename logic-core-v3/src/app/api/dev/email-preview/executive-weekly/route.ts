import { NextResponse } from 'next/server'
import {
  executiveWeeklyEmail,
  type ExecutiveWeeklyEmailInput,
} from '@/lib/email/templates/executive-weekly'

export const dynamic = 'force-dynamic'

// Preview dev-only del template del executive weekly email. Sirve para que el
// subagente visual-qa lo abra en el browser y verifique render — el preview
// real del email vive solo en clientes de correo.
// En producción la ruta devuelve 404 para no exponerla.

const MOCK_VARIANTS: Record<string, ExecutiveWeeklyEmailInput> = {
  default: {
    companyName: 'La Casa del Café',
    recipientName: 'Sofía',
    weekLabel: '17 may – 23 may',
    briefText:
      'Buena semana: subió la cantidad de leads un 18% y el bot resolvió 9 de cada 10 consultas sin que hicieras nada. El health score quedó estable. Recomendación: mirá los 3 leads calientes del panel y mandales un mensaje hoy mismo.',
    health: { total: 78, deltaVsLastWeek: 4 },
    leads: { value: 24, deltaPercent: 18 },
    messagesAnswered: { value: 142, deltaPercent: 6 },
    tasksCompleted: { value: 11, deltaPercent: -8 },
    dashboardUrl: 'http://localhost:3000/dashboard',
    unsubscribeUrl:
      'http://localhost:3000/api/email/unsubscribe-executive?org=demo&token=abc123',
  },
  // Caso: primera semana — sin comparación con semana anterior.
  fresh: {
    companyName: 'Estudio Verde',
    recipientName: null,
    weekLabel: '17 may – 23 may',
    briefText:
      'Arrancaste esta semana en el portal. Llegaron 6 leads y el bot tuvo 38 conversaciones — un piso decente para empezar a medir. La próxima semana ya vas a poder comparar.',
    health: { total: 62, deltaVsLastWeek: null },
    leads: { value: 6, deltaPercent: null },
    messagesAnswered: { value: 38, deltaPercent: null },
    tasksCompleted: { value: 0, deltaPercent: null },
    dashboardUrl: 'http://localhost:3000/dashboard',
    unsubscribeUrl:
      'http://localhost:3000/api/email/unsubscribe-executive?org=demo&token=abc123',
  },
  // Caso: semana floja — todos los deltas en negativo.
  down: {
    companyName: 'Pinturería del Sur',
    recipientName: 'Martín',
    weekLabel: '17 may – 23 may',
    briefText:
      'Semana más lenta: bajaron los leads y las conversaciones respecto de la anterior. Nada para alarmarse — puede ser estacional. Te dejé un par de cosas para revisar en el panel.',
    health: { total: 54, deltaVsLastWeek: -7 },
    leads: { value: 9, deltaPercent: -22 },
    messagesAnswered: { value: 74, deltaPercent: -15 },
    tasksCompleted: { value: 4, deltaPercent: -33 },
    dashboardUrl: 'http://localhost:3000/dashboard',
    unsubscribeUrl:
      'http://localhost:3000/api/email/unsubscribe-executive?org=demo&token=abc123',
  },
  // B6.3 — Business: incluye la sección "Tus 3 leads más calientes".
  business: {
    companyName: 'Concesionaria Norte',
    recipientName: 'Lucía',
    weekLabel: '17 may – 23 may',
    briefText:
      'Semana redonda: subieron los leads un 24% y hay 3 personas con perfil de cierre que conviene contactar hoy. El equipo respondió rápido y se nota en el ritmo.',
    health: { total: 82, deltaVsLastWeek: 5 },
    leads: { value: 31, deltaPercent: 24 },
    messagesAnswered: { value: 188, deltaPercent: 12 },
    tasksCompleted: { value: 14, deltaPercent: 4 },
    topHotLeads: [
      {
        name: 'Federico Álvarez',
        email: 'fede.alvarez@example.com',
        phone: '+54 9 381 555-0182',
        heatLabel: 'Caliente',
        heatAccent: '#f43f5e',
        whatTheyWant:
          'Quiero un Onix Joy 2024 con financiación, tengo un Corsa 2012 para entregar',
        reasons: ['Pidió cita / test drive', 'Tiene usado + pide financiación (perfil de cierre)'],
      },
      {
        name: 'María Romero',
        email: 'mromero@example.com',
        phone: '+54 9 381 555-0144',
        heatLabel: 'Caliente',
        heatAccent: '#f43f5e',
        whatTheyWant: 'Necesito Tracker 2023, ¿qué planes tienen?',
        reasons: ['Mencionó modelo específico', 'Mencionó financiación'],
      },
      {
        name: 'Sin nombre',
        email: null,
        phone: '+54 9 381 555-0211',
        heatLabel: 'Tibio',
        heatAccent: '#f59e0b',
        whatTheyWant: 'Información sobre planes de ahorro',
        reasons: ['Mencionó financiación'],
      },
    ],
    dashboardUrl: 'http://localhost:3000/dashboard',
    unsubscribeUrl:
      'http://localhost:3000/api/email/unsubscribe-executive?org=demo&token=abc123',
  },
}

export async function GET(request: Request) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not Found' }, { status: 404 })
  }

  const url = new URL(request.url)
  const variant = url.searchParams.get('variant') ?? 'default'
  const input = MOCK_VARIANTS[variant] ?? MOCK_VARIANTS.default

  const { htmlContent } = executiveWeeklyEmail(input)

  return new NextResponse(htmlContent, {
    status: 200,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'no-store',
    },
  })
}
