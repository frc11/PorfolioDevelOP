import { redirect } from 'next/navigation'
import { AdminBackButton } from '../../../_components/AdminBackButton'
import { prisma } from '@/lib/prisma'
import { parseEvaluacion } from '@/lib/leados/flow'
import {
  alarmaNuncaDescarta,
  calcularRatioSetters,
  pctDescarte,
  type EvaluacionDeSetter,
} from '@/lib/leados/revision'
import {
  SetterEvaluaciones,
  type SetterEvaluacionItem,
} from './_components/setter-evaluaciones'

export const dynamic = 'force-dynamic'

type SetterPageProps = {
  params: Promise<{ setterId: string }>
}

/**
 * LeadOS B-beta — Drill-down de la métrica descarte/avance: las últimas
 * evaluaciones de un setter, con el score, el veredicto y el razonamiento
 * detrás. Destino de la fila clickeable de la cola — la alarma "revisar
 * criterio" ya no manda a buscar en la base. Admin-only por el layout
 * (SUPER_ADMIN); read-only, no toca métrica ni scoring.
 */
export default async function LeadOsSetterEvaluacionesPage({ params }: SetterPageProps) {
  const { setterId } = await params

  // Sin unstable_cache, mismo criterio que la cola: datos frescos al revisar.
  // Sin `take`: volumen chico (un setter), igual que la métrica de la cola —
  // así el resumen de acá coincide con el de la cola; el orden final lo da la
  // fecha de evaluación en JS, no este orderBy (que solo ordena las pre-B5).
  const [setter, dossiers] = await Promise.all([
    prisma.user.findUnique({
      where: { id: setterId },
      select: { name: true, email: true },
    }),
    prisma.osLeadDossier.findMany({
      where: { lead: { assignedToId: setterId } },
      select: {
        leadId: true,
        stage: true,
        evaluacionJson: true,
        lead: { select: { businessName: true } },
      },
      orderBy: { updatedAt: 'desc' },
    }),
  ])

  // Setter inexistente (URL tipeada a mano, o setter borrado): volvé a la cola,
  // mismo criterio que el detalle de lead cuando el dossier no existe.
  if (!setter) {
    redirect('/admin/leados')
  }

  const setterLabel = setter.name ?? setter.email ?? 'Sin setter'

  const items: SetterEvaluacionItem[] = dossiers.flatMap((dossier) => {
    const evaluacion = parseEvaluacion(dossier.evaluacionJson)
    if (!evaluacion) return []
    return [
      {
        leadId: dossier.leadId,
        businessName: dossier.lead.businessName,
        stage: dossier.stage,
        evaluacion,
      },
    ]
  })

  // Presentación: la más reciente primero (por la fecha estampada en B5). Las
  // pre-B5 sin fecha caen al final — están en el total, pero no se las puede
  // ubicar en la línea de tiempo.
  const ordenadas = [...items].sort((a, b) => {
    const fa = a.evaluacion.fecha ? Date.parse(a.evaluacion.fecha) : NaN
    const fb = b.evaluacion.fecha ? Date.parse(b.evaluacion.fecha) : NaN
    if (Number.isNaN(fa) && Number.isNaN(fb)) return 0
    if (Number.isNaN(fa)) return 1
    if (Number.isNaN(fb)) return -1
    return fb - fa
  })

  // Mismo cálculo que la métrica de la cola: cierra el loop — los números que
  // dispararon la alarma, ahora con las evaluaciones que los produjeron.
  const filasMetrica: EvaluacionDeSetter[] = items.map((item) => ({
    setterId,
    setterLabel,
    evaluacion: item.evaluacion,
  }))
  const ratio = calcularRatioSetters(filasMetrica, new Date())[0] ?? null
  const pct = ratio ? pctDescarte(ratio.total) : null
  const alarma = ratio ? alarmaNuncaDescarta(ratio.total) : false

  return (
    <section className="space-y-6">
      <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
        <AdminBackButton href="/admin/leados" label="Volver a la cola" />

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h2 className="text-3xl font-semibold tracking-tight text-white">
            {setterLabel}
          </h2>
          {alarma ? (
            <span className="inline-flex rounded-full border border-rose-400/20 bg-rose-500/10 px-2.5 py-1 text-[11px] font-medium text-rose-200">
              Nunca descarta — revisar criterio
            </span>
          ) : null}
        </div>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
          Las últimas evaluaciones de este setter — score, veredicto y el
          razonamiento detrás. El criterio detrás del filtro, sin buscar en la
          base.
        </p>

        {ratio ? (
          <p className="mt-3 text-sm text-zinc-300">
            {ratio.total.evaluadas} evaluadas · {ratio.total.descartadas} descartes
            · {ratio.total.avanzadas} avances
            {pct !== null ? (
              <span className="text-zinc-500"> ({pct}% descarte)</span>
            ) : null}
          </p>
        ) : null}
      </div>

      <SetterEvaluaciones items={ordenadas} />
    </section>
  )
}
