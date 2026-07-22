'use client'

import { useState } from 'react'
import { CalendarCheck2, CalendarSearch, RefreshCw, ShieldCheck } from 'lucide-react'
import { Button, Field, Input, TextArea } from '@/components/ui'
import type { Ficha } from '@/lib/leados/contracts'
import { buildHorariosMensajeBlock } from '@/lib/leados/copy-blocks'
import { formatFechaHora } from '@/lib/leados/flow'
import {
  confirmarReunion,
  ofrecerHorarios,
} from '@/app/(protected)/setter/_actions/agenda.actions'
import { ConfirmarReunionSchema } from '@/app/(protected)/setter/_actions/agenda.schemas'
import { CopyBlock } from '@/app/(protected)/setter/_components/copy-block'
import { useStepAction } from '@/lib/use-step-action'

/**
 * M16 — El BOOKING de la reunión (5.5, tramo Agenda). Es el MISMO camino de
 * escritura del wizard (`ofrecerHorarios`/`confirmarReunion` — ownership, gate
 * RESPONDIO, claim atómico, re-validación fresca del slot y booking real en
 * Cal.com adentro; `ConfirmarReunionSchema`, notas de traspaso obligatorias):
 * el manual y el wizard son dos presentaciones del mismo write-path (precedente
 * 5.4 — `agenda.actions.ts` no se toca). La confirmación y el recordatorio al
 * prospecto los manda Cal.com nativo. El componente llega solo con el gate ya
 * abierto (RESPONDIO, sin reunión): los otros estados los presenta M16Registro.
 */

/** Recordatorio del decisor según la ficha del Paso 1 — el mismo gancho del
 * wizard: la reunión es con quien DECIDE (un CM no cierra). Va pegado al
 * checkbox del decisor, que es donde el setter lo necesita. */
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

export function AgendaForm({
  leadId,
  ficha,
  contactName,
  leadEmail,
}: {
  leadId: string
  ficha: Ficha | null
  contactName: string | null
  leadEmail: string | null
}) {
  const [decisorOk, setDecisorOk] = useState(false)
  const [slots, setSlots] = useState<string[] | null>(null)
  const [slotElegido, setSlotElegido] = useState<string | null>(null)
  const [nombre, setNombre] = useState(contactName ?? '')
  const [email, setEmail] = useState(leadEmail ?? '')
  const [notas, setNotas] = useState('')
  const [error, setError] = useState<string | null>(null)
  const busqueda = useStepAction()
  const confirmacion = useStepAction()

  const buscarHorarios = () => {
    setError(null)
    setSlotElegido(null)
    // La búsqueda solo carga slots: sin toast y sin refresh (no muta nada).
    busqueda.run(() => ofrecerHorarios(leadId), {
      onError: setError,
      onSuccess: (data) => setSlots(data.slots),
      refresh: false,
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
    confirmacion.run(() => confirmarReunion(leadId, parsed.data), {
      onError: (mensaje) => {
        setError(mensaje)
        // Si el horario se pisó, la oferta vieja ya no vale: a re-ofrecer.
        if (mensaje.includes('se acaba de ocupar')) {
          setSlots(null)
          setSlotElegido(null)
        }
      },
      successToast: (data) =>
        `Reunión agendada 🎯 — ${formatFechaHora(data.slotStart)}. Franco ya tiene tus notas.`,
    })
  }

  return (
    <div className="space-y-4">
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
          loading={busqueda.isPending}
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
              loading={busqueda.isPending}
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
            <p className="text-xs font-semibold text-zinc-300">Cuando elija, marcá el horario acá</p>
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
                Confirmar {formatFechaHora(slotElegido)} — el evento se crea en el calendario real de
                Franco y Cal.com le manda la confirmación al prospecto.
              </p>

              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Nombre del prospecto" required>
                  <Input
                    value={nombre}
                    onChange={(event) => setNombre(event.target.value)}
                    placeholder="Como para saludarlo al entrar"
                  />
                </Field>
                <Field
                  label="Email del prospecto"
                  required
                  hint="Ahí le llega la confirmación de Cal.com."
                >
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
                <TextArea value={notas} onChange={(event) => setNotas(event.target.value)} rows={4} />
              </Field>

              {error && (
                <p role="alert" className="text-xs text-red-400">
                  {error}
                </p>
              )}

              <Button
                onClick={confirmar}
                loading={confirmacion.isPending}
                disabled={confirmacion.isPending}
                icon={<CalendarCheck2 size={14} strokeWidth={1.5} />}
              >
                Confirmar y agendar
              </Button>
            </div>
          )}

          {error && slotElegido === null && (
            <p role="alert" className="text-xs text-red-400">
              {error}
            </p>
          )}
        </div>
      )}

      {error && slots === null && (
        <p role="alert" className="text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  )
}
