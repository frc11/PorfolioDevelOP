/**
 * Intent detection — basado en sales-strategy.ts del legacy.
 *
 * Analiza el último mensaje del usuario y detecta intención (price, urgency, etc.)
 * Devuelve guidance específica que se inyecta en el system prompt como hint.
 */

export type IntentType =
  | 'price'
  | 'urgency'
  | 'comparison'
  | 'service_inquiry'
  | 'consultation'
  | 'unknown'

export interface IntentResult {
  intent: IntentType
  guidance: string | null  // Texto a inyectar en el prompt si hay match
}

const PATTERNS: Record<Exclude<IntentType, 'unknown'>, RegExp[]> = {
  price: [
    /precio/i, /costo/i, /cu[aá]nto cuesta/i, /presupuesto/i, /cotiza/i,
    /cu[aá]nto sale/i, /tarifa/i, /barato/i, /caro/i, /invertir/i,
  ],
  urgency: [
    /urgente/i, /r[aá]pido/i, /cu[aá]nto tardan/i, /para ayer/i,
    /lo necesito ya/i, /esta semana/i, /este mes/i, /deadline/i,
  ],
  comparison: [
    /competencia/i, /diferencia/i, /por qu[eé] ustedes/i, /mejor que/i,
    /comparado/i, /ventaja/i, /vs\s/i,
  ],
  service_inquiry: [
    /web/i, /sitio/i, /landing/i, /ia\b/i, /inteligencia artificial/i,
    /chatbot/i, /automatiza/i, /software/i, /sistema/i, /crm/i, /dashboard/i,
  ],
  consultation: [
    /hablar/i, /reuni[oó]n/i, /contacto/i, /whatsapp/i,
    /llamada/i, /agenda/i, /charlar/i,
  ],
}

const GUIDANCE: Record<Exclude<IntentType, 'unknown'>, string> = {
  price:
    'El visitante preguntó por precio. NO des un número específico sin diagnóstico. ' +
    'Respondé con la filosofía del protocolo de precios: enfocar primero en entender qué problema resolver.',
  urgency:
    'El visitante muestra urgencia. Reconocelo, pero igual necesitás entender el alcance antes de prometer tiempos. ' +
    'Pedí los detalles mínimos para poder dar una idea real.',
  comparison:
    'El visitante está comparando opciones. NO hables mal de otros — diferenciate por el valor concreto que aportás. ' +
    'Preguntale qué es lo más importante que necesita resolver bien.',
  service_inquiry:
    'El visitante mencionó un servicio específico. Hacé preguntas para entender su contexto ' +
    '(tamaño del equipo, cómo operan hoy, qué les está costando más) antes de explicar el servicio en detalle.',
  consultation:
    'El visitante quiere hablar con alguien. Validalo, pero pedile un resumen breve de qué necesita ' +
    'para que la charla sea productiva. Eventualmente usá la tool capture_lead.',
}

export function detectIntent(userMessage: string): IntentResult {
  for (const [intent, patterns] of Object.entries(PATTERNS) as [
    Exclude<IntentType, 'unknown'>,
    RegExp[]
  ][]) {
    for (const pattern of patterns) {
      if (pattern.test(userMessage)) {
        return { intent, guidance: GUIDANCE[intent] }
      }
    }
  }
  return { intent: 'unknown', guidance: null }
}
