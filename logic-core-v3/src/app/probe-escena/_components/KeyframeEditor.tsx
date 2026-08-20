'use client'

import { useCallback, useEffect, useState, useSyncExternalStore } from 'react'

import type { ChoreoEditor } from './choreographyEditor'
import { KeyframeExportPanel } from './KeyframeExportPanel'
import { KeyframeList } from './KeyframeList'
import { StoreSlider } from './StoreSlider'
import {
  PROBE_RIG_RANGES,
  type ProbeParamsStore,
  type ProbeRigStore,
  type SliderSpec,
} from './probeStore'

/**
 * EL EDITOR DE KEYFRAMES (S5).
 *
 * Hasta acá el simulador dejaba scrubear y leer, pero para ajustar había que
 * copiar una pose, abrir `choreography.ts`, pegarla a mano y recargar. Con ese
 * costo por ajuste, nadie calibra. Esto lo cierra: se elige un keyframe, se lo
 * mueve mirando, y el botón de exportar devuelve el archivo actualizado.
 *
 * ── El bucle, y por qué se cierra solo ─────────────────────────────────────
 *
 * 1. Se selecciona un keyframe → el progreso se clava en su `at` y su pose se
 *    vuelca a los cinco sliders de pose. Los dos de luz no: desde S6 no son del
 *    keyframe sino del arco, y lo que muestran es lo que el arco dicta en ese
 *    `at` — o sea que la pose se compone bajo la luz que ese momento va a tener.
 * 2. El humano arrastra un slider → el store de parámetros cambia → este panel
 *    lo vuelca sobre la pose del keyframe → el track se invalida.
 * 3. El `useFrame` muestrea el track nuevo en ese mismo `at` y la cámara ya
 *    está en la pose editada.
 *
 * El paso 3 no necesita código: muestrear el track EXACTAMENTE en el `at` de un
 * keyframe devuelve su pose sin interpolar nada, así que mover el slider mueve
 * la cámara. Por eso el editor no tiene un camino de cámara propio.
 *
 * ── Cero `setState` por frame, otra vez ────────────────────────────────────
 *
 * Los sliders no pasan por React (ver `StoreSlider`), y la pose editada tampoco
 * re-renderiza: la lista muestra nombre y `at`, no la pose. React se entera de
 * los cambios ESTRUCTURALES —duplicar, borrar, resetear, mover un `at`— por el
 * contador de versión del editor, y de nada más.
 *
 * ── Lo que NO hace ─────────────────────────────────────────────────────────
 *
 * No escribe el archivo. Ni una línea. El humano exporta y pega, y ese rodeo es
 * el que mantiene a `choreography.ts` como fuente de verdad en vez de como
 * salida de una herramienta.
 */

/**
 * El `at` se maneja con el MISMO valor que el progreso del recorrido, porque en
 * este modo son la misma cosa: el punto en que ocurre el keyframe es el punto
 * en que está parada la cámara. Un segundo slider sería un segundo estado que
 * mantener sincronizado sin ganar nada.
 */
const AT_SPEC: SliderSpec = { label: 'at · punto del recorrido', unit: '', decimals: 3 }

const ACTION_BUTTON =
  'rounded-sm border border-neutral-300 px-2 py-1.5 text-[0.68rem] text-neutral-700 transition-colors hover:bg-neutral-100 disabled:cursor-default disabled:opacity-40'
const DANGER_BUTTON =
  'rounded-sm border border-neutral-900 bg-neutral-900 px-2 py-1.5 text-[0.68rem] text-white transition-colors hover:bg-neutral-800'

type KeyframeEditorProps = {
  editor: ChoreoEditor
  store: ProbeParamsStore
  rig: ProbeRigStore
}

/** El keyframe cuyo `at` está más cerca del progreso. Sobre los datos, sin track. */
function nearestKeyframe(editor: ChoreoEditor, progress: number): number {
  let best = editor.keyframes[0]
  let bestDistance = Math.abs(progress - best.at)

  for (const keyframe of editor.keyframes) {
    const distance = Math.abs(progress - keyframe.at)
    if (distance >= bestDistance) continue
    best = keyframe
    bestDistance = distance
  }

  return best.id
}

type Confirming = 'none' | 'reset' | 'remove'

export function KeyframeEditor({ editor, store, rig }: KeyframeEditorProps) {
  // La versión es el único canal por el que el editor despierta a React. Sube
  // con lo que se ve en la lista (alta, baja, `at`, la marca de editado) y no
  // con cada micra de pose.
  const version = useSyncExternalStore(
    editor.subscribe,
    () => editor.version,
    () => 0
  )

  // Arranca en el keyframe más cercano a donde estaba el progreso, no en el
  // primero: el flujo real es scrubear en coreografía hasta un momento que no
  // convence y pasar al editor, y ahí el instrumento tiene que estar ya parado
  // en ese momento. Se calcula sobre los `at` y no sobre el track, para que el
  // panel siga sin tocar nada que pueda tirar.
  const [selectedId, setSelectedId] = useState(() => nearestKeyframe(editor, rig.current.progress))
  const [confirming, setConfirming] = useState<Confirming>('none')
  const [notice, setNotice] = useState<string | null>(null)

  const keyframes = editor.keyframes
  const selected = editor.find(selectedId)

  /**
   * Llevar la escena al keyframe seleccionado: el progreso a su `at` y su pose
   * a los siete sliders.
   *
   * Depende de `version` a propósito. Sin eso, un `reset` que no cambie la
   * selección dejaría los sliders mostrando los valores descartados mientras la
   * cámara ya volvió a los del archivo. Con `version` adentro, cualquier cambio
   * estructural re-siembra; cuando no hay nada que cambiar, los dos `set`
   * comparan y no notifican a nadie.
   */
  useEffect(() => {
    const keyframe = editor.find(selectedId)
    if (!keyframe) return

    rig.set('progress', keyframe.at)
    store.setMany(keyframe.pose)
  }, [editor, rig, store, selectedId, version])

  /**
   * El otro sentido: lo que el humano mueve en los sliders cae sobre la pose del
   * keyframe seleccionado.
   *
   * Se suscribe al store en vez de leerlo por frame, así que esto corre por
   * evento de input y nunca por frame. Y solo existe mientras el editor está en
   * pantalla: al salir del modo, el panel se desmonta y los sliders vuelven a
   * ser lo que eran en cada modo.
   */
  useEffect(
    () => store.subscribe((values) => editor.applyPose(selectedId, values)),
    [editor, store, selectedId]
  )

  const handleSelect = useCallback((id: number) => {
    setSelectedId(id)
    setConfirming('none')
    setNotice(null)
  }, [])

  // El `at` que el slider dejó en el store puede caer sobre un vecino; el editor
  // lo acota y devuelve el efectivo, y devolvérselo al store hace que el pulgar
  // se frene contra la pared en vez de seguir de largo mintiendo.
  const handleAtChange = useCallback(() => {
    const effective = editor.setAt(selectedId, rig.current.progress)
    rig.set('progress', effective)
  }, [editor, rig, selectedId])

  const handleDuplicate = useCallback(() => {
    const copy = editor.duplicate(selectedId)
    if (!copy) {
      setNotice('No entra una copia entre este keyframe y su vecino: separá los `at` primero.')
      return
    }
    setNotice(null)
    setSelectedId(copy.id)
  }, [editor, selectedId])

  const handleRemove = useCallback(() => {
    const index = editor.indexOf(selectedId)
    if (!editor.remove(selectedId)) return
    setConfirming('none')
    const fallback = editor.keyframes[Math.max(0, index - 1)]
    setSelectedId(fallback.id)
  }, [editor, selectedId])

  const handleReset = useCallback(() => {
    editor.reset()
    setConfirming('none')
    setNotice(null)
    setSelectedId(editor.keyframes[0].id)
  }, [editor])

  return (
    <div className="flex flex-col gap-3">
      <KeyframeList keyframes={keyframes} selectedId={selectedId} onSelect={handleSelect} />

      {selected ? (
        <>
          <p className="font-ds-mono text-[0.66rem] leading-snug text-neutral-500">
            {selected.name}
            {selected.ease ? ` · ease ${selected.ease}` : ' · sin ease'}
            {selected.turn ? ` · turn ${selected.turn}` : ''}
          </p>

          <StoreSlider
            store={rig}
            paramKey="progress"
            range={PROBE_RIG_RANGES.progress}
            spec={AT_SPEC}
            dataAttr="editor-at"
            onManualChange={handleAtChange}
          />
        </>
      ) : null}

      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={handleDuplicate}
          disabled={!selected}
          data-probe="editor-duplicate"
          className={ACTION_BUTTON}
        >
          duplicar
        </button>

        {confirming === 'remove' ? (
          <button
            type="button"
            onClick={handleRemove}
            data-probe="editor-remove-confirm"
            className={DANGER_BUTTON}
          >
            confirmar baja
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setConfirming('remove')}
            disabled={selected?.origin !== 'editor'}
            title={
              selected?.origin === 'editor'
                ? undefined
                : 'Solo se borran los keyframes creados acá. Los del archivo vuelven con el reset.'
            }
            data-probe="editor-remove"
            className={ACTION_BUTTON}
          >
            borrar copia
          </button>
        )}

        {confirming === 'reset' ? (
          <button
            type="button"
            onClick={handleReset}
            data-probe="editor-reset-confirm"
            className={DANGER_BUTTON}
          >
            confirmar descarte
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setConfirming('reset')}
            disabled={!editor.dirty}
            data-probe="editor-reset"
            className={ACTION_BUTTON}
          >
            descartar ajustes
          </button>
        )}
      </div>

      {notice ? (
        <p className="text-[0.66rem] leading-snug text-neutral-600" role="status">
          {notice}
        </p>
      ) : null}

      <KeyframeExportPanel editor={editor} version={version} />

      <div className="flex flex-col gap-1 text-[0.66rem] leading-snug text-neutral-400">
        <p>
          Los cinco sliders de pose de abajo escriben sobre el keyframe seleccionado. No hay física
          acá: la cámara va exacto a la pose, que es la única forma de componerla con precisión.
        </p>
        <p>
          El <code>at</code> se mueve entre sus vecinos y no los pasa: para reordenar, corré primero
          al de al lado. Duplicar deja la copia a mitad de camino hacia el siguiente — es el patrón
          de sostén: se llega en el original y se aguanta hasta la copia.
        </p>
        <p>
          Acá el ángulo es el ACUMULADO, no el envuelto: el cierre se lee 360 y no 0, porque eso es
          lo que dice el dato y es lo que hace que el tramo de Demos dé la vuelta entera.
        </p>
        <p className="text-neutral-500">
          <strong className="font-semibold">Exportar no es guardar.</strong> El botón copia el
          bloque al portapapeles; la calibración solo queda cuando ese texto se pega en{' '}
          <code>choreography.ts</code>. Recargar sin pegar la pierde entera — ya pasó una vez.
        </p>
      </div>
    </div>
  )
}
