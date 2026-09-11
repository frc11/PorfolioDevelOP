/**
 * COMPROBACIONES DE S12 · el barrido del parámetro.
 *
 *     npx tsx src/app/probe-escena/__tests__/s12-barrido.invariant.ts
 *
 * **La tabla de la tensión, entera y reproducible.** `s12-tension` comprueba el
 * valor elegido contra su control; acá se barre el slider completo, porque la
 * tabla que el reporte publica —seis valores medios y cuatro pares de
 * portadora/batido, por cada uno de seis radios angulares— **tiene que tener un
 * instrumento que la produzca.** Es la regla 11 de `DIRECCION-ESCENA.md` §3, y
 * nació justamente de cuatro números de S11 que no lo tenían.
 *
 * Lo que se afirma es la FORMA del barrido, que es lo que sostiene la elección:
 *
 *   1. El valor medio del hero sube monótono con α y **nunca llega a 210**, ni
 *      en el tope del slider.
 *   2. **La portadora del piso no se mueve hasta 0,5°** y recién cae desde 0,75°.
 *      Ése es el techo práctico del parámetro, y es un número, no un gusto.
 *   3. El ancho de borde escala lineal con α en las cuatro poses a la vez.
 */
import { celosiaSunSpread, CELOSIA_SUN_RADIUS_DEG, CELOSIA_SUN_RADIUS_MAX_DEG } from '@/app/v3/_lib/escena/celosiaPenumbra'
import { CELOSIA_BAR, celosiaSkyFactor } from '@/app/v3/_lib/escena/probeCelosia'
import { RIM_NIGHT_LEVEL } from '@/app/v3/_lib/escena/probeLighting'
import { MOIRE_MISMATCH } from '@/app/v3/_lib/escena/probeMoire'

import { BEAT_POSES, celosiaBeatAt } from './celosiaBeat'
import { framePenumbraSpread } from './celosiaFloor'
import { check, report, section } from './harness'
import { sampleFrame } from './frameProbe'
import { levelAt, type ViewContext } from './shading'

/** El barrido que publica el reporte. El 0 es el control. */
const RADII = [0, 0.133, 0.266, 0.5, 0.75, 1, CELOSIA_SUN_RADIUS_MAX_DEG]

const POSES: readonly [string, number, number, number][] = [
  ['hero', 0, 0, 6.4],
  ['quiénes somos', 0.375, 130, -3.6],
  ['números', 0.5, 185, 9],
  ['trabajos', 0.625, 195, 4.5],
  ['demos', 0.75, 310, -2.6],
  ['cierre', 0.95, 360, -1.4],
]
const S11_MEAN = [201, 166, 213, 185, 129, 104]
/** El techo que puso el humano en S12: si el hero pasa de acá, se deshace S11. */
const HERO_CEILING = 210
const PARTICLE_DELTA = [8, 7, 8, 7, 2, 0]
const SKY = celosiaSkyFactor(CELOSIA_BAR)

function meanAt(spread: number): number[] {
  return POSES.map(([, at, azimuth, height], i) => {
    const view: ViewContext = { progress: at, cameraAzimuthDeg: azimuth, cameraHeight: height }
    return (
      sampleFrame(
        at,
        view,
        { backdrop: true, mismatch: MOIRE_MISMATCH, celosia: { bar: CELOSIA_BAR, sky: SKY, spread } },
        200,
        113
      ).mean - PARTICLE_DELTA[i]
    )
  })
}

const sweep = RADII.map((deg) => ({
  deg,
  mean: meanAt(celosiaSunSpread(deg)),
  beat: BEAT_POSES.map((pose) => celosiaBeatAt(pose, celosiaSunSpread(deg))),
}))

// ── 1 · Los seis valores medios ─────────────────────────────────────────────

section('El barrido: los seis valores medios contra 201/166/213/185/129/104')

for (const row of sweep) {
  console.log(
    `  α=${row.deg.toFixed(3)}°  ` +
      row.mean
        .map((value, i) => `${POSES[i][0]} ${value.toFixed(1)} (${value - S11_MEAN[i] >= 0 ? '+' : ''}${(value - S11_MEAN[i]).toFixed(1)})`)
        .join(' · ')
  )
}

{
  const hero = sweep.map((row) => row.mean[0])
  check(
    'el hero sube monótono con α: el parámetro devuelve contraste, y se ve cuánto',
    hero.every((value, i) => i === 0 || value > hero[i - 1]),
    hero.map((value) => value.toFixed(1)).join(' → ')
  )
  /**
   * ⚠️ **ESTA AFIRMACIÓN CAMBIÓ DE ALCANCE EN V3-E, Y EL CAMBIO ES UN HALLAZGO.**
   *
   * Decía *«NUNCA llega a 210, ni en el tope del slider»*, y era cierto: el hero
   * marcaba 209,0 en α = 1,5°. **V3-E movió `frameX` del hero de 0,68 a 0,5** —la
   * cámara rota y entra más piso iluminado en cuadro— y la curva entera subió
   * ~1,3 puntos: el tope del slider pasa a **210,8**, o sea que CRUZA el techo de
   * 210 que fijó el humano.
   *
   * **No se toca el techo y no se afloja la comprobación.** Lo que se afirma es
   * lo que importa y sigue siendo cierto —**el valor EMBARCADO queda debajo, con
   * margen**— y lo que dejó de serlo se PUBLICA con su número: el α donde se
   * cruza, derivado por bisección y no escrito, y cuántas veces el valor
   * embarcado es. El slider llega hasta 1,5° para poder VER el extremo (§4 de
   * este mismo archivo), no para embarcarlo.
   *
   * ⚠️ **Decisión del dueño del proyecto (V3-E): el techo de 210 NO se toca, y el
   * cruce queda PUBLICADO, no afirmado.** Si algún día se quiere subir el sol por
   * encima de ese α, hay que decidir de nuevo el techo o revisar el encuadre del
   * hero. Hoy no hace falta: el margen del valor embarcado es de 5,7 puntos.
   */
  const HERO_ELEGIDO = meanAt(celosiaSunSpread(CELOSIA_SUN_RADIUS_DEG))[0]
  check(
    'el valor EMBARCADO del sol deja el hero debajo del techo de 210, con margen',
    HERO_ELEGIDO < HERO_CEILING,
    `α = ${CELOSIA_SUN_RADIUS_DEG}° da ${HERO_ELEGIDO.toFixed(1)} contra el techo de ${HERO_CEILING} — ${(HERO_CEILING - HERO_ELEGIDO).toFixed(1)} de margen`
  )

  /** El α donde el hero cruza el techo, por bisección. Derivado, no escrito. */
  const alphaDelCruce = ((): number | null => {
    if (hero[hero.length - 1] < HERO_CEILING) return null
    let bajo = CELOSIA_SUN_RADIUS_DEG
    let alto = CELOSIA_SUN_RADIUS_MAX_DEG
    for (let i = 0; i < 12; i += 1) {
      const medio = (bajo + alto) / 2
      if (meanAt(celosiaSunSpread(medio))[0] < HERO_CEILING) bajo = medio
      else alto = medio
    }
    return (bajo + alto) / 2
  })()
  console.log(
    alphaDelCruce === null
      ? `  · el techo de ${HERO_CEILING} no se cruza en todo el slider — máximo ${Math.max(...hero).toFixed(1)} con α = ${CELOSIA_SUN_RADIUS_MAX_DEG}°`
      : `  · PUBLICADO, no afirmado (decisión de V3-E): el techo de ${HERO_CEILING} se cruza en α = ${alphaDelCruce.toFixed(3)}°, ${(alphaDelCruce / CELOSIA_SUN_RADIUS_DEG).toFixed(1)}× el embarcado · en el tope del slider (${CELOSIA_SUN_RADIUS_MAX_DEG}°) el hero llega a ${Math.max(...hero).toFixed(1)}`
  )
  check(
    'en el valor elegido ninguna pose se mueve más de 2,5 puntos',
    POSES.every((_, i) => sweep[2].mean[i] - sweep[0].mean[i] <= 2.6),
    POSES.map((pose, i) => `${pose[0]} +${(sweep[2].mean[i] - sweep[0].mean[i]).toFixed(1)}`).join(' · ')
  )
  /**
   * ⚠️ **NI EN EL TOPE DEL SLIDER se deshace S11.** La pose que más se mueve en
   * todo el rango es Trabajos, +10,6 puntos — y aun así queda 12 por debajo de la
   * escena SIN celosía que midió S10. El slider no puede devolver el sprint
   * anterior ni en su extremo, que es la garantía que hace que sea seguro
   * calibrar mirando.
   */
  /**
   * ⚠️ **B8 · CUSTODIABA «ninguna pose vuelve a la escena sin celosía» CONTRA LA
   * TABLA DE S10.** Esa tabla es la luz del arco viejo: B8 volvió a iluminar
   * cuatro poses, y la mañana deja al Cierre en 152, arriba de los 120 de S10 —
   * no es la celosía, es la luz—. La escena SIN celosía se calcula con el mismo
   * instrumento a la luz de hoy y contra ésa se afirma; en las dos poses
   * intactas (hero, quiénes somos) tiene que dar los números de S10, que es lo
   * que ata esta tabla a aquélla. En la noche la celosía sólo puede bajar lo que
   * la key deja: ahí se pide «por debajo», no «dos puntos por debajo».
   */
  const S10_MEAN = [216, 172, 222, 208, 136, 120]
  const SIN_CELOSIA = POSES.map(
    ([, at, azimuth, height], i) =>
      sampleFrame(at, { progress: at, cameraAzimuthDeg: azimuth, cameraHeight: height }, { backdrop: true, mismatch: MOIRE_MISMATCH }, 200, 113)
        .mean - PARTICLE_DELTA[i]
  )
  const conLuzEnPose = POSES.map(([, at]) => levelAt(at) >= RIM_NIGHT_LEVEL)
  /**
   * ⚠️ **B13 · LA REPRODUCCIÓN QUEDA EN UNA POSE, POR LA CÁMARA Y NO POR LA LUZ.**
   * Autorizado por el dueño al cerrar la PARADA 1 de B13; se reescribe contra la
   * propiedad nueva. **Qué custodiaba:** que la escena SIN celosía devolviera los
   * números de S10 en las DOS poses que B8 no re-iluminó — el ancla de esta tabla
   * con aquélla. **Por qué cambió:** B13 alejó la cámara de `quiénes somos` (11,5
   * → 14) y su valor medio pasa de **172 a 186**; su luz sigue intacta. El 172 no
   * se pisa: es lo que S10 publicó. Se afirma el hero **con su tolerancia de
   * siempre** —la de 2, que es la del `frameX` de V3-E, sin tocar— y aparte que la
   * otra se movió, hacia arriba, con la causa nombrada. Es la misma reescritura
   * que `s12-tension` y `s11-piso`, y por la misma razón.
   */
  check(
    'la escena sin celosía, a la luz de hoy, reproduce el número de S10 en la única pose que nadie re-iluminó ni movió: el hero',
    Math.abs(SIN_CELOSIA[0] - S10_MEAN[0]) < 2,
    `hero ${SIN_CELOSIA[0].toFixed(1)} (S10 ${S10_MEAN[0]}, +1,3 por el encuadre de V3-E)`
  )
  check(
    '  B13 — y `quiénes somos` ya NO lo reproduce: se alejó, y alejarse a la misma altura mete más sala clara en cuadro',
    SIN_CELOSIA[1] > S10_MEAN[1] && SIN_CELOSIA[1] - S10_MEAN[1] < Math.abs(SIN_CELOSIA[2] - S10_MEAN[2]),
    `quiénes somos ${SIN_CELOSIA[1].toFixed(1)} (S10 ${S10_MEAN[1]}) — +${(SIN_CELOSIA[1] - S10_MEAN[1]).toFixed(1)} por distancia 11,5 → 14, con su luz intacta · para comparar, lo que la LUZ le hizo a Números es ${(SIN_CELOSIA[2] - S10_MEAN[2]).toFixed(1)}`
  )
  const top = sweep[sweep.length - 1].mean
  const movimientos = top.map((value, i) => value - sweep[0].mean[i])
  const queMasSeMueve = movimientos.indexOf(Math.max(...movimientos))
  check(
    'ni en el tope del slider ninguna pose vuelve a la escena sin celosía, a la MISMA luz',
    top.every((value, i) => (conLuzEnPose[i] ? value < SIN_CELOSIA[i] - 2 : value < SIN_CELOSIA[i])),
    top.map((value, i) => `${POSES[i][0]} ${value.toFixed(1)} < ${SIN_CELOSIA[i].toFixed(1)}${conLuzEnPose[i] ? '' : ' (noche)'}`).join(' · ') +
      ` · la que más se mueve en todo el rango es ${POSES[queMasSeMueve][0]}, +${movimientos[queMasSeMueve].toFixed(1)}`
  )
}

// ── 2 · La portadora y el batido ────────────────────────────────────────────

section('El barrido: portadora y batido del piso, con su control en α = 0')

for (const row of sweep) {
  console.log(
    `  α=${row.deg.toFixed(3)}°  ` +
      row.beat
        .map((sample, i) => {
          const base = sweep[0].beat[i]
          if (!sample || !base) return `${BEAT_POSES[i][0]} —`
          return `${BEAT_POSES[i][0]} ${sample.beat.toFixed(1)}/${sample.carrier.toFixed(1)} (${((sample.beat / base.beat - 1) * 100).toFixed(0)}%/${((sample.carrier / base.carrier - 1) * 100).toFixed(0)}%)`
        })
        .join(' · ')
  )
}

{
  const carrierAt = (deg: number, i: number) => {
    const row = sweep.find((entry) => entry.deg === deg)
    const base = sweep[0].beat[i]
    return row && row.beat[i] && base ? row.beat[i]!.carrier / base.carrier - 1 : NaN
  }
  /**
   * ⚠️ **EL TECHO PRÁCTICO DEL PARÁMETRO, COMO NÚMERO.** La portadora es el
   * contraste de banda sobre el papel: los 29,6 puntos que S11 compró, vistos
   * donde caen. Mientras no se mueva, ablandar el borde sale gratis.
   */
  /**
   * ⚠️ **B8 · CUSTODIABAN la portadora en las CUATRO poses con piso.** Dos de
   * ellas (Números y Trabajos) están ahora en la noche: la portadora es el
   * contraste de banda sobre el papel, y con la key al 8 % es una fracción de la
   * del día —un cambio de décimas se lee como −17 %—. Se afirma donde la banda
   * existe, las poses con luz (hero y cierre), y en la noche se afirma y publica
   * lo otro: que la portadora es una fracción de la del hero. El techo práctico
   * del parámetro lo marca el hero, la pose de calibración: aguanta 0,75° y cae
   * en 1°. Antes lo marcaban Números y Trabajos a pleno sol, desde 0,75°.
   */
  const conLuz = BEAT_POSES.map((pose) => levelAt(pose[1]) >= RIM_NIGHT_LEVEL)
  const portadoraDeControl = (i: number): number => sweep[0].beat[i]?.carrier ?? NaN
  check(
    'la portadora NO se mueve hasta 0,5° en las poses con luz: hasta ahí ablandar el borde sale gratis',
    conLuz.some((v) => v) && BEAT_POSES.every((_, i) => !conLuz[i] || Math.abs(carrierAt(0.5, i)) < 0.02),
    BEAT_POSES.map((pose, i) => `${pose[0]} ${(carrierAt(0.5, i) * 100).toFixed(1)}%${conLuz[i] ? '' : ' (noche)'}`).join(' · ')
  )
  /**
   * ⚠️ **B12 · EN LA NOCHE NO HAY PORTADORA, Y ES GEOMETRÍA.** B8 la medía «una
   * fracción de la del hero» con la noche a 0,08 (2,70°). B12 la baja a **0,04
   * (1,35°)** —«full negro atrás»— y ahí el rayo del piso al sol **no llega al
   * borde inferior de la capa lejana**: `MOIRE_FAR_BOTTOM` (−2,5) a radio
   * `MOIRE_FAR_RADIUS` (44) sobre un piso en −4,304 pide **2,348°**. Sin dos
   * capas no hay batido ni portadora, y `celosiaBeatAt` devuelve `null` con
   * razón (lo mismo que afirman `s11-proyeccion` §1 y `s12-tension` §2).
   *
   * Se afirma entonces lo exacto —que la pose de la noche NO devuelve lectura y
   * que es exactamente UNA— en vez de una desigualdad sobre un `NaN`, que
   * pasaría en verde por accidente.
   */
  check(
    '  y en la noche NO hay portadora: el sol rasante no cruza la capa lejana, así que no hay banda que cuidar (B12)',
    BEAT_POSES.every((_, i) => conLuz[i] || Number.isNaN(portadoraDeControl(i))) && conLuz.filter((v) => !v).length === 1,
    BEAT_POSES.map((pose, i) => `${pose[0]} ${Number.isNaN(portadoraDeControl(i)) ? 'sin portadora' : portadoraDeControl(i).toFixed(1)}${conLuz[i] ? '' : ' (noche)'}`).join(' · ')
  )
  check(
    'y en el hero —la pose de calibración— aguanta 0,75° y cae en 1°: ahí el sprint sí estaría deshaciendo a S11',
    Math.abs(carrierAt(0.75, 0)) < 0.02 && carrierAt(1, 0) < -0.05,
    `en 0,75° ${BEAT_POSES.map((pose, i) => `${pose[0]} ${(carrierAt(0.75, i) * 100).toFixed(0)}%`).join(' · ')} · en 1° ${BEAT_POSES.map((_, i) => `${(carrierAt(1, i) * 100).toFixed(0)}%`).join('/')}`
  )
  // ⚠️ B12: la pose de la noche no tiene batido que perder (ver arriba), así que
  // la vara se le pide a las poses CON LUZ — con el mismo −11,5 % de siempre.
  check(
    'en el valor elegido el batido no pierde más del 11% en ninguna pose con luz',
    BEAT_POSES.every((_, i) => {
      if (!conLuz[i]) return true
      const row = sweep.find((entry) => entry.deg === 0.266)
      const base = sweep[0].beat[i]
      return row && row.beat[i] && base ? row.beat[i]!.beat / base.beat - 1 > -0.115 : false
    }),
    'y en el hero SUBE: con el borde filoso los huecos entre barras casi no dejan pasar luz entera'
  )
}

// ── 3 · El ancho de borde, a lo largo del barrido ───────────────────────────

section('El ancho de borde en cuadro, pose por pose')

{
  for (const deg of RADII) {
    if (deg === 0) continue
    const spread = celosiaSunSpread(deg)
    console.log(
      `  α=${deg.toFixed(3)}°  ` +
        BEAT_POSES.map((pose) => {
          const frame = framePenumbraSpread(pose[1], spread)
          return frame
            ? `${pose[0]} ${frame.min.toFixed(3)}/${frame.median.toFixed(3)}/${frame.max.toFixed(3)} celdas`
            : `${pose[0]} —`
        }).join(' · ')
    )
  }

  const medians = [0.133, 0.266, 0.5, 1].map((deg) =>
    BEAT_POSES.map((pose) => framePenumbraSpread(pose[1], celosiaSunSpread(deg))?.median ?? NaN)
  )
  check(
    'el ancho escala lineal con α en las cuatro poses a la vez',
    medians[1].every((value, i) => Math.abs(value / medians[0][i] - 2) < 0.02) &&
      medians[3].every((value, i) => Math.abs(value / medians[1][i] - 1 / 0.266) < 0.05),
    `mediana en el hero: ${medians.map((row) => row[0].toFixed(3)).join(' → ')} para α = 0,133 / 0,266 / 0,5 / 1°`
  )
  check(
    '⚠️ y en el tope del slider la mediana pasa media celda: ahí el moiré se lava',
    BEAT_POSES.some(
      (pose) => (framePenumbraSpread(pose[1], celosiaSunSpread(CELOSIA_SUN_RADIUS_MAX_DEG))?.median ?? 0) > 0.5
    ),
    BEAT_POSES.map(
      (pose) =>
        `${pose[0]} ${framePenumbraSpread(pose[1], celosiaSunSpread(CELOSIA_SUN_RADIUS_MAX_DEG))?.median.toFixed(3)}`
    ).join(' · ') + ` celdas con α = ${CELOSIA_SUN_RADIUS_MAX_DEG}° · para eso llega hasta ahí el slider: para poder VER el extremo`
  )
}

report('s12 · el barrido del parámetro')
