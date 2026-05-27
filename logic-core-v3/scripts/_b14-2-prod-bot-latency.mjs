// B14.2 — Latency test del bot contra PROD. Adapta _b13-latency-test.mjs
// (B1.3 dev) a Netlify prod con el bot bench-matsu.
//
// Mismos 30 prompts que B1.3 → comparación dev/prod limpia.
// Separa la PRIMERA request (cold candidate) del resto (warm).
//
// Origin: 'https://develop.com.ar' — siempre permitido por validateOrigin,
// no necesita configurar allowedDomains en el bot bench.
//
// Costo Vertex: ~30 generaciones cortas (sub-USD$1).
//
// Usage:
//   node scripts/_b14-2-prod-bot-latency.mjs
//
// Throwaway — borrar después del sprint B14.2.

import 'dotenv/config'
import { writeFile } from 'node:fs/promises'
import path from 'node:path'

const BASE_URL = process.env.B14_BASE_URL ?? 'https://develop-portfolio.netlify.app'
const SLUG = process.env.B14_SLUG ?? 'bench-matsu'
const ORIGIN = process.env.B14_ORIGIN ?? 'https://develop.com.ar'
const DELAY_MS = 3000
const RUN_ID = `b14-2-bot-${Date.now()}`

// Mismos 30 prompts que B1.3 para comparación apples-to-apples.
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
  let totalBytes = 0
  let chunkCount = 0
  let httpStatus = 0
  let errorMsg = null

  try {
    const res = await fetch(`${BASE_URL}/api/chatbot/${SLUG}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': ORIGIN,
        'User-Agent': 'b14-2-bot-latency',
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: prompt }],
        sessionId,
        currentPath: '/',
        referrer: ORIGIN,
      }),
    })

    httpStatus = res.status
    if (!res.body) {
      errorMsg = 'no_body'
      return { i, sessionId, prompt, httpStatus, errorMsg }
    }
    if (httpStatus !== 200) {
      const txt = await res.text().catch(() => '?')
      errorMsg = `http_${httpStatus}:${txt.slice(0, 200)}`
      return { i, sessionId, prompt, httpStatus, errorMsg }
    }

    const reader = res.body.getReader()
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      chunkCount++
      totalBytes += value?.byteLength ?? 0
      if (ttfbAt === null) ttfbAt = Date.now()
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
  const mean = Math.round(sorted.reduce((a, b) => a + b, 0) / sorted.length)
  return `  ${label.padEnd(10)} n=${String(valid.length).padStart(2)}  min=${fmt(sorted[0])}  p50=${fmt(percentile(sorted, 0.5))}  p90=${fmt(percentile(sorted, 0.9))}  p95=${fmt(percentile(sorted, 0.95))}  max=${fmt(sorted[sorted.length - 1])}  mean=${fmt(mean)}`
}

async function main() {
  console.log(`\n==== B14.2 PROD BOT LATENCY — runId=${RUN_ID} ====`)
  console.log(`Target:   POST ${BASE_URL}/api/chatbot/${SLUG}/chat`)
  console.log(`Origin:   ${ORIGIN}`)
  console.log(`Prompts:  ${PROMPTS.length}  (sequential, ${DELAY_MS}ms delay between)`)
  console.log(`Mode:     single-turn conversations, fresh sessionId each`)
  console.log(`Note:     PRIMERA request es cold-candidate; el resto, warm.\n`)

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

  console.log(`\n==== SUMMARY ====`)
  console.log(`Wall-clock: ${(wallMs / 1000).toFixed(1)}s`)
  const ok = results.filter((r) => !r.errorMsg && r.httpStatus === 200)
  console.log(`Successful: ${ok.length}/${results.length}`)
  const errs = results.filter((r) => r.errorMsg)
  if (errs.length > 0) {
    console.log(`Errors:`)
    for (const e of errs) console.log(`  [${e.i}] ${e.httpStatus}: ${e.errorMsg}`)
  }

  // Cold = i=0; Warm = i>=1.
  const cold = ok.filter((r) => r.i === 0)
  const warm = ok.filter((r) => r.i >= 1)

  console.log(`\nCOLD CANDIDATE (i=0):`)
  if (cold.length > 0) {
    const c = cold[0]
    console.log(`  ttfb=${c.ttfbMs}ms  total=${c.totalMs}ms  stream=${c.streamMs}ms`)
  }

  console.log(`\nWARM (i>=1):`)
  console.log(summarize(warm.map((r) => r.ttfbMs), 'TTFB'))
  console.log(summarize(warm.map((r) => r.totalMs), 'TOTAL'))
  console.log(summarize(warm.map((r) => r.streamMs), 'STREAM'))

  console.log(`\nFULL SET (cold + warm):`)
  console.log(summarize(ok.map((r) => r.ttfbMs), 'TTFB'))
  console.log(summarize(ok.map((r) => r.totalMs), 'TOTAL'))

  const outPath = path.join(process.cwd(), 'scripts', `_b14-2-bot-${RUN_ID}.json`)
  await writeFile(
    outPath,
    JSON.stringify({ runId: RUN_ID, baseUrl: BASE_URL, slug: SLUG, origin: ORIGIN, wallMs, results }, null, 2),
  )
  console.log(`\nRaw results: ${outPath}`)
  console.log(`Query server-side breakdown via ChatbotEvent.metadata.timings:`)
  console.log(`  WHERE conversation.sessionId LIKE '${RUN_ID}-%'`)
}

main().catch((err) => {
  console.error('FATAL:', err)
  process.exit(1)
})
