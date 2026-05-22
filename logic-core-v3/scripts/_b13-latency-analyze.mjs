// B1.3 — Pulls per-stage timing breakdown from ChatbotEvent for a given run.
// Reads the most recent _b13-latency-*.json from scripts/ (or accepts a path
// as the first CLI arg), joins with chatbot_events rows by sessionId prefix,
// and prints percentiles + per-stage share of the total.
// Throwaway script — delete after B1.3 sprint.
//
// Usage:
//   node scripts/_b13-latency-analyze.mjs
//   node scripts/_b13-latency-analyze.mjs scripts/_b13-latency-b13-1748xxx.json

import { PrismaClient } from '@prisma/client'
import 'dotenv/config'
import fs from 'node:fs/promises'
import path from 'node:path'

const prisma = new PrismaClient()

function fmt(n, pad = 5) {
  if (n === null || n === undefined || Number.isNaN(n)) return '--'.padStart(pad)
  return String(Math.round(n)).padStart(pad)
}

function fmtPct(n) {
  if (n === null || n === undefined || Number.isNaN(n)) return '  --'
  return `${n.toFixed(1).padStart(4)}%`
}

function percentile(sorted, p) {
  if (sorted.length === 0) return null
  const idx = Math.min(sorted.length - 1, Math.floor(sorted.length * p))
  return sorted[idx]
}

function stats(values) {
  const valid = values.filter((v) => typeof v === 'number' && !Number.isNaN(v))
  if (valid.length === 0) return null
  const sorted = [...valid].sort((a, b) => a - b)
  const sum = sorted.reduce((a, b) => a + b, 0)
  return {
    n: valid.length,
    min: sorted[0],
    p50: percentile(sorted, 0.5),
    p90: percentile(sorted, 0.9),
    p95: percentile(sorted, 0.95),
    max: sorted[sorted.length - 1],
    mean: sum / sorted.length,
    sum,
  }
}

async function findClientResultsFile(maybePath) {
  if (maybePath) return maybePath
  const dir = path.join(process.cwd(), 'scripts')
  const entries = await fs.readdir(dir)
  const matches = entries
    .filter((f) => f.startsWith('_b13-latency-') && f.endsWith('.json'))
    .map((f) => ({ f, full: path.join(dir, f) }))
  if (matches.length === 0) {
    throw new Error('No _b13-latency-*.json found in scripts/. Run _b13-latency-test.mjs first.')
  }
  const withStat = await Promise.all(
    matches.map(async (m) => ({ ...m, mtime: (await fs.stat(m.full)).mtimeMs })),
  )
  withStat.sort((a, b) => b.mtime - a.mtime)
  return withStat[0].full
}

async function main() {
  const filePath = await findClientResultsFile(process.argv[2])
  console.log(`Loading client results: ${filePath}`)
  const client = JSON.parse(await fs.readFile(filePath, 'utf8'))
  const runId = client.runId
  console.log(`runId: ${runId}\n`)

  // Pull conversations + their completed events
  const conversations = await prisma.conversation.findMany({
    where: { sessionId: { startsWith: `${runId}-` } },
    select: {
      id: true,
      sessionId: true,
      events: {
        where: { type: 'chat.message_completed' },
        select: { metadata: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  })

  console.log(`Conversations found in DB: ${conversations.length}`)

  // Index by sessionId for ordered output
  const eventBySession = new Map()
  for (const c of conversations) {
    const ev = c.events[0]
    if (ev) eventBySession.set(c.sessionId, ev.metadata)
  }

  // Aggregate per-stage timings
  const timingKeys = [
    'validation_ms',
    'bot_resolve_ms',
    'rate_limit_ms',
    'quota_only_ms',
    'conv_only_ms',
    'db_pre_llm_ms',
    'user_msg_persist_ms',
    'intent_ms',
    'prompt_build_ms',
    'llm_setup_ms',
    'llm_ttfb_ms',
    'llm_stream_ms',
    'llm_total_ms',
    'post_persist_ms',
    'total_ms',
  ]

  const buckets = Object.fromEntries(timingKeys.map((k) => [k, []]))
  let matched = 0
  for (const r of client.results) {
    if (r.errorMsg) continue
    const meta = eventBySession.get(r.sessionId)
    if (!meta) continue
    const t = meta.timings ?? {}
    matched++
    for (const k of timingKeys) {
      const v = t[k]
      if (typeof v === 'number') buckets[k].push(v)
    }
  }
  console.log(`Matched client requests to server events: ${matched}/${client.results.length}\n`)

  // Print per-stage table
  console.log('===== PER-STAGE TIMING (server-side, from ChatbotEvent.metadata.timings) =====')
  console.log('Stage              n     min    p50    p90    p95    max   mean   share-of-p50-total')

  const totalStats = stats(buckets.total_ms)
  const totalP50 = totalStats?.p50 ?? null

  for (const k of timingKeys) {
    const s = stats(buckets[k])
    if (!s) {
      console.log(`  ${k.padEnd(20)} (no data)`)
      continue
    }
    const sharePct = totalP50 && s.p50 !== null ? (s.p50 / totalP50) * 100 : null
    console.log(
      `  ${k.padEnd(18)} ${String(s.n).padStart(3)}  ${fmt(s.min)}  ${fmt(s.p50)}  ${fmt(s.p90)}  ${fmt(s.p95)}  ${fmt(s.max)}  ${fmt(s.mean)}   ${fmtPct(sharePct)}`,
    )
  }

  // Client-side TTFB / total (for comparison with server-side)
  console.log('\n===== CLIENT-SIDE (network + serialization included) =====')
  const okClient = client.results.filter((r) => !r.errorMsg && r.httpStatus === 200)
  const cTtfb = stats(okClient.map((r) => r.ttfbMs))
  const cTotal = stats(okClient.map((r) => r.totalMs))
  const cStream = stats(okClient.map((r) => r.streamMs))
  if (cTtfb) console.log(`  TTFB    n=${cTtfb.n}  p50=${fmt(cTtfb.p50)}ms  p90=${fmt(cTtfb.p90)}ms  p95=${fmt(cTtfb.p95)}ms  max=${fmt(cTtfb.max)}ms`)
  if (cTotal) console.log(`  TOTAL   n=${cTotal.n}  p50=${fmt(cTotal.p50)}ms  p90=${fmt(cTotal.p90)}ms  p95=${fmt(cTotal.p95)}ms  max=${fmt(cTotal.max)}ms`)
  if (cStream) console.log(`  STREAM  n=${cStream.n}  p50=${fmt(cStream.p50)}ms  p90=${fmt(cStream.p90)}ms  p95=${fmt(cStream.p95)}ms  max=${fmt(cStream.max)}ms`)

  // Top-line verdict
  console.log('\n===== VERDICT =====')
  if (totalStats) {
    const llmT = stats(buckets.llm_total_ms)
    const dbPre = stats(buckets.db_pre_llm_ms)
    const post = stats(buckets.post_persist_ms)
    const botRes = stats(buckets.bot_resolve_ms)
    const userPersist = stats(buckets.user_msg_persist_ms)
    const llmPct = llmT?.p50 ? (llmT.p50 / totalP50) * 100 : null
    const dbPrePct = dbPre?.p50 ? (dbPre.p50 / totalP50) * 100 : null
    const postPct = post?.p50 ? (post.p50 / totalP50) * 100 : null
    const dbAllP50 =
      (botRes?.p50 ?? 0) +
      (dbPre?.p50 ?? 0) +
      (userPersist?.p50 ?? 0) +
      (post?.p50 ?? 0)
    const dbAllPct = (dbAllP50 / totalP50) * 100
    console.log(`  total p50:           ${fmt(totalStats.p50)}ms`)
    console.log(`  LLM total p50:       ${fmt(llmT?.p50)}ms  (${fmtPct(llmPct)})`)
    if (stats(buckets.llm_ttfb_ms)?.p50) {
      console.log(`    └─ TTFB p50:       ${fmt(stats(buckets.llm_ttfb_ms).p50)}ms`)
      console.log(`    └─ stream p50:     ${fmt(stats(buckets.llm_stream_ms).p50)}ms`)
    }
    console.log(`  All DB combined p50: ${fmt(dbAllP50)}ms  (${fmtPct(dbAllPct)})`)
    console.log(`    └─ pre-LLM:        ${fmt(dbPre?.p50)}ms  (${fmtPct(dbPrePct)})`)
    console.log(`    └─ post-persist:   ${fmt(post?.p50)}ms  (${fmtPct(postPct)})`)
  }

  await prisma.$disconnect()
}

main().catch(async (err) => {
  console.error('FATAL:', err)
  await prisma.$disconnect()
  process.exit(1)
})
