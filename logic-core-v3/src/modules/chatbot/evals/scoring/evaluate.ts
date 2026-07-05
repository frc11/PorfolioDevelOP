/**
 * Q1.2 — Entry point del evaluador.
 *
 *   npm run evals:score                 # último results/*.json, con juez si hay key
 *   npm run evals:score -- --file <p>   # un archivo puntual
 *   npm run evals:score -- --no-judge   # solo asserts (determinístico, sin red/costo)
 *
 * Lee un `results/<ISO>.json` de Q1.1, corre asserts duros + (opcional) juez, y
 * escribe `reports/<ISO>.md` + un resumen en consola. NO toca el corredor ni el bot.
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { config } from 'dotenv'
import { flagValue, hasFlag } from '../shared'
import { findLatestResults, loadResults, REPORTS_DIR } from './load'
import { buildReport, renderConsole, renderMarkdown } from './report'
import { getJudgeModel, hasJudgeApiKey, judgeScenario } from './judge'
import { scenarioNonEvaluableReason } from './resolve'
import type { JudgeStatus } from './types'

// Env para ANTHROPIC_API_KEY (mismo patrón que el resto de scripts de evals).
config({ path: '.env.local' })
config({ path: '.env' })

async function main(): Promise<void> {
  const noJudge = hasFlag('--no-judge')
  const sourceFile = flagValue('--file') ?? findLatestResults()
  if (!sourceFile) {
    console.error(
      '[Q1.2] No hay archivo de resultados. Pasá `--file <path>` o corré `npm run evals` primero.',
    )
    process.exit(1)
  }

  const run = loadResults(sourceFile)
  const evaluables = run.scenarios.filter((s) => scenarioNonEvaluableReason(s) === null)

  // Juez: solo escenarios evaluables, si hay key y no se pasó --no-judge.
  const keyPresent = hasJudgeApiKey()
  const judgeRan = !noJudge && keyPresent
  const judgeByScenario = new Map<string, JudgeStatus>()

  if (noJudge) {
    console.log('[Q1.2] --no-judge: solo asserts duros (determinístico, sin red).')
  } else if (!keyPresent) {
    console.warn(
      '[Q1.2] Sin ANTHROPIC_API_KEY → juez omitido (solo asserts). Seteala en .env.local para los veredictos de tono.',
    )
  }

  if (judgeRan) {
    console.log(`[Q1.2] Juez ${getJudgeModel()} · evaluando ${evaluables.length} escenario(s)…`)
    for (const sc of evaluables) {
      // Secuencial: respeta rate limits; el SDK reintenta 429/5xx por su cuenta.
      const status = await judgeScenario(sc)
      judgeByScenario.set(sc.id, status)
      console.log(
        `  · ${sc.id}: ${
          status.evaluated
            ? `tono ${status.verdict.toneScore}/5, loro ${status.verdict.parrotingScore}/5`
            : `no evaluado (${status.reason})`
        }`,
      )
    }
  } else {
    const reason = noJudge ? '--no-judge' : 'sin ANTHROPIC_API_KEY'
    for (const sc of evaluables) judgeByScenario.set(sc.id, { evaluated: false, reason })
  }

  const generatedAt = new Date().toISOString()
  const report = buildReport(run, {
    sourceFile,
    generatedAt,
    judgeModel: judgeRan ? getJudgeModel() : null,
    judgeRan,
    judgeByScenario,
  })

  console.log('\n' + renderConsole(report))

  mkdirSync(REPORTS_DIR, { recursive: true })
  const outPath = join(REPORTS_DIR, `${generatedAt.replace(/[:.]/g, '-')}.md`)
  writeFileSync(outPath, renderMarkdown(report), 'utf8')
  console.log(`\n[Q1.2] Reporte escrito en ${outPath}`)

  process.exit(0)
}

main().catch((err: unknown) => {
  console.error('[Q1.2] Error fatal:', err instanceof Error ? err.message : err)
  process.exit(1)
})
