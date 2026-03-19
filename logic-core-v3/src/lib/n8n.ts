// ─── ROI config ───────────────────────────────────────────────────────────────

const MINUTES_SAVED_PER_EXECUTION = 15
const HOURLY_COST_USD = 15
export const ROI_PER_EXECUTION_USD = (MINUTES_SAVED_PER_EXECUTION / 60) * HOURLY_COST_USD // $3.75

// ─── Types ────────────────────────────────────────────────────────────────────

export interface WorkflowMetrics {
  id: string
  name: string
  active: boolean
  totalExecutions: number
  successfulExecutions: number
  failedExecutions: number
  lastExecutionAt: string | null
  lastExecutionStatus: string | null
  roi: number
  dailyExecutions: Array<{ date: string; success: number; failed: number }>
}

export interface N8nMetrics {
  workflows: WorkflowMetrics[]
  totals: {
    executions: number
    successful: number
    failed: number
    successRate: number
    totalRoi: number
  }
  dailyExecutions: Array<{ date: string; success: number; failed: number }>
}

export type N8nResult =
  | { ok: true; data: N8nMetrics }
  | { ok: false; error: string }

// ─── n8n API types (subset) ───────────────────────────────────────────────────

interface N8nWorkflow {
  id: string
  name: string
  active: boolean
}

type ExecutionStatus = 'success' | 'error' | 'crashed' | 'waiting' | 'running' | 'canceled' | 'new' | 'unknown'

interface N8nExecution {
  id: string
  workflowId: string
  status: ExecutionStatus
  startedAt: string | null
  stoppedAt: string | null
  finished: boolean
}

interface N8nExecutionsResponse {
  data: N8nExecution[]
  nextCursor: string | null
}

// ─── Fetch helper ─────────────────────────────────────────────────────────────

async function n8nFetch<T>(path: string): Promise<T> {
  const baseUrl = (process.env.N8N_API_URL ?? '').replace(/\/$/, '')
  const apiKey = process.env.N8N_API_KEY ?? ''

  if (!baseUrl || !apiKey) {
    throw new Error('N8N_API_URL o N8N_API_KEY no están configuradas.')
  }

  const res = await fetch(`${baseUrl}/api/v1${path}`, {
    headers: { 'X-N8N-API-KEY': apiKey },
    cache: 'no-store',
  })

  if (res.status === 401 || res.status === 403) {
    throw new Error('Sin permisos para acceder a n8n. Verificá la API key.')
  }
  if (res.status === 404) {
    throw new Error(`Recurso no encontrado en n8n: ${path}`)
  }
  if (!res.ok) {
    throw new Error(`Error de n8n: ${res.status} ${res.statusText}`)
  }

  return res.json() as Promise<T>
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function startOfCurrentMonth(): string {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
}

function toDateStr(iso: string): string {
  return iso.slice(0, 10) // "YYYY-MM-DD"
}

function buildDailyMap(
  executions: N8nExecution[]
): Array<{ date: string; success: number; failed: number }> {
  const map: Record<string, { success: number; failed: number }> = {}

  for (const ex of executions) {
    const date = toDateStr(ex.startedAt ?? ex.stoppedAt ?? new Date().toISOString())
    if (!map[date]) map[date] = { success: 0, failed: 0 }
    if (ex.status === 'success') {
      map[date].success += 1
    } else if (ex.status === 'error' || ex.status === 'crashed') {
      map[date].failed += 1
    }
  }

  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, counts]) => ({ date, ...counts }))
}

function mergeDailyMaps(
  maps: Array<Array<{ date: string; success: number; failed: number }>>
): Array<{ date: string; success: number; failed: number }> {
  const combined: Record<string, { success: number; failed: number }> = {}

  for (const days of maps) {
    for (const { date, success, failed } of days) {
      if (!combined[date]) combined[date] = { success: 0, failed: 0 }
      combined[date].success += success
      combined[date].failed += failed
    }
  }

  return Object.entries(combined)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, c]) => ({ date, ...c }))
}

// ─── Main function ────────────────────────────────────────────────────────────

export async function getN8nMetrics(workflowIds: string[]): Promise<N8nResult> {
  if (!process.env.N8N_API_URL || !process.env.N8N_API_KEY) {
    return {
      ok: false,
      error: 'Las credenciales de n8n no están configuradas en el servidor. Contactá al equipo de DevelOP.',
    }
  }

  if (workflowIds.length === 0) {
    return {
      ok: false,
      error: 'No hay workflows configurados para este cliente.',
    }
  }

  const since = startOfCurrentMonth()

  try {
    // Fetch all workflows and their executions in parallel
    const results = await Promise.allSettled(
      workflowIds.map(async (id): Promise<WorkflowMetrics> => {
        const [workflow, executionsRes] = await Promise.all([
          n8nFetch<N8nWorkflow>(`/workflows/${id}`),
          n8nFetch<N8nExecutionsResponse>(
            `/executions?workflowId=${id}&status=all&startedAfter=${encodeURIComponent(since)}&limit=100`
          ),
        ])

        const executions = executionsRes.data
        const successful = executions.filter((e) => e.status === 'success')
        const failed = executions.filter(
          (e) => e.status === 'error' || e.status === 'crashed'
        )

        // Most recent execution (sorted by startedAt desc)
        const sorted = [...executions].sort((a, b) => {
          const aTime = a.startedAt ?? a.stoppedAt ?? ''
          const bTime = b.startedAt ?? b.stoppedAt ?? ''
          return bTime.localeCompare(aTime)
        })
        const last = sorted[0] ?? null

        return {
          id: workflow.id,
          name: workflow.name,
          active: workflow.active,
          totalExecutions: executions.length,
          successfulExecutions: successful.length,
          failedExecutions: failed.length,
          lastExecutionAt: last?.startedAt ?? last?.stoppedAt ?? null,
          lastExecutionStatus: last?.status ?? null,
          roi: successful.length * ROI_PER_EXECUTION_USD,
          dailyExecutions: buildDailyMap(executions),
        }
      })
    )

    // Separate resolved vs rejected — partial failures are OK
    const workflows: WorkflowMetrics[] = []
    const errors: string[] = []

    for (const result of results) {
      if (result.status === 'fulfilled') {
        workflows.push(result.value)
      } else {
        errors.push(result.reason instanceof Error ? result.reason.message : String(result.reason))
      }
    }

    if (workflows.length === 0) {
      return {
        ok: false,
        error: errors[0] ?? 'No se pudieron cargar los workflows de n8n.',
      }
    }

    // Aggregate totals
    const totalExec = workflows.reduce((s, w) => s + w.totalExecutions, 0)
    const totalSuccess = workflows.reduce((s, w) => s + w.successfulExecutions, 0)
    const totalFailed = workflows.reduce((s, w) => s + w.failedExecutions, 0)
    const successRate = totalExec > 0 ? Math.round((totalSuccess / totalExec) * 100) : 0
    const totalRoi = workflows.reduce((s, w) => s + w.roi, 0)

    return {
      ok: true,
      data: {
        workflows,
        totals: {
          executions: totalExec,
          successful: totalSuccess,
          failed: totalFailed,
          successRate,
          totalRoi: Math.round(totalRoi * 100) / 100,
        },
        dailyExecutions: mergeDailyMaps(workflows.map((w) => w.dailyExecutions)),
      },
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)

    if (msg.includes('N8N_API_URL') || msg.includes('N8N_API_KEY')) {
      return { ok: false, error: msg }
    }
    if (msg.includes('ECONNREFUSED') || msg.includes('ENOTFOUND') || msg.includes('fetch')) {
      return {
        ok: false,
        error: 'No se pudo conectar con el servidor de automatizaciones. Verificá que n8n esté activo.',
      }
    }

    return {
      ok: false,
      error: 'No se pudieron cargar las métricas de automatizaciones. Intentá de nuevo más tarde.',
    }
  }
}
