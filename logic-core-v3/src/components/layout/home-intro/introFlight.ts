import { LOGO_INK_VIEWBOX } from '@/components/ui/LogoMark'
import { frameSceneEntry, type SceneFrame } from '@/lib/scene-framing'

import { samplePlace } from './introSampling'
import { INTRO_LOCKUP_TEXT, type IntroTimeline } from './introTimeline'

/**
 * EL ACOMODAMIENTO — del centro de la pantalla al lugar que la escena le tiene
 * guardado al logo.
 *
 * Módulo puro, sin React y sin DOM: recibe el tamaño de la ventana y devuelve
 * una pose. No mide nada del navegador.
 *
 * ── S8d: el logo NO cambia de tamaño ───────────────────────────────────────
 *
 * **El tamaño de la tinta se lee del destino y es constante durante toda la
 * secuencia.** Es la inversión de S8b y S8c, que dimensionaban el lockup desde
 * la ventana (`heightVh`) y después lo escalaban hasta el destino con un pico y
 * un achicamiento. Ahora el logo se dibuja, se rellena, cambia de color y se
 * acomoda **siempre midiendo lo mismo**, y no hay un solo canal de escala en
 * ninguna parte de la secuencia.
 *
 * Consecuencia directa: el texto se deriva del logo y no de la ventana, así que
 * el lockup es una unidad rígida cuyas proporciones internas no dependen de la
 * resolución. Ver `INTRO_LOCKUP_TEXT`.
 *
 * ── El origen es el centro de la pantalla, sin medir ───────────────────────
 *
 * La marca está centrada por layout, así que su centro es `(ancho/2, alto/2)`
 * exacto. Sin `getBoundingClientRect()` no hay trampa de transforms
 * (`CLAUDE.md`), y el plan entero es **función pura del tamaño de la ventana** —
 * que es lo que hace verificable el gesto sin abrir un navegador.
 *
 * ── Sin destino no hay nada ────────────────────────────────────────────────
 *
 * Si la ventana no es medible (pestaña oculta: el navegador reporta 0 y todo
 * cálculo de layout es basura — lección de `CLAUDE.md`), no hay tamaño ni lugar
 * al que ir. La tinta mide 0 y el logo no se mueve. Es también el estado del
 * HTML del server, donde `window` no existe: a esa altura de la secuencia no hay
 * nada dibujado todavía, así que no se ve.
 */

/** Ancho / alto de la tinta. Lo fija el path, no una preferencia. */
export const INTRO_LOGO_ASPECT = LOGO_INK_VIEWBOX.width / LOGO_INK_VIEWBOX.height

export type IntroInkSize = {
  readonly widthPx: number
  readonly heightPx: number
}

export type IntroLockupText = {
  readonly wordmarkPx: number
  readonly sloganPx: number
  readonly gapPx: number
}

/** El texto, derivado del alto de la tinta. Ver `INTRO_LOCKUP_TEXT`. */
export function introLockupText(inkHeightPx: number): IntroLockupText {
  return {
    wordmarkPx: inkHeightPx * INTRO_LOCKUP_TEXT.wordmarkOfInk,
    sloganPx: inkHeightPx * INTRO_LOCKUP_TEXT.sloganOfInk,
    gapPx: inkHeightPx * INTRO_LOCKUP_TEXT.gapOfInk,
  }
}

export type IntroFlightPlan = {
  /** El tamaño de la tinta. **Constante durante toda la secuencia.** */
  readonly ink: IntroInkSize
  /** Centro de la marca en reposo: el centro de la ventana, por construcción. */
  readonly originXPx: number
  readonly originYPx: number
  /** El destino, o `null` si la ventana no era medible. */
  readonly destination: SceneFrame | null
}

export function planIntroFlight(
  viewportWidthPx: number,
  viewportHeightPx: number
): IntroFlightPlan {
  const destination = frameSceneEntry(viewportWidthPx, viewportHeightPx)
  return {
    ink: {
      widthPx: destination ? destination.inkWidthPx : 0,
      heightPx: destination ? destination.inkHeightPx : 0,
    },
    originXPx: viewportWidthPx / 2,
    originYPx: viewportHeightPx / 2,
    destination,
  }
}

/**
 * El plan que rige en el server y el que queda si la ventana no es medible.
 * Se calcula una vez al cargar el módulo.
 */
export const EMPTY_FLIGHT_PLAN: IntroFlightPlan = planIntroFlight(0, 0)

export type IntroLogoPose = {
  /** Desplazamiento desde el centro de la pantalla, en píxeles del viewport. */
  readonly dxPx: number
  readonly dyPx: number
  /** 0 = plana y de frente · 1 = presentando la cara que la escena va a ver. */
  readonly reveal: number
  /** El centro de la tinta AHORA, en píxeles del viewport. */
  readonly centerXPx: number
  readonly centerYPx: number
  /** Alto de la tinta. **No depende del progreso**: el logo no cambia de tamaño. */
  readonly inkHeightPx: number
}

/**
 * La pose del logo en un progreso.
 *
 * **Un solo número mueve las dos cosas.** `samplePlace` alimenta el
 * desplazamiento y la revelación, así que arrancan en el mismo frame, terminan
 * en el mismo frame y avanzan en lockstep: es un movimiento, no dos.
 *
 * Sin destino no hay pose de la escena a la que llegar, así que el logo se queda
 * donde está, de frente y plano. Revelar volumen apuntando a ningún lado sería
 * inventar.
 */
export function sampleLogoPose(
  plan: IntroFlightPlan,
  timeline: IntroTimeline,
  progress: number
): IntroLogoPose {
  const place = plan.destination ? samplePlace(timeline, progress) : 0
  const dxPx = plan.destination ? (plan.destination.centerXPx - plan.originXPx) * place : 0
  const dyPx = plan.destination ? (plan.destination.centerYPx - plan.originYPx) * place : 0

  return {
    dxPx,
    dyPx,
    reveal: place,
    centerXPx: plan.originXPx + dxPx,
    centerYPx: plan.originYPx + dyPx,
    inkHeightPx: plan.ink.heightPx,
  }
}
