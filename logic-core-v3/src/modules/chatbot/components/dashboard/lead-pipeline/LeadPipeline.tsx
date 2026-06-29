'use client'

import { useCallback, useMemo, useState } from 'react'
import { CLASS_ORDER, groupByClassification, type LeadClass } from './classes'
import { LeadPipelineColumn } from './LeadPipelineColumn'
import { LeadColumnOverview } from './LeadColumnOverview'
import { BusinessLeadCard } from '../BusinessLeadCard'
import type { LeadWithScore } from '../ClientLeadsTable'

// Alto fijo del cuerpo de cada columna (px). TUNABLE: calibrá por ojo — las cards
// del cliente son altas, así que esto muestra ~1 card entera + el inicio de la
// siguiente bajo el fade; el resto vive en el overview.
const COLUMN_BODY_MAX_H = 540

type LeadPipelineProps = {
  /** Contactos ya filtrados (fecha + estado). Modo comercial con scoring activo. */
  leads: LeadWithScore[]
  /** IDs llegados en el último tick del polling (chip "Nuevo" 6s). */
  freshIds: Set<string>
}

/**
 * Pipeline de contactos del cliente: 3 columnas estáticas por clasificación
 * (Calientes / Tibios / Fríos) con el chrome del kanban admin (columnas con cap +
 * fade + overview portaleado). Reusa BusinessLeadCard. Sin drag-and-drop: la
 * clasificación es derivada del score, no editable a mano. Sólo se monta en la
 * vista comercial cuando el plan incluye priorización (showScoring).
 */
export function LeadPipeline({ leads, freshIds }: LeadPipelineProps) {
  const [overviewClass, setOverviewClass] = useState<LeadClass | null>(null)
  const grouped = useMemo(() => groupByClassification(leads), [leads])

  // Card compartida por columnas y overview. showScoring es true en este modo
  // (el padre sólo monta el pipeline cuando lo es), así que paso el score crudo.
  const renderCard = useCallback(
    (lead: LeadWithScore) => {
      const isHotNew = lead.effectiveClassification === 'hot' && lead.status === 'NEW'
      const classForCard =
        lead.effectiveClassification === 'dq' || lead.effectiveClassification === null
          ? null
          : lead.effectiveClassification
      return (
        <BusinessLeadCard
          key={lead.id}
          lead={lead}
          effectiveScore={lead.effectiveScore}
          effectiveClassification={classForCard}
          decayTierLabel={lead.decayTierLabel}
          highlight={isHotNew}
          isFresh={freshIds.has(lead.id)}
          href={`/dashboard/chatbot/leads/${lead.id}`}
        />
      )
    },
    [freshIds],
  )

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CLASS_ORDER.map((leadClass) => (
          <LeadPipelineColumn
            key={leadClass}
            leadClass={leadClass}
            leads={grouped[leadClass]}
            bodyMaxHeight={COLUMN_BODY_MAX_H}
            onOpenOverview={setOverviewClass}
            renderCard={renderCard}
          />
        ))}
      </div>

      <LeadColumnOverview
        leadClass={overviewClass}
        leads={overviewClass ? grouped[overviewClass] : []}
        renderCard={renderCard}
        onClose={() => setOverviewClass(null)}
      />
    </>
  )
}
