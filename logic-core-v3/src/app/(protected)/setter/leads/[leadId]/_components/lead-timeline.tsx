import {
  CircleDashed,
  History,
  Instagram,
  Mail,
  MessageCircleMore,
  PhoneCall,
  Repeat2,
  Video,
} from 'lucide-react'
import type { ActivityChannel, ActivityResult } from '@prisma/client'
import { Badge, Card } from '@/components/ui'
import { esContactoComercial } from '@/lib/leados/isolation'
import {
  canalEtiqueta,
  formatearMomento,
  resultadoEtiqueta,
  resultadoTono,
} from './lead-timeline.helpers'

/**
 * Ícono del canal como JSX estático (cada `case` rinde un componente de
 * módulo, no uno creado en render — cumple `react-hooks/static-components`).
 */
function IconoCanal({ channel }: { channel: ActivityChannel }) {
  const props = { size: 11, strokeWidth: 1.5, 'aria-hidden': true } as const
  switch (channel) {
    case 'INSTAGRAM_DM':
      return <Instagram {...props} />
    case 'WHATSAPP':
      return <MessageCircleMore {...props} />
    case 'EMAIL':
      return <Mail {...props} />
    case 'LLAMADA':
      return <PhoneCall {...props} />
    case 'LOOM_VIDEO':
      return <Video {...props} />
    case 'SISTEMA':
      return <Repeat2 {...props} />
    case 'OTRO':
      return <CircleDashed {...props} />
  }
}

export type LeadTimelineEvent = {
  id: string
  channel: ActivityChannel
  result: ActivityResult | null
  notes: string | null
  /** ISO — serializado en la page (server). */
  createdAt: string
  performedByName: string | null
}

/**
 * Memoria del lead: la cronología de TODO lo que pasó — contactos comerciales y
 * eventos de sistema (reasignación). Presentación pura (Server Component): solo
 * muestra lo que ya vive en `OsLeadActivity`, no registra nada. La distinción
 * comercial / sistema es visual y explícita; el evento de sistema NO cuenta como
 * contacto (su conteo lo gobierna otra lectura — ver timeline.ts / invariante).
 */
export function LeadTimeline({ events }: { events: LeadTimelineEvent[] }) {
  return (
    <Card variant="subtle" padding="lg" className="space-y-4">
      <div className="flex items-center gap-2.5">
        <History size={15} strokeWidth={1.5} className="text-zinc-500" aria-hidden />
        <div>
          <h2 className="text-base font-semibold text-zinc-100">Historial del lead</h2>
          <p className="text-xs text-zinc-500">
            La memoria del lead — contactos y movimientos, del más nuevo al más viejo.
          </p>
        </div>
      </div>

      {events.length === 0 ? (
        <p className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-xs leading-relaxed text-zinc-600">
          Todavía sin movimientos registrados. Cuando registres un contacto —o el lead
          se reasigne— vas a ver acá la cronología completa.
        </p>
      ) : (
        <ol className="relative space-y-4 pl-6">
          <span
            aria-hidden
            className="absolute bottom-1 left-[11px] top-1 w-px bg-white/10"
          />
          {events.map((event) => (
            <TimelineRow key={event.id} event={event} />
          ))}
        </ol>
      )}
    </Card>
  )
}

function TimelineRow({ event }: { event: LeadTimelineEvent }) {
  const esSistema = !esContactoComercial(event.channel)

  return (
    <li className="relative">
      {/* Nodo: comercial = sólido; sistema = anillo punteado, lectura "no es un contacto". */}
      <span
        aria-hidden
        className={[
          'absolute -left-[19px] top-1 flex h-5 w-5 items-center justify-center rounded-full bg-zinc-950',
          esSistema
            ? 'border border-dashed border-zinc-600 text-zinc-500'
            : 'border border-white/15 text-zinc-300',
        ].join(' ')}
      >
        <IconoCanal channel={event.channel} />
      </span>

      <div
        className={[
          'rounded-xl border p-3',
          esSistema
            ? 'border-dashed border-white/[0.08] bg-white/[0.015]'
            : 'border-white/[0.07] bg-white/[0.025]',
        ].join(' ')}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-semibold ${esSistema ? 'text-zinc-400' : 'text-zinc-200'}`}
            >
              {canalEtiqueta(event.channel)}
            </span>
            {esSistema && (
              <Badge tone="zinc" variant="outline" size="xs">
                Sistema
              </Badge>
            )}
          </div>

          {/* El evento de sistema no tiene resultado comercial: la nota lleva el detalle. */}
          {!esSistema && event.result !== null && (
            <Badge tone={resultadoTono(event.result)} variant="soft" size="xs">
              {resultadoEtiqueta(event.result)}
            </Badge>
          )}
        </div>

        <p className="mt-1 text-[11px] text-zinc-500">{formatearMomento(event.createdAt)}</p>

        {event.notes && (
          <p className="mt-2 whitespace-pre-wrap break-words text-xs leading-relaxed text-zinc-300">
            {event.notes}
          </p>
        )}

        {esSistema ? (
          <p className="mt-2 text-[11px] italic text-zinc-600">
            Evento del sistema — no cuenta como contacto comercial.
          </p>
        ) : (
          event.performedByName && (
            <p className="mt-2 text-[11px] text-zinc-600">{event.performedByName}</p>
          )
        )}
      </div>
    </li>
  )
}
