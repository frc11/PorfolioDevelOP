/**
 * FIX-BRIEF — Invariante del input del brief ejecutivo (puro, sin DB/LLM).
 * Corre:  npx tsx src/lib/ai/executive-brief-input.invariant.ts
 *
 * El output de Gemini NO es determinístico (eso lo verifica un humano con un
 * reporte real). Acá bloqueamos lo determinístico del fix:
 *   1) El delta que ve el brief == el delta de la card (build.ts).
 *   2) Con deltas negativos, el input NUNCA describe crecimiento en esa métrica.
 *   3) No se filtran métricas fuera de las cards (las sub-dimensiones, el "58%").
 *   4) El system prompt conserva las reglas anti-invención.
 *   5) El corte de cache invalida briefs viejos y no los nuevos.
 */
import assert from 'node:assert/strict'
import {
  BRIEF_LOGIC_CUTOFF,
  BRIEF_SYSTEM_PROMPT,
  buildBriefMetricsInput,
  buildBriefUserPrompt,
  cardHealthDelta,
  isBriefCacheCurrent,
  pickPreviousHealthTotal,
} from './executive-brief-input.ts'

// ── 1) Delta de Health idéntico al de la card (build.ts:141-144) ─────────────
// build.ts hace current.total - previous.total, con null si no hay previa.
assert.equal(cardHealthDelta(76, 80), -4, 'Health delta = current - previous')
assert.equal(cardHealthDelta(80, 76), 4)
assert.equal(cardHealthDelta(80, 80), 0)
assert.equal(cardHealthDelta(76, null), null, 'sin semana previa → null, igual que la card')

// pickPreviousHealthTotal replica el "previous" de la card incluso en regen.
assert.equal(pickPreviousHealthTotal([], '2026-W27'), null, 'primera semana del negocio → null')
assert.equal(
  pickPreviousHealthTotal(
    [
      { periodKey: '2026-W26', healthTotal: 80 },
      { periodKey: '2026-W25', healthTotal: 78 },
    ],
    '2026-W27',
  ),
  80,
  'sin snapshot de esta semana → la previa es la más reciente',
)
assert.equal(
  pickPreviousHealthTotal(
    [
      { periodKey: '2026-W27', healthTotal: 76 },
      { periodKey: '2026-W26', healthTotal: 80 },
    ],
    '2026-W27',
  ),
  80,
  'con snapshot de esta semana (regen) → se saltea y toma la previa real',
)

// ── 2) Semana en baja: describe caídas, nunca crecimiento ────────────────────
const weakMetrics = buildBriefMetricsInput({
  healthTotal: 76,
  previousHealthTotal: 80, // -4 pts, el bug real
  leads: { value: 3, trend: -50 },
  conversations: { value: 12, trend: -12 },
  tasks: { value: 4, trend: 0 },
})
const weakPrompt = buildBriefUserPrompt({ companyName: 'San Miguel', metrics: weakMetrics })

assert.match(weakPrompt, /Health Score: 76\/100 — bajó 4 puntos/, 'Health debe decir "bajó 4 puntos"')
assert.match(weakPrompt, /Leads: 3 — bajó 50%/, 'Leads debe decir "bajó 50%"')
assert.match(weakPrompt, /Conversaciones: 12 — bajó 12%/)
assert.match(weakPrompt, /Tareas: 4 — igual que la semana anterior/)
assert.doesNotMatch(
  weakPrompt,
  /subió|escaló|creció|duplic|mejoró/i,
  'un input en baja no puede insinuar crecimiento',
)

// ── 3) No se filtran métricas fuera de las cards (el "58%" del bug) ───────────
assert.doesNotMatch(
  weakPrompt,
  /Salud (Digital|Comercial|Operativa)/i,
  'las sub-dimensiones no van al prompt',
)
const metricLines = weakPrompt.split('\n').filter((line) => line.trimStart().startsWith('- '))
assert.equal(metricLines.length, 4, 'exactamente 4 métricas, una por card')

// ── 4) Caso positivo: subidas se describen como subidas ──────────────────────
const upMetrics = buildBriefMetricsInput({
  healthTotal: 84,
  previousHealthTotal: 80,
  leads: { value: 10, trend: 100 },
  conversations: { value: 30, trend: 15 },
  tasks: { value: 8, trend: 20 },
})
const upPrompt = buildBriefUserPrompt({ companyName: 'X', metrics: upMetrics })
assert.match(upPrompt, /Health Score: 84\/100 — subió 4 puntos/)
assert.match(upPrompt, /Leads: 10 — subió 100%/)
assert.doesNotMatch(upPrompt, /\bbajó\b/i, 'un input en alza no puede decir "bajó"')

// ── 5) Primera medición (sin semana previa) → "sin comparación", sin dirección ─
const firstMetrics = buildBriefMetricsInput({
  healthTotal: 70,
  previousHealthTotal: null,
  leads: { value: 5, trend: null },
  conversations: { value: 9, trend: null },
  tasks: { value: 2, trend: null },
})
const firstPrompt = buildBriefUserPrompt({ companyName: 'X', metrics: firstMetrics })
assert.match(firstPrompt, /Health Score: 70\/100 — sin comparación con la semana anterior/)
assert.doesNotMatch(firstPrompt, /subió|bajó/i, 'sin semana previa no se afirma dirección')

// ── 6) El system prompt trae las reglas anti-invención ───────────────────────
assert.match(BRIEF_SYSTEM_PROMPT, /SOLO los números/, 'regla: comentar solo lo listado')
assert.match(BRIEF_SYSTEM_PROMPT, /Respetá EXACTAMENTE la dirección/, 'regla: respetar el signo')
assert.match(BRIEF_SYSTEM_PROMPT, /No afirmes ninguna tendencia/, 'regla: no inventar tendencias')
assert.match(BRIEF_SYSTEM_PROMPT, /oportunidad/, 'regla: caída como oportunidad')
assert.match(BRIEF_SYSTEM_PROMPT, /corto y honesto/, 'regla: semana floja, corto y honesto')

// ── 7) Corte de cache: invalida briefs viejos, no los nuevos ─────────────────
assert.equal(isBriefCacheCurrent(null), false, 'sin cache → no es vigente')
assert.equal(
  isBriefCacheCurrent(new Date(BRIEF_LOGIC_CUTOFF.getTime() - 1)),
  false,
  'brief 1ms antes del corte = viejo',
)
assert.equal(isBriefCacheCurrent(new Date(BRIEF_LOGIC_CUTOFF.getTime())), true, 'en el corte = vigente')
assert.equal(
  isBriefCacheCurrent(new Date(BRIEF_LOGIC_CUTOFF.getTime() + 86_400_000)),
  true,
  'brief posterior al corte = vigente',
)

console.log(
  '✓ executive-brief-input.invariant: input alineado con las cards, sin invención de tendencias, cache versionado',
)
