import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import { ArrowRight, Archive, Flame } from 'lucide-react'
import type { DossierStage } from '@prisma/client'
import { Badge, Card } from '@/components/ui'
import { STAGE_LABELS, STATUS_LABELS, type HomeLead } from '@/lib/leados/flow'

const STAGE_TONES: Record<DossierStage, 'cyan' | 'emerald' | 'amber' | 'rose' | 'violet' | 'zinc' | 'blue'> = {
  FICHA: 'zinc',
  EVALUADA: 'blue',
  BRIEF: 'violet',
  CONSTRUCCION: 'amber',
  EN_REVISION: 'cyan',
  APROBADA: 'emerald',
  RECHAZADA: 'rose',
  DESCARTADA: 'zinc',
}

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

  return (
    <Link href={`/setter/leads/${lead.id}`} className="block">
      <Card variant="interactive" padding="md" className="h-full">
        <div className="flex items-start justify-between gap-3">
          <h3 className="min-w-0 truncate text-sm font-semibold text-zinc-100">
            {lead.businessName}
          </h3>
          <div className="flex shrink-0 items-center gap-1.5">
            {lead.caliente && (
              <Badge tone="amber" variant="soft" pulse icon={<Flame size={10} strokeWidth={1.5} />}>
                Caliente
              </Badge>
            )}
            {lead.status === 'PERDIDO' ? (
              <Badge tone="rose" variant="soft">{STATUS_LABELS.PERDIDO}</Badge>
            ) : lead.stage ? (
              <Badge tone={STAGE_TONES[lead.stage]} variant="soft">
                {STAGE_LABELS[lead.stage]}
              </Badge>
            ) : (
              <Badge tone="zinc" variant="outline">Sin ficha</Badge>
            )}
          </div>
        </div>

        {meta && <p className="mt-1 truncate text-xs text-zinc-600">{meta}</p>}

        <p
          className={`mt-3 flex items-center gap-1.5 text-xs font-medium ${
            lead.accionable ? 'text-cyan-300' : 'text-zinc-500'
          }`}
        >
          <ArrowRight size={13} strokeWidth={1.5} className="shrink-0" />
          {lead.proximaAccion}
        </p>

        {lead.stage === 'RECHAZADA' && lead.ultimoRechazo && (
          <div className="mt-3 space-y-1 rounded-xl border border-rose-400/15 bg-rose-500/5 p-3 text-xs leading-5">
            <p className="text-zinc-300">
              <span className="font-semibold text-rose-300">Qué:</span>{' '}
              {lead.ultimoRechazo.motivo}
            </p>
            {lead.ultimoRechazo.donde && (
              <p className="text-zinc-300">
                <span className="font-semibold text-rose-300">Dónde:</span>{' '}
                {lead.ultimoRechazo.donde}
              </p>
            )}
            {lead.ultimoRechazo.arreglo && (
              <p className="text-zinc-300">
                <span className="font-semibold text-rose-300">Arreglo:</span>{' '}
                {lead.ultimoRechazo.arreglo}
              </p>
            )}
          </div>
        )}
      </Card>
    </Link>
  )
}

type GroupSectionProps = {
  icon: LucideIcon
  titulo: string
  descripcion: string
  vacio: string
  leads: HomeLead[]
  destacado?: boolean
}

export function GroupSection({
  icon: Icon,
  titulo,
  descripcion,
  vacio,
  leads,
  destacado = false,
}: GroupSectionProps) {
  return (
    <section aria-label={titulo}>
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
      </div>

      {leads.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-white/[0.06] px-4 py-5 text-xs text-zinc-600">
          {vacio}
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {leads.map((lead) => (
            <LeadCard key={lead.id} lead={lead} />
          ))}
        </div>
      )}
    </section>
  )
}

/** Descartados y perdidos: colapsados al fondo, sin ruido. */
export function ArchiveSection({ leads }: { leads: HomeLead[] }) {
  if (leads.length === 0) return null

  return (
    <details className="group">
      <summary className="flex cursor-pointer list-none items-center gap-2.5 rounded-2xl border border-white/[0.06] bg-white/[0.015] px-4 py-3 text-xs font-medium text-zinc-500 transition-colors hover:text-zinc-300 [&::-webkit-details-marker]:hidden">
        <Archive size={14} strokeWidth={1.5} />
        Descartados y perdidos ({leads.length})
        <span className="ml-auto text-zinc-600 transition-transform group-open:rotate-90">›</span>
      </summary>
      <div className="mt-3 grid gap-3 opacity-70 sm:grid-cols-2">
        {leads.map((lead) => (
          <LeadCard key={lead.id} lead={lead} />
        ))}
      </div>
    </details>
  )
}
