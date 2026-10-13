import * as THREE from 'three'
import { ConvexGeometry } from 'three/examples/jsm/geometries/ConvexGeometry.js'

import { CRISTAL, type Esquirla } from './cristal'
import { datosDeLaEsquirla } from './vidrio'

/**
 * [PULIDO 20] R2 · LAS ESQUIRLAS, SU GEOMETRÍA (`cristal.ts`: dónde va cada una). Cada esquirla es el casco convexo de tres anillos de puntos:
 * el CANTO (su contorno filoso, en el plano del medio), las CARAS (el contorno metido `bisel` hacia adentro, arriba y abajo: entre el canto y
 * las caras quedan los biseles) y la CRESTA (un punto arriba y otro abajo, un poco corridos: las caras se quiebran en facetas). Pocos
 * polígonos, normales planas (cada triángulo, su faceta) y en cada vértice cuánto es canto (`aFilo`: 1 el canto, 0,35 las caras, 0 la
 * cresta): el sombreador lo usa para el filo de luz y el arcoíris de los cantos. Todas en UN búfer (una sola llamada de dibujo), cada una
 * con su índice (`aEsquirla`): el sombreador le aplica su giro lento y su respiración con el reloj (`vidrio.ts`).
 */
const FILO_DE_LAS_CARAS = 0.35
const PUNTO = new THREE.Vector3()
const GIRO = new THREE.Quaternion()

/** La clave de un punto en 32 bits (el casco lo guarda en un búfer de 32: así se encuentra lo que era cada uno). */
const clave = (v: THREE.Vector3): string => `${String(Math.fround(v.x))},${String(Math.fround(v.y))},${String(Math.fround(v.z))}`

/** Los puntos de una esquirla (en el mundo, relativos a su centro: con su giro de base) y cuánto es canto cada uno. */
function puntosDe(e: Esquirla): { readonly puntos: THREE.Vector3[]; readonly filo: Map<string, number> } {
  const b = CRISTAL.esquirlas.bisel
  const c = e.contorno
  const n = c.length / 2
  let cx = 0
  let cy = 0
  for (let k = 0; k < n; k += 1) {
    cx += c[k * 2] / n
    cy += c[k * 2 + 1] / n
  }
  GIRO.set(e.giro[0], e.giro[1], e.giro[2], e.giro[3])
  const puntos: THREE.Vector3[] = []
  const filo = new Map<string, number>()
  const agregar = (x: number, y: number, z: number, f: number): void => {
    const v = new THREE.Vector3(x * e.ancho, y * e.largo, z).applyQuaternion(GIRO)
    puntos.push(v)
    filo.set(clave(v), f)
  }
  for (let k = 0; k < n; k += 1) {
    const [x, y] = [c[k * 2], c[k * 2 + 1]]
    agregar(x, y, 0, 1)
    const [mx, my] = [cx + (x - cx) * (1 - b), cy + (y - cy) * (1 - b)]
    agregar(mx, my, e.espesor / 2, FILO_DE_LAS_CARAS)
    agregar(mx, my, -e.espesor / 2, FILO_DE_LAS_CARAS)
  }
  // La cresta: corrida del centro (las facetas no quedan simétricas), un poco más afuera que las caras.
  agregar(cx + 0.14, cy + 0.16, e.espesor * 1.6, 0)
  agregar(cx - 0.12, cy - 0.14, -e.espesor * 1.6, 0)
  return { puntos, filo }
}

/** Arma las esquirlas en un solo búfer: la posición (relativa a su centro), la normal de su faceta, su índice y cuánto es canto. */
export function armarLasEsquirlas(esquirlas: readonly Esquirla[]): THREE.BufferGeometry {
  const posicion: number[] = []
  const normal: number[] = []
  const indice: number[] = []
  const filo: number[] = []
  const deCadaUna: number[][] = [[], [], []]
  esquirlas.forEach((e, k) => {
    const datos = datosDeLaEsquirla(e)
    const { puntos, filo: deCada } = puntosDe(e)
    const casco = new ConvexGeometry(puntos)
    const p = casco.getAttribute('position')
    const nn = casco.getAttribute('normal')
    for (let i = 0; i < p.count; i += 1) {
      PUNTO.fromBufferAttribute(p, i)
      posicion.push(PUNTO.x, PUNTO.y, PUNTO.z)
      normal.push(nn.getX(i), nn.getY(i), nn.getZ(i))
      indice.push(k)
      filo.push(deCada.get(clave(PUNTO)) ?? 0)
      for (let d = 0; d < 3; d += 1) deCadaUna[d].push(...datos[d])
    }
    casco.dispose()
  })
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(posicion, 3))
  g.setAttribute('normal', new THREE.Float32BufferAttribute(normal, 3))
  g.setAttribute('aEsquirla', new THREE.Float32BufferAttribute(indice, 1))
  g.setAttribute('aFilo', new THREE.Float32BufferAttribute(filo, 1))
  g.setAttribute('aCentro', new THREE.Float32BufferAttribute(deCadaUna[0], 4))
  g.setAttribute('aGiro', new THREE.Float32BufferAttribute(deCadaUna[1], 4))
  g.setAttribute('aVida', new THREE.Float32BufferAttribute(deCadaUna[2], 4))
  return g
}
