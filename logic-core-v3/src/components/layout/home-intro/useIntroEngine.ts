'use client'

import {
  animate,
  useMotionValue,
  type AnimationPlaybackControls,
  type MotionValue,
} from 'motion/react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import {
  EMPTY_FLIGHT_PLAN,
  introLockupText,
  planIntroFlight,
  type IntroInkSize,
  type IntroLockupText,
} from './introFlight'
import { HOME_INTRO_PHASES, buildTimeline, type HomeIntroPhases } from './introTimeline'
import { useIntroChannels, type IntroChannels } from './useIntroChannels'
import { useViewportSize } from './useViewportSize'
import type { IntroDevApi } from './IntroDevController'
import type { IntroTimeline } from './introTimeline'

/**
 * EL MOTOR DEL INTRO — el progreso, el plan y los controles. Sin ciclo de vida.
 *
 * Lo consumen dos componentes con reglas de arranque muy distintas:
 *
 *  - `HomeIntro.tsx`, en el home, detrás del gate pre-paint y de la sesión.
 *  - `IntroPreview.tsx`, **solo en desarrollo**, para correr la secuencia sobre
 *    la escena real del probe sin gate ninguno.
 *
 * Lo que decide SI corre y qué pasa cuando termina es de cada uno. Lo que
 * decide CÓMO corre es de acá, y es uno solo: separarlo es lo que evita que el
 * preview y el home se vayan desincronizando.
 *
 * ── Una sola animación viva ────────────────────────────────────────────────
 *
 * `progress` va de 0 a 1, lineal, y todo lo demás es función pura de ese
 * número (`introSampling.ts`, `introFlight.ts`, `useIntroChannels.ts`). Dos
 * consecuencias: nada de lo que ocurre en el mismo instante puede desfasarse
 * —el relevo 2D→3D y el cambio de color cuelgan del mismo valor, igual que el
 * desplazamiento y la rotación del acomodamiento— y la secuencia se puede
 * **scrubear**, que es lo que hace posible el controlador.
 *
 * ── Cero `setState` por frame ──────────────────────────────────────────────
 *
 * Durante los ~8 s React no re-renderiza. Los únicos `setState` son por gesto
 * humano (mover una perilla) o por cambio de ventana.
 */

/**
 * Fuerza a recomputar todo lo derivado del progreso.
 *
 * Un MotionValue **solo notifica si el valor cambia** (`motion-dom`:
 * `if (this.current !== this.prev)`), así que reasignar el mismo número no
 * hace nada. Se lo mueve un épsilon: 1e-7 del progreso son 0,5 µs de la
 * secuencia — por debajo de cualquier cosa que se pueda ver.
 */
const NUDGE = 1e-7
function nudge(progress: MotionValue<number>): void {
  const current = progress.get()
  progress.set(current > 0.5 ? current - NUDGE : current + NUDGE)
}

export type IntroEngineOptions = {
  /** `true` mientras la secuencia tiene que estar corriendo. */
  running: boolean
  /** Se dispara al llegar a 1. */
  onComplete: () => void
  /** El controlador pidió repetir: el dueño tiene que volver a `running`. */
  onReplay?: () => void
}

export type IntroEngine = {
  progress: MotionValue<number>
  channels: IntroChannels
  /** El tamaño de la tinta. Sale del destino y no cambia en toda la secuencia. */
  ink: IntroInkSize
  /** Cuerpos y separación del texto, derivados de ese tamaño. */
  text: IntroLockupText
  timelineRef: React.RefObject<IntroTimeline>
  /** `null` en producción: ver la nota abajo. */
  devApi: IntroDevApi | null
  handleMeshReady: () => void
}

export function useIntroEngine(options: IntroEngineOptions): IntroEngine {
  const { running, onComplete, onReplay } = options

  const [phases, setPhases] = useState<HomeIntroPhases>(HOME_INTRO_PHASES)
  const [runId, setRunId] = useState(0)

  const viewport = useViewportSize()
  const timeline = useMemo(() => buildTimeline(phases), [phases])
  // El plan es función pura del tamaño de la ventana: de acá salen tanto lo que
  // los muestreadores leen por frame como lo que el layout necesita en el render.
  const plan = useMemo(() => planIntroFlight(viewport.width, viewport.height), [viewport])
  const text = useMemo(() => introLockupText(plan.ink.heightPx), [plan])

  // Todo lo que los muestreadores necesitan vive en refs, no en closures: así
  // el comportamiento es siempre el actual sin depender de que `motion`
  // reemplace la función de un `useTransform` al re-renderizar.
  const timelineRef = useRef(timeline)
  const planRef = useRef(EMPTY_FLIGHT_PLAN)
  const meshReadyRef = useRef(false)
  const meshLatchRef = useRef<boolean | null>(null)
  const controlsRef = useRef<AnimationPlaybackControls | null>(null)

  const progress = useMotionValue(0)
  const channels = useIntroChannels(progress, {
    timelineRef,
    planRef,
    meshReadyRef,
    meshLatchRef,
  })

  const handleMeshReady = useCallback(() => {
    meshReadyRef.current = true
  }, [])

  // ── Publicar el plan y el ritmo a los muestreadores ───────────────────────
  useEffect(() => {
    timelineRef.current = timeline
    planRef.current = plan
    nudge(progress)
  }, [plan, timeline, progress])

  // ── El driver: la única animación viva de toda la secuencia ───────────────
  useEffect(() => {
    if (!running) return

    meshLatchRef.current = null
    progress.set(0)

    const controls = animate(progress, 1, {
      duration: timelineRef.current.totalS,
      ease: 'linear',
      onComplete,
    })
    controlsRef.current = controls

    return () => {
      controls.stop()
      controlsRef.current = null
    }
    // `onComplete` queda fuera a propósito: si el dueño lo redefine por render,
    // reiniciaría la secuencia. Lo que la reinicia es `running` o `runId`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, runId, progress])

  const replay = useCallback(() => {
    meshLatchRef.current = null
    progress.set(0)
    setRunId((value) => value + 1)
    onReplay?.()
  }, [progress, onReplay])

  /**
   * EL API DEL CONTROLADOR — **tampoco se construye en producción.**
   *
   * El chunk del controlador ya quedaba fuera del build, pero este objeto no:
   * se armaba igual, con sus closures y sus strings, para que no lo leyera
   * nadie. El grep de S8c lo agarró — el `'fallback SVG'` de `getMeshState`
   * estaba viajando en el chunk de cliente del home.
   *
   * Con el ternario adentro del `useMemo`, `NODE_ENV` es una constante literal
   * en el build y el objeto entero cae como código muerto. El hook se sigue
   * llamando siempre, que es lo que las reglas de hooks piden.
   */
  const devApi = useMemo<IntroDevApi | null>(
    () =>
      process.env.NODE_ENV === 'production'
        ? null
        : {
            progress,
            phases,
            setPhases,
            getTimeline: () => timelineRef.current,
            getPlan: () => planRef.current,
            getMeshState: () =>
              meshLatchRef.current === false
                ? 'fallback SVG'
                : meshReadyRef.current
                  ? 'listo'
                  : 'cargando',
            replay,
            play: () => controlsRef.current?.play(),
            pause: () => controlsRef.current?.pause(),
            seek: (value: number) => {
              const controls = controlsRef.current
              if (controls) controls.time = value * timelineRef.current.totalS
              else progress.set(value)
            },
          },
    [progress, phases, replay]
  )

  return { progress, channels, ink: plan.ink, text, timelineRef, devApi, handleMeshReady }
}
