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
    ? `Pasaste los ${topeDiarioDms} de hoy. Podés seguir, vos decidís — pero el canal se cuida espaciando. El tope de hoy no es para siempre: sube a medida que la cuenta acumula historial.`
    : cerca
      ? `Te estás acercando a los ${topeDiarioDms} de hoy. Dosificá lo que queda — el número es bajo a propósito, para que la cuenta crezca sin restricciones.`
      : `Hoy arrancás con hasta ${ritmoPorHora} por hora y ${topeDiarioDms} en el día. No es el techo de siempre — es el punto de partida de una cuenta nueva, y crece con ella. Pocos mensajes bien apuntados rinden más que muchos genéricos.`

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
