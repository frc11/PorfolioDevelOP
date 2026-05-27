// B14.2 — Cold-start probe del runtime Netlify, sin Vertex.
//
// Pega al /health del chatbot. Mide bootstrap de la lambda + DB ping,
// SIN llamar a Vertex. Costo $0 — se puede correr libre.
//
// Dos modos:
//   default (burst):  10 hits seguidos con 2s de delay. La primera es
//                     candidata a cold; el resto son warm. Útil para
//                     una foto rápida tras período de inactividad.
//
//   --with-pauses:    3 ciclos de [pausa 20min → burst de 6 hits].
//                     Fuerza spin-down entre ciclos. Toma ~45min total.
//                     Usar cuando se quieran cold starts forzados.
//
// Usage:
//   node scripts/_b14-2-prod-coldstart.mjs
//   node scripts/_b14-2-prod-coldstart.mjs --with-pauses
//
// Throwaway — borrar después del sprint B14.2.

import 'dotenv/config'
import { writeFile } from 'node:fs/promises'
import path from 'node:path'

const BASE_URL = process.env.B14_BASE_URL ?? 'https://develop-portfolio.netlify.app'
const SLUG = process.env.B14_SLUG ?? 'bench-matsu'
const RUN_ID = `b14-2-cold-${Date.now()}`
const WITH_PAUSES = process.argv.includes('--with-pauses')

const PAUSE_BETWEEN_HITS_MS = 2_000
const PAUSE_BETWEEN_CYCLES_MS = 20 * 60_000 // 20 min — > spin-down (~15min)
const BURST_HITS = WITH_PAUSES ? 6 : 10
const CYCLES = WITH_PAUSES ? 3 : 1

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

function fmt(n) {
  if (n === null || n === undefined) return '   --'
  return String(Math.round(n)).padStart(5, ' ')
}

async function probe(label) {
  const t0 = Date.now()
  let ttfbAt = null
  let status = 0
  let bytes = 0
  let err = null

  try {
    const res = await fetch(`${BASE_URL}/api/chatbot/${SLUG}/health`, {
      method: 'GET',
      headers: { 'User-Agent': 'b14-2-coldstart-probe' },
    })
    status = res.status
    if (!res.body) {
      err = 'no_body'
    } else {
      const reader = res.body.getReader()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        if (ttfbAt === null) ttfbAt = Date.now()
        bytes += value?.byteLength ?? 0
      }
    }
  } catch (e) {
    err = e instanceof Error ? e.message : String(e)
  }

  const t1 = Date.now()
  return {
    label,
    httpStatus: status,
    err,
    ttfbMs: ttfbAt !== null ? ttfbAt - t0 : null,
    totalMs: t1 - t0,
    bytes,
    at: new Date().toISOString(),
  }
}

function percentile(sorted, p) {
  if (sorted.length === 0) return null
  const idx = Math.min(sorted.length - 1, Math.floor(sorted.length * p))
  return sorted[idx]
}

function summarize(values, label) {
  const valid = values.filter((v) => typeof v === 'number')
  if (valid.length === 0) return `  ${label}: (no data)`
  const sorted = [...valid].sort((a, b) => a - b)
  return `  ${label.padEnd(10)} n=${String(valid.length).padStart(2)}  min=${fmt(sorted[0])}  p50=${fmt(percentile(sorted, 0.5))}  p95=${fmt(percentile(sorted, 0.95))}  max=${fmt(sorted[sorted.length - 1])}`
}

async function main() {
  console.log(`\n==== B14.2 COLD-START PROBE — runId=${RUN_ID} ====`)
  console.log(`Target:   GET ${BASE_URL}/api/chatbot/${SLUG}/health`)
  console.log(`Mode:     ${WITH_PAUSES ? 'with-pauses (3 cycles, ~45min total)' : 'burst (10 hits, ~30s)'}`)
  console.log('')

  const allResults = []
  const coldCandidates = []
  const warmHits = []

  for (let c = 0; c < CYCLES; c++) {
    if (c > 0) {
      console.log(`\n[cycle ${c + 1}] waiting ${PAUSE_BETWEEN_CYCLES_MS / 60_000}min for spin-down...`)
      await sleep(PAUSE_BETWEEN_CYCLES_MS)
    }

    for (let i = 0; i < BURST_HITS; i++) {
      const isCold = i === 0
      const label = isCold ? `c${c + 1}-cold` : `c${c + 1}-warm-${i}`
      process.stdout.write(`[${label}] `)
      const r = await probe(label)
      allResults.push(r)
      if (isCold) coldCandidates.push(r)
      else warmHits.push(r)

      if (r.err) {
        console.log(`ERROR (${r.httpStatus}): ${r.err}`)
      } else {
        console.log(`status=${r.httpStatus}  ttfb=${fmt(r.ttfbMs)}ms  total=${fmt(r.totalMs)}ms  bytes=${r.bytes}`)
      }

      if (i < BURST_HITS - 1) await sleep(PAUSE_BETWEEN_HITS_MS)
    }
  }

  console.log(`\n==== SUMMARY ====`)
  const okAll = allResults.filter((r) => !r.err && r.httpStatus === 200)
  console.log(`Successful: ${okAll.length}/${allResults.length}`)
  const okCold = coldCandidates.filter((r) => !r.err && r.httpStatus === 200)
  const okWarm = warmHits.filter((r) => !r.err && r.httpStatus === 200)

  console.log('\nCOLD (first hit of each cycle):')
  console.log(summarize(okCold.map((r) => r.ttfbMs), 'TTFB'))
  console.log(summarize(okCold.map((r) => r.totalMs), 'TOTAL'))

  console.log('\nWARM (subsequent hits):')
  console.log(summarize(okWarm.map((r) => r.ttfbMs), 'TTFB'))
  console.log(summarize(okWarm.map((r) => r.totalMs), 'TOTAL'))

  const outPath = path.join(process.cwd(), 'scripts', `_b14-2-cold-${RUN_ID}.json`)
  await writeFile(
    outPath,
    JSON.stringify(
      {
        runId: RUN_ID,
        baseUrl: BASE_URL,
        slug: SLUG,
        mode: WITH_PAUSES ? 'with-pauses' : 'burst',
        cycles: CYCLES,
        burstHits: BURST_HITS,
        results: allResults,
      },
      null,
      2,
    ),
  )
  console.log(`\nRaw results: ${outPath}`)
}

main().catch((err) => {
  console.error('FATAL:', err)
  process.exit(1)
})
