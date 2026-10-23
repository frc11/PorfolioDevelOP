/**
 * [B4] APOYO DE s81 — el enjambre de Servicios, replicado en la CPU con la MISMA cuenta del sombreador (`VERTICE_DE_SERVICIOS`): el
 * retraso de cada nanobot, el resorte, su lugar en cada estado, la perspectiva, el flotar de la nube, el giro del globo y la dispersión.
 * Con eso el invariante cuenta, en el cuadro del cambio de capa y en el de al lado, cuántos nanobots caen sobre el título y sobre el
 * panel: tienen que ser cero. La medición en el navegador (los píxeles del lienzo, cuadro a cuadro) es del banco.
 */

import { sembrar } from '../escena/titulos3d/llegada'
import type { Caja, Lugar } from '../nanobots/capa'
import { FISICA_DEL_ENJAMBRE, resorteDelEnjambre } from '../nanobots/enjambre'
import { GLOBO, ORBITA, unidadDelLugar } from '../nanobots/simbolos'

const girar = (x: number, y: number, a: number): [number, number] => [Math.cos(a) * x - Math.sin(a) * y, Math.sin(a) * x + Math.cos(a) * y]

/** `vivo()` del sombreador para la órbita (0, C2-50) y el globo (1). */
function vivo(k: number, d: readonly number[], az: readonly number[], t: number): [number, number, number] {
  if (k === 0) {
    const [qx, qy] = [d[0] / ORBITA.rx, d[1] / ORBITA.ry]
    const a = Math.atan2(qy, qx) + t * ORBITA.giro * (0.8 + 0.4 * az[3])
    const r = Math.hypot(qx, qy)
    return [ORBITA.rx * r * Math.cos(a), ORBITA.ry * r * Math.sin(a), d[2] + 0.04 * Math.sin(t * 0.7 + az[2] * 2 * Math.PI)]
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
 * Medidas de 1440×900 y 1024×768 derivadas de las clases del escenario. [C2-50] El título que se pinta (la display del Panel, en dos
 * renglones, el ancho sobre 13,5 con tope en 11svh, a 0,62 em por letra) y la bajada en dos renglones (400 px de medida, adentro del ancho del título); la órbita en la caja de los dos,
 * de 720 px de ancho; la marca de web en su columna (12 · 10 · 9). Son una ESTIMACIÓN del layout: la medición de verdad es del banco.
 */
export const ESCENARIOS_DE_PRUEBA: readonly EscenarioDePrueba[] = [
  {
    nombre: '1440×900',
    ancho: 1440,
    alto: 900,
    titulo: [{ izquierda: 463, arriba: 261, derecha: 977, abajo: 350 }, { izquierda: 444, arriba: 350, derecha: 996, abajo: 439 }, { izquierda: 520, arriba: 455, derecha: 920, abajo: 503 }, { izquierda: 540, arriba: 503, derecha: 900, abajo: 551 }],
    nube: { izquierda: 360, arriba: 229, derecha: 1080, abajo: 583 },
    globo: { izquierda: 1036, arriba: 255, derecha: 1408, abajo: 804 },
  },
  {
    nombre: '1024×768',
    ancho: 1024,
    alto: 768,
    titulo: [{ izquierda: 324, arriba: 227, derecha: 700, abajo: 292 }, { izquierda: 310, arriba: 292, derecha: 714, abajo: 357 }, { izquierda: 312, arriba: 373, derecha: 712, abajo: 413 }, { izquierda: 330, arriba: 413, derecha: 694, abajo: 453 }],
    nube: { izquierda: 152, arriba: 195, derecha: 872, abajo: 485 },
    globo: { izquierda: 745, arriba: 221, derecha: 1000, abajo: 672 },
  },
]

/** [C2-50] El lugar de un estado en su caja, con la unidad de la sección (`unidadDelLugar`: la órbita llena su caja con la elipse). */
export const lugarDe = (c: Caja, extension: number, estado = 1): Lugar => ({ x: (c.izquierda + c.derecha) / 2, y: (c.arriba + c.abajo) / 2, unidad: unidadDelLugar(estado, c.derecha - c.izquierda, c.abajo - c.arriba, extension), extension })
