/**
 * Q1.1 — Corredor de conversaciones doradas.
 *
 * Ejecuta escenarios scripteados (`scenarios/*.json`) contra los bots QA reales
 * (Gemini real, sin mocks) y CAPTURA las respuestas crudas en
 * `results/<timestamp>.json`. NO evalúa: las `expectations` viajan verbatim al
 * output; el scoring es Q1.2.
 *
 * Precondición: dev server QA arriba (`npm run dev:qa`, :3002) + bots QA
 * seedeados (`npm run evals:seed`).
 *
 * Uso:
 *   npx tsx src/modules/chatbot/evals/runner.ts [--pack base|usados|agencia] [--keep]
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { PrismaClient } from '@prisma/client'
import { detectIntent } from '../server/intent/detectIntent'
import { getVerticalPack } from '../server/verticals/registry'
import { postTurn, type ChatMessageInput, type PostTurnResult } from './client'
import { readConversationSnapshot, waitForAssistantMessage } from './capture'
import { purgeEvalRows } from './cleanup'
import {
  DEFAULT_BASE_URL,
  DEFAULT_ORIGIN,
  EVAL_BOT_SLUGS,
  EVAL_PACKS,
  SESSION_PREFIX,
  flagValue,
  guardDevHost,
  hasFlag,
  type EvalPackKey,
} from './shared'
import {
  SCENARIOS_FILE_SCHEMA,
  type CapturedScenario,
  type CapturedTurn,
  type RunResult,
  type Scenario,
} from './types'

const EVALS_DIR = dirname(fileURLToPath(import.meta.url))
/** Gap global mínimo entre POSTs: la ruta limita 30/min por (origin+IP). */
const MIN_GAP_MS = 2_500
const MAX_429_RETRIES = 3

const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))

type BotMeta = { slug: string; botConfigId: string; verticalPack: string; planKey: string; quota: number }

/** Reconstruye offline el intent del server (`detectIntent`). No viaja en el wire. */
function computeOfflineIntent(pack: EvalPackKey, text: string): string | null {
  try {
    return detectIntent(text, getVerticalPack(pack).intents).intent
  } catch {
    return null
  }
}

async function loadScenarios(packs: readonly EvalPackKey[]): Promise<Scenario[]> {
  const all: Scenario[] = []
  for (const pack of packs) {
    const path = join(EVALS_DIR, 'scenarios', `${pack}.json`)
    const raw = await readFile(path, 'utf8')
    const parsed = SCENARIOS_FILE_SCHEMA.parse(JSON.parse(raw))
    for (const s of parsed) {
      if (s.pack !== pack) {
        throw new Error(`Escenario "${s.id}" en ${pack}.json declara pack "${s.pack}".`)
      }
    }
    all.push(...parsed)
  }
  return all
}

/** Verifica (Prisma) que los 3 bots existen, activos y con el pack correcto. */
async function verifyBots(
  prisma: PrismaClient,
  packs: readonly EvalPackKey[],
): Promise<Record<string, BotMeta>> {
  const bots: Record<string, BotMeta> = {}
  for (const pack of packs) {
    const { botSlug } = EVAL_BOT_SLUGS[pack]
    const bot = await prisma.botConfig.findUnique({
      where: { slug: botSlug },
      select: {
        id: true,
        isActive: true,
        verticalPack: true,
        organization: {
          select: { subscription: { select: { plan: { select: { key: true, quota: true } } } } },
        },
      },
    })
    if (!bot) {
      console.error(`[evals] ABORT: bot QA "${botSlug}" no existe. Corré \`npm run evals:seed\`.`)
      process.exit(1)
    }
    if (!bot.isActive) {
      console.error(`[evals] ABORT: bot QA "${botSlug}" está inactivo. Corré \`npm run evals:seed\`.`)
      process.exit(1)
    }
    if (bot.verticalPack !== pack) {
      console.error(
        `[evals] ABORT: bot QA "${botSlug}" tiene verticalPack "${bot.verticalPack}", esperado "${pack}". Corré \`npm run evals:seed\`.`,
      )
      process.exit(1)
    }
    const plan = bot.organization.subscription?.plan
    bots[pack] = {
      slug: botSlug,
      botConfigId: bot.id,
      verticalPack: bot.verticalPack,
      planKey: plan?.key ?? 'FALLBACK',
      quota: plan?.quota ?? 0,
    }
  }
  return bots
}

async function pingServer(baseUrl: string, origin: string, slug: string): Promise<boolean> {
  try {
    const r = await fetch(`${baseUrl}/api/chatbot/${slug}/config`, { headers: { Origin: origin } })
    return r.status < 500
  } catch {
    return false
  }
}

interface RunCtx {
  prisma: PrismaClient
  baseUrl: string
  origin: string
  /** Devuelve una promesa que resuelve cuando pasó el gap mínimo desde el último POST. */
  pace: () => Promise<void>
}

/** POST con pacing global + reintento acotado en 429 (honra Retry-After). */
async function postTurnWithRetry(
  ctx: RunCtx,
  slug: string,
  sessionId: string,
  messages: ChatMessageInput[],
): Promise<PostTurnResult> {
  let attempt = 0
  for (;;) {
    await ctx.pace()
    const r = await postTurn({ baseUrl: ctx.baseUrl, origin: ctx.origin, slug, sessionId, messages })
    if (r.status === 429 && attempt < MAX_429_RETRIES) {
      attempt++
      const backoff = r.retryAfterMs ?? 5_000
      console.log(`   ⟳ 429 — backoff ${Math.round(backoff / 1000)}s (intento ${attempt})`)
      await sleep(backoff)
      continue
    }
    return r
  }
}

async function runScenario(ctx: RunCtx, scenario: Scenario): Promise<CapturedScenario> {
  const { botSlug } = EVAL_BOT_SLUGS[scenario.pack]
  const sessionId = `${SESSION_PREFIX}${scenario.id}-${Date.now()}`
  const messages: ChatMessageInput[] = []
  const turns: CapturedTurn[] = []
  let assistantCount = 0
  let scenarioError: string | null = null

  console.log(`▶  [${scenario.pack}] ${scenario.id}`)

  for (let i = 0; i < scenario.turns.length; i++) {
    const userMessage = scenario.turns[i]
    messages.push({ role: 'user', content: userMessage })

    const res = await postTurnWithRetry(ctx, botSlug, sessionId, messages)

    const intentDetectedOffline = computeOfflineIntent(scenario.pack, userMessage)
    const turn: CapturedTurn = {
      turnIndex: i,
      userMessage,
      httpStatus: res.status,
      contentType: res.contentType,
      latencyMs: res.latencyMs,
      assistantText: '',
      toolCalls: [],
      wireText: res.wireText,
      intentDetectedOffline,
      degraded: res.degraded,
      error: null,
    }

    if (res.degraded) {
      // Sin LLM: no hay assistant message persistido. Avanzamos el historial
      // con el mensaje canned para que el siguiente turno tenga contexto.
      messages.push({ role: 'assistant', content: res.degraded.message })
      turns.push(turn)
      console.log(`   · turno ${i + 1}: DEGRADED (${res.degraded.reason})`)
      continue
    }

    if (res.status !== 200) {
      turn.error = `HTTP ${res.status}: ${JSON.stringify(res.errorBody)}`
      scenarioError = turn.error
      turns.push(turn)
      console.log(`   ✗ turno ${i + 1}: ${turn.error}`)
      break
    }

    assistantCount++
    const persisted = await waitForAssistantMessage(ctx.prisma, sessionId, assistantCount)
    if (!persisted) {
      turn.error = 'timeout esperando persistencia del assistant message'
      scenarioError = turn.error
      turns.push(turn)
      console.log(`   ✗ turno ${i + 1}: ${turn.error}`)
      break
    }

    turn.assistantText = persisted.content
    turn.toolCalls = persisted.toolCalls
    messages.push({ role: 'assistant', content: persisted.content })
    turns.push(turn)
    console.log(
      `   ✓ turno ${i + 1} (${res.latencyMs}ms) — ${persisted.content.length} chars, ${persisted.toolCalls.length} tool(s)`,
    )
  }

  const snapshot = await readConversationSnapshot(ctx.prisma, sessionId)

  return {
    id: scenario.id,
    pack: scenario.pack,
    description: scenario.description,
    expectations: scenario.expectations, // verbatim — NO evaluado
    sessionId,
    conversationId: snapshot.conversationId,
    turns,
    leadSnapshot: snapshot.lead,
    error: scenarioError,
  }
}

function makePacer(minGapMs: number): () => Promise<void> {
  let lastAt = 0
  return async () => {
    const wait = lastAt + minGapMs - Date.now()
    if (wait > 0) await sleep(wait)
    lastAt = Date.now()
  }
}

async function main(): Promise<void> {
  const { config: loadEnv } = await import('dotenv')
  loadEnv({ path: '.env.local' })
  loadEnv({ path: '.env' })
  guardDevHost()

  const packArg = flagValue('--pack')
  const keep = hasFlag('--keep')
  const packs: EvalPackKey[] =
    packArg && (EVAL_PACKS as readonly string[]).includes(packArg)
      ? [packArg as EvalPackKey]
      : [...EVAL_PACKS]
  if (packArg && !packs.includes(packArg as EvalPackKey)) {
    console.error(`[evals] --pack "${packArg}" inválido. Válidos: ${EVAL_PACKS.join(', ')}.`)
    process.exit(1)
  }

  const baseUrl = DEFAULT_BASE_URL
  const origin = DEFAULT_ORIGIN

  const { PrismaClient } = await import('@prisma/client')
  const prisma = new PrismaClient()

  try {
    const scenarios = await loadScenarios(packs)
    const bots = await verifyBots(prisma, packs)

    // Preflight: dev server arriba.
    const probeSlug = bots[packs[0]].slug
    if (!(await pingServer(baseUrl, origin, probeSlug))) {
      console.error(
        `[evals] ABORT: el dev server no responde en ${baseUrl}. Levantá con \`npm run dev:qa\` y reintentá.`,
      )
      process.exit(1)
    }

    console.log(
      `\n🚦 Corredor de evals — ${scenarios.length} escenario(s), packs: ${packs.join(', ')}` +
        `\n   base=${baseUrl}  origin=${origin}  keep=${keep}\n`,
    )

    const startedAt = new Date()
    const ctx: RunCtx = { prisma, baseUrl, origin, pace: makePacer(MIN_GAP_MS) }
    const captured: CapturedScenario[] = []
    for (const scenario of scenarios) {
      captured.push(await runScenario(ctx, scenario))
    }
    const finishedAt = new Date()

    const turnCount = captured.reduce((n, s) => n + s.turns.length, 0)
    const result: RunResult = {
      meta: {
        startedAt: startedAt.toISOString(),
        finishedAt: finishedAt.toISOString(),
        baseUrl,
        origin,
        wallMs: finishedAt.getTime() - startedAt.getTime(),
        scenarioCount: captured.length,
        turnCount,
        keep,
        packsRun: packs,
        bots,
      },
      scenarios: captured,
    }

    const resultsDir = join(EVALS_DIR, 'results')
    await mkdir(resultsDir, { recursive: true })
    const stamp = startedAt.toISOString().replace(/[:.]/g, '-')
    const outPath = join(resultsDir, `${stamp}.json`)
    await writeFile(outPath, JSON.stringify(result, null, 2), 'utf8')

    const withError = captured.filter((s) => s.error).length
    console.log('\n─────────────────────────────────────────────')
    console.log(`  Capturados: ${captured.length} escenarios / ${turnCount} turnos`)
    console.log(`  Con error técnico: ${withError}/${captured.length}`)
    console.log(`  Wall clock: ${(result.meta.wallMs / 1000).toFixed(1)}s`)
    console.log(`  Resultado: ${outPath}`)
    console.log('─────────────────────────────────────────────')

    if (keep) {
      console.log('\n[evals] --keep: no se limpia (filas evals- quedan para inspección).')
    } else {
      const purge = await purgeEvalRows(prisma, { resetQuota: true })
      console.log(
        `\n[evals] Cleanup: ${purge.conversations} conversation(s), ${purge.leads} lead(s), ` +
          `${purge.events} event(s) borrados; QuotaUsage reset (${purge.quotaRowsDeleted} fila/s).`,
      )
    }
  } finally {
    await prisma.$disconnect()
  }
}

main().catch(async (e) => {
  console.error('❌ Corredor falló:', e)
  process.exit(1)
})
