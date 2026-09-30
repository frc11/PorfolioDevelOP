import * as THREE from 'three'

/**
 * [ESCENA 9] T4 · LOS BLOQUES DE ADELANTE HACIA ATRÁS.
 *
 * El piso vivo es una malla instanciada: la GPU dibuja sus bloques en el orden de las instancias, y la grilla las arma
 * por filas desde −z, o sea de atrás hacia adelante vista desde donde suele estar la cámara. Cada costado se pintaba
 * entero y después lo tapaba el bloque de adelante. Dibujados de adelante hacia atrás, la profundidad que dejan los de
 * adelante descarta lo tapado ANTES de pintarlo: a 1440 con dpr 1,5 la escena del hero pasa de 16,1 a 11,7 ms de GPU en
 * la integrada y de 2,1 a 1,5 en la NVIDIA (`scripts-escena9/t4-orden.ts`). La imagen es la misma salvo en las aristas
 * que comparten dos bloques (dos caras a la misma profundidad: gana la que se dibuja última).
 *
 * El orden sigue a la cámara por SECTORES: ocho órdenes armados una vez (por la proyección de cada bloque en la
 * dirección hacia la cámara), y cuando la cámara pasa a otro sector se copian las matrices y las celdas en el orden
 * nuevo, en los mismos arreglos (nada se reserva). Pasa pocas veces en todo el recorrido. El último orden es el de la
 * grilla (el de antes), para el banco.
 */
export const ORDEN_DE_LOS_BLOQUES = { sectores: 8 } as const

export interface OrdenDeLosBloques {
  /** Las matrices y las celdas en el orden de la grilla: de donde se copia cada orden. */
  readonly matrices: Float32Array
  readonly celdas: Float32Array
  /** Un orden por sector y, al final, el de la grilla: el bloque de la grilla que va en la instancia k. */
  readonly ordenes: readonly Uint32Array[]
  /** El orden puesto (−1: ninguno todavía). */
  puesto: number
  /** Con banco: el orden de la grilla, fijo (para comparar en el mismo cuadro). */
  apagado: boolean
}

/** El índice del orden de la grilla (el de antes). */
export const ORDEN_DE_LA_GRILLA = ORDEN_DE_LOS_BLOQUES.sectores

/** El sector de la dirección desde el centro del piso hacia la cámara (0 a sectores − 1). */
export function sectorDe(x: number, z: number): number {
  const s = ORDEN_DE_LOS_BLOQUES.sectores
  return ((Math.round((Math.atan2(z, x) / (2 * Math.PI)) * s) % s) + s) % s
}

/** Los órdenes de cada sector, de adelante hacia atrás, desde los centros de los bloques (x, z por bloque). */
export function armarLosOrdenes(centros: Float32Array, matrices: Float32Array, celdas: Float32Array): OrdenDeLosBloques {
  const n = centros.length / 2
  const ordenes: Uint32Array[] = []
  const clave = new Float64Array(n)
  for (let k = 0; k < ORDEN_DE_LOS_BLOQUES.sectores; k += 1) {
    const a = (k / ORDEN_DE_LOS_BLOQUES.sectores) * 2 * Math.PI
    const [dx, dz] = [Math.cos(a), Math.sin(a)]
    // Más cerca de la cámara (más proyección hacia ella), antes.
    for (let i = 0; i < n; i += 1) clave[i] = -(centros[i * 2] * dx + centros[i * 2 + 1] * dz)
    ordenes.push(Uint32Array.from({ length: n }, (_, i) => i).sort((p, q) => clave[p] - clave[q] || p - q))
  }
  ordenes.push(Uint32Array.from({ length: n }, (_, i) => i))
  return { matrices: matrices.slice(), celdas: celdas.slice(), ordenes, puesto: -1, apagado: false }
}

/** Con banco: la profundidad estricta (en un empate gana lo dibujado antes) o la de three (gana lo último). */
export function profundidadEstricta(bloques: THREE.InstancedMesh, si: boolean): void {
  const material = bloques.material as THREE.Material
  material.depthFunc = si ? THREE.LessDepth : THREE.LessEqualDepth
}

/** Pone el orden pedido si no es el puesto: copia las matrices y las celdas en ese orden, en los arreglos de siempre. */
export function ponerElOrden(bloques: THREE.InstancedMesh, celdas: THREE.InstancedBufferAttribute, o: OrdenDeLosBloques, cual: number): void {
  if (cual === o.puesto) return
  o.puesto = cual
  const orden = o.ordenes[cual]
  const m = bloques.instanceMatrix.array
  const c = celdas.array
  for (let k = 0; k < orden.length; k += 1) {
    const j = orden[k]
    for (let q = 0; q < 16; q += 1) m[k * 16 + q] = o.matrices[j * 16 + q]
    c[k * 2] = o.celdas[j * 2]
    c[k * 2 + 1] = o.celdas[j * 2 + 1]
  }
  bloques.instanceMatrix.needsUpdate = true
  celdas.needsUpdate = true
}
