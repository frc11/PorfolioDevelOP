import Link from 'next/link'
import { ArrowRight, CalendarCheck2, CheckCircle2, Lock, Phone } from 'lucide-react'
import type { LeadStatus } from '@prisma/client'
import { Badge } from '@/components/ui'
import type { Agenda, Ficha } from '@/lib/leados/contracts'
import { formatFechaHora, reunionAgendada, STATUS_LABELS } from '@/lib/leados/flow'
import { GUIA_AGENDA } from '@/lib/leados/guidance-content'
import { rutaManual } from '@/lib/leados/manual'
import { LineaRicaText } from '@/app/(protected)/setter/_components/teach-panel'
import { AgendaForm } from './agenda-form'

/**
 * M16 — «Agendá la reunión» (5.5, tramo Agenda). PRESENTACIÓN de un booking que
 * ya existe: el gate (`gateAgenda` — RESPONDIO ∧ sin reunión) y el booking real
 * en Cal.com viven en `agenda.actions.ts` (LÍNEA ROJA, intacta). El manual solo
 * decide QUÉ estado mostrar; la action re-valida el gate server-side.
 *   - contexto: el teléfono re-servido (A-14) + el estado del lead;
 *   - munición: el how-to del paso (`GUIA_AGENDA.pasos`) — el orden real de la pantalla;
 *   - registro: los tres estados — reunión ya agendada (resumen del traspaso) /
 *     a la espera del gate RESPONDIO (deshabilitado-con-motivo + salto a M5) /
 *     el form del booking cuando la charla llegó a «sí, reunámonos».
 * El cierre de la reunión (y el paso a CERRADO) lo hace Franco desde admin.
 */

/** Contexto: el teléfono a mano para coordinar el horario + el estado del lead. */
export function M16Contexto({
  status,
  leadPhone,
}: {
  status: LeadStatus
  leadPhone: string | null
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      {leadPhone ? (
        <p className="flex items-center gap-1.5 text-xs text-zinc-500">
          <Phone size={12} strokeWidth={1.5} className="shrink-0" />
          {leadPhone}
        </p>
      ) : (
        <span className="text-xs text-zinc-600">Sin teléfono cargado en la ficha.</span>
      )}
      <Badge tone="zinc" variant="outline">
        {STATUS_LABELS[status]}
      </Badge>
    </div>
  )
}

/** Munición: el how-to del paso (el orden real de la pantalla). El bloque
 * copiable con los horarios reales vive dentro del registro, tras buscarlos. */
export function M16Municion() {
  return (
    <div className="space-y-2">
      <p className="max-w-xl text-xs leading-relaxed text-zinc-500">
        <LineaRicaText linea={GUIA_AGENDA.intro} />
      </p>
      <ol className="space-y-1.5 text-xs leading-relaxed text-zinc-400">
        {GUIA_AGENDA.pasos.map((paso, index) => (
          <li key={paso} className="flex gap-2">
            <span className="font-semibold text-cyan-300/80">{index + 1}.</span>
            {paso}
          </li>
        ))}
      </ol>
    </div>
  )
}

/** El resumen del traspaso cuando la reunión ya está agendada (solo lectura). */
function ReunionAgendada({ agenda, leadPhone }: { agenda: Agenda; leadPhone: string | null }) {
  return (
    <div className="space-y-3 rounded-2xl border border-emerald-400/20 bg-emerald-500/[0.05] p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <CalendarCheck2 size={15} strokeWidth={1.5} className="text-emerald-400" />
          <p className="text-sm font-semibold text-zinc-100">Reunión agendada</p>
        </div>
        <Badge tone="emerald" variant="soft">
          {agenda.slotStart ? formatFechaHora(agenda.slotStart) : 'Confirmada'}
        </Badge>
      </div>

      <div className="space-y-2 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-xs leading-relaxed text-zinc-400">
        {agenda.attendee && (
          <p>
            <span className="font-semibold text-zinc-300">Con:</span> {agenda.attendee.nombre} (
            {agenda.attendee.email}
            {leadPhone ? ` · ${leadPhone}` : ''})
          </p>
        )}
        {agenda.notasTraspaso && (
          <p className="whitespace-pre-wrap">
            <span className="font-semibold text-zinc-300">Tu traspaso:</span> {agenda.notasTraspaso}
          </p>
        )}
        {agenda.calBookingUid && (
          <p className="text-zinc-600">Código de la reserva: {agenda.calBookingUid}</p>
        )}
      </div>

      <p className="flex items-start gap-2 text-xs leading-relaxed text-zinc-500">
        <CheckCircle2 size={14} strokeWidth={1.5} className="mt-0.5 shrink-0 text-emerald-400" />
        <span>
          El evento quedó en el calendario de Franco y Cal.com le mandó la confirmación y el
          recordatorio al prospecto. Franco ya tiene tus notas de traspaso — la reunión la cierra él.
        </span>
      </p>
    </div>
  )
}

/**
 * 6.2 — La memoria de la oferta, leída del MISMO blob que persiste 6.1: los
 * horarios que el prospecto ya tiene en la mano. Solo el estado OFRECIDOS
 * cuenta — un claim `AGENDANDO` es una confirmación en vuelo, no una oferta a
 * la que se pueda volver, y una `AGENDADA` ni llega hasta acá. Sin horarios
 * guardados devuelve undefined: el form arranca virgen, como siempre.
 */
function ofertaPrevia(
  agenda: Agenda | null,
): { horarios: string[]; ofrecidosAt?: string } | undefined {
  if (agenda?.estado !== 'OFRECIDOS') return undefined
  const horarios = agenda.horariosOfrecidos
  if (!horarios || horarios.length === 0) return undefined
  return { horarios, ofrecidosAt: agenda.ofrecidosAt }
}

/** Registro: los tres estados del paso. El gate real (RESPONDIO ∧ sin reunión)
 * vive en `gateAgenda` (agenda.actions.ts), que la action re-valida server-side. */
export function M16Registro({
  leadId,
  status,
  ficha,
  agenda,
  contactName,
  leadEmail,
  leadPhone,
}: {
  leadId: string
  status: LeadStatus
  ficha: Ficha | null
  agenda: Agenda | null
  contactName: string | null
  leadEmail: string | null
  leadPhone: string | null
}) {
  // ── Reunión ya agendada: el resumen del traspaso ───────────────────────────
  if (reunionAgendada(agenda) && agenda) {
    return <ReunionAgendada agenda={agenda} leadPhone={leadPhone} />
  }

  // ── CALL_AGENDADA sin blob de agenda: reunión registrada por otra vía ──────
  if (status === 'CALL_AGENDADA') {
    return (
      <p className="flex items-start gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-xs leading-relaxed text-zinc-500">
        <CheckCircle2 size={14} strokeWidth={1.5} className="mt-0.5 shrink-0 text-emerald-400" />
        <span>
          Este lead figura con reunión agendada (registrada por otra vía). El booking con horarios
          reales vive en este paso para los próximos.
        </span>
      </p>
    )
  }

  // ── Gate cerrado: se agenda cuando el negocio respondió (deshabilitado-con-motivo) ──
  if (status !== 'RESPONDIO') {
    return (
      <div className="space-y-2 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
        <p className="flex items-center gap-2 text-xs font-semibold text-zinc-300">
          <Lock size={13} strokeWidth={1.5} className="text-zinc-500" />
          {GUIA_AGENDA.gate.titulo}
        </p>
        <p className="max-w-xl text-xs leading-relaxed text-zinc-400">
          <LineaRicaText linea={GUIA_AGENDA.gate.detalle} />
        </p>
        {/* La salida del gate: marcar «Respondió» vive en «Registrá lo que pasó» (M5). */}
        <Link
          href={rutaManual(leadId, 'm5')}
          className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] font-medium text-zinc-300 transition-colors hover:bg-white/[0.08] hover:text-zinc-100"
        >
          Ir a «Registrá lo que pasó»
          <ArrowRight size={12} strokeWidth={1.5} aria-hidden />
        </Link>
      </div>
    )
  }

  // ── Gate abierto: el form del booking (la action re-valida el gate igual) ───
  // 6.2 — Re-entrada con memoria: si el lead ya tiene horarios ofrecidos (6.1
  // los persistió en el dossier), el form arranca mostrándolos en vez del
  // buscador vacío. Sin blob OFRECIDOS con horarios, `ofertaPrevia` queda
  // undefined y el flujo virgen es exactamente el de antes.
  return (
    <AgendaForm
      leadId={leadId}
      ficha={ficha}
      contactName={contactName}
      leadEmail={leadEmail}
      ofertaPrevia={ofertaPrevia(agenda)}
    />
  )
}
