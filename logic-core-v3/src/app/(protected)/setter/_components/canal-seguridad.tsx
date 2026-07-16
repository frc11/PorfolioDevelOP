import { Gauge } from 'lucide-react'
import { CANAL_INSTAGRAM } from '@/lib/leados/flow'

/**
 * B6 — Capa de seguridad de canal: INFORMATIVA por decisión registrada.
 * Muestra el conteo de DMs del día contra los parámetros del research
 * (CANAL_INSTAGRAM en flow.ts — Franco los ajusta editando solo esa
 * constante) y avisa al acercarse/pasar el tope, pero NUNCA bloquea:
 * el setter está capacitado y decide.
 */
export function CanalSeguridad({ dmsHoy }: { dmsHoy: number }) {
  const { topeDiarioDms, avisoDesdeDms, ritmoPorHora, warmUp, disciplina } =
    CANAL_INSTAGRAM
  const pasado = dmsHoy >= topeDiarioDms
  const cerca = !pasado && dmsHoy >= avisoDesdeDms

  const tono = pasado
    ? 'border-rose-400/25 bg-rose-500/[0.05] text-rose-300'
    : cerca
      ? 'border-amber-400/25 bg-amber-500/[0.05] text-amber-300'
      : 'border-white/[0.08] bg-white/[0.02] text-zinc-400'

  const aviso = pasado
    ? `Pasaste el tope diario recomendado (${topeDiarioDms}). Podés seguir — vos decidís — pero el canal se cuida espaciando.`
    : cerca
      ? `Te estás acercando al tope diario recomendado (${topeDiarioDms}). Dosificá lo que queda del día.`
      : `Ritmo recomendado: hasta ${ritmoPorHora} por hora, máximo ${topeDiarioDms} por día.`

  return (
    <div className={`rounded-2xl border p-4 ${tono}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Gauge size={15} strokeWidth={1.5} />
          <p className="text-xs font-semibold">Canal Instagram — hoy</p>
        </div>
        <p className="text-xs font-semibold tabular-nums">
          {dmsHoy} / {topeDiarioDms} DMs
        </p>
      </div>
      <p className="mt-1.5 text-xs leading-relaxed opacity-90">{aviso}</p>

      <details className="mt-2">
        <summary className="cursor-pointer text-[11px] font-medium text-zinc-500 hover:text-zinc-300">
          Disciplina de canal y ritmo de arranque
        </summary>
        <ul className="mt-2 space-y-1 text-[11px] leading-relaxed text-zinc-500">
          {disciplina.map((linea) => (
            <li key={linea}>• {linea}</li>
          ))}
          {warmUp.map((linea) => (
            <li key={linea}>• {linea}</li>
          ))}
        </ul>
      </details>
    </div>
  )
}
