import {
  BOKEH_COUNT,
  BOKEH_OPACITY,
  BOKEH_RADIUS_BIAS,
  BOKEH_R_MAX,
  BOKEH_R_MIN,
  BOKEH_SHELLS,
  BOKEH_SIZE,
  DUST_SHELLS,
  PARTICLES_MAX,
  PARTICLE_FAR_COLOR,
  PARTICLE_NEAR_COLOR,
  PARTICLE_R_MAX,
  PARTICLE_R_MIN,
  buildParticleField,
  createRandom,
} from '@/app/v3/_lib/escena/probeParticles'
import { FLOOR_Y, ORBIT_TARGET_Y } from '@/app/v3/_lib/escena/probeScene'
import {
  pointSizePx,
  projectScenePoint,
  sceneCameraAt,
  type SceneVec3,
} from '@/lib/scene-camera'
import { SCENE_ENTRY_POSE } from '@/lib/scene-framing'

import { hexToSrgb } from './introShading'
import {
  DUST_MATERIAL_ALPHA,
  DUST_RADIUS_BIAS,
  FLOOR_CLEARANCE,
  INTRO_BOKEH_SEED,
  INTRO_DUST_SEED,
  INTRO_DUST_SHARE,
  INTRO_DUST_SIZE,
  INTRO_PHASE_SEED,
  dustDepthFloor,
  type IntroMote,
  type IntroMoteKind,
  type IntroParticleField,
} from './introParticles'
import { assignLandings, buildSceneParticles } from './introParticleLanding'
import { INTRO_BOKEH_COLOR, introTintStep, moteRampColor } from './introParticleTint'

/**
 * EL CAMPO DEL INTRO, PROYECTADO — la construcción, separada de la especie.
 *
 * Salió de `introParticles.ts` por el límite de 300 líneas del repo, con la
 * costura donde corresponde: **allá está QUÉ es una mota** (su escala, su
 * densidad y el borde entre las dos escalas), **acá cómo se arma el campo**. El
 * color vive en `introParticleTint.ts`. Es la misma costura que separa
 * `probeParticles.ts` de `particleTextures.ts` en la escena.
 *
 * Módulo puro: sin React, sin `motion`, sin DOM. Corre en node.
 *
 *     npx tsx src/components/layout/home-intro/introParticles.invariant.ts
 */

export const EMPTY_PARTICLE_FIELD: IntroParticleField = {
  motes: [],
  dustCount: 0,
  bokehCount: 0,
}

/**
 * Los tramos que se dibujan de un campo partido en conchas.
 *
 * Copia exacta del recorte de `DepthParticles`: **por concha y no sobre el campo
 * entero**, porque el campo está ordenado por radio y recortar el final se
 * llevaría solo las lejanas.
 */
function drawnRanges(
  total: number,
  shells: readonly number[],
  share: number
): readonly (readonly [number, number])[] {
  const ranges: (readonly [number, number])[] = []
  for (let s = 0; s < shells.length - 1; s += 1) {
    const from = Math.round(shells[s] * total)
    const to = Math.round(shells[s + 1] * total)
    ranges.push([from, from + Math.round((to - from) * share)])
  }
  return ranges
}

/**
 * EL CAMPO DEL INTRO, PROYECTADO. Se calcula una vez por tamaño de ventana.
 *
 * Devuelve solo las motas cuyo centro cae adentro del cuadro: WebGL descarta un
 * punto por su CENTRO —no lo recorta—, así que ése es el mismo criterio con el
 * que la escena decide qué dibuja, y por eso los dos conteos son comparables.
 */
export function buildIntroParticles(
  viewportWidthPx: number,
  viewportHeightPx: number,
  /** Las dos solo las mueve la comprobación, para barrer las perillas. */
  dustSize: number = INTRO_DUST_SIZE,
  dustShare: number = INTRO_DUST_SHARE
): IntroParticleField {
  const camera = sceneCameraAt(SCENE_ENTRY_POSE, viewportWidthPx, viewportHeightPx)
  if (!camera) return EMPTY_PARTICLE_FIELD

  const near = hexToSrgb(PARTICLE_NEAR_COLOR)
  const far = hexToSrgb(PARTICLE_FAR_COLOR)
  const bokehColor = INTRO_BOKEH_COLOR
  const dustSpan = PARTICLE_R_MAX - PARTICLE_R_MIN
  const phaseOf = createRandom(INTRO_PHASE_SEED)
  const floorLimit = FLOOR_Y + FLOOR_CLEARANCE
  // El borde entre las dos escalas se corre CON el tamaño del polvo: los dos
  // factores se cancelan y el diámetro del corte no se mueve — ver
  // `dustDepthFloor`. Por eso entra `dustSize` y no la constante.
  const depthFloor =
    (dustSize / INTRO_DUST_SIZE) *
    dustDepthFloor(
      Math.hypot(SCENE_ENTRY_POSE.distance, SCENE_ENTRY_POSE.height - ORBIT_TARGET_Y)
    )

  const motes: IntroMote[] = []
  let dustCount = 0
  let bokehCount = 0

  const push = (
    kind: IntroMoteKind,
    shell: number,
    point: SceneVec3,
    worldSize: number,
    color: string,
    tint: number,
    materialAlpha: number
  ): void => {
    // La fase se consume SIEMPRE, esté la mota en cuadro o no: así el
    // escalonado no depende del tamaño de la ventana.
    const phase = phaseOf()
    const at = projectScenePoint(camera, point, viewportWidthPx, viewportHeightPx)
    if (!at) return
    if (kind === 'dust' && at.depth < depthFloor) return
    if (at.xPx < 0 || at.xPx > viewportWidthPx) return
    if (at.yPx < 0 || at.yPx > viewportHeightPx) return

    // El destino se completa después, cuando el campo entero existe: la
    // asignación es GLOBAL —cada destino se toma una sola vez— y por lo tanto
    // no se puede resolver mota por mota mientras se construye.
    motes.push({
      kind,
      shell,
      xPx: at.xPx,
      yPx: at.yPx,
      sizePx: pointSizePx(worldSize, at.depth, viewportHeightPx),
      settleDxPx: 0,
      settleDyPx: 0,
      settleDSizePx: 0,
      color,
      tint,
      settleTint: tint,
      materialAlpha,
      phase,
    })
    if (kind === 'dust') dustCount += 1
    else bokehCount += 1
  }

  const dust = buildParticleField(
    PARTICLES_MAX,
    PARTICLE_R_MIN,
    PARTICLE_R_MAX,
    DUST_RADIUS_BIAS,
    INTRO_DUST_SEED,
    floorLimit,
    DUST_SHELLS
  )
  const rangos = drawnRanges(PARTICLES_MAX, DUST_SHELLS, dustShare)
  for (let s = 0; s < rangos.length; s += 1) {
    const [from, to] = rangos[s]
    for (let i = from; i < to; i += 1) {
      const radius = dust.radii[i]
      push(
        'dust',
        s,
        [dust.positions[i * 3], dust.positions[i * 3 + 1], dust.positions[i * 3 + 2]],
        dustSize,
        moteRampColor(near, far, (radius - PARTICLE_R_MIN) / dustSpan),
        introTintStep((radius - PARTICLE_R_MIN) / dustSpan),
        DUST_MATERIAL_ALPHA
      )
    }
  }

  const bokeh = buildParticleField(
    BOKEH_COUNT,
    BOKEH_R_MIN,
    BOKEH_R_MAX,
    BOKEH_RADIUS_BIAS,
    INTRO_BOKEH_SEED,
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
        [bokeh.positions[i * 3], bokeh.positions[i * 3 + 1], bokeh.positions[i * 3 + 2]],
        BOKEH_SIZE,
        bokehColor,
        -1,
        BOKEH_OPACITY
      )
    }
  }

  // ── El destino: cada mota, a una mota REAL del campo de la escena ─────────
  //
  // Se resuelve acá y no adentro de `push` porque la asignación es global: un
  // destino se toma UNA vez, así que hace falta el campo entero para elegir.
  const destinos = assignLandings(motes, buildSceneParticles(viewportWidthPx, viewportHeightPx))
  const acomodadas = motes.map((mote, i): IntroMote => {
    const destino = destinos[i]
    // Sin destino la mota se queda donde está y sólo se releva. No puede pasar
    // con el campo real —la escena tiene 554 motas de sobra— pero un `null`
    // silencioso que moviera la mota a (0,0) sería peor que no moverla.
    if (!destino) return mote
    return {
      ...mote,
      settleDxPx: destino.xPx - mote.xPx,
      settleDyPx: destino.yPx - mote.yPx,
      settleDSizePx: destino.sizePx - mote.sizePx,
      settleTint: destino.tint,
    }
  })

  return { motes: acomodadas, dustCount, bokehCount }
}
