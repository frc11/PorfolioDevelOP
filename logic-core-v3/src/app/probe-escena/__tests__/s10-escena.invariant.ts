/**
 * COMPROBACIONES DE S10 · la escena vaciada, las partículas y el sol.
 *
 *     npx tsx src/app/probe-escena/__tests__/s10-escena.invariant.ts
 *
 * La otra mitad de `s10-fondo.invariant.ts`. Ésta no mira la envolvente por
 * dentro: mira **qué le pasa al cuadro** cuando se borran los planos.
 *
 *   1. El instrumento de tinta, contra una medición independiente.
 *   2. **El balance de negro**, que es la cifra que este sprint tenía que
 *      publicar — incluido el techo que la envolvente no puede levantar.
 *   3. ~~El sol: contra qué se recorta ahora, y qué le cuesta el washout.~~
 *      **Borrado en S11 con el cuerpo del sol** — ver la nota de la sección 4.
 *
 * Las partículas —conteo, conchas y el recorte de `gl_PointSize`— están en
 * `s10-particulas.invariant.ts`.
 */
import { LOGO_INK_VIEWBOX } from '@/components/ui/LogoMark'

import { sampleLightArc } from '@/app/v3/_lib/escena/choreographySampler'
import type { MutableLightLevels } from '@/app/v3/_lib/escena/choreographyTypes'
import { MOIRE_MISMATCH } from '@/app/v3/_lib/escena/probeMoire'
import { CELOSIA_BAR, celosiaSkyFactor } from '@/app/v3/_lib/escena/probeCelosia'
import { check, report, section } from './harness'
import { INK_HEIGHT, INK_WIDTH, mask, sampleFrame } from './frameProbe'

const RAD = Math.PI / 180
const CELOSIA = { bar: CELOSIA_BAR, sky: celosiaSkyFactor(CELOSIA_BAR) }
const arc: MutableLightLevels = { level: 1, kelvin: 6500, azimuthDeg: 0, elevationDeg: 0 }

/** Las seis poses, con el azimut y la altura que el contraluz necesita saber. */
const POSES: readonly [string, number, number, number][] = [
  ['hero', 0, 0, 6.4],
  ['quiénes somos', 0.375, 130, -3.6],
  ['números', 0.5, 185, 9],
  ['trabajos', 0.625, 195, 4.5],
  ['demos', 0.75, 310, -2.6],
  ['cierre', 0.95, 360, -1.4],
]

// ── 1 · El instrumento ──────────────────────────────────────────────────────

section('La tinta del logo, contra una medición independiente')

check(
  'el aplanado del path reproduce la caja de tinta que S8b midió por otro camino',
  Math.abs(mask.x - LOGO_INK_VIEWBOX.x) < 1e-3 &&
    Math.abs(mask.y - LOGO_INK_VIEWBOX.y) < 1e-3 &&
    Math.abs(mask.width - LOGO_INK_VIEWBOX.width) < 1e-3 &&
    Math.abs(mask.height - LOGO_INK_VIEWBOX.height) < 1e-3,
  `${mask.x.toFixed(3)} ${mask.y.toFixed(3)} ${mask.width.toFixed(3)} ${mask.height.toFixed(3)} contra ${LOGO_INK_VIEWBOX.x} ${LOGO_INK_VIEWBOX.y} ${LOGO_INK_VIEWBOX.width} ${LOGO_INK_VIEWBOX.height}`
)
check(
  'la marca llena menos de la mitad de su propia caja',
  mask.fill > 0.4 && mask.fill < 0.45,
  `${(mask.fill * 100).toFixed(2)}% — medir con la caja en vez de con la tinta daría 2,3 veces de más`
)
check(
  'y la caja en mundo es la del mesh extruido, menos el bisel',
  Math.abs(INK_WIDTH - 6.849) < 0.01 && Math.abs(INK_HEIGHT - 4.765) < 0.01,
  `${INK_WIDTH.toFixed(3)} × ${INK_HEIGHT.toFixed(3)} · con bisel el mesh mide 6,863 × 4,779`
)

/**
 * ⚠️ **LOS CONTROLES POSITIVOS DE ESTE ARCHIVO (SITIO-S10).** El invariante corría
 * ocho afirmaciones **sin una sola entrada equivocada**. Las dos de acá atacan la
 * pieza de la que cuelga todo lo demás: la comparación de la caja de tinta con
 * una tolerancia de 1e-3, que sale en verde igual si el comparador estuviera
 * devolviendo siempre `true`.
 */
type Caja = { readonly x: number; readonly y: number; readonly width: number; readonly height: number }
const cajaIgual = (a: Caja, b: Caja): boolean =>
  Math.abs(a.x - b.x) < 1e-3 &&
  Math.abs(a.y - b.y) < 1e-3 &&
  Math.abs(a.width - b.width) < 1e-3 &&
  Math.abs(a.height - b.height) < 1e-3
check(
  'control positivo — el mismo comparador VE una caja corrida una milésima por encima de su tolerancia',
  !cajaIgual(LOGO_INK_VIEWBOX, { ...LOGO_INK_VIEWBOX, width: LOGO_INK_VIEWBOX.width + 0.002 }),
  'la tolerancia es 1e-3: 0,002 de ancho tiene que hacerlo fallar'
)
check(
  'control positivo — y el relleno de la marca NO da lo mismo medido contra su caja',
  !(mask.fill > 0.99),
  `${(mask.fill * 100).toFixed(2)}% — el 100% sería el síntoma de estar midiendo la caja y no la tinta`
)

// ── 2 · El balance de negro ─────────────────────────────────────────────────

section('El balance de negro: la escena SÍ queda más clara, y con cuánto')

/**
 * ⚠️ **Este bloque publica una cifra incómoda a propósito.**
 *
 * Los once planos suspendidos eran el 30% al 49% del cuadro en `#191917`.
 * Borrarlos sube el valor medio del cuadro entre 45 y 113 puntos, y la envolvente
 * lo recupera solo en parte. La decisión fue aceptar la escena más clara y dejar
 * el PISO como sprint propio.
 *
 * ⚠️ **S11 mide las dos ramas CON la celosía puesta**, y no es un detalle: lo que
 * este bloque afirma es cuánto aporta **la envolvente**, así que las dos ramas
 * tienen que diferir en la envolvente y en nada más. Los valores absolutos de la
 * escena de hoy están en `s11-piso.invariant.ts`, contra los seis de S10.
 */
{
  const rows: string[] = []
  let worstFloor = 0
  let worstFloorPose = ''
  for (const [name, at, azimuth, height] of POSES) {
    const view = { progress: at, cameraAzimuthDeg: azimuth, cameraHeight: height }
    const empty = sampleFrame(at, view, { backdrop: false, celosia: CELOSIA }, 200, 113)
    const withBackdrop = sampleFrame(
      at,
      view,
      { backdrop: true, mismatch: MOIRE_MISMATCH, celosia: CELOSIA },
      200,
      113
    )
    rows.push(
      `${name} tinta ${(withBackdrop.ink * 100).toFixed(1)}% · vacía ${empty.mean.toFixed(0)} → con fondo ${withBackdrop.mean.toFixed(0)}`
    )
    if (withBackdrop.floor > worstFloor) {
      worstFloor = withBackdrop.floor
      worstFloorPose = name
    }
  }

  /**
   * ⚠️ **EL CONTROL DEL MUESTREADOR, y es el que sostiene la tabla de arriba.** La
   * afirmación es «con fondo el cuadro es MÁS OSCURO que sin fondo»; si
   * `sampleFrame` ignorara la opción `backdrop`, las dos ramas darían lo mismo y
   * el `<` fallaría — pero si devolviera un valor cualquiera y decreciente,
   * pasaría igual. Se le pide la MISMA rama dos veces: ahí no puede ser menor.
   */
  const [, at0, az0, h0] = POSES[0]
  const vista0 = { progress: at0, cameraAzimuthDeg: az0, cameraHeight: h0 }
  const conFondoA = sampleFrame(at0, vista0, { backdrop: true, mismatch: MOIRE_MISMATCH, celosia: CELOSIA }, 120, 68)
  const conFondoB = sampleFrame(at0, vista0, { backdrop: true, mismatch: MOIRE_MISMATCH, celosia: CELOSIA }, 120, 68)
  const sinFondo = sampleFrame(at0, vista0, { backdrop: false, celosia: CELOSIA }, 120, 68)
  check(
    'control positivo — la MISMA rama contra sí misma NO baja el valor medio',
    !(conFondoA.mean < conFondoB.mean) && conFondoA.mean === conFondoB.mean,
    `${conFondoA.mean.toFixed(1)} = ${conFondoB.mean.toFixed(1)} — el muestreador es determinista, así que la baja de abajo es del fondo y no del ruido`
  )
  check(
    'control positivo — y las dos ramas SÍ difieren: la opción `backdrop` no se ignora',
    conFondoA.mean !== sinFondo.mean,
    `con fondo ${conFondoA.mean.toFixed(1)} contra ${sinFondo.mean.toFixed(1)} sin él, en la misma pose`
  )

  check(
    'la envolvente baja el valor medio del cuadro en TODAS las poses',
    POSES.every(([, at, azimuth, height]) => {
      const view = { progress: at, cameraAzimuthDeg: azimuth, cameraHeight: height }
      return (
        sampleFrame(at, view, { backdrop: true, mismatch: MOIRE_MISMATCH, celosia: CELOSIA }, 120, 68)
          .mean < sampleFrame(at, view, { backdrop: false, celosia: CELOSIA }, 120, 68).mean
      )
    }),
    rows.join(' · ')
  )

  check(
    'la tinta que queda es SOLO el logo, y es poca',
    POSES.every(([, at, azimuth, height]) => {
      const sample = sampleFrame(
        at,
        { progress: at, cameraAzimuthDeg: azimuth, cameraHeight: height },
        { backdrop: true },
        120,
        68
      )
      return sample.ink < 0.26
    }),
    'entre 2,8% y 23,2% del cuadro, contra el 10,6%–73,5% que sumaban los planos'
  )

  /**
   * ⚠️ **EL TECHO.** En las poses altas el cuadro es piso, así que la envolvente
   * apenas aparece y ninguna de sus perillas puede cambiar eso. Es el número que
   * el sprint del piso tiene que heredar.
   */
  check(
    'hay poses donde la mayor parte del cuadro es PISO y el fondo no llega',
    worstFloor > 0.6,
    `la peor es ${worstFloorPose}, con ${(worstFloor * 100).toFixed(0)}% del cuadro en papel — ninguna perilla de la envolvente lo toca`
  )
}

// ── 4 · El sol ──────────────────────────────────────────────────────────────

/**
 * ⚠️ **LA SECCIÓN DEL SOL SE BORRÓ EN S11.**
 *
 * Eran tres chequeos: contra qué fondo se recortaba el disco (109 y 157 puntos de
 * contraste con la envolvente detrás), cuánto le costaba el washout (109 → 64) y
 * que el halo midiera más que el cuadro. Los tres medían un cuerpo que ya no se
 * dibuja.
 *
 * El diagnóstico que los mata está en `probeCelosia.ts` y vale la pena repetirlo
 * acá: **el problema del sol nunca fue el contraste.** S10 lo llevó de 41 a 157
 * puntos y el veredicto humano siguió siendo que no se lee como un sol. Un sol no
 * es un círculo en el cielo, es una dirección de la que viene la luz — y sobre
 * papel blanco lo único que se puede hacer con luz es sacarla.
 *
 * Lo que reemplaza a estas mediciones no es otro chequeo del disco: es el rango
 * tonal del piso (`s11-piso.invariant.ts`) y el batido proyectado
 * (`s11-celosia.invariant.ts`).
 */

section('La sombra se alarga, que es la otra mitad del tiempo pasando')

{
  const top = INK_HEIGHT / 2
  const floor = -(0.007 * 1024) / 2 - 0.72
  const lengths: number[] = []
  for (const p of [0, 0.5, 0.75, 0.875, 0.95, 1]) {
    sampleLightArc(p, arc)
    lengths.push((top - floor) / Math.tan(arc.elevationDeg * RAD))
  }
  const crece = (xs: readonly number[]): boolean =>
    xs.every((value, i) => i === 0 || value >= xs[i - 1])
  const grows = crece(lengths)
  check(
    'control positivo — el detector de crecimiento VE la MISMA lista dada vuelta',
    !crece([...lengths].reverse()),
    'la sombra recorrida al revés se acorta, y eso es exactamente lo que tiene que ver'
  )
  check(
    'la sombra del borde superior del logo crece de punta a punta del recorrido',
    grows && lengths[lengths.length - 1] > lengths[0] * 3,
    `${lengths.map((value) => value.toFixed(1)).join(' → ')} unidades de mundo · ×${(lengths[lengths.length - 1] / lengths[0]).toFixed(1)}`
  )

  /**
   * ⚠️ **Y las bandas de la celosía se alargan con la MISMA cuenta.** El chequeo
   * de "el halo del sol nunca entra entero" se fue con el halo; lo que ocupa su
   * lugar es esto: la celda proyectada sobre el piso mide 2,34 de ancho por
   * 3,22 de largo en la meseta y por 11,51 en el cierre — el mismo ×3,6 que la
   * sombra de arriba, porque las dos son 1/tan(elevación). La sombra del logo y
   * las bandas del piso crecen juntas o no crece ninguna.
   */
  const bandLengths = [0, 0.5, 0.75, 0.875, 0.95, 1].map((p) => {
    sampleLightArc(p, arc)
    return 1 / Math.tan(arc.elevationDeg * RAD)
  })
  const ratio = bandLengths[bandLengths.length - 1] / bandLengths[0]
  check(
    'las bandas del piso se alargan con la MISMA razón que la sombra del logo',
    Math.abs(ratio - lengths[lengths.length - 1] / lengths[0]) < 1e-9,
    `×${ratio.toFixed(1)} las dos — 1/tan(elevación) es la única cuenta que hay`
  )
}

report('s10 · la escena vaciada')
