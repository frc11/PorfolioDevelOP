import Link from 'next/link'
import { ChevronRight, Flame, UserRound } from 'lucide-react'
import { cn } from '@/lib/utils'
import { adminHoverCls } from '@/lib/hover'
import { prisma } from '@/lib/prisma'
import { parseEvaluacion } from '@/lib/leados/flow'
import {
  alarmaNuncaDescarta,
  calcularRatioSetters,
  esCaliente,
  formatEspera,
  ordenarCola,
  pctDescarte,
  type EvaluacionDeSetter,
} from '@/lib/leados/revision'
import {
  detectarAtascos,
  resumirPipeline,
  type DossierPipelineInput,
} from '@/lib/leados/pipeline'
import { PipelineCockpit } from './_components/pipeline-board'

export const dynamic = 'force-dynamic'

function setterLabel(assignedTo: { name: string | null; email: string } | null): string {
  return assignedTo?.name ?? assignedTo?.email ?? 'Sin setter'
}

export default async function LeadOsRevisionPage() {
  // Sin unstable_cache a propósito: la cola es operativa y chica (un setter);
  // datos frescos en cada carga evitan revisar sobre un estado viejo.
  const [enRevision, dossiersEvaluados, pipelineDossiers] = await Promise.all([
    prisma.osLeadDossier.findMany({
      where: { stage: 'EN_REVISION' },
      select: {
        leadId: true,
        updatedAt: true,
        evaluacionJson: true,
        lead: {
          select: {
            businessName: true,
            assignedTo: { select: { id: true, name: true, email: true } },
          },
        },
      },
    }),
    // Métrica descarte/avance: todas las evaluaciones de leads asignados.
    // Volumen chico (un setter) → filtrado fino en JS con el contrato zod.
    prisma.osLeadDossier.findMany({
      where: { lead: { assignedToId: { not: null } } },
      select: {
        evaluacionJson: true,
        lead: {
          select: { assignedTo: { select: { id: true, name: true, email: true } } },
        },
      },
    }),
    // Panorama de producción: el tramo en vuelo (FICHA→EN_REVISION) + RECHAZADA
    // (loop-back que se vigila como atasco). Sólo presentación: lee el `stage`
    // que ya existe, jamás lo escribe. `updatedAt` es el proxy de antigüedad.
    prisma.osLeadDossier.findMany({
      where: {
        stage: {
          in: ['FICHA', 'EVALUADA', 'BRIEF', 'CONSTRUCCION', 'EN_REVISION', 'RECHAZADA'],
        },
      },
      select: {
        leadId: true,
        stage: true,
        updatedAt: true,
        lead: {
          select: {
            businessName: true,
            assignedTo: { select: { name: true, email: true } },
          },
        },
      },
    }),
  ])

  const ahora = new Date()

  const pipelineInputs = pipelineDossiers.map<DossierPipelineInput>((dossier) => ({
    leadId: dossier.leadId,
    stage: dossier.stage,
    businessName: dossier.lead.businessName,
    setter: setterLabel(dossier.lead.assignedTo),
    desde: dossier.updatedAt,
  }))
  const resumenPipeline = resumirPipeline(pipelineInputs, ahora)
  const atascos = detectarAtascos(pipelineInputs, ahora)

  const cola = ordenarCola(
    enRevision.map((dossier) => {
      const evaluacion = parseEvaluacion(dossier.evaluacionJson)
      const score = evaluacion?.score ?? null
      return {
        leadId: dossier.leadId,
        businessName: dossier.lead.businessName,
        setter: setterLabel(dossier.lead.assignedTo),
        score,
        caliente: esCaliente(score),
        esperaDesde: dossier.updatedAt,
      }
    }),
  )

  const filasMetrica = dossiersEvaluados.flatMap<EvaluacionDeSetter>((dossier) => {
    const evaluacion = parseEvaluacion(dossier.evaluacionJson)
    const assignedTo = dossier.lead.assignedTo
    if (!evaluacion || !assignedTo) return []
    return [
      {
        setterId: assignedTo.id,
        setterLabel: setterLabel(assignedTo),
        evaluacion,
      },
    ]
  })
  const ratios = calcularRatioSetters(filasMetrica, ahora)
  const calientes = cola.filter((item) => item.caliente).length

  return (
    <section className="space-y-6">
      <PipelineCockpit resumen={resumenPipeline} atascos={atascos} ahora={ahora} />

      <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-white">
            Cola de revisión
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
            Demos del setter esperando tu veredicto. Calientes primero, después
            por antigüedad. Aprobar registra la URL permanente; rechazar exige
            dirección accionable.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className={'rounded-2xl ' + adminHoverCls}>
            <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-right">
              <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                En revisión
              </p>
              <p className="mt-1 text-xl font-semibold text-white">{cola.length}</p>
            </div>
          </div>
          <div className={'rounded-2xl ' + adminHoverCls}>
            <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-right">
              <p className="text-[10px] uppercase tracking-[0.22em] text-amber-200/70">
                Calientes
              </p>
              <p className="mt-1 text-xl font-semibold text-amber-100">{calientes}</p>
            </div>
          </div>
        </div>
      </div>

      {cola.length === 0 ? (
        <p className="rounded-3xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-10 text-center text-sm text-zinc-500">
          No hay demos esperando revisión. Cuando el setter mande una a
          revisión, aparece acá.
        </p>
      ) : (
        <div className="space-y-3">
          {cola.map((item) => (
            <Link
              key={item.leadId}
              href={`/admin/leados/${item.leadId}`}
              className={cn(
                'group relative flex items-center justify-between gap-4 overflow-hidden rounded-2xl border p-4 transition-all hover:scale-[1.02] hover:shadow-[0_12px_32px_-12px_rgba(255,255,255,0.12)] hover:ring-1 hover:ring-white/15 motion-reduce:hover:scale-100 motion-reduce:hover:shadow-none',
                item.caliente
                  ? 'border-amber-400/30 bg-amber-500/[0.05] hover:bg-amber-500/[0.08]'
                  : 'border-white/10 bg-white/5 hover:border-cyan-400/20 hover:bg-white/[0.07]',
              )}
            >
              {item.caliente && (
                <span aria-hidden className="absolute inset-y-0 left-0 w-1 bg-amber-400" />
              )}
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="truncate text-base font-semibold text-white">
                    {item.businessName}
                  </h3>
                  {item.caliente ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/20 bg-amber-400/10 px-2.5 py-1 text-[11px] font-medium text-amber-200">
                      <Flame className="h-3 w-3" strokeWidth={1.5} />
                      Caliente
                    </span>
                  ) : null}
                  {item.score !== null ? (
                    <span className="inline-flex rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-[11px] font-medium text-zinc-300">
                      Score {item.score}/5
                    </span>
                  ) : null}
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-zinc-400">
                  <span className="inline-flex items-center gap-1">
                    <UserRound className="h-3 w-3" strokeWidth={1.5} />
                    {item.setter}
                  </span>
                  <span>Espera {formatEspera(item.esperaDesde, ahora)}</span>
                </div>
              </div>

              <ChevronRight
                className="h-5 w-5 shrink-0 text-zinc-600 transition-colors group-hover:text-cyan-300"
                strokeWidth={1.5}
              />
            </Link>
          ))}
        </div>
      )}

      <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
        <h3 className="text-lg font-semibold text-white">
          Filtro del setter — descarte vs avance
        </h3>
        <p className="mt-1 text-sm text-zinc-400">
          Un setter que nunca descarta es una alarma, no un crack.
        </p>

        {ratios.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-zinc-500">
            Todavía no hay evaluaciones registradas.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {ratios.map((ratio) => {
              const pctTotal = pctDescarte(ratio.total)
              const pct30d = pctDescarte(ratio.ultimos30d)
              const alarma = alarmaNuncaDescarta(ratio.total)
              return (
                <Link
                  key={ratio.setterId}
                  href={`/admin/leados/setter/${ratio.setterId}`}
                  className="group block rounded-2xl border border-white/10 bg-black/20 p-4 transition-all hover:border-cyan-400/20 hover:bg-black/30"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-medium text-zinc-100">
                      {ratio.setterLabel}
                    </p>
                    {alarma ? (
                      <span className="inline-flex rounded-full border border-rose-400/20 bg-rose-500/10 px-2.5 py-1 text-[11px] font-medium text-rose-200">
                        Nunca descarta — revisar criterio
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                        Total
                      </p>
                      <p className="mt-1 text-sm text-zinc-300">
                        {ratio.total.evaluadas} evaluadas ·{' '}
                        {ratio.total.descartadas} descartes ·{' '}
                        {ratio.total.avanzadas} avances
                        {pctTotal !== null ? (
                          <span className="text-zinc-500"> ({pctTotal}% descarte)</span>
                        ) : null}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                        Últimos 30 días
                      </p>
                      <p className="mt-1 text-sm text-zinc-300">
                        {ratio.ultimos30d.evaluadas} evaluadas ·{' '}
                        {ratio.ultimos30d.descartadas} descartes ·{' '}
                        {ratio.ultimos30d.avanzadas} avances
                        {pct30d !== null ? (
                          <span className="text-zinc-500"> ({pct30d}% descarte)</span>
                        ) : null}
                      </p>
                    </div>
                  </div>

                  {ratio.sinFecha > 0 ? (
                    <p className="mt-2 text-xs text-zinc-600">
                      {ratio.sinFecha} evaluación(es) sin fecha (pre-B5): cuentan
                      en el total, no en los 30 días.
                    </p>
                  ) : null}

                  <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-zinc-500 transition-colors group-hover:text-cyan-300">
                    Ver últimas evaluaciones
                    <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.5} />
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
