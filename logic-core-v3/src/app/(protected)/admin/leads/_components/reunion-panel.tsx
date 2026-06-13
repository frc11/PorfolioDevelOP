'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { Agenda, ResultadoReunion } from '@/lib/leados/contracts'
import { formatFechaHora } from '@/lib/leados/flow'
import {
  marcarReunionRealizada,
  registrarResultadoReunion,
} from '../_actions/reunion.actions'

type ReunionPanelProps = {
  leadId: string
  agenda: Agenda
}

const RESULTADOS: { tipo: ResultadoReunion; etiqueta: string; detalle: string; tono: string }[] = [
  {
    tipo: 'GANADO',
    etiqueta: 'Ganado 🏆',
    detalle: 'Cierra la venta: el lead pasa a Cerrado. Queda registrado para la comisión.',
    tono: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-100 hover:bg-emerald-400/20',
  },
  {
    tipo: 'PERDIDO',
    etiqueta: 'Perdido',
    detalle: 'No avanza: el lead pasa a Perdido.',
    tono: 'border-rose-400/20 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20',
  },
  {
    tipo: 'RE_SEGUIMIENTO',
    etiqueta: 'Re-seguimiento',
    detalle: 'Vuelve a Respondió: el setter retoma la conversación.',
    tono: 'border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10',
  },
]

const RESULTADO_LABELS: Record<ResultadoReunion, string> = {
  GANADO: 'Ganado 🏆',
  PERDIDO: 'Perdido',
  RE_SEGUIMIENTO: 'Re-seguimiento',
}

/**
 * B7 — La reunión que agendó el setter, con el traspaso completo, y el
 * cierre de loop que SOLO marca Franco: "realizada" (la métrica real del
 * piloto) y el resultado (GANADO/perdido/re-seguimiento). El setter no
 * tiene estas acciones en su panel.
 */
export function ReunionPanel({ leadId, agenda }: ReunionPanelProps) {
  const router = useRouter()
  const [confirmando, setConfirmando] = useState<ResultadoReunion | null>(null)
  const [nota, setNota] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const marcarRealizada = () => {
    setError(null)
    startTransition(async () => {
      const result = await marcarReunionRealizada({ leadId })
      if (!result.success) {
        setError(result.error)
        return
      }
      router.refresh()
    })
  }

  const registrarResultado = (tipo: ResultadoReunion) => {
    setError(null)
    startTransition(async () => {
      const result = await registrarResultadoReunion({ leadId, tipo, nota })
      if (!result.success) {
        setError(result.error)
        return
      }
      setConfirmando(null)
      setNota('')
      router.refresh()
    })
  }

  return (
    <section className="rounded-[28px] border border-amber-400/20 bg-white/5 p-5 backdrop-blur-xl">
      <h3 className="text-lg font-semibold text-white">Reunión agendada</h3>
      <p className="mt-1 text-sm text-zinc-400">
        {agenda.slotStart ? formatFechaHora(agenda.slotStart) : 'Sin horario registrado'}
        {agenda.attendee ? ` · con ${agenda.attendee.nombre}` : ''}
      </p>

      <div className="mt-4 space-y-3">
        {agenda.attendee ? (
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">Invitado</p>
            <p className="mt-2 text-sm text-zinc-200">{agenda.attendee.nombre}</p>
            <p className="mt-1 text-sm text-zinc-400">{agenda.attendee.email}</p>
          </div>
        ) : null}

        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">
            Notas de traspaso del setter
          </p>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-300">
            {agenda.notasTraspaso ?? 'Sin notas (no debería pasar — son obligatorias desde B7)'}
          </p>
        </div>

        {agenda.calBookingUid ? (
          <p className="text-xs text-zinc-500">
            Booking Cal.com: <span className="font-mono">{agenda.calBookingUid}</span>
            {agenda.agendadaAt ? ` · agendada el ${formatFechaHora(agenda.agendadaAt)}` : ''}
          </p>
        ) : null}
      </div>

      {/* ── Realizada: la métrica real del piloto ─────────────────────────── */}
      <div className="mt-4">
        {agenda.realizadaAt ? (
          <p className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
            ✓ Reunión realizada el {formatFechaHora(agenda.realizadaAt)}
          </p>
        ) : (
          <button
            type="button"
            onClick={marcarRealizada}
            disabled={isPending}
            className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-zinc-200 transition-colors hover:bg-black/30 disabled:opacity-50"
          >
            Marcar reunión realizada
          </button>
        )}
      </div>

      {/* ── Resultado: lo decide Franco, una sola vez ─────────────────────── */}
      <div className="mt-4">
        {agenda.resultado ? (
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">Resultado</p>
            <p className="mt-2 text-sm font-medium text-zinc-100">
              {RESULTADO_LABELS[agenda.resultado.tipo]}
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              Registrado el {formatFechaHora(agenda.resultado.fecha)}
            </p>
            {agenda.resultado.nota ? (
              <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-300">
                {agenda.resultado.nota}
              </p>
            ) : null}
          </div>
        ) : confirmando === null ? (
          <div className="grid gap-2">
            <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">
              Resultado post-reunión
            </p>
            {RESULTADOS.map((opcion) => (
              <button
                key={opcion.tipo}
                type="button"
                onClick={() => setConfirmando(opcion.tipo)}
                className={`rounded-2xl border px-4 py-3 text-left text-sm transition-colors ${opcion.tono}`}
              >
                <span className="font-medium">{opcion.etiqueta}</span>
                <span className="mt-0.5 block text-xs opacity-70">{opcion.detalle}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="text-sm text-zinc-200">
              ¿Confirmás <span className="font-semibold">{RESULTADO_LABELS[confirmando]}</span>?
              Se registra una sola vez y mueve el estado del lead.
            </p>
            <textarea
              value={nota}
              onChange={(event) => setNota(event.target.value)}
              rows={2}
              placeholder="Nota opcional (qué pasó en la reunión)"
              className="mt-3 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-cyan-400/40 focus:outline-none"
            />
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => registrarResultado(confirmando)}
                disabled={isPending}
                className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm font-medium text-emerald-100 transition-colors hover:bg-emerald-400/20 disabled:opacity-50"
              >
                {isPending ? 'Registrando…' : 'Sí, registrar'}
              </button>
              <button
                type="button"
                onClick={() => setConfirmando(null)}
                disabled={isPending}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-300 transition-colors hover:bg-white/10 disabled:opacity-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>

      {error ? <p className="mt-3 text-xs text-rose-300">{error}</p> : null}
    </section>
  )
}
