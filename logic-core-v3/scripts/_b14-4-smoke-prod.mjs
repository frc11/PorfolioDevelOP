// B14.4 — Smoke en PROD post-deploy. Ejecutable por Franco después de
// completar las Fases 1-4 del checklist docs/operations/b14-deploy-checklist.md.
//
// Cubre 6 bloques. Cada bloque reporta PASS/FAIL/SKIP. El script termina con
// exit 1 si algún bloque crítico falló (para usar en CI o sanity check).
//
// NO crea recursos, NO modifica DB. Solo lectura + dispara errores controlados
// (test-sentry, rate-limit) que el sistema ya está diseñado para tolerar.
//
// Usage:
//   node scripts/_b14-4-smoke-prod.mjs
//   B14_BASE_URL='https://other.url' node scripts/_b14-4-smoke-prod.mjs
//
// Throwaway — borrar después de v1.0.0 (cuando ya no haga falta validar
// deploys de B14).

import 'dotenv/config'

const BASE_URL = process.env.B14_BASE_URL ?? 'https://develop-portfolio.netlify.app'
const SLUG = process.env.B14_SLUG ?? 'bench-matsu'
const ORIGIN = process.env.B14_ORIGIN ?? 'https://develop.com.ar'

const results = []

function record(block, label, status, details) {
  results.push({ block, label, status, details })
  const icon = status === 'PASS' ? '✓' : status === 'FAIL' ? '✗' : '○'
  const tail = details ? `  — ${details}` : ''
  console.log(`  ${icon} [${status}] ${label}${tail}`)
}

function group(name, fn) {
  console.log(`\n── ${name} ──`)
  return fn()
}

async function hit(path, opts = {}) {
  const t0 = Date.now()
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: opts.method ?? 'GET',
      headers: opts.headers ?? { 'User-Agent': 'b14-4-smoke' },
      body: opts.body,
      redirect: 'manual',
    })
    const ms = Date.now() - t0
    let text = ''
    if (opts.readBody !== false) {
      text = await res.text().catch(() => '')
    }
    return { status: res.status, ms, text, headers: res.headers }
  } catch (err) {
    return { status: 0, ms: Date.now() - t0, err: err instanceof Error ? err.message : String(err) }
  }
}

// ─── Bloque 1: páginas públicas ──────────────────────────────────────────
async function blockPublicPages() {
  group('Bloque 1 — Páginas públicas', () => {})
  const pages = [
    { path: '/', expect: 200 },
    { path: '/login', expect: 200 },
    { path: '/forgot-password', expect: 200 },
    { path: '/contact', expect: 200 },
    { path: '/web-development', expect: 200 },
    { path: '/software-development', expect: 200 },
    { path: '/process-automation', expect: 200 },
  ]
  for (const p of pages) {
    const r = await hit(p.path, { readBody: false })
    if (r.status === p.expect) {
      record('public', `${p.path} → ${r.status} (${r.ms}ms)`, 'PASS')
    } else {
      record('public', `${p.path} esperaba ${p.expect}, dio ${r.status}`, 'FAIL', r.err)
    }
  }
}

// ─── Bloque 2: deploy nuevo (cache invalidada) ───────────────────────────
async function blockDeployFreshness() {
  group('Bloque 2 — Deploy freshness', () => {})
  const r = await hit('/api/version', { readBody: true })
  if (r.status === 200) {
    record('deploy', `/api/version → 200`, 'PASS', r.text.slice(0, 100))
  } else if (r.status === 404) {
    record('deploy', `/api/version → 404 — deploy NO incluye endpoint`, 'FAIL',
      'El código de B14 no está deployado. Ver Fase 4 del checklist.')
  } else {
    record('deploy', `/api/version → ${r.status}`, 'FAIL', r.text.slice(0, 200))
  }

  const home = await hit('/', { readBody: false })
  const age = home.headers?.get('age')
  if (age && Number(age) > 86400) {
    record('deploy', `/ cache age = ${age}s (${Math.round(age / 86400)}d)`, 'FAIL',
      'Cache CDN agresiva. Invalidar desde Netlify UI: Deploys → Clear cache and deploy.')
  } else {
    record('deploy', `/ cache age = ${age ?? '0'}s (fresco)`, 'PASS')
  }
}

// ─── Bloque 3: bot /health + /config ─────────────────────────────────────
async function blockBotEndpoints() {
  group('Bloque 3 — Bot bench-matsu (endpoints baratos)', () => {})

  const h = await hit(`/api/chatbot/${SLUG}/health`, { readBody: true })
  if (h.status === 200) {
    record('bot', `/health → 200 (${h.ms}ms)`, 'PASS', h.text.slice(0, 80))
  } else if (h.status === 404) {
    record('bot', `/health → 404 — bot no existe`, 'FAIL',
      'Correr seed: scripts/_b14-2-seed-bench-prod.ts --confirm (Fase 2.2 del checklist)')
    return { botMissing: true }
  } else {
    record('bot', `/health → ${h.status}`, 'FAIL', h.text.slice(0, 200))
  }

  const c = await hit(`/api/chatbot/${SLUG}/config`, { headers: { Origin: ORIGIN, 'User-Agent': 'b14-4-smoke' } })
  if (c.status === 200) {
    record('bot', `/config → 200 (${c.ms}ms)`, 'PASS')
  } else {
    record('bot', `/config → ${c.status}`, 'FAIL', c.text.slice(0, 200))
  }

  return { botMissing: false }
}

// ─── Bloque 4: bot /chat (consume Vertex — 1 request) ────────────────────
async function blockBotChat(botMissing) {
  group('Bloque 4 — Bot /chat (1 request, consume Vertex)', () => {})
  if (botMissing) {
    record('chat', 'skipped (bot no existe)', 'SKIP')
    return { skipped: true }
  }

  const sessionId = `b14-4-smoke-${Date.now()}`
  const r = await hit(`/api/chatbot/${SLUG}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Origin: ORIGIN,
      'User-Agent': 'b14-4-smoke',
    },
    body: JSON.stringify({
      messages: [{ role: 'user', content: 'Hola, prueba de smoke' }],
      sessionId,
      currentPath: '/',
      referrer: ORIGIN,
    }),
    readBody: true,
  })

  if (r.status === 200 && r.text.length > 0) {
    record('chat', `/chat → 200 con stream (${r.text.length} bytes, ${r.ms}ms)`, 'PASS')
  } else if (r.status === 200) {
    record('chat', `/chat → 200 pero body vacío`, 'FAIL')
  } else {
    record('chat', `/chat → ${r.status}`, 'FAIL', r.text.slice(0, 200))
  }
  return { skipped: false }
}

// ─── Bloque 5: rate limiter atómico (B14.1) ──────────────────────────────
async function blockRateLimiter(botMissing) {
  group('Bloque 5 — Rate limiter (31 hits → esperamos 429)', () => {})
  if (botMissing) {
    record('rate', 'skipped (bot no existe)', 'SKIP')
    return
  }

  const sessionId = `b14-4-rate-${Date.now()}`
  let last429 = null
  let firstSuccess429At = null

  for (let i = 1; i <= 31; i++) {
    const r = await hit(`/api/chatbot/${SLUG}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: ORIGIN,
        'User-Agent': 'b14-4-smoke',
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: `ping ${i}` }],
        sessionId,
        currentPath: '/',
        referrer: ORIGIN,
      }),
      readBody: false,
    })
    if (r.status === 429) {
      if (firstSuccess429At === null) firstSuccess429At = i
      last429 = r
    }
    // No delay — queremos burst para saturar.
  }

  if (firstSuccess429At !== null) {
    record('rate', `Primer 429 en hit #${firstSuccess429At} (esperado: ~#31 con preset chatbotPerSession 30/min)`, 'PASS')
    const retryAfter = last429?.headers?.get('retry-after')
    if (retryAfter) {
      record('rate', `Header Retry-After: ${retryAfter}s`, 'PASS')
    } else {
      record('rate', `Sin header Retry-After`, 'FAIL', 'El handler debería incluirlo en el 429.')
    }
  } else {
    record('rate', `31 hits sin 429 — rate limiter NO está activo`, 'FAIL',
      'Confirmar que migration B14.1 (rate_limit table) está aplicada en prod (Fase 2.1).')
  }
}

// ─── Bloque 6: Sentry capturing (B14.5) ──────────────────────────────────
async function blockSentry() {
  group('Bloque 6 — Sentry (dispara error de prueba)', () => {})
  const r = await hit('/api/test-sentry', { readBody: true })
  if (r.status === 500) {
    record('sentry', `/api/test-sentry → 500 (esperado, dispara captureException)`, 'PASS')
    record('sentry', `Validar manual en Sentry UI`, 'SKIP',
      'Ir a sentry.io → project logic-core-v3 → Issues → confirmar evento + PII scrubeada.')
  } else if (r.status === 404) {
    record('sentry', `/api/test-sentry → 404 — endpoint no existe en deploy`, 'FAIL',
      'El código de B14.5 no está deployado.')
  } else {
    record('sentry', `/api/test-sentry → ${r.status} (esperado 500)`, 'FAIL', r.text.slice(0, 200))
  }
}

// ─── Main ────────────────────────────────────────────────────────────────
async function main() {
  console.log('')
  console.log(`==== B14.4 PROD SMOKE — ${new Date().toISOString()} ====`)
  console.log(`Base:   ${BASE_URL}`)
  console.log(`Slug:   ${SLUG}`)
  console.log(`Origin: ${ORIGIN}`)

  await blockPublicPages()
  await blockDeployFreshness()
  const { botMissing } = await blockBotEndpoints()
  await blockBotChat(botMissing)
  await blockRateLimiter(botMissing)
  await blockSentry()

  // Resumen
  const summary = { PASS: 0, FAIL: 0, SKIP: 0 }
  for (const r of results) summary[r.status]++

  console.log('')
  console.log('═════════════════════════════════════════════')
  console.log(`  ${summary.PASS} pass  ·  ${summary.FAIL} fail  ·  ${summary.SKIP} skip`)
  console.log('═════════════════════════════════════════════')

  if (summary.FAIL > 0) {
    console.log('\n❌ Smoke FAILED. Items que rompieron:')
    for (const r of results.filter((x) => x.status === 'FAIL')) {
      console.log(`   • [${r.block}] ${r.label}`)
      if (r.details) console.log(`     → ${r.details}`)
    }
    console.log('\nNo tagear hasta resolver. Ver docs/operations/b14-deploy-checklist.md.')
    process.exit(1)
  }

  console.log('\n✅ Smoke OK. Si los items SKIP requieren validación manual, completarlos antes de tagear.')
}

main().catch((err) => {
  console.error('FATAL:', err)
  process.exit(2)
})
