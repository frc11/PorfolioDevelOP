import type { Prisma } from '@prisma/client'
import Link from 'next/link'
import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { SOLO_CONTACTOS_COMERCIALES } from '@/lib/leados/isolation'
import { LeadForm } from './_components/lead-form'
import { InboundLeadsTable } from './_components/inbound-leads-table'
import {
  type LeadPipelineLead,
  type PipelineStatus,
} from './_components/lead-pipeline.shared'
import { OutboundLeadsView } from './_components/outbound-leads-view'
import { listInboundLeads } from './_actions/inbound.actions'

// Fix Next 16 + unstable_cache (hallazgo B3): el cache serializa los Date a
// strings, así que `.toISOString()` explotaba en los hits. La serialización
// ahora vive DENTRO del callback (corre solo en el miss, con Dates reales) y
// lo cacheado ya es plano — misma regla que aplica el resto del repo.
const getLeads = unstable_cache(
  async () => {
    const leads = await prisma.osLead.findMany({
      include: {
        _count: {
          select: {
            // Contactos comerciales: el rastro de reasignación (SISTEMA) no
            // cuenta como actividad ni como "último contacto".
            activities: { where: SOLO_CONTACTOS_COMERCIALES },
            demos: true,
          },
        },
        activities: {
          where: SOLO_CONTACTOS_COMERCIALES,
          select: {
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
        assignedTo: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    })
    return leads.map(serializeLead)
  },
  ['admin-leads'],
  { revalidate: 60, tags: ['admin-leads'] }
)

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
    assignedTo: {
      select: {
        name: true
        email: true
      }
    }
  }
}>

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
    assignedToName: lead.assignedTo?.name ?? lead.assignedTo?.email ?? null,
    _count: {
      activities: lead._count.activities,
      demos: lead._count.demos,
    },
  }
}

export default async function AgencyOsLeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; period?: string; from?: string; to?: string }>
}) {
  const { tab, period, from, to } = await searchParams
  const activeTab: LeadTab = tab === 'inbound' ? 'inbound' : 'outbound'

  const [leads, inboundResult] = await Promise.all([
    getLeads(),
    activeTab === 'inbound'
      ? listInboundLeads({ period, from, to })
      : Promise.resolve(null),
  ])

  const inboundLeads = inboundResult?.success ? inboundResult.data : []
  const totalInboundLeads = inboundLeads.length

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs tracking-tight text-zinc-500">
            develOP / Leads
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white">
            Pipeline comercial
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
            {activeTab === 'outbound'
              ? 'Seguimiento visual de prospectos, demos y cierres con prioridad operativa sobre cada lead.'
              : 'Formularios entrantes del portal que pueden convertirse al pipeline comercial interno.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {activeTab === 'inbound' ? (
            <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-right">
              <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">Leads inbound</p>
              <p className="mt-1 text-xl font-semibold text-white">{totalInboundLeads}</p>
            </div>
          ) : null}
          {activeTab === 'outbound' ? <LeadForm /> : null}
        </div>
      </div>

      <div className="rounded-[28px] border border-white/10 bg-white/5 p-2 backdrop-blur-xl">
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/leads?tab=outbound"
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
            href="/admin/leads?tab=inbound"
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
        <OutboundLeadsView leads={leads} />
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
