'use client'

import { useState } from 'react'
import { Field, Input, TextArea } from '@/components/ui'
import { registrarResultado } from '@/app/(protected)/setter/_actions/outreach.actions'
import {
  ResultadoInputSchema,
  type ResultadoContacto,
} from '@/app/(protected)/setter/_actions/outreach.schemas'
import { useStepAction } from '@/lib/use-step-action'
import { useUnsavedGuard } from '@/lib/use-unsaved-guard'
import { useAccionPrincipal } from './barra-accion'

/**
 * M5 — El REGISTRO de un toque de la conversación (5.5, tramo Seguimiento). Es
 * el MISMO camino de escritura del wizard (`registrarResultado` — ownership,
 * cadencia y transición de estado adentro; `ResultadoInputSchema`, que re-valida
 * la fecha de POSTERGADO server-side): el manual y el wizard son dos
 * presentaciones del mismo write-path (precedente 5.4 — no se toca el wizard ni
 * la maquinaria de cadencia). El setter nunca calcula la próxima fecha: la pone
 * `calculateNextFollowUp`; acá solo se marca QUÉ pasó. La cadencia (próximo
 * toque, cadencia agotada) se muestra afuera, en el contexto/munición de M5.
 *
 * `CALL_AGENDADA` NO se ofrece a mano (B7): la reunión se agenda en M16 con
 * horarios reales, y el booking confirmado mueve el estado — mismas 4 opciones
 * que el seguimiento del wizard.
 */

type OpcionResultado = {
  valor: ResultadoContacto
  etiqueta: string
  detalle: string
}

const OPCIONES: OpcionResultado[] = [
  {
    valor: 'SIN_RESPUESTA',
    etiqueta: 'No respondió — mandé un toque',
    detalle: 'Registra el toque; la fecha del próximo la calcula el sistema solo.',
  },
  {
    valor: 'RESPONDIO',
    etiqueta: 'Respondió',
    detalle:
      'Frena los toques y te habilita a construir la demo. Si aceptó reunirse, la agenda se abre después de mandarle la demo aprobada.',
  },
  {
    valor: 'POSTERGADO',
    etiqueta: 'Postergar',
    detalle:
      'El negocio te pidió que lo contactes más adelante: elegí la fecha y el panel lo retoma ahí.',
  },
  {
    valor: 'RECHAZADO',
    etiqueta: 'Rechazó',
    detalle: 'Queda registrado; el cierre del lead lo decide Franco.',
  },
]

function toastDeResultado(resultado: string, proximoToque: string | null): string {
  switch (resultado) {
    case 'SIN_RESPUESTA':
      return proximoToque
        ? 'Toque registrado — el próximo toque ya quedó agendado.'
        : 'Toque registrado — la cadencia ya cortó: sin más toques automáticos.'
    case 'RESPONDIO':
      return 'Respondió 🎉 — se abrió el brief. A construir la demo.'
    case 'POSTERGADO':
      return 'Postergado — el panel lo retoma en la fecha que marcaste.'
    default:
      return 'Registrado. Franco lo ve en el panel y decide el cierre.'
  }
}

export function SeguimientoForm({
  leadId,
  cadenciaAgotada,
}: {
  leadId: string
  cadenciaAgotada: boolean
}) {
  const [resultado, setResultado] = useState<ResultadoContacto | null>(null)
  const [nota, setNota] = useState('')
  const [fechaReactivacion, setFechaReactivacion] = useState('')
  const [error, setError] = useState<string | null>(null)
  const registro = useStepAction()
  const opciones = cadenciaAgotada
    ? OPCIONES.filter((opcion) => opcion.valor !== 'SIN_RESPUESTA')
    : OPCIONES

  // Mínimo del date-picker de reactivación (mañana). Lazy init: se calcula UNA
  // vez al montar, fuera del render, para no leer el reloj en cada render
  // (react-hooks/purity). El server re-valida "futura" igual (ResultadoInputSchema).
  const [minReactivacion] = useState(() =>
    new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  )

  // B-09: la nota de seguimiento se pierde si se cierra la pestaña — mismo
  // patrón que la Evaluación (A-24) y el opener, sin autosave. `onSuccess`
  // limpia `nota`, así que el guard se apaga solo al registrar.
  const hayCambiosSinGuardar = nota.trim() !== ''
  useUnsavedGuard(hayCambiosSinGuardar)

  const registrar = () => {
    setError(null)
    const payload = {
      resultado: resultado ?? undefined,
      nota,
      reactivateAt: fechaReactivacion || undefined,
    }
    const parsed = ResultadoInputSchema.safeParse(payload)
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Revisá lo que registraste')
      return
    }
    registro.run(() => registrarResultado(leadId, parsed.data), {
      onError: setError,
      onSuccess: () => {
        setResultado(null)
        setNota('')
        setFechaReactivacion('')
      },
      successToast: (data) => toastDeResultado(data.resultado, data.proximoToque),
    })
  }

  // P18 — la acción se pinta en la barra fija de `PantallaManual`. El motivo
  // viaja con ella: era el párrafo que estaba justo encima del botón y que
  // existía sólo para que el disabled no quedara mudo (gap 3.6).
  useAccionPrincipal({
    etiqueta: 'Registrar resultado',
    onClick: registrar,
    loading: registro.isPending,
    disabled: resultado === null,
    variant: 'secondary',
    motivo: 'Elegí arriba qué pasó en la conversación para habilitar el registro.',
  })

  return (
    <div className="space-y-3">
      {cadenciaAgotada && (
        <p className="text-[11px] leading-relaxed text-zinc-500">
          Los 3 toques ya se cumplieron — si no respondió, se enfría solo.
        </p>
      )}

      <div className="grid gap-2 sm:grid-cols-2">
        {opciones.map((opcion) => {
          const seleccionada = resultado === opcion.valor
          return (
            <button
              key={opcion.valor}
              type="button"
              onClick={() => setResultado(opcion.valor)}
              aria-pressed={seleccionada}
              className={`rounded-xl border p-3 text-left transition-colors ${
                seleccionada
                  ? 'border-cyan-400/40 bg-cyan-500/[0.08]'
                  : 'border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05]'
              }`}
            >
              <p
                className={`text-xs font-semibold ${
                  seleccionada ? 'text-cyan-300' : 'text-zinc-200'
                }`}
              >
                {opcion.etiqueta}
              </p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-zinc-500">{opcion.detalle}</p>
            </button>
          )
        })}
      </div>

      {resultado === 'POSTERGADO' && (
        <Field label="¿Cuándo retomamos el contacto?" required>
          <Input
            type="date"
            min={minReactivacion}
            value={fechaReactivacion}
            onChange={(event) => setFechaReactivacion(event.target.value)}
          />
        </Field>
      )}

      {resultado !== null && (
        <Field
          label="Nota (opcional)"
          hint="Qué dijo, qué tono tenía — lo que ayude al próximo toque o a Franco."
        >
          <TextArea value={nota} onChange={(event) => setNota(event.target.value)} rows={2} />
        </Field>
      )}

      {error && (
        <p role="alert" className="text-xs text-red-400">
          {error}
        </p>
      )}

    </div>
  )
}
