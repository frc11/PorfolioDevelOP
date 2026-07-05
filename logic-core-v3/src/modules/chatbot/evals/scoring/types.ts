/**
 * Q1.2 — Tipos y schemas de la capa de evaluación.
 *
 * Lee el `RunResult` de Q1.1 (importado de `../types`, NO modificado) y produce
 * veredictos. División estricta:
 *   - asserts DUROS (determinísticos, sin LLM/red) → `AssertOutcome`
 *   - juez LLM (perceptual: tono, loreteo)         → `JudgeVerdict`
 *
 * El juez evalúa, no arregla. Nada acá toca el runtime del bot ni el corredor.
 */
import { z } from 'zod'

// ─── Asserts duros ───────────────────────────────────────────────────────────

export type AssertCategory = 'capture' | 'handoff' | 'mustNotClaim' | 'intent'
export type AssertStatus = 'pass' | 'fail' | 'skip'

export interface AssertOutcome {
  category: AssertCategory
  status: AssertStatus
  /** Explicación legible para el reporte (esperado vs observado). */
  detail: string
  /** Señal blanda (p.ej. `expectedIntent` es best-effort). */
  bestEffort: boolean
}

// ─── Juez LLM ────────────────────────────────────────────────────────────────

/**
 * Forma exacta que el juez debe devolver. `.strict()` para rechazar ruido.
 * Score 1-5 en dos ejes perceptuales; justificación corta.
 */
export const JUDGE_VERDICT_SCHEMA = z
  .object({
    /** 1 (registro ajeno/robótico) … 5 (es-AR natural, suena al rubro). */
    toneScore: z.number().int().min(1).max(5),
    /** 1 (loro: repite frases literales del prompt/KB) … 5 (natural, propio). */
    parrotingScore: z.number().int().min(1).max(5),
    justification: z.string().min(1),
  })
  .strict()

export type JudgeVerdict = z.infer<typeof JUDGE_VERDICT_SCHEMA>

/** Resultado de parsear la respuesta cruda del juez (puro, tolerante). */
export type JudgeParseResult =
  | { ok: true; verdict: JudgeVerdict }
  | { ok: false; reason: string }

/** Estado perceptual de un escenario evaluable. */
export type JudgeStatus =
  | { evaluated: true; verdict: JudgeVerdict }
  | { evaluated: false; reason: string }

// ─── Reporte ─────────────────────────────────────────────────────────────────

export interface ScenarioReport {
  id: string
  pack: string
  description: string
  /** `null` si el escenario es no-evaluable (error de Q1.1). */
  asserts: AssertOutcome[] | null
  /** `null` si no-evaluable; si evaluable, el estado del juez. */
  judge: JudgeStatus | null
  /** Motivo de no-evaluabilidad (si aplica), o `null`. */
  nonEvaluableReason: string | null
}

export interface CategoryTotals {
  pass: number
  fail: number
  skip: number
}

export interface RunReport {
  /** Path del `results/<ISO>.json` evaluado. */
  sourceFile: string
  /** ISO de generación del reporte. */
  generatedAt: string
  /** Modelo juez usado, o `null` si no corrió (`--no-judge` / sin key). */
  judgeModel: string | null
  judgeRan: boolean
  scenarioCount: number
  evaluableCount: number
  nonEvaluableCount: number
  assertTotals: Record<AssertCategory, CategoryTotals>
  scenarios: ScenarioReport[]
}
