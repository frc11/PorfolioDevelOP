// B14.5 — Smoke del scrub-pii helper. Sin necesidad de DSN ni de Sentry real.
//
// Construye eventos fake con PII (emails, teléfonos, JWTs, passwords en
// extras), los pasa por scrubPii, asserta que NO sobrevive ningún PII en
// el evento resultante.
//
// Si algún assertion falla, el script tira con exit code 1 (apto para CI).
//
// Usage:
//   npx tsx scripts/_b14-5-scrub-smoke.mjs

import { scrubPii, __INTERNALS_FOR_TESTING__ as I } from '../src/lib/sentry/scrub-pii.ts'

let pass = 0
let fail = 0

function assert(cond, label, details) {
  if (cond) {
    pass++
    console.log(`  ✓ ${label}`)
  } else {
    fail++
    console.log(`  ✗ ${label}`)
    if (details) console.log(`     ${JSON.stringify(details)}`)
  }
}

function group(name, fn) {
  console.log(`\n── ${name} ──`)
  fn()
}

// ─── 1. scrubString — patrones aislados ──────────────────────────────────
group('scrubString — patrones', () => {
  const s1 = I.scrubString('User foo@bar.com not found')
  assert(!s1.includes('foo@bar.com'), 'email redactado', { s1 })
  assert(s1.includes('[email]'), 'email reemplazado por [email]')

  const s2 = I.scrubString('Contactar +54 9 11 1234-5678 urgente')
  assert(!s2.includes('1234-5678'), 'teléfono redactado', { s2 })
  assert(s2.includes('[phone]'), 'teléfono reemplazado por [phone]')

  const s3 = I.scrubString('Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjMifQ.signature_part_here')
  assert(!s3.includes('eyJhbGciOiJIUzI1NiJ9'), 'JWT redactado', { s3 })
  assert(s3.includes('[jwt]'), 'JWT reemplazado por [jwt]')

  const s4 = I.scrubString('Card 4111 1111 1111 1111 expired')
  assert(!s4.includes('4111 1111 1111 1111'), 'CC redactado', { s4 })

  const s5 = I.scrubString('All clear here, no PII')
  assert(s5 === 'All clear here, no PII', 'string sin PII no se modifica')
})

// ─── 2. scrubValue — denylist de keys ────────────────────────────────────
group('scrubValue — keys sensibles', () => {
  const obj = {
    password: 'super-secret',
    email: 'foo@bar.com',
    phone: '+541112345678',
    token: 'abc123',
    authorization: 'Bearer xyz',
    cookie: 'session=abc',
    apiKey: 'sk_live_xxx',
    safe_value: 'this is fine',
    nested: {
      password: 'also-secret',
      regular: 'keep me',
    },
  }
  const out = I.scrubValue(obj, 0)
  assert(out.password === '[redacted]', 'password key redactada')
  assert(out.email === '[redacted]', 'email key redactada')
  assert(out.phone === '[redacted]', 'phone key redactada')
  assert(out.token === '[redacted]', 'token key redactada')
  assert(out.authorization === '[redacted]', 'authorization key redactada')
  assert(out.cookie === '[redacted]', 'cookie key redactada')
  assert(out.apiKey === '[redacted]', 'apiKey key redactada')
  assert(out.safe_value === 'this is fine', 'key segura preservada')
  assert(out.nested.password === '[redacted]', 'password redactada también en nested')
  assert(out.nested.regular === 'keep me', 'key segura preservada en nested')
})

// ─── 3. scrubPii — event completo ────────────────────────────────────────
group('scrubPii — event con todos los campos', () => {
  const event = {
    message: 'Failed for user foo@bar.com',
    exception: {
      values: [
        { value: 'User foo@bar.com not found, phone +5491112345678' },
      ],
    },
    request: {
      url: 'https://app.com/api?email=foo@bar.com',
      query_string: 'email=foo@bar.com&token=abc',
      data: {
        email: 'foo@bar.com',
        password: 'secret123',
        message: 'Hola, mi email es otro@correo.com',
      },
      headers: {
        authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjMifQ.signature_part_here',
        'user-agent': 'Mozilla/5.0',
      },
      cookies: { session: 'abc', csrf: 'def' },
    },
    user: {
      id: 'cuid_123',
      email: 'foo@bar.com',
      ip_address: '1.2.3.4',
      username: 'foo',
    },
    extra: {
      lead: { email: 'lead@example.com', phone: '+541199999999', notes: 'normal note' },
    },
    tags: { email: 'foo@bar.com', boundary: 'section' },
    breadcrumbs: [
      { message: 'POST /api/leads with email foo@bar.com', data: { email: 'foo@bar.com' } },
    ],
  }

  const out = scrubPii(event)

  // 3.1 top-level message
  assert(!out.message.includes('foo@bar.com'), 'event.message scrubeado')

  // 3.2 exception value
  assert(!out.exception.values[0].value.includes('foo@bar.com'), 'exception.value email scrubeado')
  assert(!out.exception.values[0].value.includes('+5491112345678'), 'exception.value phone scrubeado')

  // 3.3 request
  assert(!out.request.url.includes('foo@bar.com'), 'request.url scrubeada')
  assert(!out.request.query_string.includes('foo@bar.com'), 'request.query_string scrubeada')
  assert(out.request.data.email === '[redacted]', 'request.data.email redactada por key')
  assert(out.request.data.password === '[redacted]', 'request.data.password redactada por key')
  assert(!out.request.data.message.includes('otro@correo.com'), 'request.data.message scrubeado por regex')
  assert(out.request.headers.authorization === '[redacted]', 'authorization header redactada por key')
  assert(out.request.headers['user-agent'] === 'Mozilla/5.0', 'user-agent preservado')
  assert(out.request.cookies['[all]'] === '[redacted]', 'cookies enteras redactadas')

  // 3.4 user — solo id sobrevive
  assert(out.user.id === 'cuid_123', 'user.id preservado')
  assert(out.user.email === undefined, 'user.email eliminado')
  assert(out.user.ip_address === undefined, 'user.ip_address eliminado')
  assert(out.user.username === undefined, 'user.username eliminado')

  // 3.5 extra
  assert(out.extra.lead.email === '[redacted]', 'extra.lead.email redactado por key')
  assert(out.extra.lead.phone === '[redacted]', 'extra.lead.phone redactado por key')
  assert(out.extra.lead.notes === 'normal note', 'extra.lead.notes preservado')

  // 3.6 tags
  assert(out.tags.email === '[redacted]', 'tags.email redactado por key')
  assert(out.tags.boundary === 'section', 'tags.boundary preservado')

  // 3.7 breadcrumbs
  assert(!out.breadcrumbs[0].message.includes('foo@bar.com'), 'breadcrumb.message scrubeado')
  assert(out.breadcrumbs[0].data.email === '[redacted]', 'breadcrumb.data.email redactado por key')
})

// ─── 4. null safety ──────────────────────────────────────────────────────
group('scrubPii — null/undefined safety', () => {
  assert(scrubPii(null) === null, 'null pasa-through')
  const minimal = { message: 'hi' }
  assert(scrubPii(minimal).message === 'hi', 'event mínimo sin PII no rompe')
})

// ─── 5. depth limit ──────────────────────────────────────────────────────
group('scrubValue — depth limit', () => {
  const deep = { a: { b: { c: { d: { e: { f: { g: 'too deep' } } } } } } }
  const out = I.scrubValue(deep, 0)
  // scrubValue baja con depth+1 en cada nivel; cuando depth>5 devuelve string.
  // Path: a(d=1) → b(d=2) → c(d=3) → d(d=4) → e(d=5) → f(d=6 → '[depth-limit]')
  assert(out.a.b.c.d.e.f === '[depth-limit]', 'depth > MAX_DEPTH redactado', { out })
})

// ─── Resumen ─────────────────────────────────────────────────────────────
console.log('')
console.log('─────────────────────────')
console.log(`  ${pass} pass / ${fail} fail`)
console.log('─────────────────────────')

if (fail > 0) {
  console.log('\n❌ Smoke FAILED — el scrub-pii tiene un bug. NO mergear hasta resolver.')
  process.exit(1)
}
console.log('\n✅ Smoke OK — el scrub-pii cubre los casos esperados.')
