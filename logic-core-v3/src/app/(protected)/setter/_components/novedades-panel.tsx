import type { LucideIcon } from 'lucide-react'
import {
  ArrowLeftRight,
  Bell,
  CheckCircle2,
  Clock3,
  Inbox,
  OctagonAlert,
} from 'lucide-react'
import type { OsSetterNoticeKind } from '@prisma/client'
import { cn } from '@/lib/utils'
import type { AvisoView, NovedadesView } from '@/lib/leados/novedades'
import { AbrirFocoButton } from './novedades-abrir-foco'
import { MarcarVistoButton } from './novedades-marcar-visto'

/**
 * "Novedades": el setter dejó de volver a ciegas. Reúne dos cosas distintas:
 *   - los AVISOS dirigidos sin leer (te asignaron / Franco aprobó-rechazó / te
 *     sacaron un lead) → "qué cambió desde tu última visita", con badge;
 *   - el RESUMEN de la cola en revisión (live) → "cuántas demos esperan a Franco
 *     y hace cuánto la más vieja".
 * A-06: ambas INFORMAN, no reconstituyen una segunda cola. El "Abrir" de un aviso
 * ANCLA el lead como foco (mismo mecanismo que "Ir a trabajarlo"), y la revisión
 * es un agregado — a esas demos se llega por la cartera (filtro «Esperando
 * revisión»), no por una lista navegable propia.
 * Server component: la data llega ya formateada desde `getNovedadesSetter`. Si no
 * hay nada que mostrar, no renderiza (cero ruido). El acento cyan queda para lo
 * accionable; cada tipo lleva su color semántico en el borde.
 */
const KIND_META: Record<
  OsSetterNoticeKind,
  { icon: LucideIcon; accent: string; iconColor: string }
> = {
  LEAD_ASIGNADO: { icon: Inbox, accent: 'bg-cyan-400/70', iconColor: 'text-cyan-300' },
  DEMO_APROBADA: {
    icon: CheckCircle2,
    accent: 'bg-emerald-400/70',
    iconColor: 'text-emerald-300',
  },
  DEMO_RECHAZADA: {
    icon: OctagonAlert,
    accent: 'bg-rose-400/70',
    iconColor: 'text-rose-300',
  },
  LEAD_REASIGNADO_SALIENTE: {
    icon: ArrowLeftRight,
    accent: 'bg-zinc-400/50',
    iconColor: 'text-zinc-400',
  },
}

function AvisoItem({ aviso }: { aviso: AvisoView }) {
  const meta = KIND_META[aviso.kind]
  const Icon = meta.icon

  return (
    <li className="relative overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
      <span aria-hidden className={cn('absolute inset-y-0 left-0 w-1', meta.accent)} />
      <div className="flex items-start gap-3 pl-2">
        <Icon
          size={16}
          strokeWidth={1.5}
          aria-hidden
          className={cn('mt-0.5 shrink-0', meta.iconColor)}
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-zinc-100">{aviso.title}</p>
          <p className="mt-0.5 text-xs leading-relaxed text-zinc-400">{aviso.body}</p>
          <div className="mt-1.5 flex items-center gap-3">
            <span className="text-[11px] tabular-nums text-zinc-600">{aviso.hace}</span>
            {/* A-06: "Abrir" ANCLA el lead como foco y navega — no es un link
                directo que reconstituye una cola paralela. El saliente (sin
                `leadId`) no ofrece acción: solo informa. */}
            {aviso.leadId && <AbrirFocoButton leadId={aviso.leadId} />}
          </div>
        </div>
      </div>
    </li>
  )
}

export function NovedadesPanel({ novedades }: { novedades: NovedadesView }) {
  const { avisos, revision, totalSinLeer } = novedades

  // Nada que mostrar → el panel desaparece (no es una superficie permanente).
  if (avisos.length === 0 && !revision) return null

  return (
    <section
      aria-label="Novedades de tu cartera"
      className="rounded-2xl bg-white/[0.02] p-4 shadow-[0_8px_30px_rgba(0,0,0,0.25)] ring-1 ring-inset ring-white/[0.08] sm:p-5"
    >
      <div className="mb-3 flex flex-wrap items-center gap-2.5">
        <Bell size={16} strokeWidth={1.5} className="text-cyan-400" aria-hidden />
        <h2 className="text-sm font-semibold text-zinc-200">Novedades</h2>
        {totalSinLeer > 0 && (
          <span className="rounded-full bg-cyan-500/15 px-2 py-0.5 text-[10px] font-semibold tabular-nums text-cyan-300">
            {totalSinLeer}
          </span>
        )}
        <p className="hidden truncate text-xs text-zinc-600 sm:block">
          Qué cambió desde tu última visita
        </p>
        {/* "Marcar vistas" marca TODO lo sin leer → se ata a `totalSinLeer`, no a
            la lista visible: tras el dedup del foco (2.2) la lista puede quedar
            vacía y aún haber un aviso sin leer (el del foco) para limpiar. */}
        {totalSinLeer > 0 && <MarcarVistoButton className="ml-auto" />}
      </div>

      {avisos.length > 0 && (
        <ul className="space-y-2">
          {avisos.map((aviso) => (
            <AvisoItem key={aviso.id} aviso={aviso} />
          ))}
        </ul>
      )}

      {/* A-06: RESUMEN, no lista navegable. Informa cuántas demos esperan a Franco
          y hace cuánto la más vieja; a esas demos se llega por la cartera (filtro
          «Esperando revisión», abajo en esta misma página), no por una cola
          propia que compita con el foco. */}
      {revision && (
        <div className={cn('space-y-2', avisos.length > 0 && 'mt-4')}>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-600">
            Tus demos esperando a Franco
          </p>
          <div className="flex items-start gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2">
            <Clock3
              size={13}
              strokeWidth={1.5}
              aria-hidden
              className="mt-0.5 shrink-0 text-violet-300"
            />
            <p className="text-xs leading-relaxed text-zinc-400">
              <span className="font-semibold text-zinc-200">
                {revision.total} {revision.total === 1 ? 'demo' : 'demos'}
              </span>{' '}
              esperando revisión de Franco ·{' '}
              {revision.total === 1 ? 'hace' : 'la más vieja hace'}{' '}
              <span className="tabular-nums">{revision.hace}</span>.
              <span className="mt-0.5 block text-zinc-600">
                Las ves en tu cartera → filtro «Esperando revisión».
              </span>
            </p>
          </div>
        </div>
      )}
    </section>
  )
}
