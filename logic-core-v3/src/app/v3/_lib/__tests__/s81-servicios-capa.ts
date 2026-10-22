/**
 * [B4] APOYO DE s81 — el enjambre de Servicios, replicado en la CPU con la MISMA cuenta del sombreador (`VERTICE_DE_SERVICIOS`): el
 * retraso de cada nanobot, el resorte, su lugar en cada estado, la perspectiva, el flotar de la nube, el giro del globo y la dispersión.
 * Con eso el invariante cuenta, en el cuadro del cambio de capa y en el de al lado, cuántos nanobots caen sobre el título y sobre el
 * panel: tienen que ser cero. La medición en el navegador (los píxeles del lienzo, cuadro a cuadro) es del banco.
 */

import { sembrar } from '../escena/titulos3d/llegada'
import type { Caja, Lugar } from '../nanobots/capa'
import { FISICA_DEL_ENJAMBRE, resorteDelEnjambre } from '../nanobots/enjambre'
import { GLOBO } from '../nanobots/simbolos'

const girar = (x: number, y: number, a: number): [number, number] => [Math.cos(a) * x - Math.sin(a) * y, Math.sin(a) * x + Math.cos(a) * y]

/** `vivo()` del sombreador para la nube (0) y el globo (1). */
function vivo(k: number, d: readonly number[], az: readonly number[], t: number): [number, number, number] {
  if (k === 0) {
    const y = d[1] + 0.05 * Math.sin(t * 0.47 + az[1] * 2 * Math.PI)
    const [x1, z1] = girar(d[0] + 0.05 * Math.sin(t * 0.6 + az[0] * 2 * Math.PI), d[2] + 0.05 * Math.sin(t * 0.53 + az[2] * 2 * Math.PI), t * 0.12)
    const [x2, z2] = girar(x1, z1, 0.22 * Math.sin(t * 0.3))
    return [x2, y, z2]
  }
  if (d[3] >= 0.5) return [d[0], d[1], d[2]]
  const [x, z] = girar(d[0], d[2], t * 0.35)
  const [y, z2] = girar(d[1], z, GLOBO.inclinacion)
  return [x, y, z2]
}

/** Dónde cae un nanobot en px del escenario (y hacia abajo), en un estado y su lugar. */
function enPantalla(p: readonly [number, number, number], l: Lugar): [number, number] {
  const cerca = 3 / (3 - p[2])
  return [l.x + p[0] * cerca * 0.82 * l.unidad, l.y - p[1] * cerca * 0.82 * l.unidad]
}

/** Las posiciones de todos los nanobots en un avance del traspaso de la nube (en `desde`) al globo (en `hacia`), a la hora `t`. */
export function nanobotsEn(avance: number, t: number, simbolos: readonly Float32Array[], desde: Lugar, hacia: Lugar): [number, number][] {
  const [nube, globo] = [simbolos[0], simbolos[1]]
  const n = nube.length / 4
  const azar = sembrar(0x9e3779b9)
  const R = FISICA_DEL_ENJAMBRE.retraso
  const salida: [number, number][] = []
  for (let i = 0; i < n; i += 1) {
    const az = [azar(), azar(), azar(), azar()]
    const u = Math.min(1, Math.max(0, (avance - az[0] * R) / (1 - R)))
    const e = resorteDelEnjambre(u)
    const a = enPantalla(vivo(0, [...nube.subarray(i * 4, i * 4 + 4)], az, t), desde)
    const b = enPantalla(vivo(1, [...globo.subarray(i * 4, i * 4 + 4)], az, t), hacia)
    const unidad = desde.unidad + (hacia.unidad - desde.unidad) * Math.min(1, Math.max(0, e))
    const disp = FISICA_DEL_ENJAMBRE.dispersion * Math.sin(Math.PI * u) * unidad
    salida.push([a[0] + (b[0] - a[0]) * e + (az[1] * 2 - 1) * disp, a[1] + (b[1] - a[1]) * e - (az[2] * 2 - 1) * disp])
  }
  return salida
}

export const adentro = (p: readonly [number, number], c: Caja): boolean => p[0] > c.izquierda && p[0] < c.derecha && p[1] > c.arriba && p[1] < c.abajo

/** Un escenario de prueba con las medidas del layout (los renglones del título, el lugar de la nube y el del globo de web). */
export interface EscenarioDePrueba {
  readonly nombre: string
  readonly ancho: number
  readonly alto: number
  readonly titulo: readonly Caja[]
  readonly nube: Caja
  readonly globo: Caja
}

/**
 * Medidas de 1440×900 y 1024×768 derivadas de las clases del escenario (el título en `titulo-l`, la bajada en 26ch, el lugar de la nube
 * en el tercio del medio, la marca de web en su 32 % a la derecha). Son una ESTIMACIÓN del layout: la medición de verdad es del banco.
 */
export const ESCENARIOS_DE_PRUEBA: readonly EscenarioDePrueba[] = [
  {
    nombre: '1440×900',
    ancho: 1440,
    alto: 900,
    titulo: [{ izquierda: 502, arriba: 405, derecha: 938, abajo: 453 }, { izquierda: 618, arriba: 469, derecha: 822, abajo: 517 }],
    nube: { izquierda: 461, arriba: 216, derecha: 979, abajo: 684 },
    globo: { izquierda: 1048, arriba: 208, derecha: 1408, abajo: 772 },
  },
  {
    nombre: '1024×768',
    ancho: 1024,
    alto: 768,
    titulo: [{ izquierda: 334, arriba: 346, derecha: 690, abajo: 386 }, { izquierda: 410, arriba: 402, derecha: 614, abajo: 450 }],
    nube: { izquierda: 328, arriba: 184, derecha: 696, abajo: 584 },
    globo: { izquierda: 715, arriba: 200, derecha: 992, abajo: 640 },
  },
]

export const lugarDe = (c: Caja, extension: number): Lugar => ({ x: (c.izquierda + c.derecha) / 2, y: (c.arriba + c.abajo) / 2, unidad: Math.min(c.derecha - c.izquierda, c.abajo - c.arriba) / 2 / extension, extension })
