/**
 * EV.4 — Smoke conversacional scripteado contra el dev server REAL.
 *
 *   node scripts/ev4-smoke.mjs
 *
 * Corre 7 conversaciones (3 agencia + 4 usados) vía POST real a
 * /api/chatbot/[slug]/chat y guarda un transcript .md por conversación en
 * docs/ev4-transcripts/, con los intents detectados anotados al pie.
 *
 * ─── PRECONDICIONES (si no se cumplen, el script aborta e indica cuál falta) ───
 *  1. Dev server levantado y respondiendo. Para origin localhost, levantar con
 *     QA_ALLOW_LOCALHOST=1 (ej. `npm run dev:qa`, puerto 3002) — el endpoint
 *     valida Origin contra los allowedDomains del bot.
 *  2. Los bots existen en la DB con su verticalPack correcto:
 *       - agencia: slug 'develop'  → verticalPack='agencia'
 *       - usados:  slug 'sanmiguel' → verticalPack='usados'
 *     ⚠️ Si quedaron en 'base' (default de la migración EV.2), el smoke NO ejercita
 *     los packs nuevos. Backfill requerido (ver gate EV.3/EV.4 en la bitácora).
 *  3. Claves de LLM configuradas (las conversaciones hacen llamadas reales).
 *
 * Config por env:
 *   EV4_BASE_URL   (default http://localhost:3002)
 *   EV4_ORIGIN     (default = EV4_BASE_URL)  — header Origin enviado al endpoint
 *   EV4_AGENCIA_SLUG (default 'develop')
 *   EV4_USADOS_SLUG  (default 'sanmiguel')
 */

import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const BASE_URL = process.env.EV4_BASE_URL ?? 'http://localhost:3002'
const ORIGIN = process.env.EV4_ORIGIN ?? BASE_URL
const AGENCIA_SLUG = process.env.EV4_AGENCIA_SLUG ?? 'develop'
const USADOS_SLUG = process.env.EV4_USADOS_SLUG ?? 'sanmiguel'
const OUT_DIR = 'docs/ev4-transcripts'

/**
 * Cada turno trae la frase del visitante y el intent que el pack DEBERÍA detectar
 * (validado por src/.../__tests__/ev4.invariant.ts). El transcript anota ese
 * intent esperado junto a la respuesta REAL del bot.
 */
const CONVERSATIONS = [
  {
    id: 'agencia-1-web',
    slug: AGENCIA_SLUG,
    title: 'Agencia — interesado en sitio web',
    turns: [
      { user: 'Hola, necesito un sitio web para mi negocio', expectedIntent: 'service_inquiry' },
      { user: '¿Cuánto sale más o menos?', expectedIntent: 'price' },
      { user: 'Quiero coordinar una reunión para charlarlo', expectedIntent: 'consultation' },
    ],
  },
  {
    id: 'agencia-2-chatbot-ia',
    slug: AGENCIA_SLUG,
    title: 'Agencia — interesado en chatbot IA',
    turns: [
      { user: 'Me interesa un chatbot con inteligencia artificial', expectedIntent: 'service_inquiry' },
      { user: '¿Por qué ustedes y no otra agencia?', expectedIntent: 'comparison' },
      { user: 'Lo necesito ya, es urgente', expectedIntent: 'urgency' },
    ],
  },
  {
    id: 'agencia-3-vago',
    slug: AGENCIA_SLUG,
    title: 'Agencia — visitante vago',
    turns: [
      { user: 'Hola', expectedIntent: 'unknown' },
      { user: 'Qué hacen ustedes?', expectedIntent: 'unknown' },
      { user: 'Ah, interesante', expectedIntent: 'unknown' },
    ],
  },
  {
    id: 'usados-1-comprador-caliente',
    slug: USADOS_SLUG,
    title: 'Usados — comprador caliente (modelo + financiación + visita)',
    turns: [
      { user: '¿Tenés el Corolla que publicaron?', expectedIntent: 'specific_model' },
      { user: '¿Se puede en cuotas con prendario?', expectedIntent: 'financing_inquiry' },
      { user: 'Quiero ir a verlo y hacer un test drive', expectedIntent: 'schedule_visit' },
      { user: 'Mi teléfono es 381 555 1234, llámenme', expectedIntent: 'human_handoff' },
    ],
  },
  {
    id: 'usados-2-permuta',
    slug: USADOS_SLUG,
    title: 'Usados — permuta',
    turns: [
      { user: 'Tengo un usado para entregar en parte de pago', expectedIntent: 'trade_in' },
      { user: '¿Cuánto me tomás el mío?', expectedIntent: 'trade_in' },
      { user: '¿Y la diferencia la puedo financiar?', expectedIntent: 'financing_inquiry' },
    ],
  },
  {
    id: 'usados-3-precio-frio',
    slug: USADOS_SLUG,
    title: 'Usados — consulta de precio fría',
    turns: [
      { user: '¿Cuánto sale la Hilux?', expectedIntent: 'specific_model' },
      { user: '¿Es negociable el precio?', expectedIntent: 'price_inquiry' },
      { user: 'Gracias, lo pienso', expectedIntent: 'unknown' },
    ],
  },
  {
    id: 'usados-4-humano',
    slug: USADOS_SLUG,
    title: 'Usados — pide hablar con humano',
    turns: [
      { user: 'Quiero hablar con un vendedor', expectedIntent: 'human_handoff' },
      { user: 'Pasame el número de la agencia', expectedIntent: 'human_handoff' },
    ],
  },
]

function sessionIdFor(convId) {
  // Sin Math.random para reproducibilidad: id de conversación + timestamp del run.
  return `ev4-smoke-${convId}-${Date.now()}`
}

/**
 * Parser best-effort del UI message stream (AI SDK v6, SSE con líneas `data:`).
 * Junta deltas de texto de los campos conocidos. Si no reconoce el formato,
 * devuelve el cuerpo crudo para inspección manual.
 */
function extractAssistantText(rawBody) {
  const deltas = []
  const toolCalls = []
  let recognized = false
  for (const line of rawBody.split('\n')) {
    const trimmed = line.startsWith('data:') ? line.slice(5).trim() : line.trim()
    if (!trimmed || trimmed === '[DONE]') continue
    let obj
    try {
      obj = JSON.parse(trimmed)
    } catch {
      continue
    }
    recognized = true
    const type = obj.type ?? ''
    if (typeof obj.delta === 'string' && type.includes('text')) deltas.push(obj.delta)
    else if (typeof obj.textDelta === 'string') deltas.push(obj.textDelta)
    else if (type === 'text' && typeof obj.text === 'string') deltas.push(obj.text)
    if (type.includes('tool')) {
      const name = obj.toolName ?? obj.name
      if (name) toolCalls.push(name)
    }
  }
  return { text: deltas.join('').trim(), toolCalls, recognized }
}

async function postTurn(slug, sessionId, messages) {
  const res = await fetch(`${BASE_URL}/api/chatbot/${slug}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Origin: ORIGIN,
    },
    body: JSON.stringify({ messages, sessionId, currentPath: '/' }),
  })
  const raw = await res.text()
  return { status: res.status, raw }
}

async function runConversation(conv) {
  const sessionId = sessionIdFor(conv.id)
  const messages = []
  const lines = [`# ${conv.title}`, '', `- **slug:** \`${conv.slug}\``, `- **sessionId:** \`${sessionId}\``, '']
  const intentTable = [['Turno', 'Mensaje del visitante', 'Intent esperado', 'HTTP', 'Tool calls']]
  let anyError = false

  for (let i = 0; i < conv.turns.length; i++) {
    const turn = conv.turns[i]
    messages.push({ role: 'user', content: turn.user })
    let status = 0
    let parsed = { text: '', toolCalls: [], recognized: false }
    try {
      const { status: s, raw } = await postTurn(conv.slug, sessionId, messages)
      status = s
      parsed = extractAssistantText(raw)
      if (s !== 200) {
        anyError = true
        lines.push(`### Turno ${i + 1}`, `**Visitante:** ${turn.user}`, '', `⚠️ HTTP ${s} — ${raw.slice(0, 300)}`, '')
      } else {
        messages.push({ role: 'assistant', content: parsed.text })
        lines.push(
          `### Turno ${i + 1}`,
          `**Visitante:** ${turn.user}`,
          '',
          `**Bot:** ${parsed.text || (parsed.recognized ? '(sin texto — ver tool calls)' : '(stream no reconocido)')}`,
          '',
        )
      }
    } catch (e) {
      anyError = true
      status = -1
      lines.push(`### Turno ${i + 1}`, `**Visitante:** ${turn.user}`, '', `⚠️ Error de red: ${e?.message ?? e}`, '')
    }
    intentTable.push([
      String(i + 1),
      turn.user,
      `\`${turn.expectedIntent}\``,
      String(status),
      parsed.toolCalls.join(', ') || '—',
    ])
  }

  lines.push('---', '', '## Intents detectados (esperados por el pack EV.4) y señales', '')
  lines.push('| ' + intentTable[0].join(' | ') + ' |')
  lines.push('|' + intentTable[0].map(() => '---').join('|') + '|')
  for (const row of intentTable.slice(1)) lines.push('| ' + row.join(' | ') + ' |')
  lines.push('', `> Intent esperado = clave que el pack del bot debe detectar (validado por ev4.invariant.ts).`)

  await writeFile(join(OUT_DIR, `${conv.id}.md`), lines.join('\n') + '\n', 'utf8')
  return { id: conv.id, ok: !anyError }
}

async function main() {
  // Preflight: ¿responde el server?
  try {
    const ping = await fetch(BASE_URL, { method: 'GET' })
    void ping
  } catch (e) {
    console.error(
      `[ev4-smoke] ABORT: el dev server no responde en ${BASE_URL}. ` +
        `Levantalo (ej. \`npm run dev:qa\` para origin localhost) y reintentá. Detalle: ${e?.message ?? e}`,
    )
    process.exit(2)
  }

  await mkdir(OUT_DIR, { recursive: true })
  console.log(`[ev4-smoke] Corriendo ${CONVERSATIONS.length} conversaciones contra ${BASE_URL} (origin ${ORIGIN})`)

  const results = []
  for (const conv of CONVERSATIONS) {
    process.stdout.write(`  → ${conv.id} ... `)
    const r = await runConversation(conv)
    results.push(r)
    console.log(r.ok ? 'ok' : 'con errores (ver transcript)')
  }

  const ok = results.filter((r) => r.ok).length
  console.log(`[ev4-smoke] Listo. ${ok}/${results.length} sin errores. Transcripts en ${OUT_DIR}/`)
  if (ok < results.length) {
    console.log('[ev4-smoke] Hubo turnos con error (probable: bot inexistente, origin no permitido o verticalPack="base").')
    process.exit(1)
  }
}

main().catch((e) => {
  console.error('[ev4-smoke] Error fatal:', e)
  process.exit(1)
})
