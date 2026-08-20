'use client'

import { useCallback, useEffect, useId, useRef } from 'react'

import { CHOREO_TRAMOS } from './choreography'
import type { ChoreoEditor } from './choreographyEditor'
import { StoreSlider } from './StoreSlider'
import {
  PROBE_RIG_RANGES,
  PROBE_RIG_SPECS,
  type ProbeRig,
  type ProbeRigStore,
} from './probeStore'

/**
 * El simulador de la coreografía: el control de progreso, la reproducción y la
 * lectura de dónde está parado el recorrido.
 *
 * **La lectura sale del `useFrame` sin un solo `setState`.** El rig escribe dos
 * ÍNDICES numéricos en el store (el del tramo y el del keyframe más cercano) y
 * este panel los traduce a nombres, escribiendo `textContent` directo. Es lo que
 * permite que el nombre del momento se actualice a 75 fps sin que React se
 * entere.
 *
 * ⚠️ **Los nombres salen del EDITOR, no del módulo.** Desde S7 hay cuatro
 * recorridos con distinta cantidad de keyframes, así que traducir el índice
 * contra el array importado daría el nombre equivocado —o un `undefined`— en
 * cuanto se cambie de variante. `editor.keyframes` es siempre el de la activa, y
 * como se lee en el momento de escribir, la lectura acompaña al cambio sin
 * necesidad de resuscribirse.
 */

type ChoreographyControlsProps = {
  rig: ProbeRigStore
  editor: ChoreoEditor
  playing: boolean
  onPlayingChange: (next: boolean) => void
  physicsEnabled: boolean
  onPhysicsChange: (next: boolean) => void
  /** Preferencia del sistema. Cuando está activa, la física no corre. */
  reducedMotion: boolean
}

/** Lectura del tramo y del keyframe. Se suscribe al store; nunca re-renderiza. */
function ChoreographyReadout({ rig, editor }: { rig: ProbeRigStore; editor: ChoreoEditor }) {
  const tramoRef = useRef<HTMLSpanElement>(null)
  const keyframeRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const write = (values: Readonly<ProbeRig>) => {
      const tramoIndex = Math.min(
        CHOREO_TRAMOS.length - 1,
        Math.max(0, Math.round(values.tramoIndex))
      )
      const keyframes = editor.keyframes
      const keyframeIndex = Math.min(
        keyframes.length - 1,
        Math.max(0, Math.round(values.keyframeIndex))
      )

      const tramo = CHOREO_TRAMOS[tramoIndex]
      const keyframe = keyframes[keyframeIndex]

      const tramoNode = tramoRef.current
      if (tramoNode) {
        const text = `${tramoIndex + 1}/${CHOREO_TRAMOS.length} · ${tramo.name}`
        if (tramoNode.textContent !== text) tramoNode.textContent = text
      }

      const keyframeNode = keyframeRef.current
      if (keyframeNode) {
        const derived = keyframe.derived ? ' · derivado' : ''
        const text = `${keyframe.name} (${keyframe.at.toFixed(3)})${derived}`
        if (keyframeNode.textContent !== text) keyframeNode.textContent = text
      }
    }

    write(rig.current)
    return rig.subscribe(write)
  }, [rig, editor])

  return (
    <div className="flex flex-col gap-0.5 rounded-sm bg-neutral-100 p-2 font-ds-mono text-[0.68rem] leading-relaxed text-neutral-800">
      <p>
        <span className="text-neutral-500">tramo </span>
        <span ref={tramoRef} data-probe="tramo" />
      </p>
      <p>
        <span className="text-neutral-500">keyframe </span>
        <span ref={keyframeRef} data-probe="keyframe" />
      </p>
    </div>
  )
}

export function ChoreographyControls({
  rig,
  editor,
  playing,
  onPlayingChange,
  physicsEnabled,
  onPhysicsChange,
  reducedMotion,
}: ChoreographyControlsProps) {
  const physicsId = useId()

  // Mover el progreso a mano corta la reproducción. Si no, el slider y el loop
  // se pelean por el mismo valor y no se puede parar en un momento — el mismo
  // problema que la órbita automática ya tenía con el ángulo.
  const stopPlaying = useCallback(() => {
    if (playing) onPlayingChange(false)
  }, [playing, onPlayingChange])

  const handlePlay = useCallback(() => {
    if (playing) {
      onPlayingChange(false)
      return
    }

    // Apretar reproducir con el recorrido terminado lo reinicia, en vez de no
    // hacer nada visible.
    if (rig.current.progress >= 0.999) rig.set('progress', 0)
    onPlayingChange(true)
  }, [playing, onPlayingChange, rig])

  return (
    <div className="flex flex-col gap-3">
      <StoreSlider
        store={rig}
        paramKey="progress"
        range={PROBE_RIG_RANGES.progress}
        spec={PROBE_RIG_SPECS.progress}
        onManualChange={stopPlaying}
      />

      <ChoreographyReadout rig={rig} editor={editor} />

      <button
        type="button"
        onClick={handlePlay}
        aria-pressed={playing}
        data-probe="play"
        className="rounded-sm border border-neutral-900 bg-neutral-900 px-3 py-2 text-[0.72rem] text-white hover:bg-neutral-800"
      >
        {playing ? 'detener el recorrido' : 'reproducir el recorrido'}
      </button>

      <StoreSlider store={rig} paramKey="playSpeed" range={PROBE_RIG_RANGES.playSpeed} spec={PROBE_RIG_SPECS.playSpeed} />

      <div className="flex flex-col gap-3 border-t border-neutral-200 pt-3">
        <div className="flex items-start gap-2">
          <input
            id={physicsId}
            type="checkbox"
            checked={physicsEnabled}
            onChange={(event) => onPhysicsChange(event.currentTarget.checked)}
            disabled={reducedMotion}
            data-probe="physics"
            className="mt-0.5 accent-neutral-900"
          />
          <label htmlFor={physicsId} className="text-[0.7rem] leading-snug text-neutral-600">
            física: inercia, mouse y vira
            <span className="block text-neutral-400">
              apagado: la cámara va exacto a la pose del progreso, sin amortiguación ni
              modulación. Es la forma de ver el track crudo mientras se calibran los
              keyframes.
            </span>
          </label>
        </div>

        {reducedMotion ? (
          <p className="text-[0.66rem] leading-snug text-neutral-500">
            El sistema pide movimiento reducido, así que la física está apagada y no se puede
            encender: sin inercia, sin offset de mouse y sin vira.
          </p>
        ) : (
          <>
            <StoreSlider
              store={rig}
              paramKey="settleScale"
              range={PROBE_RIG_RANGES.settleScale}
              spec={PROBE_RIG_SPECS.settleScale}
              disabled={!physicsEnabled}
            />
            <StoreSlider
              store={rig}
              paramKey="mouseScale"
              range={PROBE_RIG_RANGES.mouseScale}
              spec={PROBE_RIG_SPECS.mouseScale}
              disabled={!physicsEnabled}
            />
          </>
        )}
      </div>
    </div>
  )
}
