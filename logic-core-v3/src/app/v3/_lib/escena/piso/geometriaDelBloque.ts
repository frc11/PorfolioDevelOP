import * as THREE from 'three'

// [PASADA FINAL] D8 · aparte de bloques.ts, que pasaba las 300 líneas de código (s8-montaje).
/** Un bloque: la tapa (y = 1) y los cuatro costados (de y = 0 a 1), sin fondo. Lado 1, centrado en x y z. */
export function geometriaDelBloque(lado: number): THREE.BufferGeometry {
  const m = lado / 2
  const caras: [number[], number[]][] = [
    // tapa
    [[-m, 1, m, m, 1, m, m, 1, -m, -m, 1, -m], [0, 1, 0]],
    // +x
    [[m, 0, m, m, 0, -m, m, 1, -m, m, 1, m], [1, 0, 0]],
    // −x
    [[-m, 0, -m, -m, 0, m, -m, 1, m, -m, 1, -m], [-1, 0, 0]],
    // +z
    [[-m, 0, m, m, 0, m, m, 1, m, -m, 1, m], [0, 0, 1]],
    // −z
    [[m, 0, -m, -m, 0, -m, -m, 1, -m, m, 1, -m], [0, 0, -1]],
  ]
  const posicion: number[] = []
  const normal: number[] = []
  const indice: number[] = []
  for (const [v, n] of caras) {
    const base = posicion.length / 3
    posicion.push(...v)
    for (let k = 0; k < 4; k += 1) normal.push(...n)
    indice.push(base, base + 1, base + 2, base, base + 2, base + 3)
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(posicion, 3))
  g.setAttribute('normal', new THREE.Float32BufferAttribute(normal, 3))
  g.setIndex(indice)
  return g
}
