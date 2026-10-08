import * as THREE from 'three'
import type { Font } from 'three/examples/jsm/loaders/FontLoader.js'

import { VOLUMEN_DEL_TITULO } from '../titulos3d/geometria'

/**
 * [PULIDO 2] 5 · LAS LETRAS DEL CTA DEL FINAL, UNA POR UNA — la transformación mueve cada letra por su cuenta, así que van
 * sueltas (no en una malla por título, como los títulos de volumen). Cada geometría queda en el em de su renglón (el origen
 * es el comienzo de la línea de base, la cara de adelante en z = 0 y el volumen atrás, como `titulos3d/geometria.ts`): el
 * dibujo de noche lee la posición del objeto contra el contorno del renglón entero. La escena gira cada letra sobre su
 * centro (`pivote`). Puras: el invariante las arma sin navegador.
 */

export interface LetraArmada {
  readonly letra: string
  readonly geometria: THREE.BufferGeometry
  /** El centro de su caja (em del renglón): sobre él gira. */
  readonly pivote: THREE.Vector3
  /** Su caja (em). */
  readonly ancho: number
  readonly alto: number
}

export interface RenglonArmado {
  readonly letras: LetraArmada[]
  /** El contorno de las tapas de todo el renglón (em), para el filo del dibujo de noche. */
  readonly contornos: THREE.Vector2[][]
}

/** La x (em) de cada carácter que no es espacio: la medida en el DOM o, sin ella, la suma de los avances de la fuente. */
function equisDe(fuente: Font, texto: string, posiciones: readonly number[] | null): number[] {
  const caracteres = [...texto]
  const conLetra = caracteres.filter((c) => c.trim() !== '')
  if (posiciones !== null && posiciones.length === conLetra.length) return [...posiciones]
  const x: number[] = []
  let a = 0
  for (const c of caracteres) {
    if (c.trim() !== '') x.push(a)
    a += (fuente.data.glyphs[c]?.ha ?? 0) / fuente.data.resolution
  }
  return x
}

function cajaYPivote(g: THREE.BufferGeometry): { readonly pivote: THREE.Vector3; readonly ancho: number; readonly alto: number } {
  g.computeBoundingBox()
  const b = g.boundingBox ?? new THREE.Box3()
  return { pivote: b.getCenter(new THREE.Vector3()), ancho: b.max.x - b.min.x, alto: b.max.y - b.min.y }
}

function glifo(fuente: Font, c: string): THREE.Shape[] {
  if (fuente.data.glyphs[c] === undefined) throw new Error(`la fuente del CTA no tiene «${c}»`)
  return fuente.generateShapes(c, 1)
}

function contornosDe(formas: readonly THREE.Shape[], x: number): THREE.Vector2[][] {
  const salida: THREE.Vector2[][] = []
  for (const f of formas) {
    const { shape, holes } = f.extractPoints(VOLUMEN_DEL_TITULO.curvas)
    for (const c of [shape, ...holes]) salida.push(c.map((p) => new THREE.Vector2(p.x + x, p.y)))
  }
  return salida
}

/** Un renglón, letra por letra, con el volumen de los títulos (su espesor y su bisel). */
export function letrasDelRenglon(fuente: Font, texto: string, posiciones: readonly number[] | null, profundidad: number = VOLUMEN_DEL_TITULO.profundidad): RenglonArmado {
  const { bisel, curvas } = VOLUMEN_DEL_TITULO
  const equis = equisDe(fuente, texto, posiciones)
  const letras: LetraArmada[] = []
  const contornos: THREE.Vector2[][] = []
  ;[...texto].filter((c) => c.trim() !== '').forEach((c, k) => {
    const formas = glifo(fuente, c)
    const g = new THREE.ExtrudeGeometry(formas, { depth: profundidad, curveSegments: curvas, bevelEnabled: true, bevelThickness: bisel.grosor, bevelSize: bisel.tamano, bevelOffset: -bisel.tamano, bevelSegments: bisel.segmentos })
    g.translate(equis[k], 0, -profundidad)
    letras.push({ letra: c, geometria: g, ...cajaYPivote(g) })
    contornos.push(...contornosDe(formas, equis[k]))
  })
  return { letras, contornos }
}

export function soltarElRenglon(r: RenglonArmado): void {
  for (const l of r.letras) l.geometria.dispose()
}
