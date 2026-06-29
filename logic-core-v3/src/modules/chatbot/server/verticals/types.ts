/**
 * EV.1 — Contrato de tipos para packs verticales.
 *
 * Define la forma de un VerticalPack: unidad que encapsula todas las
 * diferencias entre verticales de negocio (autos, agencia, inmobiliaria, etc.)
 * que hoy están horneadas en el runtime de scoring, intents y tools.
 *
 * Este módulo es pura infraestructura de tipos + validador de invariante.
 * NADA del runtime lo importa en EV.1 — los consumidores vienen en EV.2+.
 */

// ─── Clave del pack ───────────────────────────────────────────────────────────

/**
 * Claves canónicas de verticales. Extensible: añadir aquí + crear
 * el pack correspondiente en `packs/`. El registry requiere una entrada
 * por clave; hasta que exista el pack real, mapea a `base` como placeholder.
 */
export type VerticalPackKey = 'base' | 'usados' | 'agencia'

// ─── Scoring ──────────────────────────────────────────────────────────────────

/**
 * Definición de una señal de scoring. `key` coincide por convención con
 * un campo de `LeadSignals` (scoring/calculateLeadScore.ts) o con una
 * señal nueva que EV.2+ añadirá al schema de captura.
 */
export interface VerticalSignalDef {
  /** Clave estable — coincide con el nombre del campo en LeadSignals o es nueva. */
  key: string
  /** Label legible PyME (dashboard, explicabilidad). En es-AR. */
  label: string
  /** Puntos positivos aportados cuando la señal está activa. */
  points: number
}

/**
 * Combo de señales: bonus que se aplica cuando TODAS las señales
 * indicadas están activas. Mismo patrón que `COMBO_BONUSES` en el motor.
 */
export interface VerticalCombo {
  key: string
  label: string
  points: number
  /** Claves de señales que deben estar activas (todas). Mínimo 2. */
  requiredSignalKeys: readonly string[]
}

/** Condición que activa una penalización. Extensible como union literal. */
export type VerticalPenaltyCondition = 'category_postventa' | 'invalid_phone'

/** Penalización del score. `points` es negativo. */
export interface VerticalPenalty {
  key: string
  label: string
  /** Negativo. Ej: -50 para postventa. */
  points: number
  condition: VerticalPenaltyCondition
}

/**
 * Umbrales de clasificación del pack. Determinan qué score queda en
 * caliente / tibio / frío (el motor mapea esto a hot/warm/cold).
 *
 * Invariante: caliente > tibio ≥ 0, caliente ≤ 100.
 */
export interface VerticalScoringThresholds {
  /** score ≥ caliente → clasificación "hot". */
  caliente: number
  /** score ≥ tibio → clasificación "warm". Debe ser < caliente. */
  tibio: number
}

export interface VerticalScoring {
  signals: readonly VerticalSignalDef[]
  combos: readonly VerticalCombo[]
  penalties: readonly VerticalPenalty[]
  /** Categorías de lead que disparan DQ inmediato (score=0). */
  dqCategories: readonly string[]
  thresholds: VerticalScoringThresholds
}

// ─── Intents ──────────────────────────────────────────────────────────────────

/**
 * Patrón de intent: compatible con el formato de `detectIntent.ts`.
 * El campo `guidance` es el texto que se inyecta en el system prompt
 * cuando el intent matchea — mismo rol que `GUIDANCE` en el runtime.
 */
export interface VerticalIntentPattern {
  intent: string
  patterns: readonly RegExp[]
  guidance?: string
}

export type VerticalIntents = readonly VerticalIntentPattern[]

// ─── Tool copy ────────────────────────────────────────────────────────────────

/**
 * Strings parametrizables de las tools de captura/handoff.
 *
 * Estructura espejo de los strings verticales encontrados en:
 *   - captureLead.ts: descripción del campo `askedSpecificModel`
 *     (ej. específico de autos: "Corolla XEi", "Hilux SRV")
 *   - showWhatsappHandoff.ts: ejemplos de `prefilledMessage` y `topicSummary`
 *     (ej. específico de autos: "Corolla XEi 0KM")
 *
 * EV.2 inyectará estos valores en las descripciones Zod de las tools.
 */
export interface VerticalToolCopy {
  /** Ejemplos inline para el campo askedSpecificModel (ej: "Corolla XEi, Hilux SRV"). */
  specificModelExamples: string
  /** Ejemplo de mensaje pre-llenado para WhatsApp (campo prefilledMessage). */
  prefilledMessageExample: string
  /** Ejemplo de resumen de tema para el dashboard (campo topicSummary). */
  topicSummaryExample: string
}

// ─── Widget copy ──────────────────────────────────────────────────────────────

/**
 * Textos del widget de onboarding. Espejo de `suggestions.ts` pero
 * acoplado al pack vertical en lugar de a la `Industry` del onboarding.
 */
export interface VerticalWidgetCopy {
  /** Mensajes de bienvenida sugeridos (1-2 opciones para el onboarding). */
  welcomeMessages: readonly string[]
  /** Sugerencias de nombre de bot (3 opciones para el onboarding). */
  botNameSuggestions: readonly string[]
}

// ─── Pack agregado ────────────────────────────────────────────────────────────

/**
 * VerticalPack — unidad atómica de configuración por rubro.
 *
 * Encapsula todo lo que varía entre verticales: scoring, intents,
 * copy de tools y textos del widget. El runtime los consume (EV.2+)
 * para adaptar el motor sin modificar código.
 */
export interface VerticalPack {
  key: VerticalPackKey
  displayName: string
  /**
   * Clave del template de KB de referencia (src/.../kb-templates/).
   * Corresponde a un valor de `Industry` del módulo de onboarding.
   * Opcional: si está ausente el onboarding usa el template `generico`.
   */
  kbTemplateRef?: string
  scoring: VerticalScoring
  intents: VerticalIntents
  toolCopy: VerticalToolCopy
  widgetCopy: VerticalWidgetCopy
}

// ─── Validador de invariante ──────────────────────────────────────────────────

export interface PackScoringValidation {
  valid: boolean
  errors: readonly string[]
}

/**
 * Verifica que el scoring de un pack cumple las invariantes del motor:
 *   1. Señales con puntos no negativos.
 *   2. Combos con puntos no negativos y al menos 2 señales requeridas.
 *   3. Suma máxima alcanzable (señales + combos) ≤ 100.
 *   4. Thresholds en rango: caliente > tibio ≥ 0, caliente ≤ 100.
 *
 * Pura — sin side effects. Usable tanto en tests como en el registry.
 */
export function validatePackScoring(scoring: VerticalScoring): PackScoringValidation {
  const errors: string[] = []

  const { caliente, tibio } = scoring.thresholds

  if (caliente > 100) {
    errors.push(`threshold caliente (${caliente}) excede 100`)
  }
  if (tibio < 0) {
    errors.push(`threshold tibio (${tibio}) es negativo`)
  }
  if (caliente <= tibio) {
    errors.push(`caliente (${caliente}) debe ser mayor que tibio (${tibio})`)
  }

  for (const signal of scoring.signals) {
    if (signal.points < 0) {
      errors.push(`señal "${signal.key}" tiene puntos negativos (${signal.points}); las penalizaciones van en penalties`)
    }
  }

  for (const combo of scoring.combos) {
    if (combo.points < 0) {
      errors.push(`combo "${combo.key}" tiene puntos negativos (${combo.points})`)
    }
    if (combo.requiredSignalKeys.length < 2) {
      errors.push(`combo "${combo.key}" requiere al menos 2 señales, tiene ${combo.requiredSignalKeys.length}`)
    }
  }

  const maxSignals = scoring.signals.reduce((sum, s) => sum + s.points, 0)
  const maxCombos = scoring.combos.reduce((sum, c) => sum + c.points, 0)
  const maxTotal = maxSignals + maxCombos

  if (maxTotal > 100) {
    errors.push(`score máximo alcanzable (${maxTotal}) excede 100; ajustar puntos o agregar clamp en EV.2`)
  }

  return { valid: errors.length === 0, errors }
}
