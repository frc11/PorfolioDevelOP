import {
  BOKEH_COUNT,
  BOKEH_OPACITY,
  BOKEH_RADIUS_BIAS,
  BOKEH_R_MAX,
  BOKEH_R_MIN,
  BOKEH_SEED,
  BOKEH_SHELLS,
  BOKEH_SIZE,
  DUST_SHELLS,
  PARTICLES_MAX,
  PARTICLE_FAR_COLOR,
  PARTICLE_NEAR_COLOR,
  PARTICLE_R_MAX,
  PARTICLE_R_MIN,
  PARTICLE_SEED,
  PARTICLE_SIZE,
  buildParticleField,
} from '@/app/v3/_lib/escena/probeParticles'
import { FLOOR_Y } from '@/app/v3/_lib/escena/probeScene'
import { pointSizePx, projectScenePoint, sceneCameraAt } from '@/lib/scene-camera'
import { SCENE_ENTRY_POSE } from '@/lib/scene-framing'

import { hexToSrgb } from './introShading'
import {
  DUST_MATERIAL_ALPHA,
  DUST_RADIUS_BIAS,
  FLOOR_CLEARANCE,
  SCENE_DUST_SHARE,
  type IntroMoteKind,
} from './introParticles'
import { INTRO_BOKEH_COLOR, introTintStep, moteRampColor } from './introParticleTint'

/**
 * EL CAMPO DE LA ESCENA, PROYECTADO — y a qué mota de él va cada mota del intro.
 *
 * ════════════════════════════════════════════════════════════════════════════
 * V3-A · LAS MOTAS YA NO SE CAEN: SE ACOMODAN
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Hasta acá el campo del intro bajaba `INTRO_FALL_WORLD` unidades de mundo y se
 * apagaba, y esa bajada **era la tapadera del relevo**: las que caían eran las
 * del intro y las que quedaban eran las de la escena, y nunca se veían las dos.
 * El humano pidió lo contrario: *«que esas mismas partículas se acomoden en la
 * escena»*.
 *
 * Este módulo es el destino. **Cada mota del intro se asigna a una mota REAL del
 * campo de la escena** —el mismo generador, la semilla de la escena, su reparto
 * y su tamaño, proyectado por la misma cámara de la pose de entrada— y viaja
 * hasta su posición, encogiéndose hasta su diámetro y corriéndose hasta su color.
 * Al llegar, el campo del intro **es** un subconjunto exacto del campo de la
 * escena.
 *
 * ── ⚠️ LO QUE ESTO NO ES, Y HAY QUE DECIRLO ────────────────────────────────
 *
 * No es la vía (a) completa —*«la mota que mirabas ES, en el cuadro del relevo,
 * esa mota de la escena»*—, y la razón no es de costo: **el campo de la escena
 * está en movimiento y el preloader no puede saber en qué fase**. `driftShells`
 * (`OrbitRig.tsx`) gira las conchas y las hace cabecear con
 * `state.clock.elapsedTime` del canvas de la escena, y **no se apaga con la
 * retención** —sólo con `prefers-reduced-motion`—, así que mientras el intro
 * tapa la pantalla el campo de atrás ya está derivando. Medido: **8,16 px por
 * segundo de mediana** sobre motas de 3,20 px de diámetro, o sea **2,5 diámetros
 * por segundo**. El canvas de la escena arranca su reloj cuando termina de bajar
 * el chunk de `three`, que no está atado al reloj del intro.
 *
 * Acá se aterriza sobre el campo **en fase cero**. El campo es una media esfera
 * de puntos al azar, así que rotado es estadísticamente el mismo campo: lo que
 * se pierde no es la forma ni la densidad ni el color — es la **identidad** de
 * cada mota. La cifra está medida y publicada en `introParticleSettle.
 * invariant.ts`, con la vía (a) completa anotada: apagar la deriva mientras la
 * escena está retenida, que es `_lib/escena/` y no de este frente.
 *
 * Módulo puro: sin React, sin `motion`, sin DOM. Corre en node.
 *
 *     npx tsx src/components/layout/home-intro/introParticleSettle.invariant.ts
 */

/** Una mota del campo de la escena, proyectada en la pose de entrada. */
export type SceneMote = {
  readonly kind: IntroMoteKind
  /** La concha de la que salió. Es lo que ata el destino al origen. */
  readonly shell: number
  readonly xPx: number
  readonly yPx: number
  readonly sizePx: number
  readonly color: string
  /** El escalón de la rampa. −1 = bokeh. */
  readonly tint: number
  readonly materialAlpha: number
}

/** Lo mínimo que la asignación necesita de una mota del intro. */
export type MoteAsignable = {
  readonly kind: IntroMoteKind
  readonly shell: number
  readonly xPx: number
  readonly yPx: number
}

/**
 * EL CAMPO DE LA ESCENA, PROYECTADO POR LA CÁMARA DE LA POSE DE ENTRADA.
 *
 * Es el mismo camino que `buildIntroParticles` usa —`sceneCameraAt` +
 * `projectScenePoint` + `pointSizePx`— con las constantes de la ESCENA en vez
 * de las del intro: su semilla, su reparto (`SCENE_DUST_SHARE`) y su tamaño.
 *
 * Devuelve sólo las motas cuyo CENTRO cae adentro del cuadro, que es el mismo
 * criterio con el que WebGL decide qué dibuja y el mismo con el que el campo del
 * intro se recorta: los dos conteos son comparables por construcción.
 */
export function buildSceneParticles(
  viewportWidthPx: number,
  viewportHeightPx: number
): readonly SceneMote[] {
  const camera = sceneCameraAt(SCENE_ENTRY_POSE, viewportWidthPx, viewportHeightPx)
  if (!camera) return []

  const near = hexToSrgb(PARTICLE_NEAR_COLOR)
  const far = hexToSrgb(PARTICLE_FAR_COLOR)
  const dustSpan = PARTICLE_R_MAX - PARTICLE_R_MIN
  const floorLimit = FLOOR_Y + FLOOR_CLEARANCE
  const motes: SceneMote[] = []

  const push = (
    kind: IntroMoteKind,
    shell: number,
    x: number,
    y: number,
    z: number,
    worldSize: number,
    color: string,
    tint: number,
    materialAlpha: number
  ): void => {
    const at = projectScenePoint(camera, [x, y, z], viewportWidthPx, viewportHeightPx)
    if (!at) return
    if (at.xPx < 0 || at.xPx > viewportWidthPx) return
    if (at.yPx < 0 || at.yPx > viewportHeightPx) return
    motes.push({
      kind,
      shell,
      xPx: at.xPx,
      yPx: at.yPx,
      sizePx: pointSizePx(worldSize, at.depth, viewportHeightPx),
      color,
      tint,
      materialAlpha,
    })
  }

  // El polvo, con el recorte POR CONCHA que `DepthParticles` aplica con
  // `setDrawRange`: el campo está ordenado por radio, así que recortar el final
  // se llevaría sólo las lejanas.
  const dust = buildParticleField(
    PARTICLES_MAX,
    PARTICLE_R_MIN,
    PARTICLE_R_MAX,
    DUST_RADIUS_BIAS,
    PARTICLE_SEED,
    floorLimit,
    DUST_SHELLS
  )
  for (let s = 0; s < DUST_SHELLS.length - 1; s += 1) {
    const from = Math.round(DUST_SHELLS[s] * PARTICLES_MAX)
    const to = Math.round(DUST_SHELLS[s + 1] * PARTICLES_MAX)
    const hasta = from + Math.round((to - from) * SCENE_DUST_SHARE)
    for (let i = from; i < hasta; i += 1) {
      const t = (dust.radii[i] - PARTICLE_R_MIN) / dustSpan
      push(
        'dust',
        s,
        dust.positions[i * 3],
        dust.positions[i * 3 + 1],
        dust.positions[i * 3 + 2],
        PARTICLE_SIZE,
        moteRampColor(near, far, t),
        introTintStep(t),
        DUST_MATERIAL_ALPHA
      )
    }
  }

  // El bokeh dibuja las noventa: no tiene slider.
  const bokeh = buildParticleField(
    BOKEH_COUNT,
    BOKEH_R_MIN,
    BOKEH_R_MAX,
    BOKEH_RADIUS_BIAS,
    BOKEH_SEED,
    floorLimit,
    BOKEH_SHELLS
  )
  for (let s = 0; s < BOKEH_SHELLS.length - 1; s += 1) {
    const from = Math.round(BOKEH_SHELLS[s] * BOKEH_COUNT)
    const to = Math.round(BOKEH_SHELLS[s + 1] * BOKEH_COUNT)
    for (let i = from; i < to; i += 1) {
      push(
        'bokeh',
        s,
        bokeh.positions[i * 3],
        bokeh.positions[i * 3 + 1],
        bokeh.positions[i * 3 + 2],
        BOKEH_SIZE,
        INTRO_BOKEH_COLOR,
        -1,
        BOKEH_OPACITY
      )
    }
  }

  return motes
}

/**
 * A QUÉ MOTA DE LA ESCENA VA CADA MOTA DEL INTRO — vecino más cercano, goloso,
 * **adentro de su misma especie y su misma concha**.
 *
 * ── Por qué el vecino más cercano y no el mismo rango de radio ─────────────
 *
 * Porque *acomodarse* no es *migrar*. Asignando por rango de radio el recorrido
 * mediano del polvo sería de **443,8 px** —el campo entero cruzando la pantalla,
 * que se lee como una mudanza— y con vecino más cercano queda en **16,2 px**,
 * o sea unos pocos diámetros: cada mota encuentra SU lugar, el que ya tenía al
 * lado. Los dos números están medidos en `introParticleSettle.invariant.ts`.
 *
 * ── Y por qué la concha ────────────────────────────────────────────────────
 *
 * La concha es una banda de radio, y del radio salen las DOS cosas que la mota
 * tiene que morfear: el tamaño (por la profundidad) y el color (la rampa de
 * perspectiva atmosférica). Cruzando conchas, una mota cercana y oscura podría
 * aterrizar en una lejana y clara: el viaje sería corto pero el cambio de
 * especie, grande. Con la concha respetada, el morfeo es siempre el chico.
 *
 * ── El costo, y por qué no hace falta nada mejor ──────────────────────────
 *
 * Es O(n·m) por concha: 366 motas de polvo contra 913 destinos son ~334.000
 * distancias, **una sola vez por tamaño de ventana** — el mismo presupuesto de
 * montaje con el que `buildIntroParticles` ya proyecta 3.090 puntos. Un
 * algoritmo de asignación óptima (húngaro) costaría O(n³) para mejorar un
 * recorrido que ya es de unos pocos diámetros.
 *
 * Determinista: recorre las motas del intro en el orden del array y se queda con
 * el destino libre más cercano. Sin `Math.random`, sin `Date`.
 */
export function assignLandings(
  motes: readonly MoteAsignable[],
  scene: readonly SceneMote[]
): readonly (SceneMote | null)[] {
  const buckets = new Map<string, SceneMote[]>()
  for (const mote of scene) {
    const key = `${mote.kind}:${mote.shell}`
    const lista = buckets.get(key)
    if (lista === undefined) buckets.set(key, [mote])
    else lista.push(mote)
  }

  const usados = new Map<string, Set<number>>()
  return motes.map((mote) => {
    const key = `${mote.kind}:${mote.shell}`
    const candidatos = buckets.get(key)
    if (candidatos === undefined) return null
    let tomados = usados.get(key)
    if (tomados === undefined) {
      tomados = new Set<number>()
      usados.set(key, tomados)
    }

    let mejor = -1
    let mejorDistancia = Infinity
    for (let i = 0; i < candidatos.length; i += 1) {
      if (tomados.has(i)) continue
      const dx = candidatos[i].xPx - mote.xPx
      const dy = candidatos[i].yPx - mote.yPx
      const distancia = dx * dx + dy * dy
      if (distancia < mejorDistancia) {
        mejorDistancia = distancia
        mejor = i
      }
    }
    if (mejor < 0) return null
    tomados.add(mejor)
    return candidatos[mejor]
  })
}
