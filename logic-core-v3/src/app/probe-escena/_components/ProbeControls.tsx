'use client'

import { useCallback, useId, useState } from 'react'

import { ChoreographyControls } from './ChoreographyControls'
import { ProbeReadout } from './ProbeReadout'
import { StoreSlider } from './StoreSlider'
import {
  PROBE_PARAM_ORDER,
  PROBE_PARAM_SPECS,
  PROBE_RANGES,
  type ProbeMode,
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
 * ── Los dos modos ──────────────────────────────────────────────────────────
 *
 * En **coreografía** los siete sliders de escena quedan deshabilitados pero
 * siguen vivos como telemetría: muestran lo que el track dicta en cada frame, y
 * la línea copiable de abajo sirve para llevarse una pose. `particulas` sigue
 * habilitado en los dos modos, porque no es parte del recorrido.
 *
 * En **manual** el panel es exactamente el de siempre.
 */

/** Los canales que la coreografía maneja. Se bloquean cuando el track está al mando. */
const CHOREOGRAPHED = new Set<string>([
  'angleDeg',
  'height',
  'distance',
  'frameX',
  'frameY',
  'keyIntensity',
  'keyKelvin',
])

type ProbeControlsProps = {
  store: ProbeParamsStore
  stats: ProbeStatsStore
  rig: ProbeRigStore
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
  'flex-1 rounded-sm border px-2 py-1.5 text-[0.7rem] transition-colors'
const MODE_BUTTON_ON = 'border-neutral-900 bg-neutral-900 text-white'
const MODE_BUTTON_OFF = 'border-neutral-300 text-neutral-600 hover:bg-neutral-100'

export function ProbeControls({
  store,
  stats,
  rig,
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
        <button
          type="button"
          onClick={() => onModeChange('coreografia')}
          aria-pressed={isChoreo}
          data-probe="mode-coreografia"
          className={`${MODE_BUTTON_BASE} ${isChoreo ? MODE_BUTTON_ON : MODE_BUTTON_OFF}`}
        >
          coreografía
        </button>
        <button
          type="button"
          onClick={() => onModeChange('manual')}
          aria-pressed={!isChoreo}
          data-probe="mode-manual"
          className={`${MODE_BUTTON_BASE} ${!isChoreo ? MODE_BUTTON_ON : MODE_BUTTON_OFF}`}
        >
          manual
        </button>
      </div>

      {isChoreo ? (
        <ChoreographyControls
          rig={rig}
          playing={playing}
          onPlayingChange={onPlayingChange}
          physicsEnabled={physicsEnabled}
          onPhysicsChange={onPhysicsChange}
          reducedMotion={reducedMotion}
        />
      ) : null}

      <div className="flex flex-col gap-3 border-t border-neutral-200 pt-3">
        {isChoreo ? (
          <p className="text-[0.66rem] leading-snug text-neutral-400">
            Con la coreografía al mando, estos siete son la lectura de lo que el track dicta
            en este frame. Para componer una posición nueva, pasá a manual.
          </p>
        ) : null}

        {PROBE_PARAM_ORDER.map((key) => (
          <StoreSlider
            key={key}
            store={store}
            paramKey={key}
            range={PROBE_RANGES[key]}
            spec={PROBE_PARAM_SPECS[key]}
            disabled={isChoreo && CHOREOGRAPHED.has(key)}
            onManualChange={key === 'angleDeg' ? stopAutoOrbit : undefined}
          />
        ))}
      </div>

      <div className="flex flex-col gap-2 border-t border-neutral-200 pt-3">
        {!isChoreo ? (
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
              apagado: luces fijas al estudio, la vuelta cambia la iluminación. Encendido: la
              relación luz-observador queda fija y solo cambia la geometría.
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
      </div>
    </aside>
  )
}
