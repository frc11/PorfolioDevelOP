'use client'

import { useTransform, type MotionValue } from 'motion/react'
import type { RefObject } from 'react'

import type { IntroFlightPlan } from './introFlight'
import { sampleLogoPose } from './introFlight'
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
  /** ¿El mesh ya existe en la escena? Lo escribe el canvas. */
  meshReadyRef: RefObject<boolean>
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
  const { timelineRef, planRef, meshReadyRef, meshLatchRef } = sources

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
   * EL RELEVO, **latcheado al empezar el cruce**.
   *
   * La pregunta "¿llegó el mesh?" se hace UNA vez, en el primer frame del cruce:
   * si el chunk termina de bajar a mitad de camino, no aparece de golpe. El
   * latcheo vive adentro del propio `useTransform` y no en un suscriptor aparte
   * porque **los suscriptores corren DESPUÉS de los valores derivados** — un
   * latch en un suscriptor llegaría un cuadro tarde.
   *
   * Si no llegó, esto queda en 0 y **el SVG hace la transformación entera**,
   * cambiando de blanco a negro igual que el mesh habría hecho. Se pierde el
   * volumen del acomodamiento y nada más. Volver hacia atrás con el scrub lo
   * resetea, que es lo que el controlador necesita para repetir el momento.
   */
  const swap = useTransform(progress, (p) => sampleSwap(timelineRef.current, p))
  const meshOpacity = useTransform(swap, (value): number => {
    if (value <= 0) {
      meshLatchRef.current = null
      return 0
    }
    if (meshLatchRef.current === null) meshLatchRef.current = meshReadyRef.current
    return meshLatchRef.current ? value : 0
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
