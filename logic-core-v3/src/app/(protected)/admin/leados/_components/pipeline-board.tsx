import Link from 'next/link'
import { AlertTriangle, ChevronRight, LifeBuoy, UserRound } from 'lucide-react'
import { cn } from '@/lib/utils'
import { stageTone, type LeadosTone } from '@/lib/leados-ui'
import { STAGE_LABELS } from '@/lib/leados/flow'
import { formatEspera } from '@/lib/leados/revision'
import {
  totalEnPipeline,
  type Atasco,
  type Escalada,
  type ResumenStage,
} from '@/lib/leados/pipeline'

/**
 * Panorama de PRODUCCIÓN del admin: conteo por etapa + antigüedad (sin
 * movimiento) para leer el pipeline de un vistazo y cazar atascos. Presentación
 * pura (server component) — toda la lógica vive en `@/lib/leados/pipeline`.
 *
 * Disciplina de color B9 (espejo del detalle): el stage es INFORMATIVO (su tono
 * propio, nunca cyan), el ATASCO es atención → ámbar, y RECHAZADA (Franco bochó
 * y el setter no retoma) es problema → rosa. Pills `rounded-full` borde/20 sobre
 * fondo/10: lenguaje propio del admin, no migra al `<Badge>` del dashboard.
 * Clases completas y estáticas para que Tailwind no las purgue.
 */
const STAGE_PILL: Record<LeadosTone, string> = {
  cyan: 'border-cyan-400/20 bg-cyan-400/10 text-cyan-200',
  emerald: 'border-emerald-400/20 bg-emerald-500/10 text-emerald-200',
  amber: 'border-amber-400/20 bg-amber-400/10 text-amber-200',
  rose: 'border-rose-400/20 bg-rose-500/10 text-rose-200',
  violet: 'border-violet-400/20 bg-violet-500/10 text-violet-200',
  blue: 'border-blue-400/20 bg-blue-500/10 text-blue-200',
  zinc: 'border-white/10 bg-black/20 text-zinc-300',
}

type CockpitProps = {
  resumen: ResumenStage[]
  atascos: Atasco[]
  escaladas: Escalada[]
  ahora: Date
}

export function PipelineCockpit({ resumen, atascos, escaladas, ahora }: CockpitProps) {
  const enProduccion = totalEnPipeline(resumen)

  return (
    <section
      aria-labelledby="pipeline-heading"
      className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs tracking-tight text-zinc-400">develOP / LeadOS</p>
          <h2
            id="pipeline-heading"
            className="mt-2 text-3xl font-semibold tracking-tight text-white"
          >
            Pipeline de producción
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
            Dónde están las demos antes de tu revisión y hace cuánto no se
            mueven. La antigüedad es la última señal de actividad del dossier —
            lo que delata un atasco.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-right">
            <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-400">
              En producción
            </p>
            <p className="mt-1 text-xl font-semibold text-white">{enProduccion}</p>
          </div>
          <div
            className={cn(
              'rounded-2xl border px-4 py-3 text-right',
              atascos.length > 0
                ? 'border-amber-400/20 bg-amber-400/10'
                : 'border-white/10 bg-black/20',
            )}
          >
            <p
              className={cn(
                'text-[10px] uppercase tracking-[0.22em]',
                atascos.length > 0 ? 'text-amber-200' : 'text-zinc-400',
              )}
            >
              Atascadas
            </p>
            <p
              className={cn(
                'mt-1 text-xl font-semibold',
                atascos.length > 0 ? 'text-amber-100' : 'text-white',
              )}
            >
              {atascos.length}
            </p>
          </div>
          <div
            className={cn(
              'rounded-2xl border px-4 py-3 text-right',
              escaladas.length > 0
                ? 'border-rose-400/20 bg-rose-500/10'
                : 'border-white/10 bg-black/20',
            )}
          >
            <p
              className={cn(
                'text-[10px] uppercase tracking-[0.22em]',
                escaladas.length > 0 ? 'text-rose-200' : 'text-zinc-400',
              )}
            >
              Escaladas
            </p>
            <p
              className={cn(
                'mt-1 text-xl font-semibold',
                escaladas.length > 0 ? 'text-rose-100' : 'text-white',
              )}
            >
              {escaladas.length}
            </p>
          </div>
        </div>
      </div>

      <PipelineBoard resumen={resumen} ahora={ahora} />
      <EscaladasPanel escaladas={escaladas} ahora={ahora} />
      <AtascosPanel atascos={atascos} ahora={ahora} />
    </section>
  )
}

/**
 * Setters que pidieron ayuda explícita ("me trabé") y siguen en construcción.
 * Más urgente que un atasco por SLA (el setter está bloqueado AHORA, no solo
 * quieto) → rosa + salvavidas, el mismo ícono del botón del setter. Si no hay
 * ninguno no renderiza nada: es una alerta excepcional, no un estado de calma.
 */
function EscaladasPanel({ escaladas, ahora }: { escaladas: Escalada[]; ahora: Date }) {
  if (escaladas.length === 0) return null

  return (
    <div className="space-y-3">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-rose-100">
        <LifeBuoy className="h-4 w-4" strokeWidth={1.5} />
        Setters trabados — {escaladas.length}{' '}
        {escaladas.length === 1 ? 'pidió' : 'pidieron'} ayuda
      </h3>
      <p className="text-xs text-zinc-400">
        Pedido explícito durante la construcción. Más urgente que un atasco por
        tiempo: están bloqueados ahora, esperándote.
      </p>
      <ul className="space-y-2">
        {escaladas.map((escalada) => (
          <li key={escalada.leadId}>
            <Link
              href={`/admin/leados/${escalada.leadId}`}
              className="group relative flex items-start justify-between gap-4 overflow-hidden rounded-2xl border border-rose-400/30 bg-rose-500/[0.06] p-4 transition-colors hover:bg-rose-500/[0.10]"
            >
              <span aria-hidden className="absolute inset-y-0 left-0 w-1 bg-rose-400" />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="truncate text-base font-semibold text-white">
                    {escalada.businessName}
                  </h4>
                  <span className="inline-flex items-center gap-1 rounded-full border border-rose-400/20 bg-rose-500/10 px-2.5 py-1 text-[11px] font-medium text-rose-200">
                    <LifeBuoy className="h-3 w-3" strokeWidth={1.5} />
                    Pidió ayuda
                  </span>
                </div>
                {escalada.escaladoNota ? (
                  <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-zinc-300">
                    “{escalada.escaladoNota}”
                  </p>
                ) : null}
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-zinc-400">
                  <span className="inline-flex items-center gap-1">
                    <UserRound className="h-3 w-3" strokeWidth={1.5} />
                    {escalada.setter}
                  </span>
                  <span>Escaló {formatEspera(escalada.escaladoAt, ahora)}</span>
                </div>
              </div>

              <ChevronRight
                aria-hidden
                className="h-5 w-5 shrink-0 self-center text-zinc-600 transition-colors group-hover:text-rose-200"
                strokeWidth={1.5}
              />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

/**
 * Nombre accesible del carril: el lector de pantalla recibe la relación
 * etiqueta↔conteo en una frase (los fragmentos visuales van `aria-hidden`).
 */
function nodeAriaLabel(stage: ResumenStage, ahora: Date): string {
  const label = STAGE_LABELS[stage.stage]
  if (stage.total === 0) return `${label}: sin demos`
  const plural = stage.total === 1 ? 'demo' : 'demos'
  const viejo = stage.masViejoDesde
    ? `, más viejo ${formatEspera(stage.masViejoDesde, ahora)}`
    : ''
  const atascadas = stage.atascadas > 0
    ? `, ${stage.atascadas} atascada${stage.atascadas === 1 ? '' : 's'}`
    : ''
  return `${label}: ${stage.total} ${plural}${viejo}${atascadas}`
}

function PipelineBoard({ resumen, ahora }: { resumen: ResumenStage[]; ahora: Date }) {
  const vacio = resumen.every((r) => r.total === 0)

  if (vacio) {
    return (
      <p className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-8 text-center text-sm text-zinc-400">
        Todavía no hay demos en producción. Cuando el setter arranque una ficha,
        el pipeline aparece acá.
      </p>
    )
  }

  return (
    <ol className="flex flex-wrap items-stretch gap-2" aria-label="Etapas de producción">
      {resumen.map((stage, index) => (
        <li
          key={stage.stage}
          aria-label={nodeAriaLabel(stage, ahora)}
          className="flex flex-1 items-stretch gap-2"
        >
          {index > 0 ? (
            <ChevronRight
              aria-hidden
              className="hidden shrink-0 self-center text-zinc-700 lg:block"
              strokeWidth={1.5}
            />
          ) : null}
          <StageNode stage={stage} ahora={ahora} />
        </li>
      ))}
    </ol>
  )
}

function StageNode({ stage, ahora }: { stage: ResumenStage; ahora: Date }) {
  const atascada = stage.atascadas > 0
  return (
    <div
      aria-hidden
      className={cn(
        'flex min-w-[140px] flex-1 flex-col gap-2 rounded-2xl border p-4 transition-colors',
        atascada
          ? 'border-amber-400/30 bg-amber-500/[0.06]'
          : 'border-white/10 bg-black/20',
      )}
    >
      <span
        className={cn(
          'inline-flex w-fit rounded-full border px-2.5 py-1 text-[11px] font-medium',
          STAGE_PILL[stageTone(stage.stage)],
        )}
      >
        {STAGE_LABELS[stage.stage]}
      </span>

      <p className="text-3xl font-semibold leading-none text-white">{stage.total}</p>

      {stage.total === 0 ? (
        <p className="text-xs text-zinc-400">Vacío</p>
      ) : (
        <div className="space-y-1.5">
          {stage.masViejoDesde ? (
            <p className="text-xs text-zinc-400">
              Más viejo {formatEspera(stage.masViejoDesde, ahora)}
            </p>
          ) : null}
          {atascada ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/20 bg-amber-400/10 px-2 py-0.5 text-[11px] font-medium text-amber-200">
              <AlertTriangle className="h-3 w-3" strokeWidth={1.5} />
              {stage.atascadas} atascada{stage.atascadas === 1 ? '' : 's'}
            </span>
          ) : null}
        </div>
      )}
    </div>
  )
}

function AtascosPanel({ atascos, ahora }: { atascos: Atasco[]; ahora: Date }) {
  if (atascos.length === 0) {
    return (
      <div className="flex items-center gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-500/[0.06] px-4 py-3 text-sm text-emerald-200">
        Sin atascos — la producción se mueve.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-amber-100">
        <AlertTriangle className="h-4 w-4" strokeWidth={1.5} />
        Atascos — {atascos.length} demo{atascos.length === 1 ? '' : 's'} sin
        moverse
      </h3>
      {atascos.some((atasco) => atasco.stage === 'RECHAZADA') ? (
        <p className="text-xs text-zinc-400">
          Incluye rechazadas sin retomar — no tienen carril propio en el tablero
          de arriba, por eso el total puede superar la suma de los carriles.
        </p>
      ) : null}
      <ul className="space-y-2">
        {atascos.map((atasco) => {
          const problema = atasco.stage === 'RECHAZADA'
          return (
            <li key={atasco.leadId}>
              <Link
                href={`/admin/leados/${atasco.leadId}`}
                className={cn(
                  'group relative flex items-center justify-between gap-4 overflow-hidden rounded-2xl border p-4 transition-colors',
                  problema
                    ? 'border-rose-400/30 bg-rose-500/[0.05] hover:bg-rose-500/[0.08]'
                    : 'border-amber-400/30 bg-amber-500/[0.05] hover:bg-amber-500/[0.08]',
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    'absolute inset-y-0 left-0 w-1',
                    problema ? 'bg-rose-400' : 'bg-amber-400',
                  )}
                />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="truncate text-base font-semibold text-white">
                      {atasco.businessName}
                    </h4>
                    <span
                      className={cn(
                        'inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium',
                        STAGE_PILL[stageTone(atasco.stage)],
                      )}
                    >
                      {STAGE_LABELS[atasco.stage]}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-zinc-400">
                    <span className="inline-flex items-center gap-1">
                      <UserRound className="h-3 w-3" strokeWidth={1.5} />
                      {atasco.setter}
                    </span>
                    <span>Sin movimiento {formatEspera(atasco.desde, ahora)}</span>
                  </div>
                </div>

                <ChevronRight
                  aria-hidden
                  className="h-5 w-5 shrink-0 text-zinc-600 transition-colors group-hover:text-zinc-300"
                  strokeWidth={1.5}
                />
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
