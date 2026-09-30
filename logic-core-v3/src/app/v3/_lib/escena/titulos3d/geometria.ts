import * as THREE from 'three'
import type { Font } from 'three/examples/jsm/loaders/FontLoader.js'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

/**
 * [ESCENA 10] T3 · LA GEOMETRÍA DE UN TÍTULO — el texto extruido con la Chivo de la marca, letra por letra, en UNA
 * malla (una llamada por título). Cada vértice sabe de qué letra es: su orden de izquierda a derecha (0 a 1, `aLetra`)
 * y el centro de su letra (`aPivote`), para que el vértice la haga llegar girando sobre sí misma. Pura: el invariante
 * la arma sin navegador.
 *
 * Las medidas van en em (el cuerpo de la letra es 1): la escena la escala al tamaño que el título tiene en el cuadro. El
 * origen es el comienzo de la línea de base, como el del DOM; la cara de adelante queda en z = 0 y el volumen, atrás.
 * Cada letra va donde el DOM la pone (`posiciones`, medidas en la página: el interletrado y el kerning del navegador);
 * sin ellas, con el avance de la fuente.
 */
export const VOLUMEN_DEL_TITULO = {
  /**
   * El espesor (em): el mismo aire que el del logo, cuyo espesor es un 12 % de su alto de letra; y el bisel, hacia
   * adentro (`bevelOffset`): el contorno de la cara es el de la Chivo, no uno engordado por el bisel.
   */
  profundidad: 0.14,
  bisel: { grosor: 0.012, tamano: 0.008, segmentos: 2 },
  /** Los puntos por curva: con 4 las curvas de la Chivo no muestran facetas al tamaño de un título. */
  curvas: 4,
} as const

export interface TituloArmado {
  readonly geometria: THREE.BufferGeometry
  /** El contorno de las tapas, letra por letra ya corrida (para el filo del dibujo de noche). */
  readonly contornos: THREE.Vector2[][]
  /** Cuántas letras (sin los espacios). */
  readonly letras: number
}

/** La x (em) de cada carácter: la medida en el DOM o, sin ella, la suma de los avances de la fuente. */
function equisDe(fuente: Font, texto: string, posiciones: readonly number[] | null): number[] {
  if (posiciones !== null && posiciones.length === texto.length) return [...posiciones]
  const x: number[] = []
  let a = 0
  for (const c of texto) {
    x.push(a)
    a += (fuente.data.glyphs[c]?.ha ?? 0) / fuente.data.resolution
  }
  return x
}

/** Arma el título: cada letra extruida en su lugar; después, todas en una malla con su orden y su centro. */
export function armarElTitulo(fuente: Font, texto: string, posiciones: readonly number[] | null = null): TituloArmado {
  const { profundidad, bisel, curvas } = VOLUMEN_DEL_TITULO
  const equis = equisDe(fuente, texto, posiciones)
  const caracteres = [...texto]
  const conLetra = caracteres.filter((c) => c.trim() !== '').length
  const piezas: THREE.BufferGeometry[] = []
  const contornos: THREE.Vector2[][] = []
  let orden = 0
  caracteres.forEach((c, k) => {
    if (c.trim() === '') return
    if (fuente.data.glyphs[c] === undefined) throw new Error(`la fuente de los títulos no tiene «${c}»`)
    const formas = fuente.generateShapes(c, 1)
    const pieza = new THREE.ExtrudeGeometry(formas, { depth: profundidad, curveSegments: curvas, bevelEnabled: true, bevelThickness: bisel.grosor, bevelSize: bisel.tamano, bevelOffset: -bisel.tamano, bevelSegments: bisel.segmentos })
    // La extrusión crece hacia +z desde la cara de atrás: la de adelante, a z = 0.
    pieza.translate(equis[k], 0, -profundidad)
    pieza.computeBoundingBox()
    const centro = (pieza.boundingBox ?? new THREE.Box3()).getCenter(new THREE.Vector3())
    const n = pieza.getAttribute('position').count
    const pivote = new Float32Array(n * 3)
    for (let i = 0; i < n; i += 1) pivote.set([centro.x, centro.y, centro.z], i * 3)
    pieza.setAttribute('aLetra', new THREE.BufferAttribute(new Float32Array(n).fill(conLetra > 1 ? orden / (conLetra - 1) : 0), 1))
    pieza.setAttribute('aPivote', new THREE.BufferAttribute(pivote, 3))
    piezas.push(pieza)
    for (const f of formas) {
      const { shape, holes } = f.extractPoints(curvas)
      for (const contorno of [shape, ...holes]) contornos.push(contorno.map((p) => new THREE.Vector2(p.x + equis[k], p.y)))
    }
    orden += 1
  })
  const geometria = mergeGeometries(piezas, false)
  for (const p of piezas) p.dispose()
  if (geometria === null) throw new Error(`no se pudo armar «${texto}»`)
  geometria.computeBoundingBox()
  geometria.computeBoundingSphere()
  return { geometria, contornos, letras: conLetra }
}
