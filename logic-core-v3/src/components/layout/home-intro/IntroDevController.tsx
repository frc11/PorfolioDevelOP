'use client'

import type { MotionValue } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'

import type { IntroFlightPlan } from './introFlight'
import { introPhaseName, sampleIntro } from './introSampling'
import { sampleInkShading, srgbToHex } from './introShading'
import { type HomeIntroPhases, type IntroTimeline } from './introTimeline'

/**
 * EL CONTROLADOR DEL INTRO — solo desarrollo. **Ni un byte en producción.**
 *
 * Sus dos puntos de montaje lo piden detrás de un
 * `process.env.NODE_ENV === 'production' ? null : dynamic(() => import(...))`
 * (`HomeIntro.tsx` para el home, `ProbeEscena.tsx` para la escena real), y el
 * `devApi` que consume tampoco se construye en producción. En el build los dos
 * ternarios se pliegan a `null` —`NODE_ENV` es una constante literal ahí— y con
 * la única referencia al `import()` en la rama muerta, webpack descarta el chunk
 * entero.
 *
 * ── Para qué existe ────────────────────────────────────────────────────────
 *
 * El intro dura ~8 s, corre una sola vez por sesión y sus dos momentos difíciles
 * —el relevo 2D→3D escondido adentro de la transformación de color, y el
 * acomodamiento— no se pueden juzgar a velocidad real. Acá se lo repite, se lo
 * pausa, se lo scrubea hasta el frame exacto y se le mueven los siete tiempos
 * mirando la pantalla.
 *
 * ── Cero `setState` por frame ──────────────────────────────────────────────
 *
 * Las lecturas en vivo se escriben con `textContent` directo sobre nodos
 * guardados en refs, desde una suscripción al MotionValue del progreso. React
 * no re-renderiza durante la reproducción. Los sliders sí hacen `setState`,
 * una vez por gesto — que es lo correcto: cambian la estructura, no un frame.
 */

export type IntroDevApi = {
  readonly progress: MotionValue<number>
  readonly phases: HomeIntroPhases
  setPhases: (next: HomeIntroPhases) => void
  getTimeline: () => IntroTimeline
  getPlan: () => IntroFlightPlan
  getMeshState: () => string
  replay: () => void
  play: () => void
  pause: () => void
  seek: (progress: number) => void
}

const PHASE_CONTROLS: readonly {
  key: keyof HomeIntroPhases
  label: string
  max: number
}[] = [
  { key: 'strokeS', label: 'trazo', max: 4 },
  { key: 'fillS', label: 'relleno', max: 2 },
  { key: 'holdS', label: 'espera', max: 3 },
  { key: 'colorS', label: 'color', max: 3 },
  { key: 'letterOutS', label: 'sale letra', max: 2 },
  { key: 'veilOutS', label: 'sale fondo', max: 3 },
  { key: 'placeS', label: 'acomodar', max: 8 },
]

const ROW = 'flex items-center gap-2 text-[11px] leading-tight'
const FIELD = 'w-full accent-white'
const BUTTON = 'rounded bg-white/10 px-2 py-1 text-[11px]'

function readout(api: IntroDevApi, value: number): string {
  const timeline = api.getTimeline()
  const plan = api.getPlan()
  const sample = sampleIntro(timeline, value)
  const shading = sampleInkShading(sample.place)
  const destination = plan.destination
  return [
    `fase      ${introPhaseName(timeline, value)}`,
    `t         ${sample.timeS.toFixed(3)}s / ${timeline.totalS.toFixed(3)}s`,
    `progreso  ${value.toFixed(4)}`,
    `trazo     ${sample.strokeDraw.toFixed(3)}   relleno ${sample.fill.toFixed(3)}`,
    `fondo     ${sample.backgroundShift.toFixed(3)}   tinta ${sample.inkFlip.toFixed(3)}   relevo ${sample.swap.toFixed(3)}`,
    `color     ${srgbToHex(sample.ink)} sobre ${srgbToHex(sample.background)}`,
    `velo      ${sample.veilOpacity.toFixed(3)}   texto ${sample.sloganOpacity.toFixed(3)}`,
    `mesh      ${api.getMeshState()}`,
    `tinta     ${plan.ink.widthPx.toFixed(0)}×${plan.ink.heightPx.toFixed(0)}px  (constante)`,
    `acomodo   ${sample.place.toFixed(3)}   luz ${(1 - shading.emissiveMix).toFixed(3)}   sombra ${shading.shadowOpacity.toFixed(3)}`,
    destination
      ? `destino   @ (${destination.centerXPx.toFixed(0)}, ${destination.centerYPx.toFixed(0)})   clamp ${destination.widthClamp.toFixed(3)}`
      : 'destino   SIN DESTINO — el logo no se mueve',
  ].join('\n')
}

export function IntroDevController({ api }: { api: IntroDevApi }) {
  const [open, setOpen] = useState(false)
  const [paused, setPaused] = useState(false)

  const readoutRef = useRef<HTMLPreElement>(null)
  const scrubRef = useRef<HTMLInputElement>(null)
  const scrubbingRef = useRef(false)

  // Atajo: se abre y se cierra sin quitarle el foco a la página.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'i' && event.altKey) setOpen((value) => !value)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // La lectura en vivo: escritura directa al DOM, sin pasar por React.
  useEffect(() => {
    if (!open) return
    const write = (value: number) => {
      const node = readoutRef.current
      if (node) node.textContent = readout(api, value)
      // El slider sigue al progreso, salvo mientras el humano lo está arrastrando.
      if (scrubRef.current && !scrubbingRef.current) {
        scrubRef.current.value = String(value)
      }
    }
    write(api.progress.get())
    return api.progress.on('change', write)
  }, [api, open])

  const setPhase = useCallback(
    (key: keyof HomeIntroPhases, value: number) => {
      api.setPhases({ ...api.phases, [key]: value })
    },
    [api]
  )

  const togglePlay = useCallback(() => {
    setPaused((value) => {
      if (value) api.play()
      else api.pause()
      return !value
    })
  }, [api])

  const seekTo = useCallback(
    (timeS: number) => {
      api.pause()
      setPaused(true)
      api.seek(timeS / api.getTimeline().totalS)
    },
    [api]
  )

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-2 left-2 z-[10000] rounded bg-black/70 px-2 py-1 font-mono text-[10px] text-white/70 backdrop-blur"
      >
        intro ⌥I
      </button>
    )
  }

  return (
    <div className="fixed bottom-2 left-2 z-[10000] w-80 space-y-2 rounded-lg border border-white/15 bg-black/85 p-3 font-mono text-white/85 backdrop-blur">
      <div className="flex items-center justify-between text-[11px] font-semibold">
        <span>intro · controlador</span>
        <button type="button" onClick={() => setOpen(false)} className="text-white/50">
          ocultar
        </button>
      </div>

      <div className="flex gap-1">
        <button
          type="button"
          onClick={() => {
            setPaused(false)
            api.replay()
          }}
          className="flex-1 rounded bg-white/15 px-2 py-1 text-[11px]"
        >
          ▶ reproducir
        </button>
        <button type="button" onClick={togglePlay} className={BUTTON}>
          {paused ? '▶' : '⏸'}
        </button>
        <button
          type="button"
          onClick={() => {
            const timeline = api.getTimeline()
            seekTo((timeline.swapStartS + timeline.swapEndS) / 2)
          }}
          className={BUTTON}
          title="Parar en el centro del relevo 2D→3D"
        >
          ⏺ relevo
        </button>
        <button
          type="button"
          onClick={() => seekTo(api.getTimeline().placeStartS)}
          className={BUTTON}
          title="Parar donde arranca el acomodamiento"
        >
          ⏭ acomodo
        </button>
      </div>

      <label className={ROW}>
        <span className="w-20 shrink-0 text-white/50">progreso</span>
        <input
          ref={scrubRef}
          type="range"
          min={0}
          max={1}
          step={0.0002}
          defaultValue={0}
          className={FIELD}
          onPointerDown={() => {
            scrubbingRef.current = true
            api.pause()
            setPaused(true)
          }}
          onPointerUp={() => {
            scrubbingRef.current = false
          }}
          onChange={(event) => api.seek(Number(event.target.value))}
        />
      </label>

      {PHASE_CONTROLS.map((control) => (
        <label key={control.key} className={ROW}>
          <span className="w-20 shrink-0 text-white/50">{control.label}</span>
          <input
            type="range"
            min={0}
            max={control.max}
            step={0.02}
            value={api.phases[control.key]}
            className={FIELD}
            onChange={(event) => setPhase(control.key, Number(event.target.value))}
          />
          <span className="w-10 shrink-0 text-right tabular-nums">
            {api.phases[control.key].toFixed(2)}
          </span>
        </label>
      ))}

      <pre ref={readoutRef} className="whitespace-pre text-[10px] leading-snug text-white/70" />

      <p className="text-[10px] leading-snug text-white/40">
        el tamaño del logo lo fija la escena y no cambia nunca. Qué tan angosta es la inversión
        de la tinta y el relevo dentro de la transformación (
        <span className="text-white/60">INK_FLIP_FRAC</span>,{' '}
        <span className="text-white/60">SWAP_FRAC</span>), las proporciones del texto (
        <span className="text-white/60">INTRO_LOCKUP_TEXT</span>) y la sombra (
        <span className="text-white/60">INTRO_SHADOW</span>) se editan en{' '}
        <span className="text-white/60">introTimeline.ts</span>.
      </p>
    </div>
  )
}
