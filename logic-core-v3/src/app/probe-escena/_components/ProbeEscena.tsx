'use client'

import dynamic from 'next/dynamic'
import { Component, useCallback, useState, type ReactNode } from 'react'

import { useReducedMotion } from '@/lib/use-reduced-motion'

import { createChoreoEditor } from './choreographyEditor'
import { ProbeControls } from './ProbeControls'
import { FOG_COLOR } from './probeAtmosphere'
import {
  PROBE_DEFAULTS,
  PROBE_RIG_DEFAULTS,
  PROBE_STATS_DEFAULTS,
  createNumericStore,
  type ProbeMode,
  type ProbeParams,
  type ProbeRig,
  type ProbeStats,
} from './probeStore'

/**
 * Raíz del probe. Dueña de los TRES stores, del track editable (S5) y de lo que
 * sí es estado de React porque cambia por click: el modo, la reproducción, la
 * física, la órbita automática, la luz solidaria y la escena lista.
 *
 * Nada más vive acá. Ni los valores de los sliders ni el progreso de la
 * coreografía pasan por el árbol de React: viven en los stores y el `useFrame`
 * los lee y escribe directo.
 *
 * El track editable se crea acá y no adentro del canvas porque lo comparten los
 * dos lados: el `useFrame` lo muestrea y el panel del editor lo modifica. Su
 * constructor no valida nada a propósito —ver la nota en `choreographyEditor.ts`
 * sobre por qué el track es perezoso—, así que crearlo no puede tirar y el
 * `StageErrorBoundary` sigue siendo el que contiene los errores de datos.
 *
 * `three` entra por `dynamic(ssr:false)` — sin eso el bundle del servidor se
 * lleva la librería entera, y de paso ese import es lo que aísla el peso de la
 * escena en su propio chunk, que es lo que el reporte tiene que medir.
 */

const ProbeStage = dynamic(() => import('./ProbeStage'), { ssr: false })

/**
 * Contención del canvas. `<Canvas>` re-lanza hacia afuera cualquier error de su
 * árbol, así que sin esto un fallo de WebGL —o de la validación del track de
 * coreografía, que corre al importar el módulo del rig— se lleva puesta la ruta
 * entera y no queda ni el panel para entender qué pasó. Mismo patrón que
 * `HeroArtifactLayer` (que no se toca ni se importa: su boundary es privado).
 */
class StageErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error) {
    console.warn('probe-escena: el canvas falló y quedó contenido.', error)
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div className="flex h-full w-full items-center justify-center">
        <p className="font-ds-mono text-[0.75rem] text-neutral-500">
          El canvas falló. El detalle está en la consola del navegador.
        </p>
      </div>
    )
  }
}

export function ProbeEscena() {
  // `useState` con inicializador perezoso y sin setter: es la forma garantizada
  // de crear cada store una sola vez sin escribir un ref durante el render.
  const [store] = useState(() => createNumericStore<ProbeParams>(PROBE_DEFAULTS))
  const [stats] = useState(() => createNumericStore<ProbeStats>(PROBE_STATS_DEFAULTS))
  const [rig] = useState(() => createNumericStore<ProbeRig>(PROBE_RIG_DEFAULTS))
  const [editor] = useState(() => createChoreoEditor())

  const [mode, setMode] = useState<ProbeMode>('coreografia')
  const [playing, setPlaying] = useState(false)
  const [physicsEnabled, setPhysicsEnabled] = useState(true)
  const [autoOrbit, setAutoOrbit] = useState(false)
  const [keyFollowsCamera, setKeyFollowsCamera] = useState(false)
  const [isReady, setIsReady] = useState(false)

  const reducedMotion = useReducedMotion()

  // Dispara una vez, cuando el logo existe en la escena. No es un evento por
  // frame: viene del efecto de montaje de `ProbeLogo`.
  const handleReady = useCallback(() => setIsReady(true), [])

  // Llega desde el `useFrame` cuando el progreso toca 1. Es la ÚNICA salida del
  // loop hacia React, y ocurre una vez por pasada.
  const handlePlayEnd = useCallback(() => setPlaying(false), [])

  /**
   * Los dos modos son excluyentes también en sus automatismos: la reproducción
   * es de la coreografía y la órbita automática es de manual. Dejar uno
   * corriendo al cambiar de modo sería un motor girando en vacío.
   */
  const handleModeChange = useCallback((next: ProbeMode) => {
    setMode(next)
    setPlaying(false)
    setAutoOrbit(false)
  }, [])

  return (
    // El color sale de la MISMA constante que pinta el fondo de la escena 3D:
    // si divergieran, se vería un salto en el momento en que el canvas monta.
    // Desde S6 ese fondo es el de la niebla, no el del papel — son casi el mismo
    // valor, pero el que hay que igualar es el que el canvas pinta.
    <main className="fixed inset-0 overflow-hidden" style={{ backgroundColor: FOG_COLOR }}>
      <div className="absolute inset-0">
        <StageErrorBoundary>
          <ProbeStage
            store={store}
            rig={rig}
            stats={stats}
            editor={editor}
            mode={mode}
            physicsEnabled={physicsEnabled}
            playing={playing}
            onPlayEnd={handlePlayEnd}
            reducedMotion={reducedMotion}
            autoOrbit={autoOrbit}
            keyFollowsCamera={keyFollowsCamera}
            onReady={handleReady}
          />
        </StageErrorBoundary>
      </div>

      {!isReady ? (
        <p className="absolute inset-x-0 bottom-10 text-center font-ds-mono text-[0.72rem] text-neutral-400">
          cargando la escena…
        </p>
      ) : null}

      <ProbeControls
        store={store}
        stats={stats}
        rig={rig}
        editor={editor}
        mode={mode}
        onModeChange={handleModeChange}
        playing={playing}
        onPlayingChange={setPlaying}
        physicsEnabled={physicsEnabled}
        onPhysicsChange={setPhysicsEnabled}
        reducedMotion={reducedMotion}
        autoOrbit={autoOrbit}
        onAutoOrbitChange={setAutoOrbit}
        keyFollowsCamera={keyFollowsCamera}
        onKeyFollowsCameraChange={setKeyFollowsCamera}
      />
    </main>
  )
}
