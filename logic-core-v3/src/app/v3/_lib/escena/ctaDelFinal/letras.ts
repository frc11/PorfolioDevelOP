import * as THREE from 'three'
import type { Font } from 'three/examples/jsm/loaders/FontLoader.js'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

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

/**
 * `capas`: el CTA cortado en `cuantas` capas de espesor: cada una es la palabra entera (una malla), de `espesor / cuantas`, y
 * la capa `k` ocupa su tramo (la 0 adelante). Apiladas, son la extrusión del CTA.
 */
export function capasDelCta(fuente: Font, texto: string, posiciones: readonly number[] | null, cuantas: number, espesor: number): RenglonArmado {
  const { bisel, curvas } = VOLUMEN_DEL_TITULO
  const equis = equisDe(fuente, texto, posiciones)
  const capa = espesor / cuantas
  const caracteres = [...texto].filter((c) => c.trim() !== '')
  const contornos: THREE.Vector2[][] = []
  caracteres.forEach((c, k) => contornos.push(...contornosDe(glifo(fuente, c), equis[k])))
  const letras = Array.from({ length: cuantas }, (_, k) => {
    const piezas = caracteres.map((c, i) => {
      const g = new THREE.ExtrudeGeometry(glifo(fuente, c), { depth: capa, curveSegments: curvas, bevelEnabled: true, bevelThickness: bisel.grosor * 0.5, bevelSize: bisel.tamano * 0.5, bevelOffset: -bisel.tamano * 0.5, bevelSegments: 1 })
      g.translate(equis[i], 0, -(k + 1) * capa)
      return g
    })
    const g = mergeGeometries(piezas, false)
    for (const p of piezas) p.dispose()
    if (g === null) throw new Error(`no se pudo armar la capa ${String(k)} de «${texto}»`)
    // Todas las capas giran sobre el centro de la palabra (en el plano de adelante): la pila es una sola pieza.
    const { ancho, alto, pivote } = cajaYPivote(g)
    return { letra: texto, geometria: g, pivote: new THREE.Vector3(pivote.x, pivote.y, 0), ancho, alto }
  })
  return { letras, contornos }
}

/** Los puntos de una forma en el orden en que se triangula: el contorno en sentido horario y los agujeros al revés (como `ExtrudeGeometry`). */
interface PuntosDeLaForma {
  readonly contorno: THREE.Vector2[]
  readonly agujeros: THREE.Vector2[][]
}

function sinElCierre(p: THREE.Vector2[], quitar: boolean): THREE.Vector2[] {
  return quitar ? p.slice(0, -1) : p
}

/** Las formas de un glifo en dos pesos, con la orientación y el cierre decididos por el primero (los dos con los mismos puntos). */
function puntosEnDosPesos(a: readonly THREE.Shape[], b: readonly THREE.Shape[]): [PuntosDeLaForma, PuntosDeLaForma][] {
  if (a.length !== b.length) throw new Error('los dos pesos del glifo no tienen las mismas formas')
  return a.map((fa, k) => {
    const pa = fa.extractPoints(VOLUMEN_DEL_TITULO.curvas)
    const pb = b[k].extractPoints(VOLUMEN_DEL_TITULO.curvas)
    if (pa.shape.length !== pb.shape.length || pa.holes.length !== pb.holes.length || pa.holes.some((h, i) => h.length !== pb.holes[i].length)) throw new Error('los dos pesos del glifo no tienen los mismos puntos')
    const cerrado = (p: THREE.Vector2[]): boolean => p.length > 2 && p[0].equals(p[p.length - 1])
    const invertir = !THREE.ShapeUtils.isClockWise(pa.shape)
    const orientar = (p: THREE.Vector2[], quitar: boolean, inv: boolean): THREE.Vector2[] => {
      const q = sinElCierre(p, quitar)
      return inv ? [...q].reverse() : q
    }
    const conA = { contorno: orientar(pa.shape, cerrado(pa.shape), invertir), agujeros: pa.holes.map((h) => orientar(h, cerrado(h), THREE.ShapeUtils.isClockWise(h))) }
    const conB = { contorno: orientar(pb.shape, cerrado(pa.shape), invertir), agujeros: pb.holes.map((h, i) => orientar(h, cerrado(pa.holes[i]), THREE.ShapeUtils.isClockWise(pa.holes[i]))) }
    return [conA, conB]
  })
}

/** Las posiciones de la extrusión (sin índices: las normales de cada cara, planas) con una triangulación dada para las tapas. */
function extruir(formas: readonly PuntosDeLaForma[], caras: readonly (readonly number[][])[], x: number, profundidad: number): number[] {
  const v: number[] = []
  const punto = (p: THREE.Vector2, z: number): void => {
    v.push(p.x + x, p.y, z)
  }
  formas.forEach((f, k) => {
    const todos = [f.contorno, ...f.agujeros].flat()
    // Las tapas: adelante (z = 0, hacia la cámara) y atrás, con el giro al revés.
    for (const [a, b, c] of caras[k]) {
      punto(todos[a], 0)
      punto(todos[b], 0)
      punto(todos[c], 0)
      punto(todos[c], -profundidad)
      punto(todos[b], -profundidad)
      punto(todos[a], -profundidad)
    }
    // Los costados: un cuadrilátero por tramo de cada contorno, mirando hacia afuera del lleno (a la izquierda del recorrido:
    // el contorno va en sentido horario y los agujeros al revés).
    for (const anillo of [f.contorno, ...f.agujeros]) {
      for (let i = 0; i < anillo.length; i += 1) {
        const [p, q] = [anillo[i], anillo[(i + 1) % anillo.length]]
        punto(p, 0)
        punto(q, 0)
        punto(p, -profundidad)
        punto(q, 0)
        punto(q, -profundidad)
        punto(p, -profundidad)
      }
    }
  })
  return v
}

function normalesDe(posiciones: number[]): THREE.BufferAttribute {
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(posiciones, 3))
  g.computeVertexNormals()
  const n = g.getAttribute('normal')
  g.dispose()
  return n instanceof THREE.BufferAttribute ? n : new THREE.Float32BufferAttribute(posiciones.length, 3)
}

/**
 * `tipo`: un renglón en el peso de la fuente `base` con un objetivo de deformación (`morphAttributes`) en el peso de `fina`:
 * la fuente es variable y cada glifo tiene los mismos puntos en los dos pesos (lo verifica), así que la misma triangulación
 * sirve para los dos y la deformación los recorre vértice a vértice. Sin bisel (la extrusión es propia).
 */
export function letrasConDosPesos(base: Font, fina: Font, texto: string, posiciones: readonly number[] | null, profundidad: number = VOLUMEN_DEL_TITULO.profundidad): RenglonArmado {
  const equis = equisDe(base, texto, posiciones)
  const letras: LetraArmada[] = []
  const contornos: THREE.Vector2[][] = []
  ;[...texto].filter((c) => c.trim() !== '').forEach((c, k) => {
    const formasA = glifo(base, c)
    const pares = puntosEnDosPesos(formasA, glifo(fina, c))
    const caras = pares.map(([a]) => THREE.ShapeUtils.triangulateShape(a.contorno, a.agujeros))
    const posA = extruir(pares.map(([a]) => a), caras, equis[k], profundidad)
    const posB = extruir(pares.map(([, b]) => b), caras, equis[k], profundidad)
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(posA, 3))
    g.setAttribute('normal', normalesDe(posA))
    g.morphAttributes.position = [new THREE.Float32BufferAttribute(posB, 3)]
    g.morphAttributes.normal = [normalesDe(posB)]
    letras.push({ letra: c, geometria: g, ...cajaYPivote(g) })
    contornos.push(...contornosDe(formasA, equis[k]))
  })
  return { letras, contornos }
}

export function soltarElRenglon(r: RenglonArmado): void {
  for (const l of r.letras) l.geometria.dispose()
}
