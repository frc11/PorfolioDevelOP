/**
 * Seed de alertas de prueba — lane intel-alertas.
 *
 * Puebla `BotAlert` con ~14 alertas variadas (severity × status × type) para
 * poder ver en `/admin/alerts`:
 *   - Las 4 stat cards ("Críticas pendientes", "Totales pendientes",
 *     "Resueltas esta semana", "Tiempo prom. resolución").
 *   - El kanban de triage (PENDING / ACKNOWLEDGED / RESOLVED).
 *   - Los filtros de severidad (Crítica / Alta / Warning / Info).
 *
 * Idempotente: borra SOLO sus propias filas (metadata._seed === 'intel-alertas')
 * antes de recrearlas. Nunca toca alertas reales — las del cron no llevan ese marker.
 *
 * Run:
 *   npx ts-node --transpile-only scripts/dev/seed-alerts.ts
 *
 * Cleanup / revertir (borra las seed y NO recrea):
 *   npx ts-node --transpile-only scripts/dev/seed-alerts.ts --cleanup
 *
 * Safety:
 *   - Verifica el host de Neon dev antes de tocar nada (fail-closed).
 *   - deleteMany SIEMPRE con where estricto sobre metadata._seed — jamás sin filtro.
 */

import { config as loadEnv } from 'dotenv'
import {
  PrismaClient,
  Prisma,
  BotAlertType,
  BotAlertSeverity,
  BotAlertStatus,
} from '@prisma/client'

// El proyecto guarda DATABASE_URL en .env.local (convención Next), que
// `dotenv/config` no lee. Cargamos .env.local explícitamente y, como fallback,
// .env (sin pisar variables ya definidas). Debe correr antes de `new PrismaClient()`.
loadEnv({ path: '.env.local' })
loadEnv()

const prisma = new PrismaClient()

const SEED_MARKER = 'intel-alertas'
const BOT_SLUG = 'develop'
const EXPECTED_DEV_HOST = 'ep-quiet-waterfall-acv0fpll-pooler.sa-east-1.aws.neon.tech'

const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

interface AlertSpec {
  type: BotAlertType
  severity: BotAlertSeverity
  status: BotAlertStatus
  title: string
  description: string
  /** Antigüedad de createdAt, en ms hacia el pasado. */
  createdAgoMs: number
  /** Si está presente → acknowledgedAt = now - este offset (y acknowledgedBy = actor). */
  acknowledgedAgoMs?: number
  /** Si está presente → resolvedAt = now - este offset (y resolvedBy = actor). */
  resolvedAgoMs?: number
  metadata: Prisma.JsonObject
}

// ── Especificación de las alertas seed ───────────────────────────────────────
// CRITICAL ×4 · HIGH ×5 · WARNING ×3 · INFO ×2  (cada severidad ≥2 → todos los
// filtros muestran algo). 6 PENDING (2 CRITICAL), 3 ACKNOWLEDGED, 5 RESOLVED
// (todas resueltas dentro de los últimos 7 días → llenan "Resueltas esta semana"
// y dan un "Tiempo prom. resolución" realista).
const SPECS: AlertSpec[] = [
  // ── PENDING (6) ─────────────────────────────────────────────────────────
  {
    type: BotAlertType.QUOTA_EXHAUSTED,
    severity: BotAlertSeverity.CRITICAL,
    status: BotAlertStatus.PENDING,
    title: 'Cuota mensual agotada',
    description: 'El bot consumió el 100% de su cuota mensual de mensajes. Las nuevas conversaciones serán rechazadas hasta el próximo ciclo.',
    createdAgoMs: 30 * MINUTE,
    metadata: { quotaUsedPct: 100, monthlyQuota: 1000 },
  },
  {
    type: BotAlertType.LLM_PROVIDER_ERROR,
    severity: BotAlertSeverity.CRITICAL,
    status: BotAlertStatus.PENDING,
    title: 'Errores del proveedor LLM',
    description: 'Tasa de error elevada en las respuestas del modelo en los últimos 15 minutos. El bot puede estar respondiendo con fallbacks.',
    createdAgoMs: 1 * HOUR,
    metadata: { errorRatePct: 38, windowMin: 15, provider: 'google' },
  },
  {
    type: BotAlertType.BOT_INACTIVE_WITH_TRAFFIC,
    severity: BotAlertSeverity.HIGH,
    status: BotAlertStatus.PENDING,
    title: 'Bot inactivo con tráfico',
    description: 'El widget recibió visitas en las últimas horas pero el bot está desactivado. Se están perdiendo conversaciones.',
    createdAgoMs: 2 * HOUR,
    metadata: { visits: 47, windowHours: 6 },
  },
  {
    type: BotAlertType.LATENCY_DEGRADED,
    severity: BotAlertSeverity.HIGH,
    status: BotAlertStatus.PENDING,
    title: 'Latencia degradada',
    description: 'El tiempo de respuesta promedio superó el umbral aceptable (p95 > 4s) de forma sostenida.',
    createdAgoMs: 3 * HOUR,
    metadata: { p95Ms: 4380, thresholdMs: 4000 },
  },
  {
    type: BotAlertType.DOMAIN_NOT_AUTHORIZED_SPIKE,
    severity: BotAlertSeverity.WARNING,
    status: BotAlertStatus.PENDING,
    title: 'Cargas desde dominios no autorizados',
    description: 'Múltiples cargas del widget desde dominios fuera de la allowlist. Revisar si es uso legítimo o scraping.',
    createdAgoMs: 5 * HOUR,
    metadata: { unauthorizedHits: 23, distinctDomains: 4 },
  },
  {
    type: BotAlertType.CLIENT_NO_ACTIVITY,
    severity: BotAlertSeverity.INFO,
    status: BotAlertStatus.PENDING,
    title: 'Cliente sin actividad reciente',
    description: 'Sin conversaciones registradas en los últimos 7 días. Posible candidato a seguimiento comercial.',
    createdAgoMs: 8 * HOUR,
    metadata: { daysInactive: 7 },
  },

  // ── ACKNOWLEDGED (3) ──────────────────────────────────────────────────────
  {
    type: BotAlertType.LEAD_CAPTURE_FAILURE,
    severity: BotAlertSeverity.CRITICAL,
    status: BotAlertStatus.ACKNOWLEDGED,
    title: 'Fallo en captura de leads',
    description: 'Errores al persistir leads capturados por el bot. Algunos contactos pueden no haberse guardado.',
    createdAgoMs: 1 * DAY,
    acknowledgedAgoMs: 20 * HOUR,
    metadata: { failedCaptures: 6 },
  },
  {
    type: BotAlertType.ACTIVITY_ERRORS_SPIKE,
    severity: BotAlertSeverity.HIGH,
    status: BotAlertStatus.ACKNOWLEDGED,
    title: 'Pico de errores de actividad',
    description: 'Aumento anómalo de errores en el feed de actividad del bot respecto a la línea base.',
    createdAgoMs: 1 * DAY + 4 * HOUR,
    acknowledgedAgoMs: 22 * HOUR,
    metadata: { errorCount: 14, baseline: 2 },
  },
  {
    type: BotAlertType.LATENCY_DEGRADED,
    severity: BotAlertSeverity.WARNING,
    status: BotAlertStatus.ACKNOWLEDGED,
    title: 'Latencia por encima de lo normal',
    description: 'La latencia media subió respecto a la semana pasada, todavía dentro de rango tolerable.',
    createdAgoMs: 1 * DAY + 8 * HOUR,
    acknowledgedAgoMs: 1 * DAY,
    metadata: { p95Ms: 3200, thresholdMs: 4000 },
  },

  // ── RESOLVED (5) — resolvedAt dentro de los últimos 7 días ─────────────────
  {
    type: BotAlertType.QUOTA_EXHAUSTED,
    severity: BotAlertSeverity.HIGH,
    status: BotAlertStatus.RESOLVED,
    title: 'Cuota cerca del límite',
    description: 'El bot superó el 90% de su cuota mensual. Se amplió el cupo y se normalizó.',
    createdAgoMs: 1 * DAY + 45 * MINUTE,
    acknowledgedAgoMs: 1 * DAY + 25 * MINUTE,
    resolvedAgoMs: 1 * DAY,
    metadata: { quotaUsedPct: 92 },
  },
  {
    type: BotAlertType.CRON_INSIGHTS_FAILED,
    severity: BotAlertSeverity.WARNING,
    status: BotAlertStatus.RESOLVED,
    title: 'Falló el cron de insights',
    description: 'La generación nocturna de insights no completó. Se re-ejecutó manualmente con éxito.',
    createdAgoMs: 2 * DAY + 70 * MINUTE,
    resolvedAgoMs: 2 * DAY,
    metadata: { job: 'cron-insights', retried: true },
  },
  {
    type: BotAlertType.LLM_PROVIDER_ERROR,
    severity: BotAlertSeverity.CRITICAL,
    status: BotAlertStatus.RESOLVED,
    title: 'Caída transitoria del proveedor LLM',
    description: 'El proveedor devolvió 5xx durante unos minutos. Se recuperó solo y se confirmó normalización.',
    createdAgoMs: 3 * DAY + 2 * HOUR,
    acknowledgedAgoMs: 3 * DAY + 90 * MINUTE,
    resolvedAgoMs: 3 * DAY,
    metadata: { provider: 'google', httpStatus: 503 },
  },
  {
    type: BotAlertType.CLIENT_NO_ACTIVITY,
    severity: BotAlertSeverity.INFO,
    status: BotAlertStatus.RESOLVED,
    title: 'Reactivación de cliente',
    description: 'El cliente había quedado sin actividad; retomó conversaciones tras el seguimiento.',
    createdAgoMs: 4 * DAY + 25 * MINUTE,
    resolvedAgoMs: 4 * DAY,
    metadata: { daysInactive: 9 },
  },
  {
    type: BotAlertType.BOT_INACTIVE_WITH_TRAFFIC,
    severity: BotAlertSeverity.HIGH,
    status: BotAlertStatus.RESOLVED,
    title: 'Bot reactivado',
    description: 'El bot estaba desactivado con tráfico entrante. Se reactivó y se restableció el servicio.',
    createdAgoMs: 5 * DAY + 210 * MINUTE,
    resolvedAgoMs: 5 * DAY,
    metadata: { visits: 31 },
  },
]

function checkHost(): void {
  const url = process.env.DATABASE_URL ?? ''
  const host = url.match(/@([^/]+)/)?.[1] ?? '(unknown)'
  if (host !== EXPECTED_DEV_HOST) {
    console.error(`ABORT: DATABASE_URL host "${host}" no coincide con dev (${EXPECTED_DEV_HOST}).`)
    console.error(
      url
        ? 'El host actual no es el dev esperado. Si rotaste la rama de Neon, actualizá EXPECTED_DEV_HOST.'
        : 'DATABASE_URL no está seteada. ¿Existe .env.local en logic-core-v3/?',
    )
    process.exit(1)
  }
  console.log(`✓ Host dev confirmado: ${host}`)
}

function toCreateInput(
  spec: AlertSpec,
  botConfigId: string,
  actorId: string,
  nowMs: number,
): Prisma.BotAlertCreateManyInput {
  const acknowledgedAt =
    spec.acknowledgedAgoMs != null ? new Date(nowMs - spec.acknowledgedAgoMs) : null
  const resolvedAt = spec.resolvedAgoMs != null ? new Date(nowMs - spec.resolvedAgoMs) : null

  return {
    botConfigId,
    type: spec.type,
    severity: spec.severity,
    status: spec.status,
    title: spec.title,
    description: spec.description,
    metadata: { ...spec.metadata, _seed: SEED_MARKER },
    createdAt: new Date(nowMs - spec.createdAgoMs),
    acknowledgedAt,
    acknowledgedBy: acknowledgedAt ? actorId : null,
    resolvedAt,
    resolvedBy: resolvedAt ? actorId : null,
  }
}

function printSummary(specs: AlertSpec[]): void {
  const byStatus = new Map<BotAlertStatus, number>()
  const bySeverity = new Map<BotAlertSeverity, number>()
  for (const s of specs) {
    byStatus.set(s.status, (byStatus.get(s.status) ?? 0) + 1)
    bySeverity.set(s.severity, (bySeverity.get(s.severity) ?? 0) + 1)
  }
  console.log('\n  Por status:')
  for (const [k, v] of byStatus) console.log(`    ${k.padEnd(13)} ${v}`)
  console.log('  Por severidad:')
  for (const [k, v] of bySeverity) console.log(`    ${k.padEnd(13)} ${v}`)
}

async function main(): Promise<void> {
  const cleanupOnly = process.argv.includes('--cleanup')

  checkHost()
  console.log(`\n🌱 Seed de alertas (marker _seed='${SEED_MARKER}')${cleanupOnly ? ' — modo CLEANUP' : ''}\n`)

  // Idempotencia / cleanup: borra SOLO las filas marcadas por este seed.
  const deleted = await prisma.botAlert.deleteMany({
    where: { metadata: { path: ['_seed'], equals: SEED_MARKER } },
  })
  console.log(`✓ Limpieza: ${deleted.count} alertas seed previas borradas`)

  if (cleanupOnly) {
    console.log('\n✓ Cleanup completo. No se recreó nada.\n')
    return
  }

  const bot = await prisma.botConfig.findUnique({
    where: { slug: BOT_SLUG },
    select: { id: true, slug: true, botName: true },
  })
  if (!bot) {
    console.error(`ABORT: no existe BotConfig con slug "${BOT_SLUG}".`)
    process.exit(1)
  }
  console.log(`✓ Bot destino: "${bot.botName}" (slug ${bot.slug}, id ${bot.id})`)

  const admin = await prisma.user.findFirst({
    where: { role: 'SUPER_ADMIN' },
    select: { id: true, email: true },
  })
  const actorId = admin?.id ?? `seed:${SEED_MARKER}`
  console.log(
    admin
      ? `✓ Actor (acknowledgedBy/resolvedBy): SUPER_ADMIN ${admin.email}`
      : `⚠ No se encontró SUPER_ADMIN — uso sentinel "${actorId}" (campo es String libre, no FK)`,
  )

  const nowMs = Date.now()
  const rows = SPECS.map((s) => toCreateInput(s, bot.id, actorId, nowMs))
  const created = await prisma.botAlert.createMany({ data: rows })

  console.log(`\n✓ ${created.count} alertas creadas`)
  printSummary(SPECS)
  console.log('\n  Abrí /admin/alerts para verlas. Para revertir:')
  console.log('    npx ts-node --transpile-only scripts/dev/seed-alerts.ts --cleanup\n')
}

main()
  .catch((e) => {
    console.error('❌ Seed de alertas falló:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
