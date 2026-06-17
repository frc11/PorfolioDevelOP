import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ExternalLink, Flame, UserRound } from 'lucide-react'
import { AdminBackButton } from '../../_components/AdminBackButton'
import { prisma } from '@/lib/prisma'
import {
  parseBrief,
  parseEvaluacion,
  parseFicha,
  parseRechazos,
  parseSelfCheck,
  STAGE_LABELS,
  STATUS_LABELS,
} from '@/lib/leados/flow'
import { esCaliente, formatEspera, ordenarCola } from '@/lib/leados/revision'
import { DecisionBar } from './_components/decision-bar'
import {
  BriefPanel,
  EvaluacionPanel,
  FichaPanel,
  RechazosPanel,
  SelfCheckPanel,
} from './_components/dossier-panels'

export const dynamic = 'force-dynamic'

type RevisionPageProps = {
  params: Promise<{ leadId: string }>
}

export default async function LeadOsRevisionDetailPage({ params }: RevisionPageProps) {
  const { leadId } = await params

  const dossier = await prisma.osLeadDossier.findUnique({
    where: { leadId },
    include: {
      lead: {
        select: {
          businessName: true,
          contactName: true,
          industry: true,
          zone: true,
          status: true,
          instagramUrl: true,
          currentWebUrl: true,
          googleMapsUrl: true,
          assignedTo: { select: { name: true, email: true } },
        },
      },
    },
  })

  if (!dossier) {
    redirect('/admin/leados')
  }

  const evaluacion = parseEvaluacion(dossier.evaluacionJson)
  const ficha = parseFicha(dossier.fichaJson)
  const brief = parseBrief(dossier.briefJson)
  const selfCheck = parseSelfCheck(dossier.selfCheckJson)
  const rechazos = parseRechazos(dossier.rechazos)
  const caliente = esCaliente(evaluacion?.score ?? null)
  const enRevision = dossier.stage === 'EN_REVISION'
  const ahora = new Date()

  // "Saltar al siguiente": el ítem más prioritario de la cola sin contar este.
  const restoCola = await prisma.osLeadDossier.findMany({
    where: { stage: 'EN_REVISION', NOT: { leadId } },
    select: { leadId: true, updatedAt: true, evaluacionJson: true },
  })
  const siguiente = ordenarCola(
    restoCola.map((item) => ({
      leadId: item.leadId,
      caliente: esCaliente(parseEvaluacion(item.evaluacionJson)?.score ?? null),
      esperaDesde: item.updatedAt,
    })),
  )[0]
  const nextLeadId = siguiente?.leadId ?? null

  const setter =
    dossier.lead.assignedTo?.name ?? dossier.lead.assignedTo?.email ?? 'Sin setter'
  const meta = [dossier.lead.contactName, dossier.lead.industry, dossier.lead.zone]
    .filter(Boolean)
    .join(' · ')
  const links = [
    { label: 'Instagram', href: dossier.lead.instagramUrl },
    { label: 'Web actual', href: dossier.lead.currentWebUrl },
    { label: 'Google Maps', href: dossier.lead.googleMapsUrl },
  ].filter((link): link is { label: string; href: string } => Boolean(link.href))

  return (
    <section className="space-y-6">
      <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <AdminBackButton href="/admin/leados" label="Volver a la cola" />
          <div className="flex flex-wrap items-center gap-4">
            {/* B8A/H5: puente a la otra superficie admin del mismo lead
                (pipeline + cierre de reunión B7), que antes no estaba enlazada. */}
            <Link
              href={`/admin/leads/${leadId}`}
              className="text-xs font-medium text-zinc-500 transition-colors hover:text-zinc-300"
            >
              Ver ficha completa del lead →
            </Link>
            {nextLeadId ? (
              <Link
                href={`/admin/leados/${nextLeadId}`}
                className="text-xs font-medium text-cyan-300 transition-colors hover:text-cyan-200"
              >
                Siguiente en la cola →
              </Link>
            ) : null}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h2 className="text-3xl font-semibold tracking-tight text-white">
            {dossier.lead.businessName}
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            {caliente ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/20 bg-amber-400/10 px-2.5 py-1 text-[11px] font-medium text-amber-200">
                <Flame className="h-3 w-3" strokeWidth={1.5} />
                Caliente
              </span>
            ) : null}
            <span className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-1 text-[11px] font-medium text-cyan-200">
              {STAGE_LABELS[dossier.stage]}
            </span>
            <span className="inline-flex rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-[11px] font-medium text-zinc-300">
              {STATUS_LABELS[dossier.lead.status]}
            </span>
          </div>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-zinc-400">
          <span className="inline-flex items-center gap-1.5">
            <UserRound className="h-3.5 w-3.5" strokeWidth={1.5} />
            {setter}
          </span>
          {meta ? <span>{meta}</span> : null}
          {enRevision ? (
            <span>Espera {formatEspera(dossier.updatedAt, ahora)}</span>
          ) : null}
        </div>

        {links.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-[11px] font-medium text-zinc-400 transition-colors hover:bg-black/30 hover:text-zinc-200"
              >
                <ExternalLink className="h-3 w-3" strokeWidth={1.5} />
                {link.label}
              </a>
            ))}
          </div>
        ) : null}
      </div>

      {!enRevision ? (
        <p className="rounded-[28px] border border-white/10 bg-white/[0.03] px-6 py-4 text-sm text-zinc-300">
          Esta demo ya no está en revisión — estado actual:{' '}
          <span className="font-medium text-white">{STAGE_LABELS[dossier.stage]}</span>
          {dossier.finalUrl ? (
            <>
              {' · '}
              <a
                href={dossier.finalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-300 hover:underline"
              >
                URL permanente
              </a>
            </>
          ) : null}
        </p>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(340px,1fr)]">
        {/* El preview es sticky y llena el alto del viewport mientras se
            scrollea la columna de paneles (más alta). `self-start` corta el
            stretch del grid (era la causa del hueco: la columna izquierda se
            estiraba a la altura de la derecha). Arranca arriba (top-0). */}
        <section className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl xl:sticky xl:top-0 xl:flex xl:h-[calc(100vh-12.5rem)] xl:flex-col xl:self-start">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-base font-semibold text-white">La demo</h3>
            {dossier.draftUrl ? (
              <a
                href={dossier.draftUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-xs font-medium text-zinc-300 transition-colors hover:bg-black/30 hover:text-white"
              >
                <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.5} />
                Abrir en pestaña nueva
              </a>
            ) : null}
          </div>

          {dossier.draftUrl ? (
            <>
              <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-black/40 xl:min-h-0 xl:flex-1">
                <iframe
                  src={dossier.draftUrl}
                  title={`Demo de ${dossier.lead.businessName}`}
                  className="h-[60vh] w-full xl:h-full"
                  loading="lazy"
                />
              </div>
              <p className="mt-2 text-xs text-zinc-600">
                Si el embed no carga (algunos hosts lo bloquean), usá «Abrir en
                pestaña nueva».
              </p>
            </>
          ) : (
            <p className="mt-4 flex items-center justify-center rounded-2xl border border-dashed border-white/10 bg-black/10 px-4 py-8 text-center text-sm text-zinc-500 xl:min-h-0 xl:flex-1">
              Este dossier no tiene draft URL cargada — no hay demo para
              embeber.
            </p>
          )}
        </section>

        <div className="space-y-6">
          {enRevision ? (
            <DecisionBar leadId={leadId} businessName={dossier.lead.businessName} />
          ) : null}

          <EvaluacionPanel evaluacion={evaluacion} />
          <BriefPanel brief={brief} />
          <SelfCheckPanel
            selfCheck={selfCheck}
            exigible={dossier.stage === 'EN_REVISION' || dossier.stage === 'APROBADA'}
          />
          <RechazosPanel rechazos={rechazos} />
          <FichaPanel ficha={ficha} />
        </div>
      </div>
    </section>
  )
}
