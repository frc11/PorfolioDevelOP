/**
 * COMPROBACIONES DE S10 · las tramas generadas, la envolvente de banda y el orden
 * de dibujo.
 *
 *     npx tsx src/app/probe-escena/__tests__/s10-tramas.invariant.ts
 *
 * La otra mitad de `s10-fondo.invariant.ts`. Aquélla mide la envolvente contra el
 * recorrido —geometría, batido, aliasing—; ésta mira **las texturas y el cableado**:
 * que la celda sea una retícula y no unos puntos, que el mosaico cierre, que el
 * desvanecido de banda esté donde tiene que estar, y que los transparentes se
 * dibujen en el orden correcto.
 */
import * as THREE from 'three'

import {
  bandEnvelope,
  createDottedGridCellData,
  createGridCellData,
} from '@/app/v3/_lib/escena/moireTextures'
import {
  MOIRE_BASE_ALPHA,
  MOIRE_COARSE_CELLS,
  MOIRE_DOT_OVER_LINE,
  MOIRE_DRIFT_PERIOD_S,
  MOIRE_FADE,
  MOIRE_FAR_ORDER,
  MOIRE_FAR_RADIUS,
  MOIRE_HEIGHT_SEGMENTS,
  MOIRE_MISMATCH,
  MOIRE_NEAR_ORDER,
  MOIRE_NEAR_RADIUS,
  MOIRE_SEGMENTS,
  MOIRE_TILE_SIZE,
  dotDiameter,
  fineCells,
  lineDuty,
  verticalPitch,
} from '@/app/v3/_lib/escena/probeMoire'
import { PARTICLE_R_MAX } from '@/app/v3/_lib/escena/probeParticles'
import { TAN_HALF_V, check, report, section } from './harness'

const PX_V = 1080
const FINE_CELLS = fineCells(MOIRE_MISMATCH)

// ── 6 · Las tramas generadas ────────────────────────────────────────────────

section('Las dos celdas: retícula, punto y mosaico que cierra')

{
  const size = MOIRE_TILE_SIZE
  const duty = 0.06
  const grid = createGridCellData(size, duty, MOIRE_BASE_ALPHA)
  const alphaAt = (data: Uint8Array, x: number, y: number) => data[(y * size + x) * 4 + 1] / 255

  const middle = Math.floor(size / 2)
  check(
    'el hueco de la retícula tiene el alfa de base y no cero',
    Math.abs(alphaAt(grid, middle, middle) - MOIRE_BASE_ALPHA) < 0.02,
    `${alphaAt(grid, middle, middle).toFixed(3)} contra ${MOIRE_BASE_ALPHA} — es lo que hace que la envolvente sea una superficie y no una reja flotando`
  )
  check(
    'la línea vertical está en el borde de la celda, no en el medio',
    alphaAt(grid, 0, middle) > 0.9 && alphaAt(grid, middle, middle) < 0.5,
    `${alphaAt(grid, 0, middle).toFixed(2)} en el borde contra ${alphaAt(grid, middle, middle).toFixed(2)} en el centro`
  )
  check(
    'y la horizontal también: la retícula es la UNIÓN de las dos familias',
    alphaAt(grid, middle, 0) > 0.9,
    `${alphaAt(grid, middle, 0).toFixed(2)} — con el producto en vez de la unión saldrían puntos en los cruces y nada más`
  )
  check(
    'el mosaico cierra: el téxel de un borde vale lo mismo que el del opuesto',
    Math.abs(alphaAt(grid, 0, middle) - alphaAt(grid, size - 1, middle)) < 0.02 &&
      Math.abs(alphaAt(grid, middle, 0) - alphaAt(grid, middle, size - 1)) < 0.02,
    'si no cerrara, cada repetición dejaría una línea de doble grosor o media'
  )

  let lit = 0
  for (let x = 0; x < size; x += 1) if (alphaAt(grid, x, middle) > 0.5) lit += 1
  const measuredDuty = lit / size
  check(
    'la línea mide lo que dice medir',
    Math.abs(measuredDuty - duty) < 0.03,
    `${(measuredDuty * 100).toFixed(1)}% contra un duty de ${(duty * 100).toFixed(1)}%`
  )

  /**
   * ⚠️ El punto tiene que sobresalir del CRUCE, no de la celda: en el cruce ya hay
   * un cuadrado de lado igual al trazo. Se mide sobre la diagonal, que es donde el
   * cruce llega más lejos — y donde la primera versión del punto (8,5% de la
   * celda, la proporción de `DotMatrix`) se quedaba medio téxel corta.
   */
  const dotted = createDottedGridCellData(size, duty, duty * MOIRE_DOT_OVER_LINE, MOIRE_BASE_ALPHA)
  const crossReach = Math.round(((duty / 2) * Math.SQRT2 * size) / Math.SQRT2)
  const probe = Math.round(((duty * MOIRE_DOT_OVER_LINE) / 2 / Math.SQRT2) * size) - 1
  check(
    'el punto del cruce sobresale de la esquina que ya hacen las dos líneas',
    probe > crossReach &&
      alphaAt(dotted, probe, probe) > 0.9 &&
      alphaAt(grid, probe, probe) < 0.5,
    `sobre la diagonal, a ${probe} téxeles del cruce: ${alphaAt(dotted, probe, probe).toFixed(2)} con punto contra ${alphaAt(grid, probe, probe).toFixed(2)} sin él · el punto mide ${(duty * MOIRE_DOT_OVER_LINE * 100).toFixed(1)}% de la celda contra un trazo de ${(duty * 100).toFixed(1)}%`
  )
  check(
    'y en la trama REAL el punto es visible a la resolución de la textura',
    dotDiameter(FINE_CELLS) * MOIRE_TILE_SIZE >= 6,
    `${(dotDiameter(FINE_CELLS) * MOIRE_TILE_SIZE).toFixed(1)} téxeles de diámetro contra un trazo de ${(lineDuty(FINE_CELLS) * MOIRE_TILE_SIZE).toFixed(1)}`
  )
  check(
    'y fuera del punto las dos celdas coinciden',
    Math.abs(alphaAt(dotted, middle, middle) - alphaAt(grid, middle, middle)) < 1e-6,
    'el punto es lo único que las diferencia'
  )
}

section('La envolvente de banda va en el ALFA DE VÉRTICE')

{
  check(
    'llega a cero en los dos bordes: la pantalla no tiene canto',
    bandEnvelope(0, MOIRE_FADE) === 0 && bandEnvelope(1, MOIRE_FADE) === 0,
    `rampa del ${(MOIRE_FADE * 100).toFixed(0)}% de la banda a cada lado`
  )
  check('y a uno en el medio', Math.abs(bandEnvelope(0.5, MOIRE_FADE) - 1) < 1e-9)

  let monotone = true
  for (let i = 0; i < 100; i += 1) {
    const v = i / 200
    if (bandEnvelope(v + 0.005, MOIRE_FADE) < bandEnvelope(v, MOIRE_FADE) - 1e-9) monotone = false
  }
  check('sube sin codos en la rampa de abajo', monotone)

  /**
   * ⚠️ **Y tiene que ser de la geometría, no de la textura.** La capa gruesa
   * desplaza su `offset.y` por frame: una envolvente horneada en la textura se
   * movería con la deriva y el borde de la pantalla subiría y bajaría.
   */
  const geometry = new THREE.CylinderGeometry(1, 1, 10, 8, MOIRE_HEIGHT_SEGMENTS, true)
  const uv = geometry.getAttribute('uv')
  const position = geometry.getAttribute('position')
  let topUv = -Infinity
  let bottomUv = Infinity
  for (let i = 0; i < position.count; i += 1) {
    if (position.getY(i) > 4.99) topUv = Math.max(topUv, uv.getY(i))
    if (position.getY(i) < -4.99) bottomUv = Math.min(bottomUv, uv.getY(i))
  }
  check(
    'la V del cilindro crece hacia ARRIBA, así que subir el offset baja la trama',
    topUv === 1 && bottomUv === 0,
    `uv.y = ${bottomUv} abajo y ${topUv} arriba — de acá sale que la deriva vaya en +offset.y`
  )
  check(
    'y la geometría tiene segmentos de sobra para llevar la rampa',
    MOIRE_HEIGHT_SEGMENTS * MOIRE_FADE >= 4,
    `${MOIRE_HEIGHT_SEGMENTS} segmentos × ${MOIRE_FADE} = ${(MOIRE_HEIGHT_SEGMENTS * MOIRE_FADE).toFixed(1)} pasos por rampa`
  )
  geometry.dispose()
}

section('La deriva y el orden de dibujo')

{
  const cellsPerSecond = 1 / MOIRE_DRIFT_PERIOD_S
  const world = verticalPitch(MOIRE_FAR_RADIUS, MOIRE_COARSE_CELLS) * cellsPerSecond
  check(
    'la capa gruesa baja una celda por período, y despacio',
    world < 0.5,
    `${world.toFixed(3)} de mundo por segundo · una celda cada ${MOIRE_DRIFT_PERIOD_S} s (el sitio hace una cada 17,3)`
  )
  check(
    'el período no se sincroniza con ningún otro de la escena',
    [13, 9.5, 17, 12.7, 22.3, 11.5, 15.7].every(
      (other) => Math.abs(MOIRE_DRIFT_PERIOD_S - other) > 1
    ),
    'vira 13 y 9,5 · polvo 12,7 / 17 / 22,3 · bokeh 11,5 y 15,7'
  )

  /**
   * ⚠️ three ordena los transparentes por la posición del OBJETO
   * (`reversePainterSortStable`), y los cilindros están centrados en el origen:
   * su distancia es la de la cámara (9 a 27) aunque su superficie esté a 38 y 44.
   * Sin `renderOrder` la envolvente se dibuja ENCIMA de cualquier transparente
   * más lejano, que es lo que pasaba con la pantalla de S7 contra el sol.
   *
   * **S11 sacó dos eslabones**: el washout y el cuerpo del sol se borraron con el
   * disco. La cadena que queda es más corta y más fácil de sostener — lo único
   * transparente que queda por delante son las partículas, y `PARTICLE_R_MAX` las
   * mantiene por dentro de los dos radios.
   */
  check(
    'el orden de dibujo es explícito: gruesa → fina → partículas',
    MOIRE_FAR_ORDER < MOIRE_NEAR_ORDER &&
      MOIRE_NEAR_ORDER < 0 &&
      PARTICLE_R_MAX < MOIRE_NEAR_RADIUS,
    `${MOIRE_FAR_ORDER} → ${MOIRE_NEAR_ORDER} → 0 (partículas, por distancia, con el campo hasta ${PARTICLE_R_MAX} contra la capa fina en ${MOIRE_NEAR_RADIUS})`
  )
  check(
    'la faceta del cilindro es sub-píxel: la retícula no se ve poligonal',
    (MOIRE_FAR_RADIUS * (1 - Math.cos(Math.PI / MOIRE_SEGMENTS)) / 60) * (PX_V / (2 * TAN_HALF_V)) < 1.5,
    `${MOIRE_SEGMENTS} facetas · error de cuerda ${(MOIRE_FAR_RADIUS * (1 - Math.cos(Math.PI / MOIRE_SEGMENTS))).toFixed(4)} de mundo = ${((MOIRE_FAR_RADIUS * (1 - Math.cos(Math.PI / MOIRE_SEGMENTS)) / 60) * (PX_V / (2 * TAN_HALF_V))).toFixed(2)} px a 60 de distancia`
  )
}

report('s10 · las tramas y el orden de dibujo')
