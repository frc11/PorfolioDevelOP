import * as THREE from 'three'

import { ARCOS, crearArcos, type Entorno, type EstadoDeLosArcos } from '../arcos/arcos'
import { crearBuferDeTramos, TRAMOS_DEL_BUFER, type BuferDeTramos } from '../arcos/bufer'
import { CAMINO } from '../arcos/camino'
import { ESPECIES, azarConSemilla, crearParticulas, type Particulas } from '../especies'
import { campoEn, cargaCercana, crearEntrada, crearGas, type EntradaDelGas, type Gas, type RayoDelPuntero } from '../fisica/fisica'
import { crearTemperatura, type Temperatura } from '../fisica/temperatura'
import { crearPuntero, type EstadoDelPuntero } from '../interaccion/interaccion'
import { crearLineas, type LineasDeCampo } from '../interaccion/lineasDeCampo'
import { TEXTO_EN_PANTALLA } from '../textoEnPantalla'
import { EFECTOS, FRAGMENTOS_DE_LOS_ARCOS, FRAGMENTOS_DE_LOS_EFECTOS, VERTICES_DE_LOS_ARCOS, VERTICES_DE_LOS_EFECTOS } from './arcosYEfectos'
import { DIBUJO } from './comun'
import { FRAGMENTOS_DE_LAS_PARTICULAS, VERTICES_DE_LAS_PARTICULAS } from './particulas'

/**
 * [PULIDO 16] N2 · EL ARMADO DEL PLASMA (`docs/rediseno/PLASMA.md`). Las tres mallas (las partículas instanciadas, los tramos —arcos,
 * enlaces y líneas de campo— desde su búfer fijo y los efectos instanciados), las uniformes que comparten, la paleta, y lo que el
 * programador de los arcos pregunta afuera: qué se ve (adentro del cuadro y no sobre un texto), el borde del logo, el campo y una
 * carga cercana para las ramas (esos cierres se arman una vez, no por cuadro).
 */

/**
 * La paleta, en lineal (antes del tono de la escena): monocromo —de día el grafito con su borde claro y el anillo del papel; de
 * noche luz blanca, con el halo del ion apenas más cálido— o el azul eléctrico frío (`?plasma-color=si`).
 */
const PALETAS = {
  mono: { nucleoDia: [0.075, 0.075, 0.08], bordeDia: [0.86, 0.86, 0.84], haloDia: [0.82, 0.82, 0.8], nucleoNoche: [1, 1, 1], haloNoche: [0.7, 0.75, 0.86], calienteNoche: [0.98, 0.9, 0.82], arcoNoche: [0.74, 0.8, 1] },
  color: { nucleoDia: [0.012, 0.035, 0.16], bordeDia: [0.55, 0.76, 1], haloDia: [0.62, 0.8, 1], nucleoNoche: [0.86, 0.93, 1], haloNoche: [0.16, 0.42, 1], calienteNoche: [0.55, 0.38, 1], arcoNoche: [0.26, 0.55, 1] },
} as const

function uniformesNuevos(color: boolean) {
  const p = color ? PALETAS.color : PALETAS.mono
  const v = (c: readonly number[]): { value: THREE.Vector3 } => ({ value: new THREE.Vector3(c[0], c[1], c[2]) })
  return {
    uCentro: { value: new THREE.Vector3() },
    uResolucion: { value: new THREE.Vector2(1, 1) },
    uPixel: { value: 1 },
    uEscalaPx: { value: 1 },
    uTiempo: { value: 0 },
    uNoche: { value: 0 },
    uApagado: { value: 0 },
    uFoco: { value: 20 },
    uTextos: { value: Array.from({ length: TEXTO_EN_PANTALLA.cajas }, () => new THREE.Vector4()) },
    uCuantosTextos: { value: 0 },
    uLuces: { value: Array.from({ length: DIBUJO.luces }, () => new THREE.Vector4()) },
    uCuantasLuces: { value: 0 },
    uNucleoDia: v(p.nucleoDia),
    uBordeDia: v(p.bordeDia),
    uHaloDia: v(p.haloDia),
    uNucleoNoche: v(p.nucleoNoche),
    uHaloNoche: v(p.haloNoche),
    uCalienteNoche: v(p.calienteNoche),
    uArcoNoche: v(p.arcoNoche),
  }
}
export type Uniformes = ReturnType<typeof uniformesNuevos>

/** Premultiplicado: de noche el alfa es 0 y la luz suma; de día el objeto tapa con su alfa. Pasa por el tono de la escena. */
function material(vertices: string, fragmentos: string, uniformes: Uniformes & { uCapa?: { value: number } }): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({ vertexShader: vertices, fragmentShader: fragmentos, uniforms: uniformes, transparent: true, depthWrite: false, blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor })
}

/** Lo que el cuadro sabe de la vista (lo escribe en cada cuadro). */
export interface Vista {
  camara: THREE.Camera | null
  ancho: number
  alto: number
}

/** El entorno del programador, con lo que cambia por cuadro (el rayo, la temperatura, la actividad del logo). */
export interface EntornoVivo extends Entorno {
  temperatura: number
  actividadDelLogo: number
}

export interface Armado {
  readonly azar: () => number
  readonly p: Particulas
  readonly g: Gas
  readonly entrada: EntradaDelGas
  readonly temperatura: Temperatura
  readonly arcos: EstadoDeLosArcos
  readonly puntero: EstadoDelPuntero
  readonly lineas: LineasDeCampo
  readonly bufer: BuferDeTramos
  readonly uniformes: Uniformes
  readonly datos: THREE.InstancedBufferAttribute
  readonly atributosDeLasParticulas: readonly THREE.InstancedBufferAttribute[]
  readonly atributosDeLosTramos: readonly THREE.BufferAttribute[]
  readonly geometriaDeLosTramos: THREE.BufferGeometry
  readonly efectos: { readonly lugar: THREE.InstancedBufferAttribute; readonly efecto: THREE.InstancedBufferAttribute; readonly geometria: THREE.InstancedBufferGeometry }
  readonly mallas: readonly THREE.Mesh[]
  /** El centro del logo en el mundo, un vector de trabajo, la luz de los arcos (x, y, z, intensidad) y el punto del puntero. */
  readonly centro: THREE.Vector3
  readonly v: THREE.Vector3
  readonly luces: Float32Array
  readonly puntoDelPuntero: Float32Array
  readonly rayo: { activo: boolean; readonly r: { ox: number; oy: number; oz: number; dx: number; dy: number; dz: number } }
  readonly entorno: EntornoVivo
  readonly texto: { leidoEn: number; scroll: number }
}

const CUADRADO = new Float32Array([-1, -1, 0, 1, -1, 0, -1, 1, 0, 1, 1, 0])

/** Arma todo: las partículas, el gas, los arcos, las tres mallas y el entorno del programador. */
export function armar(compacto: boolean, color: boolean, vista: { readonly current: Vista }, logo: () => THREE.Object3D | null): Armado {
  const azar = azarConSemilla(16)
  const p = crearParticulas(compacto ? ESPECIES.atomos.compacta : ESPECIES.atomos.escritorio, compacto ? ESPECIES.electrones.compacta : ESPECIES.electrones.escritorio, azar)
  const g = crearGas(p)
  const entrada = crearEntrada()
  const arcos = crearArcos(azar)
  const bufer = crearBuferDeTramos()
  const uniformes = uniformesNuevos(color)
  // Las partículas: un cuadrado instanciado; por partícula, su lugar, su velocidad (la estela), (especie, tamaño, alfa, brillo), la órbita y el calor.
  const gp = new THREE.InstancedBufferGeometry()
  gp.setAttribute('position', new THREE.BufferAttribute(CUADRADO, 3))
  gp.setIndex([0, 1, 2, 2, 1, 3])
  const datos = new THREE.InstancedBufferAttribute(new Float32Array(p.n * 4), 4).setUsage(THREE.DynamicDrawUsage)
  const orbita = new Float32Array(p.n * 4)
  for (let i = 0; i < p.n; i += 1) {
    orbita[i * 4] = p.orbita[i * 3]
    orbita[i * 4 + 1] = p.orbita[i * 3 + 1]
    orbita[i * 4 + 2] = p.orbita[i * 3 + 2]
    orbita[i * 4 + 3] = p.semilla[i * 4 + 3]
  }
  const atributosDeLasParticulas = [new THREE.InstancedBufferAttribute(p.lugar, 3), new THREE.InstancedBufferAttribute(p.velocidad, 3), new THREE.InstancedBufferAttribute(p.calor, 1)].map((x) => x.setUsage(THREE.DynamicDrawUsage))
  gp.setAttribute('aLugar', atributosDeLasParticulas[0])
  gp.setAttribute('aVelocidad', atributosDeLasParticulas[1])
  gp.setAttribute('aCalor', atributosDeLasParticulas[2])
  gp.setAttribute('aDatos', datos)
  gp.setAttribute('aOrbita', new THREE.InstancedBufferAttribute(orbita, 4))
  gp.instanceCount = p.n
  const mallaDeParticulas = new THREE.Mesh(gp, material(VERTICES_DE_LAS_PARTICULAS, FRAGMENTOS_DE_LAS_PARTICULAS, { ...uniformes, uCapa: { value: 0 } }))
  mallaDeParticulas.name = 'particulas'
  // Los tramos: el búfer fijo (lo que no se usa queda fuera del rango de dibujo).
  const gt = new THREE.BufferGeometry()
  gt.setAttribute('position', new THREE.BufferAttribute(new Float32Array(bufer.a.length), 3))
  const atributosDeLosTramos = [new THREE.BufferAttribute(bufer.a, 3), new THREE.BufferAttribute(bufer.b, 3), new THREE.BufferAttribute(bufer.forma, 4), new THREE.BufferAttribute(bufer.extra, 2)].map((x) => x.setUsage(THREE.DynamicDrawUsage))
  gt.setAttribute('aA', atributosDeLosTramos[0])
  gt.setAttribute('aB', atributosDeLosTramos[1])
  gt.setAttribute('aForma', atributosDeLosTramos[2])
  gt.setAttribute('aExtra', atributosDeLosTramos[3])
  gt.setIndex(new THREE.BufferAttribute(bufer.indices, 1))
  gt.setDrawRange(0, 0)
  // Dos pasadas con la misma geometría: la tinta y los halos, y después los núcleos (cada una con su `uCapa`; lo demás, compartido).
  const mallaDeTramos = new THREE.Mesh(gt, material(VERTICES_DE_LOS_ARCOS, FRAGMENTOS_DE_LOS_ARCOS, { ...uniformes, uCapa: { value: 0 } }))
  mallaDeTramos.name = 'arcos'
  const mallaDeNucleos = new THREE.Mesh(gt, material(VERTICES_DE_LOS_ARCOS, FRAGMENTOS_DE_LOS_ARCOS, { ...uniformes, uCapa: { value: 1 } }))
  mallaDeNucleos.name = 'nucleos de los arcos'
  // Los efectos: el piso, el logo, el anillo del pulso y el halo del puntero.
  const ge = new THREE.InstancedBufferGeometry()
  ge.setAttribute('position', new THREE.BufferAttribute(CUADRADO, 3))
  ge.setIndex([0, 1, 2, 2, 1, 3])
  const lugarDeLosEfectos = new THREE.InstancedBufferAttribute(new Float32Array(EFECTOS.cuantos * 3), 3).setUsage(THREE.DynamicDrawUsage)
  const efecto = new THREE.InstancedBufferAttribute(new Float32Array(EFECTOS.cuantos * 4), 4).setUsage(THREE.DynamicDrawUsage)
  ge.setAttribute('aLugar', lugarDeLosEfectos)
  ge.setAttribute('aEfecto', efecto)
  ge.instanceCount = 0
  const mallaDeEfectos = new THREE.Mesh(ge, material(VERTICES_DE_LOS_EFECTOS, FRAGMENTOS_DE_LOS_EFECTOS, { ...uniformes, uCapa: { value: 0 } }))
  mallaDeEfectos.name = 'efectos'
  const mallas = [mallaDeEfectos, mallaDeParticulas, mallaDeTramos, mallaDeNucleos]
  // En este orden: los efectos, las partículas, la tinta de los arcos y sus núcleos.
  mallas.forEach((m, k) => {
    m.frustumCulled = false
    m.renderOrder = k
  })
  const centro = new THREE.Vector3()
  const v = new THREE.Vector3()
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
  // El borde del logo: de puntos al azar de sus mallas (en el mundo), el más cercano.
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
  const campo = (x: number, y: number, z: number, destino: Float32Array): void => campoEn(g, entrada, x, y, z, destino)
  const buscarCarga = (x: number, y: number, z: number, destino: Float32Array): boolean => {
    const j = cargaCercana(g, x, y, z, CAMINO.ramas.busca, -1)
    if (j < 0) return false
    destino[0] = p.lugar[j * 3]
    destino[1] = p.lugar[j * 3 + 1]
    destino[2] = p.lugar[j * 3 + 2]
    return true
  }
  const entorno: EntornoVivo = {
    get rayo(): RayoDelPuntero | null {
      return rayo.activo ? rayo.r : null
    },
    maximo: compacto ? ARCOS.maximoCompacto : ARCOS.maximo,
    temperatura: 0,
    actividadDelLogo: 0,
    seVe,
    bordeDelLogo,
    campo,
    buscarCarga,
  }
  return {
    azar, p, g, entrada, temperatura: crearTemperatura(), arcos, puntero: crearPuntero(), lineas: crearLineas(), bufer, uniformes, datos, atributosDeLasParticulas, atributosDeLosTramos, geometriaDeLosTramos: gt,
    efectos: { lugar: lugarDeLosEfectos, efecto, geometria: ge }, mallas, centro, v, luces: new Float32Array(DIBUJO.luces * 4), puntoDelPuntero: new Float32Array(3), rayo, entorno, texto: { leidoEn: Number.NEGATIVE_INFINITY, scroll: Number.NaN },
  }
}

/**
 * Sube lo del cuadro a la GPU: las partículas, los tramos (sólo si hay alguno: los que no se usan quedan fuera del rango de dibujo)
 * y los efectos. Los búferes enteros, sin rangos: con rangos three ordena con un comparador nuevo en cada subida (una reserva por
 * cuadro); el de los tramos son ~144 KB.
 */
export function subir(a: Armado, tramos: number, efectos: number): void {
  const d = a.datos.array as Float32Array
  for (let i = 0; i < a.p.n; i += 1) {
    d[i * 4] = a.p.especie[i]
    d[i * 4 + 1] = a.p.semilla[i * 4]
    d[i * 4 + 2] = a.p.alfa[i]
    d[i * 4 + 3] = a.p.brillo[i]
  }
  a.datos.needsUpdate = true
  for (const x of a.atributosDeLasParticulas) x.needsUpdate = true
  const n = Math.min(tramos, TRAMOS_DEL_BUFER)
  a.geometriaDeLosTramos.setDrawRange(0, n * 6)
  if (n > 0) for (const x of a.atributosDeLosTramos) x.needsUpdate = true
  a.efectos.geometria.instanceCount = efectos
  a.efectos.lugar.needsUpdate = efectos > 0
  a.efectos.efecto.needsUpdate = efectos > 0
}

export function soltar(a: Armado): void {
  // La geometría de los tramos la comparten dos mallas: se suelta una vez.
  for (const g of new Set(a.mallas.map((m) => m.geometry))) g.dispose()
  for (const m of a.mallas) if (m.material instanceof THREE.Material) m.material.dispose()
}
