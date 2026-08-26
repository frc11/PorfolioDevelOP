import {
  BOKEH_R_MAX,
  BOKEH_SIZE,
  PARTICLE_FAR_COLOR,
  PARTICLE_NEAR_COLOR,
  PARTICLE_SIZE,
} from '@/app/probe-escena/_components/probeParticles'
import { BOKEH_COLOR } from '@/app/probe-escena/_components/probeScene'

import {
  hexToSrgb,
  linearToSrgb,
  neutralToneMapGray,
  srgbToHex,
  srgbToLinear,
  type Srgb,
} from './introShading'

/**
 * LAS PARTÍCULAS DEL PRELOADER — LA ESPECIE.
 *
 * Qué es una mota: de dónde salen sus tamaños, sus colores y el borde entre las
 * dos escalas. **Cómo se arma el campo** vive en `introParticleField.ts` y **el
 * ritmo** en `introParticleTiming.ts`, por la misma regla que separa
 * `introTimeline.ts` de `introSampling.ts`: los datos de un lado, la aritmética
 * que los lee del otro.
 *
 * Módulo puro: sin React, sin `motion`, sin DOM. Corre en node.
 *
 * ════════════════════════════════════════════════════════════════════════════
 * NO HAY RELEVO. LAS DEL INTRO **BAJAN** ANTES DE QUE SE VAYA EL BLANCO.
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Las que caen son las del intro; las que quedan flotando son las de la escena,
 * que ya estaban ahí desde siempre. Nadie puede notar que no son las mismas
 * **porque nunca se ven las dos poblaciones a la vez**, y ése es el único
 * requisito del mecanismo. La bajada es la tapadera, igual que la inversión de
 * la tinta es la tapadera del relevo 2D→3D.
 *
 * El margen está medido, no estimado — `introParticles.invariant.ts`.
 *
 * ── La especie no se calibra: se PROYECTA ──────────────────────────────────
 *
 * "Que se parezcan a las de la escena" no se resuelve eligiendo tamaños a ojo.
 * El campo del intro **es** el campo de la escena —el mismo generador, los
 * mismos radios, el mismo sesgo, los mismos colores, el mismo material—
 * **proyectado por la cámara de la pose inicial**. De ahí salen solas la
 * distribución de tamaños en píxeles, la densidad, el reparto sobre la pantalla
 * y la perspectiva atmosférica. Lo único propio es la SEMILLA.
 *
 * **Por qué otra semilla y no la misma.** Con la misma, las motas del intro
 * caerían desde exactamente los lugares donde, tres décimas más tarde, las de la
 * escena vuelven a estar. Es el único modo de que el corte se note: no por
 * parecerse poco, sino por parecerse demasiado.
 *
 * ── La bajada es una caída en el MUNDO, no un deslizamiento en pantalla ────
 *
 * El campo entero baja `INTRO_FALL_WORLD` unidades de mundo y se lo vuelve a
 * proyectar. Como la proyección divide por la profundidad, las motas cercanas
 * barren cientos de píxeles y las lejanas unas decenas: **el paralaje sale
 * gratis y es el que corresponde**, y de paso es la "dispersión" que la
 * instrucción permite — con una causa física en vez de un número al azar. La
 * dirección dominante es hacia abajo por construcción: el desplazamiento es −Y
 * de mundo y nada más.
 */

// ── Lo que el intro toma de la escena, y no puede importar ──────────────────

/**
 * Tres números que `DepthParticles.tsx` y `BokehParticles.tsx` pasan como
 * literales y ningún módulo exporta. Se copian acá **y la comprobación lee el
 * código de esos componentes para exigir que sigan siendo el mismo número**: es
 * el patrón de `introSilhouette.invariant.ts`, que verifica el clip leyendo el
 * SVG en vez de confiar en que nadie lo mueva.
 */
export const DUST_RADIUS_BIAS = 1.4
/** El campo se corta a esta altura sobre el papel: media esfera, nada abajo. */
export const FLOOR_CLEARANCE = 0.4
/** `opacity` del material del polvo. El del bokeh sí se exporta. */
export const DUST_MATERIAL_ALPHA = 0.9

/**
 * Qué fracción del campo reservado se dibuja.
 *
 * Es el default que el probe embarca (`PROBE_DEFAULTS.particleCount` = 2.400 de
 * `PARTICLES_MAX` = 3.000). **No se importa de `probeStore.ts`**: ese módulo
 * arrastra el store entero del panel —con la celosía y su integral de
 * hemisferio— a un bundle que corre en la PRIMERA visita. La comprobación exige
 * que los dos números sigan siendo el mismo.
 */
export const INTRO_DUST_SHARE = 0.8

/** Semillas propias: mismo campo estadístico que la escena, otra muestra. */
export const INTRO_DUST_SEED = 0x1de1a
export const INTRO_BOKEH_SEED = 0xb0cad0
/** Y una tercera para el escalonado, que no puede correlacionar con el radio. */
export const INTRO_PHASE_SEED = 0x5ca10a

/**
 * CUÁNTO BAJA EL CAMPO, en unidades de mundo.
 *
 * 🔴 **La única perilla de este sprint que se decide MIRANDO.** Todo lo demás
 * sale de la escena o de una propiedad; esto no tiene respuesta correcta en un
 * archivo — es la misma clase de número que `placeS` en `introTimeline.ts`, y se
 * anota igual, con sus dos vecinos.
 *
 * ── Lo que este número gobierna, y por qué es UNO SOLO ─────────────────────
 *
 * Medido en **diámetros de la propia mota**, el recorrido de la caída no depende
 * de la profundidad: el desplazamiento y el tamaño se dividen los dos por ella y
 * el cociente se cancela. Tampoco depende de la ventana. Queda
 *
 *     recorrido = INTRO_FALL_WORLD / (tamaño × tan(fov/2))
 *
 * o sea **33,8 diámetros** para el polvo y 4,8 para el bokeh, idénticos en
 * 1440×810, 1920×1080 y 390×844 — verificado en las tres. Repartidos sobre los
 * 17,8 cuadros de la ventana de salida son **1,90 diámetros por cuadro**, que es
 * el número que decide si la caída se lee como movimiento o como una fila de
 * puntos (ver `sampleParticleOut`).
 *
 * En píxeles, sobre desktop 1440×810: mediana **107 px**, de 47 en la mota más
 * lejana a 377 en la más cercana. Esa dispersión ×8 es el paralaje, y es lo que
 * hace que el campo se lea con profundidad en vez de como una capa que se
 * desliza.
 *
 * **Los dos vecinos, para la grabación:** si la caída estrobea o se lee
 * violenta, **1,2** (1,20 diámetros por cuadro, 68 px de mediana); si se lee
 * como un desvanecimiento en el lugar, **3,0** (3,00 por cuadro, 169 px).
 */
export const INTRO_FALL_WORLD = 1.9

/**
 * EL BORDE ENTRE LAS DOS ESCALAS — el único recorte que el campo del intro tiene.
 *
 * El campo de polvo llega hasta radio 34 y la cámara de la pose inicial está a
 * 20,05 del origen, así que **una mota puede quedar a dos unidades de la lente**.
 * En la escena eso es transitorio: las conchas giran y la mota barre. Acá el
 * campo se queda quieto 1,4 s, y una mota de polvo de 33 px inmóvil no es la
 * misma especie que las de la escena — es un disco.
 *
 * El corte no se elige a ojo: sale de la propia regla de las dos escalas de S10.
 * **El polvo es la escala LEJANA y el bokeh la CERCANA**, así que ninguna mota
 * de polvo puede proyectar más grande que el disco de bokeh más chico, que es el
 * borde entre las dos. Ese disco está en el punto más lejano del campo de
 * bokeh —`BOKEH_R_MAX` detrás del origen—, y de ahí sale una profundidad mínima
 * para el polvo, en unidades de mundo y sin depender de la ventana:
 *
 *     depthMin = PARTICLE_SIZE × (ojo + BOKEH_R_MAX) / BOKEH_SIZE
 *
 * Con los números que el repo embarca son **3,97**, y deja afuera al 0,21% del
 * campo dibujado. La escena, en esta pose, ya lo cumple sola: su mota más grande
 * mide 11,0 px contra los 17,3 del bokeh más chico.
 */
export function dustDepthFloor(eyeDistance: number): number {
  return (PARTICLE_SIZE * (eyeDistance + BOKEH_R_MAX)) / BOKEH_SIZE
}

// ── La especie ──────────────────────────────────────────────────────────────

/** De qué campo salió una mota. */
export type IntroMoteKind = 'dust' | 'bokeh'

export type IntroMote = {
  readonly kind: IntroMoteKind
  /** Posición y diámetro en píxeles CSS, con el campo quieto. */
  readonly xPx: number
  readonly yPx: number
  readonly sizePx: number
  /** Cuánto se mueven esos tres cuando el campo terminó de bajar. */
  readonly dxPx: number
  readonly dyPx: number
  readonly dSizePx: number
  /** El color que la escena renderiza para esta mota, ya con el tone mapping. */
  readonly color: string
  /** El escalón de la rampa con el que se la dibuja. −1 = bokeh. */
  readonly tint: number
  /** La opacidad del material del campo del que salió. */
  readonly materialAlpha: number
  /** 0 → 1: su lugar en el escalonado, de entrada y de salida. */
  readonly phase: number
}

export type IntroParticleField = {
  readonly motes: readonly IntroMote[]
  readonly dustCount: number
  readonly bokehCount: number
}

/**
 * El color con el que la escena RENDERIZA una mota.
 *
 * `PointsMaterial` no recibe luz, así que el color del vértice pasa directo al
 * tone mapping. El degradé cerca→lejos se interpola en **luz lineal**, que es
 * donde `THREE.Color.lerp` trabaja con el manejo de color prendido — no en sRGB.
 */
export function moteRampColor(near: Srgb, far: Srgb, t: number): string {
  const mixed: Srgb = [0, 1, 2].map((i) =>
    linearToSrgb(
      neutralToneMapGray(srgbToLinear(near[i]) * (1 - t) + srgbToLinear(far[i]) * t)
    )
  ) as unknown as Srgb
  return srgbToHex(mixed)
}

/**
 * EL COLOR DEL BOKEH EN PANTALLA. Un solo valor: las noventa escriben el mismo.
 */
export const INTRO_BOKEH_COLOR = moteRampColor(
  hexToSrgb(BOKEH_COLOR),
  hexToSrgb(BOKEH_COLOR),
  0
)

/**
 * ESCALONES DE LA RAMPA DEL POLVO, para el teñido de los sprites.
 *
 * `drawImage` no tiñe, así que el rasterizado necesita un sprite por color y la
 * rampa continua hay que cuantizarla. **El dato de cada mota conserva su color
 * exacto** —es lo que la comprobación compara contra la escena— y lo que se
 * cuantiza es solo el dibujo.
 *
 * ⚠ **Los escalones NO están repartidos parejo en la rampa: están repartidos
 * parejo en el VALOR QUE SALE.** La mezcla va en luz lineal, así que del lado
 * oscuro la rampa avanza más del doble por unidad de `t`: con escalones parejos
 * en `t`, el peor error se iba a **7,0 de 255** —concentrado justo en las motas
 * cercanas, que son las que más se ven— y con escalones parejos en valor queda
 * acotado por la mitad del paso, **3,2**. Cuesta una búsqueda binaria por
 * escalón, una sola vez al cargar el módulo.
 *
 * 24 escalones sobre un recorrido de 144 bytes: cada canvas de 64 × 64 cuesta
 * 16 KiB, así que subirlos no es gratis.
 */
export const INTRO_TINT_STEPS = 24

/** El byte que la escena renderiza para una posición de la rampa. */
function rampValue(t: number): number {
  return parseInt(
    moteRampColor(hexToSrgb(PARTICLE_NEAR_COLOR), hexToSrgb(PARTICLE_FAR_COLOR), t).slice(3, 5),
    16
  )
}

const RAMP_FROM = rampValue(0)
const RAMP_TO = rampValue(1)

/** Las posiciones de la rampa que reparten el VALOR de salida en partes iguales. */
const TINT_POSITIONS: readonly number[] = Array.from({ length: INTRO_TINT_STEPS }, (_, step) => {
  const target = RAMP_FROM + ((RAMP_TO - RAMP_FROM) * step) / (INTRO_TINT_STEPS - 1)
  let low = 0
  let high = 1
  for (let i = 0; i < 40; i += 1) {
    const mid = (low + high) / 2
    if (rampValue(mid) < target) low = mid
    else high = mid
  }
  return (low + high) / 2
})

/** A qué escalón cae una posición de la rampa. Por valor, no por `t`. */
export function introTintStep(t: number): number {
  const value = rampValue(Math.min(1, Math.max(0, t)))
  const step = Math.round(
    ((value - RAMP_FROM) / (RAMP_TO - RAMP_FROM)) * (INTRO_TINT_STEPS - 1)
  )
  return Math.min(INTRO_TINT_STEPS - 1, Math.max(0, step))
}

/** El color exacto de un escalón. Lo comparten el atlas y la comprobación. */
export function introTintColor(step: number): string {
  const clamped = Math.min(INTRO_TINT_STEPS - 1, Math.max(0, step))
  return moteRampColor(
    hexToSrgb(PARTICLE_NEAR_COLOR),
    hexToSrgb(PARTICLE_FAR_COLOR),
    TINT_POSITIONS[clamped]
  )
}
