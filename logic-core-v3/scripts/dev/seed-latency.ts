/**
 * seed-latency.ts — Lane intel-health
 * --------------------------------------------------------------------------
 * Llena el LatencyChart de /admin/chatbot/health con datos de desarrollo:
 * inserta eventos `chat.message_completed` con `metadata.latencyMs` distribuido
 * en las últimas 24h, para que el chart muestre curvas P50/P95 y el verdict
 * tenga datos reales (status 'ok', sin disparar 'warning'/'critical').
 *
 * NO toca el schema (latencyMs vive en metadata Json freeform), ni queries.ts,
 * ni el código de health/. Solo INSERTA data.
 *
 * Idempotente: borra primero lo sembrado por este lane (metadata._seed) y
 * vuelve a insertar. Reversible con `--clean` (ver scripts/dev/seed-latency.md).
 *
 * Uso:
 *   npm run seed:latency           # borra lo previo del lane + siembra ~96 eventos
 *   npm run seed:latency -- --clean  # solo limpia (deja la tabla sin la data del lane)
 */
import { config } from 'dotenv'
import { PrismaClient, ChatbotEventLevel, Prisma } from '@prisma/client'

config({ path: '.env.local' })

const SEED_MARKER = 'intel-health'
const EVENT_TYPE = 'chat.message_completed'
const HOURS = 24
// Dos horas con un pico de latencia para que la curva P95 se separe de P50.
const SPIKE_HOURS = new Set<number>([5, 14])

const prisma = new PrismaClient()

const cleanupWhere: Prisma.ChatbotEventWhereInput = {
  metadata: { path: ['_seed'], equals: SEED_MARKER },
}

/**
 * Distribución right-skewed con cap duro en 4499ms. Invariantes garantizadas
 * sin importar el azar: P95 < 5000ms (verdict 'ok') y ningún evento > 12000ms.
 */
function bandLatency(): number {
  const r = Math.random()
  if (r < 0.7) return 600 + Math.floor((r / 0.7) * 600) //            600–1199 (banda P50)
  if (r < 0.88) return 1200 + Math.floor(((r - 0.7) / 0.18) * 800) // 1200–1999
  if (r < 0.96) return 2000 + Math.floor(((r - 0.88) / 0.08) * 1000) // 2000–2999
  if (r < 0.99) return 3000 + Math.floor(((r - 0.96) / 0.03) * 500) //  3000–3499 (cola)
  return 4000 + Math.floor(((r - 0.99) / 0.01) * 499) //               4000–4499 (pico raro)
}

function spikeLatency(): number {
  return 4100 + Math.floor(Math.random() * 400) // 4100–4499
}

function percentile(sortedAsc: number[], p: number): number {
  if (sortedAsc.length === 0) return 0
  return sortedAsc[Math.min(sortedAsc.length - 1, Math.floor(sortedAsc.length * p))]
}

async function main(): Promise<void> {
  const cleanOnly = process.argv.includes('--clean')

  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL no está seteada. Verificá logic-core-v3/.env.local.')
  }

  // Idempotencia / reversibilidad: borrar SOLO lo sembrado por este lane.
  // conversationId queda null en cada evento, así que no hay FKs que ordenar.
  const deleted = await prisma.chatbotEvent.deleteMany({ where: cleanupWhere })
  console.log(`[seed-latency] eventos del lane borrados: ${deleted.count}`)

  if (cleanOnly) {
    console.log('[seed-latency] --clean: listo, no se insertó nada.')
    return
  }

  const bot =
    (await prisma.botConfig.findFirst({ where: { slug: 'develop' } })) ??
    (await prisma.botConfig.findFirst())

  if (!bot) {
    throw new Error(
      'No hay ningún BotConfig en la base. Corré el seed del chatbot antes ' +
        '(ej: ts-node src/modules/chatbot/prisma/seed.ts).',
    )
  }

  const now = Date.now()
  const rows: Prisma.ChatbotEventCreateManyInput[] = []
  const latencies: number[] = []

  for (let h = 0; h < HOURS; h++) {
    const perHour = 3 + (h % 3) // 3, 4 o 5 por hora → ~96 eventos, varias horas pobladas
    for (let i = 0; i < perHour; i++) {
      const forceSpike = SPIKE_HOURS.has(h) && i === 0
      const latencyMs = forceSpike ? spikeLatency() : bandLatency()
      const minute = Math.floor(Math.random() * 60)
      // -30s extra asegura que incluso (h=0, minute=0) quede en el pasado y dentro de 24h.
      const createdAt = new Date(now - h * 3_600_000 - minute * 60_000 - 30_000)

      const metadata = {
        _seed: SEED_MARKER,
        kind: 'dev-latency-seed',
        latencyMs,
      } satisfies Prisma.InputJsonObject

      rows.push({
        botConfigId: bot.id,
        type: EVENT_TYPE,
        level: ChatbotEventLevel.INFO,
        message: `[seed:${SEED_MARKER}] respuesta completada (${latencyMs}ms)`,
        conversationId: null,
        metadata,
        createdAt,
      })
      latencies.push(latencyMs)
    }
  }

  const created = await prisma.chatbotEvent.createMany({ data: rows })

  const sorted = [...latencies].sort((a, b) => a - b)
  console.log(`[seed-latency] bot destino: ${bot.slug} (${bot.id})`)
  console.log(`[seed-latency] eventos insertados: ${created.count}`)
  console.log(
    `[seed-latency] P50≈${percentile(sorted, 0.5)}ms  ` +
      `P95≈${percentile(sorted, 0.95)}ms  ` +
      `max=${sorted[sorted.length - 1]}ms (cap 4499 → verdict 'ok')`,
  )
}

main()
  .catch((e: unknown) => {
    console.error('[seed-latency] ERROR:', e)
    process.exitCode = 1
  })
  .finally(() => {
    void prisma.$disconnect()
  })
