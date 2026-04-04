import type { ActivityChannel, ActivityResult, LeadStatus, OsServiceType, Prisma } from '@prisma/client'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { LeadForm } from '../_components/lead-form'
import { LeadActivityFeed } from '../_components/lead-activity-feed'
import { LeadDemosPanel } from '../_components/demo-form'
import { updateLeadStatus } from '../_actions/lead.actions'

type LeadPageProps = {
  params: Promise<{
    leadId: string
  }>
}

type LeadRecord = Prisma.OsLeadGetPayload<{
  include: {
    activities: {
      include: {
        performedBy: {
          select: {
            id: true
            name: true
            email: true
          }
        }
      }
    }
    demos: true
    project: true
  }
}>

function statusBadgeTone(status: LeadStatus): string {
  switch (status) {
    case 'PROSPECTO':
      return 'border-cyan-400/20 bg-cyan-400/10 text-cyan-200'
    case 'DEMO_ENVIADA':
      return 'border-violet-400/20 bg-violet-400/10 text-violet-200'
    case 'VIO_VIDEO':
      return 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200'
    case 'RESPONDIO':
      return 'border-sky-400/20 bg-sky-400/10 text-sky-200'
    case 'CALL_AGENDADA':
      return 'border-amber-400/20 bg-amber-400/10 text-amber-200'
    case 'CERRADO':
      return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-100'
    case 'PERDIDO':
      return 'border-rose-400/20 bg-rose-500/10 text-rose-200'
    case 'POSTERGADO':
      return 'border-zinc-400/20 bg-zinc-500/10 text-zinc-200'
  }
}

function serviceBadgeTone(serviceType: OsServiceType | null): string {
  switch (serviceType) {
    case 'WEB':
      return 'border-cyan-400/20 bg-cyan-400/10 text-cyan-200'
    case 'AI_AGENT':
      return 'border-violet-400/20 bg-violet-400/10 text-violet-200'
    case 'AUTOMATION':
      return 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200'
    case 'CUSTOM_SOFTWARE':
      return 'border-amber-400/20 bg-amber-400/10 text-amber-200'
    default:
      return 'border-white/10 bg-white/5 text-zinc-300'
  }
}

function serviceLabel(serviceType: OsServiceType | null): string {
  switch (serviceType) {
    case 'WEB':
      return 'Web'
    case 'AI_AGENT':
      return 'AI Agent'
    case 'AUTOMATION':
      return 'Automation'
    case 'CUSTOM_SOFTWARE':
      return 'Custom Software'
    default:
      return 'Sin servicio'
  }
}

function statusLabel(status: LeadStatus): string {
  switch (status) {
    case 'PROSPECTO':
      return 'Prospecto'
    case 'DEMO_ENVIADA':
      return 'Demo enviada'
    case 'VIO_VIDEO':
      return 'Vio video'
    case 'RESPONDIO':
      return 'Respondió'
    case 'CALL_AGENDADA':
      return 'Call agendada'
    case 'CERRADO':
      return 'Cerrado'
    case 'PERDIDO':
      return 'Perdido'
    case 'POSTERGADO':
      return 'Postergado'
  }
}

function formatDate(value: Date | null): string {
  if (!value) {
    return 'Sin fecha'
  }

  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(value)
}

function buildLeadFormData(lead: LeadRecord) {
  return {
    id: lead.id,
    businessName: lead.businessName,
    contactName: lead.contactName,
    phone: lead.phone,
    email: lead.email,
    industry: lead.industry,
    zone: lead.zone,
    source: lead.source,
    serviceType: lead.serviceType,
    instagramUrl: lead.instagramUrl,
    currentWebUrl: lead.currentWebUrl,
    googleMapsUrl: lead.googleMapsUrl,
    notes: lead.notes,
  }
}

function serializeActivities(lead: LeadRecord) {
  return lead.activities.map((activity) => ({
    id: activity.id,
    channel: activity.channel as ActivityChannel,
    result: activity.result as ActivityResult | null,
    notes: activity.notes,
    createdAt: activity.createdAt.toISOString(),
    performedBy: activity.performedBy
      ? {
          id: activity.performedBy.id,
          name: activity.performedBy.name,
          email: activity.performedBy.email,
        }
      : null,
  }))
}

function serializeDemos(lead: LeadRecord) {
  return lead.demos.map((demo) => ({
    id: demo.id,
    serviceType: demo.serviceType,
    demoUrl: demo.demoUrl,
    loomUrl: demo.loomUrl,
    sentAt: demo.sentAt.toISOString(),
    viewedAt: demo.viewedAt?.toISOString() ?? null,
    notes: demo.notes,
  }))
}

const STATUS_OPTIONS: LeadStatus[] = [
  'PROSPECTO',
  'DEMO_ENVIADA',
  'VIO_VIDEO',
  'RESPONDIO',
  'CALL_AGENDADA',
  'CERRADO',
  'PERDIDO',
  'POSTERGADO',
]

export default async function AgencyOsLeadDetailPage({ params }: LeadPageProps) {
  const { leadId } = await params

  const lead = await prisma.osLead.findUnique({
    where: { id: leadId },
    include: {
      activities: {
        include: {
          performedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
      demos: {
        orderBy: {
          sentAt: 'desc',
        },
      },
      project: true,
    },
  })

  if (!lead) {
    redirect('/admin/os/leads')
  }

  const canConvertToProject = lead.status === 'CERRADO' && !lead.project

  return (
    <section className="space-y-6">
      <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">
              Agency OS / Leads / Ficha
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white">
              {lead.businessName}
            </h2>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span
                className={[
                  'inline-flex rounded-full border px-3 py-1 text-xs font-medium',
                  statusBadgeTone(lead.status),
                ].join(' ')}
              >
                {statusLabel(lead.status)}
              </span>
              <span
                className={[
                  'inline-flex rounded-full border px-3 py-1 text-xs font-medium',
                  serviceBadgeTone(lead.serviceType),
                ].join(' ')}
              >
                {serviceLabel(lead.serviceType)}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <LeadForm lead={buildLeadFormData(lead)} triggerLabel="Editar" />

            <details className="relative">
              <summary className="list-none rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-zinc-200 transition-colors hover:bg-black/30">
                Cambiar estado
              </summary>

              <div className="absolute right-0 top-14 z-20 min-w-[220px] rounded-2xl border border-white/10 bg-[#11161d]/95 p-2 shadow-2xl backdrop-blur-xl">
                {STATUS_OPTIONS.filter((status) => status !== lead.status).map((status) => (
                  <form
                    key={status}
                    action={async () => {
                      'use server'
                      await updateLeadStatus({
                        leadId: lead.id,
                        status,
                        reactivateAt:
                          status === 'POSTERGADO'
                            ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                            : undefined,
                      })
                    }}
                  >
                    <button
                      type="submit"
                      className="flex w-full rounded-xl px-3 py-2 text-left text-sm text-zinc-200 transition-colors hover:bg-white/5"
                    >
                      {statusLabel(status)}
                    </button>
                  </form>
                ))}
              </div>
            </details>

            {canConvertToProject ? (
              <button
                type="button"
                disabled
                className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm font-medium text-emerald-100 opacity-75"
              >
                Convertir a proyecto
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,1fr)]">
        <div className="space-y-6">
          <section className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
            <h3 className="text-lg font-semibold text-white">Datos del lead</h3>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">Contacto</p>
                <p className="mt-2 text-sm text-zinc-200">{lead.contactName ?? 'Sin contacto'}</p>
                <p className="mt-2 text-sm text-zinc-400">{lead.email ?? 'Sin email'}</p>
                <p className="mt-1 text-sm text-zinc-400">{lead.phone ?? 'Sin teléfono'}</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">Contexto</p>
                <p className="mt-2 text-sm text-zinc-200">{lead.industry ?? 'Sin industria'}</p>
                <p className="mt-2 text-sm text-zinc-400">{lead.zone ?? 'Sin zona'}</p>
                <p className="mt-1 text-sm text-zinc-400">{lead.source ?? 'Sin origen'}</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">Links</p>
                <div className="mt-2 space-y-2 text-sm text-zinc-300">
                  {lead.instagramUrl ? (
                    <a
                      href={lead.instagramUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="block text-cyan-200 hover:underline"
                    >
                      Instagram
                    </a>
                  ) : null}
                  {lead.currentWebUrl ? (
                    <a
                      href={lead.currentWebUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="block text-cyan-200 hover:underline"
                    >
                      Sitio web
                    </a>
                  ) : null}
                  {lead.googleMapsUrl ? (
                    <a
                      href={lead.googleMapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="block text-cyan-200 hover:underline"
                    >
                      Google Maps
                    </a>
                  ) : null}
                  {!lead.instagramUrl && !lead.currentWebUrl && !lead.googleMapsUrl ? (
                    <p className="text-zinc-500">Sin links cargados.</p>
                  ) : null}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">Proyecto vinculado</p>
                {lead.project ? (
                  <div className="mt-2 space-y-1 text-sm">
                    <p className="text-zinc-100">{lead.project.name}</p>
                    <p className="text-zinc-400">{lead.project.status.replaceAll('_', ' ')}</p>
                    <p className="text-zinc-400">
                      ${lead.project.agreedAmount.toString()}
                    </p>
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-zinc-500">Todavía sin proyecto.</p>
                )}
              </div>
            </div>

            {lead.notes ? (
              <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">Notas</p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-300">{lead.notes}</p>
              </div>
            ) : null}
          </section>

          <LeadActivityFeed
            leadId={lead.id}
            nextFollowUpAt={lead.nextFollowUpAt?.toISOString() ?? null}
            activities={serializeActivities(lead)}
          />
        </div>

        <div className="space-y-6">
          <LeadDemosPanel leadId={lead.id} demos={serializeDemos(lead)} />

          <section className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
            <h3 className="text-lg font-semibold text-white">Acciones rápidas</h3>

            <div className="mt-4 grid gap-3">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">Creado</p>
                <p className="mt-2 text-sm text-zinc-200">{formatDate(lead.createdAt)}</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">Reactivate at</p>
                <p className="mt-2 text-sm text-zinc-200">{formatDate(lead.reactivateAt)}</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">Actividad</p>
                <p className="mt-2 text-sm text-zinc-200">{lead.activities.length} registros</p>
                <p className="mt-1 text-sm text-zinc-400">{lead.demos.length} demos cargadas</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </section>
  )
}
