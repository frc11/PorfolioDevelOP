/**
 * LA ESCENA REAL, VISTA DESDE EL INTRO — la pose del traspaso y lo que hay ahí.
 *
 * Los dos números que SITIO-S8 vuelve a medir —el escalón de exposición y el
 * margen de las partículas— se habían medido **contra un marcador de posición**:
 * `/v3` no montaba la escena, así que detrás del velo del intro no había nada.
 * Ahora hay una sala. Este archivo arma **el estado de esa sala en el instante
 * del traspaso**, con los módulos que ya existen y sin reescribir uno.
 *
 * ⚠ **La mudanza de SITIO-S8.** Los módulos de la escena viven ahora en
 * `src/app/v3/_lib/escena/`; los instrumentos de medición siguen en
 * `src/app/probe-escena/__tests__/`. Es de donde se importa cada cosa.
 *
 * ── La ventana de todo lo que se mide acá, declarada ──────────────────────
 *
 *  1. **Es la pose del hero (`progress` 0) y sólo ésa.** Es la pose de entrada
 *     de la coreografía y la única que el intro toca.
 *  2. **La cámara es la de `harness.ts`, no la del rig** (§7.15): caja de logo
 *     de 7,168 × 7,168 en vez de la medida en runtime. Toda cifra de cuadro de
 *     S9 en adelante lo arrastra; ésta también.
 *  3. **No modela las partículas de la escena en el cuadro** —`sampleFrame`
 *     tampoco—, ni la sombra proyectada, ni el especular. Los tres empujan el
 *     valor hacia abajo: lo que sale es un TECHO.
 *  4. **Es la escena, no la página.** El intro se dibuja en su propio canvas,
 *     encima; lo único que se compone acá es lo que queda detrás.
 */

import { celosiaTransmittance } from '@/app/v3/_lib/escena/celosiaGeometry'
import { CELOSIA_BAR } from '@/app/v3/_lib/escena/probeCelosia'
import { MOIRE_MISMATCH } from '@/app/v3/_lib/escena/probeMoire'
import {
  BOKEH_OPACITY,
  PARTICLE_FAR_COLOR,
  PARTICLE_NEAR_COLOR,
} from '@/app/v3/_lib/escena/probeParticles'
import { INK_COLOR, PAPER_COLOR } from '@/app/v3/_lib/escena/probeScene'
import { INK_HEIGHT, INK_WIDTH, mask, track } from '@/app/probe-escena/__tests__/frameProbe'
import { cameraAt, emptyPose, type Vec3 } from '@/app/probe-escena/__tests__/harness'
import { shadeSurface, shadeUnlit, sunDirectionAt } from '@/app/probe-escena/__tests__/shading'
import { INTRO_SKY_FACTOR } from '@/components/layout/home-intro/introRig'
import { DUST_MATERIAL_ALPHA } from '@/components/layout/home-intro/introParticles'
import { over } from '@/components/layout/home-intro/introParticleProbe'
import type { Srgb } from '@/components/layout/home-intro/introShading'

export { INK_COLOR, PAPER_COLOR, CELOSIA_BAR, INTRO_SKY_FACTOR, MOIRE_MISMATCH }

/** El mismo 16/9 con el que `frameProbe.ts` muestrea. Una sola relación. */
export const ASPECTO = 16 / 9

/**
 * La vista de la pose de entrada, **derivada del track** y no escrita a mano.
 *
 * La línea de base del margen de partículas la escribió a mano —`{ progress: 0,
 * cameraAzimuthDeg: 0, cameraHeight: 6.4 }`— igual que las seis poses de
 * `s10-escena.invariant.ts`. Salir del track en vez de copiarla es lo que
 * permite AFIRMAR que aquel número era el correcto, en vez de suponerlo.
 */
function vistaDelHero() {
  const pose = emptyPose()
  cameraAt(track, 0, ASPECTO, pose)
  return { progress: 0, cameraAzimuthDeg: pose.angleDeg, cameraHeight: pose.height }
}

export const VISTA_DEL_HERO = vistaDelHero()

/** La vista que la línea de base escribió a mano, para poder compararlas. */
export const VISTA_A_MANO = { progress: 0, cameraAzimuthDeg: 0, cameraHeight: 6.4 }

/** A qué distancia está el logo de la cámara en la pose de entrada. */
export function profundidadDelLogo(): number {
  const pose = emptyPose()
  const cam = cameraAt(track, 0, ASPECTO, pose)
  return Math.hypot(cam.position[0], cam.position[1], cam.position[2])
}

/** La celosía como la escena la tiene, con el factor de cielo del intro. */
export const CELOSIA = { bar: CELOSIA_BAR, sky: INTRO_SKY_FACTOR }

/** La escena entera: envolvente + celosía. La variante de `s10-escena`. */
export const ESCENA_COMPLETA = { backdrop: true, mismatch: MOIRE_MISMATCH, celosia: CELOSIA }

/** La misma escena con el cielo ABIERTO: el estado del que §7.11 hablaba. */
export const ESCENA_SIN_CELOSIA_EN_EL_CIELO = {
  backdrop: true,
  mismatch: MOIRE_MISMATCH,
  celosia: { bar: CELOSIA_BAR, sky: 1 },
}

export interface Gobo {
  /** Transmitancia media de la celosía sobre la TINTA de la cara frontal. */
  readonly medio: number
  readonly minimo: number
  readonly maximo: number
  readonly muestras: number
}

/**
 * Cuánta luz de sol le llega al logo a través de la celosía, promediada sobre
 * su tinta real.
 *
 * No es un promedio decorativo: en la escena el logo **recibe el patrón de las
 * rendijas** y en el intro no, así que es la diferencia de iluminación que
 * sobrevive al corte. Se muestrea sobre la máscara de tinta de `logoInk.ts`
 * —la misma que usa `sampleFrame`— y no sobre la caja, que taparía el doble.
 */
export function goboSobreLaTinta(columnas = 160, filas = 120): Gobo {
  const sol = sunDirectionAt(0)
  // El espesor de la extrusión es el 8% del ancho (`frameProbe.ts`), así que la
  // cara frontal está a la mitad de eso. No es un número suelto: sale de ahí.
  const z = (INK_WIDTH * 0.08) / 2
  let suma = 0
  let muestras = 0
  let minimo = 1
  let maximo = 0
  for (let iy = 0; iy < filas; iy += 1) {
    for (let ix = 0; ix < columnas; ix += 1) {
      const u = (ix + 0.5) / columnas
      const v = (iy + 0.5) / filas
      if (!mask.at(u, v)) continue
      const punto: Vec3 = [(u - 0.5) * INK_WIDTH, (0.5 - v) * INK_HEIGHT, z]
      const g = celosiaTransmittance(punto, sol, CELOSIA_BAR, MOIRE_MISMATCH, 0, 0)
      suma += g
      muestras += 1
      if (g < minimo) minimo = g
      if (g > maximo) maximo = g
    }
  }
  return { medio: suma / muestras, minimo, maximo, muestras }
}

/** El valor sRGB del papel de la escena, iluminado o bajo una barra. */
export function papel(gobo: number, sky = INTRO_SKY_FACTOR): number {
  return shadeSurface(PAPER_COLOR, [0, 1, 0], VISTA_DEL_HERO, 19, gobo, sky)
}

const gris = (valor: number): Srgb => [valor / 255, valor / 255, valor / 255]

export interface ParDeLaEscena {
  readonly nombre: string
  /** La mota compuesta sobre su fondo, ya en sRGB. */
  readonly mota: Srgb
  readonly fondo: Srgb
}

/**
 * Los pares mota × fondo de la escena REAL, en el instante del traspaso.
 *
 * ── Qué cambia respecto de la línea de base ───────────────────────────────
 *
 * La línea de base construyó UN par a mano: el color crudo de la mota cercana
 * sobre el papel iluminado. Tres cosas quedaron fuera y las tres se corrigen
 * acá:
 *
 *  1. **El tone mapping.** `PointsMaterial` no recibe luz, pero sí pasa por el
 *     operador: la mota cercana `#5A5A57` sale por pantalla en **70,6**, no en
 *     los 90 de su hex crudo. Es MÁS oscura, o sea más contraste: el número
 *     nuevo es más exigente, no más flojo.
 *  2. **La población entera**, no una mota: polvo cercano, polvo lejano y
 *     bokeh, cada uno con la opacidad de SU material.
 *  3. **Los tres fondos que existen en el cuadro**: el papel a luz plena, el
 *     papel bajo una barra de la celosía y el valor medio del cuadro.
 *
 * Se prueban los nueve pares y se toma **el de contraste máximo**, que es el
 * que cruza el umbral ANTES: cualquier otro se vuelve legible después, así que
 * el margen que sale de ahí es el peor caso.
 */
export function paresDeLaEscena(mediaDelCuadro: number): ParDeLaEscena[] {
  const fondos: readonly (readonly [string, number])[] = [
    ['papel a luz plena', papel(1)],
    ['papel bajo una barra', papel(0)],
    ['media del cuadro', mediaDelCuadro],
  ]
  const motas: readonly (readonly [string, number, number])[] = [
    ['polvo cercano', shadeUnlit(PARTICLE_NEAR_COLOR), DUST_MATERIAL_ALPHA],
    ['polvo lejano', shadeUnlit(PARTICLE_FAR_COLOR), DUST_MATERIAL_ALPHA],
    ['bokeh', shadeUnlit(PARTICLE_FAR_COLOR), BOKEH_OPACITY],
  ]
  const pares: ParDeLaEscena[] = []
  for (const [nf, vf] of fondos) {
    for (const [nm, vm, alfa] of motas) {
      const fondo = gris(vf)
      pares.push({ nombre: `${nm} sobre ${nf}`, mota: over(gris(vm), alfa, fondo), fondo })
    }
  }
  return pares
}

/**
 * El par que la línea de base usó, reconstruido **tal cual**: el hex crudo sin
 * tone mapping sobre el papel a luz plena. Es el control que hace comparables
 * los dos números — si esto no reprodujera los 4,278 s publicados, la
 * comparación entera sería contra un fantasma.
 */
export function parDeLaLineaDeBase(): ParDeLaEscena {
  const valor = shadeSurface(PAPER_COLOR, [0, 1, 0], VISTA_A_MANO, 19, 1, INTRO_SKY_FACTOR) / 255
  const fondo: Srgb = [valor, valor, valor]
  const crudo: Srgb = [
    Number.parseInt(PARTICLE_NEAR_COLOR.slice(1, 3), 16) / 255,
    Number.parseInt(PARTICLE_NEAR_COLOR.slice(3, 5), 16) / 255,
    Number.parseInt(PARTICLE_NEAR_COLOR.slice(5, 7), 16) / 255,
  ]
  return {
    nombre: 'línea de base — hex crudo sobre papel a luz plena',
    mota: over(crudo, DUST_MATERIAL_ALPHA, fondo),
    fondo,
  }
}
