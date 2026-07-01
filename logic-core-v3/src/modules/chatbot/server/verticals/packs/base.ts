/**
 * EV.1 — Pack `base`: vertical neutro / fallback.
 *
 * Señales universales que aplican a cualquier negocio sin quedar ridículas:
 *   - Solicitó cita o reunión (40 pts) — análogo al requestedAppointment del motor
 *   - Dejó teléfono (30 pts)
 *   - Dejó email (20 pts)
 *   Suma máxima: 90 ≤ 100 ✓
 *
 * Sin combos verticales. Intents mínimos genéricos (precio, contacto humano).
 * Tool copy sin ejemplos de rubro. Widget copy genérico.
 *
 * Este pack es la red de seguridad del registry: si la clave no tiene pack
 * propio, el runtime usa éste y el negocio sigue funcionando sin datos
 * absurdos del sector incorrecto.
 */

import type { VerticalPack } from '../types'

export const BASE_PACK: VerticalPack = {
  key: 'base',
  displayName: 'Genérico',
  kbTemplateRef: 'generico',

  scoring: {
    signals: [
      {
        key: 'requestedAppointment',
        label: 'Solicitó cita o reunión',
        points: 40,
      },
      {
        key: 'providedPhone',
        label: 'Dejó teléfono',
        points: 30,
      },
      {
        key: 'providedEmail',
        label: 'Dejó email',
        points: 20,
      },
    ],
    combos: [],
    penalties: [
      {
        key: 'penalty_postventa',
        label: 'Consulta de postventa (no compra)',
        points: -50,
        condition: 'category_postventa',
      },
      {
        key: 'penalty_invalid_phone',
        label: 'Teléfono con formato dudoso',
        points: -20,
        condition: 'invalid_phone',
      },
    ],
    dqCategories: ['employment', 'provider', 'spam'],
    thresholds: {
      caliente: 70,
      tibio: 40,
    },
  },

  intents: [
    {
      intent: 'price',
      patterns: [/precio/i, /costo/i, /cu[aá]nto cuesta/i, /presupuesto/i, /cotiza/i, /cu[aá]nto sale/i],
      guidance:
        'El visitante preguntó por precio. No des un número sin entender primero qué problema resolver.',
    },
    {
      intent: 'consultation',
      patterns: [/hablar/i, /reuni[oó]n/i, /contacto/i, /whatsapp/i, /llamada/i, /agenda/i, /charlar/i],
      guidance:
        'El visitante quiere hablar con alguien. Pedile un resumen breve de qué necesita para que la charla sea productiva.',
    },
  ],

  // EV.5 — Tool copy genérico sin rubro (MATERIAL EV.5). Es la red de seguridad
  // del registry: ningún ejemplo de dominio para no generar ruido en un bot
  // desconocido. Si el pack correcto está configurado en DB, este copy no aplica.
  toolCopy: {
    specificModelExamples: '"uno de sus productos", "el servicio que ofrecen"',
    prefilledMessageExample:
      'Hola! Vengo del asistente de la web — quería consultar por [tema]',
    topicSummaryExample:
      'Visitante consultó por información general sobre el negocio y sus servicios.',
  },

  widgetCopy: {
    welcomeMessages: [
      '¡Hola! Soy el asistente virtual. Puedo ayudarte con información, agendar una consulta o conectarte con el equipo. ¿En qué te ayudo?',
    ],
    botNameSuggestions: ['Asistente Virtual', 'Helper', 'Guía'],
  },
} satisfies VerticalPack
