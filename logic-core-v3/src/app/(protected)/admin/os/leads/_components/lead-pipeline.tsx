'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown, Inbox } from 'lucide-react'
import { EmptyState } from '@/app/(protected)/admin/os/_components/empty-state'
import { deleteLead, updateLeadStatus } from '../_actions/lead.actions'
import {
  ACTIVE_PIPELINE_STATUSES,
  ARCHIVED_PIPELINE_STATUSES,
  type GroupedLeads,
  type LeadPipelineLead,
  type PipelineStatus,
} from './lead-pipeline.shared'
import { LeadCard } from './lead-card'

const STATUS_LABELS: Record<PipelineStatus, string> = {
  PROSPECTO: 'Prospecto',
  DEMO_ENVIADA: 'Demo enviada',
  VIO_VIDEO: 'Vio video',
  RESPONDIO: 'Respondio',
  CALL_AGENDADA: 'Call agendada',
  CERRADO: 'Cerrado',
  PERDIDO: 'Perdido',
  POSTERGADO: 'Postergado',
}

type LeadPipelineProps = {
  groupedLeads: GroupedLeads
}

function cloneGroups(groups: GroupedLeads): GroupedLeads {
  return {
    PROSPECTO: [...groups.PROSPECTO],
    DEMO_ENVIADA: [...groups.DEMO_ENVIADA],
    VIO_VIDEO: [...groups.VIO_VIDEO],
    RESPONDIO: [...groups.RESPONDIO],
    CALL_AGENDADA: [...groups.CALL_AGENDADA],
    CERRADO: [...groups.CERRADO],
    PERDIDO: [...groups.PERDIDO],
    POSTERGADO: [...groups.POSTERGADO],
  }
}

function moveLead(groups: GroupedLeads, lead: LeadPipelineLead, nextStatus: PipelineStatus): GroupedLeads {
  const nextGroups = cloneGroups(groups)

  for (const status of [...ACTIVE_PIPELINE_STATUSES, ...ARCHIVED_PIPELINE_STATUSES]) {
    nextGroups[status] = nextGroups[status].filter((item) => item.id !== lead.id)
  }

  nextGroups[nextStatus] = [{ ...lead, status: nextStatus }, ...nextGroups[nextStatus]]
  return nextGroups
}

function removeLead(groups: GroupedLeads, leadId: string): GroupedLeads {
  const nextGroups = cloneGroups(groups)

  for (const status of [...ACTIVE_PIPELINE_STATUSES, ...ARCHIVED_PIPELINE_STATUSES]) {
    nextGroups[status] = nextGroups[status].filter((item) => item.id !== leadId)
  }

  return nextGroups
}

function statusTone(status: PipelineStatus): string {
  switch (status) {
    case 'PROSPECTO':
      return 'from-cyan-400/20 to-cyan-400/5 text-cyan-100'
    case 'DEMO_ENVIADA':
      return 'from-violet-400/20 to-violet-400/5 text-violet-100'
    case 'VIO_VIDEO':
      return 'from-emerald-400/20 to-emerald-400/5 text-emerald-100'
    case 'RESPONDIO':
      return 'from-sky-400/20 to-sky-400/5 text-sky-100'
    case 'CALL_AGENDADA':
      return 'from-amber-400/20 to-amber-400/5 text-amber-100'
    case 'CERRADO':
      return 'from-emerald-500/20 to-emerald-500/5 text-emerald-100'
    case 'PERDIDO':
      return 'from-rose-400/20 to-rose-400/5 text-rose-100'
    case 'POSTERGADO':
      return 'from-zinc-400/20 to-zinc-400/5 text-zinc-100'
  }
}

export function LeadPipeline({ groupedLeads }: LeadPipelineProps) {
  const router = useRouter()
  const [showArchived, setShowArchived] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pendingLeadId, setPendingLeadId] = useState<string | null>(null)
  const [localGroupedLeads, setLocalGroupedLeads] = useState<GroupedLeads>(() => cloneGroups(groupedLeads))
  const [, startTransition] = useTransition()

  useEffect(() => {
    setLocalGroupedLeads(cloneGroups(groupedLeads))
  }, [groupedLeads])

  const archivedCount = useMemo(
    () =>
      ARCHIVED_PIPELINE_STATUSES.reduce(
        (count, status) => count + localGroupedLeads[status].length,
        0
      ),
    [localGroupedLeads]
  )

  const handleMoveStatus = (lead: LeadPipelineLead, status: PipelineStatus) => {
    const previousGroups = cloneGroups(localGroupedLeads)
    setError(null)
    setPendingLeadId(lead.id)
    setLocalGroupedLeads((current) => moveLead(current, lead, status))

    startTransition(async () => {
      const result = await updateLeadStatus({
        leadId: lead.id,
        status,
        reactivateAt:
          status === 'POSTERGADO'
            ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            : undefined,
      })

      if (!result.success) {
        setLocalGroupedLeads(previousGroups)
        setError(result.error)
        setPendingLeadId(null)
        return
      }

      setPendingLeadId(null)
      router.refresh()
    })
  }

  const handleDelete = (lead: LeadPipelineLead) => {
    const previousGroups = cloneGroups(localGroupedLeads)
    setError(null)
    setPendingLeadId(lead.id)
    setLocalGroupedLeads((current) => removeLead(current, lead.id))

    startTransition(async () => {
      const result = await deleteLead(lead.id)

      if (!result.success) {
        setLocalGroupedLeads(previousGroups)
        setError(result.error)
        setPendingLeadId(null)
        return
      }

      setPendingLeadId(null)
      router.refresh()
    })
  }

  return (
    <div className="space-y-5">
      {error ? (
        <div className="rounded-[24px] border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      ) : null}

      <div className="overflow-x-auto pb-2">
        <div className="flex min-w-max gap-4">
          {ACTIVE_PIPELINE_STATUSES.map((status) => (
            <section
              key={status}
              className="flex min-h-[420px] w-[320px] flex-col rounded-[26px] border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl"
            >
              <div
                className={[
                  'rounded-2xl border border-white/10 bg-gradient-to-br px-4 py-3',
                  statusTone(status),
                ].join(' ')}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.22em] text-white/55">
                      Pipeline
                    </p>
                    <h3 className="mt-1 text-sm font-semibold text-white">
                      {STATUS_LABELS[status]}
                    </h3>
                  </div>

                  <div className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-xs font-medium text-white/85">
                    {localGroupedLeads[status].length}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex-1 space-y-3">
                {localGroupedLeads[status].length > 0 ? (
                  localGroupedLeads[status].map((lead) => (
                    <LeadCard
                      key={lead.id}
                      lead={lead}
                      isPending={pendingLeadId === lead.id}
                      onMoveStatus={handleMoveStatus}
                      onDelete={handleDelete}
                    />
                  ))
                ) : (
                  <EmptyState
                    icon={Inbox}
                    title="Sin leads en esta etapa"
                    description="Cuando muevas prospectos por el pipeline van a aparecer aca."
                  />
                )}
              </div>
            </section>
          ))}
        </div>
      </div>

      <section className="rounded-[26px] border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl">
        <button
          type="button"
          onClick={() => setShowArchived((current) => !current)}
          className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-left transition-colors hover:bg-black/30"
        >
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">
              Seccion secundaria
            </p>
            <h3 className="mt-1 text-sm font-semibold text-white">Perdidos y postergados</h3>
          </div>

          <div className="flex items-center gap-3">
            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-zinc-200">
              {archivedCount}
            </span>
            <ChevronDown
              className={[
                'h-4 w-4 text-zinc-400 transition-transform duration-200',
                showArchived ? 'rotate-180' : '',
              ].join(' ')}
            />
          </div>
        </button>

        {showArchived ? (
          <div className="mt-4 overflow-x-auto pb-2">
            <div className="flex min-w-max gap-4">
              {ARCHIVED_PIPELINE_STATUSES.map((status) => (
                <section
                  key={status}
                  className="flex min-h-[300px] w-[320px] flex-col rounded-[24px] border border-white/10 bg-black/20 p-4"
                >
                  <div
                    className={[
                      'rounded-2xl border border-white/10 bg-gradient-to-br px-4 py-3',
                      statusTone(status),
                    ].join(' ')}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <h4 className="text-sm font-semibold text-white">{STATUS_LABELS[status]}</h4>
                      <span className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-xs text-white/85">
                        {localGroupedLeads[status].length}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex-1 space-y-3">
                    {localGroupedLeads[status].length > 0 ? (
                      localGroupedLeads[status].map((lead) => (
                        <LeadCard
                          key={lead.id}
                          lead={lead}
                          isPending={pendingLeadId === lead.id}
                          onMoveStatus={handleMoveStatus}
                          onDelete={handleDelete}
                        />
                      ))
                    ) : (
                      <EmptyState
                        icon={Inbox}
                        title="Sin leads archivados"
                        description="Esta columna va a mostrar los leads perdidos o postergados."
                      />
                    )}
                  </div>
                </section>
              ))}
            </div>
          </div>
        ) : null}
      </section>
    </div>
  )
}
