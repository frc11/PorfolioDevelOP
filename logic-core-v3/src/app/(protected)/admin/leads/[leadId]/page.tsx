import type { ActivityChannel, ActivityResult, LeadStatus, OsServiceType, Prisma } from '@prisma/client'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { parseAgenda, reunionAgendada } from '@/lib/leados/flow'
import { AdminBackButton } from '../../_components/AdminBackButton'
import { LeadForm } from '../_components/lead-form'
import { LeadActivityFeed } from '../_components/lead-activity-feed'
import { LeadDemosPanel } from '../_components/demo-form'
import { AssignSetterControl } from '../_components/assign-setter-control'
import { cargarCargaSetters } from '@/lib/leados/setter-carga'
import { ReunionPanel } from '../_components/reunion-panel'
import { ChangeStatusSelect } from '../_components/change-status-select'
import { adminHoverCls } from '@/lib/hover'

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
    dossier: {
      select: { agendaJson: true }
    }
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

// Calculado acá (función de módulo, no en el render) para no disparar react-hooks/purity.
function isFollowUpPending(value: Date | null): boolean {
  return value ? value.getTime() <= Date.now() : false
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

export default async function AgencyOsLeadDetailPage({ params }: LeadPageProps) {
  const { leadId } = await params

  const [lead, setters] = await Promise.all([
    prisma.osLead.findUnique({
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
        // B7: la reunión agendada por el setter (booking + traspaso).
        dossier: {
          select: { agendaJson: true },
        },
      },
    }),
    prisma.user.findMany({
      where: { role: 'SETTER' },
      select: { id: true, name: true, email: true },
      orderBy: { name: 'asc' },
    }),
  ])

  if (!lead) {
    redirect('/admin/leads')
  }

  // Carga viva + ratio por setter, para que la asignación no sea a ciegas
  // (reusa el cálculo de /admin/leados; `ahora` se estampa dentro del helper).
  const cargaSetters = await cargarCargaSetters(setters.map((setter) => setter.id))

  const canConvertToProject = lead.status === 'CERRADO' && !lead.project
  // B7: la reunión agendada vía Cal.com — el panel solo aparece con booking real.
  const agenda = parseAgenda(lead.dossier?.agendaJson ?? null)
  const reunion = reunionAgendada(agenda) ? agenda : null

  return (
    <section className="space-y-6">
      <AdminBackButton href="/admin/leads" label="Volver a leads" />

      <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs tracking-tight text-zinc-500">
              develOP / Leads / Ficha
            </p>
            {/* B8A/H5: si el lead tiene dossier LeadOS, puente a la superficie de
                revisión de demo (B5) — antes las dos páginas no se enlazaban. */}
            {lead.dossier ? (
              <Link
                href={`/admin/leados/${lead.id}?from=${encodeURIComponent(`/admin/leads/${lead.id}`)}`}
                className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-200 transition-colors hover:bg-cyan-500/20"
              >
                Ver revisión de la demo (LeadOS) →
              </Link>
            ) : null}
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

            <ChangeStatusSelect leadId={lead.id} status={lead.status} />

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

      {/* P3: la reunión agendada va full-width al tope, empujando el grid hacia abajo.
          Sin reunión no se renderiza y el grid queda como siempre. */}
      {reunion ? <ReunionPanel leadId={lead.id} agenda={reunion} /> : null}

      <div className="grid items-stretch gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,1fr)]">
        {/* P9: a xl la columna izq alinea su alto al de la derecha (Acciones rápidas).
            "Datos" queda fijo (auto) y "Actividad comercial" toma el 1fr restante,
            scrolleando ADENTRO con fade inferior. El feed va absolute para no inflar el
            alto intrínseco de la columna (así el alto lo manda la columna derecha). */}
        <div className="space-y-6 xl:grid xl:h-full xl:min-h-0 xl:grid-rows-[auto_minmax(0,1fr)] xl:gap-6 xl:space-y-0">
          <section className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
            <h3 className="text-lg font-semibold text-white">Datos del lead</h3>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className={'grid rounded-2xl ' + adminHoverCls}>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">Contacto</p>
                  <p className="mt-2 text-sm text-zinc-200">{lead.contactName ?? 'Sin contacto'}</p>
                  <p className="mt-2 text-sm text-zinc-400">{lead.email ?? 'Sin email'}</p>
                  <p className="mt-1 text-sm text-zinc-400">{lead.phone ?? 'Sin teléfono'}</p>
                </div>
              </div>

              <div className={'grid rounded-2xl ' + adminHoverCls}>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">Contexto</p>
                  <p className="mt-2 text-sm text-zinc-200">{lead.industry ?? 'Sin industria'}</p>
                  <p className="mt-2 text-sm text-zinc-400">{lead.zone ?? 'Sin zona'}</p>
                  <p className="mt-1 text-sm text-zinc-400">{lead.source ?? 'Sin origen'}</p>
                </div>
              </div>

              <div className={'grid rounded-2xl ' + adminHoverCls}>
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
              </div>

              <div className={'grid rounded-2xl ' + adminHoverCls}>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">Proyecto vinculado</p>
                  {lead.project ? (
                    <div className="mt-2 space-y-1 text-sm">
                      <p className="text-zinc-100">{lead.project.name}</p>
                      <p className="text-zinc-400">{lead.project.status.replaceAll('_', ' ')}</p>
                      <p className="text-zinc-400">
                        {lead.project.agreedAmount
                          ? `$${lead.project.agreedAmount.toString()}`
                          : 'Monto pendiente'}
                      </p>
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-zinc-500">Todavía sin proyecto.</p>
                  )}
                </div>
              </div>
            </div>

            {lead.notes ? (
              <div className={'mt-4 rounded-2xl ' + adminHoverCls}>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">Notas</p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-300">{lead.notes}</p>
                </div>
              </div>
            ) : null}
          </section>

          <div className="relative xl:min-h-0">
            {/* El feed ocupa el alto disponible (1fr); su timeline scrollea adentro con
                fades scroll-aware (P4). El wrapper sólo le da el alto definido a xl. */}
            <div className="xl:absolute xl:inset-0">
              <LeadActivityFeed
                leadId={lead.id}
                nextFollowUpAt={lead.nextFollowUpAt?.toISOString() ?? null}
                followUpPending={isFollowUpPending(lead.nextFollowUpAt)}
                activities={serializeActivities(lead)}
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <AssignSetterControl
            leadId={lead.id}
            assignedToId={lead.assignedToId}
            setters={setters.map((setter) => {
              const carga = cargaSetters.get(setter.id)
              return {
                id: setter.id,
                label: setter.name ?? setter.email,
                activos: carga?.activos ?? 0,
                ratio: carga?.ratio ?? null,
              }
            })}
          />

          <LeadDemosPanel leadId={lead.id} demos={serializeDemos(lead)} />

          <section className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
            <h3 className="text-lg font-semibold text-white">Acciones rápidas</h3>

            <div className="mt-4 grid gap-3">
              <div className={'grid rounded-2xl ' + adminHoverCls}>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">Creado</p>
                  <p className="mt-2 text-sm text-zinc-200">{formatDate(lead.createdAt)}</p>
                </div>
              </div>

              <div className={'grid rounded-2xl ' + adminHoverCls}>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">Reactivate at</p>
                  <p className="mt-2 text-sm text-zinc-200">{formatDate(lead.reactivateAt)}</p>
                </div>
              </div>

              <div className={'grid rounded-2xl ' + adminHoverCls}>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">Actividad</p>
                  <p className="mt-2 text-sm text-zinc-200">{lead.activities.length} registros</p>
                  <p className="mt-1 text-sm text-zinc-400">{lead.demos.length} demos cargadas</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </section>
  )
}
