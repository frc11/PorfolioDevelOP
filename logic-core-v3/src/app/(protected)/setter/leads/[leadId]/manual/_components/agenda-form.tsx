'use client'

import { useState } from 'react'
import { CalendarCheck2, CalendarSearch, RefreshCw, ShieldCheck } from 'lucide-react'
import { Button, Callout, Field, Input, TextArea } from '@/components/ui'
import type { Ficha } from '@/lib/leados/contracts'
import { SLOT_OCUPADO } from '@/lib/leados/action-codes'
import { buildHorariosMensajeBlock } from '@/lib/leados/copy-blocks'
import { formatFechaHora } from '@/lib/leados/flow'
import {
  confirmarReunion,
  ofrecerHorarios,
} from '@/app/(protected)/setter/_actions/agenda.actions'
import {
  ConfirmarReunionSchema,
  type ConfirmarReunionInput,
} from '@/app/(protected)/setter/_actions/agenda.schemas'
import { CopyBlock } from '@/app/(protected)/setter/_components/copy-block'
import { useStepAction } from '@/lib/use-step-action'
import { useUnsavedGuard } from '@/lib/use-unsaved-guard'

/**
 * M16 — El BOOKING de la reunión (5.5, tramo Agenda). Es el MISMO camino de
 * escritura del wizard (`ofrecerHorarios`/`confirmarReunion` — ownership, gate
 * RESPONDIO, claim atómico, re-validación fresca del slot y booking real en
 * Cal.com adentro; `ConfirmarReunionSchema`, notas de traspaso obligatorias):
 * el manual y el wizard son dos presentaciones del mismo write-path. El
 * precedente 5.4 —«`agenda.actions.ts` no se toca»— era de la capa de
 * PRESENTACIÓN del manual: seguía valiendo mientras el manual solo re-presentaba
 * el write-path existente. 6.1 modificó la action a propósito, por decisión de
 * diseño (PR-2 / decisión #4): `ofrecerHorarios` dejó de ser solo-lectura y
 * ahora persiste la oferta (estado OFRECIDOS) para que los horarios sobrevivan
 * al cierre de la pestaña. La confirmación y el recordatorio al
 * prospecto los manda Cal.com nativo. El componente llega solo con el gate ya
 * abierto (RESPONDIO, sin reunión): los otros estados los presenta M16Registro.
 *
 * 6.2 — La experiencia encima de esa memoria (sin tocar backend):
 *   - `ofertaPrevia`: si el lead vuelve con horarios ya ofrecidos, el form
 *     ARRANCA mostrándolos (con la fecha de la oferta) en vez del buscador
 *     vacío. Quién decide que hay memoria es M16Registro; acá solo se presenta.
 *     El flujo virgen (sin oferta previa) queda idéntico: `slots === null`.
 *   - `useUnsavedGuard`: mismo patrón que 3.2 (A-24) — condición DERIVADA del
 *     estado local, sin autosave. Lo que protege es lo tipeado y todavía no
 *     persistido (notas de traspaso, nombre/email editados); los horarios ya no
 *     corren riesgo, los persiste 6.1.
 *   - Confirmación liviana: UN solo paso inline, en el ÚNICO punto irreversible
 *     (`confirmarReunion` crea el booking real y le avisa al prospecto). Ningún
 *     otro paso gana fricción: buscar/re-buscar y elegir horario siguen directos.
 */

/** La oferta que el form tiene en pantalla. `ofrecidosAt` presente = viene de la
 *  memoria del lead (el prospecto ya la tiene); ausente = recién buscada acá. */
type OfertaVigente = { horarios: string[]; ofrecidosAt?: string }

/** Recordatorio del decisor según la ficha (m1) — el mismo gancho del
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
  ofertaPrevia,
}: {
  leadId: string
  ficha: Ficha | null
  contactName: string | null
  leadEmail: string | null
  /** 6.2 — Los horarios que este lead YA tiene ofrecidos (estado OFRECIDOS). */
  ofertaPrevia?: OfertaVigente
}) {
  const [decisorOk, setDecisorOk] = useState(false)
  const [oferta, setOferta] = useState<OfertaVigente | null>(ofertaPrevia ?? null)
  const [slotElegido, setSlotElegido] = useState<string | null>(null)
  const [nombre, setNombre] = useState(contactName ?? '')
  const [email, setEmail] = useState(leadEmail ?? '')
  const [notas, setNotas] = useState('')
  const [error, setError] = useState<string | null>(null)
  // Paso de confirmación: el payload YA validado, esperando el sí definitivo.
  const [porConfirmar, setPorConfirmar] = useState<ConfirmarReunionInput | null>(null)
  const busqueda = useStepAction()
  const confirmacion = useStepAction()

  const slots = oferta?.horarios ?? null
  const ofrecidosAt = oferta?.ofrecidosAt

  // 6.2 — Guardia de salida (patrón 3.2/A-24, sin autosave): lo tipeado y no
  // persistido. Los horarios NO entran — desde 6.1 sobreviven solos.
  const hayCambiosSinGuardar =
    notas.trim() !== '' ||
    nombre.trim() !== (contactName ?? '').trim() ||
    email.trim() !== (leadEmail ?? '').trim()
  useUnsavedGuard(hayCambiosSinGuardar)

  const buscarHorarios = () => {
    setError(null)
    setSlotElegido(null)
    setPorConfirmar(null)
    // La búsqueda carga slots (y desde 6.1 los persiste): sin toast y sin
    // refresh — la oferta nueva REEMPLAZA a la anterior, acá y en el dossier.
    busqueda.run(() => ofrecerHorarios(leadId), {
      onError: setError,
      // Recién buscados: sin `ofrecidosAt` — todavía no son "los que ofreciste".
      onSuccess: (data) => setOferta({ horarios: data.slots }),
      refresh: false,
    })
  }

  /** Antesala del único paso irreversible: valida y pide el sí definitivo. */
  const revisarAntesDeConfirmar = () => {
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
    setPorConfirmar(parsed.data)
  }

  const confirmar = (input: ConfirmarReunionInput) => {
    setError(null)
    confirmacion.run(() => confirmarReunion(leadId, input), {
      onError: (mensaje, code) => {
        setError(mensaje)
        setPorConfirmar(null)
        // Si el horario se pisó, la oferta vieja ya no vale: a re-ofrecer.
        // 4.1: por CÓDIGO — el copy puede reescribirse sin romper la reacción.
        if (code === SLOT_OCUPADO) {
          setOferta(null)
          setSlotElegido(null)
        }
      },
      successToast: (data) =>
        `Reunión agendada 🎯 — ${formatFechaHora(data.slotStart)}. Franco ya tiene tus notas.`,
    })
  }

  return (
    <div className="space-y-4">
      {/* ── Primero: confirmar que habla con el decisor (ficha de m1) ── */}
      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/[0.08] bg-white/[0.02] p-3 transition-colors hover:bg-white/[0.05]">
        <input
          type="checkbox"
          checked={decisorOk}
          onChange={(event) => setDecisorOk(event.target.checked)}
          aria-label="Estoy hablando con el dueño o quien decide"
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
            {/* 6.2 — Re-entrada con memoria: si los horarios vienen del dossier,
                la pantalla lo dice (y desde cuándo) en vez de hacerlos pasar por
                una búsqueda recién hecha. Sin memoria, el copy es el de siempre. */}
            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-zinc-300">
                {ofrecidosAt
                  ? 'Los horarios que ofreciste'
                  : 'Horarios libres (hora Argentina) — pasáselos al prospecto'}
              </p>
              {ofrecidosAt && (
                <p className="max-w-md text-[11px] leading-relaxed text-zinc-500">
                  Se los pasaste el {formatFechaHora(ofrecidosAt)} — son los que el prospecto tiene
                  en la mano. Si ya no sirven, buscá de nuevo y estos quedan reemplazados.
                </p>
              )}
            </div>
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

              {/* 6.2 — La ÚNICA fricción del paso, y va acá: confirmar crea el
                  booking real y le avisa al prospecto. Inline (nada de
                  window.confirm), con el Callout del proyecto. */}
              {porConfirmar ? (
                <Callout tone="brand" icon={CalendarCheck2} title="Vas a confirmar la reunión">
                  <p className="text-xs leading-relaxed">
                    Vas a confirmar {formatFechaHora(porConfirmar.slotStart)} — esto le avisa al
                    prospecto.
                  </p>
                  <div className="mt-3 flex items-center gap-3">
                    <Button
                      onClick={() => confirmar(porConfirmar)}
                      loading={confirmacion.isPending}
                      disabled={confirmacion.isPending}
                      icon={<CalendarCheck2 size={14} strokeWidth={1.5} />}
                    >
                      Sí, confirmar
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => setPorConfirmar(null)}
                      disabled={confirmacion.isPending}
                    >
                      Volver
                    </Button>
                  </div>
                </Callout>
              ) : (
                <Button
                  onClick={revisarAntesDeConfirmar}
                  disabled={confirmacion.isPending}
                  icon={<CalendarCheck2 size={14} strokeWidth={1.5} />}
                >
                  Confirmar y agendar
                </Button>
              )}
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
