/**
 * UTM.1 — Smoke end-to-end contra el dev server REAL (widget → request →
 * Conversation → ChatbotLead).
 *
 *   node scripts/utm1-smoke.mjs
 *
 * Qué hace:
 *   1. Turno 1 — POST /chat con sessionId + utmSource/utmMedium/utmCampaign/
 *      referrer en el body → crea la Conversation.
 *   2. Turno 2 — MISMO sessionId, UTMs DISTINTOS → prueba el guard first-touch
 *      a nivel wire (el server debe ignorarlos en una conversación existente).
 *   3. Turno 3 — mensaje de alta señal (nombre + teléfono + pedido de
 *      contacto) para llevar al bot a invocar capture_lead naturalmente.
 *   4. Lectura directa con PrismaClient: assert que la Conversation persistida
 *      tiene los UTMs del TURNO 1 (no del 2), y que el ChatbotLead (si se
 *      capturó) hereda esos mismos UTMs.
 *
 * El paso 3 depende de que el LLM decida invocar capture_lead — es best-effort,
 * no determinístico. Si no dispara esta corrida, el script lo señala con ⚠️
 * (no lo trata como falla dura): la corrección de la copia Conversation→Lead
 * ya está probada de forma determinística en
 * scripts/utm1-verify-attribution.ts (invoca la tool directo, sin LLM).
 *
 * ─── PRECONDICIONES ───
 *  1. Dev server levantado y respondiendo (ver EV4_BASE_URL/UTM1_BASE_URL).
 *  2. El bot de UTM1_SLUG existe y está activo.
 *  3. Claves de LLM configuradas (el turno 3 hace una llamada real).
 *
 * Config por env:
 *   UTM1_BASE_URL (default http://localhost:3002)
 *   UTM1_ORIGIN   (default = UTM1_BASE_URL)
 *   UTM1_SLUG     (default 'develop')
 *
 * Por default borra la Conversation (+ ChatbotLead si se capturó, + sus
 * ChatMessage por cascade) creados por esta corrida. Pasar --keep para
 * dejarlos y poder inspeccionarlos a mano.
 */

import { PrismaClient } from '@prisma/client'
import { config as loadEnv } from 'dotenv'

loadEnv({ path: '.env.local' })
loadEnv({ path: '.env' })

const BASE_URL = process.env.UTM1_BASE_URL ?? 'http://localhost:3002'
const ORIGIN = process.env.UTM1_ORIGIN ?? BASE_URL
const SLUG = process.env.UTM1_SLUG ?? 'develop'

const DEV_BRANCH_HOST = 'ep-quiet-waterfall-acv0fpll'
if (!process.env.DATABASE_URL?.includes(DEV_BRANCH_HOST)) {
  console.error(
    `[utm1-smoke] ABORT: DATABASE_URL no apunta a la branch Neon dev (${DEV_BRANCH_HOST}-*).`,
  )
  process.exit(1)
}

const KEEP_ROWS = process.argv.includes('--keep')

const prisma = new PrismaClient()

// Mismo parser best-effort del UI message stream que ev4-smoke.mjs.
function extractAssistantText(rawBody) {
  const deltas = []
  const toolCalls = []
  for (const line of rawBody.split('\n')) {
    const trimmed = line.startsWith('data:') ? line.slice(5).trim() : line.trim()
    if (!trimmed || trimmed === '[DONE]') continue
    let obj
    try {
      obj = JSON.parse(trimmed)
    } catch {
      continue
    }
    const type = obj.type ?? ''
    if (typeof obj.delta === 'string' && type.includes('text')) deltas.push(obj.delta)
    else if (typeof obj.textDelta === 'string') deltas.push(obj.textDelta)
    else if (type === 'text' && typeof obj.text === 'string') deltas.push(obj.text)
    if (type.includes('tool')) {
      const name = obj.toolName ?? obj.name
      if (name) toolCalls.push(name)
    }
  }
  return { text: deltas.join('').trim(), toolCalls }
}

async function postTurn(sessionId, messages, extraBody) {
  const res = await fetch(`${BASE_URL}/api/chatbot/${SLUG}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: ORIGIN },
    body: JSON.stringify({ messages, sessionId, currentPath: '/', ...extraBody }),
  })
  const raw = await res.text()
  return { status: res.status, ...extractAssistantText(raw) }
}

async function main() {
  try {
    const ping = await fetch(BASE_URL, { method: 'GET' })
    void ping
  } catch (e) {
    console.error(
      `[utm1-smoke] ABORT: el dev server no responde en ${BASE_URL}. Levantalo y reintentá. Detalle: ${e?.message ?? e}`,
    )
    process.exit(2)
  }

  const sessionId = `utm1-smoke-${Date.now()}`
  const messages = []
  const results = []
  const check = (name, pass, detail) => {
    results.push({ name, pass })
    console.log(`${pass ? '✅' : '❌'} ${name}${detail ? ` — ${detail}` : ''}`)
  }

  console.log(`[utm1-smoke] sessionId=${sessionId} slug=${SLUG} base=${BASE_URL}`)

  let conversationId = null
  let leadId = null

  try {
    // ─── Turno 1 — crea la Conversation con UTMs A ──────────────────────
    messages.push({ role: 'user', content: 'Hola, quiero información.' })
    const turn1 = await postTurn(sessionId, messages, {
      utmSource: 'google',
      utmMedium: 'cpc',
      utmCampaign: 'launch_q3',
      referrer: 'https://google.com/search',
    })
    check('Turno 1 responde 200', turn1.status === 200, `HTTP ${turn1.status}`)
    messages.push({ role: 'assistant', content: turn1.text })

    // ─── Turno 2 — mismo sessionId, UTMs DISTINTOS ──────────────────────
    messages.push({ role: 'user', content: '¿Qué planes tienen?' })
    const turn2 = await postTurn(sessionId, messages, {
      utmSource: 'newsletter',
      utmMedium: 'email',
      utmCampaign: 'q3_newsletter',
      referrer: 'https://mail.google.com/',
    })
    check('Turno 2 responde 200', turn2.status === 200, `HTTP ${turn2.status}`)
    messages.push({ role: 'assistant', content: turn2.text })

    // ─── Turno 3 — señal alta para intentar disparar capture_lead ───────
    messages.push({
      role: 'user',
      content: 'Me llamo Juan Pérez, mi teléfono es 1122334455. Quiero que me contacten para avanzar.',
    })
    const turn3 = await postTurn(sessionId, messages, {})
    check('Turno 3 responde 200', turn3.status === 200, `HTTP ${turn3.status}`)
    console.log(`  capture_lead invocado en turno 3: ${turn3.toolCalls.includes('capture_lead') ? 'sí' : 'no'}`)

    // ─── Verificación DB directa ─────────────────────────────────────────
    const conversation = await prisma.conversation.findFirst({ where: { sessionId } })
    check('Conversation persistida existe', Boolean(conversation))
    if (conversation) {
      conversationId = conversation.id
      check(
        'Conversation tiene los UTMs del TURNO 1 (no del turno 2 — first-touch)',
        conversation.utmSource === 'google' &&
          conversation.utmMedium === 'cpc' &&
          conversation.utmCampaign === 'launch_q3' &&
          conversation.referrerUrl === 'https://google.com/search',
        `utmSource=${conversation.utmSource}, utmMedium=${conversation.utmMedium}, utmCampaign=${conversation.utmCampaign}, referrerUrl=${conversation.referrerUrl}`,
      )

      const lead = await prisma.chatbotLead.findFirst({ where: { conversationId: conversation.id } })

      if (lead) {
        leadId = lead.id
        check(
          'ChatbotLead capturado hereda los UTMs de la Conversation',
          lead.utmSource === conversation.utmSource &&
            lead.utmMedium === conversation.utmMedium &&
            lead.utmCampaign === conversation.utmCampaign,
          `lead.utmSource=${lead.utmSource}, lead.utmMedium=${lead.utmMedium}, lead.utmCampaign=${lead.utmCampaign}`,
        )
        console.log('\nFila de ChatbotLead resultante (para pegar en el reporte):')
        console.log(
          JSON.stringify(
            {
              id: lead.id,
              utmSource: lead.utmSource,
              utmMedium: lead.utmMedium,
              utmCampaign: lead.utmCampaign,
              capturedAt: lead.capturedAt,
            },
            null,
            2,
          ),
        )
      } else {
        console.log(
          '\n⚠️  El LLM no invocó capture_lead en esta corrida (no determinístico). ' +
            'La copia Conversation→ChatbotLead ya está probada de forma determinística ' +
            'en scripts/utm1-verify-attribution.ts. No se cuenta como falla del smoke.',
        )
      }
    }
  } finally {
    if (KEEP_ROWS) {
      console.log('\n[utm1-smoke] --keep: no se borra nada (Conversation/ChatbotLead quedan para inspección manual).')
    } else {
      if (leadId) await prisma.chatbotLead.delete({ where: { id: leadId } }).catch(() => {})
      if (conversationId) {
        // Cascade borra los ChatMessage asociados (onDelete: Cascade en el schema).
        await prisma.conversation.delete({ where: { id: conversationId } }).catch(() => {})
      }
      console.log(
        `[utm1-smoke] Limpieza: ${leadId ? 1 : 0} lead(s), ${conversationId ? 1 : 0} conversation(s) borrados.`,
      )
    }
    await prisma.$disconnect()
  }

  const failed = results.filter((r) => !r.pass)
  console.log(`\n${results.length - failed.length}/${results.length} checks OK`)
  if (failed.length > 0) process.exit(1)
}

main().catch(async (e) => {
  console.error('[utm1-smoke] Error fatal:', e)
  await prisma.$disconnect().catch(() => {})
  process.exit(1)
})
