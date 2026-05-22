// B1.4 — inline analysis of the most recent latency test by runId.
// Reads ChatbotEvent.metadata.timings for all conversations of a runId
// and reports stage breakdown + parallel-vs-sequential savings + cache hit rate.
// Throwaway — delete after B1.4 sprint.
//
// Usage: node scripts/_b14-analyze.mjs <runId>
//   (if no runId, picks the latest conversation with sessionId starting 'b13-')

import { PrismaClient } from '@prisma/client'
import 'dotenv/config'

const p = new PrismaClient()

function pct(arr, q) {
  if (!arr.length) return null
  const s = [...arr].sort((a, b) => a - b)
  return s[Math.min(s.length - 1, Math.floor(s.length * q))]
}
function stat(arr) {
  if (!arr.length) return null
  const s = [...arr].sort((a, b) => a - b)
  return {
    n: s.length,
    min: s[0],
    p50: pct(arr, 0.5),
    p90: pct(arr, 0.9),
    p95: pct(arr, 0.95),
    max: s[s.length - 1],
    mean: Math.round(s.reduce((a, b) => a + b, 0) / s.length),
  }
}
function pad(v, n) {
  return String(v ?? '--').padStart(n)
}

async function main() {
  let runId = process.argv[2]
  if (!runId) {
    const latest = await p.conversation.findFirst({
      where: { sessionId: { startsWith: 'b13-' } },
      orderBy: { startedAt: 'desc' },
      select: { sessionId: true },
    })
    runId = latest?.sessionId.match(/^b13-\d+/)?.[0]
    if (!runId) throw new Error('No b13- runs found in DB')
    console.log(`(auto-detected runId from latest conv: ${runId})`)
  }
  console.log(`Run: ${runId}\n`)

  const convs = await p.conversation.findMany({
    where: { sessionId: { startsWith: runId + '-' } },
    select: {
      sessionId: true,
      events: { where: { type: 'chat.message_completed' }, select: { metadata: true }, take: 1 },
    },
  })

  const keys = [
    'validation_ms', 'bot_resolve_ms', 'rate_limit_ms',
    'quota_only_ms', 'conv_only_ms', 'db_pre_llm_ms',
    'user_msg_persist_ms', 'intent_ms', 'prompt_build_ms', 'llm_setup_ms',
    'llm_ttfb_ms', 'llm_stream_ms', 'llm_total_ms',
    'post_persist_ms', 'total_ms',
  ]
  const b = Object.fromEntries(keys.map((k) => [k, []]))
  let matched = 0
  for (const c of convs) {
    const t = c.events[0]?.metadata?.timings
    if (!t) continue
    matched++
    for (const k of keys) if (typeof t[k] === 'number') b[k].push(t[k])
  }
  console.log(`Conversations with timings: ${matched} / ${convs.length}\n`)

  console.log('Stage                  n   min     p50     p90     p95     max    mean')
  for (const k of keys) {
    const s = stat(b[k])
    if (!s) { console.log(`  ${k.padEnd(20)} (no data)`); continue }
    console.log(`  ${k.padEnd(20)} ${pad(s.n, 3)} ${pad(s.min, 5)} ${pad(s.p50, 7)} ${pad(s.p90, 7)} ${pad(s.p95, 7)} ${pad(s.max, 7)} ${pad(s.mean, 7)}`)
  }

  const qs = stat(b.quota_only_ms)
  const cs = stat(b.conv_only_ms)
  const dbs = stat(b.db_pre_llm_ms)
  console.log('\n===== PARALLEL vs ESTIMATED SEQUENTIAL =====')
  if (qs && cs && dbs) {
    console.log(`  quota_only_ms     p50=${pad(qs.p50, 5)}ms  p95=${pad(qs.p95, 5)}ms`)
    console.log(`  conv_only_ms      p50=${pad(cs.p50, 5)}ms  p95=${pad(cs.p95, 5)}ms`)
    console.log(`  db_pre_llm_ms     p50=${pad(dbs.p50, 5)}ms  p95=${pad(dbs.p95, 5)}ms  (actual parallel = max of the two)`)
    const seqP50 = qs.p50 + cs.p50
    const seqP95 = qs.p95 + cs.p95
    const savP50 = seqP50 - dbs.p50
    const savP95 = seqP95 - dbs.p95
    console.log(`  estimated seq p50=${pad(seqP50, 5)}ms`)
    console.log(`  estimated seq p95=${pad(seqP95, 5)}ms`)
    console.log(`  SAVINGS p50 = ${savP50}ms  (${(savP50 / seqP50 * 100).toFixed(0)}% reduction vs sequential)`)
    console.log(`  SAVINGS p95 = ${savP95}ms  (${(savP95 / seqP95 * 100).toFixed(0)}% reduction vs sequential)`)
  }

  const cacheRows = convs.map((c) => c.events[0]?.metadata?.timings?.bot_resolve_ms).filter((t) => typeof t === 'number')
  const hits = cacheRows.filter((t) => t <= 5).length
  const misses = cacheRows.filter((t) => t > 50).length
  console.log('\n===== CACHE HIT RATE (resolveBotBySlug) =====')
  console.log(`  total: ${cacheRows.length}`)
  console.log(`  hits (<=5ms): ${hits} (${(hits / cacheRows.length * 100).toFixed(1)}%)`)
  console.log(`  misses (>50ms): ${misses} (${(misses / cacheRows.length * 100).toFixed(1)}%)`)
  console.log(`  sequence (ms): ${cacheRows.join(', ')}`)

  await p.$disconnect()
}

main().catch(async (e) => { console.error(e); await p.$disconnect(); process.exit(1) })
