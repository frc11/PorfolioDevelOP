export type StoryMoment = {
  id: string
  time: string
  timeBadge: string
  question: string
  panelShows: string
  decision: string
  outcome: string
  screenshotPath: string
  screenshotAlt: string
  accentColor: string
  iconName: string
}

export const STORY_MOMENTS: StoryMoment[] = [
  {
    id: 'health-score',
    time: '8:30 AM',
    timeBadge: 'Apenas llegás al trabajo',
    question: '¿Cómo arrancó la semana mi negocio?',
    panelShows:
      'Tu Health Score. Un solo número del 0 al 100 que te dice si la semana viene bien, normal o necesita atención. Sin Excel. Sin contadores. Sin reuniones de 30 minutos para entender qué pasa.',
    decision:
      'Hoy 78 — semana normal. Cerrás el panel tranquilo y arrancás el día.',
    outcome:
      'Ahorrás 15 minutos cada mañana entendiendo el estado del negocio.',
    screenshotPath: '/landing/portal-demo/01-health-score.webp',
    screenshotAlt: 'Health Score: 78 puntos — Semana normal',
    accentColor: '#06b6d4',
    iconName: 'Activity',
  },
  {
    id: 'attention-stack',
    time: '9:00 AM',
    timeBadge: 'Ya tomaste el café',
    question: '¿Qué necesita mi atención AHORA y qué puede esperar?',
    panelShows:
      'Tu Atención Hoy. develOP filtró los 14 mails, 8 mensajes y 3 alertas que te llegaron y te muestra solo lo crítico: "1 entrega del proyecto espera tu aprobación" y "2 reseñas de Google necesitan respuesta en 48h".',
    decision:
      'Aprobás la entrega con 1 click. Las reseñas las dejás para después de almuerzo.',
    outcome:
      'Tu día deja de manejarte. Vos manejás tu día.',
    screenshotPath: '/landing/portal-demo/02-attention-stack.webp',
    screenshotAlt: 'Tu Atención Hoy: prioridades del día',
    accentColor: '#8b5cf6',
    iconName: 'Inbox',
  },
  {
    id: 'week-results',
    time: '9:30 AM',
    timeBadge: 'Antes de la primera reunión',
    question: '¿Cuánto generamos esta semana? ¿Cómo venimos vs el mes pasado?',
    panelShows:
      'Resultados de la Semana. 47 leads nuevos (+12% vs semana pasada). 8 ventas cerradas. $340K facturados. Comparativa contra mes anterior. Y el resumen ejecutivo lo escribió la IA en 2 oraciones.',
    decision:
      'Lo copiás y se lo mandás a tu socio por WhatsApp. Conversación de negocio en 30 segundos.',
    outcome:
      'Decisiones basadas en datos, no en sensaciones.',
    screenshotPath: '/landing/portal-demo/03-week-results.webp',
    screenshotAlt: 'Resultados de la Semana: 47 leads +12%, 8 ventas cerradas',
    accentColor: '#10b981',
    iconName: 'TrendingUp',
  },
]

export const STORY_ICONS = ['Activity', 'Inbox', 'TrendingUp'] as const
