// B14.2 — TTFB de páginas públicas en PROD.
//
// No requiere auth. Mide bootstrap completo del request (cold runtime +
// SSR + DB queries de la página). Cero Vertex, cero costo.
//
// 5 muestras por URL, con 2s de pausa entre páginas. Reporta P50/P95.
//
// Usage:
//   node scripts/_b14-2-prod-pages-ttfb.mjs
//
// Throwaway — borrar después del sprint B14.2.

import 'dotenv/config'
import { writeFile } from 'node:fs/promises'
import path from 'node:path'

const BASE_URL = process.env.B14_BASE_URL ?? 'https://develop-portfolio.netlify.app'
const RUN_ID = `b14-2-pages-${Date.now()}`
const SAMPLES_PER_PAGE = 5
const DELAY_BETWEEN_MS = 2_000

const PAGES = [
  '/',
  '/login',
  '/forgot-password',
  '/contact',
  '/web-development',
  '/software-development',
  '/process-automation',
]

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

function fmt(n) {
  if (n === null || n === undefined) return '   --'
  return String(Math.round(n)).padStart(5, ' ')
}

async function hit(url) {
  const t0 = Date.now()
  let ttfbAt = null
  let bytes = 0
  let status = 0
  let err = null

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: { 'User-Agent': 'b14-2-pages-ttfb' },
      redirect: 'manual',
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
    url,
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

function stats(values) {
  const valid = values.filter((v) => typeof v === 'number')
  if (valid.length === 0) return { n: 0 }
  const sorted = [...valid].sort((a, b) => a - b)
  return {
    n: valid.length,
    min: sorted[0],
    p50: percentile(sorted, 0.5),
    p95: percentile(sorted, 0.95),
    max: sorted[sorted.length - 1],
    mean: Math.round(sorted.reduce((a, b) => a + b, 0) / sorted.length),
  }
}

async function main() {
  console.log(`\n==== B14.2 PROD PAGES TTFB — runId=${RUN_ID} ====`)
  console.log(`Base:    ${BASE_URL}`)
  console.log(`Pages:   ${PAGES.length}  (${SAMPLES_PER_PAGE} samples each, ${DELAY_BETWEEN_MS}ms between hits)`)
  console.log('')

  const byPage = new Map()

  for (const page of PAGES) {
    const url = `${BASE_URL}${page}`
    byPage.set(page, [])
    for (let s = 0; s < SAMPLES_PER_PAGE; s++) {
      const r = await hit(url)
      byPage.get(page).push(r)
      const isFirst = s === 0
      const tag = isFirst ? 'cold?' : `warm-${s}`
      if (r.err) {
        console.log(`[${page}] (${tag}) ERROR (${r.httpStatus}): ${r.err}`)
      } else {
        console.log(
          `[${page.padEnd(22)}] (${tag.padEnd(7)}) status=${r.httpStatus}  ttfb=${fmt(r.ttfbMs)}ms  total=${fmt(r.totalMs)}ms  bytes=${r.bytes}`,
        )
      }
      await sleep(DELAY_BETWEEN_MS)
    }
  }

  console.log(`\n==== SUMMARY — TTFB por página ====`)
  console.log(`  ${'page'.padEnd(22)}  ${'n'.padStart(2)}  ${'min'.padStart(5)}  ${'p50'.padStart(5)}  ${'p95'.padStart(5)}  ${'max'.padStart(5)}  ${'mean'.padStart(5)}  (cold)`)
  const summary = {}
  for (const [page, results] of byPage.entries()) {
    const ok = results.filter((r) => !r.err && r.httpStatus < 400)
    const ttfbStats = stats(ok.map((r) => r.ttfbMs))
    const cold = ok[0]?.ttfbMs ?? null
    summary[page] = { samples: results.length, ok: ok.length, ttfb: ttfbStats, coldFirst: cold }
    console.log(
      `  ${page.padEnd(22)}  ${String(ttfbStats.n).padStart(2)}  ${fmt(ttfbStats.min)}  ${fmt(ttfbStats.p50)}  ${fmt(ttfbStats.p95)}  ${fmt(ttfbStats.max)}  ${fmt(ttfbStats.mean)}  ${fmt(cold)}`,
    )
  }

  const outPath = path.join(process.cwd(), 'scripts', `_b14-2-pages-${RUN_ID}.json`)
  await writeFile(
    outPath,
    JSON.stringify(
      {
        runId: RUN_ID,
        baseUrl: BASE_URL,
        samplesPerPage: SAMPLES_PER_PAGE,
        summary,
        raw: Object.fromEntries(byPage),
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
