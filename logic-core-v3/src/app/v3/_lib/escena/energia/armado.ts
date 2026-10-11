import * as THREE from 'three'

import { INK_COLOR, PAPER_COLOR } from '../probeScene'
import { ARCOS, crearArcos, crearBuferDeLosArcos, type BuferDeLosArcos, type Entorno, type EstadoDeLosArcos } from './arcos'
import { azarConSemilla, crearCargas, type Cargas, type RayoDelPuntero } from './cargas'
import { FRAGMENTOS_DE_LAS_CARGAS, FRAGMENTOS_DE_LOS_ARCOS, VERTICES_DE_LAS_CARGAS, VERTICES_DE_LOS_ARCOS } from './sombreadores'
import { TEXTO_EN_PANTALLA } from './textoEnPantalla'

/**
 * [PULIDO 15] M2 · EL ARMADO DE LA ENERGÍA (`cargas.ts`: el todo; `PlasmaYCargas.tsx`: el cuadro). Las dos mallas (las cargas
 * instanciadas y los arcos desde su búfer fijo), las uniformes que comparten, la paleta, y lo que el programador de los arcos
 * pregunta afuera: qué se ve (adentro del cuadro y no sobre un texto) y el borde del logo.
 */

/**
 * Los colores: monocromo (de día la tinta con un halo del papel, que la separa del logo negro y sobre el papel no se ve; de noche, el
 * papel con su halo) o el azul eléctrico frío (`?plasma-color=si`).
 */
export const PALETAS = {
  mono: { dia: new THREE.Color(INK_COLOR), haloDia: new THREE.Color(PAPER_COLOR), noche: new THREE.Color(PAPER_COLOR), haloNoche: new THREE.Color(PAPER_COLOR) },
  color: {
    dia: new THREE.Color().setHSL(0.6, 0.85, 0.34),
    haloDia: new THREE.Color().setHSL(0.56, 0.9, 0.82),
    noche: new THREE.Color().setHSL(0.55, 0.7, 0.93),
    haloNoche: new THREE.Color().setHSL(0.57, 1, 0.6),
  },
} as const

function uniformesNuevos() {
  return {
    uCentro: { value: new THREE.Vector3() },
    uResolucion: { value: new THREE.Vector2(1, 1) },
    uPixel: { value: 1 },
    uEscalaPx: { value: 1 },
    uTiempo: { value: 0 },
    uTextos: { value: Array.from({ length: TEXTO_EN_PANTALLA.cajas }, () => new THREE.Vector4()) },
    uCuantosTextos: { value: 0 },
    uColorDia: { value: new THREE.Vector3() },
    uColorNoche: { value: new THREE.Vector3() },
    uHaloDia: { value: new THREE.Vector3() },
    uHaloNoche: { value: new THREE.Vector3() },
    uNoche: { value: 0 },
    uApagado: { value: 0 },
  }
}
export type Uniformes = ReturnType<typeof uniformesNuevos>

/** El color en los valores que escribe el sombreador (sRGB: un `ShaderMaterial` no convierte la salida). */
const enSrgb = (c: THREE.Color, destino: THREE.Vector3): void => {
  const s = c.clone().convertLinearToSRGB()
  destino.set(s.r, s.g, s.b)
}

export function pintarLaPaleta(u: Uniformes, color: boolean): void {
  const p = color ? PALETAS.color : PALETAS.mono
  enSrgb(p.dia, u.uColorDia.value)
  enSrgb(p.haloDia, u.uHaloDia.value)
  enSrgb(p.noche, u.uColorNoche.value)
  enSrgb(p.haloNoche, u.uHaloNoche.value)
}

/** Premultiplicado: de noche el alfa es 0 y la luz suma; de día, la tinta tapa el papel con su alfa. */
function material(vertices: string, fragmentos: string, uniformes: Uniformes): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    vertexShader: vertices,
    fragmentShader: fragmentos,
    uniforms: uniformes,
    transparent: true,
    depthWrite: false,
    blending: THREE.CustomBlending,
    blendSrc: THREE.OneFactor,
    blendDst: THREE.OneMinusSrcAlphaFactor,
  })
}

/** Lo que el cuadro sabe de la vista (lo escribe en cada cuadro). */
export interface Vista {
  camara: THREE.Camera | null
  ancho: number
  alto: number
}

export interface Armado {
  readonly azar: () => number
  readonly cargas: Cargas
  readonly arcos: EstadoDeLosArcos
  readonly bufer: BuferDeLosArcos
  readonly uniformes: Uniformes
  readonly lugar: THREE.InstancedBufferAttribute
  readonly carga: THREE.InstancedBufferAttribute
  readonly atributosDeLosArcos: readonly THREE.BufferAttribute[]
  readonly geometriaDeLosArcos: THREE.BufferGeometry
  readonly mallas: readonly [THREE.Mesh, THREE.Mesh]
  /** El centro del logo en el mundo, un vector de trabajo y la cámara relativa al centro. */
  readonly centro: THREE.Vector3
  readonly v: THREE.Vector3
  readonly camara: Float32Array
  /** El rayo del puntero (relativo al centro) y si hay puntero. */
  readonly rayo: { activo: boolean; readonly r: { ox: number; oy: number; oz: number; dx: number; dy: number; dz: number } }
  readonly entorno: Entorno
  readonly texto: { leidoEn: number; scroll: number }
}

/** Arma todo: las cargas, los arcos, las dos mallas y el entorno del programador. */
export function armar(n: number, compacto: boolean, vista: { readonly current: Vista }, logo: () => THREE.Object3D | null): Armado {
  const azar = azarConSemilla(15)
  const cargas = crearCargas(n, azar)
  const arcos = crearArcos(azar)
  const bufer = crearBuferDeLosArcos()
  const uniformes = uniformesNuevos()
  // Las cargas: un cuadrado (−1…1) instanciado; por carga, su lugar y (signo, tamaño, brillo, fase).
  const gc = new THREE.InstancedBufferGeometry()
  gc.setAttribute('position', new THREE.BufferAttribute(new Float32Array([-1, -1, 0, 1, -1, 0, -1, 1, 0, 1, 1, 0]), 3))
  gc.setIndex([0, 1, 2, 2, 1, 3])
  const lugar = new THREE.InstancedBufferAttribute(cargas.lugar, 3).setUsage(THREE.DynamicDrawUsage)
  const datos = new Float32Array(n * 4)
  for (let i = 0; i < n; i += 1) datos.set([cargas.signo[i], cargas.semilla[i * 4], 0, cargas.semilla[i * 4 + 1]], i * 4)
  const carga = new THREE.InstancedBufferAttribute(datos, 4).setUsage(THREE.DynamicDrawUsage)
  gc.setAttribute('aLugar', lugar)
  gc.setAttribute('aCarga', carga)
  gc.instanceCount = n
  const mallaDeCargas = new THREE.Mesh(gc, material(VERTICES_DE_LAS_CARGAS, FRAGMENTOS_DE_LAS_CARGAS, uniformes))
  mallaDeCargas.name = 'cargas'
  // Los arcos: el búfer fijo (los tramos que no se usan quedan fuera del rango de dibujo).
  const ga = new THREE.BufferGeometry()
  ga.setAttribute('position', new THREE.BufferAttribute(new Float32Array(bufer.a.length), 3))
  const atributosDeLosArcos = [new THREE.BufferAttribute(bufer.a, 3), new THREE.BufferAttribute(bufer.b, 3), new THREE.BufferAttribute(bufer.forma, 4)].map((a) => a.setUsage(THREE.DynamicDrawUsage))
  ga.setAttribute('aA', atributosDeLosArcos[0])
  ga.setAttribute('aB', atributosDeLosArcos[1])
  ga.setAttribute('aForma', atributosDeLosArcos[2])
  ga.setIndex(new THREE.BufferAttribute(bufer.indices, 1))
  ga.setDrawRange(0, 0)
  const mallaDeArcos = new THREE.Mesh(ga, material(VERTICES_DE_LOS_ARCOS, FRAGMENTOS_DE_LOS_ARCOS, uniformes))
  mallaDeArcos.name = 'arcos'
  for (const m of [mallaDeCargas, mallaDeArcos]) m.frustumCulled = false
  const centro = new THREE.Vector3()
  const v = new THREE.Vector3()
  const camara = new Float32Array(3)
  const rayo = { activo: false, r: { ox: 0, oy: 0, oz: 0, dx: 0, dy: 0, dz: 1 } }
  // ¿Se ve (adentro del cuadro, delante de la cámara) y no cae sobre un texto?
  const seVe = (x: number, y: number, z: number): boolean => {
    const cam = vista.current.camara
    if (cam === null) return false
    v.set(x + centro.x, y + centro.y, z + centro.z).project(cam)
    if (Math.abs(v.x) > 0.97 || Math.abs(v.y) > 0.97 || v.z <= -1 || v.z >= 1) return false
    for (let k = 0; k < uniformes.uCuantosTextos.value; k += 1) {
      const c = uniformes.uTextos.value[k]
      if (v.x > c.x && v.x < c.z && v.y > c.y && v.y < c.w) return false
    }
    return true
  }
  // El borde del logo: de puntos al azar de sus mallas (en el mundo), el más cercano a la carga.
  const mallasDelLogo: THREE.Mesh[] = []
  const bordeDelLogo = (x: number, y: number, z: number, destino: Float32Array): boolean => {
    if (mallasDelLogo.length === 0) logo()?.traverse((o) => { if (o instanceof THREE.Mesh) mallasDelLogo.push(o) })
    let mejor = Number.POSITIVE_INFINITY
    for (let k = 0; k < 64 && mallasDelLogo.length > 0; k += 1) {
      const malla = mallasDelLogo[Math.floor(azar() * mallasDelLogo.length)]
      const pos = malla.geometry.getAttribute('position')
      if (!(pos instanceof THREE.BufferAttribute) || pos.count === 0) continue
      v.fromBufferAttribute(pos, Math.floor(azar() * pos.count)).applyMatrix4(malla.matrixWorld).sub(centro)
      const d = Math.hypot(v.x - x, v.y - y, v.z - z)
      if (d < mejor) {
        mejor = d
        destino[0] = v.x
        destino[1] = v.y
        destino[2] = v.z
      }
    }
    return Number.isFinite(mejor)
  }
  const entorno: Entorno = {
    camara,
    get rayo(): RayoDelPuntero | null {
      return rayo.activo ? rayo.r : null
    },
    maximo: compacto ? ARCOS.maximoCompacto : ARCOS.maximo,
    seVe,
    bordeDelLogo,
  }
  return { azar, cargas, arcos, bufer, uniformes, lugar, carga, atributosDeLosArcos, geometriaDeLosArcos: ga, mallas: [mallaDeCargas, mallaDeArcos], centro, v, camara, rayo, entorno, texto: { leidoEn: Number.NEGATIVE_INFINITY, scroll: Number.NaN } }
}

/** Sube lo del cuadro a la GPU: de los arcos, sólo los tramos vivos (el resto queda fuera del rango de dibujo); de las cargas, todo. */
export function subir(a: Armado, tramos: number): void {
  a.geometriaDeLosArcos.setDrawRange(0, tramos * 6)
  for (const atributo of a.atributosDeLosArcos) {
    atributo.clearUpdateRanges()
    atributo.addUpdateRange(0, tramos * 4 * atributo.itemSize)
    atributo.needsUpdate = tramos > 0
  }
  for (let i = 0; i < a.cargas.n; i += 1) a.carga.array[i * 4 + 2] = a.cargas.brillo[i]
  a.carga.needsUpdate = true
  a.lugar.needsUpdate = true
}

export function soltar(a: Armado): void {
  for (const m of a.mallas) {
    m.geometry.dispose()
    if (m.material instanceof THREE.Material) m.material.dispose()
  }
}

/**
 * Con banco: el centro (px de CSS) de la celda de 90 px con más cargas a la vista, lejos de los bordes y no sobre un texto (ahí el
 * puntero no recibe arcos): para dejar el puntero quieto sobre un grupo.
 */
export function grupoEnPantalla(a: Armado, vista: Vista): [number, number] | null {
  const cam = vista.camara
  if (cam === null) return null
  const celdas = new Map<number, number>()
  let mejor: [number, number, number] | null = null
  const u = a.uniformes
  for (let i = 0; i < a.cargas.n; i += 1) {
    const [x, y, z] = [a.cargas.lugar[i * 3], a.cargas.lugar[i * 3 + 1], a.cargas.lugar[i * 3 + 2]]
    if (!a.entorno.seVe(x, y, z)) continue
    a.v.set(x + a.centro.x, y + a.centro.y, z + a.centro.z).project(cam)
    const [cx, cy] = [Math.floor((((a.v.x + 1) / 2) * vista.ancho) / 90), Math.floor((((1 - a.v.y) / 2) * vista.alto) / 90)]
    const [px, py] = [cx * 90 + 45, cy * 90 + 45]
    const [nx, ny] = [(px / vista.ancho) * 2 - 1, 1 - (py / vista.alto) * 2]
    if (Math.abs(nx) > 0.8 || Math.abs(ny) > 0.75) continue
    let sobreUnTexto = false
    for (let k = 0; k < u.uCuantosTextos.value; k += 1) {
      const c = u.uTextos.value[k]
      if (nx > c.x && nx < c.z && ny > c.y && ny < c.w) sobreUnTexto = true
    }
    if (sobreUnTexto) continue
    const cuantas = (celdas.get(cx * 1000 + cy) ?? 0) + 1
    celdas.set(cx * 1000 + cy, cuantas)
    if (mejor === null || cuantas > mejor[2]) mejor = [px, py, cuantas]
  }
  return mejor === null ? null : [mejor[0], mejor[1]]
}
