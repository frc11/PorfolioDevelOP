'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  CalendarCheck2,
  CalendarSearch,
  CheckCircle2,
  Lock,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react'
import type { LeadStatus } from '@prisma/client'
import { Badge, Button, Card, Field, Input } from '@/components/ui'
import type { Agenda, Ficha } from '@/lib/leados/contracts'
import { buildHorariosMensajeBlock } from '@/lib/leados/copy-blocks'
import { formatFechaHora, reunionAgendada } from '@/lib/leados/flow'
import {
  confirmarReunion,
  ofrecerHorarios,
} from '@/app/(protected)/setter/_actions/agenda.actions'
import { ConfirmarReunionSchema } from '@/app/(protected)/setter/_actions/agenda.schemas'
import { CopyBlock } from '@/app/(protected)/setter/_components/copy-block'
import { TextArea } from '@/app/(protected)/setter/_components/text-area'

type AgendaStepProps = {
  leadId: string
  status: LeadStatus
  ficha: Ficha | null
  agenda: Agenda | null
  /** Prefill del attendee: datos cargados del lead. */
  contactName: string | null
  leadEmail: string | null
}

/** Recordatorio del decisor según la ficha del Paso 1 — el gancho pedido. */
function hintDecisor(ficha: Ficha | null): string {
  switch (ficha?.identidad?.igManejadoPor) {
    case 'DUENO':
      return 'Según tu ficha, el Instagram lo maneja el dueño — igual confirmalo en la charla.'
    case 'CM':
      return 'OJO: según tu ficha el Instagram lo maneja un community manager. La reunión es con quien DECIDE — confirmá que sea el dueño antes de ofrecer horarios.'
    default:
      return 'Tu ficha no dice quién maneja el Instagram — preguntá con quién estás hablando antes de ofrecer horarios.'
  }
}

/**
 * Paso 10 — Agendar la reunión: cuando la conversación llega a "sí,
 * reunámonos", el setter confirma que habla con el decisor, ofrece 3
 * horarios REALES de la agenda de Franco (Cal.com, huso BA) y confirma el
 * booking con las notas de traspaso obligatorias. La confirmación al
 * prospecto y el recordatorio los manda Cal.com nativo.
 */
export function AgendaStep({
  leadId,
  status,
  ficha,
  agenda,
  contactName,
  leadEmail,
}: AgendaStepProps) {
  const router = useRouter()
  const [decisorOk, setDecisorOk] = useState(false)
  const [slots, setSlots] = useState<string[] | null>(null)
  const [slotElegido, setSlotElegido] = useState<string | null>(null)
  const [nombre, setNombre] = useState(contactName ?? '')
  const [email, setEmail] = useState(leadEmail ?? '')
  const [notas, setNotas] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [buscando, startBusqueda] = useTransition()
  const [confirmando, startConfirmacion] = useTransition()

  const agendada = reunionAgendada(agenda)

  // ── Reunión ya agendada: el resumen del traspaso ───────────────────────────
  if (agendada && agenda) {
    return (
      <Card padding="lg" className="space-y-4 border-emerald-400/20">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <CalendarCheck2 size={15} strokeWidth={1.5} className="text-emerald-400" />
            <h2 className="text-base font-semibold text-zinc-100">
              Paso 10 — Reunión agendada
            </h2>
          </div>
          <Badge tone="emerald" variant="soft">
            {agenda.slotStart ? formatFechaHora(agenda.slotStart) : 'Confirmada'}
          </Badge>
        </div>

        <div className="space-y-2 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-xs leading-relaxed text-zinc-400">
          {agenda.attendee && (
            <p>
              <span className="font-semibold text-zinc-300">Con:</span> {agenda.attendee.nombre}{' '}
              ({agenda.attendee.email})
            </p>
          )}
          {agenda.notasTraspaso && (
            <p className="whitespace-pre-wrap">
              <span className="font-semibold text-zinc-300">Tu traspaso:</span>{' '}
              {agenda.notasTraspaso}
            </p>
          )}
          {agenda.calBookingUid && (
            <p className="text-zinc-600">Booking Cal.com: {agenda.calBookingUid}</p>
          )}
        </div>

        <p className="flex items-start gap-2 text-xs leading-relaxed text-zinc-500">
          <CheckCircle2 size={14} strokeWidth={1.5} className="mt-0.5 shrink-0 text-emerald-400" />
          <span>
            El evento quedó en el calendario de Franco y Cal.com le mandó la confirmación y el
            recordatorio al prospecto. Franco ya recibió tus notas de traspaso — la reunión la
            cierra él.
          </span>
        </p>
      </Card>
    )
  }

  // ── Paso apagado: la conversación todavía no habilita agendar ──────────────
  if (status !== 'RESPONDIO') {
    return (
      <Card variant="subtle" padding="lg">
        <div className="flex items-center gap-2.5">
          <Lock size={15} strokeWidth={1.5} className="text-zinc-600" />
          <h2 className="text-base font-semibold text-zinc-400">Paso 10 — Agendar la reunión</h2>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-zinc-600">
          {status === 'CALL_AGENDADA'
            ? 'Este lead figura con reunión agendada (registrada por otra vía). El booking con horarios reales vive en este paso para los próximos.'
            : 'Se abre cuando el negocio respondió (Paso 9) y en la conversación acepta reunirse. Acá le ofrecés horarios reales de la agenda de Franco y confirmás el booking.'}
        </p>
      </Card>
    )
  }

  const buscarHorarios = () => {
    setError(null)
    setSlotElegido(null)
    startBusqueda(async () => {
      const result = await ofrecerHorarios(leadId)
      if (!result.success) {
        setError(result.error)
        toast.error(result.error)
        return
      }
      setSlots(result.data.slots)
    })
  }

  const confirmar = () => {
    setError(null)
    const payload = {
      decisorConfirmado: decisorOk,
      slotStart: slotElegido ?? '',
      nombre,
      email,
      notasTraspaso: notas,
    }
    const parsed = ConfirmarReunionSchema.safeParse(payload)
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Revisá los datos de la reunión')
      return
    }
    startConfirmacion(async () => {
      const result = await confirmarReunion(leadId, parsed.data)
      if (!result.success) {
        setError(result.error)
        toast.error(result.error)
        // Si el horario se pisó, la oferta vieja ya no vale: a re-ofrecer.
        if (result.error.includes('se acaba de ocupar')) {
          setSlots(null)
          setSlotElegido(null)
        }
        return
      }
      toast.success(
        `Reunión agendada 🎯 — ${formatFechaHora(result.data.slotStart)}. Franco ya tiene tus notas.`,
      )
      router.refresh()
    })
  }

  return (
    <Card padding="lg" className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-zinc-100">Paso 10 — Agendar la reunión</h2>
        <Badge tone="cyan" variant="soft">
          Aceptó reunirse
        </Badge>
      </div>

      {/* ── Primero: confirmar que habla con el decisor (ficha del Paso 1) ── */}
      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/[0.08] bg-white/[0.02] p-3 transition-colors hover:bg-white/[0.05]">
        <input
          type="checkbox"
          checked={decisorOk}
          onChange={(event) => setDecisorOk(event.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 accent-cyan-500"
        />
        <span className="space-y-1">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-zinc-200">
            <ShieldCheck size={13} strokeWidth={1.5} className="text-cyan-400" />
            Estoy hablando con el dueño / quien decide
          </span>
          <span className="block text-[11px] leading-relaxed text-zinc-500">
            {hintDecisor(ficha)}
          </span>
        </span>
      </label>

      {/* ── Ofrecer horarios reales ─────────────────────────────────────────── */}
      {slots === null ? (
        <Button
          onClick={buscarHorarios}
          loading={buscando}
          disabled={!decisorOk}
          icon={<CalendarSearch size={14} strokeWidth={1.5} />}
        >
          Buscar horarios libres de Franco
        </Button>
      ) : (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-semibold text-zinc-300">
              Horarios libres (hora Argentina) — pasáselos al prospecto
            </p>
            <Button
              variant="secondary"
              size="sm"
              onClick={buscarHorarios}
              loading={buscando}
              icon={<RefreshCw size={13} strokeWidth={1.5} />}
            >
              Buscar de nuevo
            </Button>
          </div>

          <CopyBlock
            titulo="Mensaje con los horarios"
            instruccion="Base editable: adaptala a la conversación y pegala en Instagram."
            texto={buildHorariosMensajeBlock(slots)}
          />

          <div className="space-y-2">
            <p className="text-xs font-semibold text-zinc-300">
              Cuando elija, marcá el horario acá
            </p>
            <div className="grid gap-2 sm:grid-cols-3">
              {slots.map((slot) => {
                const seleccionado = slotElegido === slot
                return (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSlotElegido(slot)}
                    aria-pressed={seleccionado}
                    className={`rounded-xl border p-3 text-left text-xs font-semibold transition-colors ${
                      seleccionado
                        ? 'border-cyan-400/40 bg-cyan-500/[0.08] text-cyan-300'
                        : 'border-white/[0.08] bg-white/[0.02] text-zinc-200 hover:bg-white/[0.05]'
                    }`}
                  >
                    {formatFechaHora(slot)}
                  </button>
                )
              })}
            </div>
          </div>

          {/* ── Confirmar el booking ────────────────────────────────────────── */}
          {slotElegido !== null && (
            <div className="space-y-3 rounded-2xl border border-cyan-400/25 bg-cyan-500/[0.04] p-4">
              <p className="text-xs font-semibold text-cyan-300">
                Confirmar {formatFechaHora(slotElegido)} — el evento se crea en el calendario
                real de Franco y Cal.com le manda la confirmación al prospecto.
              </p>

              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Nombre del prospecto" required>
                  <Input
                    value={nombre}
                    onChange={(event) => setNombre(event.target.value)}
                    placeholder="Como para saludarlo al entrar"
                  />
                </Field>
                <Field label="Email del prospecto" required hint="Ahí le llega la confirmación de Cal.com.">
                  <Input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="nombre@negocio.com"
                  />
                </Field>
              </div>

              <Field
                label="Notas de traspaso para Franco"
                required
                hint="Qué le duele, qué espera de la reunión, qué tono tiene, qué NO decirle. Sin esto no se agenda."
              >
                <TextArea
                  value={notas}
                  onChange={(event) => setNotas(event.target.value)}
                  rows={4}
                />
              </Field>

              {error && <p className="text-xs text-red-400">{error}</p>}

              <Button
                onClick={confirmar}
                loading={confirmando}
                disabled={confirmando}
                icon={<CalendarCheck2 size={14} strokeWidth={1.5} />}
              >
                Confirmar y agendar
              </Button>
            </div>
          )}

          {error && slotElegido === null && <p className="text-xs text-red-400">{error}</p>}
        </div>
      )}

      {error && slots === null && <p className="text-xs text-red-400">{error}</p>}
    </Card>
  )
}
