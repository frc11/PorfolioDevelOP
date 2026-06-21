'use client'

/**
 * 🧪 EXPERIMENTAL / DESCARTABLE — FG-2.0.
 * Instrumento de medición del harness: cronómetro de generación + captura manual
 * de cuota y calidad + emisión de la fila de log para la tabla del experimento.
 * NO es producción. Borrar tras la decisión del experimento.
 */

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Copy, Square, TimerReset } from 'lucide-react'
import { Button, Field, Input } from '@/components/ui'
import {
  buildLogRowTsv,
  logHeaderTsv,
  type CostoPrompt,
  type LogRowInput,
} from '@/lib/leados/_experimental/fg2-brief-lab'

type MedicionPanelProps = {
  negocio: string
  estiloLabel: string
  seccionesCount: number
  costo: CostoPrompt
}

async function copiar(texto: string, okMsg: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(texto)
    toast.success(okMsg)
  } catch {
    toast.error('No se pudo copiar — copialo a mano desde la vista.')
  }
}

export function MedicionPanel({ negocio, estiloLabel, seccionesCount, costo }: MedicionPanelProps) {
  // Cronómetro de generación: lo arranca el setter al mandar el prompt a Claude
  // Design y lo frena cuando la demo terminó. `performance.now()` (no Date.now)
  // en handlers/efecto — nunca en render, así que no rompe `react-hooks/purity`.
  const [running, setRunning] = useState(false)
  const [startMs, setStartMs] = useState<number | null>(null)
  const [nowMs, setNowMs] = useState<number | null>(null)

  // Captura manual de lo que Claude Design cobra (externo, no instrumentable) y
  // del juicio de calidad humano.
  const [cuota, setCuota] = useState('')
  const [calidad, setCalidad] = useState('')
  const [notas, setNotas] = useState('')

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => setNowMs(performance.now()), 250)
    return () => clearInterval(id)
  }, [running])

  const elapsed = startMs != null && nowMs != null ? Math.max(0, (nowMs - startMs) / 1000) : null

  const iniciar = () => {
    const t = performance.now()
    setStartMs(t)
    setNowMs(t)
    setRunning(true)
  }

  const marcarFin = () => {
    setNowMs(performance.now())
    setRunning(false)
  }

  const reiniciar = () => {
    setRunning(false)
    setStartMs(null)
    setNowMs(null)
  }

  const copiarFila = () => {
    const row: LogRowInput = {
      negocio,
      metodo: 'formulario',
      estiloLabel,
      seccionesCount,
      tokensPrompt: costo.tokensEstimados,
      tiempoGenSegundos: !running && elapsed != null ? elapsed : null,
      cuotaConsumida: cuota,
      calidad,
      notas,
    }
    void copiar(buildLogRowTsv(row), 'Fila copiada — pegala en la tabla del experimento.')
  }

  return (
    <div className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-zinc-100">Harness de medición</h3>
        <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-1 text-[11px] font-medium text-cyan-200">
          ~{costo.tokensEstimados.toLocaleString('es-AR')} tokens · {costo.palabras} palabras
        </span>
      </div>

      {/* Cronómetro de generación */}
      <div className="rounded-xl border border-white/[0.06] bg-black/20 p-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">
              Tiempo de generación
            </p>
            <p className="mt-0.5 font-mono text-2xl font-semibold tabular-nums text-white">
              {elapsed != null ? `${elapsed.toFixed(1)} s` : '—'}
              {running && <span className="ml-2 text-xs font-normal text-cyan-300">corriendo…</span>}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!running ? (
              <Button size="sm" variant="secondary" onClick={iniciar}>
                {startMs != null ? 'Reiniciar y arrancar' : 'Arrancar'}
              </Button>
            ) : (
              <Button
                size="sm"
                variant="primary"
                onClick={marcarFin}
                icon={<Square size={13} strokeWidth={1.5} />}
              >
                Marcar fin
              </Button>
            )}
            {startMs != null && (
              <Button
                size="sm"
                variant="ghost"
                onClick={reiniciar}
                aria-label="Reiniciar cronómetro"
                icon={<TimerReset size={14} strokeWidth={1.5} />}
              />
            )}
          </div>
        </div>
        <p className="mt-2 text-[11px] leading-relaxed text-zinc-600">
          Arrancá al mandar el prompt a Claude Design y frená cuando la demo esté lista.
        </p>
      </div>

      {/* Captura manual: cuota + calidad */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Cuota / créditos consumidos" hint="Lo que muestra Claude Design">
          <Input
            value={cuota}
            onChange={(e) => setCuota(e.target.value)}
            placeholder="ej: 1 mensaje · 12 créditos"
          />
        </Field>
        <Field label="Calidad (1–5)" hint="Tu juicio sobre la demo resultante">
          <Input
            value={calidad}
            onChange={(e) => setCalidad(e.target.value)}
            inputMode="numeric"
            placeholder="ej: 4"
          />
        </Field>
      </div>

      <Field label="Notas" hint="Qué salió bien o mal en esta demo">
        <Input
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          placeholder="ej: el hero salió fuerte, el menú quedó genérico"
        />
      </Field>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          variant="secondary"
          onClick={copiarFila}
          icon={<Copy size={13} strokeWidth={1.5} />}
        >
          Copiar fila de log
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => void copiar(logHeaderTsv(), 'Encabezado copiado.')}
        >
          Copiar encabezado
        </Button>
        {running && (
          <span className="text-[11px] text-amber-300/80">
            Frená el cronómetro antes de copiar para que la fila incluya el tiempo.
          </span>
        )}
      </div>
    </div>
  )
}
