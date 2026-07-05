/**
 * Invariante ejecutable de la lógica del home de resultados (P1.C) — sin DB.
 *
 *   npm run check:invariant:home-metrics
 *
 * Cubre lo que el sprint pide constatar a nivel lógica pura:
 *   1. PERÍODO: periodBoundsForHome delega en el helper AR (incl. borde de mes).
 *   2. PLATA: ticket null → null (→ card de setup); ticket cargado → cálculo OK.
 *   3. GATE del semáforo por plan (planAllows mapea a insightEnabled).
 *   4. EMBUDO / VELOCIDAD / ORIGEN: agregaciones correctas y honestas.
 *   5. EMPTY STATES: las entradas vacías producen los valores que disparan los
 *      estados de invitación (null / [] / total 0), nunca ceros inventados.
 *
 * La anti-fuga multi-tenant (org A ≠ org B) se verifica en RUNTIME contra Neon
 * (scripts/dev, ver bitácora P1.C) porque depende del filtro Prisma, no de lógica
 * pura. Acá se cubre todo lo demás de forma determinística.
 */
import assert from 'node:assert/strict'
import {
  periodBoundsForHome,
  computeLeadsDelta,
  deltaPhrase,
  computeVelocity,
  formatVelocity,
  estimateMoney,
  formatMoneyUsd,
  buildFunnel,
  categorizeOrigin,
  tallyOrigins,
  campaignLabel,
  tallyCampaigns,
} from './home-metrics-logic.ts'
import { weekRangeAR, previousRangeForPeriod } from '@/lib/dates-ar'
import { planAllows } from '@/lib/plan/plan-allows'
import { PLAN_FALLBACK, type EffectivePlan } from '@/lib/plan/fallback'
import type { ChatbotLeadStatus } from '@prisma/client'

const DAY = 86_400_000

// ── 1. PERÍODO: delega en dates-ar, incl. borde de mes ────────────────────────
{
  // now sobre un borde de mes (31-may 17:00 AR): la semana puede cruzar may→jun.
  const now = new Date('2026-05-31T20:00:00.000Z')
  const b = periodBoundsForHome(now)

  // Delegación exacta (no se recalcula a mano).
  assert.deepEqual(b.current, weekRangeAR(now), 'current = weekRangeAR (delegación)')
  assert.deepEqual(
    b.previous,
    previousRangeForPeriod('week', now),
    'previous = previousRangeForPeriod(week) (delegación)',
  )
  // Contigüidad + largo, aunque la semana cruce el borde de mes.
  assert.equal(b.current.end.getTime() - b.current.start.getTime(), 7 * DAY, 'semana = 7 días')
  assert.equal(b.previous.end.getTime(), b.current.start.getTime(), 'previa termina donde arranca la actual')
  assert.equal(b.previous.end.getTime() - b.previous.start.getTime(), 7 * DAY, 'previa = 7 días')
}

// ── 2. LEADS + variación ──────────────────────────────────────────────────────
{
  assert.deepEqual(computeLeadsDelta(12, 8), { current: 12, previous: 8, delta: 4 })
  assert.equal(deltaPhrase(computeLeadsDelta(12, 8)), '+4 vs la semana pasada')
  assert.equal(deltaPhrase(computeLeadsDelta(5, 5)), 'igual que la semana pasada')
  assert.equal(deltaPhrase(computeLeadsDelta(3, 0)), 'primeros de la semana')
  assert.equal(deltaPhrase(computeLeadsDelta(0, 0)), null, '0/0 no genera frase (empty state)')

  // P2.C-fix-signo — el signo negativo debe ser el guion ASCII (U+002D), NUNCA
  // el MINUS SIGN Unicode (U+2212): ese carácter no tiene glifo en fuentes
  // estándar no incrustadas (Helvetica en @react-pdf/renderer) y se renderiza
  // invisible con ancho 0 — rompía "−18 vs..." en el PDF mensual (P2.C).
  const negativePhrase = deltaPhrase(computeLeadsDelta(8, 12))
  assert.equal(negativePhrase, '-4 vs la semana pasada')
  assert.ok(negativePhrase?.includes('-4'), 'debe llevar el guion ASCII pegado al número')
  assert.equal(negativePhrase?.charCodeAt(0), 45, 'guion ASCII (U+002D), no MINUS SIGN')
  assert.ok(!negativePhrase?.includes('−'), 'nunca el MINUS SIGN Unicode (U+2212)')
}

// ── 3. PLATA: ticket null → null (setup); cargado → cálculo ───────────────────
{
  assert.equal(estimateMoney(10, null), null, 'sin ticket → null → card de setup')
  assert.equal(estimateMoney(10, 1500), 15000, '10 leads × US$1500 = 15000')
  assert.equal(estimateMoney(0, 1500), 0, '0 leads con ticket → 0 (el componente muestra invitación)')
  assert.equal(formatMoneyUsd(15000), 'US$ 15.000', 'formato es-AR con miles')
  assert.equal(formatMoneyUsd(1500), 'US$ 1.500')
}

// ── 4. GATE del semáforo por plan ─────────────────────────────────────────────
{
  // Starter (fallback): sin clasificación.
  assert.equal(planAllows(PLAN_FALLBACK, 'leadScoring'), false, 'Starter/fallback → semáforo OFF')
  // Pro/Business: insightEnabled true → clasificación ON.
  const pro: EffectivePlan = { ...PLAN_FALLBACK, key: 'PRO', insightEnabled: true }
  assert.equal(planAllows(pro, 'leadScoring'), true, 'Pro → semáforo ON')
}

// ── 5. VELOCIDAD ──────────────────────────────────────────────────────────────
{
  const t0 = new Date('2026-06-10T12:00:00.000Z')
  const v = computeVelocity([
    { capturedAt: t0, firstContactedAt: new Date(t0.getTime() + 30 * 60_000) }, // 30 min
    { capturedAt: t0, firstContactedAt: new Date(t0.getTime() + 90 * 60_000) }, // 90 min
    { capturedAt: t0, firstContactedAt: null }, // sin contactar → se ignora
    { capturedAt: t0, firstContactedAt: new Date(t0.getTime() - 60_000) }, // negativo → se ignora
  ])
  assert.equal(v.avgMinutes, 60, 'promedio (30+90)/2 = 60 min')
  assert.equal(v.sampleSize, 2, 'solo 2 muestras válidas')

  // Sin muestras → null → dispara el estado de invitación.
  assert.deepEqual(computeVelocity([]), { avgMinutes: null, sampleSize: 0 }, 'vacío → null (empty state)')

  assert.equal(formatVelocity(45), '45 min')
  assert.equal(formatVelocity(120), '2 h')
  assert.equal(formatVelocity(2880), '2 días')
}

// ── 6. EMBUDO ─────────────────────────────────────────────────────────────────
{
  const mk = (status: ChatbotLeadStatus, firstContactedAt: Date | null = null) => ({
    status,
    firstContactedAt,
  })
  const f = buildFunnel([
    mk('NEW'), // sin tocar → pending
    mk('CONTACTED'), // contactado
    mk('WON'), // contactado + vendido
    mk('NEW', new Date()), // NEW pero con sello → cuenta como contactado
    mk('LOST'), // contactado (no avanzó)
  ])
  assert.equal(f.total, 5, 'total')
  assert.equal(f.contacted, 4, 'contactados: CONTACTED + WON + LOST + (NEW con sello)')
  assert.equal(f.sold, 1, 'vendidos: solo WON')
  assert.equal(f.pending, 1, 'sin actualizar: el NEW sin sello')

  // Vacío → total 0 → dispara empty state.
  assert.deepEqual(buildFunnel([]), { total: 0, contacted: 0, sold: 0, pending: 0 }, 'vacío (empty state)')
}

// ── 7. ORIGEN: categorización honesta ─────────────────────────────────────────
{
  const cat = categorizeOrigin
  assert.equal(cat({ referrerUrl: 'https://www.google.com/search?q=x', utmSource: null }), 'Google')
  assert.equal(cat({ referrerUrl: 'https://l.instagram.com/', utmSource: null }), 'Instagram')
  assert.equal(cat({ referrerUrl: 'https://m.facebook.com/', utmSource: null }), 'Facebook')
  assert.equal(cat({ referrerUrl: 'https://wa.me/549112345', utmSource: null }), 'WhatsApp')
  assert.equal(cat({ referrerUrl: null, utmSource: 'instagram' }), 'Instagram', 'UTM explícito gana')
  assert.equal(cat({ referrerUrl: null, utmSource: null }), 'Directo', 'sin referrer ni utm → Directo')
  assert.equal(cat({ referrerUrl: 'https://blog-random.io/post', utmSource: null }), 'Otros', 'referrer desconocido → Otros')
  assert.equal(
    cat({ referrerUrl: 'https://matsu.com.ar/productos', utmSource: null }, 'matsu.com.ar'),
    'Directo',
    'referrer del propio sitio → Directo (tráfico interno, no Otros)',
  )
  assert.equal(
    cat({ referrerUrl: 'https://www.google.com', utmSource: 'newsletter' }),
    'Google',
    'UTM desconocido cae al referrer conocido',
  )
}

// ── 8. tallyOrigins: orden desc, "Otros" último, topN ─────────────────────────
{
  const items = [
    { referrerUrl: 'https://google.com', utmSource: null }, // Google
    { referrerUrl: 'https://google.com', utmSource: null }, // Google
    { referrerUrl: 'https://instagram.com', utmSource: null }, // Instagram
    { referrerUrl: 'https://blog-x.com', utmSource: null }, // Otros
    { referrerUrl: 'https://blog-y.com', utmSource: null }, // Otros
    { referrerUrl: 'https://blog-z.com', utmSource: null }, // Otros
    { referrerUrl: null, utmSource: null }, // Directo
  ]
  const t = tallyOrigins(items)
  assert.equal(t[0].label, 'Google', 'Google primero (2)')
  assert.equal(t[0].count, 2)
  // "Otros" (3) NO debe quedar primero pese a tener más que Instagram/Directo.
  assert.equal(t[t.length - 1].label, 'Otros', 'Otros siempre último')
  // topN respeta el corte.
  assert.ok(tallyOrigins(items, null, 2).length === 2, 'topN=2 corta a 2')

  assert.deepEqual(tallyOrigins([]), [], 'vacío → [] (empty state de origen)')
}

// ── 9. tallyOrigins con MÁS de topN buckets: suma preservada, 'Otros' no se cae ─
// (regression del review P1.C: antes el slice descartaba 'Otros' y los % se
//  inflaban sobre un total truncado que no cuadraba con "Leads esta semana").
{
  const ref = (h: string) => ({ referrerUrl: `https://${h}`, utmSource: null })
  const many = [
    ref('google.com'), ref('google.com'), ref('google.com'), // Google x3
    ref('instagram.com'), ref('instagram.com'), // Instagram x2
    ref('facebook.com'), // Facebook x1
    ref('wa.me'), // WhatsApp x1
    ref('tiktok.com'), // TikTok x1
    { referrerUrl: null, utmSource: null }, // Directo x1
    ref('blog-uno.io'), ref('blog-dos.io'), // Otros x2
  ]
  const t = tallyOrigins(many) // topN=5 por defecto, 7 buckets distintos
  assert.ok(t.length <= 5, 'respeta el tope de buckets')
  const sum = t.reduce((acc, b) => acc + b.count, 0)
  assert.equal(sum, many.length, 'la suma de buckets == total de leads (los % reconcilian con el hero)')
  assert.ok(t.some((b) => b.label === 'Otros'), "'Otros' nunca se descarta (se pliega, no se cae)")
  assert.equal(t[0].label, 'Google', 'el más fuerte queda primero')
}

// ── 10. CAMPAÑA: humanización honesta del utm_campaign (P4.1) ──────────────────
{
  const cl = campaignLabel
  assert.equal(cl('promo_diciembre'), 'Promo Diciembre', 'snake_case → Título legible para el dueño')
  assert.equal(cl('launch_q3'), 'Launch Q3', 'tokens cortos también se capitalizan (q3 → Q3)')
  assert.equal(cl('black-friday-2025'), 'Black Friday 2025', 'kebab-case + números')
  assert.equal(cl('  Verano.2026  '), 'Verano 2026', 'trim + separador punto')
  assert.equal(cl('PROMO'), 'Promo', 'normaliza mayúsculas gritadas')
  // Sin campaña → null (la vista muestra "Sin campaña", NUNCA inventa un valor).
  assert.equal(cl(null), null, 'null → null')
  assert.equal(cl(''), null, 'vacío → null')
  assert.equal(cl('   '), null, 'solo espacios → null')
  assert.equal(cl('___'), null, 'solo separadores → null')
  // Cap defensivo de largo (no rompe el layout de las barras/celda).
  const long = cl('a'.repeat(80))
  assert.ok(long != null && long.length <= 48, 'cap a 48 chars')
  assert.ok(long != null && long.endsWith('…'), 'trunca con elipsis')
}

// ── 11. tallyCampaigns: cuenta reales, aparta "sin campaña", suma preservada ───
{
  const items = [
    'promo_diciembre', 'promo_diciembre', 'Promo-Diciembre', // 3 → mismo bucket (case/sep-insensitive)
    'launch_q3', // 1
    null, null, '', '   ', // 4 sin campaña
  ]
  const b = tallyCampaigns(items)
  assert.equal(b.campaigns[0].label, 'Promo Diciembre', 'la campaña más fuerte primero')
  assert.equal(b.campaigns[0].count, 3, 'agrupa variantes del mismo slug (case/separador)')
  assert.equal(b.campaigns[1].label, 'Launch Q3')
  assert.equal(b.noCampaign, 4, 'null/vacío/espacios → sin campaña (no es un bucket real)')
  // GARANTÍA de suma: reconcilia con "Leads esta semana" del hero.
  const sum = b.campaigns.reduce((acc, c) => acc + c.count, 0) + b.noCampaign
  assert.equal(sum, items.length, 'sum(campaigns) + noCampaign == total de leads')
  assert.equal(b.total, items.length, 'total expuesto == total de leads')

  // Todas sin campaña → campaigns:[] (dispara el empty state "Todavía sin campañas").
  const allNull = tallyCampaigns([null, null, null])
  assert.deepEqual(allNull.campaigns, [], 'sin campañas reales → [] (empty state)')
  assert.equal(allNull.noCampaign, 3)
  assert.equal(allNull.total, 3)

  // Vacío total.
  assert.deepEqual(
    tallyCampaigns([]),
    { campaigns: [], noCampaign: 0, total: 0 },
    'vacío → todo en cero',
  )

  // topN: la cola de campañas reales se pliega en 'Otras campañas' sin perder la suma.
  const many = ['c1', 'c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', null]
  const t = tallyCampaigns(many, 3) // 7 campañas reales distintas, topN=3
  assert.ok(t.campaigns.length <= 3, 'respeta topN')
  assert.ok(t.campaigns.some((c) => c.label === 'Otras campañas'), "cola plegada en 'Otras campañas'")
  const sum2 = t.campaigns.reduce((acc, c) => acc + c.count, 0) + t.noCampaign
  assert.equal(sum2, many.length, 'suma preservada con fold + sin campaña')
}

console.log('✓ home-metrics-logic invariants OK')
