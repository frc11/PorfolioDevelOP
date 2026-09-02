import Link from 'next/link'
import { ArrowLeft, ArrowLeftRight, CalendarClock, Check, ExternalLink, Flame } from 'lucide-react'
import type { DossierStage, LeadStatus } from '@prisma/client'
import { Badge } from '@/components/ui'
import { cn } from '@/lib/utils'
import type { CopyBlockLead } from '@/lib/leados/copy-blocks'
import { formatFechaCorta, STAGE_LABELS, STATUS_LABELS } from '@/lib/leados/flow'
import {
  PANTALLAS,
  PANTALLAS_CONSTRUCCION,
  rutaManual,
  type PantallaId,
  type PosicionManual,
} from '@/lib/leados/manual'

const STATUS_TONES: Record<LeadStatus, 'cyan' | 'emerald' | 'amber' | 'rose' | 'violet' | 'zinc' | 'blue'> = {
  PROSPECTO: 'cyan',
  DEMO_ENVIADA: 'violet',
  VIO_VIDEO: 'emerald',
  RESPONDIO: 'blue',
  CALL_AGENDADA: 'amber',
  CERRADO: 'emerald',
  PERDIDO: 'rose',
  POSTERGADO: 'zinc',
}

/** El contexto de cabecera que la página del wizard mostraba y el manual hereda
 * con el corte 5.6: badges, links externos, notas y el rastro de asignación. */
export type CabeceraLead = {
  lead: CopyBlockLead
  status: LeadStatus
  stage: DossierStage | null
  /** Ya con guardrail de stage (`esCaliente`) — listo para el badge. */
  caliente: boolean
  contactName: string | null
  phone: string | null
  notas: string | null
  /** ISO de la última asignación; null si no hay rastro. */
  asignadoEl: string | null
  /**
   * ISO de la reactivación de un POSTERGADO (`lead.reactivateAt`); null si no
   * está postergado. Va en la cabecera —y no en una pantalla— porque es la única
   * superficie que aparece en TODAS: el postergado aterriza donde lo deje su
   * stage (m5, `espera`, …) y la fecha tiene que leerse ahí, sin buscarla.
   */
  reactivateAt: string | null
  /** Esa fecha ya pasó (reloj request-time, resuelto en `_data.ts`). */
  postergadoVencido: boolean
}

/**
 * Cabecera común de toda pantalla del manual (5.6: el manual ES la experiencia
 * del lead): la salida es la cartera, y el contexto completo del lead — badges
 * de estado, links externos, notas y el cartel de asignación — vive acá, como
 * vivía en el header de la página del wizard.
 */
export function ManualHeader({ cabecera }: { cabecera: CabeceraLead }) {
  const {
    lead,
    status,
    stage,
    caliente,
    contactName,
    phone,
    notas,
    asignadoEl,
    reactivateAt,
    postergadoVencido,
  } = cabecera

  const links = [
    { label: 'Instagram', href: lead.instagramUrl },
    { label: 'Web actual', href: lead.currentWebUrl },
    { label: 'Google Maps', href: lead.googleMapsUrl },
  ].filter((link): link is { label: string; href: string } => Boolean(link.href))

  const meta = [contactName, phone, lead.industry, lead.zone].filter(Boolean).join(' · ')

  const fechaAsignacion = asignadoEl
    ? new Intl.DateTimeFormat('es-AR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }).format(new Date(asignadoEl))
    : null

  return (
    <header className="space-y-2 sm:space-y-3">
      <Link
        href="/setter"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 transition-colors hover:text-zinc-300"
      >
        <ArrowLeft size={13} strokeWidth={1.5} aria-hidden />
        Volver a tu día
      </Link>

      <div className="flex flex-wrap items-center gap-3">
        <h1 className="line-clamp-2 text-2xl font-black leading-tight tracking-tight text-white sm:text-3xl">
          {lead.businessName}
        </h1>
        <div className="flex items-center gap-1.5">
          {caliente && (
            <Badge tone="amber" variant="soft" pulse icon={<Flame size={10} strokeWidth={1.5} />}>
              Caliente
            </Badge>
          )}
          <Badge tone={STATUS_TONES[status]} variant="soft">
            {STATUS_LABELS[status]}
          </Badge>
          {stage && (
            <Badge tone="zinc" variant="outline">
              {STAGE_LABELS[stage]}
            </Badge>
          )}
          {/* Al lado de la etiqueta «Postergado», que sola no dice cuándo vuelve.
              Vencido en ámbar (mismo tono que el toque vencido de m5): sin esta
              distinción, un postergado que ya volvió y uno que todavía no se
              leen igual — y con la fecha a la vista el rótulo es verificable. */}
          {status === 'POSTERGADO' && reactivateAt && (
            <span
              className={cn(
                'inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-medium',
                postergadoVencido
                  ? 'bg-amber-500/10 text-amber-300/90'
                  : 'bg-white/[0.04] text-zinc-400',
              )}
            >
              <CalendarClock size={11} strokeWidth={1.5} aria-hidden className="shrink-0" />
              {postergadoVencido
                ? `Se venció el ${formatFechaCorta(reactivateAt)}`
                : `Vuelve el ${formatFechaCorta(reactivateAt)}`}
            </span>
          )}
        </div>
      </div>

      {meta && <p className="text-sm text-zinc-500">{meta}</p>}

      {links.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[11px] font-medium text-zinc-400 transition-colors hover:bg-white/[0.07] hover:text-zinc-200"
            >
              <ExternalLink size={11} strokeWidth={1.5} />
              {link.label}
            </a>
          ))}
        </div>
      )}

      {notas && (
        /* P17 — deja de ser una tarjeta dentro de la cabecera (S1: un solo
           nivel de superficie). El rótulo en negrita ya dice qué es; el marco
           sólo agregaba un nivel más y 24 px. */
        <p className="line-clamp-3 text-xs leading-relaxed text-zinc-500">
          <span className="font-semibold text-zinc-400">Notas del lead:</span> {notas}
        </p>
      )}

      {fechaAsignacion && (
        <p className="flex items-center gap-2 text-xs text-zinc-500">
          <ArrowLeftRight
            size={13}
            strokeWidth={1.5}
            aria-hidden
            className="shrink-0 text-zinc-500"
          />
          <span>
            Te asignaron este lead{' '}
            <span className="font-semibold text-zinc-300">el {fechaAsignacion}</span>
          </span>
        </p>
      )}
    </header>
  )
}

/**
 * Navegación hacia atrás — SIEMPRE libre a pantallas completadas (contrato del
 * mapa): entrar a una completada no resetea nada, solo se mira/ajusta lo que
 * su pantalla permita. Sin completadas no se renderiza (lead recién arrancado).
 */
export function NavAtras({
  leadId,
  pasoActivo,
  posicion,
}: {
  leadId: string
  pasoActivo: PantallaId
  posicion: PosicionManual
}) {
  if (posicion.completadas.length === 0) return null

  return (
    <nav
      aria-label="Pantallas completadas — navegación libre hacia atrás"
      className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4"
    >
      <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">
        Completadas — podés volver cuando quieras
      </p>
      <ul className="mt-2.5 flex flex-wrap gap-2">
        {posicion.completadas.map((id) => {
          const activo = id === pasoActivo
          return (
            <li key={id}>
              <Link
                href={rutaManual(leadId, id)}
                aria-current={activo ? 'page' : undefined}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-medium transition-colors',
                  activo
                    ? 'border-white/25 bg-white/[0.08] text-zinc-100'
                    : 'border-white/10 bg-white/[0.03] text-zinc-400 hover:bg-white/[0.07] hover:text-zinc-200',
                )}
              >
                <Check size={11} strokeWidth={1.5} aria-hidden className="text-zinc-500" />
                {PANTALLAS[id].corto}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

/**
 * El rail de las pantallas de Construcción — navegación LIBRE entre todas, en
 * cualquier orden (auto-reporte, jamás gate: §6-3 del brief). Se muestra en
 * mc1/mc2 y en la reentrada M-R.
 *
 * El copy NO nombra una cantidad a propósito: decía «las seis fases» literal y
 * dejó de ser cierto el día que P6-B las agrupó en dos pantallas. Sin número, la
 * frase sobrevive al próximo reagrupamiento.
 */
export function NavConstruccion({
  leadId,
  pasoActivo,
  posicion,
}: {
  leadId: string
  pasoActivo: PantallaId
  posicion: PosicionManual
}) {
  return (
    <nav
      aria-label="Fases de la construcción — navegación libre"
      className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4"
    >
      <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">
        Construcción — navegación libre
      </p>
      <p className="mt-1 text-xs leading-relaxed text-zinc-600">
        Las fases son auto-reporte: entrá y salí en el orden que te sirva — ninguna bloquea
        a otra.
      </p>
      <ul className="mt-3 flex flex-wrap gap-2">
        {PANTALLAS_CONSTRUCCION.map((id, index) => {
          const completada = posicion.completadas.includes(id)
          const activo = id === pasoActivo
          return (
            <li key={id}>
              <Link
                href={rutaManual(leadId, id)}
                aria-current={activo ? 'page' : undefined}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-medium transition-colors',
                  activo
                    ? 'border-white/25 bg-white/[0.08] text-zinc-100'
                    : 'border-white/10 bg-white/[0.03] text-zinc-400 hover:bg-white/[0.07] hover:text-zinc-200',
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    'text-[10px] font-semibold',
                    activo ? 'text-zinc-300' : 'text-zinc-600',
                  )}
                >
                  {index + 1}
                </span>
                {PANTALLAS[id].corto}
                {completada && (
                  <Check
                    size={11}
                    strokeWidth={1.5}
                    aria-label="Fase marcada como hecha"
                    className="text-emerald-400/80"
                  />
                )}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
