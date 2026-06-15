'use client'

import { useMemo, useState } from 'react'
import { groupLeads, type LeadPipelineLead } from './lead-pipeline.shared'
import {
  EMPTY_LEAD_FILTERS,
  applyLeadFilters,
  countActiveLeads,
  deriveFilterOptions,
  type LeadFilters,
} from './lead-filters'
import { LeadFiltersBar } from './lead-filters-bar'
import { LeadPipeline } from './lead-pipeline'

type OutboundLeadsViewProps = {
  leads: LeadPipelineLead[]
}

/**
 * Vista OUTBOUND: barra de filtros (client-side, dinámica) + board. Filtra TODOS los
 * leads en AND, reagrupa lo filtrado y se lo pasa al board (conteos de columna + total
 * "Leads activos" reflejan lo filtrado; el DnD opera sobre el subconjunto filtrado).
 */
export function OutboundLeadsView({ leads }: OutboundLeadsViewProps) {
  const [filters, setFilters] = useState<LeadFilters>(EMPTY_LEAD_FILTERS)

  const options = useMemo(() => deriveFilterOptions(leads), [leads])
  const filtered = useMemo(() => applyLeadFilters(leads, filters), [leads, filters])
  const grouped = useMemo(() => groupLeads(filtered), [filtered])
  const activeCount = useMemo(() => countActiveLeads(filtered), [filtered])

  const handleChange = (patch: Partial<LeadFilters>) =>
    setFilters((current) => ({ ...current, ...patch }))
  const handleReset = () => setFilters(EMPTY_LEAD_FILTERS)

  return (
    <div className="space-y-4">
      <LeadFiltersBar
        filters={filters}
        options={options}
        activeCount={activeCount}
        onChange={handleChange}
        onReset={handleReset}
      />
      <LeadPipeline groupedLeads={grouped} />
    </div>
  )
}
