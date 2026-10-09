import * as THREE from 'three'
import type { Font } from 'three/examples/jsm/loaders/FontLoader.js'

import { VOLUMEN_DEL_TITULO } from '../titulos3d/geometria'
import { TRACKING_DEL_CTA, avancesDe, type FuenteConKerning } from './fuentesDelCta'
import type { MetricasDeLaFuente, RenglonDeLaFrase } from './medidaDeLosValores'
import { baseEnLaCaja } from './medidaDeLosValores'

/**
 * [PULIDO 4] C1 · LAS PIEZAS DE LA METAMORFOSIS — las letras de los dos textos como geometría, en px del marco (x a la
 * derecha, y HACIA ARRIBA, z hacia la cámara: el marco da vuelta la y de la pantalla). Los contornos se densifican (ningún
 * tramo recto más largo que `maximo` em). [PULIDO 8] G1 · las usa el volteo (el ruido de `contorno` se borró con ella). Los valores, en la Chivo del DOM (400); la frase, en Archivo (su copy, con minúsculas) centrada en
 * cada renglón que el DOM le deja.
 */

/** Una letra de la frase del CTA en la pantalla: el comienzo de su avance y su línea de base (px), su cuerpo y su orden (0 a 1). */
export interface LetraDeLaFrase {
  readonly c: string
  readonly x: number
  readonly base: number
  readonly cuerpo: number
  readonly fuerte: boolean
  readonly orden: number
}

/**
 * Las letras de la frase, renglón por renglón, centradas en su caja del DOM y con la línea de base de su fuente. [PULIDO 5] D1 ·
 * con el kerning de la fuente y el interletrado de display (`avancesDe`), y del cuerpo del DOM salvo que algún renglón no entre
 * en `anchoMaximo` (px): entonces todos se achican juntos, centrados en su renglón.
 */
export function letrasDeLaFrase(renglones: readonly RenglonDeLaFrase[], normal: FuenteConKerning, fuerte: FuenteConKerning, anchoMaximo: number): LetraDeLaFrase[] {
  const medidos = renglones.map((r) => ({ r, f: r.fuerte ? fuerte : normal, a: avancesDe(r.fuerte ? fuerte : normal, r.texto, r.fuerte ? TRACKING_DEL_CTA.fuerte : TRACKING_DEL_CTA.frase) }))
  const k = Math.min(1, ...medidos.map(({ r, a }) => anchoMaximo / Math.max(1e-6, a.ancho * r.cuerpo)))
  const salida: { c: string; x: number; base: number; cuerpo: number; fuerte: boolean }[] = []
  for (const { r, f, a } of medidos) {
    const cuerpo = r.cuerpo * k
    const x0 = r.izquierda + (r.ancho - a.ancho * cuerpo) / 2
    const base = baseEnLaCaja(r.arriba, r.alto, cuerpo, f.fuente.data as MetricasDeLaFuente)
    ;[...r.texto].filter((c) => c.trim() !== '').forEach((c, i) => salida.push({ c, x: x0 + a.x[i] * cuerpo, base, cuerpo, fuerte: r.fuerte }))
  }
  return salida.map((l, i) => ({ ...l, orden: salida.length <= 1 ? 0 : i / (salida.length - 1) }))
}

/** Un contorno con sus tramos rectos partidos (ninguno más largo que `maximo`), sin repetir el primer punto al final. */
export function densificar(puntos: readonly THREE.Vector2[], maximo: number): THREE.Vector2[] {
  const salida: THREE.Vector2[] = []
  const n = puntos.length - (puntos.length > 1 && puntos[0].equals(puntos[puntos.length - 1]) ? 1 : 0)
  for (let k = 0; k < n; k += 1) {
    const a = puntos[k]
    const b = puntos[(k + 1) % n]
    const partes = Math.max(1, Math.ceil(a.distanceTo(b) / maximo))
    for (let j = 0; j < partes; j += 1) salida.push(new THREE.Vector2().lerpVectors(a, b, j / partes))
  }
  return salida
}

/** Los contornos de una letra (em, y hacia arriba): cada forma con su borde y sus agujeros. */
export interface FormaEnContornos {
  readonly borde: THREE.Vector2[]
  readonly agujeros: THREE.Vector2[][]
}

export function contornosDeLaLetra(fuente: Font, c: string, maximo: number): FormaEnContornos[] {
  if (fuente.data.glyphs[c] === undefined) throw new Error(`la fuente de la metamorfosis no tiene «${c}»`)
  return fuente.generateShapes(c, 1).map((forma) => {
    const { shape, holes } = forma.extractPoints(VOLUMEN_DEL_TITULO.curvas)
    return { borde: densificar(shape, maximo), agujeros: holes.map((h) => densificar(h, maximo)) }
  })
}

/** Las formas densificadas de una letra, listas para extruir (sin volver a partir sus tramos). */
function formasDe(fuente: Font, c: string, maximo: number): THREE.Shape[] {
  return contornosDeLaLetra(fuente, c, maximo).map((f) => {
    const forma = new THREE.Shape(f.borde)
    forma.holes = f.agujeros.map((h) => new THREE.Path(h))
    return forma
  })
}

/**
 * Una letra en px del marco: su avance empieza en `x` y su línea de base está en `base` (px de la pantalla, y hacia abajo),
 * con su cuerpo; la cara de adelante en z = 0 y su espesor (em) hacia atrás. Con `bisel`, el de los títulos de volumen.
 */
export function geometriaDeLaLetra(fuente: Font, c: string, x: number, base: number, cuerpo: number, espesor: number, bisel: boolean, maximo: number): THREE.BufferGeometry {
  const B = VOLUMEN_DEL_TITULO.bisel
  const g = new THREE.ExtrudeGeometry(formasDe(fuente, c, maximo), bisel ? { depth: espesor, curveSegments: 1, bevelEnabled: true, bevelThickness: B.grosor, bevelSize: B.tamano, bevelOffset: -B.tamano, bevelSegments: B.segmentos } : { depth: espesor, curveSegments: 1, bevelEnabled: false })
  g.translate(0, 0, -espesor)
  g.scale(cuerpo, cuerpo, cuerpo)
  g.translate(x, -base, 0)
  return g
}
