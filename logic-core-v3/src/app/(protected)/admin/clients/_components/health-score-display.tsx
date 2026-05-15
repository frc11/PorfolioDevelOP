type HealthFactor = {
  label: string
  impact: number
}

type HealthScoreDisplayProps = {
  score: number
  factors?: HealthFactor[]
}

function getHealthVisual(score: number) {
  if (score > 70) {
    return {
      tone: 'text-emerald-300',
      track: '#34d399',
      glow: 'shadow-[0_0_32px_rgba(52,211,153,0.2)]',
      label: 'Salud alta',
    }
  }

  if (score > 40) {
    return {
      tone: 'text-amber-300',
      track: '#f59e0b',
      glow: 'shadow-[0_0_32px_rgba(245,158,11,0.18)]',
      label: 'Atencion media',
    }
  }

  return {
    tone: 'text-rose-300',
    track: '#f43f5e',
    glow: 'shadow-[0_0_32px_rgba(244,63,94,0.2)]',
    label: 'Riesgo alto',
  }
}

function factorTone(impact: number) {
  if (impact > 0) {
    return 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200'
  }

  if (impact < 0) {
    return 'border-rose-400/20 bg-rose-500/10 text-rose-200'
  }

  return 'border-white/10 bg-black/20 text-zinc-300'
}

export function HealthScoreDisplay({
  score,
  factors = [],
}: HealthScoreDisplayProps) {
  const progress = Math.max(0, Math.min(100, score))
  const health = getHealthVisual(progress)

  return (
    <div className="rounded-[28px] border border-white/10 bg-black/20 p-5 shadow-[0_20px_45px_rgba(0,0,0,0.24)] backdrop-blur-xl">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
        <div
          className={[
            'relative flex h-32 w-32 shrink-0 items-center justify-center rounded-full border border-white/10 bg-black/30',
            health.glow,
          ].join(' ')}
          style={{
            background: `conic-gradient(${health.track} ${progress * 3.6}deg, rgba(255,255,255,0.08) 0deg)`,
          }}
        >
          <div className="flex h-[104px] w-[104px] flex-col items-center justify-center rounded-full border border-white/10 bg-[#05070a]/95">
            <span className={['text-3xl font-semibold', health.tone].join(' ')}>
              {progress}
            </span>
            <span className="mt-1 text-[10px] uppercase tracking-[0.24em] text-zinc-500">
              de 100
            </span>
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">
            Health score
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h3 className="text-2xl font-semibold tracking-tight text-white">
              Estado operativo del cliente
            </h3>
            <span
              className={[
                'inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium',
                factorTone(score > 70 ? 1 : score > 40 ? 0 : -1),
              ].join(' ')}
            >
              {health.label}
            </span>
          </div>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
            Puntaje consolidado entre suscripcion, uso reciente, tickets abiertos,
            mensajes pendientes y proyectos activos.
          </p>

          {factors.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {factors.map((factor) => (
                <span
                  key={`${factor.label}-${factor.impact}`}
                  className={[
                    'inline-flex rounded-full border px-3 py-1.5 text-xs font-medium',
                    factorTone(factor.impact),
                  ].join(' ')}
                >
                  {factor.impact > 0 ? `+${factor.impact}` : factor.impact} {factor.label}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
