/**
 * B3.2 — Runner de la batería de regresión conversacional.
 *
 * Corre cada caso de cases.ts contra el endpoint real del bot:
 *   POST /api/chatbot/{BOT_SLUG}/chat
 *
 * Cada conversación de test usa sessionId con prefijo `regression-test-`
 * (purgeable por scripts/regression/purge.ts).
 *
 * Persistencia: el endpoint (vía handleChatRequest.onFinish) escribe
 * Conversation + ChatMessage + ChatbotLead + ChatbotEvent. Este script
 * NO escribe en DB — solo lee de DB después de cada turno.
 *
 * Output: archivo markdown legible en docs/regression/baseline-{ts}.md
 *
 * Run:
 *   1. En una terminal: `npm run dev` (espera a "Ready in …")
 *   2. En otra terminal: `npx tsx scripts/regression/run-baseline.ts`
 *
 * El runner verifica que el dev server responde antes de empezar.
 */

import 'dotenv/config'
import { PrismaClient, Prisma } from '@prisma/client'
import { writeFile, mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { REGRESSION_CASES, type CaseHookContext } from './cases'

const prisma = new PrismaClient()

const BASE_URL = process.env.B32_BASE_URL ?? 'http://localhost:3000'
const BOT_SLUG = 'matsu'
const SESSION_PREFIX = 'regression-test-'
const RUN_TAG = new Date().toISOString().replace(/[:.]/g, '-')
const EXPECTED_DEV_HOST = 'ep-quiet-waterfall-acv0fpll-pooler.sa-east-1.aws.neon.tech'

interface CapturedTurn {
  userText: string
  assistantText: string
  toolCalls: ToolCallRecord[]
  latencyMs: number
  /** B4.5: si el server respondió en modo degradado, este es el payload. */
  degradedPayload?: DegradedPayload | null
}

/** B4.5: shape del JSON que devuelve el server cuando entra en degradado. */
interface DegradedPayload {
  mode: 'degraded'
  reason: 'quota_exhausted' | 'domain_overflow'
  message: string
  ctaWhatsapp: boolean
  whatsappNumber: string | null
  whatsappMessage: string | null
  companyName: string | null
}

interface ToolCallRecord {
  toolName: string
  args: Record<string, unknown>
}

interface CapturedCase {
  caseId: string
  name: string
  rationale: string
  sessionId: string
  conversationId: string | null
  turns: CapturedTurn[]
  leadCaptured: boolean
  leadSnapshot: {
    name: string | null
    email: string | null
    phone: string | null
    intent: string | null
  } | null
  error: string | null
}

function checkHost(): void {
  const url = process.env.DATABASE_URL ?? ''
  const host = url.match(/@([^/]+)/)?.[1] ?? '(unknown)'
  if (host !== EXPECTED_DEV_HOST) {
    console.error(`ABORT: DATABASE_URL host "${host}" no coincide con dev.`)
    process.exit(1)
  }
}

async function ping(): Promise<boolean> {
  try {
    const r = await fetch(`${BASE_URL}/api/chatbot/${BOT_SLUG}/config`, {
      headers: { origin: BASE_URL },
    })
    return r.status < 500
  } catch {
    return false
  }
}

async function waitForBot(): Promise<void> {
  console.log(`⏳ Esperando dev server en ${BASE_URL}...`)
  const start = Date.now()
  while (Date.now() - start < 60_000) {
    if (await ping()) {
      console.log(`✓ Dev server respondiendo (${Math.round((Date.now() - start) / 1000)}s)`)
      return
    }
    await new Promise((r) => setTimeout(r, 1000))
  }
  console.error(`ABORT: dev server no respondió en 60s. Levantá con \`npm run dev\` y reintentá.`)
  process.exit(1)
}

async function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

function parseToolCalls(raw: Prisma.JsonValue | null): ToolCallRecord[] {
  if (!raw || !Array.isArray(raw)) return []
  const out: ToolCallRecord[] = []
  for (const item of raw) {
    if (typeof item !== 'object' || item === null || Array.isArray(item)) continue
    const obj = item as Record<string, Prisma.JsonValue>
    const name = typeof obj.toolName === 'string' ? obj.toolName : '(unknown)'
    let args: Record<string, unknown> = {}
    if (obj.input && typeof obj.input === 'object' && !Array.isArray(obj.input)) {
      args = obj.input as Record<string, unknown>
    } else if (obj.args && typeof obj.args === 'object' && !Array.isArray(obj.args)) {
      args = obj.args as Record<string, unknown>
    }
    out.push({ toolName: name, args })
  }
  return out
}

async function waitForAssistantMessage(
  sessionId: string,
  expectedAssistantCount: number,
  timeoutMs = 30_000,
): Promise<{ content: string; toolCalls: ToolCallRecord[] } | null> {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    const conv = await prisma.conversation.findUnique({
      where: { sessionId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          where: { role: 'assistant' },
        },
      },
    })
    if (conv && conv.messages.length >= expectedAssistantCount) {
      const last = conv.messages[expectedAssistantCount - 1]
      return {
        content: last.content,
        toolCalls: parseToolCalls(last.toolCalls),
      }
    }
    await sleep(500)
  }
  return null
}

async function runCase(
  c: (typeof REGRESSION_CASES)[number],
  hookCtx: CaseHookContext,
): Promise<CapturedCase> {
  const sessionId = `${SESSION_PREFIX}${c.id}-${RUN_TAG}`
  const result: CapturedCase = {
    caseId: c.id,
    name: c.name,
    rationale: c.rationale,
    sessionId,
    conversationId: null,
    turns: [],
    leadCaptured: false,
    leadSnapshot: null,
    error: null,
  }

  const conversationHistory: { role: 'user' | 'assistant'; content: string }[] = []

  console.log(`\n▶  [${c.id}] ${c.name}`)

  // B4.5: setup hook si el case lo declara
  if (c.setup) {
    try {
      await c.setup(hookCtx)
    } catch (e) {
      result.error = `setup failed: ${e instanceof Error ? e.message : 'unknown'}`
      console.log(`   ✗ Setup failed: ${result.error}`)
      return result
    }
  }

  try {
    for (let i = 0; i < c.userTurns.length; i++) {
      const userText = c.userTurns[i]
      conversationHistory.push({ role: 'user', content: userText })

      const t0 = Date.now()
      const res = await fetch(`${BASE_URL}/api/chatbot/${BOT_SLUG}/chat`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          origin: BASE_URL,
        },
        body: JSON.stringify({
          messages: conversationHistory,
          sessionId,
          currentPath: c.currentPath,
        }),
      })

      if (!res.ok) {
        result.error = `Turn ${i + 1}: HTTP ${res.status} ${res.statusText}`
        console.log(`   ✗ Turn ${i + 1} HTTP error: ${res.status}`)
        return result
      }

      // B4.5 — Path para casos que esperan modo degradado: el server NO
      // streamea, devuelve JSON. Validamos que llegó el shape correcto y
      // NO esperamos persistencia de assistant message (porque no hay LLM
      // call por diseño).
      if (c.expectsDegraded) {
        let payload: DegradedPayload | null = null
        try {
          payload = (await res.json()) as DegradedPayload
        } catch {
          result.error = `Turn ${i + 1}: expectsDegraded pero response no era JSON`
          console.log(`   ✗ ${result.error}`)
          return result
        }
        const latencyMs = Date.now() - t0

        if (payload.mode !== 'degraded') {
          result.error = `Turn ${i + 1}: esperaba mode=degraded, recibí ${(payload as { mode?: unknown }).mode ?? 'undefined'}`
          console.log(`   ✗ ${result.error}`)
          return result
        }

        result.turns.push({
          userText,
          assistantText: '',
          toolCalls: [],
          latencyMs,
          degradedPayload: payload,
        })
        // Avanzo la conversation history con el message canned del degraded
        // (para que el siguiente turn vea la "respuesta" del bot si los hubiera).
        conversationHistory.push({ role: 'assistant', content: payload.message })

        console.log(
          `   ✓ Turn ${i + 1} DEGRADED (${latencyMs}ms) — reason=${payload.reason}, ` +
            `whatsapp=${payload.whatsappNumber ?? '∅'}`,
        )

        await sleep(1500)
        continue
      }

      // Drain stream — onFinish corre cuando el stream cierra
      if (res.body) {
        const reader = res.body.getReader()
        // eslint-disable-next-line no-constant-condition
        while (true) {
          const { done } = await reader.read()
          if (done) break
        }
      }
      const latencyMs = Date.now() - t0

      // Esperar a que onFinish persista el message N+1 (i+1 asistentes esperados)
      const assistantMsg = await waitForAssistantMessage(sessionId, i + 1)
      if (!assistantMsg) {
        result.error = `Turn ${i + 1}: timeout esperando persistencia del assistant message`
        console.log(`   ✗ Turn ${i + 1} timeout`)
        return result
      }

      conversationHistory.push({ role: 'assistant', content: assistantMsg.content })
      result.turns.push({
        userText,
        assistantText: assistantMsg.content,
        toolCalls: assistantMsg.toolCalls,
        latencyMs,
      })

      console.log(
        `   ✓ Turn ${i + 1} (${latencyMs}ms) — ${assistantMsg.content.length} chars, ${assistantMsg.toolCalls.length} tools`,
      )

      // Espacio entre turnos — respeta rate limit interno (10/min por sessionId).
      // Para sesiones largas (≥11 turnos), aumentamos a 7s para que los primeros
      // turnos del bucket expiren antes de chocar el cap. 16 turnos × 7s ≈ 112s,
      // y el window es 60s — el bucket nunca tiene más de 9 turnos activos.
      const interTurnDelayMs = c.userTurns.length >= 11 ? 7000 : 2500
      await sleep(interTurnDelayMs)
    }

    // B4.5: cuando expectsDegraded, no hay conversation persistida (el bot
    // no llegó al getOrCreateConversation por el early-return). Skip snapshot.
    if (!c.expectsDegraded) {
      const finalConv = await prisma.conversation.findUnique({
        where: { sessionId },
        include: { lead: true },
      })
      if (finalConv) {
        result.conversationId = finalConv.id
        result.leadCaptured = finalConv.leadCaptured
        if (finalConv.lead) {
          result.leadSnapshot = {
            name: finalConv.lead.name,
            email: finalConv.lead.email,
            phone: finalConv.lead.phone,
            intent: finalConv.lead.intent,
          }
        }
      }
    }
  } catch (e) {
    result.error = e instanceof Error ? e.message : 'unknown error'
    console.log(`   ✗ Error: ${result.error}`)
  } finally {
    // B4.5: teardown SIEMPRE corre, aunque el case haya fallado.
    if (c.teardown) {
      try {
        await c.teardown(hookCtx)
      } catch (e) {
        console.log(`   ⚠ Teardown failed (no aborta runner): ${e instanceof Error ? e.message : 'unknown'}`)
      }
    }
  }

  return result
}

function formatToolCall(tc: ToolCallRecord): string {
  const args = JSON.stringify(tc.args, null, 2)
    .split('\n')
    .map((l) => '    ' + l)
    .join('\n')
  return `**🔧 ${tc.toolName}**\n${args}`
}

function renderMarkdown(captured: CapturedCase[]): string {
  const ts = new Date().toISOString()
  const lines: string[] = []
  lines.push(`# Baseline de regresión — bot Matsu`)
  lines.push('')
  lines.push(`Generado: ${ts}`)
  lines.push(`Run tag: \`${RUN_TAG}\``)
  lines.push(`Bot slug: \`${BOT_SLUG}\``)
  lines.push(`Casos ejecutados: ${captured.length}`)
  lines.push(
    `Errores: ${captured.filter((c) => c.error).length} / ${captured.length}`,
  )
  lines.push('')
  lines.push('Todos los `sessionId` arrancan con `regression-test-` → purga con `npx tsx scripts/regression/purge.ts`.')
  lines.push('')

  // Resumen ejecutivo
  lines.push('## Resumen')
  lines.push('')
  lines.push('| Caso | Turnos | Tools disparadas | Lead | Error |')
  lines.push('|------|--------|------------------|------|-------|')
  for (const c of captured) {
    const tools = c.turns.flatMap((t) => t.toolCalls.map((tc) => tc.toolName))
    const uniqueTools = [...new Set(tools)].join(', ') || '—'
    const lead = c.leadCaptured ? '✓' : '—'
    const err = c.error ? `❌ ${c.error}` : '—'
    lines.push(`| ${c.caseId} | ${c.turns.length}/${c.turns.length || '?'} | ${uniqueTools} | ${lead} | ${err} |`)
  }
  lines.push('')

  // Detalle por caso
  for (const c of captured) {
    lines.push(`---`)
    lines.push('')
    lines.push(`## ${c.name}`)
    lines.push('')
    lines.push(`**Caso:** \`${c.caseId}\``)
    lines.push(`**Session:** \`${c.sessionId}\``)
    lines.push(`**Conversación:** \`${c.conversationId ?? '(sin persistir)'}\``)
    lines.push(`**Validamos:** ${c.rationale}`)
    if (c.error) {
      lines.push('')
      lines.push(`> ⚠️ ERROR: ${c.error}`)
    }
    lines.push('')

    for (let i = 0; i < c.turns.length; i++) {
      const t = c.turns[i]
      lines.push(`### Turno ${i + 1}  ·  ${t.latencyMs}ms`)
      lines.push('')
      lines.push(`👤 **Usuario:**`)
      lines.push('')
      lines.push('> ' + t.userText.split('\n').join('\n> '))
      lines.push('')
      lines.push(`🤖 **Aki (Matsu):**`)
      lines.push('')
      lines.push('> ' + (t.assistantText || '(respuesta vacía)').split('\n').join('\n> '))
      lines.push('')
      if (t.toolCalls.length > 0) {
        for (const tc of t.toolCalls) {
          lines.push(formatToolCall(tc))
          lines.push('')
        }
      }
    }

    if (c.leadCaptured && c.leadSnapshot) {
      lines.push(`📩 **Lead capturado:**`)
      lines.push('')
      lines.push('```json')
      lines.push(JSON.stringify(c.leadSnapshot, null, 2))
      lines.push('```')
      lines.push('')
    }
  }

  return lines.join('\n')
}

async function main(): Promise<void> {
  checkHost()
  await waitForBot()

  // Verificar que el bot existe y está activo + traer org + plan (B4.5 hooks)
  const bot = await prisma.botConfig.findUnique({
    where: { slug: BOT_SLUG },
    select: {
      id: true,
      isActive: true,
      botName: true,
      organization: {
        select: {
          id: true,
          subscription: { select: { plan: { select: { quota: true, key: true } } } },
        },
      },
    },
  })
  if (!bot) {
    console.error(`ABORT: bot "${BOT_SLUG}" no existe. Corré primero seed-matsu.ts.`)
    process.exit(1)
  }
  if (!bot.isActive) {
    console.error(`ABORT: bot "${BOT_SLUG}" está inactivo.`)
    process.exit(1)
  }
  const planQuota = bot.organization.subscription?.plan?.quota ?? 500 // fallback Starter
  const planKey = bot.organization.subscription?.plan?.key ?? 'STARTER (fallback)'
  console.log(
    `✓ Bot encontrado: ${bot.botName} (id ${bot.id}) — activo, plan=${planKey} (quota=${planQuota})`,
  )

  const now = new Date()
  const hookCtx: CaseHookContext = {
    prisma,
    botConfigId: bot.id,
    organizationId: bot.organization.id,
    planQuota,
    year: now.getUTCFullYear(),
    month: now.getUTCMonth() + 1,
  }

  console.log(`\n🚦 Ejecutando ${REGRESSION_CASES.length} casos de regresión...\n`)
  console.log(`Prefijo purgeable: ${SESSION_PREFIX}*`)
  console.log(`Run tag: ${RUN_TAG}`)

  const captured: CapturedCase[] = []
  for (const c of REGRESSION_CASES) {
    captured.push(await runCase(c, hookCtx))
  }

  // Output
  const outDir = join(process.cwd(), 'docs', 'regression')
  await mkdir(outDir, { recursive: true })
  const outPath = join(outDir, `baseline-${RUN_TAG}.md`)
  await writeFile(outPath, renderMarkdown(captured), 'utf8')

  console.log('\n─────────────────────────────────────────────')
  console.log(`  Baseline guardado en:`)
  console.log(`    ${outPath}`)
  console.log('─────────────────────────────────────────────\n')

  const failed = captured.filter((c) => c.error).length
  if (failed > 0) {
    console.log(`⚠️  ${failed}/${captured.length} casos con error. Revisá el output.`)
    process.exit(2)
  }
  console.log(`✓ Todos los casos completaron sin error técnico.`)
}

main()
  .catch((e) => {
    console.error('❌ Runner falló:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
