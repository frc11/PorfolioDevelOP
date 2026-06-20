import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import {
  ArrowRight,
  ArrowUpNarrowWide,
  Archive,
  CalendarClock,
  Flame,
  OctagonAlert,
  Pin,
  PlayCircle,
  StickyNote,
} from 'lucide-react'
import { Badge, Callout, Card } from '@/components/ui'
import { cn } from '@/lib/utils'
import { stageTone } from '@/lib/leados-ui'
import {
  formatFechaCorta,
  motivoOrden,
  STAGE_LABELS,
  STATUS_LABELS,
  type HomeLead,
} from '@/lib/leados/flow'
import type { ColaKey } from '@/lib/leados/recorrido'
import { LeadCardActions } from './lead-card-actions'

function diasDesde(fecha: Date): string {
  const dias = Math.floor((Date.now() - fecha.getTime()) / 86_400_000)
  if (dias <= 0) return 'hoy'
  if (dias === 1) return 'ayer'
  return `hace ${dias} días`
}

export function LeadCard({ lead }: { lead: HomeLead }) {
  const meta = [lead.industry, lead.zone, diasDesde(lead.createdAt)]
    .filter(Boolean)
    .join(' · ')
  // Por qué esta card está donde está: lee el criterio de orden ya calculado
  // (mismos tiers que el sort), no lo recalcula. Neutral por disciplina B9:
  // es informativo, el cyan queda para lo accionable.
  const ordenLabel = motivoOrden(lead)

  return (
    <Card
      variant="interactive"
      padding="md"
      className={cn(
        'flex h-full flex-col overflow-hidden',
        lead.accionable && 'border-cyan-400/25 hover:border-cyan-400/40',
        lead.pinned && 'border-cyan-400/30',
      )}
    >
      {/* Acento de accionabilidad: cyan = hacé esto ahora · neutro = esperando. */}
      <span
        aria-hidden
        className={cn(
          'absolute inset-y-0 left-0 w-1',
          lead.accionable ? 'bg-cyan-400/80' : 'bg-white/[0.06]',
        )}
      />

      {/* El cuerpo navega al lead; las palancas (abajo) quedan fuera del Link.
          `data-lead-card`: ancla que el teclado (j/k) enfoca para recorrer las
          cards — foco DOM real, accesible, sin estado de selección paralelo. */}
      <Link
        href={`/setter/leads/${lead.id}`}
        data-lead-card
        className="block rounded-lg outline-none transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400/40"
      >
        <div className="flex items-start justify-between gap-3">
          <h3 className="min-w-0 truncate text-sm font-semibold text-zinc-100">
            {lead.businessName}
          </h3>
          <div className="flex shrink-0 items-center gap-1.5">
            {lead.pinned && (
              <Pin size={13} strokeWidth={1.5} aria-label="Fijado" className="text-cyan-400" />
            )}
            {lead.caliente && (
              <Badge tone="amber" variant="soft" pulse icon={<Flame size={10} strokeWidth={1.5} />}>
                Caliente
              </Badge>
            )}
            {lead.status === 'PERDIDO' ? (
              <Badge tone="rose" variant="soft">{STATUS_LABELS.PERDIDO}</Badge>
            ) : lead.stage ? (
              <Badge tone={stageTone(lead.stage)} variant="soft">
                {STAGE_LABELS[lead.stage]}
              </Badge>
            ) : (
              <Badge tone="zinc" variant="outline">Sin ficha</Badge>
            )}
          </div>
        </div>

        {meta && <p className="mt-1 truncate text-xs text-zinc-600">{meta}</p>}

        {lead.snoozed && lead.snoozedUntil && (
          <p className="mt-2 inline-flex items-center gap-1 rounded-md bg-white/[0.03] px-1.5 py-0.5 text-[11px] font-medium text-zinc-400">
            <CalendarClock size={11} strokeWidth={1.5} aria-hidden className="shrink-0" />
            Pausado hasta el {formatFechaCorta(lead.snoozedUntil.toISOString())}
          </p>
        )}

        {/* Nota privada del setter — sólo él la ve; neutra, no compite con el CTA. */}
        {lead.note && (
          <p className="mt-2 flex items-start gap-1.5 rounded-md bg-white/[0.03] px-2 py-1 text-[11px] leading-relaxed text-zinc-400">
            <StickyNote size={11} strokeWidth={1.5} aria-hidden className="mt-0.5 shrink-0 text-zinc-500" />
            <span className="line-clamp-2">{lead.note}</span>
          </p>
        )}

        {/* Por qué está acá en la lista: rótulo del criterio de orden real. */}
        {ordenLabel && (
          <div className="mt-2">
            <span className="inline-flex items-center gap-1 rounded-md bg-white/[0.03] px-1.5 py-0.5 text-[11px] font-medium text-zinc-500">
              <ArrowUpNarrowWide
                size={11}
                strokeWidth={1.5}
                aria-hidden
                className="shrink-0 text-zinc-600"
              />
              {ordenLabel}
            </span>
          </div>
        )}

        {/* Próxima acción: el elemento más fuerte de la card — qué hacer ahora salta solo. */}
        <div
          className={cn(
            'mt-3 flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium',
            lead.accionable
              ? 'bg-cyan-500/10 text-cyan-200'
              : 'bg-white/[0.03] text-zinc-400',
          )}
        >
          <ArrowRight size={14} strokeWidth={1.5} className="shrink-0" />
          <span className="min-w-0">{lead.proximaAccion}</span>
        </div>

        {lead.stage === 'RECHAZADA' && lead.ultimoRechazo && (
          <Callout tone="danger" accent icon={OctagonAlert} title="Franco pidió cambios" className="mt-3">
            <div className="space-y-1 text-zinc-300">
              <p>
                <span className="font-semibold text-rose-200">Qué:</span>{' '}
                {lead.ultimoRechazo.motivo}
              </p>
              {lead.ultimoRechazo.donde && (
                <p>
                  <span className="font-semibold text-rose-200">Dónde:</span>{' '}
                  {lead.ultimoRechazo.donde}
                </p>
              )}
              {lead.ultimoRechazo.arreglo && (
                <p>
                  <span className="font-semibold text-rose-200">Arreglo:</span>{' '}
                  {lead.ultimoRechazo.arreglo}
                </p>
              )}
            </div>
          </Callout>
        )}
      </Link>

      {/* Organización propia del setter — fuera del Link para no navegar al usarla. */}
      <LeadCardActions
        leadId={lead.id}
        pinned={lead.pinned}
        snoozedUntil={lead.snoozedUntil}
        note={lead.note}
      />
    </Card>
  )
}

type GroupSectionProps = {
  icon: LucideIcon
  titulo: string
  descripcion: string
  vacio: string
  leads: HomeLead[]
  destacado?: boolean
  /**
   * Si se pasa, la sección ofrece "Recorrer": abre el primer lead de la cola con
   * `?cola=…` y habilita prev/next en el detalle (sin volver al home). Solo para
   * las colas de trabajo real — las de espera no lo necesitan.
   */
  cola?: ColaKey
}

export function GroupSection({
  icon: Icon,
  titulo,
  descripcion,
  vacio,
  leads,
  destacado = false,
  cola,
}: GroupSectionProps) {
  // Recorrer tiene sentido con 2+ leads: encadenar uno solo es entrar y salir.
  const recorrible = cola !== undefined && leads.length >= 2

  return (
    <section
      aria-label={titulo}
      className={cn(
        // "Para trabajar ahora" / "Fijados" son carriles prioritarios: se separan
        // de las esperas por ELEVACIÓN (superficie elevada + sombra), no por color
        // — el cyan queda libre para las cards accionables.
        destacado &&
          'rounded-2xl bg-white/[0.02] p-4 shadow-[0_8px_30px_rgba(0,0,0,0.25)] ring-1 ring-inset ring-white/[0.08] sm:p-5',
      )}
    >
      <div className="mb-3 flex items-center gap-2.5">
        <Icon
          size={16}
          strokeWidth={1.5}
          className={destacado ? 'text-cyan-400' : 'text-zinc-500'}
        />
        <h2 className="text-sm font-semibold text-zinc-200">{titulo}</h2>
        <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-medium tabular-nums text-zinc-400">
          {leads.length}
        </span>
        <p className="hidden truncate text-xs text-zinc-600 sm:block">{descripcion}</p>
        {recorrible && (
          <Link
            href={`/setter/leads/${leads[0].id}?cola=${cola}`}
            className="ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-cyan-400/20 bg-cyan-500/10 px-2.5 py-1 text-[11px] font-medium text-cyan-200 outline-none transition-colors hover:bg-cyan-500/15 hover:text-cyan-100 focus-visible:ring-2 focus-visible:ring-cyan-400/40"
          >
            <PlayCircle size={13} strokeWidth={1.5} aria-hidden className="shrink-0" />
            Recorrer
          </Link>
        )}
      </div>

      {leads.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-white/[0.06] px-4 py-5 text-xs text-zinc-600">
          {vacio}
        </p>
      ) : (
        <div className="grid items-start gap-3 sm:grid-cols-2">
          {leads.map((lead) => (
            <LeadCard key={lead.id} lead={lead} />
          ))}
        </div>
      )}
    </section>
  )
}

/** Sección colapsada al fondo (pausados, descartados/perdidos): sin ruido. */
export function CollapsibleSection({
  icon: Icon,
  titulo,
  leads,
}: {
  icon: LucideIcon
  titulo: string
  leads: HomeLead[]
}) {
  if (leads.length === 0) return null

  return (
    <details className="group">
      <summary className="flex cursor-pointer list-none items-center gap-2.5 rounded-2xl border border-white/[0.06] bg-white/[0.015] px-4 py-3 text-xs font-medium text-zinc-500 transition-colors hover:text-zinc-300 [&::-webkit-details-marker]:hidden">
        <Icon size={14} strokeWidth={1.5} />
        {titulo} ({leads.length})
        <span className="ml-auto text-zinc-600 transition-transform group-open:rotate-90">›</span>
      </summary>
      <div className="mt-3 grid items-start gap-3 sm:grid-cols-2">
        {leads.map((lead) => (
          <LeadCard key={lead.id} lead={lead} />
        ))}
      </div>
    </details>
  )
}

/** Descartados y perdidos: colapsados al fondo. Atajo sobre CollapsibleSection. */
export function ArchiveSection({ leads }: { leads: HomeLead[] }) {
  return <CollapsibleSection icon={Archive} titulo="Descartados y perdidos" leads={leads} />
}
