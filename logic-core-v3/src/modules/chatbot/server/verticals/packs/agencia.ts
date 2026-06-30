/**
 * EV.4 — Pack `agencia`: el bot de la PROPIA agencia develOP (sitio público).
 *
 * Los `intents` son extracción **VERBATIM** de los patrones y guidance que vivían
 * hardcodeados en `intent/detectIntent.ts` (PATTERNS + GUIDANCE) — cero retoques.
 * Estos patrones (web/IA/software/CRM, precio, urgencia, comparación, contacto)
 * son del rubro de la agencia y antes corrían en TODOS los bots; ahora quedan
 * acotados al bot de la agencia.
 *
 * Scoring: reusa la configuración de `base` (la agencia no tiene tabla propia
 * hoy). Pre-EV.3 el motor puntuaba a TODOS con la tabla `usados`; tras el bloque
 * EV la agencia cae en SU pack → su scoring pasa a `base`. Cambio menor de
 * scoring para el bot de la agencia, aceptado en planificación (la agencia no es
 * un lead de venta de autos). toolCopy/widgetCopy reusan `base` (EV.5 los afina).
 */

import type { VerticalPack } from '../types'
import { BASE_PACK } from './base'

export const AGENCIA_PACK: VerticalPack = {
  key: 'agencia',
  displayName: 'Agencia develOP',
  kbTemplateRef: 'generico',

  // Scoring reusado de `base` (decisión de planificación EV.4).
  scoring: BASE_PACK.scoring,

  // Intents VERBATIM de detectIntent.ts (PATTERNS + GUIDANCE legacy).
  intents: [
    {
      intent: 'price',
      patterns: [
        /precio/i, /costo/i, /cu[aá]nto cuesta/i, /presupuesto/i, /cotiza/i,
        /cu[aá]nto sale/i, /tarifa/i, /barato/i, /caro/i, /invertir/i,
      ],
      guidance:
        'El visitante preguntó por precio. NO des un número específico sin diagnóstico. ' +
        'Respondé con la filosofía del protocolo de precios: enfocar primero en entender qué problema resolver.',
    },
    {
      intent: 'urgency',
      patterns: [
        /urgente/i, /r[aá]pido/i, /cu[aá]nto tardan/i, /para ayer/i,
        /lo necesito ya/i, /esta semana/i, /este mes/i, /deadline/i,
      ],
      guidance:
        'El visitante muestra urgencia. Reconocelo, pero igual necesitás entender el alcance antes de prometer tiempos. ' +
        'Pedí los detalles mínimos para poder dar una idea real.',
    },
    {
      intent: 'comparison',
      patterns: [
        /competencia/i, /diferencia/i, /por qu[eé] ustedes/i, /mejor que/i,
        /comparado/i, /ventaja/i, /vs\s/i,
      ],
      guidance:
        'El visitante está comparando opciones. NO hables mal de otros — diferenciate por el valor concreto que aportás. ' +
        'Preguntale qué es lo más importante que necesita resolver bien.',
    },
    {
      intent: 'service_inquiry',
      patterns: [
        /web/i, /sitio/i, /landing/i, /ia\b/i, /inteligencia artificial/i,
        /chatbot/i, /automatiza/i, /software/i, /sistema/i, /crm/i, /dashboard/i,
      ],
      guidance:
        'El visitante mencionó un servicio específico. Hacé preguntas para entender su contexto ' +
        '(tamaño del equipo, cómo operan hoy, qué les está costando más) antes de explicar el servicio en detalle.',
    },
    {
      intent: 'consultation',
      patterns: [
        /hablar/i, /reuni[oó]n/i, /contacto/i, /whatsapp/i,
        /llamada/i, /agenda/i, /charlar/i,
      ],
      guidance:
        'El visitante quiere hablar con alguien. Validalo, pero pedile un resumen breve de qué necesita ' +
        'para que la charla sea productiva. Eventualmente usá la tool capture_lead.',
    },
  ],

  // EV.5 afina copy de tools y widget; por ahora reusa los genéricos de base.
  toolCopy: BASE_PACK.toolCopy,
  widgetCopy: BASE_PACK.widgetCopy,
} satisfies VerticalPack
