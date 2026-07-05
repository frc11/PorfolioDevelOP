/**
 * Q1.2 — Agregador + render del reporte. `buildReport` es PURO (asserts +
 * veredictos del juez → `RunReport`). Render a markdown (archivo) y consola.
 *
 * Tres bloques separados, como pide el sprint: asserts duros, juez perceptual,
 * y NO-evaluables (error de Q1.1) aparte — estos últimos ni pass ni fail.
 */
import type { RunResult } from '../types'
import type {
  AssertCategory,
  AssertOutcome,
  CategoryTotals,
  JudgeStatus,
  RunReport,
  ScenarioReport,
} from './types'
import { evaluateAsserts } from './hard-asserts'
import { scenarioNonEvaluableReason } from './resolve'

const CATEGORIES: readonly AssertCategory[] = ['capture', 'handoff', 'mustNotClaim', 'intent']

const CATEGORY_LABEL: Record<AssertCategory, string> = {
  capture: 'captura (lead)',
  handoff: 'handoff',
  mustNotClaim: 'mustNotClaim',
  intent: 'intent (best-effort)',
}

export interface BuildOptions {
  sourceFile: string
  generatedAt: string
  judgeModel: string | null
  judgeRan: boolean
  /** Veredicto del juez por `scenario.id` (solo escenarios evaluables). */
  judgeByScenario: Map<string, JudgeStatus>
}

export function buildReport(run: RunResult, opts: BuildOptions): RunReport {
  const scenarios: ScenarioReport[] = []
  const assertTotals: Record<AssertCategory, CategoryTotals> = {
    capture: { pass: 0, fail: 0, skip: 0 },
    handoff: { pass: 0, fail: 0, skip: 0 },
    mustNotClaim: { pass: 0, fail: 0, skip: 0 },
    intent: { pass: 0, fail: 0, skip: 0 },
  }
  let evaluableCount = 0
  let nonEvaluableCount = 0

  for (const sc of run.scenarios) {
    const reason = scenarioNonEvaluableReason(sc)
    if (reason !== null) {
      nonEvaluableCount++
      scenarios.push({
        id: sc.id,
        pack: sc.pack,
        description: sc.description,
        asserts: null,
        judge: null,
        nonEvaluableReason: reason,
      })
      continue
    }
    evaluableCount++
    const asserts = evaluateAsserts(sc)
    for (const a of asserts) assertTotals[a.category][a.status]++
    scenarios.push({
      id: sc.id,
      pack: sc.pack,
      description: sc.description,
      asserts,
      judge: opts.judgeByScenario.get(sc.id) ?? null,
      nonEvaluableReason: null,
    })
  }

  return {
    sourceFile: opts.sourceFile,
    generatedAt: opts.generatedAt,
    judgeModel: opts.judgeModel,
    judgeRan: opts.judgeRan,
    scenarioCount: run.scenarios.length,
    evaluableCount,
    nonEvaluableCount,
    assertTotals,
    scenarios,
  }
}

// ─── Render markdown ─────────────────────────────────────────────────────────

function escapeCell(s: string): string {
  return s.replace(/\|/g, '\\|').replace(/\n+/g, ' ').trim()
}

export function renderMarkdown(r: RunReport): string {
  const L: string[] = []
  L.push('# Q1.2 — Reporte de evaluación de la batería', '')
  L.push(`- **Fuente:** \`${r.sourceFile}\``)
  L.push(`- **Generado:** ${r.generatedAt}`)
  L.push(
    `- **Juez:** ${r.judgeRan && r.judgeModel ? `\`${r.judgeModel}\`` : 'no corrió (solo asserts duros)'}`,
  )
  L.push(
    `- **Escenarios:** ${r.scenarioCount} — ${r.evaluableCount} evaluables, ${r.nonEvaluableCount} no-evaluables`,
  )
  L.push('')

  // Asserts duros
  L.push('## Asserts duros (determinísticos, sin LLM)', '')
  L.push('| Categoría | pass | fail | skip |', '|---|---|---|---|')
  for (const cat of CATEGORIES) {
    const t = r.assertTotals[cat]
    L.push(`| ${CATEGORY_LABEL[cat]} | ${t.pass} | ${t.fail} | ${t.skip} |`)
  }
  L.push('')

  const fails: Array<{ id: string; pack: string; a: AssertOutcome }> = []
  for (const s of r.scenarios) {
    for (const a of s.asserts ?? []) {
      if (a.status === 'fail') fails.push({ id: s.id, pack: s.pack, a })
    }
  }
  L.push('### Fallos de asserts', '')
  if (fails.length === 0) {
    L.push('_Sin fallos._', '')
  } else {
    for (const f of fails) {
      const flag = f.a.bestEffort ? ' _[best-effort]_' : ''
      L.push(`- **${f.id}** (${f.pack}) · ${CATEGORY_LABEL[f.a.category]}${flag}: ${f.a.detail}`)
    }
    L.push('')
  }

  // Juez perceptual
  L.push(`## Juez perceptual${r.judgeRan && r.judgeModel ? ` — ${r.judgeModel}` : ''}`, '')
  const anyJudged = r.scenarios.some((s) => s.judge?.evaluated === true)
  if (!anyJudged) {
    L.push('_Ningún escenario evaluado perceptualmente._', '')
  } else {
    L.push('| Escenario | pack | tono | loreteo | nota |', '|---|---|---|---|---|')
    for (const s of r.scenarios) {
      if (s.judge?.evaluated !== true) continue
      const v = s.judge.verdict
      L.push(`| ${s.id} | ${s.pack} | ${v.toneScore}/5 | ${v.parrotingScore}/5 | ${escapeCell(v.justification)} |`)
    }
    L.push('')
  }

  const notJudged = r.scenarios.filter((s) => s.judge !== null && s.judge.evaluated === false)
  if (notJudged.length > 0) {
    L.push('### No evaluados perceptualmente', '')
    for (const s of notJudged) {
      const reason = s.judge && !s.judge.evaluated ? s.judge.reason : ''
      L.push(`- **${s.id}** (${s.pack}): ${reason}`)
    }
    L.push('')
  }

  // No-evaluables (error de Q1.1)
  L.push('## No evaluables (error de Q1.1 — ni asserts ni juez)', '')
  const nonEval = r.scenarios.filter((s) => s.nonEvaluableReason !== null)
  if (nonEval.length === 0) {
    L.push('_Ninguno._', '')
  } else {
    for (const s of nonEval) {
      L.push(`- **${s.id}** (${s.pack}): ${s.nonEvaluableReason}`)
    }
    L.push('')
  }

  L.push(
    '---',
    '_Asserts duros: determinísticos (misma entrada → mismo veredicto). Juez: perceptual, puede variar entre corridas._',
  )
  return L.join('\n') + '\n'
}

// ─── Render consola ──────────────────────────────────────────────────────────

export function renderConsole(r: RunReport): string {
  const L: string[] = []
  L.push(
    `[Q1.2] ${r.scenarioCount} escenarios — ${r.evaluableCount} evaluables, ${r.nonEvaluableCount} no-evaluables`,
  )
  const catLine = (cat: AssertCategory): string => {
    const c = r.assertTotals[cat]
    return `${CATEGORY_LABEL[cat]} ${c.pass}✓/${c.fail}✗/${c.skip}–`
  }
  L.push('Asserts: ' + CATEGORIES.map(catLine).join('  |  '))

  const fails = r.scenarios.flatMap((s) =>
    (s.asserts ?? []).filter((a) => a.status === 'fail').map((a) => ({ id: s.id, a })),
  )
  if (fails.length > 0) {
    L.push(`Fallos (${fails.length}):`)
    for (const f of fails) L.push(`  ✗ ${f.id} · ${CATEGORY_LABEL[f.a.category]}: ${f.a.detail}`)
  }

  if (r.judgeRan) {
    const judged = r.scenarios.filter((s) => s.judge?.evaluated === true)
    L.push(`Juez (${r.judgeModel ?? '?'}): ${judged.length} evaluado(s)`)
    for (const s of r.scenarios) {
      if (s.judge?.evaluated !== true) continue
      L.push(`  · ${s.id}: tono ${s.judge.verdict.toneScore}/5, loro ${s.judge.verdict.parrotingScore}/5`)
    }
  }

  const nonEval = r.scenarios.filter((s) => s.nonEvaluableReason !== null)
  if (nonEval.length > 0) {
    L.push(`No evaluables (${nonEval.length}): ${nonEval.map((s) => s.id).join(', ')}`)
  }
  return L.join('\n')
}
