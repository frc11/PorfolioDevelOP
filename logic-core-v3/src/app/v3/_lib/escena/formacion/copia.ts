import * as THREE from 'three'

import { PROBE_EXTRUDE, PROBE_SVG_SCALE } from '../probeScene'

/**
 * [ESCENA 5] LA COPIA — la malla del logo, simplificada para instanciar. No se modela otra: son las
 * mismas formas del mismo SVG (`ProbeLogo.tsx`), con la misma profundidad, la misma escala y el
 * mismo volteo, horneadas para que una copia quede parada con el pie en y = 0 y centrada en x y z.
 *
 * **Simplificada, porque la niebla lo permite.** La copia más cercana queda a más de 30 de la cámara
 * y detrás de la bruma: va con 2 puntos por curva, sin bisel y SIN LA TAPA DE ATRÁS, que desde
 * adentro del cilindro no se ve nunca (todas miran al centro, y la cámara vive adentro). Queda la
 * tapa de adelante y el canto, que es lo que dice que la pieza tiene espesor.
 *
 * **[ESCENA 7] Las filas de atrás, la silueta.** Detrás de la primera fila las copias quedan de frente
 * a la cámara, más lejos y más adentro de la niebla: el canto no se lee. Desde ESCENA 6 iban con la
 * tapa de adelante sola (84 triángulos); ahora, con miles de copias, van con esa MISMA tapa rasterizada
 * en una textura (`silueta`), sobre un cuadrado de dos triángulos: plana y de frente las dos, se ven
 * iguales. El borde lo suaviza el antialias (alfa a cobertura).
 */
export const PUNTOS_POR_CURVA = 2

/**
 * La silueta: los texeles de su textura, las submuestras por lado de cada texel, y el alto de la franja
 * del canto de arriba (texeles): el espesor del logo visto un poco desde arriba.
 */
export const SILUETA = { ancho: 512, alto: 384, submuestras: 4, canto: 10 } as const

export interface CopiaHorneada {
  /** La malla entera (tapa de adelante y canto): la de la primera fila. */
  readonly geometria: THREE.BufferGeometry
  /** La tapa de adelante, rasterizada: la de las filas de atrás. */
  readonly silueta: THREE.DataTexture
  /** La caja de la copia en su espacio (x, y): la del cuadrado de la silueta. */
  readonly caja: { readonly x0: number; readonly x1: number; readonly y0: number; readonly y1: number }
}

export function copiaHorneada(formas: THREE.Shape[]): CopiaHorneada {
  const extruida = new THREE.ExtrudeGeometry(formas, { depth: PROBE_EXTRUDE.depth, bevelEnabled: false, curveSegments: PUNTOS_POR_CURVA })
  extruida.scale(PROBE_SVG_SCALE, PROBE_SVG_SCALE, PROBE_SVG_SCALE)
  // El volteo del SVG, que viene con Y para abajo: el mismo `[π, 0, 0]` del logo.
  extruida.rotateX(Math.PI)
  const geometria = quedarse(extruida, (nz) => nz > -0.99)
  const tapa = quedarse(extruida, (nz) => nz > 0.99)
  extruida.dispose()
  geometria.computeBoundingBox()
  const bruta = geometria.boundingBox ?? new THREE.Box3()
  const centro = bruta.getCenter(new THREE.Vector3())
  const piso = bruta.min.y
  for (const g of [geometria, tapa]) {
    g.translate(-centro.x, -piso, -centro.z)
    g.computeBoundingBox()
    g.computeBoundingSphere()
  }
  const b = geometria.boundingBox ?? new THREE.Box3()
  const caja = { x0: b.min.x, x1: b.max.x, y0: b.min.y, y1: b.max.y }
  const silueta = rasterizar(tapa, caja)
  tapa.dispose()
  return { geometria, silueta, caja }
}

/**
 * La tapa, pintada en una textura: cada texel lleva qué parte de sus `submuestras²` puntos cae adentro de
 * algún triángulo (r) y cuánto está en la franja de arriba de un borde (g, el canto que toca la luz de
 * arriba). Pura (sin canvas): el mismo resultado en cualquier máquina.
 */
function rasterizar(tapa: THREE.BufferGeometry, caja: CopiaHorneada['caja']): THREE.DataTexture {
  const { ancho, alto, submuestras: s } = SILUETA
  const cuenta = new Uint16Array(ancho * alto)
  const p = tapa.getAttribute('position')
  const [sx, sy] = [(ancho * s) / (caja.x1 - caja.x0), (alto * s) / (caja.y1 - caja.y0)]
  // Por renglones: cada renglón de submuestras corta al triángulo en un tramo, y se cuenta el tramo.
  for (let t = 0; t < p.count; t += 3) {
    const v = [0, 1, 2].map((k) => [(p.getX(t + k) - caja.x0) * sx, (p.getY(t + k) - caja.y0) * sy])
    const y0 = Math.max(0, Math.ceil(Math.min(v[0][1], v[1][1], v[2][1]) - 0.5))
    const y1 = Math.min(alto * s - 1, Math.floor(Math.max(v[0][1], v[1][1], v[2][1]) - 0.5))
    for (let y = y0; y <= y1; y += 1) {
      const py = y + 0.5
      let [xa, xb] = [Infinity, -Infinity]
      for (let k = 0; k < 3; k += 1) {
        const [a, b] = [v[k], v[(k + 1) % 3]]
        if ((a[1] <= py && b[1] > py) || (b[1] <= py && a[1] > py)) {
          const x = a[0] + ((py - a[1]) / (b[1] - a[1])) * (b[0] - a[0])
          xa = Math.min(xa, x)
          xb = Math.max(xb, x)
        }
      }
      const desde = Math.max(0, Math.ceil(xa - 0.5))
      const hasta = Math.min(ancho * s - 1, Math.floor(xb - 0.5))
      const fila = Math.floor(y / s) * ancho
      for (let x = desde; x <= hasta; x += 1) cuenta[fila + Math.floor(x / s)] += 1
    }
  }
  const cubre = (x: number, y: number): number => (y >= alto ? 0 : Math.min(1, cuenta[y * ancho + x] / (s * s)))
  // Dos canales: r, la tapa; g, la franja de arriba de cada borde (el canto de arriba, que la luz toca).
  const datos = new Uint8Array(ancho * alto * 2)
  for (let y = 0; y < alto; y += 1) {
    for (let x = 0; x < ancho; x += 1) {
      const c = cubre(x, y)
      let canto = 0
      for (let k = 1; k <= SILUETA.canto; k += 1) canto = Math.max(canto, (1 - cubre(x, y + k)) * (1 - (k - 1) / SILUETA.canto))
      datos[(y * ancho + x) * 2] = Math.round(c * 255)
      datos[(y * ancho + x) * 2 + 1] = Math.round(c * canto * 255)
    }
  }
  const textura = new THREE.DataTexture(datos, ancho, alto, THREE.RGFormat, THREE.UnsignedByteType)
  textura.generateMipmaps = true
  textura.minFilter = THREE.LinearMipmapLinearFilter
  textura.magFilter = THREE.LinearFilter
  textura.anisotropy = 4
  textura.needsUpdate = true
  return textura
}

/** La misma malla con los triángulos cuya normal cumple `queda` (en z, en los tres vértices). */
function quedarse(g: THREE.BufferGeometry, queda: (nz: number) => boolean): THREE.BufferGeometry {
  const plana = g.index === null ? g : g.toNonIndexed()
  const posicion = plana.getAttribute('position')
  const normal = plana.getAttribute('normal')
  const quedan: number[] = []
  for (let t = 0; t < posicion.count; t += 3) {
    let todos = true
    for (let k = 0; k < 3; k += 1) if (!queda(normal.getZ(t + k))) todos = false
    if (todos) quedan.push(t)
  }
  const copiar = (a: THREE.BufferAttribute | THREE.InterleavedBufferAttribute, lado: number): THREE.BufferAttribute => {
    const datos = new Float32Array(quedan.length * 3 * lado)
    quedan.forEach((t, i) => {
      for (let k = 0; k < 3; k += 1) for (let c = 0; c < lado; c += 1) datos[(i * 3 + k) * lado + c] = a.getComponent(t + k, c)
    })
    return new THREE.BufferAttribute(datos, lado)
  }
  const salida = new THREE.BufferGeometry()
  salida.setAttribute('position', copiar(posicion, 3))
  salida.setAttribute('normal', copiar(normal, 3))
  if (plana !== g) plana.dispose()
  return salida
}
