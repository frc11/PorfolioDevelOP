'use client'

import { useTransform, type MotionValue } from 'motion/react'
import type { RefObject } from 'react'

import type { IntroFlightPlan } from './introFlight'
import { sampleLogoPose } from './introFlight'
import { sampleRelay } from './introRelay'
import {
  sampleBackgroundColor,
  sampleFill,
  sampleInkColor,
  sampleLineOpacity,
  sampleStrokeDraw,
  sampleSwap,
  sampleVeilOpacity,
} from './introSampling'
import { srgbToHex } from './introShading'
import { type IntroTimeline } from './introTimeline'

/**
 * LOS CANALES — cada cosa que se ve, derivada del ÚNICO progreso.
 *
 * Acá está el cableado completo entre "un número de 0 a 1" y las trece cosas que
 * ese número mueve. `useIntroEngine` se queda con el motor y `HomeIntro` con el
 * ciclo de vida del home.
 *
 * ── No hay canal de escala, y es a propósito ───────────────────────────────
 *
 * El logo no cambia de tamaño en ningún momento de la secuencia (S8d), así que
 * no existe dónde escribir una escala. `logoInkHeight` sale del plan y no del
 * progreso.
 *
 * ── Un solo string de color para las dos capas ─────────────────────────────
 *
 * `ink` es el `#RRGGBB` que pinta el SVG **y** el que el canvas convierte en
 * emisiva del mesh. No son dos cálculos que haya que mantener sincronizados:
 * es el mismo string. Es lo que hace que el relevo 2D→3D sea invisible.
 *
 * ── Por qué todo entra por refs y no por closures ──────────────────────────
 *
 * Los muestreadores necesitan el timeline y el plan, que cambian cuando el
 * humano mueve una perilla o cambia el tamaño de la ventana. Leyendo de refs, el
 * comportamiento es siempre el actual sin depender de que `motion` reemplace la
 * función de cada `useTransform` al re-renderizar.
 */

export type IntroSources = {
  /** El ritmo vigente. Cambia cuando el controlador mueve una perilla. */
  timelineRef: RefObject<IntroTimeline>
  /** Las medidas vigentes. Cambian al cambiar el tamaño de la ventana. */
  planRef: RefObject<IntroFlightPlan>
  /**
   * ¿El mesh está PINTANDO? Lo escribe el canvas, y cambia en las dos
   * direcciones — ver `introRelay.ts`. **No es «¿existe?»**: ésa era la
   * pregunta vieja y es la que dejaba el logo sin nadie que lo dibujara.
   */
  meshPaintedRef: RefObject<boolean>
  /** El latch del relevo: `null` = todavía no se preguntó. */
  meshLatchRef: RefObject<boolean | null>
}

export type IntroChannels = {
  strokeDraw: MotionValue<number>
  fill: MotionValue<number>
  wordmarkOpacity: MotionValue<number>
  sloganOpacity: MotionValue<number>
  veilOpacity: MotionValue<number>
  background: MotionValue<string>
  /** El color de la tinta. Lo comparten el SVG, las letras y el mesh. */
  ink: MotionValue<string>
  /** 0 → 1 durante el relevo. Queda en 0 si el mesh no llegó. */
  meshOpacity: MotionValue<number>
  svgOpacity: MotionValue<number>
  logoX: MotionValue<number>
  logoY: MotionValue<number>
  logoCenterX: MotionValue<number>
  logoCenterY: MotionValue<number>
  logoInkHeight: MotionValue<number>
  logoReveal: MotionValue<number>
}

export function useIntroChannels(
  progress: MotionValue<number>,
  sources: IntroSources
): IntroChannels {
  const { timelineRef, planRef, meshPaintedRef, meshLatchRef } = sources

  const strokeDraw = useTransform(progress, (p) => sampleStrokeDraw(timelineRef.current, p))
  const fill = useTransform(progress, (p) => sampleFill(timelineRef.current, p))
  const wordmarkOpacity = useTransform(progress, (p) =>
    sampleLineOpacity(timelineRef.current, p, timelineRef.current.wordmarkInS)
  )
  const sloganOpacity = useTransform(progress, (p) =>
    sampleLineOpacity(timelineRef.current, p, timelineRef.current.sloganInS)
  )
  const veilOpacity = useTransform(progress, (p) => sampleVeilOpacity(timelineRef.current, p))

  const background = useTransform(progress, (p): string =>
    srgbToHex(sampleBackgroundColor(timelineRef.current, p))
  )
  const ink = useTransform(progress, (p): string =>
    srgbToHex(sampleInkColor(timelineRef.current, p))
  )

  /**
   * EL RELEVO. **La regla vive en `introRelay.ts` y acá sólo se cablea.**
   *
   * El latcheo vive adentro del propio `useTransform` y no en un suscriptor
   * aparte porque **los suscriptores corren DESPUÉS de los valores derivados**
   * — un latch en un suscriptor llegaría un cuadro tarde.
   *
   * ⚠️ **Cuelga de `progress` y no de `swap`, y ése es el arreglo de V3-A.**
   * Un MotionValue derivado sólo recomputa cuando su FUENTE cambia, y `swap`
   * queda clavado en 1 desde `swapEndS` hasta el final: colgado de ahí, el
   * relevo dejaba de mirar el mundo justo en la ventana donde el mesh es lo
   * único que dibuja el logo, y una caída del canvas ya no tenía forma de
   * revertirse. Colgado del progreso se relee en cada cuadro. Cuesta un
   * `sampleSwap` más por frame: unas pocas operaciones aritméticas.
   *
   * El porqué completo —y la medición de los 4,274 s en los que el SVG valía 0
   * exacto— está en el docblock de `introRelay.ts`.
   */
  const meshOpacity = useTransform(progress, (p): number => {
    const relay = sampleRelay(
      sampleSwap(timelineRef.current, p),
      meshLatchRef.current,
      meshPaintedRef.current
    )
    meshLatchRef.current = relay.latch
    return relay.mesh
  })
  const svgOpacity = useTransform(meshOpacity, (shown) => 1 - shown)

  // El acomodamiento. Cinco lecturas del mismo muestreo por frame: son unas
  // pocas decenas de operaciones aritméticas, y a cambio queda un solo
  // mecanismo en vez de un suscriptor que escriba cinco MotionValues a mano.
  const logoX = useTransform(
    progress,
    (p) => sampleLogoPose(planRef.current, timelineRef.current, p).dxPx
  )
  const logoY = useTransform(
    progress,
    (p) => sampleLogoPose(planRef.current, timelineRef.current, p).dyPx
  )
  const logoCenterX = useTransform(
    progress,
    (p) => sampleLogoPose(planRef.current, timelineRef.current, p).centerXPx
  )
  const logoCenterY = useTransform(
    progress,
    (p) => sampleLogoPose(planRef.current, timelineRef.current, p).centerYPx
  )
  const logoInkHeight = useTransform(
    progress,
    (p) => sampleLogoPose(planRef.current, timelineRef.current, p).inkHeightPx
  )
  const logoReveal = useTransform(
    progress,
    (p) => sampleLogoPose(planRef.current, timelineRef.current, p).reveal
  )

  return {
    strokeDraw,
    fill,
    wordmarkOpacity,
    sloganOpacity,
    veilOpacity,
    background,
    ink,
    meshOpacity,
    svgOpacity,
    logoX,
    logoY,
    logoCenterX,
    logoCenterY,
    logoInkHeight,
    logoReveal,
  }
}
