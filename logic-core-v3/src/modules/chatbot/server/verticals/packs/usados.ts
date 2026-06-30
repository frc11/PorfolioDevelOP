/**
 * EV.3 — Pack `usados`: concesionaria de autos (0km + usados).
 *
 * Extracción VERBATIM de la tabla de scoring que vivía hardcodeada en
 * `scoring/calculateLeadScore.ts` (SCORING_TABLE, COMBO_BONUSES, penalties,
 * DQ_CATEGORIES, thresholds). Cada label y cada punto es copia
 * carácter-por-carácter de los valores actuales — cero "mejoras".
 *
 * Garantía de paridad: para las mismas entradas, el motor leyendo este pack
 * produce EXACTAMENTE los mismos scores que la implementación previa. Probado
 * por la suite dorada (`__tests__/ev3.golden.invariant.ts`, 208 casos) y por
 * la equivalencia estructural contra las constantes legacy
 * (`__tests__/ev3.invariant.ts`).
 *
 * Combos: `ComboBonus.matches` (función, no serializable) → `requiredSignalKeys`
 * (declarativo). El motor dispara el combo cuando TODAS las señales requeridas
 * están activas — equivalente exacto a las condiciones AND originales.
 *
 * `intents` queda vacío y `toolCopy`/`widgetCopy` son placeholders: los
 * completan EV.4 (intents) y EV.5 (tool copy). El núcleo de este sprint es el
 * scoring.
 */

import type { VerticalPack } from '../types'

export const USADOS_PACK: VerticalPack = {
  key: 'usados',
  displayName: 'Concesionaria (0km + usados)',

  scoring: {
    // Tabla POSITIVA — verbatim de SCORING_TABLE. Orden = orden visual de
    // explicabilidad (mayor a menor impacto). Suma máxima 100.
    signals: [
      { key: 'requestedAppointment', label: 'Pidió cita / test drive', points: 40 },
      { key: 'mentionedFinancing', label: 'Pidió financiación / cuotas', points: 25 },
      { key: 'mentionedTradeIn', label: 'Tiene usado para entregar', points: 20 },
      { key: 'askedSpecificModel', label: 'Pregunta por modelo específico', points: 10 },
      { key: 'providedPhone', label: 'Dejó teléfono', points: 5 },
    ],

    // Combos — verbatim de COMBO_BONUSES. `requiredSignalKeys` reemplaza la
    // función `matches`: ambas señales activas → combo dispara.
    combos: [
      {
        key: 'combo_tradein_financing',
        label: 'Tiene usado + pide financiación (perfil de cierre)',
        points: 10,
        requiredSignalKeys: ['mentionedTradeIn', 'mentionedFinancing'],
      },
      {
        key: 'combo_specific_model_appointment',
        label: 'Sabe qué modelo quiere + agenda visita',
        points: 5,
        requiredSignalKeys: ['askedSpecificModel', 'requestedAppointment'],
      },
    ],

    // Penalties — verbatim. Orden postventa → invalid_phone (importa para el
    // orden de las señales persistidas en explicabilidad).
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
      caliente: 70, // HOT_THRESHOLD
      tibio: 40, // WARM_THRESHOLD
    },
  },

  // EV.4 completa los intents verticales (hoy en detectIntent.ts).
  intents: [],

  // EV.5 cablea estos strings en las descripciones de tools. Los ejemplos de
  // modelo ya existen en captureLead.ts (no inventados).
  toolCopy: {
    specificModelExamples: 'Corolla XEi, Hilux SRV',
    prefilledMessageExample:
      'Hola, soy [nombre]. Quería consultar por un auto y coordinar una visita o test drive.',
    topicSummaryExample:
      'Visitante interesado en un vehículo, consultó por modelo, financiación y disponibilidad.',
  },

  // Copy de onboarding del widget (EV.5 / onboarding puede refinarlo).
  widgetCopy: {
    welcomeMessages: [
      '¡Hola! Te ayudo con info sobre nuestros autos, planes de pago, agendar un test drive o lo que necesites.',
    ],
    botNameSuggestions: ['Lucía', 'Asistente', 'Tomás'],
  },
} satisfies VerticalPack
