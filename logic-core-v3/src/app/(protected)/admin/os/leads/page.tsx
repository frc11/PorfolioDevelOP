import type { Prisma } from '@prisma/client'
import Link from 'next/link'
import { unstable_noStore as noStore } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { LeadForm } from './_components/lead-form'
import { InboundLeadsTable } from './_components/inbound-leads-table'
import {
  ACTIVE_PIPELINE_STATUSES,
  type GroupedLeads,
  type LeadPipelineLead,
  type PipelineStatus,
} from './_components/lead-pipeline.shared'
import {
  LeadPipeline,
} from './_components/lead-pipeline'
import { listInboundLeads } from './_actions/inbound.actions'

export const dynamic = 'force-dynamic'

type LeadTab = 'outbound' | 'inbound'

type LeadRow = Prisma.OsLeadGetPayload<{
  include: {
    _count: {
      select: {
        activities: true
        demos: true
      }
    }
    activities: {
      select: {
        createdAt: true
      }
    }
  }
}>

function createEmptyGroups(): GroupedLeads {
  return {
    PROSPECTO: [],
    DEMO_ENVIADA: [],
    VIO_VIDEO: [],
    RESPONDIO: [],
    CALL_AGENDADA: [],
    CERRADO: [],
    PERDIDO: [],
    POSTERGADO: [],
  }
}

function serializeLead(lead: LeadRow): LeadPipelineLead {
  return {
    id: lead.id,
    businessName: lead.businessName,
    contactName: lead.contactName,
    industry: lead.industry,
    zone: lead.zone,
    serviceType: lead.serviceType,
    status: lead.status as PipelineStatus,
    nextFollowUpAt: lead.nextFollowUpAt?.toISOString() ?? null,
    lastActivityAt: lead.activities[0]?.createdAt.toISOString() ?? null,
    createdAt: lead.createdAt.toISOString(),
    _count: {
      activities: lead._count.activities,
      demos: lead._count.demos,
    },
  }
}

export default async function AgencyOsLeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  noStore()

  const { tab } = await searchParams
  const activeTab: LeadTab = tab === 'inbound' ? 'inbound' : 'outbound'

  const [leads, inboundResult] = await Promise.all([
    prisma.osLead.findMany({
      include: {
        _count: {
          select: {
            activities: true,
            demos: true,
          },
        },
        activities: {
          select: {
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    }),
    activeTab === 'inbound' ? listInboundLeads() : Promise.resolve(null),
  ])

  const groupedLeads = leads.reduce<GroupedLeads>((accumulator, lead) => {
    const serializedLead = serializeLead(lead)
    accumulator[serializedLead.status].push(serializedLead)
    return accumulator
  }, createEmptyGroups())

  const totalOutboundLeads = ACTIVE_PIPELINE_STATUSES.reduce(
    (count, status) => count + groupedLeads[status].length,
    0
  )
  const inboundLeads = inboundResult?.success ? inboundResult.data : []
  const totalInboundLeads = inboundLeads.length

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-zinc-500">
            Agency OS / Leads
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">
            Pipeline comercial
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
            {activeTab === 'outbound'
              ? 'Seguimiento visual de prospectos, demos y cierres con prioridad operativa sobre cada lead.'
              : 'Formularios entrantes del portal que pueden convertirse al pipeline comercial de Agency OS.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-right">
            <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">
              {activeTab === 'outbound' ? 'Leads activos' : 'Leads inbound'}
            </p>
            <p className="mt-1 text-xl font-semibold text-white">
              {activeTab === 'outbound' ? totalOutboundLeads : totalInboundLeads}
            </p>
          </div>
          {activeTab === 'outbound' ? <LeadForm /> : null}
        </div>
      </div>

      <div className="rounded-[28px] border border-white/10 bg-white/5 p-2 backdrop-blur-xl">
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/os/leads?tab=outbound"
            className={[
              'inline-flex items-center rounded-2xl px-4 py-3 text-sm font-medium transition-colors',
              activeTab === 'outbound'
                ? 'bg-cyan-500/15 text-cyan-100'
                : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200',
            ].join(' ')}
          >
            Outbound
          </Link>
          <Link
            href="/admin/os/leads?tab=inbound"
            className={[
              'inline-flex items-center rounded-2xl px-4 py-3 text-sm font-medium transition-colors',
              activeTab === 'inbound'
                ? 'bg-cyan-500/15 text-cyan-100'
                : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200',
            ].join(' ')}
          >
            Inbound
          </Link>
        </div>
      </div>

      {activeTab === 'outbound' ? (
        <LeadPipeline groupedLeads={groupedLeads} />
      ) : inboundResult?.success ? (
        <InboundLeadsTable leads={inboundResult.data} />
      ) : (
        <div className="rounded-[28px] border border-rose-400/20 bg-rose-500/10 p-5 text-sm text-rose-200">
          {inboundResult?.error ?? 'No se pudieron cargar los leads inbound.'}
        </div>
      )}
    </section>
  )
}
