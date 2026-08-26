/**
 * COMPROBACIONES DE S12 · el modelo de penumbra.
 *
 *     npx tsx src/app/probe-escena/__tests__/s12-penumbra.invariant.ts
 *
 * El sol gana diámetro angular y el borde de la sombra deja de ser filoso. Lo
 * que se comprueba acá es que **el ancho salga del modelo** y no de un
 * desenfoque:
 *
 *   1. Con α = 0 el gobo es EXACTAMENTE el de S11 — con su control positivo.
 *   2. El ancho escala lineal con α, con la distancia al cruce y con la
 *      oblicuidad, que son las tres cosas que dice la derivación.
 *   3. Se combina con el filtro de huella de píxel tomando el MAYOR, no la suma.
 *   4. El GLSL y el gemelo TS consumen el mismo número.
 *
 * Lo que este modelo le hace al cuadro —los seis valores medios, la portadora y
 * el batido— está en `s12-tension.invariant.ts`.
 */
import {
  celosiaBarAt,
  celosiaBarFiltered,
  celosiaCrossings,
  celosiaLayers,
  celosiaTransmittance,
} from '../_components/celosiaGeometry'
import {
  CELOSIA_SUN_RADIUS_DEG,
  CELOSIA_SUN_RADIUS_MAX_DEG,
  celosiaPenumbraAt,
  celosiaSunSpread,
} from '../_components/celosiaPenumbra'
import { CELOSIA_SOURCE, createCelosiaUniforms } from '../_components/celosiaShader'
import { CELOSIA_BAR } from '../_components/probeCelosia'
import { MOIRE_MISMATCH, MOIRE_FAR_RADIUS, MOIRE_NEAR_RADIUS } from '../_components/probeMoire'
import { PROBE_DEFAULTS, PROBE_PARAM_ORDER, PROBE_RANGES } from '../_components/probeStore'

import { FLOOR_Y, check, report, section, type Vec3 } from './harness'
import { floorPenumbraAt, framePenumbraSpread } from './celosiaFloor'
import { sunDirectionAt } from './shading'

const LAYERS = celosiaLayers(MOIRE_MISMATCH)
const SPREAD = celosiaSunSpread(CELOSIA_SUN_RADIUS_DEG)

/** Una grilla de puntos del piso, para comparar el gobo punto por punto. */
function floorGrid(): Vec3[] {
  const points: Vec3[] = []
  for (let i = 0; i < 60; i += 1) {
    for (let j = 0; j < 60; j += 1) {
      const x = ((i + 0.5) / 60) * 64 - 32
      const z = ((j + 0.5) / 60) * 64 - 32
      if (Math.hypot(x, z) <= 32) points.push([x, FLOOR_Y, z])
    }
  }
  return points
}

// ── 1 · El sol sin tamaño devuelve S11 ──────────────────────────────────────

section('Con α = 0 el gobo es el de S11, línea por línea')

{
  const sun = sunDirectionAt(0)
  const grid = floorGrid()

  /**
   * ⚠️ **CONTROL POSITIVO.** "Con α = 0 da lo mismo que antes" es exactamente la
   * afirmación que un instrumento apagado contesta que sí. Antes de creerle hay
   * que verlo MOVERSE: con el sol de tamaño real el mismo gobo, en los mismos
   * puntos, tiene que dar distinto en una parte grande de la losa.
   */
  const moved = grid.filter(
    (p) =>
      Math.abs(
        celosiaTransmittance(p, sun, CELOSIA_BAR, MOIRE_MISMATCH, 0, SPREAD) -
          celosiaTransmittance(p, sun, CELOSIA_BAR, MOIRE_MISMATCH, 0, 0)
      ) > 0.01
  ).length
  check(
    'el instrumento se mueve: con el sol de tamaño real el gobo cambia en el piso',
    moved > grid.length * 0.1,
    `${moved} de ${grid.length} puntos de la losa cambian más de 1% · sin esto, la identidad de abajo pasaría con el modelo desconectado`
  )

  let worst = 0
  for (const p of grid) {
    const hard = celosiaTransmittance(p, sun, CELOSIA_BAR, MOIRE_MISMATCH, 0, 0)
    let reference = 1
    for (const layer of LAYERS) {
      for (const crossing of celosiaCrossings(p, sun, layer, 0)) {
        const mark = Math.max(celosiaBarAt(crossing.u, CELOSIA_BAR), celosiaBarAt(crossing.v, CELOSIA_BAR))
        reference *= 1 - crossing.envelope * mark
      }
    }
    worst = Math.max(worst, Math.abs(hard - reference))
  }
  check(
    'y con α = 0 reproduce la barra DURA de S11 en toda la losa',
    worst < 1e-9,
    `peor diferencia ${worst.toExponential(1)} sobre ${grid.length} puntos — el borde filoso sigue disponible, y es el control de todo el sprint`
  )
}

// ── 2 · El ancho sale del modelo ────────────────────────────────────────────

section('El ancho: lineal en α, proporcional a la distancia, y con oblicuidad')

{
  const sun = sunDirectionAt(0)
  const center: Vec3 = [0, FLOOR_Y, 0]

  const widthAt = (deg: number) =>
    celosiaCrossings(center, sun, LAYERS[0], 0, celosiaSunSpread(deg))[0].penumbra.u
  const base = widthAt(0.266)
  check(
    'doblar el radio angular dobla el ancho: la penumbra es lineal en α',
    Math.abs(widthAt(0.532) / base - 2) < 0.001 && Math.abs(widthAt(0.133) / base - 0.5) < 0.001,
    `0,133° → ${widthAt(0.133).toFixed(4)} · 0,266° → ${base.toFixed(4)} · 0,532° → ${widthAt(0.532).toFixed(4)} celdas`
  )
  check(
    'y con α = 0 el ancho es exactamente cero, no un épsilon',
    widthAt(0) === 0,
    'el modelo no deja un residuo de borde blando cuando la perilla está en el fondo'
  )

  /**
   * ⚠️ **LA PROPIEDAD QUE DEFINE AL SPRINT: el ancho es POR FRAGMENTO y sale de
   * la distancia a CADA capa.** En unidades de mundo sobre el manto la razón
   * entre las dos capas tiene que ser exactamente la razón de sus radios, porque
   * desde el centro de la losa `t = R/|s_xz|` para las dos.
   */
  const [fine, coarse] = LAYERS.map((layer) => {
    const crossing = celosiaCrossings(center, sun, layer, 0, SPREAD)[0]
    const pitch = (2 * Math.PI * layer.radius) / layer.cells
    return { onWall: crossing.penumbra.u * pitch, cells: crossing.penumbra.u, t: crossing.t }
  })
  check(
    'la gruesa se ablanda MÁS en mundo, y la razón es la de los radios',
    Math.abs(coarse.onWall / fine.onWall - MOIRE_FAR_RADIUS / MOIRE_NEAR_RADIUS) < 0.001,
    `${coarse.onWall.toFixed(3)} contra ${fine.onWall.toFixed(3)} de mundo sobre el manto = ×${(coarse.onWall / fine.onWall).toFixed(3)}, contra ${MOIRE_FAR_RADIUS}/${MOIRE_NEAR_RADIUS} = ${(MOIRE_FAR_RADIUS / MOIRE_NEAR_RADIUS).toFixed(3)} · t ${fine.t.toFixed(1)} y ${coarse.t.toFixed(1)}`
  )
  check(
    '⚠️ pero en FRACCIÓN DE CELDA se invierte: la gruesa queda más DURA',
    coarse.cells < fine.cells * 0.6,
    `${coarse.cells.toFixed(3)} contra ${fine.cells.toFixed(3)} celdas — la gruesa es ×${(fine.cells / coarse.cells).toFixed(1)} más dura relativa a su banda, porque su celda es 2,4× más grande. La diferencia entre capas NO es la mitad del efecto: es 16% en mundo y se da vuelta en relativo`
  )

  /**
   * ⚠️ **LA OBLICUIDAD, con control positivo.** El `1/|n·s|` de la derivación no
   * es cosmético: un rayo que roza el manto ensancha su propia penumbra. Para
   * verlo hay que comparar contra un cruce de frente, que es el del centro.
   */
  const headOn = celosiaPenumbraAt([MOIRE_NEAR_RADIUS, 0, 0], [1, 0, 0], MOIRE_NEAR_RADIUS, 1, 1, 1)
  const grazing = celosiaPenumbraAt([MOIRE_NEAR_RADIUS, 0, 0], [0.2, 0, 0.9797959], MOIRE_NEAR_RADIUS, 1, 1, 1)
  check(
    'un cruce rasante ensancha su penumbra; uno de frente no la toca',
    Math.abs(headOn.u - 1) < 1e-9 && grazing.u > 4.9,
    `de frente ${headOn.u.toFixed(3)} · rasante (n·s = 0,2) ${grazing.u.toFixed(3)} = 1/0,2 · sin el control de la izquierda, "la oblicuidad ensancha" pasaría con cualquier factor`
  )
}

// ── 3 · Cómo se combina con el filtro de huella de píxel ────────────────────

section('El borde efectivo es el MAYOR de los dos, no la suma')

{
  /**
   * El gemelo no tiene derivadas de pantalla, así que acá se ejercita el perfil
   * directamente: `celosiaBarFiltered` es la función que el shader llama con
   * `w = max(fwidth(fase), penumbra)`.
   */
  /**
   * ⚠️ La muestra se toma FUERA del filo (fase 0,2 contra un filo en 0,145). En
   * el filo exacto la rampa vale 0,5 con cualquier ancho —es su punto fijo— y el
   * chequeo sería verdadero por construcción con el modelo desconectado.
   */
  const probe = 0.2
  const profile = (w: number) => celosiaBarFiltered(probe, CELOSIA_BAR, w)
  check(
    'el instrumento se mueve: ensanchar el borde cambia el perfil fuera del filo',
    Math.abs(profile(0.3) - profile(0.02)) > 1e-6,
    `a 0,2 de fase (el filo está en ${(CELOSIA_BAR / 2).toFixed(3)}): huella 0,02 → ${profile(0.02).toFixed(3)} contra penumbra 0,30 → ${profile(0.3).toFixed(3)}`
  )

  const pixel = 0.02
  const penumbra = 0.3
  check(
    'con la penumbra ancha manda ella, y el resultado NO es el de la suma',
    Math.abs(profile(Math.max(pixel, penumbra)) - profile(penumbra)) < 1e-12 &&
      Math.abs(profile(Math.max(pixel, penumbra)) - profile(pixel)) > 1e-6 &&
      Math.abs(profile(Math.max(pixel, penumbra)) - profile(pixel + penumbra)) > 1e-6,
    `max(${pixel}, ${penumbra}) → ${profile(Math.max(pixel, penumbra)).toFixed(4)} · la huella sola daría ${profile(pixel).toFixed(4)} y la suma ${profile(pixel + penumbra).toFixed(4)} — sumarlos lavaría el piso lejano dos veces`
  )
  check(
    'y en la lonja rasante, donde la celda no entra en un píxel, manda el filtro',
    Math.abs(profile(Math.max(0.9, 0.05)) - profile(0.9)) < 1e-12 &&
      Math.abs(profile(0.9) - profile(0.05)) > 1e-6,
    `huella 0,9 con penumbra 0,05 → ${profile(0.9).toFixed(4)}, que es el de S11; la penumbra sola daría ${profile(0.05).toFixed(4)} · el antialias sigue siendo el que decide ahí`
  )
  check(
    'con la penumbra más ancha que la celda el patrón se reemplaza por su media',
    Math.abs(celosiaBarFiltered(0, CELOSIA_BAR, 1) - CELOSIA_BAR) < 1e-9 &&
      Math.abs(celosiaBarFiltered(0.4, CELOSIA_BAR, 1) - CELOSIA_BAR) < 1e-9,
    `${celosiaBarFiltered(0, CELOSIA_BAR, 1).toFixed(3)} y ${celosiaBarFiltered(0.4, CELOSIA_BAR, 1).toFixed(3)} contra una barra de ${CELOSIA_BAR} — para la penumbra eso es literalmente cierto: más ancha que la celda ES el promedio de la trama`
  )
}

// ── 4 · El shader y el gemelo consumen el mismo número ──────────────────────

section('El GLSL: la penumbra existe, entra por max() y no agrega una rama')

{
  const source = CELOSIA_SOURCE.fragmentPars
  check(
    'el fragment calcula la penumbra del cruce a partir de su distancia',
    source.includes('float cosine = dot( q.xz, uCelosiaSun.xz ) / layer.x;') &&
      source.includes('uCelosiaKnobs.w * t / ( pitch * max( abs( cosine ), 1e-4 ) )'),
    'el `t` del cruce es lo que hace que el ancho sea POR FRAGMENTO y distinto capa por capa'
  )
  check(
    'y la combina con la huella de píxel tomando el mayor',
    source.includes('float w = max( max( fwidth( phase ), penumbra ), 1e-5 );'),
    'no la reemplaza y no la suma'
  )
  check(
    'sin una sola rama nueva: `fwidth` sigue fuera de todo condicional',
    !source.includes('if (') && !source.includes('if('),
    'adentro de una rama que no todos los píxeles del quad toman, `fwidth` no está definido'
  )

  const uniforms = createCelosiaUniforms()
  check(
    'el uniform arranca en el sol real, y es el MISMO número que usa el gemelo',
    Math.abs(uniforms.uCelosiaKnobs.value.w - celosiaSunSpread(CELOSIA_SUN_RADIUS_DEG)) < 1e-12 &&
      Math.abs(uniforms.uCelosiaKnobs.value.w - 2 * Math.tan((0.266 * Math.PI) / 180)) < 1e-12,
    `uCelosiaKnobs.w = ${uniforms.uCelosiaKnobs.value.w.toFixed(6)} = 2·tan(${CELOSIA_SUN_RADIUS_DEG}°) · el radio angular del sol real`
  )
  check(
    'la perilla está en el panel, arranca en el sol real y llega hasta el lavado',
    PROBE_PARAM_ORDER.includes('celosiaSunRadiusDeg') &&
      PROBE_DEFAULTS.celosiaSunRadiusDeg === CELOSIA_SUN_RADIUS_DEG &&
      PROBE_RANGES.celosiaSunRadiusDeg.min === 0 &&
      PROBE_RANGES.celosiaSunRadiusDeg.max === CELOSIA_SUN_RADIUS_MAX_DEG,
    `0 … ${CELOSIA_SUN_RADIUS_MAX_DEG}°, default ${CELOSIA_SUN_RADIUS_DEG}° · el mínimo es el control (S11) y el tope es donde el moiré del piso se lava`
  )
}

// ── 5 · La variación, que es lo que rompe la lectura de baldosa ─────────────

section('La variación a lo largo del piso: geométrica, y no depende de α')

{
  const sun = sunDirectionAt(0)
  const azimuth = Math.atan2(sun[0], sun[2])
  const near: Vec3 = [Math.sin(azimuth) * 32, FLOOR_Y, Math.cos(azimuth) * 32]
  const far: Vec3 = [0, FLOOR_Y, 0]

  const ratios = [0.133, 0.266, 0.5, 1].map((deg) => {
    const spread = celosiaSunSpread(deg)
    const a = floorPenumbraAt(near, sun, spread)[0]
    const b = floorPenumbraAt(far, sun, spread)[0]
    return a && b ? b.cellsU / a.cellsU : NaN
  })
  check(
    'el contraste cerca/lejos es el mismo para CUALQUIER α: lo fija la geometría',
    ratios.every((r) => Math.abs(r - ratios[0]) < 0.01),
    `${ratios.map((r) => `${r.toFixed(2)}×`).join(' · ')} para α = 0,133 / 0,266 / 0,5 / 1° — α elige la escala, la variación ya estaba`
  )
  check(
    'y es grande: el punto pegado a la celosía tiene un borde seis veces más duro',
    ratios[0] > 5,
    `${ratios[0].toFixed(1)}× entre t = 7,4 y t = 47,0 · **esto** es lo que rompe la lectura de baldosa, no la diferencia entre capas`
  )

  /**
   * ⚠️ **Y AHORA DONDE EL OJO LO VE.** La losa entera no es el cuadro: la cámara
   * ve un pedazo, así que la variación que llega a pantalla es menor que ese
   * 6,3×. Éste es el número que hay que citar cuando se hable de la lectura de
   * baldosa, y el que dice que el CIERRE no queda peor que el hero.
   */
  const frames = [0, 0.5, 0.625, 0.95].map((at) => ({ at, spread: framePenumbraSpread(at, SPREAD) }))
  check(
    'en cuadro el borde varía entre dos y cuatro veces, en las cuatro poses con piso',
    frames.every((row) => row.spread !== null && row.spread.max / row.spread.min > 1.8),
    frames
      .map((row) => `p=${row.at} ×${row.spread ? (row.spread.max / row.spread.min).toFixed(1) : '—'}`)
      .join(' · ')
  )
  check(
    'y la mediana del borde en cuadro es plana a lo largo del arco: el cierre no queda peor',
    frames.every((row) => row.spread !== null && row.spread.median > 0.16 && row.spread.median < 0.23),
    frames
      .map((row) => `p=${row.at} ${row.spread?.median.toFixed(3)} celdas (${row.spread?.minWorld.toFixed(2)}–${row.spread?.maxWorld.toFixed(2)} de mundo)`)
      .join(' · ')
  )
}

report('s12 · el modelo de penumbra')
