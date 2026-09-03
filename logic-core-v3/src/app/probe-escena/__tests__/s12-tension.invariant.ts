/**
 * COMPROBACIONES DE S12 · la tensión.
 *
 *     npx tsx src/app/probe-escena/__tests__/s12-tension.invariant.ts
 *
 * Ablandar el borde QUITA contraste, y S11 acaba de comprar contraste con mucho
 * trabajo. Este sprint tiene tres cosas que tiran para lados distintos y esta
 * suite las mide contra el mismo control:
 *
 *   1. **El contraste de S11**: los seis valores medios del cuadro, y el techo
 *      de 210 en el hero que el humano puso como línea de corte.
 *   2. **El batido del piso**: vive de la interferencia entre dos tramas de
 *      borde definido, así que la penumbra es exactamente lo que puede matarlo.
 *   3. **La lectura de baldosa**, que es lo que vinimos a arreglar y necesita
 *      penumbra sobre todo VARIABLE — eso se mide en `s12-penumbra`.
 *
 * Y las tres correcciones del diagnóstico del sprint, escritas como chequeo y no
 * como nota: la penumbra NO se ensancha al atardecer, la diferencia entre capas
 * es del 16%, y la creciente de sol abierto ya tenía el borde blando.
 */
import { celosiaTransmittance } from '@/app/v3/_lib/escena/celosiaGeometry'
import { CELOSIA_SUN_RADIUS_DEG, celosiaSunSpread } from '@/app/v3/_lib/escena/celosiaPenumbra'
import { CELOSIA_BAR, celosiaSkyFactor } from '@/app/v3/_lib/escena/probeCelosia'
import { MOIRE_FADE, MOIRE_MISMATCH } from '@/app/v3/_lib/escena/probeMoire'

import { BEAT_POSES, celosiaBeatAt } from './celosiaBeat'
import { floorPenumbraAt } from './celosiaFloor'
import { FLOOR_Y, check, report, section, type Vec3 } from './harness'
import { sampleFrame } from './frameProbe'
import { sunDirectionAt, type ViewContext } from './shading'

const SKY = celosiaSkyFactor(CELOSIA_BAR)
const SPREAD = celosiaSunSpread(CELOSIA_SUN_RADIUS_DEG)

const POSES: readonly [string, number, number, number][] = [
  ['hero', 0, 0, 6.4],
  ['quiénes somos', 0.375, 130, -3.6],
  ['números', 0.5, 185, 9],
  ['trabajos', 0.625, 195, 4.5],
  ['demos', 0.75, 310, -2.6],
  ['cierre', 0.95, 360, -1.4],
]
/** Los seis que S11 publicó en su §5.4, ya con el cielo tapado. */
const S11_MEAN = [201, 166, 213, 185, 129, 104]
/** Los seis de S10, o sea la escena sin celosía. Ninguno puede volver ahí. */
const S10_MEAN = [216, 172, 222, 208, 136, 120]
/** Cuánto bajan las partículas el valor medio; `sampleFrame` no las modela. */
const PARTICLE_DELTA = [8, 7, 8, 7, 2, 0]
/** El techo que puso el humano: si el hero pasa de acá, el sprint deshace S11. */
const HERO_CEILING = 210

function meanAt(spread: number): number[] {
  return POSES.map(([, at, azimuth, height], i) => {
    const view: ViewContext = { progress: at, cameraAzimuthDeg: azimuth, cameraHeight: height }
    const sample = sampleFrame(
      at,
      view,
      { backdrop: true, mismatch: MOIRE_MISMATCH, celosia: { bar: CELOSIA_BAR, sky: SKY, spread } },
      200,
      113
    )
    return sample.mean - PARTICLE_DELTA[i]
  })
}

// ── 1 · El contraste que S11 compró ─────────────────────────────────────────

section('Los seis valores medios: cuánto devuelve la penumbra de lo que S11 ganó')

{
  const control = meanAt(0)
  const withSun = meanAt(SPREAD)

  /**
   * ⚠️ **CONTROL POSITIVO.** Con el sol sin tamaño angular el instrumento tiene
   * que devolver EXACTAMENTE los seis de S11. Sin esto, la comparación de abajo
   * mediría el modelo contra sí mismo y cualquier deriva pasaría desapercibida.
   */
  /**
   * ⚠️ **V3-E PARTIÓ ESTE CONTROL EN DOS, Y LA PARTICIÓN ES LA AFIRMACIÓN.**
   *
   * Pedía que los SEIS reprodujeran los enteros de S11 con menos de 1 de
   * desvío. V3-E movió `frameX` del hero de 0,68 a 0,5 —la cámara ROTA, así que
   * lo que entra en cuadro en la pose del hero cambia— y el hero pasó de 201 a
   * **202,3**. Aflojar la tolerancia a 1,5 habría tapado exactamente lo que hay
   * que poder ver.
   *
   * Lo que corre ahora dice **cuál puede moverse y cuáles no**, que es más
   * fuerte que la tolerancia única: la pose del hero es **la única cuyo encuadre
   * V3-E tocó**, así que es la única autorizada a moverse; las otras cinco
   * siguen contra el entero de S11 **con la misma tolerancia de antes**. Si
   * mañana se mueve una de esas cinco, esto se pone en rojo igual que siempre.
   */
  const HERO = 0
  check(
    'control positivo — con α = 0 las CINCO poses que V3-E no tocó siguen siendo las de S11',
    control.every((value, i) => i === HERO || Math.abs(value - S11_MEAN[i]) < 1),
    control
      .filter((_, i) => i !== HERO)
      .map((value, i) => `${POSES[i + 1][0]} ${value.toFixed(1)} (S11 ${S11_MEAN[i + 1]})`)
      .join(' · ')
  )
  check(
    '  y el hero se movió, que es lo que V3-E hizo: sólo por el encuadre, y hacia arriba',
    control[HERO] > S11_MEAN[HERO] && control[HERO] - S11_MEAN[HERO] < 2,
    `${control[HERO].toFixed(1)} contra los ${S11_MEAN[HERO]} de S11 — +${(control[HERO] - S11_MEAN[HERO]).toFixed(1)} por \`frameX\` 0,68 → 0,5, la única pose cuyo encuadre V3-E tocó`
  )
  check(
    'y el instrumento se mueve: con el sol de tamaño real las poses con piso suben',
    withSun[0] > control[0] + 1 && withSun[3] > control[3] + 1,
    withSun
      .map((value, i) => `${POSES[i][0]} ${value.toFixed(1)} (${(value - control[i] >= 0 ? '+' : '') + (value - control[i]).toFixed(1)})`)
      .join(' · ')
  )

  check(
    'el hero NO vuelve a pasar de 210: el sprint no deshace al anterior',
    withSun[0] < HERO_CEILING,
    `${withSun[0].toFixed(1)} contra el techo de ${HERO_CEILING} · con un sol cuatro veces más grande (α = 1°) llegaría a 208,2, así que el margen alcanza todo el slider útil`
  )
  check(
    'y ninguna de las seis vuelve a la escena SIN celosía que midió S10',
    withSun.every((value, i) => value < S10_MEAN[i] - 2),
    withSun.map((value, i) => `${POSES[i][0]} ${value.toFixed(0)} < ${S10_MEAN[i]}`).join(' · ')
  )
}

// ── 2 · El batido, que es lo que la penumbra puede matar ────────────────────

section('La portadora y el batido del piso, contra el control de α = 0')

{
  const control = BEAT_POSES.map((pose) => celosiaBeatAt(pose, 0))
  const withSun = BEAT_POSES.map((pose) => celosiaBeatAt(pose, SPREAD))
  check(
    'el instrumento devuelve las cuatro poses con piso en cuadro',
    control.every((row) => row !== null) && withSun.every((row) => row !== null),
    control
      .map((row, i) => `${BEAT_POSES[i][0]} ${row ? `${row.beat.toFixed(1)}/${row.carrier.toFixed(1)}` : '—'}`)
      .join(' · ')
  )

  /**
   * ⚠️ **LA PORTADORA ES LA LECTURA LIMPIA.** No depende del tramo barrido, y es
   * literalmente el contraste de banda sobre el papel: los 29,6 puntos que S11
   * compró, vistos donde caen. Si la penumbra se comiera el borde, esto bajaría.
   */
  const carrierDrop = withSun.map((row, i) => (row && control[i] ? row.carrier / control[i]!.carrier - 1 : NaN))
  check(
    'con el sol real la PORTADORA del piso no se mueve un punto',
    carrierDrop.every((drop) => Math.abs(drop) < 0.01),
    withSun
      .map((row, i) => `${BEAT_POSES[i][0]} ${row?.carrier.toFixed(1)} (control ${control[i]?.carrier.toFixed(1)})`)
      .join(' · ')
  )

  const beatDrop = withSun.map((row, i) => (row && control[i] ? row.beat / control[i]!.beat - 1 : NaN))
  check(
    'y el BATIDO sobrevive: ninguna pose pierde más del 15%',
    beatDrop.every((drop) => drop > -0.15),
    beatDrop.map((drop, i) => `${BEAT_POSES[i][0]} ${(drop * 100).toFixed(0)}%`).join(' · ')
  )

  /**
   * ⚠️ **EL MÉTODO DEPENDE DEL TRAMO, Y ESO SE COMPRUEBA, NO SE PROMETE.** El
   * batido absoluto crece con el barrido porque cuanto más largo, más cerca se
   * pasa de un nodo perfectamente en fase. Está acá para que nadie cite el
   * número suelto: lo que vale es el cambio contra el control al MISMO tramo.
   */
  const short = celosiaBeatAt(BEAT_POSES[0], 0, 3)
  const long = celosiaBeatAt(BEAT_POSES[0], 0, 7)
  check(
    'el batido depende del tramo barrido; la portadora no',
    short !== null &&
      long !== null &&
      long.beat > short.beat * 1.5 &&
      Math.abs(long.carrier - short.carrier) < 0.01,
    `hero con 3 / 5 / 7 períodos: batido ${short?.beat.toFixed(1)} → ${control[0]?.beat.toFixed(1)} → ${long?.beat.toFixed(1)} · portadora ${short?.carrier.toFixed(1)} → ${long?.carrier.toFixed(1)} · por eso el número absoluto no se cita solo`
  )
}

// ── 3 · Las tres correcciones del diagnóstico ───────────────────────────────

section('⚠️ Tres cosas que el diagnóstico daba por ciertas y la medición corrige')

{
  const center: Vec3 = [0, FLOOR_Y, 0]

  /**
   * **CORRECCIÓN 1 · `R/cos(elevación)`, no `1/tan`.** La distancia del punto
   * del piso al manto BAJA con el atardecer: el rayo llega antes, no después. Lo
   * que crece ×3,6 es la celda proyectada, así que la penumbra como fracción de
   * la banda se ACHICA. El cierre no se ablanda solo.
   */
  const early = floorPenumbraAt(center, sunDirectionAt(0), SPREAD)[0]
  const late = floorPenumbraAt(center, sunDirectionAt(1), SPREAD)[0]
  check(
    'la distancia al manto BAJA con el atardecer: es R/cos(elevación), no 1/tan',
    early !== null && late !== null && late.t < early.t * 0.9,
    `t = ${early?.t.toFixed(1)} en p=0 contra ${late?.t.toFixed(1)} en p=1 · el rayo llega ANTES a la celosía, no después`
  )
  check(
    'y por eso la penumbra, como fracción de la banda, se achica ~32%',
    early !== null && late !== null && late.cellsV < early.cellsV * 0.75,
    `${early?.cellsV.toFixed(3)} → ${late?.cellsV.toFixed(3)} celdas (${(((late!.cellsV - early!.cellsV) / early!.cellsV) * 100).toFixed(0)}%) mientras la celda se estira de ${early?.cellWorldV.toFixed(2)} a ${late?.cellWorldV.toFixed(2)} · en mundo parece ensancharse ×${(late!.worldV / early!.worldV).toFixed(1)}, pero es la celda la que creció debajo`
  )

  /**
   * **CORRECCIÓN 2 · Las dos capas difieren 16% en mundo, y se invierte en
   * relativo.** La comprobación fuerte —la razón de radios y la inversión— está
   * en `s12-penumbra`; acá se fija lo que se sigue de eso: **lo que rompe la
   * lectura de baldosa no es la diferencia entre capas.**
   */
  const [fine, coarse] = floorPenumbraAt(center, sunDirectionAt(0), SPREAD)
  const near: Vec3 = [
    Math.sin(Math.atan2(sunDirectionAt(0)[0], sunDirectionAt(0)[2])) * 32,
    FLOOR_Y,
    Math.cos(Math.atan2(sunDirectionAt(0)[0], sunDirectionAt(0)[2])) * 32,
  ]
  const closeUp = floorPenumbraAt(near, sunDirectionAt(0), SPREAD)[0]
  check(
    'la diferencia ENTRE CAPAS es chica al lado de la diferencia a lo largo del piso',
    fine !== null && coarse !== null && closeUp !== null && fine.cellsU / closeUp.cellsU > 4 * (coarse.worldU / fine.worldU),
    `entre capas ×${(coarse!.worldU / fine!.worldU).toFixed(2)} en mundo · a lo largo del piso ×${(fine!.cellsU / closeUp!.cellsU).toFixed(1)} · el segundo es geométrico y no depende de α`
  )

  /**
   * **CORRECCIÓN 3 · La creciente de sol abierto ya tenía el borde blando.** Su
   * transición mide 6,1 celdas finas con α = 0 y la pone `MOIRE_FADE`, no la
   * penumbra. Se mide el ancho 95→5% de la transmitancia media a lo largo del
   * radio opuesto al sol.
   */
  function crescentEdge(spread: number): { width: number; plateau: number } {
    const sun = sunDirectionAt(0)
    const azimuth = Math.atan2(sun[0], sun[2])
    const away: Vec3 = [-Math.sin(azimuth), 0, -Math.cos(azimuth)]
    const samples: { r: number; mean: number }[] = []
    for (let r = 0; r <= 33.9; r += 0.05) {
      let sum = 0
      const n = 40
      for (let k = 0; k < n; k += 1) {
        // Media local sobre una celda gruesa proyectada, transversal a la banda.
        const off = ((k + 0.5) / n - 0.5) * 6
        const q: Vec3 = [
          away[0] * r + Math.cos(azimuth) * off,
          FLOOR_Y,
          away[2] * r - Math.sin(azimuth) * off,
        ]
        sum += celosiaTransmittance(q, sun, CELOSIA_BAR, MOIRE_MISMATCH, 0, spread)
      }
      samples.push({ r, mean: sum / n })
    }
    const plateau = samples.slice(0, 120).reduce((a, s) => a + s.mean, 0) / 120
    const at = (target: number) => samples.find((s) => s.mean >= target)?.r ?? NaN
    return {
      width: at(plateau + 0.95 * (1 - plateau)) - at(plateau + 0.05 * (1 - plateau)),
      plateau,
    }
  }

  const hard = crescentEdge(0)
  const soft = crescentEdge(SPREAD)
  const huge = crescentEdge(celosiaSunSpread(1))

  /**
   * ⚠️ **CONTROL POSITIVO.** "La penumbra casi no mueve este borde" es la clase
   * de afirmación que sale verde cuando el instrumento ignora el parámetro — y
   * esta comprobación ya estuvo verde por vacío una vez, con un `crescentEdge`
   * que calculaba la barra dura y tiraba la penumbra. Antes de creerle hay que
   * ver que la MESETA sí responda: con el borde blando entra más luz por los
   * huecos y la transmitancia media de la zona con bandas sube.
   */
  check(
    'control positivo — el instrumento sí ve la penumbra: la meseta responde a α',
    huge.plateau > hard.plateau * 1.2 && Math.abs(soft.plateau - hard.plateau) > 0.002,
    `meseta ${hard.plateau.toFixed(3)} (α=0) → ${soft.plateau.toFixed(3)} (0,266°) → ${huge.plateau.toFixed(3)} (1°) · sin esto, lo de abajo pasaría con el parámetro desconectado. **No es monótona**: con una penumbra chica el borde blando corta un poco MÁS de lo que abre, y recién con la penumbra ancha domina el lavado`
  )
  check(
    'la creciente de sol abierto ya tenía el borde blando, y lo pone MOIRE_FADE',
    hard.width > 12,
    `${hard.width.toFixed(2)} de mundo = ${(hard.width / 2.34).toFixed(1)} celdas finas CON α = 0 · el desvanecido de banda vale ${MOIRE_FADE}`
  )
  check(
    'y la penumbra apenas se lo mueve, de punta a punta del slider',
    Math.abs(soft.width / hard.width - 1) < 0.02 && Math.abs(huge.width / hard.width - 1) < 0.06,
    `${hard.width.toFixed(2)} → ${soft.width.toFixed(2)} (${((soft.width / hard.width - 1) * 100).toFixed(1)}%) con el sol real, y ${huge.width.toFixed(2)} (${((huge.width / hard.width - 1) * 100).toFixed(1)}%) con α = 1° · "con penumbra su borde se ablanda solo" no es lo que pasa: ya estaba blando`
  )
}

report('s12 · la tensión')
