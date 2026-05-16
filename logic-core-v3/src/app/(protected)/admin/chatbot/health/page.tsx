import { checkChatbotHealth } from '@/modules/chatbot/server/health'

// Disable static optimization — this page must always run fresh checks
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function HealthPage() {
  const health = await checkChatbotHealth('develop')

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-light">Chatbot Health</h1>
          <span
            className={`px-3 py-1.5 rounded-full text-xs font-medium ${
              health.ok ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
            }`}
          >
            {health.ok ? 'ALL SYSTEMS OK' : 'ISSUES DETECTED'}
          </span>
        </div>

        <div className="text-xs text-zinc-500 mb-6 font-mono">
          Checked at: {health.timestamp}
        </div>

        {/* ENV VARS */}
        <Section
          title="Environment Variables"
          ok={health.checks.env.ok}
          errors={health.checks.env.details.errors}
          warnings={health.checks.env.details.warnings}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {health.checks.env.details.vars.map((v) => (
              <div
                key={v.name}
                className="flex items-center gap-2 text-sm py-1.5 px-3 rounded border border-zinc-800 bg-zinc-900/40"
              >
                <span className={v.present ? 'text-emerald-400' : v.required ? 'text-red-400' : 'text-amber-400'}>
                  {v.present ? '✓' : v.required ? '✗' : '⚠'}
                </span>
                <span className="font-mono text-xs">{v.name}</span>
                {!v.present && (
                  <span className="text-[10px] text-zinc-500 ml-auto">
                    {v.required ? 'REQUIRED' : 'optional'}
                  </span>
                )}
              </div>
            ))}
          </div>
        </Section>

        {/* DATABASE */}
        <Section title="Database" ok={health.checks.database.ok} error={health.checks.database.error}>
          {health.checks.database.ok && (
            <div className="text-sm text-zinc-400">
              Latency: <span className="font-mono">{health.checks.database.latencyMs}ms</span>
            </div>
          )}
        </Section>

        {/* LLM PROVIDER */}
        <Section title="LLM Provider" ok={health.checks.llmProvider.ok} error={health.checks.llmProvider.error}>
          {health.checks.llmProvider.ok && (
            <div className="text-sm text-zinc-400 space-y-1">
              <div>
                Provider: <span className="font-mono">{health.checks.llmProvider.provider}</span>
              </div>
              <div>
                Models available: <span className="font-mono">{health.checks.llmProvider.modelsAvailable}</span>
              </div>
            </div>
          )}
        </Section>

        {/* BOT */}
        <Section title="Bot Configuration" ok={health.checks.bot.ok} error={health.checks.bot.error}>
          {health.checks.bot.ok && (
            <div className="text-sm text-zinc-400 space-y-1">
              <div>
                Slug: <span className="font-mono">{health.checks.bot.slug}</span>
              </div>
              <div>
                Name: <span className="font-mono">{health.checks.bot.botName}</span>
              </div>
              <div>
                Active:{' '}
                <span className={health.checks.bot.isActive ? 'text-emerald-400' : 'text-red-400'}>
                  {String(health.checks.bot.isActive)}
                </span>
              </div>
            </div>
          )}
        </Section>

        {!health.ok && (
          <div className="mt-8 p-4 rounded-xl border border-red-500/30 bg-red-500/5">
            <h3 className="text-sm font-medium text-red-300 mb-3">⚠ Action required</h3>
            <ol className="text-sm text-zinc-300 space-y-2 list-decimal list-inside">
              {!health.checks.env.ok && (
                <li>Add missing env vars to <code className="bg-zinc-900 px-1.5 py-0.5 rounded text-xs">.env.local</code> and restart dev server</li>
              )}
              {!health.checks.database.ok && (
                <li>Check DATABASE_URL is correct and Neon DB is accessible</li>
              )}
              {!health.checks.llmProvider.ok && (
                <li>Verify CHATBOT_GOOGLE_API_KEY is valid and Generative Language API is enabled in Google Cloud Console</li>
              )}
              {!health.checks.bot.ok && (
                <li>Run <code className="bg-zinc-900 px-1.5 py-0.5 rounded text-xs">npx tsx src/modules/chatbot/prisma/seed.ts</code> to create the develop bot</li>
              )}
            </ol>
          </div>
        )}
      </div>
    </div>
  )
}

function Section({
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
    <div className="mb-4 p-4 rounded-xl border border-zinc-800 bg-zinc-900/40">
      <div className="flex items-center gap-2 mb-3">
        <span className={ok ? 'text-emerald-400' : 'text-red-400'}>●</span>
        <h2 className="text-sm font-medium">{title}</h2>
      </div>
      {error && <div className="text-xs text-red-300 mb-2 font-mono">{error}</div>}
      {errors && errors.length > 0 && (
        <ul className="text-xs text-red-300 mb-2 space-y-1">
          {errors.map((e, i) => (
            <li key={i} className="font-mono">• {e}</li>
          ))}
        </ul>
      )}
      {warnings && warnings.length > 0 && (
        <ul className="text-xs text-amber-300 mb-2 space-y-1">
          {warnings.map((w, i) => (
            <li key={i} className="font-mono">⚠ {w}</li>
          ))}
        </ul>
      )}
      {children}
    </div>
  )
}
