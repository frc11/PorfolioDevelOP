import * as THREE from 'three'

/**
 * [PULIDO 27] Y1 c · EL TESELADO DE LA PLACA DEL FORM — la placa se derrite en el sombreador de vértices (`derretido.ts`) y sus caras
 * eran pocos triángulos largos (la triangulación del contorno): no tenían dónde doblarse. Parte cada triángulo por el punto medio de su
 * lado más largo hasta que ningún lado pase `lado` (px). Un lado compartido se parte igual desde los dos triángulos (por su punto medio,
 * sólo si pasa `lado`): sin grietas al deformar. Interpola todos los atributos (las normales, renormalizadas). Pura.
 */
export function teselar(g: THREE.BufferGeometry, lado: number): THREE.BufferGeometry {
  const fuente = g.index === null ? g : g.toNonIndexed()
  const nombres = Object.keys(fuente.attributes)
  const atributos = nombres.map((n) => fuente.getAttribute(n))
  const tam = atributos.map((a) => a.itemSize)
  const iPos = nombres.indexOf('position')
  const iNormal = nombres.indexOf('normal')
  const salida: number[][] = nombres.map(() => [])
  const leer = (i: number): number[][] => atributos.map((a, k) => Array.from({ length: tam[k] }, (_, c) => a.getComponent(i, c)))
  const medio = (a: number[][], b: number[][]): number[][] => a.map((x, k) => x.map((y, c) => (y + b[k][c]) / 2))
  const largo = (a: number[][], b: number[][]): number => (a[iPos][0] - b[iPos][0]) ** 2 + (a[iPos][1] - b[iPos][1]) ** 2 + (a[iPos][2] - b[iPos][2]) ** 2
  const tope = lado * lado
  const pila: number[][][][] = []
  const posicion = fuente.getAttribute('position')
  for (let i = 0; i + 2 < posicion.count; i += 3) pila.push([leer(i), leer(i + 1), leer(i + 2)])
  for (let t = pila.pop(); t !== undefined; t = pila.pop()) {
    const [a, b, c] = t
    const [ab, bc, ca] = [largo(a, b), largo(b, c), largo(c, a)]
    const m = Math.max(ab, bc, ca)
    if (m <= tope) {
      for (const v of t) v.forEach((x, k) => salida[k].push(...x))
      continue
    }
    if (m === ab) {
      const d = medio(a, b)
      pila.push([a, d, c], [d, b, c])
    } else if (m === bc) {
      const d = medio(b, c)
      pila.push([a, b, d], [a, d, c])
    } else {
      const d = medio(c, a)
      pila.push([a, b, d], [d, b, c])
    }
  }
  const nueva = new THREE.BufferGeometry()
  nombres.forEach((n, k) => {
    const datos = new Float32Array(salida[k])
    if (k === iNormal) {
      for (let i = 0; i < datos.length; i += 3) {
        const l = Math.hypot(datos[i], datos[i + 1], datos[i + 2]) || 1
        datos[i] /= l
        datos[i + 1] /= l
        datos[i + 2] /= l
      }
    }
    nueva.setAttribute(n, new THREE.BufferAttribute(datos, tam[k]))
  })
  if (fuente !== g) fuente.dispose()
  g.dispose()
  nueva.computeBoundingBox()
  nueva.computeBoundingSphere()
  return nueva
}
