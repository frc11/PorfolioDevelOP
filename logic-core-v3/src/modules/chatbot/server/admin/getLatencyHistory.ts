import { unsafeGlobalQuery } from '@/lib/isolation'

export interface LatencyPoint {
  hour: string
  p50: number | null
  p95: number | null
  count: number
}

export type LatencyHistoryStatus = 'ok' | 'insufficient' | 'empty'

export interface LatencyHistoryResult {
  status: LatencyHistoryStatus
  data: LatencyPoint[]
  totalSamples: number
  minSamplesNeeded: number
  hoursWithData: number
  p50Overall: number | null
  p95Overall: number | null
}

const MIN_SAMPLES_FOR_CHART = 10

function bucketKey(d: Date): string {
  return d.toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    hour12: false,
  })
}

function emptyBuckets(hoursBack: number): Map<string, number[]> {
  const byHour = new Map<string, number[]>()
  for (let i = hoursBack - 1; i >= 0; i--) {
    const d = new Date()
    d.setHours(d.getHours() - i, 0, 0, 0)
    byHour.set(bucketKey(d), [])
  }
  return byHour
}

function emptySeries(hoursBack: number): LatencyPoint[] {
  return Array.from(emptyBuckets(hoursBack).keys()).map((hour) => ({
    hour,
    p50: null,
    p95: null,
    count: 0,
  }))
}

function percentile(sortedAsc: number[], p: number): number {
  if (sortedAsc.length === 0) return 0
  const idx = Math.min(sortedAsc.length - 1, Math.floor(sortedAsc.length * p))
  return sortedAsc[idx]
}

/**
 * Returns hourly P50/P95 latency from REAL ChatbotEvent data only.
 * If there are not enough samples, returns status="insufficient" or "empty"
 * with an empty (zero-filled) series. Never fabricates data.
 */
export async function getLatencyHistory(
  hoursBack: number = 24
): Promise<LatencyHistoryResult> {
  const since = new Date(Date.now() - hoursBack * 60 * 60 * 1000)

  // PENDIENTE-DECISIÓN: agrega latencia (chat.message_completed) de TODAS las
  // orgs, pero su única página (/admin/chatbot/health) está enmarcada como el
  // health del bot propio de develOP (el verdict corre sobre checkChatbotHealth
  // ('develop')). O se scopea al bot 'develop' o se re-enmarca como SLO de
  // plataforma. Queda global explícito hasta que planificación decida. Ver B0-S3.
  const events = await unsafeGlobalQuery(
    'PENDIENTE-DECISIÓN: latencia P50/P95 agrega eventos de todas las orgs en una página enmarcada como el health del bot develOP — scopear o re-enmarcar (ver B0-S3)',
    (c) =>
      c.chatbotEvent.findMany({
        where: {
          createdAt: { gte: since },
          type: 'chat.message_completed',
        },
        select: { createdAt: true, metadata: true },
        take: 2000,
      }),
  )

  const byHour = emptyBuckets(hoursBack)
  const allSamples: number[] = []

  for (const event of events) {
    const meta = event.metadata as Record<string, unknown> | null
    const raw =
      typeof meta?.latencyMs === 'number'
        ? meta.latencyMs
        : typeof meta?.durationMs === 'number'
          ? meta.durationMs
          : null
    if (typeof raw !== 'number' || raw <= 0) continue

    const d = new Date(event.createdAt)
    d.setMinutes(0, 0, 0)
    const bucket = byHour.get(bucketKey(d))
    if (bucket) {
      bucket.push(raw)
      allSamples.push(raw)
    }
  }

  const totalSamples = allSamples.length

  const data: LatencyPoint[] = Array.from(byHour.entries()).map(([hour, samples]) => {
    if (samples.length === 0) return { hour, p50: null, p95: null, count: 0 }
    const sorted = [...samples].sort((a, b) => a - b)
    return {
      hour,
      p50: percentile(sorted, 0.5),
      p95: percentile(sorted, 0.95),
      count: samples.length,
    }
  })

  const hoursWithData = data.filter((p) => p.count > 0).length

  let status: LatencyHistoryStatus = 'ok'
  if (totalSamples === 0) status = 'empty'
  else if (totalSamples < MIN_SAMPLES_FOR_CHART) status = 'insufficient'

  let p50Overall: number | null = null
  let p95Overall: number | null = null
  if (totalSamples > 0) {
    const sortedAll = [...allSamples].sort((a, b) => a - b)
    p50Overall = percentile(sortedAll, 0.5)
    p95Overall = percentile(sortedAll, 0.95)
  }

  return {
    status,
    data: status === 'empty' ? emptySeries(hoursBack) : data,
    totalSamples,
    minSamplesNeeded: MIN_SAMPLES_FOR_CHART,
    hoursWithData,
    p50Overall,
    p95Overall,
  }
}
