/**
 * [B12a.2] LA PISTA DE LA INTRO DE UNA PÁGINA — de la composición inicial (avance 0) a la pose de la intro (avance 1), en 1,5 pantallas
 * de scroll sobre el bloque de la intro (plan `docs/rediseno/SPRINT-B12a.md` §5 y §10; CONTRATO: «la cámara se mueve con el scroll
 * durante 1,5 pantallas»).
 *
 * ── La composición inicial, compartida ──────────────────────────────────
 *
 * Todas las páginas arrancan de la misma pose: la del hero del home (`CHOREO_KEYFRAMES[0]`) con el logo CENTRADO. Se copia, no se toca:
 * esa pose es el destino del preloader del sitio vivo (`src/lib/scene-framing.ts:144`) y moverla movería el intro de producción.
 *
 * ── La pose de la intro, todavía una decisión de Valentino ───────────────
 *
 * Tres candidatas detrás de `?intro=1|2|3` (sin la bandera, la 1): Valentino elige mirando, la bandera se va y queda la elegida.
 *   1 · ACERCARSE: la cámara se mete de frente, un poco más baja (el logo crece).
 *   2 · GIRAR: un cuarto de vuelta corto alrededor del logo, a media altura (se ve su espesor).
 *   3 · SUBIR: la cámara sube y se aleja, mirando hacia abajo (aparece el piso con su energía).
 * Las tres dejan el logo centrado (el título va encima) y quedan adentro del rango del recorrido del home (alturas y distancias que
 * el home ya usa).
 */

import { buildTrack, sampleLightArc, type ChoreoTrack } from '../choreographySampler'
import type { ChoreoKeyframe, ChoreoPose, MutableLightLevels } from '../choreographyTypes'
import { NIVEL_DE_LA_NOCHE } from '../lightArc'

import { presetActual, type PresetDeLaEscena } from './preset'

/** Lo que dura la intro, en pantallas de scroll: el avance va de 0 a 1 en eso. */
export const PANTALLAS_DE_LA_INTRO = 1.5

/** La composición inicial: la pose del hero del home con el logo centrado (`frameX` 0). */
export const COMPOSICION_INICIAL: ChoreoPose = { angleDeg: 0, height: 6.4, distance: 19, frameX: 0, frameY: 0 }

export const POSES_DE_LA_INTRO = {
  1: { angleDeg: 0, height: 4.2, distance: 12.5, frameX: 0, frameY: 0 },
  2: { angleDeg: 38, height: 5.2, distance: 15, frameX: 0, frameY: 0 },
  3: { angleDeg: -20, height: 10, distance: 20, frameX: 0, frameY: -0.25 },
} as const satisfies Readonly<Record<1 | 2 | 3, ChoreoPose>>

export type VarianteDeLaIntro = keyof typeof POSES_DE_LA_INTRO

/** La variante de la URL (`?intro=1|2|3`), o la 1. */
export function varianteDeLaIntro(busqueda: string): VarianteDeLaIntro {
  const v = new URLSearchParams(busqueda).get('intro')
  return v === '2' ? 2 : v === '3' ? 3 : 1
}

/** Las dos poses de la intro, como keyframes (estables por variante: el mismo arreglo cada vez, así la pista se arma una sola vez). */
const KEYFRAMES: Readonly<Record<VarianteDeLaIntro, readonly ChoreoKeyframe[]>> = {
  1: [{ at: 0, name: 'composicion-inicial', pose: COMPOSICION_INICIAL }, { at: 1, name: 'intro-acercarse', ease: 'linear', pose: POSES_DE_LA_INTRO[1] }],
  2: [{ at: 0, name: 'composicion-inicial', pose: COMPOSICION_INICIAL }, { at: 1, name: 'intro-girar', ease: 'linear', pose: POSES_DE_LA_INTRO[2] }],
  3: [{ at: 0, name: 'composicion-inicial', pose: COMPOSICION_INICIAL }, { at: 1, name: 'intro-subir', ease: 'linear', pose: POSES_DE_LA_INTRO[3] }],
}
export const keyframesDeLaIntro = (v: VarianteDeLaIntro): readonly ChoreoKeyframe[] => KEYFRAMES[v]

/**
 * El avance de la intro (0…1): 0 con el tope del bloque en el tope del cuadro, 1 después de `PANTALLAS_DE_LA_INTRO` pantallas. `arriba`:
 * el tope del bloque en el documento, medido en el LAYOUT (nunca con `scrollHeight`: lección de PULIDO 19).
 */
export function avanceDeLaIntro(arriba: number, scrollY: number, alto: number): number {
  if (!(alto > 0)) return 0
  return Math.min(1, Math.max(0, (scrollY - arriba) / (PANTALLAS_DE_LA_INTRO * alto)))
}

/**
 * El avance de la intro de la página de ahora (0…1): lo escribe la lectura del scroll y lo lee el rig en su cuadro (y, desde B12a.7, la
 * variante: §3.4). Es un canal propio, NO el progreso del rig: ese lo leen también los títulos, el polvo, la formación y el entorno con
 * el significado del home, y en una página quedan en el del hero.
 */
export const AVANCE_DE_LA_INTRO: { current: number } = { current: 0 }

const pistas = new WeakMap<PresetDeLaEscena, { readonly track: ChoreoTrack; readonly noche: boolean }>()

/**
 * La pista de la página de ahora (y si es de noche), o `null`: el home (su pista es `CHOREO_KEYFRAMES`) o una página sin pista. La lee
 * el rig en su cuadro; cada pista se arma una vez por preset (sin crear nada por cuadro).
 */
export function pistaDeLaPagina(): { readonly track: ChoreoTrack; readonly noche: boolean } | null {
  const preset = presetActual()
  if (preset === null || preset.pista === null) return null
  let pagina = pistas.get(preset)
  if (pagina === undefined) {
    pagina = { track: buildTrack(preset.pista), noche: preset.noche === 'noche' }
    pistas.set(preset, pagina)
  }
  return pagina
}

/**
 * La luz del cuadro: en el home, la del recorrido; en una página, la del principio del recorrido y, con la noche del preset, acotada a la
 * noche. Va ANTES de la noche disparada, así el nivel natural que ella publica (el que leen los módulos de noche) ya es el de la página.
 */
export function luzDeLaPagina(pagina: { readonly noche: boolean } | null, progreso: number, arc: MutableLightLevels): void {
  sampleLightArc(pagina === null ? progreso : 0, arc)
  if (pagina?.noche === true) arc.level = Math.min(arc.level, NIVEL_DE_LA_NOCHE)
}
