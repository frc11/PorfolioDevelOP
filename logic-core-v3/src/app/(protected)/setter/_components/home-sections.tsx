import Link from 'next/link'
import {
  ArrowRight,
  ArrowUpNarrowWide,
  CalendarClock,
  Flame,
  OctagonAlert,
  Pin,
  StickyNote,
} from 'lucide-react'
import { Badge, Callout, Card } from '@/components/ui'
import { cn } from '@/lib/utils'
import {
  archivoMotivo,
  formatFechaCorta,
  motivoOrden,
  type HomeLead,
} from '@/lib/leados/flow'
import { LeadCardActions } from './lead-card-actions'

/**
 * Card de lead de la cartera. Desde 2.1a el home es "modo dirección" (un lead a
 * la vez, ver `FocoSurface`); esta card ya no arma colas/tablero — se usa en la
 * cartera SECUNDARIA (`CarteraView`) como ítem de la lista plana de búsqueda.
 */
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
  // A-09: por qué causa real está archivado — visible sin abrir el lead.
  const archivo = archivoMotivo(lead)

  return (
    <Card
      variant="interactive"
      padding="md"
      // P22 — marca de medición, mismo recurso que `data-slot="item-cola"` de la
      // cola: deja contar tarjetas sin depender de la estructura del grid, que
      // este sprint cambió al agrupar.
      data-slot="tarjeta-cartera"
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

      {/* El cuerpo navega al lead; las palancas (abajo) quedan fuera del Link. */}
      <Link
        href={`/setter/leads/${lead.id}`}
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
            {/* P22 — acá había también un badge de ETAPA («En revisión»,
                «Aprobada», «Ficha»…). Decía lo mismo que la fila de próxima
                acción de más abajo, pero en jerga de la máquina de estados: para
                los 84 leads eran 84 rótulos que el setter tiene que traducir para
                leer lo que la fila de abajo ya le dice en su idioma («Le toca a
                Franco — está revisando tu demo»). Y desde que la cartera agrupa,
                el encabezado del grupo lo dice una tercera vez. Queda la fila.
                El de «Caliente» se queda: no es etapa, es una señal que no está
                escrita en ningún otro lado de la tarjeta. */}
            {lead.caliente && (
              <Badge tone="amber" variant="soft" pulse icon={<Flame size={10} strokeWidth={1.5} />}>
                Caliente
              </Badge>
            )}
          </div>
        </div>

        {meta && <p className="mt-1 truncate text-xs text-zinc-600">{meta}</p>}

        {archivo?.motivo && (
          <p className="mt-1.5 line-clamp-2 text-[11px] leading-relaxed text-zinc-500">
            <span className="font-semibold text-zinc-400">
              {archivo.causa === 'descartado' ? 'Motivo:' : 'Nota del cierre:'}
            </span>{' '}
            {archivo.motivo}
          </p>
        )}

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
              <p className="line-clamp-2">
                <span className="font-semibold text-rose-200">Qué:</span>{' '}
                {lead.ultimoRechazo.motivo}
              </p>
              {lead.ultimoRechazo.donde && (
                <p className="line-clamp-2">
                  <span className="font-semibold text-rose-200">Dónde:</span>{' '}
                  {lead.ultimoRechazo.donde}
                </p>
              )}
              {lead.ultimoRechazo.arreglo && (
                <p className="line-clamp-2">
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
        // P22 — `snoozed` (la pausa VIGENTE) además de la fecha. Los controles
        // decidían "está pausado" con `snoozedUntil !== null`, que también es
        // cierto para una pausa YA VENCIDA: medido en el estado real, la primera
        // tarjeta ofrecía «Cambiar la pausa» y «Reanudar» sobre un lead que el
        // filtro «Pausados por vos» contaba como 0 y cuyo propio cuerpo no
        // mostraba la línea «Pausado hasta el…» (esa sí mira `snoozed`).
        snoozed={lead.snoozed}
        snoozedUntil={lead.snoozedUntil}
        note={lead.note}
      />
    </Card>
  )
}
