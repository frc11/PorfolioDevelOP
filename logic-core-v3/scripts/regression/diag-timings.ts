/**
 * MS-4 — Tooling permanente para diagnosticar el wall clock de la batería
 * de regresión. Lee `ChatbotEvent.metadata.timings` de las conversations del
 * RUN_TAG dado y agrega: server total, LLM total, pipeline propio, medianas
 * y p90. Útil cuando se toca el runner o el server para re-medir el costo
 * real vs el wall clock observado.
 *
 * Run:
 *   npx tsx scripts/regression/diag-timings.ts <RUN_TAG>
 *
 * El RUN_TAG es el sufijo de la sesión (ej. `2026-05-23T20-17-46-942Z`).
 */
import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

// MS-4: si DIRECT_URL está seteado, bypassear pgbouncer (consistente con runner).
const DIRECT_URL = process.env.DIRECT_URL
const prisma = new PrismaClient(
  DIRECT_URL ? { datasources: { db: { url: DIRECT_URL } } } : undefined,
)

function median(xs: number[]) {
  const s = [...xs].sort((a, b) => a - b)
  return s[Math.floor(s.length / 2)]
}
function percentile(xs: number[], p: number) {
  const s = [...xs].sort((a, b) => a - b)
  return s[Math.min(s.length - 1, Math.floor((p / 100) * s.length))]
}

async function main() {
  const RUN_TAG = process.argv[2]
  if (!RUN_TAG) {
    console.error('uso: tsx scripts/regression/diag-timings.ts <RUN_TAG>')
    process.exit(1)
  }

  const sessions = await prisma.conversation.findMany({
    where: { sessionId: { contains: RUN_TAG } },
    select: { id: true, sessionId: true, startedAt: true },
    orderBy: { startedAt: 'asc' },
  })
  console.log(`Run tag: ${RUN_TAG}`)
  console.log(`Conversaciones: ${sessions.length}`)

  type Row = {
    case: string
    turn: number
    total_ms: number | null
    llm_total_ms: number | null
    llm_ttfb_ms: number | null
    llm_stream_ms: number | null
    step_count: number | null
    pipeline_ms: number | null
    tokensIn: number | null
    tokensOut: number | null
    toolCallCount: number | null
  }
  const allTurns: Row[] = []

  for (const s of sessions) {
    const caseId = s.sessionId
      .replace('regression-test-', '')
      .replace(`-${RUN_TAG}`, '')
    const events = await prisma.chatbotEvent.findMany({
      where: { conversationId: s.id, type: 'chat.message_completed' },
      select: { metadata: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    })
    for (let i = 0; i < events.length; i++) {
      const m = (events[i].metadata as Record<string, unknown>) ?? {}
      const t = (m.timings as Record<string, unknown>) ?? {}
      const total = typeof t.total_ms === 'number' ? t.total_ms : null
      const llm = typeof t.llm_total_ms === 'number' ? t.llm_total_ms : null
      allTurns.push({
        case: caseId,
        turn: i + 1,
        total_ms: total,
        llm_total_ms: llm,
        llm_ttfb_ms: typeof t.llm_ttfb_ms === 'number' ? t.llm_ttfb_ms : null,
        llm_stream_ms: typeof t.llm_stream_ms === 'number' ? t.llm_stream_ms : null,
        step_count: typeof t.step_count === 'number' ? t.step_count : null,
        pipeline_ms: total !== null && llm !== null ? total - llm : null,
        tokensIn: typeof m.tokensIn === 'number' ? m.tokensIn : null,
        tokensOut: typeof m.tokensOut === 'number' ? m.tokensOut : null,
        toolCallCount: typeof m.toolCallCount === 'number' ? m.toolCallCount : null,
      })
    }
  }
  console.table(allTurns)

  // Per-case sums
  const byCase = new Map<string, Row[]>()
  for (const r of allTurns) {
    const arr = byCase.get(r.case) ?? []
    arr.push(r)
    byCase.set(r.case, arr)
  }
  console.log('\n─── PER CASE ──────────────')
  const perCase = [...byCase.entries()].map(([c, rows]) => ({
    case: c,
    turns: rows.length,
    total_server_ms: rows.reduce((a, r) => a + (r.total_ms ?? 0), 0),
    total_llm_ms: rows.reduce((a, r) => a + (r.llm_total_ms ?? 0), 0),
    total_pipe_ms: rows.reduce((a, r) => a + (r.pipeline_ms ?? 0), 0),
    gemini_calls: rows.reduce((a, r) => a + (r.step_count ?? 1), 0),
    tools_invocations: rows.reduce((a, r) => a + (r.toolCallCount ?? 0), 0),
  }))
  perCase.sort((a, b) => b.total_server_ms - a.total_server_ms)
  console.table(perCase)

  const valid = allTurns.filter(
    (t) => typeof t.total_ms === 'number' && typeof t.llm_total_ms === 'number',
  ) as Array<
    Row & {
      total_ms: number
      llm_total_ms: number
      llm_ttfb_ms: number
      step_count: number
      pipeline_ms: number
    }
  >
  const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0)
  const turns = valid.length
  const llmCalls = sum(valid.map((t) => t.step_count ?? 1))
  const totalServer = sum(valid.map((t) => t.total_ms))
  const totalLlm = sum(valid.map((t) => t.llm_total_ms))
  const totalPipe = sum(valid.map((t) => t.pipeline_ms))
  console.log('\n─── AGREGADOS ────────────────────────────────')
  console.log(`Turns persistidos: ${turns}`)
  console.log(`Llamadas Gemini (= Σ step_count): ${llmCalls}`)
  console.log(`Suma server-time: ${(totalServer / 1000).toFixed(1)}s`)
  console.log(
    `Suma LLM: ${(totalLlm / 1000).toFixed(1)}s (${((totalLlm / totalServer) * 100).toFixed(1)}%)`,
  )
  console.log(
    `Suma pipeline propio: ${(totalPipe / 1000).toFixed(1)}s (${((totalPipe / totalServer) * 100).toFixed(1)}%)`,
  )
  console.log(`Pipeline mediano por turno: ${median(valid.map((t) => t.pipeline_ms))}ms`)
  console.log(`LLM mediano por turno: ${median(valid.map((t) => t.llm_total_ms))}ms`)
  console.log(`LLM p90 por turno: ${percentile(valid.map((t) => t.llm_total_ms), 90)}ms`)
  console.log(`LLM ttfb mediano: ${median(valid.map((t) => t.llm_ttfb_ms))}ms`)

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
