'use client'

import type { MotionValue } from 'motion/react'
import { useEffect, useMemo, useRef, type RefObject } from 'react'

import { buildIntroParticles } from './introParticleField'
import type { IntroParticleField } from './introParticles'
import { introParticleWindows, sampleMote } from './introParticleTiming'
import { buildIntroSpriteAtlas, type IntroSpriteAtlas } from './introParticleSprites'
import { introTimeS } from './introSampling'
import type { IntroTimeline } from './introTimeline'
import type { ViewportSize } from './useViewportSize'

/**
 * LAS PARTÍCULAS DEL PRELOADER — un canvas 2D, debajo del lockup.
 *
 * ── Por qué acá y no en el rig 3D que ya existe ────────────────────────────
 *
 * Tres razones, y las tres se midieron antes de elegir:
 *
 *  1. **La marca las tapa en todo instante y sin discontinuidad.** Esta capa es
 *     hermana del velo y va DEBAJO del lockup, así que primero la oculta el SVG
 *     relleno y después el mesh del canvas de arriba — igual que en la escena,
 *     donde `depthTest` sigue activo y "el logo SÍ las tapa". En el canvas
 *     ortográfico serían la capa de más arriba y taparían la marca, y al llegar
 *     el relevo el mesh empezaría a ocluirlas: un cambio de oclusión justo
 *     adentro de la ventana que la regla del cruce protege.
 *  2. **`sizeAttenuation` es no-op con cámara ortográfica** (`points.glsl.js`
 *     solo lo aplica si `isPerspectiveMatrix`), así que `PointsMaterial.size`
 *     sería un uniform por draw call: la distribución medida de 1,34 a 12,77 px
 *     habría que bucketearla en vez de tenerla continua.
 *  3. **No depende del chunk de `three`.** Si ese chunk no llega, el mesh no
 *     aparece —eso ya está aceptado y tiene su fallback— pero las partículas sí.
 *
 * ── Cero `setState` por frame ──────────────────────────────────────────────
 *
 * El único suscriptor es `progress.on('change')`, que corre en el mismo paso de
 * cuadro que el resto de los canales. React no re-renderiza ni una vez durante
 * la secuencia: todo lo que cambia vive en refs y en el bitmap.
 *
 * ── `will-change` no aplica, y conviene decir por qué ──────────────────────
 *
 * La regla del repo es `will-change: transform` sobre lo que se anima. Acá no se
 * anima ninguna propiedad compuesta: el elemento está quieto y lo que cambia es
 * el **bitmap**. Marcarlo solo le pediría al navegador una capa extra sin nada
 * que promover.
 *
 * ── El campo se recalcula al cambiar la ventana, no por cuadro ─────────────
 *
 * `buildIntroParticles` proyecta 3.090 puntos: es trabajo de montaje, no de
 * cuadro. Por cuadro solo hay un `clearRect` y un `drawImage` por mota visible.
 */

type IntroParticleCanvasProps = {
  /** El único progreso de la secuencia. */
  progress: MotionValue<number>
  /** El ritmo vigente. Cambia cuando el controlador mueve una perilla. */
  timelineRef: RefObject<IntroTimeline>
  /** El tamaño de la ventana. Con la pestaña oculta llega en 0 y no se dibuja. */
  viewport: ViewportSize
}

/** El mismo techo que el canvas 3D: `dpr={[1, 1.5]}`, la regla del repo. */
const MAX_DPR = 1.5
/** Por debajo de esto la mota no aporta un byte: no vale el `drawImage`. */
const MIN_ALPHA = 1 / 512

export function IntroParticleCanvas({
  progress,
  timelineRef,
  viewport,
}: IntroParticleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const atlasRef = useRef<IntroSpriteAtlas | null>(null)
  const paintedRef = useRef(false)

  const field: IntroParticleField = useMemo(
    () => buildIntroParticles(viewport.width, viewport.height),
    [viewport.width, viewport.height]
  )

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || viewport.width <= 0 || viewport.height <= 0) return

    const dpr = Math.min(MAX_DPR, window.devicePixelRatio || 1)
    canvas.width = Math.round(viewport.width * dpr)
    canvas.height = Math.round(viewport.height * dpr)
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    // Se dibuja en píxeles CSS, que es la unidad en la que el campo está medido.
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    paintedRef.current = false

    const draw = (value: number): void => {
      const timeline = timelineRef.current
      const windows = introParticleWindows(timeline)
      const timeS = introTimeS(timeline, value)

      // Fuera de las dos ventanas no hay una sola mota con alfa. Se limpia UNA
      // vez al salir y después se sale sin tocar el contexto: el intro pasa la
      // mitad de su reloj en esa condición.
      if (timeS < windows.inStartS || timeS >= windows.outEndS) {
        if (paintedRef.current) {
          ctx.clearRect(0, 0, viewport.width, viewport.height)
          paintedRef.current = false
        }
        return
      }

      const atlas = atlasRef.current ?? (atlasRef.current = buildIntroSpriteAtlas())
      if (!atlas) return

      ctx.clearRect(0, 0, viewport.width, viewport.height)
      paintedRef.current = true

      for (const mote of field.motes) {
        const sample = sampleMote(timeline, value, mote)
        if (sample.alpha <= MIN_ALPHA) continue
        const sprite = mote.tint < 0 ? atlas.bokeh : atlas.dust[mote.tint]
        const size = sample.sizePx
        ctx.globalAlpha = sample.alpha
        ctx.drawImage(sprite, sample.xPx - size / 2, sample.yPx - size / 2, size, size)
      }
      ctx.globalAlpha = 1
    }

    draw(progress.get())
    return progress.on('change', draw)
  }, [field, progress, timelineRef, viewport.width, viewport.height])

  return (
    <canvas
      ref={canvasRef}
      data-intro-particles=""
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  )
}
