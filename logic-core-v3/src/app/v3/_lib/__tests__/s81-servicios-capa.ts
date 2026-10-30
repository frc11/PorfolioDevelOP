/**
 * [B4] APOYO DE s81 — el enjambre de Servicios, replicado en la CPU con la MISMA cuenta del sombreador (`VERTICE_DE_SERVICIOS`): el
 * retraso de cada nanobot, el resorte, su lugar en cada estado, la perspectiva, el flotar de la nube, el giro del globo y la dispersión.
 * Con eso el invariante cuenta, en el cuadro del cambio de capa y en el de al lado, cuántos nanobots caen sobre el título y sobre el
 * panel: tienen que ser cero. La medición en el navegador (los píxeles del lienzo, cuadro a cuadro) es del banco.
 */

import { sembrar } from '../escena/titulos3d/llegada'
import type { Caja, Lugar } from '../nanobots/capa'
import { FISICA_DEL_ENJAMBRE, resorteDelEnjambre } from '../nanobots/enjambre'
import { GLOBO, ORBITA, PROPORCION_DE_LA_ORBITA, bandaDeLaOrbita, extensionDeLaOrbita, proporcionDeLaCaja, unidadDelLugar } from '../nanobots/simbolos'

const girar = (x: number, y: number, a: number): [number, number] => [Math.cos(a) * x - Math.sin(a) * y, Math.sin(a) * x + Math.cos(a) * y]

/** `vivo()` del sombreador para la órbita (0, C2-50; [L3] en la elipse de su caja, `proporcion`) y el globo (1). */
function vivo(k: number, d: readonly number[], az: readonly number[], t: number, proporcion = PROPORCION_DE_LA_ORBITA): [number, number, number] {
  if (k === 0) {
    const [qx, qy] = [d[0] / ORBITA.rx, d[1] / ORBITA.ry]
    const a = Math.atan2(qy, qx) + t * ORBITA.giro * (0.8 + 0.4 * az[3])
    const r = Math.hypot(qx, qy)
    const radio = (eje: number): number => eje + (r - 1) * bandaDeLaOrbita(proporcion)
    return [radio(1) * Math.cos(a), radio(proporcion) * Math.sin(a), d[2] + 0.04 * Math.sin(t * 0.7 + az[2] * 2 * Math.PI)]
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
export function nanobotsEn(avance: number, t: number, simbolos: readonly Float32Array[], desde: LugarConProporcion, hacia: Lugar): [number, number][] {
  const [nube, globo] = [simbolos[0], simbolos[1]]
  const n = nube.length / 4
  const azar = sembrar(0x9e3779b9)
  const R = FISICA_DEL_ENJAMBRE.retraso
  const salida: [number, number][] = []
  for (let i = 0; i < n; i += 1) {
    const az = [azar(), azar(), azar(), azar()]
    const u = Math.min(1, Math.max(0, (avance - az[0] * R) / (1 - R)))
    const e = resorteDelEnjambre(u)
    const a = enPantalla(vivo(0, [...nube.subarray(i * 4, i * 4 + 4)], az, t, desde.proporcion), desde)
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
 * [L3] Medidas de 1440×900 y 1024×768 MEDIDAS en el sitio (`scripts-carga/l3-servicios.ts MODO=cajas`, dev, 2026-10-29): el título de un
 * renglón (sus dos palabras y el espacio, cada uno su caja) y la bajada; el aro, más ancho que el título y achatado (3:1), que sube a la
 * mitad del título; el lugar del globo en la columna de la marca (sin el CTA, hasta el pie). Antes eran una estimación del layout de C2-50.
 */
export const ESCENARIOS_DE_PRUEBA: readonly EscenarioDePrueba[] = [
  {
    nombre: '1440×900',
    ancho: 1440,
    alto: 900,
    titulo: [{ izquierda: 308, arriba: 210, derecha: 717, abajo: 333 }, { izquierda: 717, arriba: 210, derecha: 728, abajo: 333 }, { izquierda: 728, arriba: 210, derecha: 1132, abajo: 333 }, { izquierda: 444, arriba: 410, derecha: 996, abajo: 439 }],
    nube: { izquierda: 259, arriba: 272, derecha: 1181, abajo: 579 },
    globo: { izquierda: 1036, arriba: 308, derecha: 1408, abajo: 900 },
  },
  {
    nombre: '1024×768',
    ancho: 1024,
    alto: 768,
    titulo: [{ izquierda: 193, arriba: 186, derecha: 509, abajo: 281 }, { izquierda: 509, arriba: 186, derecha: 518, abajo: 281 }, { izquierda: 518, arriba: 186, derecha: 831, abajo: 281 }, { izquierda: 283, arriba: 341, derecha: 741, abajo: 365 }],
    nube: { izquierda: 155, arriba: 234, derecha: 871, abajo: 473 },
    globo: { izquierda: 741, arriba: 260, derecha: 992, abajo: 768 },
  },
  // [L9b] Con el título de L8b (más grande, colgado sobre la bajada), medidas en el sitio (dev, 2026-10-29): a 1440 el enjambre ya no sale
  // del título con margen en todo el camino y el cambio va en la llegada.
  {
    nombre: 'L9b 1440×900',
    ancho: 1440,
    alto: 900,
    titulo: [{ izquierda: 193, arriba: 256, derecha: 716, abajo: 412 }, { izquierda: 716, arriba: 256, derecha: 730, abajo: 412 }, { izquierda: 730, arriba: 256, derecha: 1247, abajo: 412 }, { izquierda: 444, arriba: 412, derecha: 996, abajo: 441 }],
    nube: { izquierda: 259, arriba: 274, derecha: 1181, abajo: 581 },
    globo: { izquierda: 1036, arriba: 308, derecha: 1408, abajo: 900 },
  },
  {
    nombre: 'L9b 1024×768',
    ancho: 1024,
    alto: 768,
    titulo: [{ izquierda: 83, arriba: 214, derecha: 508, abajo: 342 }, { izquierda: 508, arriba: 214, derecha: 520, abajo: 342 }, { izquierda: 520, arriba: 214, derecha: 940, abajo: 342 }, { izquierda: 283, arriba: 344, derecha: 741, abajo: 368 }],
    nube: { izquierda: 154, arriba: 237, derecha: 870, abajo: 475 },
    globo: { izquierda: 741, arriba: 260, derecha: 992, abajo: 768 },
  },
]

/** Un lugar con la proporción de su caja (la órbita, L3). */
export type LugarConProporcion = Lugar & { readonly proporcion?: number }

/**
 * [C2-50] El lugar de un estado en su caja, con la unidad de la sección (`unidadDelLugar`: la órbita llena su caja con la elipse). [L3] La
 * órbita lleva la proporción de su caja y su extensión sale de ella (como en `useNanobotsDelEscenario`); `extension` vale para los demás.
 */
export function lugarDe(c: Caja, extension: number, estado = 1): LugarConProporcion {
  const [ancho, alto] = [c.derecha - c.izquierda, c.abajo - c.arriba]
  const proporcion = estado === 0 ? proporcionDeLaCaja(ancho, alto) : undefined
  return { x: (c.izquierda + c.derecha) / 2, y: (c.arriba + c.abajo) / 2, unidad: unidadDelLugar(estado, ancho, alto, extension), extension: proporcion === undefined ? extension : extensionDeLaOrbita(proporcion), proporcion }
}
