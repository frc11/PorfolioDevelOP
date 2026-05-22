import { checkChatbotHealth, buildHealthVerdict } from '@/modules/chatbot/server/health'
import type { HealthVerdict, VerdictLevel } from '@/modules/chatbot/server/health'
import { getLatencyHistory } from '@/modules/chatbot/server/admin/getLatencyHistory'
import { LatencyChart } from '@/modules/chatbot/components/admin/health/LatencyChart'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function HealthPage() {
  const [health, latencyHistory] = await Promise.all([
    checkChatbotHealth('develop'),
    getLatencyHistory(24),
  ])

  const verdict = buildHealthVerdict(health, latencyHistory)

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">Inteligencia</p>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-100">Health Score</h1>
        <p className="mt-1 text-sm text-zinc-400">Estado operacional del chatbot develOP</p>
      </div>

      <VerdictHero verdict={verdict} />

      <p className="text-[11px] font-mono text-zinc-600">Checked at: {health.timestamp}</p>

      <LatencyChart history={latencyHistory} />

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

function VerdictHero({ verdict }: { verdict: HealthVerdict }) {
  const styles = verdictStyles(verdict.level)
  return (
    <div className={`rounded-[28px] border p-6 ${styles.container}`}>
      <div className="flex items-start gap-4">
        <div className={`shrink-0 text-4xl ${styles.icon}`} aria-hidden="true">
          {verdictIcon(verdict.level)}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-[10px] uppercase tracking-[0.24em] ${styles.eyebrow}`}>
            Estado general
          </p>
          <h2 className={`mt-0.5 text-3xl font-semibold tracking-tight ${styles.headline}`}>
            {verdict.headline}
          </h2>
          <p className={`mt-1 text-sm ${styles.subline}`}>{verdict.subline}</p>

          {verdict.reasons.length > 0 && (
            <ul className="mt-4 space-y-2">
              {verdict.reasons.map((r, i) => (
                <li
                  key={i}
                  className={`rounded-xl border px-3 py-2 ${reasonStyles(r.level)}`}
                >
                  <p className="text-sm font-medium">
                    <span aria-hidden="true">{reasonIcon(r.level)} </span>
                    {r.title}
                  </p>
                  {r.hint && <p className="mt-0.5 text-xs opacity-80">{r.hint}</p>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

function verdictStyles(level: VerdictLevel) {
  if (level === 'ok') {
    return {
      container: 'border-emerald-400/30 bg-emerald-400/[0.06]',
      icon: 'text-emerald-300',
      eyebrow: 'text-emerald-300/80',
      headline: 'text-emerald-200',
      subline: 'text-emerald-100/80',
    }
  }
  if (level === 'warning') {
    return {
      container: 'border-amber-400/30 bg-amber-400/[0.06]',
      icon: 'text-amber-300',
      eyebrow: 'text-amber-300/80',
      headline: 'text-amber-200',
      subline: 'text-amber-100/80',
    }
  }
  return {
    container: 'border-red-500/30 bg-red-500/[0.06]',
    icon: 'text-red-300',
    eyebrow: 'text-red-300/80',
    headline: 'text-red-200',
    subline: 'text-red-100/80',
  }
}

function reasonStyles(level: VerdictLevel): string {
  if (level === 'critical') return 'border-red-500/30 bg-red-500/[0.08] text-red-100'
  if (level === 'warning') return 'border-amber-400/30 bg-amber-400/[0.08] text-amber-100'
  return 'border-emerald-400/30 bg-emerald-400/[0.08] text-emerald-100'
}

function verdictIcon(level: VerdictLevel): string {
  if (level === 'ok') return '✓'
  if (level === 'warning') return '!'
  return '✕'
}

function reasonIcon(level: VerdictLevel): string {
  if (level === 'critical') return '✕'
  if (level === 'warning') return '!'
  return '✓'
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
