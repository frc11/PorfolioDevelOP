'use client'

import type { ReactNode } from 'react'
import { Inbox } from 'lucide-react'
import { EmptyStateMuted } from '@/components/ui/EmptyStateMuted'
import { cn } from '@/lib/utils'
import { CLASS_META, type LeadClass } from './classes'
import type { LeadWithScore } from '../ClientLeadsTable'

// === TUNABLES (calibrá por ojo) ===
const COLUMN_FADE_HEIGHT = 56 // alto del desvanecimiento inferior del cuerpo (px)
// Las cards del cliente (BusinessLeadCard) son ALTAS — montamos pocas y el resto
// vive en el overview, para no dejar targets tabbables invisibles bajo la máscara.
const MAX_VISIBLE_CARDS = 2 // máx de cards RENDERIZADAS por columna (admin usa 3, cards más chicas)
const HINT_MIN_LEADS = 2 // desde cuántos leads se muestra el hint de "ver todas"

// El cuerpo NO scrollea (la rueda siempre scrollea la página). Se renderizan como
// mucho MAX_VISIBLE_CARDS cards; si el contenido excede el alto fijo, la última se
// desvanece (mask-image) y el hint "Ver los N →" abre el overview con todas.
const COLUMN_BODY_FADE = `linear-gradient(to bottom, #000 calc(100% - ${COLUMN_FADE_HEIGHT}px), transparent)`

type LeadPipelineColumnProps = {
  leadClass: LeadClass
  leads: LeadWithScore[]
  /** Alto fijo del cuerpo (px) — sin scroll interno. Provisto por el padre. */
  bodyMaxHeight: number
  /** Click en el header o en el hint → abre el overview de la columna. */
  onOpenOverview: (leadClass: LeadClass) => void
  /** Render de cada card (compartido con el overview). */
  renderCard: (lead: LeadWithScore) => ReactNode
}

/**
 * Columna presentacional del pipeline de contactos por clasificación. Porta el
 * chrome de `PipelineColumn` del admin (header con tono + label + count, cuerpo de
 * alto fijo SIN scroll con fade, hint de expandir) pero SIN drag-and-drop: es
 * estática. No conoce los datos más allá de su clase.
 */
export function LeadPipelineColumn({
  leadClass,
  leads,
  bodyMaxHeight,
  onOpenOverview,
  renderCard,
}: LeadPipelineColumnProps) {
  const meta = CLASS_META[leadClass]
  const Icon = meta.icon
  const visibleLeads = leads.slice(0, MAX_VISIBLE_CARDS)
  const showFade = leads.length > 0
  const showExpandHint = leads.length >= HINT_MIN_LEADS

  return (
    <section className="flex h-full min-w-0 flex-col rounded-[26px] border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl">
      <button
        type="button"
        onClick={() => onOpenOverview(leadClass)}
        aria-label={`Ver todos los contactos ${meta.label}`}
        className={cn(
          'block w-full rounded-2xl border border-white/10 bg-gradient-to-br px-4 py-3 text-left transition-[filter] hover:brightness-110',
          meta.tone,
        )}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <Icon className="h-4 w-4 shrink-0 text-white/80" strokeWidth={1.5} aria-hidden />
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.22em] text-white/55">Contactos</p>
              <h3 className="mt-0.5 truncate text-sm font-semibold text-white">{meta.label}</h3>
            </div>
          </div>

          <div className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-xs font-medium text-white/85">
            {leads.length}
          </div>
        </div>
      </button>

      <div
        // Alto FIJO + overflow-hidden: sin scroll interno → la rueda scrollea la
        // página. px-2/py-1 dan aire para que el hover de la card no se recorte.
        className="mt-4 space-y-4 overflow-hidden px-2 py-1"
        style={{
          height: bodyMaxHeight,
          ...(showFade ? { maskImage: COLUMN_BODY_FADE, WebkitMaskImage: COLUMN_BODY_FADE } : null),
        }}
      >
        {leads.length > 0 ? (
          visibleLeads.map((lead) => renderCard(lead))
        ) : (
          <EmptyStateMuted
            icon={Inbox}
            title="Sin contactos"
            description="No hay contactos de este nivel con los filtros actuales."
            className="py-10"
          />
        )}
      </div>

      {showExpandHint ? (
        <button
          type="button"
          onClick={() => onOpenOverview(leadClass)}
          className="mt-1 w-full rounded-xl px-3 py-1.5 text-center text-[11px] font-medium text-cyan-300/80 transition-colors hover:bg-cyan-400/10 hover:text-cyan-200"
        >
          Ver los {leads.length} →
        </button>
      ) : null}
    </section>
  )
}
