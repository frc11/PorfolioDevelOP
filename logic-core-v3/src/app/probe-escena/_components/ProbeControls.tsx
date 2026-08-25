'use client'

import { useCallback, useId, useState } from 'react'

import { ChoreographyControls } from './ChoreographyControls'
import type { ChoreoEditor } from './choreographyEditor'
import { CHOREO_CHANNELS } from './choreographyTypes'
import { KeyframeEditor } from './KeyframeEditor'
import { ProbeReadout } from './ProbeReadout'
import { StoreSlider } from './StoreSlider'
import { VariantPicker } from './VariantPicker'
import {
  PROBE_PARAM_ORDER,
  PROBE_PARAM_SPECS,
  PROBE_RANGES,
  type ProbeMode,
  type ProbeParamKey,
  type ProbeParamsStore,
  type ProbeRigStore,
  type ProbeStatsStore,
} from './probeStore'

/**
 * El panel del probe. Sin pretensión estética: son sliders sobre una caja
 * blanca, porque lo que se juzga es la escena de atrás y no esto.
 *
 * La regla que sí es dura: **ningún valor pasa por `setState`.** Los inputs son
 * no controlados y se suscriben al store (ver `StoreSlider`). Estado de React
 * hay solo para lo que cambia por click —el modo, los toggles, el panel— nunca
 * por frame.
 *
 * ── Los tres modos ─────────────────────────────────────────────────────────
 *
 * En **coreografía** los siete de escena (cinco de pose + dos de luz) quedan
 * deshabilitados pero siguen vivos como telemetría: muestran lo que el track
 * dicta en cada frame, y la línea copiable de abajo sirve para llevarse una pose.
 *
 * Los otros tres —**partículas**, **desajuste del fondo** y **barra de la
 * celosía**— siguen habilitados en los tres modos, porque no son parte del
 * recorrido: son las perillas que se calibran mirando la escena correr.
 *
 * La barra de la celosía entró en S11 y es la que más mueve el cuadro de las
 * tres: fija cuánta luz corta la rendija, y con eso el contraste de las bandas
 * sobre el papel, la amplitud del batido proyectado y —a través del factor de
 * cielo— la exposición de la sala entera. En **0** apaga la celosía y el piso
 * vuelve exactamente a lo que midió S10, que es el control contra el que se
 * juzga todo lo demás.
 *
 * En **editor** (S5) los CINCO de pose vuelven a estar habilitados, pero lo que
 * mueven es la pose del keyframe seleccionado, no la cámara suelta. Es el mismo
 * control con otro destinatario, y por eso no hay un segundo juego de sliders.
 * Los dos de luz quedan de lectura: desde S6 la iluminación no es del keyframe.
 *
 * En **manual** el panel es exactamente el de siempre, con una diferencia que
 * vale la pena saber: el slider de intensidad pasó a ser el maestro del rig
 * entero, no el de una sola lámpara.
 */

/** Los cinco canales de pose que la coreografía maneja. */
const POSE_KEYS = new Set<string>(CHOREO_CHANNELS)
/** Los dos de luz. Desde S6 no son de la pose: los dicta el arco. */
const LIGHT_KEYS = new Set<string>(['keyIntensity', 'keyKelvin'])

/**
 * Qué sliders quedan de solo lectura en cada modo.
 *
 * - **coreografía** — todo es telemetría: la pose la dicta el track y la luz el
 *   arco.
 * - **editor** — los cinco de pose vuelven a ser entrada, porque eso es lo que
 *   se está componiendo. Los dos de luz siguen bloqueados **y siguen vivos**:
 *   muestran lo que el arco dicta en el `at` del keyframe seleccionado, así que
 *   la pose se compone bajo la luz que ese momento va a tener de verdad. Ya no
 *   se pueden mover porque ya no son del keyframe.
 * - **manual** — todo es entrada. El de intensidad es además el maestro del rig
 *   entero (ver `ProbeParams.keyIntensity`).
 */
function isLocked(mode: ProbeMode, key: ProbeParamKey): boolean {
  if (mode === 'coreografia') return POSE_KEYS.has(key) || LIGHT_KEYS.has(key)
  if (mode === 'editor') return LIGHT_KEYS.has(key)
  return false
}

type ProbeControlsProps = {
  store: ProbeParamsStore
  stats: ProbeStatsStore
  rig: ProbeRigStore
  editor: ChoreoEditor
  mode: ProbeMode
  onModeChange: (next: ProbeMode) => void
  playing: boolean
  onPlayingChange: (next: boolean) => void
  physicsEnabled: boolean
  onPhysicsChange: (next: boolean) => void
  reducedMotion: boolean
  autoOrbit: boolean
  onAutoOrbitChange: (next: boolean) => void
  keyFollowsCamera: boolean
  onKeyFollowsCameraChange: (next: boolean) => void
}

const MODE_BUTTON_BASE =
  'flex-1 rounded-sm border px-1.5 py-1.5 text-[0.68rem] transition-colors'
const MODE_BUTTON_ON = 'border-neutral-900 bg-neutral-900 text-white'
const MODE_BUTTON_OFF = 'border-neutral-300 text-neutral-600 hover:bg-neutral-100'

/** Los tres modos, en el orden en que se usan: mirar, ajustar, componer. */
const MODES: readonly { readonly value: ProbeMode; readonly label: string }[] = [
  { value: 'coreografia', label: 'coreografía' },
  { value: 'editor', label: 'editor' },
  { value: 'manual', label: 'manual' },
]

export function ProbeControls({
  store,
  stats,
  rig,
  editor,
  mode,
  onModeChange,
  playing,
  onPlayingChange,
  physicsEnabled,
  onPhysicsChange,
  reducedMotion,
  autoOrbit,
  onAutoOrbitChange,
  keyFollowsCamera,
  onKeyFollowsCameraChange,
}: ProbeControlsProps) {
  const [isOpen, setIsOpen] = useState(true)
  const followId = useId()

  const isChoreo = mode === 'coreografia'
  const isEditor = mode === 'editor'

  // Mover el ángulo a mano corta la órbita automática. Si no, el slider y el
  // loop se pelean por el mismo valor y no se puede parar en un ángulo.
  const stopAutoOrbit = useCallback(() => {
    if (autoOrbit) onAutoOrbitChange(false)
  }, [autoOrbit, onAutoOrbitChange])

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="absolute top-4 left-4 rounded-sm border border-neutral-300 bg-white/95 px-3 py-2 text-[0.72rem] text-neutral-700 shadow-sm hover:bg-white"
      >
        mostrar controles
      </button>
    )
  }

  return (
    <aside className="absolute top-4 left-4 flex max-h-[calc(100vh-2rem)] w-[19rem] flex-col gap-4 overflow-y-auto rounded-sm border border-neutral-200 bg-white/95 p-4 shadow-sm">
      <header className="flex items-baseline justify-between gap-3">
        <h1 className="font-ds-mono text-[0.7rem] tracking-wide text-neutral-500 uppercase">
          probe · escena
        </h1>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="text-[0.68rem] text-neutral-500 underline underline-offset-2 hover:text-neutral-900"
        >
          ocultar
        </button>
      </header>

      <div className="flex gap-2" role="group" aria-label="modo del probe">
        {MODES.map((entry) => (
          <button
            key={entry.value}
            type="button"
            onClick={() => onModeChange(entry.value)}
            aria-pressed={mode === entry.value}
            data-probe={`mode-${entry.value}`}
            className={`${MODE_BUTTON_BASE} ${mode === entry.value ? MODE_BUTTON_ON : MODE_BUTTON_OFF}`}
          >
            {entry.label}
          </button>
        ))}
      </div>

      {/*
        EL SELECTOR DE RECORRIDO (S7). Va arriba de todo y fuera de los modos:
        se cambia de variante tanto mirando (coreografía) como componiendo
        (editor), y la lectura de cuál está activa tiene que estar a la vista en
        los dos. En manual no aplica —ahí no hay recorrido— pero se deja igual,
        porque esconderlo obligaría a volver de modo para ver en cuál se estaba.
      */}
      <VariantPicker editor={editor} />

      {isChoreo ? (
        <ChoreographyControls
          rig={rig}
          editor={editor}
          playing={playing}
          onPlayingChange={onPlayingChange}
          physicsEnabled={physicsEnabled}
          onPhysicsChange={onPhysicsChange}
          reducedMotion={reducedMotion}
        />
      ) : null}

      {isEditor ? <KeyframeEditor editor={editor} store={store} rig={rig} /> : null}

      <div className="flex flex-col gap-3 border-t border-neutral-200 pt-3">
        {isChoreo ? (
          <p className="text-[0.66rem] leading-snug text-neutral-400">
            Con la coreografía al mando, los primeros siete son la lectura de lo que el
            track y el arco de luz dictan en este frame. Para ajustar el keyframe que se
            está viendo, pasá al editor; para componer una posición nueva desde cero, a
            manual. Los tres últimos —partículas, desajuste del fondo y barra de la
            celosía— siguen activos: son de la escena, no del recorrido.
          </p>
        ) : null}

        {isEditor ? (
          <p className="text-[0.66rem] leading-snug text-neutral-400">
            Los cinco de pose escriben sobre el keyframe seleccionado arriba, en vivo. Los dos
            de luz son lectura: desde S6 la iluminación no es del keyframe sino de una curva
            del recorrido (<code>LIGHT_ARC</code>), y lo que muestran es lo que a este momento
            le toca.
          </p>
        ) : null}

        {PROBE_PARAM_ORDER.map((key) => (
          <StoreSlider
            key={key}
            store={store}
            paramKey={key}
            range={PROBE_RANGES[key]}
            spec={PROBE_PARAM_SPECS[key]}
            disabled={isLocked(mode, key)}
            onManualChange={key === 'angleDeg' ? stopAutoOrbit : undefined}
          />
        ))}
      </div>

      <div className="flex flex-col gap-2 border-t border-neutral-200 pt-3">
        {mode === 'manual' ? (
          <button
            type="button"
            onClick={() => onAutoOrbitChange(!autoOrbit)}
            aria-pressed={autoOrbit}
            data-probe="auto-orbit"
            className="rounded-sm border border-neutral-900 bg-neutral-900 px-3 py-2 text-[0.72rem] text-white hover:bg-neutral-800"
          >
            {autoOrbit ? 'detener la órbita' : 'recorrer la órbita completa'}
          </button>
        ) : null}

        <div className="flex items-start gap-2">
          <input
            id={followId}
            type="checkbox"
            checked={keyFollowsCamera}
            onChange={(event) => onKeyFollowsCameraChange(event.currentTarget.checked)}
            data-probe="key-follows"
            className="mt-0.5 accent-neutral-900"
          />
          <label htmlFor={followId} className="text-[0.7rem] leading-snug text-neutral-600">
            la luz sigue a la cámara
            <span className="block text-neutral-400">
              apagado: principal y relleno fijos al estudio, así que la vuelta cambia la
              iluminación. Encendido: los dos pasan a ser solidarios y solo cambia la
              geometría. El contraluz ya es solidario siempre — de eso vive.
            </span>
          </label>
        </div>
      </div>

      <ProbeReadout store={store} stats={stats} />

      <div className="flex flex-col gap-1 text-[0.66rem] leading-snug text-neutral-400">
        <p>0° = de frente · 90° y 270° = perfil · 180° = de atrás (el logo se lee espejado).</p>
        <p>
          Encuadre: 0 = centrado · +1 = derecha / arriba · −1 = izquierda / abajo. Corre el logo en
          pantalla sin cambiar el ángulo desde el que se lo mira, para que el contenido pueda ocupar
          el otro costado.
        </p>
        <p>
          El ángulo se publica envuelto a 0–360, así que el keyframe del cierre —documentado como
          360°— se lee 0,0°. Es la misma posición de cámara: el recorrido acumula la vuelta entera
          por dentro.
        </p>
        <p>
          Desajuste del fondo: cuántas bandas de batido hay en una vuelta de la envolvente. En 0
          las dos tramas quedan en 2:1 exacto y el batido de TEXTURA desaparece — lo que sigue
          viéndose ahí es el que produce el paralaje entre las dos capas, que están separadas en
          profundidad.
        </p>
      </div>
    </aside>
  )
}
