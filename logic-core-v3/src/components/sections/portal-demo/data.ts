/**
 * Las tres escenas del lunes.
 *
 * ⚠ REGLA DE ESTA SECCIÓN: cada cosa que aparece acá tiene que ser algo que el
 * panel **realmente hace**. Es la sección que sirve de prueba, y una prueba
 * falsa es peor que ninguna. Lo que se muestra está verificado contra el código
 * del portal, no contra lo que suena bien:
 *
 * · Health Score → `src/lib/health-score.ts`. Total 0-100 y tres dimensiones con
 *   estos nombres exactos: Salud Digital (peso .40), Salud Comercial (.35),
 *   Salud Operativa (.25). Render en `dashboard/home/HealthScore.tsx`.
 * · Tu Atención Hoy → `src/lib/dashboard/attention.ts`. Los tipos de ítem son
 *   `billing`, `approval`, `message`, `connection`, `review`, con prioridad
 *   crítica/alta/media/baja. Render en `dashboard/home/AttentionStack.tsx`.
 * · Resultados de la semana → `src/lib/dashboard/week-results.ts`. Compara
 *   contra la SEMANA anterior. Render en `dashboard/home/WeekResultsGrid.tsx`.
 * · El resumen ejecutivo lo escribe la IA → `src/lib/ai/executive-brief.ts`.
 *
 * Lo que la versión anterior afirmaba y **el panel no hace** — sacado, no
 * reescrito:
 * · «develOP filtró los 14 mails, 8 mensajes y 3 alertas que te llegaron». El
 *   panel no lee tu correo. `AttentionStack` arma sus ítems con datos propios
 *   (entregas, facturas, reseñas, conexiones).
 * · «8 ventas cerradas» y «$340K facturados». `WeekResultsData` no tiene métrica
 *   de ventas ni de facturación. Las cuatro que tiene son visitas, leads,
 *   respondidos y completadas.
 * · «Comparativa contra mes anterior». La comparación es contra la semana.
 * · El gráfico de barras de siete días. No existe en `WeekResultsGrid`.
 *
 * Y `visits` queda afuera a propósito: está hardcodeado en 0 porque no hay
 * integración de analítica, y la card real muestra «—  Sin integración aún».
 *
 * Las CIFRAS van marcadas. Ninguna es real todavía.
 */

export type EscenaId = 'salud' | 'atencion' | 'semana'

export type Escena = {
  id: EscenaId
  /** Hora del lunes. Es el eje de la secuencia. */
  hora: string
  /** Dónde estás cuando mirás. Una frase corta. */
  momento: string
  /** La pregunta que te hacés. Va en escala de subhead. */
  pregunta: string
  /** Qué te muestra el panel. 1-2 líneas. Solo capacidades reales. */
  muestra: string
  /** Qué hacés con eso. 1 línea. */
  decidis: string
}

export const ESCENAS: readonly Escena[] = [
  {
    id: 'salud',
    hora: '8:30',
    momento: 'Recién prendés la computadora.',
    pregunta: '¿Cómo viene la semana?',
    muestra:
      'El Health Score. Un número del 0 al 100 armado con tres partes: salud digital, comercial y operativa.',
    decidis: 'Lo mirás dos segundos y sabés si tenés que meterte o no.',
  },
  {
    id: 'atencion',
    hora: '9:00',
    momento: 'Ya te hiciste el café.',
    pregunta: '¿Qué necesita mi atención hoy?',
    muestra:
      'Tu Atención Hoy: lo pendiente, ordenado por urgencia. Una entrega esperando que la apruebes, una reseña sin responder, una factura por vencer.',
    decidis: 'Aprobás la entrega. El resto lo dejás para después del almuerzo.',
  },
  {
    id: 'semana',
    hora: '9:30',
    momento: 'Falta poco para la primera reunión.',
    pregunta: '¿Cómo nos fue esta semana?',
    muestra:
      'Los resultados de la semana contra la anterior: leads nuevos, mensajes respondidos, tareas terminadas. Abajo, el resumen que escribió la IA.',
    decidis: 'Lo leés y entrás a la reunión sabiendo de qué hablar.',
  },
] as const

/**
 * Marca de dato pendiente. Una sola constante para que la lista de placeholders
 * del cierre de bloque salga de un grep y no de la memoria.
 */
export const DATO = {
  score: '[00]',
  porcentaje: '[+00%]',
  entero: '[00]',
} as const

/** Las tres dimensiones del Health Score, con los nombres que usa el portal. */
export const DIMENSIONES: readonly string[] = [
  'Salud Digital',
  'Salud Comercial',
  'Salud Operativa',
]

/**
 * Los ítems de Atención. El TIPO y la prioridad son reales; el texto del ítem va
 * marcado porque depende del negocio de cada cliente.
 */
export const ATENCION: readonly { prioridad: string; texto: string }[] = [
  { prioridad: 'Crítico', texto: '[ENTREGA QUE ESPERA APROBACIÓN]' },
  { prioridad: 'Alta', texto: '[RESEÑA SIN RESPONDER]' },
  { prioridad: 'Puede esperar', texto: '[FACTURA POR VENCER]' },
]

/** Las tres métricas de la semana que el panel sí calcula. */
export const METRICAS: readonly string[] = ['Leads', 'Respondidos', 'Completadas']
