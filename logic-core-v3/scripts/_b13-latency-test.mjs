// B1.3 — Realistic sequential latency test for the chatbot runtime.
// Fires N single-turn conversations against the local dev server,
// measuring client-side TTFB and total response time per request.
// NO concurrency (to avoid the rate limiter that skewed the old load test).
// Throwaway script — delete after B1.3 sprint.
//
// Usage: node scripts/_b13-latency-test.mjs
// Requires: dev server running on http://localhost:3000 with `develop` bot active.

import 'dotenv/config'

const BASE_URL = process.env.B13_BASE_URL ?? 'http://localhost:3000'
const SLUG = 'develop'
const DELAY_MS = 3000 // pause between requests
const RUN_ID = `b13-${Date.now()}`

// 30 realistic single-turn prompts grouped by intent. Variety matters more
// than count for percentile shape — covers price, services, comparison,
// general info, lead-capture-likely, and small talk.
const PROMPTS = [
  'Hola',
  'Buen día, quería consultar algo',
  '¿Qué servicios ofrecen?',
  '¿Hacen páginas web?',
  '¿Trabajan con tiendas online?',
  '¿Hacen chatbots como vos?',
  '¿Pueden automatizar tareas de mi negocio?',
  '¿Desarrollan software a medida?',
  '¿Cuánto cuesta una landing page?',
  '¿Qué precio tiene una web institucional?',
  '¿Tienen planes mensuales?',
  '¿Aceptan pagos en cuotas?',
  '¿Cuánto tarda en estar lista una web?',
  '¿Hacen mantenimiento después del lanzamiento?',
  '¿En qué tecnologías trabajan?',
  '¿Mejor WordPress o algo a medida?',
  '¿Qué diferencia tienen contra otras agencias?',
  '¿Tienen casos de éxito que pueda ver?',
  '¿Dónde están ubicados?',
  '¿Atienden clientes fuera de Argentina?',
  '¿Cómo es el proceso de trabajo?',
  '¿Quién va a ser mi contacto durante el proyecto?',
  'Tengo un comercio chico y necesito vender online, ¿qué me recomendás?',
  'Quiero automatizar la facturación y los recordatorios a clientes',
  'Necesito un chatbot para mi consultorio médico',
  '¿Pueden integrar mi sistema actual con WhatsApp?',
  '¿Hacen migraciones desde otro proveedor?',
  'Mi web carga lento, ¿pueden ayudarme?',
  '¿Cómo me contacto para arrancar?',
  '¿Puedo agendar una reunión?',
]

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

function fmt(n) {
  if (n === null || n === undefined) return '   --'
  return String(Math.round(n)).padStart(5, ' ')
}

async function runOne(i, prompt) {
  const sessionId = `${RUN_ID}-s${i}`
  const t0 = Date.now()
  let ttfbAt = null
  let firstChunkSize = 0
  let totalBytes = 0
  let chunkCount = 0
  let httpStatus = 0
  let errorMsg = null

  try {
    const res = await fetch(`${BASE_URL}/api/chatbot/${SLUG}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': BASE_URL,
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: prompt }],
        sessionId,
        currentPath: '/',
        referrer: BASE_URL,
      }),
    })

    httpStatus = res.status
    if (!res.body) {
      errorMsg = 'no_body'
      return { i, sessionId, prompt, httpStatus, errorMsg }
    }
    if (httpStatus !== 200) {
      const txt = await res.text().catch(() => '?')
      errorMsg = `http_${httpStatus}:${txt.slice(0, 120)}`
      return { i, sessionId, prompt, httpStatus, errorMsg }
    }

    const reader = res.body.getReader()
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      chunkCount++
      const size = value?.byteLength ?? 0
      totalBytes += size
      if (ttfbAt === null) {
        ttfbAt = Date.now()
        firstChunkSize = size
      }
    }
  } catch (err) {
    errorMsg = err instanceof Error ? err.message : String(err)
  }

  const t1 = Date.now()
  return {
    i,
    sessionId,
    prompt: prompt.slice(0, 60),
    httpStatus,
    errorMsg,
    ttfbMs: ttfbAt !== null ? ttfbAt - t0 : null,
    totalMs: t1 - t0,
    streamMs: ttfbAt !== null ? t1 - ttfbAt : null,
    chunkCount,
    totalBytes,
    firstChunkSize,
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
  const min = sorted[0]
  const max = sorted[sorted.length - 1]
  const mean = Math.round(sorted.reduce((a, b) => a + b, 0) / sorted.length)
  const p50 = percentile(sorted, 0.5)
  const p90 = percentile(sorted, 0.9)
  const p95 = percentile(sorted, 0.95)
  return `  ${label.padEnd(10)} n=${String(valid.length).padStart(2)}  min=${fmt(min)}  p50=${fmt(p50)}  p90=${fmt(p90)}  p95=${fmt(p95)}  max=${fmt(max)}  mean=${fmt(mean)}`
}

async function main() {
  console.log(`\n==== B1.3 LATENCY TEST — runId=${RUN_ID} ====`)
  console.log(`Target:   POST ${BASE_URL}/api/chatbot/${SLUG}/chat`)
  console.log(`Prompts:  ${PROMPTS.length}  (sequential, ${DELAY_MS}ms delay between)`)
  console.log(`Mode:     single-turn conversations, fresh sessionId each\n`)

  // Warm-up: forces Next.js dev to compile the route + JIT warm Prisma/Vertex.
  // Result NOT included in the measured set (first hit is always anomalous).
  console.log(`[warmup] firing a throwaway request...`)
  const warmup = await runOne(-1, 'warmup ping')
  if (warmup.errorMsg) {
    console.log(`[warmup] FAILED (${warmup.httpStatus}): ${warmup.errorMsg}`)
    console.log(`[warmup] Aborting — fix the dev server before running the test.`)
    process.exit(1)
  }
  console.log(`[warmup] ok — ttfb=${fmt(warmup.ttfbMs)}ms total=${fmt(warmup.totalMs)}ms\n`)
  await sleep(DELAY_MS)

  const startWall = Date.now()
  const results = []
  for (let i = 0; i < PROMPTS.length; i++) {
    const prompt = PROMPTS[i]
    process.stdout.write(`[${String(i + 1).padStart(2)}/${PROMPTS.length}] `)
    const r = await runOne(i, prompt)
    results.push(r)
    if (r.errorMsg) {
      console.log(`ERROR (${r.httpStatus}): ${r.errorMsg}`)
    } else {
      console.log(
        `ttfb=${fmt(r.ttfbMs)}ms  total=${fmt(r.totalMs)}ms  stream=${fmt(r.streamMs)}ms  chunks=${r.chunkCount}  bytes=${r.totalBytes}  "${r.prompt}"`,
      )
    }
    if (i < PROMPTS.length - 1) await sleep(DELAY_MS)
  }
  const wallMs = Date.now() - startWall

  console.log(`\n==== SUMMARY (client-side measurements) ====`)
  console.log(`Wall-clock total: ${(wallMs / 1000).toFixed(1)}s`)
  const ok = results.filter((r) => !r.errorMsg && r.httpStatus === 200)
  console.log(`Successful: ${ok.length}/${results.length}`)
  const errs = results.filter((r) => r.errorMsg)
  if (errs.length > 0) {
    console.log(`Errors:`)
    for (const e of errs) console.log(`  [${e.i}] ${e.httpStatus}: ${e.errorMsg}`)
  }

  console.log(summarize(ok.map((r) => r.ttfbMs), 'TTFB'))
  console.log(summarize(ok.map((r) => r.totalMs), 'TOTAL'))
  console.log(summarize(ok.map((r) => r.streamMs), 'STREAM'))

  console.log(`\nRunId saved on each sessionId — use this to query ChatbotEvent:`)
  console.log(`  WHERE conversation.sessionId LIKE '${RUN_ID}-%'`)
  console.log(`\nNext step: run scripts/_b13-latency-analyze.mjs to extract server-side breakdown.`)

  // Persist RUN_ID + raw results to a tmp file so the analyze script can pick it up.
  const fs = await import('node:fs/promises')
  const path = await import('node:path')
  const outPath = path.join(process.cwd(), 'scripts', `_b13-latency-${RUN_ID}.json`)
  await fs.writeFile(
    outPath,
    JSON.stringify({ runId: RUN_ID, baseUrl: BASE_URL, slug: SLUG, wallMs, results }, null, 2),
  )
  console.log(`Client-side results saved: ${outPath}`)
}

main().catch((err) => {
  console.error('FATAL:', err)
  process.exit(1)
})
