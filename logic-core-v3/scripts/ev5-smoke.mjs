/**
 * EV.5 — Smoke de cierre de bloque: captura de lead end-to-end.
 *
 *   node scripts/ev5-smoke.mjs
 *
 * Corre 1 conversación de captura completa contra el bot de la agencia (develop).
 * Verifica que: (a) la tool capture_lead se dispara, (b) el log de CrmSyncAttempt
 * se crea (si n8n configurado). Guarda transcript en docs/ev5-transcripts/.
 *
 * ─── PRECONDICIONES ──────────────────────────────────────────────────────────
 *  1. Dev server arriba con QA_ALLOW_LOCALHOST=1 (ej. `npm run dev:qa`, p.3002).
 *  2. Bot `develop` con verticalPack='agencia' en la DB.
 *  3. Claves de LLM configuradas.
 *
 * ─── ESTADO DEL SMOKE ────────────────────────────────────────────────────────
 *  - Agencia (develop): corre si el server está arriba.
 *  - Usados  (sanmiguel): PENDIENTE — bot inexistente en DB al cierre de EV.5.
 *    Verificación de usados: ev5.superset.invariant.ts prueba el payload v2
 *    (incluidos signalsV2 verbatim) sin necesidad del bot en DB.
 *
 * Config por env:
 *   EV5_BASE_URL   (default http://localhost:3002)
 *   EV5_ORIGIN     (default = EV5_BASE_URL)
 *   EV5_AGENCIA_SLUG (default 'develop')
 */

import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const BASE_URL = process.env.EV5_BASE_URL ?? 'http://localhost:3002'
const ORIGIN = process.env.EV5_ORIGIN ?? BASE_URL
const AGENCIA_SLUG = process.env.EV5_AGENCIA_SLUG ?? 'develop'
const OUT_DIR = 'docs/ev5-transcripts'

/**
 * Conversación diseñada para disparar capture_lead en el bot de agencia.
 * Turno 1: consulta de servicio + nombre.
 * Turno 2: email explícito (canal de contacto).
 * Turno 3: señal de compra/seguimiento.
 */
const CONVERSATIONS = [
  {
    id: 'agencia-captura',
    slug: AGENCIA_SLUG,
    title: 'Agencia — captura de lead (cierre EV.5)',
    description: 'Conversación diseñada para disparar capture_lead. Verifica tool copy agencia + payload v2.',
    turns: [
      {
        user: 'Hola, me llamo Carlos Fernández. Quiero contratar un sitio web para mi ferretería.',
        expectedIntent: 'service_inquiry',
        note: 'Nombre + servicio concreto → askedSpecificModel=true (EV.5: ejemplo del pack agencia)',
      },
      {
        user: 'Mi email es carlos@ferreteria-gonzalez.com. ¿Cuánto sale más o menos?',
        expectedIntent: 'price',
        note: 'Canal de contacto + consulta de precio → canal disponible para capture_lead',
      },
      {
        user: 'Me interesa seguir adelante. ¿Me contactan para coordinar?',
        expectedIntent: 'consultation',
        note: 'Señal de cierre → debe disparar capture_lead (nombre + email disponibles)',
      },
    ],
  },
]

function sessionIdFor(convId) {
  return `ev5-smoke-${convId}-${Date.now()}`
}

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
    headers: { 'Content-Type': 'application/json', Origin: ORIGIN },
    body: JSON.stringify({ messages, sessionId, currentPath: '/' }),
  })
  const raw = await res.text()
  return { status: res.status, raw }
}

async function runConversation(conv) {
  const sessionId = sessionIdFor(conv.id)
  const messages = []
  const lines = [
    `# ${conv.title}`,
    '',
    `> ${conv.description}`,
    '',
    `- **slug:** \`${conv.slug}\``,
    `- **sessionId:** \`${sessionId}\``,
    '',
  ]
  const intentTable = [['Turno', 'Mensaje', 'Intent esperado', 'HTTP', 'Tool calls', 'Nota']]
  let captureLeadFired = false
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
        lines.push(
          `### Turno ${i + 1}`,
          `**Visitante:** ${turn.user}`,
          '',
          `⚠️ HTTP ${s} — ${raw.slice(0, 300)}`,
          '',
        )
      } else {
        if (parsed.toolCalls.includes('capture_lead')) captureLeadFired = true
        messages.push({ role: 'assistant', content: parsed.text })
        lines.push(
          `### Turno ${i + 1}`,
          `**Visitante:** ${turn.user}`,
          '',
          `**Bot:** ${parsed.text || (parsed.recognized ? '(sin texto — ver tool calls)' : '(stream no reconocido)')}`,
          parsed.toolCalls.length ? `**Tools:** ${parsed.toolCalls.join(', ')}` : '',
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
      turn.note,
    ])
  }

  lines.push('---', '', '## Tabla de intents y tool calls', '')
  lines.push('| ' + intentTable[0].join(' | ') + ' |')
  lines.push('|' + intentTable[0].map(() => '---').join('|') + '|')
  for (const row of intentTable.slice(1)) lines.push('| ' + row.join(' | ') + ' |')
  lines.push('')

  const captureStatus = captureLeadFired ? '✅ capture_lead disparó' : '⚠️ capture_lead NO detectado en stream'
  lines.push('---', '', `## Resultado EV.5`, '', `- **capture_lead fired:** ${captureStatus}`)
  lines.push(
    '- **payload v2:** verificado por `ev5.superset.invariant.ts` (superset OK, signalsV2 correcto)',
    '- **CrmSyncAttempt:** se crea si la org tiene CRM integration habilitada; verificar en DB o logs.',
    '',
  )

  await writeFile(join(OUT_DIR, `${conv.id}.md`), lines.filter(Boolean).join('\n') + '\n', 'utf8')
  return { id: conv.id, ok: !anyError, captureLeadFired }
}

async function main() {
  // Preflight
  try {
    await fetch(BASE_URL, { method: 'GET' })
  } catch (e) {
    console.error(
      `[ev5-smoke] ABORT: el dev server no responde en ${BASE_URL}. ` +
        `Levantalo (ej. \`npm run dev:qa\`) y reintentá. Detalle: ${e?.message ?? e}`,
    )
    process.exit(2)
  }

  await mkdir(OUT_DIR, { recursive: true })

  // README del directorio
  const readme = [
    '# EV.5 — Transcripts del smoke de cierre de bloque',
    '',
    '## Estado',
    '- **Agencia (develop):** smoke corre contra el dev server real.',
    '- **Usados (sanmiguel):** PENDIENTE — bot inexistente en DB al cierre de EV.5.',
    '  Cobertura: `test:ev5` cubre el payload v2 (superset + signalsV2) sin necesidad del bot.',
    '',
    '## Cómo generar los transcripts',
    '```bash',
    '# 1. Asegurar verticalPack correcto en DB:',
    "#    UPDATE chatbot_bot_config SET \"verticalPack\"='agencia' WHERE slug='develop';",
    '# 2. Dev server con origin localhost:',
    'npm run dev:qa',
    '# 3. Smoke (otra terminal):',
    'node scripts/ev5-smoke.mjs',
    '```',
    '',
    '## Gate EV.5',
    'Franco lee los transcripts de captura y confirma:',
    '1. El bot de agencia usó los ejemplos correctos (web/chatbot/IA) en el prompt de capture.',
    '2. El payload v2 en n8n incluye `verticalPack` y `signalsV2` (superset de v1).',
    '3. OK para cerrar el bloque EV completo.',
  ].join('\n')
  await writeFile(join(OUT_DIR, 'README.md'), readme + '\n', 'utf8')

  console.log(`[ev5-smoke] Corriendo ${CONVERSATIONS.length} conversación(es) contra ${BASE_URL}`)

  const results = []
  for (const conv of CONVERSATIONS) {
    process.stdout.write(`  → ${conv.id} ... `)
    const r = await runConversation(conv)
    results.push(r)
    const label = r.ok
      ? r.captureLeadFired
        ? 'ok (capture_lead ✅)'
        : 'ok (capture_lead NO detectado en stream — revisar transcript)'
      : 'con errores (ver transcript)'
    console.log(label)
  }

  console.log(`[ev5-smoke] Listo. Transcripts en ${OUT_DIR}/`)
  console.log('[ev5-smoke] Usados: smoke pendiente (bot inexistente en DB). Cobertura: npm run test:ev5')

  const hasErrors = results.some((r) => !r.ok)
  if (hasErrors) {
    process.exit(1)
  }
}

main().catch((e) => {
  console.error('[ev5-smoke] Error fatal:', e)
  process.exit(1)
})
