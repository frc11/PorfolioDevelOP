import { checkChatbotHealth } from '@/modules/chatbot/server/health'
import { getLatencyHistory } from '@/modules/chatbot/server/admin/getLatencyHistory'
import { LatencyChart } from '@/modules/chatbot/components/admin/health/LatencyChart'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function HealthPage() {
  const [health, latencyData] = await Promise.all([
    checkChatbotHealth('develop'),
    getLatencyHistory(24),
  ])

  const isMockLatency = latencyData.every((p) => p.count > 0)

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">Inteligencia</p>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-100">Health Score</h1>
          <p className="mt-1 text-sm text-zinc-400">Estado operacional del chatbot develOP</p>
        </div>
        <span
          className={`mt-1 shrink-0 rounded-full px-3 py-1.5 text-xs font-medium ${
            health.ok
              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-400/30'
              : 'bg-red-500/15 text-red-300 border border-red-400/30'
          }`}
        >
          {health.ok ? 'ALL SYSTEMS OK' : 'ISSUES DETECTED'}
        </span>
      </div>

      <p className="text-[11px] font-mono text-zinc-600">Checked at: {health.timestamp}</p>

      <LatencyChart data={latencyData} isMock={isMockLatency} />

      <div className="space-y-3">
        <HealthSection
          title="Variables de entorno"
          ok={health.checks.env.ok}
          errors={health.checks.env.details.errors}
          warnings={health.checks.env.details.warnings}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
            {health.checks.env.details.vars.map((v) => (
              <div
                key={v.name}
                className="flex items-center gap-2 rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2 text-sm"
              >
                <span
                  className={
                    v.present ? 'text-emerald-400' : v.required ? 'text-red-400' : 'text-amber-400'
                  }
                >
                  {v.present ? '✓' : v.required ? '✗' : '⚠'}
                </span>
                <span className="font-mono text-xs text-zinc-300">{v.name}</span>
                {!v.present && (
                  <span className="ml-auto text-[10px] text-zinc-600">
                    {v.required ? 'REQUIRED' : 'optional'}
                  </span>
                )}
              </div>
            ))}
          </div>
        </HealthSection>

        <HealthSection
          title="Base de datos"
          ok={health.checks.database.ok}
          error={health.checks.database.error}
        >
          {health.checks.database.ok && (
            <p className="text-sm text-zinc-400 mt-2">
              Latencia:{' '}
              <span className="font-mono text-zinc-200">{health.checks.database.latencyMs}ms</span>
            </p>
          )}
        </HealthSection>

        <HealthSection
          title="LLM Provider"
          ok={health.checks.llmProvider.ok}
          error={health.checks.llmProvider.error}
        >
          {health.checks.llmProvider.ok && (
            <div className="mt-2 space-y-1 text-sm text-zinc-400">
              <p>
                Provider:{' '}
                <span className="font-mono text-zinc-200">{health.checks.llmProvider.provider}</span>
              </p>
              <p>
                Modelos disponibles:{' '}
                <span className="font-mono text-zinc-200">
                  {health.checks.llmProvider.modelsAvailable}
                </span>
              </p>
            </div>
          )}
        </HealthSection>

        <HealthSection
          title="Configuración del bot"
          ok={health.checks.bot.ok}
          error={health.checks.bot.error}
        >
          {health.checks.bot.ok && (
            <div className="mt-2 space-y-1 text-sm text-zinc-400">
              <p>
                Slug: <span className="font-mono text-zinc-200">{health.checks.bot.slug}</span>
              </p>
              <p>
                Nombre:{' '}
                <span className="font-mono text-zinc-200">{health.checks.bot.botName}</span>
              </p>
              <p>
                Activo:{' '}
                <span
                  className={
                    health.checks.bot.isActive ? 'text-emerald-400' : 'text-red-400'
                  }
                >
                  {String(health.checks.bot.isActive)}
                </span>
              </p>
            </div>
          )}
        </HealthSection>
      </div>

      {!health.ok && (
        <div className="rounded-[28px] border border-red-500/20 bg-red-500/[0.04] p-5">
          <h3 className="mb-3 text-sm font-medium text-red-300">⚠ Acción requerida</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-zinc-300">
            {!health.checks.env.ok && (
              <li>
                Agregar las variables de entorno faltantes a{' '}
                <code className="rounded bg-zinc-900 px-1.5 py-0.5 text-xs">.env.local</code> y
                reiniciar el servidor
              </li>
            )}
            {!health.checks.database.ok && (
              <li>Verificar que DATABASE_URL sea correcto y Neon DB esté accesible</li>
            )}
            {!health.checks.llmProvider.ok && (
              <li>
                Verificar que CHATBOT_GOOGLE_API_KEY sea válida y la Generative Language API esté
                habilitada en Google Cloud Console
              </li>
            )}
            {!health.checks.bot.ok && (
              <li>
                Ejecutar{' '}
                <code className="rounded bg-zinc-900 px-1.5 py-0.5 text-xs">
                  npx tsx src/modules/chatbot/prisma/seed.ts
                </code>{' '}
                para crear el bot develop
              </li>
            )}
          </ol>
        </div>
      )}
    </div>
  )
}

function HealthSection({
  title,
  ok,
  error,
  errors,
  warnings,
  children,
}: {
  title: string
  ok: boolean
  error?: string
  errors?: string[]
  warnings?: string[]
  children?: React.ReactNode
}) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/[0.02] p-5">
      <div className="flex items-center gap-2">
        <span className={ok ? 'text-emerald-400' : 'text-red-400'}>●</span>
        <h2 className="text-sm font-medium text-zinc-200">{title}</h2>
      </div>
      {error && <p className="mt-2 text-xs font-mono text-red-300">{error}</p>}
      {errors && errors.length > 0 && (
        <ul className="mt-2 space-y-1">
          {errors.map((e, i) => (
            <li key={i} className="text-xs font-mono text-red-300">
              • {e}
            </li>
          ))}
        </ul>
      )}
      {warnings && warnings.length > 0 && (
        <ul className="mt-2 space-y-1">
          {warnings.map((w, i) => (
            <li key={i} className="text-xs font-mono text-amber-300">
              ⚠ {w}
            </li>
          ))}
        </ul>
      )}
      {children}
    </div>
  )
}
