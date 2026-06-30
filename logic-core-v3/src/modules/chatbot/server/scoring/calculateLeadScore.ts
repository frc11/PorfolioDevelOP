/**
 * B5.2 / B5.3 / B5.4 — Motor de scoring heurístico server-side.
 *
 * Función pura, predecible, CERO LLM. Mismas señales → mismo score base.
 *
 * Tabla POSITIVA (B5.2):
 *
 *   | Señal                                  | Puntos |
 *   |----------------------------------------|-------:|
 *   | requestedAppointment (cita/test drive) |    +40 |
 *   | mentionedFinancing                     |    +25 |
 *   | mentionedTradeIn                       |    +20 |
 *   | askedSpecificModel                     |    +10 |
 *   | providedPhone                          |     +5 |
 *   |                                        |    100 |
 *
 * Combos potenciadores (B5.4):
 *
 *   | Combo                                       | Bonus |
 *   |---------------------------------------------|------:|
 *   | tradeIn + financing (perfil de cierre típico)|   +10 |
 *   | specificModel + appointment (sabe y agenda) |    +5 |
 *
 * El bonus se aplica DESPUÉS de la suma positiva y ANTES de penalties.
 * Score teórico tope tras combos: 115 → clamp final a 100.
 *
 * Penalizaciones / descalificación (B5.3):
 *
 *   | Caso                                            | Efecto |
 *   |-------------------------------------------------|-------:|
 *   | category ∈ {employment, provider, spam}         | DQ directo (score=0) |
 *   | category = postventa                            | −50 (si <0 → DQ)     |
 *   | phone presente pero inválido (validador AR)     | −20                  |
 *
 * Umbrales de clasificación (tras penalties, si no quedó DQ):
 *
 *   score ∈ [70, 100] → hot
 *   score ∈ [40,  69] → warm
 *   score ∈ [ 0,  39] → cold
 *
 * Decaimiento temporal (B5.4 — calculado EN VIVO al leer, sin cron):
 *
 *   | Edad desde capturedAt | Multiplicador | Tier      |
 *   |-----------------------|--------------:|-----------|
 *   | < 24h                 |          1.00 | fresh     |
 *   | 24 – 48h              |          0.90 | cooling   |
 *   | 48 – 72h              |          0.75 | warm      |
 *   | 3 – 7 días            |          0.60 | urgent    |
 *   | 7 – 14 días           |          0.45 | cold      |
 *   | > 14 días             |          0.30 | archived  |
 *
 * El decay NO se persiste — se aplica con `getEffectiveScore()` al leer.
 * Un DQ es DQ siempre (no se enfría hasta dejar de serlo).
 *
 * Explicabilidad (B5.4): `getScoreExplanation()` agrupa los signals en
 * positivos / combos / penalties / dq para la vista de 5B. Los labels
 * persistidos por captura quedan "fotografiados" en su momento.
 */

import { isValidArgentinePhone } from './validateArgentinePhone'
import type {
  VerticalScoring,
  VerticalScoringThresholds,
  VerticalPenaltyCondition,
} from '../verticals/types'
import { USADOS_PACK } from '../verticals/packs/usados'

export interface LeadSignals {
  requestedAppointment: boolean
  mentionedFinancing: boolean
  mentionedTradeIn: boolean
  askedSpecificModel: boolean
  providedPhone: boolean
}

/** Subset de `LeadCategory` (Prisma) que el motor reconoce. */
export type LeadCategoryForScoring =
  | 'sales'
  | 'postventa'
  | 'employment'
  | 'provider'
  | 'spam'
  | 'other'

/** Clasificación expandida con DQ (B5.3). */
export type LeadScoreClassification = 'hot' | 'warm' | 'cold' | 'dq'

export interface ScoredSignal {
  /**
   * Clave estable. Puede ser:
   *   - un `keyof LeadSignals` (señal positiva del lead)
   *   - `combo_<id>` (bonus B5.4)
   *   - `penalty_postventa` / `penalty_invalid_phone` (penalty B5.3)
   *   - `dq_employment` / `dq_provider` / `dq_spam` / `dq_negative_score` (DQ B5.3)
   */
  key: string
  /** Label legible PyME (Telegram, vista 5B, explicabilidad B5.4). */
  label: string
  /** Puntos aportados. Negativo cuando es penalización. */
  points: number
}

export interface ScoreInput {
  signals: LeadSignals
  category: LeadCategoryForScoring
  /** Teléfono crudo del input. Si está presente y no valida como AR, resta 20. */
  phone?: string | null
}

export interface ScoreResult {
  score: number
  classification: LeadScoreClassification
  /**
   * Sólo las señales/combos/penalties que efectivamente movieron el score.
   * Persiste en `ChatbotLead.scoreSignals` para explicabilidad B5.4.
   */
  signals: ScoredSignal[]
  /**
   * Razón estructurada del DQ (null si no quedó DQ). Permite mostrar UI
   * tipo "Este lead se descartó porque buscaba trabajo" sin parsear strings.
   */
  dqReason:
    | null
    | 'category_employment'
    | 'category_provider'
    | 'category_spam'
    | 'negative_score_after_penalty'
}

/**
 * Tabla POSITIVA lockeada. Si los puntos cambian, ajustar el research B5.0
 * ANTES. El orden importa: es el orden visual de la explicabilidad
 * (mayor a menor impacto). Labels en lenguaje de dueño de PyME.
 */
export const SCORING_TABLE: readonly ScoredSignal[] = [
  { key: 'requestedAppointment', label: 'Pidió cita / test drive',     points: 40 },
  { key: 'mentionedFinancing',   label: 'Pidió financiación / cuotas', points: 25 },
  { key: 'mentionedTradeIn',     label: 'Tiene usado para entregar',   points: 20 },
  { key: 'askedSpecificModel',   label: 'Pregunta por modelo específico', points: 10 },
  { key: 'providedPhone',        label: 'Dejó teléfono',               points: 5 },
] as const

export const HOT_THRESHOLD = 70
export const WARM_THRESHOLD = 40

// EV.3 — SCORING_TABLE/COMBO_BONUSES/HOT_THRESHOLD/WARM_THRESHOLD y las dos
// penalties de abajo ya NO las consume el motor (lee del pack pasado en
// `scoring`). Se conservan exportadas como REFERENCIA LEGACY: la suite de
// invariantes (ev3.invariant.ts) afirma que el pack `usados` las reproduce
// verbatim (pack ≡ constantes). No las uses como fuente de verdad del runtime.
/** Penalty B5.3 por postventa (no-DQ pero baja prioridad). Referencia verbatim. */
export const POSTVENTA_PENALTY = 50
/** Penalty B5.3 por teléfono con formato inválido. Referencia verbatim. */
export const INVALID_PHONE_PENALTY = 20

/**
 * Combos B5.4 — bonus aditivos que se aplican si ambas flags están en true.
 * Aplican DESPUÉS de la suma positiva y ANTES de penalties (el clamp final
 * deja todo en [0, 100]).
 *
 * Diseño: bonus chicos y específicos. La fuerza viene de la sumatoria, no
 * del combo. Si dos combos disparan juntos, suman (no se anulan).
 */
export interface ComboBonus {
  key: string
  label: string
  points: number
  /** Condición sobre las señales originales. Pura. */
  matches: (s: LeadSignals) => boolean
}

export const COMBO_BONUSES: readonly ComboBonus[] = [
  {
    key: 'combo_tradein_financing',
    label: 'Tiene usado + pide financiación (perfil de cierre)',
    points: 10,
    matches: (s) => s.mentionedTradeIn && s.mentionedFinancing,
  },
  {
    key: 'combo_specific_model_appointment',
    label: 'Sabe qué modelo quiere + agenda visita',
    points: 5,
    matches: (s) => s.askedSpecificModel && s.requestedAppointment,
  },
] as const

/**
 * Labels PyME de los DQ por categoría. Vertical-agnósticos (no varían por
 * rubro), por eso viven en el motor y no en el pack: el contrato
 * `VerticalScoring.dqCategories` es solo la lista de claves.
 */
const DQ_CATEGORY_LABELS: Record<string, string> = {
  employment: 'busca trabajo',
  provider: 'proveedor (ofrece servicios)',
  spam: 'spam',
}

/**
 * EV.3 — Evalúa la condición de una penalty del pack contra el input.
 * Switch exhaustivo sobre `VerticalPenaltyCondition` (el compilador exige
 * cubrir cada variante; agregar una nueva rompe el build hasta manejarla).
 */
function penaltyApplies(condition: VerticalPenaltyCondition, input: ScoreInput): boolean {
  switch (condition) {
    case 'category_postventa':
      return input.category === 'postventa'
    case 'invalid_phone':
      return Boolean(input.phone) && !isValidArgentinePhone(input.phone)
  }
}

/**
 * EV.3 — Clasifica un score con los thresholds del pack. Equivalente a
 * `classifyScore` pero parametrizado por vertical (el pack `usados` usa
 * {70, 40}, idéntico a HOT/WARM_THRESHOLD → paridad exacta).
 */
function classifyWithThresholds(
  score: number,
  thresholds: VerticalScoringThresholds,
): Exclude<LeadScoreClassification, 'dq'> {
  if (score >= thresholds.caliente) return 'hot'
  if (score >= thresholds.tibio) return 'warm'
  return 'cold'
}

/**
 * Clasifica un score numérico en hot/warm/cold según los umbrales lockeados.
 * NO devuelve 'dq' — el caller decide DQ por categoría o por score negativo
 * tras penalties (ver `calculateLeadScore`). Usado también por
 * `getEffectiveScore` para re-clasificar tras aplicar decay.
 */
export function classifyScore(score: number): Exclude<LeadScoreClassification, 'dq'> {
  if (score >= HOT_THRESHOLD) return 'hot'
  if (score >= WARM_THRESHOLD) return 'warm'
  return 'cold'
}

/**
 * Aplica la tabla + combos + penalties + DQ. Función pura, sin side effects.
 *
 * EV.3 — La configuración de scoring (señales, combos, penalties, categorías
 * DQ, thresholds) ya NO está hardcodeada: se lee del pack vertical pasado en
 * `scoring`. El default `USADOS_PACK.scoring` es SOLO una afordancia de
 * back-compat para llamadas de 1 argumento (la suite dorada de paridad) —
 * reproduce la tabla histórica verbatim. EN PRODUCCIÓN este default NO se usa:
 * captureLead SIEMPRE inyecta el scoring del pack resuelto del bot
 * (`getVerticalPack(botConfig.verticalPack ?? 'base')`), que puede ser `usados`
 * o `base` según la columna. Ver la nota de paridad/backfill en captureLead.
 *
 * Orden de evaluación (importante — DQ por categoría no-comercial pisa todo):
 *   1. Si category ∈ scoring.dqCategories → DQ inmediato.
 *   2. Calcular suma positiva de señales (scoring.signals).
 *   3. Aplicar combos (scoring.combos): bonus aditivos si TODAS las señales
 *      requeridas están activas.
 *   4. Aplicar penalties (scoring.penalties) en orden, cada una según su condición.
 *   5. Si el score quedó negativo → DQ por score negativo.
 *   6. Clamp [0, 100] + clasificar con scoring.thresholds.
 */
export function calculateLeadScore(
  input: ScoreInput,
  scoring: VerticalScoring = USADOS_PACK.scoring,
): ScoreResult {
  // 1. DQ por categoría no-comercial — corte rápido, score 0.
  if (scoring.dqCategories.includes(input.category)) {
    const label = DQ_CATEGORY_LABELS[input.category] ?? input.category
    return {
      score: 0,
      classification: 'dq',
      signals: [
        {
          key: `dq_${input.category}`,
          label: `Descartado: ${label}`,
          points: 0,
        },
      ],
      dqReason: `category_${input.category}` as ScoreResult['dqReason'],
    }
  }

  // 2. Suma positiva — señales del pack. `LeadSignals` se indexa por clave de
  //    señal; una clave del pack ausente del input se trata como inactiva.
  const signalValues = input.signals as unknown as Record<string, boolean>
  const signals: ScoredSignal[] = []
  let score = 0
  for (const def of scoring.signals) {
    if (signalValues[def.key]) {
      score += def.points
      signals.push({ key: def.key, label: def.label, points: def.points })
    }
  }

  // 3. Combos — bonus aditivos. Dispara si TODAS las señales requeridas están
  //    activas (equivalente declarativo del `matches` original). Cada combo
  //    aporta independientemente (no se anulan).
  for (const combo of scoring.combos) {
    if (combo.requiredSignalKeys.every((key) => Boolean(signalValues[key]))) {
      score += combo.points
      signals.push({ key: combo.key, label: combo.label, points: combo.points })
    }
  }

  // 4. Penalties del pack en orden. `points` ya es negativo. La penalty de
  //    teléfono solo aplica si vino phone (no penaliza a quien dejó solo email).
  for (const penalty of scoring.penalties) {
    if (penaltyApplies(penalty.condition, input)) {
      score += penalty.points
      signals.push({ key: penalty.key, label: penalty.label, points: penalty.points })
    }
  }

  // 5. Score negativo tras penalties → DQ.
  if (score < 0) {
    return {
      score: 0,
      classification: 'dq',
      signals,
      dqReason: 'negative_score_after_penalty',
    }
  }

  // 6. Clamp [0, 100] y clasificar con los thresholds del pack.
  const finalScore = Math.max(0, Math.min(100, score))
  return {
    score: finalScore,
    classification: classifyWithThresholds(finalScore, scoring.thresholds),
    signals,
    dqReason: null,
  }
}

/**
 * EV.3 — Snapshot estructurado de señales para `ChatbotLead.signals` (dual-write).
 *
 * Mapea cada señal del pack → `{ value, points }`: `value` indica si la señal
 * estuvo activa, `points` su aporte (los puntos de la señal si activa, 0 si no).
 * Se persiste ADEMÁS de las columnas booleanas legacy del lead, nunca en
 * reemplazo. Pura, sin side effects.
 */
export function buildSignalsSnapshot(
  signalValues: Record<string, boolean>,
  scoring: VerticalScoring,
): Record<string, { value: boolean; points: number }> {
  const snapshot: Record<string, { value: boolean; points: number }> = {}
  for (const def of scoring.signals) {
    const value = Boolean(signalValues[def.key])
    snapshot[def.key] = { value, points: value ? def.points : 0 }
  }
  return snapshot
}

// ─── B5.4 — Decaimiento temporal en lectura ─────────────────────────────────

/** Tier de antigüedad. UI y dueño leen esto, no el multiplier crudo. */
export type DecayTier = 'fresh' | 'cooling' | 'warm' | 'urgent' | 'cold' | 'archived'

/**
 * Curva escalonada. Lockeada — si cambia, ajustar la batería B5.4 también.
 * Orden importa: se evalúa el primer tramo donde `ageDays < maxDays`.
 * El último tramo (Infinity) es el piso `archived`.
 */
export const DECAY_CURVE: ReadonlyArray<{
  tier: DecayTier
  /** Tope superior del tramo en días desde `lastActivityAt` (exclusivo). */
  maxDays: number
  multiplier: number
  label: string
}> = [
  { tier: 'fresh',    maxDays: 1,        multiplier: 1.00, label: 'Recién capturado' },
  { tier: 'cooling',  maxDays: 2,        multiplier: 0.90, label: 'Un día sin responder' },
  { tier: 'warm',     maxDays: 3,        multiplier: 0.75, label: 'Dos días sin responder' },
  { tier: 'urgent',   maxDays: 7,        multiplier: 0.60, label: 'Casi una semana sin responder' },
  { tier: 'cold',     maxDays: 14,       multiplier: 0.45, label: 'Más de una semana frío' },
  { tier: 'archived', maxDays: Infinity, multiplier: 0.30, label: 'Casi perdido' },
] as const

const MS_PER_DAY = 1000 * 60 * 60 * 24

export interface DecayResult {
  /** Score base multiplicado por el factor de antigüedad, clamp [0, 100]. */
  effectiveScore: number
  /** Multiplicador aplicado (0.30 – 1.00). */
  multiplier: number
  tier: DecayTier
  /** Label PyME del tramo (UI). */
  tierLabel: string
  /** Días desde lastActivityAt (puede ser fraccional). */
  ageDays: number
}

/**
 * Aplica la curva de decaimiento a un score base. Pura — recibe `now`
 * inyectable para tests deterministas.
 *
 * Reglas:
 *   - baseScore <= 0 → effectiveScore=0 (un score 0 no se "enfría" más).
 *   - lastActivityAt en el futuro (clock skew) → multiplier=1, sin penalizar.
 *   - El score efectivo nunca baja de 0 ni sube de 100 (clamp final).
 */
export function applyTimeDecay(
  baseScore: number,
  lastActivityAt: Date | string | null | undefined,
  now: Date = new Date(),
): DecayResult {
  // unstable_cache deserializa Date → string; tolerar string/null/undefined sin romper (B5.5).
  // Si no hay fecha o es inválida, asumir actividad reciente (multiplier=1) — el score
  // crudo igual decide. Evita TypeError en datos legacy o fallas de cache.
  let activityMs: number
  if (lastActivityAt instanceof Date) {
    activityMs = lastActivityAt.getTime()
  } else if (typeof lastActivityAt === 'string') {
    activityMs = new Date(lastActivityAt).getTime()
  } else {
    activityMs = now.getTime()
  }
  if (!Number.isFinite(activityMs)) activityMs = now.getTime()
  const ageMs = now.getTime() - activityMs
  const ageDays = Math.max(0, ageMs / MS_PER_DAY)

  const tier = DECAY_CURVE.find((t) => ageDays < t.maxDays) ?? DECAY_CURVE[DECAY_CURVE.length - 1]

  if (baseScore <= 0) {
    return { effectiveScore: 0, multiplier: tier.multiplier, tier: tier.tier, tierLabel: tier.label, ageDays }
  }

  const raw = baseScore * tier.multiplier
  const effectiveScore = Math.max(0, Math.min(100, Math.round(raw)))

  return {
    effectiveScore,
    multiplier: tier.multiplier,
    tier: tier.tier,
    tierLabel: tier.label,
    ageDays,
  }
}

export interface LeadScoreSnapshot {
  score: number
  classification: LeadScoreClassification
  /** Momento de la última actividad — típicamente `capturedAt`. */
  lastActivityAt: Date
}

export interface EffectiveScoreResult {
  effectiveScore: number
  effectiveClassification: LeadScoreClassification
  decayMultiplier: number
  decayTier: DecayTier
  decayTierLabel: string
  ageDays: number
}

/**
 * Combina decay + re-clasificación para uso desde la vista 5B.
 *
 * Regla absoluta: un lead DQ es DQ siempre. El decay NO lo "rescata" ni lo
 * re-clasifica — devuelve el snapshot tal cual. Esto evita que un lead
 * descartado por DQ se "limpie con el tiempo" y vuelva a aparecer en
 * listados de hot/warm/cold.
 */
export function getEffectiveScore(
  snapshot: LeadScoreSnapshot,
  now: Date = new Date(),
): EffectiveScoreResult {
  if (snapshot.classification === 'dq') {
    return {
      effectiveScore: snapshot.score,
      effectiveClassification: 'dq',
      decayMultiplier: 1,
      decayTier: 'fresh',
      decayTierLabel: DECAY_CURVE[0].label,
      ageDays: 0,
    }
  }

  const decay = applyTimeDecay(snapshot.score, snapshot.lastActivityAt, now)
  return {
    effectiveScore: decay.effectiveScore,
    effectiveClassification: classifyScore(decay.effectiveScore),
    decayMultiplier: decay.multiplier,
    decayTier: decay.tier,
    decayTierLabel: decay.tierLabel,
    ageDays: decay.ageDays,
  }
}

// ─── B5.4 — Explicabilidad legible ──────────────────────────────────────────

export type ScoreExplanationKind = 'positive' | 'combo' | 'penalty' | 'dq'

export interface ScoreExplanationLine extends ScoredSignal {
  kind: ScoreExplanationKind
}

/**
 * Clasifica un `ScoredSignal` persistido en uno de los 4 tipos para la UI.
 * Deriva del prefijo del key — no requiere metadata adicional, así que es
 * retroactivo con scoreSignals de B5.1/B5.2/B5.3 sin migración.
 */
function classifySignalKind(key: string): ScoreExplanationKind {
  if (key.startsWith('combo_')) return 'combo'
  if (key.startsWith('penalty_')) return 'penalty'
  if (key.startsWith('dq_')) return 'dq'
  return 'positive'
}

/**
 * Convierte `ScoredSignal[]` (persistido en DB) en líneas listas para la UI:
 * agrupadas por tipo, en orden estable (positivos > combos > penalties > dq),
 * con `kind` derivado del key. Pensada para la vista de 5B, que muestra el
 * "por qué" del score sin recalcular.
 *
 * NO recalcula nada — respeta el snapshot guardado en captura. Si los labels
 * cambiaron entre captura y lectura, los viejos se ven tal cual (el cliente
 * ve lo que vio el motor al capturar — auditabilidad por sobre cosmética).
 */
export function getScoreExplanation(signals: ScoredSignal[]): ScoreExplanationLine[] {
  const KIND_ORDER: Record<ScoreExplanationKind, number> = {
    positive: 0,
    combo: 1,
    penalty: 2,
    dq: 3,
  }

  return signals
    .map((s) => ({ ...s, kind: classifySignalKind(s.key) }))
    .sort((a, b) => KIND_ORDER[a.kind] - KIND_ORDER[b.kind])
}
