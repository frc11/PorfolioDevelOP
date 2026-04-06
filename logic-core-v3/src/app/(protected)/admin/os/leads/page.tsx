import type { Prisma } from '@prisma/client'
import { unstable_noStore as noStore } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { LeadForm } from './_components/lead-form'
import {
  ACTIVE_PIPELINE_STATUSES,
  type GroupedLeads,
  type LeadPipelineLead,
  type PipelineStatus,
} from './_components/lead-pipeline.shared'
import {
  LeadPipeline,
} from './_components/lead-pipeline'

export const dynamic = 'force-dynamic'

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

export default async function AgencyOsLeadsPage() {
  noStore()

  const leads = await prisma.osLead.findMany({
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
  })

  const groupedLeads = leads.reduce<GroupedLeads>((accumulator, lead) => {
    const serializedLead = serializeLead(lead)
    accumulator[serializedLead.status].push(serializedLead)
    return accumulator
  }, createEmptyGroups())

  const totalLeads = ACTIVE_PIPELINE_STATUSES.reduce(
    (count, status) => count + groupedLeads[status].length,
    0
  )

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
            Seguimiento visual de prospectos, demos y cierres con prioridad operativa sobre
            cada lead.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-right">
            <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">Leads activos</p>
            <p className="mt-1 text-xl font-semibold text-white">{totalLeads}</p>
          </div>
          <LeadForm />
        </div>
      </div>

      <LeadPipeline groupedLeads={groupedLeads} />
    </section>
  )
}
