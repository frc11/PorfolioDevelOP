'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import {
  PROBE_PARAM_ORDER,
  PROBE_PARAM_SPECS,
  type ProbeParams,
  type ProbeParamsStore,
  type ProbeStats,
  type ProbeStatsStore,
} from '@/app/v3/_lib/escena/probeStore'

/**
 * La línea copiable con todos los valores, más lo que la escena mide sola.
 *
 * **Es la mitad del flujo de calibración.** En modo coreografía los siete
 * canales que se ven acá son los que el track está dictando en este frame, así
 * que scrubear el progreso hasta un momento y apretar "copiar" deja una pose
 * lista para pegar como keyframe en `choreography.ts`. Lo que se copia es la
 * pose LIMPIA: la inercia sí está adentro (es la posición real de la cámara),
 * pero el offset de mouse y la vira no, porque son modulación y ensuciarían el
 * número.
 *
 * La caja del logo sigue publicándose porque es la evidencia del probe: el
 * espesor contra el ancho, medido sobre la geometría real. Con la extrusión de
 * S4 ese número tiene que haber pasado de 0,119 a ~0,56 — se lee acá.
 */

function buildSnapshot(params: Readonly<ProbeParams>): string {
  const body = PROBE_PARAM_ORDER.map(
    (key) => `${key}: ${params[key].toFixed(PROBE_PARAM_SPECS[key].decimals)}`
  ).join(', ')
  return `{ ${body} }`
}

type ProbeReadoutProps = {
  store: ProbeParamsStore
  stats: ProbeStatsStore
}

export function ProbeReadout({ store, stats }: ProbeReadoutProps) {
  const snapshotRef = useRef<HTMLElement>(null)
  const fpsRef = useRef<HTMLSpanElement>(null)
  const boxRef = useRef<HTMLSpanElement>(null)
  const [copyState, setCopyState] = useState<'idle' | 'ok' | 'error'>('idle')

  useEffect(() => {
    const write = (values: Readonly<ProbeParams>) => {
      const node = snapshotRef.current
      if (!node) return
      const text = buildSnapshot(values)
      if (node.textContent !== text) node.textContent = text
    }

    write(store.current)
    return store.subscribe(write)
  }, [store])

  useEffect(() => {
    const write = (values: Readonly<ProbeStats>) => {
      const fps = fpsRef.current
      if (fps) {
        const text = String(values.fps)
        if (fps.textContent !== text) fps.textContent = text
      }

      const box = boxRef.current
      if (box) {
        const text = `${values.logoW.toFixed(2)} × ${values.logoH.toFixed(2)} × ${values.logoD.toFixed(3)}`
        if (box.textContent !== text) box.textContent = text
      }
    }

    write(stats.current)
    return stats.subscribe(write)
  }, [stats])

  useEffect(() => {
    if (copyState === 'idle') return
    const timer = window.setTimeout(() => setCopyState('idle'), 2000)
    return () => window.clearTimeout(timer)
  }, [copyState])

  const handleCopy = useCallback(async () => {
    const text = snapshotRef.current?.textContent ?? ''
    if (!text || !navigator.clipboard) {
      setCopyState('error')
      return
    }

    try {
      await navigator.clipboard.writeText(text)
      setCopyState('ok')
    } catch {
      setCopyState('error')
    }
  }, [])

  return (
    <div className="flex flex-col gap-2 border-t border-neutral-200 pt-3">
      <code
        ref={snapshotRef}
        data-probe="snapshot"
        className="block rounded-sm bg-neutral-100 p-2 font-ds-mono text-[0.68rem] leading-relaxed break-words text-neutral-800"
      />

      <div className="flex items-center justify-between gap-3">
        <p className="font-ds-mono text-[0.68rem] text-neutral-600">
          fps <span ref={fpsRef} data-probe="fps" className="tabular-nums text-neutral-900" />
          {' · caja '}
          <span ref={boxRef} data-probe="box" className="tabular-nums text-neutral-900" />
        </p>

        <button
          type="button"
          onClick={handleCopy}
          className="rounded-sm border border-neutral-300 px-2 py-1 text-[0.68rem] text-neutral-700 hover:bg-neutral-100"
        >
          {copyState === 'ok' ? 'copiado' : copyState === 'error' ? 'no se pudo' : 'copiar'}
        </button>
      </div>
    </div>
  )
}
